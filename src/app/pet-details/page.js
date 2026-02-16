"use client";

import LoginCard from "@/components/LoginCards";
import { Input } from "@heroui/input";
import Link from "next/link";

export default function PetDetails() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-cream">

      <LoginCard>

        <Input
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


          <Link href="/items/cats" className="flex-1 bg-orange-400 text-white py-2 rounded-lg font-medium hover:bg-white hover:text-black hover: scale-105 hover:shadow-md active:bg-white active: text-black active: scale-95 transition" >
            <button  >
              Cat
            </button>
          </Link>



          <Link href="/items/dogs" className="flex-1 bg-orange-400 text-white py-2 rounded-lg font-medium hover:bg-white hover:text-black hover:scale-105 hover:shadow-md active:bg-white active: text-black active: scale-95 transition" >

            <button >
              Dog
            </button>
            </Link >


        </div>

      </LoginCard>

    </div>
  );
}
