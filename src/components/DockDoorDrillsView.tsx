import React, { useState, useEffect } from 'react';
import { DockDrill, WorkoutLogEntry } from '../types';
import { DOCK_DOOR_DRILLS } from '../data/dockDrills';
import { 
  Zap, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  Flame, 
  ShieldCheck, 
  ChevronRight,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DifficultyToggle, ExerciseDifficultyLevel } from '../lib/workoutDifficulty';

interface DockDoorDrillsViewProps {
  onLogWorkout?: (entry: WorkoutLogEntry) => void;
  onContactCoach?: () => void;
}

interface AdjustedDrillExercise {
  name: string;
  workSec: number;
  restSec: number;
  rigAnchor: string;
  cue: string;
  difficulty: ExerciseDifficultyLevel;
  instruction: string;
}

export const DockDoorDrillsView: React.FC<DockDoorDrillsViewProps> = ({
  onLogWorkout,
  onContactCoach
}) => {
  const [selectedDrill, setSelectedDrill] = useState<DockDrill>(DOCK_DOOR_DRILLS[0]);
  const [activeDrillRunning, setActiveDrillRunning] = useState<DockDrill | null>(null);
  const [activeAdjustedExercises, setActiveAdjustedExercises] = useState<AdjustedDrillExercise[]>([]);

  // Difficulty State
  const [globalDifficulty, setGlobalDifficulty] = useState<ExerciseDifficultyLevel>('Intermediate (As listed)');
  const [exerciseDifficulties, setExerciseDifficulties] = useState<Record<string, ExerciseDifficultyLevel>>({});

  const getDifficultyForIndex = (drillId: string, exIdx: number): ExerciseDifficultyLevel => {
    return exerciseDifficulties[`${drillId}-${exIdx}`] || globalDifficulty;
  };

  const handleExDifficultyChange = (drillId: string, exIdx: number, lvl: ExerciseDifficultyLevel) => {
    setExerciseDifficulties(prev => ({
      ...prev,
      [`${drillId}-${exIdx}`]: lvl
    }));
  };

  const handleGlobalDifficultyChange = (lvl: ExerciseDifficultyLevel) => {
    setGlobalDifficulty(lvl);
    const updated: Record<string, ExerciseDifficultyLevel> = {};
    selectedDrill.exercises.forEach((_, idx) => {
      updated[`${selectedDrill.id}-${idx}`] = lvl;
    });
    setExerciseDifficulties(prev => ({ ...prev, ...updated }));
  };

  const getAdjustedDrillExercise = (
    ex: DockDrill['exercises'][0],
    difficulty: ExerciseDifficultyLevel
  ): AdjustedDrillExercise => {
    let workSec = ex.workSec;
    let restSec = ex.restSec;
    let instruction = 'Slow and controlled. Smooth deliberate motion, focus on steady breathing.';

    if (difficulty === 'Beginner (Reduced volume)') {
      workSec = Math.max(20, ex.workSec - 15);
      restSec = ex.restSec + 10;
      instruction = 'Slow and controlled. Gentle pace, focus on joint alignment and easy breathing.';
    } else if (difficulty === 'Advanced (Added intensity)') {
      workSec = ex.workSec + 15;
      restSec = Math.max(10, ex.restSec - 5);
      instruction = 'Slow and controlled. Continuous muscle tension with a 2-second hold at peak.';
    }

    return {
      name: ex.name,
      workSec,
      restSec,
      rigAnchor: ex.rigAnchor,
      cue: ex.cue,
      difficulty,
      instruction
    };
  };

  // Timer State for active drill
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [timerPhase, setTimerPhase] = useState<'work' | 'rest'>('work');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(45);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [totalDrillElapsed, setTotalDrillElapsed] = useState<number>(0);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState<boolean>(false);

  // Handle active drill countdown
  useEffect(() => {
    if (!activeDrillRunning || isPaused || isCompletedModalOpen || activeAdjustedExercises.length === 0) return;

    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev > 1) {
          return prev - 1;
        }

        // Phase switch or next exercise
        const currentEx = activeAdjustedExercises[currentExerciseIndex];
        if (!currentEx) return 0;

        if (timerPhase === 'work') {
          // Switch to rest
          if (currentEx.restSec > 0) {
            setTimerPhase('rest');
            return currentEx.restSec;
          } else {
            // No rest, straight to next exercise
            return advanceToNextExercise();
          }
        } else {
          // In rest, transition to next exercise work phase
          return advanceToNextExercise();
        }
      });

      setTotalDrillElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeDrillRunning, isPaused, timerPhase, currentExerciseIndex, isCompletedModalOpen, activeAdjustedExercises]);

  const advanceToNextExercise = (): number => {
    if (!activeDrillRunning || activeAdjustedExercises.length === 0) return 0;
    if (currentExerciseIndex < activeAdjustedExercises.length - 1) {
      const nextIdx = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIdx);
      setTimerPhase('work');
      return activeAdjustedExercises[nextIdx].workSec;
    } else {
      // Completed all exercises
      handleDrillComplete();
      return 0;
    }
  };

  const handleStartDrill = (drill: DockDrill) => {
    const adjustedList = drill.exercises.map((ex, idx) => {
      const diff = getDifficultyForIndex(drill.id, idx);
      return getAdjustedDrillExercise(ex, diff);
    });

    setActiveAdjustedExercises(adjustedList);
    setActiveDrillRunning(drill);
    setCurrentExerciseIndex(0);
    setTimerPhase('work');
    setSecondsRemaining(adjustedList[0].workSec);
    setIsPaused(false);
    setTotalDrillElapsed(0);
    setIsCompletedModalOpen(false);
  };

  const handleDrillComplete = () => {
    setIsCompletedModalOpen(true);
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.7 }
    });

    if (activeDrillRunning && onLogWorkout) {
      const estimatedCalories = Math.round(activeDrillRunning.durationMinutes * 9.5);
      const logEntry: WorkoutLogEntry = {
        id: `drill-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'dock-door-drill',
        title: `Dock Drill: ${activeDrillRunning.title}`,
        durationMinutes: activeDrillRunning.durationMinutes,
        caloriesBurned: estimatedCalories,
        notes: `Shipper detention drill completed. Anchor: ${activeDrillRunning.locationContext}.`
      };
      onLogWorkout(logEntry);
    }
  };

  const handleCloseActiveModal = () => {
    setActiveDrillRunning(null);
    setIsCompletedModalOpen(false);
  };

  const currentExercise = activeDrillRunning?.exercises[currentExerciseIndex];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#181D26] to-[#0F131A] border border-[#273549] rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#FF6B00] text-xs font-tactical uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4" />
              <span>SHIPPER & RECEIVER DETENTION SPRINT • 5 TO 10 MINUTES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-wide uppercase text-white">
              "DOCK DOOR DRILLS" <span className="text-[#FF6B00]">(MICRO-WORKOUTS)</span>
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl font-tactical mt-1">
              Waiting 2 to 4 hours in a warehouse staging lane or backing bay? Don't let detention time destroy your posture or drain your momentum. These 5-to-10 minute micro-drills require zero gym access and can be executed right beside your trailer skirt, on your cab ingress step, or 100% inside your sleeper berth.
            </p>
          </div>

          <div className="bg-[#0B0E14] border border-[#1E2838] p-3 rounded-xl flex items-center gap-3 shrink-0 self-start lg:self-center">
            <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/15 flex items-center justify-center text-[#FF6B00]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-tactical uppercase text-slate-400 block">AVERAGE DETENTION</span>
              <span className="text-xs font-bold text-white font-tactical block">150 Mins Idle • 8 Mins Armor</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Drills Selector & Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List of Drills */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-tactical font-black uppercase text-slate-400 tracking-wider block px-1">
            SELECT DETENTION DRILL ({DOCK_DOOR_DRILLS.length})
          </span>

          {DOCK_DOOR_DRILLS.map((drill, idx) => {
            const isSelected = selectedDrill.id === drill.id;
            return (
              <div
                key={drill.id}
                onClick={() => setSelectedDrill(drill)}
                className={`p-4 rounded-xl cursor-pointer transition border flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-[#18202D] border-[#FF6B00] shadow-md shadow-[#FF6B00]/10'
                    : 'bg-[#10141D] border-[#1C2534] hover:bg-[#141A25] hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-tactical uppercase px-1.5 py-0.5 rounded bg-[#FF6B00]/20 text-[#FF6B00] font-bold">
                      DRILL 0{idx + 1} • {drill.durationMinutes} MINS
                    </span>
                    <h3 className="text-base font-heading font-black text-white uppercase tracking-wider mt-1.5">
                      {drill.title}
                    </h3>
                  </div>
                  <span className="text-xs font-tactical text-slate-400 bg-[#0A0D12] px-2 py-1 rounded border border-[#1A222E] shrink-0">
                    {drill.intensity}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-tactical text-slate-400 pt-2 border-t border-[#1C2636]">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Truck className="w-3.5 h-3.5 text-[#FF6B00]" />
                    {drill.locationContext}
                  </span>
                  <span className="text-[#FF6B00] font-bold flex items-center gap-1">
                    {drill.exercises.length} Movements
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Selected Drill Deep Dive */}
        <div className="lg:col-span-7 bg-[#121722] border border-[#222E3F] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E293B]">
              <div>
                <span className="text-xs font-tactical font-black uppercase text-[#FF6B00] tracking-wider">
                  TACTICAL PROTOCOL • {selectedDrill.locationContext}
                </span>
                <h3 className="text-2xl font-black font-heading uppercase text-white tracking-wide mt-1">
                  {selectedDrill.title}
                </h3>
              </div>

              <button
                onClick={() => handleStartDrill(selectedDrill)}
                className="px-5 py-3 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-[#0D0F12] font-heading font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B00]/25 transition shrink-0"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>LAUNCH MICRO-TIMER ({selectedDrill.durationMinutes}M)</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 font-tactical leading-relaxed mt-4">
              {selectedDrill.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
              <div className="bg-[#0A0D12] p-3 rounded-xl border border-[#1A222E]">
                <span className="text-[10px] font-tactical text-slate-400 uppercase block">DURATION</span>
                <span className="text-sm font-bold text-white font-tactical">{selectedDrill.durationMinutes} Minutes</span>
              </div>
              <div className="bg-[#0A0D12] p-3 rounded-xl border border-[#1A222E]">
                <span className="text-[10px] font-tactical text-slate-400 uppercase block">DRILL FOCUS</span>
                <span className="text-sm font-bold text-emerald-400 font-tactical truncate block">{selectedDrill.focus}</span>
              </div>
              <div className="bg-[#0A0D12] p-3 rounded-xl border border-[#1A222E] col-span-2 sm:col-span-1">
                <span className="text-[10px] font-tactical text-slate-400 uppercase block">CALORIE BURN</span>
                <span className="text-sm font-bold text-[#FF6B00] font-tactical">~{Math.round(selectedDrill.durationMinutes * 9.5)} kcal</span>
              </div>
            </div>

            {/* Master Drill Difficulty Selector Bar */}
            <div className="bg-[#0E1219] border border-[#202938] rounded-xl p-3 sm:p-4 my-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
              <div>
                <span className="text-xs font-heading font-black text-white uppercase tracking-wider block">
                  Drill Volume &amp; Interval Calibration
                </span>
                <p className="text-[11px] text-slate-400 font-tactical">
                  Adjust work interval and recovery rest for your current physical energy level.
                </p>
              </div>
              <div className="w-full md:w-auto md:min-w-[280px] shrink-0">
                <DifficultyToggle
                  currentLevel={globalDifficulty}
                  onChange={handleGlobalDifficultyChange}
                  size="sm"
                />
              </div>
            </div>

            {/* Exercises Flow Breakdown */}
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-tactical font-black uppercase tracking-wider text-slate-300 block">
                  MOVEMENTS IN THIS PROTOCOL ({selectedDrill.exercises.length}):
                </span>
                <span className="text-xs font-tactical text-emerald-400 font-bold">
                  INSTRUCTION: Slow and controlled
                </span>
              </div>

              <div className="space-y-3">
                {selectedDrill.exercises.map((ex, idx) => {
                  const currentDiff = getDifficultyForIndex(selectedDrill.id, idx);
                  const adjusted = getAdjustedDrillExercise(ex, currentDiff);

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#0D121A] border border-[#1B2535] hover:border-[#2C3B52] transition flex flex-col gap-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#FF6B00]/20 text-[#FF6B00] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-white uppercase">{ex.name}</h4>
                          </div>
                          <p className="text-[11px] text-slate-400 font-tactical pl-7">{ex.cue}</p>
                        </div>

                        <div className="text-left sm:text-right shrink-0 pl-7 sm:pl-0">
                          <span className="text-xs font-mono font-black text-[#FF6B00] block">
                            {adjusted.workSec}s WORK / {adjusted.restSec}s REST
                          </span>
                          <span className="text-[10px] font-tactical text-slate-400 block">{ex.rigAnchor}</span>
                        </div>
                      </div>

                      {/* Difficulty Toggle for this movement */}
                      <div className="bg-[#080B10] p-2 rounded-lg border border-[#18202D] flex flex-col md:flex-row md:items-center justify-between gap-2.5 w-full min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[10px] font-tactical uppercase font-bold text-slate-400 shrink-0">
                            Difficulty:
                          </span>
                          <span className={`text-[10px] font-tactical font-bold px-2 py-0.5 rounded border truncate ${
                            currentDiff === 'Advanced (Added intensity)'
                              ? 'bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/40'
                              : currentDiff === 'Beginner (Reduced volume)'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                          }`}>
                            {currentDiff === 'Advanced (Added intensity)'
                              ? 'Advanced • +Intensity'
                              : currentDiff === 'Beginner (Reduced volume)'
                              ? 'Beginner • Reduced'
                              : 'Intermediate • Standard'}
                          </span>
                        </div>
                        <div className="w-full md:w-auto md:min-w-[270px] shrink-0">
                          <DifficultyToggle
                            currentLevel={currentDiff}
                            onChange={(lvl) => handleExDifficultyChange(selectedDrill.id, idx, lvl)}
                            size="sm"
                          />
                        </div>
                      </div>

                      {/* Movement Instruction */}
                      <div className="text-[11px] font-tactical text-slate-300 bg-[#090D13] px-3 py-1.5 rounded-lg border border-[#161E2B] flex items-center justify-between">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">INSTRUCTION:</span>
                        <span className="text-emerald-400 font-bold">{adjusted.instruction}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#1C2636] flex items-center justify-between text-xs font-tactical text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% OSHA & DOT Warehouse Security Compliant
            </span>
            <span>Created by AJ Risner</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* FULLSCREEN ACTIVE DOCK DRILL MODAL RUNNER                 */}
      {/* ======================================================== */}
      {activeDrillRunning && activeAdjustedExercises[currentExerciseIndex] && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#10141D] border-2 border-[#FF6B00] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-[#222E3F] pb-4">
              <div>
                <span className="text-xs font-tactical text-[#FF6B00] uppercase font-bold tracking-wider">
                  ACTIVE DOCK DOOR DRILL • {activeDrillRunning.title}
                </span>
                <h3 className="text-xl font-heading font-black text-white uppercase">
                  MOVEMENT {currentExerciseIndex + 1} OF {activeAdjustedExercises.length}
                </h3>
              </div>
              <button
                onClick={handleCloseActiveModal}
                className="w-9 h-9 rounded-full bg-[#1A222E] hover:bg-[#253245] flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Big Countdown Display */}
            <div className="text-center py-4 bg-[#0A0D12] rounded-2xl border border-[#1A2433] relative overflow-hidden">
              <div
                className={`text-[11px] font-tactical font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-2 ${
                  timerPhase === 'work'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {timerPhase === 'work' ? '🔥 WORK INTERVAL - EXECUTE' : 'REST & TRANSITION'}
              </div>

              <div className="text-6xl sm:text-7xl font-mono font-black text-white tracking-tight">
                {secondsRemaining}s
              </div>

              <div className="text-xs font-tactical text-slate-400 mt-2">
                TOTAL DRILL TIME: {Math.floor(totalDrillElapsed / 60)}m {totalDrillElapsed % 60}s
              </div>
            </div>

            {/* Current Exercise Details */}
            <div className="bg-[#161D29] border border-[#26354A] p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-tactical text-slate-400 uppercase tracking-wider block">
                  RIG ANCHOR: {activeAdjustedExercises[currentExerciseIndex].rigAnchor}
                </span>
                <span className="text-[10px] font-tactical text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-600/40">
                  {activeAdjustedExercises[currentExerciseIndex].difficulty}
                </span>
              </div>
              <h4 className="text-lg font-heading font-black text-white uppercase">
                {activeAdjustedExercises[currentExerciseIndex].name}
              </h4>
              <p className="text-xs text-[#FF6B00] font-tactical italic leading-relaxed">
                {activeAdjustedExercises[currentExerciseIndex].cue}
              </p>
              <div className="pt-2 border-t border-[#232F42] flex items-center justify-between text-xs font-tactical">
                <span className="text-slate-400">INSTRUCTION:</span>
                <span className="text-emerald-400 font-bold">{activeAdjustedExercises[currentExerciseIndex].instruction}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-6 py-3 rounded-xl bg-[#FF6B00] text-[#0D0F12] font-black uppercase font-tactical flex items-center gap-2 hover:bg-[#E05E00] transition"
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Resume</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause</span>
                  </>
                )}
              </button>

              <button
                onClick={advanceToNextExercise}
                className="px-4 py-3 rounded-xl bg-[#1C2432] text-slate-200 hover:text-white font-tactical font-bold uppercase flex items-center gap-2 border border-[#2D3C52] transition"
              >
                <SkipForward className="w-4 h-4" />
                <span>Next Movement</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {isCompletedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#10141D] border-2 border-emerald-500 rounded-3xl max-w-md w-full p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black font-heading uppercase text-white">
              DETENTION CONQUERED!
            </h3>

            <p className="text-xs text-slate-300 font-tactical">
              You turned wasted warehouse detention time into metabolic fire. Session logged directly to your Linehaul Strong records!
            </p>

            <div className="p-3 bg-[#0A0D12] rounded-xl border border-[#1A222E] flex justify-around font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block font-tactical">TIME</span>
                <span className="text-base font-bold text-white">
                  {activeDrillRunning?.durationMinutes} Mins
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-tactical">CALORIES</span>
                <span className="text-base font-bold text-[#FF6B00]">
                  ~{activeDrillRunning ? Math.round(activeDrillRunning.durationMinutes * 9.5) : 80} kcal
                </span>
              </div>
            </div>

            <button
              onClick={handleCloseActiveModal}
              className="w-full py-3 rounded-xl bg-emerald-500 text-black font-black uppercase tracking-wider font-heading hover:bg-emerald-400 transition"
            >
              Back to Terminal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
