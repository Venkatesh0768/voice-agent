import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../src/types/types';
import { auth } from '../config/firebase';
import { signIn, signUp, signOutUser, fetchUserData } from '../services/firebaseService';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
  isUser: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await fetchUserData(firebaseUser.uid);
          if (userData) {
            setCurrentUser(userData);
            console.log("AuthContext: currentUser after fetching user data:", userData);
          } else {
            console.warn('User data not found in Firestore for UID:', firebaseUser.uid);
            setCurrentUser(null);
            console.log("AuthContext: currentUser set to null due to no user data:", null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError('Failed to load user data');
          setCurrentUser(null);
          console.log("AuthContext: currentUser set to null due to fetch error:", null);
        }
      } else {
        setCurrentUser(null);
        console.log("AuthContext: currentUser set to null on auth state change (no firebaseUser):");
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      setError(null);
      const user = await signIn(email, password);
      setCurrentUser(user);
      console.log("AuthContext: currentUser after signIn:", user);
    } catch (error) {
      console.error('Error signing in:', error);
      setError('Failed to sign in');
      throw error;
    }
  };

  const handleSignUp = async (email: string, password: string, role: string) => {
    try {
      setError(null);
      const user = await signUp(email, password, role as any);
      setCurrentUser(user);
      console.log("AuthContext: currentUser after signUp:", user);
    } catch (error) {
      console.error('Error signing up:', error);
      setError('Failed to sign up');
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      setError(null);
      await signOutUser();
      setCurrentUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out');
      throw error;
    }
  };

  const isAdmin = useCallback(() => {
    return currentUser?.role === UserRole.ADMIN;
  }, [currentUser]);

  const isUser = useCallback(() => {
    return currentUser?.role === UserRole.PATIENT;
  }, [currentUser]);

  const value = {
    currentUser,
    loading,
    error,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    isAdmin,
    isUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 