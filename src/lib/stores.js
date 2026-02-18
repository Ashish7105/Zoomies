"use client";

import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

const COLLECTION = "stores";

/** Default store ID used for pickup when no store is selected (e.g. "Same Grooming Store"). */
export const DEFAULT_STORE_ID = "store1";

/**
 * Get store by ID (name, address, phone for pickup location).
 * @param {string} storeId
 * @returns {Promise<{ id: string, name: string, address?: string, phone?: string, coordinates?: { lat: number, lng: number } } | null>}
 */
export async function getStoreById(storeId) {
  if (!storeId) return null;
  const storeRef = doc(db, COLLECTION, storeId);
  const snap = await getDoc(storeRef);
  if (!snap.exists()) return { id: storeId, name: "Store", address: "—", phone: "" };
  return { id: snap.id, ...snap.data() };
}

/**
 * Get all stores (for admin).
 * @returns {Promise<Array<{ id: string, name: string, address?: string, phone?: string }>>}
 */
export async function getAllStores() {
  const ref = collection(db, COLLECTION);
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Create store.
 * @param {{ name: string, address?: string, phone?: string, coordinates?: { lat: number, lng: number } }} data
 * @returns {Promise<string>}
 */
export async function createStore(data) {
  const ref = collection(db, COLLECTION);
  const docRef = await addDoc(ref, {
    name: (data.name || "").trim(),
    address: (data.address || "").trim() || null,
    phone: (data.phone || "").trim() || null,
    coordinates: data.coordinates || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Update store.
 * @param {string} id
 * @param {{ name?: string, address?: string, phone?: string, coordinates?: object }} data
 */
export async function updateStore(id, data) {
  if (!id) throw new Error("Missing store id");
  const ref = doc(db, COLLECTION, id);
  const updates = { updatedAt: serverTimestamp() };
  if (data.name !== undefined) updates.name = String(data.name).trim();
  if (data.address !== undefined) updates.address = data.address?.trim() || null;
  if (data.phone !== undefined) updates.phone = data.phone?.trim() || null;
  if (data.coordinates !== undefined) updates.coordinates = data.coordinates;
  await updateDoc(ref, updates);
}

/**
 * Delete store.
 * @param {string} id
 */
export async function deleteStore(id) {
  if (!id) throw new Error("Missing store id");
  await deleteDoc(doc(db, COLLECTION, id));
}
