"use client";

import { useState, useEffect, useRef } from "react";
import {
  getAllItems,
  createItem,
  updateItem,
  deleteItem,
} from "@/lib/items";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const CATEGORIES = ["cat", "dog"];

export default function AdminItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    image: "/logo.png",
    category: "dog",
    description: "",
  });
  const [imagePreview, setImagePreview] = useState("/logo.png");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getAllItems()
      .then((list) => { if (!cancelled) setItems(list); })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const openCreate = () => {
    setForm({ name: "", price: "", image: "/logo.png", category: "dog", description: "" });
    setImagePreview("/logo.png");
    setModal("create");
    setError("");
  };

  const openEdit = (item) => {
    setForm({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image || "/logo.png",
      category: item.category || "dog",
      description: item.description || "",
    });
    setImagePreview(item.image || "/logo.png");
    setModal("edit");
    setError("");
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a local preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);
      // Store file for upload
      setForm((f) => ({ ...f, imageFile: file }));
    }
  };

  // Upload image to Firebase Storage
  const uploadImage = async (file) => {
    if (!file) return form.image;
    
    try {
      // Create unique filename with timestamp
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
      const storageRef = ref(storage, `product-images/${filename}`);
      
      // Upload file
      await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (err) {
      throw new Error(`Failed to upload image: ${err.message}`);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      // Upload image if a file was selected
      let imageUrl = form.image;
      if (form.imageFile) {
        imageUrl = await uploadImage(form.imageFile);
      }

      await createItem({
        name: form.name,
        price: Number(form.price),
        image: imageUrl,
        category: form.category,
        description: form.description || undefined,
      });
      const list = await getAllItems();
      setItems(list);
      setModal(null);
    } catch (err) {
      setError(err?.message || "Failed to create item.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      // Upload image if a file was selected
      let imageUrl = form.image;
      if (form.imageFile) {
        imageUrl = await uploadImage(form.imageFile);
      }

      await updateItem(form.id, {
        name: form.name,
        price: Number(form.price),
        image: imageUrl,
        category: form.category,
        description: form.description || undefined,
      });
      const list = await getAllItems();
      setItems(list);
      setModal(null);
    } catch (err) {
      setError(err?.message || "Failed to update item.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this item?")) return;
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      alert(err?.message || "Failed to delete.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Items</h1>
        <button
          onClick={openCreate}
          className="bg-orange-400 text-white px-4 py-2 rounded-xl font-medium hover:bg-orange-500 transition"
        >
          Add item
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-400 border-t-transparent" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-gray-500 py-8">No items yet. Add one so users can see and select products.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">${item.price} · {item.category}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openEdit(item)}
                    className="text-sm text-orange-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => !saving && setModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {modal === "create" ? "Add item" : "Edit item"}
            </h2>
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <form
              onSubmit={modal === "create" ? handleCreate : handleUpdate}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload a product image (JPG, PNG, etc.)</p>
                  </div>
                  {imagePreview && (
                    <div className="flex-shrink-0">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                  rows={2}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-orange-400 text-white py-2 rounded-xl font-medium hover:bg-orange-500 disabled:bg-gray-400"
                >
                  {saving ? "Saving..." : modal === "create" ? "Create" : "Update"}
                </button>
                <button
                  type="button"
                  onClick={() => !saving && setModal(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
