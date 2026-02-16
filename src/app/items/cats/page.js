"use client";

import { useCart } from "@/lib/contexts/CartContext";
import { Plus, Minus } from "lucide-react";

const PRODUCTS = [
  {
    id: 1,
    name: "Orange Juice",
    price: 12.99,
    image: "/products/juice.png",
  },
  {
    id: 2,
    name: "Glow Serum",
    price: 45.0,
    image: "/products/serum.png",
  },
];

export default function CatsPage() {
  const { cart, addToCart, updateQty } = useCart(); // ✅ USE CONTEXT

  return (
    <div className="min-h-screen bg-white p-6 grid gap-5 sm:grid-cols-2">
      {PRODUCTS.map((p) => {
        const cartItem = cart.find((item) => item.id === p.id);

        return (
          <div key={p.id} className="border rounded-2xl p-4 shadow-sm">
            <img
              src={p.image}
              className="w-full h-40 object-cover rounded-xl mb-3"
            />

            <h2 className="font-semibold">{p.name}</h2>
            <p className="font-bold">${p.price}</p>

            {cartItem ? (
              <div className="flex justify-between mt-3">
                <span className="text-orange-500">
                  In Cart: {cartItem.quantity}
                </span>

                <div className="flex gap-3">
                  <button onClick={() => updateQty(p.id, -1)}>
                    <Minus size={18} />
                  </button>

                  <span>{cartItem.quantity}</span>

                
                  <button onClick={() => updateQty(p.id, 1)}
                    disabled = {cartItem.quantity >= 1}
                    className={cartItem.quantity >= 1 ? "opacity-40" : ""}
                    >
                    <Plus size={18} />
                  </button>

                    


                </div>
              </div>
            ) : (
              <button
                onClick={() => addToCart(p)}
                className="mt-3 bg-orange-400 text-white py-2 rounded-xl w-full"
              >
                Add to Cart
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
