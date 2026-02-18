"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEmployee } from "@/lib/contexts/EmployeeContext";
import { getStoreOrders, updateCheckoutStatus } from "@/lib/checkout";
import { getStoreById } from "@/lib/stores";

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  ready: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-700",
};

const STATUS_OPTIONS = ["pending", "confirmed", "ready", "completed"];

function buildDirectionsUrl(lat, lng, address) {
  const dest = lat != null && lng != null ? `${lat},${lng}` : encodeURIComponent(address || "");
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
}

export default function EmployeeDashboardPage() {
  const router = useRouter();
  const { employee, isEmployeeLoggedIn, logout } = useEmployee();
  const [orders, setOrders] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!isEmployeeLoggedIn) {
      router.replace("/employee/login");
      return;
    }
    const storeId = employee?.storeId;
    if (!storeId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [ordersList, storeData] = await Promise.all([
          getStoreOrders(storeId),
          getStoreById(storeId),
        ]);
        if (!cancelled) {
          setOrders(ordersList);
          setStore(storeData);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [employee?.storeId, isEmployeeLoggedIn, router]);

  const handleStatusChange = async (orderId, newStatus) => {
    if (!selectedOrder || selectedOrder.id !== orderId) return;
    setUpdatingStatus(true);
    try {
      await updateCheckoutStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      setSelectedOrder((prev) => (prev?.id === orderId ? { ...prev, status: newStatus } : prev));
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (!isEmployeeLoggedIn) return null;

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Zoomies" width={36} height={36} />
            <span className="font-semibold text-gray-900">Employee Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{employee?.name || employee?.email}</span>
            <button
              onClick={() => {
                logout();
                router.replace("/employee/login");
              }}
              className="text-sm text-orange-500 hover:underline"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 pb-8">
        <h2 className="text-xl font-bold text-gray-900 mt-2">Orders for your store</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-400 border-t-transparent" />
          </div>
        ) : orders.length === 0 ? (
          <p className="text-gray-500 py-8">No orders yet.</p>
        ) : (
          <ul className="space-y-3 mt-4">
            {orders.map((order) => (
              <li
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm cursor-pointer hover:border-orange-300 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">Order #{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {order.deliveryOption === "store" ? "Pickup" : "Delivery"} · {order.items?.length || 0} item(s)
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : "—"}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}
                  >
                    {order.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* Order details modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-gray-900">
                Order #{selectedOrder.id.slice(-6).toUpperCase()}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Status */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      disabled={updatingStatus}
                      onClick={() => handleStatusChange(selectedOrder.id, status)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        selectedOrder.status === status
                          ? STATUS_COLORS[status] + " ring-2 ring-offset-1 ring-orange-400"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Items</p>
                <ul className="border rounded-lg divide-y">
                  {(selectedOrder.items || []).map((item, i) => (
                    <li key={i} className="px-3 py-2 flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span>${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pickup location (store) */}
              {selectedOrder.deliveryOption === "store" && store && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Pickup location</p>
                  <div className="border rounded-lg p-3 text-sm">
                    <p className="font-medium">{store.name}</p>
                    {store.address && <p className="text-gray-600">{store.address}</p>}
                    {store.phone && <p className="text-gray-600">{store.phone}</p>}
                    <a
                      href={buildDirectionsUrl(
                        store.coordinates?.lat,
                        store.coordinates?.lng,
                        store.address
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-orange-500 hover:underline"
                    >
                      Get Directions →
                    </a>
                  </div>
                </div>
              )}

              {/* Delivery location */}
              {(selectedOrder.deliveryOption === "custom" || selectedOrder.deliveryAddress) && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Delivery location</p>
                  <div className="border rounded-lg p-3 text-sm">
                    <p className="text-gray-800">
                      {selectedOrder.deliveryAddress?.address || selectedOrder.address || "—"}
                    </p>
                    {selectedOrder.deliveryAddress?.details && (
                      <div className="mt-2 text-gray-600 space-y-0.5">
                        {selectedOrder.deliveryAddress.details.apartmentSociety && (
                          <p>Apartment/Society: {selectedOrder.deliveryAddress.details.apartmentSociety}</p>
                        )}
                        {(selectedOrder.deliveryAddress.details.towerBlock || selectedOrder.deliveryAddress.details.housePlot) && (
                          <p>Block: {selectedOrder.deliveryAddress.details.towerBlock}, Plot: {selectedOrder.deliveryAddress.details.housePlot}</p>
                        )}
                        {selectedOrder.deliveryAddress.details.streetAreaColony && (
                          <p>Street/Area: {selectedOrder.deliveryAddress.details.streetAreaColony}</p>
                        )}
                        {(selectedOrder.deliveryAddress.details.pincode || selectedOrder.deliveryAddress.details.city) && (
                          <p>{selectedOrder.deliveryAddress.details.city} {selectedOrder.deliveryAddress.details.pincode}</p>
                        )}
                        {selectedOrder.deliveryAddress.details.landmark && (
                          <p>Landmark: {selectedOrder.deliveryAddress.details.landmark}</p>
                        )}
                      </div>
                    )}
                    {selectedOrder.deliveryAddress?.coordinates && (
                      <a
                        href={buildDirectionsUrl(
                          selectedOrder.deliveryAddress.coordinates.lat,
                          selectedOrder.deliveryAddress.coordinates.lng,
                          selectedOrder.deliveryAddress.address
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-orange-500 hover:underline"
                      >
                        Get Directions →
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>Placed: {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : "—"}</p>
                {selectedOrder.updatedAt && (
                  <p>Updated: {new Date(selectedOrder.updatedAt).toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
