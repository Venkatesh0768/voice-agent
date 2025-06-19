import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, UserRole } from '../src/types/types';
import { saveAuthSession, getAuthSession, clearAuthSession } from '../services/localStorageService';
import { signUp as firebaseSignUp, signIn as firebaseSignIn, signOutUser as firebaseSignOut } from '../src/services/firebaseService';

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

// In-memory store for simulation - REMOVE THIS ONCE FIREBASE IS USED
// let inMemoryUsers: User[] = [
//   {
//     id: 'admin-default',
//     name: 'Admin User',
//     email: 'admin@admin',
//     password: 'admin123',
//     role: UserRole.ADMIN,
//   }
// ];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true to check session

  useEffect(() => {
    const session = getAuthSession();
    console.log("Session user from localStorage in AuthContext useEffect:", session.user);
    if (session.user && session.token) {
      setCurrentUser(session.user);
      setToken(session.token);
    }
    setIsLoading(false);
  }, []);

  const generateToken = (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const user = await firebaseSignIn(email, pass);
      if (user) {
        const newToken = generateToken();
        setCurrentUser(user);
        setToken(newToken);
        saveAuthSession(user, newToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error during login:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsAdmin = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const user = await firebaseSignIn(email, pass);
      if (user && user.role === UserRole.ADMIN) {
        const newToken = generateToken();
        setCurrentUser(user);
        setToken(newToken);
        saveAuthSession(user, newToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error during admin login:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, pass: string, role: UserRole = UserRole.PATIENT): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newUser = await firebaseSignUp(email, pass, role, name);
      if (newUser) {
        const signedInUser = await firebaseSignIn(email, pass);
        if(signedInUser) {
          const newToken = generateToken();
          setCurrentUser(signedInUser);
          setToken(newToken);
          saveAuthSession(signedInUser, newToken);
          return true;
        }
        return false;
      }
      return false;
    } catch (error) {
      console.error("Error during signup:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    firebaseSignOut(); // Call Firebase signOut
    setCurrentUser(null);
    setToken(null);
    clearAuthSession();
  };

  // Helper functions for role-based access
  const isAdmin = (): boolean => {
    return currentUser?.role === UserRole.ADMIN;
  };

  const isUser = (): boolean => {
    return currentUser?.role === UserRole.PATIENT;
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      token, 
      isLoading, 
      login, 
      loginAsAdmin,
      signup, 
      logout,
      isAdmin,
      isUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
