"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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

            <nav style={{ padding: "24px 48px", borderBottom: "1px solid rgba(184,154,106,0.2)", background: "rgba(250,248,245,0.95)" }}>
                <a href="/" style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "24px", letterSpacing: "0.3em", color: "#2a2520", fontWeight: 300, textDecoration: "none" }}>
                    TEN<span style={{ color: "#b89a6a" }}>D</span>ENZE
                </a>
            </nav>

            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 24px" }}>
                <div style={{ width: "100%", maxWidth: 420 }}>

                    <div style={{ textAlign: "center", marginBottom: 48 }}>
                        <div style={{ fontSize: 10, fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 16 }}>Bentornato</div>
                        <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 40, fontWeight: 300, color: "#2a2520" }}>Accedi</h1>
                    </div>

                    <div style={{ background: "white", border: "1px solid rgba(184,154,106,0.15)", padding: 40 }}>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: "block", fontSize: 10, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", color: "#7a7060", marginBottom: 8 }}>Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="la@tuaemail.it"
                                   style={{ width: "100%", padding: "12px 16px", border: "1px solid rgba(184,154,106,0.2)", background: "#faf8f5", fontSize: 13, fontWeight: 300, outline: "none", fontFamily: "var(--font-jost), sans-serif", boxSizing: "border-box" }}
                                   onKeyDown={e => e.key === "Enter" && handleLogin()}
                            />
                        </div>

                        <div style={{ marginBottom: 8 }}>
                            <label style={{ display: "block", fontSize: 10, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", color: "#7a7060", marginBottom: 8 }}>Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                                   style={{ width: "100%", padding: "12px 16px", border: "1px solid rgba(184,154,106,0.2)", background: "#faf8f5", fontSize: 13, fontWeight: 300, outline: "none", fontFamily: "var(--font-jost), sans-serif", boxSizing: "border-box" as const }}
                                   onKeyDown={e => e.key === "Enter" && handleLogin()}
                            />
                        </div>
                        <div style={{ textAlign: "right", marginBottom: 32 }}>
                            <a href="/recupera-password" style={{ fontSize: 11, fontWeight: 300, color: "#b89a6a", textDecoration: "none", letterSpacing: "0.1em" }}>
                                Password dimenticata?
                            </a>
                        </div>

                        {error && (
                            <div style={{ background: "rgba(201,122,106,0.1)", border: "1px solid rgba(201,122,106,0.2)", color: "#c97a6a", padding: "12px 16px", fontSize: 12, marginBottom: 20 }}>
                                {error}
                            </div>
                        )}

                        <button onClick={handleLogin} disabled={loading} style={{
                            width: "100%", padding: "16px", background: loading ? "#c9b99a" : "#2a2520",
                            color: "#f5f0ea", border: "none", fontSize: 11, fontWeight: 400,
                            letterSpacing: "0.3em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer",
                            marginBottom: 20,
                        }}>
                            {loading ? "Accesso in corso..." : "Accedi"}
                        </button>

                        <div style={{ textAlign: "center", fontSize: 12, fontWeight: 300, color: "#9e8c78" }}>
                            Non hai un account?{" "}
                            <a href="/registrati" style={{ color: "#b89a6a", textDecoration: "none" }}>Registrati</a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}