"use client";

import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  limit,
} from "firebase/firestore";

function normalizeOrder(docSnap) {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt,
  };
}

/**
 * Get all orders for a store. Includes:
 * - Orders where storeId matches
 * - Orders with no storeId (legacy orders created before storeId was added)
 * @param {string} storeId
 * @returns {Promise<Array<{ id: string, ...order }>>}
 */
export async function getStoreOrders(storeId) {
  if (!storeId) return [];

  const ordersRef = collection(db, "orders");
  const byStore = query(ordersRef, where("storeId", "==", storeId));
  const snapshot = await getDocs(byStore);
  const ordersFromStore = snapshot.docs.map(normalizeOrder);

  const recentQuery = query(ordersRef, limit(150));
  let snapshotRecent;
  try {
    snapshotRecent = await getDocs(recentQuery);
  } catch {
    snapshotRecent = { docs: [] };
  }
  const ordersNoStore = snapshotRecent.docs
    .filter((d) => {
      const s = d.data().storeId;
      return s === undefined || s === null || s === "";
    })
    .map(normalizeOrder);

  const seen = new Set(ordersFromStore.map((o) => o.id));
  const merged = [...ordersFromStore];
  for (const o of ordersNoStore) {
    if (!seen.has(o.id)) {
      seen.add(o.id);
      merged.push(o);
    }
  }
  merged.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  return merged;
}

/**
 * Get delivery orders for a store (deliveryOption === 'custom', storeId matches).
 * @param {string} storeId
 * @returns {Promise<Array<{ id: string, ...order }>>}
 */
export async function getStoreDeliveryOrders(storeId) {
  if (!storeId) return [];
  const orders = await getStoreOrders(storeId);
  return orders.filter((o) => o.deliveryOption === "custom");
}

/**
 * Get all orders (for dashboard: show pickup orders by storeId, and optionally delivery orders without storeId).
 * If storeId is provided, returns orders where storeId matches. Also returns orders that have no storeId (delivery) so store can fulfill them.
 * @param {string} storeId
 * @returns {Promise<Array<{ id: string, ...order }>>}
 */
export async function getStoreOrdersWithDelivery(storeId) {
  if (!storeId) return [];

  // Get orders for this store (pickup) and delivery orders (no storeId) for same store to fulfill
  const orders = await getStoreOrders(storeId);
  return orders;
}

/**
 * Get all orders (for admin).
 * @returns {Promise<Array<{ id: string, ...order }>>}
 */
export async function getAllOrders() {
  const ordersRef = collection(db, "orders");
  const snapshot = await getDocs(ordersRef);
  const orders = snapshot.docs.map((d) => normalizeOrder(d));
  orders.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  return orders;
}

/**
 * Update order status.
 * @param {string} orderId
 * @param {string} status - 'pending' | 'confirmed' | 'ready' | 'completed'
 */
export async function updateCheckoutStatus(orderId, status) {
  if (!orderId) throw new Error("Missing orderId");
  const orderRef = doc(db, "orders", orderId);
  await updateDoc(orderRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}
