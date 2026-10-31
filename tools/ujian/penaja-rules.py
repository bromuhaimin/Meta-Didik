"""Tambah/kemas kini peraturan penaja (penaja, penaja_mohon) dalam 4 fail Rules (idempoten)."""
import json, collections
V = ("newData.hasChildren(['sy','pk','lk','logo','pic','hp','em','bln','rm','t']) && newData.child('rm').isNumber() && newData.child('rm').val() >= 1 && newData.child('rm').val() <= 10000000 && newData.child('t').val() === now && !newData.child('st').exists()"
     " && newData.child('sy').isString() && newData.child('sy').val().length >= 3 && newData.child('sy').val().length <= 60"
     " && newData.child('pk').val().matches(/^(rakan|emas|platinum)$/) && newData.child('lk').isString() && newData.child('lk').val().length <= 20"
     " && newData.child('logo').isString() && newData.child('logo').val().matches(/^data:image\\/(png|jpeg);base64,/) && newData.child('logo').val().length <= 120000"
     " && newData.child('pic').isString() && newData.child('pic').val().length <= 60 && newData.child('hp').isString() && newData.child('hp').val().length <= 20"
     " && newData.child('em').isString() && newData.child('em').val().length <= 80 && (newData.child('bln').val() === 3 || newData.child('bln').val() === 6 || newData.child('bln').val() === 12)"
     " && (!newData.child('web').exists() || (newData.child('web').isString() && newData.child('web').val().length <= 120))"
     " && (!newData.child('tl').exists() || (newData.child('tl').isString() && newData.child('tl').val().length <= 80))"
     " && (!newData.child('nota').exists() || (newData.child('nota').isString() && newData.child('nota').val().length <= 300))"
     " && (!newData.child('ssm').exists() || (newData.child('ssm').isString() && newData.child('ssm').val().length <= 30))")
def mohon(write): return {".read": False, "$id": {".write": write, ".validate": "$id.length <= 40 && " + V}}
SET = {"percubaan": {"penaja": {".read": True, ".write": False}, "penaja_mohon": mohon("!data.exists()")},
       "ketat": {"penaja": {".read": True, ".write": False}, "penaja_mohon": mohon("auth != null && !data.exists()")}}
for f, k, wrap in [("docs/firebase-rules-lengkap-percubaan.json", "percubaan", True), ("docs/firebase-rules-lengkap-ketat.json", "ketat", True),
                   ("docs/firebase-rules-percubaan.json", "percubaan", False), ("docs/firebase-rules-stesen.json", "ketat", False)]:
    d = json.load(open(f), object_pairs_hook=collections.OrderedDict)
    (d["rules"] if wrap else d).update(SET[k])
    open(f, "w").write(json.dumps(d, indent=2, ensure_ascii=False) + "\n"); print(f, "ok")
