/* =====================================================================
   META GEMPUR (v17.88, dinamakan semula v17.89): dunia terbuka gaya blok di atas peta Malaysia.
   Murid berjalan ke setiap negeri, menjawab kuiz di Menara Ilmu (ikut tajuk negeri itu),
   menziarahi tempat pelancongan, menggantung nama pada Papan Kenangan dan bermain bersama rakan.
   Fail ini dimuat hanya apabila butang Dunia Gempur ditekan (lmOpen dalam index.html). Bergantung pada
   pemboleh ubah global index.html: THREE, DATA, TOPIK, BYTOPIK, QLIST, P, Net, SUBJ, SUBJS dan utiliti.
   ===================================================================== */
(function () {
"use strict";
const T = window.THREE;
const SC = 4;            /* 1 unit peta SVG = 4 unit dunia */
const BX = 40;           /* Borneo dianjak ke timur supaya Laut China Selatan kelihatan */
const OX = 350, OZ = 182; /* pusat dunia dalam koordinat SVG (selepas anjakan) */
const BORNEO = { sarawak: 1, sabah: 1 };
const XP_CAP = 80, XP_KEY = "gt-lm-xp";
const EMOTE = { salam: "Assalamualaikum!", hebat: "Hebat!", jom: "Jom ikut saya!", tahniah: "Tahniah!" };

/* [id, negeri, nama, jenis model, x, y (SVG), fakta] */
const PLACES = [
  ["pl-kelam", "perlis", "Gua Kelam", "gua", 73.4, 66.4, "Gua Kelam ialah gua batu kapur sepanjang kira-kira 370 meter dengan titian kayu di dalamnya. Dahulu ia laluan pelombong bijih timah."],
  ["pl-wangkelian", "perlis", "Wang Kelian", "bukit", 70.2, 74.6, "Wang Kelian terletak di sempadan Malaysia-Thailand dan terkenal dengan pasar sempadan serta pemandangan bukit batu kapur."],
  ["kd-jerai", "kedah", "Gunung Jerai", "gunung", 81.8, 101.7, "Gunung Jerai (1,217 m) menjadi panduan pelayar sejak zaman dahulu dan terletak berhampiran tapak arkeologi Lembah Bujang."],
  ["kd-bujang", "kedah", "Lembah Bujang", "candi", 81.9, 108.7, "Lembah Bujang ialah tapak arkeologi tertua di Asia Tenggara yang pernah menjadi pelabuhan perdagangan penting."],
  ["kd-zahir", "kedah", "Masjid Zahir", "masjid", 79, 90.7, "Masjid Zahir di Alor Setar dibina pada tahun 1912 dan antara masjid tercantik di Malaysia."],
  ["pg-jambatan", "penang", "Jambatan Pulau Pinang", "jambatan", 83, 130.6, "Jambatan Pulau Pinang sepanjang 13.5 km menghubungkan pulau dengan Seberang Perai sejak 1985."],
  ["pg-kapitan", "penang", "Masjid Kapitan Keling", "masjid", 75.6, 120.0, "Masjid Kapitan Keling di George Town dibina pada abad ke-19 oleh komuniti Muslim India."],
  ["pg-bendera", "penang", "Bukit Bendera", "bukit", 72.6, 124.0, "Bukit Bendera (833 m) boleh dinaiki dengan kereta api funikular dan menawarkan pemandangan George Town."],
  ["pk-ubudiah", "perak", "Masjid Ubudiah", "masjid", 105.2, 148.5, "Masjid Ubudiah di Kuala Kangsar terkenal dengan kubah emasnya dan siap dibina pada tahun 1917."],
  ["pk-kellie", "perak", "Istana Kellie", "istana", 112.7, 161.9, "Istana Kellie di Batu Gajah ialah binaan lama yang tidak sempat disiapkan pada awal abad ke-20."],
  ["pk-condong", "perak", "Menara Condong Teluk Intan", "menara", 107.8, 180.9, "Menara Condong Teluk Intan dibina pada tahun 1885 sebagai menara jam dan tangki air."],
  ["pk-belum", "perak", "Hutan Belum-Temenggor", "hutan", 126.8, 117.5, "Hutan Belum-Temenggor dianggarkan berusia lebih 130 juta tahun dan menjadi habitat burung enggang."],
  ["kn-kglaut", "kelantan", "Masjid Kampung Laut", "masjid", 163.9, 96.8, "Masjid Kampung Laut antara masjid tertua di Malaysia, dibina tanpa paku menggunakan kayu cengal."],
  ["kn-siti", "kelantan", "Pasar Siti Khadijah", "pasar", 159.1, 91.7, "Pasar Siti Khadijah di Kota Bharu terkenal kerana kebanyakan peniaganya ialah wanita."],
  ["kn-cahaya", "kelantan", "Pantai Cahaya Bulan", "pantai", 164.8, 87.6, "Pantai Cahaya Bulan ialah pantai popular di Kota Bharu, terkenal dengan wakaf dan layang-layang."],
  ["tr-kristal", "terengganu", "Masjid Kristal", "masjid", 199, 130.1, "Masjid Kristal di Taman Tamadun Islam dibina daripada keluli, kaca dan kristal, siap pada tahun 2008."],
  ["tr-kenyir", "terengganu", "Tasik Kenyir", "tasik", 184.3, 139, "Tasik Kenyir ialah tasik buatan manusia terbesar di Asia Tenggara dengan lebih 340 pulau kecil."],
  ["tr-payang", "terengganu", "Pasar Payang", "pasar", 200.1, 123.2, "Pasar Payang terkenal dengan kain batik, songket dan keropok lekor Terengganu."],
  ["ph-tamannegara", "pahang", "Taman Negara", "hutan", 168.8, 165.8, "Taman Negara ialah hutan hujan tropika berusia lebih 130 juta tahun dengan titian kanopi yang panjang."],
  ["ph-cameron", "pahang", "Cameron Highlands", "ladang", 130, 165, "Cameron Highlands terkenal dengan ladang teh, strawberi dan cuaca sejuk."],
  ["ph-fraser", "pahang", "Bukit Fraser", "bukit", 141.6, 193.7, "Bukit Fraser ialah tanah tinggi berhawa sejuk yang terkenal dengan menara jamnya."],
  ["ph-cempedak", "pahang", "Pantai Teluk Cempedak", "pantai", 207.9, 189.7, "Pantai Teluk Cempedak di Kuantan mempunyai pasir putih dan laluan pejalan kaki di tepi bukit."],
  ["sl-biru", "selangor", "Masjid Sultan Salahuddin Abdul Aziz Shah", "masjid", 129.9, 221.9, "Masjid Biru di Shah Alam mempunyai antara kubah masjid terbesar di dunia."],
  ["sl-melawati", "selangor", "Bukit Melawati", "kota", 117.2, 210.5, "Bukit Melawati di Kuala Selangor menyimpan kesan kota lama dan rumah api."],
  ["sl-sekinchan", "selangor", "Sawah Padi Sekinchan", "sawah", 113.9, 204.4, "Sekinchan terkenal dengan sawah padi luas yang menghasilkan beras berkualiti tinggi."],
  ["wp-klcc", "wp", "Menara Berkembar Petronas", "berkembar", 138.4, 219.4, "Menara Berkembar Petronas setinggi 452 m pernah menjadi bangunan tertinggi di dunia (1998-2004)."],
  ["wp-negara", "wp", "Masjid Negara", "masjid", 135.9, 222.6, "Masjid Negara dibuka pada tahun 1965 dengan bumbung berbentuk payung bintang 16 bucu."],
  ["wp-menarakl", "wp", "Menara Kuala Lumpur", "menara", 138.6, 223.8, "Menara Kuala Lumpur setinggi 421 m digunakan untuk telekomunikasi dan cerapan anak bulan."],
  ["ns-pd", "nsembilan", "Pantai Port Dickson", "pantai", 143.7, 245.3, "Port Dickson terkenal dengan pantainya yang panjang dan menjadi destinasi percutian keluarga."],
  ["ns-serimenanti", "nsembilan", "Istana Lama Seri Menanti", "istana", 156.7, 239.4, "Istana Lama Seri Menanti dibina tanpa paku dengan 99 tiang kayu yang melambangkan pahlawan suku."],
  ["mk-afamosa", "melaka", "Kota A Famosa", "kota", 158.1, 258.8, "A Famosa dibina oleh Portugis selepas menawan Melaka pada tahun 1511; hanya pintu Porta de Santiago yang tinggal."],
  ["mk-selat", "melaka", "Masjid Selat Melaka", "masjid", 164.5, 261.5, "Masjid Selat Melaka dibina di atas tiang di Pulau Melaka dan kelihatan terapung ketika air pasang."],
  ["jh-abubakar", "johor", "Masjid Sultan Abu Bakar", "masjid", 228.5, 291.9, "Masjid Sultan Abu Bakar di Johor Bahru siap pada tahun 1900 dengan gabungan seni bina Victoria dan Moor."],
  ["jh-piai", "johor", "Tanjung Piai", "pantai", 218.1, 295.5, "Tanjung Piai ialah hujung paling selatan tanah besar benua Asia dan kawasan paya bakau Ramsar."],
  ["jh-ledang", "johor", "Gunung Ledang", "gunung", 181, 254.1, "Gunung Ledang (1,276 m) terkenal dalam legenda Puteri Gunung Ledang."],
  ["sw-waterfront", "sarawak", "Kuching Waterfront", "bandar", 289.1, 273.7, "Kuching Waterfront terletak di tebing Sungai Sarawak, berhadapan Bangunan DUN Sarawak."],
  ["sw-niah", "sarawak", "Gua Niah", "gua", 420.7, 193.5, "Gua Niah ialah tapak penemuan tengkorak manusia berusia kira-kira 40,000 tahun."],
  ["sw-mulu", "sarawak", "Taman Negara Gunung Mulu", "gunung", 459.9, 185, "Taman Negara Gunung Mulu ialah Tapak Warisan Dunia UNESCO dengan Gua Rusa yang sangat besar."],
  ["sw-bako", "sarawak", "Taman Negara Bako", "hutan", 325.3, 266.6, "Taman Negara Bako ialah taman negara tertua di Sarawak dan habitat monyet belanda."],
  ["sb-kinabalu", "sabah", "Gunung Kinabalu", "gunung", 527.5, 112.6, "Gunung Kinabalu (4,095 m) ialah gunung tertinggi di Malaysia dan Tapak Warisan Dunia UNESCO."],
  ["sb-masjidkk", "sabah", "Masjid Bandaraya Kota Kinabalu", "masjid", 509.8, 115.8, "Masjid Bandaraya Kota Kinabalu dibina di tepi lagun dan kelihatan seperti terapung."],
  ["sb-sepilok", "sabah", "Sepilok", "hutan", 580.8, 120.1, "Pusat Pemulihan Orang Utan Sepilok menjaga orang utan yatim sebelum dilepaskan ke hutan."],
  ["sb-kinabatangan", "sabah", "Sungai Kinabatangan", "sungai", 594.3, 133.3, "Sungai Kinabatangan ialah sungai kedua terpanjang di Malaysia dan habitat gajah pygmy Borneo."]
];
/* lapangan terbang untuk perjalanan pantas (x, y SVG sebelum anjakan) */
const AIRPORTS = [
  ["ap-klia", "selangor", "KLIA Sepang", 136.5, 236.0],
  ["ap-pg", "penang", "Lapangan Terbang Pulau Pinang", 84.0, 127.5],
  ["ap-kb", "kelantan", "Lapangan Terbang Kota Bharu", 158.0, 100.0],
  ["ap-jb", "johor", "Lapangan Terbang Senai", 222.0, 282.0],
  ["ap-kch", "sarawak", "Lapangan Terbang Kuching", 300.0, 279.0],
  ["ap-bki", "sabah", "Lapangan Terbang Kota Kinabalu", 516.0, 126.0]
];
const STATE_COL = {
  perlis: "#8fd16a", kedah: "#b6dd5c", penang: "#6fcf9e", perak: "#9ccc65", kelantan: "#c5e17a", terengganu: "#7fd6a8",
  pahang: "#79c267", selangor: "#a8d86a", wp: "#d8d27a", nsembilan: "#93d38a", melaka: "#cfd96a", johor: "#86cf73",
  sarawak: "#6dbb63", sabah: "#7ccf8a"
};

const LM = window.LMX = {
  on: false, tid: "", g: null, root: null, cv: null, ui: {}, keys: {}, raf: 0, mute: false, gq: 1,
  room: null, peers: {}, sent: 0, pollT: 0, tok: 0, roomCode: "", roomKind: "",
  js: { id: -1, x: 0, y: 0, cx: 0, cy: 0 }, drag: { id: -1, x: 0, y: 0 }, open: lmOpen, close: lmClose
};

/* ---------- utiliti ---------- */
const lmRand = (seed) => rng(hashStr(String(seed)));
const shiftX = (k, x) => x + (BORNEO[k] ? BX : 0);
const toW = (k, x, y) => ({ x: (shiftX(k, x) - OX) * SC, z: (y - OZ) * SC });
const toS = (wx, wz) => ({ x: wx / SC + OX, y: wz / SC + OZ }); /* koordinat SVG beranjak */
function lmSave() {
  try { localStorage.setItem("gt-lm-" + SUBJ, JSON.stringify(LM.st)); } catch (e) { /* abaikan */ }
}
function lmLoad() {
  let s = null; try { s = JSON.parse(localStorage.getItem("gt-lm-" + SUBJ) || "null"); } catch (e) { s = null; }
  s = s && typeof s === "object" ? s : {};
  if (!s.tw || typeof s.tw !== "object") s.tw = {};   /* menara: id topik -> markah terbaik */
  if (!s.pl || typeof s.pl !== "object") s.pl = {};   /* tempat diziarahi: id -> masa */
  if (!s.nm || typeof s.nm !== "object") s.nm = {};   /* nama digantung: id -> masa */
  if (!s.cd || s.cd.d !== dayKey()) s.cd = { d: dayKey(), got: [] }; /* syiling dikutip hari ini */
  if (!s.dq || s.dq.d !== dayKey()) s.dq = { d: dayKey(), done: 0, v: [] }; /* misi pelancong harian */
  if (s.gq == null) s.gq = TOUCH ? 0 : 1;
  LM.st = s; LM.gq = s.gq;
}
function lmXp(n) {
  let left = XP_CAP;
  try { const r = JSON.parse(localStorage.getItem(XP_KEY) || "null") || {}; left = Math.max(0, XP_CAP - (r.d === dayKey() ? r.n | 0 : 0)); } catch (e) { /* abaikan */ }
  n = Math.min(n | 0, left); if (n <= 0) return 0;
  P.xp += n;
  const wk = weekKey(); if (P.wk !== wk) { P.wk = wk; P.wp = 0; } P.wp = (P.wp | 0) + n;
  const mk = monthKey(); if (P.mk !== mk) { P.mk = mk; P.mp = 0; } P.mp = (P.mp | 0) + n;
  try { localStorage.setItem(XP_KEY, JSON.stringify({ d: dayKey(), n: XP_CAP - left + n })); } catch (e) { /* abaikan */ }
  try { noteActive(); saveP(); computeStand(); renderMe(); } catch (e) { /* abaikan */ }
  return n;
}
function lmSnd(k) {
  if (LM.mute) return;
  if (k === "ok") { arBeep(784, 0.12, "triangle", 0.06); setTimeout(() => arBeep(1046, 0.18, "triangle", 0.06), 90); }
  else if (k === "bad") arBeep(220, 0.3, "sawtooth", 0.04, -60);
  else if (k === "coin") { arBeep(1318, 0.07, "square", 0.03); setTimeout(() => arBeep(1760, 0.1, "square", 0.03), 60); }
  else if (k === "jump") arBeep(420, 0.12, "sine", 0.04, 260);
  else if (k === "win") [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => arBeep(f, 0.25, "triangle", 0.06), i * 120));
  else if (k === "open") arBeep(660, 0.1, "sine", 0.05, 200);
}
function lmTex(w, h, draw) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
  const t = new T.CanvasTexture(c); t.anisotropy = 4; t.userData = { c: c, draw: draw }; return t;
}
function lmRound(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
/* label terapung (nama pemain, menara, tempat) */
function lmLabel(text, opt) {
  opt = opt || {};
  const fs = opt.fs || 34, pad = 14;
  const mc = document.createElement("canvas").getContext("2d"); mc.font = "800 " + fs + "px Nunito, sans-serif";
  const w = Math.min(1000, Math.ceil(mc.measureText(text).width) + pad * 2), h = fs + pad * 1.4;
  const tex = lmTex(w, h, (x) => {
    x.font = "800 " + fs + "px Nunito, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle";
    lmRound(x, 2, 2, w - 4, h - 4, 14); x.fillStyle = opt.bg || "rgba(8,20,32,.72)"; x.fill();
    if (opt.bd) { x.lineWidth = 4; x.strokeStyle = opt.bd; x.stroke(); }
    x.fillStyle = opt.fg || "#fff"; x.fillText(text, w / 2, h / 2 + 1);
  });
  const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, depthTest: opt.dt !== false, transparent: true }));
  const k = (opt.k || 0.034); sp.scale.set(w * k, h * k, 1); sp.renderOrder = 5;
  return sp;
}
const MATS = {};
function lmMat(c, o) {
  const k = c + (o ? JSON.stringify(o) : "");
  if (!MATS[k]) MATS[k] = new T.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
  return MATS[k];
}
const GEO = {};
function lmBox(w, h, d) { const k = "b" + w + "," + h + "," + d; return GEO[k] || (GEO[k] = new T.BoxGeometry(w, h, d)); }
function lmCyl(rt, rb, h, n) { const k = "c" + rt + "," + rb + "," + h + "," + (n || 12); return GEO[k] || (GEO[k] = new T.CylinderGeometry(rt, rb, h, n || 12)); }
function lmSph(r, ws, hs, ps, pl, ts, tl) { const k = "s" + [r, ws, hs, ps, pl, ts, tl].join(","); return GEO[k] || (GEO[k] = new T.SphereGeometry(r, ws || 16, hs || 12, ps, pl, ts, tl)); }
function lmMesh(geo, col, x, y, z, o) {
  const m = new T.Mesh(geo, typeof col === "string" ? lmMat(col) : col); m.position.set(x || 0, y || 0, z || 0);
  if (!(o && o.ns)) { m.castShadow = true; m.receiveShadow = true; }
  return m;
}

/* ---------- peta raster: negeri di bawah setiap titik (untuk daratan, label dan peta mini) ---------- */
const RS = 2, RX0 = 20, RY0 = 50, RW = 1340, RH = 520;
const RAST = { keys: [], data: null, paths: {} };
function lmRaster() {
  if (RAST.data) return;
  const c = document.createElement("canvas"); c.width = RW; c.height = RH;
  const x = c.getContext("2d"); const keys = RAST.keys = Object.keys(DATA.negeri);
  keys.forEach((k, i) => {
    const p = RAST.paths[k] = new Path2D(DATA.negeri[k].d);
    x.setTransform(RS, 0, 0, RS, (-RX0 + (BORNEO[k] ? BX : 0)) * RS, -RY0 * RS);
    x.fillStyle = x.strokeStyle = "rgb(" + ((i + 1) * 16) + ",0,0)"; x.lineWidth = 0.9; x.lineJoin = "round";
    x.fill(p); x.stroke(p);
  });
  /* jambatan Pulau Pinang: sambung titik terdekat pulau dan tanah besar */
  const br = lmBridgeSeg();
  if (br) { x.setTransform(RS, 0, 0, RS, -RX0 * RS, -RY0 * RS); x.strokeStyle = "rgb(240,0,0)"; x.lineWidth = 1.7; x.lineCap = "round"; x.beginPath(); x.moveTo(br[0], br[1]); x.lineTo(br[2], br[3]); x.stroke(); }
  lmRasterIslands(x);
  RAST.data = x.getImageData(0, 0, RW, RH).data; RAST.bridge = br;
}
function lmBridgeSeg() {
  const pg = DATA.negeri.penang; if (!pg) return null;
  const sp = pg.d.split("M").filter(Boolean).map((t) => { const n = t.replace(/Z/g, "").match(/-?[\d.]+/g).map(Number), p = []; for (let i = 0; i < n.length; i += 2) p.push([n[i], n[i + 1]]); return p; });
  if (sp.length < 2) return null;
  let best = null;
  for (const a of sp[0]) for (const b of sp[1]) { const d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (!best || d < best[0]) best = [d, a, b]; }
  if (!best) return null;
  const a = best[1], b = best[2], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
  return [a[0] - dx / l * 1.2, a[1] - dy / l * 1.2, b[0] + dx / l * 1.2, b[1] + dy / l * 1.2];
}
/* pulangkan kunci negeri ("" = laut, "jambatan" = jambatan) bagi koordinat dunia */
function lmAt(wx, wz) {
  const s = toS(wx, wz), px = Math.round((s.x - RX0) * RS), py = Math.round((s.y - RY0) * RS);
  if (px < 0 || py < 0 || px >= RW || py >= RH) return "";
  const o = (py * RW + px) * 4; if (RAST.data[o + 3] < 110) return "";
  const r = RAST.data[o]; if (r >= 232) return "jambatan";
  if (r < 8) { const j = Math.round(RAST.data[o + 1] / 40) - 1, isl = LM.isl && LM.isl.find((q) => q.j === j); return isl ? isl.id : ""; }
  return RAST.keys[Math.round(r / 16) - 1] || "";
}
const lmLandW = (wx, wz) => lmAt(wx, wz) !== "";

/* ---------- rupa bumi 3D (v17.90): bukit, banjaran, pantai dan dasar laut ---------- */
/* Grid ketinggian meliputi seluruh peta. Daratan diambil daripada peta raster negeri; ketinggian dijana
   daripada jarak ke pantai, hingar fbm, banjaran (Titiwangsa, Crocker) dan puncak gunung. Tapak rata
   ("pad") disediakan untuk menara, mercu tanda dan lapangan terbang supaya model duduk elok. */
const TER = { cs: 4, x0: -1320, z0: -528, nx: 0, nz: 0, h: null, land: null, st: null, dIn: null };
const STATE_AMP = { perlis: 0.5, kedah: 0.6, penang: 0.8, perak: 1, kelantan: 0.9, terengganu: 0.7, pahang: 1, selangor: 0.5, wp: 0.2, nsembilan: 0.7, melaka: 0.3, johor: 0.5, sarawak: 0.9, sabah: 1 };
/* banjaran dalam koordinat SVG asal: [negeri rujukan (untuk anjakan Borneo), tinggi, lebar dunia, titik...] */
const RANGES = [
  ["perak", 34, 70, [[126, 96], [133, 128], [138, 160], [142, 190], [152, 218], [163, 238]]],
  ["kelantan", 22, 60, [[150, 120], [170, 150], [185, 170]]],
  ["sabah", 38, 70, [[505, 150], [520, 125], [532, 105], [545, 88]]],
  ["sarawak", 26, 90, [[330, 268], [380, 250], [430, 222], [470, 196]]]
];
function lmHash(a, b) { let n = (Math.imul(a, 374761393) + Math.imul(b, 668265263)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967295; }
function lmNoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = lmHash(xi, zi), b = lmHash(xi + 1, zi), c = lmHash(xi, zi + 1), d = lmHash(xi + 1, zi + 1);
  return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v;
}
function lmFbm(x, z) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 4; i++) { s += lmNoise(x * f, z * f) * a; f *= 2.03; a *= 0.5; } return s / 0.9375; }
function lmSegDist(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1, t = clamp(((px - ax) * dx + (pz - az) * dz) / l2, 0, 1);
  return Math.hypot(px - ax - dx * t, pz - az - dz * t);
}
/* jarak chamfer (dua laluan) daripada sel bertanda */
function lmDist(mask, nx, nz, cs) {
  const INF = 1e9, d = new Float32Array(nx * nz), a = cs, b = cs * 1.4142;
  for (let i = 0; i < d.length; i++) d[i] = mask[i] ? 0 : INF;
  for (let z = 0; z < nz; z++) for (let x = 0; x < nx; x++) {
    const i = z * nx + x; let v = d[i];
    if (x > 0) v = Math.min(v, d[i - 1] + a);
    if (z > 0) { v = Math.min(v, d[i - nx] + a); if (x > 0) v = Math.min(v, d[i - nx - 1] + b); if (x < nx - 1) v = Math.min(v, d[i - nx + 1] + b); }
    d[i] = v;
  }
  for (let z = nz - 1; z >= 0; z--) for (let x = nx - 1; x >= 0; x--) {
    const i = z * nx + x; let v = d[i];
    if (x < nx - 1) v = Math.min(v, d[i + 1] + a);
    if (z < nz - 1) { v = Math.min(v, d[i + nx] + a); if (x < nx - 1) v = Math.min(v, d[i + nx + 1] + b); if (x > 0) v = Math.min(v, d[i + nx - 1] + b); }
    d[i] = v;
  }
  return d;
}
function lmTerrainBase(g) {
  const cs = TER.cs = LM.gq ? 4 : 7, nx = TER.nx = Math.floor(2680 / cs) + 1, nz = TER.nz = Math.floor(1040 / cs) + 1, N = nx * nz;
  const land = TER.land = new Uint8Array(N), st = TER.st = new Uint8Array(N), keys = RAST.keys;
  for (let z = 0; z < nz; z++) for (let x = 0; x < nx; x++) {
    const k = lmAt(TER.x0 + x * cs, TER.z0 + z * cs), i = z * nx + x;
    if (k && k !== "jambatan") { land[i] = 1; st[i] = keys.indexOf(k) + 1; }
  }
  const sea = new Uint8Array(N); for (let i = 0; i < N; i++) sea[i] = land[i] ? 0 : 1;
  const dIn = TER.dIn = lmDist(sea, nx, nz, cs), dOut = lmDist(land, nx, nz, cs);
  /* amplitud ikut negeri, dilicinkan supaya tiada anak tangga di sempadan */
  let amp = new Float32Array(N);
  for (let i = 0; i < N; i++) amp[i] = st[i] ? (STATE_AMP[keys[st[i] - 1]] || 0.6) : 0.4;
  const blur = (src) => { const out = new Float32Array(N), r = Math.max(2, Math.round(28 / cs)); for (let z = 0; z < nz; z++) { let s = 0, c = 0; for (let x = -r; x <= r; x++) if (x >= 0 && x < nx) { s += src[z * nx + x]; c++; } for (let x = 0; x < nx; x++) { out[z * nx + x] = s / c; const xa = x - r, xb = x + r + 1; if (xa >= 0) { s -= src[z * nx + xa]; c--; } if (xb < nx) { s += src[z * nx + xb]; c++; } } } const o2 = new Float32Array(N); for (let x = 0; x < nx; x++) { let s = 0, c = 0; for (let z = -r; z <= r; z++) if (z >= 0 && z < nz) { s += out[z * nx + x]; c++; } for (let z = 0; z < nz; z++) { o2[z * nx + x] = s / c; const za = z - r, zb = z + r + 1; if (za >= 0) { s -= out[za * nx + x]; c--; } if (zb < nz) { s += out[zb * nx + x]; c++; } } } return o2; };
  amp = blur(amp);
  /* banjaran dan puncak dalam koordinat dunia */
  const ranges = RANGES.map(([k, ht, w, pts]) => ({ ht: ht, w: w, p: pts.map((q) => toW(k, q[0], q[1])) }));
  const peaks = [];
  for (const it of g.items) {
    if (it.kind !== "pl") continue;
    if (it.type === "gunung") peaks.push({ x: it.x, z: it.z, h: it.id === "sb-kinabalu" ? 92 : it.id === "sw-mulu" ? 58 : 42, r: it.id === "sb-kinabalu" ? 70 : 48 });
    else if (it.type === "bukit") peaks.push({ x: it.x, z: it.z, h: 22, r: 30 });
  }
  lmIslands().forEach((o) => o.pk.forEach((q) => peaks.push({ x: (o.x + q[0] - OX) * SC, z: (o.y + q[1] - OZ) * SC, h: q[2], r: q[3] })));
  const h = TER.h = new Float32Array(N), sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  for (let z = 0; z < nz; z++) for (let x = 0; x < nx; x++) {
    const i = z * nx + x, wx = TER.x0 + x * cs, wz = TER.z0 + z * cs;
    if (!land[i]) { h[i] = -1.4 - Math.min(dOut[i], 70) / 70 * 16 + (lmNoise(wx / 40, wz / 40) - 0.5) * 1.5; continue; }
    const D = dIn[i], inl = sm(14, 150, D), A = amp[i];
    let v = 0.55 + Math.min(D, 30) * 0.075;
    v += A * inl * (5 + lmFbm(wx / 230, wz / 230) * 30 + lmFbm(wx / 70 + 7, wz / 70) * 8);
    let rg = 0; for (const R of ranges) { let md = 1e9; for (let j = 0; j < R.p.length - 1; j++) md = Math.min(md, lmSegDist(wx, wz, R.p[j].x, R.p[j].z, R.p[j + 1].x, R.p[j + 1].z)); if (md < R.w * 2.2) rg = Math.max(rg, R.ht * Math.exp(-(md * md) / (R.w * R.w)) * (0.7 + 0.6 * lmFbm(wx / 60, wz / 60))); }
    v += rg * sm(4, 40, D);
    for (const q of peaks) { const d2 = (wx - q.x) * (wx - q.x) + (wz - q.z) * (wz - q.z); if (d2 < q.r * q.r * 6) v = Math.max(v, v * 0.3 + q.h * Math.exp(-d2 / (q.r * q.r)) * sm(2, 20, D)); }
    h[i] = Math.min(v, 100);
  }
}
function lmPad(g, x, z, r, top, sh) { g.pads.push({ x: x, z: z, r: r, top: !!top, sh: sh || null }); }
/* ratakan tapak: puncak dikekalkan pada puncak (top), selainnya ketinggian tengah */
function lmTerrainPads(g) {
  const { cs, nx, nz, h, x0, z0 } = TER;
  for (const p of g.pads) {
    if (p.sh && p.sh.h == null) p.sh.h = Math.max(0.9, lmHRaw(p.sh.x, p.sh.z));
    const hc = p.sh ? p.sh.h : Math.max(0.9, lmHRaw(p.x, p.z)), R = p.r + 18;
    const xa = Math.max(0, Math.floor((p.x - R - x0) / cs)), xb = Math.min(nx - 1, Math.ceil((p.x + R - x0) / cs));
    const za = Math.max(0, Math.floor((p.z - R - z0) / cs)), zb = Math.min(nz - 1, Math.ceil((p.z + R - z0) / cs));
    for (let z = za; z <= zb; z++) for (let x = xa; x <= xb; x++) {
      const i = z * nx + x; if (!TER.land[i]) continue;
      const d = Math.hypot(x0 + x * cs - p.x, z0 + z * cs - p.z); if (d > R) continue;
      const t = d <= p.r ? 1 : 1 - (d - p.r) / 18, w = t * t * (3 - 2 * t);
      h[i] = h[i] + (hc - h[i]) * w;
    }
  }
}
function lmHRaw(wx, wz) {
  const { cs, nx, nz, h, x0, z0 } = TER; if (!h) return 0;
  const fx = clamp((wx - x0) / cs, 0, nx - 1.001), fz = clamp((wz - z0) / cs, 0, nz - 1.001), xi = fx | 0, zi = fz | 0, u = fx - xi, v = fz - zi, i = zi * nx + xi;
  return (h[i] * (1 - u) + h[i + 1] * u) * (1 - v) + (h[i + nx] * (1 - u) + h[i + nx + 1] * u) * v;
}
/* ketinggian tanah di bawah pemain (jambatan Pulau Pinang ada lantai sendiri) */
function lmGround(wx, wz) { return lmAt(wx, wz) === "jambatan" ? 1.25 : lmHRaw(wx, wz); }
function lmDetailTex() {
  const t = lmTex(128, 128, (x, w, h) => {
    const im = x.createImageData(w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const v = 205 + (lmFbm(i / 9, j / 9) * 50) | 0, o = (j * w + i) * 4; im.data[o] = im.data[o + 1] = im.data[o + 2] = Math.min(255, v); im.data[o + 3] = 255; }
    x.putImageData(im, 0, 0);
  });
  t.wrapS = t.wrapT = T.RepeatWrapping; return t;
}
function lmBuildTerrain(g) {
  lmTerrainPads(g);
  const { cs, nx, nz, h, x0, z0, land, st, dIn } = TER, N = nx * nz, keys = RAST.keys;
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), uv = new Float32Array(N * 2);
  const C = (hex) => new T.Color(hex), sand = C(0xe6d39a), wet = C(0xb9a571), grass = C(0x4f8a34), grass2 = C(0x6f9a3c), forest = C(0x24552a), rock = C(0x6f6a5e), snow = C(0xf4f6f8), sea0 = C(0xd8c58e), sea1 = C(0x2b5f6e);
  const tmp = new T.Color(), tint = {};
  keys.forEach((k, i) => { tint[i + 1] = new T.Color(STATE_COL[k] || "#8fd16a"); });
  for (let z = 0; z < nz; z++) for (let x = 0; x < nx; x++) {
    const i = z * nx + x, wx = x0 + x * cs, wz = z0 + z * cs, y = h[i];
    pos[i * 3] = wx; pos[i * 3 + 1] = y; pos[i * 3 + 2] = wz; uv[i * 2] = wx / 14; uv[i * 2 + 1] = wz / 14;
    const sx = (h[i + (x < nx - 1 ? 1 : 0)] - h[i - (x > 0 ? 1 : 0)]) / (2 * cs), sz = (h[i + (z < nz - 1 ? nx : 0)] - h[i - (z > 0 ? nx : 0)]) / (2 * cs), slope = Math.hypot(sx, sz);
    const n = lmFbm(wx / 50, wz / 50);
    if (!land[i]) tmp.copy(sea0).lerp(sea1, clamp(-y / 14, 0, 1));
    else if (y < 1.6 && dIn[i] < 14) tmp.copy(y < 0.9 ? wet : sand);
    else {
      tmp.copy(grass).lerp(grass2, n);
      tmp.lerp(forest, clamp((y - 6) / 22, 0, 0.85) * (0.6 + 0.4 * n));
      if (y > 42 || slope > 0.85) tmp.lerp(rock, clamp(Math.max((y - 42) / 22, (slope - 0.85) * 1.6), 0, 0.85) * (0.75 + 0.25 * n));
      if (y > 72) tmp.lerp(snow, clamp((y - 72) / 10, 0, 1));
      if (st[i] && tint[st[i]]) tmp.lerp(tint[st[i]], 0.1);
    }
    col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
  }
  /* segi tiga hanya berhampiran daratan (laut dalam dilukis oleh dasar rata) */
  const idx = [];
  for (let z = 0; z < nz - 1; z++) for (let x = 0; x < nx - 1; x++) {
    const a = z * nx + x, b = a + 1, c = a + nx, d = c + 1;
    if (h[a] < -9 && h[b] < -9 && h[c] < -9 && h[d] < -9) continue;
    idx.push(a, c, b, b, c, d);
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute("position", new T.BufferAttribute(pos, 3)); geo.setAttribute("color", new T.BufferAttribute(col, 3)); geo.setAttribute("uv", new T.BufferAttribute(uv, 2));
  geo.setIndex(N > 65535 ? new T.Uint32BufferAttribute(idx, 1) : new T.Uint16BufferAttribute(idx, 1));
  geo.computeVertexNormals(); geo.computeBoundingSphere();
  const m = new T.Mesh(geo, new T.MeshLambertMaterial({ vertexColors: true, map: lmDetailTex() }));
  m.receiveShadow = true; m.frustumCulled = false; g.scene.add(m); g.terrain = m;
  /* dasar laut dalam */
  const floor = new T.Mesh(new T.PlaneGeometry(7000, 7000).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: 0x1d4f6a })); floor.position.y = -17; g.scene.add(floor);
  /* sempadan negeri mengikut permukaan bukit */
  g.border = {};
  for (const k of keys) {
    const grp = new T.Group(), mat = new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 });
    DATA.negeri[k].d.split("M").filter(Boolean).forEach((sp) => {
      const nn = sp.replace(/Z/g, "").match(/-?[\d.]+/g).map(Number), pts = [];
      for (let j = 0; j < nn.length; j += 2) {
        const a = toW(k, nn[j], nn[j + 1]), b = toW(k, nn[(j + 2) % nn.length], nn[(j + 3) % nn.length]), seg = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 6));
        for (let s = 0; s < seg; s++) { const px = a.x + (b.x - a.x) * s / seg, pz = a.z + (b.z - a.z) * s / seg; pts.push(new T.Vector3(px, Math.max(0.15, lmHRaw(px, pz)) + 0.35, pz)); }
      }
      if (pts.length) { pts.push(pts[0].clone()); grp.add(new T.Line(new T.BufferGeometry().setFromPoints(pts), mat)); }
    });
    g.scene.add(grp); g.border[k] = mat;
  }
  /* jambatan Pulau Pinang */
  const br = RAST.bridge;
  if (br) {
    const a = toW("penang", br[0], br[1]), b = toW("penang", br[2], br[3]), len = Math.hypot(b.x - a.x, b.z - a.z), ang = Math.atan2(b.z - a.z, b.x - a.x);
    const grp = new T.Group(); grp.position.set((a.x + b.x) / 2, 1.25, (a.z + b.z) / 2); grp.rotation.y = -ang;
    grp.add(lmMesh(lmBox(len, 0.6, 6), "#d9d3c4", 0, -0.3, 0));
    for (let i = -1; i <= 1; i += 2) grp.add(lmMesh(lmBox(len, 0.9, 0.35), "#f2efe6", 0, 0.45, i * 2.9));
    for (let i = 0; i < 6; i++) { const px = -len / 2 + (i + 0.5) * len / 6; grp.add(lmMesh(lmBox(1.2, 14, 1.2), "#bfb8a8", px, -7.5, 0)); }
    grp.add(lmMesh(lmBox(1.2, 11, 7.2), "#f2efe6", 0, 5, 0));
    g.scene.add(grp);
  }
}
/* ---------- laut: air lut sinar dengan riak bergerak ---------- */
function lmWaterNormal() {
  const S = 128, hh = new Float32Array(S * S);
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) { const a = i / S * 6.2832, b = j / S * 6.2832; hh[j * S + i] = Math.sin(a * 3 + Math.sin(b * 2) * 1.5) * 0.5 + Math.sin(b * 4 + a) * 0.35 + Math.sin((a + b) * 7) * 0.15; }
  const t = lmTex(S, S, (x) => {
    const im = x.createImageData(S, S);
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
      const dx = hh[j * S + (i + 1) % S] - hh[j * S + (i + S - 1) % S], dz = hh[((j + 1) % S) * S + i] - hh[((j + S - 1) % S) * S + i], o = (j * S + i) * 4;
      im.data[o] = 128 - dx * 90; im.data[o + 1] = 128 - dz * 90; im.data[o + 2] = 255; im.data[o + 3] = 255;
    }
    x.putImageData(im, 0, 0);
  });
  t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(160, 160); return t;
}
function lmBuildSea(g) {
  const nm = lmWaterNormal();
  const m = new T.Mesh(new T.PlaneGeometry(7000, 7000).rotateX(-Math.PI / 2), new T.MeshPhongMaterial({ color: 0x1e88c8, shininess: 110, specular: 0xd8f0ff, transparent: true, opacity: 0.8, normalMap: nm, normalScale: new T.Vector2(0.55, 0.55), depthWrite: false }));
  m.position.y = 0; m.renderOrder = 1; g.scene.add(m); g.sea = m; g.seaN = nm;
}
/* ---------- langit: kubah bergradien, matahari, awan lembut ---------- */
function lmBuildSky(g) {
  const geo = new T.SphereGeometry(1250, 32, 16), n = geo.attributes.position.count, cols = new Float32Array(n * 3);
  geo.setAttribute("color", new T.BufferAttribute(cols, 3));
  const dome = new T.Mesh(geo, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, fog: false, depthWrite: false }));
  dome.renderOrder = -10; dome.frustumCulled = false; g.scene.add(dome); g.dome = dome;
  g.paintSky = (top, hor) => {
    const p = geo.attributes.position, c = new T.Color();
    for (let i = 0; i < n; i++) { const yy = p.getY(i) / 1250; c.copy(hor).lerp(top, Math.pow(clamp(yy, 0, 1), 0.6)); cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b; }
    geo.attributes.color.needsUpdate = true;
  };
  const sunTex = lmTex(128, 128, (x, w) => { const gr = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(255,255,240,1)"); gr.addColorStop(0.25, "rgba(255,240,190,.9)"); gr.addColorStop(1, "rgba(255,220,150,0)"); x.fillStyle = gr; x.fillRect(0, 0, w, w); });
  g.sunDisc = new T.Sprite(new T.SpriteMaterial({ map: sunTex, fog: false, depthWrite: false, transparent: true })); g.sunDisc.scale.set(160, 160, 1); g.sunDisc.renderOrder = -9; g.scene.add(g.sunDisc);
  const puff = lmTex(128, 128, (x, w) => { for (let i = 0; i < 7; i++) { const cx = 30 + Math.random() * 68, cy = 50 + Math.random() * 30, r = 22 + Math.random() * 18, gr = x.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, "rgba(255,255,255,.95)"); gr.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = gr; x.fillRect(0, 0, w, w); } });
  const clouds = new T.Group(), R = lmRand("lm-cloud"), cm = new T.SpriteMaterial({ map: puff, transparent: true, depthWrite: false, opacity: 0.9 });
  for (let i = 0; i < (LM.gq ? 70 : 36); i++) { const s = new T.Sprite(cm); const k = 60 + R() * 70; s.scale.set(k * 1.8, k, 1); s.position.set(-1300 + R() * 2900, 130 + R() * 70, -650 + R() * 1250); clouds.add(s); }
  g.scene.add(clouds); g.clouds = clouds;
}
/* ---------- tumbuhan: pokok hutan, pokok kelapa di pantai, batu ---------- */
function lmBuildTrees(g, avoid) {
  const NT = LM.gq ? 2600 : 1000, NP = LM.gq ? 700 : 300, NR = LM.gq ? 420 : 150, R = lmRand("lm-trees");
  const trunkG = new T.CylinderGeometry(0.28, 0.45, 4, 5); trunkG.translate(0, 2, 0);
  const crownG = new T.IcosahedronGeometry(2.6, 0); crownG.translate(0, 5.2, 0);
  const crown2G = new T.IcosahedronGeometry(1.9, 0); crown2G.translate(1.3, 6.6, 0.6);
  const palmT = new T.CylinderGeometry(0.2, 0.32, 7, 5); palmT.translate(0, 3.5, 0);
  const palmC = new T.ConeGeometry(3.4, 1.5, 7, 1, true); palmC.translate(0, 6.8, 0);
  const rockG = new T.DodecahedronGeometry(1.4, 0);
  const leafMat = new T.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
  const mk = (geo, mat, n) => { const m = new T.InstancedMesh(geo, mat, n); m.castShadow = !!LM.gq; m.receiveShadow = true; m.frustumCulled = false; return m; };
  const trunk = mk(trunkG, lmMat("#6e4a2c"), NT), crown = mk(crownG, leafMat, NT), crown2 = mk(crown2G, leafMat, NT);
  const pT = mk(palmT, lmMat("#9b7046"), NP), pC = mk(palmC, new T.MeshLambertMaterial({ color: 0x2f7a35, side: T.DoubleSide, flatShading: true }), NP);
  const rocks = mk(rockG, new T.MeshLambertMaterial({ color: 0x8e877a, flatShading: true }), NR);
  const mt = new T.Matrix4(), q = new T.Quaternion(), sc = new T.Vector3(), pos = new T.Vector3(), col = new T.Color(), up = new T.Vector3(0, 1, 0);
  const ok = (x, z) => { const k = lmAt(x, z); return k && k !== "jambatan" && k !== "wp" && !avoid.some((a) => Math.hypot(a.x - x, a.z - z) < a.r + 4); };
  const put = (m, i, x, y, z, s, sy, rot) => { q.setFromAxisAngle(up, rot); mt.compose(pos.set(x, y, z), q, sc.set(s, sy, s)); m.setMatrixAt(i, mt); };
  let n = 0, np = 0, nr = 0, tries = 0;
  while ((n < NT || np < NP || nr < NR) && tries < 90000) {
    tries++;
    const x = -1300 + R() * 2630, z = -520 + R() * 1020; if (!ok(x, z)) continue;
    const y = lmHRaw(x, z); if (y < 0.4) continue;
    const ci = Math.round((z - TER.z0) / TER.cs) * TER.nx + Math.round((x - TER.x0) / TER.cs), D = TER.dIn[ci] || 0;
    if (D < 22 && y < 4) { if (np < NP && R() < 0.8) { const s = 0.8 + R() * 0.5; put(pT, np, x, y - 0.2, z, s, s * (0.9 + R() * 0.4), R() * 6.28); put(pC, np, x, y - 0.2, z, s, s * (0.9 + R() * 0.4), R() * 6.28); np++; } continue; }
    if (y > 38) { if (nr < NR) { const s = 0.7 + R() * 1.8; put(rocks, nr, x, y + 0.3 * s, z, s, s * 0.7, R() * 6.28); nr++; } if (y > 62 || R() < 0.6) continue; }
    if (n >= NT) continue;
    const dens = clamp(0.25 + (y - 3) / 18, 0.15, 1); if (R() > dens) continue;
    const s = 0.75 + R() * 0.75, rot = R() * 6.28;
    put(trunk, n, x, y - 0.3, z, s, s, rot); put(crown, n, x, y - 0.3, z, s, s * (0.85 + R() * 0.35), rot); put(crown2, n, x, y - 0.3, z, s, s, rot);
    col.setHSL(0.24 + R() * 0.1, 0.35 + R() * 0.22, 0.13 + R() * 0.1); crown.setColorAt(n, col); col.offsetHSL(0.01, 0, 0.04); crown2.setColorAt(n, col);
    g.trees.push({ x: x, z: z, r: 0.9 * s });
    n++;
  }
  trunk.count = crown.count = crown2.count = n; pT.count = pC.count = np; rocks.count = nr;
  [crown, crown2].forEach((m) => { if (m.instanceColor) m.instanceColor.needsUpdate = true; });
  [trunk, crown, crown2, pT, pC, rocks].forEach((m) => g.scene.add(m));
}
/* ---------- mercu tanda prosedural ---------- */
function lmPalm(grp, x, z, s) {
  s = s || 1;
  const t = lmMesh(lmCyl(0.25 * s, 0.35 * s, 6 * s, 6), "#9b7046", x, 3 * s, z); t.rotation.z = 0.12; grp.add(t);
  for (let i = 0; i < 5; i++) { const l = lmMesh(lmBox(4 * s, 0.25, 0.9 * s), "#3faa4f", x + Math.cos(i * 1.26) * 1.6 * s, 6 * s, z + Math.sin(i * 1.26) * 1.6 * s); l.rotation.y = -i * 1.26; l.rotation.z = -0.35; grp.add(l); }
}
function lmMasjid(grp, o) {
  const dome = o.dome || "#e8b93a", wall = o.wall || "#f4efe3";
  grp.add(lmMesh(lmBox(14, 6, 14), wall, 0, 3, 0));
  grp.add(lmMesh(lmBox(15, 0.8, 15), "#d8cdb6", 0, 6.4, 0));
  grp.add(lmMesh(lmCyl(4.6, 5, 2, 16), wall, 0, 7.8, 0));
  grp.add(lmMesh(lmSph(5, 20, 12, 0, 6.2832, 0, Math.PI / 2), dome, 0, 8.8, 0));
  grp.add(lmMesh(lmCyl(0.12, 0.12, 2.4, 6), "#e8c64a", 0, 15, 0));
  const mins = o.min || 4;
  for (let i = 0; i < mins; i++) {
    const a = i * 6.2832 / mins + 0.785, x = Math.cos(a) * 9.4, z = Math.sin(a) * 9.4;
    grp.add(lmMesh(lmCyl(0.9, 1.1, 16, 8), wall, x, 8, z));
    grp.add(lmMesh(lmCyl(1.3, 1.3, 0.7, 8), "#d8cdb6", x, 12.5, z));
    grp.add(lmMesh(new T.ConeGeometry(1.1, 3, 8), dome, x, 17.5, z));
  }
  grp.add(lmMesh(lmBox(4, 4.5, 1), "#7a5a3a", 0, 2.25, 7.05));
}
function lmModel(type, rnd) {
  const g = new T.Group(); let r = 9;
  switch (type) {
    case "masjid": lmMasjid(g, { dome: pick(["#e8b93a", "#3e9ad6", "#2fb3a3", "#e8b93a"]) }); r = 11; break;
    case "menara":
      g.add(lmMesh(lmCyl(2.2, 3, 4, 10), "#d9dde3", 0, 2, 0));
      g.add(lmMesh(lmCyl(1.3, 1.6, 34, 10), "#eef1f4", 0, 21, 0));
      g.add(lmMesh(lmSph(4, 16, 10), "#7fb7e8", 0, 38, 0));
      g.add(lmMesh(lmCyl(0.25, 0.4, 10, 6), "#c6ccd4", 0, 46, 0)); r = 5; break;
    case "berkembar":
      for (const sx of [-5, 5]) { for (let i = 0; i < 5; i++) g.add(lmMesh(lmCyl(3.2 - i * 0.45, 3.4 - i * 0.45, 10, 8), "#cfd6de", sx, 5 + i * 10, 0)); g.add(lmMesh(lmCyl(0.15, 0.3, 8, 6), "#e6ebf0", sx, 54, 0)); }
      g.add(lmMesh(lmBox(6, 1.6, 2), "#9aa6b2", 0, 24, 0)); r = 10; break;
    case "gunung": /* gunung kini puncak rupa bumi yang boleh didaki; di puncak ada tugu dan bendera */
      g.add(lmMesh(new T.DodecahedronGeometry(1.6, 0), "#8d8576", 0, 0.8, 0)); g.add(lmMesh(new T.DodecahedronGeometry(1.1, 0), "#9a9283", 0.9, 1.9, 0.3));
      g.add(lmMesh(lmCyl(0.1, 0.1, 6, 6), "#d9d9d9", 0, 3.5, 0)); g.add(lmMesh(lmBox(2.6, 1.6, 0.1), "#d63b3b", 1.3, 5.6, 0)); g.add(lmMesh(lmBox(2.6, 0.8, 0.11), "#f4f4f4", 1.3, 5.2, 0)); r = 0; break;
    case "bukit": /* bukit rupa bumi; pondok rehat di puncak */
      g.add(lmMesh(lmBox(4, 3, 4), "#c96f4a", 0, 1.5, 0)); g.add(lmMesh(new T.ConeGeometry(3.4, 2.4, 4), "#7a3a2a", 0, 4.2, 0)); r = 3; break;
    case "gua":
      g.add(lmMesh(new T.DodecahedronGeometry(10, 0), "#9a9a92", 0, 5, 0));
      g.add(lmMesh(new T.DodecahedronGeometry(6, 0), "#8a8a82", 7, 3, -4));
      g.add(lmMesh(lmBox(4.5, 5, 2), "#1d1b1a", 0, 2.5, 9)); r = 11; break;
    case "candi":
      for (let i = 0; i < 4; i++) g.add(lmMesh(lmBox(14 - i * 3, 2, 14 - i * 3), "#b6835a", 0, 1 + i * 2, 0));
      g.add(lmMesh(new T.ConeGeometry(2, 4, 4), "#a2714c", 0, 10, 0)); r = 9; break;
    case "istana":
      g.add(lmMesh(lmBox(14, 1.6, 10), "#7a5133", 0, 1.6, 0));
      for (const x of [-6, 0, 6]) for (const z of [-4, 4]) g.add(lmMesh(lmBox(0.7, 2.4, 0.7), "#5e3c24", x, 0.8, z));
      g.add(lmMesh(lmBox(13, 5, 9), "#a8744a", 0, 4.9, 0));
      { const rf = lmMesh(new T.ConeGeometry(10, 6, 4), "#6b3b22", 0, 10.4, 0); rf.rotation.y = 0.785; rf.scale.z = 0.75; g.add(rf); }
      g.add(lmMesh(lmBox(3, 4, 0.4), "#3d2616", 0, 4.4, 4.6)); r = 9; break;
    case "kota":
      g.add(lmMesh(lmBox(16, 6, 2), "#c9c0ad", 0, 3, -6)); g.add(lmMesh(lmBox(2, 6, 12), "#c9c0ad", -7, 3, 0)); g.add(lmMesh(lmBox(2, 6, 12), "#c9c0ad", 7, 3, 0));
      g.add(lmMesh(lmBox(6, 8, 3), "#b5ab96", 0, 4, 6)); g.add(lmMesh(lmBox(3, 4.5, 3.4), "#3a3530", 0, 2.25, 6));
      for (const x of [-7, 7]) g.add(lmMesh(lmCyl(1.8, 1.8, 8, 8), "#b5ab96", x, 4, -6));
      g.add(lmMesh(lmBox(1, 2, 1), "#555", 4, 6.5, -6)); r = 10; break;
    case "pantai":
      g.add(lmMesh(lmCyl(14, 14, 0.3, 24), "#d6c08a", 0, 0.15, 0, { ns: 1 }));
      for (let i = 0; i < 3; i++) { const x = -6 + i * 6; g.add(lmMesh(lmCyl(0.15, 0.15, 4, 6), "#eee", x, 2, 3)); g.add(lmMesh(new T.ConeGeometry(2.8, 1.4, 8), pick(["#e85a5a", "#3e9ad6", "#f2c13a"]), x, 4.3, 3)); }
      lmPalm(g, -9, -6); lmPalm(g, 8, -7, 1.2); r = 0; break;
    case "tasik":
      g.add(lmMesh(lmCyl(15, 15, 0.25, 28), "#3aa6e0", 0, 0.12, 0, { ns: 1 }));
      g.add(lmMesh(lmBox(4, 1, 1.8), "#a3542f", 3, 0.6, 2)); g.add(lmMesh(lmCyl(4, 4, 0.5, 10), "#6fb84f", -6, 0.4, -5)); r = 0; break;
    case "hutan":
      for (let i = 0; i < 7; i++) { const a = i * 0.9, d = 4 + (i % 3) * 3.5, x = Math.cos(a) * d, z = Math.sin(a) * d; g.add(lmMesh(lmBox(1.4, 9, 1.4), "#6b4a2b", x, 4.5, z)); g.add(lmMesh(lmBox(7, 5, 7), pick(["#2f7d3a", "#3a8f43", "#2a6e33"]), x, 10, z)); }
      g.add(lmMesh(lmBox(16, 0.4, 1.4), "#b48a55", 0, 7, 0)); r = 11; break;
    case "pasar":
      for (let i = 0; i < 4; i++) { const x = -7.5 + i * 5; g.add(lmMesh(lmBox(4, 2.4, 3), "#b98a5a", x, 1.2, 0)); const aw = lmMesh(lmBox(4.6, 0.3, 3.8), pick(["#e85a5a", "#f2c13a", "#3e9ad6", "#3aa66a"]), x, 4, 0.4); aw.rotation.x = 0.25; g.add(aw); g.add(lmMesh(lmBox(0.3, 4, 0.3), "#7a5a3a", x - 2, 2, 2)); g.add(lmMesh(lmBox(0.3, 4, 0.3), "#7a5a3a", x + 2, 2, 2)); }
      r = 9; break;
    case "ladang":
      for (let i = 0; i < 6; i++) g.add(lmMesh(lmBox(20, 1.6, 1.8), "#3b8f3f", 0, 0.8 + i * 0.5, -8 + i * 3.2));
      g.add(lmMesh(lmBox(4, 3, 4), "#efe7d6", 12, 1.5, 6)); g.add(lmMesh(new T.ConeGeometry(3.4, 2, 4), "#b3492f", 12, 4, 6)); r = 0; break;
    case "sawah":
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) g.add(lmMesh(lmBox(7, 0.4, 7), (i + j) % 2 ? "#c9d65a" : "#9fcf4f", -8 + i * 8, 0.2, -8 + j * 8, { ns: 1 }));
      g.add(lmMesh(lmBox(3, 2.6, 3), "#a3542f", 13, 1.3, 0)); r = 0; break;
    case "jambatan":
      for (let i = 0; i < 3; i++) { const a = new T.Mesh(new T.TorusGeometry(4, 0.5, 6, 16, Math.PI), lmMat("#f2efe6")); a.position.set(-8 + i * 8, 0, 0); a.castShadow = true; g.add(a); }
      g.add(lmMesh(lmBox(24, 0.8, 4), "#d9d3c4", 0, 4.2, 0)); r = 0; break;
    case "bandar":
      for (let i = 0; i < 5; i++) g.add(lmMesh(lmBox(4, 4 + (i * 7) % 9, 4), pick(["#e8d9b8", "#d6e2ea", "#f0c9a8", "#c9d8c0"]), -10 + i * 5, (4 + (i * 7) % 9) / 2, -4));
      g.add(lmMesh(lmBox(26, 0.2, 5), "#3aa6e0", 0, 0.1, 5, { ns: 1 })); g.add(lmMesh(lmCyl(2.5, 3, 5, 8), "#e2b33c", 9, 6, -4)); r = 12; break;
    case "sungai":
      for (let i = 0; i < 6; i++) { const s = lmMesh(lmBox(7, 0.2, 4), "#3aa6e0", -15 + i * 6, 0.1, Math.sin(i) * 3, { ns: 1 }); s.rotation.y = Math.cos(i) * 0.4; g.add(s); }
      g.add(lmMesh(lmBox(4, 1, 1.6), "#a3542f", 0, 0.6, 1)); lmPalm(g, -8, -7); r = 0; break;
    default: g.add(lmMesh(lmBox(6, 6, 6), "#ccc", 0, 3, 0)); r = 5;
  }
  return { g: g, r: r };
}
/* Papan Kenangan: papan kayu bertulis nama pelawat, dengan tag nama tergantung pada tali */
function lmBoardDraw(pl) {
  return (x, w, h) => {
    x.fillStyle = "#6b4426"; x.fillRect(0, 0, w, h);
    x.fillStyle = "#c79a62"; x.fillRect(12, 12, w - 24, h - 24);
    x.fillStyle = "#3a2412"; x.textAlign = "center"; x.font = "900 34px Nunito, sans-serif"; x.fillText(pl.n.length > 26 ? pl.n.slice(0, 25) + "…" : pl.n, w / 2, 56);
    x.font = "700 20px Nunito, sans-serif"; x.fillStyle = "#5a3a1e"; x.fillText("PAPAN KENANGAN PELAWAT", w / 2, 86);
    const names = pl.names || [];
    x.font = "800 24px Nunito, sans-serif"; x.textAlign = "left";
    if (!names.length) { x.textAlign = "center"; x.fillStyle = "#5a3a1e"; x.fillText("Jadilah pelawat pertama!", w / 2, 170); x.fillText("Jawab kuiz dan gantung nama anda.", w / 2, 204); }
    names.slice(0, 10).forEach((v, i) => {
      const cx = i < 5 ? 34 : w / 2 + 10, cy = 126 + (i % 5) * 46;
      x.fillStyle = v.me ? "#f5c542" : "#f3e6c8"; lmRound(x, cx, cy - 26, w / 2 - 44, 38, 8); x.fill();
      x.fillStyle = "#2b1a0c"; x.fillText((v.n || "").slice(0, 14), cx + 10, cy);
    });
  };
}
function lmBoard(pl) {
  const g = new T.Group();
  const tex = lmTex(512, 360, lmBoardDraw(pl));
  const face = new T.Mesh(new T.PlaneGeometry(8, 5.6), new T.MeshLambertMaterial({ map: tex }));
  face.position.set(0, 4.4, 0.21); g.add(face);
  g.add(lmMesh(lmBox(8.6, 6.2, 0.4), "#5a3a1e", 0, 4.4, 0));
  g.add(lmMesh(lmBox(0.5, 4, 0.5), "#5a3a1e", -3.6, 1, 0)); g.add(lmMesh(lmBox(0.5, 4, 0.5), "#5a3a1e", 3.6, 1, 0));
  /* tali dan tag nama tergantung */
  const rope = lmMesh(lmBox(9, 0.08, 0.08), "#e6d3a8", 0, 7.9, 0.3, { ns: 1 }); g.add(rope);
  const tags = new T.Group(); tags.position.set(0, 7.9, 0.3); g.add(tags);
  pl.tex = tex; pl.tags = tags;
  return g;
}
function lmBoardRefresh(pl) {
  if (!pl.tex) return;
  const c = pl.tex.userData.c; pl.tex.userData.draw(c.getContext("2d"), c.width, c.height); pl.tex.needsUpdate = true;
  const tg = pl.tags; while (tg.children.length) tg.remove(tg.children[0]);
  (pl.names || []).slice(0, 10).forEach((v, i) => {
    const m = lmMesh(lmBox(0.7, 1, 0.1), v.me ? "#f5c542" : pick(["#e85a5a", "#3e9ad6", "#3aa66a", "#b76ae0", "#f08a3a"]), -4 + i * 0.9, -0.6, 0, { ns: 1 });
    m.userData.ph = i * 0.7; tg.add(m);
  });
}
/* Menara Ilmu: satu bagi setiap topik dalam negeri */
function lmTower(t) {
  const g = new T.Group(), col = (TEMA[t.tema] && TEMA[t.tema].warna) || "#5ad1ff";
  g.add(lmMesh(lmCyl(3.4, 4, 1.2, 8), "#d9dde3", 0, 0.6, 0));
  g.add(lmMesh(lmCyl(1.6, 2.2, 7, 8), "#eef1f4", 0, 4.6, 0));
  const cr = new T.Mesh(new T.OctahedronGeometry(1.8, 0), new T.MeshLambertMaterial({ color: col, emissive: col, emissiveIntensity: 0.45 }));
  cr.position.y = 10.4; g.add(cr);
  const pole = lmMesh(lmCyl(0.12, 0.12, 6, 6), "#888", 2.6, 3, 0); g.add(pole);
  const flag = lmMesh(lmBox(2.4, 1.4, 0.1), "#9aa3ad", 3.9, 5.2, 0); g.add(flag);
  return { g: g, cr: cr, flag: flag };
}
/* ---------- kapal terbang dan lapangan terbang realistik (v17.92) ---------- */
/* Pesawat: badan lathe licin, sayap condong, enjin, tingkap, kokpit, roda pendarat, ekor Jalur Gemilang.
   Livery umum "Gempur Air" (bukan jenama sebenar). Asal kumpulan = bawah roda; hidung ke arah +x. */
function lmFlagTex() {
  return GEO.flagT || (GEO.flagT = lmTex(128, 64, (x) => {
    for (let i = 0; i < 14; i++) { x.fillStyle = i % 2 ? "#ffffff" : "#cc0001"; x.fillRect(0, i * 64 / 14, 128, 64 / 14 + 0.5); }
    x.fillStyle = "#010066"; x.fillRect(0, 0, 64, 64 * 8 / 14); x.fillStyle = "#ffcc00";
    x.beginPath(); x.arc(26, 18, 13, 0, 6.2832); x.fill(); x.fillStyle = "#010066"; x.beginPath(); x.arc(31, 18, 11, 0, 6.2832); x.fill();
    x.fillStyle = "#ffcc00"; x.beginPath(); for (let i = 0; i < 28; i++) { const r = i % 2 ? 4 : 10, a = i / 28 * 6.2832 - 1.57; x.lineTo(46 + Math.cos(a) * r, 18 + Math.sin(a) * r); } x.fill();
  }));
}
function lmWinTex() {
  return GEO.winT || (GEO.winT = lmTex(1024, 64, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    x.fillStyle = "#c8102e"; x.fillRect(40, 44, w - 120, 8); x.fillStyle = "#1d3c8f"; x.fillRect(40, 54, w - 120, 6);
    x.fillStyle = "#1b2633"; for (let i = 0; i < 30; i++) { lmRound(x, 120 + i * 27, 18, 15, 19, 7); x.fill(); }
    lmRound(x, 70, 10, 20, 32, 5); x.fill(); lmRound(x, w - 150, 10, 20, 32, 5); x.fill();
    x.fillStyle = "#1d3c8f"; x.font = "900 26px Nunito, sans-serif"; x.fillText("GEMPUR AIR", w - 420, 40);
  }));
}
function lmPlane(opt) {
  opt = opt || {};
  const g = new T.Group(), body = new T.Group(); g.add(body); body.position.y = 3.1;
  const white = GEO.pW || (GEO.pW = new T.MeshStandardMaterial({ color: 0xf4f6f9, roughness: 0.38, metalness: 0.25 }));
  const grey = GEO.pG || (GEO.pG = new T.MeshStandardMaterial({ color: 0xc7ced8, roughness: 0.45, metalness: 0.45 }));
  const dark = GEO.pD || (GEO.pD = new T.MeshStandardMaterial({ color: 0x2a3038, roughness: 0.6, metalness: 0.3 }));
  const red = GEO.pR || (GEO.pR = new T.MeshStandardMaterial({ color: 0xc8102e, roughness: 0.45, metalness: 0.2 }));
  const sh = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
  /* badan */
  const fus = GEO.fus || (GEO.fus = (() => { const pts = [[0, -15.5], [0.35, -15.3], [0.9, -14.2], [1.45, -12], [1.85, -8.5], [1.95, -2], [1.95, 9], [1.8, 11.6], [1.4, 13.6], [0.8, 14.8], [0.2, 15.4], [0, 15.5]].map((p) => new T.Vector2(p[0], p[1])); const l = new T.LatheGeometry(pts, 22); l.rotateZ(-Math.PI / 2); return l; })());
  body.add(sh(new T.Mesh(fus, white)));
  /* tingkap dan jalur warna di kedua-dua sisi */
  const strip = new T.MeshBasicMaterial({ map: lmWinTex(), transparent: true, depthWrite: false });
  [-1, 1].forEach((s) => { const m = new T.Mesh(GEO.wst || (GEO.wst = new T.PlaneGeometry(27, 1.7)), strip); m.position.set(0.5, 0.15, s * 1.97); if (s < 0) m.rotation.y = Math.PI; body.add(m); });
  /* kokpit */
  const ck = new T.Mesh(GEO.ck || (GEO.ck = new T.SphereGeometry(1.2, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.32)), dark); ck.rotation.z = -1.05; ck.position.set(12.6, 0.55, 0); body.add(ck);
  /* sayap condong */
  const wingG = GEO.wing || (GEO.wing = (() => { const s = new T.Shape(); s.moveTo(3.2, 0); s.lineTo(-3.4, 14); s.lineTo(-5.4, 14); s.lineTo(-4.6, 0); s.closePath(); const e = new T.ExtrudeGeometry(s, { depth: 0.38, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.12, bevelSegments: 1 }); e.rotateX(Math.PI / 2); return e; })());
  [-1, 1].forEach((s) => {
    const w = sh(new T.Mesh(wingG, grey)); w.position.set(0.5, -0.9, 0); w.scale.z = s; w.rotation.x = s * -0.05; body.add(w);
    const wl = sh(new T.Mesh(GEO.wlet || (GEO.wlet = new T.BoxGeometry(1.6, 1.6, 0.15)), red)); wl.position.set(-4.6, -0.2, s * 14.05); wl.rotation.z = 0.35; body.add(wl);
    /* enjin bawah sayap */
    const ng = new T.Group(); ng.position.set(1.6, -2.1, s * 5.4); body.add(ng);
    const nac = sh(new T.Mesh(GEO.nac || (GEO.nac = new T.CylinderGeometry(1.05, 0.85, 4.2, 18).rotateZ(Math.PI / 2)), grey)); ng.add(nac);
    const intake = new T.Mesh(GEO.intk || (GEO.intk = new T.CircleGeometry(0.95, 18).rotateY(Math.PI / 2)), dark); intake.position.x = 2.11; ng.add(intake);
    const fan = new T.Mesh(GEO.fan || (GEO.fan = new T.BoxGeometry(0.05, 1.7, 0.18)), grey); fan.position.x = 2.0; ng.add(fan); ng.userData.fan = fan;
    const pyl = sh(new T.Mesh(GEO.pyl || (GEO.pyl = new T.BoxGeometry(2.4, 1.0, 0.3)), grey)); pyl.position.set(-0.2, 0.9, 0); ng.add(pyl);
    (g.userData.eng || (g.userData.eng = [])).push(ng);
  });
  /* ekor: penstabil mendatar dan sirip bendera */
  const hst = GEO.hst || (GEO.hst = (() => { const s = new T.Shape(); s.moveTo(1.2, 0); s.lineTo(-1.4, 5.6); s.lineTo(-2.6, 5.6); s.lineTo(-2.2, 0); s.closePath(); const e = new T.ExtrudeGeometry(s, { depth: 0.22, bevelEnabled: false }); e.rotateX(Math.PI / 2); return e; })());
  [-1, 1].forEach((s) => { const m = sh(new T.Mesh(hst, grey)); m.position.set(-12.4, 0.6, 0); m.scale.z = s; body.add(m); });
  const fin = GEO.fin || (GEO.fin = (() => { const s = new T.Shape(); s.moveTo(-9.8, 1.2); s.lineTo(-14.4, 7.6); s.lineTo(-16.4, 7.6); s.lineTo(-15.6, 1.2); s.closePath(); return new T.ExtrudeGeometry(s, { depth: 0.3, bevelEnabled: false }).translate(0, 0, -0.15); })());
  body.add(sh(new T.Mesh(fin, red)));
  const fl = new T.MeshBasicMaterial({ map: lmFlagTex() });
  [-1, 1].forEach((s) => { const m = new T.Mesh(GEO.finf || (GEO.finf = new T.PlaneGeometry(3.6, 1.8)), fl); m.position.set(-14.1, 5.4, s * 0.17); if (s < 0) m.rotation.y = Math.PI; body.add(m); });
  /* roda pendarat */
  const gear = new T.Group(); body.add(gear); g.userData.gear = gear;
  const wheel = GEO.whl || (GEO.whl = new T.CylinderGeometry(0.55, 0.55, 0.5, 14).rotateX(Math.PI / 2));
  [[9.5, 0], [-1, -2.1], [-1, 2.1]].forEach(([x, z]) => { const st = new T.Mesh(GEO.strut || (GEO.strut = new T.CylinderGeometry(0.12, 0.12, 2.2, 6)), grey); st.position.set(x, -1.9, z); gear.add(st); const w = new T.Mesh(wheel, dark); w.position.set(x, -2.55, z); gear.add(w); });
  /* lampu kilat di hujung sayap */
  const beacon = new T.Mesh(GEO.bcn || (GEO.bcn = new T.SphereGeometry(0.22, 8, 6)), new T.MeshBasicMaterial({ color: 0xff3040 })); beacon.position.set(-2, 2.1, 0); body.add(beacon); g.userData.beacon = beacon;
  g.userData.body = body;
  if (opt.scale) g.scale.setScalar(opt.scale);
  return g;
}
/* tekstur landasan: garisan tengah, tepi, jalur ambang di kedua-dua hujung */
function lmRunwayTex(len) {
  return lmTex(1024, 128, (x, w, h) => {
    x.fillStyle = "#3b4048"; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 300; i++) { x.fillStyle = "rgba(255,255,255," + (Math.random() * 0.04) + ")"; x.fillRect(Math.random() * w, Math.random() * h, 3, 2); }
    x.fillStyle = "#f2f2ea"; x.fillRect(0, 6, w, 4); x.fillRect(0, h - 10, w, 4);
    for (let i = 70; i < w - 70; i += 44) x.fillRect(i, h / 2 - 2, 24, 4);
    for (const e of [10, w - 46]) for (let j = 0; j < 8; j++) x.fillRect(e, 18 + j * 12, 36, 7);
    x.font = "900 26px sans-serif"; x.save(); x.translate(70, h / 2); x.rotate(Math.PI / 2); x.textAlign = "center"; x.fillText("09", 0, -6); x.restore();
    x.save(); x.translate(w - 70, h / 2); x.rotate(-Math.PI / 2); x.textAlign = "center"; x.fillText("27", 0, -6); x.restore();
  });
}
/* lapangan terbang lengkap dalam koordinat tempatan: landasan sepanjang paksi x, terminal di +z */
function lmAirport(L) {
  const g = new T.Group();
  const rw = new T.Mesh(new T.PlaneGeometry(L * 2, 10).rotateX(-Math.PI / 2), new T.MeshLambertMaterial({ map: lmRunwayTex(L) })); rw.position.y = 0.12; rw.receiveShadow = true; g.add(rw);
  const conc = lmMat("#b9b5ab");
  g.add(lmMesh(lmBox(5, 0.18, 14), conc, 0, 0.09, 11, { ns: 1 }));
  g.add(lmMesh(lmBox(46, 0.2, 18), conc, 0, 0.1, 25, { ns: 1 }));
  /* terminal kaca */
  g.add(lmMesh(lmBox(30, 3.2, 9), "#e5e2dc", 0, 1.6, 38));
  const glass = GEO.glass || (GEO.glass = new T.MeshStandardMaterial({ color: 0x6fb6e6, roughness: 0.12, metalness: 0.6, transparent: true, opacity: 0.85 }));
  const gl = new T.Mesh(lmBox(29, 3.8, 8.6), glass); gl.position.set(0, 5.1, 38); gl.castShadow = true; g.add(gl);
  const roof = lmMesh(lmBox(33, 0.6, 12), "#f4f4f2", 0, 7.3, 38); roof.rotation.x = -0.06; g.add(roof);
  /* jambatan penumpang ke pesawat diparkir */
  g.add(lmMesh(lmBox(2.4, 2.4, 7), "#d4d8de", 6, 4.2, 30.4));
  /* menara kawalan */
  g.add(lmMesh(lmCyl(1.2, 1.6, 18, 12), "#e5e2dc", 21, 9, 34));
  const cab = new T.Mesh(lmCyl(3, 2.4, 3, 12), glass); cab.position.set(21, 19.4, 34); g.add(cab);
  g.add(lmMesh(lmCyl(3.4, 3.4, 0.6, 12), "#f4f4f2", 21, 21.2, 34));
  /* stoking angin */
  g.add(lmMesh(lmCyl(0.08, 0.08, 5, 6), "#cfcfcf", -L + 8, 2.5, -9));
  const sock = lmMesh(new T.ConeGeometry(0.6, 2.4, 10, 1, true), "#ff7a1a", -L + 9.2, 4.6, -9); sock.rotation.z = Math.PI / 2; g.add(sock);
  /* lampu tepi landasan */
  const n = Math.floor(L * 2 / 8) + 1, lights = new T.InstancedMesh(GEO.rl || (GEO.rl = new T.SphereGeometry(0.28, 6, 4)), new T.MeshBasicMaterial({ color: 0xfff2b0 }), n * 2), mt = new T.Matrix4();
  for (let i = 0; i < n; i++) for (const s of [-1, 1]) { mt.makeTranslation(-L + i * 8, 0.35, s * 5.4); lights.setMatrixAt(i * 2 + (s > 0 ? 1 : 0), mt); }
  g.add(lights); g.userData.lights = lights;
  /* pesawat diparkir di pintu berlepas */
  const pl = lmPlane(); pl.position.set(-4, 0.2, 23); pl.rotation.y = Math.PI; g.add(pl); g.userData.parked = pl;
  return g;
}
/* cari arah landasan yang muat di atas daratan dan tidak melanggar menara atau mercu tanda */
function lmRunwayFit(cx, cz, blocked, state) {
  for (const pass of state ? [1, 0] : [0]) for (const L of [46, 40, 34, 28]) {
    for (let r = 0; r <= 48; r += 8) for (let ai = 0; ai < (r ? 12 : 1); ai++) {
      const ox = cx + Math.cos(ai * 0.5236) * r, oz = cz + Math.sin(ai * 0.5236) * r;
      for (let k = 0; k < 12; k++) {
        const a = k * Math.PI / 12, ux = Math.cos(a), uz = Math.sin(a), px = -uz, pz = ux;
        let ok = true;
        for (let t = -L - 4; t <= L + 4 && ok; t += 6) for (const w of [-7, 0, 7]) { const x = ox + ux * t + px * w, z = oz + uz * t + pz * w, kk = lmAt(x, z); if (!kk || kk === "jambatan") ok = false; }
        for (const off of [14, 25, 38, 45]) for (const t of [-22, 0, 22]) { if (!ok) break; const x = ox + px * off + ux * t, z = oz + pz * off + uz * t, kk = lmAt(x, z); if (!kk || kk === "jambatan") ok = false; }
        if (ok && blocked.some((b) => lmSegDist(b.x, b.z, ox - ux * (L + 6), oz - uz * (L + 6), ox + ux * (L + 6), oz + uz * (L + 6)) < b.r + 10 || Math.hypot(b.x - (ox + px * 34), b.z - (oz + pz * 34)) < b.r + 26)) ok = false;
        if (ok && pass && lmAt(ox, oz) !== state && lmAt(ox + px * 49, oz + pz * 49) !== state) ok = false;
        if (ok) return { x: ox, z: oz, a: a, L: L };
      }
    }
  }
  return { x: cx, z: cz, a: 0, L: 26 };
}

/* ---------- kepulan wap / asap (kolam sprite) ---------- */
function lmPuffs(g) {
  if (g.puffs) return g.puffs;
  const tex = lmTex(64, 64, (x) => { const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); });
  const pool = [];
  for (let i = 0; i < 140; i++) { const s = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 })); s.visible = false; g.scene.add(s); pool.push({ s: s, life: 0, max: 1, grow: 1 }); }
  g.puffs = { pool: pool, i: 0 };
  return g.puffs;
}
function lmPuff(g, x, y, z, size, life, grow, op) {
  const P = lmPuffs(g), p = P.pool[P.i]; P.i = (P.i + 1) % P.pool.length;
  p.s.position.set(x, y, z); p.s.scale.set(size, size, 1); p.s.visible = true; p.life = p.max = life; p.grow = grow; p.op = op == null ? 0.7 : op; p.s.material.opacity = p.op;
}
function lmPuffTick(g, dt) {
  if (!g.puffs) return;
  for (const p of g.puffs.pool) { if (p.life <= 0) continue; p.life -= dt; const k = p.life / p.max; p.s.material.opacity = Math.max(0, p.op * k); const sc = p.s.scale.x + p.grow * dt; p.s.scale.set(sc, sc, 1); if (p.life <= 0) p.s.visible = false; }
}
/* ---------- bunyi enjin (hingar bertapis) ---------- */
function lmEngine(level) {
  try {
    if (LM.mute) level = 0;
    if (!LM.eng) {
      if (!level) return;
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
      const ac = (typeof AR !== "undefined" && AR.ctx) || (LM.ac = LM.ac || new C()); if (ac.state === "suspended") ac.resume();
      const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
      const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 300;
      const hum = ac.createOscillator(); hum.type = "sawtooth"; hum.frequency.value = 70; const hg = ac.createGain(); hg.gain.value = 0.15;
      const gain = ac.createGain(); gain.gain.value = 0;
      src.connect(lp); hum.connect(hg); hg.connect(lp); lp.connect(gain); gain.connect(ac.destination); src.start(); hum.start();
      LM.eng = { ac: ac, src: src, hum: hum, lp: lp, gain: gain };
    }
    const e = LM.eng, t = e.ac.currentTime, vol = (typeof SET !== "undefined" && SET.sfx != null ? SET.sfx : 0.8) * 0.2;
    e.gain.gain.setTargetAtTime(level * vol, t, 0.3); e.lp.frequency.setTargetAtTime(250 + level * 1400, t, 0.4); e.hum.frequency.setTargetAtTime(60 + level * 90, t, 0.4);
    if (!level) { const x = e; LM.eng = null; setTimeout(() => { try { x.src.stop(); x.hum.stop(); x.gain.disconnect(); } catch (er) { /* abaikan */ } }, 1500); }
  } catch (e) { /* abaikan */ }
}
function lmChime() { if (LM.mute) return; arBeep(880, 0.35, "sine", 0.05); setTimeout(() => arBeep(660, 0.5, "sine", 0.05), 260); }

/* ---------- penerbangan sinematik ---------- */
function lmBezier(a, b, c, d, t) { const u = 1 - t; return new T.Vector3(u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x, u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y, u * u * u * a.z + 3 * u * u * t * b.z + 3 * u * t * t * c.z + t * t * t * d.z); }
function lmFlyStart(ap, dst) {
  const g = LM.g; if (!g || g.flight) return;
  const A = ap.rw, B = dst.rw, ab = new T.Vector3(B.x - A.x, 0, B.z - A.z).normalize();
  let u = new T.Vector3(Math.cos(A.a), 0, Math.sin(A.a)); if (u.dot(ab) < 0) u.negate();
  let v = new T.Vector3(Math.cos(B.a), 0, Math.sin(B.a)); if (v.dot(ab) < 0) v.negate();
  const gyA = lmHRaw(A.x, A.z) + 0.2, gyB = lmHRaw(B.x, B.z) + 0.2;
  const S = new T.Vector3(A.x - u.x * (A.L - 6), gyA, A.z - u.z * (A.L - 6)), P0 = new T.Vector3(A.x + u.x * A.L * 0.55, gyA, A.z + u.z * A.L * 0.55);
  const P3 = new T.Vector3(B.x - v.x * (B.L - 8), gyB, B.z - v.z * (B.L - 8)), E = new T.Vector3(B.x + v.x * B.L * 0.45, gyB, B.z + v.z * B.L * 0.45);
  const P1 = P0.clone().addScaledVector(u, 240).add(new T.Vector3(0, 150, 0)), P2 = P3.clone().addScaledVector(v, -460).add(new T.Vector3(0, 120, 0));
  /* jadual panjang lengkok untuk kelajuan seragam */
  const N = 160, pts = [], len = [0]; for (let i = 0; i <= N; i++) pts.push(lmBezier(P0, P1, P2, P3, i / N));
  for (let i = 1; i <= N; i++) len.push(len[i - 1] + pts[i].distanceTo(pts[i - 1]));
  const air = clamp(len[N] / 120, 9, 20);
  const plane = lmPlane(); g.scene.add(plane); plane.position.copy(S);
  if (ap.m && ap.m.userData.parked) ap.m.userData.parked.visible = false;
  g.flight = { ap: ap, dst: dst, plane: plane, S: S, P0: P0, P3: P3, E: E, u: u, v: v, pts: pts, len: len, air: air, ph: "board", t: 0, yaw: Math.atan2(-u.z, u.x), pitch: 0, bank: 0, spd: 0, puffT: 0, code: "GA " + (100 + Math.floor(Math.random() * 800)) };
  g.me.g.visible = false; g.ui = true; lmCardClose(); g.ui = true;
  if (g.sky5) g.sky5.sp.visible = false;
  lmFlightHud(true); lmPop("Sila pasang tali pinggang keledar"); lmChime();
}
function lmFlightHud(on) {
  const r = LM.root; let h = LM.ui.fl;
  if (!on) { if (h) h.remove(); LM.ui.fl = null; return; }
  if (!h) {
    h = el("div", { class: "lm-fl" }); LM.ui.fl = h; r.appendChild(h);
    const f = LM.g.flight;
    h.append(el("b", null, "✈ " + f.code + " · " + f.ap.n.replace("Lapangan Terbang ", "") + " → " + f.dst.n.replace("Lapangan Terbang ", "")), el("span", { class: "lm-fl-st" }, "Menaiki pesawat..."), el("div", { class: "lm-bar" }, el("i")));
    const sk = lmBtn("Langkau ke pendaratan", "", () => { const g = LM.g; if (g && g.flight && g.flight.ph === "air") g.flight.t = g.flight.air * 0.86; else if (g && g.flight && (g.flight.ph === "roll" || g.flight.ph === "board")) { g.flight.ph = "air"; g.flight.t = g.flight.air * 0.86; } });
    h.appendChild(sk);
  }
}
function lmFlightTick(g, dt) {
  const f = g.flight, pl = f.plane, cam = g.camera; f.t += dt;
  const gear = pl.userData.gear, body = pl.userData.body;
  let pos = pl.position, fwd = new T.Vector3(Math.cos(f.yaw), 0, -Math.sin(f.yaw)), st = "", prog = 0;
  if (f.ending) return;
  if (f.ph === "board") { st = "Menaiki pesawat..."; if (f.t > 1.6) { f.ph = "roll"; f.t = 0; lmEngine(0.55); } }
  else if (f.ph === "roll") {
    /* memecut di landasan */
    const T0 = 4.2, k = Math.min(1, f.t / T0), d = f.S.distanceTo(f.P0) * k * k; pos.copy(f.S).addScaledVector(f.u, d); pos.y = f.S.y;
    f.spd = 2 * f.S.distanceTo(f.P0) * k / T0; f.pitch = k > 0.8 ? (k - 0.8) * 0.5 : 0; st = "Memecut di landasan · " + Math.round(f.spd * 9) + " km/j";
    lmEngine(0.55 + 0.45 * k);
    if (Math.random() < dt * 20) lmPuff(g, pos.x - f.u.x * 4, pos.y + 0.5, pos.z - f.u.z * 4, 2, 0.8, 4, 0.35);
    if (k >= 1) { f.ph = "air"; f.t = 0; lmPop("Berlepas!"); }
  } else if (f.ph === "air") {
    const k = Math.min(1, f.t / f.air), s = k * f.len[f.len.length - 1];
    let i = 1; while (i < f.len.length - 1 && f.len[i] < s) i++;
    const a = f.pts[i - 1], b = f.pts[i], fr = (s - f.len[i - 1]) / Math.max(0.001, f.len[i] - f.len[i - 1]);
    const np = a.clone().lerp(b, fr);
    if (k < 0.85) np.y = Math.max(np.y, lmHRaw(np.x, np.z) + 26 * Math.min(1, k * 8));
    const dir = b.clone().sub(a).normalize(), nyaw = Math.atan2(-dir.z, dir.x);
    let dy = nyaw - f.yaw; while (dy > Math.PI) dy -= 6.2832; while (dy < -Math.PI) dy += 6.2832;
    f.bank += (clamp(-dy / Math.max(dt, 0.001) * 0.35, -0.6, 0.6) - f.bank) * Math.min(1, dt * 2);
    f.yaw = nyaw; f.pitch += (Math.asin(clamp(dir.y, -1, 1)) - f.pitch) * Math.min(1, dt * 3);
    pos.copy(np); f.spd = f.len[f.len.length - 1] / f.air;
    gear.visible = k < 0.08 || k > 0.82; prog = k;
    st = k > 0.8 ? "Menghampiri " + f.dst.n.replace("Lapangan Terbang ", "") : "Ketinggian " + Math.round(pos.y * 110).toLocaleString("ms-MY") + " kaki · " + Math.round(f.spd * 7) + " km/j";
    lmEngine(k > 0.8 ? 0.45 : 0.75);
    f.puffT -= dt;
    if (f.puffT <= 0 && pos.y > 40) { f.puffT = 0.05; const side = new T.Vector3(-dir.z, 0, dir.x).normalize(); for (const s2 of [-5.4, 5.4]) lmPuff(g, pos.x - dir.x * 5 + side.x * s2, pos.y + 1, pos.z - dir.z * 5 + side.z * s2, 1.6, 2.6, 2.5, 0.55); }
    if (k >= 1) { f.ph = "land"; f.t = 0; lmChime(); for (let j = 0; j < 10; j++) lmPuff(g, pos.x + (Math.random() - 0.5) * 6, pos.y + 0.6, pos.z + (Math.random() - 0.5) * 6, 2.5, 1.4, 5, 0.7); lmPop("Mendarat!"); }
  } else if (f.ph === "land") {
    /* larian selepas mendarat, perlahan hingga berhenti */
    const T1 = 3.6, k = Math.min(1, f.t / T1), d = f.P3.distanceTo(f.E) * (1 - (1 - k) * (1 - k)); pos.copy(f.P3).addScaledVector(f.v, d); pos.y = f.P3.y;
    f.yaw = Math.atan2(-f.v.z, f.v.x); f.pitch *= 0.9; f.bank *= 0.85; gear.visible = true; prog = 1; st = "Selamat mendarat · " + Math.round((1 - k) * 230) + " km/j";
    lmEngine(0.35 * (1 - k));
    if (k >= 1) { lmFlyEnd(g); return; }
  }
  pl.rotation.set(0, f.yaw, 0); body.rotation.set(f.bank, 0, f.pitch, "YXZ");
  for (const e of pl.userData.eng || []) e.userData.fan.rotation.x += dt * 30;
  pl.userData.beacon.material.color.setHex((g.T * 2) % 1 < 0.15 ? 0xff3040 : 0x401010);
  /* kamera mengekori */
  fwd = new T.Vector3(Math.cos(f.yaw), 0, -Math.sin(f.yaw));
  const back = f.ph === "air" ? 46 : 34, up = f.ph === "air" ? 15 : 9, side = f.ph === "board" ? 22 : 0;
  const want = pos.clone().addScaledVector(fwd, -back).add(new T.Vector3(-fwd.z * side, up + 3, fwd.x * side));
  want.y = Math.max(want.y, lmGround(want.x, want.z) + 3);
  cam.position.lerp(want, Math.min(1, dt * (f.ph === "air" ? 2.2 : 3)));
  cam.lookAt(pos.x + fwd.x * 12, pos.y + 4, pos.z + fwd.z * 12);
  if (g.dome) g.dome.position.copy(cam.position);
  lmSkyPlace(g);
  if (g.sun) { const sd = g.sunDir || new T.Vector3(0.45, 0.8, 0.3); g.sun.position.set(pos.x + sd.x * 150, pos.y + sd.y * 150, pos.z + sd.z * 150); g.sun.target.position.copy(pos); g.sun.target.updateMatrixWorld(); if (g.sunDisc) g.sunDisc.position.set(cam.position.x + sd.x * 1100, cam.position.y + sd.y * 1100, cam.position.z + sd.z * 1100); }
  /* pemain ikut pesawat (untuk peta mini dan rakan) */
  g.p.x = pos.x; g.p.z = pos.z; g.p.y = pos.y; g.p.yaw = Math.atan2(fwd.x, fwd.z);
  const h = LM.ui.fl; if (h) { const s = h.querySelector(".lm-fl-st"); if (s && s.textContent !== st) s.textContent = st; const bi = h.querySelector(".lm-bar i"); if (bi) bi.style.width = Math.round(prog * 100) + "%"; }
}
function lmFlyEnd(g) {
  const f = g.flight; if (!f || f.ending) return; f.ending = true;
  const fade = LM.ui.fade; if (fade) fade.style.opacity = "1";
  setTimeout(() => {
    if (!LM.g) return;
    g.scene.remove(f.plane); if (f.ap.m && f.ap.m.userData.parked) f.ap.m.userData.parked.visible = true;
    g.flight = null; g.me.g.visible = true; g.ui = false; lmFlightHud(false); lmEngine(0);
    if (g.sky5) g.sky5.sp.visible = LM.st.sky !== 0;
    const d = f.dst; g.p.x = d.x; g.p.z = d.z; g.p.y = lmGround(d.x, d.z); g.p.vx = g.p.vz = 0; g.p.vy = 0;
    g.cam.yaw = Math.atan2(d.x - d.rw.x, d.z - d.rw.z); g.camera.position.set(d.x + Math.sin(g.cam.yaw) * 18, g.p.y + 8, d.z + Math.cos(g.cam.yaw) * 18);
    if (fade) fade.style.opacity = "0";
    LM.st.fl = (LM.st.fl | 0) + 1; if (!LM.st.ap || typeof LM.st.ap !== "object") LM.st.ap = {};
    let msg = "Selamat datang ke " + DATA.negeri[d.k].pendek + "!";
    if (!LM.st.ap[d.id]) { LM.st.ap[d.id] = Date.now(); let n = 0; try { n = gdCoin(5); } catch (e) { n = 0; } if (n) msg += " Cop lapangan terbang +" + n + " syiling"; }
    lmSave(); lmPop(msg);
  }, 450);
}
/* ---------- lalu lintas udara: pesawat lain melintas di langit ---------- */
function lmTrafficInit(g) {
  const aps = g.items.filter((x) => x.kind === "ap"); if (aps.length < 2) return;
  g.traffic = [];
  for (let i = 0; i < (LM.gq ? 3 : 2); i++) { const p = lmPlane(); g.scene.add(p); const t = { p: p, a: null, b: null, k: 1 + Math.random(), sp: 85 + Math.random() * 30, y: 175 + i * 18 }; g.traffic.push(t); }
}
function lmTrafficTick(g, dt) {
  if (!g.traffic) return;
  const aps = g.items.filter((x) => x.kind === "ap");
  for (const t of g.traffic) {
    if (t.k >= 1) { t.a = pick(aps); do { t.b = pick(aps); } while (t.b === t.a); t.k = 0; t.d = Math.hypot(t.b.x - t.a.x, t.b.z - t.a.z); }
    t.k += dt * t.sp / Math.max(1, t.d);
    const x = t.a.x + (t.b.x - t.a.x) * t.k, z = t.a.z + (t.b.z - t.a.z) * t.k;
    t.p.position.set(x, t.y, z); t.p.rotation.y = Math.atan2(-(t.b.z - t.a.z), t.b.x - t.a.x);
    t.p.userData.gear.visible = false;
    t.pt = (t.pt || 0) - dt;
    if (t.pt <= 0 && Math.hypot(x - g.p.x, z - g.p.z) < 900) { t.pt = 0.12; const dx = (t.b.x - t.a.x) / t.d, dz = (t.b.z - t.a.z) / t.d; lmPuff(g, x - dx * 6, t.y + 2.5, z - dz * 6, 2, 3.5, 2.2, 0.5); }
  }
}
/* ---------- pulau Misi Khas dan feri (v17.94) ---------- */
/* Pulau dalam koordinat SVG beranjak (Borneo sudah +BX). kh: senarai id Misi Khas mengikut keutamaan.
   from: negeri jeti tanah besar. pk: puncak [dx, dy, tinggi, jejari dunia]. */
const ISLANDS = [
  { id: "i-lkw", n: "Pulau Langkawi", kh: ["K4", "K3"], x: 40, y: 80, rx: 11, ry: 9, from: "kedah", port: "Jeti Kuala Kedah", lm: "helang", pk: [[-3, -2, 34, 34]] },
  { id: "i-tio", n: "Pulau Tioman", kh: ["K5"], x: 240, y: 212, rx: 5, ry: 8.5, from: "johor", port: "Jeti Mersing", lm: "tioman", pk: [[0, 2.5, 30, 16], [1.4, 4, 26, 12]] },
  { id: "i-pkr", n: "Pulau Pangkor", kh: ["KS"], x: 75, y: 172, rx: 6, ry: 7, from: "perak", port: "Jeti Lumut", lm: "kota", pk: [[0, -2, 16, 18]] },
  { id: "i-sip", n: "Pulau Sipadan", kh: ["KR"], x: 650, y: 197, rx: 6.5, ry: 6, from: "sabah", port: "Jeti Semporna", lm: "rumahapi", pk: [] }
];
const ISL_BY = {};
function lmIslands() {
  if (LM.isl) return LM.isl;
  const out = [];
  ISLANDS.forEach((d, j) => {
    const kid = d.kh.find((k) => typeof KHAS_BY !== "undefined" && KHAS_BY[k]); if (!kid) return;
    const R = lmRand(d.id), pts = [];
    for (let i = 0; i < 28; i++) { const a = i / 28 * 6.2832, k = 0.82 + R() * 0.3 + Math.sin(a * 3 + j) * 0.06; pts.push([d.x + Math.cos(a) * d.rx * k, d.y + Math.sin(a) * d.ry * k]); }
    const p = new Path2D(); pts.forEach((q, i) => (i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1]))); p.closePath();
    const o = Object.assign({}, d, { j: j, kid: kid, khas: KHAS_BY[kid], pts: pts, path: p });
    out.push(o); ISL_BY[d.id] = o;
  });
  LM.isl = out; return out;
}
/* lukis pulau ke peta raster (saluran hijau) */
function lmRasterIslands(x) {
  lmIslands().forEach((o) => { x.setTransform(RS, 0, 0, RS, -RX0 * RS, -RY0 * RS); x.fillStyle = "rgb(0," + ((o.j + 1) * 40) + ",0)"; x.fill(o.path); });
}
const lmIslW = (o) => ({ x: (o.x - OX) * SC, z: (o.y - OZ) * SC });
function lmPlaceName(k) { return ISL_BY[k] ? ISL_BY[k].n : k === "jambatan" ? "Jambatan Pulau Pinang" : DATA.negeri[k] ? DATA.negeri[k].nama : "Laut"; }
function lmPlaceShort(k) { return ISL_BY[k] ? ISL_BY[k].n : DATA.negeri[k] ? DATA.negeri[k].pendek : "Laut"; }

/* ---------- model: feri, jeti, mercu tanda pulau, markas ---------- */
function lmFerry() {
  const g = new T.Group(), body = new T.Group(); g.add(body); g.userData.body = body;
  const hullG = GEO.hull || (GEO.hull = (() => { const s = new T.Shape(); s.moveTo(-9, -3); s.lineTo(7, -3); s.quadraticCurveTo(12.5, -2.2, 13, 0); s.quadraticCurveTo(12.5, 2.2, 7, 3); s.lineTo(-9, 3); s.closePath(); const e = new T.ExtrudeGeometry(s, { depth: 2.6, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.3, bevelSegments: 2 }); e.rotateX(-Math.PI / 2); e.translate(0, -1.6, 0); return e; })());
  const sm = (c, o) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.5, metalness: 0.15 }, o || {}));
  const hull = new T.Mesh(hullG, GEO.hullM || (GEO.hullM = sm(0x1d4f9a))); hull.castShadow = true; body.add(hull);
  const deck = new T.Mesh(GEO.deck || (GEO.deck = new T.BoxGeometry(20, 0.3, 5.6)), GEO.deckM || (GEO.deckM = sm(0xd9c9a3))); deck.position.set(1.5, 1.15, 0); body.add(deck);
  const cab = new T.Mesh(GEO.cab || (GEO.cab = new T.BoxGeometry(9, 3, 5)), GEO.cabM || (GEO.cabM = sm(0xf4f6f9))); cab.position.set(-2.5, 2.8, 0); cab.castShadow = true; body.add(cab);
  const win = new T.Mesh(GEO.fwin || (GEO.fwin = new T.BoxGeometry(9.1, 0.9, 5.1)), GEO.fwinM || (GEO.fwinM = sm(0x22394f, { roughness: 0.15, metalness: 0.5 }))); win.position.set(-2.5, 3.3, 0); body.add(win);
  const bridge = new T.Mesh(GEO.brg2 || (GEO.brg2 = new T.BoxGeometry(3.5, 2, 4)), GEO.cabM); bridge.position.set(-4, 5.3, 0); body.add(bridge);
  const fun = new T.Mesh(GEO.fun || (GEO.fun = new T.CylinderGeometry(0.6, 0.7, 2.2, 10)), GEO.funM || (GEO.funM = sm(0xc8102e))); fun.position.set(-7, 5.2, 0); body.add(fun);
  const pole = new T.Mesh(GEO.fpole || (GEO.fpole = new T.CylinderGeometry(0.06, 0.06, 3, 6)), GEO.cabM); pole.position.set(-8.5, 4.3, 0); body.add(pole);
  const flag = new T.Mesh(GEO.fflag || (GEO.fflag = new T.PlaneGeometry(1.8, 0.9)), new T.MeshBasicMaterial({ map: lmFlagTex(), side: T.DoubleSide })); flag.position.set(-9.4, 5.4, 0); body.add(flag); g.userData.flag = flag;
  const rail = new T.Mesh(GEO.rail || (GEO.rail = new T.BoxGeometry(9, 0.6, 0.12)), GEO.cabM); [-2.7, 2.7].forEach((z) => { const r = rail.clone(); r.position.set(6.5, 1.6, z); body.add(r); });
  return g;
}
function lmJettyModel(len, name) {
  const g = new T.Group(), wood = lmMat("#8a6239"), post = lmMat("#5e4126");
  const deck = lmMesh(lmBox(len, 0.5, 5), wood, len / 2, 1.0, 0); g.add(deck);
  for (let i = 0; i <= len; i += 5) for (const z of [-2.3, 2.3]) g.add(lmMesh(lmBox(0.5, 9, 0.5), post, i, -3.4, z));
  g.add(lmMesh(lmBox(5, 3.4, 4), "#f0e6d0", -3, 1.7, 6)); g.add(lmMesh(new T.ConeGeometry(4, 1.8, 4), "#b3492f", -3, 4.3, 6));
  const sign = lmLabel("⛴ " + name, { fs: 26, k: 0.026, bg: "rgba(10,60,90,.85)", bd: "#7fe3ff" }); sign.position.set(-3, 7, 6); g.add(sign);
  return g;
}
function lmHelang() {
  const g = new T.Group(), br = lmMat("#7a4a26"), wh = lmMat("#f2f0ea");
  g.add(lmMesh(lmCyl(4, 5, 3, 10), "#cfc6b4", 0, 1.5, 0));
  const b = lmMesh(lmSph(1.6, 12, 10), br, 0, 6.5, 0); b.scale.set(1, 1.6, 1.1); g.add(b);
  const h = lmMesh(lmSph(0.9, 12, 10), wh, 0, 9.4, 0.5); g.add(h);
  const bk = lmMesh(new T.ConeGeometry(0.35, 1, 8), "#e8b93a", 0, 9.3, 1.5); bk.rotation.x = Math.PI / 2; g.add(bk);
  [-1, 1].forEach((s) => { const w = lmMesh(lmBox(7, 0.4, 2.4), br, s * 4.2, 8, -0.3); w.rotation.z = s * 0.45; g.add(w); });
  return { g: g, r: 5 };
}
function lmRumahApi() {
  const g = new T.Group();
  for (let i = 0; i < 6; i++) g.add(lmMesh(lmCyl(1.6 - i * 0.12, 1.7 - i * 0.12, 2.6, 14), i % 2 ? "#d63b3b" : "#f4f4f2", 0, 1.3 + i * 2.6, 0));
  const lamp = new T.Mesh(lmCyl(1.1, 1.1, 1.6, 12), new T.MeshBasicMaterial({ color: 0xfff1a0 })); lamp.position.y = 16.6; g.add(lamp); g.userData.lamp = lamp;
  g.add(lmMesh(new T.ConeGeometry(1.4, 1.6, 12), "#d63b3b", 0, 18.2, 0));
  return { g: g, r: 3 };
}
function lmMarkas(o) {
  const g = new T.Group(), c = (o.khas && o.khas.warna) || "#d9573a";
  g.add(lmMesh(lmCyl(6, 7, 1.4, 8), "#8d8576", 0, 0.7, 0));
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.2832; g.add(lmMesh(lmBox(1.4, 2.6, 1.4), "#8d8576", Math.cos(a) * 6.2, 2.4, Math.sin(a) * 6.2)); }
  g.add(lmMesh(lmCyl(2.2, 2.6, 7, 10), "#e6dcc6", 0, 4.9, 0));
  const cr = new T.Mesh(new T.OctahedronGeometry(2.2, 0), new T.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: 0.5 })); cr.position.y = 11.4; g.add(cr);
  const pole = lmMesh(lmCyl(0.12, 0.12, 8, 6), "#888", 3.4, 4, 0); g.add(pole);
  const flag = lmMesh(lmBox(3, 1.7, 0.1), "#9aa3ad", 5, 7.2, 0); g.add(flag);
  return { g: g, cr: cr, flag: flag };
}
/* titik pantai tanah besar paling hampir dengan pulau */
function lmCoastNear(state, sx, sy, blocked) {
  /* titik pantai terdekat yang lapang (jauh daripada menara, mercu tanda dan bukit) */
  const all = [];
  DATA.negeri[state].d.split("M").filter(Boolean).forEach((sp) => {
    const n = sp.replace(/Z/g, "").match(/-?[\d.]+/g).map(Number);
    for (let i = 0; i < n.length; i += 2) { const px = shiftX(state, n[i]), py = n[i + 1]; all.push({ d: Math.hypot(px - sx, py - sy), x: px, y: py }); }
  });
  all.sort((a, b) => a.d - b.d);
  const ix = (sx - OX) * SC, iz = (sy - OZ) * SC;
  const coast = (q) => { const wx = (q.x - OX) * SC, wz = (q.y - OZ) * SC, l = Math.hypot(ix - wx, iz - wz) || 1, ux = (ix - wx) / l, uz = (iz - wz) / l; return lmAt(wx + ux * 8, wz + uz * 8) === "" && lmAt(wx - ux * 8, wz - uz * 8) === state; };
  const free = (q) => { const wx = (q.x - OX) * SC, wz = (q.y - OZ) * SC; return coast(q) && !(blocked || []).some((b) => Math.hypot(b.x - wx, b.z - wz) < b.r + 22); };
  const clr = (q) => { const wx = (q.x - OX) * SC, wz = (q.y - OZ) * SC; return Math.min(1e9, ...(blocked || []).map((b) => Math.hypot(b.x - wx, b.z - wz) - b.r)); };
  const cs = all.slice(0, 60).filter(coast);
  return all.slice(0, 60).find(free) || (cs.length ? cs.sort((a, b) => clr(b) - clr(a))[0] : all[0]);
}
function lmBuildIslands(g, gnd, avoid) {
  lmIslands().forEach((o) => {
    const c = lmIslW(o), ct = lmCoastNear(o.from, o.x, o.y, avoid), cw = { x: (ct.x - OX) * SC, z: (ct.y - OZ) * SC };
    const dx = c.x - cw.x, dz = c.z - cw.z, dl = Math.hypot(dx, dz) || 1, ux = dx / dl, uz = dz / dl;
    /* jeti tanah besar: akar di darat, hujung ke arah pulau */
    let ax = cw.x - ux * 6, az = cw.z - uz * 6; for (let i = 0; i < 20 && !lmLandW(ax, az); i++) { ax -= ux * 2; az -= uz * 2; }
    const L1 = 26, j1 = lmJettyModel(L1, o.port), a1 = Math.atan2(uz, ux);
    j1.position.set(ax, 0, az); j1.rotation.y = -a1; g.scene.add(j1); gnd.push([j1, 0]); lmPad(g, ax, az, 7);
    const e1 = { x: ax + ux * (L1 - 2), z: az + uz * (L1 - 2) };
    /* jeti pulau: dari pantai pulau menghala ke tanah besar */
    let bx = c.x, bz = c.z; for (let i = 0; i < 80 && lmAt(bx - ux * 2, bz - uz * 2) === o.id; i++) { bx -= ux * 2; bz -= uz * 2; }
    bx += ux * 4; bz += uz * 4;
    const L2 = 22, j2 = lmJettyModel(L2, o.n), a2 = Math.atan2(-uz, -ux);
    j2.position.set(bx, 0, bz); j2.rotation.y = -a2; g.scene.add(j2); gnd.push([j2, 0]); lmPad(g, bx, bz, 6);
    const e2 = { x: bx - ux * (L2 - 2), z: bz - uz * (L2 - 2) };
    /* feri diparkir di jeti tanah besar */
    const fe = lmFerry(); fe.position.set(e1.x + uz * 4.5, 0, e1.z - ux * 4.5); fe.rotation.y = -a1; g.scene.add(fe);
    const jt = { kind: "jt", id: o.id + "-j1", isl: o, k: o.from, n: o.port, x: ax - ux * 1, z: az - uz * 1, r: 0, ir: 9, end: e1, other: null, m: j1, ferry: fe, dir: { x: ux, z: uz } };
    const jb = { kind: "jt", id: o.id + "-j2", isl: o, k: o.id, n: "Jeti " + o.n, x: bx + ux * 1, z: bz + uz * 1, r: 0, ir: 9, end: e2, other: jt, m: j2, dir: { x: -ux, z: -uz } };
    jt.other = jb; g.items.push(jt, jb);
    /* markas Misi Khas di tengah pulau dan mercu tanda */
    const mk = lmMarkas(o); mk.g.position.set(c.x, 0, c.z); g.scene.add(mk.g); gnd.push([mk.g, 0]); lmPad(g, c.x, c.z, 9);
    const lb = lmLabel("★ " + o.khas.pendek + " · " + o.khas.n, { fs: 30, k: 0.032, bg: "rgba(90,20,40,.82)", bd: o.khas.warna || "#ffd45a" }); lb.position.set(c.x, 16, c.z); g.scene.add(lb); gnd.push([lb, 16]);
    const it = { kind: "kh", id: o.id, isl: o, k: o.id, n: o.n, x: c.x, z: c.z, r: 7, ir: 13, m: mk, lb: lb };
    g.items.push(it); g.cols.push({ x: c.x, z: c.z, r: 7, h: 12 });
    let lm = null;
    if (o.lm === "helang") lm = lmHelang(); else if (o.lm === "rumahapi") lm = lmRumahApi(); else if (o.lm === "kota") lm = lmModel("kota", lmRand(o.id));
    if (lm) { const ox = c.x + uz * 22, oz = c.z - ux * 22; lm.g.position.set(ox, 0, oz); g.scene.add(lm.g); gnd.push([lm.g, 0]); lmPad(g, ox, oz, Math.max(lm.r, 6) + 2); if (lm.r) g.cols.push({ x: ox, z: oz, r: lm.r, h: 20 }); it.lmk = lm.g; }
    avoid.push({ x: c.x, z: c.z, r: 16 }, { x: ax, z: az, r: 10 }, { x: bx, z: bz, r: 9 });
    lmIslandState(it);
  });
}
function lmIslandState(it) {
  const r = (LM.st.kh || {})[it.id], done = !!(r && r.b >= 7);
  it.m.flag.material = lmMat(done ? "#f5c542" : "#9aa3ad"); it.done = done;
}
/* ---------- Misi Khas di markas pulau: 10 soalan, lulus 7 ---------- */
function lmKhasOpen(it) {
  const kh = it.isl.khas, rec = (LM.st.kh || {})[it.id] || { b: 0, n: 0 };
  let pool = []; try { pool = khasAll(kh); } catch (e) { pool = QLIST.slice(); }
  const qs = shuffle(pool.slice()).slice(0, 10).map((q) => { const ord = shuffle([0, 1, 2, 3]); return { q: q, o: ord.map((i) => q.o[i]), ans: ord.indexOf(q.a) }; });
  lmQuiz({
    kick: "Misi Khas · " + it.n, title: kh.pendek + " · " + kh.n, pass: 7, qs: qs,
    intro: (b) => {
      b.append(el("div", { class: "lm-kick" }, "Markas Misi Khas · " + it.n), el("h2", null, kh.pendek + " · " + kh.n));
      b.append(el("p", null, kh.dskpTxt || ("Soalan daripada keseluruhan tajuk " + (kh.tk === "s" ? "Tingkatan 4 dan 5 (gaya SPM)" : "Tingkatan " + kh.tk) + ".")));
      b.append(el("p", { class: "lm-ex" }, "Jawab 10 soalan. Betul sekurang-kurangnya 7 untuk menawan pulau ini." + (rec.n ? " Terbaik anda: " + rec.b + "/10 (" + rec.n + " cubaan)." : "") + " Bank: " + pool.length + " soalan."));
    },
    onDone: (pass, ok, tot) => {
      const kr = LM.st.kh || (LM.st.kh = {}), r = kr[it.id] || (kr[it.id] = { b: 0, n: 0, t: 0 }), first = pass && r.b < 7;
      r.n++; r.t = Date.now(); if (ok > r.b) r.b = ok; lmSave(); lmIslandState(it);
      const xp = lmXp(ok * 3 + (first ? 25 : 0)); let coin = 0; if (first) { try { coin = gdCoin(8); } catch (e) { coin = 0; } }
      if (pass) { lmSnd("win"); lmPop(first ? it.n + " ditawan!" : "Hebat!"); }
      lmCard((b) => {
        b.append(el("div", { class: "lm-kick" }, pass ? "Pulau ditawan" : "Cuba lagi"), el("h2", null, ok + "/" + tot + " betul"));
        b.append(el("p", null, pass ? "Bendera markas " + it.n + " kini berwarna emas." : "Betul sekurang-kurangnya 7 untuk menawan pulau. Semak senarai tajuk dan cuba lagi."));
        b.append(el("p", { class: "lm-ex" }, "XP +" + xp + (coin ? " · +" + coin + " syiling" : "")));
        b.append(el("div", { class: "lm-row" }, lmBtn("Teruskan jelajah", "pri", lmCardClose), pass ? null : lmBtn("Cuba lagi", "", () => lmKhasOpen(it))));
      });
    }
  });
}
/* ---------- pelayaran feri sinematik ---------- */
function lmFerryOpen(jt) {
  const o = jt.isl, toIsland = jt.k !== o.id, dst = jt.other;
  lmCard((b) => {
    b.append(el("div", { class: "lm-kick" }, "⛴ " + jt.n), el("h2", null, toIsland ? "Feri ke " + o.n : "Feri pulang ke " + dst.n));
    b.append(el("p", null, toIsland ? o.n + " ialah pulau Misi Khas: " + o.khas.pendek + " · " + o.khas.n + ". Naik feri, berdiri di dek dan nikmati pelayaran." : "Kembali ke tanah besar melalui " + dst.n + "."));
    b.append(el("div", { class: "lm-row" }, lmBtn("Naik feri", "pri", () => { lmCardClose(); lmSail(jt); }), lmBtn("Nanti dulu", "", lmCardClose)));
  });
}
function lmHorn() { if (LM.mute) return; arBeep(110, 0.9, "sawtooth", 0.05); setTimeout(() => arBeep(98, 0.7, "sawtooth", 0.05), 120); }
function lmSail(jt) {
  const g = LM.g; if (!g || g.flight || g.sail) return;
  const a = jt.end, b = jt.other.end, mid = { x: (a.x + b.x) / 2 + jt.dir.z * 40, z: (a.z + b.z) / 2 - jt.dir.x * 40 };
  const boat = jt.ferry || jt.other.ferry; const dur = clamp(Math.hypot(b.x - a.x, b.z - a.z) / 22, 7, 16);
  g.sail = { jt: jt, boat: boat, a: a, b: b, c: mid, t: -1.4, dur: dur, wake: 0, home: { p: boat.position.clone(), r: boat.rotation.y } };
  g.ui = true; if (g.sky5) g.sky5.sp.visible = false; lmHorn(); lmPop("Feri akan bertolak");
  lmSailHud(true);
}
function lmSailHud(on) {
  let h = LM.ui.sl; if (!on) { if (h) h.remove(); LM.ui.sl = null; return; }
  const s = LM.g.sail, o = s.jt.isl, to = s.jt.k !== o.id ? o.n : s.jt.other.n;
  h = el("div", { class: "lm-fl" }); LM.ui.sl = h; LM.root.appendChild(h);
  h.append(el("b", null, "⛴ " + s.jt.n + " → " + to), el("span", { class: "lm-fl-st" }, "Menaiki feri..."), el("div", { class: "lm-bar" }, el("i")), lmBtn("Langkau", "", () => { const x = LM.g && LM.g.sail; if (x) x.t = x.dur; }));
}
function lmSailTick(g, dt) {
  const s = g.sail, boat = s.boat; s.t += dt;
  const k = clamp(s.t / s.dur, 0, 1), e = k * k * (3 - 2 * k), u = 1 - e;
  const x = u * u * s.a.x + 2 * u * e * s.c.x + e * e * s.b.x, z = u * u * s.a.z + 2 * u * e * s.c.z + e * e * s.b.z;
  const tx = 2 * u * (s.c.x - s.a.x) + 2 * e * (s.b.x - s.c.x), tz = 2 * u * (s.c.z - s.a.z) + 2 * e * (s.b.z - s.c.z), yaw = Math.atan2(-tz, tx);
  const bob = Math.sin(g.T * 1.7) * 0.25;
  boat.position.set(x, bob, z); boat.rotation.y = yaw; boat.userData.body.rotation.set(Math.sin(g.T * 1.3) * 0.04, 0, Math.sin(g.T * 0.9) * 0.025, "YXZ");
  boat.userData.flag.rotation.y = Math.sin(g.T * 5) * 0.3;
  const fx = Math.cos(yaw), fz = -Math.sin(yaw), deck = boat.position.clone().add(new T.Vector3(fx * 6, 1.3, fz * 6));
  g.p.x = deck.x; g.p.z = deck.z; g.p.y = deck.y; g.p.yaw = Math.atan2(fx, fz); g.p.moving = false;
  g.me.g.position.copy(deck); g.me.g.rotation.y = g.p.yaw; lmAnim(g.me, false, false, dt, 1);
  if (s.t > 0 && k < 1) { s.wake -= dt; if (s.wake <= 0) { s.wake = 0.07; lmPuff(g, boat.position.x - fx * 10 + (Math.random() - 0.5) * 3, 0.4, boat.position.z - fz * 10 + (Math.random() - 0.5) * 3, 2.2, 2.2, 3, 0.75); } }
  const cam = g.camera, want = new T.Vector3(deck.x - fx * 30 + fz * 12, deck.y + 13, deck.z - fz * 30 - fx * 12);
  cam.position.lerp(want, Math.min(1, dt * 2.5)); cam.lookAt(deck.x + fx * 8, deck.y + 2, deck.z + fz * 8);
  if (g.dome) g.dome.position.copy(cam.position);
  const h = LM.ui.sl; if (h) { const st = h.querySelector(".lm-fl-st"), txt = s.t < 0 ? "Menaiki feri..." : k < 1 ? "Belayar · " + Math.round(18 + 14 * Math.sin(k * Math.PI)) + " knot" : "Tiba di jeti"; if (st.textContent !== txt) st.textContent = txt; h.querySelector(".lm-bar i").style.width = Math.round(k * 100) + "%"; }
  if (k >= 1 && !s.end) { s.end = true; lmHorn(); setTimeout(() => lmSailEnd(g), 700); }
}
function lmSailEnd(g) {
  const s = g.sail; if (!s) return;
  const f = LM.ui.fade; if (f) f.style.opacity = "1";
  setTimeout(() => {
    if (!LM.g) return;
    s.boat.position.copy(s.home.p); s.boat.rotation.y = s.home.r; s.boat.userData.body.rotation.set(0, 0, 0);
    const d = s.jt.other; g.sail = null; g.ui = false; lmSailHud(false); if (g.sky5) g.sky5.sp.visible = LM.st.sky !== 0;
    g.p.x = d.x; g.p.z = d.z; g.p.y = lmGround(d.x, d.z); g.p.vx = g.p.vz = g.p.vy = 0;
    g.cam.yaw = Math.atan2(-d.dir.x, -d.dir.z); g.camera.position.set(d.x - d.dir.x * 18, g.p.y + 9, d.z - d.dir.z * 18);
    if (f) f.style.opacity = "0";
    lmPop(d.k === d.isl.id ? "Selamat datang ke " + d.isl.n + "!" : "Kembali ke tanah besar");
  }, 420);
}
function lmCoinMesh() {
  if (!GEO.coin) GEO.coin = new T.CylinderGeometry(0.9, 0.9, 0.25, 14);
  const m = new T.Mesh(GEO.coin, new T.MeshLambertMaterial({ color: 0xf5c542, emissive: 0x6b4a00, emissiveIntensity: 0.5 }));
  m.rotation.x = Math.PI / 2; return m;
}
function lmBuildWorld(g) {
  const avoid = [], gnd = []; /* gnd: [objek, offset] diletakkan di atas tanah selepas rupa bumi siap */
  /* Menara Ilmu: satu bagi setiap tajuk, pada titik yang sama seperti peta operasi (t.xy atau pin negeri) */
  const used = [];
  DATA.topik.forEach((t) => {
    const k = t.negeri, n = DATA.negeri[k]; if (!n) return;
    {
      const pins = n.pins && n.pins.length ? n.pins : [[0, 0]], xy = t.xy || pins[(t.pin | 0) % pins.length] || pins[0], base = toW(k, xy[0], xy[1]);
      let x = base.x, z = base.z;
      /* dua tajuk pada titik yang sama: anjak sedikit supaya tidak bertindih */
      for (let tr = 0; tr < 14 && used.some((u) => Math.hypot(u.x - x, u.z - z) < 12); tr++) { const a = tr * 1.3, d = 12 + tr * 2; const nx = base.x + Math.cos(a) * d, nz = base.z + Math.sin(a) * d; if (lmAt(nx, nz) === k) { x = nx; z = nz; } }
      used.push({ x: x, z: z });
      const tw = lmTower(t); tw.g.position.set(x, 0, z); g.scene.add(tw.g); gnd.push([tw.g, 0]); lmPad(g, x, z, 6);
      const lb = lmLabel((t.kod || t.id) + " " + t.nama, { fs: 30, k: 0.03, bd: (TEMA[t.tema] && TEMA[t.tema].warna) || "#5ad1ff" }); lb.position.set(x, 14.5, z); g.scene.add(lb); gnd.push([lb, 14.5]);
      const o = { kind: "tw", id: t.id, t: t, k: k, x: x, z: z, r: 2.4, ir: 7, m: tw, lb: lb };
      g.items.push(o); g.cols.push({ x: x, z: z, r: 2.4, h: 13 }); avoid.push({ x: x, z: z, r: 6 });
      lmTowerState(o);
    }
  });
  /* tempat pelancongan */
  const placed = [];
  PLACES.forEach((p) => {
    const [id, k, nama, type, sx, sy, fakta] = p; if (!DATA.negeri[k]) return;
    let w = toW(k, sx, sy);
    if (id === "pg-jambatan" && RAST.bridge) { const b = RAST.bridge; w = toW(k, (b[0] + b[2]) / 2 + 2.2, (b[1] + b[3]) / 2 + 2.6); }
    const R = lmRand(id), md = lmModel(type, R), rot = R() * 6.28;
    /* cari ruang lapang: jauh daripada Menara Ilmu (kedudukan ikut subjek) dan mercu tanda lain.
       W.P. terletak di tengah Selangor, jadi mercu tanda KL boleh melimpah ke Selangor. */
    if (id !== "pg-jambatan") {
      const rr = Math.max(md.r, 6), okK = (q) => q === k || (k === "wp" && q === "selangor");
      const free = (x, z) => okK(lmAt(x, z)) && lmLandW(x + rr, z) && lmLandW(x - rr, z) && lmLandW(x, z + rr) && lmLandW(x, z - rr)
        && !used.some((u) => Math.hypot(u.x - x, u.z - z) < rr + 8) && !placed.some((u) => Math.hypot(u.x - x, u.z - z) < rr + u.r + 6);
      if (!free(w.x, w.z)) {
        let best = null;
        for (let d = 4; d <= 120 && !best; d += 4) for (let i = 0; i < 16; i++) { const a = i * 0.3927 + d * 0.1, x = w.x + Math.cos(a) * d, z = w.z + Math.sin(a) * d; if (free(x, z)) { best = { x: x, z: z }; break; } }
        if (best) w = best;
      }
    }
    placed.push({ x: w.x, z: w.z, r: Math.max(md.r, 6) });
    md.g.position.set(w.x, 0, w.z); md.g.rotation.y = rot; g.scene.add(md.g); gnd.push([md.g, 0]);
    if (type === "gunung" || type === "bukit") lmPad(g, w.x, w.z, 5, true); else lmPad(g, w.x, w.z, Math.max(md.r, 8) + 3);
    const pl = { kind: "pl", id: id, k: k, n: nama, type: type, fakta: fakta, x: w.x, z: w.z, r: md.r, ir: Math.max(md.r, 6) + 9, m: md.g, names: [] };
    /* papan kenangan di hadapan mercu tanda */
    const bd = lmBoard(pl), bdist = Math.max(md.r, 8) + 5;
    let ba = rot + Math.PI / 2;
    for (let i = 0; i < 16; i++) {
      const a = rot + Math.PI / 2 + i * 0.393, bx = w.x + Math.sin(a) * bdist, bz = w.z + Math.cos(a) * bdist;
      if (lmLandW(bx, bz) && lmLandW(bx + Math.sin(a) * 6, bz + Math.cos(a) * 6) && !g.cols.some((c) => Math.hypot(c.x - bx, c.z - bz) < c.r + 3)) { ba = a; break; }
    }
    bd.position.set(w.x + Math.sin(ba) * bdist, 0, w.z + Math.cos(ba) * bdist); bd.rotation.y = ba; g.scene.add(bd); gnd.push([bd, 0]); lmPad(g, bd.position.x, bd.position.z, 4);
    pl.bx = bd.position.x; pl.bz = bd.position.z;
    const lb = lmLabel(nama, { fs: 30, k: 0.032, bg: "rgba(60,30,8,.78)", bd: "#f5c542" }); lb.position.set(w.x, Math.max(14, md.r * 1.4 + 8), w.z); g.scene.add(lb); pl.lb = lb; gnd.push([lb, lb.position.y]);
    g.items.push(pl);
    if (md.r > 0) { md.g.updateMatrixWorld(true); const bb = new T.Box3().setFromObject(md.g); g.cols.push({ x: w.x, z: w.z, r: md.r * 0.85, h: bb.max.y + 1 }); }
    g.cols.push({ x: bd.position.x, z: bd.position.z, r: 1.2, h: 8 });
    avoid.push({ x: w.x, z: w.z, r: Math.max(md.r, 14) }, { x: pl.bx, z: pl.bz, r: 6 });
    lmBoardRefresh(pl);
  });
  /* lapangan terbang lengkap: landasan dipilih supaya muat di darat dan jauh daripada menara serta mercu tanda */
  AIRPORTS.forEach((a) => {
    const [id, k, nama, sx, sy] = a; if (!DATA.negeri[k]) return;
    const c = toW(k, sx, sy), blocked = used.map((u) => ({ x: u.x, z: u.z, r: 8 })).concat(placed.map((q) => ({ x: q.x, z: q.z, r: q.r })));
    const fit = lmRunwayFit(c.x, c.z, blocked, k), ux = Math.cos(fit.a), uz = Math.sin(fit.a), px = -uz, pz = ux, sh = { x: fit.x, z: fit.z, h: null };
    const m = lmAirport(fit.L); m.position.set(fit.x, 0, fit.z); m.rotation.y = -fit.a; g.scene.add(m); gnd.push([m, 0]);
    for (let t = -fit.L - 6; t <= fit.L + 6; t += 8) lmPad(g, fit.x + ux * t, fit.z + uz * t, 9, false, sh);
    for (const t of [-20, 0, 20]) for (const off of [14, 24, 34, 44]) lmPad(g, fit.x + px * off + ux * t, fit.z + pz * off + uz * t, 9, false, sh);
    const ex = fit.x + px * 49, ez = fit.z + pz * 49;
    const lb = lmLabel("✈ " + nama, { fs: 28, k: 0.03, bg: "rgba(10,40,80,.8)", bd: "#7fb7e8" }); lb.position.set(fit.x + px * 38, 13, fit.z + pz * 38); g.scene.add(lb); gnd.push([lb, 13]);
    g.items.push({ kind: "ap", id: id, k: k, n: nama, x: ex, z: ez, r: 0, ir: 11, lb: lb, m: m, rw: { x: fit.x, z: fit.z, a: fit.a, L: fit.L } });
    for (const t of [-11, 0, 11]) g.cols.push({ x: fit.x + px * 38 + ux * t, z: fit.z + pz * 38 + uz * t, r: 5.5, h: 8 });
    g.cols.push({ x: fit.x + ux * 21 + px * 34, z: fit.z + uz * 21 + pz * 34, r: 2.4, h: 22 });
    for (let t = -fit.L; t <= fit.L; t += 14) avoid.push({ x: fit.x + ux * t, z: fit.z + uz * t, r: 12 });
    for (const t of [-18, 0, 18]) avoid.push({ x: fit.x + px * 32 + ux * t, z: fit.z + pz * 32 + uz * t, r: 16 });
  });
  /* pulau Misi Khas, jeti dan feri */
  lmBuildIslands(g, gnd, avoid);
  /* rupa bumi: ketinggian, tapak rata, kemudian semua objek diletakkan di atas tanah */
  lmTerrainBase(g); lmBuildTerrain(g);
  for (const [o, dy] of gnd) o.position.y = lmHRaw(o.position.x, o.position.z) + dy;
  for (const c of g.cols) c.h = (c.h || 30) + lmHRaw(c.x, c.z);
  lmBuildTrees(g, avoid);
  /* syiling harian bertaburan (deterministik mengikut hari) */
  const R = lmRand("lm-coin-" + dayKey()), got = new Set(LM.st.cd.got);
  let n = 0, tries = 0;
  while (n < 70 && tries < 3000) {
    tries++; const x = -1300 + R() * 2650, z = -560 + R() * 1080; if (!lmAt(x, z) || lmAt(x, z) === "jambatan") continue;
    if (avoid.some((a) => Math.hypot(a.x - x, a.z - z) < a.r)) continue;
    const id = "c" + n; n++; if (got.has(id)) continue;
    const y = lmHRaw(x, z) + 1.6; if (y < 1.5) continue;
    const m = lmCoinMesh(); m.position.set(x, y, z); g.scene.add(m); g.coins.push({ id: id, x: x, z: z, y: y, m: m });
  }
}
function lmTowerState(o) {
  const best = LM.st.tw[o.id] | 0, done = best >= 3;
  o.m.flag.material = lmMat(done ? "#f5c542" : "#9aa3ad");
  o.done = done;
}

/* ---------- avatar 3D (avatar3d.js): semua pakaian dan aksesori Gudang, menutup aurat, wajah tanpa ciri ---------- */
function lmMyCode() { return window.AV3 ? AV3.code() : "L|1|ou_sc|oc_gn|hd_no|hc_w"; }
function lmAvatar(code, name, me) {
  const av = AV3.build(code);
  const tag = lmLabel(cleanName(name) || "Pemain", { fs: 32, k: 0.028, bd: me ? "#f5c542" : null, dt: false });
  tag.position.y = 7.3; av.g.add(tag); av.tag = tag; av.code = code;
  return av;
}
function lmAnim(av, moving, air, dt, speed) { AV3.anim(av, moving, air, dt, speed, LM.g && LM.g.scene); }
function lmAvatarDrop(g, av, e) { g.scene.remove(av.g); try { AV3.dispose(av, g.scene); } catch (x) { /* abaikan */ } if (e && e.plane) g.scene.remove(e.plane); if (e && e.ferry) g.scene.remove(e.ferry); }
function lmBubble(av, text) {
  if (av.bub) { av.g.remove(av.bub); av.bub = null; }
  if (!text) return;
  av.bub = lmLabel(text, { fs: 30, k: 0.03, bg: "rgba(255,255,255,.95)", fg: "#1b2a3a", dt: false }); av.bub.position.y = 8.9; av.g.add(av.bub); av.bubT = 3;
}

/* ---------- pergerakan pemain, perlanggaran dan kamera ---------- */
function lmCanStand(x, z) { return lmLandW(x, z) && lmGround(x, z) > 0.1; }
function lmUpdatePlayer(g, dt) {
  const p = g.p, k = LM.keys, run = k.shift || LM.run;
  let ix = 0, iz = 0;
  if (!g.ui) {
    if (k.w || k.arrowup) iz -= 1; if (k.s || k.arrowdown) iz += 1; if (k.a || k.arrowleft) ix -= 1; if (k.d || k.arrowright) ix += 1;
    if (LM.js.id >= 0) { ix += LM.js.x; iz -= LM.js.y; }
  }
  const il = Math.hypot(ix, iz); if (il > 1) { ix /= il; iz /= il; }
  const sp = (run ? 30 : 16) * Math.min(1, il), cy = Math.cos(g.cam.yaw), sy = Math.sin(g.cam.yaw);
  /* arah relatif kamera */
  const dx = (ix * cy + iz * sy) * sp, dz = (-ix * sy + iz * cy) * sp;
  p.vx += (dx - p.vx) * Math.min(1, dt * 10); p.vz += (dz - p.vz) * Math.min(1, dt * 10);
  let nx = p.x + p.vx * dt, nz = p.z + p.vz * dt;
  /* tidak boleh berjalan di atas laut: cuba gelincir pada satu paksi */
  if (!lmCanStand(nx, nz)) { if (lmCanStand(nx, p.z)) nz = p.z; else if (lmCanStand(p.x, nz)) nx = p.x; else { nx = p.x; nz = p.z; } }
  for (const c of g.cols) {
    const ddx = nx - c.x, ddz = nz - c.z, d = Math.hypot(ddx, ddz), m = c.r + 1;
    if (d < m && d > 0.001 && p.y < (c.h || 99)) { nx = c.x + ddx / d * m; nz = c.z + ddz / d * m; }
  }
  /* cerun terlalu curam tidak boleh didaki */
  const g0 = lmGround(p.x, p.z), stepL = Math.hypot(nx - p.x, nz - p.z);
  if (lmCanStand(nx, nz) && !(stepL > 0.001 && (lmGround(nx, nz) - g0) / stepL > 2.2)) { p.x = nx; p.z = nz; }
  if (il > 0.1) { let da = Math.atan2(p.vx, p.vz) - p.yaw; while (da > Math.PI) da -= 6.2832; while (da < -Math.PI) da += 6.2832; p.yaw += da * Math.min(1, dt * 12); }
  /* lompat dan graviti */
  if ((k[" "] || LM.jump) && p.on && !g.ui) { p.vy = 15; p.on = false; LM.jump = false; lmSnd("jump"); }
  p.vy -= 38 * dt; p.y += p.vy * dt;
  const gy = lmGround(p.x, p.z);
  if (p.y <= gy || (p.on && p.vy <= 0 && p.y - gy < 1.4)) { p.y = gy; p.vy = 0; p.on = true; }
  else if (p.y - gy > 1.4) p.on = false;
  p.moving = Math.hypot(p.vx, p.vz) > 1.5;
  g.me.g.position.set(p.x, p.y, p.z); g.me.g.rotation.y = p.yaw;
  lmAnim(g.me, p.moving, !p.on, dt, run ? 1.4 : 1);
}
function lmUpdateCam(g, dt) {
  const c = g.cam, p = g.p;
  if (LM.camIn) { c.yaw -= LM.camIn[0]; c.pitch = clamp(c.pitch + LM.camIn[1], 0.08, 1.25); LM.camIn = null; }
  const tx = p.x, ty = p.y + 4.5, tz = p.z;
  let d = c.dist;
  const ux = Math.sin(c.yaw) * Math.cos(c.pitch), uy = Math.sin(c.pitch), uz = Math.cos(c.yaw) * Math.cos(c.pitch);
  for (const cl of g.cols) {
    if (Math.abs(cl.x - tx) > d + cl.r + 2 || Math.abs(cl.z - tz) > d + cl.r + 2) continue;
    for (let s = 2; s < d; s += 1.5) { const x = tx + ux * s, y = ty + uy * s, z = tz + uz * s; if (y < (cl.h || 30) && Math.hypot(x - cl.x, z - cl.z) < cl.r + 1.2) { d = Math.max(3, s - 1.5); break; } }
  }
  const want = new T.Vector3(tx + Math.sin(c.yaw) * Math.cos(c.pitch) * d, ty + Math.sin(c.pitch) * d, tz + Math.cos(c.yaw) * Math.cos(c.pitch) * d);
  g.camera.position.lerp(want, Math.min(1, dt * 8));
  { const cp = g.camera.position, gy = lmGround(cp.x, cp.z) + 1.6; if (cp.y < gy) cp.y = gy; }
  g.camera.lookAt(tx, ty, tz);
  if (g.dome) g.dome.position.copy(g.camera.position);
  lmSkyPlace(g);
  if (g.sun) { const sd = g.sunDir || new T.Vector3(0.45, 0.8, 0.3); g.sun.position.set(p.x + sd.x * 150, p.y + sd.y * 150, p.z + sd.z * 150); g.sun.target.position.set(p.x, p.y, p.z); g.sun.target.updateMatrixWorld(); if (g.sunDisc) g.sunDisc.position.set(g.camera.position.x + sd.x * 1100, g.camera.position.y + sd.y * 1100, g.camera.position.z + sd.z * 1100); }
}

/* ---------- multiplayer (kehadiran bilik; sama seperti Dunia Gempur) ---------- */
async function lmNetJoin(code, kind) {
  lmNetLeave(); if (!Net.room) { toast("Bilik bersama memerlukan sambungan pelayan Firebase (versi GitHub Pages).", "warn"); return false; }
  const tok = ++LM.tok; LM.roomCode = code; LM.roomKind = kind;
  try {
    const r = await Net.room.join("lm-" + SUBJ + "-" + code);
    if (tok !== LM.tok || !LM.on) { try { await r.leave(); } catch (e) { /* abaikan */ } return false; }
    LM.room = r; LM.sent = 0; LM.pollT = 0; LM.lastSig = "";
    return true;
  } catch (e) { LM.room = null; toast("Gagal masuk bilik. Cuba lagi.", "warn"); return false; }
}
function lmNetLeave() {
  LM.tok++; const r = LM.room; LM.room = null;
  const g = LM.g; if (g) for (const id in LM.peers) lmAvatarDrop(g, LM.peers[id].av, LM.peers[id]);
  LM.peers = {};
  if (r) { try { const x = r.leave(); if (x && x.catch) x.catch(() => {}); } catch (e) { /* abaikan */ } }
}
function lmEmote(k) {
  const g = LM.g; if (!g || !EMOTE[k]) return;
  lmBubble(g.me, EMOTE[k]); LM.en = (LM.en | 0) + 1;
  if (LM.room) { try { LM.room.presence({ e: k, en: LM.en }); } catch (e) { /* abaikan */ } }
}
function lmStamps() { return Object.keys(LM.st.pl).length; }
function lmNet(g, dt, ts) {
  for (const id in LM.peers) {
    const e = LM.peers[id], k = Math.min(1, dt * 9);
    e.x += (e.tx - e.x) * k; e.y += (e.ty - e.y) * k; e.z += (e.tz - e.z) * k;
    let da = e.tr - e.r; while (da > Math.PI) da -= 6.2832; while (da < -Math.PI) da += 6.2832; e.r += da * k;
    e.av.g.position.set(e.x, e.y, e.z); e.av.g.rotation.y = e.r; e.av.g.visible = !e.pl; if (!e.pl) lmAnim(e.av, e.m, e.a, dt, 1);
    if (e.pl && !e.plane) { e.plane = lmPlane(); g.scene.add(e.plane); }
    if (e.fy && !e.ferry) { e.ferry = lmFerry(); g.scene.add(e.ferry); }
    if (e.ferry) { e.ferry.visible = e.fy; if (e.fy) { const fx = Math.sin(e.r), fz = Math.cos(e.r); e.ferry.position.set(e.x - fx * 6, Math.sin(g.T * 1.7) * 0.25, e.z - fz * 6); e.ferry.rotation.y = Math.atan2(-fz, fx); } }
    if (e.plane) { e.plane.visible = e.pl; if (e.pl) { e.plane.position.set(e.x, e.y, e.z); e.plane.rotation.y = Math.atan2(-Math.cos(e.r), Math.sin(e.r)); e.plane.userData.body.rotation.set(e.pb, 0, e.pp, "YXZ"); } }
    if (e.av.bub && (e.av.bubT -= dt) <= 0) lmBubble(e.av, "");
  }
  const r = LM.room; if (!r) return;
  const p = g.p;
  if (ts - LM.sent > 200) {
    LM.sent = ts;
    const o = { x: +p.x.toFixed(1), y: +p.y.toFixed(1), z: +p.z.toFixed(1), r: +p.yaw.toFixed(2), m: p.moving ? 1 : 0, a: p.on ? 0 : 1, n: cleanName(P.nama) || "Pelajar", c: g.myCode, st: lmStamps(), fy: g.sail ? 1 : 0, pl: g.flight ? 1 : 0, pp: g.flight ? +g.flight.pitch.toFixed(2) : 0, pb: g.flight ? +g.flight.bank.toFixed(2) : 0 };
    const sig = [o.x, o.y, o.z, o.r, o.m, o.a, o.st, o.pl, o.pp, o.pb, o.fy].join(",");
    if (sig !== LM.lastSig) { LM.lastSig = sig; try { const x = r.presence(o); if (x && x.catch) x.catch(() => {}); } catch (e) { /* abaikan */ } }
  }
  if (ts - LM.pollT > 220) {
    LM.pollT = ts; let a = []; try { a = r.peers(); } catch (e) { a = []; }
    const seen = {}; let n = 0;
    for (const pr of a) {
      if (pr.isMe || !pr.presence || typeof pr.presence !== "object" || n >= 30) continue;
      const v = pr.presence; if (typeof v.x !== "number" || typeof v.z !== "number") continue;
      n++; seen[pr.peer] = 1;
      const x = clamp(v.x, -1600, 1800), y = clamp(+v.y || 0, -5, 400), z = clamp(v.z, -800, 800), nm = cleanName(String(v.n || "")) || "Pelajar";
      let e = LM.peers[pr.peer];
      if (e && (e.c !== v.c || e.n !== nm)) { lmAvatarDrop(g, e.av, e); e = null; }
      if (!e) { const av = lmAvatar(v.c, nm, false); g.scene.add(av.g); e = LM.peers[pr.peer] = { x: x, y: y, z: z, r: +v.r || 0, av: av, c: v.c, n: nm, en: v.en | 0 }; } /* emote lama sebelum kita masuk tidak dipaparkan */
      e.tx = x; e.ty = y; e.tz = z; e.tr = +v.r || 0; e.m = !!v.m; e.a = !!v.a; e.st = clamp(v.st | 0, 0, 999); e.pl = !!v.pl; e.fy = !!v.fy; e.pp = clamp(+v.pp || 0, -1, 1); e.pb = clamp(+v.pb || 0, -1, 1);
      if (typeof v.e === "string" && EMOTE[v.e] && (v.en | 0) !== e.en) { lmBubble(e.av, EMOTE[v.e]); e.en = v.en | 0; }
    }
    for (const id in LM.peers) if (!seen[id]) { lmAvatarDrop(g, LM.peers[id].av, LM.peers[id]); delete LM.peers[id]; }
  }
}
function lmFriendsNear(g, r) {
  let n = 0; for (const id in LM.peers) { const e = LM.peers[id]; if (Math.hypot(e.x - g.p.x, e.z - g.p.z) < r) n++; } return n;
}

/* ---------- Papan Kenangan dalam talian (nod Firebase "ziarah/<tempat>/<uid>") ---------- */
async function lmNamesLoad(pl, force) {
  const now = Date.now(); if (!force && pl.loadedAt && now - pl.loadedAt < 90000) return; pl.loadedAt = now;
  const mine = LM.st.nm[pl.id] ? { n: cleanName(P.nama) || "Saya", t: LM.st.nm[pl.id], me: 1 } : null;
  let list = [];
  if (Net.db && Net.uid) {
    try {
      const sn = await Net.db.doc("ziarah/" + pl.id).get(), v = sn.exists ? sn.data() : null;
      if (v && typeof v === "object") for (const uid in v) { const r = v[uid]; if (r && typeof r === "object") list.push({ n: cleanName(r.n) || "Pelajar", t: +r.t || 0, me: uid === Net.uid ? 1 : 0 }); }
      pl.online = true;
    } catch (e) { pl.online = false; }
  }
  list.sort((a, b) => b.t - a.t);
  if (mine && !list.some((x) => x.me)) list.unshift(mine);
  pl.count = list.length; pl.names = list.slice(0, 10);
  lmBoardRefresh(pl);
}
async function lmNameHang(pl) {
  LM.st.nm[pl.id] = Date.now(); lmSave();
  let ok = false;
  if (Net.db && Net.uid) {
    try { await Net.db.doc("ziarah/" + pl.id + "/" + Net.uid).set({ n: cleanName(P.nama) || "Pelajar", sk: cleanSekolah(P.sekolah).slice(0, 40), sj: SUBJ, t: Date.now() }); ok = true; } catch (e) { ok = false; }
  }
  await lmNamesLoad(pl, true);
  return ok;
}

/* ---------- antara muka ---------- */
const LM_CSS = `
#lmOv{position:fixed;inset:0;z-index:120;background:#0b2a44;color:#f3f7fb;font-family:Nunito,system-ui,sans-serif;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}
#lmOv[hidden]{display:none}
#lmOv canvas.lm-cv{position:absolute;inset:0;width:100%;height:100%;display:block}
#lmOv .lm-hud{position:absolute;left:max(10px,env(safe-area-inset-left));top:max(10px,env(safe-area-inset-top));display:flex;flex-wrap:wrap;gap:6px;max-width:calc(100% - 200px);pointer-events:none}
#lmOv .lm-pill{background:rgba(8,24,40,.78);border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:6px 12px;font:800 14px Nunito,sans-serif;display:flex;gap:6px;align-items:center;backdrop-filter:blur(4px)}
#lmOv .lm-pill b{color:#ffd45a}
#lmOv .lm-state{font:900 18px Fredoka,Nunito,sans-serif;letter-spacing:.02em}
#lmOv .lm-mm{position:absolute;right:max(10px,env(safe-area-inset-right));top:max(10px,env(safe-area-inset-top));width:190px;height:96px;border-radius:12px;border:2px solid rgba(255,255,255,.35);background:#0d4f86;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.35)}
#lmOv .lm-top{position:absolute;right:max(10px,env(safe-area-inset-right));top:calc(max(10px,env(safe-area-inset-top)) + 104px);display:flex;flex-direction:column;gap:6px;align-items:flex-end}
#lmOv button{font:800 14px Nunito,sans-serif;color:#fff;background:rgba(8,24,40,.82);border:1px solid rgba(255,255,255,.25);border-radius:12px;padding:8px 12px;cursor:pointer;touch-action:manipulation}
#lmOv button:hover{background:rgba(30,70,110,.92)}
#lmOv button.pri{background:linear-gradient(#ffcf4a,#f0a81c);color:#2b1900;border-color:#ffe28a}
#lmOv button.ok{background:#2f9e6a}
#lmOv .lm-prompt{position:absolute;left:50%;bottom:calc(120px + env(safe-area-inset-bottom));transform:translateX(-50%);font-size:17px;padding:12px 20px;border-radius:16px;animation:lmPulse 1.4s ease-in-out infinite}
@keyframes lmPulse{50%{transform:translateX(-50%) scale(1.05)}}
#lmOv .lm-quest{position:absolute;left:max(10px,env(safe-area-inset-left));top:calc(max(10px,env(safe-area-inset-top)) + 44px);background:rgba(8,24,40,.72);border-radius:12px;padding:8px 12px;font-size:13px;max-width:260px;pointer-events:none}
#lmOv .lm-quest b{color:#ffd45a}
#lmOv .lm-quest .dn{text-decoration:line-through;opacity:.6}
#lmOv .lm-emo{position:absolute;left:50%;bottom:calc(14px + env(safe-area-inset-bottom));transform:translateX(-50%);display:flex;gap:6px}
#lmOv .lm-tc{position:absolute;right:calc(16px + env(safe-area-inset-right));bottom:calc(20px + env(safe-area-inset-bottom));display:none;gap:10px;align-items:flex-end}
#lmOv.touch .lm-tc{display:flex}
#lmOv .lm-tc button{width:64px;height:64px;border-radius:50%;font-size:13px;padding:0}
#lmOv .lm-tc button.big{width:78px;height:78px}
#lmOv .lm-js{position:absolute;left:calc(26px + env(safe-area-inset-left));bottom:calc(26px + env(safe-area-inset-bottom));width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.3);display:none;pointer-events:none}
#lmOv.touch .lm-js{display:block}
#lmOv .lm-js i{position:absolute;left:35px;top:35px;width:50px;height:50px;border-radius:50%;background:rgba(255,255,255,.55)}
#lmOv .lm-card{position:absolute;inset:0;display:flex;background:rgba(3,12,22,.62);padding:14px;overflow-y:auto;touch-action:pan-y;z-index:3}
#lmOv .lm-box{margin:auto;width:min(620px,100%);background:linear-gradient(#123552,#0c2438);border:2px solid rgba(255,255,255,.18);border-radius:20px;padding:18px 18px 16px;box-shadow:0 20px 60px rgba(0,0,0,.5);animation:lmIn .22s ease-out}
@keyframes lmIn{from{transform:translateY(14px) scale(.97);opacity:0}}
#lmOv .lm-box h2{font:900 24px Fredoka,Nunito,sans-serif;margin:0 0 6px}
#lmOv .lm-box p{margin:6px 0;color:#d4e2ee;line-height:1.45}
#lmOv .lm-kick{font:900 12px Nunito,sans-serif;letter-spacing:.18em;color:#ffd45a;text-transform:uppercase}
#lmOv .lm-q{font-size:18px;font-weight:800;margin:10px 0 12px;line-height:1.4}
#lmOv .lm-opts{display:grid;gap:8px}
#lmOv .lm-opt{text-align:left;font-size:16px;padding:12px 14px;border-radius:14px;background:#183f60;border:2px solid #2a5a82}
#lmOv .lm-opt.ok{background:#1f7a4f;border-color:#6fe0a6}
#lmOv .lm-opt.no{background:#7a2330;border-color:#ff8a9a}
#lmOv .lm-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
#lmOv .lm-bar{height:8px;border-radius:9px;background:rgba(255,255,255,.12);overflow:hidden;margin:8px 0}
#lmOv .lm-bar i{display:block;height:100%;background:linear-gradient(90deg,#ffcf4a,#6fe0a6);transition:width .3s}
#lmOv .lm-ex{font-size:14px;color:#cde3f3;background:rgba(255,255,255,.06);border-radius:10px;padding:8px 10px;margin-top:8px}
#lmOv .lm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:8px;margin-top:10px}
#lmOv .lm-stamp{border-radius:14px;padding:10px;background:rgba(255,255,255,.06);border:2px dashed rgba(255,255,255,.2);font-size:13px}
#lmOv .lm-stamp.on{border-style:solid;border-color:#ffd45a;background:rgba(255,212,90,.12)}
#lmOv .lm-stamp b{display:block;font-size:14px}
#lmOv input.lm-in{font:800 18px Nunito,sans-serif;text-transform:uppercase;letter-spacing:.2em;width:9em;padding:8px 10px;border-radius:10px;border:2px solid #2a5a82;background:#0a2034;color:#fff}
#lmOv .lm-big{position:absolute;inset:0;z-index:3;background:rgba(3,12,22,.8);display:grid;place-items:center}
#lmOv .lm-big canvas{max-width:96vw;max-height:80vh;border-radius:16px;border:2px solid rgba(255,255,255,.3);background:#0d4f86;cursor:crosshair}
#lmOv .lm-fl{position:absolute;left:50%;top:calc(max(10px,env(safe-area-inset-top)) + 56px);transform:translateX(-50%);width:min(480px,92vw);background:rgba(8,24,40,.82);border:1px solid rgba(255,255,255,.25);border-radius:16px;padding:10px 14px;display:grid;gap:6px;z-index:2;text-align:center}
#lmOv .lm-fl b{font:900 16px Fredoka,Nunito,sans-serif;color:#ffd45a}#lmOv .lm-fl .lm-fl-st{font-size:14px;color:#d4e2ee}#lmOv .lm-fl button{justify-self:center;font-size:13px;padding:6px 12px}
#lmOv .lm-tabs button[aria-pressed="false"]{opacity:.8}
#lmOv .lm-tema{margin-top:12px;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.05);border-left:5px solid var(--c)}
#lmOv .lm-tema.on{background:rgba(255,212,90,.1)}
#lmOv .lm-tema-h{display:flex;justify-content:space-between;gap:8px;align-items:baseline}#lmOv .lm-tema-h b{font-size:15px}#lmOv .lm-tema-h span{font-size:12px;color:#b9cde0;white-space:nowrap}
#lmOv .lm-tp{display:grid;grid-template-columns:22px 1fr auto;gap:2px 8px;align-items:center;padding:6px 0;border-top:1px solid rgba(255,255,255,.07);font-size:14px}
#lmOv .lm-tp .ic{grid-row:span 2;font-size:16px;text-align:center}#lmOv .lm-tp.ok .ic{color:#6fe0a6}#lmOv .lm-tp.try .ic{color:#ffd45a}#lmOv .lm-tp.no{opacity:.75}
#lmOv .lm-tp .mt{grid-column:2;font-size:12px;color:#b9cde0}#lmOv .lm-tp button{grid-row:1 / span 2;grid-column:3;font-size:12px;padding:5px 9px}
#lmOv .lm-fade{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;transition:opacity .35s;z-index:4}
#lmOv .lm-toast{position:absolute;left:50%;top:22%;transform:translateX(-50%);font:900 22px Fredoka,Nunito,sans-serif;color:#ffd45a;text-shadow:0 2px 0 #6b4a00,0 4px 18px rgba(0,0,0,.6);pointer-events:none;animation:lmUp 1.6s ease-out forwards;z-index:2;white-space:nowrap}
@keyframes lmUp{0%{opacity:0;transform:translate(-50%,10px) scale(.8)}15%{opacity:1;transform:translate(-50%,0) scale(1.1)}100%{opacity:0;transform:translate(-50%,-40px)}}
#lmOv.touch .lm-emo{display:none}
@media (max-height:500px){#lmOv .lm-top{flex-direction:row;flex-wrap:wrap;justify-content:flex-end;max-width:62vw;top:calc(max(10px,env(safe-area-inset-top)) + 84px)}#lmOv .lm-top button{padding:6px 9px;font-size:12px}#lmOv .lm-mm{width:150px;height:76px}#lmOv .lm-quest{font-size:12px;max-width:220px}}
@media (max-width:640px){#lmOv .lm-mm{width:140px;height:72px}#lmOv .lm-top{top:calc(max(10px,env(safe-area-inset-top)) + 80px)}#lmOv .lm-hud{max-width:calc(100% - 160px)}#lmOv .lm-emo{display:none}#lmOv .lm-quest{display:none}}
@media (prefers-reduced-motion:reduce){#lmOv .lm-prompt,#lmOv .lm-box,#lmOv .lm-toast{animation:none}}
`;
function lmRoot() {
  if (!document.getElementById("lmCss")) { const s = document.createElement("style"); s.id = "lmCss"; s.textContent = LM_CSS; document.head.appendChild(s); }
  let r = document.getElementById("lmOv");
  if (!r) { r = el("div", { id: "lmOv", role: "dialog", "aria-modal": "true", "aria-label": "META GEMPUR" }); document.body.appendChild(r); }
  r.textContent = ""; r.hidden = false; r.classList.toggle("touch", !!TOUCH);
  LM.root = r; return r;
}
function lmCard(build, cls) {
  lmCardClose();
  const g = LM.g; if (g) { g.ui = true; for (const k in LM.keys) LM.keys[k] = false; }
  const c = el("div", { class: "lm-card" + (cls ? " " + cls : "") }), b = el("div", { class: "lm-box" });
  c.appendChild(b); LM.root.appendChild(c); LM.ui.card = c; build(b);
  const f = b.querySelector("button.pri, button"); if (f && !TOUCH) f.focus();
  return b;
}
function lmCardClose() {
  if (LM.ui.card) { LM.ui.card.remove(); LM.ui.card = null; }
  if (LM.g) LM.g.ui = false;
}
function lmPop(text) {
  if (!LM.root) return; const d = el("div", { class: "lm-toast" }, text); LM.root.appendChild(d); setTimeout(() => d.remove(), 1700);
}
function lmBtn(text, cls, fn) { const b = el("button", { type: "button", class: cls || "" }, text); b.addEventListener("click", fn); return b; }

/* ---------- skrin mula ---------- */
function lmSetup() {
  const r = lmRoot();
  r.appendChild(el("div", { style: "position:absolute;inset:0;background:radial-gradient(900px 520px at 20% 0%,#2f8fd055,transparent),radial-gradient(800px 500px at 90% 100%,#3aa66a44,transparent),#0b2a44" }));
  const c = el("div", { class: "lm-card", style: "background:none" }), b = el("div", { class: "lm-box", style: "width:min(720px,100%)" });
  c.appendChild(b); r.appendChild(c);
  const t = lmNextTopic(), ng = t && DATA.negeri[t.negeri], nT = DATA.topik.filter((x) => DATA.negeri[x.negeri]).length;
  b.append(el("div", { class: "lm-kick" }, "Dunia maya · " + SUBJS[SUBJ].nama), el("h2", null, "META GEMPUR"));
  b.append(el("p", null, "Jelajah peta Malaysia 3D bersama rakan. Kesemua " + nT + " tajuk " + SUBJS[SUBJ].subjek + " menjadi Menara Ilmu di negeri masing-masing, sama seperti peta operasi. Tawan setiap menara, ziarahi tempat pelancongan dan gantung nama anda pada Papan Kenangan. Tukar subjek di halaman utama untuk menjelajah tajuk subjek lain."));
  b.append(el("p", { class: "lm-ex" }, (ng ? "Anda bermula di " + ng.pendek + " (" + (t.kod || t.id) + " " + t.nama + ", menara seterusnya yang belum ditawan). " : "") + "Kawalan: W A S D atau anak panah untuk bergerak, Shift lari, Space lompat, E berinteraksi, M peta, P pasport, T senarai tajuk, seret tetikus untuk pusing kamera. Di telefon: kayu bedik kiri dan butang kanan."));
  const solo = lmBtn("Main solo", "pri", () => lmStart(""));
  const row = el("div", { class: "lm-row" }, solo);
  if (Net.room) {
    const sid = typeof mySid === "function" ? mySid() : "";
    row.append(lmBtn("Cipta bilik rakan", "", () => lmStart(lmCode(), "rakan")));
    if (sid) row.append(lmBtn("Bilik sekolah saya", "", () => lmStart("s" + String(hashStr(sid)).slice(0, 7), "sekolah")));
    const inp = el("input", { class: "lm-in", maxlength: "6", placeholder: "KOD", "aria-label": "Kod bilik rakan", autocomplete: "off" });
    const join = lmBtn("Masuk kod", "", () => { const v = String(inp.value || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); if (v.length < 4) { toast("Masukkan kod bilik 4 hingga 6 aksara.", "warn"); return; } lmStart(v, "rakan"); });
    inp.addEventListener("keydown", (e) => { e.stopPropagation(); if (e.key === "Enter") join.click(); });
    b.append(row, el("div", { class: "lm-row" }, inp, join));
  } else {
    b.append(row, el("p", { class: "lm-ex" }, "Main bersama rakan memerlukan sambungan pelayan Firebase (versi GitHub Pages). Mod solo tetap boleh dimainkan."));
  }
  const q = LM.st.gq;
  const gq = lmBtn("Grafik: " + (q ? "Tinggi" : "Jimat"), "", () => { LM.st.gq = LM.gq = q ? 0 : 1; lmSave(); lmSetup(); });
  const x = lmBtn("Tutup", "", lmClose);
  b.append(el("div", { class: "lm-row" }, gq, x));
  const st = lmSummary();
  b.append(el("p", { class: "lm-ex" }, "Pasport anda: " + st.pl + "/" + st.plN + " tempat diziarahi, " + st.tw + "/" + st.twN + " Menara Ilmu ditawan."));
  if (!TOUCH) solo.focus();
}
/* menara seterusnya: tajuk pertama (ikut susunan peta operasi) yang belum ditawan */
function lmNextTopic() {
  const ts = DATA.topik.filter((t) => DATA.negeri[t.negeri]);
  return (LM.tid && TOPIK[LM.tid]) || ts.find((t) => (LM.st.tw[t.id] | 0) < 3) || ts[0] || null;
}
function lmCode() { const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let s = ""; for (let i = 0; i < 5; i++) s += a[Math.floor(Math.random() * a.length)]; return s; }
function lmSummary() {
  const tws = DATA.topik.filter((t) => DATA.negeri[t.negeri]);
  return { pl: PLACES.filter((p) => LM.st.pl[p[0]]).length, plN: PLACES.length, tw: tws.filter((t) => (LM.st.tw[t.id] | 0) >= 3).length, twN: tws.length };
}

/* ---------- kuiz ---------- */
function lmPickQs(tids, n) {
  let pool = []; tids.forEach((t) => { pool = pool.concat(BYTOPIK[t] || []); });
  if (pool.length < n) pool = pool.concat(shuffle(QLIST.slice()).slice(0, n * 3));
  const seen = new Set(), out = [];
  for (const q of shuffle(pool.slice())) { if (seen.has(q.i)) continue; seen.add(q.i); out.push(q); if (out.length >= n) break; }
  return out.map((q) => { const ord = shuffle([0, 1, 2, 3]); return { q: q, o: ord.map((i) => q.o[i]), ans: ord.indexOf(q.a) }; });
}
/* opt: { kick, title, intro, qs, pass, onDone(ok, tot) } */
function lmQuiz(opt) {
  const z = { i: 0, ok: 0, qs: opt.qs };
  if (!z.qs.length) { toast("Tiada soalan untuk tajuk ini.", "warn"); return; }
  const show = () => lmCard((b) => {
    const it = z.qs[z.i];
    b.append(el("div", { class: "lm-kick" }, opt.kick + " · Soalan " + (z.i + 1) + "/" + z.qs.length), el("h2", null, opt.title));
    const bar = el("div", { class: "lm-bar" }), bi = el("i"); bi.style.width = Math.round(100 * z.i / z.qs.length) + "%"; bar.appendChild(bi); b.appendChild(bar);
    b.appendChild(qSet(el("div", { class: "lm-q" }), it.q.q));
    const os = el("div", { class: "lm-opts" }), btns = [];
    it.o.forEach((o, k) => {
      const bt = el("button", { type: "button", class: "lm-opt" }); qSet(bt, "ABCD"[k] + ". " + o); btns.push(bt); os.appendChild(bt);
      bt.addEventListener("click", () => {
        if (z.lock) return; z.lock = true;
        const good = k === it.ans; if (good) z.ok++;
        try { lrnRec(it.q, good, "lm"); } catch (e) { /* abaikan */ }
        btns.forEach((x, j) => { x.disabled = true; if (j === it.ans) x.classList.add("ok"); else if (j === k) x.classList.add("no"); });
        lmSnd(good ? "ok" : "bad");
        if (it.q.e) b.appendChild(el("div", { class: "lm-ex" }, (good ? "Betul! " : "Jawapan: " + "ABCD"[it.ans] + ". ") + it.q.e));
        const nx = lmBtn(z.i + 1 < z.qs.length ? "Seterusnya" : "Lihat keputusan", "pri", () => { z.i++; z.lock = false; if (z.i < z.qs.length) show(); else done(); });
        b.appendChild(el("div", { class: "lm-row" }, nx)); if (!TOUCH) nx.focus();
      });
    });
    b.appendChild(os);
    b.appendChild(el("div", { class: "lm-row" }, lmBtn("Berhenti", "", lmCardClose)));
  });
  const done = () => { const pass = z.ok >= opt.pass; opt.onDone(pass, z.ok, z.qs.length); };
  if (opt.intro) lmCard((b) => { opt.intro(b); b.appendChild(el("div", { class: "lm-row" }, lmBtn("Mula kuiz", "pri", show), lmBtn("Nanti dulu", "", lmCardClose))); });
  else show();
}
/* Menara Ilmu */
function lmTowerOpen(o) {
  const t = o.t, best = LM.st.tw[o.id] | 0;
  lmQuiz({
    kick: "Menara Ilmu · " + DATA.negeri[o.k].pendek, title: (t.kod || t.id) + " " + t.nama, pass: 3, qs: lmPickQs([t.id], 5),
    intro: (b) => {
      b.append(el("div", { class: "lm-kick" }, "Menara Ilmu · " + DATA.negeri[o.k].nama), el("h2", null, (t.kod || t.id) + " " + t.nama));
      if (t.dskp) b.append(el("p", null, t.dskp));
      (t.nota || []).slice(0, 3).forEach((n) => b.appendChild(qSet(el("div", { class: "lm-ex" }), n)));
      b.append(el("p", null, "Jawab 5 soalan. Betul sekurang-kurangnya 3 untuk menawan menara ini." + (best ? " Markah terbaik anda: " + best + "/5." : "")));
    },
    onDone: (pass, ok, tot) => {
      const first = pass && best < 3;
      if (ok > best) LM.st.tw[o.id] = ok;
      { const tt = LM.st.tt || (LM.st.tt = {}), r = tt[o.id] || (tt[o.id] = { n: 0, t: 0 }); r.n++; r.t = Date.now(); r.l = ok; }
      lmSave(); lmTowerState(o);
      const fr = lmFriendsNear(LM.g, 25), xp = lmXp(ok * 3 + (first ? 10 : 0));
      if (pass && fr) { try { gdCoin(2); } catch (e) { /* abaikan */ } }
      if (pass) { lmSnd("win"); lmPop(first ? "Menara ditawan!" : "Tahniah!"); lmStateCheck(o.k); }
      lmCard((b) => {
        b.append(el("div", { class: "lm-kick" }, pass ? "Menara ditawan" : "Cuba lagi"), el("h2", null, ok + "/" + tot + " betul"));
        b.append(el("p", null, pass ? "Bendera menara " + (t.kod || t.id) + " kini berwarna emas." : "Betul sekurang-kurangnya 3 untuk menawan menara. Baca nota dan cuba lagi."));
        b.append(el("p", { class: "lm-ex" }, "XP +" + xp + (xp === 0 ? " (kuota XP harian META GEMPUR telah penuh)" : "") + (pass && fr ? " · Bonus rakan: +2 syiling kerana " + fr + " rakan berada berdekatan." : "")));
        b.append(el("div", { class: "lm-row" }, lmBtn("Teruskan jelajah", "pri", lmCardClose), pass ? null : lmBtn("Cuba lagi", "", () => lmTowerOpen(o))));
      });
    }
  });
}
function lmStateCheck(k) {
  const g = LM.g; if (!g) return;
  const tws = g.items.filter((x) => x.kind === "tw" && x.k === k);
  if (tws.length && tws.every((x) => x.done)) {
    const b = g.border && g.border[k]; if (b) { b.color.set(0xffd45a); b.opacity = 0.95; }
    lmPop("Negeri " + DATA.negeri[k].pendek + " dikuasai!");
  }
}
/* tempat pelancongan: ziarah, kuiz dan gantung nama */
function lmPlaceOpen(pl) {
  lmNamesLoad(pl);
  const tids = DATA.topik.filter((t) => t.negeri === pl.k).map((t) => t.id), seen = !!LM.st.pl[pl.id];
  lmQuiz({
    kick: "Ziarah · " + DATA.negeri[pl.k].pendek, title: pl.n, pass: 2, qs: lmPickQs(tids, 3),
    intro: (b) => {
      b.append(el("div", { class: "lm-kick" }, "Tempat pelancongan · " + DATA.negeri[pl.k].nama), el("h2", null, pl.n));
      b.append(el("p", null, pl.fakta));
      b.append(el("p", { class: "lm-ex" }, (seen ? "Anda sudah menziarahi tempat ini. " : "") + "Jawab 3 soalan (betul sekurang-kurangnya 2) untuk mendapat cop pasport dan menggantung nama pada Papan Kenangan." + (pl.count ? " Sudah " + pl.count + " pelawat menggantung nama di sini." : "")));
    },
    onDone: (pass, ok, tot) => {
      let xp = 0;
      if (pass) {
        const first = !seen; LM.st.pl[pl.id] = LM.st.pl[pl.id] || Date.now(); lmSave();
        xp = lmXp(ok * 3 + (first ? 8 : 0)); lmSnd("win"); lmPop(first ? "Cop pasport baharu!" : "Ziarah diterima!");
        const fr = lmFriendsNear(LM.g, 25); if (fr) { try { gdCoin(2); } catch (e) { /* abaikan */ } }
        lmDailyCheck(pl.id);
      } else xp = lmXp(ok * 2);
      lmCard((b) => {
        b.append(el("div", { class: "lm-kick" }, pass ? "Ziarah berjaya" : "Belum berjaya"), el("h2", null, ok + "/" + tot + " betul"));
        b.append(el("p", { class: "lm-ex" }, "XP +" + xp + (xp === 0 && ok ? " (kuota XP harian META GEMPUR telah penuh)" : "")));
        if (pass) {
          const hung = !!LM.st.nm[pl.id];
          b.append(el("p", null, hung ? "Nama anda sudah tergantung di sini. Anda boleh gantung semula untuk naik ke atas senarai." : "Gantung nama anda pada Papan Kenangan sebagai tanda anda telah menziarahi " + pl.n + "."));
          const hang = lmBtn(hung ? "Gantung semula nama saya" : "Gantung nama saya", "pri", async () => {
            hang.disabled = true; hang.textContent = "Menggantung...";
            const ok2 = await lmNameHang(pl);
            lmSnd("coin"); lmPop("Nama tergantung!");
            hang.textContent = ok2 ? "Nama tergantung ✔" : "Disimpan pada peranti ini";
            if (!ok2) b.appendChild(el("p", { class: "lm-ex" }, "Papan Kenangan dalam talian tidak dapat dikemas kini (tiada sambungan, atau guru belum membuka laluan 'ziarah' dalam peraturan Firebase). Nama anda tetap dipaparkan pada papan di peranti ini."));
          });
          b.append(el("div", { class: "lm-row" }, hang, lmBtn("Swafoto", "", () => { lmCardClose(); setTimeout(() => lmSelfie(pl), 60); }), lmBtn("Teruskan jelajah", "", lmCardClose)));
        } else b.append(el("div", { class: "lm-row" }, lmBtn("Cuba lagi", "pri", () => lmPlaceOpen(pl)), lmBtn("Teruskan jelajah", "", lmCardClose)));
      });
    }
  });
}
/* misi pelancong harian: 3 tempat dipilih mengikut hari (sama bagi semua murid) */
function lmDaily() {
  const d = dayKey() + SUBJ;
  return PLACES.filter((p) => DATA.negeri[p[1]]).map((p) => p[0]).sort((a, b) => hashStr(a + d) - hashStr(b + d)).slice(0, 3);
}
function lmDailyCheck(id) {
  const dq = LM.st.dq; if (!dq.v) dq.v = [];
  if ((LM.daily || []).indexOf(id) >= 0 && dq.v.indexOf(id) < 0) dq.v.push(id);
  if (!dq.done && (LM.daily || []).every((x) => dq.v.indexOf(x) >= 0)) {
    dq.done = 1; try { gdCoin(10); } catch (e) { /* abaikan */ } lmXp(15); lmPop("Misi pelancong harian selesai!");
  }
  lmSave(); lmQuestRender();
}
function lmQuestRender() {
  const q = LM.ui.quest; if (!q) return; q.textContent = "";
  const v = LM.st.dq.v || [];
  q.append(el("b", null, LM.st.dq.done ? "Misi harian selesai ✔" : "Misi pelancong hari ini"));
  (LM.daily || []).forEach((id) => { const p = PLACES.find((x) => x[0] === id); if (!p) return; const dn = v.indexOf(id) >= 0; q.append(el("div", { class: dn ? "dn" : "" }, (dn ? "✔ " : "• ") + p[2] + " (" + DATA.negeri[p[1]].pendek + ")")); });
}
/* lapangan terbang: perjalanan pantas selepas menjawab soalan "pas masuk" */
function lmAirportOpen(ap) {
  const g = LM.g;
  lmCard((b) => {
    b.append(el("div", { class: "lm-kick" }, "Lapangan terbang · Gempur Air"), el("h2", null, ap.n), el("p", null, "Pilih destinasi. Jawab satu soalan pas masuk dengan betul, kemudian naik pesawat dan nikmati penerbangan. Pendaratan pertama di setiap lapangan terbang memberi syiling."));
    const grid = el("div", { class: "lm-grid" });
    g.items.filter((x) => x.kind === "ap" && x.id !== ap.id).forEach((d) => {
      grid.appendChild(lmBtn("✈ " + d.n + " (" + DATA.negeri[d.k].pendek + ")", "", () => {
        const tids = DATA.topik.filter((t) => t.negeri === d.k).map((t) => t.id);
        lmQuiz({ kick: "Pas masuk", title: "Ke " + d.n, pass: 1, qs: lmPickQs(tids, 1), onDone: (pass) => {
          if (!pass) { lmCard((b2) => { b2.append(el("h2", null, "Pas masuk ditolak"), el("p", null, "Jawapan belum tepat. Cuba lagi.")); b2.append(el("div", { class: "lm-row" }, lmBtn("Cuba lagi", "pri", () => lmAirportOpen(ap)), lmBtn("Tutup", "", lmCardClose))); }); return; }
          lmCardClose(); lmFlyStart(ap, d);
        } });
      }));
    });
    b.append(grid, el("div", { class: "lm-row" }, lmBtn("Tutup", "", lmCardClose)));
  });
}
function lmTeleport(x, z, msg) {
  const f = LM.ui.fade; f.style.opacity = "1";
  setTimeout(() => {
    const g = LM.g; if (!g) return; g.p.x = x; g.p.z = z; g.p.y = lmGround(x, z); g.p.vx = g.p.vz = 0;
    g.camera.position.set(x, g.p.y + 30, z + 30); f.style.opacity = "0"; if (msg) lmPop(msg);
  }, 380);
}
/* pasport ziarah */
function lmPassport(tab) {
  if (tab) LM.ppTab = tab;
  const cur = LM.ppTab === "tajuk" ? "tajuk" : "tempat";
  lmCard((b) => {
    const s = lmSummary();
    b.append(el("div", { class: "lm-kick" }, "Pasport · " + (cleanName(P.nama) || "Pelajar") + " · " + SUBJS[SUBJ].subjek), el("h2", null, s.pl + "/" + s.plN + " cop tempat · " + s.tw + "/" + s.twN + " tajuk ditawan"));
    const tabs = el("div", { class: "lm-row lm-tabs" });
    [["tempat", "📘 Tempat dilawati"], ["tajuk", "🏰 Tajuk mengikut tema"]].forEach(([k, n]) => { const t = lmBtn(n, k === cur ? "pri" : "", () => lmPassport(k)); t.setAttribute("aria-pressed", k === cur ? "true" : "false"); tabs.appendChild(t); });
    b.appendChild(tabs);
    if (cur === "tajuk") { lmTopicList(b); b.append(el("div", { class: "lm-row" }, lmBtn("Tutup", "pri", lmCardClose))); return; }
    if (s.pl >= s.plN) b.append(el("p", null, "Gelaran: Pengembara META GEMPUR! Anda telah menziarahi semua tempat."));
    b.append(el("p", { class: "lm-ex" }, "✈ Penerbangan Gempur Air: " + (LM.st.fl | 0) + " · Lapangan terbang didarati: " + Object.keys(LM.st.ap || {}).length + "/" + AIRPORTS.length));
    const grid = el("div", { class: "lm-grid" });
    Object.keys(DATA.negeri).forEach((k) => {
      const pls = PLACES.filter((p) => p[1] === k), tws = DATA.topik.filter((t) => t.negeri === k);
      const dPl = pls.filter((p) => LM.st.pl[p[0]]).length, dTw = tws.filter((t) => (LM.st.tw[t.id] | 0) >= 3).length;
      const on = pls.length && dPl === pls.length && dTw === tws.length;
      const c = el("div", { class: "lm-stamp" + (on ? " on" : "") }, el("b", null, (on ? "★ " : "") + DATA.negeri[k].pendek));
      c.append(el("div", null, "Tempat: " + dPl + "/" + pls.length), el("div", null, "Menara: " + dTw + "/" + tws.length));
      pls.forEach((p) => c.append(el("div", { style: "opacity:" + (LM.st.pl[p[0]] ? 1 : 0.5) }, (LM.st.pl[p[0]] ? "✔ " : "○ ") + p[2])));
      grid.appendChild(c);
    });
    const isl = lmIslands();
    if (isl.length) {
      const gi = el("div", { class: "lm-grid" });
      isl.forEach((o) => { const r = (LM.st.kh || {})[o.id], on = !!(r && r.b >= 7); gi.appendChild(el("div", { class: "lm-stamp" + (on ? " on" : "") }, el("b", null, (on ? "★ " : "🏝 ") + o.n), el("div", null, o.khas.pendek + " · " + o.khas.n), el("div", null, r ? "Terbaik " + r.b + "/10 · " + r.n + " cubaan" : "Belum dicuba · feri dari " + o.port))); });
      b.append(el("p", { class: "lm-kick", style: "margin-top:12px" }, "Pulau Misi Khas"), gi);
    }
    b.append(grid, el("div", { class: "lm-row" }, lmBtn("Tutup", "pri", lmCardClose)));
  });
}
/* senarai tajuk mengikut tema: status kuiz Menara Ilmu bagi subjek semasa */
function lmTopicList(b) {
  const g = LM.g, tt = LM.st.tt || {}, all = DATA.topik.filter((t) => DATA.negeri[t.negeri]);
  const done = all.filter((t) => (LM.st.tw[t.id] | 0) >= 3).length, tried = all.filter((t) => (LM.st.tw[t.id] | 0) > 0 || (tt[t.id] && tt[t.id].n)).length;
  b.append(el("p", { class: "lm-ex" }, "Ditawan " + done + " · Dicuba " + (tried - done) + " · Belum " + (all.length - tried) + " daripada " + all.length + " tajuk. Tajuk ditawan apabila betul sekurang-kurangnya 3/5 di Menara Ilmu."));
  DATA.tema.forEach((tm) => {
    const ts = all.filter((t) => t.tema === tm.id); if (!ts.length) return;
    const dn = ts.filter((t) => (LM.st.tw[t.id] | 0) >= 3).length, pct = Math.round(100 * dn / ts.length);
    const sec = el("div", { class: "lm-tema" + (dn === ts.length ? " on" : "") });
    sec.style.setProperty("--c", tm.warna || "#5ad1ff");
    const hd = el("div", { class: "lm-tema-h" }, el("b", null, (dn === ts.length ? "★ " : "") + tm.nama), el("span", null, (tm.tingkatan ? "Tingkatan " + tm.tingkatan + " · " : "") + dn + "/" + ts.length));
    const bar = el("div", { class: "lm-bar" }), bi = el("i"); bi.style.width = pct + "%"; bar.appendChild(bi);
    sec.append(hd, bar);
    ts.forEach((t) => {
      const best = LM.st.tw[t.id] | 0, rec = tt[t.id], n = rec ? rec.n | 0 : (best ? 1 : 0);
      const st = best >= 3 ? "ok" : n ? "try" : "no";
      const row = el("div", { class: "lm-tp " + st });
      row.append(el("span", { class: "ic" }, st === "ok" ? "✔" : st === "try" ? "◐" : "○"),
        el("span", { class: "nm" }, (t.kod || t.id) + " " + t.nama),
        el("span", { class: "mt" }, (st === "no" ? "Belum dijawab" : "Terbaik " + best + "/5 · " + n + " cubaan") + " · " + (DATA.negeri[t.negeri] ? DATA.negeri[t.negeri].pendek : "")));
      const it = g && g.items.find((x) => x.kind === "tw" && x.id === t.id);
      if (it) row.appendChild(lmBtn(st === "ok" ? "Ulang" : "Tunjuk arah", "", () => { g.wp = { x: it.x, z: it.z, n: "Menara " + (t.kod || t.id) }; lmWpSet(); lmCardClose(); lmPop("Ikut tiang merah ke Menara " + (t.kod || t.id)); }));
      sec.appendChild(row);
    });
    b.appendChild(sec);
  });
  const isl = lmIslands();
  if (isl.length) {
    const sec = el("div", { class: "lm-tema" }); sec.style.setProperty("--c", "#d9573a");
    sec.appendChild(el("div", { class: "lm-tema-h" }, el("b", null, "🏝 Pulau Misi Khas"), el("span", null, "10 soalan · lulus 7")));
    isl.forEach((o) => {
      const r = (LM.st.kh || {})[o.id], st = r && r.b >= 7 ? "ok" : r ? "try" : "no", row = el("div", { class: "lm-tp " + st });
      row.append(el("span", { class: "ic" }, st === "ok" ? "✔" : st === "try" ? "◐" : "○"), el("span", { class: "nm" }, o.khas.pendek + " " + o.khas.n), el("span", { class: "mt" }, o.n + " · " + (r ? "Terbaik " + r.b + "/10 · " + r.n + " cubaan" : "Feri dari " + o.port)));
      const jt = g && g.items.find((x) => x.kind === "jt" && x.isl === o && x.k !== o.id);
      if (jt) row.appendChild(lmBtn("Ke jeti", "", () => { g.wp = { x: jt.x, z: jt.z, n: o.port }; lmWpSet(); lmCardClose(); lmPop("Ikut tiang merah ke " + o.port); }));
      sec.appendChild(row);
    });
    b.appendChild(sec);
  }
}
/* swafoto: gambar dunia + bingkai bertulis nama dan tempat */
function lmSelfie(pl) {
  const g = LM.g; if (!g) return;
  g.renderer.render(g.scene, g.camera);
  let url = ""; try { url = g.renderer.domElement.toDataURL("image/jpeg", 0.9); } catch (e) { url = ""; }
  if (!url) { toast("Swafoto tidak dapat diambil pada peranti ini.", "warn"); return; }
  const img = new Image();
  img.onload = () => {
    const W = 1080, H = Math.round(W * img.height / img.width) + 150, c = document.createElement("canvas"); c.width = W; c.height = H;
    const x = c.getContext("2d"); x.fillStyle = "#0b2a44"; x.fillRect(0, 0, W, H); x.drawImage(img, 0, 0, W, H - 150);
    x.fillStyle = "#ffd45a"; x.font = "900 46px Nunito, sans-serif"; x.fillText((cleanName(P.nama) || "Saya") + " di " + (pl ? pl.n : DATA.negeri[lmAt(g.p.x, g.p.z)] ? DATA.negeri[lmAt(g.p.x, g.p.z)].pendek : "Malaysia"), 36, H - 86);
    x.fillStyle = "#cde3f3"; x.font = "700 30px Nunito, sans-serif"; x.fillText("META GEMPUR · " + new Date().toLocaleDateString("ms-MY"), 36, H - 38);
    lmCard((b) => {
      b.append(el("div", { class: "lm-kick" }, "Swafoto"), el("h2", null, pl ? pl.n : "Kenangan jelajah"));
      const im = el("img", { src: c.toDataURL("image/jpeg", 0.88), alt: "Swafoto META GEMPUR", style: "width:100%;border-radius:12px;margin:8px 0" }); b.appendChild(im);
      const a = el("a", { href: im.src, download: "swafoto-meta-gempur.jpg", style: "display:none" }); b.appendChild(a);
      b.append(el("div", { class: "lm-row" }, lmBtn("Muat turun", "pri", () => a.click()), lmBtn("Tutup", "", lmCardClose)));
    });
  };
  img.src = url;
}
/* senarai pemain dalam bilik */
function lmRoomPanel() {
  lmCard((b) => {
    b.append(el("div", { class: "lm-kick" }, "Bilik bersama"), el("h2", null, LM.room ? (LM.roomKind === "sekolah" ? "Bilik sekolah" : "Kod bilik: " + LM.roomCode) : "Main solo"));
    if (LM.room && LM.roomKind !== "sekolah") b.append(el("p", null, "Kongsi kod " + LM.roomCode + " dengan rakan. Mereka pilih Dunia Gempur, tekan Masuk kod dan taip kod ini."));
    const list = el("div", { class: "lm-grid" });
    list.appendChild(el("div", { class: "lm-stamp on" }, el("b", null, (cleanName(P.nama) || "Saya") + " (anda)"), el("div", null, lmStamps() + " cop pasport")));
    Object.keys(LM.peers).forEach((id) => { const e = LM.peers[id]; list.appendChild(el("div", { class: "lm-stamp" }, el("b", null, e.n), el("div", null, (e.st | 0) + " cop pasport"))); });
    b.appendChild(list);
    if (!LM.room) b.append(el("p", { class: "lm-ex" }, "Untuk main bersama, keluar ke skrin mula dan pilih Cipta bilik rakan atau Masuk kod."));
    b.append(el("div", { class: "lm-row" }, lmBtn("Tutup", "pri", lmCardClose)));
  });
}

/* ---------- Top 5 kedudukan minggu ini di langit (v17.89) ---------- */
function lmSkyDraw(sk) {
  return (x, w, h) => {
    x.clearRect(0, 0, w, h);
    const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(20,40,90,.92)"); gr.addColorStop(1, "rgba(60,20,90,.88)");
    lmRound(x, 8, 8, w - 16, h - 16, 40); x.fillStyle = gr; x.fill(); x.lineWidth = 10; x.strokeStyle = "#ffd45a"; x.stroke();
    x.textAlign = "center"; x.fillStyle = "#ffd45a"; x.font = "900 64px Fredoka, Nunito, sans-serif"; x.fillText("🏆 TOP 5 MINGGU INI", w / 2, 92);
    x.fillStyle = "#cde3f3"; x.font = "800 30px Nunito, sans-serif"; x.fillText(SUBJS[SUBJ].subjek + " · mata semua permainan", w / 2, 134);
    const list = sk.list || [];
    if (!list.length) { x.fillStyle = "#fff"; x.font = "800 40px Nunito, sans-serif"; x.fillText(sk.err || (sk.busy ? "Memuatkan kedudukan..." : "Jawab soalan untuk jadi yang pertama di sini!"), w / 2, 330); return; }
    const med = ["#ffd45a", "#d9e2ec", "#e0975a", "#9fd3ff", "#9fd3ff"];
    list.forEach((r, i) => {
      const y = 170 + i * 82; lmRound(x, 40, y, w - 80, 70, 22); x.fillStyle = r.me ? "rgba(255,212,90,.32)" : "rgba(255,255,255,.1)"; x.fill();
      x.fillStyle = med[i]; x.font = "900 48px Fredoka, Nunito, sans-serif"; x.textAlign = "left"; x.fillText((i === 0 ? "👑" : "#" + (i + 1)), 62, y + 52);
      x.fillStyle = "#fff"; x.font = "900 40px Nunito, sans-serif"; x.fillText(String(r.n || "").slice(0, 16) + (r.me ? " (anda)" : ""), 170, y + 40);
      x.fillStyle = "#b9cde0"; x.font = "700 24px Nunito, sans-serif"; x.fillText([r.k, String(r.sk || "").slice(0, 30)].filter(Boolean).join(" · "), 170, y + 64);
      x.textAlign = "right"; x.fillStyle = med[i]; x.font = "900 42px Fredoka, Nunito, sans-serif"; x.fillText(String(r.v), w - 66, y + 50);
    });
  };
}
function lmSkyInit(g) {
  const sk = g.sky5 = { list: [], busy: true, at: 0, err: "" };
  sk.tex = lmTex(1024, 600, lmSkyDraw(sk));
  sk.sp = new T.Sprite(new T.SpriteMaterial({ map: sk.tex, fog: false, depthWrite: false, depthTest: false, transparent: true }));
  sk.sp.scale.set(TOUCH ? 160 : 180, TOUCH ? 94 : 105, 1); sk.sp.renderOrder = 20; sk.sp.visible = LM.st.sky !== 0; g.scene.add(sk.sp);
  lmSkyLoad(g);
}
async function lmSkyLoad(g) {
  const sk = g.sky5; if (!sk) return; sk.at = Date.now(); sk.busy = true;
  try {
    if (Net.db && Net.uid && (!RK.at || Date.now() - RK.at > 60000)) await rkPull();
    sk.list = rkAllRows().map((r) => ({ n: r.n, k: r.k, sk: r.sk, me: r.me, v: rkVal(r.m, "all", "minggu", "jumlah", "") })).filter((r) => r.v > 0).sort((a, b) => b.v - a.v).slice(0, 5);
    sk.err = !(Net.db && Net.uid) ? "Kedudukan bersama memerlukan sambungan internet" : "";
  } catch (e) { sk.err = "Kedudukan tidak dapat dimuatkan"; }
  sk.busy = false;
  const c = sk.tex.userData.c; sk.tex.userData.draw(c.getContext("2d"), c.width, c.height); sk.tex.needsUpdate = true;
}
function lmSkyPlace(g) {
  const sk = g.sky5; if (!sk || !sk.sp.visible || g.flight) return;
  /* sentiasa terapung di langit di hadapan kamera, berhampiran bahagian atas skrin */
  const c = g.cam, cp = g.camera.position, D = 430, el = 0.5236 - c.pitch - (TOUCH ? 0.19 : 0.23);
  sk.sp.position.set(cp.x - Math.sin(c.yaw) * D, cp.y + Math.tan(el) * D, cp.z - Math.cos(c.yaw) * D);
}

/* ---------- peta mini dan peta besar ---------- */
const MX0 = 25, MY0 = 55, MW = 660, MH = 250;
function lmMapBase(w, h) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const x = c.getContext("2d"), s = Math.min(w / MW, h / MH), ox = (w - MW * s) / 2, oy = (h - MH * s) / 2;
  x.fillStyle = "#0d4f86"; x.fillRect(0, 0, w, h);
  for (const k of RAST.keys) {
    x.setTransform(s, 0, 0, s, ox + (-MX0 + (BORNEO[k] ? BX : 0)) * s, oy - MY0 * s);
    x.fillStyle = STATE_COL[k] || "#8fd16a"; x.strokeStyle = "rgba(30,60,20,.6)"; x.lineWidth = 0.6;
    x.fill(RAST.paths[k]); x.stroke(RAST.paths[k]);
  }
  x.setTransform(s, 0, 0, s, ox - MX0 * s, oy - MY0 * s); x.fillStyle = "#9fd18a";
  lmIslands().forEach((o) => { x.fill(o.path); x.stroke(o.path); });
  x.setTransform(1, 0, 0, 1, 0, 0);
  return { c: c, s: s, ox: ox, oy: oy };
}
function lmMapPt(m, wx, wz) { const s = toS(wx, wz); return [m.ox + (s.x - MX0) * m.s, m.oy + (s.y - MY0) * m.s]; }
function lmMapDraw(cv, m, big) {
  const g = LM.g; if (!g) return;
  const x = cv.getContext("2d"); x.drawImage(m.c, 0, 0);
  const r = big ? 5 : 2.2;
  for (const it of g.items) {
    const [px, py] = lmMapPt(m, it.x, it.z);
    if (it.kind === "pl") { x.fillStyle = LM.st.pl[it.id] ? "#ffd45a" : "#ffffff"; x.beginPath(); x.arc(px, py, r, 0, 6.2832); x.fill(); if (big) { x.strokeStyle = "#5a3a1e"; x.lineWidth = 1.5; x.stroke(); } }
    else if (it.kind === "tw") { x.fillStyle = it.done ? "#ffd45a" : "#7fe3ff"; x.fillRect(px - r * 0.8, py - r * 0.8, r * 1.6, r * 1.6); }
    else if (big && it.kind === "ap") { x.font = "16px sans-serif"; x.fillStyle = "#fff"; x.fillText("✈", px - 7, py + 6); }
    else if (it.kind === "kh") { x.font = (big ? 20 : 10) + "px sans-serif"; x.fillStyle = it.done ? "#ffd45a" : "#ff7a9a"; x.textAlign = "center"; x.fillText("★", px, py + (big ? 7 : 4)); x.textAlign = "left"; }
    else if (big && it.kind === "jt" && it.k !== it.isl.id) { x.font = "14px sans-serif"; x.fillStyle = "#7fe3ff"; x.fillText("⛴", px - 7, py + 5); }
  }
  if (big) {
    x.font = "800 12px Nunito, sans-serif"; x.fillStyle = "rgba(10,30,20,.85)"; x.textAlign = "center";
    for (const k of RAST.keys) { const pn = DATA.negeri[k].pins && DATA.negeri[k].pins[0]; if (!pn) continue; const w = toW(k, pn[0], pn[1]), [px, py] = lmMapPt(m, w.x, w.z); x.fillText(DATA.negeri[k].pendek, px, py - 12); }
    lmIslands().forEach((o) => { const w = lmIslW(o), [px, py] = lmMapPt(m, w.x, w.z); x.fillText(o.n.replace("Pulau ", "P. "), px, py - 16); });
    x.textAlign = "left";
  }
  for (const id in LM.peers) { const e = LM.peers[id], [px, py] = lmMapPt(m, e.x, e.z); x.fillStyle = "#ff7ad9"; x.beginPath(); x.arc(px, py, big ? 6 : 3, 0, 6.2832); x.fill(); }
  if (g.wp) { const [px, py] = lmMapPt(m, g.wp.x, g.wp.z); x.strokeStyle = "#ff4d4d"; x.lineWidth = 2; x.beginPath(); x.arc(px, py, big ? 9 : 4, 0, 6.2832); x.stroke(); }
  const [px, py] = lmMapPt(m, g.p.x, g.p.z), a = g.p.yaw, R = big ? 10 : 5;
  x.fillStyle = "#ffffff"; x.strokeStyle = "#0b2a44"; x.lineWidth = 1.5; x.beginPath();
  x.moveTo(px + Math.sin(a) * R, py + Math.cos(a) * R); x.lineTo(px + Math.sin(a + 2.5) * R * 0.7, py + Math.cos(a + 2.5) * R * 0.7); x.lineTo(px + Math.sin(a - 2.5) * R * 0.7, py + Math.cos(a - 2.5) * R * 0.7); x.closePath(); x.fill(); x.stroke();
}
function lmBigMap() {
  const g = LM.g; if (!g) return;
  if (LM.ui.big) { LM.ui.big.remove(); LM.ui.big = null; g.ui = false; return; }
  g.ui = true;
  const wrap = el("div", { class: "lm-big" }), m = lmMapBase(1240, 500), cv = el("canvas", { width: 1240, height: 500, "aria-label": "Peta Malaysia" });
  const box = el("div", { style: "display:grid;gap:10px;justify-items:center;padding:12px" });
  box.append(el("div", { class: "lm-kick" }, "Peta · ketik tempat untuk tetapkan destinasi"), cv, el("div", { class: "lm-row" }, lmBtn("Buang destinasi", "", () => { g.wp = null; lmWpSet(); lmMapDraw(cv, m, true); }), lmBtn("Tutup peta", "pri", lmBigMap)));
  wrap.appendChild(box); LM.root.appendChild(wrap); LM.ui.big = wrap;
  lmMapDraw(cv, m, true);
  cv.addEventListener("click", (e) => {
    const rc = cv.getBoundingClientRect(), mx = (e.clientX - rc.left) * cv.width / rc.width, my = (e.clientY - rc.top) * cv.height / rc.height;
    let best = null, bd = 26;
    for (const it of g.items) { const [px, py] = lmMapPt(m, it.x, it.z), d = Math.hypot(px - mx, py - my); if (d < bd) { bd = d; best = it; } }
    if (best) g.wp = { x: best.x, z: best.z, n: best.kind === "tw" ? "Menara " + (best.t.kod || best.t.id) : best.n };
    else { const sx = (mx - m.ox) / m.s + MX0, sy = (my - m.oy) / m.s + MY0, wx = (sx - OX) * SC, wz = (sy - OZ) * SC; g.wp = { x: wx, z: wz, n: "Titik pilihan" }; }
    lmWpSet(); lmMapDraw(cv, m, true);
  });
}
function lmWpSet() {
  const g = LM.g; if (!g) return;
  if (!g.beacon) { g.beacon = new T.Mesh(lmCyl(1.2, 1.2, 120, 10), new T.MeshBasicMaterial({ color: 0xff4d4d, transparent: true, opacity: 0.35, depthWrite: false })); g.scene.add(g.beacon); }
  g.beacon.visible = !!g.wp; if (g.wp) g.beacon.position.set(g.wp.x, 60, g.wp.z);
}

/* ---------- adegan ---------- */
function lmBuildScene() {
  const gq = LM.gq, r = LM.root;
  const cv = el("canvas", { class: "lm-cv", "aria-label": "META GEMPUR, paparan 3D" }); r.appendChild(cv); LM.cv = cv;
  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas: cv, antialias: !!gq, powerPreference: "high-performance" }); } catch (e) { return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, gq ? 1.75 : 1.25));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  if (gq && renderer.shadowMap) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; }
  const scene = new T.Scene(), sky = new T.Color(0xbfe3ff);
  scene.background = sky.clone(); scene.fog = new T.Fog(sky.clone(), 320, 1180);
  const camera = new T.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.5, 1700);
  const hemi = new T.HemisphereLight(0xe6f4ff, 0x4f6b35, 0.62); scene.add(hemi);
  const sun = new T.DirectionalLight(0xfff1d6, 0.9);
  if (gq) { sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = sc.bottom = -110; sc.right = sc.top = 110; sc.near = 10; sc.far = 420; sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.4; }
  scene.add(sun); scene.add(sun.target);
  const g = { renderer: renderer, scene: scene, camera: camera, sun: sun, hemi: hemi, sky: sky, clouds: null, items: [], cols: [], trees: [], coins: [], landM: {}, pads: [],
    p: { x: 0, y: 0, z: 0, vx: 0, vz: 0, vy: 0, yaw: 0, on: true, moving: false }, cam: { yaw: 0.4, pitch: 0.3, dist: 18 }, T: 0, ui: false, near: null, nearT: 0, cullT: 0, mmT: 0, hudT: 0, saveT: 0 };
  LM.g = g;
  lmBuildSky(g); lmBuildWorld(g); lmBuildSea(g); lmDayNight(g);
  g.myCode = lmMyCode(); g.me = lmAvatar(g.myCode, P.nama, true); scene.add(g.me.g);
  lmSkyInit(g); lmTrafficInit(g);
  return g;
}
function lmSpawn(g) {
  const nt = lmNextTopic(), tw = (nt && g.items.find((x) => x.kind === "tw" && x.id === nt.id)) || g.items.find((x) => x.kind === "ap" && x.id === "ap-klia") || g.items[0];
  const j = Math.random() * 6.2832;
  let x = tw.x + 10 + Math.cos(j) * 4, z = tw.z + 10 + Math.sin(j) * 4;
  for (let i = 0; i < 24 && !lmLandW(x, z); i++) { x = tw.x + Math.cos(i) * (6 + i); z = tw.z + Math.sin(i) * (6 + i); }
  g.p.x = x; g.p.z = z; g.cam.yaw = Math.atan2(x - tw.x, z - tw.z);
  g.camera.position.set(x + 20, 30, z + 20);
}
/* ---------- HUD ---------- */
function lmHud() {
  const r = LM.root, ui = LM.ui;
  ui.hud = el("div", { class: "lm-hud" });
  ui.state = el("div", { class: "lm-pill lm-state" }, "Malaysia");
  ui.coin = el("div", { class: "lm-pill" }); ui.stamp = el("div", { class: "lm-pill" }); ui.tw = el("div", { class: "lm-pill" }); ui.wp = el("div", { class: "lm-pill" }); ui.wp.hidden = true; ui.peers = el("div", { class: "lm-pill" }); ui.peers.hidden = true;
  ui.hud.append(ui.state, ui.coin, ui.stamp, ui.tw, ui.peers, ui.wp); r.appendChild(ui.hud);
  ui.quest = el("div", { class: "lm-quest" }); r.appendChild(ui.quest); lmQuestRender();
  ui.mm = el("canvas", { class: "lm-mm", width: 380, height: 192, title: "Buka peta (M)", "aria-label": "Peta mini" }); ui.mm.addEventListener("click", lmBigMap); r.appendChild(ui.mm);
  LM.mmBase = lmMapBase(380, 192);
  const top = el("div", { class: "lm-top" });
  ui.skyB = lmBtn(LM.st.sky === 0 ? "Top 5: tutup" : "Top 5: buka", "", () => { const g = LM.g; if (!g || !g.sky5) return; const on = !g.sky5.sp.visible; g.sky5.sp.visible = on; LM.st.sky = on ? 1 : 0; lmSave(); ui.skyB.textContent = on ? "Top 5: buka" : "Top 5: tutup"; });
  top.append(lmBtn("Pasport (P)", "", () => lmPassport()), lmBtn("Tajuk (T)", "", () => lmPassport("tajuk")), ui.skyB, lmBtn("Bilik", "", lmRoomPanel), lmBtn("Swafoto", "", () => lmSelfie(null)),
    ui.snd = lmBtn(LM.mute ? "Bunyi: tutup" : "Bunyi: buka", "", () => { LM.mute = !LM.mute; ui.snd.textContent = LM.mute ? "Bunyi: tutup" : "Bunyi: buka"; }),
    lmBtn("Keluar", "", () => { if (confirm("Keluar dari META GEMPUR? Cop pasport dan menara yang ditawan sudah disimpan.")) lmClose(); }));
  r.appendChild(top);
  ui.prompt = el("button", { type: "button", class: "pri lm-prompt", hidden: "" }); ui.prompt.addEventListener("click", lmInteract); r.appendChild(ui.prompt);
  const emo = el("div", { class: "lm-emo" });
  Object.keys(EMOTE).forEach((k, i) => emo.appendChild(lmBtn((i + 1) + " " + EMOTE[k], "", () => lmEmote(k))));
  r.appendChild(emo);
  ui.js = el("div", { class: "lm-js" }, el("i")); r.appendChild(ui.js);
  const tc = el("div", { class: "lm-tc" });
  ui.run = lmBtn("Lari", "", () => { LM.run = !LM.run; ui.run.classList.toggle("ok", LM.run); });
  tc.append(lmBtn("Salam", "", () => lmEmote("salam")), ui.run, lmBtn("Lompat", "big pri", () => { LM.jump = true; }));
  r.appendChild(tc);
  ui.fade = el("div", { class: "lm-fade" }); r.appendChild(ui.fade);
}
function lmHudTick(g) {
  const ui = LM.ui, k = lmAt(g.p.x, g.p.z), s = lmSummary();
  const nm = g.flight && g.flight.ph === "air" ? "Di udara ✈ " + (k ? lmPlaceShort(k) : "Laut China Selatan") : g.sail ? "⛴ Di laut" : lmPlaceName(k);
  if (ui.state.textContent !== nm) { ui.state.textContent = nm; if ((DATA.negeri[k] || ISL_BY[k]) && g.lastK && g.lastK !== k) lmPop(lmPlaceShort(k)); }
  if (DATA.negeri[k] || ISL_BY[k]) g.lastK = k;
  ui.coin.innerHTML = ""; ui.coin.append("🪙 ", el("b", null, String(P.coin | 0)));
  ui.stamp.textContent = "📘 Cop " + s.pl + "/" + s.plN; ui.tw.textContent = "🏰 Menara " + s.tw + "/" + s.twN;
  const np = Object.keys(LM.peers).length; ui.peers.hidden = !LM.room; ui.peers.textContent = "👥 " + (np + 1) + (LM.roomKind === "sekolah" ? " · sekolah" : LM.roomCode ? " · " + LM.roomCode : "");
  if (g.wp) { ui.wp.hidden = false; const d = Math.round(Math.hypot(g.wp.x - g.p.x, g.wp.z - g.p.z)); ui.wp.textContent = "📍 " + g.wp.n + " · " + d + " m"; if (d < 12) { g.wp = null; lmWpSet(); } }
  else ui.wp.hidden = true;
}
/* ---------- interaksi ---------- */
function lmNearTick(g) {
  let best = null, bd = 1e9;
  for (const it of g.items) { const d = Math.hypot(it.x - g.p.x, it.z - g.p.z); if (d < it.ir && d < bd) { bd = d; best = it; } }
  /* papan kenangan juga boleh dibuka dari hadapannya */
  for (const it of g.items) if (it.kind === "pl") { const d = Math.hypot(it.bx - g.p.x, it.bz - g.p.z); if (d < 7 && d < bd) { bd = d; best = it; } if (d < 60) lmNamesLoad(it); }
  g.near = best;
  const pr = LM.ui.prompt;
  if (!best || g.ui) { pr.hidden = true; return; }
  const key = TOUCH ? "" : "E: ";
  const txt = best.kind === "tw" ? key + "Menara Ilmu " + (best.t.kod || best.t.id) + (best.done ? " ✔" : "") : best.kind === "pl" ? key + "Ziarah " + best.n + (LM.st.pl[best.id] ? " ✔" : "")
    : best.kind === "kh" ? key + "Markas Misi Khas " + best.isl.khas.pendek + (best.done ? " ✔" : "") : best.kind === "jt" ? key + (best.k === best.isl.id ? "Feri pulang ke tanah besar" : "Naik feri ke " + best.isl.n) : key + "Terbang dari " + best.n;
  if (pr.textContent !== txt) pr.textContent = txt;
  pr.hidden = false;
}
function lmInteract() {
  const g = LM.g; if (!g || g.ui || !g.near) return;
  lmSnd("open");
  const it = g.near;
  if (it.kind === "tw") lmTowerOpen(it); else if (it.kind === "pl") lmPlaceOpen(it); else if (it.kind === "ap") lmAirportOpen(it); else if (it.kind === "kh") lmKhasOpen(it); else if (it.kind === "jt") lmFerryOpen(it);
}
/* ---------- input ---------- */
function lmKey(e) {
  if (!LM.on || !LM.g) return;
  const t = e.target; if (t && (t.nodeName === "INPUT" || t.nodeName === "TEXTAREA")) return;
  const k = String(e.key || "").toLowerCase(), dn = e.type === "keydown", g = LM.g;
  if (dn && k === "escape") { e.preventDefault(); if (LM.ui.big) lmBigMap(); else if (LM.ui.card) lmCardClose(); else if (confirm("Keluar dari META GEMPUR?")) lmClose(); return; }
  if (g.ui) return;
  if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].indexOf(k) >= 0) e.preventDefault();
  LM.keys[k] = dn;
  if (!dn) return;
  if (k === "e" || k === "enter") lmInteract();
  else if (k === "m") lmBigMap();
  else if (k === "p") lmPassport("tempat");
  else if (k === "t") lmPassport("tajuk");
  else if (k >= "1" && k <= "4") lmEmote(Object.keys(EMOTE)[+k - 1]);
}
function lmPointers(cv) {
  cv.addEventListener("pointerdown", (e) => {
    if (!LM.g || LM.g.ui) return;
    if (e.pointerType === "touch" && e.clientX < window.innerWidth * 0.42 && LM.js.id < 0) {
      LM.js.id = e.pointerId; LM.js.cx = e.clientX; LM.js.cy = e.clientY; LM.js.x = LM.js.y = 0;
      const j = LM.ui.js; j.style.left = (e.clientX - 60) + "px"; j.style.top = (e.clientY - 60) + "px"; j.style.bottom = "auto";
    } else if (LM.drag.id < 0) { LM.drag.id = e.pointerId; LM.drag.x = e.clientX; LM.drag.y = e.clientY; }
    try { cv.setPointerCapture(e.pointerId); } catch (x) { /* abaikan */ }
  });
  cv.addEventListener("pointermove", (e) => {
    if (e.pointerId === LM.js.id) {
      let dx = (e.clientX - LM.js.cx) / 50, dy = (LM.js.cy - e.clientY) / 50; const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; }
      LM.js.x = dx; LM.js.y = dy; const i = LM.ui.js.firstChild; i.style.transform = "translate(" + dx * 34 + "px," + -dy * 34 + "px)";
    } else if (e.pointerId === LM.drag.id) {
      const dx = e.clientX - LM.drag.x, dy = e.clientY - LM.drag.y; LM.drag.x = e.clientX; LM.drag.y = e.clientY;
      LM.camIn = [(LM.camIn ? LM.camIn[0] : 0) + dx * 0.006, (LM.camIn ? LM.camIn[1] : 0) + dy * 0.004];
    }
  });
  const up = (e) => {
    if (e.pointerId === LM.js.id) { LM.js.id = -1; LM.js.x = LM.js.y = 0; const j = LM.ui.js; j.style.left = ""; j.style.top = ""; j.style.bottom = ""; j.firstChild.style.transform = ""; }
    if (e.pointerId === LM.drag.id) LM.drag.id = -1;
  };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  cv.addEventListener("contextmenu", (e) => e.preventDefault());
  cv.addEventListener("wheel", (e) => { if (LM.g) { LM.g.cam.dist = clamp(LM.g.cam.dist + Math.sign(e.deltaY) * 2, 8, 46); e.preventDefault(); } }, { passive: false });
}
function lmResize() {
  const g = LM.g; if (!g) return;
  g.renderer.setSize(window.innerWidth, window.innerHeight, false); g.camera.aspect = window.innerWidth / window.innerHeight; g.camera.updateProjectionMatrix();
}
/* ---------- gelung ---------- */
function lmDayNight(g) {
  /* kitaran 8 minit: siang, senja, malam terang, subuh */
  const t = (g.T / 480) % 1, day = 0.5 + 0.5 * Math.cos(t * 6.2832);
  const C = (h) => new T.Color(h), mix = (a, b, c, d) => (day > 0.5 ? C(b).lerp(C(c), (day - 0.5) * 2) : C(a).lerp(C(b), day * 2)) || d;
  const top = mix(0x1b2c55, 0x6f86c9, 0x2f7fd8), hor = mix(0x3a5684, 0xf6b27a, 0xcfe9ff);
  if (g.paintSky) g.paintSky(top, hor);
  g.scene.background.copy(hor); g.scene.fog.color.copy(hor);
  g.sun.intensity = 0.25 + 0.75 * day; g.hemi.intensity = 0.42 + 0.38 * day;
  g.sun.color.copy(C(0xffb070).lerp(C(0xfff4e0), clamp((day - 0.4) * 1.7, 0, 1)));
  const a = 0.25 + t * 6.2832; g.sunDir = new T.Vector3(Math.cos(a) * 0.55, 0.35 + 0.55 * day, Math.sin(a) * 0.55 + 0.25).normalize();
  if (g.sunDisc) g.sunDisc.material.opacity = clamp(day * 1.4 - 0.2, 0, 1);
}
function lmLoop(ts) {
  if (!LM.on || !LM.g) return;
  LM.raf = requestAnimationFrame(lmLoop);
  const g = LM.g, dt = clamp((ts - (g.last || ts)) / 1000, 0, 0.05); g.last = ts; g.T += dt;
  try {
    if (g.flight) lmFlightTick(g, dt); else if (g.sail) lmSailTick(g, dt); else { lmUpdatePlayer(g, dt); lmUpdateCam(g, dt); }
    lmNet(g, dt, ts); lmPuffTick(g, dt); lmTrafficTick(g, dt);
    if (g.me.bub && (g.me.bubT -= dt) <= 0) lmBubble(g.me, "");
    if ((g.nearT -= dt) <= 0) { g.nearT = 0.15; lmNearTick(g); }
    if ((g.hudT -= dt) <= 0) { g.hudT = 0.25; lmHudTick(g); }
    if ((g.mmT -= dt) <= 0) { g.mmT = 0.12; lmMapDraw(LM.ui.mm, LM.mmBase, false); }
    if ((g.cullT -= dt) <= 0) {
      g.cullT = 0.5; lmDayNight(g);
      for (const it of g.items) { const d = Math.hypot(it.x - g.p.x, it.z - g.p.z); if (it.lb) it.lb.visible = d < 260; if (it.m && it.m.isObject3D) it.m.visible = d < 800; }
    }
    for (const it of g.items) if (it.kind === "tw" && it.m.cr.visible !== false) { it.m.cr.rotation.y += dt * 1.4; it.m.cr.position.y = 10.4 + Math.sin(g.T * 2 + it.x) * 0.4; }
    for (let i = g.coins.length - 1; i >= 0; i--) {
      const c = g.coins[i]; c.m.rotation.z += dt * 3;
      if (Math.abs(c.x - g.p.x) < 2.6 && Math.abs(c.z - g.p.z) < 2.6 && Math.abs(g.p.y + 1.6 - c.y) < 3) {
        g.scene.remove(c.m); g.coins.splice(i, 1); LM.st.cd.got.push(c.id); g.saveT = 1;
        let n = 0; try { n = gdCoin(1); } catch (e) { n = 0; } lmSnd("coin"); lmPop(n ? "+" + n + " syiling" : "Had syiling hari ini penuh");
      }
    }
    if (g.saveT && (g.saveT -= dt) <= 0) { g.saveT = 0; lmSave(); }
    if (g.sky5 && Date.now() - g.sky5.at > 60000) lmSkyLoad(g);
    if (g.clouds) for (const c of g.clouds.children) { c.position.x += dt * 3; if (c.position.x > 1600) c.position.x = -1300; }
    if (g.seaN) { g.seaN.offset.x = (g.T * 0.006) % 1; g.seaN.offset.y = (g.T * 0.0037) % 1; }
    g.renderer.render(g.scene, g.camera);
  } catch (e) { LM.err = String(e && e.stack || e); if (!LM.errShown) { LM.errShown = true; console.error(e); } }
}
/* ---------- buka, mula, tutup ---------- */
function lmOpen(tid) {
  if (!T) { toast("Grafik 3D (WebGL) tidak tersedia pada peranti ini.", "warn"); return; }
  LM.tid = tid || ""; LM.on = false; lmLoad(); lmRaster();
  document.body.classList.add("ar-lock");
  lmSetup();
}
function lmStart(code, kind) {
  const r = LM.root;
  lmCardClose(); r.textContent = "";
  const ld = el("div", { class: "lm-card" }, el("div", { class: "lm-box" }, el("div", { class: "lm-kick" }, "META GEMPUR"), el("h2", null, "Membina peta Malaysia..."), el("p", null, "Menyusun negeri, menara ilmu dan tempat pelancongan.")));
  r.appendChild(ld);
  setTimeout(async () => {
    const g = lmBuildScene();
    if (!g) { ld.remove(); toast("Grafik 3D (WebGL) tidak dapat dimulakan pada peranti ini.", "warn"); lmClose(); return; }
    ld.remove(); LM.daily = lmDaily(); lmHud(); lmSpawn(g); lmPointers(LM.cv); lmWpSet();
    LM.on = true; g.last = 0;
    window.addEventListener("keydown", lmKey, true); window.addEventListener("keyup", lmKey, true); window.addEventListener("resize", lmResize);
    LM.raf = requestAnimationFrame(lmLoop);
    if (code) { const ok = await lmNetJoin(code, kind); if (ok) lmPop(kind === "sekolah" ? "Masuk bilik sekolah" : "Bilik " + code); }
    lmPop("Selamat datang ke Malaysia!");
  }, 30);
}
function lmClose() {
  LM.on = false; cancelAnimationFrame(LM.raf); lmNetLeave(); lmEngine(0);
  window.removeEventListener("keydown", lmKey, true); window.removeEventListener("keyup", lmKey, true); window.removeEventListener("resize", lmResize);
  const g = LM.g;
  if (g) {
    try { g.scene.traverse((o) => { if (o.geometry && !Object.values(GEO).includes(o.geometry)) o.geometry.dispose(); if (o.material && o.material.map) o.material.map.dispose(); }); } catch (e) { /* abaikan */ }
    try { g.renderer.dispose(); if (g.renderer.forceContextLoss) g.renderer.forceContextLoss(); } catch (e) { /* abaikan */ }
  }
  if (LM.st) lmSave();
  LM.g = null; LM.ui = {}; LM.keys = {}; LM.js.id = -1; LM.drag.id = -1; LM.run = false;
  if (LM.root) { LM.root.textContent = ""; LM.root.hidden = true; }
  document.body.classList.remove("ar-lock");
}
/* untuk ujian automatik */
LM._g = (x, z) => lmGround(x, z); LM._fly = (a, d) => lmFlyStart(a, d);
LM._t = { lmAt: lmAt, toW: toW, PLACES: PLACES, AIRPORTS: AIRPORTS, lmInteract: lmInteract, lmPickQs: lmPickQs };
})();
