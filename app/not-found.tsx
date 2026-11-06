import Link from "next/link";

export default function NotFound() {
    return (
        <main style={{ fontFamily: "var(--font-jost), sans-serif", background: "#faf8f5", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 24px" }}>
            <div style={{ maxWidth: 460, textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 16 }}>404</div>
                <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 36, fontWeight: 300, color: "#2a2520", marginBottom: 16 }}>
                    Pagina non trovata
                </h1>
                <p style={{ fontSize: 13, fontWeight: 300, color: "#7a7060", marginBottom: 32, lineHeight: 1.7 }}>
                    La pagina che cerchi non esiste o è stata spostata.
                </p>
                <Link href="/prodotti" style={{ padding: "14px 28px", background: "#2a2520", color: "#f5f0ea", fontSize: 11, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", textDecoration: "none" }}>
                    Vai al catalogo
                </Link>
            </div>
        </main>
    );
}
