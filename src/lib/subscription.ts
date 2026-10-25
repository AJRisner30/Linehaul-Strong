import { MembershipTier, SubscriptionPackage, FleetQuoteInquiry } from '../types';
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore';

const SUBSCRIPTION_STORAGE_KEY = 'linehaul_active_membership_tier';
const SUBSCRIPTION_METADATA_KEY = 'linehaul_membership_metadata';
const FLEET_INQUIRIES_STORAGE_KEY = 'linehaul_fleet_inquiries';

export interface MembershipMetadata {
  tier: MembershipTier;
  trialStartDate?: string;
  trialExpiresDate?: string;
  subscriptionStartDate?: string;
  renewsDate?: string;
}

export const SUBSCRIPTION_PACKAGES: SubscriptionPackage[] = [
  {
    id: 'trial',
    name: '14-Day Free Trial',
    priceDisplay: '$0',
    billingPeriod: '14 Days Free',
    badge: '14 DAYS FREE • ALL ACCESS',
    tagline: 'Experience the full tactical training system with full test-drive of road & gym protocols',
    description: 'Get immediate 14-day free access to test drive the Road Warrior 3-Day Gym Split, Gyms & 53\' Truck Parking GPS, Rest Stop Split, Light DB In-Cab, Dock Drills, and Cab-Galley nutrition.',
    highlighted: false,
    ctaText: 'Start 14-Day Free Trial',
    features: [
      { name: 'Road Warrior 3-Day Gym Split', included: true, note: '14-Day Gym Test Drive' },
      { name: 'Gyms & Truck Parking GPS (53\' lots)', included: true, note: '53\' Staging GPS Included' },
      { name: 'Rest Stop 4-Day Split Protocol', included: true, note: 'Tire & Grab Rail anchors' },
      { name: 'Light Dumbbell In-Cab Anywhere', included: true, note: 'Bunk & step routines' },
      { name: 'Dock Door Micro-Drills (5-10m)', included: true, note: 'Active staging timers' },
      { name: 'Cab-Galley Nutrition & Fuel Station Guide', included: true, note: '12V recipes & health grades' },
      { name: 'HOS Sleep Recovery & Vibration Tracking', included: true },
      { name: 'Hydration Stop Timing Calculator', included: true },
      { name: 'Workout Logbook & Telemetry Export', included: true, note: 'Complete history' },
      { name: '1-on-1 Coach AJ Custom Rig Plan', included: false, note: 'Requires Pro ($30) personal coach dispatch' },
    ]
  },
  {
    id: 'starter',
    name: 'Driver Starter',
    priceDisplay: '$15',
    billingPeriod: 'per month',
    badge: 'CORE FEATURES',
    tagline: 'Essential rig-side and in-cab fitness for solo linehaul operators',
    description: 'Affordable, focused routine library designed for drivers who work out directly in their rig bunk or at rest areas without a gym membership.',
    highlighted: false,
    ctaText: 'Select $15 Starter',
    features: [
      { name: 'Rest Stop 4-Day Split Protocol', included: true, note: 'Tire & Grab Rail anchors' },
      { name: 'Light Dumbbell In-Cab Anywhere', included: true, note: 'Bunk & step routines' },
      { name: 'Dock Door Micro-Drills (5-10m)', included: true, note: 'Micro workouts during live loading' },
      { name: 'Cab-Galley Nutrition & Fuel Station Guide', included: true, note: '12V recipes & health grades' },
      { name: 'HOS Sleep Recovery & Vibration Tracking', included: true },
      { name: 'Hydration Stop Timing Calculator', included: true },
      { name: 'Workout Logbook & History Tracking', included: true },
      { name: 'Road Warrior 3-Day Gym Split', included: false, note: 'Requires Pro' },
      { name: 'Gyms & Truck Parking GPS (53\' staging)', included: false, note: 'Requires Pro' },
      { name: '1-on-1 Coach AJ Custom Rig Plan', included: false, note: 'Requires Pro' },
    ]
  },
  {
    id: 'pro',
    name: 'Road Warrior Pro',
    priceDisplay: '$30',
    billingPeriod: 'per month',
    badge: 'MOST POPULAR • ALL UNLOCKED',
    tagline: 'Complete, unrestricted access to the entire Linehaul Strong platform',
    description: 'The ultimate fitness command center for long-haul truckers. Combines in-cab routines, commercial gym splits with semi parking, and custom 1-on-1 coaching.',
    highlighted: true,
    ctaText: 'Unlock Everything ($30/mo)',
    features: [
      { name: 'Everything in the $15 Starter Tier', included: true },
      { name: 'Road Warrior 3-Day Commercial Gym Split', included: true, note: 'Full gym push/pull/legs' },
      { name: 'Gyms with 53\' Truck Parking GPS Map', included: true, note: 'Verified Planet Fitness & corridor lots' },
      { name: '1-on-1 Coach AJ Custom Rig Plan', included: true, note: 'Tailored to your equipment & schedule' },
      { name: 'Direct Priority Coach Dispatch & Messaging', included: true, note: 'Direct line to Coach AJ Risner' },
      { name: 'Rest Stop 4-Day Split & In-Cab DB Programs', included: true },
      { name: 'Dock Door Micro-Drill HIIT Timers', included: true },
      { name: 'Cab-Galley 12V Cooker Guides & Fuel Grades', included: true },
      { name: 'Advanced DOT Physical Readiness Protocols', included: true },
      { name: 'Full Workout Logbook & Telemetry Export', included: true },
    ]
  },
  {
    id: 'fleet',
    name: 'Fleet Package',
    priceDisplay: 'Fleet Discount',
    billingPeriod: 'Custom Carrier Rate',
    badge: 'WHOLE FLEET DISCOUNT',
    tagline: 'Group rate pricing and health coaching for your entire trucking fleet',
    description: 'Equip your whole carrier fleet with tactical driver fitness. Drastically boost driver retention, improve DOT medical card renewal rates, and cut workers’ comp strain claims.',
    highlighted: false,
    ctaText: 'Contact Us for Fleet Pricing',
    features: [
      { name: 'Bulk Driver Accounts at Steep Discount', included: true, note: 'Tiered pricing based on truck count' },
      { name: 'All Features Unlocked for Every Driver', included: true, note: 'Complete access to all 4 workout splits' },
      { name: 'Fleet Wellness & DOT Medical Pass Tracking', included: true, note: 'Keep drivers healthy & on the road' },
      { name: 'Turnkey Terminal Onboarding & Driver Seminars', included: true, note: 'Led by Coach AJ Risner' },
      { name: 'Dedicated Fleet Account Manager', included: true },
      { name: 'Quarterly Safety & Ergonomic Strain Audits', included: true, note: 'Lower workers\' comp claims' },
    ]
  }
];

/**
 * Get active membership metadata from local storage or defaults.
 */
export function getActiveMembership(driverId?: string): MembershipMetadata {
  try {
    const key = driverId ? `${SUBSCRIPTION_METADATA_KEY}_${driverId}` : SUBSCRIPTION_METADATA_KEY;
    const raw = localStorage.getItem(key);
    if (raw) {
      const data = JSON.parse(raw) as MembershipMetadata;
      // Check if trial has expired
      if (data.tier === 'trial' && data.trialExpiresDate) {
        const expiresTime = new Date(data.trialExpiresDate).getTime();
        const now = Date.now();
        if (now > expiresTime) {
          // Trial expired
          return {
            tier: 'none',
            trialStartDate: data.trialStartDate,
            trialExpiresDate: data.trialExpiresDate
          };
        }
      }
      return data;
    }
  } catch (e) {
    console.warn('Error reading membership metadata:', e);
  }

  // By default, grant new drivers the 14-day free trial so they can test everything right away
  return {
    tier: 'trial',
    trialStartDate: new Date().toISOString(),
    trialExpiresDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
  };
}

/**
 * Save membership metadata locally and attempt Firestore sync.
 */
export async function saveActiveMembership(
  metadata: MembershipMetadata, 
  driverId?: string
): Promise<void> {
  try {
    const key = driverId ? `${SUBSCRIPTION_METADATA_KEY}_${driverId}` : SUBSCRIPTION_METADATA_KEY;
    localStorage.setItem(key, JSON.stringify(metadata));
    localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, metadata.tier);

    if (driverId) {
      try {
        const driverRef = doc(db, 'drivers', driverId);
        await setDoc(driverRef, {
          membershipTier: metadata.tier,
          trialStartDate: metadata.trialStartDate || null,
          trialExpiresDate: metadata.trialExpiresDate || null,
          subscriptionRenewsDate: metadata.renewsDate || null,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (firestoreError) {
        console.warn('Firestore subscription sync deferred (cached locally):', firestoreError);
      }
    }
  } catch (e) {
    console.error('Failed to save membership state:', e);
  }
}

/**
 * Calculates days and hours remaining in the 14-day free trial.
 */
export function getTrialTimeRemaining(expiresDateStr?: string): {
  daysLeft: number;
  hoursLeft: number;
  isExpired: boolean;
  displayText: string;
} {
  if (!expiresDateStr) {
    return { daysLeft: 14, hoursLeft: 0, isExpired: false, displayText: '14 days remaining' };
  }

  const expiresTime = new Date(expiresDateStr).getTime();
  const diffMs = expiresTime - Date.now();

  if (diffMs <= 0) {
    return { daysLeft: 0, hoursLeft: 0, isExpired: true, displayText: 'Trial Expired' };
  }

  const daysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (daysLeft === 0) {
    return { daysLeft: 0, hoursLeft, isExpired: false, displayText: `${hoursLeft} hours remaining` };
  }

  return {
    daysLeft,
    hoursLeft,
    isExpired: false,
    displayText: `${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining`
  };
}

/**
 * Checks whether a specific feature is unlocked under the current membership tier.
 */
export function isFeatureUnlocked(
  tier: MembershipTier,
  feature: 'road-warrior' | 'custom-plan' | 'coach-direct' | 'hub-runner' | 'telemetry-export' | 'rest-stop' | 'light-db' | 'dock-drills' | 'nutrition' | 'hos-recovery' | 'hydration'
): boolean {
  // Pro ($30) and Fleet tiers unlock 100% of the platform
  if (tier === 'pro' || tier === 'fleet' || tier === 'fleet_pending') {
    return true;
  }

  // 14-Day Free Trial unlocks the full tactical test-drive:
  // - Road Warrior 3-Day Gym Split (Push/Pull/Legs)
  // - Gyms & 53' Semi Parking GPS locator
  // - Rest Stop Split, Light DB In-Cab, Dock Drills, Nutrition, Sleep, Hydration, Logbook
  // Only bespoke 1-on-1 personal coach assignment (custom-plan) and direct priority coach dispatch requires paid Pro.
  if (tier === 'trial') {
    if (feature === 'custom-plan' || feature === 'coach-direct') {
      return false; // Pro ($30) exclusive personal coaching assignment
    }
    return true; // Full test-drive of road, gym, and in-cab protocols unlocked
  }

  // Driver Starter ($15) unlocks core in-cab / rest-stop routines,
  // but strictly locks commercial gym splits, 53' semi parking gym GPS locator,
  // and 1-on-1 coach AJ custom plan assignment (these require Road Warrior Pro).
  if (tier === 'starter') {
    if (
      feature === 'road-warrior' || 
      feature === 'hub-runner' || 
      feature === 'custom-plan' || 
      feature === 'coach-direct'
    ) {
      return false; // Pro ($30) exclusive
    }
    return true; // In-cab / rest stop routines unlocked
  }

  // 'none' (expired trial and not subscribed)
  // Give basic preview access to rest stop and light db only
  if (feature === 'rest-stop' || feature === 'light-db') {
    return true;
  }
  return false;
}

/**
 * Activate the 14-Day Free Trial.
 */
export async function activateFreeTrial(driverId?: string): Promise<MembershipMetadata> {
  const startDate = new Date();
  const expiresDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);

  const metadata: MembershipMetadata = {
    tier: 'trial',
    trialStartDate: startDate.toISOString(),
    trialExpiresDate: expiresDate.toISOString()
  };

  await saveActiveMembership(metadata, driverId);
  return metadata;
}

/**
 * Subscribe to the $15 Starter or $30 Pro package.
 */
export async function activatePackage(
  tier: 'starter' | 'pro',
  driverId?: string
): Promise<MembershipMetadata> {
  const startDate = new Date();
  const renewsDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  const metadata: MembershipMetadata = {
    tier,
    subscriptionStartDate: startDate.toISOString(),
    renewsDate: renewsDate.toISOString()
  };

  await saveActiveMembership(metadata, driverId);
  return metadata;
}

/**
 * Submit an inquiry for the whole Fleet discounted package.
 */
export async function submitFleetInquiry(
  inquiry: Omit<FleetQuoteInquiry, 'id' | 'submittedAt' | 'status'>
): Promise<{ success: boolean; inquiry: FleetQuoteInquiry; error?: string }> {
  try {
    const fullInquiry: FleetQuoteInquiry = {
      ...inquiry,
      id: `fleet_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      submittedAt: new Date().toISOString(),
      status: 'received'
    };

    // 1. Save locally
    const existingRaw = localStorage.getItem(FLEET_INQUIRIES_STORAGE_KEY);
    const existing: FleetQuoteInquiry[] = existingRaw ? JSON.parse(existingRaw) : [];
    existing.unshift(fullInquiry);
    localStorage.setItem(FLEET_INQUIRIES_STORAGE_KEY, JSON.stringify(existing));

    // 2. Save to Firestore
    try {
      await addDoc(collection(db, 'fleet_inquiries'), {
        ...fullInquiry,
        createdAt: new Date().toISOString()
      });
    } catch (firestoreError) {
      console.warn('Firestore fleet inquiry cached locally:', firestoreError);
    }

    return { success: true, inquiry: fullInquiry };
  } catch (e: any) {
    console.error('Fleet inquiry submission error:', e);
    return { success: false, error: e?.message || 'Could not submit fleet inquiry', inquiry: null as any };
  }
}

/**
 * Read saved fleet inquiries (for Admin CRM or local logs).
 */
export function getSavedFleetInquiries(): FleetQuoteInquiry[] {
  try {
    const raw = localStorage.getItem(FLEET_INQUIRIES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Update fleet inquiry status and admin notes (Admin CRM).
 */
export async function updateFleetInquiryStatus(
  inquiryId: string,
  status: FleetQuoteInquiry['status'],
  adminNotes?: string,
  quotedDiscountRate?: string
): Promise<boolean> {
  try {
    const existing = getSavedFleetInquiries();
    const updated = existing.map((item) => {
      if (item.id === inquiryId) {
        return {
          ...item,
          status,
          adminNotes: adminNotes !== undefined ? adminNotes : item.adminNotes,
          quotedDiscountRate: quotedDiscountRate !== undefined ? quotedDiscountRate : item.quotedDiscountRate
        };
      }
      return item;
    });
    localStorage.setItem(FLEET_INQUIRIES_STORAGE_KEY, JSON.stringify(updated));

    try {
      const docRef = doc(db, 'fleet_inquiries', inquiryId);
      await updateDoc(docRef, {
        status,
        ...(adminNotes ? { adminNotes } : {}),
        ...(quotedDiscountRate ? { quotedDiscountRate } : {}),
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Firestore fleet inquiry update cached locally:', err);
    }

    return true;
  } catch (e) {
    console.error('Failed to update fleet inquiry:', e);
    return false;
  }
}
