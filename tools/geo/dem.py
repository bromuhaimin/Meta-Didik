#!/usr/bin/env python3
"""
Meta Didik: topografi kawasan perintis daripada Copernicus DEM GLO-30 (resolusi ~30 m).

Sumber : Copernicus DEM GLO-30, fail Cloud Optimized GeoTIFF di AWS Open Data
         (https://copernicus-dem-30m.s3.amazonaws.com/). Hanya blok yang diperlukan dimuat turun (HTTP Range).
Lesen  : Copernicus DEM (GLO-30), penggunaan percuma dengan atribusi:
         "© DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS
          by the European Union and ESA; all rights reserved"
Jenis  : DSM (Digital Surface Model). Ketinggian ialah PERMUKAAN, termasuk bangunan dan pokok, rujukan geoid EGM2008.
         Untuk rupa bumi permainan, satu anggaran tanah ("h") diterbitkan dengan pembukaan morfologi + purata.
         Ia dilabel ANGGARAN, bukan ukuran tanah sebenar. Nilai DSM asal ("dsm") turut disimpan untuk audit.

Pembaca GeoTIFF ditulis sendiri (Python + numpy sahaja): TIFF berjubin, mampatan deflate, peramal titik apung (3).

Contoh:
  python3 tools/geo/dem.py setapak       -> data/perintis/setapak-dem.json
"""
import json, math, os, struct, sys, time, urllib.request, zlib

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import perintis  # KAWASAN, Proj, DATA (satu sumber kebenaran untuk kotak sempadan dan unjuran)

ASAS = os.environ.get("COPDEM_URL", "https://copernicus-dem-30m.s3.amazonaws.com")
ATRIBUSI = ("Copernicus DEM GLO-30: © DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 "
            "provided under COPERNICUS by the European Union and ESA; all rights reserved")
JENIS_T = {1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 11: 4, 12: 8, 16: 8}
FMT_T = {1: "B", 2: "s", 3: "H", 4: "I", 11: "f", 12: "d", 16: "Q"}


def nama_jubin(lat, lon):
    ns = "N" if lat >= 0 else "S"; ew = "E" if lon >= 0 else "W"
    b = "Copernicus_DSM_COG_10_%s%02d_00_%s%03d_00_DEM" % (ns, abs(lat), ew, abs(lon))
    return b + "/" + b + ".tif"


def _julat(url, a, b):
    req = urllib.request.Request(url, headers={"Range": "bytes=%d-%d" % (a, b), "User-Agent": "MetaDidik-pipeline/1.0"})
    for cuba in range(4):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return r.read()
        except Exception:
            if cuba == 3:
                raise
            time.sleep(2 ** cuba)


def ifd(buf):
    """Hurai IFD pertama TIFF klasik (little-endian). Pulang dict tag -> tuple nilai."""
    if buf[:4] != b"II*\x00":
        raise ValueError("Bukan TIFF klasik little-endian")
    off = struct.unpack("<I", buf[4:8])[0]
    n = struct.unpack("<H", buf[off:off + 2])[0]
    tags = {}
    for i in range(n):
        e = buf[off + 2 + i * 12: off + 14 + i * 12]
        tag, typ, c = struct.unpack("<HHI", e[:8])
        sz = JENIS_T[typ] * c
        raw = e[8:8 + sz] if sz <= 4 else buf[struct.unpack("<I", e[8:12])[0]:][:sz]
        if len(raw) < sz:
            raise ValueError("Pengepala lebih besar daripada blok yang dibaca")
        tags[tag] = raw if typ == 2 else struct.unpack("<" + FMT_T[typ] * c, raw)
    return tags


def nyahperamal_apung(data, tw, th):
    """Nyahkod peramal titik apung TIFF (Predictor=3) bagi float32 satu sampel: beza bait mendatar setiap baris,
    kemudian bait disusun mengikut keutamaan (MSB dahulu)."""
    a = np.frombuffer(data, dtype=np.uint8).reshape(th, tw * 4)
    a = np.cumsum(a, axis=1, dtype=np.uint8)
    return a.reshape(th, 4, tw).transpose(0, 2, 1).copy().view(">f4").reshape(th, tw).astype(np.float32)


class COG:
    def __init__(self, url):
        self.url = url
        buf = _julat(url, 0, 65535)
        t = ifd(buf)
        self.W, self.H = t[256][0], t[257][0]
        self.tw, self.th = t[322][0], t[323][0]
        self.off, self.cnt = t[324], t[325]
        if t[259][0] != 8 or t[258][0] != 32 or t[339][0] != 3:
            raise ValueError("Format tidak disokong (perlu deflate, float32)")
        self.pred = t.get(317, (1,))[0]
        sx, sy = t[33550][0], t[33550][1]
        tp = t[33922]  # (i, j, k, X, Y, Z)
        gk = t.get(34735, ())
        titik = any(gk[4 + i * 4] == 1025 and gk[4 + i * 4 + 3] == 2 for i in range(gk[3] if gk else 0))  # RasterPixelIsPoint
        h = 0 if titik else 0.5
        # pusat piksel (baris r, lajur c): lon = X + (c - i + h) * sx, lat = Y - (r - j + h) * sy
        self.lon_c = lambda c: tp[3] + (c - tp[0] + h) * sx
        self.lat_r = lambda r: tp[4] - (r - tp[1] + h) * sy
        self.sx, self.sy, self.X, self.Y, self.i0, self.j0, self.h = sx, sy, tp[3], tp[4], tp[0], tp[1], h
        self.titik = titik
        self.cache = {}

    def jubin(self, k):
        if k not in self.cache:
            o, n = self.off[k], self.cnt[k]
            d = zlib.decompress(_julat(self.url, o, o + n - 1))
            if self.pred == 3:
                a = nyahperamal_apung(d, self.tw, self.th)
            else:
                a = np.frombuffer(d, dtype="<f4").reshape(self.th, self.tw).copy()
            self.cache[k] = a
        return self.cache[k]

    def tetingkap(self, r0, r1, c0, c1):
        """Piksel [r0, r1) x [c0, c1) sebagai tatasusunan float32."""
        out = np.empty((r1 - r0, c1 - c0), np.float32)
        nt = (self.W + self.tw - 1) // self.tw
        for tr in range(r0 // self.th, (r1 - 1) // self.th + 1):
            for tc in range(c0 // self.tw, (c1 - 1) // self.tw + 1):
                a = self.jubin(tr * nt + tc)
                ra, rb = max(r0, tr * self.th), min(r1, (tr + 1) * self.th)
                ca, cb = max(c0, tc * self.tw), min(c1, (tc + 1) * self.tw)
                out[ra - r0:rb - r0, ca - c0:cb - c0] = a[ra - tr * self.th:rb - tr * self.th, ca - tc * self.tw:cb - tc * self.tw]
        return out


def anggar_tanah(dsm, r=3):
    """Anggaran tanah daripada DSM: pembukaan morfologi (min kemudian maks, tetingkap (2r+1)^2) membuang ciri
    sempit yang menonjol (bangunan, rumpun pokok < ~2r*30 m), kemudian purata 3x3. Hasil ialah ANGGARAN."""
    from numpy.lib.stride_tricks import sliding_window_view as sw
    p = np.pad(dsm, r, mode="edge")
    mn = sw(p, (2 * r + 1, 2 * r + 1)).min(axis=(2, 3))
    p = np.pad(mn, r, mode="edge")
    op = sw(p, (2 * r + 1, 2 * r + 1)).max(axis=(2, 3))
    p = np.pad(op, 1, mode="edge")
    return sw(p, (3, 3)).mean(axis=(2, 3)).astype(np.float32)


def jana(kod, margin_px=3):
    k = perintis.KAWASAN[kod]
    s, w, n, e = k["bbox"]
    if math.floor(s) != math.floor(n) or math.floor(w) != math.floor(e):
        raise SystemExit("Kotak sempadan merentas jubin 1 darjah: belum disokong dalam versi ini.")
    url = ASAS + "/" + nama_jubin(math.floor(s), math.floor(w))
    C = COG(url)
    # indeks piksel yang meliputi kotak sempadan (+ margin)
    c0 = max(0, math.floor((w - C.X) / C.sx + C.i0 - C.h) - margin_px)
    c1 = min(C.W, math.ceil((e - C.X) / C.sx + C.i0 - C.h) + 1 + margin_px)
    r0 = max(0, math.floor((C.Y - n) / C.sy + C.j0 - C.h) - margin_px)
    r1 = min(C.H, math.ceil((C.Y - s) / C.sy + C.j0 - C.h) + 1 + margin_px)
    dsm = C.tetingkap(r0, r1, c0, c1)
    if not np.isfinite(dsm).all() or (dsm < -100).any():
        raise SystemExit("Nilai DEM tidak sah dikesan; data tidak dijana.")
    tanah = anggar_tanah(dsm)
    P = perintis.Proj((s + n) / 2, (w + e) / 2)
    lat_n, lon_w = C.lat_r(r0), C.lon_c(c0)
    x0, z0 = P.xz(lat_n, lon_w)
    out = {
        "meta": {"kawasan": kod, "nama": k["nama"], "pusat": [P.lat0, P.lon0], "unjuran": "equirectangular setempat; x timur, z selatan, meter (sama seperti data jalan)",
                 "sumber": "Copernicus DEM GLO-30 (AWS Open Data): " + url, "lesen": "Copernicus DEM GLO-30 licence (penggunaan percuma dengan atribusi)",
                 "atribusi": ATRIBUSI, "jenis": "DSM (permukaan, termasuk bangunan dan pokok); rujukan tegak EGM2008",
                 "h_kaedah": "ANGGARAN tanah: pembukaan morfologi 7x7 piksel + purata 3x3 daripada DSM. Bukan ukuran tanah sebenar.",
                 "piksel": "pusat piksel" + (" (RasterPixelIsPoint)" if C.titik else " (RasterPixelIsArea, +0.5)"),
                 "baris_lajur_asal": [r0, r1, c0, c1], "lat_utara": lat_n, "lon_barat": lon_w, "dlat": C.sy, "dlon": C.sx,
                 "dijana": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())},
        "grid": {"x0": x0, "z0": z0, "dx": round(C.sx * P.kx, 4), "dz": round(C.sy * P.ky, 4),
                 "nx": int(c1 - c0), "nz": int(r1 - r0)},
        "h": [round(float(v), 1) for v in tanah.ravel()],
        "dsm": [round(float(v), 1) for v in dsm.ravel()],
        "statistik": {"dsm_min": round(float(dsm.min()), 1), "dsm_max": round(float(dsm.max()), 1),
                      "h_min": round(float(tanah.min()), 1), "h_max": round(float(tanah.max()), 1)},
    }
    os.makedirs(perintis.DATA, exist_ok=True)
    p = os.path.join(perintis.DATA, kod + "-dem.json")
    with open(p, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    print("DEM:", p, out["grid"], out["statistik"])
    return out


if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in perintis.KAWASAN:
        raise SystemExit(__doc__)
    jana(sys.argv[1])
