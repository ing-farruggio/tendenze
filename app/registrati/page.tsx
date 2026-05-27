"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegistratiPage() {
    const router = useRouter();
    const [form, setForm] = useState({ nome: "", cognome: "", email: "", password: "", conferma: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRegister = async () => {
        if (!form.nome || !form.cognome || !form.email || !form.password) {
            setError("Compila tutti i campi."); return;
        }
        if (form.password !== form.conferma) {
            setError("Le password non coincidono."); return;
        }
        if (form.password.length < 6) {
            setError("La password deve essere di almeno 6 caratteri."); return;
        }
        setLoading(true);
        setError("");
        const { error } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
                data: { nome: form.nome, cognome: form.cognome },
            },
        });
        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push("/");
        }
    };

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "12px 16px",
        border: "1px solid rgba(184,154,106,0.2)", background: "#faf8f5",
        fontSize: 13, fontWeight: 300, outline: "none",
        fontFamily: "var(--font-jost), sans-serif", boxSizing: "border-box",
    };
    const labelStyle: React.CSSProperties = {
        display: "block", fontSize: 10, fontWeight: 300,
        letterSpacing: "0.3em", textTransform: "uppercase", color: "#7a7060", marginBottom: 8,
    };

    return (
        <main style={{ fontFamily: "var(--font-jost), sans-serif", background: "#faf8f5", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

            <nav style={{ padding: "24px 48px", borderBottom: "1px solid rgba(184,154,106,0.2)", background: "rgba(250,248,245,0.95)" }}>
                <a href="/" style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "24px", letterSpacing: "0.3em", color: "#2a2520", fontWeight: 300, textDecoration: "none" }}>
                    TEN<span style={{ color: "#b89a6a" }}>D</span>ENZE
                </a>
            </nav>

            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 24px" }}>
                <div style={{ width: "100%", maxWidth: 460 }}>

                    <div style={{ textAlign: "center", marginBottom: 48 }}>
                        <div style={{ fontSize: 10, fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 16 }}>Unisciti a noi</div>
                        <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 40, fontWeight: 300, color: "#2a2520" }}>Crea il tuo account</h1>
                    </div>

                    <div style={{ background: "white", border: "1px solid rgba(184,154,106,0.15)", padding: 40 }}>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                            <div>
                                <label style={labelStyle}>Nome</label>
                                <input type="text" name="nome" value={form.nome} onChange={handleChange} placeholder="Mario" style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Cognome</label>
                                <input type="text" name="cognome" value={form.cognome} onChange={handleChange} placeholder="Rossi" style={inputStyle} />
                            </div>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={labelStyle}>Email</label>
                            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="la@tuaemail.it" style={inputStyle} />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={labelStyle}>Password</label>
                            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Minimo 6 caratteri" style={inputStyle} />
                        </div>

                        <div style={{ marginBottom: 32 }}>
                            <label style={labelStyle}>Conferma Password</label>
                            <input type="password" name="conferma" value={form.conferma} onChange={handleChange} placeholder="••••••••" style={inputStyle} />
                        </div>

                        {error && (
                            <div style={{ background: "rgba(201,122,106,0.1)", border: "1px solid rgba(201,122,106,0.2)", color: "#c97a6a", padding: "12px 16px", fontSize: 12, marginBottom: 20 }}>
                                {error}
                            </div>
                        )}

                        <button onClick={handleRegister} disabled={loading} style={{
                            width: "100%", padding: "16px", background: loading ? "#c9b99a" : "#2a2520",
                            color: "#f5f0ea", border: "none", fontSize: 11, fontWeight: 400,
                            letterSpacing: "0.3em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer",
                            marginBottom: 20,
                        }}>
                            {loading ? "Registrazione in corso..." : "Crea Account"}
                        </button>

                        <div style={{ textAlign: "center", fontSize: 12, fontWeight: 300, color: "#9e8c78" }}>
                            Hai già un account?{" "}
                            <a href="/login" style={{ color: "#b89a6a", textDecoration: "none" }}>Accedi</a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}