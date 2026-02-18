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

const COLLECTION = "employees";

/**
 * Verify employee credentials. Returns session object (no password) or null.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ id: string, email: string, name: string, storeId: string, role: string } | null>}
 */
export async function verifyEmployee({ email, password }) {
  if (!email?.trim() || !password) return null;

  const employeesRef = collection(db, COLLECTION);
  const normalizedEmail = email.trim().toLowerCase();
  const q = query(employeesRef, where("isActive", "==", true));
  const snapshot = await getDocs(q);
  const match = snapshot.docs.find(
    (d) => (d.data().email || "").toLowerCase() === normalizedEmail
  );
  if (!match) return null;

  const data = match.data();
  if ((data.password || "") !== password) return null;

  return {
    id: match.id,
    email: data.email,
    name: data.name,
    storeId: data.storeId,
    role: data.role || "employee",
  };
}

/**
 * Create a new employee document.
 * @param {{ email: string, password: string, name: string, storeId: string, role?: string }} data
 * @returns {Promise<string>} New document ID
 */
export async function createEmployee({ email, password, name, storeId, role = "employee" }) {
  const employeesRef = collection(db, COLLECTION);
  const now = serverTimestamp();
  const docRef = await addDoc(employeesRef, {
    email: (email || "").trim().toLowerCase(),
    password: password || "",
    name: (name || "").trim(),
    storeId: storeId || "",
    role: role || "employee",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

/**
 * Get employee by ID.
 * @param {string} id
 * @returns {Promise<{ id: string, email: string, name: string, storeId: string, role: string, isActive: boolean, createdAt?: any, updatedAt?: any } | null>}
 */
export async function getEmployeeById(id) {
  if (!id) return null;
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    email: data.email,
    name: data.name,
    storeId: data.storeId,
    role: data.role || "employee",
    isActive: data.isActive ?? true,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

/**
 * Get all employees for a store.
 * @param {string} storeId
 * @returns {Promise<Array<{ id: string, email: string, name: string, storeId: string, role: string, isActive: boolean }>>}
 */
export async function getStoreEmployees(storeId) {
  if (!storeId) return [];
  const employeesRef = collection(db, COLLECTION);
  const q = query(employeesRef, where("storeId", "==", storeId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      email: data.email,
      name: data.name,
      storeId: data.storeId,
      role: data.role || "employee",
      isActive: data.isActive ?? true,
    };
  });
}

/**
 * Get all employees (for admin list).
 * @returns {Promise<Array<{ id: string, email: string, name: string, storeId: string, role: string, isActive: boolean }>>}
 */
export async function getAllEmployees() {
  const employeesRef = collection(db, COLLECTION);
  const snapshot = await getDocs(employeesRef);
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      email: data.email,
      name: data.name,
      storeId: data.storeId,
      role: data.role || "employee",
      isActive: data.isActive ?? true,
    };
  });
}

/**
 * Update an employee document (no password update unless provided).
 * @param {string} id
 * @param {{ email?: string, password?: string, name?: string, storeId?: string, role?: string, isActive?: boolean }} data
 */
export async function updateEmployee(id, data) {
  if (!id) throw new Error("Missing employee id");
  const ref = doc(db, COLLECTION, id);
  const updates = { updatedAt: serverTimestamp() };
  if (data.email !== undefined) updates.email = String(data.email).trim().toLowerCase();
  if (data.password !== undefined) updates.password = data.password;
  if (data.name !== undefined) updates.name = String(data.name).trim();
  if (data.storeId !== undefined) updates.storeId = data.storeId;
  if (data.role !== undefined) updates.role = data.role;
  if (data.isActive !== undefined) updates.isActive = data.isActive;
  await updateDoc(ref, updates);
}

/**
 * Delete an employee document (hard delete).
 * @param {string} id
 */
export async function deleteEmployee(id) {
  if (!id) throw new Error("Missing employee id");
  await deleteDoc(doc(db, COLLECTION, id));
}
