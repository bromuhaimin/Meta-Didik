const V="gt-v17-88";
const SHELL=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png","./three.min.js","./lagenda.js",
  "./soalan.json","./soalan_pi.json","./soalan_ba.json","./soalan_p3.json","./soalan_sj.json","./soalan_sc.json","./soalan_mt.json","./soalan_bm.json","./soalan_bi.json",
  "./img/lg-pg.jpg","./img/lg-pb.jpg","./img/lg-ps.jpg","./img/lg-pk.jpg","./img/lg-pd.jpg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET")return;
  const u=new URL(r.url);
  if(u.hostname.includes("firebaseio.com")||u.hostname.includes("googleapis.com")&&u.pathname.includes("identitytoolkit"))return;
  const same=u.origin===location.origin, cdn=/cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(u.hostname);
  if(!same&&!cdn)return;
  if(same){ // rangkaian dahulu supaya versi baharu sentiasa dimuatkan, cache jika luar talian
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put(r,c));return res;}).catch(()=>caches.match(r).then(m=>m||caches.match("./index.html"))));
  } else {
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put(r,c));return res;})));
  }
});
