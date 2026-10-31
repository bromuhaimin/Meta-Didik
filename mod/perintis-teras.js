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
  function graf(d, mode) {
    const kaki = mode !== "kenderaan", N = {}, A = {};
    const add = (a, b, w) => { (A[a] || (A[a] = [])).push([b, w]); };
    (d.jalan || []).forEach((j) => {
      if (kaki && (j.hw === "motorway" || j.hw === "motorway_link")) return;           /* pejalan kaki tidak dibenarkan di lebuh raya */
      if (!kaki && !j.pandu) return;                                                     /* kenderaan: jalan boleh dipandu sahaja */
      const nd = j.nd || [], ys = dekProfil(j);
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
  function indeksDek(d) {
    const G = {};
    (d.jalan || []).forEach((j) => { if (!j.b) return; const ys = dekProfil(j); j._ys = ys; for (let i = 0; i < j.p.length - 1; i++) { const a = j.p[i], b = j.p[i + 1]; for (let ix = Math.floor(Math.min(a[0], b[0]) / SEL); ix <= Math.floor(Math.max(a[0], b[0]) / SEL); ix++) for (let iz = Math.floor(Math.min(a[1], b[1]) / SEL); iz <= Math.floor(Math.max(a[1], b[1]) / SEL); iz++) (G[ix + "," + iz] || (G[ix + "," + iz] = [])).push([j, i]); } });
    return G;
  }
  function tinggiPermukaan(ID, x, z, yNow) {
    let best = 0, bd = Math.abs((yNow || 0) - 0);
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
    return objek.filter((o) => !o.terowong && (o.minY > o.tanah + t || o.minY < o.tanah - t)).map((o) => ({ kod: "V8", id: o.id, jenis: o.jenis, minY: o.minY, tanah: o.tanah }));
  }
  function ll(meta, x, z) { const lat0 = meta.pusat[0], lon0 = meta.pusat[1], ky = 110574, kx = 111320 * Math.cos(lat0 * Math.PI / 180); return [lat0 - z / ky, lon0 + x / kx]; }
  const LPT = { SEL: SEL, dekProfil: dekProfil, graf: graf, terdekat: terdekat, astar: astar, panjang: panjang, dalam: dalam, gridPoligon: gridPoligon, kenaPoligon: kenaPoligon, indeksDek: indeksDek, tinggiPermukaan: tinggiPermukaan, semakTanah: semakTanah, ll: ll };
  if (typeof module !== "undefined" && module.exports) module.exports = LPT; else root.LPT = LPT;
})(typeof window !== "undefined" ? window : globalThis);
