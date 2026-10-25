import React, { useState } from 'react';
import { 
  Play, 
  Dumbbell, 
  Clock, 
  Flame, 
  ChevronRight, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  Zap, 
  Activity, 
  Layers, 
  Bed, 
  HeartHandshake, 
  ChevronDown, 
  ChevronUp,
  ArrowRight
} from 'lucide-react';
import { TrainingDay, WorkoutLogEntry } from '../types';
import { ROAD_WARRIOR_PROTOCOLS, ROAD_WARRIOR_TIPS } from '../data/protocols';
import { 
  DifficultyToggle, 
  ExerciseDifficultyLevel, 
  getAdjustedExercise, 
  buildAdjustedTrainingDay 
} from '../lib/workoutDifficulty';

interface RoadWarriorProgramViewProps {
  onStartDayWorkout: (day: TrainingDay) => void;
  loggedWorkouts: WorkoutLogEntry[];
  onNavigateToGymMap: () => void;
  onContactCoach: () => void;
}

export const RoadWarriorProgramView: React.FC<RoadWarriorProgramViewProps> = ({
  onStartDayWorkout,
  loggedWorkouts,
  onNavigateToGymMap,
  onContactCoach
}) => {
  const [selectedDayId, setSelectedDayId] = useState<string>('rw-1');
  const [showWarmupGuide, setShowWarmupGuide] = useState<boolean>(true);
  const [completedWarmupSteps, setCompletedWarmupSteps] = useState<Record<number, boolean>>({});
  const [globalDifficulty, setGlobalDifficulty] = useState<ExerciseDifficultyLevel>('Intermediate (As listed)');
  const [exerciseDifficultyMap, setExerciseDifficultyMap] = useState<Record<string, ExerciseDifficultyLevel>>({});

  const selectedDay = ROAD_WARRIOR_PROTOCOLS.find((d) => d.id === selectedDayId) || ROAD_WARRIOR_PROTOCOLS[0];

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

  const toggleWarmupStep = (idx: number) => {
    setCompletedWarmupSteps(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Intro Mission Banner */}
      <div className="bg-[#12161E] border-l-4 border-[#FF6B00] border-y border-r border-[#202733] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B00]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-tactical font-black bg-[#FF6B00] text-[#0D0F12] uppercase tracking-wider">
                COMMERCIAL GYM PROTOCOL
              </span>
              <span className="text-xs font-tactical text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                PLANET FITNESS & ANYTIME FITNESS OPTIMIZED
              </span>
              <span className="text-xs font-tactical text-slate-400">
                • 3 DAYS / WEEK (MON / WED / FRI)
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-heading tracking-wide">
              The "Road Warrior" 3-Day Workout Plan
            </h2>

            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-3xl leading-relaxed">
              Created by Coach AJ Risner specifically for linehaul and OTR drivers stopping at commercial gyms (e.g. Planet Fitness). Engineered to counteract the physical toll of 11-hour shifts: unlocking compressed hip flexors, rebuilding weakened posterior chains, straightening rounded steering-wheel shoulders, and casting a shield of armor around the lumbar spine.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={onNavigateToGymMap}
              className="px-4 py-3 rounded-xl bg-[#1A2330] hover:bg-[#222E40] border border-[#2D3B50] text-white text-xs font-tactical font-black uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md"
            >
              <MapPin className="w-4 h-4 text-[#FF6B00]" />
              <span>Locate Gyms With Semi Parking</span>
            </button>

            <button
              onClick={() => onStartDayWorkout(selectedDay)}
              className="px-5 py-3 rounded-xl bg-[#FF6B00] hover:bg-[#FF8526] text-[#0A0D12] text-xs font-tactical font-black uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-[#FF6B00]/25"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Runner ({selectedDay.durationMinutes}m)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Program Summary Specifications Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-[#12161E] border border-[#222B38] space-y-1">
          <span className="text-[10px] font-tactical font-black text-[#FF6B00] uppercase tracking-wider block">TARGET AUDIENCE</span>
          <span className="text-xs font-bold text-white block">Professional Drivers</span>
          <span className="text-[11px] text-slate-400 block">Linehaul, OTR & Regional</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#12161E] border border-[#222B38] space-y-1">
          <span className="text-[10px] font-tactical font-black text-[#FF6B00] uppercase tracking-wider block">EQUIPMENT NEEDED</span>
          <span className="text-xs font-bold text-white block">Commercial Gym Gear</span>
          <span className="text-[11px] text-slate-400 block">Planet Fitness / Anytime standard</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#12161E] border border-[#222B38] space-y-1">
          <span className="text-[10px] font-tactical font-black text-[#FF6B00] uppercase tracking-wider block">CORE FOCUS</span>
          <span className="text-xs font-bold text-white block">Counteract Driving Toll</span>
          <span className="text-[11px] text-slate-400 block">Tight hips, glutes, shoulders & back</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#12161E] border border-[#222B38] space-y-1">
          <span className="text-[10px] font-tactical font-black text-[#FF6B00] uppercase tracking-wider block">FREQUENCY</span>
          <span className="text-xs font-bold text-white block">3 Days / Week</span>
          <span className="text-[11px] text-slate-400 block">Mon / Wed / Fri + rest days</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#12161E] border border-[#222B38] space-y-1 sm:col-span-2 lg:col-span-1">
          <span className="text-[10px] font-tactical font-black text-[#FF6B00] uppercase tracking-wider block">REST PERIODS</span>
          <span className="text-xs font-bold text-white block">Strict Recovery Rest</span>
          <span className="text-[11px] text-slate-400 block">Stick to suggested times</span>
        </div>
      </div>

      {/* Mandatory Warm-Up Protocol Card */}
      <div className="bg-[#10141C] border border-[#222B38] rounded-xl overflow-hidden shadow-lg">
        <button
          onClick={() => setShowWarmupGuide(!showWarmupGuide)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#141A24] transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-tactical font-black uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                  MANDATORY BEFORE EVERY SESSION
                </span>
                <span className="text-xs text-slate-400 font-tactical font-bold">5–10 MINUTES</span>
              </div>
              <h3 className="text-sm sm:text-base font-heading font-black uppercase text-white tracking-wide mt-0.5">
                {ROAD_WARRIOR_TIPS.warmupProtocol.title}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-tactical text-slate-400">
            <span>{showWarmupGuide ? 'Hide Primer' : 'View Primer'}</span>
            {showWarmupGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showWarmupGuide && (
          <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 border-t border-[#1C2330] bg-[#0E1218] space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Driving keeps joints static and compressed under thousands of pounds of cabin road vibration. Always spend 5 to 10 minutes priming cardiovascular blood flow and lubricating hip/shoulder capsules before touching heavy iron.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ROAD_WARRIOR_TIPS.warmupProtocol.steps.map((step, idx) => {
                const isChecked = !!completedWarmupSteps[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleWarmupStep(idx)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      isChecked
                        ? 'bg-emerald-950/30 border-emerald-600/50 text-white'
                        : 'bg-[#141A24] border-[#242E3E] hover:border-slate-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-tactical font-black text-[#FF6B00] uppercase tracking-wider">
                          STEP 0{idx + 1}
                        </span>
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isChecked ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-slate-600'
                        }`}>
                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                      <h4 className="text-xs font-bold text-white font-tactical uppercase tracking-wide">
                        {step.name}
                      </h4>
                      <p className="text-[11px] text-slate-300 font-tactical mt-1 leading-normal">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3-Day Routine Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {ROAD_WARRIOR_PROTOCOLS.map((day) => {
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
                    DAY 0{day.dayNumber}
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
                <span className="text-slate-400">{day.exercises.length} Compound Lifts</span>
                {isLogged ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>COMPLETED</span>
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
                ROAD WARRIOR DAY 0{selectedDay.dayNumber}
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
              <span className="text-[10px] font-tactical uppercase text-slate-400 block">ESTIMATED TIME</span>
              <span className="text-xs font-bold text-white font-tactical">{selectedDay.durationMinutes} Minutes Work + Rest</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#171C25] border border-[#232B38] flex items-center gap-3">
            <Dumbbell className="w-5 h-5 text-[#FF6B00] shrink-0" />
            <div>
              <span className="text-[10px] font-tactical uppercase text-slate-400 block">FACILITY EQUIPMENT</span>
              <span className="text-xs font-bold text-white font-tactical">{selectedDay.equipmentRequired.slice(0, 2).join(', ')}...</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#171C25] border border-[#232B38] flex items-center gap-3">
            <Activity className="w-5 h-5 text-[#FF6B00] shrink-0" />
            <div>
              <span className="text-[10px] font-tactical uppercase text-slate-400 block">RECOMMENDED SLOT</span>
              <span className="text-xs font-bold text-white font-tactical">{selectedDay.recommendedTime}</span>
            </div>
          </div>
        </div>

        {/* Master Routine Difficulty Selector Bar */}
        <div className="bg-[#121620] border-2 border-[#263346] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
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
              Select routine difficulty to scale all sets and volume, or customize each exercise individually below.
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

        {/* Exercise Sequence List */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="font-heading font-black text-lg text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#FF6B00]" />
              <span>Exercise Execution Blueprint ({selectedDay.exercises.length} Movements)</span>
            </h4>
            <span className="text-xs font-tactical text-slate-400">Strict Rest Discipline</span>
          </div>

          <div className="space-y-3.5">
            {selectedDay.exercises.map((ex, index) => {
              const currentExDiff = getDifficultyForEx(ex.id);
              const adjusted = getAdjustedExercise(ex, currentExDiff);

              return (
                <div
                  key={ex.id}
                  className="bg-[#151A23] border border-[#252E3C] hover:border-[#38465B] rounded-xl p-4 sm:p-5 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30 font-tactical font-black text-xs flex items-center justify-center shrink-0">
                        0{index + 1}
                      </span>
                      <div>
                        <h5 className="font-heading font-black text-base text-white uppercase tracking-wide">
                          {ex.name}
                        </h5>
                        <span className="text-xs font-tactical text-[#FF6B00] font-semibold">
                          TARGET: {ex.targetArea}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                      <span className="px-2.5 py-1 rounded-md bg-[#1D2533] border border-[#2C384C] text-xs font-tactical font-black text-white">
                        {adjusted.sets} SETS × {adjusted.repsOrDuration}
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-[#1D2533] border border-[#2C384C] text-xs font-tactical text-slate-300">
                        REST: {adjusted.restSeconds}s
                      </span>
                    </div>
                  </div>

                  {/* Individual Exercise Difficulty Toggle Strip */}
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

                  {/* Tactical Parameters Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-tactical pt-1">
                    <div className="p-2.5 rounded-lg bg-[#0F131A] border border-[#1E2530] text-slate-300">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">GYM STATION / SETUP:</span>
                      <span className="text-white font-medium">{ex.rigAnchor}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#0F131A] border border-[#1E2530] text-slate-300">
                      <span className="text-[10px] text-slate-500 uppercase block font-bold">PACE:</span>
                      <span className="text-emerald-400 font-bold">{adjusted.tempo || 'Slow and controlled'}</span>
                    </div>
                  </div>

                  {/* Intensity Guidance Callout */}
                  <div className="text-[11px] font-tactical text-slate-400 bg-[#0E1218] px-3 py-1.5 rounded-lg border border-[#1C2330] break-words">
                    <span className="text-slate-300 font-bold uppercase text-[10px] mr-1.5 shrink-0">INTENSITY NOTE:</span>
                    <span>{adjusted.intensityNote}</span>
                  </div>

                  {/* Coach AJ Coaching Cue */}
                  <div className="p-3 rounded-lg bg-[#1B222E]/80 border-l-2 border-[#FF6B00] text-xs font-tactical space-y-1">
                    <span className="text-[10px] font-black text-[#FF6B00] uppercase tracking-wider block">
                      COACH AJ RISNER TACTICAL CUE:
                    </span>
                    <p className="text-slate-200 italic leading-relaxed">
                      {adjusted.coachingCue}
                    </p>
                  </div>

                  {/* Postural Benefit (Why it matters for drivers) */}
                  <div className="text-xs font-tactical text-slate-300 flex items-start gap-2 pt-0.5">
                    <span className="text-[#FF6B00] font-bold shrink-0">DRIVER BENEFIT:</span>
                    <span className="text-slate-300 leading-normal">{ex.posturalBenefit}</span>
                  </div>

                  {/* Step-by-Step Guide */}
                  {ex.stepGuide && ex.stepGuide.length > 0 && (
                    <div className="pt-2 border-t border-[#1F2734]">
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

        {/* Bottom Launcher Bar */}
        <div className="pt-4 border-t border-[#1E2532] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-tactical text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Interactive runner guides each set, rest timer, and auto-saves to your private driver logbook.</span>
          </div>

          <button
            onClick={handleStartWorkout}
            className="w-full sm:w-auto bg-[#FF6B00] hover:bg-[#E05E00] text-[#0D0F12] font-heading font-black px-8 py-3 rounded-xl uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF6B00]/25 transition"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>START DAY 0{selectedDay.dayNumber} IN RUNNER</span>
          </button>
        </div>
      </div>

      {/* Planet Fitness Driver Quick Tips Section */}
      <div className="bg-[#12161E] border border-[#232B38] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E2532] pb-3">
          <div className="flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-[#FF6B00]" />
            <h3 className="font-heading font-black text-lg text-white uppercase tracking-wider">
              Commercial Gym Tactical Protocols for Truck Drivers
            </h3>
          </div>
          <span className="text-[11px] font-tactical text-slate-400 uppercase">
            Planet Fitness Specific
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ROAD_WARRIOR_TIPS.gymSpecifics.map((tip, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#161C26] border border-[#263142] space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#FF6B00] mb-1.5">
                  {idx === 0 && <Zap className="w-4 h-4" />}
                  {idx === 1 && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                  {idx === 2 && <Bed className="w-4 h-4 text-sky-400" />}
                  <h4 className="text-xs font-bold text-white font-tactical uppercase tracking-wide">
                    {tip.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-300 font-tactical leading-relaxed">
                  {tip.tip}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-r from-[#171E2B] via-[#141A24] to-[#171E2B] border border-[#263345] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/15 border border-[#FF6B00]/30 flex items-center justify-center text-[#FF6B00] shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white font-tactical uppercase tracking-wide">
                Need to Park Your 53' Rig Near a Gym?
              </h4>
              <p className="text-[11px] text-slate-400 font-tactical">
                Explore our curated database of Planet Fitness, Anytime Fitness, and 24-Hour locations verified with semi-truck staging and adjacent parking.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToGymMap}
            className="shrink-0 px-4 py-2.5 rounded-lg bg-[#FF6B00] hover:bg-[#FF8526] text-[#0A0D12] text-xs font-tactical font-black uppercase tracking-wider flex items-center gap-1.5 transition shadow"
          >
            <span>Open Gym GPS Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
