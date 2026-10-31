#!/usr/bin/env python3
"""
Meta Didik: pipeline data geospatial kawasan perintis (Fasa 1: Setapak, Kuala Lumpur).

Langkah (boleh diaudit, setiap fail perantaraan disimpan):
  1. muat   : muat turun data OpenStreetMap melalui Overpass API untuk kotak sempadan kawasan
              -> data/perintis/<kawasan>.osm.json (mentah, seperti diterima)
  2. tukar  : tukar kepada format padat permainan (koordinat meter setempat, nod dikongsi kekal)
              -> data/perintis/<kawasan>.json
  3. sahkan : jalankan Geospatial Validation Engine (tools/geo/validasi.py)
              -> docs/geo/laporan-validasi-<kawasan>.json dan .md

Contoh:
  python3 tools/geo/perintis.py semua setapak
  python3 tools/geo/perintis.py tukar setapak          # guna fail mentah sedia ada (tanpa rangkaian)
  python3 tools/geo/perintis.py sahkan setapak

Sumber dan lesen: (c) OpenStreetMap contributors, Open Database License (ODbL) 1.0.
Fail data/perintis/*.json ialah pangkalan data terbitan OSM dan mesti kekal di bawah ODbL dengan atribusi.
Tiada koordinat direka: jika muat turun gagal, pipeline berhenti dan tidak menghasilkan data.
"""
import json, math, os, sys, time, urllib.parse, urllib.request

AKAR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(AKAR, "data", "perintis")
LAPORAN = os.path.join(AKAR, "docs", "geo")

# Kawasan perintis. Kotak sempadan (selatan, barat, utara, timur) dalam darjah WGS84.
# Setapak (Wangsa Maju, Danau Kota, Taman Melati, Sungai Gombak/Setapak) di timur laut pusat bandar Kuala Lumpur.
KAWASAN = {
    "setapak": {"nama": "Setapak, Kuala Lumpur", "bbox": [3.185, 101.705, 3.225, 101.745], "negeri": ["wp", "selangor"]},
}
OVERPASS = os.environ.get("OVERPASS_URL", "https://overpass-api.de/api/interpreter")

KELAS_JALAN = {  # kelas OSM highway -> (kod permainan, lebar anggaran meter jika tiada tag width, boleh dipandu)
    "motorway": ("lebuhraya", 14, 1), "trunk": ("utama", 12, 1), "primary": ("utama", 10, 1), "secondary": ("sekunder", 8, 1),
    "tertiary": ("tertiari", 7, 1), "motorway_link": ("susur", 6, 1), "trunk_link": ("susur", 6, 1), "primary_link": ("susur", 6, 1),
    "secondary_link": ("susur", 6, 1), "tertiary_link": ("susur", 6, 1), "unclassified": ("kecil", 6, 1), "residential": ("perumahan", 6, 1),
    "living_street": ("perumahan", 5, 1), "service": ("servis", 4, 1), "pedestrian": ("pejalan", 4, 0), "footway": ("pejalan", 2, 0),
    "path": ("pejalan", 2, 0), "steps": ("pejalan", 2, 0), "cycleway": ("pejalan", 2, 0),
}


def query(bbox):
    s, w, n, e = bbox
    b = f"{s},{w},{n},{e}"
    return f"""[out:json][timeout:180];
(
  way["highway"]({b});
  way["building"]({b});
  relation["building"]({b});
  way["waterway"~"^(river|stream|canal|drain)$"]({b});
  way["natural"="water"]({b});
  relation["natural"="water"]({b});
  way["water"]({b});
  way["leisure"~"^(park|pitch|playground|garden)$"]({b});
  way["landuse"~"^(grass|recreation_ground|forest)$"]({b});
  node["amenity"~"^(school|university|college|kindergarten|place_of_worship|hospital|clinic|police|fire_station|library|bus_station)$"]({b});
  way["amenity"~"^(school|university|college|kindergarten|place_of_worship|hospital|clinic|police|fire_station|library)$"]({b});
  node["highway"="traffic_signals"]({b});
  node["public_transport"="station"]({b});
);
out body;
>;
out skel qt;"""


def muat(kod):
    k = KAWASAN[kod]
    os.makedirs(DATA, exist_ok=True)
    q = query(k["bbox"])
    req = urllib.request.Request(OVERPASS, data=urllib.parse.urlencode({"data": q}).encode(), headers={"User-Agent": "MetaDidik-perintis/1.0 (metadidik.com; pendidikan)"})
    print("Muat turun Overpass:", OVERPASS)
    with urllib.request.urlopen(req, timeout=240) as r:
        raw = r.read()
    j = json.loads(raw)
    if not j.get("elements"):
        raise SystemExit("Overpass tidak memulangkan elemen; tiada data dihasilkan.")
    j["_muat"] = {"url": OVERPASS, "masa_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "query": q}
    out = os.path.join(DATA, kod + ".osm.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(j, f, ensure_ascii=False)
    print("Disimpan:", out, len(j["elements"]), "elemen")


class Proj:
    """Unjuran setempat equirectangular di sekitar pusat kawasan: x = timur (m), z = selatan (m). Ralat < 0.1% dalam 5 km."""
    def __init__(self, lat0, lon0):
        self.lat0, self.lon0 = lat0, lon0
        self.ky = 110574.0 * 1.0  # m per darjah latitud (anggaran WGS84 di khatulistiwa)
        self.kx = 111320.0 * math.cos(math.radians(lat0))

    def xz(self, lat, lon):
        return [round((lon - self.lon0) * self.kx, 2), round((self.lat0 - lat) * self.ky, 2)]

    def ll(self, x, z):
        return [self.lat0 - z / self.ky, self.lon0 + x / self.kx]


def _f(v, d=None):
    try:
        return float(str(v).split(";")[0].replace("m", "").strip())
    except Exception:
        return d


def tukar(kod):
    k = KAWASAN[kod]
    src = os.path.join(DATA, kod + ".osm.json")
    if not os.path.exists(src):
        raise SystemExit("Fail mentah tiada: " + src + " (jalankan langkah 'muat' dahulu).")
    j = json.load(open(src, encoding="utf-8"))
    s, w, n, e = k["bbox"]
    P = Proj((s + n) / 2, (w + e) / 2)
    nod = {el["id"]: (el["lat"], el["lon"]) for el in j["elements"] if el["type"] == "node" and "lat" in el}
    ways = {el["id"]: el for el in j["elements"] if el["type"] == "way"}
    out = {"meta": {"kawasan": kod, "nama": k["nama"], "bbox": k["bbox"], "pusat": [P.lat0, P.lon0], "unjuran": "equirectangular setempat; x timur, z selatan, meter",
                    "sumber": "OpenStreetMap melalui Overpass API", "lesen": "Open Database License (ODbL) 1.0", "atribusi": "© OpenStreetMap contributors",
                    "tarikh_osm": (j.get("osm3s") or {}).get("timestamp_osm_base", "tidak diketahui"), "dimuat": (j.get("_muat") or {}).get("masa_utc"),
                    "dijana": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "negeri": k["negeri"]},
           "jalan": [], "air": [], "bangunan": [], "taman": [], "poi": []}

    def geom(el):
        return [P.xz(*nod[i]) for i in el.get("nodes", []) if i in nod]

    for el in ways.values():
        t = el.get("tags", {})
        g = geom(el)
        if len(g) < 2:
            continue
        if "highway" in t and t["highway"] in KELAS_JALAN:
            kod_k, lebar, pandu = KELAS_JALAN[t["highway"]]
            ow = t.get("oneway")
            out["jalan"].append({"id": el["id"], "k": kod_k, "hw": t["highway"], "n": t.get("name", ""), "p": g, "nd": [i for i in el["nodes"] if i in nod],
                                 "ow": 1 if ow in ("yes", "true", "1") or t.get("junction") == "roundabout" else (-1 if ow == "-1" else 0),
                                 "l": int(_f(t.get("layer"), 1 if t.get("bridge") else (-1 if t.get("tunnel") else 0))),
                                 "b": 1 if t.get("bridge") and t.get("bridge") != "no" else 0, "t": 1 if t.get("tunnel") and t.get("tunnel") != "no" else 0,
                                 "w": _f(t.get("width"), lebar), "ln": int(_f(t.get("lanes"), 0) or 0), "pandu": pandu, "lv": t.get("level", "")})
        elif "waterway" in t:
            out["air"].append({"id": el["id"], "k": t["waterway"], "n": t.get("name", ""), "p": g, "poly": 0, "t": 1 if t.get("tunnel") in ("culvert", "yes") else 0, "l": int(_f(t.get("layer"), 0))})
        elif t.get("natural") == "water" or "water" in t:
            if g[0] == g[-1]:
                out["air"].append({"id": el["id"], "k": t.get("water", "tasik"), "n": t.get("name", ""), "p": g, "poly": 1, "t": 0, "l": int(_f(t.get("layer"), 0))})
        elif "building" in t:
            if g[0] != g[-1] or len(g) < 4:
                continue
            h, anggar = _f(t.get("height")), 0
            if h is None and t.get("building:levels"):
                h = (_f(t.get("building:levels"), 2) or 2) * 3.2
            if h is None:
                h, anggar = 6.4, 1  # anggaran visual (2 tingkat), BUKAN data fakta
            out["bangunan"].append({"id": el["id"], "k": t.get("building"), "n": t.get("name", ""), "p": g[:-1], "h": round(h, 1), "anggar": anggar,
                                    "mh": _f(t.get("min_height"), 0) or 0, "l": int(_f(t.get("layer"), 0))})
        elif t.get("leisure") or t.get("landuse"):
            if g[0] == g[-1]:
                out["taman"].append({"id": el["id"], "k": t.get("leisure") or t.get("landuse"), "n": t.get("name", ""), "p": g[:-1]})
        if t.get("amenity") and len(g) >= 3:
            cx, cz = sum(p[0] for p in g) / len(g), sum(p[1] for p in g) / len(g)
            out["poi"].append({"id": el["id"], "k": t["amenity"], "n": t.get("name", ""), "x": round(cx, 1), "z": round(cz, 1), "rel": t.get("religion", "")})
    for el in j["elements"]:
        if el["type"] == "node" and el.get("tags"):
            t = el["tags"]
            if t.get("amenity") or t.get("public_transport") == "station" or t.get("highway") == "traffic_signals":
                x, z = P.xz(el["lat"], el["lon"])
                out["poi"].append({"id": el["id"], "k": t.get("amenity") or ("lampu_isyarat" if t.get("highway") == "traffic_signals" else "stesen"), "n": t.get("name", ""), "x": x, "z": z, "rel": t.get("religion", "")})
    dst = os.path.join(DATA, kod + ".json")
    with open(dst, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print("Disimpan:", dst, {k2: len(v) for k2, v in out.items() if isinstance(v, list)})


def sahkan(kod):
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import validasi
    d = json.load(open(os.path.join(DATA, kod + ".json"), encoding="utf-8"))
    geo = json.load(open(os.path.join(AKAR, "meta-geo.json"), encoding="utf-8"))
    lap = validasi.sahkan(d, geo)
    os.makedirs(LAPORAN, exist_ok=True)
    with open(os.path.join(LAPORAN, "laporan-validasi-" + kod + ".json"), "w", encoding="utf-8") as f:
        json.dump(lap, f, ensure_ascii=False, indent=1)
    with open(os.path.join(LAPORAN, "laporan-validasi-" + kod + ".md"), "w", encoding="utf-8") as f:
        f.write(validasi.markdown(lap))
    print("Laporan:", {k2: v for k2, v in lap["ringkasan"].items()})


if __name__ == "__main__":
    if len(sys.argv) < 3 or sys.argv[2] not in KAWASAN:
        raise SystemExit(__doc__)
    langkah, kod = sys.argv[1], sys.argv[2]
    if langkah in ("muat", "semua"):
        muat(kod)
    if langkah in ("tukar", "semua"):
        tukar(kod)
    if langkah in ("sahkan", "semua"):
        sahkan(kod)
