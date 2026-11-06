-- =====================================================================
--  Tendenze — schema degli ordini (prerequisito per Stripe)
--  Da eseguire DOPO policies.sql, che definisce public.e_admin().
--  Editor SQL:
--  https://supabase.com/dashboard/project/herqoluhyyqahrreoygn/sql/new
--
--  Due principi, entrambi dettati da come e' fatta l'applicazione:
--
--  1. Le righe d'ordine sono una FOTOGRAFIA, non un riferimento. Nome,
--     prezzo e immagine vengono copiati nel momento dell'acquisto: se
--     domani cambi il prezzo o cancelli il prodotto, l'ordine gia' fatto
--     deve continuare a raccontare cosa e' stato comprato e a quanto.
--
--  2. Dal browser NON si scrive. Nessuna politica di inserimento per
--     anon o authenticated: gli ordini li crea solo il server, con la
--     chiave di servizio, dopo che Stripe ha confermato l'incasso.
--     Altrimenti chiunque potrebbe dichiararsi "pagato".
-- =====================================================================


-- ---------------------------------------------------------------------
-- Numerazione leggibile: ORD-2026-0001
-- Il progressivo deve venire dal database, non dall'applicazione: due
-- acquisti simultanei genererebbero lo stesso numero.
-- ---------------------------------------------------------------------

create sequence if not exists public.ordini_progressivo;

create or replace function public.prossimo_numero_ordine()
returns text
language sql
volatile
as $$
  select 'ORD-' || to_char(now(), 'YYYY') || '-' ||
         lpad(nextval('public.ordini_progressivo')::text, 4, '0');
$$;


-- ---------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------

create table if not exists public.orders (
  id                      uuid primary key default gen_random_uuid(),
  numero                  text unique not null default public.prossimo_numero_ordine(),

  -- Null se l'acquisto e' da ospite: l'email resta comunque obbligatoria,
  -- e' l'unico modo per mandare conferma e tracciamento.
  user_id                 uuid references auth.users(id) on delete set null,
  email                   text not null,

  stato                   text not null default 'in_attesa'
                          check (stato in ('in_attesa','pagato','spedito','consegnato','annullato','rimborsato')),

  -- Tutti gli importi sono interi in centesimi: Stripe lavora cosi' e i
  -- float sui prezzi avevano gia' rotto la soglia di spedizione gratuita.
  subtotale_centesimi     integer not null check (subtotale_centesimi >= 0),
  spedizione_centesimi    integer not null default 0 check (spedizione_centesimi >= 0),
  totale_centesimi        integer not null check (totale_centesimi >= 0),
  valuta                  text not null default 'eur',

  -- unique: la riprova automatica di un webhook Stripe non deve generare
  -- un secondo ordine. E' questa la difesa contro i duplicati.
  stripe_session_id       text unique,
  stripe_payment_intent   text unique,

  indirizzo_spedizione    jsonb,
  tracking                text,
  note                    text,

  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists orders_user_idx    on public.orders (user_id, created_at desc);
create index if not exists orders_stato_idx   on public.orders (stato, created_at desc);


-- ---------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------

create table if not exists public.order_items (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references public.orders(id) on delete cascade,

  -- set null, non cascade: se cancelli un prodotto l'ordine resta intero.
  product_id        uuid references public.products(id) on delete set null,

  nome              text not null,
  prezzo_centesimi  integer not null check (prezzo_centesimi >= 0),
  quantita          integer not null check (quantita > 0),
  immagine          text
);

create index if not exists order_items_order_idx on public.order_items (order_id);


-- ---------------------------------------------------------------------
-- updated_at automatico
-- ---------------------------------------------------------------------

create or replace function public.tocca_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.tocca_updated_at();


-- ---------------------------------------------------------------------
-- RLS
--
-- Lettura: ciascuno i propri ordini, l'amministratore tutti.
-- Scrittura: nessuno dal browser. Il server usa la chiave di servizio,
-- che scavalca la RLS per progettazione, quindi non serve alcuna
-- politica di insert — e non averla e' esattamente il punto.
-- ---------------------------------------------------------------------

alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "ordini_lettura_propri" on public.orders;
create policy "ordini_lettura_propri"
  on public.orders for select
  to authenticated
  using (user_id = auth.uid() or public.e_admin());

drop policy if exists "ordini_aggiornamento_admin" on public.orders;
create policy "ordini_aggiornamento_admin"
  on public.orders for update
  to authenticated
  using (public.e_admin())
  with check (public.e_admin());

drop policy if exists "righe_lettura_proprie" on public.order_items;
create policy "righe_lettura_proprie"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or public.e_admin())
    )
  );


-- ---------------------------------------------------------------------
-- Scalare le giacenze in modo sicuro
--
-- Va chiamata dal server dentro la conferma di pagamento. Il "for update"
-- blocca le righe: senza, due acquisti simultanei dell'ultimo pezzo
-- passerebbero entrambi.
-- ---------------------------------------------------------------------

create or replace function public.scala_giacenze(righe jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  disponibile integer;
begin
  for r in select * from jsonb_to_recordset(righe) as x(product_id uuid, quantita integer)
  loop
    select stock into disponibile
    from public.products
    where id = r.product_id
    for update;

    if disponibile is null then
      raise exception 'prodotto % non trovato', r.product_id;
    end if;

    if disponibile < r.quantita then
      raise exception 'giacenza insufficiente per il prodotto %: % disponibili, % richiesti',
        r.product_id, disponibile, r.quantita;
    end if;

    update public.products
    set stock = stock - r.quantita
    where id = r.product_id;
  end loop;
end;
$$;

revoke all on function public.scala_giacenze(jsonb) from public, anon, authenticated;


-- ---------------------------------------------------------------------
-- Verifica
--   select numero, stato, totale_centesimi from public.orders order by created_at desc limit 5;
--
-- E un controllo che deve FALLIRE, altrimenti la RLS non sta funzionando:
--   curl -X POST "<URL>/rest/v1/orders" -H "apikey: <CHIAVE PUBBLICA>" \
--     -H "Content-Type: application/json" \
--     -d '{"email":"x@y.it","stato":"pagato","subtotale_centesimi":1,"totale_centesimi":1}'
--   -> atteso 401 o 403. Se risponde 201, fermati e chiamami.
-- ---------------------------------------------------------------------
