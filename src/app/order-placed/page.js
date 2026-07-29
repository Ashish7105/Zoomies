"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/contexts/CartContext";
import { getOrderById } from "@/lib/checkout";

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get("orderId");

  // ✅ Clear cart when order is successfully placed
  useEffect(() => {
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load order details
  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    getOrderById(orderId)
      .then((o) => {
        if (!cancelled) setOrder(o);
      })
      .catch(() => {
        if (!cancelled) setOrder(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const shortId = orderId ? orderId.slice(-8).toUpperCase() : "—";
  const isPickup = order?.deliveryOption === "store";

  return (
    <div className="flex justify-center items-center min-h-screen bg-cream p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6 text-center">

        <div className="text-5xl mb-3">✅</div>

        <h2 className="text-2xl font-bold text-gray-900">
          Order Placed Successfully!
        </h2>

        <p className="text-sm text-gray-500 mt-2">
          Your goodies are on the way 🐾
        </p>

        <div className="w-16 h-1 bg-orange-400 mx-auto mt-4 rounded-full"></div>

        {/* Order Details */}
        <div className="mt-5 border rounded-xl p-3 text-sm text-left">
          <p><strong>Order ID:</strong> #{shortId}</p>
          <p>
            <strong>Type:</strong>{" "}
            {isPickup ? "Pickup at store" : "Delivery"}
          </p>

          {order && (
            <>
              <p className="mt-2"><strong>Items:</strong></p>
              <ul className="pl-4 list-disc">
                {(order.items || []).map((item, idx) => (
                  <li key={idx}>
                    {item.name} × {item.quantity}
                  </li>
                ))}
              </ul>
            </>
          )}

          {!isPickup && order?.deliveryAddress?.address && (
            <p className="mt-2">
              <strong>Deliver to:</strong> {order.deliveryAddress.address}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-5 space-y-2">

          <button
            onClick={() => router.push("/pet-details")}
            className="w-full bg-orange-400 text-white py-2 rounded-xl hover:bg-orange-500 transition"
          >
            Go to Home
          </button>
        </div>

        {loading && (
          <p className="mt-3 text-xs text-gray-400">
            Loading latest order details…
          </p>
        )}
      </div>
    </div>
  );
}
