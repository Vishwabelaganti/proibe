import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { resolveApiKey } from '../utils/ai/apiKeyManager';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Helper function to find user by username or email
  const findUserByUsernameOrEmail = async (identifier) => {
    try {
      // First, try to find by username
      const usernameQuery = query(
        collection(db, 'users'),
        where('username', '==', identifier.toLowerCase())
      );
      const usernameSnapshot = await getDocs(usernameQuery);
      
      if (!usernameSnapshot.empty) {
        const userData = usernameSnapshot.docs[0].data();
        return userData.email;
      }
      
      // If not found by username, assume it's an email
      return identifier;
    } catch (error) {
      console.error('Error finding user:', error);
      return identifier; // fallback to treating as email
    }
  };

  // Login function
  const login = async (identifier, password) => {
    const email = await findUserByUsernameOrEmail(identifier);
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Signup function
  const signup = async (email, password, username) => {
    // Check if username already exists
    const usernameQuery = query(
      collection(db, 'users'),
      where('username', '==', username.toLowerCase())
    );
    const usernameSnapshot = await getDocs(usernameQuery);
    
    if (!usernameSnapshot.empty) {
      throw new Error('Username already exists');
    }

    // Create user account
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    await updateProfile(user, {
      displayName: username
    });

    // Store user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: email,
      username: username.toLowerCase(),
      displayName: username,
      createdAt: new Date(),
      authProvider: 'email'
    });

    return user;
  };

  // Google sign in
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);
    
    // Check if user profile exists, if not create one
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      // Generate username from email or display name
      const baseUsername = user.displayName?.toLowerCase().replace(/\s+/g, '') || 
                          user.email.split('@')[0].toLowerCase();
      
      let username = baseUsername;
      let counter = 1;
      
      // Make sure username is unique
      while (true) {
        const usernameQuery = query(
          collection(db, 'users'),
          where('username', '==', username)
        );
        const usernameSnapshot = await getDocs(usernameQuery);
        
        if (usernameSnapshot.empty) break;
        username = `${baseUsername}${counter}`;
        counter++;
      }

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        username: username,
        displayName: user.displayName || username,
        photoURL: user.photoURL,
        createdAt: new Date(),
        authProvider: 'google'
      });
    }

    return user;
  };

  // Logout function
  const logout = () => {
    return signOut(auth);
  };

  // Load user profile
  const loadUserProfile = async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
    } else {
      setUserProfile(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      await loadUserProfile(user);
      if (user) {
        resolveApiKey().catch(() => {});
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    login,
    signup,
    signInWithGoogle,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
