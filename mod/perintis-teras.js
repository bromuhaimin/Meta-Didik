/* =====================================================================
   META DIDIK: teras logik kawasan perintis (data geospatial sebenar). Tanpa DOM / Three.js, boleh diuji dalam Node.
   Unit = meter dalam unjuran setempat (x timur, z selatan) daripada tools/geo/perintis.py.
   ===================================================================== */
(function (root) {
  "use strict";
  const SEL = 40;
  const sel = (x, z) => Math.floor(x / SEL) + "," + Math.floor(z / SEL);
  /* ---------- tinggi dek jambatan / jejambat (layer OSM) dengan cerun di hujung ---------- */
  function dekProfil(j) {
    const p = j.p, n = p.length, L = [0];
    for (let i = 1; i < n; i++) L.push(L[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
    if (!j.b || (j.l || 0) <= 0) return p.map(() => (j.t ? -6 : 0));
    const tot = L[n - 1] || 1, H = (j.l || 1) * (tot > 120 ? 6.5 : 1.4), ramp = Math.min(45, tot / 3);
    return L.map((s) => +(H * Math.min(1, s / ramp, (tot - s) / ramp)).toFixed(2));
  }
  /* ---------- graf rangkaian jalan ---------- */
  function graf(d, mode, D) {
    const kaki = mode !== "kenderaan", N = {}, A = {};
    const add = (a, b, w) => { (A[a] || (A[a] = [])).push([b, w]); };
    (d.jalan || []).forEach((j) => {
      if (kaki && (j.hw === "motorway" || j.hw === "motorway_link")) return;           /* pejalan kaki tidak dibenarkan di lebuh raya */
      if (!kaki && !j.pandu) return;                                                     /* kenderaan: jalan boleh dipandu sahaja */
      const nd = j.nd || [], ys = ysNod(j, D);
      for (let i = 0; i < nd.length; i++) if (!N[nd[i]]) N[nd[i]] = { x: j.p[i][0], z: j.p[i][1], y: ys[i] };
      for (let i = 0; i < nd.length - 1; i++) {
        const w = Math.hypot(j.p[i + 1][0] - j.p[i][0], j.p[i + 1][1] - j.p[i][1]);
        const ow = kaki ? 0 : j.ow | 0;
        if (ow >= 0) add(nd[i], nd[i + 1], w);
        if (ow <= 0) add(nd[i + 1], nd[i], w);
      }
    });
    const G = {}; Object.keys(N).forEach((id) => { const c = sel(N[id].x, N[id].z); (G[c] || (G[c] = [])).push(id); });
    return { N: N, A: A, G: G, mode: kaki ? "kaki" : "kenderaan" };
  }
  function terdekat(g, x, z, maks) {
    let best = null, bd = (maks || 400) ** 2; const cx = Math.floor(x / SEL), cz = Math.floor(z / SEL), R = Math.ceil((maks || 400) / SEL);
    for (let r = 0; r <= R; r++) { for (let i = cx - r; i <= cx + r; i++) for (let k = cz - r; k <= cz + r; k++) { if (Math.max(Math.abs(i - cx), Math.abs(k - cz)) !== r) continue; (g.G[i + "," + k] || []).forEach((id) => { if (!g.A[id]) return; const n = g.N[id], dd = (n.x - x) ** 2 + (n.z - z) ** 2; if (dd < bd) { bd = dd; best = id; } }); } if (best && r * SEL > Math.sqrt(bd) + SEL) break; }
    return best;
  }
  /* A* dengan timbunan binari; pulang senarai id nod atau null jika tiada laluan dalam rangkaian */
  function astar(g, s, t) {
    if (s == null || t == null || !g.N[s] || !g.N[t]) return null;
    const T = g.N[t], h = (id) => Math.hypot(g.N[id].x - T.x, g.N[id].z - T.z);
    const gs = { [s]: 0 }, from = {}, heap = [[h(s), s]], done = new Set();
    const push = (it) => { heap.push(it); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
    while (heap.length) {
      const [, u] = pop(); if (done.has(u)) continue; if (String(u) === String(t)) { const path = [u]; let c = u; while (from[c] != null) { c = from[c]; path.push(c); } return path.reverse(); }
      done.add(u);
      for (const [v, w] of g.A[u] || []) { const nv = gs[u] + w; if (gs[v] == null || nv < gs[v]) { gs[v] = nv; from[v] = u; push([nv + h(v), v]); } }
    }
    return null;
  }
  function panjang(g, path) { let s = 0; for (let i = 1; i < (path || []).length; i++) s += Math.hypot(g.N[path[i]].x - g.N[path[i - 1]].x, g.N[path[i]].z - g.N[path[i - 1]].z); return s; }
  /* ---------- perlanggaran bangunan (indeks grid) ---------- */
  function dalam(x, z, ring) { let ins = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const a = ring[i], b = ring[j]; if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / ((b[1] - a[1]) || 1e-9) + a[0]) ins = !ins; } return ins; }
  function gridPoligon(list) {
    const G = {};
    (list || []).forEach((b, idx) => { let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; b.p.forEach(([x, z]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }); b._bb = [x0, z0, x1, z1]; for (let i = Math.floor(x0 / SEL); i <= Math.floor(x1 / SEL); i++) for (let k = Math.floor(z0 / SEL); k <= Math.floor(z1 / SEL); k++) (G[i + "," + k] || (G[i + "," + k] = [])).push(idx); });
    return { G: G, L: list || [] };
  }
  function kenaPoligon(gp, x, z, r) {
    const ids = new Set(); for (let i = Math.floor((x - r) / SEL); i <= Math.floor((x + r) / SEL); i++) for (let k = Math.floor((z - r) / SEL); k <= Math.floor((z + r) / SEL); k++) (gp.G[i + "," + k] || []).forEach((v) => ids.add(v));
    for (const i of ids) { const b = gp.L[i], bb = b._bb; if (x < bb[0] - r || x > bb[2] + r || z < bb[1] - r || z > bb[3] + r) continue; if (dalam(x, z, b.p)) return b; if (r) for (const [dx, dz] of [[r, 0], [-r, 0], [0, r], [0, -r]]) if (dalam(x + dx, z + dz, b.p)) return b; }
    return null;
  }
  /* ---------- permukaan: tinggi dek jambatan di bawah pemain (pilih aras terdekat dengan y semasa) ---------- */
  function indeksDek(d, D) {
    const G = {};
    (d.jalan || []).forEach((j) => { if (!j.b) return; const ys = ysNod(j, D); j._ys = ys; for (let i = 0; i < j.p.length - 1; i++) { const a = j.p[i], b = j.p[i + 1]; for (let ix = Math.floor(Math.min(a[0], b[0]) / SEL); ix <= Math.floor(Math.max(a[0], b[0]) / SEL); ix++) for (let iz = Math.floor(Math.min(a[1], b[1]) / SEL); iz <= Math.floor(Math.max(a[1], b[1]) / SEL); iz++) (G[ix + "," + iz] || (G[ix + "," + iz] = [])).push([j, i]); } });
    return G;
  }
  function tinggiPermukaan(ID, x, z, yNow, yTanah) {
    const y0 = yTanah || 0; let best = y0, bd = Math.abs((yNow || 0) - y0);
    for (const [j, i] of ID[sel(x, z)] || []) {
      const a = j.p[i], b = j.p[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / L2));
      const px = a[0] + dx * t, pz = a[1] + dz * t; if (Math.hypot(px - x, pz - z) > (j.w || 6) / 2 + 0.4) continue;
      const y = j._ys[i] + (j._ys[i + 1] - j._ys[i]) * t; if (Math.abs(y - (yNow || 0)) < bd + 0.01 && Math.abs(y - (yNow || 0)) < 2.6) { bd = Math.abs(y - (yNow || 0)); best = y; }
    }
    return best;
  }
  /* ---------- V8: objek terapung / tenggelam (dijalankan pada senarai objek adegan) ---------- */
  function semakTanah(objek, tol) {
    const t = tol == null ? 0.05 : tol;
    return objek.filter((o) => { const k = o.tol == null ? t : o.tol; return !o.terowong && (o.minY > o.tanah + t || o.minY < o.tanah - k); }).map((o) => ({ kod: "V8", id: o.id, jenis: o.jenis, minY: o.minY, tanah: o.tanah }));
  }
  /* ---------- rupa bumi (DEM) ---------- */
  /* D = { x0, z0, dx, dz, nx, nz, h: Float32Array (relatif kepada ref), ref } daripada tools/geo/dem.py */
  function dem(raw) {
    const g = raw.grid, n = g.nx * g.nz, h = new Float32Array(n); let mn = Infinity;
    for (let i = 0; i < n; i++) mn = Math.min(mn, raw.h[i]);
    const ref = Math.floor(mn); for (let i = 0; i < n; i++) h[i] = raw.h[i] - ref;
    return { x0: g.x0, z0: g.z0, dx: g.dx, dz: g.dz, nx: g.nx, nz: g.nz, h: h, ref: ref, meta: raw.meta };
  }
  /* interpolasi segi tiga, SAMA dengan pembahagian segi empat dalam jejaring rupa bumi (pepenjuru dari (i,j+1) ke (i+1,j)),
     supaya jalan dan kaki avatar tepat di atas permukaan yang dilukis */
  function tinggiTanah(D, x, z) {
    if (!D) return 0;
    const fx = Math.max(0, Math.min(D.nx - 1.000001, (x - D.x0) / D.dx)), fz = Math.max(0, Math.min(D.nz - 1.000001, (z - D.z0) / D.dz));
    const j = Math.floor(fx), i = Math.floor(fz), u = fx - j, v = fz - i, n = D.nx, H = D.h;
    const h00 = H[i * n + j], h01 = H[i * n + j + 1], h10 = H[(i + 1) * n + j], h11 = H[(i + 1) * n + j + 1];
    return u + v <= 1 ? h00 + (h01 - h00) * u + (h10 - h00) * v : h11 + (h10 - h11) * (1 - u) + (h01 - h11) * (1 - v);
  }
  /* petak (chunk) rupa bumi: julat sampel bertindih satu baris/lajur di sempadan, jadi bucu tepi dikongsi dan tiada jurang */
  function petakTanah(D, n) {
    const out = [];
    for (let i0 = 0; i0 < D.nz - 1; i0 += n) for (let j0 = 0; j0 < D.nx - 1; j0 += n) out.push({ i0: i0, i1: Math.min(D.nz - 1, i0 + n), j0: j0, j1: Math.min(D.nx - 1, j0 + n) });
    return out;
  }
  /* indeks segi tiga untuk satu petak (bucu baris demi baris, (i1-i0+1) x (j1-j0+1)); normal menghadap ke atas */
  function indeksPetak(c) {
    const w = c.j1 - c.j0 + 1, I = [];
    for (let i = 0; i < c.i1 - c.i0; i++) for (let j = 0; j < c.j1 - c.j0; j++) { const a = i * w + j, b = a + 1, cc = a + w, d = cc + 1; I.push(a, cc, b, d, b, cc); }
    return I;
  }
  /* ketinggian mutlak (relatif ref DEM) setiap nod jalan: jalan biasa ikut tanah; jambatan/jejambat: garis lurus antara
     tanah di kedua-dua hujung + profil dek; terowong: di bawah tanah */
  function ysNod(j, D) {
    const dek = dekProfil(j);
    if (!D) return dek;
    const p = j.p, n = p.length;
    if (!j.b && !j.t) return p.map(([x, z]) => tinggiTanah(D, x, z));
    const L = [0]; for (let i = 1; i < n; i++) L.push(L[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
    const ya = tinggiTanah(D, p[0][0], p[0][1]), yb = tinggiTanah(D, p[n - 1][0], p[n - 1][1]), tot = L[n - 1] || 1;
    return L.map((s, i) => ya + (yb - ya) * (s / tot) + dek[i]);
  }
  /* garis padat (langkah <= maks meter) untuk lukisan di atas rupa bumi; ys diinterpolasi linear */
  function padat(pts, ys, maks) {
    const P = [pts[0]], Y = [ys[0]];
    for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(1, Math.ceil(L / maks)); for (let s = 1; s <= k; s++) { const t = s / k; P.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); Y.push(ys[i - 1] + (ys[i] - ys[i - 1]) * t); } }
    return { p: P, ys: Y };
  }
  /* ---------- lot pameran guru: tidak menghalang jalan, tidak dalam air, tidak bertindih bangunan ---------- */
  function sediaLot(d) {
    const G = {}, segs = [];
    const tambah = (a, b, lebar, jenis, id) => { const s = { a: a, b: b, w: lebar, jenis: jenis, id: id }, k = segs.push(s) - 1; for (let i = Math.floor(Math.min(a[0], b[0]) / SEL) - 1; i <= Math.floor(Math.max(a[0], b[0]) / SEL) + 1; i++) for (let m = Math.floor(Math.min(a[1], b[1]) / SEL) - 1; m <= Math.floor(Math.max(a[1], b[1]) / SEL) + 1; m++) (G[i + "," + m] || (G[i + "," + m] = [])).push(k); };
    (d.jalan || []).forEach((j) => { if (j.t || j.k === "pejalan") return; for (let i = 0; i < j.p.length - 1; i++) tambah(j.p[i], j.p[i + 1], j.w || 6, "jalan", j.id); });
    const LW = { river: 18, canal: 10, stream: 4, drain: 2.5 };
    (d.air || []).forEach((w) => { if (w.poly || w.t) return; for (let i = 0; i < w.p.length - 1; i++) tambah(w.p[i], w.p[i + 1], LW[w.k] || 4, "sungai", w.id); });
    return { G: G, segs: segs, gb: gridPoligon(d.bangunan || []), gw: gridPoligon((d.air || []).filter((w) => w.poly)), bb: (d.meta && d.meta.bbox) || null };
  }
  function semakLot(S, x, z, r) {
    const sebab = [], lihat = new Set();
    for (let i = Math.floor((x - r) / SEL) - 1; i <= Math.floor((x + r) / SEL) + 1; i++) for (let m = Math.floor((z - r) / SEL) - 1; m <= Math.floor((z + r) / SEL) + 1; m++) (S.G[i + "," + m] || []).forEach((k) => lihat.add(k));
    for (const k of lihat) { const s = S.segs[k], dx = s.b[0] - s.a[0], dz = s.b[1] - s.a[1], L2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - s.a[0]) * dx + (z - s.a[1]) * dz) / L2)); if (Math.hypot(s.a[0] + dx * t - x, s.a[1] + dz * t - z) < s.w / 2 + r) { const sb = s.jenis === "jalan" ? "menghalang jalan" : "dalam sungai"; if (sebab.indexOf(sb) < 0) sebab.push(sb); } }
    if (kenaPoligon(S.gw, x, z, r)) sebab.push("dalam tasik/kolam");
    if (kenaPoligon(S.gb, x, z, r)) sebab.push("bertindih bangunan");
    return { ok: !sebab.length, sebab: sebab };
  }
  function ll(meta, x, z) { const lat0 = meta.pusat[0], lon0 = meta.pusat[1], ky = 110574, kx = 111320 * Math.cos(lat0 * Math.PI / 180); return [lat0 - z / ky, lon0 + x / kx]; }
  const LPT = { SEL: SEL, dekProfil: dekProfil, graf: graf, terdekat: terdekat, astar: astar, panjang: panjang, dalam: dalam, gridPoligon: gridPoligon, kenaPoligon: kenaPoligon, indeksDek: indeksDek, tinggiPermukaan: tinggiPermukaan, semakTanah: semakTanah, ll: ll, dem: dem, tinggiTanah: tinggiTanah, petakTanah: petakTanah, indeksPetak: indeksPetak, ysNod: ysNod, padat: padat, sediaLot: sediaLot, semakLot: semakLot };
  if (typeof module !== "undefined" && module.exports) module.exports = LPT; else root.LPT = LPT;
})(typeof window !== "undefined" ? window : globalThis);
