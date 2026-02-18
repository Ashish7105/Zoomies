"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function useUserDoc(uid) {
  const [userDoc, setUserDoc] = useState(null);

  useEffect(() => {
    if (!uid) {
      setUserDoc(null);
      return;
    }

    const ref = doc(db, "users", uid);
    const unsub = onSnapshot(ref, (snap) => {
      setUserDoc(snap.exists() ? snap.data() : null);
    });

    return () => unsub();
  }, [uid]);

  return userDoc;
}
