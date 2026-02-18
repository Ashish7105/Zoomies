"use client";

import { useState, useEffect } from "react";
import {
  getAllStores,
  createStore,
  updateStore,
  deleteStore,
} from "@/lib/stores";

export default function AdminStoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", address: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getAllStores()
      .then((list) => { if (!cancelled) setStores(list); })
      .catch(() => { if (!cancelled) setStores([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const openCreate = () => {
    setForm({ name: "", address: "", phone: "" });
    setModal("create");
    setError("");
  };

  const openEdit = (store) => {
    setForm({
      id: store.id,
      name: store.name || "",
      address: store.address || "",
      phone: store.phone || "",
    });
    setModal("edit");
    setError("");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await createStore({ name: form.name, address: form.address, phone: form.phone });
      const list = await getAllStores();
      setStores(list);
      setModal(null);
    } catch (err) {
      setError(err?.message || "Failed to create store.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateStore(form.id, { name: form.name, address: form.address, phone: form.phone });
      const list = await getAllStores();
      setStores(list);
      setModal(null);
    } catch (err) {
      setError(err?.message || "Failed to update store.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this store?")) return;
    try {
      await deleteStore(id);
      setStores((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err?.message || "Failed to delete.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
        <button
          onClick={openCreate}
          className="bg-orange-400 text-white px-4 py-2 rounded-xl font-medium hover:bg-orange-500 transition"
        >
          Add store
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-400 border-t-transparent" />
        </div>
      ) : stores.length === 0 ? (
        <p className="text-gray-500 py-8">No stores yet. Add one for pickup locations.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Address</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">Phone</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700 w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stores.map((store) => (
                <tr key={store.id}>
                  <td className="px-4 py-3 text-sm">{store.name}</td>
                  <td className="px-4 py-3 text-sm">{store.address || "—"}</td>
                  <td className="px-4 py-3 text-sm">{store.phone || "—"}</td>
                  <td className="px-4 py-3 text-sm">
                    <button onClick={() => openEdit(store)} className="text-orange-500 hover:underline mr-2">Edit</button>
                    <button onClick={() => handleDelete(store.id)} className="text-red-500 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              {modal === "create" ? "Add store" : "Edit store"}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
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
                <button type="button" onClick={() => !saving && setModal(null)} className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50">
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
