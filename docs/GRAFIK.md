# Naik taraf grafik Meta Didik (v18.35)

## Semakan teknikal

- **Enjin:** Three.js r128 (`three.min.js` tempatan). Dunia 3D ialah satu fail `dunia.js`; avatar dalam `avatar3d.js`.
- **Deployment:** GitHub Pages (`metadidik.com`) dengan service worker (`sw.js`). Tiada langkah build: fail JS dihidang terus.
- **Punca visual rata dan kosong:**
  1. Hampir semua objek menggunakan `MeshLambertMaterial` warna tunggal tanpa tekstur, jadi kaca, logam dan konkrit kelihatan sama.
  2. Tiada peta persekitaran, jadi bahan PBR tidak memantulkan apa-apa.
  3. Tiada cahaya emissive pada waktu malam.
  4. Tiada bayang sentuhan, jadi objek kelihatan terapung.
  5. Kawasan seperti Dataran Inovasi hanya kotak di atas silinder kosong.
- **Punca masalah prestasi:**
  1. Hanya ada 2 tahap grafik, dan telefon menggunakan tetapan yang hampir sama.
  2. Jarak pandangan 1,700 unit dan pemusnahan objek pada 800 unit untuk semua peranti.
  3. Pergerakan kamera bergantung pada kadar bingkai.
  4. Dunia terus dilukis semasa aplikasi di latar belakang (audio tidak dijeda).

## Kawasan contoh: Dataran Inovasi

Rekaan baharu berlaku pada semua Dataran Inovasi (satu bagi setiap negeri) dan gerai Stesen Inovasi guru.

- **Lantai:** jubin batu bertekstur, saiz jubin 2 unit (skala ikut diameter dataran), dengan cincin motif pucuk rebung (songket) di tepi dataran.
- **Laluan masuk:** paving dengan jalur LED cyan di kedua-dua tepi.
- **Gerbang:**
  - tiang konkrit bersalut logam;
  - rasuk songket;
  - papan tanda "DATARAN INOVASI · NEGERI" yang dilukis dengan tulisan besar supaya jelas dibaca;
  - jalur LED.
- **Tugu hologram "Pokok Ilmu" di tengah:** sfera rangka dan cincin cahaya dengan animasi lembut. Ia statik apabila "Kesan visual: dikurangkan".
- **Gerai:**
  - bahan berbeza: lantai konkrit, tiang logam, panel komposit, sirip kaca lut sinar, kaunter kayu, bumbung;
  - jalur LED pada bumbung dan bingkai skrin bercahaya;
  - skrin kekal `MeshBasicMaterial` supaya tajuk inovasi jelas dibaca.
- **Landskap:** pasu tanaman (berbunga), bangku kayu dan lampu tiang yang menyala pada waktu malam.
- **Bayang sentuhan** (tekstur gradien murah) di bawah gerai, pasu, tiang dan tugu.
- **Pantulan langit** (peta persekitaran PMREM siang dan malam) hanya pada bahan baharu, jadi avatar dan kenderaan tidak berubah.

## Tetapan grafik (skrin mula Meta Didik)

| Tetapan | Rendah | Sederhana | Tinggi |
|---|---|---|---|
| Resolusi maksimum (devicePixelRatio) | 1.0 | 1.35 | 1.75 |
| Antialias | tidak | tidak | ya |
| Bayang matahari | tiada | PCF 1024 | PCF lembut 2048 |
| Bahan PBR + pantulan | Lambert | ya | ya |
| Grid rupa bumi | 20 unit | 16 unit | 12 unit |
| Pokok (biasa/palma/getah) | 2400/700/320 | 4200/1200/600 | 6500/1800/900 |
| Awan, titisan hujan, trafik | 36, 600, 6 | 50, 1000, 10 | 70, 1400, 14 |
| Jarak pandangan / kabus | 60% | 85% | 100% |
| Objek jauh disembunyikan | 450 unit | 650 unit | 800 unit |
| Bangku dan lampu dataran | tidak | ya | ya |

- **Lalai:**
  - Desktop: Tinggi.
  - Telefon: Sederhana, atau **Rendah secara automatik** jika RAM 3 GB atau kurang, atau 4 teras CPU atau kurang.
  - Tetapan lama "Jimat/Tinggi" dipetakan sekali.
- Hiasan setiap dataran menggunakan **instancing** (satu panggilan lukisan bagi setiap jenis objek) dan **LOD**, iaitu disembunyikan apabila kamera lebih 450 unit (kira-kira 60 km) dari dataran itu.

## Telefon: prestasi, bateri dan kawalan

1. **Jeda di latar belakang:** gelung grafik dihentikan dan audio digantung apabila murid bertukar aplikasi. Kedua-duanya bersambung semula apabila kembali.
2. **Had 30 FPS** (lalai pada telefon). Boleh ditukar di skrin mula: "FPS: 30 (jimat bateri)" / "FPS: 60".
3. **Mod Ringan automatik:** tahap Rendah pada peranti lemah. Ia mengurangkan jarak pandangan, pokok, trafik dan objek jauh.
4. **Bar kemajuan** semasa membina dunia: 8 fasa dengan peratus dan nama fasa. Pembinaan kini tak segerak, dan data dalam talian (stesen, kampus) dimuat selepas dunia siap.
5. **Skrin penuh + kunci landskap** secara automatik apabila masuk Meta Didik di telefon (Android Chrome; iPhone Safari tidak menyokong kunci orientasi). Keluar automatik apabila menutup Meta Didik. Butang "Skrin penuh" ada dalam ☰ Menu.
6. **Ketik untuk bergerak:**
   - Ketik satu tempat pada peta besar. Peta tertutup sendiri dan avatar berjalan ke destinasi itu.
   - Sentuh kayu bedik atau tekan kekunci untuk berhenti.
   - Avatar berhenti sendiri apabila tiba, atau apabila laluan terhalang (tiada kemajuan selama 3 saat).
7. **Kayu bedik dinamik** sudah wujud sebelum versi ini (`lmPointers`): kayu bedik muncul di tempat ibu jari menyentuh di sebelah kiri skrin.

Lain-lain:
- **Kamera lebih lancar:** pelicinan bebas kadar bingkai (`1 - e^(-k·dt)`). Jarak kamera apabila terlindung oleh bangunan dilicinkan (masuk pantas, keluar perlahan) supaya tidak melompat.
- **Kesan visual: penuh / dikurangkan:** ikut tetapan sistem (`prefers-reduced-motion`) dan boleh ditukar di skrin mula.

## Ukuran (diukur, bukan anggaran)

- **Keadaan ujian:**
  - Chromium headless dengan **SwiftShader**, iaitu pemaparan perisian pada CPU dan bukan GPU sebenar;
  - 1280×720;
  - Dataran Inovasi W.P., sudut kamera yang sama, 10:30 pagi, cuaca cerah.
- Nilai ms/bingkai hanya sesuai untuk **perbandingan relatif**, bukan FPS sebenar telefon atau komputer.

| | Panggilan lukisan | Segi tiga | ms/bingkai (SwiftShader) | Masa bina dunia |
|---|---|---|---|---|
| Sebelum (main, Tinggi) | 738 | 1.39 juta | 1189 | 32.7 s |
| Selepas, Tinggi | 780 | 1.39 juta | 1157 | 35.9 s |
| Selepas, Sederhana | 628 | 1.00 juta | 803 | 36.1 s |
| Selepas, Rendah | 336 | 0.76 juta | 427 | 32.5 s |

Tangkapan skrin sebelum dan selepas: `docs/grafik/`.

## Batasan dan perkara belum diuji

- Belum diuji pada telefon atau GPU sebenar. FPS sebenar dan suhu peranti belum diukur.
- Had 30 FPS belum dapat disahkan secara ukuran, kerana SwiftShader hanya mencapai kira-kira 3 FPS (di bawah had).
- Kunci landskap dan skrin penuh bergantung pada pelayar. iPhone Safari tidak menyokong kunci orientasi.
- Pengurusan warna sRGB dan tone mapping (ACES) belum diaktifkan. Ia mengubah semua warna sedia ada, jadi perlu dibuat sebagai langkah tersendiri dengan semakan menyeluruh.
- Tiada aset luar dimuat turun. Semua tekstur dilukis dengan kod (canvas).

## Cadangan kawasan seterusnya

1. **Sekolah murid** (titik mula setiap misi): bilik darjah, padang, bendera, dan pakaian seragam watak yang sopan.
2. **Stesen Ilmu** di institusi sebenar (masjid, mahkamah, Parlimen): bahan dan cahaya malam yang sama.
3. **Terminal bas, stesen MRT/LRT dan lapangan terbang:** kaca, logam dan papan arah yang jelas.
4. **Rupa bumi:** tekstur campuran (rumput, tanah, pasir) dan air laut yang lebih hidup.
5. **sRGB + tone mapping** untuk seluruh dunia (perubahan global yang memerlukan semakan warna menyeluruh).
