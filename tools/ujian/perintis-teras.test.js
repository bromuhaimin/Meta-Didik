/* Ujian teras kawasan perintis (DATA UJIAN SINTETIK, bukan geografi sebenar). Jalankan: node --test tools/ujian/perintis-teras.test.js */
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../../mod/perintis-teras.js");
const J = (id, p, nd, o) => Object.assign({ id: id, k: "perumahan", hw: "residential", n: "", p: p, nd: nd, ow: 0, l: 0, b: 0, t: 0, w: 6, pandu: 1 }, o || {});

test("graf: jalan sehala dipatuhi oleh kenderaan, tidak oleh pejalan kaki", () => {
  const d = { jalan: [J(1, [[0, 0], [100, 0]], [1, 2], { ow: 1 }), J(2, [[100, 0], [100, 100]], [2, 3])] };
  const gk = L.graf(d, "kenderaan"), gj = L.graf(d, "kaki");
  assert.ok(L.astar(gk, 1, 3)); assert.equal(L.astar(gk, 3, 1), null, "melawan arus sehala ditolak");
  assert.deepEqual(L.astar(gj, 3, 1).map(String), ["3", "2", "1"]);
});
test("graf: lebuh raya tiada untuk pejalan kaki; laluan pejalan tiada untuk kenderaan", () => {
  const d = { jalan: [J(1, [[0, 0], [50, 0]], [1, 2], { hw: "motorway", k: "lebuhraya" }), J(2, [[50, 0], [80, 0]], [2, 3], { hw: "footway", k: "pejalan", pandu: 0 })] };
  assert.equal(L.astar(L.graf(d, "kaki"), 1, 3), null); assert.equal(L.astar(L.graf(d, "kenderaan"), 1, 3), null);
});
test("persimpangan bertingkat tidak bersambung dalam graf (tiada nod dikongsi)", () => {
  const d = { jalan: [J(1, [[-50, 0], [50, 0]], [1, 2]), J(2, [[0, -50], [0, 50]], [3, 4], { b: 1, l: 1 })] };
  const g = L.graf(d, "kaki"); assert.equal(L.astar(g, 1, 4), null);
});
test("A* memilih laluan terpendek mengikut jalan, bukan garis lurus", () => {
  const d = { jalan: [J(1, [[0, 0], [0, 100]], [1, 2]), J(2, [[0, 100], [100, 100]], [2, 3]), J(3, [[0, 0], [300, 0]], [1, 4]), J(4, [[300, 0], [100, 100]], [4, 3])] };
  const g = L.graf(d, "kaki"), p = L.astar(g, 1, 3);
  assert.deepEqual(p.map(String), ["1", "2", "3"]); assert.equal(Math.round(L.panjang(g, p)), 200);
});
test("profil dek jambatan: cerun di hujung, rata di tengah; jalan biasa di tanah", () => {
  const ys = L.dekProfil(J(1, [[0, 0], [100, 0], [200, 0]], [1, 2, 3], { b: 1, l: 1 }));
  assert.equal(ys[0], 0); assert.equal(ys[2], 0); assert.equal(ys[1], 6.5);
  assert.deepEqual(L.dekProfil(J(2, [[0, 0], [10, 0]], [1, 2])), [0, 0]);
});
test("permukaan: di atas jejambat pemain berdiri di dek; di bawahnya kekal di tanah", () => {
  const d = { jalan: [J(1, [[0, 0], [100, 0], [200, 0]], [1, 2, 3], { b: 1, l: 1, w: 10 })] };
  const ID = L.indeksDek(d);
  assert.equal(L.tinggiPermukaan(ID, 100, 0, 6.4), 6.5, "di atas dek");
  assert.equal(L.tinggiPermukaan(ID, 100, 0, 0), 0, "di bawah jejambat");
  assert.equal(L.tinggiPermukaan(ID, 100, 30, 6.5), 0, "di luar lebar jalan");
});
test("perlanggaran bangunan dengan jejari", () => {
  const gp = L.gridPoligon([{ id: 9, p: [[0, 0], [10, 0], [10, 10], [0, 10]] }]);
  assert.ok(L.kenaPoligon(gp, 5, 5, 0)); assert.equal(L.kenaPoligon(gp, -2, 5, 0), null); assert.ok(L.kenaPoligon(gp, -0.3, 5, 0.5));
});
test("V8: objek terapung atau tenggelam dikesan; terowong dikecualikan", () => {
  const r = L.semakTanah([{ id: 1, jenis: "bangunan", minY: 0, tanah: 0 }, { id: 2, jenis: "pokok", minY: 1.2, tanah: 0 }, { id: 3, jenis: "jalan", minY: -6, tanah: 0, terowong: true }, { id: 4, jenis: "tiang", minY: -0.5, tanah: 0 }]);
  assert.deepEqual(r.map((x) => x.id), [2, 4]);
});

/* ---------- rupa bumi DEM (grid SINTETIK) ---------- */
const demSint = (nx, nz, f) => { const h = []; for (let i = 0; i < nz; i++) for (let j = 0; j < nx; j++) h.push(f(j, i)); return L.dem({ grid: { x0: -100, z0: -50, dx: 30, dz: 30, nx: nx, nz: nz }, h: h, meta: {} }); };
test("tinggiTanah: tepat di sampel, linear pada satah, terhad di luar grid", () => {
  const D = demSint(6, 5, (j, i) => 50 + 2 * j + 3 * i);           /* satah condong */
  assert.equal(D.ref, 50);
  assert.equal(L.tinggiTanah(D, -100, -50), 0); assert.equal(L.tinggiTanah(D, -100 + 30 * 2, -50 + 30 * 3), 13);
  assert.ok(Math.abs(L.tinggiTanah(D, -100 + 45, -50 + 15) - (2 * 1.5 + 3 * 0.5)) < 1e-9, "satah diinterpolasi tepat");
  assert.equal(L.tinggiTanah(D, -1e6, -1e6), 0); assert.equal(L.tinggiTanah(null, 5, 5), 0);
});
test("petak rupa bumi: setiap segi empat diliputi sekali, sempadan dikongsi (tiada jurang antara petak)", () => {
  const D = demSint(23, 17, (j, i) => (j * 7 + i * 13) % 11), P = L.petakTanah(D, 8), kira = {};
  P.forEach((c) => { for (let i = c.i0; i < c.i1; i++) for (let j = c.j0; j < c.j1; j++) kira[i + "," + j] = (kira[i + "," + j] || 0) + 1; assert.equal(L.indeksPetak(c).length, (c.i1 - c.i0) * (c.j1 - c.j0) * 6); });
  assert.equal(Object.keys(kira).length, 22 * 16); assert.ok(Object.values(kira).every((v) => v === 1));
  P.forEach((a) => P.forEach((b) => { if (a.j1 === b.j0 && a.i0 === b.i0) assert.equal(a.j1, b.j0, "lajur sempadan sama"); }));
  const kanan = P.find((c) => c.j0 === 8 && c.i0 === 0), kiri = P.find((c) => c.j0 === 0 && c.i0 === 0);
  for (let i = 0; i <= 8; i++) assert.equal(D.h[i * D.nx + kiri.j1], D.h[i * D.nx + kanan.j0], "bucu tepi berkongsi sampel yang sama");
});
test("ysNod: jalan ikut tanah; jambatan lurus antara tebing + dek; avatar tidak jatuh menembusi tanah", () => {
  const D = demSint(20, 20, (j, i) => 40 + 10 * Math.abs(j - 10));   /* lembah di tengah (x = 200) */
  const jl = J(1, [[-100, 0], [200, 0], [440, 0]], [1, 2, 3]), ys = L.ysNod(jl, D);
  assert.deepEqual(ys.map((v) => +v.toFixed(6)), [100, 0, 80], "tebing kiri, dasar lembah, tebing kanan");
  const jb = J(2, [[-100, 0], [200, 0], [470, 0]], [4, 5, 6], { b: 1, l: 1 }), yb = L.ysNod(jb, D);
  assert.ok(yb[1] > L.tinggiTanah(D, 200, 0) + 50, "dek jambatan jauh di atas dasar lembah, tidak mengikut tanah");
  const ID = L.indeksDek({ jalan: [jb] }, D);
  for (let x = -90; x < 460; x += 37) { const yt = L.tinggiTanah(D, x, 120); assert.ok(L.tinggiPermukaan(ID, x, 120, yt + 0.3, yt) >= yt, "permukaan tidak di bawah tanah"); }
  assert.ok(Math.abs(L.tinggiPermukaan(ID, 200, 0, yb[1], L.tinggiTanah(D, 200, 0)) - yb[1]) < 0.01, "berdiri di dek jambatan");
});
test("padat: langkah tidak melebihi had, hujung dikekalkan", () => {
  const r = L.padat([[0, 0], [100, 0], [100, 25]], [0, 10, 10], 12);
  assert.deepEqual(r.p[0], [0, 0]); assert.deepEqual(r.p[r.p.length - 1], [100, 25]);
  for (let i = 1; i < r.p.length; i++) assert.ok(Math.hypot(r.p[i][0] - r.p[i - 1][0], r.p[i][1] - r.p[i - 1][1]) <= 12.0001);
});
test("lot pameran: ditolak di atas jalan, dalam sungai, tasik atau bangunan; diterima di tanah lapang", () => {
  const d = { jalan: [J(1, [[0, 0], [200, 0]], [1, 2], { w: 8 })], air: [{ id: 9, k: "river", p: [[0, 100], [200, 100]], poly: 0, t: 0 }, { id: 10, k: "lake", poly: 1, p: [[300, 300], [360, 300], [360, 360], [300, 360]] }],
    bangunan: [{ id: 5, p: [[50, 40], [70, 40], [70, 60], [50, 60]] }] };
  const S = L.sediaLot(d);
  assert.deepEqual(L.semakLot(S, 100, 2, 3).sebab, ["menghalang jalan"]);
  assert.deepEqual(L.semakLot(S, 100, 104, 3).sebab, ["dalam sungai"]);
  assert.deepEqual(L.semakLot(S, 330, 330, 3).sebab, ["dalam tasik/kolam"]);
  assert.deepEqual(L.semakLot(S, 60, 50, 3).sebab, ["bertindih bangunan"]);
  assert.ok(L.semakLot(S, 120, 50, 3).ok, "tanah lapang antara jalan dan sungai");
});
