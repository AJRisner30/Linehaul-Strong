import React, { useState } from 'react';
import {
  User,
  Lock,
  Mail,
  Truck,
  Radio,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  X,
  Dumbbell,
  MapPin,
  Clock
} from 'lucide-react';
import { createDriverAccount, loginDriver, resetDriverPassword } from '../lib/auth';
import { DriverAccount } from '../types';

interface DriverAuthModalProps {
  isOpen: boolean;
  onSuccess: (driver: Omit<DriverAccount, 'passwordHash'>) => void;
  onClose?: () => void;
  initialMode?: 'signin' | 'signup';
}

export function DriverAuthModal({ isOpen, onSuccess, onClose, initialMode = 'signup' }: DriverAuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [callsign, setCallsign] = useState('');
  const [carrier, setCarrier] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleForgotPassword = async () => {
    setError(null);
    setResetMessage(null);
    if (!email || !email.includes('@')) {
      setError('Please type your email address above, then click Forgot Password.');
      return;
    }
    setIsSubmitting(true);
    const res = await resetDriverPassword(email);
    setIsSubmitting(false);
    if (!res.success) {
      setError(res.error || 'Failed to send reset email.');
    } else {
      setResetMessage(res.message || `Password reset link sent to ${email}. Check your email inbox!`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
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

        onSuccess(res.driver);
      } else {
        const res = await loginDriver(email, password);
        if (!res.success || !res.driver) {
          setError(res.error || 'Failed to sign in. Please check your email and password.');
          setIsSubmitting(false);
          return;
        }

        onSuccess(res.driver);
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#080A0E]/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#10141C] border-2 border-[#FF6B00]/60 rounded-3xl shadow-2xl overflow-hidden my-auto relative animate-in fade-in zoom-in-95 duration-200">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1.5 rounded-xl bg-[#141822] text-slate-400 hover:text-white border border-[#2B3547] transition hover:bg-[#1C2331]"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#171E2B] via-[#121721] to-[#171E2B] border-b border-[#232B3B] p-5 sm:p-6 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#0C0F14] border-2 border-[#FF6B00] p-1.5 shadow-xl shadow-[#FF6B00]/25 flex items-center justify-center mb-3">
            <img
              src="/icon.svg"
              alt="Linehaul Strong"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-[10px] font-tactical font-black text-emerald-400 uppercase tracking-widest mb-2 shadow">
            <Zap className="w-3 h-3 fill-current" />
            <span>{mode === 'signup' ? '14-DAY ALL-ACCESS FREE TRIAL' : 'DRIVER VAULT ACCESS'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-heading tracking-wide">
            {mode === 'signup' ? 'Activate 14-Day Free Trial' : 'Sign In to Driver Cab'}
          </h2>
          <p className="text-xs text-slate-300 font-tactical mt-1 max-w-md mx-auto">
            {mode === 'signup'
              ? 'Complete, unrestricted road test-drive of the Road Warrior commercial gym split, 53\' parking GPS, and rig protocols. No credit card required.'
              : 'Sign in to access your saved workouts, telemetry logbook, and active membership subscription.'}
          </p>

          {/* Trial Value Proposition Pills (Sign Up mode only) */}
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-2 mt-4 text-left font-tactical">
              <div className="bg-[#121722]/80 border border-[#20293A] rounded-xl p-2.5 flex items-start gap-2">
                <Dumbbell className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                <span className="text-[11px] text-slate-200 leading-tight">
                  <strong>Road Warrior Gym Split</strong> included for 14 days
                </span>
              </div>
              <div className="bg-[#121722]/80 border border-[#20293A] rounded-xl p-2.5 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                <span className="text-[11px] text-slate-200 leading-tight">
                  <strong>Gyms & 53' Semi Parking GPS</strong> fully unlocked
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 border-b border-[#232B3B] bg-[#0C0F14]">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`py-3 text-xs font-tactical font-black uppercase tracking-wider transition ${
              mode === 'signup'
                ? 'bg-[#141A24] text-[#FF6B00] border-b-2 border-[#FF6B00]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Activate 14-Day Trial
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`py-3 text-xs font-tactical font-black uppercase tracking-wider transition ${
              mode === 'signin'
                ? 'bg-[#141A24] text-[#FF6B00] border-b-2 border-[#FF6B00]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In to Cab
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-600/70 text-rose-200 text-xs font-tactical flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resetMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-600/60 text-emerald-300 text-xs font-tactical flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{resetMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
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
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#0C0F14] border border-[#263143] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        placeholder="e.g. NightHawk"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-[#0C0F14] border border-[#263143] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#FF6B00]"
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
                        placeholder="e.g. Knight-Swift / Owner-Op"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-[#0C0F14] border border-[#263143] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#FF6B00]"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-tactical text-slate-300 uppercase tracking-wider mb-1">
                Driver Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="driver@linehaul.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#0C0F14] border border-[#263143] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-tactical text-slate-300 uppercase tracking-wider">
                  Password * (Min 6 Characters)
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
                  className="w-full pl-9 pr-9 py-2.5 text-xs bg-[#0C0F14] border border-[#263143] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-[#FF6B00]"
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
              className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-[#FF6B00] via-[#FF7E1F] to-[#FF6B00] hover:from-[#FF7E1F] hover:to-[#FF6B00] text-[#0A0D12] font-tactical font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#FF6B00]/30 transition active:scale-[0.98]"
            >
              {isSubmitting ? (
                <span>Processing...</span>
              ) : mode === 'signup' ? (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Activate 14-Day Free Trial & Start</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 stroke-[2.5]" />
                  <span>Sign In to My Cab</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
          </form>

          {/* Privacy & Zero Obligation Notice */}
          <div className="p-3 rounded-xl bg-[#141922] border border-[#202736] space-y-1 text-[11px] text-slate-400 font-tactical">
            <p className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>100% Free • Zero Credit Card • Private Isolated Vault</span>
            </p>
            <p className="text-slate-300">
              {mode === 'signup'
                ? 'Your 14-day free trial gives you full access to all road workouts and gym GPS. At the end of the trial, you can choose to subscribe ($15 Starter or $30 Pro) or let it expire.'
                : 'Your profile, custom routines, and workout telemetry are securely stored in your isolated driver vault.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
