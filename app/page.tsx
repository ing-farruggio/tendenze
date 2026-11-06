"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import Navbar from "./components/Navbar";
import { formatPrice } from "@/lib/format";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discounted_price: number | null;
  images: string[];
  is_new: boolean;
  category_main: string;
  category_gender: string;
}

// Immagine dimostrativa del banner: da sostituire con una foto d'atelier vera.
// Non sta in homepage_settings perche' quella tabella non ha una colonna per
// questa immagine, e aggiungerne una per del contenuto di prova non si fa.
const IMMAGINE_ATELIER = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/demo/atelier.jpg`;

interface HomepageSettings {
  hero_title: string;
  hero_subtitle: string;
  hero_tag: string;
  hero_image: string;
  marquee_items: string[];
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [settings, setSettings] = useState<HomepageSettings>({
    hero_title: "L'eleganza è una forma di silenzio.",
    hero_subtitle: "Gioielli e borse creati per chi sa che il lusso vero non ha bisogno di urlare.",
    hero_tag: "Collezione Primavera 2026",
    hero_image: "",
    marquee_items: ["Artigianato Italiano", "Materiali Pregiati", "Design Senza Tempo", "Spedizione Gratuita", "Resi in 30 Giorni"],
  });

  useEffect(() => {
    const load = async () => {
      const [{ data: prods, error: prodsError }, { data: s }] = await Promise.all([
        supabase.from("products").select("*").eq("is_published", true).order("created_at", { ascending: false }).limit(60),
        supabase.from("homepage_settings").select("*").maybeSingle(),
      ]);
      setLoadError(!!prodsError);
      if (prods) setProducts(prods);
      // Sostituire l'oggetto intero faceva perdere i default su ogni colonna
      // NULL: hero_title null -> .split() su null -> homepage bianca.
      if (s) {
        setSettings(prev => ({
          ...prev,
          ...Object.fromEntries(Object.entries(s).filter(([, v]) => v !== null && v !== undefined && v !== "")),
        }));
      }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
        (entries) => { entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("visible"); }); },
        { threshold: 0.1 }
    );
    const elementi = document.querySelectorAll(".reveal");
    elementi.forEach(el => observer.observe(el));
    // Rete di sicurezza: se l'osservatore non scatta (schede in background,
    // layout che non genera scroll, browser senza supporto) il contenuto
    // resterebbe a opacita' zero per sempre. Dopo 1,5s si mostra comunque.
    const salvagente = setTimeout(() => {
      elementi.forEach(el => el.classList.add("visible"));
    }, 1500);
    return () => { clearTimeout(salvagente); observer.disconnect(); };
  }, [products]);

  const heroLines = (settings.hero_title ?? "").split("\n");

  // "Nuovi arrivi" mostrava gli ultimi inseriti: caricati in blocco erano tutti
  // coetanei e l'ordine diventava arbitrario. Ora usa davvero il flag is_new,
  // con i piu' recenti come riserva se non bastano.
  const nuovi = useMemo(() => {
    const flaggati = products.filter(p => p.is_new);
    return (flaggati.length >= 4 ? flaggati : products).slice(0, 4);
  }, [products]);

  // Chiave genere+categoria, non la sola categoria: "Accessori" e "Bijoux"
  // esistono per entrambi i generi, e la pagina catalogo filtra sempre per
  // genere. Raggruppando solo per categoria il numero sulla card avrebbe
  // promesso piu' prodotti di quanti il link ne mostra davvero.
  const categorie = useMemo(() => {
    const m = new Map<string, { nome: string; gender: string; n: number; img: string | null }>();
    for (const p of products) {
      if (!p.category_main || !p.category_gender) continue;
      const chiave = `${p.category_gender}/${p.category_main}`;
      if (!m.has(chiave)) {
        m.set(chiave, { nome: p.category_main, gender: p.category_gender, n: 0, img: null });
      }
      const v = m.get(chiave)!;
      v.n++;
      if (!v.img && p.images?.[0]) v.img = p.images[0];
    }
    return [...m.values()].sort((a, b) => b.n - a.n).slice(0, 4);
  }, [products]);

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
                <Image
                    src={settings.hero_image}
                    alt="Collana, orecchini e anello della collezione Tendenze disposti su fondo avorio"
                    fill
                    preload
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
            ) : (
                <div style={{ fontSize: "120px", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>👜</div>
            )}
            <div className="hero-badge">
              <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "28px", fontWeight: 300, color: "#2a2520" }}>
                {loading ? "—" : products.length}
              </div>
              <div style={{ fontSize: "10px", fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9e8c78", marginTop: "2px" }}>
                {products.length === 1 ? "Pezzo in collezione" : "Pezzi in collezione"}
              </div>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        {/* contain: paint impone il contenimento: con il solo overflow hidden
            l'elemento animato, promosso a layer compositato, allargava di 16px
            la pagina e comparivano una barra di scorrimento orizzontale e
            l'intero sito trascinabile di lato. */}
        <div style={{ background: "#2a2520", padding: "16px 0", overflow: "hidden", whiteSpace: "nowrap", contain: "paint", maxWidth: "100%" }}>
          <div style={{ display: "inline-flex", animation: "marquee 20s linear infinite" }}>
            {[...(settings.marquee_items ?? []), ...(settings.marquee_items ?? [])].map((item, i) => (
                <span key={i} style={{ fontSize: "10px", fontWeight: 300, letterSpacing: "0.35em", textTransform: "uppercase", color: "#c9b99a", padding: "0 36px" }}>
              {item} <span style={{ color: "#b89a6a" }}>✦</span>
            </span>
            ))}
          </div>
        </div>

        {/* CATEGORIE */}
        {categorie.length > 0 && (
            <section className="section-padding" style={{ paddingBottom: 0 }}>
              <div className="reveal" style={{ marginBottom: "40px" }}>
                <div style={{ fontSize: "10px", fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: "12px" }}>&mdash; Collezioni</div>
                <h2 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 300, lineHeight: 1.1, color: "#2a2520" }}>Scopri per categoria</h2>
              </div>
              <div className="products-grid">
                {categorie.map((c, i) => (
                    <Link
                        key={`${c.gender}/${c.nome}`}
                        href={`/prodotti?gender=${c.gender}&main=${encodeURIComponent(c.nome)}`}
                        className={`product-card reveal reveal-delay-${i + 1}`}
                        style={{ textDecoration: "none" }}
                    >
                      <div style={{ background: "#e8ddd0", aspectRatio: "1/1", overflow: "hidden", position: "relative", marginBottom: "14px" }}>
                        {c.img && (
                            <Image src={c.img} alt="" fill style={{ objectFit: "cover" }} sizes="(max-width: 768px) 50vw, 25vw" />
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "10px" }}>
                        <span style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "19px", fontWeight: 300, color: "#2a2520" }}>{c.nome}</span>
                        <span style={{ fontSize: "11px", fontWeight: 300, color: "#9e8c78", fontVariantNumeric: "tabular-nums" }}>{c.n}</span>
                      </div>
                      <div style={{ fontSize: "10px", fontWeight: 300, letterSpacing: "0.25em", textTransform: "uppercase", color: "#b89a6a", marginTop: "4px" }}>{c.gender}</div>
                    </Link>
                ))}
              </div>
            </section>
        )}

        {/* PRODUCTS */}
        <section className="section-padding">
          <div className="reveal" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "48px" }}>
            <div>
              <div style={{ fontSize: "10px", fontWeight: 300, letterSpacing: "0.4em", textTransform: "uppercase", color: "#b89a6a", marginBottom: "12px" }}>— New Arrivals</div>
              <h2 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 300, lineHeight: 1.1, color: "#2a2520" }}>Nuovi arrivi</h2>
            </div>
            <Link href="/prodotti" style={{ fontSize: "11px", fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", color: "#9e8c78", textDecoration: "none", whiteSpace: "nowrap" }}>Vedi tutto →</Link>
          </div>
          {loading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#9e8c78", fontSize: "13px", fontWeight: 300 }}>Caricamento...</div>
          ) : loadError ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#c97a6a", fontSize: "13px", fontWeight: 300 }}>Non siamo riusciti a caricare i prodotti. Riprova tra poco.</div>
          ) : nuovi.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#9e8c78", fontSize: "13px", fontWeight: 300 }}>Nessun prodotto disponibile al momento.</div>
          ) : (
              <div className="products-grid">
                {nuovi.map((product, index) => (
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
                        {product.discounted_price != null && !product.is_new && <div style={{ position: "absolute", top: "12px", left: "12px", background: "#b89a6a", color: "white", fontSize: "9px", fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", padding: "4px 8px" }}>Sale</div>}
                      </div>
                      <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "17px", fontWeight: 300, color: "#2a2520", marginBottom: "4px" }}>{product.name}</div>
                      <div style={{ fontSize: "11px", fontWeight: 300, color: "#9e8c78", marginBottom: "8px" }}>{product.description}</div>
                      <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "18px", fontWeight: 300, color: "#2a2520" }}>
                        {formatPrice(product.discounted_price ?? product.price)}
                        {product.discounted_price != null && <span style={{ fontSize: "13px", color: "#c9b99a", textDecoration: "line-through", marginLeft: "8px" }}>{formatPrice(product.price)}</span>}
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
            {/* Era un <button> senza onClick: un comando che non faceva nulla.
                Non esiste una pagina "storia", quindi punta al catalogo
                invece di promettere una destinazione inesistente. */}
            <Link href="/prodotti" style={{ background: "none", border: "1px solid rgba(184,154,106,0.4)", color: "#d4b98a", fontSize: "11px", fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase", padding: "14px 32px", width: "fit-content", textDecoration: "none" }}>
              Scopri la collezione
            </Link>
          </div>
          <div style={{ background: "#231f1a", position: "relative", minHeight: "300px", overflow: "hidden" }}>
            <Image
                src={IMMAGINE_ATELIER}
                alt="Anello, spilla e orecchini Tendenze fotografati su fondo scuro"
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
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
