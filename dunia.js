/* =====================================================================
   DUNIA GEMPUR MALAYSIA (v17.88): dunia terbuka gaya blok di atas peta Malaysia.
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
  ["pg-kapitan", "penang", "Masjid Kapitan Keling", "masjid", 75.6, 120.0, "Masjid Kapitan Keling di George Town dibina pada abad ke-19 oleh komuniti Muslim India."],
  ["pg-bendera", "penang", "Bukit Bendera", "bukit", 72.6, 124.0, "Bukit Bendera (833 m) boleh dinaiki dengan kereta api funikular dan menawarkan pemandangan George Town."],
  ["pg-jambatan", "penang", "Jambatan Pulau Pinang", "jambatan", 83, 130.6, "Jambatan Pulau Pinang sepanjang 13.5 km menghubungkan pulau dengan Seberang Perai sejak 1985."],
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
const RS = 2, RX0 = 55, RY0 = 50, RW = 1260, RH = 520;
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
  return RAST.keys[Math.round(r / 16) - 1] || "";
}
const lmLandW = (wx, wz) => lmAt(wx, wz) !== "";

/* ---------- pembinaan dunia ---------- */
function lmStudTex() {
  /* tekstur "stud" gaya blok mainan: grid halus dengan bulatan timbul */
  const t = lmTex(64, 64, (x, w, h) => {
    x.fillStyle = "#ffffff"; x.fillRect(0, 0, w, h);
    x.fillStyle = "rgba(0,0,0,.07)"; x.fillRect(0, 0, w, 2); x.fillRect(0, 0, 2, h);
    x.beginPath(); x.arc(w / 2, h / 2, 13, 0, 6.2832); x.fillStyle = "rgba(255,255,255,.9)"; x.fill();
    x.beginPath(); x.arc(w / 2 + 2, h / 2 + 2, 13, 0, 6.2832); x.fillStyle = "rgba(0,0,0,.06)"; x.fill();
  });
  t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(1 / 6, 1 / 6);
  return t;
}
function lmShapes(k) {
  const out = [];
  DATA.negeri[k].d.split("M").filter(Boolean).forEach((sp) => {
    const n = sp.replace(/Z/g, "").match(/-?[\d.]+/g).map(Number); if (n.length < 6) return;
    const s = new T.Shape();
    for (let i = 0; i < n.length; i += 2) { const w = toW(k, n[i], n[i + 1]); if (i === 0) s.moveTo(w.x, w.z); else s.lineTo(w.x, w.z); }
    out.push(s);
  });
  return out;
}
function lmBuildLand(g) {
  const stud = lmStudTex(), side = lmMat("#e9d29a");
  for (const k of Object.keys(DATA.negeri)) {
    const shapes = lmShapes(k); if (!shapes.length) continue;
    const geo = new T.ExtrudeGeometry(shapes, { depth: 5, bevelEnabled: false, curveSegments: 1 });
    geo.rotateX(Math.PI / 2);
    const top = new T.MeshLambertMaterial({ color: STATE_COL[k] || "#8fd16a", map: stud });
    const m = new T.Mesh(geo, [top, side]); m.receiveShadow = true; m.userData.k = k;
    g.scene.add(m); g.landM[k] = m;
    /* garis sempadan negeri */
    shapes.forEach((s) => {
      const pts = s.getPoints().map((p) => new T.Vector3(p.x, 0.06, p.y)); pts.push(pts[0].clone());
      const ln = new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color: 0x3b6b2a, transparent: true, opacity: 0.45 }));
      g.scene.add(ln);
    });
  }
  /* jambatan Pulau Pinang */
  const br = RAST.bridge;
  if (br) {
    const a = toW("penang", br[0], br[1]), b = toW("penang", br[2], br[3]), len = Math.hypot(b.x - a.x, b.z - a.z), ang = Math.atan2(b.z - a.z, b.x - a.x);
    const grp = new T.Group(); grp.position.set((a.x + b.x) / 2, 0, (a.z + b.z) / 2); grp.rotation.y = -ang;
    grp.add(lmMesh(lmBox(len, 0.6, 6), "#d9d3c4", 0, -0.3, 0));
    for (let i = -1; i <= 1; i += 2) grp.add(lmMesh(lmBox(len, 0.9, 0.35), "#f2efe6", 0, 0.45, i * 2.9));
    for (let i = 0; i < 4; i++) { const px = -len / 2 + (i + 0.5) * len / 4; grp.add(lmMesh(lmBox(1.2, 6, 1.2), "#bfb8a8", px, -3, 0)); }
    const pyl = lmMesh(lmBox(1.2, 9, 7.2), "#f2efe6", 0, 4, 0); grp.add(pyl);
    g.scene.add(grp);
  }
}
function lmBuildSea(g) {
  const geo = new T.PlaneGeometry(6000, 6000, 1, 1); geo.rotateX(-Math.PI / 2);
  const m = new T.Mesh(geo, new T.MeshPhongMaterial({ color: 0x2f8fd0, shininess: 70, specular: 0x9fd7ff, transparent: true, opacity: 0.94 }));
  m.position.y = -1.6; m.receiveShadow = true; g.scene.add(m); g.sea = m;
  /* cetek di pesisir: cincin cerah di bawah daratan */
  const sh = new T.Mesh(geo, new T.MeshBasicMaterial({ color: 0x0d4f86 })); sh.position.y = -4.5; g.scene.add(sh);
}
/* pokok berinstans: batang + daun bentuk blok */
function lmBuildTrees(g, avoid) {
  const N = LM.gq ? 1100 : 600, R = lmRand("lm-trees");
  const trunkG = new T.BoxGeometry(0.9, 3, 0.9), leafG = new T.BoxGeometry(3.6, 3.2, 3.6), palmG = new T.ConeGeometry(2.6, 1.6, 6);
  const trunk = new T.InstancedMesh(trunkG, lmMat("#8a5a34"), N), leaf = new T.InstancedMesh(leafG, new T.MeshLambertMaterial({ color: 0xffffff }), N);
  trunk.castShadow = leaf.castShadow = !!LM.gq; leaf.receiveShadow = true;
  const mt = new T.Matrix4(), q = new T.Quaternion(), sc = new T.Vector3(), pos = new T.Vector3(), col = new T.Color();
  const xs = [-1100, 1400], zs = [-560, 520];
  let n = 0, tries = 0;
  while (n < N && tries < N * 30) {
    tries++;
    const x = xs[0] + R() * (xs[1] - xs[0]), z = zs[0] + R() * (zs[1] - zs[0]), k = lmAt(x, z);
    if (!k || k === "jambatan" || k === "wp") continue;
    if (!lmLandW(x + 5, z) || !lmLandW(x - 5, z) || !lmLandW(x, z + 5) || !lmLandW(x, z - 5)) continue;
    if (avoid.some((a) => Math.hypot(a.x - x, a.z - z) < a.r + 4)) continue;
    const s = 0.75 + R() * 0.7, h = 3 * s;
    q.setFromAxisAngle(new T.Vector3(0, 1, 0), R() * 6.28);
    mt.compose(pos.set(x, h / 2, z), q, sc.set(s, s, s)); trunk.setMatrixAt(n, mt);
    mt.compose(pos.set(x, h + 1.4 * s, z), q, sc.set(s, s * (0.8 + R() * 0.5), s)); leaf.setMatrixAt(n, mt);
    col.setHSL(0.27 + R() * 0.08, 0.5 + R() * 0.2, 0.32 + R() * 0.12); leaf.setColorAt(n, col);
    g.trees.push({ x: x, z: z, r: 1.2 * s });
    n++;
  }
  trunk.count = leaf.count = n; trunk.frustumCulled = leaf.frustumCulled = false;
  if (leaf.instanceColor) leaf.instanceColor.needsUpdate = true;
  g.scene.add(trunk); g.scene.add(leaf);
  void palmG;
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
    case "gunung": {
      const big = rnd() < 0.5 ? 1 : 1.25;
      g.add(lmMesh(new T.ConeGeometry(26 * big, 34 * big, 7), "#5f8f4a", 0, 17 * big, 0));
      g.add(lmMesh(new T.ConeGeometry(11 * big, 12 * big, 7), "#8d8d86", 0, 28 * big, 0));
      g.add(lmMesh(new T.ConeGeometry(5 * big, 5 * big, 7), "#f4f6f8", 0, 32 * big, 0)); r = 24 * big; break; }
    case "bukit":
      g.add(lmMesh(new T.ConeGeometry(15, 16, 7), "#6aa84f", 0, 8, 0));
      g.add(lmMesh(lmBox(4, 3, 4), "#c96f4a", 0, 17.5, 0)); g.add(lmMesh(new T.ConeGeometry(3.4, 2.4, 4), "#7a3a2a", 0, 20.2, 0)); r = 14; break;
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
      g.add(lmMesh(lmCyl(14, 14, 0.3, 24), "#f2dfa4", 0, 0.15, 0, { ns: 1 }));
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
function lmAirport(a) {
  const g = new T.Group();
  g.add(lmMesh(lmBox(24, 0.3, 5), "#4a4f57", 0, 0.15, 0, { ns: 1 }));
  for (let i = -10; i <= 10; i += 4) g.add(lmMesh(lmBox(2, 0.32, 0.4), "#f4f4f4", i, 0.17, 0, { ns: 1 }));
  g.add(lmMesh(lmBox(8, 4, 6), "#dfe7ef", -4, 2, -7)); g.add(lmMesh(lmCyl(1, 1.2, 9, 8), "#dfe7ef", 6, 4.5, -7)); g.add(lmMesh(lmBox(3, 2, 3), "#7fb7e8", 6, 9.5, -7));
  const pl = new T.Group(); pl.position.set(-2, 1.4, 0);
  pl.add(lmMesh(lmCyl(0.9, 0.9, 9, 10), "#f6f7f9", 0, 0, 0)); pl.children[0].rotation.z = Math.PI / 2;
  pl.add(lmMesh(lmBox(2, 0.25, 11), "#d7dee6", 0.5, 0, 0)); pl.add(lmMesh(lmBox(1.4, 2.4, 0.25), "#d63b3b", -4, 1.2, 0));
  g.add(pl);
  return g;
}
function lmCoinMesh() {
  if (!GEO.coin) GEO.coin = new T.CylinderGeometry(0.9, 0.9, 0.25, 14);
  const m = new T.Mesh(GEO.coin, new T.MeshLambertMaterial({ color: 0xf5c542, emissive: 0x6b4a00, emissiveIntensity: 0.5 }));
  m.rotation.x = Math.PI / 2; return m;
}
function lmBuildWorld(g) {
  const avoid = [];
  /* Menara Ilmu: susun di sekitar pin negeri */
  const byState = {};
  DATA.topik.forEach((t) => { if (DATA.negeri[t.negeri]) (byState[t.negeri] || (byState[t.negeri] = [])).push(t); });
  for (const k in byState) {
    const pins = DATA.negeri[k].pins && DATA.negeri[k].pins.length ? DATA.negeri[k].pins : [[0, 0]];
    byState[k].forEach((t, i) => {
      const pn = pins[i % pins.length], j = Math.floor(i / pins.length), base = toW(k, pn[0], pn[1]);
      let x = base.x, z = base.z;
      if (j > 0) {
        for (let tr = 0; tr < 10; tr++) { const a = j * 2.4 + tr * 0.7, d = 9 + j * 3 + tr; const nx = base.x + Math.cos(a) * d, nz = base.z + Math.sin(a) * d; if (lmAt(nx, nz) === k) { x = nx; z = nz; break; } }
      }
      const tw = lmTower(t); tw.g.position.set(x, 0, z); g.scene.add(tw.g);
      const lb = lmLabel((t.kod || t.id) + " " + t.nama, { fs: 30, k: 0.03, bd: (TEMA[t.tema] && TEMA[t.tema].warna) || "#5ad1ff" }); lb.position.set(x, 14.5, z); g.scene.add(lb);
      const o = { kind: "tw", id: t.id, t: t, k: k, x: x, z: z, r: 2.4, ir: 7, m: tw, lb: lb };
      g.items.push(o); g.cols.push({ x: x, z: z, r: 2.4, h: 13 }); avoid.push({ x: x, z: z, r: 6 });
      lmTowerState(o);
    });
  }
  /* tempat pelancongan */
  PLACES.forEach((p) => {
    const [id, k, nama, type, sx, sy, fakta] = p; if (!DATA.negeri[k]) return;
    let w = toW(k, sx, sy);
    if (id === "pg-jambatan" && RAST.bridge) { const b = RAST.bridge; w = toW(k, (b[0] + b[2]) / 2 + 2.2, (b[1] + b[3]) / 2 + 2.6); }
    const R = lmRand(id), md = lmModel(type, R), rot = R() * 6.28;
    md.g.position.set(w.x, 0, w.z); md.g.rotation.y = rot; g.scene.add(md.g);
    const pl = { kind: "pl", id: id, k: k, n: nama, type: type, fakta: fakta, x: w.x, z: w.z, r: md.r, ir: Math.max(md.r, 6) + 9, m: md.g, names: [] };
    /* papan kenangan di hadapan mercu tanda */
    const bd = lmBoard(pl), bdist = Math.max(md.r, 8) + 5;
    let ba = rot + Math.PI / 2;
    for (let i = 0; i < 16; i++) {
      const a = rot + Math.PI / 2 + i * 0.393, bx = w.x + Math.sin(a) * bdist, bz = w.z + Math.cos(a) * bdist;
      if (lmLandW(bx, bz) && lmLandW(bx + Math.sin(a) * 6, bz + Math.cos(a) * 6) && !g.cols.some((c) => Math.hypot(c.x - bx, c.z - bz) < c.r + 3)) { ba = a; break; }
    }
    bd.position.set(w.x + Math.sin(ba) * bdist, 0, w.z + Math.cos(ba) * bdist); bd.rotation.y = ba; g.scene.add(bd);
    pl.bx = bd.position.x; pl.bz = bd.position.z;
    const lb = lmLabel(nama, { fs: 30, k: 0.032, bg: "rgba(60,30,8,.78)", bd: "#f5c542" }); lb.position.set(w.x, Math.max(14, md.r * 1.4 + 8), w.z); g.scene.add(lb); pl.lb = lb;
    g.items.push(pl);
    if (md.r > 0) { md.g.updateMatrixWorld(true); const bb = new T.Box3().setFromObject(md.g); g.cols.push({ x: w.x, z: w.z, r: md.r * 0.85, h: bb.max.y + 1 }); }
    g.cols.push({ x: bd.position.x, z: bd.position.z, r: 1.2, h: 8 });
    avoid.push({ x: w.x, z: w.z, r: Math.max(md.r, 14) }, { x: pl.bx, z: pl.bz, r: 6 });
    lmBoardRefresh(pl);
  });
  /* lapangan terbang */
  AIRPORTS.forEach((a) => {
    const [id, k, nama, sx, sy] = a; if (!DATA.negeri[k]) return;
    const w = toW(k, sx, sy), m = lmAirport(a); m.position.set(w.x, 0, w.z); g.scene.add(m);
    const lb = lmLabel("✈ " + nama, { fs: 28, k: 0.03, bg: "rgba(10,40,80,.8)", bd: "#7fb7e8" }); lb.position.set(w.x, 12, w.z); g.scene.add(lb);
    g.items.push({ kind: "ap", id: id, k: k, n: nama, x: w.x, z: w.z, r: 0, ir: 13, lb: lb });
    avoid.push({ x: w.x, z: w.z, r: 16 });
  });
  lmBuildTrees(g, avoid);
  /* syiling harian bertaburan (deterministik mengikut hari) */
  const R = lmRand("lm-coin-" + dayKey()), got = new Set(LM.st.cd.got);
  let n = 0, tries = 0;
  while (n < 70 && tries < 3000) {
    tries++; const x = -1100 + R() * 2500, z = -560 + R() * 1080; if (!lmAt(x, z) || lmAt(x, z) === "jambatan") continue;
    if (avoid.some((a) => Math.hypot(a.x - x, a.z - z) < a.r)) continue;
    const id = "c" + n; n++; if (got.has(id)) continue;
    const m = lmCoinMesh(); m.position.set(x, 1.6, z); g.scene.add(m); g.coins.push({ id: id, x: x, z: z, m: m });
  }
}
function lmTowerState(o) {
  const best = LM.st.tw[o.id] | 0, done = best >= 3;
  o.m.flag.material = lmMat(done ? "#f5c542" : "#9aa3ad");
  o.done = done;
}

/* ---------- avatar blok (ikut pakaian Gudang avatar 2D: menutup aurat, wajah tanpa ciri) ---------- */
function lmMyCode() {
  try {
    const z = zvState(), e = zvEqAll(z);
    return [z.g === "P" ? "P" : "L", clamp(z.sk | 0, 0, 5), e.ou, e.oc, e.hd, e.hc].join("|");
  } catch (e) { return "L|1|ou_sc|oc_gn|hd_no|hc_w"; }
}
function lmParse(code) {
  const a = String(code || "").split("|"), ok = (id, s) => { const it = typeof zvItem === "function" ? zvItem(id) : null; return it && it.s === s ? id : ""; };
  const g = a[0] === "P" ? "P" : "L";
  return { g: g, sk: clamp(+a[1] | 0, 0, 5), ou: ok(a[2], "ou") || "ou_sc", oc: ok(a[3], "oc") || "oc_gn", hd: ok(a[4], "hd") || (g === "P" ? "hd_td" : "hd_no"), hc: ok(a[5], "hc") || "hc_w" };
}
function lmAvatar(code, name, me) {
  const c = lmParse(code), sk = ZV_SKIN[c.sk] || "#e9b98f", oc = zvCol(ZV_OCOL, c.oc), hc = zvCol(ZV_HCOL, c.hc);
  const sch = c.ou === "ou_sc", long = c.ou === "ou_kr" || c.ou === "ou_jb" || (sch && c.g === "P");
  const top = sch ? "#f4f4f0" : oc, bot = sch ? "#27345a" : (c.ou === "ou_tk" ? zvShade(oc, -0.28) : oc), shoe = c.ou === "ou_tk" ? "#f1f1f1" : "#2a2a33";
  const g = new T.Group(), body = new T.Group(); g.add(body);
  const pv = (x, y) => { const p = new T.Group(); p.position.set(x, y, 0); body.add(p); return p; };
  const lL = pv(-0.5, 2.05), lR = pv(0.5, 2.05), aL = pv(-1.42, 3.9), aR = pv(1.42, 3.9);
  for (const [p] of [[lL], [lR]]) { p.add(lmMesh(lmBox(0.92, 1.7, 0.92), bot, 0, -0.85, 0)); p.add(lmMesh(lmBox(0.96, 0.4, 1.1), shoe, 0, -1.85, 0.08)); }
  for (const [p] of [[aL], [aR]]) { p.add(lmMesh(lmBox(0.86, 1.75, 0.86), top, 0, -0.85, 0)); p.add(lmMesh(lmBox(0.8, 0.36, 0.8), sk, 0, -1.9, 0)); }
  body.add(lmMesh(lmBox(1.98, 2, 1), top, 0, 3.05, 0));
  if (sch && c.g === "L") body.add(lmMesh(lmBox(0.32, 1.3, 0.05), "#27345a", 0, 3.25, 0.53));
  if (long) { body.add(lmMesh(lmBox(2.1, 1.75, 1.15), long && sch ? bot : oc, 0, 1.25, 0)); }
  if (c.ou === "ou_sm") body.add(lmMesh(lmBox(2.06, 0.9, 1.08), "#7a3b2e", 0, 2.25, 0));
  const head = new T.Group(); head.position.y = 4.65; body.add(head);
  head.add(lmMesh(lmBox(1.2, 1.2, 1.2), sk, 0, 0, 0));
  const hd = c.hd;
  if (hd === "hd_td" || hd === "hd_sw" || hd === "hd_tl" || hd === "hd_ts") {
    head.add(lmMesh(lmBox(1.36, 1.36, 1.3), hc, 0, 0.06, -0.08));
    head.add(lmMesh(lmBox(0.9, 0.86, 0.06), sk, 0, -0.06, 0.6));
    const drape = hd === "hd_tl" ? 1.25 : 0.65;
    body.add(lmMesh(lmBox(2.1, drape, 1.14), hc, 0, 4.1 - drape / 2 + 0.02, 0));
  } else if (hd === "hd_sk") head.add(lmMesh(lmBox(1.24, 0.5, 1.24), "#1d1d22", 0, 0.82, 0));
  else if (hd === "hd_kp") head.add(lmMesh(lmBox(1.24, 0.32, 1.24), hc, 0, 0.74, 0));
  else if (hd === "hd_sb") { head.add(lmMesh(lmBox(1.4, 0.62, 1.4), "#f4f4f0", 0, 0.82, 0)); }
  else if (hd === "hd_tp") { head.add(lmMesh(lmBox(1.26, 0.4, 1.26), hc, 0, 0.78, 0)); head.add(lmMesh(lmBox(1.2, 0.12, 0.7), hc, 0, 0.62, 0.9)); }
  const tag = lmLabel(cleanName(name) || "Pemain", { fs: 32, k: 0.028, bd: me ? "#f5c542" : null, dt: false });
  tag.position.y = 6.6; g.add(tag);
  return { g: g, body: body, lL: lL, lR: lR, aL: aL, aR: aR, tag: tag, code: code, ph: Math.random() * 6 };
}
function lmAnim(av, moving, air, dt, speed) {
  av.ph += dt * (moving ? 9 * (speed || 1) : 2);
  const s = air ? 0.9 : moving ? Math.sin(av.ph) * 0.75 : 0;
  av.lL.rotation.x = air ? -0.5 : s; av.lR.rotation.x = air ? 0.4 : -s;
  av.aL.rotation.x = air ? -2.4 : -s * 0.9; av.aR.rotation.x = air ? -2.4 : s * 0.9;
  av.body.position.y = moving && !air ? Math.abs(Math.cos(av.ph)) * 0.15 : 0;
}
function lmBubble(av, text) {
  if (av.bub) { av.g.remove(av.bub); av.bub = null; }
  if (!text) return;
  av.bub = lmLabel(text, { fs: 30, k: 0.03, bg: "rgba(255,255,255,.95)", fg: "#1b2a3a", dt: false }); av.bub.position.y = 8.2; av.g.add(av.bub); av.bubT = 3;
}

/* ---------- pergerakan pemain, perlanggaran dan kamera ---------- */
function lmCanStand(x, z) { return lmLandW(x, z); }
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
  if (lmCanStand(nx, nz)) { p.x = nx; p.z = nz; }
  if (il > 0.1) { let da = Math.atan2(p.vx, p.vz) - p.yaw; while (da > Math.PI) da -= 6.2832; while (da < -Math.PI) da += 6.2832; p.yaw += da * Math.min(1, dt * 12); }
  /* lompat dan graviti */
  if ((k[" "] || LM.jump) && p.on && !g.ui) { p.vy = 15; p.on = false; LM.jump = false; lmSnd("jump"); }
  p.vy -= 38 * dt; p.y += p.vy * dt;
  if (p.y <= 0) { p.y = 0; p.vy = 0; p.on = true; }
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
  g.camera.lookAt(tx, ty, tz);
  if (g.sun) { g.sun.position.set(p.x + 60, 120, p.z + 40); g.sun.target.position.set(p.x, 0, p.z); g.sun.target.updateMatrixWorld(); }
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
  const g = LM.g; if (g) for (const id in LM.peers) g.scene.remove(LM.peers[id].av.g);
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
    e.av.g.position.set(e.x, e.y, e.z); e.av.g.rotation.y = e.r; lmAnim(e.av, e.m, e.a, dt, 1);
    if (e.av.bub && (e.av.bubT -= dt) <= 0) lmBubble(e.av, "");
  }
  const r = LM.room; if (!r) return;
  const p = g.p;
  if (ts - LM.sent > 200) {
    LM.sent = ts;
    const o = { x: +p.x.toFixed(1), y: +p.y.toFixed(1), z: +p.z.toFixed(1), r: +p.yaw.toFixed(2), m: p.moving ? 1 : 0, a: p.on ? 0 : 1, n: cleanName(P.nama) || "Pelajar", c: g.myCode, st: lmStamps() };
    const sig = [o.x, o.y, o.z, o.r, o.m, o.a, o.st].join(",");
    if (sig !== LM.lastSig) { LM.lastSig = sig; try { const x = r.presence(o); if (x && x.catch) x.catch(() => {}); } catch (e) { /* abaikan */ } }
  }
  if (ts - LM.pollT > 220) {
    LM.pollT = ts; let a = []; try { a = r.peers(); } catch (e) { a = []; }
    const seen = {}; let n = 0;
    for (const pr of a) {
      if (pr.isMe || !pr.presence || typeof pr.presence !== "object" || n >= 30) continue;
      const v = pr.presence; if (typeof v.x !== "number" || typeof v.z !== "number") continue;
      n++; seen[pr.peer] = 1;
      const x = clamp(v.x, -1600, 1800), y = clamp(+v.y || 0, 0, 40), z = clamp(v.z, -800, 800), nm = cleanName(String(v.n || "")) || "Pelajar";
      let e = LM.peers[pr.peer];
      if (e && (e.c !== v.c || e.n !== nm)) { g.scene.remove(e.av.g); e = null; }
      if (!e) { const av = lmAvatar(v.c, nm, false); g.scene.add(av.g); e = LM.peers[pr.peer] = { x: x, y: y, z: z, r: +v.r || 0, av: av, c: v.c, n: nm, en: v.en | 0 }; } /* emote lama sebelum kita masuk tidak dipaparkan */
      e.tx = x; e.ty = y; e.tz = z; e.tr = +v.r || 0; e.m = !!v.m; e.a = !!v.a; e.st = clamp(v.st | 0, 0, 999);
      if (typeof v.e === "string" && EMOTE[v.e] && (v.en | 0) !== e.en) { lmBubble(e.av, EMOTE[v.e]); e.en = v.en | 0; }
    }
    for (const id in LM.peers) if (!seen[id]) { g.scene.remove(LM.peers[id].av.g); delete LM.peers[id]; }
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
  if (!r) { r = el("div", { id: "lmOv", role: "dialog", "aria-modal": "true", "aria-label": "Dunia Gempur Malaysia" }); document.body.appendChild(r); }
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
  const t = TOPIK[LM.tid], ng = t && DATA.negeri[t.negeri];
  b.append(el("div", { class: "lm-kick" }, "Dunia Gempur · " + SUBJS[SUBJ].nama), el("h2", null, "Dunia Gempur Malaysia"));
  b.append(el("p", null, "Jelajah peta Malaysia 3D bersama rakan. Pergi ke setiap negeri, jawab kuiz di Menara Ilmu mengikut tajuk negeri itu, ziarahi tempat pelancongan dan gantung nama anda pada Papan Kenangan."));
  b.append(el("p", { class: "lm-ex" }, (ng ? "Anda bermula di " + ng.pendek + (t ? " (" + (t.kod || t.id) + " " + t.nama + ")" : "") + ". " : "") + "Kawalan: W A S D atau anak panah untuk bergerak, Shift lari, Space lompat, E berinteraksi, M peta, P pasport, seret tetikus untuk pusing kamera. Di telefon: kayu bedik kiri dan butang kanan."));
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
  const klasik = lmBtn("Dunia Gempur klasik (Obby)", "", () => { const tid = LM.tid; lmClose(); dgOpen(tid); });
  const x = lmBtn("Tutup", "", lmClose);
  b.append(el("div", { class: "lm-row" }, gq, klasik, x));
  const st = lmSummary();
  b.append(el("p", { class: "lm-ex" }, "Pasport anda: " + st.pl + "/" + st.plN + " tempat diziarahi, " + st.tw + "/" + st.twN + " Menara Ilmu ditawan."));
  if (!TOUCH) solo.focus();
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
      lmSave(); lmTowerState(o);
      const fr = lmFriendsNear(LM.g, 25), xp = lmXp(ok * 3 + (first ? 10 : 0));
      if (pass && fr) { try { gdCoin(2); } catch (e) { /* abaikan */ } }
      if (pass) { lmSnd("win"); lmPop(first ? "Menara ditawan!" : "Tahniah!"); lmStateCheck(o.k); }
      lmCard((b) => {
        b.append(el("div", { class: "lm-kick" }, pass ? "Menara ditawan" : "Cuba lagi"), el("h2", null, ok + "/" + tot + " betul"));
        b.append(el("p", null, pass ? "Bendera menara " + (t.kod || t.id) + " kini berwarna emas." : "Betul sekurang-kurangnya 3 untuk menawan menara. Baca nota dan cuba lagi."));
        b.append(el("p", { class: "lm-ex" }, "XP +" + xp + (xp === 0 ? " (kuota XP harian Dunia Gempur Malaysia telah penuh)" : "") + (pass && fr ? " · Bonus rakan: +2 syiling kerana " + fr + " rakan berada berdekatan." : "")));
        b.append(el("div", { class: "lm-row" }, lmBtn("Teruskan jelajah", "pri", lmCardClose), pass ? null : lmBtn("Cuba lagi", "", () => lmTowerOpen(o))));
      });
    }
  });
}
function lmStateCheck(k) {
  const g = LM.g; if (!g) return;
  const tws = g.items.filter((x) => x.kind === "tw" && x.k === k);
  if (tws.length && tws.every((x) => x.done)) {
    const m = g.landM[k]; if (m && m.material[0]) { m.material[0].emissive = new T.Color(0x6b5200); m.material[0].emissiveIntensity = 0.35; }
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
        b.append(el("p", { class: "lm-ex" }, "XP +" + xp + (xp === 0 && ok ? " (kuota XP harian Dunia Gempur Malaysia telah penuh)" : "")));
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
    b.append(el("div", { class: "lm-kick" }, "Lapangan terbang"), el("h2", null, ap.n), el("p", null, "Pilih destinasi. Jawab satu soalan pas masuk dengan betul untuk terbang."));
    const grid = el("div", { class: "lm-grid" });
    g.items.filter((x) => x.kind === "ap" && x.id !== ap.id).forEach((d) => {
      grid.appendChild(lmBtn("✈ " + d.n + " (" + DATA.negeri[d.k].pendek + ")", "", () => {
        const tids = DATA.topik.filter((t) => t.negeri === d.k).map((t) => t.id);
        lmQuiz({ kick: "Pas masuk", title: "Ke " + d.n, pass: 1, qs: lmPickQs(tids, 1), onDone: (pass) => {
          if (!pass) { lmCard((b2) => { b2.append(el("h2", null, "Pas masuk ditolak"), el("p", null, "Jawapan belum tepat. Cuba lagi.")); b2.append(el("div", { class: "lm-row" }, lmBtn("Cuba lagi", "pri", () => lmAirportOpen(ap)), lmBtn("Tutup", "", lmCardClose))); }); return; }
          lmCardClose(); lmTeleport(d.x + 14, d.z + 8, "Selamat datang ke " + DATA.negeri[d.k].pendek + "!");
        } });
      }));
    });
    b.append(grid, el("div", { class: "lm-row" }, lmBtn("Tutup", "", lmCardClose)));
  });
}
function lmTeleport(x, z, msg) {
  const f = LM.ui.fade; f.style.opacity = "1";
  setTimeout(() => {
    const g = LM.g; if (!g) return; g.p.x = x; g.p.z = z; g.p.y = 0; g.p.vx = g.p.vz = 0;
    g.camera.position.set(x, 30, z + 30); f.style.opacity = "0"; if (msg) lmPop(msg);
  }, 380);
}
/* pasport ziarah */
function lmPassport() {
  lmCard((b) => {
    const s = lmSummary();
    b.append(el("div", { class: "lm-kick" }, "Pasport Ziarah · " + (cleanName(P.nama) || "Pelajar")), el("h2", null, s.pl + "/" + s.plN + " cop · " + s.tw + "/" + s.twN + " menara"));
    if (s.pl >= s.plN) b.append(el("p", null, "Gelaran: Pengembara Dunia Gempur Malaysia! Anda telah menziarahi semua tempat."));
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
    b.append(grid, el("div", { class: "lm-row" }, lmBtn("Tutup", "pri", lmCardClose)));
  });
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
    x.fillStyle = "#cde3f3"; x.font = "700 30px Nunito, sans-serif"; x.fillText("Dunia Gempur Malaysia · " + new Date().toLocaleDateString("ms-MY"), 36, H - 38);
    lmCard((b) => {
      b.append(el("div", { class: "lm-kick" }, "Swafoto"), el("h2", null, pl ? pl.n : "Kenangan jelajah"));
      const im = el("img", { src: c.toDataURL("image/jpeg", 0.88), alt: "Swafoto Dunia Gempur Malaysia", style: "width:100%;border-radius:12px;margin:8px 0" }); b.appendChild(im);
      const a = el("a", { href: im.src, download: "swafoto-dunia-gempur.jpg", style: "display:none" }); b.appendChild(a);
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

/* ---------- peta mini dan peta besar ---------- */
const MX0 = 60, MY0 = 55, MW = 620, MH = 250;
function lmMapBase(w, h) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const x = c.getContext("2d"), s = Math.min(w / MW, h / MH), ox = (w - MW * s) / 2, oy = (h - MH * s) / 2;
  x.fillStyle = "#0d4f86"; x.fillRect(0, 0, w, h);
  for (const k of RAST.keys) {
    x.setTransform(s, 0, 0, s, ox + (-MX0 + (BORNEO[k] ? BX : 0)) * s, oy - MY0 * s);
    x.fillStyle = STATE_COL[k] || "#8fd16a"; x.strokeStyle = "rgba(30,60,20,.6)"; x.lineWidth = 0.6;
    x.fill(RAST.paths[k]); x.stroke(RAST.paths[k]);
  }
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
  }
  if (big) {
    x.font = "800 12px Nunito, sans-serif"; x.fillStyle = "rgba(10,30,20,.85)"; x.textAlign = "center";
    for (const k of RAST.keys) { const pn = DATA.negeri[k].pins && DATA.negeri[k].pins[0]; if (!pn) continue; const w = toW(k, pn[0], pn[1]), [px, py] = lmMapPt(m, w.x, w.z); x.fillText(DATA.negeri[k].pendek, px, py - 12); }
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
  const cv = el("canvas", { class: "lm-cv", "aria-label": "Dunia Gempur Malaysia, paparan 3D" }); r.appendChild(cv); LM.cv = cv;
  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas: cv, antialias: !!gq, powerPreference: "high-performance" }); } catch (e) { return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, gq ? 1.75 : 1.25));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  if (gq && renderer.shadowMap) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; }
  const scene = new T.Scene(), sky = new T.Color(0x8fd0ff);
  scene.background = sky.clone(); scene.fog = new T.Fog(sky.clone(), 260, 950);
  const camera = new T.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.5, 1600);
  const hemi = new T.HemisphereLight(0xdff2ff, 0x5d7a3a, 0.75); scene.add(hemi);
  const sun = new T.DirectionalLight(0xfff1d6, 0.85);
  if (gq) { sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = sc.bottom = -90; sc.right = sc.top = 90; sc.near = 10; sc.far = 320; sun.shadow.bias = -0.0006; }
  scene.add(sun); scene.add(sun.target);
  /* awan blok */
  const clouds = new T.Group(), cm = new T.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.92 }), R = lmRand("lm-cloud");
  for (let i = 0; i < 46; i++) { const c = new T.Group(); for (let j = 0; j < 3; j++) { const b = new T.Mesh(lmBox(14 + R() * 10, 5, 9 + R() * 6), cm); b.position.set(j * 9 - 9, R() * 2, R() * 4); c.add(b); } c.position.set(-1300 + R() * 2900, 80 + R() * 40, -650 + R() * 1250); clouds.add(c); }
  scene.add(clouds);
  const g = { renderer: renderer, scene: scene, camera: camera, sun: sun, hemi: hemi, sky: sky, clouds: clouds, items: [], cols: [], trees: [], coins: [], landM: {},
    p: { x: 0, y: 0, z: 0, vx: 0, vz: 0, vy: 0, yaw: 0, on: true, moving: false }, cam: { yaw: 0.4, pitch: 0.42, dist: 18 }, T: 0, ui: false, near: null, nearT: 0, cullT: 0, mmT: 0, hudT: 0, saveT: 0 };
  LM.g = g;
  lmBuildLand(g); lmBuildSea(g); lmBuildWorld(g);
  g.myCode = lmMyCode(); g.me = lmAvatar(g.myCode, P.nama, true); scene.add(g.me.g);
  return g;
}
function lmSpawn(g) {
  const tw = g.items.find((x) => x.kind === "tw" && x.id === LM.tid) || g.items.find((x) => x.kind === "ap" && x.id === "ap-klia") || g.items[0];
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
  top.append(lmBtn("Pasport (P)", "", lmPassport), lmBtn("Bilik", "", lmRoomPanel), lmBtn("Swafoto", "", () => lmSelfie(null)),
    ui.snd = lmBtn(LM.mute ? "Bunyi: tutup" : "Bunyi: buka", "", () => { LM.mute = !LM.mute; ui.snd.textContent = LM.mute ? "Bunyi: tutup" : "Bunyi: buka"; }),
    lmBtn("Keluar", "", () => { if (confirm("Keluar dari Dunia Gempur Malaysia? Cop pasport dan menara yang ditawan sudah disimpan.")) lmClose(); }));
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
  const nm = k === "jambatan" ? "Jambatan Pulau Pinang" : (DATA.negeri[k] ? DATA.negeri[k].nama : "Laut");
  if (ui.state.textContent !== nm) { ui.state.textContent = nm; if (DATA.negeri[k] && g.lastK && g.lastK !== k) lmPop(DATA.negeri[k].pendek); }
  if (DATA.negeri[k]) g.lastK = k;
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
  const txt = best.kind === "tw" ? key + "Menara Ilmu " + (best.t.kod || best.t.id) + (best.done ? " ✔" : "") : best.kind === "pl" ? key + "Ziarah " + best.n + (LM.st.pl[best.id] ? " ✔" : "") : key + "Terbang dari " + best.n;
  if (pr.textContent !== txt) pr.textContent = txt;
  pr.hidden = false;
}
function lmInteract() {
  const g = LM.g; if (!g || g.ui || !g.near) return;
  lmSnd("open");
  const it = g.near;
  if (it.kind === "tw") lmTowerOpen(it); else if (it.kind === "pl") lmPlaceOpen(it); else if (it.kind === "ap") lmAirportOpen(it);
}
/* ---------- input ---------- */
function lmKey(e) {
  if (!LM.on || !LM.g) return;
  const t = e.target; if (t && (t.nodeName === "INPUT" || t.nodeName === "TEXTAREA")) return;
  const k = String(e.key || "").toLowerCase(), dn = e.type === "keydown", g = LM.g;
  if (dn && k === "escape") { e.preventDefault(); if (LM.ui.big) lmBigMap(); else if (LM.ui.card) lmCardClose(); else if (confirm("Keluar dari Dunia Gempur Malaysia?")) lmClose(); return; }
  if (g.ui) return;
  if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].indexOf(k) >= 0) e.preventDefault();
  LM.keys[k] = dn;
  if (!dn) return;
  if (k === "e" || k === "enter") lmInteract();
  else if (k === "m") lmBigMap();
  else if (k === "p") lmPassport();
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
  const night = new T.Color(0x24406e), dusk = new T.Color(0xf3a86b), noon = new T.Color(0x8fd0ff);
  const c = day > 0.5 ? dusk.clone().lerp(noon, (day - 0.5) * 2) : night.clone().lerp(dusk, day * 2);
  g.scene.background.copy(c); g.scene.fog.color.copy(c);
  g.sun.intensity = 0.25 + 0.65 * day; g.hemi.intensity = 0.45 + 0.35 * day;
}
function lmLoop(ts) {
  if (!LM.on || !LM.g) return;
  LM.raf = requestAnimationFrame(lmLoop);
  const g = LM.g, dt = clamp((ts - (g.last || ts)) / 1000, 0, 0.05); g.last = ts; g.T += dt;
  try {
    lmUpdatePlayer(g, dt); lmUpdateCam(g, dt); lmNet(g, dt, ts);
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
      if (Math.abs(c.x - g.p.x) < 2.6 && Math.abs(c.z - g.p.z) < 2.6 && g.p.y < 3) {
        g.scene.remove(c.m); g.coins.splice(i, 1); LM.st.cd.got.push(c.id); g.saveT = 1;
        let n = 0; try { n = gdCoin(1); } catch (e) { n = 0; } lmSnd("coin"); lmPop(n ? "+" + n + " syiling" : "Had syiling hari ini penuh");
      }
    }
    if (g.saveT && (g.saveT -= dt) <= 0) { g.saveT = 0; lmSave(); }
    for (const c of g.clouds.children) { c.position.x += dt * 3; if (c.position.x > 1600) c.position.x = -1300; }
    if (g.sea) g.sea.position.y = -1.6 + Math.sin(g.T * 0.8) * 0.15;
    g.renderer.render(g.scene, g.camera);
  } catch (e) { LM.err = String(e && e.stack || e); if (!LM.errShown) { LM.errShown = true; console.error(e); } }
}
/* ---------- buka, mula, tutup ---------- */
function lmOpen(tid) {
  if (!T) { toast("Grafik 3D tidak tersedia pada peranti ini. Membuka Dunia Gempur klasik.", "warn"); dgOpen(tid); return; }
  LM.tid = tid || ""; LM.on = false; lmLoad(); lmRaster();
  document.body.classList.add("ar-lock");
  lmSetup();
}
function lmStart(code, kind) {
  const r = LM.root;
  lmCardClose(); r.textContent = "";
  const ld = el("div", { class: "lm-card" }, el("div", { class: "lm-box" }, el("div", { class: "lm-kick" }, "Dunia Gempur Malaysia"), el("h2", null, "Membina peta Malaysia..."), el("p", null, "Menyusun negeri, menara ilmu dan tempat pelancongan.")));
  r.appendChild(ld);
  setTimeout(async () => {
    const g = lmBuildScene();
    if (!g) { ld.remove(); toast("WebGL tidak dapat dimulakan. Membuka Dunia Gempur klasik.", "warn"); const tid = LM.tid; lmClose(); dgOpen(tid); return; }
    ld.remove(); LM.daily = lmDaily(); lmHud(); lmSpawn(g); lmPointers(LM.cv); lmWpSet();
    LM.on = true; g.last = 0;
    window.addEventListener("keydown", lmKey, true); window.addEventListener("keyup", lmKey, true); window.addEventListener("resize", lmResize);
    LM.raf = requestAnimationFrame(lmLoop);
    if (code) { const ok = await lmNetJoin(code, kind); if (ok) lmPop(kind === "sekolah" ? "Masuk bilik sekolah" : "Bilik " + code); }
    lmPop("Selamat datang ke Malaysia!");
  }, 30);
}
function lmClose() {
  LM.on = false; cancelAnimationFrame(LM.raf); lmNetLeave();
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
LM._t = { lmAt: lmAt, toW: toW, PLACES: PLACES, AIRPORTS: AIRPORTS, lmInteract: lmInteract, lmPickQs: lmPickQs };
})();
