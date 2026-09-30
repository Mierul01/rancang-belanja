# Rancang Belanja

Perancang perbelanjaan bulanan yang membahagikan setiap item kepada **Wajib bayar** dan **Boleh tangguh**, supaya anda tahu berapa baki selepas bil yang tidak boleh ditunggu.

*A monthly expense planner that splits spending into **Must pay** and **Can defer**, so you always know what is left after the bills that can't wait.*

## Ciri-ciri / Features

- **Utama (Home)**: baki selepas bil wajib, pendapatan, jumlah wajib dan boleh tangguh, status bajet serta senarai bil yang perlu dibayar.
- **Pelan imbangan**: jika melebihi bajet, aplikasi mencadangkan item paling sedikit untuk ditangguhkan ke bulan depan.
- **Perbelanjaan**: tab Wajib / Boleh tangguh, tandakan dibayar, carian dan status tarikh akhir (Lewat, 3 hari lagi, Dibayar).
- **Laporan**: ringkasan bulan, trend 6 bulan dan pecahan mengikut kategori.
- **Tetapan**: bahasa (BM / English), tema (Sistem / Cerah / Gelap), mata wang, pendapatan bulanan, salin item berulang.
- Mesra telefon: menu bawah pada telefon, menu sisi pada komputer, dan boleh dipasang sebagai aplikasi (PWA).

## Jalankan dengan Docker / Run with Docker

```bash
docker compose up -d --build
```

Buka / open: http://localhost:8088

Data disimpan dalam pelayar (localStorage) pada setiap peranti.
*Data is stored in the browser (localStorage) on each device.*

## Struktur / Structure

| Fail | Kegunaan |
|---|---|
| `src/app.html` | Kod aplikasi (React 18 + htm, tanpa langkah build) |
| `build.js` | Membungkus `src/app.html` menjadi `public/index.html` dengan metadata PWA |
| `make-icons.js` | Menjana ikon PNG aplikasi |
| `public/` | Fail yang dihidangkan oleh nginx |
| `Dockerfile`, `nginx.conf`, `docker-compose.yml` | Konfigurasi Docker |

Selepas mengubah `src/app.html`:

```bash
node build.js
docker compose up -d --build
```
