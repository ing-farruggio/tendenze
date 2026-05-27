"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Section = "dashboard" | "ordini" | "prodotti" | "clienti" | "homepage";
type View = "list" | "add" | "edit";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    discounted_price: number | null;
    category_gender: string;
    category_main: string;
    category_sub: string;
    stock: number;
    is_new: boolean;
    is_published: boolean;
    images: string[];
}

const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "10px", fontWeight: 400,
    letterSpacing: "0.3em", textTransform: "uppercase",
    color: "#7a7060", marginBottom: "8px",
};
const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px",
    background: "#2a2720", border: "1px solid rgba(184,154,106,0.15)",
    color: "#e8ddd0", fontSize: "13px", fontWeight: 300,
    outline: "none", borderRadius: "4px", fontFamily: "sans-serif",
};

const CATEGORIES: Record<string, Record<string, string[]>> = {
    donna: {
        "Gioielli": ["Collane", "Bracciali", "Orecchini", "Anelli"],
        "Bijoux": ["Collane", "Bracciali", "Orecchini", "Anelli"],
        "Orologi": [],
        "Abbigliamento": [],
        "Accessori": ["Borse", "Cappelli", "Foulard & Sciarpe", "Guanti", "Spille"],
    },
    uomo: {
        "Bijoux": ["Collane", "Bracciali", "Orecchini", "Anelli"],
        "Orologi": [],
        "Abbigliamento": [],
        "Accessori": ["Borse", "Portafogli", "Cinture", "Foulard & Sciarpe", "Gemelli"],
    },
};

function ComingSoon({ title }: { title: string }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16 }}>
            <div style={{ fontSize: 48, opacity: 0.3 }}>⏳</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 300, color: "#e8ddd0" }}>{title}</div>
            <div style={{ fontSize: 13, color: "#7a7060", fontWeight: 300 }}>Questa sezione sarà disponibile quando il sistema di acquisto e login sarà attivo.</div>
        </div>
    );
}

function ProductForm({ initial, onSave, onCancel }: {
    initial?: Product;
    onSave: () => void;
    onCancel: () => void;
}) {
    const [form, setForm] = useState({
        name: initial?.name ?? "",
        description: initial?.description ?? "",
        price: initial?.price ? String(initial.price) : "",
        discounted_price: initial?.discounted_price ? String(initial.discounted_price) : "",
        category_gender: initial?.category_gender ?? "donna",
        category_main: initial?.category_main ?? "Gioielli",
        category_sub: initial?.category_sub ?? "",
        stock: initial?.stock ? String(initial.stock) : "",
        is_new: initial?.is_new ?? false,
        is_published: initial?.is_published ?? false,
    });
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>(initial?.images ?? []);
    const [existingImages, setExistingImages] = useState<string[]>(initial?.images ?? []);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState("");

    const cats = CATEGORIES[form.category_gender] ?? {};
    const subs = cats[form.category_main] ?? [];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement;
        const value = target.type === "checkbox" ? target.checked : target.value;
        if (target.name === "category_gender") {
            const firstMain = Object.keys(CATEGORIES[target.value])[0];
            setForm(prev => ({ ...prev, category_gender: target.value, category_main: firstMain, category_sub: "" }));
        } else if (target.name === "category_main") {
            setForm(prev => ({ ...prev, category_main: target.value, category_sub: "" }));
        } else {
            setForm(prev => ({ ...prev, [target.name]: value }));
        }
    };

    const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        setImages(prev => [...prev, ...files]);
        setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    };

    const removeImage = (index: number) => {
        if (index < existingImages.length) {
            setExistingImages(prev => prev.filter((_, i) => i !== index));
        } else {
            const newIndex = index - existingImages.length;
            setImages(prev => prev.filter((_, i) => i !== newIndex));
        }
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!form.name || !form.price || !form.stock) {
            alert("Compila almeno nome, prezzo e quantità.");
            return;
        }
        setLoading(true);

        // Funzione di compressione
        const compressImage = (file: File): Promise<Blob> => {
            return new Promise((resolve) => {
                const img = new Image();
                const url = URL.createObjectURL(file);
                img.onload = () => {
                    const maxW = 1200;
                    const maxH = 1600;
                    let w = img.width;
                    let h = img.height;
                    if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
                    if (h > maxH) { w = Math.round(w * maxH / h); h = maxH; }
                    const canvas = document.createElement("canvas");
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext("2d")!;
                    ctx.drawImage(img, 0, 0, w, h);
                    URL.revokeObjectURL(url);
                    canvas.toBlob((blob) => resolve(blob!), "image/webp", 0.82);
                };
                img.src = url;
            });
        };

        const imageUrls: string[] = [...existingImages];
        for (let i = 0; i < images.length; i++) {
            setProgress(`Compressione foto ${i + 1} di ${images.length}...`);
            const compressed = await compressImage(images[i]);
            setProgress(`Caricamento foto ${i + 1} di ${images.length}...`);
            const fileName = `${Date.now()}_${i}.webp`;
            const { error: uploadError } = await supabase.storage.from("products").upload(fileName, compressed, { contentType: "image/webp" });
            if (uploadError) { alert("Errore upload: " + uploadError.message); setLoading(false); return; }
            const { data: urlData } = supabase.storage.from("products").getPublicUrl(fileName);
            imageUrls.push(urlData.publicUrl);
        }

        setProgress("Salvataggio...");
        const payload = {
            name: form.name,
            description: form.description,
            price: parseFloat(form.price),
            discounted_price: form.discounted_price ? parseFloat(form.discounted_price) : null,
            category_gender: form.category_gender,
            category_main: form.category_main,
            category_sub: form.category_sub,
            stock: parseInt(form.stock),
            is_new: form.is_new,
            is_published: form.is_published,
            images: imageUrls,
        };

        if (initial) {
            await supabase.from("products").update(payload).eq("id", initial.id);
        } else {
            await supabase.from("products").insert(payload);
        }

        setLoading(false);
        setProgress("");
        onSave();
    };

    return (
        <div style={{ background: "#1a1814", border: "1px solid rgba(184,154,106,0.12)", borderRadius: 6, padding: 36, maxWidth: 720 }}>
            <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Nome prodotto</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="es. Collana Venezia" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Descrizione</label>
                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Descrivi il prodotto..." rows={4} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                    <label style={labelStyle}>Prezzo (€)</label>
                    <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="es. 120" style={inputStyle} />
                </div>
                <div>
                    <label style={labelStyle}>Prezzo scontato (€)</label>
                    <input type="number" name="discounted_price" value={form.discounted_price} onChange={handleChange} placeholder="lascia vuoto se nessuno sconto" style={inputStyle} />
                </div>
            </div>

            {/* CATEGORIE */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                    <label style={labelStyle}>Genere</label>
                    <select name="category_gender" value={form.category_gender} onChange={handleChange} style={inputStyle}>
                        <option value="donna">Donna</option>
                        <option value="uomo">Uomo</option>
                    </select>
                </div>
                <div>
                    <label style={labelStyle}>Categoria</label>
                    <select name="category_main" value={form.category_main} onChange={handleChange} style={inputStyle}>
                        {Object.keys(cats).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label style={labelStyle}>Sottocategoria</label>
                    <select name="category_sub" value={form.category_sub} onChange={handleChange} style={inputStyle} disabled={subs.length === 0}>
                        <option value="">— Nessuna —</option>
                        {subs.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Quantità in magazzino</label>
                <input type="number" name="stock" value={form.stock} onChange={handleChange} placeholder="es. 10" style={inputStyle} />
            </div>

            {/* FOTO */}
            <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Foto prodotto</label>
                <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 32, border: "2px dashed rgba(184,154,106,0.25)", borderRadius: 4, cursor: "pointer" }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b89a6a" strokeWidth="1.5" strokeLinecap="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span style={{ fontSize: 12, fontWeight: 300, color: "#7a7060" }}>Clicca per caricare foto</span>
                    <span style={{ fontSize: 10, color: "#5a5048" }}>JPG, PNG, WEBP — puoi selezionarne più d&apos;una</span>
                    <input type="file" accept="image/*" multiple onChange={handleImages} style={{ display: "none" }} />
                </label>
                {previews.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginTop: 16 }}>
                        {previews.map((src, i) => (
                            <div key={i} style={{ position: "relative", aspectRatio: "1", borderRadius: 4, overflow: "hidden", border: "1px solid rgba(184,154,106,0.2)" }}>
                                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                <button onClick={() => removeImage(i)} style={{ position: "absolute", top: 4, right: 4, background: "rgba(15,14,12,0.8)", border: "none", color: "#e8ddd0", width: 22, height: 22, borderRadius: "50%", cursor: "pointer", fontSize: 13 }}>×</button>
                                {i === 0 && <div style={{ position: "absolute", bottom: 4, left: 4, background: "#b89a6a", color: "white", fontSize: 7, padding: "2px 5px", borderRadius: 2 }}>PRINCIPALE</div>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ display: "flex", gap: 32, marginBottom: 32 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 12, fontWeight: 300, color: "#a09080" }}>
                    <input type="checkbox" name="is_new" checked={form.is_new} onChange={handleChange} /> Novità
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 12, fontWeight: 300, color: "#a09080" }}>
                    <input type="checkbox" name="is_published" checked={form.is_published} onChange={handleChange} /> Pubblica subito
                </label>
            </div>

            {progress && (
                <div style={{ background: "rgba(184,154,106,0.1)", border: "1px solid rgba(184,154,106,0.2)", color: "#b89a6a", padding: "12px 16px", borderRadius: 4, fontSize: 12, marginBottom: 16 }}>
                    ⏳ {progress}
                </div>
            )}

            <div style={{ display: "flex", gap: 12 }}>
                <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, padding: 16, background: loading ? "#3a3530" : "#b89a6a", color: loading ? "#7a7060" : "#0f0e0c", border: "none", fontSize: 11, fontWeight: 400, letterSpacing: "0.3em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", borderRadius: 4 }}>
                    {loading ? "Salvataggio..." : initial ? "Salva Modifiche" : "Aggiungi Prodotto"}
                </button>
                <button onClick={onCancel} style={{ padding: "16px 24px", background: "none", border: "1px solid rgba(184,154,106,0.2)", color: "#7a7060", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", borderRadius: 4 }}>
                    Annulla
                </button>
            </div>
        </div>
    );
}

function Prodotti() {
    const [view, setView] = useState<View>("list");
    const [products, setProducts] = useState<Product[]>([]);
    const [editing, setEditing] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const load = async () => {
        setLoading(true);
        const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
        setProducts(data ?? []);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const deleteProduct = async (id: string) => {
        if (!confirm("Sei sicuro di voler eliminare questo prodotto?")) return;
        await supabase.from("products").delete().eq("id", id);
        load();
    };

    const togglePublish = async (id: string, current: boolean) => {
        await supabase.from("products").update({ is_published: !current }).eq("id", id);
        load();
    };

    const filtered = products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.category_gender?.includes(search.toLowerCase()) ||
        p.category_main?.toLowerCase().includes(search.toLowerCase())
    );

    if (view === "add") return (
        <div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 300, color: "#e8ddd0", marginBottom: 32 }}>Aggiungi Prodotto</h2>
            <ProductForm onSave={() => { load(); setView("list"); }} onCancel={() => setView("list")} />
        </div>
    );

    if (view === "edit" && editing) return (
        <div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 300, color: "#e8ddd0", marginBottom: 32 }}>Modifica Prodotto</h2>
            <ProductForm initial={editing} onSave={() => { load(); setView("list"); setEditing(null); }} onCancel={() => { setView("list"); setEditing(null); }} />
        </div>
    );

    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 300, color: "#e8ddd0" }}>Prodotti</h2>
                <button onClick={() => setView("add")} style={{ padding: "12px 28px", background: "#b89a6a", color: "#0f0e0c", border: "none", fontSize: 11, fontWeight: 400, letterSpacing: "0.3em", textTransform: "uppercase", cursor: "pointer", borderRadius: 4 }}>
                    + Aggiungi
                </button>
            </div>

            <input type="text" placeholder="Cerca prodotto..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, marginBottom: 20, maxWidth: 320 }} />

            {loading ? (
                <div style={{ color: "#7a7060", fontSize: 13, padding: "48px 0", textAlign: "center" }}>Caricamento...</div>
            ) : filtered.length === 0 ? (
                <div style={{ color: "#7a7060", fontSize: 13, padding: "48px 0", textAlign: "center" }}>Nessun prodotto trovato.</div>
            ) : (
                <div style={{ background: "#1a1814", border: "1px solid rgba(184,154,106,0.12)", borderRadius: 6, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead>
                        <tr style={{ borderBottom: "1px solid rgba(184,154,106,0.1)" }}>
                            {["Foto", "Nome", "Categoria", "Prezzo", "Stock", "Stato", "Azioni"].map(h => (
                                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 9, fontWeight: 400, letterSpacing: "0.3em", textTransform: "uppercase", color: "#7a7060" }}>{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map(p => (
                            <tr key={p.id} style={{ borderBottom: "1px solid rgba(184,154,106,0.06)" }}>
                                <td style={{ padding: "12px 16px" }}>
                                    {p.images?.[0] ? (
                                        <img src={p.images[0]} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4 }} />
                                    ) : (
                                        <div style={{ width: 48, height: 48, background: "#2a2720", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>◇</div>
                                    )}
                                </td>
                                <td style={{ padding: "12px 16px", color: "#e8ddd0", fontWeight: 400 }}>{p.name}</td>
                                <td style={{ padding: "12px 16px", color: "#7a7060", textTransform: "capitalize" }}>
                                    {p.category_gender} — {p.category_main}{p.category_sub ? ` / ${p.category_sub}` : ""}
                                </td>
                                <td style={{ padding: "12px 16px", color: "#e8ddd0" }}>
                                    € {p.discounted_price ?? p.price}
                                    {p.discounted_price && <span style={{ color: "#7a7060", textDecoration: "line-through", marginLeft: 6, fontSize: 11 }}>€ {p.price}</span>}
                                </td>
                                <td style={{ padding: "12px 16px", color: p.stock <= 2 ? "#c97a6a" : "#7a7060" }}>{p.stock} pz</td>
                                <td style={{ padding: "12px 16px" }}>
                    <span onClick={() => togglePublish(p.id, p.is_published)} style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", background: p.is_published ? "rgba(109,184,138,0.12)" : "rgba(122,154,184,0.12)", color: p.is_published ? "#6db88a" : "#7a9ab8" }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
                        {p.is_published ? "Pubblicato" : "Bozza"}
                    </span>
                                </td>
                                <td style={{ padding: "12px 16px" }}>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button onClick={() => { setEditing(p); setView("edit"); }} style={{ padding: "6px 14px", background: "rgba(184,154,106,0.1)", border: "1px solid rgba(184,154,106,0.2)", color: "#b89a6a", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", borderRadius: 4 }}>
                                            Modifica
                                        </button>
                                        <button onClick={() => deleteProduct(p.id)} style={{ padding: "6px 14px", background: "rgba(201,122,106,0.1)", border: "1px solid rgba(201,122,106,0.2)", color: "#c97a6a", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", borderRadius: 4 }}>
                                            Elimina
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
function Clienti() {
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        supabase
            .from("users_view")
            .select("*")
            .order("created_at", { ascending: false })
            .then(({ data }) => {
                setClients(data ?? []);
                setLoading(false);
            });
    }, []);

    const filtered = clients.filter(c =>
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.nome?.toLowerCase().includes(search.toLowerCase()) ||
        c.cognome?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 300, color: "#e8ddd0" }}>Clienti</h2>
                <div style={{ fontSize: 12, fontWeight: 300, color: "#7a7060" }}>{clients.length} clienti registrati</div>
            </div>

            <input
                type="text"
                placeholder="Cerca per nome o email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyle, marginBottom: 20, maxWidth: 320 }}
            />

            {loading ? (
                <div style={{ color: "#7a7060", fontSize: 13, padding: "48px 0", textAlign: "center" }}>Caricamento...</div>
            ) : filtered.length === 0 ? (
                <div style={{ color: "#7a7060", fontSize: 13, padding: "48px 0", textAlign: "center" }}>Nessun cliente trovato.</div>
            ) : (
                <div style={{ background: "#1a1814", border: "1px solid rgba(184,154,106,0.12)", borderRadius: 6, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead>
                        <tr style={{ borderBottom: "1px solid rgba(184,154,106,0.1)" }}>
                            {["Nome", "Email", "Registrato il", "Ultimo accesso"].map(h => (
                                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 9, fontWeight: 400, letterSpacing: "0.3em", textTransform: "uppercase", color: "#7a7060" }}>{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map(c => (
                            <tr key={c.id} style={{ borderBottom: "1px solid rgba(184,154,106,0.06)" }}>
                                <td style={{ padding: "14px 16px", color: "#e8ddd0", fontWeight: 400 }}>
                                    {c.nome && c.cognome ? `${c.nome} ${c.cognome}` : "—"}
                                </td>
                                <td style={{ padding: "14px 16px", color: "#7a7060" }}>{c.email}</td>
                                <td style={{ padding: "14px 16px", color: "#7a7060" }}>
                                    {c.created_at ? new Date(c.created_at).toLocaleDateString("it-IT") : "—"}
                                </td>
                                <td style={{ padding: "14px 16px", color: "#7a7060" }}>
                                    {c.last_sign_in_at ? new Date(c.last_sign_in_at).toLocaleDateString("it-IT") : "—"}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
function Homepage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [form, setForm] = useState({
        hero_title: "",
        hero_subtitle: "",
        hero_tag: "",
        hero_image: "",
        marquee_items: [] as string[],
    });

    useEffect(() => {
        supabase.from("homepage_settings").select("*").single().then(({ data }) => {
            if (data) {
                setForm(data);
                setImagePreview(data.hero_image ?? "");
            }
            setLoading(false);
        });
    }, []);

    const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleMarqueeChange = (index: number, value: string) => {
        const updated = [...form.marquee_items];
        updated[index] = value;
        setForm(prev => ({ ...prev, marquee_items: updated }));
    };

    const addMarqueeItem = () => {
        setForm(prev => ({ ...prev, marquee_items: [...prev.marquee_items, ""] }));
    };

    const removeMarqueeItem = (index: number) => {
        setForm(prev => ({ ...prev, marquee_items: prev.marquee_items.filter((_, i) => i !== index) }));
    };

    const handleSave = async () => {
        setSaving(true);
        setSuccess(false);
        let imageUrl = form.hero_image;

        if (imageFile) {
            const compressImage = (file: File): Promise<Blob> => {
                return new Promise((resolve) => {
                    const img = new Image();
                    const url = URL.createObjectURL(file);
                    img.onload = () => {
                        const canvas = document.createElement("canvas");
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext("2d")!;
                        ctx.drawImage(img, 0, 0);
                        URL.revokeObjectURL(url);
                        canvas.toBlob((blob) => resolve(blob!), "image/webp", 0.85);
                    };
                    img.src = url;
                });
            };
            const compressed = await compressImage(imageFile);
            const fileName = `hero_${Date.now()}.webp`;
            const { error } = await supabase.storage.from("products").upload(fileName, compressed, { contentType: "image/webp" });
            if (!error) {
                const { data: urlData } = supabase.storage.from("products").getPublicUrl(fileName);
                imageUrl = urlData.publicUrl;
            }
        }

        await supabase.from("homepage_settings").update({
            hero_title: form.hero_title,
            hero_subtitle: form.hero_subtitle,
            hero_tag: form.hero_tag,
            hero_image: imageUrl,
            marquee_items: form.marquee_items.filter(i => i.trim() !== ""),
        }).eq("id", 1);

        setSaving(false);
        setSuccess(true);
    };

    if (loading) return <div style={{ color: "#7a7060", padding: "48px 0", textAlign: "center" }}>Caricamento...</div>;

    return (
        <div style={{ maxWidth: 720 }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 300, color: "#e8ddd0", marginBottom: 32 }}>Impostazioni Homepage</h2>

            <div style={{ background: "#1a1814", border: "1px solid rgba(184,154,106,0.12)", borderRadius: 6, padding: 36 }}>

                {/* TAG */}
                <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Tag collezione (es. Collezione Primavera 2026)</label>
                    <input type="text" value={form.hero_tag} onChange={e => setForm(prev => ({ ...prev, hero_tag: e.target.value }))} style={inputStyle} />
                </div>

                {/* TITOLO */}
                <div style={{ marginBottom: 20 }}>
                    <label style={labelStyle}>Titolo hero (usa \n per andare a capo)</label>
                    <textarea value={form.hero_title} onChange={e => setForm(prev => ({ ...prev, hero_title: e.target.value }))} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
                </div>

                {/* SOTTOTITOLO */}
                <div style={{ marginBottom: 24 }}>
                    <label style={labelStyle}>Sottotitolo</label>
                    <textarea value={form.hero_subtitle} onChange={e => setForm(prev => ({ ...prev, hero_subtitle: e.target.value }))} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                </div>

                {/* IMMAGINE HERO */}
                <div style={{ marginBottom: 24 }}>
                    <label style={labelStyle}>Immagine hero</label>
                    {imagePreview && (
                        <div style={{ marginBottom: 12, width: 200, height: 240, overflow: "hidden", borderRadius: 4, border: "1px solid rgba(184,154,106,0.2)" }}>
                            <img src={imagePreview} alt="Hero preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                    )}
                    <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", border: "2px dashed rgba(184,154,106,0.25)", borderRadius: 4, cursor: "pointer" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b89a6a" strokeWidth="1.5" strokeLinecap="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span style={{ fontSize: 12, fontWeight: 300, color: "#7a7060" }}>
              {imagePreview ? "Cambia immagine" : "Carica immagine hero"}
            </span>
                        <input type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
                    </label>
                </div>

                {/* MARQUEE */}
                <div style={{ marginBottom: 32 }}>
                    <label style={labelStyle}>Testi barra scorrevole</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {form.marquee_items.map((item, i) => (
                            <div key={i} style={{ display: "flex", gap: 8 }}>
                                <input
                                    type="text"
                                    value={item}
                                    onChange={e => handleMarqueeChange(i, e.target.value)}
                                    style={{ ...inputStyle, flex: 1 }}
                                />
                                <button
                                    onClick={() => removeMarqueeItem(i)}
                                    style={{ padding: "0 16px", background: "rgba(201,122,106,0.1)", border: "1px solid rgba(201,122,106,0.2)", color: "#c97a6a", cursor: "pointer", borderRadius: 4, fontSize: 16 }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={addMarqueeItem}
                            style={{ padding: "10px", background: "rgba(184,154,106,0.08)", border: "1px dashed rgba(184,154,106,0.3)", color: "#b89a6a", cursor: "pointer", borderRadius: 4, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" }}
                        >
                            + Aggiungi voce
                        </button>
                    </div>
                </div>

                {success && (
                    <div style={{ background: "rgba(109,184,138,0.12)", border: "1px solid rgba(109,184,138,0.3)", color: "#6db88a", padding: "12px 16px", borderRadius: 4, fontSize: 12, marginBottom: 16 }}>
                        ✓ Impostazioni salvate con successo!
                    </div>
                )}

                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{ width: "100%", padding: 16, background: saving ? "#3a3530" : "#b89a6a", color: saving ? "#7a7060" : "#0f0e0c", border: "none", fontSize: 11, fontWeight: 400, letterSpacing: "0.3em", textTransform: "uppercase", cursor: saving ? "not-allowed" : "pointer", borderRadius: 4 }}
                >
                    {saving ? "Salvataggio..." : "Salva impostazioni"}
                </button>
            </div>
        </div>
    );
}
export default function AdminPage() {
    const [section, setSection] = useState<Section>("dashboard");
    const [search, setSearch] = useState("");

    const navItems: { key: Section; icon: string; label: string }[] = [
        { key: "dashboard", icon: "◈", label: "Dashboard" },
        { key: "ordini",    icon: "◻", label: "Ordini" },
        { key: "prodotti",  icon: "◇", label: "Prodotti" },
        { key: "clienti",   icon: "○", label: "Clienti" },
        { key: "homepage", icon: "⊞", label: "Homepage" },
    ];

    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "sans-serif", background: "#0f0e0c", color: "#e8ddd0" }}>
            <aside style={{ width: 240, background: "#1a1814", borderRight: "1px solid rgba(184,154,106,0.12)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
                <div style={{ padding: "28px 24px 24px", borderBottom: "1px solid rgba(184,154,106,0.1)" }}>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 300, letterSpacing: "0.35em", color: "#e8ddd0" }}>
                        TEN<span style={{ color: "#b89a6a" }}>D</span>ENZE
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 300, letterSpacing: "0.35em", textTransform: "uppercase", color: "#7a7060", marginTop: 4 }}>Pannello Admin</div>
                </div>
                <div style={{ padding: "20px 0 8px" }}>
                    <div style={{ fontSize: 9, fontWeight: 400, letterSpacing: "0.35em", textTransform: "uppercase", color: "#7a7060", padding: "0 24px 10px" }}>Principale</div>
                    {navItems.map(item => (
                        <div key={item.key} onClick={() => setSection(item.key)} style={{
                            display: "flex", alignItems: "center", gap: 12, padding: "11px 24px",
                            cursor: "pointer", fontSize: 12, fontWeight: 300, letterSpacing: "0.08em",
                            color: section === item.key ? "#d4b98a" : "#7a7060",
                            background: section === item.key ? "rgba(184,154,106,0.1)" : "none",
                            borderLeft: section === item.key ? "2px solid #b89a6a" : "2px solid transparent",
                            transition: "all 0.2s",
                        }}>
                            <span style={{ fontSize: 14, opacity: 0.7 }}>{item.icon}</span>
                            {item.label}
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: "auto", borderTop: "1px solid rgba(184,154,106,0.1)", padding: "16px 24px" }}>
                    <div style={{ fontSize: 11, fontWeight: 300, color: "#e8ddd0" }}>Amministratore</div>
                    <div style={{ fontSize: 10, fontWeight: 300, color: "#7a7060", marginTop: 2 }}>Tendenze Store</div>
                </div>
            </aside>

            <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ height: 60, background: "rgba(15,14,12,0.9)", borderBottom: "1px solid rgba(184,154,106,0.1)", display: "flex", alignItems: "center", padding: "0 36px", gap: 20, backdropFilter: "blur(12px)" }}>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 300, color: "#e8ddd0", flex: 1, textTransform: "capitalize" }}>{section}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#1a1814", border: "1px solid rgba(184,154,106,0.12)", borderRadius: 4, padding: "8px 16px", width: 260 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7a7060" strokeWidth="1.5" strokeLinecap="round">
                            <circle cx="10.5" cy="10.5" r="6.5" /><line x1="15.5" y1="15.5" x2="21" y2="21" />
                        </svg>
                        <input type="text" placeholder="Cerca..." value={search} onChange={e => setSearch(e.target.value)} style={{ background: "none", border: "none", outline: "none", fontSize: 11, fontWeight: 300, color: "#e8ddd0", width: "100%", fontFamily: "sans-serif" }} />
                    </div>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "32px 36px" }}>
                    {section === "dashboard" && <ComingSoon title="Dashboard" />}
                    {section === "ordini"    && <ComingSoon title="Ordini" />}
                    {section === "prodotti"  && <Prodotti />}
                    {section === "clienti" && <Clienti />}
                    {section === "homepage" && <Homepage />}
                </div>
            </main>
        </div>
    );
}