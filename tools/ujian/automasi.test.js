/* Ujian v18.41: automasi penaja/inovasi, guru wajib DELIMa, pendaftaran 3 jenis, situasi sivik, azan negeri. Jalankan: node --test tools/ujian/automasi.test.js */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const D = fs.readFileSync(path.join(__dirname, "../../dunia.js"), "utf8"), A = fs.readFileSync(path.join(__dirname, "../../app.js"), "utf8"), H = fs.readFileSync(path.join(__dirname, "../../index.html"), "utf8");

test("guru wajib DELIMa: kod guru 1991 tidak lagi membuka akses", () => {
  assert.match(A, /const GURU_DELIMA_WAJIB = true;/);
  assert.match(A, /function guruKod\(\) \{ return !GURU_DELIMA_WAJIB &&/);
  assert.match(A, /function stnTrial\(\) \{ return !GURU_DELIMA_WAJIB &&/);
});
test("inovasi: booth 'tunggu' terus kelihatan, ikut subjek, dibina semula bila status berubah, sinar emas", () => {
  const f = D.slice(D.indexOf("function lmStnGeo("), D.indexOf("function lmStnOpen("));
  assert.match(f, /\(d\.sj \|\| "tw"\) === SUBJ && \(d\.st === "lulus" \|\| d\.st === "tunggu"\)/);
  assert.match(f, /want\[id\]\.st !== g\.stnG\[id\]\.d\.st/);
  assert.match(f, /lmBeam\("#ffcf3a"/);
});
test("automasi: semakan berkala inovasi dan penaja dalam dunia; papan iklan penaja di lapangan terbang/terminal", () => {
  assert.match(D, /setInterval\(\(\) => \{ if \(LM\.g !== g \|\| !LM\.on\)[\s\S]{0,200}lmStnFetch\(g\)[\s\S]{0,200}lmPjFetch\(g\)/);
  assert.match(D, /it\.kind === "ap" \|\| it\.kind === "bt"/);
  assert.match(A, /setInterval\(\(\) => \{ if \(!document\.hidden && !\(window\.LMX && window\.LMX\.on\)\) \{ try \{ pjMuat\(\);/);
});
test("Stesen Ilmu: sinar hijau, gelap/bercahaya pada peta, navigasi ke stesen seterusnya", () => {
  assert.match(D, /lmBeam\("#46ff8c"/);
  assert.match(D, /function lmSiGelap\(it\)/); assert.match(D, /function lmSiPergi\(x\)/);
  assert.match(D, /case "si": \{ const gl = lmSiGelap\(it\)/);
});
test("Menara Tabung Haji: model khas untuk stesen si-th", () => {
  assert.match(D, /function lmTabungHaji\(\)/); assert.match(D, /id === "si-th", md = th \? lmTabungHaji\(\) : lmIlmuModel\(col\)/);
});
test("pendaftaran 3 jenis: Murid, Pelawat, Guru; pelawat tiada sekolah", () => {
  for (const v of ["murid", "pelawat", "guru"]) assert.match(H, new RegExp('name="inRole" value="' + v + '"'));
  assert.match(A, /function mySid\(\) \{ return P\.pelawat \? "" :/);
});
test("situasi sivik baharu dengan lencana dan MD tetap", () => {
  const ids = [...D.matchAll(/\{ id: "([a-z]+)", sv: 1,/g)].map((m) => m[1]);
  assert.ok(ids.length >= 8, "sekurang-kurangnya 8 situasi sivik: " + ids.join(","));
  assert.match(D, /\["svAll", "🛡", "Jati Diri Malaysia"/); assert.match(D, /const coin = it\.S\.sv \? 5 : 3;/);
});
test("azan ikut negeri profil; makluman menyebut kawasan; tapak kaki diperlahankan", () => {
  assert.match(D, /const SOLAT_NEGERI = \{ JHR:/); assert.match(D, /"🕌 Telah masuk waktu " \+ nama \+ " bagi kawasan " \+ ref\.n/);
  assert.match(D, /hard \? 0\.13 : 0\.17, 0\.004/);
});
