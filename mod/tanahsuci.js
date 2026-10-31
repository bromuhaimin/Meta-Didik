/* =====================================================================
   TANAH SUCI (v18.18): penerbangan Umrah/Haji dari KLIA ke Jeddah dan dunia 3D Makkah serta Madinah
   berdasarkan ketinggian muka bumi sebenar (jubin Terrarium/SRTM, tanahsuci-dem.bin).
   Skala mendatar sebenar 30 unit = 1 km (ketinggian dibesarkan 2.2 kali); mercu tanda dibesarkan supaya jelas.
   Setiap rukun/wajib dilaksanakan di lokasi sebenar dengan menjalankan SATU peringkat simulasi haji (mod/prak.js).
   Dimuat apabila murid memilih penerbangan Umrah/Haji di KLIA dalam META DIDIK (dunia.js).
   Bergantung pada global: THREE, AV3, el, toast, hjOpen, shuffle.
   ===================================================================== */
(function () {
"use strict";
const T = window.THREE;
const KU = 30, VY = 0.066; /* unit per km; unit per meter ketinggian (dibesarkan) */
const REG = {
  makkah: { la0: 21.25, la1: 21.80, lo0: 39.10, lo1: 40.05, st: 0.002, nx: 476, nz: 276, o: 0, latc: 21.5, nm: "Wilayah Makkah" },
  madinah: { la0: 24.36, la1: 24.60, lo0: 39.48, lo1: 39.76, st: 0.0015, nx: 188, nz: 161, o: 131376, latc: 24.48, nm: "Madinah" }
};
/* lokasi sebenar [id, wilayah, nama, lat, lon, jenis] */
const SITES = [
  ["jed", "makkah", "Terminal Haji, Lapangan Terbang King Abdulaziz Jeddah", 21.6890, 39.1700, "airport"],
  ["kaabah", "makkah", "Masjidil Haram (Kaabah)", 21.4225, 39.8262, "haram"],
  ["masa", "makkah", "Mas'a: Bukit Safa dan Marwah", 21.4225, 39.8332, "masa"], /* di sisi timur Haram (Haram dibesarkan) */
  ["aziziyah", "makkah", "Penginapan Jemaah Malaysia, Aziziyah", 21.4100, 39.8560, "hotel"],
  ["mina", "makkah", "Mina dan Jamrah", 21.4229, 39.8732, "mina"],
  ["muzdalifah", "makkah", "Muzdalifah (Masy'aril Haram)", 21.3836, 39.9365, "muzdalifah"],
  ["arafah", "makkah", "Padang Arafah (Jabal Rahmah)", 21.3549, 39.9842, "arafah"],
  ["namirah", "makkah", "Masjid Namirah", 21.3510, 39.9660, "masjid"],
  ["tanim", "makkah", "Masjid Tan'im (Masjid Aisyah)", 21.4655, 39.7783, "masjid"],
  ["hira", "makkah", "Jabal Nur (Gua Hira')", 21.4575, 39.8592, "gunung"],
  ["thur", "makkah", "Jabal Thur (Gua Thur)", 21.3770, 39.8500, "gunung"],
  ["mala", "makkah", "Perkuburan Ma'la", 21.4300, 39.8300, "kubur"],
  ["kiswah", "makkah", "Kompleks Kiswah", 21.4140, 39.7820, "bangunan"],
  ["jiranah", "makkah", "Masjid Ji'ranah", 21.5636, 40.0242, "masjid"],
  ["khaif", "makkah", "Masjid al-Khaif (Mina)", 21.4166, 39.8889, "masjid"],
  ["hrmk", "makkah", "Stesen Kereta Api Laju Haramain, Makkah", 21.4010, 39.7960, "stesen"],
  ["nabawi", "madinah", "Masjid Nabawi", 24.4672, 39.6112, "nabawi"],
  ["baqi", "madinah", "Perkuburan Baqi'", 24.4675, 39.6152, "kubur"],
  ["quba", "madinah", "Masjid Quba'", 24.4393, 39.6173, "masjid"],
  ["qiblatain", "madinah", "Masjid Qiblatain", 24.4840, 39.5790, "masjid"],
  ["khandaq", "madinah", "Khandaq (Masjid Tujuh)", 24.4767, 39.5960, "masjid"],
  ["uhud", "madinah", "Jabal Uhud (Makam Syuhada)", 24.5040, 39.6130, "gunung"],
  ["birali", "madinah", "Bir Ali (Miqat Dhul Hulaifah)", 24.4136, 39.5436, "masjid"],
  ["hrmd", "madinah", "Stesen Kereta Api Laju Haramain, Madinah", 24.5540, 39.6915, "stesen"],
  ["med", "madinah", "Lapangan Terbang Prince Mohammad bin Abdulaziz, Madinah", 24.5534, 39.7051, "airport"]
];
/* peringkat simulasi -> lokasi; ziarah: peringkat mod zmakkah / zmadinah */
const STAGE_AT = { miqat: "jed", tawaf: "kaabah", ifadah: "kaabah", wada: "kaabah", saie: "masa", saiehaji: "masa", ihramhaji: "aziziyah", arafah: "arafah", muzdalifah: "muzdalifah", mina: "mina", tasyrik: "mina", tanim: "tanim" };
const ZIARAH = { hira: ["zmakkah", "hira"], thur: ["zmakkah", "thur"], mala: ["zmakkah", "mala"], arafah: ["zmakkah", "rahmah"], kiswah: ["zmakkah", "kiswah"], jiranah: ["zmakkah", "jiranah"], tanim: ["zmakkah", "tanim"], muzdalifah: ["zmakkah", "masyar"], khaif: ["zmakkah", "khaif"],
  nabawi: ["zmadinah", "nabawi"], baqi: ["zmadinah", "baqi"], quba: ["zmadinah", "quba"], qiblatain: ["zmadinah", "qiblatain"], khandaq: ["zmadinah", "khandaq"], uhud: ["zmadinah", "uhud"] };
/* urutan manasik setiap mod (sama seperti HJ_*_ST dalam mod/prak.js) */
const ITIN = {
  umrah: { n: "Umrah", st: [["miqat", "Ihram dan niat di miqat (dalam pesawat)"], ["tawaf", "Tawaf umrah"], ["saie", "Saie dan bercukur/bergunting"]] },
  ifrad: { n: "Haji Ifrad", st: [["miqat", "Ihram haji di miqat"], ["tawaf", "Tawaf qudum"], ["saie", "Saie haji"], ["arafah", "Wuquf di Arafah (9 Zulhijjah)"], ["muzdalifah", "Mabit di Muzdalifah"], ["mina", "Melontar Jamrah Aqabah dan bercukur"], ["ifadah", "Tawaf ifadah"], ["tasyrik", "Melontar tiga jamrah (hari tasyrik)"], ["tanim", "Umrah dari Tan'im"], ["wada", "Tawaf wada'"]] },
  qiran: { n: "Haji Qiran", st: [["miqat", "Niat haji dan umrah di miqat"], ["tawaf", "Tawaf qudum"], ["saie", "Saie haji dan umrah"], ["arafah", "Wuquf di Arafah (9 Zulhijjah)"], ["muzdalifah", "Mabit di Muzdalifah"], ["mina", "Melontar Jamrah Aqabah, dam dan bercukur"], ["ifadah", "Tawaf ifadah"], ["tasyrik", "Melontar tiga jamrah (hari tasyrik)"], ["wada", "Tawaf wada'"]] },
  tamattuk: { n: "Haji Tamattuk", st: [["miqat", "Ihram umrah di miqat"], ["tawaf", "Tawaf umrah"], ["saie", "Saie umrah dan tahallul"], ["ihramhaji", "Ihram haji di penginapan (8 Zulhijjah)"], ["arafah", "Wuquf di Arafah (9 Zulhijjah)"], ["muzdalifah", "Mabit di Muzdalifah"], ["mina", "Melontar Jamrah Aqabah, dam dan bercukur"], ["ifadah", "Tawaf ifadah"], ["saiehaji", "Saie haji"], ["tasyrik", "Melontar tiga jamrah (hari tasyrik)"], ["wada", "Tawaf wada'"]] }
};
const TS = { on: false, root: null, ui: {}, g: null, dem: null, keys: {}, js: { id: -1, x: 0, y: 0, cx: 0, cy: 0 }, drag: { id: -1, x: 0, y: 0 }, raf: 0, opt: null, pr: null, sim: false };
const SAVE = "gt-ts";
function tsLoad(mode) { let d = null; try { d = JSON.parse(localStorage.getItem(SAVE) || "null"); } catch (e) { d = null; } return d && d.mode === mode ? d : { mode: mode, i: 0, sc: [], zr: {}, t0: Date.now() }; }
function tsSave() { try { localStorage.setItem(SAVE, JSON.stringify(TS.pr)); } catch (e) { /* abaikan */ } }
const clampN = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- data ketinggian ---------- */
async function tsDem() {
  if (TS.dem) return TS.dem;
  const r = await fetch("tanahsuci-dem.bin?v=" + (typeof APP_VER !== "undefined" ? APP_VER : "1"));
  if (!r.ok) throw new Error("dem");
  TS.dem = new Int16Array(await r.arrayBuffer()); return TS.dem;
}
function hRaw(R, lat, lon) {
  const fx = (lon - R.lo0) / R.st, fz = (R.la1 - lat) / R.st;
  const i = clampN(Math.floor(fx), 0, R.nx - 2), j = clampN(Math.floor(fz), 0, R.nz - 2), u = clampN(fx - i, 0, 1), v = clampN(fz - j, 0, 1), D = TS.dem, o = R.o + j * R.nx + i;
  return (D[o] * (1 - u) + D[o + 1] * u) * (1 - v) + (D[o + R.nx] * (1 - u) + D[o + R.nx + 1] * u) * v;
}
function toW(R, lat, lon) { return { x: (lon - R.lo0) * Math.cos(R.latc * Math.PI / 180) * 111.32 * KU, z: (R.la1 - lat) * 110.57 * KU }; }
function toLL(R, x, z) { return { lat: R.la1 - z / (110.57 * KU), lon: R.lo0 + x / (Math.cos(R.latc * Math.PI / 180) * 111.32 * KU) }; }
/* tapak rata di bawah mercu tanda: { x, z, r, y } dengan peralihan 14 unit */
function padY(pads, x, z, y) { for (const p of pads) { const d = Math.hypot(x - p.x, z - p.z); if (d < p.r) return p.y; if (d < p.r + 14) { const t = (d - p.r) / 14; y = p.y + (y - p.y) * t * t * (3 - 2 * t); } } return y; }
function gnd(x, z) { const g = TS.g, q = toLL(g.R, x, z); return padY(g.pads || [], x, z, Math.max(0, hRaw(g.R, q.lat, q.lon)) * VY); }
function isSea(x, z) { const g = TS.g, q = toLL(g.R, x, z); return hRaw(g.R, q.lat, q.lon) <= 1; }

/* ---------- utiliti 3D ---------- */
const MAT = {}, GEO = {};
function mat(c, o) { const k = c + (o ? JSON.stringify(o) : ""); return MAT[k] || (MAT[k] = new T.MeshLambertMaterial(Object.assign({ color: c }, o || {}))); }
function box(w, h, d) { const k = "b" + w + "," + h + "," + d; return GEO[k] || (GEO[k] = new T.BoxGeometry(w, h, d)); }
function cyl(a, b, h, n) { const k = "c" + a + "," + b + "," + h + "," + n; return GEO[k] || (GEO[k] = new T.CylinderGeometry(a, b, h, n || 12)); }
function mesh(geo, col, x, y, z) { const m = new T.Mesh(geo, typeof col === "string" ? mat(col) : col); m.position.set(x || 0, y || 0, z || 0); m.castShadow = true; m.receiveShadow = true; return m; }
function dome(g, r, col, x, y, z) { const m = new T.Mesh(new T.SphereGeometry(r, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat(col)); m.position.set(x, y, z); g.add(m); return m; }
function minaret(g, x, z, h, col) { g.add(mesh(cyl(0.45, 0.6, h, 10), col || "#f1ede4", x, h / 2, z)); g.add(mesh(cyl(0.75, 0.75, 0.4, 10), "#d9cfb8", x, h * 0.72, z)); g.add(mesh(new T.ConeGeometry(0.5, 2, 10), "#c9a64a", x, h + 1, z)); }
function label(text, bg, bd) {
  const c = document.createElement("canvas"), x = c.getContext("2d"), fs = 30; x.font = "800 " + fs + "px Nunito, sans-serif";
  const w = Math.min(1000, Math.ceil(x.measureText(text).width) + 28), h = fs + 20; c.width = w; c.height = h;
  x.font = "800 " + fs + "px Nunito, sans-serif"; x.fillStyle = bg || "rgba(10,40,30,.86)"; x.beginPath(); if (x.roundRect) x.roundRect(2, 2, w - 4, h - 4, 14); else x.rect(2, 2, w - 4, h - 4); x.fill();
  x.lineWidth = 4; x.strokeStyle = bd || "#ffd45a"; x.stroke(); x.fillStyle = "#fff"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, w / 2, h / 2 + 1);
  const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), transparent: true })); sp.scale.set(w * 0.032, h * 0.032, 1); sp.renderOrder = 5; return sp;
}

/* ---------- mercu tanda (dibesarkan supaya jelas) ---------- */
function mHaram() {
  const g = new T.Group(), W = "#f3efe6", M = "#e9e4d8";
  g.add(mesh(cyl(9, 9, 0.3, 40), "#fbfaf6", 0, 0.15, 0));                                   /* mataf marmar putih */
  const k = mesh(box(2.4, 2.8, 2.4), "#111114", 0, 1.7, 0); g.add(k); g.add(mesh(box(2.46, 0.35, 2.46), "#c9a64a", 0, 2.45, 0)); /* Kaabah, kiswah dan tali emas */
  g.add(mesh(box(0.5, 0.6, 0.06), "#c9a64a", 0.6, 1.0, 1.23));                              /* pintu Kaabah */
  for (const [x, z, w, d] of [[0, -14, 30, 4], [0, 14, 30, 4], [-14, 0, 4, 30], [14, 0, 4, 30]]) { g.add(mesh(box(w, 5, d), W, x, 2.5, z)); g.add(mesh(box(w + 0.4, 0.5, d + 0.4), M, x, 5.2, z)); }
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; g.add(mesh(box(0.6, 3.6, 0.6), "#d8cfbc", Math.cos(a) * 11.5, 1.8, Math.sin(a) * 11.5)); } /* tiang serambi */
  [[-16, -16], [16, -16], [-16, 16], [16, 16], [0, -16.5], [0, 16.5], [-16.5, 0]].forEach(([x, z]) => minaret(g, x, z, 16));
  /* Abraj al-Bait (menara jam) di selatan */
  g.add(mesh(box(12, 8, 8), "#d9d2c1", 0, 4, 26)); g.add(mesh(box(5, 34, 5), "#e6dfcf", 0, 17, 26)); g.add(mesh(box(5.4, 5.4, 5.4), "#1f6e43", 0, 31, 26));
  for (const [x, z, rx, rz] of [[0, 23.25, Math.PI / 2, 0], [0, 28.75, Math.PI / 2, 0], [2.75, 26, 0, Math.PI / 2], [-2.75, 26, 0, Math.PI / 2]]) { const c = mesh(cyl(1.8, 1.8, 0.2, 24), "#fffbe8", x, 31, z); c.rotation.x = rx; c.rotation.z = rz; g.add(c); } /* empat muka jam */
  g.add(mesh(cyl(0.6, 2, 8, 12), "#c9a64a", 0, 38, 26)); g.add(mesh(new T.ConeGeometry(0.3, 4, 8), "#c9a64a", 0, 44, 26));
  return g;
}
function mMasa() { const g = new T.Group(); g.add(mesh(box(5, 0.2, 22), "#f6f3ec", 0, 0.1, 0)); for (let i = 0; i < 6; i++) for (const x of [-2.3, 2.3]) g.add(mesh(box(0.35, 4.4, 0.35), "#e9e4d8", x, 2.2, -10 + i * 4)); g.add(mesh(box(5.4, 0.5, 22.4), "#d8cfbc", 0, 4.6, 0)); /* serambi Mas'a bertiang */ g.add(mesh(new T.ConeGeometry(1.4, 1.6, 8), "#a49a88", 0, 0.8, -11.5)); g.add(mesh(new T.ConeGeometry(1.4, 1.6, 8), "#a49a88", 0, 0.8, 11.5)); return g; }
function mMina() {
  const g = new T.Group();
  g.add(mesh(box(40, 3, 6), "#d7d0c2", 0, 1.5, 0)); g.add(mesh(box(40, 0.4, 6.4), "#bcb4a3", 0, 3.2, 0)); g.add(mesh(box(40, 3, 6), "#d7d0c2", 0, 4.7, 0)); /* jambatan Jamrah bertingkat */
  for (const x of [-14, 0, 14]) { g.add(mesh(box(2.6, 9, 1.2), "#bfb8a8", x, 4.5, 0)); g.add(mesh(cyl(2.4, 2.4, 0.3, 20), "#8b8270", x, 3.3, 0)); }
  return g;
}
function mTents(g, R, la0, la1, lo0, lo1, n) {
  const pos = [], rnd = (a) => { const s = Math.sin(a * 12.9898) * 43758.5453; return s - Math.floor(s); };
  for (let i = 0; pos.length < n && i < n * 6; i++) {
    const lat = la0 + rnd(i * 2 + 1) * (la1 - la0), lon = lo0 + rnd(i * 2 + 2) * (lo1 - lo0), h = hRaw(R, lat, lon), h2 = hRaw(R, lat + 0.001, lon), h3 = hRaw(R, lat, lon + 0.001);
    if (Math.abs(h - h2) > 9 || Math.abs(h - h3) > 9 || h > 430) continue; pos.push(toW(R, lat, lon));
  }
  const im = new T.InstancedMesh(new T.ConeGeometry(0.75, 1.1, 4), mat("#fbfaf6"), pos.length), m4 = new T.Matrix4(), q = new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 1, 0), Math.PI / 4), s = new T.Vector3(1, 1, 1);
  pos.forEach((p, i) => { m4.compose(new T.Vector3(p.x, gnd(p.x, p.z) + 0.55, p.z), q, s); im.setMatrixAt(i, m4); });
  im.receiveShadow = true; g.add(im);
}
function mArafah() { const g = new T.Group(); g.add(mesh(cyl(0.5, 0.7, 6, 10), "#fbfaf6", 0, 3, 0)); g.add(mesh(cyl(4, 6, 0.6, 16), "#cbb894", 0, 0.3, 0)); return g; }
function mMasjid(sz, col, dcol, nm) { const g = new T.Group(); g.add(mesh(box(sz, sz * 0.32, sz), col || "#f1ede4", 0, sz * 0.16, 0)); dome(g, sz * 0.28, dcol || "#e9e4d8", 0, sz * 0.32, 0); for (let i = 0; i < (nm || 2); i++) minaret(g, (i % 2 ? 1 : -1) * sz * 0.55, (i < 2 ? 1 : -1) * sz * 0.55, sz * 0.9); return g; }
function mNabawi() {
  const g = new T.Group();
  g.add(mesh(box(30, 4.5, 36), "#f3efe6", 0, 2.25, 0)); g.add(mesh(box(30.4, 0.5, 36.4), "#d8cfbc", 0, 4.6, 0));
  dome(g, 2.6, "#2d8a4e", 3, 4.8, -10);                                                                /* Kubah Hijau */
  for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) { const u = mesh(new T.ConeGeometry(1.6, 0.6, 8), "#fbfaf6", -12 + i * 4.8, 6, 20 + j * 3.4); g.add(u); g.add(mesh(cyl(0.08, 0.08, 1.4, 6), "#d8cfbc", -12 + i * 4.8, 5.4, 20 + j * 3.4)); } /* payung piazza */
  [[-15, -18], [15, -18], [-15, 18], [15, 18], [-15, 0], [15, 0]].forEach(([x, z]) => minaret(g, x, z, 18));
  return g;
}
function mAirport(hajj) {
  const g = new T.Group();
  g.add(mesh(box(90, 0.1, 7), "#3b3d42", 0, 0.05, -18));
  if (hajj) for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) { const c = new T.Mesh(new T.ConeGeometry(3.2, 4.4, 4, 1, true), new T.MeshLambertMaterial({ color: 0xfbfaf6, side: T.DoubleSide })); c.position.set(-16 + i * 8, 6.6, j * 8); c.rotation.y = Math.PI / 4; g.add(c); g.add(mesh(cyl(0.18, 0.18, 4.4, 6), "#9aa3ad", -16 + i * 8, 2.2, j * 8)); } /* bumbung khemah Terminal Haji */
  else g.add(mesh(box(30, 4, 10), "#e5e2dc", 0, 2, 6));
  const pl = new T.Group(); pl.add(mesh(cyl(0.9, 0.9, 12, 12), "#f4f6f8", 0, 1.6, 0)); pl.children[0].rotation.z = Math.PI / 2; pl.add(mesh(box(2, 0.2, 14), "#f4f6f8", 0, 1.4, 0)); pl.add(mesh(box(0.2, 2.4, 1.6), "#1f6e43", -5.6, 3, 0)); pl.position.set(10, 0, -10); g.add(pl);
  return g;
}
function mStation() { const g = new T.Group(); g.add(mesh(box(26, 0.6, 6), "#d8d2c4", 0, 0.3, 0)); for (let i = 0; i < 5; i++) { const a = mesh(box(4.6, 0.4, 7), "#c9a64a", -10 + i * 5, 5, 0); a.rotation.x = 0.15; g.add(a); g.add(mesh(box(0.3, 4.6, 0.3), "#9aa3ad", -10 + i * 5, 2.6, 2.6)); } g.add(mesh(box(26, 1.6, 2.4), "#c43b3b", 0, 1.4, -3.8)); return g; }
function mKubur() { const g = new T.Group(); g.add(mesh(box(14, 1.4, 0.4), "#d8cfbc", 0, 0.7, -7)); g.add(mesh(box(14, 1.4, 0.4), "#d8cfbc", 0, 0.7, 7)); g.add(mesh(box(0.4, 1.4, 14), "#d8cfbc", -7, 0.7, 0)); g.add(mesh(box(0.4, 1.4, 14), "#d8cfbc", 7, 0.7, 0)); for (let i = 0; i < 30; i++) g.add(mesh(box(0.3, 0.2, 0.6), "#a49a88", -6 + (i % 6) * 2.4, 0.1, -5 + Math.floor(i / 6) * 2.4)); return g; }
function mHotel() { const g = new T.Group(); for (let i = 0; i < 3; i++) g.add(mesh(box(4, 8 + i * 3, 4), "#e6dfcf", -5 + i * 5, (8 + i * 3) / 2, 0)); return g; }
function mGunung() { const g = new T.Group(); g.add(mesh(cyl(0.15, 0.15, 3, 6), "#8a6238", 0, 1.5, 0)); return g; }
function siteModel(kind) {
  return kind === "haram" ? mHaram() : kind === "masa" ? mMasa() : kind === "mina" ? mMina() : kind === "arafah" ? mArafah() : kind === "nabawi" ? mNabawi() : kind === "airport" ? mAirport(true) : kind === "stesen" ? mStation()
    : kind === "kubur" ? mKubur() : kind === "hotel" ? mHotel() : kind === "gunung" ? mGunung() : kind === "muzdalifah" ? mMasjid(6, "#efe9dc", "#e9e4d8", 2) : kind === "bangunan" ? mHotel() : mMasjid(7, "#f1ede4", "#e9e4d8", 2);
}
/* bangunan bandar di sekeliling Haram / Nabawi */
function mCity(g, R, clat, clon, rKm, n, avoidR, tall) {
  const im = new T.InstancedMesh(box(1, 1, 1), mat("#e6dfcf"), n), m4 = new T.Matrix4(), q = new T.Quaternion(), s = new T.Vector3(), c = toW(R, clat, clon); let k = 0;
  for (let i = 0; i < n * 4 && k < n; i++) {
    const a = Math.random() * Math.PI * 2, d = avoidR + Math.sqrt(Math.random()) * rKm * KU, x = c.x + Math.cos(a) * d, z = c.z + Math.sin(a) * d, q2 = toLL(R, x, z), h = hRaw(R, q2.lat, q2.lon);
    if (h <= 2 || Math.abs(hRaw(R, q2.lat + 0.0015, q2.lon) - h) > 25) continue;
    const w = 2 + Math.random() * 3, hh = 3 + Math.random() * (d < avoidR + 30 ? (tall == null ? 14 : tall) : 6); m4.compose(new T.Vector3(x, gnd(x, z) + hh / 2 - 0.3, z), q.setFromAxisAngle(new T.Vector3(0, 1, 0), Math.random()), s.set(w, hh, w * (0.7 + Math.random() * 0.6))); im.setMatrixAt(k++, m4);
  }
  im.count = k; im.castShadow = true; im.receiveShadow = true; g.add(im);
}

/* ---------- rupa bumi ---------- */
function terrain(g, R) {
  const step = R.nx > 300 ? 2 : 1, nx = Math.floor((R.nx - 1) / step) + 1, nz = Math.floor((R.nz - 1) / step) + 1, pos = new Float32Array(nx * nz * 3), col = new Float32Array(nx * nz * 3), idx = [];
  const sand = new T.Color("#dcc89c"), rock = new T.Color("#8f7a62"), dark = new T.Color("#5f5248"), city = new T.Color("#e3dccb"), c = new T.Color();
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const lat = R.la1 - j * step * R.st, lon = R.lo0 + i * step * R.st, h = TS.dem[R.o + j * step * R.nx + i * step], w = toW(R, lat, lon), k = j * nx + i;
    pos[k * 3] = w.x; pos[k * 3 + 1] = h <= 0 ? -1.2 : padY(TS.g.pads, w.x, w.z, h * VY); pos[k * 3 + 2] = w.z;
    const hx = TS.dem[R.o + j * step * R.nx + Math.min(R.nx - 1, i * step + 1)], hz = TS.dem[R.o + Math.min(R.nz - 1, j * step + 1) * R.nx + i * step], sl = Math.min(1, (Math.abs(hx - h) + Math.abs(hz - h)) / 45);
    c.copy(sand).lerp(rock, sl).lerp(dark, Math.max(0, Math.min(1, (h - 500) / 600)) * 0.6); if (h <= 3) c.set("#e8dcb6");
    col[k * 3] = c.r; col[k * 3 + 1] = c.g; col[k * 3 + 2] = c.b;
    if (i < nx - 1 && j < nz - 1) idx.push(k, k + nx, k + 1, k + 1, k + nx, k + nx + 1);
  }
  const geo = new T.BufferGeometry(); geo.setAttribute("position", new T.BufferAttribute(pos, 3)); geo.setAttribute("color", new T.BufferAttribute(col, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const m = new T.Mesh(geo, new T.MeshLambertMaterial({ vertexColors: true })); m.receiveShadow = true; g.add(m);
  /* Laut Merah */
  const sea = new T.Mesh(new T.PlaneGeometry(40000, 40000), new T.MeshLambertMaterial({ color: 0x2a7ea8 })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.1, 0); g.add(sea);
}
/* jalan raya mengikut rupa bumi (lebar 3 unit) */
function road(g, R, pts) {
  const P = []; for (let i = 0; i < pts.length - 1; i++) { const a = toW(R, pts[i][0], pts[i][1]), b = toW(R, pts[i + 1][0], pts[i + 1][1]), n = Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 4); for (let k = 0; k < n; k++) P.push({ x: a.x + (b.x - a.x) * k / n, z: a.z + (b.z - a.z) * k / n }); }
  const pos = [], idx = []; P.forEach((p, i) => { const q = P[Math.min(P.length - 1, i + 1)], r = P[Math.max(0, i - 1)], dx = q.x - r.x, dz = q.z - r.z, l = Math.hypot(dx, dz) || 1, nx = -dz / l * 1.6, nz = dx / l * 1.6, y = gnd(p.x, p.z) + 0.12; pos.push(p.x + nx, y, p.z + nz, p.x - nx, y, p.z - nz); if (i) idx.push(i * 2 - 2, i * 2 - 1, i * 2, i * 2, i * 2 - 1, i * 2 + 1); });
  const geo = new T.BufferGeometry(); geo.setAttribute("position", new T.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const m = new T.Mesh(geo, new T.MeshLambertMaterial({ color: 0x4a4c52, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 })); m.receiveShadow = true; g.add(m);
}

/* ---------- membina dunia ---------- */
function build(region) {
  const R = REG[region], cv = TS.ui.cv, renderer = new T.WebGLRenderer({ canvas: cv, antialias: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.setSize(window.innerWidth, window.innerHeight, false); renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene(); scene.background = new T.Color("#9fd0f0"); scene.fog = new T.Fog(0xd9e6ee, 300, 1600);
  const camera = new T.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.3, 4000);
  const hemi = new T.HemisphereLight(0xffffff, 0xc8b48a, 0.75); scene.add(hemi);
  const sun = new T.DirectionalLight(0xfff2d6, 0.95); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = sc.bottom = -70; sc.right = sc.top = 70; sc.far = 400; scene.add(sun); scene.add(sun.target);
  const g = TS.g = { R: R, region: region, scene: scene, camera: camera, renderer: renderer, sun: sun, hemi: hemi, items: [], p: { x: 0, z: 0, y: 0, yaw: 0 }, cam: { yaw: 0, pitch: 0.35, dist: 16 }, last: 0 };
  const PADR = { haram: 34, masa: 14, nabawi: 32, mina: 24, airport: 34, stesen: 16, hotel: 10, muzdalifah: 9, arafah: 8, kubur: 10, bangunan: 8, masjid: 9 };
  g.pads = SITES.filter((q) => q[1] === region && PADR[q[5]]).map(([, , , la, lo, kind]) => { const w = toW(R, la, lo); return { x: w.x, z: w.z, r: PADR[kind], y: Math.max(0.3, hRaw(R, la, lo)) * VY }; });
  terrain(scene, R);
  if (region === "makkah") {
    road(scene, R, [[21.6800, 39.1900], [21.6200, 39.2600], [21.5300, 39.3900], [21.4700, 39.5600], [21.4380, 39.6900], [21.4300, 39.7700], [21.4240, 39.8100], [21.4225, 39.8230]]); /* Jeddah - Makkah */
    road(scene, R, [[21.4225, 39.8290], [21.4180, 39.8550], [21.4229, 39.8700], [21.4130, 39.9000], [21.3836, 39.9365], [21.3650, 39.9600], [21.3549, 39.9800]]);                        /* Haram - Mina - Muzdalifah - Arafah */
    mCity(scene, R, 21.4225, 39.8262, 3.2, 1600, 42); mCity(scene, R, 21.5400, 39.1900, 7, 900, 10);
    mTents(scene, R, 21.405, 21.428, 39.872, 39.912, 1400);
    { const tr = new T.InstancedMesh(new T.SphereGeometry(0.9, 6, 4), mat("#5b8a3a"), 700), m4 = new T.Matrix4(); let k = 0; for (let i = 0; i < 3000 && k < 700; i++) { const lat = 21.33 + Math.random() * 0.05, lon = 39.95 + Math.random() * 0.07, h = hRaw(R, lat, lon); if (h > 360) continue; const w = toW(R, lat, lon); m4.makeTranslation(w.x, gnd(w.x, w.z) + 1.1, w.z); tr.setMatrixAt(k++, m4); } tr.count = k; scene.add(tr); } /* pokok semambu di Arafah */
  } else { mCity(scene, R, 24.4672, 39.6112, 2.6, 900, 52, 4); road(scene, R, [[24.5534, 39.7000], [24.5300, 39.6600], [24.4900, 39.6300], [24.4672, 39.6150]]); }
  SITES.filter((s) => s[1] === region).forEach(([id, , n, la, lo, kind]) => {
    const w = toW(R, la, lo), y = gnd(w.x, w.z), md = siteModel(kind); md.position.set(w.x, y - 0.1, w.z); scene.add(md);
    const lb = label((kind === "haram" ? "🕋 " : kind === "airport" ? "✈ " : kind === "stesen" ? "🚄 " : "📍 ") + n.split(" (")[0]); lb.position.set(w.x, y + (kind === "haram" ? 48 : kind === "nabawi" ? 22 : 12), w.z); scene.add(lb);
    /* titik interaksi di sebelah utara (Menara Jam Abraj al-Bait di selatan Haram tidak menghalang kamera) */
    const off = kind === "haram" ? 7 : kind === "nabawi" ? 22 : kind === "airport" ? 26 : kind === "mina" ? 5 : 4;
    if (kind === "masa") g.items.push({ id: id, n: n, kind: kind, x: w.x - 4.5, z: w.z, cx: w.x - 4.5, cz: w.z + 10, r: 8 }); /* di antara Haram dan Mas'a; kamera di utara memandang sepanjang Mas'a */
    else g.items.push({ id: id, n: n, kind: kind, x: w.x, z: w.z - off, cx: w.x, cz: w.z, r: kind === "haram" ? 12 : 8 });
  });
  /* avatar dalam pakaian ihram (putih) */
  const pc = AV3.parse(TS.opt.code || ""), fem = pc.g === "P", code = (fem ? "P" : "L") + "|" + pc.sk + "|ou_jb|oc_wh|" + (fem ? "hd_td|hc_w" : "hd_no|hc_w");
  g.me = AV3.build(code); scene.add(g.me.g);
  return g;
}
function spawnAt(id) {
  const g = TS.g, it = g.items.find((x) => x.id === id) || g.items[0]; g.p.x = it.x; g.p.z = it.z - 2; g.p.y = gnd(g.p.x, g.p.z);
  g.cam.yaw = Math.atan2(g.p.x - it.cx, g.p.z - it.cz); g.p.yaw = g.cam.yaw + Math.PI; g.cam.dist = 22; g.cam.pitch = 0.32; /* kamera di belakang, menghadap mercu tanda */
}

/* ---------- antara muka ---------- */
const CSS = "#tsOv{position:fixed;inset:0;z-index:300;background:#0b1a24;color:#fff;font-family:Nunito,system-ui,sans-serif;overflow:hidden;touch-action:none;user-select:none}#tsOv canvas.ts-cv{position:absolute;inset:0;width:100%;height:100%;display:block}"
  + "#tsOv .ts-hud{position:absolute;top:10px;left:10px;right:200px;display:flex;flex-wrap:wrap;gap:6px}#tsOv .ts-hud>span{background:rgba(8,20,32,.78);border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:6px 12px;font-weight:800;font-size:13px}"
  + "#tsOv .ts-step{position:absolute;top:52px;left:10px;width:min(360px,62vw);background:rgba(11,74,74,.9);border:2px solid #ffd45a;border-radius:14px;padding:10px 12px;font-size:13px;line-height:1.45}#tsOv .ts-step b{color:#ffd45a}#tsOv .ts-step .ar{display:inline-block;margin-right:6px;transition:transform .1s}"
  + "#tsOv .ts-pr{position:absolute;left:50%;bottom:84px;transform:translateX(-50%);background:linear-gradient(180deg,#ffd96a,#f0a43a);color:#2a1a02;border:0;border-radius:999px;padding:12px 22px;font:800 15px Nunito,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.35);cursor:pointer;max-width:92vw}"
  + "#tsOv .ts-btns{position:absolute;right:10px;top:200px;display:grid;gap:6px}#tsOv .ts-btns button,#tsOv .ts-card button{background:#16324a;color:#fff;border:1px solid rgba(255,255,255,.25);border-radius:10px;padding:8px 12px;font:800 13px Nunito,sans-serif;cursor:pointer}"
  + "#tsOv .ts-card{position:absolute;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.45);padding:16px}#tsOv .ts-box{width:min(560px,100%);max-height:88vh;overflow:auto;background:#0f2a3d;border:2px solid #ffd45a;border-radius:16px;padding:16px 18px}#tsOv .ts-box h2{margin:4px 0 8px;font-size:21px}#tsOv .ts-box p{margin:6px 0;line-height:1.5;font-size:14px}#tsOv .ts-k{color:#ffd45a;font-weight:800;font-size:12px;letter-spacing:.08em;text-transform:uppercase}#tsOv .ts-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}#tsOv .ts-card button.pri{background:linear-gradient(180deg,#ffd96a,#f0a43a);color:#2a1a02;border:0}"
  + "#tsOv .ts-map{position:absolute;top:10px;right:10px;width:180px;height:180px;border-radius:12px;border:2px solid rgba(255,255,255,.35);background:#2a7ea8}#tsOv .ts-js{position:absolute;left:24px;bottom:24px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.3);pointer-events:none}"
  + "#tsOv .ts-fade{position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;transition:opacity .4s}#tsOv .ts-fl{position:absolute;inset:0;background:linear-gradient(180deg,#0a2540,#13446e)}#tsOv .ts-fl canvas{width:100%;height:100%}#tsOv .ts-fl .ts-cap{position:absolute;left:50%;bottom:7%;transform:translateX(-50%);width:min(620px,92vw);background:rgba(8,20,32,.85);border:2px solid #ffd45a;border-radius:14px;padding:12px 16px;text-align:center;font-size:15px;line-height:1.5}"
  + "@media (pointer:fine){#tsOv .ts-js{display:none}}";
function ui() {
  if (!document.getElementById("tsCss")) { const s = document.createElement("style"); s.id = "tsCss"; s.textContent = CSS; document.head.appendChild(s); }
  const r = TS.root = el("div", { id: "tsOv", role: "dialog", "aria-modal": "true", "aria-label": "Tanah Suci" }); document.body.appendChild(r); return r;
}
function card(build) { cardClose(); const c = el("div", { class: "ts-card" }), b = el("div", { class: "ts-box" }); c.appendChild(b); TS.root.appendChild(c); TS.ui.card = c; build(b); if (TS.g) TS.g.ui = true; }
function cardClose() { if (TS.ui.card) { TS.ui.card.remove(); TS.ui.card = null; } if (TS.g) TS.g.ui = false; }
function btn(t, cls, fn) { const b = el("button", { type: "button", class: cls || "" }, t); b.addEventListener("click", fn); return b; }
function fade(fn) { const f = TS.ui.fade; if (!f) { fn(); return; } f.style.opacity = "1"; setTimeout(() => { fn(); f.style.opacity = "0"; }, 450); }

/* ---------- penerbangan sinematik KLIA <-> Tanah Suci ---------- */
const CITIES = [["Kuala Lumpur", 101.7, 2.75], ["Colombo", 79.9, 6.9], ["Mumbai", 72.9, 19.1], ["Muscat", 58.4, 23.6], ["Riyadh", 46.7, 24.7], ["Jeddah", 39.17, 21.69], ["Madinah", 39.61, 24.47]];
function flight(dir, done) {
  const box = el("div", { class: "ts-fl" }), cv = el("canvas"), cap = el("div", { class: "ts-cap" }); box.append(cv, cap); TS.root.appendChild(box);
  const toJed = dir === "go", dest = TS.opt.dest || "jed", [lo1, la1] = dest === "med" ? [39.705, 24.553] : [39.17, 21.69];
  const A = toJed ? [101.7, 2.75] : [lo1, la1], B = toJed ? [lo1, la1] : [101.7, 2.75];
  let t = 0, paused = false, asked = !(toJed && TS.pr && TS.pr.i === 0), /* miqat hanya jika belum berihram */ last = performance.now(), raf = 0;
  const steps = toJed ? [[0, "Didik Air MH-HAJI berlepas dari KLIA. Perjalanan kira-kira 7,000 km, lebih kurang 9 jam."], [0.25, "Melintasi Lautan Hindi berhampiran Sri Lanka."], [0.55, "Terbang di atas Laut Arab menghampiri Semenanjung Arab."], [0.78, "Juruterbang: kita akan melintasi garisan miqat (Yalamlam / Qarnul Manazil) tidak lama lagi."], [0.95, "Menghampiri Jeddah. Sila pakai tali pinggang keledar."]]
    : [[0, "Didik Air berlepas dari Tanah Suci. Selamat pulang, semoga ibadah diterima Allah SWT."], [0.4, "Melintasi Laut Arab dan Lautan Hindi."], [0.9, "Menghampiri KLIA, Sepang."]];
  const draw = () => {
    const W = cv.width = cv.clientWidth * (window.devicePixelRatio || 1), H = cv.height = cv.clientHeight * (window.devicePixelRatio || 1), x = cv.getContext("2d");
    const P = (lo, la) => [(lo - 30) / 80 * W, (32 - la) / 36 * H];
    x.fillStyle = "#0e3c63"; x.fillRect(0, 0, W, H);
    x.fillStyle = "#c9b98a"; /* daratan ringkas: Semenanjung Arab, India, Semenanjung Malaysia dan Sumatera */
    [[[34, 28], [36, 32], [48, 30], [57, 26], [60, 22], [55, 17], [45, 12.5], [43, 13], [39, 20], [35, 27]], [[68, 24], [73, 22], [77, 8], [80, 13], [88, 22], [92, 22], [94, 32], [68, 32]], [[100.3, 6.6], [103.4, 5.5], [104.3, 1.4], [101.3, 2.6]], [[95.3, 5.6], [98, 4], [106, -6], [103, -4], [96, 2]], [[79.8, 9.8], [81.9, 7.6], [80.6, 6], [79.8, 8]]].forEach((poly) => { x.beginPath(); poly.forEach(([lo, la], i) => { const [px, py] = P(lo, la); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.closePath(); x.fill(); });
    x.setLineDash([10, 10]); x.strokeStyle = "rgba(255,212,90,.85)"; x.lineWidth = 3; x.beginPath(); for (let k = 0; k <= 40; k++) { const u = k / 40, [px, py] = P(A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u - Math.sin(u * Math.PI) * 6); k ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); x.setLineDash([]);
    x.font = "700 " + Math.round(H / 34) + "px Nunito, sans-serif"; CITIES.forEach(([n, lo, la]) => { const [px, py] = P(lo, la); x.fillStyle = "#fff"; x.beginPath(); x.arc(px, py, 5, 0, 7); x.fill(); x.fillText(n, px + 8, py - 6); });
    const u = Math.min(1, t), [px, py] = P(A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u - Math.sin(u * Math.PI) * 6), [qx, qy] = P(A[0] + (B[0] - A[0]) * (u + 0.01), A[1] + (B[1] - A[1]) * (u + 0.01) - Math.sin((u + 0.01) * Math.PI) * 6);
    x.save(); x.translate(px, py); x.rotate(Math.atan2(qy - py, qx - px) + Math.PI / 4); x.font = Math.round(H / 14) + "px sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("✈", 0, 0); x.restore();
  };
  const loop = (ts) => {
    const dt = Math.min(0.1, (ts - last) / 1000); last = ts;
    if (!paused) t += dt / 14;
    const s = steps.filter((q) => q[0] <= t).pop(); if (s && cap._t !== s[1]) { cap._t = s[1]; cap.textContent = s[1]; }
    if (!asked && t >= 0.8) { asked = true; paused = true; miqatAsk(() => { paused = false; }); }
    draw();
    if (t >= 1.02) { cancelAnimationFrame(raf); box.remove(); done(); return; }
    raf = requestAnimationFrame(loop);
  };
  const sk = btn("Langkau ⏩", "", () => { t = Math.max(t, asked ? 1.02 : 0.8); }); sk.style.cssText = "position:absolute;top:12px;right:12px;background:#16324a;color:#fff;border:1px solid #fff4;border-radius:10px;padding:8px 12px;font:800 13px Nunito"; box.appendChild(sk);
  raf = requestAnimationFrame(loop);
}
/* miqat di udara: berniat ihram sebelum melintasi miqat */
function miqatAsk(resume) {
  const pr = TS.pr, it = ITIN[pr.mode];
  card((b) => {
    b.append(el("div", { class: "ts-k" }, "✈ Di udara · Miqat"), el("h2", null, "Berniat ihram sebelum melintasi miqat"));
    b.append(el("p", null, "Jemaah dari Malaysia yang terus ke Makkah berihram di dalam pesawat sebelum melintasi miqat Yalamlam atau Qarnul Manazil. Pakaian ihram biasanya dipakai sejak di KLIA, dan niat dilafazkan apabila juruterbang membuat pengumuman."));
    b.append(el("p", null, "Laksanakan peringkat pertama " + it.n + ": " + it.st[0][1] + "."));
    b.append(el("div", { class: "ts-row" }, btn("🕋 Mula simulasi Miqat", "pri", () => { cardClose(); runStage(pr.mode, "miqat", () => resume()); }), btn("Teruskan tanpa simulasi", "", () => { cardClose(); resume(); })));
  });
}

/* ---------- menjalankan satu peringkat simulasi ---------- */
function runStage(mode, stage, after, ziarah) {
  TS.sim = true; TS.paused = true;
  const go = () => hjOpen(mode, { stage: stage, done: (ok, n, fin) => {
    TS.sim = false; TS.paused = false; if (TS.g) { TS.g.last = 0; }
    if (fin && !ziarah) { const pr = TS.pr, cur = ITIN[pr.mode].st[pr.i]; if (cur && cur[0] === stage) { pr.sc.push([stage, ok, n]); pr.i++; tsSave(); } }
    if (fin && ziarah) { TS.pr.zr[ziarah] = 1; tsSave(); }
    if (after) after(fin);
    stepHud(true);
    if (fin && !ziarah && TS.pr.i >= ITIN[TS.pr.mode].st.length) setTimeout(complete, 500);
  } });
  if (typeof hjOpen === "function") go(); else { toast("Simulasi tidak dapat dibuka.", "warn"); TS.sim = false; TS.paused = false; if (after) after(false); }
}
function complete() {
  const pr = TS.pr, it = ITIN[pr.mode];
  card((b) => {
    b.append(el("div", { class: "ts-k" }, "🕋 " + it.n + " selesai"), el("h2", null, "Tahniah! Semoga " + (pr.mode === "umrah" ? "umrah" : "haji") + " anda mabrur"));
    b.append(el("p", null, "Anda telah melaksanakan semua " + it.st.length + " peringkat " + it.n + " di lokasi sebenar Tanah Suci."));
    b.append(el("p", null, "Kini anda boleh berziarah ke tempat bersejarah di Makkah, menaiki kereta api laju Haramain ke Madinah, atau pulang ke Malaysia dari Lapangan Terbang Jeddah."));
    b.append(el("div", { class: "ts-row" }, btn("Teruskan", "pri", cardClose)));
  });
  if (TS.opt.onDone) try { TS.opt.onDone({ mode: pr.mode, done: true }); } catch (e) { /* abaikan */ }
}

/* ---------- lokasi: tekan E ---------- */
function siteOpen(it) {
  const pr = TS.pr, M = ITIN[pr.mode], cur = M.st[pr.i], nextAt = cur ? STAGE_AT[cur[0]] : null;
  const here = M.st.filter((s) => STAGE_AT[s[0]] === it.id), zr = ZIARAH[it.id];
  card((b) => {
    b.append(el("div", { class: "ts-k" }, "📍 " + TS.g.R.nm), el("h2", null, it.n));
    if (cur && cur[0] === "miqat" && it.id === "jed") b.append(el("p", { style: "background:rgba(255,212,90,.15);border:1px solid #ffd45a;border-radius:10px;padding:8px" }, "Anda belum berniat ihram di udara. Sebaiknya ihram sebelum melintasi miqat. Bagi yang terlepas, terdapat pandangan ulama yang membenarkan berihram di Jeddah dan ada yang mewajibkan dam. Rujuk ustaz pembimbing jemaah anda."));
    else if (here.length) b.append(el("p", null, "Manasik " + M.n + " di sini: " + here.map((s) => s[1]).join("; ") + "."));
    const row = el("div", { class: "ts-row" });
    if (cur && nextAt === it.id) row.append(btn("🕋 Mula: " + cur[1], "pri", () => { cardClose(); runStage(pr.mode, cur[0]); }));
    else if (cur) b.append(el("p", null, "Langkah " + M.n + " seterusnya: " + cur[1] + (nextAt ? " di " + (TS.g.items.find((x) => x.id === nextAt) || { n: "lokasi lain" }).n : "") + "."));
    if (zr) row.append(btn((TS.pr.zr[zr[1]] ? "✔ " : "📜 ") + "Ziarah: " + (it.n.split(" (")[0]), "", () => { cardClose(); runStage(zr[0], zr[1], null, zr[1]); }));
    if (it.kind === "airport") {
      if (it.id === "jed" || it.id === "med") row.append(btn("✈ Pulang ke Malaysia", "", () => { cardClose(); goHome(); }));
    }
    if (it.id === "hrmk") row.append(btn("🚄 Kereta api laju ke Madinah", "", () => { cardClose(); travel("madinah", "hrmd", "Kereta api laju Haramain: Makkah ke Madinah (450 km, kira-kira 2 jam 20 minit)."); }));
    if (it.id === "hrmd") row.append(btn("🚄 Kereta api laju ke Makkah", "", () => { cardClose(); travel("makkah", "hrmk", "Kereta api laju Haramain: Madinah ke Makkah."); }));
    row.append(btn("Tutup", "", cardClose));
    b.appendChild(row);
  });
}
function travel(region, at, msg) {
  fade(() => { teardown3D(); build(region); spawnAt(at); TS.g.last = 0; toastTs(msg); });
}
function goHome() {
  const g = TS.g; teardown3D(); TS.opt.dest = g && g.region === "madinah" ? "med" : "jed";
  flight("back", () => close(true));
}
function toastTs(t) { const e = TS.ui.toast; if (!e) return; e.textContent = t; e.style.opacity = "1"; clearTimeout(e._t); e._t = setTimeout(() => (e.style.opacity = "0"), 4200); }

/* ---------- HUD langkah seterusnya ---------- */
function stepHud(force) {
  const g = TS.g, box = TS.ui.step; if (!g || !box) return;
  const pr = TS.pr, M = ITIN[pr.mode], cur = M.st[pr.i], at = cur ? STAGE_AT[cur[0]] : null, tgt = at && g.items.find((x) => x.id === at);
  const d = tgt ? Math.hypot(tgt.x - g.p.x, tgt.z - g.p.z) / KU : 0;
  const key = (cur ? cur[0] : "-") + Math.round(d * 10) + g.region;
  if (!force && box._k === key) return; box._k = key; box.textContent = "";
  box.append(el("div", null, el("b", null, "🕋 " + M.n + " · " + Math.min(pr.i, M.st.length) + "/" + M.st.length)));
  if (!cur) box.append(el("div", null, "Semua manasik selesai. Berziarah atau pulang dari Lapangan Terbang Jeddah."));
  else if (!tgt) box.append(el("div", null, "Seterusnya: " + cur[1] + (g.region === "madinah" ? " (di Makkah: naik kereta api Haramain)" : "")));
  else { TS.ui.arr = el("span", { class: "ar" }, "➤"); box.append(el("div", null, TS.ui.arr, "Seterusnya: " + cur[1]), el("div", null, "📍 " + tgt.n + " · " + (d < 1 ? Math.round(d * 1000) + " m" : d.toFixed(1) + " km"))); }
  if (tgt && d > 2) { const bt = btn("🚌 Naik bas ke sana", "", () => fade(() => { spawnAt(tgt.id); toastTs("Tiba di " + tgt.n); })); bt.style.cssText = "margin-top:6px;background:#16324a;color:#fff;border:1px solid #fff4;border-radius:10px;padding:6px 10px;font:800 12px Nunito;cursor:pointer"; box.appendChild(bt); }
}
function minimap() {
  const g = TS.g, cv = TS.ui.map; if (!g || !cv) return;
  if (!g.mapImg) {
    const R = g.R, c = document.createElement("canvas"); c.width = 180; c.height = 180; const x = c.getContext("2d"), img = x.createImageData(180, 180);
    for (let j = 0; j < 180; j++) for (let i = 0; i < 180; i++) { const h = hRaw(R, R.la1 - (j / 179) * (R.la1 - R.la0), R.lo0 + (i / 179) * (R.lo1 - R.lo0)), k = (j * 180 + i) * 4, s = Math.min(1, Math.max(0, h / 900)); if (h <= 1) { img.data[k] = 42; img.data[k + 1] = 126; img.data[k + 2] = 168; } else { img.data[k] = 220 - s * 110; img.data[k + 1] = 200 - s * 110; img.data[k + 2] = 156 - s * 90; } img.data[k + 3] = 255; }
    x.putImageData(img, 0, 0); g.mapImg = c;
  }
  const x = cv.getContext("2d"), R = g.R, wMax = toW(R, R.la0, R.lo1); x.drawImage(g.mapImg, 0, 0);
  const P = (wx, wz) => [wx / wMax.x * 180, wz / wMax.z * 180];
  g.items.forEach((it) => { const [px, py] = P(it.x, it.z); x.fillStyle = it.kind === "haram" || it.kind === "nabawi" ? "#111" : "#ffd45a"; x.fillRect(px - 2, py - 2, 4, 4); });
  const [px, py] = P(g.p.x, g.p.z); x.fillStyle = "#ff3b3b"; x.beginPath(); x.arc(px, py, 4, 0, 7); x.fill();
}

/* ---------- gelung permainan ---------- */
function tick(ts) {
  TS.raf = requestAnimationFrame(tick);
  const g = TS.g; if (!g || TS.paused) return;
  const dt = Math.min(0.05, g.last ? (ts - g.last) / 1000 : 0.016); g.last = ts;
  const p = g.p, K = TS.keys, run = K.shift;
  let ix = (K.r ? 1 : 0) - (K.l ? 1 : 0) + TS.js.x, iz = (K.f ? 1 : 0) - (K.b ? 1 : 0) + TS.js.y; const il = Math.min(1, Math.hypot(ix, iz));
  if (g.ui) ix = iz = 0;
  const cy = Math.cos(g.cam.yaw), sy = Math.sin(g.cam.yaw), sp = (run ? 40 : 18) * il, mx = (-ix * cy - iz * sy), mz = (ix * sy - iz * cy), ml = Math.hypot(mx, mz) || 1;
  const moving = il > 0.1 && !g.ui;
  if (moving) { const nx = p.x + mx / ml * sp * dt, nz = p.z + mz / ml * sp * dt; if (!isSea(nx, nz)) { p.x = nx; p.z = nz; } p.yaw = Math.atan2(mx, mz); }
  p.y += (gnd(p.x, p.z) - p.y) * Math.min(1, dt * 12);
  g.me.g.position.set(p.x, p.y, p.z); g.me.g.rotation.y = p.yaw; try { AV3.anim(g.me, moving, false, dt, run ? 1.6 : 1, g.scene); } catch (e) { /* abaikan */ }
  const cam = g.camera, d = g.cam.dist, cx = p.x + Math.sin(g.cam.yaw) * d * Math.cos(g.cam.pitch), cz = p.z + Math.cos(g.cam.yaw) * d * Math.cos(g.cam.pitch), cyy = Math.max(gnd(cx, cz) + 1.5, p.y + 1.6 + Math.sin(g.cam.pitch) * d);
  cam.position.lerp(new T.Vector3(cx, cyy, cz), Math.min(1, dt * 8)); cam.lookAt(p.x, p.y + 1.6, p.z);
  g.sun.position.set(p.x + 60, p.y + 120, p.z + 40); g.sun.target.position.set(p.x, p.y, p.z);
  /* lokasi berhampiran */
  let near = null, bd = 1e9; g.items.forEach((it) => { const dd = Math.hypot(it.x - p.x, it.z - p.z); if (dd < it.r && dd < bd) { bd = dd; near = it; } }); g.near = near;
  const pr = TS.ui.pr; if (near && !g.ui) { const t = (window.matchMedia && matchMedia("(pointer:fine)").matches ? "E: " : "") + near.n; if (pr.textContent !== t) pr.textContent = t; pr.hidden = false; } else pr.hidden = true;
  if ((g.hudT = (g.hudT || 0) - dt) <= 0) { g.hudT = 0.3; stepHud(); minimap(); { const q = toLL(g.R, p.x, p.z), h = Math.round(Math.max(0, hRaw(g.R, q.lat, q.lon))); TS.ui.pos.textContent = "📍 " + g.R.nm + " · " + q.lat.toFixed(4) + "°U " + q.lon.toFixed(4) + "°T · " + h + " m"; } }
  if (TS.ui.arr) { const pr2 = TS.pr, cur = ITIN[pr2.mode].st[pr2.i], tg = cur && g.items.find((x) => x.id === STAGE_AT[cur[0]]); if (tg) { const vx = tg.x - p.x, vz = tg.z - p.z, fw = -vx * sy - vz * cy, rt = vx * cy - vz * sy; TS.ui.arr.style.transform = "rotate(" + (Math.atan2(rt, fw) - Math.PI / 2).toFixed(2) + "rad)"; } }
  g.renderer.render(g.scene, cam);
}
function onKey(e) {
  if (!TS.on || TS.sim) return; const k = e.key.toLowerCase(), dn = e.type === "keydown";
  const map = { w: "f", arrowup: "f", s: "b", arrowdown: "b", a: "l", arrowleft: "l", d: "r", arrowright: "r", shift: "shift" };
  if (map[k]) { TS.keys[map[k]] = dn; e.preventDefault(); e.stopPropagation(); return; }
  if (dn && (k === "e" || k === "enter") && TS.g && TS.g.near && !TS.g.ui) { e.preventDefault(); e.stopPropagation(); siteOpen(TS.g.near); }
  if (dn && k === "escape") { e.preventDefault(); e.stopPropagation(); if (TS.ui.card) cardClose(); }
}
function pointers(cv) {
  /* v18.45: iPad/iPhone Safari guna Touch Events terus (Pointer Events tidak boleh dipercayai pada iOS); tetikus/pen guna Pointer Events */
  const down = (id, x, y, touch) => { if (touch && x < window.innerWidth * 0.4 && y > window.innerHeight * 0.45 && TS.js.id < 0) { TS.js.id = id; TS.js.cx = x; TS.js.cy = y; } else if (TS.drag.id < 0) { TS.drag.id = id; TS.drag.x = x; TS.drag.y = y; } };
  const move = (id, x, y) => { const g = TS.g; if (!g) return; if (id === TS.js.id) { let dx = (x - TS.js.cx) / 50, dy = (TS.js.cy - y) / 50; const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; } TS.js.x = dx; TS.js.y = dy; } else if (id === TS.drag.id) { g.cam.yaw -= (x - TS.drag.x) * 0.006; g.cam.pitch = clampN(g.cam.pitch + (y - TS.drag.y) * 0.004, 0.05, 1.35); TS.drag.x = x; TS.drag.y = y; } };
  const end = (id) => { if (id === TS.js.id) { TS.js.id = -1; TS.js.x = TS.js.y = 0; } if (id === TS.drag.id) TS.drag.id = -1; };
  const TE = "ontouchstart" in window;
  if (TE) {
    const each = (e, fn) => { for (let i = 0; i < e.changedTouches.length; i++) { const t = e.changedTouches[i]; fn(100000 + t.identifier, t.clientX, t.clientY); } };
    cv.addEventListener("touchstart", (e) => { if (e.cancelable) e.preventDefault(); each(e, (id, x, y) => down(id, x, y, true)); }, { passive: false });
    cv.addEventListener("touchmove", (e) => { if (e.cancelable) e.preventDefault(); each(e, move); }, { passive: false });
    cv.addEventListener("touchend", (e) => { if (e.cancelable) e.preventDefault(); each(e, end); }, { passive: false });
    cv.addEventListener("touchcancel", (e) => each(e, end), { passive: false });
  }
  cv.addEventListener("pointerdown", (e) => { if (TE && e.pointerType === "touch") return; try { cv.setPointerCapture(e.pointerId); } catch (x) { /* abaikan */ } down(e.pointerId, e.clientX, e.clientY, e.pointerType !== "mouse"); });
  cv.addEventListener("pointermove", (e) => { if (!(TE && e.pointerType === "touch")) move(e.pointerId, e.clientX, e.clientY); });
  const up = (e) => { if (!(TE && e.pointerType === "touch")) end(e.pointerId); };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  cv.addEventListener("wheel", (e) => { if (TS.g) { TS.g.cam.dist = clampN(TS.g.cam.dist + Math.sign(e.deltaY) * 2, 6, 120); e.preventDefault(); } }, { passive: false });
}
function onResize() { const g = TS.g; if (!g) return; g.renderer.setSize(window.innerWidth, window.innerHeight, false); g.camera.aspect = window.innerWidth / window.innerHeight; g.camera.updateProjectionMatrix(); }
function hud() {
  const r = TS.root, cv = el("canvas", { class: "ts-cv" }); TS.ui.cv = cv; r.appendChild(cv); pointers(cv);
  const h = el("div", { class: "ts-hud" }); TS.ui.pos = el("span", null, "📍"); h.append(TS.ui.pos, el("span", null, "🤍 Berpakaian ihram")); r.appendChild(h);
  TS.ui.step = el("div", { class: "ts-step", role: "status" }); r.appendChild(TS.ui.step);
  TS.ui.map = el("canvas", { class: "ts-map", width: "180", height: "180" }); r.appendChild(TS.ui.map);
  TS.ui.pr = el("button", { type: "button", class: "ts-pr", hidden: "" }); TS.ui.pr.addEventListener("click", () => { if (TS.g && TS.g.near) siteOpen(TS.g.near); }); r.appendChild(TS.ui.pr);
  const bs = el("div", { class: "ts-btns" });
  bs.append(btn("📋 Manasik", "", () => manasik()), btn("✈ Pulang", "", () => { if (!confirm("Pulang ke Malaysia sekarang? Kemajuan manasik disimpan.")) return; goHome(); }));
  r.appendChild(bs); r.appendChild(el("div", { class: "ts-js", "aria-hidden": "true" }));
  TS.ui.toast = el("div", { style: "position:absolute;left:50%;top:18%;transform:translateX(-50%);background:rgba(30,150,90,.92);padding:8px 16px;border-radius:999px;font-weight:800;opacity:0;transition:opacity .3s;pointer-events:none;max-width:90vw;text-align:center" }); r.appendChild(TS.ui.toast);
  TS.ui.fade = el("div", { class: "ts-fade" }); r.appendChild(TS.ui.fade);
}
function manasik() {
  const pr = TS.pr, M = ITIN[pr.mode];
  card((b) => {
    b.append(el("div", { class: "ts-k" }, "📋 Manasik " + M.n), el("h2", null, pr.i + " / " + M.st.length + " peringkat selesai"));
    M.st.forEach((s, i) => { const at = STAGE_AT[s[0]], it = at && TS.g.items.find((x) => x.id === at); b.append(el("p", null, (i < pr.i ? "✔ " : i === pr.i ? "➤ " : "○ ") + (i + 1) + ". " + s[1] + (s[0] === "miqat" ? " (dalam pesawat)" : it ? " · " + it.n.split(" (")[0] : " · Makkah"))); });
    b.append(el("p", { style: "opacity:.8" }, "Ziarah (pilihan): Jabal Nur, Jabal Thur, Ma'la, Kiswah, Ji'ranah, Tan'im, Masjid al-Khaif, dan di Madinah melalui kereta api laju Haramain."));
    b.append(el("div", { class: "ts-row" }, btn("Tutup", "pri", cardClose)));
  });
}
function teardown3D() {
  const g = TS.g; if (!g) return; TS.g = null;
  try { g.scene.traverse((o) => { if (o.geometry && !Object.values(GEO).includes(o.geometry)) o.geometry.dispose(); if (o.material && o.material.map) o.material.map.dispose(); }); g.renderer.dispose(); } catch (e) { /* abaikan */ }
  const cv = TS.ui.cv; if (cv && cv.parentNode) { const n = el("canvas", { class: "ts-cv" }); cv.replaceWith(n); TS.ui.cv = n; pointers(n); }
}
function close(home) {
  TS.on = false; cancelAnimationFrame(TS.raf); teardown3D();
  window.removeEventListener("keydown", onKey, true); window.removeEventListener("keyup", onKey, true); window.removeEventListener("resize", onResize);
  if (TS.root) TS.root.remove(); TS.root = null; TS.ui = {}; TS.keys = {}; document.body.classList.remove("ar-lock");
  const o = TS.opt; TS.opt = null; if (o && o.onExit) o.onExit(!!home);
}
/* pintu masuk: opt = { mode: umrah|ifrad|qiran|tamattuk, code: kod avatar, onExit(pulang), onDone(hasil) } */
async function tsOpen(opt) {
  if (TS.on) return; if (!T || !window.AV3) { toast("Grafik 3D tidak tersedia pada peranti ini.", "warn"); return; }
  TS.on = true; TS.opt = opt; TS.pr = tsLoad(opt.mode); TS.paused = false; document.body.classList.add("ar-lock"); ui();
  window.addEventListener("keydown", onKey, true); window.addEventListener("keyup", onKey, true); window.addEventListener("resize", onResize);
  const ld = el("div", { class: "ts-card" }, el("div", { class: "ts-box" }, el("div", { class: "ts-k" }, "Didik Air · KLIA"), el("h2", null, "Menyediakan penerbangan ke Tanah Suci..."), el("p", null, "Memuat peta ketinggian sebenar Makkah dan Madinah."))); TS.root.appendChild(ld);
  try { await tsDem(); } catch (e) { ld.remove(); toast("Data Tanah Suci tidak dapat dimuatkan. Semak sambungan internet.", "warn"); close(false); return; }
  ld.remove();
  const land = () => { hud(); build("makkah"); spawnAt("jed"); TS.raf = requestAnimationFrame(tick); toastTs("Selamat datang ke Jeddah! " + (TS.pr.i > 1 ? "Teruskan manasik anda." : "Naik bas ke Makkah atau berjalan mengikut penunjuk.")); };
  flight("go", land);
}
window.tsOpen = tsOpen;
window.TSX = TS;
})();
