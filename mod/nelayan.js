/* META DIDIK: modul dimuat apabila diperlukan (lihat modLoad dalam app.js). Bergantung pada pemboleh ubah global app.js.
   v18.25: Nelayan, permainan memancing 3D (Three.js) yang menggantikan Selam. Dibuka dari jeti nelayan di pantai,
   sungai dan tasik dalam Meta Didik. Lempar joran, tunggu ikan menyambar, jawab soalan untuk menarik ikan naik.
   Jawapan salah: ikan terlepas dan umpan berkurang. Skor disimpan seperti Selam (P.sl) dan naik di Kolam Ikan. */
const PC = { open: false, root: null, css: false, g: null, raf: 0, last: 0, tid: "", spot: null, r3: null, keyOn: false, amb: null, timers: [] };
const PC_N = 12, PC_UMPAN = 5;
/* spesies ikan: [nama, warna badan, warna perut, panjang, tinggi, kg min, kg maks, tahap (0 biasa .. 3 jarang)] */
const PC_IKAN = {
  laut: [["Ikan Kembung", "#4f7fa8", "#dfe8ef", 1.6, 0.42, 0.15, 0.35, 0], ["Ikan Selar Kuning", "#7d9db4", "#f2d24a", 1.5, 0.45, 0.2, 0.5, 0], ["Ikan Bawal Putih", "#c9d3dc", "#f4f6f8", 1.0, 0.95, 0.4, 1.4, 1],
    ["Ikan Jenahak", "#b8574a", "#f0c2a8", 1.6, 0.55, 0.8, 3.5, 1], ["Ikan Siakap", "#8a949c", "#e4e8ea", 1.7, 0.55, 1, 4.5, 2], ["Ikan Kerapu", "#9a4a32", "#d99a72", 1.5, 0.6, 1.2, 6, 2], ["Ikan Tenggiri", "#5b7d96", "#e8eef2", 2.4, 0.38, 2, 9, 3]],
  sungai: [["Ikan Puyu", "#5e6b3e", "#c9c08a", 1.2, 0.5, 0.08, 0.2, 0], ["Ikan Lampam", "#b9b38a", "#f0ead0", 1.3, 0.62, 0.2, 0.8, 0], ["Ikan Baung", "#6b5a48", "#c9b8a4", 1.9, 0.42, 0.4, 2, 1],
    ["Ikan Patin", "#8a8f96", "#e2e4e6", 2.0, 0.48, 1, 6, 1], ["Ikan Toman", "#3d4a36", "#a8b090", 2.1, 0.42, 1, 5, 2], ["Ikan Sebarau", "#9aa2a4", "#e8eaea", 1.6, 0.5, 0.5, 3, 2], ["Ikan Kelah Merah", "#c2563a", "#f0b28a", 1.9, 0.55, 2, 10, 3]]
};
function pcTo(fn, ms) { const id = setTimeout(fn, ms); PC.timers.push(id); return id; }
function pcClear() { PC.timers.forEach(clearTimeout); PC.timers = []; }
function pcRoot() {
  if (PC.root) return PC.root;
  if (!PC.css) { const s = document.createElement("style"); s.id = "pcCss"; s.textContent = PC_CSS; document.head.appendChild(s); PC.css = true; }
  const r = el("div", { id: "pcOv", role: "dialog", "aria-modal": "true", "aria-label": "Nelayan" }); document.body.appendChild(r); PC.root = r; return r;
}
/* opt: { spot: { n: nama jeti, jenis: "laut" | "sungai", malam: bool }, onExit: fungsi } */
function pcOpen(tid, opt) {
  opt = opt || {};
  PC.tid = tid || (DATA.topik[0] && DATA.topik[0].id) || ""; PC.spot = Object.assign({ n: "Jeti Nelayan", jenis: "laut", malam: false }, opt.spot || {}); PC.onExit = opt.onExit || null;
  PC.open = true; document.body.classList.add("ar-lock");
  const r = pcRoot(); r.hidden = false;
  try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) { /* abaikan */ }
  if (!PC.keyOn) { window.addEventListener("keydown", pcKey, true); PC.keyOn = true; }
  if (!window.AV3 && typeof av3Load === "function") av3Load(() => { if (PC.open && !PC.g) pcSetup(); });
  pcSetup();
}
function pcClose() {
  pcStop(); PC.open = false;
  if (PC.root) { PC.root.hidden = true; PC.root.textContent = ""; }
  document.body.classList.remove("ar-lock"); if (PC.keyOn) { window.removeEventListener("keydown", pcKey, true); PC.keyOn = false; }
  const cb = PC.onExit; PC.onExit = null; if (cb) setTimeout(cb, 60);
}
function pcStop() { cancelAnimationFrame(PC.raf); PC.raf = 0; pcClear(); pcAmb(false); pc3Free(); PC.g = null; }
function pcTitle(tid) { const t = TOPIK[tid], k = KHAS_BY[tid]; return t ? (t.kod ? t.kod + " " : "") + t.nama : k ? k.n : ""; }
/* skrin mula */
function pcSetup() {
  pcStop();
  const r = pcRoot(); r.textContent = ""; r.classList.remove("pl");
  const S = PC.spot, b = srBest(PC.tid), x = el("button", { type: "button", class: "pc-x", "aria-label": "Tutup" }, "✕ Kembali"); x.addEventListener("click", pcClose);
  const go = el("button", { type: "button", class: "pc-go" }, "🎣 Mula memancing"); go.addEventListener("click", pcStart);
  r.append(el("div", { class: "pc-bg " + S.jenis + (S.malam ? " malam" : "") }), x, el("div", { class: "pc-wrap" }, null,
    el("div", { class: "pc-kick" }, "🎣 " + S.n.toUpperCase() + " · " + (S.jenis === "sungai" ? "SUNGAI" : "LAUT")), el("h1", null, "Nelayan"),
    el("p", { class: "pc-lead" }, "Naik sampan, lempar joran dan tunggu ikan menyambar umpan. Setiap kali ikan menyambar, jawab soalan dengan betul untuk menariknya naik. Jawapan salah: ikan terlepas dan seekor umpan hilang. Jawab berturut-turut untuk menarik ikan yang lebih besar dan jarang ditemui!"),
    el("p", { class: "pc-tj" }, "Tajuk: " + pcTitle(PC.tid)),
    el("div", { class: "pc-stats" }, null, ...[[b.hs | 0, "skor terbaik"], [((b.d | 0) / 10).toFixed(1) + " kg", "ikan terberat"], [b.n | 0, "kali memancing"]].map((s) => el("div", null, null, el("b", null, String(s[0])), el("span", null, s[1])))),
    el("p", { class: "pc-note" }, PC_N + " soalan · " + PC_UMPAN + " umpan. Tekan Space untuk melempar, A hingga D (atau 1 hingga 4) untuk menjawab."), go));
  try { go.focus(); } catch (e) { /* abaikan */ }
}
function pcStart() {
  const w = arWidePool(PC.tid, KHAS_BY[PC.tid] ? "khas" : "misi", PC_N);
  const list = w.pool.length ? blBuild(w.pool, Math.min(PC_N, w.pool.length), "abcd").filter((it) => it.f === "abcd" && it.texts.length >= 2) : [];
  if (list.length < 5) { toast("Soalan pilihan jawapan tidak mencukupi untuk tajuk ini.", "bad"); return; }
  if (!window.THREE || !window.AV3) { toast("Grafik 3D sedang dimuatkan. Cuba sebentar lagi.", "warn"); if (typeof av3Load === "function") av3Load(() => {}); return; }
  const r = pcRoot(); r.textContent = ""; r.classList.add("pl"); pcClear();
  const pill = (lab) => el("div", { class: "pc-pill" }, null, el("small", null, lab), el("b", null, "0"));
  const hU = el("div", { class: "pc-pill um" }, null, el("small", null, "UMPAN"), el("b", null, "")), hS = pill("SKOR"), hI = pill("IKAN"), hK = pill("BAKUL");
  const x = el("button", { type: "button", class: "pc-ic", "aria-label": "Tamat" }, "✕"); x.addEventListener("click", () => { if (PC.g && PC.g.tot > 0) pcEnd("awal"); else pcSetup(); });
  const mute = el("button", { type: "button", class: "pc-ic", "aria-label": "Bunyi", "aria-pressed": BL.mute ? "true" : "false" }, BL.mute ? "🔇" : "🔊");
  mute.addEventListener("click", () => { BL.mute = !BL.mute; mute.textContent = BL.mute ? "🔇" : "🔊"; mute.setAttribute("aria-pressed", BL.mute ? "true" : "false"); pcAmb(!BL.mute); });
  const stage = el("div", { class: "pc-stage" }), cv = el("canvas", { class: "pc-cv", "aria-hidden": "true" }); stage.appendChild(cv);
  const msg = el("div", { class: "pc-msg", role: "status", "aria-live": "polite" });
  const cast = el("button", { type: "button", class: "pc-cast" }, "🎣 Lempar joran"); cast.addEventListener("click", pcCast);
  const sheet = el("div", { class: "pc-sheet", hidden: "" }), q = el("div", { class: "pc-q", "aria-live": "polite" }), ans = el("div", { class: "pc-ans" }), fb = el("div", { class: "pc-fb", hidden: "", role: "status" });
  sheet.append(el("div", { class: "pc-bite" }, "🐟 Ikan menyambar! Jawab dengan betul untuk menariknya naik"), q, ans, fb);
  r.append(stage, el("div", { class: "pc-hud" }, null, hU, hS, hI, hK, mute, x), msg, cast, sheet);
  PC.g = { list: list, i: -1, score: 0, ok: 0, tot: 0, streak: 0, best: 0, umpan: PC_UMPAN, catch: [], kg: 0, heavy: 0, lepas: 0, wrong: [], st: "idle", t: 0,
    hU: hU, hS: hS, hI: hI, hK: hK, msg: msg, cast: cast, sheet: sheet, q: q, ans: ans, fb: fb, btns: [], locked: true };
  if (!pc3Init(cv, stage)) { toast("Grafik 3D tidak dapat dimulakan pada peranti ini.", "warn"); pcSetup(); return; }
  try { lgAC(); } catch (e) { /* abaikan */ }
  blSnd("start"); pcAmb(!BL.mute); pcHud(); pcSay(PC.spot.malam ? "Malam yang tenang. Lempar joran anda!" : "Air tenang, angin sepoi-sepoi. Lempar joran anda!");
  try { cast.focus(); } catch (e) { /* abaikan */ }
  PC.last = 0; PC.raf = requestAnimationFrame(pcLoop);
}
function pcHud() {
  const g = PC.g; if (!g) return;
  g.hU.querySelector("b").textContent = "🪱".repeat(Math.max(0, g.umpan)) + "·".repeat(Math.max(0, PC_UMPAN - g.umpan));
  g.hS.querySelector("b").textContent = String(g.score); g.hI.querySelector("b").textContent = String(g.catch.length); g.hK.querySelector("b").textContent = g.kg.toFixed(1) + " kg";
  g.cast.hidden = g.st !== "idle";
}
function pcSay(t) { const g = PC.g; if (!g) return; g.msg.textContent = t; g.msg.classList.remove("on"); void g.msg.offsetWidth; g.msg.classList.add("on"); }
/* lempar -> tunggu -> sambar (soalan) */
function pcCast() {
  const g = PC.g; if (!g || g.st !== "idle") return;
  if (g.i + 1 >= g.list.length || g.umpan <= 0) { pcEnd("tamat"); return; }
  g.st = "cast"; g.t = 0; pcHud(); pcSay("");
  const R = PC.r3; R.tgt = { x: -3 + Math.random() * 6, z: -(13 + Math.random() * 8) };
  pcSfx("cast");
}
function pcBite() {
  const g = PC.g; if (!g) return;
  g.st = "bite"; g.i++; const it = g.list[g.i]; g.locked = false; pcSfx("bite");
  g.fb.hidden = true; g.fb.textContent = ""; qSet(g.q, it.q.q); g.q.dataset.n = (g.i + 1) + "/" + g.list.length;
  g.ans.textContent = ""; g.btns = [];
  it.texts.forEach((tx, k) => {
    const b = el("button", { type: "button", class: "pc-a", "aria-label": "Jawapan " + "ABCD"[k] }, null, el("em", { "aria-hidden": "true" }, "ABCD"[k]), qSet(el("span"), tx), el("u", { "aria-hidden": "true" }));
    b.addEventListener("click", () => pcPick(k)); g.ans.appendChild(b); g.btns.push(b);
  });
  g.sheet.hidden = false; pcHud();
  try { g.q.setAttribute("tabindex", "-1"); g.q.focus({ preventScroll: true }); } catch (e) { /* abaikan */ }
}
/* pilih spesies: siri jawapan betul menaikkan peluang ikan jarang */
function pcFish() {
  const g = PC.g, L = PC_IKAN[PC.spot.jenis === "sungai" ? "sungai" : "laut"], lv = Math.min(3, Math.floor(g.streak / 2));
  const w = L.map((f) => { const d = f[7] - lv; return d <= 0 ? 3 - Math.abs(d) * 0.6 : Math.max(0.15, 1.2 - d * 0.5); });
  let s = w.reduce((a, b) => a + Math.max(0.05, b), 0) * Math.random(), k = 0;
  for (; k < L.length - 1; k++) { s -= Math.max(0.05, w[k]); if (s <= 0) break; }
  const f = L[k], anak = f[7] >= 1 && Math.random() < 0.18, kg = anak ? +(f[5] * (0.15 + Math.random() * 0.2)).toFixed(2) : +(f[5] + (f[6] - f[5]) * Math.pow(Math.random(), 1.6 - lv * 0.25)).toFixed(2);
  return { n: f[0], c: f[1], b: f[2], L: f[3], H: f[4], kg: kg, tier: f[7], anak: anak };
}
function pcPick(k) {
  const g = PC.g; if (!g || g.locked || g.st !== "bite") return; g.locked = true;
  const it = g.list[g.i], right = k === it.ans; g.tot++; lrnRec(it.q, right);
  try { const seen = JSON.parse(localStorage.getItem("gt-bl-seen" + nlSuf()) || "{}") || {}; seen[it.q.i] = (seen[it.q.i] | 0) + 1; localStorage.setItem("gt-bl-seen" + nlSuf(), JSON.stringify(seen)); } catch (e) { /* abaikan */ }
  g.btns.forEach((b, i) => { b.disabled = true; const u = b.querySelector("u"); if (i === it.ans) { b.classList.add("good"); u.textContent = "✓"; } else if (i === k) { b.classList.add("bad"); u.textContent = "✗"; } });
  g.fb.className = "pc-fb " + (right ? "ok" : "bad"); g.fb.textContent = ""; g.fb.hidden = false;
  if (right) {
    g.ok++; g.streak++; g.best = Math.max(g.best, g.streak); g.fish = pcFish(); blSnd("good");
    g.fb.append(el("div", { class: "h" }, "✓ Betul! Tarik joran..." + (g.streak > 1 ? " (siri ×" + g.streak + ")" : "")));
    if (it.q.e) g.fb.append(qSet(el("div", { class: "e" }), it.q.e));
    pcTo(() => { g.sheet.hidden = true; g.st = "reel"; g.t = 0; pcSfx("reel"); }, it.q.e ? 1900 : 900);
  } else {
    g.streak = 0; g.umpan--; g.wrong.push({ q: it.q, ans: it.texts[it.ans] }); blSnd("bad");
    g.fb.append(el("div", { class: "h" }, "✗ Salah. Ikan terlepas dan umpan dimakan!"), el("div", { class: "a" }, null, "Jawapan betul: ", qSet(el("b"), it.texts[it.ans])));
    if (it.q.e) g.fb.append(qSet(el("div", { class: "e" }), it.q.e));
    const nx = el("button", { type: "button", class: "pc-go sm" }, "Teruskan"); nx.addEventListener("click", () => { g.sheet.hidden = true; g.st = "lari"; g.t = 0; pcSfx("snap"); }); g.fb.append(nx);
    try { nx.focus(); } catch (e) { /* abaikan */ }
  }
  pcHud();
}
/* ikan sampai ke sampan: kad tangkapan, atau pilihan melepaskan anak ikan */
function pcLanded() {
  const g = PC.g, f = g.fish; if (!g || !f) return;
  const pts = Math.round(f.kg * 120 * (1 + 0.25 * Math.min(4, g.streak - 1)) + 40 + f.tier * 60);
  const keep = (bonus, txt) => {
    if (bonus) { g.score += bonus; g.lepas++; } else { g.catch.push(f); g.kg += f.kg; g.heavy = Math.max(g.heavy, f.kg); g.score += pts; pc3Basket(f); }
    g.sheet.hidden = true; g.st = "idle"; g.fish = null; pcHud(); pcSay(txt);
    if (g.i + 1 >= g.list.length || g.umpan <= 0) pcTo(() => pcEnd("tamat"), 1400); else try { g.cast.focus(); } catch (e) { /* abaikan */ }
  };
  const rare = ["", "", "🌟 Jarang ditemui! ", "🏆 Ikan idaman nelayan! "][f.tier] || "";
  if (f.anak) {
    g.st = "anak"; g.sheet.hidden = false; g.q.textContent = ""; g.ans.textContent = ""; g.fb.className = "pc-fb ok"; g.fb.hidden = false; g.fb.textContent = "";
    const lp = el("button", { type: "button", class: "pc-go sm" }, "🌊 Lepaskan (+80)"), sp = el("button", { type: "button", class: "pc-go sm alt" }, "Simpan (+" + pts + ")");
    lp.addEventListener("click", () => { pc3Release(); keep(80, "Anak ikan dilepaskan. Khalifah menjaga sumber alam supaya ikan sempat membiak. +80"); });
    sp.addEventListener("click", () => keep(0, f.n + " " + f.kg + " kg masuk bakul. +" + pts));
    g.fb.append(el("div", { class: "h" }, "🐟 Anak " + f.n.replace("Ikan ", "ikan ") + " (" + f.kg + " kg)"), el("div", { class: "e" }, "Ikan ini masih kecil. Nelayan yang amanah melepaskan anak ikan supaya ia membesar dan membiak; Allah SWT melantik manusia sebagai khalifah untuk memakmurkan bumi, bukan merosakkannya."), el("div", { class: "pc-act" }, null, lp, sp));
    try { lp.focus(); } catch (e) { /* abaikan */ }
    return;
  }
  keep(0, rare + f.n + " · " + f.kg + " kg! +" + pts);
}
function pcKey(e) {
  if (!PC.open) return;
  if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); if (PC.g && PC.g.tot > 0) pcEnd("awal"); else if (PC.g) pcSetup(); else pcClose(); return; }
  const g = PC.g; if (!g) return;
  const k = { a: 0, b: 1, c: 2, d: 3, 1: 0, 2: 1, 3: 2, 4: 3 }[String(e.key).toLowerCase()];
  if (k != null && g.st === "bite" && !g.locked && k < g.btns.length && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); e.stopPropagation(); pcPick(k); return; }
  if (e.key === " " || e.key === "Enter") {
    if (g.st === "idle" && document.activeElement !== g.cast) { e.preventDefault(); e.stopPropagation(); pcCast(); return; }
    if (g.st === "bite" && g.locked) { const nx = g.fb.querySelector("button"); if (nx && document.activeElement !== nx) { e.preventDefault(); e.stopPropagation(); nx.click(); } }
  }
}
function pcLoop(ts) {
  const g = PC.g; if (!g || !PC.open) { PC.raf = 0; return; }
  PC.raf = requestAnimationFrame(pcLoop);
  const raw = PC.last ? (ts - PC.last) / 1000 : 0.016, dt = Math.min(0.05, raw); PC.last = ts; g.t += Math.min(0.25, raw); /* pemasa ikut masa sebenar walaupun bingkai perlahan */
  if (g.st === "cast" && g.t > 0.95) { g.st = "wait"; g.t = 0; g.wait = 1.2 + Math.random() * 2.4; pcSfx("plop"); pcSay("Tunggu... perhatikan pelampung"); }
  else if (g.st === "wait" && g.t > g.wait) pcBite();
  else if (g.st === "reel" && g.t > 1.9) { g.st = "land"; pcLanded(); }
  else if (g.st === "lari" && g.t > 1.4) { g.st = "idle"; pcHud(); pcSay(g.umpan > 0 ? "Pasang umpan baharu dan cuba lagi." : "Umpan sudah habis."); if (g.umpan <= 0 || g.i + 1 >= g.list.length) pcTo(() => pcEnd(g.umpan <= 0 ? "umpan" : "tamat"), 900); }
  pc3Draw(ts / 1000, dt);
}
function pcEnd(why) {
  const g = PC.g; if (!g) return; const cat = g.catch.slice(), kg = g.kg, heavy = g.heavy;
  pcStop();
  const acc = g.tot ? g.ok / g.tot : 0, stars = g.tot >= 5 ? (acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : acc >= 0.4 ? 1 : 0) : 0, finished = why === "tamat" && g.umpan > 0 && g.i + 1 >= g.list.length;
  if (finished) g.score += 200 + g.umpan * 60;
  let xp = 0, md = 0, newBest = false, msg = "";
  if (g.tot >= 1) {
    const o = srBest(PC.tid), nb = { b: Math.max(o.b | 0, stars), hs: o.hs | 0, n: (o.n | 0) + 1, ok: (o.ok | 0) + g.ok, tot: (o.tot | 0) + g.tot, d: Math.max(o.d | 0, Math.round(heavy * 10)) };
    if (g.score > nb.hs) { nb.hs = g.score; newBest = true; } srMap()[PC.tid] = nb;
    try { for (let i = 0; i < g.ok; i++) md += gdCoin(2); } catch (e) { md = 0; }
    try {
      if (g.tot >= 5) { const d = dayKey(), rec = JSON.parse(localStorage.getItem(SR_XP_KEY) || "null") || {}, used = rec.d === d ? rec.n | 0 : 0; xp = Math.max(0, Math.min(g.ok * 2, SR_XP_CAP - used)); if (xp > 0) { P.xp += xp; localStorage.setItem(SR_XP_KEY, JSON.stringify({ d: d, n: used + xp })); noteActive(); } else msg = "Kuota XP Nelayan hari ini (" + SR_XP_CAP + ") sudah penuh."; }
      else msg = "XP diberi apabila sekurang-kurangnya 5 soalan dijawab.";
    } catch (e) { /* abaikan */ }
    saveP(); try { computeStand(); renderMe(); } catch (e) { /* abaikan */ }
  }
  blSnd("end");
  const r = PC.root; r.textContent = ""; r.classList.remove("pl");
  const x = el("button", { type: "button", class: "pc-x" }, "✕ Kembali"); x.addEventListener("click", pcClose);
  const by = {}; cat.forEach((f) => { const b = by[f.n] || (by[f.n] = { n: 0, kg: 0, c: f.c }); b.n++; b.kg += f.kg; });
  const tb = el("div", { class: "pc-catch" }); if (!cat.length) tb.append(el("p", null, "Bakul masih kosong. Cuba lagi!"));
  Object.keys(by).forEach((n) => tb.append(el("div", null, null, el("i", { style: "background:" + by[n].c }), el("b", null, n), el("span", null, "×" + by[n].n + " · " + by[n].kg.toFixed(2) + " kg"))));
  const rev = el("details", { class: "pc-rev" }); rev.append(el("summary", null, "Soalan untuk dikaji semula (" + g.wrong.length + ")"));
  if (!g.wrong.length) rev.append(el("p", null, "Tiada soalan salah. Tahniah!"));
  g.wrong.forEach((w, k) => { const d = el("div", { class: "pc-wq" }); d.append(qSet(el("b"), (k + 1) + ". " + w.q.q), el("div", { class: "a" }, null, "Jawapan betul: ", qSet(el("span"), w.ans))); if (w.q.e) d.append(qSet(el("div", { class: "e" }), w.q.e)); rev.append(d); });
  const again = el("button", { type: "button", class: "pc-go sm" }, "🎣 Pancing lagi"); again.addEventListener("click", pcStart);
  const back = el("button", { type: "button", class: "pc-go sm alt" }, PC.onExit ? "Kembali ke Meta Didik" : "Tutup"); back.addEventListener("click", pcClose);
  const st = el("div", { class: "pc-stars", role: "img", "aria-label": stars + " daripada 3 bintang" }); for (let i = 0; i < 3; i++) st.appendChild(el("span", { class: i < stars ? "" : "off", "aria-hidden": "true" }, "★"));
  r.append(el("div", { class: "pc-bg " + PC.spot.jenis + (PC.spot.malam ? " malam" : "") }), x, el("div", { class: "pc-wrap res" }, null,
    el("div", { class: "pc-kick" }, "HASIL TANGKAPAN · " + PC.spot.n.toUpperCase()), el("h1", null, finished ? "Pulang dengan bakul penuh!" : why === "umpan" ? "Umpan habis" : "Memancing tamat"), st,
    el("div", { class: "pc-stats" }, null, ...[[g.score, "skor"], [cat.length, "ekor ikan"], [kg.toFixed(1) + " kg", "jumlah berat"], [g.ok + " / " + g.tot, "betul"]].map((s) => el("div", null, null, el("b", null, String(s[0])), el("span", null, s[1])))),
    tb, el("p", { class: "pc-lead" }, (newBest ? "Skor terbaik baharu! " : "") + (md ? "+" + md + " MD. " : "") + (xp ? "Profil anda +" + xp + " XP. " : msg + " ") + (g.lepas ? "Anda melepaskan " + g.lepas + " anak ikan: amanah khalifah. " : "") + "Skor anda naik di Kolam Ikan."),
    rev, el("div", { class: "pc-act" }, null, again, back)));
  try { again.focus(); } catch (e) { /* abaikan */ }
}
/* ---------- bunyi: ombak berterusan, lempar, plop, sambar, gulung tali, tali putus ---------- */
function pcAmb(on) {
  try {
    if (!on || BL.mute) { if (PC.amb) { const a = PC.amb; PC.amb = null; a.g.gain.setTargetAtTime(0, a.ac.currentTime, 0.3); setTimeout(() => { try { a.s.stop(); } catch (e) { /* abaikan */ } }, 1200); } return; }
    if (PC.amb || !lgAC()) return;
    const ac = LGA.ctx, n = ac.sampleRate * 4, b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0); let l = 0;
    for (let i = 0; i < n; i++) { l = (l + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = l * 3.2; }
    const s = ac.createBufferSource(); s.buffer = b; s.loop = true; const f = ac.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = PC.spot.jenis === "sungai" ? 500 : 800;
    const gn = ac.createGain(); gn.gain.value = 0; s.connect(f); f.connect(gn); gn.connect(ac.destination); s.start();
    gn.gain.setTargetAtTime(0.16 * blVol(), ac.currentTime, 1); PC.amb = { ac: ac, s: s, g: gn, f: f };
  } catch (e) { PC.amb = null; }
}
function pcSfx(k) {
  if (BL.mute || !lgAC()) return; const v = blVol();
  try {
    if (k === "cast") { lgNz({ ft: "bandpass", f0: 300, f1: 1800, q: 1.2, d: 0.35, at: 0.1, vol: 0.5 * v }); for (let i = 0; i < 8; i++) lgNz({ ft: "highpass", f0: 4000, d: 0.02, vol: 0.12 * v, dl: 0.05 + i * 0.05 }); }
    else if (k === "plop") { lgTn({ f: 600, f1: 180, d: 0.12, vol: 0.35 * v, dl: 0.02 }); lgNz({ ft: "bandpass", f0: 1200, f1: 400, q: 0.8, d: 0.45, at: 0.01, vol: 0.45 * v }); }
    else if (k === "bite") { for (let i = 0; i < 3; i++) lgNz({ ft: "bandpass", f0: 900, f1: 300, q: 1, d: 0.18, vol: 0.4 * v, dl: i * 0.16 }); lgTn({ t: "triangle", f: 880, d: 0.12, vol: 0.18 * v }); lgTn({ t: "triangle", f: 1175, d: 0.16, vol: 0.18 * v, dl: 0.1 }); }
    else if (k === "reel") { for (let i = 0; i < 26; i++) lgNz({ ft: "highpass", f0: 3000, d: 0.015, vol: 0.18 * v, dl: i * 0.06 }); lgNz({ ft: "bandpass", f0: 700, f1: 2400, q: 0.7, d: 0.6, at: 0.02, vol: 0.5 * v, dl: 1.5 }); }
    else if (k === "snap") { lgNz({ ft: "highpass", f0: 2500, d: 0.06, vol: 0.5 * v }); lgNz({ ft: "bandpass", f0: 800, f1: 250, q: 0.8, d: 0.6, vol: 0.4 * v, dl: 0.1 }); }
    else if (k === "basket") { lgTn({ f: 220, f1: 120, d: 0.12, vol: 0.4 * v }); lgNz({ ft: "lowpass", f0: 900, d: 0.1, vol: 0.3 * v }); }
  } catch (e) { /* abaikan */ }
}
/* ---------- grafik 3D (Three.js) ---------- */
function pc3Free() {
  const R = PC.r3; if (!R) return; PC.r3 = null;
  if (R.ro) R.ro.disconnect();
  try { R.scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); }); }); if (R.scene.background && R.scene.background.dispose) R.scene.background.dispose(); } catch (e) { /* abaikan */ }
  try { R.r.dispose(); if (R.r.forceContextLoss) R.r.forceContextLoss(); } catch (e) { /* abaikan */ }
}
function pc3Init(cv, stage) {
  const T = window.THREE; let r;
  try { r = new T.WebGLRenderer({ canvas: cv, antialias: true }); } catch (e) { return false; }
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6)); r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;
  const S = PC.spot, night = !!S.malam, riv = S.jenis === "sungai";
  const scene = new T.Scene(), cam = new T.PerspectiveCamera(52, 1, 0.1, 600);
  const R = PC.r3 = { r: r, scene: scene, cam: cam, riv: riv, night: night, amp: riv ? 0.32 : 1, fx: [], fl: [], ripples: [], basket: [], gulls: [] };
  /* langit kecerunan */
  const sky = document.createElement("canvas"); sky.width = 4; sky.height = 256; const sx = sky.getContext("2d"), gr = sx.createLinearGradient(0, 0, 0, 256);
  if (night) { gr.addColorStop(0, "#050b22"); gr.addColorStop(0.6, "#14244e"); gr.addColorStop(1, "#2b3f6e"); }
  else if (riv) { gr.addColorStop(0, "#4f9fe0"); gr.addColorStop(0.65, "#a9d6f2"); gr.addColorStop(1, "#e6f3e0"); }
  else { gr.addColorStop(0, "#2f86d8"); gr.addColorStop(0.62, "#9fd2f4"); gr.addColorStop(1, "#ffe6bf"); }
  sx.fillStyle = gr; sx.fillRect(0, 0, 4, 256); scene.background = new T.CanvasTexture(sky);
  const fogC = night ? 0x1c2c55 : riv ? 0xcfe6dc : 0xd9ecf6; scene.fog = new T.Fog(fogC, riv ? 40 : 70, riv ? 150 : 330);
  scene.add(new T.HemisphereLight(night ? 0x6f86c8 : 0xffffff, night ? 0x10182c : 0x4a6a5a, night ? 0.5 : 0.85));
  const sun = new T.DirectionalLight(night ? 0xaabbee : 0xfff1d8, night ? 0.35 : 1.0); sun.position.set(-30, 40, -20); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  const sc = sun.shadow.camera; sc.left = sc.bottom = -12; sc.right = sc.top = 12; sc.near = 1; sc.far = 120; scene.add(sun);
  const M = (c, o) => new T.MeshLambertMaterial(Object.assign({ color: c, flatShading: true }, o || {}));
  const mesh = (geo, c, x, y, z, o) => { const m = new T.Mesh(geo, M(c, o)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; scene.add(m); return m; };
  /* air beralun (low-poly) */
  const wg = new T.PlaneGeometry(riv ? 70 : 420, riv ? 320 : 420, riv ? 40 : 96, riv ? 120 : 96); wg.rotateX(-Math.PI / 2);
  const water = new T.Mesh(wg, new T.MeshPhongMaterial({ color: night ? 0x1d3f6a : riv ? 0x3f7d6a : 0x1a7aa6, shininess: 28, specular: night ? 0x223355 : 0x4f7f9a, flatShading: true }));
  water.receiveShadow = true; scene.add(water); R.water = water; R.wx = Float32Array.from(wg.attributes.position.array);
  if (night) { /* bulan dan bintang */
    const moon = new T.Mesh(new T.SphereGeometry(6, 16, 12), new T.MeshBasicMaterial({ color: 0xfff6d8, fog: false })); moon.position.set(60, 70, -230); scene.add(moon);
    const sg = new T.BufferGeometry(), sp = []; for (let i = 0; i < 400; i++) { const a = Math.random() * 6.28, e = 0.15 + Math.random() * 1.2; sp.push(Math.cos(a) * Math.cos(e) * 280, Math.sin(e) * 280, Math.sin(a) * Math.cos(e) * 280); }
    sg.setAttribute("position", new T.Float32BufferAttribute(sp, 3)); scene.add(new T.Points(sg, new T.PointsMaterial({ color: 0xffffff, size: 1.2, fog: false })));
  }
  if (riv) {
    /* tebing sungai, pokok nipah dan bakau */
    for (const s of [-1, 1]) {
      mesh(new T.BoxGeometry(60, 3, 320), night ? "#1f3a26" : "#4f8a3a", s * 46, 0.6, -60);
      mesh(new T.BoxGeometry(6, 1.6, 320), night ? "#3a3326" : "#8a7656", s * 17, 0, -60);
      for (let i = 0; i < 26; i++) {
        const z = 20 - i * 11 - Math.random() * 6, x = s * (20 + Math.random() * 14), h = 5 + Math.random() * 7;
        mesh(new T.CylinderGeometry(0.35, 0.5, h, 5), "#5a4330", x, h / 2 + 1, z);
        mesh(new T.IcosahedronGeometry(2.6 + Math.random() * 2, 0), night ? "#1e4a2a" : ["#2f7d3a", "#3f9a46", "#2a6b34"][i % 3], x, h + 2, z);
      }
      for (let i = 0; i < 10; i++) { const z = 10 - i * 26, x = s * 18.5; for (let k = 0; k < 5; k++) { const lf = mesh(new T.ConeGeometry(0.35, 4, 4), night ? "#2a5a33" : "#5fae4a", x, 2.4, z + k * 0.6); lf.rotation.z = s * (0.3 + k * 0.18); } }
    }
    /* rumah kampung di tebing */
    for (const [x, z] of [[-26, -40], [27, -75], [-29, -110]]) {
      for (const [dx, dz] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) mesh(new T.BoxGeometry(0.3, 3, 0.3), "#5a4330", x + dx, 1.5, z + dz);
      mesh(new T.BoxGeometry(6, 3, 5), night ? "#6b5a40" : "#c8a874", x, 4.5, z); const rf = mesh(new T.ConeGeometry(4.6, 2.4, 4), "#8a3b26", x, 7.2, z); rf.rotation.y = Math.PI / 4;
      if (night) { const l = new T.PointLight(0xffb85a, 1.2, 18); l.position.set(x, 4.5, z + 3); scene.add(l); }
    }
  } else {
    /* pulau di kaki langit dan kampung nelayan di pantai kiri */
    for (const [x, z, s] of [[-80, -230, 1], [40, -260, 1.6], [130, -210, 0.8], [-170, -190, 1.2]]) {
      mesh(new T.CylinderGeometry(22 * s, 26 * s, 1.5, 9), "#e4d3a0", x, 0, z);
      mesh(new T.ConeGeometry(18 * s, 26 * s, 7), night ? "#1d3d2a" : "#3d8a45", x, 12 * s, z);
    }
    mesh(new T.BoxGeometry(40, 1.2, 200), "#e8d6a6", -62, 0.1, -50);
    for (let i = 0; i < 9; i++) {
      const z = 20 - i * 18, x = -50 - Math.random() * 6;
      for (const [dx, dz] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) mesh(new T.BoxGeometry(0.3, 2.6, 0.3), "#5a4330", x + dx, 1.3, z + dz);
      mesh(new T.BoxGeometry(5.5, 3, 5), ["#d9b98a", "#a8c8d8", "#e8c6a0", "#c9d8a8"][i % 4], x, 4.1, z); const rf = mesh(new T.ConeGeometry(4.4, 2.2, 4), ["#9a3b26", "#3b5a8a", "#7a4a2a"][i % 3], x, 6.7, z); rf.rotation.y = Math.PI / 4;
      if (night && i % 2 === 0) { const l = new T.PointLight(0xffb85a, 1, 16); l.position.set(x + 3, 4, z); scene.add(l); }
      const px = -66 - Math.random() * 8, pz = z + 8, ph = 7 + Math.random() * 4, tr = mesh(new T.CylinderGeometry(0.25, 0.4, ph, 5), "#7a5a3a", px, ph / 2, pz); tr.rotation.z = 0.15;
      for (let k = 0; k < 6; k++) { const lf = mesh(new T.ConeGeometry(0.5, 4.2, 3), night ? "#204a2c" : "#3f9a46", px + 0.7, ph, pz); lf.rotation.set(Math.cos(k) * 1.2, k, 1.3 + Math.sin(k) * 0.3); }
    }
    /* jeti kayu dari pantai ke sampan */
    const jet = mesh(new T.BoxGeometry(26, 0.4, 3), "#8a6a46", -29, 1.3, 4); jet.receiveShadow = true;
    for (let i = 0; i < 7; i++) for (const dz of [-1.3, 1.3]) mesh(new T.CylinderGeometry(0.2, 0.2, 4, 5), "#5a4330", -40 + i * 3.8, -0.5, 4 + dz);
    if (!night) for (let i = 0; i < 4; i++) { /* burung camar */
      const gl = new T.Group(); for (const s of [-1, 1]) { const w = new T.Mesh(new T.BoxGeometry(1.4, 0.06, 0.4), new T.MeshLambertMaterial({ color: 0xffffff })); w.position.x = s * 0.7; gl.add(w); }
      gl.userData = { r: 14 + i * 7, h: 14 + i * 3, sp: 0.25 + i * 0.07, ph: i * 1.7, cz: -40 - i * 15 }; scene.add(gl); R.gulls.push(gl);
    }
  }
  /* sampan (perahu) dengan jalur warna pantai timur */
  const boat = new T.Group(); scene.add(boat); R.boat = boat;
  const hg = new T.BoxGeometry(2.4, 0.9, 6.4, 2, 3, 8), hp = hg.attributes.position, hn = hg.attributes.normal, cols = [], C1 = new T.Color(riv ? "#2f6fae" : "#c8402f"), C2 = new T.Color(riv ? "#f2c13a" : "#2f6fae"), C3 = new T.Color("#f2efe6");
  for (let i = 0; i < hp.count; i++) {
    const z = hp.getZ(i) / 3.2, y = hp.getY(i), k = z * z, c = hn.getY(i) > 0.5 ? C1 : y > 0.3 ? C3 : y > 0 ? C2 : C1; cols.push(c.r, c.g, c.b); /* dek ikut warna utama; sisi berjalur */
    hp.setX(i, hp.getX(i) * (1 - 0.75 * k) * (y < -0.3 ? 0.7 : y < 0 ? 0.85 : 1)); hp.setY(i, y + (y > 0 ? 0.55 * k * k * (y / 0.45) : 0.15 * k));
  }
  hg.setAttribute("color", new T.Float32BufferAttribute(cols, 3)); hg.computeVertexNormals();
  const hull = new T.Mesh(hg, new T.MeshLambertMaterial({ vertexColors: true, flatShading: true })); hull.position.y = 0.25; hull.castShadow = true; boat.add(hull);
  const floor = new T.Mesh(new T.BoxGeometry(1.7, 0.1, 4.6), M("#9a7a52")); floor.position.y = 0.55; floor.receiveShadow = true; boat.add(floor);
  for (const z of [-1.2, 1.6]) { const sb = new T.Mesh(new T.BoxGeometry(1.9, 0.12, 0.5), M("#7a5a3a")); sb.position.set(0, 0.85, z); boat.add(sb); }
  const bk = new T.Mesh(new T.CylinderGeometry(0.45, 0.35, 0.55, 10, 1, true), M("#c9a46a", { side: T.DoubleSide })); bk.position.set(-0.55, 0.85, -0.3); boat.add(bk); R.bk = bk;
  if (night) { const ln = new T.Mesh(new T.SphereGeometry(0.16, 8, 6), new T.MeshBasicMaterial({ color: 0xffd27a })); ln.position.set(0.8, 1.6, -2.3); boat.add(ln); const pl = new T.PointLight(0xffc070, 2.2, 22, 1.6); pl.position.copy(ln.position); boat.add(pl); const pole = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 1, 5), M("#5a4330")); pole.position.set(0.8, 1.1, -2.3); boat.add(pole); }
  /* pemancing: avatar Gudang murid, duduk di bangku sambil memegang joran */
  let av = null; try { av = AV3.build(AV3.code()); } catch (e) { av = null; }
  if (av) {
    const bb = new T.Box3().setFromObject(av.g), h = bb.max.y - bb.min.y || 1; av.g.scale.setScalar(1.55 / h); av.g.position.set(0, 0.62, 1.55); av.g.rotation.y = Math.PI;
    av.g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); boat.add(av.g); R.av = av; try { AV3.pose(av, "doa"); } catch (e) { /* abaikan */ }
  }
  /* joran, tali dan pelampung */
  const rod = new T.Group(); rod.position.set(0.18, 1.45, 0.95); boat.add(rod); R.rod = rod;
  const rm = new T.Mesh(new T.CylinderGeometry(0.02, 0.05, 3.4, 6), M("#3a2a1a")); rm.position.y = 1.7; rod.add(rm);
  const reel = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 0.08, 10), M("#c0c4c8")); reel.rotation.z = Math.PI / 2; reel.position.set(0.08, 0.3, 0); rod.add(reel);
  R.tip = new T.Object3D(); R.tip.position.y = 3.4; rod.add(R.tip); rod.rotation.x = -0.95;
  const lg = new T.BufferGeometry(); lg.setAttribute("position", new T.Float32BufferAttribute(new Float32Array(24 * 3), 3));
  R.line = new T.Line(lg, new T.LineBasicMaterial({ color: night ? 0xdfe8ff : 0xffffff, transparent: true, opacity: 0.85 })); R.line.frustumCulled = false; scene.add(R.line);
  const bob = new T.Group(); const b1 = new T.Mesh(new T.SphereGeometry(0.16, 10, 8), new T.MeshLambertMaterial({ color: 0xff3a2a, emissive: night ? 0x661008 : 0x000000 })), b2 = new T.Mesh(new T.SphereGeometry(0.16, 10, 8, 0, 6.3, Math.PI / 2, Math.PI / 2), M("#ffffff"));
  b1.scale.y = 0.9; bob.add(b1, b2); const st = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 0.4, 4), M("#ffd23a")); st.position.y = 0.25; bob.add(st); scene.add(bob); bob.visible = false; R.bob = bob;
  /* percikan dan riak (digunakan semula) */
  const dropG = new T.SphereGeometry(0.07, 5, 4), dropM = new T.MeshBasicMaterial({ color: 0xe8f6ff, transparent: true, opacity: 0.9 });
  for (let i = 0; i < 28; i++) { const d = new T.Mesh(dropG, dropM); d.visible = false; scene.add(d); R.fx.push({ m: d, v: new T.Vector3(), t: 0 }); }
  const ringG = new T.RingGeometry(0.8, 1, 28); ringG.rotateX(-Math.PI / 2);
  for (let i = 0; i < 6; i++) { const m = new T.Mesh(ringG, new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); scene.add(m); R.ripples.push({ m: m, t: 9 }); }
  R.fishM = null; R.cam0 = new T.Vector3(3.4, 4.6, 9.2); R.look = new T.Vector3(-0.5, 1.2, -12);
  const fit = () => { const w = stage.clientWidth || window.innerWidth, h = stage.clientHeight || window.innerHeight; r.setSize(w, h, false); cv.style.width = w + "px"; cv.style.height = h + "px"; cam.aspect = w / h; cam.fov = w / h < 1 ? 66 : 52; cam.updateProjectionMatrix(); };
  fit(); if (window.ResizeObserver) { R.ro = new ResizeObserver(fit); R.ro.observe(stage); }
  return true;
}
function pcWave(x, z, t) { const R = PC.r3, a = R ? R.amp : 1; return a * (0.22 * Math.sin(0.33 * x + 1.1 * t) + 0.17 * Math.sin(0.29 * z + 0.85 * t + x * 0.08) + 0.07 * Math.sin(0.9 * (x + z) + 2.1 * t)); }
function pcSplash(p, n, pow) {
  const R = PC.r3; let k = 0;
  for (const f of R.fx) { if (f.t > 0) continue; f.m.position.copy(p); f.m.visible = true; f.v.set((Math.random() - 0.5) * 3 * pow, (2.5 + Math.random() * 3) * pow, (Math.random() - 0.5) * 3 * pow); f.t = 1; if (++k >= n) break; }
  pcRipple(p.x, p.z, 1); pcRipple(p.x, p.z, 0.6);
}
function pcRipple(x, z, d) { const R = PC.r3, r = R.ripples.find((q) => q.t >= 1.6) || R.ripples[0]; r.t = -(d ? (1 - d) * 0.4 : 0); r.m.position.set(x, 0, z); }
/* ikan low-poly: badan, perut, ekor, sirip dan mata */
function pc3Fish(f, dark) {
  const T = window.THREE, g = new T.Group(), M = (c) => new T.MeshLambertMaterial({ color: c, flatShading: true, transparent: !!dark, opacity: dark ? 0.55 : 1 });
  const body = new T.Mesh(new T.SphereGeometry(0.5, 12, 8), M(dark ? "#0a1a22" : f.c)); body.scale.set(f.L, f.H * 1.6, 0.42); g.add(body);
  if (!dark) { const be = new T.Mesh(new T.SphereGeometry(0.48, 10, 6), M(f.b)); be.scale.set(f.L * 0.92, f.H * 1.2, 0.4); be.position.y = -0.1 * f.H; g.add(be); }
  const tail = new T.Mesh(new T.ConeGeometry(0.34 * f.H * 2, 0.6, 4), M(dark ? "#0a1a22" : f.c)); tail.rotation.z = Math.PI / 2; tail.scale.z = 0.25; tail.position.x = -f.L * 0.5 - 0.22; g.add(tail); g.userData.tail = tail;
  const fin = new T.Mesh(new T.ConeGeometry(0.16, 0.5, 3), M(dark ? "#0a1a22" : f.c)); fin.scale.z = 0.3; fin.position.set(-0.05, f.H * 0.75, 0); fin.rotation.z = 0.5; g.add(fin);
  if (!dark) for (const s of [-1, 1]) { const e = new T.Mesh(new T.SphereGeometry(0.06, 6, 4), new T.MeshBasicMaterial({ color: 0x111111 })); e.position.set(f.L * 0.36, f.H * 0.18, s * 0.17); g.add(e); }
  if (!dark && /Kerapu/.test(f.n)) for (let i = 0; i < 8; i++) { const sp = new T.Mesh(new T.SphereGeometry(0.045, 4, 3), new T.MeshBasicMaterial({ color: 0x4a1a10 })); sp.position.set((Math.random() - 0.5) * f.L * 0.7, (Math.random() - 0.3) * f.H * 0.8, (Math.random() < 0.5 ? -1 : 1) * 0.19); g.add(sp); }
  const s = 0.42 + 0.3 * Math.cbrt(f.kg); g.scale.setScalar(s); return g;
}
function pc3Basket(f) {
  const R = PC.r3; if (!R) return; const T = window.THREE, n = R.basket.length;
  const m = pc3Fish(f); m.scale.multiplyScalar(0.32 / (0.42 + 0.3 * Math.cbrt(f.kg)) * (0.8 + Math.min(0.5, f.kg / 8)));
  m.position.set(-0.55 + (n % 3 - 1) * 0.12, 0.75 + Math.floor(n / 3) * 0.08, -0.3 + ((n * 7) % 3 - 1) * 0.1); m.rotation.y = n * 1.3; R.boat.add(m); R.basket.push(m); pcSfx("basket");
  if (R.fishM) { R.scene.remove(R.fishM); R.fishM = null; } R.bob.visible = false; void T;
}
function pc3Release() { const R = PC.r3; if (!R || !R.fishM) return; const p = R.fishM.position.clone(); R.scene.remove(R.fishM); R.fishM = null; p.y = 0; p.x += 1.5; p.z -= 1; pcSplash(p, 10, 0.7); R.bob.visible = false; pcSfx("plop"); }
function pc3Draw(t, dt) {
  const R = PC.r3, g = PC.g; if (!R || !g) return; const T = window.THREE;
  /* alun air */
  const pa = R.water.geometry.attributes.position, a = pa.array, b = R.wx;
  for (let i = 0; i < a.length; i += 3) a[i + 1] = pcWave(b[i], b[i + 2], t);
  pa.needsUpdate = true;
  /* sampan terapung */
  const by = pcWave(0, 0, t); R.boat.position.y = by * 0.9; R.boat.rotation.z = (pcWave(1.2, 0, t) - pcWave(-1.2, 0, t)) * 0.18; R.boat.rotation.x = (pcWave(0, -3, t) - pcWave(0, 3, t)) * 0.05;
  if (R.av) { try { AV3.anim(R.av, false, false, dt, 1); } catch (e) { /* abaikan */ } }
  /* joran ikut keadaan */
  let rx = -0.95;
  if (g.st === "cast") { const k = g.t / 0.95; rx = k < 0.35 ? -0.95 + 0.9 * (k / 0.35) : -0.05 - 1.25 * Math.min(1, (k - 0.35) / 0.25); }
  else if (g.st === "bite") rx = -1.05 + Math.sin(t * 14) * 0.04;
  else if (g.st === "reel") rx = -0.55 + Math.sin(t * 9) * 0.06;
  else if (g.st === "lari") rx = -0.75;
  R.rod.rotation.x += (rx - R.rod.rotation.x) * Math.min(1, dt * (g.st === "cast" ? 30 : 8));
  const tip = R.tip.getWorldPosition(new T.Vector3());
  /* pelampung */
  const bob = R.bob, tg = R.tgt || { x: 0, z: -14 };
  if (g.st === "cast") {
    const k = clamp((g.t - 0.32) / 0.63, 0, 1); bob.visible = k > 0;
    const sx = tip.x, sz = tip.z, sy = tip.y; bob.position.set(sx + (tg.x - sx) * k, sy + (pcWave(tg.x, tg.z, t) - sy) * k + Math.sin(k * Math.PI) * 4.5, sz + (tg.z - sz) * k);
    if (k >= 1 && !g.splashed) { g.splashed = true; pcSplash(bob.position, 10, 0.6); }
  } else if (g.st === "wait" || g.st === "bite") {
    g.splashed = false; bob.visible = true; let y = pcWave(tg.x, tg.z, t) + 0.05;
    if (g.st === "wait" && g.wait - g.t < 0.8) y -= Math.max(0, Math.sin(g.t * 22)) * 0.12;
    if (g.st === "bite") { y -= 0.22 + Math.abs(Math.sin(t * 9)) * 0.2; if ((g.rpT = (g.rpT || 0) - dt) <= 0) { g.rpT = 0.45; pcRipple(tg.x, tg.z, 0); } }
    else if ((g.rpT = (g.rpT || 0) - dt) <= 0) { g.rpT = 2.2; pcRipple(tg.x, tg.z, 0); }
    bob.position.set(tg.x + Math.sin(t * 0.7) * 0.15, y, tg.z);
  } else if (g.st === "reel") {
    /* gulung: pelampung ditarik, ikan melompat keluar lalu masuk ke sampan */
    const k = clamp(g.t / 1.9, 0, 1), p0 = new T.Vector3(tg.x, 0, tg.z), dst = R.bk.getWorldPosition(new T.Vector3()); dst.y += 0.6;
    if (k < 0.5) { const q = k / 0.5; bob.visible = true; bob.position.set(tg.x + (0.5 - tg.x) * q * 0.7, pcWave(tg.x, tg.z, t) - 0.1, tg.z + (-4 - tg.z) * q * 0.7); if ((g.rpT = (g.rpT || 0) - dt) <= 0) { g.rpT = 0.12; pcSplash(bob.position, 2, 0.4); } }
    else {
      if (!R.fishM && g.fish) { R.fishM = pc3Fish(g.fish); R.scene.add(R.fishM); pcSplash(bob.position, 14, 1); bob.visible = false; }
      const q = (k - 0.5) / 0.5, s = bob.position.clone(), e = dst, f = R.fishM;
      if (f) { f.position.set(s.x + (e.x - s.x) * q, s.y + (e.y - s.y) * q + Math.sin(q * Math.PI) * 3.2, s.z + (e.z - s.z) * q); f.rotation.set(Math.sin(t * 20) * 0.3, Math.atan2(e.x - s.x, e.z - s.z) - Math.PI / 2, Math.sin(t * 16) * 0.5 - (q - 0.5)); if (f.userData.tail) f.userData.tail.rotation.y = Math.sin(t * 30) * 0.6; }
    }
    void p0;
  } else if (g.st === "lari") {
    /* ikan terlepas: bayang ikan berenang pergi, pelampung terpelanting */
    const k = clamp(g.t / 1.4, 0, 1);
    if (!R.shadow) { R.shadow = pc3Fish({ n: "", L: 1.8, H: 0.5, kg: 2, c: "#000" }, true); R.scene.add(R.shadow); pcSplash(new T.Vector3(tg.x, 0, tg.z), 12, 0.9); }
    R.shadow.position.set(tg.x + k * 9, -0.6, tg.z - k * 6); R.shadow.rotation.y = Math.atan2(9, -6) - Math.PI / 2; if (R.shadow.userData.tail) R.shadow.userData.tail.rotation.y = Math.sin(t * 25) * 0.5;
    bob.visible = true; bob.position.set(tg.x + (tip.x - tg.x) * k, pcWave(tg.x, tg.z, t) + Math.sin(k * Math.PI) * 2.5, tg.z + (tip.z + 1 - tg.z) * k);
  } else {
    bob.visible = false; if (R.shadow) { R.scene.remove(R.shadow); R.shadow = null; }
    if (g.st === "anak" && R.fishM) { R.fishM.rotation.z = Math.sin(t * 14) * 0.3; }
  }
  /* tali joran: lengkung dari hujung joran ke pelampung (atau ikan) */
  const la = R.line.geometry.attributes.position, end = R.fishM && g.st === "reel" ? R.fishM.position : bob.visible ? bob.position : tip.clone().add(new T.Vector3(0, -1.2, -0.3));
  const sag = g.st === "bite" || g.st === "reel" ? 0.1 : 0.9;
  for (let i = 0; i < 24; i++) { const k = i / 23; la.setXYZ(i, tip.x + (end.x - tip.x) * k, tip.y + (end.y - tip.y) * k - Math.sin(k * Math.PI) * sag, tip.z + (end.z - tip.z) * k); }
  la.needsUpdate = true;
  /* percikan dan riak */
  for (const f of R.fx) { if (f.t <= 0) continue; f.t -= dt * 1.4; f.v.y -= 14 * dt; f.m.position.addScaledVector(f.v, dt); if (f.t <= 0 || f.m.position.y < -0.3) { f.t = 0; f.m.visible = false; } }
  for (const rp of R.ripples) { if (rp.t >= 1.6) { rp.m.material.opacity = 0; continue; } rp.t += dt; const k = clamp(rp.t / 1.6, 0, 1); rp.m.scale.setScalar(0.2 + k * 2.6); rp.m.material.opacity = rp.t < 0 ? 0 : 0.7 * (1 - k); rp.m.position.y = pcWave(rp.m.position.x, rp.m.position.z, t) + 0.03; }
  for (const gl of R.gulls) { const u = gl.userData, a2 = t * u.sp + u.ph; gl.position.set(Math.cos(a2) * u.r, u.h + Math.sin(t * 0.8 + u.ph) * 1.5, u.cz + Math.sin(a2) * u.r * 0.6); gl.rotation.y = -a2; gl.children.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * Math.sin(t * 6 + u.ph) * 0.45; }); }
  /* kamera bahu: sedikit ikut alun dan dekat semasa ikan menyambar */
  const near = g.st === "bite" ? 0.82 : 1, c0 = R.cam0;
  R.cam.position.set(c0.x * near, c0.y * near + by * 0.5, c0.z * near + (g.st === "bite" ? -1 : 0));
  R.cam.lookAt(R.look.x * 0.6 + (g.st === "bite" || g.st === "wait" ? tg.x * 0.4 : 0), R.look.y, g.st === "bite" ? tg.z : R.look.z);
  R.r.render(R.scene, R.cam);
}
const PC_CSS = `
#pcOv{position:fixed;inset:0;z-index:125;overflow:hidden;color:#fff;font-family:var(--font-body);background:#0a2b44}
#pcOv[hidden]{display:none}
#pcOv .pc-bg{position:fixed;inset:0;background:linear-gradient(180deg,#2f86d8 0%,#9fd2f4 55%,#1f8fb8 56%,#0c4f72 100%)}
#pcOv .pc-bg.sungai{background:linear-gradient(180deg,#4f9fe0 0%,#cfe6dc 52%,#3f7d6a 53%,#1f4a3c 100%)}
#pcOv .pc-bg.malam{background:linear-gradient(180deg,#050b22 0%,#2b3f6e 55%,#1d3f6a 56%,#081a30 100%)}
#pcOv .pc-wrap{position:relative;max-width:820px;margin:0 auto;padding:64px 18px 40px;height:100%;overflow-y:auto}
#pcOv .pc-wrap>*{text-shadow:0 2px 8px rgba(0,0,0,.35)}
#pcOv .pc-kick{font:800 12px var(--font-body);letter-spacing:.18em;color:#ffe9a8}
#pcOv h1{font:900 clamp(34px,6vw,60px)/1.05 var(--font-display,var(--font-body));margin:6px 0 10px}
#pcOv .pc-lead{font-size:17px;line-height:1.45;margin:8px 0 12px;background:rgba(6,30,50,.55);padding:12px 14px;border-radius:16px;text-shadow:none}
#pcOv .pc-tj,#pcOv .pc-note{font-size:14px;opacity:.95}
#pcOv .pc-stats{display:flex;flex-wrap:wrap;gap:10px;margin:10px 0}
#pcOv .pc-stats>div{min-width:108px;padding:10px 14px;border-radius:16px;background:rgba(6,30,50,.6);border:1px solid rgba(255,233,168,.45);display:grid;gap:2px}
#pcOv .pc-stats b{font:800 24px var(--font-display,var(--font-body));color:#ffe9a8}
#pcOv .pc-stats span{font-size:12px;letter-spacing:.1em;text-transform:uppercase;opacity:.85}
#pcOv .pc-go{min-height:52px;padding:10px 26px;border-radius:999px;border:0;cursor:pointer;font:800 17px var(--font-body);color:#3a2200;background:linear-gradient(135deg,#ffd45a,#ff9f43);box-shadow:0 6px 20px rgba(0,0,0,.3)}
#pcOv .pc-go.sm{min-height:44px;padding:8px 18px;font-size:15px}
#pcOv .pc-go.alt{background:rgba(6,30,50,.7);color:#fff;border:1px solid rgba(255,255,255,.5)}
#pcOv button:focus-visible{outline:3px solid #ffe27a;outline-offset:2px}
#pcOv .pc-x{position:fixed;top:max(10px,env(safe-area-inset-top));right:max(10px,env(safe-area-inset-right));z-index:4;min-height:42px;padding:6px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.5);background:rgba(6,30,50,.8);color:#fff;font:700 14px var(--font-body);cursor:pointer}
#pcOv .pc-act{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}
#pcOv .pc-stars{font-size:34px;letter-spacing:6px;color:#ffd23d}#pcOv .pc-stars .off{color:rgba(255,255,255,.3)}
#pcOv .pc-catch{display:grid;gap:6px;margin:8px 0}#pcOv .pc-catch>div{display:flex;gap:10px;align-items:center;background:rgba(6,30,50,.6);padding:8px 12px;border-radius:12px}
#pcOv .pc-catch i{width:26px;height:12px;border-radius:50%}#pcOv .pc-catch b{flex:1}
#pcOv .pc-stage{position:absolute;inset:0}#pcOv .pc-cv{display:block;touch-action:none}
#pcOv .pc-hud{position:absolute;left:0;right:0;top:0;z-index:3;display:flex;gap:8px;align-items:center;padding:max(8px,env(safe-area-inset-top)) max(10px,env(safe-area-inset-right)) 8px max(10px,env(safe-area-inset-left));background:linear-gradient(180deg,rgba(4,20,36,.75),rgba(4,20,36,0))}
#pcOv .pc-pill{display:grid;gap:1px;min-width:62px;text-align:center;background:rgba(4,20,36,.6);padding:4px 10px;border-radius:12px}
#pcOv .pc-pill small{font:700 9px var(--font-body);letter-spacing:.14em;opacity:.8}#pcOv .pc-pill b{font:800 16px var(--font-display,var(--font-body));color:#ffe9a8;white-space:nowrap}
#pcOv .pc-pill.um{flex:1;max-width:190px;text-align:left}
#pcOv .pc-ic{width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,255,255,.45);background:rgba(4,20,36,.7);color:#fff;font-size:16px;cursor:pointer;margin-left:auto}
#pcOv .pc-ic+.pc-ic{margin-left:0}
#pcOv .pc-msg{position:absolute;left:50%;top:calc(max(8px,env(safe-area-inset-top)) + 62px);transform:translateX(-50%);z-index:3;max-width:min(560px,90vw);text-align:center;font:800 16px var(--font-body);padding:8px 16px;border-radius:999px;background:rgba(4,20,36,.7);opacity:0;pointer-events:none}
#pcOv .pc-msg:empty{display:none}#pcOv .pc-msg.on{animation:pcMsg 4s ease forwards}
@keyframes pcMsg{0%{opacity:0;transform:translate(-50%,-6px)}8%,80%{opacity:1;transform:translate(-50%,0)}100%{opacity:0}}
#pcOv .pc-cast{position:absolute;left:50%;bottom:calc(22px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:3;min-height:60px;padding:12px 34px;border-radius:999px;border:0;cursor:pointer;font:900 20px var(--font-body);color:#3a2200;background:linear-gradient(135deg,#ffd45a,#ff9f43);box-shadow:0 8px 24px rgba(0,0,0,.35);animation:pcPulse 1.6s ease-in-out infinite}
#pcOv .pc-cast[hidden]{display:none}
@keyframes pcPulse{50%{transform:translateX(-50%) scale(1.05)}}
#pcOv .pc-sheet{position:absolute;left:50%;bottom:0;transform:translateX(-50%);z-index:3;width:min(860px,100%);max-height:62%;overflow-y:auto;padding:12px 14px calc(14px + env(safe-area-inset-bottom));background:rgba(4,20,36,.93);border-radius:20px 20px 0 0;border-top:3px solid #ffd45a;display:grid;gap:8px;animation:pcUp .25s ease}
#pcOv .pc-sheet[hidden]{display:none}
@keyframes pcUp{from{transform:translate(-50%,30px);opacity:0}}
#pcOv .pc-bite{font:800 14px var(--font-body);color:#ffd45a}
#pcOv .pc-q{font:700 clamp(16px,2.4vw,22px)/1.4 var(--font-body)}
#pcOv .pc-q:before{content:attr(data-n);display:inline-block;margin-right:8px;padding:1px 9px;border-radius:99px;background:rgba(255,212,90,.2);color:#ffd45a;font-size:12px}
#pcOv .pc-q:empty{display:none}
#pcOv .pc-ans{display:grid;grid-template-columns:1fr 1fr;gap:8px}@media(max-width:640px){#pcOv .pc-ans{grid-template-columns:1fr}}
#pcOv .pc-a{display:flex;gap:10px;align-items:center;text-align:left;min-height:50px;padding:8px 12px;border-radius:14px;border:1px solid rgba(255,233,168,.45);background:rgba(255,212,90,.08);color:#fff;font:600 16px/1.3 var(--font-body);cursor:pointer}
#pcOv .pc-a em{flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font:800 13px var(--font-body);font-style:normal;background:#ff9f43;color:#3a2200}
#pcOv .pc-a span{flex:1}#pcOv .pc-a u{text-decoration:none;font-weight:900;font-size:19px}
#pcOv .pc-a:hover:not(:disabled){background:rgba(255,212,90,.2)}
#pcOv .pc-a.good{background:rgba(77,255,178,.25);border-color:#4dffb2}#pcOv .pc-a.bad{background:rgba(255,91,122,.25);border-color:#ff5b7a}
#pcOv .pc-fb{padding:10px 12px;border-radius:14px;display:grid;gap:6px;background:rgba(255,255,255,.08)}#pcOv .pc-fb[hidden]{display:none}
#pcOv .pc-fb.ok{border:1px solid #4dffb2}#pcOv .pc-fb.bad{border:1px solid #ff5b7a}#pcOv .pc-fb .h{font-weight:800;font-size:17px}#pcOv .pc-fb .e{opacity:.9;font-size:14px}
#pcOv .pc-fb button{justify-self:start}
#pcOv .pc-rev{margin:10px 0;background:rgba(6,30,50,.6);border-radius:14px;padding:8px 14px;text-shadow:none}#pcOv .pc-rev summary{cursor:pointer;font-weight:700;min-height:36px;display:flex;align-items:center}
#pcOv .pc-wq{padding:8px 0;border-top:1px solid rgba(255,255,255,.15);display:grid;gap:4px}#pcOv .pc-wq .e{opacity:.85;font-size:14px}
@media(max-height:500px){#pcOv .pc-sheet{max-height:78%;padding-top:8px;gap:6px}#pcOv .pc-a{min-height:40px;padding:6px 10px;font-size:14px}#pcOv .pc-q{font-size:15px}#pcOv .pc-cast{min-height:50px;font-size:17px;bottom:12px}#pcOv .pc-wrap{padding-top:54px}#pcOv h1{font-size:34px}}
@media(prefers-reduced-motion:reduce){#pcOv *{animation:none!important}}
`;
