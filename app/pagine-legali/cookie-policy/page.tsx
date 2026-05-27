"use client";
import Navbar from "@/app/components/Navbar";

export default function CookiePolicy() {
    return (
        <main style={{ fontFamily: "var(--font-jost), sans-serif", background: "#faf8f5", minHeight: "100vh" }}>
            <Navbar />
            <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px 24px" }}>
                <div style={{ marginBottom: 48 }}>
                    <div style={{ fontSize: 10, fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 12 }}>Legale</div>
                    <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 40, fontWeight: 300, color: "#2a2520" }}>Cookie Policy</h1>
                    <div style={{ fontSize: 12, fontWeight: 300, color: "#9e8c78", marginTop: 8 }}>Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 300, lineHeight: 2, color: "#9e8c78" }}>
                    {[
                        { title: "1. Cosa sono i cookie", text: "I cookie sono piccoli file di testo che i siti web salvano sul tuo dispositivo quando li visiti. Vengono utilizzati per far funzionare i siti in modo efficiente e per fornire informazioni ai proprietari del sito." },
                        { title: "2. Cookie che utilizziamo", text: "Utilizziamo esclusivamente cookie tecnici strettamente necessari al funzionamento del sito. Non utilizziamo cookie di profilazione, marketing o tracciamento." },
                        { title: "3. Elenco dei cookie", text: "tendenze_cart: salva i prodotti nel carrello (durata: sessione). tendenze_cookie_consent: memorizza la tua scelta sui cookie (durata: 1 anno). supabase-auth-token: gestisce la sessione di autenticazione (durata: sessione)." },
                        { title: "4. Cookie di terze parti", text: "Il sito utilizza Supabase per la gestione del database e dell autenticazione. Supabase puo impostare cookie tecnici necessari al funzionamento del servizio. Non utilizziamo Google Analytics, Facebook Pixel o altri strumenti di tracciamento." },
                        { title: "5. Come disabilitare i cookie", text: "Poiche utilizziamo solo cookie tecnici necessari, disabilitarli potrebbe compromettere il funzionamento del sito. Puoi comunque gestire i cookie dalle impostazioni del tuo browser." },
                        { title: "6. Contatti", text: "Per qualsiasi informazione sui cookie, puoi contattarci a: privacy@tendenze.it" },
                    ].map(section => (
                        <div key={section.title} style={{ marginBottom: 32 }}>
                            <div style={{ fontSize: 13, fontWeight: 400, color: "#2a2520", marginBottom: 8 }}>{section.title}</div>
                            <p>{section.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}