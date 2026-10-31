"""Jana DATA UJIAN SINTETIK (BUKAN geografi sebenar) untuk menguji enjin 3D kawasan perintis dan Geospatial Validation Engine.
Bandar grid rekaan: jalan grid, satu jejambat (bridge layer 1) merentas jalan grid tanpa simpang, sungai dengan jambatan,
bangunan, taman, tasik dan POI sekolah. Fail: tools/geo/ujian/fixture-sintetik.json"""
import json, os
nid = [0]
def n():
    nid[0] += 1; return nid[0]
jalan, bang, air, taman, poi = [], [], [], [], []
grid = {}
for i in range(-3, 4):
    for k in range(-3, 4):
        grid[(i, k)] = (n(), [i * 120.0, k * 120.0])
wid = 1000
def J(pts, nds, **kw):
    global wid; wid += 1
    d = {"id": wid, "k": "perumahan", "hw": "residential", "n": "Jalan Sintetik %d" % wid, "p": pts, "nd": nds, "ow": 0, "l": 0, "b": 0, "t": 0, "w": 7, "ln": 2, "pandu": 1, "lv": ""}
    d.update(kw); jalan.append(d)
for i in range(-3, 4):
    for k in range(-3, 3):
        a, b = grid[(i, k)], grid[(i, k + 1)]
        if i == 0 and k in (0, -1):  # jambatan merentas sungai pada x=0? sungai di z=60
            pass
        J([a[1], b[1]], [a[0], b[0]], k="utama" if i == 0 else "perumahan", hw="primary" if i == 0 else "residential", w=10 if i == 0 else 7)
for k in range(-3, 4):
    for i in range(-3, 3):
        a, b = grid[(i, k)], grid[(i + 1, k)]
        J([a[1], b[1]], [a[0], b[0]])
# sungai sepanjang z = 60 (antara baris grid); jalan menegak yang merentasnya ditanda bridge kecuali satu (untuk V1)
air.append({"id": 9001, "k": "river", "n": "Sungai Sintetik", "p": [[-420.0, 60.0], [420.0, 60.0]], "poly": 0, "t": 0, "l": 0})
for j in jalan:
    zs = [p[1] for p in j["p"]]
    if min(zs) < 60 < max(zs) and j["p"][0][0] != 360.0:
        j["b"] = 1; j["l"] = 1
# jejambat: jalan pepenjuru lebuh raya layer 1 merentas grid tanpa nod dikongsi
fl = [[-400.0, -330.0], [-200.0, -200.0], [0.0, -60.0], [200.0, 60.0], [400.0, 200.0]]
J(fl, [n() for _ in fl], k="lebuhraya", hw="motorway", w=14, b=1, l=1, n="Jejambat Sintetik", pandu=1)
# bangunan blok dalam setiap petak
bid = 5000
for i in range(-3, 3):
    for k in range(-3, 3):
        if (i, k) in ((1, 1), (-2, -2)): continue
        cx, cz = i * 120 + 60, k * 120 + 60
        if abs(cz - 60) < 20: cz += 25
        for dx in (-25, 15):
            bid += 1; h = 6.4 if (i + k) % 2 else 3.2 * (3 + (i * 7 + k) % 6)
            bang.append({"id": bid, "k": "school" if (i, k) == (0, 0) else "residential", "n": "", "p": [[cx + dx, cz - 18], [cx + dx + 22, cz - 18], [cx + dx + 22, cz + 4], [cx + dx, cz + 4]], "h": h, "anggar": 1 if h == 6.4 else 0, "mh": 0, "l": 0})
taman.append({"id": 7001, "k": "park", "n": "Taman Sintetik", "p": [[125.0, 125.0], [235.0, 125.0], [235.0, 235.0], [125.0, 235.0]]})
air.append({"id": 9002, "k": "tasik", "n": "Tasik Sintetik", "p": [[150.0, 150.0], [210.0, 150.0], [210.0, 200.0], [150.0, 200.0], [150.0, 150.0]], "poly": 1, "t": 0, "l": 0})
poi.append({"id": 8001, "k": "school", "n": "Sekolah Sintetik (ujian)", "x": 60.0, "z": 50.0, "rel": ""})
poi.append({"id": 8002, "k": "lampu_isyarat", "n": "", "x": 0.0, "z": 0.0, "rel": ""})
d = {"meta": {"kawasan": "fixture", "nama": "BANDAR UJIAN SINTETIK (bukan geografi sebenar)", "bbox": [0, 0, 0, 0], "pusat": [3.205, 101.725], "unjuran": "meter", "sumber": "data ujian sintetik", "lesen": "-", "atribusi": "data ujian sintetik", "tarikh_osm": "sintetik", "dimuat": None, "dijana": "sintetik", "negeri": []},
     "jalan": jalan, "air": air, "bangunan": bang, "taman": taman, "poi": poi}
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fixture-sintetik.json")
json.dump(d, open(out, "w"), separators=(",", ":")); print(out, len(jalan), "jalan", len(bang), "bangunan")
