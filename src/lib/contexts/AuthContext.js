"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";

import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Google Sign-In (SAFE)
  const handleSignInWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      setUser(result.user);

    } catch (err) {

      // ✅ Ignore popup closed error (VERY IMPORTANT)
      if (err.code === "auth/popup-closed-by-user") {
        console.log("User closed Google popup");
        return;
      }

      console.error("Google Sign-In Error:", err);
      setError("Login failed. Please try again.");

    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Logout (CLEAN)
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await signOut(auth);
      setUser(null);

    } catch (err) {
      console.error("Logout Error:", err);
      setError("Logout failed");

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        handleSignInWithGoogle,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Custom Hook
export const useAuth = () => useContext(AuthContext);
