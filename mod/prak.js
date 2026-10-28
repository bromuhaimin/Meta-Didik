/* META DIDIK: modul dimuat apabila diperlukan (lihat modLoad dalam app.js). Bergantung pada pemboleh ubah global app.js. */
/* ---------- Praktikal (v17.63): simulasi dan latihan amali ---------- */
const PR_KEY = "gt-pr", PR_XPK = "gt-pr-xp", PR_XP_CAP = 40;
const PR_MODS = [
  { id: "wuduk", n: "Wuduk dan Solat", ico: "💧", d: "Susun tertib wuduk, tayammum dan rukun solat, kemudian jawab situasi sebenar.", lessons: [
    { id: "wu1", n: "Tertib wuduk", kind: "seq", hint: "Mulakan dengan niat dan akhiri dengan doa. Rukun wuduk ada enam; selebihnya sunat.", steps: [
      { t: "Berniat wuduk", n: "Rukun" }, { t: "Membasuh dua tapak tangan", n: "Sunat" }, { t: "Berkumur-kumur", n: "Sunat" }, { t: "Menyedut air ke dalam hidung", n: "Sunat" }, { t: "Membasuh muka", n: "Rukun" }, { t: "Membasuh kedua-dua tangan hingga siku", n: "Rukun" }, { t: "Menyapu sebahagian kepala", n: "Rukun" }, { t: "Membasuh kedua-dua telinga", n: "Sunat" }, { t: "Membasuh kedua-dua kaki hingga buku lali", n: "Rukun" }, { t: "Membaca doa selepas wuduk", n: "Sunat" }] },
    { id: "wu2", n: "Tayammum", kind: "seq", hint: "Tayammum dilakukan apabila tiada air atau tidak boleh menggunakan air. Gunakan debu yang suci.", steps: [
      { t: "Berniat tayammum", n: "Rukun" }, { t: "Menepuk kedua-dua tapak tangan pada debu yang suci", n: "Rukun: memindahkan debu" }, { t: "Menyapu muka", n: "Rukun" }, { t: "Menepuk kedua-dua tapak tangan pada debu sekali lagi", n: "Memindahkan debu untuk tangan" }, { t: "Menyapu kedua-dua tangan hingga siku", n: "Rukun" }] },
    { id: "wu3", n: "Rukun solat", kind: "seq", hint: "Ingat tertib rukun solat dari niat hingga salam.", steps: [
      { t: "Berniat solat", n: "Rukun qalbi" }, { t: "Takbiratulihram", n: "Rukun fi'li" }, { t: "Membaca Surah Al-Fatihah", n: "Rukun qauli" }, { t: "Rukuk", n: "Rukun fi'li" }, { t: "Iktidal", n: "Rukun fi'li" }, { t: "Sujud pertama", n: "Rukun fi'li" }, { t: "Duduk antara dua sujud", n: "Rukun fi'li" }, { t: "Sujud kedua", n: "Rukun fi'li" }, { t: "Duduk tahiyat akhir dan membaca tahiyat", n: "Rukun" }, { t: "Berselawat ke atas Nabi Muhammad SAW", n: "Rukun qauli" }, { t: "Memberi salam yang pertama", n: "Rukun qauli" }] },
    { id: "wu4", n: "Situasi wuduk dan solat", kind: "mcq", hint: "Ingat syarat dan pembatal wuduk menurut mazhab Syafie.", qs: [
      { q: "Hakim tertidur di dalam masjid sambil bersandar pada tiang dan punggungnya melekat tetap pada lantai. Adakah wuduknya batal?", o: ["Batal kerana tidur", "Tidak batal kerana punggungnya tetap pada lantai", "Batal kerana bersandar", "Tidak batal kerana tidur sekejap sahaja"], a: 1, e: "Tidur dalam keadaan punggung tetap tidak membatalkan wuduk menurut mazhab Syafie." },
      { q: "Siti berwuduk kemudian bersalam dengan ayahnya. Apakah hukum wuduknya?", o: ["Batal", "Tidak batal kerana ayah ialah mahramnya", "Batal jika bersalam lama", "Perlu berwuduk semula untuk solat"], a: 1, e: "Bersentuhan kulit dengan mahram tidak membatalkan wuduk." },
      { q: "Antara berikut, yang manakah BUKAN rukun wuduk?", o: ["Berniat", "Membasuh muka", "Berkumur-kumur", "Tertib"], a: 2, e: "Berkumur-kumur ialah perbuatan sunat. Rukun wuduk: niat, basuh muka, basuh tangan hingga siku, sapu sebahagian kepala, basuh kaki hingga buku lali dan tertib." },
      { q: "Berapakah bahagian kepala yang wajib disapu semasa berwuduk?", o: ["Seluruh kepala", "Separuh kepala", "Sebahagian kepala walaupun sedikit", "Hanya bahagian dahi"], a: 2, e: "Menyapu sebahagian kepala walaupun beberapa helai rambut sudah memadai." },
      { q: "Ahmad bermusafir, kehabisan air dan telah mencari tetapi tidak menjumpainya. Apakah yang perlu dilakukannya sebelum solat?", o: ["Menangguhkan solat hingga jumpa air", "Bertayammum", "Terus solat tanpa bersuci", "Mengqada solat pada hari lain"], a: 1, e: "Apabila tiada air selepas berusaha mencarinya, seseorang hendaklah bertayammum." },
      { q: "Antara berikut, yang manakah membatalkan wuduk?", o: ["Keluar angin dari dubur", "Makan makanan panas", "Bercakap dengan kuat", "Memegang Al-Quran"], a: 0, e: "Keluar sesuatu daripada qubul atau dubur membatalkan wuduk." },
      { q: "Menurut mazhab Syafie, berapakah bilangan rukun solat?", o: ["5", "10", "13", "20"], a: 2, e: "Rukun solat menurut mazhab Syafie ada 13: niat, takbiratulihram, berdiri, membaca Fatihah, rukuk, iktidal, sujud, duduk antara dua sujud, duduk tahiyat akhir, tahiyat akhir, selawat, salam dan tertib." },
      { q: "Wuduk sah apabila seseorang membasuh anggota wuduk sekurang-kurangnya sebanyak...", o: ["Sekali", "Dua kali", "Tiga kali", "Tujuh kali"], a: 0, e: "Yang wajib ialah sekali. Membasuh tiga kali ialah sunat." }] }
  ] },
  { id: "jenazah", n: "Pengurusan Jenazah", ico: "🕌", d: "Susun langkah memandikan, mengkafankan dan menyolatkan jenazah dengan betul.", lessons: [
    { id: "jz1", n: "Urutan pengurusan jenazah", kind: "seq", hint: "Empat perkara fardu kifayah: mandi, kafan, solat, kebumi. Ada persiapan sebelum itu.", steps: [
      { t: "Memejamkan mata dan menutup aurat jenazah", n: "Persediaan" }, { t: "Memandikan jenazah", n: "Fardu kifayah" }, { t: "Mengkafankan jenazah", n: "Fardu kifayah" }, { t: "Menyolatkan jenazah", n: "Fardu kifayah" }, { t: "Mengebumikan jenazah", n: "Fardu kifayah" }] },
    { id: "jz2", n: "Cara memandikan jenazah", kind: "seq", hint: "Tutup aurat dahulu, bersihkan najis, wuduk, kemudian siram bermula dari sebelah kanan.", steps: [
      { t: "Meletakkan jenazah di tempat tertutup dan menutup auratnya", n: "Mulakan dengan menjaga kehormatan jenazah" }, { t: "Membersihkan najis dan kotoran daripada jenazah", n: "Sebelum memandikan" }, { t: "Mewudukkan jenazah", n: "Sunat, bermula anggota wuduk" }, { t: "Menyiram air ke seluruh badan bermula bahagian kanan", n: "Wajib: meratakan air" }, { t: "Membasuh tiga kali dan basuhan akhir bersama kapur barus", n: "Sunat" }, { t: "Mengeringkan badan jenazah", n: "Sebelum dikafankan" }] },
    { id: "jz3", n: "Tertib solat jenazah", kind: "seq", hint: "Solat jenazah dilakukan berdiri, dengan empat takbir dan tanpa rukuk atau sujud.", steps: [
      { t: "Berniat solat jenazah", n: "Rukun" }, { t: "Takbir pertama dan membaca Al-Fatihah", n: "Takbir 1" }, { t: "Takbir kedua dan membaca selawat ke atas Nabi", n: "Takbir 2" }, { t: "Takbir ketiga dan berdoa untuk jenazah", n: "Takbir 3" }, { t: "Takbir keempat dan berdoa untuk jenazah serta orang Islam", n: "Takbir 4" }, { t: "Memberi salam", n: "Rukun" }] },
    { id: "jz4", n: "Situasi jenazah", kind: "mcq", hint: "Fikirkan hukum, bilangan dan cara yang betul.", qs: [
      { q: "Apakah hukum menguruskan jenazah orang Islam?", o: ["Sunat muakkad", "Fardu kifayah", "Fardu ain", "Harus"], a: 1, e: "Memandikan, mengkafankan, menyolatkan dan mengebumikan jenazah ialah fardu kifayah." },
      { q: "Berapakah bilangan takbir dalam solat jenazah?", o: ["2", "3", "4", "5"], a: 2, e: "Solat jenazah mempunyai empat takbir." },
      { q: "Berapakah helai kain kafan yang sunat bagi jenazah lelaki?", o: ["1 helai", "3 helai", "5 helai", "7 helai"], a: 1, e: "Jenazah lelaki sunat dikafankan dengan tiga helai kain, manakala perempuan lima helai." },
      { q: "Perkara yang TIDAK terdapat dalam solat jenazah ialah...", o: ["Berdiri", "Takbir", "Rukuk dan sujud", "Salam"], a: 2, e: "Solat jenazah dilakukan berdiri tanpa rukuk dan sujud." },
      { q: "Bagaimanakah jenazah diletakkan di dalam liang lahad?", o: ["Telentang menghadap ke atas", "Di atas rusuk kanan menghadap kiblat", "Di atas rusuk kiri menghadap kiblat", "Meniarap"], a: 1, e: "Jenazah diletakkan di atas rusuk kanan dengan mukanya menghadap kiblat." },
      { q: "Siapakah yang sepatutnya memandikan jenazah perempuan?", o: ["Mana-mana lelaki", "Perempuan atau mahramnya", "Imam masjid sahaja", "Doktor lelaki"], a: 1, e: "Jenazah perempuan dimandikan oleh perempuan atau mahramnya, begitu juga sebaliknya." }] }
  ] }
];
const PR = { open: false, root: null, L: null, m: null, i: 0, mist: 0, ok: 0, order: [], done: false, fb: null };
function prLoad() { try { return JSON.parse(localStorage.getItem(PR_KEY) || "{}") || {}; } catch (e) { return {}; } }
function prSaveBest(id, sc) { try { const d = prLoad(); d[id] = Math.max(d[id] | 0, sc | 0); localStorage.setItem(PR_KEY, JSON.stringify(d)); } catch (e) { /* abaikan */ } }
function prXp(id, n) {
  try {
    const d = new Date().toISOString().slice(0, 10); let o = {}; try { o = JSON.parse(localStorage.getItem(PR_XPK) || "{}") || {}; } catch (e) { o = {}; }
    if (o.d !== d) o = { d: d, n: 0, ids: [] }; if (o.ids.indexOf(id) >= 0 || n <= 0) return 0; const g = Math.min(n, PR_XP_CAP - (o.n | 0)); if (g <= 0) return 0;
    o.n += g; o.ids.push(id); localStorage.setItem(PR_XPK, JSON.stringify(o)); P.xp += g; noteActive(); saveP(); computeStand(); renderMe(); return g;
  } catch (e) { return 0; }
}
function renderPrak() {
  const box = $("prakBody"); if (!box) return; box.textContent = ""; const best = prLoad();
  if (typeof hjSimBox === "function") box.appendChild(hjSimBox());
  [["💧", "Simulasi Wuduk dan Solat 3D", "Berwuduk di tempat wuduk masjid, bertayammum ketika bermusafir, kemudian solat menghadap kiblat dengan tertib rukun.", "wd", "wuduk"], ["🕌", "Simulasi Pengurusan Jenazah 3D", "Laksanakan memandikan, mengkafankan, menyolatkan dan mengebumikan jenazah dengan tertib dan jawab soalan di setiap peringkat.", "jz", "jenazah"]].forEach((H) => {
    const hj = el("div", { class: "pr-hero" }, null, el("div", { class: "pr-hico", "aria-hidden": "true" }, H[0]), el("div", { class: "pr-htx" }, null, el("b", null, H[1]), el("p", null, H[2]), el("small", null, best[H[3]] != null ? "Markah terbaik: " + best[H[3]] + "%" : "Belum dimainkan")));
    const hb = el("button", { type: "button", class: "btn" }, "Mula simulasi"); hb.addEventListener("click", () => { if (typeof hjOpen === "function") hjOpen(H[4]); }); hj.appendChild(hb); box.appendChild(hj);
  });
  PR_MODS.forEach((m) => {
    const sec = el("section", { class: "pr-mod" }, null, el("h3", null, m.ico + " " + m.n), el("p", { class: "muted" }, m.d)), g = el("div", { class: "pr-grid" });
    m.lessons.forEach((L) => { const b = el("button", { type: "button", class: "pr-card" }, null, el("b", null, L.n), el("span", null, L.kind === "seq" ? "Susun langkah · " + L.steps.length + " langkah" : "Situasi · " + L.qs.length + " soalan"), el("em", null, best[L.id] != null ? "★ Terbaik " + best[L.id] + "%" : "Belum cuba")); b.addEventListener("click", () => prStart(m, L)); g.appendChild(b); });
    sec.appendChild(g); box.appendChild(sec);
  });
}
function prStart(m, L) {
  PR.m = m; PR.L = L; PR.fbIdx = null; PR.i = 0; PR.mist = 0; PR.ok = 0; PR.done = false; PR.fb = null; PR.open = true;
  if (L.kind === "seq") PR.order = shuffle(L.steps.map((_, i) => i)); else PR.order = shuffle(L.qs.map((_, i) => i));
  const r = PR.root = el("div", { id: "prOv", role: "dialog", "aria-modal": "true", "aria-label": L.n }); document.body.appendChild(r); document.body.classList.add("ar-lock"); window.addEventListener("keydown", prKey, true); prRender();
}
function prKey(e) { if (PR.open && e.key === "Escape") { e.preventDefault(); e.stopPropagation(); prClose(); } }
function prClose() { PR.open = false; window.removeEventListener("keydown", prKey, true); if (PR.root) { PR.root.remove(); PR.root = null; } document.body.classList.remove("ar-lock"); renderPrak(); }
function prRender() {
  const r = PR.root, L = PR.L; if (!r) return; r.textContent = "";
  const cl = el("button", { type: "button", class: "pr-x" }, "Tutup"); cl.addEventListener("click", prClose);
  const w = el("div", { class: "pr-wrap" }); r.append(cl, w);
  w.append(el("div", { class: "pr-k" }, PR.m.n.toUpperCase()), el("h2", null, L.n));
  if (PR.done) return prResult(w);
  if (L.kind === "seq") prSeq(w); else prMcq(w);
}
function prSeq(w) {
  const L = PR.L, total = L.steps.length, tip = el("p", { class: "pr-hint" }, "Petunjuk: " + L.hint);
  w.append(el("p", { class: "pr-lead" }, "Ketuk langkah mengikut urutan yang betul. " + PR.i + " / " + total + " · Silap: " + PR.mist), tip);
  const done = el("ol", { class: "pr-done" });
  for (let k = 0; k < PR.i; k++) done.appendChild(el("li", null, null, L.steps[k].t, el("small", null, L.steps[k].n || "")));
  const pool = el("div", { class: "pr-pool" });
  PR.order.filter((idx) => idx >= PR.i).forEach((idx) => {
    const b = el("button", { type: "button", class: "pr-step" }, L.steps[idx].t);
    b.addEventListener("click", () => {
      if (idx === PR.i) { PR.i++; try { beep(660 + PR.i * 40, 0.08, "triangle", 0.06); } catch (e) { /* abaikan */ } if (PR.i >= total) { PR.done = true; PR.ok = total; } prRender(); }
      else { PR.mist++; b.classList.add("bad"); try { beep(180, 0.15, "sawtooth", 0.05); } catch (e) { /* abaikan */ } setTimeout(() => prRender(), 420); }
    });
    pool.appendChild(b);
  });
  w.append(done, pool);
}
function prMcq(w) {
  const L = PR.L, total = L.qs.length, q = L.qs[PR.order[PR.i]];
  w.append(el("p", { class: "pr-lead" }, "Soalan " + (PR.i + 1) + " / " + total + " · Betul: " + PR.ok), el("p", { class: "pr-hint" }, "Petunjuk: " + L.hint), el("div", { class: "pr-q" }, q.q));
  const idx = PR.fbIdx || (PR.fbIdx = {}); const key = PR.i, ord = idx[key] || (idx[key] = shuffle([0, 1, 2, 3])), list = el("div", { class: "pr-opts" });
  ord.forEach((oi, pos) => {
    const b = el("button", { type: "button", class: "pr-opt" }, "ABCD"[pos] + ". " + q.o[oi]);
    if (PR.fb) { b.disabled = true; if (oi === q.a) b.classList.add("ok"); else if (oi === PR.fb.pick) b.classList.add("bad"); }
    b.addEventListener("click", () => { if (PR.fb) return; const good = oi === q.a; if (good) PR.ok++; else PR.mist++; PR.fb = { pick: oi, good: good }; prRender(); });
    list.appendChild(b);
  });
  w.appendChild(list);
  if (PR.fb) {
    w.appendChild(el("div", { class: "pr-fb " + (PR.fb.good ? "ok" : "bad") }, (PR.fb.good ? "Betul. " : "Kurang tepat. ") + q.e));
    const nx = el("button", { type: "button", class: "pr-go" }, PR.i + 1 >= total ? "Lihat keputusan" : "Soalan seterusnya"); nx.addEventListener("click", () => { PR.fb = null; PR.i++; if (PR.i >= total) PR.done = true; prRender(); }); w.appendChild(nx);
  }
}
function prResult(w) {
  const L = PR.L, total = L.kind === "seq" ? L.steps.length : L.qs.length; let sc = L.kind === "seq" ? Math.max(20, 100 - PR.mist * 12) : Math.round(PR.ok / total * 100); prSaveBest(L.id, sc);
  const xp = prXp(L.id, L.kind === "seq" ? (sc >= 70 ? 8 : 4) : PR.ok * 2);
  w.append(el("div", { class: "pr-score" }, null, el("b", null, sc + "%"), el("span", null, sc >= 90 ? "Cemerlang!" : sc >= 70 ? "Bagus!" : "Cuba lagi untuk memperbaiki")), el("p", { class: "pr-lead" }, L.kind === "seq" ? "Silap: " + PR.mist + " kali." : "Betul " + PR.ok + " daripada " + total + " soalan."));
  if (xp) w.appendChild(el("p", { class: "pr-xp" }, "+" + xp + " XP"));
  if (L.kind === "seq") { const ol = el("ol", { class: "pr-done" }); L.steps.forEach((s) => ol.appendChild(el("li", null, null, s.t, el("small", null, s.n || "")))); w.append(el("h3", null, "Urutan yang betul"), ol); }
  const again = el("button", { type: "button", class: "pr-go" }, "Cuba lagi"), back = el("button", { type: "button", class: "pr-go alt" }, "Kembali ke Amali"); again.addEventListener("click", () => prStart(PR.m, L)); back.addEventListener("click", prClose); w.append(el("div", { class: "pr-row" }, null, again, back));
}

/* ---------- Simulasi Haji 3D (v17.63): pengembaraan manasik dengan kuiz ---------- */
const HJ_Q = {
  miqat: [
    { q: "Tempat atau waktu yang ditetapkan untuk berniat ihram dinamakan...", o: ["Miqat", "Multazam", "Tarwiyah", "Jamrah"], a: 0, e: "Miqat ialah sempadan tempat atau waktu bermulanya ihram. Ihram bermula dengan niat." },
    { q: "Apakah yang dilarang kepada lelaki yang sedang berihram?", o: ["Berwuduk", "Mandi sunat", "Memakai pakaian berjahit", "Membaca talbiah"], a: 2, e: "Lelaki berihram dilarang memakai pakaian berjahit dan menutup kepala. Mereka memakai dua helai kain putih yang tidak berjahit." },
    { q: "Lafaz \"Labbaikallahumma labbaik...\" yang dibaca berulang kali semasa ihram dinamakan...", o: ["Talbiah", "Takbir", "Tahlil", "Istighfar"], a: 0, e: "Talbiah ialah seruan penyahutan kepada panggilan Allah, dibaca sejak berniat ihram." },
    { q: "Apakah larangan khusus kepada perempuan yang berihram?", o: ["Memakai kasut", "Menutup muka dan memakai sarung tangan", "Memakai tudung", "Berjalan di Mataf"], a: 1, e: "Perempuan berihram tidak boleh menutup muka dan memakai sarung tangan, tetapi wajib menutup aurat lain." }],
  tawaf: [
    { q: "Berapakah pusingan yang perlu dilakukan dalam satu tawaf?", o: ["3", "5", "7", "9"], a: 2, e: "Tawaf dilakukan tujuh pusingan mengelilingi Kaabah." },
    { q: "Dari manakah tawaf bermula dan Kaabah berada di sebelah mana?", o: ["Hajarul Aswad, Kaabah di sebelah kanan", "Hajarul Aswad, Kaabah di sebelah kiri", "Multazam, Kaabah di belakang", "Maqam Ibrahim, Kaabah di sebelah kanan"], a: 1, e: "Tawaf bermula di garis sejajar Hajarul Aswad dengan Kaabah di sebelah kiri, bergerak melawan arah jam." },
    { q: "Di manakah tawaf mesti dilakukan?", o: ["Di dalam Hijr Ismail", "Di luar Hijr Ismail", "Di atas bumbung masjid", "Di dalam Kaabah"], a: 1, e: "Tawaf dilakukan di luar Hijr Ismail kerana Hijr termasuk sebahagian Kaabah." },
    { q: "Solat sunat dua rakaat selepas tawaf sebaik-baiknya dilakukan di belakang...", o: ["Safa", "Maqam Ibrahim", "Jamrah Aqabah", "Jabal Rahmah"], a: 1, e: "Solat sunat tawaf dilakukan di belakang Maqam Ibrahim jika mudah, atau di mana-mana tempat dalam Masjidil Haram." }],
  saie: [
    { q: "Di manakah saie bermula dan berakhir?", o: ["Bermula di Marwah, berakhir di Safa", "Bermula di Safa, berakhir di Marwah", "Bermula di Mina, berakhir di Arafah", "Bermula dan berakhir di Safa"], a: 1, e: "Saie bermula di Safa dan berakhir di Marwah." },
    { q: "Berapakah kali perjalanan dalam saie?", o: ["4 kali", "5 kali", "7 kali", "10 kali"], a: 2, e: "Satu perjalanan dari Safa ke Marwah dikira sekali. Tujuh perjalanan berakhir di Marwah." },
    { q: "Saie mengingati kisah siapakah yang berulang-alik mencari air?", o: ["Siti Hajar", "Siti Sarah", "Siti Khadijah", "Siti Aisyah"], a: 0, e: "Siti Hajar berulang-alik antara Safa dan Marwah mencari air untuk anaknya Nabi Ismail AS." },
    { q: "Menurut mazhab Syafie, bilangan minimum rambut yang mesti dicukur atau digunting untuk sah tahallul ialah...", o: ["Satu helai", "Tiga helai", "Sepuluh helai", "Seluruh kepala"], a: 1, e: "Minimum tiga helai rambut. Lelaki afdal bercukur, perempuan bergunting sekadar hujung rambut." }],
  arafah: [
    { q: "Pada tarikh manakah wuquf di Arafah dilakukan?", o: ["1 Zulhijjah", "8 Zulhijjah", "9 Zulhijjah", "10 Zulhijjah"], a: 2, e: "Wuquf dilakukan pada 9 Zulhijjah." },
    { q: "Apakah hukum wuquf di Arafah?", o: ["Sunat haji", "Wajib haji", "Rukun haji", "Harus"], a: 2, e: "Wuquf ialah rukun haji. Haji tidak sah tanpanya. Sabda Nabi SAW: Haji itu ialah Arafah." },
    { q: "Menurut mazhab Syafie, waktu wuquf bermula dan berakhir bila?", o: ["Subuh 9 hingga Zohor 9 Zulhijjah", "Tergelincir matahari 9 Zulhijjah hingga terbit fajar 10 Zulhijjah", "Maghrib 8 hingga Maghrib 9 Zulhijjah", "Sepanjang bulan Zulhijjah"], a: 1, e: "Waktu wuquf bermula tergelincir matahari 9 Zulhijjah hingga terbit fajar 10 Zulhijjah." }],
  muzdalifah: [
    { q: "Apakah hukum bermalam (mabit) di Muzdalifah?", o: ["Rukun haji", "Wajib haji", "Sunat haji", "Larangan ihram"], a: 1, e: "Mabit di Muzdalifah ialah wajib haji. Meninggalkannya dikenakan dam." },
    { q: "Batu yang dikutip di Muzdalifah digunakan untuk...", o: ["Melontar jamrah", "Membina khemah", "Tawaf", "Menanda sempadan Arafah"], a: 0, e: "Batu kecil dikutip untuk melontar jamrah di Mina." },
    { q: "Selepas wuquf, jemaah bergerak dari Arafah ke Muzdalifah pada waktu...", o: ["Subuh", "Selepas terbenam matahari", "Tengah hari", "Dhuha"], a: 1, e: "Jemaah bertolak ke Muzdalifah selepas terbenam matahari pada 9 Zulhijjah." }],
  mina: [
    { q: "Jamrah yang dilontar pada 10 Zulhijjah ialah...", o: ["Jamrah Ula", "Jamrah Wusta", "Jamrah Aqabah", "Ketiga-tiga jamrah"], a: 2, e: "Pada 10 Zulhijjah hanya Jamrah Aqabah dilontar dengan tujuh biji batu." },
    { q: "Pada hari tasyrik (11–13 Zulhijjah), jemaah melontar...", o: ["Jamrah Aqabah sahaja", "Tiga jamrah, tujuh biji batu setiap satu", "Satu jamrah dengan tiga biji batu", "Tidak melontar"], a: 1, e: "Pada hari tasyrik, Jamrah Ula, Wusta dan Aqabah dilontar masing-masing dengan tujuh biji batu." },
    { q: "Jenis haji yang melakukan umrah terlebih dahulu kemudian haji dalam musim yang sama dan wajib membayar dam ialah...", o: ["Ifrad", "Tamattu'", "Qiran", "Wada'"], a: 1, e: "Haji Tamattu' ialah umrah dahulu, kemudian haji dalam musim haji yang sama. Ia dikenakan dam." },
    { q: "Apakah hikmah melontar jamrah?", o: ["Menunjukkan kekuatan fizikal", "Menolak godaan syaitan dan mentaati perintah Allah seperti Nabi Ibrahim AS", "Mengumpul pahala sahaja", "Menandakan tamatnya cuti"], a: 1, e: "Melontar jamrah melambangkan penolakan godaan syaitan, dan ketaatan penuh kepada Allah seperti Nabi Ibrahim AS." }]
};
const HJ_ST = [
  { id: "miqat", n: "Miqat", sub: "Berniat ihram", th: { sky: ["#5fb4f2", "#eaf6ff"], hill: "#c4a878", cloud: "#ffffff", accent: "#ffd66b" }, ground: "#e8d8b4", intro: ["Miqat ialah sempadan tempat atau waktu untuk bermula ihram. Jemaah mandi sunat, memakai ihram dan berniat.", "Lelaki memakai dua helai kain putih tidak berjahit. Perempuan memakai pakaian menutup aurat, muka dan tapak tangan tidak ditutup.", "Tugas anda: pakai ihram di Bilik Ihram, kemudian berniat di Tanda Niat."] },
  { id: "tawaf", n: "Tawaf", sub: "Tujuh pusingan mengelilingi Kaabah", th: { sky: ["#69b9f5", "#eef7ff"], hill: "#cdbd9a", cloud: "#ffffff", accent: "#fff0b0" }, ground: "#efe7d6", intro: ["Tawaf dimulakan dari garis sejajar Hajarul Aswad (garis hijau). Kaabah berada di sebelah kiri anda dan anda bergerak melawan arah jam.", "Tawaf dilakukan tujuh pusingan di luar Hijr Ismail. Selepas itu solat sunat di Maqam Ibrahim dan minum air zamzam.", "Tugas anda: mulakan di garis hijau dan lengkapkan tujuh pusingan."] },
  { id: "saie", n: "Saie", sub: "Safa ke Marwah, kemudian tahallul", th: { sky: ["#7cc2f4", "#f1f8ff"], hill: "#cdbd9a", cloud: "#ffffff", accent: "#fff0b0" }, ground: "#f2ecde", intro: ["Saie dilakukan berulang-alik antara bukit Safa dan Marwah sebanyak tujuh perjalanan. Ia bermula di Safa dan berakhir di Marwah.", "Di kawasan lampu hijau, jemaah lelaki disunatkan berlari anak. Saie mengingati usaha Siti Hajar mencari air untuk Nabi Ismail AS.", "Selepas saie, jemaah bertahallul dengan bercukur atau bergunting rambut."] },
  { id: "arafah", n: "Arafah", sub: "Wuquf pada 9 Zulhijjah", th: { sky: ["#f6a15a", "#ffe6b8"], hill: "#b8895c", cloud: "#ffe9d0", accent: "#ffcf5a" }, ground: "#d9bf8f", intro: ["Wuquf di Arafah ialah rukun haji. Jemaah berada di Arafah dari tergelincir matahari 9 Zulhijjah hingga terbit fajar 10 Zulhijjah.", "Ia waktu untuk berdoa, berzikir dan beristighfar. Sabda Nabi SAW: Haji itu ialah Arafah.", "Tugas anda: masuk ke Zon Wuquf dan berada di dalamnya sehingga selesai."] },
  { id: "muzdalifah", n: "Muzdalifah", sub: "Mabit dan kutip batu", th: { sky: ["#070c2a", "#2a2f6e"], hill: "#1a1c46", cloud: "#4a4f9a", accent: "#fff2b0" }, ground: "#6a6866", intro: ["Selepas matahari terbenam, jemaah bergerak ke Muzdalifah. Mabit di Muzdalifah ialah wajib haji.", "Di sini jemaah mengutip batu kecil untuk melontar jamrah di Mina, sebesar biji kacang tanah.", "Tugas anda: kutip sekurang-kurangnya tujuh biji batu, kemudian pergi ke Zon Mabit."] },
  { id: "mina", n: "Mina", sub: "Melontar Jamrah Aqabah", th: { sky: ["#63b6f2", "#e8f5ff"], hill: "#c8aa7c", cloud: "#ffffff", accent: "#ffe08a" }, ground: "#e3d3ae", intro: ["Pada 10 Zulhijjah, jemaah melontar Jamrah Aqabah dengan tujuh biji batu sambil bertakbir. Ia melambangkan penolakan godaan syaitan.", "Pada hari tasyrik (11–13 Zulhijjah) jemaah melontar tiga jamrah: Ula, Wusta dan Aqabah.", "Tugas anda: berdiri dalam Zon Lontar dan lontar tujuh biji batu ke arah jamrah."] }
];
const HJ = { mode: null, open: false, root: null, cv: null, cx: null, g: null, raf: 0, last: 0, W: 0, H: 0, dpr: 1, keys: {}, ui: {}, sex: "m", skin: 1, js: { on: false, id: -1, cx: 0, cy: 0, x: 0, y: 0 }, cd: { id: -1, x: 0, y: 0 }, camIn: null };
/* --- pembina dunia --- */
function hjCyl(W, x, y0, z, r, h, col, seg, solid) {
  seg = seg || 10; const top = dwHexMix(col, 1.1);
  for (let k = 0; k < seg; k++) {
    const a0 = k / seg * 6.2832, a1 = (k + 1) / seg * 6.2832, am = (a0 + a1) / 2, x0 = x + Math.sin(a0) * r, z0 = z + Math.cos(a0) * r, x1 = x + Math.sin(a1) * r, z1 = z + Math.cos(a1) * r;
    W.stat.push({ v: [x0, y0, z0, x1, y0, z1, x1, y0 + h, z1, x0, y0 + h, z0], n: [Math.sin(am), 0, Math.cos(am)], col: col, cx: x, cz: z });
    W.stat.push({ v: [x, y0 + h, z, x0, y0 + h, z0, x1, y0 + h, z1, x1, y0 + h, z1], n: [0, 1, 0], col: top, cx: x, cz: z });
  }
  if (solid) W.solids.push({ x0: x - r, x1: x + r, z0: z - r, z1: z + r });
}
function hjBox(W, cx, cy, cz, sx, sy, sz, col, solid) { dwSBox(W, cx, cy, cz, sx, sy, sz, col); if (solid) W.solids.push({ x0: cx - sx / 2, x1: cx + sx / 2, z0: cz - sz / 2, z1: cz + sz / 2 }); }
function hjFloor(W, x0, z0, w, d, top, side, y) { dwSlab(W, x0, y || 0, z0, w, d, 0.4, top, side || dwHexMix(top, 0.8), false); }
function hjPalm(W, x, z, h) { h = h || 5; hjCyl(W, x, 0, z, 0.22, h, "#8a6238", 6); [0, 1, 2, 3, 4, 5].forEach((i) => { const a = i / 6 * 6.2832; hjBox(W, x + Math.sin(a) * 1.1, h + 0.1, z + Math.cos(a) * 1.1, i % 3 ? 1.8 : 0.5, 0.2, i % 3 ? 0.5 : 1.8, "#3f9a4c"); }); hjBox(W, x, h + 0.2, z, 0.8, 0.5, 0.8, "#4aa858"); }
function hjMosque(W, cx, cz, w) {
  hjBox(W, cx, 5, cz, w, 10, 10, "#f4efe6", true); hjBox(W, cx, 10.4, cz, w, 0.8, 10.4, "#d8b24a");
  [[5, 5], [4.2, 5], [3.2, 5], [2.0, 5]].forEach((s, i) => hjCyl(W, cx, 10.8 + i * 1.3, cz, s[0], 1.3, i === 3 ? "#d8b24a" : "#f4efe6", 12));
  for (let i = -1; i <= 1; i += 2) { hjCyl(W, cx + i * (w / 2 + 2.5), 0, cz, 1.2, 20, "#f4efe6", 8, true); hjCyl(W, cx + i * (w / 2 + 2.5), 20, cz, 1.5, 0.8, "#d8b24a", 8); hjCyl(W, cx + i * (w / 2 + 2.5), 20.8, cz, 0.7, 3, "#f4efe6", 8); }
  for (let i = -4; i <= 4; i++) hjBox(W, cx + i * (w / 9), 3, cz - 5.1, 1.3, 4.4, 0.2, "#2a3a5a");
}
function hjTent(W, x, z, s, col) { s = s || 3; hjBox(W, x, s * 0.35, z, s, s * 0.7, s, col || "#f6f2ea"); hjBox(W, x, s * 0.78, z, s * 0.7, s * 0.2, s * 0.7, dwHexMix(col || "#f6f2ea", 0.9)); }
function hjNpcs(W, n, fn) { for (let i = 0; i < n; i++) { const o = fn(i); o.ph = Math.random() * 6; o.sk = Math.floor(Math.random() * 5); o.sex = o.sex || (Math.random() < 0.45 ? "f" : "m"); W.npcs.push(o); } }
function hjNew(th, ground) { return { stat: [], solids: [], dyn: [], npcs: [], th: th, ground: ground, bounds: [-30, 30, -10, 80], signs: [], rocks: [] }; }
/* --- peringkat --- */
function hjBuild(id) {
  const W = hjNew(HJ_ST.filter((s) => s.id === id)[0].th, HJ_ST.filter((s) => s.id === id)[0].ground), R = (a, b) => a + Math.random() * (b - a);
  if (id === "miqat") {
    W.bounds = [-34, 34, -10, 34]; hjFloor(W, -30, -12, 60, 46, "#efe6d4"); hjMosque(W, 0, 40, 28);
    hjBox(W, -20, 2, 10, 9, 4, 7, "#dcd2bd", true); hjBox(W, -20, 4.2, 10, 10, 0.5, 8, "#b89a52"); hjBox(W, -20, 1.4, 6.4, 2, 2.8, 0.2, "#4a3a2a"); W.signs.push({ x: -20, y: 6.2, z: 10, t: "BILIK IHRAM" });
    W.signs.push({ x: 0, y: 17, z: 36, t: hjCur().sign || "MIQAT ZULHULAIFAH (BIR ALI)" }); for (let i = 0; i < 10; i++) hjPalm(W, R(-30, 30), R(-8, 28), R(4, 6.5));
    hjNpcs(W, 16, () => ({ k: "idle", x: R(-26, 26), z: R(-6, 28), yaw: R(0, 6) }));
  } else if (id === "tawaf") {
    W.bounds = [-25, 25, -25, 25]; hjFloor(W, -36, -36, 72, 72, "#f2ecdf"); const ring = (r, c, th) => { for (let k = 0; k < 40; k++) { const a = k / 40 * 6.2832; hjBox(W, Math.cos(a) * r, 0.03, Math.sin(a) * r, 2.6, 0.06, 2.6, k % 2 ? c : dwHexMix(c, 1.08)); } }; ring(10, "#e4d9c2"); ring(21, "#e4d9c2");
    hjBox(W, 0, 4, 0, 6.4, 8, 7.2, "#16161a", true); hjBox(W, 0, 6.4, 0, 6.5, 0.55, 7.3, "#d8b24a"); hjBox(W, 0, 2.4, 3.66, 2.2, 3.4, 0.1, "#d8b24a"); hjBox(W, 3.3, 1.5, 0, 0.3, 0.5, 0.5, "#7a7a82"); hjBox(W, 3.28, 1.5, 0, 0.12, 0.7, 0.7, "#c8c8d0");
    for (let k = 0; k < 9; k++) { const a = Math.PI * (0.62 + k * 0.095); hjBox(W, Math.cos(a) * 6.4, 0.7, Math.sin(a) * 6.4, 1.1, 1.4, 1.1, "#f4efe6", true); }
    hjBox(W, 11, 1.2, 11, 1.8, 2.4, 1.8, "#d8b24a", true); hjBox(W, 11, 2.7, 11, 2, 0.3, 2, "#f4efe6");
    hjBox(W, -22, 0.6, 18, 3, 1.2, 1.2, "#8a8a92", true); hjBox(W, -22, 1.4, 18, 2.6, 0.2, 0.8, "#58c8ff");
    hjBox(W, 14, 0.02, 0, 22, 0.05, 1.0, "#3dc27a"); W.signs.push({ x: 15, y: 2.2, z: 0, t: "GARIS MULA TAWAF" }, { x: 0, y: 9.4, z: 0, t: "KAABAH" }, { x: 11, y: 4.2, z: 11, t: "MAQAM IBRAHIM" }, { x: -22, y: 3, z: 18, t: "AIR ZAMZAM" });
    for (let k = 0; k < 30; k++) { const a = k / 30 * 6.2832; hjCyl(W, Math.cos(a) * 25.5, 0, Math.sin(a) * 25.5, 0.7, 9, "#f4efe6", 8, true); hjBox(W, Math.cos(a) * 28.5, 8, Math.sin(a) * 28.5, 4.2, 16, 4.2, "#eee6d4", true); }
    hjNpcs(W, 46, (i) => ({ k: "orbit", r: R(9, 19), a: R(0, 6.28), w: R(1.4, 2.2) }));
    W.npcs.forEach((n) => { n.w = n.w / n.r; });
  } else if (id === "saie") {
    W.bounds = [-7.5, 7.5, -4, 76]; hjFloor(W, -9, -8, 18, 92, "#f6f0e2"); for (let z = -6; z < 74; z += 6) hjBox(W, 0, 0.03, z, 0.5, 0.05, 2.4, "#9ec0e8");
    hjBox(W, 0, 0.03, 35, 15, 0.06, 14, "#46b57c"); for (let z = -4; z < 78; z += 7) [-1, 1].forEach((s) => { hjBox(W, s * 8.6, 4, z, 1.6, 8, 5.6, "#f1e9d8", true); hjCyl(W, s * 7.8, 0, z + 3.2, 0.5, 6.4, "#f4efe6", 8); hjBox(W, s * 8.6, 6.5, z + 3.2, 1.2, 0.4, 1.2, "#d8b24a"); hjBox(W, s * 7.7, 3.2, z, 0.2, 3, 3, "#2a3a5a"); });
    [-1, 1].forEach((s) => { hjBox(W, s * 7.4, 1.6, 28, 0.4, 3.2, 0.4, "#3dd68a"); hjBox(W, s * 7.4, 1.6, 42, 0.4, 3.2, 0.4, "#3dd68a"); });
    for (let i = 0; i < 6; i++) { hjBox(W, R(-4, 4), 0.6 + i * 0.2, -5 - i * 0.4, R(2, 4), 1.2 + i * 0.4, 2.4, "#8a7f72", true); hjBox(W, R(-4, 4), 0.6 + i * 0.2, 75 + i * 0.4, R(2, 4), 1.2 + i * 0.4, 2.4, "#8a7f72", true); }
    hjBox(W, 0, 6, -8, 18, 12, 2, "#f1e9d8", true); hjBox(W, 0, 6, 78, 18, 12, 2, "#f1e9d8", true);
    W.signs.push({ x: 0, y: 5, z: -2, t: "SAFA الصفا" }, { x: 0, y: 5, z: 72, t: "MARWAH المروة" }, { x: 0, y: 4.6, z: 35, t: "KAWASAN LAMPU HIJAU" });
    hjBox(W, -5, 1, 66, 3, 2, 2.4, "#e8e0cc", true); hjBox(W, -5, 2.2, 66, 3.4, 0.3, 2.8, "#3a8a5a"); W.signs.push({ x: -5, y: 3.6, z: 66, t: "TUKANG GUNTING" });
    hjNpcs(W, 26, (i) => ({ k: "lane", x: R(-6, 6), z: R(0, 70), dir: i % 2 ? 1 : -1, sp: R(1.4, 2.6) }));
  } else if (id === "arafah") {
    W.bounds = [-46, 46, -12, 56]; hjFloor(W, -50, -14, 100, 74, "#dcc79a");
    for (let i = 0; i < 6; i++) hjBox(W, 0, i * 2 + 1.5, 70, 36 - i * 5.5, 3, 24 - i * 3.8, ["#b8956a", "#a9865c", "#9a7852", "#8d6c48", "#7f6040", "#725538"][i]); hjBox(W, 0, 14, 70, 1.6, 6, 1.6, "#f4efe6");
    for (let i = -6; i <= 6; i++) for (let j = 0; j < 8; j++) { const x = i * 7, z = -2 + j * 7; if (Math.hypot(x, z - 22) < 14 || (j === 0 && Math.abs(x) < 8)) continue; hjTent(W, x, z, 3.2); }
    for (let k = 0; k < 16; k++) { const a = k / 16 * 6.2832; hjBox(W, Math.sin(a) * 11.5, 0.9, 22 + Math.cos(a) * 11.5, 0.6, 1.8, 0.6, "#f4efe6"); hjBox(W, Math.sin(a) * 11.5, 1.9, 22 + Math.cos(a) * 11.5, 0.7, 0.3, 0.7, "#3a9a5a"); }
    W.signs.push({ x: 0, y: 18, z: 70, t: "JABAL RAHMAH" }, { x: 0, y: 5, z: 6, t: "ARAFAH عرفة" });
    hjNpcs(W, 30, () => ({ k: "doa", x: R(-8, 8), z: 22 + R(-8, 8), yaw: R(0, 6) }));
  } else if (id === "muzdalifah") {
    W.bounds = [-38, 38, -12, 52]; hjFloor(W, -42, -14, 84, 70, "#77736f");
    for (let i = 0; i < 44; i++) { const x = R(-34, 34), z = R(-8, 44); if (Math.hypot(x, z - 40) < 7) continue; W.rocks.push({ x: x, z: z, got: false }); }
    for (let i = 0; i < 16; i++) { const x = R(-36, 36), z = R(-10, 46); hjBox(W, x, 0.06, z, 1.1, 0.1, 2.2, "#e8e4da"); }
    [[-30, 0], [30, 0], [-30, 30], [30, 30], [0, 15], [0, 45]].forEach((p) => { hjCyl(W, p[0], 0, p[1], 0.2, 8, "#8a8a92", 6); hjBox(W, p[0], 8.2, p[1], 1.2, 0.5, 1.2, "#fff2b0"); });
    hjNpcs(W, 22, () => ({ k: "idle", x: R(-34, 34), z: R(-8, 44), yaw: R(0, 6) }));
  } else if (id === "mina") {
    W.bounds = [-34, 34, -12, 56]; hjFloor(W, -38, -14, 76, 76, "#e8dcc0"); hjFloor(W, -6, -14, 12, 76, "#c9c2b4");
    for (let i = 0; i < 8; i++) for (let j = 0; j < 6; j++) [-1, 1].forEach((s) => hjTent(W, s * (14 + i * 3.6), j * 8 - 4, 3.2));
    if (hjCur().id === "tasyrik") {
      /* Jamrah Ula, Wusta dan Aqabah sebaris (dilontar mengikut tertib) */
      HJ_JM.forEach((J) => { hjBox(W, J.x, 4, 52, 1.6, 8, 10, "#d9d2c3", true); hjBox(W, J.x, 8.3, 52, 2, 0.6, 11, "#b8aa88"); hjCyl(W, J.x, 0, 48.6, 2.2, 0.8, "#c9c2b4", 10); W.signs.push({ x: J.x, y: 10.4, z: 52, t: J.n.toUpperCase() }); });
      W.signs.push({ x: 0, y: 4, z: 30, t: "ZON LONTAR (ULA → WUSTA → AQABAH)" });
    } else { hjBox(W, 0, 4, 52, 1.6, 8, 16, "#d9d2c3", true); hjBox(W, 0, 8.3, 52, 2, 0.6, 17, "#b8aa88"); hjCyl(W, 0, 0, 48.6, 2.2, 0.8, "#c9c2b4", 10); W.signs.push({ x: 0, y: 10.4, z: 52, t: "JAMRAH AQABAH" }, { x: 0, y: 4, z: 34, t: "ZON LONTAR" }); }
    hjNpcs(W, 20, () => ({ k: "idle", x: R(-30, 30), z: R(-8, 30), yaw: R(0, 6) }));
  }
  return W;
}
/* --- avatar jemaah --- */
function hjFace(cam, q, Rb, hy, yaw) {
  const P = (a, b, c) => [Rb[0] * a + Rb[1] * b + Rb[2] * c + Rb[3], Rb[4] * a + Rb[5] * b + Rb[6] * c + Rb[7], Rb[8] * a + Rb[9] * b + Rb[10] * c + Rb[11]], hc = P(0, hy, 0), fw = [Math.sin(yaw), Math.cos(yaw)], vx = cam.x - hc[0], vy = cam.y - hc[1], vz = cam.z - hc[2], vl = Math.hypot(vx, vy, vz) || 1;
  if ((fw[0] * vx + fw[1] * vz) / vl <= 0.12 || vl > 16) return;
  const D = (a, b, c, r, col, al) => { const p = P(a, b, c), m = q.length; dwSprite(cam, q, p[0], p[1], p[2], r, "circle", col, al); if (q.length > m) q[m].d -= 0.45; };
  [-1, 1].forEach((s) => { D(s * 0.07, hy + 0.03, 0.202, 0.03, "#14161c", 1); D(s * 0.07 - 0.008, hy + 0.043, 0.204, 0.01, "#fff", 0.95); });
  for (let i = 0; i <= 6; i++) { const u = i / 6 * 2 - 1; D(u * 0.085, hy - 0.07 - (1 - u * u) * 0.04, 0.202, 0.011, "#2a1410", 1); }
}
function hjAvatar(cam, q, x, y, z, yaw, an, lk) {
  const R = dwRY(yaw, x, y, z), t = an.t || 0, ps = an.pose || "", mv = ps ? 0 : (an.mv || 0), sw = Math.sin(t * 9) * 0.55 * mv, bob = Math.abs(Math.sin(t * 9)) * 0.03 * mv, skin = DW_SKIN[lk.skin | 0], white = "#f3f0e8";
  let a = 0, drop = 0, arms = [-sw, sw], ax = 0.45, kneel = false;
  if (ps === "doa") arms = [-1.35, -1.35]; else if (ps === "takbir") arms = [-2.5, -2.5]; else if (ps === "qiyam") { arms = [-1.15, -1.15]; ax = 0.2; }
  else if (ps === "rukuk") { a = 1.5; arms = [-1.5, -1.5]; } else if (ps === "sujud") { a = 1.9; drop = 0.45; kneel = true; arms = [-3.1, -3.1]; }
  else if (ps === "duduk") { drop = 0.45; kneel = true; arms = [-0.5, -0.5]; ax = 0.4; } else if (ps === "salam") { drop = 0.45; kneel = true; arms = [-0.5, -0.5]; ax = 0.4; }
  const Rb = dwMul(R, dwTr(0, bob, 0)), U = dwMul(Rb, dwRX(a, 0, 0.95 - drop, 0)), PY = 0.95;
  const B = (M, sx, sy, sz, ox, oy, oz, c, b) => dwBox(cam, q, M, sx, sy, sz, ox, oy, oz, c, b), Bu = (sx, sy, sz, ox, oy, oz, c, b) => dwBox(cam, q, U, sx, sy, sz, ox, oy - PY, oz, c, b);
  const armPair = (col, hand, len) => [[arms[0], ax], [arms[1], -ax]].forEach((A) => { const M = dwMul(U, dwRX(A[0], A[1], 1.5 - PY, 0)); B(M, 0.2, len || 0.6, 0.22, 0, -(len || 0.6) / 2, 0, col, 0.94); B(M, 0.2, 0.14, 0.22, 0, -(len || 0.6) - 0.02, 0, hand); });
  const headC = (col) => { dwCyl(cam, q, U, 0.2, 0.4, 0, 1.78 - PY, 0, skin, 1, 12); };
  if (lk.sex === "f") {
    const c = lk.ihram ? white : (lk.col || "#2f9a66"), hc = lk.ihram ? white : "#f0d8e8";
    if (kneel) B(Rb, 0.7, 0.5, 0.8, 0, 0.25, -0.1, c); else B(Rb, 0.68, 1.0, 0.44, 0, 0.58, 0, c);
    Bu(0.6, 0.5, 0.36, 0, 1.3, 0, c, 1.06); armPair(c, skin);
    Bu(0.48, 0.1, 0.5, 0, 2.06, 0, hc); Bu(0.08, 0.5, 0.5, 0.26, 1.82, -0.02, hc, 0.93); Bu(0.08, 0.5, 0.5, -0.26, 1.82, -0.02, hc, 0.93); Bu(0.56, 0.54, 0.08, 0, 1.82, -0.26, hc, 0.9); Bu(0.56, 0.1, 0.08, 0, 1.97, 0.25, hc, 1.04); Bu(0.7, 0.34, 0.46, 0, 1.52, 0, hc, 1.02);
    headC(); if (a < 0.8) hjFace(cam, q, U, 1.78 - PY, yaw);
  } else {
    const sol = !!lk.solat, bot = lk.ihram ? white : sol ? "#2d6a4f" : "#2a3042", top = lk.ihram || sol ? white : "#3a74d0", sleeve = lk.ihram ? skin : top;
    if (kneel) { [-1, 1].forEach((s) => { B(Rb, 0.3, 0.5, 0.34, s * 0.17, 0.25, 0, bot); B(Rb, 0.3, 0.26, 0.62, s * 0.17, 0.13, -0.32, bot); }); }
    else { B(dwMul(R, dwRX(sw * 0.6, 0.14, 0.9 + bob, 0)), 0.3, 0.9, 0.34, 0, -0.45, 0, bot); B(dwMul(R, dwRX(-sw * 0.6, -0.14, 0.9 + bob, 0)), 0.3, 0.9, 0.34, 0, -0.45, 0, bot); }
    if (lk.ihram || sol) Bu(0.7, 0.35, 0.42, 0, 0.9, 0, lk.ihram ? white : bot);
    Bu(0.62, 0.6, 0.36, 0, 1.28, 0, top, 1.05); if (lk.ihram) Bu(0.24, 0.6, 0.38, 0.22, 1.3, 0, skin);
    armPair(sleeve, skin);
    if (sol) { Bu(0.5, 0.2, 0.48, 0, 1.98, 0, "#17120e"); } else Bu(0.5, 0.12, 0.48, 0, 1.78, 0, "#1a1410");
    headC(); if (!sol) dwCyl(cam, q, U, 0.215, 0.1, 0, 1.97 - PY, 0, "#1a1410", 1, 12); if (a < 0.8) hjFace(cam, q, U, 1.78 - PY, yaw);
  }
}
function hjActor(g, cam, q, x, z, yaw, an, lk) { const i0 = q.length; dwFlat(cam, q, x, 0.03, z, 0.5, 0.5, "#000000", 0.28); dwBias(q, i0, 2.4); const i1 = q.length; if (DW_TOON) hjToon(cam, q, x, 0, z, yaw, an, lk); else hjAvatar(cam, q, x, 0, z, yaw, an, lk); dwBias(q, i1, 3.0); }
/* --- UI --- */
function hjRoot() {
  if (HJ.root) return HJ.root; const r = el("div", { id: "hjOv", role: "dialog", "aria-modal": "true", "aria-label": "Simulasi 3D" }); document.body.appendChild(r); HJ.root = r; return r;
}
function hjPanel(build) {
  const u = HJ.ui; if (!u.pan) return; u.pan.textContent = ""; u.pan.hidden = false; build(u.pan); if (HJ.g) HJ.g.modal = true;
}
function hjPanelClose() { const u = HJ.ui; if (u.pan) { u.pan.hidden = true; u.pan.textContent = ""; } if (HJ.g) HJ.g.modal = false; }
function hjToast(t) { const e = HJ.ui.toast; if (!e) return; e.textContent = t; e.classList.remove("show"); void e.offsetWidth; e.classList.add("show"); }
function hjOpen(k) {
  if (HJ.open) return; HJ.mode = HJ_MODES[k || "hajj"] || HJ_MODES.hajj; HJ.open = true; try { HJ.toon = localStorage.getItem("gt-hj-toon") !== "0"; } catch (e) { HJ.toon = true; } document.body.classList.add("ar-lock"); const r = hjRoot(); r.hidden = false; r.textContent = "";
  window.addEventListener("keydown", hjKey, true); window.addEventListener("keyup", hjKey, true); hjMenu();
}
function hjClose() {
  HJ.open = false; cancelAnimationFrame(HJ.raf); HJ.raf = 0; HJ.g = null; window.removeEventListener("keydown", hjKey, true); window.removeEventListener("keyup", hjKey, true);
  try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) { /* abaikan */ }
  if (HJ.root) { HJ.root.remove(); HJ.root = null; } HJ.cv = null; HJ.ui = {}; document.body.classList.remove("ar-lock"); if (typeof renderPrak === "function") renderPrak();
}
function hjMenu() {
  cancelAnimationFrame(HJ.raf); HJ.raf = 0; HJ.g = null; const r = hjRoot(); r.textContent = ""; const cl = el("button", { type: "button", class: "hj-x" }, "Tutup"); cl.addEventListener("click", hjClose);
  const mark = (seg, vals, cur) => [].forEach.call(seg.children, (b, i) => b.setAttribute("aria-pressed", String(vals[i] === cur))); let sexB = null, skB = null;
  sexB = segBtns([["m", "Lelaki"], ["f", "Perempuan"]], HJ.sex, (v) => { HJ.sex = v; mark(sexB, ["m", "f"], v); }, "Jantina jemaah"); skB = segBtns([[0, "Cerah"], [1, "Sawo matang"], [2, "Sederhana"], [3, "Gelap"]], HJ.skin, (v) => { HJ.skin = +v; mark(skB, [0, 1, 2, 3], +v); }, "Warna kulit");
  const go = el("button", { type: "button", class: "hj-go" }, HJ.mode.go); go.addEventListener("click", () => hjStart());
  setTimeout(() => { const m = r.querySelector(".hj-menu"); if (!m || !HJ.mode.toon || m.querySelector(".hj-toon")) return; const tb = segBtns([["1", "Kartun 3D"], ["0", "Biasa"]], HJ.toon ? "1" : "0", (v) => { HJ.toon = v === "1"; try { localStorage.setItem("gt-hj-toon", v); } catch (e) { /* abaikan */ } mark(tb, ["1", "0"], v); }, "Gaya paparan"); tb.classList.add("hj-toon"); m.insertBefore(el("label", { class: "hj-lb" }, "Gaya paparan"), go); m.insertBefore(tb, go); }, 0);
  r.append(cl, el("div", { class: "hj-menu" }, null, el("div", { class: "hj-k" }, "PRAKTIKAL · SIMULASI 3D"), el("h1", null, HJ.mode.title), el("p", null, HJ.mode.desc), HJ.mode.note ? el("p", { class: "hj-note" }, null, el("b", null, "Perbezaan utama: "), el("span", null, HJ.mode.note)) : el("span"),
    el("div", { class: "hj-lst" }, null, ...(HJ.mode.lk ? HJ.mode.lk.map((L, i) => el("span", null, (i + 1) + ". " + L[0])) : hjSt().map((s, i) => el("span", null, (i + 1) + ". " + s.n)))), el("label", { class: "hj-lb" }, "Jemaah"), sexB, el("label", { class: "hj-lb" }, "Warna kulit"), skB, go, el("small", null, "Kawalan: W A S D atau anak panah untuk berjalan, seret tetikus untuk kamera, E untuk bertindak. Telefon: kayu bedik kiri dan butang Tindakan.")));
}
function hjKey(e) {
  if (!HJ.open) return; const k = e.key.toLowerCase(), dn = e.type === "keydown", g = HJ.g;
  if (dn && k === "escape") { e.preventDefault(); e.stopPropagation(); if (g && !g.modal) hjMenu(); else if (!g) hjClose(); return; }
  if (!g || g.modal) return; const map = { arrowleft: "l", a: "l", arrowright: "r", d: "r", arrowup: "f", w: "f", arrowdown: "b", s: "b", q: "cl", e2: "cr" };
  if (map[k]) { HJ.keys[map[k]] = dn; e.preventDefault(); e.stopPropagation(); return; }
  if (dn && !e.repeat && (k === "e" || k === "enter" || k === " ")) { e.preventDefault(); e.stopPropagation(); hjAct(); }
}
function hjStart() {
  const r = hjRoot(); r.textContent = ""; const cv = el("canvas", { class: "hj-cv" }); HJ.cv = cv; HJ.cx = cv.getContext("2d"); HJ.ui = {};
  const u = HJ.ui; u.hud = el("div", { class: "hj-hud" }); u.obj = el("div", { class: "hj-obj" }); u.toast = el("div", { class: "hj-toast", "aria-live": "polite" }); u.pan = el("div", { class: "hj-pan", hidden: "" });
  u.act = el("button", { type: "button", class: "hj-act", hidden: "" }); u.act.addEventListener("click", hjAct); const ex = el("button", { type: "button", class: "hj-x" }, "Keluar"); ex.addEventListener("click", () => hjMenu());
  r.append(cv, u.hud, u.obj, u.toast, u.act, ex, u.pan); hjPtr(cv);
  HJ.g = { st: 0, sc: [], T: 0, modal: false, p: null, cam: null, W: null, mk: [], near: null, pts: [], tot: 0, ok: 0 }; hjLoadStage(0); hjFit(); window.addEventListener("resize", hjFit);
  HJ.last = performance.now(); HJ.raf = requestAnimationFrame(hjLoop);
}
function hjFit() { const cv = HJ.cv; if (!cv) return; const d = Math.min(2, window.devicePixelRatio || 1), W = Math.max(320, window.innerWidth), H = Math.max(280, window.innerHeight); HJ.dpr = d; HJ.W = W; HJ.H = H; cv.width = Math.round(W * d); cv.height = Math.round(H * d); cv.style.width = W + "px"; cv.style.height = H + "px"; }
function hjPtr(cv) {
  HJ.js = { on: false, id: -1, cx: 0, cy: 0, x: 0, y: 0 }; HJ.cd = { id: -1, x: 0, y: 0 };
  cv.addEventListener("pointerdown", (e) => { const g = HJ.g; if (!g || g.modal) return; try { cv.setPointerCapture(e.pointerId); } catch (x) { /* abaikan */ } if (e.pointerType !== "mouse" && e.clientX < HJ.W * 0.42 && e.clientY > HJ.H * 0.3 && !HJ.js.on) { HJ.js.on = true; HJ.js.id = e.pointerId; HJ.js.cx = e.clientX; HJ.js.cy = e.clientY; HJ.js.x = HJ.js.y = 0; } else if (HJ.cd.id < 0) { HJ.cd.id = e.pointerId; HJ.cd.x = e.clientX; HJ.cd.y = e.clientY; } });
  cv.addEventListener("pointermove", (e) => { if (e.pointerId === HJ.js.id) { let dx = (e.clientX - HJ.js.cx) / 56, dy = (HJ.js.cy - e.clientY) / 56; const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; } HJ.js.x = dx; HJ.js.y = dy; } else if (e.pointerId === HJ.cd.id) { const dx = e.clientX - HJ.cd.x, dy = e.clientY - HJ.cd.y; HJ.cd.x = e.clientX; HJ.cd.y = e.clientY; HJ.camIn = [(HJ.camIn ? HJ.camIn[0] : 0) + dx * 0.0065, (HJ.camIn ? HJ.camIn[1] : 0) + dy * 0.0055]; } });
  const up = (e) => { if (e.pointerId === HJ.js.id) { HJ.js.on = false; HJ.js.id = -1; HJ.js.x = HJ.js.y = 0; } if (e.pointerId === HJ.cd.id) HJ.cd.id = -1; }; cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up); cv.addEventListener("contextmenu", (e) => e.preventDefault());
  cv.addEventListener("wheel", (e) => { if (HJ.g) { HJ.g.cam.dist = clamp(HJ.g.cam.dist + Math.sign(e.deltaY) * 0.8, 4, 14); e.preventDefault(); } }, { passive: false });
}
function hjLoadStage(i) {
  const g = HJ.g, S = hjSt()[i]; g.st = i; g.W = HJ.mode.build(S.id); g.so = 0; g.sn = 0; g.lock = false; g.mk = []; g.pts = []; g.look = HJ.mode.look(i); g.o = {}; g.bonus = null;
  dwApplyTheme(S.th); const sp = HJ.mode.spawn(S.id); g.p = { x: sp[0], z: sp[1], yaw: sp[2], vx: 0, vz: 0, mv: 0 }; g.cam = { yaw: sp[2], pitch: 0.34, dist: 8, tx: sp[0], ty: 1.3, tz: sp[1] };
  g.W.npcs.forEach((n) => { if (n.k === "orbit") { n.x = Math.cos(n.a) * n.r; n.z = Math.sin(n.a) * n.r; } });
  HJ.mode.setup(S.id); hjHud(); hjIntro(S);
}
const HJ_JM = [{ n: "Jamrah Ula", x: -16 }, { n: "Jamrah Wusta", x: 0 }, { n: "Jamrah Aqabah", x: 16 }];
function hjSpawn(id) { return { miqat: [0, -4, 0], tawaf: [16, -5, 0], saie: [0, 2, 0], arafah: [0, -8, 0], muzdalifah: [0, -6, 0], mina: [0, -6, 0] }[id]; }
function hjIntro(S) {
  const g = HJ.g, last = g.st === 0; hjPanel((p) => {
    const b = el("button", { type: "button", class: "hj-go" }, "Mula peringkat"); b.addEventListener("click", hjPanelClose);
    p.append(el("div", { class: "hj-k" }, "PERINGKAT " + (g.st + 1) + " / " + hjSt().length), el("h2", null, S.n), el("p", { class: "hj-sub" }, S.sub), ...(HJ.mode.intro && HJ.mode.intro[g.st] || S.intro).map((t) => el("p", null, t)), b);
  });
}
function hjQuiz(id, done) {
  const qs = shuffle(hjQs(id).slice()).slice(0, 3); let i = 0, ok = 0;
  const show = () => hjPanel((p) => {
    const q = qs[i], ord = shuffle([0, 1, 2, 3]); p.append(el("div", { class: "hj-k" }, "SOALAN " + (i + 1) + " / " + qs.length), el("h3", null, q.q)); const lst = el("div", { class: "hj-opts" });
    ord.forEach((oi, pos) => { const b = el("button", { type: "button", class: "hj-opt" }, "ABCD"[pos] + ". " + q.o[oi]); b.addEventListener("click", () => { const good = oi === q.a; if (good) ok++; HJ.g.tot++; if (good) HJ.g.ok++; [...lst.children].forEach((c, k) => { c.disabled = true; if (ord[k] === q.a) c.classList.add("ok"); else if (k === pos) c.classList.add("bad"); }); p.append(el("div", { class: "hj-fb " + (good ? "ok" : "bad") }, (good ? "Betul. " : "Kurang tepat. ") + q.e)); const nx = el("button", { type: "button", class: "hj-go" }, i + 1 >= qs.length ? "Teruskan" : "Soalan seterusnya"); nx.addEventListener("click", () => { i++; if (i >= qs.length) { hjPanelClose(); done(ok, qs.length); } else show(); }); p.append(nx); }); lst.appendChild(b); });
    p.append(lst);
  }); show();
}
function hjStageDone(ok, n) {
  const g = HJ.g; ok += g.so; n += g.sn; hjProgSave(HJ.mode.key, g.st + 1); g.sc.push({ id: hjSt()[g.st].id, ok: ok, n: n }); try { beep(880, 0.15, "triangle", 0.07); } catch (e) { /* abaikan */ }
  if (g.st + 1 >= hjSt().length) return hjEnd();
  hjPanel((p) => { const b = el("button", { type: "button", class: "hj-go" }, "Ke peringkat seterusnya: " + hjSt()[g.st + 1].n); b.addEventListener("click", () => { hjPanelClose(); hjLoadStage(g.st + 1); }); p.append(el("div", { class: "hj-k" }, "PERINGKAT SELESAI"), el("h2", null, hjSt()[g.st].n + " selesai"), el("p", { class: "hj-score" }, ok + " / " + n + " soalan betul"), b); });
}
function hjEnd() {
  const g = HJ.g, pct = g.tot ? Math.round(g.ok / g.tot * 100) : 0; prSaveBest(HJ.mode.key, pct); const xp = prXp(HJ.mode.key, 10 + Math.round(pct * 0.3));
  hjPanel((p) => {
    const rows = el("ol", { class: "hj-res" }); g.sc.forEach((s, i) => rows.appendChild(el("li", null, null, el("b", null, hjSt()[i].n), el("span", null, s.ok + " / " + s.n))));
    const a = el("button", { type: "button", class: "hj-go" }, "Main semula"), b = el("button", { type: "button", class: "hj-go alt" }, "Kembali ke Amali"); a.addEventListener("click", () => { hjPanelClose(); hjMenu(); }); b.addEventListener("click", hjClose);
    p.append(el("div", { class: "hj-k" }, "TAMAT SIMULASI"), el("h2", null, pct >= 80 ? HJ.mode.good : "Simulasi selesai"), el("p", { class: "hj-score" }, pct + "% (" + g.ok + " / " + g.tot + ")"), pct >= 80 ? el("p", null, HJ.mode.well) : el("p", null, HJ.mode.again), xp ? el("p", { class: "hj-xp" }, "+" + xp + " XP") : el("span"), rows, el("div", { class: "hj-row" }, null, a, b));
  });
}
/* --- logik setiap peringkat --- */
function hjMarker(m) { HJ.g.mk.push(Object.assign({ r: 2.2, show: () => true, on: () => {}, label: "", act: "Tindakan" }, m)); return m; }
function hjObj(t) { const e = HJ.ui.obj; if (e) e.textContent = t; }
function hjSetup(id) {
  const g = HJ.g, o = g.o;
  if (id === "miqat") {
    hjObj("1. Pakai pakaian ihram di Bilik Ihram"); o.ih = false;
    hjMarker({ x: -20, z: 6, label: "Bilik Ihram", act: "Pakai ihram (E)", show: () => !o.ih, on: () => { o.ih = true; g.look.ihram = true; hjToast("Anda memakai pakaian ihram. Niatkan ihram di tanda Niat."); hjObj("2. Berniat ihram di Tanda Niat"); } });
    hjMarker({ x: 10, z: 24, label: "Tanda Niat", act: "Berniat (E)", show: () => o.ih, on: () => hjPanel((p) => { const NI = hjNiat(), b = el("button", { type: "button", class: "hj-go" }, "Lafazkan niat"); b.addEventListener("click", () => { hjPanelClose(); hjQuiz("miqat", hjStageDone); }); p.append(el("div", { class: "hj-k" }, NI.k), el("h3", null, NI.ar), el("p", null, NI.ms), el("p", null, "Lafaz talbiah: Labbaikallahumma labbaik, labbaika la syarika laka labbaik, innal hamda wan ni'mata laka wal mulk, la syarika lak."), b); }) });
  } else if (id === "tawaf") {
    hjObj("Mulakan tawaf di garis hijau (Kaabah di sebelah kiri)"); o.tw = { on: false, cum: 0, last: 0, laps: 0, stage: 0 };
    hjMarker({ x: 11, z: 8.6, label: "Maqam Ibrahim", act: "Solat sunat tawaf (E)", show: () => o.tw.stage === 1, on: () => hjPanel((p) => { const b = el("button", { type: "button", class: "hj-go" }, "Selesai solat"); b.addEventListener("click", () => { hjPanelClose(); o.tw.stage = 2; hjObj("Minum air zamzam"); }); p.append(el("div", { class: "hj-k" }, "SOLAT SUNAT TAWAF"), el("h3", null, "Dua rakaat di belakang Maqam Ibrahim"), el("p", null, "Rakaat pertama membaca Al-Kafirun dan rakaat kedua membaca Al-Ikhlas selepas Al-Fatihah."), b); }) });
    hjMarker({ x: -20, z: 18, label: "Air Zamzam", act: "Minum zamzam (E)", show: () => o.tw.stage === 2, on: () => hjPanel((p) => { const b = el("button", { type: "button", class: "hj-go" }, "Teruskan"); b.addEventListener("click", () => { hjPanelClose(); hjQuiz("tawaf", hjStageDone); }); p.append(el("div", { class: "hj-k" }, "AIR ZAMZAM"), el("h3", null, "Allahumma inni as'aluka ilman nafi'a..."), el("p", null, "Meminum air zamzam adalah sunat. Berdoalah semasa meminumnya, menghadap kiblat."), b); }) });
  } else if (id === "saie") {
    hjObj("Berjalan dari Safa ke Marwah. Perjalanan 1 / 7"); o.sa = { trip: 0, tg: "marwah", fin: false };
    hjMarker({ x: -5, z: 63, label: "Tukang Gunting", act: "Bertahallul (E)", show: () => o.sa.fin && !hjNoTah(), on: () => hjPanel((p) => { const b = el("button", { type: "button", class: "hj-go" }, "Selesai bertahallul"); b.addEventListener("click", () => { hjPanelClose(); hjQuiz("saie", hjStageDone); }); p.append(el("div", { class: "hj-k" }, "TAHALLUL"), el("h3", null, HJ.sex === "m" ? "Lelaki afdal bercukur" : "Perempuan bergunting hujung rambut"), el("p", null, HJ.sex === "m" ? "Lelaki digalakkan bercukur kepala. Bergunting juga sah. Minimum tiga helai rambut." : "Perempuan menggunting hujung rambut sekadar satu ruas jari. Minimum tiga helai rambut."), el("p", null, "Tahallul ialah rukun haji dan umrah. Dengannya larangan ihram terbuka."), b); }) });
  } else if (id === "arafah") {
    hjObj("Masuk ke Zon Wuquf dan berdoa"); o.wq = { t: 0, tot: 25, done: false };
  } else if (id === "muzdalifah") {
    hjObj("Kutip batu: 0 / 7"); o.st = { n: 0 };
    hjMarker({ x: 0, z: 40, r: 5, label: "Zon Mabit", act: "Bermalam / mabit (E)", show: () => o.st.n >= 7, on: () => hjPanel((p) => { const b = el("button", { type: "button", class: "hj-go" }, "Teruskan"); b.addEventListener("click", () => { hjPanelClose(); hjQuiz("muzdalifah", hjStageDone); }); p.append(el("div", { class: "hj-k" }, "MABIT DI MUZDALIFAH"), el("h3", null, "Bermalam sehingga selepas separuh malam"), el("p", null, "Jemaah berhenti dan berehat. Solat Maghrib dan Isyak dijamak. Mabit di Muzdalifah ialah wajib haji."), b); }) });
  } else if (id === "mina") {
    hjObj("Berdiri dalam Zon Lontar dan lontar batu: 0 / 7"); o.jm = { n: 0, ball: null };
    const tq = hjCur().id === "tasyrik"; o.jm.tq = tq; o.jm.k = 0; o.jm.need = tq ? 21 : 7;
    if (tq) { hjObj("Lontar Jamrah Ula: 0 / 7"); HJ_JM.forEach((J, k) => hjMarker({ x: J.x, z: 38, r: 4.5, label: "Zon " + J.n, act: "Lontar " + J.n + " (E)", show: () => o.jm.k === k && o.jm.n < 21 && !o.jm.ball, on: () => { const p = g.p; o.jm.ball = { x: p.x, y: 1.6, z: p.z, t: 0, tx: J.x + R2(-1, 1), tz: 49 }; try { beep(520, 0.08, "triangle", 0.06); } catch (e) { /* abaikan */ } hjToast("Allahu Akbar!"); } })); }
    else hjMarker({ x: 0, z: 36, r: 7, label: "Zon Lontar", act: "Lontar batu (E)", show: () => o.jm.n < 7 && !o.jm.ball, on: () => { const p = g.p; o.jm.ball = { x: p.x, y: 1.6, z: p.z, t: 0, tx: R2(-2, 2), tz: 49 }; try { beep(520, 0.08, "triangle", 0.06); } catch (e) { /* abaikan */ } hjToast("Allahu Akbar!"); } });
  }
}
function R2(a, b) { return a + Math.random() * (b - a); }
function hjAct() {
  const g = HJ.g; if (!g || g.modal || !g.near) return; try { g.near.on(); } catch (e) { /* abaikan */ }
}
function hjHud() { const g = HJ.g, u = HJ.ui; if (!u.hud) return; const S = hjSt()[g.st]; u.hud.textContent = ""; u.hud.append(el("div", null, null, el("small", null, "Peringkat " + (g.st + 1) + " / " + hjSt().length), el("b", null, S.n)), el("div", null, null, el("small", null, "Jawapan betul"), el("b", null, g.ok + " / " + g.tot))); }
function hjTick(g, dt) {
  const W = g.W, p = g.p, o = g.o, id = hjSt()[g.st].id;
  // NPC
  W.npcs.forEach((n) => {
    if (n.k === "orbit") { n.a += n.w * dt; n.x = Math.cos(n.a) * n.r; n.z = Math.sin(n.a) * n.r; n.yaw = Math.atan2(-Math.sin(n.a), Math.cos(n.a)) * 0 + Math.atan2(-Math.sin(n.a), Math.cos(n.a)); n.mv = 1; n.yaw = Math.atan2(-Math.sin(n.a), Math.cos(n.a)) ; n.yaw = Math.atan2(-Math.sin(n.a), Math.cos(n.a)); }
    else if (n.k === "lane") { n.z += n.dir * n.sp * dt; if (n.z > 70) n.dir = -1; if (n.z < 0) n.dir = 1; n.yaw = n.dir > 0 ? 0 : Math.PI; n.mv = 1; }
    else n.mv = 0;
  });
  if (g.modal) return;
  const keys = HJ.keys, jx = HJ.camIn; if (jx) { g.cam.yaw += jx[0]; g.cam.pitch = clamp(g.cam.pitch + jx[1], 0.12, 0.9); HJ.camIn = null; }
  g.cam.yaw += ((keys.cr ? 1 : 0) - (keys.cl ? 1 : 0)) * 2 * dt;
  if (p.poseT > 0) { p.poseT -= dt; if (p.poseT <= 0) p.pose = ""; }
  let ix = (keys.r ? 1 : 0) - (keys.l ? 1 : 0), iz = (keys.f ? 1 : 0) - (keys.b ? 1 : 0); if (HJ.js.on) { ix += HJ.js.x; iz += HJ.js.y; } if (g.lock) { ix = 0; iz = 0; } const l = Math.hypot(ix, iz); if (l > 1) { ix /= l; iz /= l; }
  const cy = Math.cos(g.cam.yaw), sy = Math.sin(g.cam.yaw), mx = cy * ix + sy * iz, mz = -sy * ix + cy * iz, ml = Math.hypot(mx, mz), sp = 5.2, k = Math.min(1, dt * 12);
  p.vx += (mx * sp - p.vx) * k; p.vz += (mz * sp - p.vz) * k; if (ml > 0.1) { let da = Math.atan2(mx, mz) - p.yaw; while (da > Math.PI) da -= 6.2832; while (da < -Math.PI) da += 6.2832; p.yaw += da * Math.min(1, dt * 12); }
  p.mv = Math.hypot(p.vx, p.vz) > 0.8 ? 1 : 0;
  const hit = (x, z) => { for (const s of W.solids) if (x > s.x0 - 0.35 && x < s.x1 + 0.35 && z > s.z0 - 0.35 && z < s.z1 + 0.35) return true; return false; }, B = W.bounds;
  let nx = p.x + p.vx * dt; if (nx > B[0] && nx < B[1] && !hit(nx, p.z)) p.x = nx; else p.vx = 0;
  let nz = p.z + p.vz * dt; if (nz > B[2] && nz < B[3] && !hit(p.x, nz)) p.z = nz; else p.vz = 0;
  // penanda
  g.near = null; for (const m of g.mk) { if (!m.show()) continue; if (Math.hypot(p.x - m.x, p.z - m.z) < m.r + 0.8) { g.near = m; break; } }
  const b = HJ.ui.act; if (b) { const t = g.near ? g.near.act : ""; if (b._t !== t) { b._t = t; b.hidden = !t; b.textContent = t; } }
  HJ.mode.tick(g, dt, id);
  g.pts.forEach((q) => { q.t += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt; q.vy -= 9 * dt; }); g.pts = g.pts.filter((q) => q.t < q.life);
}
function hjHajTick(g, dt, id) {
  const W = g.W, p = g.p, o = g.o;
  if (id === "tawaf") {
    const t = o.tw, r = Math.hypot(p.x, p.z), th = Math.atan2(p.z, p.x);
    if (t.stage === 0) {
      if (!t.on) { if (p.x > 5 && Math.abs(p.z) < 2.6 && r < 24) { t.on = true; t.last = th; t.cum = 0; hjToast("Tawaf bermula dari Hajarul Aswad. Bismillahi Allahu Akbar."); } }
      else if (r > 8 && r < 23) { let d = th - t.last; while (d > Math.PI) d -= 6.2832; while (d < -Math.PI) d += 6.2832; t.cum = Math.max(0, t.cum + d); t.last = th; const laps = Math.min(7, Math.floor(t.cum / 6.2832)); if (laps > t.laps) { t.laps = laps; hjToast("Pusingan " + laps + " selesai"); try { beep(640 + laps * 40, 0.12, "triangle", 0.06); } catch (e) { /* abaikan */ } } if (t.laps >= 7) { t.stage = 1; hjObj("Solat sunat tawaf di Maqam Ibrahim"); hjToast("Tujuh pusingan selesai. Alhamdulillah!"); } else hjObj("Pusingan " + (t.laps + 1) + " / 7 (" + Math.round((t.cum % 6.2832) / 6.2832 * 100) + "%)"); }
      else if (t.on) { t.last = th; hjObj("Kembali ke lingkaran tawaf (jauh dari Hijr Ismail)"); }
    }
  } else if (id === "saie") {
    const s = o.sa; if (!s.fin) {
      if (s.tg === "marwah" && p.z > 67) { s.trip++; s.tg = "safa"; hjToast("Perjalanan " + s.trip + " selesai di Marwah"); } else if (s.tg === "safa" && p.z < 3) { s.trip++; s.tg = "marwah"; hjToast("Perjalanan " + s.trip + " selesai di Safa"); }
      if (s.trip >= 7) { s.fin = true; if (hjNoTah()) { const M = hjCur().saieMsg || ["Saie selesai. Anda kekal berihram.", "Tujuh perjalanan selesai. Anda belum bertahallul dan kekal berihram."]; hjObj(M[0]); hjToast(M[1]); setTimeout(() => hjQuiz("saie", hjStageDone), 900); } else { hjObj("Pergi ke Tukang Gunting untuk bertahallul"); hjToast("Tujuh perjalanan selesai di Marwah."); } try { beep(880, 0.15, "triangle", 0.07); } catch (e) { /* abaikan */ } }
      else { const lt = p.z > 28 && p.z < 42 ? " | Kawasan lampu hijau: berlari anak" : ""; hjObj("Perjalanan " + (s.trip + 1) + " / 7: menuju " + (s.tg === "marwah" ? "Marwah" : "Safa") + lt); }
    }
  } else if (id === "arafah") {
    const w = o.wq, inz = Math.hypot(p.x, p.z - 22) < 11; if (!w.done) { if (inz) { w.t += dt; hjObj("Wuquf: " + Math.max(0, Math.ceil(w.tot - w.t)) + " saat lagi. Berdoa, berzikir dan beristighfar."); if (w.t >= w.tot) { w.done = true; hjToast("Wuquf selesai. Alhamdulillah."); hjQuiz("arafah", hjStageDone); } } else hjObj("Masuk ke Zon Wuquf (sempadan Arafah) dan berada di dalamnya"); }
  } else if (id === "muzdalifah") {
    W.rocks.forEach((r) => { if (!r.got && Math.hypot(p.x - r.x, p.z - r.z) < 1.1) { r.got = true; o.st.n++; try { beep(900 + o.st.n * 30, 0.06, "triangle", 0.05); } catch (e) { /* abaikan */ } if (o.st.n >= 7) { hjObj("Pergi ke Zon Mabit"); hjToast("Cukup tujuh biji batu. Pergi ke Zon Mabit."); } else hjObj("Kutip batu: " + o.st.n + " / 7"); } });
  } else if (id === "mina") {
    const j = o.jm, bl = j.ball; if (bl) { bl.t += dt * 1.4; const u = Math.min(1, bl.t); bl.x = p.x + (bl.tx - p.x) * u; bl.z = p.z + (bl.tz - p.z) * u; bl.y = 1.6 + Math.sin(u * Math.PI) * 3 - u * 0.4; if (u >= 1) { j.ball = null; j.n++; for (let i = 0; i < 8; i++) g.pts.push({ x: bl.x, y: 1.2, z: bl.z, vx: R2(-2, 2), vy: R2(1, 3), vz: R2(-2, 0), t: 0, life: 0.6, col: "#ffe27a" }); if (j.tq) { const k = Math.floor(j.n / 7); if (k > j.k && k < 3) { j.k = k; hjToast(HJ_JM[k - 1].n + " selesai. Teruskan ke " + HJ_JM[k].n + "."); } hjObj(j.n >= 21 ? "Ketiga-tiga jamrah telah dilontar" : "Lontar " + HJ_JM[j.k].n + ": " + (j.n - j.k * 7) + " / 7"); }
      else hjObj(j.n >= 7 ? "Semua batu dilontar" : "Lontar batu: " + j.n + " / 7");
      if (j.n >= j.need) { hjToast(j.tq ? "21 biji batu telah dilontar ke tiga jamrah." : "Tujuh biji batu telah dilontar."); setTimeout(() => hjQuiz("mina", hjStageDone), 700); } } }
  }
}
function hjLoop(ts) {
  if (!HJ.open || !HJ.g) return; const dt = clamp((ts - HJ.last) / 1000 || 0.016, 0.001, 0.05); HJ.last = ts; const g = HJ.g; g.T += dt;
  try { hjTick(g, dt); const c = g.cam, p = g.p, k = Math.min(1, dt * 8); c.tx += (p.x - c.tx) * k; c.tz += (p.z - c.tz) * k; c.ty = 1.3; hjDraw(g); hjHud(); } catch (e) { HJ.err = String(e && e.stack || e); }
  HJ.raf = requestAnimationFrame(hjLoop);
}
function hjDraw(g) {
  const c = HJ.cx, W = HJ.W, H = HJ.H, d = HJ.dpr, S = hjSt()[g.st], th = S.th, C0 = g.cam, Wd = g.W, p = g.p; c.setTransform(d, 0, 0, d, 0, 0); DW_TOON = !!(HJ.mode && HJ.mode.toon && HJ.toon);
  const cam = dwCam(C0.tx, C0.ty, C0.tz, C0.yaw, C0.pitch, C0.dist, W, H, 1.2), F = cam.F, hz = clamp(H / 2 - Math.tan(C0.pitch) * F, -H, H * 1.2);
  c.fillStyle = "rgb(" + Math.round(DW_FOG[0] * 255) + "," + Math.round(DW_FOG[1] * 255) + "," + Math.round(DW_FOG[2] * 255) + ")"; c.fillRect(0, Math.max(0, hz), W, H);
  rbSky(c, { T: g.T }, cam, th, W, H, hz, F);
  const gq = []; const gx = cam.x, gz = cam.z; dwFace(cam, gq, [gx - 300, -0.02, gz - 300, gx + 300, -0.02, gz - 300, gx + 300, -0.02, gz + 300, gx - 300, -0.02, gz + 300], [0, 1, 0], Wd.ground, 1, false); dwPaint(c, gq, true);
  const q = [], T = g.T, night = rbLum(th.sky[0]) < 0.3;
  for (const f of Wd.stat) { const dx = f.cx - cam.x, dz = f.cz - cam.z; if (dx * dx + dz * dz > 6400) continue; dwFace(cam, q, f.v, f.n, f.col); }
  Wd.signs.forEach((s) => dwText(cam, q, s.x, s.y, s.z, s.t, 0.5, "#fff"));
  g.mk.forEach((m) => { if (!m.show()) return; const pu = 0.5 + 0.5 * Math.sin(T * 3); dwFlat(cam, q, m.x, 0.06, m.z, m.r, m.r, "#ffd23d", 0.28 + pu * 0.12); for (let i = 0; i < 8; i++) { const mm = q.length; dwSprite(cam, q, m.x, 0.6 + i * 0.55, m.z, 0.5 + pu * 0.1, "circle", "#ffe27a", 0.12); if (q.length > mm) q[mm].d += 0.1; } dwText(cam, q, m.x, 4.4 + pu * 0.15, m.z, m.label, 0.4, "#ffe27a"); });
  Wd.rocks.forEach((r) => { if (r.got) return; dwBox(cam, q, dwTr(r.x, 0.15, r.z), 0.3, 0.3, 0.3, 0, 0, 0, "#d8d2c6"); const mm = q.length; dwSprite(cam, q, r.x, 0.3, r.z, 0.45, "circle", "#fff2b0", 0.18 + 0.1 * Math.sin(T * 4 + r.x)); if (q.length > mm) q[mm].d += 0.05; });
  const b = g.o.jm && g.o.jm.ball; if (b) dwSprite(cam, q, b.x, b.y, b.z, 0.16, "circle", "#cfc8b8", 1);
  Wd.npcs.forEach((n) => { if (Math.hypot(n.x - cam.x, n.z - cam.z) > 60) return; hjActor(g, cam, q, n.x, n.z, n.yaw || 0, { t: T + n.ph, mv: n.mv || 0, pose: n.pose || (n.k === "doa" ? "doa" : "") }, n.look || { sex: n.sex, skin: n.sk, ihram: true }); });
  hjActor(g, cam, q, p.x, p.z, p.yaw, { t: T, mv: p.mv, pose: p.pose }, g.look); dwText(cam, q, p.x, 2.55, p.z, "Anda", 0.3, "#fff");
  g.pts.forEach((e) => { dwSprite(cam, q, e.x, e.y, e.z, 0.08, "sq", e.col, clamp(1 - e.t / e.life, 0, 1)); });
  (Wd.dyn || []).forEach((e) => { if (e.show && !e.show()) return; dwBox(cam, q, dwTr(e.x, e.y, e.z), e.sx, e.sy, e.sz, 0, 0, 0, e.col); });
  if (HJ.mode.draw) HJ.mode.draw(g, cam, q, T);
  dwPaint(c, q); DW_TOON = false;
  if (!HJ.vg || HJ.vgW !== W || HJ.vgH !== H) { const vg = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, Math.max(W, H) * 0.78); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.3)"); HJ.vg = vg; HJ.vgW = W; HJ.vgH = H; } c.fillStyle = HJ.vg; c.fillRect(0, 0, W, H);
  const js = HJ.js; if (js && !js.on && "ontouchstart" in window) { c.globalAlpha = 0.22; c.strokeStyle = "#fff"; c.lineWidth = 3; c.beginPath(); c.arc(86, H - 86, 56, 0, 7); c.stroke(); c.fillStyle = "#fff"; c.beginPath(); c.arc(86, H - 86, 22, 0, 7); c.fill(); c.globalAlpha = 1; }
  if (js && js.on) { c.globalAlpha = 0.5; c.strokeStyle = "#fff"; c.lineWidth = 3; c.beginPath(); c.arc(js.cx, js.cy, 56, 0, 7); c.stroke(); c.fillStyle = "#fff"; c.beginPath(); c.arc(js.cx + js.x * 40, js.cy - js.y * 40, 24, 0, 7); c.fill(); c.globalAlpha = 1; }
}

/* ---------- Mod simulasi: Wuduk dan Solat, Pengurusan Jenazah (v17.64) ---------- */
function hjSt() { return HJ.mode.st; }
function hjQs(id) { const m = HJ.mode, x = m.qx && HJ.g ? m.qx[HJ.g.st] : null; return x || m.q[id]; }
function hjAdiff(a, b) { let d = a - b; while (d > Math.PI) d -= 6.2832; while (d < -Math.PI) d += 6.2832; return d; }
function hjSplash(x, z, col, n) { const g = HJ.g; for (let i = 0; i < (n || 10); i++) g.pts.push({ x: x + R2(-0.3, 0.3), y: 1.2 + R2(0, 0.4), z: z + R2(0, 0.6), vx: R2(-0.8, 0.8), vy: R2(0.5, 2.2), vz: R2(0, 1.2), t: 0, life: 0.8, col: col || "#7fd4ff" }); }
function hjWall(W, x, z, sx, sz, h, col) { hjBox(W, x, h / 2, z, sx, h, sz, col, true); }
function hjLesson(id) { let r = null; PR_MODS.forEach((m) => m.lessons.forEach((L) => { if (L.id === id) r = L; })); return r; }
function hjStepsFrom(id, poses, fx, hold) { return hjLesson(id).steps.map((s, i) => ({ t: s.t, n: s.n, pose: poses[i % poses.length], fx: fx ? fx[i % fx.length] : "", hold: hold || 1.7 })); }
/* mekanik: pilih langkah seterusnya dalam dunia 3D */
function hjSteps(cfg) {
  const g = HJ.g, o = g.o, sp = o.sp = { i: 0, cfg: cfg, fresh: true, started: false, wait: false };
  hjObj(cfg.obj0);
  hjMarker({ x: cfg.x, z: cfg.z, r: cfg.r || 2.4, label: cfg.label, act: cfg.act || "Mula (E)", show: () => !sp.started && (!cfg.ready || cfg.ready()), on: () => { sp.started = true; if (cfg.lock) { g.lock = true; g.p.x = cfg.sx != null ? cfg.sx : g.p.x; g.p.z = cfg.sz != null ? cfg.sz : g.p.z; g.p.yaw = cfg.syaw != null ? cfg.syaw : g.p.yaw; g.cam.yaw = g.p.yaw; g.p.vx = g.p.vz = 0; } if (cfg.onStart) cfg.onStart(); hjStepPanel(sp); } });
}
function hjStepPanel(sp) {
  const cfg = sp.cfg, S = cfg.steps, i = sp.i; if (i >= S.length) return; const cur = S[i];
  hjPanel((p) => {
    p.append(el("div", { class: "hj-k" }, "LANGKAH " + (i + 1) + " / " + S.length), el("h3", null, cfg.ask || "Apakah langkah seterusnya?"));
    if (i > 0) p.append(el("p", { class: "hj-done" }, "Sudah: " + S.slice(Math.max(0, i - 2), i).map((s) => s.t).join(" › ")));
    const pool = shuffle(S.filter((s, k) => k !== i).map((s) => s.t).concat(cfg.wrong || [])).slice(0, 3), opts = shuffle([cur.t].concat(pool)), lst = el("div", { class: "hj-opts" });
    opts.forEach((tx, pos) => {
      const b = el("button", { type: "button", class: "hj-opt" }, "ABCD"[pos] + ". " + tx);
      b.addEventListener("click", () => {
        const good = tx === cur.t, g = HJ.g;
        if (sp.fresh) { sp.fresh = false; g.tot++; g.sn++; if (good) { g.ok++; g.so++; } }
        if (!good) { b.disabled = true; b.classList.add("bad"); p.querySelectorAll(".hj-fb").forEach((x) => x.remove()); p.append(el("div", { class: "hj-fb bad" }, "Belum tepat. " + (cfg.hint || "Fikirkan tertib yang betul.") + " Cuba lagi."));
          try { beep(220, 0.12, "sawtooth", 0.05); } catch (e) { /* abaikan */ } return; }
        hjPanelClose(); sp.fresh = true; sp.i++; sp.wait = true; const pl = g.p; if (cur.pose) { pl.pose = cur.pose; pl.poseT = cur.hold || 1.7; }
        if (cur.fx) hjSplash(pl.x + Math.sin(pl.yaw) * 0.5, pl.z + Math.cos(pl.yaw) * 0.5, cur.fx, 14);
        hjToast("Betul: " + cur.t + (cur.n ? " (" + cur.n + ")" : "")); try { beep(740, 0.1, "triangle", 0.06); } catch (e) { /* abaikan */ }
        if (cfg.onStep) cfg.onStep(i, cur);
        const done = sp.i >= S.length;
        hjObj(done ? "Semua langkah selesai!" : cfg.obj(sp.i));
        setTimeout(() => { if (!HJ.open || HJ.g !== g) return; sp.wait = false; if (done) { g.lock = false; if (cfg.onDone) cfg.onDone(); } else hjStepPanel(sp); }, (cur.hold || 1.7) * 1000 + 200);
      });
      lst.appendChild(b);
    });
    p.append(lst);
  });
}
/* ---------- mod WUDUK DAN SOLAT ---------- */
const HJW_ST = [
  { id: "wudu", n: "Berwuduk", sub: "Tertib wuduk di tempat wuduk masjid", th: { sky: ["#69b9f5", "#eef7ff"], hill: "#cdbd9a", cloud: "#ffffff", accent: "#fff0b0" }, ground: "#e9e1cf", intro: ["Wuduk ialah bersuci daripada hadas kecil dengan air mutlak. Rukun wuduk ada enam: niat, membasuh muka, membasuh tangan hingga siku, menyapu sebahagian kepala, membasuh kaki hingga buku lali dan tertib.", "Selain rukun, terdapat perbuatan sunat seperti membasuh tapak tangan, berkumur, menyedut air ke hidung dan membasuh telinga.", "Tugas anda: pergi ke paip wuduk, kemudian pilih langkah yang betul secara tertib."] },
  { id: "tayam", n: "Tayammum", sub: "Bersuci dengan debu ketika tiada air", th: { sky: ["#6fc0f6", "#fff0cf"], hill: "#c8aa7c", cloud: "#ffffff", accent: "#ffe08a" }, ground: "#e3cd9d", intro: ["Anda bermusafir dan kehabisan air. Setelah berusaha mencarinya tetapi tidak menjumpainya, anda dibenarkan bertayammum menggunakan debu yang suci.", "Tayammum juga dibenarkan jika seseorang tidak boleh menggunakan air kerana sakit.", "Tugas anda: pergi ke batu berdebu di tepi jalan dan lakukan tayammum dengan tertib."] },
  { id: "solat", n: "Solat", sub: "Rukun solat dari niat hingga salam", th: { sky: ["#cfe6ff", "#f6fbff"], hill: "#cfc3a8", cloud: "#ffffff", accent: "#fff0b0" }, ground: "#e7dccb", intro: ["Menghadap kiblat ialah syarat sah solat. Di dewan solat ini, arah kiblat ialah ke arah mihrab (anak panah kuning di lantai).", "Menurut mazhab Syafie, rukun solat ada 13 dan mesti dilakukan secara tertib.", "Tugas anda: berdiri di atas sejadah dan hadap kiblat, kemudian laksanakan rukun solat dengan tertib."] }
];
function hjWBuild(id) {
  const S = HJW_ST.filter((s) => s.id === id)[0], W = hjNew(S.th, S.ground), R = (a, b) => a + Math.random() * (b - a);
  if (id === "wudu") {
    W.bounds = [-19, 19, -6, 22]; hjFloor(W, -22, -8, 44, 34, "#efe9dc"); hjWall(W, 0, 25, 46, 1, 9, "#f1e9d8"); hjWall(W, -22.5, 9, 1, 34, 6, "#ece3d0"); hjWall(W, 22.5, 9, 1, 34, 6, "#ece3d0");
    for (let k = -3; k <= 3; k++) { const x = k * 5; hjBox(W, x, 0.5, 21.5, 1.6, 1, 1.2, "#8c8f99", true); hjBox(W, x, 1.02, 21.2, 1.5, 0.12, 0.9, "#cfe9ff"); hjBox(W, x, 1.9, 22.1, 0.2, 0.5, 0.2, "#c8c8d0"); hjBox(W, x, 1.7, 21.8, 0.2, 0.15, 0.5, "#c8c8d0"); hjBox(W, x, 0.3, 19.2, 0.9, 0.6, 0.9, "#6b4a2e"); hjBox(W, x, 6, 24.4, 1.8, 3, 0.2, "#2a3a5a"); }
    W.signs.push({ x: 0, y: 7.4, z: 24, t: "TEMPAT WUDUK" }, { x: 0, y: 3.4, z: 21.6, t: "Hemat air, jangan membazir" });
    for (let i = 0; i < 6; i++) hjPalm(W, R(-20, 20), R(-4, 4), R(4, 6)); hjMosque(W, 0, 40, 28);
    hjNpcs(W, 6, (i) => { const sx = i % 3 === 0 ? "f" : "m"; return { k: "idle", x: (i - 2.5) * 7 + R(-1, 1), z: R(-3, 6), yaw: R(0, 6), sex: sx, look: { sex: sx, skin: (Math.random() * 5) | 0, ihram: false, col: "#e8a8c8" } }; });
  } else if (id === "tayam") {
    W.bounds = [-30, 30, -8, 44]; hjFloor(W, -4, -10, 8, 60, "#5a5a60"); hjBox(W, 0, 0.04, 20, 0.3, 0.05, 4, "#f2e6a0"); hjBox(W, 0, 0.04, 6, 0.3, 0.05, 4, "#f2e6a0"); hjBox(W, 0, 0.04, 34, 0.3, 0.05, 4, "#f2e6a0");
    hjBox(W, 9, 1.0, 14, 4.2, 1.4, 2.2, "#cf3b3b", true); hjBox(W, 9, 2.0, 14, 2.4, 0.9, 2.0, "#a82828"); hjBox(W, 9, 1.9, 14, 2.2, 0.7, 2.1, "#bfe4ff"); [-1, 1].forEach((a) => [-1, 1].forEach((b) => hjCyl(W, 9 + a * 1.4, 0, 14 + b * 1.1, 0.45, 0.3, "#222", 8)));
    for (let i = 0; i < 14; i++) hjBox(W, R(-28, -7) * (i % 2 ? 1 : -1), 0.4, R(-4, 40), R(1, 2.4), R(0.6, 1.4), R(1, 2), "#a89a86", true);
    hjBox(W, -6.5, 0.5, 16, 2.6, 1.0, 1.8, "#9a8c78", true); W.signs.push({ x: -6.5, y: 2.2, z: 16, t: "BATU BERDEBU (SUCI)" }, { x: 9, y: 3.4, z: 14, t: "KERETA ANDA" });
    for (let i = 0; i < 5; i++) hjPalm(W, R(-28, 28), R(26, 42), R(4, 6)); W.dyn.push({ x: 7.2, y: 0.25, z: 12.4, sx: 0.3, sy: 0.5, sz: 0.3, col: "#6ab8f0" }); W.signs.push({ x: 7.2, y: 1.1, z: 12.4, t: "Botol air kosong" });
  } else if (id === "solat") {
    W.bounds = [-17, 17, -6, 22]; hjFloor(W, -20, -8, 40, 36, "#dccfb4"); for (let r = -3; r <= 3; r++) hjBox(W, r * 4.4, 0.03, 12, 3.6, 0.06, 28, r % 2 ? "#cdb98f" : "#c1a978");
    hjWall(W, 0, 28, 42, 1, 11, "#f4efe6"); hjWall(W, -20.5, 10, 1, 40, 11, "#efe8da"); hjWall(W, 20.5, 10, 1, 40, 11, "#efe8da"); hjWall(W, 0, -9, 42, 1, 11, "#efe8da");
    hjBox(W, 0, 3.4, 27.2, 4.2, 6.8, 0.8, "#3a8a6a"); hjBox(W, 0, 3.0, 26.7, 2.8, 5.4, 0.3, "#1f5a44"); hjBox(W, 0, 6.9, 27.2, 4.8, 0.5, 0.9, "#d8b24a"); W.signs.push({ x: 0, y: 8.4, z: 27, t: "MIHRAB / KIBLAT" });
    for (let k = 0; k < 4; k++) { const x = (k < 2 ? -1 : 1) * (k % 2 ? 8 : 14); hjCyl(W, x, 0, 18, 0.7, 10, "#f4efe6", 10, true); }
    for (let k = -2; k <= 2; k++) { hjBox(W, k * 4, 7, 27.6, 1.4, 3.2, 0.2, "#7ad2ff"); }
    for (let z = 3; z <= 21; z += 6) hjBox(W, 0, 0.05, z, 0.5, 0.06, 2.4, "#ffd23d");
    hjBox(W, 0, 0.08, 10, 2.2, 0.1, 3.2, "#2f9a66"); hjBox(W, 0, 0.12, 10, 1.8, 0.06, 2.8, "#46b886"); hjBox(W, 0, 0.14, 11.1, 0.9, 0.05, 0.5, "#ffe08a"); W.signs.push({ x: 0, y: 1.6, z: 10, t: "SEJADAH" });
    hjNpcs(W, 8, (i) => ({ k: "idle", x: (i - 3.5) * 3.8 + (i > 3 ? 1.5 : 0), z: 16 + (i % 2) * 3, yaw: 0, look: { sex: i % 3 === 0 ? "f" : "m", skin: i % 5, solat: true, ihram: i % 3 === 0 } }));
  }
  return W;
}
function hjWSpawn(id) { return { wudu: [0, -3, 0], tayam: [0, -4, 0], solat: [0, -4, Math.PI] }[id]; }
function hjWSetup(id) {
  const g = HJ.g;
  if (id === "wudu") hjSteps({ x: 0, z: 17.2, label: "Paip wuduk", act: "Mula berwuduk (E)", obj0: "Pergi ke paip wuduk dan tekan Tindakan", steps: hjStepsFrom("wu1", ["qiyam", "doa"], [null, "#7fd4ff"]), wrong: ["Membasuh kaki dahulu sebelum muka", "Menyapu seluruh badan dengan air", "Meninggalkan niat", "Membasuh rambut sehingga basah semuanya"], hint: "Wuduk mesti tertib: mulakan dengan niat dan akhiri dengan doa.", obj: (i) => "Langkah " + (i + 1) + " / " + hjLesson("wu1").steps.length + ": berwuduk dengan tertib", onDone: () => hjQuiz("wudu", hjStageDone) });
  else if (id === "tayam") hjSteps({ x: -6.5, z: 13.8, label: "Batu berdebu", act: "Mula tayammum (E)", obj0: "Pergi ke batu berdebu di tepi jalan", steps: hjStepsFrom("wu2", ["qiyam", "doa", "doa", "doa", "doa"], [null, "#d9c9a0", null, "#d9c9a0", null]), wrong: ["Membasuh muka dengan air", "Menyapu kepala", "Menyapu kedua-dua kaki hingga buku lali", "Menyiram debu ke seluruh badan"], hint: "Tayammum: niat, tepuk debu, sapu muka, tepuk debu lagi, sapu tangan hingga siku.", obj: (i) => "Langkah " + (i + 1) + " / 5: tayammum dengan tertib", onDone: () => hjQuiz("tayam", hjStageDone) });
  else if (id === "solat") {
    const o = g.o; o.sj = { ok: false }; hjObj("Berdiri di atas sejadah dan hadap kiblat (arah mihrab dan anak panah kuning)");
    hjSteps({ x: 0, z: 10, r: 1.9, label: "Sejadah", act: "Mula solat (E)", lock: true, sx: 0, sz: 10, syaw: 0, obj0: "Hadap kiblat di atas sejadah", ready: () => Math.abs(hjAdiff(g.p.yaw, 0)) < 0.5, steps: hjStepsFrom("wu3", ["qiyam", "takbir", "qiyam", "rukuk", "takbir", "sujud", "duduk", "sujud", "duduk", "duduk", "salam"], null, 2.0), wrong: ["Memberi salam sebelum tahiyat akhir", "Sujud tiga kali berturut-turut", "Menoleh ke belakang", "Membaca azan"], hint: "Ingat tertib rukun solat dari niat hingga salam.", obj: (i) => "Rukun " + (i + 1) + " / 11 dalam solat", onDone: () => hjQuiz("solat", hjStageDone) });
  }
}
const HJW_Q = (() => { const q = hjLesson("wu4").qs, X = (a) => a.map((i) => q[i]); return {
  wudu: X([2, 3, 7, 0, 5]),
  tayam: X([4, 5]).concat([{ q: "Tayammum dilakukan dengan menggunakan...", o: ["Air biasa", "Debu atau tanah yang suci", "Pasir yang bernajis", "Sabun"], a: 1, e: "Tayammum menggunakan debu yang suci apabila tiada air atau tidak boleh menggunakan air." }, { q: "Berapa kali tapak tangan ditepuk pada debu bagi tayammum menurut mazhab Syafie?", o: ["Sekali", "Dua kali", "Tiga kali", "Tujuh kali"], a: 1, e: "Dua kali tepukan: sekali untuk menyapu muka dan sekali lagi untuk menyapu kedua-dua tangan hingga siku." }]),
  solat: X([6, 1]).concat([{ q: "Apakah rukun solat yang pertama?", o: ["Takbiratulihram", "Niat", "Berdiri", "Membaca Fatihah"], a: 1, e: "Niat ialah rukun solat yang pertama dan dilakukan serentak dengan takbiratulihram." }, { q: "Menghadap kiblat ketika solat ialah...", o: ["Sunat solat", "Syarat sah solat", "Rukun solat", "Perkara harus"], a: 1, e: "Menghadap kiblat ialah syarat sah solat bagi mereka yang mampu." }, { q: "Berapakah rakaat solat Zohor?", o: ["2", "3", "4", "5"], a: 2, e: "Solat Zohor empat rakaat." }])
}; })();
/* ---------- mod PENGURUSAN JENAZAH ---------- */
const HJJ_ST = [
  { id: "mandi", n: "Memandikan", sub: "Fardu kifayah pertama", th: { sky: ["#8ec9f2", "#eef7ff"], hill: "#cdbd9a", cloud: "#ffffff", accent: "#fff0b0" }, ground: "#dfeaef", intro: ["Memandikan jenazah Muslim ialah fardu kifayah. Jenazah lelaki dimandikan oleh lelaki, jenazah perempuan oleh perempuan atau mahramnya.", "Aurat jenazah mesti ditutup dan kehormatannya dijaga sepanjang proses.", "Tugas anda: pergi ke katil mandi dan pilih langkah memandikan jenazah dengan tertib."] },
  { id: "kafan", n: "Mengkafankan", sub: "Fardu kifayah kedua", th: { sky: ["#8ec9f2", "#eef7ff"], hill: "#cdbd9a", cloud: "#ffffff", accent: "#fff0b0" }, ground: "#e9e1cf", intro: ["Mengkafankan jenazah ialah fardu kifayah. Sekurang-kurangnya jenazah ditutup seluruh badannya dengan sehelai kain.", "Yang sunat: jenazah lelaki dikafankan dengan tiga helai kain putih dan jenazah perempuan dengan lima helai.", "Tugas anda: lakukan langkah mengkafankan jenazah dengan tertib."] },
  { id: "solatj", n: "Solat Jenazah", sub: "Fardu kifayah ketiga", th: { sky: ["#cfe6ff", "#f6fbff"], hill: "#cfc3a8", cloud: "#ffffff", accent: "#fff0b0" }, ground: "#e7dccb", intro: ["Solat jenazah ialah fardu kifayah. Ia dilakukan secara berdiri dengan empat takbir, tanpa rukuk dan sujud.", "Imam berdiri sejajar kepala jenazah lelaki atau sejajar pinggang jenazah perempuan, dan makmum berbaris di belakangnya.", "Tugas anda: berdiri di dalam saf dan laksanakan solat jenazah dengan tertib."] },
  { id: "kubur", n: "Pengebumian", sub: "Fardu kifayah keempat", th: { sky: ["#8fd0f5", "#eaf6ff"], hill: "#8fb080", cloud: "#ffffff", accent: "#ffe08a" }, ground: "#9fcf8a", intro: ["Mengebumikan jenazah ialah fardu kifayah. Disunatkan menyegerakan pengurusan jenazah dan membawanya dengan penuh hormat.", "Jenazah diletakkan di dalam liang lahad di atas rusuk kanan, menghadap kiblat.", "Tugas anda: ke tepi liang lahad dan lakukan langkah pengebumian dengan tertib."] }
];
function hjCloth(W, x, y, z, sx, sy, sz, col, show) { W.dyn.push({ x: x, y: y, z: z, sx: sx, sy: sy, sz: sz, col: col, show: show }); }
function hjJBuild(id) {
  const S = HJJ_ST.filter((s) => s.id === id)[0], W = hjNew(S.th, S.ground), R = (a, b) => a + Math.random() * (b - a), pl = () => HJ.g.o.sp ? HJ.g.o.sp.i : 0, npc = (x, z, yaw, pose) => W.npcs.push({ k: "idle", x: x, z: z, yaw: yaw, pose: pose || "", ph: R(0, 6), sk: (Math.random() * 5) | 0, sex: HJ.sex, look: { sex: HJ.sex, skin: (Math.random() * 5) | 0, ihram: false, col: "#e8f1f4" } });
  if (id === "mandi" || id === "kafan") {
    W.bounds = [-12, 12, -4, 19]; hjFloor(W, -14, -6, 28, 30, "#e8f1f4"); for (let k = -6; k <= 6; k++) hjBox(W, k * 2, 0.03, 8, 0.05, 0.05, 30, "#cfdde4"); hjWall(W, 0, 22, 30, 1, 8, "#d9eaf0"); hjWall(W, -14.5, 9, 1, 30, 8, "#d3e4ea"); hjWall(W, 14.5, 9, 1, 30, 8, "#d3e4ea");
    for (let k = -1; k <= 1; k++) hjBox(W, k * 7, 5, 21.4, 2.2, 3, 0.2, "#8fd0f5");
    hjBox(W, 0, 1.0, 12, 2.4, 0.2, 4.0, "#aab4bd", true); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach((a) => hjBox(W, a[0] * 1.0, 0.5, 12 + a[1] * 1.7, 0.2, 1.0, 0.2, "#7c8791"));
    W.signs.push({ x: 0, y: 5.6, z: 21, t: id === "mandi" ? "BILIK MEMANDIKAN JENAZAH" : "RUANG MENGKAFANKAN JENAZAH" });
    if (id === "mandi") {
      hjCloth(W, 0, 1.28, 12, 0.9, 0.3, 2.5, "#bfe1ee", () => pl() < 5); hjCloth(W, 0, 1.36, 13.4, 0.36, 0.32, 0.4, "#bfe1ee", () => pl() < 5);
      hjCloth(W, 0, 1.28, 12, 0.9, 0.3, 2.5, "#8cc4dc", () => pl() >= 5); hjCloth(W, 0, 1.36, 13.4, 0.36, 0.32, 0.4, "#8cc4dc", () => pl() >= 5);
      hjCyl(W, -4.5, 0, 9, 0.6, 0.9, "#3a7bd5", 10, true); hjCyl(W, 4.5, 0, 9, 0.6, 0.9, "#3a7bd5", 10, true); hjCyl(W, 4.5, 0, 13, 0.35, 0.5, "#f5f5f0", 8, true); hjBox(W, -4.5, 0.2, 14, 1.6, 0.4, 1.0, "#f1f1e8", true);
      W.signs.push({ x: -4.5, y: 1.6, z: 9, t: "Air" }, { x: 4.5, y: 1.4, z: 13, t: "Kapur barus" }, { x: -4.5, y: 1.2, z: 14, t: "Tuala" });
      npc(-3, 12.5, Math.PI / 2, "doa"); npc(3, 12.5, -Math.PI / 2, "doa");
    } else {
      hjBox(W, 0, 1.2, 12, 2.6, 0.06, 3.6, "#d8d0c0", true);
      hjCloth(W, 0, 1.28, 12, 2.0, 0.04, 3.2, "#fbfbf8", () => pl() >= 1); hjCloth(W, 0, 1.32, 12, 1.9, 0.04, 3.1, "#f4f2ea", () => pl() >= 1); hjCloth(W, 0, 1.36, 12, 1.8, 0.04, 3.0, "#ede9dd", () => pl() >= 1);
      hjCloth(W, 0, 1.55, 12, 0.7, 0.34, 2.2, "#bfe1ee", () => pl() >= 2 && pl() < 4); hjCloth(W, 0, 1.55, 12, 1.0, 0.4, 2.8, "#fbfbf8", () => pl() >= 4);
      [[0, 13.7], [0, 12], [0, 10.4]].forEach((a) => hjCloth(W, a[0], 1.58, a[1], 1.15, 0.12, 0.14, "#8a7f6a", () => pl() >= 5));
      hjCyl(W, 4.5, 0, 13, 0.35, 0.5, "#f5f5f0", 8, true); W.signs.push({ x: 4.5, y: 1.4, z: 13, t: "Kapur barus" }, { x: -4.5, y: 1.6, z: 12, t: "Kain kafan" }); hjBox(W, -4.5, 0.5, 12, 1.6, 1.0, 1.2, "#f4f2ea", true);
      npc(-3.2, 12, Math.PI / 2, "doa"); npc(3.2, 12, -Math.PI / 2, "doa");
    }
  } else if (id === "solatj") {
    W.bounds = [-17, 17, -6, 22]; hjFloor(W, -20, -8, 40, 36, "#dccfb4"); for (let r = -3; r <= 3; r++) hjBox(W, r * 4.4, 0.03, 12, 3.6, 0.06, 28, r % 2 ? "#cdb98f" : "#c1a978");
    hjWall(W, 0, 28, 42, 1, 11, "#f4efe6"); hjWall(W, -20.5, 10, 1, 40, 11, "#efe8da"); hjWall(W, 20.5, 10, 1, 40, 11, "#efe8da"); hjWall(W, 0, -9, 42, 1, 11, "#efe8da"); hjBox(W, 0, 3.4, 27.2, 4.2, 6.8, 0.8, "#3a8a6a"); W.signs.push({ x: 0, y: 8.2, z: 27, t: "MIHRAB / KIBLAT" });
    hjBox(W, 0, 0.35, 19, 1.1, 0.7, 2.8, "#7a5a3a", true); hjBox(W, 0, 0.85, 19, 0.8, 0.34, 2.4, "#fbfbf8"); W.signs.push({ x: 0, y: 2.0, z: 19, t: "JENAZAH" });
    W.npcs.push({ k: "idle", x: 0, z: 15.6, yaw: 0, ph: 1, sk: 1, sex: "m", pose: "qiyam", look: { sex: "m", skin: 1, solat: true } }); W.signs.push({ x: 0, y: 2.7, z: 15.6, t: "IMAM" });
    for (let r = 0; r < 2; r++) for (let k = -3; k <= 3; k++) { if (r === 0 && k === 0) continue; W.npcs.push({ k: "idle", x: k * 2.1, z: 11.5 - r * 3, yaw: 0, ph: R(0, 6), sk: (Math.random() * 5) | 0, sex: k % 3 === 0 && r ? "f" : "m", pose: "qiyam", look: { sex: k % 3 === 0 && r ? "f" : "m", skin: (Math.random() * 5) | 0, solat: true, ihram: k % 3 === 0 && r } }); }
  } else if (id === "kubur") {
    W.bounds = [-24, 24, -6, 38]; hjFloor(W, -3, -8, 6, 46, "#cfc7b2"); for (let r = 0; r < 5; r++) for (let k = 0; k < 4; k++) [-1, 1].forEach((s) => { hjBox(W, s * (8 + k * 3.6), 0.25, 4 + r * 5.5, 1.0, 0.5, 2.2, "#b8aa88"); hjBox(W, s * (8 + k * 3.6), 0.7, 5 + r * 5.5, 0.5, 1.0, 0.15, "#d8d0c0"); });
    hjBox(W, 0, 0.02, 26, 2.6, 0.06, 3.8, "#2e1f14"); hjBox(W, -2.6, 0.3, 26, 1.8, 0.6, 3.8, "#7a5a3a"); hjBox(W, 2.6, 0.3, 26, 1.8, 0.6, 3.8, "#7a5a3a");
    hjBox(W, 0, 0.65, 10, 1.1, 0.5, 2.8, "#7a5a3a", false); hjCloth(W, 0, 1.05, 10, 0.8, 0.3, 2.2, "#fbfbf8", () => pl() < 1); hjBox(W, 0, 0.65, 10, 0.01, 0.01, 0.01, "#7a5a3a");
    hjCloth(W, 3.6, 0.75, 26, 0.8, 0.3, 2.2, "#fbfbf8", () => pl() === 1); hjCloth(W, 0, 0.18, 26, 0.7, 0.24, 2.2, "#fbfbf8", () => pl() >= 2 && pl() < 4);
    hjCloth(W, 0, 0.18, 26, 2.5, 0.12, 3.6, "#8a6a45", () => pl() >= 4 && pl() < 5); hjCloth(W, 0, 0.42, 26, 2.2, 0.5, 3.4, "#8a6540", () => pl() >= 5); hjCloth(W, 0, 0.9, 27.9, 0.5, 1.2, 0.15, "#d8d0c0", () => pl() >= 5);
    W.signs.push({ x: 0, y: 3.2, z: 26, t: "LIANG LAHAD" }, { x: 0, y: 2.6, z: 10, t: "Keranda jenazah" }, { x: 0, y: 4.6, z: 38, t: "TANAH PERKUBURAN ISLAM" });
    for (let k = 0; k < 8; k++) W.npcs.push({ k: "idle", x: (k < 4 ? -1 : 1) * (4 + (k % 4) * 1.2), z: 22 + (k % 4) * 2, yaw: k < 4 ? Math.PI / 2 : -Math.PI / 2, ph: R(0, 6), sk: (Math.random() * 5) | 0, sex: "m", pose: k % 2 ? "doa" : "", look: { sex: "m", skin: (Math.random() * 5) | 0, ihram: false } });
    for (let i = 0; i < 6; i++) hjPalm(W, R(-22, 22), R(30, 38), R(4, 6));
  }
  return W;
}
function hjJSpawn(id) { return { mandi: [0, -2, 0], kafan: [0, -2, 0], solatj: [0, -4, 0], kubur: [0, -4, 0] }[id]; }
function hjJSetup(id) {
  const g = HJ.g;
  if (id === "mandi") hjSteps({ x: 0, z: 9.6, r: 2.6, label: "Jenazah", act: "Mula memandikan (E)", obj0: "Pergi ke katil mandi jenazah", steps: hjStepsFrom("jz2", ["doa"], [null, "#7fd4ff", "#7fd4ff", "#7fd4ff", "#cfeaff", null]), wrong: ["Membiarkan aurat jenazah terbuka", "Memandikan jenazah di tempat terbuka", "Memandikan dengan air panas mendidih", "Menghiris kuku dan rambut jenazah"], hint: "Tutup aurat dahulu, bersihkan najis, wuduk, kemudian siram bermula dari sebelah kanan.", obj: (i) => "Langkah " + (i + 1) + " / 6: memandikan jenazah", onDone: () => hjQuiz("mandi", hjStageDone) });
  else if (id === "kafan") hjSteps({ x: 0, z: 9.6, r: 2.6, label: "Kain kafan", act: "Mula mengkafankan (E)", obj0: "Pergi ke meja kain kafan", steps: [
    { t: "Menghamparkan tiga lapis kain kafan secara bertindih", n: "Lelaki tiga helai", pose: "doa", hold: 1.7 }, { t: "Membaringkan jenazah terlentang di atas kain kafan", n: "Dengan penuh hormat", pose: "doa", hold: 1.7 }, { t: "Menyapu wangian dan kapur barus pada anggota sujud serta menutup lubang dengan kapas", n: "Sunat", pose: "doa", hold: 1.7 }, { t: "Melipat kain kafan satu persatu dari sebelah kiri kemudian kanan", n: "Lapisan demi lapisan", pose: "doa", hold: 1.7 }, { t: "Mengikat kain kafan di kepala, badan dan hujung kaki", n: "Ikatan dibuka semasa di liang lahad", pose: "doa", hold: 1.7 }],
    wrong: ["Memakaikan pakaian biasa kepada jenazah", "Menutup muka jenazah dengan plastik", "Membiarkan jenazah tanpa kain di atas lantai", "Mengikat kain kafan terlalu ketat di leher"], hint: "Hamparkan kain, baringkan jenazah, wangikan, lipat, kemudian ikat.", obj: (i) => "Langkah " + (i + 1) + " / 5: mengkafankan jenazah", onDone: () => hjQuiz("kafan", hjStageDone) });
  else if (id === "solatj") hjSteps({ x: 0, z: 11.5, r: 1.8, label: "Saf solat", act: "Berdiri dalam saf (E)", lock: true, sx: 0, sz: 11.5, syaw: 0, obj0: "Berdiri di dalam saf, tepat di belakang imam", steps: hjStepsFrom("jz3", ["qiyam", "takbir", "takbir", "takbir", "takbir", "qiyam"], null, 1.8), wrong: ["Rukuk selepas takbir pertama", "Sujud dua kali", "Membaca doa iftitah dan surah panjang selepas takbir keempat", "Duduk tahiyat"], hint: "Solat jenazah: berdiri, empat takbir, tanpa rukuk dan sujud, kemudian salam.", obj: (i) => "Langkah " + (i + 1) + " / 6: solat jenazah", onDone: () => hjQuiz("solatj", hjStageDone) });
  else if (id === "kubur") hjSteps({ x: 0, z: 22.2, r: 2.6, label: "Liang lahad", act: "Mula mengebumikan (E)", obj0: "Pergi ke tepi liang lahad", steps: [
    { t: "Membawa jenazah ke kubur dengan segera dan penuh hormat", n: "Sunat menyegerakan", pose: "doa", hold: 1.7 }, { t: "Meletakkan jenazah di liang lahad di atas rusuk kanan menghadap kiblat", n: "Wajib", pose: "doa", hold: 1.7 }, { t: "Membuka ikatan kain kafan", n: "Sunat", pose: "doa", hold: 1.7 }, { t: "Menutup liang lahad dengan papan atau batu bata lalu menimbus dengan tanah", n: "Menimbus kubur: wajib", pose: "doa", fx: "#9a7a52", hold: 1.9 }, { t: "Meninggikan kubur sekadar sejengkal, memasang batu nisan dan membaca doa", n: "Sunat", pose: "qiyam", hold: 1.8 }],
    wrong: ["Meletakkan jenazah meniarap", "Menimbus kubur tanpa menutup liang lahad", "Membiarkan kubur rata tanpa sebarang tanda", "Menunda pengebumian tanpa sebab munasabah"], hint: "Bawa, letakkan di liang lahad, buka ikatan, tutup dan timbus, kemudian tinggikan kubur dan berdoa.", obj: (i) => "Langkah " + (i + 1) + " / 5: pengebumian", onDone: () => hjQuiz("kubur", hjStageDone) });
}
const HJJ_Q = (() => { const q = hjLesson("jz4").qs; return {
  mandi: [q[5], q[0], { q: "Basuhan terakhir jenazah disunatkan dicampur dengan...", o: ["Kapur barus", "Garam", "Minyak masak", "Cuka"], a: 0, e: "Basuhan terakhir disunatkan dicampur dengan kapur barus." }, { q: "Jika jenazah tidak dapat dimandikan (contohnya kerana tiada air atau keadaan tubuhnya), apakah yang dilakukan?", o: ["Ditayammumkan", "Dibiarkan sahaja", "Disapu dengan minyak wangi sahaja", "Ditangguhkan tanpa had"], a: 0, e: "Jika tidak dapat dimandikan, jenazah ditayammumkan." }],
  kafan: [q[2], { q: "Berapakah helai kain kafan yang sunat bagi jenazah perempuan?", o: ["Satu helai", "Tiga helai", "Lima helai", "Tujuh helai"], a: 2, e: "Jenazah perempuan sunat dikafankan dengan lima helai kain." }, { q: "Kafan yang paling minimum bagi jenazah ialah...", o: ["Sehelai kain yang menutup seluruh tubuh", "Hanya menutup aurat", "Pakaian harian", "Tiada kain"], a: 0, e: "Yang wajib ialah sehelai kain yang menutup seluruh tubuh jenazah." }],
  solatj: [q[1], q[3], { q: "Apakah hukum solat jenazah?", o: ["Fardu ain", "Fardu kifayah", "Sunat muakkad", "Harus"], a: 1, e: "Solat jenazah ialah fardu kifayah." }, { q: "Imam berdiri di sebelah mana jenazah lelaki?", o: ["Sejajar kepala jenazah", "Sejajar kaki jenazah", "Jauh di belakang saf", "Di dalam kubur"], a: 0, e: "Imam disunatkan berdiri sejajar kepala jenazah lelaki dan sejajar pinggang jenazah perempuan." }],
  kubur: [q[4], { q: "Apakah yang disunatkan terhadap ikatan kain kafan ketika jenazah diletakkan di liang lahad?", o: ["Ikatan dibuka", "Ikatan diketatkan lagi", "Ditambah ikatan baharu", "Dipotong seluruh kain"], a: 0, e: "Disunatkan membuka ikatan kain kafan." }, { q: "Kubur disunatkan ditinggikan dari tanah sekadar...", o: ["Sejengkal", "Setinggi pinggang", "Setinggi dada", "Rata dengan tanah"], a: 0, e: "Kubur disunatkan ditinggikan kira-kira sejengkal supaya dikenali dan tidak dipijak." }]
}; })();
/* ---------- daftar mod ---------- */
const HJ_MODES = {
  hajj: { toon: true, key: "hj", title: "Simulasi Haji", desc: "Lalui manasik haji dari Miqat hingga Mina. Berjalan, laksanakan setiap rukun dan wajib, dan jawab soalan di setiap peringkat. Simulasi ini untuk pembelajaran dan tidak menggantikan bimbingan ustaz atau pembimbing haji.", go: "MULA PERJALANAN HAJI", good: "Semoga Haji Mabrur!", well: "Anda menguasai manasik haji dengan baik.", again: "Ulang simulasi untuk mengukuhkan ingatan anda tentang rukun, wajib dan larangan haji.", st: HJ_ST, q: HJ_Q, build: hjBuild, setup: hjSetup, spawn: hjSpawn, tick: hjHajTick, look: (i) => ({ sex: HJ.sex, skin: HJ.skin, ihram: i > 0 }) },
  wuduk: { key: "wd", title: "Simulasi Wuduk dan Solat", desc: "Berwuduk di tempat wuduk masjid, bertayammum ketika bermusafir, kemudian menunaikan solat menghadap kiblat. Pilih langkah yang betul secara tertib dan lihat watak anda melakukannya. Simulasi ini untuk pembelajaran dan tidak menggantikan bimbingan guru atau ustaz.", go: "MULA SIMULASI", good: "Tahniah, tertib ibadah anda sangat baik!", well: "Anda menguasai tertib wuduk, tayammum dan solat dengan baik.", again: "Ulang simulasi untuk mengukuhkan tertib wuduk, tayammum dan rukun solat.", st: HJW_ST, q: HJW_Q, build: hjWBuild, setup: hjWSetup, spawn: hjWSpawn, tick: () => {}, look: (i) => ({ sex: HJ.sex, skin: HJ.skin, ihram: i === 2 && HJ.sex === "f", solat: i === 2 }) },
  jenazah: { key: "jz", title: "Simulasi Pengurusan Jenazah", desc: "Laksanakan empat fardu kifayah: memandikan, mengkafankan, menyolatkan dan mengebumikan jenazah dengan tertib. Pilih langkah yang betul dan jawab soalan di setiap peringkat. Simulasi ini untuk pembelajaran dan tidak menggantikan bimbingan pihak yang berkelayakan.", go: "MULA SIMULASI", good: "Tahniah, anda menguasai pengurusan jenazah!", well: "Anda menguasai tertib pengurusan jenazah dengan baik.", again: "Ulang simulasi untuk mengukuhkan tertib memandikan, mengkafankan, menyolatkan dan mengebumikan jenazah.", st: HJJ_ST, q: HJJ_Q, build: hjJBuild, setup: hjJSetup, spawn: hjJSpawn, tick: () => {}, look: (i) => ({ sex: HJ.sex, skin: HJ.skin, ihram: false, solat: i === 2 }) }
};

/* ---------- Pilih Simulasi Haji dan Umrah (v17.67) ---------- */
const HJ_PROGK = "gt-hj-prog";
function hjProgLoad() { try { return JSON.parse(localStorage.getItem(HJ_PROGK) || "{}") || {}; } catch (e) { return {}; } }
function hjProgSave(key, n) { try { const d = hjProgLoad(); d[key] = Math.max(d[key] | 0, n | 0); localStorage.setItem(HJ_PROGK, JSON.stringify(d)); } catch (e) { /* abaikan */ } }
function hjNiat() {
  const m = HJ.mode, n = typeof m.niat === "function" ? m.niat(HJ.g ? HJ.g.st : 0) : m.niat;
  return n || { k: "NIAT IHRAM HAJI", ar: "Nawaitul hajja wa ahramtu bihi lillahi ta'ala", ms: "Sahaja aku berniat haji dan berihram dengannya kerana Allah Taala." };
}
const HJN = {
  umrah: { k: "NIAT IHRAM UMRAH", ar: "Nawaitul 'umrata wa ahramtu biha lillahi ta'ala", ms: "Sahaja aku berniat umrah dan berihram dengannya kerana Allah Taala." },
  haji: { k: "NIAT IHRAM HAJI", ar: "Nawaitul hajja wa ahramtu bihi lillahi ta'ala", ms: "Sahaja aku berniat haji dan berihram dengannya kerana Allah Taala." },
  qiran: { k: "NIAT IHRAM HAJI DAN UMRAH", ar: "Nawaitul hajja wa 'umrata wa ahramtu bihima lillahi ta'ala", ms: "Sahaja aku berniat haji dan umrah serta berihram dengan kedua-duanya kerana Allah Taala." }
};
/* peringkat yang berkongsi babak: ihram haji/Tan'im (miqat), tawaf ifadah/wada' (tawaf), saie haji (saie), hari tasyrik (mina) */
const HJ_ALIAS = { ihramhaji: "miqat", tanim: "miqat", ifadah: "tawaf", wada: "tawaf", saiehaji: "saie", tasyrik: "mina" };
const hjAl = (id) => HJ_ALIAS[id] || id;
const hjCur = () => (HJ.g && HJ.mode && hjSt()[HJ.g.st]) || {};
const hjNoTah = () => { const S = hjCur(); return S.noTah != null ? S.noTah : HJ.mode.noTah; };
const hjStx = (ids, ov) => ids.map((id) => { const b = HJ_ST.filter((s) => s.id === hjAl(id))[0], o = (ov && ov[id]) || {}; return Object.assign({}, b, { id: id }, o); });
const HJQ = {
  umrah0: [{ q: "Antara berikut, yang manakah rukun umrah?", o: ["Ihram (berniat)", "Melontar jamrah", "Wuquf di Arafah", "Mabit di Muzdalifah"], a: 0, e: "Rukun umrah ialah ihram, tawaf, saie, bercukur atau bergunting, dan tertib." }, { q: "Menurut mazhab Syafie, apakah hukum umrah bagi yang mampu?", o: ["Fardu sekali seumur hidup", "Sunat sahaja", "Harus", "Makruh"], a: 0, e: "Menurut mazhab Syafie, umrah difardukan sekali seumur hidup bagi yang mampu, sama seperti haji." }, { q: "Apakah lafaz niat ihram umrah?", o: ["Nawaitul 'umrata wa ahramtu biha lillahi ta'ala", "Nawaitul hajja wa ahramtu bihi lillahi ta'ala", "Nawaitu an usholliya", "Nawaitu sauma ghadin"], a: 0, e: "Lafaz niat umrah ialah Nawaitul 'umrata wa ahramtu biha lillahi ta'ala." }],
  umrah2: [{ q: "Apakah yang membuka larangan ihram bagi umrah?", o: ["Bertahallul dengan bercukur atau bergunting selepas saie", "Selesai tawaf sahaja", "Selesai solat sunat tawaf", "Meminum air zamzam"], a: 0, e: "Selepas saie, jemaah bertahallul dengan bercukur atau bergunting. Dengannya umrah selesai dan larangan ihram terbuka." }, { q: "Umrah selesai selepas jemaah menunaikan...", o: ["Ihram, tawaf, saie dan tahallul", "Wuquf dan mabit", "Melontar tiga jamrah", "Tawaf wada' sahaja"], a: 0, e: "Umrah terdiri daripada ihram, tawaf, saie dan tahallul. Tiada wuquf atau melontar jamrah dalam umrah." }],
  ifrad0: [{ q: "Apakah niat ihram haji ifrad?", o: ["Berniat haji sahaja", "Berniat umrah sahaja", "Berniat haji dan umrah serentak", "Berniat umrah dahulu kemudian haji"], a: 0, e: "Haji ifrad ialah berihram dengan niat haji sahaja. Umrah, jika mahu, dilakukan selepas selesai haji." }, { q: "Adakah haji ifrad dikenakan dam tamattu' atau dam qiran?", o: ["Tidak dikenakan", "Ya, seekor kambing", "Ya, seekor unta", "Ya, puasa sebulan"], a: 0, e: "Jemaah ifrad tidak dikenakan dam tamattu' atau dam qiran. Dam hanya wajib jika melanggar larangan atau meninggalkan wajib haji." }],
  ifrad1: [{ q: "Tawaf ketibaan di Makkah bagi jemaah haji ifrad dan qiran dinamakan...", o: ["Tawaf qudum", "Tawaf wada'", "Tawaf ifadah", "Tawaf sunat mutlak"], a: 0, e: "Tawaf qudum ialah tawaf ketibaan, hukumnya sunat bagi jemaah haji yang masuk ke Makkah." }],
  ifrad2: [{ q: "Selepas saie dalam haji ifrad, jemaah...", o: ["Kekal berihram kerana belum bertahallul", "Bertahallul dan menanggalkan ihram", "Pulang ke tanah air", "Memulakan umrah baharu"], a: 0, e: "Jemaah ifrad belum bertahallul selepas saie. Mereka kekal berihram dan terikat dengan larangan ihram hingga tahallul haji." }],
  ifrad5: [{ q: "Tahallul awal berlaku apabila jemaah melakukan dua daripada tiga perkara: melontar Jamrah Aqabah, bercukur atau bergunting, dan...", o: ["Tawaf ifadah", "Tawaf wada'", "Solat sunat ihram", "Mabit di Arafah"], a: 0, e: "Tahallul awal berlaku dengan dua daripada tiga: melontar Jamrah Aqabah, bercukur atau bergunting, dan tawaf ifadah (bersama saie jika belum dilakukan)." }, { q: "Adakah jemaah haji ifrad wajib membayar dam kerana jenis hajinya?", o: ["Tidak wajib", "Wajib", "Wajib jika lelaki", "Wajib jika berumur lebih 60 tahun"], a: 0, e: "Jenis haji ifrad tidak mewajibkan dam." }],
  qiran0: [{ q: "Apakah maksud haji qiran?", o: ["Berniat haji dan umrah serentak dalam satu ihram", "Berniat haji sahaja", "Umrah dahulu, bertahallul, kemudian haji", "Haji dilakukan dua kali"], a: 0, e: "Haji qiran ialah menggabungkan niat haji dan umrah dalam satu ihram. Perbuatan umrah masuk ke dalam perbuatan haji." }, { q: "Apakah lafaz niat ihram haji qiran?", o: ["Nawaitul hajja wa 'umrata wa ahramtu bihima lillahi ta'ala", "Nawaitul hajja wa ahramtu bihi lillahi ta'ala", "Nawaitul 'umrata wa ahramtu biha lillahi ta'ala", "Nawaitu an usholliya"], a: 0, e: "Dalam qiran, jemaah menyebut niat haji dan umrah bersama." }],
  qiran2: [{ q: "Dalam haji qiran, berapa kali tawaf rukun dan saie yang mencukupi untuk haji dan umrah?", o: ["Sekali sahaja, mencukupi untuk kedua-duanya", "Dua kali, satu untuk umrah dan satu untuk haji", "Tiga kali", "Tidak perlu saie"], a: 0, e: "Perbuatan umrah masuk ke dalam haji, maka satu tawaf dan satu saie mencukupi bagi kedua-duanya." }],
  qiran5: [{ q: "Apakah hukum dam bagi haji qiran?", o: ["Wajib", "Sunat", "Harus", "Tidak disyariatkan"], a: 0, e: "Dam qiran wajib bagi jemaah yang bukan penduduk Masjidil Haram. Dam ialah menyembelih seekor kambing." }, { q: "Jika jemaah qiran tidak mampu menyembelih dam, dia wajib berpuasa...", o: ["Tiga hari semasa haji dan tujuh hari apabila pulang", "Tujuh hari semasa haji dan tiga hari apabila pulang", "Sepuluh hari berturut-turut di Makkah", "Tiga puluh hari"], a: 0, e: "Penggantinya ialah puasa tiga hari dalam tempoh haji dan tujuh hari apabila pulang ke tanah air, jumlahnya sepuluh hari." }],
  tam0: [{ q: "Apakah ciri haji tamattu'?", o: ["Umrah dahulu, bertahallul, kemudian berihram haji dalam musim haji yang sama", "Berniat haji dan umrah serentak", "Haji sahaja tanpa umrah", "Haji dahulu kemudian umrah"], a: 0, e: "Tamattu' ialah menunaikan umrah dalam bulan haji, bertahallul, kemudian berihram haji pada tahun yang sama." }],
  tam3: [{ q: "Bilakah jemaah tamattu' lazimnya berihram haji di Makkah?", o: ["8 Zulhijjah (hari Tarwiyah)", "1 Muharram", "15 Ramadan", "11 Zulhijjah"], a: 0, e: "Jemaah tamattu' lazimnya berihram haji pada 8 Zulhijjah sebelum bergerak ke Mina dan Arafah." }, { q: "Di manakah jemaah tamattu' yang berada di Makkah berniat ihram haji?", o: ["Di tempat penginapannya di Makkah", "Di Miqat Zulhulaifah", "Di Arafah", "Di Muzdalifah"], a: 0, e: "Miqat bagi orang yang berada di Makkah ialah Makkah sendiri, maka dia berniat dari tempat penginapannya." }],
  tam6: [{ q: "Apakah hukum dam bagi haji tamattu'?", o: ["Wajib", "Sunat", "Harus", "Tidak disyariatkan"], a: 0, e: "Dam tamattu' wajib bagi jemaah yang bukan penduduk Masjidil Haram. Dam ialah menyembelih seekor kambing." }, { q: "Jika jemaah tamattu' tidak mampu menyembelih dam, dia wajib berpuasa...", o: ["Tiga hari semasa haji dan tujuh hari apabila pulang", "Tujuh hari semasa haji dan tiga hari apabila pulang", "Lima hari berturut-turut", "Sebulan"], a: 0, e: "Penggantinya ialah puasa tiga hari dalam tempoh haji dan tujuh hari apabila pulang." }]
};
const hjMix = (id, ex) => (ex || []).concat(HJ_Q[hjAl(id)]);
function hjMk(key, c) {
  const al = (f) => (id, a, b) => f(hjAl(id), a, b);
  return Object.assign({ key: key, st: null, build: al(hjBuild), setup: al(hjSetup), spawn: al(hjSpawn), tick: al(hjHajTick), q: HJ_Q, go: "MULA SIMULASI", good: "Semoga ibadah anda diterima!", well: "Anda menguasai manasik ini dengan baik.", again: "Ulang simulasi untuk mengukuhkan urutan manasik, rukun dan wajib.", look: (i) => ({ sex: HJ.sex, skin: HJ.skin, ihram: i > 0 }) }, c);
}
const HJ_UM_ST = hjStx(["miqat", "tawaf", "saie"], { miqat: { sub: "Berniat ihram umrah", intro: ["Miqat ialah sempadan untuk bermula ihram. Jemaah mandi sunat, memakai ihram dan berniat umrah.", "Lelaki memakai dua helai kain putih tidak berjahit. Perempuan memakai pakaian menutup aurat, muka dan tapak tangan tidak ditutup.", "Tugas anda: pakai ihram di Bilik Ihram, kemudian berniat umrah di Tanda Niat."] } });
/* v18.11: manasik penuh mengikut langkah sebenar (tawaf ifadah, hari tasyrik, umrah dari Tan'im dan tawaf wada') */
const HJ_IFADAH = (saie) => ({ n: "Tawaf Ifadah", sub: "Rukun haji selepas wuquf", ih: false, intro: ["Tawaf ifadah ialah rukun haji. Waktunya bermula selepas tengah malam 10 Zulhijjah, setelah wuquf di Arafah.", saie, "Tugas anda: lengkapkan tujuh pusingan tawaf, solat sunat tawaf di Maqam Ibrahim dan minum air zamzam."] });
const HJ_TASYRIK = { n: "Hari Tasyrik", sub: "Mabit di Mina dan lontar tiga jamrah", ih: false, intro: ["Pada hari tasyrik (11, 12 dan 13 Zulhijjah) jemaah wajib bermalam di Mina dan melontar ketiga-tiga jamrah selepas tergelincir matahari.", "Tertib lontaran ialah Jamrah Ula, kemudian Wusta, kemudian Aqabah. Setiap jamrah dilontar tujuh biji batu sambil bertakbir.", "Jemaah boleh nafar awal, iaitu meninggalkan Mina pada 12 Zulhijjah sebelum matahari terbenam, atau nafar thani pada 13 Zulhijjah.", "Tugas anda: lontar Jamrah Ula, Wusta dan Aqabah mengikut tertib."] };
const HJ_WADA = { n: "Tawaf Wada'", sub: "Tawaf selamat tinggal", ih: false, intro: ["Tawaf wada' ialah wajib haji bagi jemaah yang hendak meninggalkan Makkah. Ia menjadi amalan terakhir sebelum pulang.", "Perempuan yang sedang haid atau nifas dikecualikan daripada tawaf wada' dan tidak dikenakan dam.", "Tugas anda: lengkapkan tujuh pusingan tawaf wada'."] };
const HJ_ARAFAH = { n: "Tarwiyah dan Arafah", sub: "8 Zulhijjah ke Mina, 9 Zulhijjah wuquf", intro: ["Pada 8 Zulhijjah (hari Tarwiyah) jemaah bergerak ke Mina dan disunatkan bermalam di sana. Pada pagi 9 Zulhijjah jemaah bergerak ke Arafah.", "Wuquf di Arafah ialah rukun haji, dari tergelincir matahari 9 Zulhijjah hingga terbit fajar 10 Zulhijjah. Sabda Nabi SAW: Haji itu ialah Arafah.", "Tugas anda: masuk ke Zon Wuquf dan berada di dalamnya sehingga selesai."] };
const HJ_AQABAH = (dam) => ({ n: "Jamrah Aqabah", sub: "10 Zulhijjah: lontar dan tahallul awal", intro: ["Pada 10 Zulhijjah, jemaah melontar Jamrah Aqabah dengan tujuh biji batu sambil bertakbir.", dam || "Jemaah haji ifrad tidak dikenakan dam kerana jenis hajinya.", "Selepas itu jemaah bercukur atau bergunting. Dengan dua daripada tiga perkara (melontar Jamrah Aqabah, bercukur atau bergunting, dan tawaf ifadah) berlakulah tahallul awal.", "Tugas anda: berdiri dalam Zon Lontar dan lontar tujuh biji batu ke Jamrah Aqabah."] });
const HJ_IF_ST = hjStx(["miqat", "tawaf", "saie", "arafah", "muzdalifah", "mina", "ifadah", "tasyrik", "tanim", "wada"], {
  miqat: { sub: "Berniat haji sahaja", intro: ["Haji ifrad ialah berihram dengan niat haji sahaja. Jemaah tidak berniat umrah bersama haji.", "Lelaki memakai dua helai kain putih tidak berjahit. Perempuan memakai pakaian menutup aurat, muka dan tapak tangan tidak ditutup.", "Tugas anda: pakai ihram di Bilik Ihram, kemudian berniat di Tanda Niat."] },
  tawaf: { n: "Tawaf Qudum", sub: "Tawaf ketibaan di Makkah" },
  saie: { n: "Saie Haji", sub: "Safa ke Marwah, tanpa tahallul", intro: ["Saie dilakukan berulang-alik antara Safa dan Marwah sebanyak tujuh perjalanan. Ia bermula di Safa dan berakhir di Marwah.", "Jemaah ifrad boleh bersaie haji selepas tawaf qudum. Saie ini mencukupi dan tidak perlu diulang selepas tawaf ifadah.", "Jemaah ifrad belum bertahallul selepas saie. Mereka kekal berihram hingga hari raya korban."] },
  arafah: HJ_ARAFAH, mina: HJ_AQABAH(),
  ifadah: HJ_IFADAH("Jemaah ifrad yang sudah bersaie selepas tawaf qudum tidak perlu bersaie lagi. Selepas tawaf ifadah berlakulah tahallul thani dan semua larangan ihram terangkat."),
  tasyrik: HJ_TASYRIK,
  tanim: { n: "Umrah dari Tan'im", sub: "Umrah selepas selesai haji", sign: "MASJID TAN'IM (MASJID AISYAH)", ih: false, intro: ["Jemaah haji ifrad boleh menunaikan umrah selepas selesai haji. Kerana sudah berada di Makkah (Tanah Haram), jemaah keluar ke tanah halal terdekat, iaitu Tan'im, untuk berihram.", "Selepas berniat, jemaah kembali ke Masjidil Haram untuk tawaf, saie dan bercukur atau bergunting seperti dalam Simulasi Umrah.", "Tugas anda: pakai ihram di Bilik Ihram dan berniat umrah di Tanda Niat."] },
  wada: HJ_WADA
});
const HJ_QR_ST = hjStx(["miqat", "tawaf", "saie", "arafah", "muzdalifah", "mina", "ifadah", "tasyrik", "wada"], {
  miqat: { sub: "Berniat haji dan umrah serentak", intro: ["Haji qiran ialah menggabungkan niat haji dan umrah dalam satu ihram.", "Lelaki memakai dua helai kain putih tidak berjahit. Perempuan memakai pakaian menutup aurat, muka dan tapak tangan tidak ditutup.", "Tugas anda: pakai ihram di Bilik Ihram, kemudian berniat di Tanda Niat."] },
  tawaf: { n: "Tawaf Qudum", sub: "Tawaf ketibaan di Makkah" },
  saie: { sub: "Safa ke Marwah, tanpa tahallul", intro: ["Saie dilakukan berulang-alik antara Safa dan Marwah sebanyak tujuh perjalanan.", "Dalam qiran, perbuatan umrah masuk ke dalam haji. Satu tawaf rukun dan satu saie mencukupi bagi kedua-duanya.", "Jemaah qiran belum bertahallul selepas saie. Mereka kekal berihram hingga hari raya korban."] },
  arafah: HJ_ARAFAH, mina: HJ_AQABAH("Jemaah qiran wajib menyembelih dam (seekor kambing). Jika tidak mampu, dia berpuasa tiga hari semasa haji dan tujuh hari selepas pulang."),
  ifadah: HJ_IFADAH("Jemaah qiran yang sudah bersaie selepas tawaf qudum tidak perlu bersaie lagi. Selepas tawaf ifadah berlakulah tahallul thani bagi haji dan umrah sekali gus."),
  tasyrik: HJ_TASYRIK, wada: HJ_WADA
});
const HJ_TM_ST = hjStx(["miqat", "tawaf", "saie", "ihramhaji", "arafah", "muzdalifah", "mina", "ifadah", "saiehaji", "tasyrik", "wada"], {
  miqat: { n: "Miqat Umrah", sub: "Berniat ihram umrah", intro: ["Haji tamattu' bermula dengan umrah dalam bulan-bulan haji. Jemaah berniat umrah dahulu di miqat.", "Selepas umrah, jemaah bertahallul dan boleh menanggalkan ihram sehingga tiba masa berihram haji.", "Tugas anda: pakai ihram di Bilik Ihram, kemudian berniat umrah di Tanda Niat."] },
  tawaf: { n: "Tawaf Umrah" }, saie: { n: "Saie dan Tahallul", sub: "Selesaikan umrah" },
  ihramhaji: { n: "Ihram Haji", sub: "8 Zulhijjah (Tarwiyah)", sign: "PENGINAPAN JEMAAH DI MAKKAH", ih: false, intro: ["Umrah telah selesai dan anda sudah bertahallul. Pada 8 Zulhijjah (hari Tarwiyah) anda berihram semula untuk haji.", "Jemaah yang berada di Makkah berniat ihram haji dari tempat penginapannya, kemudian bergerak ke Mina.", "Tugas anda: pakai ihram semula di Bilik Ihram dan berniat haji di Tanda Niat."] },
  arafah: { n: "Wuquf di Arafah", sub: "9 Zulhijjah" },
  mina: HJ_AQABAH("Jemaah tamattu' wajib menyembelih dam (seekor kambing) kerana menikmati kelonggaran antara umrah dan haji. Jika tidak mampu, dia berpuasa tiga hari semasa haji dan tujuh hari selepas pulang."),
  ifadah: HJ_IFADAH("Jemaah tamattu' perlu bersaie haji selepas tawaf ifadah, kerana saie yang lalu ialah saie umrah."),
  saiehaji: { n: "Saie Haji", sub: "Selepas tawaf ifadah", noTah: true, ih: false, saieMsg: ["Saie haji selesai. Tahallul thani berlaku.", "Tujuh perjalanan selesai. Dengan tawaf ifadah dan saie haji, semua larangan ihram terangkat."], intro: ["Jemaah tamattu' bersaie sekali lagi selepas tawaf ifadah. Saie ini ialah saie haji.", "Saie bermula di Safa dan berakhir di Marwah sebanyak tujuh perjalanan.", "Tiada bercukur lagi kerana ia sudah dilakukan selepas melontar Jamrah Aqabah."] },
  tasyrik: HJ_TASYRIK, wada: HJ_WADA
});
Object.assign(HJQ, {
  ifadah: [{ q: "Apakah hukum tawaf ifadah?", o: ["Rukun haji", "Wajib haji", "Sunat haji", "Harus"], a: 0, e: "Tawaf ifadah ialah rukun haji. Haji tidak sempurna tanpanya dan ia tidak boleh diganti dengan dam." }, { q: "Bilakah waktu tawaf ifadah bermula?", o: ["Selepas tengah malam 10 Zulhijjah, setelah wuquf", "Sebelum wuquf di Arafah", "Pada 8 Zulhijjah", "Hanya pada 13 Zulhijjah"], a: 0, e: "Waktu tawaf ifadah bermula selepas tengah malam 10 Zulhijjah, iaitu selepas wuquf di Arafah." }, { q: "Tahallul thani berlaku selepas jemaah menyempurnakan...", o: ["Melontar Jamrah Aqabah, bercukur atau bergunting, dan tawaf ifadah (berserta saie jika belum)", "Wuquf di Arafah sahaja", "Mabit di Muzdalifah sahaja", "Tawaf qudum sahaja"], a: 0, e: "Selepas tahallul thani, semua larangan ihram terangkat." }],
  tasyrik: [{ q: "Hari tasyrik ialah...", o: ["11, 12 dan 13 Zulhijjah", "8, 9 dan 10 Zulhijjah", "1, 2 dan 3 Syawal", "10 Muharram"], a: 0, e: "Hari tasyrik ialah tiga hari selepas hari raya korban." }, { q: "Tertib melontar pada hari tasyrik ialah...", o: ["Jamrah Ula, Wusta, kemudian Aqabah", "Aqabah, Wusta, kemudian Ula", "Wusta, Ula, kemudian Aqabah", "Mana-mana tertib"], a: 0, e: "Lontaran mesti tertib: Ula, Wusta dan Aqabah." }, { q: "Berapakah biji batu bagi setiap jamrah pada satu hari tasyrik?", o: ["7 biji", "3 biji", "21 biji", "49 biji"], a: 0, e: "Setiap jamrah tujuh biji, jadi 21 biji sehari bagi tiga jamrah." }, { q: "Apakah hukum bermalam (mabit) di Mina pada malam-malam tasyrik?", o: ["Wajib haji", "Rukun haji", "Sunat", "Harus"], a: 0, e: "Mabit di Mina ialah wajib haji. Meninggalkannya tanpa uzur dikenakan dam." }, { q: "Nafar awal bermaksud...", o: ["Meninggalkan Mina pada 12 Zulhijjah sebelum matahari terbenam selepas melontar", "Meninggalkan Arafah sebelum maghrib", "Tidak melontar langsung", "Meninggalkan Makkah tanpa tawaf wada'"], a: 0, e: "Jemaah yang nafar awal tidak perlu melontar pada 13 Zulhijjah." }],
  tanim: [{ q: "Mengapakah jemaah yang berada di Makkah keluar ke Tan'im untuk berumrah?", o: ["Ihram umrah bagi orang di Tanah Haram mesti bermula dari tanah halal", "Tan'im ialah tempat wuquf", "Kerana Tan'im lebih dekat dengan Arafah", "Kerana tawaf dilakukan di Tan'im"], a: 0, e: "Orang yang berada di Tanah Haram berihram umrah dari tanah halal terdekat seperti Tan'im atau Ji'ranah." }, { q: "Masjid Tan'im juga dikenali sebagai...", o: ["Masjid Aisyah", "Masjid Quba'", "Masjid Namirah", "Masjid Khaif"], a: 0, e: "Aisyah RA berihram umrah dari Tan'im atas suruhan Nabi SAW pada Haji Wada'." }],
  wada: [{ q: "Apakah hukum tawaf wada' bagi jemaah haji yang meninggalkan Makkah?", o: ["Wajib haji", "Rukun haji", "Sunat", "Makruh"], a: 0, e: "Meninggalkan tawaf wada' tanpa uzur dikenakan dam." }, { q: "Siapakah yang dikecualikan daripada tawaf wada'?", o: ["Perempuan yang haid atau nifas", "Jemaah lelaki yang sihat", "Jemaah tamattu' sahaja", "Jemaah yang membawa beg besar"], a: 0, e: "Perempuan yang haid atau nifas tidak wajib tawaf wada' dan tidak dikenakan dam." }, { q: "Bilakah tawaf wada' dilakukan?", o: ["Ketika hendak meninggalkan Makkah", "Sebaik tiba di Makkah", "Sebelum wuquf", "Di Mina pada hari tasyrik"], a: 0, e: "Tawaf wada' ialah amalan terakhir sebelum meninggalkan Makkah." }],
  saiehaji: [{ q: "Mengapakah jemaah tamattu' perlu bersaie lagi selepas tawaf ifadah?", o: ["Saie yang lalu ialah untuk umrah; saie haji belum dilakukan", "Saie mesti diulang setiap hari", "Kerana saie umrah tidak sah", "Tidak perlu bersaie lagi"], a: 0, e: "Umrah dan haji tamattu' ialah dua ibadah berasingan, maka setiap satu ada saienya." }, { q: "Saie dimulakan di...", o: ["Bukit Safa", "Bukit Marwah", "Hijr Ismail", "Maqam Ibrahim"], a: 0, e: "Saie bermula di Safa dan berakhir di Marwah." }]
});
const hjIh = (st) => (i) => ({ sex: HJ.sex, skin: HJ.skin, ihram: st[i] && st[i].ih != null ? st[i].ih : i > 0 });
HJ_MODES.umrah = hjMk("hjU", { title: "Simulasi Umrah", desc: "Tunaikan umrah dari Miqat hingga tahallul: berniat ihram, tawaf tujuh pusingan, solat sunat tawaf, saie dan bercukur atau bergunting. Simulasi ini untuk pembelajaran dan tidak menggantikan bimbingan ustaz atau pembimbing.", note: "Umrah tidak mempunyai wuquf, mabit atau lontar jamrah. Ia selesai selepas tahallul dan boleh dikerjakan sepanjang tahun.", st: HJ_UM_ST, niat: HJN.umrah, noTah: false, qx: { 0: hjMix("miqat", HJQ.umrah0), 2: hjMix("saie", HJQ.umrah2) }, good: "Semoga umrah anda mabrur!" });
HJ_MODES.ifrad = hjMk("hjI", { title: "Simulasi Haji Ifrad", desc: "Berihram dengan niat haji sahaja, tawaf qudum, saie, wuquf di Arafah, mabit di Muzdalifah, melontar di Mina, tawaf ifadah dan hari tasyrik. Selepas haji, berumrah dari Tan'im dan akhiri dengan tawaf wada'. Tiada dam.", note: "Haji dahulu, kemudian umrah dari Tan'im. Tiada dam. Jemaah kekal berihram hingga tahallul haji.", st: HJ_IF_ST, niat: (i) => i === 8 ? HJN.umrah : HJN.haji, noTah: true, look: hjIh(HJ_IF_ST), qx: { 0: hjMix("miqat", HJQ.ifrad0), 1: hjMix("tawaf", HJQ.ifrad1), 2: hjMix("saie", HJQ.ifrad2), 5: hjMix("mina", HJQ.ifrad5), 6: HJQ.ifadah.concat(HJQ.ifrad1), 7: HJQ.tasyrik, 8: HJQ.tanim.concat(HJQ.umrah0), 9: HJQ.wada }, good: "Semoga Haji Mabrur!" });
HJ_MODES.qiran = hjMk("hjQ", { title: "Simulasi Haji Qiran", desc: "Berniat haji dan umrah serentak dalam satu ihram. Satu tawaf dan satu saie mencukupi bagi kedua-duanya, kemudian laksanakan wuquf, mabit, lontar, tawaf ifadah, hari tasyrik dan tawaf wada'. Dam wajib dibayar.", note: "Niat haji dan umrah serentak dengan satu ihram. Wajib dam.", st: HJ_QR_ST, niat: HJN.qiran, noTah: true, look: hjIh(HJ_QR_ST), qx: { 0: hjMix("miqat", HJQ.qiran0), 1: hjMix("tawaf", HJQ.ifrad1), 2: hjMix("saie", HJQ.qiran2), 5: hjMix("mina", HJQ.qiran5), 6: HJQ.ifadah.concat(HJQ.qiran2), 7: HJQ.tasyrik, 8: HJQ.wada }, good: "Semoga Haji Mabrur!" });
HJ_MODES.tamattuk = hjMk("hjT", { title: "Simulasi Haji Tamattuk", desc: "Tunaikan umrah dahulu hingga bertahallul, kemudian berihram semula pada 8 Zulhijjah untuk haji. Teruskan ke Arafah, Muzdalifah dan Mina, tawaf ifadah, saie haji, hari tasyrik dan tawaf wada'. Dam wajib dibayar.", note: "Umrah dahulu, bertahallul, kemudian ihram haji pada 8 Zulhijjah. Wajib dam.", st: HJ_TM_ST, niat: (i) => i === 3 ? HJN.haji : HJN.umrah, noTah: false, look: hjIh(HJ_TM_ST), qx: { 0: hjMix("miqat", HJQ.tam0), 2: hjMix("saie", HJQ.umrah2), 3: hjMix("miqat", HJQ.tam3), 6: hjMix("mina", HJQ.tam6), 7: HJQ.ifadah, 8: HJQ.saiehaji.concat(HJQ.ifadah), 9: HJQ.tasyrik, 10: HJQ.wada }, good: "Semoga Haji Mabrur!" });

/* ---------- Ziarah Makkah dan Madinah (v18.11): berjalan ke setiap tempat bersejarah, baca sejarahnya, jawab soalan ---------- */
const ZR_TH = {
  gunung: { sky: ["#f2a65a", "#ffe4bd"], hill: "#a77a52", cloud: "#ffe9d0", accent: "#ffcf5a" },
  siang: { sky: ["#5fb4f2", "#eaf6ff"], hill: "#c4a878", cloud: "#ffffff", accent: "#ffd66b" },
  malam: { sky: ["#070c2a", "#2a2f6e"], hill: "#1a1c46", cloud: "#4a4f9a", accent: "#fff2b0" },
  madinah: { sky: ["#6ab8f0", "#eef7ff"], hill: "#9a7a5c", cloud: "#ffffff", accent: "#9fe0a0" }
};
const zrS = (id, n, sub, th, ground, intro, fk) => ({ id: id, n: n, sub: sub, th: ZR_TH[th], ground: ground, intro: intro, fk: fk });
const ZM_ST = [
  zrS("hira", "Gua Hira' (Jabal Nur)", "Tempat turunnya wahyu pertama", "gunung", "#cfae86", ["Jabal Nur terletak kira-kira 4 km di timur laut Masjidil Haram. Gua Hira' berada berhampiran puncaknya.", "Sebelum kerasulan, Nabi Muhammad SAW sering beruzlah (bertahannuth) di gua ini. Di sinilah Malaikat Jibril AS menyampaikan wahyu pertama, iaitu Surah al-'Alaq ayat 1 hingga 5.", "Tugas anda: berjalan ke Papan Ziarah di kaki Jabal Nur dan pelajari sejarahnya."], ["Wahyu pertama: “Iqra' bismi rabbikallazi khalaq” (al-'Alaq: 1–5).", "Peristiwa ini berlaku ketika Nabi SAW berusia 40 tahun, menurut pendapat masyhur pada bulan Ramadan.", "Pengajaran: Islam bermula dengan perintah membaca dan menuntut ilmu."]),
  zrS("thur", "Gua Thur (Jabal Thur)", "Tempat bersembunyi ketika hijrah", "gunung", "#c9a47c", ["Jabal Thur terletak di selatan Makkah. Gua Thur berada berhampiran puncaknya.", "Ketika hijrah ke Madinah (622 M), Nabi SAW dan Abu Bakar as-Siddiq RA bersembunyi di gua ini selama tiga malam daripada kaum Musyrikin Quraisy.", "Tugas anda: berjalan ke Papan Ziarah di kaki Jabal Thur."], ["Peristiwa ini dirakam dalam Surah at-Taubah ayat 40: “La tahzan, innallaha ma'ana” (Jangan bersedih, sesungguhnya Allah bersama kita).", "Pada malam hijrah, Saidina Ali RA tidur di tempat tidur Nabi SAW.", "Pengajaran: tawakal kepada Allah selepas berusaha dan merancang dengan teliti."]),
  zrS("mala", "Perkuburan Ma'la", "Makam Saidatina Khadijah RA", "siang", "#d9c9a6", ["Ma'la (Jannatul Ma'la) ialah tanah perkuburan tertua di Makkah, tidak jauh dari Masjidil Haram.", "Di sini dimakamkan isteri pertama Nabi SAW, Saidatina Khadijah binti Khuwailid RA, datuk baginda Abdul Muttalib dan bapa saudaranya Abu Talib.", "Tugas anda: berjalan ke Papan Ziarah di pintu perkuburan."], ["Saidatina Khadijah RA ialah orang pertama yang beriman dengan Nabi SAW.", "Adab ziarah kubur: memberi salam, mendoakan ahli kubur dan mengingati mati. Dilarang meminta hajat kepada ahli kubur.", "Doa ziarah: “Assalamu'alaikum ahlad diyar minal mu'minin wal muslimin…”"]),
  zrS("rahmah", "Jabal Rahmah (Arafah)", "Bukit di padang Arafah", "gunung", "#d6bd8c", ["Jabal Rahmah ialah bukit kecil di padang Arafah, kira-kira 20 km di tenggara Masjidil Haram.", "Nabi SAW berwuquf berhampiran kaki bukit ini ketika Haji Wada' pada tahun 10 Hijrah.", "Tugas anda: berjalan ke Papan Ziarah di kaki Jabal Rahmah."], ["Wuquf sah di mana-mana bahagian Arafah, bukan hanya di bukit ini.", "Tiada amalan khusus untuk memanjat bukit atau menyentuh tiang di puncaknya.", "Pengajaran: ikut sunnah dengan ilmu dan jauhi amalan yang tiada dalilnya."]),
  zrS("kiswah", "Kompleks Kiswah", "Kain penutup Kaabah", "siang", "#e6dccb", ["Kiswah ialah kain sutera hitam yang menutupi Kaabah, dihiasi sulaman ayat al-Quran dengan benang bersalut emas dan perak.", "Kiswah ditenun dan disulam di kompleks kiswah di Makkah, dan ditukar dengan kiswah baharu setahun sekali.", "Tugas anda: berjalan ke Papan Ziarah di hadapan kompleks."], ["Tali pinggang (hizam) kiswah disulam dengan ayat-ayat al-Quran.", "Kiswah lama dipotong dan dihadiahkan kepada tetamu dan institusi tertentu.", "Mengagungkan syiar Allah tanda ketakwaan hati (al-Hajj: 32)."]),
  zrS("jiranah", "Masjid Ji'ranah", "Miqat umrah dari tanah halal", "siang", "#e3d6b8", ["Ji'ranah terletak di luar Tanah Haram, lebih kurang 25 km di timur laut Makkah.", "Nabi SAW berihram umrah dari sini selepas Perang Hunain pada tahun 8 Hijrah.", "Tugas anda: berjalan ke Papan Ziarah di hadapan masjid."], ["Orang yang berada di Tanah Haram dan hendak berumrah mesti keluar ke tanah halal untuk berihram.", "Tan'im dan Ji'ranah antara tempat yang biasa digunakan.", "Pengajaran: ibadah dilakukan mengikut cara yang diajar oleh Nabi SAW."]),
  zrS("tanim", "Masjid Tan'im (Masjid Aisyah)", "Tanah halal terdekat", "siang", "#e8dcc2", ["Tan'im ialah tanah halal yang paling hampir dengan Masjidil Haram, kira-kira 7 km darinya.", "Pada Haji Wada', Nabi SAW menyuruh Abdul Rahman bin Abu Bakar membawa adiknya, Saidatina Aisyah RA, ke Tan'im untuk berihram umrah. Kerana itu masjid ini dikenali sebagai Masjid Aisyah.", "Tugas anda: berjalan ke Papan Ziarah di hadapan masjid."], ["Ramai jemaah berihram umrah sunat dari Tan'im.", "Saidatina Aisyah RA ialah isteri Nabi SAW dan perawi hadis yang banyak.", "Pengajaran: Islam memudahkan dan memberi peluang kepada setiap orang untuk beribadah."]),
  zrS("masyar", "Masy'aril Haram (Muzdalifah)", "Berzikir selepas Arafah", "malam", "#6a6866", ["Muzdalifah terletak antara Arafah dan Mina. Masjid Masy'aril Haram dibina di tempat Nabi SAW berzikir dan berdoa pada pagi 10 Zulhijjah.", "Allah SWT berfirman: “Apabila kamu bertolak dari Arafah, maka berzikirlah kepada Allah di Masy'aril Haram” (al-Baqarah: 198).", "Tugas anda: berjalan ke Papan Ziarah di hadapan masjid."], ["Jemaah haji bermabit di Muzdalifah dan mengutip batu untuk melontar di Mina.", "Mabit di Muzdalifah ialah wajib haji.", "Pengajaran: banyakkan zikir dan doa selepas melakukan ibadah."]),
  zrS("khaif", "Masjid al-Khaif (Mina)", "Masjid di lembah Mina", "siang", "#e3d3ae", ["Mina terletak lebih kurang 7 km di timur Masjidil Haram dan dikenali sebagai kota khemah.", "Masjid al-Khaif terletak di kaki bukit selatan Mina. Nabi SAW bersolat di tempat ini ketika berada di Mina semasa Haji Wada'.", "Tugas anda: berjalan ke Papan Ziarah di hadapan masjid."], ["Di Mina terletak tiga jamrah: Ula, Wusta dan Aqabah.", "Jemaah haji bermalam di Mina pada malam hari tasyrik.", "Pengajaran: kesabaran dan disiplin ketika berada dalam himpunan manusia yang ramai."])
];
const ZD_ST = [
  zrS("nabawi", "Masjid Nabawi", "Masjid Rasulullah SAW", "madinah", "#efe7d6", ["Masjid Nabawi dibina oleh Nabi SAW bersama para sahabat sejurus selepas hijrah ke Madinah pada tahun 1 Hijrah.", "Sabda Nabi SAW: “Solat di masjidku ini lebih baik daripada seribu solat di masjid lain kecuali Masjidil Haram” (riwayat al-Bukhari dan Muslim).", "Tugas anda: berjalan ke Papan Ziarah di halaman masjid."], ["Masjid Nabawi menjadi pusat ibadah, ilmu, pentadbiran dan masyarakat Islam yang pertama.", "Payung-payung gergasi di halaman masjid melindungi jemaah daripada panas.", "Adab: masuk dengan kaki kanan dan membaca doa masuk masjid."]),
  zrS("raudhah", "Raudhah", "Taman daripada taman-taman syurga", "madinah", "#f4efe6", ["Raudhah ialah kawasan di dalam Masjid Nabawi antara mimbar Nabi SAW dan rumah baginda (kini makam).", "Sabda Nabi SAW: “Antara rumahku dan mimbarku ialah satu taman daripada taman-taman syurga” (riwayat al-Bukhari dan Muslim).", "Tugas anda: berjalan ke Papan Ziarah di tepi permaidani hijau."], ["Kawasan Raudhah ditandai dengan permaidani berwarna hijau.", "Jemaah bersolat dan berdoa di sini mengikut giliran yang ditetapkan.", "Adab: bersabar, tidak berasak-asak dan tidak menyakiti jemaah lain."]),
  zrS("makam", "Makam Rasulullah ﷺ", "Memberi salam kepada baginda", "madinah", "#efe7d6", ["Rasulullah SAW dimakamkan di bilik Saidatina Aisyah RA, di bahagian timur Masjid Nabawi, di bawah Kubah Hijau.", "Di sebelah baginda dimakamkan Abu Bakar as-Siddiq RA dan Umar al-Khattab RA.", "Tugas anda: berjalan ke Papan Ziarah di hadapan dinding makam."], ["Ucapkan dengan tenang: “Assalamu'alaika ya Rasulallah”.", "Kemudian beri salam kepada Abu Bakar RA dan Umar RA.", "Adab: merendahkan suara, tidak berasak-asak dan berdoa menghadap kiblat."]),
  zrS("baqi", "Perkuburan Baqi'", "Makam para sahabat dan Ahlul Bait", "madinah", "#d9c9a6", ["Baqi' (Baqi' al-Gharqad) ialah tanah perkuburan utama Madinah, bersebelahan Masjid Nabawi.", "Di sini dimakamkan ramai sahabat, termasuk Khalifah Uthman bin Affan RA, putera Nabi SAW iaitu Ibrahim, dan ramai isteri baginda (Ummahatul Mukminin).", "Tugas anda: berjalan ke Papan Ziarah di pintu perkuburan."], ["Nabi SAW sering menziarahi Baqi' dan mendoakan ahlinya.", "Doa: “Assalamu'alaikum dara qaumin mu'minin, wa inna insya-Allahu bikum lahiqun.”", "Adab: memberi salam, mendoakan dan mengambil iktibar tentang kematian."]),
  zrS("quba", "Masjid Quba'", "Masjid pertama dalam Islam", "madinah", "#efe7d6", ["Masjid Quba' terletak kira-kira 3.5 km di selatan Masjid Nabawi. Ia masjid pertama yang dibina oleh Nabi SAW ketika tiba di Madinah semasa hijrah.", "Sabda Nabi SAW: “Sesiapa yang bersuci di rumahnya kemudian datang ke Masjid Quba' lalu bersolat di dalamnya, baginya pahala seperti umrah” (riwayat Ibnu Majah).", "Tugas anda: berjalan ke Papan Ziarah di hadapan masjid."], ["Masjid ini disebut dalam Surah at-Taubah ayat 108 sebagai masjid yang diasaskan atas takwa.", "Nabi SAW menziarahi Quba' setiap hari Sabtu, berjalan kaki atau berkenderaan.", "Pengajaran: pembinaan masyarakat bermula dengan masjid."]),
  zrS("qiblatain", "Masjid Qiblatain", "Masjid dua kiblat", "madinah", "#efe7d6", ["Masjid Qiblatain terletak di barat laut Madinah. Namanya bermaksud masjid dua kiblat.", "Pada tahun 2 Hijrah turun perintah menukar arah kiblat dari Baitulmaqdis ke Kaabah (al-Baqarah: 144). Menurut riwayat masyhur, perintah itu sampai ketika solat sedang dilakukan di masjid ini, lalu jemaah berpaling ke arah Kaabah.", "Tugas anda: berjalan ke Papan Ziarah di hadapan masjid."], ["Kiblat pertama umat Islam ialah Baitulmaqdis (Masjid al-Aqsa).", "Perubahan kiblat menguji ketaatan orang beriman.", "Pengajaran: patuh segera kepada perintah Allah dan Rasul."]),
  zrS("khandaq", "Khandaq (Masjid Tujuh)", "Medan Perang Khandaq", "madinah", "#cdb48c", ["Perang Khandaq (Ahzab) berlaku pada tahun 5 Hijrah apabila pakatan Quraisy dan sekutunya mengepung Madinah.", "Atas cadangan Salman al-Farisi RA, umat Islam menggali parit (khandaq) di utara Madinah. Kawasan itu kini dikenali dengan Masjid Tujuh (Sab'ah Masajid) di kaki Bukit Sala'.", "Tugas anda: berjalan ke Papan Ziarah di tepi parit."], ["Nabi SAW sendiri turut menggali parit bersama para sahabat.", "Peristiwa ini disebut dalam Surah al-Ahzab.", "Pengajaran: bermesyuarat, bekerjasama dan menerima idea yang baik."]),
  zrS("uhud", "Jabal Uhud", "Medan Perang Uhud", "madinah", "#c79a72", ["Jabal Uhud terletak kira-kira 5 km di utara Masjid Nabawi. Di kakinya berlaku Perang Uhud pada tahun 3 Hijrah.", "Sebahagian pemanah meninggalkan Bukit Rumat kerana menyangka perang sudah dimenangi, lalu tentera Islam diserang dari belakang. Bapa saudara Nabi SAW, Saidina Hamzah RA, gugur syahid dan dimakamkan di sini.", "Tugas anda: berjalan ke Papan Ziarah di Makam Syuhada Uhud."], ["Sabda Nabi SAW: “Uhud ialah gunung yang mencintai kita dan kita mencintainya” (riwayat al-Bukhari).", "Seramai 70 sahabat gugur syahid dalam Perang Uhud.", "Pengajaran: taat kepada arahan pemimpin dan tidak tamak kepada harta dunia."])
];
const ZR_Q = {
  hira: [{ q: "Wahyu pertama diturunkan kepada Nabi SAW di...", o: ["Gua Hira'", "Gua Thur", "Masjid Quba'", "Bukit Safa"], a: 0, e: "Wahyu pertama diturunkan di Gua Hira', Jabal Nur." }, { q: "Wahyu pertama ialah ayat 1 hingga 5 Surah...", o: ["al-'Alaq", "al-Fatihah", "al-Muddaththir", "al-Baqarah"], a: 0, e: "Wahyu pertama ialah Surah al-'Alaq ayat 1–5." }, { q: "Perkataan pertama dalam wahyu pertama ialah...", o: ["Iqra'", "Qul", "Ya ayyuhal muddaththir", "Alif Lam Mim"], a: 0, e: "Iqra' bermaksud bacalah." }, { q: "Pengajaran utama daripada wahyu pertama ialah...", o: ["Kepentingan membaca dan menuntut ilmu", "Kepentingan berniaga", "Kepentingan berperang", "Kepentingan bermusafir"], a: 0, e: "Wahyu pertama menyeru manusia membaca dengan nama Allah." }],
  thur: [{ q: "Siapakah yang menemani Nabi SAW di Gua Thur?", o: ["Abu Bakar as-Siddiq RA", "Umar al-Khattab RA", "Ali bin Abi Talib RA", "Uthman bin Affan RA"], a: 0, e: "Abu Bakar RA menemani Nabi SAW sepanjang hijrah." }, { q: "Berapa malamkah Nabi SAW bersembunyi di Gua Thur?", o: ["Tiga malam", "Satu malam", "Tujuh malam", "Empat puluh malam"], a: 0, e: "Baginda bersembunyi selama tiga malam." }, { q: "“La tahzan, innallaha ma'ana” terdapat dalam surah...", o: ["at-Taubah", "Yasin", "al-Kahfi", "al-Mulk"], a: 0, e: "Surah at-Taubah ayat 40." }, { q: "Siapakah yang tidur di tempat tidur Nabi SAW pada malam hijrah?", o: ["Ali bin Abi Talib RA", "Abu Bakar RA", "Bilal bin Rabah RA", "Zaid bin Harithah RA"], a: 0, e: "Ali RA tidur di tempat tidur Nabi SAW untuk mengelirukan musuh." }],
  mala: [{ q: "Isteri Nabi SAW yang dimakamkan di Ma'la ialah...", o: ["Khadijah binti Khuwailid RA", "Aisyah RA", "Hafsah RA", "Ummu Salamah RA"], a: 0, e: "Khadijah RA wafat di Makkah sebelum hijrah." }, { q: "Adab yang betul ketika menziarahi kubur ialah...", o: ["Memberi salam dan mendoakan ahli kubur", "Meminta hajat kepada ahli kubur", "Bergelak ketawa", "Memijak kubur"], a: 0, e: "Ziarah kubur untuk mendoakan dan mengingati mati." }, { q: "Tujuan utama ziarah kubur ialah...", o: ["Mengingati mati dan hari akhirat", "Bersiar-siar", "Mengambil gambar", "Meminta berkat daripada kubur"], a: 0, e: "Sabda Nabi SAW: ziarahilah kubur kerana ia mengingatkan kamu kepada akhirat." }],
  rahmah: [{ q: "Jabal Rahmah terletak di...", o: ["Arafah", "Mina", "Muzdalifah", "Madinah"], a: 0, e: "Jabal Rahmah ialah bukit di padang Arafah." }, { q: "Wuquf di Arafah sah dilakukan...", o: ["Di mana-mana kawasan Arafah", "Hanya di puncak Jabal Rahmah", "Hanya di bawah tiang Jabal Rahmah", "Di luar sempadan Arafah"], a: 0, e: "Seluruh Arafah ialah tempat wuquf." }, { q: "Haji Wada' berlaku pada tahun...", o: ["10 Hijrah", "2 Hijrah", "8 Hijrah", "13 Hijrah"], a: 0, e: "Haji Wada' ialah haji terakhir Nabi SAW pada tahun 10 Hijrah." }],
  kiswah: [{ q: "Kiswah ialah...", o: ["Kain penutup Kaabah", "Pakaian ihram", "Sejadah Masjidil Haram", "Bendera Makkah"], a: 0, e: "Kiswah menutupi Kaabah." }, { q: "Warna utama kiswah ialah...", o: ["Hitam", "Hijau", "Putih", "Merah"], a: 0, e: "Kiswah berwarna hitam dengan sulaman keemasan." }, { q: "Kiswah ditukar dengan yang baharu...", o: ["Setahun sekali", "Setiap minggu", "Setiap sepuluh tahun", "Tidak pernah ditukar"], a: 0, e: "Kiswah ditukar setahun sekali." }],
  jiranah: [{ q: "Nabi SAW berihram umrah dari Ji'ranah selepas peperangan...", o: ["Hunain", "Badar", "Uhud", "Khandaq"], a: 0, e: "Selepas Perang Hunain pada tahun 8 Hijrah." }, { q: "Orang yang berada di Tanah Haram dan ingin berumrah mesti berihram dari...", o: ["Tanah halal di luar sempadan Tanah Haram", "Hadapan Kaabah", "Bukit Safa", "Hotel penginapan di Makkah"], a: 0, e: "Ihram umrah bagi penduduk Makkah bermula dari tanah halal." }],
  tanim: [{ q: "Masjid Tan'im juga dikenali sebagai...", o: ["Masjid Aisyah", "Masjid Jin", "Masjid Khaif", "Masjid Bilal"], a: 0, e: "Aisyah RA berihram umrah dari Tan'im." }, { q: "Siapakah yang membawa Aisyah RA ke Tan'im?", o: ["Abdul Rahman bin Abu Bakar", "Ali bin Abi Talib", "Usamah bin Zaid", "Bilal bin Rabah"], a: 0, e: "Abang Aisyah RA, Abdul Rahman, membawanya atas suruhan Nabi SAW." }, { q: "Tan'im ialah...", o: ["Tanah halal yang paling hampir dengan Masjidil Haram", "Tempat wuquf", "Tempat melontar jamrah", "Perkuburan di Madinah"], a: 0, e: "Tan'im ialah tanah halal terdekat dengan Masjidil Haram." }],
  masyar: [{ q: "Masy'aril Haram terletak di...", o: ["Muzdalifah", "Arafah", "Madinah", "Taif"], a: 0, e: "Masjid Masy'aril Haram terletak di Muzdalifah." }, { q: "Ayat yang menyebut Masy'aril Haram ialah...", o: ["al-Baqarah: 198", "al-Fatihah: 5", "Yasin: 1", "al-Ikhlas: 1"], a: 0, e: "Al-Baqarah ayat 198." }, { q: "Muzdalifah terletak antara...", o: ["Arafah dan Mina", "Makkah dan Madinah", "Safa dan Marwah", "Quba' dan Uhud"], a: 0, e: "Jemaah bergerak dari Arafah ke Muzdalifah, kemudian ke Mina." }],
  khaif: [{ q: "Masjid al-Khaif terletak di...", o: ["Mina", "Arafah", "Madinah", "Jeddah"], a: 0, e: "Masjid al-Khaif di kaki bukit selatan Mina." }, { q: "Mina dikenali sebagai...", o: ["Kota khemah", "Kota bunga", "Kota pelabuhan", "Kota kurma"], a: 0, e: "Ratusan ribu khemah didirikan di Mina." }, { q: "Jamrah yang dilontar pada 10 Zulhijjah ialah...", o: ["Jamrah Aqabah sahaja", "Jamrah Ula sahaja", "Ketiga-tiga jamrah", "Jamrah Wusta sahaja"], a: 0, e: "Pada hari raya korban hanya Jamrah Aqabah dilontar." }],
  nabawi: [{ q: "Solat di Masjid Nabawi lebih baik daripada...", o: ["Seribu solat di masjid lain kecuali Masjidil Haram", "Sepuluh solat di rumah", "Seratus ribu solat di mana-mana masjid", "Sama sahaja dengan masjid lain"], a: 0, e: "Riwayat al-Bukhari dan Muslim." }, { q: "Masjid Nabawi dibina pada tahun...", o: ["1 Hijrah", "5 Hijrah", "10 Hijrah", "Sebelum hijrah"], a: 0, e: "Ia dibina sejurus selepas hijrah." }, { q: "Pada zaman Nabi SAW, Masjid Nabawi berfungsi sebagai...", o: ["Pusat ibadah, ilmu, pentadbiran dan masyarakat", "Tempat ibadah sahaja", "Pasar", "Kubu tentera sahaja"], a: 0, e: "Masjid ialah pusat kehidupan masyarakat Islam." }],
  raudhah: [{ q: "Raudhah terletak antara...", o: ["Mimbar dan rumah (makam) Nabi SAW", "Kaabah dan Maqam Ibrahim", "Safa dan Marwah", "Quba' dan Qiblatain"], a: 0, e: "Antara rumah dan mimbar Nabi SAW." }, { q: "Raudhah disifatkan oleh Nabi SAW sebagai...", o: ["Satu taman daripada taman-taman syurga", "Pintu syurga", "Kolam Kautsar", "Tempat wuquf"], a: 0, e: "Riwayat al-Bukhari dan Muslim." }, { q: "Warna permaidani yang menandakan Raudhah ialah...", o: ["Hijau", "Merah", "Hitam", "Biru"], a: 0, e: "Permaidani hijau menandakan Raudhah." }],
  makam: [{ q: "Dua sahabat yang dimakamkan di sebelah Rasulullah SAW ialah...", o: ["Abu Bakar RA dan Umar RA", "Uthman RA dan Ali RA", "Hamzah RA dan Abbas RA", "Bilal RA dan Salman RA"], a: 0, e: "Abu Bakar dan Umar RA dimakamkan di sebelah baginda." }, { q: "Makam Nabi SAW asalnya ialah bilik...", o: ["Saidatina Aisyah RA", "Saidatina Fatimah RA", "Saidatina Khadijah RA", "Abu Bakar RA"], a: 0, e: "Baginda wafat dan dimakamkan di bilik Aisyah RA." }, { q: "Adab ketika memberi salam di makam Rasulullah SAW ialah...", o: ["Merendahkan suara dan bertenang", "Meninggikan suara", "Menolak jemaah lain", "Mengusap dinding makam"], a: 0, e: "Allah melarang meninggikan suara di hadapan Nabi SAW (al-Hujurat: 2)." }],
  baqi: [{ q: "Khalifah yang dimakamkan di Baqi' ialah...", o: ["Uthman bin Affan RA", "Abu Bakar RA", "Umar RA", "Muawiyah"], a: 0, e: "Uthman RA dimakamkan di Baqi'." }, { q: "Putera Nabi SAW yang dimakamkan di Baqi' ialah...", o: ["Ibrahim", "Qasim", "Abdullah", "Zaid"], a: 0, e: "Ibrahim wafat ketika kecil di Madinah." }, { q: "Baqi' terletak...", o: ["Bersebelahan Masjid Nabawi", "Di Arafah", "Di Mina", "Di Taif"], a: 0, e: "Baqi' di sebelah timur Masjid Nabawi." }],
  quba: [{ q: "Masjid pertama yang dibina oleh Nabi SAW ialah...", o: ["Masjid Quba'", "Masjid Nabawi", "Masjid Qiblatain", "Masjidil Haram"], a: 0, e: "Masjid Quba' dibina ketika baginda tiba di Madinah." }, { q: "Pahala bersolat di Masjid Quba' selepas bersuci dari rumah ialah...", o: ["Seperti pahala umrah", "Seperti pahala haji", "Seribu solat", "Tiada kelebihan"], a: 0, e: "Riwayat Ibnu Majah." }, { q: "Masjid Quba' disebut sebagai masjid yang diasaskan atas takwa dalam surah...", o: ["at-Taubah: 108", "al-Baqarah: 144", "al-Isra': 1", "al-Hajj: 27"], a: 0, e: "Surah at-Taubah ayat 108." }],
  qiblatain: [{ q: "Kiblat pertama umat Islam ialah...", o: ["Baitulmaqdis (Masjid al-Aqsa)", "Kaabah", "Masjid Quba'", "Jabal Uhud"], a: 0, e: "Umat Islam menghadap Baitulmaqdis sebelum perintah ditukar." }, { q: "Ayat perintah menukar kiblat ialah...", o: ["al-Baqarah: 144", "al-Fatihah: 7", "an-Nas: 1", "al-Kautsar: 2"], a: 0, e: "Al-Baqarah ayat 144." }, { q: "Kiblat ditukar pada tahun...", o: ["2 Hijrah", "1 Hijrah", "5 Hijrah", "9 Hijrah"], a: 0, e: "Pada tahun 2 Hijrah." }],
  khandaq: [{ q: "Siapakah yang mencadangkan penggalian parit?", o: ["Salman al-Farisi RA", "Khalid al-Walid RA", "Abu Hurairah RA", "Anas bin Malik RA"], a: 0, e: "Salman RA membawa idea strategi parit dari Parsi." }, { q: "Perang Khandaq juga dikenali sebagai...", o: ["Perang Ahzab", "Perang Badar", "Perang Tabuk", "Perang Mu'tah"], a: 0, e: "Ahzab bermaksud pakatan puak-puak." }, { q: "Perang Khandaq berlaku pada tahun...", o: ["5 Hijrah", "2 Hijrah", "3 Hijrah", "8 Hijrah"], a: 0, e: "Tahun 5 Hijrah." }],
  uhud: [{ q: "Bapa saudara Nabi SAW yang syahid dalam Perang Uhud ialah...", o: ["Hamzah bin Abdul Muttalib RA", "Abbas RA", "Abu Talib", "Abu Lahab"], a: 0, e: "Hamzah RA digelar Penghulu Para Syuhada." }, { q: "Punca tentera Islam terdedah kepada serangan dalam Perang Uhud ialah...", o: ["Pemanah meninggalkan Bukit Rumat untuk mengutip harta rampasan", "Kekurangan senjata", "Hujan lebat", "Tentera Islam tidak berlatih"], a: 0, e: "Pengajaran: taat kepada arahan pemimpin." }, { q: "Perang Uhud berlaku pada tahun...", o: ["3 Hijrah", "2 Hijrah", "5 Hijrah", "10 Hijrah"], a: 0, e: "Tahun 3 Hijrah." }]
};
/* bukit berlapis dengan gua kecil (pilihan) */
function zrHill(W, x, z, w, d, n, col, cave) {
  for (let i = 0; i < n; i++) hjBox(W, x, i * 2.2 + 1.1, z, w * (1 - i / (n + 1)), 2.2, d * (1 - i / (n + 1)), dwHexMix(col, 1 - i * 0.04), i === 0);
  if (cave) { const k = n - 2, y = k * 2.2 + 1.2, dz = d * (1 - k / (n + 1)) / 2 + 0.05; hjBox(W, x + 2, y, z - dz, 2.2, 2, 0.2, "#1a1410"); }
}
function zrDome(W, x, y, z, r, col) { [1, 0.85, 0.62, 0.32].forEach((k, i) => hjCyl(W, x, y + i * r * 0.32, z, r * k, r * 0.32, col, 12)); }
function zrGraves(W, x0, z0, w, d) {
  hjBox(W, x0 + w / 2, 0.9, z0, w, 1.8, 0.5, "#d8cdb6", true); hjBox(W, x0, 0.9, z0 + d / 2, 0.5, 1.8, d, "#d8cdb6", true); hjBox(W, x0 + w, 0.9, z0 + d / 2, 0.5, 1.8, d, "#d8cdb6", true); hjBox(W, x0 + w / 2, 0.9, z0 + d, w, 1.8, 0.5, "#d8cdb6", true);
  for (let i = 2; i < w - 1; i += 2.4) for (let j = 2; j < d - 1; j += 3) { hjBox(W, x0 + i, 0.12, z0 + j, 0.9, 0.24, 1.8, "#a89a84"); hjBox(W, x0 + i, 0.3, z0 + j - 0.7, 0.25, 0.4, 0.1, "#8a7f72"); }
}
function zrUmbrella(W, x, z) { hjCyl(W, x, 0, z, 0.25, 7, "#f4efe6", 6); hjBox(W, x, 7.2, z, 7, 0.3, 7, "#fbf7ee"); }
function zrBuild(id) {
  const S = hjSt().filter((s) => s.id === id)[0], W = hjNew(S.th, S.ground), R = (a, b) => a + Math.random() * (b - a);
  W.bounds = [-30, 30, -10, 30]; hjFloor(W, -34, -14, 68, 58, S.ground);
  W.signs.push({ x: 0, y: 3.6, z: 14, t: "PAPAN ZIARAH" }); hjBox(W, 0, 1.4, 14.3, 3.2, 2.2, 0.2, "#2f5d8a"); hjCyl(W, -1.4, 0, 14.4, 0.12, 1.2, "#555", 6); hjCyl(W, 1.4, 0, 14.4, 0.12, 1.2, "#555", 6);
  if (id === "hira" || id === "thur") { zrHill(W, 0, 46, 60, 26, 9, id === "hira" ? "#8a6a4a" : "#9a7650", true); W.signs.push({ x: 0, y: 22, z: 36, t: id === "hira" ? "JABAL NUR · GUA HIRA'" : "JABAL THUR · GUA THUR" }); for (let i = 0; i < 6; i++) hjBox(W, R(-8, 8), 0.15, 24 + i * 1.6, 2.6, 0.3 + i * 0.25, 1.2, "#b89a74"); }
  else if (id === "mala" || id === "baqi") { zrGraves(W, -18, 20, 36, 18); hjBox(W, 0, 2.2, 20, 5, 4.4, 0.6, "#2f6b4f"); W.signs.push({ x: 0, y: 5.4, z: 20, t: id === "mala" ? "PERKUBURAN MA'LA" : "PERKUBURAN BAQI'" }); }
  else if (id === "rahmah") { zrHill(W, 0, 40, 30, 22, 6, "#a8865c"); hjBox(W, 0, 16, 40, 1.4, 6, 1.4, "#f4efe6"); W.signs.push({ x: 0, y: 21, z: 40, t: "JABAL RAHMAH" }); for (let i = -4; i <= 4; i++) hjTent(W, i * 6, 26, 3); }
  else if (id === "kiswah") { hjBox(W, 0, 4, 34, 34, 8, 14, "#e9e1d0", true); hjBox(W, 0, 8.3, 34, 34.4, 0.6, 14.4, "#c9a64a"); hjBox(W, 0, 4.2, 26.9, 10, 6.4, 0.2, "#141416"); hjBox(W, 0, 6, 26.8, 10, 0.8, 0.1, "#d8b24a"); for (let i = -3; i <= 3; i++) hjBox(W, i * 1.4, 3.4, 26.8, 0.5, 0.5, 0.1, "#d8b24a"); W.signs.push({ x: 0, y: 10.2, z: 34, t: "KOMPLEKS KISWAH KAABAH" }); }
  else if (id === "masyar" || id === "khaif" || id === "jiranah" || id === "tanim") { hjMosque(W, 0, 36, id === "khaif" || id === "tanim" ? 26 : 18); W.signs.push({ x: 0, y: 17, z: 30, t: { masyar: "MASJID MASY'ARIL HARAM", khaif: "MASJID AL-KHAIF", jiranah: "MASJID JI'RANAH", tanim: "MASJID TAN'IM (AISYAH)" }[id] }); if (id === "khaif") for (let i = 0; i < 6; i++) [-1, 1].forEach((s) => hjTent(W, s * (20 + (i % 3) * 4), 8 + Math.floor(i / 3) * 8, 3.2)); else for (let i = 0; i < 6; i++) hjPalm(W, R(-28, 28), R(-6, 24), R(4, 6)); }
  else if (id === "nabawi") { hjBox(W, 0, 6, 40, 50, 12, 10, "#efe6d4", true); zrDome(W, 14, 12, 40, 4, "#2e8b57"); for (const x of [-26, -10, 10, 26]) { hjCyl(W, x, 0, 34, 1, 26, "#f4efe6", 8, true); hjCyl(W, x, 26, 34, 1.4, 1, "#d8b24a", 8); } for (let i = -2; i <= 2; i++) for (let j = 0; j < 2; j++) zrUmbrella(W, i * 10, 20 + j * 8); W.signs.push({ x: 0, y: 14, z: 35, t: "MASJID NABAWI" }); }
  else if (id === "raudhah") { hjFloor(W, -12, 18, 24, 14, "#3a8a5a", "#2a6a44", 0.05); for (let i = -2; i <= 2; i++) for (let j = 0; j < 2; j++) hjCyl(W, i * 5, 0, 20 + j * 8, 0.6, 9, "#f4efe6", 8, true); hjBox(W, -12, 2, 32, 2, 4, 3, "#c9a64a", true); hjBox(W, 12, 3, 32, 4, 6, 3, "#c9a64a", true); hjBox(W, 0, 10, 32, 60, 0.6, 30, "#efe6d4"); W.signs.push({ x: -12, y: 5, z: 32, t: "MIMBAR" }, { x: 12, y: 7, z: 32, t: "RUMAH / MAKAM NABI ﷺ" }, { x: 0, y: 1.6, z: 25, t: "RAUDHAH" }); }
  else if (id === "makam") { hjBox(W, 0, 3.4, 34, 22, 6.8, 6, "#c9a64a", true); for (let i = -4; i <= 4; i++) hjBox(W, i * 2.4, 3, 30.9, 1.4, 4, 0.1, "#2e7a52"); zrDome(W, 0, 7, 34, 6, "#2e8b57"); W.signs.push({ x: 0, y: 16, z: 34, t: "MAKAM RASULULLAH ﷺ · ABU BAKAR RA · UMAR RA" }); hjFloor(W, -14, 18, 28, 10, "#e8e0cc", null, 0.03); }
  else if (id === "quba") { hjBox(W, 0, 5, 38, 30, 10, 12, "#fbf7ee", true); [-8, 0, 8].forEach((x) => zrDome(W, x, 10, 38, 3.4, "#fbf7ee")); [-17, 17].forEach((x) => [33, 43].forEach((z) => { hjCyl(W, x, 0, z, 1, 22, "#fbf7ee", 8, true); hjCyl(W, x, 22, z, 1.3, 1, "#d8b24a", 8); })); W.signs.push({ x: 0, y: 15, z: 32, t: "MASJID QUBA'" }); for (let i = 0; i < 8; i++) hjPalm(W, R(-28, 28), R(-6, 24), R(4, 6)); }
  else if (id === "qiblatain") { hjBox(W, 0, 5, 38, 28, 10, 12, "#fbf7ee", true); zrDome(W, -6, 10, 38, 3.6, "#fbf7ee"); zrDome(W, 6, 10, 38, 3.6, "#fbf7ee"); [-15, 15].forEach((x) => { hjCyl(W, x, 0, 38, 1, 22, "#fbf7ee", 8, true); hjCyl(W, x, 22, 38, 1.3, 1, "#d8b24a", 8); }); W.signs.push({ x: 0, y: 15, z: 32, t: "MASJID QIBLATAIN (DUA KIBLAT)" }); hjBox(W, -10, 0.04, 22, 0.6, 0.05, 6, "#d84a4a"); hjBox(W, 10, 0.04, 22, 0.6, 0.05, 6, "#3dc27a"); W.signs.push({ x: -10, y: 1.4, z: 25, t: "ARAH BAITULMAQDIS" }, { x: 10, y: 1.4, z: 25, t: "ARAH KAABAH" }); }
  else if (id === "khandaq") { hjFloor(W, -34, 22, 68, 3.5, "#5a4632", "#3a2a1a", 0.03); for (let i = -2; i <= 2; i++) { hjBox(W, i * 11, 2, 34, 6, 4, 6, "#efe6d4", true); zrDome(W, i * 11, 4, 34, 2.4, "#efe6d4"); } zrHill(W, 0, 46, 60, 10, 4, "#a58560"); W.signs.push({ x: 0, y: 3, z: 23, t: "PARIT (KHANDAQ)" }, { x: 0, y: 10, z: 34, t: "MASJID TUJUH (SAB'AH MASAJID)" }); }
  else if (id === "uhud") { zrHill(W, 0, 52, 70, 22, 10, "#9a5a3a"); zrHill(W, -18, 30, 10, 8, 2, "#b07a52"); zrGraves(W, 4, 18, 20, 10); W.signs.push({ x: 0, y: 25, z: 44, t: "JABAL UHUD" }, { x: -18, y: 6, z: 30, t: "BUKIT RUMAT (PEMANAH)" }, { x: 14, y: 3, z: 18, t: "MAKAM SYUHADA UHUD" }); }
  hjNpcs(W, 14, () => ({ k: "idle", x: R(-26, 26), z: R(-6, 12), yaw: R(0, 6) }));
  return W;
}
function zrSetup(id) {
  const g = HJ.g, S = hjSt()[g.st]; hjObj("Pergi ke Papan Ziarah");
  hjMarker({ x: 0, z: 12.4, label: "Papan Ziarah", act: "Ziarah (E)", on: () => hjPanel((p) => {
    const b = el("button", { type: "button", class: "hj-go" }, "Jawab soalan"); b.addEventListener("click", () => { hjPanelClose(); hjQuiz(id, hjStageDone); });
    const ul = el("ul", { class: "hj-fk" }); (S.fk || []).forEach((t) => ul.appendChild(el("li", null, t)));
    p.append(el("div", { class: "hj-k" }, "ZIARAH " + (g.st + 1) + " / " + hjSt().length), el("h2", null, S.n), el("p", { class: "hj-sub" }, S.sub), ul, b);
  }) });
}
const zrMk = (key, st, title, desc, good) => ({ key: key, st: st, title: title, desc: desc, note: "Ziarah ialah amalan sunat untuk mengambil iktibar sejarah Islam. Ia bukan rukun atau wajib haji dan umrah.", q: ZR_Q, build: zrBuild, setup: zrSetup, spawn: () => [0, -4, 0], tick: () => {}, go: "MULA ZIARAH", good: good, well: "Anda mengenali tempat-tempat bersejarah ini dengan baik.", again: "Ulang ziarah untuk mengukuhkan ingatan tentang sejarah setiap tempat.", look: () => ({ sex: HJ.sex, skin: HJ.skin, ihram: false }) });
HJ_MODES.zmakkah = zrMk("hjZM", ZM_ST, "Ziarah Makkah", "Lawati sembilan tempat bersejarah di sekitar Makkah: Gua Hira', Gua Thur, Ma'la, Jabal Rahmah, Kompleks Kiswah, Ji'ranah, Tan'im, Masy'aril Haram dan Masjid al-Khaif. Berjalan ke Papan Ziarah, baca sejarahnya dan jawab soalan.", "Ziarah Makkah selesai!");
HJ_MODES.zmadinah = zrMk("hjZD", ZD_ST, "Ziarah Madinah", "Lawati lapan tempat bersejarah di Madinah: Masjid Nabawi, Raudhah, makam Rasulullah ﷺ, Baqi', Quba', Qiblatain, Khandaq dan Uhud. Berjalan ke Papan Ziarah, baca sejarahnya dan jawab soalan.", "Ziarah Madinah selesai!");
/* kad pilihan: langkah ibadah sebenar dipetakan kepada peringkat simulasi [nama langkah, indeks peringkat] */
const HJ_SIMS = [
  { mode: "umrah", ico: "🕋", col: "#4caf50", t: "Simulasi Umrah", d: "Ihram di miqat → tawaf → saie → bercukur/bergunting. Boleh dikerjakan sepanjang tahun.", lk: [["Ihram dan niat di miqat", 0], ["Tawaf tujuh pusingan", 1], ["Saie tujuh perjalanan", 2], ["Bercukur atau bergunting (tahallul)", 2]] },
  { mode: "ifrad", ico: "🥇", col: "#3b78d8", t: "Haji Ifrad", d: "Haji dahulu, kemudian umrah dari Tan'im. Tiada dam.", lk: [["Ihram dan niat haji di miqat", 0], ["Tawaf qudum", 1], ["Saie haji", 2], ["Ke Mina pada 8 Zulhijjah (Tarwiyah)", 3], ["Wuquf di Arafah", 3], ["Mabit di Muzdalifah", 4], ["Kutip batu", 4], ["Lontar Jamrah Aqabah", 5], ["Bercukur, tahallul awal", 5], ["Tawaf ifadah", 6], ["Mabit di Mina dan lontar tiga jamrah", 7], ["Umrah dari Tan'im", 8], ["Tawaf wada'", 9]] },
  { mode: "qiran", ico: "🔗", col: "#8b5cf6", t: "Haji Qiran", d: "Niat haji dan umrah serentak dengan satu ihram. Wajib dam.", lk: [["Niat haji dan umrah serentak", 0], ["Tawaf qudum", 1], ["Saie untuk haji dan umrah", 2], ["Ke Mina pada 8 Zulhijjah (Tarwiyah)", 3], ["Wuquf di Arafah", 3], ["Mabit di Muzdalifah dan kutip batu", 4], ["Lontar Jamrah Aqabah", 5], ["Sembelih dam", 5], ["Bercukur, tahallul awal", 5], ["Tawaf ifadah", 6], ["Mabit di Mina dan lontar tiga jamrah", 7], ["Tawaf wada'", 8]] },
  { mode: "tamattuk", ico: "🔄", col: "#e5a531", t: "Haji Tamattuk", d: "Umrah dahulu, bertahallul, kemudian ihram haji pada 8 Zulhijjah. Wajib dam.", lk: [["Ihram umrah di miqat", 0], ["Tawaf umrah", 1], ["Saie umrah", 2], ["Bercukur, tahallul umrah", 2], ["Ihram haji pada 8 Zulhijjah", 3], ["Wuquf di Arafah", 4], ["Mabit di Muzdalifah dan kutip batu", 5], ["Lontar Jamrah Aqabah", 6], ["Sembelih dam", 6], ["Bercukur, tahallul awal", 6], ["Tawaf ifadah dan saie haji", 8], ["Mabit di Mina dan lontar tiga jamrah", 9], ["Tawaf wada'", 10]] },
  { mode: "zmakkah", ico: "🚌", col: "#c0504d", t: "Ziarah Makkah", d: "Lawati 9 tempat bersejarah: Gua Hira', Gua Thur, Ma'la, Jabal Rahmah, Kiswah dan lain-lain.", lk: ZM_ST.map((s, i) => [s.n, i]) },
  { mode: "zmadinah", ico: "🕌", col: "#3a9d5d", t: "Ziarah Madinah", d: "Masjid Nabawi, Raudhah, makam Rasulullah ﷺ, Baqi', Quba', Qiblatain, Khandaq dan Uhud.", lk: ZD_ST.map((s, i) => [s.n, i]) }
];
HJ_SIMS.forEach((S) => { HJ_MODES[S.mode].lk = S.lk; });
function hjSimBox() {
  const prog = hjProgLoad(), sec = el("section", { class: "sm-sec" });
  sec.append(el("header", { class: "sm-hd" }, null, el("span", { class: "sm-hi", "aria-hidden": "true" }, "🧭"), el("h3", null, "Pilih Simulasi")));
  const body = el("div", { class: "sm-bd" }); body.append(el("p", { class: "sm-lead" }, "Pilih ibadah yang ingin kamu pelajari. Kemajuan setiap simulasi disimpan berasingan — kamu boleh bertukar pada bila-bila masa."));
  const grid = el("div", { class: "sm-grid" });
  HJ_SIMS.forEach((S) => {
    const M = HJ_MODES[S.mode], st = prog[M.key] | 0, n = S.lk.length, done = S.lk.filter((L) => L[1] < st).length, pct = Math.round(done / n * 100);
    const bt = el("button", { type: "button", class: "sm-go" }, done >= n ? "ULANG ▶" : "MULA ▶"); bt.addEventListener("click", () => { if (typeof hjOpen === "function") hjOpen(S.mode); });
    const bar = el("div", { class: "sm-bar", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(pct), "aria-label": "Kemajuan " + S.t }, null, el("i", { style: "width:" + pct + "%" }));
    grid.appendChild(el("article", { class: "sm-card", style: "--c:" + S.col }, null, el("div", { class: "sm-ico", "aria-hidden": "true" }, S.ico), el("h4", null, S.t), el("p", null, S.d), bar, el("div", { class: "sm-meta" }, null, el("b", null, (done ? done + " / " : "") + n + " langkah")), bt));
  });
  body.append(grid, el("div", { class: "sm-tip" }, null, el("b", null, "Cadangan: "), el("span", null, "Mulakan dengan Umrah, kemudian cuba Ifrad, Qiran dan Tamattuk. Bandingkan niat, urutan manasik dan kewajipan dam. Lengkapkan dengan Ziarah Makkah dan Madinah. Rujuk ustaz atau pembimbing haji untuk pengesahan.")));
  sec.appendChild(body);
  return sec;
}
