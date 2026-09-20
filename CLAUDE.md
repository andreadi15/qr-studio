# CLAUDE.md

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
