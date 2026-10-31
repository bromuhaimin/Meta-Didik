"""
Meta Didik: Geospatial Validation Engine (Python tulen, tanpa pustaka luar).

Input  : data padat kawasan (keluaran tools/geo/perintis.py) dan meta-geo.json (sempadan negeri).
Output : laporan dengan setiap isu: kod, tahap (ralat | amaran | info), punca (dataset | rendering | sah),
         koordinat WGS84, ID OSM dan sumber. Enjin ini MELAPOR sahaja: tiada koordinat diubah atau diagak.

Semakan:
  V1 jalan-air      : jalan merentas badan air/sungai tanpa bridge/tunnel (dan bukan culvert pada sungai)
  V2 jalan-bangunan : segmen jalan menembusi poligon bangunan (kecuali tunnel / aras berbeza)
  V3 duplikat       : dua jalan berkongsi segmen nod yang sama
  V4 terputus       : komponen rangkaian jalan dipandu yang kecil dan terasing (tidak menyentuh tepi kawasan)
  V5 persilangan    : dua jalan bersilang tanpa nod dikongsi:
                        aras sama  -> kemungkinan simpang tidak dipetakan / ralat data (amaran)
                        aras beza  -> persimpangan bertingkat sah (info, TIDAK disambung)
  V6 aras           : bridge dengan layer <= 0, tunnel dengan layer >= 0, lompatan layer > 1 pada nod dikongsi
  V7 sempadan       : titik jalan/bangunan di luar negeri yang dijangka (sempadan meta-geo.json, resolusi ~1 km)
  V8 terapung       : (dijalankan pada adegan 3D, lihat mod/perintis-teras.js lpSemakTanah)
"""
import math
from collections import defaultdict

SEL = 50.0  # saiz sel indeks ruang (meter)


def _seg_x(a, b, c, d):
    """Persilangan dua segmen ab, cd (tidak termasuk sentuhan hujung). Pulang titik atau None."""
    r = (b[0] - a[0], b[1] - a[1]); s = (d[0] - c[0], d[1] - c[1])
    den = r[0] * s[1] - r[1] * s[0]
    if abs(den) < 1e-12:
        return None
    t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den
    u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den
    e = 1e-6
    if e < t < 1 - e and e < u < 1 - e:
        return (a[0] + t * r[0], a[1] + t * r[1])
    return None


def _dalam(pt, ring):
    x, z = pt; ins = False; n = len(ring)
    for i in range(n):
        x1, z1 = ring[i]; x2, z2 = ring[(i + 1) % n]
        if (z1 > z) != (z2 > z) and x < (x2 - x1) * (z - z1) / ((z2 - z1) or 1e-12) + x1:
            ins = not ins
    return ins


class Grid:
    def __init__(self):
        self.g = defaultdict(list)

    def add(self, a, b, ref):
        for k in self._sel(a, b):
            self.g[k].append((a, b, ref))

    def _sel(self, a, b):
        x0, x1 = sorted((a[0], b[0])); z0, z1 = sorted((a[1], b[1]))
        for i in range(int(math.floor(x0 / SEL)), int(math.floor(x1 / SEL)) + 1):
            for j in range(int(math.floor(z0 / SEL)), int(math.floor(z1 / SEL)) + 1):
                yield (i, j)

    def cari(self, a, b):
        seen = set()
        for k in self._sel(a, b):
            for it in self.g.get(k, ()):
                key = (id(it[2]), tuple(it[0]), tuple(it[1]))
                if key not in seen:
                    seen.add(key); yield it


def _segs(p, tutup=False):
    n = len(p)
    for i in range(n - 1 + (1 if tutup else 0)):
        yield p[i], p[(i + 1) % n], i


class Projek:
    def __init__(self, meta):
        self.lat0, self.lon0 = meta["pusat"]
        self.ky = 110574.0; self.kx = 111320.0 * math.cos(math.radians(self.lat0))

    def ll(self, x, z):
        return [round(self.lat0 - z / self.ky, 6), round(self.lon0 + x / self.kx, 6)]


def sahkan(d, geo=None):
    P = Projek(d["meta"]); isu = []; kira = defaultdict(int)

    def lapor(kod, tahap, punca, xz, pesan, ids):
        isu.append({"kod": kod, "tahap": tahap, "punca": punca, "latlon": P.ll(*xz), "osm": ids, "pesan": pesan, "sumber": d["meta"].get("sumber")})
        kira[kod + ":" + tahap] += 1

    jalan = d.get("jalan", []); air = d.get("air", []); bang = d.get("bangunan", [])
    # indeks
    gA, gB, gJ = Grid(), Grid(), Grid()
    for w in air:
        for a, b, _ in _segs(w["p"], w.get("poly") == 1):
            gA.add(a, b, w)
    for bd in bang:
        for a, b, _ in _segs(bd["p"], True):
            gB.add(a, b, bd)
    for j in jalan:
        for a, b, i in _segs(j["p"]):
            gJ.add(a, b, (j, i))

    # V1 jalan-air
    for j in jalan:
        if j.get("b") or j.get("t"):
            continue
        for a, b, _ in _segs(j["p"]):
            for c, e, w in gA.cari(a, b):
                if w.get("t"):  # sungai dalam pembetung (culvert): persilangan sah
                    continue
                x = _seg_x(a, b, c, e)
                if x:
                    lapor("V1", "ralat", "dataset", x, "Jalan '%s' (%s) merentas %s '%s' tanpa atribut bridge/tunnel" % (j.get("n") or "-", j["hw"], w["k"], w.get("n") or "-"), [j["id"], w["id"]])
    # V2 jalan-bangunan
    for j in jalan:
        if j.get("t") or j["k"] == "pejalan":
            continue
        for a, b, _ in _segs(j["p"]):
            for c, e, bd in gB.cari(a, b):
                if bd.get("l", 0) != 0 and bd.get("l") != j.get("l", 0):
                    continue
                x = _seg_x(a, b, c, e)
                if x:
                    lapor("V2", "amaran", "dataset", x, "Jalan '%s' menembusi bangunan %s" % (j.get("n") or "-", bd["id"]), [j["id"], bd["id"]]); break
    # V3 duplikat
    segmap = defaultdict(list)
    for j in jalan:
        nd = j.get("nd", [])
        for i in range(len(nd) - 1):
            segmap[tuple(sorted((nd[i], nd[i + 1])))].append(j)
    dilapor = set()
    for k, js in segmap.items():
        ids = sorted(set(j["id"] for j in js))
        if len(ids) > 1 and tuple(ids) not in dilapor:
            dilapor.add(tuple(ids))
            j0 = js[0]; i = j0["nd"].index(k[0]) if k[0] in j0["nd"] else 0
            lapor("V3", "amaran", "dataset", j0["p"][min(i, len(j0["p"]) - 1)], "Geometri jalan berulang antara %s" % ids, ids)
    # V4 terputus (rangkaian dipandu)
    adj = defaultdict(set); jl = {}
    for j in jalan:
        if not j.get("pandu"):
            continue
        nd = j.get("nd", [])
        for i in range(len(nd) - 1):
            adj[nd[i]].add(nd[i + 1]); adj[nd[i + 1]].add(nd[i])
        for n in nd:
            jl.setdefault(n, []).append(j)
    seen = set(); bx = max(abs(v) for j in jalan for p in j["p"] for v in p) if jalan else 0
    for s in list(adj):
        if s in seen:
            continue
        comp, st = set(), [s]
        while st:
            u = st.pop()
            if u in comp:
                continue
            comp.add(u); st.extend(adj[u] - comp)
        seen |= comp
        ways = {j["id"]: j for n in comp for j in jl.get(n, [])}
        tepi = any(max(abs(p[0]), abs(p[1])) > bx - 60 for j in ways.values() for p in j["p"])
        if len(ways) <= 2 and not tepi:
            j0 = next(iter(ways.values()))
            lapor("V4", "amaran", "dataset", j0["p"][0], "Segmen jalan terasing (%d jalan) tidak bersambung dengan rangkaian" % len(ways), sorted(ways))
    # V5 persilangan tanpa nod
    for j in jalan:
        ndj = set(j.get("nd", []))
        for a, b, _ in _segs(j["p"]):
            for c, e, (k2, i2) in gJ.cari(a, b):
                if k2["id"] <= j["id"]:
                    continue
                if ndj & set(k2.get("nd", [])) and (k2["nd"][i2] in ndj or k2["nd"][i2 + 1] in ndj):
                    continue
                x = _seg_x(a, b, c, e)
                if not x:
                    continue
                if j.get("l", 0) != k2.get("l", 0) or j.get("b") or k2.get("b") or j.get("t") or k2.get("t"):
                    kira["V5:bertingkat"] += 1  # persimpangan bertingkat sah: tidak disambung
                elif j["k"] == "pejalan" or k2["k"] == "pejalan":
                    kira["V5:pejalan"] += 1
                else:
                    lapor("V5", "amaran", "dataset", x, "Jalan '%s' dan '%s' bersilang pada aras sama tanpa nod simpang (tidak disambung)" % (j.get("n") or j["hw"], k2.get("n") or k2["hw"]), [j["id"], k2["id"]])
    # V6 aras
    lay = defaultdict(set)
    for j in jalan:
        if j.get("b") and j.get("l", 0) <= 0:
            lapor("V6", "info", "dataset", j["p"][0], "Jambatan dengan layer=%d (lazimnya >= 1)" % j.get("l", 0), [j["id"]])
        if j.get("t") and j.get("l", 0) >= 0:
            lapor("V6", "info", "dataset", j["p"][0], "Terowong dengan layer=%d (lazimnya <= -1)" % j.get("l", 0), [j["id"]])
        for n in (j.get("nd") or [])[:1] + (j.get("nd") or [])[-1:]:
            lay[n].add(j.get("l", 0))
    for j in jalan:
        for idx, n in ((0, (j.get("nd") or [None])[0]), (-1, (j.get("nd") or [None])[-1])):
            ls = lay.get(n, set())
            if ls and max(ls) - min(ls) > 1:
                lapor("V6", "amaran", "dataset", j["p"][idx], "Lompatan aras %s pada nod dikongsi" % sorted(ls), [j["id"]]); break
    # V7 sempadan negeri
    if geo and d["meta"].get("negeri"):
        rings = [r for k in d["meta"]["negeri"] for r in geo["states"].get(k, [])]
        U, lon0, lat0, kx, kz = geo["U"], geo["lon0"], geo["lat0"], geo["kx"], geo["kz"]
        def dalam_negeri(x, z):
            lat, lon = P.ll(x, z); wx, wz = (lon - lon0) * kx * U, (lat0 - lat) * kz * U
            return any(_dalam((wx, wz), r) for r in rings)
        luar = 0
        for j in jalan:
            for p in j["p"][::max(1, len(j["p"]) // 3)]:
                if not dalam_negeri(*p):
                    luar += 1
                    if luar <= 20:
                        lapor("V7", "amaran", "dataset", p, "Titik di luar sempadan %s (sempadan meta-geo.json beresolusi rendah ~1 km)" % "/".join(d["meta"]["negeri"]), [j["id"]])
        kira["V7:titik_luar"] = luar
    ring = {"jalan": len(jalan), "air": len(air), "bangunan": len(bang), "bangunan_tinggi_anggaran": sum(1 for b in bang if b.get("anggar")),
            "jambatan": sum(1 for j in jalan if j.get("b")), "terowong": sum(1 for j in jalan if j.get("t"))}
    ring.update(kira)
    return {"meta": d["meta"], "ringkasan": ring, "isu": isu}


def markdown(lap):
    m = lap["meta"]; r = lap["ringkasan"]
    out = ["# Laporan Geospatial Validation Engine: " + m.get("nama", ""), "",
           "- Sumber: %s (%s), %s" % (m.get("sumber"), m.get("lesen"), m.get("atribusi")),
           "- Tarikh data OSM: %s; dimuat turun: %s; laporan dijana: %s" % (m.get("tarikh_osm"), m.get("dimuat"), m.get("dijana")), "",
           "## Ringkasan", "", "| Perkara | Bilangan |", "|---|---|"]
    out += ["| %s | %s |" % (k, v) for k, v in r.items()]
    out += ["", "## Isu (maksimum 300 pertama)", "", "| Kod | Tahap | Punca | Lat, Lon | OSM | Penerangan |", "|---|---|---|---|---|---|"]
    for i in lap["isu"][:300]:
        out.append("| %s | %s | %s | %.6f, %.6f | %s | %s |" % (i["kod"], i["tahap"], i["punca"], i["latlon"][0], i["latlon"][1], ",".join(str(x) for x in i["osm"]), i["pesan"].replace("|", "/")))
    out += ["", "Nota: enjin ini melapor sahaja. Pembetulan dibuat pada sumber (OpenStreetMap) atau melalui senarai pengecualian yang diaudit, bukan dengan mengagak koordinat."]
    return "\n".join(out) + "\n"
