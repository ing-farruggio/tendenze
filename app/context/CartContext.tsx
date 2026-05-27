"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface CartItem {
    id: string;
    name: string;
    price: number;
    discounted_price: number | null;
    image: string;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, "quantity">) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    total: number;
    count: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [cartKey, setCartKey] = useState<string>("tendenze_cart_guest");

    // Quando cambia l'utente, carica il carrello giusto
    useEffect(() => {
        const loadCart = async () => {
            const { data } = await supabase.auth.getUser();
            const key = data.user ? `tendenze_cart_${data.user.id}` : "tendenze_cart_guest";
            setCartKey(key);
            const saved = localStorage.getItem(key);
            setItems(saved ? JSON.parse(saved) : []);
        };

        loadCart();

        // Ascolta i cambiamenti di sessione (login/logout)
        const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const key = session?.user ? `tendenze_cart_${session.user.id}` : "tendenze_cart_guest";
            setCartKey(key);
            const saved = localStorage.getItem(key);
            setItems(saved ? JSON.parse(saved) : []);
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    // Salva carrello ogni volta che cambia
    useEffect(() => {
        localStorage.setItem(cartKey, JSON.stringify(items));
    }, [items, cartKey]);

    const addItem = (item: Omit<CartItem, "quantity">) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) { removeItem(id); return; }
        setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
    };

    const clearCart = () => setItems([]);

    const total = items.reduce((sum, i) => sum + (i.discounted_price ?? i.price) * i.quantity, 0);
    const count = items.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}