# PRD: QR Studio

Aplikasi web untuk membuat QR code dari link, dengan logo di tengah serta warna dan bentuk yang bisa diatur. Dokumen ini ditulis untuk dieksekusi oleh Claude Code, bertahap per milestone, lalu di-deploy ke Vercel (Hobby/free).

| | |
|---|---|
| Nama kerja | QR Studio |
| Versi dokumen | 1.0 |
| Platform | Web (mobile-first, responsif sampai desktop) |
| Backend | Tidak ada. Semua proses di browser |
| Bahasa UI | Indonesia |
| Hosting | Vercel Hobby (static) |

---

## 1. Ringkasan dan tujuan

**Masalah.** Pembuat QR online biasanya menaruh iklan, membatasi logo/warna di paket berbayar, atau mengunggah data ke server.

**Solusi.** Satu halaman yang membuat QR langsung saat mengetik, mendukung logo, warna solid/gradasi, dan beberapa gaya bentuk, lalu mengunduh PNG resolusi tinggi. Tidak ada akun, tidak ada server, tidak ada data keluar dari perangkat.

**Tujuan (terukur)**
1. Dari buka halaman sampai PNG terunduh kurang dari 30 detik.
2. QR hasil dengan logo ukuran default terbaca oleh kamera HP standar (iOS Camera dan Google Lens) pada 3 dari 3 percobaan uji.
3. Preview diperbarui kurang dari 100 ms setelah perubahan opsi pada HP kelas menengah.
4. Lighthouse (mobile) Performance ≥ 90, Accessibility ≥ 95.
5. Bundle JS awal (gzip) di bawah 120 KB.

**Bukan tujuan (v1)**
- Akun, riwayat di server, QR dinamis (link yang bisa diganti setelah dicetak), analitik scan.
- Tipe QR selain URL/teks (WiFi, vCard, dll). Masuk daftar ide v2.
- Ekspor SVG/PDF (v2).

---

## 2. Pengguna dan skenario

**Persona utama:** pemilik usaha kecil, mahasiswa, panitia acara. Bukan desainer, memakai HP, ingin cepat dan hasil terlihat rapi.

| # | Skenario | Hasil yang diharapkan |
|---|---|---|
| S1 | Menempel link Instagram toko, unduh | PNG QR hitam-putih terbaca |
| S2 | Menambah logo toko dan warna brand | QR berlogo, warna sesuai brand, tetap terbaca |
| S3 | Membuat QR untuk dicetak di banner | Unduh 2048 px, tepi kosong cukup |
| S4 | Mencoba warna terlalu terang | Muncul peringatan kontras |
| S5 | Membuka lagi di lain hari | Pengaturan warna/bentuk terakhir masih tersimpan (logo tidak) |

---

## 3. Tech stack

| Bagian | Pilihan | Alasan |
|---|---|---|
| Build | Vite + React + TypeScript | Sudah familiar, deploy ke Vercel tanpa konfigurasi |
| Styling | CSS biasa dengan CSS variables (tanpa Tailwind) | Sedikit dependensi, tema light/dark lewat token |
| QR matrix | `qrcode-generator` | Kecil, memberi matriks modul mentah sehingga bentuk digambar sendiri |
| Font | `@fontsource-variable/bricolage-grotesque` | Self-host, tanpa request ke Google, cocok dengan CSP ketat |
| Test | Vitest (unit untuk logika murni) | Logika inti dibuat sebagai fungsi murni agar mudah dites |
| Lint | ESLint + Prettier (bawaan template) | |
| Opsional P2 | `jsqr` | Verifikasi otomatis QR hasil render bisa dibaca |

Aturan: tidak ada library UI, tidak ada state manager, tidak ada router. Satu halaman.

Catatan `qrcode-generator`: aktifkan encoding UTF-8 agar karakter non-ASCII aman (`qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8']`). Jika tipe TypeScript bawaan tidak memuat `stringToBytesFuncs`, tambahkan deklarasi modul di `src/types/qrcode-generator.d.ts`.

---

## 4. Requirement fungsional

Prioritas: **P0** wajib v1, **P1** sebaiknya v1, **P2** nanti.

### FR-1 Input link/teks (P0)
- Satu field teks. Placeholder `https://contoh.com/halaman`. `inputmode="url"`, `autocapitalize="off"`, `spellcheck="false"`.
- Preview diperbarui saat mengetik (debounce 120 ms).
- Normalisasi (lihat 8.2): domain tanpa skema otomatis diberi `https://`. Jika hasil normalisasi berbeda dari input, tampilkan "Dibaca sebagai: …".
- Input kosong menampilkan empty state, bukan QR.
- Teks terlalu panjang menampilkan pesan error yang jelas, bukan crash.

Acceptance: mengetik `wa.me/628123` menghasilkan QR untuk `https://wa.me/628123`. Menghapus semua teks mengembalikan empty state. Menempel 5000 karakter menampilkan pesan "terlalu panjang".

### FR-2 Logo (P0)
- Tombol "Pilih gambar logo". Terima `image/*`, maksimal 5 MB. Format yang dijamin: PNG, JPG, WebP, SVG.
- Setelah dipilih: thumbnail, tombol "Hapus logo".
- Ukuran logo: slider 10–30% (default 22%) dari lebar area QR.
- Bentuk logo: Asli (tanpa dipotong, fit di dalam kotak), Membulat (di-crop rounded), Bulat (di-crop lingkaran).
- Toggle "Beri latar di belakang logo" (default aktif). Warna latar mengikuti warna latar QR (putih jika transparan).
- Modul QR di area logo dihilangkan (bukan ditimpa) agar tepinya bersih.
- Logo dibatasi otomatis agar tidak menyentuh pojok QR (lihat 8.5).

Acceptance: file non-gambar menampilkan pesan error, logo tidak berubah. File > 5 MB ditolak dengan pesan. Menghapus logo mengembalikan QR penuh.

### FR-3 Warna (P0)
- Warna QR (color picker + kode hex).
- Toggle gradasi: menambah "warna gradasi kedua". Gradasi linear diagonal (kiri-atas ke kanan-bawah) melintasi seluruh kanvas.
- Toggle "Pojok sama dengan warna QR". Jika mati: warna pojok terpisah.
- Warna latar (color picker) dan toggle "Latar transparan" (PNG transparan; preview memakai pola kotak-kotak).
- 5 preset cepat: Tinta, Kobalt, Hutan, Senja (gradasi), Kunyit. Preset tidak mengubah logo, teks, atau bentuk.
- Peringatan kontras (lihat 8.4) tampil di bawah preview.

### FR-3b Bentuk (P0)
- Titik QR: Kotak, Halus (sudut membulat hanya di sisi yang tidak bertetangga), Titik (lingkaran).
- Pojok (finder pattern): Kotak, Membulat, Bulat.
- Tepi kosong (quiet zone): Tipis (2 modul), Sedang (3, default), Lebar (4).

### FR-4 Unduh (P0)
- Pilih ukuran: 512 / 1024 (default) / 2048 px.
- Tombol "Unduh PNG" mengunduh file bernama `qr-<hostname>.png` (atau `qr-code.png` jika bukan URL).
- Tombol nonaktif saat tidak ada QR.
- Ekspor dirender ulang di kanvas terpisah pada ukuran yang dipilih (bukan memperbesar preview).
- Fallback jika unduhan tidak didukung: tampilkan QR sebagai `<img>` dan petunjuk "Tekan lama gambar lalu pilih Simpan".
- Jika ekspor gagal (misalnya kanvas tainted karena logo SVG di sebagian browser): pesan yang menyarankan logo PNG/JPG.

### FR-5 Simpan pengaturan (P1)
- Simpan warna, bentuk, ukuran logo, tepi, ukuran ekspor di `localStorage` (`qr-studio:v1`).
- Teks dan logo **tidak** disimpan (privasi dan ukuran).
- Semua akses `localStorage` dibungkus `try/catch`; jika gagal, pakai default.
- Tombol "Reset" mengembalikan default dan menghapus penyimpanan.

### FR-6 Tema (P1)
- Mengikuti `prefers-color-scheme`. Tanpa toggle manual di v1.

### FR-7 Cek keterbacaan otomatis (P2)
- Setelah render, decode kanvas dengan `jsqr` dan tampilkan lencana "Terbaca" atau "Mungkin sulit dipindai". Dijalankan di idle (`requestIdleCallback`) dan tidak memblokir UI. Impor dinamis agar tidak menambah bundle awal.

---

## 5. Desain

### 5.1 Arah visual
Alat kecil yang tenang dan tajam. Satu hal yang menonjol: **QR itu sendiri**. Semua elemen lain diam dan rapi. Tanpa gradient dekoratif, tanpa kartu identik berbayang, tanpa animasi masuk. Gerak hanya sebagai respons aksi (perubahan segmented control, tekan tombol).

### 5.2 Design tokens

Warna (light / dark):

| Token | Light | Dark | Fungsi |
|---|---|---|---|
| `--bg` | `#EDF0F7` | `#0F1220` | Latar halaman |
| `--panel` | `#FFFFFF` | `#181C2E` | Panel pengaturan, frame QR |
| `--field` | `#F4F6FB` | `#20253A` | Input, segmented, chip |
| `--ink` | `#151A2C` | `#EEF0F8` | Teks utama |
| `--muted` | `#5B647C` | `#A3ACC6` | Teks sekunder |
| `--line` | `#D9DEEA` | `#2C3250` | Garis pemisah, border |
| `--accent` | `#2B4BFF` | `#8AA0FF` | Tombol utama, state terpilih |
| `--accent-ink` | `#FFFFFF` | `#0B1030` | Teks di atas accent |
| `--warn` | `#9A5B00` | `#F0B85A` | Peringatan kontras |
| `--danger` | `#B4232A` | `#FF8A8F` | Pesan error |
| `--check1/2` | `#E4E8F2/#F7F8FC` | `#262B44/#1E2238` | Pola transparan |

Implementasi tema: definisikan di `:root`, override di `@media (prefers-color-scheme: dark)`.

Tipografi: satu keluarga, **Bricolage Grotesque** (variable, weight 400–700), fallback `system-ui, sans-serif`.

| Peran | Ukuran | Weight |
|---|---|---|
| H1 | 1.75rem (mobile), 2.2rem (≥860px), tracking -0.02em | 700 |
| H2 (judul seksi) | 1.05rem | 650 |
| Body/label | 0.95–1rem | 400 |
| Hint/catatan | 0.88–0.9rem | 400 |
| Input | **16px** (mencegah zoom otomatis iOS) | 400 |

Panjang baris teks bantu maksimum 52 karakter. Label memakai sentence case, tanpa huruf kapital semua.

Spasi dan bentuk: skala 4px (4, 8, 12, 16, 18, 24, 32). Radius: field/segmented 12px, chip pill, panel 16px, frame QR 14px (mobile) / 18px (desktop). Satu panel besar dengan pemisah garis tipis antar-seksi, bukan banyak kartu terpisah.

### 5.3 Layout

**Mobile (<860px):** satu kolom. Preview QR **sticky** di atas (lebar 190px) supaya perubahan warna/bentuk terlihat sambil menggulir. Panel pengaturan di bawahnya.

```
┌──────────────────────────┐
│ Pembuat QR Code          │
│ Tempel link, tambahkan…  │
├──────────────────────────┤ ← sticky
│        ┌────────┐        │
│        │   QR   │        │
│        └────────┘        │
│   (catatan kontras)      │
├──────────────────────────┤
│ Link atau teks           │
│ [ https://contoh.com   ] │
│ Dibaca sebagai: …        │
│──────────────────────────│
│ Logo                     │
│ [Pilih gambar logo]      │
│──────────────────────────│
│ Warna                    │
│ (Tinta)(Kobalt)(Hutan)…  │
│ Warna QR         ■ #151A │
│ ☐ Pakai warna gradasi    │
│ ☑ Pojok sama dgn QR      │
│ Warna latar      ■ #FFFF │
│ ☐ Latar transparan       │
│──────────────────────────│
│ Bentuk                   │
│ Titik QR  [Kotak|Halus|Titik]
│ Pojok     [Kotak|Membulat|Bulat]
│ Tepi kosong [Tipis|Sedang|Lebar]
│──────────────────────────│
│ Unduh                    │
│ Ukuran [512|1024|2048]   │
│ [        Unduh PNG     ] │
└──────────────────────────┘
```

**Desktop (≥860px):** dua kolom `minmax(300px, 400px) 1fr`, jarak 28px. Kolom kiri: preview besar, sticky (`top: 16px`). Kolom kanan: panel pengaturan. Lebar maksimum konten 980px, di tengah.

```
┌──────────────────────────────────────────────┐
│ Pembuat QR Code                              │
│ Tempel link, tambahkan logo…                 │
│ ┌────────────┐  ┌────────────────────────┐   │
│ │            │  │ Link atau teks         │   │
│ │     QR     │  │ Logo                   │   │
│ │  (sticky)  │  │ Warna                  │   │
│ │            │  │ Bentuk                 │   │
│ └────────────┘  │ Unduh                  │   │
│  catatan        └────────────────────────┘   │
└──────────────────────────────────────────────┘
```

### 5.4 Komponen

| Komponen | Perilaku |
|---|---|
| `Segmented` | Radio group visual. Radio asli disembunyikan (posisi absolut, opacity 0) di atas label; terpilih = latar accent; fokus keyboard = outline 3px accent. Sentuhan minimal 38px tinggi. |
| `ColorField` | `<input type="color">` 48×40 + kode hex monospace di sampingnya. |
| `ToggleField` | Checkbox 22px dengan `accent-color`. Seluruh baris bisa diklik. |
| `ColorPresets` | Chip pill dengan swatch bulat (setengah warna QR, setengah latar; gradasi untuk Senja). |
| `LogoPicker` | Label bergaya tombol berbingkai putus-putus membungkus `<input type=file>` tersembunyi secara visual (tetap bisa difokus), thumbnail 44px, tombol "Hapus logo". |
| `Preview` | Frame persegi, canvas 720×720 internal, skala lewat CSS. Tiga state: kosong, tampil, error. |
| `Note` | `role="status"`, teks warna `--warn`, tinggi minimal 1 baris agar layout tidak melompat. |

Baris yang bergantung pada opsi (`gradasi kedua`, `warna pojok`, `warna latar`, kontrol logo) memakai atribut `hidden`, bukan hanya disable.

### 5.5 State UI

| State | Tampilan |
|---|---|
| Kosong | Teks "Masukkan link untuk melihat QR code di sini." di dalam frame, tombol Unduh nonaktif |
| Normal | Canvas tampil, tombol aktif |
| Terlalu panjang | Pesan di frame: "Teks terlalu panjang untuk QR code. Coba link yang lebih pendek." |
| Logo error | Pesan merah di bawah tombol logo (`role="alert"`) |
| Kontras buruk | Catatan kuning di bawah preview |
| Mengunduh | Tombol nonaktif sesaat, lalu pesan "QR code tersimpan." (`role="status"`) |
| Unduhan tak didukung | Canvas diganti `<img>`, tombol disembunyikan, petunjuk tekan-lama |

### 5.6 Aksesibilitas
- Semua kontrol punya label terhubung (`for`/`id` atau `aria-label`).
- Group segmented: `role="radiogroup"` + `aria-label`.
- Fokus keyboard selalu terlihat (outline 3px, offset 2px).
- Target sentuh ≥ 44px untuk tombol dan chip.
- Warna teks memenuhi kontras WCAG AA di kedua tema.
- Canvas: `role="img"` + `aria-label="Pratinjau QR code"`.
- Hormati `prefers-reduced-motion` (transisi hanya 150 ms pada warna, dinonaktifkan jika reduce).
- Padding aman untuk notch: `viewport-fit=cover` dan `env(safe-area-inset-*)` pada root; elemen sticky memakai `top: env(safe-area-inset-top)`.

---

## 6. Arsitektur

```
qr-studio/
├─ index.html
├─ vite.config.ts
├─ vercel.json
├─ CLAUDE.md
├─ public/
│  └─ favicon.svg
└─ src/
   ├─ main.tsx
   ├─ App.tsx
   ├─ styles/
   │  ├─ tokens.css        # variabel warna, spasi, radius, tema
   │  ├─ base.css          # reset, body, tipografi, focus
   │  └─ components.css
   ├─ components/
   │  ├─ Preview.tsx
   │  ├─ InputSection.tsx
   │  ├─ LogoSection.tsx
   │  ├─ ColorSection.tsx
   │  ├─ ShapeSection.tsx
   │  ├─ ExportSection.tsx
   │  ├─ Segmented.tsx
   │  ├─ ColorField.tsx
   │  ├─ ToggleField.tsx
   │  └─ ColorPresets.tsx
   ├─ hooks/
   │  ├─ useSettings.ts    # state + persist localStorage
   │  ├─ useDebounced.ts
   │  └─ useLogo.ts        # baca file → HTMLImageElement + error
   ├─ lib/
   │  ├─ types.ts
   │  ├─ defaults.ts
   │  ├─ presets.ts
   │  ├─ normalize.ts      # normalizeInput()
   │  ├─ qr.ts             # buildMatrix()
   │  ├─ geometry.ts       # path helper, logo box, finder check
   │  ├─ render.ts         # renderQr() (murni terhadap canvas)
   │  ├─ contrast.ts       # contrastNote()
   │  ├─ export.ts         # exportPng(), downloadBlob(), fileName()
   │  └─ storage.ts        # load/save settings aman
   └─ lib/__tests__/
      ├─ normalize.test.ts
      ├─ contrast.test.ts
      ├─ geometry.test.ts
      └─ qr.test.ts
```

Prinsip: `lib/` tidak mengimpor React. Komponen hanya menampilkan state dan memanggil `lib/`. Logika penggambaran hanya ada di `render.ts`.

**Aliran data**

```
input teks ─(debounce)→ normalizeInput ─→ buildMatrix ─┐
settings (warna/bentuk/margin/logoSize) ───────────────┼→ renderQr(canvas 720) → Preview
logo (HTMLImageElement) ───────────────────────────────┘
                                                       └→ (klik Unduh) renderQr(canvas offscreen N px) → toBlob → download
```

Rendering dipicu `useEffect` yang bergantung pada matriks, settings, dan logo, dan menjadwalkan via `requestAnimationFrame` (batalkan yang lama).

---

## 7. Model data

```ts
// lib/types.ts
export type ModuleShape = 'square' | 'smooth' | 'dots';
export type EyeShape = 'square' | 'rounded' | 'circle';
export type LogoShape = 'original' | 'rounded' | 'circle';
export type Hex = `#${string}`;

export interface Settings {
  // logo
  logoSize: number;        // 10..30 (persen)
  logoShape: LogoShape;
  logoPlate: boolean;
  // warna
  fg: Hex;
  fg2: Hex;
  gradient: boolean;
  bg: Hex;
  transparent: boolean;
  eyeSame: boolean;
  eye: Hex;
  // bentuk
  module: ModuleShape;
  eyeShape: EyeShape;
  margin: 2 | 3 | 4;
  // ekspor
  exportSize: 512 | 1024 | 2048;
}

export interface RenderInput {
  matrix: boolean[][];              // matrix[row][col] = modul gelap
  settings: Settings;
  logo: HTMLImageElement | null;
}
```

```ts
// lib/defaults.ts
export const DEFAULTS: Settings = {
  logoSize: 22, logoShape: 'rounded', logoPlate: true,
  fg: '#151A2C', fg2: '#2B4BFF', gradient: false,
  bg: '#FFFFFF', transparent: false, eyeSame: true, eye: '#151A2C',
  module: 'smooth', eyeShape: 'rounded', margin: 3, exportSize: 1024,
};
```

Preset (`lib/presets.ts`): `{ name, fg, fg2, gradient, bg, eyeSame, eye }`.

| Nama | fg | fg2 | gradient | bg | eyeSame | eye |
|---|---|---|---|---|---|---|
| Tinta | #151A2C | #2B4BFF | tidak | #FFFFFF | ya | #151A2C |
| Kobalt | #2340E0 | #2B4BFF | tidak | #FFFFFF | tidak | #0B1B7A |
| Hutan | #1B6B3A | #2B4BFF | tidak | #F1F8EC | tidak | #0B3B1E |
| Senja | #D6249F | #3A3FE0 | ya | #FFFFFF | ya | #151A2C |
| Kunyit | #7A3E00 | #2B4BFF | tidak | #FFF3D1 | ya | #7A3E00 |

Menerapkan preset: timpa `fg, fg2, gradient, bg, eyeSame, eye` dan set `transparent = false`.

---

## 8. Logika inti

### 8.1 Pembuatan matriks (`lib/qr.ts`)

```ts
import qrcode from 'qrcode-generator';

// UTF-8 agar karakter non-ASCII aman
(qrcode as any).stringToBytes = (qrcode as any).stringToBytesFuncs['UTF-8'];

export function buildMatrix(text: string): boolean[][] {
  const qr = qrcode(0, 'H');   // tipe 0 = otomatis, koreksi error H (30%) karena ada logo
  qr.addData(text);
  qr.make();                   // melempar error jika data terlalu panjang
  const n = qr.getModuleCount();
  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => qr.isDark(r, c)));
}
```

Pemanggil menangkap error dan menampilkan state "terlalu panjang". Koreksi error selalu **H**, baik ada logo maupun tidak.

### 8.2 Normalisasi input (`lib/normalize.ts`)

```ts
export function normalizeInput(raw: string): string {
  const t = raw.trim();
  if (!t) return '';
  if (/^[a-z][a-z0-9+.\-]*:/i.test(t)) return t;   // sudah ada skema (http:, mailto:, tel:, ...)
  if (/\s/.test(t)) return t;                       // ada spasi → teks biasa
  if (/^[^\s\/]+\.[^\s\/]{2,}/.test(t)) return 'https://' + t; // tampak seperti domain
  return t;
}
```

| Input | Output |
|---|---|
| `contoh.com` | `https://contoh.com` |
| `wa.me/62812345` | `https://wa.me/62812345` |
| `http://situs.id` | tidak berubah |
| `mailto:a@b.co` | tidak berubah |
| `halo dunia` | tidak berubah (teks biasa) |
| `kata` | tidak berubah |
| `   ` | `''` |

Pengguna yang butuh `http://` (misalnya alamat IP lokal) mengetiknya sendiri.

### 8.3 Geometri (`lib/geometry.ts`)

```ts
export type Radii = [number, number, number, number]; // tl, tr, br, bl

export function roundedRectPath(
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: Radii,
) {
  const [tl, tr, br, bl] = r;
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);     tr ? ctx.arcTo(x + w, y, x + w, y + tr, tr) : ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h - br); br ? ctx.arcTo(x + w, y + h, x + w - br, y + h, br) : ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + bl, y + h);     bl ? ctx.arcTo(x, y + h, x, y + h - bl, bl) : ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + tl);         tl ? ctx.arcTo(x, y, x + tl, y, tl) : ctx.lineTo(x, y);
  ctx.closePath();
}

/** Bentuk persegi ukuran `s`: lingkaran atau persegi dengan radius seragam. */
export function shapePath(
  ctx: CanvasRenderingContext2D, x: number, y: number, s: number, circle: boolean, radius: number,
) {
  if (circle) {
    ctx.moveTo(x + s, y + s / 2);                 // moveTo mencegah garis penghubung antar subpath
    ctx.arc(x + s / 2, y + s / 2, s / 2, 0, Math.PI * 2);
  } else {
    const r = Math.min(radius, s / 2);
    roundedRectPath(ctx, x, y, s, s, [r, r, r, r]);
  }
}

/** Modul (r,c) bagian dari salah satu dari 3 pola pojok 7×7? */
export function isFinder(r: number, c: number, n: number): boolean {
  return (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
}

/** Batas ukuran logo supaya tidak menyentuh pojok. n = jumlah modul per sisi. */
export function effectiveLogoPercent(n: number, requested: number): number {
  const maxPercent = Math.floor((100 * (n - 16)) / n);   // sisakan pola pojok + pemisah
  return Math.max(10, Math.min(requested, maxPercent));
}
```

Contoh: `effectiveLogoPercent(21, 30) === 23`, `effectiveLogoPercent(29, 30) === 30`.

### 8.4 Kontras (`lib/contrast.ts`)

```ts
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastNote(s: Settings): string {
  const bg = s.transparent ? '#FFFFFF' : s.bg;
  const fgs = [s.fg, ...(s.gradient ? [s.fg2] : []), ...(s.eyeSame ? [] : [s.eye])];
  const lb = luminance(bg);
  let lighter = false, min = Infinity;
  for (const c of fgs) {
    const lc = luminance(c);
    if (lc > lb) lighter = true;
    min = Math.min(min, (Math.max(lc, lb) + 0.05) / (Math.min(lc, lb) + 0.05));
  }
  const out: string[] = [];
  if (lighter) out.push('Warna QR lebih terang dari latar, dan banyak pemindai gagal membaca QR terbalik.');
  else if (min < 3) out.push('Kontras warna rendah, QR bisa sulit dipindai. Pilih warna QR yang lebih gelap.');
  if (s.transparent) out.push('Latar transparan: tempel di permukaan terang agar terbaca.');
  return out.join(' ');
}
```

### 8.5 Penggambaran (`lib/render.ts`)

Urutan gambar: latar → titik data → tiga pojok → (latar logo) → logo.

**Ukuran.** `n` = jumlah modul. `cell = px / (n + 2*margin)`, `origin = margin * cell`. Semua koordinat turunan dari `cell` dan `origin`.

**Kotak logo.** `pct = effectiveLogoPercent(n, settings.logoSize)`, `side = n * cell * pct / 100`, terpusat di `px/2`. Modul dilewati jika bersinggungan dengan kotak logo diperlebar `0.5 * cell`.

**Titik data.** Satu `beginPath()`, semua modul digabung, satu `fill()` (mencegah celah antar-modul). Bentuk:
- `square`: `ctx.rect`.
- `dots`: lingkaran jari-jari `0.45 * cell` (dengan `moveTo` sebelum `arc`).
- `smooth`: `roundedRectPath` dengan radius `0.45 * cell` hanya pada sudut yang **kedua** tetangga ortogonalnya kosong. Tetangga dihitung dari fungsi `dark()` yang sudah mengecualikan pola pojok dan modul yang dilewati oleh logo.

**Pojok.** Tiga posisi `(col,row)`: `(0,0)`, `(n-7,0)`, `(0,n-7)`. Cincin luar 7×7 dengan lubang 5×5 digambar dalam satu path dengan `fill('evenodd')`, lalu inti 3×3 dengan `fill()` terpisah. Radius: kotak = 0, membulat = `2.2 / 1.3 / 1.0 × cell` (luar / lubang / inti), bulat = lingkaran penuh.

**Logo.** Latar (jika aktif) selebar kotak logo + `0.4 * cell` di tiap sisi, warna `bg` (`#FFFFFF` jika transparan). Logo digambar dengan `clip` sesuai bentuk. Mode `original` memakai fit "contain" tanpa crop, mode `rounded/circle` memakai "cover".

Kode acuan:

```ts
import { Settings, RenderInput } from './types';
import { roundedRectPath, shapePath, isFinder, effectiveLogoPercent } from './geometry';

const TAU = Math.PI * 2;

export function renderQr(canvas: HTMLCanvasElement, px: number, { matrix, settings: s, logo }: RenderInput) {
  const n = matrix.length;
  canvas.width = px; canvas.height = px;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, px, px);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if (!s.transparent) { ctx.fillStyle = s.bg; ctx.fillRect(0, 0, px, px); }

  const cell = px / (n + 2 * s.margin);
  const o = s.margin * cell;

  let main: string | CanvasGradient = s.fg;
  if (s.gradient) {
    const g = ctx.createLinearGradient(0, 0, px, px);
    g.addColorStop(0, s.fg); g.addColorStop(1, s.fg2);
    main = g;
  }
  const eyeFill = s.eyeSame ? main : s.eye;

  // kotak logo
  let box: { x: number; y: number; w: number } | null = null;
  if (logo) {
    const side = (n * cell * effectiveLogoPercent(n, s.logoSize)) / 100;
    box = { x: px / 2 - side / 2, y: px / 2 - side / 2, w: side };
  }
  const pad = cell * 0.5;
  const skipped = (r: number, c: number) => {
    if (!box) return false;
    const x = o + c * cell, y = o + r * cell;
    return x + cell > box.x - pad && x < box.x + box.w + pad &&
           y + cell > box.y - pad && y < box.y + box.w + pad;
  };
  const dark = (r: number, c: number) =>
    r >= 0 && c >= 0 && r < n && c < n && !isFinder(r, c, n) && matrix[r][c] && !skipped(r, c);

  // 1) titik data
  ctx.fillStyle = main;
  ctx.beginPath();
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!dark(r, c)) continue;
      const x = o + c * cell, y = o + r * cell;
      if (s.module === 'square') {
        ctx.rect(x, y, cell, cell);
      } else if (s.module === 'dots') {
        const rad = cell * 0.45;
        ctx.moveTo(x + cell / 2 + rad, y + cell / 2);
        ctx.arc(x + cell / 2, y + cell / 2, rad, 0, TAU);
      } else {
        const R = cell * 0.45;
        const u = dark(r - 1, c), d = dark(r + 1, c), l = dark(r, c - 1), rt = dark(r, c + 1);
        roundedRectPath(ctx, x, y, cell, cell, [
          !u && !l ? R : 0, !u && !rt ? R : 0, !d && !rt ? R : 0, !d && !l ? R : 0,
        ]);
      }
    }
  }
  ctx.fill();

  // 2) pojok
  const circ = s.eyeShape === 'circle';
  const k = s.eyeShape === 'square' ? 0 : 1;
  for (const [c, r] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
    const x = o + c * cell, y = o + r * cell;
    ctx.fillStyle = eyeFill;
    ctx.beginPath();
    shapePath(ctx, x, y, 7 * cell, circ, k * 2.2 * cell);
    shapePath(ctx, x + cell, y + cell, 5 * cell, circ, k * 1.3 * cell);
    ctx.fill('evenodd');
    ctx.beginPath();
    shapePath(ctx, x + 2 * cell, y + 2 * cell, 3 * cell, circ, k * 1.0 * cell);
    ctx.fill();
  }

  // 3) logo
  if (box && logo) {
    const iw = logo.naturalWidth || logo.width || 300;
    const ih = logo.naturalHeight || logo.height || 300;
    const side = box.w;
    const isCirc = s.logoShape === 'circle';
    const lr = s.logoShape === 'rounded' ? side * 0.22 : s.logoShape === 'original' ? side * 0.12 : 0;

    if (s.logoPlate) {
      const pp = cell * 0.4;
      ctx.fillStyle = s.transparent ? '#FFFFFF' : s.bg;
      ctx.beginPath();
      shapePath(ctx, box.x - pp, box.y - pp, side + 2 * pp, isCirc, lr + pp);
      ctx.fill();
    }
    ctx.save();
    ctx.beginPath();
    if (s.logoShape === 'original') ctx.rect(box.x, box.y, side, side);
    else shapePath(ctx, box.x, box.y, side, isCirc, lr);
    ctx.clip();
    const sc = s.logoShape === 'original' ? Math.min(side / iw, side / ih) : Math.max(side / iw, side / ih);
    const dw = iw * sc, dh = ih * sc;
    ctx.drawImage(logo, box.x + (side - dw) / 2, box.y + (side - dh) / 2, dw, dh);
    ctx.restore();
  }
}
```

### 8.6 Logo (`hooks/useLogo.ts`)

```
pickFile(file):
  1. bukan image/*        → error "File harus berupa gambar (PNG, JPG, SVG, atau WebP)."
  2. file.size > 5 MB     → error "Ukuran gambar maksimal 5 MB."
  3. FileReader.readAsDataURL → new Image() → onload: simpan HTMLImageElement + dataURL thumbnail
  4. onerror              → error "Gambar ini tidak bisa dibaca. Coba file lain."
remove(): kosongkan state, reset value input file agar file yang sama bisa dipilih lagi
```

Logo hanya hidup di memori komponen. Tidak dikirim atau disimpan ke mana pun.

### 8.7 Ekspor (`lib/export.ts`)

```ts
export function fileName(value: string): string {
  try {
    const h = new URL(value).hostname.replace(/^www\./, '').replace(/[^a-z0-9.\-]/gi, '');
    if (h) return `qr-${h}.png`;
  } catch { /* bukan URL */ }
  return 'qr-code.png';
}

export function exportPng(input: RenderInput, px: number): Promise<Blob> {
  const c = document.createElement('canvas');
  renderQr(c, px, input);
  return new Promise((resolve, reject) =>
    c.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob null'))), 'image/png'));
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
```

Deteksi dukungan: `'download' in HTMLAnchorElement.prototype`. Jika tidak ada, pakai fallback `<img>` (lihat FR-4).

### 8.8 Penyimpanan pengaturan (`lib/storage.ts`)

```ts
const KEY = 'qr-studio:v1';
export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...pickKnown(JSON.parse(raw)) };   // buang kunci asing, validasi nilai
  } catch { return DEFAULTS; }
}
export function saveSettings(s: Settings) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }
export function clearSettings() { try { localStorage.removeItem(KEY); } catch {} }
```

`pickKnown` memvalidasi tiap field (enum, rentang angka, format hex `^#[0-9a-fA-F]{6}$`); nilai tidak valid jatuh ke default. Simpan dengan debounce 300 ms.

---

## 9. Kasus tepi

| Kasus | Penanganan |
|---|---|
| Teks kosong / hanya spasi | Empty state |
| Data melebihi kapasitas (≈1273 byte pada level H) | Catch error `make()`, pesan "terlalu panjang" |
| Emoji / huruf non-Latin | Encoding UTF-8, tetap terbaca |
| Logo transparan (PNG) | Latar logo aktif membuatnya tetap terlihat |
| Logo SVG tanpa width/height | Fallback dimensi 300×300 |
| Logo SVG membuat kanvas tainted di sebagian browser | `toBlob` gagal → pesan sarankan PNG/JPG |
| QR versi 1 (21 modul) + logo 30% | Ukuran dipangkas otomatis oleh `effectiveLogoPercent` |
| Warna QR lebih terang dari latar | Peringatan kontras (tidak diblokir) |
| Latar transparan + unduh | PNG dengan alpha |
| Layar iOS, kanvas 2048×2048 | Dalam batas kanvas iOS; jika `toBlob` gagal, tampilkan pesan dan sarankan 1024 |
| `localStorage` diblokir (mode privat) | Pakai default, tanpa error ke pengguna |
| Mengetik cepat | Debounce + batalkan `requestAnimationFrame` sebelumnya |
| Pilih file logo yang sama dua kali | Reset `input.value` saat hapus |

---

## 10. Non-fungsional

**Performa.** Render kanvas 720 px untuk versi QR sampai ±10 harus di bawah 50 ms di HP kelas menengah. Font variabel dimuat `font-display: swap`. Tidak ada library besar; `jsqr` (P2) hanya lewat `import()` dinamis.

**Privasi.** Tidak ada request jaringan setelah halaman termuat selain aset statis. Tidak ada analytics, cookie, atau third-party script. Teks dan logo tidak pernah meninggalkan browser. Cantumkan satu kalimat di bawah judul: "Semua diproses di perangkatmu."

**Browser.** Versi stabil terbaru Chrome, Edge, Firefox, Safari (iOS 15+). Fitur CSS `:has()` dipakai untuk state segmented; sediakan fallback dengan `:checked + span` agar tetap terbaca di browser lama.

**SEO dan meta.** `lang="id"`, `<title>`, `meta description`, `theme-color` (light/dark), Open Graph dasar, favicon SVG.

**Keamanan.** Tidak ada `innerHTML` dari input pengguna. Semua teks lewat React (auto-escape). Header keamanan lewat `vercel.json` (lihat 11).

---

## 11. Deploy ke Vercel (Hobby)

### 11.1 Konfigurasi proyek
- Framework preset: **Vite** (terdeteksi otomatis). Build command `npm run build`, output directory `dist`, install command bawaan.
- Tidak ada environment variable dan tidak ada serverless function.
- Halaman tunggal, jadi tidak perlu rewrite SPA.
- Node.js: gunakan versi LTS yang didukung Vercel (set `engines.node` di `package.json`).

### 11.2 `vercel.json`

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "X-Frame-Options", "value": "DENY" },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'none'"
        }
      ]
    }
  ]
}
```

CSP ini mengharuskan font self-host (sudah dipilih) dan tidak ada script inline. Jika suatu saat menambah script eksternal, longgarkan `script-src` secara sadar.

### 11.3 Langkah
1. `npm create vite@latest qr-studio -- --template react-ts`, kerjakan sesuai milestone, commit rutin.
2. Push ke GitHub (repo baru).
3. Di vercel.com: **Add New → Project → Import** repo → pastikan preset Vite → **Deploy**.
4. Setiap push ke `main` = deploy produksi, setiap branch/PR = preview URL otomatis.
5. (Opsional) Tambah domain kustom di Settings → Domains.

Alternatif CLI: `npm i -g vercel`, lalu `vercel` (preview) dan `vercel --prod`.

### 11.4 Catatan paket free
- Hobby dimaksudkan untuk **penggunaan pribadi/non-komersial**. Jika QR Studio dipakai untuk usaha berbayar atau berjualan, cek syarat terbaru di halaman pricing/terms Vercel.
- Batas bandwidth dan build bisa berubah. Cek angka terbaru di dashboard, situs ini statis dan kecil sehingga aman untuk trafik wajar.
- Tidak ada fitur yang bergantung pada server, jadi pindah host (Netlify, Cloudflare Pages) hanya butuh mengulang langkah build.

---

## 12. Milestone dan rencana kerja Claude Code

Kerjakan **satu milestone per sesi**, commit di akhir tiap milestone, dan jalankan `npm run build` + `npm test` sebelum lanjut. Setiap milestone menghasilkan sesuatu yang bisa dilihat.

### M0. Scaffold dan fondasi
- Buat proyek Vite React TS, hapus boilerplate, pasang `qrcode-generator`, `@fontsource-variable/bricolage-grotesque`, `vitest`.
- Buat `styles/tokens.css` (tema light/dark), `base.css`, struktur folder di bagian 6, `types.ts`, `defaults.ts`.
- Layout kosong: header, kolom preview + panel (belum ada isi), sticky di mobile dan desktop, safe-area.
- **Selesai jika:** halaman tampil rapi di lebar 375 px dan 1280 px, kedua tema, build hijau.

### M1. Input dan QR dasar
- `normalize.ts`, `qr.ts`, `useDebounced`, `InputSection`, `Preview` dengan `renderQr` versi paling sederhana (titik kotak, pojok kotak, hitam-putih).
- Empty state dan error terlalu panjang. Teks "Dibaca sebagai".
- Unit test `normalize` (tabel 8.2) dan `buildMatrix` (ukuran matriks, error saat terlalu panjang).
- **Selesai jika:** mengetik link menampilkan QR yang terbaca kamera HP.

### M2. Warna
- `ColorField`, `ToggleField`, `ColorPresets`, `ColorSection`, `useSettings` (belum persist).
- Gradasi, warna pojok terpisah, latar, transparan + pola kotak-kotak, `contrast.ts` + `Note`.
- Unit test `contrastNote`.
- **Selesai jika:** semua preset bekerja, peringatan kontras muncul pada kombinasi terbalik dan kontras rendah.

### M3. Bentuk
- `Segmented`, `ShapeSection`. Implementasi `smooth`, `dots`, pojok membulat/bulat, tepi kosong.
- Semua path lewat `geometry.ts`.
- **Selesai jika:** 3×3×3 kombinasi bentuk tetap terbaca kamera (uji sampel, minimal 6 kombinasi).

### M4. Logo
- `useLogo`, `LogoSection`, ukuran, bentuk, latar logo, `effectiveLogoPercent` + unit test (`(21,30)=23`, `(29,30)=30`).
- Modul di area logo dilewati.
- **Selesai jika:** logo PNG transparan, JPG persegi, dan SVG lebar sama-sama tampil benar, dan QR tetap terbaca.

### M5. Unduh dan simpan pengaturan
- `export.ts`, `ExportSection`, nama file, fallback tekan-lama, pesan status.
- `storage.ts` + `pickKnown`, tombol Reset.
- Unit test `fileName` dan `pickKnown` (nilai rusak jatuh ke default).
- **Selesai jika:** PNG 512/1024/2048 terunduh dan terbuka benar, muat ulang halaman mengembalikan warna/bentuk terakhir.

### M6. Poles, aksesibilitas, meta
- Audit keyboard dan screen reader, fallback `:has()`, `prefers-reduced-motion`.
- Meta tag, favicon SVG, OG.
- Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95.
- **Selesai jika:** target di bagian 1 tercapai.

### M7. Deploy
- Tambah `vercel.json` (11.2), `engines.node`, README singkat (cara jalan lokal, deploy).
- Deploy lewat GitHub → Vercel, uji URL produksi di HP (scan QR dari layar dan dari cetakan).
- **Selesai jika:** URL publik berfungsi dan header keamanan tampil (cek di DevTools → Network).

### M8 (opsional, P2). Cek keterbacaan
- Impor dinamis `jsqr`, decode `ImageData` preview saat idle, lencana "Terbaca" / "Mungkin sulit dipindai".

**Contoh prompt pembuka untuk Claude Code**
> Baca PRD-QR-Studio.md dan CLAUDE.md. Kerjakan hanya Milestone M0. Jangan mengerjakan milestone lain. Setelah selesai, jalankan build dan tampilkan ringkasan file yang dibuat.

---

## 13. Rencana pengujian

**Unit (Vitest)**
- `normalizeInput`: semua baris tabel 8.2.
- `contrastNote`: hitam di putih (kosong), putih di hitam (peringatan terbalik), abu terang di putih (kontras rendah), transparan (catatan latar).
- `effectiveLogoPercent`: batas bawah 10, batas per ukuran matriks.
- `buildMatrix`: ukuran = 21 + 4×(versi−1); input sangat panjang melempar error; UTF-8 (`"é"`, emoji) tidak melempar.
- `fileName`: `https://www.contoh.com/x` → `qr-contoh.com.png`; teks biasa → `qr-code.png`.
- `pickKnown`: nilai di luar rentang/enum jatuh ke default.

**Manual (wajib sebelum tiap deploy)**
1. Scan hasil dengan iOS Camera dan Google Lens untuk: hitam-putih polos, gradasi + logo, titik bulat + pojok bulat, latar transparan di atas kertas putih.
2. Uji layar HP 360 px: tidak ada scroll horizontal, sticky preview tidak menutupi kontrol.
3. Navigasi keyboard penuh (Tab, panah pada radio, Space pada checkbox).
4. Mode gelap dan terang.
5. Logo: PNG transparan, JPG, SVG, file 6 MB (ditolak), file `.txt` (ditolak).
6. Unduh 2048 px di iPhone Safari dan Chrome Android.

---

## 14. Kriteria selesai v1
- Semua FR P0 dan P1 memenuhi acceptance criteria.
- `npm run build` dan `npm test` hijau tanpa warning TypeScript.
- Uji manual bagian 13 lulus.
- Tercapai target Lighthouse dan ukuran bundle.
- Situs produksi hidup di Vercel dan dapat dipakai dari HP.

## 15. Ide v2 (di luar cakupan)
- Ekspor SVG dan PDF (vektor untuk cetak).
- Tipe QR: WiFi, vCard, WhatsApp dengan pesan awal, email.
- Toggle tema manual, UI bahasa Inggris.
- Simpan beberapa desain (preset pengguna) di `localStorage`.
- Bingkai "Scan me" dan teks di bawah QR.
- Sudut gradasi dan gradasi radial.

---

## Lampiran A. Isi `CLAUDE.md` yang disarankan

```md
# QR Studio

Aplikasi web statis (Vite + React + TypeScript) untuk membuat QR code dengan logo, warna, dan bentuk kustom.
Sumber kebenaran fitur dan desain: PRD-QR-Studio.md.

## Aturan kerja
- Kerjakan satu milestone (M0–M8) per sesi, sesuai PRD. Jangan melompat.
- Ubah seperlunya: gunakan edit terarah, jangan menulis ulang file yang tidak terkait.
- Logika di `src/lib/` harus murni dan bebas React. Penggambaran hanya di `lib/render.ts`.
- Semua bentuk digambar lewat helper di `lib/geometry.ts`.
- Tanpa library UI/state manager/router. Styling: CSS biasa + CSS variables di `styles/tokens.css`.
- Teks UI dalam bahasa Indonesia, sentence case, tanpa huruf kapital semua.
- Semua akses `localStorage` dibungkus try/catch.
- Jangan tambah request jaringan, analytics, atau script eksternal (CSP `default-src 'self'`).

## Perintah
- `npm run dev`  jalankan lokal
- `npm run build`  build produksi (harus hijau sebelum commit)
- `npm test`  unit test Vitest

## Definition of done per milestone
Build hijau, test hijau, ringkasan perubahan singkat, dan cek visual di lebar 375 px dan 1280 px.
```

## Lampiran B. Perbedaan dari prototipe HTML

Prototipe tunggal-berkas yang sudah dibuat bisa dipakai sebagai acuan perilaku visual. Perubahan untuk versi produksi:

| Prototipe | Produksi |
|---|---|
| Satu file HTML, script dari CDN | Vite + React + TS, dependensi lewat npm |
| Font dari Google Fonts | Font self-host via Fontsource |
| Unduh lewat kapabilitas platform artifact | Unduh via `<a download>` + Blob URL |
| Logo dibatasi 10–30% tanpa melihat versi QR | `effectiveLogoPercent` menyesuaikan dengan jumlah modul |
| Tidak menyimpan pengaturan | Simpan pengaturan ke `localStorage` (tanpa teks dan logo) |
| Tidak ada tes | Unit test untuk logika murni |
| Tanpa header keamanan | CSP dan header lain lewat `vercel.json` |# PRD: QR Studio

Aplikasi web untuk membuat QR code dari link, dengan logo di tengah serta warna dan bentuk yang bisa diatur. Dokumen ini ditulis untuk dieksekusi oleh Claude Code, bertahap per milestone, lalu di-deploy ke Vercel (Hobby/free).

| | |
|---|---|
| Nama kerja | QR Studio |
| Versi dokumen | 1.0 |
| Platform | Web (mobile-first, responsif sampai desktop) |
| Backend | Tidak ada. Semua proses di browser |
| Bahasa UI | Indonesia |
| Hosting | Vercel Hobby (static) |

---

## 1. Ringkasan dan tujuan

**Masalah.** Pembuat QR online biasanya menaruh iklan, membatasi logo/warna di paket berbayar, atau mengunggah data ke server.

**Solusi.** Satu halaman yang membuat QR langsung saat mengetik, mendukung logo, warna solid/gradasi, dan beberapa gaya bentuk, lalu mengunduh PNG resolusi tinggi. Tidak ada akun, tidak ada server, tidak ada data keluar dari perangkat.

**Tujuan (terukur)**
1. Dari buka halaman sampai PNG terunduh kurang dari 30 detik.
2. QR hasil dengan logo ukuran default terbaca oleh kamera HP standar (iOS Camera dan Google Lens) pada 3 dari 3 percobaan uji.
3. Preview diperbarui kurang dari 100 ms setelah perubahan opsi pada HP kelas menengah.
4. Lighthouse (mobile) Performance ≥ 90, Accessibility ≥ 95.
5. Bundle JS awal (gzip) di bawah 120 KB.

**Bukan tujuan (v1)**
- Akun, riwayat di server, QR dinamis (link yang bisa diganti setelah dicetak), analitik scan.
- Tipe QR selain URL/teks (WiFi, vCard, dll). Masuk daftar ide v2.
- Ekspor SVG/PDF (v2).

---

## 2. Pengguna dan skenario

**Persona utama:** pemilik usaha kecil, mahasiswa, panitia acara. Bukan desainer, memakai HP, ingin cepat dan hasil terlihat rapi.

| # | Skenario | Hasil yang diharapkan |
|---|---|---|
| S1 | Menempel link Instagram toko, unduh | PNG QR hitam-putih terbaca |
| S2 | Menambah logo toko dan warna brand | QR berlogo, warna sesuai brand, tetap terbaca |
| S3 | Membuat QR untuk dicetak di banner | Unduh 2048 px, tepi kosong cukup |
| S4 | Mencoba warna terlalu terang | Muncul peringatan kontras |
| S5 | Membuka lagi di lain hari | Pengaturan warna/bentuk terakhir masih tersimpan (logo tidak) |

---

## 3. Tech stack

| Bagian | Pilihan | Alasan |
|---|---|---|
| Build | Vite + React + TypeScript | Sudah familiar, deploy ke Vercel tanpa konfigurasi |
| Styling | CSS biasa dengan CSS variables (tanpa Tailwind) | Sedikit dependensi, tema light/dark lewat token |
| QR matrix | `qrcode-generator` | Kecil, memberi matriks modul mentah sehingga bentuk digambar sendiri |
| Font | `@fontsource-variable/bricolage-grotesque` | Self-host, tanpa request ke Google, cocok dengan CSP ketat |
| Test | Vitest (unit untuk logika murni) | Logika inti dibuat sebagai fungsi murni agar mudah dites |
| Lint | ESLint + Prettier (bawaan template) | |
| Opsional P2 | `jsqr` | Verifikasi otomatis QR hasil render bisa dibaca |

Aturan: tidak ada library UI, tidak ada state manager, tidak ada router. Satu halaman.

Catatan `qrcode-generator`: aktifkan encoding UTF-8 agar karakter non-ASCII aman (`qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8']`). Jika tipe TypeScript bawaan tidak memuat `stringToBytesFuncs`, tambahkan deklarasi modul di `src/types/qrcode-generator.d.ts`.

---

## 4. Requirement fungsional

Prioritas: **P0** wajib v1, **P1** sebaiknya v1, **P2** nanti.

### FR-1 Input link/teks (P0)
- Satu field teks. Placeholder `https://contoh.com/halaman`. `inputmode="url"`, `autocapitalize="off"`, `spellcheck="false"`.
- Preview diperbarui saat mengetik (debounce 120 ms).
- Normalisasi (lihat 8.2): domain tanpa skema otomatis diberi `https://`. Jika hasil normalisasi berbeda dari input, tampilkan "Dibaca sebagai: …".
- Input kosong menampilkan empty state, bukan QR.
- Teks terlalu panjang menampilkan pesan error yang jelas, bukan crash.

Acceptance: mengetik `wa.me/628123` menghasilkan QR untuk `https://wa.me/628123`. Menghapus semua teks mengembalikan empty state. Menempel 5000 karakter menampilkan pesan "terlalu panjang".

### FR-2 Logo (P0)
- Tombol "Pilih gambar logo". Terima `image/*`, maksimal 5 MB. Format yang dijamin: PNG, JPG, WebP, SVG.
- Setelah dipilih: thumbnail, tombol "Hapus logo".
- Ukuran logo: slider 10–30% (default 22%) dari lebar area QR.
- Bentuk logo: Asli (tanpa dipotong, fit di dalam kotak), Membulat (di-crop rounded), Bulat (di-crop lingkaran).
- Toggle "Beri latar di belakang logo" (default aktif). Warna latar mengikuti warna latar QR (putih jika transparan).
- Modul QR di area logo dihilangkan (bukan ditimpa) agar tepinya bersih.
- Logo dibatasi otomatis agar tidak menyentuh pojok QR (lihat 8.5).

Acceptance: file non-gambar menampilkan pesan error, logo tidak berubah. File > 5 MB ditolak dengan pesan. Menghapus logo mengembalikan QR penuh.

### FR-3 Warna (P0)
- Warna QR (color picker + kode hex).
- Toggle gradasi: menambah "warna gradasi kedua". Gradasi linear diagonal (kiri-atas ke kanan-bawah) melintasi seluruh kanvas.
- Toggle "Pojok sama dengan warna QR". Jika mati: warna pojok terpisah.
- Warna latar (color picker) dan toggle "Latar transparan" (PNG transparan; preview memakai pola kotak-kotak).
- 5 preset cepat: Tinta, Kobalt, Hutan, Senja (gradasi), Kunyit. Preset tidak mengubah logo, teks, atau bentuk.
- Peringatan kontras (lihat 8.4) tampil di bawah preview.

### FR-3b Bentuk (P0)
- Titik QR: Kotak, Halus (sudut membulat hanya di sisi yang tidak bertetangga), Titik (lingkaran).
- Pojok (finder pattern): Kotak, Membulat, Bulat.
- Tepi kosong (quiet zone): Tipis (2 modul), Sedang (3, default), Lebar (4).

### FR-4 Unduh (P0)
- Pilih ukuran: 512 / 1024 (default) / 2048 px.
- Tombol "Unduh PNG" mengunduh file bernama `qr-<hostname>.png` (atau `qr-code.png` jika bukan URL).
- Tombol nonaktif saat tidak ada QR.
- Ekspor dirender ulang di kanvas terpisah pada ukuran yang dipilih (bukan memperbesar preview).
- Fallback jika unduhan tidak didukung: tampilkan QR sebagai `<img>` dan petunjuk "Tekan lama gambar lalu pilih Simpan".
- Jika ekspor gagal (misalnya kanvas tainted karena logo SVG di sebagian browser): pesan yang menyarankan logo PNG/JPG.

### FR-5 Simpan pengaturan (P1)
- Simpan warna, bentuk, ukuran logo, tepi, ukuran ekspor di `localStorage` (`qr-studio:v1`).
- Teks dan logo **tidak** disimpan (privasi dan ukuran).
- Semua akses `localStorage` dibungkus `try/catch`; jika gagal, pakai default.
- Tombol "Reset" mengembalikan default dan menghapus penyimpanan.

### FR-6 Tema (P1)
- Mengikuti `prefers-color-scheme`. Tanpa toggle manual di v1.

### FR-7 Cek keterbacaan otomatis (P2)
- Setelah render, decode kanvas dengan `jsqr` dan tampilkan lencana "Terbaca" atau "Mungkin sulit dipindai". Dijalankan di idle (`requestIdleCallback`) dan tidak memblokir UI. Impor dinamis agar tidak menambah bundle awal.

---

## 5. Desain

### 5.1 Arah visual
Alat kecil yang tenang dan tajam. Satu hal yang menonjol: **QR itu sendiri**. Semua elemen lain diam dan rapi. Tanpa gradient dekoratif, tanpa kartu identik berbayang, tanpa animasi masuk. Gerak hanya sebagai respons aksi (perubahan segmented control, tekan tombol).

### 5.2 Design tokens

Warna (light / dark):

| Token | Light | Dark | Fungsi |
|---|---|---|---|
| `--bg` | `#EDF0F7` | `#0F1220` | Latar halaman |
| `--panel` | `#FFFFFF` | `#181C2E` | Panel pengaturan, frame QR |
| `--field` | `#F4F6FB` | `#20253A` | Input, segmented, chip |
| `--ink` | `#151A2C` | `#EEF0F8` | Teks utama |
| `--muted` | `#5B647C` | `#A3ACC6` | Teks sekunder |
| `--line` | `#D9DEEA` | `#2C3250` | Garis pemisah, border |
| `--accent` | `#2B4BFF` | `#8AA0FF` | Tombol utama, state terpilih |
| `--accent-ink` | `#FFFFFF` | `#0B1030` | Teks di atas accent |
| `--warn` | `#9A5B00` | `#F0B85A` | Peringatan kontras |
| `--danger` | `#B4232A` | `#FF8A8F` | Pesan error |
| `--check1/2` | `#E4E8F2/#F7F8FC` | `#262B44/#1E2238` | Pola transparan |

Implementasi tema: definisikan di `:root`, override di `@media (prefers-color-scheme: dark)`.

Tipografi: satu keluarga, **Bricolage Grotesque** (variable, weight 400–700), fallback `system-ui, sans-serif`.

| Peran | Ukuran | Weight |
|---|---|---|
| H1 | 1.75rem (mobile), 2.2rem (≥860px), tracking -0.02em | 700 |
| H2 (judul seksi) | 1.05rem | 650 |
| Body/label | 0.95–1rem | 400 |
| Hint/catatan | 0.88–0.9rem | 400 |
| Input | **16px** (mencegah zoom otomatis iOS) | 400 |

Panjang baris teks bantu maksimum 52 karakter. Label memakai sentence case, tanpa huruf kapital semua.

Spasi dan bentuk: skala 4px (4, 8, 12, 16, 18, 24, 32). Radius: field/segmented 12px, chip pill, panel 16px, frame QR 14px (mobile) / 18px (desktop). Satu panel besar dengan pemisah garis tipis antar-seksi, bukan banyak kartu terpisah.

### 5.3 Layout

**Mobile (<860px):** satu kolom. Preview QR **sticky** di atas (lebar 190px) supaya perubahan warna/bentuk terlihat sambil menggulir. Panel pengaturan di bawahnya.

```
┌──────────────────────────┐
│ Pembuat QR Code          │
│ Tempel link, tambahkan…  │
├──────────────────────────┤ ← sticky
│        ┌────────┐        │
│        │   QR   │        │
│        └────────┘        │
│   (catatan kontras)      │
├──────────────────────────┤
│ Link atau teks           │
│ [ https://contoh.com   ] │
│ Dibaca sebagai: …        │
│──────────────────────────│
│ Logo                     │
│ [Pilih gambar logo]      │
│──────────────────────────│
│ Warna                    │
│ (Tinta)(Kobalt)(Hutan)…  │
│ Warna QR         ■ #151A │
│ ☐ Pakai warna gradasi    │
│ ☑ Pojok sama dgn QR      │
│ Warna latar      ■ #FFFF │
│ ☐ Latar transparan       │
│──────────────────────────│
│ Bentuk                   │
│ Titik QR  [Kotak|Halus|Titik]
│ Pojok     [Kotak|Membulat|Bulat]
│ Tepi kosong [Tipis|Sedang|Lebar]
│──────────────────────────│
│ Unduh                    │
│ Ukuran [512|1024|2048]   │
│ [        Unduh PNG     ] │
└──────────────────────────┘
```

**Desktop (≥860px):** dua kolom `minmax(300px, 400px) 1fr`, jarak 28px. Kolom kiri: preview besar, sticky (`top: 16px`). Kolom kanan: panel pengaturan. Lebar maksimum konten 980px, di tengah.

```
┌──────────────────────────────────────────────┐
│ Pembuat QR Code                              │
│ Tempel link, tambahkan logo…                 │
│ ┌────────────┐  ┌────────────────────────┐   │
│ │            │  │ Link atau teks         │   │
│ │     QR     │  │ Logo                   │   │
│ │  (sticky)  │  │ Warna                  │   │
│ │            │  │ Bentuk                 │   │
│ └────────────┘  │ Unduh                  │   │
│  catatan        └────────────────────────┘   │
└──────────────────────────────────────────────┘
```

### 5.4 Komponen

| Komponen | Perilaku |
|---|---|
| `Segmented` | Radio group visual. Radio asli disembunyikan (posisi absolut, opacity 0) di atas label; terpilih = latar accent; fokus keyboard = outline 3px accent. Sentuhan minimal 38px tinggi. |
| `ColorField` | `<input type="color">` 48×40 + kode hex monospace di sampingnya. |
| `ToggleField` | Checkbox 22px dengan `accent-color`. Seluruh baris bisa diklik. |
| `ColorPresets` | Chip pill dengan swatch bulat (setengah warna QR, setengah latar; gradasi untuk Senja). |
| `LogoPicker` | Label bergaya tombol berbingkai putus-putus membungkus `<input type=file>` tersembunyi secara visual (tetap bisa difokus), thumbnail 44px, tombol "Hapus logo". |
| `Preview` | Frame persegi, canvas 720×720 internal, skala lewat CSS. Tiga state: kosong, tampil, error. |
| `Note` | `role="status"`, teks warna `--warn`, tinggi minimal 1 baris agar layout tidak melompat. |

Baris yang bergantung pada opsi (`gradasi kedua`, `warna pojok`, `warna latar`, kontrol logo) memakai atribut `hidden`, bukan hanya disable.

### 5.5 State UI

| State | Tampilan |
|---|---|
| Kosong | Teks "Masukkan link untuk melihat QR code di sini." di dalam frame, tombol Unduh nonaktif |
| Normal | Canvas tampil, tombol aktif |
| Terlalu panjang | Pesan di frame: "Teks terlalu panjang untuk QR code. Coba link yang lebih pendek." |
| Logo error | Pesan merah di bawah tombol logo (`role="alert"`) |
| Kontras buruk | Catatan kuning di bawah preview |
| Mengunduh | Tombol nonaktif sesaat, lalu pesan "QR code tersimpan." (`role="status"`) |
| Unduhan tak didukung | Canvas diganti `<img>`, tombol disembunyikan, petunjuk tekan-lama |

### 5.6 Aksesibilitas
- Semua kontrol punya label terhubung (`for`/`id` atau `aria-label`).
- Group segmented: `role="radiogroup"` + `aria-label`.
- Fokus keyboard selalu terlihat (outline 3px, offset 2px).
- Target sentuh ≥ 44px untuk tombol dan chip.
- Warna teks memenuhi kontras WCAG AA di kedua tema.
- Canvas: `role="img"` + `aria-label="Pratinjau QR code"`.
- Hormati `prefers-reduced-motion` (transisi hanya 150 ms pada warna, dinonaktifkan jika reduce).
- Padding aman untuk notch: `viewport-fit=cover` dan `env(safe-area-inset-*)` pada root; elemen sticky memakai `top: env(safe-area-inset-top)`.

---

## 6. Arsitektur

```
qr-studio/
├─ index.html
├─ vite.config.ts
├─ vercel.json
├─ CLAUDE.md
├─ public/
│  └─ favicon.svg
└─ src/
   ├─ main.tsx
   ├─ App.tsx
   ├─ styles/
   │  ├─ tokens.css        # variabel warna, spasi, radius, tema
   │  ├─ base.css          # reset, body, tipografi, focus
   │  └─ components.css
   ├─ components/
   │  ├─ Preview.tsx
   │  ├─ InputSection.tsx
   │  ├─ LogoSection.tsx
   │  ├─ ColorSection.tsx
   │  ├─ ShapeSection.tsx
   │  ├─ ExportSection.tsx
   │  ├─ Segmented.tsx
   │  ├─ ColorField.tsx
   │  ├─ ToggleField.tsx
   │  └─ ColorPresets.tsx
   ├─ hooks/
   │  ├─ useSettings.ts    # state + persist localStorage
   │  ├─ useDebounced.ts
   │  └─ useLogo.ts        # baca file → HTMLImageElement + error
   ├─ lib/
   │  ├─ types.ts
   │  ├─ defaults.ts
   │  ├─ presets.ts
   │  ├─ normalize.ts      # normalizeInput()
   │  ├─ qr.ts             # buildMatrix()
   │  ├─ geometry.ts       # path helper, logo box, finder check
   │  ├─ render.ts         # renderQr() (murni terhadap canvas)
   │  ├─ contrast.ts       # contrastNote()
   │  ├─ export.ts         # exportPng(), downloadBlob(), fileName()
   │  └─ storage.ts        # load/save settings aman
   └─ lib/__tests__/
      ├─ normalize.test.ts
      ├─ contrast.test.ts
      ├─ geometry.test.ts
      └─ qr.test.ts
```

Prinsip: `lib/` tidak mengimpor React. Komponen hanya menampilkan state dan memanggil `lib/`. Logika penggambaran hanya ada di `render.ts`.

**Aliran data**

```
input teks ─(debounce)→ normalizeInput ─→ buildMatrix ─┐
settings (warna/bentuk/margin/logoSize) ───────────────┼→ renderQr(canvas 720) → Preview
logo (HTMLImageElement) ───────────────────────────────┘
                                                       └→ (klik Unduh) renderQr(canvas offscreen N px) → toBlob → download
```

Rendering dipicu `useEffect` yang bergantung pada matriks, settings, dan logo, dan menjadwalkan via `requestAnimationFrame` (batalkan yang lama).

---

## 7. Model data

```ts
// lib/types.ts
export type ModuleShape = 'square' | 'smooth' | 'dots';
export type EyeShape = 'square' | 'rounded' | 'circle';
export type LogoShape = 'original' | 'rounded' | 'circle';
export type Hex = `#${string}`;

export interface Settings {
  // logo
  logoSize: number;        // 10..30 (persen)
  logoShape: LogoShape;
  logoPlate: boolean;
  // warna
  fg: Hex;
  fg2: Hex;
  gradient: boolean;
  bg: Hex;
  transparent: boolean;
  eyeSame: boolean;
  eye: Hex;
  // bentuk
  module: ModuleShape;
  eyeShape: EyeShape;
  margin: 2 | 3 | 4;
  // ekspor
  exportSize: 512 | 1024 | 2048;
}

export interface RenderInput {
  matrix: boolean[][];              // matrix[row][col] = modul gelap
  settings: Settings;
  logo: HTMLImageElement | null;
}
```

```ts
// lib/defaults.ts
export const DEFAULTS: Settings = {
  logoSize: 22, logoShape: 'rounded', logoPlate: true,
  fg: '#151A2C', fg2: '#2B4BFF', gradient: false,
  bg: '#FFFFFF', transparent: false, eyeSame: true, eye: '#151A2C',
  module: 'smooth', eyeShape: 'rounded', margin: 3, exportSize: 1024,
};
```

Preset (`lib/presets.ts`): `{ name, fg, fg2, gradient, bg, eyeSame, eye }`.

| Nama | fg | fg2 | gradient | bg | eyeSame | eye |
|---|---|---|---|---|---|---|
| Tinta | #151A2C | #2B4BFF | tidak | #FFFFFF | ya | #151A2C |
| Kobalt | #2340E0 | #2B4BFF | tidak | #FFFFFF | tidak | #0B1B7A |
| Hutan | #1B6B3A | #2B4BFF | tidak | #F1F8EC | tidak | #0B3B1E |
| Senja | #D6249F | #3A3FE0 | ya | #FFFFFF | ya | #151A2C |
| Kunyit | #7A3E00 | #2B4BFF | tidak | #FFF3D1 | ya | #7A3E00 |

Menerapkan preset: timpa `fg, fg2, gradient, bg, eyeSame, eye` dan set `transparent = false`.

---

## 8. Logika inti

### 8.1 Pembuatan matriks (`lib/qr.ts`)

```ts
import qrcode from 'qrcode-generator';

// UTF-8 agar karakter non-ASCII aman
(qrcode as any).stringToBytes = (qrcode as any).stringToBytesFuncs['UTF-8'];

export function buildMatrix(text: string): boolean[][] {
  const qr = qrcode(0, 'H');   // tipe 0 = otomatis, koreksi error H (30%) karena ada logo
  qr.addData(text);
  qr.make();                   // melempar error jika data terlalu panjang
  const n = qr.getModuleCount();
  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => qr.isDark(r, c)));
}
```

Pemanggil menangkap error dan menampilkan state "terlalu panjang". Koreksi error selalu **H**, baik ada logo maupun tidak.

### 8.2 Normalisasi input (`lib/normalize.ts`)

```ts
export function normalizeInput(raw: string): string {
  const t = raw.trim();
  if (!t) return '';
  if (/^[a-z][a-z0-9+.\-]*:/i.test(t)) return t;   // sudah ada skema (http:, mailto:, tel:, ...)
  if (/\s/.test(t)) return t;                       // ada spasi → teks biasa
  if (/^[^\s\/]+\.[^\s\/]{2,}/.test(t)) return 'https://' + t; // tampak seperti domain
  return t;
}
```

| Input | Output |
|---|---|
| `contoh.com` | `https://contoh.com` |
| `wa.me/62812345` | `https://wa.me/62812345` |
| `http://situs.id` | tidak berubah |
| `mailto:a@b.co` | tidak berubah |
| `halo dunia` | tidak berubah (teks biasa) |
| `kata` | tidak berubah |
| `   ` | `''` |

Pengguna yang butuh `http://` (misalnya alamat IP lokal) mengetiknya sendiri.

### 8.3 Geometri (`lib/geometry.ts`)

```ts
export type Radii = [number, number, number, number]; // tl, tr, br, bl

export function roundedRectPath(
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: Radii,
) {
  const [tl, tr, br, bl] = r;
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);     tr ? ctx.arcTo(x + w, y, x + w, y + tr, tr) : ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h - br); br ? ctx.arcTo(x + w, y + h, x + w - br, y + h, br) : ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + bl, y + h);     bl ? ctx.arcTo(x, y + h, x, y + h - bl, bl) : ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + tl);         tl ? ctx.arcTo(x, y, x + tl, y, tl) : ctx.lineTo(x, y);
  ctx.closePath();
}

/** Bentuk persegi ukuran `s`: lingkaran atau persegi dengan radius seragam. */
export function shapePath(
  ctx: CanvasRenderingContext2D, x: number, y: number, s: number, circle: boolean, radius: number,
) {
  if (circle) {
    ctx.moveTo(x + s, y + s / 2);                 // moveTo mencegah garis penghubung antar subpath
    ctx.arc(x + s / 2, y + s / 2, s / 2, 0, Math.PI * 2);
  } else {
    const r = Math.min(radius, s / 2);
    roundedRectPath(ctx, x, y, s, s, [r, r, r, r]);
  }
}

/** Modul (r,c) bagian dari salah satu dari 3 pola pojok 7×7? */
export function isFinder(r: number, c: number, n: number): boolean {
  return (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
}

/** Batas ukuran logo supaya tidak menyentuh pojok. n = jumlah modul per sisi. */
export function effectiveLogoPercent(n: number, requested: number): number {
  const maxPercent = Math.floor((100 * (n - 16)) / n);   // sisakan pola pojok + pemisah
  return Math.max(10, Math.min(requested, maxPercent));
}
```

Contoh: `effectiveLogoPercent(21, 30) === 23`, `effectiveLogoPercent(29, 30) === 30`.

### 8.4 Kontras (`lib/contrast.ts`)

```ts
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastNote(s: Settings): string {
  const bg = s.transparent ? '#FFFFFF' : s.bg;
  const fgs = [s.fg, ...(s.gradient ? [s.fg2] : []), ...(s.eyeSame ? [] : [s.eye])];
  const lb = luminance(bg);
  let lighter = false, min = Infinity;
  for (const c of fgs) {
    const lc = luminance(c);
    if (lc > lb) lighter = true;
    min = Math.min(min, (Math.max(lc, lb) + 0.05) / (Math.min(lc, lb) + 0.05));
  }
  const out: string[] = [];
  if (lighter) out.push('Warna QR lebih terang dari latar, dan banyak pemindai gagal membaca QR terbalik.');
  else if (min < 3) out.push('Kontras warna rendah, QR bisa sulit dipindai. Pilih warna QR yang lebih gelap.');
  if (s.transparent) out.push('Latar transparan: tempel di permukaan terang agar terbaca.');
  return out.join(' ');
}
```

### 8.5 Penggambaran (`lib/render.ts`)

Urutan gambar: latar → titik data → tiga pojok → (latar logo) → logo.

**Ukuran.** `n` = jumlah modul. `cell = px / (n + 2*margin)`, `origin = margin * cell`. Semua koordinat turunan dari `cell` dan `origin`.

**Kotak logo.** `pct = effectiveLogoPercent(n, settings.logoSize)`, `side = n * cell * pct / 100`, terpusat di `px/2`. Modul dilewati jika bersinggungan dengan kotak logo diperlebar `0.5 * cell`.

**Titik data.** Satu `beginPath()`, semua modul digabung, satu `fill()` (mencegah celah antar-modul). Bentuk:
- `square`: `ctx.rect`.
- `dots`: lingkaran jari-jari `0.45 * cell` (dengan `moveTo` sebelum `arc`).
- `smooth`: `roundedRectPath` dengan radius `0.45 * cell` hanya pada sudut yang **kedua** tetangga ortogonalnya kosong. Tetangga dihitung dari fungsi `dark()` yang sudah mengecualikan pola pojok dan modul yang dilewati oleh logo.

**Pojok.** Tiga posisi `(col,row)`: `(0,0)`, `(n-7,0)`, `(0,n-7)`. Cincin luar 7×7 dengan lubang 5×5 digambar dalam satu path dengan `fill('evenodd')`, lalu inti 3×3 dengan `fill()` terpisah. Radius: kotak = 0, membulat = `2.2 / 1.3 / 1.0 × cell` (luar / lubang / inti), bulat = lingkaran penuh.

**Logo.** Latar (jika aktif) selebar kotak logo + `0.4 * cell` di tiap sisi, warna `bg` (`#FFFFFF` jika transparan). Logo digambar dengan `clip` sesuai bentuk. Mode `original` memakai fit "contain" tanpa crop, mode `rounded/circle` memakai "cover".

Kode acuan:

```ts
import { Settings, RenderInput } from './types';
import { roundedRectPath, shapePath, isFinder, effectiveLogoPercent } from './geometry';

const TAU = Math.PI * 2;

export function renderQr(canvas: HTMLCanvasElement, px: number, { matrix, settings: s, logo }: RenderInput) {
  const n = matrix.length;
  canvas.width = px; canvas.height = px;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, px, px);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if (!s.transparent) { ctx.fillStyle = s.bg; ctx.fillRect(0, 0, px, px); }

  const cell = px / (n + 2 * s.margin);
  const o = s.margin * cell;

  let main: string | CanvasGradient = s.fg;
  if (s.gradient) {
    const g = ctx.createLinearGradient(0, 0, px, px);
    g.addColorStop(0, s.fg); g.addColorStop(1, s.fg2);
    main = g;
  }
  const eyeFill = s.eyeSame ? main : s.eye;

  // kotak logo
  let box: { x: number; y: number; w: number } | null = null;
  if (logo) {
    const side = (n * cell * effectiveLogoPercent(n, s.logoSize)) / 100;
    box = { x: px / 2 - side / 2, y: px / 2 - side / 2, w: side };
  }
  const pad = cell * 0.5;
  const skipped = (r: number, c: number) => {
    if (!box) return false;
    const x = o + c * cell, y = o + r * cell;
    return x + cell > box.x - pad && x < box.x + box.w + pad &&
           y + cell > box.y - pad && y < box.y + box.w + pad;
  };
  const dark = (r: number, c: number) =>
    r >= 0 && c >= 0 && r < n && c < n && !isFinder(r, c, n) && matrix[r][c] && !skipped(r, c);

  // 1) titik data
  ctx.fillStyle = main;
  ctx.beginPath();
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!dark(r, c)) continue;
      const x = o + c * cell, y = o + r * cell;
      if (s.module === 'square') {
        ctx.rect(x, y, cell, cell);
      } else if (s.module === 'dots') {
        const rad = cell * 0.45;
        ctx.moveTo(x + cell / 2 + rad, y + cell / 2);
        ctx.arc(x + cell / 2, y + cell / 2, rad, 0, TAU);
      } else {
        const R = cell * 0.45;
        const u = dark(r - 1, c), d = dark(r + 1, c), l = dark(r, c - 1), rt = dark(r, c + 1);
        roundedRectPath(ctx, x, y, cell, cell, [
          !u && !l ? R : 0, !u && !rt ? R : 0, !d && !rt ? R : 0, !d && !l ? R : 0,
        ]);
      }
    }
  }
  ctx.fill();

  // 2) pojok
  const circ = s.eyeShape === 'circle';
  const k = s.eyeShape === 'square' ? 0 : 1;
  for (const [c, r] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
    const x = o + c * cell, y = o + r * cell;
    ctx.fillStyle = eyeFill;
    ctx.beginPath();
    shapePath(ctx, x, y, 7 * cell, circ, k * 2.2 * cell);
    shapePath(ctx, x + cell, y + cell, 5 * cell, circ, k * 1.3 * cell);
    ctx.fill('evenodd');
    ctx.beginPath();
    shapePath(ctx, x + 2 * cell, y + 2 * cell, 3 * cell, circ, k * 1.0 * cell);
    ctx.fill();
  }

  // 3) logo
  if (box && logo) {
    const iw = logo.naturalWidth || logo.width || 300;
    const ih = logo.naturalHeight || logo.height || 300;
    const side = box.w;
    const isCirc = s.logoShape === 'circle';
    const lr = s.logoShape === 'rounded' ? side * 0.22 : s.logoShape === 'original' ? side * 0.12 : 0;

    if (s.logoPlate) {
      const pp = cell * 0.4;
      ctx.fillStyle = s.transparent ? '#FFFFFF' : s.bg;
      ctx.beginPath();
      shapePath(ctx, box.x - pp, box.y - pp, side + 2 * pp, isCirc, lr + pp);
      ctx.fill();
    }
    ctx.save();
    ctx.beginPath();
    if (s.logoShape === 'original') ctx.rect(box.x, box.y, side, side);
    else shapePath(ctx, box.x, box.y, side, isCirc, lr);
    ctx.clip();
    const sc = s.logoShape === 'original' ? Math.min(side / iw, side / ih) : Math.max(side / iw, side / ih);
    const dw = iw * sc, dh = ih * sc;
    ctx.drawImage(logo, box.x + (side - dw) / 2, box.y + (side - dh) / 2, dw, dh);
    ctx.restore();
  }
}
```

### 8.6 Logo (`hooks/useLogo.ts`)

```
pickFile(file):
  1. bukan image/*        → error "File harus berupa gambar (PNG, JPG, SVG, atau WebP)."
  2. file.size > 5 MB     → error "Ukuran gambar maksimal 5 MB."
  3. FileReader.readAsDataURL → new Image() → onload: simpan HTMLImageElement + dataURL thumbnail
  4. onerror              → error "Gambar ini tidak bisa dibaca. Coba file lain."
remove(): kosongkan state, reset value input file agar file yang sama bisa dipilih lagi
```

Logo hanya hidup di memori komponen. Tidak dikirim atau disimpan ke mana pun.

### 8.7 Ekspor (`lib/export.ts`)

```ts
export function fileName(value: string): string {
  try {
    const h = new URL(value).hostname.replace(/^www\./, '').replace(/[^a-z0-9.\-]/gi, '');
    if (h) return `qr-${h}.png`;
  } catch { /* bukan URL */ }
  return 'qr-code.png';
}

export function exportPng(input: RenderInput, px: number): Promise<Blob> {
  const c = document.createElement('canvas');
  renderQr(c, px, input);
  return new Promise((resolve, reject) =>
    c.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob null'))), 'image/png'));
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
```

Deteksi dukungan: `'download' in HTMLAnchorElement.prototype`. Jika tidak ada, pakai fallback `<img>` (lihat FR-4).

### 8.8 Penyimpanan pengaturan (`lib/storage.ts`)

```ts
const KEY = 'qr-studio:v1';
export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...pickKnown(JSON.parse(raw)) };   // buang kunci asing, validasi nilai
  } catch { return DEFAULTS; }
}
export function saveSettings(s: Settings) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }
export function clearSettings() { try { localStorage.removeItem(KEY); } catch {} }
```

`pickKnown` memvalidasi tiap field (enum, rentang angka, format hex `^#[0-9a-fA-F]{6}$`); nilai tidak valid jatuh ke default. Simpan dengan debounce 300 ms.

---

## 9. Kasus tepi

| Kasus | Penanganan |
|---|---|
| Teks kosong / hanya spasi | Empty state |
| Data melebihi kapasitas (≈1273 byte pada level H) | Catch error `make()`, pesan "terlalu panjang" |
| Emoji / huruf non-Latin | Encoding UTF-8, tetap terbaca |
| Logo transparan (PNG) | Latar logo aktif membuatnya tetap terlihat |
| Logo SVG tanpa width/height | Fallback dimensi 300×300 |
| Logo SVG membuat kanvas tainted di sebagian browser | `toBlob` gagal → pesan sarankan PNG/JPG |
| QR versi 1 (21 modul) + logo 30% | Ukuran dipangkas otomatis oleh `effectiveLogoPercent` |
| Warna QR lebih terang dari latar | Peringatan kontras (tidak diblokir) |
| Latar transparan + unduh | PNG dengan alpha |
| Layar iOS, kanvas 2048×2048 | Dalam batas kanvas iOS; jika `toBlob` gagal, tampilkan pesan dan sarankan 1024 |
| `localStorage` diblokir (mode privat) | Pakai default, tanpa error ke pengguna |
| Mengetik cepat | Debounce + batalkan `requestAnimationFrame` sebelumnya |
| Pilih file logo yang sama dua kali | Reset `input.value` saat hapus |

---

## 10. Non-fungsional

**Performa.** Render kanvas 720 px untuk versi QR sampai ±10 harus di bawah 50 ms di HP kelas menengah. Font variabel dimuat `font-display: swap`. Tidak ada library besar; `jsqr` (P2) hanya lewat `import()` dinamis.

**Privasi.** Tidak ada request jaringan setelah halaman termuat selain aset statis. Tidak ada analytics, cookie, atau third-party script. Teks dan logo tidak pernah meninggalkan browser. Cantumkan satu kalimat di bawah judul: "Semua diproses di perangkatmu."

**Browser.** Versi stabil terbaru Chrome, Edge, Firefox, Safari (iOS 15+). Fitur CSS `:has()` dipakai untuk state segmented; sediakan fallback dengan `:checked + span` agar tetap terbaca di browser lama.

**SEO dan meta.** `lang="id"`, `<title>`, `meta description`, `theme-color` (light/dark), Open Graph dasar, favicon SVG.

**Keamanan.** Tidak ada `innerHTML` dari input pengguna. Semua teks lewat React (auto-escape). Header keamanan lewat `vercel.json` (lihat 11).

---

## 11. Deploy ke Vercel (Hobby)

### 11.1 Konfigurasi proyek
- Framework preset: **Vite** (terdeteksi otomatis). Build command `npm run build`, output directory `dist`, install command bawaan.
- Tidak ada environment variable dan tidak ada serverless function.
- Halaman tunggal, jadi tidak perlu rewrite SPA.
- Node.js: gunakan versi LTS yang didukung Vercel (set `engines.node` di `package.json`).

### 11.2 `vercel.json`

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "X-Frame-Options", "value": "DENY" },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'none'"
        }
      ]
    }
  ]
}
```

CSP ini mengharuskan font self-host (sudah dipilih) dan tidak ada script inline. Jika suatu saat menambah script eksternal, longgarkan `script-src` secara sadar.

### 11.3 Langkah
1. `npm create vite@latest qr-studio -- --template react-ts`, kerjakan sesuai milestone, commit rutin.
2. Push ke GitHub (repo baru).
3. Di vercel.com: **Add New → Project → Import** repo → pastikan preset Vite → **Deploy**.
4. Setiap push ke `main` = deploy produksi, setiap branch/PR = preview URL otomatis.
5. (Opsional) Tambah domain kustom di Settings → Domains.

Alternatif CLI: `npm i -g vercel`, lalu `vercel` (preview) dan `vercel --prod`.

### 11.4 Catatan paket free
- Hobby dimaksudkan untuk **penggunaan pribadi/non-komersial**. Jika QR Studio dipakai untuk usaha berbayar atau berjualan, cek syarat terbaru di halaman pricing/terms Vercel.
- Batas bandwidth dan build bisa berubah. Cek angka terbaru di dashboard, situs ini statis dan kecil sehingga aman untuk trafik wajar.
- Tidak ada fitur yang bergantung pada server, jadi pindah host (Netlify, Cloudflare Pages) hanya butuh mengulang langkah build.

---

## 12. Milestone dan rencana kerja Claude Code

Kerjakan **satu milestone per sesi**, commit di akhir tiap milestone, dan jalankan `npm run build` + `npm test` sebelum lanjut. Setiap milestone menghasilkan sesuatu yang bisa dilihat.

### M0. Scaffold dan fondasi
- Buat proyek Vite React TS, hapus boilerplate, pasang `qrcode-generator`, `@fontsource-variable/bricolage-grotesque`, `vitest`.
- Buat `styles/tokens.css` (tema light/dark), `base.css`, struktur folder di bagian 6, `types.ts`, `defaults.ts`.
- Layout kosong: header, kolom preview + panel (belum ada isi), sticky di mobile dan desktop, safe-area.
- **Selesai jika:** halaman tampil rapi di lebar 375 px dan 1280 px, kedua tema, build hijau.

### M1. Input dan QR dasar
- `normalize.ts`, `qr.ts`, `useDebounced`, `InputSection`, `Preview` dengan `renderQr` versi paling sederhana (titik kotak, pojok kotak, hitam-putih).
- Empty state dan error terlalu panjang. Teks "Dibaca sebagai".
- Unit test `normalize` (tabel 8.2) dan `buildMatrix` (ukuran matriks, error saat terlalu panjang).
- **Selesai jika:** mengetik link menampilkan QR yang terbaca kamera HP.

### M2. Warna
- `ColorField`, `ToggleField`, `ColorPresets`, `ColorSection`, `useSettings` (belum persist).
- Gradasi, warna pojok terpisah, latar, transparan + pola kotak-kotak, `contrast.ts` + `Note`.
- Unit test `contrastNote`.
- **Selesai jika:** semua preset bekerja, peringatan kontras muncul pada kombinasi terbalik dan kontras rendah.

### M3. Bentuk
- `Segmented`, `ShapeSection`. Implementasi `smooth`, `dots`, pojok membulat/bulat, tepi kosong.
- Semua path lewat `geometry.ts`.
- **Selesai jika:** 3×3×3 kombinasi bentuk tetap terbaca kamera (uji sampel, minimal 6 kombinasi).

### M4. Logo
- `useLogo`, `LogoSection`, ukuran, bentuk, latar logo, `effectiveLogoPercent` + unit test (`(21,30)=23`, `(29,30)=30`).
- Modul di area logo dilewati.
- **Selesai jika:** logo PNG transparan, JPG persegi, dan SVG lebar sama-sama tampil benar, dan QR tetap terbaca.

### M5. Unduh dan simpan pengaturan
- `export.ts`, `ExportSection`, nama file, fallback tekan-lama, pesan status.
- `storage.ts` + `pickKnown`, tombol Reset.
- Unit test `fileName` dan `pickKnown` (nilai rusak jatuh ke default).
- **Selesai jika:** PNG 512/1024/2048 terunduh dan terbuka benar, muat ulang halaman mengembalikan warna/bentuk terakhir.

### M6. Poles, aksesibilitas, meta
- Audit keyboard dan screen reader, fallback `:has()`, `prefers-reduced-motion`.
- Meta tag, favicon SVG, OG.
- Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95.
- **Selesai jika:** target di bagian 1 tercapai.

### M7. Deploy
- Tambah `vercel.json` (11.2), `engines.node`, README singkat (cara jalan lokal, deploy).
- Deploy lewat GitHub → Vercel, uji URL produksi di HP (scan QR dari layar dan dari cetakan).
- **Selesai jika:** URL publik berfungsi dan header keamanan tampil (cek di DevTools → Network).

### M8 (opsional, P2). Cek keterbacaan
- Impor dinamis `jsqr`, decode `ImageData` preview saat idle, lencana "Terbaca" / "Mungkin sulit dipindai".

**Contoh prompt pembuka untuk Claude Code**
> Baca PRD-QR-Studio.md dan CLAUDE.md. Kerjakan hanya Milestone M0. Jangan mengerjakan milestone lain. Setelah selesai, jalankan build dan tampilkan ringkasan file yang dibuat.

---

## 13. Rencana pengujian

**Unit (Vitest)**
- `normalizeInput`: semua baris tabel 8.2.
- `contrastNote`: hitam di putih (kosong), putih di hitam (peringatan terbalik), abu terang di putih (kontras rendah), transparan (catatan latar).
- `effectiveLogoPercent`: batas bawah 10, batas per ukuran matriks.
- `buildMatrix`: ukuran = 21 + 4×(versi−1); input sangat panjang melempar error; UTF-8 (`"é"`, emoji) tidak melempar.
- `fileName`: `https://www.contoh.com/x` → `qr-contoh.com.png`; teks biasa → `qr-code.png`.
- `pickKnown`: nilai di luar rentang/enum jatuh ke default.

**Manual (wajib sebelum tiap deploy)**
1. Scan hasil dengan iOS Camera dan Google Lens untuk: hitam-putih polos, gradasi + logo, titik bulat + pojok bulat, latar transparan di atas kertas putih.
2. Uji layar HP 360 px: tidak ada scroll horizontal, sticky preview tidak menutupi kontrol.
3. Navigasi keyboard penuh (Tab, panah pada radio, Space pada checkbox).
4. Mode gelap dan terang.
5. Logo: PNG transparan, JPG, SVG, file 6 MB (ditolak), file `.txt` (ditolak).
6. Unduh 2048 px di iPhone Safari dan Chrome Android.

---

## 14. Kriteria selesai v1
- Semua FR P0 dan P1 memenuhi acceptance criteria.
- `npm run build` dan `npm test` hijau tanpa warning TypeScript.
- Uji manual bagian 13 lulus.
- Tercapai target Lighthouse dan ukuran bundle.
- Situs produksi hidup di Vercel dan dapat dipakai dari HP.

## 15. Ide v2 (di luar cakupan)
- Ekspor SVG dan PDF (vektor untuk cetak).
- Tipe QR: WiFi, vCard, WhatsApp dengan pesan awal, email.
- Toggle tema manual, UI bahasa Inggris.
- Simpan beberapa desain (preset pengguna) di `localStorage`.
- Bingkai "Scan me" dan teks di bawah QR.
- Sudut gradasi dan gradasi radial.

---


## Lampiran B. Perbedaan dari prototipe HTML

Prototipe tunggal-berkas yang sudah dibuat bisa dipakai sebagai acuan perilaku visual. Perubahan untuk versi produksi:

| Prototipe | Produksi |
|---|---|
| Satu file HTML, script dari CDN | Vite + React + TS, dependensi lewat npm |
| Font dari Google Fonts | Font self-host via Fontsource |
| Unduh lewat kapabilitas platform artifact | Unduh via `<a download>` + Blob URL |
| Logo dibatasi 10–30% tanpa melihat versi QR | `effectiveLogoPercent` menyesuaikan dengan jumlah modul |
| Tidak menyimpan pengaturan | Simpan pengaturan ke `localStorage` (tanpa teks dan logo) |
| Tidak ada tes | Unit test untuk logika murni |
| Tanpa header keamanan | CSP dan header lain lewat `vercel.json` |