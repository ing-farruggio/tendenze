"use client";
import Navbar from "@/app/components/Navbar";

export default function Spedizioni() {
    return (
        <main style={{ fontFamily: "var(--font-jost), sans-serif", background: "#faf8f5", minHeight: "100vh" }}>
            <Navbar />
            <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px" }}>
                <div style={{ marginBottom: 48 }}>
                    <div style={{ fontSize: 10, fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 12 }}>Assistenza</div>
                    <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 300, color: "#2a2520" }}>Spedizioni e Resi</h1>
                    <div style={{ fontSize: 12, fontWeight: 300, color: "#9e8c78", marginTop: 8 }}>Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 48 }}>
                    {[
                        { label: "Spedizione standard", value: "3-5 giorni lavorativi", sub: "€ 9,90" },
                        { label: "Spedizione express", value: "1-2 giorni lavorativi", sub: "€ 19,90" },
                        { label: "Spedizione gratuita", value: "3-5 giorni lavorativi", sub: "Ordini sopra € 150" },
                        { label: "Reso gratuito", value: "Entro 14 giorni", sub: "Etichetta prepagata" },
                    ].map(item => (
                        <div key={item.label} style={{ background: "white", border: "1px solid rgba(184,154,106,0.15)", padding: 24 }}>
                            <div style={{ fontSize: 10, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 8 }}>{item.label}</div>
                            <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 22, fontWeight: 300, color: "#2a2520", marginBottom: 4 }}>{item.value}</div>
                            <div style={{ fontSize: 12, fontWeight: 300, color: "#9e8c78" }}>{item.sub}</div>
                        </div>
                    ))}
                </div>

                <div style={{ fontSize: 13, fontWeight: 300, lineHeight: 2, color: "#9e8c78" }}>
                    {[
                        { title: "Elaborazione ordini", text: "Gli ordini vengono elaborati dal lunedi al venerdi, esclusi i giorni festivi. Gli ordini effettuati nel weekend o nei giorni festivi verranno elaborati il primo giorno lavorativo successivo." },
                        { title: "Tracking della spedizione", text: "Riceverai una email con il numero di tracking non appena il tuo ordine viene spedito. Puoi monitorare la spedizione direttamente dal sito del corriere." },
                        { title: "Spedizioni internazionali", text: "Al momento effettuiamo spedizioni solo in Italia. Stiamo lavorando per espandere il servizio anche all estero. Iscriviti alla nostra newsletter per essere informato quando sara disponibile." },
                        { title: "Come effettuare un reso", text: "Per effettuare un reso, accedi al tuo account nella sezione I miei ordini e seleziona il prodotto da restituire. Ti invieremo una etichetta prepagata via email entro 24 ore. Inserisci il prodotto nella confezione originale e consegnalo al corriere." },
                        { title: "Tempi di rimborso", text: "Il rimborso viene elaborato entro 14 giorni dalla ricezione del prodotto restituito. L accredito sul tuo conto potrebbe richiedere ulteriori 3-5 giorni lavorativi a seconda del tuo istituto bancario." },
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