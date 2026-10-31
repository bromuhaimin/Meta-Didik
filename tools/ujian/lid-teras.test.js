/* Ujian unit Meta Didik Lifelong ID (teras). Jalankan: node --test tools/ujian/ */
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../../mod/lid-teras.js");

const T2026 = Date.UTC(2026, 5, 1); /* 1 Jun 2026 */
const T_NOV = Date.UTC(2026, 10, 20); /* 20 Nov 2026 */

test("rekod baharu: murid aktif, privasi tertutup secara lalai, tiada profil awam", () => {
  const r = L.baru(T2026);
  assert.equal(r.peranan.murid.st, "aktif");
  assert.equal(r.privasi.awam, false);
  assert.ok(Object.values(r.privasi.papar).every((v) => v === false));
  assert.equal(L.normal(Object.assign(r, { privasi: { awam: true, papar: {} } })).privasi.awam, false, "normal() memaksa awam = false pada Fasa 1");
});

test("migrasi daripada profil sedia ada tidak memadam data dan tidak menukar uid", () => {
  const P = { nama: "Aisyah", sekolah: "SMK Ujian", negeri: "SGR", xp: 1200 };
  const r = L.dariProfil(P, T2026);
  assert.equal(r.sekolah.nama, "SMK Ujian");
  assert.equal(P.xp, 1200, "profil asal tidak diubah");
  assert.ok(!("uid" in r), "rekod Lifelong ID tidak menyimpan uid baharu (uid kekal = Firebase Auth / sedia ada)");
});

test("jangkaan tamat dikira daripada tahap persekolahan, bukan umur", () => {
  assert.equal(L.jangkaTamat("f5", 2026), 2026);
  assert.equal(L.jangkaTamat("f3", 2026), 2028);
  assert.equal(L.jangkaTamat("t6", 2026), 2032);
  assert.equal(L.jangkaTamat("f6r", 2026), 2027);
  assert.equal(L.jangkaTamat("lain", 2026), null);
});

test("pemberitahuan peralihan hanya selepas 15 Nov tahun jangkaan, dan boleh ditunda", () => {
  let r = L.tetapSekolah(L.baru(T2026), { nama: "SMK Ujian", tahap: "f5", tahunRekod: 2026 }, T2026);
  assert.equal(L.layakSemak(r, T2026), false, "belum masanya pada Jun");
  assert.equal(L.layakSemak(r, T_NOV), true, "layak pada 20 Nov");
  r = L.peralihan(r, "tunda", {}, T_NOV);
  assert.equal(L.layakSemak(r, T_NOV + 864e5), false, "ditunda 30 hari");
  assert.equal(L.layakSemak(r, T_NOV + 31 * 864e5), true);
  const tiadaRekod = L.baru(T2026);
  assert.equal(L.layakSemak(tiadaRekod, T_NOV), false, "tanpa rekod sekolah: tiada pemberitahuan (tiada tekaan umur)");
});

test("peralihan Murid -> Alumni: arkib, pasport, peranan, boleh dibatal dalam 30 hari", () => {
  let r = L.tetapSekolah(L.baru(T2026), { nama: "SMK Ujian", tahap: "f5", tahunRekod: 2026 }, T2026);
  const sum = L.ringkasan({ xp: 900, prog: { a: { b: 2 }, b: { b: 0 } }, bd: { x1: 1, zz: 1 }, coin: 40 }, ["x1"]);
  r = L.peralihan(r, "tamat", { ringkasan: sum }, T_NOV);
  assert.equal(r.peranan.murid.st, "tamat");
  assert.equal(r.peranan.alumni.st, "aktif");
  assert.equal(r.peranan.alumni.sumber, "sendiri");
  assert.equal(L.status(r, "alumni", {}), "diisytihar", "belum disahkan pentadbir");
  assert.equal(L.status(r, "alumni", { alumni: { st: "sah" } }), "disahkan");
  const ark = Object.values(r.arkib)[0];
  assert.deepEqual(ark.ringkasan, { xp: 900, misi: 1, lencana: ["x1"], md: 40 });
  assert.equal(Object.values(r.pasport)[0].sah, "sendiri");
  assert.throws(() => L.peralihan(r, "tamat", {}, T_NOV), /murid aktif/, "tidak boleh beralih dua kali");
  r = L.peralihan(r, "batal", {}, T_NOV + 5 * 864e5);
  assert.equal(r.peranan.murid.st, "aktif"); assert.ok(!r.peranan.alumni);
  assert.equal(Object.keys(r.arkib).length, 1, "arkib kekal walaupun dibatalkan (tiada data dihapuskan)");
});

test("batal ditolak selepas 30 hari atau selepas disahkan", () => {
  let r = L.tetapSekolah(L.baru(T2026), { nama: "S", tahap: "f5", tahunRekod: 2026 }, T2026);
  r = L.peralihan(r, "tamat", {}, T_NOV);
  assert.throws(() => L.peralihan(JSON.parse(JSON.stringify(r)), "batal", {}, T_NOV + 31 * 864e5));
  assert.throws(() => L.peralihan(JSON.parse(JSON.stringify(r)), "batal", { disahkan: true }, T_NOV + 864e5));
});

test("berhenti, pindah dan sambung persekolahan", () => {
  let r = L.tetapSekolah(L.baru(T2026), { nama: "SMK A", tahap: "f5", tahunRekod: 2026 }, T2026);
  const p = L.peralihan(JSON.parse(JSON.stringify(r)), "berhenti", {}, T_NOV);
  assert.equal(p.peranan.alumni.sebab, "berhenti");
  const q = L.peralihan(JSON.parse(JSON.stringify(r)), "pindah", { nama: "SMK B", tahap: "f5" }, T_NOV);
  assert.equal(q.sekolah.nama, "SMK B"); assert.equal(q.peranan.murid.st, "aktif"); assert.ok(!q.peranan.alumni);
  const s = L.peralihan(JSON.parse(JSON.stringify(r)), "sambung", { tahap: "f6r" }, T_NOV);
  assert.equal(s.sekolah.jangkaTamat, 2027, "Tingkatan 6 Rendah: jangkaan tamat setahun lagi");
  assert.equal(L.layakSemak(s, T_NOV), false);
});

test("kawalan akses: pengguna tidak boleh menaik taraf sendiri ke peranan istimewa", () => {
  const r = L.baru(T2026);
  assert.throws(() => L.isytihar(r, "mentor", T2026), /permohonan/);
  assert.throws(() => L.isytihar(r, "alumni", T2026), /peralihan/);
  assert.throws(() => L.isytihar(r, "guru", T2026), /sistem/);
  assert.throws(() => L.isytihar(r, "pentadbir", T2026), /sistem/);
  assert.throws(() => L.isytihar(r, "superuser", T2026), /tidak dikenali/);
  L.mohon(r, "mentor", T2026);
  assert.equal(r.peranan.mentor.st, "tunggu", "mentor hanya 'tunggu' sehingga diluluskan");
  assert.equal(L.status(r, "mentor", {}), "menunggu");
  L.isytihar(r, "mahasiswa", T2026);
  assert.equal(L.status(r, "mahasiswa", {}), "diisytihar", "peranan diisytihar sendiri tidak menjadi 'disahkan'");
});

test("pelbagai peranan serentak dibenarkan", () => {
  let r = L.tetapSekolah(L.baru(T2026), { nama: "S", tahap: "f5", tahunRekod: 2026 }, T2026);
  r = L.peralihan(r, "tamat", {}, T_NOV);
  L.isytihar(r, "mahasiswa", T_NOV); L.isytihar(r, "profesional", T_NOV);
  assert.deepEqual(["alumni", "mahasiswa", "profesional"].map((p) => L.aktif(r, p)), [true, true, true]);
});

test("pendidikan baharu sentiasa diisytihar sendiri; eksport dan permohonan", () => {
  const r = L.baru(T2026);
  L.tambahPendidikan(r, { nama: "Universiti Ujian", bidang: "Pendidikan", dari: "2027" }, T2026);
  const e = Object.values(r.pendidikan)[0];
  assert.equal(e.sah, "sendiri");
  assert.ok(L.garisMasa(r, {}).every((x) => x.sah !== "sah"), "tiada penanda sah tanpa pengesahan");
  const ex = L.eksport(r, { nama: "A", bd: { x: 1 } }, "uid123");
  assert.equal(ex.format, "meta-didik-lifelong-id"); assert.equal(ex.uid, "uid123");
  assert.throws(() => L.permohonan("pentadbir", r, {}, T2026));
  assert.equal(L.permohonan("padam", r, { nota: "Sila padam" }, T2026).jenis, "padam");
});
