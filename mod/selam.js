/* GEMPUR: modul dimuat apabila diperlukan (lihat modLoad dalam app.js). Bergantung pada pemboleh ubah global app.js. */
function srTo(fn, ms) { const id = setTimeout(fn, ms); SR.timers.push(id); return id; }
function srClear() { SR.timers.forEach(clearTimeout); SR.timers = []; }
function srRoot() {
  if (SR.root) return SR.root;
  if (!SR.css) { const s = document.createElement("style"); s.id = "srCss"; s.textContent = SR_CSS; document.head.appendChild(s); SR.css = true; }
  const r = el("div", { id: "srOv", role: "dialog", "aria-modal": "true", "aria-label": "Selam" });
  document.body.appendChild(r); SR.root = r; return r;
}
function srOpen(tid) {
  SR.tid = tid || "KR"; SR.open = true; document.body.classList.add("ar-lock");
  const r = srRoot(); r.hidden = false;
  try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) { /* abaikan */ }
  window.addEventListener("keydown", srKey, true); srSetup();
}
function srClose() {
  cancelAnimationFrame(SR.raf); SR.raf = 0; srClear(); SR.open = false; SR.g = null; SR.cv = null;
  if (SR.ro) { SR.ro.disconnect(); SR.ro = null; }
  if (SR.root) { SR.root.hidden = true; SR.root.textContent = ""; }
  document.body.classList.remove("ar-lock"); window.removeEventListener("keydown", srKey, true);
}
function srSetup() {
  cancelAnimationFrame(SR.raf); SR.raf = 0; srClear(); SR.g = null;
  const r = srRoot(); r.textContent = ""; r.classList.remove("pl");
  const b = srBest(), rh = !!(KHAS_BY[SR.tid] && KHAS_BY[SR.tid].rahsia), x = el("button", { type: "button", class: "sr-x", "aria-label": "Tutup" }, "Tutup"); x.addEventListener("click", srClose);
  const go = el("button", { type: "button", class: "sr-go" }, "Mula selam"); go.addEventListener("click", srStart);
  r.append(el("div", { class: "sr-bg" }), x, el("div", { class: "sr-wrap" }, null,
    el("div", { class: "sr-kick" }, srTitle(SR.tid).toUpperCase()), el("h1", null, rh ? "Selam Rahsia" : "Selam"),
    el("p", { class: "sr-lead" }, "Ikan anda menyelam mencari harta karun. Jawab dengan betul untuk menyelam lebih dalam dan tambah oksigen. Jawapan salah menyedut oksigen, dan oksigen juga berkurang bila anda lambat. Jumlah skor terbaik anda daripada semua tajuk naik di Kolam Ikan kelas."),
    el("div", { class: "sr-stats" }, null, ...[[b.hs | 0, "skor terbaik"], [(b.d | 0) + " m", "paling dalam"], [b.n | 0, "kali selam"]].map((s) => el("div", null, null, el("b", null, String(s[0])), el("span", null, s[1])))),
    el("p", { class: "sr-note" }, SR_N + " soalan. Tekan A hingga D atau 1 hingga 4 pada papan kekunci, atau sentuh jawapan."), go));
  go.focus();
}
function srStart() {
  const w = arWidePool(SR.tid, KHAS_BY[SR.tid] ? "khas" : "misi", SR_N);
  const list = w.pool.length ? blBuild(w.pool, Math.min(SR_N, w.pool.length), "abcd").filter((it) => it.f === "abcd" && it.texts.length >= 2) : [];
  if (list.length < 5) { toast("Soalan pilihan jawapan tidak mencukupi untuk Selam di tajuk ini.", "bad"); return; }
  const r = srRoot(); r.textContent = ""; r.classList.add("pl"); srClear();
  const pill = (cls, lab) => el("div", { class: "sr-pill " + cls }, null, el("small", null, lab), el("b", null, "0"));
  const hD = pill("d", "KEDALAMAN"), hS = pill("sc", "SKOR"), hT = pill("st", "SIRI");
  const ox = el("div", { class: "sr-ox", role: "img", "aria-label": "Oksigen" }, null, el("small", null, "OKSIGEN"), el("div", { class: "bar" }, null, el("i")));
  const x = el("button", { type: "button", class: "sr-ic", "aria-label": "Tamat dan tutup" }, "✕"); x.addEventListener("click", () => { if (SR.g && SR.g.tot > 0) srEnd("awal"); else srSetup(); });
  const mute = el("button", { type: "button", class: "sr-ic", "aria-label": "Bunyi", "aria-pressed": BL.mute ? "true" : "false" }, BL.mute ? "🔇" : "🔊");
  mute.addEventListener("click", () => { BL.mute = !BL.mute; mute.textContent = BL.mute ? "🔇" : "🔊"; mute.setAttribute("aria-pressed", BL.mute ? "true" : "false"); });
  const cv = el("canvas", { class: "sr-cv", "aria-hidden": "true" }), stage = el("div", { class: "sr-stage" }, null, cv);
  const q = el("div", { class: "sr-q", "aria-live": "polite" }), ans = el("div", { class: "sr-ans" }), fb = el("div", { class: "sr-fb", hidden: "", role: "status" });
  r.append(el("div", { class: "sr-hud" }, null, ox, hD, hS, hT, mute, x), stage, el("div", { class: "sr-play" }, null, q, ans, fb));
  const h = klHash((Net.uid || "me") + "|" + (cleanName(P.nama) || "Anda"));
  SR.fish = { x: 0, y: 0, vx: 0, vy: 0, dir: 1, sp: h % 4, pal: (h >>> 3) % KL_PAL.length, ph: 0, sz: 40, eat: 0, tilt: 0, e: { me: true, no: 99, pts: 0, n: cleanName(P.nama) || "Anda", x: 0 } };
  SR.cv = cv; SR.bub = []; SR.rocks = [];
  for (let i = 0; i < 60; i++) SR.rocks.push({ x: Math.random(), y: 150 + i * 55 + Math.random() * 40, s: 0.6 + Math.random() * 0.9, t: i % 3 });
  SR.g = { list: list, i: -1, score: 0, ok: 0, tot: 0, streak: 0, best: 0, ox: 100, depth: 0, cam: 0, wrong: [], locked: true, q: q, ans: ans, fb: fb, hD: hD, hS: hS, hT: hT, oxb: ox.querySelector("i"), btns: [] };
  const fit = () => { const rc = stage.getBoundingClientRect(); if (rc.width < 10) return; SR.dpr = Math.min(2, window.devicePixelRatio || 1); SR.w = rc.width; SR.h = rc.height; cv.width = Math.round(rc.width * SR.dpr); cv.height = Math.round(rc.height * SR.dpr); cv.style.width = rc.width + "px"; cv.style.height = rc.height + "px"; };
  fit(); if (window.ResizeObserver) { SR.ro = new ResizeObserver(fit); SR.ro.observe(stage); }
  blSnd("start"); srHud(); srNext();
  cancelAnimationFrame(SR.raf); SR.last = 0; SR.raf = requestAnimationFrame(srLoop);
}
function srHud() {
  const g = SR.g; if (!g) return;
  g.hD.querySelector("b").textContent = g.depth + " m"; g.hS.querySelector("b").textContent = String(g.score); g.hT.querySelector("b").textContent = g.streak ? "×" + g.streak : "0";
  g.oxb.style.width = clamp(g.ox, 0, 100) + "%"; g.oxb.parentNode.classList.toggle("low", g.ox < 25);
}
function srNext() {
  const g = SR.g; if (!g) return; srClear();
  g.i++; if (g.i >= g.list.length) { srEnd("tamat"); return; }
  const it = g.list[g.i]; g.locked = false; g.fb.hidden = true; g.fb.textContent = ""; qSet(g.q, it.q.q); g.q.dataset.n = (g.i + 1) + "/" + g.list.length;
  g.ans.textContent = ""; g.btns = [];
  it.texts.forEach((tx, k) => {
    const b = el("button", { type: "button", class: "sr-a", "aria-label": "Jawapan " + "ABCD"[k] }, null, el("em", { "aria-hidden": "true" }, "ABCD"[k]), qSet(el("span"), tx), el("u", { "aria-hidden": "true" }));
    b.addEventListener("click", () => srPick(k)); g.ans.appendChild(b); g.btns.push(b);
  });
  blSnd("turn"); srHud(); try { g.q.setAttribute("tabindex", "-1"); } catch (e) { /* abaikan */ }
}
function srPick(k) {
  const g = SR.g; if (!g || g.locked) return; g.locked = true;
  const it = g.list[g.i], right = k === it.ans; g.tot++; lrnRec(it.q, right);
  try { const seen = JSON.parse(localStorage.getItem("gt-bl-seen" + nlSuf()) || "{}") || {}; seen[it.q.i] = (seen[it.q.i] | 0) + 1; localStorage.setItem("gt-bl-seen" + nlSuf(), JSON.stringify(seen)); } catch (e) { /* abaikan */ }
  let pts = 0;
  if (right) {
    g.ok++; g.streak++; g.best = Math.max(g.best, g.streak); g.depth += SR_STEP; g.ox = Math.min(100, g.ox + 14);
    pts = Math.round((100 + g.ox * 0.5) * (1 + 0.25 * Math.min(4, g.streak - 1))); g.score += pts; SR.fish.eat = 1; blSnd("good");
  } else { g.streak = 0; g.ox = Math.max(0, g.ox - 22); g.wrong.push({ q: it.q, ans: it.texts[it.ans] }); blSnd("bad"); }
  g.btns.forEach((b, i) => { b.disabled = true; const u = b.querySelector("u"); if (i === it.ans) { b.classList.add("good"); u.textContent = "✓"; } else if (i === k) { b.classList.add("bad"); u.textContent = "✗"; } });
  g.fb.textContent = ""; g.fb.className = "sr-fb " + (right ? "ok" : "bad"); g.fb.hidden = false;
  const last = g.i >= g.list.length - 1 || g.ox <= 0, nx = el("button", { type: "button", class: "sr-go sm" }, last ? "Lihat keputusan" : "Seterusnya"); nx.addEventListener("click", srNext);
  g.fb.append(el("div", { class: "h" }, null, right ? "✓ Betul! +" + pts + (g.streak > 1 ? " (siri ×" + g.streak + ")" : "") + "  Oksigen +14" : "✗ Salah  Oksigen −22"), right ? el("span") : el("div", { class: "a" }, null, "Jawapan betul: ", qSet(el("b"), it.texts[it.ans])), it.q.e ? qSet(el("div", { class: "e" }), it.q.e) : el("span"), nx);
  srHud(); try { nx.focus(); } catch (e) { /* abaikan */ }
  if (g.ox <= 0) { g.locked = true; srTo(() => { if (SR.g === g) srEnd("oksigen"); }, 600); return; }
  if (right && !it.q.e) srTo(() => { if (SR.g === g && g.locked && !g.fb.hidden) srNext(); }, 1500);
}
function srKey(e) {
  if (!SR.open) return;
  if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); if (SR.g && SR.g.tot > 0 && SR.root.classList.contains("pl")) srEnd("awal"); else srClose(); return; }
  const g = SR.g; if (!g || !SR.root.classList.contains("pl")) return;
  const k = { a: 0, b: 1, c: 2, d: 3, 1: 0, 2: 1, 3: 2, 4: 3 }[String(e.key).toLowerCase()];
  if (k != null && !e.ctrlKey && !e.metaKey && !e.altKey) { if (!g.locked && k < g.btns.length) { e.preventDefault(); e.stopPropagation(); srPick(k); } return; }
  if ((e.key === "Enter" || e.key === " ") && g.locked && !g.fb.hidden) { const nx = g.fb.querySelector("button"); if (nx && document.activeElement !== nx) { e.preventDefault(); e.stopPropagation(); nx.click(); } }
}
function srLoop(ts) {
  const g = SR.g; if (!g || !SR.open) { SR.raf = 0; return; }
  SR.raf = requestAnimationFrame(srLoop);
  const dt = SR.last ? Math.min(0.05, (ts - SR.last) / 1000) : 0.016; SR.last = ts;
  if (!g.locked && g.i >= 0 && !document.hidden) { g.ox -= 1.25 * dt; if (g.ox <= 0) { g.ox = 0; srHud(); srEnd("oksigen"); return; } }
  g.hudT = (g.hudT || 0) + dt; if (g.hudT > 0.1) { g.hudT = 0; g.oxb.style.width = clamp(g.ox, 0, 100) + "%"; g.oxb.parentNode.classList.toggle("low", g.ox < 25); }
  g.cam += (g.depth * SR_PX - g.cam) * Math.min(1, dt * 1.8);
  srDraw(ts, dt);
}
function srDraw(ts, dt) {
  const cv = SR.cv, g = SR.g; if (!cv || !SR.w) return;
  const c = cv.getContext("2d"), W = SR.w, H = SR.h; c.setTransform(SR.dpr, 0, 0, SR.dpr, 0, 0);
  const t = clamp(g.cam / (SR_N * SR_STEP * SR_PX), 0, 1), mix = (a, b) => Math.round(a + (b - a) * t);
  const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "rgb(" + mix(42, 6) + "," + mix(143, 30) + "," + mix(208, 70) + ")"); gr.addColorStop(1, "rgb(" + mix(10, 2) + "," + mix(44, 10) + "," + mix(94, 30) + ")"); c.fillStyle = gr; c.fillRect(0, 0, W, H);
  c.save(); c.globalAlpha = 0.07 * (1 - t); c.fillStyle = "#fff"; for (let i = 0; i < 4; i++) { const x = (i * 0.28 + 0.08) * W + Math.sin(ts / 3000 + i) * 30; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 60, 0); c.lineTo(x + 180, H); c.lineTo(x + 40, H); c.closePath(); c.fill(); } c.restore();
  const fy = H * 0.34, off = g.cam - fy;
  SR.rocks.forEach((r) => { const y = r.y - g.cam + fy; if (y < -40 || y > H + 40) return; const x = r.x < 0.5 ? r.x * W * 0.3 : W - (1 - r.x) * W * 0.3; c.fillStyle = r.t === 0 ? "rgba(20,60,90,.55)" : r.t === 1 ? "rgba(60,40,90,.5)" : "rgba(20,90,70,.5)"; c.beginPath(); c.ellipse(x, y, 26 * r.s, 14 * r.s, 0, 0, 6.283); c.fill(); });
  for (let d = 10; d <= SR_N * SR_STEP; d += 10) { const y = d * SR_PX - off; if (y < 0 || y > H) continue; c.fillStyle = "rgba(255,255,255,.35)"; c.font = "700 11px Rajdhani, system-ui, sans-serif"; c.textAlign = "right"; c.fillText(d + " m", W - 8, y + 4); c.fillRect(W - 40, y, 30, 1); }
  const cy = SR_N * SR_STEP * SR_PX + 70 - off; if (cy < H + 60) { const bw = 56; c.fillStyle = "#8a5a2a"; c.fillRect(W / 2 - bw / 2, cy - 30, bw, 30); c.fillStyle = "#a8722f"; c.beginPath(); c.ellipse(W / 2, cy - 30, bw / 2, 16, 0, Math.PI, 0); c.fill(); c.fillStyle = "#f0c53c"; c.fillRect(W / 2 - 4, cy - 36, 8, 10); }
  if (Math.random() < dt * 4 && SR.bub.length < 30) SR.bub.push({ x: Math.random() * W, y: H + 5, r: 2 + Math.random() * 4, v: 30 + Math.random() * 40 });
  SR.bub.forEach((b) => { b.y -= b.v * dt; b.x += Math.sin(b.y * 0.05) * 0.3; c.strokeStyle = "rgba(255,255,255,.5)"; c.lineWidth = 1.2; c.beginPath(); c.arc(b.x, b.y, b.r, 0, 6.283); c.stroke(); }); SR.bub = SR.bub.filter((b) => b.y > -10);
  const f = SR.fish; f.sz = clamp(Math.min(W, H * 1.4) * 0.12, 26, 54); f.x = W / 2 + Math.sin(ts / 900) * W * 0.06; f.y = fy + Math.sin(ts / 700) * 6; f.ph += dt * 6; f.eat = Math.max(0, f.eat - dt * 3); f.dir = Math.cos(ts / 900) > 0 ? 1 : -1; f.tilt = 0.12;
  klFish(c, f, ts);
}
function srEnd(why) {
  const g = SR.g; if (!g) return; cancelAnimationFrame(SR.raf); SR.raf = 0; srClear(); SR.g = null;
  const acc = g.tot ? g.ok / g.tot : 0, stars = g.tot >= 5 ? (acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : acc >= 0.4 ? 1 : 0) : 0, finished = why === "tamat" && g.ox > 0;
  if (finished) g.score += 300 + Math.round(g.ox * 3);
  let xp = 0, newBest = false, msg = "";
  if (g.tot >= 1) {
    const o = srBest(SR.tid), nb = { b: Math.max(o.b | 0, stars), hs: o.hs | 0, n: (o.n | 0) + 1, ok: (o.ok | 0) + g.ok, tot: (o.tot | 0) + g.tot, d: Math.max(o.d | 0, g.depth) };
    if (g.score > nb.hs) { nb.hs = g.score; newBest = true; } srMap()[SR.tid] = nb;
    try {
      if (g.tot >= 5) { const d = dayKey(), rec = JSON.parse(localStorage.getItem(SR_XP_KEY) || "null") || {}, used = rec.d === d ? rec.n | 0 : 0; xp = Math.max(0, Math.min(g.ok * 2, SR_XP_CAP - used)); if (xp > 0) { P.xp += xp; localStorage.setItem(SR_XP_KEY, JSON.stringify({ d: d, n: used + xp })); noteActive(); } else msg = "Kuota XP Selam Rahsia hari ini (" + SR_XP_CAP + ") sudah penuh."; }
      else msg = "XP diberi apabila sekurang-kurangnya 5 soalan dijawab.";
    } catch (e) { /* abaikan */ }
    saveP(); try { computeStand(); renderMe(); } catch (e) { /* abaikan */ }
  }
  blSnd("end");
  const r = SR.root; r.textContent = ""; r.classList.remove("pl");
  const x = el("button", { type: "button", class: "sr-x" }, "Tutup"); x.addEventListener("click", srClose);
  const rev = el("details", { class: "sr-rev" }); rev.append(el("summary", null, "Soalan untuk dikaji semula (" + g.wrong.length + ")"));
  if (!g.wrong.length) rev.append(el("p", null, "Tiada soalan salah. Tahniah!"));
  g.wrong.forEach((w, k) => { const d = el("div", { class: "sr-wq" }); d.append(qSet(el("b"), (k + 1) + ". " + w.q.q), el("div", { class: "a" }, null, "Jawapan betul: ", qSet(el("span"), w.ans))); if (w.q.e) d.append(qSet(el("div", { class: "e" }), w.q.e)); rev.append(d); });
  const again = el("button", { type: "button", class: "sr-go sm" }, "Selam semula"); again.addEventListener("click", srStart);
  const tank = el("button", { type: "button", class: "sr-go sm alt" }, "Lihat di Kolam Ikan"); tank.addEventListener("click", () => { KL.per = "selam"; srClose(); setView("kolam"); });
  const st = el("div", { class: "sr-stars", role: "img", "aria-label": stars + " daripada 3 bintang" }); for (let i = 0; i < 3; i++) st.appendChild(el("span", { class: i < stars ? "" : "off", "aria-hidden": "true" }, "★"));
  r.append(el("div", { class: "sr-bg" }), x, el("div", { class: "sr-wrap res" }, null,
    el("div", { class: "sr-kick" }, "KEPUTUSAN SELAM"), el("h1", null, finished ? "Harta karun ditemui!" : why === "oksigen" ? "Oksigen habis" : "Selam tamat"), st,
    el("div", { class: "sr-stats" }, null, ...[[g.score, "skor"], [g.depth + " m", "kedalaman"], [g.ok + " / " + g.tot, "betul"], ["×" + g.best, "siri terbaik"]].map((s) => el("div", null, null, el("b", null, String(s[0])), el("span", null, s[1])))),
    el("p", { class: "sr-lead" }, (newBest ? "Skor terbaik baharu! " : "") + (xp ? "Profil anda +" + xp + " XP. " : msg + " ") + "Jumlah skor Selam anda (" + srTotal().hs + ") kini naik di Kolam Ikan."),
    rev, el("div", { class: "sr-act" }, null, again, tank)));
  again.focus();
}
const SR_CSS = `
#srOv{position:fixed;inset:0;z-index:125;overflow:hidden;color:#fff;font-family:var(--font-body);background:#06142e}
#srOv[hidden]{display:none}
#srOv .sr-bg{position:fixed;inset:0;background:radial-gradient(ellipse at 20% 0%,rgba(41,230,255,.3),transparent 55%),radial-gradient(ellipse at 90% 100%,rgba(155,107,255,.3),transparent 55%),#06142e}
#srOv .sr-wrap{position:relative;max-width:900px;margin:0 auto;padding:60px 18px 40px;height:100%;overflow-y:auto}
#srOv .sr-kick{font:800 12px var(--font-body);letter-spacing:.2em;color:#7de3ff}
#srOv h1{font:900 clamp(32px,6vw,58px)/1.05 var(--font-display,var(--font-body));margin:6px 0 10px;color:#fff;text-shadow:0 0 24px rgba(41,230,255,.5)}
#srOv .sr-lead{opacity:.92;margin:8px 0 14px;font-size:17px;line-height:1.45}
#srOv .sr-note{opacity:.75;font-size:14px}
#srOv .sr-stats{display:flex;flex-wrap:wrap;gap:10px;margin:10px 0}
#srOv .sr-stats>div{min-width:110px;padding:10px 14px;border-radius:16px;background:rgba(255,255,255,.08);border:1px solid rgba(125,227,255,.35);display:grid;gap:2px}
#srOv .sr-stats b{font:800 26px var(--font-display,var(--font-body));color:#7de3ff}
#srOv .sr-stats span{font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.8}
#srOv .sr-go{min-height:52px;padding:10px 26px;border-radius:999px;border:0;cursor:pointer;font:800 17px var(--font-body);letter-spacing:.06em;color:#fff;background:linear-gradient(135deg,#9b6bff,#2f6bff);box-shadow:0 0 22px rgba(91,141,255,.55)}
#srOv .sr-go.sm{min-height:46px;padding:8px 20px;font-size:15px}
#srOv .sr-go.alt{background:rgba(41,230,255,.12);color:#7de3ff;border:1px solid rgba(125,227,255,.55);box-shadow:none}
#srOv .sr-go:focus-visible,#srOv .sr-a:focus-visible,#srOv .sr-ic:focus-visible,#srOv .sr-x:focus-visible{outline:3px solid #ffe27a;outline-offset:2px}
#srOv .sr-x{position:fixed;top:12px;right:12px;z-index:3;min-height:44px;padding:6px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.35);background:rgba(8,13,36,.8);color:#fff;font:700 14px var(--font-body);cursor:pointer}
#srOv .sr-act{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0}
#srOv .sr-stars{font-size:34px;letter-spacing:6px;color:#ffd23d;margin:4px 0}#srOv .sr-stars .off{color:rgba(255,255,255,.25)}
#srOv.pl{display:flex;flex-direction:column}
#srOv .sr-hud{position:relative;z-index:3;display:flex;gap:8px;align-items:center;padding:8px 10px;background:rgba(4,10,28,.85);border-bottom:1px solid rgba(125,227,255,.3)}
#srOv .sr-ox{flex:1;min-width:90px;display:grid;gap:3px}#srOv .sr-ox small,#srOv .sr-pill small{font:700 10px var(--font-body);letter-spacing:.16em;opacity:.8}
#srOv .sr-ox .bar{height:14px;border-radius:99px;background:rgba(255,255,255,.14);overflow:hidden}
#srOv .sr-ox .bar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#29e6ff,#b8ff3d);box-shadow:0 0 10px #29e6ff;transition:width .15s linear}
#srOv .sr-ox .bar.low i{background:linear-gradient(90deg,#ff5b7a,#ffb347);box-shadow:0 0 10px #ff5b7a}
#srOv .sr-pill{display:grid;gap:1px;min-width:60px;text-align:center}#srOv .sr-pill b{font:800 18px var(--font-display,var(--font-body));color:#7de3ff}
#srOv .sr-ic{width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.35);background:rgba(8,13,36,.8);color:#fff;font-size:16px;cursor:pointer}
#srOv .sr-stage{position:relative;flex:0 0 clamp(130px,26vh,300px);overflow:hidden}
#srOv .sr-cv{display:block}
#srOv .sr-play{flex:1;min-height:0;overflow-y:auto;padding:12px 14px 20px;background:rgba(4,10,28,.92);display:grid;align-content:start;gap:10px;max-width:900px;width:100%;margin:0 auto}
#srOv .sr-q{font:700 clamp(17px,2.6vw,24px)/1.4 var(--font-body);padding:6px 2px}
#srOv .sr-q:before{content:attr(data-n);display:inline-block;margin-right:10px;padding:2px 10px;border-radius:99px;background:rgba(41,230,255,.18);color:#7de3ff;font-size:13px}
#srOv .sr-ans{display:grid;grid-template-columns:1fr 1fr;gap:10px}@media(max-width:700px){#srOv .sr-ans{grid-template-columns:1fr}}
#srOv .sr-a{display:flex;gap:10px;align-items:center;text-align:left;min-height:56px;padding:10px 14px;border-radius:16px;border:1px solid rgba(125,227,255,.4);background:rgba(41,230,255,.08);color:#fff;font:600 17px/1.35 var(--font-body);cursor:pointer}
#srOv .sr-a em{flex:none;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font:800 14px var(--font-body);font-style:normal;background:#2f6bff}
#srOv .sr-a span{flex:1}#srOv .sr-a u{text-decoration:none;font-weight:900;font-size:20px}
#srOv .sr-a:hover:not(:disabled){background:rgba(41,230,255,.2)}
#srOv .sr-a.good{background:rgba(77,255,178,.25);border-color:#4dffb2}#srOv .sr-a.bad{background:rgba(255,91,122,.25);border-color:#ff5b7a}
#srOv .sr-fb{padding:12px 14px;border-radius:16px;display:grid;gap:6px;background:rgba(255,255,255,.08)}#srOv .sr-fb[hidden]{display:none}
#srOv .sr-fb.ok{border:1px solid #4dffb2}#srOv .sr-fb.bad{border:1px solid #ff5b7a}#srOv .sr-fb .h{font-weight:800;font-size:18px}#srOv .sr-fb .e{opacity:.9;font-size:15px}
#srOv .sr-rev{margin:10px 0;background:rgba(255,255,255,.06);border-radius:14px;padding:8px 14px}#srOv .sr-rev summary{cursor:pointer;font-weight:700;min-height:36px;display:flex;align-items:center}
#srOv .sr-wq{padding:8px 0;border-top:1px solid rgba(255,255,255,.12);display:grid;gap:4px}#srOv .sr-wq .e{opacity:.8;font-size:14px}
@media(max-width:500px){#srOv .sr-pill{min-width:0;padding:0 2px}#srOv .sr-pill small{font-size:8px;letter-spacing:.08em}#srOv .sr-pill b{font-size:15px}#srOv .sr-hud{gap:5px}}
@media(prefers-reduced-motion:reduce){#srOv *{transition:none!important}}
`;

