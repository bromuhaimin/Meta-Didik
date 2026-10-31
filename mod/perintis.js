/* =====================================================================
   META DIDIK: KAWASAN PERINTIS DATA SEBENAR (Fasa 1). Dimuat apabila perlu: modLoad("perintis-teras") + modLoad("perintis").
   Data: data/perintis/<kawasan>.json (tools/geo/perintis.py, © OpenStreetMap contributors, ODbL).
   Adegan berasingan daripada peta Malaysia utama (unit = meter sebenar), supaya kawasan bandar tidak dimuat seluruh negara.
   Bergantung pada global app.js: THREE, el, toast, AV3, av3Load, TOUCH, APP_VER.
   ===================================================================== */
(function () {
  "use strict";
  const T = THREE, LPT = window.LPT, LP = window.LPX = { on: false };
  const GQ = ["Rendah", "Sederhana", "Tinggi"], TILE = 500;
  const KELAS = { lebuhraya: ["#3d4044", 0.10], utama: ["#45484c", 0.09], susur: ["#45484c", 0.085], sekunder: ["#4c4f53", 0.08], tertiari: ["#53565a", 0.07], kecil: ["#5a5d61", 0.06], perumahan: ["#5e6165", 0.05], servis: ["#66696d", 0.04], pejalan: ["#b9b2a3", 0.03] };
  const WARNA_BG = { school: "#e8a35a", university: "#d98c4a", college: "#d98c4a", kindergarten: "#f0c070", mosque: "#f2efe6", hospital: "#f4f6f8", commercial: "#8fa3b8", retail: "#c9a77a", apartments: "#d6cdbd", residential: "#e2d6c2", house: "#e2d6c2", terrace: "#dccbb0", industrial: "#a3a8ad", office: "#8fa3b8", yes: "#d8d0c2" };
  const gqAwal = () => { let q = null; try { q = localStorage.getItem("gt-lp-gq"); } catch (e) { /* abaikan */ } if (q != null) return +q; const lemah = (navigator.deviceMemory && navigator.deviceMemory <= 3) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4); return TOUCH ? (lemah ? 0 : 1) : 2; };

  /* ---------- tekstur dilukis dengan kod ---------- */
  function tex(w, h, f, rep) { const c = document.createElement("canvas"); c.width = w; c.height = h; f(c.getContext("2d"), w, h); const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; if (rep) t.repeat.set(rep[0], rep[1]); t.anisotropy = 4; return t; }
  const texTingkap = (malam) => tex(64, 64, (x, w, h) => { x.fillStyle = malam ? "#141820" : "#ffffff"; x.fillRect(0, 0, w, h); for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { x.fillStyle = malam ? (Math.random() < 0.55 ? "#ffd98a" : "#202634") : "#5a6b80"; x.fillRect(6 + i * 32, 8 + j * 32, 20, 18); } });
  const texAspal = () => tex(128, 128, (x, w, h) => { x.fillStyle = "#ffffff"; x.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { const g = 200 + Math.random() * 55 | 0; x.fillStyle = "rgb(" + g + "," + g + "," + g + ")"; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); } });
  const texRumput = () => tex(128, 128, (x, w, h) => { x.fillStyle = "#6f9e4f"; x.fillRect(0, 0, w, h); for (let i = 0; i < 1400; i++) { x.fillStyle = ["#679649", "#78a85a", "#5f8c43"][i % 3]; x.fillRect(Math.random() * w, Math.random() * h, 2, 3); } });

  /* ---------- geometri ---------- */
  function riben(pts, ys, w, y0) { /* jalur jalan mengikut garis tengah, dengan sambungan sudut dipurata */
    const P = [], UV = [], I = []; let s = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; let dx = b[0] - a[0], dz = b[1] - a[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
      const nx = -dz * w / 2, nz = dx * w / 2, y = (ys ? ys[i] : 0) + y0; if (i) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      P.push(pts[i][0] + nx, y, pts[i][1] + nz, pts[i][0] - nx, y, pts[i][1] - nz); UV.push(0, s / 8, 1, s / 8);
      if (i) { const k = i * 2; I.push(k - 2, k, k - 1, k - 1, k, k + 1); } /* normal ke atas */
    }
    return { P: P, UV: UV, I: I };
  }
  function gabung(parts) { const g = new T.BufferGeometry(), P = [], UV = [], I = [], C = []; let o = 0; parts.forEach((p) => { P.push(...p.P); UV.push(...(p.UV || [])); if (p.C) C.push(...p.C); p.I.forEach((i) => I.push(i + o)); o += p.P.length / 3; }); g.setAttribute("position", new T.Float32BufferAttribute(P, 3)); if (UV.length) g.setAttribute("uv", new T.Float32BufferAttribute(UV, 2)); if (C.length) g.setAttribute("color", new T.Float32BufferAttribute(C, 3)); g.setIndex(I); g.computeVertexNormals(); return g; }
  function ekstrusi(b, warna) { /* dinding (UV tingkap) + bumbung; warna bucu dengan AO murah: dinding lebih gelap di kaki */
    let ring = b.p.slice(); let area = 0; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) area += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]); if (area > 0) ring.reverse(); /* dinding menghadap ke luar */
    const h = b.h, y0 = b.mh || 0, c = new T.Color(warna), P = [], UV = [], I = [], C = []; let s = 0;
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i], q = ring[(i + 1) % ring.length], L = Math.hypot(q[0] - a[0], q[1] - a[1]), k = P.length / 3;
      P.push(a[0], y0, a[1], q[0], y0, q[1], q[0], h, q[1], a[0], h, a[1]); UV.push(s / 4, 0, (s + L) / 4, 0, (s + L) / 4, (h - y0) / 3.4, s / 4, (h - y0) / 3.4); s += L;
      for (const ao of [0.62, 0.62, 1, 1]) C.push(c.r * ao, c.g * ao, c.b * ao);
      I.push(k, k + 1, k + 2, k, k + 2, k + 3);
    }
    const tri = T.ShapeUtils.triangulateShape(ring.map((p) => new T.Vector2(p[0], p[1])), []), k0 = P.length / 3;
    ring.forEach((p) => { P.push(p[0], h, p[1]); UV.push(0.02, 0.02); C.push(c.r * 0.82, c.g * 0.82, c.b * 0.82); });
    tri.forEach((t) => I.push(k0 + t[0], k0 + t[2], k0 + t[1])); /* bumbung menghadap ke atas */
    return { P: P, UV: UV, I: I, C: C };
  }
  function poligonRata(ring, y) { ring = ring.slice(); let ar = 0; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) ar += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]); if (ar > 0) ring.reverse(); /* orientasi OSM berbeza-beza: dinormalkan supaya menghadap ke atas */ const tri = T.ShapeUtils.triangulateShape(ring.map((p) => new T.Vector2(p[0], p[1])), []), P = [], I = []; ring.forEach((p) => P.push(p[0], y, p[1])); tri.forEach((t) => I.push(t[0], t[2], t[1])); return { P: P, I: I }; }
  function label(teks, warna) { const c = document.createElement("canvas"), x = c.getContext("2d"); x.font = "800 30px Nunito, sans-serif"; const w = Math.min(560, x.measureText(teks).width + 30); c.width = w; c.height = 46; x.font = "800 30px Nunito, sans-serif"; x.fillStyle = warna || "rgba(10,30,50,.82)"; x.fillRect(0, 0, w, 46); x.fillStyle = "#fff"; x.textBaseline = "middle"; x.fillText(teks, 15, 24); const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), depthWrite: false })); sp.scale.set(w / 18, 46 / 18, 1); return sp; }

  /* ---------- muat dan bina ---------- */
  async function lpBuka(kawasan) {
    if (LP.on) return; kawasan = kawasan || "setapak";
    const ov = document.getElementById("lpOv") || document.body.appendChild(el("div", { id: "lpOv", role: "application", "aria-label": "Kawasan perintis data sebenar" }));
    ov.hidden = false; ov.textContent = ""; LP.ov = ov;
    const kad = el("div", { class: "lp-kad" }, el("b", null, "🏙 Kawasan perintis: " + (kawasan === "setapak" ? "Setapak, Kuala Lumpur" : kawasan)), el("p", { id: "lpMsg" }, "Memuat data geospatial..."), el("div", { class: "lp-bar" }, el("i", { id: "lpBar" })));
    ov.appendChild(kad);
    const msg = (t, k) => { const m = document.getElementById("lpMsg"); if (m) m.textContent = t; const b = document.getElementById("lpBar"); if (b && k != null) b.style.width = Math.round(k * 100) + "%"; };
    let d = null;
    try { const r = await fetch(window.LP_DATA_URL || ("data/perintis/" + kawasan + ".json?v=" + (typeof APP_VER !== "undefined" ? APP_VER : ""))); if (!r.ok) throw new Error(r.status); d = await r.json(); }
    catch (e) {
      kad.textContent = ""; kad.append(el("b", null, "Data kawasan perintis belum tersedia"), el("p", null, "Data jalan, sungai dan bangunan sebenar untuk kawasan ini belum dijana. Pentadbir sistem perlu menjalankan: python3 tools/geo/perintis.py semua " + kawasan + " (memerlukan akses ke Overpass API OpenStreetMap)."), el("p", { style: "opacity:.8;font-size:13px" }, "Meta Didik tidak mereka-reka geografi: kawasan ini hanya dibuka apabila data sebenar tersedia."));
      const x = el("button", { type: "button", class: "lp-btn" }, "Tutup"); x.addEventListener("click", lpTutup); kad.appendChild(x); return;
    }
    LP.d = d; LP.gq = gqAwal(); LP.on = true;
    await new Promise((ok) => (window.AV3 ? ok() : av3Load(ok)));
    msg("Membina dunia 3D...", 0.1); await bina(msg); msg("Siap", 1); kad.remove(); hud(); kawal(); LP.t0 = performance.now(); LP.raf = requestAnimationFrame(gelung);
  }
  async function bina(msg) {
    const d = LP.d, q = LP.gq, ren = new T.WebGLRenderer({ antialias: q === 2, powerPreference: "high-performance" });
    ren.setPixelRatio(Math.min(window.devicePixelRatio || 1, [1, 1.35, 1.75][q])); ren.setSize(innerWidth, innerHeight); ren.shadowMap.enabled = q > 0; ren.shadowMap.type = q === 2 ? T.PCFSoftShadowMap : T.PCFShadowMap;
    LP.ov.appendChild(ren.domElement); ren.domElement.className = "lp-cv"; LP.ren = ren;
    const sc = LP.sc = new T.Scene(), jauh = [700, 1100, 1600][q];
    sc.background = new T.Color(0xbfdcf2); sc.fog = new T.Fog(0xbfdcf2, jauh * 0.35, jauh);
    const cam = LP.cam = new T.PerspectiveCamera(60, innerWidth / innerHeight, 0.3, jauh * 1.1);
    LP.hemi = new T.HemisphereLight(0xdfefff, 0x5d6b4a, 0.75); sc.add(LP.hemi);
    const sun = LP.sun = new T.DirectionalLight(0xfff2dc, 0.95); sun.position.set(120, 220, 80); sc.add(sun); sc.add(sun.target);
    if (q > 0) { sun.castShadow = true; const s = sun.shadow; s.mapSize.set(q === 2 ? 2048 : 1024, q === 2 ? 2048 : 1024); s.camera.left = s.camera.bottom = -90; s.camera.right = s.camera.top = 90; s.camera.far = 600; s.bias = -0.0006; }
    /* sempadan kawasan */
    let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; d.jalan.forEach((j) => j.p.forEach(([x, z]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }));
    LP.bb = [x0, z0, x1, z1];
    const tanah = new T.Mesh(new T.PlaneGeometry(x1 - x0 + 600, z1 - z0 + 600), new T.MeshLambertMaterial({ map: texRumput() })); tanah.material.map.repeat.set((x1 - x0) / 25, (z1 - z0) / 25); tanah.rotation.x = -Math.PI / 2; tanah.position.set((x0 + x1) / 2, -0.02, (z0 + z1) / 2); tanah.receiveShadow = true; sc.add(tanah);
    await new Promise(requestAnimationFrame); msg("Sungai dan tasik...", 0.2);
    const air = new T.MeshStandardMaterial({ color: 0x3f86b8, roughness: 0.15, metalness: 0.2 }), airP = [];
    const LW = { river: 18, canal: 10, stream: 4, drain: 2.5 };
    d.air.forEach((w) => { try { if (w.poly) airP.push(poligonRata(w.p, -0.05)); else if (!w.t) airP.push(riben(w.p, null, LW[w.k] || 4, -0.04)); } catch (e) { /* poligon rosak: dilangkau */ } });
    if (airP.length) sc.add(new T.Mesh(gabung(airP), air));
    LP.gw = LPT.gridPoligon(d.air.filter((w) => w.poly)); LP.sungai = d.air.filter((w) => !w.poly && !w.t);
    msg("Taman...", 0.28); await new Promise(requestAnimationFrame);
    const tm = []; d.taman.forEach((t) => { try { tm.push(poligonRata(t.p, 0.02)); } catch (e) { /* abaikan */ } });
    if (tm.length) { const m = new T.Mesh(gabung(tm), new T.MeshLambertMaterial({ color: 0x5f9c45 })); m.receiveShadow = true; sc.add(m); }
    /* pokok dalam taman (titik deterministik dalam poligon) */
    const pk = []; let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    d.taman.forEach((t) => { const bb = t.p.reduce((a, p) => [Math.min(a[0], p[0]), Math.min(a[1], p[1]), Math.max(a[2], p[0]), Math.max(a[3], p[1])], [1e9, 1e9, -1e9, -1e9]), n = Math.min(40, Math.floor((bb[2] - bb[0]) * (bb[3] - bb[1]) / 900)); for (let i = 0; i < n * 3 && pk.length < [400, 1200, 2500][q]; i++) { const x = bb[0] + rnd() * (bb[2] - bb[0]), z = bb[1] + rnd() * (bb[3] - bb[1]); if (LPT.dalam(x, z, t.p)) pk.push([x, z, 0.8 + rnd() * 0.6]); } });
    if (pk.length) { const o = new T.Object3D(), bt = new T.InstancedMesh(new T.CylinderGeometry(0.18, 0.28, 3, 6), new T.MeshLambertMaterial({ color: 0x6e4a2c }), pk.length), dn = new T.InstancedMesh(new T.IcosahedronGeometry(2.2, 0), new T.MeshLambertMaterial({ color: 0x3f8a3a }), pk.length); pk.forEach(([x, z, k], i) => { o.position.set(x, 1.5 * k, z); o.scale.setScalar(k); o.updateMatrix(); bt.setMatrixAt(i, o.matrix); o.position.y = 4 * k; o.updateMatrix(); dn.setMatrixAt(i, o.matrix); }); dn.castShadow = q > 0; sc.add(bt, dn); LP.objek = (LP.objek || []).concat(pk.map((p, i) => ({ id: "pokok" + i, jenis: "pokok", minY: 1.5 * p[2] - 1.5 * p[2], tanah: 0 }))); }
    msg("Jalan raya, jejambat dan garisan lorong...", 0.4); await new Promise(requestAnimationFrame);
    const aspal = texAspal(), byK = {}, garis = [], tepi = [], tiang = [], pagar = [];
    d.jalan.forEach((j) => {
      if (j.t) return; /* terowong: dalam tanah, dipaparkan pada peta sahaja */
      const ys = LPT.dekProfil(j), k = KELAS[j.k] || KELAS.kecil, w = j.w || 6;
      (byK[j.k] || (byK[j.k] = [])).push(riben(j.p, ys, w, k[1]));
      if (j.k !== "pejalan" && w >= 6) {
        const mid = j.ow ? null : 1; /* garis tengah putus-putus untuk jalan dua hala */
        for (let i = 0; i < j.p.length - 1; i++) {
          const a = j.p[i], b = j.p[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / (L || 1), uz = (b[1] - a[1]) / (L || 1);
          for (let s = 2; s < L - 3; s += 9) { const p0 = [a[0] + ux * s, a[1] + uz * s], p1 = [a[0] + ux * (s + 4), a[1] + uz * (s + 4)], y0 = ys[i] + (ys[i + 1] - ys[i]) * (s / L), y1 = ys[i] + (ys[i + 1] - ys[i]) * ((s + 4) / L); if (mid) garis.push(riben([p0, p1], [y0, y1], 0.16, k[1] + 0.02)); }
          if (j.k === "utama" || j.k === "lebuhraya" || j.k === "sekunder") { const nx = -uz * (w / 2 - 0.5), nz = ux * (w / 2 - 0.5); for (const sg of [1, -1]) tepi.push(riben([[a[0] + nx * sg, a[1] + nz * sg], [b[0] + nx * sg, b[1] + nz * sg]], [ys[i], ys[i + 1]], 0.14, k[1] + 0.02)); }
          if (j.b) { /* tiang jejambat dan pagar */ for (let s = 0; s < L; s += 22) { const y = ys[i] + (ys[i + 1] - ys[i]) * (s / L); if (y > 2) tiang.push([a[0] + ux * s, a[1] + uz * s, y]); } const nx = -uz * w / 2, nz = ux * w / 2; for (const sg of [1, -1]) pagar.push([a[0] + nx * sg, a[1] + nz * sg, b[0] + nx * sg, b[1] + nz * sg, ys[i], ys[i + 1]]); }
        }
      }
    });
    Object.keys(byK).forEach((k) => { const m = new T.Mesh(gabung(byK[k]), new T.MeshStandardMaterial({ color: KELAS[k][0], map: aspal, roughness: 0.92, polygonOffset: true, polygonOffsetFactor: -1 - KELAS[k][1] * 10 })); m.receiveShadow = true; sc.add(m); });
    if (garis.length) sc.add(new T.Mesh(gabung(garis), new T.MeshBasicMaterial({ color: 0xf2f2ee, polygonOffset: true, polygonOffsetFactor: -4 })));
    if (tepi.length) sc.add(new T.Mesh(gabung(tepi), new T.MeshBasicMaterial({ color: 0xffd23a, polygonOffset: true, polygonOffsetFactor: -4 })));
    if (tiang.length) { const o = new T.Object3D(), im = new T.InstancedMesh(new T.BoxGeometry(1.2, 1, 1.2), new T.MeshStandardMaterial({ color: 0xa9adb1, roughness: 0.8 }), tiang.length); tiang.forEach(([x, z, y], i) => { o.position.set(x, y / 2, z); o.scale.set(1, y, 1); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }); im.castShadow = q > 0; sc.add(im); }
    if (pagar.length) { const pr = pagar.map(([ax, az, bx, bz, ya, yb]) => riben([[ax, az], [bx, bz]], [ya + 0.55, yb + 0.55], 0.25, 0)); sc.add(new T.Mesh(gabung(pr), new T.MeshStandardMaterial({ color: 0xd8dade, side: T.DoubleSide }))); }
    /* lampu isyarat dan tiang lampu jalan */
    const isy = d.poi.filter((p) => p.k === "lampu_isyarat");
    if (isy.length) { const o = new T.Object3D(), im = new T.InstancedMesh(new T.CylinderGeometry(0.1, 0.12, 4.5, 6), new T.MeshStandardMaterial({ color: 0x333333 }), isy.length), kp = new T.InstancedMesh(new T.BoxGeometry(0.45, 1.2, 0.4), new T.MeshStandardMaterial({ color: 0x1a1a1a, emissive: 0x330000 }), isy.length); isy.forEach((p, i) => { o.position.set(p.x + 3, 2.25, p.z + 3); o.updateMatrix(); im.setMatrixAt(i, o.matrix); o.position.y = 4.4; o.updateMatrix(); kp.setMatrixAt(i, o.matrix); }); sc.add(im, kp); }
    msg("Bangunan (ekstrusi footprint)...", 0.55); await new Promise(requestAnimationFrame);
    const tiles = {}; d.bangunan.forEach((b) => { const cx = b.p.reduce((a, p) => a + p[0], 0) / b.p.length, cz = b.p.reduce((a, p) => a + p[1], 0) / b.p.length, key = Math.floor(cx / TILE) + "," + Math.floor(cz / TILE); (tiles[key] || (tiles[key] = [])).push(b); });
    LP.tmTingkap = texTingkap(false); LP.tmMalam = texTingkap(true);
    const matB = LP.matB = new T.MeshStandardMaterial({ vertexColors: true, map: LP.tmTingkap, roughness: 0.75, metalness: 0.05, emissive: 0x000000 });
    LP.tiles = []; LP.pilar = []; let n = 0; const keys = Object.keys(tiles);
    for (const key of keys) {
      const parts = []; tiles[key].forEach((b) => { try { parts.push(ekstrusi(b, WARNA_BG[b.k] || WARNA_BG.yes)); } catch (e) { /* poligon rosak dilangkau */ } });
      if (parts.length) { const m = new T.Mesh(gabung(parts), matB); m.castShadow = q > 0; m.receiveShadow = true; sc.add(m); const [i, k] = key.split(",").map(Number); LP.tiles.push({ m: m, cx: (i + 0.5) * TILE, cz: (k + 0.5) * TILE }); LP.pilar.push(m); }
      if (++n % 6 === 0) { msg("Bangunan " + n + "/" + keys.length + " tile...", 0.55 + 0.35 * n / keys.length); await new Promise(requestAnimationFrame); }
    }
    LP.gp = LPT.gridPoligon(d.bangunan.filter((b) => (b.mh || 0) < 2)); LP.ID = LPT.indeksDek(d);
    LP.objek = (LP.objek || []).concat(d.bangunan.map((b) => ({ id: b.id, jenis: "bangunan", minY: b.mh || 0, tanah: b.mh || 0 }))).concat(tiang.map((t, i) => ({ id: "tiang" + i, jenis: "tiang", minY: 0, tanah: 0 })));
    LP.v8 = LPT.semakTanah(LP.objek);
    /* label POI pendidikan dan awam */
    LP.poi = d.poi.filter((p) => p.n && /school|university|college|kindergarten|place_of_worship|hospital|police|library|stesen/.test(p.k));
    LP.poi.forEach((p) => { const ic = { school: "🏫", university: "🎓", college: "🎓", kindergarten: "🧸", place_of_worship: p.rel === "muslim" ? "🕌" : "⛪", hospital: "🏥", police: "🚓", library: "📚", stesen: "🚉" }[p.k] || "📍"; const s = label(ic + " " + p.n, /school|university|college|kindergarten/.test(p.k) ? "rgba(140,60,0,.85)" : undefined); s.position.set(p.x, 14, p.z); sc.add(s); p.sp = s; });
    /* graf navigasi */
    LP.G = { kaki: LPT.graf(d, "kaki"), kenderaan: LPT.graf(d, "kenderaan") };
    /* avatar: bermula di nod jalan terdekat ke pusat */
    const s0 = LP.G.kaki.N[LPT.terdekat(LP.G.kaki, 0, 0, 3000)] || { x: 0, z: 0, y: 0 };
    LP.p = { x: s0.x, z: s0.z, y: s0.y || 0, vy: 0, yaw: 0, jalan: false };
    const code = (AV3.code && AV3.code()) || "L|1|ou_sc|oc_gn|hd_no|hc_w"; LP.av = AV3.build(code); LP.av.g.scale.setScalar(0.19); LP.av.g.traverse((o) => { if (o.isMesh) o.castShadow = q > 0; }); sc.add(LP.av.g);
    LP.c = { yaw: 0, pitch: 0.32, dist: 9, fp: false, x: s0.x, y: 8, z: s0.z + 9 }; LP.keys = {}; LP.js = { id: -1, x: 0, y: 0 }; LP.fps = 0; LP.fq = [];
    LP.mmBase = petaAsas(1100);
  }

  /* ---------- peta asas (2D) untuk peta mini dan peta penuh ---------- */
  function petaAsas(px) {
    const [x0, z0, x1, z1] = LP.bb, s = px / Math.max(x1 - x0, z1 - z0), c = document.createElement("canvas"); c.width = Math.ceil((x1 - x0) * s); c.height = Math.ceil((z1 - z0) * s);
    const g = c.getContext("2d"), X = (x) => (x - x0) * s, Z = (z) => (z - z0) * s; g.fillStyle = "#dfe8d6"; g.fillRect(0, 0, c.width, c.height);
    const poly = (p, f) => { g.beginPath(); p.forEach(([x, z], i) => (i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z)))); g.closePath(); g.fillStyle = f; g.fill(); };
    LP.d.taman.forEach((t) => poly(t.p, "#a8d08d")); LP.d.air.forEach((w) => { if (w.poly) poly(w.p, "#7fb6e0"); else { g.strokeStyle = "#7fb6e0"; g.lineWidth = Math.max(1, ({ river: 18, canal: 10, stream: 4 }[w.k] || 2) * s); g.beginPath(); w.p.forEach(([x, z], i) => (i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z)))); g.stroke(); } });
    LP.d.bangunan.forEach((b) => poly(b.p, "#c9c1b3"));
    ["pejalan", "servis", "perumahan", "kecil", "tertiari", "sekunder", "susur", "utama", "lebuhraya"].forEach((k) => LP.d.jalan.filter((j) => j.k === k).forEach((j) => { g.strokeStyle = j.t ? "rgba(90,90,90,.5)" : k === "pejalan" ? "#efe7d6" : k === "lebuhraya" || k === "utama" ? "#ffc65a" : "#ffffff"; g.setLineDash(j.t ? [4, 3] : []); g.lineWidth = Math.max(1, (j.w || 6) * s); g.beginPath(); j.p.forEach(([x, z], i) => (i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z)))); g.stroke(); }));
    g.setLineDash([]); return { c: c, s: s, X: X, Z: Z };
  }

  /* ---------- HUD dan kawalan ---------- */
  function hud() {
    const ov = LP.ov, b = (t, f, cls) => { const x = el("button", { type: "button", class: "lp-btn" + (cls ? " " + cls : "") }, t); x.addEventListener("click", f); return x; };
    LP.ui = {};
    LP.ui.info = el("div", { class: "lp-info" }); LP.ui.fps = el("span", { class: "lp-fps" });
    LP.ui.mm = el("canvas", { class: "lp-mm", width: 200, height: 200, "aria-label": "Peta mini, ketik untuk peta penuh" }); LP.ui.mm.addEventListener("click", petaPenuh);
    const atas = el("div", { class: "lp-atas" }, b("🗺 Peta", petaPenuh), LP.ui.gqB = b("Grafik: " + GQ[LP.gq], () => { LP.gq = (LP.gq + 1) % 3; try { localStorage.setItem("gt-lp-gq", String(LP.gq)); } catch (e) { /* abaikan */ } toast("Grafik " + GQ[LP.gq] + " berkuat kuasa apabila kawasan dibuka semula.", "good"); LP.ui.gqB.textContent = "Grafik: " + GQ[LP.gq]; }),
      LP.ui.camB = b("👁 Orang pertama", () => { LP.c.fp = !LP.c.fp; LP.ui.camB.textContent = LP.c.fp ? "👁 Orang ketiga" : "👁 Orang pertama"; }), LP.ui.waktuB = b("☀️ Siang", waktu), b("✕ Keluar", lpTutup));
    const bawah = el("div", { class: "lp-bawah" }, LP.ui.lompat = b("⤒ Lompat", () => lompat()), LP.ui.lari = b("🏃 Lari", () => { LP.lari = !LP.lari; LP.ui.lari.classList.toggle("on", !!LP.lari); }));
    const M = LP.d.meta, atrib = el("div", { class: "lp-atrib" }, "Data: " + (M.atribusi || "-") + (M.lesen && M.lesen !== "-" ? " (" + M.lesen + ")" : "") + " · " + (M.tarikh_osm || "") + " · Tinggi bangunan tanpa data ialah anggaran");
    LP.ui.js = el("div", { class: "lp-js" }, el("i")); LP.ui.nav = el("div", { class: "lp-nav", hidden: "" });
    ov.append(LP.ui.info, LP.ui.mm, atas, bawah, atrib, LP.ui.js, LP.ui.nav, LP.ui.fps);
  }
  function waktu() { const st = LP.st = ((LP.st | 0) + 1) % 3, sky = [0xbfdcf2, 0xf2b58a, 0x0e1838][st]; LP.sc.background.setHex(sky); LP.sc.fog.color.setHex(sky); LP.sun.intensity = [0.95, 0.55, 0.08][st]; LP.hemi.intensity = [0.75, 0.55, 0.28][st]; LP.matB.emissiveMap = st === 2 ? LP.tmMalam : null; LP.matB.emissive.setHex(st === 2 ? 0xffffff : 0x000000); LP.matB.emissiveIntensity = 0.55; LP.matB.needsUpdate = true; LP.ui.waktuB.textContent = ["☀️ Siang", "🌇 Petang", "🌙 Malam"][st]; }
  function lompat() { if (LP.p.vy === 0 && Math.abs(LP.p.y - LP.p.yg) < 0.05) LP.p.vy = 5.2; }
  function kawal() {
    const cv = LP.ren.domElement;
    LP.kd = (e) => { const t = e.target; if (t && (t.nodeName === "INPUT" || t.nodeName === "TEXTAREA")) return; const k = String(e.key || "").toLowerCase(), dn = e.type === "keydown"; LP.keys[k] = dn; if (dn) { if (k === " ") { e.preventDefault(); lompat(); } if (k === "m") petaPenuh(); if (k === "f") LP.ui.camB.click(); if (k === "escape") { if (LP.ui.big) petaPenuh(); else lpTutup(); } if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].indexOf(k) >= 0) LP.auto = null; } };
    window.addEventListener("keydown", LP.kd); window.addEventListener("keyup", LP.kd);
    const ptr = {}; let pinch = 0;
    cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); const kiri = e.pointerType === "touch" && e.clientX < innerWidth * 0.42; ptr[e.pointerId] = { x: e.clientX, y: e.clientY, js: kiri }; if (kiri) { LP.js = { id: e.pointerId, cx: e.clientX, cy: e.clientY, x: 0, y: 0 }; LP.auto = null; const j = LP.ui.js; j.style.left = e.clientX - 55 + "px"; j.style.top = e.clientY - 55 + "px"; j.style.display = "block"; } });
    cv.addEventListener("pointermove", (e) => { const p = ptr[e.pointerId]; if (!p) return; const ids = Object.keys(ptr); if (ids.length === 2 && !p.js && !ptr[ids[0]].js && !ptr[ids[1]].js) { const a = ptr[ids[0]], b2 = ptr[ids[1]], d0 = Math.hypot(a.x - b2.x, a.y - b2.y); p.x = e.clientX; p.y = e.clientY; const d1 = Math.hypot(ptr[ids[0]].x - ptr[ids[1]].x, ptr[ids[0]].y - ptr[ids[1]].y); if (pinch) LP.c.dist = Math.max(3, Math.min(40, LP.c.dist * pinch / (d1 || 1))); pinch = d1 || d0; return; }
      if (p.js) { let dx = (e.clientX - LP.js.cx) / 45, dy = (LP.js.cy - e.clientY) / 45; const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; } LP.js.x = dx; LP.js.y = dy; LP.ui.js.firstChild.style.transform = "translate(" + dx * 30 + "px," + -dy * 30 + "px)"; }
      else { LP.c.yaw -= (e.clientX - p.x) * 0.006; LP.c.pitch = Math.max(-0.2, Math.min(1.25, LP.c.pitch + (e.clientY - p.y) * 0.004)); }
      p.x = e.clientX; p.y = e.clientY; });
    const up = (e) => { if (ptr[e.pointerId] && ptr[e.pointerId].js) { LP.js = { id: -1, x: 0, y: 0 }; LP.ui.js.style.display = "none"; } delete ptr[e.pointerId]; pinch = 0; };
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
    cv.addEventListener("wheel", (e) => { e.preventDefault(); LP.c.dist = Math.max(3, Math.min(40, LP.c.dist * (e.deltaY > 0 ? 1.1 : 0.9))); }, { passive: false });
    cv.addEventListener("contextmenu", (e) => e.preventDefault());
    LP.rs = () => { LP.ren.setSize(innerWidth, innerHeight); LP.cam.aspect = innerWidth / innerHeight; LP.cam.updateProjectionMatrix(); }; window.addEventListener("resize", LP.rs);
  }

  /* ---------- peta penuh: ketik destinasi -> laluan A* ikut graf jalan ---------- */
  function petaPenuh() {
    if (LP.ui.big) { LP.ui.big.remove(); LP.ui.big = null; return; }
    const B = LP.mmBase, w = el("div", { class: "lp-big" }), cv = el("canvas", { width: B.c.width, height: B.c.height }), mod = { m: "kaki" };
    const tajuk = el("div", { class: "lp-big-h" }, el("b", null, "Peta " + LP.d.meta.nama + " · ketik destinasi"), (() => { const s = el("select", { "aria-label": "Mod laluan" }); [["kaki", "🚶 Jalan kaki"], ["kenderaan", "🚗 Kenderaan (patuh jalan sehala)"]].forEach(([v, t]) => s.appendChild(el("option", { value: v }, t))); s.addEventListener("change", () => { mod.m = s.value; }); return s; })(), (() => { const x = el("button", { type: "button", class: "lp-btn" }, "✕"); x.addEventListener("click", petaPenuh); return x; })());
    w.append(tajuk, cv); LP.ov.appendChild(w); LP.ui.big = w;
    const lukis = () => { const g = cv.getContext("2d"); g.drawImage(B.c, 0, 0); if (LP.path) { g.strokeStyle = "#1f6feb"; g.lineWidth = 4; g.beginPath(); LP.path.forEach((p, i) => (i ? g.lineTo(B.X(p.x), B.Z(p.z)) : g.moveTo(B.X(p.x), B.Z(p.z)))); g.stroke(); } g.fillStyle = "#e0245e"; g.beginPath(); g.arc(B.X(LP.p.x), B.Z(LP.p.z), 6, 0, 6.283); g.fill(); };
    lukis();
    cv.addEventListener("click", (e) => {
      const r = cv.getBoundingClientRect(), k = Math.min(r.width / cv.width, r.height / cv.height), ox = (r.width - cv.width * k) / 2, oy = (r.height - cv.height * k) / 2, X = (e.clientX - r.left - ox) / k, Z = (e.clientY - r.top - oy) / k, tx = X / B.s + LP.bb[0], tz = Z / B.s + LP.bb[1]; /* object-fit: contain */
      const g = LP.G[mod.m], s = LPT.terdekat(g, LP.p.x, LP.p.z, 300), t = LPT.terdekat(g, tx, tz, 300), path = LPT.astar(g, s, t);
      if (!path) { toast("Tiada laluan " + (mod.m === "kaki" ? "pejalan kaki" : "kenderaan") + " ke titik itu dalam rangkaian jalan.", "warn"); return; }
      LP.path = path.map((id) => g.N[id]); LP.pathM = mod.m; LP.auto = mod.m === "kaki" ? { i: 0 } : null; laluan3D(); lukis();
      LP.ui.nav.hidden = false; LP.ui.nav.textContent = (mod.m === "kaki" ? "🚶 " : "🚗 ") + "Laluan " + (LPT.panjang(g, path) / 1000).toFixed(2) + " km ikut jalan" + (mod.m === "kaki" ? " · avatar berjalan sendiri (sentuh kayu bedik untuk berhenti)" : " · paparan laluan sahaja");
      if (TOUCH) setTimeout(() => { if (LP.ui.big) petaPenuh(); }, 500);
    });
  }
  function laluan3D() { if (LP.garisLaluan) LP.sc.remove(LP.garisLaluan); const pts = LP.path.map((n) => [n.x, n.z]), ys = LP.path.map((n) => n.y || 0); if (pts.length < 2) return; LP.garisLaluan = new T.Mesh(gabung([riben(pts, ys, 1.2, 0.18)]), new T.MeshBasicMaterial({ color: 0x2f8fff, transparent: true, opacity: 0.85, polygonOffset: true, polygonOffsetFactor: -6 })); LP.sc.add(LP.garisLaluan); }

  /* ---------- gelung permainan ---------- */
  function halangan(x, z, y) {
    if (LPT.kenaPoligon(LP.gp, x, z, 0.35)) return true;                                   /* bangunan */
    if (y < 0.5 && LPT.kenaPoligon(LP.gw, x, z, 0)) return true;                            /* tasik (kecuali di atas jambatan) */
    if (y < 0.5) for (const w of LP.sungai) { if (w.k !== "river" && w.k !== "canal") continue; for (let i = 0; i < w.p.length - 1; i++) { const a = w.p[i], b = w.p[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / L2)); if (Math.hypot(a[0] + dx * t - x, a[1] + dz * t - z) < (w.k === "river" ? 9 : 5)) return true; } }
    return false;
  }
  function gelung(ts) {
    if (!LP.on) return; LP.raf = requestAnimationFrame(gelung);
    const dt = Math.min(0.1, (ts - (LP.last || ts)) / 1000); LP.last = ts; if (document.hidden) return;
    LP.fq.push(dt); if (LP.fq.length > 60) LP.fq.shift(); const avg = LP.fq.reduce((a, b) => a + b, 0) / LP.fq.length; LP.fps = avg ? 1 / avg : 0;
    const p = LP.p, c = LP.c, k = LP.keys;
    let ix = (k.d || k.arrowright ? 1 : 0) - (k.a || k.arrowleft ? 1 : 0) + LP.js.x, iz = (k.s || k.arrowdown ? 1 : 0) - (k.w || k.arrowup ? 1 : 0) - LP.js.y;
    if (LP.auto && LP.path) { const tgt = LP.path[Math.min(LP.auto.i, LP.path.length - 1)], dx = tgt.x - p.x, dz = tgt.z - p.z, dd = Math.hypot(dx, dz); if (dd < 1.5) { if (++LP.auto.i >= LP.path.length) { LP.auto = null; toast("Tiba di destinasi.", "good"); } } else { const sy = Math.sin(c.yaw), cy = Math.cos(c.yaw), lx = dx / dd, lz = dz / dd; ix = lx * cy - lz * sy; iz = lx * sy + lz * cy; } }
    const mag = Math.min(1, Math.hypot(ix, iz)), moving = mag > 0.08, sp = (k.shift || LP.lari ? 9 : 4.2) * mag;
    if (moving) {
      const sy = Math.sin(c.yaw), cy = Math.cos(c.yaw), wx = (ix * cy + iz * sy) / (Math.hypot(ix, iz) || 1), wz = (-ix * sy + iz * cy) / (Math.hypot(ix, iz) || 1);
      const nx = p.x + wx * sp * dt, nz = p.z + wz * sp * dt;
      if (!halangan(nx, nz, p.y)) { p.x = nx; p.z = nz; } else if (!halangan(nx, p.z, p.y)) p.x = nx; else if (!halangan(p.x, nz, p.y)) p.z = nz; /* gelongsor di dinding */
      p.yaw = Math.atan2(wx, wz);
    }
    p.yg = LPT.tinggiPermukaan(LP.ID, p.x, p.z, p.y); p.vy -= 14 * dt; p.y += p.vy * dt; if (p.y <= p.yg) { p.y = p.yg; p.vy = 0; } /* kaki di atas permukaan (tanah atau dek jejambat) */
    const av = LP.av; av.g.position.set(p.x, p.y, p.z); let dy = p.yaw - av.g.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); av.g.rotation.y += dy * Math.min(1, dt * 12);
    AV3.anim(av, moving, p.y > p.yg + 0.05, dt, sp / 4.2, LP.sc); av.g.visible = !c.fp;
    /* kamera orang ketiga (elak bangunan) atau orang pertama */
    const tx = p.x, ty = p.y + 1.55, tz = p.z;
    if (c.fp) { LP.cam.position.set(tx + Math.sin(p.yaw) * 0.25, ty + 0.1, tz + Math.cos(p.yaw) * 0.25); LP.cam.lookAt(tx - Math.sin(c.yaw) * 10, ty - (c.pitch - 0.3) * 6, tz - Math.cos(c.yaw) * 10); }
    else {
      const ux = Math.sin(c.yaw) * Math.cos(c.pitch), uy = Math.sin(c.pitch), uz = Math.cos(c.yaw) * Math.cos(c.pitch); let dist = c.dist;
      if (((LP.fr = (LP.fr | 0) + 1) % 3) === 0) { const rc = LP.rc || (LP.rc = new T.Raycaster()); rc.set(new T.Vector3(tx, ty, tz), new T.Vector3(ux, uy, uz)); rc.far = c.dist; const near = LP.tiles.filter((t) => Math.abs(t.cx - tx) < TILE && Math.abs(t.cz - tz) < TILE).map((t) => t.m); const hit = rc.intersectObjects(near, false)[0]; LP.cdist = hit ? Math.max(1.5, hit.distance - 0.6) : c.dist; }
      dist = Math.min(c.dist, LP.cdist || c.dist); const kf = 1 - Math.exp(-dt * 10);
      c.x += (tx + ux * dist - c.x) * kf; c.y += (Math.max(ty + uy * dist, p.yg + 0.5) - c.y) * kf; c.z += (tz + uz * dist - c.z) * kf; LP.cam.position.set(c.x, c.y, c.z); LP.cam.lookAt(tx, ty, tz);
    }
    LP.sun.position.set(p.x + 120, 220, p.z + 80); LP.sun.target.position.set(p.x, 0, p.z);
    /* LOD: sembunyikan tile bangunan jauh */
    if (((LP.lodT = (LP.lodT || 0) + dt) > 0.4)) { LP.lodT = 0; const D = [700, 1100, 1600][LP.gq]; LP.tiles.forEach((t) => { t.m.visible = Math.hypot(t.cx - p.x, t.cz - p.z) < D; }); }
    LP.ren.render(LP.sc, LP.cam);
    if (((LP.hudT = (LP.hudT || 0) + dt) > 0.15)) { LP.hudT = 0; const ll = LPT.ll(LP.d.meta, p.x, p.z); LP.ui.info.textContent = LP.d.meta.nama + " · " + ll[0].toFixed(5) + ", " + ll[1].toFixed(5) + (p.y > 0.6 ? " · di atas jejambat/jambatan" : ""); LP.ui.fps.textContent = Math.round(LP.fps) + " FPS"; petaMini(); }
  }
  function petaMini() {
    const B = LP.mmBase, g = LP.ui.mm.getContext("2d"), W = 200, k = 2.2; g.save(); g.fillStyle = "#cfd8c4"; g.fillRect(0, 0, W, W); g.translate(W / 2, W / 2); g.rotate(LP.c.yaw); /* arah kamera ke atas */ g.scale(k, k);
    g.drawImage(B.c, -B.X(LP.p.x), -B.Z(LP.p.z));
    if (LP.path) { g.strokeStyle = "#1f6feb"; g.lineWidth = 2 / k; g.beginPath(); LP.path.forEach((n, i) => (i ? g.lineTo(B.X(n.x) - B.X(LP.p.x), B.Z(n.z) - B.Z(LP.p.z)) : g.moveTo(B.X(n.x) - B.X(LP.p.x), B.Z(n.z) - B.Z(LP.p.z)))); g.stroke(); }
    g.restore(); g.fillStyle = "#e0245e"; g.beginPath(); const a = -(LP.p.yaw - LP.c.yaw) + Math.PI; g.moveTo(W / 2 + Math.sin(a) * 8, W / 2 - Math.cos(a) * 8); g.lineTo(W / 2 + Math.sin(a + 2.5) * 6, W / 2 - Math.cos(a + 2.5) * 6); g.lineTo(W / 2 + Math.sin(a - 2.5) * 6, W / 2 - Math.cos(a - 2.5) * 6); g.fill();
  }
  function lpTutup() {
    LP.on = false; cancelAnimationFrame(LP.raf);
    if (LP.kd) { window.removeEventListener("keydown", LP.kd); window.removeEventListener("keyup", LP.kd); } if (LP.rs) window.removeEventListener("resize", LP.rs);
    if (LP.sc) LP.sc.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); if (LP.ren) { LP.ren.dispose(); if (LP.ren.forceContextLoss) LP.ren.forceContextLoss(); }
    LP.sc = LP.ren = LP.path = null; if (LP.ov) { LP.ov.hidden = true; LP.ov.textContent = ""; }
    const k = window.LP_KEMBALI; window.LP_KEMBALI = null; if (typeof k === "function") setTimeout(k, 60); /* kembali ke Meta Didik */
  }
  window.lpBuka = lpBuka; window.lpTutup = lpTutup;
})();
