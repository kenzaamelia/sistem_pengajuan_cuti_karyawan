# Sistem Pengajuan Cuti

Aplikasi pengajuan & approval cuti karyawan berbasis Laravel 12 + Inertia.js (React), dengan alur approval bertingkat, cuti bersama (cascading deduction), dan monitoring lintas departemen untuk SDM.

## Tech Stack

- Laravel 12 (PHP 8.2)
- Inertia.js + React 18
- Tailwind CSS
- MySQL 8
- Docker & Docker Compose

## Peran (Role) dalam Sistem

| Role | Deskripsi |
|---|---|
| `karyawan_pelaksana` | Karyawan biasa, mengajukan cuti sendiri |
| `karyawan_pimpinan` | Punya jabatan `asisten_manajer` atau `manajer`, mengajukan cuti sendiri **dan** approver untuk bawahannya |
| `general_manager` | Approver tertinggi |
| `sdm` | Admin sistem: kelola cuti bersama, monitoring, edit/batalkan pengajuan |

## Menjalankan dengan Docker (disarankan)

1. **Salin file environment**

   ```bash
   cp .env.example .env
   ```

   Pastikan bagian database di `.env` sesuai `docker-compose.yml`:

   ```
   DB_CONNECTION=mysql
   DB_HOST=db
   DB_PORT=3306
   DB_DATABASE=pengajuan_cuti
   DB_USERNAME=laravel_user
   DB_PASSWORD=laravel_password
   ```

2. **Build & jalankan container**

   ```bash
   docker compose up -d --build
   ```

3. **Install dependency & siapkan aplikasi** (dijalankan di dalam container `app`)

   ```bash
   docker compose exec app composer install
   docker compose exec app php artisan key:generate
   docker compose exec app php artisan migrate --seed
   docker compose exec app php artisan storage:link
   ```

   > `migrate --seed` akan otomatis membuat 4 role dasar, 3 jenis cuti, 5 departemen, dan **1 akun SDM** (`sdm@pengajuancuti.com` / `sdmpg1001`) untuk login pertama kali.
   >
   > `storage:link` wajib dijalankan supaya file bukti cuti yang diunggah karyawan bisa diakses lewat browser.

4. **Install dependency frontend & jalankan Vite** (jika ingin hot-reload saat development)

   ```bash
   docker compose exec app npm install
   docker compose exec app npm run dev
   ```

   Untuk build produksi:

   ```bash
   docker compose exec app npm run build
   ```

5. Buka aplikasi di **http://localhost:8000**

### Perintah Docker yang sering dipakai

```bash
docker compose logs -f app        # lihat log aplikasi (error PHP, dsb)
docker compose exec app bash      # masuk ke shell container
docker compose down                # stop semua container
docker compose down -v             # stop + hapus volume database (reset total)
```

## Menjalankan Tanpa Docker

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
npm run build   # atau `npm run dev` untuk development
php artisan serve
```

## Akun Default Setelah Seeding

| Role | Email | Password |
|---|---|---|
| SDM (Admin) | sdm@pengajuancuti.com | sdmpg1001 |

Akun karyawan lain dibuat lewat halaman **Register**, atau ditambahkan manual oleh SDM sesuai kebutuhan.

## Keamanan: CAPTCHA di Login & Register

Halaman Login dan Register dilindungi Google reCAPTCHA v2 (checkbox "Saya bukan robot")
untuk mencegah bot brute-force login atau mendaftarkan akun palsu secara massal.

1. Install package PHP-nya:

   ```bash
   docker compose exec app composer require anhskohbo/no-captcha
   ```

2. Buat pasangan site key & secret key untuk domain Anda di
   [google.com/recaptcha/admin](https://www.google.com/recaptcha/admin) (pilih tipe **reCAPTCHA v2 — "Saya bukan robot"**).
   Untuk localhost, tambahkan `localhost` ke daftar domain.

3. Isi di `.env`:

   ```
   NOCAPTCHA_SITEKEY=isi_site_key_anda
   NOCAPTCHA_SECRET=isi_secret_key_anda
   ```

   > `.env.example` sudah diisi dengan **key uji resmi dari Google** yang selalu lolos
   > validasi — cukup untuk development lokal, tapi **wajib diganti** dengan key asli
   > sebelum dipakai produksi (key uji tidak benar-benar memblokir bot).

4. Build ulang frontend supaya widget captcha muncul:

   ```bash
   docker compose exec app npm run build
   ```

Jika `NOCAPTCHA_SITEKEY` kosong, halaman Login/Register akan menampilkan pesan
peringatan alih-alih widget captcha — bukan error, tapi pengingat untuk melengkapi
konfigurasi di atas.

## Troubleshooting Singkat

- **Error "Class not found" / halaman blank setelah pull perubahan terbaru** — jalankan `docker compose exec app composer dump-autoload`.
- **Error permission menulis ke `storage/` atau `bootstrap/cache/`** — jalankan:
  ```bash
  docker compose exec app chown -R www-data:www-data storage bootstrap/cache
  docker compose exec app chmod -R 775 storage bootstrap/cache
  ```
- **Perubahan file di `resources/js` tidak muncul** — pastikan `npm run dev` sedang berjalan, atau jalankan `npm run build` ulang untuk mode produksi.