/* Ujian penaja: kadar, lokasi dan Rules. Jalankan: node --test tools/ujian/penaja.test.js */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const src = fs.readFileSync(path.join(__dirname, "../../app.js"), "utf8");
/* ambil blok penaja tulen dari app.js (tanpa DOM) */
const a = src.indexOf("const PJ_PAKEJ"), b = src.indexOf("async function pjMuat");
const PJX = new Function(src.slice(a, b) + "; return { PJ_PAKEJ, PJ_LOK, PJ_TEMPOH, pjLok, pjAktif };")();

test("tiada kadar tetap: pakej hanya jenis paparan, tempoh 3/6/12 bulan", () => {
  for (const k of ["rakan", "emas", "platinum"]) assert.ok(PJX.PJ_PAKEJ[k] && !("rm" in PJX.PJ_PAKEJ[k]));
  assert.deepEqual(PJX.PJ_TEMPOH, [3, 6, 12]);
  assert.ok(!/pjHarga|PJ_DISKAUN/.test(src), "tiada pengiraan harga");
});
test("lokasi unik dengan koordinat dalam Malaysia", () => {
  const ids = PJX.PJ_LOK.map((x) => x[0]);
  assert.equal(new Set(ids).size, ids.length);
  for (const [, , la, lo] of PJX.PJ_LOK) assert.ok(la > 0.8 && la < 7.5 && lo > 99.5 && lo < 119.5);
  assert.equal(PJX.pjLok("klcc").n, "KLCC, Kuala Lumpur");
});
test("hanya penaja aktif dipaparkan, platinum dahulu", () => {
  const now = 1e12, v = { a: { n: "A", pk: "rakan", lk: "klcc", mula: now - 1, tamat: now + 1 }, b: { n: "B", pk: "platinum", lk: "jb", mula: now - 1, tamat: now + 1 }, c: { n: "C", pk: "emas", lk: "ipoh", mula: now - 9, tamat: now - 1 }, d: { n: "D", pk: "palsu", lk: "kk" } };
  assert.deepEqual(PJX.pjAktif(v, now).map((x) => x.n), ["B", "A"]);
});
const D = path.join(__dirname, "../../docs");
for (const f of ["firebase-rules-lengkap-percubaan.json", "firebase-rules-lengkap-ketat.json", "firebase-rules-percubaan.json", "firebase-rules-stesen.json"]) {
  test(f + ": penaja ditulis pentadbir sahaja; permohonan cipta sahaja dan tidak boleh dibaca", () => {
    const d = JSON.parse(fs.readFileSync(path.join(D, f), "utf8")), r = d.rules || d;
    assert.equal(r.penaja[".read"], true); assert.equal(r.penaja[".write"], false);
    assert.equal(r.penaja_mohon[".read"], false);
    assert.match(r.penaja_mohon.$id[".write"], /!data\.exists\(\)/);
    if (/ketat|stesen/.test(f)) assert.match(r.penaja_mohon.$id[".write"], /auth != null/);
    assert.match(r.penaja_mohon.$id[".validate"], /!newData\.child\('st'\)\.exists\(\)/, "pemohon tidak boleh meluluskan sendiri");
    assert.match(r.penaja_mohon.$id[".validate"], /length <= 120000/);
    assert.match(r.penaja_mohon.$id[".validate"], /child\('rm'\)\.val\(\) >= 1/, "jumlah tajaan wajib");
  });
}
