/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrandHeader, ActiveNavTab } from './components/BrandHeader';
import { RestStopSplitView } from './components/RestStopSplitView';
import { LightDbProgramView } from './components/LightDbProgramView';
import { RoadWarriorProgramView } from './components/RoadWarriorProgramView';
import { DockDoorDrillsView } from './components/DockDoorDrillsView';
import { CabGalleyNutritionView } from './components/CabGalleyNutritionView';
import { HosRecoveryView } from './components/HosRecoveryView';
import { HydrationStrategyView } from './components/HydrationStrategyView';
import { CoachContactView } from './components/CoachContactView';
import { DriverCustomPlanView } from './components/DriverCustomPlanView';
import { CoachPortalView } from './components/CoachPortalView';
import { AdminPortalView } from './components/AdminPortalView';
import { HubRunnerMap } from './components/HubRunnerMap';
import { LogsAndTelemetryView } from './components/LogsAndTelemetryView';
import { FounderDoctrine } from './components/FounderDoctrine';
import { WorkoutRunner } from './components/WorkoutRunner';
import { DriverAuthModal } from './components/DriverAuthModal';
import { PricingPackagesView } from './components/PricingPackagesView';
import { TacticalPaywallCard } from './components/TacticalPaywallCard';
import { PWAInstallButton } from './components/PWAInstallButton';
import { usePWAInstall } from './components/usePWAInstall';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import { AndroidAppHubModal } from './components/AndroidAppHubModal';
import { 
  getCurrentDriver, 
  getDriverWorkoutLogs, 
  saveDriverWorkoutLogs, 
  logoutDriver,
  subscribeToAuthState,
  subscribeToDriverWorkoutLogs
} from './lib/auth';
import { 
  getActiveMembership, 
  saveActiveMembership, 
  MembershipMetadata, 
  isFeatureUnlocked 
} from './lib/subscription';
import { TrainingDay, WorkoutLogEntry, DriverAccount } from './types';
import { isCoachUser, isAdminUser } from './lib/coaching';
import { checkAndTriggerDueReminder } from './lib/notifications';
import { ShieldCheck, Truck, Award, Mail, Dumbbell, Zap, Utensils, Bed, Droplet, UserPlus, LogIn, Download, Tag, Lock, Smartphone } from 'lucide-react';

export default function App() {
  const { isInstalled } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('rest-stop');
  const [activeWorkoutDay, setActiveWorkoutDay] = useState<TrainingDay | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAndroidHubOpen, setIsAndroidHubOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Driver Authentication & Isolated Vault State
  const [currentDriver, setCurrentDriver] = useState<Omit<DriverAccount, 'passwordHash'> | null>(() => getCurrentDriver());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Active Membership State (14-Day Free Trial, $15 Starter, $30 Pro, Fleet)
  const [membership, setMembership] = useState<MembershipMetadata>(() => getActiveMembership(currentDriver?.id));

  // Load driver's isolated workout logs (starts clean and fresh for new drivers)
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogEntry[]>(() => {
    const driver = getCurrentDriver();
    if (driver) {
      return getDriverWorkoutLogs(driver.id);
    }
    return [];
  });

  // Synchronize Firebase auth state across tabs and on app restore
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuthState((driver) => {
      if (driver) {
        setCurrentDriver(driver);
        setMembership(getActiveMembership(driver.id));
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Synchronize workout logs and membership when switching driver accounts
  useEffect(() => {
    if (currentDriver?.id) {
      setMembership(getActiveMembership(currentDriver.id));
      const driverLogs = getDriverWorkoutLogs(currentDriver.id);
      setWorkoutLogs(driverLogs);

      const unsubscribeLogs = subscribeToDriverWorkoutLogs(currentDriver.id, (remoteLogs) => {
        setWorkoutLogs(remoteLogs);
      });
      return () => unsubscribeLogs();
    } else {
      setWorkoutLogs([]);
      setMembership(getActiveMembership());
    }
  }, [currentDriver?.id]);

  // Background 24-Hour Training Consistency Check across all tabs
  useEffect(() => {
    if (workoutLogs.length > 0) {
      checkAndTriggerDueReminder(workoutLogs);
      const interval = setInterval(() => {
        checkAndTriggerDueReminder(workoutLogs);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [workoutLogs]);

  const isAdmin = !!(currentDriver?.email && isAdminUser(currentDriver.email));
  const isCoach = !!(currentDriver?.email && isCoachUser(currentDriver.email));

  // Strictly enforce security: If activeTab is admin or coach portal and user lacks clearance, auto-redirect to rest-stop
  useEffect(() => {
    const hasAdminAccess = !!(currentDriver?.email && isAdminUser(currentDriver.email));
    if (!hasAdminAccess && (activeTab === 'admin-center' || activeTab === 'coach-portal')) {
      setActiveTab('rest-stop');
    }
  }, [activeTab, currentDriver?.email]);

  // Online/Offline Network Status Tracking for In-Cab resilience
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Network restored: Cloud sync active.');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('0-Bars Signal: Running in local offline cab mode.');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Android Back Gesture & Hardware Back Button Integration
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!window.history.state?.tab) {
      window.history.replaceState({ tab: activeTab }, '');
    }

    const handlePopState = (event: PopStateEvent) => {
      // 1. If modals or runners are open, close them first
      if (isAndroidHubOpen) {
        setIsAndroidHubOpen(false);
        return;
      }
      if (isAuthModalOpen) {
        setIsAuthModalOpen(false);
        return;
      }
      if (activeWorkoutDay) {
        setActiveWorkoutDay(null);
        return;
      }
      // 2. Otherwise navigate to previous tab
      if (event.state?.tab) {
        setActiveTab(event.state.tab);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAndroidHubOpen, isAuthModalOpen, activeWorkoutDay, activeTab]);

  const handleTabChangeWithHistory = (newTab: ActiveNavTab) => {
    if (newTab !== activeTab) {
      if (typeof window !== 'undefined' && window.history) {
        window.history.pushState({ tab: newTab }, '');
      }
      setActiveTab(newTab);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLogWorkout = (newLog: WorkoutLogEntry) => {
    setWorkoutLogs((prev) => {
      const updated = [newLog, ...prev];
      if (currentDriver) {
        saveDriverWorkoutLogs(currentDriver.id, updated);
      }
      return updated;
    });
    setActiveWorkoutDay(null);
    showToast(`Logged session: ${newLog.title}`);
  };

  const handleClearWorkoutLogs = () => {
    setWorkoutLogs([]);
    if (currentDriver) {
      saveDriverWorkoutLogs(currentDriver.id, []);
    }
    showToast('Workout logbook cleared.');
  };

  const handleSignOut = async () => {
    await logoutDriver();
    setCurrentDriver(null);
    setWorkoutLogs([]);
    setMembership(getActiveMembership());
    setActiveTab('rest-stop');
    showToast('Signed out of driver account.');
  };

  const handleAuthSuccess = (driver: Omit<DriverAccount, 'passwordHash'>) => {
    setCurrentDriver(driver);
    setMembership(getActiveMembership(driver.id));
    const logs = getDriverWorkoutLogs(driver.id);
    setWorkoutLogs(logs);
    setIsAuthModalOpen(false);
    if (!isAdminUser(driver.email) && (activeTab === 'admin-center' || activeTab === 'coach-portal')) {
      setActiveTab('rest-stop');
    }
    showToast(`Welcome back, Driver ${driver.callsign || driver.name}!`);
  };

  return (
    <div className="min-h-screen bg-[#080A0C] text-[#E2E8F0] flex flex-col justify-between selection:bg-[#FF6B00] selection:text-[#0D0F12]">
      {/* Brand Header */}
      <BrandHeader
        activeTab={activeTab}
        onTabChange={handleTabChangeWithHistory}
        completedWorkoutsCount={workoutLogs.length}
        currentDriver={currentDriver}
        currentMembership={membership}
        onSignOut={handleSignOut}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenAndroidHub={() => setIsAndroidHubOpen(true)}
      />

      {/* Floating Tactical Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 bg-[#141922] border-2 border-[#FF6B00] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B00] animate-ping" />
          <span className="text-xs font-tactical font-bold uppercase">{toastMessage}</span>
        </div>
      )}

      {/* Main Content Body - pb-28 ensures content scrolls above Android Bottom Navigation */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 pb-28 md:pb-8 flex-1 space-y-6">
        {/* Offline Ready PWA Download Banner - Completely removed once app is downloaded/installed */}
        {!isInstalled && (
          <div className="bg-gradient-to-r from-[#151C26] via-[#10141C] to-[#151C26] border border-[#263244] rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/15 border border-[#FF6B00]/40 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5 text-[#FF6B00]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-black text-white uppercase font-heading tracking-wide">
                    Download Linehaul Strong to Your Phone or Laptop
                  </h4>
                  <span className="hidden xs:inline-block px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 text-[9px] font-mono font-bold">
                    OFFLINE READY
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-tactical">
                  Run standalone without browser bars • 100% functional with 0 bars cell signal in rural rest stops
                </p>
              </div>
            </div>
            <div className="shrink-0 w-full sm:w-auto">
              <PWAInstallButton variant="banner" />
            </div>
          </div>
        )}

        {/* Isolated Driver Welcome Banner for Unauthenticated/New Drivers */}
        {!currentDriver && (
          <div className="bg-[#12161E] border-2 border-[#FF6B00]/40 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#FF6B00] text-[#0A0D12] text-[10px] font-tactical font-black uppercase tracking-wider">
                  DRIVER VAULT READY
                </span>
                <span className="text-xs font-tactical text-slate-400">Strict Data Isolation</span>
              </div>
              <h3 className="text-base font-bold text-white font-heading uppercase">
                Create Your Account & Start with a Fresh, Clean App
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Every driver gets their own private, independent profile. Your workout logs, mileage, and credentials remain private and completely invisible to all other drivers.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#FF8526] text-[#0A0D12] text-xs font-tactical font-black uppercase transition shadow-lg shadow-[#FF6B00]/20"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Driver Account</span>
              </button>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#1A212D] hover:bg-[#252F3F] text-white border border-[#2F3C50] text-xs font-tactical font-bold uppercase transition"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-400" />
                <span>Sign In</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'rest-stop' && (
          <RestStopSplitView
            onStartDayWorkout={(day) => setActiveWorkoutDay(day)}
            loggedWorkouts={workoutLogs}
            onSwitchToLightDb={() => setActiveTab('light-db')}
            onContactCoach={() => setActiveTab('contact')}
          />
        )}

        {activeTab === 'light-db' && (
          <LightDbProgramView
            onStartDayWorkout={(day) => setActiveWorkoutDay(day)}
            loggedWorkouts={workoutLogs}
            onContactCoach={() => setActiveTab('contact')}
          />
        )}

        {activeTab === 'road-warrior' && (
          isFeatureUnlocked(membership.tier, 'road-warrior') ? (
            <RoadWarriorProgramView
              onStartDayWorkout={(day) => setActiveWorkoutDay(day)}
              loggedWorkouts={workoutLogs}
              onNavigateToGymMap={() => setActiveTab('hub-runner')}
              onContactCoach={() => setActiveTab('contact')}
            />
          ) : (
            <TacticalPaywallCard
              feature="road-warrior"
              currentTier={membership.tier}
              onUpgradeToPro={() => setActiveTab('pricing')}
              onNavigateToUnlocked={(tab) => setActiveTab(tab)}
            />
          )
        )}

        {activeTab === 'dock-drills' && (
          <DockDoorDrillsView
            onLogWorkout={handleLogWorkout}
            onContactCoach={() => setActiveTab('contact')}
          />
        )}

        {activeTab === 'custom-plan' && (
          isFeatureUnlocked(membership.tier, 'custom-plan') ? (
            <DriverCustomPlanView
              currentDriver={currentDriver}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onStartCustomWorkout={(day) => setActiveWorkoutDay(day)}
              onContactCoach={() => setActiveTab('contact')}
              loggedWorkouts={workoutLogs}
            />
          ) : (
            <TacticalPaywallCard
              feature="custom-plan"
              currentTier={membership.tier}
              onUpgradeToPro={() => setActiveTab('pricing')}
              onNavigateToUnlocked={(tab) => setActiveTab(tab)}
            />
          )
        )}

        {activeTab === 'pricing' && (
          <PricingPackagesView
            currentDriver={currentDriver}
            currentMembership={membership}
            onMembershipUpdated={(newMeta) => {
              setMembership(newMeta);
              showToast(`Membership set to ${newMeta.tier === 'trial' ? '14-Day Free Trial' : newMeta.tier === 'starter' ? '$15 Starter' : '$30 Road Warrior Pro'}.`);
            }}
            onNavigateToWorkout={(tab) => setActiveTab(tab)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'admin-center' && isAdmin && (
          <AdminPortalView
            currentDriver={currentDriver}
            onAdminAuthenticated={(admin) => {
              handleAuthSuccess(admin);
              showToast('Signed in with Super Admin clearance.');
            }}
            onNavigateToDriverPlan={() => setActiveTab('custom-plan')}
          />
        )}

        {activeTab === 'coach-portal' && isCoach && (
          <CoachPortalView
            currentDriver={currentDriver}
            onNavigateToDriverPlan={() => setActiveTab('custom-plan')}
          />
        )}

        {activeTab === 'nutrition' && (
          <CabGalleyNutritionView
            onContactCoach={() => setActiveTab('contact')}
          />
        )}

        {activeTab === 'hos-recovery' && (
          <HosRecoveryView
            onSelectProtocol={(p) => setActiveTab(p.includes('Light DB') ? 'light-db' : 'rest-stop')}
            onContactCoach={() => setActiveTab('contact')}
          />
        )}

        {activeTab === 'hydration' && (
          <HydrationStrategyView
            onContactCoach={() => setActiveTab('contact')}
          />
        )}

        {activeTab === 'hub-runner' && (
          isFeatureUnlocked(membership.tier, 'hub-runner') ? (
            <HubRunnerMap
              onLogWorkout={handleLogWorkout}
              onNavigateToContact={() => setActiveTab('contact')}
            />
          ) : (
            <TacticalPaywallCard
              feature="hub-runner"
              currentTier={membership.tier}
              onUpgradeToPro={() => setActiveTab('pricing')}
              onNavigateToUnlocked={(tab) => setActiveTab(tab)}
            />
          )
        )}

        {activeTab === 'logbook' && (
          <LogsAndTelemetryView
            logs={workoutLogs}
            onAddWorkoutLog={handleLogWorkout}
            onClearLogs={handleClearWorkoutLogs}
          />
        )}

        {activeTab === 'founder' && (
          <FounderDoctrine onOpenContact={() => setActiveTab('contact')} />
        )}

        {activeTab === 'contact' && (
          <CoachContactView onNavigateToCustomPlan={() => setActiveTab('custom-plan')} />
        )}
      </main>

      {/* Active Workout Runner Fullscreen Modal */}
      {activeWorkoutDay && (
        <WorkoutRunner
          day={activeWorkoutDay}
          onClose={() => setActiveWorkoutDay(null)}
          onWorkoutComplete={handleLogWorkout}
        />
      )}

      {/* Driver Private Vault & Auth Modal */}
      <DriverAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Rugged Tactical Footer with Direct Contact */}
      <footer className="border-t border-[#1B212B] bg-[#07090C] py-8 text-xs text-[#94A3B8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-[#171D27]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#1C222D] to-[#0A0D12] border border-[#FF6B00]/70 p-1 flex items-center justify-center shadow-md shadow-[#FF6B00]/20">
                <img src="/icon.svg" alt="Linehaul Strong" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div>
                <span className="font-heading font-black text-white uppercase tracking-wider text-base">
                  LINEHAUL <span className="text-[#FF6B00]">STRONG</span>
                </span>
                <p className="text-xs text-slate-400 font-tactical">Built for the Long Haul</p>
              </div>
            </div>

            {/* Direct Coach Contact Banner in Footer */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#111620] border border-[#202938] px-4 py-3 rounded-xl text-center sm:text-left">
              <Mail className="w-5 h-5 text-[#FF6B00] shrink-0" />
              <div>
                <span className="text-[10px] font-tactical text-slate-400 uppercase tracking-wider block">
                  COACHING INQUIRIES & QUESTIONS
                </span>
                <a
                  href="mailto:risnerathletics@gmail.com"
                  className="text-xs font-mono font-bold text-white hover:text-[#FF6B00] transition"
                >
                  risnerathletics@gmail.com
                </a>
              </div>
              <button
                onClick={() => setActiveTab('contact')}
                className="mt-2 sm:mt-0 px-3 py-1.5 rounded-lg bg-[#FF6B00] text-[#0D0F12] font-tactical font-black uppercase text-[11px] hover:bg-[#E05E00] transition"
              >
                Inquire
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] font-tactical text-slate-400">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4">
              <button onClick={() => setActiveTab('rest-stop')} className="hover:text-white transition">Rest Stop Protocol</button>
              <button onClick={() => setActiveTab('light-db')} className="hover:text-white transition">Light DB Anywhere</button>
              <button onClick={() => setActiveTab('road-warrior')} className="hover:text-white transition text-amber-300 font-semibold">Road Warrior Gym</button>
              <button onClick={() => setActiveTab('dock-drills')} className="hover:text-white transition">Dock Door Drills</button>
              <button onClick={() => setActiveTab('custom-plan')} className="text-[#FF6B00] font-bold hover:underline">My Custom Plan</button>
              {Boolean(currentDriver?.email && isAdminUser(currentDriver.email)) && (
                <button onClick={() => setActiveTab('admin-center')} className="text-amber-400 font-bold hover:underline">Admin Center</button>
              )}
              {Boolean(currentDriver?.email && isCoachUser(currentDriver.email)) && (
                <button onClick={() => setActiveTab('coach-portal')} className="text-emerald-400 font-bold hover:underline">Coach Portal</button>
              )}
              <button onClick={() => setActiveTab('nutrition')} className="hover:text-white transition">Cab-Galley & Fuel</button>
              <button onClick={() => setActiveTab('hos-recovery')} className="hover:text-white transition">HOS Sleep & Recovery</button>
              <button onClick={() => setActiveTab('hydration')} className="hover:text-white transition">Hydration Calculator</button>
              <button onClick={() => setActiveTab('hub-runner')} className="hover:text-white transition">Gyms & Truck Parking GPS</button>
              <button onClick={() => setActiveTab('logbook')} className="hover:text-white transition">Workout Logbook</button>
              <button onClick={() => setActiveTab('founder')} className="hover:text-white transition">AJ Risner Doctrine</button>
              <button onClick={() => setActiveTab('pricing')} className="text-emerald-400 font-bold hover:underline">Packages & Pricing</button>
              <button onClick={() => setActiveTab('contact')} className="text-[#FF6B00] font-bold hover:underline">Contact Coach</button>
              <button onClick={() => setIsAndroidHubOpen(true)} className="text-[#FF6B00] font-bold flex items-center gap-1 hover:underline">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android App Hub</span>
              </button>
              {!isInstalled && (
                <div className="inline-block pl-2 border-l border-slate-700">
                  <PWAInstallButton compact={true} />
                </div>
              )}
            </div>

            <div className="text-center md:text-right">
              <p>Founded by <span className="text-white font-semibold">AJ Risner</span> • ISSA Elite Trainer, CPT</p>
              <p className="text-slate-500 mt-0.5">Commercial heavy haul & hazmat linehaul performance engineering.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Android Mobile Navigation Bar */}
      <AndroidBottomNav
        activeTab={activeTab}
        onTabChange={handleTabChangeWithHistory}
        currentDriver={currentDriver}
        currentMembership={membership}
        completedWorkoutsCount={workoutLogs.length}
        onOpenAndroidHub={() => setIsAndroidHubOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        isOnline={isOnline}
        isInstalled={isInstalled}
      />

      {/* Android App Specifications & WebAPK/Capacitor Hub Modal */}
      <AndroidAppHubModal
        isOpen={isAndroidHubOpen}
        onClose={() => setIsAndroidHubOpen(false)}
      />
    </div>
  );
}
