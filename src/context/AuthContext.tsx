import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { auth, googleProvider, db } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Keep local profile in sync with Firebase user for UI that reads local profile
  useEffect(() => {
    if (user) {
      try {
        const existingRaw = localStorage.getItem('of_profile');
        const existing = existingRaw ? JSON.parse(existingRaw) : {};
        const merged = {
          name: user.displayName || existing.name || 'OnlyFarmers User',
          email: user.email || existing.email || 'user@example.com',
          avatar: user.photoURL || existing.avatar || 'https://randomuser.me/api/portraits/men/75.jpg',
        };
        localStorage.setItem('of_profile', JSON.stringify(merged));
        // Upsert public profile for search
        setDoc(doc(db, 'users_public', user.uid), {
          uid: user.uid,
          name: merged.name,
          email: merged.email,
          avatar: merged.avatar,
          nameLower: merged.name.toLowerCase(),
          emailLower: merged.email.toLowerCase(),
          updatedAt: serverTimestamp(),
        }, { merge: true }).catch(() => {});
      } catch {}
    }
  }, [user]);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  const value = useMemo(() => ({ user, loading, signInWithGoogle, signOutUser }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};


