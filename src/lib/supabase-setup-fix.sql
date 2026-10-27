-- ============================================================
-- SUPABASE SQL FIX v2 — Hanya buat apa yang belum ada
-- ============================================================

-- 1. Buat table permohonan (jika belum ada)
create table if not exists public.permohonan (
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

-- 2. Functions (or replace — selamat dijalankan semula)
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

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 3. Triggers (drop dulu supaya tidak duplicate)
drop trigger if exists set_nombor_siri on public.permohonan;
create trigger set_nombor_siri
  before insert on public.permohonan
  for each row execute function generate_nombor_siri();

drop trigger if exists set_updated_at on public.permohonan;
create trigger set_updated_at
  before update on public.permohonan
  for each row execute function update_updated_at();

-- 4. RLS
alter table public.permohonan enable row level security;

-- Drop policies dulu supaya tidak duplicate
drop policy if exists "Pensyarah baca permohonan sendiri" on public.permohonan;
drop policy if exists "Pensyarah buat permohonan" on public.permohonan;
drop policy if exists "Pensyarah edit permohonan sendiri" on public.permohonan;
drop policy if exists "Koordinator baca semua permohonan" on public.permohonan;
drop policy if exists "Koordinator kemaskini status" on public.permohonan;

create policy "Pensyarah baca permohonan sendiri"
  on public.permohonan for select
  using (auth.uid() = user_id);

create policy "Pensyarah buat permohonan"
  on public.permohonan for insert
  with check (auth.uid() = user_id);

create policy "Pensyarah edit permohonan sendiri"
  on public.permohonan for update
  using (auth.uid() = user_id and status = 'Menunggu');

create policy "Koordinator baca semua permohonan"
  on public.permohonan for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and peranan = 'koordinator'
    )
  );

create policy "Koordinator kemaskini status"
  on public.permohonan for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and peranan = 'koordinator'
    )
  );
