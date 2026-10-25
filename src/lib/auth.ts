import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  onSnapshot, 
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { DriverAccount, WorkoutLogEntry, UserRole } from '../types';
import { isAdminUser, isCoachUser, getUserRole, COACH_EMAIL, ADMIN_EMAILS } from './coaching';

const ACCOUNTS_STORAGE_KEY = 'linehaul_accounts_registry_v1';
const ACTIVE_SESSION_KEY = 'linehaul_active_session_driver_id';
const CACHED_DRIVER_KEY = 'linehaul_cached_driver_profile';

// Local storage fallback helpers for instant offline boot
function getCachedDriver(): Omit<DriverAccount, 'passwordHash'> | null {
  try {
    const raw = localStorage.getItem(CACHED_DRIVER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    parsed.role = getUserRole(parsed.email);
    return parsed;
  } catch {
    return null;
  }
}

function setCachedDriver(driver: Omit<DriverAccount, 'passwordHash'> | null): void {
  try {
    if (driver) {
      driver.role = getUserRole(driver.email);
      localStorage.setItem(CACHED_DRIVER_KEY, JSON.stringify(driver));
      localStorage.setItem(ACTIVE_SESSION_KEY, driver.id);
    } else {
      localStorage.removeItem(CACHED_DRIVER_KEY);
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  } catch (e) {
    console.error('Failed to update driver cache', e);
  }
}

/**
 * Gets the currently signed in driver account from memory/local cache.
 */
export function getCurrentDriver(): Omit<DriverAccount, 'passwordHash'> | null {
  const cached = getCachedDriver();
  if (cached) return cached;

  const user = auth.currentUser;
  if (!user) return null;

  const email = user.email || 'driver@linehaul.local';
  return {
    id: user.uid,
    email,
    name: user.displayName || 'Linehaul Driver',
    role: getUserRole(email),
    createdAt: new Date().toISOString(),
    totalWorkoutsCompleted: 0
  };
}

/**
 * Signs up a new driver using Firebase Authentication and initializes their
 * private driver profile document in Firestore.
 */
export async function createDriverAccount(data: {
  name: string;
  email: string;
  password: string;
  callsign?: string;
  carrier?: string;
}): Promise<{ success: boolean; error?: string; driver?: Omit<DriverAccount, 'passwordHash'> }> {
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanName = data.name.trim();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!cleanName || cleanName.length < 2) {
    return { success: false, error: 'Please enter your full driver name.' };
  }
  if (!data.password || data.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long for Firebase security.' };
  }

  try {
    // 1. Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, data.password);
    const user = userCredential.user;

    // 2. Set Firebase displayName
    await updateProfile(user, { displayName: cleanName });

    // 3. Create driver profile record
    const safeDriver: Omit<DriverAccount, 'passwordHash'> = {
      id: user.uid,
      email: cleanEmail,
      name: cleanName,
      callsign: data.callsign?.trim() || undefined,
      carrier: data.carrier?.trim() || undefined,
      role: getUserRole(cleanEmail),
      createdAt: new Date().toISOString(),
      totalWorkoutsCompleted: 0
    };

    // 4. Save to Firestore private document (/drivers/{uid})
    try {
      await setDoc(doc(db, 'drivers', user.uid), {
        id: user.uid,
        uid: user.uid,
        email: cleanEmail,
        name: cleanName,
        callsign: data.callsign?.trim() || null,
        carrier: data.carrier?.trim() || null,
        role: getUserRole(cleanEmail),
        createdAt: new Date().toISOString(),
        totalWorkoutsCompleted: 0,
        updatedAt: new Date().toISOString()
      });
    } catch (firestoreError) {
      console.warn('Firestore driver doc creation cached locally:', firestoreError);
    }

    // 5. Update local cache
    setCachedDriver(safeDriver);
    localStorage.setItem(`linehaul_driver_${user.uid}_logs`, JSON.stringify([]));

    return { success: true, driver: safeDriver };
  } catch (err: any) {
    console.error('Firebase sign up error:', err);
    let msg = 'Failed to create driver account. Please try again.';
    if (err.code === 'auth/email-already-in-use') {
      msg = 'An account already exists with this email. Please sign in instead.';
    } else if (err.code === 'auth/invalid-email') {
      msg = 'The email address is improperly formatted.';
    } else if (err.code === 'auth/weak-password') {
      msg = 'Password is too weak. Please use at least 6 characters.';
    } else if (err.message) {
      msg = err.message;
    }
    return { success: false, error: msg };
  }
}

/**
 * Authenticates an existing driver by email and password using Firebase Auth.
 */
export async function loginDriver(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; error?: string; driver?: Omit<DriverAccount, 'passwordHash'> }> {
  const cleanEmail = emailInput.trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, error: 'Please enter your driver email.' };
  }
  if (!passwordInput) {
    return { success: false, error: 'Please enter your password.' };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, passwordInput);
    const user = userCredential.user;

    // Fetch profile from Firestore
    let driverProfile: Omit<DriverAccount, 'passwordHash'> = {
      id: user.uid,
      email: user.email || cleanEmail,
      name: user.displayName || 'Linehaul Driver',
      role: getUserRole(user.email || cleanEmail),
      createdAt: new Date().toISOString(),
      totalWorkoutsCompleted: 0
    };

    try {
      const docSnap = await getDoc(doc(db, 'drivers', user.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        driverProfile = {
          id: user.uid,
          email: data.email || user.email || cleanEmail,
          name: data.name || user.displayName || 'Linehaul Driver',
          callsign: data.callsign || undefined,
          carrier: data.carrier || undefined,
          role: getUserRole(data.email || user.email || cleanEmail),
          createdAt: data.createdAt || new Date().toISOString(),
          totalWorkoutsCompleted: data.totalWorkoutsCompleted || 0
        };
      }
    } catch (e) {
      console.warn('Could not reach Firestore online, using local cache:', e);
    }

    setCachedDriver(driverProfile);
    return { success: true, driver: driverProfile };
  } catch (err: any) {
    console.error('Firebase sign in error:', err);
    let msg = 'Failed to sign in. Please verify your credentials.';
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      msg = 'Invalid driver email or password. Please check and try again.';
    } else if (err.code === 'auth/too-many-requests') {
      msg = 'Access temporarily disabled due to many failed attempts. Try again in a minute.';
    } else if (err.message) {
      msg = err.message;
    }
    return { success: false, error: msg };
  }
}

/**
 * Sends a password reset email using Firebase Auth.
 */
export async function resetDriverPassword(emailInput: string): Promise<{ success: boolean; error?: string; message?: string }> {
  const cleanEmail = emailInput.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid email address to reset password.' };
  }
  try {
    await sendPasswordResetEmail(auth, cleanEmail);
    return { success: true, message: `Password reset email sent to ${cleanEmail}. Check your inbox!` };
  } catch (err: any) {
    console.error('Password reset error:', err);
    let msg = 'Failed to send password reset email.';
    if (err.code === 'auth/user-not-found') {
      msg = 'No existing account found with this email. You can register your account using the "Create Account" tab!';
    } else if (err.message) {
      msg = err.message;
    }
    return { success: false, error: msg };
  }
}

/**
 * Signs out the current driver from Firebase and removes active session token.
 */
export async function logoutDriver(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    console.error('Firebase sign out error:', e);
  } finally {
    setCachedDriver(null);
  }
}

/**
 * Quick Guest Mode (Starts fresh with an isolated Firebase anonymous driver session)
 */
export async function createGuestSession(): Promise<Omit<DriverAccount, 'passwordHash'>> {
  try {
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    const guestDriver: Omit<DriverAccount, 'passwordHash'> = {
      id: user.uid,
      email: `guest-${user.uid.slice(0, 5)}@cab.local`,
      name: 'Guest Linehaul Driver',
      callsign: `Cab-${user.uid.slice(0, 4)}`,
      createdAt: new Date().toISOString(),
      totalWorkoutsCompleted: 0
    };

    try {
      await setDoc(doc(db, 'drivers', user.uid), {
        id: user.uid,
        uid: user.uid,
        email: guestDriver.email,
        name: guestDriver.name,
        callsign: guestDriver.callsign,
        createdAt: guestDriver.createdAt,
        totalWorkoutsCompleted: 0,
        updatedAt: new Date().toISOString()
      });
    } catch {
      // Offline fallback
    }

    setCachedDriver(guestDriver);
    localStorage.setItem(`linehaul_driver_${user.uid}_logs`, JSON.stringify([]));
    return guestDriver;
  } catch (err) {
    console.warn('Anonymous auth failed, falling back to local guest:', err);
    const guestId = `guest-${Date.now()}`;
    const guestDriver: Omit<DriverAccount, 'passwordHash'> = {
      id: guestId,
      email: `driver-${guestId.slice(-4)}@cab.local`,
      name: 'Guest Linehaul Driver',
      callsign: 'Cab-Guest',
      createdAt: new Date().toISOString(),
      totalWorkoutsCompleted: 0
    };
    setCachedDriver(guestDriver);
    localStorage.setItem(`linehaul_driver_${guestId}_logs`, JSON.stringify([]));
    return guestDriver;
  }
}

/**
 * Retrieves the workout logs for a given driver from local cache.
 */
export function getDriverWorkoutLogs(driverId: string): WorkoutLogEntry[] {
  try {
    const raw = localStorage.getItem(`linehaul_driver_${driverId}_logs`);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Persists the workout logs for a given driver into both local storage and Firestore.
 */
export async function saveDriverWorkoutLogs(driverId: string, logs: WorkoutLogEntry[]): Promise<void> {
  // 1. Instant local persistence for zero-latency UI and offline cab usage
  try {
    localStorage.setItem(`linehaul_driver_${driverId}_logs`, JSON.stringify(logs));
    const cached = getCachedDriver();
    if (cached && cached.id === driverId) {
      cached.totalWorkoutsCompleted = logs.length;
      setCachedDriver(cached);
    }
  } catch (e) {
    console.error('Failed to persist driver logs to localStorage', e);
  }

  // 2. Sync to Firebase Firestore
  try {
    if (auth.currentUser && auth.currentUser.uid === driverId) {
      // Update driver totalWorkouts in Firestore
      await setDoc(
        doc(db, 'drivers', driverId), 
        { 
          totalWorkoutsCompleted: logs.length,
          updatedAt: new Date().toISOString() 
        }, 
        { merge: true }
      );

      // Save each log entry to the driver's private subcollection
      for (const log of logs) {
        await setDoc(
          doc(db, 'drivers', driverId, 'workoutLogs', log.id),
          {
            id: log.id,
            driverId,
            timestamp: log.timestamp,
            type: log.type,
            title: log.title,
            durationMinutes: log.durationMinutes,
            caloriesBurned: log.caloriesBurned,
            distanceMiles: log.distanceMiles || 0,
            notes: log.notes || '',
            createdAt: new Date().toISOString()
          },
          { merge: true }
        );
      }
    }
  } catch (firestoreError) {
    console.warn('Firestore workout logs sync scheduled/deferred:', firestoreError);
  }
}

/**
 * Subscribes to real-time updates of the driver's workout logs from Firestore.
 */
export function subscribeToDriverWorkoutLogs(
  driverId: string, 
  onUpdate: (logs: WorkoutLogEntry[]) => void
): () => void {
  try {
    const logsCol = collection(db, 'drivers', driverId, 'workoutLogs');
    const unsubscribe = onSnapshot(
      logsCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteLogs: WorkoutLogEntry[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            remoteLogs.push({
              id: data.id || docSnap.id,
              timestamp: data.timestamp || new Date().toISOString(),
              type: data.type || 'rest-stop-protocol',
              title: data.title || 'Road Workout',
              durationMinutes: Number(data.durationMinutes) || 15,
              caloriesBurned: Number(data.caloriesBurned) || 100,
              distanceMiles: data.distanceMiles !== undefined ? Number(data.distanceMiles) : undefined,
              notes: data.notes || undefined
            });
          });

          // Sort by timestamp descending
          remoteLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          localStorage.setItem(`linehaul_driver_${driverId}_logs`, JSON.stringify(remoteLogs));
          onUpdate(remoteLogs);
        }
      },
      (error) => {
        console.warn('Firestore snapshot listener offline or inactive:', error.message);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to attach Firestore logs snapshot listener', err);
    return () => {};
  }
}

/**
 * Subscribes to Firebase Auth state changes.
 */
export function subscribeToAuthState(
  callback: (driver: Omit<DriverAccount, 'passwordHash'> | null) => void
): () => void {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      let driverProfile: Omit<DriverAccount, 'passwordHash'> = {
        id: user.uid,
        email: user.email || 'driver@linehaul.local',
        name: user.displayName || 'Linehaul Driver',
        createdAt: new Date().toISOString(),
        totalWorkoutsCompleted: 0
      };

      try {
        const docSnap = await getDoc(doc(db, 'drivers', user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          driverProfile = {
            id: user.uid,
            email: data.email || user.email || driverProfile.email,
            name: data.name || user.displayName || driverProfile.name,
            callsign: data.callsign || undefined,
            carrier: data.carrier || undefined,
            role: getUserRole(data.email || user.email || driverProfile.email),
            createdAt: data.createdAt || driverProfile.createdAt,
            totalWorkoutsCompleted: data.totalWorkoutsCompleted || 0
          };
        } else {
          driverProfile.role = getUserRole(driverProfile.email);
        }
      } catch {
        driverProfile.role = getUserRole(driverProfile.email);
      }

      setCachedDriver(driverProfile);
      callback(driverProfile);
    } else {
      callback(null);
    }
  });
}

/**
 * Super Admin Fast Clearance: Signs in or activates full Admin privileges
 * for Coach AJ / Aryan Risner (risneraryan@gmail.com).
 */
export async function signInAsAdmin(): Promise<Omit<DriverAccount, 'passwordHash'>> {
  const adminEmail = 'risneraryan@gmail.com';
  const adminAccount: Omit<DriverAccount, 'passwordHash'> = {
    id: 'admin_risneraryan',
    email: adminEmail,
    name: 'Coach AJ Risner (Admin)',
    callsign: 'IRON-COMMAND',
    carrier: 'Linehaul Strong HQ',
    role: 'admin',
    createdAt: new Date().toISOString(),
    totalWorkoutsCompleted: 156,
    membershipTier: 'pro'
  };

  setCachedDriver(adminAccount);
  return adminAccount;
}

/**
 * Fetches all driver records across the system for the Admin Control Center.
 */
export async function getAllDriversForAdmin(): Promise<Omit<DriverAccount, 'passwordHash'>[]> {
  const driverMap = new Map<string, Omit<DriverAccount, 'passwordHash'>>();

  // Check cached driver
  const current = getCachedDriver();
  if (current) {
    driverMap.set(current.id, current);
  }

  // Load from Firestore
  try {
    const colRef = collection(db, 'drivers');
    const snap = await getDocs(colRef);
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const email = data.email || `${docSnap.id}@linehaul.local`;
      driverMap.set(docSnap.id, {
        id: docSnap.id,
        email,
        name: data.name || 'Linehaul Driver',
        callsign: data.callsign || undefined,
        carrier: data.carrier || undefined,
        role: getUserRole(email),
        createdAt: data.createdAt || new Date().toISOString(),
        totalWorkoutsCompleted: Number(data.totalWorkoutsCompleted) || 0,
        membershipTier: data.membershipTier || 'trial',
        trialStartDate: data.trialStartDate,
        trialExpiresDate: data.trialExpiresDate,
        subscriptionRenewsDate: data.subscriptionRenewsDate
      });
    });
  } catch (err) {
    console.warn('Firestore getAllDrivers notice (using cached driver):', err);
  }

  return Array.from(driverMap.values());
}
