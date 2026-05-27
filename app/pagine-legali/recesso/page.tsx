"use client";
import Navbar from "@/app/components/Navbar";

export default function Recesso() {
    return (
        <main style={{ fontFamily: "var(--font-jost), sans-serif", background: "#faf8f5", minHeight: "100vh" }}>
            <Navbar />
            <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px" }}>
                <div style={{ marginBottom: 48 }}>
                    <div style={{ fontSize: 10, fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 12 }}>Legale</div>
                    <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 300, color: "#2a2520" }}>Diritto di Recesso</h1>
                    <div style={{ fontSize: 12, fontWeight: 300, color: "#9e8c78", marginTop: 8 }}>Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT")}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 300, lineHeight: 2, color: "#9e8c78" }}>
                    {[
                        { title: "1. Il tuo diritto di recesso", text: "Ai sensi del D.Lgs. 206/2005 (Codice del Consumo) e della Direttiva UE 2011/83/UE, hai il diritto di recedere dal contratto di acquisto entro 14 giorni dalla ricezione del prodotto, senza dover fornire alcuna motivazione." },
                        { title: "2. Come esercitare il recesso", text: "Per esercitare il diritto di recesso, devi informarci della tua decisione inviando una comunicazione esplicita a: resi@tendenze.it oppure tramite il modulo nella sezione I miei ordini del tuo account. Puoi utilizzare il modulo tipo allegato, ma non e obbligatorio." },
                        { title: "3. Termini per la restituzione", text: "Dopo aver comunicato il recesso, devi restituire i prodotti entro 14 giorni. I prodotti devono essere restituiti nelle condizioni originali, completi di tutti gli accessori, etichette e confezione originale." },
                        { title: "4. Rimborso", text: "Provvederemo al rimborso entro 14 giorni dalla ricezione del prodotto restituito, utilizzando lo stesso metodo di pagamento usato per l acquisto. Il rimborso include il costo del prodotto e le spese di spedizione originali (escluse le spese aggiuntive per metodi di consegna diversi dal piu economico disponibile)." },
                        { title: "5. Spese di restituzione", text: "Le spese di restituzione sono a nostro carico. Ti invieremo un'etichetta di reso prepagata via email dopo aver ricevuto la tua richiesta di recesso." },
                        { title: "6. Eccezioni al diritto di recesso", text: "Il diritto di recesso non si applica a: prodotti personalizzati o su misura, prodotti sigillati non restituibili per motivi igienici qualora siano stati aperti dopo la consegna." },
                        { title: "7. Prodotti danneggiati o difettosi", text: "Se hai ricevuto un prodotto danneggiato o difettoso, contattaci entro 48 ore dalla ricezione a: assistenza@tendenze.it. Provvederemo alla sostituzione o al rimborso completo senza costi aggiuntivi." },
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