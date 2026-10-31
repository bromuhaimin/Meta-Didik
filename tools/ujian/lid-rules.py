"""Tambah/kemas kini peraturan Meta Didik Lifelong ID dalam 4 fail Rules (idempoten)."""
import json, collections
ROLE = "/^(murid|alumni|mahasiswa|graduan|profesional|mentor)$/"
def lid(owner):
    return {".read": False, "$uid": {
        ".read": owner, ".write": owner,
        ".validate": "$uid.length <= 128 && newData.hasChildren(['v','peranan']) && newData.child('v').isNumber() && newData.child('privasi').child('awam').val() !== true",
        "peranan": {
            "mentor": {".validate": "newData.child('st').val() === 'tunggu' || newData.child('st').val() === 'tamat'"},
            "$p": {".validate": "$p.matches(" + ROLE + ") && newData.child('st').isString() && newData.child('st').val().matches(/^(aktif|tamat|tunggu)$/) && (!newData.child('sumber').exists() || newData.child('sumber').val().matches(/^(sendiri|mohon)$/))"}},
        "pendidikan": {"$e": {"sah": {".validate": "newData.val() === 'sendiri'"}}},
        "pasport": {"$e": {"sah": {".validate": "newData.val() === 'sendiri'"}}}}}
def sah(read):
    return {".read": False, "$uid": {".read": read, ".write": False}}
def mohon(write):
    return {".read": False, "$uid": {"$id": {
        ".write": write,
        ".validate": "$uid.length <= 128 && $id.length <= 40 && newData.hasChildren(['jenis','t']) && newData.child('jenis').val().matches(/^(alumni|padam|mentor)$/) && newData.child('t').val() === now && !newData.child('st').exists() && (!newData.child('nota').exists() || (newData.child('nota').isString() && newData.child('nota').val().length <= 200)) && (!newData.child('sekolah').exists() || (newData.child('sekolah').isString() && newData.child('sekolah').val().length <= 80))"}}}
OWN = "auth != null && auth.uid === $uid"
SET = {
 "percubaan": {"lid": lid(OWN), "lid_sah": sah("true"), "lid_mohon": mohon("!data.exists()")},
 "ketat": {"lid": lid(OWN), "lid_sah": sah(OWN), "lid_mohon": mohon(OWN + " && !data.exists()")},
}
for f, k, wrap in [("docs/firebase-rules-lengkap-percubaan.json", "percubaan", True), ("docs/firebase-rules-lengkap-ketat.json", "ketat", True),
                   ("docs/firebase-rules-percubaan.json", "percubaan", False), ("docs/firebase-rules-stesen.json", "ketat", False)]:
    d = json.load(open(f), object_pairs_hook=collections.OrderedDict)
    tgt = d["rules"] if wrap else d
    tgt.update(SET[k])
    open(f, "w").write(json.dumps(d, indent=2, ensure_ascii=False) + "\n")
    print(f, "ok")
