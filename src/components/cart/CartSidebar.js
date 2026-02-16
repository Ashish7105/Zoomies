"use client";

import { Plus, Minus, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/contexts/CartContext";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ IMPORT ROUTER

export default function CartSidebar() {
    const router = useRouter(); // ✅ INIT ROUTER

    const pathname = usePathname();
    const {
        cart,
        isCartOpen,
        setIsCartOpen,
        updateQty,
        removeItem,
        subtotal,
    } = useCart();

    useEffect(() => {
        if (cart.length === 0 && pathname === "/checkout") {
            router.push("/items");
        }
    }, [cart, pathname]);


    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity ${isCartOpen ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
                onClick={() => setIsCartOpen(false)}
            />

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50
        transform transition-transform duration-300 flex flex-col
        ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Header */}
                <div className="p-5 flex justify-between border-b">
                    <h2 className="font-bold text-lg">Your Cart</h2>
                    <button onClick={() => setIsCartOpen(false)}>
                        <X />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="p-5 space-y-4 flex-1 overflow-y-auto">
                    {cart.length === 0 ? (
                        <p className="text-gray-500">Cart is empty</p>
                    ) : (
                        cart.map((item) => (
                            <div
                                key={item.id}
                                className="flex gap-3 items-center border rounded-xl p-3"
                            >
                                <img
                                    src={item.image}
                                    className="w-14 h-14 object-cover rounded-lg"
                                />

                                <div className="flex-1">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-500">
                                        ${item.price} × {item.quantity}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Minus */}
                                    <button onClick={() => updateQty(item.id, -1)}>
                                        <Minus size={16} />
                                    </button>

                                    <span>{item.quantity}</span>

                                    {/* Plus (Giveaway limit) */}
                                    <button
                                        onClick={() => updateQty(item.id, 1)}
                                        disabled={item.quantity >= 1}
                                        className={
                                            item.quantity >= 1
                                                ? "opacity-40 cursor-not-allowed"
                                                : ""
                                        }
                                    >
                                        <Plus size={16} />
                                    </button>

                                    {/* Remove */}
                                    <button onClick={() => removeItem(item.id)}>
                                        <Trash2 size={16} className="text-red-500" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t">
                    <p className="font-bold text-lg">
                        Subtotal: ${subtotal.toFixed(2)}
                    </p>

                    <button
                        onClick={() => {
                            setIsCartOpen(false);

                            setTimeout(() => {
                                router.push("/checkout");
                            }, 100);
                        }}
                        disabled={cart.length === 0}
                        className={`w-full mt-3 py-3 rounded-xl ${cart.length === 0
                            ? "bg-gray-300 text-gray-500"
                            : "bg-orange-400 text-white"
                            }`}
                    >
                        Checkout
                    </button>

                </div>
            </div>
        </>
    );
}
