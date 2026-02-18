"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useUserProfile } from "@/lib/hooks/useUserProfile";
import {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "@/lib/employees";

const ROLES = ["employee", "manager", "admin"];

export default function AdminEmployeesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, isLoading: profileLoading } = useUserProfile(user?.uid || null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    storeId: "store1",
    role: "employee",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!profileLoading && !isAdmin) {
      router.replace("/");
      return;
    }
  }, [user, profileLoading, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    getAllEmployees()
      .then((list) => {
        if (!cancelled) setEmployees(list);
      })
      .catch(() => {
        if (!cancelled) setEmployees([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [isAdmin]);

  const openCreate = () => {
    setForm({
      email: "",
      password: "",
      name: "",
      storeId: "store1",
      role: "employee",
      isActive: true,
    });
    setModal("create");
    setError("");
  };

  const openEdit = (emp) => {
    setForm({
      id: emp.id,
      email: emp.email,
      password: "",
      name: emp.name,
      storeId: emp.storeId,
      role: emp.role,
      isActive: emp.isActive,
    });
    setModal("edit");
    setError("");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await createEmployee({
        email: form.email,
        password: form.password,
        name: form.name,
        storeId: form.storeId,
        role: form.role,
      });
      const list = await getAllEmployees();
      setEmployees(list);
      setModal(null);
    } catch (err) {
      setError(err?.message || "Failed to create employee.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const updates = {
        name: form.name,
        storeId: form.storeId,
        role: form.role,
        isActive: form.isActive,
        email: form.email,
      };
      if (form.password) updates.password = form.password;
      await updateEmployee(form.id, updates);
      const list = await getAllEmployees();
      setEmployees(list);
      setModal(null);
    } catch (err) {
      setError(err?.message || "Failed to update employee.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this employee?")) return;
    try {
      await deleteEmployee(id);
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(err?.message || "Failed to delete.");
    }
  };

  if (!user || profileLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Zoomies" width={36} height={36} />
            <span className="font-semibold text-gray-900">Admin – Employees</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-orange-500 hover:underline"
          >
            ← Back to store
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 pb-8">
        <div className="flex justify-between items-center mt-2 mb-4">
          <h1 className="text-xl font-bold text-gray-900">Employees</h1>
          <button
            onClick={openCreate}
            className="bg-orange-400 text-white px-4 py-2 rounded-xl font-medium hover:bg-orange-500 transition"
          >
            Add employee
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-400 border-t-transparent" />
          </div>
        ) : employees.length === 0 ? (
          <p className="text-gray-500 py-8">No employees yet. Add one to get started.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Name</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Email</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Store</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Role</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700 w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{emp.name}</td>
                    <td className="px-4 py-3 text-sm">{emp.email}</td>
                    <td className="px-4 py-3 text-sm">{emp.storeId}</td>
                    <td className="px-4 py-3 text-sm">{emp.role}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          emp.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {emp.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => openEdit(emp)}
                        className="text-orange-500 hover:underline mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Create / Edit modal */}
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
              {modal === "create" ? "Add employee" : "Edit employee"}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                  readOnly={modal === "edit"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {modal === "edit" && "(leave blank to keep current)"}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required={modal === "create"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store ID</label>
                <input
                  type="text"
                  value={form.storeId}
                  onChange={(e) => setForm((f) => ({ ...f, storeId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              {modal === "edit" && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    Active
                  </label>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-orange-400 text-white py-2 rounded-xl font-medium hover:bg-orange-500 transition disabled:bg-gray-400"
                >
                  {saving ? "Saving..." : modal === "create" ? "Create" : "Update"}
                </button>
                <button
                  type="button"
                  onClick={() => !saving && setModal(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-medium hover:bg-gray-50"
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
