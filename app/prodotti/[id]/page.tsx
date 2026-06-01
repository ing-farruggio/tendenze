"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/app/context/CartContext";
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

export default function ProductPage() {
    const { id } = useParams();
    const { addItem } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [added, setAdded] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favLoading, setFavLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setProduct(null);
        setActiveImage(0);
        supabase.from("products").select("*").eq("id", id).single()
            .then(({ data }) => { setProduct(data); setLoading(false); });
    }, [id]);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                setUserId(data.user.id);
                supabase.from("favorites").select("id").eq("user_id", data.user.id).eq("product_id", id).single()
                    .then(({ data: fav }) => setIsFavorite(!!fav));
            }
        });
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        addItem({ id: product.id, name: product.name, price: product.price, discounted_price: product.discounted_price, image: product.images?.[0] ?? "" });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const handleFavorite = async () => {
        if (!userId) { window.location.href = "/login"; return; }
        setFavLoading(true);
        if (isFavorite) {
            await supabase.from("favorites").delete().eq("user_id", userId).eq("product_id", id);
            setIsFavorite(false);
        } else {
            await supabase.from("favorites").insert({ user_id: userId, product_id: id });
            setIsFavorite(true);
        }
        setFavLoading(false);
    };

    const prevImage = () => {
        if (!product) return;
        setActiveImage(i => (i === 0 ? product.images.length - 1 : i - 1));
    };

    const nextImage = () => {
        if (!product) return;
        setActiveImage(i => (i === product.images.length - 1 ? 0 : i + 1));
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        touchEndX.current = e.changedTouches[0].clientX;
        if (touchStartX.current === null || touchEndX.current === null) return;
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextImage();
            else prevImage();
        }
        touchStartX.current = null;
        touchEndX.current = null;
    };

    if (loading) return <div style={{ background: "#faf8f5", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-jost), sans-serif", color: "#9e8c78", fontSize: 13 }}>Caricamento...</div>;
    if (!product) return <div style={{ background: "#faf8f5", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-jost), sans-serif", color: "#9e8c78", fontSize: 13 }}>Prodotto non trovato.</div>;

    const discount = product.discounted_price ? Math.round((1 - product.discounted_price / product.price) * 100) : null;
    const hasMultiple = product.images?.length > 1;

    return (
        <main style={{ fontFamily: "var(--font-jost), sans-serif", background: "#faf8f5", minHeight: "100vh" }}>
            <Navbar />

            <div style={{ padding: "12px 24px", fontSize: 11, fontWeight: 300, color: "#9e8c78", letterSpacing: "0.1em", borderBottom: "1px solid rgba(184,154,106,0.1)", overflowX: "auto", whiteSpace: "nowrap" }}>
                <a href="/" style={{ color: "#9e8c78", textDecoration: "none" }}>Home</a>
                <span style={{ margin: "0 8px" }}>›</span>
                <a href="/prodotti" style={{ color: "#9e8c78", textDecoration: "none" }}>Prodotti</a>
                <span style={{ margin: "0 8px" }}>›</span>
                <span style={{ color: "#2a2520" }}>{product.name}</span>
            </div>

            <div className="product-layout">

                {/* GALLERIA */}
                <div className="product-gallery">
                    <div
                        style={{ background: "#e8ddd0", aspectRatio: "3/4", overflow: "hidden", position: "relative", userSelect: "none" }}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        {product.images?.[activeImage] ? (
                            <img
                                src={product.images[activeImage]}
                                alt={product.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.3s ease" }}
                            />
                        ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80, opacity: 0.3 }}>◇</div>
                        )}

                        {/* BADGE */}
                        {product.is_new && <div style={{ position: "absolute", top: 16, left: 16, background: "#b89a6a", color: "white", fontSize: 9, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", padding: "5px 12px" }}>New</div>}
                        {discount && <div style={{ position: "absolute", top: product.is_new ? 44 : 16, left: 16, background: "#2a2520", color: "white", fontSize: 9, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", padding: "5px 12px" }}>−{discount}%</div>}

                        {/* FRECCE DESKTOP */}
                        {hasMultiple && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="gallery-arrow gallery-arrow-left"
                                    style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(250,248,245,0.9)", border: "1px solid rgba(184,154,106,0.3)", width: 40, height: 40, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#2a2520", backdropFilter: "blur(4px)" }}
                                >
                                    ‹
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="gallery-arrow gallery-arrow-right"
                                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(250,248,245,0.9)", border: "1px solid rgba(184,154,106,0.3)", width: 40, height: 40, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#2a2520", backdropFilter: "blur(4px)" }}
                                >
                                    ›
                                </button>
                            </>
                        )}

                        {/* DOTS MOBILE */}
                        {hasMultiple && (
                            <div className="gallery-dots" style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
                                {product.images.map((_, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        style={{ width: i === activeImage ? 20 : 6, height: 6, borderRadius: 3, background: i === activeImage ? "#b89a6a" : "rgba(255,255,255,0.7)", transition: "all 0.3s ease", cursor: "pointer" }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* THUMBNAILS DESKTOP */}
                    {hasMultiple && (
                        <div className="gallery-thumbs" style={{ display: "flex", gap: 8, marginTop: 12, overflowX: "auto" }}>
                            {product.images.map((img, i) => (
                                <div
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    style={{ width: 70, height: 90, overflow: "hidden", cursor: "pointer", border: activeImage === i ? "2px solid #b89a6a" : "2px solid transparent", transition: "border-color 0.2s", flexShrink: 0 }}
                                >
                                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* INFO */}
                <div className="product-info">
                    <div style={{ fontSize: 10, fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 12 }}>
                        {product.category_gender === "donna" ? "Donna" : "Uomo"} — {product.category_main}{product.category_sub ? ` / ${product.category_sub}` : ""}
                    </div>
                    <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 300, color: "#2a2520", lineHeight: 1.1, marginBottom: 20 }}>
                        {product.name}
                    </h1>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 24 }}>
            <span style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 300, color: "#2a2520" }}>
              € {product.discounted_price ?? product.price}
            </span>
                        {product.discounted_price && (
                            <span style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 22, color: "#c9b99a", textDecoration: "line-through" }}>€ {product.price}</span>
                        )}
                    </div>
                    {product.description && (
                        <p style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.9, color: "#9e8c78", marginBottom: 32, letterSpacing: "0.05em" }}>{product.description}</p>
                    )}
                    <div style={{ fontSize: 11, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", color: product.stock <= 2 ? "#c97a6a" : "#6db88a", marginBottom: 24 }}>
                        {product.stock === 0 ? "● Esaurito" : product.stock <= 2 ? `● Ultimi ${product.stock} pezzi` : "● Disponibile"}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
                        <button onClick={handleAddToCart} disabled={product.stock === 0} style={{ padding: "16px 40px", background: added ? "#6db88a" : product.stock === 0 ? "#c9b99a" : "#2a2520", color: "#f5f0ea", border: "none", fontSize: 11, fontWeight: 400, letterSpacing: "0.3em", textTransform: "uppercase", cursor: product.stock === 0 ? "not-allowed" : "pointer", transition: "background 0.3s" }}>
                            {added ? "✓ Aggiunto al Carrello" : product.stock === 0 ? "Prodotto Esaurito" : "Aggiungi al Carrello"}
                        </button>
                        <button onClick={handleFavorite} disabled={favLoading} style={{ padding: "16px 40px", background: "none", border: isFavorite ? "1px solid #b89a6a" : "1px solid rgba(42,37,32,0.2)", color: isFavorite ? "#b89a6a" : "#2a2520", fontSize: 11, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.3s" }}>
                            {isFavorite ? "♥ Nei preferiti" : "♡ Aggiungi ai preferiti"}
                        </button>
                    </div>

                    <div style={{ paddingTop: 24, borderTop: "1px solid rgba(184,154,106,0.15)", marginBottom: 24 }}>
                        <div style={{ fontSize: 10, fontWeight: 400, letterSpacing: "0.3em", textTransform: "uppercase", color: "#b89a6a", marginBottom: 12 }}>Dettagli</div>
                        {[
                            product.category_sub ? { label: "Sottocategoria", value: product.category_sub } : null,
                            { label: "Disponibilità", value: `${product.stock} pezzi` },
                        ].filter(Boolean).map((item: any) => (
                            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 300, color: "#9e8c78", paddingBottom: 10, borderBottom: "1px solid rgba(184,154,106,0.08)" }}>
                                <span>{item.label}</span>
                                <span style={{ color: "#2a2520" }}>{item.value}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[
                            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="1.5"/><circle cx="18.5" cy="18.5" r="1.5"/></svg>, text: "Spedizione gratuita sopra €150" },
                            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>, text: "Resi gratuiti entro 30 giorni" },
                            { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, text: "Pagamento sicuro e protetto" },
                        ].map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, fontWeight: 300, color: "#9e8c78" }}>
                                <span style={{ color: "#b89a6a", flexShrink: 0 }}>{item.icon}</span>
                                <span>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ padding: "0 24px 48px" }}>
                <a href="/prodotti" style={{ fontSize: 11, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9e8c78", textDecoration: "none" }}>← Torna ai prodotti</a>
            </div>

            <style>{`
        .product-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; padding: 48px 72px; max-width: 1400px; margin: 0 auto; }
        .product-info { padding-top: 8px; }
        .gallery-arrow { opacity: 0; transition: opacity 0.2s ease; }
        .product-gallery:hover .gallery-arrow { opacity: 1; }
        .gallery-dots { display: none; }
        @media (max-width: 768px) {
          .product-layout { grid-template-columns: 1fr; gap: 32px; padding: 24px 20px; }
          .gallery-arrow { display: none !important; }
          .gallery-dots { display: flex !important; }
          .gallery-thumbs { display: none !important; }
        }
      `}</style>
        </main>
    );
}