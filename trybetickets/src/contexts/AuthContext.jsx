/**
 * Firebase Authentication Context
 * 
 * This file provides authentication state and methods for the entire app.
 * Integrated with Firebase Auth to handle:
 * - User login/logout
 * - User registration
 * - Auth state persistence
 * - User role management (user/organizer)
 * - Profile data syncing with backend
 */

'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Auth Context
const AuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async (email, password) => {},
  logout: async () => {},
  signup: async (email, password, userData) => {},
});

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        try {
          const idToken = await firebaseUser.getIdToken();
          
          // Fetch user data from backend
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser({
              ...userData.data,
              firebaseUser,
            });
          } else {
            // If backend doesn't have user, set basic Firebase data
            setUser({
              email: firebaseUser.email,
              uid: firebaseUser.uid,
              firebaseUser,
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Set basic Firebase data on error
          setUser({
            email: firebaseUser.email,
            uid: firebaseUser.uid,
            firebaseUser,
          });
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Login with Firebase
  const login = async (email, password) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();
      
      // Sync with backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          firebaseUid: credential.user.uid,
          email: credential.user.email,
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync with backend');
      }
      
      const userData = await response.json();
      setUser({
        ...userData.data,
        firebaseUser: credential.user,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Signup with Firebase
  const signup = async (email, password, userData) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();
      
      // Create user in backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          firebaseUid: credential.user.uid,
          email: credential.user.email,
          name: userData.name,
          phone: userData.phone,
          role: userData.accountType || 'user',
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create user in backend');
      }
      
      const newUser = await response.json();
      setUser({
        ...newUser.data,
        firebaseUser: credential.user,
      });
      
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Logout from Firebase
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    signup,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
