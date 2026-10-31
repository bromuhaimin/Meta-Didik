# Penaja Meta Didik (v18.38)

## Ringkasan

1. Paparan utama ada **jalur logo penaja** di bawah tajuk Meta Didik, dengan butang **🤝 Jadi Penaja**.
2. Penaja mengisi borang:
   - **jumlah tajaan (RM) yang ingin diberikan**;
   - tempoh paparan logo (3, 6 atau 12 bulan);
   - paparan yang diingini;
   - lokasi dalam Meta Didik;
   - maklumat penaja, logo dan pegawai untuk dihubungi.
3. Pentadbir menyemak permohonan dalam **Dashboard Pentadbir → Pentadbir: penaja Meta Didik**:
   - urus sumbangan di luar aplikasi;
   - pilih jenis paparan;
   - tekan **Luluskan (sumbangan diterima)**.
4. Selepas diluluskan:
   - logo dipaparkan di paparan utama;
   - kedai, bangunan atau papan iklan berjenama dibina di lokasi pilihan dalam Meta Didik.
5. Tajaan tamat secara automatik pada tarikh tamat. Pentadbir boleh **Lanjut 3 bulan** atau **Tarik balik**.

## Tiada kadar tetap

Meta Didik menerima sebarang jumlah tajaan. Borang tidak memaparkan harga.

Penaja memilih jenis paparan yang diingini sebagai cadangan. Pentadbir menentukan paparan sebenar semasa meluluskan, berdasarkan jumlah sumbangan dan kesesuaian.

| Paparan | Paparan utama | Dalam Meta Didik |
|---|---|---|
| 🥈 Rakan Pendidikan | Logo kecil | Papan iklan berlogo (dua muka) di lokasi pilihan |
| 🥇 Penaja Emas | Logo sederhana | Kedai/bangunan berjenama: logo pada fasad dan papan bumbung, kanopi warna jenama, kad maklumat |
| 💎 Penaja Platinum | Barisan pertama, logo besar | Bangunan lebih tinggi dengan LED warna jenama dan sepanduk; logo pada skrin memuat Meta Didik; ikon pada peta |

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
| `penaja_mohon/<id>` | tiada (pentadbir sahaja) | cipta sahaja; ketat: perlu log masuk; disahkan (jumlah tajaan RM ≥ 1, logo PNG/JPEG ≤ 120 KB, jenis paparan, tempoh 3/6/12, panjang medan) |

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
