# Fasa 1: Persediaan Log Masuk DELIMa dan Stesen Inovasi

Kod untuk Fasa 1 sudah ada dalam versi 18.14, tetapi **ia tidak aktif** sehingga langkah di bawah dibuat dalam Firebase Console.
Selagi belum aktif, Meta Didik berfungsi seperti biasa. Papan pemuka guru akan memaparkan
"Pengesahan guru (DELIMa) belum diaktifkan".

## Langkah 1: Hidupkan Firebase Authentication
1. Buka https://console.firebase.google.com dan pilih projek **gempur-tasawwur**.
2. Pergi ke **Build → Authentication → Get started**.
3. Dalam tab **Sign-in method**, hidupkan:
   - **Anonymous**, untuk semua murid (setiap peranti mendapat ID selamat; tiada maklumat peribadi diminta).
   - **Google**. Isikan *Project support email* dan tekan **Save**.
4. Dalam tab **Settings → Authorized domains**, tambah domain laman Meta Didik, contohnya `bromuhaimin.github.io`, serta domain sendiri jika ada.

## Langkah 2: Dapatkan Web API Key
1. Klik ⚙ **Project settings → General**.
2. Salin **Web API Key** (bermula dengan `AIza...`).
   - Jika tiada, klik **Add app → Web (</>)**, beri nama "Meta Didik", kemudian salin `apiKey`.
   - Kunci ini **bukan rahsia**. Ia memang dimasukkan dalam kod laman web.

## Langkah 3: Dapatkan Google OAuth Client ID
1. Buka https://console.cloud.google.com/apis/credentials (projek yang sama).
2. Di bawah **OAuth 2.0 Client IDs**, buka **Web client (auto created by Google Service)**.
3. Dalam **Authorized JavaScript origins**, tambah `https://bromuhaimin.github.io` (dan domain sendiri, jika ada). Tekan **Save**.
4. Salin **Client ID** (berakhir dengan `.apps.googleusercontent.com`).

## Langkah 4: Hantar dua nilai kepada pembangun
Hantar **Web API Key** dan **Client ID**. Kedua-duanya akan dimasukkan ke dalam `app.js`:

```js
window.TW_AUTH = window.TW_AUTH || { apiKey: "AIza...", gcid: "....apps.googleusercontent.com", hd: "moe-dl.edu.my" };
```

## Langkah 5: Tambah peraturan pangkalan data untuk Stesen Inovasi
1. Pergi ke **Build → Realtime Database → Rules**.
2. Salin empat nod dalam `docs/firebase-rules-stesen.json` (`stesen`, `stesen_lawat`, `stesen_suka`, `stesen_klik`).
   - Tampal di dalam `"rules": { ... }` bersama nod sedia ada.
   - **Jangan padam nod lain.**
3. Tekan **Publish**. Gunakan **Rules Playground** untuk menyemak sebelum menerbitkan.

Apa yang dikawal oleh peraturan ini:
- Hanya akaun DELIMa (`@moe-dl.edu.my`) yang telah disahkan boleh menghantar stesen, dan hanya stesen miliknya sendiri.
- Guru tidak boleh meluluskan stesen sendiri. Setiap hantaran menjadi `tunggu`, dan hanya pentadbir (kunci moderator) boleh menukar kepada `lulus` serta menetapkan tapak.
- Pautan mesti `https://`. Tajuk paling panjang 60 aksara dan huraian paling panjang 600 aksara.
- Kiraan pelawat, suka dan klik hanya dibenarkan untuk stesen yang telah diluluskan.

## Langkah 6: Rintis 20 guru
1. Jemput 20 guru. Setiap guru perlu:
   - menetapkan peranan **Guru** dalam profil,
   - membuka **Papan pemuka guru → Stesen Inovasi saya**,
   - log masuk DELIMa dan menghantar permohonan.
2. Pentadbir (peranti yang mempunyai kunci moderator) membuka **Pentadbir: semakan Stesen Inovasi**, kemudian memilih tapak dan menekan **Lulus**.
3. Stesen muncul di **Dataran Inovasi** negeri itu dalam META DIDIK (3 tapak setiap negeri, 42 kesemuanya).

## Fasa seterusnya (selepas kebanyakan murid memakai v18.14)
Setiap peranti akan mempunyai ID tanpa nama, jadi peraturan nod lama (`pemain`, `ringkas`, `komen` dan lain-lain)
boleh diketatkan supaya setiap murid hanya boleh menulis datanya sendiri. Ini dibuat secara berperingkat
supaya peranti versi lama tidak terputus.

## Kembara Kampus (v18.17): sewaan galeri IPT
Peraturan dalam `docs/firebase-rules-stesen.json` kini juga mengandungi tiga nod berikut. Tambahkan ketiga-tiganya dalam Rules seperti di atas.

| Nod | Kegunaan |
|---|---|
| `ipt` | Profil IPT. Hanya pentadbir (kunci moderator) boleh menulis. |
| `ipt_lawat` | Kiraan pelawat kampus. |
| `ipt_minat` | Kiraan murid yang menekan "Saya berminat". Hanya dibenarkan bagi IPT yang ada pakej aktif. |

Untuk mengaktifkan galeri sesebuah IPT:
1. Buka **Papan pemuka guru → Pentadbir: Kembara Kampus**.
2. Pilih IPT dan tetapkan **Pakej** (Asas atau Premium).
3. Isi huraian, program pengajian, video YouTube, laman rasmi dan tarikh tamat sewaan.
4. Tekan **Simpan profil**.

Pelawat dan minat dikira mengikut peranti unik dan tidak menyimpan nama murid. Ini memudahkan laporan kepada IPT tanpa melanggar privasi.

## Mata wang MD (v18.21): ganjaran inovasi guru
MD (Meta Didik) ialah mata wang pembelajaran. Murid **memperolehnya dengan belajar** (kuiz, misi, menara,
Stesen Ilmu) dan **tidak boleh membelinya** dengan wang. MD juga tidak boleh ditukar kepada wang oleh murid.

Aliran:
1. Guru menetapkan harga guna inovasi (5, 10, 20, 30 atau 50 MD, atau percuma) dalam borang Stesen Inovasi.
2. Murid menekan **Guna inovasi** di Dataran Inovasi. MD ditolak sekali sehari bagi setiap inovasi.
   Rekod disimpan di `stesen_guna/<stesen>/<murid>/<tarikh>`.
3. Selepas bulan tamat, pentadbir membuka **Papan pemuka guru → Pentadbir: tabung dan tuntutan MD**,
   memilih bulan, mengisi jumlah tabung RM (hasil sewaan tapak, penaja, langganan sekolah) dan menekan
   **Tetapkan tabung**. Tabung diagihkan ikut bahagian MD setiap guru:
   `bayaran guru = tabung RM × MD guru ÷ jumlah MD semua guru`.
4. Guru melihat bayaran dalam **Pendapatan MD inovasi saya** dan menghantar tuntutan (nama, bank, no. akaun).
5. Pentadbir meluluskan, membayar secara manual (DuitNow / pindahan bank) dan menekan **Tanda dibayar**
   dengan nombor rujukan.

Nod baharu dalam `docs/firebase-rules-stesen.json` (tambah dalam Rules):

| Nod | Kegunaan |
|---|---|
| `stesen_guna` | Rekod murid menggunakan inovasi berbayar. Sekali sehari bagi setiap murid; harga mesti sama dengan harga stesen; guru tidak boleh membayar inovasinya sendiri. |
| `tabung` | Jumlah tabung bulanan dan kadar RM bagi setiap MD (awam). Hanya pentadbir menulis. |
| `tabung_by` | MD setiap guru bagi sesuatu bulan. Hanya guru itu boleh membaca. |
| `tuntutan` | Tuntutan bayaran guru, termasuk butiran bank. Hanya guru itu (dan pentadbir) boleh membaca. |

Kawalan penyalahgunaan:
- Panel pentadbir menanda inovasi yang penggunaannya berulang luar biasa (⚠). Semak sebelum membayar.
- Semasa murid masih menggunakan ID tanpa nama, seseorang boleh mencipta banyak ID. Apabila log masuk
  DELIMa diwajibkan untuk murid, ketatkan `stesen_guna` dengan menambah syarat e-mel DELIMa pada `.write`
  (sama seperti `stesen`).
- Penjawat awam bertanggungjawab mendapatkan kebenaran ketua jabatan dan mengisytiharkan pendapatan untuk cukai.
  Dapatkan nasihat peguam / akauntan sebelum bayaran pertama.

## Mod percubaan MD (v18.22): sekarang, sebelum pelancaran metadidik.com
Selagi `TW_AUTH.apiKey` kosong (log masuk DELIMa belum diaktifkan), aplikasi berjalan dalam **mod percubaan**:
- Guru mendaftar Stesen Inovasi tanpa log masuk. Identiti guru ialah **ID peranti**; guru mengisi e-mel DELIMa
  sendiri (disimpan di `stesen_em`, hanya pentadbir boleh membaca) dan pentadbir menyemaknya sebelum meluluskan.
  Guru perlu menggunakan peranti yang sama untuk mengurus stesen dan menuntut pendapatan.
- Murid membayar MD dengan ID peranti.
- Tuntutan guru (butiran bank) hanya boleh dibaca oleh pentadbir; status tuntutan dipaparkan melalui `tuntutan_st`.

Gunakan **`docs/firebase-rules-percubaan.json`** dalam Firebase Rules semasa percubaan.

Had mod percubaan (diterima untuk rintis):
- Sesiapa yang tahu ID sesebuah stesen boleh menghantar semula borangnya (status kembali "menunggu"); pentadbir
  akan nampak dan boleh meluluskan semula.
- ID peranti mudah dicipta, jadi semak amaran ⚠ dalam panel tabung sebelum membayar.

### Semasa pelancaran di metadidik.com
1. Aktifkan log masuk DELIMa (Langkah 1-4) dan wajibkan untuk guru dan murid.
2. Tukar Rules kepada **`docs/firebase-rules-stesen.json`** (versi ketat).
3. Reset MD semua murid (alat reset akan disediakan pada pelancaran) dan daftar semula stesen guru dengan DELIMa.

## v18.28: DELIMa wajib untuk guru, Ruang Guru dan Kolam Ikan
- **Guru wajib log masuk DELIMa.** Butang **🎓 Ruang Guru** (di header, bagi pengguna berperanan guru) membuka
  Ruang Guru hanya selepas log masuk akaun @moe-dl.edu.my. Peta Operasi dan alat PdPc di paparan utama juga hanya
  kelihatan kepada guru yang disahkan. Pentadbir yang memasukkan kunci moderator dikecualikan.
  **Langkah 1-4 di atas (Web API Key dan Google OAuth Client ID) mesti disiapkan dahulu**; sebelum itu Ruang Guru
  memaparkan "sedang diaktifkan".
- **Stesen Inovasi di lokasi pilihan guru.** Guru memilih subjek, tajuk berkaitan (wajib) dan titik pada peta
  Malaysia. Stesen yang diluluskan dibina di titik itu dalam Meta Didik, **hanya dalam dunia subjek tersebut**
  (medan baharu `sj`, `tp`, `la`, `lo` dalam `stesen`).
- **Kolam Ikan** dibuka dari menu dalam Meta Didik. Guru (DELIMa) mengetik ikan murid dan memberi makanan ikan
  (+10 MD, sekali sehari bagi setiap murid). Rekod di `kolam_makan/<uid murid>/<id>`; murid menerima MD apabila
  membuka aplikasi atau Kolam Ikan.
- Kemas kini Rules dengan fail terkini (`firebase-rules-stesen.json` selepas DELIMa aktif).

## v18.29: Gelaran guru dan Bank Soalan

- **Gelaran**: dalam Ruang Guru, guru atau pentadbir memilih gelaran (Cikgu, Ustaz, Ustazah, Sir, Puan, Encik, Cik, Madam, Tuan, Dr., Prof. atau "Lain-lain..." untuk taip sendiri). Gelaran dipaparkan pada tanda nama 🎓 dalam Meta Didik dan pada makanan ikan yang diberi kepada murid.
- **Bank Soalan** (tab "📝 Bank soalan" dalam Ruang Guru): guru melihat semua soalan kuiz mengikut subjek dan tajuk, kemudian boleh:
  - ➕ menyumbang soalan baharu,
  - ✏ membaiki soalan sedia ada,
  - 🗑 mencadangkan soalan yang tidak relevan dibuang (sebab wajib diisi).
- Cadangan disimpan di `soalan_ubah/<subjek>/<id>` dengan status `tunggu`. Pentadbir menyemaknya di tab Pentadbir, kemudian memilih **Lulus** atau **Tolak**. Hanya cadangan yang diluluskan dikenakan kepada semua pengguna, sebagai lapisan di atas fail `soalan*.json`.
- Pentadbir boleh memuat turun cadangan yang diluluskan dalam bentuk JSON, untuk digabungkan secara kekal ke dalam fail soalan melalui `bank.html`.
- **Firebase Rules**: salin semula `docs/firebase-rules-stesen.json`, kerana nod `soalan_ubah` ditambah. Guru DELIMa sahaja boleh menulis, dan hanya cadangan sendiri yang masih menunggu.

## v18.30: Meta Didik minimal, Ruang Privasi dan mic

- **Paparan minimal untuk semua peranti**: dalam Meta Didik hanya nama tempat, waktu, peta mini dan butang "☰ Menu" dipaparkan. Statistik dan butang lain ada di dalam menu.
- **👤 Profil & Gudang** ada terus dalam ☰ Menu. Murid tidak perlu lagi pergi ke sekolah untuk membina profil (avatar, pakaian, lencana).
- **Murid hanya ada dua pilihan masuk**:
  - 🌏 **Dunia Terbuka**: chat sahaja, tanpa mic.
  - 🔐 **Ruang Privasi**: kod 5 aksara yang dicipta oleh guru DELIMa (butang "Cipta kod Ruang Privasi" pada skrin mula Meta Didik, hanya untuk guru). Kod didaftarkan di `ruang_privasi/<KOD>` dan sah selama 30 hari, untuk subjek yang dipilih. Murid tidak boleh mencipta kod sendiri. Pilihan "Cipta bilik rakan" dan "Bilik sekolah" dibuang.
- **Mic (tekan-untuk-cakap)** hanya dibuka dalam Ruang Privasi.
- **Firebase Rules**: salin semula `docs/firebase-rules-stesen.json`, kerana nod `ruang_privasi` ditambah. Hanya guru DELIMa boleh mencipta kod, dan kod tidak boleh ditulis ganti.
