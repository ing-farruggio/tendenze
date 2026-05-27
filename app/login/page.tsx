"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setLoading(true);
        setError("");
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setError("Email o password non corretti.");
            setLoading(false);
        } else {
            const params = new URLSearchParams(window.location.search);
            const redirect = params.get("redirect") ?? "/";
            router.replace(redirect);
        }
    };

    return (
        <main style={{ fontFamily: "var(--font-jost), sans-serif", background: "#faf8f5", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
                <div style={{ width: "100%", maxWidth: 420 }}>
                    <div style={{ textAlign: "center", marginBottom: 40 }}>
                        <div style={{ fontSize: 10, fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 16 }}>Bentornato</div>
                        <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 36, fontWeight: 300, color: "#2a2520" }}>Accedi</h1>
                    </div>
                    <div style={{ background: "white", border: "1px solid rgba(184,154,106,0.15)", padding: "32px 24px" }}>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: "block", fontSize: 10, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", color: "#7a7060", marginBottom: 8 }}>Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="la@tuaemail.it" onKeyDown={e => e.key === "Enter" && handleLogin()} style={{ width: "100%", padding: "12px 16px", border: "1px solid rgba(184,154,106,0.2)", background: "#faf8f5", fontSize: 13, fontWeight: 300, outline: "none", fontFamily: "var(--font-jost), sans-serif", boxSizing: "border-box" as const }} />
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <label style={{ display: "block", fontSize: 10, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", color: "#7a7060", marginBottom: 8 }}>Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} style={{ width: "100%", padding: "12px 16px", border: "1px solid rgba(184,154,106,0.2)", background: "#faf8f5", fontSize: 13, fontWeight: 300, outline: "none", fontFamily: "var(--font-jost), sans-serif", boxSizing: "border-box" as const }} />
                        </div>
                        <div style={{ textAlign: "right", marginBottom: 24 }}>
                            <a href="/recupera-password" style={{ fontSize: 11, fontWeight: 300, color: "#b89a6a", textDecoration: "none" }}>Password dimenticata?</a>
                        </div>
                        {error && <div style={{ background: "rgba(201,122,106,0.1)", border: "1px solid rgba(201,122,106,0.2)", color: "#c97a6a", padding: "12px 16px", fontSize: 12, marginBottom: 16 }}>{error}</div>}
                        <button onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: "14px", background: loading ? "#c9b99a" : "#2a2520", color: "#f5f0ea", border: "none", fontSize: 11, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", marginBottom: 16 }}>
                            {loading ? "Accesso in corso..." : "Accedi"}
                        </button>
                        <div style={{ textAlign: "center", fontSize: 12, fontWeight: 300, color: "#9e8c78" }}>
                            Non hai un account?{" "}<a href="/registrati" style={{ color: "#b89a6a", textDecoration: "none" }}>Registrati</a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}