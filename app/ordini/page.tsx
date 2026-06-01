"use client";
import { useState } from "react";
import Navbar from "@/app/components/Navbar";

const ordini_fake = [
    {
        id: "ORD-2026-001",
        data: "28 Maggio 2026",
        stato: "Spedito",
        totale: 189.00,
        spedizione: "Gratuita",
        tracking: "IT123456789",
        prodotti: [
            { nome: "Collana Perle Barocche", categoria: "Gioielli", prezzo: 129.00, quantita: 1 },
            { nome: "Bracciale Dorato", categoria: "Bijoux", prezzo: 60.00, quantita: 1 },
        ]
    },
    {
        id: "ORD-2026-002",
        data: "12 Aprile 2026",
        stato: "Consegnato",
        totale: 245.00,
        spedizione: "Gratuita",
        tracking: "IT987654321",
        prodotti: [
            { nome: "Borsa Pelle Nera", categoria: "Accessori", prezzo: 245.00, quantita: 1 },
        ]
    },
    {
        id: "ORD-2026-003",
        data: "3 Marzo 2026",
        stato: "In lavorazione",
        totale: 78.90,
        spedizione: "9.90",
        tracking: null,
        prodotti: [
            { nome: "Orecchini Perla", categoria: "Gioielli", prezzo: 69.00, quantita: 1 },
        ]
    },
];

const statoColor: Record<string, string> = {
    "In lavorazione": "#b89a6a",
    "Spedito": "#4a7fa5",
    "Consegnato": "#5a8a6a",
    "Annullato": "#c97a6a",
};

const statoBg: Record<string, string> = {
    "In lavorazione": "rgba(184,154,106,0.1)",
    "Spedito": "rgba(74,127,165,0.1)",
    "Consegnato": "rgba(90,138,106,0.1)",
    "Annullato": "rgba(201,122,106,0.1)",
};

const statoIcon: Record<string, string> = {
    "In lavorazione": "⟳",
    "Spedito": "→",
    "Consegnato": "✓",
    "Annullato": "✕",
};

export default function OrdiniPage() {
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <main style={{ fontFamily: "var(--font-jost), sans-serif", background: "#faf8f5", minHeight: "100vh" }}>
            <Navbar />

            <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>

                <div style={{ marginBottom: 40 }}>
                    <div style={{ fontSize: 10, fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 12 }}>Il tuo storico</div>
                    <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 300, color: "#2a2520" }}>I miei ordini</h1>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {ordini_fake.map(ordine => (
                        <div key={ordine.id} style={{ background: "white", border: "1px solid rgba(184,154,106,0.15)", overflow: "hidden" }}>

                            {/* HEADER */}
                            <div
                                onClick={() => setExpanded(expanded === ordine.id ? null : ordine.id)}
                                style={{ padding: "20px 24px", cursor: "pointer" }}
                            >
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                    <div style={{ fontSize: 13, fontWeight: 400, color: "#2a2520", letterSpacing: "0.05em" }}>{ordine.id}</div>
                                    <span style={{ fontSize: 16, color: "#9e8c78", transform: expanded === ordine.id ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>›</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                                        <div style={{ fontSize: 11, fontWeight: 300, color: "#9e8c78" }}>{ordine.data}</div>
                                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: statoBg[ordine.stato], padding: "4px 10px", borderRadius: 20 }}>
                                            <span style={{ fontSize: 11, color: statoColor[ordine.stato] }}>{statoIcon[ordine.stato]}</span>
                                            <span style={{ fontSize: 10, fontWeight: 400, letterSpacing: "0.15em", textTransform: "uppercase", color: statoColor[ordine.stato] }}>{ordine.stato}</span>
                                        </div>
                                    </div>
                                    <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 20, fontWeight: 300, color: "#2a2520" }}>€ {ordine.totale.toFixed(2)}</div>
                                </div>
                            </div>

                            {/* DETTAGLIO */}
                            {expanded === ordine.id && (
                                <div style={{ borderTop: "1px solid rgba(184,154,106,0.1)", padding: "20px 24px" }}>

                                    {/* PRODOTTI */}
                                    <div style={{ marginBottom: 20 }}>
                                        {ordine.prodotti.map((p, i) => (
                                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, paddingBottom: 16, marginBottom: 16, borderBottom: i < ordine.prodotti.length - 1 ? "1px solid rgba(184,154,106,0.08)" : "none" }}>
                                                <div style={{ width: 56, height: 72, background: "#e8ddd0", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, opacity: 0.4 }}>◇</div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 17, fontWeight: 300, color: "#2a2520", marginBottom: 2 }}>{p.nome}</div>
                                                    <div style={{ fontSize: 11, fontWeight: 300, color: "#9e8c78", marginBottom: 4 }}>{p.categoria}</div>
                                                    <div style={{ fontSize: 11, fontWeight: 300, color: "#9e8c78" }}>Quantità: {p.quantita}</div>
                                                </div>
                                                <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 18, fontWeight: 300, color: "#2a2520" }}>€ {p.prezzo.toFixed(2)}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* RIEPILOGO */}
                                    <div style={{ background: "#faf8f5", padding: "16px 20px", marginBottom: 16 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 300, color: "#9e8c78", marginBottom: 8 }}>
                                            <span>Spedizione</span><span>{ordine.spedizione === "Gratuita" ? "Gratuita" : `€ ${ordine.spedizione}`}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 400, color: "#2a2520" }}>
                                            <span>Totale</span>
                                            <span style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 20 }}>€ {ordine.totale.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* TRACKING E AZIONI */}
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                                        {ordine.tracking ? (
                                            <div style={{ fontSize: 11, fontWeight: 300, color: "#9e8c78" }}>
                                                Tracking: <span style={{ color: "#b89a6a", fontWeight: 400 }}>{ordine.tracking}</span>
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: 11, fontWeight: 300, color: "#9e8c78" }}>Tracking non ancora disponibile</div>
                                        )}
                                        <div style={{ display: "flex", gap: 10 }}>
                                            {ordine.stato === "Consegnato" && (
                                                <button style={{ padding: "10px 20px", background: "none", border: "1px solid rgba(184,154,106,0.3)", color: "#b89a6a", fontSize: 10, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}>
                                                    Reso
                                                </button>
                                            )}
                                            {ordine.stato === "In lavorazione" && (
                                                <button style={{ padding: "10px 20px", background: "none", border: "1px solid rgba(201,122,106,0.3)", color: "#c97a6a", fontSize: 10, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}>
                                                    Annulla
                                                </button>
                                            )}
                                            <button style={{ padding: "10px 20px", background: "none", border: "1px solid rgba(42,37,32,0.2)", color: "#9e8c78", fontSize: 10, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}>
                                                Assistenza
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}