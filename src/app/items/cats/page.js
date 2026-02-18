"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/contexts/CartContext";
import { useAuth } from "@/lib/contexts/AuthContext";
import useUserDoc from "@/lib/hooks/useUserDoc";
import { getItemsByCategory } from "@/lib/items";
import { Plus, Minus } from "lucide-react";

export default function CatsPage() {
  const { cart, addToCart, updateQty } = useCart();
  const { user } = useAuth();
  const userDoc = useUserDoc(user?.uid);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getItemsByCategory("cat")
      .then((list) => { if (!cancelled) setProducts(list); })
      .catch(() => { if (!cancelled) setProducts([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-white p-6 grid gap-5 sm:grid-cols-2">
      {userDoc && (
        <div className="col-span-full p-2">
          <strong>Selected pet:</strong> {userDoc.petType || "—"} {userDoc.selectedPetName ? `(${userDoc.selectedPetName})` : ""}
        </div>
      )}
      {loading ? (
        <div className="col-span-full flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-400 border-t-transparent" />
        </div>
      ) : products.length === 0 ? (
        <p className="col-span-full text-gray-500 py-8">No items for cats yet. Check back later.</p>
      ) : (
        products.map((p) => {
          const cartItem = cart.find((item) => item.id === p.id);
          return (
            <div key={p.id} className="border rounded-2xl p-4 shadow-sm">
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-40 object-cover rounded-xl mb-3"
              />
              <h2 className="font-semibold">{p.name}</h2>
              <p className="font-bold">${p.price}</p>
              {p.description && <p className="text-sm text-gray-500 mt-1">{p.description}</p>}
              {cartItem ? (
                <div className="flex justify-between mt-3">
                  <span className="text-orange-500">In Cart: {cartItem.quantity}</span>
                  <div className="flex gap-3">
                    <button onClick={() => updateQty(p.id, -1)}><Minus size={18} /></button>
                    <span>{cartItem.quantity}</span>
                    <button onClick={() => updateQty(p.id, 1)} disabled={cartItem.quantity >= 1} className={cartItem.quantity >= 1 ? "opacity-40" : ""}>
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
        })
      )}
    </div>
  );
}
