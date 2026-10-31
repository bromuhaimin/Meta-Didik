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
