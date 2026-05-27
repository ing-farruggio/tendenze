"use client";
import { useState, useEffect } from "react";

export default function CookieBanner() {
    const [visible, setVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("tendenze_cookie_consent");
        if (!consent) setVisible(true);
    }, []);

    const accept = () => {
        localStorage.setItem("tendenze_cookie_consent", "accepted");
        setVisible(false);
    };

    const reject = () => {
        localStorage.setItem("tendenze_cookie_consent", "rejected");
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
            background: "rgba(42,37,32,0.97)", backdropFilter: "blur(12px)",
            borderTop: "1px solid rgba(184,154,106,0.2)",
            padding: "24px 48px",
        }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 280 }}>
                        <div style={{ fontSize: 10, fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 10 }}>
                            Informativa sui cookie
                        </div>
                        <p style={{ fontSize: 12, fontWeight: 300, lineHeight: 1.8, color: "#c9b99a", marginBottom: 8 }}>
                            Utilizziamo cookie tecnici necessari al funzionamento del sito. Non utilizziamo cookie di profilazione o pubblicitari.
                        </p>
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 300, color: "#b89a6a", letterSpacing: "0.1em", padding: 0, textDecoration: "underline" }}
                        >
                            {showDetails ? "Nascondi dettagli" : "Maggiori informazioni"}
                        </button>

                        {showDetails && (
                            <div style={{ marginTop: 16, padding: 16, background: "rgba(184,154,106,0.08)", borderLeft: "2px solid #b89a6a" }}>
                                <div style={{ fontSize: 11, fontWeight: 300, color: "#c9b99a", lineHeight: 1.8 }}>
                                    <p style={{ marginBottom: 8 }}><strong style={{ color: "#d4b98a" }}>Cookie tecnici (obbligatori)</strong></p>
                                    <p style={{ marginBottom: 4 }}>• <strong style={{ color: "#d4b98a" }}>tendenze_cart</strong> — salva i prodotti nel carrello</p>
                                    <p style={{ marginBottom: 4 }}>• <strong style={{ color: "#d4b98a" }}>tendenze_cookie_consent</strong> — salva la tua scelta sui cookie</p>
                                    <p style={{ marginBottom: 4 }}>• <strong style={{ color: "#d4b98a" }}>supabase-auth-token</strong> — gestisce la sessione di login</p>
                                    <p style={{ marginTop: 12 }}>Questi cookie sono strettamente necessari al funzionamento del sito e non possono essere disabilitati.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end", justifyContent: "center" }}>
                        <button
                            onClick={accept}
                            style={{
                                padding: "12px 32px", background: "#b89a6a", color: "#0f0e0c",
                                border: "none", fontSize: 11, fontWeight: 400, letterSpacing: "0.3em",
                                textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap",
                            }}
                        >
                            Accetta
                        </button>
                        <button
                            onClick={reject}
                            style={{
                                padding: "12px 32px", background: "none",
                                border: "1px solid rgba(184,154,106,0.3)", color: "#c9b99a",
                                fontSize: 11, fontWeight: 300, letterSpacing: "0.3em",
                                textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap",
                            }}
                        >
                            Solo necessari
                        </button>
                        <a href="/pagine-legali/cookie-policy" style={{ fontSize: 10, fontWeight: 300, color: "#7a7060", letterSpacing: "0.1em", textDecoration: "underline" }}>
                            Cookie Policy
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}