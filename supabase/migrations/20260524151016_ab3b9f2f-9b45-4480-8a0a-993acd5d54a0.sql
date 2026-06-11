
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
