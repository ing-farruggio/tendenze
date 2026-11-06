// Genera il catalogo di immagini dimostrative in public/demo/.
//
// Sono illustrazioni, non fotografie: senza una API key di Unsplash o Pexels
// non e' possibile ottenere foto *pertinenti* (gli endpoint per parola chiave
// sono stati dismessi), e immagini casuali su un sito di gioielleria sono
// peggio di un disegno fatto bene. Disegnate con le primitive geometriche
// nella palette del negozio: nessun problema di licenza, file leggeri.
//
// Uso:  node scripts/genera-immagini-demo.mjs
// Richiede sharp, che arriva gia' con Next.

import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { PRODOTTI_DEMO } from "./catalogo-demo.mjs";

const W = 800;
const H = 1067; // rapporto 3/4, lo stesso usato dalle griglie prodotto

const C = {
  crema: "#faf8f5",
  cremaScura: "#f1ebe1",
  sabbia: "#e8ddd0",
  tortora: "#ded2c2",
  oro: "#b89a6a",
  oroChiaro: "#cdbb98",
  scuro: "#2a2520",
  muto: "#9e8c78",
};

// Ogni prodotto ha un fondo costante nelle sue tre immagini, cosi' la galleria
// sembra un set unico e non tre scatti scollegati.
const FONDI = [C.crema, C.cremaScura, C.sabbia, C.tortora];

// Gli override arrivano come stringa di attributi: se ne contengono uno che
// l'helper emette di suo, il predefinito va omesso — in XML un attributo
// ripetuto non e' "l'ultimo vince", e' un documento non valido.
function attributi(predefiniti, extra) {
  const presenti = [...extra.matchAll(/([a-z-]+)\s*=/g)].map(m => m[1]);
  const tenuti = Object.entries(predefiniti)
    .filter(([k]) => !presenti.includes(k))
    .map(([k, v]) => `${k}="${v}"`);
  return [...tenuti, extra].join(" ").trim();
}

const linea = (extra = "") =>
  attributi(
    { fill: "none", stroke: C.oro, "stroke-width": "2.4", "stroke-linecap": "round", "stroke-linejoin": "round" },
    extra
  );
const lineaSottile = (extra = "") =>
  attributi(
    { fill: "none", stroke: C.oroChiaro, "stroke-width": "1.4", "stroke-linecap": "round" },
    extra
  );
const pieno = (c = C.oro) => `fill="${c}" stroke="none"`;

// --- soggetti, disegnati su una tela logica 400x400 centrata in 0,0 ---

// Punto su una Bezier quadratica: serve per appoggiare le perle sulla catena
// invece che su una parabola approssimata, che le faceva galleggiare accanto.
function bezier2(p0, p1, p2, t) {
  const u = 1 - t;
  return [
    u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
    u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
  ];
}

function collana() {
  const sx = [-150, -170], sc = [-150, 60], giu = [0, 120];
  const perle = [0.42, 0.62, 0.8].flatMap(t => {
    const [x, y] = bezier2(sx, sc, giu, t);
    return [
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" ${pieno(C.oroChiaro)} />`,
      `<circle cx="${(-x).toFixed(1)}" cy="${y.toFixed(1)}" r="7" ${pieno(C.oroChiaro)} />`,
    ];
  }).join("");
  return `
    <path d="M -150 -170 Q -150 60 0 120 Q 150 60 150 -170" ${linea()} />
    <path d="M -150 -170 Q -130 -180 -110 -172" ${linea()} />
    <path d="M 150 -170 Q 130 -180 110 -172" ${linea()} />
    ${perle}
    <path d="M 0 120 L 0 134" ${linea()} />
    <circle cx="0" cy="166" r="30" ${pieno()} />
    <circle cx="0" cy="166" r="42" ${lineaSottile()} />
    <circle cx="-10" cy="156" r="7" ${pieno(C.crema)} opacity="0.5" />
  `;
}

function bracciale() {
  return `
    <ellipse cx="0" cy="0" rx="155" ry="118" ${linea('stroke-width="9"')} />
    <ellipse cx="0" cy="0" rx="128" ry="94" ${lineaSottile()} />
    ${Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return `<circle cx="${(Math.cos(a) * 141).toFixed(0)}" cy="${(Math.sin(a) * 106).toFixed(0)}" r="7" ${pieno()} />`;
    }).join("")}
  `;
}

function orecchini() {
  const uno = (dx) => `
    <g transform="translate(${dx} 0)">
      <path d="M 0 -150 a 26 26 0 1 1 0.1 0" ${linea()} />
      <path d="M 0 -124 L 0 -70" ${lineaSottile()} />
      <ellipse cx="0" cy="-20" rx="34" ry="48" ${pieno()} />
      <ellipse cx="-10" cy="-38" rx="9" ry="13" ${pieno(C.crema)} opacity="0.55" />
    </g>`;
  return uno(-80) + uno(80);
}

function anello() {
  return `
    <circle cx="0" cy="40" r="120" ${linea('stroke-width="12"')} />
    <circle cx="0" cy="40" r="96" ${lineaSottile()} />
    <g transform="translate(0 -100)">
      <ellipse cx="0" cy="0" rx="44" ry="54" ${pieno()} />
      <ellipse cx="0" cy="0" rx="44" ry="54" ${linea('stroke-width="1.8"')} />
      <path d="M -44 0 L 0 -54 L 44 0 L 0 54 Z" ${lineaSottile('stroke="#faf8f5"')} opacity="0.7" />
    </g>
  `;
}

function orologio(scuroQuadrante = false) {
  const q = scuroQuadrante ? C.scuro : C.crema;
  const lancette = scuroQuadrante ? C.oroChiaro : C.scuro;
  return `
    <rect x="-46" y="-205" width="92" height="90" rx="14" ${linea()} />
    <rect x="-46" y="115" width="92" height="90" rx="14" ${linea()} />
    <circle cx="0" cy="0" r="128" ${pieno(q)} />
    <circle cx="0" cy="0" r="128" ${linea('stroke-width="7"')} />
    <circle cx="0" cy="0" r="106" ${lineaSottile()} />
    ${Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      const r1 = 92, r2 = 102;
      return `<line x1="${(Math.sin(a) * r1).toFixed(0)}" y1="${(-Math.cos(a) * r1).toFixed(0)}" x2="${(Math.sin(a) * r2).toFixed(0)}" y2="${(-Math.cos(a) * r2).toFixed(0)}" stroke="${C.oro}" stroke-width="3" stroke-linecap="round" />`;
    }).join("")}
    <line x1="0" y1="12" x2="0" y2="-62" stroke="${lancette}" stroke-width="5" stroke-linecap="round" />
    <line x1="0" y1="10" x2="56" y2="34" stroke="${lancette}" stroke-width="4" stroke-linecap="round" />
    <circle cx="0" cy="0" r="7" ${pieno()} />
  `;
}

function borsa() {
  return `
    <path d="M -108 -82 Q -108 -186 0 -186 Q 108 -186 108 -82" ${linea('stroke-width="7"')} />
    <path d="M -158 -70 L 158 -70 L 136 168 Q 134 188 112 188 L -112 188 Q -134 188 -136 168 Z" ${linea('stroke-width="3.2"')} />
    <path d="M -158 -70 L 158 -70" ${linea('stroke-width="5"')} />
    <rect x="-26" y="-34" width="52" height="38" rx="7" ${pieno()} />
    <path d="M -100 40 L 100 40" ${lineaSottile('stroke-dasharray="7 9"')} />
    <path d="M -100 110 L 100 110" ${lineaSottile('stroke-dasharray="7 9"')} />
  `;
}

function portafoglio() {
  return `
    <rect x="-180" y="-118" width="360" height="236" rx="18" ${linea('stroke-width="3.2"')} />
    <path d="M -180 0 L 180 0" ${linea('stroke-width="4"')} />
    <rect x="-162" y="-100" width="324" height="200" rx="12" ${lineaSottile('stroke-dasharray="6 8"')} />
    <rect x="42" y="-62" width="104" height="52" rx="6" ${pieno(C.oroChiaro)} opacity="0.55" />
    <path d="M -146 46 L -40 46" ${linea('stroke-width="3"')} />
  `;
}

function cintura() {
  return `
    <g transform="rotate(-24)">
      <rect x="-240" y="-34" width="420" height="68" rx="8" ${linea('stroke-width="3.2"')} />
      <rect x="-226" y="-20" width="392" height="40" rx="4" ${lineaSottile('stroke-dasharray="6 8"')} />
      ${[-180, -130, -80, -30].map(x => `<ellipse cx="${x}" cy="0" rx="9" ry="13" ${linea('stroke-width="2"')} />`).join("")}
      <rect x="170" y="-52" width="92" height="104" rx="12" ${linea('stroke-width="6"')} />
      <line x1="216" y1="-52" x2="216" y2="52" ${linea('stroke-width="4"')} />
    </g>
  `;
}

function foulard() {
  return `
    <path d="M -170 -150 Q -40 -110 30 -170 Q 140 -210 180 -120 Q 120 -40 160 50 Q 180 150 60 170 Q -60 190 -120 120 Q -190 40 -170 -150 Z" ${linea('stroke-width="3"')} />
    <path d="M -120 -110 Q -20 -70 60 -120" ${lineaSottile()} />
    <path d="M -130 -40 Q -10 10 110 -40" ${lineaSottile()} />
    <path d="M -110 40 Q 0 90 120 50" ${lineaSottile()} />
    <path d="M -80 120 Q 20 150 90 120" ${lineaSottile()} />
    <circle cx="-30" cy="-20" r="13" ${pieno(C.oroChiaro)} opacity="0.6" />
    <circle cx="70" cy="70" r="9" ${pieno(C.oroChiaro)} opacity="0.6" />
  `;
}

function cappello() {
  return `
    <ellipse cx="0" cy="70" rx="215" ry="62" ${linea('stroke-width="3.2"')} />
    <ellipse cx="0" cy="70" rx="176" ry="48" ${lineaSottile()} />
    <path d="M -96 70 Q -104 -118 0 -124 Q 104 -118 96 70" ${linea('stroke-width="3.2"')} />
    <path d="M -100 34 L 100 34" ${linea('stroke-width="13"')} />
    <path d="M 56 34 l 34 -22 l 6 26 Z" ${pieno()} />
  `;
}

function guanti() {
  const mano = (dx, flip) => `
    <g transform="translate(${dx} 0) scale(${flip} 1)">
      <path d="M -58 120 L -58 -42 Q -58 -62 -40 -62 Q -22 -62 -22 -42 L -22 -8" ${linea('stroke-width="3"')} />
      <path d="M -22 -24 Q -22 -86 -2 -86 Q 18 -86 18 -24" ${linea('stroke-width="3"')} />
      <path d="M 18 -20 Q 18 -74 36 -74 Q 54 -74 54 -20" ${linea('stroke-width="3"')} />
      <path d="M 54 -14 Q 54 -52 68 -52 Q 82 -52 82 -14 L 82 64 Q 82 120 20 120 L -58 120" ${linea('stroke-width="3"')} />
      <rect x="-62" y="112" width="148" height="56" rx="10" ${linea('stroke-width="3"')} />
      <path d="M -62 140 L 86 140" ${lineaSottile('stroke-dasharray="6 7"')} />
    </g>`;
  return mano(-110, 1) + mano(110, -1);
}

function spilla() {
  return `
    ${Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2;
      return `<ellipse cx="${(Math.cos(a) * 72).toFixed(0)}" cy="${(Math.sin(a) * 72).toFixed(0)}" rx="46" ry="30" transform="rotate(${(i * 60).toFixed(0)} ${(Math.cos(a) * 72).toFixed(0)} ${(Math.sin(a) * 72).toFixed(0)})" ${linea('stroke-width="2.6"')} />`;
    }).join("")}
    <circle cx="0" cy="0" r="34" ${pieno()} />
    <circle cx="0" cy="0" r="46" ${lineaSottile()} />
    <path d="M 96 96 L 186 186" ${linea('stroke-width="3"')} />
    <circle cx="190" cy="190" r="9" ${pieno(C.oroChiaro)} />
  `;
}

function gemelli() {
  const uno = (dx, dy) => `
    <g transform="translate(${dx} ${dy})">
      <ellipse cx="0" cy="0" rx="76" ry="56" ${linea('stroke-width="4"')} />
      <ellipse cx="0" cy="0" rx="56" ry="38" ${lineaSottile()} />
      <ellipse cx="0" cy="0" rx="22" ry="16" ${pieno()} />
      <path d="M 0 56 L 0 104" ${linea('stroke-width="5"')} />
      <path d="M -30 112 L 30 112" ${linea('stroke-width="9"')} />
    </g>`;
  return uno(-96, -58) + uno(96, 42);
}

const SOGGETTI = {
  collana,
  bracciale,
  orecchini,
  anello,
  orologio: () => orologio(false),
  orologioScuro: () => orologio(true),
  borsa,
  portafoglio,
  cintura,
  foulard,
  cappello,
  guanti,
  spilla,
  gemelli,
};

// variante 0: inquadratura piena · 1: dettaglio ravvicinato · 2: taglio obliquo
const VARIANTI = [
  { scala: 1.5, dx: 0, dy: -10, rot: 0 },
  { scala: 2.3, dx: 30, dy: -30, rot: 0 },
  { scala: 1.65, dx: -20, dy: 10, rot: -10 },
];

function componi(soggetto, fondo, variante) {
  const v = VARIANTI[variante];
  const corpo = SOGGETTI[soggetto]();
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="luce" cx="42%" cy="34%" r="76%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.72" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="ombra" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${C.muto}" stop-opacity="0.26" />
      <stop offset="100%" stop-color="${C.muto}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${fondo}" />
  <rect width="${W}" height="${H}" fill="url(#luce)" />
  <ellipse cx="${W / 2}" cy="${H * 0.74}" rx="${W * 0.34}" ry="46" fill="url(#ombra)" />
  <g transform="translate(${W / 2 + v.dx} ${H / 2 + v.dy}) rotate(${v.rot}) scale(${v.scala})">
    ${corpo}
  </g>
  <rect x="26" y="26" width="${W - 52}" height="${H - 52}" fill="none" stroke="${C.oro}" stroke-width="1" opacity="0.26" />
</svg>`;
}

const DIR = new URL("../public/demo/", import.meta.url);

// --- scene larghe: hero e banner atelier ---

// I soggetti scrivono il colore su ogni elemento, quindi un override sul gruppo
// padre non verrebbe ereditato: per il fondo scuro si riscrive la palette.
function suFondoScuro(svgInterno) {
  return svgInterno
    .split(C.oro).join("#d9bd86")
    .split(C.oroChiaro).join("#a98f5e")
    .split(C.crema).join(C.scuro);
}

function scena(w, h, fondo, pezzi, scuro = false) {
  const corpo = pezzi
    .map(p => `<g transform="translate(${p.x} ${p.y}) rotate(${p.rot ?? 0}) scale(${p.s})" opacity="${p.op ?? 1}">${SOGGETTI[p.soggetto]()}</g>`)
    .join("");
  // Solo i pezzi grandi e in primo piano proiettano ombra: sotto i piccoli
  // l'ellisse si stacca dal soggetto e si legge come una macchia vagante.
  const ombre = pezzi
    .filter(p => (p.op ?? 1) > 0.5 && p.s >= 0.7)
    .map(p => `<ellipse cx="${p.x}" cy="${p.y + 230 * p.s}" rx="${210 * p.s}" ry="${30 * p.s}" fill="url(#ombra)" />`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <radialGradient id="luce" cx="36%" cy="28%" r="80%">
      <stop offset="0%" stop-color="${scuro ? "#4a4036" : "#ffffff"}" stop-opacity="${scuro ? 0.55 : 0.8}" />
      <stop offset="100%" stop-color="${scuro ? "#4a4036" : "#ffffff"}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="ombra" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${scuro ? "#000000" : C.muto}" stop-opacity="${scuro ? 0.4 : 0.22}" />
      <stop offset="100%" stop-color="${scuro ? "#000000" : C.muto}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="${fondo}" />
  <rect width="${w}" height="${h}" fill="url(#luce)" />
  ${ombre}
  ${scuro ? suFondoScuro(corpo) : corpo}
</svg>`;
}

// Hero in verticale (1100x1400): il pannello .hero-right e' alto e stretto e
// usa object-fit cover, quindi il ritaglio avviene al centro. Una composizione
// orizzontale verrebbe tagliata proprio sul vuoto centrale: qui il soggetto
// principale sta al centro e i contorni reggono il taglio su qualunque lato.
// L'angolo in basso a sinistra resta volutamente sgombro: li' il layout
// sovrappone il riquadro con il conteggio dei pezzi (.hero-badge), e un
// soggetto in primo piano ci finirebbe sotto.
const SCENA_HERO = () => scena(1100, 1400, C.crema, [
  { soggetto: "borsa", x: 330, y: 1070, s: 1.0, rot: -4, op: 0.12 },
  { soggetto: "orecchini", x: 300, y: 300, s: 0.6, op: 0.85 },
  { soggetto: "collana", x: 560, y: 640, s: 1.35 },
  { soggetto: "anello", x: 835, y: 1115, s: 0.7 },
]);

// Banner atelier 3:2 sul fondo scuro della sezione.
const SCENA_ATELIER = () => scena(1200, 800, C.scuro, [
  { soggetto: "spilla", x: 330, y: 300, s: 0.72, rot: -12 },
  { soggetto: "anello", x: 640, y: 450, s: 0.95 },
  { soggetto: "orecchini", x: 930, y: 290, s: 0.6 },
  { soggetto: "bracciale", x: 880, y: 600, s: 0.62, rot: 10, op: 0.5 },
], true);

async function main() {
  await mkdir(DIR, { recursive: true });
  let n = 0;

  for (const [nome, fn] of [["hero", SCENA_HERO], ["atelier", SCENA_ATELIER]]) {
    const buf = await sharp(Buffer.from(fn())).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
    await writeFile(new URL(`${nome}.jpg`, DIR), buf);
    console.log(`  scena ${nome}.jpg`);
  }

  for (const p of PRODOTTI_DEMO) {
    const fondo = FONDI[p.fondo ?? 0];
    for (let v = 0; v < 3; v++) {
      const svg = componi(p.soggetto, fondo, v);
      const file = new URL(`${p.slug}-${v + 1}.jpg`, DIR);
      const buf = await sharp(Buffer.from(svg)).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
      await writeFile(file, buf);
      n++;
    }
  }
  console.log(`${n} immagini generate in public/demo/ (${PRODOTTI_DEMO.length} prodotti x 3 scatti)`);
}

main().catch(e => { console.error(e); process.exit(1); });
