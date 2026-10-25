import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Upload, 
  FileText, 
  UserCheck, 
  Truck, 
  Dumbbell, 
  CheckCircle2, 
  Clock, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Download, 
  AlertCircle, 
  ChevronRight, 
  ChevronDown, 
  Activity, 
  Send,
  X,
  Code,
  ShieldAlert
} from 'lucide-react';
import { 
  CoachingEnrollment, 
  CustomWorkoutPlan, 
  TrainingDay, 
  Exercise, 
  WorkoutLogEntry, 
  DriverAccount 
} from '../types';
import { 
  getAllCoachingEnrollments, 
  uploadCustomWorkoutPlan, 
  getDriverCustomPlans, 
  deleteCustomPlan, 
  COACH_PRESET_TEMPLATES, 
  COACH_EMAIL,
  isCoachUser
} from '../lib/coaching';

interface CoachPortalViewProps {
  currentDriver: Omit<DriverAccount, 'passwordHash'> | null;
  onNavigateToDriverPlan?: () => void;
}

export const CoachPortalView: React.FC<CoachPortalViewProps> = ({
  currentDriver,
  onNavigateToDriverPlan
}) => {
  const [enrollments, setEnrollments] = useState<CoachingEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'needs-plan' | 'plan-active'>('all');
  const [selectedDriverForPlan, setSelectedDriverForPlan] = useState<CoachingEnrollment | null>(null);
  const [viewingDriverPlans, setViewingDriverPlans] = useState<{ driver: CoachingEnrollment; plans: CustomWorkoutPlan[] } | null>(null);
  
  // Custom Plan Builder State
  const [builderMode, setBuilderMode] = useState<'template' | 'file' | 'manual' | 'json'>('template');
  const [planTitle, setPlanTitle] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [targetDaysPerWeek, setTargetDaysPerWeek] = useState(3);
  const [directivesText, setDirectivesText] = useState('');
  const [equipmentText, setEquipmentText] = useState('Rig / Grab Rail, Resistance Band, Sleeper Berth, Cab Step');
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const [rawJsonText, setRawJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  const isAuthorizedCoach = isCoachUser(currentDriver?.email);

  // Load all enrolled drivers only if authorized as Coach AJ
  useEffect(() => {
    if (isAuthorizedCoach) {
      loadEnrollments();
    }
  }, [isAuthorizedCoach]);

  const loadEnrollments = async () => {
    setLoading(true);
    try {
      const list = await getAllCoachingEnrollments();
      setEnrollments(list);
    } catch (err) {
      console.error('Failed to load enrollments', err);
    } finally {
      setLoading(false);
    }
  };

  // Pre-load a preset template into builder
  const loadPresetTemplate = (idx: number) => {
    const tmpl = COACH_PRESET_TEMPLATES[idx];
    if (!tmpl) return;

    setPlanTitle(tmpl.planTitle);
    setPlanDescription(tmpl.planDescription);
    setTargetDaysPerWeek(tmpl.targetDaysPerWeek);
    setDirectivesText(tmpl.customDirectives.join('\n'));
    setEquipmentText(tmpl.equipmentNeeded.join(', '));
    setTrainingDays(JSON.parse(JSON.stringify(tmpl.trainingDays)));
    setRawJsonText(JSON.stringify({
      planTitle: tmpl.planTitle,
      planDescription: tmpl.planDescription,
      targetDaysPerWeek: tmpl.targetDaysPerWeek,
      customDirectives: tmpl.customDirectives,
      equipmentNeeded: tmpl.equipmentNeeded,
      trainingDays: tmpl.trainingDays
    }, null, 2));
    setBuilderMode('manual');
  };

  // Open plan upload modal for a driver
  const handleOpenPlanModal = (driver: CoachingEnrollment) => {
    setSelectedDriverForPlan(driver);
    setUploadSuccessMessage(null);
    setJsonError(null);

    // Default to template 0 if empty
    if (trainingDays.length === 0) {
      loadPresetTemplate(0);
    }
  };

  // Handle JSON file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed.planTitle || !parsed.trainingDays || !Array.isArray(parsed.trainingDays)) {
          setJsonError('Uploaded JSON must contain "planTitle" and a "trainingDays" array.');
          return;
        }

        setPlanTitle(parsed.planTitle);
        setPlanDescription(parsed.planDescription || '');
        setTargetDaysPerWeek(parsed.targetDaysPerWeek || 3);
        setDirectivesText(Array.isArray(parsed.customDirectives) ? parsed.customDirectives.join('\n') : (parsed.customDirectives || ''));
        setEquipmentText(Array.isArray(parsed.equipmentNeeded) ? parsed.equipmentNeeded.join(', ') : (parsed.equipmentNeeded || ''));
        setTrainingDays(parsed.trainingDays);
        setRawJsonText(JSON.stringify(parsed, null, 2));
        setJsonError(null);
        setBuilderMode('manual');
      } catch (err: any) {
        setJsonError(`Invalid JSON file format: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Handle Deploying custom plan to driver
  const handleDeployPlan = async () => {
    if (!selectedDriverForPlan) return;
    if (!planTitle.trim()) {
      setJsonError('Plan Title is required.');
      return;
    }
    if (trainingDays.length === 0) {
      setJsonError('At least 1 Training Day is required.');
      return;
    }

    setIsDeploying(true);
    setJsonError(null);

    try {
      const customDirectives = directivesText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const equipmentNeeded = equipmentText
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const planId = `plan-${Date.now()}`;
      const newPlan: CustomWorkoutPlan = {
        id: planId,
        driverId: selectedDriverForPlan.driverId,
        driverName: selectedDriverForPlan.driverName,
        driverEmail: selectedDriverForPlan.driverEmail,
        planTitle: planTitle.trim(),
        planDescription: planDescription.trim() || 'Custom road training protocol assigned by Coach AJ Risner.',
        assignedBy: 'AJ Risner (ISSA Elite Trainer)',
        coachEmail: COACH_EMAIL,
        assignedDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
        status: 'active',
        targetDaysPerWeek: Number(targetDaysPerWeek) || 3,
        customDirectives: customDirectives.length > 0 ? customDirectives : [
          'Maintain a slow and controlled pace during all movements.',
          'Decompress lower back before 10-hour sleeper reset.'
        ],
        equipmentNeeded: equipmentNeeded.length > 0 ? equipmentNeeded : ['Rig / Grab Rail', 'Resistance Band'],
        trainingDays
      };

      const result = await uploadCustomWorkoutPlan(newPlan);
      if (result.success) {
        setUploadSuccessMessage(`Successfully deployed "${newPlan.planTitle}" to ${selectedDriverForPlan.driverName}!`);
        await loadEnrollments();
        setTimeout(() => {
          setSelectedDriverForPlan(null);
          setUploadSuccessMessage(null);
        }, 2500);
      } else {
        setJsonError(result.error || 'Failed to deploy custom plan');
      }
    } catch (err: any) {
      setJsonError(err.message || 'Error deploying plan');
    } finally {
      setIsDeploying(false);
    }
  };

  // Download Sample JSON template
  const handleDownloadSampleJson = () => {
    const sample = COACH_PRESET_TEMPLATES[0];
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linehaul_custom_plan_template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // View existing plans for a driver
  const handleViewDriverPlans = async (driver: CoachingEnrollment) => {
    try {
      const plans = await getDriverCustomPlans(driver.driverId);
      setViewingDriverPlans({ driver, plans });
    } catch (e) {
      console.error('Failed to get driver plans', e);
    }
  };

  // Filtered drivers list
  const filteredDrivers = enrollments.filter(driver => {
    const matchesSearch = 
      driver.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.driverEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (driver.callsign && driver.callsign.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (driver.carrier && driver.carrier.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterStatus === 'needs-plan') {
      return driver.status === 'enrolled' && !driver.hasCustomPlan;
    }
    if (filterStatus === 'plan-active') {
      return driver.status === 'plan-active' || driver.hasCustomPlan;
    }
    return true;
  });

  // Authorization gate: Strictly guard Coach Portal so only Coach AJ can view it
  if (!isAuthorizedCoach) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-12 px-4">
        <div className="rounded-2xl bg-[#0F131A] border-2 border-rose-800/60 p-6 sm:p-8 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-950/40 border-2 border-rose-600/70 flex items-center justify-center mx-auto shadow-lg shadow-rose-900/20">
            <ShieldAlert className="w-8 h-8 text-rose-500 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-800/80 text-[10px] font-tactical font-black uppercase tracking-wider">
              AUTHORIZED ACCESS ONLY
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-heading uppercase text-white tracking-wide">
              Coach AJ Risner Portal
            </h2>
            <p className="text-sm text-slate-300 max-w-lg mx-auto">
              This command portal is restricted exclusively to Coach AJ Risner (<span className="text-[#FF6B00] font-mono font-bold">{COACH_EMAIL}</span>) for uploading tailored workout protocols and reviewing driver rosters.
            </p>
          </div>

          <div className="bg-[#141A24] border border-[#232D3D] rounded-xl p-4 max-w-md mx-auto text-xs text-slate-400 font-tactical space-y-1 text-left">
            <p className="text-slate-300 font-bold uppercase tracking-wider">Authentication Status:</p>
            {currentDriver ? (
              <p className="text-rose-400">
                Logged in as: <strong className="text-white">{currentDriver.name}</strong> ({currentDriver.email || 'No email associated'}). You do not hold coach administrative credentials.
              </p>
            ) : (
              <p className="text-amber-400">
                Not signed in. Coach AJ Risner must sign in with his coach administrator email.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {onNavigateToDriverPlan && (
              <button
                onClick={onNavigateToDriverPlan}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1C2533] hover:bg-[#253245] text-white border border-[#2F3E54] text-xs font-tactical font-bold uppercase transition"
              >
                Go to Driver Custom Plan
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Coach AJ Command Header */}
      <div className="bg-gradient-to-r from-[#141A24] via-[#10151E] to-[#141A24] border-2 border-[#FF6B00]/40 rounded-2xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-[#FF6B00] text-[#0A0D12] text-xs font-tactical font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-[#FF6B00]/20">
                <Award className="w-4 h-4" />
                COACH AJ RISNER COMMAND
              </span>
              <span className="text-xs font-mono font-bold text-slate-300 bg-[#1A2230] px-2.5 py-0.5 rounded border border-[#2D3A50]">
                {COACH_EMAIL}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] font-tactical font-bold">
                VERIFIED HEAD COACH
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-heading tracking-wide">
              Driver 1-on-1 Coaching & Custom Workout Uploader
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Manage signed-in commercial drivers enrolled in your 1-on-1 coaching program. Review their route types, stowed cab equipment, and physical ailments, then upload or build individualized workout plans tailored to their specific rig and layover rhythm.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5 shrink-0 w-full md:w-auto">
            <div className="bg-[#19212D] border border-[#293649] p-3 rounded-xl text-center">
              <span className="text-[10px] font-tactical text-slate-400 uppercase tracking-wider block">
                Total Enrolled
              </span>
              <span className="text-xl font-heading font-black text-white">
                {enrollments.length}
              </span>
            </div>
            <div className="bg-[#19212D] border border-[#293649] p-3 rounded-xl text-center">
              <span className="text-[10px] font-tactical text-amber-400 uppercase tracking-wider block">
                Needs Plan
              </span>
              <span className="text-xl font-heading font-black text-amber-400">
                {enrollments.filter(e => !e.hasCustomPlan && e.status === 'enrolled').length}
              </span>
            </div>
            <div className="bg-[#19212D] border border-[#293649] p-3 rounded-xl text-center">
              <span className="text-[10px] font-tactical text-emerald-400 uppercase tracking-wider block">
                Plan Active
              </span>
              <span className="text-xl font-heading font-black text-emerald-400">
                {enrollments.filter(e => e.hasCustomPlan || e.status === 'plan-active').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="bg-[#11151C] border border-[#202735] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search driver by name, callsign, carrier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#171D27] border border-[#293547] rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FF6B00]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-tactical font-bold uppercase transition ${
              filterStatus === 'all'
                ? 'bg-[#FF6B00] text-[#0A0D12]'
                : 'bg-[#181F2B] text-slate-300 hover:text-white border border-[#273447]'
            }`}
          >
            All Drivers ({enrollments.length})
          </button>
          <button
            onClick={() => setFilterStatus('needs-plan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-tactical font-bold uppercase transition ${
              filterStatus === 'needs-plan'
                ? 'bg-amber-500 text-[#0A0D12]'
                : 'bg-[#181F2B] text-slate-300 hover:text-white border border-[#273447]'
            }`}
          >
            Needs Plan ({enrollments.filter(e => !e.hasCustomPlan).length})
          </button>
          <button
            onClick={() => setFilterStatus('plan-active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-tactical font-bold uppercase transition ${
              filterStatus === 'plan-active'
                ? 'bg-emerald-600 text-white'
                : 'bg-[#181F2B] text-slate-300 hover:text-white border border-[#273447]'
            }`}
          >
            Plan Active ({enrollments.filter(e => e.hasCustomPlan).length})
          </button>

          <button
            onClick={loadEnrollments}
            className="p-1.5 rounded-lg bg-[#181F2B] border border-[#273447] text-slate-300 hover:text-[#FF6B00] transition"
            title="Refresh driver list"
          >
            <Activity className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Driver Coaching Roster Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-tactical bg-[#11151C] border border-[#202735] rounded-2xl">
          <div className="w-8 h-8 rounded-full border-2 border-[#FF6B00] border-t-transparent animate-spin mx-auto mb-3" />
          <span>Synchronizing Coaching Registry from Firestore...</span>
        </div>
      ) : filteredDrivers.length === 0 ? (
        <div className="bg-[#11151C] border border-[#202735] rounded-2xl p-10 text-center space-y-4">
          <Truck className="w-12 h-12 text-slate-500 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-white uppercase font-heading">
              No Coaching Clients Found
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              {searchQuery
                ? 'No drivers match your search query.'
                : 'Drivers who create an account and click "Sign Up for Coaching with Coach AJ" will appear here automatically.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDrivers.map((driver) => {
            const hasPlan = driver.hasCustomPlan || driver.status === 'plan-active';

            return (
              <div
                key={driver.driverId}
                className="bg-[#12161F] border border-[#232C3B] hover:border-[#354359] rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 transition"
              >
                {/* Driver Identity Card Top */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-white font-heading uppercase">
                          {driver.driverName}
                        </h4>
                        {driver.callsign && (
                          <span className="text-xs font-tactical text-[#FF6B00] font-bold">
                            "{driver.callsign}"
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-mono block">
                        {driver.driverEmail}
                      </span>
                    </div>

                    {/* Status Pill */}
                    {hasPlan ? (
                      <span className="px-2.5 py-1 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] font-tactical font-black uppercase tracking-wider shrink-0 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        PLAN ACTIVE
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-amber-950/80 text-amber-400 border border-amber-800 text-[10px] font-tactical font-black uppercase tracking-wider shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        NEEDS PLAN
                      </span>
                    )}
                  </div>

                  {/* Operational Rig & Gear Badges */}
                  <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-300 bg-[#161C26] p-3 rounded-xl border border-[#253042]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px] font-tactical uppercase">Rig / Division:</span>
                      <span className="font-semibold text-white">{driver.rigType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px] font-tactical uppercase">Stowed Gear:</span>
                      <span className="font-semibold text-white">{driver.gearAvailable}</span>
                    </div>
                    {driver.carrier && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px] font-tactical uppercase">Carrier / Authority:</span>
                        <span className="font-semibold text-[#FF6B00]">{driver.carrier}</span>
                      </div>
                    )}
                  </div>

                  {/* Driver Goals & Pain Points */}
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] font-tactical text-slate-400 uppercase tracking-wider block">
                        Driver Road Schedule:
                      </span>
                      <p className="text-slate-300 text-xs italic bg-[#0F131A] p-2 rounded border border-[#1F2633]">
                        {driver.shiftSchedule || 'No schedule notes provided.'}
                      </p>
                    </div>

                    {driver.painPointsOrInjuries && (
                      <div>
                        <span className="text-[10px] font-tactical text-rose-400 uppercase tracking-wider block">
                          Trouble Spots / Injuries:
                        </span>
                        <p className="text-rose-200 text-xs bg-rose-950/20 p-2 rounded border border-rose-900/30">
                          {driver.painPointsOrInjuries}
                        </p>
                      </div>
                    )}

                    {driver.primaryGoals && (
                      <div>
                        <span className="text-[10px] font-tactical text-[#FF6B00] uppercase tracking-wider block">
                          Primary Goals:
                        </span>
                        <p className="text-slate-300 text-xs bg-[#0F131A] p-2 rounded border border-[#1F2633]">
                          {driver.primaryGoals}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-[#1F2735] flex items-center gap-2">
                  <button
                    onClick={() => handleOpenPlanModal(driver)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-[#0A0D12] text-xs font-tactical font-black uppercase tracking-wider transition shadow-md shadow-[#FF6B00]/20"
                  >
                    <Upload className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{hasPlan ? 'Update Plan' : 'Upload Plan'}</span>
                  </button>

                  {hasPlan && (
                    <button
                      onClick={() => handleViewDriverPlans(driver)}
                      className="p-2.5 rounded-xl bg-[#1A2230] hover:bg-[#253042] text-slate-300 hover:text-white border border-[#2D3A50] transition"
                      title="Inspect assigned plan"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CUSTOM WORKOUT PLAN BUILDER & UPLOADER             */}
      {/* ========================================================= */}
      {selectedDriverForPlan && (
        <div className="fixed inset-0 z-50 bg-[#080A0C]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-[#12161F] border-2 border-[#FF6B00] rounded-2xl w-full max-w-4xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-[#171D27] border-b border-[#252F3F] p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/20 border border-[#FF6B00] flex items-center justify-center text-[#FF6B00]">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white font-heading uppercase tracking-wide">
                      Upload Custom Workout Plan
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-[#FF6B00] text-[#0A0D12] text-[10px] font-tactical font-black uppercase">
                      COACH DIRECTIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-tactical">
                    Assigning plan for Driver: <strong className="text-white">{selectedDriverForPlan.driverName}</strong> ({selectedDriverForPlan.driverEmail})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDriverForPlan(null)}
                className="p-2 rounded-lg bg-[#202735] hover:bg-[#2B3547] text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1">
              {/* Notifications */}
              {uploadSuccessMessage && (
                <div className="p-4 bg-emerald-950/60 border-2 border-emerald-500 rounded-xl text-emerald-300 text-xs font-tactical font-bold flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{uploadSuccessMessage}</span>
                </div>
              )}

              {jsonError && (
                <div className="p-4 bg-rose-950/60 border-2 border-rose-500 rounded-xl text-rose-300 text-xs font-tactical font-bold flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>{jsonError}</span>
                </div>
              )}

              {/* Mode Selection Tabs */}
              <div>
                <label className="text-xs font-tactical text-slate-400 uppercase font-bold block mb-2">
                  Choose Plan Upload Method:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setBuilderMode('template')}
                    className={`p-3 rounded-xl border text-xs font-tactical font-black uppercase tracking-wider text-center transition flex flex-col items-center gap-1.5 ${
                      builderMode === 'template'
                        ? 'bg-[#FF6B00] text-[#0A0D12] border-[#FF6B00]'
                        : 'bg-[#181F2B] text-slate-300 border-[#273447] hover:border-slate-500'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span>Coach Templates</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBuilderMode('file')}
                    className={`p-3 rounded-xl border text-xs font-tactical font-black uppercase tracking-wider text-center transition flex flex-col items-center gap-1.5 ${
                      builderMode === 'file'
                        ? 'bg-[#FF6B00] text-[#0A0D12] border-[#FF6B00]'
                        : 'bg-[#181F2B] text-slate-300 border-[#273447] hover:border-slate-500'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload JSON File</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBuilderMode('manual')}
                    className={`p-3 rounded-xl border text-xs font-tactical font-black uppercase tracking-wider text-center transition flex flex-col items-center gap-1.5 ${
                      builderMode === 'manual'
                        ? 'bg-[#FF6B00] text-[#0A0D12] border-[#FF6B00]'
                        : 'bg-[#181F2B] text-slate-300 border-[#273447] hover:border-slate-500'
                    }`}
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Visual Builder</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBuilderMode('json')}
                    className={`p-3 rounded-xl border text-xs font-tactical font-black uppercase tracking-wider text-center transition flex flex-col items-center gap-1.5 ${
                      builderMode === 'json'
                        ? 'bg-[#FF6B00] text-[#0A0D12] border-[#FF6B00]'
                        : 'bg-[#181F2B] text-slate-300 border-[#273447] hover:border-slate-500'
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    <span>Raw JSON Code</span>
                  </button>
                </div>
              </div>

              {/* Mode A: Preset Template Selector */}
              {builderMode === 'template' && (
                <div className="space-y-3 bg-[#161C26] p-4 rounded-xl border border-[#263345]">
                  <span className="text-xs font-tactical font-black text-[#FF6B00] uppercase tracking-wider block">
                    Select a Battle-Tested Linehaul Protocol Template to Customize:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {COACH_PRESET_TEMPLATES.map((tmpl, idx) => (
                      <div
                        key={idx}
                        onClick={() => loadPresetTemplate(idx)}
                        className="p-4 rounded-xl bg-[#1A2230] border border-[#2B394D] hover:border-[#FF6B00] cursor-pointer transition flex flex-col justify-between space-y-2 group"
                      >
                        <div>
                          <span className="px-2 py-0.5 rounded bg-[#FF6B00]/15 text-[#FF6B00] text-[10px] font-tactical font-black uppercase mb-1 inline-block">
                            {tmpl.targetDaysPerWeek} DAYS / WK
                          </span>
                          <h4 className="text-xs font-bold text-white uppercase font-heading group-hover:text-[#FF6B00] transition">
                            {tmpl.planTitle}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                            {tmpl.planDescription}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="w-full py-1.5 rounded-lg bg-[#242E3E] group-hover:bg-[#FF6B00] group-hover:text-[#0A0D12] text-xs font-tactical font-bold uppercase transition"
                        >
                          Load Template
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mode B: File Upload */}
              {builderMode === 'file' && (
                <div className="bg-[#161C26] p-6 rounded-xl border-2 border-dashed border-[#314055] text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/15 text-[#FF6B00] flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B00] text-[#0A0D12] text-xs font-tactical font-black uppercase hover:bg-[#E05E00] transition shadow-lg shadow-[#FF6B00]/20">
                      <span>Browse JSON Plan File</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-slate-400 mt-2">
                      Upload a formatted <code>.json</code> file prepared on your computer or phone.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleDownloadSampleJson}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-[#FF6B00] font-tactical underline"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Sample Plan JSON Template</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Mode D: Raw JSON Editor */}
              {builderMode === 'json' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-tactical text-slate-400 uppercase font-bold">
                      Raw JSON Plan Object:
                    </label>
                    <button
                      type="button"
                      onClick={handleDownloadSampleJson}
                      className="text-[11px] font-tactical text-[#FF6B00] hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Sample Template</span>
                    </button>
                  </div>
                  <textarea
                    rows={12}
                    value={rawJsonText}
                    onChange={(e) => {
                      setRawJsonText(e.target.value);
                      try {
                        const parsed = JSON.parse(e.target.value);
                        if (parsed.planTitle) setPlanTitle(parsed.planTitle);
                        if (parsed.planDescription) setPlanDescription(parsed.planDescription);
                        if (parsed.targetDaysPerWeek) setTargetDaysPerWeek(parsed.targetDaysPerWeek);
                        if (parsed.trainingDays) setTrainingDays(parsed.trainingDays);
                        setJsonError(null);
                      } catch {
                        // wait until valid json
                      }
                    }}
                    className="w-full bg-[#0D1016] border border-[#273345] rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              )}

              {/* Visual Plan Form Editor (Active in manual or after template/file load) */}
              <div className="space-y-4 pt-2 border-t border-[#222B3A]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-tactical text-slate-300 uppercase font-bold block mb-1">
                      Custom Plan Title:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Night Shift Hazmat: 3-Day Anti-Sitting & Spine Rebuild"
                      value={planTitle}
                      onChange={(e) => setPlanTitle(e.target.value)}
                      className="w-full bg-[#181F2B] border border-[#2C384B] rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-tactical text-slate-300 uppercase font-bold block mb-1">
                      Training Days / Week:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={7}
                      value={targetDaysPerWeek}
                      onChange={(e) => setTargetDaysPerWeek(Number(e.target.value))}
                      className="w-full bg-[#181F2B] border border-[#2C384B] rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-tactical text-slate-300 uppercase font-bold block mb-1">
                    Plan Overview & Strategy:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe how this program addresses the driver's specific route, aches, and truck constraints..."
                    value={planDescription}
                    onChange={(e) => setPlanDescription(e.target.value)}
                    className="w-full bg-[#181F2B] border border-[#2C384B] rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="text-xs font-tactical text-slate-300 uppercase font-bold block mb-1">
                    AJ Risner Personal Directives for this Driver (One per line):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g., Do Day 1 before your 11h driving block&#10;Never skip the sleeper decompression after uncoupling doubles&#10;Drink 1 electrolyte packet per 500-mile leg"
                    value={directivesText}
                    onChange={(e) => setDirectivesText(e.target.value)}
                    className="w-full bg-[#181F2B] border border-[#2C384B] rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="text-xs font-tactical text-slate-300 uppercase font-bold block mb-1">
                    Equipment Needed on the Rig (Comma separated):
                  </label>
                  <input
                    type="text"
                    placeholder="Rig / Grab Rail, Resistance Band, Sleeper Berth, Cab Step"
                    value={equipmentText}
                    onChange={(e) => setEquipmentText(e.target.value)}
                    className="w-full bg-[#181F2B] border border-[#2C384B] rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                {/* Training Days Breakdown Preview */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-tactical font-black text-white uppercase tracking-wider">
                      Assigned Training Days ({trainingDays.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newDayNumber = trainingDays.length + 1;
                        const newDay: TrainingDay = {
                          id: `custom-d${newDayNumber}-${Date.now()}`,
                          dayNumber: newDayNumber,
                          title: `Day ${newDayNumber}: Rig Mobility & Strength`,
                          subtitle: 'Custom Rig Protocol',
                          description: 'Tailored for linehaul recovery.',
                          targetFocus: 'Full Body & Core',
                          durationMinutes: 15,
                          equipmentRequired: ['Rig / Grab Rail', 'Resistance Band'],
                          recommendedTime: 'Pre-trip or 30-min break',
                          exercises: [
                            {
                              id: `ex-${Date.now()}`,
                              name: 'Grab-Rail Decompression Lat Hang',
                              targetArea: 'Spine & Lats',
                              equipment: 'Rig / Grab Rail',
                              rigAnchor: 'Cab Ingress Grab Rail',
                              sets: 3,
                              repsOrDuration: '45 seconds',
                              tempo: 'Slow and controlled',
                              restSeconds: 30,
                              coachingCue: 'Drop hips backward, breathe into lower ribs.',
                              posturalBenefit: 'Decompresses lumbar discs from road shock.',
                              stepGuide: [
                                'Grip cab rails with both hands.',
                                'Hinge hips back and breathe deeply.'
                              ]
                            }
                          ]
                        };
                        setTrainingDays([...trainingDays, newDay]);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1D2533] hover:bg-[#2A3548] text-xs font-tactical text-slate-200 border border-[#314055] transition"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#FF6B00]" />
                      <span>Add Day</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {trainingDays.map((day, dIdx) => (
                      <div
                        key={day.id || dIdx}
                        className="bg-[#161C26] border border-[#273447] rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg bg-[#FF6B00] text-[#0A0D12] font-black font-heading flex items-center justify-center text-xs">
                              D{day.dayNumber || dIdx + 1}
                            </span>
                            <input
                              type="text"
                              value={day.title}
                              onChange={(e) => {
                                const copy = [...trainingDays];
                                copy[dIdx].title = e.target.value;
                                setTrainingDays(copy);
                              }}
                              className="bg-[#1C2432] border border-[#2F3C50] rounded px-2.5 py-1 text-xs text-white font-bold font-heading uppercase focus:outline-none focus:border-[#FF6B00]"
                            />
                            <span className="text-[11px] font-tactical text-slate-400">
                              ({day.durationMinutes} min)
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setTrainingDays(trainingDays.filter((_, i) => i !== dIdx));
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 transition"
                            title="Remove Day"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Exercises List in Day */}
                        <div className="pl-9 space-y-2">
                          <span className="text-[10px] font-tactical text-slate-400 uppercase tracking-wider block">
                            Movements ({day.exercises.length}):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {day.exercises.map((ex, exIdx) => (
                              <div
                                key={ex.id || exIdx}
                                className="p-2.5 rounded-lg bg-[#1B2330] border border-[#2A374A] text-xs flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between">
                                    <strong className="text-white font-semibold">
                                      {exIdx + 1}. {ex.name}
                                    </strong>
                                    <span className="text-[10px] font-mono text-[#FF6B00]">
                                      {ex.sets} × {ex.repsOrDuration}
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-slate-400 block mt-0.5">
                                    Anchor: {ex.rigAnchor} • {ex.equipment}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-300 italic mt-1.5 border-t border-[#253244] pt-1">
                                  Cue: "{ex.coachingCue}"
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-[#171D27] border-t border-[#252F3F] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-400 font-tactical">
                Plan will be directly dispatched to <strong>{selectedDriverForPlan.driverName}'s</strong> cab terminal.
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedDriverForPlan(null)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#202837] hover:bg-[#2A3548] text-slate-300 font-tactical text-xs uppercase font-bold transition"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeployPlan}
                  disabled={isDeploying}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-[#0A0D12] text-xs font-tactical font-black uppercase tracking-wider transition shadow-lg shadow-[#FF6B00]/25 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isDeploying ? 'Deploying to Rig...' : 'Deploy Custom Plan to Driver'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: VIEW ASSIGNED PLANS FOR DRIVER                     */}
      {/* ========================================================= */}
      {viewingDriverPlans && (
        <div className="fixed inset-0 z-50 bg-[#080A0C]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-[#12161F] border-2 border-[#2F3D52] rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
            <div className="bg-[#171D27] border-b border-[#252F3F] p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-black text-white font-heading uppercase">
                  Custom Plans for {viewingDriverPlans.driver.driverName}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {viewingDriverPlans.driver.driverEmail}
                </span>
              </div>
              <button
                onClick={() => setViewingDriverPlans(null)}
                className="p-2 rounded-lg bg-[#202735] hover:bg-[#2B3547] text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {viewingDriverPlans.plans.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-tactical">
                  No custom workout plans found for this driver.
                </div>
              ) : (
                viewingDriverPlans.plans.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-xl bg-[#171E2B] border border-[#273549] space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white uppercase font-heading">
                            {p.planTitle}
                          </h4>
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-tactical uppercase font-bold border border-emerald-800">
                            {p.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">{p.planDescription}</p>
                      </div>

                      <button
                        onClick={async () => {
                          if (confirm(`Remove custom plan "${p.planTitle}"?`)) {
                            await deleteCustomPlan(viewingDriverPlans.driver.driverId, p.id);
                            const updated = viewingDriverPlans.plans.filter(x => x.id !== p.id);
                            setViewingDriverPlans({ ...viewingDriverPlans, plans: updated });
                            await loadEnrollments();
                          }
                        }}
                        className="p-1.5 rounded-lg bg-[#222B3A] hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-[#2F3C50] transition"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Directives */}
                    {p.customDirectives && p.customDirectives.length > 0 && (
                      <div className="bg-[#121620] p-3 rounded-lg border border-[#212B3B] text-xs">
                        <span className="text-[10px] font-tactical text-[#FF6B00] uppercase tracking-wider block mb-1">
                          Coach AJ Directives:
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-slate-300">
                          {p.customDirectives.map((d, i) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Days Count */}
                    <div className="flex items-center justify-between text-xs text-slate-400 font-tactical pt-2 border-t border-[#232F42]">
                      <span>{p.trainingDays.length} Custom Days Programmed</span>
                      <span>Assigned: {new Date(p.assignedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
