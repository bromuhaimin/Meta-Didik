/* =====================================================================
   PENAJA META DIDIK (dimuat apabila perlu melalui modLoad("penaja"))
   Borang permohonan penaja, kad maklumat penaja dan kotak semakan Dashboard Pentadbir.
   Bergantung pada app.js: el, toast, FB, AUTH, kmAdm, kmAdmReq, kmAdmPut, PJ, PJ_PAKEJ, PJ_TEMPOH, PJ_LOK, pjLok, pjMuat.
   ===================================================================== */
(function () {
  "use strict";
  const PANTANG = "rokok/vape, minuman keras, perjudian, pinjaman wang tidak berlesen, kandungan dewasa, politik kepartian, dan apa-apa yang bercanggah dengan nilai murni atau dasar pendidikan";
  function ov(id, label) {
    let o = document.getElementById(id);
    if (!o) { o = el("div", { class: "overlay", id: id, role: "dialog", "aria-modal": "true", "aria-label": label }); document.body.appendChild(o); o.addEventListener("click", (e) => { if (e.target === o) o.hidden = true; }); }
    o.textContent = ""; o.hidden = false;
    const c = el("div", { class: "mcard", style: "max-width:760px;width:100%;max-height:92vh;overflow:auto" }); o.appendChild(c);
    const x = el("button", { type: "button", class: "btn alt sm", style: "float:right" }, "Tutup"); x.addEventListener("click", () => { o.hidden = true; }); c.appendChild(x);
    return c;
  }
  const webOk = (u) => /^https?:\/\/[\w.-]+\.[a-z]{2,}(\/[^\s]*)?$/i.test(String(u || ""));

  /* ---------- kad maklumat penaja ---------- */
  function pjKad(d) {
    const c = ov("pjKadOv", "Penaja " + d.n), pk = PJ_PAKEJ[d.pk] || {}, lk = pjLok(d.lk);
    c.append(el("div", { class: "tagline" }, (pk.ic || "") + " " + (pk.n || "PENAJA").toUpperCase()), el("div", { class: "pjprev", style: "margin:8px 0" }, el("img", { src: d.logo, alt: d.n })), el("h1", { style: "margin:4px 0" }, d.n));
    if (d.tl) c.appendChild(el("p", { style: "margin:0 0 6px" }, d.tl));
    if (lk) c.appendChild(el("p", { class: "muted", style: "margin:0 0 6px;font-size:14px" }, "🏢 Cari bangunan " + d.n + " di " + lk.n + " dalam Meta Didik."));
    if (webOk(d.web)) c.appendChild(el("a", { class: "btn alt sm", href: d.web, target: "_blank", rel: "sponsored noopener noreferrer" }, "Lawati laman web ↗"));
    c.appendChild(el("p", { class: "muted", style: "margin:10px 0 0;font-size:12px" }, "Kandungan tajaan. Meta Didik menyemak setiap penaja sebelum dipaparkan."));
  }

  /* ---------- logo: kecilkan dalam pelayar supaya muat dalam pangkalan data (tiada storan fail diperlukan) ---------- */
  function logoProses(file) {
    return new Promise((ok, no) => {
      if (!file || !/^image\//.test(file.type)) { no(new Error("Pilih fail imej (PNG, JPG, SVG atau WebP).")); return; }
      if (file.size > 5 * 1024 * 1024) { no(new Error("Fail logo melebihi 5 MB.")); return; }
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        const W = 400, H = 200, s = Math.min(W / (img.naturalWidth || W), H / (img.naturalHeight || H), 1), w = Math.max(1, Math.round((img.naturalWidth || W) * s)), h = Math.max(1, Math.round((img.naturalHeight || H) * s));
        const cv = document.createElement("canvas"); cv.width = w; cv.height = h; const x = cv.getContext("2d"); x.drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url);
        let d = cv.toDataURL("image/png");
        if (d.length > 110000) { x.globalCompositeOperation = "destination-over"; x.fillStyle = "#fff"; x.fillRect(0, 0, w, h); d = cv.toDataURL("image/jpeg", 0.85); }
        if (d.length > 110000) d = cv.toDataURL("image/jpeg", 0.6);
        ok(d);
      };
      img.onerror = () => { URL.revokeObjectURL(url); no(new Error("Logo tidak dapat dibaca.")); };
      img.src = url;
    });
  }

  /* ---------- borang permohonan penaja ---------- */
  function pjBuka() {
    const c = ov("pjOv", "Jadi Penaja Meta Didik");
    c.append(el("div", { class: "tagline" }, "TAJA PENDIDIKAN DIGITAL MALAYSIA"), el("h1", { style: "margin:4px 0" }, "🤝 Jadi Penaja Meta Didik"),
      el("p", { class: "muted", style: "margin:0 0 8px" }, "Logo anda dipaparkan di paparan utama dan pada kedai, bangunan atau papan iklan di lokasi pilihan anda dalam dunia 3D Meta Didik, yang dijelajah murid dan guru seluruh Malaysia."));
    const f = el("div", { class: "pjform" }); c.appendChild(f);
    const fld = (lab, node, nota) => { const d = el("div", { class: "field" }); d.append(el("label", null, lab), node); if (nota) d.appendChild(el("small", { class: "muted" }, nota)); f.appendChild(d); return node; };
    /* jumlah tajaan: penaja menentukan sendiri (tiada kadar tetap) */
    f.appendChild(el("b", null, "1. Jumlah tajaan"));
    const rm = fld("Jumlah tajaan yang ingin diberikan (RM)", el("input", { type: "number", min: "1", step: "1", inputmode: "numeric", placeholder: "Contoh: 500", style: "max-width:200px" }), "Meta Didik menerima sebarang jumlah tajaan. Semua sumbangan digunakan untuk pembangunan Meta Didik.");
    const bln = el("select", { "aria-label": "Tempoh paparan logo" }); PJ_TEMPOH.forEach((v) => bln.appendChild(el("option", { value: String(v) }, v + " bulan")));
    const jenis = el("select", { "aria-label": "Jenis organisasi" }); [["syarikat", "Syarikat / perniagaan"], ["pendidikan", "Sekolah, PIBG, NGO atau badan pendidikan"], ["individu", "Individu"]].forEach(([v, t]) => jenis.appendChild(el("option", { value: v }, t)));
    fld("Tempoh paparan logo", bln); fld("Jenis penaja", jenis);
    f.appendChild(el("b", null, "2. Paparan yang diingini"));
    const pkBox = el("div", { class: "pjpk", role: "radiogroup", "aria-label": "Paparan yang diingini" }); f.appendChild(pkBox);
    Object.keys(PJ_PAKEJ).forEach((k, i) => { const p = PJ_PAKEJ[k], r = el("input", { type: "radio", name: "pjpk", value: k }); if (i === 1) r.checked = true; pkBox.appendChild(el("label", null, el("span", null, r, " ", el("b", null, p.ic + " " + p.n)), el("small", null, p.d))); });
    f.appendChild(el("small", { class: "muted" }, "Pilihan ini cadangan anda; pentadbir akan mengesahkan paparan selepas menyemak permohonan."));
    /* lokasi */
    f.appendChild(el("b", null, "3. Pilih lokasi dalam Meta Didik"));
    const lok = el("select", { "aria-label": "Lokasi tajaan" }); lok.appendChild(el("option", { value: "" }, "Pilih kedai/bangunan di lokasi sebenar..."));
    const ambil = {}; PJ.list.forEach((d) => { ambil[d.lk] = d.n; });
    PJ_LOK.forEach(([id, n]) => { const o = el("option", { value: id }, n + (ambil[id] ? " (sudah ditaja)" : "")); if (ambil[id]) o.disabled = true; lok.appendChild(o); });
    fld("Lokasi", lok, "Satu penaja bagi setiap lokasi. Rakan Pendidikan: papan iklan. Emas dan Platinum: kedai/bangunan berjenama.");
    /* maklumat syarikat */
    f.appendChild(el("b", null, "4. Maklumat penaja"));
    const sy = fld("Nama syarikat / organisasi", el("input", { maxlength: "60", autocomplete: "organization" }));
    const ssm = fld("No. pendaftaran (SSM / ROS / kod sekolah)", el("input", { maxlength: "30" }));
    const tl = fld("Slogan ringkas (dipaparkan dalam Meta Didik)", el("input", { maxlength: "80", placeholder: "Contoh: Bersama membina generasi celik digital" }));
    const web = fld("Laman web (pilihan)", el("input", { maxlength: "120", type: "url", placeholder: "https://" }));
    const wk = fld("Warna jenama", el("input", { type: "color", value: "#1f6feb", style: "width:80px;height:40px" }));
    const lg = fld("Logo (PNG, JPG, SVG atau WebP; latar lutsinar digalakkan)", el("input", { type: "file", accept: "image/*" }));
    const prev = el("div", { class: "pjprev", "aria-live": "polite" }, el("span", { class: "muted", style: "font-size:12px" }, "Pratonton logo")); f.appendChild(prev);
    let logo = "";
    lg.addEventListener("change", async () => { try { logo = await logoProses(lg.files[0]); prev.textContent = ""; prev.appendChild(el("img", { src: logo, alt: "Pratonton logo" })); } catch (e) { logo = ""; prev.textContent = e.message; } });
    f.appendChild(el("b", null, "5. Pegawai untuk dihubungi"));
    const pic = fld("Nama pegawai", el("input", { maxlength: "60", autocomplete: "name" }));
    const hp = fld("No. telefon", el("input", { maxlength: "20", type: "tel", autocomplete: "tel" }));
    const em = fld("E-mel", el("input", { maxlength: "80", type: "email", autocomplete: "email" }));
    const nota = fld("Nota (pilihan)", el("textarea", { maxlength: "300", rows: "2" }));
    const ck = el("input", { type: "checkbox", id: "pjCk" });
    f.appendChild(el("label", { for: "pjCk", class: "row", style: "gap:8px;align-items:flex-start;font-size:13px" }, ck, el("span", null, "Saya mengesahkan logo dan maklumat ini milik organisasi saya, dan produk/perkhidmatan kami tidak melibatkan " + PANTANG + ". Saya faham permohonan akan disemak, dan pentadbir akan menghubungi saya untuk urusan sumbangan.")));
    const out = el("span", { class: "muted", style: "font-size:13px" }), sb = el("button", { type: "button", class: "btn" }, "Hantar permohonan");
    f.appendChild(el("div", { class: "row", style: "gap:10px;align-items:center;flex-wrap:wrap" }, sb, out));
    const pk = () => (pkBox.querySelector("input:checked") || {}).value || "emas";
    sb.addEventListener("click", async () => {
      const v = (n, m) => String(n.value || "").replace(/[<>]/g, "").trim().slice(0, m);
      const d = { sy: v(sy, 60), ssm: v(ssm, 30), tl: v(tl, 80), web: v(web, 120), wk: /^#[0-9a-f]{6}$/i.test(wk.value) ? wk.value : "#1f6feb", pic: v(pic, 60), hp: v(hp, 20), em: v(em, 80), nota: v(nota, 300), pk: pk(), lk: lok.value, bln: +bln.value, jn: jenis.value, rm: Math.round(+rm.value || 0), logo: logo, t: { ".sv": "timestamp" } };
      const err = !(d.rm >= 1 && d.rm <= 10000000) ? "Isi jumlah tajaan (RM)." : d.sy.length < 3 ? "Isi nama penaja." : !d.lk ? "Pilih lokasi dalam Meta Didik." : !d.logo ? "Muat naik logo syarikat." : d.pic.length < 3 ? "Isi nama pegawai." : !/^\+?6?0[\d\s-]{8,13}$/.test(d.hp) ? "Isi nombor telefon yang sah." : !/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(d.em) ? "Isi e-mel yang sah." : d.web && !webOk(d.web) ? "Laman web mesti bermula dengan https://" : !ck.checked ? "Tandakan pengesahan." : "";
      if (err) { out.textContent = err; return; }
      if (!d.web) delete d.web; if (!d.ssm) delete d.ssm; if (!d.tl) delete d.tl; if (!d.nota) delete d.nota;
      if (!FB.url) { out.textContent = "Permohonan memerlukan sambungan pelayan Meta Didik."; return; }
      sb.disabled = true; out.textContent = "Menghantar...";
      try {
        if (typeof AUTH !== "undefined" && AUTH.on()) await AUTH.ensure();
        await FB.req("PUT", "penaja_mohon/pj" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), d);
        f.textContent = ""; f.append(el("div", { class: "notice" }, "✔ Terima kasih! Permohonan " + d.sy + " diterima. Pentadbir Meta Didik akan menghubungi " + d.em + " untuk urusan sumbangan RM" + d.rm.toLocaleString("ms-MY") + ". Logo dipaparkan selepas sumbangan diterima."));
      } catch (e) { sb.disabled = false; out.textContent = "Gagal dihantar (kod " + (e.code || "rangkaian") + "). Cuba lagi."; }
    });
  }

  /* ---------- pentadbir: semak permohonan, luluskan, urus penaja aktif ---------- */
  const ADM = { m: null, a: null };
  async function pjAdminBox(host) {
    if (typeof kmAdm !== "function" || !kmAdm()) return;
    host.textContent = "";
    const c = el("details", { class: "card", style: "margin:8px 0" }); host.appendChild(c);
    const n = ADM.m ? ADM.m.filter((x) => !x.st).length : 0;
    c.appendChild(el("summary", { style: "cursor:pointer;font-weight:700" }, "Pentadbir: penaja Meta Didik" + (ADM.m ? " (" + n + " permohonan baharu, " + ADM.a.length + " aktif)" : ""))); c.open = !!ADM.m;
    const muat = el("button", { type: "button", class: "btn alt sm" }, "Muat permohonan & penaja"); c.appendChild(muat);
    muat.addEventListener("click", async () => {
      try {
        const m = (await kmAdmReq("GET", "penaja_mohon")) || {}; ADM.m = Object.keys(m).map((id) => Object.assign({ id: id }, m[id])).sort((a, b) => (b.t || 0) - (a.t || 0));
        const a = (await kmAdmReq("GET", "penaja")) || {}; ADM.a = Object.keys(a).map((id) => Object.assign({ id: id }, a[id])).sort((x, y) => (y.tamat || 0) - (x.tamat || 0));
      } catch (e) { toast("Gagal memuat (kod " + (e.code || "rangkaian") + ").", "bad"); return; }
      pjAdminBox(host);
    });
    if (!ADM.m) return;
    const now = Date.now(), aktifLk = {}; ADM.a.forEach((d) => { if (!d.tamat || d.tamat > now) aktifLk[d.lk] = d.n; });
    const tarikh = (t) => (t ? new Date(t).toLocaleDateString("ms-MY") : "-");
    c.appendChild(el("h3", { style: "margin:10px 0 4px" }, "Permohonan"));
    if (!ADM.m.length) c.appendChild(el("p", { class: "muted" }, "Tiada permohonan."));
    ADM.m.forEach((x) => {
      const d = el("div", { class: "card", style: "gap:6px;padding:10px" }); c.appendChild(d);
      const p = PJ_PAKEJ[x.pk] || { n: x.pk, ic: "" }, lk = pjLok(x.lk);
      d.append(el("div", { class: "row", style: "gap:10px;align-items:center;flex-wrap:wrap" }, el("div", { class: "pjprev", style: "width:120px;height:60px" }, x.logo ? el("img", { src: x.logo, alt: x.sy }) : null), el("div", null, el("b", null, x.sy + " · RM" + (x.rm | 0).toLocaleString("ms-MY") + " · " + x.bln + " bulan · cadangan: " + p.ic + " " + p.n), el("div", { style: "font-size:13px" }, "Lokasi: " + (lk ? lk.n : x.lk) + (aktifLk[x.lk] && !x.st ? " ⚠ sudah ditaja " + aktifLk[x.lk] : "")), el("div", { style: "font-size:13px" }, "Tajaan: RM" + (x.rm | 0).toLocaleString("ms-MY") + (x.jn === "pendidikan" ? " (badan pendidikan)" : x.jn === "individu" ? " (individu)" : "") + " · " + tarikh(x.t) + (x.st ? " · " + x.st : " · baharu")))));
      d.appendChild(el("div", { style: "font-size:13px" }, "Pegawai: " + x.pic + " · " + x.hp + " · " + x.em + (x.ssm ? " · No. daftar: " + x.ssm : "") + (x.web ? " · " + x.web : "")));
      if (x.tl) d.appendChild(el("div", { style: "font-size:13px" }, "Slogan: " + x.tl)); if (x.nota) d.appendChild(el("div", { style: "font-size:13px;color:#ffe9a8" }, "Nota: " + x.nota));
      if (x.st) return;
      const tanda = (st) => { const o = Object.assign({}, x, { st: st }); delete o.id; return kmAdmPut("penaja_mohon/" + x.id, o); };
      const pkSel = el("select", { "aria-label": "Paparan diluluskan" }); Object.keys(PJ_PAKEJ).forEach((k) => pkSel.appendChild(el("option", { value: k }, PJ_PAKEJ[k].ic + " " + PJ_PAKEJ[k].n))); pkSel.value = PJ_PAKEJ[x.pk] ? x.pk : "rakan";
      const ok = el("button", { type: "button", class: "btn sm" }, "Luluskan (sumbangan diterima)"), no = el("button", { type: "button", class: "btn alt sm" }, "Tolak");
      ok.addEventListener("click", async () => {
        if (aktifLk[x.lk] && !confirm("Lokasi ini sudah ditaja " + aktifLk[x.lk] + ". Teruskan juga?")) return;
        const mula = Date.now(), d2 = { n: x.sy, logo: x.logo, pk: pkSel.value, lk: x.lk, wk: x.wk || "#1f6feb", mula: mula, tamat: mula + (x.bln || 3) * 30.44 * 864e5, mohon: x.id };
        if (x.tl) d2.tl = x.tl; if (x.web && webOk(x.web)) d2.web = x.web;
        try { await kmAdmPut("penaja/" + x.id, d2); await tanda("lulus"); toast(x.sy + " kini dipaparkan.", "ok"); ADM.m = null; pjMuat(); muat.click(); } catch (e) { toast("Gagal (kod " + (e.code || "rangkaian") + ").", "bad"); }
      });
      no.addEventListener("click", async () => { if (!confirm("Tolak permohonan " + x.sy + "?")) return; try { await tanda("tolak"); x.st = "tolak"; pjAdminBox(host); } catch (e) { toast("Gagal (kod " + (e.code || "rangkaian") + ").", "bad"); } });
      d.appendChild(el("div", { class: "row", style: "gap:8px;flex-wrap:wrap;align-items:center" }, el("span", { style: "font-size:13px" }, "Paparan:"), pkSel, ok, no));
    });
    c.appendChild(el("h3", { style: "margin:12px 0 4px" }, "Penaja aktif & tamat"));
    if (!ADM.a.length) c.appendChild(el("p", { class: "muted" }, "Belum ada penaja."));
    ADM.a.forEach((x) => {
      const aktif = !x.tamat || x.tamat > now, p = PJ_PAKEJ[x.pk] || { n: x.pk, ic: "" }, lk = pjLok(x.lk);
      const d = el("div", { class: "row", style: "gap:10px;align-items:center;flex-wrap:wrap;padding:6px 0;border-top:1px solid var(--line2)" }); c.appendChild(d);
      const lj = el("button", { type: "button", class: "btn alt sm" }, "Lanjut 3 bulan"), tb = el("button", { type: "button", class: "btn alt sm" }, "Tarik balik");
      lj.addEventListener("click", async () => { try { await kmAdmPut("penaja/" + x.id + "/tamat", Math.max(now, x.tamat || now) + 3 * 30.44 * 864e5); toast("Dilanjutkan.", "ok"); muat.click(); pjMuat(); } catch (e) { toast("Gagal (kod " + (e.code || "rangkaian") + ").", "bad"); } });
      tb.addEventListener("click", async () => { if (!confirm("Tarik balik " + x.n + " daripada paparan dan Meta Didik?")) return; try { await kmAdmReq("DELETE", "penaja/" + x.id); toast("Ditarik balik.", "ok"); muat.click(); pjMuat(); } catch (e) { toast("Gagal (kod " + (e.code || "rangkaian") + ").", "bad"); } });
      d.append(el("div", { class: "pjprev", style: "width:90px;height:44px" }, el("img", { src: x.logo, alt: x.n })), el("span", { style: "flex:1 1 220px;font-size:13px" }, el("b", null, x.n), " · " + p.ic + " " + p.n + " · " + (lk ? lk.n : x.lk) + " · " + (aktif ? "aktif hingga " : "tamat ") + tarikh(x.tamat)), lj, tb);
    });
  }
  window.pjKad = pjKad; window.pjBuka = pjBuka; window.pjAdminBox = pjAdminBox;
})();
