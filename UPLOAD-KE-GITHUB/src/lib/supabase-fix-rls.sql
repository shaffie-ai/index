-- ============================================================
-- FIX: Infinite recursion dalam RLS policy profiles
-- ============================================================

-- Drop semua policies lama pada profiles
drop policy if exists "Pengguna baca profil sendiri" on public.profiles;
drop policy if exists "Koordinator baca semua profil" on public.profiles;

-- Buat policy baru yang TIDAK recursive
-- Pengguna boleh baca profil sendiri
create policy "Pengguna baca profil sendiri"
  on public.profiles for select
  using (auth.uid() = id);

-- Pengguna boleh kemaskini profil sendiri
create policy "Pengguna kemaskini profil sendiri"
  on public.profiles for update
  using (auth.uid() = id);

-- Koordinator baca semua profil (guna auth.jwt() — TIDAK recursive)
create policy "Koordinator baca semua profil"
  on public.profiles for select
  using (
    (auth.jwt() -> 'user_metadata' ->> 'peranan') = 'koordinator'
    or auth.uid() = id
  );

-- ============================================================
-- FIX: Policy permohonan juga perlu diperbaiki (guna security definer function)
-- ============================================================

-- Buat helper function untuk check peranan (security definer = bypass RLS)
create or replace function get_peranan(uid uuid)
returns text
language sql
security definer
stable
as $$
  select peranan from public.profiles where id = uid;
$$;

-- Drop policies lama pada permohonan
drop policy if exists "Koordinator baca semua permohonan" on public.permohonan;
drop policy if exists "Koordinator kemaskini status" on public.permohonan;

-- Buat semula guna function (tidak recursive)
create policy "Koordinator baca semua permohonan"
  on public.permohonan for select
  using (
    auth.uid() = user_id
    or get_peranan(auth.uid()) = 'koordinator'
  );

create policy "Koordinator kemaskini status"
  on public.permohonan for update
  using (
    get_peranan(auth.uid()) = 'koordinator'
    or (auth.uid() = user_id and status = 'Menunggu')
  );
