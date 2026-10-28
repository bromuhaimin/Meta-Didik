/* =====================================================================
   META DIDIK (v17.88, dinamakan semula v17.89): dunia terbuka gaya blok di atas peta Malaysia.
   Murid berjalan ke setiap negeri, menjawab kuiz di Menara Ilmu (ikut tajuk negeri itu),
   menziarahi tempat pelancongan, menggantung nama pada Papan Kenangan dan bermain bersama rakan.
   Fail ini dimuat hanya apabila butang Dunia Ilmu ditekan (lmOpen dalam index.html). Bergantung pada
   pemboleh ubah global index.html: THREE, DATA, TOPIK, BYTOPIK, QLIST, P, Net, SUBJ, SUBJS dan utiliti.
   ===================================================================== */
(function () {
"use strict";
const T = window.THREE;
/* v18.5: dunia mengikut unjuran geografi sebenar (meta-geo.json): 3 unit dunia = 1 km.
   Sempadan negeri daripada geoBoundaries (ADM1), ketinggian daripada SRTM (jubin Terrarium). */
const SC = 6;            /* tinggalan: skala lama bagi saiz objek */
const K = SC / 4;        /* faktor saiz objek berbanding peta asal */
/* v18.9: WS = faktor pembesaran dunia berbanding data meta-geo.json (3 unit/km): 2 -> 6 unit = 1 km,
   supaya bangunan (saiz tetap) lebih jarang, terutamanya di Lembah Klang */
const WS = 2;
const WB = { x0: -3400 * WS, z0: -1250 * WS, w: 6800 * WS, h: 2450 * WS }; /* sempadan dunia (unit) */
let GEOD = null;
const ll = (lat, lon) => lmWarp((lon - GEOD.lon0) * GEOD.kx * GEOD.U, (GEOD.lat0 - lat) * GEOD.kz * GEOD.U);
/* zum setempat Lembah Klang (v18.15: profil kanta): pembesaran jejarian m(r) = 1 + A.exp(-(r/s)^2) - B.w(r).
   Pusat KL kira-kira 4.5 kali ganda (1 + A) supaya stesen MRT/LRT, universiti dan mercu tanda tidak berhimpit;
   pemampatan B.w(r) diagihkan sekata dalam gelang luar (2s hingga R) supaya D(R) = R dan peta di luar R tidak berubah.
   Sempadan, pantai dan DEM ikut sama (lmUnwarp ialah songsangan melalui jadual). */
const KV = { la: 3.135, lo: 101.675, R: 180 * 3 * WS, A: 3.5, s: 13 * 3 * WS, c: null, t: null };
function lmKvC() { if (!KV.c) KV.c = { x: (KV.lo - GEOD.lon0) * GEOD.kx * GEOD.U, z: (GEOD.lat0 - KV.la) * GEOD.kz * GEOD.U }; return KV.c; }
function lmKvT() {
  if (KV.t) return KV.t;
  const N = 4096, R = KV.R, dr = R / N, r1 = 2 * KV.s, sp = R - r1;
  const gs = (r) => KV.A * Math.exp(-(r / KV.s) * (r / KV.s));
  const w = (r) => { if (r <= r1) return 0; const u = (r - r1) / sp, e = 0.2, sm = (t) => t * t * (3 - 2 * t); return u < e ? sm(u / e) : u > 1 - e ? sm((1 - u) / e) : 1; };
  let ex = 0, W = 0; for (let i = 0; i < N; i++) { const r = (i + 0.5) * dr; ex += gs(r) * dr; W += w(r) * dr; }
  const B = ex / W, D = new Float64Array(N + 1); /* D[i] = jarak selepas zum bagi jarak asal i.dr */
  for (let i = 0; i < N; i++) { const r = (i + 0.5) * dr; D[i + 1] = D[i] + (1 + gs(r) - B * w(r)) * dr; }
  const k = R / D[N]; for (let i = 0; i <= N; i++) D[i] *= k; /* betulkan ralat kamiran supaya D(R) = R tepat */
  return (KV.t = { D: D, dr: dr, N: N, B: B });
}
function lmWarp(x, z) {
  const c = lmKvC(), dx = x - c.x, dz = z - c.z, d = Math.hypot(dx, dz);
  if (d >= KV.R || d < 1e-6) return { x: x, z: z };
  const T0 = lmKvT(), f = d / T0.dr, i = Math.min(T0.N - 1, f | 0), u = f - i, D = T0.D[i] + (T0.D[i + 1] - T0.D[i]) * u, k = D / d;
  return { x: c.x + dx * k, z: c.z + dz * k };
}
function lmUnwarp(x, z) {
  const c = lmKvC(), dx = x - c.x, dz = z - c.z, Dd = Math.hypot(dx, dz);
  if (Dd >= KV.R || Dd < 1e-6) return { x: x, z: z };
  const T0 = lmKvT(), A = T0.D; let lo = 0, hi = T0.N;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (A[m] <= Dd) lo = m; else hi = m; }
  const d = (lo + (Dd - A[lo]) / Math.max(1e-9, A[hi] - A[lo])) * T0.dr, k = d / Dd;
  return { x: c.x + dx * k, z: c.z + dz * k };
}
const XP_CAP = 80, XP_KEY = "gt-lm-xp";
const EMOTE = { salam: "Assalamualaikum!", hebat: "Hebat!", jom: "Jom ikut saya!", tahniah: "Tahniah!" };

/* [id, negeri, nama, jenis model, x, y (SVG), fakta] */
/* tempat pelancongan: [id, negeri, nama, jenis, lat, lon, fakta] (koordinat sebenar, v18.5) */
const PLACES = [
  ["pl-kelam", "perlis", "Gua Kelam", "gua", 6.645, 100.205, "Gua Kelam ialah gua batu kapur sepanjang kira-kira 370 meter dengan titian kayu di dalamnya. Dahulu ia laluan pelombong bijih timah."],
  ["pl-wangkelian", "perlis", "Wang Kelian", "bukit", 6.68, 100.187, "Wang Kelian terletak di sempadan Malaysia-Thailand dan terkenal dengan pasar sempadan serta pemandangan bukit batu kapur."],
  ["kd-jerai", "kedah", "Gunung Jerai", "gunung", 5.787, 100.433, "Gunung Jerai (1,217 m) menjadi panduan pelayar sejak zaman dahulu dan terletak berhampiran tapak arkeologi Lembah Bujang."],
  ["kd-bujang", "kedah", "Lembah Bujang", "candi", 5.738, 100.417, "Lembah Bujang ialah tapak arkeologi tertua di Asia Tenggara yang pernah menjadi pelabuhan perdagangan penting."],
  ["kd-zahir", "kedah", "Masjid Zahir", "masjid", 6.1215, 100.3672, "Masjid Zahir di Alor Setar dibina pada tahun 1912 dan antara masjid tercantik di Malaysia."],
  ["pg-jambatan", "penang", "Jambatan Pulau Pinang", "jambatan", 5.356, 100.342, "Jambatan Pulau Pinang sepanjang 13.5 km menghubungkan pulau dengan Seberang Perai sejak 1985."],
  ["pg-kapitan", "penang", "Masjid Kapitan Keling", "masjid", 5.4167, 100.3378, "Masjid Kapitan Keling di George Town dibina pada abad ke-19 oleh komuniti Muslim India."],
  ["pg-bendera", "penang", "Bukit Bendera", "bukit", 5.4243, 100.269, "Bukit Bendera (833 m) boleh dinaiki dengan kereta api funikular dan menawarkan pemandangan George Town."],
  ["pk-ubudiah", "perak", "Masjid Ubudiah", "masjid", 4.7795, 100.958, "Masjid Ubudiah di Kuala Kangsar terkenal dengan kubah emasnya dan siap dibina pada tahun 1917."],
  ["pk-kellie", "perak", "Istana Kellie", "istana", 4.471, 101.088, "Istana Kellie di Batu Gajah ialah binaan lama yang tidak sempat disiapkan pada awal abad ke-20."],
  ["pk-condong", "perak", "Menara Condong Teluk Intan", "menara", 4.024, 101.02, "Menara Condong Teluk Intan dibina pada tahun 1885 sebagai menara jam dan tangki air."],
  ["pk-belum", "perak", "Hutan Belum-Temenggor", "hutan", 5.55, 101.4, "Hutan Belum-Temenggor dianggarkan berusia lebih 130 juta tahun dan menjadi habitat burung enggang."],
  ["kn-kglaut", "kelantan", "Masjid Kampung Laut", "masjid", 6.0623, 102.2489, "Masjid Kampung Laut antara masjid tertua di Malaysia, dibina tanpa paku menggunakan kayu cengal."],
  ["kn-siti", "kelantan", "Pasar Siti Khadijah", "pasar", 6.129, 102.239, "Pasar Siti Khadijah di Kota Bharu terkenal kerana kebanyakan peniaganya ialah wanita."],
  ["kn-cahaya", "kelantan", "Pantai Cahaya Bulan", "pantai", 6.195, 102.285, "Pantai Cahaya Bulan ialah pantai popular di Kota Bharu, terkenal dengan wakaf dan layang-layang."],
  ["tr-kristal", "terengganu", "Masjid Kristal", "masjid", 5.321, 103.123, "Masjid Kristal di Taman Tamadun Islam dibina daripada keluli, kaca dan kristal, siap pada tahun 2008."],
  ["tr-kenyir", "terengganu", "Tasik Kenyir", "tasik", 5.0, 102.7, "Tasik Kenyir ialah tasik buatan manusia terbesar di Asia Tenggara dengan lebih 340 pulau kecil."],
  ["tr-payang", "terengganu", "Pasar Payang", "pasar", 5.337, 103.139, "Pasar Payang terkenal dengan kain batik, songket dan keropok lekor Terengganu."],
  ["ph-tamannegara", "pahang", "Taman Negara", "hutan", 4.379, 102.401, "Taman Negara ialah hutan hujan tropika berusia lebih 130 juta tahun dengan titian kanopi yang panjang."],
  ["ph-cameron", "pahang", "Cameron Highlands", "ladang", 4.471, 101.377, "Cameron Highlands terkenal dengan ladang teh, strawberi dan cuaca sejuk."],
  ["ph-fraser", "pahang", "Bukit Fraser", "bukit", 3.712, 101.738, "Bukit Fraser ialah tanah tinggi berhawa sejuk yang terkenal dengan menara jamnya."],
  ["ph-cempedak", "pahang", "Pantai Teluk Cempedak", "pantai", 3.812, 103.372, "Pantai Teluk Cempedak di Kuantan mempunyai pasir putih dan laluan pejalan kaki di tepi bukit."],
  ["sl-biru", "selangor", "Masjid Sultan Salahuddin Abdul Aziz Shah", "masjid", 3.0784, 101.5203, "Masjid Biru di Shah Alam mempunyai antara kubah masjid terbesar di dunia."],
  ["sl-melawati", "selangor", "Bukit Melawati", "kota", 3.341, 101.247, "Bukit Melawati di Kuala Selangor menyimpan kesan kota lama dan rumah api."],
  ["sl-sekinchan", "selangor", "Sawah Padi Sekinchan", "sawah", 3.508, 101.105, "Sekinchan terkenal dengan sawah padi luas yang menghasilkan beras berkualiti tinggi."],
  ["wp-klcc", "wp", "Menara Berkembar Petronas", "berkembar", 3.1579, 101.7116, "Menara Berkembar Petronas setinggi 452 m pernah menjadi bangunan tertinggi di dunia (1998-2004)."],
  ["wp-negara", "wp", "Masjid Negara", "masjid", 3.1418, 101.6918, "Masjid Negara dibuka pada tahun 1965 dengan bumbung berbentuk payung bintang 16 bucu."],
  ["wp-menarakl", "wp", "Menara Kuala Lumpur", "menara", 3.1528, 101.7038, "Menara Kuala Lumpur setinggi 421 m digunakan untuk telekomunikasi dan cerapan anak bulan."],
  ["ns-pd", "nsembilan", "Pantai Port Dickson", "pantai", 2.473, 101.855, "Port Dickson terkenal dengan pantainya yang panjang dan menjadi destinasi percutian keluarga."],
  ["ns-serimenanti", "nsembilan", "Istana Lama Seri Menanti", "istana", 2.71, 102.15, "Istana Lama Seri Menanti dibina tanpa paku dengan 99 tiang kayu yang melambangkan pahlawan suku."],
  ["mk-afamosa", "melaka", "Kota A Famosa", "kota", 2.1916, 102.2503, "A Famosa dibina oleh Portugis selepas menawan Melaka pada tahun 1511; hanya pintu Porta de Santiago yang tinggal."],
  ["mk-selat", "melaka", "Masjid Selat Melaka", "masjid", 2.1844, 102.247, "Masjid Selat Melaka dibina di atas tiang di Pulau Melaka dan kelihatan terapung ketika air pasang."],
  ["jh-abubakar", "johor", "Masjid Sultan Abu Bakar", "masjid", 1.457, 103.747, "Masjid Sultan Abu Bakar di Johor Bahru siap pada tahun 1900 dengan gabungan seni bina Victoria dan Moor."],
  ["jh-piai", "johor", "Tanjung Piai", "pantai", 1.267, 103.51, "Tanjung Piai ialah hujung paling selatan tanah besar benua Asia dan kawasan paya bakau Ramsar."],
  ["jh-ledang", "johor", "Gunung Ledang", "gunung", 2.373, 102.608, "Gunung Ledang (1,276 m) terkenal dalam legenda Puteri Gunung Ledang."],
  ["sw-waterfront", "sarawak", "Kuching Waterfront", "bandar", 1.559, 110.348, "Kuching Waterfront terletak di tebing Sungai Sarawak, berhadapan Bangunan DUN Sarawak."],
  ["sw-niah", "sarawak", "Gua Niah", "gua", 3.815, 113.781, "Gua Niah ialah tapak penemuan tengkorak manusia berusia kira-kira 40,000 tahun."],
  ["sw-mulu", "sarawak", "Taman Negara Gunung Mulu", "gunung", 4.047, 114.915, "Taman Negara Gunung Mulu ialah Tapak Warisan Dunia UNESCO dengan Gua Rusa yang sangat besar."],
  ["sw-bako", "sarawak", "Taman Negara Bako", "hutan", 1.716, 110.47, "Taman Negara Bako ialah taman negara tertua di Sarawak dan habitat monyet belanda."],
  ["sb-kinabalu", "sabah", "Gunung Kinabalu", "gunung", 6.075, 116.558, "Gunung Kinabalu (4,095 m) ialah gunung tertinggi di Malaysia dan Tapak Warisan Dunia UNESCO."],
  ["sb-masjidkk", "sabah", "Masjid Bandaraya Kota Kinabalu", "masjid", 5.9945, 116.103, "Masjid Bandaraya Kota Kinabalu dibina di tepi lagun dan kelihatan seperti terapung."],
  ["sb-sepilok", "sabah", "Sepilok", "hutan", 5.864, 117.95, "Pusat Pemulihan Orang Utan Sepilok menjaga orang utan yatim sebelum dilepaskan ke hutan."],
  ["sb-kinabatangan", "sabah", "Sungai Kinabatangan", "sungai", 5.52, 118.29, "Sungai Kinabatangan ialah sungai kedua terpanjang di Malaysia dan habitat gajah pygmy Borneo."],
  /* v18.2: tempat pelancongan tambahan (peta 1.5 kali lebih besar) */
  ["pl-alhussain", "perlis", "Masjid Al-Hussain Kuala Perlis", "masjid", 6.3965, 100.13, "Masjid Al-Hussain dibina di atas air di muara Sungai Perlis dan kelihatan terapung ketika air pasang."],
  ["kd-menara", "kedah", "Menara Alor Setar", "menara", 6.122, 100.366, "Menara Alor Setar setinggi 165.5 m menjadi mercu tanda ibu negeri Kedah dan tempat cerapan anak bulan."],
  ["kd-pedu", "kedah", "Tasik Pedu", "tasik", 6.25, 100.75, "Tasik Pedu ialah tasik empangan di utara Kedah yang membekalkan air untuk sawah padi di Dataran Kedah."],
  ["pg-feringghi", "penang", "Pantai Batu Feringghi", "pantai", 5.476, 100.249, "Batu Feringghi ialah pantai peranginan terkenal di utara Pulau Pinang dengan pasar malamnya."],
  ["pk-tempurung", "perak", "Gua Tempurung", "gua", 4.416, 101.188, "Gua Tempurung di Gopeng ialah antara gua batu kapur terpanjang di Semenanjung Malaysia."],
  ["pk-taiping", "perak", "Taman Tasik Taiping", "tasik", 4.855, 100.748, "Taman Tasik Taiping ialah taman awam tertua di Malaysia, dibina di atas bekas lombong bijih timah."],
  ["kn-stong", "kelantan", "Gunung Stong", "gunung", 5.34, 101.97, "Gunung Stong di Dabong terkenal dengan air terjun bertingkat yang antara tertinggi di Asia Tenggara."],
  ["tr-terapung", "terengganu", "Masjid Tengku Tengah Zaharah", "masjid", 5.2735, 103.1648, "Masjid Tengku Tengah Zaharah atau Masjid Terapung dibina di kuala sungai dan siap pada tahun 1995."],
  ["tr-kemasik", "terengganu", "Pantai Kemasik", "pantai", 4.43, 103.46, "Pantai Kemasik di Kemaman terkenal dengan batu-batan besar dan air laut yang jernih."],
  ["ph-genting", "pahang", "Tanah Tinggi Genting", "bukit", 3.423, 101.793, "Tanah Tinggi Genting terletak kira-kira 1,800 m dari aras laut dan boleh dinaiki dengan kereta kabel."],
  ["ph-chini", "pahang", "Tasik Chini", "tasik", 3.438, 102.915, "Tasik Chini ialah tasik semula jadi kedua terbesar di Malaysia dan rizab biosfera UNESCO."],
  ["ph-charas", "pahang", "Gua Charas", "gua", 3.908, 103.15, "Gua Charas berhampiran Kuantan ialah gua batu kapur dengan tangga panjang ke dalam bukit."],
  ["sl-batu", "selangor", "Gua Batu", "gua", 3.2379, 101.684, "Gua Batu ialah bukit batu kapur berusia kira-kira 400 juta tahun di utara Kuala Lumpur."],
  ["sl-kelip", "selangor", "Kelip-kelip Kampung Kuantan", "sungai", 3.36, 101.27, "Kampung Kuantan di Kuala Selangor terkenal dengan kelip-kelip yang menyala di pokok berembang tebing sungai."],
  ["wp-putra", "wp", "Masjid Putra Putrajaya", "masjid", 2.936, 101.689, "Masjid Putra di Putrajaya berkubah merah jambu dan dibina di tepi Tasik Putrajaya pada tahun 1999."],
  ["ns-seremban", "nsembilan", "Masjid Negeri Seremban", "masjid", 2.727, 101.939, "Masjid Negeri Seremban mempunyai sembilan tiang dan kubah yang melambangkan sembilan luak Negeri Sembilan."],
  ["mk-taming", "melaka", "Menara Taming Sari", "menara", 2.191, 102.247, "Menara Taming Sari ialah menara tinjau berputar setinggi 110 m di Bandar Hilir, Melaka."],
  ["jh-desaru", "johor", "Pantai Desaru", "pantai", 1.545, 104.26, "Pantai Desaru di Kota Tinggi terkenal dengan pasir putih sepanjang 25 km dan pokok rhu."],
  ["jh-endau", "johor", "Taman Negara Endau-Rompin", "hutan", 2.53, 103.36, "Taman Negara Endau-Rompin ialah hutan hujan dataran rendah yang menjadi habitat harimau Malaya."],
  ["sw-budaya", "sarawak", "Kampung Budaya Sarawak", "istana", 1.75, 110.317, "Kampung Budaya Sarawak di kaki Gunung Santubong mempamerkan rumah tradisional kaum-kaum di Sarawak."],
  ["sw-lambir", "sarawak", "Taman Negara Bukit Lambir", "hutan", 4.2, 114.04, "Bukit Lambir berhampiran Miri ialah hutan yang sangat kaya dengan spesies pokok dan air terjun."],
  ["sb-kundasang", "sabah", "Kundasang", "ladang", 5.979, 116.58, "Kundasang di kaki Gunung Kinabalu terkenal dengan ladang sayur, ladang tenusu dan udara sejuk."],
  ["sb-kudat", "sabah", "Hujung Borneo", "pantai", 7.037, 116.744, "Hujung Borneo (Tanjung Simpang Mengayau) di Kudat ialah titik paling utara Pulau Borneo."],
  ["sb-danum", "sabah", "Lembah Danum", "hutan", 4.965, 117.8, "Lembah Danum ialah hutan hujan dara yang dilindungi dan habitat orang utan serta burung enggang."]
];
/* lapangan terbang untuk perjalanan pantas: [id, negeri, nama, lat, lon] */
const AIRPORTS = [
  ["ap-klia", "selangor", "KLIA Sepang", 2.7456, 101.7099],
  ["ap-pg", "penang", "Lapangan Terbang Pulau Pinang", 5.2971, 100.2770],
  ["ap-kb", "kelantan", "Lapangan Terbang Kota Bharu", 6.1668, 102.2930],
  ["ap-jb", "johor", "Lapangan Terbang Senai", 1.6413, 103.6697],
  ["ap-kch", "sarawak", "Lapangan Terbang Kuching", 1.4847, 110.3470],
  ["ap-bki", "sabah", "Lapangan Terbang Kota Kinabalu", 5.9372, 116.0510]
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
/* koordinat SVG peta operasi (titik menara tajuk) -> dunia: pemetaan linear kotak sempadan negeri SVG ke kotak
   sempadan negeri sebenar, kemudian dipastikan berada di daratan negeri itu */
const SVGA = {};
function lmRingsBox(rings) { let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9; for (const r of rings) for (const q of r) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); z0 = Math.min(z0, q[1]); z1 = Math.max(z1, q[1]); } return { x0: x0, z0: z0, w: x1 - x0 || 1, h: z1 - z0 || 1 }; }
function lmMainRing(k) { const rs = (GEOD.states[k] || []); let best = rs[0] || [[0, 0]], ba = -1; for (const r of rs) { const b = lmRingsBox([r]), a = b.w * b.h; if (a > ba) { ba = a; best = r; } } return best; }
function toW(k, x, y) {
  let A = SVGA[k];
  if (!A) {
    let sb = null, ba = -1;
    String(DATA.negeri[k].d).split("M").filter(Boolean).forEach((sp) => { const n = sp.replace(/Z/g, "").match(/-?[\d.]+/g).map(Number), pts = []; for (let i = 0; i + 1 < n.length; i += 2) pts.push([n[i], n[i + 1]]); const b = lmRingsBox([pts]); if (b.w * b.h > ba) { ba = b.w * b.h; sb = b; } });
    A = SVGA[k] = { s: sb, w: lmRingsBox([lmMainRing(k)]) };
  }
  return { x: A.w.x0 + (x - A.s.x0) / A.s.w * A.w.w, z: A.w.z0 + (y - A.s.z0) / A.s.h * A.w.h };
}
/* titik terdekat yang berada di daratan negeri k */
function lmSnap(k, w, maxR, strict) {
  const in1 = (x, z) => { const q = lmAt(x, z); return q === k || (!strict && k === "wp" && q === "selangor"); };
  /* strict: seluruh tapak (termasuk pintu pagar di +z) mesti dalam negeri yang sama, bukan di garis sempadan */
  const ok = strict ? (x, z) => in1(x, z) && in1(x, z + 28) && in1(x - 22, z) && in1(x + 22, z) && in1(x, z - 18) && in1(x - 16, z + 14) && in1(x + 16, z + 14) : in1;
  if (ok(w.x, w.z)) return w;
  for (let d = 3; d <= (maxR || 240); d += 3) for (let i = 0; i < 24; i++) { const a = i / 24 * 6.2832, x = w.x + Math.cos(a) * d, z = w.z + Math.sin(a) * d; if (ok(x, z)) return { x: x, z: z }; }
  return w;
}
/* muat data geografi (sekali) */
function lmGeoLoad() {
  if (GEOD) return Promise.resolve(GEOD);
  if (LM.geoP) return LM.geoP;
  const v = typeof APP_VER !== "undefined" ? "?v=" + APP_VER : "";
  LM.geoP = Promise.all([fetch("meta-geo.json" + v).then((r) => { if (!r.ok) throw new Error("geo " + r.status); return r.json(); }), fetch("meta-dem.bin" + v).then((r) => { if (!r.ok) throw new Error("dem " + r.status); return r.arrayBuffer(); })])
    .then(([gj, buf]) => {
      gj.demB = new Uint8Array(buf);
      if (WS !== 1) {
        for (const k in gj.states) gj.states[k] = gj.states[k].map((r) => r.map((q) => [q[0] * WS, q[1] * WS]));
        (gj.isl || []).forEach((o) => { o.c = [o.c[0] * WS, o.c[1] * WS]; });
        gj.dem.forEach((r) => { r.x0 *= WS; r.z0 *= WS; }); gj.cs *= WS; gj.U *= WS;
      }
      GEOD = gj; KV.c = null;
      /* zum Lembah Klang pada sempadan negeri (dipadatkan dahulu supaya lengkung pantai kekal licin) */
      const dense = (r) => { const o = []; for (let i = 0; i < r.length; i++) { const p = r[i], q = r[(i + 1) % r.length], n = Math.max(1, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / 8)), c = lmKvC(); if (Math.hypot(p[0] - c.x, p[1] - c.z) > KV.R + 400 && Math.hypot(q[0] - c.x, q[1] - c.z) > KV.R + 400) { o.push(p); continue; } for (let j = 0; j < n; j++) o.push([p[0] + (q[0] - p[0]) * j / n, p[1] + (q[1] - p[1]) * j / n]); } return o; };
      for (const k in gj.states) gj.states[k] = gj.states[k].map((r) => dense(r).map((q) => { const w = lmWarp(q[0], q[1]); return [w.x, w.z]; }));
      (gj.isl || []).forEach((o) => { const w = lmWarp(o.c[0], o.c[1]); o.c = [w.x, w.z]; });
      return gj;
    }).catch((e) => { LM.geoP = null; throw e; });
  return LM.geoP;
}
/* ketinggian sebenar (meter) daripada grid DEM; -1 = di luar kawasan data */
function lmDem(wx, wz) {
  if (Math.abs(wx - lmKvC().x) < KV.R && Math.abs(wz - lmKvC().z) < KV.R) { const q = lmUnwarp(wx, wz); wx = q.x; wz = q.z; }
  for (const r of GEOD.dem) {
    const fx = (wx - r.x0) / GEOD.cs, fz = (wz - r.z0) / GEOD.cs;
    if (fx < 0 || fz < 0 || fx >= r.nx - 1 || fz >= r.nz - 1) continue;
    const i = fx | 0, j = fz | 0, u = fx - i, v = fz - j, B = GEOD.demB, o = r.o + j * r.nx + i, e = (k) => { const q = B[k] / 4; return q * q; };
    return (e(o) * (1 - u) + e(o + 1) * u) * (1 - v) + (e(o + r.nx) * (1 - u) + e(o + r.nx + 1) * u) * v;
  }
  return -1;
}
/* jarak ke tepi kawasan DEM (untuk melandaikan daratan negara jiran ke laut) */
function lmDemEdge(wx, wz) { let best = 0; for (const r of GEOD.dem) { const d = Math.min(wx - r.x0, wz - r.z0, r.x0 + (r.nx - 1) * GEOD.cs - wx, r.z0 + (r.nz - 1) * GEOD.cs - wz); if (d > best) best = d; } return best; }
function lmSave() {
  /* v18.13: ringkasan untuk papan pemuka guru: [Stesen Ilmu selesai, jumlah, lencana, akhlak, tempat] */
  try { if (LM.g && LM.g.ilmu && LM.st) { const J = lmJourney(); LM.st.ms = [J.d, J.t, lmLcCount(), LM.st.ak | 0, Object.keys(LM.st.pl || {}).length]; LM.st.lt = Date.now(); } } catch (e) { /* abaikan */ }
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

/* ---------- peta raster: negeri di bawah setiap titik (dunia sebenar, ~1 km sepiksel) ---------- */
const RS = 0.33 / WS, RW = Math.ceil(WB.w * RS), RH = Math.ceil(WB.h * RS);
const RAST = { keys: [], data: null, paths: {} };
/* kod semak (biru) bagi setiap indeks negeri: campuran dua negeri di tepi tidak sepadan dengan mana-mana pasangan */
const RCHK = (n) => (n * 97 + 41) % 200 + 40;
function lmRaster() {
  if (RAST.data) return;
  const c = document.createElement("canvas"); c.width = RW; c.height = RH;
  const x = c.getContext("2d"); const keys = RAST.keys = Object.keys(DATA.negeri);
  x.setTransform(RS, 0, 0, RS, -WB.x0 * RS, -WB.z0 * RS); x.lineJoin = "round";
  keys.forEach((k, i) => {
    const p = RAST.paths[k] = new Path2D();
    (GEOD.states[k] || []).forEach((r) => { r.forEach((q, j) => (j ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1]))); p.closePath(); });
    x.fillStyle = x.strokeStyle = "rgb(" + ((i + 1) * 16) + ",0," + RCHK(i + 1) + ")"; x.lineWidth = 3 * WS; x.fill(p); x.stroke(p);
  });
  /* Jambatan Pulau Pinang (Gelugor - Perai) */
  const a = ll(5.3553, 100.3075), b = ll(5.3580, 100.3780), br = [a.x, a.z, b.x, b.z];
  x.strokeStyle = "rgb(240,0,0)"; x.lineWidth = 5; x.lineCap = "round"; x.beginPath(); x.moveTo(br[0], br[1]); x.lineTo(br[2], br[3]); x.stroke();
  lmRasterIslands(x);
  const D = RAST.data = x.getImageData(0, 0, RW, RH).data; RAST.bridge = br;
  /* piksel sempadan negeri dicampur oleh antialias (merah separuh jalan = negeri lain); ambil jiran yang "bersih" */
  const clean = (o) => { const r = D[o]; if (D[o + 3] < 250) return false; if (r >= 232 || r < 8) return true; const n = Math.round(r / 16); return Math.abs(r - n * 16) <= 2 && Math.abs(D[o + 2] - RCHK(n)) <= 3; };
  for (let py = 1; py < RH - 1; py++) for (let px = 1; px < RW - 1; px++) {
    const o = (py * RW + px) * 4; if (D[o + 3] < 110 || clean(o) || D[o] < 8 || D[o] >= 232) continue;
    let best = -1, bd = 1e9; for (const q of [o - 4, o + 4, o - RW * 4, o + RW * 4, o - RW * 4 - 4, o - RW * 4 + 4, o + RW * 4 - 4, o + RW * 4 + 4]) if (clean(q) && D[q] >= 8 && D[q] < 232) { const dd = Math.abs(D[q] - D[o]); if (dd < bd) { bd = dd; best = q; } }
    if (best >= 0) { D[o] = D[best]; D[o + 1] = D[best + 1]; D[o + 2] = D[best + 2]; } else if (D[o + 3] < 250) D[o + 3] = 0; /* serpihan tepi pantai tanpa jiran sah = laut */
  }
}
/* pulangkan kunci negeri ("" = laut, "jambatan" = jambatan) bagi koordinat dunia */
function lmAt(wx, wz) {
  const px = Math.round((wx - WB.x0) * RS), py = Math.round((wz - WB.z0) * RS);
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
const TER = { cs: 6, x0: WB.x0, z0: WB.z0, nx: 0, nz: 0, h: null, land: null, st: null, fg: null, dIn: null, dOut: null };
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
/* v18.5: ketinggian daripada DEM sebenar (SRTM). Ketinggian dibesarkan secara tidak linear supaya bukit kelihatan
   (1 km mendatar = 3 unit; 4,095 m Kinabalu ~ 66 unit). Daratan negara jiran (Thailand, Indonesia, Brunei,
   Singapura) dipaparkan tetapi tidak boleh dijejaki. */
function lmElevY(m) { return 0.55 + 30 * Math.pow(Math.max(0, m) / 1000, 0.95); }
/* puncak sebenar (meter): DEM 1.7 km melicinkan puncak, jadi puncak dinaikkan semula di lokasi mercu tanda */
const PEAK_M = { "sb-kinabalu": 4095, "sw-mulu": 2376, "kd-jerai": 1217, "jh-ledang": 1276, "kn-stong": 1422, "pg-bendera": 833, "ph-genting": 1800, "ph-cameron": 1500, "ph-fraser": 1300 };
function lmTerrainBase(g) {
  const cs = TER.cs = LM.gq ? 12 : 20, nx = TER.nx = Math.floor(WB.w / cs) + 1, nz = TER.nz = Math.floor(WB.h / cs) + 1, N = nx * nz;
  TER.x0 = WB.x0; TER.z0 = WB.z0;
  const land = TER.land = new Uint8Array(N), st = TER.st = new Uint8Array(N), fg = TER.fg = new Uint8Array(N), dem = new Float32Array(N), keys = RAST.keys;
  for (let z = 0; z < nz; z++) for (let x = 0; x < nx; x++) {
    const wx = TER.x0 + x * cs, wz = TER.z0 + z * cs, k = lmAt(wx, wz), i = z * nx + x;
    if (k && k !== "jambatan") { land[i] = 1; st[i] = keys.indexOf(k) + 1; dem[i] = Math.max(0, lmDem(wx, wz)); continue; }
    const m = lmDem(wx, wz); if (m > 3 && k !== "jambatan") { const e = lmDemEdge(wx, wz); if (e > 18) { land[i] = 1; fg[i] = 1; dem[i] = m * Math.min(1, (e - 18) / 60); } }
  }
  /* jurang dalam negara (data sempadan negeri tidak bertemu tepat, tasik) bukan tanah asing: jika ada daratan
     Malaysia di kedua-dua belah (mendatar, menegak atau pepenjuru) dalam ~7 km, jadikan daratan negeri biasa */
  const AX = [[1, 0], [0, 1], [1, 1], [1, -1]], RG = Math.ceil(42 / cs);
  const fix = [];
  for (let z = 0; z < nz; z++) for (let x = 0; x < nx; x++) {
    const i = z * nx + x; if (!fg[i]) continue;
    let k = 0;
    for (const [dx, dz] of AX) {
      let a = 0, b = 0;
      for (let d = 1; d <= RG && !(a && b); d++) {
        if (!a) { const xx = x - dx * d, zz = z - dz * d; if (xx >= 0 && zz >= 0 && xx < nx && zz < nz && st[zz * nx + xx]) a = st[zz * nx + xx]; }
        if (!b) { const xx = x + dx * d, zz = z + dz * d; if (xx >= 0 && zz >= 0 && xx < nx && zz < nz && st[zz * nx + xx]) b = st[zz * nx + xx]; }
      }
      if (a && b) { k = a; break; }
    }
    if (k) fix.push(i, k);
  }
  for (let j = 0; j < fix.length; j += 2) { const i = fix[j], x = i % nx, z = (i / nx) | 0; fg[i] = 0; st[i] = fix[j + 1]; dem[i] = Math.max(0, lmDem(TER.x0 + x * cs, TER.z0 + z * cs)); }
  const sea = new Uint8Array(N); for (let i = 0; i < N; i++) sea[i] = land[i] ? 0 : 1;
  const dIn = TER.dIn = lmDist(sea, nx, nz, cs), dOut = TER.dOut = lmDist(land, nx, nz, cs);
  const h = TER.h = new Float32Array(N), sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  for (let z = 0; z < nz; z++) for (let x = 0; x < nx; x++) {
    const i = z * nx + x, wx = TER.x0 + x * cs, wz = TER.z0 + z * cs;
    if (!land[i]) { h[i] = -1.4 - Math.min(dOut[i], 70) / 70 * 16 + (lmNoise(wx / 40, wz / 40) - 0.5) * 1.5; continue; }
    const D = dIn[i], inl = sm(6, 60, D);
    let v = lmElevY(dem[i]);
    v = Math.min(v, 0.6 + D * 0.35);                         /* pantai landai */
    if (!fg[i]) v += (lmFbm(wx / 90, wz / 90) - 0.5) * 2.2 * inl * (0.4 + Math.min(1, v / 12)); /* butiran kecil */
    h[i] = clamp(v, 0.45, 140);
  }
  for (const it of g.items) {
    const pm = it.kind === "pl" && PEAK_M[it.id]; if (!pm) continue;
    const ty = lmElevY(pm), r = (14 + pm / 160) * WS, R2 = r * r, xa = Math.max(0, Math.floor((it.x - r * 3 - TER.x0) / cs)), xb = Math.min(nx - 1, Math.ceil((it.x + r * 3 - TER.x0) / cs)), za = Math.max(0, Math.floor((it.z - r * 3 - TER.z0) / cs)), zb = Math.min(nz - 1, Math.ceil((it.z + r * 3 - TER.z0) / cs));
    for (let z = za; z <= zb; z++) for (let x = xa; x <= xb; x++) { const i = z * nx + x; if (!land[i]) continue; const d2 = (TER.x0 + x * cs - it.x) ** 2 + (TER.z0 + z * cs - it.z) ** 2, k = Math.exp(-d2 / R2); if (ty * k > h[i]) h[i] = h[i] + (ty * k - h[i]) * Math.min(1, k * 1.6); }
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
  lmTerrainPads(g); lmRailCarve(g);
  const { cs, nx, nz, h, x0, z0, land, st, dIn } = TER, N = nx * nz, keys = RAST.keys;
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), uv = new Float32Array(N * 2);
  const C = (hex) => new T.Color(hex), sand = C(0xe6d39a), wet = C(0xb9a571), grass = C(0x4f8a34), grass2 = C(0x6f9a3c), forest = C(0x24552a), rock = C(0x6f6a5e), snow = C(0xa9a59c), sea0 = C(0xd8c58e), sea1 = C(0x2b5f6e);
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
      if (TER.fg[i]) tmp.lerp(C(0x8a9a78), 0.45); /* negara jiran */
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
  const floor = new T.Mesh(new T.PlaneGeometry(18000, 18000).rotateX(-Math.PI / 2), new T.MeshBasicMaterial({ color: 0x1d4f6a })); floor.position.y = -17; g.scene.add(floor);
  /* sempadan negeri mengikut permukaan bukit */
  g.border = {};
  for (const k of keys) {
    const grp = new T.Group(), mat = new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 });
    (GEOD.states[k] || []).forEach((ring) => {
      const pts = [];
      for (let j = 0; j < ring.length; j++) {
        const a = { x: ring[j][0], z: ring[j][1] }, b = { x: ring[(j + 1) % ring.length][0], z: ring[(j + 1) % ring.length][1] }, seg = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 6));
        for (let s = 0; s < seg; s++) { const px = a.x + (b.x - a.x) * s / seg, pz = a.z + (b.z - a.z) * s / seg; pts.push(new T.Vector3(px, Math.max(0.15, lmHRaw(px, pz)) + 0.35, pz)); }
      }
      if (pts.length) { pts.push(pts[0].clone()); grp.add(new T.Line(new T.BufferGeometry().setFromPoints(pts), mat)); }
    });
    g.scene.add(grp); g.border[k] = mat;
  }
  /* jambatan Pulau Pinang */
  const br = RAST.bridge;
  if (br) {
    const a = { x: br[0], z: br[1] }, b = { x: br[2], z: br[3] }, len = Math.hypot(b.x - a.x, b.z - a.z), ang = Math.atan2(b.z - a.z, b.x - a.x);
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
  const m = new T.Mesh(new T.PlaneGeometry(18000, 18000).rotateX(-Math.PI / 2), new T.MeshPhongMaterial({ color: 0x1e88c8, shininess: 110, specular: 0xd8f0ff, transparent: true, opacity: 0.8, normalMap: nm, normalScale: new T.Vector2(0.55, 0.55), depthWrite: false }));
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
  for (let i = 0; i < (LM.gq ? 70 : 36); i++) { const s = new T.Sprite(cm); const k = 60 + R() * 70; s.scale.set(k * 1.8, k, 1); s.position.set(WB.x0 + R() * WB.w, 130 + R() * 70, WB.z0 + R() * WB.h); clouds.add(s); }
  g.scene.add(clouds); g.clouds = clouds;
}
/* ---------- tumbuhan: pokok hutan, pokok kelapa di pantai, batu ---------- */
function lmBuildTrees(g, avoid) {
  const NT = LM.gq ? 6500 : 2400, NP = LM.gq ? 1800 : 700, NR = LM.gq ? 900 : 320, R = lmRand("lm-trees");
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
  const fgAt = (x, z) => { const xi = Math.round((x - TER.x0) / TER.cs), zi = Math.round((z - TER.z0) / TER.cs); return xi >= 0 && zi >= 0 && xi < TER.nx && zi < TER.nz && TER.fg[zi * TER.nx + xi]; };
  /* grid ruang untuk senarai elak (beribu titik di sepanjang landasan dan lebuh raya) */
  const GC = 64, grid = new Map(), big = [];
  for (const a of avoid) { if (a.r + 4 > GC) { big.push(a); continue; } const k = Math.floor(a.x / GC) + "," + Math.floor(a.z / GC); let L = grid.get(k); if (!L) grid.set(k, (L = [])); L.push(a); }
  const blocked = (x, z) => {
    if (big.some((a) => Math.hypot(a.x - x, a.z - z) < a.r + 4)) return true;
    const cx = Math.floor(x / GC), cz = Math.floor(z / GC);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { const L = grid.get((cx + i) + "," + (cz + j)); if (L && L.some((a) => Math.hypot(a.x - x, a.z - z) < a.r + 4)) return true; }
    return false;
  };
  const ok = (x, z) => { const k = lmAt(x, z); return ((k && k !== "jambatan" && k !== "wp") || (!k && fgAt(x, z) && R() < 0.35)) && !blocked(x, z); };
  const put = (m, i, x, y, z, s, sy, rot) => { q.setFromAxisAngle(up, rot); mt.compose(pos.set(x, y, z), q, sc.set(s, sy, s)); m.setMatrixAt(i, mt); };
  let n = 0, np = 0, nr = 0, tries = 0;
  while ((n < NT || np < NP || nr < NR) && tries < 700000) {
    tries++;
    const x = WB.x0 + R() * WB.w, z = WB.z0 + R() * WB.h; if (!ok(x, z)) continue;
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
/* ---------- v18.5: masjid mengikut reka bentuk sebenar ---------- */
function lmDomeG(r, onion) {
  const k = "dome" + r + (onion ? "o" : "");
  if (GEO[k]) return GEO[k];
  const pts = [];
  if (onion) { for (let i = 0; i <= 14; i++) { const t = i / 14, a = t * Math.PI; pts.push(new T.Vector2(Math.max(0.001, r * (Math.sin(a * 0.92) * (1 + 0.25 * Math.sin(a))) * (1 - t * 0.15)), r * 1.45 * t)); } pts.push(new T.Vector2(0.001, r * 1.65)); }
  else { for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI / 2; pts.push(new T.Vector2(Math.max(0.001, Math.cos(a) * r), Math.sin(a) * r)); } }
  return (GEO[k] = new T.LatheGeometry(pts, 24));
}
function lmDome(g, r, col, x, y, z, onion, finial) {
  const d = lmMesh(lmDomeG(r, onion), col, x, y, z); g.add(d);
  if (finial !== false) { const top = onion ? r * 1.65 : r; g.add(lmMesh(lmCyl(0.08, 0.12, 1.4, 6), "#e0b341", x, y + top + 0.6, z)); g.add(lmMesh(lmSph(0.22, 8, 6), "#e0b341", x, y + top + 1.35, z)); }
  return d;
}
/* menara azan: batang, balkoni dan kepala */
function lmMinaret(g, x, z, h, r, col, cap, o) {
  o = o || {};
  if (o.square) g.add(lmMesh(lmBox(r * 2, h, r * 2), col, x, h / 2, z));
  else g.add(lmMesh(lmCyl(r * 0.85, r, h, 12), col, x, h / 2, z));
  if (o.stripe) for (let i = 1; i < 6; i++) g.add(lmMesh(lmCyl(r * 0.97, r * 0.97, 0.6, 12), o.stripe, x, h * i / 6, z));
  g.add(lmMesh(lmCyl(r * 1.45, r * 1.45, 0.35, 14), o.bal || col, x, h * 0.78, z));
  g.add(lmMesh(lmCyl(r * 0.7, r * 0.7, h * 0.1, 10), col, x, h + h * 0.05, z));
  if (o.cone) g.add(lmMesh(new T.ConeGeometry(r * 1.1, r * 3.2, o.cone), cap, x, h * 1.1 + r * 1.6, z));
  else lmDome(g, r * 0.95, cap, x, h * 1.1, z, !!o.onion);
}
function lmWater(g, r, y) { g.add(lmMesh(lmCyl(r, r, 0.3, 32), "#2f8fcf", 0, (y || 0) + 0.15, 0, { ns: 1 })); }
function lmStilts(g, w, d, h) { for (let x = -w / 2; x <= w / 2 + 0.01; x += w / 3) for (let z = -d / 2; z <= d / 2 + 0.01; z += d / 3) g.add(lmMesh(lmBox(0.5, h, 0.5), "#d9d3c4", x, h / 2, z)); }
function lmArches(g, w, h, y, z, n, col) { for (let i = 0; i < n; i++) g.add(lmMesh(lmBox(w / n * 0.55, h, 0.15), col || "#3a3028", -w / 2 + (i + 0.5) * w / n, y, z)); }
function lmMosque(id) {
  const g = new T.Group(); let r = 12;
  const W = "#f4efe3";
  switch (id) {
    case "kd-zahir": /* Masjid Zahir: kubah hitam, lima kubah, menara sudut */
      g.add(lmMesh(lmBox(18, 6, 16), W, 0, 3, 0)); lmArches(g, 16, 3.4, 2.6, 8.05, 7);
      lmDome(g, 4.6, "#1d1d22", 0, 6, 0, true);
      for (const [x, z] of [[-8, -7], [8, -7], [-8, 7], [8, 7]]) { g.add(lmMesh(lmCyl(1.3, 1.3, 9, 10), W, x, 4.5, z)); lmDome(g, 1.4, "#1d1d22", x, 9, z, true); }
      lmMinaret(g, 12, 0, 20, 1.1, W, "#1d1d22", { onion: true }); r = 13; break;
    case "pg-kapitan": /* Masjid Kapitan Keling: gaya Mughal, kubah bawang, menara Moor berasingan */
      g.add(lmMesh(lmBox(16, 6, 12), "#efe3c4", 0, 3, 0)); lmArches(g, 14, 3.2, 2.6, 6.05, 6, "#6b5a3a");
      lmDome(g, 3.8, "#b88a2a", 0, 6, 0, true);
      for (const [x, z] of [[-7, -5], [7, -5], [-7, 5], [7, 5]]) lmDome(g, 1.1, "#b88a2a", x, 6, z, true);
      lmMinaret(g, -12, 6, 17, 1.2, "#efe3c4", "#b88a2a", { onion: true, square: true }); r = 12; break;
    case "pk-ubudiah": /* Masjid Ubudiah: kubah emas, empat menara berjalur merah putih */
      g.add(lmMesh(lmBox(14, 6, 14), W, 0, 3, 0)); lmArches(g, 12, 3.2, 2.6, 7.05, 5);
      lmDome(g, 4.6, "#e0b341", 0, 6, 0, true);
      for (const [x, z] of [[-8.5, -8.5], [8.5, -8.5], [-8.5, 8.5], [8.5, 8.5]]) lmMinaret(g, x, z, 18, 0.95, W, "#e0b341", { onion: true, stripe: "#c0392b" });
      r = 13; break;
    case "kn-kglaut": /* Masjid Kampung Laut: kayu cengal, bumbung meru tiga tingkat */
      g.add(lmMesh(lmBox(13, 0.8, 13), "#6b4a2b", 0, 1.2, 0)); lmStilts(g, 12, 12, 1.2);
      g.add(lmMesh(lmBox(12, 4, 12), "#8a5a32", 0, 3.6, 0));
      for (let i = 0; i < 3; i++) { const c = lmMesh(new T.ConeGeometry(9.5 - i * 2.6, 2.6, 4), "#4a2e1a", 0, 6.8 + i * 2.4, 0); c.rotation.y = Math.PI / 4; g.add(c); if (i < 2) g.add(lmMesh(lmBox((9.5 - i * 2.6) * 0.95, 1, (9.5 - i * 2.6) * 0.95), "#8a5a32", 0, 7.9 + i * 2.4, 0)); }
      g.add(lmMesh(lmCyl(0.12, 0.2, 2, 6), "#e0b341", 0, 13.6, 0)); r = 9; break;
    case "tr-kristal": { /* Masjid Kristal: keluli, kaca dan kristal */
      lmWater(g, 18);
      const glass = new T.MeshPhongMaterial({ color: 0x9fdcf0, transparent: true, opacity: 0.6, shininess: 120, specular: 0xffffff });
      g.add(lmMesh(lmBox(16, 6, 14), glass, 0, 3.3, 0)); g.add(lmMesh(lmBox(16.2, 0.4, 14.2), "#c9d2dc", 0, 6.4, 0));
      g.add(lmMesh(lmDomeG(4.4, false), glass, 0, 6.6, 0)); g.add(lmMesh(lmCyl(0.2, 0.2, 3, 6), "#c9d2dc", 0, 12, 0));
      for (const [x, z] of [[-8, -7], [8, -7], [-8, 7], [8, 7]]) { g.add(lmMesh(lmCyl(0.8, 1, 16, 8), glass, x, 8, z)); g.add(lmMesh(new T.OctahedronGeometry(1.2, 0), glass, x, 17.2, z)); }
      r = 12; break; }
    case "sl-biru": /* Masjid Sultan Salahuddin Abdul Aziz Shah: kubah biru-perak besar, empat menara tertinggi */
      g.add(lmMesh(lmBox(22, 7, 22), W, 0, 3.5, 0)); lmArches(g, 20, 4, 3, 11.05, 8);
      g.add(lmMesh(lmCyl(7, 7.4, 2.4, 24), W, 0, 8.2, 0)); lmDome(g, 7.2, "#2f6fb5", 0, 9.4, 0, false);
      for (let i = 0; i < 8; i++) { const a = i / 8 * 6.2832; g.add(lmMesh(lmBox(0.25, 4, 0.25), "#cfe0f2", Math.cos(a) * 5.2, 12, Math.sin(a) * 5.2)); }
      for (const [x, z] of [[-14, -14], [14, -14], [-14, 14], [14, 14]]) lmMinaret(g, x, z, 38, 1.1, W, "#2f6fb5", { bal: "#2f6fb5" });
      r = 16; break;
    case "wp-negara": { /* Masjid Negara: bumbung payung bintang 16 bucu, menara 73 m */
      lmWater(g, 15);
      g.add(lmMesh(lmBox(20, 4, 20), W, 0, 2.2, 0)); lmArches(g, 18, 2.6, 2, 10.05, 9, "#5a7a8a");
      const um = lmMesh(new T.ConeGeometry(11, 3.4, 16), "#5fb5c8", 0, 5.9, 0); g.add(um);
      const um2 = lmMesh(new T.ConeGeometry(10.6, 3.2, 16), "#3f95ab", 0, 5.8, 0); um2.rotation.y = Math.PI / 16; g.add(um2);
      g.add(lmMesh(lmCyl(1.1, 1.3, 32, 12), W, 13, 16, -6)); const cap = lmMesh(new T.ConeGeometry(2.6, 2.2, 16), "#5fb5c8", 13, 33, -6); g.add(cap);
      r = 14; break; }
    case "mk-selat": /* Masjid Selat Melaka: di atas tiang di laut, kubah keemasan, menara rumah api */
      lmWater(g, 17); lmStilts(g, 14, 12, 1.4);
      g.add(lmMesh(lmBox(14, 5, 12), W, 0, 3.9, 0)); lmArches(g, 12, 2.6, 3.4, 6.05, 5);
      lmDome(g, 3.6, "#c8963c", 0, 6.4, 0, false);
      lmMinaret(g, 10, -5, 22, 1.2, W, "#c8963c", { bal: "#c8963c" }); r = 11; break;
    case "jh-abubakar": /* Masjid Sultan Abu Bakar: Victoria-Moor, bumbung biru, empat menara jam */
      g.add(lmMesh(lmBox(22, 6, 14), W, 0, 3, 0)); lmArches(g, 20, 3.2, 2.6, 7.05, 9, "#3a6aa8");
      { const rf = lmMesh(new T.ConeGeometry(13, 3.2, 4), "#3a6aa8", 0, 7.6, 0); rf.rotation.y = Math.PI / 4; rf.scale.z = 0.62; g.add(rf); }
      for (const [x, z] of [[-11, -7], [11, -7], [-11, 7], [11, 7]]) { g.add(lmMesh(lmBox(2.6, 14, 2.6), W, x, 7, z)); g.add(lmMesh(lmBox(2.7, 1.4, 2.7), "#3a6aa8", x, 11, z)); lmDome(g, 1.3, "#3a6aa8", x, 14, z, true); }
      r = 14; break;
    case "sb-masjidkk": /* Masjid Bandaraya Kota Kinabalu: kubah biru bergaris emas, di tepi lagun */
      lmWater(g, 19);
      g.add(lmMesh(lmBox(18, 6, 18), W, 0, 3.3, 0)); lmArches(g, 16, 3.2, 3, 9.05, 7, "#2d6fc0");
      g.add(lmMesh(lmCyl(5.4, 5.6, 1.6, 24), W, 0, 7, 0)); lmDome(g, 5.6, "#2d6fc0", 0, 7.8, 0, false);
      { const t = lmMesh(new T.TorusGeometry(5.5, 0.2, 6, 32), "#e0b341", 0, 8.0, 0); t.rotation.x = Math.PI / 2; g.add(t); }
      for (const [x, z] of [[-11, -11], [11, -11], [-11, 11], [11, 11]]) lmMinaret(g, x, z, 24, 0.9, W, "#2d6fc0", { bal: "#e0b341" });
      r = 14; break;
    case "pl-alhussain": /* Masjid Al-Hussain: di atas air di Kuala Perlis */
      lmWater(g, 16); lmStilts(g, 12, 12, 1.4);
      g.add(lmMesh(lmBox(12, 5, 12), W, 0, 3.9, 0)); lmArches(g, 10, 2.6, 3.4, 6.05, 4);
      lmDome(g, 3.4, "#e0b341", 0, 6.4, 0, true);
      lmMinaret(g, -9, 6, 18, 1, W, "#e0b341", { onion: true });
      g.add(lmMesh(lmBox(2.4, 0.4, 10), "#c9c0ad", 0, 1.6, 11)); r = 10; break;
    case "tr-terapung": /* Masjid Tengku Tengah Zaharah (Masjid Terapung): putih, gaya Moor, di kuala sungai */
      lmWater(g, 17); lmStilts(g, 14, 12, 1.2);
      g.add(lmMesh(lmBox(14, 5.5, 12), W, 0, 3.95, 0)); lmArches(g, 12, 3, 3.4, 6.05, 5, "#4f7f6a");
      lmDome(g, 3.8, "#f2f2ee", 0, 6.7, 0, true); { const t = lmMesh(new T.TorusGeometry(3.7, 0.18, 6, 28), "#e0b341", 0, 6.9, 0); t.rotation.x = Math.PI / 2; g.add(t); }
      lmMinaret(g, 10, 6, 20, 1, W, "#f2f2ee", { onion: true, bal: "#e0b341" }); r = 11; break;
    case "wp-putra": /* Masjid Putra: granit merah jambu, menara 116 m, di tepi tasik */
      lmWater(g, 18);
      g.add(lmMesh(lmBox(18, 6, 16), "#e8c2c0", 0, 3.3, 0)); lmArches(g, 16, 3.2, 3, 8.05, 7, "#8a4a50");
      g.add(lmMesh(lmCyl(5.2, 5.4, 1.8, 24), "#e8c2c0", 0, 7.2, 0)); lmDome(g, 5.4, "#d98a98", 0, 8.1, 0, false);
      lmMinaret(g, 13, -4, 36, 1.4, "#e8c2c0", "#d98a98", { square: true, bal: "#d98a98" }); r = 14; break;
    case "ns-seremban": /* Masjid Negeri Seremban: sembilan tiang dan sembilan bumbung kon (sembilan luak) */
      g.add(lmMesh(lmCyl(9, 9.5, 5, 18), W, 0, 2.5, 0));
      for (let i = 0; i < 9; i++) { const a = i / 9 * 6.2832; g.add(lmMesh(lmCyl(0.7, 0.8, 7, 8), W, Math.cos(a) * 8.8, 3.5, Math.sin(a) * 8.8)); g.add(lmMesh(new T.ConeGeometry(1.4, 3.6, 8), "#2f6f8a", Math.cos(a) * 8.8, 8.8, Math.sin(a) * 8.8)); }
      g.add(lmMesh(new T.ConeGeometry(7.5, 6, 18), "#2f6f8a", 0, 8, 0)); g.add(lmMesh(lmCyl(0.12, 0.2, 2, 6), "#e0b341", 0, 12, 0));
      r = 11; break;
    default: lmMasjid(g, {}); r = 11;
  }
  return { g: g, r: r };
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
      g.add(lmMesh(lmCyl(0.1, 0.1, 6, 6), "#d9d9d9", 0, 3.5, 0)); { const jg = new T.Mesh(GEO.pflag || (GEO.pflag = new T.PlaneGeometry(2.8, 1.4)), new T.MeshBasicMaterial({ map: lmFlagTex(), side: T.DoubleSide })); jg.position.set(1.45, 5.7, 0); g.add(jg); } r = 0; break; /* Jalur Gemilang */
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
   Livery umum "Didik Air" (bukan jenama sebenar). Asal kumpulan = bawah roda; hidung ke arah +x. */
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
    x.fillStyle = "#1d3c8f"; x.font = "900 26px Nunito, sans-serif"; x.fillText("META DIDIK AIR", w - 420, 40);
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
  const air = clamp(len[N] / 160, 9, 24);
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
/* ---------- pulau Misi Khas dan feri (v17.94; v18.5 ikut garis pantai sebenar) ---------- */
/* kh: senarai id Misi Khas mengikut keutamaan. from: negeri jeti tanah besar, port: jeti sebenar [lat, lon].
   sc: pembesaran untuk permainan (Pangkor dan Sipadan terlalu kecil untuk markas pada skala sebenar). */
const ISLANDS = [
  { id: "i-lkw", n: "Pulau Langkawi", kh: ["K4", "K3"], from: "kedah", port: "Jeti Kuala Kedah", pll: [6.1067, 100.2878], lm: "helang", sc: 1 },
  { id: "i-tio", n: "Pulau Tioman", kh: ["K5"], from: "johor", port: "Jeti Mersing", pll: [2.4330, 103.8420], lm: "tioman", sc: 1 },
  { id: "i-pkr", n: "Pulau Pangkor", kh: ["KS"], from: "perak", port: "Jeti Lumut", pll: [4.2335, 100.6300], lm: "kota", sc: 1.5 },
  { id: "i-sip", n: "Pulau Sipadan", kh: ["KR"], from: "sabah", port: "Jeti Semporna", pll: [4.4815, 118.6110], lm: "rumahapi", sc: 1 }
];
const ISL_BY = {};
function lmIslands() {
  if (LM.isl) return LM.isl;
  const out = [];
  ISLANDS.forEach((d, j) => {
    const kid = d.kh.find((k) => typeof KHAS_BY !== "undefined" && KHAS_BY[k]); if (!kid) return;
    const gi = (GEOD.isl || []).find((q) => q.id === d.id); if (!gi || gi.ring < 0) return;
    const cx = gi.c[0], cz = gi.c[1], ring = GEOD.states[gi.k][gi.ring].map((q) => [cx + (q[0] - cx) * d.sc, cz + (q[1] - cz) * d.sc]);
    const p = new Path2D(); ring.forEach((q, i) => (i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1]))); p.closePath();
    const bb = lmRingsBox([ring]);
    const o = Object.assign({}, d, { j: j, kid: kid, khas: KHAS_BY[kid], c: { x: cx, z: cz }, ring: ring, path: p, rad: Math.min(bb.w, bb.h) / 2 });
    out.push(o); ISL_BY[d.id] = o;
  });
  LM.isl = out; return out;
}
/* lukis pulau ke peta raster (saluran hijau) */
function lmRasterIslands(x) {
  lmIslands().forEach((o) => { x.fillStyle = x.strokeStyle = "rgb(0," + ((o.j + 1) * 40) + ",0)"; x.lineWidth = 2; x.fill(o.path); x.stroke(o.path); });
}
const lmIslW = (o) => o.c;
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
/* titik pantai tanah besar (bucu sempadan negeri) paling hampir dengan jeti sebenar, lapang dan menghadap laut ke arah pulau */
function lmCoastNear(state, tgt, isl, blocked) {
  const all = [];
  (GEOD.states[state] || []).forEach((r) => r.forEach((q) => all.push({ d: Math.hypot(q[0] - tgt.x, q[1] - tgt.z), x: q[0], z: q[1] })));
  all.sort((a, b) => a.d - b.d);
  const coast = (q) => { const l = Math.hypot(isl.x - q.x, isl.z - q.z) || 1, ux = (isl.x - q.x) / l, uz = (isl.z - q.z) / l; return lmAt(q.x + ux * 8, q.z + uz * 8) === "" && lmAt(q.x - ux * 8, q.z - uz * 8) === state; };
  const free = (q) => coast(q) && !(blocked || []).some((b) => Math.hypot(b.x - q.x, b.z - q.z) < b.r + 22);
  const clr = (q) => Math.min(1e9, ...(blocked || []).map((b) => Math.hypot(b.x - q.x, b.z - q.z) - b.r));
  const near = all.slice(0, 80), cs = near.filter(coast);
  return near.find(free) || (cs.length ? cs.sort((a, b) => clr(b) - clr(a))[0] : near[0] || tgt);
}
function lmBuildIslands(g, gnd, avoid) {
  lmIslands().forEach((o) => {
    const c = lmIslW(o), ct = lmCoastNear(o.from, ll(o.pll[0], o.pll[1]), c, avoid), cw = { x: ct.x, z: ct.z };
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
    if (lm) { const off = Math.min(22, Math.max(10, o.rad * 0.55)), ox = c.x + uz * off, oz = c.z - ux * off; lm.g.position.set(ox, 0, oz); g.scene.add(lm.g); gnd.push([lm.g, 0]); lmPad(g, ox, oz, Math.max(lm.r, 6) + 2); if (lm.r) g.cols.push({ x: ox, z: oz, r: lm.r, h: 20 }); it.lmk = lm.g; }
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
  const boat = jt.ferry || jt.other.ferry; const dur = clamp(Math.hypot(b.x - a.x, b.z - a.z) / 18, 8, 24);
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
/* ---------- v18.2: kereta api ETS (utara) dan ECRL (Pantai Timur) dari Kuala Lumpur ----------
   Stesen dalam koordinat SVG asal (seperti PLACES). Landasan dibina selepas rupa bumi siap: titik setiap
   4 unit, ketinggian dilicinkan (jambatan di atas lurah/sungai, terowong menembusi banjaran). */
/* laluan sebenar: [negeri, nama, lat, lon, berhenti?]. Titik tanpa henti mengikut jajaran landasan.
   ETS: Laluan Pantai Barat KTM. ECRL: jajaran Gombak - Kota Bharu (termasuk terowong Genting). */
const RAILS = [
  { id: "ets", n: "ETS", nm: "ETS KTM", col: "#1f4fa8", c2: "#f2c13a", quiz: 1, st: [
    ["wp", "KL Sentral", 3.1340, 101.6869, 1], ["selangor", "Kepong Sentral", 3.2087, 101.6286, 0], ["selangor", "Rawang", 3.3207, 101.5749, 1], ["selangor", "Kuala Kubu Bharu", 3.5536, 101.6400, 0],
    ["perak", "Tanjung Malim", 3.6847, 101.5180, 1], ["perak", "Slim River", 3.8283, 101.4033, 0], ["perak", "Sungkai", 3.9946, 101.3135, 0], ["perak", "Bidor", 4.1093, 101.2862, 0],
    ["perak", "Tapah Road", 4.1766, 101.1990, 0], ["perak", "Kampar", 4.3089, 101.1544, 1], ["perak", "Batu Gajah", 4.4719, 101.0418, 0], ["perak", "Ipoh", 4.5975, 101.0727, 1],
    ["perak", "Sungai Siput", 4.8225, 101.0688, 0], ["perak", "Kuala Kangsar", 4.7720, 100.9370, 1], ["perak", "Taiping", 4.8530, 100.7384, 1], ["perak", "Parit Buntar", 5.1260, 100.4932, 0],
    ["penang", "Bukit Mertajam", 5.3633, 100.4610, 1], ["penang", "Tasek Gelugor", 5.4811, 100.4986, 0], ["kedah", "Sungai Petani", 5.6451, 100.4870, 1], ["kedah", "Gurun", 5.8166, 100.4737, 0],
    ["kedah", "Alor Setar", 6.1197, 100.3746, 1], ["kedah", "Kodiang", 6.3756, 100.3000, 0], ["perlis", "Arau", 6.4294, 100.2707, 1], ["perlis", "Padang Besar", 6.6626, 100.3218, 1]] },
  { id: "ecrl", n: "ECRL", nm: "ECRL", col: "#0e8a6a", c2: "#9be3c9", st: [
    ["selangor", "Gombak (KL)", 3.2393, 101.7105, 1], ["pahang", "Genting (terowong)", 3.3600, 101.8300, 0], ["pahang", "Bentong", 3.5000, 101.9000, 1], ["pahang", "Karak", 3.4200, 102.0300, 0],
    ["pahang", "Mentakab", 3.4900, 102.3400, 1], ["pahang", "Maran", 3.5800, 102.7700, 0], ["pahang", "Kuantan", 3.8400, 103.2500, 1], ["pahang", "Pelabuhan Kuantan", 3.9650, 103.3700, 0],
    ["pahang", "Cherating", 4.1200, 103.3900, 0], ["terengganu", "Kemaman", 4.2300, 103.4100, 1], ["terengganu", "Kerteh", 4.5200, 103.4300, 0], ["terengganu", "Dungun", 4.7700, 103.4000, 1],
    ["terengganu", "Kuala Terengganu", 5.3000, 103.0600, 1], ["terengganu", "Penarik", 5.5900, 102.8000, 0], ["terengganu", "Kota Putera", 5.6800, 102.6200, 0], ["terengganu", "Jerteh", 5.7400, 102.4900, 1],
    ["kelantan", "Pasir Puteh", 5.8300, 102.4000, 0], ["kelantan", "Kota Bharu", 6.1000, 102.2600, 1]], quiz: 1 },
  /* v18.15: KTM Komuter, KLIA Ekspres dan KTM Sabah (kereta api di aras tanah); tap: tiket 1 soalan */
  { id: "kmsr", n: "Komuter", nm: "KTM Komuter (Laluan Seremban)", col: "#1d5fbf", c2: "#e23a3a", tap: 1, st: [
    ["wp", "KL Sentral", 3.1340, 101.6869, 1], ["wp", "Mid Valley", 3.1185, 101.6770, 1], ["wp", "Salak Selatan", 3.0980, 101.7050, 0], ["wp", "Bandar Tasik Selatan", 3.0763, 101.7111, 1],
    ["selangor", "Serdang", 3.0230, 101.7160, 1], ["selangor", "Kajang", 2.9830, 101.7900, 1], ["selangor", "UKM", 2.9400, 101.7880, 1], ["selangor", "Bangi", 2.9040, 101.7860, 1],
    ["nsembilan", "Batang Benar", 2.8300, 101.8260, 0], ["nsembilan", "Nilai", 2.8020, 101.7990, 1], ["nsembilan", "Seremban", 2.7190, 101.9400, 1]] },
  { id: "kmpk", n: "Komuter", nm: "KTM Komuter (Laluan Pelabuhan Klang)", col: "#1d5fbf", c2: "#e23a3a", tap: 1, st: [
    ["wp", "KL Sentral", 3.1340, 101.6869, 1], ["wp", "Angkasapuri", 3.1130, 101.6730, 0], ["selangor", "Petaling Jaya (Jalan Templer)", 3.0840, 101.6560, 0], ["selangor", "Subang Jaya", 3.0846, 101.5880, 1],
    ["selangor", "Batu Tiga", 3.0760, 101.5590, 0], ["selangor", "Shah Alam", 3.0566, 101.5255, 1], ["selangor", "Padang Jawa", 3.0525, 101.4930, 0], ["selangor", "Klang", 3.0430, 101.4490, 1],
    ["selangor", "Pelabuhan Klang", 2.9990, 101.3910, 1]] },
  { id: "erl", n: "KLIA Ekspres", nm: "KLIA Ekspres / KLIA Transit", col: "#6a2c91", c2: "#f2c13a", tap: 1, st: [
    ["wp", "KL Sentral", 3.1340, 101.6869, 1], ["wp", "Bandar Tasik Selatan", 3.0763, 101.7111, 1], ["selangor", "Putrajaya & Cyberjaya", 2.9210, 101.6730, 1],
    ["selangor", "Salak Tinggi", 2.8180, 101.7330, 1], ["selangor", "KLIA T1", 2.7560, 101.7070, 1]] },
  { id: "ktms", n: "KTM Sabah", nm: "Keretapi Negeri Sabah", col: "#2d7d46", c2: "#f2c13a", tap: 1, st: [
    ["sabah", "Tanjung Aru", 5.9460, 116.0500, 1], ["sabah", "Kinarut", 5.8190, 116.0430, 0], ["sabah", "Papar", 5.7340, 115.9310, 1], ["sabah", "Bongawan", 5.5370, 115.8650, 0],
    ["sabah", "Beaufort", 5.3470, 115.7460, 1], ["sabah", "Halogilat", 5.2400, 115.8800, 0], ["sabah", "Tenom", 5.1200, 115.9480, 1]] },
  /* v18.11: lebuh raya sebenar. Bas ekspres hanya boleh dinaiki di terminal lebuh raya, selepas lulus kuiz tiket. */
  { id: "plus", n: "PLUS", nm: "Lebuhraya Utara-Selatan (PLUS)", road: 1, quiz: 1, col: "#f28c28", c2: "#ffffff", st: [
    ["kedah", "Bukit Kayu Hitam", 6.505, 100.421, 1], ["kedah", "Changlun", 6.43, 100.43, 0], ["kedah", "Jitra", 6.27, 100.43, 0], ["kedah", "Alor Setar", 6.13, 100.40, 1],
    ["kedah", "Gurun", 5.82, 100.49, 0], ["kedah", "Sungai Petani", 5.65, 100.53, 1], ["penang", "Juru (Seberang Perai)", 5.33, 100.44, 1], ["perak", "Bandar Baharu", 5.13, 100.52, 0],
    ["perak", "Taiping", 4.88, 100.74, 1], ["perak", "Kuala Kangsar", 4.79, 100.93, 0], ["perak", "Ipoh (Amanjaya)", 4.64, 101.06, 1], ["perak", "Gopeng", 4.47, 101.16, 0],
    ["perak", "Tapah", 4.20, 101.27, 1], ["perak", "Sungkai", 3.99, 101.33, 0], ["perak", "Slim River", 3.85, 101.41, 0], ["perak", "Tanjung Malim", 3.69, 101.53, 1],
    ["selangor", "Rawang", 3.33, 101.58, 0], ["selangor", "Sungai Buloh", 3.21, 101.58, 0], ["wp", "Kuala Lumpur (TBS)", 3.076, 101.711, 1], ["nsembilan", "Nilai", 2.82, 101.80, 0],
    ["nsembilan", "Seremban", 2.72, 101.92, 1], ["nsembilan", "Pedas Linggi", 2.58, 102.05, 0], ["melaka", "Ayer Keroh", 2.27, 102.29, 1], ["johor", "Pagoh", 2.13, 102.73, 0],
    ["johor", "Yong Peng", 2.03, 103.07, 1], ["johor", "Machap", 1.86, 103.24, 0], ["johor", "Sedenak", 1.69, 103.53, 0], ["johor", "Johor Bahru (Larkin)", 1.497, 103.742, 1]] },
  { id: "lpt", n: "LPT", nm: "Lebuhraya Pantai Timur (LPT)", road: 1, quiz: 1, col: "#d64f8a", c2: "#ffffff", st: [
    ["selangor", "Gombak (TBG)", 3.236, 101.716, 1], ["pahang", "Genting Sempah", 3.36, 101.79, 0], ["pahang", "Bentong", 3.52, 101.91, 1], ["pahang", "Karak", 3.42, 102.03, 0],
    ["pahang", "Lanchang", 3.48, 102.22, 0], ["pahang", "Temerloh", 3.45, 102.42, 1], ["pahang", "Maran", 3.59, 102.77, 0], ["pahang", "Gambang", 3.71, 103.10, 0],
    ["pahang", "Kuantan", 3.83, 103.21, 1], ["terengganu", "Chukai (Kemaman)", 4.23, 103.36, 1], ["terengganu", "Paka", 4.62, 103.37, 0], ["terengganu", "Bukit Besi", 4.77, 103.20, 0],
    ["terengganu", "Ajil", 5.00, 103.08, 0], ["terengganu", "Kuala Terengganu", 5.29, 103.10, 1]] },
  { id: "pbsw", n: "Pan Borneo", nm: "Lebuhraya Pan Borneo (Sarawak)", road: 1, quiz: 1, col: "#7a5cd6", c2: "#ffffff", st: [
    ["sarawak", "Kuching Sentral", 1.50, 110.34, 1], ["sarawak", "Serian", 1.17, 110.57, 1], ["sarawak", "Sri Aman", 1.24, 111.46, 1], ["sarawak", "Betong", 1.41, 111.53, 0],
    ["sarawak", "Sarikei", 2.13, 111.52, 1], ["sarawak", "Sibu", 2.29, 111.83, 1], ["sarawak", "Selangau", 2.65, 112.24, 0], ["sarawak", "Tatau", 2.88, 112.85, 0],
    ["sarawak", "Bintulu", 3.17, 113.04, 1], ["sarawak", "Batu Niah", 3.81, 113.77, 0], ["sarawak", "Miri", 4.40, 113.99, 1]] },
  { id: "pbsb", n: "Pan Borneo", nm: "Lebuhraya Pan Borneo (Sabah)", road: 1, quiz: 1, col: "#7a5cd6", c2: "#ffffff", st: [
    ["sarawak", "Lawas", 4.85, 115.41, 1], ["sabah", "Sipitang", 5.08, 115.55, 0], ["sabah", "Beaufort", 5.35, 115.75, 1], ["sabah", "Papar", 5.73, 115.93, 0],
    ["sabah", "Kota Kinabalu", 5.95, 116.07, 1], ["sabah", "Tamparuli", 6.13, 116.27, 0], ["sabah", "Ranau", 5.95, 116.66, 1], ["sabah", "Telupid", 5.63, 117.12, 0],
    ["sabah", "Sandakan", 5.85, 118.03, 1]] },
  /* v18.15: rel bandar Lembah Klang (metro): landasan bertingkat, segmen bawah tanah (u = 1), stesen kecil.
     [negeri, stesen, lat, lon, berhenti, bawah tanah]; stesen pertukaran berkongsi satu pintu masuk */
  { id: "lrtkj", n: "LRT Kelana Jaya", nm: "LRT Laluan Kelana Jaya", metro: 1, tap: 1, col: "#e0245e", c2: "#ffffff", st: [
    ["selangor", "Gombak", 3.2313, 101.7244, 1], ["selangor", "Taman Melati", 3.2196, 101.7219, 1], ["wp", "Wangsa Maju", 3.2058, 101.7318, 1], ["wp", "Setiawangsa", 3.1757, 101.7358, 1],
    ["wp", "Ampang Park", 3.1600, 101.7194, 1, 1], ["wp", "KLCC", 3.1590, 101.7135, 1, 1], ["wp", "Masjid Jamek", 3.1496, 101.6964, 1, 1], ["wp", "Pasar Seni", 3.1424, 101.6953, 1],
    ["wp", "KL Sentral", 3.1345, 101.6862, 1], ["wp", "Bangsar", 3.1277, 101.6793, 1], ["wp", "Universiti", 3.1144, 101.6614, 1], ["selangor", "Taman Paramount", 3.1047, 101.6233, 1],
    ["selangor", "Kelana Jaya", 3.1125, 101.6045, 1], ["selangor", "Glenmarie", 3.0947, 101.5907, 1], ["selangor", "Subang Jaya", 3.0846, 101.5880, 1], ["selangor", "USJ 7", 3.0546, 101.5926, 1],
    ["selangor", "Putra Heights", 2.9960, 101.5753, 1]] },
  { id: "lrtam", n: "LRT Ampang", nm: "LRT Laluan Ampang", metro: 1, tap: 1, col: "#f08a24", c2: "#ffffff", st: [
    ["wp", "Sentul Timur", 3.1856, 101.6952, 1], ["wp", "Titiwangsa", 3.1736, 101.6953, 1], ["wp", "Masjid Jamek", 3.1497, 101.6966, 1],
    ["wp", "Hang Tuah", 3.1404, 101.7060, 1], ["wp", "Chan Sow Lin", 3.1280, 101.7157, 1], ["wp", "Maluri", 3.1235, 101.7275, 1],
    ["selangor", "Cempaka", 3.1380, 101.7524, 1], ["selangor", "Ampang", 3.1500, 101.7600, 1]] },
  { id: "lrtsp", n: "LRT Sri Petaling", nm: "LRT Laluan Sri Petaling", metro: 1, tap: 1, col: "#8a1e2d", c2: "#ffffff", st: [
    ["wp", "Chan Sow Lin", 3.1280, 101.7157, 1], ["wp", "Bandar Tun Razak", 3.0896, 101.7125, 1], ["wp", "Bandar Tasik Selatan", 3.0763, 101.7111, 1], ["wp", "Bukit Jalil", 3.0581, 101.6922, 1],
    ["wp", "Sri Petaling", 3.0612, 101.6870, 1], ["selangor", "Kinrara BK5", 3.0503, 101.6439, 1], ["selangor", "Puchong Prima", 2.9998, 101.6167, 1], ["selangor", "Putra Heights", 2.9960, 101.5753, 1]] },
  { id: "mrtkg", n: "MRT Kajang", nm: "MRT Laluan Kajang", metro: 1, tap: 1, col: "#0f8a3d", c2: "#ffffff", st: [
    ["selangor", "Kwasa Damansara", 3.1763, 101.5721, 1], ["selangor", "Bandar Utama", 3.1468, 101.6185, 1], ["wp", "TTDI", 3.1360, 101.6303, 1], ["wp", "Semantan", 3.1509, 101.6651, 1],
    ["wp", "Muzium Negara", 3.1372, 101.6878, 1, 1], ["wp", "Pasar Seni", 3.1423, 101.6955, 1, 1], ["wp", "Bukit Bintang", 3.1461, 101.7114, 1, 1],
    ["wp", "TRX", 3.1424, 101.7196, 1, 1], ["wp", "Maluri", 3.1238, 101.7277, 1, 1], ["wp", "Taman Connaught", 3.0791, 101.7414, 1], ["selangor", "Bandar Tun Hussein Onn", 3.0479, 101.7570, 1],
    ["selangor", "Sungai Jernih", 3.0003, 101.7837, 1], ["selangor", "Kajang", 2.9826, 101.7903, 1]] },
  { id: "mrtpy", n: "MRT Putrajaya", nm: "MRT Laluan Putrajaya", metro: 1, tap: 1, col: "#f2c418", c2: "#1d2b3a", st: [
    ["selangor", "Kwasa Damansara", 3.1763, 101.5721, 1], ["selangor", "Damansara Damai", 3.2050, 101.5980, 1], ["wp", "Kepong Baru", 3.2112, 101.6386, 1], ["wp", "Jinjang", 3.2096, 101.6556, 1],
    ["wp", "Kentonmen", 3.1963, 101.6726, 1], ["wp", "Sentul Barat", 3.1791, 101.6898, 1], ["wp", "Titiwangsa", 3.1736, 101.6955, 1, 1], 
    ["wp", "Ampang Park", 3.1620, 101.7183, 1, 1], ["wp", "TRX", 3.1424, 101.7196, 1, 1], ["wp", "Chan Sow Lin", 3.1285, 101.7155, 1, 1],
    ["wp", "Kuchai", 3.0898, 101.6942, 1], ["selangor", "Serdang Raya Utara", 3.0424, 101.7053, 1], ["selangor", "UPM", 3.0082, 101.7060, 1], ["selangor", "Cyberjaya Utara", 2.9497, 101.6582, 1],
    ["wp", "Putrajaya Sentral", 2.9335, 101.6715, 1]] },
  { id: "mono", n: "Monorel", nm: "Monorel KL", metro: 1, mono: 1, tap: 1, col: "#7cc242", c2: "#1d2b3a", st: [
    ["wp", "KL Sentral", 3.1325, 101.6875, 1], ["wp", "Hang Tuah", 3.1404, 101.7063, 1], ["wp", "Bukit Bintang", 3.1460, 101.7112, 1],
    ["wp", "Chow Kit", 3.1674, 101.6984, 1], ["wp", "Titiwangsa", 3.1740, 101.6960, 1]] }
];
const CAR = 16.6; /* panjang gerabak + sambungan */
/* v18.15: ikon jenis pengangkutan */
function lmIc(L) { return L.road ? "🚌" : L.mono ? "🚝" : L.metro ? "🚇" : "🚆"; }
/* pintu masuk stesen metro di aras jalan (dikongsi oleh stesen pertukaran) */
function lmMetroGate(L, name, ug) {
  const g = new T.Group();
  g.add(lmMesh(lmBox(7, 0.3, 5), "#cfc6b4", 0, 0.15, 0));
  g.add(lmMesh(lmBox(5.6, 3.4, 3.6), ug ? "#e9eef2" : "#efe9dc", 0, 1.9, -0.4));
  g.add(lmMesh(lmBox(4.6, 2.4, 0.1), "#1d2b3a", 0, 1.7, 1.42));
  g.add(lmMesh(lmBox(6.4, 0.5, 4.4), L.col, 0, 3.8, -0.3));
  g.add(lmMesh(lmBox(0.25, 5.4, 0.25), "#8a94a0", 3.4, 2.7, 1.9)); g.add(lmMesh(lmBox(1.3, 1.3, 0.2), L.col, 3.4, 5.6, 1.9));
  const sign = lmLabel(lmIc(L) + " " + name, { fs: 22, k: 0.024, bg: "rgba(10,30,60,.88)", bd: L.col }); sign.position.set(0, 6.4, 0); g.add(sign);
  g.userData.sign = sign;
  return g;
}
/* platform bertingkat di atas landasan metro */
function lmMetroPlatform(L) {
  const g = new T.Group(), w = L.mono ? 2.2 : 3.2;
  for (const z of [-w, w]) g.add(lmMesh(lmBox(11, 0.45, 1.6), "#d6d0c4", 0, -0.35, z));
  for (const x of [-4.5, 4.5]) for (const z of [-w - 0.5, w + 0.5]) g.add(lmMesh(lmBox(0.22, 3, 0.22), "#8a94a0", x, 1.2, z));
  g.add(lmMesh(lmBox(11.4, 0.25, w * 2 + 2), "#e6e6e2", 0, 2.8, 0)); g.add(lmMesh(lmBox(11.5, 0.3, 0.3), L.col, 0, 2.75, w + 1));
  return g;
}
function lmMetroCar(L, front, back) {
  const g = new T.Group(), sm = (c, o) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.45, metalness: 0.2 }, o || {}));
  const key = "met" + L.id, M = GEO[key] || (GEO[key] = { w: sm(0xf4f6f8), b: sm(new T.Color(L.col)), gl: sm(0x1d2b3a, { roughness: 0.1, metalness: 0.6 }), d: sm(0x2a2d33) });
  const yb = L.mono ? 1.0 : 0;
  const body = new T.Mesh(GEO.mtB || (GEO.mtB = new T.BoxGeometry(7.6, 2.5, 2.4)), M.w); body.position.y = 1.9 + yb; body.castShadow = true; g.add(body);
  const band = new T.Mesh(GEO.mtL || (GEO.mtL = new T.BoxGeometry(7.65, 0.7, 2.45)), M.b); band.position.y = 1.0 + yb; g.add(band);
  const win = new T.Mesh(GEO.mtW || (GEO.mtW = new T.BoxGeometry(6.6, 0.8, 2.48)), M.gl); win.position.y = 2.4 + yb; g.add(win);
  if (L.mono) { const sk = new T.Mesh(GEO.mtK || (GEO.mtK = new T.BoxGeometry(7.2, 1.0, 1.6)), M.b); sk.position.y = 0.4; g.add(sk); }
  else for (const x of [-2.6, 2.6]) { const bg = new T.Mesh(GEO.mtG || (GEO.mtG = new T.BoxGeometry(2, 0.6, 2)), M.d); bg.position.set(x, 0.5, 0); g.add(bg); }
  if (front) { const f = new T.Mesh(GEO.mtF || (GEO.mtF = new T.BoxGeometry(0.3, 2.0, 2.2)), M.gl); f.position.set(3.85, 2.1 + yb, 0); g.add(f); const c = new T.Mesh(GEO.mtC || (GEO.mtC = new T.BoxGeometry(0.32, 0.5, 2.3)), M.b); c.position.set(3.86, 0.9 + yb, 0); g.add(c); }
  if (back) g.userData.back = true;
  return g;
}
function lmMetroTrain(L) { return [lmMetroCar(L, true), lmMetroCar(L, true, true)]; }
function lmStationModel(L, name) {
  const g = new T.Group();
  g.add(lmMesh(lmBox(30, 0.7, 5), "#cfc6b4", 0, 0.35, 4.6));
  g.add(lmMesh(lmBox(30, 0.12, 0.35), "#f2c13a", 0, 0.76, 2.25));
  for (const x of [-12, -4, 4, 12]) g.add(lmMesh(lmBox(0.35, 4.2, 0.35), "#8a94a0", x, 2.8, 5.6));
  g.add(lmMesh(lmBox(30, 0.4, 5.6), L.col, 0, 5.1, 4.8));
  g.add(lmMesh(lmBox(10, 4, 5), "#efe9dc", 0, 2, 10.6)); g.add(lmMesh(lmBox(10.6, 0.6, 5.6), L.col, 0, 4.3, 10.6));
  const sign = lmLabel("🚆 " + L.n + " · " + name, { fs: 28, k: 0.03, bg: "rgba(10,30,60,.86)", bd: L.col }); sign.position.set(0, 9, 7); g.add(sign);
  return g;
}
function lmBusStationModel(L, name) {
  const g = new T.Group();
  g.add(lmMesh(lmBox(26, 0.4, 9), "#b9b4aa", 0, 0.2, 9));                        /* lorong bas */
  g.add(lmMesh(lmBox(26, 0.6, 4), "#d9d2c3", 0, 0.3, 15.5));                      /* platform menunggu */
  for (const x of [-10, -3.4, 3.4, 10]) g.add(lmMesh(lmBox(0.35, 4.4, 0.35), "#8a94a0", x, 2.5, 16.8));
  g.add(lmMesh(lmBox(27, 0.4, 6), L.col, 0, 4.8, 15.8));                          /* bumbung */
  g.add(lmMesh(lmBox(14, 5, 6), "#efe9dc", 0, 2.5, 21.5)); g.add(lmMesh(lmBox(14.6, 0.6, 6.6), L.col, 0, 5.2, 21.5));
  const sign = lmLabel("🚌 Terminal Bas " + name + " · " + L.n, { fs: 28, k: 0.03, bg: "rgba(20,40,20,.88)", bd: L.col }); sign.position.set(0, 9, 16); g.add(sign);
  return g;
}
function lmBus(L) {
  const g = new T.Group(), sm = (c, o) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.45, metalness: 0.2 }, o || {}));
  const key = "bus" + L.id, M = GEO[key] || (GEO[key] = { w: sm(0xf6f6f2), b: sm(new T.Color(L.col)), gl: sm(0x1d2b3a, { roughness: 0.1, metalness: 0.6 }), d: sm(0x2a2d33) });
  const body = new T.Mesh(GEO.bsB || (GEO.bsB = new T.BoxGeometry(12, 3.4, 2.8)), M.w); body.position.y = 2.3; body.castShadow = true; g.add(body);
  const band = new T.Mesh(GEO.bsL || (GEO.bsL = new T.BoxGeometry(12.05, 0.9, 2.85)), M.b); band.position.y = 1.2; g.add(band);
  const win = new T.Mesh(GEO.bsW || (GEO.bsW = new T.BoxGeometry(10.6, 1.1, 2.88)), M.gl); win.position.set(-0.4, 3.0, 0); g.add(win);
  const ws = new T.Mesh(GEO.bsF || (GEO.bsF = new T.BoxGeometry(0.12, 1.9, 2.5)), M.gl); ws.position.set(6.02, 2.7, 0); g.add(ws);
  for (const x of [-3.8, 3.8]) for (const z of [-1.35, 1.35]) { const w = new T.Mesh(GEO.bsT || (GEO.bsT = new T.CylinderGeometry(0.62, 0.62, 0.45, 12).rotateX(Math.PI / 2)), M.d); w.position.set(x, 0.62, z); g.add(w); }
  return [g];
}
function lmTrainCar(L, front) {
  const g = new T.Group(), sm = (c, o) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.45, metalness: 0.2 }, o || {}));
  const key = "trn" + L.id, M = GEO[key] || (GEO[key] = { w: sm(0xf4f6f8), b: sm(new T.Color(L.col)), s: sm(new T.Color(L.c2)), gl: sm(0x1d2b3a, { roughness: 0.1, metalness: 0.6 }), d: sm(0x2a2d33) });
  const body = new T.Mesh(GEO.trB || (GEO.trB = new T.BoxGeometry(15, 3, 3.2)), M.w); body.position.y = 2.6; body.castShadow = true; g.add(body);
  const band = new T.Mesh(GEO.trL || (GEO.trL = new T.BoxGeometry(15.05, 0.8, 3.25)), M.b); band.position.y = 1.5; g.add(band);
  const str = new T.Mesh(GEO.trS || (GEO.trS = new T.BoxGeometry(15.06, 0.22, 3.26)), M.s); str.position.y = 2.05; g.add(str);
  const win = new T.Mesh(GEO.trW || (GEO.trW = new T.BoxGeometry(13.6, 0.85, 3.28)), M.gl); win.position.y = 3.0; g.add(win);
  const roof = new T.Mesh(GEO.trR || (GEO.trR = new T.BoxGeometry(14.6, 0.35, 2.8)), M.d); roof.position.y = 4.25; g.add(roof);
  for (const x of [-5, 5]) { const bg = new T.Mesh(GEO.trG || (GEO.trG = new T.BoxGeometry(3, 0.8, 2.4)), M.d); bg.position.set(x, 0.75, 0); g.add(bg); }
  if (front) {
    const nose = new T.Mesh(GEO.trN || (GEO.trN = (() => { const n = new T.CylinderGeometry(0.2, 1.7, 3.4, 4, 1); n.rotateZ(-Math.PI / 2); n.rotateX(Math.PI / 4); n.scale(1, 0.95, 1.1); return n; })()), M.w);
    nose.position.set(9.1, 2.4, 0); g.add(nose);
    const ws = new T.Mesh(GEO.trWs || (GEO.trWs = new T.BoxGeometry(1.2, 0.9, 2.6)), M.gl); ws.position.set(8.2, 3.25, 0); ws.rotation.z = -0.5; g.add(ws);
    const lamp = new T.Mesh(GEO.trLp || (GEO.trLp = new T.BoxGeometry(0.2, 0.25, 2.4)), new T.MeshBasicMaterial({ color: 0xfff4c0 })); lamp.position.set(10.6, 1.9, 0); g.add(lamp);
  }
  return g;
}
function lmTrain(L) {
  const cars = [lmTrainCar(L, true), lmTrainCar(L, false), lmTrainCar(L, true)];
  cars[2].rotation.order = "YXZ"; cars[2].userData.back = true; /* kepala belakang menghadap arah bertentangan */
  return cars;
}
/* fasa 1 (sebelum rupa bumi): kedudukan stesen, tapak rata dan ruang bebas pokok di sepanjang laluan */
function lmRailsPlan(g, used, placed, avoid, gnd) {
  g.rails = [];
  RAILS.forEach((L) => {
    const sts = [];
    const via = [];
    L.st.forEach(([k, name, la, lo, stop, ug], i) => {
      if (!DATA.negeri[k]) return;
      if (!stop) { via.push({ i: i, w: ll(la, lo) }); return; }
      if (L.metro) { /* v18.15: pintu masuk kecil; stesen pertukaran (nama sama, berdekatan) berkongsi satu pintu */
        let w = ll(la, lo);
        const hubs = g.hubs || (g.hubs = []), hub = hubs.find((h) => h.nm === name && Math.hypot(h.x - w.x, h.z - w.z) < 90);
        const st = { kind: "st", id: L.id + "-" + i, k: k, n: "Stesen " + name, nm: name, line: null, i: sts.length, o: i, x: 0, z: 0, r: 0, ir: 9, m: null, ug: !!ug, hub: null };
        if (hub) { st.x = hub.x; st.z = hub.z; st.m = hub.m; st.hub = hub; hub.lines.push(st); sts.push(st); return; }
        const free = (x, z) => lmLandW(x, z) && lmLandW(x + 6, z) && lmLandW(x - 6, z) && !placed.some((u) => Math.hypot(u.x - x, u.z - z) < u.r + 6) && !g.items.some((it) => it.kind !== "st" && Math.hypot(it.x - x, it.z - z) < 12) && !hubs.some((h) => Math.hypot(h.x - x, h.z - z) < 9);
        if (!free(w.x, w.z)) { let best = null; for (let d = 3; d <= 30 && !best; d += 3) for (let j = 0; j < 12; j++) { const a = j * 0.5236 + d * 0.1, x = w.x + Math.cos(a) * d, z = w.z + Math.sin(a) * d; if (free(x, z)) { best = { x: x, z: z }; break; } } if (best) w = best; }
        const m = lmMetroGate(L, name, ug); m.position.set(w.x, 0, w.z); g.scene.add(m); gnd.push([m, 0]); lmPad(g, w.x, w.z, 6);
        const h = { nm: name, x: w.x, z: w.z, m: m, lines: [st] }; hubs.push(h);
        st.x = w.x; st.z = w.z; st.m = m; st.hub = h; sts.push(st); g.items.push(st); avoid.push({ x: w.x, z: w.z, r: 8 });
        return;
      }
      if (!L.road) {
        const hubs = g.hubs || (g.hubs = []), w0 = ll(la, lo), hub = hubs.find((h) => h.heavy && h.nm === name && Math.hypot(h.x - w0.x, h.z - w0.z) < 90);
        if (hub) { const st = { kind: "st", id: L.id + "-" + i, k: k, n: "Stesen " + name, nm: name, line: null, i: sts.length, o: i, x: hub.x, z: hub.z, r: 0, ir: 13, m: hub.m, hub: hub }; hub.lines.push(st); sts.push(st); return; }
      }
      const okK = (q) => q === k || (k === "wp" && q === "selangor") || (k === "selangor" && q === "wp");
      const free = (x, z) => okK(lmAt(x, z)) && lmLandW(x + 16, z) && lmLandW(x - 16, z) && lmLandW(x, z + 14) && lmLandW(x, z - 14)
        && !used.some((u) => Math.hypot(u.x - x, u.z - z) < 20) && !placed.some((u) => Math.hypot(u.x - x, u.z - z) < u.r + 30) && !avoid.some((a) => Math.hypot(a.x - x, a.z - z) < a.r + 14);
      let w = ll(la, lo);
      if (!free(w.x, w.z)) { let best = null; for (let d = 6; d <= 60 && !best; d += 6) for (let j = 0; j < 16; j++) { const a = j * 0.3927 + d * 0.07, x = w.x + Math.cos(a) * d, z = w.z + Math.sin(a) * d; if (free(x, z)) { best = { x: x, z: z }; break; } } if (best) w = best; }
      const m = L.road ? lmBusStationModel(L, name) : lmStationModel(L, name); m.position.set(w.x, 0, w.z); g.scene.add(m);
      lmPad(g, w.x, w.z, L.road ? 22 : 18);
      const st = { kind: "st", id: L.id + "-" + i, k: k, n: (L.road ? "Terminal Bas " : "Stesen ") + name, nm: name, line: null, i: sts.length, o: i, x: w.x, z: w.z, r: 0, ir: 13, m: m };
      if (!L.road) { const h = { nm: name, x: w.x, z: w.z, m: m, lines: [st], heavy: true, owner: st }; (g.hubs || (g.hubs = [])).push(h); st.hub = h; }
      sts.push(st); g.items.push(st); avoid.push({ x: w.x, z: w.z, r: 22 });
    });
    const R = { L: L, st: sts, via: via, pts: null, cum: null, sS: [], train: null, s: 0, dir: 1, wait: 4, next: 1 };
    sts.forEach((q) => (q.line = R));
    /* ruang bebas pokok sepanjang garis lurus antara stesen */
    const seq = sts.map((q) => ({ o: q.o, x: q.x, z: q.z })).concat(via.map((v) => ({ o: v.i, x: v.w.x, z: v.w.z }))).sort((a, b) => a.o - b.o); R.ctrl = seq;
    for (let i = 0; i < seq.length - 1; i++) { const a = seq[i], b = seq[i + 1], d = Math.hypot(b.x - a.x, b.z - a.z) || 1; for (let t = 0; t <= d; t += 10) avoid.push({ x: a.x + (b.x - a.x) * t / d, z: a.z + (b.z - a.z) * t / d, r: 5 }); }
    g.rails.push(R);
  });
}
/* fasa 2a (selepas ketinggian asas, sebelum jejaring rupa bumi): laluan, kecerunan dan kawasan potongan bukit */
const RAIL_CUT = 16; /* potongan lebih dalam daripada ini menjadi terowong berportal */
function lmRailsPath(g, avoid) {
  for (const R of g.rails) {
    const S = R.st; if (S.length < 2) continue;
    const ctrl = R.ctrl.map((q) => new T.Vector3(q.x, 0, q.z)), curve = new T.CatmullRomCurve3(ctrl, false, "centripetal", 0.5);
    const tot = curve.getLength(), n = Math.max(20, Math.round(tot / 4)), raw = curve.getSpacedPoints(n);
    /* landasan melencong mengelak menara, mercu tanda, lapangan terbang dan markas (stesen kekal) */
    const obs = [], met = !!R.L.metro;
    if (met) { for (const it of g.items) if (it.kind === "tw" || it.kind === "pl" || it.kind === "ip" || it.kind === "si" || it.kind === "km" || it.kind === "sn") obs.push({ x: it.x, z: it.z, c: 10 }); }
    else for (const it of g.items) {
      if (it.kind === "tw" || it.kind === "pl" || it.kind === "kh") obs.push({ x: it.x, z: it.z, c: Math.max(it.r || 0, it.kind === "tw" ? 3 : 6) + 12 });
      else if ((it.kind === "st" && it.line !== R) || it.kind === "ip" || it.kind === "si" || it.kind === "km" || it.kind === "sk" || it.kind === "fd" || it.kind === "sn") obs.push({ x: it.x, z: it.z, c: 26 });
      else if (it.kind === "ap" && it.rw) { const w = it.rw, ux = Math.cos(w.a), uz = Math.sin(w.a); for (let t = -w.L - 10; t <= w.L + 10; t += 12) obs.push({ x: w.x + ux * t, z: w.z + uz * t, c: 16 }); obs.push({ x: it.x, z: it.z, c: 30 }); }
    }
    const fixed = raw.map((q) => S.some((st) => Math.hypot(st.x - q.x, st.z - q.z) < (met ? 8 : 20)));
    const push = () => { raw.forEach((q, i) => { if (fixed[i]) return; for (const o of obs) { const dx = q.x - o.x, dz = q.z - o.z, d = Math.hypot(dx, dz); if (d < o.c) { if (d < 0.01) { q.x += o.c; continue; } const k = (o.c - d) / d; q.x += dx * k; q.z += dz * k; } } }); };
    for (let it = 0; it < 8; it++) { push(); for (let i = 1; i < raw.length - 1; i++) if (!fixed[i]) { raw[i].x = (raw[i - 1].x + raw[i].x * 2 + raw[i + 1].x) / 4; raw[i].z = (raw[i - 1].z + raw[i].z * 2 + raw[i + 1].z) / 4; } }
    push();
    /* kecerunan landai: purata bergerak panjang; banjaran tinggi menjadi terowong */
    const gy = raw.map((p) => lmHRaw(p.x, p.z));
    const base = gy.map((v) => Math.max(1.4, v + 0.6));
    const avg = (arr, w) => arr.map((_, i) => { let s = 0, c = 0; for (let j = -w; j <= w; j++) { const v = arr[i + j]; if (v != null) { s += v; c++; } } return s / c; });
    let grade = R.L.road ? avg(avg(base, 7), 4) : avg(avg(base, 14), 8);
    if (met) { /* metro: bertingkat 8 unit di atas tanah; antara stesen bawah tanah, landasan di bawah tanah */
      const si = S.map((st) => { let bi = 0, bd = 1e9; raw.forEach((q, i) => { const d = Math.hypot(q.x - st.x, q.z - st.z); if (d < bd) { bd = d; bi = i; } }); return bi; });
      const ugp = raw.map(() => false);
      for (let j = 0; j < S.length - 1; j++) { const a = si[j], b = si[j + 1], ua = S[j].ug, ub = S[j + 1].ug; for (let i = Math.min(a, b); i <= Math.max(a, b); i++) { const t = b === a ? 0 : (i - a) / (b - a); ugp[i] = ugp[i] || (ua && ub) || (ua && t < 0.4) || (ub && t > 0.6); } }
      const sg = avg(avg(gy.map((v) => Math.max(0.6, v)), 6), 3), want = sg.map((v, i) => ugp[i] ? v - 9 : v + (R.L.mono ? 7 : 8));
      grade = avg(want, 3);
      const pts = raw.map((p, i) => ({ x: p.x, y: ugp[i] ? grade[i] : Math.max(gy[i] + 6, grade[i]), z: p.z, tun: false, ug: ugp[i] }));
      const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z));
      R.pts = pts; R.cum = cum; R.len = cum[cum.length - 1];
      continue;
    }
    const pts = raw.map((p, i) => ({ x: p.x, y: Math.max(1.4, grade[i]), z: p.z, tun: gy[i] - grade[i] > RAIL_CUT }));
    /* terowong pendek (< 3 titik) dijadikan potongan biasa */
    for (let i = 0; i < pts.length; i++) if (pts[i].tun) { let j = i; while (j < pts.length && pts[j].tun) j++; if (j - i < 3) for (let k = i; k < j; k++) pts[k].tun = false; i = j; }
    const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z));
    R.pts = pts; R.cum = cum; R.len = cum[cum.length - 1];
    for (let i = 0; i < pts.length; i += 2) avoid.push({ x: pts[i].x, z: pts[i].z, r: 7 });
  }
  lmRailFlyovers(g);
}
/* v18.16: jejantas rel. Di setiap persilangan landasan kereta api dengan lebuh raya, landasan dinaikkan
   FLY_H unit di atas jalan dengan cerun landai di kedua-dua belah (bas lalu di bawah). Persilangan terlalu
   dekat dengan stesen kekal sebagai lintasan aras. */
const FLY_H = 8, FLY_FLAT = 16, FLY_GRADE = 0.11, FLY_CS = 40;
function lmSegX(a, b, c, d) {
  const rx = b.x - a.x, rz = b.z - a.z, sx = d.x - c.x, sz = d.z - c.z, den = rx * sz - rz * sx; if (Math.abs(den) < 1e-9) return null;
  const qx = c.x - a.x, qz = c.z - a.z, t = (qx * sz - qz * sx) / den, u = (qx * rz - qz * rx) / den;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? { t: t, u: u } : null;
}
function lmRoadNear(g, x, z, r) {
  const G = g.roadSeg; if (!G) return false;
  const cx = Math.floor(x / FLY_CS), cz = Math.floor(z / FLY_CS);
  for (let ox = -1; ox <= 1; ox++) for (let oz = -1; oz <= 1; oz++) {
    const L = G.get((cx + ox) + "," + (cz + oz)); if (!L) continue;
    for (const s of L) { const vx = s.b.x - s.a.x, vz = s.b.z - s.a.z, l2 = vx * vx + vz * vz || 1, t = clamp(((x - s.a.x) * vx + (z - s.a.z) * vz) / l2, 0, 1); if (Math.hypot(s.a.x + vx * t - x, s.a.z + vz * t - z) < r) return true; }
  }
  return false;
}
function lmRailFlyovers(g) {
  const G = g.roadSeg = new Map();
  for (const R of g.rails) if (R.L.road && R.pts) R.pts.forEach((p, i) => { if (!i) return; const q = R.pts[i - 1], k = Math.floor((p.x + q.x) / 2 / FLY_CS) + "," + Math.floor((p.z + q.z) / 2 / FLY_CS); let L = G.get(k); if (!L) G.set(k, (L = [])); L.push({ a: q, b: p }); });
  g.flyN = 0;
  for (const R of g.rails) {
    if (R.L.road || R.L.metro || !R.pts) continue;
    const P = R.pts, C = R.cum, hits = [];
    for (let i = 1; i < P.length; i++) {
      const a = P[i - 1], b = P[i], cx = Math.floor((a.x + b.x) / 2 / FLY_CS), cz = Math.floor((a.z + b.z) / 2 / FLY_CS);
      for (let ox = -1; ox <= 1; ox++) for (let oz = -1; oz <= 1; oz++) {
        const L = G.get((cx + ox) + "," + (cz + oz)); if (!L) continue;
        for (const sg of L) { const x = lmSegX(a, b, sg.a, sg.b); if (x) hits.push({ s: C[i - 1] + (C[i] - C[i - 1]) * x.t, y: sg.a.y + (sg.b.y - sg.a.y) * x.u }); }
      }
    }
    for (const h of hits) {
      if (R.st.some((st) => Math.hypot(st.x - lmRailAt(R, h.s).x, st.z - lmRailAt(R, h.s).z) < 45)) continue; /* dekat stesen: lintasan aras */
      const top = h.y + FLY_H; g.flyN++; { const q = lmRailAt(R, h.s); (g.flyAt || (g.flyAt = [])).push({ x: q.x, z: q.z, id: R.L.id }); }
      for (let j = 0; j < P.length; j++) {
        const d = Math.abs(C[j] - h.s); if (d > FLY_FLAT + FLY_H / FLY_GRADE + 4) continue;
        const want = top - Math.max(0, d - FLY_FLAT) * FLY_GRADE;
        if (want > P[j].y) { P[j].y = want; P[j].tun = false; P[j].up = true; }
        if (d < FLY_FLAT + 6) P[j].fly = true;
      }
    }
  }
}
/* dipanggil oleh lmBuildTerrain selepas tapak rata: potong bukit / tambak rendah di sepanjang landasan */
function lmRailCarve(g) {
  if (!g.rails) return;
  const { cs, nx, nz, h, x0, z0, land } = TER, W0 = 4.5, W1 = 18, best = new Float32Array(nx * nz).fill(1e9), raw = new Float32Array(nx * nz).fill(1e9), tgt = new Float32Array(nx * nz);
  for (const R of g.rails) {
    if (!R.pts || R.L.metro) continue;
    const Wr = R.L.road ? 8 : 0;
    for (const p of R.pts) {
      if (p.tun || p.fly || p.up) continue;
      const W2 = W1 + Wr, xa = Math.max(0, Math.floor((p.x - W2 - x0) / cs)), xb = Math.min(nx - 1, Math.ceil((p.x + W2 - x0) / cs));
      const za = Math.max(0, Math.floor((p.z - W2 - z0) / cs)), zb = Math.min(nz - 1, Math.ceil((p.z + W2 - z0) / cs));
      /* keutamaan ikut jarak sebenar ke garisan (landasan dan lebuh raya yang berdekatan tidak saling menimbus); lebar rata lebuh raya disimpan berasingan */
      for (let z = za; z <= zb; z++) for (let x = xa; x <= xb; x++) { const i = z * nx + x, d0 = Math.hypot(x0 + x * cs - p.x, z0 + z * cs - p.z); if (d0 < raw[i]) { raw[i] = d0; best[i] = Math.max(0, d0 - Wr); tgt[i] = p.y - (Wr ? 0.2 : 0.75); } }
    }
  }
  for (let i = 0; i < best.length; i++) {
    const d = best[i]; if (d > W1) continue;
    const t = d <= W0 ? 1 : 1 - (d - W0) / (W1 - W0), w = t * t * (3 - 2 * t), want = tgt[i];
    if (h[i] > want) h[i] = h[i] + (want - h[i]) * w;               /* potongan bukit */
    else if (want - h[i] < 7 && land[i]) h[i] = h[i] + (want - h[i]) * w * 0.9; /* tambak rendah; lurah dalam kekal sebagai jambatan */
  }
}
/* sapuan profil 2D di sepanjang laluan (balast, rel) */
function lmSweep(pts, cum, prof, vScale, skip) {
  const pos = [], uv = [], idx = [], np = prof.length; let v0 = 0;
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b.x - a.x, dz = b.z - a.z, l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l;
    prof.forEach((q, j) => { pos.push(p.x + nx * q[0], p.y + q[1], p.z + nz * q[0]); uv.push(j / (np - 1), cum[i] / vScale); });
    if (i && !(skip && skip(i))) { const k0 = (i - 1) * np, k1 = i * np; for (let j = 0; j < np - 1; j++) idx.push(k0 + j, k1 + j, k0 + j + 1, k0 + j + 1, k1 + j, k1 + j + 1); }
    v0++;
  });
  const geo = new T.BufferGeometry(); geo.setAttribute("position", new T.Float32BufferAttribute(pos, 3)); geo.setAttribute("uv", new T.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
  return geo;
}
/* portal terowong konkrit */
function lmPortal() {
  const g = new T.Group(), c = lmMat("#b9b4aa"), d = lmMat("#1b1a19");
  g.add(lmMesh(lmBox(1.6, 9, 12), c, 0, 4.5, 0)); g.add(lmMesh(lmBox(1.7, 6.2, 6.4), d, 0.05, 3.1, 0));
  g.add(lmMesh(lmBox(2.4, 1.2, 13), c, 0, 9.4, 0));
  return g;
}
/* fasa 2b (selepas rupa bumi): jejaring landasan, stesen, tiang elektrik, jambatan dan kereta api */
function lmRailsBuild(g) {
  const tex = lmTex(64, 64, (x, w, h) => {
    x.fillStyle = "#8f8a82"; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 420; i++) { const v = 95 + Math.random() * 80 | 0; x.fillStyle = "rgba(" + v + "," + (v - 6) + "," + (v - 12) + ",.85)"; x.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 2, 2); }
  });
  tex.wrapS = tex.wrapT = T.RepeatWrapping;
  const ballM = new T.MeshLambertMaterial({ map: tex, side: T.DoubleSide }), railM = new T.MeshStandardMaterial({ color: 0xc4c9d0, metalness: 0.75, roughness: 0.3, side: T.DoubleSide }), wireM = new T.LineBasicMaterial({ color: 0x2a2d33 });
  const pillars = [], sleepers = [], masts = [], lamps = [];
  /* tekstur asfalt: garisan tepi kuning, garisan lorong putih putus-putus, penghadang tengah */
  const atex = lmTex(64, 64, (x, w, h) => {
    x.fillStyle = "#3b3d42"; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 300; i++) { const v = 50 + Math.random() * 30 | 0; x.fillStyle = "rgba(" + v + "," + v + "," + (v + 4) + ",.7)"; x.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); }
    x.fillStyle = "#e8c23a"; x.fillRect(22, 0, 1.5, h); x.fillRect(40.5, 0, 1.5, h);
    x.fillStyle = "#f2f2f2"; for (const lx of [26.5, 36.5]) x.fillRect(lx, 4, 1.2, 26);
    x.fillStyle = "#9a9da3"; x.fillRect(31, 0, 2, h);
  });
  atex.wrapS = atex.wrapT = T.RepeatWrapping;
  const asM = new T.MeshLambertMaterial({ map: atex, side: T.DoubleSide }), bar = lmMat("#c9c6bf");
  for (const R of g.rails) {
    const S = R.st, pts = R.pts, cum = R.cum; if (!pts) continue;
    if (R.L.road) { lmRoadBuild(g, R, asM, bar, pillars, lamps); continue; }
    if (R.L.metro) { lmMetroBuild(g, R, pillars); continue; }
    /* kedudukan stesen di sepanjang laluan */
    R.sS = S.map((q) => { let bi = 0, bd = 1e9; pts.forEach((p, i) => { const d = Math.hypot(p.x - q.x, p.z - q.z); if (d < bd) { bd = d; bi = i; } }); return cum[bi]; });
    S.forEach((q, i) => {
      const a = lmRailAt(R, R.sS[i]), yaw = Math.atan2(-a.tz, a.tx);
      if (q.hub && q.hub.owner && q.hub.owner !== q) { const o = q.hub.owner; q.px = -a.tz; q.pz = a.tx; q.tx = a.tx; q.tz = a.tz; q.y = a.y; q.x = o.x; q.z = o.z; return; }
      q.m.position.set(a.x, a.y - 0.5, a.z); q.m.rotation.y = yaw;
      const px = -a.tz, pz = a.tx; q.x = a.x + px * 6.5; q.z = a.z + pz * 6.5; q.px = px; q.pz = pz; q.tx = a.tx; q.tz = a.tz; q.y = a.y;
      if (q.hub) { q.hub.x = q.x; q.hub.z = q.z; }
      g.cols.push({ x: a.x + px * 10.6, z: a.z + pz * 10.6, r: 4.5, h: a.y + 4 });
    });
    const inTun = (i) => pts[i].tun && pts[i - 1].tun;
    /* balast trapezium, dua rel berprofil */
    g.scene.add(Object.assign(new T.Mesh(lmSweep(pts, cum, [[-2.9, -0.75], [-1.75, -0.12], [1.75, -0.12], [2.9, -0.75]], 3, inTun), ballM), { receiveShadow: true }));
    for (const o of [-0.72, 0.72]) g.scene.add(new T.Mesh(lmSweep(pts, cum, [[o - 0.11, 0.02], [o - 0.07, 0.2], [o - 0.09, 0.26], [o + 0.09, 0.26], [o + 0.07, 0.2], [o + 0.11, 0.02]], 4, inTun), railM));
    /* wayar sesentuh di atas landasan */
    let wire = [];
    const flush = () => { if (wire.length > 1) g.scene.add(new T.Line(new T.BufferGeometry().setFromPoints(wire), wireM)); wire = []; };
    pts.forEach((p, i) => { if (p.tun) { flush(); return; } if (i % 2 === 0) wire.push(new T.Vector3(p.x, p.y + 6, p.z)); }); flush();
    /* kayu landas konkrit setiap ~1.6 unit, tiang elektrik setiap ~32 unit, tiang jambatan */
    for (let s = 0; s < R.len; s += 1.6) { const a = lmRailAt(R, s); if (!a.tun) sleepers.push(a); }
    for (let s = 6; s < R.len; s += 32) { const a = lmRailAt(R, s); if (!a.tun) masts.push(a); }
    for (let i = 0; i < pts.length; i += 3) { const p = pts[i], gy = lmHRaw(p.x, p.z); if (p.y - gy > 2.4 && !p.tun && !((p.fly || p.up) && lmRoadNear(g, p.x, p.z, 9))) pillars.push({ x: p.x, z: p.z, y0: Math.max(gy, -16), y1: p.y - 0.75 }); }
    /* v18.16: rasuk jejantas (galang konkrit di bawah landasan dan dinding sisi) */
    { const fl = (i) => !(pts[i].fly && pts[i - 1].fly), gm = GEO.flyM || (GEO.flyM = lmMat("#b8b2a6"));
      if (pts.some((q) => q.fly)) { g.scene.add(new T.Mesh(lmSweep(pts, cum, [[-3.3, -2.2], [-3.3, -0.6], [3.3, -0.6], [3.3, -2.2]], 6, fl), gm)); for (const o of [-3.2, 3.2]) g.scene.add(new T.Mesh(lmSweep(pts, cum, [[o - 0.15, -0.7], [o - 0.15, 0.9], [o + 0.15, 0.9], [o + 0.15, -0.7]], 6, fl), gm)); } }
    /* portal di kedua-dua hujung terowong */
    for (let i = 1; i < pts.length; i++) if (pts[i].tun !== pts[i - 1].tun) {
      const j = pts[i].tun ? i - 1 : i, a = lmRailAt(R, cum[j]), po = lmPortal();
      po.position.set(a.x, a.y - 0.75, a.z); po.rotation.y = Math.atan2(-a.tz, a.tx); g.scene.add(po);
    }
    R.train = lmTrain(R.L); R.train.forEach((c) => g.scene.add(c));
    R.s = R.sS[0]; R.dir = 1; R.next = 1; R.wait = 3;
    lmRailPlace(R);
  }
  const mt = new T.Matrix4(), q = new T.Quaternion(), sc = new T.Vector3(), ps = new T.Vector3(), up = new T.Vector3(0, 1, 0);
  const inst = (geo, mat, list, put, shadow) => { if (!list.length) return; const im = new T.InstancedMesh(geo, mat, list.length); list.forEach((a, i) => { put(a); im.setMatrixAt(i, mt); }); im.castShadow = !!(shadow && LM.gq); im.receiveShadow = true; g.scene.add(im); };
  inst(new T.BoxGeometry(2.7, 0.16, 0.38), lmMat("#7f786d"), sleepers, (a) => { q.setFromAxisAngle(up, Math.atan2(-a.tx, -a.tz)); mt.compose(ps.set(a.x, a.y - 0.04, a.z), q, sc.set(1, 1, 1)); });
  inst(new T.BoxGeometry(2.4, 1, 2.4), lmMat("#b9b2a2"), pillars, (p) => { const hh = Math.max(0.5, p.y1 - p.y0); mt.compose(ps.set(p.x, p.y0 + hh / 2, p.z), q.identity(), sc.set(1, hh, 1)); }, true);
  /* tiang elektrik: tiang tegak + lengan julur di atas landasan */
  const mastG = (() => { const a = new T.BoxGeometry(0.3, 7, 0.3); a.translate(0, 3.5, 0); const b = new T.BoxGeometry(0.16, 0.16, 3.4); b.translate(0, 6.6, -1.6); const m = new T.BufferGeometry(); const ga = a.toNonIndexed(), gb = b.toNonIndexed(); const pa = ga.attributes.position.array, pb = gb.attributes.position.array, na = ga.attributes.normal.array, nb = gb.attributes.normal.array; const P2 = new Float32Array(pa.length + pb.length); P2.set(pa); P2.set(pb, pa.length); const N2 = new Float32Array(na.length + nb.length); N2.set(na); N2.set(nb, na.length); m.setAttribute("position", new T.BufferAttribute(P2, 3)); m.setAttribute("normal", new T.BufferAttribute(N2, 3)); return m; })();
  { const lg = new T.BoxGeometry(0.22, 8, 0.22); lg.translate(0, 4, 0); inst(lg, lmMat("#9aa3ad"), lamps, (a) => { mt.compose(ps.set(a.x + a.tz * 7.2, a.y - 0.6, a.z - a.tx * 7.2), q.identity(), sc.set(1, 1, 1)); });
    const hg = new T.BoxGeometry(1.6, 0.25, 0.5); inst(hg, new T.MeshBasicMaterial({ color: 0xfff1c4 }), lamps, (a) => { q.setFromAxisAngle(up, Math.atan2(-a.tz, a.tx) + Math.PI / 2); mt.compose(ps.set(a.x + a.tz * 6.5, a.y + 7.3, a.z - a.tx * 6.5), q, sc.set(1, 1, 1)); }); }
  inst(mastG, lmMat("#7d8792"), masts, (a) => { q.setFromAxisAngle(up, Math.atan2(-a.tz, a.tx)); mt.compose(ps.set(a.x - a.tz * 3.2, a.y - 0.6, a.z + a.tx * 3.2), q, sc.set(1, 1, 1)); }, true);
}
/* v18.15: landasan metro bertingkat (dek konkrit, tiang), platform di stesen bertingkat, portal ke bawah tanah */
function lmMetroBuild(g, R, pillars) {
  const S = R.st, pts = R.pts, cum = R.cum;
  R.sS = S.map((q) => { let bi = 0, bd = 1e9; pts.forEach((p, i) => { const d = Math.hypot(p.x - q.x, p.z - q.z); if (d < bd) { bd = d; bi = i; } }); return cum[bi]; });
  S.forEach((q, i) => {
    const a = lmRailAt(R, R.sS[i]); q.tx = a.tx; q.tz = a.tz; q.px = -a.tz; q.pz = a.tx; q.y = lmGround(q.x, q.z);
    if (a.ug) return;
    const pf = lmMetroPlatform(R.L); pf.position.set(a.x, a.y, a.z); pf.rotation.y = Math.atan2(-a.tz, a.tx); g.scene.add(pf);
  });
  const skip = (i) => pts[i].ug || pts[i - 1].ug;
  const conc = GEO.mtDeck || (GEO.mtDeck = lmMat("#c9c4b8"));
  const prof = R.L.mono ? [[-0.6, -1.6], [-0.6, 0], [0.6, 0], [0.6, -1.6]] : [[-2.6, -1.1], [-2.6, 0.6], [-2.3, 0.6], [-2.3, 0], [2.3, 0], [2.3, 0.6], [2.6, 0.6], [2.6, -1.1]];
  g.scene.add(Object.assign(new T.Mesh(lmSweep(pts, cum, prof, 6, skip), conc), { receiveShadow: true, castShadow: !!LM.gq }));
  if (!R.L.mono) { const rm = GEO.mtRail || (GEO.mtRail = new T.MeshStandardMaterial({ color: 0xc4c9d0, metalness: 0.7, roughness: 0.35 })); for (const o of [-0.72, 0.72]) g.scene.add(new T.Mesh(lmSweep(pts, cum, [[o - 0.1, 0], [o - 0.1, 0.22], [o + 0.1, 0.22], [o + 0.1, 0]], 4, skip), rm)); }
  for (let i = 0; i < pts.length; i += 3) { const p = pts[i]; if (p.ug) continue; const gy = lmHRaw(p.x, p.z); if (p.y - gy > 1.5) pillars.push({ x: p.x, z: p.z, y0: Math.max(gy, -16), y1: p.y - 1.1 }); }
  for (let i = 1; i < pts.length; i++) if (pts[i].ug !== pts[i - 1].ug) { const j = pts[i].ug ? i - 1 : i, a = lmRailAt(R, cum[j]), po = lmPortal(); po.scale.set(0.8, 0.7, 0.6); po.position.set(a.x, Math.max(a.y, lmGround(a.x, a.z)) - 0.6, a.z); po.rotation.y = Math.atan2(-a.tz, a.tx); g.scene.add(po); }
  R.train = lmMetroTrain(R.L); R.train.forEach((c) => g.scene.add(c));
  R.s = R.sS[0]; R.dir = 1; R.next = 1; R.wait = 3;
  lmRailPlace(R);
}
/* lebuh raya: terminal di tepi jalan, permukaan asfalt dua hala dengan penghadang tengah, lampu jalan dan bas ekspres */
function lmRoadBuild(g, R, asM, bar, pillars, lamps) {
  const S = R.st, pts = R.pts, cum = R.cum;
  R.sS = S.map((q) => { let bi = 0, bd = 1e9; pts.forEach((p, i) => { const d = Math.hypot(p.x - q.x, p.z - q.z); if (d < bd) { bd = d; bi = i; } }); return cum[bi]; });
  S.forEach((q, i) => {
    const a = lmRailAt(R, R.sS[i]), yaw = Math.atan2(-a.tz, a.tx), px = -a.tz, pz = a.tx;
    q.m.position.set(a.x, a.y - 0.2, a.z); q.m.rotation.y = yaw;
    q.x = a.x + px * 15.5; q.z = a.z + pz * 15.5; q.px = px; q.pz = pz; q.tx = a.tx; q.tz = a.tz; q.y = a.y;
    g.cols.push({ x: a.x + px * 21.5, z: a.z + pz * 21.5, r: 6.5, h: a.y + 5 });
  });
  const inTun = (i) => pts[i].tun && pts[i - 1].tun;
  g.scene.add(Object.assign(new T.Mesh(lmSweep(pts, cum, [[-6.4, -0.7], [-5.6, -0.05], [5.6, -0.05], [6.4, -0.7]], 8, inTun), asM), { receiveShadow: true }));
  g.scene.add(new T.Mesh(lmSweep(pts, cum, [[-0.3, -0.05], [-0.18, 0.75], [0.18, 0.75], [0.3, -0.05]], 8, inTun), bar));
  for (const o of [-5.9, 5.9]) g.scene.add(new T.Mesh(lmSweep(pts, cum, [[o - 0.08, -0.05], [o - 0.08, 0.6], [o + 0.08, 0.6], [o + 0.08, -0.05]], 8, inTun), bar));
  for (let s = 10; s < R.len; s += 40) { const a = lmRailAt(R, s); if (!a.tun) lamps.push(a); }
  for (let i = 0; i < pts.length; i += 3) { const p = pts[i], gy = lmHRaw(p.x, p.z); if (p.y - gy > 2.4 && !p.tun) pillars.push({ x: p.x, z: p.z, y0: Math.max(gy, -16), y1: p.y - 0.75 }); }
  for (let i = 1; i < pts.length; i++) if (pts[i].tun !== pts[i - 1].tun) { const j = pts[i].tun ? i - 1 : i, a = lmRailAt(R, cum[j]), po = lmPortal(); po.position.set(a.x, a.y - 0.75, a.z); po.rotation.y = Math.atan2(-a.tz, a.tx); g.scene.add(po); }
  R.train = lmBus(R.L); R.train.forEach((c) => g.scene.add(c));
  R.s = R.sS[0]; R.dir = 1; R.next = 1; R.wait = 3;
  lmRailPlace(R);
  /* v18.15: tiada kenderaan persendirian; trafik lebuh raya ialah bas awam dan bas ekspres syarikat lain (dua hala) */
  const BC = [{ id: "rk", col: "#d7282f" }, { id: "tr", col: "#1d5fbf" }, { id: "ks", col: "#f2a21a" }, { id: "hj", col: "#2d7d46" }, { id: "un", col: "#7a5cd6" }], n = Math.min(LM.gq ? 10 : 5, Math.max(2, Math.round(R.len / 320)));
  R.cars = [];
  for (let i = 0; i < n; i++) {
    const c = lmBus(BC[i % BC.length])[0];
    g.scene.add(c); R.cars.push({ m: c, s: Math.random() * R.len, dir: i % 2 ? 1 : -1, v: 24 + Math.random() * 10, lane: 3.2 });
  }
}
/* kedudukan dan arah pada jarak s di sepanjang laluan */
function lmRailAt(R, s) {
  const c = R.cum, P = R.pts; s = clamp(s, 0, R.len);
  let lo = 0, hi = c.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (c[m] <= s) lo = m; else hi = m; }
  const a = P[lo], b = P[hi], k = c[hi] > c[lo] ? (s - c[lo]) / (c[hi] - c[lo]) : 0, dx = b.x - a.x, dz = b.z - a.z, l = Math.hypot(dx, dz) || 1;
  return { x: a.x + dx * k, y: a.y + (b.y - a.y) * k, z: a.z + dz * k, tx: dx / l, tz: dz / l, ty: (b.y - a.y) / l, tun: !!(a.tun && b.tun), ug: !!(a.ug && b.ug) };
}
function lmRailPlace(R) {
  const cl = R.L.metro ? 8 : CAR;
  R.train.forEach((car, i) => {
    const a = lmRailAt(R, R.s - R.dir * i * cl - R.dir * cl / 2), yaw = Math.atan2(-a.tz, a.tx) + (R.dir < 0 ? Math.PI : 0) + (car.userData.back ? Math.PI : 0);
    if (R.L.road) { const fx = a.tx * R.dir, fz = a.tz * R.dir; car.position.set(a.x + fz * 2.8, a.y - 0.05, a.z - fx * 2.8); car.rotation.set(0, yaw, 0); return; } /* pandu di sebelah kiri */
    car.position.set(a.x, a.y - 0.05, a.z); car.rotation.set(0, yaw, 0);
    if (R.L.metro) car.visible = !a.ug;
  });
}
/* kereta api bergerak sendiri antara stesen (kecuali ketika dinaiki pemain) */
function lmRailTick(g, dt) {
  if (!g.rails) return;
  for (const R of g.rails) {
    if (R.cars) for (const c of R.cars) {
      c.s += c.dir * c.v * dt; if (c.s > R.len) { c.s = R.len; c.dir = -1; } else if (c.s < 0) { c.s = 0; c.dir = 1; }
      const a = lmRailAt(R, c.s), fx = a.tx * c.dir, fz = a.tz * c.dir;
      c.m.position.set(a.x + fz * c.lane, a.y - 0.05, a.z - fx * c.lane); c.m.rotation.set(0, Math.atan2(-fz, fx), 0);
    }
    if (!R.train || (g.ride && g.ride.R === R)) continue;
    if (R.wait > 0) { R.wait -= dt; continue; }
    const tgt = R.sS[R.next], d = tgt - R.s, v = Math.min(R.L.road ? 36 : R.L.metro ? 34 : 60, 8 + Math.abs(d) * 0.5);
    if (Math.abs(d) < 0.6) {
      R.s = tgt; R.wait = 7;
      if (R.next === R.sS.length - 1) R.dir = -1; else if (R.next === 0) R.dir = 1;
      R.next += R.dir;
    } else R.s += Math.sign(d) * Math.min(Math.abs(d), v * dt);
    lmRailPlace(R);
  }
}
/* ---------- tiket dan perjalanan kereta api sinematik ---------- */
const RAIL_TXT = {
  ets: "ETS (Electric Train Service) menghubungkan Kuala Lumpur ke utara Semenanjung hingga Padang Besar.",
  ecrl: "ECRL (East Coast Rail Link) menghubungkan Lembah Klang ke Pantai Timur hingga Kota Bharu.",
  plus: "Lebuhraya Utara-Selatan (PLUS) sepanjang lebih 770 km menghubungkan Bukit Kayu Hitam di sempadan Thailand hingga Johor Bahru.",
  lpt: "Lebuhraya Pantai Timur (LPT) menghubungkan Lembah Klang ke Kuantan dan Kuala Terengganu melalui Karak.",
  pbsw: "Lebuhraya Pan Borneo merentasi Sarawak dari Kuching hingga Miri.",
  pbsb: "Lebuhraya Pan Borneo di Sabah menghubungkan Lawas, Kota Kinabalu, Ranau hingga Sandakan.",
  kmsr: "KTM Komuter Laluan Seremban menghubungkan KL Sentral ke Kajang, Bangi (UKM), Nilai (USIM) dan Seremban.",
  kmpk: "KTM Komuter Laluan Pelabuhan Klang menghubungkan KL Sentral ke Subang Jaya, Shah Alam (UiTM), Klang dan Pelabuhan Klang.",
  erl: "KLIA Ekspres dan KLIA Transit menghubungkan KL Sentral ke Putrajaya, Cyberjaya dan Lapangan Terbang Antarabangsa Kuala Lumpur.",
  ktms: "Keretapi Negeri Sabah ialah satu-satunya laluan kereta api di Borneo, dari Tanjung Aru (Kota Kinabalu) ke Beaufort dan Tenom.",
  lrtkj: "LRT Laluan Kelana Jaya merentasi KL dari Gombak ke Putra Heights; di tengah bandar ia bergerak di bawah tanah. Stesen Universiti berhampiran Universiti Malaya.",
  lrtam: "LRT Laluan Ampang menghubungkan Sentul Timur ke Ampang melalui Masjid Jamek dan Hang Tuah.",
  lrtsp: "LRT Laluan Sri Petaling menghubungkan Chan Sow Lin ke Bukit Jalil, Puchong dan Putra Heights.",
  mrtkg: "MRT Laluan Kajang dari Kwasa Damansara ke Kajang; dari Muzium Negara hingga Maluri ia bergerak di bawah tanah.",
  mrtpy: "MRT Laluan Putrajaya dari Kwasa Damansara ke Putrajaya Sentral, melalui KLCC (bawah tanah) dan stesen UPM.",
  mono: "Monorel KL bergerak di atas satu rasuk konkrit dari KL Sentral ke Bukit Bintang dan Titiwangsa."
};
/* v18.12: ETS, ECRL dan bas ekspres memerlukan tiket: lulus kuiz ringkas (v18.16: 3 daripada 5 betul) setiap kali menaiki */
function lmRailOpen(st, chosen) {
  if (!chosen && st.hub && st.hub.lines.length > 1) {
    lmCard((b) => {
      b.append(el("div", { class: "lm-kick" }, "🔀 Stesen pertukaran"), el("h2", null, st.nm), el("p", null, "Pilih laluan yang hendak dinaiki:"));
      const row = el("div", { class: "lm-grid" });
      st.hub.lines.forEach((q) => { const R = q.line, a = R.st[0], z = R.st[R.st.length - 1]; const bt = lmBtn(lmIc(R.L) + " " + R.L.n + " (" + a.nm + " ↔ " + z.nm + ")", "", () => { lmCardClose(); lmRailOpen(q, true); }); bt.style.borderLeft = "6px solid " + R.L.col; row.appendChild(bt); });
      b.append(row, el("div", { class: "lm-row" }, lmBtn("Nanti dulu", "pri", lmCardClose)));
    });
    return;
  }
  const L = st.line.L;
  if (L.tap) {
    lmQuiz({
      kick: "💳 Tap kad · " + L.n, title: "Jawab untuk masuk", pass: 1, qs: lmPickQs([], 1), noRai: true,
      intro: (b) => { b.append(el("div", { class: "lm-kick" }, lmIc(L) + " " + L.nm + " · " + st.n), el("h2", null, "Tap kad di pintu masuk"), el("p", null, RAIL_TXT[L.id] || ""), el("p", null, "Jawab 1 soalan dengan betul untuk membuka pintu masuk.")); },
      onDone: (pass) => { if (pass) { lmPop("Pintu dibuka. Selamat jalan!"); lmRailPick(st); } else lmCard((b) => { b.append(el("div", { class: "lm-kick" }, "Pintu belum dibuka"), el("h2", null, "Jawapan belum tepat"), el("p", null, "Cuba soalan lain untuk masuk.")); b.append(el("div", { class: "lm-row" }, lmBtn("Cuba lagi", "pri", () => lmRailOpen(st, true)), lmBtn("Nanti dulu", "", lmCardClose))); }); }
    });
    return;
  }
  if (!L.quiz) return lmRailPick(st);
  lmQuiz({
    kick: (L.road ? "🚌 Tiket bas " : lmIc(L) + " Tiket ") + L.n, title: "Jawab untuk dapatkan tiket", pass: 3, qs: lmPickQs([], 5),
    intro: (b) => { b.append(el("div", { class: "lm-kick" }, lmIc(L) + " " + L.nm + " · " + st.n), el("h2", null, "Tiket perjalanan"), el("p", null, RAIL_TXT[L.id] || ""), el("p", null, "Jawab 5 soalan. Betul sekurang-kurangnya 3 untuk mendapat tiket " + (L.road ? "bas ekspres." : L.n + "."))); },
    onDone: (pass, ok, tot) => {
      if (pass) { lmPop("Tiket diperoleh! (" + ok + "/" + tot + ")"); lmRailPick(st); }
      else lmCard((b) => { b.append(el("div", { class: "lm-kick" }, "Tiket belum diperoleh"), el("h2", null, ok + "/" + tot + " betul"), el("p", null, "Betul sekurang-kurangnya 3 untuk mendapat tiket. Cuba lagi.")); b.append(el("div", { class: "lm-row" }, lmBtn("Cuba lagi", "pri", () => lmRailOpen(st)), lmBtn("Nanti dulu", "", lmCardClose))); });
    }
  });
}
function lmRailPick(st) {
  const R = st.line, L = R.L, here = st.i;
  lmCard((b) => {
    b.append(el("div", { class: "lm-kick" }, lmIc(L) + " " + L.nm + " · " + st.n), el("h2", null, "Pilih destinasi"));
    b.append(el("p", null, RAIL_TXT[L.id] || ""));
    const grid = el("div", { class: "lm-grid" });
    R.st.forEach((q, i) => {
      if (i === here) return;
      const km = Math.max(1, Math.round(lmRailKm(R, R.sS[here], R.sS[i])));
      const bt = lmBtn((i < here ? "◀ " : "▶ ") + q.nm + " · " + km + " km", "", () => { lmCardClose(); lmRide(st, q); });
      grid.appendChild(bt);
    });
    b.append(grid, el("div", { class: "lm-row" }, lmBtn("Nanti dulu", "pri", lmCardClose)));
  });
}
function lmRide(a, b) {
  const g = LM.g; if (!g || g.flight || g.sail || g.ride) return;
  const R = a.line, s0 = R.sS[a.i], s1 = R.sS[b.i], dir = s1 > s0 ? 1 : -1;
  R.dir = dir; R.s = s0; R.wait = 0; lmRailPlace(R);
  g.ride = { R: R, a: a, b: b, s0: s0, s1: s1, dir: dir, t: -1.6, dur: R.L.metro ? clamp(Math.abs(s1 - s0) / 45, 5, 16) : clamp(Math.abs(s1 - s0) / (R.L.road ? 110 : 130), 7, 28), v: 0 };
  if (R.L.road) LM.st.rb = (LM.st.rb | 0) + 1; else if (R.L.metro) LM.st.rm = (LM.st.rm | 0) + 1; else LM.st.rt = (LM.st.rt | 0) + 1; lmSave();
  g.ui = true; g.me.g.visible = false; if (g.sky5) g.sky5.sp.visible = false;
  lmChime(); lmPop(R.L.road ? "Sila naik bas ekspres" : "Sila naik ke dalam " + R.L.n + (R.L.metro ? ". Berdiri di belakang garisan kuning." : "")); lmRideHud(true);
}
function lmRideHud(on) {
  let h = LM.ui.rd; if (!on) { if (h) h.remove(); LM.ui.rd = null; return; }
  const r = LM.g.ride; h = el("div", { class: "lm-fl" }); LM.ui.rd = h; LM.root.appendChild(h);
  h.append(el("b", null, lmIc(r.R.L) + " " + r.R.L.n + " · " + r.a.nm + " → " + r.b.nm), el("span", { class: "lm-fl-st" }, r.R.L.road ? "Menaiki bas ekspres..." : "Menaiki kereta api..."), el("div", { class: "lm-bar" }, el("i")), lmBtn("Langkau", "", () => { const x = LM.g && LM.g.ride; if (x) x.t = x.dur; }));
}
function lmRideTick(g, dt) {
  const r = g.ride, R = r.R; r.t += dt;
  const k = clamp(r.t / r.dur, 0, 1), e = k * k * (3 - 2 * k), sPrev = R.s;
  R.s = r.s0 + (r.s1 - r.s0) * e; R.dir = r.dir; lmRailPlace(R);
  r.v = dt > 0 ? Math.abs(R.s - sPrev) / dt : 0;
  const a = lmRailAt(R, R.s), fx = a.tx * r.dir, fz = a.tz * r.dir, px = -fz, pz = fx;
  g.p.x = a.x; g.p.z = a.z; g.p.y = a.y; g.p.moving = false;
  /* kamera mengekori dari belakang sisi, sentiasa di atas bukit */
  const cam = g.camera, wx = a.x + px * 10 - fx * 34, wz = a.z + pz * 10 - fz * 34, want = new T.Vector3(wx, Math.max(a.y + 13, lmGround(wx, wz) + 6), wz);
  cam.position.lerp(want, r.t < 0.6 ? Math.min(1, dt * 2.5) : 1); { const gy = Math.max(lmGround(cam.position.x, cam.position.z), 0.2) + 4; if (cam.position.y < gy) cam.position.y = gy; }
  cam.lookAt(a.x + fx * 6, a.y + 2.5, a.z + fz * 6);
  if (g.dome) g.dome.position.copy(cam.position);
  if (g.sun) { const sd = g.sunDir || new T.Vector3(0.45, 0.8, 0.3); g.sun.position.set(a.x + sd.x * 150, a.y + sd.y * 150, a.z + sd.z * 150); g.sun.target.position.set(a.x, a.y, a.z); g.sun.target.updateMatrixWorld(); }
  const h = LM.ui.rd;
  if (h) { const st = h.querySelector(".lm-fl-st"), kmh = Math.round(20 + (R.L.road ? 90 : R.L.metro ? 60 : 140) * Math.sin(k * Math.PI)), txt = r.t < 0 ? "Pintu ditutup..." : k < 1 ? (a.ug ? "Di bawah tanah · " : a.tun ? "Melalui terowong · " : "Kelajuan ") + kmh + " km/j" : "Tiba di " + r.b.nm; if (st.textContent !== txt) st.textContent = txt; h.querySelector(".lm-bar i").style.width = Math.round(k * 100) + "%"; }
  if (k >= 1 && !r.end) { r.end = true; lmChime(); setTimeout(() => lmRideEnd(g), 600); }
}
function lmRideEnd(g) {
  const r = g.ride; if (!r) return;
  const f = LM.ui.fade; if (f) f.style.opacity = "1";
  setTimeout(() => {
    if (!LM.g) return;
    const d = r.b, R = r.R; g.ride = null; g.ui = false; g.me.g.visible = true; lmRideHud(false); if (g.sky5) g.sky5.sp.visible = LM.st.sky !== 0;
    R.s = r.s1; R.wait = 6; R.next = clamp(d.i + R.dir, 0, R.sS.length - 1); if (R.next === d.i) { R.dir = -R.dir; R.next = clamp(d.i + R.dir, 0, R.sS.length - 1); }
    /* turun di hujung platform, menghadap stesen */
    const ex = R.L.metro ? d.x + d.px * 5 : d.x + d.tx * 21 + d.px * 2, ez = R.L.metro ? d.z + d.pz * 5 : d.z + d.tz * 21 + d.pz * 2, ok = lmCanStand(ex, ez);
    g.p.x = ok ? ex : d.x; g.p.z = ok ? ez : d.z; g.p.y = lmGround(g.p.x, g.p.z); g.p.vx = g.p.vz = g.p.vy = 0;
    g.p.yaw = Math.atan2(-d.tx, -d.tz); g.cam.yaw = Math.atan2(d.tx + d.px * 0.6, d.tz + d.pz * 0.6);
    g.camera.position.set(g.p.x + Math.sin(g.cam.yaw) * 18, g.p.y + 9, g.p.z + Math.cos(g.cam.yaw) * 18);
    if (f) f.style.opacity = "0";
    lmPop("Selamat tiba di " + d.nm + "!");
  }, 420);
}
/* ---------- v18.2: berenang di pantai ----------
   Laut berhampiran pantai (dalam SWIM_MAX unit dari darat) boleh direnangi. Avatar terapung di permukaan:
   kuak rangkak semasa bergerak, kayuh air semasa diam. */
const SWIM_MAX = 40; /* ~6.5 km dari pantai (6 unit = 1 km) */
function lmSwimOk(x, z) {
  if (lmCanStand(x, z) || lmAt(x, z) === "jambatan" || !TER.dOut) return false;
  const xi = Math.round((x - TER.x0) / TER.cs), zi = Math.round((z - TER.z0) / TER.cs);
  if (xi < 0 || zi < 0 || xi >= TER.nx || zi >= TER.nz) return false;
  const ci = zi * TER.nx + xi; if (!TER.land[ci]) return TER.dOut[ci] < SWIM_MAX;
  /* gigi air, muara dan sungai lebih sempit daripada grid: permukaan tanah di bawah paras berdiri = air */
  return !TER.fg[ci] && lmHRaw(x, z) <= 0.1;
}
const lmCanGo = (x, z) => lmCanStand(x, z) || lmSwimOk(x, z);

/* ---------- v18.2: keraian selepas kuiz (dipilih di Gudang, slot Keraian) ---------- */
const RAI_TXT = { rc_tp: "Yeay!", rc_sj: "Alhamdulillah", rc_ab: "Alhamdulillah!", rc_lg: "Yahoo!", rc_tr: "Seronoknya!", rc_si: "SIUUU!" };
function lmRaiKind() { try { return zvEqAll(zvState()).rc || "rc_tp"; } catch (e) { return "rc_tp"; } }
function lmRai() {
  const g = LM.g; if (!g || g.flight || g.sail || g.ride || g.p.swim || !window.AV3 || !AV3.rai) return 0;
  const k = lmRaiKind(), d = AV3.rai(g.me, k); if (!d) return 0;
  g.rai = { t: d }; lmBubble(g.me, RAI_TXT[k] || "Alhamdulillah"); g.me.bubT = d;
  LM.rn = (LM.rn | 0) + 1;
  if (LM.room) { try { const x = LM.room.presence({ rc: k, rn: LM.rn }); if (x && x.catch) x.catch(() => {}); } catch (e) { /* abaikan */ } }
  lmSnd("win");
  return d;
}

/* ---------- v18.7: IPTA sebagai Pusat Kuiz ----------
   20 universiti awam di kampus utama masing-masing (v18.17: galeri Kembara Kampus; tajuk di Stesen Ilmu);
   tajuk yang lulus (betul 3/5) dikira untuk IPTA itu: Diploma (3 tajuk), Ijazah (separuh), Sarjana (semua). */
const LM_TOWERS = false;
const IPTA = [
  ["ip-um", "UM", "Universiti Malaya", "wp", 3.1209, 101.6538, "#1f3f8a"],
  ["ip-usm", "USM", "Universiti Sains Malaysia", "penang", 5.3560, 100.3020, "#5b2a86"],
  ["ip-ukm", "UKM", "Universiti Kebangsaan Malaysia", "selangor", 2.9300, 101.7810, "#c8102e"],
  ["ip-upm", "UPM", "Universiti Putra Malaysia", "selangor", 3.0026, 101.7070, "#a6192e"],
  ["ip-utm", "UTM", "Universiti Teknologi Malaysia", "johor", 1.5590, 103.6380, "#7a1a2f"],
  ["ip-uiam", "UIAM", "Universiti Islam Antarabangsa Malaysia", "selangor", 3.2510, 101.7350, "#0a7d6a"],
  ["ip-uum", "UUM", "Universiti Utara Malaysia", "kedah", 6.4570, 100.5050, "#0b6b3a"],
  ["ip-unimas", "UNIMAS", "Universiti Malaysia Sarawak", "sarawak", 1.4660, 110.4290, "#1d4f9a"],
  ["ip-ums", "UMS", "Universiti Malaysia Sabah", "sabah", 6.0330, 116.1220, "#1a5fa8"],
  ["ip-upsi", "UPSI", "Universiti Pendidikan Sultan Idris", "perak", 3.6870, 101.5240, "#13306b"],
  ["ip-usim", "USIM", "Universiti Sains Islam Malaysia", "nsembilan", 2.8430, 101.7800, "#0b6b3a"],
  ["ip-uitm", "UiTM", "Universiti Teknologi MARA", "selangor", 3.0690, 101.4970, "#5f259f"],
  ["ip-unisza", "UniSZA", "Universiti Sultan Zainal Abidin", "terengganu", 5.3960, 103.0830, "#1b7a3e"],
  ["ip-uthm", "UTHM", "Universiti Tun Hussein Onn Malaysia", "johor", 1.8580, 103.0850, "#003b7a"],
  ["ip-utem", "UTeM", "Universiti Teknikal Malaysia Melaka", "melaka", 2.3130, 102.3180, "#0057a3"],
  ["ip-umpsa", "UMPSA", "Universiti Malaysia Pahang Al-Sultan Abdullah", "pahang", 3.5430, 103.4280, "#00539b"],
  ["ip-unimap", "UniMAP", "Universiti Malaysia Perlis", "perlis", 6.4590, 100.3500, "#b3242f"],
  ["ip-umt", "UMT", "Universiti Malaysia Terengganu", "terengganu", 5.4100, 103.0870, "#0b6fa4"],
  ["ip-umk", "UMK", "Universiti Malaysia Kelantan", "kelantan", 6.1640, 102.2830, "#e07a10"],
  ["ip-upnm", "UPNM", "Universiti Pertahanan Nasional Malaysia", "wp", 3.0510, 101.7240, "#7a1f2b"]
];
/* kampus: dewan utama bermenara jam, dua sayap fakulti, pintu gerbang dan topi graduan */
function lmCampus(col, sn) {
  const g = new T.Group(), W = "#f2ede2";
  g.add(lmMesh(lmCyl(17, 17, 0.25, 32), "#7cc46a", 0, 0.12, 0, { ns: 1 }));
  g.add(lmMesh(lmBox(16, 7, 8), W, 0, 3.5, -4)); g.add(lmMesh(lmBox(16.6, 0.8, 8.6), col, 0, 7.3, -4));
  for (let i = 0; i < 6; i++) g.add(lmMesh(lmBox(1.4, 4.4, 0.2), "#2b3440", -6.5 + i * 2.6, 3.4, 0.05));
  for (const x of [-11.5, 11.5]) { g.add(lmMesh(lmBox(6, 5, 12), W, x, 2.5, -2)); g.add(lmMesh(lmBox(6.4, 0.7, 12.4), col, x, 5.3, -2)); }
  g.add(lmMesh(lmBox(4, 16, 4), W, 0, 8, -4)); g.add(lmMesh(lmBox(4.4, 1.2, 4.4), col, 0, 16.2, -4));
  const clock = lmMesh(lmCyl(1.3, 1.3, 0.3, 20), "#fffbe8", 0, 13.2, -1.9); clock.rotation.x = Math.PI / 2; g.add(clock);
  lmDome(g, 2.2, col, 0, 16.8, -4, false, false);
  /* topi graduan di puncak menara */
  g.add(lmMesh(lmBox(4.2, 0.35, 4.2), "#1d1d22", 0, 19.4, -4)); g.add(lmMesh(lmCyl(1.1, 1.3, 0.9, 12), "#1d1d22", 0, 18.9, -4));
  g.add(lmMesh(lmBox(0.12, 1.6, 0.12), "#e0b341", 1.9, 18.6, -2.2));
  /* pintu gerbang dengan nama */
  for (const x of [-5, 5]) g.add(lmMesh(lmBox(1.2, 6, 1.2), col, x, 3, 12));
  g.add(lmMesh(lmBox(11.4, 1.6, 1.2), col, 0, 6.6, 12));
  const sign = lmLabel(sn, { fs: 40, k: 0.04, bg: "rgba(0,0,0,0)", fg: "#ffffff" }); sign.position.set(0, 6.6, 12.8); g.add(sign);
  return { g: g, r: 15 };
}
function lmIptaBuild(g, used, placed, avoid, gnd) {
  IPTA.forEach(([id, sn, nama, k, la, lo, col]) => {
    if (!DATA.negeri[k]) return;
    const okK = (q) => q === k || (k === "wp" && q === "selangor") || (k === "selangor" && q === "wp"), rr = 18;
    const free = (x, z) => okK(lmAt(x, z)) && lmLandW(x + rr, z) && lmLandW(x - rr, z) && lmLandW(x, z + rr) && lmLandW(x, z - rr)
      && !used.some((u) => Math.hypot(u.x - x, u.z - z) < rr + 8) && !placed.some((u) => Math.hypot(u.x - x, u.z - z) < rr + u.r + 22) && !avoid.some((a) => Math.hypot(a.x - x, a.z - z) < a.r + rr);
    let w = ll(la, lo);
    if (!free(w.x, w.z)) { let best = null; for (let d = 5; d <= 90 && !best; d += 5) for (let i = 0; i < 16; i++) { const a = i * 0.3927 + d * 0.11, x = w.x + Math.cos(a) * d, z = w.z + Math.sin(a) * d; if (free(x, z)) { best = { x: x, z: z }; break; } } if (best) w = best; }
    const md = lmCampus(col, sn), rot = (Math.abs(hashStr(id)) % 628) / 100;
    md.g.position.set(w.x, 0, w.z); md.g.rotation.y = rot; g.scene.add(md.g); gnd.push([md.g, 0]); lmPad(g, w.x, w.z, 17);
    const lb = lmLabel(sn + " · " + nama, { fs: 30, k: 0.032, bg: "rgba(20,20,40,.82)", bd: col }); lb.position.set(w.x, 24, w.z); g.scene.add(lb); gnd.push([lb, 24]);
    const fx = Math.sin(rot), fz = Math.cos(rot);
    const it = { kind: "ip", id: id, k: k, sn: sn, n: nama, col: col, x: w.x + fx * 13, z: w.z + fz * 13, cx: w.x, cz: w.z, r: 0, ir: 12, m: md.g, lb: lb };
    g.items.push(it); placed.push({ x: w.x, z: w.z, r: rr });
    const cr = Math.cos(rot), sr = Math.sin(rot), at = (lx, lz) => ({ x: w.x + lx * cr + lz * sr, z: w.z - lx * sr + lz * cr });
    [[0, -4, 8.5], [-11.5, -2, 6.5], [11.5, -2, 6.5]].forEach(([lx, lz, r]) => { const q = at(lx, lz); g.cols.push({ x: q.x, z: q.z, r: r, h: 20 }); });
    avoid.push({ x: w.x, z: w.z, r: rr + 2 });
  });
}
/* v18.17: STESEN ILMU. Setiap tajuk dipegang oleh institusi sebenar yang berkait dengan tajuk itu (contoh: Sistem
   Kewangan Islam di Tabung Haji, Sistem Pemerintahan di Parlimen). Universiti kini galeri IPT (Kembara Kampus).
   [id, negeri, nama, lat, lon, warna]; susunan senarai = susunan perjalanan utara -> selatan -> Borneo */
const SILMU = [
  ["si-alwi", "perlis", "Masjid Alwi Kangar", 6.4410, 100.1970, "#2e7d4f"],
  ["si-zahir", "kedah", "Masjid Zahir", 6.1215, 100.3672, "#1f6e43"],
  ["si-kapitan", "penang", "Masjid Kapitan Keling", 5.4167, 100.3378, "#a0522d"],
  ["si-ubudiah", "perak", "Masjid Ubudiah", 4.7795, 100.9580, "#b8902c"],
  ["si-mskb", "kelantan", "Mahkamah Syariah Kelantan", 6.1230, 102.2420, "#6b4b2a"],
  ["si-terapung", "terengganu", "Masjid Tengku Tengah Zaharah", 5.2735, 103.1648, "#2a7fb8"],
  ["si-kuantan", "pahang", "Masjid Sultan Ahmad Shah", 3.8077, 103.3260, "#1f6e43"],
  ["si-biru", "selangor", "Masjid Sultan Salahuddin Abdul Aziz Shah", 3.0784, 101.5203, "#1d4f9a"],
  ["si-ikim", "wp", "Institut Kefahaman Islam Malaysia (IKIM)", 3.1660, 101.6870, "#0b4a4a"],
  ["si-istbudaya", "wp", "Istana Budaya", 3.1720, 101.7060, "#8c1d2c"],
  ["si-parlimen", "wp", "Parlimen Malaysia", 3.1527, 101.6828, "#0f1f45"],
  ["si-negara", "wp", "Masjid Negara", 3.1418, 101.6918, "#1f6e8a"],
  ["si-mkim", "wp", "Muzium Kesenian Islam Malaysia", 3.1414, 101.6893, "#7a5cd6"],
  ["si-bursa", "wp", "Bursa Malaysia", 3.1488, 101.6997, "#c8102e"],
  ["si-th", "wp", "Lembaga Tabung Haji", 3.1600, 101.7200, "#1b7a3e"],
  ["si-jakim", "wp", "Kompleks Islam Putrajaya (JAKIM)", 2.9363, 101.6890, "#0b6b3a"],
  ["si-ik", "wp", "Istana Kehakiman", 2.9440, 101.6960, "#5b2a86"],
  ["si-ns", "nsembilan", "Masjid Negeri Seremban", 2.7270, 101.9390, "#2e7d4f"],
  ["si-selat", "melaka", "Masjid Selat Melaka", 2.1844, 102.2470, "#2a7fb8"],
  ["si-abubakar", "johor", "Masjid Sultan Abu Bakar", 1.4570, 103.7470, "#b8902c"],
  ["si-kuching", "sarawak", "Masjid Bandaraya Kuching", 1.5560, 110.3430, "#1d4f9a"],
  ["si-kk", "sabah", "Masjid Bandaraya Kota Kinabalu", 5.9945, 116.1030, "#1f6e8a"]
];
/* tajuk Tasawwur Islam -> stesen yang paling berkait; subjek lain diagihkan mengikut susunan perjalanan */
const SILMU_TOPIK = { tw: {
  "T4-1.1": "si-negara", "T4-1.2": "si-biru", "T4-1.3": "si-zahir", "T4-1.4": "si-kapitan", "T4-1.5": "si-ubudiah",
  "T4-2.1": "si-terapung", "T4-2.2": "si-kuantan", "T4-2.3": "si-ikim", "T4-3.1": "si-abubakar", "T4-3.2": "si-alwi",
  "T4-3.3": "si-kk", "T4-3.4": "si-istbudaya", "T4-3.5": "si-mkim", "T5-1.1": "si-bursa", "T5-1.2": "si-th",
  "T5-2.1": "si-ik", "T5-2.2": "si-mskb", "T5-3.1": "si-jakim", "T5-3.2": "si-parlimen" } };
/* pavilion Stesen Ilmu: lantai bulat, empat tiang, bumbung berkubah, rehal dengan kitab terbuka */
function lmIlmuModel(col) {
  const g = new T.Group();
  g.add(lmMesh(lmCyl(10, 10, 0.25, 28), "#e8e2d4", 0, 0.12, 0, { ns: 1 }));
  for (const [x, z] of [[-4.6, -3.6], [4.6, -3.6], [-4.6, 3.6], [4.6, 3.6]]) g.add(lmMesh(lmBox(0.8, 6, 0.8), "#f4efe4", x, 3, z));
  g.add(lmMesh(lmBox(11, 0.8, 9), col, 0, 6.4, 0)); g.add(lmMesh(lmBox(11.4, 0.25, 9.4), "#d9b44a", 0, 6.9, 0));
  lmDome(g, 2.6, "#d9b44a", 0, 7, 0, false, true);
  g.add(lmMesh(lmBox(1.6, 1.1, 0.9), "#8a5a34", 0, 0.75, 1.2));
  for (const sx of [-1, 1]) { const pg = lmMesh(lmBox(0.75, 0.06, 1), "#fffbe8", sx * 0.4, 1.4, 1.2); pg.rotation.z = sx * 0.25; g.add(pg); }
  return g;
}
function lmIlmuBuild(g, used, placed, avoid, gnd) {
  SILMU.forEach(([id, k, nama, la, lo, col]) => {
    if (!DATA.negeri[k]) return;
    const okK = (q) => q === k || (k === "wp" && q === "selangor") || (k === "selangor" && q === "wp"), rr = 11;
    const free = (x, z) => okK(lmAt(x, z)) && lmLandW(x + rr, z) && lmLandW(x - rr, z) && lmLandW(x, z + rr) && lmLandW(x, z - rr)
      && !used.some((u) => Math.hypot(u.x - x, u.z - z) < rr + 8) && !placed.some((u) => Math.hypot(u.x - x, u.z - z) < rr + u.r + 8) && !avoid.some((a) => Math.hypot(a.x - x, a.z - z) < a.r + rr)
      && !g.items.some((it) => Math.hypot(it.x - x, it.z - z) < 16);
    let w = ll(la, lo);
    if (!free(w.x, w.z)) { let best = null; for (let d = 6; d <= 120 && !best; d += 6) for (let i = 0; i < 16; i++) { const a = i * 0.3927 + d * 0.13, x = w.x + Math.cos(a) * d, z = w.z + Math.sin(a) * d; if (free(x, z)) { best = { x: x, z: z }; break; } } if (best) w = best; }
    const md = lmIlmuModel(col), rot = (Math.abs(hashStr(id)) % 628) / 100;
    md.position.set(w.x, 0, w.z); md.rotation.y = rot; g.scene.add(md); gnd.push([md, 0]); lmPad(g, w.x, w.z, 10);
    const lb = lmLabel("📖 Stesen Ilmu · " + nama, { fs: 28, k: 0.03, bg: "rgba(11,74,74,.88)", bd: "#ffd45a" }); lb.position.set(w.x, 13, w.z); g.scene.add(lb); gnd.push([lb, 13]);
    const fx = Math.sin(rot), fz = Math.cos(rot);
    g.items.push({ kind: "si", id: id, k: k, sn: nama, n: nama, col: col, x: w.x + fx * 5, z: w.z + fz * 5, cx: w.x, cz: w.z, r: 0, ir: 10, m: md, lb: lb, tids: [] });
    placed.push({ x: w.x, z: w.z, r: rr }); avoid.push({ x: w.x, z: w.z, r: rr + 2 });
    const cr = Math.cos(rot), sr = Math.sin(rot);
    for (const [lx, lz] of [[-4.6, -3.6], [4.6, -3.6], [-4.6, 3.6], [4.6, 3.6]]) g.cols.push({ x: w.x + lx * cr + lz * sr, z: w.z - lx * sr + lz * cr, r: 0.7, h: 6 });
  });
}
function lmIlmuAssign(g) {
  const sts = SILMU.map(([id]) => g.items.find((x) => x.kind === "si" && x.id === id)).filter(Boolean), map = SILMU_TOPIK[SUBJ], ts = DATA.topik.slice();
  if (map) {
    const left = [];
    ts.forEach((t) => { const it = sts.find((x) => x.id === map[t.id]); if (it) it.tids.push(t.id); else left.push(t.id); });
    left.forEach((tid, i) => { const free = sts.filter((x) => !x.tids.length); (free.length ? free[i % free.length] : sts[i % sts.length]).tids.push(tid); });
  } else ts.forEach((t, j) => sts[j % sts.length].tids.push(t.id));
  let no = 0;
  sts.forEach((it) => { if (it.tids.length) it.no = ++no; it.t = it.tids.length ? TOPIK[it.tids[0]] : null; lmIlmuState(it); });
  g.ilmu = sts;
}
const lmTopicDone = (tid) => (LM.st.tw[tid] | 0) >= 3;
function lmIlmuState(it) { it.done = !!it.tids && it.tids.length > 0 && it.tids.every(lmTopicDone); if (it.lb) it.lb.material.opacity = 1; }
function lmIlmuFor(tid) { const g = LM.g; return g && g.ilmu ? g.ilmu.find((it) => it.tids.indexOf(tid) >= 0) : null; }
function lmJourney() { const g = LM.g, its = (g && g.ilmu) || [], act = its.filter((it) => it.tids.length); return { d: act.filter((it) => it.done).length, t: act.length, next: act.find((it) => !it.done) || null }; }
function lmIlmuOpen(it) {
  if (!it.tids.length) { lmIlmuReview(it); return; }
  if (it.tids.length === 1) { lmIlmuTopic(it, it.t); return; }
  lmCard((b) => {
    b.append(el("div", { class: "lm-kick" }, "📖 Stesen Ilmu ke-" + it.no + " · " + DATA.negeri[it.k].pendek), el("h2", null, it.n));
    b.append(el("p", null, "Stesen ini memegang " + it.tids.length + " tajuk. Pilih satu untuk dijawab."));
    it.tids.forEach((tid) => { const t = TOPIK[tid]; b.append(el("div", { class: "lm-row" }, lmBtn((lmTopicDone(tid) ? "✔ " : "") + (t.kod || t.id) + " " + t.nama, lmTopicDone(tid) ? "" : "pri", () => lmIlmuTopic(it, t)))); });
    b.append(el("div", { class: "lm-row" }, lmBtn("Tutup", "", lmCardClose)));
  });
}
function lmIlmuTopic(it, t) {
  const best = LM.st.tw[t.id] | 0, tm = TEMA[t.tema] || { nama: "" };
  lmQuiz({
    kick: "📖 " + it.sn + " · " + tm.nama, title: (t.kod || t.id) + " " + t.nama, pass: 3, qs: lmPickQs([t.id], 5),
    intro: (b) => {
      b.append(el("div", { class: "lm-kick" }, "📖 Stesen Ilmu ke-" + it.no + " · " + DATA.negeri[it.k].pendek), el("h2", null, it.n));
      b.append(el("p", null, "Tema: " + tm.nama + " · Tajuk: " + (t.kod || t.id) + " " + t.nama));
      if (t.dskp) b.append(el("p", { class: "lm-ex" }, t.dskp));
      (t.nota || []).slice(0, 3).forEach((n) => b.appendChild(qSet(el("div", { class: "lm-ex" }), n)));
      b.append(el("p", null, "Jawab 5 soalan. Betul sekurang-kurangnya 3 untuk lulus tajuk ini dan mendapat cop " + it.sn + " dalam pasport." + (best ? " Markah terbaik anda: " + best + "/5." : "")));
    },
    onDone: (pass, ok, tot) => {
      const first = pass && best < 3;
      if (ok > best) LM.st.tw[t.id] = ok;
      { const tt = LM.st.tt || (LM.st.tt = {}), r = tt[t.id] || (tt[t.id] = { n: 0, t: 0 }); r.n++; r.t = Date.now(); r.l = ok; }
      lmSave(); const was = it.done; lmIlmuState(it);
      const J = lmJourney(), fin = first && J.d === J.t;
      const xp = lmXp(ok * 3 + (first ? 10 : 0) + (fin ? 50 : 0)); let coin = 0;
      if (it.done && !was) { try { coin = gdCoin(fin ? 20 : 2); } catch (e) { coin = 0; } }
      if (pass) { lmSnd("win"); lmPop(fin ? "🎓 Perjalanan ilmu tamat!" : first ? "Cop " + it.sn + "!" : "Tahniah!"); }
      lmCard((b) => {
        b.append(el("div", { class: "lm-kick" }, fin ? "🎓 Graduasi" : pass ? "Tajuk lulus · " + it.sn : "Cuba lagi"), el("h2", null, fin ? "Tahniah, anda telah menamatkan perjalanan menuntut ilmu!" : ok + "/" + tot + " betul"));
        b.append(el("p", null, pass ? "Pasport misi: " + J.d + "/" + J.t + " Stesen Ilmu." + (J.next ? " Stesen seterusnya: " + J.next.sn + " (" + DATA.negeri[J.next.k].pendek + ")." : "") : "Betul sekurang-kurangnya 3 untuk lulus. Baca nota dan cuba lagi."));
        b.append(el("p", { class: "lm-ex" }, "XP +" + xp + (coin ? " · +" + coin + " syiling" : "")));
        const row = el("div", { class: "lm-row" });
        if (pass && J.next) row.append(lmBtn("Tunjuk arah ke " + J.next.sn, "pri", () => { LM.g.wp = { x: J.next.x, z: J.next.z, n: J.next.sn }; lmWpSet(); lmCardClose(); }));
        if (!pass) row.append(lmBtn("Cuba lagi", "pri", () => lmIlmuTopic(it, t)));
        if (fin) row.append(lmBtn("📜 Sijil META DIDIK", "pri", lmCertGet));
        row.append(lmBtn("Teruskan jelajah", pass && J.next ? "" : "pri", lmCardClose));
        b.append(row);
      });
    }
  });
}
/* stesen tanpa tajuk (subjek dengan tajuk kurang daripada bilangan stesen): pusat ulangkaji pilihan */
function lmIlmuReview(it) {
  lmQuiz({
    kick: "📖 " + it.sn + " · Pusat Ulangkaji", title: it.n, pass: 3, qs: lmPickQs(DATA.topik.map((t) => t.id), 5),
    intro: (b) => { b.append(el("div", { class: "lm-kick" }, "📖 " + it.sn + " · Pusat Ulangkaji"), el("h2", null, it.n), el("p", null, "Stesen ini tidak memegang tajuk bagi subjek ini. Jawab 5 soalan campuran sebagai ulangkaji (tidak dikira dalam pasport).")); },
    onDone: (pass, ok, tot) => { const xp = lmXp(ok * 2); lmCard((b) => { b.append(el("div", { class: "lm-kick" }, "Ulangkaji · " + it.sn), el("h2", null, ok + "/" + tot + " betul"), el("p", { class: "lm-ex" }, "XP +" + xp), el("div", { class: "lm-row" }, lmBtn("Teruskan jelajah", "pri", lmCardClose))); }); }
  });
}
/* tab pasport: perjalanan menuntut ilmu */
function lmIlmuPassport(b) {
  const g = LM.g, its = (g && g.ilmu) || [], J = lmJourney();
  b.append(el("p", null, "Perjalanan menuntut ilmu: bermula dari sekolah anda, kembara ke setiap Stesen Ilmu di institusi sebenar (masjid, mahkamah, Parlimen, Bursa Malaysia dan lain-lain). Lulus tajuk di stesen itu untuk mendapat cop."));
  b.append(el("p", { class: "lm-ex" }, "Cop Stesen Ilmu: " + J.d + "/" + J.t + (J.next ? " · Seterusnya: " + J.next.sn : " · Lengkap!")));
  const bar = el("div", { class: "lm-bar" }), bi = el("i"); bi.style.width = Math.round(100 * J.d / Math.max(1, J.t)) + "%"; bar.appendChild(bi); b.appendChild(bar);
  if (g && g.ownSk) b.append(el("div", { class: "lm-row" }, el("span", null, "🏫 " + g.ownSk.n), lmBtn("Pulang ke sekolah", "", () => { lmCardClose(); lmTeleport(g.ownSk.sx, g.ownSk.sz, "Selamat kembali ke " + g.ownSk.n); })));
  const grid = el("div", { class: "lm-grid" });
  its.forEach((it) => {
    const c = el("div", { class: "lm-stamp" + (it.done ? " on" : "") });
    c.append(el("b", null, (it.done ? "📖 " : (it.no ? it.no + ". " : "")) + it.sn), el("div", null, DATA.negeri[it.k].pendek));
    if (it.tids.length) it.tids.forEach((tid) => { const t = TOPIK[tid]; c.append(el("div", { style: "opacity:" + (lmTopicDone(tid) ? 1 : 0.7) }, (lmTopicDone(tid) ? "✔ " : "○ ") + (t.kod || t.id) + " " + t.nama)); });
    else c.append(el("div", { style: "opacity:.7" }, "Pusat ulangkaji (pilihan)"));
    c.append(lmBtn("Tunjuk arah", "", () => { g.wp = { x: it.x, z: it.z, n: it.sn }; lmWpSet(); lmCardClose(); lmPop("Ikut tiang merah ke " + it.sn); }));
    grid.appendChild(c);
  });
  b.appendChild(grid);
}
/* ---------- v18.17: KEMBARA KAMPUS ----------
   Universiti awam menjadi galeri IPT. Profil (huraian, program, video, pautan) diurus pentadbir di Firebase ipt/<id>
   untuk IPT yang menyewa ruang pameran; IPT lain dipaparkan secara ringkas. Kiraan: ipt_lawat|ipt_minat/<id>/<peranti>. */
async function lmKampusFetch(g) {
  if (typeof FB === "undefined" || !FB.url) return;
  try { LM.ipt = (await FB.req("GET", "ipt")) || {}; } catch (e) { LM.ipt = LM.ipt || {}; }
  if (LM.g && LM.g !== g) return; /* dunia lain telah dibina */
  g.items.forEach((it) => { if (it.kind === "ip" && LM.ipt[it.id] && LM.ipt[it.id].pk && it.lb && !it.galeri) { it.galeri = true; const lb = lmLabel("🎓 " + it.sn + " · " + it.n + " · Galeri", { fs: 30, k: 0.032, bg: "rgba(90,30,10,.88)", bd: "#ffd45a" }); lb.position.copy(it.lb.position); g.scene.remove(it.lb); g.scene.add(lb); it.lb = lb; } });
}
function lmKampusOpen(it) {
  const pf = (LM.ipt || {})[it.id] || null, kp = LM.st.kp || (LM.st.kp = {}), gid = FB.getUid(), first = !kp[it.id];
  let xp = 0; if (first) { kp[it.id] = Date.now(); lmSave(); xp = lmXp(5); lmSnd("coin"); }
  if (FB.url) FB.req("PUT", "ipt_lawat/" + it.id + "/" + gid, true).catch(() => {});
  lmCard((b) => {
    b.append(el("div", { class: "lm-kick" }, "🎓 Kembara Kampus · " + DATA.negeri[it.k].pendek), el("h2", null, it.n + " (" + it.sn + ")"));
    if (first) b.append(el("p", { class: "lm-ex" }, "Cop kampus " + it.sn + " diperoleh!" + (xp ? " XP +" + xp : "")));
    if (pf && pf.pk) {
      if (pf.ds) b.append(el("p", null, pf.ds));
      if (pf.pg) { const ul = el("div", { class: "lm-ex" }, el("b", null, "Program pengajian: ")); ul.append(String(pf.pg)); b.appendChild(ul); }
      if (pf.yt && /^[\w-]{11}$/.test(pf.yt)) b.appendChild(el("iframe", { src: "https://www.youtube-nocookie.com/embed/" + pf.yt + "?rel=0", title: "Video " + it.sn, allow: "encrypted-media; picture-in-picture", allowfullscreen: "", loading: "lazy", style: "width:100%;aspect-ratio:16/9;border:0;border-radius:10px;background:#000" }));
    } else b.append(el("p", null, it.n + " ialah universiti awam di " + DATA.negeri[it.k].nama + ". Galeri rasmi universiti ini akan dibuka tidak lama lagi."), el("p", { class: "lm-ex" }, "Ruang pameran ini boleh disewa oleh institusi untuk memperkenalkan program kepada murid seluruh Malaysia."));
    const row = el("div", { class: "lm-row" });
    if (pf && pf.pk) {
      const mn = (LM.st.km || (LM.st.km = {}));
      const minat = lmBtn(mn[it.id] ? "✔ Minat direkodkan" : "✋ Saya berminat", mn[it.id] ? "" : "pri", () => { if (mn[it.id]) return; mn[it.id] = Date.now(); lmSave(); FB.req("PUT", "ipt_minat/" + it.id + "/" + gid, true).catch(() => {}); minat.textContent = "✔ Minat direkodkan"; minat.className = ""; lmPop("Terima kasih! Minat anda direkodkan."); });
      row.appendChild(minat);
      if (pf.url && /^https:\/\//.test(pf.url)) { let host = ""; try { host = new URL(pf.url).hostname; } catch (e) { host = ""; } row.appendChild(lmBtn("🌐 Laman rasmi", "", () => { if (confirm("Anda akan membuka laman luar (" + host + "). Teruskan?")) window.open(pf.url, "_blank", "noopener"); })); }
    }
    row.appendChild(lmBtn("Tutup", "", lmCardClose));
    b.append(row, el("p", { class: "lm-ex", style: "opacity:.75" }, "Cop kampus: " + Object.keys(kp).length + "/" + IPTA.length + ". Lawati 5 kampus untuk lencana Kembara Kampus."));
  });
}
function lmKampusPassport(b) {
  const g = LM.g, kp = LM.st.kp || {}, its = g ? g.items.filter((x) => x.kind === "ip") : [];
  b.append(el("p", null, "Kembara Kampus: lawati galeri universiti awam di seluruh Malaysia untuk mengenali program pengajian. Setiap kampus memberi satu cop."));
  b.append(el("p", { class: "lm-ex" }, "Cop kampus: " + Object.keys(kp).length + "/" + its.length));
  const grid = el("div", { class: "lm-grid" });
  its.forEach((it) => {
    const on = !!kp[it.id], pf = (LM.ipt || {})[it.id], c = el("div", { class: "lm-stamp" + (on ? " on" : "") });
    c.append(el("b", null, (on ? "🎓 " : "") + it.sn + (pf && pf.pk ? " · Galeri" : "")), el("div", null, it.n + " · " + DATA.negeri[it.k].pendek));
    c.append(lmBtn("Tunjuk arah", "", () => { g.wp = { x: it.x, z: it.z, n: it.sn }; lmWpSet(); lmCardClose(); lmPop("Ikut tiang merah ke " + it.sn); }));
    grid.appendChild(c);
  });
  b.appendChild(grid);
}
/* ---------- v18.18: KEM TEMPUR ----------
   Kem tentera sebenar di beberapa negeri. Tekan E untuk masuk permainan Tempur (misi menembak sambil menjawab soalan
   tajuk); selepas misi, pemain kembali ke META DIDIK di kem yang sama (LM.resume). [id, negeri, nama, lat, lon] */
const KEM = [
  ["km-sgbesi", "wp", "Kem Sungai Besi", 3.0600, 101.7080],
  ["km-ipoh", "perak", "Kem Syed Putra, Ipoh", 4.5880, 101.1130],
  ["km-terendak", "melaka", "Kem Terendak", 2.2930, 102.0930],
  ["km-gemas", "nsembilan", "Kem Syed Sirajuddin, Gemas", 2.5850, 102.6100],
  ["km-kuantan", "pahang", "Kem Batu 10, Kuantan", 3.8460, 103.2000],
  ["km-majidee", "johor", "Kem Majidee, Johor Bahru", 1.4980, 103.7700],
  ["km-penrissen", "sarawak", "Kem Penrissen, Kuching", 1.4700, 110.3300],
  ["km-lokkawi", "sabah", "Kem Lok Kawi", 5.8870, 116.0490]
];
function lmKemModel() {
  const g = new T.Group(), OL = "#4b5a2e", KH = "#8a7f5a";
  g.add(lmMesh(lmBox(30, 0.2, 24), "#b8ad8a", 0, 0.1, 0, { ns: 1 }));                       /* padang kawad */
  for (const [x, z, w, d] of [[0, -12, 30, 0.6], [-15, 0, 0.6, 24], [15, 0, 0.6, 24], [-9.5, 12, 11, 0.6], [9.5, 12, 11, 0.6]]) g.add(lmMesh(lmBox(w, 1.6, d), KH, x, 0.8, z)); /* pagar */
  for (const x of [-4, 4]) g.add(lmMesh(lmBox(0.9, 6, 0.9), OL, x, 3, 12)); g.add(lmMesh(lmBox(9.4, 1.4, 1), OL, 0, 6.4, 12)); /* pintu gerbang */
  for (const [x, z] of [[-9, -6], [0, -7], [9, -6]]) { g.add(lmMesh(lmBox(7, 3.2, 4), "#d9d3c0", x, 1.6, z)); g.add(lmMesh(lmBox(7.6, 0.5, 4.6), OL, x, 3.4, z)); } /* berek */
  g.add(lmMesh(lmBox(0.5, 9, 0.5), "#6d5b3c", 11, 4.5, 8)); g.add(lmMesh(lmBox(3, 0.4, 3), "#6d5b3c", 11, 9, 8)); g.add(lmMesh(lmBox(3.2, 1.2, 3.2), OL, 11, 10, 8)); /* menara kawalan */
  g.add(lmMesh(lmCyl(0.12, 0.12, 9, 6), "#cfcfcf", -11, 4.5, 6));
  { const fl = new T.Mesh(GEO.pflag || (GEO.pflag = new T.PlaneGeometry(2.8, 1.4)), new T.MeshBasicMaterial({ map: lmFlagTex(), side: T.DoubleSide })); fl.position.set(-9.6, 8.2, 6); g.add(fl); }
  return g;
}
function lmKemBuild(g, used, placed, avoid, gnd) {
  KEM.forEach(([id, k, nama, la, lo]) => {
    if (!DATA.negeri[k]) return;
    const okK = (q) => q === k || (k === "wp" && q === "selangor") || (k === "selangor" && q === "wp"), rr = 18;
    const free = (x, z) => okK(lmAt(x, z)) && lmLandW(x + rr, z) && lmLandW(x - rr, z) && lmLandW(x, z + rr) && lmLandW(x, z - rr)
      && !used.some((u) => Math.hypot(u.x - x, u.z - z) < rr + 8) && !placed.some((u) => Math.hypot(u.x - x, u.z - z) < rr + u.r + 8) && !avoid.some((a) => Math.hypot(a.x - x, a.z - z) < a.r + rr);
    let w = ll(la, lo);
    if (!free(w.x, w.z)) { let best = null; for (let d = 6; d <= 140 && !best; d += 6) for (let i = 0; i < 16; i++) { const a = i * 0.3927 + d * 0.17, x = w.x + Math.cos(a) * d, z = w.z + Math.sin(a) * d; if (free(x, z)) { best = { x: x, z: z }; break; } } if (best) w = best; }
    const md = lmKemModel(), rot = (Math.abs(hashStr(id)) % 628) / 100;
    md.position.set(w.x, 0, w.z); md.rotation.y = rot; g.scene.add(md); gnd.push([md, 0]); lmPad(g, w.x, w.z, 17);
    const lb = lmLabel("🎖 " + nama + " · Tempur", { fs: 28, k: 0.03, bg: "rgba(45,55,25,.9)", bd: "#d9c36a" }); lb.position.set(w.x, 14, w.z); g.scene.add(lb); gnd.push([lb, 14]);
    const fx = Math.sin(rot), fz = Math.cos(rot);
    g.items.push({ kind: "km", id: id, k: k, n: nama, x: w.x + fx * 15, z: w.z + fz * 15, r: 0, ir: 8, m: md, lb: lb });
    placed.push({ x: w.x, z: w.z, r: rr }); avoid.push({ x: w.x, z: w.z, r: rr + 2 });
    const cr = Math.cos(rot), sr = Math.sin(rot), at = (lx, lz) => ({ x: w.x + lx * cr + lz * sr, z: w.z - lx * sr + lz * cr });
    for (const [lx, lz] of [[-9, -6], [0, -7], [9, -6]]) { const q = at(lx, lz); g.cols.push({ x: q.x, z: q.z, r: 3.6, h: 4 }); }
  });
}
function lmKemOpen(it) {
  const ts = DATA.topik.filter((t) => DATA.negeri[t.negeri]);
  lmCard((b) => {
    b.append(el("div", { class: "lm-kick" }, "🎖 " + it.n + " · " + DATA.negeri[it.k].pendek), el("h2", null, "Tempur"));
    b.append(el("p", null, "Masuk ke medan latihan Tempur: buka peti bekalan, jawab soalan tajuk untuk mendapat peluru dan perisai, dan tumpaskan sasaran. Selepas misi tamat, anda kembali ke kem ini."));
    const sel = el("select", { "aria-label": "Tajuk misi", style: "width:100%;padding:8px;border-radius:10px;font:inherit" });
    ts.forEach((t) => sel.appendChild(el("option", { value: t.id }, (lmTopicDone(t.id) ? "✔ " : "") + (t.kod || t.id) + " " + t.nama)));
    { const nx = ts.find((t) => !lmTopicDone(t.id)); if (nx) sel.value = nx.id; }
    b.append(el("p", { class: "lm-ex" }, "Pilih tajuk misi:"), sel);
    b.append(el("div", { class: "lm-row" }, lmBtn("🎯 Mula Tempur", "pri", () => {
      const tid = sel.value; LM.resume = { at: it.id }; lmSave(); lmCardClose(); lmClose();
      setTimeout(() => { try { openBrief(tid, "solo"); } catch (e) { LM.resume = null; toast("Tempur tidak dapat dibuka.", "warn"); } }, 60);
    }), lmBtn("Nanti dulu", "", lmCardClose)));
  });
}
/* ---------- v18.8: sekolah murid sendiri (titik mula setiap misi) ---------- */
const SK_STATE = { JHR: "johor", KDH: "kedah", KTN: "kelantan", MLK: "melaka", NSN: "nsembilan", PHG: "pahang", PRK: "perak", PLS: "perlis", PNG: "penang", SBH: "sabah", SWK: "sarawak", SGR: "selangor", TRG: "terengganu", KUL: "wp", LBN: "sabah", PJY: "wp" };
const SK_ACR = { SMK: 1, SMKA: 1, SBP: 1, MRSM: 1, KV: 1, SM: 1, SMA: 1, SABK: 1, SMJK: 1, SMT: 1, SMS: 1, SK: 1, II: 1, III: 1, IV: 1 };
const lmSkNice = (s) => String(s || "").split(" ").map((w) => (SK_ACR[w] ? w : w.split("'").map((p) => p.charAt(0) + p.slice(1).toLowerCase()).join("'"))).join(" ");
const lmSkNorm = (s) => (typeof cleanSekolah === "function" ? cleanSekolah(s) : String(s || "").toUpperCase()).replace(/[^A-Z0-9]/g, "");
/* cari lokasi sekolah murid (data KPM); hasil disimpan supaya tidak perlu dimuat semula */
function lmOwnSchool() {
  const q = lmSkNorm(P.sekolah); if (!q) return Promise.resolve(null);
  const key = q + "|" + (P.negeri || "");
  try { const c = JSON.parse(localStorage.getItem("gt-lm-sk") || "null"); if (c && c.q === key) return Promise.resolve(c.r); } catch (e) { /* abaikan */ }
  const v = typeof APP_VER !== "undefined" ? "?v=" + APP_VER : "";
  return fetch("meta-sekolah.json" + v).then((r) => (r.ok ? r.json() : null)).then((d) => {
    if (!d || !d.s) return null;
    const all = d.s.map((a) => ({ raw: a[0], c: a[1], x: a[2], z: a[3], q: lmSkNorm(a[0]) }));
    const pick = (L) => L.find((a) => a.c === P.negeri) || L[0];
    let m = pick(all.filter((a) => a.q === q));
    if (!m && q.length >= 8) m = pick(all.filter((a) => a.q.indexOf(q) >= 0 || q.indexOf(a.q) >= 0));
    const r = m ? { n: lmSkNice(typeof cleanSekolah === "function" ? cleanSekolah(m.raw) : m.raw), k: SK_STATE[m.c] || "", x: m.x, z: m.z } : null;
    try { localStorage.setItem("gt-lm-sk", JSON.stringify({ q: key, r: r })); } catch (e) { /* abaikan */ }
    return r;
  }).catch(() => null);
}
function lmSchoolModel(name) {
  const g = new T.Group(), W = "#f3efe4", B = "#2d6fb8";
  g.add(lmMesh(lmCyl(15, 15, 0.25, 32), "#7cc46a", 0, 0.12, 0, { ns: 1 }));
  g.add(lmMesh(lmBox(18, 9, 5), W, 0, 4.5, -6)); g.add(lmMesh(lmBox(18.6, 0.6, 5.6), B, 0, 9.3, -6));
  for (let f = 0; f < 3; f++) { g.add(lmMesh(lmBox(18.1, 0.35, 5.1), "#c9c2b0", 0, 0.2 + f * 3, -6)); for (let i = 0; i < 7; i++) g.add(lmMesh(lmBox(1.4, 1.5, 0.15), "#2b3440", -7.8 + i * 2.6, 1.8 + f * 3, -3.4)); }
  for (const x of [-11, 11]) { g.add(lmMesh(lmBox(5, 6, 10), W, x, 3, -2)); g.add(lmMesh(lmBox(5.4, 0.5, 10.4), B, x, 6.2, -2)); }
  g.add(lmMesh(lmBox(16, 0.1, 9), "#c98a4a", 0, 0.3, 5, { ns: 1 })); /* padang perhimpunan */
  g.add(lmMesh(lmCyl(0.12, 0.15, 10, 6), "#d9d9d9", 7, 5, 5));
  { const fl = new T.Mesh(GEO.pflag || (GEO.pflag = new T.PlaneGeometry(2.8, 1.4)), new T.MeshBasicMaterial({ map: lmFlagTex(), side: T.DoubleSide })); fl.position.set(8.45, 9.2, 5); g.add(fl); }
  for (const x of [-4.5, 4.5]) g.add(lmMesh(lmBox(1, 4.5, 1), B, x, 2.25, 11));
  g.add(lmMesh(lmBox(10, 1.2, 1), B, 0, 4.9, 11));
  return { g: g, r: 13 };
}
function lmOwnSchoolBuild(g, placed, avoid, gnd) {
  const s = LM.ownSk; g.ownSk = null; if (!s || !DATA.negeri[s.k]) return;
  const w = lmSnap(s.k, lmWarp(s.x * WS, s.z * WS), 60, true), md = lmSchoolModel(s.n), rot = 0;
  md.g.position.set(w.x, 0, w.z); md.g.rotation.y = rot; g.scene.add(md.g); gnd.push([md.g, 0]); lmPad(g, w.x, w.z, 15);
  const lb = lmLabel("🏫 Sekolah anda: " + s.n, { fs: 30, k: 0.032, bg: "rgba(20,60,120,.88)", bd: "#ffd45a" }); lb.position.set(w.x, 15, w.z); g.scene.add(lb); gnd.push([lb, 15]);
  const it = { kind: "sk", id: "sk-own", k: s.k, n: s.n, x: w.x, z: w.z + 13, sx: w.x, sz: w.z + 16, r: 0, ir: 9, m: md.g, lb: lb };
  g.items.push(it); g.ownSk = it; placed.push({ x: w.x, z: w.z, r: 16 }); avoid.push({ x: w.x, z: w.z, r: 17 });
  [[0, -6, 9.5], [-11, -2, 5.5], [11, -2, 5.5]].forEach(([lx, lz, r]) => g.cols.push({ x: w.x + lx, z: w.z + lz, r: r, h: 12 }));
}
function lmOwnSchoolOpen(it) {
  const J = lmJourney();
  lmCard((b) => {
    b.append(el("div", { class: "lm-kick" }, "🏫 Sekolah anda · " + DATA.negeri[it.k].pendek), el("h2", null, it.n));
    b.append(el("p", null, "Di sinilah perjalanan menuntut ilmu anda bermula. Kembara ke setiap Stesen Ilmu di seluruh Malaysia; setiap stesen di institusi sebenar memegang tajuk " + SUBJS[SUBJ].subjek + " yang berkait dengannya."));
    b.append(el("p", { class: "lm-ex" }, "Cop Stesen Ilmu: " + J.d + "/" + J.t + (J.next ? " · Seterusnya: " + J.next.sn + " (" + DATA.negeri[J.next.k].pendek + ")" : " · Perjalanan lengkap!")));
    const row = el("div", { class: "lm-row" });
    if (!J.next && J.t) row.append(lmBtn("📜 Terima Sijil META DIDIK", "pri", lmCertGet), lmBtn("🏅 Lencana", "", () => lmPassport("lencana")));
    if (J.next) row.append(lmBtn("Tunjuk arah ke " + J.next.sn, "pri", () => { LM.g.wp = { x: J.next.x, z: J.next.z, n: J.next.sn }; lmWpSet(); lmCardClose(); lmPop("Ikut tiang merah ke " + J.next.sn); }));
    row.append(lmBtn("🍛 Kantin (percuma)", "", () => { if (lmEnergy() >= 100) { toast("Tenaga anda masih penuh.", "ok"); return; } lmCardClose(); lmEat(50, "Makan di kantin sekolah"); }), lmBtn("🛍 Gudang", "", lmGudang), lmBtn("Pasport", "", () => lmPassport("ilmu")), lmBtn("Tutup", "", lmCardClose));
    b.append(el("p", { class: "lm-ex" }, "Gudang hanya boleh dibuka di sekolah anda: beli avatar, pakaian seragam, lencana dan cara meraikan."), row);
  });
}
/* ---------- v18.11: kedai makan tradisi setiap negeri dan tenaga (lapar) ----------
   [negeri, bandar, lat, lon, hidangan, keterangan, harga syiling, tenaga dipulihkan] */
const FOOD = [
  ["perlis", "Kuala Perlis", 6.400, 100.130, "Laksa Kuala Perlis", "Laksa berkuah ikan yang pekat, dimakan bersama ulam dan telur rebus. Kuala Perlis terkenal dengan laksanya.", 6, 70],
  ["kedah", "Alor Setar", 6.121, 100.368, "Laksa Kedah", "Kuah ikan yang masam berempah asam keping, dimakan dengan mi beras dan ulam.", 6, 70],
  ["penang", "George Town", 5.414, 100.329, "Nasi Kandar", "Nasi berlauk kari campur. Dahulu penjaja mengandar nasi dan lauk dengan kayu di bahu, lalu dinamakan nasi kandar.", 8, 85],
  ["perak", "Kuala Kangsar", 4.770, 100.940, "Rendang Tok", "Rendang daging kering yang dimasak lama dengan kerisik dan rempah, warisan masakan diraja Perak.", 9, 90],
  ["selangor", "Kajang", 2.993, 101.788, "Sate Kajang", "Sate daging dan ayam dengan kuah kacang. Kajang dikenali sebagai bandar sate.", 8, 80],
  ["wp", "Kampung Baru", 3.165, 101.703, "Nasi Lemak", "Nasi dimasak dengan santan dan daun pandan, dihidang bersama sambal, ikan bilis, kacang dan telur. Hidangan kebangsaan Malaysia.", 5, 70],
  ["nsembilan", "Seremban", 2.726, 101.938, "Masak Lemak Cili Api", "Lauk bersantan pedas berkunyit, masakan tradisi masyarakat Minangkabau di Negeri Sembilan.", 7, 80],
  ["melaka", "Bandar Melaka", 2.196, 102.248, "Asam Pedas Melaka", "Ikan dimasak dalam kuah asam jawa yang pedas dan masam dengan daun kesum.", 7, 80],
  ["johor", "Muar", 2.045, 102.568, "Mee Bandung Muar", "Mi kuning dalam kuah pekat berasaskan udang, cili dan daging. Berasal dari bandar Muar.", 6, 75],
  ["pahang", "Temerloh", 3.450, 102.417, "Ikan Patin Masak Tempoyak", "Ikan patin dimasak dengan tempoyak (isi durian yang diperam). Temerloh dikenali sebagai Bandar Ikan Patin.", 9, 90],
  ["terengganu", "Kuala Terengganu", 5.330, 103.140, "Nasi Dagang", "Campuran beras pulut dan beras biasa yang dikukus dengan santan, dimakan bersama gulai ikan tongkol. Sarapan tradisi Terengganu.", 6, 80],
  ["kelantan", "Kota Bharu", 6.130, 102.238, "Nasi Kerabu", "Nasi biru diwarnakan bunga telang, dimakan dengan ulam, kerisik, budu dan ikan bakar.", 6, 80],
  ["sabah", "Tuaran", 6.180, 116.230, "Mee Tuaran", "Mi telur yang dibuat secara tradisi di Tuaran, digoreng dengan sayur dan daging.", 6, 75],
  ["sarawak", "Kuching", 1.558, 110.344, "Laksa Sarawak", "Mi hun dalam kuah rempah sambal dan santan, dihidang dengan udang, telur dadar dan ayam.", 7, 80]
];
const ADAB_MAKAN = "Adab makan: basuh tangan, baca Bismillah, makan dengan tangan kanan, tidak membazir dan ucap Alhamdulillah selepas makan.";
function lmStall(col) {
  const g = new T.Group();
  g.add(lmMesh(lmBox(10, 0.4, 8), "#d8cbb2", 0, 0.2, 0));
  g.add(lmMesh(lmBox(10, 4.2, 0.4), "#f2e6cf", 0, 2.3, -3.8)); for (const x of [-4.8, 4.8]) g.add(lmMesh(lmBox(0.4, 4.2, 7.6), "#f2e6cf", x, 2.3, 0));
  g.add(lmMesh(lmBox(8.4, 1.1, 1.2), "#8a5a34", 0, 0.95, -2.4));                                    /* kaunter */
  for (let i = 0; i < 6; i++) g.add(lmMesh(lmBox(10.6 / 6, 0.3, 3.2), i % 2 ? "#ffffff" : col, -5.3 + 10.6 / 12 + i * 10.6 / 6, 4.6, 2.6)); /* kanopi berjalur */
  g.add(lmMesh(lmBox(10.2, 0.3, 8.2), "#a5482f", 0, 4.55, -0.9));
  for (const x of [-2.4, 2.4]) { g.add(lmMesh(lmBox(1.8, 0.15, 1.8), "#d9b27c", x, 1.3, 1.4)); g.add(lmMesh(lmBox(0.2, 1.2, 0.2), "#6e4a2c", x, 0.7, 1.4)); for (const dz of [-1.3, 1.3]) g.add(lmMesh(lmBox(0.6, 0.7, 0.6), "#c0392b", x, 0.55, 1.4 + dz)); }
  return g;
}
function lmFoodBuild(g, used, placed, avoid, gnd) {
  FOOD.forEach(([k, town, la, lo, dish, desc, price, en], j) => {
    if (!DATA.negeri[k]) return;
    const okK = (q) => q === k || (k === "wp" && q === "selangor"), rr = 9;
    const free = (x, z) => okK(lmAt(x, z)) && lmLandW(x + rr, z) && lmLandW(x - rr, z) && lmLandW(x, z + rr) && lmLandW(x, z - rr)
      && !used.some((u) => Math.hypot(u.x - x, u.z - z) < rr + 8) && !placed.some((u) => Math.hypot(u.x - x, u.z - z) < rr + u.r + 14) && !avoid.some((a) => Math.hypot(a.x - x, a.z - z) < a.r + rr);
    let w = ll(la, lo);
    if (!free(w.x, w.z)) { let best = null; for (let d = 5; d <= 90 && !best; d += 5) for (let i = 0; i < 16; i++) { const a = i * 0.3927 + d * 0.11, x = w.x + Math.cos(a) * d, z = w.z + Math.sin(a) * d; if (free(x, z)) { best = { x: x, z: z }; break; } } if (best) w = best; }
    const md = lmStall(["#e74c3c", "#27ae60", "#2980b9", "#f39c12", "#8e44ad"][j % 5]), rot = (Math.abs(hashStr(k)) % 628) / 100;
    md.position.set(w.x, 0, w.z); md.rotation.y = rot; g.scene.add(md); gnd.push([md, 0]); lmPad(g, w.x, w.z, 9);
    const lb = lmLabel("🍽 Kedai Makan · " + dish, { fs: 28, k: 0.03, bg: "rgba(90,30,10,.85)", bd: "#ffb347" }); lb.position.set(w.x, 8.5, w.z); g.scene.add(lb); gnd.push([lb, 8.5]);
    const fx = Math.sin(rot), fz = Math.cos(rot);
    g.items.push({ kind: "fd", id: "fd-" + k, k: k, n: dish, town: town, desc: desc, price: price, en: en, x: w.x + fx * 7, z: w.z + fz * 7, r: 0, ir: 8, m: md });
    placed.push({ x: w.x, z: w.z, r: 8 }); avoid.push({ x: w.x, z: w.z, r: 9 });
    g.cols.push({ x: w.x - fx * 2.4, z: w.z - fz * 2.4, r: 4.5, h: 5 });
  });
}
/* ---------- v18.14: Dataran Inovasi (Stesen Inovasi guru) ----------
   Satu dataran setiap negeri berhampiran bandar kedai makan tradisi, STN_N tapak gerai. Stesen yang diluluskan
   pentadbir (stesen/<id>, st = "lulus", sl = "<negeri>-<n>") dipaparkan pada gerai; tapak lain "kosong". */
const SN_N = 3;
function lmStnScreen(tj, sub) {
  return lmTex(512, 288, (x, w, h) => {
    const gr = x.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#0b4a4a"); gr.addColorStop(1, "#08283a"); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.strokeStyle = "#ffd45a"; x.lineWidth = 8; x.strokeRect(6, 6, w - 12, h - 12);
    x.fillStyle = "#ffd45a"; x.font = "800 30px Nunito, sans-serif"; x.textAlign = "center"; x.fillText(sub, w / 2, 56);
    x.fillStyle = "#fff"; x.font = "800 40px Nunito, sans-serif";
    const words = String(tj).split(" "), lines = []; let cur = "";
    words.forEach((wd) => { const t = cur ? cur + " " + wd : wd; if (x.measureText(t).width > w - 60 && cur) { lines.push(cur); cur = wd; } else cur = t; }); if (cur) lines.push(cur);
    lines.slice(0, 3).forEach((l, i) => x.fillText(l, w / 2, 124 + i * 50));
  });
}
function lmStnBooth() {
  const g = new T.Group();
  g.add(lmMesh(lmBox(9, 0.4, 7), "#e8e2d4", 0, 0.2, 0));
  for (const x of [-4.2, 4.2]) g.add(lmMesh(lmBox(0.4, 5.2, 0.4), "#0b4a4a", x, 2.8, -3));
  g.add(lmMesh(lmBox(9.4, 0.4, 7.4), "#0b4a4a", 0, 5.4, -0.2));
  g.add(lmMesh(lmBox(9.6, 0.25, 0.3), "#ffd45a", 0, 5.2, 3.5));
  g.add(lmMesh(lmBox(8.2, 4.4, 0.3), "#1d2a33", 0, 2.8, -3.1));
  g.add(lmMesh(lmBox(5, 1.1, 1.2), "#c9a46a", 0, 0.95, 1.2));
  const scr = new T.Mesh(new T.PlaneGeometry(7.4, 4.16), new T.MeshBasicMaterial({ map: lmStnScreen("Tapak kosong", "STESEN INOVASI") }));
  scr.position.set(0, 2.9, -2.93); g.add(scr); g.userData.scr = scr;
  return g;
}
function lmStnBuild(g, used, placed, avoid, gnd) {
  g.stn = [];
  FOOD.forEach(([k, town, la, lo], j) => {
    if (!DATA.negeri[k]) return;
    const okK = (q) => q === k || (k === "wp" && q === "selangor"), rr = 22;
    const free = (x, z) => okK(lmAt(x, z)) && lmLandW(x + rr, z) && lmLandW(x - rr, z) && lmLandW(x, z + rr) && lmLandW(x, z - rr)
      && !used.some((u) => Math.hypot(u.x - x, u.z - z) < rr + 8) && !placed.some((u) => Math.hypot(u.x - x, u.z - z) < rr + u.r + 10) && !avoid.some((a) => Math.hypot(a.x - x, a.z - z) < a.r + rr);
    const c0 = ll(la, lo); let w = null;
    for (let d = 40; d <= 220 && !w; d += 10) for (let i = 0; i < 16; i++) { const a = i * 0.3927 + j, x = c0.x + Math.cos(a) * d, z = c0.z + Math.sin(a) * d; if (free(x, z)) { w = { x: x, z: z }; break; } }
    if (!w) return;
    const rot = Math.atan2(c0.x - w.x, c0.z - w.z); /* menghadap bandar */
    lmPad(g, w.x, w.z, rr);
    const plaza = new T.Group(); plaza.position.set(w.x, 0, w.z); plaza.rotation.y = rot; g.scene.add(plaza); gnd.push([plaza, 0]);
    plaza.add(lmMesh(lmCyl(rr - 2, rr - 2, 0.3, 28), "#d9d2c0", 0, 0.15, 0));
    /* gerbang Dataran Inovasi */
    for (const x of [-6, 6]) plaza.add(lmMesh(lmBox(1, 8, 1), "#0b4a4a", x, 4, rr - 4));
    plaza.add(lmMesh(lmBox(13, 1.6, 1), "#ffd45a", 0, 8.4, rr - 4));
    const lb = lmLabel("🏛 Dataran Inovasi " + DATA.negeri[k].pendek, { fs: 30, k: 0.032, bg: "rgba(11,74,74,.9)", bd: "#ffd45a" }); lb.position.set(w.x, 12.5, w.z); g.scene.add(lb); gnd.push([lb, 12.5]);
    const sn = Math.sin(rot), cs = Math.cos(rot), toWd = (lx, lz) => ({ x: w.x + lx * cs + lz * sn, z: w.z - lx * sn + lz * cs });
    for (let i = 1; i <= SN_N; i++) {
      const a = (i - 2) * 0.85, lx = Math.sin(a) * 12, lz = -Math.cos(a) * 12, b = lmStnBooth();
      b.position.set(lx, 0, lz); b.rotation.y = -a; plaza.add(b);
      const pw = toWd(lx * 0.72, lz * 0.72), bw = toWd(lx, lz);
      const it = { kind: "sn", id: "sn-" + k + "-" + i, sl: k + "-" + i, k: k, n: "Tapak kosong", x: pw.x, z: pw.z, r: 0, ir: 4.5, m: b, d: null, lb: null };
      g.items.push(it); g.stn.push(it);
      g.cols.push({ x: bw.x, z: bw.z, r: 3.2, h: 5.5 });
    }
    placed.push({ x: w.x, z: w.z, r: rr }); avoid.push({ x: w.x, z: w.z, r: rr + 2 });
  });
}
/* muat stesen yang diluluskan dan pasang pada gerai */
async function lmStnFetch(g) {
  if (typeof FB === "undefined" || !FB.url || !g.stn) return;
  let v = null; try { v = await FB.req("GET", "stesen"); } catch (e) { return; }
  if (!LM.g || LM.g !== g) return;
  const by = {}; Object.keys(v || {}).forEach((id) => { const d = v[id]; if (d && d.st === "lulus" && d.sl && d.tj) by[d.sl] = Object.assign({}, d, { id: id }); });
  g.stn.forEach((it) => {
    const d = by[it.sl] || null; if ((it.d && it.d.id + it.d.tu) === (d && d.id + d.tu)) return;
    it.d = d; it.n = d ? d.tj : "Tapak kosong";
    const scr = it.m.userData.scr; if (scr) { const old = scr.material.map; scr.material.map = lmStnScreen(d ? d.tj : "Tapak kosong", d ? String(d.kat || "STESEN INOVASI").toUpperCase() : "STESEN INOVASI"); scr.material.needsUpdate = true; if (old) old.dispose(); }
  });
}
function lmStnOpen(it) {
  const d = it.d, gid = FB.getUid();
  lmCard((b) => {
    b.append(el("div", { class: "lm-kick" }, "🏛 Dataran Inovasi " + DATA.negeri[it.k].pendek + (d ? " · " + d.kat : "")), el("h2", null, d ? d.tj : "Tapak kosong"));
    if (!d) {
      b.append(el("p", null, "Tapak ini disediakan untuk guru mempamerkan inovasi pengajaran kepada guru dan murid seluruh Malaysia."), el("p", { class: "lm-ex" }, "Guru: buka Papan pemuka guru → Stesen Inovasi saya, sahkan akaun DELIMa dan hantar permohonan."), el("div", { class: "lm-row" }, lmBtn("Tutup", "pri", lmCardClose)));
      return;
    }
    b.append(el("p", { class: "lm-ex" }, "Oleh " + d.n + (d.sk ? " · " + d.sk : "")), el("p", null, d.ds));
    if (d.yt && /^[\w-]{11}$/.test(d.yt)) { const f = el("iframe", { src: "https://www.youtube-nocookie.com/embed/" + d.yt + "?rel=0", title: "Video inovasi", allow: "encrypted-media; picture-in-picture", allowfullscreen: "", loading: "lazy", style: "width:100%;aspect-ratio:16/9;border:0;border-radius:10px;background:#000" }); b.appendChild(f); }
    const st = el("p", { class: "lm-ex" }, "Memuat statistik...");
    b.appendChild(st);
    const row = el("div", { class: "lm-row" });
    let liked = false, nLike = 0, nVis = 0;
    const like = lmBtn("👍 Suka", "", async () => {
      like.disabled = true; liked = !liked; nLike += liked ? 1 : -1; draw();
      try { await FB.req(liked ? "PUT" : "DELETE", "stesen_suka/" + d.id + "/" + gid, liked ? true : undefined); } catch (e) { liked = !liked; nLike += liked ? 1 : -1; draw(); }
      like.disabled = false;
    });
    const draw = () => { st.textContent = "👁 " + nVis + " pelawat · 👍 " + nLike + " suka"; like.textContent = liked ? "👍 Disukai" : "👍 Suka"; like.className = liked ? "pri" : ""; };
    row.appendChild(like);
    if (d.url && /^https:\/\//.test(d.url)) {
      let host = ""; try { host = new URL(d.url).hostname; } catch (e) { host = ""; }
      row.appendChild(lmBtn("🔗 Lawati " + (host || "pautan"), "", () => {
        if (!confirm("Anda akan membuka laman luar (" + host + ") yang dikendalikan oleh guru pemilik stesen, bukan Meta Didik. Teruskan?")) return;
        FB.req("PUT", "stesen_klik/" + d.id + "/" + gid, true).catch(() => {});
        window.open(d.url, "_blank", "noopener");
      }));
    }
    row.appendChild(lmBtn("Tutup", "", lmCardClose));
    b.append(row, el("p", { class: "lm-ex", style: "opacity:.75" }, "Kandungan stesen disediakan oleh guru dan disemak pentadbir. Laporkan kandungan tidak sesuai kepada pentadbir melalui ruangan komen."));
    (async () => {
      try { await FB.req("PUT", "stesen_lawat/" + d.id + "/" + gid, true); } catch (e) { /* abaikan */ }
      const cnt = async (n) => { try { const v = await FB.req("GET", n + "/" + d.id, undefined, "shallow=true"); return v && typeof v === "object" ? v : {}; } catch (e) { return {}; } };
      const [vs, lk] = await Promise.all([cnt("stesen_lawat"), cnt("stesen_suka")]);
      nVis = Object.keys(vs).length; nLike = Object.keys(lk).length; liked = !!lk[gid]; draw();
    })();
  });
}

function lmEnergy() { const e = LM.st.en; return e == null ? 100 : clamp(e, 0, 100); }
function lmEat(add, msg) {
  LM.st.en = clamp(lmEnergy() + add, 0, 100); LM.st.enW = 0; lmSave(); lmSnd("coin"); lmPop(msg + " · Tenaga " + Math.round(LM.st.en) + "%");
}
function lmFoodOpen(it) {
  const e = Math.round(lmEnergy());
  lmCard((b) => {
    b.append(el("div", { class: "lm-kick" }, "🍽 Kedai Makan · " + it.town + ", " + DATA.negeri[it.k].pendek), el("h2", null, it.n), el("p", null, it.desc));
    b.append(el("p", { class: "lm-ex" }, "Tenaga anda: " + e + "%. Hidangan ini memulihkan +" + it.en + "% tenaga. Harga: " + it.price + " syiling (baki anda " + (P.coin | 0) + ")."), el("p", { class: "lm-ex" }, ADAB_MAKAN));
    const buy = lmBtn("Beli dan makan (" + it.price + " 🪙)", "pri", () => {
      if ((P.coin | 0) < it.price) { toast("Syiling tidak mencukupi. Kutip syiling atau makan percuma di kantin sekolah anda.", "warn"); return; }
      P.coin = (P.coin | 0) - it.price; try { saveP(); } catch (x) { /* abaikan */ }
      LM.st.food = LM.st.food || {}; LM.st.food[it.k] = Date.now(); lmCardClose(); lmEat(it.en, "Bismillah. " + it.n + " sedap!");
    });
    if (e >= 100) buy.disabled = true;
    b.append(el("div", { class: "lm-row" }, buy, lmBtn("Tutup", "", lmCardClose)));
  });
}
/* ---------- v18.11: situasi akhlak dalam peta ----------
   Sekali-sekala, ketika murid berjalan, satu situasi muncul berhampiran. Murid menyelesaikannya sendiri
   (pimpin, angkat, bawa, kutip, letak) mengikut tanda kuning. Situasi hilang jika tidak dilayan. */
const AKH_NPC = { pakcik: "L|1|ou_my|oc_gn|hd_kp|hc_w", makcik: "P|1|ou_kr|oc_gn|hd_td|hc_w", budak: "L|1|ou_sc|oc_gn|hd_no|hc_w", kawan: "L|1|ou_tk|oc_gn|hd_no|hc_w", kawanP: "P|1|ou_sc|oc_gn|hd_td|hc_w", pengawal: "L|1|ou_sc|oc_gn|hd_tp|hc_w" };
/* v18.12: situasi dilakukan sendiri sebagai simulasi. Setiap langkah:
   do   = pergi ke tanda kuning dan tekan E (fx = kesan),  go = bawa / pimpin hingga ke tanda kuning,
   pick = kutip semua objek kecil dengan berjalan melaluinya. Kedudukan dalam koordinat setempat situasi. */
const AKH = [
  { id: "buta", n: "Orang buta hendak melintas", npc: [["pakcik", 0, -1.5]], props: ["zebra"], sc: "Seorang pakcik buta ragu-ragu untuk melintas jalan.", steps: [
    { t: "do", at: [0, -1.5], act: "Beri salam dan pimpin pakcik", fx: "follow:0", say: "Assalamualaikum pakcik, mari saya pimpin." },
    { t: "go", at: [0, 9], act: "Pimpin pakcik ke seberang jalan" }], ok: "Anda memimpin pakcik itu melintas dengan selamat.", dl: "Sabda Nabi SAW: Sesiapa yang melepaskan seorang mukmin daripada satu kesusahan dunia, Allah akan melepaskannya daripada satu kesusahan pada hari kiamat (riwayat Muslim)." },
  { id: "barang", n: "Makcik membawa barang berat", npc: [["makcik", 0, 0]], props: ["beg", "kereta"], sc: "Seorang makcik penat membawa beg barang dapur yang berat.", steps: [
    { t: "do", at: [1.6, 0.4], act: "Beri salam dan angkat barang makcik", fx: "carry:beg|follow:0", say: "Biar saya tolong angkat, makcik." },
    { t: "go", at: [10, 3.2], act: "Bawa barang ke kereta makcik", fx: "drop:kereta" }], ok: "Barang selamat dimasukkan ke dalam kereta. Makcik tersenyum lega.", dl: "Sabda Nabi SAW: Bukan daripada golongan kami orang yang tidak mengasihi yang muda dan tidak menghormati yang tua (riwayat at-Tirmizi)." },
  { id: "kucing", n: "Anak kucing jatuh ke dalam parit", props: ["parit", "kotak"], sc: "Seekor anak kucing terjatuh ke dalam parit dan tidak dapat keluar.", steps: [
    { t: "do", at: [0.6, 1.4], act: "Angkat anak kucing perlahan-lahan", fx: "carry:kucing" },
    { t: "go", at: [6, 6], act: "Bawa anak kucing ke kotak yang kering", fx: "drop:kotak" }], ok: "Anak kucing itu selamat dan kering. Berbuat ihsan kepada haiwan juga ibadah.", dl: "Sabda Nabi SAW: Pada setiap makhluk yang bernyawa ada pahala (riwayat al-Bukhari dan Muslim)." },
  { id: "dompet", n: "Dompet tercicir di tepi jalan", npc: [["pengawal", 12, 8.6]], props: ["dompet", "pondok"], sc: "Sebuah dompet berisi wang dan kad pengenalan tercicir di tepi jalan.", steps: [
    { t: "do", at: [0, 0], act: "Kutip dompet itu", fx: "carry:dompet" },
    { t: "do", at: [12, 6.2], act: "Serahkan dompet kepada pengawal", fx: "drop:pondok", say: "Encik, saya jumpa dompet ini di tepi jalan." }], ok: "Pengawal akan memulangkan dompet itu kepada pemiliknya. Anda telah menunaikan amanah.", dl: "Firman Allah SWT: Sesungguhnya Allah menyuruh kamu menyampaikan amanah kepada yang berhak menerimanya (an-Nisa': 58)." },
  { id: "sampah", n: "Sampah bertaburan", props: ["sampah", "tong"], sc: "Kawasan rekreasi ini dipenuhi sampah yang ditinggalkan pengunjung.", steps: [
    { t: "pick", act: "Kutip semua sampah" },
    { t: "do", at: [-3, -1.2], act: "Buang sampah ke dalam tong", fx: "drop:tong" }], ok: "Kawasan itu kembali bersih.", dl: "Sabda Nabi SAW: Iman mempunyai lebih tujuh puluh cabang... dan yang paling rendah ialah membuang gangguan daripada jalan (riwayat Muslim)." },
  { id: "basikal", n: "Kanak-kanak jatuh basikal", npc: [["budak", 0, 0, 0.7, "jatuh"], ["makcik", -10, 9]], props: ["basikal"], sc: "Seorang kanak-kanak terjatuh dari basikal dan menangis.", steps: [
    { t: "do", at: [0, 0.8], act: "Bantu adik bangun", fx: "stand:0", say: "Adik tak apa-apa? Mari saya tolong." },
    { t: "do", at: [1.8, 2], act: "Tegakkan basikal adik", fx: "bike|follow:0" },
    { t: "go", at: [-10, 6.5], act: "Bawa adik kepada ibunya" }], ok: "Ibu kanak-kanak itu mengucapkan terima kasih.", dl: "Sabda Nabi SAW: Sayangilah yang di bumi, nescaya kamu disayangi oleh yang di langit (riwayat at-Tirmizi)." },
  { id: "sesat", n: "Pakcik sesat mencari surau", npc: [["pakcik", 0, 0]], props: ["peta", "surau"], sc: "Seorang pakcik dari luar bandar keliru mencari surau untuk solat.", steps: [
    { t: "do", at: [0, 1.2], act: "Tanya dan temankan pakcik ke surau", fx: "follow:0", say: "Mari pakcik, surau di sebelah sana." },
    { t: "go", at: [14, 7], act: "Bawa pakcik ke surau" }], ok: "Pakcik tiba di surau tepat pada waktunya dan mendoakan anda.", dl: "Sabda Nabi SAW: Menunjukkan jalan kepada orang yang sesat ialah sedekah (riwayat at-Tirmizi)." },
  { id: "ejek", n: "Kawan baharu diejek", npc: [["kawan", -2.2, 0, 0.85], ["kawan", 2.2, 0, 0.85], ["kawanP", 0, 3.4, 0.8]], sc: "Sekumpulan murid mengejek seorang kawan baharu kerana loghatnya.", steps: [
    { t: "do", at: [0, 0.8], act: "Tegur kumpulan itu dengan baik", fx: "away:0,1", say: "Jangan ejek dia, kita semua bersaudara." },
    { t: "do", at: [0, 3.4], act: "Ajak kawan baharu menyertai kumpulan anda", fx: "follow:2", say: "Jom sertai kumpulan kami!" },
    { t: "go", at: [-8, -4], act: "Bawa kawan baharu ke kumpulan anda" }], ok: "Kawan baharu itu tersenyum. Anda telah menghentikan buli dengan baik.", dl: "Firman Allah SWT: Janganlah suatu kaum memperolok-olokkan kaum yang lain (al-Hujurat: 11)." },
  { id: "azan", n: "Azan berkumandang ketika bermain", npc: [["kawan", -1.6, 0, 0.85], ["kawan", 1.6, 0.6, 0.85]], props: ["bola", "surau"], sc: "Azan berkumandang ketika anda bermain bola bersama kawan-kawan.", steps: [
    { t: "do", at: [0, 2], act: "Hentikan permainan dan simpan bola", fx: "hide:bola|follow:0,1", say: "Jom solat dulu, nanti kita sambung!" },
    { t: "go", at: [14, 7], act: "Ajak kawan-kawan ke surau" }], ok: "Anda dan kawan-kawan solat berjemaah.", dl: "Firman Allah SWT: Peliharalah segala solat dan solat wusta (al-Baqarah: 238)." },
  { id: "lapar", n: "Musafir kelaparan", npc: [["pakcik", 0, 0, 0.95]], props: ["mangkuk", "gerai"], sc: "Seorang musafir belum makan sejak pagi.", steps: [
    { t: "do", at: [12, -3.6], act: "Beli sebungkus nasi di gerai", fx: "buy|carry:nasi" },
    { t: "do", at: [0, 1.2], act: "Hulurkan makanan kepada musafir", fx: "drop:mangkuk", say: "Pakcik, makanlah ini." }], ok: "Musafir itu dapat makan dan meneruskan perjalanan. Sedekah tidak mengurangkan harta.", dl: "Sabda Nabi SAW: Tangan yang di atas lebih baik daripada tangan yang di bawah (riwayat al-Bukhari dan Muslim)." },
  { id: "burung", n: "Anak burung jatuh dari sarang", props: ["sarang", "pokok"], sc: "Seekor anak burung jatuh bersama sarangnya. Ibunya berlegar di atas pokok.", steps: [
    { t: "do", at: [0.6, 1.4], act: "Ambil sarang dengan berhati-hati", fx: "carry:sarang" },
    { t: "do", at: [6, 2.6], act: "Letakkan sarang semula di dahan", fx: "drop:pokok" }], ok: "Ibu burung kembali ke sarangnya.", dl: "Nabi SAW menyuruh anak burung yang diambil daripada ibunya dikembalikan (riwayat Abu Daud)." }
];
function lmAkProp(kind, P) {
  const g = new T.Group(); P[kind] = g;
  if (kind === "zebra") { for (let i = 0; i < 6; i++) g.add(lmMesh(lmBox(7, 0.08, 1), "#f4f4f4", 0, 0.06, 1 + i * 1.6)); g.add(lmMesh(lmBox(16, 0.05, 9.6), "#3b3d42", 0, 0.03, 4.6)); const cn = lmMesh(lmBox(0.09, 3, 0.09), "#ffffff", 1.1, 1.4, -1); cn.rotation.z = 0.3; g.add(cn); }
  else if (kind === "beg") for (const [x, z] of [[1.4, 0.6], [1.9, -0.5], [-1.5, 0.4]]) g.add(lmMesh(lmBox(0.9, 1.1, 0.6), "#c8a26a", x, 0.55, z));
  else if (kind === "kereta") { g.add(lmMesh(lmBox(4.4, 1.2, 2), "#c0392b", 10, 0.85, 6)); g.add(lmMesh(lmBox(2.4, 0.9, 1.8), "#1d2b3a", 9.7, 1.9, 6)); }
  else if (kind === "parit") { g.add(lmMesh(lmBox(12, 0.25, 2.2), "#4a4f55", 0, 0.12, 0)); g.add(lmMesh(lmBox(12, 0.1, 1.4), "#2a5a6a", 0, 0.26, 0)); }
  else if (kind === "kucing" || kind === "kotak") { if (kind === "kotak") g.add(lmMesh(lmBox(1.6, 0.7, 1.2), "#b88a52", 6, 0.35, 6)); else { g.add(lmMesh(lmBox(0.9, 0.55, 0.45), "#f0a040", 0, 0, 0)); g.add(lmMesh(lmBox(0.45, 0.45, 0.45), "#f0a040", 0.55, 0.25, 0)); g.position.set(0.4, 0.5, 0); } }
  else if (kind === "dompet") { g.add(lmMesh(lmBox(0.7, 0.12, 0.5), "#5a3a1e", 0, 0.08, 0)); }
  else if (kind === "pondok") { g.add(lmMesh(lmBox(3.6, 3.2, 3), "#e8e2d2", 12, 1.6, 9.2)); g.add(lmMesh(lmBox(4, 0.3, 3.4), "#2e5a8a", 12, 3.3, 9.2)); const lb = lmLabel("Pondok Pengawal", { fs: 24, k: 0.026 }); lb.position.set(12, 4.6, 9.2); g.add(lb); }
  else if (kind === "sampah") { P.bits = []; for (let i = 0; i < 7; i++) { const m = lmMesh(lmBox(0.4, 0.3, 0.3), ["#e74c3c", "#3498db", "#ecf0f1", "#f1c40f"][i % 4], Math.cos(i * 1.7) * (2 + i * 0.5), 0.15, Math.sin(i * 1.7) * (2 + i * 0.5)); g.add(m); P.bits.push(m); } }
  else if (kind === "tong") { const b = new T.Mesh(new T.CylinderGeometry(0.6, 0.55, 1.4, 10), lmMat("#2e7d32")); b.position.set(-3, 0.7, -2.4); g.add(b); }
  else if (kind === "basikal") { for (const x of [-0.9, 0.9]) { const w = new T.Mesh(GEO.akW || (GEO.akW = new T.TorusGeometry(0.6, 0.08, 6, 16)), lmMat("#222")); w.position.set(x, 0.1, 0); w.rotation.x = Math.PI / 2; g.add(w); } g.add(lmMesh(lmBox(1.8, 0.1, 0.12), "#d64f4f", 0, 0.15, 0)); g.position.set(1.8, 0, 2.4); }
  else if (kind === "peta") g.add(lmMesh(lmBox(0.8, 0.6, 0.05), "#f5ecd0", 0.6, 2.6, 0.6));
  else if (kind === "surau") { g.add(lmMesh(lmBox(7, 4, 5), "#f4efe6", 14, 2, 10.5)); g.add(lmMesh(lmBox(7.6, 0.5, 5.6), "#2e8b57", 14, 4.2, 10.5)); const lb = lmLabel("🕌 Surau", { fs: 26, k: 0.028 }); lb.position.set(14, 6.2, 10.5); g.add(lb); }
  else if (kind === "bola") { const b = new T.Mesh(new T.SphereGeometry(0.4, 12, 8), lmMat("#f4f4f4")); b.position.set(0, 0.4, 2); g.add(b); }
  else if (kind === "mangkuk") { const m = new T.Mesh(new T.CylinderGeometry(0.4, 0.25, 0.3, 12), lmMat("#b0b6be")); m.position.set(0.9, 0.15, 0.8); g.add(m); }
  else if (kind === "gerai") { g.add(lmMesh(lmBox(4, 1.1, 1.4), "#8a5a34", 12, 0.55, -5.2)); for (let i = 0; i < 4; i++) g.add(lmMesh(lmBox(1.05, 0.25, 2.4), i % 2 ? "#ffffff" : "#e67e22", 10.5 + i * 1.05, 3, -5)); for (const x of [10.2, 13.8]) g.add(lmMesh(lmBox(0.15, 3, 0.15), "#6e4a2c", x, 1.5, -4)); const lb = lmLabel("🍛 Gerai Nasi", { fs: 24, k: 0.026 }); lb.position.set(12, 4.4, -5); g.add(lb); }
  else if (kind === "sarang") { const n = new T.Mesh(new T.CylinderGeometry(0.6, 0.4, 0.35, 10), lmMat("#7a5a32")); g.add(n); g.add(lmMesh(lmBox(0.3, 0.25, 0.4), "#a0907a", 0, 0.3, 0)); g.position.set(0.6, 0.18, 0.6); }
  else if (kind === "pokok") { g.add(lmMesh(lmBox(0.7, 6, 0.7), "#6e4a2c", 6, 3, 4)); const c = new T.Mesh(new T.IcosahedronGeometry(3, 0), lmMat("#3f8a3a")); c.position.set(6, 7, 4); g.add(c); g.add(lmMesh(lmBox(2.4, 0.25, 0.3), "#6e4a2c", 6, 4.6, 3.2)); }
  else if (kind === "nasi") { g.add(lmMesh(lmBox(0.7, 0.35, 0.5), "#3a8a4a", 0, 0, 0)); }
  return g;
}
function lmAkW(it, o) { const v = new T.Vector3(o[0], 0, o[1]); it.m.updateMatrixWorld(true); it.m.localToWorld(v); return v; }
function lmAkSpawn(g) {
  const p = g.p, S = AKH[Math.floor(Math.random() * AKH.length)], fy = Math.atan2(p.vx, p.vz);
  for (let tr = 0; tr < 16; tr++) {
    const a = fy + (Math.random() - 0.5) * 1.4, d = 32 + Math.random() * 16, x = p.x + Math.sin(a) * d, z = p.z + Math.cos(a) * d;
    if (!lmCanStand(x, z) || g.items.some((it) => Math.hypot(it.x - x, it.z - z) < 34)) continue;
    const grp = new T.Group(), y = lmGround(x, z); grp.position.set(x, y, z); grp.rotation.y = Math.atan2(p.x - x, p.z - z);
    const it0 = { m: grp };
    const pts = S.steps.filter((s) => s.at).map((s) => s.at).concat([[8, 8], [-8, 8], [8, -6], [-8, -6]]);
    if (!pts.every((o) => { const w = lmAkW(it0, o); return lmCanStand(w.x, w.z); })) continue;
    const P = {}; (S.props || []).forEach((k) => grp.add(lmAkProp(k, P)));
    if (S.id === "kucing") grp.add(lmAkProp("kucing", P));
    if (S.id === "burung") P.carry0 = P.sarang;
    const npcs = [];
    (S.npc || []).forEach(([who, ox, oz, sc, pose]) => { try { const av = AV3.build(AKH_NPC[who]); av.g.position.set(ox, 0, oz); if (sc) av.g.scale.setScalar(sc); if (pose === "jatuh") { av.g.rotation.x = -1.35; av.g.position.y = 0.6; av.down = true; } grp.add(av.g); npcs.push(av); } catch (e) { /* abaikan */ } });
    const lb = lmLabel("❗ " + S.n, { fs: 30, k: 0.032, bg: "rgba(140,30,30,.88)", bd: "#ffd45a" }); lb.position.set(0, 9, 0); grp.add(lb);
    const ring = new T.Mesh(new T.CylinderGeometry(1.6, 1.6, 0.12, 24, 1, true), new T.MeshBasicMaterial({ color: 0xffd45a, transparent: true, opacity: 0.85, side: T.DoubleSide, depthWrite: false }));
    const beam = new T.Mesh(lmCyl(0.35, 0.35, 14, 8), new T.MeshBasicMaterial({ color: 0xffd45a, transparent: true, opacity: 0.35, depthWrite: false })); beam.position.y = 7; ring.add(beam);
    g.scene.add(grp); g.scene.add(ring);
    const it = { kind: "ak", id: "ak-" + Date.now(), n: S.n, S: S, x: x, z: z, r: 0, ir: 4, m: grp, npcs: npcs, P: P, ring: ring, st: 0, fol: [], t: 150, lb: lb };
    g.items.push(it); g.ak = it; lmAkStep(it, true);
    lmPop("❗ " + S.n + ": ikut tanda kuning untuk membantu");
    return;
  }
}
/* sediakan langkah semasa: tanda kuning di sasaran dan teks tindakan */
function lmAkStep(it, first) {
  const s = it.S.steps[it.st]; if (!s) return;
  if (s.t === "pick") { const b = it.P.bits.find((q) => q.visible); if (!b) { it.st++; return lmAkStep(it); } const w = new T.Vector3(); b.getWorldPosition(w); it.x = w.x; it.z = w.z; it.act = s.act + " (" + it.P.bits.filter((q) => !q.visible).length + "/" + it.P.bits.length + ")"; }
  else { const w = lmAkW(it, s.at); it.x = w.x; it.z = w.z; it.act = s.act; }
  it.ring.position.set(it.x, lmGround(it.x, it.z) + 0.08, it.z);
  if (!first) lmPop((it.st + 1) + ". " + it.act);
}
function lmAkFx(it, fx) {
  const g = LM.g; if (!fx) return;
  fx.split("|").forEach((f) => {
    const [k, v] = f.split(":");
    if (k === "follow") v.split(",").forEach((i) => { const av = it.npcs[+i]; if (av && it.fol.indexOf(av) < 0) { const ry = it.m.rotation.y; g.scene.attach(av.g); av.g.rotation.set(0, ry, 0); av.g.scale.setScalar(av.g.scale.x); it.fol.push(av); } }); /* putaran ditetapkan semula: attach boleh menghasilkan Euler terbalik */
    else if (k === "carry") {
      let c;
      if (v === "beg") { c = new T.Group(); it.P.beg.children.forEach((x) => c.add(x.clone())); it.P.beg.visible = false; c.scale.setScalar(0.7); }
      else { c = it.P[v] || lmAkProp(v, it.P); if (c.parent) c.parent.remove(c); }
      c.position.set(0, 3.2, 1.3); c.rotation.set(0, 0, 0); g.me.g.add(c); it.held = c;
    }
    else if (k === "drop") { if (it.held) { g.me.g.remove(it.held); if (v !== "tong" && v !== "mangkuk") { const w = lmAkW(it, it.S.steps[it.st].at); it.held.position.set(0, 0, 0); g.scene.add(it.held); const at = { kereta: [10, 1.8, 6], kotak: [6, 0.9, 6], pondok: [12, 1.6, 7.7], pokok: [6, 4.85, 3.2] }[v]; if (at) { const ww = lmAkW(it, [at[0], at[2]]); it.held.position.set(ww.x, lmGround(ww.x, ww.z) + at[1], ww.z); } else it.held.position.set(w.x, lmGround(w.x, w.z) + 0.3, w.z); } it.held = null; } }
    else if (k === "stand") { const av = it.npcs[+v]; if (av) { av.g.rotation.x = 0; av.g.position.y = 0; av.down = false; } }
    else if (k === "bike") { const bk = it.P.basikal; if (bk) { bk.rotation.x = Math.PI / 2; bk.position.y = 0.7; } } /* roda tegak semula */
    else if (k === "away") v.split(",").forEach((i) => { const av = it.npcs[+i]; if (av) { const ry = it.m.rotation.y + Math.PI; g.scene.attach(av.g); av.g.rotation.set(0, ry, 0); av.away = 3; it.gone = (it.gone || []).concat([av]); } });
    else if (k === "hide") { if (it.P[v]) it.P[v].visible = false; }
    else if (k === "buy") { if ((P.coin | 0) >= 2) { P.coin = (P.coin | 0) - 2; try { saveP(); } catch (e) { /* abaikan */ } lmPop("Beli nasi bungkus (-2 syiling)"); } else lmPop("Penjual gerai memberi sebungkus nasi percuma untuk musafir itu"); }
  });
}
function lmAkDone(g, it) {
  it.done = true; it.ring.visible = false; LM.st.ak = (LM.st.ak | 0) + 1; (LM.st.akT || (LM.st.akT = {}))[it.S.id] = 1; lmSave(); lmSnd("win");
  let coin = 0; try { coin = gdCoin(2); } catch (e) { coin = 0; } const xp = lmXp(5);
  (it.npcs || []).forEach((av) => { try { lmBubble({ g: av.g, bub: null }, "Terima kasih!"); } catch (e) { /* abaikan */ } });
  lmPop("Akhlak terpuji! +" + coin + " syiling · XP +" + xp);
  const ex = el("div", { class: "lm-akdone" }, el("b", null, "MasyaAllah! " + it.S.ok), el("span", null, it.S.dl), el("small", null, "Akhlak terpuji anda: " + LM.st.ak));
  LM.root.appendChild(ex); setTimeout(() => ex.remove(), 9000);
  setTimeout(() => { if (LM.g && g.ak === it) lmAkEnd(g, it); }, 6000);
}
function lmAkEnd(g, it) {
  g.scene.remove(it.m); g.scene.remove(it.ring); (it.fol || []).concat(it.gone || []).forEach((av) => g.scene.remove(av.g));
  if (it.held) { g.me.g.remove(it.held); it.held = null; }
  const i = g.items.indexOf(it); if (i >= 0) g.items.splice(i, 1); if (g.ak === it) g.ak = null; g.akT = 0;
}
function lmAkTick(g, dt) {
  const it = g.ak;
  if (it) {
    if (!it.done) {
      if (it.st === 0 && (it.t -= dt) <= 0) { lmAkEnd(g, it); return; }
      it.ring.rotation.y += dt * 1.5; it.ring.scale.setScalar(1 + Math.sin(g.T * 4) * 0.12);
      const s = it.S.steps[it.st], d = Math.hypot(g.p.x - it.x, g.p.z - it.z);
      if (s && s.t === "go" && d < 2.6) { lmAkFx(it, s.fx); it.st++; if (it.st >= it.S.steps.length) lmAkDone(g, it); else lmAkStep(it); }
      else if (s && s.t === "pick" && d < 2) { const b = it.P.bits.find((q) => q.visible && (() => { const w = new T.Vector3(); q.getWorldPosition(w); return Math.hypot(w.x - g.p.x, w.z - g.p.z) < 2.2; })()); if (b) { b.visible = false; lmSnd("coin"); lmAkStep(it); } }
    }
    /* pengikut berjalan di belakang pemain; pembuli beredar */
    const fx = Math.sin(g.p.yaw), fz = Math.cos(g.p.yaw);
    it.fol.forEach((av, k) => { if (it.done) return; const side = 2.4 + k * 2.2, tx = g.p.x - fx * 1.2 + fz * side, tz = g.p.z - fz * 1.2 - fx * side, /* berjalan di sisi pemain (dipimpin) */ dx = tx - av.g.position.x, dz = tz - av.g.position.z, dd = Math.hypot(dx, dz), mv = dd > 0.4;
      if (mv) { const st = Math.min(dd, Math.max(6, dd * 3) * dt); av.g.position.x += dx / dd * st; av.g.position.z += dz / dd * st; av.g.rotation.y = Math.atan2(dx, dz); }
      av.g.position.y = lmGround(av.g.position.x, av.g.position.z); try { lmAnim(av, mv, false, dt, 1); } catch (e) { /* abaikan */ } });
    (it.gone || []).forEach((av) => { if (av.away > 0) { av.away -= dt; av.g.position.x += Math.sin(av.g.rotation.y) * 5 * dt; av.g.position.z += Math.cos(av.g.rotation.y) * 5 * dt; av.g.position.y = lmGround(av.g.position.x, av.g.position.z); try { lmAnim(av, true, false, dt, 1); } catch (e) { /* abaikan */ } if (av.away <= 0) av.g.visible = false; } });
    return;
  }
  if (g.ui || g.flight || g.sail || g.ride || g.p.swim) return;
  if (Math.hypot(g.p.vx, g.p.vz) > 2) g.akT = (g.akT || 0) + dt;
  if (g.akT > (g.akN || (g.akN = 70 + Math.random() * 60))) { g.akT = 0; g.akN = 0; lmAkSpawn(g); }
}
/* tekan E di tanda kuning */
function lmAkOpen(it) {
  const s = it.S.steps[it.st]; if (!s || it.done) return;
  if (s.t !== "do") { lmPop(it.act); return; }
  if (s.say) lmBubble(LM.g.me, s.say);
  lmAkFx(it, s.fx); lmSnd("ok"); it.st++;
  if (it.st >= it.S.steps.length) lmAkDone(LM.g, it); else lmAkStep(it);
}
/* ---------- v18.13: Panduan "Apa seterusnya" ----------
   Sentiasa menunjukkan Stesen Ilmu terdekat yang belum selesai, tajuknya, jarak dan arah. Jika jauh, panduan
   mencadangkan pengangkutan (ETS, ECRL, bas ekspres atau kapal terbang) dan tiang penunjuk dihalakan ke tempat naik. */
const KM = (u) => u / (3 * WS);
/* v18.15: jarak sebenar (km) antara dua titik dunia: buang zum Lembah Klang dahulu */
function lmKmAB(ax, az, bx, bz) { const a = lmUnwarp(ax, az), b = lmUnwarp(bx, bz); return KM(Math.hypot(b.x - a.x, b.z - a.z)); }
/* jarak sebenar di sepanjang landasan antara kedudukan s0 dan s1 */
function lmRailKm(R, s0, s1) {
  const lo = Math.min(s0, s1), hi = Math.max(s0, s1), P = R.pts, c = R.cum; let km = 0, prev = null;
  for (let i = 0; i < P.length; i++) { if (c[i] < lo || c[i] > hi) continue; if (prev) km += lmKmAB(prev.x, prev.z, P[i].x, P[i].z); prev = P[i]; }
  return km;
}
const lmBorneo = (k) => k === "sabah" || k === "sarawak" || (ISL_BY[k] && (ISL_BY[k].from === "sabah" || ISL_BY[k].from === "sarawak"));
function lmGuideRoute(g, P, T) {
  const dir = Math.hypot(T.x - P.x, T.z - P.z), kP = lmAt(P.x, P.z) || g.lastK, kT = lmAt(T.x, T.z) || T.k, cross = lmBorneo(kP) !== lmBorneo(kT);
  /* v18.15: jarak sederhana (bandar): hanya rel bandar (MRT, LRT, Monorel, Komuter, KLIA Ekspres) */
  const urban = !cross && dir < 450;
  if (urban && dir < 120) return null;
  let best = null;
  const near = (list, q) => { let b = null, bd = 1e9; list.forEach((x) => { const d = Math.hypot(x.x - q.x, x.z - q.z); if (d < bd) { bd = d; b = x; } }); return b; };
  for (const R of g.rails || []) {
    if (!R.sS || R.st.length < 2 || (urban && !R.L.metro && !R.L.tap)) continue;
    const a = near(R.st, P), b = near(R.st, T); if (!a || !b || a === b) continue;
    const cost = Math.hypot(a.x - P.x, a.z - P.z) + Math.hypot(b.x - T.x, b.z - T.z) + 0.12 * Math.abs(R.sS[a.i] - R.sS[b.i]);
    if (!best || cost < best.cost) best = { m: R.L.road ? "bas" : R.L.metro ? "metro" : "kereta", L: R.L, a: a, b: b, cost: cost };
  }
  const aps = g.items.filter((x) => x.kind === "ap");
  if (aps.length > 1 && !urban) { const a = near(aps, P), b = near(aps, T); if (a && b && a !== b) { const cost = Math.hypot(a.x - P.x, a.z - P.z) + Math.hypot(b.x - T.x, b.z - T.z) + 160; if (!best || cost < best.cost || cross) { if (cross || !best || cost < best.cost) best = { m: "terbang", a: a, b: b, cost: cost }; } } }
  if (!best) return null;
  if (!cross && best.cost > dir * 0.75) return null;
  if (cross && best.m !== "terbang") { const a = near(aps, P), b = near(aps, T); if (a && b && a !== b) best = { m: "terbang", a: a, b: b, cost: 0 }; }
  return best;
}
function lmGuidePick(g) {
  const its = (g.ilmu || []).filter((it) => it.tids.length && !it.done), P = g.p;
  if (!its.length) return null;
  let best = null, bd = 1e9;
  its.forEach((it) => { let d = Math.hypot(it.x - P.x, it.z - P.z); if (lmBorneo(it.k) !== lmBorneo(lmAt(P.x, P.z) || g.lastK)) d += 4000; if (d < bd) { bd = d; best = it; } });
  return best;
}
function lmGuideTick(g) {
  const ui = LM.ui, box = ui.guide; if (!box) return;
  const P = g.p, J = lmJourney(), it = lmGuidePick(g), st = LM.st;
  let head = "🎯 Seterusnya", main = "", sub = "", route = "", extra = [], tgt = null, goal = null;
  if (g.flight || g.sail || g.ride) { main = g.ride ? "Dalam perjalanan ke " + g.ride.b.nm : g.flight ? "Dalam penerbangan" : "Menaiki feri"; }
  else if (!it) {
    head = "🎓 Semua Stesen Ilmu selesai!"; main = g.ownSk ? "Pulang ke sekolah anda atau ketik di sini untuk sijil" : "Ketik di sini untuk menerima sijil dan lencana"; if (g.ownSk) goal = tgt = { x: g.ownSk.x, z: g.ownSk.z, n: "Sekolah anda" };
  } else {
    const tid = it.tids.find((t) => !lmTopicDone(t)) || it.tids[0], t = TOPIK[tid], d = Math.hypot(it.x - P.x, it.z - P.z);
    main = "Ke " + it.sn + ", " + (DATA.negeri[it.k] ? DATA.negeri[it.k].pendek : ""); sub = "Tajuk " + (t.kod || t.id) + ": " + t.nama;
    tgt = { x: it.x, z: it.z, n: it.sn }; goal = tgt;
    if (d < 26) { route = "👉 Tekan E di pintu " + it.sn + " untuk menjawab kuiz tajuk ini"; tgt = null; }
    else {
      const R = lmGuideRoute(g, P, it);
      if (R) {
        const da = Math.hypot(R.a.x - P.x, R.a.z - P.z), ic = R.m === "terbang" ? "✈" : lmIc(R.L);
        const naik = R.m === "terbang" ? "Terbang dari " + R.a.n + " ke " + R.b.n : (R.m === "bas" ? "Naik bas " + R.L.n + " di " : "Naik " + R.L.n + " di ") + R.a.n + ", turun di " + R.b.nm;
        route = ic + " Cadangan: " + naik + (da > 26 ? " (" + Math.max(1, Math.round(lmKmAB(P.x, P.z, R.a.x, R.a.z))) + " km ke sana)" : ". Tekan E untuk naik");
        if (da > 26) tgt = { x: R.a.x, z: R.a.z, n: R.m === "terbang" ? R.a.n : R.a.n };
      }
    }
  }
  if (g.ak && !g.ak.done) extra.push("❗ " + g.ak.n + ": " + (g.ak.act || "ikut tanda kuning"));
  if (lmEnergy() < 35) { let f = null, fd = 1e9; g.items.forEach((x) => { if (x.kind !== "fd") return; const d = Math.hypot(x.x - P.x, x.z - P.z); if (d < fd) { fd = d; f = x; } }); if (f) extra.push("🍛 Lapar: " + f.n + ", " + f.town + " (" + Math.max(1, Math.round(lmKmAB(P.x, P.z, f.x, f.z))) + " km) atau kantin sekolah"); }
  /* tiang penunjuk automatik (tidak mengganggu destinasi yang dipilih sendiri) */
  if (g.guideAuto !== false && !g.flight && !g.sail && !g.ride) {
    if (tgt && Math.hypot(tgt.x - P.x, tgt.z - P.z) > 14) { if (!g.wp || g.wp.auto) { if (!g.wp || Math.hypot(g.wp.x - tgt.x, g.wp.z - tgt.z) > 1) { g.wp = { x: tgt.x, z: tgt.z, n: tgt.n, auto: true }; lmWpSet(); } } }
    else if (g.wp && g.wp.auto) { g.wp = null; lmWpSet(); }
  }
  const aim = g.wp || tgt, dist = aim ? Math.hypot(aim.x - P.x, aim.z - P.z) : 0, gdk = goal ? lmKmAB(P.x, P.z, goal.x, goal.z) : 0;
  const key = head + main + sub + route + extra.join() + (goal ? Math.round(gdk) : "") + (g.guideAuto === false);
  if (box._k !== key) {
    box._k = key; box.textContent = "";
    const hd = el("div", { class: "gh" }, el("b", null, head), el("span", null, "📖 " + J.d + "/" + J.t));
    const tg = el("button", { type: "button", class: "gt" }, g.guideAuto === false ? "Penunjuk: tutup" : "Penunjuk: auto");
    tg.addEventListener("click", (e) => { e.stopPropagation(); g.guideAuto = g.guideAuto === false; if (g.guideAuto === false && g.wp && g.wp.auto) { g.wp = null; lmWpSet(); } box._k = ""; lmGuideTick(g); });
    hd.appendChild(tg); box.appendChild(hd);
    const row = el("div", { class: "gm" }); ui.gArrow = el("span", { class: "ga", "aria-hidden": "true" }, "➤"); row.append(ui.gArrow, el("b", null, main)); if (goal) row.append(el("span", null, " · " + Math.max(0, Math.round(gdk)) + " km")); box.appendChild(row);
    if (sub) box.appendChild(el("div", { class: "gs" }, sub));
    if (route) box.appendChild(el("div", { class: "gr" }, route));
    extra.forEach((x) => box.appendChild(el("div", { class: "gx" }, x)));
  }
  /* anak panah relatif kepada arah kamera */
  if (ui.gArrow) {
    if (!aim || dist < 6) ui.gArrow.style.visibility = "hidden";
    else { const cy = Math.cos(g.cam.yaw), sy = Math.sin(g.cam.yaw), vx = aim.x - P.x, vz = aim.z - P.z, fw = -vx * sy - vz * cy, rt = vx * cy - vz * sy; ui.gArrow.style.visibility = ""; ui.gArrow.style.transform = "rotate(" + (Math.atan2(rt, fw) - Math.PI / 2).toFixed(2) + "rad)"; }
  }
}
/* v18.11: Gudang dibuka dari sekolah sendiri. Dunia 3D dijeda; avatar dibina semula jika ditukar. */
function lmGudang() {
  const g = LM.g; if (!g) return;
  lmCardClose(); LM.gd = { view: typeof UI !== "undefined" ? UI.view : "map" }; LM.pause = true; g.ui = true; for (const k in LM.keys) LM.keys[k] = false;
  LM.root.hidden = true; document.body.classList.remove("ar-lock");
  setView("gudang"); try { window.scrollTo(0, 0); } catch (e) { /* abaikan */ }
  const b = el("button", { type: "button", id: "lmGdBack", class: "btn" }, "⬅ Kembali ke sekolah (META DIDIK)");
  b.style.cssText = "position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:90;box-shadow:0 8px 20px rgba(0,0,0,.4)";
  b.addEventListener("click", lmGudangBack); document.body.appendChild(b);
}
function lmGudangBack() {
  const b = document.getElementById("lmGdBack"); if (b) b.remove();
  if (!LM.g || !LM.pause) return;
  setView(LM.gd && LM.gd.view && LM.gd.view !== "gudang" ? LM.gd.view : "map");
  LM.root.hidden = false; document.body.classList.add("ar-lock"); LM.pause = false;
  const g = LM.g, code = lmMyCode();
  if (code !== g.myCode) { const old = g.me, nm = lmAvatar(code, P.nama, true); nm.g.position.copy(old.g.position); nm.g.rotation.y = old.g.rotation.y; g.scene.remove(old.g); g.me = nm; g.myCode = code; g.scene.add(nm.g); }
  g.ui = false; lmPop("Kembali ke sekolah");
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
  /* v18.8: Menara Ilmu tidak lagi dibina; v18.17: setiap tajuk dipegang oleh Stesen Ilmu di institusi sebenar */
  (LM_TOWERS ? DATA.topik : []).forEach((t) => {
    const k = t.negeri, n = DATA.negeri[k]; if (!n) return;
    {
      const pins = n.pins && n.pins.length ? n.pins : [[0, 0]], xy = t.xy || pins[(t.pin | 0) % pins.length] || pins[0], base = lmSnap(k, toW(k, xy[0], xy[1]));
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
  /* sekolah murid sendiri: titik mula setiap misi */
  const placed = [];
  lmOwnSchoolBuild(g, placed, avoid, gnd);
  /* tempat pelancongan */
  PLACES.forEach((p) => {
    const [id, k, nama, type, la, lo, fakta] = p; if (!DATA.negeri[k]) return;
    let w = ll(la, lo);
    if (id === "pg-jambatan" && RAST.bridge) { const b = RAST.bridge; w = { x: (b[0] + b[2]) / 2, z: (b[1] + b[3]) / 2 }; }
    const R = lmRand(id), md = type === "masjid" ? lmMosque(id) : lmModel(type, R), rot = R() * 6.28;
    /* cari ruang lapang: jauh daripada Menara Ilmu (kedudukan ikut subjek) dan mercu tanda lain.
       W.P. terletak di tengah Selangor, jadi mercu tanda KL boleh melimpah ke Selangor. */
    if (id !== "pg-jambatan") {
      const rr = Math.max(md.r, 6), okK = (q) => q === k || (k === "wp" && q === "selangor");
      const free = (x, z) => okK(lmAt(x, z)) && lmLandW(x + rr, z) && lmLandW(x - rr, z) && lmLandW(x, z + rr) && lmLandW(x, z - rr)
        && !used.some((u) => Math.hypot(u.x - x, u.z - z) < rr + 8) && !placed.some((u) => Math.hypot(u.x - x, u.z - z) < rr + u.r + 22);
      if (!free(w.x, w.z)) {
        let best = null;
        for (let d = 4; d <= 120 && !best; d += 4) for (let i = 0; i < 16; i++) { const a = i * 0.3927 + d * 0.1, x = w.x + Math.cos(a) * d, z = w.z + Math.sin(a) * d; if (free(x, z)) { best = { x: x, z: z }; break; } }
        if (best) w = best;
      }
    }
    placed.push({ x: w.x, z: w.z, r: Math.max(md.r, 6) });
    md.g.position.set(w.x, 0, w.z); md.g.rotation.y = rot; g.scene.add(md.g);
    if (id === "pg-jambatan" && RAST.bridge) { const b = RAST.bridge; md.g.rotation.y = -Math.atan2(b[3] - b[1], b[2] - b[0]); md.g.position.y = -2.9; } else gnd.push([md.g, 0]); /* gerbang menara jambatan di atas air */
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
    const [id, k, nama, la, lo] = a; if (!DATA.negeri[k]) return;
    const c = ll(la, lo), blocked = used.map((u) => ({ x: u.x, z: u.z, r: 8 })).concat(placed.map((q) => ({ x: q.x, z: q.z, r: q.r })));
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
  /* IPTA: galeri kampus (Kembara Kampus) */
  lmIptaBuild(g, used, placed, avoid, gnd); setTimeout(() => lmKampusFetch(g), 1500);
  /* Stesen Ilmu: setiap tajuk di institusi sebenar; kem Tempur */
  lmKemBuild(g, used, placed, avoid, gnd);
  lmIlmuBuild(g, used, placed, avoid, gnd); lmIlmuAssign(g);
  /* kedai makan tradisi setiap negeri */
  lmFoodBuild(g, used, placed, avoid, gnd);
  /* Dataran Inovasi: stesen guru */
  lmStnBuild(g, used, placed, avoid, gnd); setTimeout(() => lmStnFetch(g), 1500);
  /* stesen kereta api ETS dan ECRL */
  lmRailsPlan(g, used, placed, avoid, gnd);
  /* pulau Misi Khas, jeti dan feri */
  lmBuildIslands(g, gnd, avoid);
  /* rupa bumi: ketinggian, tapak rata, kemudian semua objek diletakkan di atas tanah */
  lmTerrainBase(g); lmRailsPath(g, avoid); lmBuildTerrain(g);
  for (const [o, dy] of gnd) o.position.y = lmHRaw(o.position.x, o.position.z) + dy;
  for (const c of g.cols) c.h = (c.h || 30) + lmHRaw(c.x, c.z);
  lmRailsBuild(g);
  lmBuildTrees(g, avoid);
  /* syiling harian bertaburan (deterministik mengikut hari) */
  const R = lmRand("lm-coin-" + dayKey()), got = new Set(LM.st.cd.got);
  let n = 0, tries = 0;
  while (n < 200 && tries < 60000) {
    tries++; const x = WB.x0 + R() * WB.w, z = WB.z0 + R() * WB.h; if (!lmAt(x, z) || lmAt(x, z) === "jambatan") continue;
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
  av.bubTx = text; av.bub = lmLabel(text, { fs: 30, k: 0.03, bg: "rgba(255,255,255,.95)", fg: "#1b2a3a", dt: false }); av.bub.position.y = 8.9; av.g.add(av.bub); av.bubT = 3;
}

/* ---------- pergerakan pemain, perlanggaran dan kamera ---------- */
/* sungai/tasik sempit (lebih kecil daripada grid rupa bumi) kelihatan sebagai daratan tetapi raster menandakannya air:
   benarkan berjalan di atasnya supaya tidak menjadi dinding halimunan di sempadan negeri */
function lmTerLand(x, z) {
  if (!TER.land) return false;
  const xi = Math.round((x - TER.x0) / TER.cs), zi = Math.round((z - TER.z0) / TER.cs);
  if (xi < 0 || zi < 0 || xi >= TER.nx || zi >= TER.nz) return false;
  const i = zi * TER.nx + xi; return !!TER.land[i] && !TER.fg[i];
}
function lmCanStand(x, z) { return (lmLandW(x, z) || lmTerLand(x, z)) && lmGround(x, z) > 0.1; }
function lmUpdatePlayer(g, dt) {
  const p = g.p, k = LM.keys, run = k.shift || LM.run;
  let ix = 0, iz = 0;
  if (!g.ui && !g.rai) {
    if (k.w || k.arrowup) iz -= 1; if (k.s || k.arrowdown) iz += 1; if (k.a || k.arrowleft) ix -= 1; if (k.d || k.arrowright) ix += 1;
    if (LM.js.id >= 0) { ix += LM.js.x; iz -= LM.js.y; }
  }
  const il = Math.hypot(ix, iz); if (il > 1) { ix /= il; iz /= il; }
  const en = lmEnergy(), weak = en <= 0 ? 0.5 : en < 15 ? 0.75 : 1;
  const sp = (p.swim ? (run ? 13 : 9) : (run ? 50 : 24)) * Math.min(1, il) * weak, cy = Math.cos(g.cam.yaw), sy = Math.sin(g.cam.yaw);
  if (il > 0.1 && !g.ui) {
    const ne = Math.max(0, en - dt * (p.swim ? 0.9 : run ? 0.8 : 0.5) * Math.min(1, il) * (g.wx && g.wx.terik ? 1.3 : 1)); LM.st.en = ne;
    const w = ne <= 0 ? 3 : ne < 15 ? 2 : ne < 35 ? 1 : 0;
    if (w > (LM.st.enW | 0)) { LM.st.enW = w; lmSave(); toast(w === 3 ? "Anda terlalu lapar dan bergerak perlahan. Makan di kedai makan atau kantin sekolah." : w === 2 ? "Perut berkeroncong! Cari kedai makan berdekatan (🍽 pada peta)." : "Anda mula lapar. Kedai makan tradisi ada di setiap negeri.", "warn"); }
    if ((g.enT = (g.enT || 0) + dt) > 15) { g.enT = 0; lmSave(); }
  }
  /* arah relatif kamera */
  const dx = (ix * cy + iz * sy) * sp, dz = (-ix * sy + iz * cy) * sp;
  p.vx += (dx - p.vx) * Math.min(1, dt * 10); p.vz += (dz - p.vz) * Math.min(1, dt * 10);
  let nx = p.x + p.vx * dt, nz = p.z + p.vz * dt;
  /* tidak boleh berjalan di atas laut: cuba gelincir pada satu paksi */
  if (!lmCanGo(nx, nz)) {
    if (il > 0.1 && p.swim && lmAt(nx, nz) === "" && (g.farT || 0) < g.T) { g.farT = g.T + 3; lmPop("Terlalu jauh dari pantai"); }
    if (lmCanGo(nx, p.z)) nz = p.z; else if (lmCanGo(p.x, nz)) nx = p.x; else { nx = p.x; nz = p.z; }
  }
  for (const c of g.cols) {
    const ddx = nx - c.x, ddz = nz - c.z, d = Math.hypot(ddx, ddz), m = c.r + 1;
    if (d < m && d > 0.001 && p.y < (c.h || 99)) { nx = c.x + ddx / d * m; nz = c.z + ddz / d * m; }
  }
  /* cerun terlalu curam tidak boleh didaki */
  const g0 = p.swim ? Math.min(lmGround(nx, nz), 0) : lmGround(p.x, p.z), stepL = Math.hypot(nx - p.x, nz - p.z);
  if (lmSwimOk(nx, nz) || (lmCanStand(nx, nz) && !(stepL > 0.001 && (lmGround(nx, nz) - g0) / stepL > 2.2))) { p.x = nx; p.z = nz; }
  if (il > 0.1) { let da = Math.atan2(p.vx, p.vz) - p.yaw; while (da > Math.PI) da -= 6.2832; while (da < -Math.PI) da += 6.2832; p.yaw += da * Math.min(1, dt * 12); }
  p.moving = Math.hypot(p.vx, p.vz) > 1.5;
  const wasSwim = p.swim; p.swim = lmSwimOk(p.x, p.z) && p.y < 1.5;
  if (p.swim) {
    /* terapung: permukaan air pada y = 0 */
    const ty = p.moving ? -1.5 : -3.3; p.y += (ty - p.y) * Math.min(1, dt * (wasSwim ? 5 : 9)); p.vy = 0; p.on = true; LM.jump = false;
    if (!wasSwim) { lmPuff(g, p.x, 0.4, p.z, 3, 1.4, 3.2, 0.8); lmPop("Berenang"); if (!LM.st.sw) { LM.st.sw = 1; lmSave(); } }
    if (p.moving && ((g.splT = (g.splT || 0) - dt) <= 0)) { g.splT = 0.18; lmPuff(g, p.x + (Math.random() - 0.5) * 2, 0.35, p.z + (Math.random() - 0.5) * 2, 1.4, 1.1, 2.2, 0.7); }
  } else {
    /* lompat dan graviti */
    if ((k[" "] || LM.jump) && p.on && !g.ui && !g.rai) { p.vy = 15; p.on = false; LM.jump = false; lmSnd("jump"); }
    p.vy -= 38 * dt; p.y += p.vy * dt;
    const gy = lmGround(p.x, p.z);
    if (p.y <= gy || (p.on && p.vy <= 0 && p.y - gy < 1.4)) { p.y = gy; p.vy = 0; p.on = true; }
    else if (p.y - gy > 1.4) p.on = false;
  }
  g.me.g.position.set(p.x, p.y, p.z); g.me.g.rotation.y = p.yaw;
  g.me.swim = p.swim ? (p.moving ? 2 : 1) : 0;
  lmAnim(g.me, p.moving && !p.swim, !p.on && !p.swim, dt, run ? 1.4 : 1);
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
  /* keraian: kamera berpindah ke hadapan avatar */
  if (g.rai) want.set(tx + Math.sin(p.yaw) * 13, p.y + 5.5, tz + Math.cos(p.yaw) * 13);
  g.camera.position.lerp(want, Math.min(1, dt * (g.rai ? 3.5 : 8)));
  { const cp = g.camera.position, gy = Math.max(lmGround(cp.x, cp.z), 0.3) + 1.6; if (cp.y < gy) cp.y = gy; }
  if (g.rai) g.camera.lookAt(tx, p.y + 3.2, tz); else g.camera.lookAt(tx, ty, tz);
  if (g.dome) g.dome.position.copy(g.camera.position);
  lmSkyPlace(g);
  if (g.sun) { const sd = g.sunDir || new T.Vector3(0.45, 0.8, 0.3); g.sun.position.set(p.x + sd.x * 150, p.y + sd.y * 150, p.z + sd.z * 150); g.sun.target.position.set(p.x, p.y, p.z); g.sun.target.updateMatrixWorld(); const sv = g.sunVis || sd; if (g.sunDisc) g.sunDisc.position.set(g.camera.position.x + sv.x * 1100, g.camera.position.y + sv.y * 1100, g.camera.position.z + sv.z * 1100); if (g.wx && g.wx.moon) { g.wx.moon.position.set(g.camera.position.x + sv.x * 1050, g.camera.position.y + sv.y * 1050, g.camera.position.z + sv.z * 1050); g.wx.stars.position.copy(g.camera.position); } }
}

/* ---------- multiplayer (kehadiran bilik; sama seperti Dunia Ilmu) ---------- */
async function lmNetJoin(code, kind) {
  lmNetLeave(); if (!Net.room) { if (kind === "open") LM.openRetry = performance.now() + 1e9; toast("Bilik bersama memerlukan sambungan pelayan Firebase (versi GitHub Pages).", "warn"); return false; }
  const tok = ++LM.tok; LM.roomCode = code; LM.roomKind = kind;
  try {
    const r = await Net.room.join(kind === "open" ? "lmo-" + code : "lm-" + SUBJ + "-" + code);
    if (tok !== LM.tok || !LM.on) { try { await r.leave(); } catch (e) { /* abaikan */ } return false; }
    LM.room = r; LM.sent = 0; LM.pollT = 0; LM.lastSig = "";
    return true;
  } catch (e) { LM.room = null; toast("Gagal masuk bilik. Cuba lagi.", "warn"); return false; }
}
function lmNetLeave() {
  LM.tok++; const r = LM.room; LM.room = null; lmVoiceOff(); LM.myPeer = "";
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
    e.av.g.position.set(e.x, e.y, e.z); e.av.g.rotation.y = e.r; e.av.g.visible = !e.pl && !e.rl; e.av.swim = e.sw | 0; if (e.av.g.visible) lmAnim(e.av, e.m && !e.sw, e.a && !e.sw, dt, 1);
    if (e.pl && !e.plane) { e.plane = lmPlane(); g.scene.add(e.plane); }
    if (e.fy && !e.ferry) { e.ferry = lmFerry(); g.scene.add(e.ferry); }
    if (e.ferry) { e.ferry.visible = e.fy; if (e.fy) { const fx = Math.sin(e.r), fz = Math.cos(e.r); e.ferry.position.set(e.x - fx * 6, Math.sin(g.T * 1.7) * 0.25, e.z - fz * 6); e.ferry.rotation.y = Math.atan2(-fz, fx); } }
    if (e.plane) { e.plane.visible = e.pl; if (e.pl) { e.plane.position.set(e.x, e.y, e.z); e.plane.rotation.y = Math.atan2(-Math.cos(e.r), Math.sin(e.r)); e.plane.userData.body.rotation.set(e.pb, 0, e.pp, "YXZ"); } }
    if (e.tk && (!e.av.bub || e.av.bubTx !== "bercakap...")) lmBubble(e.av, "bercakap...");
    if (e.tk) e.av.bubT = 0.6;
    if (e.av.bub && (e.av.bubT -= dt) <= 0) lmBubble(e.av, "");
  }
  lmOpenTick(g, ts);
  const r = LM.room; if (!r) return;
  const p = g.p;
  if (LM.vc && ts - (LM.vcT || 0) > 700) { LM.vcT = ts; lmVoiceTick(g); }
  if (ts - LM.sent > (LM.roomKind === "open" ? 500 : 200)) {
    LM.sent = ts;
    const o = { x: +p.x.toFixed(1), y: +p.y.toFixed(1), z: +p.z.toFixed(1), r: +p.yaw.toFixed(2), m: p.moving ? 1 : 0, a: p.on ? 0 : 1, n: lmMyName(), sh: LM.sh || "", c: g.myCode, st: lmStamps(), fy: g.sail ? 1 : 0, rl: g.ride ? 1 : 0, sw: p.swim ? (p.moving ? 2 : 1) : 0, pl: g.flight ? 1 : 0, pp: g.flight ? +g.flight.pitch.toFixed(2) : 0, pb: g.flight ? +g.flight.bank.toFixed(2) : 0 };
    const sig = [o.x, o.y, o.z, o.r, o.m, o.a, o.st, o.pl, o.pp, o.pb, o.fy, o.rl, o.sw].join(",");
    if (sig !== LM.lastSig) { LM.lastSig = sig; try { const x = r.presence(o); if (x && x.catch) x.catch(() => {}); } catch (e) { /* abaikan */ } }
  }
  if (ts - LM.pollT > 220) {
    LM.pollT = ts; let a = []; try { a = r.peers(); } catch (e) { a = []; }
    const seen = {}; let n = 0;
    for (const pr of a) {
      if (pr.isMe) { LM.myPeer = pr.peer; continue; }
      if (!pr.presence || typeof pr.presence !== "object" || n >= 30) continue;
      const v = pr.presence; if (typeof v.x !== "number" || typeof v.z !== "number") continue;
      n++; seen[pr.peer] = 1;
      const x = clamp(v.x, WB.x0, WB.x0 + WB.w), y = clamp(+v.y || 0, -8, 400), z = clamp(v.z, WB.z0, WB.z0 + WB.h), nm = cleanName(String(v.n || "")) || "Pelajar";
      let e = LM.peers[pr.peer];
      if (e && (e.c !== v.c || e.n !== nm)) { lmAvatarDrop(g, e.av, e); e = null; }
      if (!e) { const av = lmAvatar(v.c, nm, false); g.scene.add(av.g); e = LM.peers[pr.peer] = { id: pr.peer, x: x, y: y, z: z, r: +v.r || 0, av: av, c: v.c, n: nm, en: v.en | 0, cn: v.cn | 0, rn: v.rn | 0 }; } /* emote lama sebelum kita masuk tidak dipaparkan */
      e.tx = x; e.ty = y; e.tz = z; e.tr = +v.r || 0; e.m = !!v.m; e.a = !!v.a; e.st = clamp(v.st | 0, 0, 999); e.pl = !!v.pl; e.fy = !!v.fy; e.pp = clamp(+v.pp || 0, -1, 1); e.pb = clamp(+v.pb || 0, -1, 1);
      if (typeof v.e === "string" && EMOTE[v.e] && (v.en | 0) !== e.en) { if (!lmMuted(pr.peer)) lmBubble(e.av, EMOTE[v.e]); e.en = v.en | 0; }
      if (typeof v.ct === "string" && (v.cn | 0) !== e.cn) { e.cn = v.cn | 0; lmChatGot(e, v.ct); }
      if (typeof v.rc === "string" && (v.rn | 0) !== e.rn) { e.rn = v.rn | 0; if (!lmMuted(pr.peer) && window.AV3 && AV3.rai) { const d = AV3.rai(e.av, v.rc); if (d) { lmBubble(e.av, RAI_TXT[v.rc] || ""); e.av.bubT = d; } } }
      e.rl = !!v.rl; e.sw = clamp(v.sw | 0, 0, 2);
      e.sh = typeof v.sh === "string" ? v.sh.slice(0, 8) : "";
      e.vo = !!v.vo && LM.roomKind !== "open"; e.tk = e.vo && !!v.tk && !lmMuted(pr.peer); e.vs = v.vs && typeof v.vs === "object" ? v.vs : null;
    }
    for (const id in LM.peers) if (!seen[id]) { lmAvatarDrop(g, LM.peers[id].av, LM.peers[id]); delete LM.peers[id]; }
  }
}
function lmFriendsNear(g, r) {
  let n = 0; for (const id in LM.peers) { const e = LM.peers[id]; if (Math.hypot(e.x - g.p.x, e.z - g.p.z) < r) n++; } return n;
}

/* ---------- Dunia Terbuka (v17.95): sesiapa sahaja boleh masuk tanpa kod ----------
   Pemain dibahagi kepada saluran ikut zon (maksimum LMO.CH seorang) supaya setiap peranti hanya menerima
   data pemain berdekatan. Daftar ringkas "lmo/<uid>" (cap masa pelayan) mengira pemain serentak; had
   LMO.MAX menjaga had 100 sambungan pelan Firebase Spark untuk seluruh aplikasi. */
const LMO = { MAX: 40, CH: 20, HB: 30000, TTL: 75000 };
const ZONES = { utara: "Utara", tengah: "Tengah", timur: "Pantai Timur", selatan: "Selatan", borneo: "Borneo" };
const ZONE_OF = { perlis: "utara", kedah: "utara", penang: "utara", perak: "utara", jambatan: "utara", selangor: "tengah", wp: "tengah", nsembilan: "tengah", melaka: "tengah", kelantan: "timur", terengganu: "timur", pahang: "timur", johor: "selatan", sarawak: "borneo", sabah: "borneo" };
function lmZone(k) { if (ISL_BY[k]) k = ISL_BY[k].from; return ZONE_OF[k] || ""; }
/* PUT tanpa print=silent supaya pelayan memulangkan cap masa sebenar (jam peranti murid mungkin tidak tepat) */
async function lmoPut(c) {
  const r = await fetch(FB.url + "/lmo/" + FB.getUid() + ".json", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ t: { ".sv": "timestamp" }, c: c }) });
  if (!r.ok) { const e = new Error("fb " + r.status); e.code = r.status; throw e; }
  let v = null; try { v = await r.json(); } catch (e) { v = null; }
  return v && typeof v.t === "number" ? v.t : Date.now();
}
function lmoStop() {
  LM.otok = (LM.otok | 0) + 1; clearInterval(LM.oHb);
  if (LM.oHb && FB.url) FB.req("DELETE", "lmo/" + FB.getUid()).catch(() => {});
  LM.oHb = 0; LM.oCh = ""; LM.joining = false;
}
async function lmOpenJoin(zone) {
  const tok = LM.otok = (LM.otok | 0) + 1; LM.joining = true; LM.roomKind = "open"; LM.zone = zone;
  try {
    let ch = zone + "-1";
    if (FB.url) {
      const now = await lmoPut(LM.oCh || "");
      const all = (await FB.req("GET", "lmo")) || {}, me = FB.getUid(), per = {};
      let n = 0;
      for (const k in all) { const v = all[k]; if (k === me || !v || typeof v.t !== "number" || now - v.t > LMO.TTL) continue; n++; if (v.c) per[v.c] = (per[v.c] | 0) + 1; }
      if (tok !== LM.otok || !LM.on) return false;
      if (n >= LMO.MAX) {
        LM.openFull = true; LM.openRetry = performance.now() + 60000; lmNetLeave();
        clearInterval(LM.oHb); LM.oHb = 0; LM.oCh = ""; FB.req("DELETE", "lmo/" + me).catch(() => {});
        return false;
      }
      let i = 1; while ((per[zone + "-" + i] | 0) >= LMO.CH && i < 9) i++;
      ch = zone + "-" + i; await lmoPut(ch);
      if (tok !== LM.otok || !LM.on) return false;
      LM.oCh = ch; clearInterval(LM.oHb); LM.oHb = setInterval(() => { lmoPut(LM.oCh).catch(() => {}); }, LMO.HB);
    }
    LM.openFull = false;
    return await lmNetJoin(ch, "open");
  } catch (e) { LM.openRetry = performance.now() + 30000; return false; }
  finally { if (tok === LM.otok) LM.joining = false; }
}
/* tukar saluran apabila pemain berada di zon baharu lebih 2.5 saat (elak berulang-alik di sempadan) */
function lmOpenTick(g, ts) {
  if (LM.roomKind !== "open" || LM.joining) return;
  if (!LM.room) {
    if (ts > (LM.openRetry || 0)) { LM.openRetry = ts + 60000; lmOpenJoin(LM.zone || "tengah").then((ok) => { if (ok) lmPop("Masuk Dunia Terbuka"); }); }
    return;
  }
  if (g.flight || g.sail || ts - (LM.zT || 0) < 1000) return;
  LM.zT = ts;
  const z = lmZone(lmAt(g.p.x, g.p.z));
  if (!z || z === LM.zone) { LM.zNew = ""; return; }
  if (LM.zNew !== z) { LM.zNew = z; LM.zAt = ts; return; }
  if (ts - LM.zAt > 2500) { LM.zNew = ""; lmOpenJoin(z).then((ok) => { if (ok) lmPop("Zon " + ZONES[z]); }); }
}
window.addEventListener("pagehide", () => { if (LM.oHb && FB.url) { try { fetch(FB.url + "/lmo/" + FB.getUid() + ".json", { method: "DELETE", keepalive: true }); } catch (e) { /* abaikan */ } } });

/* nama di Dunia Terbuka: satu perkataan sahaja (privasi murid); gelaran lazim dilangkau */
const NM_SKIP = { muhammad: 1, muhamad: 1, mohammad: 1, mohamad: 1, mohd: 1, muhd: 1, md: 1, nur: 1, nurul: 1, nor: 1, noor: 1, siti: 1, wan: 1, nik: 1, tengku: 1, abdul: 1, abd: 1, ab: 1, mat: 1, "a.": 1 };
function lmShortName(s) {
  const w = cleanName(s).split(" ").filter(Boolean);
  const pk = w.find((x) => !NM_SKIP[x.toLowerCase()]) || w[0] || "";
  return pk.slice(0, 12) || "Pelajar";
}
/* rakan = semua pemain dalam bilik sekolah/kod, atau pemain sekolah yang sama di Dunia Terbuka (cincangan sekolah sahaja dihantar) */
function lmMySh() { const sid = typeof mySid === "function" ? mySid() : ""; return sid ? String(hashStr("sk:" + sid)).slice(0, 6) : ""; }
function lmFriend(e) { return LM.roomKind !== "open" || (!!e.sh && e.sh === LM.sh); }
function lmGoPeer(id) {
  const g = LM.g, e = LM.peers[id]; if (!g || !e) return;
  g.wp = { x: e.x, z: e.z, n: e.n, pid: id }; lmWpSet(); lmPop("Ikut tiang merah ke " + e.n);
}
/* bilangan pemain Dunia Terbuka di zon lain (daripada daftar lmo; dibaca apabila peta besar dibuka) */
async function lmZoneCounts() {
  if (LM.roomKind !== "open" || !FB.url || Date.now() - (LM.zoneAt || 0) < 20000) return;
  LM.zoneAt = Date.now();
  try {
    const all = (await FB.req("GET", "lmo")) || {}, me = FB.getUid(), out = {}; let now = 0;
    for (const k in all) if (all[k] && typeof all[k].t === "number") now = Math.max(now, all[k].t);
    for (const k in all) { const v = all[k]; if (k === me || !v || typeof v.t !== "number" || now - v.t > LMO.TTL || typeof v.c !== "string") continue; const z = v.c.split("-")[0]; if (ZONES[z]) out[z] = (out[z] | 0) + 1; }
    LM.zoneN = out;
  } catch (e) { /* abaikan */ }
}
function lmMyName() { return LM.roomKind === "open" ? lmShortName(P.nama) : (cleanName(P.nama) || "Pelajar"); }

/* ---------- chat teks bertapis ---------- */
const lmNormW = (w) => String(w).toLowerCase().replace(/[0@4]/g, (c) => (c === "0" ? "o" : "a")).replace(/[1!|]/g, "i").replace(/3/g, "e").replace(/[5$]/g, "s").replace(/7/g, "t").replace(/[^a-z]/g, "").replace(/(.)\1+/g, "$1");
const CHAT_BAD = ["bodoh", "bodo", "bangang", "bongok", "bengap", "babi", "sial", "celaka", "keparat", "puki", "pukimak", "kimak", "pantat", "butoh", "konek", "lancau", "pundek", "jubur", "lahanat", "sundal", "pelacur", "bapuk", "pondan", "tolol", "goblok", "anjing", "haramjadah", "bangsat", "mampus", "palat", "pepek", "cibai", "kanina", "lanjiao", "fuck", "fck", "fuk", "shit", "bitch", "dick", "pussy", "asshole", "bastard", "porn", "sex", "seks", "nigga", "nigger", "stupid", "idiot", "kys", "gay"].map(lmNormW);
const CHAT_PRE = CHAT_BAD.filter((w) => w.length >= 5 && w !== "konek");
const CHAT_HIDDEN = ["pukimak", "haramjadah", "pelacur", "lahanat", "keparat", "pundek", "bangang", "asshole", "bastard", "lanjiao", "kanina"].map(lmNormW); /* dikesan walaupun dijarakkan */
function lmBadWord(w) { const n = lmNormW(w); return !!n && (CHAT_BAD.indexOf(n) >= 0 || CHAT_PRE.some((b) => n.startsWith(b))); }
function lmChatFilter(s) {
  /* huruf dijarakkan ("b o d o h") digabung dahulu */
  const flat = lmNormW(s.replace(/\b(\w)\s+(?=\w\b)/g, "$1"));
  if (CHAT_HIDDEN.some((b) => flat.indexOf(b) >= 0)) return "***";
  return s.replace(/\b(\w)(\s+\w\b)+/g, (m) => (lmBadWord(m.replace(/\s+/g, "")) ? "***" : m)).split(" ").map((w) => (lmBadWord(w) ? "*".repeat(Math.min(6, w.length)) : w)).join(" ");
}
function lmChatContact(s) { return /(https?:|www\.|\.com|\.my\b|\.net|@|wa\.me|t\.me|telegram|whatsapp|insta|tiktok)/i.test(s) || /\d{6,}/.test(s.replace(/[\s.\-+()]/g, "")); }
function lmChatClean(raw) { return String(raw || "").replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 80); }
function lmChatAdd(name, text, cls) {
  const lg = LM.ui.chatLog; if (!lg) return;
  const d = el("div", { class: "ln" + (cls ? " " + cls : "") }); if (name) d.append(el("b", null, name + ": ")); d.append(text);
  lg.appendChild(d); while (lg.children.length > 8) lg.firstChild.remove();
  setTimeout(() => d.classList.add("old"), 30000);
}
function lmChatSend(raw) {
  const g = LM.g; if (!g) return false;
  let s = lmChatClean(raw); if (!s) return false;
  if (!LM.room) { lmChatAdd("", "Chat hanya tersedia apabila bermain bersama (Dunia Terbuka atau bilik).", "sys"); return false; }
  const now = Date.now(); if (now - (LM.chatAt || 0) < 3000) { lmChatAdd("", "Tunggu 3 saat sebelum menghantar mesej lagi.", "sys"); return false; }
  if (lmChatContact(s)) { lmChatAdd("", "Pautan, e-mel, media sosial dan nombor telefon tidak dibenarkan.", "sys"); return false; }
  s = lmChatFilter(s); LM.chatAt = now; LM.cn = (LM.cn | 0) + 1;
  lmBubble(g.me, s); g.me.bubT = 5; lmChatAdd(lmMyName(), s, "me");
  try { const x = LM.room.presence({ ct: s, cn: LM.cn }); if (x && x.catch) x.catch(() => {}); } catch (e) { /* abaikan */ }
  return true;
}
function lmChatGot(e, raw) {
  const s = lmChatClean(raw); if (!s || lmChatContact(s) || lmMuted(e.id)) return;
  const t = lmChatFilter(s); e.last = t; lmBubble(e.av, t); e.av.bubT = 5; lmChatAdd(e.n, t);
}
/* senyap dan lapor (disimpan ikut uid peranti) */
const lmUidOf = (peer) => String(peer || "").split("_")[0];
function lmMutes() { if (!LM.mutes) { try { LM.mutes = JSON.parse(localStorage.getItem("gt-lm-mute") || "{}") || {}; } catch (e) { LM.mutes = {}; } } return LM.mutes; }
function lmMuted(peer) { return !!lmMutes()[lmUidOf(peer)]; }
function lmMuteSet(peer, on) {
  const m = lmMutes(), u = lmUidOf(peer); if (on) m[u] = 1; else delete m[u];
  try { localStorage.setItem("gt-lm-mute", JSON.stringify(m)); } catch (e) { /* abaikan */ }
  const e = LM.peers[peer]; if (on && e && e.av.bub) lmBubble(e.av, "");
}
function lmReport(peer) {
  const e = LM.peers[peer]; if (!e) return;
  LM.rep = LM.rep || {}; if (LM.rep[lmUidOf(peer)]) { toast("Pemain ini sudah dilaporkan.", "warn"); return; }
  LM.rep[lmUidOf(peer)] = 1; lmMuteSet(peer, true);
  if (FB.url) FB.req("POST", "lmlapor", { u: lmUidOf(peer), n: String(e.n).slice(0, 16), m: String(e.last || "").slice(0, 80), r: String((LM.roomKind === "open" ? "o-" : "") + (LM.roomCode || "")).slice(0, 24), by: FB.getUid(), t: { ".sv": "timestamp" } }).catch(() => {});
  toast("Laporan dihantar kepada pentadbir. Pemain ini disenyapkan untuk anda.", "ok");
}

/* ---------- suara tekan-untuk-cakap (WebRTC, hanya bilik sekolah/kod rakan) ----------
   Isyarat SDP lengkap (tanpa trickle) dihantar melalui medan kehadiran "vs"; peserta dengan id lebih kecil
   memulakan tawaran. Maksimum VC_MAX rakan terdekat dalam jarak VC_R. Tanpa pelayan TURN, sesetengah
   rangkaian (data mudah alih/CGNAT, tembok api sekolah) mungkin tidak dapat bersambung. */
const ICE = [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }];
const VC_R = 70, VC_MAX = 5;
function lmVoiceOk() { return !!LM.room && (LM.roomKind === "rakan" || LM.roomKind === "sekolah") && typeof RTCPeerConnection !== "undefined"; }
async function lmVoiceOn() {
  if (!lmVoiceOk()) { toast("Suara hanya untuk bilik sekolah atau bilik kod rakan.", "warn"); return; }
  if (LM.vc) return;
  const v = LM.vc = { stream: null, pcs: {}, sig: {}, tk: false, retry: {}, busy: false };
  lmVoiceUi();
  try {
    v.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    v.stream.getAudioTracks().forEach((t) => (t.enabled = false));
  } catch (e) { v.stream = null; toast("Mikrofon tidak dibenarkan. Anda masih boleh mendengar rakan.", "warn"); }
  if (LM.vc !== v) { if (v.stream) v.stream.getTracks().forEach((t) => t.stop()); return; }
  try { LM.room.presence({ vo: 1, tk: 0 }); } catch (e) { /* abaikan */ }
  lmVoiceUi();
}
function lmVoiceOff() {
  const v = LM.vc; LM.vc = null; if (!v) return;
  for (const id in v.pcs) lmPcClose(v, id);
  if (v.stream) v.stream.getTracks().forEach((t) => t.stop());
  if (LM.room) { try { LM.room.presence({ vo: null, tk: null, vs: null }); } catch (e) { /* abaikan */ } }
  lmVoiceUi();
}
function lmVoiceUi() {
  const ui = LM.ui; if (!ui.vcB) return;
  ui.vcB.hidden = !lmVoiceOk(); ui.vcB.textContent = LM.vc ? "🎙 Suara: buka" : "🎙 Suara: tutup";
  ui.ptt.hidden = !LM.vc; ui.ptt.classList.toggle("ok", !!(LM.vc && LM.vc.tk));
}
function lmPcClose(v, id) {
  const c = v.pcs[id]; if (!c) return; delete v.pcs[id];
  try { c.pc.close(); } catch (e) { /* abaikan */ }
  if (c.au) { try { c.au.pause(); } catch (e) { /* abaikan */ } c.au.srcObject = null; }
  if (v.sig[id]) { delete v.sig[id]; v.dirty = true; }
}
function lmTalk(on) {
  const v = LM.vc; if (!v) return;
  if (!v.stream) { if (on) lmChatAdd("", "Mikrofon tidak tersedia: anda hanya boleh mendengar.", "sys"); return; }
  if (v.tk === on) return;
  v.tk = on; v.stream.getAudioTracks().forEach((t) => (t.enabled = on));
  if (LM.room) { try { LM.room.presence({ tk: on ? 1 : 0 }); } catch (e) { /* abaikan */ } }
  lmVoiceUi();
}
function lmGather(pc) {
  return new Promise((res) => {
    if (pc.iceGatheringState === "complete") { res(); return; }
    const t = setTimeout(res, 2500);
    pc.addEventListener("icegatheringstatechange", () => { if (pc.iceGatheringState === "complete") { clearTimeout(t); res(); } });
  });
}
function lmPcNew(v, id) {
  const pc = new RTCPeerConnection({ iceServers: ICE });
  const c = { pc: pc, s: "", at: performance.now(), au: null, ok: false, rs: false };
  if (v.stream) v.stream.getAudioTracks().forEach((t) => pc.addTrack(t, v.stream)); else pc.addTransceiver("audio", { direction: "recvonly" });
  pc.ontrack = (ev) => {
    if (!c.au) { c.au = new Audio(); c.au.autoplay = true; }
    c.au.srcObject = ev.streams[0] || new MediaStream([ev.track]);
    const p = c.au.play(); if (p && p.catch) p.catch(() => {});
  };
  pc.onconnectionstatechange = () => { if (pc.connectionState === "connected") c.ok = true; };
  v.pcs[id] = c; return c;
}
async function lmVoiceTick(g) {
  const v = LM.vc, me = LM.myPeer; if (!v || v.busy || !me) return;
  if (!lmVoiceOk()) { lmVoiceOff(); return; }
  const now = performance.now(), want = {};
  Object.keys(LM.peers).map((id) => ({ id: id, e: LM.peers[id], d: Math.hypot(LM.peers[id].x - g.p.x, LM.peers[id].z - g.p.z) }))
    .filter((o) => o.e.vo && o.d < VC_R && !lmMuted(o.id)).sort((a, b) => a.d - b.d).slice(0, VC_MAX).forEach((o) => (want[o.id] = o));
  for (const id in v.pcs) if (!want[id]) lmPcClose(v, id);
  v.busy = true;
  try {
    for (const id in want) {
      const e = want[id].e, their = e.vs && typeof e.vs === "object" ? e.vs[me] : null; let c = v.pcs[id];
      if (c && (c.pc.connectionState === "failed" || (!c.ok && now - c.at > 20000))) { lmPcClose(v, id); v.retry[id] = now + 10000; c = null; }
      if (me < id) { /* pemula */
        if (!c) {
          if (now < (v.retry[id] || 0)) continue;
          c = lmPcNew(v, id); c.s = Math.random().toString(36).slice(2, 8);
          await c.pc.setLocalDescription(await c.pc.createOffer()); await lmGather(c.pc);
          if (v.pcs[id] !== c || LM.vc !== v) continue;
          v.sig[id] = { s: c.s, o: c.pc.localDescription.sdp }; v.dirty = true;
        } else if (!c.rs && their && their.s === c.s && typeof their.a === "string") { c.rs = true; await c.pc.setRemoteDescription({ type: "answer", sdp: their.a }); }
      } else if (their && typeof their.o === "string" && (!c || c.s !== their.s)) { /* penjawab */
        if (c) lmPcClose(v, id);
        c = lmPcNew(v, id); c.s = String(their.s || ""); c.rs = true;
        await c.pc.setRemoteDescription({ type: "offer", sdp: their.o }); await c.pc.setLocalDescription(await c.pc.createAnswer()); await lmGather(c.pc);
        if (v.pcs[id] !== c || LM.vc !== v) continue;
        v.sig[id] = { s: c.s, a: c.pc.localDescription.sdp }; v.dirty = true;
      }
      c = v.pcs[id]; if (c && c.au) c.au.volume = clamp(1.15 - want[id].d / VC_R, 0.15, 1);
    }
  } catch (err) { /* sambungan gagal: dicuba semula selepas tamat masa */ }
  v.busy = false;
  if (v.dirty && LM.vc === v && LM.room) { v.dirty = false; try { LM.room.presence({ vs: Object.keys(v.sig).length ? Object.assign({}, v.sig) : null }); } catch (e) { /* abaikan */ } }
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
#lmOv{position:fixed;inset:0;z-index:120;background:#0b2a44;color:#f3f7fb;font-family:Nunito,system-ui,sans-serif;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;overscroll-behavior:none}
#lmOv[hidden]{display:none}
#lmOv canvas.lm-cv{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
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
#lmOv .lm-guide{position:absolute;left:max(10px,env(safe-area-inset-left));top:calc(max(10px,env(safe-area-inset-top)) + 44px);width:min(330px,calc(100vw - 180px));background:rgba(10,30,52,.86);border:2px solid #ffd45a;border-radius:14px;padding:8px 12px;font-size:13px;line-height:1.35;color:#fff;cursor:pointer;box-shadow:0 6px 16px rgba(0,0,0,.35)}
#lmOv .lm-guide .gh{display:flex;align-items:center;gap:8px;margin-bottom:3px}#lmOv .lm-guide .gh b{color:#ffd45a;flex:1}#lmOv .lm-guide .gh span{font-size:12px;opacity:.85}
#lmOv .lm-guide .gt{border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.08);color:#fff;border-radius:99px;font-size:11px;padding:3px 8px;cursor:pointer}
#lmOv .lm-guide .gm{display:flex;align-items:center;gap:6px;font-size:14px}#lmOv .lm-guide .ga{display:inline-block;color:#ffd45a;font-size:18px;transition:transform .2s}
#lmOv .lm-guide .gs{opacity:.9;margin-top:2px}#lmOv .lm-guide .gr{margin-top:4px;padding:4px 8px;border-radius:8px;background:rgba(80,160,255,.18);color:#cfe6ff}
#lmOv .lm-guide .gx{margin-top:4px;color:#ffd166}
#lmOv .lm-akdone{position:absolute;left:50%;top:22%;transform:translateX(-50%);width:min(560px,92vw);display:grid;gap:6px;padding:14px 16px;border-radius:14px;background:rgba(10,60,40,.92);border:2px solid #ffd45a;color:#fff;font-size:14px;line-height:1.45;text-align:center;pointer-events:none;animation:lmPopIn .3s ease-out}#lmOv .lm-akdone b{color:#ffd45a;font-size:16px}#lmOv .lm-akdone small{opacity:.8}@keyframes lmPopIn{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translateX(-50%)}}#lmOv .lm-lcpop{position:absolute;left:50%;top:30%;transform:translateX(-50%);display:flex;align-items:center;gap:12px;min-width:min(380px,90vw);max-width:92vw;padding:12px 18px;border-radius:16px;background:linear-gradient(135deg,rgba(11,74,74,.95),rgba(8,47,54,.95));border:2px solid #ffd45a;color:#fff;box-shadow:0 10px 30px rgba(0,0,0,.4);pointer-events:none;animation:lmPopIn .35s ease-out;z-index:6}#lmOv .lm-lcpop>i{font-style:normal;font-size:40px;line-height:1}#lmOv .lm-lcpop>div{display:grid;gap:2px}#lmOv .lm-lcpop small{color:#ffd45a;font-weight:700;letter-spacing:.06em;text-transform:uppercase;font-size:11px}#lmOv .lm-lcpop b{font-size:17px}#lmOv .lm-lcpop span{font-size:12.5px;opacity:.85}#lmOv .lm-lcgrid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}#lmOv .lm-lc{display:grid;gap:3px;justify-items:center;text-align:center;padding:10px 8px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);font-size:12px;opacity:.75}#lmOv .lm-lc>i{font-style:normal;font-size:30px;filter:grayscale(1);opacity:.45}#lmOv .lm-lc b{font-size:13px}#lmOv .lm-lc small{opacity:.8}#lmOv .lm-lc .lm-bar{width:100%}#lmOv .lm-lc.on{opacity:1;background:rgba(255,212,90,.12);border-color:#ffd45a}#lmOv .lm-lc.on>i{filter:none;opacity:1}#lmOv .lm-lc.on small{color:#ffd45a}
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
#lmOv .lm-big{position:absolute;inset:0;z-index:3;background:rgba(3,12,22,.92);display:flex;flex-direction:column;gap:6px;padding:max(8px,env(safe-area-inset-top)) max(8px,env(safe-area-inset-right)) max(8px,env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left))}
#lmOv .lm-big-top{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
#lmOv .lm-big-top .lm-kick{flex:1 1 180px;min-width:0;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#lmOv .lm-big-top button{padding:6px 10px;font-size:13px;margin:0}
#lmOv .lm-big-top button[aria-pressed="true"]{background:#ffd45a;color:#0b2a44}
#lmOv .lm-big-x{width:42px;height:42px;padding:0!important;border-radius:50%;font-size:20px!important;font-weight:900;background:#ff5d5d!important;color:#fff!important;border:2px solid #fff!important;flex:none}
#lmOv .lm-big-map{position:relative;flex:1;min-height:0;border-radius:14px;overflow:hidden;border:2px solid rgba(255,255,255,.25);background:#06182a;display:grid;place-items:center;touch-action:none}
#lmOv .lm-big-map canvas{display:block;cursor:crosshair;touch-action:none}
#lmOv .lm-big-dr{max-height:34vh;overflow:auto;display:grid;gap:8px;padding:4px}
#lmOv .lm-big-dr[hidden]{display:none}
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
#lmOv .lm-chat{position:absolute;left:max(10px,env(safe-area-inset-left));bottom:calc(76px + env(safe-area-inset-bottom));width:min(340px,46vw);display:flex;flex-direction:column;gap:4px;z-index:1}
#lmOv .lm-chat[hidden]{display:none}
#lmOv .lm-chat .log{display:flex;flex-direction:column;gap:3px;pointer-events:none}
#lmOv .lm-chat .ln{background:rgba(8,24,40,.72);border-radius:10px;padding:4px 9px;font:700 13px/1.35 Nunito,sans-serif;overflow-wrap:anywhere;transition:opacity .6s}
#lmOv .lm-chat .ln b{color:#ffd45a}#lmOv .lm-chat .ln.me b{color:#6fe0a6}#lmOv .lm-chat .ln.sys{color:#ffc2a8;font-style:italic}
#lmOv .lm-chat .ln.old{opacity:0}#lmOv .lm-chat.open .ln.old{opacity:.85}
#lmOv .lm-chat form{display:flex;gap:6px}
#lmOv .lm-chat input{flex:1;min-width:0;font:700 14px Nunito,sans-serif;padding:8px 10px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(8,24,40,.82);color:#fff}
#lmOv .lm-chat button{padding:6px 10px}
#lmOv.touch .lm-chat{left:50%;transform:translateX(-50%);bottom:calc(10px + env(safe-area-inset-bottom));width:min(340px,44vw)}
#lmOv .lm-ptt{position:absolute;right:calc(16px + env(safe-area-inset-right));bottom:calc(16px + env(safe-area-inset-bottom));padding:12px 16px;border-radius:16px;font-size:15px}
#lmOv.touch .lm-ptt{bottom:calc(112px + env(safe-area-inset-bottom));border-radius:50%;width:72px;height:72px;padding:0;font-size:12px}
#lmOv .lm-ptt.ok{background:#d6453d;border-color:#ffb4ad}
#lmOv .lm-leg{display:flex;flex-wrap:wrap;gap:6px 14px;justify-content:center;font:800 13px Nunito,sans-serif;color:#d4e2ee}
#lmOv .lm-leg span{display:flex;align-items:center;gap:6px}#lmOv .lm-leg i{width:11px;height:11px;border-radius:50%;border:1.5px solid #0b2a44;display:inline-block}
#lmOv .lm-who{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center;max-width:96vw;font-size:13px}#lmOv .lm-who button{font-size:13px;padding:5px 10px}#lmOv .lm-who .muted{color:#b9cde0}
#lmOv .lm-pl{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}#lmOv .lm-pl button{font-size:12px;padding:4px 8px}
@media (max-height:500px){#lmOv .lm-top{flex-direction:row;flex-wrap:wrap;justify-content:flex-end;max-width:62vw;top:calc(max(10px,env(safe-area-inset-top)) + 84px)}#lmOv .lm-top button{padding:6px 9px;font-size:12px}#lmOv .lm-mm{width:150px;height:76px}#lmOv .lm-quest{font-size:12px;max-width:220px}}
@media (max-width:640px){#lmOv .lm-mm{width:140px;height:72px}#lmOv .lm-top{top:calc(max(10px,env(safe-area-inset-top)) + 80px)}#lmOv .lm-hud{max-width:calc(100% - 160px)}#lmOv .lm-emo{display:none}#lmOv .lm-quest{display:none}#lmOv .lm-guide{font-size:12px;width:min(260px,calc(100vw - 170px));padding:6px 9px}}
/* telefon (sentuh, skrin kecil): paparan minimal - tempat & waktu sahaja, selebihnya dalam "☰ Menu" */
#lmOv .lm-mb,#lmOv .lm-cb{display:none}
@media (max-height:600px),(max-width:760px){
#lmOv.touch .lm-pill{padding:4px 10px;font-size:12px}
#lmOv.touch .lm-pill[data-m]{display:none}#lmOv.touch .lm-pill[data-m].warn{display:flex}
#lmOv.touch.menu .lm-pill[data-m]:not([hidden]){display:flex}
#lmOv.touch .lm-mm{width:128px;height:65px;border-width:1.5px}
#lmOv.touch .lm-top{top:calc(max(10px,env(safe-area-inset-top)) + 72px);flex-direction:row;flex-wrap:wrap;justify-content:flex-end;align-items:center;max-width:min(330px,48vw)}
#lmOv.touch.menu .lm-top{background:rgba(8,24,40,.85);border:1px solid rgba(255,255,255,.2);border-radius:14px;padding:8px}
#lmOv.touch .lm-top button{display:none;padding:6px 11px;font-size:12px}
#lmOv.touch .lm-top .lm-mb{display:block;order:-1;flex-basis:100%;text-align:center}
#lmOv.touch.menu .lm-top button:not([hidden]){display:block}
#lmOv.touch .lm-quest{display:none}
#lmOv.touch.menu .lm-quest{display:block;top:auto!important;bottom:calc(150px + env(safe-area-inset-bottom));height:auto;min-height:0}
#lmOv.touch .lm-guide{width:min(250px,calc(100vw - 180px));padding:5px 9px;font-size:12px;border-width:1.5px;top:calc(max(10px,env(safe-area-inset-top)) + 34px)}
#lmOv.touch .lm-guide .gs,#lmOv.touch .lm-guide .gr,#lmOv.touch .lm-guide .gx,#lmOv.touch .lm-guide .gt{display:none}
#lmOv.touch .lm-guide .gh{margin:0;font-size:11px}#lmOv.touch .lm-guide .gm{font-size:13px;white-space:nowrap;overflow:hidden}#lmOv.touch .lm-guide .gm b{overflow:hidden;text-overflow:ellipsis;min-width:0}#lmOv.touch .lm-guide .gm span{flex:none}
#lmOv.touch .lm-chat{display:none}#lmOv.touch.chat .lm-chat:not([hidden]){display:flex;bottom:calc(96px + env(safe-area-inset-bottom))}
#lmOv.touch .lm-tc{gap:8px}#lmOv.touch .lm-tc button{width:52px;height:52px;font-size:12px}#lmOv.touch .lm-tc button.big{width:64px;height:64px}
#lmOv.touch .lm-tc .lm-cb:not([hidden]){display:block;font-size:20px}
#lmOv.touch .lm-prompt{font-size:15px;padding:9px 18px;bottom:calc(96px + env(safe-area-inset-bottom))}
#lmOv.touch .lm-js{left:calc(18px + env(safe-area-inset-left));bottom:calc(16px + env(safe-area-inset-bottom));opacity:.8}
}
@media (prefers-reduced-motion:reduce){#lmOv .lm-prompt,#lmOv .lm-box,#lmOv .lm-toast{animation:none}}
`;
function lmRoot() {
  if (!document.getElementById("lmCss")) { const s = document.createElement("style"); s.id = "lmCss"; s.textContent = LM_CSS; document.head.appendChild(s); }
  let r = document.getElementById("lmOv");
  if (!r) { r = el("div", { id: "lmOv", role: "dialog", "aria-modal": "true", "aria-label": "META DIDIK" }); document.body.appendChild(r); }
  r.textContent = ""; r.hidden = false; r.classList.toggle("touch", !!TOUCH);
  LM.root = r; return r;
}
function lmCard(build, cls) {
  lmCardClose();
  const g = LM.g; if (g) { g.ui = true; for (const k in LM.keys) LM.keys[k] = false; }
  if (LM.vc) lmTalk(false);
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
  b.append(el("div", { class: "lm-kick" }, "Dunia maya · " + SUBJS[SUBJ].nama), el("h2", null, "META DIDIK"));
  b.append(el("p", null, "Jelajah peta Malaysia 3D bersama rakan. Kesemua " + nT + " tajuk " + SUBJS[SUBJ].subjek + " dipegang oleh Stesen Ilmu di institusi sebenar seluruh Malaysia (masjid, mahkamah, Parlimen, Bursa Malaysia dan lain-lain). Universiti awam pula menjadi galeri Kembara Kampus."));
  b.append(el("p", { class: "lm-ex" }, (LM.ownSk ? "Perjalanan menuntut ilmu: anda bermula di sekolah anda, " + LM.ownSk.n + ", kemudian kembara ke setiap Stesen Ilmu. Setiap stesen memegang tajuk yang berkait dengan institusi itu. " : "Sekolah anda tidak ditemui; misi bermula di KLIA. Pastikan nama sekolah di profil sama seperti nama rasmi (contoh: SMK Taman Universiti). ") + "Kawalan: W A S D atau anak panah untuk bergerak, Shift lari, Space lompat, E berinteraksi, M peta, P pasport, T senarai tajuk, seret tetikus untuk pusing kamera. Di telefon: kayu bedik kiri dan butang kanan."));
  const solo = lmBtn("Main solo", Net.room ? "" : "pri", () => lmStart(""));
  const row = el("div", { class: "lm-row" });
  if (Net.room) row.append(lmBtn("🌏 Masuk Dunia Terbuka", "pri", () => lmStart("", "open")));
  row.append(solo);
  if (Net.room) {
    const sid = typeof mySid === "function" ? mySid() : "";
    row.append(lmBtn("Cipta bilik rakan", "", () => lmStart(lmCode(), "rakan")));
    if (sid) row.append(lmBtn("Bilik sekolah saya", "", () => lmStart("s" + String(hashStr(sid)).slice(0, 7), "sekolah")));
    const inp = el("input", { class: "lm-in", maxlength: "6", placeholder: "KOD", "aria-label": "Kod bilik rakan", autocomplete: "off" });
    const join = lmBtn("Masuk kod", "", () => { const v = String(inp.value || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); if (v.length < 4) { toast("Masukkan kod bilik 4 hingga 6 aksara.", "warn"); return; } lmStart(v, "rakan"); });
    inp.addEventListener("keydown", (e) => { e.stopPropagation(); if (e.key === "Enter") join.click(); });
    b.append(row, el("div", { class: "lm-row" }, inp, join));
    b.append(el("p", { class: "lm-ex" }, "🌏 Dunia Terbuka: murid dari seluruh Malaysia boleh terus masuk dan berbual melalui chat. Hanya nama pertama dipaparkan. Kata kesat ditapis; pautan dan nombor telefon disekat. Tekan Bilik untuk senyapkan atau laporkan pemain. Mic (tekan-untuk-cakap) hanya ada dalam bilik sekolah dan bilik kod rakan."));
  } else {
    b.append(row, el("p", { class: "lm-ex" }, "Main bersama rakan memerlukan sambungan pelayan Firebase (versi GitHub Pages). Mod solo tetap boleh dimainkan."));
  }
  const q = LM.st.gq;
  const gq = lmBtn("Grafik: " + (q ? "Tinggi" : "Jimat"), "", () => { LM.st.gq = LM.gq = q ? 0 : 1; lmSave(); lmSetup(); });
  const x = lmBtn("Tutup", "", lmClose);
  const rf = lmBtn("Muat semula versi terkini", "", () => { if (typeof appHardReload === "function") appHardReload(); else location.reload(); });
  b.append(el("div", { class: "lm-row" }, gq, rf, x));
  const st = lmSummary();
  b.append(el("p", { class: "lm-ex" }, "Pasport anda: " + st.pl + "/" + st.plN + " tempat diziarahi, " + st.tw + "/" + st.twN + " Menara Ilmu ditawan."));
  b.append(el("p", { class: "lm-ex", style: "font-size:12px;opacity:.75" }, "META DIDIK v" + (typeof APP_VER !== "undefined" ? APP_VER : "?") + ". Jika tidak dapat bergerak atau paparan lama, tekan Muat semula versi terkini."));
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

/* ---------- v18.13: lencana META DIDIK ----------
   [id, ikon, nama, syarat, fungsi kemajuan -> [capai, sasaran]]; disimpan dalam LM.st.lc (id -> masa) */
const LCN = [
  ["ipta1", "📖", "Langkah Pertama", "Dapatkan cop Stesen Ilmu pertama", () => { const J = lmJourney(); return [J.d, 1]; }],
  ["ipta5", "📚", "Pencinta Ilmu", "Dapatkan cop 5 Stesen Ilmu", () => { const J = lmJourney(); return [J.d, Math.min(5, J.t || 5)]; }],
  ["iptaAll", "🏛", "Graduan META DIDIK", "Lengkapkan semua Stesen Ilmu", () => { const J = lmJourney(); return [J.d, J.t || 1]; }],
  ["tw10", "🏰", "Penawan Tajuk", "Tawan 10 tajuk (betul 3/5 atau lebih)", () => [lmSummary().tw, 10]],
  ["pl10", "📘", "Pengembara", "Ziarahi 10 tempat bersejarah", () => [lmSummary().pl, 10]],
  ["plAll", "🗺", "Pengembara Agung", "Ziarahi semua tempat dalam peta", () => { const s = lmSummary(); return [s.pl, s.plN]; }],
  ["ak1", "🤝", "Ringan Tangan", "Bantu orang dalam satu situasi akhlak", () => [LM.st.ak | 0, 1]],
  ["ak5", "💚", "Pemurah Budi", "Selesaikan 5 situasi akhlak", () => [LM.st.ak | 0, 5]],
  ["akAll", "🌟", "Insan Berakhlak Mulia", "Selesaikan setiap jenis situasi akhlak", () => [Object.keys(LM.st.akT || {}).filter((k) => AKH.some((a) => a.id === k)).length, AKH.length]],
  ["fd1", "🍽", "Selera Tempatan", "Rasa satu masakan tradisi negeri", () => [Object.keys(LM.st.food || {}).length, 1]],
  ["fdAll", "🍛", "Duta Juadah Malaysia", "Rasa masakan tradisi setiap negeri", () => [FOOD.filter((f) => (LM.st.food || {})[f[0]]).length, FOOD.length]],
  ["rail", "🚆", "Penumpang Kereta Api", "Naik ETS, ECRL, KTM Komuter atau kereta api lain", () => [LM.st.rt | 0, 1]],
  ["kampus5", "🎓", "Kembara Kampus", "Lawati galeri 5 kampus IPT", () => [Object.keys(LM.st.kp || {}).length, 5]],
  ["tetamu", "🕋", "Tetamu Allah", "Selesaikan Umrah atau Haji di Tanah Suci", () => [Object.keys(LM.st.ts || {}).length ? 1 : 0, 1]],
  ["metro", "🚇", "Warga Kota", "Naik MRT, LRT atau Monorel", () => [LM.st.rm | 0, 1]],
  ["bus", "🚌", "Kembara Lebuh Raya", "Naik bas ekspres di lebuh raya", () => [LM.st.rb | 0, 1]],
  ["fly", "✈", "Juruterbang Muda", "Terbang dengan Didik Air", () => [LM.st.fl | 0, 1]],
  ["ap5", "🛬", "Pelancong Udara", "Mendarat di 5 lapangan terbang", () => [Object.keys(LM.st.ap || {}).length, 5]],
  ["borneo", "🌴", "Jambatan Malaysia", "Jejakkan kaki di Semenanjung dan Borneo", () => [[2, 4].filter((m) => LM.st.bo & m).length, 2]],
  ["swim", "🏊", "Perenang Pantai", "Berenang di tepi pantai", () => [LM.st.sw | 0, 1]],
  ["kh", "🏝", "Wira Pulau", "Lulus satu Misi Khas di pulau (7/10)", () => [Object.values(LM.st.kh || {}).some((r) => r && r.b >= 7) ? 1 : 0, 1]]
];
function lmLcProg(L) { let r = [0, 1]; try { r = L[4](); } catch (e) { r = [0, 1]; } return [Math.min(r[0] | 0, r[1] | 0), Math.max(1, r[1] | 0)]; }
function lmLcCount() { const lc = LM.st.lc || {}; return LCN.filter((L) => lc[L[0]]).length; }
/* semak lencana baharu (setiap saat dari HUD); kali pertama: rekod senyap untuk pemain lama */
function lmLcCheck(g) {
  if (!g || !g.ilmu) return;
  if (lmBorneo(lmAt(g.p.x, g.p.z) || "") && !g.flight) { if (!(LM.st.bo & 2)) LM.st.bo = (LM.st.bo | 0) | 2; }
  else if (DATA.negeri[lmAt(g.p.x, g.p.z)] && !(LM.st.bo & 4)) LM.st.bo = (LM.st.bo | 0) | 4;
  const first = !LM.st.lc, lc = LM.st.lc || (LM.st.lc = {}), add = [];
  LCN.forEach((L) => { if (lc[L[0]]) return; const p = lmLcProg(L); if (p[0] >= p[1]) { lc[L[0]] = Date.now(); add.push(L); } });
  if (!add.length) { if (first) lmSave(); return; }
  lmSave();
  if (first) { lmPop("🏅 " + add.length + " lencana META DIDIK telah direkodkan"); return; }
  const xp = lmXp(10 * add.length);
  add.forEach((L, i) => setTimeout(() => lmLcShow(L, i ? 0 : xp), i * 3800));
}
function lmLcShow(L, xp) {
  if (!LM.root) return; lmSnd("win");
  const ex = el("div", { class: "lm-lcpop" }, el("i", null, L[1]), el("div", null, el("small", null, "🏅 Lencana baharu"), el("b", null, L[2]), el("span", null, L[3] + (xp ? " · XP +" + xp : ""))));
  LM.root.appendChild(ex); setTimeout(() => ex.remove(), 3600);
}
function lmLcPassport(b) {
  const lc = LM.st.lc || {}, n = lmLcCount(), J = lmJourney();
  b.append(el("p", { class: "lm-ex" }, "Lencana diperoleh: " + n + "/" + LCN.length + ". Kumpul lencana dengan menuntut ilmu, mengembara, membantu orang dan merasa juadah setiap negeri."));
  const grid = el("div", { class: "lm-grid lm-lcgrid" });
  LCN.forEach((L) => {
    const on = !!lc[L[0]], p = lmLcProg(L), c = el("div", { class: "lm-lc" + (on ? " on" : "") });
    c.append(el("i", null, L[1]), el("b", null, L[2]), el("div", null, L[3]));
    if (on) c.append(el("small", null, "✔ " + new Date(lc[L[0]]).toLocaleDateString("ms-MY")));
    else { if (p[1] > 2) c.append(el("small", null, p[0] + "/" + p[1])); const bar = el("div", { class: "lm-bar" }), bi = el("i"); bi.style.width = Math.round(100 * p[0] / p[1]) + "%"; bar.appendChild(bi); c.append(bar); }
    grid.appendChild(c);
  });
  const sj = el("div", { class: "lm-stamp" + (J.t && J.d >= J.t ? " on" : ""), style: "margin:10px 0" });
  sj.append(el("b", null, "📜 Sijil Khas META DIDIK · " + SUBJS[SUBJ].subjek));
  if (J.t && J.d >= J.t) sj.append(el("div", null, "Tahniah! Anda layak menerima sijil kerana telah menamatkan perjalanan menuntut ilmu."), lmBtn("Muat turun sijil (PDF)", "pri", lmCertGet));
  else sj.append(el("div", null, "Lengkapkan semua Stesen Ilmu untuk membuka sijil (" + J.d + "/" + J.t + ")." + (J.next ? " Seterusnya: " + J.next.sn + "." : "")));
  b.append(sj, grid);
}
/* sijil khas META DIDIK (guna pembantu sijil dalam app.js) */
function lmCertOk() { const J = lmJourney(); return !!(J.t && J.d >= J.t); }
async function lmCertGet() {
  if (!lmCertOk()) { toast("Lengkapkan semua Stesen Ilmu dahulu untuk menerima sijil.", "warn"); return; }
  if (!P.nama) { toast("Daftar nama anda dahulu.", "warn"); return; }
  toast("Menyediakan sijil...", "ok");
  let jpg = null, scale = 2;
  for (const sc of [2, 1]) {
    try { const c = await lmCertCanvas(sc); const bl = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.93)); if (bl) { jpg = new Uint8Array(await bl.arrayBuffer()); scale = sc; break; } } catch (e) { /* cuba saiz lebih kecil */ }
  }
  if (!jpg) { toast("Sijil gagal dijana. Cuba lagi.", "warn"); return; }
  const nm = "Sijil-Meta-Didik-" + cleanFull(P.penuh || P.nama).replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "") + ".pdf";
  const r = await saveFile(certPdf(jpg, 1754 * scale, 1240 * scale), nm);
  if (r === "ok") { LM.st.sj = LM.st.sj || Date.now(); lmSave(); toast("Sijil META DIDIK telah dimuat turun.", "ok"); }
}
async function lmCertCanvas(scale) {
  await certLoadFonts();
  const now = Date.now(), W = 1754, H = 1240, c = document.createElement("canvas");
  c.width = W * scale; c.height = H * scale;
  const g = c.getContext("2d"); g.scale(scale, scale);
  const TEAL = "#0b4a4a", DEEP = "#082f36", GOLD = "#b8902c", GOLD2 = "#d9b44a", RED = "#8c1d2c", PAPER = "#f8f6ec", INK = "#2a2a2a", MUTE = "#5c5a52";
  const SERIF = "'Cormorant Garamond', Georgia, 'Times New Roman', serif", CAPS = "Cinzel, 'Times New Roman', serif", SANS = "Barlow, Arial, sans-serif";
  const J = lmJourney(), s = lmSummary(), sub = SUBJS[SUBJ].subjek;
  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  /* corak guilloche halus */
  g.save(); g.globalAlpha = 0.5;
  certRosette(g, W / 2, H / 2 + 30, 520, 173, 240, "rgba(11,74,74,0.12)", 1.2);
  certRosette(g, W / 2, H / 2 + 30, 430, 113, 190, "rgba(184,144,44,0.12)", 1);
  g.restore();
  g.fillStyle = DEEP; g.fillRect(0, 0, W, 22); g.fillRect(0, H - 22, W, 22);
  g.fillStyle = GOLD; g.fillRect(0, 22, W, 4); g.fillRect(0, H - 26, W, 4);
  g.strokeStyle = TEAL; g.lineWidth = 10; g.strokeRect(48, 48, W - 96, H - 96);
  g.strokeStyle = GOLD; g.lineWidth = 3; g.strokeRect(66, 66, W - 132, H - 132);
  g.strokeStyle = TEAL; g.lineWidth = 1.5; g.strokeRect(78, 78, W - 156, H - 156);
  [[78, 78, 1, 1], [W - 78, 78, -1, 1], [78, H - 78, 1, -1], [W - 78, H - 78, -1, -1]].forEach(([x, y, sx, sy]) => {
    g.save(); g.translate(x, y); g.scale(sx, sy);
    g.fillStyle = GOLD; g.beginPath(); g.moveTo(0, 0); g.lineTo(80, 0); g.lineTo(0, 80); g.closePath(); g.fill();
    g.fillStyle = TEAL; g.beginPath(); g.moveTo(0, 0); g.lineTo(50, 0); g.lineTo(0, 50); g.closePath(); g.fill();
    g.fillStyle = PAPER; certStar(g, 22, 22, 13, 5); g.fill(); g.restore();
  });
  /* lambang: globe bergaris dalam heksagon */
  const ex = W / 2, ey = 158;
  g.fillStyle = TEAL; certHex(g, ex, ey, 58, Math.PI / 6); g.fill();
  g.strokeStyle = GOLD2; g.lineWidth = 4; certHex(g, ex, ey, 58, Math.PI / 6); g.stroke();
  g.strokeStyle = GOLD2; g.lineWidth = 2.5; g.beginPath(); g.arc(ex, ey, 30, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.ellipse(ex, ey, 13, 30, 0, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(ex - 30, ey); g.lineTo(ex + 30, ey); g.moveTo(ex - 26, ey - 15); g.lineTo(ex + 26, ey - 15); g.moveTo(ex - 26, ey + 15); g.lineTo(ex + 26, ey + 15); g.stroke();
  certText(g, "META DIDIK · " + sub.toUpperCase(), W / 2, 250, "600 26px " + CAPS, TEAL, "center", 7, 1200);
  certText(g, "SIJIL KHAS", W / 2, 338, "700 88px " + CAPS, TEAL, "center", 8);
  certText(g, "PERJALANAN MENUNTUT ILMU", W / 2, 396, "700 32px " + CAPS, RED, "center", 8);
  g.font = "700 32px " + CAPS; try { g.letterSpacing = "8px"; } catch (e) { /* abaikan */ }
  const hw = g.measureText("PERJALANAN MENUNTUT ILMU").width / 2; try { g.letterSpacing = "0px"; } catch (e) { /* abaikan */ }
  g.strokeStyle = GOLD; g.lineWidth = 2.5; g.beginPath(); g.moveTo(W / 2 - hw - 170, 385); g.lineTo(W / 2 - hw - 28, 385); g.moveTo(W / 2 + hw + 28, 385); g.lineTo(W / 2 + hw + 170, 385); g.stroke();
  certText(g, "Dengan ini disahkan bahawa", W / 2, 460, "italic 500 34px " + SERIF, MUTE, "center", 0);
  certText(g, cleanFull(P.penuh || P.nama).toUpperCase(), W / 2, 552, "600 92px " + SERIF, TEAL, "center", 3, 1300);
  g.strokeStyle = GOLD; g.lineWidth = 2; g.beginPath(); g.moveTo(W / 2 - 330, 576); g.lineTo(W / 2 + 330, 576); g.stroke();
  const asal = [cleanSekolah(P.sekolah), negeriNama(P.negeri)].filter(Boolean).join(", ") + (P.kelas ? " | " + P.kelas : "");
  certText(g, asal, W / 2, 624, "600 30px " + SANS, INK, "center", 1.5, 1350);
  certText(g, "telah menamatkan perjalanan menuntut ilmu dalam dunia maya META DIDIK,", W / 2, 688, "italic 500 34px " + SERIF, INK, "center", 0, 1400);
  certText(g, "mengembara ke " + J.t + " Stesen Ilmu di seluruh Malaysia dan lulus setiap tajuk " + sub + ".", W / 2, 730, "italic 500 34px " + SERIF, INK, "center", 0, 1400);
  const stats = [[J.d + " / " + J.t, "Stesen Ilmu"], [s.tw + " / " + s.twN, "Tajuk ditawan"], [lmLcCount() + " / " + LCN.length, "Lencana"], [String(LM.st.ak | 0), "Akhlak terpuji"], [s.pl + " / " + s.plN, "Tempat diziarahi"]];
  const bw = 270, gap = 22, x0 = W / 2 - (bw * 5 + gap * 4) / 2, by = 778;
  stats.forEach((t, i) => {
    const x = x0 + i * (bw + gap);
    g.fillStyle = "rgba(11,74,74,0.05)"; g.fillRect(x, by, bw, 94);
    g.strokeStyle = "rgba(184,144,44,0.7)"; g.lineWidth = 1.5; g.strokeRect(x, by, bw, 94);
    g.fillStyle = GOLD; g.fillRect(x, by, 6, 94);
    certText(g, t[0], x + bw / 2, by + 50, "700 38px " + CAPS, TEAL, "center", 1, bw - 30);
    certText(g, t[1].toUpperCase(), x + bw / 2, by + 79, "600 16px " + SANS, MUTE, "center", 2.5);
  });
  /* deretan lencana (bulatan emas = diperoleh) */
  const lc = LM.st.lc || {}, nL = LCN.length, dx = 34, lx0 = W / 2 - (nL - 1) * dx / 2;
  LCN.forEach((L, i) => { const on = !!lc[L[0]], x = lx0 + i * dx, y = 912; g.fillStyle = on ? GOLD2 : "rgba(92,90,82,0.18)"; g.beginPath(); g.arc(x, y, 11, 0, Math.PI * 2); g.fill(); if (on) { g.fillStyle = TEAL; certStar(g, x, y, 7, 3); g.fill(); } });
  const d = new Date(now), tarikh = d.getDate() + " " + BULAN[d.getMonth()] + " " + d.getFullYear(), ly = 1066;
  g.strokeStyle = TEAL; g.lineWidth = 1.5; g.beginPath(); g.moveTo(190, ly); g.lineTo(520, ly); g.moveTo(W - 520, ly); g.lineTo(W - 190, ly); g.stroke();
  certText(g, tarikh, 355, ly - 14, "italic 600 34px " + SERIF, TEAL, "center", 0);
  certText(g, "TARIKH", 355, ly + 26, "600 16px " + SANS, MUTE, "center", 3);
  certText(g, CERT.issuer, W - 355, ly - 14, "italic 700 34px " + SERIF, TEAL, "center", 0);
  certText(g, "DIKELUARKAN OLEH", W - 355, ly + 26, "600 16px " + SANS, MUTE, "center", 3);
  const sx = W / 2, sy = 1036;
  g.fillStyle = GOLD; g.beginPath(); for (let i = 0; i < 32; i++) { const a = i * Math.PI / 16, r = i % 2 ? 70 : 80; g[i ? "lineTo" : "moveTo"](sx + Math.cos(a) * r, sy + Math.sin(a) * r); } g.closePath(); g.fill();
  g.fillStyle = TEAL; g.beginPath(); g.arc(sx, sy, 63, 0, Math.PI * 2); g.fill();
  g.strokeStyle = GOLD2; g.lineWidth = 2.5; g.beginPath(); g.arc(sx, sy, 56, 0, Math.PI * 2); g.stroke();
  g.fillStyle = GOLD2; certStar(g, sx, sy - 8, 26, 11); g.fill();
  certText(g, "GRADUAN", sx, sy + 38, "700 12px " + CAPS, GOLD2, "center", 2.5);
  certText(g, "No. sijil: " + certNo(now).replace(/^GT-/, "MG-"), W / 2, 1136, "500 17px " + SANS, MUTE, "center", 2);
  certText(g, "Sijil ini dikeluarkan oleh sistemguru.my melalui META DIDIK dan bukan sijil rasmi Kementerian Pendidikan Malaysia.", W / 2, 1156, "500 14px " + SANS, MUTE, "center", 0.5);
  return c;
}

/* ---------- kuiz ---------- */
function lmPickQs(tids, n) {
  let pool = []; tids.forEach((t) => { pool = pool.concat(BYTOPIK[t] || []); });
  if (pool.length < n) pool = pool.concat(shuffle(QLIST.slice()).slice(0, n * 3));
  /* v18.16: soalan yang baru dijawab (120 terakhir) diletakkan di belakang supaya tidak kerap berulang */
  const rec = Array.isArray(LM.st.qr) ? LM.st.qr : (LM.st.qr = []), recS = new Set(rec);
  const sh = shuffle(pool.slice()), ord = sh.filter((q) => !recS.has(q.i)).concat(sh.filter((q) => recS.has(q.i)));
  const seen = new Set(), out = [];
  for (const q of ord) { if (seen.has(q.i)) continue; seen.add(q.i); out.push(q); if (out.length >= n) break; }
  out.forEach((q) => rec.push(q.i)); if (rec.length > 120) rec.splice(0, rec.length - 120);
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
  /* v18.2: setiap kali kuiz selesai, avatar meraikan dahulu (cara keraian dipilih di Gudang) */
  const done = () => {
    const pass = z.ok >= opt.pass, fin = () => { if (LM.g) opt.onDone(pass, z.ok, z.qs.length); };
    lmCardClose(); const d = opt.noRai ? 0 : lmRai(); if (d) setTimeout(fin, d * 1000 + 250); else fin();
  };
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
        b.append(el("p", { class: "lm-ex" }, "XP +" + xp + (xp === 0 ? " (kuota XP harian META DIDIK telah penuh)" : "") + (pass && fr ? " · Bonus rakan: +2 syiling kerana " + fr + " rakan berada berdekatan." : "")));
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
    kick: "Ziarah · " + DATA.negeri[pl.k].pendek, title: pl.n, pass: 3, qs: lmPickQs(tids, 5),
    intro: (b) => {
      b.append(el("div", { class: "lm-kick" }, "Tempat pelancongan · " + DATA.negeri[pl.k].nama), el("h2", null, pl.n));
      b.append(el("p", null, pl.fakta));
      b.append(el("p", { class: "lm-ex" }, (seen ? "Anda sudah menziarahi tempat ini. " : "") + "Jawab 5 soalan (betul sekurang-kurangnya 3) untuk mendapat cop pasport dan menggantung nama pada Papan Kenangan." + (pl.count ? " Sudah " + pl.count + " pelawat menggantung nama di sini." : "")));
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
        b.append(el("p", { class: "lm-ex" }, "XP +" + xp + (xp === 0 && ok ? " (kuota XP harian META DIDIK telah penuh)" : "")));
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
    b.append(el("div", { class: "lm-kick" }, "Lapangan terbang · Didik Air"), el("h2", null, ap.n), el("p", null, "Pilih destinasi. Jawab satu soalan pas masuk dengan betul, kemudian naik pesawat dan nikmati penerbangan. Pendaratan pertama di setiap lapangan terbang memberi syiling."));
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
    if (ap.id === "ap-klia") b.append(el("div", { class: "lm-row" }, lmBtn("🕋 Penerbangan Umrah / Haji ke Jeddah", "pri", lmTanahSuci)));
    b.append(grid, el("div", { class: "lm-row" }, lmBtn("Tutup", "", lmCardClose)));
  });
}
/* v18.18: penerbangan ibadah dari KLIA ke Tanah Suci (mod/tanahsuci.js): rupa bumi sebenar Makkah dan Madinah,
   setiap manasik dilaksanakan di lokasi sebenar melalui simulasi haji. Selepas pulang, pemain kembali ke KLIA. */
function lmTanahSuci() {
  let sv = null; try { sv = JSON.parse(localStorage.getItem("gt-ts") || "null"); } catch (e) { sv = null; }
  const opts = [["umrah", "🕋 Umrah", "Ihram, tawaf, saie dan tahallul. Boleh dikerjakan sepanjang tahun."], ["ifrad", "🥇 Haji Ifrad", "Haji dahulu, kemudian umrah dari Tan'im. Tiada dam."], ["qiran", "🔗 Haji Qiran", "Niat haji dan umrah serentak. Wajib dam."], ["tamattuk", "🔄 Haji Tamattuk", "Umrah dahulu, kemudian ihram haji pada 8 Zulhijjah. Wajib dam."]];
  lmCard((b) => {
    b.append(el("div", { class: "lm-kick" }, "KLIA · Didik Air · Penerbangan ibadah"), el("h2", null, "Ke Tanah Suci"));
    b.append(el("p", null, "Terbang ke Jeddah dan laksanakan setiap manasik di lokasi sebenar: Masjidil Haram, Mina, Muzdalifah dan Arafah, mengikut bentuk muka bumi sebenar. Anda juga boleh menaiki kereta api laju Haramain ke Madinah."));
    if (sv && sv.mode && sv.i) b.append(el("p", { class: "lm-ex" }, "Kemajuan tersimpan: " + sv.mode + ", " + sv.i + " peringkat selesai. Pilih ibadah yang sama untuk menyambung."));
    const grid = el("div", { class: "lm-grid" });
    opts.forEach(([k, n, d]) => { const c = el("div", { class: "lm-stamp" }); c.append(el("b", null, n), el("div", null, d), lmBtn("Pilih", "pri", () => lmTanahGo(k))); grid.appendChild(c); });
    b.append(grid, el("div", { class: "lm-row" }, lmBtn("Kembali", "", () => lmAirportOpen(LM.g.items.find((x) => x.id === "ap-klia")))));
  });
}
function lmTanahGo(mode) {
  const code = (LM.g && LM.g.myCode) || "";
  lmQuiz({ kick: "Pas masuk", title: "Penerbangan ke Jeddah", pass: 1, qs: lmPickQs([], 1), noRai: true, onDone: (pass) => {
    if (!pass) { lmCard((b2) => { b2.append(el("h2", null, "Pas masuk ditolak"), el("p", null, "Jawapan belum tepat. Cuba lagi.")); b2.append(el("div", { class: "lm-row" }, lmBtn("Cuba lagi", "pri", () => lmTanahGo(mode)), lmBtn("Tutup", "", lmCardClose))); }); return; }
    lmCardClose(); LM.resume = { at: "ap-klia", msg: "Selamat pulang ke tanah air!" }; lmSave(); lmClose();
    modLoad("tanahsuci").then(() => window.tsOpen({ mode: mode, code: code,
      onDone: () => { try { LM.st.ts = LM.st.ts || {}; LM.st.ts[mode] = Date.now(); lmSave(); } catch (e) { /* abaikan */ } },
      onExit: () => { lmOpen(""); } })).catch(() => { LM.resume = null; toast("Penerbangan tidak dapat dimuatkan. Semak sambungan internet.", "warn"); lmOpen(""); });
  } });
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
  const cur = ["tajuk", "ilmu", "kampus", "lencana"].indexOf(LM.ppTab) >= 0 ? LM.ppTab : "tempat";
  lmCard((b) => {
    const s = lmSummary();
    b.append(el("div", { class: "lm-kick" }, "Pasport · " + (cleanName(P.nama) || "Pelajar") + " · " + SUBJS[SUBJ].subjek), el("h2", null, s.pl + "/" + s.plN + " cop tempat · " + s.tw + "/" + s.twN + " tajuk ditawan"));
    const tabs = el("div", { class: "lm-row lm-tabs" });
    [["tempat", "📘 Tempat dilawati"], ["tajuk", "🏰 Tajuk mengikut tema"], ["ilmu", "📖 Stesen Ilmu"], ["kampus", "🎓 Kampus"], ["lencana", "🏅 Lencana " + lmLcCount() + "/" + LCN.length]].forEach(([k, n]) => { const t = lmBtn(n, k === cur ? "pri" : "", () => lmPassport(k)); t.setAttribute("aria-pressed", k === cur ? "true" : "false"); tabs.appendChild(t); });
    b.appendChild(tabs);
    if (cur === "tajuk") { lmTopicList(b); b.append(el("div", { class: "lm-row" }, lmBtn("Tutup", "pri", lmCardClose))); return; }
    if (cur === "lencana") { lmLcPassport(b); b.append(el("div", { class: "lm-row" }, lmBtn("Tutup", "pri", lmCardClose))); return; }
    if (cur === "kampus") { lmKampusPassport(b); b.append(el("div", { class: "lm-row" }, lmBtn("Tutup", "pri", lmCardClose))); return; }
    if (cur === "ilmu") { lmIlmuPassport(b); b.append(el("div", { class: "lm-row" }, lmBtn("Tutup", "pri", lmCardClose))); return; }
    if (s.pl >= s.plN) b.append(el("p", null, "Gelaran: Pengembara META DIDIK! Anda telah menziarahi semua tempat."));
    b.append(el("p", { class: "lm-ex" }, "✈ Penerbangan Didik Air: " + (LM.st.fl | 0) + " · Lapangan terbang didarati: " + Object.keys(LM.st.ap || {}).length + "/" + AIRPORTS.length));
    const grid = el("div", { class: "lm-grid" });
    Object.keys(DATA.negeri).forEach((k) => {
      const pls = PLACES.filter((p) => p[1] === k), tws = [];
      const dPl = pls.filter((p) => LM.st.pl[p[0]]).length, dTw = tws.filter((t) => (LM.st.tw[t.id] | 0) >= 3).length;
      const on = pls.length && dPl === pls.length && dTw === tws.length;
      const c = el("div", { class: "lm-stamp" + (on ? " on" : "") }, el("b", null, (on ? "★ " : "") + DATA.negeri[k].pendek));
      c.append(el("div", null, "Tempat: " + dPl + "/" + pls.length));
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
        el("span", { class: "mt" }, (st === "no" ? "Belum dijawab" : "Terbaik " + best + "/5 · " + n + " cubaan") + " · " + ((lmIlmuFor(t.id) || {}).sn || "")));
      const it = lmIlmuFor(t.id);
      if (it) row.appendChild(lmBtn(st === "ok" ? "Ulang" : "Tunjuk arah", "", () => { g.wp = { x: it.x, z: it.z, n: it.sn }; lmWpSet(); lmCardClose(); lmPop("Ikut tiang merah ke " + it.sn + " (" + (t.kod || t.id) + ")"); }));
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
    x.fillStyle = "#cde3f3"; x.font = "700 30px Nunito, sans-serif"; x.fillText("META DIDIK · " + new Date().toLocaleDateString("ms-MY"), 36, H - 38);
    lmCard((b) => {
      b.append(el("div", { class: "lm-kick" }, "Swafoto"), el("h2", null, pl ? pl.n : "Kenangan jelajah"));
      const im = el("img", { src: c.toDataURL("image/jpeg", 0.88), alt: "Swafoto META DIDIK", style: "width:100%;border-radius:12px;margin:8px 0" }); b.appendChild(im);
      const a = el("a", { href: im.src, download: "swafoto-meta-gempur.jpg", style: "display:none" }); b.appendChild(a);
      b.append(el("div", { class: "lm-row" }, lmBtn("Muat turun", "pri", () => a.click()), lmBtn("Tutup", "", lmCardClose)));
    });
  };
  img.src = url;
}
/* senarai pemain dalam bilik */
function lmRoomPanel() {
  lmCard((b) => {
    const op = LM.roomKind === "open";
    b.append(el("div", { class: "lm-kick" }, op ? "Dunia Terbuka" : "Bilik bersama"), el("h2", null, op ? "Zon " + (ZONES[LM.zone] || "") + (LM.room ? " · saluran " + String(LM.roomCode).split("-")[1] : "") : LM.room ? (LM.roomKind === "sekolah" ? "Bilik sekolah" : "Kod bilik: " + LM.roomCode) : "Main solo"));
    if (op) b.append(el("p", null, LM.room ? "Anda melihat pemain dalam zon yang sama (maksimum " + LMO.CH + " sesaluran). Saluran bertukar sendiri apabila anda bergerak ke zon lain." : LM.openFull ? "Dunia Terbuka penuh (" + LMO.MAX + " pemain serentak). Anda bermain solo dan akan dimasukkan semula secara automatik apabila ada tempat." : "Menyambung ke Dunia Terbuka..."),
      el("p", { class: "lm-ex" }, "Jaga adab: kata kesat ditapis, pautan dan nombor telefon disekat. Tekan Senyap atau Lapor pada pemain yang mengganggu. Mic hanya ada dalam bilik sekolah atau bilik kod rakan."));
    if (LM.room && LM.roomKind === "rakan") b.append(el("p", null, "Kongsi kod " + LM.roomCode + " dengan rakan. Mereka pilih Dunia Ilmu, tekan Masuk kod dan taip kod ini."));
    const list = el("div", { class: "lm-grid" });
    list.appendChild(el("div", { class: "lm-stamp on" }, el("b", null, (cleanName(P.nama) || "Saya") + " (anda)"), el("div", null, lmStamps() + " cop pasport")));
    Object.keys(LM.peers).forEach((id) => {
      const e = LM.peers[id], mu = lmMuted(id);
      const mb = lmBtn(mu ? "Nyahsenyap" : "Senyap", "", () => { lmMuteSet(id, !mu); lmRoomPanel(); });
      list.appendChild(el("div", { class: "lm-stamp" }, el("b", null, (lmFriend(e) ? "🟢 " : "") + e.n + (e.vo ? " 🎙" : "") + (mu ? " 🔇" : "")), el("div", null, (e.st | 0) + " cop pasport · " + Math.round(Math.hypot(e.x - LM.g.p.x, e.z - LM.g.p.z)) + " m"), el("div", { class: "lm-pl" }, lmBtn("Tunjuk arah", "", () => { lmGoPeer(id); lmCardClose(); }), mb, lmBtn("Lapor", "", () => { if (confirm("Laporkan " + e.n + " kerana mengganggu?")) { lmReport(id); lmRoomPanel(); } }))));
    });
    b.appendChild(list);
    if (!LM.room && !op) b.append(el("p", { class: "lm-ex" }, "Untuk main bersama, keluar ke skrin mula dan pilih Dunia Terbuka, Cipta bilik rakan atau Masuk kod."));
    b.append(el("div", { class: "lm-row" }, lmBtn("Tutup", "pri", lmCardClose)));
  });
}

/* ---------- Top 5 kedudukan hari ini di langit (v17.89; harian sejak v17.96) ---------- */
function lmSkyDraw(sk) {
  return (x, w, h) => {
    x.clearRect(0, 0, w, h);
    const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(20,40,90,.92)"); gr.addColorStop(1, "rgba(60,20,90,.88)");
    lmRound(x, 8, 8, w - 16, h - 16, 40); x.fillStyle = gr; x.fill(); x.lineWidth = 10; x.strokeStyle = "#ffd45a"; x.stroke();
    x.textAlign = "center"; x.fillStyle = "#ffd45a"; x.font = "900 64px Fredoka, Nunito, sans-serif"; x.fillText("🏆 TOP 5 HARI INI", w / 2, 92);
    x.fillStyle = "#cde3f3"; x.font = "800 30px Nunito, sans-serif"; x.fillText(SUBJS[SUBJ].subjek + " · mata semua permainan", w / 2, 134);
    const list = sk.list || [];
    if (!list.length) { x.fillStyle = "#fff"; x.font = "800 40px Nunito, sans-serif"; x.fillText(sk.err || (sk.busy ? "Memuatkan kedudukan..." : "Jawab soalan untuk jadi yang pertama di sini!"), w / 2, 330); return; }
    const med = ["#ffd45a", "#d9e2ec", "#e0975a", "#9fd3ff", "#9fd3ff"];
    list.forEach((r, i) => {
      const y = 170 + i * 82; lmRound(x, 40, y, w - 80, 70, 22); x.fillStyle = r.me ? "rgba(255,212,90,.32)" : "rgba(255,255,255,.1)"; x.fill();
      const rk = r.rank || i + 1, mc = med[Math.min(rk, 5) - 1];
      x.fillStyle = mc; x.font = "900 48px Fredoka, Nunito, sans-serif"; x.textAlign = "left"; x.fillText((rk === 1 ? "👑" : "#" + rk), 62, y + 52);
      x.fillStyle = "#fff"; x.font = "900 40px Nunito, sans-serif"; x.fillText(String(r.n || "").slice(0, 16) + (r.me ? " (anda)" : ""), 170, y + 40);
      x.fillStyle = "#b9cde0"; x.font = "700 24px Nunito, sans-serif"; x.fillText([r.k, String(r.sk || "").slice(0, 30)].filter(Boolean).join(" · "), 170, y + 64);
      x.textAlign = "right"; x.fillStyle = mc; x.font = "900 42px Fredoka, Nunito, sans-serif"; x.fillText(String(r.v), w - 66, y + 50);
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
    const all = rkAllRows().map((r) => ({ n: r.n, k: r.k, sk: r.sk, me: r.me, v: rkVal(r.m, "all", "hari", "jumlah", "") })).filter((r) => r.v > 0).sort((a, b) => b.v - a.v);
    all.forEach((r, i) => (r.rank = i + 1));
    const mi = all.findIndex((r) => r.me);
    /* murid di luar Top 5 tetap nampak kedudukannya sendiri pada baris terakhir */
    sk.list = mi >= 5 ? all.slice(0, 4).concat([all[mi]]) : all.slice(0, 5);
    sk.myRank = mi >= 0 ? mi + 1 : 0; sk.total = all.length;
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
/* peta 2D: kawasan dunia sebenar yang dipaparkan */
const MAPB = { x0: -3250 * WS, z0: -1180 * WS, w: 6550 * WS, h: 2320 * WS };
const lmLabelPt = (k) => { const b = lmRingsBox([lmMainRing(k)]); return { x: b.x0 + b.w / 2, z: b.z0 + b.h / 2 }; };
function lmMapBase(w, h) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const x = c.getContext("2d"), s = Math.min(w / MAPB.w, h / MAPB.h), ox = (w - MAPB.w * s) / 2 - MAPB.x0 * s, oy = (h - MAPB.h * s) / 2 - MAPB.z0 * s;
  x.fillStyle = "#0d4f86"; x.fillRect(0, 0, w, h);
  x.setTransform(s, 0, 0, s, ox, oy); x.lineWidth = 1.2 / s; x.lineJoin = "round";
  for (const k of RAST.keys) { x.fillStyle = STATE_COL[k] || "#8fd16a"; x.strokeStyle = "rgba(30,60,20,.6)"; x.fill(RAST.paths[k]); x.stroke(RAST.paths[k]); }
  x.fillStyle = "#9fd18a"; lmIslands().forEach((o) => { x.fill(o.path); x.stroke(o.path); });
  x.setTransform(1, 0, 0, 1, 0, 0);
  return { c: c, s: s, ox: ox, oy: oy };
}
function lmMapPt(m, wx, wz) { return [m.ox + wx * m.s, m.oy + wz * m.s]; }
function lmMapDraw(cv, m, big) {
  const g = LM.g; if (!g) return;
  const x = cv.getContext("2d"); x.drawImage(m.c, 0, 0);
  const r = big ? 5 : 2.2;
  if (g.rails) for (const R of g.rails) {
    if (!R.pts) continue;
    x.strokeStyle = R.L.col; x.lineWidth = big ? 3.2 : 1.5; x.beginPath();
    R.pts.forEach((q, i) => { if (i % 3 && i !== R.pts.length - 1) return; const [px, py] = lmMapPt(m, q.x, q.z); if (!i) x.moveTo(px, py); else x.lineTo(px, py); }); x.stroke();
    for (const s of R.st) { const [px, py] = lmMapPt(m, s.x, s.z); x.fillStyle = "#fff"; x.strokeStyle = R.L.col; x.lineWidth = big ? 2 : 1; x.beginPath(); x.arc(px, py, big ? 4 : 1.8, 0, 6.2832); x.fill(); x.stroke(); }
  }
  for (const it of g.items) {
    const [px, py] = lmMapPt(m, it.x, it.z);
    if (it.kind === "pl") { x.fillStyle = LM.st.pl[it.id] ? "#ffd45a" : "#ffffff"; x.beginPath(); x.arc(px, py, r, 0, 6.2832); x.fill(); if (big) { x.strokeStyle = "#5a3a1e"; x.lineWidth = 1.5; x.stroke(); } }
    else if (it.kind === "tw") { x.fillStyle = it.done ? "#ffd45a" : "#7fe3ff"; x.fillRect(px - r * 0.8, py - r * 0.8, r * 1.6, r * 1.6); }
    else if (big && it.kind === "ap") { x.font = "16px sans-serif"; x.fillStyle = "#fff"; x.fillText("✈", px - 7, py + 6); }
    else if (it.kind === "sk") { x.font = (big ? 18 : 10) + "px sans-serif"; x.textAlign = "center"; x.fillText("🏫", px, py + (big ? 6 : 3)); x.textAlign = "left"; }
    else if (it.kind === "ak") { x.fillStyle = "#ff4d4d"; x.beginPath(); x.arc(px, py, big ? 6 : 3, 0, 6.2832); x.fill(); if (big) { x.fillStyle = "#fff"; x.font = "bold 11px sans-serif"; x.textAlign = "center"; x.fillText("!", px, py + 4); x.textAlign = "left"; } }
    else if (it.kind === "sn") { if (big && it.sl.slice(-2) === "-2") { x.font = "15px sans-serif"; x.textAlign = "center"; x.fillText("🏛", px, py + 5); x.textAlign = "left"; } }
    else if (it.kind === "fd") { if (big) { x.font = "15px sans-serif"; x.textAlign = "center"; x.fillText("🍽", px, py + 5); x.textAlign = "left"; } else { x.fillStyle = "#ff9f43"; x.fillRect(px - 1.2, py - 1.2, 2.4, 2.4); } }
    else if (it.kind === "km") { x.font = (big ? 16 : 9) + "px sans-serif"; x.textAlign = "center"; x.fillText("🎖", px, py + (big ? 6 : 3)); x.textAlign = "left"; }
    else if (it.kind === "si") { x.font = (big ? 17 : 9) + "px sans-serif"; x.textAlign = "center"; x.fillText("📖", px, py + (big ? 6 : 3)); x.textAlign = "left"; }
    else if (it.kind === "ip") { x.font = (big ? 18 : 9) + "px sans-serif"; x.textAlign = "center"; x.fillText("🎓", px, py + (big ? 6 : 3)); x.textAlign = "left"; }
    else if (it.kind === "kh") { x.font = (big ? 20 : 10) + "px sans-serif"; x.fillStyle = it.done ? "#ffd45a" : "#ff7a9a"; x.textAlign = "center"; x.fillText("★", px, py + (big ? 7 : 4)); x.textAlign = "left"; }
    else if (big && it.kind === "jt" && it.k !== it.isl.id) { x.font = "14px sans-serif"; x.fillStyle = "#7fe3ff"; x.fillText("⛴", px - 7, py + 5); }
  }
  if (big) {
    x.font = "800 12px Nunito, sans-serif"; x.fillStyle = "rgba(10,30,20,.85)"; x.textAlign = "center";
    for (const k of RAST.keys) { const w = lmLabelPt(k), [px, py] = lmMapPt(m, w.x, w.z); x.fillText(DATA.negeri[k].pendek, px, py - 12); }
    lmIslands().forEach((o) => { const w = lmIslW(o), [px, py] = lmMapPt(m, w.x, w.z); x.fillText(o.n.replace("Pulau ", "P. "), px, py - 16); });
    x.textAlign = "left";
  }
  if (big && LM.roomKind === "open" && LM.zoneN) {
    for (const z in LM.zoneN) {
      const n = LM.zoneN[z] - (z === LM.zone ? Object.keys(LM.peers).length : 0), k = ZONE_PIN[z];
      if (n <= 0 || !k || !DATA.negeri[k]) continue;
      const w = lmLabelPt(k), [px, py] = lmMapPt(m, w.x, w.z); lmMapTag(x, "👥 " + n + " pemain di zon " + ZONES[z], px, py + 26, "#ffd45a");
    }
  }
  for (const id in LM.peers) {
    const e = LM.peers[id], [px, py] = lmMapPt(m, e.x, e.z), fr = lmFriend(e), col = fr ? "#4dff9a" : "#ff7ad9";
    x.fillStyle = col; x.strokeStyle = "#0b2a44"; x.lineWidth = big ? 2 : 1;
    if (e.pl) { x.font = (big ? 20 : 11) + "px sans-serif"; x.textAlign = "center"; x.fillText("✈", px, py + (big ? 7 : 4)); x.textAlign = "left"; }
    else { x.beginPath(); x.arc(px, py, big ? 6.5 : 3.4, 0, 6.2832); x.fill(); x.stroke(); }
    if (big) lmMapTag(x, e.n + (e.fy ? " ⛴" : ""), px, py - 12, col);
  }
  if (g.wp) { const [px, py] = lmMapPt(m, g.wp.x, g.wp.z); x.strokeStyle = "#ff4d4d"; x.lineWidth = 2; x.beginPath(); x.arc(px, py, big ? 9 : 4, 0, 6.2832); x.stroke(); }
  const [px, py] = lmMapPt(m, g.p.x, g.p.z), a = g.p.yaw, R = big ? 10 : 5;
  x.fillStyle = "#ffffff"; x.strokeStyle = "#0b2a44"; x.lineWidth = 1.5; x.beginPath();
  x.moveTo(px + Math.sin(a) * R, py + Math.cos(a) * R); x.lineTo(px + Math.sin(a + 2.5) * R * 0.7, py + Math.cos(a + 2.5) * R * 0.7); x.lineTo(px + Math.sin(a - 2.5) * R * 0.7, py + Math.cos(a - 2.5) * R * 0.7); x.closePath(); x.fill(); x.stroke();
  if (big) lmMapTag(x, "Anda", px, py - 15, "#ffffff");
}
const ZONE_PIN = { utara: "kedah", tengah: "selangor", timur: "pahang", selatan: "johor", borneo: "sarawak" };
function lmMapTag(x, text, px, py, col) {
  x.font = "800 13px Nunito, sans-serif"; const w = x.measureText(text).width + 12;
  x.fillStyle = "rgba(8,24,40,.85)"; lmRound(x, px - w / 2, py - 15, w, 18, 9); x.fill();
  x.fillStyle = col; x.textAlign = "center"; x.fillText(text, px, py - 2); x.textAlign = "left";
}
/* peta besar: skrin penuh, butang ✕ sentiasa kelihatan (telefon landskap), petunjuk dalam laci */
function lmBigMap() {
  const g = LM.g; if (!g) return;
  if (LM.ui.big) { const w = LM.ui.big; if (w._off) w._off(); LM.ui.big = null; LM.map3 = null; w.remove(); g.ui = false; return; }
  g.ui = true;
  let p3 = true; try { p3 = localStorage.getItem("gt-lm-map3") !== "0"; } catch (e) { p3 = true; }
  const wrap = el("div", { class: "lm-big" }), area = el("div", { class: "lm-big-map" });
  const dot = (c, t, sh) => el("span", null, el("i", { style: "background:" + c + (sh ? ";border-radius:2px" : "") }), t);
  const leg = el("div", { class: "lm-leg" }, el("span", null, "▲ Anda"), dot("#4dff9a", LM.roomKind === "open" ? "Rakan sekolah" : "Rakan"), LM.roomKind === "open" ? dot("#ff7ad9", "Pemain lain") : null, dot("#7fe3ff", "Menara", 1), el("span", null, "📖 Stesen Ilmu"), el("span", null, "🎓 Kampus IPT"), el("span", null, "🎖 Kem Tempur"), el("span", null, "🍽 Kedai makan"), dot("#1f4fa8", "ETS"), dot("#0e8a6a", "ECRL"), dot("#f28c28", "PLUS"), dot("#d64f8a", "LPT"), dot("#7a5cd6", "Pan Borneo"), dot("#1d5fbf", "KTM Komuter"), dot("#e0245e", "LRT"), dot("#0f8a3d", "MRT"), dot("#7cc242", "Monorel"), dot("#ffd45a", "Ditawan / diziarahi"), dot("#ffffff", "Tempat menarik"));
  const list = el("div", { class: "lm-who" }), dr = el("div", { class: "lm-big-dr", hidden: "" }, list, leg);
  const mode = lmBtn("", "", () => { p3 = !p3; try { localStorage.setItem("gt-lm-map3", p3 ? "1" : "0"); } catch (e) { /* abaikan */ } show(); });
  const me = lmBtn("📍 Saya", "", () => { if (LM.map3) LM.map3.home(); });
  const info = lmBtn("☰ Petunjuk", "", () => { dr.hidden = !dr.hidden; info.setAttribute("aria-pressed", String(!dr.hidden)); setTimeout(fit, 0); });
  const x = el("button", { type: "button", class: "lm-big-x", title: "Tutup peta (M / Esc)", "aria-label": "Tutup peta" }, "✕"); x.addEventListener("click", lmBigMap);
  const top = el("div", { class: "lm-big-top" }, el("div", { class: "lm-kick" }, "Peta · ketik tempat atau rakan untuk tetapkan destinasi"), mode, me, lmBtn("Buang destinasi", "", () => { g.wp = null; lmWpSet(); redraw(); }), info, x);
  wrap.append(top, area, dr); LM.root.appendChild(wrap); LM.ui.big = wrap;
  /* klik pada peta (2D atau 3D) */
  const pick = (peer, it, wx, wz) => {
    if (peer) lmGoPeer(peer);
    else if (it) g.wp = { x: it.x, z: it.z, n: it.kind === "tw" ? "Menara " + (it.t.kod || it.t.id) : it.n };
    else g.wp = { x: wx, z: wz, n: "Titik pilihan" };
    if (!peer) lmWpSet(); redraw();
  };
  let m2 = null, cv2 = null;
  const redraw = () => { if (LM.map3) LM.map3.tick(); else if (cv2) lmMapDraw(cv2, m2, true); };
  const fit = () => {
    if (LM.map3) { LM.map3.fit(); return; }
    if (!cv2) return;
    const W = area.clientWidth, H = area.clientHeight, s = Math.min(W / cv2.width, H / cv2.height);
    cv2.style.width = Math.floor(cv2.width * s) + "px"; cv2.style.height = Math.floor(cv2.height * s) + "px";
  };
  const show = () => {
    if (LM.map3) { LM.map3.dispose(); LM.map3 = null; }
    area.textContent = ""; cv2 = null;
    if (p3) LM.map3 = lmMap3(area, pick);
    if (!LM.map3) {
      p3 = false; m2 = m2 || lmMapBase(1240, 500);
      cv2 = el("canvas", { width: 1240, height: 500, "aria-label": "Peta Malaysia" }); area.appendChild(cv2);
      cv2.addEventListener("click", (e) => {
        const rc = cv2.getBoundingClientRect(), mx = (e.clientX - rc.left) * cv2.width / rc.width, my = (e.clientY - rc.top) * cv2.height / rc.height;
        for (const id in LM.peers) { const q = LM.peers[id], [px, py] = lmMapPt(m2, q.x, q.z); if (Math.hypot(px - mx, py - my) < 16) { pick(id); return; } }
        let best = null, bd = 26;
        for (const it of g.items) { const [px, py] = lmMapPt(m2, it.x, it.z), d = Math.hypot(px - mx, py - my); if (d < bd) { bd = d; best = it; } }
        pick(null, best, (mx - m2.ox) / m2.s, (my - m2.oy) / m2.s);
      });
    }
    mode.textContent = p3 ? "🗺 2D" : "⛰ 3D"; mode.title = p3 ? "Tukar ke peta rata" : "Tukar ke peta 3D"; me.hidden = !p3;
    fit(); redraw();
  };
  const who = () => {
    const ids = Object.keys(LM.peers).sort((a, b) => (lmFriend(LM.peers[b]) - lmFriend(LM.peers[a])) || (Math.hypot(LM.peers[a].x - g.p.x, LM.peers[a].z - g.p.z) - Math.hypot(LM.peers[b].x - g.p.x, LM.peers[b].z - g.p.z)));
    const sig = ids.map((id) => id + ":" + Math.round(Math.hypot(LM.peers[id].x - g.p.x, LM.peers[id].z - g.p.z) / 10)).join(",");
    if (list.dataset.sig === sig) return; list.dataset.sig = sig; list.textContent = "";
    if (!LM.room) { list.append(el("span", { class: "muted" }, LM.roomKind === "open" ? (LM.openFull ? "Dunia Terbuka penuh: anda bermain solo buat sementara." : "Menyambung ke Dunia Terbuka...") : "Main solo: tiada pemain lain. Pilih Dunia Terbuka atau bilik rakan di skrin mula.")); return; }
    if (!ids.length) { list.append(el("span", { class: "muted" }, "Belum ada pemain lain di " + (LM.roomKind === "open" ? "zon " + ZONES[LM.zone] : "bilik ini") + ".")); return; }
    list.append(el("b", null, "Dalam talian (" + ids.length + "):"));
    ids.slice(0, 14).forEach((id) => { const e = LM.peers[id], d = Math.round(Math.hypot(e.x - g.p.x, e.z - g.p.z)); const bt = lmBtn((lmFriend(e) ? "🟢 " : "🟣 ") + e.n + " · " + d + " m", "", () => { lmGoPeer(id); lmBigMap(); }); bt.title = "Tunjuk arah ke " + e.n; list.append(bt); });
  };
  const draw = () => { if (LM.ui.big !== wrap) { clearInterval(LM.bigT); return; } redraw(); who(); };
  window.addEventListener("resize", fit);
  wrap._off = () => { clearInterval(LM.bigT); window.removeEventListener("resize", fit); if (LM.map3) { LM.map3.dispose(); LM.map3 = null; } };
  show();
  clearInterval(LM.bigT); LM.bigT = setInterval(draw, 400); draw();
  lmZoneCounts();
}

/* ---------- peta 3D: muka bumi sebenar (DEM) dengan sempadan negeri, rel dan lebuh raya sebagai tekstur ---------- */
function lmMap3(area, onPick) {
  const g = LM.g, cv = el("canvas", { "aria-label": "Peta 3D Malaysia" }); area.appendChild(cv);
  let r; try { r = new T.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: "high-performance" }); } catch (e) { cv.remove(); return null; }
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  const S = 100 / MAPB.w, cx = MAPB.x0 + MAPB.w / 2, cz = MAPB.z0 + MAPB.h / 2, EX = 3.2;
  const P = (wx, wz, y) => new T.Vector3((wx - cx) * S, y || 0, (wz - cz) * S);
  const hAt = (wx, wz) => { const h = lmHRaw(wx, wz); return h > 0.4 ? h * S * EX : -0.04; };
  const scene = new T.Scene(); scene.background = new T.Color(0x0a3358); scene.fog = new T.Fog(0x0a3358, 120, 260);
  const cam = new T.PerspectiveCamera(42, 1, 0.1, 600);
  scene.add(new T.HemisphereLight(0xdcefff, 0x2a3a2a, 0.75));
  const sun = new T.DirectionalLight(0xfff2d8, 0.85); sun.position.set(-40, 60, -30); scene.add(sun);
  /* tekstur: peta 2D asas + laluan rel/jalan */
  const TW = 2048, TH = Math.round(TW * MAPB.h / MAPB.w), base = lmMapBase(TW, TH), tc = document.createElement("canvas"); tc.width = TW; tc.height = TH;
  const tx = tc.getContext("2d"); tx.drawImage(base.c, 0, 0);
  if (g.rails) for (const R of g.rails) {
    if (!R.pts) continue;
    tx.strokeStyle = R.L.col; tx.lineWidth = 3.5; tx.lineJoin = "round"; tx.beginPath();
    R.pts.forEach((q, i) => { if (i % 2 && i !== R.pts.length - 1) return; const [px, py] = lmMapPt(base, q.x, q.z); if (!i) tx.moveTo(px, py); else tx.lineTo(px, py); }); tx.stroke();
    for (const s of R.st) { const [px, py] = lmMapPt(base, s.x, s.z); tx.fillStyle = "#fff"; tx.strokeStyle = R.L.col; tx.lineWidth = 2; tx.beginPath(); tx.arc(px, py, 3.5, 0, 6.2832); tx.fill(); tx.stroke(); }
  }
  const tex = new T.CanvasTexture(tc); tex.anisotropy = Math.min(8, r.capabilities.getMaxAnisotropy ? r.capabilities.getMaxAnisotropy() : 1);
  const PW = 100, PH = 100 * MAPB.h / MAPB.w, NX = 300, NZ = Math.round(NX * PH / PW);
  const geo = new T.PlaneGeometry(PW, PH, NX, NZ); geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, hAt(pos.getX(i) / S + cx, pos.getZ(i) / S + cz));
  geo.computeVertexNormals();
  const land = new T.Mesh(geo, new T.MeshLambertMaterial({ map: tex })); scene.add(land);
  const sea = new T.Mesh(new T.PlaneGeometry(900, 900), new T.MeshLambertMaterial({ color: 0x0d4f86 })); sea.rotation.x = -Math.PI / 2; sea.position.y = -0.08; scene.add(sea);
  /* ikon: sprite saiz tetap pada skrin (dikongsi ikut jenis) */
  const icoC = new Map(), dispose = [geo, land.material, tex, sea.geometry, sea.material];
  const ico = (key, paint) => {
    if (icoC.has(key)) return icoC.get(key);
    const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d"); paint(x);
    const t = new T.CanvasTexture(c), mt = new T.SpriteMaterial({ map: t, depthTest: false, transparent: true, sizeAttenuation: false }); dispose.push(t, mt); icoC.set(key, mt); return mt;
  };
  const emo = (ch, col) => ico("e" + ch + (col || ""), (x) => { x.font = "46px sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; if (col) x.fillStyle = col; x.shadowColor = "rgba(0,0,0,.6)"; x.shadowBlur = 6; x.fillText(ch, 32, 36); });
  const dotM = (col, sq) => ico("d" + col + (sq ? "s" : ""), (x) => { x.fillStyle = col; x.strokeStyle = "#0b2a44"; x.lineWidth = 6; x.beginPath(); if (sq) x.rect(16, 16, 32, 32); else x.arc(32, 32, 18, 0, 6.2832); x.fill(); x.stroke(); });
  const look = (it) => {
    switch (it.kind) {
      case "pl": return [dotM(LM.st.pl[it.id] ? "#ffd45a" : "#ffffff"), 13];
      case "tw": return [dotM(it.done ? "#ffd45a" : "#7fe3ff", 1), 13];
      case "ap": return [emo("✈", "#fff"), 22];
      case "sk": return [emo("🏫"), 24];
      case "ak": return [emo("❗"), 20];
      case "sn": return it.sl.slice(-2) === "-2" ? [emo("🏛"), 22] : null;
      case "fd": return [emo("🍽"), 20];
      case "km": return [emo("🎖"), 22];
      case "si": return [emo("📖"), 22];
      case "ip": return [emo("🎓"), 24];
      case "kh": return [emo("★", it.done ? "#ffd45a" : "#ff7a9a"), 26];
      case "jt": return it.k !== it.isl.id ? [emo("⛴", "#7fe3ff"), 20] : null;
      default: return null;
    }
  };
  const sprites = [];
  const sp = (mt, px, wx, wz, lift) => { const s = new T.Sprite(mt); s.position.copy(P(wx, wz, hAt(wx, wz) + (lift || 0.25))); s.userData.px = px; s.renderOrder = 2; scene.add(s); sprites.push(s); return s; };
  const its = [];
  for (const it of g.items) { const L = look(it); if (!L) continue; const s = sp(L[0], L[1], it.x, it.z); s.userData.it = it; its.push(s); }
  /* label teks */
  const txt = (t, col, bg) => {
    const c = document.createElement("canvas"), x = c.getContext("2d"); x.font = "800 30px Nunito, sans-serif";
    const w = Math.ceil(x.measureText(t).width) + 24; c.width = w; c.height = 44; x.font = "800 30px Nunito, sans-serif";
    if (bg) { x.fillStyle = bg; lmRound(x, 0, 0, w, 44, 22); x.fill(); }
    x.fillStyle = col; x.textAlign = "center"; x.textBaseline = "middle"; if (!bg) { x.strokeStyle = "rgba(255,255,255,.7)"; x.lineWidth = 5; x.strokeText(t, w / 2, 23); } x.fillText(t, w / 2, 23);
    const tt = new T.CanvasTexture(c), mt = new T.SpriteMaterial({ map: tt, depthTest: false, transparent: true, sizeAttenuation: false }); dispose.push(tt, mt);
    const s = new T.Sprite(mt); s.userData.px = 17; s.userData.ar = w / 44; s.renderOrder = 3; return s;
  };
  const putTxt = (s, wx, wz, lift) => { s.position.copy(P(wx, wz, hAt(wx, wz) + lift)); scene.add(s); sprites.push(s); return s; };
  for (const k of RAST.keys) { const w = lmLabelPt(k); putTxt(txt(DATA.negeri[k].pendek, "#0a2a14"), w.x, w.z, 1.2); }
  lmIslands().forEach((o) => { const w = lmIslW(o); putTxt(txt(o.n.replace("Pulau ", "P. "), "#0a2a14"), w.x, w.z, 1.2); });
  /* pemain: anak panah 3D + label; destinasi: tiang merah */
  const arrS = new T.Shape(); arrS.moveTo(0, 1); arrS.lineTo(0.7, -0.7); arrS.lineTo(0, -0.3); arrS.lineTo(-0.7, -0.7); arrS.closePath();
  const arrG = new T.ShapeGeometry(arrS); arrG.rotateX(-Math.PI / 2);
  const arr = new T.Mesh(arrG, new T.MeshBasicMaterial({ color: 0xffffff, depthTest: false, side: T.DoubleSide })); arr.renderOrder = 4; scene.add(arr);
  const ring = new T.Mesh(new T.RingGeometry(0.8, 1, 32), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthTest: false, side: T.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.renderOrder = 4; scene.add(ring);
  const meLb = txt("Anda", "#ffffff", "rgba(8,24,40,.85)"); scene.add(meLb); sprites.push(meLb);
  const wpM = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, 6, 8), new T.MeshBasicMaterial({ color: 0xff4d4d, transparent: true, opacity: 0.8 })); scene.add(wpM);
  dispose.push(arrG, arr.material, ring.geometry, ring.material, wpM.geometry, wpM.material);
  const peers = new Map();
  /* kamera: seret = alih, cubit/roda = zum */
  const C = { x: 0, z: 0, d: 120, pitch: 0.95, yaw: 0 };
  const home = () => { const q = P(g.p.x, g.p.z); C.x = q.x; C.z = q.z; C.d = 20; };
  const all = () => { const hf = Math.atan(Math.tan(cam.fov * Math.PI / 360) * cam.aspect); C.x = 0; C.z = 3; C.d = clamp(PW * 0.55 / Math.tan(hf), 40, 160); };
  const place = () => {
    C.d = clamp(C.d, 6, 160); C.x = clamp(C.x, -PW / 2, PW / 2); C.z = clamp(C.z, -PH / 2, PH / 2);
    const ty = C.d < 40 ? hAt(C.x / S + cx, C.z / S + cz) : 0;
    cam.position.set(C.x + Math.sin(C.yaw) * Math.cos(C.pitch) * C.d, ty + Math.sin(C.pitch) * C.d, C.z + Math.cos(C.yaw) * Math.cos(C.pitch) * C.d);
    cam.lookAt(C.x, ty, C.z);
  };
  let W = 1, H = 1;
  const fit = () => { W = Math.max(1, area.clientWidth); H = Math.max(1, area.clientHeight); r.setSize(W, H, false); cv.style.width = W + "px"; cv.style.height = H + "px"; cam.aspect = W / H; cam.updateProjectionMatrix(); };
  const pxK = () => 2 * Math.tan(cam.fov * Math.PI / 360) / H;
  const pts = new Map(); let drag = null, pinch = 0;
  const down = (e) => { cv.setPointerCapture && cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pts.size === 1) drag = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t: performance.now(), mv: 0 }; else { drag && (drag.mv = 99); pinch = 0; } };
  const move = (e) => {
    if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size >= 2) { const [a, b] = [...pts.values()], d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch) C.d *= pinch / d; pinch = d; return; }
    if (!drag) return;
    const k = C.d * pxK(), dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; drag.mv += Math.abs(dx) + Math.abs(dy);
    C.x -= (dx * Math.cos(C.yaw) + dy * Math.sin(C.yaw)) * k; C.z -= (dy * Math.cos(C.yaw) - dx * Math.sin(C.yaw)) * k / Math.sin(C.pitch);
  };
  const up = (e) => {
    pts.delete(e.pointerId); if (pts.size < 2) pinch = 0;
    if (drag && !pts.size) { if (drag.mv < 8 && performance.now() - drag.t < 600) click(e.clientX, e.clientY); drag = null; }
  };
  const wheel = (e) => { e.preventDefault(); C.d *= Math.exp(e.deltaY * 0.0012); };
  cv.addEventListener("pointerdown", down); cv.addEventListener("pointermove", move); cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up); cv.addEventListener("wheel", wheel, { passive: false });
  const v = new T.Vector3(), scr = (o) => { v.copy(o.position).project(cam); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H, v.z]; };
  const click = (ex, ey) => {
    const rc = cv.getBoundingClientRect(), mx = ex - rc.left, my = ey - rc.top;
    for (const [id, o] of peers) { const [px, py] = scr(o.s); if (Math.hypot(px - mx, py - my) < 20) { onPick(id); return; } }
    let best = null, bd = 24;
    for (const s of its) { if (!s.visible) continue; const [px, py, z] = scr(s); if (z > 1) continue; const d = Math.hypot(px - mx, py - my); if (d < bd) { bd = d; best = s.userData.it; } }
    if (best) { onPick(null, best); return; }
    const rc2 = new T.Raycaster(); rc2.setFromCamera(new T.Vector2(mx / W * 2 - 1, 1 - my / H * 2), cam);
    const hit = rc2.intersectObject(land)[0]; if (hit) onPick(null, null, hit.point.x / S + cx, hit.point.z / S + cz);
  };
  /* kemas kini penanda dinamik (pemain, rakan, destinasi, status ikon) */
  const tick = () => {
    for (const s of its) { const L = look(s.userData.it); if (L && s.material !== L[0]) s.material = L[0]; }
    const seen = new Set();
    for (const id in LM.peers) {
      const e = LM.peers[id], fr = lmFriend(e), key = (fr ? "f" : "o") + (e.pl ? "p" : "") + e.n + (e.fy ? "⛴" : ""); seen.add(id);
      let o = peers.get(id);
      if (!o || o.key !== key) {
        if (o) { scene.remove(o.s, o.l); sprites.splice(sprites.indexOf(o.s), 1); sprites.splice(sprites.indexOf(o.l), 1); }
        const col = fr ? "#4dff9a" : "#ff7ad9", s = new T.Sprite(e.pl ? emo("✈", col) : dotM(col)); s.userData.px = e.pl ? 24 : 16; s.renderOrder = 3;
        const l = txt(e.n + (e.fy ? " ⛴" : ""), col, "rgba(8,24,40,.85)"); scene.add(s, l); sprites.push(s, l); o = { s: s, l: l, key: key }; peers.set(id, o);
      }
      o.s.position.copy(P(e.x, e.z, hAt(e.x, e.z) + 0.3)); o.l.position.copy(o.s.position); o.l.userData.dy = 20;
    }
    for (const [id, o] of peers) if (!seen.has(id)) { scene.remove(o.s, o.l); sprites.splice(sprites.indexOf(o.s), 1); sprites.splice(sprites.indexOf(o.l), 1); peers.delete(id); }
    wpM.visible = !!g.wp; if (g.wp) wpM.position.copy(P(g.wp.x, g.wp.z, hAt(g.wp.x, g.wp.z) + 3));
  };
  let raf = 0, t0 = performance.now();
  const frame = (ts) => {
    raf = requestAnimationFrame(frame); place();
    const q = P(g.p.x, g.p.z, hAt(g.p.x, g.p.z) + 0.15), sc = C.d * 0.022, k = pxK();
    arr.position.copy(q); arr.scale.setScalar(sc); arr.rotation.y = g.p.yaw;
    const ph = ((ts - t0) / 1400) % 1; ring.position.copy(q); ring.scale.setScalar(sc * (0.8 + ph * 2.2)); ring.material.opacity = 0.7 * (1 - ph);
    meLb.position.copy(q); meLb.userData.dy = 20;
    if (wpM.visible) { wpM.scale.set(sc * 1.5, sc * 0.5, sc * 1.5); wpM.position.y = hAt(g.wp.x, g.wp.z) + sc * 1.5; }
    for (const s of sprites) {
      const px = s.userData.px * k * (s.userData.ar ? 1 : 0.85), ar = s.userData.ar || 1; s.scale.set(px * ar, px, 1);
      /* angkat label ke atas penanda (piksel skrin) */
      s.center.set(0.5, s.userData.dy ? -s.userData.dy / s.userData.px + 0.5 : 0.5);
    }
    /* sembunyi ikon kecil bila zum jauh supaya tidak bersepah */
    const far = C.d > 60; for (const s of its) { const kd = s.userData.it.kind; s.visible = !far || kd === "kh" || kd === "ip" || kd === "si" || kd === "km" || kd === "ap" || kd === "sk"; }
    r.render(scene, cam);
  };
  fit(); all(); tick(); raf = requestAnimationFrame(frame);
  return {
    fit: fit, tick: tick, home: home, all: all, C: C, cam: cam,
    dispose: () => { cancelAnimationFrame(raf); for (const d of dispose) d.dispose(); r.dispose(); if (r.forceContextLoss) r.forceContextLoss(); cv.remove(); }
  };
}
function lmWpSet() {
  const g = LM.g; if (!g) return;
  if (!g.beacon) { g.beacon = new T.Mesh(lmCyl(1.2, 1.2, 120, 10), new T.MeshBasicMaterial({ color: 0xff4d4d, transparent: true, opacity: 0.35, depthWrite: false })); g.scene.add(g.beacon); }
  g.beacon.visible = !!g.wp; if (g.wp) g.beacon.position.set(g.wp.x, 60, g.wp.z);
}

/* ---------- adegan ---------- */
function lmBuildScene() {
  const gq = LM.gq, r = LM.root;
  const cv = el("canvas", { class: "lm-cv", "aria-label": "META DIDIK, paparan 3D" }); r.appendChild(cv); LM.cv = cv;
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
  { const rs = LM.resume; LM.resume = null; /* v18.18: kembali dari Tempur atau Tanah Suci */
    const it = rs && rs.at && g.items.find((x) => x.id === rs.at);
    if (it) { g.p.x = it.x; g.p.z = it.z; g.p.yaw = 0; g.cam.yaw = 0; g.camera.position.set(it.x, 30, it.z + 30); setTimeout(() => lmPop(rs.msg || "Selamat kembali ke " + (it.n || it.sn || "Meta Didik")), 600); return; } }
  if (g.ownSk) { /* setiap misi bermula di hadapan pintu pagar sekolah sendiri */
    const o = g.ownSk; g.p.x = o.x; g.p.z = o.z + 3; g.p.yaw = Math.PI; g.cam.yaw = 0;
    g.camera.position.set(o.x, 30, o.z + 30); return;
  }
  const tw = g.items.find((x) => x.kind === "ap" && x.id === "ap-klia") || g.items[0];
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
  ui.coin = el("div", { class: "lm-pill", "data-m": "" }); ui.stamp = el("div", { class: "lm-pill", "data-m": "" }); ui.tw = el("div", { class: "lm-pill", "data-m": "" }); ui.wp = el("div", { class: "lm-pill", "data-m": "" }); ui.wp.hidden = true; ui.peers = el("div", { class: "lm-pill" }); ui.peers.hidden = true;
  ui.pts = el("div", { class: "lm-pill", "data-m": "", title: "Mata hari ini (betul 10, cubaan 2) dan kedudukan anda" });
  ui.wx = el("div", { class: "lm-pill", title: "Waktu dan cuaca (1 minit = 1 jam permainan)" });
  ui.en = el("div", { class: "lm-pill", "data-m": "", title: "Tenaga: berkurang apabila berjalan, berlari atau berenang. Makan di kedai makan atau kantin sekolah." });
  ui.hud.append(ui.state, ui.wx, ui.pts, ui.coin, ui.en, ui.stamp, ui.tw, ui.peers, ui.wp); r.appendChild(ui.hud);
  ui.guide = el("div", { class: "lm-guide", role: "status", title: "Ketik untuk melihat pasport Stesen Ilmu" }); ui.guide.addEventListener("click", () => lmPassport(lmCertOk() ? "lencana" : "ilmu")); r.appendChild(ui.guide);
  ui.quest = el("div", { class: "lm-quest" }); r.appendChild(ui.quest); lmQuestRender();
  ui.mm = el("canvas", { class: "lm-mm", width: 380, height: 192, title: "Buka peta (M)", "aria-label": "Peta mini" }); ui.mm.addEventListener("click", lmBigMap); r.appendChild(ui.mm);
  LM.mmBase = lmMapBase(380, 192);
  const top = el("div", { class: "lm-top" });
  /* telefon: semua butang dan statistik di bawah satu butang menu */
  ui.menuB = lmBtn("☰ Menu", "lm-mb", () => { const on = !r.classList.contains("menu"); r.classList.toggle("menu", on); ui.menuB.textContent = on ? "✕ Tutup" : "☰ Menu"; });
  top.append(ui.menuB);
  ui.skyB = lmBtn(LM.st.sky === 0 ? "Top 5: tutup" : "Top 5: buka", "", () => { const g = LM.g; if (!g || !g.sky5) return; const on = !g.sky5.sp.visible; g.sky5.sp.visible = on; LM.st.sky = on ? 1 : 0; lmSave(); ui.skyB.textContent = on ? "Top 5: buka" : "Top 5: tutup"; });
  top.append(lmBtn("Pasport (P)", "", () => lmPassport()), lmBtn("Tajuk (T)", "", () => lmPassport("tajuk")), ui.skyB, lmBtn("Bilik", "", lmRoomPanel), lmBtn("Swafoto", "", () => lmSelfie(null)),
    ui.snd = lmBtn(LM.mute ? "Bunyi: tutup" : "Bunyi: buka", "", () => { LM.mute = !LM.mute; ui.snd.textContent = LM.mute ? "Bunyi: tutup" : "Bunyi: buka"; }),
    lmBtn("Keluar", "", () => { if (confirm("Keluar dari META DIDIK? Cop pasport dan menara yang ditawan sudah disimpan.")) lmClose(); }));
  ui.vcB = lmBtn("🎙 Suara: tutup", "", () => { if (LM.vc) lmVoiceOff(); else lmVoiceOn(); }); ui.vcB.hidden = true; top.insertBefore(ui.vcB, top.children[4]);
  r.appendChild(top);
  ui.ptt = el("button", { type: "button", class: "lm-ptt", hidden: "" }, TOUCH ? "Tekan & cakap" : "Tahan V untuk cakap");
  const pt = (on) => (ev) => { ev.preventDefault(); lmTalk(on); };
  ui.ptt.addEventListener("pointerdown", pt(true)); ["pointerup", "pointerleave", "pointercancel"].forEach((k) => ui.ptt.addEventListener(k, pt(false)));
  ui.ptt.addEventListener("contextmenu", (ev) => ev.preventDefault());
  r.appendChild(ui.ptt);
  ui.chat = el("div", { class: "lm-chat", hidden: "" }); ui.chatLog = el("div", { class: "log", "aria-live": "polite" });
  ui.chatIn = el("input", { maxlength: "80", placeholder: TOUCH ? "Tulis mesej..." : "Tekan C untuk chat", "aria-label": "Mesej chat", autocomplete: "off", enterkeyhint: "send" });
  const cf = el("form", null, ui.chatIn, el("button", { type: "submit" }, "Hantar"));
  cf.addEventListener("submit", (ev) => { ev.preventDefault(); if (lmChatSend(ui.chatIn.value)) ui.chatIn.value = ""; if (!TOUCH) ui.chatIn.blur(); });
  ui.chatIn.addEventListener("focus", () => { for (const k in LM.keys) LM.keys[k] = false; ui.chat.classList.add("open"); });
  ui.chatIn.addEventListener("blur", () => ui.chat.classList.remove("open"));
  ui.chatIn.addEventListener("keydown", (ev) => { ev.stopPropagation(); if (ev.key === "Escape") ui.chatIn.blur(); });
  ui.chatIn.addEventListener("keyup", (ev) => ev.stopPropagation());
  ui.chat.append(ui.chatLog, cf); r.appendChild(ui.chat);
  ui.prompt = el("button", { type: "button", class: "pri lm-prompt", hidden: "" }); ui.prompt.addEventListener("click", lmInteract); r.appendChild(ui.prompt);
  const emo = el("div", { class: "lm-emo" });
  Object.keys(EMOTE).forEach((k, i) => emo.appendChild(lmBtn((i + 1) + " " + EMOTE[k], "", () => lmEmote(k))));
  emo.appendChild(lmBtn("5 🎉 Raikan", "", lmRai));
  r.appendChild(emo);
  ui.js = el("div", { class: "lm-js" }, el("i")); r.appendChild(ui.js);
  const tc = el("div", { class: "lm-tc" });
  ui.run = lmBtn("Lari", "", () => { LM.run = !LM.run; ui.run.classList.toggle("ok", LM.run); });
  ui.chatB = lmBtn("💬", "lm-cb", () => { r.classList.add("chat"); ui.chatIn.focus(); }); ui.chatB.title = "Chat";
  ui.chatIn.addEventListener("blur", () => setTimeout(() => { if (document.activeElement !== ui.chatIn) r.classList.remove("chat"); }, 200));
  tc.append(ui.chatB, lmBtn("Raikan", "", lmRai), ui.run, lmBtn("Lompat", "big pri", () => { LM.jump = true; }));
  r.appendChild(tc);
  ui.fade = el("div", { class: "lm-fade" }); r.appendChild(ui.fade);
}
function lmHudTick(g) {
  const ui = LM.ui, k = lmAt(g.p.x, g.p.z), s = lmSummary();
  const nm = g.flight && g.flight.ph === "air" ? "Di udara ✈ " + (k ? lmPlaceShort(k) : "Laut China Selatan") : g.sail ? "⛴ Di laut" : g.ride ? lmIc(g.ride.R.L) + " " + g.ride.R.L.n + " ke " + g.ride.b.nm : g.p.swim ? "🏊 Berenang" : lmPlaceName(k);
  if (ui.state.textContent !== nm) { ui.state.textContent = nm; if ((DATA.negeri[k] || ISL_BY[k]) && g.lastK && g.lastK !== k) lmPop(lmPlaceShort(k)); }
  if (DATA.negeri[k] || ISL_BY[k]) g.lastK = k;
  ui.coin.innerHTML = ""; ui.coin.append("🪙 ", el("b", null, String(P.coin | 0)));
  if (g.wx && g.wx.h != null) { const W = g.wx, h = W.h, ic = W.kind === "ribut" ? "⛈" : W.kind === "hujan" ? "🌧" : W.kind === "berawan" ? "⛅" : h < 6.2 || h > 19.4 ? "🌙" : h < 7.6 ? "🌅" : h > 18.4 ? "🌇" : W.terik ? "🥵" : "☀️", t = ic + " " + lmClockTxt(h) + " · " + (W.terik ? "Panas terik" : WXN[W.kind]); if (ui.wx.textContent !== t) ui.wx.textContent = t; }
  lmGuideTick(g);
  { const t = performance.now(); if (t - (g.lcT || 0) > 1000) { g.lcT = t; lmLcCheck(g); } }
  if (ui.hud) { /* panduan dan panel misi di bawah HUD (HUD boleh menjadi dua baris) */
    const t1 = ui.hud.offsetTop + ui.hud.offsetHeight + 6; if (ui.guide && ui.guide._tp !== t1) { ui.guide._tp = t1; ui.guide.style.top = t1 + "px"; }
    const t2 = ui.guide ? ui.guide.offsetTop + ui.guide.offsetHeight + 6 : t1; if (ui.quest && ui.quest._tp !== t2) { ui.quest._tp = t2; ui.quest.style.top = t2 + "px"; }
  }
  { const e = Math.round(lmEnergy()), t = (e <= 15 ? "😫" : e <= 35 ? "🍛" : "🍛") + " Tenaga " + e + "%"; if (ui.en.textContent !== t) { ui.en.textContent = t; ui.en.style.color = e <= 15 ? "#ff6b6b" : e <= 35 ? "#ffd166" : ""; ui.en.classList.toggle("warn", e <= 35); } }
  { /* mata hari ini (sama seperti papan Top 5) dan kedudukan */
    let pts = 0; try { pts = rkVal(rkLoad().m, "all", "hari", "jumlah", ""); } catch (e) { pts = 0; }
    if (LM.ptsLast != null && pts > LM.ptsLast) { lmPop("+" + (pts - LM.ptsLast) + " mata"); if (g.sky5 && !g.sky5.busy) lmSkyLoad(g); }
    LM.ptsLast = pts;
    const rk = g.sky5 && g.sky5.myRank, t = "⭐ " + pts + " mata hari ini" + (rk ? " · #" + rk + (g.sky5.total ? "/" + g.sky5.total : "") : "");
    if (ui.pts.textContent !== t) ui.pts.textContent = t;
  }
  ui.stamp.textContent = "📘 Cop " + s.pl + "/" + s.plN; { const J = lmJourney(); ui.tw.textContent = "📖 Stesen Ilmu " + J.d + "/" + J.t; }
  const np = Object.keys(LM.peers).length, op = LM.roomKind === "open"; ui.peers.hidden = !LM.room && !op;
  ui.peers.textContent = op ? (LM.room ? "🌏 " + (np + 1) + " · " + (ZONES[LM.zone] || "") : LM.openFull ? "🌏 Penuh · main solo" : "🌏 Menyambung...") : "👥 " + (np + 1) + (LM.roomKind === "sekolah" ? " · sekolah" : LM.roomCode ? " · " + LM.roomCode : "");
  ui.chat.hidden = !LM.room; ui.chatB.hidden = !LM.room; if (!ui.vcB.hidden !== lmVoiceOk()) lmVoiceUi();
  if (g.wp && g.wp.pid) { const e = LM.peers[g.wp.pid]; if (!e) { g.wp = null; lmWpSet(); lmPop("Rakan sudah keluar"); } else { g.wp.x = e.x; g.wp.z = e.z; lmWpSet(); } }
  if (g.wp) { ui.wp.hidden = false; const km = lmKmAB(g.p.x, g.p.z, g.wp.x, g.wp.z); ui.wp.textContent = "📍 " + g.wp.n + " · " + (km < 1 ? Math.round(km * 1000) + " m" : Math.round(km) + " km"); if (d < 12) { g.wp = null; lmWpSet(); } }
  else ui.wp.hidden = true;
}
/* ---------- interaksi ---------- */
function lmNearTick(g) {
  let best = null, bd = 1e9;
  for (const it of g.items) { const d = Math.hypot(it.x - g.p.x, it.z - g.p.z); if (d < it.ir && d < bd) { bd = d; best = it; } }
  /* v18.16: seluruh kompleks lapangan terbang (landasan, apron, terminal, pintu masuk) boleh ditekan E, bukan satu titik sahaja */
  if (!best) for (const it of g.items) {
    if (it.kind !== "ap" || !it.rw) continue;
    const w = it.rw, ux = Math.cos(w.a), uz = Math.sin(w.a), dx = g.p.x - w.x, dz = g.p.z - w.z, u = dx * ux + dz * uz, v = -dx * uz + dz * ux;
    if (Math.abs(u) < w.L + 14 && v > -16 && v < 60) { best = it; break; }
  }
  /* papan kenangan juga boleh dibuka dari hadapannya */
  for (const it of g.items) if (it.kind === "pl") { const d = Math.hypot(it.bx - g.p.x, it.bz - g.p.z); if (d < 7 && d < bd) { bd = d; best = it; } if (d < 60) lmNamesLoad(it); }
  g.near = best;
  const pr = LM.ui.prompt;
  if (!best || g.ui) { pr.hidden = true; return; }
  const key = TOUCH ? "" : "E: ";
  const txt = best.kind === "tw" ? key + "Menara Ilmu " + (best.t.kod || best.t.id) + (best.done ? " ✔" : "") : best.kind === "pl" ? key + "Ziarah " + best.n + (LM.st.pl[best.id] ? " ✔" : "")
    : best.kind === "st" ? key + (best.hub && best.hub.lines.length > 1 ? "🔀 " + best.n + " · " + [...new Set(best.hub.lines.map((q) => q.line.L.n))].join(", ") : best.line.L.road ? "Naik bas ekspres " + best.line.L.n + " · " + best.n : "Naik " + best.line.L.n + " · " + best.n)
    : best.kind === "si" ? key + "📖 " + best.sn + " · " + (best.t ? (best.t.kod || best.t.id) + " " + best.t.nama + (best.tids.length > 1 ? " (+" + (best.tids.length - 1) + ")" : "") : "Pusat Ulangkaji") + (best.done ? " ✔" : "")
    : best.kind === "km" ? key + "🎖 " + best.n + " · Masuk Tempur"
    : best.kind === "ip" ? key + "🎓 " + best.sn + " · Galeri kampus" + ((LM.st.kp || {})[best.id] ? " ✔" : "")
    : best.kind === "sk" ? key + "Sekolah anda: " + best.n
    : best.kind === "fd" ? key + "Kedai makan: " + best.n
    : best.kind === "sn" ? key + (best.d ? "Stesen Inovasi: " + best.n : "Dataran Inovasi: tapak kosong")
    : best.kind === "ak" ? key + (best.act || "Bantu: " + best.n)
    : best.kind === "kh" ? key + "Markas Misi Khas " + best.isl.khas.pendek + (best.done ? " ✔" : "") : best.kind === "jt" ? key + (best.k === best.isl.id ? "Feri pulang ke tanah besar" : "Naik feri ke " + best.isl.n) : key + "Terbang dari " + best.n;
  if (pr.textContent !== txt) pr.textContent = txt;
  pr.hidden = false;
}
function lmInteract() {
  const g = LM.g; if (!g || g.ui || !g.near) return;
  lmSnd("open");
  const it = g.near;
  if (it.kind === "sn") lmStnOpen(it); else if (it.kind === "tw") lmTowerOpen(it); else if (it.kind === "pl") lmPlaceOpen(it); else if (it.kind === "ap") lmAirportOpen(it); else if (it.kind === "kh") lmKhasOpen(it); else if (it.kind === "jt") lmFerryOpen(it); else if (it.kind === "st") lmRailOpen(it); else if (it.kind === "si") lmIlmuOpen(it); else if (it.kind === "km") lmKemOpen(it); else if (it.kind === "ip") lmKampusOpen(it); else if (it.kind === "sk") lmOwnSchoolOpen(it); else if (it.kind === "fd") lmFoodOpen(it); else if (it.kind === "ak") lmAkOpen(it);
}
/* ---------- input ---------- */
function lmKey(e) {
  if (!LM.on || !LM.g || LM.pause) return;
  const t = e.target; if (t && (t.nodeName === "INPUT" || t.nodeName === "TEXTAREA")) return;
  const k = String(e.key || "").toLowerCase(), dn = e.type === "keydown", g = LM.g;
  if (dn && k === "escape") { e.preventDefault(); if (LM.ui.big) lmBigMap(); else if (LM.ui.card) lmCardClose(); else if (confirm("Keluar dari META DIDIK?")) lmClose(); return; }
  if (g.ui) return;
  if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].indexOf(k) >= 0) e.preventDefault();
  if (k === "v") { lmTalk(dn); return; }
  LM.keys[k] = dn;
  if (!dn) return;
  if (k === "c" && LM.ui.chatIn && !LM.ui.chat.hidden) { e.preventDefault(); LM.keys[k] = false; LM.ui.chatIn.focus(); return; }
  if (k === "e" || k === "enter") lmInteract();
  else if (k === "m") lmBigMap();
  else if (k === "p") lmPassport("tempat");
  else if (k === "t") lmPassport("tajuk");
  else if (k >= "1" && k <= "4") lmEmote(Object.keys(EMOTE)[+k - 1]);
  else if (k === "5") lmRai();
}
function lmJsReset() {
  LM.js.id = -1; LM.js.x = LM.js.y = 0; LM.drag.id = -1;
  const j = LM.ui.js; if (j) { j.style.left = ""; j.style.top = ""; j.style.bottom = ""; if (j.firstChild) j.firstChild.style.transform = ""; }
}
function lmPointers(cv) {
  /* iOS/Android: halang tatal, zum dan menu tekan lama supaya sentuhan kayu bedik tidak dibatalkan (pointercancel) */
  const stop = (e) => { if (e.cancelable) e.preventDefault(); };
  cv.addEventListener("touchstart", stop, { passive: false }); cv.addEventListener("touchmove", stop, { passive: false });
  if (!LM.jsWin) {
    LM.jsWin = true;
    window.addEventListener("blur", lmJsReset); window.addEventListener("orientationchange", lmJsReset);
    document.addEventListener("visibilitychange", () => { if (document.hidden) lmJsReset(); });
  }
  /* pengendali dikongsi: id ialah nombor (pointerId, atau 100000 + identifier bagi Touch Events) */
  const down = (id, cx, cy, touch) => {
    if (!LM.g || LM.g.ui) return;
    /* sentuhan baharu di kiri sentiasa mengambil alih kayu bedik (elak id lama yang tersangkut) */
    if (touch && cx < window.innerWidth * 0.42) {
      if (document.activeElement && document.activeElement.blur && document.activeElement !== document.body) document.activeElement.blur();
      LM.js.id = id; LM.js.cx = cx; LM.js.cy = cy; LM.js.x = LM.js.y = 0;
      const j = LM.ui.js; j.style.left = (cx - 60) + "px"; j.style.top = (cy - 60) + "px"; j.style.bottom = "auto";
    } else if (touch || LM.drag.id < 0) { LM.drag.id = id; LM.drag.x = cx; LM.drag.y = cy; }
  };
  const move = (id, cx, cy) => {
    if (id === LM.js.id) {
      let dx = (cx - LM.js.cx) / 50, dy = (LM.js.cy - cy) / 50; const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; }
      LM.js.x = dx; LM.js.y = dy; const i = LM.ui.js.firstChild; i.style.transform = "translate(" + dx * 34 + "px," + -dy * 34 + "px)";
    } else if (id === LM.drag.id) {
      const dx = cx - LM.drag.x, dy = cy - LM.drag.y; LM.drag.x = cx; LM.drag.y = cy;
      LM.camIn = [(LM.camIn ? LM.camIn[0] : 0) + dx * 0.006, (LM.camIn ? LM.camIn[1] : 0) + dy * 0.004];
    }
  };
  const end = (id) => {
    if (id === LM.js.id) { LM.js.id = -1; LM.js.x = LM.js.y = 0; const j = LM.ui.js; j.style.left = ""; j.style.top = ""; j.style.bottom = ""; j.firstChild.style.transform = ""; }
    if (id === LM.drag.id) LM.drag.id = -1;
  };
  /* Peranti sentuh (terutama iPhone Safari): guna Touch Events terus; Pointer Events hanya untuk tetikus/pen */
  const TE = "ontouchstart" in window;
  if (TE) {
    const each = (e, fn) => { for (let i = 0; i < e.changedTouches.length; i++) { const t = e.changedTouches[i]; fn(100000 + t.identifier, t.clientX, t.clientY); } };
    cv.addEventListener("touchstart", (e) => each(e, (id, x, y) => down(id, x, y, true)), { passive: false });
    cv.addEventListener("touchmove", (e) => each(e, move), { passive: false });
    cv.addEventListener("touchend", (e) => { stop(e); each(e, end); }, { passive: false });
    cv.addEventListener("touchcancel", (e) => each(e, end), { passive: false });
  }
  cv.addEventListener("pointerdown", (e) => {
    if (TE && e.pointerType === "touch") return;
    down(e.pointerId, e.clientX, e.clientY, e.pointerType === "touch");
    try { cv.setPointerCapture(e.pointerId); } catch (x) { /* abaikan */ }
  });
  cv.addEventListener("pointermove", (e) => { if (!(TE && e.pointerType === "touch")) move(e.pointerId, e.clientX, e.clientY); });
  const up = (e) => { if (!(TE && e.pointerType === "touch")) end(e.pointerId); };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  cv.addEventListener("contextmenu", (e) => e.preventDefault());
  cv.addEventListener("wheel", (e) => { if (LM.g) { LM.g.cam.dist = clamp(LM.g.cam.dist + Math.sign(e.deltaY) * 2, 8, 46); e.preventDefault(); } }, { passive: false });
}
function lmResize() {
  const g = LM.g; if (!g) return;
  g.renderer.setSize(window.innerWidth, window.innerHeight, false); g.camera.aspect = window.innerWidth / window.innerHeight; g.camera.updateProjectionMatrix();
}
/* ---------- gelung ---------- */
/* ---------- v18.11: masa dan cuaca ----------
   Jam permainan bermula pada waktu sebenar Malaysia dan bergerak 60 kali lebih pantas (satu hari = 24 minit).
   Fasa: subuh, matahari terbit, pagi, tengah hari terik, petang, matahari terbenam, malam berbintang.
   Cuaca bertukar setiap 2 hingga 4 minit: cerah, berawan, hujan dan ribut petir (lebih kerap pada waktu petang). */
const SKYK = [ /* [jam, langit atas, ufuk, kekuatan matahari, hemisfera, warna cahaya] */
  [0, 0x0a1430, 0x1a2848, 0.10, 0.30, 0x8aa0ff], [5.4, 0x14244e, 0x3a3a6a, 0.12, 0.32, 0x9aa8ff], [6.4, 0x4a6aae, 0xff9a62, 0.45, 0.50, 0xffa060],
  [7.6, 0x3f8ee0, 0xcfe4ff, 0.80, 0.70, 0xfff0d8], [12.5, 0x2378e0, 0xeaf6ff, 0.96, 0.76, 0xfff6e6], [16.5, 0x3a86d8, 0xd6ecff, 0.90, 0.78, 0xfff0d8],
  [18.7, 0x4a5f9e, 0xff8a50, 0.48, 0.55, 0xff8040], [19.5, 0x24305e, 0x5a4a78, 0.18, 0.40, 0xb090ff], [20.5, 0x0e1838, 0x22305a, 0.10, 0.32, 0x8aa0ff], [24, 0x0a1430, 0x1a2848, 0.10, 0.30, 0x8aa0ff]
];
const WAKTU = [[5.85, "Subuh"], [13.2, "Zohor"], [16.5, "Asar"], [19.35, "Maghrib"], [20.5, "Isyak"]]; /* anggaran Kuala Lumpur */
const WXN = { cerah: "Cerah", berawan: "Berawan", hujan: "Hujan", ribut: "Ribut petir" };
function lmClock() {
  if (LM.clock0 == null) { let h = 10; try { const d = new Date(Date.now() + 8 * 3600000); h = d.getUTCHours() + d.getUTCMinutes() / 60; } catch (e) { h = 10; } LM.clock0 = h; LM.clockT0 = performance.now(); }
  return (LM.clock0 + (performance.now() - LM.clockT0) / 60000) % 24; /* 1 minit sebenar = 1 jam permainan */
}
function lmClockTxt(h) {
  const H = Math.floor(h), M = Math.floor((h - H) * 60), h12 = ((H + 11) % 12) + 1, ph = H < 12 ? (H < 6 ? "pagi" : "pagi") : H < 14 ? "tengah hari" : H < 19 ? "petang" : "malam";
  return h12 + ":" + String(M).padStart(2, "0") + " " + (H < 5 ? "pagi" : ph);
}
function lmSkyAt(h) {
  let i = 0; while (i < SKYK.length - 2 && SKYK[i + 1][0] <= h) i++;
  const A = SKYK[i], B = SKYK[i + 1], k = clamp((h - A[0]) / (B[0] - A[0]), 0, 1), C = (x) => new T.Color(x);
  return { top: C(A[1]).lerp(C(B[1]), k), hor: C(A[2]).lerp(C(B[2]), k), sun: A[3] + (B[3] - A[3]) * k, hemi: A[4] + (B[4] - A[4]) * k, col: C(A[5]).lerp(C(B[5]), k) };
}
function lmWxInit(g) {
  const W = g.wx = { kind: "cerah", c: 0, cw: 0, t: 60 + Math.random() * 90, flash: 0, nf: 8 };
  /* titisan hujan di sekeliling kamera */
  const N = LM.gq ? 1400 : 600, pos = new Float32Array(N * 6), sp = new Float32Array(N);
  for (let i = 0; i < N; i++) { const x = (Math.random() - 0.5) * 140, y = Math.random() * 70, z = (Math.random() - 0.5) * 140; pos.set([x, y, z, x + 0.25, y + 2.2, z], i * 6); sp[i] = 55 + Math.random() * 25; }
  const geo = new T.BufferGeometry(); geo.setAttribute("position", new T.BufferAttribute(pos, 3));
  W.rain = new T.LineSegments(geo, new T.LineBasicMaterial({ color: 0xc8d6ea, transparent: true, opacity: 0, depthWrite: false })); W.rain.frustumCulled = false; W.rain.visible = false; W.sp = sp; g.scene.add(W.rain);
  /* bintang dan bulan */
  const sn = 700, sp2 = new Float32Array(sn * 3); for (let i = 0; i < sn; i++) { const u = Math.random() * 6.2832, v = Math.acos(Math.random() * 0.95); sp2.set([Math.sin(v) * Math.cos(u) * 1150, Math.cos(v) * 1150, Math.sin(v) * Math.sin(u) * 1150], i * 3); }
  const sg = new T.BufferGeometry(); sg.setAttribute("position", new T.BufferAttribute(sp2, 3));
  W.stars = new T.Points(sg, new T.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false })); W.stars.frustumCulled = false; W.stars.renderOrder = -9; g.scene.add(W.stars);
  const mt = lmTex(64, 64, (x, w) => { const gr = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, "rgba(240,244,255,1)"); gr.addColorStop(0.45, "rgba(220,228,255,.95)"); gr.addColorStop(0.55, "rgba(200,210,255,.2)"); gr.addColorStop(1, "rgba(200,210,255,0)"); x.fillStyle = gr; x.fillRect(0, 0, w, w); });
  W.moon = new T.Sprite(new T.SpriteMaterial({ map: mt, fog: false, depthWrite: false, transparent: true, opacity: 0 })); W.moon.scale.set(70, 70, 1); W.moon.renderOrder = -9; g.scene.add(W.moon);
}
function lmWxPick(h) {
  const r = Math.random(), pm = h >= 14 && h < 19.5; /* hujan petang lazim di Malaysia */
  return pm ? (r < 0.3 ? "cerah" : r < 0.5 ? "berawan" : r < 0.8 ? "hujan" : "ribut") : (r < 0.55 ? "cerah" : r < 0.8 ? "berawan" : r < 0.95 ? "hujan" : "ribut");
}
/* dipanggil setiap 0.5 s: warna langit, cahaya, kabus dan pertukaran cuaca */
function lmDayNight(g) {
  if (!g.wx) lmWxInit(g);
  const W = g.wx, h = lmClock(), S = lmSkyAt(h);
  W.t -= 0.5; if (W.t <= 0) { const k = lmWxPick(h); if (k !== W.kind) { W.kind = k; lmPop({ cerah: "☀️ Cuaca kembali cerah", berawan: "⛅ Langit mendung", hujan: "🌧 Hujan mula turun", ribut: "⛈ Ribut petir! Berteduh dahulu" }[k]); } W.t = 120 + Math.random() * 120; }
  W.cw = { cerah: 0, berawan: 0.45, hujan: 0.8, ribut: 1 }[W.kind]; W.c += (W.cw - W.c) * 0.12;
  const grey = new T.Color(0x77808e), dark = new T.Color(0x3e4552), cl = W.c;
  const top = S.top.clone().lerp(grey, cl * 0.75), hor = S.hor.clone().lerp(cl > 0.7 ? dark : grey, cl * 0.7);
  if (g.paintSky) g.paintSky(top, hor);
  g.scene.background.copy(hor); g.scene.fog.color.copy(hor); g.scene.fog.near = 320 - 180 * cl; g.scene.fog.far = 1180 - 640 * cl;
  g.sun.intensity = S.sun * (1 - 0.6 * cl); g.hemi.intensity = S.hemi * (1 - 0.25 * cl); g.sun.color.copy(S.col);
  /* arah cahaya: matahari pada siang, bulan pada malam (sentiasa di atas ufuk untuk bayang) */
  const day = h >= 6.2 && h <= 19.2, f = day ? (h - 6.2) / 13 : ((h + 24 - 19.2) % 24) / 11, az = Math.PI * f, el = Math.sin(Math.PI * f);
  const vis = new T.Vector3(Math.cos(az) * 0.9, Math.max(-0.2, el), -0.35).normalize(); g.sunVis = vis;
  g.sunDir = new T.Vector3(vis.x, Math.max(0.3, vis.y), vis.z).normalize();
  if (g.sunDisc) { g.sunDisc.visible = day; g.sunDisc.material.opacity = clamp(el * 3, 0, 1) * (1 - cl); }
  if (W.moon) { W.moon.visible = !day; W.moon.material.opacity = clamp(el * 3, 0, 1) * (1 - cl * 0.9); }
  const night = clamp(1 - S.sun / 0.45, 0, 1); W.stars.material.opacity = night * (1 - cl);
  if (g.clouds && g.clouds.children[0]) { const m = g.clouds.children[0].material; m.opacity = 0.75 + 0.25 * cl; m.color.setRGB(1 - 0.55 * cl - 0.4 * night, 1 - 0.5 * cl - 0.38 * night, 1 - 0.45 * cl - 0.3 * night); }
  W.rain.visible = W.c > 0.55 && W.kind !== "berawan"; W.rain.material.opacity = clamp((W.c - 0.55) * 2.2, 0, 0.6);
  W.terik = h >= 11.5 && h <= 15.5 && W.c < 0.15;
  /* waktu solat (anggaran KL) */
  const hp = W.hp == null ? h : W.hp; WAKTU.forEach(([wh, n]) => { if ((hp < wh && h >= wh) || (hp > h && wh <= h)) lmPop("🕌 Masuk waktu solat " + n); }); W.hp = h;
  W.h = h;
}
/* setiap bingkai: hujan jatuh mengikut kamera, kilat */
function lmWxTick(g, dt) {
  const W = g.wx; if (!W) return;
  if (W.rain.visible) {
    const P = W.rain.geometry.attributes.position, a = P.array, N = W.sp.length, cp = g.camera.position;
    W.rain.position.set(cp.x, Math.max(0, cp.y - 30), cp.z);
    for (let i = 0; i < N; i++) { const o = i * 6, d = W.sp[i] * dt; a[o + 1] -= d; a[o + 4] -= d; if (a[o + 1] < 0) { a[o + 1] += 70; a[o + 4] += 70; } }
    P.needsUpdate = true;
  }
  if (W.kind === "ribut" && W.c > 0.8) {
    if ((W.nf -= dt) <= 0) { W.nf = 5 + Math.random() * 9; W.flash = 0.18; setTimeout(() => { try { if (!LM.mute) arBeep(60, 0.9, "sawtooth", 0.05, -30); } catch (e) { /* abaikan */ } }, 400 + Math.random() * 900); }
  }
  if (W.flash > 0) { W.flash -= dt; if (W.flash > 0) g.hemi.intensity = 2.4; else lmDayNight(g); }
}
function lmLoop(ts) {
  if (!LM.on || !LM.g) return;
  LM.raf = requestAnimationFrame(lmLoop);
  if (LM.pause) { LM.g.last = 0; return; } /* Gudang dibuka */
  const g = LM.g, dt = clamp((ts - (g.last || ts)) / 1000, 0, 0.1); g.last = ts; g.T += dt;
  try {
    if (g.ui && !g.flight && !g.sail && !g.ride && !LM.ui.card && !LM.ui.big) g.ui = false; /* tiada panel terbuka: lepaskan kunci pergerakan */
    if (g.rai && (g.rai.t -= dt) <= 0) g.rai = null;
    if (g.flight) lmFlightTick(g, dt); else if (g.sail) lmSailTick(g, dt); else if (g.ride) lmRideTick(g, dt); else { lmUpdatePlayer(g, dt); lmUpdateCam(g, dt); }
    lmRailTick(g, dt);
    lmNet(g, dt, ts); lmPuffTick(g, dt); lmTrafficTick(g, dt); lmWxTick(g, dt); lmAkTick(g, dt);
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
    if (g.clouds) for (const c of g.clouds.children) { c.position.x += dt * 3; if (c.position.x > WB.x0 + WB.w) c.position.x = WB.x0; }
    if (g.seaN) { g.seaN.offset.x = (g.T * 0.006) % 1; g.seaN.offset.y = (g.T * 0.0037) % 1; }
    if (!LM.map3) g.renderer.render(g.scene, g.camera); /* peta 3D terbuka: jimat GPU */
  } catch (e) { LM.err = String(e && e.stack || e); if (!LM.errShown) { LM.errShown = true; console.error(e); } }
}
/* ---------- buka, mula, tutup ---------- */
function lmOpen(tid) {
  if (!T) { toast("Grafik 3D (WebGL) tidak tersedia pada peranti ini.", "warn"); return; }
  LM.tid = tid || ""; LM.on = false; lmLoad();
  document.body.classList.add("ar-lock");
  if (!GEOD) {
    const r = lmRoot(); r.appendChild(el("div", { class: "lm-card" }, el("div", { class: "lm-box" }, el("div", { class: "lm-kick" }, "META DIDIK"), el("h2", null, "Memuat peta Malaysia sebenar..."), el("p", null, "Sempadan negeri dan ketinggian muka bumi (kali pertama sahaja)."))));
  }
  lmGeoLoad().then(() => lmOwnSchool()).then((sk) => { LM.ownSk = sk; lmRaster(); if (LM.resume) lmStart("", ""); else lmSetup(); }).catch(() => { toast("Peta META DIDIK tidak dapat dimuatkan. Semak sambungan internet dan cuba lagi.", "warn"); lmClose(); });
}
function lmStart(code, kind) {
  const r = LM.root; LM.ptsLast = null; LM.roomKind = kind || ""; LM.sh = lmMySh(); LM.zoneN = null; LM.zoneAt = 0; LM.roomCode = ""; LM.openFull = false; LM.openRetry = 0; LM.zone = "";
  lmCardClose(); r.textContent = "";
  const ld = el("div", { class: "lm-card" }, el("div", { class: "lm-box" }, el("div", { class: "lm-kick" }, "META DIDIK"), el("h2", null, "Membina peta Malaysia..."), el("p", null, "Menyusun negeri, menara ilmu dan tempat pelancongan.")));
  r.appendChild(ld);
  setTimeout(async () => {
    const g = lmBuildScene();
    if (!g) { ld.remove(); toast("Grafik 3D (WebGL) tidak dapat dimulakan pada peranti ini.", "warn"); lmClose(); return; }
    ld.remove(); LM.daily = lmDaily(); lmHud(); lmSpawn(g); lmPointers(LM.cv); lmWpSet();
    LM.on = true; g.last = 0;
    window.addEventListener("keydown", lmKey, true); window.addEventListener("keyup", lmKey, true); window.addEventListener("resize", lmResize);
    LM.raf = requestAnimationFrame(lmLoop);
    if (kind === "open") { LM.zone = lmZone(lmAt(g.p.x, g.p.z)) || "tengah"; lmOpenJoin(LM.zone).then((ok) => { if (ok) lmPop("Masuk Dunia Terbuka · " + ZONES[LM.zone]); else if (LM.openFull) toast("Dunia Terbuka sedang penuh. Anda bermain solo dahulu; sistem akan cuba masuk semula setiap minit.", "warn"); }); }
    else if (code) { const ok = await lmNetJoin(code, kind); if (ok) lmPop(kind === "sekolah" ? "Masuk bilik sekolah" : "Bilik " + code); }
    lmPop("Selamat datang ke Malaysia!");
  }, 30);
}
function lmClose() {
  { const b = document.getElementById("lmGdBack"); if (b) b.remove(); } LM.pause = false;
  if (LM.ui.big && LM.ui.big._off) { LM.ui.big._off(); LM.ui.big = null; }
  LM.on = false; cancelAnimationFrame(LM.raf); lmoStop(); lmNetLeave(); lmEngine(0); LM.roomKind = "";
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
  if (window.__swPend) setTimeout(() => location.reload(), 300); /* versi baharu tiba semasa bermain */
}
/* untuk ujian automatik */
LM._g = (x, z) => lmGround(x, z); LM._fly = (a, d) => lmFlyStart(a, d); LM._ride = (a, b) => lmRide(a, b); LM._rai = () => lmRai(); LM._swim = (x, z) => lmSwimOk(x, z);
LM._t = { lmTanahGo: lmTanahGo, lmAirportOpen: lmAirportOpen, lmKemOpen: lmKemOpen, lmKampusOpen: lmKampusOpen, lmIlmuOpen: lmIlmuOpen, lmKampusFetch: lmKampusFetch, lmRailOpen: lmRailOpen, lmRide: lmRide, lmStnFetch: lmStnFetch, lmStnOpen: lmStnOpen, lmCertCanvas: lmCertCanvas, lmLcCheck: lmLcCheck, LCN: LCN, lmAt: lmAt, lmRailPick: (s) => lmRailPick(s), lmAkSpawn: (g) => lmAkSpawn(g), AKH: AKH, toW: toW, ll: (a, b) => ll(a, b), PLACES: PLACES, AIRPORTS: AIRPORTS, lmInteract: lmInteract, lmPickQs: lmPickQs };
})();
