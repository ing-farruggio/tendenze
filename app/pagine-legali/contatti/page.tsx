"use client";
import { useState } from "react";
import Navbar from "@/app/components/Navbar";

export default function Contatti() {
    const [form, setForm] = useState({ nome: "", email: "", oggetto: "", messaggio: "" });
    const [sent, setSent] = useState(false);

    const handleSubmit = () => {
        if (!form.nome || !form.email || !form.messaggio) return;
        setSent(true);
    };

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "12px 16px",
        border: "1px solid rgba(184,154,106,0.2)", background: "#faf8f5",
        fontSize: 13, fontWeight: 300, outline: "none",
        fontFamily: "var(--font-jost), sans-serif", boxSizing: "border-box", color: "#2a2520",
    };

    const labelStyle: React.CSSProperties = {
        display: "block", fontSize: 10, fontWeight: 300,
        letterSpacing: "0.3em", textTransform: "uppercase", color: "#9e8c78", marginBottom: 8,
    };

    return (
        <main style={{ fontFamily: "var(--font-jost), sans-serif", background: "#faf8f5", minHeight: "100vh" }}>
            <Navbar />
            <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px 24px" }}>
                <div style={{ marginBottom: 48 }}>
                    <div style={{ fontSize: 10, fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 12 }}>Siamo qui per te</div>
                    <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 40, fontWeight: 300, color: "#2a2520" }}>Contatti</h1>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginBottom: 64 }}>
                    <div>
                        {[
                            { label: "Email", value: "info@tendenze.it" },
                            { label: "Assistenza ordini", value: "assistenza@tendenze.it" },
                            { label: "Privacy", value: "privacy@tendenze.it" },
                            { label: "Orari", value: "Lun-Ven 9:00-18:00" },
                        ].map(item => (
                            <div key={item.label} style={{ marginBottom: 24 }}>
                                <div style={{ fontSize: 10, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 6 }}>{item.label}</div>
                                <div style={{ fontSize: 13, fontWeight: 300, color: "#2a2520" }}>{item.value}</div>
                            </div>
                        ))}
                        <div style={{ marginTop: 32, paddingTop: 32, borderTop: "1px solid rgba(184,154,106,0.15)" }}>
                            <div style={{ fontSize: 10, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 12 }}>Dati aziendali</div>
                            <div style={{ fontSize: 12, fontWeight: 300, color: "#9e8c78", lineHeight: 1.9 }}>
                                Tendenze Store<br />
                                P.IVA: [da inserire]<br />
                                Sede legale: [da inserire]<br />
                                REA: [da inserire]
                            </div>
                        </div>
                    </div>

                    <div style={{ background: "white", border: "1px solid rgba(184,154,106,0.15)", padding: 32 }}>
                        {sent ? (
                            <div style={{ textAlign: "center", padding: "40px 0" }}>
                                <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 28, fontWeight: 300, color: "#2a2520", marginBottom: 12 }}>Messaggio inviato</div>
                                <div style={{ fontSize: 12, fontWeight: 300, color: "#9e8c78" }}>Ti risponderemo entro 24 ore lavorative.</div>
                            </div>
                        ) : (
                            <>
                                <div style={{ fontSize: 10, fontWeight: 400, letterSpacing: "0.3em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 24 }}>Scrivici</div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                                    <div>
                                        <label style={labelStyle}>Nome</label>
                                        <input type="text" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Email</label>
                                        <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={inputStyle} />
                                    </div>
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={labelStyle}>Oggetto</label>
                                    <input type="text" value={form.oggetto} onChange={e => setForm(p => ({ ...p, oggetto: e.target.value }))} style={inputStyle} />
                                </div>
                                <div style={{ marginBottom: 24 }}>
                                    <label style={labelStyle}>Messaggio</label>
                                    <textarea value={form.messaggio} onChange={e => setForm(p => ({ ...p, messaggio: e.target.value }))} rows={5} style={{ ...inputStyle, resize: "vertical" }} />
                                </div>
                                <button onClick={handleSubmit} style={{ width: "100%", padding: "14px", background: "#2a2520", color: "#f5f0ea", border: "none", fontSize: 11, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", cursor: "pointer" }}>
                                    Invia messaggio
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}