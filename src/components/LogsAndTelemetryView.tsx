import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Flame, 
  Clock, 
  Download, 
  Activity, 
  Calendar,
  Plus,
  Trash2,
  Dumbbell,
  MapPin,
  CheckCircle2,
  X,
  FileText,
  Bell,
  BellOff,
  BellRing,
  Volume2,
  VolumeX,
  AlertCircle,
  Timer,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WorkoutLogEntry } from '../types';
import { 
  isNotificationSupported, 
  getNotificationPermission, 
  isRemindMeEnabled, 
  setRemindMeEnabled,
  isRemindMeSoundEnabled,
  setRemindMeSoundEnabled,
  requestNotificationPermission, 
  sendTestNotification, 
  checkReminderStatus, 
  checkAndTriggerDueReminder,
  triggerNotification,
  NotificationPermissionState
} from '../lib/notifications';

interface LogsAndTelemetryViewProps {
  logs: WorkoutLogEntry[];
  onAddWorkoutLog?: (log: WorkoutLogEntry) => void;
  onClearLogs?: () => void;
}

export const LogsAndTelemetryView: React.FC<LogsAndTelemetryViewProps> = ({
  logs,
  onAddWorkoutLog,
  onClearLogs
}) => {
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualType, setManualType] = useState<WorkoutLogEntry['type']>('road-warrior');
  const [manualDuration, setManualDuration] = useState(40);
  const [manualCalories, setManualCalories] = useState(250);
  const [manualNotes, setManualNotes] = useState('');

  // Remind Me Feature State
  const [remindMeActive, setRemindMeActive] = useState<boolean>(() => isRemindMeEnabled());
  const [soundActive, setSoundActive] = useState<boolean>(() => isRemindMeSoundEnabled());
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>(() => getNotificationPermission());
  const [testNotificationFeedback, setTestNotificationFeedback] = useState<string | null>(null);
  const [, setTick] = useState<number>(0);

  const supported = isNotificationSupported();

  // Sort logs latest first
  const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const latestLog = sortedLogs[0];

  // Re-check reminder status every second for live countdown and trigger check
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
      if (remindMeActive && permissionState === 'granted' && logs.length > 0) {
        checkAndTriggerDueReminder(logs);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [remindMeActive, permissionState, logs]);

  // Sync permission state on window focus
  useEffect(() => {
    const handleFocus = () => {
      setPermissionState(getNotificationPermission());
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const totalMinutes = logs.reduce((acc, l) => acc + l.durationMinutes, 0);
  const totalCalories = logs.reduce((acc, l) => acc + l.caloriesBurned, 0);

  const handleToggleRemindMe = async () => {
    if (!remindMeActive) {
      if (permissionState !== 'granted') {
        const result = await requestNotificationPermission();
        setPermissionState(result);
        if (result === 'granted') {
          setRemindMeActive(true);
          setRemindMeEnabled(true);
          setTestNotificationFeedback('24-Hour reminders enabled! Browser notification permission granted.');
        } else {
          setTestNotificationFeedback('Please allow notifications in your browser to receive training reminders.');
        }
      } else {
        setRemindMeActive(true);
        setRemindMeEnabled(true);
      }
    } else {
      setRemindMeActive(false);
      setRemindMeEnabled(false);
    }
  };

  const handleToggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setRemindMeSoundEnabled(next);
  };

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    setPermissionState(result);
    if (result === 'granted') {
      setRemindMeActive(true);
      setRemindMeEnabled(true);
      setTestNotificationFeedback('Notifications granted! You will be reminded 24 hours after each session.');
    } else if (result === 'denied') {
      setTestNotificationFeedback('Notifications were denied in your browser settings. To enable, click the lock/settings icon in your browser URL bar.');
    }
  };

  const handleSendTestNotification = async () => {
    if (permissionState !== 'granted') {
      const res = await requestNotificationPermission();
      setPermissionState(res);
      if (res !== 'granted') {
        setTestNotificationFeedback('Unable to send test notification: browser permission was not granted.');
        return;
      }
    }

    const sent = await sendTestNotification();
    if (sent) {
      setTestNotificationFeedback('Test notification sent! Check your device notification tray.');
    } else {
      setTestNotificationFeedback('Test notification sent to browser.');
    }
    setTimeout(() => setTestNotificationFeedback(null), 5000);
  };

  const handleTriggerManualReminderNow = async () => {
    if (!latestLog) return;
    await triggerNotification('Linehaul Strong: 24-Hour Training Reminder 🚛', {
      body: `24 hours since your last session ("${latestLog.title}"). Time to unlock tight hips and maintain your road consistency!`,
      icon: '/pwa-192x192.png'
    });
    setTestNotificationFeedback('Reminder notification triggered for current session!');
    setTimeout(() => setTestNotificationFeedback(null), 4000);
  };

  const handleExportLogs = () => {
    const jsonStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linehaul-strong-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateManualLog = () => {
    if (!manualTitle.trim()) return;
    const entry: WorkoutLogEntry = {
      id: `manual-log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: manualType,
      title: manualTitle.trim(),
      durationMinutes: manualDuration,
      caloriesBurned: manualCalories,
      notes: manualNotes.trim() || undefined
    };

    if (onAddWorkoutLog) {
      onAddWorkoutLog(entry);
    }
    setIsManualModalOpen(false);
    setManualTitle('');
    setManualNotes('');
    confetti({ particleCount: 60, spread: 60 });
  };

  // Calculate 24-hour countdown details
  let reminderStatus: 'no_logs' | 'under_24h' | 'over_24h' = 'no_logs';
  let hoursRemaining = 0;
  let minutesRemaining = 0;
  let secondsRemaining = 0;
  let hoursElapsed = 0;
  let targetReminderTime: Date | null = null;
  let elapsedPercent = 0;

  if (latestLog) {
    const lastTime = new Date(latestLog.timestamp).getTime();
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    const targetMs = lastTime + twentyFourHoursMs;
    targetReminderTime = new Date(targetMs);
    const diffMs = targetMs - Date.now();

    if (diffMs > 0) {
      reminderStatus = 'under_24h';
      const totalSec = Math.floor(diffMs / 1000);
      hoursRemaining = Math.floor(totalSec / 3600);
      minutesRemaining = Math.floor((totalSec % 3600) / 60);
      secondsRemaining = totalSec % 60;
      const elapsedMs = Date.now() - lastTime;
      elapsedPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / twentyFourHoursMs) * 100)));
    } else {
      reminderStatus = 'over_24h';
      const elapsedMs = Date.now() - lastTime;
      hoursElapsed = Math.floor(elapsedMs / (60 * 60 * 1000));
      elapsedPercent = 100;
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#12161E] border-l-4 border-[#FF6B00] border-y border-r border-[#202733] rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-xs font-tactical font-black bg-[#FF6B00] text-[#0D0F12] uppercase tracking-wider">
                ROAD LOGBOOK & TRAINING ARCHIVE
              </span>
              <span className="text-xs font-tactical text-slate-400">
                Independent Driver Data Record
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-heading tracking-wide">
              Road Session History & Training Logbook
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-tactical">
              Track your completed Road Warrior 3-day split, Rest Stop Protocols, Light Dumbbell bunk routines, and gym sessions with nearby truck parking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#FF8526] text-[#0D0F12] font-tactical font-black uppercase text-xs tracking-wider transition shadow-lg shadow-[#FF6B00]/20"
            >
              <Plus className="w-4 h-4" />
              <span>Log Workout</span>
            </button>
            <button
              onClick={handleExportLogs}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#181E26] hover:bg-[#202733] border border-[#273241] text-xs font-tactical text-slate-300 uppercase font-bold hover:text-white transition"
              title="Export all logged workout data as JSON"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Export</span>
            </button>
            {onClearLogs && logs.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear your workout log history?')) {
                    onClearLogs();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#181E26] hover:bg-red-950/40 border border-[#273241] hover:border-red-600/40 text-xs font-tactical text-slate-400 hover:text-red-400 transition"
                title="Clear workout logbook"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 24-HOUR TRAINING CONSISTENCY REMINDER (REMIND ME FEATURE) */}
      <div className="bg-gradient-to-br from-[#131922] via-[#10141C] to-[#141A24] border-2 border-[#263548] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1E2736]">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition ${
              remindMeActive && permissionState === 'granted'
                ? 'bg-[#FF6B00]/15 border-[#FF6B00]/40 text-[#FF6B00] shadow-lg shadow-[#FF6B00]/10'
                : 'bg-[#18202C] border-[#2A3546] text-slate-400'
            }`}>
              {remindMeActive ? <BellRing className="w-6 h-6 animate-pulse" /> : <BellOff className="w-6 h-6" />}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-tactical font-black uppercase tracking-wider bg-[#FF6B00]/20 text-[#FF6B00] px-2 py-0.5 rounded border border-[#FF6B00]/40">
                  CONSISTENCY PROTOCOL
                </span>

                {/* Live Permission Pill */}
                {permissionState === 'granted' && (
                  <span className="text-[11px] font-tactical text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/50 border border-emerald-600/40 px-2 py-0.5 rounded">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    NOTIFICATIONS ACTIVE
                  </span>
                )}
                {permissionState === 'default' && (
                  <span className="text-[11px] font-tactical text-amber-400 font-bold flex items-center gap-1 bg-amber-950/50 border border-amber-600/40 px-2 py-0.5 rounded">
                    <AlertCircle className="w-3.5 h-3.5" />
                    CLICK TO ENABLE BROWSER PERMISSION
                  </span>
                )}
                {permissionState === 'denied' && (
                  <span className="text-[11px] font-tactical text-red-400 font-bold flex items-center gap-1 bg-red-950/50 border border-red-600/40 px-2 py-0.5 rounded">
                    <AlertCircle className="w-3.5 h-3.5" />
                    BLOCKED IN BROWSER
                  </span>
                )}
                {!supported && (
                  <span className="text-[11px] font-tactical text-slate-400 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded">
                    BROWSER NOT SUPPORTED
                  </span>
                )}
              </div>

              <h3 className="text-lg sm:text-xl font-heading font-black uppercase text-white tracking-wide mt-1">
                Remind Me: 24-Hour Training Consistency
              </h3>
              <p className="text-xs text-slate-300 font-tactical max-w-xl leading-relaxed">
                Triggers browser notifications exactly 24 hours after your last logged workout to maintain training consistency, decompress the spine, and keep road stiffness away.
              </p>
            </div>
          </div>

          {/* Toggle Switches & Actions */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            {/* Audio chime toggle */}
            <button
              onClick={handleToggleSound}
              title={soundActive ? 'Sound Chime: Enabled' : 'Sound Chime: Muted'}
              className={`p-2.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-tactical ${
                soundActive 
                  ? 'bg-[#182230] border-[#304159] text-amber-400' 
                  : 'bg-[#12161E] border-[#222A36] text-slate-500'
              }`}
            >
              {soundActive ? <Volume2 className="w-4 h-4 text-[#FF6B00]" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-[11px] uppercase font-bold hidden sm:inline">{soundActive ? 'Chime ON' : 'Chime Muted'}</span>
            </button>

            {/* Test Notification Button */}
            <button
              onClick={handleSendTestNotification}
              className="px-3 py-2 rounded-xl bg-[#1A222F] hover:bg-[#232E40] border border-[#2D3C52] text-xs font-tactical font-bold text-slate-200 uppercase hover:text-white transition flex items-center gap-1.5"
            >
              <BellRing className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>Test Alert</span>
            </button>

            {/* Main Remind Me Switch */}
            <button
              onClick={handleToggleRemindMe}
              className={`px-4 py-2.5 rounded-xl font-tactical font-black text-xs uppercase tracking-wider flex items-center gap-2 transition shadow-md ${
                remindMeActive && permissionState === 'granted'
                  ? 'bg-[#FF6B00] hover:bg-[#FF8526] text-[#0A0D12] shadow-[#FF6B00]/20'
                  : 'bg-[#222B38] hover:bg-[#2C384A] text-white border border-[#374558]'
              }`}
            >
              <Bell className="w-4 h-4 fill-current" />
              <span>{remindMeActive ? 'REMIND ME: ON' : 'REMIND ME: OFF'}</span>
            </button>
          </div>
        </div>

        {/* Feedback message banner if triggered */}
        {testNotificationFeedback && (
          <div className="p-3 rounded-xl bg-[#1A2332] border border-[#FF6B00]/50 text-xs text-white font-tactical flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FF6B00] shrink-0" />
              <span>{testNotificationFeedback}</span>
            </div>
            <button
              onClick={() => setTestNotificationFeedback(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Permission Request Warning Card if Default or Denied */}
        {permissionState === 'default' && (
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-600/40 text-xs text-amber-200 font-tactical flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <strong className="text-white block uppercase">Browser Notification Permission Required</strong>
                <span>Allow notifications in your browser so you receive the 24-hour prompt when your next workout is due.</span>
              </div>
            </div>
            <button
              onClick={handleRequestPermission}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-tactical font-black uppercase text-xs shrink-0 transition"
            >
              Grant Browser Access
            </button>
          </div>
        )}

        {/* Dynamic Countdown & Consistency Status */}
        {reminderStatus === 'under_24h' && latestLog && (
          <div className="p-4 rounded-xl bg-[#0E1218] border border-[#222B38] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <Timer className="w-5 h-5 text-[#FF6B00] animate-spin" style={{ animationDuration: '8s' }} />
                <div>
                  <span className="text-[10px] font-tactical uppercase text-slate-400 block font-bold">
                    CONSISTENCY CLOCK RUNNING
                  </span>
                  <div className="text-sm sm:text-base font-black text-white font-tactical flex items-center gap-2">
                    <span>NEXT REMINDER IN:</span>
                    <span className="text-[#FF6B00] font-mono text-lg sm:text-xl">
                      {String(hoursRemaining).padStart(2, '0')}h {String(minutesRemaining).padStart(2, '0')}m {String(secondsRemaining).padStart(2, '0')}s
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right text-xs font-tactical text-slate-400">
                <span>Target: </span>
                <strong className="text-slate-200">
                  {targetReminderTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({targetReminderTime?.toLocaleDateString([], { month: 'short', day: 'numeric' })})
                </strong>
              </div>
            </div>

            {/* Progress Bar of 24-Hour Recovery Window */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-tactical text-slate-400 mb-1">
                <span>24-Hour Cycle Progress</span>
                <span className="text-white font-mono">{elapsedPercent}% complete</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#18202A] overflow-hidden border border-[#253040]">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-[#FF6B00] transition-all duration-1000"
                  style={{ width: `${elapsedPercent}%` }}
                />
              </div>
            </div>

            <div className="text-[11px] font-tactical text-slate-400 pt-1 flex items-center justify-between">
              <span>Last session: <strong className="text-slate-300">{latestLog.title}</strong></span>
              <span className="text-emerald-400 font-bold">Recovery Window Active</span>
            </div>
          </div>
        )}

        {reminderStatus === 'over_24h' && latestLog && (
          <div className="p-4 rounded-xl bg-amber-950/20 border-2 border-[#FF6B00] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FF6B00]/20 border border-[#FF6B00]/40 flex items-center justify-center text-[#FF6B00] shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-tactical uppercase font-black text-[#FF6B00] bg-[#FF6B00]/15 px-2 py-0.5 rounded">
                      24+ HOURS ELAPSED
                    </span>
                    <span className="text-xs text-white font-tactical font-bold">
                      {hoursElapsed} Hours Since Last Workout
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white font-tactical mt-0.5">
                    Time For Your Next Road Session!
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerManualReminderNow}
                  className="px-3 py-2 rounded-lg bg-[#18202C] hover:bg-[#222C3C] border border-[#2C3B4E] text-xs font-tactical text-slate-200 uppercase font-bold transition"
                >
                  Send 24h Prompt Now
                </button>
                <button
                  onClick={() => setIsManualModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-[#FF6B00] hover:bg-[#FF8526] text-[#0A0D12] text-xs font-tactical font-black uppercase tracking-wider transition shadow-md shadow-[#FF6B00]/20"
                >
                  Log Workout Today
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-tactical leading-relaxed">
              Your previous session was <strong className="text-white">"{latestLog.title}"</strong>. Full recovery has taken place. Professional drivers maintain physical resilience by hitting their Road Warrior 3-day split, a quick light-DB circuit, or dock drills every 24-48 hours.
            </p>
          </div>
        )}

        {reminderStatus === 'no_logs' && (
          <div className="p-4 rounded-xl bg-[#0E1218] border border-dashed border-[#222B38] text-center text-xs font-tactical text-slate-400">
            <Clock className="w-6 h-6 text-[#FF6B00] mx-auto mb-1.5 opacity-80" />
            <p className="text-white font-bold uppercase mb-0.5">Consistency Clock Ready</p>
            <p>
              Log your first Road Warrior gym session or Rest Stop protocol to automatically start the 24-hour training consistency reminder.
            </p>
          </div>
        )}
      </div>

      {/* Overview Stat Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#12151B] border border-[#222834] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-tactical text-slate-400 mb-1">
            <span className="uppercase tracking-wider">TOTAL SESSIONS</span>
            <Activity className="w-4 h-4 text-[#FF6B00]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-tactical">
            {logs.length}
          </div>
          <span className="text-[11px] text-emerald-400 font-tactical mt-1 block">
            Completed Road Splits
          </span>
        </div>

        <div className="bg-[#12151B] border border-[#222834] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-tactical text-slate-400 mb-1">
            <span className="uppercase tracking-wider">ACTIVE TIME</span>
            <Clock className="w-4 h-4 text-[#FF6B00]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-tactical">
            {totalMinutes} <span className="text-base font-normal text-slate-400">MIN</span>
          </div>
          <span className="text-[11px] text-slate-400 font-tactical mt-1 block">
            Across active resets
          </span>
        </div>

        <div className="bg-[#12151B] border border-[#222834] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-tactical text-slate-400 mb-1">
            <span className="uppercase tracking-wider">AVG DURATION</span>
            <Clock className="w-4 h-4 text-[#FF6B00]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-tactical">
            {logs.length > 0 ? Math.round(totalMinutes / logs.length) : 0} <span className="text-base font-normal text-slate-400">MIN</span>
          </div>
          <span className="text-[11px] text-slate-400 font-tactical mt-1 block">
            Per completed session
          </span>
        </div>

        <div className="bg-[#12151B] border border-[#222834] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-tactical text-slate-400 mb-1">
            <span className="uppercase tracking-wider">CALORIE BURN</span>
            <Flame className="w-4 h-4 text-[#FF6B00]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-tactical">
            {totalCalories} <span className="text-base font-normal text-slate-400">KCAL</span>
          </div>
          <span className="text-[11px] text-[#FF6B00] font-tactical mt-1 block">
            Metabolic energy spent
          </span>
        </div>
      </div>

      {/* Logged Workouts List */}
      <div className="bg-[#12151B] border border-[#222834] rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-[#1C222C] pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#FF6B00]" />
            <h3 className="text-base font-bold uppercase tracking-wider text-white font-heading">
              Session History ({logs.length})
            </h3>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl bg-[#0E1117] border border-dashed border-[#222B38] text-slate-400 font-tactical text-xs">
            <ClipboardList className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-300 font-bold mb-1 uppercase">No completed sessions logged yet</p>
            <p className="max-w-md mx-auto">
              Execute an active Road Warrior gym day, Rest Stop Protocol, Dock Door Drill, or search for a Gym with truck parking to record your first road training session.
            </p>
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-[#FF6B00] text-[#0A0D12] text-xs font-tactical font-black uppercase"
            >
              Log A Workout Manually
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedLogs.map((log) => {
              const dateStr = new Date(log.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              const getBadge = () => {
                switch (log.type) {
                  case 'custom-coaching':
                    return { label: 'COACH AJ CUSTOM', color: 'bg-[#FF6B00]/25 text-[#FF6B00] border-[#FF6B00]/50' };
                  case 'gym-workout':
                    return { label: 'GYM & PARKING', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
                  case 'hub-runner-gps':
                    return { label: 'GYM & STAGING', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
                  case 'dock-door-drill':
                    return { label: 'DOCK DOOR DRILL', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
                  case 'light-db':
                    return { label: 'LIGHT DB ANYWHERE', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
                  case 'road-warrior':
                    return { label: 'ROAD WARRIOR GYM', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
                  default:
                    return { label: 'REST STOP PROTOCOL', color: 'bg-[#FF6B00]/15 text-[#FF6B00] border-[#FF6B00]/30' };
                }
              };

              const badge = getBadge();

              return (
                <div
                  key={log.id}
                  className="bg-[#161B23] border border-[#222A36] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-600 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-tactical font-black uppercase border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-[11px] text-slate-400 font-tactical">{dateStr}</span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-white uppercase font-heading">
                      {log.title}
                    </h4>
                    {log.notes && (
                      <p className="text-xs text-[#94A3B8] max-w-xl font-tactical leading-relaxed">{log.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs font-tactical text-slate-300 shrink-0 self-end sm:self-auto">
                    {log.distanceMiles && (
                      <div className="text-center">
                        <span className="text-slate-500 block text-[10px] uppercase">DISTANCE</span>
                        <span className="font-bold text-white font-mono">{log.distanceMiles} mi</span>
                      </div>
                    )}
                    <div className="text-center">
                      <span className="text-slate-500 block text-[10px] uppercase">DURATION</span>
                      <span className="font-bold text-white font-mono">{log.durationMinutes} min</span>
                    </div>
                    <div className="text-center">
                      <span className="text-slate-500 block text-[10px] uppercase">BURN</span>
                      <span className="font-bold text-[#FF6B00] font-mono">{log.caloriesBurned} kcal</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Add Workout Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12161F] border-2 border-[#FF6B00] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1E2838]">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-[#FF6B00]" />
                <h3 className="text-lg font-heading font-black text-white uppercase">
                  Log A Road Workout
                </h3>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-tactical">
              <div>
                <label className="text-xs text-slate-400 uppercase block mb-1">
                  Session Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Planet Fitness Day 1: Posterior Chain & Posture"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-[#243040] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 uppercase block mb-1">
                    Workout Type
                  </label>
                  <select
                    value={manualType}
                    onChange={(e) => setManualType(e.target.value as any)}
                    className="w-full bg-[#0A0D12] border border-[#243040] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                  >
                    <option value="road-warrior">Road Warrior Gym (Planet Fitness 3-Day Plan)</option>
                    <option value="rest-stop-protocol">Rest Stop Protocol</option>
                    <option value="light-db">Light DB Anywhere</option>
                    <option value="custom-coaching">Coach AJ Custom Plan</option>
                    <option value="dock-door-drill">Dock Door Drill</option>
                    <option value="gym-workout">Gym with Truck Parking</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase block mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={manualDuration}
                    onChange={(e) => setManualDuration(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#0A0D12] border border-[#243040] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase block mb-1">
                  Est. Calories Burned
                </label>
                <input
                  type="number"
                  value={manualCalories}
                  onChange={(e) => setManualCalories(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#0A0D12] border border-[#243040] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase block mb-1">
                  Driver Notes / Equipment
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., Goblet squats, seated cable rows, Smith machine RDLs, dumbbell incline press, and 45-second planks at Planet Fitness Amarillo."
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-[#243040] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#1E2838] flex items-center justify-end gap-2">
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#18202C] text-slate-300 hover:text-white text-xs font-tactical uppercase font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateManualLog}
                disabled={!manualTitle.trim()}
                className="px-5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#FF8526] text-[#0A0D12] text-xs font-tactical font-black uppercase transition shadow-lg shadow-[#FF6B00]/20 disabled:opacity-50"
              >
                Save To History & Start 24h Clock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
