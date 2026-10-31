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
