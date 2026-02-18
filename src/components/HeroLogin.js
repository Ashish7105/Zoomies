"use client";

import React, { useState, useEffect } from "react";
// Using inline SVGs instead of @iconify/react to avoid extra dependency
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Spinner from "./ui/Spinner";

export default function HeroLogin() {
  const router = useRouter();
  const { user, isLoading, error, handleSignInWithGoogle, handleSignInWithEmail, handleSignUpWithEmail } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);

  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) router.push("/pet-details");
  }, [user, router]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Please enter email and password");

    if (isSignUp) {
      await handleSignUpWithEmail(email, password);
    } else {
      await handleSignInWithEmail(email, password);
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <>
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-2xl font-medium">{isSignUp ? "Create an account" : "Sign in to your account"}</h1>
        <p className="text-sm text-default-500">{isSignUp ? "Create your Zoomies account" : "to continue to Zoomies"}</p>
      </div>

      {error && <p className="text-red-400 text-sm mb-2">{error}</p>}

      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <label className="flex flex-col text-sm">
            <span className="mb-1">Email Address</span>
            <input
              required
              name="email"
              placeholder="Enter your email"
              type="email"
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="flex flex-col text-sm relative">
            <span className="mb-1">Password</span>
            <input
              required
              name="password"
              placeholder="Enter your password"
              type={isVisible ? "text" : "password"}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={toggleVisibility}
              className="absolute right-2 top-8"
              aria-label={isVisible ? "Hide password" : "Show password"}
            >
              {isVisible ? (
                <svg className="w-5 h-5 text-default-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M17.94 17.94C16.12 19.26 14.11 20 12 20c-4.97 0-9.27-3.11-11-7.5 1.13-2.9 3.16-5.19 5.58-6.67" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M1 1l22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-default-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M1.42 12C2.73 7.61 6.39 4 12 4c2.11 0 4.12.74 5.94 2.06" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </label>

          <div className="flex w-full items-center justify-between px-1 py-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="remember" />
              <span>Remember me</span>
            </label>
            <a className="text-default-500 text-sm" href="#">
              Forgot password?
            </a>
          </div>

          <button className="w-full bg-orange-400 text-white py-2.5 rounded-xl font-medium" type="submit">
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-gray-200" />
          <p className="text-tiny text-default-500 shrink-0">OR</p>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="flex flex-col gap-2">
          <button onClick={handleSignInWithGoogle} className="w-full flex items-center gap-3 justify-center border border-gray-300 bg-white py-2.5 rounded-xl shadow-sm hover:shadow-md">
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-5 h-5" />
            <span className="text-sm font-medium text-gray-700">Continue with Google</span>
          </button>

          {/* <button className="w-full flex items-center gap-3 justify-center border border-gray-300 bg-white py-2.5 rounded-xl shadow-sm hover:shadow-md">
            <svg className="w-5 h-5 text-default-500" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38C13.71 14.53 16 11.54 16 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            <span className="text-sm font-medium text-gray-700">Continue with Github</span>
          </button> */}
        </div>

        <p className="text-small text-center mt-3">
          {isSignUp ? (
            <>Already have an account?&nbsp;<button type="button" onClick={() => setIsSignUp(false)} className="text-default-500 text-sm">Sign In</button></>
          ) : (
            <>Need to create an account?&nbsp;<button type="button" onClick={() => setIsSignUp(true)} className="text-default-500 text-sm">Sign Up</button></>
          )}
        </p>
    </>
  );
}
