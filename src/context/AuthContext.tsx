import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  db,
  signInWithGoogle,
  signOutUser,
  FirebaseUserProfile,
  getCachedAccessToken,
  setCachedAccessToken,
  isAuthCancelledError,
} from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: FirebaseUserProfile | null;
  loading: boolean;
  role: UserRole;
  accessToken: string | null;
  getAccessToken: () => Promise<string | null>;
  requireGoogleAuth: () => Promise<string>;
  setRole: (role: UserRole) => Promise<void>;
  loginWithGoogle: () => Promise<{ user: User; accessToken: string | null }>;
  logout: () => Promise<void>;
  isStaffAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<FirebaseUserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [accessToken, setAccessTokenState] = useState<string | null>(getCachedAccessToken());
  const [currentRole, setCurrentRole] = useState<UserRole>('General Manager');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setAccessTokenState(getCachedAccessToken());
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data() as FirebaseUserProfile;
            setUserProfile(data);
            if (data.role) {
              setCurrentRole(data.role);
            }
          } else {
            const initialProfile: FirebaseUserProfile = {
              id: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Hotel Executive',
              photoURL: currentUser.photoURL || '',
              role: 'General Manager',
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
            };
            await setDoc(userRef, initialProfile);
            setUserProfile(initialProfile);
            setCurrentRole('General Manager');
          }
        } catch (err) {
          console.warn('Error fetching user profile:', err);
        }
      } else {
        setUserProfile(null);
        setCachedAccessToken(null);
        setAccessTokenState(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setRole = async (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { role: newRole }, { merge: true });
        setUserProfile((prev) => (prev ? { ...prev, role: newRole } : null));
      } catch (err) {
        console.warn('Error updating user role:', err);
      }
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    return getCachedAccessToken();
  };

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithGoogle();
      if (res.accessToken) {
        setAccessTokenState(res.accessToken);
      }
      return res;
    } catch (err: any) {
      if (!isAuthCancelledError(err)) {
        console.error('Login failed:', err);
      }
      throw err;
    }
  };

  const requireGoogleAuth = async (): Promise<string> => {
    const existing = getCachedAccessToken();
    if (existing) {
      return existing;
    }
    const res = await loginWithGoogle();
    if (!res.accessToken) {
      throw new Error('Could not obtain Google Workspace authorization token.');
    }
    return res.accessToken;
  };

  const logout = async () => {
    try {
      await signOutUser();
      setAccessTokenState(null);
    } catch (err) {
      console.error('Logout failed:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        role: currentRole,
        accessToken,
        getAccessToken,
        requireGoogleAuth,
        setRole,
        loginWithGoogle,
        logout,
        isStaffAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
