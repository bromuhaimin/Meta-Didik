# Meta Didik v18.41: automasi penaja dan inovasi, Stesen Ilmu, pendaftaran, sivik

## 1. Penaja: automatik selepas pentadbir sahkan

1. Syarikat menghantar borang **🤝 Jadi Penaja**. Permohonan masuk ke **Dashboard Pentadbir → Pentadbir: penaja Meta Didik**.
2. Pentadbir pilih jenis paparan, kemudian tekan **Luluskan (sumbangan diterima)**. Selepas itu, tanpa langkah lain:
   - **Paparan utama:** logo penaja dimuat semula setiap 2 minit.
   - **Lokasi pilihan dalam Meta Didik:** bangunan atau papan iklan penaja dibina. Pemain yang sedang bermain melihatnya dalam masa 1 minit.
   - **Papan iklan digital baharu:** berdekatan setiap lapangan terbang dan terminal bas (sehingga 40 papan). Papan ini memaparkan logo semua penaja aktif secara bergilir setiap 6 saat. Semua papan berkongsi satu tekstur, jadi kos grafiknya rendah.

## 2. Guru dan Stesen Inovasi

**Log masuk**

- Guru **wajib log masuk akaun DELIMa**. Kod guru 1991 tidak lagi membuka akses (`GURU_DELIMA_WAJIB = true` dalam `app.js`).
- Log masuk DELIMa hanya aktif selepas pentadbir memasukkan **Web API Key** dan **OAuth Client ID** (`TW_AUTH`).
- Sebelum itu, Ruang Guru memaparkan makluman bahawa log masuk DELIMa sedang disediakan.

**Aliran pacak inovasi**

1. **Guru memacak inovasi** melalui ☰ Menu → 🏛 Pacak inovasi di sini. Booth **⏳ "Inovasi akan datang"** terus muncul di tempat itu dengan sinar emas yang malap.
2. **Pentadbir meluluskan.** Booth dibina semula secara automatik dalam masa 1 minit, boleh terus digunakan, dan menerima **sinar emas terang ke langit**. Pemain dalam dunia mendapat makluman "✨ Inovasi baharu dibuka".
3. **Ikut subjek.** Booth hanya muncul dalam dunia subjek yang dipilih guru. Pemain dalam subjek lain tidak akan menjumpainya.

## 3. Stesen Ilmu

**Had dan ganjaran**

- Had soalan ialah **30 soalan sehari bagi setiap stesen**, bukan untuk semua stesen bersama.
- Setiap jawapan betul memberi +2 MD, dengan kesan visual.

**Paparan**

- **Sinar hijau ke langit** di setiap stesen yang masih boleh dijawab. Sinar hilang apabila stesen sudah dijawab (semua tajuk lulus) atau had hariannya dicapai.
- **Pada peta besar dan peta mini:**
  - stesen yang belum dijawab **bercahaya hijau**;
  - stesen yang sudah dijawab **gelap**.

**Navigasi**

- Ketik ikon stesen pada peta dan avatar berjalan sendiri ke sana.
- Apabila had sesuatu stesen dicapai, butang **🧭 Navigasi ke stesen seterusnya** membawa pemain ke stesen bercahaya yang terdekat.

## 4. Menara Tabung Haji

Stesen Ilmu "Lembaga Tabung Haji" kini dibina sebagai **Menara Tabung Haji**. Ciri-cirinya:

- **Bentuk:** menara bulat berbentuk jam pasir, kakinya mengembang.
- **Badan:** kaca gelap dengan 28 rusuk putih menegak.
- **Gelang:** gelang putih di kaki.
- **Puncak:** mahkota putih berbukaan gerbang lancip.
- **Sinar:** sinar hijau Stesen Ilmu.

Model dilukis dengan kod; tiada aset luar digunakan.

## 4b. Mercu tanda Kuala Lumpur (dibina semula mengikut gambar rujukan)

| Mercu tanda | Ciri utama dalam Meta Didik |
|---|---|
| **Menara Berkembar Petronas** | Dua menara keluli berkeratan bintang bersegi lapan (corak Rub el Hizb), lima peringkat menirus dengan gelang, kon puncak, bebola dan menara tirus; jambatan langit dua tingkat berkaki V; podium Suria KLCC |
| **Menara Kuala Lumpur** | Batang putih beralur, kepala "kuntum" berwarna tanah liat dengan jalur kaca gelap dan putih berselang, dek atas dan antena panjang bergelang |
| **Menara Exchange 106 (TRX)** | Tempat baharu dalam peta. Menara kaca biru segi empat menirus, sirip putih di bucu, mahkota kekisi berlian putih, dua menara pejabat jiran dan dataran |
| **Bangunan Parlimen** (Stesen Ilmu) | Menara berfasad grid "kulit nenas" dengan blok mahkota bersirip, blok utama putih rendah, bumbung lipat segi tiga Dewan Rakyat dan anjung masuk |

**Pusat bandar Kuala Lumpur (ikut peta pelancong KL City Centre):**

| Tambahan | Butiran |
|---|---|
| Taman KLCC | Halaman hijau di hadapan Petronas dengan Tasik Simfoni, air pancut dan cincin pokok |
| Hutan Simpan Bukit Nanas | Hutan pokok mengelilingi Menara KL |
| Masjid Jamek Sultan Abdul Samad | Gaya Moor, bata merah jambu berjalur putih, tiga kubah bawang dan dua menara berjalur, di pertemuan Sungai Klang dan Sungai Gombak |
| Bangunan Sultan Abdul Samad | Bata merah berjalur putih, serambi gerbang, menara jam berkubah tembaga, Dataran Merdeka dan tiang Jalur Gemilang |
| Kampung Baru | Rumah Melayu kayu bertiang dengan bumbung tinggi |
| Bukit Bintang | Deretan kedai berwarna, papan neon dan gerbang tanda nama |

Nota skala: pusat bandar KL dibesarkan kira-kira 4 kali dalam Meta Didik (kanta Lembah Klang), tetapi masih padat. Model diletakkan di koordinat sebenar; jika tapak sudah diduduki, ia dianjak ke tempat lapang terdekat.

Semua model dilukis dengan kod (tiada aset atau imej luar).

## 5. Pendaftaran: 3 jenis

| Jenis | Keperluan |
|---|---|
| **Murid** | Nama, negeri dan sekolah. Markah digabungkan dengan sekolah. |
| **Pelawat** | Nama dan negeri sahaja, tanpa sekolah. Tidak dikira dalam kedudukan sekolah. Negeri digunakan untuk waktu solat. |
| **Guru** | Nama, negeri dan sekolah. Wajib log masuk DELIMa di Ruang Guru untuk memacak inovasi. |

## 6. Situasi amalan baik dan sivik

Terdapat **8 situasi sivik baharu** (jumlah keseluruhan kini 19 situasi):

| Situasi | Nilai |
|---|---|
| Beratur di kaunter | Kesopanan dan Kesusilaan |
| Tutup paip air terbiar | Tidak membazir |
| Lapor vandalisme kepada pengawal | Kedaulatan Undang-undang |
| Beri tempat duduk kepada warga emas | Hormat orang tua |
| Kibarkan semula Jalur Gemilang yang terjatuh | Kesetiaan kepada Raja dan Negara |
| Tahan adik dan tunggu lampu hijau sebelum melintas | Keselamatan jalan raya |
| Sedekah ke tabung bantuan banjir | Sedekah |
| Gotong-royong menanam pokok | Menjaga alam |

**Ganjaran (MD sebagai token tetap):**
- situasi sivik: **+5 MD**;
- situasi akhlak: **+3 MD**.

**Lencana baharu:**
- 🏅 Duta Sahsiah: 15 situasi.
- 🇲🇾 Warganegara Prihatin: 3 situasi sivik.
- 🛡 Jati Diri Malaysia: setiap jenis situasi sivik.

## 7. Bunyi

**Tapak kaki** diperlahankan kira-kira 70%.

**Azan:**
- Azan dan makluman waktu solat kini mengikut **negeri dalam profil murid**, dikira berdasarkan ibu negeri dengan kaedah JAKIM.
- Makluman menyebut kawasan, contohnya "🕌 Telah masuk waktu Asar bagi kawasan Kota Bharu, Kelantan".
- Kelantangan minimum dinaikkan supaya azan sentiasa kedengaran.
- Jika negeri tiada dalam profil, waktu dikira mengikut kedudukan avatar dalam peta.

Tangkapan skrin ujian: `docs/v18-41/`.
