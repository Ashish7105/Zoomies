"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";

import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  arrayUnion,
  getDoc,
} from "firebase/firestore";

const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
      // Ensure user document exists in Firestore when logged in
      if (firebaseUser) ensureUserInDb(firebaseUser).catch(console.error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Google Sign-In (SAFE)
  const handleSignInWithGoogle = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      setUser(result.user);
      // create/update user in Firestore
      await ensureUserInDb(result.user);

    } catch (err) {

      // ✅ Ignore popup closed error (VERY IMPORTANT)
      if (err.code === "auth/popup-closed-by-user") {
        console.log("User closed Google popup");
        return;
      }

      console.error("Google Sign-In Error:", err);
      setError("Login failed. Please try again.");

    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Email/password sign-in
  const handleSignInWithEmail = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      await ensureUserInDb(result.user);
    } catch (err) {
      console.error("Email Sign-In Error:", err?.code, err?.message, err);
      const message =
        err?.code === "auth/invalid-credential"
          ? "Invalid email or password."
          : err?.code === "auth/user-not-found"
            ? "No account found with this email."
            : err?.code === "auth/wrong-password"
              ? "Invalid email or password."
              : err?.code === "auth/too-many-requests"
                ? "Too many attempts. Please try again later."
                : err?.message || "Login failed. Please check your credentials.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Email/password sign-up
  const handleSignUpWithEmail = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await createUserWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      await ensureUserInDb(result.user);
    } catch (err) {
      console.error("Email Sign-Up Error:", err?.code, err?.message, err);

      // If the email is already in use, check which providers are registered
      if (err?.code === "auth/email-already-in-use") {
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          if (methods && methods.includes("google.com")) {
            setError("This email is already registered with Google. Please sign in with Google.");
          } else if (methods && methods.length > 0) {
            setError(`This email is already registered. Sign-in methods: ${methods.join(", ")}`);
          } else {
            setError("This email is already in use. Please try signing in or reset your password.");
          }
        } catch (innerErr) {
          console.error("fetchSignInMethodsForEmail failed:", innerErr);
          setError(err?.message || "Sign up failed. Please try again.");
        }
      } else {
        setError(err?.message || "Sign up failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Firestore helpers ---
  // users/{uid}: role 'user'|'admin', hasPetProfile, petInfo: { petName, petType, userId, selectedItem }
  async function ensureUserInDb(firebaseUser) {
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);

    // If user doc doesn't exist yet, create with default role 'user'
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid,
        email: firebaseUser.email || null,
        displayName: firebaseUser.displayName || null,
        role: "user",
        hasPetProfile: false,
        petInfo: null,
        petType: null,
        selectedPetName: null,
        addresses: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return;
    }

    // If it exists (e.g. role already set to 'admin'), only refresh basic fields
    const existing = snap.data() || {};
    await setDoc(
      userRef,
      {
        uid,
        email: firebaseUser.email || existing.email || null,
        displayName: firebaseUser.displayName || existing.displayName || null,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  // Set or change the user's pet type (cat/dog)
  const setPetType = async (uid, petType) => {
    if (!uid) throw new Error("Missing uid");
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { petType, updatedAt: serverTimestamp() });
  };

  // Add an address (e.g., from Google Maps / Leaflet selection)
  const addAddress = async (uid, addressObj) => {
    if (!uid) throw new Error("Missing uid");
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { addresses: arrayUnion(addressObj) });
  };

  // Set or change the user's selected pet name; sync petInfo for schema
  const setSelectedPetName = async (uid, petName) => {
    if (!uid) throw new Error("Missing uid");
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { selectedPetName: petName, updatedAt: serverTimestamp() });
  };

  // Update petInfo (petName, petType, selectedItem) and set hasPetProfile
  const setPetInfo = async (uid, petInfo) => {
    if (!uid) throw new Error("Missing uid");
    const userRef = doc(db, "users", uid);
    const payload = {
      hasPetProfile: !!petInfo,
      petInfo: petInfo ? { ...petInfo, userId: uid } : null,
      updatedAt: serverTimestamp(),
    };
    if (petInfo?.petType) payload.petType = petInfo.petType;
    if (petInfo?.petName) payload.selectedPetName = petInfo.petName;
    await updateDoc(userRef, payload);
  };

  // Place an order document in `orders` collection
  // deliveryAddress: { address, coordinates: { lat, lng } } for custom delivery
  // storeId: for pickup orders (e.g. DEFAULT_STORE_ID)
  const placeOrder = async ({
    uid,
    cartItems,
    petFor,
    deliveryOption,
    address,
    coordinates = null,
    storeId = null,
    addressDetails = null,
  }) => {
    if (!uid) throw new Error("Missing uid");
    const ordersCol = collection(db, "orders");
    const isPickup = deliveryOption === "store";
    const assignedStoreId = isPickup ? storeId || "store1" : storeId || "store1";
    const order = {
      userId: uid,
      items: cartItems,
      petFor,
      deliveryOption,
      address: address || null,
      status: "pending",
      createdAt: serverTimestamp(),
      storeId: assignedStoreId,
      deliveryAddress:
        !isPickup && address
          ? {
              address,
              coordinates: coordinates
                ? { lat: coordinates.lat, lng: coordinates.lng }
                : null,
              details: addressDetails || null,
            }
          : null,
    };

    const docRef = await addDoc(ordersCol, order);
    return docRef.id;
  };

  // ✅ Logout (CLEAN)
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await signOut(auth);
      setUser(null);

    } catch (err) {
      console.error("Logout Error:", err);
      setError("Logout failed");

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        handleSignInWithGoogle,
        handleSignInWithEmail,
        handleSignUpWithEmail,
        handleLogout,
        // Firestore helpers available to consumers
        setPetType,
        setSelectedPetName,
        setPetInfo,
        addAddress,
        placeOrder,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Custom Hook
export const useAuth = () => useContext(AuthContext);
