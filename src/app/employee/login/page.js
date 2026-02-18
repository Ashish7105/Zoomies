"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEmployee } from "@/lib/contexts/EmployeeContext";

export default function EmployeeLoginPage() {
  const router = useRouter();
  const { login, isEmployeeLoggedIn, isLoading: contextLoading } = useEmployee();
  const [email, setEmail] = useState("employee@zommies.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!contextLoading && isEmployeeLoggedIn) router.replace("/employee/dashboard");
  }, [contextLoading, isEmployeeLoggedIn, router]);

  if (contextLoading || isEmployeeLoggedIn) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-400 border-t-transparent" />
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        router.push("/employee/dashboard");
      } else {
        setError(
          result.error ||
            "Invalid credentials. Make sure you've added the employee in Firestore (see EMPLOYEE_FIREBASE_SETUP.md)."
        );
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <Image src="/logo.png" alt="Zoomies" width={56} height={56} className="mx-auto" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">Employee Login</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to manage store orders</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="employee@zommies.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-400 text-white py-3 rounded-xl font-medium hover:bg-orange-500 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          Demo: employee@zommies.com / password123
        </p>
        <p className="text-xs text-gray-400 text-center mt-1">
          Add this user in Firestore → <strong>employees</strong> collection (see EMPLOYEE_FIREBASE_SETUP.md)
        </p>

        <Link
          href="/"
          className="block text-center text-sm text-orange-500 hover:underline mt-4"
        >
          ← Back to store
        </Link>
      </div>
    </div>
  );
}
