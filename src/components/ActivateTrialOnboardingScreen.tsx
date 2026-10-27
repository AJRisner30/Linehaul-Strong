import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Dumbbell, 
  MapPin, 
  Activity, 
  Utensils, 
  Bed, 
  WifiOff, 
  CheckCircle2, 
  Lock, 
  Mail, 
  User, 
  Radio, 
  Truck, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { createDriverAccount, loginDriver, resetDriverPassword, signInAsAdmin } from '../lib/auth';
import { activateFreeTrial } from '../lib/subscription';
import { DriverAccount } from '../types';

interface ActivateTrialOnboardingScreenProps {
  onTrialActivated: (driver: Omit<DriverAccount, 'passwordHash'>) => void;
}

export const ActivateTrialOnboardingScreen: React.FC<ActivateTrialOnboardingScreenProps> = ({
  onTrialActivated
}) => {
  const [mode, setMode] = useState<'activate' | 'signin'>('activate');

  // Form Fields
  const [name, setName] = useState('');
  const [callsign, setCallsign] = useState('');
  const [carrier, setCarrier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleForgotPassword = async () => {
    setError(null);
    setResetMessage(null);
    if (!email || !email.includes('@')) {
      setError('Please enter your driver email above first, then click Forgot Password.');
      return;
    }
    setIsSubmitting(true);
    const res = await resetDriverPassword(email);
    setIsSubmitting(false);
    if (!res.success) {
      setError(res.error || 'Failed to send reset link.');
    } else {
      setResetMessage(res.message || `Password reset link sent to ${email}. Check your inbox!`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'activate') {
        const res = await createDriverAccount({
          name,
          email,
          password,
          callsign,
          carrier
        });

        if (!res.success || !res.driver) {
          setError(res.error || 'Failed to create driver account.');
          setIsSubmitting(false);
          return;
        }

        // Activate 14-day free trial on account creation
        await activateFreeTrial(res.driver.id);
        onTrialActivated(res.driver);
      } else {
        const res = await loginDriver(email, password);
        if (!res.success || !res.driver) {
          setError(res.error || 'Invalid driver email or password.');
          setIsSubmitting(false);
          return;
        }

        onTrialActivated(res.driver);
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFastAdmin = async () => {
    setIsSubmitting(true);
    try {
      const admin = await signInAsAdmin();
      onTrialActivated(admin);
    } catch (e: any) {
      setError(e?.message || 'Admin clearance error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090C] text-[#E2E8F0] flex flex-col justify-between selection:bg-[#FF6B00] selection:text-[#0D0F12]">
      {/* Top Banner */}
      <header className="border-b border-[#1A202A] bg-[#0A0D12]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-b from-[#1C2430] to-[#0A0D12] border-2 border-[#FF6B00] p-1 flex items-center justify-center shadow-md shadow-[#FF6B00]/20">
              <img
                src="/icon.svg"
                alt="Linehaul Strong"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="font-heading font-black text-white uppercase tracking-wider text-lg leading-none">
                LINEHAUL <span className="text-[#FF6B00]">STRONG</span>
              </span>
              <p className="text-[10px] text-slate-400 font-tactical uppercase tracking-wider mt-0.5">
                Tactical Semi-Truck Performance System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-600/50 text-[11px] font-tactical font-black uppercase tracking-wider flex items-center gap-1.5 shadow">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>14-DAY ALL-ACCESS TRIAL</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: What's Included in the 14-Day Free Trial */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B00]/15 border border-[#FF6B00]/40 text-xs font-tactical font-black text-[#FF6B00] uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Zero Commitment • Instant Access</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading uppercase text-white tracking-wide leading-tight">
                Activate Your <span className="text-[#FF6B00]">14-Day Free Trial</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-tactical leading-relaxed">
                Experience the complete tactical physical readiness program engineered specifically for commercial truck drivers. No payment upfront, no credit card required to start.
              </p>
            </div>

            {/* Trial Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-[#0F141D] border border-[#222E40] rounded-2xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase font-heading">
                  <div className="w-7 h-7 rounded-lg bg-[#FF6B00]/20 border border-[#FF6B00]/40 flex items-center justify-center text-[#FF6B00] shrink-0">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <span>Road Warrior 3-Day Gym Split</span>
                </div>
                <p className="text-[11px] text-slate-400 font-tactical leading-snug">
                  Heavy barbell and dumbbell Push/Pull/Legs protocols built for commercial gyms.
                </p>
              </div>

              <div className="bg-[#0F141D] border border-[#222E40] rounded-2xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase font-heading">
                  <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-600/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span>Gyms & 53' Semi Parking GPS</span>
                </div>
                <p className="text-[11px] text-slate-400 font-tactical leading-snug">
                  Locate Planet Fitness & Anytime Fitness along major corridors with verified trailer staging.
                </p>
              </div>

              <div className="bg-[#0F141D] border border-[#222E40] rounded-2xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase font-heading">
                  <div className="w-7 h-7 rounded-lg bg-sky-950 border border-sky-600/40 flex items-center justify-center text-sky-400 shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span>Rest Stop & In-Cab Dumbbells</span>
                </div>
                <p className="text-[11px] text-slate-400 font-tactical leading-snug">
                  Tire & grab rail anchors plus sleeper bunk dumbbell routines for zero-gym days.
                </p>
              </div>

              <div className="bg-[#0F141D] border border-[#222E40] rounded-2xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase font-heading">
                  <div className="w-7 h-7 rounded-lg bg-amber-950 border border-amber-600/40 flex items-center justify-center text-amber-400 shrink-0">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <span>Cab-Galley 12V Cooker Guide</span>
                </div>
                <p className="text-[11px] text-slate-400 font-tactical leading-snug">
                  12V slow-cooker recipes, fuel station health grades, and grocery prep lists.
                </p>
              </div>
            </div>

            {/* Offline & Trust Guarantees */}
            <div className="p-4 rounded-2xl bg-[#0B0E14] border border-[#1E2736] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-tactical">
              <div className="flex items-center gap-2 text-slate-300">
                <WifiOff className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>100% Offline Capable:</strong> Works in 0-bars dead zones & bunks.</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span>Full 14-day test drive before picking a subscription.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Activation & Sign Up Form Card */}
          <div className="lg:col-span-5 bg-[#0F131B] border-2 border-[#FF6B00]/70 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Top Hazard Accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FF6B00] via-[#FFA800] to-[#FF6B00]" />

            {/* Ambient Background Glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              {/* Card Mode Tabs */}
              <div className="grid grid-cols-2 bg-[#090C10] p-1 rounded-xl border border-[#212A38]">
                <button
                  type="button"
                  onClick={() => {
                    setMode('activate');
                    setError(null);
                  }}
                  className={`py-2 text-xs font-tactical font-black uppercase tracking-wider rounded-lg transition ${
                    mode === 'activate'
                      ? 'bg-[#FF6B00] text-[#0A0D12] shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Activate Free Trial
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                  }}
                  className={`py-2 text-xs font-tactical font-black uppercase tracking-wider rounded-lg transition ${
                    mode === 'signin'
                      ? 'bg-[#FF6B00] text-[#0A0D12] shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In to Cab
                </button>
              </div>

              <div>
                <h3 className="text-xl font-black font-heading uppercase text-white tracking-wide">
                  {mode === 'activate' ? 'Start 14-Day Free Trial' : 'Welcome Back, Driver'}
                </h3>
                <p className="text-xs text-slate-400 font-tactical mt-0.5">
                  {mode === 'activate'
                    ? 'Create your private driver vault to immediately unlock your 14-day trial.'
                    : 'Sign in to access your saved logs, workouts, and membership status.'}
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-600/70 text-rose-300 text-xs font-tactical flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {resetMessage && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-600/70 text-emerald-300 text-xs font-tactical flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{resetMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === 'activate' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-tactical text-slate-300 uppercase tracking-wider mb-1">
                        Driver Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Jesse Miller"
                          className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#090C10] border border-[#253042] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#FF6B00]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-tactical text-slate-300 uppercase tracking-wider mb-1">
                          CB Callsign / Handle
                        </label>
                        <div className="relative">
                          <Radio className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={callsign}
                            onChange={(e) => setCallsign(e.target.value)}
                            placeholder="e.g. IronBunk"
                            className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#090C10] border border-[#253042] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#FF6B00]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-tactical text-slate-300 uppercase tracking-wider mb-1">
                          Carrier / Fleet
                        </label>
                        <div className="relative">
                          <Truck className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={carrier}
                            onChange={(e) => setCarrier(e.target.value)}
                            placeholder="e.g. Owner-Op"
                            className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#090C10] border border-[#253042] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#FF6B00]"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[11px] font-tactical text-slate-300 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="driver@linehaulstrong.com"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#090C10] border border-[#253042] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-tactical text-slate-300 uppercase tracking-wider">
                      Password (min 6 chars) *
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-[10px] font-tactical text-[#FF6B00] hover:underline"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2.5 text-xs bg-[#090C10] border border-[#253042] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#FF6B00]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 mt-2 rounded-xl bg-[#FF6B00] hover:bg-[#FF8526] text-[#0A0D12] font-tactical font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#FF6B00]/25 transition active:scale-[0.98]"
                >
                  <span>
                    {isSubmitting 
                      ? 'Connecting Private Vault...' 
                      : mode === 'activate' 
                        ? 'Activate 14-Day Free Trial & Enter Cab' 
                        : 'Sign In to My Cab'}
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </form>

              {/* Fast clearance for Coach AJ / Admin */}
              <div className="pt-2 border-t border-[#1F2735] flex items-center justify-between text-[11px] font-tactical text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Isolated Driver Vault</span>
                </span>
                <button
                  type="button"
                  onClick={handleFastAdmin}
                  className="text-amber-400 hover:underline font-bold"
                >
                  Admin Fast Clearance
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Rugged Tactical Footer */}
      <footer className="border-t border-[#171D27] bg-[#07090C] py-4 text-center text-xs text-slate-500 font-tactical">
        <p>Linehaul Strong • Founded by AJ Risner (ISSA Elite Trainer, CPT) • Heavy haul & linehaul driver performance engineering.</p>
      </footer>
    </div>
  );
};
