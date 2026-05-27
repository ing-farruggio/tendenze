"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/app/components/Navbar";

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
    images: string[];
}

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

function ProdottiContent() {
    const searchParams = useSearchParams();
    const genderParam = searchParams.get("gender") as "donna" | "uomo" | null;
    const mainParam = searchParams.get("main");
    const isNew = searchParams.get("new") === "true";
    const isSale = searchParams.get("sale") === "true";
    const searchParam = searchParams.get("search");

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [gender, setGender] = useState<"donna" | "uomo">(genderParam ?? "donna");
    const [activeMain, setActiveMain] = useState<string | null>(mainParam ?? null);
    const [activeSub, setActiveSub] = useState<string | null>(null);
    const [sort, setSort] = useState("newest");

    useEffect(() => {
        if (genderParam) setGender(genderParam);
        if (mainParam) setActiveMain(mainParam);
    }, [genderParam, mainParam]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            let query = supabase
                .from("products")
                .select("*")
                .eq("is_published", true);

            if (!isNew && !isSale) query = query.eq("category_gender", gender);
            if (activeMain && !isNew && !isSale) query = query.eq("category_main", activeMain);
            if (activeSub) query = query.eq("category_sub", activeSub);
            if (isNew) query = query.eq("is_new", true);
            if (isSale) query = query.not("discounted_price", "is", null);
            if (searchParam) query = query.ilike("name", `%${searchParam}%`);

            if (sort === "newest") query = query.order("created_at", { ascending: false });
            else if (sort === "price_asc") query = query.order("price", { ascending: true });
            else if (sort === "price_desc") query = query.order("price", { ascending: false });

            const { data } = await query;
            setProducts(data ?? []);
            setLoading(false);
        };
        load();
    }, [gender, activeMain, activeSub, sort, isNew, isSale]);

    const cats = CATEGORIES[gender];

    return (
        <main style={{ fontFamily: "var(--font-jost), sans-serif", background: "#faf8f5", minHeight: "100vh" }}>

            <Navbar />

            <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "calc(100vh - 73px)" }}>

                {/* SIDEBAR FILTRI */}
                <aside style={{ borderRight: "1px solid rgba(184,154,106,0.15)", padding: "40px 32px", background: "#faf8f5" }}>

                    {/* GENDER TOGGLE */}
                    {!isNew && !isSale && (
                        <div style={{ display: "flex", marginBottom: 40, border: "1px solid rgba(184,154,106,0.2)", borderRadius: 4, overflow: "hidden" }}>
                            {(["donna", "uomo"] as const).map(g => (
                                <button key={g} onClick={() => { setGender(g); setActiveMain(null); setActiveSub(null); }} style={{
                                    flex: 1, padding: "10px", border: "none", cursor: "pointer", fontSize: 10,
                                    fontWeight: 400, letterSpacing: "0.3em", textTransform: "uppercase",
                                    background: gender === g ? "#2a2520" : "transparent",
                                    color: gender === g ? "#f5f0ea" : "#9e8c78",
                                    transition: "all 0.2s",
                                }}>{g}</button>
                            ))}
                        </div>
                    )}

                    {/* CATEGORIE */}
                    {!isNew && !isSale && (
                        <div>
                            <div style={{ fontSize: 9, fontWeight: 400, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 20 }}>Categorie</div>

                            <div onClick={() => { setActiveMain(null); setActiveSub(null); }} style={{
                                fontSize: 12, fontWeight: activeMain === null ? 400 : 300, letterSpacing: "0.1em",
                                color: activeMain === null ? "#2a2520" : "#9e8c78", cursor: "pointer",
                                padding: "8px 0", borderBottom: "1px solid rgba(184,154,106,0.1)", marginBottom: 4,
                            }}>Tutti i prodotti</div>

                            {Object.entries(cats).map(([main, subs]) => (
                                <div key={main}>
                                    <div onClick={() => { setActiveMain(activeMain === main ? null : main); setActiveSub(null); }} style={{
                                        fontSize: 12, fontWeight: activeMain === main ? 400 : 300, letterSpacing: "0.1em",
                                        color: activeMain === main ? "#2a2520" : "#9e8c78", cursor: "pointer",
                                        padding: "8px 0", display: "flex", justifyContent: "space-between", alignItems: "center",
                                    }}>
                                        {main}
                                        {subs.length > 0 && <span style={{ fontSize: 10, opacity: 0.5 }}>{activeMain === main ? "−" : "+"}</span>}
                                    </div>

                                    {activeMain === main && subs.length > 0 && (
                                        <div style={{ paddingLeft: 16, marginBottom: 8 }}>
                                            {subs.map(sub => (
                                                <div key={sub} onClick={() => setActiveSub(activeSub === sub ? null : sub)} style={{
                                                    fontSize: 11, fontWeight: 300, letterSpacing: "0.1em",
                                                    color: activeSub === sub ? "#b89a6a" : "#9e8c78", cursor: "pointer",
                                                    padding: "6px 0",
                                                    borderLeft: activeSub === sub ? "2px solid #b89a6a" : "2px solid transparent",
                                                    paddingLeft: activeSub === sub ? 10 : 12,
                                                    transition: "all 0.2s",
                                                }}>{sub}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </aside>

                {/* PRODOTTI */}
                <div style={{ padding: "40px 48px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
                        <div>
                            <div style={{ fontSize: 10, fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 8 }}>
                                {isNew ? "New Arrivals" : isSale ? "Sale" : `${gender === "donna" ? "Donna" : "Uomo"}${activeMain ? ` — ${activeMain}` : ""}${activeSub ? ` / ${activeSub}` : ""}`}
                            </div>
                            <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 36, fontWeight: 300, color: "#2a2520" }}>
                                {searchParam ? `Risultati per "${searchParam}"` : isNew ? "Nuovi Arrivi" : isSale ? "Offerte" : (activeSub ?? activeMain ?? "Tutti i prodotti")}
                            </h1>
                            <div style={{ fontSize: 11, fontWeight: 300, color: "#9e8c78", marginTop: 6 }}>{products.length} prodotti</div>
                        </div>
                        <select value={sort} onChange={e => setSort(e.target.value)} style={{
                            padding: "10px 16px", background: "white", border: "1px solid rgba(184,154,106,0.2)",
                            fontSize: 11, fontWeight: 300, letterSpacing: "0.1em", color: "#2a2520", outline: "none", cursor: "pointer",
                        }}>
                            <option value="newest">Più recenti</option>
                            <option value="price_asc">Prezzo crescente</option>
                            <option value="price_desc">Prezzo decrescente</option>
                        </select>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: "center", padding: "80px 0", color: "#9e8c78", fontSize: 13 }}>Caricamento...</div>
                    ) : products.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "80px 0", color: "#9e8c78", fontSize: 13 }}>Nessun prodotto disponibile in questa categoria.</div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
                            {products.map(product => (
                                <a key={product.id} href={`/prodotti/${product.id}`} style={{ cursor: "pointer", textDecoration: "none" }}>
                                    <div style={{ background: "#e8ddd0", aspectRatio: "3/4", overflow: "hidden", marginBottom: 16, position: "relative" }}>
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
                                                 onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                                                 onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                                            />
                                        ) : (
                                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, opacity: 0.4 }}>◇</div>
                                        )}
                                        {product.is_new && (
                                            <div style={{ position: "absolute", top: 16, left: 16, background: "#b89a6a", color: "white", fontSize: 9, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", padding: "5px 10px" }}>New</div>
                                        )}
                                        {product.discounted_price && (
                                            <div style={{ position: "absolute", top: product.is_new ? 44 : 16, left: 16, background: "#2a2520", color: "white", fontSize: 9, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", padding: "5px 10px" }}>Sale</div>
                                        )}
                                    </div>
                                    <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 18, fontWeight: 300, color: "#2a2520", marginBottom: 4 }}>{product.name}</div>
                                    <div style={{ fontSize: 11, fontWeight: 300, color: "#9e8c78", marginBottom: 10 }}>{product.category_main}{product.category_sub ? ` — ${product.category_sub}` : ""}</div>
                                    <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 20, fontWeight: 300, color: "#2a2520" }}>
                                        € {product.discounted_price ?? product.price}
                                        {product.discounted_price && (
                                            <span style={{ fontSize: 14, color: "#c9b99a", textDecoration: "line-through", marginLeft: 8 }}>€ {product.price}</span>
                                        )}
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

export default function ProdottiPage() {
    return (
        <Suspense fallback={<div style={{ background: "#faf8f5", minHeight: "100vh" }} />}>
            <ProdottiContent />
        </Suspense>
    );
}