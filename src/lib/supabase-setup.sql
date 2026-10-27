-- ============================================================
-- SUPABASE SQL SETUP — Dashboard Bahan Luak JKE
-- Jalankan dalam Supabase SQL Editor (supabase.com/dashboard)
-- ============================================================

-- 1. TABLE PROFILES (maklumat pengguna tambahan)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nama_penuh text not null,
  emel text not null,
  peranan text not null default 'pensyarah' check (peranan in ('pensyarah', 'koordinator')),
  created_at timestamptz default now()
);

-- 2. TABLE PERMOHONAN
create table public.permohonan (
  id bigint generated always as identity primary key,
  nombor_siri text unique,
  user_id uuid references auth.users on delete cascade not null,
  nama_pensyarah text not null,
  emel_pensyarah text not null,
  nama_bahan text not null,
  kategori text not null check (kategori in ('Elektronik','Mekanikal','Elektrik','Kimia','Lain-lain')),
  spesifikasi text,
  kuantiti numeric not null,
  unit text not null check (unit in ('unit','pcs','meter','liter','lain-lain')),
  kursus_subjek text not null,
  tarikh_diperlukan date not null,
  catatan text,
  status text not null default 'Menunggu' check (
    status in ('Menunggu','Dikompil','Dalam Perolehan','Diterima','Ditolak')
  ),
  rujukan_perolehan text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. AUTO-GENERATE NOMBOR SIRI
create or replace function generate_nombor_siri()
returns trigger as $$
declare
  tahun text := to_char(now(), 'YYYY');
  seq int;
  siri text;
begin
  select count(*) + 1 into seq
  from public.permohonan
  where extract(year from created_at) = extract(year from now());
  siri := 'JKE-' || tahun || '-' || lpad(seq::text, 4, '0');
  new.nombor_siri := siri;
  return new;
end;
$$ language plpgsql;

create trigger set_nombor_siri
  before insert on public.permohonan
  for each row execute function generate_nombor_siri();

-- 4. AUTO-UPDATE updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.permohonan
  for each row execute function update_updated_at();

-- 5. AUTO-BUAT PROFILE BILA DAFTAR
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nama_penuh, emel, peranan)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nama_penuh', new.email),
    new.email,
    coalesce(new.raw_user_meta_data->>'peranan', 'pensyarah')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 6. ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.permohonan enable row level security;

-- Profiles: pengguna boleh baca profil sendiri
create policy "Pengguna baca profil sendiri"
  on public.profiles for select
  using (auth.uid() = id);

-- Profiles: koordinator boleh baca semua profil
create policy "Koordinator baca semua profil"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and peranan = 'koordinator'
    )
  );

-- Permohonan: pensyarah baca permohonan sendiri
create policy "Pensyarah baca permohonan sendiri"
  on public.permohonan for select
  using (auth.uid() = user_id);

-- Permohonan: pensyarah buat permohonan baru
create policy "Pensyarah buat permohonan"
  on public.permohonan for insert
  with check (auth.uid() = user_id);

-- Permohonan: pensyarah edit permohonan sendiri (jika masih Menunggu)
create policy "Pensyarah edit permohonan sendiri"
  on public.permohonan for update
  using (auth.uid() = user_id and status = 'Menunggu');

-- Permohonan: koordinator baca SEMUA permohonan
create policy "Koordinator baca semua permohonan"
  on public.permohonan for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and peranan = 'koordinator'
    )
  );

-- Permohonan: koordinator kemaskini status
create policy "Koordinator kemaskini status"
  on public.permohonan for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and peranan = 'koordinator'
    )
  );
