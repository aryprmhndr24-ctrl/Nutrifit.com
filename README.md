# NutriFit

Aplikasi web pelacak kalori, nutrisi, hidrasi, dan olahraga harian.
Dibuat dengan HTML, CSS, dan JavaScript murni (tanpa build, tanpa server).

## Fitur
- Daftar, masuk, dan keluar akun (data disimpan di browser lewat localStorage)
- Pencatatan makanan, air, dan olahraga
- Kalkulator BMI dan BMR
- Jadwal harian, riwayat, dan target berat badan
- Coach Maya (chat sederhana berbasis aturan)

## Menjalankan lokal
Buka `index.html` di browser, atau jalankan server lokal:

    python3 -m http.server 8000

lalu buka http://localhost:8000

## Deploy ke GitHub Pages
1. Unggah semua file ke repository (`index.html` harus berada di root).
2. Buka Settings > Pages.
3. Pada "Build and deployment", pilih Source: Deploy from a branch.
4. Pilih branch `main` dan folder `/ (root)`, lalu klik Save.
5. Tunggu 1–2 menit. Situs tersedia di `https://USERNAME.github.io/NAMA-REPO/`.

## Catatan
Akun hanya tersimpan di browser tempat mendaftar, sehingga cocok untuk demo atau portofolio.
Untuk akun lintas perangkat, gunakan backend seperti Supabase atau Firebase.
