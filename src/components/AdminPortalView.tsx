import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
  CreditCard,
  Building2,
  Award,
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
  DollarSign,
  FileText,
  Lock,
  RefreshCw,
  ExternalLink,
  Sliders,
  Check,
  Mail,
  Phone,
  Truck
} from 'lucide-react';
import {
  DriverAccount,
  CoachingEnrollment,
  CustomWorkoutPlan,
  TrainingDay,
  Exercise,
  FleetQuoteInquiry,
  SquareConfig,
  SquareTransaction
} from '../types';
import {
  getAllCoachingEnrollments,
  uploadCustomWorkoutPlan,
  getDriverCustomPlans,
  deleteCustomPlan,
  COACH_PRESET_TEMPLATES,
  COACH_EMAIL,
  isAdminUser,
  isCoachUser
} from '../lib/coaching';
import { getAllDriversForAdmin } from '../lib/auth';
import { getSavedFleetInquiries, updateFleetInquiryStatus, saveActiveMembership } from '../lib/subscription';
import {
  getSquareConfig,
  saveSquareConfig,
  getSquareTransactions,
  recordSquareTransaction,
  generateFleetSquareInvoice,
  processSquarePayment
} from '../lib/square';

interface AdminPortalViewProps {
  currentDriver: Omit<DriverAccount, 'passwordHash'> | null;
  onAdminAuthenticated?: (driver: Omit<DriverAccount, 'passwordHash'>) => void;
  onNavigateToDriverPlan?: () => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  currentDriver,
  onAdminAuthenticated,
  onNavigateToDriverPlan
}) => {
  const isSuperAdmin = !!(currentDriver?.email && isAdminUser(currentDriver.email));

  // Navigation within Admin Portal
  const [activeAdminTab, setActiveAdminTab] = useState<'drivers' | 'plan-builder' | 'fleet-crm' | 'square-hub' | 'system'>('drivers');

  // Drivers Tab State
  const [driversList, setDriversList] = useState<Omit<DriverAccount, 'passwordHash'>[]>([]);
  const [enrollments, setEnrollments] = useState<CoachingEnrollment[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [driverSearch, setDriverSearch] = useState('');
  const [selectedDriverForAction, setSelectedDriverForAction] = useState<Omit<DriverAccount, 'passwordHash'> | null>(null);

  // Fleet Inquiries CRM State
  const [fleetInquiries, setFleetInquiries] = useState<FleetQuoteInquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<FleetQuoteInquiry | null>(null);
  const [inquiryNotes, setInquiryNotes] = useState('');
  const [carrierTruckCount, setCarrierTruckCount] = useState(25);
  const [ratePerTruck, setRatePerTruck] = useState(12);
  const [generatedInvoice, setGeneratedInvoice] = useState<{ invoiceId: string; totalAmount: number; checkoutUrl: string; discountPercent: number } | null>(null);

  // Square Payments State
  const [squareConfig, setSquareConfig] = useState<SquareConfig>(() => getSquareConfig());
  const [squareTransactions, setSquareTransactions] = useState<SquareTransaction[]>(() => getSquareTransactions());
  const [isSavingSquare, setIsSavingSquare] = useState(false);
  const [squareFeedback, setSquareFeedback] = useState<string | null>(null);
  const [isTestingPayment, setIsTestingPayment] = useState(false);

  // Plan Builder State (from Coach Portal)
  const [selectedDriverForPlan, setSelectedDriverForPlan] = useState<CoachingEnrollment | null>(null);
  const [builderMode, setBuilderMode] = useState<'template' | 'manual' | 'json'>('template');
  const [planTitle, setPlanTitle] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [targetDaysPerWeek, setTargetDaysPerWeek] = useState(3);
  const [directivesText, setDirectivesText] = useState('');
  const [equipmentText, setEquipmentText] = useState('Rig / Grab Rail, Resistance Band, Sleeper Berth, Cab Step');
  const [trainingDays, setTrainingDays] = useState<TrainingDay[]>([]);
  const [rawJsonText, setRawJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [planUploadFeedback, setPlanUploadFeedback] = useState<string | null>(null);
  const [isDeployingPlan, setIsDeployingPlan] = useState(false);

  // Load Admin Data
  useEffect(() => {
    if (isSuperAdmin) {
      loadAllAdminData();
    }
  }, [isSuperAdmin]);

  const loadAllAdminData = async () => {
    setIsLoadingData(true);
    try {
      const [drivers, enrollList] = await Promise.all([
        getAllDriversForAdmin(),
        getAllCoachingEnrollments()
      ]);
      setDriversList(drivers);
      setEnrollments(enrollList);
      setFleetInquiries(getSavedFleetInquiries());
      setSquareTransactions(getSquareTransactions());
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSaveSquareConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSquare(true);
    await saveSquareConfig(squareConfig);
    setIsSavingSquare(false);
    setSquareFeedback('Square settings and payment links saved successfully!');
    setTimeout(() => setSquareFeedback(null), 4000);
  };

  const handleTestSquarePayment = async () => {
    setIsTestingPayment(true);
    const result = await processSquarePayment({
      driverId: currentDriver?.id || 'admin_test_driver',
      driverName: currentDriver?.name || 'Coach AJ (Sandbox Test)',
      driverEmail: currentDriver?.email || 'risneraryan@gmail.com',
      planId: 'pro',
      amount: 30,
      paymentMethod: 'square_card',
      cardDetails: {
        cardNumber: '4111 1111 1111 1111',
        cardholderName: 'AJ Risner',
        expMonth: '12',
        expYear: '28',
        cvv: '999',
        postalCode: '90210'
      }
    });
    setIsTestingPayment(false);

    if (result.success && result.transaction) {
      setSquareTransactions(getSquareTransactions());
      setSquareFeedback(`Sandbox Test Payment successful! Transaction ID: ${result.transaction.squarePaymentId}`);
      setTimeout(() => setSquareFeedback(null), 6000);
    }
  };

  const handleUpdateInquiryStatus = async (
    id: string,
    status: FleetQuoteInquiry['status']
  ) => {
    await updateFleetInquiryStatus(id, status, inquiryNotes);
    const updated = getSavedFleetInquiries();
    setFleetInquiries(updated);
    if (selectedInquiry && selectedInquiry.id === id) {
      setSelectedInquiry({ ...selectedInquiry, status, adminNotes: inquiryNotes });
    }
  };

  const handleGenerateInvoice = (inquiry: FleetQuoteInquiry) => {
    const invoice = generateFleetSquareInvoice({
      carrierName: inquiry.companyName,
      contactEmail: inquiry.email,
      truckCount: carrierTruckCount,
      ratePerTruck: ratePerTruck
    });
    setGeneratedInvoice(invoice);
  };

  // Plan Builder Helpers
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

  const handleDeployPlan = async () => {
    if (!selectedDriverForPlan) {
      setJsonError('Please select a driver to assign this plan to.');
      return;
    }
    if (!planTitle.trim()) {
      setJsonError('Plan Title is required.');
      return;
    }
    if (trainingDays.length === 0) {
      setJsonError('At least 1 Training Day is required.');
      return;
    }

    setIsDeployingPlan(true);
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
        planDescription: planDescription.trim() || 'Custom road training protocol assigned by Super Admin Coach AJ Risner.',
        assignedBy: 'Coach AJ Risner (Head Trainer)',
        coachEmail: COACH_EMAIL,
        assignedDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
        status: 'active',
        targetDaysPerWeek: Number(targetDaysPerWeek) || 3,
        totalWeeks: 4,
        customDirectives,
        equipmentNeeded,
        trainingDays
      };

      const result = await uploadCustomWorkoutPlan(newPlan);
      if (result.success) {
        setPlanUploadFeedback(`Custom plan deployed to ${selectedDriverForPlan.driverName}!`);
        await loadAllAdminData();
        setTimeout(() => setPlanUploadFeedback(null), 5000);
      } else {
        setJsonError(result.error || 'Failed to deploy custom plan.');
      }
    } catch (e: any) {
      setJsonError(e?.message || 'Error creating plan.');
    } finally {
      setIsDeployingPlan(false);
    }
  };

  // If NOT Super Admin / Coach: Render strict security lockout screen
  if (!isSuperAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in">
        <div className="bg-[#10141C] border-2 border-rose-500/60 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border-2 border-rose-500 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500 text-rose-300 text-[11px] font-tactical font-black uppercase tracking-wider">
              RESTRICTED CLEARANCE • ADMIN CREDENTIALS REQUIRED
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-heading uppercase text-white tracking-wide">
              Linehaul Strong Command Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-tactical max-w-md mx-auto leading-relaxed">
              This area contains driver telemetry, carrier fleet quotes, custom workout assignments, and Square payment processing. Standard driver accounts do not have clearance.
            </p>
          </div>

          <div className="bg-[#161D28] border border-[#232F42] rounded-xl p-4 text-xs font-tactical text-left space-y-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Driver Isolation Policy</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Drivers cannot view other drivers' accounts, logs, fleet inquiries, or administrative payment settings. Clearance is strictly reserved for Head Coach & Administrator <span className="text-white font-bold">risneraryan@gmail.com</span>.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {onNavigateToDriverPlan && (
              <button
                type="button"
                onClick={onNavigateToDriverPlan}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1A2332] hover:bg-[#253245] text-slate-300 hover:text-white border border-[#2D3A4E] text-xs font-tactical font-bold uppercase tracking-wider transition"
              >
                Return to Driver Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Filtered drivers for search
  const filteredDrivers = driversList.filter((d) => {
    const term = driverSearch.toLowerCase();
    return (
      d.name.toLowerCase().includes(term) ||
      d.email.toLowerCase().includes(term) ||
      (d.callsign && d.callsign.toLowerCase().includes(term)) ||
      (d.carrier && d.carrier.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in pb-16">
      {/* Top Super Admin Banner */}
      <div className="bg-gradient-to-r from-[#171E2B] via-[#0E131C] to-[#171E2B] border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-[10px] font-tactical font-black uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                SUPER ADMIN & HEAD COACH CLEARANCE
              </span>
              <span className="text-xs font-tactical text-slate-400">
                ACTIVE USER: <span className="text-white font-bold">{currentDriver?.email || 'risneraryan@gmail.com'}</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-heading uppercase text-white tracking-wide">
              Linehaul Strong <span className="text-emerald-400">Admin Control Center</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-tactical max-w-3xl leading-relaxed">
              Full administrative access to all driver telemetry, custom rig programming, Carrier Fleet quote CRM, and Square payment gateway configuration. Drivers have zero visibility into this portal.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={loadAllAdminData}
              disabled={isLoadingData}
              className="px-3.5 py-2 rounded-xl bg-[#18212E] hover:bg-[#232F42] text-white border border-[#2F3E57] text-xs font-tactical font-bold uppercase flex items-center gap-2 transition"
              title="Refresh all data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isLoadingData ? 'animate-spin' : ''}`} />
              <span>Sync All</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-[#202B3B] text-xs font-tactical">
          <div className="bg-[#0B0F15] p-3 rounded-xl border border-[#1E2736]">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Registered Drivers</span>
            <span className="text-lg font-black text-white">{driversList.length || 1} Drivers</span>
          </div>

          <div className="bg-[#0B0F15] p-3 rounded-xl border border-[#1E2736]">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Carrier Fleet Quotes</span>
            <span className="text-lg font-black text-sky-400">{fleetInquiries.length} Inquiries</span>
          </div>

          <div className="bg-[#0B0F15] p-3 rounded-xl border border-[#1E2736]">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Square Ledger Balance</span>
            <span className="text-lg font-black text-[#FF6B00]">
              ${squareTransactions.reduce((acc, t) => acc + (t.status === 'COMPLETED' ? t.amount : 0), 0).toFixed(2)}
            </span>
          </div>

          <div className="bg-[#0B0F15] p-3 rounded-xl border border-[#1E2736]">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Square Gateway Mode</span>
            <span className={`text-lg font-black uppercase ${squareConfig.environment === 'production' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {squareConfig.environment}
            </span>
          </div>
        </div>
      </div>

      {/* Admin Sub-navigation Tabs */}
      <div className="flex border-b border-[#212C3D] gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveAdminTab('drivers')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-tactical font-black uppercase tracking-wider whitespace-nowrap transition border-b-2 ${
            activeAdminTab === 'drivers'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-950/20'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Drivers & Telemetry</span>
          <span className="px-1.5 py-0.2 rounded bg-[#1B2330] text-slate-300 text-[10px]">{driversList.length}</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('plan-builder')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-tactical font-black uppercase tracking-wider whitespace-nowrap transition border-b-2 ${
            activeAdminTab === 'plan-builder'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-950/20'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4 text-[#FF6B00]" />
          <span>Custom Plan Builder</span>
          <span className="px-1.5 py-0.2 rounded bg-[#1B2330] text-slate-300 text-[10px]">{enrollments.length}</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('fleet-crm')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-tactical font-black uppercase tracking-wider whitespace-nowrap transition border-b-2 ${
            activeAdminTab === 'fleet-crm'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-950/20'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4 text-sky-400" />
          <span>Carrier Fleet CRM</span>
          <span className="px-1.5 py-0.2 rounded bg-sky-950/60 text-sky-400 text-[10px]">{fleetInquiries.length}</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('square-hub')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-tactical font-black uppercase tracking-wider whitespace-nowrap transition border-b-2 ${
            activeAdminTab === 'square-hub'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-950/20'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4 text-[#FF6B00]" />
          <span>Square Payments Hub</span>
          <span className="px-1.5 py-0.2 rounded bg-[#FF6B00]/20 text-[#FF6B00] text-[10px]">{squareTransactions.length} TX</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: DRIVERS & TELEMETRY VAULT                                */}
      {/* ============================================================== */}
      {activeAdminTab === 'drivers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search drivers by name, email, carrier, or callsign..."
                value={driverSearch}
                onChange={(e) => setDriverSearch(e.target.value)}
                className="w-full bg-[#10141C] border border-[#242E3F] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-tactical"
              />
            </div>
            <div className="text-xs font-tactical text-slate-400 flex items-center gap-2">
              <span>Showing {filteredDrivers.length} of {driversList.length} driver accounts</span>
            </div>
          </div>

          <div className="bg-[#0F131A] border border-[#202937] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-tactical">
                <thead>
                  <tr className="bg-[#141923] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#202A3A]">
                    <th className="py-3 px-4 font-bold">Driver Name & Callsign</th>
                    <th className="py-3 px-4 font-bold">Email</th>
                    <th className="py-3 px-4 font-bold">Carrier</th>
                    <th className="py-3 px-4 font-bold">Role</th>
                    <th className="py-3 px-4 font-bold">Membership Tier</th>
                    <th className="py-3 px-4 font-bold text-center">Workouts Logged</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#18212D]">
                  {filteredDrivers.map((driver) => {
                    const isAdmin = isAdminUser(driver.email);
                    return (
                      <tr key={driver.id} className="hover:bg-[#141B26] transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{driver.name}</span>
                            {driver.callsign && (
                              <span className="text-[#FF6B00] text-[10px]">"{driver.callsign}"</span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">UID: {driver.id.slice(0, 10)}...</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {driver.email}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {driver.carrier || 'Independent Owner-Op'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            isAdmin
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-600/50'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {driver.role || 'driver'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            driver.membershipTier === 'pro'
                              ? 'bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40'
                              : driver.membershipTier === 'starter'
                              ? 'bg-amber-950/60 text-amber-300 border border-amber-700/50'
                              : 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/50'
                          }`}>
                            {driver.membershipTier || '14D Trial'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-white">
                          {driver.totalWorkoutsCompleted || 0}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedDriverForPlan({
                                id: driver.id,
                                driverId: driver.id,
                                driverName: driver.name,
                                driverEmail: driver.email,
                                callsign: driver.callsign,
                                carrier: driver.carrier,
                                enrolledAt: driver.createdAt,
                                status: 'enrolled',
                                rigType: 'Freightliner Cascadia / 53ft Van',
                                gearAvailable: 'Resistance Bands & Dumbbells',
                                shiftSchedule: 'Linehaul Night Run',
                                painPointsOrInjuries: 'Lumbar spine fatigue',
                                primaryGoals: 'DOT Physical blood pressure & strength',
                                lastUpdated: new Date().toISOString()
                              });
                              setActiveAdminTab('plan-builder');
                              loadPresetTemplate(0);
                            }}
                            className="px-2.5 py-1 rounded bg-[#1B2330] hover:bg-[#263245] text-emerald-400 text-[11px] font-tactical font-bold uppercase transition inline-flex items-center gap-1"
                          >
                            <Award className="w-3 h-3 text-[#FF6B00]" />
                            <span>Assign Plan</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredDrivers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No drivers matching "{driverSearch}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: CUSTOM PLAN BUILDER                                      */}
      {/* ============================================================== */}
      {activeAdminTab === 'plan-builder' && (
        <div className="space-y-6">
          <div className="bg-[#10141C] border border-[#242E3F] rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2736] pb-4">
              <div>
                <h3 className="text-base font-black font-heading uppercase text-white tracking-wide">
                  1-on-1 Driver Plan Deployment
                </h3>
                <p className="text-xs text-slate-400 font-tactical">
                  Build and assign custom in-cab or rig-side training protocols to any registered driver.
                </p>
              </div>

              {selectedDriverForPlan ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-xs font-tactical">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">Assigning To:</span>
                  <span className="font-bold text-white">{selectedDriverForPlan.driverName}</span>
                  <button
                    onClick={() => setSelectedDriverForPlan(null)}
                    className="text-slate-400 hover:text-white p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="text-xs font-tactical text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Select a driver from the Drivers tab or choose an enrolled driver below</span>
                </div>
              )}
            </div>

            {/* Template Quick Loaders */}
            <div className="space-y-2">
              <span className="text-[10px] font-tactical font-black text-slate-400 uppercase tracking-wider block">
                Load Coach AJ Preset Protocols:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {COACH_PRESET_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => loadPresetTemplate(idx)}
                    className="p-3 rounded-xl bg-[#151C26] hover:bg-[#1E2838] border border-[#243042] text-left transition space-y-1"
                  >
                    <div className="text-xs font-black text-white line-clamp-1">{tmpl.planTitle}</div>
                    <div className="text-[10px] text-slate-400">{tmpl.targetDaysPerWeek} Days / Wk • {tmpl.equipmentNeeded.slice(0, 2).join(', ')}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-tactical pt-2">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-slate-400 uppercase font-bold text-[10px]">Plan Title *</label>
                <input
                  type="text"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  placeholder="e.g. Night Shift Hazmat: 3-Day Anti-Sitting"
                  className="w-full bg-[#18202C] border border-[#2B394D] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400 font-tactical"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 uppercase font-bold text-[10px]">Target Days / Week</label>
                <select
                  value={targetDaysPerWeek}
                  onChange={(e) => setTargetDaysPerWeek(Number(e.target.value))}
                  className="w-full bg-[#18202C] border border-[#2B394D] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400 font-tactical"
                >
                  <option value={2}>2 Days / Week</option>
                  <option value={3}>3 Days / Week (Recommended)</option>
                  <option value={4}>4 Days / Week</option>
                  <option value={5}>5 Days / Week</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 text-xs font-tactical">
              <label className="text-slate-400 uppercase font-bold text-[10px]">Plan Description</label>
              <textarea
                rows={2}
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                placeholder="Tactical objectives and targeted benefits for this driver..."
                className="w-full bg-[#18202C] border border-[#2B394D] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400 font-tactical resize-none"
              />
            </div>

            <div className="space-y-1 text-xs font-tactical">
              <label className="text-slate-400 uppercase font-bold text-[10px]">Custom Coach Directives (One per line)</label>
              <textarea
                rows={3}
                value={directivesText}
                onChange={(e) => setDirectivesText(e.target.value)}
                placeholder="Perform Day 1 before driving shift&#10;Drink minimum 20oz electrolyte water&#10;Decompress spine after uncoupling"
                className="w-full bg-[#18202C] border border-[#2B394D] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400 font-tactical resize-none"
              />
            </div>

            {/* Training Days Preview */}
            <div className="space-y-2 pt-2 border-t border-[#1C2534]">
              <span className="text-[10px] font-tactical font-black text-slate-400 uppercase tracking-wider block">
                Configured Training Days ({trainingDays.length})
              </span>
              <div className="space-y-2">
                {trainingDays.map((d, dIdx) => (
                  <div key={d.id || dIdx} className="bg-[#141A24] p-3 rounded-xl border border-[#222E40] text-xs font-tactical flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">Day {d.dayNumber}: {d.title}</span>
                      <span className="text-[10px] text-slate-400 block">{d.exercises?.length || 0} exercises • {d.durationMinutes || 15} minutes</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-600/40">
                      {d.targetFocus}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback / Errors */}
            {jsonError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-600/50 text-rose-300 text-xs font-tactical flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{jsonError}</span>
              </div>
            )}

            {planUploadFeedback && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-600/50 text-emerald-300 text-xs font-tactical flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{planUploadFeedback}</span>
              </div>
            )}

            <button
              onClick={handleDeployPlan}
              disabled={isDeployingPlan}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-[#090D14] text-xs font-tactical font-black uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isDeployingPlan ? 'Deploying...' : `Deploy Plan to ${selectedDriverForPlan ? selectedDriverForPlan.driverName : 'Driver'}`}</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: CARRIER FLEET CRM                                        */}
      {/* ============================================================== */}
      {activeAdminTab === 'fleet-crm' && (
        <div className="space-y-6">
          <div className="bg-[#10141C] border border-[#242E3F] rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2736] pb-4">
              <div>
                <h3 className="text-base font-black font-heading uppercase text-white tracking-wide">
                  Carrier Fleet Inquiries CRM
                </h3>
                <p className="text-xs text-slate-400 font-tactical">
                  Manage incoming fleet discount requests submitted by trucking company safety directors.
                </p>
              </div>
              <span className="text-xs font-tactical text-slate-400">
                {fleetInquiries.length} carrier inquiries logged
              </span>
            </div>

            {fleetInquiries.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs font-tactical space-y-2">
                <Building2 className="w-8 h-8 mx-auto text-slate-600" />
                <p>No carrier fleet quote inquiries submitted yet.</p>
                <p className="text-[11px] text-slate-600">When carriers submit inquiries from the Pricing Packages modal, they appear here instantly.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Inquiry List */}
                <div className="space-y-3">
                  {fleetInquiries.map((inq) => {
                    const isSelected = selectedInquiry?.id === inq.id;
                    return (
                      <div
                        key={inq.id}
                        onClick={() => {
                          setSelectedInquiry(inq);
                          setInquiryNotes(inq.adminNotes || '');
                          setGeneratedInvoice(null);
                        }}
                        className={`p-4 rounded-xl border cursor-pointer transition text-xs font-tactical space-y-2 ${
                          isSelected
                            ? 'bg-[#182333] border-sky-500 shadow-md'
                            : 'bg-[#131923] border-[#222C3C] hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{inq.companyName}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            inq.status === 'active_fleet'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500'
                              : inq.status === 'contacted'
                              ? 'bg-sky-950 text-sky-400 border border-sky-500'
                              : 'bg-amber-950 text-amber-400 border border-amber-500'
                          }`}>
                            {inq.status}
                          </span>
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          Contact: <span className="text-slate-200">{inq.contactName}</span> ({inq.title || 'Safety Dir'})
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          Fleet: <span className="text-sky-300 font-bold">{inq.fleetSize}</span>
                        </div>
                        <div className="text-slate-500 text-[10px]">
                          Submitted: {new Date(inq.submittedAt).toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Inquiry Detail & Discount Calculator */}
                <div className="lg:col-span-2 bg-[#141A24] border border-[#243043] rounded-xl p-5 space-y-4">
                  {selectedInquiry ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-[#20293A] pb-3">
                        <div>
                          <h4 className="text-lg font-black font-heading uppercase text-white">
                            {selectedInquiry.companyName}
                          </h4>
                          <span className="text-xs text-sky-400 font-tactical">
                            Fleet Size: {selectedInquiry.fleetSize} • Primary Goal: {selectedInquiry.primaryGoal}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-tactical font-bold text-slate-400 uppercase">Status:</label>
                          <select
                            value={selectedInquiry.status}
                            onChange={(e) => handleUpdateInquiryStatus(selectedInquiry.id, e.target.value as any)}
                            className="bg-[#1C2533] border border-[#2F3C50] text-xs text-white rounded-lg px-2 py-1 font-tactical"
                          >
                            <option value="received">Received</option>
                            <option value="in-review">In Review</option>
                            <option value="contacted">Contacted</option>
                            <option value="proposal_sent">Proposal Sent</option>
                            <option value="active_fleet">Active Fleet</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                      </div>

                      {/* Contact Info Grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs font-tactical bg-[#0E131C] p-3 rounded-xl border border-[#1C2433]">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Contact Person:</span>
                          <span className="text-white font-bold">{selectedInquiry.contactName}</span>
                          <span className="text-slate-400 text-[11px] block">{selectedInquiry.title}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Email & Phone:</span>
                          <a href={`mailto:${selectedInquiry.email}`} className="text-sky-400 underline block font-mono">
                            {selectedInquiry.email}
                          </a>
                          <span className="text-slate-300 font-mono">{selectedInquiry.phone || 'No phone provided'}</span>
                        </div>
                      </div>

                      {selectedInquiry.notes && (
                        <div className="text-xs font-tactical bg-[#0E131C] p-3 rounded-xl border border-[#1C2433] space-y-1">
                          <span className="text-slate-500 block text-[10px]">Carrier Notes / Specific Rig Directives:</span>
                          <p className="text-slate-300">{selectedInquiry.notes}</p>
                        </div>
                      )}

                      {/* Fleet Square Discount & Invoice Calculator */}
                      <div className="bg-[#101620] border-2 border-sky-500/40 rounded-xl p-4 space-y-3 text-xs font-tactical">
                        <div className="flex items-center gap-2 text-white font-bold">
                          <DollarSign className="w-4 h-4 text-sky-400" />
                          <span>Generate Square Fleet Invoice & Discount Link</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-slate-400 uppercase text-[10px]">Truck Count</label>
                            <input
                              type="number"
                              min={5}
                              value={carrierTruckCount}
                              onChange={(e) => setCarrierTruckCount(Number(e.target.value))}
                              className="w-full bg-[#18202C] border border-[#2B394D] rounded-lg px-2.5 py-1.5 text-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-slate-400 uppercase text-[10px]">Rate per Truck ($/mo)</label>
                            <input
                              type="number"
                              min={5}
                              value={ratePerTruck}
                              onChange={(e) => setRatePerTruck(Number(e.target.value))}
                              className="w-full bg-[#18202C] border border-[#2B394D] rounded-lg px-2.5 py-1.5 text-white"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleGenerateInvoice(selectedInquiry)}
                          className="w-full py-2 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-[#090D14] font-black uppercase text-xs flex items-center justify-center gap-1.5 transition"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Calculate & Generate Square Fleet Payment Link</span>
                        </button>

                        {generatedInvoice && (
                          <div className="p-3 bg-sky-950/60 border border-sky-500/60 rounded-xl space-y-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-300">Total Billed ({generatedInvoice.discountPercent}% Fleet Discount Applied):</span>
                              <span className="font-black text-emerald-400 text-sm">${generatedInvoice.totalAmount} / month</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-mono">
                              <span className="text-slate-400">Invoice Ref:</span>
                              <span className="text-white">{generatedInvoice.invoiceId}</span>
                            </div>
                            <div className="pt-1 flex gap-2">
                              <a
                                href={`mailto:${selectedInquiry.email}?subject=Linehaul%20Strong%20Custom%20Fleet%20Discount%20Invoice&body=Hello%20${encodeURIComponent(selectedInquiry.contactName)}%2C%0A%0AWe%20have%20prepared%20your%20discounted%20fleet%20pricing%20for%20${encodeURIComponent(selectedInquiry.companyName)}%20(${carrierTruckCount}%20trucks).%0A%0AMonthly%20Total%3A%20%24${generatedInvoice.totalAmount}%0ADiscount%20Rate%3A%20${generatedInvoice.discountPercent}%25%0A%0AYour%20Square%20Payment%20Link%3A%20${encodeURIComponent(generatedInvoice.checkoutUrl)}%0A%0ABest%20regards%2C%0ACoach%20AJ%20Risner`}
                                className="flex-1 py-1.5 px-3 rounded-lg bg-[#1A2536] hover:bg-[#26354B] text-white border border-[#2D3E57] text-[11px] font-bold uppercase flex items-center justify-center gap-1"
                              >
                                <Mail className="w-3.5 h-3.5 text-sky-400" />
                                <span>Email Invoice to Carrier</span>
                              </a>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Internal Admin Notes */}
                      <div className="space-y-1.5 text-xs font-tactical">
                        <label className="text-slate-400 uppercase font-bold text-[10px]">Internal Coach / Admin Notes</label>
                        <textarea
                          rows={2}
                          value={inquiryNotes}
                          onChange={(e) => setInquiryNotes(e.target.value)}
                          placeholder="Add private negotiation notes, negotiated per-driver pricing, or follow-up schedule..."
                          className="w-full bg-[#18202C] border border-[#2B394D] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400 resize-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateInquiryStatus(selectedInquiry.id, selectedInquiry.status)}
                          className="px-3 py-1.5 rounded-lg bg-[#1F2937] hover:bg-[#2B384A] text-slate-300 text-[11px] uppercase font-bold"
                        >
                          Save Internal Notes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-16 text-center text-slate-500 text-xs font-tactical">
                      Select an inquiry on the left to review carrier specifications and calculate custom pricing.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: SQUARE PAYMENTS HUB                                      */}
      {/* ============================================================== */}
      {activeAdminTab === 'square-hub' && (
        <div className="space-y-6">
          {squareFeedback && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-300 text-xs font-tactical flex items-center gap-2 shadow-xl">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span className="font-bold">{squareFeedback}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Square Configuration Settings Form */}
            <div className="lg:col-span-1 bg-[#10141C] border border-[#242E3F] rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-[#1E2736] pb-3">
                <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/20 border border-[#FF6B00]/50 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-[#FF6B00]" />
                </div>
                <div>
                  <h3 className="text-sm font-black font-heading uppercase text-white">
                    Square Gateway Config
                  </h3>
                  <span className="text-[10px] text-slate-400 font-tactical">API & Checkout URLs</span>
                </div>
              </div>

              <form onSubmit={handleSaveSquareConfig} className="space-y-3.5 text-xs font-tactical">
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase font-bold text-[10px]">Square Environment</label>
                  <select
                    value={squareConfig.environment}
                    onChange={(e) => setSquareConfig({ ...squareConfig, environment: e.target.value as 'sandbox' | 'production' })}
                    className="w-full bg-[#18202C] border border-[#2B394D] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6B00]"
                  >
                    <option value="sandbox">Sandbox (Testing & Test Cards)</option>
                    <option value="production">Production (Live Square Processing)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 uppercase font-bold text-[10px]">Square Application ID *</label>
                  <input
                    type="text"
                    required
                    value={squareConfig.applicationId}
                    onChange={(e) => setSquareConfig({ ...squareConfig, applicationId: e.target.value })}
                    className="w-full bg-[#18202C] border border-[#2B394D] rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 uppercase font-bold text-[10px]">Square Location ID *</label>
                  <input
                    type="text"
                    required
                    value={squareConfig.locationId}
                    onChange={(e) => setSquareConfig({ ...squareConfig, locationId: e.target.value })}
                    className="w-full bg-[#18202C] border border-[#2B394D] rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 uppercase font-bold text-[10px]">$15 Starter Square Checkout Link</label>
                  <input
                    type="url"
                    value={squareConfig.starterCheckoutUrl || ''}
                    onChange={(e) => setSquareConfig({ ...squareConfig, starterCheckoutUrl: e.target.value })}
                    placeholder="https://square.link/u/..."
                    className="w-full bg-[#18202C] border border-[#2B394D] rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 uppercase font-bold text-[10px]">$30 Pro Square Checkout Link</label>
                  <input
                    type="url"
                    value={squareConfig.proCheckoutUrl || ''}
                    onChange={(e) => setSquareConfig({ ...squareConfig, proCheckoutUrl: e.target.value })}
                    placeholder="https://square.link/u/..."
                    className="w-full bg-[#18202C] border border-[#2B394D] rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={isSavingSquare}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#FF6B00] hover:bg-[#FF8526] text-[#0A0D12] font-black uppercase text-xs flex items-center justify-center gap-2 transition shadow-md shadow-[#FF6B00]/20"
                  >
                    <span>{isSavingSquare ? 'Saving...' : 'Save Square Settings'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestSquarePayment}
                    disabled={isTestingPayment}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#1A2330] hover:bg-[#253145] text-emerald-400 border border-emerald-500/40 font-bold uppercase text-xs flex items-center justify-center gap-2 transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isTestingPayment ? 'Processing Test...' : 'Test Sandbox Payment ($30)'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Square Transaction Ledger */}
            <div className="lg:col-span-2 bg-[#10141C] border border-[#242E3F] rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2736] pb-3">
                <div>
                  <h3 className="text-sm font-black font-heading uppercase text-white">
                    Square Payment Transactions Ledger
                  </h3>
                  <span className="text-[10px] text-slate-400 font-tactical">
                    Live recorded subscription charges & fleet deposits
                  </span>
                </div>
                <span className="text-xs font-tactical font-black text-[#FF6B00]">
                  {squareTransactions.length} Total Payments
                </span>
              </div>

              {squareTransactions.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-xs font-tactical space-y-2">
                  <CreditCard className="w-8 h-8 mx-auto text-slate-600" />
                  <p>No Square payments recorded yet.</p>
                  <p className="text-[11px] text-slate-600">
                    Click "Test Sandbox Payment" or subscribe via the Pricing Packages tab to record a live payment.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-tactical">
                    <thead>
                      <tr className="bg-[#141923] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#202A3A]">
                        <th className="py-2.5 px-3 font-bold">Square Payment ID</th>
                        <th className="py-2.5 px-3 font-bold">Driver / Carrier</th>
                        <th className="py-2.5 px-3 font-bold">Plan</th>
                        <th className="py-2.5 px-3 font-bold text-center">Amount</th>
                        <th className="py-2.5 px-3 font-bold">Method</th>
                        <th className="py-2.5 px-3 font-bold">Status</th>
                        <th className="py-2.5 px-3 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#18212D]">
                      {squareTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-[#151D28] transition">
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300">
                            {tx.squarePaymentId.slice(0, 14)}...
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-white block">{tx.driverName}</span>
                            <span className="text-[10px] text-slate-400">{tx.driverEmail}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-200">
                            {tx.planName}
                          </td>
                          <td className="py-2.5 px-3 text-center font-black text-emerald-400">
                            ${tx.amount.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">
                            {tx.paymentMethod === 'square_card' ? `${tx.cardBrand || 'Card'} •••• ${tx.last4 || '1111'}` : 'Square Link'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-black uppercase border border-emerald-600/40">
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-400 text-[10px]">
                            {new Date(tx.timestamp).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
