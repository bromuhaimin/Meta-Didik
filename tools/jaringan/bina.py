#!/usr/bin/env python3
"""Pembina data jaringan pengangkutan Meta Didik (meta-jalan.json dan pulau baharu dalam meta-geo.json).

Langkah:
  1. Muat turun Natural Earth 10m (jalan) dan OurAirports ke folder kerja.
  2. Potong jalan ke daratan Malaysia, buang pendua lebuh raya sedia ada (PLUS, LPT, Pan Borneo dalam dunia.js).
  3. Tambah jajaran manual (extra.py), sambungkan hujung tergantung dan komponen kecil supaya graf bersambung.
  4. Sambungkan terminal bas (extra.py) ke jalan terdekat; tentukan pulau baharu (pulau.py).
  5. Tulis meta-jalan.json; cincin pulau baharu ditulis ke rings_add.json (gabungkan ke meta-geo.json dengan --pulau).

Penggunaan:  python3 tools/jaringan/bina.py [--pulau]
Keperluan:   pip install shapely
GEO_ASAL ialah meta-geo.json TANPA pulau baharu (git show <commit sebelum v18.31>:meta-geo.json).
"""
import os, sys, json, re, urllib.request
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
KERJA = os.environ.get("KERJA", os.path.join(HERE, "_kerja"))
os.makedirs(KERJA, exist_ok=True)
GEO_ASAL = os.environ.get("GEO_ASAL", os.path.join(KERJA, "meta-geo-asal.json"))
def ambil(url, f):
    p = os.path.join(KERJA, f)
    if not os.path.exists(p):
        print("muat turun", url); urllib.request.urlretrieve(url, p)
    return p
ambil("https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_roads.geojson", "ne_10m_roads.geojson")
ambil("https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/airports.csv", "ourairports.csv")
# lebuh raya sedia ada daripada dunia.js
s = open(os.path.join(REPO, "dunia.js")).read(); i = s.index("const RAILS = ["); s = s[:s.index("\n];", i)]
hw = {}
for m in re.finditer(r'\{ id: "(\w+)", n: "([^"]+)", nm: "([^"]+)", road: 1.*?st: \[(.*?)\] \}', s[i:], re.S):
    pts = re.findall(r'\["(\w+)", "([^"]+)", ([\d.]+), ([\d.]+), (\d)\]', m.group(4))
    hw[m.group(1)] = {"nm": m.group(3), "st": [[a, b, float(c), float(d), int(e)] for a, b, c, d, e in pts]}
json.dump(hw, open(os.path.join(KERJA, "hw_exist.json"), "w"))
# jalan Natural Earth dalam kotak Malaysia
B = (99.5, 0.8, 119.5, 7.6)
d = json.load(open(os.path.join(KERJA, "ne_10m_roads.geojson")))
def _lines(g): return [g["coordinates"]] if g["type"] == "LineString" else g["coordinates"] if g["type"] == "MultiLineString" else []
fs = [x for x in d["features"] if x["geometry"] and any(B[0] <= p[0] <= B[2] and B[1] <= p[1] <= B[3] for l in _lines(x["geometry"]) for p in l)]
json.dump({"type": "FeatureCollection", "features": fs}, open(os.path.join(KERJA, "ne_10m_roads_my.geojson"), "w"))
import runpy
for n in (1, 2, 3):
    print("peringkat", n)
    runpy.run_path(os.path.join(HERE, "peringkat%d.py" % n), init_globals={"KERJA": KERJA, "HERE": HERE, "GEO_ASAL": GEO_ASAL})

if "--pulau" in sys.argv:
    g2 = json.load(open(GEO_ASAL)); add = json.load(open(os.path.join(KERJA, "rings_add.json")))
    for k, rs in add.items(): g2["states"][k].extend(rs)
    open(os.path.join(REPO, "meta-geo.json"), "w").write(json.dumps(g2, separators=(",", ":")))
    print("meta-geo.json dikemas kini dengan", sum(len(v) for v in add.values()), "pulau baharu")
import shutil; shutil.copy(os.path.join(KERJA, "meta-jalan.json"), os.path.join(REPO, "meta-jalan.json")); print("meta-jalan.json disalin ke repo")
