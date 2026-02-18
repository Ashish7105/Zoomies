"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useEmployee } from "@/lib/contexts/EmployeeContext";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import CartButton from "@/components/cart/CartButton";

export default function CustomNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, handleLogout } = useAuth();
  const { isEmployeeLoggedIn } = useEmployee();
  const { profile } = useUserProfile(user?.uid || null);
  const isAdmin = profile?.role === "admin";

  return (
    <>
      {/* NAVBAR */}
      <nav className="w-full bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">

          {/* Logo */}
          <Link href="/pet-details">
            <Image
              src="/logo.png"
              alt="Zoomies"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
          </Link>

          {/* Book Now Button */}
          <Link
            href="/pet-details"
            className="hidden sm:block bg-orange-400 text-white px-6 py-2 rounded-full font-medium hover:bg-orange-500 transition"
          >
            Book now
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-3">

            {/* Admin link (customer user with role admin) */}
            {isAdmin && (
              <Link
                href="/admin"
                className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-200 transition"
              >
                Admin
              </Link>
            )}
            {/* Employee portal link (when not customer logged in) */}
            {!user && (
              <Link
                href={isEmployeeLoggedIn ? "/employee/dashboard" : "/employee/login"}
                className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-200 transition"
              >
                👨‍💼 Employee
              </Link>
            )}
            <CartButton />

            {/* ✅ Hamburger Button */}
            <button
              onClick={() => setIsOpen(true)}
              aria-label="Open menu"
              className="bg-orange-400 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-orange-500 transition"
            >
              <div className="flex flex-col items-start gap-1">
                <span className="h-0.5 w-5 bg-white rounded-full"></span>
                <span className="h-0.5 w-3 bg-white rounded-full"></span>
              </div>
            </button>

          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">

          {/* Top Row */}
          <div className="flex items-center justify-between p-4">
            <Image src="/logo.png" alt="Zoomies" width={40} height={40} className="h-10" />

            <button onClick={() => setIsOpen(false)} aria-label="Close menu">
              <X size={30} />
            </button>
          </div>

          {/* Book Now */}
          <div className="px-4 mb-6">
            <Link
              href="/pet-details"
              className="block bg-orange-400 text-white text-center py-3 rounded-full font-medium"
              onClick={() => setIsOpen(false)}
            >
              Book now
            </Link>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col gap-5 px-6 text-lg font-semibold text-slate-800">
            {isAdmin && (
              <Link href="/admin/employees" onClick={() => setIsOpen(false)}>
                Admin
              </Link>
            )}
            <Link
              href={isEmployeeLoggedIn ? "/employee/dashboard" : "/employee/login"}
              onClick={() => setIsOpen(false)}
            >
              👨‍💼 Employee
            </Link>
            <Link href="/profile" onClick={() => setIsOpen(false)}>MyProfile</Link>
            <Link href="/about" onClick={() => setIsOpen(false)}>About</Link>
            <Link href="/contact" onClick={() => setIsOpen(false)}>Contact</Link>
            <Link href="/find-us" onClick={() => setIsOpen(false)}>Find Us</Link>

          </div>

          {/* Login / Logout */}
          <div className="mt-auto p-6">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full border border-gray-300 py-3 rounded-full font-medium"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="block w-full text-center border border-gray-300 py-3 rounded-full font-medium"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            )}
          </div>

        </div>
      )}
    </>
  );
}
