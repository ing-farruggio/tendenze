"use client";
import { useCart } from "@/app/context/CartContext";
import Navbar from "@/app/components/Navbar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";


export default function CarrelloPage() {
    const { items, removeItem, updateQuantity, total, count } = useCart();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
    }, []);

    return (
        <main style={{ fontFamily: "var(--font-jost), sans-serif", background: "#faf8f5", minHeight: "100vh" }}>

            <Navbar />

            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 72px" }}>

                {/* HEADER */}
                <div style={{ marginBottom: 48 }}>
                    <div style={{ fontSize: 10, fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 12 }}>Il tuo acquisto</div>
                    <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 48, fontWeight: 300, color: "#2a2520" }}>
                        Carrello {count > 0 && <span style={{ fontSize: 24, color: "#9e8c78" }}>({count} {count === 1 ? "articolo" : "articoli"})</span>}
                    </h1>
                </div>

                {items.length === 0 ? (
                    /* CARRELLO VUOTO */
                    <div style={{ textAlign: "center", padding: "80px 0" }}>
                        <div style={{ fontSize: 64, marginBottom: 24, opacity: 0.2 }}>◇</div>
                        <p style={{ fontSize: 13, fontWeight: 300, color: "#9e8c78", marginBottom: 32 }}>Il tuo carrello è vuoto.</p>
                        <a href="/prodotti" style={{ background: "#2a2520", color: "#f5f0ea", padding: "16px 40px", fontSize: 11, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", textDecoration: "none" }}>
                            Scopri i prodotti
                        </a>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 64 }}>

                        {/* LISTA PRODOTTI */}
                        <div>
                            {items.map((item, index) => (
                                <div key={item.id} style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 24, paddingBottom: 32, marginBottom: 32, borderBottom: index < items.length - 1 ? "1px solid rgba(184,154,106,0.15)" : "none" }}>
                                    {/* FOTO */}
                                    <a href={`/prodotti/${item.id}`}>
                                        <div style={{ background: "#e8ddd0", aspectRatio: "3/4", overflow: "hidden" }}>
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            ) : (
                                                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, opacity: 0.3 }}>◇</div>
                                            )}
                                        </div>
                                    </a>

                                    {/* INFO */}
                                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                        <div>
                                            <a href={`/prodotti/${item.id}`} style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 22, fontWeight: 300, color: "#2a2520", textDecoration: "none", display: "block", marginBottom: 8 }}>
                                                {item.name}
                                            </a>
                                            <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 20, fontWeight: 300, color: "#2a2520", marginBottom: 24 }}>
                                                € {item.discounted_price ?? item.price}
                                                {item.discounted_price && (
                                                    <span style={{ fontSize: 14, color: "#c9b99a", textDecoration: "line-through", marginLeft: 8 }}>€ {item.price}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            {/* QUANTITÀ */}
                                            <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(184,154,106,0.2)" }}>
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: 36, height: 36, background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#2a2520", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                                                <span style={{ width: 40, textAlign: "center", fontSize: 13, fontWeight: 300, color: "#2a2520" }}>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: 36, height: 36, background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#2a2520", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                                            </div>

                                            {/* TOTALE RIGA */}
                                            <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 20, fontWeight: 300, color: "#2a2520" }}>
                                                € {((item.discounted_price ?? item.price) * item.quantity).toFixed(2)}
                                            </div>

                                            {/* RIMUOVI */}
                                            <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c97a6a" }}>
                                                Rimuovi
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <a href="/prodotti" style={{ fontSize: 11, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9e8c78", textDecoration: "none" }}>
                                ← Continua lo shopping
                            </a>
                        </div>

                        {/* RIEPILOGO */}
                        <div>
                            <div style={{ background: "white", border: "1px solid rgba(184,154,106,0.15)", padding: 32, position: "sticky", top: 100 }}>
                                <div style={{ fontSize: 10, fontWeight: 400, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 24 }}>Riepilogo ordine</div>

                                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 300, color: "#9e8c78" }}>
                                        <span>Subtotale</span>
                                        <span>€ {total.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 300, color: "#9e8c78" }}>
                                        <span>Spedizione</span>
                                        <span style={{ color: total >= 150 ? "#6db88a" : "#9e8c78" }}>{total >= 150 ? "Gratuita" : "€ 9.90"}</span>
                                    </div>
                                    {total < 150 && (
                                        <div style={{ fontSize: 11, fontWeight: 300, color: "#b89a6a", background: "rgba(184,154,106,0.08)", padding: "8px 12px", borderRadius: 4 }}>
                                            Aggiungi € {(150 - total).toFixed(2)} per la spedizione gratuita
                                        </div>
                                    )}
                                </div>

                                <div style={{ borderTop: "1px solid rgba(184,154,106,0.15)", paddingTop: 20, marginBottom: 24 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                        <span style={{ fontSize: 12, fontWeight: 300, letterSpacing: "0.1em", color: "#2a2520" }}>Totale</span>
                                        <span style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 28, fontWeight: 300, color: "#2a2520" }}>
                      € {(total >= 150 ? total : total + 9.90).toFixed(2)}
                    </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        if (user) {
                                            window.location.href = "/checkout";
                                        } else {
                                            window.location.href = "/login?redirect=/checkout";
                                        }
                                    }}
                                    style={{
                                        display: "block", width: "100%", textAlign: "center", padding: "18px",
                                        background: "#2a2520", color: "#f5f0ea", border: "none",
                                        fontSize: 11, fontWeight: 400, letterSpacing: "0.3em", textTransform: "uppercase",
                                        cursor: "pointer", marginBottom: 12, fontFamily: "var(--font-jost), sans-serif",
                                    }}
                                >
                                    Procedi al Checkout
                                </button>

                                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 20 }}>
                                    {[
                                        { icon: "🔒", text: "Pagamento sicuro e protetto" },
                                        { icon: "↩", text: "Resi gratuiti entro 30 giorni" },
                                    ].map(item => (
                                        <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 300, color: "#9e8c78" }}>
                                            <span>{item.icon}</span>
                                            <span>{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}