"use client";

export default function GlobalError({
    error,
    unstable_retry,
}: {
    error: Error & { digest?: string };
    unstable_retry: () => void;
}) {
    return (
        <html lang="it">
            <body style={{ fontFamily: "system-ui, sans-serif", background: "#faf8f5", margin: 0, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 24px" }}>
                <div style={{ maxWidth: 460, textAlign: "center" }}>
                    <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 300, color: "#2a2520", marginBottom: 16 }}>
                        Tendenze non è raggiungibile
                    </h1>
                    <p style={{ fontSize: 14, fontWeight: 300, color: "#7a7060", marginBottom: 32, lineHeight: 1.7 }}>
                        Si è verificato un errore imprevisto. Riprova tra qualche istante.
                    </p>
                    <button onClick={() => unstable_retry()} style={{ padding: "14px 28px", background: "#2a2520", color: "#f5f0ea", border: "none", fontSize: 11, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", cursor: "pointer" }}>
                        Riprova
                    </button>
                    {error.digest && (
                        <div style={{ marginTop: 28, fontSize: 10, color: "#9e8c78" }}>Codice: {error.digest}</div>
                    )}
                </div>
            </body>
        </html>
    );
}
