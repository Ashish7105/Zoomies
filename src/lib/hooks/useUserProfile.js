"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * Fetch user profile from Firestore users/{uid}. Used for admin check (profile.role === 'admin').
 * @param {string | null} uid - Firebase Auth user uid
 * @returns {{ profile: { role?: string, [key: string]: any } | null, isLoading: boolean }}
 */
export function useUserProfile(uid) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(!!uid);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    getDoc(doc(db, "users", uid))
      .then((snap) => {
        if (cancelled) return;
        setProfile(snap.exists() ? snap.data() : null);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [uid]);

  return { profile, isLoading };
}
