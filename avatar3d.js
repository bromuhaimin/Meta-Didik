/* =====================================================================
   AVATAR 3D (v17.91): avatar realistik yang dikongsi oleh Gudang (pratonton berputar) dan META DIDIK.
   Memaparkan semua barang Gudang (pakaian, warna, penutup kepala, cermin mata, pegangan, beg,
   lencana, haiwan, bingkai) dan kesan khas 3D. Pakaian sopan dengan wajah dan butiran jahitan.
   Bergantung pada global index.html: THREE, ZV_SKIN, ZV_OCOL, ZV_HCOL, zvCol, zvShade, zvItem, zvState, zvEqAll.
   ===================================================================== */
(function () {
"use strict";
const T = window.THREE; if (!T) return;
const SLOTS = ["ou", "oc", "hd", "hc", "fc", "hn", "bk", "bd", "pt", "fr", "ef"];
const MAT = {}, GEO = {};
function mat(c, o) {
  const k = c + "|" + (o ? JSON.stringify(o) : "");
  if (!MAT[k]) MAT[k] = new T.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.82, metalness: 0 }, o || {}));
  return MAT[k];
}
function geo(k, f) { return GEO[k] || (GEO[k] = f()); }
function mesh(g, m, x, y, z) { const o = new T.Mesh(g, m); o.position.set(x || 0, y || 0, z || 0); o.castShadow = true; o.receiveShadow = true; return o; }
/* kapsul licin (r128 belum ada CapsuleGeometry): profil lathe separuh bulatan + garis lurus */
function capsule(r, len, n) {
  return geo("cap" + r + "," + len + "," + (n || 12), () => {
    const pts = [];
    for (let i = 0; i <= 6; i++) { const a = -Math.PI / 2 + (i / 6) * Math.PI / 2; pts.push(new T.Vector2(Math.cos(a) * r, -len + Math.sin(a) * r + r)); }
    for (let i = 0; i <= 6; i++) { const a = (i / 6) * Math.PI / 2; pts.push(new T.Vector2(Math.cos(a) * r, -r + Math.sin(a) * r)); }
    return new T.LatheGeometry(pts, n || 12);
  });
}
function lathe(key, prof, n) { return geo(key, () => new T.LatheGeometry(prof.map((p) => new T.Vector2(p[0], p[1])), n || 18)); }
function rbox(w, h, d) { return geo("rb" + w + "," + h + "," + d, () => { const b = new T.BoxGeometry(w, h, d, 2, 2, 2), p = b.attributes.position, v = new T.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const k = 0.82 + 0.18 * (1 - Math.max(Math.abs(v.x) / (w / 2), Math.abs(v.y) / (h / 2), Math.abs(v.z) / (d / 2))); p.setXYZ(i, v.x * (0.9 + 0.1 * k), v.y, v.z * (0.9 + 0.1 * k)); } b.computeVertexNormals(); return b; }); }
const shade = (h, k) => { try { return zvShade(h, k); } catch (e) { return h; } };
const okId = (id, s) => { try { const it = zvItem(id); return it && it.s === s ? id : ""; } catch (e) { return ""; } };

/* kod avatar ringkas untuk bilik multiplayer: g|sk|ou|oc|hd|hc|fc|hn|bk|bd|pt|fr|ef */
function code(z, e) {
  try { z = z || zvState(); e = e || zvEqAll(z); } catch (x) { return "L|1|ou_sc|oc_gn|hd_no|hc_w"; }
  const a = [z.g === "P" ? "P" : "L", Math.max(0, Math.min(5, z.sk | 0))].concat(SLOTS.map((s) => e[s] || ""));
  /* v18.3: lencana sekolah (singkatan:warna:bentuk) sebagai medan tambahan; klien lama mengabaikannya */
  if (e.bd === "bd_sk") { try { const sb = zvSb(z); a.push("sb:" + sb.t + ":" + sb.c + ":" + sb.s); } catch (x) { /* abaikan */ } }
  return a.join("|");
}
function parse(c) {
  const a = String(c || "").split("|"), g = a[0] === "P" ? "P" : "L", o = { g: g, sk: Math.max(0, Math.min(5, +a[1] | 0)) };
  const def = { ou: "ou_sc", oc: "oc_gn", hd: g === "P" ? "hd_td" : "hd_no", hc: "hc_w", fc: "fc_no", hn: "hn_no", bk: "bk_no", bd: "bd_no", pt: "pt_no", fr: "fr_no", ef: "ef_no" };
  SLOTS.forEach((s, i) => { o[s] = okId(a[i + 2], s) || def[s]; });
  if (g === "L" && /^hd_t[dlsw]|^hd_ts/.test(o.hd)) o.hd = "hd_no";
  if (g === "P" && /^hd_(no|sk|kp|sb|tp)$/.test(o.hd)) o.hd = "hd_td";
  const sb = String(a[SLOTS.length + 2] || "").split(":");
  if (o.bd === "bd_sk") o.sb = { t: (sb[0] === "sb" && sb[1] ? sb[1] : "SEK").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7) || "SEK", c: Math.max(0, Math.min(7, +sb[2] | 0)), s: Math.max(0, Math.min(2, +sb[3] | 0)) };
  return o;
}
/* bendera Jalur Gemilang kecil (tekstur kanvas) */
function flagTex() {
  return geo("flagtex", () => {
    const c = document.createElement("canvas"); c.width = 128; c.height = 64; const x = c.getContext("2d");
    for (let i = 0; i < 14; i++) { x.fillStyle = i % 2 ? "#ffffff" : "#cc0001"; x.fillRect(0, i * 64 / 14, 128, 64 / 14 + 0.5); }
    x.fillStyle = "#010066"; x.fillRect(0, 0, 64, 64 * 8 / 14);
    x.fillStyle = "#ffcc00"; x.beginPath(); x.arc(26, 18, 13, 0, 6.2832); x.fill(); x.fillStyle = "#010066"; x.beginPath(); x.arc(31, 18, 11, 0, 6.2832); x.fill();
    x.fillStyle = "#ffcc00"; x.beginPath(); for (let i = 0; i < 28; i++) { const r = i % 2 ? 4 : 10, a = i / 28 * 6.2832 - 1.57; x.lineTo(46 + Math.cos(a) * r, 18 + Math.sin(a) * r); } x.fill();
    const t = new T.CanvasTexture(c); return t;
  });
}
function sparkTex() {
  return geo("sparktex", () => {
    const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d"), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.25, "rgba(255,240,170,.9)"); g.addColorStop(1, "rgba(255,220,120,0)"); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    x.fillStyle = "rgba(255,255,255,.9)"; x.fillRect(30, 4, 4, 56); x.fillRect(4, 30, 56, 4);
    return new T.CanvasTexture(c);
  });
}
/* lencana sekolah: perisai/bulat/segi enam dengan singkatan */
function badgeTex(sb) {
  return geo("bdg" + sb.t + "_" + sb.c + "_" + sb.s, () => {
    const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d");
    let col = "#1e3a7a"; try { col = ZV_SBC[sb.c] || col; } catch (e) { /* abaikan */ }
    x.beginPath();
    if (sb.s === 1) x.arc(64, 64, 56, 0, 6.2832);
    else if (sb.s === 2) { for (let i = 0; i < 6; i++) { const a = i / 6 * 6.2832 - Math.PI / 2; x.lineTo(64 + Math.cos(a) * 58, 64 + Math.sin(a) * 58); } x.closePath(); }
    else { x.moveTo(12, 10); x.lineTo(116, 10); x.lineTo(116, 64); x.quadraticCurveTo(116, 108, 64, 122); x.quadraticCurveTo(12, 108, 12, 64); x.closePath(); }
    x.fillStyle = col; x.fill(); x.lineWidth = 9; x.strokeStyle = "#f0c53c"; x.stroke();
    x.fillStyle = "#f0c53c"; x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 5 : 12, a = i / 10 * 6.2832 - Math.PI / 2; x.lineTo(64 + Math.cos(a) * r, 36 + Math.sin(a) * r); } x.fill();
    const fs = Math.min(40, Math.floor(190 / Math.max(2, sb.t.length)));
    x.fillStyle = "#fff"; x.font = "900 " + fs + "px Nunito, Arial, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(sb.t, 64, 76);
    const t = new T.CanvasTexture(c); t.anisotropy = 4; return t;
  });
}
function ballTex() {
  return geo("balltex", () => {
    const c = document.createElement("canvas"); c.width = 128; c.height = 64; const x = c.getContext("2d");
    x.fillStyle = "#f6f6f2"; x.fillRect(0, 0, 128, 64); x.fillStyle = "#22222a";
    for (let i = 0; i < 6; i++) { const cx = 10 + i * 22, cy = i % 2 ? 22 : 44; x.beginPath(); for (let j = 0; j < 5; j++) { const a = j / 5 * 6.2832; x.lineTo(cx + Math.cos(a) * 8, cy + Math.sin(a) * 8); } x.fill(); }
    return new T.CanvasTexture(c);
  });
}
function unitTex(name) {
  return geo("unitLabel:" + name, () => {
    const c = document.createElement("canvas"); c.width = 256; c.height = 48;
    const x = c.getContext("2d"); x.fillStyle = "#202730"; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = "#f4eee1"; x.font = "600 26px Arial"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(name, 128, 25, 244);
    return new T.CanvasTexture(c);
  });
}
/* ---------- pembina avatar ---------- */
function build(c, opt) {
  opt = opt || {};
  const o = typeof c === "string" ? parse(c) : c;
  const sk = ZV_SKIN[o.sk] || "#e9b98f", oc = zvCol(ZV_OCOL, o.oc), hc = zvCol(ZV_HCOL, o.hc);
  let uni = null; try { uni = zvUni(o.ou, o.g); } catch (e) { uni = o.ou === "ou_sc" ? { t: "#f4f4f0", b: "#27345a", tie: "#27345a" } : null; }
  const sch = !!uni, P = o.g === "P", long = o.ou === "ou_kr" || o.ou === "ou_jb" || (sch && P && !uni.trousers);
  const topC = sch ? uni.t : oc, botC = sch ? uni.b : (o.ou === "ou_tk" ? shade(oc, -0.3) : o.ou === "ou_my" || o.ou === "ou_sm" ? oc : shade(oc, -0.08));
  const mSk = mat(sk, { roughness: 0.6 }), mTop = mat(topC), mBot = mat(botC), mShoe = mat(o.ou === "ou_tk" ? "#f1f1f1" : "#23232b", { roughness: 0.45 });
  const root = new T.Group(), body = new T.Group(); root.add(body);
  body.scale.x = 0.92;
  const pv = (x, y, z) => { const p = new T.Group(); p.position.set(x, y, z || 0); body.add(p); return p; };
  /* kaki */
  const lL = pv(-0.36, 2.3), lR = pv(0.36, 2.3);
  [lL, lR].forEach((p, i) => {
    p.add(mesh(capsule(0.3, 2.05), mBot, 0, -0.05, 0));
    p.add(mesh(rbox(0.46, 0.3, 0.82), mShoe, 0, -2.17, 0.12));
    if (o.ou === "ou_tk") p.add(mesh(geo("strp", () => new T.BoxGeometry(0.05, 1.7, 0.08)), mat("#f4f4f0"), i ? 0.29 : -0.29, -1.0, 0));
  });
  /* badan */
  const torsoLen = long ? 0 : (o.ou === "ou_my" || o.ou === "ou_sm" ? 0.45 : 0.15);
  const torso = mesh(lathe("torso" + torsoLen, [[0, 2.15 - torsoLen], [0.8, 2.15 - torsoLen], [0.86, 2.6], [0.95, 3.3], [1.02, 3.95], [0.95, 4.25], [0.55, 4.42], [0.22, 4.5], [0, 4.5]], 22), mTop);
  torso.scale.z = 0.62; body.add(torso);
  if (long) {
    const skirtC = sch ? botC : (o.ou === "ou_kr" ? shade(oc, -0.1) : oc);
    const sk1 = mesh(lathe("skirt", [[0, 0.22], [1.1, 0.22], [1.02, 1.0], [0.9, 2.2], [0.84, 2.75], [0, 2.75]], 22), mat(skirtC));
    sk1.scale.z = 0.72; body.add(sk1);
    if (!sch || P) { const top2 = mesh(lathe("kurtop", [[0, 1.75], [1.06, 1.75], [1.02, 2.4], [0.98, 3.3], [0, 3.3]], 22), mTop); top2.scale.z = 0.66; if (o.ou !== "ou_jb") body.add(top2); }
    if (o.ou === "ou_jb") for (let i = 0; i < 6; i++) body.add(mesh(geo("btn", () => new T.SphereGeometry(0.05, 6, 4)), mat("#e0b341", { metalness: 0.6, roughness: 0.3 }), 0, 4.1 - i * 0.42, 0.66));
  }
  if (o.ou === "ou_sm") { const sp = mesh(lathe("sampin", [[0, 1.45], [0.98, 1.45], [0.92, 2.55], [0, 2.55]], 22), mat("#8e2340")); sp.scale.z = 0.7; body.add(sp); const st = mesh(geo("sampst", () => new T.TorusGeometry(0.95, 0.04, 6, 24)), mat("#e0b341", { metalness: 0.6, roughness: 0.35 }), 0, 2.0, 0); st.rotation.x = Math.PI / 2; st.scale.y = 0.7; body.add(st); }
  if (o.ou === "ou_my" || o.ou === "ou_sm") { body.add(mesh(geo("col", () => new T.CylinderGeometry(0.3, 0.32, 0.18, 14)), mat(shade(oc, -0.25)), 0, 4.48, 0)); for (let i = 0; i < 3; i++) body.add(mesh(geo("btn", () => new T.SphereGeometry(0.05, 6, 4)), mat("#e0b341", { metalness: 0.6, roughness: 0.3 }), 0, 4.15 - i * 0.3, 0.62)); }
  if (sch && !P) { if (uni.tie) body.add(mesh(geo("tie", () => new T.BoxGeometry(0.2, 1.1, 0.05)), mat(uni.tie), 0, 3.75, 0.62)); body.add(mesh(geo("colw", () => new T.CylinderGeometry(0.3, 0.33, 0.16, 14)), mat(shade(topC, -0.06)), 0, 4.47, 0)); }
  if (sch && uni.scarf) { const sc = mesh(geo("scarf", () => { const g2 = new T.ConeGeometry(0.42, 0.9, 3); g2.rotateX(Math.PI); return g2; }), mat(uni.scarf), 0, 4.05, P ? 0.82 : 0.62); sc.scale.z = 0.25; body.add(sc); body.add(mesh(geo("scarfr", () => new T.TorusGeometry(0.3, 0.06, 6, 18)), mat(uni.scarf), 0, 4.47, 0.05)); body.children[body.children.length - 1].rotation.x = Math.PI / 2; }
  if (sch && uni.lan) { const ln = mesh(geo("lany", () => new T.TorusGeometry(0.4, 0.03, 6, 16, Math.PI * 0.8)), mat(uni.lan), -0.62, 4.0, 0.6); ln.rotation.z = Math.PI * 1.05; body.add(ln); }
  if (sch) {
    const seam = mat(shade(topC, -0.18));
    body.add(mesh(rbox(0.035, 1.55, 0.025), seam, 0, 3.35, 0.625));
    for (const side of [-1, 1]) {
      body.add(mesh(rbox(0.36, 0.36, 0.055), seam, side * 0.46, 3.68, 0.56));
      body.add(mesh(rbox(0.34, 0.1, 0.065), mTop, side * 0.46, 3.86, 0.57));
      body.add(mesh(rbox(0.42, 0.055, 0.26), seam, side * 0.78, 4.24, 0));
    }
    for (let i = 0; i < 4; i++) body.add(mesh(geo("uniformButton", () => new T.SphereGeometry(0.035, 6, 4)), mat("#c8c4b9"), 0, 4.1 - i * 0.32, 0.65));
    if (uni.unit) {
      const belt = mesh(geo("uniformBelt", () => new T.CylinderGeometry(0.87, 0.87, 0.14, 18)), mat("#24272b"), 0, 2.62, 0); belt.scale.z = 0.65; body.add(belt);
      body.add(mesh(rbox(0.2, 0.13, 0.06), mat("#bfa776", { metalness: 0.35 }), 0, 2.62, 0.59));
      const key = "unit:" + uni.unit, label = MAT[key] || (MAT[key] = new T.MeshBasicMaterial({ map: unitTex(uni.unit) }));
      body.add(mesh(geo("unitLabelPlane", () => new T.PlaneGeometry(0.58, 0.11)), label, -0.45, 4.02, 0.58));
    }
  }
  if (o.ou === "ou_tk") { body.add(mesh(geo("zip", () => new T.BoxGeometry(0.06, 2.0, 0.04)), mat("#f4f4f0"), 0, 3.3, 0.64)); }
  /* lengan */
  const aL = pv(-1.02, 4.15), aR = pv(1.02, 4.15);
  [aL, aR].forEach((p, i) => {
    p.rotation.z = i ? 0.09 : -0.09;
    p.add(mesh(capsule(0.25, 1.95), mTop, 0, 0.05, 0));
    p.add(mesh(geo("hand", () => new T.SphereGeometry(0.25, 12, 10)), mSk, 0, -2.05, 0.02));
    if (o.ou === "ou_tk") p.add(mesh(geo("strpa", () => new T.BoxGeometry(0.05, 1.6, 0.06)), mat("#f4f4f0"), i ? 0.24 : -0.24, -0.9, 0));
    if (sch && uni.arm && !i) p.add(mesh(geo("armb", () => new T.CylinderGeometry(0.27, 0.27, 0.3, 14)), mat(uni.arm), 0, -0.35, 0));
  });
  /* leher dan kepala */
  body.add(mesh(geo("neck", () => new T.CylinderGeometry(0.21, 0.24, 0.35, 12)), mSk, 0, 4.6, 0));
  const head = new T.Group(); head.position.y = 5.22; body.add(head);
  const hs = mesh(geo("head", () => new T.SphereGeometry(0.62, 24, 18)), mSk, 0, 0, 0); hs.scale.set(1, 1.12, 1.02); head.add(hs);
  /* ciri wajah ringan; dikongsi oleh pratonton dan pemain multiplayer */
  for (const side of [-1, 1]) {
    head.add(mesh(geo("ear", () => new T.SphereGeometry(0.13, 10, 8)), mSk, side * 0.59, -0.03, 0));
    head.add(mesh(geo("eyeWhite", () => new T.SphereGeometry(0.075, 10, 8)), mat("#f4eee6"), side * 0.22, 0.06, 0.582));
    head.add(mesh(geo("iris", () => new T.SphereGeometry(0.043, 10, 8)), mat("#30241e"), side * 0.22, 0.06, 0.638));
    const brow = mesh(rbox(0.19, 0.035, 0.025), mat("#392a24"), side * 0.22, 0.2, 0.589); brow.rotation.z = side * -0.07; head.add(brow);
  }
  const nose = mesh(geo("nose", () => new T.SphereGeometry(0.09, 10, 8)), mat(shade(sk, -0.05)), 0, -0.08, 0.62); nose.scale.set(0.65, 1.2, 0.8); head.add(nose);
  const smile = mesh(geo("smile", () => new T.TorusGeometry(0.13, 0.018, 6, 14, Math.PI * 0.7)), mat(shade(sk, -0.38)), 0, -0.2, 0.59); smile.rotation.z = Math.PI * 1.15; head.add(smile);
  const hd = o.hd, mH = mat(hc);
  if (P) {
    /* tudung: tempurung dengan bukaan wajah + labuhan menutup leher dan dada */
    const open = hd === "hd_ts" ? 1.35 : 1.5;
    const shell = mesh(geo("tud" + open, () => new T.SphereGeometry(0.75, 26, 18, Math.PI / 2 + open / 2, Math.PI * 2 - open, 0, Math.PI * 0.78)), mat(hc, { side: T.DoubleSide }), 0, 0.04, -0.02);
    shell.scale.set(1, 1.12, 1.04); shell.receiveShadow = false; head.add(shell);
    const brow = mesh(geo("tudb" + open, () => new T.SphereGeometry(0.75, 12, 8, Math.PI / 2 - open / 2, open, 0, Math.PI * 0.34)), mat(hc, { side: T.DoubleSide }), 0, 0.04, -0.02);
    brow.scale.set(1, 1.12, 1.04); brow.receiveShadow = false; head.add(brow);
    const drapeY = { hd_td: 3.55, hd_sw: 3.95, hd_tl: 2.75, hd_ts: 4.15 }[hd] || 3.55, drapeR = { hd_td: 1.12, hd_sw: 0.95, hd_tl: 1.22, hd_ts: 0.82 }[hd] || 1.1;
    const dr = mesh(lathe("drape" + hd, [[0, drapeY], [drapeR * 0.98, drapeY], [drapeR, drapeY + 0.1], [0.9, 4.3], [0.62, 4.62], [0.45, 4.9], [0, 4.9]], 22), mH);
    dr.scale.z = 0.72; body.add(dr);
    if (hd === "hd_sw") { const vis = mesh(geo("visor", () => new T.TorusGeometry(0.62, 0.06, 6, 20, Math.PI)), mat(shade(hc, -0.2)), 0, 0.42, 0.18); vis.rotation.x = -0.5; head.add(vis); }
  } else {
    const hair = mesh(geo("hair", () => new T.SphereGeometry(0.66, 22, 14, 0, Math.PI * 2, 0, Math.PI * 0.5)), mat("#1f1f26", { roughness: 0.9 }), 0, 0.06, -0.04); hair.scale.set(1, 1.08, 1.04); head.add(hair);
    if (hd === "hd_no" && sch && uni.beret) {
      const beret = mesh(geo("unitBeret", () => new T.SphereGeometry(0.69, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2)), mat(uni.beret), 0.07, 0.4, -0.03); beret.scale.y = 0.38; beret.rotation.z = -0.12; head.add(beret);
      head.add(mesh(rbox(0.14, 0.17, 0.04), mat("#c7b477"), -0.25, 0.5, 0.57));
    }
    else if (hd === "hd_sk") head.add(mesh(geo("songkok", () => new T.CylinderGeometry(0.6, 0.64, 0.5, 26)), mat("#15151a", { roughness: 0.95 }), 0, 0.6, -0.02));
    else if (hd === "hd_kp") { const kp = mesh(geo("kopiah", () => new T.SphereGeometry(0.66, 22, 10, 0, Math.PI * 2, 0, Math.PI * 0.35)), mH, 0, 0.18, -0.02); kp.scale.y = 1.2; head.add(kp); }
    else if (hd === "hd_sb") { for (let i = 0; i < 3; i++) { const t = mesh(geo("serb" + i, () => new T.TorusGeometry(0.6 - i * 0.12, 0.17, 10, 24)), mat("#f4f4f0"), 0, 0.42 + i * 0.17, -0.03); t.rotation.x = Math.PI / 2 + (i - 1) * 0.12; head.add(t); } head.add(mesh(geo("serbt", () => new T.SphereGeometry(0.3, 12, 8)), mat("#f4f4f0"), 0, 0.82, -0.04)); }
    else if (hd === "hd_tp") { const cp = mesh(geo("cap", () => new T.SphereGeometry(0.68, 22, 10, 0, Math.PI * 2, 0, Math.PI * 0.45)), mH, 0, 0.12, -0.03); head.add(cp); const br = mesh(geo("brim", () => new T.CylinderGeometry(0.42, 0.42, 0.05, 18, 1, false, 0, Math.PI)), mat(shade(hc, -0.2)), 0, 0.38, 0.5); br.rotation.y = Math.PI / 2; br.scale.x = 1.3; head.add(br); }
  }
  /* cermin mata */
  if (o.fc !== "fc_no") {
    const fm = mat(o.fc === "fc_sg" ? "#111116" : "#2a2a33", { roughness: 0.4, metalness: 0.3 }), lens = mat(o.fc === "fc_sg" ? "#111116" : "#bfe6ff", { transparent: true, opacity: o.fc === "fc_sg" ? 0.92 : 0.35, roughness: 0.1, metalness: 0.2 });
    [-0.23, 0.23].forEach((x) => {
      if (o.fc === "fc_cm") { head.add(mesh(geo("rimc", () => new T.TorusGeometry(0.15, 0.025, 6, 16)), fm, x, 0.08, 0.6)); head.add(mesh(geo("lenc", () => new T.CircleGeometry(0.15, 16)), lens, x, 0.08, 0.6)); }
      else { head.add(mesh(geo("rims", () => new T.BoxGeometry(0.32, 0.22, 0.03)), fm, x, 0.08, 0.6)); head.add(mesh(geo("lens", () => new T.PlaneGeometry(0.27, 0.17)), lens, x, 0.08, 0.618)); }
    });
    head.add(mesh(geo("brg", () => new T.BoxGeometry(0.16, 0.03, 0.03)), fm, 0, 0.1, 0.62));
  }
  /* pegangan di tangan kanan */
  const hand = new T.Group(); hand.position.set(0, -2.1, 0.22); aR.add(hand);
  if (o.hn === "hn_bk") { hand.add(mesh(geo("book", () => new T.BoxGeometry(0.6, 0.78, 0.16)), mat("#3f7fd9"), 0, 0, 0.05)); hand.add(mesh(geo("pages", () => new T.BoxGeometry(0.06, 0.72, 0.13)), mat("#f4f4f0"), 0.3, 0, 0.05)); }
  else if (o.hn === "hn_qr") { hand.add(mesh(geo("mus", () => new T.BoxGeometry(0.58, 0.76, 0.17)), mat("#1f7a4d"), 0, 0, 0.05)); hand.add(mesh(geo("musg", () => new T.BoxGeometry(0.36, 0.5, 0.02)), mat("#e0b341", { metalness: 0.6, roughness: 0.3 }), 0, 0, 0.14)); }
  else if (o.hn === "hn_ts") { const ts = mesh(geo("tasb", () => new T.TorusGeometry(0.28, 0.05, 6, 28)), mat("#2fa57a", { roughness: 0.4 }), 0, -0.25, 0); hand.add(ts); hand.add(mesh(geo("tasbt", () => new T.CylinderGeometry(0.03, 0.05, 0.3, 6)), mat("#e0b341"), 0, -0.65, 0)); }
  else if (o.hn === "hn_jg") { hand.add(mesh(geo("pole", () => new T.CylinderGeometry(0.035, 0.035, 2.6, 6)), mat("#8a6a3a"), 0, 0.9, 0)); const fl = mesh(geo("flag", () => new T.PlaneGeometry(1.3, 0.65, 8, 1)), new T.MeshStandardMaterial({ map: flagTex(), side: T.DoubleSide, roughness: 0.9 }), 0.68, 1.85, 0); fl.castShadow = false; hand.add(fl); hand.userData.flag = fl; }
  else if (o.hn === "hn_bl") { const b = mesh(geo("ball", () => new T.SphereGeometry(0.38, 18, 12)), new T.MeshStandardMaterial({ map: ballTex(), roughness: 0.55 }), 0, -0.1, 0.18); hand.add(b); hand.userData.ball = b; }
  else if (o.hn === "hn_tr") { hand.add(mesh(lathe("troph", [[0, 0], [0.22, 0], [0.22, 0.08], [0.07, 0.15], [0.07, 0.35], [0.32, 0.55], [0.36, 0.9], [0, 0.9]], 18), mat("#f0c53c", { metalness: 0.75, roughness: 0.25 }), 0, -0.05, 0.12)); }
  /* beg */
  if (o.bk === "bk_bg") { body.add(mesh(rbox(1.2, 1.35, 0.5), mat("#e0674a"), 0, 3.45, -0.78)); body.add(mesh(rbox(0.9, 0.5, 0.2), mat("#c9553a"), 0, 3.05, -1.06)); }
  /* lencana di dada */
  const bdz = 0.64, bdy = 3.9;
  if (o.bd === "bd_st") { const s = new T.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 0.07 : 0.17, a = i / 10 * 6.2832 + 1.57; if (i) s.lineTo(Math.cos(a) * r, Math.sin(a) * r); else s.moveTo(Math.cos(a) * r, Math.sin(a) * r); } body.add(mesh(geo("star", () => new T.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: false })), mat("#f4c542", { metalness: 0.6, roughness: 0.3 }), -0.42, bdy, bdz)); }
  else if (o.bd === "bd_sk" && o.sb) { const bz = P ? 0.8 : bdz + 0.01, b = new T.Mesh(geo("bdgp", () => new T.PlaneGeometry(0.52, 0.52)), new T.MeshStandardMaterial({ map: badgeTex(o.sb), transparent: true, roughness: 0.5, metalness: 0.1 })); b.position.set(-0.42, bdy, bz); body.add(b); }
  else if (o.bd === "bd_pf") body.add(mesh(geo("pref", () => new T.BoxGeometry(0.28, 0.34, 0.04)), mat("#2d4fa8"), -0.42, bdy, bdz));
  else if (o.bd === "bd_md") { body.add(mesh(geo("medr", () => new T.BoxGeometry(0.12, 0.3, 0.02)), mat("#cc2236"), -0.42, bdy + 0.12, bdz)); const md = mesh(geo("med", () => new T.CylinderGeometry(0.15, 0.15, 0.04, 18)), mat("#f0c53c", { metalness: 0.75, roughness: 0.25 }), -0.42, bdy - 0.12, bdz + 0.02); md.rotation.x = Math.PI / 2; body.add(md); }
  /* haiwan peliharaan: berjalan di sebelah */
  let pet = null;
  if (o.pt !== "pt_no") {
    pet = new T.Group(); pet.position.set(1.9, 0, 0.6); root.add(pet);
    if (o.pt === "pt_ct") { const m = mat("#e0a050"); const cb = mesh(capsule(0.32, 1.0, 10), m, 0, 0.62, 0.5); cb.rotation.x = Math.PI / 2; pet.add(cb); pet.add(mesh(geo("cath", () => new T.SphereGeometry(0.36, 14, 10)), m, 0, 0.95, 0.62)); [-0.17, 0.17].forEach((x) => pet.add(mesh(geo("catear", () => new T.ConeGeometry(0.11, 0.24, 4)), m, x, 1.3, 0.6))); const tl = mesh(capsule(0.07, 0.9, 6), m, 0, 0.9, -0.55); tl.rotation.x = -0.6; pet.add(tl); }
    else if (o.pt === "pt_ar") { const m = mat("#f1f1ee"); pet.add(mesh(geo("rab", () => new T.SphereGeometry(0.42, 14, 10)), m, 0, 0.42, 0)); pet.add(mesh(geo("rabh", () => new T.SphereGeometry(0.28, 12, 10)), m, 0, 0.8, 0.28)); [-0.1, 0.1].forEach((x) => { const e = mesh(capsule(0.07, 0.5, 6), m, x, 1.38, 0.24); pet.add(e); }); }
    else if (o.pt === "pt_bd") { const m = mat("#f4d03a"); pet.add(mesh(geo("bird", () => new T.SphereGeometry(0.28, 12, 10)), m, 0, 0, 0)); pet.add(mesh(geo("birdh", () => new T.SphereGeometry(0.18, 10, 8)), m, 0, 0.22, 0.2)); const bk = mesh(geo("beak", () => new T.ConeGeometry(0.06, 0.16, 6)), mat("#f08a2a"), 0, 0.2, 0.4); bk.rotation.x = Math.PI / 2; pet.add(bk); pet.position.set(1.4, 5.6, 0.2); pet.userData.fly = 1; }
  }
  /* bingkai menjadi aura di kaki */
  let aura = null;
  if (o.fr !== "fr_no") {
    const fc = { fr_bz: "#b7793a", fr_sv: "#c9d2dc", fr_gd: "#f0c53c", fr_ne: "#29e6ff" }[o.fr] || "#f0c53c";
    aura = new T.Mesh(geo("aura", () => new T.TorusGeometry(1.35, 0.07, 8, 40)), new T.MeshBasicMaterial({ color: fc, transparent: true, opacity: 0.85 }));
    aura.rotation.x = Math.PI / 2; aura.position.y = 0.06; root.add(aura);
    const disc = new T.Mesh(geo("aurad", () => new T.CircleGeometry(1.3, 32)), new T.MeshBasicMaterial({ color: fc, transparent: true, opacity: 0.18, depthWrite: false })); disc.rotation.x = -Math.PI / 2; disc.position.y = 0.05; root.add(disc); aura.userData.disc = disc;
  }
  /* kesan khas 3D */
  let fx = null;
  if (o.ef === "ef_bt") {
    const n = 26, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { pos[i * 3] = 0; pos[i * 3 + 1] = Math.random() * 6; pos[i * 3 + 2] = 0; }
    const gg = new T.BufferGeometry(); gg.setAttribute("position", new T.BufferAttribute(pos, 3));
    fx = new T.Points(gg, new T.PointsMaterial({ color: 0xfff1a0, size: 0.38, map: sparkTex(), transparent: true, opacity: 0.95, depthWrite: false, blending: T.AdditiveBlending })); fx.userData.kind = "bt"; fx.userData.ph = Array.from({ length: n }, () => Math.random() * 6.28); root.add(fx);
  } else if (o.ef === "ef_jp") {
    fx = new T.Group(); fx.userData.kind = "jp";
    [-0.32, 0.32].forEach((x) => { fx.add(mesh(geo("jpt", () => new T.CylinderGeometry(0.24, 0.24, 1.2, 12)), mat("#c9d2dc", { metalness: 0.7, roughness: 0.3 }), x, 3.5, -0.85)); const fl = new T.Mesh(geo("jpf", () => new T.ConeGeometry(0.2, 0.9, 10)), new T.MeshBasicMaterial({ color: 0xff8a1f, transparent: true, opacity: 0.85 })); fl.rotation.x = Math.PI; fl.position.set(x, 2.5, -0.85); fl.visible = false; fx.add(fl); });
    body.add(fx);
  } else if (o.ef === "ef_pl") { fx = { userData: { kind: "pl" } }; }
  return { g: root, body: body, lL: lL, lR: lR, aL: aL, aR: aR, head: head, hand: hand, pet: pet, aura: aura, fx: fx, o: o, ph: Math.random() * 6, t: 0, trail: [] };
}
/* ---------- animasi ---------- */
function anim(av, moving, air, dt, speed, scene) {
  animBase(av, moving, air, dt, speed, scene); poseTick(av, dt);
}
function animBase(av, moving, air, dt, speed, scene) {
  av.t += dt; av.ph += dt * (moving ? 8.5 * (speed || 1) : 2);
  const s = air ? 0.9 : moving ? Math.sin(av.ph) * 0.7 : 0;
  av.lL.rotation.x = air ? -0.55 : s; av.lR.rotation.x = air ? 0.35 : -s;
  av.aL.rotation.x = air ? -2.3 : -s * 0.85; av.aR.rotation.x = air ? -2.3 : (av.hand.children.length ? Math.min(-0.25, s * 0.5 - 0.25) : s * 0.85);
  av.body.position.y = moving && !air ? Math.abs(Math.cos(av.ph)) * 0.12 : Math.sin(av.t * 1.6) * 0.015;
  av.head.rotation.y = moving ? 0 : Math.sin(av.t * 0.5) * 0.18;
  if (av.hand.userData.flag) av.hand.userData.flag.rotation.y = Math.sin(av.t * 4) * 0.25;
  if (av.hand.userData.ball) av.hand.userData.ball.rotation.x += dt * (moving ? 6 : 1);
  if (av.pet) {
    if (av.pet.userData.fly) { av.pet.position.set(1.4 + Math.sin(av.t * 1.3) * 0.5, 5.4 + Math.sin(av.t * 3) * 0.35, 0.2 + Math.cos(av.t * 1.3) * 0.5); av.pet.rotation.z = Math.sin(av.t * 20) * 0.2; }
    else { av.pet.position.y = moving ? Math.abs(Math.sin(av.ph * 1.2)) * 0.35 : 0; av.pet.rotation.y = moving ? 0 : Math.sin(av.t * 0.7) * 0.4; }
  }
  if (av.aura) { const k = 1 + Math.sin(av.t * 3) * 0.06; av.aura.scale.set(k, k, 1); av.aura.rotation.z += dt * 0.6; if (av.o.fr === "fr_ne") av.aura.material.opacity = 0.6 + Math.sin(av.t * 6) * 0.3; }
  const fx = av.fx;
  if (fx && fx.userData.kind === "bt") {
    const p = fx.geometry.attributes.position, ph = fx.userData.ph;
    for (let i = 0; i < ph.length; i++) { const a = ph[i] + av.t * (0.8 + (i % 5) * 0.15), r = 1.3 + (i % 3) * 0.3; p.setXYZ(i, Math.cos(a) * r, ((ph[i] * 3 + av.t * 0.9) % 6.2), Math.sin(a) * r); }
    p.needsUpdate = true; fx.material.opacity = 0.6 + Math.sin(av.t * 8) * 0.35;
  } else if (fx && fx.userData.kind === "jp") {
    fx.children.forEach((c, i) => { if (i % 2) { c.visible = air || (moving && speed > 1.2); c.scale.set(1, 0.7 + Math.random() * 0.6, 1); } });
  } else if (fx && fx.userData.kind === "pl" && scene) {
    /* jejak pelangi: jalur berwarna di belakang semasa bergerak */
    av.trT = (av.trT || 0) - dt;
    if (moving && av.trT <= 0) {
      av.trT = 0.06; const wp = new T.Vector3(); av.g.getWorldPosition(wp);
      const m = new T.Mesh(geo("trq", () => new T.PlaneGeometry(1.4, 0.5)), new T.MeshBasicMaterial({ color: new T.Color().setHSL((av.t * 0.6) % 1, 0.9, 0.6), transparent: true, opacity: 0.8, depthWrite: false, side: T.DoubleSide }));
      m.position.set(wp.x, wp.y + 0.25, wp.z); m.rotation.x = -Math.PI / 2; m.rotation.z = av.g.rotation.y; scene.add(m); av.trail.push(m);
    }
    for (let i = av.trail.length - 1; i >= 0; i--) { const m = av.trail[i]; m.material.opacity -= dt * 0.9; if (m.material.opacity <= 0) { scene.remove(m); m.material.dispose(); av.trail.splice(i, 1); } }
  }
}
function dispose(av, scene) { if (av && av.trail && scene) av.trail.forEach((m) => { scene.remove(m); m.material.dispose(); }); }

/* ---------- pratonton berputar untuk Gudang ---------- */
/* ---------- v18.2: pose keraian dan berenang ----------
   Pose ditentukan oleh parameter: th (condong badan ke depan, berpaksi di kaki), hip (tinggi pinggul),
   zo (anjakan pinggul ke belakang), sudut kaki dunia (lx/rx) dan sisi (lz/rz), lengan (ax/az kiri, bx/bz kanan),
   yaw tambahan, lift (lompat) dan sw (goyang sisi badan). */
const POSE0 = { th: 0, hip: 2.3, zo: 0, lx: 0, rx: 0, lz: 0, rz: 0, ax: 0, az: 0, bx: 0, bz: 0, yaw: 0, lift: 0, sw: 0 };
const ez = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
const mixP = (a, b, k) => { const o = {}; for (const key in POSE0) o[key] = (a[key] != null ? a[key] : POSE0[key]) + ((b[key] != null ? b[key] : POSE0[key]) - (a[key] != null ? a[key] : POSE0[key])) * k; return o; };
/* keraian: tempoh (s) dan fungsi pose mengikut masa */
const RAI = {
  rc_tp: { d: 2.4, f: (t) => { const k = ez(t / 0.3) * ez((2.4 - t) / 0.3), s = (Math.sin(t * 19) + 1) / 2; return mixP(POSE0, { ax: -1.35, bx: -1.35, az: 0.12 + 0.34 * s, bz: -0.12 - 0.34 * s, lift: Math.abs(Math.sin(t * 9.5)) * 0.12 }, k); } },
  rc_sj: { d: 3.6, f: (t) => { const U = { th: 1.45, hip: 1.05, zo: -0.7, lx: 1.15, rx: 1.15, ax: -2.05, bx: -2.05, az: 0.12, bz: -0.12 }; return mixP(POSE0, U, ez(t / 0.8) * ez((3.6 - t) / 0.8)); } },
  rc_ab: { d: 2.6, f: (t) => { const k = ez(t / 0.4) * ez((2.6 - t) / 0.4); return mixP(POSE0, { ax: -2.75, bx: -2.75, az: -0.35, bz: 0.35, lift: Math.max(0, Math.sin(t * 5)) * 0.25, th: -0.08 }, k); } },
  rc_lg: { d: 2.6, f: (t) => { const j = t % 0.85, up = Math.max(0, Math.sin(j / 0.85 * Math.PI)), k = ez(t / 0.2) * ez((2.6 - t) / 0.2); return mixP(POSE0, { lift: up * 2.2, ax: -2.9, bx: -2.9, az: -0.3, bz: 0.3, lx: -0.6 * up, rx: -0.6 * up }, k); } },
  rc_tr: { d: 3.2, f: (t) => { const s = Math.sin(t * 7.5), k = ez(t / 0.3) * ez((3.2 - t) / 0.3); return mixP(POSE0, { ax: -1.7 + s * 0.9, bx: -1.7 - s * 0.9, az: -0.5, bz: 0.5, sw: s * 0.14, yaw: Math.sin(t * 3.75) * 0.7, lift: Math.abs(Math.sin(t * 7.5)) * 0.35, lx: Math.max(0, s) * -0.5, rx: Math.max(0, -s) * -0.5 }, k); } },
  rc_si: { d: 2.9, f: (t) => {
    const crouch = { hip: 1.9, th: 0.25, lx: -0.45, rx: -0.45, ax: 0.5, bx: 0.5 }, land = { th: -0.18, hip: 2.05, lz: -0.32, rz: 0.32, ax: 0.35, bx: 0.35, az: -0.75, bz: 0.75 };
    if (t < 0.45) return mixP(POSE0, crouch, ez(t / 0.45));
    if (t < 1.25) { const u = (t - 0.45) / 0.8; return Object.assign(mixP(crouch, { ax: -1.2, bx: -1.2, az: -0.6, bz: 0.6 }, ez(u * 2)), { lift: Math.sin(u * Math.PI) * 2.6, yaw: ez(u) * Math.PI * 2 }); }
    if (t < 1.45) return mixP({ ax: -1.2, bx: -1.2, az: -0.6, bz: 0.6 }, land, ez((t - 1.25) / 0.2));
    return mixP(land, POSE0, ez((t - 2.5) / 0.4));
  } }
};
/* v18.19: pose ibadah untuk simulasi (doa, takbir, qiyam, rukuk, sujud, duduk, salam); kekal sehingga ditukar */
const IBADAH = {
  doa: { ax: -1.05, bx: -1.05, az: 0.32, bz: -0.32 },
  takbir: { ax: -2.15, bx: -2.15, az: -0.22, bz: 0.22 }, /* lengan lurus tanpa siku: tangan di sisi kepala */
  qiyam: { ax: -1.05, bx: -1.05, az: 0.78, bz: -0.78 },
  rukuk: { th: 1.42, hip: 2.3, zo: 0, lx: 0, rx: 0, ax: -1.25, bx: -1.25, az: 0.08, bz: -0.08 },
  sujud: { th: 1.45, hip: 1.05, zo: -0.7, lx: 1.15, rx: 1.15, ax: -2.05, bx: -2.05, az: 0.12, bz: -0.12 },
  duduk: { th: 0.05, hip: 1.05, zo: -0.5, lx: 1.5, rx: 1.5, ax: -0.75, bx: -0.75, az: -0.1, bz: 0.1 },
  salam: { th: 0.05, hip: 1.05, zo: -0.5, lx: 1.5, rx: 1.5, ax: -0.75, bx: -0.75, az: -0.1, bz: 0.1 }
};
function pose(av, k) { if (!av) return; av.hold = k && IBADAH[k] ? Object.assign({}, POSE0, IBADAH[k]) : null; if (k === "salam") av.head.rotation.y = Math.sin(av.t * 0.8) * 0.9; }
function rai(av, k) { if (!av || !RAI[k]) return 0; av.rai = { k: k, t: 0 }; return RAI[k].d; }
function swimPose(av) {
  const t = av.t;
  if (av.swim === 2) { /* kuak rangkak */
    const a = (t * 5.5) % 6.2832;
    return { th: 1.42, hip: 1.25, zo: -1.1, lx: 1.45 + Math.sin(t * 11) * 0.28, rx: 1.45 - Math.sin(t * 11) * 0.28, ax: -1.42 - a, bx: -1.42 - ((a + 3.1416) % 6.2832), az: 0.1, bz: -0.1, yaw: 0, lift: 0, sw: Math.sin(a) * 0.12 };
  }
  /* terapung tegak (kayuh air) */
  const s = Math.sin(t * 3);
  return { th: 0.18, hip: 2.3, zo: 0, lx: s * 0.35, rx: -s * 0.35, lz: 0, rz: 0, ax: -0.4, bx: -0.4, az: -1.15 + s * 0.3, bz: 1.15 - s * 0.3, yaw: 0, lift: Math.sin(t * 1.5) * 0.12, sw: 0 };
}
function poseApply(av, p) {
  const b = av.body, c = Math.cos(p.th), s = Math.sin(p.th);
  b.rotation.set(p.th, 0, p.sw || 0); b.position.set(0, p.hip - 2.3 * c + (p.lift || 0), (p.zo || 0) - 2.3 * s);
  av.lL.rotation.set((p.lx || 0) - p.th, 0, p.lz || 0); av.lR.rotation.set((p.rx || 0) - p.th, 0, p.rz || 0);
  av.aL.rotation.set(p.ax || 0, 0, p.az || 0); av.aR.rotation.set(p.bx || 0, 0, p.bz || 0);
  if (p.yaw) av.g.rotation.y += p.yaw;
  av._pz = true;
}
function poseTick(av, dt) {
  let p = null;
  if (av.rai) { const R = RAI[av.rai.k]; av.rai.t += dt; if (!R || av.rai.t >= R.d) av.rai = null; else p = R.f(av.rai.t); }
  if (!p && av.swim) p = swimPose(av);
  if (!p && av.hold) p = av.hold;
  if (p) poseApply(av, p);
  else if (av._pz) { av._pz = false; av.body.rotation.set(0, 0, 0); av.body.position.z = 0; av.lL.rotation.z = av.lR.rotation.z = 0; av.aL.rotation.z = av.aR.rotation.z = 0; }
}

const PV = { r: null, scene: null, cam: null, av: null, raf: 0, yaw: 0.5, drag: null, code: "", last: 0 };
function preview(box, c) {
  if (!PV.r) {
    try { PV.r = new T.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { PV.r = null; return false; }
    PV.r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); PV.r.shadowMap.enabled = true;
    PV.scene = new T.Scene(); PV.cam = new T.PerspectiveCamera(32, 0.8, 0.1, 100); PV.cam.position.set(0, 4.2, 15.5); PV.cam.lookAt(0, 3.1, 0);
    PV.scene.add(new T.HemisphereLight(0xeaf4ff, 0x40506a, 0.85));
    const key = new T.DirectionalLight(0xffffff, 0.95); key.position.set(4, 9, 7); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0015; key.shadow.normalBias = 0.03; PV.scene.add(key);
    const rim = new T.DirectionalLight(0x9fd8ff, 0.5); rim.position.set(-6, 5, -6); PV.scene.add(rim);
    const fl = new T.Mesh(new T.CircleGeometry(3.2, 40), new T.MeshStandardMaterial({ color: 0x1b3550, roughness: 0.9 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; PV.scene.add(fl);
    const cv = PV.r.domElement; cv.className = "zv3d"; cv.setAttribute("aria-label", "Pratonton avatar 3D. Seret untuk memusing.");
    cv.addEventListener("pointerdown", (e) => { PV.drag = e.clientX; try { cv.setPointerCapture(e.pointerId); } catch (x) { /* abaikan */ } });
    cv.addEventListener("pointermove", (e) => { if (PV.drag == null) return; PV.yaw += (e.clientX - PV.drag) * 0.012; PV.drag = e.clientX; PV.hold = 2; });
    const up = () => { PV.drag = null; }; cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  }
  const cv = PV.r.domElement; box.textContent = ""; box.appendChild(cv);
  const w = box.clientWidth || 190, h = Math.round(w * 1.25); PV.r.setSize(w, h); PV.cam.aspect = w / h; PV.cam.updateProjectionMatrix();
  if (PV.code !== c || !PV.av) { if (PV.av) PV.scene.remove(PV.av.g); PV.av = build(c); PV.scene.add(PV.av.g); PV.code = c; }
  if (!PV.raf) { PV.last = performance.now(); PV.raf = requestAnimationFrame(pvLoop); }
  return true;
}
function pvLoop(ts) {
  const cv = PV.r && PV.r.domElement;
  if (!cv || !cv.isConnected) { PV.raf = 0; return; }
  PV.raf = requestAnimationFrame(pvLoop);
  const dt = Math.min(0.05, (ts - PV.last) / 1000); PV.last = ts;
  if (PV.drag == null) { if (PV.hold > 0) PV.hold -= dt; else PV.yaw += dt * 0.6; }
  PV.av.g.rotation.y = PV.yaw; anim(PV.av, false, false, dt, 1, null);
  PV.r.render(PV.scene, PV.cam);
}
/* mainkan keraian pada avatar pratonton Gudang */
function previewRai(k) { if (!PV.av) return 0; const d = rai(PV.av, k); if (d) { PV.yaw = 0; PV.hold = d + 1; } return d; }
window.AV3 = { pose: pose, build: build, anim: anim, code: code, parse: parse, preview: preview, dispose: dispose, rai: rai, previewRai: previewRai, RAI: Object.keys(RAI) };
})();
