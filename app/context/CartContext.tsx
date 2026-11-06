"use client";
import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface CartItem {
    id: string;
    name: string;
    price: number;
    discounted_price: number | null;
    image: string;
    quantity: number;
    stock?: number;
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

const GUEST_KEY = "tendenze_cart_guest";
const CartContext = createContext<CartContextType | null>(null);

// I dati in localStorage sono modificabili dall'utente: una riga malformata
// (quantity stringa, price NaN, oggetto al posto dell'array) faceva esplodere
// il render del provider, che avvolge tutto il layout -> pagina bianca ovunque.
function sanitize(raw: string | null): CartItem[] {
    if (!raw) return [];
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { return []; }
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry): CartItem[] => {
        if (typeof entry !== "object" || entry === null) return [];
        const i = entry as Record<string, unknown>;
        if (typeof i.id !== "string" || !i.id) return [];
        if (!Number.isFinite(i.price)) return [];
        if (!Number.isInteger(i.quantity) || (i.quantity as number) < 1) return [];
        const stock = Number.isInteger(i.stock) ? (i.stock as number) : undefined;
        return [{
            id: i.id,
            name: typeof i.name === "string" ? i.name : "",
            price: i.price as number,
            discounted_price: Number.isFinite(i.discounted_price) ? (i.discounted_price as number) : null,
            image: typeof i.image === "string" ? i.image : "",
            quantity: stock !== undefined ? Math.min(i.quantity as number, Math.max(stock, 1)) : (i.quantity as number),
            ...(stock !== undefined ? { stock } : {}),
        }];
    });
}

function mergeCarts(base: CartItem[], incoming: CartItem[]): CartItem[] {
    const merged = [...base];
    for (const item of incoming) {
        const existing = merged.find(i => i.id === item.id);
        if (existing) {
            existing.quantity = capToStock(existing.quantity + item.quantity, existing.stock ?? item.stock);
        } else {
            merged.push({ ...item });
        }
    }
    return merged;
}

function capToStock(quantity: number, stock: number | undefined): number {
    if (stock === undefined) return quantity;
    return Math.max(1, Math.min(quantity, stock));
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [cartKey, setCartKey] = useState<string>(GUEST_KEY);
    // Finche' il primo caricamento non e' finito non dobbiamo scrivere nulla:
    // l'effetto di salvataggio girava prima di loadCart e azzerava il carrello
    // guest a ogni refresh.
    const hydrated = useRef(false);

    const applySession = useCallback((userId: string | undefined) => {
        const key = userId ? `tendenze_cart_${userId}` : GUEST_KEY;
        let next = sanitize(localStorage.getItem(key));

        // Login: il carrello creato da sloggato non va perso proprio nel punto
        // del funnel in cui obblighiamo l'utente ad autenticarsi.
        if (userId) {
            const guest = sanitize(localStorage.getItem(GUEST_KEY));
            if (guest.length > 0) {
                next = mergeCarts(next, guest);
                localStorage.removeItem(GUEST_KEY);
            }
        }

        setCartKey(key);
        setItems(next);
        hydrated.current = true;
    }, []);

    useEffect(() => {
        supabase.auth.getUser()
            .then(({ data }) => applySession(data.user?.id))
            .catch(() => applySession(undefined));

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            applySession(session?.user?.id);
        });

        return () => listener.subscription.unsubscribe();
    }, [applySession]);

    // Un'altra scheda puo' aver aggiornato lo stesso carrello: senza questo
    // listener la scheda stale riscriveva la chiave perdendo le modifiche.
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key !== cartKey) return;
            setItems(sanitize(e.newValue));
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [cartKey]);

    useEffect(() => {
        if (!hydrated.current) return;
        localStorage.setItem(cartKey, JSON.stringify(items));
    }, [items, cartKey]);

    const addItem = (item: Omit<CartItem, "quantity">) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id
                    ? { ...i, stock: item.stock ?? i.stock, quantity: capToStock(i.quantity + 1, item.stock ?? i.stock) }
                    : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (!Number.isFinite(quantity) || quantity <= 0) { removeItem(id); return; }
        const q = Math.floor(quantity);
        setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: capToStock(q, i.stock) } : i));
    };

    const clearCart = () => setItems([]);

    // Somma in centesimi interi: 13.03*10 + 19.70 dava 149.99999999999997,
    // mostrato come "150.00" ma trattato come sotto la soglia di spedizione.
    const totalCents = items.reduce(
        (sum, i) => sum + Math.round((i.discounted_price ?? i.price) * 100) * i.quantity,
        0
    );
    const total = totalCents / 100;
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
