"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">My Profile</h1>
     

      <p>{user.displayName}</p>
      <p className="text-gray-500">{user.email}</p>
    </div>
  );
}
