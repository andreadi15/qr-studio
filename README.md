# QR Studio

Aplikasi web statis untuk membuat QR code dari link, dengan logo di tengah serta warna dan bentuk yang bisa diatur. Semua diproses di browser — tanpa akun, tanpa server, dan teks/logo tidak pernah meninggalkan perangkat.

Sumber kebenaran fitur dan desain: [PRD-QR-Studio.md](./PRD-QR-Studio.md).

## Menjalankan lokal

```bash
npm install
npm run dev
```

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server pengembangan Vite |
| `npm run build` | Build produksi ke `dist/` (typecheck + bundle) |
| `npm run preview` | Pratinjau hasil build |
| `npm test` | Unit test Vitest |
| `npm run test:watch` | Unit test mode watch |
| `npm run lint` | ESLint |

Menjalankan satu berkas test:

```bash
npx vitest run src/lib/__tests__/normalize.test.ts
```

## Arsitektur

```
src/
├─ components/   komponen tampilan (hanya render state + panggil lib/)
├─ hooks/        useSettings (persist), useDebounced, useLogo
├─ lib/          logika murni, bebas React
└─ styles/       tokens.css (tema), base.css, components.css
```

Aturan inti:

- `src/lib/` tidak mengimpor React dan seluruhnya bisa dites sebagai fungsi murni.
- Semua penggambaran QR ada di satu tempat: `src/lib/render.ts`.
- Semua bentuk/path lewat helper di `src/lib/geometry.ts`.
- Tanpa library UI, state manager, atau router. Satu halaman.
- Semua akses `localStorage` dibungkus `try/catch` (`src/lib/storage.ts`).

Aliran data:

```
input teks ─(debounce 120ms)→ normalizeInput ─→ buildMatrix ─┐
settings (warna/bentuk/margin/logoSize) ─────────────────────┼→ renderQr(canvas 720) → Preview
logo (HTMLImageElement) ─────────────────────────────────────┘
                                                             └→ (klik Unduh) renderQr(kanvas offscreen N px) → toBlob → unduh
```

## Deploy ke Vercel

Proyek ini statis: tidak ada environment variable dan tidak ada serverless function.

1. Push repo ke GitHub.
2. Di vercel.com: **Add New → Project → Import** repo. Framework preset terdeteksi otomatis sebagai **Vite** (build `npm run build`, output `dist`).
3. **Deploy**. Setiap push ke `main` menjadi deploy produksi, setiap PR mendapat preview URL.

Alternatif CLI:

```bash
npm i -g vercel
vercel          # preview
vercel --prod   # produksi
```

`vercel.json` memasang header keamanan, termasuk CSP `default-src 'self'`. Konsekuensinya: font harus self-host (dipakai Fontsource) dan **tidak boleh ada script eksternal atau request jaringan** setelah halaman termuat.

## Catatan pengembangan

- UI berbahasa Indonesia, sentence case.
- Satu milestone (M0–M8) per sesi kerja, sesuai PRD bagian 12.
- Ukuran font input 16px untuk mencegah zoom otomatis di iOS.
- Koreksi error QR selalu level H (30%), baik ada logo maupun tidak.
