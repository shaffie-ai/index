# 🚀 Panduan Deploy — JKE Bahan Luak ke GitHub Pages

## Prasyarat
- Akaun GitHub (percuma) — [github.com](https://github.com)
- Node.js v18+ — [nodejs.org](https://nodejs.org) (pilih LTS)
- Akaun Supabase (percuma) — [supabase.com](https://supabase.com)

---

## LANGKAH 1: Setup Supabase (Database)

1. Pergi ke [supabase.com](https://supabase.com) → **Start your project** → Log masuk dengan GitHub
2. Klik **New Project**:
   - Organization: (pilih yang ada)
   - Name: `jke-bahan-luak`
   - Database Password: (simpan dengan selamat)
   - Region: **Southeast Asia (Singapore)**
3. Tunggu ~2 minit untuk project dibuat
4. Pergi ke **SQL Editor** (ikon terminal di kiri)
5. Klik **New query**
6. Salin semua kandungan dari fail `src/lib/supabase-setup.sql`
7. Klik **Run** (▶)
8. Pastikan tiada error merah

### Ambil Kunci Supabase
1. Klik **Settings** (gear icon) → **API**
2. Salin:
   - **Project URL** → simpan sebagai `VITE_SUPABASE_URL`
   - **anon public** key → simpan sebagai `VITE_SUPABASE_ANON_KEY`

---

## LANGKAH 2: Cipta Repository GitHub

1. Pergi ke [github.com](https://github.com) → klik **+** → **New repository**
2. Repository name: `jke-bahan-luak`
3. Visibility: **Public** (GitHub Pages free untuk public sahaja)
4. Klik **Create repository**

---

## LANGKAH 3: Kemaskini Nama Repo dalam vite.config.js

Buka fail `jke-web/vite.config.js` dan pastikan `base` sama dengan nama repo:

```js
base: '/jke-bahan-luak/',
```

---

## LANGKAH 4: Push Kod ke GitHub

Buka terminal/PowerShell dalam folder `jke-web`:

```powershell
# Masuk ke folder projek
cd jke-web

# Init git
git init
git add .
git commit -m "first commit: dashboard bahan luak JKE"

# Sambung ke GitHub repo anda
git remote add origin https://github.com/USERNAME/jke-bahan-luak.git
git branch -M main
git push -u origin main
```

> Ganti `USERNAME` dengan username GitHub anda

---

## LANGKAH 5: Tambah Secrets Supabase di GitHub

1. Dalam repo GitHub, klik **Settings** → **Secrets and variables** → **Actions**
2. Klik **New repository secret** (2 kali):

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | URL dari Supabase (contoh: `https://xxxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Anon key dari Supabase |

---

## LANGKAH 6: Aktifkan GitHub Pages

1. Dalam repo GitHub, klik **Settings** → **Pages**
2. Di bawah **Build and deployment**:
   - Source: **GitHub Actions**
3. Klik **Save**

---

## LANGKAH 7: Trigger Deploy

Deploy akan berlaku **automatik** bila anda push ke branch `main`.

Untuk trigger manual:
1. Klik tab **Actions** dalam repo
2. Klik workflow **Deploy ke GitHub Pages**
3. Klik **Run workflow** → **Run workflow**

Tunggu ~2-3 minit. Bila selesai, URL app anda:
```
https://USERNAME.github.io/jke-bahan-luak/
```

---

## LANGKAH 8: Cipta Akaun Koordinator

1. Pergi ke URL app anda
2. Klik **Daftar di sini**
3. Isi nama, emel, pilih **Koordinator Perolehan**
4. Semak emel untuk pengesahan

> Untuk ujian pantas, pergi ke Supabase → **Authentication** → **Users** → klik user → confirm email secara manual

---

## Ujian Sistem

1. Log masuk sebagai koordinator
2. Buka tab baru → log masuk sebagai pensyarah (daftar akaun baru)
3. Hantar permohonan ujian
4. Semak permohonan muncul dalam dashboard koordinator
5. Kemaskini status dari dashboard koordinator
6. Semak status dikemaskini dalam akaun pensyarah

---

## Masalah Biasa

| Masalah | Penyelesaian |
|---|---|
| Halaman kosong selepas deploy | Semak `base` dalam `vite.config.js` sama dengan nama repo |
| Login gagal | Semak VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY dalam Secrets |
| Data tidak muncul | Semak RLS policies dalam Supabase SQL Editor |
| Build gagal | Semak tab Actions untuk error log |
