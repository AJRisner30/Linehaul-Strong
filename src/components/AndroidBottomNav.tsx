import React, { useState } from 'react';
import { 
  Activity, 
  MapPin, 
  Zap, 
  Utensils, 
  Grid, 
  Dumbbell, 
  Bed, 
  Droplet, 
  ClipboardList, 
  Award, 
  Mail, 
  Tag, 
  ShieldAlert, 
  Smartphone, 
  Wifi, 
  WifiOff, 
  X, 
  LogOut, 
  LogIn, 
  ChevronRight,
  Download
} from 'lucide-react';
import { ActiveNavTab } from './BrandHeader';
import { DriverAccount } from '../types';
import { MembershipMetadata } from '../lib/subscription';
import { isAdminUser } from '../lib/coaching';

interface AndroidBottomNavProps {
  activeTab: ActiveNavTab;
  onTabChange: (tab: ActiveNavTab) => void;
  currentDriver: Omit<DriverAccount, 'passwordHash'> | null;
  currentMembership?: MembershipMetadata;
  completedWorkoutsCount: number;
  onOpenAndroidHub: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
  isOnline: boolean;
  isInstalled: boolean;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  activeTab,
  onTabChange,
  currentDriver,
  completedWorkoutsCount,
  onOpenAndroidHub,
  onOpenAuth,
  onSignOut,
  isOnline,
  isInstalled
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isAdmin = !!(currentDriver?.email && isAdminUser(currentDriver.email));

  const handleSelectTab = (tab: ActiveNavTab) => {
    // Android haptic feedback pulse
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {
        // ignore
      }
    }
    onTabChange(tab);
    setIsDrawerOpen(false);
  };

  // Determine which primary bottom-nav item is active
  const isWorkoutActive = ['rest-stop', 'light-db', 'road-warrior'].includes(activeTab);
  const isGpsActive = activeTab === 'hub-runner';
  const isDrillsActive = activeTab === 'dock-drills';
  const isGalleyActive = activeTab === 'nutrition';
  const isMoreActive = !isWorkoutActive && !isGpsActive && !isDrillsActive && !isGalleyActive;

  return (
    <>
      {/* Android Bottom Navigation Bar - Pinned to bottom on mobile/tablet */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0D12]/95 backdrop-blur-xl border-t border-[#1C2534] pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] pt-1.5 px-2 md:hidden shadow-[0_-8px_24px_rgba(0,0,0,0.8)]"
        aria-label="Android Bottom Navigation"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center gap-1">
          {/* 1. Workouts */}
          <button
            type="button"
            onClick={() => handleSelectTab('rest-stop')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              isWorkoutActive 
                ? 'text-[#FF6B00]' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-full transition-all ${
              isWorkoutActive ? 'bg-[#FF6B00]/15' : 'bg-transparent'
            }`}>
              <Dumbbell className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-tactical font-bold uppercase tracking-wider mt-0.5">
              Workouts
            </span>
          </button>

          {/* 2. Dock Drills */}
          <button
            type="button"
            onClick={() => handleSelectTab('dock-drills')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              isDrillsActive 
                ? 'text-[#FF6B00]' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-full transition-all ${
              isDrillsActive ? 'bg-[#FF6B00]/15' : 'bg-transparent'
            }`}>
              <Zap className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-tactical font-bold uppercase tracking-wider mt-0.5">
              Dock Drills
            </span>
          </button>

          {/* 3. Gym GPS Locator */}
          <button
            type="button"
            onClick={() => handleSelectTab('hub-runner')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              isGpsActive 
                ? 'text-[#FF6B00]' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-full transition-all ${
              isGpsActive ? 'bg-[#FF6B00]/15' : 'bg-transparent'
            }`}>
              <MapPin className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-tactical font-bold uppercase tracking-wider mt-0.5">
              Gym GPS
            </span>
          </button>

          {/* 4. Cab Galley */}
          <button
            type="button"
            onClick={() => handleSelectTab('nutrition')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              isGalleyActive 
                ? 'text-[#FF6B00]' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-full transition-all ${
              isGalleyActive ? 'bg-[#FF6B00]/15' : 'bg-transparent'
            }`}>
              <Utensils className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-tactical font-bold uppercase tracking-wider mt-0.5">
              Galley
            </span>
          </button>

          {/* 5. More Sheet */}
          <button
            type="button"
            onClick={() => {
              if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                try { navigator.vibrate(12); } catch {}
              }
              setIsDrawerOpen(true);
            }}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all relative ${
              isMoreActive || isDrawerOpen
                ? 'text-[#FF6B00]' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-full transition-all ${
              isMoreActive || isDrawerOpen ? 'bg-[#FF6B00]/15' : 'bg-transparent'
            }`}>
              <Grid className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-tactical font-bold uppercase tracking-wider mt-0.5">
              Tools
            </span>
            {isAdmin && (
              <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>
        </div>
      </nav>

      {/* Android Bottom Sheet Drawer */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end md:hidden animate-in fade-in duration-150"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div 
            className="bg-[#0D1117] border-t-2 border-[#FF6B00]/40 rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 space-y-5 animate-in slide-in-from-bottom duration-200 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Drag Handle */}
            <div className="w-12 h-1.5 rounded-full bg-[#2A374A] mx-auto -mt-1" />

            {/* Header with Driver & Status */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-tactical font-black uppercase text-[#FF6B00] tracking-wider block">
                  ANDROID CAB COMMAND
                </span>
                <h3 className="text-base font-black font-heading uppercase text-white">
                  Linehaul Strong Tools
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-[#18202C] text-slate-300 flex items-center justify-center hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Connectivity & Android App Quick Strip */}
            <div className="grid grid-cols-2 gap-2 text-xs font-tactical">
              <div className="bg-[#121822] border border-[#202C3D] rounded-xl p-2.5 flex items-center gap-2">
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-emerald-400 font-bold block text-[10px] uppercase">Online Sync</span>
                      <span className="text-slate-400 text-[10px]">Cloud Active</span>
                    </div>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-amber-400 font-bold block text-[10px] uppercase">0-Bars Offline</span>
                      <span className="text-slate-400 text-[10px]">Local Vault Mode</span>
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenAndroidHub();
                }}
                className="bg-[#121822] hover:bg-[#1A2433] border border-[#FF6B00]/40 rounded-xl p-2.5 flex items-center gap-2 text-left transition"
              >
                <Smartphone className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <div>
                  <span className="text-white font-bold block text-[10px] uppercase">Android APK / App</span>
                  <span className="text-slate-400 text-[10px]">Install & Specs</span>
                </div>
              </button>
            </div>

            {/* Secondary Destinations Grid */}
            <div className="space-y-1 text-xs font-tactical">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-1">
                Road Protocols & Calculators
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectTab('hos-recovery')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition ${
                    activeTab === 'hos-recovery'
                      ? 'bg-[#FF6B00]/15 border-[#FF6B00] text-white'
                      : 'bg-[#131923] border-[#1E2838] text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Bed className="w-4 h-4 text-[#FF6B00]" />
                    <span className="font-bold uppercase">HOS Sleep & Recovery</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab('hydration')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition ${
                    activeTab === 'hydration'
                      ? 'bg-[#FF6B00]/15 border-[#FF6B00] text-white'
                      : 'bg-[#131923] border-[#1E2838] text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Droplet className="w-4 h-4 text-sky-400" />
                    <span className="font-bold uppercase">Hydration & Stop Timing</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab('logbook')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition ${
                    activeTab === 'logbook'
                      ? 'bg-[#FF6B00]/15 border-[#FF6B00] text-white'
                      : 'bg-[#131923] border-[#1E2838] text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ClipboardList className="w-4 h-4 text-[#FF6B00]" />
                    <span className="font-bold uppercase">Workout Logbook ({completedWorkoutsCount})</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab('custom-plan')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition ${
                    activeTab === 'custom-plan'
                      ? 'bg-[#FF6B00]/15 border-[#FF6B00] text-white'
                      : 'bg-[#131923] border-[#1E2838] text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Award className="w-4 h-4 text-[#FF6B00]" />
                    <span className="font-bold uppercase">My Custom 1-on-1 Plan</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab('pricing')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition ${
                    activeTab === 'pricing'
                      ? 'bg-[#FF6B00]/15 border-[#FF6B00] text-white'
                      : 'bg-[#131923] border-[#1E2838] text-emerald-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Tag className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold uppercase">Packages & Pricing ($15 / $30)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab('founder')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition ${
                    activeTab === 'founder'
                      ? 'bg-[#FF6B00]/15 border-[#FF6B00] text-white'
                      : 'bg-[#131923] border-[#1E2838] text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Award className="w-4 h-4 text-[#FF6B00]" />
                    <span className="font-bold uppercase">AJ Risner Doctrine</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab('contact')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition ${
                    activeTab === 'contact'
                      ? 'bg-[#FF6B00]/15 border-[#FF6B00] text-white'
                      : 'bg-[#131923] border-[#1E2838] text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#FF6B00]" />
                    <span className="font-bold uppercase">Coach Contact (AJ 1-on-1)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                {/* Strictly Admin only tab */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleSelectTab('admin-center')}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition ${
                      activeTab === 'admin-center'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-[#131923] border-amber-500/30 text-amber-400 hover:text-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span className="font-bold uppercase">Super Admin Center</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Driver Profile Footer */}
            <div className="pt-2 border-t border-[#1C2534] flex items-center justify-between">
              {currentDriver ? (
                <div className="flex items-center justify-between w-full">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Logged In Driver</span>
                    <span className="text-xs font-bold text-white">{currentDriver.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onSignOut();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-600/50 text-rose-300 text-xs font-bold uppercase hover:bg-rose-900"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FF6B00] text-[#0A0D12] text-xs font-tactical font-black uppercase shadow-lg shadow-[#FF6B00]/20"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Driver Sign In / Create Vault</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
