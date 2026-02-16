"use client";

import { useState, useEffect } from "react";
import { redirect, useRouter } from "next/navigation";
import { useCart } from "@/lib/contexts/CartContext";
import { useAuth } from "@/lib/contexts/AuthContext";

import {
  LoadScript,
  Autocomplete,
  GoogleMap,
  Marker,
} from "@react-google-maps/api";

const libraries = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "180px",
};

const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090,
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal } = useCart();
  const {user} = useAuth();
  

  const [selectedAddress, setSelectedAddress] = useState("store");
  const [address, setAddress] = useState("");
  const [autocomplete, setAutocomplete] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);

  // ✅ Redirect if cart empty
  useEffect(() => {
    if (cart.length === 0) {
      router.replace("/items");
    }
  }, [cart]);

  // ✅ Prevent flicker
  if (cart.length === 0) return null;

  const onLoad = (autoC) => setAutocomplete(autoC);

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();

      if (place?.geometry) {
        const location = place.geometry.location;

        setMarkerPosition({
          lat: location.lat(),
          lng: location.lng(),
        });

        setAddress(place.formatted_address || "Selected location");
      }
    }
  };

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    setMarkerPosition({ lat, lng });
    setAddress(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
  };

  const handleOrder = () => {
    // ✅ Validate only when custom selected
    if (selectedAddress === "custom" && !address) {
      alert("Please select your delivery location");
      return;
    }

    console.log("Order placed:", cart);

    router.push("/order-placed");
  };


  useEffect(() => {
    if(!user) {
      router.replace("/login");
    }
  }, [user]);

  if(!user) return null;




  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
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

              {/* Custom Address UI */}
              {selectedAddress === "custom" && (
                <>
                  <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                    <input
                      type="text"
                      placeholder="Search your address"
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </Autocomplete>

                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={markerPosition}
                    zoom={12}
                    onClick={handleMapClick}
                  >
                    <Marker position={markerPosition} />
                  </GoogleMap>

                  {address && (
                    <p className="text-xs text-gray-600">
                      📍 {address}
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
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Tower/Block No*"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />

                  <input
                    type="text"
                    placeholder="House/Plot No*"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Floor"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />

                <input
                  type="text"
                  placeholder="Street , Area , Colony*"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />

                <input
                  type="text"
                  placeholder="Landmark"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Pincode"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />

                  <input
                    type="text"
                    placeholder="City"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
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
              className="w-full bg-orange-400 text-white py-3 rounded-xl font-medium hover:bg-orange-500 transition"
            >
              Place Order
            </button>
          </div>

        </div>
      </div>
    </LoadScript>
  );
}
