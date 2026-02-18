"use client";

import Link from "next/link";

const CARDS = [
  { href: "/admin/items", label: "Manage Items", desc: "Create, edit, delete products (cat/dog)" },
  { href: "/admin/stores", label: "Manage Stores", desc: "Create, edit, delete store locations" },
  { href: "/admin/orders", label: "View Orders", desc: "See all checkouts and orders" },
  { href: "/admin/employees", label: "Manage Employees", desc: "Create, edit, delete employees and assign stores" },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 mb-6">Manage your platform: items, stores, orders, and employees.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {CARDS.map(({ href, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="block bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-orange-300 hover:shadow transition"
          >
            <h2 className="font-semibold text-gray-900">{label}</h2>
            <p className="text-sm text-gray-500 mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
