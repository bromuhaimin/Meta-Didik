/* Semakan statik Firebase Rules Meta Didik ID (tanpa emulator). Jalankan: node --test tools/ujian/lid-rules-statik.test.js */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const L = require("../../mod/lid-teras.js");
const D = path.join(__dirname, "../../docs");
const FAIL = { "firebase-rules-lengkap-percubaan.json": "percubaan", "firebase-rules-lengkap-ketat.json": "ketat", "firebase-rules-percubaan.json": "percubaan", "firebase-rules-stesen.json": "ketat" };
const muat = (f) => { const d = JSON.parse(fs.readFileSync(path.join(D, f), "utf8")); return d.rules || d; };
const OWN = "auth != null && auth.uid === $uid";

for (const [f, mod] of Object.entries(FAIL)) {
  test(f + ": lid hanya boleh dibaca/ditulis pemilik (tiada bacaan awam)", () => {
    const r = muat(f);
    assert.equal(r.lid[".read"], false); assert.ok(!(".write" in r.lid));
    assert.equal(r.lid.$uid[".read"], OWN); assert.equal(r.lid.$uid[".write"], OWN);
    assert.match(r.lid.$uid[".validate"], /awam'\)\.val\(\) !== true/, "profil awam disekat pada fasa ini");
  });
  test(f + ": lid_sah ditulis pentadbir sahaja; lid_mohon tidak boleh dibaca", () => {
    const r = muat(f);
    assert.equal(r.lid_sah[".read"], false); assert.equal(r.lid_sah.$uid[".write"], false);
    assert.equal(r.lid_sah.$uid[".read"], mod === "ketat" ? OWN : "true");
    assert.equal(r.lid_mohon[".read"], false);
    assert.match(r.lid_mohon.$uid.$id[".write"], /!data\.exists\(\)/, "cipta sahaja, tidak boleh ubah status");
    if (mod === "ketat") assert.ok(r.lid_mohon.$uid.$id[".write"].startsWith(OWN));
    assert.match(r.lid_mohon.$uid.$id[".validate"], /!newData\.child\('st'\)\.exists\(\)/);
  });
  test(f + ": peraturan lama kekal", () => {
    const r = muat(f);
    for (const k of (f.includes("lengkap") ? ["pemain", "ringkas", "stesen"] : ["stesen"])) assert.ok(k in r, k);
  });
}

/* cermin JS bagi .validate peranan supaya rekod yang dihasilkan lid-teras sentiasa lulus, dan naik taraf sendiri ditolak */
const r0 = muat("firebase-rules-lengkap-ketat.json").lid.$uid;
const reP = new RegExp(r0.peranan.$p[".validate"].match(/\$p\.matches\(\/(.+?)\/\)/)[1]);
function lulus(rec) {
  if (typeof rec.v !== "number" || !rec.peranan) return false;
  if (rec.privasi && rec.privasi.awam === true) return false;
  for (const [p, x] of Object.entries(rec.peranan)) {
    if (p === "mentor") { if (!["tunggu", "tamat"].includes(x.st)) return false; continue; }
    if (!reP.test(p) || !/^(aktif|tamat|tunggu)$/.test(x.st)) return false;
    if (x.sumber != null && !/^(sendiri|mohon)$/.test(x.sumber)) return false;
  }
  for (const k of ["pendidikan", "pasport"]) for (const e of Object.values(rec[k] || {})) if (e.sah != null && e.sah !== "sendiri") return false;
  return true;
}
test("rekod sah daripada lid-teras lulus peraturan; naik taraf sendiri ditolak", () => {
  const t = Date.UTC(2026, 10, 20);
  let r = L.tetapSekolah(L.baru(t), { nama: "S", tahap: "f5", tahunRekod: 2026 }, t);
  r = L.peralihan(r, "tamat", {}, t); L.tambahPendidikan(r, { nama: "Universiti Ujian" }, t); L.mohon(r, "mentor", t); L.isytihar(r, "mahasiswa", t);
  assert.ok(lulus(JSON.parse(JSON.stringify(r))));
  const c = (f) => { const x = JSON.parse(JSON.stringify(r)); f(x); return x; };
  assert.equal(lulus(c((x) => { x.peranan.mentor.st = "aktif"; })), false, "mentor aktif sendiri");
  assert.equal(lulus(c((x) => { x.peranan.guru = { st: "aktif" }; })), false, "guru");
  assert.equal(lulus(c((x) => { x.peranan.pentadbir = { st: "aktif" }; })), false, "pentadbir");
  assert.equal(lulus(c((x) => { x.peranan.alumni.sumber = "pentadbir"; })), false, "pengesahan palsu");
  assert.equal(lulus(c((x) => { Object.values(x.pendidikan)[0].sah = "sah"; })), false, "ijazah 'disahkan' sendiri");
  assert.equal(lulus(c((x) => { x.privasi.awam = true; })), false, "profil awam");
});
