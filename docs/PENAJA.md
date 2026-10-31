# Penaja Meta Didik (v18.38)

## Ringkasan

1. Paparan utama ada **jalur logo penaja** di bawah tajuk Meta Didik, dengan butang **🤝 Jadi Penaja**.
2. Syarikat mengisi borang: pakej, tempoh, lokasi dalam Meta Didik, maklumat syarikat, logo dan pegawai untuk dihubungi.
3. Pentadbir menyemak permohonan dalam **Dashboard Pentadbir → Pentadbir: penaja Meta Didik**:
   - hantar invois di luar aplikasi;
   - selepas bayaran diterima, tekan **Luluskan**.
4. Selepas diluluskan:
   - logo dipaparkan di paparan utama;
   - kedai, bangunan atau papan iklan berjenama dibina di lokasi pilihan dalam Meta Didik.
5. Tajaan tamat secara automatik pada tarikh tamat. Pentadbir boleh **Lanjut 3 bulan** atau **Tarik balik**.

## Kadar tajaan (cadangan, sebulan)

| Pakej | Harga | Paparan utama | Dalam Meta Didik |
|---|---|---|---|
| 🥈 Rakan Pendidikan | RM150 | Logo kecil | Papan iklan berlogo (dua muka) di lokasi pilihan |
| 🥇 Penaja Emas | RM400 | Logo sederhana | Kedai/bangunan berjenama: logo pada fasad dan papan bumbung, kanopi warna jenama, kad maklumat |
| 💎 Penaja Platinum | RM1,000 | Barisan pertama, logo besar | Bangunan lebih tinggi dengan LED warna jenama dan sepanduk; logo pada skrin memuat Meta Didik; ikon pada peta |

- **Minimum 3 bulan.** 6 bulan: diskaun 10%. 12 bulan: diskaun 20%.
- **Sekolah, PIBG, NGO atau badan pendidikan:** diskaun tambahan 30%. Jumlah diskaun maksimum 50%.
- **Contoh:** Emas 12 bulan = RM400 × 12 × 0.8 = **RM3,840**.
- **Asas penetapan:** kadar ini setara papan iklan digital kecil atau iklan media sosial tempatan, dan berpatutan untuk perniagaan kecil hingga sederhana.
- Kadar boleh diubah dalam `app.js` (`PJ_PAKEJ`, `PJ_DISKAUN`, `PJ_DISKAUN_PENDIDIKAN`).

## Lokasi tajaan (26 tempat sebenar, satu penaja setiap lokasi)

| Kawasan | Lokasi |
|---|---|
| Kuala Lumpur | KLCC, KL Sentral, Bukit Bintang, TBS, Mid Valley |
| Selangor & Putrajaya | Putrajaya, Cyberjaya, Shah Alam, kawasan KLIA |
| Selatan & tengah | Seremban, Melaka, Johor Bahru |
| Pantai Timur | Kuantan, Kuala Terengganu, Kota Bharu |
| Utara | Ipoh, George Town, Seberang Jaya, Alor Setar, Langkawi, Kangar |
| Sabah, Sarawak & Labuan | Kota Kinabalu, Sandakan, Kuching, Miri, Labuan |

- Lokasi yang sudah ditaja dipaparkan **"sudah ditaja"** dalam borang dan tidak boleh dipilih.
- Tambah lokasi dalam `PJ_LOK` (`app.js`).

## Perlindungan murid

- **Semua penaja disemak pentadbir.** Tiada logo dipaparkan secara automatik.
- **Syarat dalam borang:** tiada rokok/vape, minuman keras, perjudian, pinjaman tidak berlesen, kandungan dewasa, politik kepartian, atau apa-apa yang bercanggah dengan nilai murni dan dasar pendidikan.
- **Tiada pautan keluar dalam dunia 3D.** Kad penaja dalam Meta Didik hanya memaparkan logo, nama dan slogan. Pautan laman web hanya ada pada kad di paparan utama (`rel="sponsored"`).
- Setiap paparan dilabel **"Kandungan tajaan"** atau **"Penaja Meta Didik"**.
- Tiada data murid dikongsi dengan penaja.

## Data dan Rules

| Nod | Baca | Tulis |
|---|---|---|
| `penaja/<id>` | awam (logo, nama, pakej, lokasi, tarikh) | pentadbir sahaja (kunci moderator) |
| `penaja_mohon/<id>` | tiada (pentadbir sahaja) | cipta sahaja; ketat: perlu log masuk; disahkan (logo PNG/JPEG ≤ 120 KB, pakej, tempoh 3/6/12, panjang medan) |

- **Logo:** dikecilkan dalam pelayar kepada maksimum 400×200 px, kemudian disimpan sebagai data URL. Firebase Storage tidak diperlukan.
- **Rules:** ditambah ke keempat-empat fail dalam `docs/` oleh `tools/ujian/penaja-rules.py`. Peraturan lain tidak diubah.

## Inspirasi grafik

Bangunan penaja mengikut gaya "jalan bandar" permainan dunia terbuka moden:

- fasad kaca dengan bingkai logam;
- papan tanda jenama di fasad dan atas bumbung;
- kanopi berjalur;
- pasu tanaman;
- LED yang menyala pada waktu malam.

Tiada aset, logo atau jenama daripada mana-mana permainan sedia ada digunakan. Semua model dibina dengan kod.

## Belum dibuat: dunia "sedetail peta sebenar"

Membina setiap bandar Malaysia sedetail dunia sebenar memerlukan data bangunan (contohnya jejak bangunan OpenStreetMap, lesen ODbL), penjanaan model secara berperingkat, dan pengurusan prestasi telefon. Ia projek berasingan.

Cadangan langkah seterusnya:

1. **Satu bandar contoh dahulu.** Contohnya sekitar KLCC dan Bukit Bintang, menggunakan jejak bangunan OSM yang dimuat mengikut jubin.
2. **Penaja di bangunan sebenar.** Selepas itu, penaja boleh memilih bangunan sebenar dalam bandar contoh, bukan hanya lokasi tajaan.

Tangkapan skrin ujian: `docs/penaja/`.
