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
    // Il gate era un no-op: il form accettava qualunque sessione presente in
    // localStorage, quindi su un PC condiviso bastava aprire questa pagina per
    // cambiare la password dell'utente ancora loggato.
    const [status, setStatus] = useState<"checking" | "allowed" | "denied">("checking");

    useEffect(() => {
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const query = new URLSearchParams(window.location.search);
        const fromRecoveryLink =
            hash.get("type") === "recovery" || query.get("type") === "recovery" || query.has("code");

        const { data: listener } = supabase.auth.onAuthStateChange((event) => {
            if (event === "PASSWORD_RECOVERY") setStatus("allowed");
        });

        let cancelled = false;
        if (!fromRecoveryLink) {
            setStatus("denied");
        } else {
            // Il client deve ancora processare il fragment / scambiare il code.
            (async () => {
                for (let i = 0; i < 20 && !cancelled; i++) {
                    const { data } = await supabase.auth.getSession();
                    if (data.session) { if (!cancelled) setStatus("allowed"); return; }
                    await new Promise(r => setTimeout(r, 150));
                }
                if (!cancelled) setStatus("denied");
            })();
        }

        return () => { cancelled = true; listener.subscription.unsubscribe(); };
    }, []);

    const handleSubmit = async () => {
        if (password !== confirm) { setError("Le password non coincidono."); return; }
        if (password.length < 8) { setError("La password deve essere di almeno 8 caratteri."); return; }
        if (status !== "allowed") { setError("Link di recupero non valido o scaduto."); return; }
        setLoading(true);
        setError("");
        const { error } = await supabase.auth.updateUser({ password });
        setLoading(false);
        if (error) setError("Non e' stato possibile aggiornare la password. Richiedi un nuovo link.");
        else router.replace("/login");
    };

    const shell = (title: string, body: string) => (
        <main style={{ fontFamily: "var(--font-jost), sans-serif", background: "#faf8f5", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 24px" }}>
                <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
                    <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 32, fontWeight: 300, color: "#2a2520", marginBottom: 16 }}>{title}</h1>
                    <p style={{ fontSize: 13, fontWeight: 300, color: "#7a7060", marginBottom: 24 }}>{body}</p>
                    <a href="/recupera-password" style={{ fontSize: 11, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", color: "#b89a6a" }}>Richiedi un nuovo link</a>
                </div>
            </div>
        </main>
    );

    if (status === "checking") return shell("Verifica in corso", "Stiamo controllando il link di recupero.");
    if (status === "denied") return shell("Link non valido", "Apri questa pagina dal link che ti abbiamo inviato via email.");

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