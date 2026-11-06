-- =====================================================================
--  Tendenze — politiche di sicurezza a livello di riga (RLS)
--  Da eseguire nell'editor SQL di Supabase:
--  https://supabase.com/dashboard/project/herqoluhyyqahrreoygn/sql/new
--
--  Contesto: l'applicazione non ha un livello server. Il browser parla
--  direttamente a PostgREST con la chiave pubblicabile, che sta nel bundle
--  JavaScript ed e' leggibile da chiunque. Quella chiave non autorizza: dice
--  soltanto "sono anonimo". Tutto cio' che separa un cliente da un estraneo
--  sono le regole qui sotto.
--
--  Buchi verificati sul campo il 23/10/2026:
--    · products   — un anonimo ha inserito una riga: HTTP 201 Created
--    · users_view — un anonimo ha letto le email dei clienti: HTTP 200
-- =====================================================================


-- ---------------------------------------------------------------------
-- PARTE 0 — DIAGNOSI (sola lettura, nessuna modifica)
-- Eseguila per prima e guarda cosa c'e' adesso.
-- ---------------------------------------------------------------------

-- Quali tabelle hanno la RLS accesa:
--   select relname, relrowsecurity from pg_class
--   where relnamespace = 'public'::regnamespace and relkind = 'r'
--   order by relname;

-- Quali politiche esistono gia':
--   select tablename, policyname, cmd, roles, qual, with_check
--   from pg_policies where schemaname = 'public' order by tablename, cmd;


-- ---------------------------------------------------------------------
-- PARTE 1 — Chi e' amministratore
--
-- Si usa app_metadata, non user_metadata: quest'ultimo e' scrivibile
-- dall'utente stesso con supabase.auth.updateUser({ data: ... }), che
-- l'app gia' chiama nella pagina profilo. Fidarsene vorrebbe dire
-- lasciare che chiunque si promuova da solo.
-- ---------------------------------------------------------------------

create or replace function public.e_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

revoke all on function public.e_admin() from public;
grant execute on function public.e_admin() to anon, authenticated;


-- ---------------------------------------------------------------------
-- PARTE 2 — products
--
-- ATTENZIONE: il blocco seguente elimina TUTTE le politiche esistenti su
-- products e homepage_settings prima di ricrearle. Serve perche' le
-- politiche permissive si sommano fra loro: aggiungerne una restrittiva
-- accanto a una "permetti tutto" non chiude nulla. Se la PARTE 0 mostra
-- politiche che vuoi conservare, copiale prima di proseguire.
-- ---------------------------------------------------------------------

do $$
declare r record;
begin
  for r in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public' and tablename in ('products', 'homepage_settings')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

alter table public.products enable row level security;

-- Lettura: il catalogo pubblicato e' visibile a tutti; le bozze solo a te.
create policy "products_lettura"
  on public.products for select
  to anon, authenticated
  using (is_published = true or public.e_admin());

-- Scrittura: solo amministratore. Era qui il buco.
create policy "products_inserimento"
  on public.products for insert
  to authenticated
  with check (public.e_admin());

create policy "products_modifica"
  on public.products for update
  to authenticated
  using (public.e_admin())
  with check (public.e_admin());

create policy "products_cancellazione"
  on public.products for delete
  to authenticated
  using (public.e_admin());


-- ---------------------------------------------------------------------
-- PARTE 3 — homepage_settings
-- Chiunque deve poterla leggere (la homepage la usa), nessuno deve poterla
-- riscrivere a parte te: e' il testo dell'hero del sito.
-- ---------------------------------------------------------------------

alter table public.homepage_settings enable row level security;

create policy "homepage_lettura"
  on public.homepage_settings for select
  to anon, authenticated
  using (true);

create policy "homepage_modifica"
  on public.homepage_settings for update
  to authenticated
  using (public.e_admin())
  with check (public.e_admin());

create policy "homepage_inserimento"
  on public.homepage_settings for insert
  to authenticated
  with check (public.e_admin());


-- ---------------------------------------------------------------------
-- PARTE 4 — users_view (la perdita di dati personali)
--
-- Le view di PostgreSQL non ereditano la RLS delle tabelle sottostanti:
-- senza security_invoker girano con i privilegi del proprietario e
-- scavalcano qualunque politica. Per questo l'anagrafica era pubblica.
-- ---------------------------------------------------------------------

alter view public.users_view set (security_invoker = on);

revoke all on public.users_view from anon;
revoke all on public.users_view from authenticated;

-- Il pannello admin continua a servirsi dei clienti, ma passando da una
-- funzione che verifica il ruolo invece che leggendo la view in chiaro.
create or replace function public.elenco_clienti()
returns table (
  id uuid,
  email text,
  nome text,
  cognome text,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.e_admin() then
    raise exception 'non autorizzato';
  end if;
  return query
    select v.id, v.email, v.nome, v.cognome, v.created_at, v.last_sign_in_at
    from public.users_view v;
end;
$$;

revoke all on function public.elenco_clienti() from public, anon;
grant execute on function public.elenco_clienti() to authenticated;


-- ---------------------------------------------------------------------
-- PARTE 5 — bucket storage "products"
-- Le immagini devono restare pubbliche in lettura, ma caricare e
-- cancellare file deve poterlo fare solo l'amministratore. Oggi chiunque
-- puo' riempirti il bucket.
-- ---------------------------------------------------------------------

do $$
declare r record;
begin
  for r in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname like 'tendenze_%'
  loop
    execute format('drop policy %I on storage.objects', r.policyname);
  end loop;
end $$;

create policy "tendenze_immagini_lettura"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'products');

create policy "tendenze_immagini_caricamento"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'products' and public.e_admin());

create policy "tendenze_immagini_modifica"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'products' and public.e_admin())
  with check (bucket_id = 'products' and public.e_admin());

create policy "tendenze_immagini_cancellazione"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'products' and public.e_admin());


-- ---------------------------------------------------------------------
-- PARTE 6 — nominare l'amministratore
-- Senza questo passo nessuno e' admin, nemmeno tu, e il pannello resta
-- chiuso. Sostituisci l'indirizzo con il tuo.
-- Dopo averlo eseguito devi fare logout e login: il ruolo viaggia nel
-- token, e quello che hai in mano adesso e' stato emesso prima.
-- ---------------------------------------------------------------------

update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'giovyfarruggio@gmail.com';


-- ---------------------------------------------------------------------
-- PARTE 7 — verifica
-- Dopo aver applicato tutto, questi controlli devono dare questi esiti.
-- Da terminale, con la chiave pubblicabile al posto di <CHIAVE>:
--
--   # inserimento da anonimo -> deve rispondere 401 o 403, non piu' 201
--   curl -i -X POST "<URL>/rest/v1/products" \
--     -H "apikey: <CHIAVE>" -H "Content-Type: application/json" \
--     -d '{"name":"prova","price":1,"stock":1}'
--
--   # anagrafica clienti da anonimo -> deve rispondere 401 o 403
--   curl -i "<URL>/rest/v1/users_view?select=email" -H "apikey: <CHIAVE>"
--
--   # catalogo da anonimo -> deve continuare a rispondere 200
--   curl -i "<URL>/rest/v1/products?select=name&limit=1" -H "apikey: <CHIAVE>"
-- ---------------------------------------------------------------------
