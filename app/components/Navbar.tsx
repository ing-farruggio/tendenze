"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { supabase } from "@/lib/supabase";

const menuItems = [
  { label: "Donna", sub: ["Gioielli", "Bijoux", "Orologi", "Abbigliamento", "Accessori"], gender: "donna" },
  { label: "Uomo", sub: ["Bijoux", "Orologi", "Abbigliamento", "Accessori"], gender: "uomo" },
  { label: "New Arrivals", sub: [], gender: null },
  { label: "Sale", sub: [], gender: null },
];

const SUBCATEGORIES: Record<string, Record<string, string[]>> = {
  donna: {
    "Gioielli": ["Collane", "Bracciali", "Orecchini", "Anelli"],
    "Bijoux": ["Collane", "Bracciali", "Orecchini", "Anelli"],
    "Accessori": ["Borse", "Cappelli", "Foulard & Sciarpe", "Guanti", "Spille"],
  },
  uomo: {
    "Bijoux": ["Collane", "Bracciali", "Orecchini", "Anelli"],
    "Accessori": ["Borse", "Portafogli", "Cinture", "Foulard & Sciarpe", "Gemelli"],
  },
};

export default function Navbar() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [userMenu, setUserMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const { count } = useCart();
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      setSearchLoading(true);
      const { data } = await supabase.from("products").select("id, name, price, discounted_price, images, category_main").eq("is_published", true).ilike("name", `%${searchQuery}%`).limit(6);
      setSearchResults(data ?? []);
      setSearchLoading(false);
    }, 300);
  }, [searchQuery]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserMenu(false);
    setMobileOpen(false);
    router.push("/");
  };

  const openMenu = (label: string) => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
    setActiveMenu(label);
  };

  const closeMenu = () => {
    menuTimeoutRef.current = setTimeout(() => setActiveMenu(null), 200);
  };

  const openUserMenu = () => {
    if (userMenuTimeoutRef.current) clearTimeout(userMenuTimeoutRef.current);
    setUserMenu(true);
  };

  const closeUserMenu = () => {
    userMenuTimeoutRef.current = setTimeout(() => setUserMenu(false), 200);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
      <>
        <nav style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(184,154,106,0.2)", background: "rgba(250,248,245,0.95)", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" }}>

          <Link href="/" className="navbar-logo" style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "24px", letterSpacing: "0.3em", color: "#2a2520", fontWeight: 300, textDecoration: "none" }}>
            TENDENZE
          </Link>

          {/* DESKTOP MENU */}
          <div className="nav-desktop" style={{ gap: "36px" }}>
            {menuItems.map((item) => (
                <div key={item.label} onMouseEnter={() => openMenu(item.label)} onMouseLeave={closeMenu} style={{ position: "relative", paddingBottom: "8px" }}>
                  <Link href={item.gender ? `/prodotti?gender=${item.gender}` : item.label === "New Arrivals" ? "/prodotti?new=true" : "/prodotti?sale=true"} style={{ fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", color: activeMenu === item.label ? "#b89a6a" : "#2a2520", textDecoration: "none", opacity: activeMenu && activeMenu !== item.label ? 0.5 : 1, fontWeight: 300, transition: "color 0.2s, opacity 0.2s", paddingBottom: "4px", borderBottom: activeMenu === item.label ? "1px solid #b89a6a" : "1px solid transparent" }}>
                    {item.label}
                  </Link>
                  {item.sub.length > 0 && activeMenu === item.label && (
                      <div onMouseEnter={() => openMenu(item.label)} onMouseLeave={closeMenu} style={{ position: "absolute", top: "100%", left: "0", background: "white", border: "1px solid rgba(184,154,106,0.2)", borderTop: "2px solid #b89a6a", minWidth: "200px", padding: "8px 0", boxShadow: "0 8px 32px rgba(42,37,32,0.08)", zIndex: 200 }}>
                        {item.sub.map((sub) => {
                          const subItems = item.gender ? (SUBCATEGORIES[item.gender]?.[sub] ?? []) : [];
                          return (
                              <div key={sub} style={{ position: "relative" }} onMouseEnter={(e) => { const el = e.currentTarget.querySelector(".submenu") as HTMLElement; if (el) el.style.display = "block"; }} onMouseLeave={(e) => { const el = e.currentTarget.querySelector(".submenu") as HTMLElement; if (el) el.style.display = "none"; }}>
                                <Link href={`/prodotti?gender=${item.gender}&main=${encodeURIComponent(sub)}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#2a2520", textDecoration: "none", fontWeight: 300 }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(184,154,106,0.08)"; (e.currentTarget as HTMLElement).style.color = "#b89a6a"; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#2a2520"; }}>
                                  {sub}{subItems.length > 0 && <span style={{ fontSize: 10, opacity: 0.5 }}>›</span>}
                                </Link>
                                {subItems.length > 0 && (
                                    <div className="submenu" style={{ display: "none", position: "absolute", top: 0, left: "100%", background: "white", border: "1px solid rgba(184,154,106,0.2)", borderTop: "2px solid #b89a6a", minWidth: "180px", padding: "8px 0", boxShadow: "0 8px 32px rgba(42,37,32,0.08)", zIndex: 201 }}>
                                      {subItems.map((s) => (
                                          <Link key={s} href={`/prodotti?gender=${item.gender}&main=${encodeURIComponent(sub)}&sub=${encodeURIComponent(s)}`} style={{ display: "block", padding: "10px 20px", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#2a2520", textDecoration: "none", fontWeight: 300 }} onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "rgba(184,154,106,0.08)"; (e.target as HTMLElement).style.color = "#b89a6a"; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "transparent"; (e.target as HTMLElement).style.color = "#2a2520"; }}>{s}</Link>
                                      ))}
                                    </div>
                                )}
                              </div>
                          );
                        })}
                      </div>
                  )}
                </div>
            ))}
          </div>

          {/* ICONE */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button onClick={() => setSearchOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", color: "#2a2520", opacity: 0.7 }} onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="10.5" cy="10.5" r="6.5" /><line x1="15.5" y1="15.5" x2="21" y2="21" /></svg>
            </button>

            <Link href="/carrello" style={{ padding: "6px", color: "#2a2520", opacity: 0.7, position: "relative", textDecoration: "none" }} onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
              {count > 0 && <span style={{ position: "absolute", top: "2px", right: "2px", background: "#b89a6a", color: "white", fontSize: "8px", width: "14px", height: "14px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{count}</span>}
            </Link>

            {/* USER DESKTOP */}
            {user ? (
                <div className="nav-desktop" style={{ position: "relative" }} onMouseEnter={openUserMenu} onMouseLeave={closeUserMenu}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(184,154,106,0.15)", border: "1px solid #b89a6a", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12, color: "#b89a6a", fontWeight: 400 }}>
                    {user.user_metadata?.nome?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase()}
                  </div>
                  {userMenu && (
                      <div onMouseEnter={openUserMenu} onMouseLeave={closeUserMenu} style={{ position: "absolute", top: "100%", right: 0, background: "white", border: "1px solid rgba(184,154,106,0.2)", borderTop: "2px solid #b89a6a", minWidth: 180, padding: "8px 0", boxShadow: "0 8px 32px rgba(42,37,32,0.08)", zIndex: 200, marginTop: 8 }}>
                        <div style={{ padding: "10px 20px", fontSize: 11, fontWeight: 300, color: "#9e8c78", borderBottom: "1px solid rgba(184,154,106,0.1)" }}>{user.user_metadata?.nome} {user.user_metadata?.cognome}</div>
                        <Link href="/profilo" style={{ display: "block", padding: "10px 20px", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#2a2520", textDecoration: "none", fontWeight: 300 }} onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "rgba(184,154,106,0.08)"; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "transparent"; }}>Il mio profilo</Link>
                        <Link href="/preferiti" style={{ display: "block", padding: "10px 20px", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#2a2520", textDecoration: "none", fontWeight: 300 }} onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "rgba(184,154,106,0.08)"; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "transparent"; }}>I miei preferiti</Link>
                        <Link href="/ordini" style={{ display: "block", padding: "10px 20px", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#2a2520", textDecoration: "none", fontWeight: 300 }} onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "rgba(184,154,106,0.08)"; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "transparent"; }}>I miei ordini</Link>
                        <button onClick={handleLogout} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 20px", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c97a6a", background: "none", border: "none", cursor: "pointer", fontFamily: "sans-serif", fontWeight: 300 }} onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "rgba(201,122,106,0.08)"; }} onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "transparent"; }}>Esci</button>
                      </div>
                  )}
                </div>
            ) : (
                <Link href="/login" className="nav-desktop" style={{ padding: "6px", color: "#2a2520", opacity: 0.7, textDecoration: "none" }} onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </Link>
            )}

            {/* HAMBURGER */}
            <button className="nav-mobile-btn" onClick={() => setMobileOpen(!mobileOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", color: "#2a2520", flexDirection: "column", gap: "5px" }}>
              <span style={{ display: "block", width: 22, height: 1.5, background: "#2a2520", transition: "transform 0.3s ease, opacity 0.3s ease", transform: mobileOpen ? "translateY(6.5px) rotate(45deg)" : "none" }} />
              <span style={{ display: "block", width: 22, height: 1.5, background: "#2a2520", transition: "opacity 0.3s ease", opacity: mobileOpen ? 0 : 1 }} />
              <span style={{ display: "block", width: 22, height: 1.5, background: "#2a2520", transition: "transform 0.3s ease, opacity 0.3s ease", transform: mobileOpen ? "translateY(-6.5px) rotate(-45deg)" : "none" }} />
            </button>

          </div>
        </nav>

        {/* MOBILE MENU */}
        {mobileOpen && (
            <div className="mobile-menu" style={{ position: "fixed", top: 65, left: 0, right: 0, bottom: 0, background: "#faf8f5", zIndex: 99, overflowY: "auto", borderTop: "1px solid rgba(184,154,106,0.2)" }}>
              <div style={{ padding: "24px 24px 40px" }}>

                {user && (
                    <div style={{ padding: "16px 0", borderBottom: "1px solid rgba(184,154,106,0.15)", marginBottom: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 400, color: "#2a2520" }}>{user.user_metadata?.nome} {user.user_metadata?.cognome}</div>
                      <div style={{ fontSize: 11, fontWeight: 300, color: "#9e8c78", marginTop: 2 }}>{user.email}</div>
                    </div>
                )}

                {menuItems.map((item) => (
                    <div key={item.label} style={{ borderBottom: "1px solid rgba(184,154,106,0.1)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", cursor: "pointer" }} onClick={() => {
                        if (item.sub.length > 0) {
                          setMobileExpanded(mobileExpanded === item.label ? null : item.label);
                        } else {
                          const href = item.gender ? `/prodotti?gender=${item.gender}` : item.label === "New Arrivals" ? "/prodotti?new=true" : "/prodotti?sale=true";
                          router.push(href);
                          setMobileOpen(false);
                        }
                      }}>
                        <span style={{ fontSize: 14, fontWeight: 300, letterSpacing: "0.15em", textTransform: "uppercase", color: "#2a2520" }}>{item.label}</span>
                        {item.sub.length > 0 && <span style={{ fontSize: 18, color: "#b89a6a", transform: mobileExpanded === item.label ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>›</span>}
                      </div>
                      {item.sub.length > 0 && mobileExpanded === item.label && (
                          <div style={{ paddingLeft: 16, paddingBottom: 16 }}>
                            {item.sub.map(sub => (
                                <Link key={sub} href={`/prodotti?gender=${item.gender}&main=${encodeURIComponent(sub)}`} onClick={() => setMobileOpen(false)} style={{ display: "block", padding: "10px 0", fontSize: 12, fontWeight: 300, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9e8c78", textDecoration: "none" }}>
                                  {sub}
                                </Link>
                            ))}
                          </div>
                      )}
                    </div>
                ))}

                <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 4 }}>
                  {user ? (
                      <>
                        <Link href="/profilo" onClick={() => setMobileOpen(false)} style={{ padding: "12px 0", fontSize: 12, fontWeight: 300, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2a2520", textDecoration: "none" }}>Il mio profilo</Link>
                        <Link href="/preferiti" onClick={() => setMobileOpen(false)} style={{ padding: "12px 0", fontSize: 12, fontWeight: 300, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2a2520", textDecoration: "none" }}>I miei preferiti</Link>
                        <Link href="/ordini" onClick={() => setMobileOpen(false)} style={{ padding: "12px 0", fontSize: 12, fontWeight: 300, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2a2520", textDecoration: "none" }}>I miei ordini</Link>
                        <button onClick={handleLogout} style={{ padding: "12px 0", fontSize: 12, fontWeight: 300, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c97a6a", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "sans-serif" }}>Esci</button>
                      </>
                  ) : (
                      <>
                        <Link href="/login" onClick={() => setMobileOpen(false)} style={{ padding: "12px 0", fontSize: 12, fontWeight: 300, letterSpacing: "0.1em", textTransform: "uppercase", color: "#2a2520", textDecoration: "none" }}>Accedi</Link>
                        <Link href="/registrati" onClick={() => setMobileOpen(false)} style={{ padding: "12px 0", fontSize: 12, fontWeight: 300, letterSpacing: "0.1em", textTransform: "uppercase", color: "#b89a6a", textDecoration: "none" }}>Registrati</Link>
                      </>
                  )}
                </div>
              </div>
            </div>
        )}

        {/* SEARCH OVERLAY */}
        {searchOpen && (
            <div onClick={closeSearch} style={{ position: "fixed", inset: 0, background: "rgba(42,37,32,0.4)", zIndex: 200, backdropFilter: "blur(4px)" }}>
              <div onClick={(e) => e.stopPropagation()} style={{ background: "white", padding: "24px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, maxWidth: 800, margin: "0 auto" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b89a6a" strokeWidth="1.5" strokeLinecap="round"><circle cx="10.5" cy="10.5" r="6.5" /><line x1="15.5" y1="15.5" x2="21" y2="21" /></svg>
                  <input ref={searchInputRef} type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cerca prodotti..." style={{ flex: 1, border: "none", outline: "none", fontSize: 18, fontWeight: 300, fontFamily: "var(--font-cormorant), serif", color: "#2a2520", background: "transparent" }} onKeyDown={(e) => { if (e.key === "Escape") closeSearch(); if (e.key === "Enter" && searchQuery.trim()) { router.push(`/prodotti?search=${encodeURIComponent(searchQuery.trim())}`); closeSearch(); } }} />
                  <button onClick={closeSearch} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 24, color: "#9e8c78" }}>x</button>
                </div>
                {searchQuery && (
                    <div style={{ maxWidth: 800, margin: "16px auto 0" }}>
                      {searchLoading ? (
                          <div style={{ fontSize: 12, color: "#9e8c78", fontWeight: 300 }}>Ricerca in corso...</div>
                      ) : searchResults.length === 0 ? (
                          <div style={{ fontSize: 12, color: "#9e8c78", fontWeight: 300 }}>Nessun prodotto trovato per &quot;{searchQuery}&quot;</div>
                      ) : (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                            {searchResults.map((product) => (
                                <Link key={product.id} href={`/prodotti/${product.id}`} onClick={closeSearch} style={{ display: "flex", gap: 12, textDecoration: "none", alignItems: "center" }}>
                                  <div style={{ width: 48, height: 64, background: "#e8ddd0", flexShrink: 0, overflow: "hidden", position: "relative" }}>
                                    {product.images?.[0] ? <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: "cover" }} sizes="48px" /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, opacity: 0.3 }}>o</div>}
                                  </div>
                                  <div>
                                    <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 15, fontWeight: 300, color: "#2a2520", marginBottom: 2 }}>{product.name}</div>
                                    <div style={{ fontSize: 10, fontWeight: 300, color: "#9e8c78", letterSpacing: "0.1em", marginBottom: 2 }}>{product.category_main}</div>
                                    <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 15, fontWeight: 300, color: "#2a2520" }}>€ {product.discounted_price ?? product.price}</div>
                                  </div>
                                </Link>
                            ))}
                          </div>
                      )}
                    </div>
                )}
              </div>
            </div>
        )}
      </>
  );
}
