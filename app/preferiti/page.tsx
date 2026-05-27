"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/app/components/Navbar";
import { useCart } from "@/app/context/CartContext";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    discounted_price: number | null;
    category_main: string;
    category_gender: string;
    images: string[];
    stock: number;
}

export default function PreferitivPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const { addItem } = useCart();

    useEffect(() => {
        const load = async () => {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) {
                window.location.href = "/login";
                return;
            }
            setUserId(userData.user.id);
            const { data: favs } = await supabase
                .from("favorites")
                .select("product_id, products(*)")
                .eq("user_id", userData.user.id);
            if (favs) {
                setProducts(favs.map((f: any) => f.products).filter(Boolean));
            }
            setLoading(false);
        };
        load();
    }, []);

    const removeFavorite = async (productId: string) => {
        if (!userId) return;
        await supabase.from("favorites").delete()
            .eq("user_id", userId).eq("product_id", productId);
        setProducts(prev => prev.filter(p => p.id !== productId));
    };

    return (
        <main style={{ fontFamily: "var(--font-jost), sans-serif", background: "#faf8f5", minHeight: "100vh" }}>
            <Navbar />

            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 72px" }}>
                <div style={{ marginBottom: 48 }}>
                    <div style={{ fontSize: 10, fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 12 }}>La tua lista</div>
                    <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 48, fontWeight: 300, color: "#2a2520" }}>
                        Preferiti
                    </h1>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "80px 0", color: "#9e8c78", fontSize: 13 }}>Caricamento...</div>
                ) : products.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "80px 0" }}>
                        <div style={{ fontSize: 64, marginBottom: 24, opacity: 0.2 }}>♡</div>
                        <p style={{ fontSize: 13, fontWeight: 300, color: "#9e8c78", marginBottom: 32 }}>Non hai ancora prodotti nei preferiti.</p>
                        <a href="/prodotti" style={{ background: "#2a2520", color: "#f5f0ea", padding: "16px 40px", fontSize: 11, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", textDecoration: "none" }}>
                            Scopri i prodotti
                        </a>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }}>
                        {products.map(product => (
                            <div key={product.id}>
                                <a href={`/prodotti/${product.id}`} style={{ textDecoration: "none" }}>
                                    <div style={{ background: "#e8ddd0", aspectRatio: "3/4", overflow: "hidden", marginBottom: 16, position: "relative" }}>
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                                                 onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                                                 onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                                            />
                                        ) : (
                                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, opacity: 0.3 }}>◇</div>
                                        )}
                                    </div>
                                    <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 18, fontWeight: 300, color: "#2a2520", marginBottom: 4 }}>{product.name}</div>
                                    <div style={{ fontSize: 11, fontWeight: 300, color: "#9e8c78", marginBottom: 10 }}>{product.category_main}</div>
                                    <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 20, fontWeight: 300, color: "#2a2520", marginBottom: 12 }}>
                                        € {product.discounted_price ?? product.price}
                                        {product.discounted_price && (
                                            <span style={{ fontSize: 14, color: "#c9b99a", textDecoration: "line-through", marginLeft: 8 }}>€ {product.price}</span>
                                        )}
                                    </div>
                                </a>
                                <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                        onClick={() => addItem({ id: product.id, name: product.name, price: product.price, discounted_price: product.discounted_price, image: product.images?.[0] ?? "" })}
                                        disabled={product.stock === 0}
                                        style={{ flex: 1, padding: "12px", background: "#2a2520", color: "#f5f0ea", border: "none", fontSize: 10, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", cursor: product.stock === 0 ? "not-allowed" : "pointer" }}
                                    >
                                        {product.stock === 0 ? "Esaurito" : "Aggiungi al carrello"}
                                    </button>
                                    <button
                                        onClick={() => removeFavorite(product.id)}
                                        style={{ width: 44, background: "none", border: "1px solid rgba(201,122,106,0.3)", color: "#c97a6a", cursor: "pointer", fontSize: 16 }}
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}