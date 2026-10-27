import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  MapPin, 
  ClipboardList, 
  Award, 
  Dumbbell, 
  Mail, 
  Zap, 
  Utensils, 
  Bed, 
  Droplet,
  UserCheck,
  LogOut,
  LogIn,
  Upload,
  ShieldAlert,
  Lock,
  CreditCard,
  Tag,
  ChevronLeft,
  ChevronRight,
  Smartphone
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { usePWAInstall } from './usePWAInstall';
import { DriverAccount } from '../types';
import { isCoachUser, isAdminUser } from '../lib/coaching';
import { MembershipMetadata, isFeatureUnlocked } from '../lib/subscription';

export type ActiveNavTab = 
  | 'rest-stop' 
  | 'light-db' 
  | 'road-warrior'
  | 'dock-drills' 
  | 'custom-plan'
  | 'admin-center'
  | 'coach-portal'
  | 'pricing'
  | 'nutrition' 
  | 'hos-recovery' 
  | 'hydration' 
  | 'hub-runner' 
  | 'logbook' 
  | 'founder' 
  | 'contact';

interface BrandHeaderProps {
  activeTab: ActiveNavTab;
  onTabChange: (tab: ActiveNavTab) => void;
  completedWorkoutsCount: number;
  currentDriver: Omit<DriverAccount, 'passwordHash'> | null;
  currentMembership?: MembershipMetadata;
  onSignOut: () => void;
  onOpenAuth: () => void;
  onOpenAndroidHub?: () => void;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  activeTab,
  onTabChange,
  completedWorkoutsCount,
  currentDriver,
  currentMembership,
  onSignOut,
  onOpenAuth,
  onOpenAndroidHub
}) => {
  const { isInstalled } = usePWAInstall();
  const userTier = currentMembership?.tier || 'none';
  const isAdmin = !!(currentDriver?.email && isAdminUser(currentDriver.email));
  const isCoach = !!(currentDriver?.email && isCoachUser(currentDriver.email));
  const isRestStopLocked = !isFeatureUnlocked(userTier, 'rest-stop');
  const isLightDbLocked = !isFeatureUnlocked(userTier, 'light-db');
  const isRoadWarriorLocked = !isFeatureUnlocked(userTier, 'road-warrior');
  const isDockDrillsLocked = !isFeatureUnlocked(userTier, 'dock-drills');
  const isCustomPlanLocked = !isFeatureUnlocked(userTier, 'custom-plan');
  const isHubRunnerLocked = !isFeatureUnlocked(userTier, 'hub-runner');
  const isNutritionLocked = !isFeatureUnlocked(userTier, 'nutrition');
  const isHosRecoveryLocked = !isFeatureUnlocked(userTier, 'hos-recovery');
  const isHydrationLocked = !isFeatureUnlocked(userTier, 'hydration');
  const isLogbookLocked = !isFeatureUnlocked(userTier, 'telemetry-export');

  // Interactive horizontal sliding banner state & refs
  const navScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);

  const updateScrollButtons = useCallback(() => {
    const el = navScrollRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 8);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    }
  }, []);

  useEffect(() => {
    const el = navScrollRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [updateScrollButtons]);

  // Automatically scroll to active tab on change
  useEffect(() => {
    const el = navScrollRef.current;
    if (!el) return;
    const activeBtn = el.querySelector<HTMLElement>(`[data-tab="${activeTab}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    setTimeout(updateScrollButtons, 350);
  }, [activeTab, updateScrollButtons]);

  const slideLeft = () => {
    if (navScrollRef.current) {
      navScrollRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const slideRight = () => {
    if (navScrollRef.current) {
      navScrollRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  const handleNavWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (navScrollRef.current && e.deltaY !== 0) {
      navScrollRef.current.scrollLeft += e.deltaY;
      updateScrollButtons();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!navScrollRef.current) return;
    setIsDragging(true);
    setDragStartX(e.pageX - navScrollRef.current.offsetLeft);
    setDragScrollLeft(navScrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !navScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - navScrollRef.current.offsetLeft;
    const walk = (x - dragStartX) * 1.5;
    navScrollRef.current.scrollLeft = dragScrollLeft - walk;
    updateScrollButtons();
  };

  const handleMouseEnd = () => {
    setIsDragging(false);
  };

  return (
    <header className="border-b border-[#222731] bg-[#0A0C0E]/95 backdrop-blur sticky top-0 z-40">
      {/* Top Tactical Status Bar */}
      <div className="bg-[#12151B] border-b border-[#1A1F27] px-4 py-1 text-[11px] font-tactical tracking-wider text-[#94A3B8] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#FF6B00]">
            <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse"></span>
            <span className="font-semibold text-white">DOT REST COMPLIANCE: READY</span>
          </div>
          <span className="text-[#333D4D]">|</span>
          <span className="hidden sm:inline text-slate-400">FOUNDER: AJ RISNER (ISSA ELITE TRAINER)</span>
        </div>
        <div className="flex items-center gap-3">
          {currentDriver ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-tactical text-[11px] flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-white font-bold">{currentDriver.name}</span>
                {currentDriver.callsign && (
                  <span className="text-[#FF6B00]">"{currentDriver.callsign}"</span>
                )}
              </span>
              <button
                onClick={onSignOut}
                className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center gap-1 border border-[#2B3545] hover:border-rose-600/60 px-2 py-0.5 rounded transition"
                title="Sign out of private driver vault"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-[11px] text-[#FF6B00] hover:underline flex items-center gap-1 font-bold"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Driver Sign In / Create Account</span>
            </button>
          )}
          <span className="text-[#333D4D]">|</span>
          <div className="text-[#E2E8F0]">LOGS: <span className="text-[#FF6B00] font-bold">{completedWorkoutsCount}</span></div>
        </div>
      </div>

      {/* Main Brand Identity Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Brand Logo Integration: Highway Shield + American Semi-Truck + Kettlebell */}
          <div className="relative group cursor-pointer" onClick={() => onTabChange('founder')}>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#1A202A] to-[#0A0C0F] border-2 border-[#FF6B00] p-1 shadow-xl shadow-[#FF6B00]/25 flex items-center justify-center transition-transform group-hover:scale-105">
              <img
                src="/icon.svg"
                alt="Linehaul Strong - Semi-Truck Tactical Fitness"
                className="w-full h-full object-contain drop-shadow"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Reflective Corner Badge */}
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FF6B00] rounded-full border-2 border-[#0A0C0E] shadow"></div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-wider uppercase text-white leading-none">
                LINEHAUL <span className="text-[#FF6B00]">STRONG</span>
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-tactical font-bold bg-[#FF6B00]/15 text-[#FF6B00] border border-[#FF6B00]/30 uppercase">
                TACTICAL RIG FIT
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium tracking-wide text-[#94A3B8] uppercase font-tactical mt-0.5">
              Built for the Long Haul
            </p>
          </div>
        </div>

        {/* Action Controls & Driver Auth & PWA Install */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto overflow-x-auto no-scrollbar touch-pan-x justify-start md:justify-end py-1 md:py-0">
          {onOpenAndroidHub && (
            <button
              type="button"
              onClick={onOpenAndroidHub}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141A24] hover:bg-[#1E2736] border border-[#2B3B52] text-xs font-tactical font-bold text-slate-200 transition shrink-0"
              title="Android App Specifications, WebAPK install, and Capacitor APK Hub"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span className="hidden sm:inline">Android App</span>
              <span className="sm:hidden">Android</span>
            </button>
          )}

          {!isInstalled && <PWAInstallButton compact={true} />}

          {currentDriver ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141A24] border border-[#263345] text-xs font-tactical shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-300">CAB VAULT:</span>
              <span className="text-white font-bold">{currentDriver.name}</span>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-tactical font-black uppercase bg-[#FF6B00] text-[#0D0F12] hover:bg-[#E05E00] shadow-md shadow-[#FF6B00]/20 transition shrink-0"
            >
              <LogIn className="w-3.5 h-3.5 stroke-[3]" />
              <span>Driver Account</span>
            </button>
          )}

          {/* Super Admin & Coach Command Center Button - Strictly visible to Admin risneraryan@gmail.com */}
          {isAdmin ? (
            <button
              onClick={() => onTabChange('admin-center')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition border shrink-0 ${
                activeTab === 'admin-center'
                  ? 'bg-amber-400 text-[#0A0D12] border-amber-400 shadow-md shadow-amber-400/25'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/50 hover:bg-amber-500/25'
              }`}
              title="Access full Driver Vault, Fleet CRM, and Square Payments Hub"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Center</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          ) : isCoach ? (
            <button
              onClick={() => onTabChange('coach-portal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition border shrink-0 ${
                activeTab === 'coach-portal'
                  ? 'bg-[#FF6B00] text-[#0A0D12] border-[#FF6B00] shadow-md shadow-[#FF6B00]/20'
                  : 'bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00] animate-pulse'
              }`}
              title="Upload custom plans & review driver enrollments"
            >
              <Upload className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Coach Portal</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </button>
          ) : null}

          {/* Pricing & Packages Direct Header Access */}
          <button
            onClick={() => onTabChange('pricing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition border shrink-0 ${
              activeTab === 'pricing'
                ? 'bg-[#FF6B00] text-[#0D0F12] border-[#FF6B00] shadow-md shadow-[#FF6B00]/25'
                : 'bg-[#151D28] text-white border-emerald-500/50 hover:bg-emerald-950/40 hover:border-emerald-400'
            }`}
            title="View 14-day free trial, $15 starter, $30 pro, and fleet packages"
          >
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Packages &</span>
            <span>Pricing</span>
            {currentMembership?.tier === 'trial' ? (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                14D TRIAL
              </span>
            ) : currentMembership?.tier === 'pro' ? (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40">
                PRO ($30)
              </span>
            ) : currentMembership?.tier === 'starter' ? (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                $15
              </span>
            ) : currentMembership?.trialExpiresDate ? (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-700/60 font-black animate-pulse">
                TRIAL EXPIRED
              </span>
            ) : (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-700/60 font-bold">
                ACTIVATE TRIAL
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('founder')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition border shrink-0 ${
              activeTab === 'founder'
                ? 'bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]'
                : 'bg-[#151921] text-[#CBD5E1] border-[#252E3B] hover:border-[#FF6B00]/50 hover:text-white'
            }`}
            title="Read Founder Coach AJ Risner's heavy-haul training doctrine"
          >
            <Award className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span className="hidden sm:inline">AJ Risner</span>
            <span>Doctrine</span>
          </button>

          <button
            onClick={() => onTabChange('contact')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition border shrink-0 ${
              activeTab === 'contact'
                ? 'bg-[#FF6B00] text-[#0D0F12] border-[#FF6B00] shadow-md shadow-[#FF6B00]/20'
                : 'bg-[#151921] text-white border-[#FF6B00]/40 hover:bg-[#FF6B00]/10 hover:border-[#FF6B00]'
            }`}
            title="Contact Head Coach AJ Risner directly"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Coaching & Contact</span>
          </button>
        </div>
      </div>

      {/* Interactive Sliding Navigation Selection Banner */}
      <div className="border-t border-[#1C222B] bg-[#0E1116] relative">
        {/* Left Slide Arrow Button */}
        <button
          type="button"
          onClick={slideLeft}
          disabled={!canScrollLeft}
          title="Slide left to view previous workouts & tools"
          aria-label="Slide navigation left to see previous tabs"
          className={`absolute left-0 top-0 bottom-0 z-30 flex items-center pl-2 pr-4 bg-gradient-to-r from-[#0E1116] via-[#0E1116]/95 to-transparent transition-all duration-200 ${
            canScrollLeft ? 'opacity-100 cursor-pointer pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <span className="w-8 h-8 rounded-lg bg-[#18212E] hover:bg-[#FF6B00] text-slate-200 hover:text-black border border-[#2D3C52] hover:border-[#FF6B00] flex items-center justify-center shadow-xl shadow-black/80 transition group">
            <ChevronLeft className="w-5 h-5 stroke-[2.5] transition-transform group-hover:-translate-x-0.5" />
          </span>
        </button>

        {/* Right Slide Arrow Button */}
        <button
          type="button"
          onClick={slideRight}
          disabled={!canScrollRight}
          title="Slide right to view more programs & tools"
          aria-label="Slide navigation right to see more tabs"
          className={`absolute right-0 top-0 bottom-0 z-30 flex items-center pr-2 pl-4 bg-gradient-to-l from-[#0E1116] via-[#0E1116]/95 to-transparent transition-all duration-200 ${
            canScrollRight ? 'opacity-100 cursor-pointer pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <span className="w-8 h-8 rounded-lg bg-[#18212E] hover:bg-[#FF6B00] text-slate-200 hover:text-black border border-[#2D3C52] hover:border-[#FF6B00] flex items-center justify-center shadow-xl shadow-black/80 transition group">
            <ChevronRight className="w-5 h-5 stroke-[2.5] transition-transform group-hover:translate-x-0.5" />
          </span>
        </button>

        {/* Sliding Tabs Bar */}
        <div
          ref={navScrollRef}
          onWheel={handleNavWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseEnd}
          onMouseLeave={handleMouseEnd}
          className={`max-w-7xl mx-auto flex overflow-x-auto no-scrollbar gap-1 sm:gap-2 px-8 sm:px-12 scroll-smooth touch-pan-x ${
            isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
          }`}
        >
          <button
            data-tab="rest-stop"
            onClick={() => onTabChange('rest-stop')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 shrink-0 ${
              activeTab === 'rest-stop'
                ? 'border-[#FF6B00] text-[#FF6B00] bg-[#FF6B00]/10'
                : 'border-transparent text-[#94A3B8] hover:text-white hover:border-slate-600'
            }`}
          >
            <Activity className="w-4 h-4 text-[#FF6B00]" />
            <span>Rest Stop Protocol</span>
            {isRestStopLocked ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-600/60 font-tactical font-black flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>LOCKED</span>
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#202733] text-slate-300 font-tactical">4-DAY</span>
            )}
          </button>

          <button
            data-tab="light-db"
            onClick={() => onTabChange('light-db')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 shrink-0 ${
              activeTab === 'light-db'
                ? 'border-[#FF6B00] text-[#FF6B00] bg-[#FF6B00]/10'
                : 'border-transparent text-[#94A3B8] hover:text-white hover:border-slate-600'
            }`}
          >
            <Dumbbell className="w-4 h-4 text-[#FF6B00]" />
            <span>Light DB Anywhere</span>
            {isLightDbLocked ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-600/60 font-tactical font-black flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>LOCKED</span>
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#202733] text-slate-300 font-tactical">BUNK/BOX</span>
            )}
          </button>

          <button
            data-tab="road-warrior"
            onClick={() => onTabChange('road-warrior')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 shrink-0 ${
              activeTab === 'road-warrior'
                ? 'border-[#FF6B00] text-[#FF6B00] bg-[#FF6B00]/10'
                : 'border-transparent text-[#94A3B8] hover:text-white hover:border-slate-600'
            }`}
          >
            <Dumbbell className="w-4 h-4 text-[#FF6B00]" />
            <span>Road Warrior Gym</span>
            {isRoadWarriorLocked ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-600/60 font-tactical font-black flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>{userTier === 'none' ? 'LOCKED' : 'PRO'}</span>
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-tactical font-black">
                3-DAY GYM
              </span>
            )}
          </button>

          <button
            data-tab="dock-drills"
            onClick={() => onTabChange('dock-drills')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 shrink-0 ${
              activeTab === 'dock-drills'
                ? 'border-[#FF6B00] text-[#FF6B00] bg-[#FF6B00]/10'
                : 'border-transparent text-[#94A3B8] hover:text-white hover:border-slate-600'
            }`}
          >
            <Zap className="w-4 h-4 text-[#FF6B00]" />
            <span>Dock Door Drills</span>
            {isDockDrillsLocked ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-600/60 font-tactical font-black flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>LOCKED</span>
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FF6B00]/20 text-[#FF6B00] font-tactical font-black">
                5-10M MICRO
              </span>
            )}
          </button>

          <button
            data-tab="custom-plan"
            onClick={() => onTabChange('custom-plan')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 shrink-0 ${
              activeTab === 'custom-plan'
                ? 'border-[#FF6B00] text-[#FF6B00] bg-[#FF6B00]/10'
                : 'border-transparent text-[#94A3B8] hover:text-white hover:border-slate-600'
            }`}
          >
            <Award className="w-4 h-4 text-[#FF6B00]" />
            <span>My Custom Plan</span>
            {isCustomPlanLocked ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-600/60 font-tactical font-black flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>PRO</span>
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FF6B00]/20 text-[#FF6B00] font-tactical font-black">
                1-ON-1
              </span>
            )}
          </button>

          {/* Packages & Pricing Tab */}
          <button
            data-tab="pricing"
            onClick={() => onTabChange('pricing')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 shrink-0 ${
              activeTab === 'pricing'
                ? 'border-[#FF6B00] text-[#FF6B00] bg-[#FF6B00]/10'
                : 'border-transparent text-emerald-400 hover:text-white hover:border-emerald-500'
            }`}
          >
            <Tag className="w-4 h-4 text-emerald-400" />
            <span>Packages & Pricing</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 font-tactical font-black border border-emerald-600/40">
              TRIAL / $15 / $30 / FLEET
            </span>
          </button>

          {/* Founder Doctrine Tab */}
          <button
            data-tab="founder"
            onClick={() => onTabChange('founder')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 shrink-0 ${
              activeTab === 'founder'
                ? 'border-[#FF6B00] text-[#FF6B00] bg-[#FF6B00]/10'
                : 'border-transparent text-[#CBD5E1] hover:text-white hover:border-slate-600'
            }`}
          >
            <Award className="w-4 h-4 text-[#FF6B00]" />
            <span>AJ Risner Doctrine</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FF6B00]/20 text-[#FF6B00] font-tactical font-black">
              DOCTRINE
            </span>
          </button>

          {/* Coach Contact Tab */}
          <button
            data-tab="contact"
            onClick={() => onTabChange('contact')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 shrink-0 ${
              activeTab === 'contact'
                ? 'border-[#FF6B00] text-[#FF6B00] bg-[#FF6B00]/10'
                : 'border-transparent text-[#94A3B8] hover:text-white hover:border-slate-600'
            }`}
          >
            <Mail className="w-4 h-4 text-[#FF6B00]" />
            <span>Coach Contact</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-tactical">
              AJ 1-ON-1
            </span>
          </button>

          <button
            data-tab="hub-runner"
            onClick={() => onTabChange('hub-runner')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 shrink-0 ${
              activeTab === 'hub-runner'
                ? 'border-[#FF6B00] text-[#FF6B00] bg-[#FF6B00]/10'
                : 'border-transparent text-[#94A3B8] hover:text-white hover:border-slate-600'
            }`}
          >
            <MapPin className="w-4 h-4 text-[#FF6B00]" />
            <span>Gyms & Truck Parking GPS</span>
            {isHubRunnerLocked ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-600/60 font-tactical font-black flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>{userTier === 'none' ? 'LOCKED' : 'PRO'}</span>
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-tactical font-black">
                GYM GPS
              </span>
            )}
          </button>

          <button
            data-tab="nutrition"
            onClick={() => onTabChange('nutrition')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 shrink-0 ${
              activeTab === 'nutrition'
                ? 'border-[#FF6B00] text-[#FF6B00] bg-[#FF6B00]/10'
                : 'border-transparent text-[#94A3B8] hover:text-white hover:border-slate-600'
            }`}
          >
            <Utensils className="w-4 h-4 text-[#FF6B00]" />
            <span>Cab-Galley & Fuel Grades</span>
            {isNutritionLocked ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-600/60 font-tactical font-black flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>LOCKED</span>
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-tactical">FOOD/12V</span>
            )}
          </button>

          <button
            data-tab="hos-recovery"
            onClick={() => onTabChange('hos-recovery')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 shrink-0 ${
              activeTab === 'hos-recovery'
                ? 'border-[#FF6B00] text-[#FF6B00] bg-[#FF6B00]/10'
                : 'border-transparent text-[#94A3B8] hover:text-white hover:border-slate-600'
            }`}
          >
            <Bed className="w-4 h-4 text-[#FF6B00]" />
            <span>HOS Recovery</span>
            {isHosRecoveryLocked ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-600/60 font-tactical font-black flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>LOCKED</span>
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 font-tactical">SLEEP/REST</span>
            )}
          </button>

          <button
            data-tab="hydration"
            onClick={() => onTabChange('hydration')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 shrink-0 ${
              activeTab === 'hydration'
                ? 'border-[#FF6B00] text-[#FF6B00] bg-[#FF6B00]/10'
                : 'border-transparent text-[#94A3B8] hover:text-white hover:border-slate-600'
            }`}
          >
            <Droplet className="w-4 h-4 text-sky-400" />
            <span>Hydration & Stops</span>
            {isHydrationLocked ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-600/60 font-tactical font-black flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>LOCKED</span>
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#202733] text-slate-300 font-tactical">FLUID TIMING</span>
            )}
          </button>

          <button
            data-tab="logbook"
            onClick={() => onTabChange('logbook')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 shrink-0 ${
              activeTab === 'logbook'
                ? 'border-[#FF6B00] text-[#FF6B00] bg-[#FF6B00]/10'
                : 'border-transparent text-[#94A3B8] hover:text-white hover:border-slate-600'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-[#FF6B00]" />
            <span>Workout Logbook</span>
            {isLogbookLocked ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-600/60 font-tactical font-black flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>LOCKED</span>
              </span>
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#202733] text-slate-300 font-tactical">LOGS</span>
            )}
          </button>

          {/* Admin Command Center Navigation Tab - Strictly visible to Admin risneraryan@gmail.com */}
          {isAdmin ? (
            <button
              data-tab="admin-center"
              onClick={() => onTabChange('admin-center')}
              className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 shrink-0 ${
                activeTab === 'admin-center'
                  ? 'border-amber-400 text-amber-300 bg-amber-400/10'
                  : 'border-transparent text-amber-400/80 hover:text-amber-300 hover:border-amber-400'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Admin Center</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-tactical font-black border border-amber-500/40">
                SUPER ADMIN
              </span>
            </button>
          ) : isCoach ? (
            <button
              data-tab="coach-portal"
              onClick={() => onTabChange('coach-portal')}
              className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 shrink-0 ${
                activeTab === 'coach-portal'
                  ? 'border-[#FF6B00] text-[#FF6B00] bg-[#FF6B00]/10'
                  : 'border-transparent text-[#94A3B8] hover:text-white hover:border-slate-600'
              }`}
            >
              <Upload className="w-4 h-4 text-[#FF6B00]" />
              <span>Coach Portal</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-tactical font-black">
                AJ COMMAND
              </span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
};
