"use client";
import Link from "next/link";

export default function Error({
    error,
    unstable_retry,
}: {
    error: Error & { digest?: string };
    unstable_retry: () => void;
}) {
    return (
        <main style={{ fontFamily: "var(--font-jost), sans-serif", background: "#faf8f5", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 24px" }}>
            <div style={{ maxWidth: 460, textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 16 }}>Errore</div>
                <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 36, fontWeight: 300, color: "#2a2520", marginBottom: 16 }}>
                    Qualcosa non ha funzionato
                </h1>
                <p style={{ fontSize: 13, fontWeight: 300, color: "#7a7060", marginBottom: 32, lineHeight: 1.7 }}>
                    Non siamo riusciti a caricare questa pagina. Puoi riprovare subito oppure tornare alla home.
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    <button onClick={() => unstable_retry()} style={{ padding: "14px 28px", background: "#2a2520", color: "#f5f0ea", border: "none", fontSize: 11, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", cursor: "pointer" }}>
                        Riprova
                    </button>
                    <Link href="/" style={{ padding: "14px 28px", background: "none", border: "1px solid rgba(184,154,106,0.4)", color: "#b89a6a", fontSize: 11, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", textDecoration: "none" }}>
                        Torna alla home
                    </Link>
                </div>
                {error.digest && (
                    <div style={{ marginTop: 28, fontSize: 10, color: "#9e8c78", letterSpacing: "0.1em" }}>Codice: {error.digest}</div>
                )}
            </div>
        </main>
    );
}
