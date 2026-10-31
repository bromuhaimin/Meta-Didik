# Meta Didik: Log pembangunan

Entri terbaru di atas. Setiap entri mengandungi:
- apa yang siap;
- apa yang diuji;
- apa yang belum siap;
- masalah;
- langkah seterusnya.

Status fasa ada dalam `ROADMAP.md`.

---

## 2026-10-31 · v18.46 · Grafik Tanah Suci (Jeddah, Makkah, Madinah) dipertingkat
Branch `claude/grafik-tanahsuci`.

**Laporan pengguna:** grafik dunia Tanah Suci di Terminal Haji kurang baik:
- khemah kon ringkas;
- pasir silau tanpa tekstur;
- pesawat kotak;
- apron berjalur (z-fighting).

**Siap** (`mod/tanahsuci.js`; semua tekstur dilukis dengan kod, tiada aset luar):
- **Pencahayaan dan atmosfera:**
  - tone mapping ACES;
  - langit bergradien dengan jerebu gurun di ufuk dan cahaya matahari;
  - kabus hangat;
  - cahaya hemisfera dan matahari diseimbangkan, bayang lebih bersih.
- **Rupa bumi:** tekstur pasir (bintik dan riak angin) didarab dengan warna ketinggian dan cerun. Laut Merah berkilat.
- **Terminal Haji Jeddah:**
  - 32 modul khemah fabrik melengkung (profil konkaf);
  - tiang tinggi di setiap bucu grid dengan kabel ke gelang puncak;
  - lantai plaza;
  - blok terminal berkaca;
  - barisan pokok kurma.
- **Lapangan terbang Madinah:** terminal moden, bukan khemah haji. Sebelum ini kedua-dua lapangan terbang menggunakan model khemah Jeddah.
- **Apron dan landasan:** bertekstur, dengan garis tepi dan tengah, garis teksi kuning dan garis tempat letak pesawat. Jalur z-fighting dihapuskan.
- **Pesawat Didik Air** (2 buah):
  - badan bertekstur dengan jalur hijau dan tingkap;
  - hidung dan kokpit, ekor tirus;
  - sayap dan penstabil bersudut, enjin, sirip hijau, roda.
- **Bangunan bandar:** bertingkap dengan 6 warna batu.
- **Pembetulan rupa bumi:**
  - Ketinggian kaki avatar dan kamera kini dikira daripada jejaring yang sama seperti yang dilukis: bucu bersela 2 sampel, tapak rata pada bucu, pembahagian segi tiga yang sama.
  - Sebelum ini, di lembah curam seperti Mina, avatar dan kamera berada di bawah permukaan dan pemain nampak laut "di bawah tanah". Masalah ini wujud sebelum v18.46.
  - Kamera kini dinaikkan apabila bukit menghalang pandangan ke avatar.

**Diuji** (Playwright, emulasi iPad Mini, SwiftShader):
- tangkapan Jeddah (dekat dan jauh), Makkah dan Mina;
- raycast mengesahkan kamera di atas jejaring rupa bumi;
- ~155k segi tiga, 45–48 panggilan lukisan;
- tiada ralat halaman;
- Node 59/59.
- **Belum diuji pada iPad sebenar.**

---

## 2026-10-31 · v18.45 · Pembaikan iPad: simulasi haji 3D dan kawalan sentuh
Branch `claude/haji-ipad`.

**Laporan pengguna**
- Simulasi haji 3D di iPad: avatar pemain berada di tepi kanan dan sebahagian dunia kosong.
- iPad mini: tidak boleh berjalan.

**Punca (disahkan)**
- **Paparan senget** (`mod/prak.js`):
  - Kanvas WebGL hanya ada `inset:0` tanpa lebar dan tinggi CSS, jadi ia dipapar mengikut saiz penimbal (lebar × dpr).
  - Pada iPad (dpr 2), kanvas 1024×768 dipapar 2048×1536. Hanya suku atas-kiri kelihatan dan pemain (di tengah) terhumban ke kanan bawah.
  - Disahkan dengan kod lama dalam Playwright (emulasi iPad Mini): saiz CSS kanvas 2048×1536.
- **Tidak boleh berjalan di Tanah Suci** (`mod/tanahsuci.js`):
  - Gelang kayu bedik `.ts-js` ialah `div` di atas kanvas tanpa `pointer-events:none`.
  - Sentuhan pada gelang itu tidak sampai ke kanvas: 0 peristiwa `touchstart` atau `pointerdown` pada kanvas.
- **Sentuhan iOS** (`prak`, `tanahsuci`, `perintis`):
  - Ketiga-tiganya bergantung pada Pointer Events untuk sentuhan.
  - Dunia Meta Didik utama sudah lama menggunakan Touch Events di Safari iOS kerana Pointer Events tidak boleh dipercayai di sana.

**Pembaikan**
- `.hj-cv`: `width:100%; height:100%`. `hj3Fit` juga menetapkan saiz gaya kanvas.
- `.ts-js`: `pointer-events:none`.
- Logik sentuhan dalam simulasi haji, Tanah Suci dan kawasan perintis dikongsi melalui fungsi `down`, `move` dan `end`:
  - peranti sentuh menggunakan Touch Events (`preventDefault`, `passive:false`);
  - tetikus dan pen menggunakan Pointer Events.

**Diuji** (Playwright, emulasi "iPad Mini landscape", dpr 2, sentuhan melalui CDP):
- **Simulasi haji:** saiz CSS kanvas 1024×768, sama dengan skrin. Kayu bedik menggerakkan pemain dan seretan kamera dilepaskan dengan betul.
- **Desktop:** tiada perubahan.
- **Tanah Suci:** kayu bedik menggerakkan pemain 5.4 unit. Sebelum pembaikan: 0.
- **Kawasan perintis:** regresi desktop dan telefon lulus (pergerakan, jejambat, A*, auto-jalan).
- **Ujian unit:** Node 59/59.
- **Belum disahkan pada iPad sebenar:** Chromium tidak meniru semua tingkah laku Safari iOS.

---

## 2026-10-31 · v18.44 · Topografi sebenar (Copernicus DEM) dan rupa bumi berpetak
Branch `claude/rupa-bumi-dem`.

**Siap**

Pipeline DEM (`tools/geo/dem.py`):
- Memuat turun hanya blok GeoTIFF yang diperlukan daripada Copernicus DEM GLO-30 (AWS Open Data) melalui HTTP Range.
- Pembaca COG ditulis sendiri dalam Python dan numpy (deflate, peramal titik apung). Tiada GDAL.
- Menjana `data/perintis/setapak-dem.json` dengan grid 153 × 152 pada jarak ~30.9 × 30.7 m.
- Menyimpan nilai DSM asal, dan tanah sebagai **anggaran** (pembukaan morfologi + purata).
- Merekod sumber, lesen, atribusi, rujukan EGM2008, pendaftaran piksel (PixelIsPoint) dan indeks baris/lajur asal.

Teras (`mod/perintis-teras.js`):
- `dem` dan `tinggiTanah`: interpolasi segi tiga sama dengan jejaring yang dilukis.
- `petakTanah` dan `indeksPetak`: petak dengan bucu tepi dikongsi.
- `ysNod`: jalan ikut tanah; jambatan lurus antara tebing + dek; terowong di bawah tanah.
- `padat`.
- `sediaLot` dan `semakLot`: lot pameran tidak dibenarkan menghalang jalan, berada dalam sungai, tasik atau kolam, atau bertindih bangunan.
- `tinggiPermukaan` kini menerima tinggi tanah.
- `semakTanah` kini menerima toleransi per objek.

Enjin (`mod/perintis.js`):
- Rupa bumi 25 petak, berwarna ikut ketinggian dan cerun, dengan LOD jarak.
- Jalan, garisan, tepi, sungai dan laluan A* ikut kontur.
- Tiang jejambat dari tanah ke dek.
- Bangunan dibenam pada tanah terendah tapak.
- Pokok, lampu isyarat dan label POI di atas tanah.
- Avatar dan kamera tidak menembusi tanah.
- Matahari dan bayang mengikut ketinggian.
- Info memaparkan ketinggian "~X m dpl (anggaran)".
- Peta mini dan peta penuh dengan lorekan bukit daripada DEM.
- **Mod topografi sahaja:** jika data OSM belum ada tetapi DEM ada, Setapak dibuka dengan rupa bumi sebenar dan mesej jelas bahawa jalan, sungai dan bangunan belum dimuat. Navigasi dimatikan dengan mesej.
- Atribusi Copernicus sentiasa dipaparkan.

Dokumen: `ROADMAP.md` dan log ini.

**Diuji**

Ujian unit:
- `python3 -m unittest tools/geo/ujian_validasi.py`: 10/10 lulus. Termasuk TIFF berjubin sintetik merentas 4 jubin dibaca tepat, serta anggaran tanah yang membuang "bangunan" sempit tetapi mengekalkan bukit lebar.
- `node --test tools/ujian/*.test.js`: 59/59 lulus. Termasuk 5 ujian baharu untuk rupa bumi, petak, `ysNod`, `padat` dan lot pameran.

Playwright (SwiftShader), desktop 1280×720 dan telefon 844×390 (sentuh), DEM Setapak sebenar:
- **Jurang petak:** 1,236 bucu tepi dikongsi, beza ketinggian maksimum 0 m.
- **Avatar jatuh dari 20 m** di 5 titik (ketinggian 48–114 m): mendarat tepat di tanah, beza 0.000 m.
- **Berjalan atau berlari mendaki:** y-tanah = 0.
- **Prestasi:** 25 petak, 20 panggilan lukisan, ~14k segi tiga, heap JS ~15 MB, 10–16 FPS. Angka ini dari SwiftShader dan bersifat relatif sahaja.

Regresi fixture sintetik tanpa DEM: semua keputusan sama seperti v18.42:
- jejambat 6.5 m;
- tidak menembusi bangunan;
- laluan A* 1.44 km;
- tiada ralat halaman.

Gabungan ujian enjin (fixture sintetik di atas DEM sebenar, **bukan geografi sebenar**):
- V8 = 0;
- berdiri di dek jejambat 8.46 m di atas tanah;
- di bawahnya kekal di tanah.

Data DEM: lembah Sungai Gombak dan Setapak di barat (~40–60 m), bukit di timur laut dan tenggara (sehingga ~216 m anggaran tanah; DSM sehingga 301 m). Ini konsisten dengan rupa bumi kawasan, tetapi belum disemak dengan titik ukur JUPEM.

**Belum siap**
- Data jalan, sungai dan bangunan OSM Setapak: ⛔ rangkaian.
- Penstriman berbilang kawasan (Fasa 4).
- Integrasi `semakLot` dengan portal guru.
- Ujian pada telefon sebenar.

**Masalah**
- **Rangkaian:** `overpass-api.de`, `overpass.kumi.systems`, `api.openstreetmap.org` dan `download.geofabrik.de` masih disekat. `copernicus-dem-30m.s3.amazonaws.com` dibenarkan.
- **Copernicus GLO-30 ialah DSM.** Di kawasan bandar padat, tanah anggaran mungkin masih termasuk sebahagian blok bangunan besar (lebih lebar daripada ~210 m).
- **Teks lesen Copernicus** dalam fail perlu disemak sekali lagi oleh pemilik dengan dokumen lesen rasmi ESA sebelum terbitan awam.

**Seterusnya:** lihat `ROADMAP.md` → "Tugasan seterusnya".

---

## 2026-10-31 · v18.43 · Istana Budaya (PR #51, telah di-merge)
- Siap: model khas Istana Budaya dalam dunia utama. Landasan kereta api mengelak tapaknya.
- Diuji: ujian Node lulus; Playwright tangkapan skrin; tiada ralat halaman.

## 2026-10-31 · v18.42 · Fasa 1 kawasan perintis Setapak (PR #50, telah di-merge)
- **Siap:**
  - audit;
  - kajian dataset;
  - pipeline OSM;
  - Geospatial Validation Engine;
  - enjin 3D berskala meter;
  - navigasi A*.
- **Diuji:** pada fixture sintetik (lihat `docs/FASA1-PERINTIS.md` §6).
- **Disekat:** data OSM sebenar (rangkaian).

---

## Automasi (cadangan, BELUM diaktifkan)
Persekitaran Claude Code di cloud menyokong **tugasan berjadual**. Ia memulakan sesi baharu mengikut jadual dan menghantar prompt tetap.

Cadangan kitaran harian:
1. **Jadual:** sekali sehari di luar waktu sibuk, contohnya 02:40 waktu Malaysia.
2. **Mod:** sesi baharu setiap kali dijalankan, dalam persekitaran repositori ini.
3. **Prompt:**
   > Baca `ROADMAP.md` dan `DEVELOPMENT_LOG.md`. Semak branch, commit dan PR terbuka. Pilih SATU tugasan teratas yang belum siap dan boleh diuji, laksanakan, jalankan `node --test tools/ujian/*.test.js` dan `python3 -m unittest tools/geo/ujian_validasi.py`, kemas kini kedua-dua dokumen, commit ke branch baharu `claude/harian-<tarikh>` dan buka PR untuk semakan. Jangan merge, jangan deploy, jangan ubah data produksi Firebase. Jika disekat (rangkaian, kunci API), tulis halangan dalam log dan berhenti.
4. **Pagar keselamatan:**
   - PR sahaja, tiada merge automatik;
   - tiada akses rahsia produksi;
   - pemilik menyemak setiap PR.

**Cara mengaktifkan:** pemilik boleh meminta dalam sesi Claude Code: "jadualkan kitaran pembangunan harian seperti dalam DEVELOPMENT_LOG.md". Jadual akan dicipta dan dipaparkan untuk pengesahan. Ia juga boleh dibuang atau dijeda bila-bila masa.
