export type ProtocolDayId = 'day-1' | 'day-2' | 'day-3' | 'day-4' | 'db-1' | 'db-2' | 'db-3' | 'rw-1' | 'rw-2' | 'rw-3' | string;

export interface Exercise {
  id: string;
  name: string;
  targetArea: string;
  equipment: 'Bodyweight' | 'Resistance Band' | 'Cab Step' | 'Rig / Grab Rail' | 'Sleeper Berth' | 'Commercial Tire' | 'Light Dumbbells' | 'Dumbbells' | 'Commercial Gym' | 'Cable Machine' | 'Smith Machine' | 'Kettlebell' | string;
  rigAnchor: string;
  sets: number;
  repsOrDuration: string;
  tempo: string;
  restSeconds: number;
  coachingCue: string;
  posturalBenefit: string;
  hazardNote?: string;
  stepGuide: string[];
}

export interface TrainingDay {
  id: ProtocolDayId;
  dayNumber: number;
  title: string;
  subtitle: string;
  description: string;
  targetFocus: string;
  durationMinutes: number;
  equipmentRequired: string[];
  recommendedTime: string;
  exercises: Exercise[];
}

// ==========================================
// GYM WITH TRUCK PARKING TYPES
// ==========================================
export type GymChainType =
  | 'Planet Fitness'
  | 'Anytime Fitness'
  | 'Snap Fitness'
  | 'YMCA'
  | 'Crunch Fitness'
  | "Gold's Gym"
  | '24 Hour Fitness'
  | 'Independent Iron';

export type TruckParkingType =
  | "Dedicated Semi / 53' Lot"
  | 'Adjacent Truck Stop (<0.5 mi)'
  | 'Truck Stop Corridor (1-3 mi)'
  | 'Big Box / Walmart Shared Apron'
  | 'Bobtail Staging Stalls'
  | 'Legal Industrial Staging Street';

export interface NearestTruckStopInfo {
  name: string;
  brand: 'Flying J' | 'Pilot' | "Love's" | 'TA' | 'Petro' | 'Little America' | 'AMBEST' | 'Independent';
  address: string;
  highwayExit: string;
  distanceMiles: number;
  transitType: 'Walkable (<0.5 mi)' | 'Short Ride / Shuttle (1-3 mi)' | 'Bobtail / Rideshare (3-6 mi)' | 'Highway Run (6+ mi)';
  walkOrDriveTime: string;
  truckStalls: number;
  verifiedNotes?: string;
  lat?: number;
  lng?: number;
}

export interface GymWithTruckParking {
  id: string;
  name: string;
  chain: GymChainType;
  city: string;
  state: string;
  highway: string;
  lat: number;
  lng: number;
  parkingType: TruckParkingType;
  parkingDistance: string;
  nearestTruckStop: NearestTruckStopInfo;
  rigCompatibility: 'Full 53ft Combo' | 'Bobtail Only' | 'Wide Staging Curb';
  truckSpacesEstimated: number;
  amenities: string[];
  driverNotes: string;
  phone: string;
  address: string;
  walkRouteNotes: string;
}

export interface WorkoutLogEntry {
  id: string;
  timestamp: string;
  type: 'rest-stop-protocol' | 'light-db' | 'road-warrior' | 'dock-door-drill' | 'gym-workout' | 'hub-runner-gps' | 'custom-coaching';
  title: string;
  durationMinutes: number;
  caloriesBurned: number;
  distanceMiles?: number;
  notes?: string;
}

export type MembershipTier = 'trial' | 'starter' | 'pro' | 'fleet' | 'fleet_pending' | 'none';

export interface SubscriptionPackage {
  id: 'trial' | 'starter' | 'pro' | 'fleet';
  name: string;
  priceDisplay: string;
  billingPeriod: string;
  badge?: string;
  tagline: string;
  description: string;
  highlighted?: boolean;
  features: {
    name: string;
    included: boolean;
    note?: string;
  }[];
  ctaText: string;
}

export type UserRole = 'admin' | 'coach' | 'driver';

export interface SquareConfig {
  applicationId: string;
  locationId: string;
  environment: 'sandbox' | 'production';
  starterCheckoutUrl?: string;
  proCheckoutUrl?: string;
  fleetDepositUrl?: string;
}

export interface SquareTransaction {
  id: string;
  driverId: string;
  driverName: string;
  driverEmail: string;
  planId: 'starter' | 'pro' | 'fleet';
  planName: string;
  amount: number;
  currency: 'USD';
  paymentMethod: 'square_card' | 'square_cashapp' | 'square_applepay' | 'square_googlepay' | 'square_link';
  squarePaymentId: string;
  squareOrderId?: string;
  cardBrand?: string;
  last4?: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  timestamp: string;
  receiptUrl?: string;
}

export interface FleetQuoteInquiry {
  id: string;
  companyName: string;
  contactName: string;
  title?: string;
  email: string;
  phone: string;
  fleetSize: '5-25 Trucks' | '26-100 Trucks' | '101-500 Trucks' | '500+ Trucks' | string;
  primaryGoal: 'DOT Physical Pass Rate' | 'Driver Retention & Health' | 'Work Comp & Sprain Prevention' | 'General Fleet Wellness' | string;
  notes?: string;
  submittedAt: string;
  status: 'received' | 'in-review' | 'contacted' | 'proposal_sent' | 'active_fleet' | 'archived';
  adminNotes?: string;
  quotedDiscountRate?: string;
}

export interface DriverAccount {
  id: string;
  email: string;
  passwordHash?: string;
  name: string;
  callsign?: string;
  carrier?: string;
  role?: UserRole;
  createdAt: string;
  totalWorkoutsCompleted: number;
  membershipTier?: MembershipTier;
  trialStartDate?: string;
  trialExpiresDate?: string;
  subscriptionRenewsDate?: string;
}

// ==========================================
// COACH AJ 1-ON-1 COACHING & CUSTOM PLANS
// ==========================================
export interface CustomWorkoutPlan {
  id: string;
  driverId: string;
  driverName?: string;
  driverEmail?: string;
  planTitle: string;
  planDescription: string;
  assignedBy: string; // e.g. "Coach AJ Risner"
  coachEmail?: string;
  assignedDate: string; // ISO date
  updatedDate?: string;
  status: 'active' | 'archived' | 'draft';
  targetDaysPerWeek: number;
  totalWeeks?: number;
  customDirectives: string[]; // specific directives from AJ (e.g., "Do Day 1 before your 11h driving block")
  equipmentNeeded: string[];
  trainingDays: TrainingDay[];
}

export interface CoachingEnrollment {
  id: string; // matches driverId
  driverId: string;
  driverName: string;
  driverEmail: string;
  callsign?: string;
  carrier?: string;
  enrolledAt: string;
  status: 'enrolled' | 'plan-active' | 'completed' | 'paused';
  rigType: string;
  gearAvailable: string;
  shiftSchedule: string;
  painPointsOrInjuries: string;
  primaryGoals: string;
  coachNotes?: string;
  lastUpdated: string;
  hasCustomPlan?: boolean;
  activePlanId?: string;
}

// ==========================================
// 1. CAB-GALLEY NUTRITION & TRUCK STOP TYPES
// ==========================================
export type FuelGrade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'D' | 'F';

export interface TruckStopChain {
  id: string;
  name: string;
  tagline: string;
  overallHealthGrade: FuelGrade;
  logoColor: string;
  greenLightWins: {
    item: string;
    category: 'Protein Vault' | 'Produce & Fresh' | 'Hydration & Electrolytes' | 'Quick Fuel';
    macros: string; // e.g., "24g Pro • 8g Carb • 4g Fat"
    proTip: string;
  }[];
  yellowLightCautious: {
    item: string;
    caveat: string;
  }[];
  redLightTraps: {
    item: string;
    hazard: string;
  }[];
  ajVerdict: string;
}

export interface CabRecipe {
  id: string;
  title: string;
  subtitle: string;
  appliance: '12V RoadPro Skillet / Lunchbox' | 'Truck Inverter Microwave' | 'Mini Slow Cooker / Air Fryer' | 'No-Cook 12V Cooler';
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  shelfLifeBunk: string;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  calories: number;
  sodiumMg: number;
  ingredients: string[];
  instructions: string[];
  ajCoachingCue: string;
}

// ==========================================
// 2. DOCK DOOR DRILLS (MICRO-WORKOUTS)
// ==========================================
export interface DockDrill {
  id: string;
  title: string;
  locationContext: 'Beside Trailer / Dock Bay' | '100% In-Cab / Sleeper Berth' | 'Cab Step & ICC Bumper';
  durationMinutes: number;
  focus: string;
  intensity: 'High Cadence' | 'Active Mobility & Decompression' | 'Power & Grip';
  description: string;
  exercises: {
    name: string;
    workSec: number;
    restSec: number;
    rigAnchor: string;
    cue: string;
  }[];
}

// ==========================================
// 3. HOS RECOVERY TRACKER TYPES
// ==========================================
export interface HosRecoveryState {
  sleepHours: number; // 0-12
  deepSleepPercent?: number; // optional
  remSleepPercent?: number; // optional
  vibrationDisruption: 'Quiet Lot' | 'Engine APU Vibration' | 'Reefer Unit Neighbor (-15%)' | 'Highway Shoulder Noise (-25%)';
  perceivedFatigue: number; // 1 (fresh) to 5 (exhausted)
  hydrationStatus: 'Optimal (Clear/Pale Straw)' | 'Moderate (Amber)' | 'Low / Road Dehydrated';
  mobilityStiffness: 'Loose / Supple' | 'Moderate Lumbar Tightness' | 'High Stiffness / Highway Hypnosis';
  driveHoursRemaining: number; // out of 11h
  shiftHoursRemaining: number; // out of 14h
  cycleHoursLogged: number; // out of 70h
  breakHoursRemaining?: number; // out of 8h (time until mandatory 30-min break)
  berthHoursCompleted?: number; // 0-10+ hours towards full 10-hour reset
  currentDutyStatus?: 'Driving' | 'On Duty (Not Driving)' | 'Sleeper Berth' | 'Off Duty';
}

// ==========================================
// 4. HYDRATION STRATEGY TYPES
// ==========================================
export interface HydrationPlan {
  driveLegHours: number;
  ambientTempF: number;
  driverWeightLbs: number;
  caffeineIntakeDoses: number; // coffees/energy drinks
  totalTargetOz: number;
  electrolytePacketsNeeded: number;
  scheduleMilestones: {
    timing: string;
    amountOz: number;
    action: string;
    criticalNote?: string;
  }[];
}
