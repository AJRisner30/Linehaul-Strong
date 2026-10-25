import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, ChevronRight, ChevronLeft, ShieldCheck, AlertCircle, Volume2, VolumeX, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { TrainingDay, Exercise, WorkoutLogEntry } from '../types';
import { 
  DifficultyToggle, 
  ExerciseDifficultyLevel, 
  getAdjustedExercise 
} from '../lib/workoutDifficulty';

interface WorkoutRunnerProps {
  day: TrainingDay;
  onClose: () => void;
  onWorkoutComplete: (log: WorkoutLogEntry) => void;
}

export const WorkoutRunner: React.FC<WorkoutRunnerProps> = ({
  day,
  onClose,
  onWorkoutComplete
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completedExercises, setCompletedExercises] = useState<Record<string, number>>({});
  const [elapsedTotalSec, setElapsedTotalSec] = useState(0);
  const [difficultyMap, setDifficultyMap] = useState<Record<string, ExerciseDifficultyLevel>>({});

  const baseExercise: Exercise = day.exercises[currentExerciseIndex];
  const currentExercise = baseExercise;
  const currentDiff = difficultyMap[baseExercise.id] || 'Intermediate (As listed)';
  const currentAdjusted = getAdjustedExercise(baseExercise, currentDiff);

  const handleDifficultyChange = (lvl: ExerciseDifficultyLevel) => {
    setDifficultyMap(prev => ({
      ...prev,
      [baseExercise.id]: lvl
    }));
  };

  // Sound generator using Web Audio API
  const playBeep = (freq: number = 880, durationMs: number = 150) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch {
      // AudioContext could be blocked by autoplay policy until user gesture
    }
  };

  // Overall workout clock
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        setElapsedTotalSec((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused]);

  // Rest timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isResting && !isPaused && restTimeRemaining > 0) {
      interval = setInterval(() => {
        setRestTimeRemaining((prev) => {
          if (prev <= 4 && prev > 1) {
            playBeep(600, 100);
          } else if (prev === 1) {
            playBeep(1200, 350);
          }
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isResting, isPaused, restTimeRemaining]);

  const handleCompleteSet = () => {
    playBeep(880, 150);
    const newCount = (completedExercises[baseExercise.id] || 0) + 1;
    setCompletedExercises({
      ...completedExercises,
      [baseExercise.id]: newCount
    });

    if (currentSet < currentAdjusted.sets) {
      setCurrentSet((s) => s + 1);
      setIsResting(true);
      setRestTimeRemaining(currentAdjusted.restSeconds);
    } else {
      // Finished all sets for this exercise
      if (currentExerciseIndex < day.exercises.length - 1) {
        setCurrentExerciseIndex((idx) => idx + 1);
        setCurrentSet(1);
        setIsResting(true);
        setRestTimeRemaining(currentAdjusted.restSeconds + 15);
      } else {
        // Entire protocol completed!
        handleFinishEntireWorkout();
      }
    }
  };

  const handleFinishEntireWorkout = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF6B00', '#E2E8F0', '#FFA000', '#38BDF8']
    });

    const durationMin = Math.max(1, Math.round(elapsedTotalSec / 60));
    const estimatedCals = Math.round(durationMin * 8.5);

    const isCustomCoachingDay = day.id.startsWith('custom') || day.subtitle?.toLowerCase().includes('custom');
    const isRoadWarriorDay = day.id.startsWith('rw') || day.subtitle?.toLowerCase().includes('road warrior') || day.subtitle?.toLowerCase().includes('planet fitness');
    const isLightDbDay = day.id.startsWith('db');

    let logType: WorkoutLogEntry['type'] = 'rest-stop-protocol';
    let logNote = `Completed all ${day.exercises.length} tactical rig movements under AJ Risner Rest Stop Protocol.`;

    if (isRoadWarriorDay) {
      logType = 'road-warrior';
      logNote = `Completed all ${day.exercises.length} compound lifts under Coach AJ Risner Road Warrior Gym Protocol.`;
    } else if (isLightDbDay) {
      logType = 'light-db';
      logNote = `Completed all ${day.exercises.length} light dumbbell movements under Coach AJ Risner Light DB Protocol.`;
    } else if (isCustomCoachingDay) {
      logType = 'custom-coaching';
      logNote = `Completed all ${day.exercises.length} tactical movements under Coach AJ Risner Custom 1-on-1 Coaching Protocol.`;
    }

    const logEntry: WorkoutLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: logType,
      title: `${day.title} (Day ${day.dayNumber})`,
      durationMinutes: durationMin,
      caloriesBurned: estimatedCals,
      notes: logNote
    };

    onWorkoutComplete(logEntry);
  };

  const formatSec = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#080A0C]/95 backdrop-blur-md flex flex-col justify-between overflow-y-auto">
      {/* Top Protocol Header */}
      <div className="border-b border-[#1E2530] bg-[#0E1116] px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#FF6B00] text-[#0D0F12] font-black font-heading flex items-center justify-center text-sm shadow">
            D{day.dayNumber}
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white uppercase font-heading tracking-wide">
              {day.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-[#94A3B8] font-tactical">
              <span>ELAPSED: {formatSec(elapsedTotalSec)}</span>
              <span>•</span>
              <span className="text-[#FF6B00]">EXERCISE {currentExerciseIndex + 1} / {day.exercises.length}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-[#181D26] text-[#CBD5E1] hover:text-white border border-[#252E3C]"
            title={soundEnabled ? 'Mute audio cues' : 'Enable audio cues'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#FF6B00]" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 rounded-lg bg-[#181D26] text-[#CBD5E1] hover:text-white border border-[#252E3C]"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#181D26] text-[#CBD5E1] hover:text-white border border-[#252E3C]"
            title="Exit workout"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Exercise Viewport */}
      <div className="max-w-4xl mx-auto w-full px-4 py-4 sm:py-6 flex-1 flex flex-col justify-center">
        {/* Rest Overlay or Active View */}
        {isResting ? (
          <div className="bg-[#12161E] border-2 border-[#FF6B00] rounded-2xl p-6 sm:p-10 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 tire-tread-pattern opacity-40 pointer-events-none"></div>
            <span className="px-3 py-1 rounded-full bg-[#FF6B00]/20 text-[#FF6B00] text-xs font-tactical uppercase font-bold tracking-widest">
              REST & REHYDRATE
            </span>
            <div className="text-6xl sm:text-7xl font-black font-tactical text-white my-4 tracking-tighter">
              {formatSec(restTimeRemaining)}
            </div>
            <p className="text-sm text-[#94A3B8] max-w-md mx-auto">
              Up Next: <span className="text-white font-bold">{baseExercise.name}</span> — Set {currentSet} of {currentAdjusted.sets}
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setRestTimeRemaining((r) => r + 15)}
                className="px-4 py-2 rounded-lg bg-[#1B222D] border border-[#2A3545] text-xs uppercase font-bold text-[#E2E8F0] hover:bg-[#252E3D]"
              >
                +15s Rest
              </button>
              <button
                onClick={() => setIsResting(false)}
                className="px-6 py-2 rounded-lg bg-[#FF6B00] text-[#0D0F12] text-xs uppercase font-black tracking-wider hover:bg-[#FF8526] transition shadow-lg shadow-[#FF6B00]/20"
              >
                Skip Rest & Resume
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Rig Anchor & Exercise Title Card */}
            <div className="bg-[#12151B] border border-[#222936] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1C222C] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30 text-xs font-tactical font-bold uppercase">
                    RIG ANCHOR: {baseExercise.rigAnchor}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-[#1C232E] text-slate-300 text-xs font-tactical font-medium">
                    {baseExercise.equipment}
                  </span>
                </div>
                <div className="text-xs font-tactical text-slate-400">
                  PACE: <span className="text-emerald-400 font-bold">{currentAdjusted.tempo || 'Slow and controlled'}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black uppercase text-white font-heading tracking-wide">
                    {baseExercise.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#94A3B8] font-medium mt-1">
                    Target: <span className="text-[#CBD5E1]">{baseExercise.targetArea}</span>
                  </p>
                </div>
              </div>

              {/* Live Difficulty Toggle in Workout Runner */}
              <div className="bg-[#0B0E14] p-2.5 rounded-xl border border-[#1E2533] flex flex-col md:flex-row md:items-center justify-between gap-2.5 mt-4 w-full min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-tactical uppercase font-bold text-slate-400 shrink-0">
                    Difficulty Toggle:
                  </span>
                  <span className={`text-[10px] font-tactical font-bold px-2 py-0.5 rounded border truncate ${currentAdjusted.levelBadge.colorClasses}`}>
                    {currentAdjusted.levelBadge.label} • {currentAdjusted.levelBadge.sublabel}
                  </span>
                </div>
                <div className="w-full md:w-auto md:min-w-[270px] shrink-0">
                  <DifficultyToggle
                    currentLevel={currentDiff}
                    onChange={handleDifficultyChange}
                    size="sm"
                  />
                </div>
              </div>

              {/* Set Progress Pills */}
              <div className="flex items-center gap-2 mt-4">
                {Array.from({ length: currentAdjusted.sets }).map((_, idx) => {
                  const setNum = idx + 1;
                  const isDone = setNum < currentSet;
                  const isCurrent = setNum === currentSet;
                  return (
                    <div
                      key={setNum}
                      className={`flex-1 py-2 rounded-lg text-center font-tactical text-xs font-bold uppercase transition border ${
                        isDone
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-600/60'
                          : isCurrent
                          ? 'bg-[#FF6B00] text-[#0D0F12] border-[#FF6B00] shadow-md shadow-[#FF6B00]/30'
                          : 'bg-[#181E26] text-slate-500 border-[#26303D]'
                      }`}
                    >
                      Set {setNum}
                    </div>
                  );
                })}
              </div>

              {/* Rep Target Callout */}
              <div className="mt-5 p-4 rounded-xl bg-[#161B23] border border-[#263140] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-tactical text-slate-400 uppercase tracking-wider block">
                    TARGET VOLUME FOR SET {currentSet}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-[#FF6B00] font-tactical">
                    {currentAdjusted.repsOrDuration}
                  </span>
                </div>
                <button
                  id="complete-set-btn"
                  onClick={handleCompleteSet}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8526] hover:from-[#FF7A1A] hover:to-[#FF9440] text-[#0D0F12] font-black uppercase text-sm tracking-wider flex items-center gap-2 shadow-lg shadow-[#FF6B00]/25 active:scale-95 transition"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#0D0F12]" />
                  <span>Log Set {currentSet}</span>
                </button>
              </div>

              {/* AJ Risner Coaching Cue */}
              <div className="mt-4 p-3.5 rounded-xl bg-[#0D1015] border-l-4 border-[#FF6B00] border-y border-r border-[#1C222C]">
                <span className="text-[10px] font-tactical uppercase font-bold text-[#FF6B00] block mb-0.5">
                  AJ RISNER INSTRUCTION (SLOW &amp; CONTROLLED):
                </span>
                <p className="text-xs sm:text-sm text-[#E2E8F0] italic leading-relaxed">
                  {currentAdjusted.coachingCue}
                </p>
              </div>

              {/* Postural Benefit & Safety Notes */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#141820] border border-[#222A36]">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Postural & Road Benefit</span>
                  </div>
                  <p className="text-[#94A3B8]">{currentExercise.posturalBenefit}</p>
                </div>
                {currentExercise.hazardNote ? (
                  <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase mb-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Commercial Rig Caution</span>
                    </div>
                    <p className="text-[#CBD5E1]">{currentExercise.hazardNote}</p>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-[#141820] border border-[#222A36]">
                    <div className="flex items-center gap-1.5 text-[#FF6B00] font-bold uppercase mb-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Zero Gym Compliance</span>
                    </div>
                    <p className="text-[#94A3B8]">Utilizes vehicle anchor points and driver bodyweight.</p>
                  </div>
                )}
              </div>

              {/* Step-by-step Tactical Guide */}
              <div className="mt-4 border-t border-[#1C232E] pt-3">
                <span className="text-[11px] font-tactical text-slate-400 uppercase tracking-wider block mb-2">
                  TACTICAL EXECUTION STEPS
                </span>
                <ol className="space-y-1.5 text-xs text-[#CBD5E1]">
                  {currentExercise.stepGuide.map((step, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#1F2633] text-[#FF6B00] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {sIdx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Exercise Navigation Bar */}
      <div className="border-t border-[#1C222C] bg-[#0A0D11] px-4 py-3 sticky bottom-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              if (currentExerciseIndex > 0) {
                setCurrentExerciseIndex((i) => i - 1);
                setCurrentSet(1);
                setIsResting(false);
              }
            }}
            disabled={currentExerciseIndex === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#141922] text-xs font-bold uppercase text-[#CBD5E1] hover:text-white border border-[#242D3B] disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev Movement</span>
          </button>

          <button
            onClick={handleFinishEntireWorkout}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider"
          >
            Finish & Log Session
          </button>

          <button
            onClick={() => {
              if (currentExerciseIndex < day.exercises.length - 1) {
                setCurrentExerciseIndex((i) => i + 1);
                setCurrentSet(1);
                setIsResting(false);
              }
            }}
            disabled={currentExerciseIndex === day.exercises.length - 1}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#141922] text-xs font-bold uppercase text-[#CBD5E1] hover:text-white border border-[#242D3B] disabled:opacity-40"
          >
            <span>Next Movement</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
