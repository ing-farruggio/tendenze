// Carica le immagini dimostrative sul bucket storage "products" e inserisce i
// prodotti corrispondenti nella tabella products.
//
// Uso:  node scripts/popola-db-demo.mjs          inserisce quel che manca
//       node scripts/popola-db-demo.mjs --rimuovi  cancella solo cio' che questo
//                                                  script ha creato
//
// E' idempotente e non distruttivo: inserisce solo i prodotti il cui nome non
// e' gia' presente, e non tocca mai righe che non siano nel catalogo demo.

import { readFile, readdir } from "node:fs/promises";
import { PRODOTTI_DEMO } from "./catalogo-demo.mjs";

const ENV = new URL("../.env.local", import.meta.url);
const DEMO_DIR = new URL("../public/demo/", import.meta.url);
const PREFISSO = "demo/";
const BUCKET = "products";

async function leggiEnv() {
  const testo = await readFile(ENV, "utf8");
  const env = {};
  for (const riga of testo.split(/\r?\n/)) {
    const m = riga.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY mancanti in .env.local");
  return { url, key };
}

const intestazioni = key => ({ apikey: key, Authorization: `Bearer ${key}` });

async function caricaImmagini({ url, key }) {
  const file = (await readdir(DEMO_DIR)).filter(f => f.endsWith(".jpg")).sort();
  let caricate = 0;
  for (const f of file) {
    const corpo = await readFile(new URL(f, DEMO_DIR));
    const r = await fetch(`${url}/storage/v1/object/${BUCKET}/${PREFISSO}${f}`, {
      method: "POST",
      headers: { ...intestazioni(key), "Content-Type": "image/jpeg", "x-upsert": "true" },
      body: corpo,
    });
    if (!r.ok) throw new Error(`upload ${f}: HTTP ${r.status} ${await r.text()}`);
    caricate++;
    if (caricate % 12 === 0) process.stdout.write(`  ${caricate}/${file.length}\n`);
  }
  return caricate;
}

const urlPubblico = (base, file) => `${base}/storage/v1/object/public/${BUCKET}/${PREFISSO}${file}`;

async function nomiEsistenti({ url, key }) {
  const r = await fetch(`${url}/rest/v1/products?select=name`, { headers: intestazioni(key) });
  if (!r.ok) throw new Error(`lettura products: HTTP ${r.status}`);
  return new Set((await r.json()).map(p => p.name));
}

async function inserisci({ url, key }) {
  const gia = await nomiEsistenti({ url, key });
  const righe = PRODOTTI_DEMO
    .filter(p => !gia.has(p.name))
    .map(p => ({
      name: p.name,
      description: p.description,
      price: p.price,
      discounted_price: p.discounted_price,
      category_gender: p.category_gender,
      category_main: p.category_main,
      category_sub: p.category_sub || null,
      stock: p.stock,
      is_new: p.is_new,
      is_published: p.is_published,
      images: [1, 2, 3].map(n => urlPubblico(url, `${p.slug}-${n}.jpg`)),
    }));

  const saltati = PRODOTTI_DEMO.length - righe.length;
  if (righe.length === 0) {
    console.log(`Nessun inserimento: tutti e ${saltati} i prodotti demo sono gia' presenti.`);
    return 0;
  }

  const r = await fetch(`${url}/rest/v1/products`, {
    method: "POST",
    headers: { ...intestazioni(key), "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(righe),
  });
  if (!r.ok) throw new Error(`insert: HTTP ${r.status} ${await r.text()}`);
  const creati = await r.json();
  if (saltati > 0) console.log(`  ${saltati} gia' presenti, saltati.`);
  return creati.length;
}

async function rimuovi({ url, key }) {
  const nomi = PRODOTTI_DEMO.map(p => p.name);
  const filtro = `name=in.(${nomi.map(n => `"${n.replace(/"/g, '""')}"`).join(",")})`;
  const r = await fetch(`${url}/rest/v1/products?${filtro}`, {
    method: "DELETE",
    headers: { ...intestazioni(key), Prefer: "return=representation" },
  });
  if (!r.ok) throw new Error(`delete: HTTP ${r.status} ${await r.text()}`);
  const tolti = await r.json();

  const file = (await readdir(DEMO_DIR)).filter(f => f.endsWith(".jpg"));
  const rs = await fetch(`${url}/storage/v1/object/${BUCKET}`, {
    method: "DELETE",
    headers: { ...intestazioni(key), "Content-Type": "application/json" },
    body: JSON.stringify({ prefixes: file.map(f => `${PREFISSO}${f}`) }),
  });
  if (!rs.ok) throw new Error(`storage delete: HTTP ${rs.status} ${await rs.text()}`);

  console.log(`Rimossi ${tolti.length} prodotti demo e ${file.length} immagini. Le righe non demo non sono state toccate.`);
}

async function main() {
  const cfg = await leggiEnv();
  if (process.argv.includes("--rimuovi")) return rimuovi(cfg);

  console.log("Carico le immagini sul bucket storage...");
  const n = await caricaImmagini(cfg);
  console.log(`  ${n} immagini caricate in ${BUCKET}/${PREFISSO}`);

  console.log("Inserisco i prodotti...");
  const creati = await inserisci(cfg);
  console.log(`  ${creati} prodotti inseriti.`);
}

main().catch(e => { console.error("\nERRORE:", e.message); process.exit(1); });
