# Jaringan Pengangkutan Malaysia dalam Meta Didik (v18.31)

Dokumen ini menghimpunkan maklumat jaringan jalan raya, lebuh raya, pengangkutan awam, lapangan terbang, terminal bas, rel dan pulau di Malaysia, serta cara maklumat itu digunakan dalam prototaip jaringan pengangkutan Meta Didik.

## 1. Skala dan ketepatan peta

- **Skala sebenar:** dunia Meta Didik menggunakan unjuran lat/lon sebenar, iaitu **6 unit = 1 km**. Jarak dan arah antara bandar, lapangan terbang dan terminal mengikut koordinat sebenar.
- **Kanta zum Lembah Klang:** pusat KL dibesarkan kira-kira 4.5 kali supaya stesen MRT/LRT tidak berhimpit. Jejarian kanta kira-kira 180 km; di luar kanta, peta tidak berubah. Jalan dan stesen di dalam kanta ikut dibesarkan secara automatik.
- **Rupa bumi:** ketinggian sebenar daripada DEM SRTM, dengan grid 20 unit (kira-kira 3.3 km). Pulau yang lebih kecil daripada grid ini dibesarkan supaya kelihatan dan boleh diterokai, mengikut konvensyen yang sama seperti Pulau Sipadan sebelum ini.
- **Saiz objek** (bangunan, bas, terminal) dibesarkan supaya jelas kelihatan, jadi tidak mengikut skala.

## 2. Sumber data dan ketepatan

| Data | Sumber | Ketepatan |
|---|---|---|
| Jalan utama | [Natural Earth 10m Roads](https://www.naturalearthdata.com/) (domain awam), dipotong ke daratan Malaysia | Jajaran umum (skala 1:10 juta) |
| Jalan tambahan | Jajaran manual dalam `tools/jaringan/extra.py` | Titik laluan anggaran |
| Lebuh raya PLUS, LPT, Pan Borneo | Data `RAILS` sedia ada dalam `dunia.js` | Terminal pada lokasi sebenar |
| Lapangan terbang | [OurAirports](https://ourairports.com/countries/MY/) (domain awam) | Tepat |
| Terminal bas | Senarai manual dalam `extra.py` | Anggaran, perlu disahkan |
| Pulau | Senarai manual dalam `pulau.py`, disemak dengan Natural Earth | Kedudukan dan keluasan anggaran |
| Rel (ETS, ECRL, Komuter, LRT, MRT, Monorel, ERL, KTM Sabah) | Data `RAILS` sedia ada dalam `dunia.js` | Kedudukan stesen anggaran |

**Had semasa:** tetapan rangkaian sesi pembangunan menyekat beberapa sumber data:
- OpenStreetMap (`overpass-api.de`, `openstreetmap.org`)
- GTFS rasmi Prasarana dan KTMB (`api.data.gov.my`)
- Wikipedia

Apabila domain itu dibenarkan, data boleh dinaik taraf kepada:
- semua jalan persekutuan dan negeri (OSM `highway=motorway/trunk/primary/secondary`);
- koordinat tepat setiap stesen MRT, LRT dan KTM daripada GTFS `stops.txt`;
- terminal bas daripada OSM `amenity=bus_station`;
- garis pantai sebenar bagi pulau kecil.

Data boleh dijana semula dengan `python3 tools/jaringan/bina.py`. Cara penggunaan diterangkan dalam docstring fail itu.

## 3. Jaringan jalan dalam prototaip

- **546 segmen jalan dan 450 persimpangan (nod).** Jumlahnya kira-kira 9136 km jalan baharu, ditambah kira-kira 2128 km lebuh raya sedia ada (PLUS, LPT, Pan Borneo Sarawak dan Sabah) yang menjadi sebahagian graf yang sama.
- **Kesinambungan:**
  - Setiap hujung jalan yang tergantung disambung ke jalan terdekat (dalam 6 km).
  - Kumpulan jalan kecil disambung ke rangkaian utama (dalam 40 km).
  - Satu jalan terpencil di pedalaman Sarawak (sekitar Ba'kelalan), yang tiada sambungan jalan sebenar, tidak dimasukkan.
  - Hasilnya dua rangkaian yang bersambung sepenuhnya: **Semenanjung** dan **Borneo (Sarawak dan Sabah)**.
- **Jambatan:** jalan yang merentasi air (contohnya Jambatan Pulau Pinang dan Tambak Johor) dinaikkan di atas tiang.
- **Pengangkutan awam di jalan:** **bas dan teksi sahaja**. Tiada kenderaan persendirian.
  - **Trafik:** bas pelbagai syarikat dan teksi (merah-putih bajet dan biru eksekutif) bergerak di jalan berhampiran pemain dan membelok secara rawak di persimpangan.
  - **Terminal bas:** tekan E, kemudian pilih terminal destinasi dalam rangkaian yang sama. Tiket diperoleh dengan menjawab 1 soalan, dan bas mengikut laluan jalan terpendek (algoritma Dijkstra).
  - **Teksi:** di mana-mana tepi jalan, tekan E "Panggil teksi" dan pilih terminal bas atau lapangan terbang. Tambang ialah 3 MD + 1 MD setiap 15 km.

### Jalan tambahan (tiada dalam Natural Earth 10m)

- Laluan Persekutuan 8 (Bentong - Raub - Kuala Lipis - Gua Musang - Kuala Krai - Kota Bharu) (kira-kira 301 km)
- Lebuhraya Timur-Barat, Laluan Persekutuan 4 (Gerik - Banding - Jeli) (kira-kira 128 km)
- Jalan Tapah - Cameron Highlands (kira-kira 41 km)
- Jalan Genting Highlands (kira-kira 18 km)
- ELITE / MEX (KL - Putrajaya - KLIA) (kira-kira 37 km)
- FT12 Kuantan - Muadzam Shah - Segamat (kira-kira 155 km)
- E3 Laluan Kedua Malaysia-Singapura (kira-kira 27 km)
- FT3 Kuala Terengganu - Kota Bharu (kira-kira 136 km)
- FT13 Sandakan - Lahad Datu - Kunak - Tawau (kira-kira 221 km)
- FT13 Tawau - Semporna (kira-kira 84 km)
- Jalan Kota Kinabalu - Kota Belud - Kudat (kira-kira 132 km)
- Jalan Papar - Kimanis - Keningau - Tenom (kira-kira 87 km)
- Jalan Keningau - Sapulut - Kalabakan - Tawau (kira-kira 249 km)
- Jalan Miri - Limbang - Lawas (melalui Brunei) (kira-kira 180 km)
- Jalan Pesisir Mukah - Dalat - Sibu (kira-kira 76 km)
- Jalan Bintulu - Samalaju (kira-kira 63 km)
- Jalan Kuching - Bau (kira-kira 23 km)
- Jalan Kuching - Lundu - Sematan (kira-kira 72 km)

## 4. Lebuh raya utama Malaysia (rujukan)

| Lebuh raya | Laluan | Dalam Meta Didik |
|---|---|---|
| Lebuhraya Utara-Selatan, Laluan Utara (E1, PLUS) | Bukit Kayu Hitam - Kuala Lumpur | Ya: lebuh raya dengan terminal bas ekspres |
| Lebuhraya Utara-Selatan, Laluan Selatan (E2, PLUS) | Kuala Lumpur - Johor Bahru | Ya |
| Lebuhraya Hubungan Kedua Malaysia-Singapura (E3) | Senai - Tanjung Kupang - Tuas | Ya (jalan tambahan) |
| Lebuhraya Utara-Selatan Hubungan Tengah (ELITE, E6) | Shah Alam - Nilai, menghubungkan KLIA | Ya (ELITE/MEX ke KLIA) |
| Lebuhraya KL-Karak dan Lebuhraya Pantai Timur (E8, LPT1 dan LPT2) | Gombak - Karak - Kuantan - Kuala Terengganu | Ya: lebuh raya dengan terminal bas ekspres |
| Lebuhraya Pan Borneo (Sarawak) | Sematan/Kuching - Miri | Ya: Kuching - Miri |
| Lebuhraya Pan Borneo (Sabah) | Sindumin/Sipitang - Kota Kinabalu - Sandakan - Tawau | Ya: Lawas - Kota Kinabalu - Sandakan; Sandakan - Tawau (FT13) sebagai jalan tambahan |
| Laluan Persekutuan 8 | Bentong - Kuala Lipis - Gua Musang - Kota Bharu | Ya (jalan tambahan) |
| Lebuhraya Timur-Barat (Laluan Persekutuan 4) | Gerik - Jeli | Ya (jalan tambahan) |

Lebuh raya bandar Lembah Klang (NKVE, NPE, LDP, KESAS, SPRINT, DUKE, SMART, SUKE, DASH dan lain-lain) belum dimasukkan satu persatu. Ia memerlukan data OSM yang tepat kerana berada di dalam kanta zum KL.

## 5. Pengangkutan awam

### Rel (sudah ada dalam Meta Didik)

| Laluan | Stesen berhenti dalam Meta Didik |
|---|---|
| ETS KTM | KL Sentral, Rawang, Tanjung Malim, Kampar, Ipoh, Kuala Kangsar, Taiping, Bukit Mertajam, Sungai Petani, Alor Setar, Arau, Padang Besar |
| ECRL | Gombak (KL), Bentong, Mentakab, Kuantan, Kemaman, Dungun, Kuala Terengganu, Jerteh, Kota Bharu |
| KTM Komuter (Laluan Seremban) | KL Sentral, Mid Valley, Bandar Tasik Selatan, Serdang, Kajang, UKM, Bangi, Nilai, Seremban |
| KTM Komuter (Laluan Pelabuhan Klang) | KL Sentral, Subang Jaya, Shah Alam, Klang, Pelabuhan Klang |
| KLIA Ekspres / KLIA Transit | KL Sentral, Bandar Tasik Selatan, Putrajaya & Cyberjaya, Salak Tinggi, KLIA T1 |
| Keretapi Negeri Sabah | Tanjung Aru, Papar, Beaufort, Tenom |
| LRT Laluan Kelana Jaya | Gombak, Taman Melati, Wangsa Maju, Setiawangsa, Ampang Park, KLCC, Masjid Jamek, Pasar Seni, KL Sentral, Bangsar, Universiti, Taman Paramount, Kelana Jaya, Glenmarie, Subang Jaya, USJ 7, Putra Heights |
| LRT Laluan Ampang | Sentul Timur, Titiwangsa, Masjid Jamek, Hang Tuah, Chan Sow Lin, Maluri, Cempaka, Ampang |
| LRT Laluan Sri Petaling | Chan Sow Lin, Bandar Tun Razak, Bandar Tasik Selatan, Bukit Jalil, Sri Petaling, Kinrara BK5, Puchong Prima, Putra Heights |
| MRT Laluan Kajang | Kwasa Damansara, Bandar Utama, TTDI, Semantan, Muzium Negara, Pasar Seni, Bukit Bintang, TRX, Maluri, Taman Connaught, Bandar Tun Hussein Onn, Sungai Jernih, Kajang |
| MRT Laluan Putrajaya | Kwasa Damansara, Damansara Damai, Kepong Baru, Jinjang, Kentonmen, Sentul Barat, Titiwangsa, Ampang Park, TRX, Chan Sow Lin, Kuchai, Serdang Raya Utara, UPM, Cyberjaya Utara, Putrajaya Sentral |
| Monorel KL | KL Sentral, Hang Tuah, Bukit Bintang, Chow Kit, Titiwangsa |

### Bas ekspres di lebuh raya (sudah ada)

- **Lebuhraya Utara-Selatan (PLUS):** Bukit Kayu Hitam, Alor Setar, Sungai Petani, Juru (Seberang Perai), Taiping, Ipoh (Amanjaya), Tapah, Tanjung Malim, Kuala Lumpur (TBS), Seremban, Ayer Keroh, Yong Peng, Johor Bahru (Larkin)
- **Lebuhraya Pantai Timur (LPT):** Gombak (TBG), Bentong, Temerloh, Kuantan, Chukai (Kemaman), Kuala Terengganu
- **Lebuhraya Pan Borneo (Sarawak):** Kuching Sentral, Serian, Sri Aman, Sarikei, Sibu, Bintulu, Miri
- **Lebuhraya Pan Borneo (Sabah):** Lawas, Beaufort, Kota Kinabalu, Ranau, Sandakan

### Bas dan teksi (baharu dalam v18.31)

- **Bas ekspres antara bandar:** 47 terminal bas utama di setiap negeri, semuanya bersambung melalui graf jalan.
- **Bas bandar dan bas henti-henti** (Rapid KL, Rapid Penang, Rapid Kuantan dan BAS.MY di bandar-bandar negeri) belum dimodelkan sebagai laluan khas. Dalam prototaip, ia diwakili oleh trafik bas di jalan.
- **Teksi:** teksi bajet (merah-putih) dan teksi eksekutif (biru) boleh dipanggil di mana-mana tepi jalan.

### Terminal bas utama

| Terminal | Negeri | Lat | Lon |
|---|---|---|---|
| Terminal Bersepadu Selatan (TBS) | Selangor | 3.0767 | 101.7111 |
| Pudu Sentral | Selangor | 3.1440 | 101.6990 |
| Terminal Bersepadu Gombak (TBG) | Selangor | 3.2363 | 101.7173 |
| Hentian Duta | Selangor | 3.1735 | 101.6830 |
| Terminal Bas Klang Sentral | Selangor | 3.0710 | 101.4640 |
| Terminal One Seremban | Negeri Sembilan | 2.7228 | 101.9390 |
| Melaka Sentral | Melaka | 2.2156 | 102.2459 |
| Larkin Sentral (Johor Bahru) | Johor | 1.4950 | 103.7430 |
| Terminal Bas Muar | Johor | 2.0480 | 102.5670 |
| Terminal Bas Batu Pahat | Johor | 1.8530 | 102.9320 |
| Terminal Bas Kluang | Johor | 2.0340 | 103.3190 |
| Terminal Bas Segamat | Johor | 2.5050 | 102.8150 |
| Terminal Bas Mersing | Johor | 2.4310 | 103.8360 |
| Terminal Amanjaya (Ipoh) | Perak | 4.6560 | 101.0700 |
| Terminal Kamunting Raya (Taiping) | Perak | 4.8960 | 100.7210 |
| Terminal Bas Teluk Intan | Perak | 4.0260 | 101.0190 |
| Terminal Bas Lumut | Perak | 4.2320 | 100.6320 |
| Terminal Bas Tanah Rata | Pahang | 4.4700 | 101.3790 |
| Penang Sentral (Butterworth) | Pulau Pinang | 5.3940 | 100.3670 |
| Terminal Bas Sungai Nibong | Pulau Pinang | 5.3490 | 100.3010 |
| Terminal Shahab Perdana (Alor Setar) | Kedah | 6.1420 | 100.3780 |
| Terminal Bas Kangar | Perlis | 6.4390 | 100.1940 |
| Terminal Bas Kota Bharu | Kelantan | 6.1240 | 102.2450 |
| Terminal Bas Kuala Krai | Kelantan | 5.5300 | 102.2010 |
| Terminal Bas Gua Musang | Kelantan | 4.8800 | 101.9680 |
| Terminal MBKT (Kuala Terengganu) | Terengganu | 5.3300 | 103.1380 |
| Terminal Sentral Kuantan | Pahang | 3.8290 | 103.2870 |
| Terminal Bas Temerloh | Pahang | 3.4480 | 102.4180 |
| Terminal Bas Jerantut | Pahang | 3.9360 | 102.3620 |
| Terminal Bas Kuala Lipis | Pahang | 4.1830 | 102.0460 |
| Kuching Sentral | Sarawak | 1.4970 | 110.3380 |
| Terminal Bas Sri Aman | Sarawak | 1.2380 | 111.4610 |
| Terminal Bas Ekspres Sibu | Sarawak | 2.3160 | 111.8440 |
| Terminal Bas Mukah | Sarawak | 2.8970 | 112.0930 |
| Terminal Bas Bintulu (Medan Jaya) | Sarawak | 3.1950 | 113.0710 |
| Terminal Bas Miri (Pujut) | Sarawak | 4.4110 | 114.0110 |
| Terminal Bas Limbang | Sarawak | 4.7530 | 115.0070 |
| Terminal Bas Lawas | Sarawak | 4.8560 | 115.4050 |
| Terminal Bas Inanam (Kota Kinabalu) | Sabah | 5.9850 | 116.1250 |
| Terminal Bas Beaufort | Sabah | 5.3470 | 115.7460 |
| Terminal Bas Keningau | Sabah | 5.3370 | 116.1610 |
| Terminal Bas Kudat | Sabah | 6.8830 | 116.8380 |
| Terminal Bas Ranau | Sabah | 5.9580 | 116.6800 |
| Terminal Bas Sandakan (Batu 2.5) | Sabah | 5.8650 | 118.0590 |
| Terminal Bas Lahad Datu | Sabah | 5.0310 | 118.3270 |
| Terminal Bas Tawau (Sabindo) | Sabah | 4.2470 | 117.8850 |
| Terminal Bas Semporna | Sabah | 4.4800 | 118.6110 |

Koordinat terminal adalah anggaran. Ia perlu disahkan dengan OSM atau peta rasmi sebelum digunakan untuk tujuan selain prototaip.

## 6. Lapangan terbang (penerbangan berjadual)

Sumber: OurAirports. Lapangan terbang bertanda ✔ ada dalam Meta Didik, lengkap dengan landasan dan boleh diterbangi.

| IATA | ICAO | Nama | Bandar | Lat | Lon | Meta Didik |
|---|---|---|---|---|---|---|
| AOR | WMKA | Sultan Abdul Halim Airport | Alor Satar | 6.1897 | 100.3980 | ✔ |
| BBN | WBGZ | Bario Airport | Bario | 3.7346 | 115.4785 | ✔ |
| BKI | WBKK | Kota Kinabalu International Airport | Kota Kinabalu | 5.9327 | 116.0493 | ✔ |
| BKM | WBGQ | Bakalalan Airport | Bakalalan | 3.9740 | 115.6180 | STOL/kecil |
| BTU | WBGB | Bintulu Airport | Bintulu | 3.1239 | 113.0200 | ✔ |
| IPH | WMKI | Sultan Azlan Shah Airport | Ipoh | 4.5673 | 101.0916 | ✔ |
| JHB | WMKJ | Senai International Airport | Johor Bahru | 1.6413 | 103.6700 | ✔ |
| KBR | WMKC | Sultan Ismail Petra Airport | Kota Baharu | 6.1669 | 102.2930 | ✔ |
| KCH | WBGG | Kuching International Airport | Kuching | 1.4874 | 110.3529 | ✔ |
| KUA | WMKD | Kuantan Airport | Kuantan | 3.7754 | 103.2090 | ✔ |
| KUD | WBKT | Kudat Airport | Kudat | 6.9241 | 116.8371 | ✔ |
| KUL | WMKK | Kuala Lumpur International Airport | Sepang | 2.7456 | 101.7100 | ✔ |
| LBP | MY-LBP | Long Banga Airport | Long Banga | 3.2021 | 115.4018 | STOL/kecil |
| LBU | WBKL | Labuan Airport | Labuan | 5.3017 | 115.2483 | ✔ |
| LDU | WBKD | Lahad Datu Airport | Lahad Datu | 5.0324 | 118.3238 | ✔ |
| LGK | WMKL | Langkawi International Airport | Langkawi | 6.3297 | 99.7287 | ✔ |
| LGL | WBGF | Long Lellang Airport | Long Datih | 3.4210 | 115.1540 | STOL/kecil |
| LMN | WBGJ | Limbang Airport | Limbang | 4.8083 | 115.0100 | ✔ |
| LWY | WBGW | Lawas Airport | Lawas | 4.8492 | 115.4080 | ✔ |
| MKM | WBGK | Mukah Airport | Mukah | 2.8819 | 112.0433 | ✔ |
| MKZ | WMKM | Malacca International Airport | Malacca | 2.2656 | 102.2528 | ✔ |
| MUR | WBGM | Marudi Airport | Marudi | 4.1787 | 114.3303 | ✔ |
| MYY | WBGR | Miri Airport | Miri | 4.3220 | 113.9870 | ✔ |
| MZV | WBMU | Mulu Airport | Mulu | 4.0483 | 114.8050 | ✔ |
| ODN | WBGI | Long Seridan Airport | Long Seridan | 3.9761 | 115.0673 | STOL/kecil |
| PEN | WMKP | Penang International Airport | Penang | 5.2963 | 100.2762 | ✔ |
| PKG | WMPA | Pulau Pangkor Airport | Pangkor Island | 4.2447 | 100.5530 | STOL/kecil |
| SBW | WBGS | Sibu Airport | Sibu | 2.2616 | 111.9850 | ✔ |
| SDK | WBKS | Sandakan Airport | Sandakan | 5.9009 | 118.0590 | ✔ |
| SZB | WMSA | Sultan Abdul Aziz Shah International Airport | Subang | 3.1306 | 101.5490 | ✔ |
| TGG | WMKN | Sultan Mahmud Airport | Kuala Terengganu | 5.3826 | 103.1030 | ✔ |
| TMG | WBKM | Tomanggong Airport | Tomanggong | 5.4026 | 118.6576 | STOL/kecil |
| TOD | WMBT | Tioman Airport | Tioman Island | 2.8182 | 104.1600 | ✔ |
| TWU | WBKW | Tawau Airport | Tawau | 4.3134 | 118.1215 | ✔ |

Lapangan terbang STOL di pedalaman Sarawak (Long Banga, Long Lellang, Long Seridan, Ba'kelalan) serta Tomanggong dan Pulau Pangkor belum dibina. Landasannya terlalu pendek untuk model lapangan terbang semasa.

## 7. Pulau

Semua pulau dalam senarai ini dilabelkan dalam dunia 3D (🏝, tekan E untuk maklumat) dan pada peta besar.
- **Daratan sedia ada:** pulau yang sudah wujud dalam peta.
- **Baharu (dibesarkan):** pulau yang ditambah sebagai daratan baharu dan dibesarkan supaya kelihatan.
- **Label sahaja:** pulau yang terlalu dekat dengan daratan lain untuk dipaparkan berasingan.

| Pulau | Negeri | Lat | Lon | Keluasan (km², anggaran) | Status | Nota |
|---|---|---|---|---|---|---|
| Pulau Langkawi | Kedah | 6.350 | 99.800 | 478 | Daratan sedia ada | Pulau terbesar gugusan Langkawi (99 pulau); Geopark Global UNESCO |
| Pulau Dayang Bunting | Kedah | 6.215 | 99.795 | 25 | Daratan sedia ada | Tasik Dayang Bunting, Geoforest Langkawi |
| Pulau Tuba | Kedah | 6.225 | 99.845 | 10 | Daratan sedia ada | Pulau berpenghuni di selatan Langkawi |
| Pulau Singa Besar | Kedah | 6.225 | 99.725 | 5 | Daratan sedia ada | Santuari hidupan liar Langkawi |
| Pulau Rebak Besar | Kedah | 6.290 | 99.690 | 1.5 | Daratan sedia ada |  |
| Pulau Beras Basah | Kedah | 6.205 | 99.745 | 0.5 | Daratan sedia ada |  |
| Pulau Payar | Kedah | 6.060 | 100.040 | 0.3 | Baharu (dibesarkan) | Taman Laut Pulau Payar |
| Pulau Pinang | Pulau Pinang | 5.400 | 100.250 | 295 | Daratan sedia ada | Tapak Warisan Dunia UNESCO George Town |
| Pulau Jerejak | Pulau Pinang | 5.315 | 100.320 | 3.6 | Daratan sedia ada | Bekas pusat kuarantin dan penjara |
| Pulau Aman | Pulau Pinang | 5.270 | 100.390 | 1.2 | Label sahaja |  |
| Pulau Pangkor | Perak | 4.220 | 100.560 | 18 | Daratan sedia ada | Perjanjian Pangkor 1874 |
| Pulau Pangkor Laut | Perak | 4.198 | 100.545 | 1.2 | Daratan sedia ada |  |
| Pulau Sembilan | Perak | 4.030 | 100.550 | 2 | Baharu (dibesarkan) | Gugusan sembilan pulau di Selat Melaka |
| Pulau Ketam | Selangor | 3.020 | 101.250 | 11 | Daratan sedia ada | Perkampungan nelayan atas air |
| Pulau Indah | Selangor | 2.930 | 101.320 | 40 | Daratan sedia ada | Pelabuhan Barat Pelabuhan Klang |
| Pulau Carey | Selangor | 2.860 | 101.370 | 100 | Daratan sedia ada | Kediaman Orang Asli Mah Meri |
| Pulau Angsa | Selangor | 3.220 | 101.150 | 0.4 | Baharu (dibesarkan) | Rumah api Pulau Angsa |
| Pulau Besar (Melaka) | Melaka | 2.115 | 102.335 | 1.6 | Daratan sedia ada |  |
| Pulau Upeh | Melaka | 2.185 | 102.240 | 0.1 | Daratan sedia ada |  |
| Pulau Pisang | Johor | 1.470 | 103.255 | 1 | Daratan sedia ada | Rumah api |
| Pulau Kukup | Johor | 1.325 | 103.425 | 6.5 | Daratan sedia ada | Tapak Ramsar, pulau paya bakau |
| Pulau Besar (Johor) | Johor | 2.430 | 103.980 | 5 | Daratan sedia ada |  |
| Pulau Rawa | Johor | 2.520 | 103.975 | 0.3 | Baharu (dibesarkan) |  |
| Pulau Tinggi | Johor | 2.295 | 104.115 | 16 | Daratan sedia ada | Taman Laut Sultan Iskandar |
| Pulau Sibu | Johor | 2.215 | 104.075 | 5 | Daratan sedia ada |  |
| Pulau Aur | Johor | 2.450 | 104.515 | 4 | Daratan sedia ada |  |
| Pulau Pemanggil | Johor | 2.580 | 104.320 | 5 | Daratan sedia ada |  |
| Pulau Tioman | Pahang | 2.790 | 104.160 | 136 | Daratan sedia ada | Taman Laut, lapangan terbang Tioman |
| Pulau Tulai | Pahang | 2.915 | 104.105 | 0.3 | Daratan sedia ada |  |
| Pulau Redang | Terengganu | 5.780 | 103.010 | 25 | Daratan sedia ada | Taman Laut Pulau Redang |
| Pulau Perhentian Besar | Terengganu | 5.900 | 102.755 | 9 | Daratan sedia ada |  |
| Pulau Perhentian Kecil | Terengganu | 5.920 | 102.720 | 6 | Daratan sedia ada |  |
| Pulau Lang Tengah | Terengganu | 5.795 | 102.895 | 1.2 | Daratan sedia ada |  |
| Pulau Bidong | Terengganu | 5.620 | 103.060 | 1 | Daratan sedia ada | Bekas kem pelarian Vietnam (1978-1991) |
| Pulau Kapas | Terengganu | 5.220 | 103.265 | 2 | Daratan sedia ada |  |
| Pulau Tenggol | Terengganu | 4.805 | 103.675 | 2 | Daratan sedia ada |  |
| Pulau Duyong | Terengganu | 5.330 | 103.130 | 1.5 | Daratan sedia ada | Tukang perahu tradisional, Sungai Terengganu |
| Pulau Satang Besar | Sarawak | 1.780 | 110.155 | 0.5 | Baharu (dibesarkan) | Penyu, Taman Negara Talang-Satang |
| Pulau Talang-Talang Besar | Sarawak | 1.910 | 109.775 | 0.4 | Baharu (dibesarkan) |  |
| Pulau Lakei | Sarawak | 1.750 | 110.505 | 1.5 | Daratan sedia ada |  |
| Pulau Bruit | Sarawak | 2.600 | 111.300 | 430 | Daratan sedia ada | Pulau delta terbesar Sarawak |
| Pulau Labuan | W.P. | 5.300 | 115.225 | 75 | Daratan sedia ada | Wilayah Persekutuan Labuan |
| Pulau Papan | W.P. | 5.255 | 115.260 | 0.3 | Label sahaja |  |
| Pulau Kuraman | W.P. | 5.220 | 115.130 | 1 | Daratan sedia ada |  |
| Pulau Banggi | Sabah | 7.150 | 117.080 | 441 | Daratan sedia ada | Pulau terbesar Malaysia (selepas Borneo) |
| Pulau Balambangan | Sabah | 7.250 | 116.915 | 100 | Daratan sedia ada |  |
| Pulau Malawali | Sabah | 7.040 | 117.300 | 30 | Daratan sedia ada |  |
| Pulau Jambongan | Sabah | 6.680 | 117.450 | 100 | Daratan sedia ada |  |
| Pulau Mantanani Besar | Sabah | 6.710 | 116.350 | 2 | Daratan sedia ada |  |
| Pulau Gaya | Sabah | 6.020 | 116.035 | 15 | Daratan sedia ada | Taman Tunku Abdul Rahman |
| Pulau Manukan | Sabah | 5.970 | 115.995 | 0.2 | Label sahaja | Taman Tunku Abdul Rahman |
| Pulau Sapi | Sabah | 6.008 | 116.005 | 0.1 | Daratan sedia ada | Taman Tunku Abdul Rahman |
| Pulau Mamutik | Sabah | 5.965 | 116.010 | 0.06 | Label sahaja | Taman Tunku Abdul Rahman |
| Pulau Sulug | Sabah | 5.960 | 115.990 | 0.08 | Label sahaja | Taman Tunku Abdul Rahman |
| Pulau Tiga | Sabah | 5.720 | 115.650 | 6 | Daratan sedia ada | Gunung berapi lumpur |
| Pulau Libaran | Sabah | 6.110 | 118.020 | 2 | Daratan sedia ada |  |
| Pulau Selingan | Sabah | 6.175 | 118.060 | 0.08 | Baharu (dibesarkan) | Taman Pulau Penyu |
| Pulau Lankayan | Sabah | 6.500 | 117.920 | 0.05 | Baharu (dibesarkan) |  |
| Pulau Berhala | Sabah | 5.870 | 118.125 | 1 | Daratan sedia ada |  |
| Pulau Mabul | Sabah | 4.245 | 118.630 | 0.2 | Baharu (dibesarkan) |  |
| Pulau Kapalai | Sabah | 4.225 | 118.670 | 0.05 | Baharu (dibesarkan) |  |
| Pulau Sipadan | Sabah | 4.115 | 118.628 | 0.12 | Daratan sedia ada | Taman Laut; diputuskan milik Malaysia oleh ICJ 2002 |
| Pulau Mataking | Sabah | 4.580 | 118.945 | 0.2 | Baharu (dibesarkan) |  |
| Pulau Pom Pom | Sabah | 4.590 | 118.860 | 0.3 | Baharu (dibesarkan) |  |
| Pulau Bohey Dulang | Sabah | 4.590 | 118.785 | 3 | Baharu (dibesarkan) | Gunung berapi purba, Taman Tun Sakaran |
| Pulau Timbun Mata | Sabah | 4.650 | 118.680 | 60 | Baharu (dibesarkan) |  |
| Pulau Bum Bum | Sabah | 4.470 | 118.660 | 50 | Daratan sedia ada |  |
| Pulau Sebatik (Malaysia) | Sabah | 4.185 | 117.830 | 187 | Daratan sedia ada | Dikongsi dengan Indonesia |
| Pulau Layang-Layang | Sabah | 7.372 | 113.844 | 0.06 | Baharu (dibesarkan) | Terumbu di Kepulauan Spratly; lapangan terbang |

## 8. Langkah seterusnya (cadangan)

1. **Benarkan domain data** dalam tetapan rangkaian persekitaran: `overpass-api.de`, `api.data.gov.my` dan `en.wikipedia.org`. Selepas itu, jana semula dengan OSM supaya jalan persekutuan, jalan negeri dan stesen rel mencapai ketepatan kira-kira 50 m.
2. **Laluan bas bandar** Rapid KL, Rapid Penang dan BAS.MY daripada GTFS, dengan hentian bas sebenar.
3. **Laluan rel baharu:**
   - LRT Laluan Shah Alam (LRT3)
   - KTM Komuter Utara
   - KTM Laluan Pantai Timur (Gemas - Tumpat)
   - ETS Gemas - Johor Bahru
   - RTS Link Johor Bahru - Woodlands
   - jajaran ECRL penuh mengikut fasa pembinaan
4. **Feri** ke pulau-pulau baharu (contohnya Kuala Besut ke Perhentian, Mersing ke Rawa, Semporna ke Mabul).

