import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Check, 
  X, 
  Truck, 
  Zap, 
  Dumbbell, 
  Mail, 
  Clock, 
  ChevronRight, 
  HelpCircle, 
  Users, 
  Phone, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  CreditCard,
  Building2,
  Calendar,
  AlertCircle,
  Lock,
  ExternalLink
} from 'lucide-react';
import { 
  SUBSCRIPTION_PACKAGES, 
  MembershipMetadata, 
  getTrialTimeRemaining, 
  activateFreeTrial, 
  activatePackage, 
  saveActiveMembership,
  submitFleetInquiry 
} from '../lib/subscription';
import { MembershipTier, DriverAccount, FleetQuoteInquiry, SquareTransaction } from '../types';
import { processSquarePayment, getSquareConfig } from '../lib/square';
import { isAdminUser } from '../lib/coaching';

interface PricingPackagesViewProps {
  currentDriver: Omit<DriverAccount, 'passwordHash'> | null;
  currentMembership: MembershipMetadata;
  onMembershipUpdated: (newMetadata: MembershipMetadata) => void;
  onNavigateToWorkout: (tabName: 'rest-stop' | 'light-db' | 'road-warrior' | 'custom-plan') => void;
  onOpenAuth: () => void;
}

export const PricingPackagesView: React.FC<PricingPackagesViewProps> = ({
  currentDriver,
  currentMembership,
  onMembershipUpdated,
  onNavigateToWorkout,
  onOpenAuth
}) => {
  const isAdmin = !!(currentDriver?.email && isAdminUser(currentDriver.email));

  // Modal states
  const [isFleetModalOpen, setIsFleetModalOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<'starter' | 'pro' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Square Payment form state
  const [paymentTab, setPaymentTab] = useState<'square-card' | 'square-link'>('square-card');
  const [squareCardNumber, setSquareCardNumber] = useState('');
  const [squareExpMonth, setSquareExpMonth] = useState('12');
  const [squareExpYear, setSquareExpYear] = useState('28');
  const [squareCvv, setSquareCvv] = useState('');
  const [squarePostalCode, setSquarePostalCode] = useState('90210');
  const [squareCardholderName, setSquareCardholderName] = useState(currentDriver?.name || 'Linehaul Driver');
  const [squareError, setSquareError] = useState<string | null>(null);
  const [squareReceipt, setSquareReceipt] = useState<SquareTransaction | null>(null);

  const squareConfig = getSquareConfig();

  // Fleet form state
  const [fleetFormData, setFleetFormData] = useState({
    companyName: currentDriver?.carrier || '',
    contactName: currentDriver?.name || '',
    title: 'Fleet Safety Director',
    email: currentDriver?.email || '',
    phone: '',
    fleetSize: '26-100 Trucks',
    primaryGoal: 'DOT Physical Pass Rate',
    notes: ''
  });
  const [fleetSubmitted, setFleetSubmitted] = useState<FleetQuoteInquiry | null>(null);

  const trialInfo = getTrialTimeRemaining(currentMembership.trialExpiresDate);

  const showFeedback = (msg: string) => {
    setFeedbackBanner(msg);
    setTimeout(() => setFeedbackBanner(null), 5000);
  };

  const handleFillSandboxCard = () => {
    setSquareCardNumber('4111 1111 1111 1111');
    setSquareExpMonth('12');
    setSquareExpYear('28');
    setSquareCvv('999');
    setSquarePostalCode('90210');
    setSquareError(null);
  };

  const handleActivateTrial = async () => {
    setIsProcessing(true);
    try {
      const updated = await activateFreeTrial(currentDriver?.id);
      onMembershipUpdated(updated);
      showFeedback('14-Day Free Trial Activated! Full test-drive of Road Warrior gym split, 53\' parking GPS, and in-cab protocols unlocked.');
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateTier = async (targetTier: MembershipTier) => {
    setIsProcessing(true);
    try {
      if (targetTier === 'trial') {
        const updated = await activateFreeTrial(currentDriver?.id);
        onMembershipUpdated(updated);
        showFeedback('Simulated Tier: 14-Day Free Trial (Road Warrior gym split, 53\' parking GPS, and in-cab protocols active; 1-on-1 coach dispatch requires Pro).');
      } else if (targetTier === 'starter') {
        const updated = await activatePackage('starter', currentDriver?.id);
        onMembershipUpdated(updated);
        showFeedback('Simulated Tier: $15 Starter (Core in-cab routines active; Pro gym split, GPS, and custom coach locked).');
      } else if (targetTier === 'pro') {
        const updated = await activatePackage('pro', currentDriver?.id);
        onMembershipUpdated(updated);
        showFeedback('Simulated Tier: $30 Road Warrior Pro (All features & custom coaching 100% unlocked).');
      } else if (targetTier === 'none') {
        const updated: MembershipMetadata = {
          tier: 'none',
          trialStartDate: new Date(Date.now() - 20 * 86400000).toISOString(),
          trialExpiresDate: new Date(Date.now() - 6 * 86400000).toISOString()
        };
        await saveActiveMembership(updated, currentDriver?.id);
        onMembershipUpdated(updated);
        showFeedback('Simulated Tier: Expired Trial (All gated features locked down).');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSquarePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForCheckout) return;

    setIsProcessing(true);
    setSquareError(null);

    const amount = selectedPlanForCheckout === 'starter' ? 15 : 30;

    try {
      const result = await processSquarePayment({
        driverId: currentDriver?.id || `driver_${Date.now()}`,
        driverName: squareCardholderName || currentDriver?.name || 'Linehaul Driver',
        driverEmail: currentDriver?.email || 'driver@linehaulstrong.com',
        planId: selectedPlanForCheckout,
        amount,
        paymentMethod: 'square_card',
        cardDetails: {
          cardNumber: squareCardNumber,
          cardholderName: squareCardholderName,
          expMonth: squareExpMonth,
          expYear: squareExpYear,
          cvv: squareCvv,
          postalCode: squarePostalCode
        }
      });

      if (!result.success || !result.transaction) {
        setSquareError(result.error || 'Payment failed through Square gateway.');
        setIsProcessing(false);
        return;
      }

      // Activate plan locally and in Firebase
      const updated = await activatePackage(selectedPlanForCheckout, currentDriver?.id);
      onMembershipUpdated(updated);
      setSquareReceipt(result.transaction);
      showFeedback(`Square payment successful! ${selectedPlanForCheckout === 'starter' ? '$15 Starter' : '$30 Road Warrior Pro'} is now active.`);
    } catch (err: any) {
      setSquareError(err?.message || 'Payment processing error.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitFleetQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fleetFormData.companyName.trim() || !fleetFormData.email.trim() || !fleetFormData.contactName.trim()) {
      alert('Please fill out Company Name, Contact Name, and Business Email.');
      return;
    }

    setIsProcessing(true);
    const result = await submitFleetInquiry({
      companyName: fleetFormData.companyName.trim(),
      contactName: fleetFormData.contactName.trim(),
      title: fleetFormData.title.trim(),
      email: fleetFormData.email.trim(),
      phone: fleetFormData.phone.trim(),
      fleetSize: fleetFormData.fleetSize,
      primaryGoal: fleetFormData.primaryGoal,
      notes: fleetFormData.notes.trim()
    });

    setIsProcessing(false);
    if (result.success) {
      setFleetSubmitted(result.inquiry);
      showFeedback('Fleet quote inquiry submitted! Coach AJ will contact you with your custom fleet discount rate.');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in pb-12">
      {/* Tactical Banner / Feedback Notification */}
      {feedbackBanner && (
        <div className="bg-[#151D29] border-2 border-[#FF6B00] rounded-xl p-4 flex items-center justify-between shadow-2xl text-white">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#FF6B00] shrink-0" />
            <span className="text-sm font-tactical font-bold tracking-wide">{feedbackBanner}</span>
          </div>
          <button 
            onClick={() => setFeedbackBanner(null)} 
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-[#202938]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Mission */}
      <div className="bg-gradient-to-r from-[#141A24] via-[#0E131B] to-[#141A24] border-2 border-[#263345] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/50 text-[#FF6B00] text-xs font-tactical font-black uppercase tracking-wider">
              PRICING & MEMBERSHIP TIERS
            </span>
            <span className="text-xs font-tactical text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              NO CONTRACTS • CANCEL ANYTIME • 100% TRUCKER FOCUSED
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black font-heading uppercase text-white tracking-wide">
            Fuel Your Body. <span className="text-[#FF6B00]">Protect Your CDL.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-tactical leading-relaxed">
            Choose the package engineered for your operational tempo. Test drive the core in-cab protocols with our 14-day free trial, or unlock everything including commercial gym splits, 53' semi parking GPS, and 1-on-1 coaching with Road Warrior Pro ($30/mo).
          </p>

          {/* Current Membership Status Badge */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#090C10] border border-[#2B384C] text-xs font-tactical">
              <span className="text-slate-400">YOUR CURRENT STATUS:</span>
              {currentMembership.tier === 'trial' && (
                <span className="text-emerald-400 font-black uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  14-Day Free Trial ({trialInfo.displayText}) • Core In-Cab Active
                </span>
              )}
              {currentMembership.tier === 'starter' && (
                <span className="text-[#FF6B00] font-black uppercase">
                  $15 Driver Starter Active (Core Features)
                </span>
              )}
              {currentMembership.tier === 'pro' && (
                <span className="text-amber-400 font-black uppercase flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Road Warrior Pro ($30/mo) • Everything Unlocked
                </span>
              )}
              {currentMembership.tier === 'fleet_pending' && (
                <span className="text-sky-400 font-black uppercase">
                  Fleet Inquiry Submitted • Priority Review
                </span>
              )}
              {currentMembership.tier === 'none' && (
                trialInfo.hasActivated ? (
                  <span className="text-rose-400 font-black uppercase flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    14-Day Trial Ended • Subscription Required Below
                  </span>
                ) : (
                  <span className="text-emerald-400 font-black uppercase flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    14-Day Free Trial Available • Activate Below
                  </span>
                )
              )}
            </div>

            {currentMembership.tier !== 'pro' && (
              <button
                onClick={() => setSelectedPlanForCheckout('pro')}
                className="text-xs font-tactical font-black uppercase px-3 py-1.5 rounded-lg bg-[#FF6B00] hover:bg-[#FF8526] text-[#0A0D12] transition shadow-md shadow-[#FF6B00]/20"
              >
                Upgrade to Pro ($30)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Tier Simulator & Quick Sandbox Bar - Strictly visible to Super Admin Coach AJ */}
      {isAdmin && (
        <div className="bg-[#111620] border border-[#232F42] rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/20 border border-[#FF6B00]/40 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-[#FF6B00]" />
            </div>
            <div>
              <span className="text-[10px] font-tactical font-black uppercase text-[#FF6B00] tracking-wider block">
                [ADMIN ONLY] INSTANT TIER SIMULATOR & TEST DRIVE
              </span>
              <span className="text-xs text-slate-300 font-tactical">
                Switch tiers to immediately verify how locked and unlocked features behave:
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => handleSimulateTier('trial')}
              className={`px-3 py-1.5 rounded-lg text-xs font-tactical font-bold uppercase transition border ${
                currentMembership.tier === 'trial'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow'
                  : 'bg-[#182130] text-slate-300 border-[#2A394E] hover:bg-[#202C3F]'
              }`}
            >
              14D Trial ($0)
            </button>
            <button
              onClick={() => handleSimulateTier('starter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-tactical font-bold uppercase transition border ${
                currentMembership.tier === 'starter'
                  ? 'bg-[#FF6B00] text-[#0A0D12] border-[#FF6B00] font-black shadow'
                  : 'bg-[#182130] text-slate-300 border-[#2A394E] hover:bg-[#202C3F]'
              }`}
            >
              $15 Starter
            </button>
            <button
              onClick={() => handleSimulateTier('pro')}
              className={`px-3 py-1.5 rounded-lg text-xs font-tactical font-bold uppercase transition border ${
                currentMembership.tier === 'pro'
                  ? 'bg-amber-400 text-[#0A0D12] border-amber-400 font-black shadow'
                  : 'bg-[#182130] text-slate-300 border-[#2A394E] hover:bg-[#202C3F]'
              }`}
            >
              $30 Pro (All Unlocked)
            </button>
            <button
              onClick={() => handleSimulateTier('none')}
              className={`px-3 py-1.5 rounded-lg text-xs font-tactical font-bold uppercase transition border ${
                currentMembership.tier === 'none'
                  ? 'bg-rose-950 text-rose-300 border-rose-500 shadow'
                  : 'bg-[#182130] text-slate-400 border-[#2A394E] hover:bg-[#202C3F]'
              }`}
            >
              Expired
            </button>
          </div>
        </div>
      )}

      {/* 4 Payment Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SUBSCRIPTION_PACKAGES.map((pkg) => {
          const isCurrent = currentMembership.tier === pkg.id;
          const isPro = pkg.id === 'pro';
          const isTrial = pkg.id === 'trial';
          const isStarter = pkg.id === 'starter';
          const isFleet = pkg.id === 'fleet';

          return (
            <div
              key={pkg.id}
              className={`rounded-2xl flex flex-col justify-between transition-all duration-300 relative ${
                isPro
                  ? 'bg-gradient-to-b from-[#1C2330] via-[#121720] to-[#0D1117] border-2 border-[#FF6B00] shadow-2xl shadow-[#FF6B00]/15 lg:-translate-y-2'
                  : 'bg-[#10141C] border border-[#222C3D] hover:border-slate-500 shadow-xl'
              }`}
            >
              {/* Pro / Highlighted Flag */}
              {isPro && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#FF6B00] text-[#0A0D12] text-[10px] font-black uppercase tracking-widest font-tactical shadow-md flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-current" />
                  <span>RECOMMENDED • ALL UNLOCKED</span>
                </div>
              )}

              {/* Card Header */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-tactical font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                    isPro 
                      ? 'bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/40' 
                      : isTrial
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                      : isFleet
                      ? 'bg-sky-950/60 text-sky-400 border-sky-800/60'
                      : 'bg-[#192230] text-slate-300 border-[#2D3A4F]'
                  }`}>
                    {pkg.badge}
                  </span>
                  
                  {isCurrent && (
                    <span className="text-[10px] font-tactical font-black uppercase text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/50">
                      CURRENT PLAN
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-black font-heading uppercase text-white tracking-wide">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-tactical mt-1 min-h-[32px]">
                    {pkg.tagline}
                  </p>
                </div>

                {/* Price Display */}
                <div className="py-2 border-y border-[#1E2635] flex items-baseline gap-1.5">
                  <span className={`text-3xl sm:text-4xl font-black font-heading tracking-tight ${
                    isPro ? 'text-[#FF6B00]' : 'text-white'
                  }`}>
                    {pkg.priceDisplay}
                  </span>
                  <span className="text-xs text-slate-400 font-tactical">
                    / {pkg.billingPeriod}
                  </span>
                </div>

                {/* Package Highlights */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-[10px] font-tactical font-bold text-slate-400 uppercase tracking-wider block">
                    {isFleet ? 'FLEET INCLUSIONS:' : isStarter ? 'WHAT YOU GET (CORE):' : 'EVERYTHING INCLUDED:'}
                  </span>
                  <ul className="space-y-2">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs">
                        {feat.included ? (
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isPro 
                              ? 'bg-[#FF6B00]/20 text-[#FF6B00]' 
                              : isTrial
                              ? 'bg-emerald-950 text-emerald-400'
                              : 'bg-emerald-950/70 text-emerald-400'
                          }`}>
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-rose-950/40 text-rose-500/80 flex items-center justify-center shrink-0 mt-0.5">
                            <X className="w-3 h-3 stroke-[2.5]" />
                          </div>
                        )}
                        <div className="leading-tight">
                          <span className={feat.included ? 'text-slate-200' : 'text-slate-500 line-through'}>
                            {feat.name}
                          </span>
                          {feat.note && (
                            <span className={`block text-[10px] font-tactical ${
                              feat.included ? 'text-slate-400' : 'text-rose-400/80 font-bold'
                            }`}>
                              {feat.note}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 sm:p-6 pt-0 border-t border-[#1C2330]">
                {isFleet ? (
                  <button
                    onClick={() => setIsFleetModalOpen(true)}
                    className="w-full py-3 px-4 rounded-xl text-xs font-tactical font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 bg-[#1A2333] hover:bg-[#253248] text-white border border-sky-500/40 hover:border-sky-400 shadow-lg"
                  >
                    <Building2 className="w-4 h-4 text-sky-400" />
                    <span>Contact Us for Fleet Pricing</span>
                  </button>
                ) : isTrial ? (
                  <div className="space-y-2 w-full">
                    {isCurrent && !trialInfo.isExpired ? (
                      <button
                        onClick={() => onNavigateToWorkout('road-warrior')}
                        className="w-full py-3 px-4 rounded-xl text-xs font-tactical font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-600/70 shadow-lg cursor-pointer"
                        title="Click to launch the Road Warrior Gym Split"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Trial Active ({trialInfo.displayText}) • Test Drive →</span>
                      </button>
                    ) : trialInfo.hasActivated && trialInfo.isExpired ? (
                      <div className="space-y-1.5 w-full text-center">
                        <div className="w-full py-3 px-3 rounded-xl bg-rose-950/40 border border-rose-700/60 text-rose-300 text-xs font-tactical font-black uppercase tracking-wider flex items-center justify-center gap-1.5">
                          <Lock className="w-3.5 h-3.5" />
                          <span>14-Day Trial Concluded</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-tactical">
                          Select $15 Starter or $30 Pro below
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={currentDriver ? handleActivateTrial : onOpenAuth}
                        disabled={isProcessing}
                        className="w-full py-3 px-4 rounded-xl text-xs font-tactical font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#FF8526] text-[#0A0D12] shadow-lg shadow-[#FF6B00]/25 cursor-pointer font-black"
                      >
                        <Zap className="w-4 h-4 fill-current" />
                        <span>Start 14-Day Free Trial ($0)</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedPlanForCheckout(pkg.id as 'starter' | 'pro')}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-tactical font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                      isPro
                        ? 'bg-[#FF6B00] hover:bg-[#FF8526] text-[#0A0D12] shadow-lg shadow-[#FF6B00]/30 font-black'
                        : isCurrent
                        ? 'bg-[#1F2937] text-white border border-slate-600'
                        : 'bg-[#1A2230] hover:bg-[#263245] text-white border border-[#34445C]'
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Current Active Plan</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>{pkg.ctaText}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Matrix Table */}
      <div className="bg-[#0E1218] border border-[#202937] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1B2330] pb-4">
          <div>
            <h3 className="text-lg font-black font-heading uppercase text-white tracking-wide">
              Detailed Feature Comparison Matrix
            </h3>
            <p className="text-xs text-slate-400 font-tactical">
              Compare exact program access across Trial, $15 Starter, $30 Pro, and Carrier Fleet
            </p>
          </div>
          <div className="text-xs text-slate-400 font-tactical">
            All tiers include offline PWA capability
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1E2635] text-slate-400 font-tactical uppercase">
                <th className="py-3 px-4 font-bold">Feature / Tactical Capability</th>
                <th className="py-3 px-4 text-center font-bold text-emerald-400">14-Day Trial ($0)</th>
                <th className="py-3 px-4 text-center font-bold text-slate-200">Starter ($15)</th>
                <th className="py-3 px-4 text-center font-bold text-[#FF6B00] bg-[#FF6B00]/5">Pro ($30)</th>
                <th className="py-3 px-4 text-center font-bold text-sky-400">Fleet (Discount)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18202C] font-tactical">
              <tr>
                <td className="py-3 px-4 font-bold text-white">Rest Stop 4-Day Split (Tire & Grab Rail)</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-[#FF6B00]/5"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Light DB Anywhere (In-Cab & Sleeper Bunk)</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-[#FF6B00]/5"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Dock Door Drills (5-10m Micro Workouts)</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-[#FF6B00]/5"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Road Warrior 3-Day Gym Split (Push/Pull/Legs)</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold">
                  <div className="flex flex-col items-center">
                    <Check className="w-4 h-4 mx-auto" />
                    <span className="text-[9px] text-emerald-400 font-tactical font-normal">14D Test Drive</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center text-rose-500 font-bold">
                  <div className="flex flex-col items-center">
                    <X className="w-4 h-4 mx-auto" />
                    <span className="text-[9px] text-slate-500 font-tactical font-normal">Requires Pro</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-[#FF6B00]/5"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Gyms with 53' Semi Parking GPS (Planet Fitness)</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold">
                  <div className="flex flex-col items-center">
                    <Check className="w-4 h-4 mx-auto" />
                    <span className="text-[9px] text-emerald-400 font-tactical font-normal">14D Test Drive</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center text-rose-500 font-bold">
                  <div className="flex flex-col items-center">
                    <X className="w-4 h-4 mx-auto" />
                    <span className="text-[9px] text-slate-500 font-tactical font-normal">Requires Pro</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-[#FF6B00]/5"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">1-on-1 Coach AJ Custom Rig Programming Intake</td>
                <td className="py-3 px-4 text-center text-rose-500 font-bold">
                  <div className="flex flex-col items-center">
                    <X className="w-4 h-4 mx-auto" />
                    <span className="text-[9px] text-slate-500 font-tactical font-normal">Requires Pro</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center text-rose-500 font-bold">
                  <div className="flex flex-col items-center">
                    <X className="w-4 h-4 mx-auto" />
                    <span className="text-[9px] text-slate-500 font-tactical font-normal">Requires Pro</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-[#FF6B00]/5"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Cab-Galley 12V Cooker Recipes & Fuel Grades</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-[#FF6B00]/5"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">HOS Sleep Vibration & Recovery Tracker</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-[#FF6B00]/5"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Hydration & Fluid Stop Cadence Planner</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold bg-[#FF6B00]/5"><Check className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Enterprise Fleet Wellness & DOT Physical Audit</td>
                <td className="py-3 px-4 text-center text-rose-500"><X className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-4 text-center text-rose-500"><X className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-4 text-center text-rose-500 bg-[#FF6B00]/5"><X className="w-4 h-4 mx-auto" /></td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold"><Check className="w-4 h-4 mx-auto" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Fleet Discount Enterprise Callout Box */}
      <div className="bg-gradient-to-r from-[#111824] via-[#162030] to-[#111824] border-2 border-sky-500/40 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/40 text-[10px] font-tactical font-black uppercase tracking-wider">
              CARRIER FLEET PROGRAM
            </span>
            <span className="text-xs font-tactical text-slate-400">5 to 500+ Trucks</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-heading uppercase text-white tracking-wide">
            Need Pricing for Your Entire Fleet at a Discount Rate?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 font-tactical max-w-2xl leading-relaxed">
            Protect your drivers’ health, cut workers’ comp strain claims, and ensure high pass rates for DOT physical recertifications. Contact Coach AJ Risner directly to get an instant customized fleet volume quote.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
          <button
            onClick={() => setIsFleetModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-[#090D14] font-tactical font-black text-xs uppercase tracking-wider shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition"
          >
            <Building2 className="w-4 h-4" />
            <span>Contact Us for Fleet Pricing</span>
          </button>
          
          <a
            href="mailto:ajrisner08@gmail.com?subject=Linehaul%20Strong%20Fleet%20Quote%20Inquiry&body=Hello%20Coach%20AJ%2C%0A%0AWe%20would%20like%20to%20request%20pricing%20for%20our%20entire%20fleet%20at%20a%20discount%20rate.%0A%0ACompany%20Name%3A%0AFleet%20Size%20(number%20of%20trucks)%3A%0AContact%20Phone%3A%0AOperational%20Goals%3A%0A%0AThank%20you!"
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-[#1A2536] hover:bg-[#223147] text-white border border-[#2D3E59] font-tactical font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
          >
            <Mail className="w-4 h-4 text-sky-400" />
            <span>Direct Email</span>
          </a>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-[#0C0F14] border border-[#1D2533] rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-white">
          <HelpCircle className="w-5 h-5 text-[#FF6B00]" />
          <h4 className="text-base font-black font-heading uppercase tracking-wide">
            Frequently Asked Questions
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-tactical">
          <div className="bg-[#12161F] p-4 rounded-xl border border-[#1F2735] space-y-1.5">
            <h5 className="font-bold text-white uppercase">How does the 14-day free trial work?</h5>
            <p className="text-slate-400 leading-relaxed">
              When you activate the 14-day free trial, every feature across Linehaul Strong is 100% unlocked with zero payment required. You get all 4 workout splits, nutrition guides, and direct coaching intake.
            </p>
          </div>

          <div className="bg-[#12161F] p-4 rounded-xl border border-[#1F2735] space-y-1.5">
            <h5 className="font-bold text-white uppercase">What is the difference between $15 and $30?</h5>
            <p className="text-slate-400 leading-relaxed">
              The $15 Starter package includes core rig and in-cab routines (Rest Stop Split, Light DB, Dock Drills, Nutrition, and Hydration). The $30 Pro package unlocks the Road Warrior 3-day commercial gym split with 53' semi parking GPS and 1-on-1 custom rig programming from Coach AJ.
            </p>
          </div>

          <div className="bg-[#12161F] p-4 rounded-xl border border-[#1F2735] space-y-1.5">
            <h5 className="font-bold text-white uppercase">How does Fleet Discount pricing work?</h5>
            <p className="text-slate-400 leading-relaxed">
              Fleets of 5 or more trucks receive discounted bulk driver rates. Carrier safety directors get central driver enrollment, DOT physical pass tracking, and quarterly strain prevention audits from Coach AJ.
            </p>
          </div>

          <div className="bg-[#12161F] p-4 rounded-xl border border-[#1F2735] space-y-1.5">
            <h5 className="font-bold text-white uppercase">Can I cancel or switch packages anytime?</h5>
            <p className="text-slate-400 leading-relaxed">
              Yes, absolutely. There are no long-term contracts. You can upgrade, downgrade, or cancel your driver subscription with a single tap in your dashboard at any time.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL: FLEET PRICING INQUIRY */}
      {isFleetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[#111620] border-2 border-sky-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-white space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#202B3B] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-base font-black font-heading uppercase">
                    Fleet Enterprise Discount Quote
                  </h3>
                  <span className="text-[11px] text-slate-400 font-tactical">
                    Group Rate Pricing for Your Entire Trucking Fleet
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsFleetModalOpen(false);
                  setFleetSubmitted(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-[#1B2330]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {fleetSubmitted ? (
              <div className="space-y-4 py-4 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-lg font-black font-heading uppercase text-white">
                    Fleet Inquiry Received!
                  </h4>
                  <p className="text-xs text-slate-300 font-tactical max-w-sm mx-auto leading-relaxed">
                    Thank you, <span className="text-white font-bold">{fleetSubmitted.contactName}</span>. Coach AJ Risner has received your fleet specifications for <span className="text-sky-400 font-bold">{fleetSubmitted.companyName}</span> ({fleetSubmitted.fleetSize}) and will contact you directly with discounted carrier pricing.
                  </p>
                </div>

                <div className="bg-[#161D29] border border-[#273549] rounded-xl p-3 text-left text-xs font-tactical space-y-1">
                  <div className="text-slate-400">Confirmation Reference: <span className="text-white font-mono">{fleetSubmitted.id}</span></div>
                  <div className="text-slate-400">Primary Objective: <span className="text-emerald-400">{fleetSubmitted.primaryGoal}</span></div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={`mailto:ajrisner08@gmail.com?subject=Fleet%20Quote%20Follow-up%20-%20${encodeURIComponent(fleetSubmitted.companyName)}&body=Coach%20AJ%2C%0A%0AWe%20just%20submitted%20a%20fleet%20inquiry%20for%20${encodeURIComponent(fleetSubmitted.companyName)}%20(${fleetSubmitted.fleetSize}).%20Looking%20forward%20to%20discussing%20custom%20discount%20pricing%20for%20our%20fleet.`}
                    className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-[#090D14] text-xs font-tactical font-black uppercase flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send Immediate Direct Email</span>
                  </a>
                  <button
                    onClick={() => {
                      setIsFleetModalOpen(false);
                      setFleetSubmitted(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#1C2533] hover:bg-[#253245] text-slate-300 text-xs font-tactical font-bold uppercase"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitFleetQuote} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-tactical">
                  <div className="space-y-1">
                    <label className="text-slate-400 uppercase font-bold text-[10px]">Company / Carrier Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Swift, Knight, Maverick, Solo Owner-Op"
                      value={fleetFormData.companyName}
                      onChange={(e) => setFleetFormData({ ...fleetFormData, companyName: e.target.value })}
                      className="w-full bg-[#18202C] border border-[#2B394D] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 uppercase font-bold text-[10px]">Fleet Size (Trucks) *</label>
                    <select
                      value={fleetFormData.fleetSize}
                      onChange={(e) => setFleetFormData({ ...fleetFormData, fleetSize: e.target.value })}
                      className="w-full bg-[#18202C] border border-[#2B394D] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400"
                    >
                      <option value="5-25 Trucks">5 - 25 Trucks (15% Fleet Discount)</option>
                      <option value="26-100 Trucks">26 - 100 Trucks (25% Fleet Discount)</option>
                      <option value="101-500 Trucks">101 - 500 Trucks (35% Fleet Discount)</option>
                      <option value="500+ Trucks">500+ Enterprise Fleet (Custom Rate)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-tactical">
                  <div className="space-y-1">
                    <label className="text-slate-400 uppercase font-bold text-[10px]">Contact Person Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Miller"
                      value={fleetFormData.contactName}
                      onChange={(e) => setFleetFormData({ ...fleetFormData, contactName: e.target.value })}
                      className="w-full bg-[#18202C] border border-[#2B394D] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 uppercase font-bold text-[10px]">Title / Role</label>
                    <input
                      type="text"
                      placeholder="e.g. VP of Safety, Terminal Mgr"
                      value={fleetFormData.title}
                      onChange={(e) => setFleetFormData({ ...fleetFormData, title: e.target.value })}
                      className="w-full bg-[#18202C] border border-[#2B394D] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-tactical">
                  <div className="space-y-1">
                    <label className="text-slate-400 uppercase font-bold text-[10px]">Business Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="safety@carrier.com"
                      value={fleetFormData.email}
                      onChange={(e) => setFleetFormData({ ...fleetFormData, email: e.target.value })}
                      className="w-full bg-[#18202C] border border-[#2B394D] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 uppercase font-bold text-[10px]">Contact Phone</label>
                    <input
                      type="tel"
                      placeholder="(555) 000-0000"
                      value={fleetFormData.phone}
                      onChange={(e) => setFleetFormData({ ...fleetFormData, phone: e.target.value })}
                      className="w-full bg-[#18202C] border border-[#2B394D] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs font-tactical">
                  <label className="text-slate-400 uppercase font-bold text-[10px]">Primary Fleet Objective</label>
                  <select
                    value={fleetFormData.primaryGoal}
                    onChange={(e) => setFleetFormData({ ...fleetFormData, primaryGoal: e.target.value })}
                    className="w-full bg-[#18202C] border border-[#2B394D] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value="DOT Physical Pass Rate">DOT Medical Card Pass Rate & Blood Pressure</option>
                    <option value="Driver Retention & Health">Driver Morale, Retention & Health Culture</option>
                    <option value="Work Comp & Sprain Prevention">Workers' Comp Sprain & Slip Fall Reduction</option>
                    <option value="General Fleet Wellness">Comprehensive Carrier-Wide Tactical Wellness</option>
                  </select>
                </div>

                <div className="space-y-1 text-xs font-tactical">
                  <label className="text-slate-400 uppercase font-bold text-[10px]">Additional Notes / Specific Rig Requirements</label>
                  <textarea
                    rows={2}
                    placeholder="Tell Coach AJ about your routes, terminals, or specific driver health initiatives..."
                    value={fleetFormData.notes}
                    onChange={(e) => setFleetFormData({ ...fleetFormData, notes: e.target.value })}
                    className="w-full bg-[#18202C] border border-[#2B394D] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 text-xs resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-[#080D14] font-tactical font-black text-xs uppercase tracking-wider transition shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>{isProcessing ? 'Submitting...' : 'Request Fleet Discount Pricing'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFleetModalOpen(false)}
                    className="px-4 py-3 rounded-xl bg-[#1C2433] hover:bg-[#253145] text-slate-300 text-xs font-tactical font-bold uppercase transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: SQUARE PAYMENTS CHECKOUT */}
      {selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[#10141C] border-2 border-[#FF6B00] rounded-2xl max-w-lg w-full p-6 shadow-2xl text-white space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#202B3B] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/20 border border-[#FF6B00]/50 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#FF6B00]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black font-heading uppercase">
                      Square Secure Checkout
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[9px] font-tactical font-black uppercase">
                      SQUARE PAY
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-tactical">
                    {selectedPlanForCheckout === 'starter' ? '$15/Month Driver Starter' : '$30/Month Road Warrior Pro (All Unlocked)'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedPlanForCheckout(null);
                  setSquareReceipt(null);
                  setSquareError(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-[#1B2330]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {squareReceipt ? (
              <div className="space-y-4 py-4 text-center animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xl font-black font-heading uppercase text-white">
                    Square Payment Approved!
                  </h4>
                  <p className="text-xs text-slate-300 font-tactical max-w-sm mx-auto leading-relaxed">
                    Your subscription to <span className="text-[#FF6B00] font-bold">{squareReceipt.planName}</span> is officially active. All features have been unlocked in your driver vault.
                  </p>
                </div>

                <div className="bg-[#161D29] border border-[#273549] rounded-xl p-4 text-left text-xs font-tactical space-y-2">
                  <div className="flex justify-between pb-1.5 border-b border-[#212C3D]">
                    <span className="text-slate-400">Square Payment ID:</span>
                    <span className="text-white font-mono">{squareReceipt.squarePaymentId}</span>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-[#212C3D]">
                    <span className="text-slate-400">Amount Charged:</span>
                    <span className="text-emerald-400 font-black">${squareReceipt.amount.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-[#212C3D]">
                    <span className="text-slate-400">Payment Method:</span>
                    <span className="text-slate-200">{squareReceipt.paymentMethod === 'square_card' ? `${squareReceipt.cardBrand || 'Card'} •••• ${squareReceipt.last4 || '1111'}` : 'Square Checkout'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-emerald-400 font-bold uppercase">{squareReceipt.status}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setSelectedPlanForCheckout(null);
                      setSquareReceipt(null);
                      onNavigateToWorkout('rest-stop');
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-[#FF6B00] hover:bg-[#FF8526] text-[#0A0D12] text-xs font-tactical font-black uppercase tracking-wider transition shadow-lg shadow-[#FF6B00]/25 flex items-center justify-center gap-2"
                  >
                    <Dumbbell className="w-4 h-4" />
                    <span>Launch My Workouts Now</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedPlanForCheckout(null);
                      setSquareReceipt(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#1B2330] hover:bg-[#253245] text-slate-300 text-xs font-tactical font-bold uppercase"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Method selector: In-App Square Card vs Direct Square Hosted Link */}
                <div className="grid grid-cols-2 bg-[#0A0D12] p-1 rounded-xl border border-[#202938]">
                  <button
                    type="button"
                    onClick={() => setPaymentTab('square-card')}
                    className={`py-2 text-xs font-tactical font-black uppercase rounded-lg transition ${
                      paymentTab === 'square-card'
                        ? 'bg-[#18212E] text-[#FF6B00] shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Square Card & Mobile
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentTab('square-link')}
                    className={`py-2 text-xs font-tactical font-black uppercase rounded-lg transition ${
                      paymentTab === 'square-link'
                        ? 'bg-[#18212E] text-[#FF6B00] shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Hosted Square Link
                  </button>
                </div>

                {/* Plan Summary Strip */}
                <div className="bg-[#141A24] border border-[#232F42] rounded-xl p-3 flex items-center justify-between text-xs font-tactical">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Selected Package:</span>
                    <span className="font-bold text-white uppercase">
                      {selectedPlanForCheckout === 'starter' ? 'Driver Starter' : 'Road Warrior Pro'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Due Today:</span>
                    <span className="text-lg font-black text-[#FF6B00]">
                      {selectedPlanForCheckout === 'starter' ? '$15.00' : '$30.00'}
                    </span>
                  </div>
                </div>

                {paymentTab === 'square-card' ? (
                  <form onSubmit={handleSquarePaymentSubmit} className="space-y-3.5 text-xs font-tactical">
                    <div className="space-y-1">
                      <label className="text-slate-400 uppercase font-bold text-[10px]">Cardholder Name *</label>
                      <input
                        type="text"
                        required
                        value={squareCardholderName}
                        onChange={(e) => setSquareCardholderName(e.target.value)}
                        placeholder="Driver Name as on card"
                        className="w-full bg-[#18202C] border border-[#2B394D] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-400 uppercase font-bold text-[10px]">Card Number *</label>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={handleFillSandboxCard}
                            className="text-[10px] text-emerald-400 hover:underline font-bold"
                          >
                            Auto-fill Square Test Card (Admin Sandbox)
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={squareCardNumber}
                          onChange={(e) => setSquareCardNumber(e.target.value)}
                          placeholder="4111 •••• •••• ••••"
                          maxLength={19}
                          className="w-full bg-[#18202C] border border-[#2B394D] rounded-xl pl-9 pr-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-slate-400 uppercase font-bold text-[10px]">Exp Month</label>
                        <select
                          value={squareExpMonth}
                          onChange={(e) => setSquareExpMonth(e.target.value)}
                          className="w-full bg-[#18202C] border border-[#2B394D] rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-[#FF6B00]"
                        >
                          {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 uppercase font-bold text-[10px]">Exp Year</label>
                        <select
                          value={squareExpYear}
                          onChange={(e) => setSquareExpYear(e.target.value)}
                          className="w-full bg-[#18202C] border border-[#2B394D] rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-[#FF6B00]"
                        >
                          {['25', '26', '27', '28', '29', '30'].map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 uppercase font-bold text-[10px]">CVV / CVC *</label>
                        <input
                          type="text"
                          required
                          maxLength={4}
                          value={squareCvv}
                          onChange={(e) => setSquareCvv(e.target.value)}
                          placeholder="123"
                          className="w-full bg-[#18202C] border border-[#2B394D] rounded-xl px-2.5 py-2 text-white font-mono text-center placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 uppercase font-bold text-[10px]">Billing Postal Code (Zip) *</label>
                      <input
                        type="text"
                        required
                        value={squarePostalCode}
                        onChange={(e) => setSquarePostalCode(e.target.value)}
                        placeholder="e.g. 75001"
                        className="w-full bg-[#18202C] border border-[#2B394D] rounded-xl px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-[#FF6B00]"
                      />
                    </div>

                    {squareError && (
                      <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-600/50 text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{squareError}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Encrypted by Square Web Payments API. PCI-DSS Level 1 compliant.</span>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-3 px-4 rounded-xl bg-[#FF6B00] hover:bg-[#FF8526] text-[#0A0D12] text-xs font-tactical font-black uppercase tracking-wider transition shadow-lg shadow-[#FF6B00]/25 flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-4 h-4 stroke-[2.5]" />
                        <span>
                          {isProcessing
                            ? 'Processing via Square...'
                            : `Pay $${selectedPlanForCheckout === 'starter' ? '15.00' : '30.00'} with Square`}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPlanForCheckout(null)}
                        className="w-full py-2.5 rounded-xl bg-[#18202C] hover:bg-[#222C3D] text-slate-300 text-xs font-tactical font-bold uppercase transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4 text-xs font-tactical">
                    <p className="text-slate-300 leading-relaxed">
                      Prefer to check out directly on Square's hosted payment page? Click below to launch Square Checkout in your browser with Cash App Pay, Apple Pay, Google Pay, or Credit Card.
                    </p>

                    <div className="p-3 bg-[#161D29] border border-[#273549] rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Hosted Square URL:</span>
                        <span className="text-emerald-400 font-mono text-[11px]">
                          {selectedPlanForCheckout === 'starter'
                            ? squareConfig.starterCheckoutUrl || 'https://square.link/u/starter-15'
                            : squareConfig.proCheckoutUrl || 'https://square.link/u/pro-30'}
                        </span>
                      </div>
                      <a
                        href={selectedPlanForCheckout === 'starter' ? (squareConfig.starterCheckoutUrl || '#') : (squareConfig.proCheckoutUrl || '#')}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs flex items-center justify-center gap-2 transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Open Square Hosted Checkout Link</span>
                      </a>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={async () => {
                            const updated = await activatePackage(selectedPlanForCheckout, currentDriver?.id);
                            onMembershipUpdated(updated);
                            setSelectedPlanForCheckout(null);
                            showFeedback(`[Admin] Activated ${selectedPlanForCheckout === 'starter' ? '$15 Starter' : '$30 Pro'}!`);
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-600/60 font-bold uppercase text-xs transition"
                        >
                          [Super Admin] Bypass: Activate My Vault
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedPlanForCheckout(null)}
                        className="w-full py-2 rounded-xl text-slate-400 hover:text-white text-xs uppercase"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
