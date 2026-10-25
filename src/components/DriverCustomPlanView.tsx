import React, { useState, useEffect } from 'react';
import { 
  Award, 
  ShieldCheck, 
  Dumbbell, 
  Truck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  ChevronRight, 
  Download, 
  FileText, 
  UserPlus, 
  LogIn, 
  Mail, 
  Edit3,
  Calendar,
  Zap
} from 'lucide-react';
import { 
  DriverAccount, 
  CustomWorkoutPlan, 
  CoachingEnrollment, 
  TrainingDay, 
  WorkoutLogEntry 
} from '../types';
import { 
  getDriverEnrollment, 
  subscribeToDriverEnrollment, 
  enrollDriverInCoaching, 
  getDriverCustomPlans, 
  subscribeToDriverCustomPlans, 
  COACH_EMAIL 
} from '../lib/coaching';
import { 
  DifficultyToggle, 
  ExerciseDifficultyLevel, 
  getAdjustedExercise, 
  buildAdjustedTrainingDay 
} from '../lib/workoutDifficulty';

interface DriverCustomPlanViewProps {
  currentDriver: Omit<DriverAccount, 'passwordHash'> | null;
  onOpenAuth: () => void;
  onStartCustomWorkout: (day: TrainingDay) => void;
  onContactCoach: () => void;
  loggedWorkouts: WorkoutLogEntry[];
}

export const DriverCustomPlanView: React.FC<DriverCustomPlanViewProps> = ({
  currentDriver,
  onOpenAuth,
  onStartCustomWorkout,
  onContactCoach,
  loggedWorkouts
}) => {
  const [enrollment, setEnrollment] = useState<CoachingEnrollment | null>(null);
  const [customPlans, setCustomPlans] = useState<CustomWorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [exerciseDifficultyMap, setExerciseDifficultyMap] = useState<Record<string, ExerciseDifficultyLevel>>({});

  const getDifficultyForEx = (exId: string): ExerciseDifficultyLevel => {
    return exerciseDifficultyMap[exId] || 'Intermediate (As listed)';
  };

  const handleExerciseDifficultyChange = (exId: string, level: ExerciseDifficultyLevel) => {
    setExerciseDifficultyMap(prev => ({
      ...prev,
      [exId]: level
    }));
  };

  // Enrollment Form State
  const [rigType, setRigType] = useState('Hazmat Linehaul (Night Shift)');
  const [gearAvailable, setGearAvailable] = useState('Resistance Band + Rig Steps Only');
  const [shiftSchedule, setShiftSchedule] = useState('5 nights/week, 18:00 - 05:00 dispatch. 11h driving block.');
  const [painPoints, setPainPoints] = useState('Lower back stiffness from road vibration, tight hip flexors from long sitting.');
  const [goals, setGoals] = useState('Decompress spine, rebuild glute & core strength, avoid highway fatigue.');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Subscribe to driver enrollment and custom plans
  useEffect(() => {
    if (!currentDriver) {
      setEnrollment(null);
      setCustomPlans([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Initial fetch
    getDriverEnrollment(currentDriver.id).then((enr) => {
      setEnrollment(enr);
    });

    getDriverCustomPlans(currentDriver.id).then((plans) => {
      setCustomPlans(plans);
      setLoading(false);
    });

    // Real-time listener for enrollment
    const unsubEnroll = subscribeToDriverEnrollment(currentDriver.id, (enr) => {
      setEnrollment(enr);
    });

    // Real-time listener for custom plans
    const unsubPlans = subscribeToDriverCustomPlans(currentDriver.id, (plans) => {
      setCustomPlans(plans);
      setLoading(false);
    });

    return () => {
      unsubEnroll();
      unsubPlans();
    };
  }, [currentDriver?.id]);

  const handleSubmitEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDriver) {
      onOpenAuth();
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const res = await enrollDriverInCoaching({
      driverId: currentDriver.id,
      driverName: currentDriver.name,
      driverEmail: currentDriver.email,
      callsign: currentDriver.callsign,
      carrier: currentDriver.carrier,
      rigType,
      gearAvailable,
      shiftSchedule,
      painPointsOrInjuries: painPoints,
      primaryGoals: goals
    });

    if (res.success && res.enrollment) {
      setEnrollment(res.enrollment);
      setShowEnrollForm(false);
    } else {
      setErrorMsg(res.error || 'Failed to submit coaching request');
    }
    setSubmitting(false);
  };

  const activePlan = customPlans.find(p => p.status === 'active') || customPlans[0];

  // ========================================================
  // CASE 1: DRIVER IS NOT SIGNED IN
  // ========================================================
  if (!currentDriver) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-[#12161E] border-2 border-[#FF6B00]/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FF6B00]/20 border-2 border-[#FF6B00] flex items-center justify-center mx-auto text-[#FF6B00]">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <span className="px-3 py-1 rounded-lg bg-[#FF6B00] text-[#0A0D12] text-xs font-tactical font-black uppercase tracking-wider inline-block">
              1-ON-1 COACH AJ ROAD PROTOCOLS
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading">
              Custom Workout Plans for Enrolled Drivers
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Coach AJ Risner builds custom, individual road workout protocols for drivers signed up for 1-on-1 coaching. Sign in or create your driver account to access your assigned plan or apply for coaching.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-[#0A0D12] font-black font-tactical text-xs uppercase tracking-wider transition shadow-lg shadow-[#FF6B00]/25 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 stroke-[3]" />
              <span>Sign In / Create Driver Account</span>
            </button>
            <button
              onClick={onContactCoach}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#1A2230] hover:bg-[#253042] text-slate-200 border border-[#2D3A50] font-tactical text-xs uppercase font-bold transition flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Coach AJ Directly</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // CASE 2: DRIVER IS SIGNED IN, HAS AN ACTIVE CUSTOM PLAN
  // ========================================================
  if (activePlan) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Custom Plan Hero Banner */}
        <div className="bg-gradient-to-r from-[#141A25] via-[#10141D] to-[#141A25] border-2 border-[#FF6B00] rounded-2xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

          <div className="space-y-4 relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-[#FF6B00] text-[#0A0D12] text-xs font-tactical font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-[#FF6B00]/20">
                  <Award className="w-4 h-4" />
                  COACH AJ RISNER CUSTOM PROTOCOL
                </span>
                <span className="px-2.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] font-tactical font-black uppercase">
                  ACTIVE PLAN
                </span>
              </div>

              <span className="text-xs font-tactical text-slate-400">
                Assigned to: <strong className="text-white">{currentDriver.name}</strong> • Updated {new Date(activePlan.assignedDate).toLocaleDateString()}
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-heading tracking-wide">
                {activePlan.planTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mt-1.5 leading-relaxed">
                {activePlan.planDescription}
              </p>
            </div>

            {/* Strategic Quick Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-tactical">
              <span className="px-3 py-1 rounded-lg bg-[#18202C] border border-[#273447] text-slate-300">
                FREQUENCY: <strong className="text-[#FF6B00]">{activePlan.targetDaysPerWeek} Days / Week</strong>
              </span>
              <span className="px-3 py-1 rounded-lg bg-[#18202C] border border-[#273447] text-slate-300">
                TRAINING DAYS: <strong className="text-white">{activePlan.trainingDays.length} Custom Days</strong>
              </span>
              <span className="px-3 py-1 rounded-lg bg-[#18202C] border border-[#273447] text-slate-300">
                HEAD COACH: <strong className="text-white">{activePlan.assignedBy}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Coach AJ's Directives & Equipment Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Directives */}
          <div className="md:col-span-2 bg-[#12161F] border border-[#222B3A] rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1F2735]">
              <Award className="w-4 h-4 text-[#FF6B00]" />
              <h3 className="text-sm font-black text-white font-heading uppercase tracking-wide">
                Coach AJ Operational Directives
              </h3>
            </div>

            {activePlan.customDirectives && activePlan.customDirectives.length > 0 ? (
              <ul className="space-y-2 text-xs text-slate-300">
                {activePlan.customDirectives.map((directive, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#171E2A] border border-[#253142]">
                    <span className="w-5 h-5 rounded-full bg-[#FF6B00]/20 text-[#FF6B00] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{directive}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">No specific directives specified.</p>
            )}
          </div>

          {/* Stowed Gear Needed */}
          <div className="bg-[#12161F] border border-[#222B3A] rounded-2xl p-5 shadow-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#1F2735]">
                <Dumbbell className="w-4 h-4 text-[#FF6B00]" />
                <h3 className="text-sm font-black text-white font-heading uppercase tracking-wide">
                  Equipment Needed
                </h3>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {activePlan.equipmentNeeded.map((eq, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-[#18202D] text-slate-200 border border-[#293649] text-xs font-tactical font-semibold"
                  >
                    {eq}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#1E2634]">
              <button
                onClick={onContactCoach}
                className="w-full py-2 px-3 rounded-lg bg-[#1A2230] hover:bg-[#253144] text-xs font-tactical text-[#FF6B00] font-bold uppercase transition flex items-center justify-center gap-1.5 border border-[#2E3C51]"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Message Coach AJ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Assigned Training Days */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white font-heading uppercase tracking-wide flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#FF6B00]" />
              <span>Assigned Training Days ({activePlan.trainingDays.length})</span>
            </h3>
            <span className="text-xs text-slate-400 font-tactical">
              Select a day below to run the workout with automated set timers
            </span>
          </div>

          <div className="space-y-5">
            {activePlan.trainingDays.map((day, dIdx) => (
              <div
                key={day.id || dIdx}
                className="bg-[#12161F] border-2 border-[#222B3A] hover:border-[#FF6B00]/60 rounded-2xl p-5 sm:p-6 shadow-xl transition space-y-4"
              >
                {/* Day Header & Start Button */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2635]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#1E2736] to-[#10141D] border-2 border-[#FF6B00] flex items-center justify-center text-white font-black font-heading text-lg shadow-md shadow-[#FF6B00]/20">
                      D{day.dayNumber || dIdx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base sm:text-lg font-black text-white font-heading uppercase tracking-wide">
                          {day.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded bg-[#1C2534] text-slate-300 text-[10px] font-tactical font-bold">
                          {day.durationMinutes} MIN
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-tactical mt-0.5">
                        Target: <strong className="text-white">{day.targetFocus}</strong> • {day.recommendedTime}
                      </p>
                    </div>
                  </div>

                  {/* Primary Start Workout Action */}
                  <button
                    onClick={() => onStartCustomWorkout(buildAdjustedTrainingDay(day, exerciseDifficultyMap))}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-[#0A0D12] text-xs font-tactical font-black uppercase tracking-wider transition shadow-lg shadow-[#FF6B00]/25 flex items-center justify-center gap-2 shrink-0"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Day {day.dayNumber || dIdx + 1} Workout</span>
                  </button>
                </div>

                {/* Day Exercises List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-tactical text-slate-300 uppercase tracking-wider font-bold block">
                      PROGRAMMED RIG MOVEMENTS ({day.exercises.length}):
                    </span>
                    <span className="text-xs font-tactical text-emerald-400 font-bold">
                      PACE: Slow and controlled
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {day.exercises.map((ex, exIdx) => {
                      const exId = ex.id || `custom-ex-${dIdx}-${exIdx}`;
                      const currentDiff = getDifficultyForEx(exId);
                      const adjusted = getAdjustedExercise(ex, currentDiff);

                      return (
                        <div
                          key={exId}
                          className="bg-[#161C26] border border-[#253042] hover:border-[#38465B] rounded-xl p-4 space-y-3 flex flex-col justify-between transition"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-full bg-[#1F2938] text-[#FF6B00] text-[10px] font-bold flex items-center justify-center shrink-0">
                                    {exIdx + 1}
                                  </span>
                                  <h5 className="text-xs sm:text-sm font-bold text-white uppercase font-heading">
                                    {ex.name}
                                  </h5>
                                </div>
                                <span className="text-[11px] text-slate-400 block mt-1">
                                  Anchor: <strong className="text-slate-300">{ex.rigAnchor}</strong> ({ex.equipment})
                                </span>
                              </div>

                              <span className="px-2 py-0.5 rounded bg-[#1C2534] text-[#FF6B00] border border-[#2B394D] text-[11px] font-mono font-bold shrink-0">
                                {adjusted.sets} sets × {adjusted.repsOrDuration}
                              </span>
                            </div>

                            {/* Individual Exercise Difficulty Toggle */}
                            <div className="bg-[#0B0E14] p-2 rounded-lg border border-[#1E2533] flex flex-col gap-1.5 w-full min-w-0">
                              <div className="flex items-center justify-between gap-2 min-w-0">
                                <span className="text-[10px] font-tactical uppercase font-bold text-slate-400 shrink-0">
                                  Difficulty Toggle:
                                </span>
                                <span className={`text-[10px] font-tactical font-bold px-2 py-0.5 rounded border truncate ${adjusted.levelBadge.colorClasses}`}>
                                  {adjusted.levelBadge.label} • {adjusted.levelBadge.sublabel}
                                </span>
                              </div>
                              <DifficultyToggle
                                currentLevel={currentDiff}
                                onChange={(lvl) => handleExerciseDifficultyChange(exId, lvl)}
                                size="sm"
                              />
                            </div>

                            {/* Quick Specs Strip */}
                            <div className="grid grid-cols-2 gap-2 text-[11px] font-tactical bg-[#0E131A] p-2 rounded-lg border border-[#1A222F]">
                              <div>
                                <span className="text-[10px] text-slate-500 uppercase block font-bold">PACE:</span>
                                <span className="text-emerald-400 font-bold">{adjusted.tempo || 'Slow and controlled'}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 uppercase block font-bold">RECOVERY:</span>
                                <span className="text-slate-300 font-bold">{adjusted.restSeconds}s Rest</span>
                              </div>
                            </div>

                            <div className="p-2 rounded-lg bg-[#0F131A] border border-[#1E2533] text-[11px] text-slate-300">
                              <span className="text-[#FF6B00] font-bold block mb-0.5 font-tactical text-[10px] uppercase">
                                COACH AJ CUE (SLOW &amp; CONTROLLED):
                              </span>
                              "{adjusted.coachingCue}"
                            </div>
                          </div>

                          {ex.posturalBenefit && (
                            <div className="pt-2 border-t border-[#1E2736] text-[10px] text-emerald-400 font-tactical flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>{ex.posturalBenefit}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // CASE 3: DRIVER IS ENROLLED, BUT PLAN IS BEING BUILT
  // ========================================================
  if (enrollment) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-[#12161E] border-2 border-amber-500/60 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#212A38]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-amber-400">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-tactical font-black uppercase tracking-wider inline-block">
                  ENROLLED IN COACHING
                </span>
                <h3 className="text-xl font-black text-white font-heading uppercase tracking-wide mt-1">
                  Coach AJ Is Reviewing Your Driver Profile
                </h3>
              </div>
            </div>

            <button
              onClick={onContactCoach}
              className="px-4 py-2 rounded-xl bg-[#1C2433] hover:bg-[#273347] text-slate-200 border border-[#2E3C51] text-xs font-tactical uppercase font-bold transition flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Contact Coach AJ</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Your application for 1-on-1 coaching has been received. Coach AJ is tailoring your custom road split around your specific route constraints, equipment stowed on your rig, and joint health history. As soon as Coach AJ uploads your plan, it will appear here instantly.
          </p>

          {/* Submitted Specs */}
          <div className="bg-[#161C26] border border-[#253042] rounded-xl p-4 space-y-2 text-xs text-slate-300">
            <span className="text-[10px] font-tactical text-[#FF6B00] uppercase tracking-wider font-bold block mb-1">
              Your Submitted Operational Specs:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div><strong>Rig Division:</strong> {enrollment.rigType}</div>
              <div><strong>Stowed Gear:</strong> {enrollment.gearAvailable}</div>
              <div><strong>Shift Schedule:</strong> {enrollment.shiftSchedule}</div>
              <div><strong>Ailments/Pains:</strong> {enrollment.painPointsOrInjuries || 'None specified'}</div>
            </div>
          </div>

          {/* In the Meantime Guidance */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#17202C] to-[#121721] border border-[#273549] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-white uppercase font-heading">
                In the meantime: Execute the Rest Stop Split or Light DB Program
              </h4>
              <p className="text-[11px] text-slate-400 font-tactical mt-0.5">
                Maintain mobility and disc health with the field-tested base protocols built into Linehaul Strong.
              </p>
            </div>
            <span className="text-xs font-tactical text-[#FF6B00] font-bold shrink-0">
              {loggedWorkouts.length} Workouts Logged
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // CASE 4: DRIVER IS SIGNED IN, BUT NOT YET ENROLLED
  // ========================================================
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Intro Header */}
      <div className="bg-[#12161E] border-2 border-[#FF6B00]/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-[#FF6B00] text-[#0A0D12] text-xs font-tactical font-black uppercase tracking-wider">
              1-ON-1 ROAD COACHING
            </span>
            <span className="text-xs font-tactical text-slate-400">
              Driver: <strong className="text-white">{currentDriver.name}</strong>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-heading">
            Sign Up for 1-on-1 Remote Coaching with Coach AJ
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Get an individualized road workout plan uploaded directly to your driver terminal. Programmed around your exact sleeper dimensions, stowed gear, and dispatch layover schedule by founder AJ Risner (ISSA Elite Trainer).
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/60 border border-rose-500 rounded-xl text-rose-300 text-xs font-tactical font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Enrollment Form */}
        <form onSubmit={handleSubmitEnrollment} className="space-y-4 pt-2 border-t border-[#1F2735]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-tactical text-slate-300 uppercase font-bold block mb-1">
                Rig Type / Route Division:
              </label>
              <select
                value={rigType}
                onChange={(e) => setRigType(e.target.value)}
                className="w-full bg-[#181F2B] border border-[#2C384B] rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="Hazmat Linehaul (Night Shift)">Hazmat Linehaul (Night Shift)</option>
                <option value="Commercial Heavy Haul / Oversize">Heavy Haul / Oversize</option>
                <option value="OTR Dry Van / Reefer (48-State)">OTR Dry Van / Reefer (48-State)</option>
                <option value="Flatbed / Cargo Securing">Flatbed / Specialized</option>
                <option value="Day Cab / Local P&D">Day Cab / Local P&D</option>
                <option value="Military Motor Transport">Military / Tactical Logistics</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-tactical text-slate-300 uppercase font-bold block mb-1">
                Available Gear Stowed on Your Truck:
              </label>
              <select
                value={gearAvailable}
                onChange={(e) => setGearAvailable(e.target.value)}
                className="w-full bg-[#181F2B] border border-[#2C384B] rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
              >
                <option value="Resistance Band + Rig Steps Only">Resistance Band + Rig Steps Only</option>
                <option value="Light Dumbbells (10-25 lbs) + Band">Light Dumbbells (10-25 lbs) + Band</option>
                <option value="Bodyweight & Truck Frame Only">Bodyweight & Truck Frame Only</option>
                <option value="Adjustable Dumbbells / Kettlebell">Adjustable Dumbbells / Kettlebell</option>
                <option value="Commercial Gym Black Card Access">Commercial Gym Black Card Access (PF/Anytime)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-tactical text-slate-300 uppercase font-bold block mb-1">
              Your Typical Weekly Driving & Layover Schedule:
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 5 nights/week, 18:00 - 05:00 dispatch. 11h driving block."
              value={shiftSchedule}
              onChange={(e) => setShiftSchedule(e.target.value)}
              className="w-full bg-[#181F2B] border border-[#2C384B] rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          <div>
            <label className="text-xs font-tactical text-slate-300 uppercase font-bold block mb-1">
              Physical Road Aches, Joint Stiffness, or Past Injuries:
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Lower back stiffness from road vibration, tight hip flexors, right shoulder impingement."
              value={painPoints}
              onChange={(e) => setPainPoints(e.target.value)}
              className="w-full bg-[#181F2B] border border-[#2C384B] rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          <div>
            <label className="text-xs font-tactical text-slate-300 uppercase font-bold block mb-1">
              Primary Goals for 1-on-1 Coaching:
            </label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Rebuild core strength to stop back spasms, drop 20 lbs of truck stop fat, build endurance for tarping."
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              className="w-full bg-[#181F2B] border border-[#2C384B] rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-[#0A0D12] font-black font-tactical text-xs uppercase tracking-wider transition shadow-lg shadow-[#FF6B00]/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{submitting ? 'Submitting Application...' : 'Submit Coaching Application to Coach AJ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
