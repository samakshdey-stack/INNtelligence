import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  getDocFromServer,
  collection,
  addDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserRole } from '../types';

// 1. Initialize Firebase App
const app = initializeApp(firebaseConfig);

// 2. Initialize Firestore
export const db = getFirestore(app);

// 3. Initialize Firebase Auth
export const auth = getAuth(app);

// 4. Google Auth Provider with Workspace Scopes
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/documents.readonly',
];

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});
WORKSPACE_SCOPES.forEach((scope) => {
  googleProvider.addScope(scope);
});

// In-Memory Access Token Cache (Strictly in memory - not localStorage)
let cachedAccessToken: string | null = null;

export function getCachedAccessToken(): string | null {
  return cachedAccessToken;
}

export function setCachedAccessToken(token: string | null): void {
  cachedAccessToken = token;
}

// Operation Types for Error Handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 5. Test Connection at Startup (CRITICAL Constraint)
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Please check your Firebase configuration or network connection.');
    }
  }
}

// Run connection test
testConnection();

export interface FirebaseUserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
}

export function isAuthCancelledError(error: any): boolean {
  if (!error) return false;
  const code = error?.code || '';
  const message = error?.message || '';
  return (
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request' ||
    code === 'auth/user-cancelled' ||
    message.includes('auth/popup-closed-by-user') ||
    message.includes('auth/cancelled-popup-request') ||
    message.includes('auth/user-cancelled')
  );
}

export function formatAuthErrorMessage(error: any): string {
  if (isAuthCancelledError(error)) {
    return 'Sign-in was cancelled before completion.';
  }
  if (error?.code === 'auth/popup-blocked') {
    return 'Sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
  }
  if (error?.code === 'auth/network-request-failed') {
    return 'Network connection error. Please check your internet connection and try again.';
  }
  if (error?.code === 'auth/unauthorized-domain') {
    return 'This domain is not authorized in Firebase Auth. Please verify configuration.';
  }
  return error?.message || 'Authentication could not be completed. Please try again.';
}

// 6. Auth Helpers
export async function signInWithGoogle(): Promise<{ user: User; accessToken: string | null }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken || null;
    if (accessToken) {
      setCachedAccessToken(accessToken);
    }

    // Check / Sync User Profile Document
    if (user && user.uid) {
      const userRef = doc(db, 'users', user.uid);
      try {
        const userDoc = await getDoc(userRef);
        const now = new Date().toISOString();
        if (!userDoc.exists()) {
          const newProfile: FirebaseUserProfile = {
            id: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Staff Member',
            photoURL: user.photoURL || '',
            role: 'General Manager', // Default Executive role for authorized manager
            createdAt: now,
            lastLogin: now,
          };
          await setDoc(userRef, newProfile);
        } else {
          await setDoc(userRef, { lastLogin: now }, { merge: true });
        }
      } catch (docErr) {
        console.warn('Profile sync warning:', docErr);
      }
    }

    return { user, accessToken };
  } catch (error: any) {
    if (!isAuthCancelledError(error)) {
      console.error('Google Sign-In Error:', error);
    }
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await fbSignOut(auth);
    setCachedAccessToken(null);
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
}

export async function saveAccessRequest(data: {
  fullName: string;
  workEmail: string;
  propertyName: string;
  roomCount?: string;
}) {
  const reqPath = 'access_requests';
  const requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const payload = {
    id: requestId,
    fullName: data.fullName.trim().slice(0, 100),
    workEmail: data.workEmail.trim().slice(0, 256),
    propertyName: data.propertyName.trim().slice(0, 150),
    roomCount: (data.roomCount || '50-150 keys').slice(0, 50),
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, reqPath, requestId);
    await setDoc(docRef, payload);
    return { success: true, id: requestId };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${reqPath}/${requestId}`);
  }
}
