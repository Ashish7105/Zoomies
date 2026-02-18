"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginCard from "@/components/LoginCards";
import { Input } from "@heroui/input";
import { useAuth } from "@/lib/contexts/AuthContext";

export default function PetDetails() {
  const [petName, setPetName] = useState("");
  const router = useRouter();
  const { user, setPetType, setSelectedPetName } = useAuth();

  const handleSelect = async (petType) => {
    if (!user || !user.uid) {
      alert("Please sign in first to save your pet details.");
      router.push("/login");
      return;
    }

    try {
      await setPetType(user.uid, petType);
      if (petName && petName.trim()) {
        await setSelectedPetName(user.uid, petName.trim());
      }

      // Navigate to the appropriate items page
      router.push(petType === "cat" ? "/items/cats" : "/items/dogs");
    } catch (err) {
      console.error("Failed to save pet details:", err);
      alert("Could not save pet details. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-cream">

      <LoginCard>

        <Input
          value={petName}
          onChange={(e) => setPetName(e.target.value)}
          placeholder="Enter Pet Name"
          size="sm"
          radius="lg"
          classNames={{
            input: "text-black",
          }}
        />

        <h3 className="text-sm font-semibold mt-4 text-gray-800 text-left">
          Select your Pet
        </h3>

        {/* Buttons Container */}
        <div className="flex gap-2 mt-2">

          <button
            onClick={() => handleSelect("cat")}
            className="flex-1 bg-orange-400 text-white py-2 rounded-lg font-medium hover:bg-white hover:text-black hover:scale-105 hover:shadow-md active:bg-white active:text-black active:scale-95 transition"
          >
            Cat
          </button>

          <button
            onClick={() => handleSelect("dog")}
            className="flex-1 bg-orange-400 text-white py-2 rounded-lg font-medium hover:bg-white hover:text-black hover:scale-105 hover:shadow-md active:bg-white active:text-black active:scale-95 transition"
          >
            Dog
          </button>

        </div>

      </LoginCard>

    </div>
  );
}
