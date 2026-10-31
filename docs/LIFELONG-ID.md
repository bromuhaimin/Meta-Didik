# Meta Didik Lifelong ID: "One Identity, Lifelong Learning" (v18.36, fasa asas)

## 1. Audit sistem sedia ada

| Perkara | Keadaan semasa |
|---|---|
| Sistem Meta Didik ID / Lifelong ID | **Tiada.** Belum wujud sebelum versi ini. |
| Identiti | ID peranti `tw-uid` (`FB.getUid()`), profil `P` dalam `localStorage` dan disegerakkan ke `pemain/<id>` dan `ringkas/<id>`. |
| Firebase Authentication | Modul `AUTH` (app.js): log masuk tanpa nama dan Google DELIMa (`@moe-dl.edu.my`). Tidak aktif selagi `TW_AUTH.apiKey` kosong, iaitu mod percubaan semasa. |
| Peranan | Hanya `murid` dan `guru` (DELIMa atau kod sementara 1991), dan `pentadbir` (kod 6171 + kunci moderator). |
| Pangkalan data | Realtime Database (REST). Tiada Firestore. |

### Temuan keselamatan (perlu diselesaikan sebelum Lifelong ID dibuka sepenuhnya)

1. **ID peranti terdedah melalui papan kedudukan.**
   - `pemain/` boleh dibaca umum, dan kuncinya ialah ID peranti.
   - `linkAccount()` (app.js) menerima ID peranti sebagai "kod akaun" rahsia untuk memindahkan kemajuan.
   - Dalam mod percubaan, sesiapa yang membaca `pemain/` boleh menyalin kemajuan murid lain.
   - **Kesan pada reka bentuk:** Lifelong ID **tidak** boleh berasaskan ID peranti. Identiti sepanjang hayat mesti menggunakan **uid Firebase Authentication**.
   - Dalam mod percubaan, rekod Lifelong ID **disimpan pada peranti sahaja**. Hanya permohonan (cipta sahaja, tidak boleh dibaca) dihantar ke pelayan.
2. **Akaun DELIMa tamat apabila murid meninggalkan sekolah.** Akaun Google DELIMa dinyahaktifkan selepas murid tamat sekolah. Jika log masuk bergantung pada DELIMa sahaja, alumni kehilangan identitinya.

### Cadangan pautan akaun (fasa seterusnya)

Ini **bukan** sistem pengesahan kedua; ia menggunakan Firebase Authentication yang sedia ada.

- **Pautkan, jangan cipta.** Apabila pengguna tanpa nama log masuk dengan Google, hantar `idToken` akaun tanpa nama kepada `accounts:signInWithIdp`. Firebase memaut penyedia Google kepada **uid yang sama**, jadi uid kekal.
- **Satu uid, banyak penyedia.** Sebelum tamat sekolah, alumni diminta memaut akaun Google peribadi atau e-mel kepada uid yang sama, supaya identiti kekal selepas DELIMa dinyahaktifkan.
- **Hentikan `linkAccount()` berasaskan ID peranti** selepas pautan akaun tersedia. Gantikan dengan log masuk akaun.

## 2. Seni bina data (Realtime Database)

Satu profil modular bagi setiap uid. Paparan berubah ikut peranan. **Tiada lima sistem akaun berasingan.**

| Koleksi cadangan | Laluan RTDB | Baca | Tulis |
|---|---|---|---|
| users, userRoles, educationHistory, learningPassport, privacySettings | `lid/<auth.uid>` (satu dokumen: `peranan`, `sekolah`, `pendidikan`, `pasport`, `arkib`, `privasi`) | pemilik sahaja | pemilik sahaja, dengan pengesahan Rules |
| verificationRequests | `lid_mohon/<uid>/<id>` | tiada (pentadbir melalui kunci moderator) | cipta sahaja; tidak boleh ubah atau letak status |
| (keputusan pengesahan) | `lid_sah/<uid>/<peranan>` | pemilik (ketat); mod percubaan: sesiapa yang tahu ID | **pentadbir sahaja** |
| alumniProfiles, universityProfiles, professionalPortfolio, mentorProfiles, mentorshipPrograms, publicPortfolioSettings | belum dibina (fasa 3 hingga 8) | | |

Bentuk rekod `lid/<uid>`:

```
{ v:1, cipta, kemas,
  peranan:  { murid:{st:"aktif"|"tamat", dari:"2026-01", hingga?, sumber:"sendiri"},
              alumni:{st:"aktif", dari, sumber:"sendiri", sebab:"tamat"|"berhenti"},
              mahasiswa|graduan|profesional:{st, sumber:"sendiri"},
              mentor:{st:"tunggu", sumber:"mohon"} },
  sekolah:  { nama, negeri, tahap:"f5", tahunRekod:2026, jangkaTamat:2026 },
  pendidikan:{ <id>:{jenis:"ipt"|"kursus", nama, bidang, dari, hingga, sah:"sendiri"} },
  pasport:  { <id>:{jenis, tajuk, tarikh, sah:"sendiri"} },
  arkib:    { <id>:{t, dari, sekolah, tahap, ringkasan:{xp, misi, lencana[], md}} },
  privasi:  { awam:false, papar:{pasport:false, lencana:false, sekolah:false, pendidikan:false} },
  peralihan:{ t, pilihan, bolehBatal }, tunda }
```

### Prinsip

- **uid tidak pernah berubah.** Rekod tidak menyimpan uid baharu; kuncinya ialah uid Firebase Auth.
- **Status "disahkan" hanya datang daripada `lid_sah`.** `lid_sah` ditulis oleh pentadbir. Rules menolak:
  - `sumber` selain `sendiri` atau `mohon`;
  - `sah` selain `sendiri` dalam `pendidikan` dan `pasport`;
  - mentor berstatus `aktif`;
  - peranan `guru` atau `pentadbir` dalam `lid`.
- **Tertutup secara lalai.** `privasi.awam` mesti `false`, dikuatkuasakan oleh Rules dan `LIDT.normal()`. Profil awam tidak wujud pada fasa ini.
- **Guru dan pentadbir** kekal diurus oleh sistem sedia ada (DELIMa, kod, kunci moderator), bukan oleh Lifelong ID.

## 3. Peralihan Murid → Alumni

1. Murid merekod **tahap persekolahan** (Tahun 1 hingga Tingkatan 6). Sistem menjangka tahun tamat (contoh: Tingkatan 5 pada 2026 → 2026). **Umur tidak digunakan.**
2. Mulai **15 November** tahun jangkaan, aplikasi bertanya: *"Adakah anda telah tamat persekolahan?"* Status tidak ditukar secara automatik.
3. Pilihan yang ditawarkan:

   | Pilihan | Kesan |
   |---|---|
   | Ya, tamat | Alumni |
   | Berhenti sekolah | Bekas murid / alumni, `sebab: berhenti` |
   | Berpindah sekolah | Kekal murid, sekolah dikemas kini |
   | Masih bersekolah / sambung Tingkatan 6 | Jangkaan tamat dikira semula |
   | Ingatkan kemudian | Ditunda 30 hari |

   Murid juga boleh memulakan peralihan sendiri pada bila-bila masa dari papan pemuka.
4. Apabila tamat atau berhenti:
   - pencapaian murid **diarkibkan** (XP, misi, lencana, MD);
   - entri ditambah ke pasport;
   - peranan `murid` → `tamat`, peranan `alumni` → `aktif` (diisytihar sendiri);
   - **akses kelas lama ditamatkan** (`kkLeave()`).
5. Secara pilihan, permohonan pengesahan dihantar ke `lid_mohon`. Pentadbir mengesahkan atau menolak (dengan sebab) dalam Dashboard Pentadbir, dan keputusan ditulis ke `lid_sah`.
6. **Boleh dibatalkan dalam 30 hari** selagi belum disahkan. Arkib kekal; tiada data dihapuskan.

## 4. Migrasi pengguna sedia ada

- **Tiada migrasi paksa dan tiada data lama diubah.** `pemain/`, `ringkas/`, kelas dan kemajuan kekal seperti sedia ada.
- Rekod Lifelong ID dicipta apabila pengguna membuka "🪪 Meta Didik ID" (Profil). Ia diisi daripada `P.sekolah` dan `P.negeri` melalui `LIDT.dariProfil()`.
- **Mod percubaan:** rekod disimpan dalam `localStorage` (`gt-lid`).
- **Selepas Firebase Authentication diaktifkan:**
  - rekod disegerakkan ke `lid/<auth.uid>`;
  - versi terbaru (`kemas`) diguna apabila dibuka pada peranti lain;
  - rekod tempatan dimuat naik sekali pada simpanan pertama.
- **Langkah pelancaran:**
  1. Terbitkan Rules baharu (fail di bawah).
  2. Aktifkan Firebase Authentication.
  3. Pautan akaun Google peribadi.
  4. Hentikan `linkAccount()` berasaskan ID peranti.

## 5. Firebase Security Rules

Peraturan `lid`, `lid_sah` dan `lid_mohon` ditambah ke keempat-empat fail:

- `docs/firebase-rules-lengkap-percubaan.json`
- `docs/firebase-rules-lengkap-ketat.json`
- `docs/firebase-rules-percubaan.json`
- `docs/firebase-rules-stesen.json`

Ia dijana oleh `tools/ujian/lid-rules.py` (idempoten). Peraturan sedia ada tidak diubah.

## 6. Ujian

| Ujian | Arahan | Keputusan |
|---|---|---|
| Logik peranan dan peralihan (10 ujian) | `node --test tools/ujian/lid-teras.test.js` | lulus |
| Semakan statik Rules (13 ujian) | `node --test tools/ujian/lid-rules-statik.test.js` | lulus |
| Rules dengan Firebase Emulator | lihat kepala fail `tools/ujian/lid-rules.emulator.test.mjs` | **belum dijalankan** (lihat di bawah) |
| UI hujung ke hujung (Playwright + pelayan RTDB olok-olok) | murid → alumni → pentadbir sahkan → ✔ Disahkan → tambah IPT → pasport → eksport | lulus, tiada ralat halaman |

Ujian emulator tidak dapat dijalankan dalam persekitaran pembangunan ini kerana ia memerlukan muat turun pelayan emulator Firebase. Jalankan sekali di komputer anda atau dalam CI sebelum menerbitkan Rules.

Perkara yang dilindungi ujian:

- **Tiada naik taraf sendiri:** mentor, alumni, guru, pentadbir dan peranan tidak dikenali.
- **Tiada pengesahan palsu:** `sumber: pentadbir` dan ijazah dengan `sah: sah` ditolak.
- **Tiada bacaan awam:** profil murid tidak boleh dibaca umum, dan profil awam (`awam: true`) ditolak.
- **Permohonan:** cipta sahaja; tidak boleh dibaca atau ditanda status sendiri.
- **Masa peralihan:** tiada pemberitahuan sebelum 15 November atau tanpa rekod sekolah.
- **Pembatalan:** dalam 30 hari sahaja dan hanya sebelum disahkan.

## 7. Pelan berfasa

| Fasa | Kandungan | Status |
|---|---|---|
| 1 | Identiti digital (struktur data, peranan, privasi, eksport, permohonan padam) | **v18.36** |
| 2 | Peralihan Murid → Alumni + pengesahan pentadbir | **v18.36** |
| 3 | Profil alumni (tahun tamat, kenangan, sumbangan kembali ke sekolah) | akan datang |
| 4 | Profil IPT dan graduan (projek, penyelidikan, latihan industri; pengesahan oleh pihak berautoriti) | akan datang (kini: pendidikan diisytihar sendiri) |
| 5 | Portfolio profesional | akan datang |
| 6 | Mentor: permohonan, saringan, program diselia sekolah, **tanpa mesej peribadi dewasa–murid bawah umur** | akan datang (Rules sudah menghalang mentor aktif sendiri) |
| 7 | Pasport pembelajaran: garis masa dengan penanda disahkan / diisytihar sendiri / belum disahkan | asas v18.36 |
| 8 | CV digital dan portfolio boleh dikongsi (pautan + QR, hanya kandungan dipilih; perlukan nod awam berasingan yang ditapis) | akan datang |
| 9 | Pautan akaun Firebase Auth (tanpa nama → Google peribadi) | **diperlukan sebelum pelancaran penuh** |
| 10 | Papan pemuka ikut peranan | asas v18.36 (murid, alumni) |

## 8. Fail

- `mod/lid-teras.js`: logik tulen (peranan, peralihan, kelayakan, pasport, eksport). Diuji dengan Node.
- `mod/lid.js`: antara muka (Meta Didik ID) dan kotak Dashboard Pentadbir. Dimuat apabila perlu sahaja.
- `app.js`:
  - `lidOpen()`, `lidAdmin()`, `lidSemakMula()` (hanya memuat modul jika rekod `gt-lid` wujud);
  - butang "🪪 Meta Didik ID" dalam Profil;
  - kotak pentadbir.
- `index.html` (butang), `sw.js` (cache modul).
- `tools/ujian/*`: ujian dan penjana Rules.

Tangkapan skrin ujian UI (telefon 412 px): `docs/lifelong-id/`.
