"use client";

import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    /* Load cart */
    useEffect(() => {
        const saved = localStorage.getItem("cart");
        if (saved) setCart(JSON.parse(saved));
    }, []);

    /* Save cart */
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart((prev) => {
            // 🚫 Block if already one item exists
            if (prev.length >= 1) {
                alert("Giveaway allows only 1 item");
                return prev;
            }

            return [...prev, { ...product, quantity: 1 }];
        });
    };


    const updateQty = (id, delta) => {
        setCart((prev) =>
            prev
                .map((item) => {
                    if (item.id !== id) return item;

                    const newQty = item.quantity + delta;

                    // 🚫 Prevent > 1
                    if (newQty > 1) {
                        alert("Only 1 quantity allowed");
                        return item;
                    }

                    return {
                        ...item,
                        quantity: Math.max(newQty, 0),
                    };
                })
                .filter((item) => item.quantity > 0)
        );
    };


    const removeItem = (id) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    const subtotal = cart.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                cart,
                isCartOpen,
                setIsCartOpen,
                addToCart,
                updateQty,
                removeItem,
                totalItems,
                subtotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
