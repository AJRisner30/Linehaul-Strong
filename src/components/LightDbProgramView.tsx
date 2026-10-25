import React, { useState } from 'react';
import { 
  Play, 
  Dumbbell, 
  Clock, 
  Flame, 
  ChevronRight, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Truck,
  Bed,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { TrainingDay, WorkoutLogEntry } from '../types';
import { LIGHT_DB_PROTOCOLS } from '../data/protocols';
import { 
  DifficultyToggle, 
  ExerciseDifficultyLevel, 
  getAdjustedExercise, 
  buildAdjustedTrainingDay 
} from '../lib/workoutDifficulty';

interface LightDbProgramViewProps {
  onStartDayWorkout: (day: TrainingDay) => void;
  loggedWorkouts: WorkoutLogEntry[];
  onContactCoach: () => void;
}

export const LightDbProgramView: React.FC<LightDbProgramViewProps> = ({
  onStartDayWorkout,
  loggedWorkouts,
  onContactCoach
}) => {
  const [selectedDayId, setSelectedDayId] = useState<string>('db-1');
  const [globalDifficulty, setGlobalDifficulty] = useState<ExerciseDifficultyLevel>('Intermediate (As listed)');
  const [exerciseDifficultyMap, setExerciseDifficultyMap] = useState<Record<string, ExerciseDifficultyLevel>>({});

  const selectedDay = LIGHT_DB_PROTOCOLS.find((d) => d.id === selectedDayId) || LIGHT_DB_PROTOCOLS[0];

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
      <div className="bg-[#12161E] border-l-4 border-[#FF6B00] border-y border-r border-[#202733] rounded-xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6B00]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-tactical font-black bg-[#FF6B00] text-[#0D0F12] uppercase tracking-wider">
                TACTICAL GEAR PROGRAM
              </span>
              <span className="text-xs font-tactical text-[#E2E8F0] font-semibold flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-[#FF6B00]" />
                LIGHT DUMBBELLS (10–25 LBS) • TRAIN ANYWHERE
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-heading tracking-wide">
              The Light DB Anywhere Program
            </h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl mt-1 leading-relaxed">
              Designed by AJ Risner for commercial drivers carrying a single light pair of dumbbells in the side box or bunk. Zero gym access needed—executed directly inside the sleeper berth, beside the cab on the blacktop, or at a rest area.
            </p>
          </div>

          <div className="bg-[#181F2A] border border-[#273445] p-3.5 rounded-xl flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 rounded-lg bg-[#FF6B00]/15 border border-[#FF6B00]/30 flex items-center justify-center text-[#FF6B00]">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-tactical uppercase text-slate-400 block">GEAR REQUIRED</span>
              <span className="text-xs font-bold text-white font-tactical block">1 Pair Light DBs (10-25 lbs)</span>
              <span className="text-[10px] text-emerald-400 font-tactical block mt-0.5">Sleeper & Lot Friendly</span>
            </div>
          </div>
        </div>
      </div>

      {/* Routine Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {LIGHT_DB_PROTOCOLS.map((day) => {
          const isSelected = day.id === selectedDayId;
          const isLogged = loggedWorkouts.some((w) => w.title.toLowerCase().includes(day.title.toLowerCase()));

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
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-xs font-tactical font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    isSelected ? 'bg-[#FF6B00] text-[#0D0F12]' : 'bg-[#1F2734] text-slate-300'
                  }`}>
                    ROUTINE 0{day.dayNumber}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-tactical">
                    <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>{day.durationMinutes} MIN</span>
                  </div>
                </div>

                <h3 className="font-heading font-black text-base text-white uppercase tracking-wide leading-snug">
                  {day.title}
                </h3>
                <p className="text-[11px] text-[#94A3B8] font-tactical mt-1 line-clamp-2">
                  {day.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#202734] flex items-center justify-between text-xs font-tactical">
                <span className="text-slate-400">{day.exercises.length} DB Movements</span>
                {isLogged ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>LOGGED</span>
                  </span>
                ) : (
                  <span className={`flex items-center gap-0.5 ${isSelected ? 'text-[#FF6B00] font-bold' : 'text-slate-500'}`}>
                    <span>VIEW</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Selected Routine Detail Stage */}
      <div className="bg-[#12161E] border border-[#232B38] rounded-2xl p-5 sm:p-7 shadow-2xl space-y-6">
        {/* Header Strip & Launch Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1E2532]">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40 text-xs font-tactical font-black uppercase">
                LIGHT DB ROUTINE 0{selectedDay.dayNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded bg-[#1C2330] text-slate-300 text-xs font-tactical">
                TARGET: {selectedDay.targetFocus}
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black font-heading uppercase text-white tracking-wide">
              {selectedDay.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-3xl leading-relaxed">
              {selectedDay.description}
            </p>
          </div>

          <button
            onClick={handleStartWorkout}
            className="self-start md:self-center shrink-0 bg-[#FF6B00] hover:bg-[#E05E00] text-[#0D0F12] font-heading font-black px-6 py-3.5 rounded-xl uppercase tracking-wider text-sm flex items-center gap-2.5 shadow-xl shadow-[#FF6B00]/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>START ACTIVE TIMER ({selectedDay.durationMinutes} MIN)</span>
          </button>
        </div>

        {/* Tactical Requirements Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-[#171C25] border border-[#232B38] flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#FF6B00] shrink-0" />
            <div>
              <span className="text-[10px] font-tactical uppercase text-slate-400 block">TIME REQUIRED</span>
              <span className="text-xs font-bold text-white font-tactical">{selectedDay.durationMinutes} Minutes Rapid</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#171C25] border border-[#232B38] flex items-center gap-3">
            <Dumbbell className="w-5 h-5 text-[#FF6B00] shrink-0" />
            <div>
              <span className="text-[10px] font-tactical uppercase text-slate-400 block">EQUIPMENT</span>
              <span className="text-xs font-bold text-white font-tactical">{selectedDay.equipmentRequired.join(' • ')}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#171C25] border border-[#232B38] flex items-center gap-3">
            <MapPin className="w-5 h-5 text-[#FF6B00] shrink-0" />
            <div>
              <span className="text-[10px] font-tactical uppercase text-slate-400 block">EXECUTION LOCATION</span>
              <span className="text-xs font-bold text-white font-tactical">{selectedDay.recommendedTime}</span>
            </div>
          </div>
        </div>

        {/* Master Routine Difficulty Selector Bar */}
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
              Select routine difficulty to scale dumbbell volume across all exercises, or toggle individual exercises below.
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

        {/* Exercise List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-tactical font-black uppercase text-slate-300 tracking-wider flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-[#FF6B00]" />
              <span>EXERCISE BLUEPRINTS &amp; SLOW CONTROLLED MOVEMENTS ({selectedDay.exercises.length} EXERCISES)</span>
            </h4>
            <span className="text-xs font-tactical text-emerald-400 font-bold">
              PACE: Slow and controlled
            </span>
          </div>

          <div className="space-y-4">
            {selectedDay.exercises.map((ex, idx) => {
              const currentExDiff = getDifficultyForEx(ex.id);
              const adjusted = getAdjustedExercise(ex, currentExDiff);

              return (
                <div
                  key={ex.id}
                  className="bg-[#161B23] border border-[#222936] rounded-xl p-4 sm:p-5 hover:border-[#354256] transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#202633]">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded bg-[#FF6B00]/20 text-[#FF6B00] text-[10px] font-tactical font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h5 className="text-base sm:text-lg font-black font-heading uppercase text-white tracking-wide">
                          {ex.name}
                        </h5>
                      </div>
                      <span className="text-xs text-slate-400 font-tactical">
                        TARGET: <strong className="text-slate-200">{ex.targetArea}</strong>
                      </span>
                    </div>

                    {/* Sets, Reps & Rest Pill */}
                    <div className="flex flex-wrap items-center gap-2 self-start font-tactical text-xs">
                      <span className="px-2.5 py-1 rounded bg-[#202836] text-white font-bold border border-[#2D394C]">
                        {adjusted.sets} SETS
                      </span>
                      <span className="px-2.5 py-1 rounded bg-[#202836] text-[#FF6B00] font-bold border border-[#2D394C]">
                        {adjusted.repsOrDuration}
                      </span>
                      <span className="px-2.5 py-1 rounded bg-[#1C222E] text-slate-300 border border-[#252E3E]">
                        PACE: {adjusted.tempo || 'Slow and controlled'}
                      </span>
                      <span className="px-2.5 py-1 rounded bg-[#1C222E] text-slate-400 border border-[#252E3E]">
                        {adjusted.restSeconds}S REST
                      </span>
                    </div>
                  </div>

                  {/* Individual Exercise Difficulty Toggle */}
                  <div className="bg-[#0B0E14] p-2.5 rounded-lg border border-[#1E2533] flex flex-col md:flex-row md:items-center justify-between gap-2.5 w-full min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-tactical uppercase font-bold text-slate-400 shrink-0">
                        Difficulty Toggle:
                      </span>
                      <span className={`text-[10px] font-tactical font-bold px-2 py-0.5 rounded border truncate ${adjusted.levelBadge.colorClasses}`}>
                        {adjusted.levelBadge.label} • {adjusted.levelBadge.sublabel}
                      </span>
                    </div>
                    <div className="w-full md:w-auto md:min-w-[270px] shrink-0">
                      <DifficultyToggle
                        currentLevel={currentExDiff}
                        onChange={(lvl) => handleExerciseDifficultyChange(ex.id, lvl)}
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Coaching Cues & Tactical Setup */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 text-xs">
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg bg-[#0F1318] border border-[#1E2430]">
                        <span className="text-[10px] font-tactical uppercase text-[#FF6B00] font-bold block mb-1">
                          AJ RISNER COACHING CUE
                        </span>
                        <p className="text-slate-300 italic leading-relaxed">
                          {adjusted.coachingCue}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#11161D] text-slate-300 flex items-center justify-between">
                        <span className="text-slate-400 font-tactical text-[10px] uppercase">
                          RIG ANCHOR / SURFACE:
                        </span>
                        <span className="font-semibold text-white">{ex.rigAnchor}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="p-3 rounded-lg bg-[#0F1318] border border-[#1E2430]">
                        <span className="text-[10px] font-tactical uppercase text-emerald-400 font-bold block mb-1">
                          INTENSITY GUIDELINES
                        </span>
                        <p className="text-slate-300 leading-relaxed text-[11px]">
                          {adjusted.intensityNote}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#11161D] text-slate-300 flex items-center justify-between">
                        <span className="text-slate-400 font-tactical text-[10px] uppercase">
                          MOVEMENT INSTRUCTION:
                        </span>
                        <span className="font-bold text-emerald-400">{adjusted.tempo || 'Slow and controlled'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Step Guide */}
                  {ex.stepGuide && ex.stepGuide.length > 0 && (
                    <div className="pt-2 border-t border-[#1F2734]">
                      <span className="text-[10px] font-tactical uppercase text-slate-400 font-bold block mb-1">
                        EXECUTION STEPS
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {ex.stepGuide.map((step, sIdx) => (
                          <div key={sIdx} className="text-[11px] font-tactical text-slate-400 flex items-start gap-1.5">
                            <span className="text-[#FF6B00] font-bold">•</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Contact & 1-on-1 Callout */}
        <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-[#171E29] to-[#12161E] border border-[#293547] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <span className="font-bold text-white uppercase font-tactical block">
              Need customized programming for your specific sleeper or injury?
            </span>
            <span className="text-slate-400">
              Coach AJ Risner provides direct 1-on-1 remote coaching at <strong className="text-[#FF6B00]">risnerathletics@gmail.com</strong>.
            </span>
          </div>
          <button
            onClick={onContactCoach}
            className="self-start sm:self-center shrink-0 px-4 py-2 rounded-lg bg-[#FF6B00]/15 hover:bg-[#FF6B00]/25 text-[#FF6B00] border border-[#FF6B00]/40 font-tactical font-black uppercase text-xs transition"
          >
            Contact Coach AJ
          </button>
        </div>
      </div>
    </div>
  );
};
