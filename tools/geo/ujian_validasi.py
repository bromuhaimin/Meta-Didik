"""Ujian unit Geospatial Validation Engine. Jalankan: python3 -m unittest tools/geo/ujian_validasi.py
Semua data di sini ialah DATA UJIAN SINTETIK (bukan geografi sebenar), dibina kecil supaya setiap semakan dicetuskan dengan sengaja."""
import os, sys, unittest
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import validasi

META = {"pusat": [3.2, 101.72], "nama": "ujian sintetik", "sumber": "data ujian sintetik"}


def J(i, p, nd, **k):
    d = {"id": i, "k": "perumahan", "hw": "residential", "n": "J%d" % i, "p": p, "nd": nd, "ow": 0, "l": 0, "b": 0, "t": 0, "pandu": 1}
    d.update(k); return d


def kod(lap, k):
    return [i for i in lap["isu"] if i["kod"] == k]


class Ujian(unittest.TestCase):
    def test_v1_jalan_merentas_sungai_tanpa_jambatan(self):
        sungai = {"id": 900, "k": "river", "p": [[0, -50], [0, 50]], "poly": 0, "t": 0}
        d = {"meta": META, "jalan": [J(1, [[-20, 0], [20, 0]], [1, 2])], "air": [sungai], "bangunan": []}
        self.assertEqual(len(kod(validasi.sahkan(d), "V1")), 1)
        d["jalan"][0]["b"] = 1; d["jalan"][0]["l"] = 1
        self.assertEqual(len(kod(validasi.sahkan(d), "V1")), 0, "jambatan sah tidak dilapor")
        d["jalan"][0]["b"] = 0; d["jalan"][0]["l"] = 0; sungai["t"] = 1
        self.assertEqual(len(kod(validasi.sahkan(d), "V1")), 0, "sungai dalam pembetung sah")

    def test_v2_jalan_menembusi_bangunan(self):
        bd = {"id": 500, "p": [[-5, -5], [5, -5], [5, 5], [-5, 5]], "h": 6, "anggar": 1, "l": 0}
        d = {"meta": META, "jalan": [J(1, [[-20, 0], [20, 0]], [1, 2])], "air": [], "bangunan": [bd]}
        self.assertEqual(len(kod(validasi.sahkan(d), "V2")), 1)
        d["jalan"][0]["t"] = 1
        self.assertEqual(len(kod(validasi.sahkan(d), "V2")), 0, "terowong di bawah bangunan sah")

    def test_v3_geometri_berulang(self):
        d = {"meta": META, "jalan": [J(1, [[0, 0], [10, 0]], [1, 2]), J(2, [[0, 0], [10, 0]], [1, 2])], "air": [], "bangunan": []}
        self.assertEqual(len(kod(validasi.sahkan(d), "V3")), 1)

    def test_v4_segmen_terasing(self):
        utama = [J(i, [[-300 + i * 100, 0], [-200 + i * 100, 0]], [i, i + 1]) for i in range(6)]
        terasing = J(99, [[0, 100], [20, 100]], [990, 991])
        d = {"meta": META, "jalan": utama + [terasing], "air": [], "bangunan": []}
        v4 = kod(validasi.sahkan(d), "V4")
        self.assertTrue(any(99 in i["osm"] for i in v4))

    def test_v5_persimpangan_bertingkat_tidak_disambung(self):
        a = J(1, [[-50, 0], [50, 0]], [1, 2]); b = J(2, [[0, -50], [0, 50]], [3, 4], l=1, b=1)
        lap = validasi.sahkan({"meta": META, "jalan": [a, b], "air": [], "bangunan": []})
        self.assertEqual(len(kod(lap, "V5")), 0); self.assertEqual(lap["ringkasan"].get("V5:bertingkat"), 1)
        b2 = J(2, [[0, -50], [0, 50]], [3, 4])
        lap = validasi.sahkan({"meta": META, "jalan": [a, b2], "air": [], "bangunan": []})
        self.assertEqual(len(kod(lap, "V5")), 1, "aras sama tanpa nod: amaran, tidak disambung")
        c = J(2, [[0, -50], [0, 0], [0, 50]], [3, 9, 4]); a2 = J(1, [[-50, 0], [0, 0], [50, 0]], [1, 9, 2])
        self.assertEqual(len(kod(validasi.sahkan({"meta": META, "jalan": [a2, c], "air": [], "bangunan": []}), "V5")), 0, "simpang sebenar (nod dikongsi)")

    def test_v6_aras(self):
        d = {"meta": META, "jalan": [J(1, [[0, 0], [10, 0]], [1, 2], b=1, l=0), J(2, [[10, 0], [20, 0]], [2, 3], l=3)], "air": [], "bangunan": []}
        lap = validasi.sahkan(d)
        self.assertTrue(any(i["tahap"] == "info" for i in kod(lap, "V6")))
        self.assertTrue(any("Lompatan aras" in i["pesan"] for i in kod(lap, "V6")))

    def test_laporan_ada_koordinat_dan_sumber(self):
        sungai = {"id": 900, "k": "river", "p": [[0, -50], [0, 50]], "poly": 0, "t": 0}
        lap = validasi.sahkan({"meta": META, "jalan": [J(1, [[-20, 0], [20, 0]], [1, 2])], "air": [sungai], "bangunan": []})
        i = kod(lap, "V1")[0]
        self.assertAlmostEqual(i["latlon"][0], 3.2, places=4); self.assertAlmostEqual(i["latlon"][1], 101.72, places=4)
        self.assertEqual(i["osm"], [1, 900]); self.assertIn("Laporan", validasi.markdown(lap))


if __name__ == "__main__":
    unittest.main()


class UjianTukar(unittest.TestCase):
    """Penukar Overpass -> format padat, dengan respons Overpass SINTETIK (struktur sama seperti API sebenar)."""
    def test_tukar_atribut_jambatan_aras_dan_tinggi(self):
        import json, tempfile, perintis
        tmp = tempfile.mkdtemp(); perintis.DATA = tmp
        el = [{"type": "node", "id": i, "lat": 3.20 + i * 1e-4, "lon": 101.72 + i * 1e-4} for i in range(1, 9)]
        el += [{"type": "way", "id": 11, "nodes": [1, 2], "tags": {"highway": "primary", "bridge": "yes", "name": "Jalan Ujian"}},
               {"type": "way", "id": 12, "nodes": [2, 3], "tags": {"highway": "residential", "oneway": "yes", "tunnel": "yes"}},
               {"type": "way", "id": 13, "nodes": [4, 5, 6, 4], "tags": {"building": "yes", "building:levels": "5"}},
               {"type": "way", "id": 14, "nodes": [5, 6, 7, 5], "tags": {"building": "school"}},
               {"type": "way", "id": 15, "nodes": [7, 8], "tags": {"waterway": "river", "name": "Sungai Ujian"}}]
        json.dump({"osm3s": {"timestamp_osm_base": "2026-01-01T00:00:00Z"}, "elements": el}, open(os.path.join(tmp, "setapak.osm.json"), "w"))
        perintis.tukar("setapak"); d = json.load(open(os.path.join(tmp, "setapak.json")))
        j = {x["id"]: x for x in d["jalan"]}
        self.assertEqual((j[11]["b"], j[11]["l"]), (1, 1), "bridge tanpa layer -> aras 1")
        self.assertEqual((j[12]["t"], j[12]["l"], j[12]["ow"]), (1, -1, 1))
        b = {x["id"]: x for x in d["bangunan"]}
        self.assertEqual((b[13]["h"], b[13]["anggar"]), (16.0, 0), "5 tingkat x 3.2 m")
        self.assertEqual(b[14]["anggar"], 1, "tiada data tinggi -> dilabel anggaran")
        self.assertEqual(d["meta"]["lesen"], "Open Database License (ODbL) 1.0"); self.assertEqual(d["meta"]["tarikh_osm"], "2026-01-01T00:00:00Z")
        self.assertEqual(d["air"][0]["n"], "Sungai Ujian")


class UjianDEM(unittest.TestCase):
    """Pembaca COG Copernicus: TIFF berjubin SINTETIK dibina dalam memori (deflate + peramal titik apung)."""
    @staticmethod
    def _tiff(arr, tw):
        import numpy as np, struct, zlib
        H, W = arr.shape; nt = (W + tw - 1) // tw; ntr = (H + tw - 1) // tw
        blobs = []
        for tr in range(ntr):
            for tc in range(nt):
                t = np.zeros((tw, tw), np.float32); a = arr[tr * tw:(tr + 1) * tw, tc * tw:(tc + 1) * tw]; t[:a.shape[0], :a.shape[1]] = a
                b = t.astype(">f4").view(np.uint8).reshape(tw, tw, 4).transpose(0, 2, 1).reshape(tw, tw * 4)
                d = np.diff(b, axis=1, prepend=np.zeros((tw, 1), np.uint8)).astype(np.uint8)
                blobs.append(zlib.compress(d.tobytes()))
        n = len(blobs)
        tags = [(256, 3, 1, (W,)), (257, 3, 1, (H,)), (258, 3, 1, (32,)), (259, 3, 1, (8,)), (317, 3, 1, (3,)), (322, 3, 1, (tw,)), (323, 3, 1, (tw,)),
                (324, 4, n, None), (325, 4, n, tuple(len(b) for b in blobs)), (339, 3, 1, (3,)),
                (33550, 12, 3, (1 / 3600, 1 / 3600, 0.0)), (33922, 12, 6, (0.0, 0.0, 0.0, 101.0, 4.0, 0.0)),
                (34735, 3, 8, (1, 1, 0, 1, 1025, 0, 1, 2))]
        fmt = {3: "H", 4: "I", 12: "d"}; sz = {3: 2, 4: 4, 12: 8}
        ifd_off = 8; ext = ifd_off + 2 + 12 * len(tags) + 4
        extra = b""; ent = []
        data_off = ext + sum(sz[t] * c for _, t, c, _ in tags if sz[t] * c > 4)
        offs = []; p = data_off
        for b in blobs: offs.append(p); p += len(b)
        for tag, t, c, v in tags:
            if v is None: v = tuple(offs)
            raw = struct.pack("<" + fmt[t] * c, *v)
            if len(raw) <= 4: ent.append(struct.pack("<HHI", tag, t, c) + raw.ljust(4, b"\0"))
            else: ent.append(struct.pack("<HHII", tag, t, c, ext + len(extra))); extra += raw
        return b"II*\x00" + struct.pack("<I", ifd_off) + struct.pack("<H", len(tags)) + b"".join(ent) + b"\0\0\0\0" + extra + b"".join(blobs)

    def test_baca_tetingkap_merentas_jubin(self):
        import numpy as np, dem
        arr = (np.arange(40 * 40, dtype=np.float32).reshape(40, 40) * 0.25 + 50).astype(np.float32)
        fail = self._tiff(arr, 16)
        asal = dem._julat
        dem._julat = lambda url, a, b: fail[a:b + 1]
        try:
            C = dem.COG("mem://ujian")
            self.assertTrue(C.titik, "RasterPixelIsPoint dibaca daripada GeoKey 1025")
            w = C.tetingkap(10, 30, 5, 37)
            self.assertTrue(np.array_equal(w, arr[10:30, 5:37]), "tetingkap merentas 4 jubin sama dengan asal")
            self.assertAlmostEqual(C.lat_r(0), 4.0); self.assertAlmostEqual(C.lon_c(36), 101.01)
        finally:
            dem._julat = asal

    def test_anggaran_tanah_buang_bangunan_kekal_bukit(self):
        import numpy as np, dem
        y, x = np.mgrid[0:41, 0:41]
        bukit = (60 + 80 * np.exp(-((x - 20) ** 2 + (y - 20) ** 2) / 120.0)).astype(np.float32)
        dsm = bukit.copy(); dsm[5, 5] += 40; dsm[30:32, 8:10] += 25  # "bangunan" sempit
        t = dem.anggar_tanah(dsm)
        self.assertLess(t[5, 5] - bukit[5, 5], 3); self.assertLess(t[31, 9] - bukit[31, 9], 3)
        self.assertGreater(t[20, 20], 125, "puncak bukit lebar dikekalkan (anggaran)")
