"""Local browser regression checks; requires Python Playwright and Chromium.
Run while serving this checkout: python3 tools/tests/avatar_landmarks_smoke.py
Optional: META_DIDIK_TEST_URL, CHROMIUM_PATH, META_DIDIK_SCREENSHOT.
External requests are blocked, so no production database writes occur.
"""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
URL = os.environ.get('META_DIDIK_TEST_URL', 'http://127.0.0.1:8000')
with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'),
        args=['--no-sandbox', '--enable-unsafe-swiftshader'],
    )
    page = browser.new_page(viewport={'width': 1440, 'height': 1100}, service_workers='block')
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.route('**/*', lambda route: route.continue_() if route.request.url.startswith(URL + '/') else route.abort())
    assert page.goto(URL, wait_until='networkidle').status == 200
    page.wait_for_function('QB.n > 50')
    page.add_script_tag(content=(ROOT / 'avatar3d.js').read_text())
    # Expose model builders only inside this test's browser; production has no test API.
    world = (ROOT / 'dunia.js').read_text()
    end = world.rindex('})();')
    page.add_script_tag(content=world[:end] + 'window.reviewModel = lmLandmarkModel;\n' + world[end:])
    result = page.evaluate('''() => {
      const units = ZV_IT.filter(it => it.s === 'ou' && ZV_UNI[it.id]);
      let count = 0;
      for (const gender of ['L', 'P']) for (const it of units) {
        if (it.g !== '*' && it.g !== gender) continue;
        const z = {g:gender, sk:2, own:[it.id], eq:{ou:it.id}};
        const code = AV3.code(z, zvEqAll(z));
        const av = AV3.build(code);
        if (AV3.parse(code).ou !== it.id) throw Error('Outfit code lost: ' + it.id);
        const bounds = new THREE.Box3().setFromObject(av.g);
        if (!Number.isFinite(bounds.max.y) || bounds.max.y < 5) throw Error('Invalid avatar');
        for (const pose of AV3.RAI) { AV3.rai(av, pose); AV3.anim(av, true, false, 0.016, 1, null); }
        if (!zvSvg(z, 78).includes('<svg')) throw Error('2D fallback missing');
        AV3.dispose(av); count++;
      }
      P.nama='Murid Ujian'; P.sekolah='Sekolah Ujian'; P.kelas='5 ALFA'; P.coin=1000;
      P.zv={g:'P',sk:2,own:[],eq:{}};
      const before=P.coin;
      ZVUI.try='ou_pi'; renderGudangZv();
      if (P.coin !== before || zvState().own.includes('ou_pi')) throw Error('Preview charged MD');
      ZVUI.try=''; zvBuy('ou_pi');
      if(P.coin!==before-120 || zvEqAll(zvState()).ou!=='ou_pi') throw Error('Purchase failed');
      zvEquip('ou_sc');
      if (zvEqAll(zvState()).ou!=='ou_sc') throw Error('Existing clothing lost');
      zvEquip('ou_pi'); openReg(false);
      if (!document.querySelector('#studentProfileCard').textContent.includes('Murid Ujian')) throw Error('Profile missing');
      if (!document.querySelector('#studentProfileCard').textContent.includes('Puteri Islam')) throw Error('Profile outfit missing');
      const ids=['si-th','si-bursa','si-parlimen','si-istbudaya','si-ik','si-negara','si-biru','si-zahir','si-selat','si-kk'];
      const models=ids.map(id=>{
        const g=reviewModel(id,'#123456'), b=new THREE.Box3().setFromObject(g);
        if (!g.userData.landmark || !Number.isFinite(b.max.y) || b.max.y<4) throw Error('Invalid landmark '+id);
        if (Math.max(Math.abs(b.min.x),Math.abs(b.max.x),Math.abs(b.min.z),Math.abs(b.max.z))>11) throw Error('Landmark exceeds reserved footprint: '+id);
        if (g.userData.landmark.cols.some(c=>![c.x,c.z,c.r,c.h].every(Number.isFinite))) throw Error('Invalid collider');
        return {id,height:b.max.y,meshes:g.children.length};
      });
      if (reviewModel('si-ikim','#123456').userData.landmark) throw Error('Fallback changed');
      return {avatars:count,questions:QB.n,models};
    }''')
    page.locator('#studentProfileCard canvas').wait_for()
    page.locator('#studentProfileCard button').click()
    assert page.locator('#reg').is_hidden()
    assert page.evaluate('UI.view') == 'gudang'
    page.set_viewport_size({'width': 390, 'height': 844})
    page.evaluate('openReg(false)')
    assert page.evaluate('''() => {
      const r=document.querySelector('#studentProfileCard').getBoundingClientRect();
      return r.width <= innerWidth && r.left >= 0;
    }''')
    # Build the real world and HUD once, without its continuous render loop.
    # Rendering the isolated models below remains enabled for visual inspection.
    page.set_viewport_size({'width': 1440, 'height': 1100})
    page.evaluate("""() => {
      document.querySelector('#reg').hidden=true; Net.room=null;
      const raf=window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame=fn=>fn.name==='lmLoop'?0:raf(fn);
      LMX.open('');
    }""")
    page.get_by_role('button', name='Main solo', exact=True).click(timeout=60000)
    page.locator('#lmOv .lm-fs').wait_for(state='visible', timeout=60000)
    world_result=page.evaluate("""() => {
      const buildings=LMX.g.items.filter(it=>it.kind==='si'&&it.m.userData.landmark);
      for(const it of buildings){
        if(it.lb.position.y<=it.m.position.y+it.m.userData.landmark.height) throw Error('Label hidden: '+it.id);
      }
      if(buildings.length!==14) throw Error('Missing landmarks: '+buildings.length);
      if(!LMX.g.ilmu.some(it=>it.id==='si-th' && it.tids.length)) throw Error('TH quiz assignment lost');
      return {landmarks:buildings.length, stations:LMX.g.ilmu.length};
    }""")
    page.locator('#lmOv .lm-fs').click()
    page.wait_for_function('!!document.fullscreenElement')
    page.evaluate('document.exitFullscreen()')
    page.wait_for_function('document.querySelector(".lm-fs").getAttribute("aria-pressed")==="false"')
    page.evaluate('LMX.close()')
    print('PASS world integration', world_result)
    print('PASS', result)
    screenshot = os.environ.get('META_DIDIK_SCREENSHOT')
    if screenshot:
        page.set_viewport_size({'width': 1440, 'height': 1100})
        page.evaluate('''() => {
          document.body.innerHTML='<main id="review" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:18px;background:#e8edf1;color:#183040"></main>';
          const r=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(330,280);
          r.outputEncoding=THREE.sRGBEncoding;
          const entries=[...['si-th','si-bursa','si-parlimen','si-istbudaya','si-ik','si-negara','si-biru'].map(id=>({id,g:reviewModel(id,'#123456')})),
            ...['ou_pg','ou_pd','ou_pi','ou_ks','ou_kb','ou_bs','ou_kp','ou_ka','ou_sj'].map(id=>{const z={g:['ou_pd','ou_pi'].includes(id)?'P':'L',sk:2,own:[id],eq:{ou:id}};return {id:zvItem(id).n,g:AV3.build(AV3.code(z,zvEqAll(z))).g};})];
          for (const {id,g} of entries){
            const scene=new THREE.Scene();scene.background=new THREE.Color('#e0e7ec');scene.add(g);
            scene.add(new THREE.HemisphereLight(0xffffff,0x718190,1));const light=new THREE.DirectionalLight(0xffffff,0.9);light.position.set(-15,35,40);scene.add(light);
            const bounds=new THREE.Box3().setFromObject(g), size=bounds.getSize(new THREE.Vector3()), center=bounds.getCenter(new THREE.Vector3());
            const cam=new THREE.PerspectiveCamera(35,330/280,0.1,200);
            const dist=Math.max(size.y,size.x,size.z)*1.8;cam.position.set(center.x+dist*.68,center.y+dist*.36,center.z+dist);cam.lookAt(center);
            r.render(scene,cam);const card=document.createElement('article');card.style='background:white;border-radius:12px;padding:8px;text-align:center;font:600 15px Arial';
            const img=document.createElement('img');img.src=r.domElement.toDataURL();img.style='width:100%;display:block';card.append(img,document.createTextNode(id));document.querySelector('#review').append(card);
          }
          r.dispose();
        }''')
        page.screenshot(path=screenshot, full_page=True)
    assert not errors, errors
    browser.close()
