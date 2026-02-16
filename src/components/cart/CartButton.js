"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/contexts/CartContext";

export default function CartButton() {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <button onClick={() => setIsCartOpen(true)} className="relative">
      <ShoppingCart />

      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
          {totalItems}
        </span>
      )}
    </button>
  );
}
