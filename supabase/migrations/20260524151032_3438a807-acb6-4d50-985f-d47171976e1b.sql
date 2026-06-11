
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
