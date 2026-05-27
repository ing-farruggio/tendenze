"use client";
import { useState, useEffect, useRef } from "react";
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
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [userMenu, setUserMenu] = useState(false);
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
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      setSearchLoading(true);
      const { data } = await supabase
        .from("products")
        .select("id, name, price, discounted_price, images, category_main")
        .eq("is_published", true)
        .ilike("name", `%${searchQuery}%`)
        .limit(6);
      setSearchResults(data ?? []);
      setSearchLoading(false);
    }, 300);
  }, [searchQuery]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserMenu(false);
    window.location.href = "/";
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
      <style>{`
  .navbar-logo {
    position: relative;
    display: inline-block;
  }
  .navbar-logo::after {
    content: '';
    position: absolute;
    bottom: -3px;
    left: 0;
    width: 0;
    height: 1px;
    background: linear-gradient(90deg, #b89a6a, #d4b98a, #b89a6a);
    animation: logoLine 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.5s forwards;
  }
  .navbar-logo:hover::after {
    animation: none;
    width: 100%;
    transition: width 0.4s ease;
  }
  .navbar-logo:not(:hover)::after {
    animation: logoLine 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.5s forwards;
  }
  @keyframes logoLine {
    0% { width: 0; opacity: 0; }
    10% { opacity: 1; }
    100% { width: 100%; opacity: 1; }
  }
`}</style>
      <nav style={{ padding: "24px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(184,154,106,0.2)", background: "rgba(250,248,245,0.95)", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" }}>

        <a href="/" style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "24px", letterSpacing: "0.3em", color: "#2a2520", fontWeight: 300, textDecoration: "none", position: "relative", display: "inline-block" }}
           className="navbar-logo"
        >
          TENDENZE
        </a>

        <div style={{ display: "flex", gap: "36px" }}>
          {menuItems.map((item) => (
            <div
              key={item.label}
              onMouseEnter={() => openMenu(item.label)}
              onMouseLeave={closeMenu}
              style={{ position: "relative", paddingBottom: "8px" }}
            >
              <a
                href={
                  item.gender
                    ? `/prodotti?gender=${item.gender}`
                    : item.label === "New Arrivals"
                    ? "/prodotti?new=true"
                    : "/prodotti?sale=true"
                }
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: activeMenu === item.label ? "#b89a6a" : "#2a2520",
                  textDecoration: "none",
                  opacity: activeMenu && activeMenu !== item.label ? 0.5 : 1,
                  fontWeight: 300,
                  transition: "color 0.2s, opacity 0.2s",
                  paddingBottom: "4px",
                  borderBottom: activeMenu === item.label ? "1px solid #b89a6a" : "1px solid transparent",
                }}
              >
                {item.label}
              </a>

              {item.sub.length > 0 && activeMenu === item.label && (
                <div
                  onMouseEnter={() => openMenu(item.label)}
                  onMouseLeave={closeMenu}
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: "0",
                    background: "white",
                    border: "1px solid rgba(184,154,106,0.2)",
                    borderTop: "2px solid #b89a6a",
                    minWidth: "200px",
                    padding: "8px 0",
                    boxShadow: "0 8px 32px rgba(42,37,32,0.08)",
                    zIndex: 200,
                  }}
                >
                  {item.sub.map((sub) => {
                    const subItems = item.gender ? (SUBCATEGORIES[item.gender]?.[sub] ?? []) : [];
                    return (
                      <div
                        key={sub}
                        style={{ position: "relative" }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget.querySelector(".submenu") as HTMLElement;
                          if (el) el.style.display = "block";
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget.querySelector(".submenu") as HTMLElement;
                          if (el) el.style.display = "none";
                        }}
                      >
                        <a
                          href={`/prodotti?gender=${item.gender}&main=${encodeURIComponent(sub)}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 20px",
                            fontSize: "11px",
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: "#2a2520",
                            textDecoration: "none",
                            fontWeight: 300,
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "rgba(184,154,106,0.08)";
                            (e.currentTarget as HTMLElement).style.color = "#b89a6a";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                            (e.currentTarget as HTMLElement).style.color = "#2a2520";
                          }}
                        >
                          {sub}
                          {subItems.length > 0 && (
                            <span style={{ fontSize: 10, opacity: 0.5 }}>›</span>
                          )}
                        </a>
                        {subItems.length > 0 && (
                          <div
                            className="submenu"
                            style={{
                              display: "none",
                              position: "absolute",
                              top: 0,
                              left: "100%",
                              background: "white",
                              border: "1px solid rgba(184,154,106,0.2)",
                              borderTop: "2px solid #b89a6a",
                              minWidth: "180px",
                              padding: "8px 0",
                              boxShadow: "0 8px 32px rgba(42,37,32,0.08)",
                              zIndex: 201,
                            }}
                          >
                            {subItems.map((s) => (
                              <a
                                key={s}
                                href={`/prodotti?gender=${item.gender}&main=${encodeURIComponent(sub)}&sub=${encodeURIComponent(s)}`}
                                style={{
                                  display: "block",
                                  padding: "10px 20px",
                                  fontSize: "11px",
                                  letterSpacing: "0.2em",
                                  textTransform: "uppercase",
                                  color: "#2a2520",
                                  textDecoration: "none",
                                  fontWeight: 300,
                                }}
                                onMouseEnter={(e) => {
                                  (e.target as HTMLElement).style.background = "rgba(184,154,106,0.08)";
                                  (e.target as HTMLElement).style.color = "#b89a6a";
                                }}
                                onMouseLeave={(e) => {
                                  (e.target as HTMLElement).style.background = "transparent";
                                  (e.target as HTMLElement).style.color = "#2a2520";
                                }}
                              >
                                {s}
                              </a>
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

        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <button
            onClick={() => setSearchOpen(true)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", color: "#2a2520", opacity: 0.7 }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <line x1="15.5" y1="15.5" x2="21" y2="21" />
            </svg>
          </button>

          <a
            href="/carrello"
            style={{ padding: "6px", color: "#2a2520", opacity: 0.7, position: "relative", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            {count > 0 && (
              <span style={{ position: "absolute", top: "2px", right: "2px", background: "#b89a6a", color: "white", fontSize: "8px", width: "14px", height: "14px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {count}
              </span>
            )}
          </a>

          {user ? (
            <div style={{ position: "relative" }} onMouseEnter={openUserMenu} onMouseLeave={closeUserMenu}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(184,154,106,0.15)", border: "1px solid #b89a6a", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12, color: "#b89a6a", fontWeight: 400 }}>
                {user.user_metadata?.nome?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase()}
              </div>
              {userMenu && (
                <div
                  onMouseEnter={openUserMenu}
                  onMouseLeave={closeUserMenu}
                  style={{ position: "absolute", top: "100%", right: 0, background: "white", border: "1px solid rgba(184,154,106,0.2)", borderTop: "2px solid #b89a6a", minWidth: 180, padding: "8px 0", boxShadow: "0 8px 32px rgba(42,37,32,0.08)", zIndex: 200, marginTop: 8 }}
                >
                  <div style={{ padding: "10px 20px", fontSize: 11, fontWeight: 300, color: "#9e8c78", borderBottom: "1px solid rgba(184,154,106,0.1)" }}>
                    {user.user_metadata?.nome} {user.user_metadata?.cognome}
                  </div>
                  <a
                    href="/profilo"
                    style={{ display: "block", padding: "10px 20px", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#2a2520", textDecoration: "none", fontWeight: 300 }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "rgba(184,154,106,0.08)"; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "transparent"; }}
                  >
                    Il mio profilo
                  </a>
                  <a
                    href="/preferiti"
                    style={{ display: "block", padding: "10px 20px", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#2a2520", textDecoration: "none", fontWeight: 300 }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "rgba(184,154,106,0.08)"; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "transparent"; }}
                  >
                    I miei preferiti
                  </a>
                  <a
                    href="/ordini"
                    style={{ display: "block", padding: "10px 20px", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#2a2520", textDecoration: "none", fontWeight: 300 }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "rgba(184,154,106,0.08)"; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "transparent"; }}
                  >
                    I miei ordini
                  </a>
                  <button
                    onClick={handleLogout}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 20px", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c97a6a", background: "none", border: "none", cursor: "pointer", fontFamily: "sans-serif", fontWeight: 300 }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "rgba(201,122,106,0.08)"; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "transparent"; }}
                  >
                    Esci
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a
              href="/login"
              style={{ padding: "6px", color: "#2a2520", opacity: 0.7, textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </a>
          )}
        </div>
      </nav>

      {searchOpen && (
        <div
          onClick={closeSearch}
          style={{ position: "fixed", inset: 0, background: "rgba(42,37,32,0.4)", zIndex: 200, backdropFilter: "blur(4px)" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "white", padding: "32px 48px", boxShadow: "0 8px 48px rgba(42,37,32,0.15)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, maxWidth: 800, margin: "0 auto" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b89a6a" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="10.5" cy="10.5" r="6.5" />
                <line x1="15.5" y1="15.5" x2="21" y2="21" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca prodotti..."
                style={{ flex: 1, border: "none", outline: "none", fontSize: 20, fontWeight: 300, fontFamily: "var(--font-cormorant), serif", color: "#2a2520", background: "transparent" }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") closeSearch();
                  if (e.key === "Enter" && searchQuery.trim()) {
                    window.location.href = `/prodotti?search=${encodeURIComponent(searchQuery.trim())}`;
                    closeSearch();
                  }
                }}
              />
              <button onClick={closeSearch} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 24, color: "#9e8c78" }}>
                x
              </button>
            </div>

            {searchQuery && (
              <div style={{ maxWidth: 800, margin: "24px auto 0" }}>
                {searchLoading ? (
                  <div style={{ fontSize: 12, color: "#9e8c78", fontWeight: 300 }}>Ricerca in corso...</div>
                ) : searchResults.length === 0 ? (
                  <div style={{ fontSize: 12, color: "#9e8c78", fontWeight: 300 }}>Nessun prodotto trovato per "{searchQuery}"</div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                    {searchResults.map((product) => (
                      <a
                        key={product.id}
                        href={`/prodotti/${product.id}`}
                        onClick={closeSearch}
                        style={{ display: "flex", gap: 12, textDecoration: "none", alignItems: "center" }}
                      >
                        <div style={{ width: 56, height: 72, background: "#e8ddd0", flexShrink: 0, overflow: "hidden" }}>
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, opacity: 0.3 }}>
                              o
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 16, fontWeight: 300, color: "#2a2520", marginBottom: 2 }}>
                            {product.name}
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 300, color: "#9e8c78", letterSpacing: "0.1em", marginBottom: 4 }}>
                            {product.category_main}
                          </div>
                          <div style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 16, fontWeight: 300, color: "#2a2520" }}>
                            E {product.discounted_price ?? product.price}
                          </div>
                        </div>
                      </a>
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
