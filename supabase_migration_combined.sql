
-- =========================
-- ENUM + ROLES
-- =========================
create type public.app_role as enum ('client','admin','support');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','support'))
$$;

-- =========================
-- PROFILES
-- =========================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique not null,
  phone text,
  country text,
  flag_emoji text,
  currency text default 'USD',
  language text default 'en',
  avatar_url text,
  whatsapp text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, phone, country, language)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'country',
    coalesce(new.raw_user_meta_data->>'language','en')
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'client')
  on conflict do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================
-- SERVICES
-- =========================
create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_en text not null,
  name_fr text,
  name_ar text,
  description_en text,
  description_fr text,
  description_ar text,
  price_usd numeric(10,2) not null,
  state_fee_usd numeric(10,2) default 0,
  features jsonb,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz not null default now()
);
alter table public.services enable row level security;

insert into public.services (slug, name_en, name_fr, name_ar, price_usd, state_fee_usd, sort_order, features) values
('llc-starter','Starter','Starter','ستارتر',299,50,1,
 '{"en":["LLC Formation (Wyoming)","EIN Number","Operating Agreement","Registered Agent 1yr","US Address"],
   "fr":["Création LLC (Wyoming)","Numéro EIN","Contrat d''exploitation","Agent enregistré 1an","Adresse US"],
   "ar":["تأسيس LLC (وايومنغ)","رقم EIN","عقد التشغيل","وكيل مسجل (سنة)","عنوان أمريكي"]}'::jsonb),
('llc-pro','Pro','Pro','برو',549,50,2,
 '{"en":["Everything in Starter","US Business Bank Account","Stripe Activation","PayPal Business Setup","Priority Support"],
   "fr":["Tout dans Starter","Compte bancaire US","Activation Stripe","Configuration PayPal","Support prioritaire"],
   "ar":["كل ما في Starter","حساب بنكي تجاري أمريكي","تفعيل Stripe","إعداد PayPal Business","دعم ذو أولوية"]}'::jsonb),
('llc-elite','Elite','Elite','إليت',999,50,3,
 '{"en":["Everything in Pro","Wise Business Account","Annual Report Filing 1yr","Trademark Search","Dedicated Account Manager"],
   "fr":["Tout dans Pro","Compte Wise Business","Rapport annuel 1an","Recherche de marque","Gestionnaire dédié"],
   "ar":["كل ما في Pro","حساب Wise Business","تقرير سنوي (سنة)","بحث عن العلامة التجارية","مدير حساب مخصص"]}'::jsonb);

-- =========================
-- ORDERS
-- =========================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique,
  client_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.services(id),
  assigned_to uuid references public.profiles(id),
  business_name text,
  business_type text default 'LLC',
  us_state text default 'Wyoming',
  industry text,
  business_desc text,
  status text not null default 'pending_payment',
  amount_usd numeric(10,2),
  state_fee_usd numeric(10,2),
  total_usd numeric(10,2),
  currency_paid text default 'USD',
  amount_paid numeric(10,2),
  stripe_payment_intent text,
  payment_status text default 'unpaid',
  paid_at timestamptz,
  submitted_at timestamptz default now(),
  filed_at timestamptz,
  ein_received_at timestamptz,
  banking_done_at timestamptz,
  completed_at timestamptz,
  admin_notes text,
  client_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.orders enable row level security;

create or replace function public.generate_order_number()
returns trigger language plpgsql as $$
declare
  year_str text := to_char(now(),'YYYY');
  seq int;
begin
  if new.order_number is null then
    select count(*)+1 into seq from public.orders
      where extract(year from created_at) = extract(year from now());
    new.order_number := 'LB-'||year_str||'-'||lpad(seq::text,4,'0');
  end if;
  return new;
end;
$$;

create trigger set_order_number
  before insert on public.orders
  for each row execute procedure public.generate_order_number();

-- =========================
-- ORDER TIMELINE
-- =========================
create table public.order_timeline (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  note_en text,
  note_fr text,
  note_ar text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
alter table public.order_timeline enable row level security;

-- =========================
-- DOCUMENTS
-- =========================
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  uploaded_by uuid references public.profiles(id),
  name text not null,
  type text not null,
  direction text not null default 'client_upload',
  status text not null default 'pending',
  file_path text,
  file_size int,
  mime_type text,
  notes text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.documents enable row level security;

-- =========================
-- MESSAGES
-- =========================
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  sender_id uuid references public.profiles(id),
  content text not null check (char_length(content) between 1 and 2000),
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.order_timeline;
alter publication supabase_realtime add table public.orders;
alter table public.messages replica identity full;
alter table public.order_timeline replica identity full;
alter table public.orders replica identity full;

-- =========================
-- RLS POLICIES
-- =========================

-- user_roles: users see own; admins manage all
create policy "users see own roles" on public.user_roles for select
  using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "admins manage roles" on public.user_roles for all
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- profiles
create policy "see own or staff sees all" on public.profiles for select
  using (auth.uid() = id or public.is_staff(auth.uid()));
create policy "update own profile" on public.profiles for update
  using (auth.uid() = id);
create policy "staff updates profiles" on public.profiles for update
  using (public.is_staff(auth.uid()));

-- services: public read
create policy "anyone reads active services" on public.services for select using (is_active);
create policy "admins manage services" on public.services for all
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- orders
create policy "clients see own orders" on public.orders for select
  using (client_id = auth.uid() or public.is_staff(auth.uid()));
create policy "clients insert own orders" on public.orders for insert
  with check (client_id = auth.uid() or public.is_staff(auth.uid()));
create policy "clients update own client_notes" on public.orders for update
  using (client_id = auth.uid())
  with check (client_id = auth.uid());
create policy "staff update orders" on public.orders for update
  using (public.is_staff(auth.uid()));

-- order_timeline
create policy "members see timeline" on public.order_timeline for select
  using (
    exists (select 1 from public.orders o where o.id = order_id and o.client_id = auth.uid())
    or public.is_staff(auth.uid())
  );
create policy "staff inserts timeline" on public.order_timeline for insert
  with check (public.is_staff(auth.uid()));

-- documents
create policy "members see documents" on public.documents for select
  using (
    exists (select 1 from public.orders o where o.id = order_id and o.client_id = auth.uid())
    or public.is_staff(auth.uid())
  );
create policy "clients insert own documents" on public.documents for insert
  with check (
    (uploaded_by = auth.uid()
     and exists (select 1 from public.orders o where o.id = order_id and o.client_id = auth.uid()))
    or public.is_staff(auth.uid())
  );
create policy "staff updates documents" on public.documents for update
  using (public.is_staff(auth.uid()));

-- messages
create policy "members read messages" on public.messages for select
  using (
    exists (select 1 from public.orders o where o.id = order_id and o.client_id = auth.uid())
    or public.is_staff(auth.uid())
  );
create policy "members send messages" on public.messages for insert
  with check (
    sender_id = auth.uid()
    and (
      exists (select 1 from public.orders o where o.id = order_id and o.client_id = auth.uid())
      or public.is_staff(auth.uid())
    )
  );
create policy "members mark read" on public.messages for update
  using (
    exists (select 1 from public.orders o where o.id = order_id and o.client_id = auth.uid())
    or public.is_staff(auth.uid())
  );

-- =========================
-- STORAGE BUCKETS
-- =========================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('documents','documents',false, 20971520, array['image/png','image/jpeg','image/webp','application/pdf']),
  ('avatars','avatars',true, 2097152, array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;

-- documents bucket: path must start with order_id/
create policy "members read order docs" on storage.objects for select
  using (
    bucket_id = 'documents'
    and (
      public.is_staff(auth.uid())
      or exists (
        select 1 from public.orders o
        where o.client_id = auth.uid()
          and (storage.foldername(name))[1] = o.id::text
      )
    )
  );
create policy "clients upload order docs" on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and (
      public.is_staff(auth.uid())
      or exists (
        select 1 from public.orders o
        where o.client_id = auth.uid()
          and (storage.foldername(name))[1] = o.id::text
      )
    )
  );
create policy "staff manage order docs" on storage.objects for update
  using (bucket_id = 'documents' and public.is_staff(auth.uid()));
create policy "staff delete order docs" on storage.objects for delete
  using (bucket_id = 'documents' and public.is_staff(auth.uid()));

-- avatars: anyone can read; users write to their own folder
create policy "public read avatars" on storage.objects for select
  using (bucket_id = 'avatars');
create policy "users upload own avatar" on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users update own avatar" on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- 1. set search_path on generate_order_number (and re-affirm others)
create or replace function public.generate_order_number()
returns trigger language plpgsql set search_path = public as $$
declare
  year_str text := to_char(now(),'YYYY');
  seq int;
begin
  if new.order_number is null then
    select count(*)+1 into seq from public.orders
      where extract(year from created_at) = extract(year from now());
    new.order_number := 'LB-'||year_str||'-'||lpad(seq::text,4,'0');
  end if;
  return new;
end;
$$;

-- 2. Revoke EXECUTE on security definer helpers from public/anon/authenticated.
--    RLS still works because policies run with the policy owner's privileges.
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke execute on function public.is_staff(uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- 3. Avatars bucket: restrict listing to per-user folder; keep public read by direct URL.
drop policy if exists "public read avatars" on storage.objects;
create policy "users list own avatars" on storage.objects for select
  using (
    bucket_id = 'avatars'
    and (
      auth.role() = 'anon'  -- public direct URL read still works at the CDN layer
      or (auth.uid() is not null and (storage.foldername(name))[1] = auth.uid()::text)
      or public.is_staff(auth.uid())
    )
  );
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS address_street text,
  ADD COLUMN IF NOT EXISTS address_city text,
  ADD COLUMN IF NOT EXISTS address_state text,
  ADD COLUMN IF NOT EXISTS address_postal text;
-- 1) Make avatars bucket private so storage RLS is enforced on reads
UPDATE storage.buckets SET public = false WHERE id = 'avatars';

-- Tighten the SELECT policy: remove anon access; only owner and staff can read
DROP POLICY IF EXISTS "users list own avatars" ON storage.objects;
CREATE POLICY "users read own avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (
    (storage.foldername(name))[1] = (auth.uid())::text
    OR public.is_staff(auth.uid())
  )
);

-- 2) Remove tables from realtime publication (realtime is not used in app code)
ALTER PUBLICATION supabase_realtime DROP TABLE public.orders;
ALTER PUBLICATION supabase_realtime DROP TABLE public.order_timeline;
ALTER PUBLICATION supabase_realtime DROP TABLE public.messages;

-- 1. Restrict client updates on orders to client_notes only via trigger
CREATE OR REPLACE FUNCTION public.enforce_client_order_update_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_staff(auth.uid()) THEN
    RETURN NEW;
  END IF;
  IF NEW.client_id IS DISTINCT FROM OLD.client_id
     OR NEW.service_id IS DISTINCT FROM OLD.service_id
     OR NEW.assigned_to IS DISTINCT FROM OLD.assigned_to
     OR NEW.order_number IS DISTINCT FROM OLD.order_number
     OR NEW.business_name IS DISTINCT FROM OLD.business_name
     OR NEW.business_type IS DISTINCT FROM OLD.business_type
     OR NEW.us_state IS DISTINCT FROM OLD.us_state
     OR NEW.industry IS DISTINCT FROM OLD.industry
     OR NEW.business_desc IS DISTINCT FROM OLD.business_desc
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.amount_usd IS DISTINCT FROM OLD.amount_usd
     OR NEW.state_fee_usd IS DISTINCT FROM OLD.state_fee_usd
     OR NEW.total_usd IS DISTINCT FROM OLD.total_usd
     OR NEW.currency_paid IS DISTINCT FROM OLD.currency_paid
     OR NEW.amount_paid IS DISTINCT FROM OLD.amount_paid
     OR NEW.stripe_payment_intent IS DISTINCT FROM OLD.stripe_payment_intent
     OR NEW.payment_status IS DISTINCT FROM OLD.payment_status
     OR NEW.paid_at IS DISTINCT FROM OLD.paid_at
     OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at
     OR NEW.filed_at IS DISTINCT FROM OLD.filed_at
     OR NEW.ein_received_at IS DISTINCT FROM OLD.ein_received_at
     OR NEW.banking_done_at IS DISTINCT FROM OLD.banking_done_at
     OR NEW.completed_at IS DISTINCT FROM OLD.completed_at
     OR NEW.admin_notes IS DISTINCT FROM OLD.admin_notes
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Clients may only update client_notes';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_client_order_update_columns ON public.orders;
CREATE TRIGGER enforce_client_order_update_columns
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.enforce_client_order_update_columns();

-- 2. Allow avatar owners to delete their own avatars
DROP POLICY IF EXISTS "users delete own avatars" ON storage.objects;
CREATE POLICY "users delete own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.is_staff(auth.uid())
  )
);

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS us_state text,
  ADD COLUMN IF NOT EXISTS tier text,
  ADD COLUMN IF NOT EXISTS price_mad numeric,
  ADD COLUMN IF NOT EXISTS original_price_mad numeric,
  ADD COLUMN IF NOT EXISTS delivery_days integer,
  ADD COLUMN IF NOT EXISTS badge_key text,
  ADD COLUMN IF NOT EXISTS group_key text;

GRANT SELECT ON public.services TO anon;
GRANT SELECT ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
-- Intake fields on orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS intake jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS preferred_channel text,
  ADD COLUMN IF NOT EXISTS preferred_contact_time text;

-- Extra profile fields used by checkout intake
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS address_country text,
  ADD COLUMN IF NOT EXISTS id_type text;

-- Updated-at trigger on orders (if not present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'orders_set_updated_at'
  ) THEN
    CREATE OR REPLACE FUNCTION public.set_updated_at()
    RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $f$
    BEGIN NEW.updated_at = now(); RETURN NEW; END;
    $f$;
    CREATE TRIGGER orders_set_updated_at
      BEFORE UPDATE ON public.orders
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END$$;

-- Enable Realtime (idempotent)
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['orders','order_timeline','documents','messages'] LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END$$;

-- Ensure replica identity full so payload includes old rows for filters
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.order_timeline REPLICA IDENTITY FULL;
ALTER TABLE public.documents REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;-- Restrict Realtime channel subscriptions so authenticated users may only
-- subscribe to topics that correspond to orders they own (or staff).
-- Topic convention used by the app: `order-<order_id>` and `notif-<user_id>`.

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated can read own order/notif topics" ON realtime.messages;
CREATE POLICY "authenticated can read own order/notif topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  public.is_staff(auth.uid())
  OR (
    realtime.topic() LIKE 'order-%'
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id::text = substring(realtime.topic() from 7)
        AND o.client_id = auth.uid()
    )
  )
  OR (
    realtime.topic() LIKE 'notif-%'
    AND substring(realtime.topic() from 7) = auth.uid()::text
  )
);

DROP POLICY IF EXISTS "authenticated can write own order/notif topics" ON realtime.messages;
CREATE POLICY "authenticated can write own order/notif topics"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_staff(auth.uid())
  OR (
    realtime.topic() LIKE 'order-%'
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id::text = substring(realtime.topic() from 7)
        AND o.client_id = auth.uid()
    )
  )
  OR (
    realtime.topic() LIKE 'notif-%'
    AND substring(realtime.topic() from 7) = auth.uid()::text
  )
);CREATE OR REPLACE FUNCTION public.enforce_client_order_insert_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_staff(auth.uid()) THEN
    RETURN NEW;
  END IF;
  -- Force client_id to the authenticated user
  NEW.client_id := auth.uid();
  -- Reset sensitive workflow/payment fields to safe defaults
  NEW.status := 'pending_payment';
  NEW.payment_status := 'unpaid';
  NEW.paid_at := NULL;
  NEW.amount_paid := NULL;
  NEW.stripe_payment_intent := NULL;
  NEW.filed_at := NULL;
  NEW.ein_received_at := NULL;
  NEW.banking_done_at := NULL;
  NEW.completed_at := NULL;
  NEW.submitted_at := NULL;
  NEW.assigned_to := NULL;
  NEW.admin_notes := NULL;
  NEW.order_number := NULL;
  -- Reset pricing fields; staff/server will set authoritative amounts
  NEW.amount_paid := NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_client_order_insert_defaults_trg ON public.orders;
CREATE TRIGGER enforce_client_order_insert_defaults_trg
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.enforce_client_order_insert_defaults();
-- 1. Orders: add workspace fields
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS workspace_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS workspace_status TEXT NOT NULL DEFAULT 'active';

-- Allow clients to update workspace_name / workspace_status on their own orders
CREATE OR REPLACE FUNCTION public.enforce_client_order_update_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF public.is_staff(auth.uid()) THEN
    RETURN NEW;
  END IF;
  IF NEW.client_id IS DISTINCT FROM OLD.client_id
     OR NEW.service_id IS DISTINCT FROM OLD.service_id
     OR NEW.assigned_to IS DISTINCT FROM OLD.assigned_to
     OR NEW.order_number IS DISTINCT FROM OLD.order_number
     OR NEW.business_name IS DISTINCT FROM OLD.business_name
     OR NEW.business_type IS DISTINCT FROM OLD.business_type
     OR NEW.us_state IS DISTINCT FROM OLD.us_state
     OR NEW.industry IS DISTINCT FROM OLD.industry
     OR NEW.business_desc IS DISTINCT FROM OLD.business_desc
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.amount_usd IS DISTINCT FROM OLD.amount_usd
     OR NEW.state_fee_usd IS DISTINCT FROM OLD.state_fee_usd
     OR NEW.total_usd IS DISTINCT FROM OLD.total_usd
     OR NEW.currency_paid IS DISTINCT FROM OLD.currency_paid
     OR NEW.amount_paid IS DISTINCT FROM OLD.amount_paid
     OR NEW.stripe_payment_intent IS DISTINCT FROM OLD.stripe_payment_intent
     OR NEW.payment_status IS DISTINCT FROM OLD.payment_status
     OR NEW.paid_at IS DISTINCT FROM OLD.paid_at
     OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at
     OR NEW.filed_at IS DISTINCT FROM OLD.filed_at
     OR NEW.ein_received_at IS DISTINCT FROM OLD.ein_received_at
     OR NEW.banking_done_at IS DISTINCT FROM OLD.banking_done_at
     OR NEW.completed_at IS DISTINCT FROM OLD.completed_at
     OR NEW.admin_notes IS DISTINCT FROM OLD.admin_notes
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Clients may only update client_notes, workspace_name, and workspace_status';
  END IF;
  RETURN NEW;
END;
$function$;

-- 2. Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  invoice_number TEXT UNIQUE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MAD',
  status TEXT NOT NULL DEFAULT 'paid',
  pdf_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients see own invoices" ON public.invoices FOR SELECT
  USING (client_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "staff write invoices" ON public.invoices FOR ALL
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- 3. Renewals
CREATE TABLE IF NOT EXISTS public.renewals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  due_date DATE NOT NULL,
  amount NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'upcoming',
  auto_renew BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.renewals TO authenticated;
GRANT ALL ON public.renewals TO service_role;
ALTER TABLE public.renewals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients see own renewals" ON public.renewals FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.client_id = auth.uid()) OR public.is_staff(auth.uid()));
CREATE POLICY "staff write renewals" ON public.renewals FOR ALL
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- 4. Banking accounts
CREATE TABLE IF NOT EXISTS public.banking_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  account_number_masked TEXT,
  balance_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
  card_last_four TEXT,
  card_status TEXT NOT NULL DEFAULT 'not_issued',
  app_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banking_accounts TO authenticated;
GRANT ALL ON public.banking_accounts TO service_role;
ALTER TABLE public.banking_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients see own banking" ON public.banking_accounts FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.client_id = auth.uid()) OR public.is_staff(auth.uid()));
CREATE POLICY "staff write banking" ON public.banking_accounts FOR ALL
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- 5. Banking transactions
CREATE TABLE IF NOT EXISTS public.banking_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.banking_accounts(id) ON DELETE CASCADE,
  direction TEXT NOT NULL DEFAULT 'in',
  description TEXT NOT NULL,
  amount_usd NUMERIC(12,2) NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banking_transactions TO authenticated;
GRANT ALL ON public.banking_transactions TO service_role;
ALTER TABLE public.banking_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients see own transactions" ON public.banking_transactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.banking_accounts ba
    JOIN public.orders o ON o.id = ba.order_id
    WHERE ba.id = account_id AND o.client_id = auth.uid()
  ) OR public.is_staff(auth.uid()));
CREATE POLICY "staff write transactions" ON public.banking_transactions FOR ALL
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- 6. Store items (catalog — all authenticated users can read)
CREATE TABLE IF NOT EXISTS public.store_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_fr TEXT,
  name_ar TEXT,
  description_en TEXT,
  description_fr TEXT,
  description_ar TEXT,
  category TEXT NOT NULL,
  price_mad NUMERIC(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_items TO authenticated;
GRANT ALL ON public.store_items TO service_role;
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all authenticated read active items" ON public.store_items FOR SELECT
  USING (is_active = true OR public.is_staff(auth.uid()));
CREATE POLICY "staff write store items" ON public.store_items FOR ALL
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- 7. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients see own notifications" ON public.notifications FOR SELECT
  USING (client_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "clients update own notifications" ON public.notifications FOR UPDATE
  USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());
CREATE POLICY "staff write notifications" ON public.notifications FOR INSERT
  WITH CHECK (public.is_staff(auth.uid()));
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 8. Notification preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  client_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  gateway_email BOOLEAN NOT NULL DEFAULT true,
  gateway_whatsapp BOOLEAN NOT NULL DEFAULT true,
  documents_email BOOLEAN NOT NULL DEFAULT true,
  compliance_email BOOLEAN NOT NULL DEFAULT true,
  compliance_whatsapp BOOLEAN NOT NULL DEFAULT false,
  academy_email BOOLEAN NOT NULL DEFAULT true,
  marketing_email BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients manage own prefs" ON public.notification_preferences FOR ALL
  USING (client_id = auth.uid() OR public.is_staff(auth.uid()))
  WITH CHECK (client_id = auth.uid() OR public.is_staff(auth.uid()));

-- 9. Compliance events
CREATE TABLE IF NOT EXISTS public.compliance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.compliance_events TO authenticated;
GRANT ALL ON public.compliance_events TO service_role;
ALTER TABLE public.compliance_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients see own compliance" ON public.compliance_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.client_id = auth.uid()) OR public.is_staff(auth.uid()));
CREATE POLICY "staff write compliance" ON public.compliance_events FOR ALL
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- 10. Course enrollments
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_slug TEXT NOT NULL,
  progress_pct INT NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id, course_slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_enrollments TO authenticated;
GRANT ALL ON public.course_enrollments TO service_role;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients manage own enrollments" ON public.course_enrollments FOR ALL
  USING (client_id = auth.uid() OR public.is_staff(auth.uid()))
  WITH CHECK (client_id = auth.uid() OR public.is_staff(auth.uid()));

-- Seed store items (idempotent on (name_en, category))
INSERT INTO public.store_items (name_en, name_fr, name_ar, category, price_mad, sort_order) VALUES
('New LLC Formation','Création LLC','تأسيس LLC جديدة','formation',1299,1),
('EIN Fast-track (7 days)','EIN accéléré (7 jours)','EIN سريع (7 أيام)','formation',499,2),
('DBA / Trade Name','Nom commercial DBA','اسم تجاري DBA','formation',399,3),
('Additional Stripe Account','Compte Stripe supplémentaire','حساب Stripe إضافي','gateway',299,1),
('Square Activation','Activation Square','تفعيل Square','gateway',199,2),
('Etsy Payments Setup','Configuration Etsy Payments','إعداد Etsy Payments','gateway',249,3),
('Amazon Seller Activation','Activation Amazon Seller','تفعيل Amazon Seller','gateway',349,4),
('Professional Website','Site web professionnel','موقع إلكتروني احترافي','growth',1200,1),
('Shopify Store Setup','Configuration Shopify','إعداد متجر Shopify','growth',899,2),
('SEO Starter Package','Pack SEO démarrage','باقة SEO للمبتدئين','growth',799,3),
('Meta Ads Setup + 30 days','Meta Ads + 30 jours','إعداد Meta Ads + 30 يوم','growth',1500,4),
('Google Ads Setup','Configuration Google Ads','إعداد Google Ads','growth',999,5),
('Annual Report Filing','Dépôt rapport annuel','إيداع التقرير السنوي','compliance',320,1),
('Registered Agent Renewal','Renouvellement agent','تجديد الوكيل المسجل','compliance',590,2),
('Trademark Registration','Enregistrement marque','تسجيل العلامة التجارية','compliance',1499,3),
('Form 5472 Filing','Dépôt Form 5472','إيداع Form 5472','compliance',699,4),
('LLC Dissolution','Dissolution LLC','إغلاق LLC','compliance',499,5),
('Dropshipping Mastery Course','Formation Dropshipping','دورة احتراف الدروبشيبينغ','academy',499,1),
('Meta Ads for E-com Course','Formation Meta Ads E-com','دورة Meta Ads للتجارة','academy',599,2),
('1-on-1 Coaching (1 month)','Coaching individuel (1 mois)','تدريب فردي (شهر)','academy',2000,3)
ON CONFLICT DO NOTHING;

-- 1) course_enrollments: split client ALL policy into SELECT-only; staff retain full access
DROP POLICY IF EXISTS "clients manage own enrollments" ON public.course_enrollments;

CREATE POLICY "clients view own enrollments"
ON public.course_enrollments
FOR SELECT
TO authenticated
USING (client_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE POLICY "staff manage enrollments"
ON public.course_enrollments
FOR ALL
TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

-- 2) notifications: trigger restricting client updates to is_read / read_at only
CREATE OR REPLACE FUNCTION public.enforce_client_notifications_update_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_staff(auth.uid()) THEN
    RETURN NEW;
  END IF;
  IF NEW.client_id IS DISTINCT FROM OLD.client_id
     OR NEW.order_id IS DISTINCT FROM OLD.order_id
     OR NEW.type IS DISTINCT FROM OLD.type
     OR NEW.title IS DISTINCT FROM OLD.title
     OR NEW.body IS DISTINCT FROM OLD.body
     OR NEW.action_url IS DISTINCT FROM OLD.action_url
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Clients may only update is_read on notifications';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_client_notifications_update_columns ON public.notifications;
CREATE TRIGGER enforce_client_notifications_update_columns
BEFORE UPDATE ON public.notifications
FOR EACH ROW EXECUTE FUNCTION public.enforce_client_notifications_update_columns();

-- 3) orders: ensure existing column-restriction trigger is wired up
DROP TRIGGER IF EXISTS enforce_client_order_update_columns ON public.orders;
CREATE TRIGGER enforce_client_order_update_columns
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.enforce_client_order_update_columns();

DROP TRIGGER IF EXISTS enforce_client_order_insert_defaults ON public.orders;
CREATE TRIGGER enforce_client_order_insert_defaults
BEFORE INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.enforce_client_order_insert_defaults();

CREATE TABLE public.blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_en text NOT NULL,
  name_fr text NOT NULL,
  name_ar text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_categories TO anon, authenticated;
GRANT ALL ON public.blog_categories TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.blog_categories TO authenticated;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories readable by all" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "admins manage categories" ON public.blog_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER blog_categories_updated BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  title_en text NOT NULL,
  title_fr text NOT NULL DEFAULT '',
  title_ar text NOT NULL DEFAULT '',
  excerpt_en text NOT NULL DEFAULT '',
  excerpt_fr text NOT NULL DEFAULT '',
  excerpt_ar text NOT NULL DEFAULT '',
  body_en text NOT NULL DEFAULT '',
  body_fr text NOT NULL DEFAULT '',
  body_ar text NOT NULL DEFAULT '',
  cover_url text,
  category_id uuid REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  tags text[] NOT NULL DEFAULT '{}',
  reading_minutes int NOT NULL DEFAULT 5,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX blog_posts_status_pub_idx ON public.blog_posts (status, published_at DESC);
CREATE INDEX blog_posts_category_idx ON public.blog_posts (category_id);
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT ALL ON public.blog_posts TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published posts readable by all" ON public.blog_posts FOR SELECT
  USING (status = 'published' AND (published_at IS NULL OR published_at <= now()));
CREATE POLICY "admins read all posts" ON public.blog_posts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins write posts" ON public.blog_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER blog_posts_updated BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.blog_categories (slug, name_en, name_fr, name_ar) VALUES
  ('formation', 'Formation', 'Formation', 'التأسيس'),
  ('banking', 'Banking', 'Banque', 'البنوك'),
  ('growth', 'Growth', 'Croissance', 'النمو'),
  ('case-studies', 'Case studies', 'Études de cas', 'دراسات حالة')
ON CONFLICT DO NOTHING;
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;

GRANT SELECT ON public.blog_categories TO anon, authenticated;
GRANT ALL ON public.blog_categories TO service_role;ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS og_image text;

DROP POLICY IF EXISTS "Admins can upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete blog images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read blog images" ON storage.objects;

CREATE POLICY "Admins can upload blog images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-images'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update blog images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'blog-images'
  AND public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'blog-images'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete blog images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-images'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can read blog images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'blog-images'
  AND public.has_role(auth.uid(), 'admin')
);CREATE OR REPLACE FUNCTION public.enforce_client_messages_update_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_staff(auth.uid()) THEN
    RETURN NEW;
  END IF;
  IF NEW.order_id IS DISTINCT FROM OLD.order_id
     OR NEW.sender_id IS DISTINCT FROM OLD.sender_id
     OR NEW.content IS DISTINCT FROM OLD.content
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Clients may only update is_read/read_at on messages';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_client_messages_update_columns ON public.messages;
CREATE TRIGGER trg_enforce_client_messages_update_columns
BEFORE UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.enforce_client_messages_update_columns();