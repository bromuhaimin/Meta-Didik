# Peringkat 1 pembina jaringan (dijalankan oleh bina.py; KERJA, HERE, GEO_ASAL disediakan)
import os, sys, json, math, csv, heapq, hashlib
from shapely.geometry import shape, Polygon, LineString, MultiLineString, Point
from shapely.ops import unary_union, linemerge, nearest_points
g=json.load(open(GEO_ASAL))
U,lon0,lat0,kx,kz=g['U'],g['lon0'],g['lat0'],g['kx'],g['kz']
toll=lambda x,z:(x/(kx*U)+lon0, lat0-z/(kz*U))
LAND=unary_union([Polygon([toll(*q) for q in r]).buffer(0) for v in g['states'].values() for r in v]).buffer(0.02)
hw=json.load(open(os.path.join(KERJA,'hw_exist.json')))
HW=unary_union([LineString([(p[3],p[2]) for p in v['st']]) for v in hw.values()])
HWB=HW.buffer(0.03)
d=json.load(open(os.path.join(KERJA,'ne_10m_roads_my.geojson')))
lines=[]
for f in d['features']:
    gm=shape(f['geometry'])
    cl=1 if f['properties']['type']=='Major Highway' else 2
    inter=gm.intersection(LAND)
    for l in (inter.geoms if hasattr(inter,'geoms') else [inter]):
        if l.geom_type!='LineString' or l.length<0.01: continue
        rest=l.difference(HWB)
        for r in (rest.geoms if hasattr(rest,'geoms') else [rest]):
            if r.geom_type=='LineString' and r.length>0.03: lines.append((cl,r))
print('garisan',len(lines),'panjang km',round(sum(l.length for c,l in lines)*111))
json.dump([[c,[[round(y,4),round(x,4)] for x,y in l.coords]] for c,l in lines],open(os.path.join(KERJA,'ne_clip.json'),'w'))

