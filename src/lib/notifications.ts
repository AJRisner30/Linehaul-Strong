/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WorkoutLogEntry } from '../types';

export const REMIND_ME_ENABLED_KEY = 'linehaul_remind_me_enabled';
export const LAST_NOTIFIED_LOG_KEY = 'linehaul_last_notified_log_id';
export const REMIND_ME_SOUND_KEY = 'linehaul_remind_me_sound';

export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export interface ReminderCheckResult {
  status: 'unsupported' | 'permission_needed' | 'disabled' | 'no_logs' | 'scheduled' | 'triggered' | 'already_notified';
  latestLog?: WorkoutLogEntry;
  remainingMs?: number;
  targetDate?: Date;
  hoursRemaining?: number;
  minutesRemaining?: number;
}

/**
 * Check if the current browser environment supports the Web Notifications API
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission(): NotificationPermissionState {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission as NotificationPermissionState;
}

/**
 * Check if the user has enabled the 24-hour reminder toggle
 */
export function isRemindMeEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(REMIND_ME_ENABLED_KEY);
  // Default to true if not explicitly set to 'false'
  return stored !== 'false';
}

/**
 * Set the 24-hour reminder toggle state
 */
export function setRemindMeEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REMIND_ME_ENABLED_KEY, enabled ? 'true' : 'false');
}

/**
 * Check if reminder sound chime is enabled
 */
export function isRemindMeSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(REMIND_ME_SOUND_KEY) !== 'false';
}

/**
 * Set reminder sound chime
 */
export function setRemindMeSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REMIND_ME_SOUND_KEY, enabled ? 'true' : 'false');
}

/**
 * Play a tactical 3-tone notification chime via Web Audio API
 */
export function playNotificationChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes = [
      { freq: 523.25, time: 0, dur: 0.12 }, // C5
      { freq: 659.25, time: 0.14, dur: 0.12 }, // E5
      { freq: 783.99, time: 0.28, dur: 0.3 } // G5
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);
      gain.gain.setValueAtTime(0.2, now + time);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  } catch {
    // Audio context may be restricted by autoplay policy until user gesture
  }
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const res = await Notification.requestPermission();
    if (res === 'granted') {
      setRemindMeEnabled(true);
    }
    return res as NotificationPermissionState;
  } catch {
    return Notification.permission as NotificationPermissionState;
  }
}

/**
 * Trigger an actual browser notification (using ServiceWorker if available, otherwise window.Notification)
 */
export async function triggerNotification(title: string, options: NotificationOptions = {}): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  const defaultOptions: NotificationOptions & { renotify?: boolean } = {
    icon: '/pwa-192x192.png',
    badge: '/icon.svg',
    tag: 'linehaul-strong-reminder',
    renotify: true,
    requireInteraction: false,
    ...options
  };

  if (isRemindMeSoundEnabled()) {
    playNotificationChime();
  }

  // Try using ServiceWorkerRegistration if active
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        await registration.showNotification(title, defaultOptions);
        return true;
      }
    } catch {
      // Fall through to standard Notification constructor
    }
  }

  try {
    new Notification(title, defaultOptions);
    return true;
  } catch {
    return false;
  }
}

/**
 * Send an immediate test notification to verify driver device setup
 */
export async function sendTestNotification(): Promise<boolean> {
  return triggerNotification('Linehaul Strong: Reminder Active 🚛', {
    body: 'Notifications are verified and working! You will be reminded 24 hours after your last workout to maintain training consistency.',
    icon: '/pwa-192x192.png'
  });
}

/**
 * Check status of 24-hour reminder against user workout logs
 */
export function checkReminderStatus(logs: WorkoutLogEntry[]): ReminderCheckResult {
  if (!isNotificationSupported()) {
    return { status: 'unsupported' };
  }

  if (Notification.permission !== 'granted') {
    return { status: 'permission_needed' };
  }

  if (!isRemindMeEnabled()) {
    return { status: 'disabled' };
  }

  if (!logs || logs.length === 0) {
    return { status: 'no_logs' };
  }

  // Get most recent workout by timestamp
  const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const latestLog = sortedLogs[0];
  const lastWorkoutTime = new Date(latestLog.timestamp).getTime();
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
  const targetTime = lastWorkoutTime + TWENTY_FOUR_HOURS_MS;
  const now = Date.now();
  const remainingMs = targetTime - now;

  const targetDate = new Date(targetTime);

  if (remainingMs > 0) {
    const totalMinutes = Math.floor(remainingMs / (60 * 1000));
    const hoursRemaining = Math.floor(totalMinutes / 60);
    const minutesRemaining = totalMinutes % 60;

    return {
      status: 'scheduled',
      latestLog,
      remainingMs,
      targetDate,
      hoursRemaining,
      minutesRemaining
    };
  }

  // 24 hours or more have elapsed
  const lastNotifiedId = localStorage.getItem(LAST_NOTIFIED_LOG_KEY);
  if (lastNotifiedId === latestLog.id) {
    return {
      status: 'already_notified',
      latestLog,
      remainingMs: 0,
      targetDate,
      hoursRemaining: 0,
      minutesRemaining: 0
    };
  }

  return {
    status: 'triggered',
    latestLog,
    remainingMs: 0,
    targetDate,
    hoursRemaining: 0,
    minutesRemaining: 0
  };
}

/**
 * Check and fire the 24-hour reminder notification if due
 */
export async function checkAndTriggerDueReminder(logs: WorkoutLogEntry[]): Promise<boolean> {
  const result = checkReminderStatus(logs);
  if (result.status === 'triggered' && result.latestLog) {
    const log = result.latestLog;
    const sent = await triggerNotification('Linehaul Strong: 24-Hour Training Reminder 🚛', {
      body: `24 hours since your last session ("${log.title}"). Time to unlock tight hips and keep your road training consistency on track!`,
      icon: '/pwa-192x192.png',
      tag: `reminder-${log.id}`
    });

    if (sent) {
      localStorage.setItem(LAST_NOTIFIED_LOG_KEY, log.id);
      return true;
    }
  }
  return false;
}
