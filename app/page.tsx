"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "./components/Navbar";

interface HomepageSettings {
  hero_title: string;
  hero_subtitle: string;
  hero_tag: string;
  hero_image: string;
  marquee_items: string[];
}

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState<HomepageSettings>({
    hero_title: "L'eleganza è una forma di silenzio.",
    hero_subtitle: "Gioielli e borse creati per chi sa che il lusso vero non ha bisogno di urlare.",
    hero_tag: "Collezione Primavera 2026",
    hero_image: "",
    marquee_items: ["Artigianato Italiano", "Materiali Pregiati", "Design Senza Tempo", "Spedizione Gratuita", "Resi in 30 Giorni"],
  });

  useEffect(() => {
    supabase.from("products").select("*").eq("is_published", true)
      .order("created_at", { ascending: false }).limit(4)
      .then(({ data }) => { if (data) setProducts(data); });

    supabase.from("homepage_settings").select("*").single()
      .then(({ data }) => { if (data) setSettings(data); });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
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
      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "90vh" }}>
        <div className="hero-left" style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px 72px" }}>
          <div style={{ fontSize: "10px", letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: "32px", fontWeight: 300 }}>
            — {settings.hero_tag}
          </div>
          <h1 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "72px", fontWeight: 300, lineHeight: 1.05, color: "#2a2520", marginBottom: "32px" }}>
            {heroLines.map((line, i) => (
              <span key={i}>{line}{i < heroLines.length - 1 && <br />}</span>
            ))}
          </h1>
          <p style={{ fontSize: "13px", lineHeight: 1.9, color: "#9e8c78", maxWidth: "360px", marginBottom: "48px", fontWeight: 300 }}>
            {settings.hero_subtitle}
          </p>
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <a href="/prodotti" style={{ background: "#2a2520", color: "#f5f0ea", border: "none", padding: "16px 40px", fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", cursor: "pointer", fontWeight: 300, textDecoration: "none" }}>
              Esplora la Collezione
            </a>
            <a href="/prodotti?new=true" style={{ background: "none", border: "none", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", cursor: "pointer", opacity: 0.7, fontWeight: 300, textDecoration: "none", color: "#2a2520" }}>
              Scopri di piu
            </a>
          </div>
        </div>
        <div className="hero-right" style={{ background: "#e8ddd0", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
          {settings.hero_image ? (
            <img src={settings.hero_image} alt="Hero" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ fontSize: "160px" }}>👜</div>
          )}
          <div style={{ position: "absolute", bottom: "48px", left: "40px", background: "white", padding: "20px 28px", borderLeft: "3px solid #b89a6a" }}>
            <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "32px", fontWeight: 300, color: "#2a2520" }}>240+</div>
            <div style={{ fontSize: "10px", fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9e8c78", marginTop: "2px" }}>Pezzi in Collezione</div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ background: "#2a2520", padding: "18px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
        <div style={{ display: "inline-flex", animation: "marquee 20s linear infinite" }}>
          {[...settings.marquee_items, ...settings.marquee_items].map((item, i) => (
            <span key={i} style={{ fontSize: "11px", fontWeight: 300, letterSpacing: "0.35em", textTransform: "uppercase", color: "#c9b99a", padding: "0 48px" }}>
              {item} <span style={{ color: "#b89a6a" }}>&#10022;</span>
            </span>
          ))}
        </div>
      </div>

      {/* PRODUCTS */}
      <section style={{ padding: "100px 72px" }}>
        <div className="reveal" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "64px" }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: "16px" }}>— New Arrivals</div>
            <h2 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "48px", fontWeight: 300, lineHeight: 1.1, color: "#2a2520" }}>Nuovi arrivi</h2>
          </div>
          <a href="/prodotti" style={{ fontSize: "11px", fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", color: "#9e8c78", textDecoration: "none" }}>Vedi tutto</a>
        </div>
        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#9e8c78", fontSize: "13px", fontWeight: 300 }}>Nessun prodotto disponibile al momento.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "32px" }}>
            {products.map((product, index) => (
              <a
                key={product.id}
                href={`/prodotti/${product.id}`}
                className={`product-card reveal reveal-delay-${index + 1}`}
                style={{ cursor: "pointer", textDecoration: "none" }}
              >
                <div style={{ background: "#e8ddd0", aspectRatio: "3/4", overflow: "hidden", marginBottom: "20px", position: "relative" }}>
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "80px" }}>
                      {product.category_main === "Accessori" ? "👜" : "💍"}
                    </div>
                  )}
                  {product.is_new && (
                    <div style={{ position: "absolute", top: "16px", left: "16px", background: "#b89a6a", color: "white", fontSize: "9px", fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", padding: "5px 10px" }}>New</div>
                  )}
                  {product.discounted_price && !product.is_new && (
                    <div style={{ position: "absolute", top: "16px", left: "16px", background: "#b89a6a", color: "white", fontSize: "9px", fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", padding: "5px 10px" }}>Sale</div>
                  )}
                </div>
                <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "18px", fontWeight: 300, color: "#2a2520", marginBottom: "4px" }}>{product.name}</div>
                <div style={{ fontSize: "11px", fontWeight: 300, letterSpacing: "0.1em", color: "#9e8c78", marginBottom: "10px" }}>{product.description}</div>
                <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "20px", fontWeight: 300, color: "#2a2520" }}>
                  E {product.discounted_price ?? product.price}
                  {product.discounted_price && (
                    <span style={{ fontSize: "14px", color: "#c9b99a", textDecoration: "line-through", marginLeft: "8px" }}>E {product.price}</span>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* BANNER */}
      <div className="reveal" style={{ background: "#2a2520", display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "420px" }}>
        <div style={{ padding: "80px 72px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: "10px", fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: "24px" }}>Atelier Tendenze</div>
          <h2 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "52px", fontWeight: 300, lineHeight: 1.1, color: "white", marginBottom: "24px" }}>
            Fatto a mano,<br /><em style={{ color: "#d4b98a" }}>con intenzione.</em>
          </h2>
          <p style={{ fontSize: "13px", fontWeight: 300, lineHeight: 1.9, color: "#c9b99a", maxWidth: "380px", marginBottom: "48px" }}>
            Ogni creazione Tendenze nasce da mani esperte e da un profondo rispetto per la materia.
          </p>
          <button style={{ background: "none", border: "1px solid rgba(184,154,106,0.4)", color: "#d4b98a", fontSize: "11px", fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", padding: "16px 36px", cursor: "pointer", width: "fit-content" }}>
            La nostra storia
          </button>
        </div>
        <div style={{ background: "#9e8c78", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "120px" }}>💎</div>
      </div>

      {/* SEPARATORE */}
      <div style={{ background: "#faf8f5", height: "80px" }} />

      {/* FOOTER */}
      <footer style={{ background: "#2a2520", color: "#c9b99a", padding: "72px 72px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "48px", marginBottom: "64px" }}>
          <div>
            <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "28px", fontWeight: 300, letterSpacing: "0.3em", color: "white", marginBottom: "20px" }}>
              TEN<span style={{ color: "#b89a6a" }}>D</span>ENZE
            </div>
            <p style={{ fontSize: "12px", fontWeight: 300, lineHeight: 1.9, color: "#c9b99a", maxWidth: "260px" }}>
              Gioielli e borse pensati per chi vive il lusso come filosofia, non come ostentazione.
            </p>
          </div>
          {[
            { title: "Shop", links: [
                { label: "Nuovi Arrivi", href: "/prodotti?new=true" },
                { label: "Donna", href: "/prodotti?gender=donna" },
                { label: "Uomo", href: "/prodotti?gender=uomo" },
                { label: "Sale", href: "/prodotti?sale=true" },
              ]},
            { title: "Informazioni", links: [
                { label: "Chi siamo", href: "/pagine-legali/contatti" },
                { label: "Contatti", href: "/pagine-legali/contatti" },
                { label: "Spedizioni & Resi", href: "/pagine-legali/spedizioni" },
                { label: "Diritto di Recesso", href: "/pagine-legali/recesso" },
              ]},
            { title: "Legale", links: [
                { label: "Privacy Policy", href: "/pagine-legali/privacy" },
                { label: "Cookie Policy", href: "/pagine-legali/cookie-policy" },
                { label: "Termini e Condizioni", href: "/pagine-legali/termini" },
              ]},
          ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: "10px", fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#d4b98a", marginBottom: "24px" }}>{col.title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {col.links.map(link => (
                      <a key={link.label} href={link.href} style={{ fontSize: "12px", fontWeight: 300, color: "#c9b99a", textDecoration: "none" }}>{link.label}</a>
                  ))}
                </div>
              </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(201,185,154,0.15)", paddingTop: "28px", display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#7a7060" }}>
          <span>2026 Tendenze. Tutti i diritti riservati.</span>
          <span>Crafted with care in Italy</span>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroImageFade {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .hero-left > * {
          opacity: 0;
          animation: heroFadeUp 0.9s ease forwards;
        }
        .hero-left > *:nth-child(1) { animation-delay: 0.1s; }
        .hero-left > *:nth-child(2) { animation-delay: 0.25s; }
        .hero-left > *:nth-child(3) { animation-delay: 0.4s; }
        .hero-left > *:nth-child(4) { animation-delay: 0.55s; }
        .hero-right {
          opacity: 0;
          animation: heroImageFade 1s ease 0.2s forwards;
        }
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }
        .reveal-delay-4 { transition-delay: 0.4s; }
        .product-card {
          transition: transform 0.3s ease;
        }
        .product-card:hover {
          transform: translateY(-6px);
        }
        .product-card div img {
          transition: transform 0.6s ease;
        }
        .product-card:hover div img {
          transform: scale(1.05);
        }
      `}</style>
    </main>
  );
}
