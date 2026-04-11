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

import { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const isFetchingRef = useRef(false); // Prevent duplicate simultaneous fetches

  // Initialize Firebase Auth state listener
  useEffect(() => {
    let isMounted = true;
    
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('Auth check taking too long, continuing without user');
        setLoading(false);
        setInitialCheckDone(true);
      }
    }, 3000); // 3 second timeout
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;
      
      // Clear the timeout since auth state changed
      clearTimeout(loadingTimeout);
      
      if (firebaseUser) {
        // User is signed in - fetch profile if we don't have it or if user changed
        // But prevent duplicate fetches if already fetching
        const shouldFetch = !isFetchingRef.current && (!user || user.firebaseUID !== firebaseUser.uid);
        
        if (shouldFetch) {
          isFetchingRef.current = true;
          
          try {
            const idToken = await firebaseUser.getIdToken();
            
            // Fetch user data from backend
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
              headers: {
                'Authorization': `Bearer ${idToken}`
              }
            });
            
            if (!isMounted) return;
            
            if (response.ok) {
              const userData = await response.json();
              setUser(userData.data);
            } else {
              console.error('Failed to fetch user profile');
              setUser(null);
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            if (isMounted) {
              setUser(null);
            }
          } finally {
            isFetchingRef.current = false;
          }
        }
      } else {
        // User is signed out
        setUser(null);
        isFetchingRef.current = false;
      }
      
      if (isMounted) {
        setLoading(false);
        setInitialCheckDone(true);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      isMounted = false;
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, []); // Empty deps - only run once on mount

  // Login with Firebase
  const login = async (email, password) => {
    try {
      // Sign in with Firebase
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();
      
      // Fetch user profile to get role for immediate redirect
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      let userRole = 'user'; // Default
      if (response.ok) {
        const userData = await response.json();
        userRole = userData.data?.role || 'user';
      }
      
      return { success: true, role: userRole };
    } catch (error) {
      console.error('Login error:', error);
      
      // Provide user-friendly error messages
      let message = 'Failed to sign in. Please try again.';
      if (error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later.';
      }
      
      throw new Error(message);
    }
  };

  // Signup with Firebase
  const signup = async (email, password, userData) => {
    try {
      // Create user in Firebase
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();
      
      // Sync user data with backend (creates user in MongoDB with additional info)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          firebaseUID: credential.user.uid, // Backend expects uppercase UID
          email: credential.user.email,
          name: userData.name,
          phoneNumber: userData.phone || '', // Optional
          emailVerified: credential.user.emailVerified,
          role: userData.accountType || 'user', // 'user' or 'organizer'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user in database');
      }
      
      const newUser = await response.json();
      console.log('User created in database:', newUser.data);
      
      // Return user data including role for immediate use
      return { 
        success: true, 
        user: newUser.data 
      };
    } catch (error) {
      console.error('Signup error:', error);
      
      // Provide user-friendly error messages
      let message = 'Failed to create account. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak. Use at least 6 characters.';
      } else if (error.message) {
        message = error.message;
      }
      
      throw new Error(message);
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
