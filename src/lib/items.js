"use client";

import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

const COLLECTION = "items";

/**
 * @typedef {{ id: string, name: string, price: number, image: string, category: 'cat'|'dog', description?: string }} Item
 */

/**
 * Get items by category (cat or dog).
 * @param {'cat'|'dog'} category
 * @returns {Promise<Item[]>}
 */
export async function getItemsByCategory(category) {
  const ref = collection(db, COLLECTION);
  const q = query(ref, where("category", "==", category));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name,
      price: data.price,
      image: data.image || "/logo.png",
      category: data.category,
      description: data.description,
    };
  });
}

/**
 * Get all items (for admin).
 * @returns {Promise<Item[]>}
 */
export async function getAllItems() {
  const ref = collection(db, COLLECTION);
  const snapshot = await getDocs(ref);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name,
      price: data.price,
      image: data.image || "/logo.png",
      category: data.category || "dog",
      description: data.description,
    };
  });
}

/**
 * Get single item by ID.
 * @param {string} id
 * @returns {Promise<Item|null>}
 */
export async function getItemById(id) {
  if (!id) return null;
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    name: data.name,
    price: data.price,
    image: data.image || "/logo.png",
    category: data.category || "dog",
    description: data.description,
  };
}

/**
 * Create item.
 * @param {{ name: string, price: number, image?: string, category: 'cat'|'dog', description?: string }} data
 * @returns {Promise<string>}
 */
export async function createItem(data) {
  const ref = collection(db, COLLECTION);
  const docRef = await addDoc(ref, {
    name: (data.name || "").trim(),
    price: Number(data.price) || 0,
    image: data.image || "/logo.png",
    category: data.category || "dog",
    description: (data.description || "").trim() || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Update item.
 * @param {string} id
 * @param {{ name?: string, price?: number, image?: string, category?: string, description?: string }} data
 */
export async function updateItem(id, data) {
  if (!id) throw new Error("Missing item id");
  const ref = doc(db, COLLECTION, id);
  const updates = { updatedAt: serverTimestamp() };
  if (data.name !== undefined) updates.name = String(data.name).trim();
  if (data.price !== undefined) updates.price = Number(data.price) || 0;
  if (data.image !== undefined) updates.image = data.image;
  if (data.category !== undefined) updates.category = data.category;
  if (data.description !== undefined) updates.description = data.description?.trim() || null;
  await updateDoc(ref, updates);
}

/**
 * Delete item.
 * @param {string} id
 */
export async function deleteItem(id) {
  if (!id) throw new Error("Missing item id");
  await deleteDoc(doc(db, COLLECTION, id));
}
