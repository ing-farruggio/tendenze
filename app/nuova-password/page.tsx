"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

export default function NuovaPassword() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        supabase.auth.onAuthStateChange((event) => {
            if (event === "PASSWORD_RECOVERY") {
                // utente autenticato tramite link email
            }
        });
    }, []);

    const handleSubmit = async () => {
        if (password !== confirm) { setError("Le password non coincidono."); return; }
        if (password.length < 6) { setError("La password deve essere di almeno 6 caratteri."); return; }
        setLoading(true);
        setError("");
        const { error } = await supabase.auth.updateUser({ password });
        setLoading(false);
        if (error) setError(error.message);
        else router.replace("/login");
    };

    return (
        <main style={{ fontFamily: "var(--font-jost), sans-serif", background: "#faf8f5", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 24px" }}>
                <div style={{ width: "100%", maxWidth: 420 }}>
                    <div style={{ textAlign: "center", marginBottom: 48 }}>
                        <div style={{ fontSize: 10, fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 16 }}>Account</div>
                        <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 40, fontWeight: 300, color: "#2a2520" }}>Nuova password</h1>
                    </div>

                    <div style={{ background: "white", border: "1px solid rgba(184,154,106,0.15)", padding: 40 }}>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: "block", fontSize: 10, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", color: "#7a7060", marginBottom: 8 }}>Nuova password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimo 6 caratteri"
                                   style={{ width: "100%", padding: "12px 16px", border: "1px solid rgba(184,154,106,0.2)", background: "#faf8f5", fontSize: 13, fontWeight: 300, outline: "none", fontFamily: "var(--font-jost), sans-serif", boxSizing: "border-box" as const }} />
                        </div>
                        <div style={{ marginBottom: 28 }}>
                            <label style={{ display: "block", fontSize: 10, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", color: "#7a7060", marginBottom: 8 }}>Conferma password</label>
                            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Ripeti la password"
                                   style={{ width: "100%", padding: "12px 16px", border: "1px solid rgba(184,154,106,0.2)", background: "#faf8f5", fontSize: 13, fontWeight: 300, outline: "none", fontFamily: "var(--font-jost), sans-serif", boxSizing: "border-box" as const }} />
                        </div>

                        {error && (
                            <div style={{ background: "rgba(201,122,106,0.1)", border: "1px solid rgba(201,122,106,0.2)", color: "#c97a6a", padding: "12px 16px", fontSize: 12, marginBottom: 20 }}>
                                {error}
                            </div>
                        )}

                        <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "16px", background: loading ? "#c9b99a" : "#2a2520", color: "#f5f0ea", border: "none", fontSize: 11, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer" }}>
                            {loading ? "Salvataggio..." : "Imposta nuova password"}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}