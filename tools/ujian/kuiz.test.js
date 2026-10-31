/* Ujian v18.40: tiket kenderaan 1 soalan, had kuiz Stesen Ilmu 30 sehari, semua subjek dibuka. Jalankan: node --test tools/ujian/kuiz.test.js */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const D = fs.readFileSync(path.join(__dirname, "../../dunia.js"), "utf8"), A = fs.readFileSync(path.join(__dirname, "../../app.js"), "utf8");

test("semua kenderaan awam: tiket 1 soalan, tiada tambang MD", () => {
  const t = D.slice(D.indexOf("function lmTiket(o)"), D.indexOf("const KZ_HAD"));
  assert.match(t, /pass: 1, qs: lmPickQs\(\[\], 1\)/);
  const rail = D.slice(D.indexOf("function lmRailOpen("), D.indexOf("function lmRailPick("));
  assert.match(rail, /lmTiket\(/); assert.doesNotMatch(rail, /pass: 3|lmPickQs\(\[\], 5\)/, "tiada lagi kuiz 5 soalan untuk tiket");
  const tx = D.slice(D.indexOf("function lmTaksiOpen("), D.indexOf("/* kad: pulau */"));
  assert.doesNotMatch(tx, /P\.coin = \(P\.coin \| 0\) - /, "teksi tidak menolak MD");
  assert.match(tx, /lmTiket\(/);
  assert.match(D.slice(D.indexOf("function lmFerryOpen("), D.indexOf("function lmHorn(")), /lmTiket\(/);
});

/* logik had harian dijalankan dalam kotak pasir dengan localStorage olok-olok */
function kotak(now) {
  const store = {}, localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } };
  const src = D.slice(D.indexOf("const KZ_HAD"), D.indexOf("function lmKuizInfo"));
  const Date2 = class extends Date { static now() { return now; } };
  return new Function("localStorage", "Date", src + "; return { KZ_HAD, KZ_MD, lmKuizHari, lmKuizBaki, lmKuizKira };")(localStorage, Date2);
}
test("v18.41: had 30 soalan sehari bagi SETIAP stesen; stesen lain tidak terjejas", () => {
  const K = kotak(Date.UTC(2026, 9, 31, 10));
  assert.equal(K.KZ_HAD, 30); assert.equal(K.KZ_MD, 2);
  assert.equal(K.lmKuizBaki("si-a"), 30);
  K.lmKuizKira("si-a", 28); assert.equal(K.lmKuizBaki("si-a"), 2);
  K.lmKuizKira("si-a", 5); assert.equal(K.lmKuizBaki("si-a"), 0, "tidak melebihi had");
  assert.equal(K.lmKuizBaki("si-b"), 30, "stesen lain masih penuh");
});
test("Stesen Ilmu: soalan dihadkan kepada baki harian; MD setiap jawapan betul", () => {
  const f = D.slice(D.indexOf("function lmIlmuTopic("), D.indexOf("function lmIlmuTopic(") + 600);
  assert.match(f, /Math\.min\(5, lmKuizBaki\(it\.id\)\)/); assert.match(f, /lmKuizHad\(it\)/); assert.match(f, /md: KZ_MD, harian: it\.id/);
  const q = D.slice(D.indexOf("function lmQuiz(opt)"), D.indexOf("function lmQuiz(opt)") + 2000);
  assert.match(q, /if \(good && opt\.md\) lmMdFx\(opt\.md, bt\)/); assert.match(q, /if \(opt\.harian\) lmKuizKira\(opt\.harian, 1\)/);
});
test("semua subjek dibuka; tukar subjek dengan kesan verse", () => {
  const m = A.match(/const SJ_OPEN = \{([^}]*)\}/)[1];
  for (const k of ["tw", "pi", "p3", "ba", "sj", "sc", "mt", "bm", "bi"]) assert.match(m, new RegExp("\\b" + k + ": 1"));
  const s = A.slice(A.indexOf("function setSubject(k)"), A.indexOf("function sjVerse("));
  assert.match(s, /mdWarp\(go, "MENUJU " \+ sjVerse\(k\), SJ_HUE\[k\]\)/);
});

test("tiada MD berganda: kuiz Stesen Ilmu tidak memanggil gdCoin melalui lrnRec", () => {
  assert.match(A, /if \(ok && src !== "tm" && src !== "lmmd"\) gdCoin\(2\)/);
  assert.match(D, /lrnRec\(it\.q, good, opt\.md \? "lmmd" : "lm"\)/);
});
