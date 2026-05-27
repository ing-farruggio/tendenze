"use client";
import Navbar from "@/app/components/Navbar";

export default function Privacy() {
    return (
        <main style={{ fontFamily: "var(--font-jost), sans-serif", background: "#faf8f5", minHeight: "100vh" }}>
            <Navbar />
            <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px 24px" }}>
                <div style={{ marginBottom: 48 }}>
                    <div style={{ fontSize: 10, fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 12 }}>Legale</div>
                    <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 40, fontWeight: 300, color: "#2a2520" }}>Privacy Policy</h1>
                    <div style={{ fontSize: 12, fontWeight: 300, color: "#9e8c78", marginTop: 8 }}>Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 300, lineHeight: 2, color: "#9e8c78" }}>
                    {[
                        { title: "1. Titolare del trattamento", text: "Il titolare del trattamento dei dati e Tendenze Store. Per esercitare i tuoi diritti o per qualsiasi informazione, puoi contattarci a: privacy@tendenze.it" },
                        { title: "2. Dati raccolti", text: "Raccogliamo i seguenti dati personali: nome e cognome, indirizzo email, numero di telefono, indirizzo di spedizione, storico degli ordini. I dati di pagamento sono gestiti esclusivamente da Stripe Inc. e non vengono mai memorizzati sui nostri sistemi." },
                        { title: "3. Finalita del trattamento", text: "I tuoi dati vengono trattati per: gestione del tuo account, elaborazione e spedizione degli ordini, assistenza clienti, adempimento di obblighi legali e fiscali. Non utilizziamo i tuoi dati per finalita di marketing senza il tuo esplicito consenso." },
                        { title: "4. Base giuridica", text: "Il trattamento e fondato sull esecuzione del contratto di vendita (art. 6, par. 1, lett. b GDPR) e sul rispetto degli obblighi legali (art. 6, par. 1, lett. c GDPR)." },
                        { title: "5. Conservazione dei dati", text: "I tuoi dati vengono conservati per il tempo necessario all erogazione dei servizi richiesti e, successivamente, per il periodo previsto dalla normativa fiscale e civilistica applicabile (di norma 10 anni)." },
                        { title: "6. I tuoi diritti", text: "Ai sensi del GDPR hai diritto di: accedere ai tuoi dati, rettificarli, cancellarli (diritto all oblio), limitarne il trattamento, portarli ad altro titolare (portabilita), opporti al trattamento. Puoi esercitare questi diritti dalla sezione Il mio profilo o scrivendo a privacy@tendenze.it." },
                        { title: "7. Sicurezza", text: "Adottiamo misure tecniche e organizzative adeguate per proteggere i tuoi dati da accessi non autorizzati, perdita o divulgazione. I dati sono archiviati su infrastrutture sicure certificate." },
                        { title: "8. Modifiche", text: "Ci riserviamo di aggiornare la presente informativa. Le modifiche sostanziali saranno comunicate via email agli utenti registrati." },
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