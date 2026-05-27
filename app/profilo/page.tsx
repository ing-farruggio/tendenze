"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

export default function ProfiloPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [activeSection, setActiveSection] = useState("dati");

  const [form, setForm] = useState({ nome: "", cognome: "", telefono: "", via: "", citta: "", cap: "", provincia: "", paese: "Italia" });
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { router.replace("/login"); return; }
      setUser(data.user);
      setForm(prev => ({ ...prev, nome: data.user.user_metadata?.nome ?? "", cognome: data.user.user_metadata?.cognome ?? "" }));
      const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", data.user.id).single();
      if (profile) setForm(prev => ({ ...prev, telefono: profile.telefono ?? "", via: profile.via ?? "", citta: profile.citta ?? "", cap: profile.cap ?? "", provincia: profile.provincia ?? "", paese: profile.paese ?? "Italia" }));
      setLoading(false);
    };
    load();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true); setSuccess(""); setError("");
    const { error: authError } = await supabase.auth.updateUser({ data: { nome: form.nome, cognome: form.cognome } });
    if (authError) { setError(authError.message); setSaving(false); return; }
    const { error: profileError } = await supabase.from("user_profiles").upsert({ id: user.id, telefono: form.telefono, via: form.via, citta: form.citta, cap: form.cap, provincia: form.provincia, paese: form.paese, updated_at: new Date().toISOString() });
    setSaving(false);
    if (profileError) setError(profileError.message);
    else setSuccess("Profilo aggiornato con successo!");
  };

  const handleChangePassword = async () => {
    setSuccess(""); setError("");
    if (!passwordForm.current) { setError("Inserisci la password attuale."); return; }
    if (passwordForm.new !== passwordForm.confirm) { setError("Le nuove password non coincidono."); return; }
    if (passwordForm.new.length < 6) { setError("La password deve essere di almeno 6 caratteri."); return; }
    setSaving(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: passwordForm.current });
    if (signInError) { setError("Password attuale non corretta."); setSaving(false); return; }
    const { error } = await supabase.auth.updateUser({ password: passwordForm.new });
    setSaving(false);
    if (error) setError(error.message);
    else { setSuccess("Password aggiornata!"); setPasswordForm({ current: "", new: "", confirm: "" }); }
  };

  const handleDownloadData = () => {
    const data = { nome: user.user_metadata?.nome, cognome: user.user_metadata?.cognome, email: user.email, telefono: form.telefono, indirizzo: { via: form.via, citta: form.citta, cap: form.cap, provincia: form.provincia, paese: form.paese }, account_creato: new Date(user.created_at).toLocaleDateString("it-IT") };
    const html = `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><title>I miei dati - Tendenze</title><style>body{font-family:Georgia,serif;color:#2a2520;max-width:600px;margin:60px auto;padding:0 24px}h1{font-size:28px;font-weight:300;letter-spacing:0.2em;margin-bottom:4px}.sub{font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#b89a6a;margin-bottom:40px}.sec{margin-bottom:28px;border-top:1px solid rgba(184,154,106,0.3);padding-top:20px}.sec-title{font-size:10px;letter-spacing:0.4em;text-transform:uppercase;color:#b89a6a;margin-bottom:12px}.row{display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;font-weight:300}.label{color:#9e8c78}.footer{margin-top:48px;font-size:11px;color:#9e8c78;border-top:1px solid rgba(184,154,106,0.2);padding-top:16px}</style></head><body><h1>TENDENZE</h1><div class="sub">I miei dati personali</div><div class="sec"><div class="sec-title">Dati personali</div><div class="row"><span class="label">Nome</span><span>${data.nome||"—"}</span></div><div class="row"><span class="label">Cognome</span><span>${data.cognome||"—"}</span></div><div class="row"><span class="label">Email</span><span>${data.email}</span></div><div class="row"><span class="label">Telefono</span><span>${data.telefono||"—"}</span></div></div><div class="sec"><div class="sec-title">Indirizzo</div><div class="row"><span class="label">Via</span><span>${data.indirizzo.via||"—"}</span></div><div class="row"><span class="label">Citta</span><span>${data.indirizzo.citta||"—"}</span></div><div class="row"><span class="label">CAP</span><span>${data.indirizzo.cap||"—"}</span></div><div class="row"><span class="label">Paese</span><span>${data.indirizzo.paese||"—"}</span></div></div><div class="sec"><div class="sec-title">Account</div><div class="row"><span class="label">Creato il</span><span>${data.account_creato}</span></div></div><div class="footer">Generato il ${new Date().toLocaleDateString("it-IT")} — Tendenze Store</div></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "miei-dati-tendenze.html"; a.click();
  };

  const handleDeleteAccount = async () => {
    setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: deletePassword });
    if (signInError) { setError("Password non corretta."); return; }
    await supabase.from("favorites").delete().eq("user_id", user.id);
    await supabase.from("user_profiles").delete().eq("id", user.id);
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading) return <div style={{ background: "#faf8f5", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-jost), sans-serif", color: "#9e8c78" }}>Caricamento...</div>;

  const inputStyle: React.CSSProperties = { width: "100%", padding: "12px 16px", border: "1px solid rgba(184,154,106,0.2)", background: "#faf8f5", fontSize: 13, fontWeight: 300, outline: "none", fontFamily: "var(--font-jost), sans-serif", boxSizing: "border-box", color: "#2a2520" };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: 10, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", color: "#9e8c78", marginBottom: 8 };
  const sectionStyle: React.CSSProperties = { background: "white", border: "1px solid rgba(184,154,106,0.15)", padding: "28px 24px", marginBottom: 20 };
  const tabs = [{ key: "dati", label: "Dati" }, { key: "password", label: "Password" }, { key: "privacy", label: "Privacy" }, { key: "elimina", label: "A presto" }];

  return (
      <main style={{ fontFamily: "var(--font-jost), sans-serif", background: "#faf8f5", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 20px" }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 10, fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 10 }}>Account</div>
            <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 300, color: "#2a2520" }}>
              {user.user_metadata?.nome ? `Ciao, ${user.user_metadata.nome}` : "Il mio profilo"}
            </h1>
            <div style={{ fontSize: 12, fontWeight: 300, color: "#9e8c78", marginTop: 4 }}>{user.email}</div>
          </div>

          {/* TABS */}
          <div style={{ display: "flex", gap: 0, marginBottom: 28, borderBottom: "1px solid rgba(184,154,106,0.15)", overflowX: "auto" }}>
            {tabs.map(tab => (
                <button key={tab.key} onClick={() => { setActiveSection(tab.key); setSuccess(""); setError(""); }} style={{ padding: "10px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", color: activeSection === tab.key ? "#b89a6a" : "#9e8c78", borderBottom: activeSection === tab.key ? "2px solid #b89a6a" : "2px solid transparent", marginBottom: "-1px", whiteSpace: "nowrap", transition: "color 0.2s" }}>
                  {tab.label}
                </button>
            ))}
          </div>

          {success && <div style={{ background: "rgba(109,184,138,0.1)", border: "1px solid rgba(109,184,138,0.3)", color: "#5a9a6a", padding: "12px 16px", fontSize: 12, marginBottom: 20 }}>{success}</div>}
          {error && <div style={{ background: "rgba(201,122,106,0.1)", border: "1px solid rgba(201,122,106,0.2)", color: "#c97a6a", padding: "12px 16px", fontSize: 12, marginBottom: 20 }}>{error}</div>}

          {activeSection === "dati" && (
              <div style={sectionStyle}>
                <div style={{ fontSize: 10, fontWeight: 400, letterSpacing: "0.3em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 24 }}>Informazioni personali</div>
                <div className="two-col" style={{ marginBottom: 16 }}>
                  <div><label style={labelStyle}>Nome</label><input type="text" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} style={inputStyle} /></div>
                  <div><label style={labelStyle}>Cognome</label><input type="text" value={form.cognome} onChange={e => setForm(p => ({ ...p, cognome: e.target.value }))} style={inputStyle} /></div>
                </div>
                <div style={{ marginBottom: 16 }}><label style={labelStyle}>Telefono</label><input type="tel" value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))} placeholder="+39 000 000 0000" style={inputStyle} /></div>
                <div style={{ fontSize: 10, fontWeight: 400, letterSpacing: "0.3em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 16, marginTop: 28 }}>Indirizzo di spedizione</div>
                <div style={{ marginBottom: 16 }}><label style={labelStyle}>Via e numero civico</label><input type="text" value={form.via} onChange={e => setForm(p => ({ ...p, via: e.target.value }))} placeholder="Via Roma 1" style={inputStyle} /></div>
                <div className="three-col" style={{ marginBottom: 16 }}>
                  <div><label style={labelStyle}>Citta</label><input type="text" value={form.citta} onChange={e => setForm(p => ({ ...p, citta: e.target.value }))} placeholder="Milano" style={inputStyle} /></div>
                  <div><label style={labelStyle}>CAP</label><input type="text" value={form.cap} onChange={e => setForm(p => ({ ...p, cap: e.target.value }))} placeholder="20100" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Provincia</label><input type="text" value={form.provincia} onChange={e => setForm(p => ({ ...p, provincia: e.target.value }))} placeholder="MI" style={inputStyle} /></div>
                </div>
                <div style={{ marginBottom: 28 }}><label style={labelStyle}>Paese</label><input type="text" value={form.paese} onChange={e => setForm(p => ({ ...p, paese: e.target.value }))} style={inputStyle} /></div>
                <button onClick={handleSaveProfile} disabled={saving} style={{ padding: "14px 32px", background: "#2a2520", color: "#f5f0ea", border: "none", fontSize: 11, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", cursor: "pointer", width: "100%" }}>
                  {saving ? "Salvataggio..." : "Salva modifiche"}
                </button>
              </div>
          )}

          {activeSection === "password" && (
              <div style={sectionStyle}>
                <div style={{ fontSize: 10, fontWeight: 400, letterSpacing: "0.3em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 24 }}>Cambia password</div>
                <div style={{ marginBottom: 16 }}><label style={labelStyle}>Password attuale</label><input type="password" value={passwordForm.current} onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))} placeholder="Password attuale" style={inputStyle} /></div>
                <div style={{ marginBottom: 16 }}><label style={labelStyle}>Nuova password</label><input type="password" value={passwordForm.new} onChange={e => setPasswordForm(p => ({ ...p, new: e.target.value }))} placeholder="Minimo 6 caratteri" style={inputStyle} /></div>
                <div style={{ marginBottom: 28 }}><label style={labelStyle}>Conferma nuova password</label><input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))} placeholder="Ripeti la password" style={inputStyle} /></div>
                <button onClick={handleChangePassword} disabled={saving} style={{ padding: "14px 32px", background: "#2a2520", color: "#f5f0ea", border: "none", fontSize: 11, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", cursor: "pointer", width: "100%" }}>
                  {saving ? "Aggiornamento..." : "Aggiorna password"}
                </button>
              </div>
          )}

          {activeSection === "privacy" && (
              <div>
                <div style={sectionStyle}>
                  <div style={{ fontSize: 10, fontWeight: 400, letterSpacing: "0.3em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 20 }}>I tuoi dati</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(184,154,106,0.1)", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 300, color: "#2a2520", marginBottom: 2 }}>Scarica i tuoi dati</div>
                        <div style={{ fontSize: 11, fontWeight: 300, color: "#9e8c78" }}>Copia elegante di tutti i tuoi dati</div>
                      </div>
                      <button onClick={handleDownloadData} style={{ padding: "10px 20px", background: "none", border: "1px solid rgba(184,154,106,0.4)", color: "#b89a6a", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}>Scarica</button>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 300, color: "#2a2520", marginBottom: 2 }}>Informativa sulla privacy</div>
                        <div style={{ fontSize: 11, fontWeight: 300, color: "#9e8c78" }}>Come trattiamo i tuoi dati</div>
                      </div>
                      <button onClick={() => setShowPrivacy(!showPrivacy)} style={{ padding: "10px 20px", background: "none", border: "1px solid rgba(184,154,106,0.4)", color: "#b89a6a", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}>{showPrivacy ? "Chiudi" : "Leggi"}</button>
                    </div>
                  </div>
                </div>
                {showPrivacy && (
                    <div style={{ ...sectionStyle, background: "#faf8f5" }}>
                      <div style={{ fontSize: 10, fontWeight: 400, letterSpacing: "0.3em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 20 }}>Informativa sulla Privacy</div>
                      <div style={{ fontSize: 12, fontWeight: 300, lineHeight: 2, color: "#9e8c78" }}>
                        {[
                          { t: "1. Titolare del trattamento", p: "Il titolare del trattamento e Tendenze Store. Contatti: privacy@tendenze-gioielli.it" },
                          { t: "2. Dati raccolti", p: "Nome, cognome, email, telefono, indirizzo di spedizione, storico ordini. I dati di pagamento sono gestiti da Stripe e non vengono memorizzati sui nostri sistemi." },
                          { t: "3. Finalita", p: "Gestione account, elaborazione ordini, assistenza clienti, obblighi legali e fiscali." },
                          { t: "4. I tuoi diritti", p: "Hai diritto di accedere, rettificare, cancellare i tuoi dati. Puoi esercitarli da questa sezione o scrivendo a privacy@tendenze-gioielli.it." },
                          { t: "5. Conservazione", p: "I dati vengono conservati per il tempo necessario all erogazione dei servizi e per il periodo previsto dalla normativa fiscale (10 anni)." },
                        ].map(s => (
                            <div key={s.t} style={{ marginBottom: 20 }}>
                              <div style={{ fontSize: 12, fontWeight: 400, color: "#2a2520", marginBottom: 6 }}>{s.t}</div>
                              <p>{s.p}</p>
                            </div>
                        ))}
                      </div>
                    </div>
                )}
              </div>
          )}

          {activeSection === "elimina" && (
              <div style={{ ...sectionStyle, borderColor: "rgba(201,122,106,0.2)" }}>
                <div style={{ fontSize: 10, fontWeight: 400, letterSpacing: "0.3em", textTransform: "uppercase", color: "#c97a6a", marginBottom: 16 }}>A presto</div>
                <p style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.9, color: "#9e8c78", marginBottom: 8 }}>Ci dispiace vederti andare via.</p>
                <p style={{ fontSize: 12, fontWeight: 300, lineHeight: 1.9, color: "#9e8c78", marginBottom: 24 }}>L eliminazione e permanente e irreversibile. Tutti i tuoi dati verranno cancellati in conformita con il GDPR entro 30 giorni.</p>
                {!showDeleteConfirm ? (
                    <button onClick={() => setShowDeleteConfirm(true)} style={{ padding: "14px 32px", background: "none", border: "1px solid rgba(201,122,106,0.4)", color: "#c97a6a", fontSize: 11, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", cursor: "pointer", width: "100%" }}>Elimina il mio account</button>
                ) : (
                    <div style={{ background: "rgba(201,122,106,0.05)", border: "1px solid rgba(201,122,106,0.2)", padding: 20 }}>
                      <p style={{ fontSize: 12, fontWeight: 300, color: "#c97a6a", marginBottom: 16 }}>Inserisci la tua password per confermare.</p>
                      <input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="La tua password" style={{ ...inputStyle, marginBottom: 16, borderColor: "rgba(201,122,106,0.3)" }} />
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <button onClick={handleDeleteAccount} style={{ flex: 1, padding: "12px 20px", background: "#c97a6a", color: "white", border: "none", fontSize: 11, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}>Conferma</button>
                        <button onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); setError(""); }} style={{ flex: 1, padding: "12px 20px", background: "none", border: "1px solid rgba(42,37,32,0.2)", color: "#9e8c78", fontSize: 11, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}>Annulla</button>
                      </div>
                    </div>
                )}
              </div>
          )}
        </div>

        <style>{`
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .three-col { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; }
        @media (max-width: 480px) {
          .two-col { grid-template-columns: 1fr; }
          .three-col { grid-template-columns: 1fr; }
        }
      `}</style>
      </main>
  );
}