"use client";

import { useRouter } from "next/navigation";

export default function OrderSuccessPage() {
  const router = useRouter();

  return (
    <div className="flex justify-center items-center min-h-screen bg-cream p-4">

      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6 text-center">

        {/* Success Icon */}
        <div className="text-5xl mb-3">✅</div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900">
          Order Placed Successfully!
        </h2>

        {/* Subtitle */}
        <p className="text-sm text-gray-500 mt-2">
          Your goodies are on the way 🐾
        </p>

        {/* Divider */}
        <div className="w-16 h-1 bg-orange-400 mx-auto mt-4 rounded-full"></div>

        {/* Order Details */}
        <div className="mt-5 border rounded-xl p-3 text-sm text-left">
          <p><strong>Order ID:</strong> #ZOOM1234</p>
          <p><strong>Delivery To:</strong> Ashish</p>
          <p><strong>Estimated Time:</strong> 30–45 mins</p>
        </div>

        {/* Buttons */}
        <div className="mt-5 space-y-2">

          <button
            onClick={() => router.push("/")}
            className="w-full bg-orange-400 text-white py-2 rounded-xl hover:bg-orange-500 transition"
          >
            Go to Home
          </button>

          <button
            onClick={() => router.push("/orders")}
            className="w-full border border-gray-300 py-2 rounded-xl hover:bg-gray-100 transition"
          >
            Track Order
          </button>

        </div>
      </div>
    </div>
  );
}
