/* =====================================================================
   META DIDIK LIFELONG ID: teras logik (tanpa DOM; diuji dengan Node: tools/ujian/lid-teras.test.js)
   Satu identiti, seumur hidup. Rekod disimpan di localStorage "gt-lid" dan, apabila Firebase Authentication
   aktif, di lid/<auth.uid> (hanya pemilik). Pengesahan peranan hanya oleh pentadbir di lid_sah/<uid>.
   Fasa 1-2: peranan, profil berkembang, peralihan Murid -> Alumni. Fasa 3-10 dibina berperingkat.
   ===================================================================== */
(function (root) {
  "use strict";
  const V = 1;
  /* katalog peranan. isytihar: pengguna boleh menambah sendiri (status "diisytihar" sehingga disahkan).
     mohon: hanya melalui permohonan + kelulusan pentadbir (tidak boleh diaktifkan sendiri). */
  const PERANAN = {
    murid: { n: "Murid", ic: "🎒", isytihar: true, fasa: 1 },
    alumni: { n: "Alumni", ic: "🎓", isytihar: false, peralihan: true, fasa: 2 },
    mahasiswa: { n: "Mahasiswa IPT", ic: "🏛", isytihar: true, fasa: 4 },
    graduan: { n: "Graduan", ic: "📜", isytihar: true, fasa: 4 },
    profesional: { n: "Profesional", ic: "💼", isytihar: true, fasa: 5 },
    mentor: { n: "Mentor", ic: "🤝", isytihar: false, mohon: true, fasa: 6 }
  };
  /* peranan sistem lama (guru DELIMa/kod, pentadbir) diurus oleh modul sedia ada, bukan melalui Lifelong ID */
  const PERANAN_SISTEM = ["guru", "pentadbir"];
  const ST = ["aktif", "tamat", "tunggu"];
  const SEBAB = { tamat: "Tamat persekolahan", berhenti: "Berhenti sekolah" };
  /* tahap persekolahan -> tahun jangkaan tamat persekolahan (bukan umur) */
  const TAHAP = [
    ["t1", "Tahun 1", 11], ["t2", "Tahun 2", 10], ["t3", "Tahun 3", 9], ["t4", "Tahun 4", 8], ["t5", "Tahun 5", 7], ["t6", "Tahun 6", 6],
    ["f1", "Tingkatan 1", 4], ["f2", "Tingkatan 2", 3], ["f3", "Tingkatan 3", 2], ["f4", "Tingkatan 4", 1], ["f5", "Tingkatan 5", 0],
    ["f6r", "Tingkatan 6 Rendah", 1], ["f6a", "Tingkatan 6 Atas", 0], ["lain", "Lain-lain / tidak pasti", null]
  ];
  const HARI = 864e5;
  /* pemberitahuan pengesahan bermula 15 November tahun jangkaan tamat (selepas peperiksaan utama bermula) */
  function mulaSemak(tahun) { return Date.UTC(tahun, 10, 15) - 8 * 3600e3; }
  function ym(t) { const d = new Date((t == null ? Date.now() : t) + 8 * 3600e3); return d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0"); }
  function tahun(t) { return new Date((t == null ? Date.now() : t) + 8 * 3600e3).getUTCFullYear(); }
  function bersih(s, n) { return String(s == null ? "" : s).replace(/[\u0000-\u001f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, n || 80); }

  /* rekod baharu: semua tetapan privasi TERTUTUP secara lalai */
  function baru(now) {
    const t = now || Date.now();
    return { v: V, cipta: t, kemas: t, peranan: { murid: { st: "aktif", dari: ym(t), sumber: "sendiri" } }, sekolah: null, pendidikan: {}, pasport: {}, arkib: {},
      privasi: { awam: false, papar: { pasport: false, lencana: false, sekolah: false, pendidikan: false } }, peralihan: null, tunda: 0 };
  }
  /* migrasi daripada profil sedia ada (P): tiada data dipindahkan keluar peranti; hanya pautan rujukan */
  function dariProfil(P, now) {
    const r = baru(now);
    if (P && P.sekolah) r.sekolah = { nama: bersih(P.sekolah, 80), negeri: bersih(P.negeri, 12), tahap: null, tahunRekod: null, jangkaTamat: null };
    return r;
  }
  function normal(r) {
    if (!r || typeof r !== "object" || r.v !== V) return null;
    r.peranan = r.peranan || {}; r.pendidikan = r.pendidikan || {}; r.pasport = r.pasport || {}; r.arkib = r.arkib || {};
    r.privasi = r.privasi || { awam: false, papar: {} }; r.privasi.awam = false; /* Fasa 1: tiada profil awam */
    return r;
  }
  /* tahap persekolahan -> jangkaan tahun tamat */
  function jangkaTamat(kodTahap, tahunRekod) {
    const t = TAHAP.find((x) => x[0] === kodTahap); if (!t || t[2] == null || !tahunRekod) return null;
    return tahunRekod + t[2];
  }
  function tetapSekolah(r, o, now) {
    const tr = o.tahunRekod || tahun(now);
    r.sekolah = { nama: bersih(o.nama, 80), negeri: bersih(o.negeri, 12), tahap: o.tahap || null, tahunRekod: tr, jangkaTamat: jangkaTamat(o.tahap, tr) };
    r.kemas = now || Date.now(); return r;
  }
  function aktif(r, p) { return !!(r && r.peranan[p] && r.peranan[p].st === "aktif"); }
  /* status paparan: disahkan (pentadbir), diisytihar (pengguna) atau menunggu */
  function status(r, p, sah) {
    const x = r && r.peranan[p]; if (!x) return null;
    if (sah && sah[p] && sah[p].st === "sah") return "disahkan";
    if (x.st === "tunggu") return "menunggu";
    if (sah && sah[p] && sah[p].st === "tolak") return "ditolak";
    return x.st === "aktif" ? "diisytihar" : "tamat";
  }
  /* layak dipaparkan pemberitahuan peralihan? Hanya berdasarkan rekod sekolah yang diisi, bukan umur */
  function layakSemak(r, now) {
    now = now || Date.now();
    if (!r || !aktif(r, "murid") || !r.sekolah || !r.sekolah.jangkaTamat) return false;
    if (r.tunda && now < r.tunda) return false;
    return now >= mulaSemak(r.sekolah.jangkaTamat);
  }
  /* pengguna menambah peranan sendiri: hanya peranan "isytihar"; peranan istimewa ditolak */
  function isytihar(r, p, now) {
    if (PERANAN_SISTEM.indexOf(p) >= 0) throw new Error("Peranan " + p + " diurus oleh sistem guru/pentadbir.");
    const d = PERANAN[p]; if (!d) throw new Error("Peranan tidak dikenali.");
    if (!d.isytihar) throw new Error(d.mohon ? "Peranan " + d.n + " memerlukan permohonan dan kelulusan pentadbir." : "Peranan " + d.n + " hanya melalui proses peralihan.");
    r.peranan[p] = { st: "aktif", dari: ym(now), sumber: "sendiri" }; r.kemas = now || Date.now(); return r;
  }
  function tamatkan(r, p, now) { if (r.peranan[p]) { r.peranan[p].st = "tamat"; r.peranan[p].hingga = ym(now); r.kemas = now || Date.now(); } return r; }
  function mohon(r, p, now) {
    const d = PERANAN[p]; if (!d || !d.mohon) throw new Error("Peranan ini tidak melalui permohonan.");
    r.peranan[p] = { st: "tunggu", dari: ym(now), sumber: "mohon" }; r.kemas = now || Date.now(); return r;
  }
  /* ringkasan pembelajaran semasa yang diarkibkan semasa peralihan (hanya data permainan, bukan data peribadi) */
  function ringkasan(P, badges) {
    const prog = (P && P.prog) || {}, bd = (P && P.bd) || {};
    return { xp: Math.max(0, (P && P.xp) | 0), misi: Object.keys(prog).filter((k) => (prog[k].b | 0) > 0).length, lencana: Object.keys(bd).filter((k) => !badges || badges.indexOf(k) >= 0).slice(0, 200), md: Math.max(0, (P && P.coin) | 0) };
  }
  /* peralihan Murid -> Alumni (pilihan: tamat | berhenti), Murid kekal (pindah | sambung), atau tunda */
  function peralihan(r, pilihan, o, now) {
    now = now || Date.now(); o = o || {};
    if (!aktif(r, "murid") && pilihan !== "batal") throw new Error("Hanya murid aktif boleh membuat peralihan.");
    if (pilihan === "tamat" || pilihan === "berhenti") {
      const id = "a" + now.toString(36);
      r.arkib[id] = { t: now, dari: "murid", sekolah: r.sekolah ? r.sekolah.nama : "", tahap: r.sekolah ? r.sekolah.tahap : null, ringkasan: o.ringkasan || null };
      tamatkan(r, "murid", now);
      r.peranan.alumni = { st: "aktif", dari: ym(now), sumber: "sendiri", sebab: pilihan };
      r.pasport["p" + now.toString(36)] = { jenis: "sekolah", tajuk: (pilihan === "tamat" ? "Tamat persekolahan" : "Meninggalkan persekolahan") + (r.sekolah && r.sekolah.nama ? " · " + r.sekolah.nama : ""), tarikh: tahun(now), sah: "sendiri" };
      r.peralihan = { pilihan: pilihan, t: now, arkib: id, bolehBatal: now + 30 * HARI };
    } else if (pilihan === "pindah") {
      if (!o.nama) throw new Error("Isi nama sekolah baharu.");
      tetapSekolah(r, { nama: o.nama, negeri: o.negeri, tahap: o.tahap || (r.sekolah && r.sekolah.tahap), tahunRekod: tahun(now) }, now);
    } else if (pilihan === "sambung") {
      if (!o.tahap) throw new Error("Pilih tahap persekolahan semasa.");
      tetapSekolah(r, { nama: (r.sekolah && r.sekolah.nama) || o.nama, negeri: r.sekolah && r.sekolah.negeri, tahap: o.tahap, tahunRekod: tahun(now) }, now);
    } else if (pilihan === "tunda") {
      r.tunda = now + 30 * HARI;
    } else if (pilihan === "batal") {
      /* tersilap pilih: boleh dibatalkan dalam 30 hari jika belum disahkan pentadbir */
      if (!r.peralihan || now > r.peralihan.bolehBatal || o.disahkan) throw new Error("Peralihan tidak lagi boleh dibatalkan.");
      r.peranan.murid = { st: "aktif", dari: r.peranan.murid ? r.peranan.murid.dari : ym(now), sumber: "sendiri" };
      delete r.peranan.alumni; r.peralihan = null;
    } else throw new Error("Pilihan tidak sah.");
    r.kemas = now; return r;
  }
  /* pendidikan baharu (IPT, kursus): sentiasa "diisytihar sendiri" sehingga disahkan pihak berautoriti */
  function tambahPendidikan(r, o, now) {
    const nm = bersih(o.nama, 80); if (nm.length < 3) throw new Error("Isi nama institusi.");
    const id = "e" + (now || Date.now()).toString(36);
    r.pendidikan[id] = { jenis: o.jenis === "kursus" ? "kursus" : "ipt", nama: nm, bidang: bersih(o.bidang, 80), dari: bersih(o.dari, 7), hingga: bersih(o.hingga, 7), sah: "sendiri" };
    r.pasport["p" + id] = { jenis: r.pendidikan[id].jenis, tajuk: (r.pendidikan[id].jenis === "ipt" ? "Pengajian: " : "Kursus: ") + nm + (o.bidang ? " · " + bersih(o.bidang, 60) : ""), tarikh: parseInt(o.dari, 10) || tahun(now), sah: "sendiri" };
    r.kemas = now || Date.now(); return r;
  }
  /* garis masa pasport: tersusun ikut tarikh; penanda sah / sendiri / tunggu */
  function garisMasa(r, sah) {
    const out = Object.keys(r.pasport || {}).map((k) => Object.assign({ id: k }, r.pasport[k]));
    if (sah && sah.alumni && sah.alumni.st === "sah") out.forEach((x) => { if (x.jenis === "sekolah") x.sah = "sah"; });
    return out.sort((a, b) => (a.tarikh | 0) - (b.tarikh | 0));
  }
  /* eksport data pengguna (hak akses data): rekod Lifelong ID + ringkasan profil permainan */
  function eksport(r, P, uid) {
    return { format: "meta-didik-lifelong-id", versi: V, dieksport: new Date().toISOString(), uid: uid || "", lifelong: r,
      profil: P ? { nama: P.nama, sekolah: P.sekolah, negeri: P.negeri, kelas: P.kelas, xp: P.xp | 0, md: P.coin | 0, lencana: Object.keys(P.bd || {}) } : null };
  }
  /* dokumen permohonan ke pentadbir (lid_mohon): tanpa data sensitif selain yang perlu untuk semakan */
  function permohonan(jenis, r, o, now) {
    if (["alumni", "padam", "mentor"].indexOf(jenis) < 0) throw new Error("Jenis permohonan tidak sah.");
    const d = { jenis: jenis, t: now || Date.now() };
    if (jenis === "alumni") { d.sekolah = r.sekolah ? r.sekolah.nama : ""; d.tahun = tahun(now); d.sebab = r.peranan.alumni ? r.peranan.alumni.sebab : "tamat"; }
    if (o && o.nota) d.nota = bersih(o.nota, 200);
    return d;
  }
  const LIDT = { V, PERANAN, PERANAN_SISTEM, ST, SEBAB, TAHAP, baru, dariProfil, normal, jangkaTamat, tetapSekolah, aktif, status, layakSemak, mulaSemak, isytihar, tamatkan, mohon, ringkasan, peralihan, tambahPendidikan, garisMasa, eksport, permohonan, ym, tahun };
  if (typeof module !== "undefined" && module.exports) module.exports = LIDT; else root.LIDT = LIDT;
})(typeof window !== "undefined" ? window : globalThis);
