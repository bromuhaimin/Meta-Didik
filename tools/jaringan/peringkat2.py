# Peringkat 2 pembina jaringan (dijalankan oleh bina.py; KERJA, HERE, GEO_ASAL disediakan)
import os, sys, json, math, csv, heapq, hashlib
from shapely.geometry import shape, Polygon, LineString, MultiLineString, Point
from shapely.ops import unary_union, linemerge, nearest_points
exec(open(os.path.join(HERE,'extra.py')).read()); exec(open(os.path.join(HERE,'pulau.py')).read())
g=json.load(open(GEO_ASAL))
U,lon0,lat0,kx,kz=g['U'],g['lon0'],g['lat0'],g['kx'],g['kz']
toll=lambda x,z:(x/(kx*U)+lon0, lat0-z/(kz*U))
STP={k:unary_union([Polygon([toll(*q) for q in r]).buffer(0) for r in v]) for k,v in g['states'].items()}
def negeri(lat,lon):
    p=Point(lon,lat); return min(STP,key=lambda k:STP[k].distance(p))
hw=json.load(open(os.path.join(KERJA,'hw_exist.json')))
ne=json.load(open(os.path.join(KERJA,'ne_clip.json')))
ways=[]  # [cls, [[lat,lon]...], src]
for c,p in ne: ways.append([c,p,'ne'])
for w in EXTRA: ways.append([w['c'],w['p'],'x'])
for k,v in hw.items(): ways.append([1,[[q[2],q[3]] for q in v['st']],'hw:'+k])
# --- graf: nod = titik hujung dibundarkan; sambung hujung tergantung ke garisan terdekat ---
KM=1/111.0
def key(p): return (round(p[0],4),round(p[1],4))
def lsxy(p): return LineString([(q[1],q[0]) for q in p])
# pisah garisan pada titik sambungan: hujung tergantung disambung ke titik terdekat pada garisan lain (dalam 6 km)
def snap_all(ways,tol):
    changed=True; it=0
    while changed and it<4:
        changed=False; it+=1
        geoms=[lsxy(w[1]) for w in ways]
        ends={}
        for i,w in enumerate(ways):
            for e in (w[1][0],w[1][-1]): ends.setdefault(key(e),set()).add(i)
        adds=[]
        for i,w in enumerate(ways):
            for e in (w[1][0],w[1][-1]):
                if len(ends[key(e)])>1: continue
                pt=Point(e[1],e[0]); best=None
                for j,gm in enumerate(geoms):
                    if j==i: continue
                    d=gm.distance(pt)
                    if d<tol and (best is None or d<best[0]): best=(d,j)
                if best:
                    q=nearest_points(geoms[best[1]],pt)[0]
                    adds.append((i,e,best[1],[round(q.y,4),round(q.x,4)]))
        # sisip titik sambungan ke dalam garisan sasaran dan tambah penyambung pendek
        for i,e,j,q in adds:
            p=ways[j][1]
            # sisip q pada segmen terdekat
            bi=min(range(len(p)-1),key=lambda k:LineString([(p[k][1],p[k][0]),(p[k+1][1],p[k+1][0])]).distance(Point(q[1],q[0])))
            if q not in p: p.insert(bi+1,q)
            if key(e)!=key(q): ways.append([ways[i][0] if ways[i][0]>1 else 2,[e,q],'sambung'])
            changed=True
    return ways
ways=snap_all(ways,6*KM)
# pecah garisan di setiap titik yang dikongsi (supaya persimpangan menjadi nod)
cnt={}
for w in ways:
    for q in w[1]: cnt[key(q)]=cnt.get(key(q),0)+1
for w in ways:
    cnt[key(w[1][0])]+=10; cnt[key(w[1][-1])]+=10
split=[]
for c,p,src in ways:
    cur=[p[0]]
    for q in p[1:]:
        cur.append(q)
        if cnt[key(q)]>1 and q is not p[-1]: split.append([c,cur,src]); cur=[q]
    if len(cur)>1: split.append([c,cur,src])
ways=[w for w in split if len(w[1])>1 and key(w[1][0])!=key(w[1][-1]) or len(w[1])>2]
# komponen bersambung
adj={}
for i,(c,p,src) in enumerate(ways):
    a,b=key(p[0]),key(p[-1]); adj.setdefault(a,[]).append(b); adj.setdefault(b,[]).append(a)
seen={}; comps=[]
for n in adj:
    if n in seen: continue
    st=[n]; seen[n]=len(comps); m=[n]
    while st:
        x=st.pop()
        for y in adj[x]:
            if y not in seen: seen[y]=len(comps); st.append(y); m.append(y)
    comps.append(m)
comps.sort(key=len,reverse=True)
print('komponen',len(comps),[len(c) for c in comps[:12]])
# sambung komponen kecil ke komponen lain terdekat (dalam daratan yang sama, jarak < 40 km)
def landmass(n): return 'borneo' if n[1]>108 else 'semenanjung'
for it in range(60):
    adj={}
    for c,p,src in ways:
        a,b=key(p[0]),key(p[-1]); adj.setdefault(a,[]).append(b); adj.setdefault(b,[]).append(a)
    seen={}; comps=[]
    for n in adj:
        if n in seen: continue
        st=[n]; seen[n]=len(comps); m=[n]
        while st:
            x=st.pop()
            for y in adj[x]:
                if y not in seen: seen[y]=len(comps); st.append(y); m.append(y)
        comps.append(m)
    comps.sort(key=len,reverse=True)
    big={}
    for cp in comps:
        lm=landmass(cp[0])
        if lm not in big: big[lm]=cp
    small=[cp for cp in comps if big[landmass(cp[0])] is not cp]
    if not small: break
    cp=small[0]; tgt=set()
    for o in comps:
        if o is not cp and landmass(o[0])==landmass(cp[0]): tgt.update(o)
    # pasangan nod terdekat (nod sahaja; cukup untuk prototaip)
    best=None
    allpts={}
    for c,p,src in ways:
        for q in p: allpts[key(q)]=q
    tl=[allpts[t] for t in tgt]
    for n in cp:
        for t in tl:
            d=math.hypot(n[0]-t[0],(n[1]-t[1])*math.cos(math.radians(n[0])))
            if best is None or d<best[0]: best=(d,n,t)
    d,n,t=best
    if d*111>40:
        cs=set(cp); print('buang komponen terpencil',len(cp),'nod, jarak',round(d*111),'km',n)
        ways=[w for w in ways if key(w[1][0]) not in cs]
        continue
    ways.append([2,[[n[0],n[1]],[t[0],t[1]]],'sambung'])
print('akhir: komponen',len(comps),'garisan',len(ways))
json.dump(ways,open(os.path.join(KERJA,'ways.json'),'w'))

