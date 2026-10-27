# ⚡ Dashboard Permohonan Bahan Luak JKE

Sistem pengurusan permohonan bahan luak untuk Jabatan Kejuruteraan Elektrik (JKE) — dibina dengan React, Vite, dan Supabase.

---

## 📁 Struktur Fail

```
jke-web/
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── DaftarPage.jsx
│   │   ├── HomePensyarah.jsx
│   │   ├── BorangPermohonan.jsx
│   │   ├── SenaraiPermohonan.jsx
│   │   └── DashboardKoordinator.jsx
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── StatusBadge.jsx
│   │   └── ProgressTracker.jsx
│   ├── lib/
│   │   ├── supabase.js
│   │   └── supabase-setup.sql
│   └── App.jsx
├── .env.example
├── .gitignore
├── package.json
└── vite.config.js
```

---

## 🚀 Cara Guna

**1. Clone repositori ini**

```bash
git clone https://github.com/shaffie-ai/Dashboard-Permohonan-Bahan-Luak-JKE.git
cd jke-web
```

**2. Install dependencies**

```bash
npm install
```

**3. Setup environment variable**

Salin `.env.example` dan rename kepada `.env`, kemudian isi nilai Supabase:

```env
VITE_SUPABASE_URL=https://XXXXXXXXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**4. Setup database Supabase**

- Log masuk ke [supabase.com](https://supabase.com)
- Buka **SQL Editor** → jalankan fail `src/lib/supabase-setup.sql`

**5. Jalankan aplikasi**

```bash
npm run dev
```

Buka browser: `http://localhost:5173`

---

## ✨ Ciri-ciri

### 👨‍🏫 Pensyarah
- ✅ Log masuk menggunakan Gmail
- ✅ Isi borang permohonan bahan luak
- ✅ Semak status permohonan dengan progress tracker
- ✅ Notifikasi status: Menunggu → Dikompil → Dalam Perolehan → Diterima

### 📊 Koordinator Perolehan
- ✅ Dashboard semua permohonan dari 40 pensyarah
- ✅ Kemaskini status permohonan
- ✅ Kompilasi automatik bahan yang sama dari pelbagai pensyarah
- ✅ Export senarai perolehan ke CSV

---

## 📋 Aliran Status Permohonan

```
Menunggu → Dikompil → Dalam Perolehan → Diterima
                                       → Ditolak
```

---

## 🎨 Tema Warna

| Warna | Kod | Kegunaan |
|-------|-----|----------|
| Biru | `#0078D4` | Header, butang utama |
| Hijau | `#107C10` | Status Diterima |
| Kuning | `#FFB900` | Status Menunggu |
| Oren | `#D24726` | Status Dalam Perolehan |
| Merah | `#D13438` | Status Ditolak |

---

## 🛠️ Teknologi

| Teknologi | Kegunaan |
|-----------|----------|
| [React](https://react.dev) | Frontend framework |
| [Vite](https://vitejs.dev) | Build tool |
| [Supabase](https://supabase.com) | Database & Authentication |
| [React Router](https://reactrouter.com) | Routing |

---

## 👥 Pengguna

- **Pensyarah** — 40 orang, boleh buat dan semak permohonan sendiri
- **Koordinator** — 1 orang, boleh lihat semua permohonan dan kemaskini status

---

*Jabatan Kejuruteraan Elektrik (JKE)*
