"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation"
import { useEffect } from "react";
import Spinner from "./ui/Spinner";

export default function GoogleButton() {

    const router = useRouter();
    const {
        user,
        isLoading,
        error,
        handleSignInWithGoogle,
        handleLogout
    } = useAuth();

    if (isLoading) return (<Spinner/>);

    useEffect(() => {
        if (user) {
            router.push("/pet-details")
        }

    }, [user, router]);


    return (
        <>


            {
                error && ( <p className="text-red-400 text-sm mb-2" >{error}</p>
            )}

            <button
                onClick={handleSignInWithGoogle}
                disabled={isLoading}
                className="
        w-full
        flex
        items-center
        justify-center
        gap-3
        border
        border-gray-300
        bg-white
        py-2.5
        rounded-xl
        shadow-sm
        hover:shadow-md
        hover:bg-gray-50
        transition
        disabled:opacity-60
        disabled:cursor-not-allowed
      "
            >
                <img
                    src="https://developers.google.com/identity/images/g-logo.png"
                    alt="Google"
                    className="w-5 h-5"
                />
                <span className="text-sm font-medium text-gray-700">
                    {isLoading ? (<Spinner/>) : "Continue with Google"}
                </span>
            </button>


        </>
    );
}
