# Peringkat 3 pembina jaringan (dijalankan oleh bina.py; KERJA, HERE, GEO_ASAL disediakan)
import os, sys, json, math, csv, heapq, hashlib
from shapely.geometry import shape, Polygon, LineString, MultiLineString, Point
from shapely.ops import unary_union, linemerge, nearest_points
exec(open(os.path.join(HERE,'extra.py')).read()); exec(open(os.path.join(HERE,'pulau.py')).read())
g=json.load(open(GEO_ASAL))
U,lon0,lat0,kx,kz=g['U'],g['lon0'],g['lat0'],g['kx'],g['kz']
toll=lambda x,z:(x/(kx*U)+lon0, lat0-z/(kz*U))
tox=lambda lat,lon:((lon-lon0)*kx*U,(lat0-lat)*kz*U)
STP={k:unary_union([Polygon([toll(*q) for q in r]).buffer(0) for r in v]) for k,v in g['states'].items()}
ALL=unary_union(list(STP.values()))
def negeri(lat,lon):
    p=Point(lon,lat); return min(STP,key=lambda k:STP[k].distance(p))
W=json.load(open(os.path.join(KERJA,'ways.json')))
key=lambda p:(round(p[0],4),round(p[1],4))
# --- terminal: sisip titik unjuran ke garisan terdekat dan pecah garisan di situ ---
term=[]
for nm,la,lo in TERMINAL:
    pt=Point(lo,la); bi=None
    for i,(c,p,src) in enumerate(W):
        d=LineString([(q[1],q[0]) for q in p]).distance(pt)
        if bi is None or d<bi[0]: bi=(d,i)
    d,i=bi; c,p,src=W[i]; ls=LineString([(q[1],q[0]) for q in p])
    q=nearest_points(ls,pt)[0]; qq=[round(q.y,4),round(q.x,4)]
    s=ls.project(q); acc=0; k=0
    for k in range(len(p)-1):
        sl=LineString([(p[k][1],p[k][0]),(p[k+1][1],p[k+1][0])]).length
        if acc+sl>=s-1e-12: break
        acc+=sl
    if qq!=p[k] and qq!=p[k+1] and qq not in p:
        a=p[:k+1]+[qq]; b=[qq]+p[k+1:]; W[i]=[c,a,src]; W.append([c,b,src])
    term.append([nm,negeri(la,lo),la,lo,qq[0],qq[1],round(d*111,2)])
    if d*111>5: print('terminal jauh dari jalan',nm,round(d*111,1),'km')
# --- pulau ---
def h(s): return int(hashlib.md5(s.encode()).hexdigest()[:8],16)
pulau=[]; rings_add={}
MINR=9.0
for nm,k,la,lo,A,nota in PULAU:
    pt=Point(lo,la); ada=ALL.distance(pt)*111<1.0
    pulau.append([nm,k,la,lo,A,nota,0 if ada else 1])
for i,p in enumerate(pulau):
    nm,k,la,lo,A,nota,baru=p
    if not baru: continue
    # pulau yang terlalu dekat dengan daratan/pulau lain (akan bercantum apabila dibesarkan) dilangkau sebagai daratan, tetapi labelnya kekal
    dmin=ALL.distance(Point(lo,la))*111
    others=[q for q in pulau if q is not p and q[6]==1 and q[0]<nm]
    near=min([math.hypot(q[2]-la,(q[3]-lo)*math.cos(math.radians(la)))*111 for q in pulau if q is not p and q[6]==1] or [99])
    if dmin<2*MINR/3*1.1 or (near<2*MINR/3*1.05 and any(math.hypot(q[2]-la,(q[3]-lo))*111<near+0.01 and q[4]>A for q in pulau if q is not p and q[6]==1)):
        p[6]=2; print('label sahaja (bercantum):',nm,round(dmin,1),round(near,1)); continue
    cx,cz=tox(la,lo); r0=max(3*math.sqrt(A/math.pi),MINR); s=h(nm)
    a1,a2,p1,p2=(s%7)/40+0.08,(s//7%5)/50+0.05,(s%360)*math.pi/180,(s//360%360)*math.pi/180
    ring=[]
    for j in range(22):
        t=j/22*2*math.pi; r=r0*(1+a1*math.cos(2*t+p1)+a2*math.cos(3*t+p2))
        ring.append([round(cx+r*math.cos(t)*1.15,1),round(cz+r*math.sin(t),1)])
    rings_add.setdefault(k,[]).append(ring)
print('pulau baharu (daratan):',sum(1 for p in pulau if p[6]==1),' label sahaja:',sum(1 for p in pulau if p[6]==2))
# --- lapangan terbang ---
ap=[r for r in csv.DictReader(open(os.path.join(KERJA,'ourairports.csv'),encoding='utf-8')) if r['iso_country']=='MY' and r['scheduled_service']=='yes' and r['iata_code']]
# --- tulis ---
out={"v":1,"sumber":"Natural Earth 10m (jalan), tambahan manual, OurAirports; terminal & pulau: anggaran",
     "jalan":[[c,[[round(q[0],4),round(q[1],4)] for q in p],src[3:] if src.startswith("hw") else 1] for c,p,src in W],
     "terminal":[[t[0],t[1],t[2],t[3],t[4],t[5]] for t in term],
     "pulau":[[p[0],p[1],p[2],p[3],p[4],p[5],p[6]] for p in pulau]}
json.dump(out,open(os.path.join(KERJA,'meta-jalan.json'),'w'),separators=(',',':'),ensure_ascii=False)
json.dump(rings_add,open(os.path.join(KERJA,'rings_add.json'),'w'))
json.dump([[r['iata_code'],r['ident'],r['name'],r['municipality'],r['type'],float(r['latitude_deg']),float(r['longitude_deg']),negeri(float(r['latitude_deg']),float(r['longitude_deg']))] for r in ap],open(os.path.join(KERJA,'ap.json'),'w'),ensure_ascii=False,indent=0)
