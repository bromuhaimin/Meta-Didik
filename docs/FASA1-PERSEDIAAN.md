# Fasa 1: Persediaan Log Masuk DELIMa dan Stesen Inovasi

Kod untuk Fasa 1 sudah ada dalam versi 18.14, tetapi **ia tidak aktif** sehingga langkah di bawah dibuat dalam Firebase Console.
Selagi belum aktif, Gempur berfungsi seperti biasa. Papan pemuka guru akan memaparkan
"Pengesahan guru (DELIMa) belum diaktifkan".

## Langkah 1: Hidupkan Firebase Authentication
1. Buka https://console.firebase.google.com dan pilih projek **gempur-tasawwur**.
2. Pergi ke **Build → Authentication → Get started**.
3. Dalam tab **Sign-in method**, hidupkan:
   - **Anonymous**, untuk semua murid (setiap peranti mendapat ID selamat; tiada maklumat peribadi diminta).
   - **Google**. Isikan *Project support email* dan tekan **Save**.
4. Dalam tab **Settings → Authorized domains**, tambah domain laman Gempur, contohnya `bromuhaimin.github.io`, serta domain sendiri jika ada.

## Langkah 2: Dapatkan Web API Key
1. Klik ⚙ **Project settings → General**.
2. Salin **Web API Key** (bermula dengan `AIza...`).
   - Jika tiada, klik **Add app → Web (</>)**, beri nama "Gempur", kemudian salin `apiKey`.
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
3. Stesen muncul di **Dataran Inovasi** negeri itu dalam META GEMPUR (3 tapak setiap negeri, 42 kesemuanya).

## Fasa seterusnya (selepas kebanyakan murid memakai v18.14)
Setiap peranti akan mempunyai ID tanpa nama, jadi peraturan nod lama (`pemain`, `ringkas`, `komen` dan lain-lain)
boleh diketatkan supaya setiap murid hanya boleh menulis datanya sendiri. Ini dibuat secara berperingkat
supaya peranti versi lama tidak terputus.
