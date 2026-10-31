/* =====================================================================
   META DIDIK LIFELONG ID: antara muka (dimuat apabila perlu melalui modLoad("lid")).
   Bergantung pada mod/lid-teras.js (window.LIDT) dan fungsi app.js: el, toast, P, AUTH, FB, kmAdm, kmAdmReq, kmAdmPut.
   Satu profil modular; paparan berubah ikut peranan. Tiada sistem akaun kedua: uid = Firebase Auth (jika aktif)
   atau ID peranti sedia ada (mod percubaan, data kekal di peranti).
   ===================================================================== */
(function () {
  "use strict";
  const L = window.LIDT, KEY = "gt-lid", KSAH = "gt-lid-sah";
  const ST = { tab: "ringkasan", sah: null, msg: "" };
  function lidUid() { return AUTH.on() ? AUTH.uid() : FB.getUid(); }
  function baca() { try { return L.normal(JSON.parse(localStorage.getItem(KEY) || "null")); } catch (e) { return null; } }
  function rekod() { return baca() || L.dariProfil(P, Date.now()); }
  async function simpan(r) {
    r.kemas = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(r)); } catch (e) { /* abaikan */ }
    /* pelayan: hanya apabila Firebase Authentication aktif (lid/<auth.uid> dilindungi Rules: pemilik sahaja) */
    if (AUTH.on() && FB.url) { try { await AUTH.ensure(); await FB.req("PUT", "lid/" + AUTH.uid(), r); } catch (e) { ST.msg = "Disimpan pada peranti; penyegerakan pelayan gagal (kod " + (e.code || "rangkaian") + ")."; } }
  }
  async function muatPelayan() {
    if (!FB.url) return;
    try { const s = await FB.req("GET", "lid_sah/" + lidUid()); ST.sah = s || {}; try { localStorage.setItem(KSAH, JSON.stringify(ST.sah)); } catch (e) { /* abaikan */ } } catch (e) { /* abaikan */ }
    if (AUTH.on()) { try { await AUTH.ensure(); const v = L.normal(await FB.req("GET", "lid/" + AUTH.uid())), loc = baca(); if (v && (!loc || (v.kemas || 0) > (loc.kemas || 0))) localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* abaikan */ } }
  }
  function sahCache() { if (ST.sah) return ST.sah; try { return JSON.parse(localStorage.getItem(KSAH) || "{}"); } catch (e) { return {}; } }
  async function hantarMohon(jenis, r, o) {
    if (!FB.url) throw Object.assign(new Error("tiada pelayan"), { code: "luar talian" });
    const d = L.permohonan(jenis, r, o, Date.now()); d.t = { ".sv": "timestamp" };
    if (AUTH.on()) await AUTH.ensure();
    await FB.req("PUT", "lid_mohon/" + lidUid() + "/" + jenis + Date.now().toString(36), d);
  }
  const lencanaId = () => (typeof BADGES !== "undefined" ? BADGES.map((b) => b.id) : null);
  const tag = (s) => { const m = { disahkan: ["✔ Disahkan", "#2e9e5b"], diisytihar: ["Diisytihar sendiri", "#8a6d1f"], menunggu: ["⏳ Menunggu", "#5a6b8a"], ditolak: ["✖ Ditolak", "#a8443a"], tamat: ["Tamat", "#55606a"], sah: ["✔ Disahkan", "#2e9e5b"], sendiri: ["Diisytihar sendiri", "#8a6d1f"], tunggu: ["⏳ Belum disahkan", "#5a6b8a"] }[s] || [s, "#555"]; return el("span", { style: "font-size:12px;padding:2px 8px;border-radius:999px;background:" + m[1] + ";color:#fff;white-space:nowrap" }, m[0]); };

  /* ---------- tetingkap utama ---------- */
  function lidBuka() {
    let ov = document.getElementById("lidOv");
    if (!ov) { ov = el("div", { class: "overlay", id: "lidOv", role: "dialog", "aria-modal": "true", "aria-label": "Meta Didik ID" }); document.body.appendChild(ov); }
    ov.hidden = false; lukis(); muatPelayan().then(lukis);
  }
  function tutup() { const ov = document.getElementById("lidOv"); if (ov) ov.hidden = true; }
  function lukis() {
    const ov = document.getElementById("lidOv"); if (!ov || ov.hidden) return;
    const r = rekod(), sah = sahCache(); ov.textContent = "";
    const c = el("div", { class: "mcard", style: "max-width:760px;width:100%;max-height:92vh;overflow:auto" }); ov.appendChild(c);
    const x = el("button", { type: "button", class: "btn alt sm", style: "float:right" }, "Tutup"); x.addEventListener("click", tutup);
    c.append(x, el("div", { class: "tagline" }, "ONE IDENTITY · LIFELONG LEARNING"), el("h1", { style: "margin:4px 0" }, "🪪 Meta Didik ID"));
    c.appendChild(el("p", { class: "muted", style: "margin:0 0 8px;font-size:14px" }, (P.nama || "Pengguna") + " · ID: " + String(lidUid()).slice(0, 6) + "•••• · " + (AUTH.on() ? "akaun Firebase" : "mod percubaan: data disimpan pada peranti ini")));
    /* peranan aktif sebagai cip */
    const chips = el("div", { class: "row", style: "gap:6px;flex-wrap:wrap;margin-bottom:8px" });
    Object.keys(L.PERANAN).forEach((p) => { const s = L.status(r, p, sah); if (!s || s === "tamat") return; chips.appendChild(el("span", { class: "row", style: "gap:6px;align-items:center;padding:4px 10px;border:1px solid var(--line2);border-radius:999px" }, L.PERANAN[p].ic + " " + L.PERANAN[p].n, tag(s))); });
    c.appendChild(chips);
    if (ST.msg) { c.appendChild(el("div", { class: "notice" }, ST.msg)); ST.msg = ""; }
    if (L.layakSemak(r)) c.appendChild(kadPeralihan(r, true));
    const tabs = [["ringkasan", "Papan pemuka"], ["pasport", "Pasport pembelajaran"], ["pendidikan", "Pendidikan"], ["privasi", "Privasi & data"]];
    const bar = el("div", { class: "gtabs", role: "tablist" });
    tabs.forEach(([k, l]) => { const b = el("button", { type: "button", "aria-pressed": String(ST.tab === k) }, l); b.addEventListener("click", () => { ST.tab = k; lukis(); }); bar.appendChild(b); });
    c.appendChild(bar);
    const box = el("div", { style: "display:grid;gap:10px;margin-top:10px" }); c.appendChild(box);
    if (ST.tab === "pasport") tabPasport(box, r, sah); else if (ST.tab === "pendidikan") tabPendidikan(box, r); else if (ST.tab === "privasi") tabPrivasi(box, r); else tabRingkasan(box, r, sah);
  }

  /* ---------- papan pemuka ikut peranan (satu profil modular) ---------- */
  function tabRingkasan(box, r, sah) {
    const kad = (h, ...isi) => { const d = el("div", { class: "card", style: "gap:6px" }); d.append(el("b", null, h), ...isi); box.appendChild(d); return d; };
    if (L.aktif(r, "murid")) {
      const bd = Object.keys(P.bd || {}).length, xp = typeof curXp === "function" ? Math.round(curXp()) : P.xp | 0, kls = typeof kkJoined === "function" ? kkJoined() : null;
      kad("🎒 Papan pemuka murid", el("div", { class: "gstats", style: "grid-template-columns:repeat(auto-fit,minmax(120px,1fr))" }, gs(xp, "Learning XP"), gs(bd, "Lencana"), gs(Object.keys(P.prog || {}).filter((k) => (P.prog[k].b | 0) > 0).length, "Misi selesai"), gs(P.coin | 0, "MD")),
        el("div", { class: "muted", style: "font-size:13px" }, "Kelas: " + (kls ? kls.n : "belum menyertai kelas") + ". Avatar 3D dan pencapaian anda kekal dalam satu identiti sepanjang hayat."));
      const s = r.sekolah;
      if (!s || !s.tahap) box.appendChild(kadSekolah(r));
      else {
        const d = kad("🏫 Sekolah", el("div", null, s.nama + " · " + (L.TAHAP.find((t) => t[0] === s.tahap) || ["", "-"])[1] + " (direkod " + s.tahunRekod + ")"), el("div", { class: "muted", style: "font-size:13px" }, s.jangkaTamat ? "Jangkaan tamat persekolahan: " + s.jangkaTamat + ". Anda akan diminta mengesahkan status selepas 15 November " + s.jangkaTamat + "; status tidak ditukar secara automatik." : "Tahun tamat tidak dapat dijangka; kemas kini apabila perlu."));
        const ub = el("button", { type: "button", class: "btn alt sm" }, "Kemas kini sekolah"); ub.addEventListener("click", () => { r.sekolah.tahap = null; localStorage.setItem(KEY, JSON.stringify(r)); lukis(); });
        const tb = el("button", { type: "button", class: "btn alt sm" }, "Saya sudah tamat / berpindah sekolah"); tb.addEventListener("click", () => { ST.manual = true; lukis(); });
        d.appendChild(el("div", { class: "row", style: "gap:8px" }, ub, tb));
        if (ST.manual) { ST.manual = false; box.appendChild(kadPeralihan(r, false)); }
      }
    }
    if (L.aktif(r, "alumni")) {
      const st = L.status(r, "alumni", sah), a = r.peranan.alumni;
      const d = kad("🎓 Papan pemuka alumni", el("div", null, (a.sebab === "berhenti" ? "Bekas murid" : "Alumni") + (r.sekolah && r.sekolah.nama ? " " + r.sekolah.nama : "") + " · sejak " + a.dari, " ", tag(st)),
        el("div", { class: "muted", style: "font-size:13px" }, "Pencapaian murid anda diarkibkan dan kekal milik anda. Akses kelas lama telah ditamatkan. Tambah pengajian baharu di tab Pendidikan."));
      if (r.peralihan && Date.now() < r.peralihan.bolehBatal && st !== "disahkan") { const bt = el("button", { type: "button", class: "btn alt sm" }, "Tersilap? Batalkan peralihan (30 hari)"); bt.addEventListener("click", async () => { if (!confirm("Kembali ke status murid?")) return; try { L.peralihan(r, "batal", { disahkan: st === "disahkan" }); await simpan(r); lukis(); } catch (e) { toast(e.message, "bad"); } }); d.appendChild(bt); }
      if (st === "ditolak" && sah.alumni && sah.alumni.nota) d.appendChild(el("div", { class: "notice warn" }, "Sebab ditolak: " + sah.alumni.nota));
    }
    kad("🗺 Perjalanan anda", el("div", { style: "font-size:14px" }, ["murid", "alumni", "mahasiswa", "graduan", "profesional", "mentor"].map((p) => L.PERANAN[p].ic + " " + L.PERANAN[p].n + (L.aktif(r, p) ? " ✔" : "")).join("  →  ")),
      el("div", { class: "muted", style: "font-size:13px" }, "Perjalanan tidak wajib atau linear: anda boleh memegang beberapa peranan serentak."));
    /* fasa seterusnya: dipaparkan, belum dibina */
    const fs = el("div", { class: "card", style: "gap:6px;opacity:.85" }); fs.appendChild(el("b", null, "Akan datang (pembangunan berfasa)")); box.appendChild(fs);
    [["🏛 Profil IPT & graduan (Fasa 4)", "Projek akademik, penyelidikan, latihan industri. Kelayakan rasmi perlu disahkan pihak berautoriti."], ["💼 Portfolio profesional (Fasa 5)", "Ringkasan, projek, kemahiran, inovasi, penerbitan."], ["🤝 Mentor alumni (Fasa 6)", "Permohonan dan pengesahan mentor; program bersama murid hanya melalui saluran yang diselia sekolah, tanpa mesej peribadi."], ["🔗 Portfolio boleh dikongsi & QR (Fasa 8)", "Hanya kandungan yang anda pilih; rekod murid tidak diterbitkan secara automatik."]].forEach(([h, d]) => fs.appendChild(el("div", { style: "font-size:13px" }, el("b", null, h), " · ", d)));
  }
  function gs(v, l) { return el("div", { class: "gstat" }, el("b", null, String(v)), el("span", null, l)); }
  function kadSekolah(r) {
    const d = el("div", { class: "card", style: "gap:8px;border-color:#ffd45a" });
    d.appendChild(el("b", null, "🏫 Lengkapkan rekod persekolahan"));
    d.appendChild(el("p", { class: "muted", style: "margin:0;font-size:13px" }, "Tahap persekolahan digunakan untuk menjangka tahun tamat sekolah supaya anda boleh disoal untuk mengesahkan status. Umur tidak digunakan."));
    const nm = el("input", { maxlength: "80", value: (r.sekolah && r.sekolah.nama) || P.sekolah || "", placeholder: "Nama sekolah", "aria-label": "Nama sekolah" });
    const tp = el("select", { "aria-label": "Tahap persekolahan" }); tp.appendChild(el("option", { value: "" }, "Tahap semasa...")); L.TAHAP.forEach(([k, n]) => tp.appendChild(el("option", { value: k }, n)));
    const sv = el("button", { type: "button", class: "btn sm" }, "Simpan"), out = el("span", { class: "muted", style: "font-size:13px" });
    sv.addEventListener("click", async () => { if (!tp.value) { out.textContent = "Pilih tahap persekolahan."; return; } L.tetapSekolah(r, { nama: nm.value || P.sekolah, negeri: P.negeri, tahap: tp.value }); await simpan(r); lukis(); });
    d.append(el("div", { class: "row", style: "gap:8px;flex-wrap:wrap" }, nm, tp, sv, out)); return d;
  }
  /* ---------- peralihan Murid -> Alumni ---------- */
  function kadPeralihan(r, auto) {
    const d = el("div", { class: "card", style: "gap:8px;border-color:#5ff2ff" });
    d.append(el("b", null, auto ? "🎓 Tahniah! Adakah anda telah tamat persekolahan?" : "🎓 Kemas kini status persekolahan"),
      el("p", { class: "muted", style: "margin:0;font-size:13px" }, "Pilih yang paling tepat. Status anda tidak akan ditukar tanpa pengesahan anda. Pencapaian murid diarkibkan dan kekal milik anda."));
    const go = async (pil, o) => {
      try {
        if (pil === "tamat" || pil === "berhenti") {
          if (!confirm(pil === "tamat" ? "Sahkan anda telah tamat persekolahan? Akses kelas lama akan ditamatkan; pencapaian diarkibkan. Boleh dibatalkan dalam 30 hari." : "Sahkan anda telah meninggalkan persekolahan?")) return;
          L.peralihan(r, pil, { ringkasan: L.ringkasan(P, lencanaId()) });
          if (typeof kkJoined === "function" && kkJoined() && typeof kkLeave === "function") kkLeave(); /* tamatkan akses kelas lama */
          await simpan(r);
          if (ck.checked) { try { await hantarMohon("alumni", r); ST.msg = "Status alumni direkod (diisytihar sendiri) dan dihantar untuk pengesahan pentadbir."; } catch (e) { ST.msg = "Status alumni direkod pada peranti. Permohonan pengesahan belum dihantar (kod " + (e.code || "rangkaian") + ")."; } }
          else ST.msg = "Status alumni direkod (diisytihar sendiri).";
        } else { L.peralihan(r, pil, o); await simpan(r); ST.msg = pil === "tunda" ? "Baik, kami akan bertanya semula selepas 30 hari." : "Rekod persekolahan dikemas kini."; }
        lukis();
      } catch (e) { toast(e.message, "bad"); }
    };
    const ck = el("input", { type: "checkbox", id: "lidSahCk" }); ck.checked = true;
    const b = (t, f, cls) => { const x = el("button", { type: "button", class: "btn sm" + (cls ? " " + cls : "") }, t); x.addEventListener("click", f); return x; };
    const tp = el("select", { "aria-label": "Tahap semasa" }); L.TAHAP.filter((t) => /^f/.test(t[0])).forEach(([k, n]) => tp.appendChild(el("option", { value: k }, n))); tp.value = "f6r";
    const sk = el("input", { maxlength: "80", placeholder: "Sekolah baharu", "aria-label": "Sekolah baharu" });
    d.append(el("div", { class: "row", style: "gap:8px;flex-wrap:wrap" }, b("✔ Ya, saya telah tamat persekolahan", () => go("tamat")), b("Saya berhenti sekolah", () => go("berhenti"), "alt")),
      el("label", { for: "lidSahCk", class: "row", style: "gap:6px;align-items:center;font-size:13px" }, ck, "Hantar untuk pengesahan pentadbir/sekolah (disyorkan)"),
      el("div", { class: "row", style: "gap:8px;flex-wrap:wrap;align-items:center" }, el("span", { style: "font-size:13px" }, "Masih bersekolah / menyambung:"), tp, b("Kemas kini", () => go("sambung", { tahap: tp.value }), "alt")),
      el("div", { class: "row", style: "gap:8px;flex-wrap:wrap;align-items:center" }, el("span", { style: "font-size:13px" }, "Berpindah sekolah:"), sk, b("Simpan", () => go("pindah", { nama: sk.value, negeri: P.negeri, tahap: r.sekolah && r.sekolah.tahap }), "alt")));
    if (auto) d.appendChild(b("Ingatkan saya kemudian", () => go("tunda"), "alt"));
    return d;
  }
  /* ---------- pasport pembelajaran: garis masa dengan penanda pengesahan ---------- */
  function tabPasport(box, r, sah) {
    const tl = L.garisMasa(r, sah);
    box.appendChild(el("p", { class: "muted", style: "margin:0;font-size:13px" }, "Rekod pembelajaran sepanjang hayat. Penanda: ✔ disahkan pihak berautoriti, diisytihar sendiri, atau belum disahkan."));
    const bd = Object.keys(P.bd || {}).length; if (bd) tl.unshift({ tarikh: L.tahun(), tajuk: bd + " lencana Meta Didik", jenis: "lencana", sah: "sah" });
    if (!tl.length) { box.appendChild(el("p", null, "Belum ada rekod. Pencapaian akan ditambah apabila anda menamatkan persekolahan atau menambah pendidikan baharu.")); return; }
    const ol = el("ol", { style: "list-style:none;margin:0;padding:0 0 0 18px;border-left:3px solid #5ff2ff" });
    tl.forEach((x) => ol.appendChild(el("li", { style: "margin:0 0 12px;position:relative" }, el("span", { style: "position:absolute;left:-26px;top:2px;width:14px;height:14px;border-radius:50%;background:#5ff2ff" }), el("b", null, String(x.tarikh || "")), " · ", x.tajuk, " ", tag(x.sah))));
    box.appendChild(ol);
    const ar = Object.values(r.arkib || {}); if (ar.length) box.appendChild(el("div", { class: "muted", style: "font-size:13px" }, "📦 Arkib pembelajaran murid: " + ar.map((a) => new Date(a.t).getFullYear() + (a.ringkasan ? " (" + a.ringkasan.xp + " XP, " + a.ringkasan.lencana.length + " lencana)" : "")).join(", ")));
  }
  /* ---------- pendidikan baharu (IPT, kursus): diisytihar sendiri ---------- */
  function tabPendidikan(box, r) {
    const list = Object.keys(r.pendidikan || {}).map((k) => r.pendidikan[k]);
    if (r.sekolah && r.sekolah.nama) box.appendChild(el("div", { class: "card", style: "gap:4px" }, el("b", null, "🏫 " + r.sekolah.nama), el("span", { class: "muted", style: "font-size:13px" }, L.aktif(r, "murid") ? "Sekolah semasa" : "Sekolah terdahulu")));
    list.forEach((e) => box.appendChild(el("div", { class: "card", style: "gap:4px" }, el("b", null, (e.jenis === "ipt" ? "🏛 " : "📘 ") + e.nama), el("span", { style: "font-size:13px" }, (e.bidang || "") + (e.dari ? " · " + e.dari + (e.hingga ? "–" + e.hingga : "") : ""), " ", tag(e.sah)))));
    const f = el("div", { class: "card", style: "gap:8px" }); f.appendChild(el("b", null, "➕ Tambah pendidikan"));
    const jn = el("select", { "aria-label": "Jenis" }); [["ipt", "Institusi pengajian tinggi"], ["kursus", "Kursus / latihan"]].forEach(([k, n]) => jn.appendChild(el("option", { value: k }, n)));
    const nm = el("input", { maxlength: "80", placeholder: "Nama institusi", "aria-label": "Nama institusi" }), bf = el("input", { maxlength: "80", placeholder: "Bidang (pilihan)", "aria-label": "Bidang" }), dr = el("input", { maxlength: "4", inputmode: "numeric", placeholder: "Tahun mula", "aria-label": "Tahun mula", style: "max-width:110px" });
    const sv = el("button", { type: "button", class: "btn sm" }, "Tambah");
    sv.addEventListener("click", async () => { try { L.tambahPendidikan(r, { jenis: jn.value, nama: nm.value, bidang: bf.value, dari: dr.value }); if (jn.value === "ipt" && !r.peranan.mahasiswa) L.isytihar(r, "mahasiswa"); await simpan(r); lukis(); } catch (e) { toast(e.message, "bad"); } });
    f.append(el("div", { class: "row", style: "gap:8px;flex-wrap:wrap" }, jn, nm, bf, dr, sv), el("p", { class: "muted", style: "margin:0;font-size:12px" }, "Maklumat ini diisytihar sendiri. Meta Didik tidak mengesahkan kelayakan IPT atau ijazah tanpa bukti daripada pihak berautoriti."));
    box.appendChild(f);
  }
  /* ---------- privasi, eksport dan permohonan padam ---------- */
  function tabPrivasi(box, r) {
    const c = el("div", { class: "card", style: "gap:8px" }); c.appendChild(el("b", null, "🔒 Apa yang boleh dikongsi (semua tertutup secara lalai)")); box.appendChild(c);
    c.appendChild(el("p", { class: "muted", style: "margin:0;font-size:13px" }, "Profil awam belum dibuka pada fasa ini. Pilihan di bawah menentukan kandungan yang boleh anda kongsi apabila portfolio boleh dikongsi tersedia. Rekod murid tidak akan diterbitkan secara automatik."));
    [["pasport", "Pasport pembelajaran"], ["lencana", "Lencana Meta Didik"], ["sekolah", "Sekolah terdahulu"], ["pendidikan", "Pendidikan IPT / kursus"]].forEach(([k, n]) => {
      const ck = el("input", { type: "checkbox", id: "lidP" + k }); ck.checked = !!r.privasi.papar[k];
      ck.addEventListener("change", async () => { r.privasi.papar[k] = ck.checked; await simpan(r); });
      c.appendChild(el("label", { for: "lidP" + k, class: "row", style: "gap:8px;align-items:center" }, ck, n));
    });
    const d = el("div", { class: "card", style: "gap:8px" }); d.appendChild(el("b", null, "📤 Data anda")); box.appendChild(d);
    const ex = el("button", { type: "button", class: "btn alt sm" }, "Eksport data (JSON)");
    ex.addEventListener("click", () => { const b = new Blob([JSON.stringify(L.eksport(r, P, lidUid()), null, 2)], { type: "application/json" }), a = el("a", { href: URL.createObjectURL(b), download: "meta-didik-id.json" }); document.body.appendChild(a); a.click(); a.remove(); });
    const pd = el("button", { type: "button", class: "btn alt sm" }, "Mohon pemadaman data");
    pd.addEventListener("click", async () => { const nota = prompt("Mohon pentadbir memadam data anda di pelayan Meta Didik. Nyatakan sebab (pilihan):", ""); if (nota === null) return; try { await hantarMohon("padam", r, { nota: nota }); ST.msg = "Permohonan pemadaman dihantar. Pentadbir akan memprosesnya mengikut polisi data."; } catch (e) { ST.msg = "Permohonan gagal dihantar (kod " + (e.code || "rangkaian") + ")."; } lukis(); });
    const lp = el("button", { type: "button", class: "btn alt sm" }, "Padam rekod Lifelong ID pada peranti ini");
    lp.addEventListener("click", () => { if (!confirm("Padam rekod Lifelong ID pada peranti ini? Kemajuan permainan tidak dipadam.")) return; try { localStorage.removeItem(KEY); localStorage.removeItem(KSAH); } catch (e) { /* abaikan */ } ST.msg = "Rekod Lifelong ID pada peranti ini dipadam."; lukis(); });
    d.append(el("div", { class: "row", style: "gap:8px;flex-wrap:wrap" }, ex, pd, lp), el("p", { class: "muted", style: "margin:0;font-size:12px" }, AUTH.on() ? "Rekod anda disimpan di pelayan di bawah akaun Firebase anda; hanya anda dan pentadbir boleh membacanya." : "Mod percubaan: rekod Lifelong ID disimpan pada peranti ini sahaja sehingga log masuk akaun diaktifkan."));
  }

  /* ---------- pentadbir: pengesahan alumni dan permohonan padam ---------- */
  const ADM = { v: null, busy: false };
  async function lidAdminBox(host) {
    if (typeof kmAdm !== "function" || !kmAdm()) return;
    const c = el("details", { class: "card", style: "margin:8px 0" }); host.appendChild(c);
    const n = ADM.v ? ADM.v.filter((x) => !x.st).length : 0;
    c.appendChild(el("summary", { style: "cursor:pointer;font-weight:700" }, "Pentadbir: permohonan Meta Didik ID" + (ADM.v ? " (" + n + " menunggu)" : "")));
    c.open = n > 0;
    const muat = el("button", { type: "button", class: "btn alt sm" }, ADM.busy ? "Memuat..." : "Muat permohonan");
    muat.addEventListener("click", async () => { ADM.busy = true; try { const v = (await kmAdmReq("GET", "lid_mohon")) || {}; ADM.v = []; Object.keys(v).forEach((u) => Object.keys(v[u] || {}).forEach((id) => ADM.v.push(Object.assign({ uid: u, id: id }, v[u][id])))); ADM.v.sort((a, b) => (b.t || 0) - (a.t || 0)); } catch (e) { toast("Gagal memuat (kod " + (e.code || "rangkaian") + ").", "bad"); } ADM.busy = false; host.textContent = ""; lidAdminBox(host); });
    c.appendChild(muat);
    (ADM.v || []).forEach((x) => {
      const d = el("div", { class: "card", style: "gap:4px;padding:10px" }); c.appendChild(d);
      d.appendChild(el("b", null, (x.jenis === "alumni" ? "🎓 Pengesahan alumni" : x.jenis === "padam" ? "🗑 Permohonan padam data" : x.jenis) + (x.st ? " · " + x.st : " · menunggu")));
      d.appendChild(el("div", { style: "font-size:13px" }, "ID: " + x.uid + (x.sekolah ? " · " + x.sekolah : "") + (x.tahun ? " · " + x.tahun : "") + (x.sebab ? " · " + x.sebab : "") + (x.t ? " · " + new Date(x.t).toLocaleDateString("ms-MY") : "")));
      if (x.nota) d.appendChild(el("div", { style: "font-size:13px;color:#ffe9a8" }, "Nota: " + x.nota));
      if (x.st) return;
      const tanda = async (st) => { await kmAdmPut("lid_mohon/" + x.uid + "/" + x.id, Object.assign({}, x, { st: st, uid: undefined, id: undefined })); x.st = st; };
      const row = el("div", { class: "row", style: "gap:8px" }); d.appendChild(row);
      if (x.jenis === "alumni") {
        const ok = el("button", { type: "button", class: "btn sm" }, "Sahkan alumni"), no = el("button", { type: "button", class: "btn alt sm" }, "Tolak");
        ok.addEventListener("click", async () => { try { await kmAdmPut("lid_sah/" + x.uid + "/alumni", { st: "sah", t: Date.now(), oleh: "pentadbir" }); await tanda("disahkan"); toast("Alumni disahkan.", "ok"); host.textContent = ""; lidAdminBox(host); } catch (e) { toast("Gagal (kod " + (e.code || "rangkaian") + ").", "bad"); } });
        no.addEventListener("click", async () => { const why = prompt("Sebab ditolak (dipaparkan kepada pengguna):", ""); if (why === null) return; try { await kmAdmPut("lid_sah/" + x.uid + "/alumni", { st: "tolak", t: Date.now(), oleh: "pentadbir", nota: String(why).slice(0, 140) }); await tanda("ditolak"); host.textContent = ""; lidAdminBox(host); } catch (e) { toast("Gagal (kod " + (e.code || "rangkaian") + ").", "bad"); } });
        row.append(ok, no);
      } else if (x.jenis === "padam") {
        const del = el("button", { type: "button", class: "btn sm" }, "Padam data pelayan pengguna ini");
        del.addEventListener("click", async () => {
          if (!confirm("Padam lid, lid_sah, pemain dan ringkas bagi ID " + x.uid + "? Tindakan ini tidak boleh dibatalkan.")) return;
          try { for (const p of ["lid/", "lid_sah/", "pemain/", "ringkas/"]) await kmAdmReq("DELETE", p + x.uid); await tanda("dipadam"); toast("Data dipadam.", "ok"); host.textContent = ""; lidAdminBox(host); } catch (e) { toast("Gagal (kod " + (e.code || "rangkaian") + ").", "bad"); }
        });
        row.append(del);
      }
    });
  }
  window.lidBuka = lidBuka; window.lidAdminBox = lidAdminBox;
})();
