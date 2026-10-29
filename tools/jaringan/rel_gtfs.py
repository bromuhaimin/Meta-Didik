#!/usr/bin/env python3
"""Jana semula laluan rel RAILS (dunia.js) daripada GTFS rasmi data.gov.my (KTMB dan Prasarana Rapid Rail KL).

Setiap laluan dalam Meta Didik mempunyai landasan sendiri, jadi perkhidmatan yang berkongsi landasan sebenar
dipecahkan supaya tiada landasan bertindih:
  ets   ETS Utara        KL Sentral - Padang Besar (hentian ETS; stesen Komuter lain sebagai titik jajaran)
  etss  ETS Selatan      Pulau Sebang/Tampin - JB Sentral
  kmsr  Komuter Seremban KL Sentral - Pulau Sebang/Tampin
  kmbc  Komuter          Putra - Batu Caves
  kmpk  Komuter          KL Sentral - Pelabuhan Klang
  kmut  Komuter Utara    Butterworth - Bukit Mertajam
  kpt   KTM Pantai Timur Gemas - Tumpat (hentian Ekspres Rakyat Timuran)
  metro: lrtkj, lrtam, lrtsp (Putra Heights - Chan Sow Lin), mrtkg, mrtpy, mono, lrtsa, brt (jajaran shapes.txt)
Laluan lain (ECRL, KLIA Ekspres, KTM Sabah, lebuh raya) tidak diubah.

Penggunaan: python3 tools/jaringan/rel_gtfs.py   (menulis semula blok berkenaan dalam dunia.js)
Keperluan:  pip install shapely
"""
import os, sys, csv, io, json, math, re, zipfile, heapq, urllib.request, collections
from shapely.geometry import Polygon, Point
from shapely.ops import unary_union

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
KERJA = os.environ.get("KERJA", os.path.join(HERE, "_kerja"))
os.makedirs(KERJA, exist_ok=True)
FEEDS = {"ktmb": "ktmb", "rail": "prasarana?category=rapid-rail-kl"}

def feed(name):
    p = os.path.join(KERJA, "gtfs_" + name + ".zip")
    if not os.path.exists(p):
        url = "https://api.data.gov.my/gtfs-static/" + FEEDS[name]
        print("muat turun", url); urllib.request.urlretrieve(url, p)
    z = zipfile.ZipFile(p)
    def rd(f):
        return list(csv.DictReader(io.TextIOWrapper(z.open(f), encoding="utf-8-sig")))
    return rd

def km(a, b):
    return math.hypot(a[0] - b[0], (a[1] - b[1]) * math.cos(math.radians(a[0]))) * 111.2

# ---- nama stesen ----
FIX = {"KL SENTRAL": "KL Sentral", "KLCC": "KLCC", "PWTC": "PWTC", "UKM": "UKM", "USJ": "USJ", "SS": "SS", "IOI": "IOI", "UITM": "UiTM", "UPM": "UPM", "TRX": "TRX", "JB": "JB", "BK5": "BK5", "CIQ": "CIQ", "KL": "KL", "SA": "SA", "BDR": "Bandar", "PEL": "Pelabuhan", "SEL": "Selatan", "JLN": "Jalan", "KG": "Kampung", "KG.": "Kampung", "SG": "Sungai", "TANJONG": "Tanjung", "KENTOMENN": "Kentonmen", "KENTOMEN": "Kentonmen", "TASEK": "Tasik", "MIDVALLEY": "Mid Valley", "BHARU": "Bharu"}
SPONSOR = re.compile(r"\s+-\s+(REDONE|BANK RAKYAT|CBP COOPBANK PERTAMA|UOB|SA SENTRAL)$")
def nama(s):
    s = SPONSOR.sub("", s.strip()); out = []
    for w in s.replace("/", " / ").split():
        u = w.upper()
        if u in FIX: out.append(FIX[u])
        elif re.match(r"^\d", w) or w == "/": out.append(w)
        elif u.startswith("DATO'"): out.append("Dato'")
        else: out.append(w[:1].upper() + w[1:].lower())
    s = " ".join(out).replace(" / ", "/")
    s = s.replace("Perhentian Mid Valley", "Mid Valley").replace("Tun Razak Exchange", "TRX").replace("Bukit Bintang", "Bukit Bintang").replace("Sunu-monash", "SunU-Monash").replace("Usj7", "USJ 7").replace("South Quay-usj 1", "South Quay-USJ 1").replace("Sunway-setia Jaya", "Sunway-Setia Jaya")
    return s

# ---- negeri setiap titik (meta-geo.json) ----
g = json.load(open(os.path.join(REPO, "meta-geo.json")))
U, lon0, lat0, kx, kz = g["U"], g["lon0"], g["lat0"], g["kx"], g["kz"]
toll = lambda x, z: (x / (kx * U) + lon0, lat0 - z / (kz * U))
STP = {k: unary_union([Polygon([toll(*q) for q in r]).buffer(0) for r in v]) for k, v in g["states"].items()}
def negeri(la, lo):
    p = Point(lo, la)
    for k, s in sorted(STP.items(), key=lambda kv: kv[1].area):  # negeri kecil dahulu (KL dan Putrajaya terletak di dalam lingkungan Selangor)
        if s.contains(p): return k
    return min(STP, key=lambda k: STP[k].distance(p))

# ---- KTMB: graf hentian ----
rk = feed("ktmb")
kst = {s["stop_id"]: s for s in rk("stops.txt")}
ktrips = rk("trips.txt"); kst_t = collections.defaultdict(list)
for x in rk("stop_times.txt"): kst_t[x["trip_id"]].append(x)
for t in kst_t: kst_t[t].sort(key=lambda x: int(x["stop_sequence"]))
P = lambda i: (float(kst[i]["stop_lat"]), float(kst[i]["stop_lon"]))
adj = collections.defaultdict(dict)
serve = collections.defaultdict(set)  # route_id -> stop_ids
skip = set()  # pasangan yang dilangkau oleh perkhidmatan ekspres (ada stesen di antaranya dalam sesuatu trip)
for t in ktrips:
    seq = [x["stop_id"] for x in kst_t[t["trip_id"]]]
    for i in range(len(seq)):
        for j in range(i + 2, len(seq)): skip.add(frozenset((seq[i], seq[j])))
for t in ktrips:
    seq = [x["stop_id"] for x in kst_t[t["trip_id"]]]
    serve[t["route_id"]].update(seq)
    for a, b in zip(seq, seq[1:]):
        if frozenset((a, b)) in skip: continue
        d = km(P(a), P(b)); adj[a][b] = adj[b][a] = d
byname = {}
for i, s in kst.items(): byname.setdefault(s["stop_name"].strip(), i)
def chain(a, b):
    """laluan melalui hentian terbanyak (kos d^1.6 mengutamakan lompatan pendek)"""
    A, B = byname[a], byname[b]; dist = {A: 0}; prev = {}; H = [(0, A)]
    while H:
        d, x = heapq.heappop(H)
        if x == B: break
        if d > dist[x]: continue
        for y, w in adj[x].items():
            nd = d + w ** 1.6
            if nd < dist.get(y, 1e18): dist[y] = nd; prev[y] = x; heapq.heappush(H, (nd, y))
    out = [B]
    while out[-1] != A: out.append(prev[out[-1]])
    return out[::-1]
ETS_STOP = serve["ETS"]; ERT_STOP = serve["ERT"]
def ktm_line(a, b, stops):
    return [[nama(kst[i]["stop_name"]), P(i)[0], P(i)[1], 1 if (stops is None or i in stops) else 0, 0] for i in chain(a, b)]
KTM = {
    "ets": ktm_line("KL SENTRAL", "PADANG BESAR", ETS_STOP | {byname["BUTTERWORTH"]}),
    "etss": ktm_line("PULAU SEBANG/TAMPIN", "JB SENTRAL", ETS_STOP),
    "kmsr": ktm_line("KL SENTRAL", "PULAU SEBANG/TAMPIN", None),
    "kmbc": ktm_line("PUTRA", "BATU CAVES", None),
    "kmpk": ktm_line("KL SENTRAL", "PEL KLANG SEL", None),
    "kmut": ktm_line("BUTTERWORTH", "BUKIT MERTAJAM", None),
    "kpt": ktm_line("GEMAS", "TUMPAT", ERT_STOP),
}
# ETS Utara: Butterworth bukan di landasan utama; buang daripada ETS (dilayan oleh kmut)
KTM["ets"] = [s for s in KTM["ets"] if s[0] != "Butterworth"]
for s in KTM["ets"]:
    if s[0] in ("Kuala Lumpur", "Bukit Mertajam", "Padang Besar", "Arau", "Rawang", "Sungai Buloh"): s[3] = 1

# ---- Rapid Rail: susunan stesen + jajaran shapes ----
rr = feed("rail")
rst = {s["stop_id"]: s for s in rr("stops.txt")}
rtrips = rr("trips.txt"); rst_t = collections.defaultdict(list)
for x in rr("stop_times.txt"): rst_t[x["trip_id"]].append(x)
shp = collections.defaultdict(list)
for x in rr("shapes.txt"): shp[x["shape_id"]].append((int(x["shape_pt_sequence"]), float(x["shape_pt_lat"]), float(x["shape_pt_lon"])))
for k in shp: shp[k] = [(a, b) for _, a, b in sorted(shp[k])]
UG = {"lrtkj": {"Ampang Park", "KLCC", "Kampung Baru", "Dang Wangi", "Masjid Jamek"},
      "mrtkg": {"Muzium Negara", "Pasar Seni", "Merdeka", "Bukit Bintang", "TRX", "Cochrane", "Maluri"},
      "mrtpy": {"Sentul Barat", "Titiwangsa", "Hospital Kuala Lumpur", "Raja Uda", "Ampang Park", "Persiaran KLCC", "Conlay", "TRX", "Chan Sow Lin"}}
def metro(route, gid, upto=None):
    ts = [t for t in rtrips if t["route_id"] == route]
    best = max(ts, key=lambda t: len(rst_t[t["trip_id"]]))
    seq = [rst[x["stop_id"]] for x in sorted(rst_t[best["trip_id"]], key=lambda x: int(x["stop_sequence"]))]
    st = [[nama(s["stop_name"]), float(s["stop_lat"]), float(s["stop_lon"])] for s in seq]
    if upto:
        j = [s[0] for s in st].index(upto); st = st[:j + 1]
    sh = shp.get(best.get("shape_id")) or []
    out = []
    near = lambda q: min(range(len(sh)), key=lambda i: km(sh[i], q)) if sh else 0
    idx = [near((s[1], s[2])) for s in st]
    for j, s in enumerate(st):
        out.append([s[0], s[1], s[2], 1, 1 if s[0] in UG.get(gid, ()) else 0])
        if j + 1 < len(st) and sh:
            a, b = idx[j], idx[j + 1]; rng = range(a + 1, b) if b > a else range(a - 1, b, -1)
            last = (s[1], s[2])
            for i in rng:
                q = sh[i]
                if km(q, last) >= 0.35 and km(q, (st[j + 1][1], st[j + 1][2])) >= 0.2: out.append([None, q[0], q[1], 0, 0]); last = q
    return out
MET = {"lrtkj": metro("KJ", "lrtkj"), "lrtam": metro("AG", "lrtam"), "lrtsp": metro("PH", "lrtsp", upto="Chan Sow Lin"),
       "mrtkg": metro("KGL", "mrtkg"), "mrtpy": metro("PYL", "mrtpy"), "mono": metro("MR", "mono"), "lrtsa": metro("SA", "lrtsa"), "brt": metro("BRT", "brt")}

HDR = {
    "ets": '{ id: "ets", n: "ETS", nm: "ETS KTM (Utara)", col: "#1f4fa8", c2: "#f2c13a", quiz: 1, st: [',
    "etss": '{ id: "etss", n: "ETS", nm: "ETS KTM (Selatan)", col: "#1f4fa8", c2: "#f2c13a", quiz: 1, st: [',
    "kpt": '{ id: "kpt", n: "KTM Pantai Timur", nm: "KTM Laluan Pantai Timur (Ekspres Rakyat Timuran)", col: "#6e6e6e", c2: "#f2c13a", quiz: 1, st: [',
    "kmsr": '{ id: "kmsr", n: "Komuter", nm: "KTM Komuter (Laluan Seremban)", col: "#1d5fbf", c2: "#e23a3a", tap: 1, st: [',
    "kmbc": '{ id: "kmbc", n: "Komuter", nm: "KTM Komuter (Cawangan Batu Caves)", col: "#1d5fbf", c2: "#e23a3a", tap: 1, st: [',
    "kmpk": '{ id: "kmpk", n: "Komuter", nm: "KTM Komuter (Laluan Pelabuhan Klang)", col: "#1d5fbf", c2: "#e23a3a", tap: 1, st: [',
    "kmut": '{ id: "kmut", n: "Komuter Utara", nm: "KTM Komuter Utara (Butterworth)", col: "#018000", c2: "#ffffff", tap: 1, st: [',
    "lrtkj": '{ id: "lrtkj", n: "LRT Kelana Jaya", nm: "LRT Laluan Kelana Jaya", metro: 1, tap: 1, col: "#e0245e", c2: "#ffffff", st: [',
    "lrtam": '{ id: "lrtam", n: "LRT Ampang", nm: "LRT Laluan Ampang", metro: 1, tap: 1, col: "#f08a24", c2: "#ffffff", st: [',
    "lrtsp": '{ id: "lrtsp", n: "LRT Sri Petaling", nm: "LRT Laluan Sri Petaling", metro: 1, tap: 1, col: "#8a1e2d", c2: "#ffffff", st: [',
    "mrtkg": '{ id: "mrtkg", n: "MRT Kajang", nm: "MRT Laluan Kajang", metro: 1, tap: 1, col: "#0f8a3d", c2: "#ffffff", st: [',
    "mrtpy": '{ id: "mrtpy", n: "MRT Putrajaya", nm: "MRT Laluan Putrajaya", metro: 1, tap: 1, col: "#f2c418", c2: "#1d2b3a", st: [',
    "mono": '{ id: "mono", n: "Monorel", nm: "Monorel KL", metro: 1, mono: 1, tap: 1, col: "#7cc242", c2: "#1d2b3a", st: [',
    "lrtsa": '{ id: "lrtsa", n: "LRT Shah Alam", nm: "LRT Laluan Shah Alam", metro: 1, tap: 1, col: "#d63fbf", c2: "#ffffff", st: [',
    "brt": '{ id: "brt", n: "BRT Sunway", nm: "BRT Laluan Sunway", metro: 1, brt: 1, tap: 1, col: "#115740", c2: "#ffffff", st: [',
}
def js(lid, pts):
    rows = []
    for nm, la, lo, stop, ug in pts:
        k = negeri(la, lo)
        nmv = nm if nm else "-"
        rows.append('["%s", "%s", %.5f, %.5f, %d%s]' % (k, nmv.replace('"', "'"), la, lo, stop, ", 1" if ug else ""))
    lines = []; cur = []
    for r in rows:
        cur.append(r)
        if len(cur) == 4: lines.append("    " + ", ".join(cur)); cur = []
    if cur: lines.append("    " + ", ".join(cur))
    return "  " + HDR[lid] + "\n" + ",\n".join(lines) + "] }"

ALL = dict(KTM); ALL.update(MET)
src = open(os.path.join(REPO, "dunia.js")).read()
i = src.index("const RAILS = ["); j = src.index("\n];", i)
body = src[i + len("const RAILS = ["):j]
# pecah blok sedia ada
blocks = re.split(r"\n(?=  (?:/\*[^\n]*\n  )*\{ id: \")", body)
keep = []
for b in blocks:
    m = re.search(r'\{ id: "(\w+)"', b)
    if not m: keep.append(b); continue
    if m.group(1) in ALL: continue
    b = re.sub(r"\s*/\*(?:(?!\*/).)*\*/\s*$", "", b.rstrip(), flags=re.S)  # komen tergantung di hujung blok (milik blok yang dibuang)
    keep.append(b.rstrip().rstrip(","))
gen = [js(k, ALL[k]) for k in ["ets", "etss", "kpt", "kmsr", "kmbc", "kmpk", "kmut"]]
gen[0] = "  /* v18.32: laluan rel dijana daripada GTFS rasmi data.gov.my (KTMB, Rapid Rail KL) oleh tools/jaringan/rel_gtfs.py */\n" + gen[0]
gen += [js(k, ALL[k]) for k in ["lrtkj", "lrtam", "lrtsp", "mrtkg", "mrtpy", "mono", "lrtsa", "brt"]]
head = keep[0].rstrip() if keep and not re.search(r'\{ id: "', keep[0]) else ""
rest = [b for b in keep if re.search(r'\{ id: "', b)]
newbody = (head + "\n" if head else "\n") + ",\n".join([b.strip("\n") for b in rest] + gen) + "\n"
src = src[:i] + "const RAILS = [" + newbody + src[j:]
open(os.path.join(REPO, "dunia.js"), "w").write(src)
for k in ALL:
    print(k, len(ALL[k]), "titik;", sum(1 for s in ALL[k] if s[3]), "stesen")
