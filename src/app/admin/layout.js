"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useUserProfile } from "@/lib/hooks/useUserProfile";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/items", label: "Items" },
  { href: "/admin/stores", label: "Stores" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/employees", label: "Employees" },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { profile, isLoading } = useUserProfile(user?.uid || null);
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!isLoading && !isAdmin) {
      router.replace("/");
      return;
    }
  }, [user, isLoading, isAdmin, router]);

  if (!user || isLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Zoomies" width={32} height={32} />
            <span className="font-semibold text-gray-900">Admin</span>
          </Link>
        </div>
        <nav className="p-2 flex-1">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
                pathname === href
                  ? "bg-orange-100 text-orange-800"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-gray-200">
          <Link href="/" className="block px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
            ← Back to store
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
