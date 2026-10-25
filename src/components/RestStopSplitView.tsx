import React, { useState } from 'react';
import { 
  Play, 
  Dumbbell, 
  Clock, 
  Flame, 
  ChevronRight, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import { TrainingDay, WorkoutLogEntry } from '../types';
import { REST_STOP_PROTOCOLS } from '../data/protocols';
import { 
  DifficultyToggle, 
  ExerciseDifficultyLevel, 
  getAdjustedExercise, 
  buildAdjustedTrainingDay 
} from '../lib/workoutDifficulty';

interface RestStopSplitViewProps {
  onStartDayWorkout: (day: TrainingDay) => void;
  loggedWorkouts: WorkoutLogEntry[];
  onSwitchToLightDb?: () => void;
  onContactCoach?: () => void;
}

export const RestStopSplitView: React.FC<RestStopSplitViewProps> = ({
  onStartDayWorkout,
  loggedWorkouts,
  onSwitchToLightDb,
  onContactCoach
}) => {
  const [selectedDayId, setSelectedDayId] = useState<string>('day-1');
  const [globalDifficulty, setGlobalDifficulty] = useState<ExerciseDifficultyLevel>('Intermediate (As listed)');
  const [exerciseDifficultyMap, setExerciseDifficultyMap] = useState<Record<string, ExerciseDifficultyLevel>>({});

  const selectedDay = REST_STOP_PROTOCOLS.find((d) => d.id === selectedDayId) || REST_STOP_PROTOCOLS[0];

  const getDifficultyForEx = (exId: string): ExerciseDifficultyLevel => {
    return exerciseDifficultyMap[exId] || globalDifficulty;
  };

  const handleExerciseDifficultyChange = (exId: string, level: ExerciseDifficultyLevel) => {
    setExerciseDifficultyMap(prev => ({
      ...prev,
      [exId]: level
    }));
  };

  const handleGlobalDifficultyChange = (level: ExerciseDifficultyLevel) => {
    setGlobalDifficulty(level);
    const updated: Record<string, ExerciseDifficultyLevel> = {};
    selectedDay.exercises.forEach(ex => {
      updated[ex.id] = level;
    });
    setExerciseDifficultyMap(updated);
  };

  const handleStartWorkout = () => {
    const adjustedDay = buildAdjustedTrainingDay(selectedDay, exerciseDifficultyMap, globalDifficulty);
    onStartDayWorkout(adjustedDay);
  };

  return (
    <div className="space-y-6">
      {/* Intro Mission Banner */}
      <div className="bg-[#12161E] border-l-4 border-[#FF6B00] border-y border-r border-[#202733] rounded-xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-tactical font-black bg-[#FF6B00] text-[#0D0F12] uppercase tracking-wider">
                CORE PROGRAMMING
              </span>
              <span className="text-xs font-tactical text-[#E2E8F0] font-semibold">
                ZERO GYM ACCESS REQUIRED
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-heading tracking-wide">
              The Rest Stop Protocol (4-Day Split)
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl mt-1 leading-relaxed">
              Designed by AJ Risner to counteract the postural and cardiovascular degradation of prolonged highway driving. Uses only your bodyweight, the physical rig, and a single stowable resistance band.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onSwitchToLightDb && (
              <button
                onClick={onSwitchToLightDb}
                className="bg-[#1C2433] hover:bg-[#253043] border border-[#FF6B00]/40 text-slate-200 hover:text-white px-3.5 py-2.5 rounded-xl text-xs font-tactical font-bold uppercase tracking-wider flex items-center gap-2 transition"
              >
                <Dumbbell className="w-4 h-4 text-[#FF6B00]" />
                <span>Switch to Light DB Program</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#FF6B00]" />
              </button>
            )}

            <div className="bg-[#181F2A] border border-[#273445] p-3 rounded-xl flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/15 flex items-center justify-center text-[#FF6B00]">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-tactical uppercase text-slate-400 block">GEAR CHECKLIST</span>
                <span className="text-xs font-bold text-white font-tactical block">1 Stowable Band + Rig</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Day Split Selector Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {REST_STOP_PROTOCOLS.map((day) => {
          const isSelected = day.id === selectedDayId;
          const isLogged = loggedWorkouts.some((w) => w.title.includes(`Day ${day.dayNumber}`));

          return (
            <button
              key={day.id}
              onClick={() => setSelectedDayId(day.id)}
              className={`p-4 rounded-xl text-left border transition relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#18202C] border-[#FF6B00] shadow-lg shadow-[#FF6B00]/15'
                  : 'bg-[#12151B] border-[#222834] hover:border-slate-600 hover:bg-[#151921]'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden pointer-events-none">
                  <div className="w-16 h-4 bg-[#FF6B00] rotate-45 translate-x-3 translate-y-1 text-center text-[9px] font-black text-[#0D0F12]">
                    ACTIVE
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span
                    className={`w-7 h-7 rounded-lg font-heading font-black text-sm flex items-center justify-center ${
                      isSelected ? 'bg-[#FF6B00] text-[#0D0F12]' : 'bg-[#1E2532] text-slate-400'
                    }`}
                  >
                    D{day.dayNumber}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isLogged && (
                      <span className="text-[10px] font-tactical px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        LOGGED
                      </span>
                    )}
                    <span className="text-[11px] font-tactical text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#FF6B00]" />
                      {day.durationMinutes}m
                    </span>
                  </div>
                </div>

                <h3 className={`text-base font-black uppercase font-heading tracking-wide ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                  {day.title}
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1 line-clamp-2">
                  {day.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1F2633] flex items-center justify-between text-[11px] font-tactical">
                <span className="text-[#FF6B00] font-semibold">{day.exercises.length} Movements</span>
                <span className="text-slate-400 flex items-center gap-1">
                  View Detail <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Expanded Detail & Workout Launch Card */}
      <div className="bg-[#12151B] border border-[#222936] rounded-2xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1E2532] pb-5 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded bg-[#FF6B00] text-[#0D0F12] text-xs font-tactical font-black uppercase">
                DAY {selectedDay.dayNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-[#1C232E] text-slate-300 text-xs font-tactical font-medium">
                TARGET FOCUS: {selectedDay.targetFocus}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-[#1C232E] text-slate-300 text-xs font-tactical font-medium">
                ESTIMATED TIME: {selectedDay.durationMinutes} MIN
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black uppercase text-white font-heading tracking-wide">
              {selectedDay.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-3xl mt-1 leading-relaxed">
              {selectedDay.description}
            </p>
          </div>

          <button
            id="launch-workout-btn"
            onClick={handleStartWorkout}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF8526] hover:from-[#FF7A1A] hover:to-[#FF9440] text-[#0D0F12] font-black uppercase text-sm tracking-wider shadow-lg shadow-[#FF6B00]/25 active:scale-95 transition shrink-0"
          >
            <Play className="w-5 h-5 fill-[#0D0F12]" />
            <span>Launch Active Workout Tracker</span>
          </button>
        </div>

        {/* Master Routine Difficulty Selector */}
        <div className="bg-[#121620] border-2 border-[#243042] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-heading font-black text-white uppercase tracking-wider">
                Workout Difficulty &amp; Volume Calibration
              </span>
              <span className="text-[10px] font-tactical px-2 py-0.5 rounded bg-[#1C2535] text-amber-400 border border-[#2B394E] font-bold">
                Driver Paced
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-tactical">
              Scale rig exercise volume across all movements, or switch individual exercises below.
            </p>
          </div>
          <div className="w-full md:w-auto md:min-w-[300px] shrink-0">
            <DifficultyToggle
              currentLevel={globalDifficulty}
              onChange={handleGlobalDifficultyChange}
              size="md"
            />
          </div>
        </div>

        {/* Exercises Included in This Day Split */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-tactical uppercase font-bold text-slate-300 tracking-wider flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-[#FF6B00]" />
              <span>TACTICAL RIG EXERCISES ({selectedDay.exercises.length})</span>
            </span>
            <span className="text-xs font-tactical text-emerald-400 font-bold">
              PACE: Slow and controlled
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedDay.exercises.map((ex, idx) => {
              const currentExDiff = getDifficultyForEx(ex.id);
              const adjusted = getAdjustedExercise(ex, currentExDiff);

              return (
                <div
                  key={ex.id}
                  className="bg-[#151922] border border-[#222A38] rounded-xl p-4 flex flex-col justify-between hover:border-[#FF6B00]/40 transition space-y-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-[#1F2633] text-[#FF6B00] font-tactical font-black text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm sm:text-base font-bold uppercase text-white font-heading tracking-wide">
                          {ex.name}
                        </h4>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded font-tactical font-semibold bg-[#222A36] text-slate-300 shrink-0">
                        {ex.equipment}
                      </span>
                    </div>

                    <p className="text-xs text-[#94A3B8]">
                      Target: <span className="text-slate-300 font-medium">{ex.targetArea}</span>
                    </p>

                    {/* Individual Exercise Difficulty Toggle */}
                    <div className="bg-[#0B0E14] p-2 rounded-lg border border-[#1E2533] flex flex-col gap-1.5 w-full min-w-0">
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <span className="text-[10px] font-tactical uppercase font-bold text-slate-400 shrink-0">
                          Difficulty:
                        </span>
                        <span className={`text-[10px] font-tactical font-bold px-2 py-0.5 rounded border truncate ${adjusted.levelBadge.colorClasses}`}>
                          {adjusted.levelBadge.label} • {adjusted.levelBadge.sublabel}
                        </span>
                      </div>
                      <DifficultyToggle
                        currentLevel={currentExDiff}
                        onChange={(lvl) => handleExerciseDifficultyChange(ex.id, lvl)}
                        size="sm"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs font-tactical bg-[#0E1217] p-2.5 rounded-lg border border-[#1A202A]">
                      <div>
                        <span className="text-[10px] text-slate-500 block">VOLUME</span>
                        <span className="text-white font-bold">{adjusted.sets} Sets</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">REPS/TIME</span>
                        <span className="text-[#FF6B00] font-bold">{adjusted.repsOrDuration}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">REST</span>
                        <span className="text-slate-300 font-bold">{adjusted.restSeconds}s</span>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-[#0D1016] text-[11px] font-tactical text-slate-400 flex items-center justify-between border border-[#1A202A]">
                      <span>PACE:</span>
                      <strong className="text-emerald-400 font-bold">{adjusted.tempo || 'Slow and controlled'}</strong>
                    </div>

                    <div className="text-xs text-slate-300 italic bg-[#10141A] p-2.5 rounded-lg border-l-2 border-[#FF6B00]">
                      "{adjusted.coachingCue.replace('AJ Risner: ', '')}"
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#1C222C] flex items-center justify-between text-[11px] text-slate-400 font-tactical gap-2 min-w-0">
                    <span className="truncate">Rig Anchor: {ex.rigAnchor}</span>
                    <span className="text-[10px] text-[#FF6B00] font-bold shrink-0">{adjusted.levelBadge.label} ({adjusted.levelBadge.sublabel})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Coaching Banner */}
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#171E29] to-[#12161E] border border-[#293547] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <span className="font-bold text-white uppercase font-tactical block">
              Have questions about posture, cab mobility, or 1-on-1 driver coaching?
            </span>
            <span className="text-slate-400">
              Reach founder AJ Risner directly at <strong className="text-[#FF6B00]">risnerathletics@gmail.com</strong>.
            </span>
          </div>
          {onContactCoach && (
            <button
              onClick={onContactCoach}
              className="self-start sm:self-center shrink-0 px-4 py-2 rounded-lg bg-[#FF6B00]/15 hover:bg-[#FF6B00]/25 text-[#FF6B00] border border-[#FF6B00]/40 font-tactical font-black uppercase text-xs transition"
            >
              Contact Coach AJ
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
