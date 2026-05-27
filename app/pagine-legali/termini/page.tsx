"use client";
import Navbar from "@/app/components/Navbar";

export default function Termini() {
    return (
        <main style={{ fontFamily: "var(--font-jost), sans-serif", background: "#faf8f5", minHeight: "100vh" }}>
            <Navbar />
            <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px 24px" }}>
                <div style={{ marginBottom: 48 }}>
                    <div style={{ fontSize: 10, fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 12 }}>Legale</div>
                    <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 40, fontWeight: 300, color: "#2a2520" }}>Termini e Condizioni</h1>
                    <div style={{ fontSize: 12, fontWeight: 300, color: "#9e8c78", marginTop: 8 }}>Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 300, lineHeight: 2, color: "#9e8c78" }}>
                    {[
                        { title: "1. Accettazione dei termini", text: "Accedendo e utilizzando il sito Tendenze, accetti i presenti termini e condizioni. Ti invitiamo a leggerli attentamente prima di effettuare qualsiasi acquisto." },
                        { title: "2. Prodotti e disponibilita", text: "Tutti i prodotti presenti sul sito sono soggetti a disponibilita. Ci riserviamo il diritto di modificare i prezzi e la disponibilita dei prodotti in qualsiasi momento senza preavviso. Le immagini dei prodotti sono indicative." },
                        { title: "3. Prezzi", text: "Tutti i prezzi sono espressi in Euro e includono l IVA applicabile. Le spese di spedizione vengono indicate separatamente durante il processo di acquisto. Offriamo spedizione gratuita per ordini superiori a 150 Euro." },
                        { title: "4. Ordini e pagamenti", text: "Gli ordini vengono considerati confermati solo dopo la ricezione della conferma via email. I pagamenti sono gestiti in modo sicuro tramite Stripe. Accettiamo carte di credito, carte di debito e altri metodi di pagamento elettronico." },
                        { title: "5. Spedizioni", text: "Le spedizioni vengono effettuate entro 2-5 giorni lavorativi dalla conferma del pagamento. Per maggiori dettagli consulta la nostra pagina Spedizioni." },
                        { title: "6. Diritto di recesso", text: "Hai diritto di recedere dal contratto entro 14 giorni dalla ricezione del prodotto senza necessita di fornire alcuna motivazione. Per maggiori dettagli consulta la nostra pagina Diritto di Recesso." },
                        { title: "7. Garanzia legale", text: "Tutti i prodotti sono coperti dalla garanzia legale di conformita prevista dal Codice del Consumo italiano (D.Lgs. 206/2005) per un periodo di 2 anni dall acquisto." },
                        { title: "8. Proprieta intellettuale", text: "Tutti i contenuti presenti sul sito, inclusi testi, immagini, loghi e design, sono di proprieta di Tendenze e sono protetti dalle leggi sul diritto d autore. E vietata la riproduzione senza autorizzazione scritta." },
                        { title: "9. Legge applicabile", text: "I presenti termini sono regolati dalla legge italiana. Per qualsiasi controversia sara competente il foro del consumatore." },
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