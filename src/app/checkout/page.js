"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/contexts/CartContext";
import { useAuth } from "@/lib/contexts/AuthContext";
import FreeMapPicker from "@/components/FreeMapPicker";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();
  const { user, placeOrder } = useAuth();
  const isOrderPlacedRef = useRef(false);

  const [selectedAddress, setSelectedAddress] = useState("store");
  const [detectedAddress, setDetectedAddress] = useState("");
  const [detectedCoordinates, setDetectedCoordinates] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [addressDetails, setAddressDetails] = useState({
    apartmentSociety: "",
    towerBlock: "",
    housePlot: "",
    floor: "",
    streetAreaColony: "",
    landmark: "",
    pincode: "",
    city: "",
  });

  // ✅ Redirect if cart empty (but not after successful order)
  useEffect(() => {
    if (cart.length === 0 && !isOrderPlacedRef.current) {
      router.replace("/items");
    }
  }, [cart, router]);

  // ✅ Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  // ✅ Prevent flicker - check cart
  if (cart.length === 0 && !isOrderPlacedRef.current) return null;

  // ✅ Prevent flicker - check user
  if (!user) return null;

  const handleOrder = async () => {
    // ✅ Validate address if custom selected
    if (selectedAddress === "custom" && !detectedAddress) {
      alert("Please select your delivery location on the map");
      return;
    }

    const finalAddress = selectedAddress === "custom" ? detectedAddress : "Store";

    setIsLoading(true);
    try {
      // ✅ Place order in Firestore (storeId for pickup, deliveryAddress + coordinates for custom)
      const orderId = await placeOrder({
        uid: user.uid,
        cartItems: cart,
        petFor: "selected pet",
        deliveryOption: selectedAddress,
        address: finalAddress,
        storeId: selectedAddress === "store" ? "store1" : null,
        coordinates:
          selectedAddress === "custom" && detectedCoordinates
            ? detectedCoordinates
            : null,
        addressDetails:
          selectedAddress === "custom"
            ? { ...addressDetails }
            : null,
      });

      console.log("Order placed successfully with ID:", orderId);

      // ✅ Mark order as placed to prevent redirect to /items
      isOrderPlacedRef.current = true;

      // ✅ Navigate to order confirmation (don't clear cart yet)
      router.push("/order-placed");
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
      setIsLoading(false);
    }
  };




  return (
    <div className="flex justify-center min-h-screen bg-cream p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg flex flex-col">

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1">

          {/* Header */}
          <div className="text-center mb-5">
            <img
              src="/logo.png"
              alt="Zoomies"
              className="w-24 mx-auto mb-2"
            />

            <h2 className="text-3xl font-bold text-gray-900">
              Checkout
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Confirm your address & delivery details
            </p>

            <div className="w-16 h-1 bg-orange-400 mx-auto mt-3 rounded-full"></div>
          </div>

          {/* Address Selection */}
          <p className="text-sm font-medium mb-2">Select the address</p>

          <div className="border rounded-xl p-4 space-y-3">

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={selectedAddress === "store"}
                onChange={() => setSelectedAddress("store")}
              />
              <span className="text-sm">Same Grooming Store</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={selectedAddress === "custom"}
                onChange={() => setSelectedAddress("custom")}
              />
              <span className="text-sm">Custom Address</span>
            </label>

            {/* Custom Address UI with Free Map Picker */}
            {selectedAddress === "custom" && (
              <>
                <FreeMapPicker
                  coordinates={detectedCoordinates}
                  onCoordinatesChange={setDetectedCoordinates}
                  address={detectedAddress}
                  onAddressChange={setDetectedAddress}
                />

                {detectedAddress && (
                  <p className="text-xs text-gray-600">
                    📍 {detectedAddress}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Detailed Address Form */}
          {selectedAddress === "custom" && (
            <div className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Apartment / Society Name*"
                value={addressDetails.apartmentSociety}
                onChange={(e) => setAddressDetails((d) => ({ ...d, apartmentSociety: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tower/Block No*"
                  value={addressDetails.towerBlock}
                  onChange={(e) => setAddressDetails((d) => ({ ...d, towerBlock: e.target.value }))}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <input
                  type="text"
                  placeholder="House/Plot No*"
                  value={addressDetails.housePlot}
                  onChange={(e) => setAddressDetails((d) => ({ ...d, housePlot: e.target.value }))}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <input
                type="text"
                placeholder="Floor"
                value={addressDetails.floor}
                onChange={(e) => setAddressDetails((d) => ({ ...d, floor: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <input
                type="text"
                placeholder="Street , Area , Colony*"
                value={addressDetails.streetAreaColony}
                onChange={(e) => setAddressDetails((d) => ({ ...d, streetAreaColony: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <input
                type="text"
                placeholder="Landmark"
                value={addressDetails.landmark}
                onChange={(e) => setAddressDetails((d) => ({ ...d, landmark: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Pincode"
                  value={addressDetails.pincode}
                  onChange={(e) => setAddressDetails((d) => ({ ...d, pincode: e.target.value }))}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={addressDetails.city}
                  onChange={(e) => setAddressDetails((d) => ({ ...d, city: e.target.value }))}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="mt-5 border rounded-xl p-4">
            <p className="font-semibold mb-2">Order Summary</p>

            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}

            <div className="border-t mt-3 pt-2 font-bold flex justify-between">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>

        </div>

        {/* Sticky Footer */}
        <div className="p-4 border-t bg-white sticky bottom-0">
          <button
            onClick={handleOrder}
            disabled={isLoading}
            className="w-full bg-orange-400 text-white py-3 rounded-xl font-medium hover:bg-orange-500 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Place Order"}
          </button>
        </div>

      </div>
    </div>
  );
}
