/* META DIDIK: modul dimuat apabila diperlukan (lihat modLoad dalam app.js). Bergantung pada pemboleh ubah global app.js. */
/* ---------- Slaid PdPc (v17.47): slaid pembentangan interaktif untuk setiap tajuk, dengan aktiviti PAK21 dan soalan KBAT ---------- */
const SL = { open: false, tid: "", slides: [], i: 0, root: null, notes: false, tmr: 0, mode: "view" };
const SL_ACT = [
  { n: "Fikir-Pasang-Kongsi", k: "Kolaboratif dan Komunikasi", m: 6, steps: (c) => ["Fikir: setiap murid berfikir seorang diri selama 1 minit tentang soalan “" + c.q + "”.", "Pasang: berbincang berpasangan dan padankan jawapan.", "Kongsi: dua pasangan bergabung, kemudian wakil melapor kepada kelas.", "Guru memberi maklum balas dan merumuskan isi utama."] },
  { n: "Kepala Bernombor", k: "Kolaboratif", m: 8, steps: (c) => ["Murid dalam kumpulan 4 orang diberi nombor 1 hingga 4.", "Guru mengemukakan soalan: “" + c.q + "”.", "Kumpulan berbincang supaya SEMUA ahli faham jawapan.", "Guru memanggil satu nombor secara rawak; murid itu menjawab bagi pihak kumpulan."] },
  { n: "Pusingan Galeri (Gallery Walk)", k: "Komunikasi dan Berfikir secara kritis", m: 12, steps: (c) => ["Setiap kumpulan menulis jawapan bagi “" + c.q + "” pada kertas mahjong.", "Tampal hasil di dinding kelas.", "Kumpulan bergerak ikut arah jam, membaca dan menambah komen atau tanda bintang pada hasil kumpulan lain.", "Kembali ke hasil asal, baca komen dan bentang penambahbaikan."] },
  { n: "Jigsaw (Kumpulan Pakar)", k: "Kolaboratif dan Komunikasi", m: 15, steps: (c) => ["Bahagikan isi kepada 4 bahagian: (1) " + c.A + " (2) " + c.B + " (3) " + c.C + " (4) kaitan dengan kehidupan.", "Kumpulan pakar: murid yang sama bahagian berbincang dan menjadi pakar.", "Kembali ke kumpulan asal dan ajar rakan tentang bahagian masing-masing.", "Kuiz ringkas: guru menguji kefahaman melalui Misi Jentik atau Latihan AR."] },
  { n: "Peta Pemikiran i-Think", k: "Kreativiti dan Berfikir secara kritis", m: 12, steps: (c) => ["Pilih peta i-Think yang sesuai (Peta Buih, Peta Pokok atau Peta Alir).", "Tulis “" + c.T + "” di tengah dan kembangkan isi utama daripada nota.", "Hiasi dengan warna, simbol dan contoh daripada kehidupan.", "Setiap kumpulan membentangkan peta; kelas menilai dengan 2 bintang dan 1 cadangan."] },
  { n: "Kerusi Panas (Hot Seat)", k: "Komunikasi dan Berfikir secara kritis", m: 10, steps: (c) => ["Seorang wakil kumpulan duduk di “kerusi panas” sebagai pakar topik “" + c.T + "”.", "Ahli kelas mengemukakan soalan berdasarkan isi: “" + c.A + "”.", "Pakar menjawab dengan hujah dan contoh.", "Guru dan kelas memberi penilaian serta membetulkan salah faham."] },
  { n: "Placemat (Papan Alas)", k: "Kolaboratif dan Berfikir secara kritis", m: 10, steps: (c) => ["Satu kertas dibahagikan kepada ruang setiap ahli dan satu ruang tengah.", "Setiap murid menulis pandangan sendiri tentang “" + c.q + "” dalam ruangnya.", "Putar kertas dan baca pandangan rakan.", "Bincang dan tulis jawapan sepakat kumpulan pada ruang tengah."] },
  { n: "Main Peranan dan Simulasi", k: "Kreativiti dan Komunikasi", m: 15, steps: (c) => ["Kumpulan memilih situasi yang berkait dengan “" + c.T + "” (contoh: " + c.A + ").", "Sediakan skrip ringkas 2 minit dan bahagikan peranan.", "Lakonkan di hadapan kelas.", "Kelas menilai: ketepatan isi, kebolehpercayaan dan nilai murni yang dipaparkan."] },
  { n: "Susun Kad (Card Sort)", k: "Berfikir secara kritis", m: 8, steps: (c) => ["Guru menyediakan kad isi penting, contohnya: “" + c.A + "”, “" + c.B + "”, “" + c.C + "”.", "Kumpulan menyusun dan mengelaskan kad mengikut kategori yang mereka tetapkan.", "Terangkan sebab susunan kepada kumpulan lain.", "Bandingkan dan betulkan bersama guru."] }
];
const SL_COL = { tw: "#2f9e8f", pi: "#3a7bd5", p3: "#8a5cd6", sj: "#c2793a", sc: "#2f9e5f", mt: "#c94a82", bm: "#c0392b", bi: "#2f6fd5", ba: "#c0455f" };
function slShort(s, n) {
  s = String(s || "").replace(/\s+/g, " ").trim(); n = n || 90;
  const m = s.match(/^(.+?[.;:!?])(\s|$)/); let o = m ? m[1] : s;
  if (o.length > n) { o = o.slice(0, n); o = o.replace(/\s+\S*$/, "") + "..."; } else o = o.replace(/[.;:]$/, "");
  return o;
}
function slHash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
function slKbat(t) {
  const out = [], T = t.nama, n = t.nota || [], A = slShort(n[0], 110), B = slShort(n[1] || n[0], 110), C = slShort(n[2] || n[1] || n[0], 110);
  try { kbPool().forEach((x) => { if (String(x.t).trim() === String(T).trim()) out.push({ aras: "Aras KBAT (soalan peperiksaan)", q: x.q, isi: x.isi || [] }); }); } catch (e) { /* abaikan */ }
  const gen = [
    { aras: "Menganalisis", q: "Bandingkan dan kaitkan dua isi penting dalam topik “" + T + "”: (i) " + A + " (ii) " + B + ". Huraikan bagaimana kedua-duanya saling berkait.", isi: [A, B, "Hubungan: salah satu menjadi sebab, asas atau kesan kepada yang lain", "Contoh daripada kehidupan atau peristiwa sebenar"] },
    { aras: "Menilai", q: "Seorang rakan berkata isi ini tidak lagi relevan pada masa kini: “" + A + "”. Adakah anda bersetuju? Wajarkan pendapat anda dengan sekurang-kurangnya dua hujah dan satu contoh.", isi: [A, "Hujah 1: kepentingan isi ini kepada diri, masyarakat atau negara", "Hujah 2: akibat jika isi ini diabaikan", "Contoh sebenar yang menyokong pendapat"] },
    { aras: "Mencipta", q: "Anda dilantik menjadi duta kempen sekolah bertajuk “" + T + "”. Cipta satu slogan dan satu pelan tindakan ringkas yang menerapkan isi: “" + C + "”. Jelaskan mengapa pelan anda berkesan.", isi: ["Slogan ringkas, mudah diingat dan berkait dengan topik", C, "Langkah tindakan yang praktikal (siapa, apa, bila)", "Kesan positif yang dijangka kepada murid dan masyarakat"] }
  ];
  return out.concat(gen).slice(0, 4);
}
function slTerms(n) {
  const out = [];
  (n || []).forEach((s) => { const m = String(s).match(/^(.{3,48}?)\s+(ialah|bermaksud|merujuk kepada)\s+(.+)$/i); if (m && !/[:;]/.test(m[1])) out.push({ t: m[1].replace(/^[A-Z]/, (c) => c), d: m[3].replace(/\.$/, "") }); });
  return out.slice(0, 6);
}
function slTimer(mins) {
  const w = el("div", { class: "sl-timer" }); let left = mins * 60, run = false;
  const d = el("b", { class: "sl-td" }, ""), btn = el("button", { type: "button", class: "sl-btn" }, "Mula"), rs = el("button", { type: "button", class: "sl-btn alt" }, "Set semula");
  const fmt = () => { d.textContent = Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0"); d.classList.toggle("low", left <= 10 && left > 0); };
  const stop = () => { run = false; clearInterval(SL.tmr); btn.textContent = left > 0 && left < mins * 60 ? "Sambung" : "Mula"; };
  btn.addEventListener("click", () => {
    if (run) { stop(); return; }
    if (left <= 0) left = mins * 60;
    run = true; btn.textContent = "Jeda"; clearInterval(SL.tmr);
    SL.tmr = setInterval(() => { left--; fmt(); if (left <= 5 && left > 0) arSnd("tick"); if (left <= 0) { stop(); arSnd("ok"); d.textContent = "Masa tamat!"; } }, 1000);
  });
  rs.addEventListener("click", () => { stop(); left = mins * 60; fmt(); btn.textContent = "Mula"; });
  w.append(el("span", null, "Pemasa"), d, btn, rs); fmt(); return w;
}
function slBuild(tid) {
  const t = TOPIK[tid]; if (!t) return [];
  const T = t.nama, sj = SUBJS[SUBJ], nota = (t.nota || []).filter(Boolean), qs = (BYTOPIK[tid] || []).slice().sort((a, b) => a.d - b.d);
  const A = slShort(nota[0], 70), B = slShort(nota[1] || nota[0], 70), C = slShort(nota[2] || nota[1] || nota[0], 70);
  const S = [], H = (cls, txt, ...kids) => el("div", { class: cls }, txt, ...kids);
  const bul = (host, items) => { const ul = el("ul", { class: "sl-ul" }); items.forEach((x) => { const li = el("li", { class: "rv" }); qSet(li, x); ul.appendChild(li); }); host.appendChild(ul); };
  const mcq = (host, q) => {
    const ord = shuffle([0, 1, 2, 3]), box = H("sl-opts"); let done = false;
    const fb = H("sl-fb"); fb.hidden = true;
    ord.forEach((oi, k) => {
      const b = el("button", { type: "button", class: "sl-opt" }, null, el("b", null, "ABCD"[k]), qSet(el("span"), q.o[oi]));
      b.addEventListener("click", () => {
        if (done) return; done = true; const good = oi === q.a;
        box.querySelectorAll(".sl-opt").forEach((x, j) => { x.disabled = true; x.classList.add(ord[j] === q.a ? "ok" : x === b ? "bad" : "dim"); });
        arSnd(good ? "ok" : "bad"); fb.hidden = false; fb.className = "sl-fb " + (good ? "ok" : "bad");
        fb.textContent = ""; fb.append(el("b", null, good ? "Betul! " : "Belum tepat. "), qSet(el("span"), q.e || ""));
      });
      box.appendChild(b);
    });
    host.append(qSet(H("sl-q"), q.q), box, fb);
  };
  // 1 Tajuk
  S.push({ kick: "SLAID PdPc • " + sj.subjek.toUpperCase(), tip: "Mulakan dengan menyatakan tajuk dan hasil pembelajaran. Masa cadangan: 2 minit.", build: (h) => { h.classList.add("cover"); h.append(H("sl-code", "Misi " + t.kod), qSet(el("h1"), T), H("sl-sub", t.buku || ""), H("sl-hint", "Tekan → atau Space untuk mula. Tekan N untuk nota guru, F untuk skrin penuh.")); } });
  // 2 Objektif
  S.push({ kick: "OBJEKTIF PEMBELAJARAN", tip: "Bacakan objektif dan semak di akhir sesi. Masa: 2 minit.", build: (h) => { h.append(H("sl-h", "Pada akhir sesi, murid dapat:")); bul(h, ["Menyatakan konsep dan isi penting bagi “" + T + "”.", "Menjelaskan: " + A, "Mengaitkan " + T + " dengan situasi dalam kehidupan sebenar.", "Menilai dan memberi hujah berdasarkan isi pembelajaran (KBAT)."]); h.append(H("sl-dskp", "Standard kandungan: " + (t.dskp || ""))); } });
  // 3 Set induksi
  if (qs.length) S.push({ kick: "SET INDUKSI • TEKA DAHULU", tip: "Murid meneka sebelum belajar. Tidak perlu betul; tujuannya menarik minat. Masa: 3 minit.", build: (h) => { h.append(H("sl-h", "Teka dahulu sebelum kita belajar!")); mcq(h, qs[0]); } });
  // 4 Isi penting
  for (let k = 0; k < nota.length; k += 3) {
    const part = nota.slice(k, k + 3), no = Math.floor(k / 3) + 1, tot = Math.ceil(nota.length / 3);
    S.push({ kick: "ISI PENTING " + no + " / " + tot, tip: "Klik atau tekan → untuk mendedahkan setiap isi, dan minta murid menerangkan semula dengan bahasa sendiri. Masa: 4 minit.", build: (h) => { h.append(H("sl-h", T)); bul(h, part); } });
  }
  // 5 Kad istilah
  const terms = slTerms(nota);
  if (terms.length >= 3) S.push({ kick: "KAD ISTILAH • KLIK UNTUK MEMBALIK", tip: "Murid cuba menerangkan istilah sebelum kad dibalik. Masa: 3 minit.", build: (h) => { h.append(H("sl-h", "Apakah maksudnya?")); const g = H("sl-cards"); terms.forEach((x) => { const c = H("sl-card"); const f = H("sl-face f"), b = H("sl-face b"); qSet(f, x.t); qSet(b, x.d); c.append(f, b); c.addEventListener("click", () => { c.classList.toggle("flip"); arSnd("hov"); }); g.appendChild(c); }); h.appendChild(g); } });
  // 6 Peta minda
  if (nota.length >= 3) S.push({ kick: "PETA MINDA INTERAKTIF", tip: "Klik setiap cabang untuk membuka penerangan. Boleh digunakan sebagai rumusan. Masa: 3 minit.", build: (h) => {
    const wrap = H("sl-mm"), det = H("sl-mmd", "Klik satu cabang untuk melihat isinya."), ring = H("sl-ring");
    ring.appendChild(qSet(H("sl-core"), T));
    nota.slice(0, 6).forEach((x, k) => { const b = el("button", { type: "button", class: "sl-node", style: "--n:" + k }); qSet(b, slShort(x, 38)); b.addEventListener("click", () => { wrap.querySelectorAll(".sl-node").forEach((y) => y.classList.toggle("on", y === b)); qSet(det, x); arSnd("hov"); }); ring.appendChild(b); });
    wrap.append(ring, det); h.append(H("sl-h", "Rumusan tajuk"), wrap); } });
  // 7 Semak kefahaman
  qs.slice(1, 4).forEach((q, k, a) => S.push({ kick: "SEMAK KEFAHAMAN " + (k + 1) + " / " + a.length, tip: "Klik jawapan atau gunakan Misi Jentik untuk kumpulan. Masa: 2 minit setiap soalan.", build: (h) => { mcq(h, q); } }));
  // 8 PAK21
  const base = slHash(tid + SUBJ), acts = [SL_ACT[base % SL_ACT.length], SL_ACT[(base + 3) % SL_ACT.length]];
  const Qs = ["Apakah kepentingan " + T + " dalam kehidupan kita?", "Bagaimanakah isi “" + A + "” dapat diamalkan atau difahami dalam situasi sebenar?"];
  acts.forEach((a, k) => S.push({ kick: "AKTIVITI PAK21 " + (k + 1) + " • " + a.k.toUpperCase(), tip: "Bahagikan murid kepada kumpulan 4 orang. Gunakan pemasa. Masa cadangan: " + a.m + " minit.", build: (h) => {
    h.append(H("sl-h", a.n)); const steps = a.steps({ T: T, A: A, B: B, C: C, q: Qs[k] });
    const ol = el("ol", { class: "sl-ol" }); steps.forEach((s) => { const li = el("li", { class: "rv" }); qSet(li, s); ol.appendChild(li); }); h.append(ol, slTimer(Math.max(2, Math.round(a.m / 2))), H("sl-hint", "Kemahiran abad ke-21: " + a.k + ". Masa cadangan: " + a.m + " minit.")); } }));
  // 9 Aktiviti permainan
  S.push({ kick: "AKTIVITI PAK21 • PEMBELAJARAN BERASASKAN PERMAINAN", tip: "Mulakan Misi Jentik mod berkumpulan atau Latihan AR dengan projektor. Masa: 10 minit.", build: (h) => {
    h.append(H("sl-h", "Cabaran kumpulan: jentik jawapan!"), H("sl-p", "Skuad bergilir menjawab soalan tajuk ini. Wakil skuad membuat isyarat OK untuk memilih dan menunjukkan tapak tangan untuk menjentik jawapan."));
    const row = H("sl-row"); const go = (txt, fn) => { const b = el("button", { type: "button", class: "sl-btn big" }, txt); b.addEventListener("click", fn); row.appendChild(b); };
    go("Mulakan Misi Jentik", () => { const id = tid; slClose(); jtOpen(id); }); go("Latihan AR berkumpulan", () => { const id = tid; slClose(); arOpen(id); }); h.append(row); } });
  // 10 KBAT
  slKbat(t).forEach((x, k, a) => S.push({ kick: "SOALAN KBAT " + (k + 1) + " / " + a.length + " • " + x.aras.toUpperCase(), tip: "Beri masa berfikir 3 minit, bincang dalam kumpulan, kemudian dedahkan cadangan isi. Jawapan murid yang berhujah baik wajar dihargai walaupun berbeza.", build: (h) => {
    h.append(H("sl-lv", x.aras), qSet(H("sl-q big"), x.q), slTimer(3), H("sl-h2", "Cadangan isi jawapan"));
    const ul = el("ul", { class: "sl-ul sm" }); (x.isi.length ? x.isi : ["Berikan hujah, contoh dan kesimpulan."]).forEach((s) => { const li = el("li", { class: "rv" }); qSet(li, s); ul.appendChild(li); }); h.appendChild(ul); } }));
  // 11 Refleksi
  S.push({ kick: "REFLEKSI • TIKET KELUAR 3-2-1", tip: "Murid menulis pada kertas kecil atau buku nota dan menyerahkannya sebelum keluar. Masa: 4 minit.", build: (h) => {
    h.append(H("sl-h", "Tiket keluar"));
    const ul = el("ul", { class: "sl-ul" }); ["3 perkara baharu yang saya pelajari tentang " + T, "2 perkara yang saya ingin tahu lebih lanjut", "1 soalan yang masih membingungkan saya"].forEach((s) => { const li = el("li", { class: "rv" }, s); ul.appendChild(li); }); h.appendChild(ul); } });
  // 12 Penutup
  S.push({ kick: "PENUTUP", tip: "Ulangkaji dengan permainan di rumah. Murid boleh berlatih lagi dalam Misi Tempur.", build: (h) => {
    h.append(H("sl-h", "Terima kasih! Teruskan berlatih."), H("sl-p", "Mainkan misi ini untuk mengukuhkan kefahaman."));
    const row = H("sl-row"); const go = (txt, fn) => { const b = el("button", { type: "button", class: "sl-btn big" }, txt); b.addEventListener("click", fn); row.appendChild(b); };
    go("Misi Tempur", () => { const id = tid; slClose(); try { openBrief(id, "solo"); } catch (e) { selectMission(id); } }); go("Misi Jentik", () => { const id = tid; slClose(); jtOpen(id); }); go("Tutup slaid", slClose); h.append(row); } });
  return S;
}
function slRoot() {
  if (SL.root) return SL.root;
  const r = el("div", { id: "slOv", role: "dialog", "aria-modal": "true", "aria-label": "Slaid PdPc" });
  document.body.appendChild(r); SL.root = r; return r;
}
function slOpen(tid) {
  SL.tid = tid; SL.slides = slBuild(tid); SL.i = 0; SL.open = true; SL.mode = "view";
  document.body.classList.add("ar-lock");
  const r = slRoot(); r.hidden = false; r.style.setProperty("--sl", SL_COL[SUBJ] || "#2f9e8f"); arFsBtn(false);
  try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) { /* abaikan */ }
  slRender(); window.addEventListener("keydown", slKey, true);
}
function slClose() {
  clearInterval(SL.tmr); SL.open = false;
  if (SL.root) { SL.root.hidden = true; SL.root.textContent = ""; }
  document.body.classList.remove("ar-lock");
  try { if (arFsOn()) (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) { /* abaikan */ }
  window.removeEventListener("keydown", slKey, true);
}
function slRender() {
  clearInterval(SL.tmr);
  const r = slRoot(), S = SL.slides, s = S[SL.i]; r.textContent = "";
  if (!s) return;
  const t = TOPIK[SL.tid];
  const x = el("button", { type: "button", class: "sl-x", "aria-label": "Tutup slaid" }, "Tutup"); x.addEventListener("click", slClose);
  const fs = el("button", { type: "button", class: "sl-x fs" }, arFsOn() ? "Keluar skrin penuh" : "Skrin penuh"); fs.addEventListener("click", () => { arFsToggle(); setTimeout(() => { fs.textContent = arFsOn() ? "Keluar skrin penuh" : "Skrin penuh"; }, 300); });
  const nt = el("button", { type: "button", class: "sl-x nt" }, SL.notes ? "Sembunyi nota guru" : "Nota guru"); nt.addEventListener("click", () => { SL.notes = !SL.notes; slRender(); });
  const stage = el("div", { class: "sl-stage" }); s.build(stage);
  const rv = stage.querySelectorAll(".rv"); stage.dataset.shown = "0";
  rv.forEach((e) => e.classList.remove("show"));
  const prev = el("button", { type: "button", class: "sl-nav", "aria-label": "Sebelum" }, "‹"), next = el("button", { type: "button", class: "sl-nav r", "aria-label": "Seterusnya" }, "›");
  prev.addEventListener("click", slPrev); next.addEventListener("click", slNext);
  const bar = el("div", { class: "sl-bar" }, null, el("i", { style: "width:" + Math.round((SL.i + 1) / S.length * 100) + "%" }));
  const dots = el("div", { class: "sl-dots" }); S.forEach((q, k) => { const d = el("button", { type: "button", class: "sl-dot" + (k === SL.i ? " on" : ""), "aria-label": "Slaid " + (k + 1) }); d.addEventListener("click", () => { SL.i = k; slRender(); }); dots.appendChild(d); });
  const jump = el("button", { type: "button", class: "sl-x idx" }, "Senarai slaid"); jump.addEventListener("click", slIndex);
  r.append(el("div", { class: "sl-bg" }), el("div", { class: "sl-hd" }, null, el("div", { class: "sl-kick" }, s.kick), el("div", { class: "sl-tools" }, null, jump, nt, fs, x)), bar,
    el("div", { class: "sl-main" }, null, prev, stage, next),
    slNotes(s),
    el("div", { class: "sl-ft" }, null, el("span", null, (SL.i + 1) + " / " + S.length + " • " + (t ? t.nama : "")), dots));
  SL.stage = stage;
  if (rv.length && SL.i === 0) { /* tiada */ }
}
function slNotes(s) { const d = el("div", { class: "sl-notes" }, "Nota guru: " + (s.tip || "")); d.hidden = !SL.notes; return d; }
function slNext() {
  const st = SL.stage; if (!st) return;
  const rv = st.querySelectorAll(".rv"), shown = st.querySelectorAll(".rv.show").length;
  if (shown < rv.length) { rv[shown].classList.add("show"); arSnd("hov"); return; }
  if (SL.i < SL.slides.length - 1) { SL.i++; slRender(); }
}
function slPrev() {
  const st = SL.stage; if (!st) return;
  const shown = st.querySelectorAll(".rv.show"); if (shown.length) { shown[shown.length - 1].classList.remove("show"); return; }
  if (SL.i > 0) { SL.i--; slRender(); st && SL.stage.querySelectorAll(".rv").forEach((e) => e.classList.add("show")); }
}
function slIndex() {
  const r = SL.root, old = r.querySelector(".sl-idx"); if (old) { old.remove(); return; }
  const w = el("div", { class: "sl-idx" }, null, el("h3", null, "Senarai slaid"));
  SL.slides.forEach((s, k) => { const b = el("button", { type: "button", class: "sl-ix" + (k === SL.i ? " on" : "") }, (k + 1) + ". " + s.kick); b.addEventListener("click", () => { SL.i = k; slRender(); }); w.appendChild(b); });
  r.appendChild(w);
}
function slKey(e) {
  if (!SL.open) return;
  const k = e.key;
  if (k === "Escape") { slClose(); e.preventDefault(); e.stopPropagation(); return; }
  if (e.target && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
  if (k === "ArrowRight" || k === "PageDown" || k === " " || k === "Enter") { if (e.target && e.target.tagName === "BUTTON" && (k === " " || k === "Enter")) return; slNext(); e.preventDefault(); }
  else if (k === "ArrowLeft" || k === "PageUp" || k === "Backspace") { slPrev(); e.preventDefault(); }
  else if (k === "n" || k === "N") { SL.notes = !SL.notes; slRender(); }
  else if (k === "f" || k === "F") { arFsToggle(); }
  else if (k === "Home") { SL.i = 0; slRender(); } else if (k === "End") { SL.i = SL.slides.length - 1; slRender(); }
}
(function () { /* leret (swipe) pada skrin sentuh */
  let x0 = null;
  document.addEventListener("touchstart", (e) => { if (SL.open && e.touches.length === 1 && !(e.target.closest && e.target.closest("button,.sl-card,.sl-node"))) x0 = e.touches[0].clientX; else x0 = null; }, { passive: true });
  document.addEventListener("touchend", (e) => { if (x0 == null || !SL.open) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 60) { if (dx < 0) slNext(); else slPrev(); } }, { passive: true });
})();
/* pemilih tajuk: butang khusus untuk guru atau murid memilih slaid mana-mana tajuk pada peta */
function slPick() {
  const r = slRoot(); r.hidden = false; r.textContent = ""; SL.open = true; SL.mode = "pick";
  document.body.classList.add("ar-lock"); r.style.setProperty("--sl", SL_COL[SUBJ] || "#2f9e8f");
  const x = el("button", { type: "button", class: "sl-x", style: "position:fixed;top:12px;right:12px;z-index:5" }, "Tutup"); x.addEventListener("click", slClose);
  const wrap = el("div", { class: "sl-pk" }, null, el("div", { class: "sl-kick" }, "SLAID PdPc"), el("h1", null, "Pilih tajuk untuk dibentangkan"), el("p", { class: "sl-sub" }, SUBJS[SUBJ].subjek + ". Setiap slaid ada isi penting, aktiviti PAK21 dan soalan KBAT. Gunakan projektor atau kongsi skrin."));
  const q = el("input", { type: "search", placeholder: "Cari tajuk...", "aria-label": "Cari tajuk", class: "sl-search" }); wrap.appendChild(q);
  const list = el("div", { class: "sl-pl" });
  const draw = () => {
    list.textContent = ""; const f = q.value.trim().toLowerCase();
    DATA.tema.forEach((tm) => {
      const ts = DATA.topik.filter((t) => t.tema === tm.id && (!f || t.nama.toLowerCase().indexOf(f) >= 0 || String(t.kod).indexOf(f) >= 0)); if (!ts.length) return;
      const h = el("h4"); const i = el("i"); i.style.background = tm.warna; h.append(i, document.createTextNode(SUBJ !== "tw" ? "Tingkatan " + tm.tingkatan + " " + tm.nama : "Tingkatan " + tm.tingkatan + " Tema " + tm.id.split("-")[1] + ": " + tm.nama)); list.appendChild(h);
      ts.forEach((t) => { const b = el("button", { type: "button", class: "sl-pi" }); const c = el("span", { class: "c" }, t.kod); c.style.background = tm.warna; const n = el("span", { class: "n" }); qSet(n, t.nama); b.append(c, n); b.addEventListener("click", () => { r.textContent = ""; r.hidden = false; window.removeEventListener("keydown", slKey, true); slOpen(t.id); }); list.appendChild(b); });
    });
  };
  q.addEventListener("input", draw); draw(); wrap.appendChild(list);
  r.append(el("div", { class: "sl-bg" }), x, wrap);
  window.addEventListener("keydown", slKey, true);
}
/* ---------- /Slaid PdPc */
/* ---------- Slaid PdPc (v17.64): reka bentuk infografik gaya 3D Clay Anime untuk semua tajuk ---------- */
const SL_PAL = [
  { bg: "#FFE3E6", c1: "#FFC9D1", c2: "#FF7A8A" }, { bg: "#DDF3FF", c1: "#BDE5FF", c2: "#5BB8F5" }, { bg: "#DFF7EC", c1: "#C6F3E0", c2: "#6FD6B0" },
  { bg: "#FFF0C2", c1: "#FFE9A8", c2: "#FFC94D" }, { bg: "#EDE4FF", c1: "#DCCBFF", c2: "#9F82EA" }, { bg: "#FFE9CF", c1: "#FFD9AE", c2: "#FFA95C" }
];
let SL_MID = 0;
function slMascots(kind, w) {
  const p = "m" + (++SL_MID) + "_", girl = kind !== "boy", boy = kind !== "girl", d = el("div", { class: "sl-mas", role: "img", "aria-label": "Maskot murid kartun 3D tanah liat" });
  const defs = '<defs><radialGradient id="' + p + 'sk" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#FFEBDD"/><stop offset=".6" stop-color="#FFCDAA"/><stop offset="1" stop-color="#EFA47C"/></radialGradient><radialGradient id="' + p + 'tu" cx=".3" cy=".25" r=".9"><stop offset="0" stop-color="#8FD3FF"/><stop offset=".65" stop-color="#4FA8EA"/><stop offset="1" stop-color="#3A82C8"/></radialGradient><radialGradient id="' + p + 'sh" cx=".3" cy=".2" r=".9"><stop offset="0" stop-color="#FFB0BC"/><stop offset=".7" stop-color="#FF7A8A"/><stop offset="1" stop-color="#E25570"/></radialGradient><radialGradient id="' + p + 'mn" cx=".3" cy=".2" r=".9"><stop offset="0" stop-color="#B8F0DC"/><stop offset=".7" stop-color="#6FD6B0"/><stop offset="1" stop-color="#3FB48C"/></radialGradient><radialGradient id="' + p + 'sg" cx=".3" cy=".2" r=".9"><stop offset="0" stop-color="#5A4A78"/><stop offset="1" stop-color="#2A1E44"/></radialGradient><radialGradient id="' + p + 'sn" cx=".3" cy=".2" r=".9"><stop offset="0" stop-color="#FFE08A"/><stop offset="1" stop-color="#F5A81C"/></radialGradient></defs>';
  const G = '<g transform="translate(' + (boy ? 20 : 200) + ',270)"><rect x="85" y="285" width="230" height="110" rx="55" fill="url(#' + p + 'sh)"/><circle cx="200" cy="190" r="150" fill="url(#' + p + 'tu)"/><ellipse cx="200" cy="205" rx="104" ry="100" fill="url(#' + p + 'sk)"/><path d="M96 190 Q200 70 304 190 Q200 125 96 190Z" fill="url(#' + p + 'tu)"/><ellipse cx="156" cy="212" rx="21" ry="29" fill="#2B1B4A"/><ellipse cx="244" cy="212" rx="21" ry="29" fill="#2B1B4A"/><ellipse cx="156" cy="220" rx="14" ry="18" fill="#6C4BC4"/><ellipse cx="244" cy="220" rx="14" ry="18" fill="#6C4BC4"/><circle cx="149" cy="202" r="8" fill="#fff"/><circle cx="163" cy="226" r="4" fill="#fff"/><circle cx="237" cy="202" r="8" fill="#fff"/><circle cx="251" cy="226" r="4" fill="#fff"/><path d="M135 174 Q156 162 178 172M222 172 Q244 162 265 174" stroke="#4A2E24" stroke-width="6" fill="none" stroke-linecap="round"/><ellipse cx="122" cy="248" rx="20" ry="11" fill="#FF7F9A" opacity=".55"/><ellipse cx="278" cy="248" rx="20" ry="11" fill="#FF7F9A" opacity=".55"/><path d="M184 258 Q200 276 216 258" stroke="#B2475C" stroke-width="6" fill="none" stroke-linecap="round"/><ellipse cx="150" cy="82" rx="46" ry="16" fill="#fff" opacity=".35" transform="rotate(-20 150 82)"/></g>';
  const B = '<g transform="translate(' + (girl ? 340 : 200) + ',290)"><rect x="85" y="285" width="230" height="110" rx="55" fill="url(#' + p + 'mn)"/><circle cx="200" cy="205" r="108" fill="url(#' + p + 'sk)"/><path d="M96 190 Q96 100 200 98 Q304 100 304 190 Q250 140 200 150 Q150 140 96 190Z" fill="#2A1E44"/><rect x="118" y="46" width="164" height="84" rx="34" fill="url(#' + p + 'sg)"/><rect x="118" y="108" width="164" height="14" rx="7" fill="url(#' + p + 'sn)"/><ellipse cx="156" cy="214" rx="21" ry="29" fill="#2B1B4A"/><ellipse cx="244" cy="214" rx="21" ry="29" fill="#2B1B4A"/><ellipse cx="156" cy="222" rx="14" ry="18" fill="#3FA06E"/><ellipse cx="244" cy="222" rx="14" ry="18" fill="#3FA06E"/><circle cx="149" cy="204" r="8" fill="#fff"/><circle cx="163" cy="228" r="4" fill="#fff"/><circle cx="237" cy="204" r="8" fill="#fff"/><circle cx="251" cy="228" r="4" fill="#fff"/><path d="M133 176 Q156 166 178 176M222 176 Q244 166 267 176" stroke="#2A1E44" stroke-width="7" fill="none" stroke-linecap="round"/><ellipse cx="120" cy="252" rx="20" ry="11" fill="#FF7F9A" opacity=".5"/><ellipse cx="280" cy="252" rx="20" ry="11" fill="#FF7F9A" opacity=".5"/><path d="M180 262 Q200 286 220 262 Q200 270 180 262Z" fill="#B2475C" stroke="#B2475C" stroke-width="5" stroke-linejoin="round"/></g>';
  const star = '<g transform="translate(120,110)"><path d="M0 -46 L14 -14 L48 -12 L22 10 L31 44 L0 24 L-31 44 L-22 10 L-48 -12 L-14 -14Z" fill="url(#' + p + 'sn)" stroke="#fff" stroke-opacity=".5" stroke-width="5" stroke-linejoin="round"/></g><circle cx="680" cy="130" r="22" fill="url(#' + p + 'sh)"/><circle cx="700" cy="520" r="16" fill="url(#' + p + 'mn)"/>';
  d.innerHTML = '<svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:' + (w || 360) + 'px;max-width:100%;height:auto">' + defs + '<ellipse cx="400" cy="772" rx="320" ry="20" fill="#3B2A5A" opacity=".16"/>' + (girl ? G : "") + (boy ? B : "") + star + '</svg>';
  return d;
}
function slRange(n, np, k) { const base = Math.floor(n / np), ex = n % np; let a = 0; for (let i = 0; i < k; i++) a += base + (i < ex ? 1 : 0); return [a, a + base + (k < ex ? 1 : 0)]; }
function slParts(tid) { const t = TOPIK[tid], n = t ? (t.nota || []).filter(Boolean).length : 0; return Math.max(2, Math.ceil(n / 3)); }
function slObjs(tid, part) {
  const t = TOPIK[tid]; if (!t) return []; const all = (t.nota || []).filter(Boolean), r = slRange(all.length, slParts(tid), part), V = ["Menyatakan", "Menjelaskan", "Menghuraikan"];
  return all.slice(r[0], r[1]).slice(0, 3).map((x, k) => V[k % 3] + ": " + slShort(x, 80));
}
function slBuild(tid, part) {
  const t0 = TOPIK[tid]; if (!t0) return [];
  const NP = slParts(tid), PT = clamp(part | 0, 0, NP - 1), allN = (t0.nota || []).filter(Boolean), rg = slRange(allN.length, NP, PT);
  const t = Object.assign({}, t0, { nota: allN.slice(rg[0], rg[1]) });
  const T = t.nama, sj = SUBJS[SUBJ], nota = t.nota.slice(), qsAll = (BYTOPIK[tid] || []).slice().sort((a, b) => a.d - b.d), qsP = qsAll.filter((x, i) => i % NP === PT), qs = qsP.length >= 4 ? qsP : qsAll;
  const A = slShort(nota[0], 70), B = slShort(nota[1] || nota[0], 70), C = slShort(nota[2] || nota[1] || nota[0], 70);
  const S = [], H = (cls, txt, ...kids) => el("div", { class: cls }, txt, ...kids);
  const pal = (i) => SL_PAL[i % SL_PAL.length], sty = (i) => "--bg:" + pal(i).bg + ";--c1:" + pal(i).c1 + ";--c2:" + pal(i).c2;
  const clay = (i, no, body, rv) => { const c = el("div", { class: "sl-cl" + (rv ? " rv" : ""), style: sty(i) }); c.append(el("span", { class: "sl-bd" }, String(no)), body); return c; };
  const txtOf = (x, big) => { const d = el("div", { class: "sl-ct" + (big ? " big" : "") }); qSet(d, x); return d; };
  const bul = (host, items, big) => { const g = H("sl-stack"); items.forEach((x, k) => g.appendChild(clay(k, k + 1, txtOf(x, big), true))); host.appendChild(g); };
  const cut = (s, n) => { s = String(s || "").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n).replace(/\s+\S*$/, "") + "..." : s; };
  const mcq = (host, q) => {
    const ord = shuffle([0, 1, 2, 3]), box = H("sl-opts"); let done = false;
    const fb = H("sl-fb"); fb.hidden = true;
    ord.forEach((oi, k) => {
      const b = el("button", { type: "button", class: "sl-opt" }, null, el("b", null, "ABCD"[k]), qSet(el("span"), q.o[oi]));
      b.addEventListener("click", () => {
        if (done) return; done = true; const good = oi === q.a;
        box.querySelectorAll(".sl-opt").forEach((x, j) => { x.disabled = true; x.classList.add(ord[j] === q.a ? "ok" : x === b ? "bad" : "dim"); });
        arSnd(good ? "ok" : "bad"); fb.hidden = false; fb.className = "sl-fb " + (good ? "ok" : "bad");
        fb.textContent = ""; fb.append(el("b", null, good ? "Betul! " : "Belum tepat. "), qSet(el("span"), q.e || ""));
      });
      box.appendChild(b);
    });
    host.append(qSet(H("sl-q"), q.q), box, fb);
  };
  // 1 Tajuk
  S.push({ kick: "SLAID PdPc • " + sj.subjek.toUpperCase(), tip: "Mulakan dengan menyatakan tajuk dan hasil pembelajaran. Masa cadangan: 2 minit.", build: (h) => { h.classList.add("cover"); const L = H("sl-cv"); L.append(H("sl-code", "Misi " + t.kod + " • Slaid " + (PT + 1) + " / " + NP), qSet(el("h1"), T), H("sl-sub", t.buku || ""), H("sl-chips", null, ...["Infografik", "Kuiz interaktif", "Aktiviti PAK21", "Soalan KBAT"].map((x, k) => { const c = el("span", { class: "sl-chip", style: sty(k) }, x); return c; })), H("sl-hint", "Tekan → atau Space untuk mula. Tekan N untuk nota guru, F untuk skrin penuh.")); h.append(L, slMascots("pair", 380)); } });
  // 2 Objektif
  S.push({ kick: "OBJEKTIF PEMBELAJARAN", tip: "Bacakan objektif dan semak di akhir sesi. Masa: 2 minit.", build: (h) => { h.append(H("sl-h", "Pada akhir sesi, murid dapat:")); bul(h, slObjs(tid, PT)); h.append(H("sl-dskp", "Standard kandungan: " + (t.dskp || ""))); } });
  // 3 Set induksi
  if (qs.length) S.push({ kick: "SET INDUKSI • TEKA DAHULU", tip: "Murid meneka sebelum belajar. Tidak perlu betul; tujuannya menarik minat. Masa: 3 minit.", build: (h) => { h.append(H("sl-h", "Teka dahulu sebelum kita belajar!")); mcq(h, qs[0]); } });
  // 4 Infografik ringkasan
  if (nota.length >= 2) S.push({ kick: "INFOGRAFIK • TAJUK SEKILAS PANDANG", tip: "Beri murid 1 minit untuk membaca semua kad, kemudian minta mereka memilih satu kad dan menerangkan semula. Masa: 3 minit.", build: (h) => {
    const hub = H("sl-hub"); hub.append(el("span", { class: "sl-hk" }, "TAJUK"), qSet(el("b"), T), el("small", null, nota.length + " isi penting"));
    const g = H("sl-info"); nota.slice(0, 6).forEach((x, k) => { const lead = slShort(x, 64), rest = x.length > lead.length + 6 ? cut(x, 190) : ""; const b = H("sl-tx"); const hh = el("b"); qSet(hh, lead); b.appendChild(hh); if (rest) { const p = el("p"); qSet(p, rest); b.appendChild(p); } g.appendChild(clay(k, k + 1, b, false)); });
    h.append(H("sl-h", "Isi penting sekilas pandang"), hub, g); } });
  // 5 Isi penting (butiran)
  for (let k = 0; k < nota.length; k += 3) {
    const part = nota.slice(k, k + 3), no = Math.floor(k / 3) + 1, tot = Math.ceil(nota.length / 3);
    S.push({ kick: "ISI PENTING " + no + " / " + tot, tip: "Klik atau tekan → untuk mendedahkan setiap isi, dan minta murid menerangkan semula dengan bahasa sendiri. Masa: 4 minit.", build: (h) => { h.append(H("sl-h", T)); const g = H("sl-stack"); part.forEach((x, j) => g.appendChild(clay(k + j, k + j + 1, txtOf(x, true), true))); h.appendChild(g); } });
  }
  // 6 Kad istilah
  const terms = slTerms(nota);
  if (terms.length >= 3) S.push({ kick: "KAD ISTILAH • KLIK UNTUK MEMBALIK", tip: "Murid cuba menerangkan istilah sebelum kad dibalik. Masa: 3 minit.", build: (h) => { h.append(H("sl-h", "Apakah maksudnya?")); const g = H("sl-cards"); terms.forEach((x, k) => { const c = H("sl-card"); c.style.cssText = sty(k); const f = H("sl-face f"), b = H("sl-face b"); qSet(f, x.t); qSet(b, x.d); c.append(f, b); c.addEventListener("click", () => { c.classList.toggle("flip"); arSnd("hov"); }); g.appendChild(c); }); h.appendChild(g); } });
  // 7 Infografik aliran
  if (nota.length >= 3) S.push({ kick: "INFOGRAFIK • ALIRAN ISI", tip: "Minta murid menerangkan hubungan antara setiap langkah atau isi dalam aliran ini. Masa: 3 minit.", build: (h) => {
    h.append(H("sl-h", "Aliran isi tajuk")); const f = H("sl-flow");
    nota.slice(0, 5).forEach((x, k, a) => { const c = el("div", { class: "sl-fs rv", style: sty(k) }); c.append(el("span", { class: "sl-bd" }, String(k + 1))); const d = el("div"); qSet(d, cut(slShort(x, 120), 120)); c.appendChild(d); f.appendChild(c); if (k < a.length - 1) f.appendChild(el("span", { class: "sl-ar rv", "aria-hidden": "true" }, "›")); });
    h.append(f, H("sl-hint", "Klik atau tekan → untuk mendedahkan langkah seterusnya.")); } });
  // 8 Peta minda
  if (nota.length >= 3) S.push({ kick: "PETA MINDA INTERAKTIF", tip: "Klik setiap cabang untuk membuka penerangan. Boleh digunakan sebagai rumusan. Masa: 3 minit.", build: (h) => {
    const wrap = H("sl-mm"), det = H("sl-mmd", "Klik satu cabang untuk melihat isinya."), ring = H("sl-ring");
    ring.appendChild(qSet(H("sl-core"), T));
    nota.slice(0, 6).forEach((x, k) => { const b = el("button", { type: "button", class: "sl-node", style: "--n:" + k + ";" + sty(k) }); qSet(b, slShort(x, 38)); b.addEventListener("click", () => { wrap.querySelectorAll(".sl-node").forEach((y) => y.classList.toggle("on", y === b)); qSet(det, x); arSnd("hov"); }); ring.appendChild(b); });
    wrap.append(ring, det); h.append(H("sl-h", "Rumusan tajuk"), wrap); } });
  // 9 Semak kefahaman
  qs.slice(1, 4).forEach((q, k, a) => S.push({ kick: "SEMAK KEFAHAMAN " + (k + 1) + " / " + a.length, tip: "Klik jawapan atau gunakan Misi Jentik untuk kumpulan. Masa: 2 minit setiap soalan.", build: (h) => { mcq(h, q); } }));
  // 10 PAK21
  const base = slHash(tid + SUBJ), acts = [SL_ACT[base % SL_ACT.length], SL_ACT[(base + 3) % SL_ACT.length]];
  const Qs = ["Apakah kepentingan " + T + " dalam kehidupan kita?", "Bagaimanakah isi “" + A + "” dapat diamalkan atau difahami dalam situasi sebenar?"];
  acts.forEach((a, k) => S.push({ kick: "AKTIVITI PAK21 " + (k + 1) + " • " + a.k.toUpperCase(), tip: "Bahagikan murid kepada kumpulan 4 orang. Gunakan pemasa. Masa cadangan: " + a.m + " minit.", build: (h) => {
    h.append(H("sl-h", a.n)); const steps = a.steps({ T: T, A: A, B: B, C: C, q: Qs[k] }); const g = H("sl-stack");
    steps.forEach((s, j) => g.appendChild(clay(j + k * 2, j + 1, txtOf(s, false), true))); h.append(g, slTimer(Math.max(2, Math.round(a.m / 2))), H("sl-hint", "Kemahiran abad ke-21: " + a.k + ". Masa cadangan: " + a.m + " minit.")); } }));
  // 11 Aktiviti permainan
  S.push({ kick: "AKTIVITI PAK21 • PEMBELAJARAN BERASASKAN PERMAINAN", tip: "Mulakan Misi Jentik mod berkumpulan atau Latihan AR dengan projektor. Masa: 10 minit.", build: (h) => {
    h.append(H("sl-h", "Cabaran kumpulan: jentik jawapan!"), H("sl-p", "Skuad bergilir menjawab soalan tajuk ini. Wakil skuad membuat isyarat OK untuk memilih dan menunjukkan tapak tangan untuk menjentik jawapan."));
    const row = H("sl-row"); const go = (txt, fn) => { const b = el("button", { type: "button", class: "sl-btn big" }, txt); b.addEventListener("click", fn); row.appendChild(b); };
    go("Mulakan Misi Jentik", () => { const id = tid; slClose(); jtOpen(id); }); go("Latihan AR berkumpulan", () => { const id = tid; slClose(); arOpen(id); }); h.append(row, slMascots("boy", 220)); } });
  // 12 KBAT
  (() => { const all = slKbat(t); const g = PT > 0 ? all.filter((x) => !/^Aras KBAT/.test(x.aras)) : all; return (g.length ? g : all).slice(0, 3); })().forEach((x, k, a) => S.push({ kick: "SOALAN KBAT " + (k + 1) + " / " + a.length + " • " + x.aras.toUpperCase(), tip: "Beri masa berfikir 3 minit, bincang dalam kumpulan, kemudian dedahkan cadangan isi. Jawapan murid yang berhujah baik wajar dihargai walaupun berbeza.", build: (h) => {
    h.append(H("sl-lv", x.aras), qSet(H("sl-q big"), x.q), slTimer(3), H("sl-h2", "Cadangan isi jawapan"));
    const g = H("sl-stack sm"); (x.isi.length ? x.isi : ["Berikan hujah, contoh dan kesimpulan."]).forEach((s, j) => g.appendChild(clay(j, j + 1, txtOf(s, false), true))); h.appendChild(g); } }));
  // 13 Refleksi
  S.push({ kick: "REFLEKSI • TIKET KELUAR 3-2-1", tip: "Murid menulis pada kertas kecil atau buku nota dan menyerahkannya sebelum keluar. Masa: 4 minit.", build: (h) => {
    h.append(H("sl-h", "Tiket keluar")); const g = H("sl-stack");
    [["3", "perkara baharu yang saya pelajari tentang " + T], ["2", "perkara yang saya ingin tahu lebih lanjut"], ["1", "soalan yang masih membingungkan saya"]].forEach((x, k) => g.appendChild(clay(k, x[0], txtOf("Tulis " + x[0] + " " + x[1], true), true))); h.appendChild(g); } });
  // 14 Penutup
  S.push({ kick: "PENUTUP", tip: "Ulangkaji dengan permainan di rumah. Murid boleh berlatih lagi dalam Misi Tempur.", build: (h) => {
    h.classList.add("cover"); const L = H("sl-cv"); L.append(H("sl-h", "Terima kasih! Teruskan berlatih."), H("sl-p", "Mainkan misi ini untuk mengukuhkan kefahaman."));
    const row = H("sl-row"); const go = (txt, fn) => { const b = el("button", { type: "button", class: "sl-btn big" }, txt); b.addEventListener("click", fn); row.appendChild(b); };
    go("Misi Tempur", () => { const id = tid; slClose(); try { openBrief(id, "solo"); } catch (e) { selectMission(id); } }); go("Misi Jentik", () => { const id = tid; slClose(); jtOpen(id); }); go("Tutup slaid", slClose); L.appendChild(row); h.append(L, slMascots("pair", 340)); } });
  return S;
}

function slOpen(tid, part) {
  if (part == null && slParts(tid) > 1) return slPickPart(tid);
  SL.tid = tid; SL.part = part | 0; SL.slides = slBuild(tid, SL.part); SL.i = 0; SL.open = true; SL.mode = "view";
  document.body.classList.add("ar-lock");
  const r = slRoot(); r.hidden = false; r.style.setProperty("--sl", SL_COL[SUBJ] || "#2f9e8f"); arFsBtn(false);
  try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) { /* abaikan */ }
  slRender(); window.addEventListener("keydown", slKey, true);
}
function slPickPart(tid) {
  const t = TOPIK[tid], NP = slParts(tid), r = slRoot(); r.hidden = false; r.textContent = ""; SL.open = true; document.body.classList.add("ar-lock"); r.style.setProperty("--sl", SL_COL[SUBJ] || "#2f9e8f");
  const x = el("button", { type: "button", class: "sl-x" }, "Tutup"); x.addEventListener("click", () => { SL.open = false; slClose(); });
  const box = el("div", { class: "sl-pick" }, null, el("div", { class: "sl-kick" }, "SLAID PdPc • " + (SUBJS[SUBJ].subjek || "").toUpperCase()), el("h2", null, t.nama), el("p", { class: "sl-pk-lead" }, "Pilih satu slaid. Setiap slaid memfokuskan 2–3 objektif sahaja supaya sesi PdPc lebih tertumpu."));
  const g = el("div", { class: "sl-pk-grid" });
  for (let k = 0; k < NP; k++) {
    const ob = slObjs(tid, k), c = el("button", { type: "button", class: "sl-pk-card", style: "--c:" + SL_PAL[k % SL_PAL.length].c2 }, null, el("b", null, "Slaid " + (k + 1) + " / " + NP), el("small", null, ob.length + " objektif"));
    const ul = el("ul"); ob.forEach((o) => { const li = el("li"); qSet(li, o); ul.appendChild(li); }); c.append(ul, el("span", { class: "sl-pk-go" }, "Mula slaid " + (k + 1)));
    c.addEventListener("click", () => { SL.open = false; r.textContent = ""; slOpen(tid, k); }); g.appendChild(c);
  }
  box.appendChild(g); r.append(el("div", { class: "sl-bg" }), x, box);
}

