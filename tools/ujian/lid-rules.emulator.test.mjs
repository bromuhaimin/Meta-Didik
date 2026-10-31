/* Ujian Firebase Rules Meta Didik ID dengan Firebase Emulator (dijalankan oleh pembangun, bukan dalam pelayar).
   Persediaan (sekali):  npm i -D @firebase/rules-unit-testing firebase   dan   npm i -g firebase-tools
   Jalankan:             RULES=docs/firebase-rules-lengkap-ketat.json firebase emulators:exec --only database "node --test tools/ujian/lid-rules.emulator.test.mjs"
   Ulang dengan RULES=docs/firebase-rules-lengkap-percubaan.json untuk mod percubaan. */
import test, { before, after, beforeEach } from "node:test";
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { ref, get, set, serverTimestamp } from "firebase/database";

const RULES = process.env.RULES || "docs/firebase-rules-lengkap-ketat.json";
const KETAT = /ketat/.test(RULES);
let env;
const rekod = (o) => Object.assign({ v: 1, cipta: 1, kemas: 1, peranan: { murid: { st: "aktif", dari: "2026-01", sumber: "sendiri" } }, privasi: { awam: false, papar: { pasport: false } } }, o);

before(async () => { env = await initializeTestEnvironment({ projectId: "meta-didik-ujian", database: { rules: readFileSync(RULES, "utf8"), host: "127.0.0.1", port: 9000 } }); });
after(async () => { await env.cleanup(); });
beforeEach(async () => { await env.clearDatabase(); });
const db = (uid) => (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).database();

test("pemilik boleh tulis dan baca lid/<uid> sendiri", async () => {
  await assertSucceeds(set(ref(db("aisyah"), "lid/aisyah"), rekod()));
  await assertSucceeds(get(ref(db("aisyah"), "lid/aisyah")));
});
test("profil murid tidak boleh dibaca orang lain atau tanpa log masuk", async () => {
  await env.withSecurityRulesDisabled((c) => set(ref(c.database(), "lid/aisyah"), rekod()));
  await assertFails(get(ref(db("ali"), "lid/aisyah")));
  await assertFails(get(ref(db(null), "lid/aisyah")));
  await assertFails(get(ref(db("ali"), "lid")));
});
test("tidak boleh tulis lid orang lain", async () => { await assertFails(set(ref(db("ali"), "lid/aisyah"), rekod())); });
test("tidak boleh naik taraf sendiri: mentor aktif, guru, pentadbir, sumber palsu, ijazah disahkan, profil awam", async () => {
  const d = db("aisyah"), p = ref(d, "lid/aisyah");
  await assertFails(set(p, rekod({ peranan: { mentor: { st: "aktif" } } })));
  await assertFails(set(p, rekod({ peranan: { guru: { st: "aktif" } } })));
  await assertFails(set(p, rekod({ peranan: { pentadbir: { st: "aktif" } } })));
  await assertFails(set(p, rekod({ peranan: { alumni: { st: "aktif", sumber: "pentadbir" } } })));
  await assertFails(set(p, rekod({ pendidikan: { e1: { nama: "UM", sah: "sah" } } })));
  await assertFails(set(p, rekod({ privasi: { awam: true } })));
  await assertSucceeds(set(p, rekod({ peranan: { alumni: { st: "aktif", sumber: "sendiri" }, mentor: { st: "tunggu", sumber: "mohon" } } })));
});
test("lid_sah hanya ditulis pentadbir", async () => {
  await assertFails(set(ref(db("aisyah"), "lid_sah/aisyah/alumni"), { st: "sah" }));
  await env.withSecurityRulesDisabled((c) => set(ref(c.database(), "lid_sah/aisyah/alumni"), { st: "sah" }));
  await assertSucceeds(get(ref(db("aisyah"), "lid_sah/aisyah")));
  if (KETAT) await assertFails(get(ref(db("ali"), "lid_sah/aisyah")));
});
test("lid_mohon: cipta sahaja, tidak boleh baca, ubah atau tandakan status sendiri", async () => {
  const d = db("aisyah"), p = ref(d, "lid_mohon/aisyah/alumni1");
  await assertSucceeds(set(p, { jenis: "alumni", t: serverTimestamp(), sekolah: "SMK Ujian" }));
  await assertFails(set(p, { jenis: "alumni", t: serverTimestamp() }));
  await assertFails(set(ref(d, "lid_mohon/aisyah/x2"), { jenis: "alumni", t: serverTimestamp(), st: "disahkan" }));
  await assertFails(set(ref(d, "lid_mohon/aisyah/x3"), { jenis: "pentadbir", t: serverTimestamp() }));
  await assertFails(get(ref(d, "lid_mohon/aisyah")));
  if (KETAT) await assertFails(set(ref(db("ali"), "lid_mohon/aisyah/x4"), { jenis: "padam", t: serverTimestamp() }));
});
