import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { CoachingEnrollment, CustomWorkoutPlan, TrainingDay } from '../types';
import { ROAD_WARRIOR_PROTOCOLS } from '../data/protocols';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
}

export const COACH_EMAIL = 'risneraryan@gmail.com';
export const ADMIN_EMAILS = [
  'risneraryan@gmail.com'
];

/**
 * Checks if a specific driver email is an Administrator
 * Strictly restricted to Super Admin Coach AJ Risner (risneraryan@gmail.com)
 */
export function isAdminUser(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(clean);
}

/**
 * Checks if a specific driver email is Coach AJ Risner or Admin
 * Strictly restricted to Coach AJ Risner (risneraryan@gmail.com)
 */
export function isCoachUser(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim().toLowerCase();
  return clean === COACH_EMAIL || isAdminUser(clean);
}

/**
 * Determines the explicit role for a given user email
 */
export function getUserRole(email?: string | null): 'admin' | 'coach' | 'driver' {
  if (!email || typeof email !== 'string') return 'driver';
  if (isAdminUser(email)) return 'admin';
  if (isCoachUser(email)) return 'coach';
  return 'driver';
}

// Local storage keys for offline cab resilience
const ENROLLMENT_KEY_PREFIX = 'linehaul_coaching_enrollment_';
const CUSTOM_PLANS_KEY_PREFIX = 'linehaul_custom_plans_';
const ALL_ENROLLMENTS_CACHE_KEY = 'linehaul_all_coaching_enrollments_cache';

/**
 * Driver signs up for 1-on-1 coaching through Coach AJ
 */
export async function enrollDriverInCoaching(data: {
  driverId: string;
  driverName: string;
  driverEmail: string;
  callsign?: string;
  carrier?: string;
  rigType: string;
  gearAvailable: string;
  shiftSchedule: string;
  painPointsOrInjuries: string;
  primaryGoals: string;
}): Promise<{ success: boolean; enrollment?: CoachingEnrollment; error?: string }> {
  try {
    const now = new Date().toISOString();
    const enrollment: CoachingEnrollment = {
      id: data.driverId,
      driverId: data.driverId,
      driverName: data.driverName,
      driverEmail: data.driverEmail,
      callsign: data.callsign || undefined,
      carrier: data.carrier || undefined,
      enrolledAt: now,
      status: 'enrolled',
      rigType: data.rigType,
      gearAvailable: data.gearAvailable,
      shiftSchedule: data.shiftSchedule,
      painPointsOrInjuries: data.painPointsOrInjuries,
      primaryGoals: data.primaryGoals,
      lastUpdated: now,
      hasCustomPlan: false
    };

    // 1. Instant local storage persistence
    try {
      localStorage.setItem(`${ENROLLMENT_KEY_PREFIX}${data.driverId}`, JSON.stringify(enrollment));
      // Also update driver list in admin cache
      const rawAll = localStorage.getItem(ALL_ENROLLMENTS_CACHE_KEY);
      const allList: CoachingEnrollment[] = rawAll ? JSON.parse(rawAll) : [];
      const filtered = allList.filter(e => e.driverId !== data.driverId);
      filtered.unshift(enrollment);
      localStorage.setItem(ALL_ENROLLMENTS_CACHE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error('Local cache save failed', e);
    }

    // 2. Sync to Firestore
    try {
      const docRef = doc(db, 'coachingEnrollments', data.driverId);
      await setDoc(docRef, enrollment, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `coachingEnrollments/${data.driverId}`);
    }

    return { success: true, enrollment };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to submit coaching enrollment' };
  }
}

/**
 * Get coaching enrollment for an individual driver
 */
export async function getDriverEnrollment(driverId: string): Promise<CoachingEnrollment | null> {
  // Try local cache first for zero latency
  try {
    const raw = localStorage.getItem(`${ENROLLMENT_KEY_PREFIX}${driverId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }

  // Fetch from Firestore
  try {
    const docRef = doc(db, 'coachingEnrollments', driverId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as CoachingEnrollment;
      localStorage.setItem(`${ENROLLMENT_KEY_PREFIX}${driverId}`, JSON.stringify(data));
      return data;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `coachingEnrollments/${driverId}`);
  }

  return null;
}

/**
 * Subscribe to real-time changes to a driver's coaching enrollment
 */
export function subscribeToDriverEnrollment(
  driverId: string,
  onUpdate: (enrollment: CoachingEnrollment | null) => void
): () => void {
  try {
    const docRef = doc(db, 'coachingEnrollments', driverId);
    const unsub = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as CoachingEnrollment;
          localStorage.setItem(`${ENROLLMENT_KEY_PREFIX}${driverId}`, JSON.stringify(data));
          onUpdate(data);
        } else {
          onUpdate(null);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, `coachingEnrollments/${driverId}`);
      }
    );
    return unsub;
  } catch {
    return () => {};
  }
}

/**
 * Coach AJ fetches all enrolled drivers who signed up for coaching
 */
export async function getAllCoachingEnrollments(): Promise<CoachingEnrollment[]> {
  const enrollmentsMap = new Map<string, CoachingEnrollment>();

  // Load from local cache first
  try {
    const raw = localStorage.getItem(ALL_ENROLLMENTS_CACHE_KEY);
    if (raw) {
      const parsed: CoachingEnrollment[] = JSON.parse(raw);
      parsed.forEach(e => enrollmentsMap.set(e.driverId, e));
    }
  } catch {
    // ignore
  }

  // Fetch from Firestore
  try {
    const colRef = collection(db, 'coachingEnrollments');
    const snap = await getDocs(colRef);
    snap.forEach((docSnap) => {
      const e = docSnap.data() as CoachingEnrollment;
      enrollmentsMap.set(e.driverId || docSnap.id, e);
    });

    const list = Array.from(enrollmentsMap.values());
    list.sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime());
    localStorage.setItem(ALL_ENROLLMENTS_CACHE_KEY, JSON.stringify(list));
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'coachingEnrollments');
    return Array.from(enrollmentsMap.values());
  }
}

/**
 * Upload / save a custom workout plan for an individual driver
 */
export async function uploadCustomWorkoutPlan(
  plan: CustomWorkoutPlan
): Promise<{ success: boolean; plan?: CustomWorkoutPlan; error?: string }> {
  try {
    const cleanPlan: CustomWorkoutPlan = {
      ...plan,
      assignedBy: plan.assignedBy || 'AJ Risner (ISSA Elite Trainer)',
      coachEmail: COACH_EMAIL,
      assignedDate: plan.assignedDate || new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      status: plan.status || 'active'
    };

    // 1. Instant local storage persistence for this driver
    try {
      const key = `${CUSTOM_PLANS_KEY_PREFIX}${cleanPlan.driverId}`;
      const raw = localStorage.getItem(key);
      const existing: CustomWorkoutPlan[] = raw ? JSON.parse(raw) : [];
      const updated = existing.filter(p => p.id !== cleanPlan.id);
      updated.unshift(cleanPlan);
      localStorage.setItem(key, JSON.stringify(updated));

      // Update enrollment status to 'plan-active'
      const enrollKey = `${ENROLLMENT_KEY_PREFIX}${cleanPlan.driverId}`;
      const enrollRaw = localStorage.getItem(enrollKey);
      if (enrollRaw) {
        const enrollData: CoachingEnrollment = JSON.parse(enrollRaw);
        enrollData.status = 'plan-active';
        enrollData.hasCustomPlan = true;
        enrollData.activePlanId = cleanPlan.id;
        enrollData.lastUpdated = new Date().toISOString();
        localStorage.setItem(enrollKey, JSON.stringify(enrollData));
      }
    } catch (e) {
      console.error('Local cache plan error', e);
    }

    // 2. Persist to Firestore: /drivers/{driverId}/customPlans/{planId}
    try {
      const planDocRef = doc(db, 'drivers', cleanPlan.driverId, 'customPlans', cleanPlan.id);
      await setDoc(planDocRef, cleanPlan, { merge: true });

      // Update enrollment in Firestore
      const enrollDocRef = doc(db, 'coachingEnrollments', cleanPlan.driverId);
      await setDoc(enrollDocRef, {
        status: 'plan-active',
        hasCustomPlan: true,
        activePlanId: cleanPlan.id,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `drivers/${cleanPlan.driverId}/customPlans/${cleanPlan.id}`);
    }

    return { success: true, plan: cleanPlan };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to upload custom workout plan' };
  }
}

/**
 * Get all custom plans for a specific driver
 */
export async function getDriverCustomPlans(driverId: string): Promise<CustomWorkoutPlan[]> {
  try {
    const raw = localStorage.getItem(`${CUSTOM_PLANS_KEY_PREFIX}${driverId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }

  try {
    const plansRef = collection(db, 'drivers', driverId, 'customPlans');
    const snap = await getDocs(plansRef);
    const plans: CustomWorkoutPlan[] = [];
    snap.forEach((docSnap) => {
      plans.push(docSnap.data() as CustomWorkoutPlan);
    });
    localStorage.setItem(`${CUSTOM_PLANS_KEY_PREFIX}${driverId}`, JSON.stringify(plans));
    return plans;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, `drivers/${driverId}/customPlans`);
    return [];
  }
}

/**
 * Real-time listener for a driver's custom plans
 */
export function subscribeToDriverCustomPlans(
  driverId: string,
  onUpdate: (plans: CustomWorkoutPlan[]) => void
): () => void {
  try {
    const plansRef = collection(db, 'drivers', driverId, 'customPlans');
    const unsub = onSnapshot(
      plansRef,
      (snap) => {
        const plans: CustomWorkoutPlan[] = [];
        snap.forEach((docSnap) => {
          plans.push(docSnap.data() as CustomWorkoutPlan);
        });
        localStorage.setItem(`${CUSTOM_PLANS_KEY_PREFIX}${driverId}`, JSON.stringify(plans));
        onUpdate(plans);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, `drivers/${driverId}/customPlans`);
      }
    );
    return unsub;
  } catch {
    return () => {};
  }
}

/**
 * Delete or archive custom plan
 */
export async function deleteCustomPlan(driverId: string, planId: string): Promise<boolean> {
  try {
    const key = `${CUSTOM_PLANS_KEY_PREFIX}${driverId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const existing: CustomWorkoutPlan[] = JSON.parse(raw);
      const filtered = existing.filter(p => p.id !== planId);
      localStorage.setItem(key, JSON.stringify(filtered));
    }

    const planDocRef = doc(db, 'drivers', driverId, 'customPlans', planId);
    await deleteDoc(planDocRef);
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `drivers/${driverId}/customPlans/${planId}`);
    return false;
  }
}

// ==========================================
// PRESET TEMPLATES DESIGNED BY COACH AJ RISNER
// ==========================================
export const COACH_PRESET_TEMPLATES: Omit<CustomWorkoutPlan, 'id' | 'driverId' | 'driverName' | 'driverEmail' | 'assignedDate'>[] = [
  {
    planTitle: "Night Shift Hazmat: 3-Day Anti-Sitting & Spine Rebuild",
    planDescription: "Specifically engineered for overnight linehaul drivers pulling heavy tank or doubles. Counteracts highway seat slump, restores glute firing, and re-stabilizes the thoracic spine without needing any gym equipment.",
    assignedBy: "AJ Risner (ISSA Elite Trainer)",
    coachEmail: COACH_EMAIL,
    status: "active",
    targetDaysPerWeek: 3,
    totalWeeks: 4,
    customDirectives: [
      "Perform Day 1 before starting your 11-hour driving block while core body temperature is responsive.",
      "Never skip the 90/90 sleeper decompression after uncoupling doubles.",
      "Stay hydrated: minimum 1 electrolyte pack per 500-mile leg."
    ],
    equipmentNeeded: ["Rig / Grab Rail", "Resistance Band", "Sleeper Berth", "Cab Step"],
    trainingDays: [
      {
        id: "custom-d1",
        dayNumber: 1,
        title: "Thoracic Opening & Rear Wheel Hinge",
        subtitle: "Decompress Lumbar & Unlock Shoulder Blades",
        description: "Restores extension after 8+ hours gripped behind the steering wheel.",
        targetFocus: "Thoracic Spine, Posterior Chain & Hamstrings",
        durationMinutes: 18,
        equipmentRequired: ["Resistance Band", "Rig / Grab Rail"],
        recommendedTime: "Pre-trip or 30-min break",
        exercises: [
          {
            id: "ex-c1",
            name: "Grab-Rail Decompression Lat Hang",
            targetArea: "Lats & Thoracolumbar Fascia",
            equipment: "Rig / Grab Rail",
            rigAnchor: "Cab Ingress Rail (Passenger Side)",
            sets: 3,
            repsOrDuration: "45 seconds",
            tempo: "Slow and controlled hold",
            restSeconds: 30,
            coachingCue: "Drop your hips back like sitting into an imaginary chair while gripping rail. Feel spine separate.",
            posturalBenefit: "Reverses disc compression caused by road vibration.",
            stepGuide: [
              "Grip both rails firmly with two hands.",
              "Hinge back at the hips, letting your chest drop between your arms.",
              "Breathe deeply into your lower ribs for 45 seconds."
            ]
          },
          {
            id: "ex-c2",
            name: "Rig-Step Single Leg RDL",
            targetArea: "Hamstrings, Glutes & Balance",
            equipment: "Cab Step",
            rigAnchor: "Lower Fuel Tank Step",
            sets: 3,
            repsOrDuration: "10 reps / leg",
            tempo: "Slow and controlled",
            restSeconds: 45,
            coachingCue: "Soft knee on the working leg. Send the back heel straight toward the trailer kingpin.",
            posturalBenefit: "Re-activates asleep glutes from sitting in air-ride seats.",
            stepGuide: [
              "Stand tall on flat ground facing away from the truck step.",
              "Place one rear foot lightly onto the bottom step for stability.",
              "Hinge hips backward until a stretch is felt in front hamstring, then squeeze glute to rise."
            ]
          },
          {
            id: "ex-c3",
            name: "Resistance Band Face Pull & External Rotation",
            targetArea: "Rear Shoulders & Upper Back",
            equipment: "Resistance Band",
            rigAnchor: "Mirror Bracket or Grab Handle",
            sets: 4,
            repsOrDuration: "15 reps",
            tempo: "Slow and controlled",
            restSeconds: 30,
            coachingCue: "Pull thumbs past your ears and pinch shoulder blades as if cracking a hazelnut between them.",
            posturalBenefit: "Eliminates driver hunchback and steering wheel shoulder impingement.",
            stepGuide: [
              "Loop band around truck mirror bracket at chest height.",
              "Step back to create medium tension.",
              "Pull elbows high and wide, rotating thumbs back behind head."
            ]
          }
        ]
      },
      {
        id: "custom-d2",
        dayNumber: 2,
        title: "Bunk Core & Anti-Rotational Stability",
        subtitle: "Protect the Sacroiliac Joint & Abdominal Wall",
        description: "100% inside the sleeper berth. No cold pavement, no external eyes.",
        targetFocus: "Deep Core, Abs, Hip Flexor Release",
        durationMinutes: 15,
        equipmentRequired: ["Sleeper Berth"],
        recommendedTime: "Post-trip 10-Hour Reset before sleep",
        exercises: [
          {
            id: "ex-c4",
            name: "Sleeper Mattress Dead Bug & Diaphragmatic Pulse",
            targetArea: "Deep Core & Abs",
            equipment: "Sleeper Berth",
            rigAnchor: "Bunk Mattress",
            sets: 3,
            repsOrDuration: "12 reps alternating",
            tempo: "Slow and controlled",
            restSeconds: 30,
            coachingCue: "Press lower back firmly into the bunk mattress. Don't allow a sliver of daylight beneath spine.",
            posturalBenefit: "Re-educates core bracing to avoid blowouts when lifting heavy hoods or 5th wheel pins.",
            stepGuide: [
              "Lie flat on the bunk with arms straight up and knees bent 90 degrees.",
              "Slowly lower opposite arm and leg toward mattress without letting lumbar arch.",
              "Return with control and alternate sides."
            ]
          },
          {
            id: "ex-c5",
            name: "Sleeper Wall Iso-Push Anti-Rotation",
            targetArea: "Side Abs & Lower Back Shield",
            equipment: "Sleeper Berth",
            rigAnchor: "Sleeper Rear Wall / Closet Bulkhead",
            sets: 3,
            repsOrDuration: "30 sec / side",
            tempo: "Slow and controlled hold",
            restSeconds: 30,
            coachingCue: "Drive palms into the sleeper bulkhead. Resist any twisting of the torso.",
            posturalBenefit: "Stabilizes the core to protect against lower back strain during bumpy linehaul runs.",
            stepGuide: [
              "Stand or tall-kneel on bunk facing the wall.",
              "Place hands against the bulkhead at shoulder height.",
              "Press with steady force while maintaining a rigid core."
            ]
          }
        ]
      },
      {
        id: "custom-d3",
        dayNumber: 3,
        title: "Lower Body Drive & Dock Power",
        subtitle: "Leg Strength, Knee Durability & Ingress Cushioning",
        description: "Built using the cab steps and drive tires to preserve knee cartilage when hopping down.",
        targetFocus: "Quads, Hips & Ankle Mobility",
        durationMinutes: 20,
        equipmentRequired: ["Cab Step", "Bodyweight"],
        recommendedTime: "Morning walk-around inspection",
        exercises: [
          {
            id: "ex-c6",
            name: "Controlled Cab-Step Slow Step-Downs",
            targetArea: "Knees & Quads",
            equipment: "Cab Step",
            rigAnchor: "First Ingress Step",
            sets: 3,
            repsOrDuration: "12 reps / leg",
            tempo: "Slow and controlled",
            restSeconds: 45,
            coachingCue: "Lower heel to asphalt with slow control. Light touch, don't crash down.",
            posturalBenefit: "Protects the knees against impact trauma from jumping off fuel islands.",
            stepGuide: [
              "Stand on first cab step holding grab rail lightly with one hand.",
              "Slowly bend working knee to lower the opposite foot to tap the asphalt.",
              "Press through the step heel to return up."
            ]
          },
          {
            id: "ex-c7",
            name: "Rear Bumper Slow & Controlled Wall Sit",
            targetArea: "Quads & Thigh Endurance",
            equipment: "Rig / Grab Rail",
            rigAnchor: "Trailer Rear Door or Mudflap Apron",
            sets: 3,
            repsOrDuration: "45-60 seconds",
            tempo: "Slow and controlled hold",
            restSeconds: 45,
            coachingCue: "Thighs parallel to asphalt. Keep knees tracking over toes.",
            posturalBenefit: "Builds endurance in leg muscles that stiffen up on cruise control.",
            stepGuide: [
              "Back against clean trailer door panel.",
              "Slide down until knees are bent 90 degrees.",
              "Breathe steadily through nose until timer expires."
            ]
          }
        ]
      }
    ]
  },
  {
    planTitle: "Heavy Haul & Flatbed: Grip, Shoulder & Tarping Armor",
    planDescription: "Formulated for flatbed and heavy equipment haulers who constantly wrestle 120-lb lumber tarps, binders, and winch bars. Protects shoulders, prevents bicep tendon tears, and builds unbreakable forearm grip.",
    assignedBy: "AJ Risner (ISSA Elite Trainer)",
    coachEmail: COACH_EMAIL,
    status: "active",
    targetDaysPerWeek: 3,
    totalWeeks: 4,
    customDirectives: [
      "Use your ratchet binder or a 15-lb dumbbell for wrist rollouts.",
      "Warm up shoulders with band dislocations before climbing flatbed trailers.",
      "Wear work gloves for safety during all rig rail anchors."
    ],
    equipmentNeeded: ["Light Dumbbells", "Resistance Band", "Rig / Grab Rail"],
    trainingDays: [
      {
        id: "custom-hh-1",
        dayNumber: 1,
        title: "Tarping Shoulder Integrity & Scapular Pull",
        subtitle: "Reinforce Overhead Capacity & Rotator Cuff",
        description: "Eliminates clicking shoulders and impingement from tossing straps.",
        targetFocus: "Shoulders, Upper Back & Grip",
        durationMinutes: 20,
        equipmentRequired: ["Light Dumbbells", "Resistance Band"],
        recommendedTime: "Post-load securement",
        exercises: [
          {
            id: "ex-hh1",
            name: "Light DB Scaption Y-Raise",
            targetArea: "Upper Back & Shoulders",
            equipment: "Light Dumbbells",
            rigAnchor: "Flatbed Rub Rail or Cab Step",
            sets: 3,
            repsOrDuration: "12 reps (10-15 lbs)",
            tempo: "Slow and controlled",
            restSeconds: 45,
            coachingCue: "Raise dumbbells at a 30-degree forward angle, thumbs pointing to the sky.",
            posturalBenefit: "Prevents shoulder tears when lifting wet tarps.",
            stepGuide: [
              "Stand tall with athletic stance.",
              "Raise weights up to eye level at 45 degrees.",
              "Lower with a strict 2-second negative."
            ]
          },
          {
            id: "ex-hh2",
            name: "Binder Grip Static Farmer Walk",
            targetArea: "Forearms & Grip",
            equipment: "Light Dumbbells",
            rigAnchor: "Catwalk / Trailer Apron",
            sets: 4,
            repsOrDuration: "60-second march",
            tempo: "Slow and controlled",
            restSeconds: 60,
            coachingCue: "Squeeze handles hard. Shoulders pinned back and down, ribs tucked.",
            posturalBenefit: "Eliminates winch-bar wrist sprains and elbow pain.",
            stepGuide: [
              "Pick up dumbbells or chained weights from a safe squat position.",
              "Walk with tall spine around your trailer perimeter for 60 seconds."
            ]
          }
        ]
      }
    ]
  },
  {
    planTitle: "OTR 48-State: 15-Minute Sleeper Berth Minimalist",
    planDescription: "Zero outside visibility, zero equipment needed beyond bodyweight and bunk. Perfect for winter storms, crowded truck stops, or late-night 10-hour resets when you want quick, high-yield work without leaving the truck.",
    assignedBy: "AJ Risner (ISSA Elite Trainer)",
    coachEmail: COACH_EMAIL,
    status: "active",
    targetDaysPerWeek: 4,
    totalWeeks: 4,
    customDirectives: [
      "Open sleeper roof vent slightly for fresh air circulation during sets.",
      "Drink 16oz water immediately upon completion.",
      "Follow up with 5-minute leg elevation on bunk wall."
    ],
    equipmentNeeded: ["Sleeper Berth", "Bodyweight"],
    trainingDays: [
      {
        id: "custom-otr-1",
        dayNumber: 1,
        title: "Bunk Push-Pull & Posterior Decompression",
        subtitle: "100% In-Cab Fast Reset",
        description: "Compact upper body and core split designed to fit between bunk closets.",
        targetFocus: "Chest, Triceps, Abs & Hip Flexors",
        durationMinutes: 15,
        equipmentRequired: ["Sleeper Berth"],
        recommendedTime: "Before bunk curtains closed for sleep",
        exercises: [
          {
            id: "ex-otr1",
            name: "Bunk Edge Incline Push-Up with Scapular Squeeze",
            targetArea: "Chest & Arms",
            equipment: "Sleeper Berth",
            rigAnchor: "Bunk Edge Frame",
            sets: 3,
            repsOrDuration: "15 reps",
            tempo: "Slow and controlled",
            restSeconds: 30,
            coachingCue: "At top of push-up, push through hands to squeeze shoulder blades smoothly.",
            posturalBenefit: "Re-engages upper body pressing mechanics lost during hours of sitting.",
            stepGuide: [
              "Hands on the edge of the lower bunk mattress or frame.",
              "Body in a rigid straight line from heels to head.",
              "Lower chest to touch mattress edge, press smoothly back up."
            ]
          },
          {
            id: "ex-otr2",
            name: "Sleeper Glute Bridge Single-Leg Pulse",
            targetArea: "Glutes & Hamstrings",
            equipment: "Sleeper Berth",
            rigAnchor: "Bunk Mattress",
            sets: 3,
            repsOrDuration: "12 reps / leg",
            tempo: "Slow and controlled",
            restSeconds: 30,
            coachingCue: "Drive heels into mattress. At top, hold 2 seconds and squeeze glutes firm.",
            posturalBenefit: "Relieves tightness in hips and prevents sciatic nerve irritation.",
            stepGuide: [
              "Lie on back on mattress with knees bent.",
              "Lift one leg toward ceiling.",
              "Drive through the planted heel to raise hips toward bunk ceiling."
            ]
          }
        ]
      }
    ]
  },
  {
    planTitle: "The Road Warrior: 3-Day Commercial Gym & Planet Fitness Plan",
    planDescription: "Specifically formulated for commercial drivers stopping at Planet Fitness or commercial gyms with nearby truck parking. Counteracts driving posture, tight hip flexors, weakened glutes/hamstrings, and lower back compression across a balanced 3-day split.",
    assignedBy: "AJ Risner (ISSA Elite Trainer)",
    coachEmail: COACH_EMAIL,
    status: "active",
    targetDaysPerWeek: 3,
    totalWeeks: 6,
    customDirectives: [
      "Always perform the mandatory 5-10 minute warm-up (cardio + dynamic stretches) before lifting.",
      "Strictly observe 60-90 second rest periods to maintain hormonal response and efficiency.",
      "Utilize PF Black Card HydroMassage beds or heated massage recliners immediately post-workout to loosen lumbar erectors."
    ],
    equipmentNeeded: ["Dumbbells", "Cable Machine", "Smith Machine", "Incline Bench", "Leg Curl Machine", "Captain's Chair"],
    trainingDays: ROAD_WARRIOR_PROTOCOLS
  }
];
