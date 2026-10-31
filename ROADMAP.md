# Meta Didik: Roadmap dunia terbuka 3D Malaysia

Dokumen ini dibaca pada permulaan setiap sesi pembangunan. Kemas kini statusnya pada setiap PR.
Log terperinci setiap sesi ada dalam `DEVELOPMENT_LOG.md`.
Audit penuh dan kajian dataset ada dalam `docs/FASA1-PERINTIS.md`.

**Petunjuk status**

| Simbol | Maksud |
|---|---|
| ✅ | Siap dan diuji (cara ujian dinyatakan) |
| 🟡 | Sebahagian |
| ⛔ | Disekat (punca dinyatakan) |
| ⏳ | Belum dimulakan |

**Prinsip tetap**
- Tiada geografi direka. Data yang tidak lengkap dilabel "belum disahkan" atau "anggaran".
- Tiada deployment produksi atau merge tanpa kelulusan pemilik.
- Fungsi sedia ada dikekalkan: akaun, profil, avatar, subjek, kuiz, portal guru inovator, booth, penaja dan Lifelong ID.

## Seni bina (ringkas)

| Lapisan | Pelaksanaan |
|---|---|
| Dunia Malaysia utama (`dunia.js`) | Skala 7.5 unit/km, data kasar: sempadan Natural Earth, jalan utama, rel GTFS. Ia kekal sebagai peta navigasi negara. |
| Kawasan geospatial terperinci | Adegan berasingan berskala meter (`mod/perintis.js` dan `mod/perintis-teras.js`), dimuat bila perlu dari ☰ Menu |
| Data setiap kawasan | Fail statik daripada pipeline Python (`tools/geo/`), bukan Firebase |
| Fail OSM | `data/perintis/<kawasan>.json`, di bawah ODbL |
| Fail DEM | `data/perintis/<kawasan>-dem.json`, Copernicus GLO-30 |
| Pengesahan | Geospatial Validation Engine (`tools/geo/validasi.py`, V1–V7) dan semakan enjin V8, ujian Node dan Python |

## Fasa dan status

### Fasa 1: Audit dan prototaip geospatial Kuala Lumpur (Setapak)
| Tugasan | Status | Bukti |
|---|---|---|
| Audit repositori | ✅ | `docs/FASA1-PERINTIS.md` §1 |
| Kajian sumber data dan lesen | ✅ | `docs/FASA1-PERINTIS.md` §2 |
| Pipeline OSM (Overpass): muat → tukar → sahkan | ✅ kod dan ujian | `tools/geo/perintis.py`, ujian `UjianTukar` |
| Data OSM Setapak sebenar | ⛔ | Rangkaian persekitaran menyekat `overpass-api.de`, `openstreetmap.org` dan `download.geofabrik.de` |
| Geospatial Validation Engine V1–V8 | ✅ | `tools/geo/ujian_validasi.py`, `tools/ujian/perintis-teras.test.js` |
| Enjin 3D kawasan perintis | ✅ | Playwright desktop dan telefon pada fixture sintetik |

Ciri enjin 3D: jalan, jejambat, air, bangunan, avatar, kamera, peta mini, A*, serta grafik Rendah, Sederhana dan Tinggi.

Rasional pemilihan Setapak:
- kawasan bandar padat dengan sekolah dan institusi (pendidikan);
- ada sungai (Sungai Gombak dan Setapak) dan jejambat (MRR2, DUKE), jadi enjin validasi diuji dengan kes sebenar;
- bukit di timur (topografi);
- saiz 4.4 × 4.4 km sesuai untuk telefon.

### Fasa 2: Jalan, bangunan, sungai, jambatan dan topografi kawasan prototaip
| Tugasan | Status | Bukti |
|---|---|---|
| Topografi sebenar: Copernicus DEM GLO-30, 30 m | ✅ | `tools/geo/dem.py` (pembaca COG sendiri), `data/perintis/setapak-dem.json`, ujian `UjianDEM` |
| Rupa bumi 3D berpetak tanpa jurang | ✅ | 25 petak; bucu tepi dikongsi, beza 0 m (Playwright); ujian `petak rupa bumi` |
| Jalan ikut kontur; jambatan dan jejambat lurus antara tebing | ✅ (diuji pada fixture di atas DEM) | ujian `ysNod`, Playwright "gabungan" |
| Bangunan, pokok dan lampu di atas tanah (V8 = 0) | ✅ (fixture) | Playwright |
| Jalan, sungai dan bangunan Setapak sebenar | ⛔ | Menunggu akses Overpass atau Geofabrik |
| DTM sebenar (tanah tanpa bangunan) | 🟡 | Copernicus ialah DSM. Tanah ialah anggaran (pembukaan morfologi) dan dilabel begitu. |

### Fasa 3: Avatar, collision detection dan eksplorasi
| Tugasan | Status |
|---|---|
| Perlanggaran bangunan, tasik dan sungai; gelongsor di dinding | ✅ (fixture) |
| Avatar tidak jatuh menembusi tanah, termasuk jatuh dari 20 m di 5 titik bukit atau lembah | ✅ (DEM sebenar) |
| Kamera tidak masuk ke dalam bukit atau bangunan | ✅ |
| Berdiri di atas dek jejambat dan kekal di tanah di bawahnya | ✅ (fixture, rata dan atas DEM) |
| Laluan pejalan kaki khusus (footway, lintasan) | 🟡 graf sudah membezakan mod kaki dan kenderaan; perlu data OSM sebenar |

### Fasa 4: Pengembangan berpetak ke seluruh WP Kuala Lumpur
| Tugasan | Status |
|---|---|
| Petak (chunk) rupa bumi dan LOD jarak | ✅ (dalam satu kawasan) |
| Penstriman kawasan ikut kedudukan avatar | ⏳ |
| Pipeline kawasan berbilang (grid kotak 2 km, rantau DEM merentas jubin 1°) | ⏳ |

Penstriman kawasan: manifest dan muat atau buang kawasan jiran.

### Fasa 5–8
| Fasa | Status |
|---|---|
| 5. Negeri Semenanjung (pipeline Geofabrik PBF luar talian, petak vektor) | ⏳ |
| 6. Sabah, Sarawak, Labuan | ⏳ |
| 7. Pengoptimuman grafik, prestasi telefon dan multiplayer kawasan terperinci | ⏳ |
| 8. Booth inovasi guru di peta sebenar | 🟡 |

Fasa 8 setakat ini: logik `semakLot` sudah ada dan diuji. Lot ditolak jika menghalang jalan, berada dalam sungai atau tasik, atau bertindih bangunan. Ia belum disambung ke portal guru.

## Kriteria penerimaan (setiap fasa)
| Kriteria | Status semasa |
|---|---|
| Kedudukan geografi ikut sumber | 🟡 DEM sebenar ✅; OSM ⛔ |
| Tiada jalan palsu merentas air | ✅ dikesan oleh V1 |
| Tiada sambungan jalan tidak sah | ✅ V5; graf hanya melalui nod dikongsi |
| Tiada jurang antara petak | ✅ |
| Tiada ralat rendering kritikal | ✅ tiada `pageerror` (Playwright) |
| Avatar tidak menembusi tanah | ✅ |
| Fungsi pembelajaran sedia ada kekal | ✅ 59 ujian Node lulus; dunia utama tidak diubah dalam sesi ini |
| Prestasi dan memori pada peranti ujian | 🟡 hanya SwiftShader (CPU); belum pada telefon sebenar |
| Keselamatan Firebase | 🟡 tiada perubahan Firebase dalam Fasa 1–2; ujian Rules sedia ada (`tools/ujian/*rules*`) |

## Keputusan yang menunggu pemilik
1. **Akses rangkaian** ke `overpass-api.de` atau `download.geofabrik.de` dalam tetapan persekitaran pembangunan. Ini penyekat utama Fasa 1–2.
2. **Subjek:** master prompt menyatakan "Kekalkan Tasawwur Islam sebagai keutamaan; jangan buka subjek lain tanpa konfigurasi". Namun v18.40 (PR #48) membuka semua subjek atas arahan pemilik. Tiada perubahan dibuat sehingga pemilik memutuskan.
3. **Automasi harian:** lihat `DEVELOPMENT_LOG.md` bahagian "Automasi". Belum diaktifkan.

## Tugasan seterusnya (ikut keutamaan)
1. Jana data OSM Setapak: `python3 tools/geo/perintis.py semua setapak`. Semak laporan validasi, kemudian ukur prestasi dengan data sebenar dan DEM.
2. Penstriman berbilang kawasan (Fasa 4): manifest kawasan, dan muat atau buang kawasan ikut kedudukan. Uji sempadan antara kawasan.
3. Sambung `semakLot` ke borang lot pameran guru bagi kawasan terperinci (Fasa 8).
4. Uji prestasi pada telefon sebenar (Android pertengahan dan iPhone Safari) dan rekod FPS serta memori.
