import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  getDocFromServer
} from 'firebase/firestore';
import { AnalysisResult, UserProfile } from '../types';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Configuration
const firebaseConfig = {
  projectId: firebaseConfigJson.projectId || "strategic-chess-tggh3",
  appId: firebaseConfigJson.appId || "1:65701736322:web:88b9e78c4947feec12699b",
  apiKey: firebaseConfigJson.apiKey || "AIzaSyBTNREeOnJdY3gpVwYBrfhmIB_8QZyMVEQ",
  authDomain: firebaseConfigJson.authDomain || "strategic-chess-tggh3.firebaseapp.com",
  firestoreDatabaseId: firebaseConfigJson.firestoreDatabaseId || "ai-studio-chatbotsitegener-3a1a8cec-681b-4013-93bb-02fc118e2464",
  storageBucket: firebaseConfigJson.storageBucket || "strategic-chess-tggh3.firebasestorage.app",
  messagingSenderId: firebaseConfigJson.messagingSenderId || "65701736322",
  measurementId: firebaseConfigJson.measurementId || ""
};

// Initialize App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Firestore
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Connection validation (safe background check)
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[SkinSight] Firestore connection confirmed.');
  } catch (error) {
    // Non-blocking: application gracefully falls back to local storage if network or credentials are unavailable
    console.debug('[SkinSight] Firestore connection status note:', error);
  }
}
testFirestoreConnection().catch(() => {});

/**
 * Checks if a user has administrator access to the Train & Evaluate panel.
 * Authorized admin if:
 * 1. user.isAdmin === true
 * 2. user.role contains 'admin' or 'clinician admin'
 * 3. email matches designated system admin (e.g., k.poornima1310@gmail.com)
 */
export function isUserAdmin(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  if (user.isAdmin === true) return true;
  if (user.role && user.role.toLowerCase().includes('admin')) return true;
  if (user.email && (
    user.email.toLowerCase() === 'k.poornima1310@gmail.com' ||
    user.email.toLowerCase().includes('admin@') ||
    user.email.toLowerCase().includes('skinsight-admin')
  )) {
    return true;
  }
  return false;
}

/**
 * Sign In with Google
 */
export async function signInWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;
  
  const isDefaultAdmin = fbUser.email?.toLowerCase() === 'k.poornima1310@gmail.com' ||
    fbUser.email?.toLowerCase().includes('admin');

  const profileData: UserProfile = {
    id: fbUser.uid,
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'SkinSight User',
    email: fbUser.email || '',
    avatarUrl: fbUser.photoURL || undefined,
    role: isDefaultAdmin ? 'Clinician Admin' : 'Dermatology Screener',
    isAdmin: isDefaultAdmin,
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    preferences: {
      theme: 'system',
      modelArchitecture: 'MobileNetV2 + PCA + XceptionNet',
      gradcamColormap: 'jet',
      emailAlerts: true,
      highRiskAlerts: true,
      compactView: false
    }
  };

  // Sync to Firestore `/users/{uid}`
  try {
    const userDocRef = doc(db, 'users', fbUser.uid);
    const existingSnap = await getDoc(userDocRef);
    if (existingSnap.exists()) {
      const existingData = existingSnap.data();
      profileData.role = existingData.role || profileData.role;
      profileData.isAdmin = existingData.isAdmin !== undefined ? existingData.isAdmin : isDefaultAdmin;
    } else {
      await setDoc(userDocRef, {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        photoURL: profileData.avatarUrl || '',
        role: profileData.role,
        isAdmin: profileData.isAdmin,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn('[SkinSight] Firestore user profile sync note:', err);
  }

  return profileData;
}

/**
 * Sign In with Email & Password
 */
export async function signInWithEmail(email: string, pass: string): Promise<UserProfile> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  const fbUser = result.user;
  const isDefaultAdmin = fbUser.email?.toLowerCase() === 'k.poornima1310@gmail.com' ||
    fbUser.email?.toLowerCase().includes('admin');

  const profileData: UserProfile = {
    id: fbUser.uid,
    name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
    email: fbUser.email || email,
    avatarUrl: fbUser.photoURL || undefined,
    role: isDefaultAdmin ? 'Clinician Admin' : 'Dermatology Screener',
    isAdmin: isDefaultAdmin,
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    preferences: {
      theme: 'system',
      modelArchitecture: 'MobileNetV2 + PCA + XceptionNet',
      gradcamColormap: 'jet',
      emailAlerts: true,
      highRiskAlerts: true,
      compactView: false
    }
  };

  return profileData;
}

/**
 * Sign Up with Email & Password
 */
export async function signUpWithEmail(email: string, pass: string, displayName: string): Promise<UserProfile> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  const fbUser = result.user;
  
  if (displayName) {
    try {
      await updateProfile(fbUser, { displayName });
    } catch {
      // ignore
    }
  }

  const isDefaultAdmin = email.toLowerCase() === 'k.poornima1310@gmail.com' || email.toLowerCase().includes('admin');

  const profileData: UserProfile = {
    id: fbUser.uid,
    name: displayName || email.split('@')[0],
    email: email,
    avatarUrl: fbUser.photoURL || undefined,
    role: isDefaultAdmin ? 'Clinician Admin' : 'Dermatology Screener',
    isAdmin: isDefaultAdmin,
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    preferences: {
      theme: 'system',
      modelArchitecture: 'MobileNetV2 + PCA + XceptionNet',
      gradcamColormap: 'jet',
      emailAlerts: true,
      highRiskAlerts: true,
      compactView: false
    }
  };

  try {
    await setDoc(doc(db, 'users', fbUser.uid), {
      id: profileData.id,
      name: profileData.name,
      email: profileData.email,
      role: profileData.role,
      isAdmin: profileData.isAdmin,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[SkinSight] Firestore user save error:', err);
  }

  return profileData;
}

/**
 * Sign Out from Firebase
 */
export async function logOutFromFirebase(): Promise<void> {
  await signOut(auth);
}

/**
 * Sync analysis record to Firestore
 */
export async function saveAnalysisToFirestore(analysis: AnalysisResult, userId?: string) {
  try {
    const docId = analysis.id;
    const docRef = doc(db, 'analyses', docId);
    await setDoc(docRef, {
      ...analysis,
      userId: userId || auth.currentUser?.uid || 'anonymous',
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    console.warn('[SkinSight] Cloud save note:', e);
  }
}

/**
 * Delete analysis from Firestore
 */
export async function deleteAnalysisFromFirestore(analysisId: string) {
  try {
    const docRef = doc(db, 'analyses', analysisId);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('[SkinSight] Cloud delete note:', e);
  }
}

/**
 * Toggle or grant Admin status for user in Firestore
 */
export async function setFirestoreUserRole(userId: string, isAdmin: boolean) {
  try {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, {
      isAdmin,
      role: isAdmin ? 'Clinician Admin' : 'Dermatology Screener'
    }, { merge: true });
  } catch (e) {
    console.warn('[SkinSight] Update role error:', e);
  }
}
