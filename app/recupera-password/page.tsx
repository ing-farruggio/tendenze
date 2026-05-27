"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/app/components/Navbar";

export default function RecuperaPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!email) { setError("Inserisci la tua email."); return; }
        setLoading(true);
        setError("");
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/nuova-password`,
        });
        setLoading(false);
        if (error) setError(error.message);
        else setSent(true);
    };

    return (
        <main style={{ fontFamily: "var(--font-jost), sans-serif", background: "#faf8f5", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 24px" }}>
                <div style={{ width: "100%", maxWidth: 420 }}>
                    <div style={{ textAlign: "center", marginBottom: 48 }}>
                        <div style={{ fontSize: 10, fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 16 }}>Account</div>
                        <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 40, fontWeight: 300, color: "#2a2520" }}>Password dimenticata</h1>
                    </div>

                    {sent ? (
                        <div style={{ background: "white", border: "1px solid rgba(184,154,106,0.15)", padding: 40, textAlign: "center" }}>
                            <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 28, fontWeight: 300, color: "#2a2520", marginBottom: 16 }}>Email inviata</div>
                            <p style={{ fontSize: 13, fontWeight: 300, color: "#9e8c78", lineHeight: 1.8, marginBottom: 24 }}>
                                Controlla la tua casella email. Ti abbiamo inviato un link per reimpostare la password.
                            </p>
                            <a href="/login" style={{ fontSize: 11, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", color: "#b89a6a", textDecoration: "none" }}>
                                Torna al login →
                            </a>
                        </div>
                    ) : (
                        <div style={{ background: "white", border: "1px solid rgba(184,154,106,0.15)", padding: 40 }}>
                            <p style={{ fontSize: 13, fontWeight: 300, color: "#9e8c78", lineHeight: 1.8, marginBottom: 28 }}>
                                Inserisci la tua email e ti invieremo un link per reimpostare la password.
                            </p>
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: "block", fontSize: 10, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", color: "#7a7060", marginBottom: 8 }}>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="la@tuaemail.it"
                                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                                    style={{ width: "100%", padding: "12px 16px", border: "1px solid rgba(184,154,106,0.2)", background: "#faf8f5", fontSize: 13, fontWeight: 300, outline: "none", fontFamily: "var(--font-jost), sans-serif", boxSizing: "border-box" as const }}
                                />
                            </div>

                            {error && (
                                <div style={{ background: "rgba(201,122,106,0.1)", border: "1px solid rgba(201,122,106,0.2)", color: "#c97a6a", padding: "12px 16px", fontSize: 12, marginBottom: 20 }}>
                                    {error}
                                </div>
                            )}

                            <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "16px", background: loading ? "#c9b99a" : "#2a2520", color: "#f5f0ea", border: "none", fontSize: 11, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", marginBottom: 20 }}>
                                {loading ? "Invio in corso..." : "Invia link di recupero"}
                            </button>

                            <div style={{ textAlign: "center", fontSize: 12, fontWeight: 300, color: "#9e8c78" }}>
                                Ricordi la password?{" "}
                                <a href="/login" style={{ color: "#b89a6a", textDecoration: "none" }}>Accedi</a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}