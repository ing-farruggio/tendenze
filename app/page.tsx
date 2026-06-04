"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import Navbar from "./components/Navbar";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discounted_price: number | null;
  images: string[];
  is_new: boolean;
  category_main: string;
}

interface HomepageSettings {
  hero_title: string;
  hero_subtitle: string;
  hero_tag: string;
  hero_image: string;
  marquee_items: string[];
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<HomepageSettings>({
    hero_title: "L'eleganza è una forma di silenzio.",
    hero_subtitle: "Gioielli e borse creati per chi sa che il lusso vero non ha bisogno di urlare.",
    hero_tag: "Collezione Primavera 2026",
    hero_image: "",
    marquee_items: ["Artigianato Italiano", "Materiali Pregiati", "Design Senza Tempo", "Spedizione Gratuita", "Resi in 30 Giorni"],
  });

  useEffect(() => {
    const load = async () => {
      const [{ data: prods }, { data: s }] = await Promise.all([
        supabase.from("products").select("*").eq("is_published", true).order("created_at", { ascending: false }).limit(4),
        supabase.from("homepage_settings").select("*").single(),
      ]);
      if (prods) setProducts(prods);
      if (s) setSettings(s);
    };
    load();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
        (entries) => { entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("visible"); }); },
        { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [products]);

  const heroLines = settings.hero_title.split("\n");

  return (
      <main style={{ fontFamily: "var(--font-jost), sans-serif", background: "#faf8f5", minHeight: "100vh" }}>
        <Navbar />

        {/* HERO */}
        <section className="hero-section">
          <div className="hero-left">
            <div style={{ fontSize: "10px", letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: "24px", fontWeight: 300 }}>
              {settings.hero_tag}
            </div>
            <h1 className="hero-title">
              {heroLines.map((line, i) => (
                  <span key={i}>{line}{i < heroLines.length - 1 && <br />}</span>
              ))}
            </h1>
            <p className="hero-subtitle">{settings.hero_subtitle}</p>
            <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
              <Link href="/prodotti" style={{ background: "#2a2520", color: "#f5f0ea", padding: "14px 32px", fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", fontWeight: 300, textDecoration: "none" }}>
                Esplora
              </Link>
              <Link href="/prodotti?new=true" style={{ fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0.7, fontWeight: 300, textDecoration: "none", color: "#2a2520" }}>
                New Arrivals →
              </Link>
            </div>
          </div>
          <div className="hero-right">
            {settings.hero_image ? (
                <Image src={settings.hero_image} alt="Hero" fill style={{ objectFit: "cover" }} sizes="(max-width: 768px) 100vw, 50vw" />
            ) : (
                <div style={{ fontSize: "120px", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>👜</div>
            )}
            <div className="hero-badge">
              <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "28px", fontWeight: 300, color: "#2a2520" }}>240+</div>
              <div style={{ fontSize: "10px", fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9e8c78", marginTop: "2px" }}>Pezzi in Collezione</div>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div style={{ background: "#2a2520", padding: "16px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
          <div style={{ display: "inline-flex", animation: "marquee 20s linear infinite" }}>
            {[...settings.marquee_items, ...settings.marquee_items].map((item, i) => (
                <span key={i} style={{ fontSize: "10px", fontWeight: 300, letterSpacing: "0.35em", textTransform: "uppercase", color: "#c9b99a", padding: "0 36px" }}>
              {item} <span style={{ color: "#b89a6a" }}>✦</span>
            </span>
            ))}
          </div>
        </div>

        {/* PRODUCTS */}
        <section className="section-padding">
          <div className="reveal" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "48px" }}>
            <div>
              <div style={{ fontSize: "10px", fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: "12px" }}>— New Arrivals</div>
              <h2 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 300, lineHeight: 1.1, color: "#2a2520" }}>Nuovi arrivi</h2>
            </div>
            <Link href="/prodotti" style={{ fontSize: "11px", fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", color: "#9e8c78", textDecoration: "none", whiteSpace: "nowrap" }}>Vedi tutto →</Link>
          </div>
          {products.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#9e8c78", fontSize: "13px", fontWeight: 300 }}>Nessun prodotto disponibile al momento.</div>
          ) : (
              <div className="products-grid">
                {products.map((product, index) => (
                    <Link key={product.id} href={`/prodotti/${product.id}`} className={`product-card reveal reveal-delay-${index + 1}`} style={{ cursor: "pointer", textDecoration: "none" }}>
                      <div style={{ background: "#e8ddd0", aspectRatio: "3/4", overflow: "hidden", marginBottom: "16px", position: "relative" }}>
                        {product.images?.[0] ? (
                            <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: "cover" }} sizes="(max-width: 768px) 50vw, 25vw" />
                        ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "60px" }}>
                              {product.category_main === "Accessori" ? "👜" : "💍"}
                            </div>
                        )}
                        {product.is_new && <div style={{ position: "absolute", top: "12px", left: "12px", background: "#b89a6a", color: "white", fontSize: "9px", fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", padding: "4px 8px" }}>New</div>}
                        {product.discounted_price && !product.is_new && <div style={{ position: "absolute", top: "12px", left: "12px", background: "#b89a6a", color: "white", fontSize: "9px", fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", padding: "4px 8px" }}>Sale</div>}
                      </div>
                      <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "17px", fontWeight: 300, color: "#2a2520", marginBottom: "4px" }}>{product.name}</div>
                      <div style={{ fontSize: "11px", fontWeight: 300, color: "#9e8c78", marginBottom: "8px" }}>{product.description}</div>
                      <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "18px", fontWeight: 300, color: "#2a2520" }}>
                        € {product.discounted_price ?? product.price}
                        {product.discounted_price && <span style={{ fontSize: "13px", color: "#c9b99a", textDecoration: "line-through", marginLeft: "8px" }}>€ {product.price}</span>}
                      </div>
                    </Link>
                ))}
              </div>
          )}
        </section>

        {/* BANNER */}
        <div className="reveal banner-section">
          <div className="banner-left">
            <div style={{ fontSize: "10px", fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: "20px" }}>✦ Atelier Tendenze</div>
            <h2 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 300, lineHeight: 1.1, color: "white", marginBottom: "20px" }}>
              Fatto a mano,<br /><em style={{ color: "#d4b98a" }}>con intenzione.</em>
            </h2>
            <p style={{ fontSize: "13px", fontWeight: 300, lineHeight: 1.9, color: "#c9b99a", maxWidth: "380px", marginBottom: "40px" }}>
              Ogni creazione Tendenze nasce da mani esperte e da un profondo rispetto per la materia.
            </p>
            <button style={{ background: "none", border: "1px solid rgba(184,154,106,0.4)", color: "#d4b98a", fontSize: "11px", fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", padding: "14px 32px", cursor: "pointer", width: "fit-content" }}>
              La nostra storia
            </button>
          </div>
          <div style={{ background: "#9e8c78", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "80px", minHeight: "300px" }}>💎</div>
        </div>

        {/* SEPARATORE */}
        <div style={{ background: "#faf8f5", height: "60px" }} />

        {/* FOOTER */}
        <footer style={{ background: "#2a2520", color: "#c9b99a", padding: "60px 24px 32px" }}>
          <div className="footer-grid">
            <div>
              <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "24px", fontWeight: 300, letterSpacing: "0.3em", color: "white", marginBottom: "16px" }}>
                TENDENZE
              </div>
              <p style={{ fontSize: "12px", fontWeight: 300, lineHeight: 1.9, color: "#c9b99a", maxWidth: "260px" }}>
                Gioielli e borse pensati per chi vive il lusso come filosofia.
              </p>
            </div>
            {[
              { title: "Shop", links: [{ label: "Nuovi Arrivi", href: "/prodotti?new=true" }, { label: "Donna", href: "/prodotti?gender=donna" }, { label: "Uomo", href: "/prodotti?gender=uomo" }, { label: "Sale", href: "/prodotti?sale=true" }] },
              { title: "Informazioni", links: [{ label: "Contatti", href: "/pagine-legali/contatti" }, { label: "Spedizioni & Resi", href: "/pagine-legali/spedizioni" }, { label: "Recesso", href: "/pagine-legali/recesso" }] },
              { title: "Legale", links: [{ label: "Privacy Policy", href: "/pagine-legali/privacy" }, { label: "Cookie Policy", href: "/pagine-legali/cookie-policy" }, { label: "Termini", href: "/pagine-legali/termini" }] },
            ].map(col => (
                <div key={col.title}>
                  <div style={{ fontSize: "10px", fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#d4b98a", marginBottom: "20px" }}>{col.title}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {col.links.map(link => (
                        <Link key={link.label} href={link.href} style={{ fontSize: "12px", fontWeight: 300, color: "#c9b99a", textDecoration: "none" }}>{link.label}</Link>
                    ))}
                  </div>
                </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(201,185,154,0.15)", paddingTop: "24px", marginTop: "48px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", fontSize: "11px", color: "#7a7060" }}>
            <span>© 2026 Tendenze. Tutti i diritti riservati.</span>
            <span>Crafted with care in Italy ✦</span>
          </div>
        </footer>
      </main>
  );
}
