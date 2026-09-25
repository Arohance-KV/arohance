// @ts-nocheck
// Vanilla port of React Bits <LiquidEther /> (three.js fluid sim). mount(el, opts) -> dispose()
import * as THREE from 'three';

export type EtherOpts = {
  colors: string[]; mouseForce: number; cursorSize: number; resolution: number;
  autoDemo: boolean; autoSpeed: number; autoIntensity: number;
  takeoverDuration: number; autoResumeDelay: number; autoRampDuration: number;
};

export function mount(container: HTMLElement, o: EtherOpts): () => void {
  const opt = Object.assign({
    colors: ['#5227FF', '#FF9FFC', '#B497CF'], mouseForce: 20, cursorSize: 100, isViscous: false, viscous: 30,
    iterationsViscous: 32, iterationsPoisson: 32, dt: 0.014, BFECC: true, resolution: 0.5, isBounce: false,
    autoDemo: true, autoSpeed: 0.5, autoIntensity: 2.2, takeoverDuration: 0.25, autoResumeDelay: 1000, autoRampDuration: 0.6
  }, o);

  function paletteTex(stops) {
    const arr = stops.length === 1 ? [stops[0], stops[0]] : stops;
    const data = new Uint8Array(arr.length * 4);
    arr.forEach((s, i) => { const c = new THREE.Color(s); data[i*4] = c.r*255; data[i*4+1] = c.g*255; data[i*4+2] = c.b*255; data[i*4+3] = 255; });
    const t = new THREE.DataTexture(data, arr.length, 1, THREE.RGBAFormat);
    t.magFilter = t.minFilter = THREE.LinearFilter; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.generateMipmaps = false; t.needsUpdate = true;
    return t;
  }

  const C = { width: 1, height: 1, renderer: null, clock: null };
  const resizeC = () => {
    const r = container.getBoundingClientRect();
    C.width = Math.max(1, Math.floor(r.width)); C.height = Math.max(1, Math.floor(r.height));
    if (C.renderer) C.renderer.setSize(C.width, C.height, false);
  };
  resizeC();
  C.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  C.renderer.autoClear = false;
  C.renderer.setClearColor(new THREE.Color(0x000000), 0);
  C.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  C.renderer.setSize(C.width, C.height);
  Object.assign(C.renderer.domElement.style, { width: '100%', height: '100%', display: 'block' });
  C.clock = new THREE.Clock(); C.clock.start();

  const M = {
    moved: false, coords: new THREE.Vector2(), old: new THREE.Vector2(), diff: new THREE.Vector2(), timer: null,
    inside: false, user: false, auto: false, autoIntensity: opt.autoIntensity, takeover: false, tStart: 0,
    tFrom: new THREE.Vector2(), tTo: new THREE.Vector2(), onInteract: null
  };
  const inside = (x, y) => { const r = container.getBoundingClientRect(); return r.width && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; };
  const setCoords = (x, y) => {
    if (M.timer) clearTimeout(M.timer);
    const r = container.getBoundingClientRect(); if (!r.width) return;
    M.coords.set(((x - r.left) / r.width) * 2 - 1, -(((y - r.top) / r.height) * 2 - 1));
    M.moved = true; M.timer = setTimeout(() => { M.moved = false; }, 100);
  };
  const onMove = e => {
    M.inside = inside(e.clientX, e.clientY); if (!M.inside) return;
    M.onInteract && M.onInteract();
    if (M.auto && !M.user && !M.takeover) {
      const r = container.getBoundingClientRect();
      M.tFrom.copy(M.coords); M.tTo.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
      M.tStart = performance.now(); M.takeover = true; M.user = true; M.auto = false; return;
    }
    setCoords(e.clientX, e.clientY); M.user = true;
  };
  const onTouch = e => { if (e.touches.length !== 1) return; const t = e.touches[0]; M.inside = inside(t.clientX, t.clientY); if (!M.inside) return; M.onInteract && M.onInteract(); setCoords(t.clientX, t.clientY); M.user = true; };
  const onEnd = () => { M.inside = false; };
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchstart', onTouch, { passive: true });
  window.addEventListener('touchmove', onTouch, { passive: true });
  window.addEventListener('touchend', onEnd);
  document.addEventListener('mouseleave', onEnd);
  const mouseUpdate = () => {
    if (M.takeover) {
      const t = (performance.now() - M.tStart) / (opt.takeoverDuration * 1000);
      if (t >= 1) { M.takeover = false; M.coords.copy(M.tTo); M.old.copy(M.coords); M.diff.set(0, 0); }
      else M.coords.copy(M.tFrom).lerp(M.tTo, t * t * (3 - 2 * t));
    }
    M.diff.subVectors(M.coords, M.old); M.old.copy(M.coords);
    if (M.old.x === 0 && M.old.y === 0) M.diff.set(0, 0);
    if (M.auto && !M.takeover) M.diff.multiplyScalar(M.autoIntensity);
  };

  let lastInteract = performance.now();
  const A = { active: false, cur: new THREE.Vector2(), target: new THREE.Vector2(), last: performance.now(), act: 0, dir: new THREE.Vector2() };
  const pick = () => A.target.set((Math.random() * 2 - 1) * 0.8, (Math.random() * 2 - 1) * 0.8);
  pick();
  const stopAuto = () => { A.active = false; M.auto = false; };
  M.onInteract = () => { lastInteract = performance.now(); stopAuto(); };
  const autoUpdate = () => {
    if (!opt.autoDemo) return;
    const now = performance.now();
    if (now - lastInteract < opt.autoResumeDelay) { if (A.active) stopAuto(); return; }
    if (!A.active) { A.active = true; A.cur.copy(M.coords); A.last = now; A.act = now; }
    M.auto = true;
    let d = (now - A.last) / 1000; A.last = now; if (d > 0.2) d = 0.016;
    const dir = A.dir.subVectors(A.target, A.cur); const dist = dir.length();
    if (dist < 0.01) { pick(); return; }
    dir.normalize();
    let ramp = 1; const rd = opt.autoRampDuration * 1000;
    if (rd > 0) { const t = Math.min(1, (now - A.act) / rd); ramp = t * t * (3 - 2 * t); }
    A.cur.addScaledVector(dir, Math.min(opt.autoSpeed * d * ramp, dist));
    M.coords.set(A.cur.x, A.cur.y); M.moved = true;
  };

  const face_vert = `attribute vec3 position;uniform vec2 px;uniform vec2 boundarySpace;varying vec2 uv;precision highp float;void main(){vec3 pos=position;vec2 scale=1.0-boundarySpace*2.0;pos.xy=pos.xy*scale;uv=vec2(0.5)+(pos.xy)*0.5;gl_Position=vec4(pos,1.0);}`;
  const line_vert = `attribute vec3 position;uniform vec2 px;precision highp float;varying vec2 uv;void main(){vec3 pos=position;uv=0.5+pos.xy*0.5;vec2 n=sign(pos.xy);pos.xy=abs(pos.xy)-px*1.0;pos.xy*=n;gl_Position=vec4(pos,1.0);}`;
  const mouse_vert = `precision highp float;attribute vec3 position;attribute vec2 uv;uniform vec2 center;uniform vec2 scale;uniform vec2 px;varying vec2 vUv;void main(){vec2 pos=position.xy*scale*2.0*px+center;vUv=uv;gl_Position=vec4(pos,0.0,1.0);}`;
  const advection_frag = `precision highp float;uniform sampler2D velocity;uniform float dt;uniform bool isBFECC;uniform vec2 fboSize;uniform vec2 px;varying vec2 uv;void main(){vec2 ratio=max(fboSize.x,fboSize.y)/fboSize;if(isBFECC==false){vec2 vel=texture2D(velocity,uv).xy;vec2 uv2=uv-vel*dt*ratio;gl_FragColor=vec4(texture2D(velocity,uv2).xy,0.0,0.0);}else{vec2 sn=uv;vec2 vo=texture2D(velocity,uv).xy;vec2 so=sn-vo*dt*ratio;vec2 v1=texture2D(velocity,so).xy;vec2 sn2=so+v1*dt*ratio;vec2 err=sn2-sn;vec2 sn3=sn-err/2.0;vec2 v2=texture2D(velocity,sn3).xy;vec2 so2=sn3-v2*dt*ratio;gl_FragColor=vec4(texture2D(velocity,so2).xy,0.0,0.0);}}`;
  const color_frag = `precision highp float;uniform sampler2D velocity;uniform sampler2D palette;uniform vec4 bgColor;varying vec2 uv;void main(){vec2 vel=texture2D(velocity,uv).xy;float lenv=clamp(length(vel),0.0,1.0);vec3 c=texture2D(palette,vec2(lenv,0.5)).rgb;gl_FragColor=vec4(mix(bgColor.rgb,c,lenv),mix(bgColor.a,1.0,lenv));}`;
  const divergence_frag = `precision highp float;uniform sampler2D velocity;uniform float dt;uniform vec2 px;varying vec2 uv;void main(){float x0=texture2D(velocity,uv-vec2(px.x,0.0)).x;float x1=texture2D(velocity,uv+vec2(px.x,0.0)).x;float y0=texture2D(velocity,uv-vec2(0.0,px.y)).y;float y1=texture2D(velocity,uv+vec2(0.0,px.y)).y;gl_FragColor=vec4(((x1-x0+y1-y0)/2.0)/dt);}`;
  const externalForce_frag = `precision highp float;uniform vec2 force;uniform vec2 center;uniform vec2 scale;uniform vec2 px;varying vec2 vUv;void main(){vec2 circle=(vUv-0.5)*2.0;float d=1.0-min(length(circle),1.0);d*=d;gl_FragColor=vec4(force*d,0.0,1.0);}`;
  const poisson_frag = `precision highp float;uniform sampler2D pressure;uniform sampler2D divergence;uniform vec2 px;varying vec2 uv;void main(){float p0=texture2D(pressure,uv+vec2(px.x*2.0,0.0)).r;float p1=texture2D(pressure,uv-vec2(px.x*2.0,0.0)).r;float p2=texture2D(pressure,uv+vec2(0.0,px.y*2.0)).r;float p3=texture2D(pressure,uv-vec2(0.0,px.y*2.0)).r;float div=texture2D(divergence,uv).r;gl_FragColor=vec4((p0+p1+p2+p3)/4.0-div);}`;
  const pressure_frag = `precision highp float;uniform sampler2D pressure;uniform sampler2D velocity;uniform vec2 px;uniform float dt;varying vec2 uv;void main(){float p0=texture2D(pressure,uv+vec2(px.x,0.0)).r;float p1=texture2D(pressure,uv-vec2(px.x,0.0)).r;float p2=texture2D(pressure,uv+vec2(0.0,px.y)).r;float p3=texture2D(pressure,uv-vec2(0.0,px.y)).r;vec2 v=texture2D(velocity,uv).xy;v=v-vec2(p0-p1,p2-p3)*0.5*dt;gl_FragColor=vec4(v,0.0,1.0);}`;
  const viscous_frag = `precision highp float;uniform sampler2D velocity;uniform sampler2D velocity_new;uniform float v;uniform vec2 px;uniform float dt;varying vec2 uv;void main(){vec2 old=texture2D(velocity,uv).xy;vec2 n0=texture2D(velocity_new,uv+vec2(px.x*2.0,0.0)).xy;vec2 n1=texture2D(velocity_new,uv-vec2(px.x*2.0,0.0)).xy;vec2 n2=texture2D(velocity_new,uv+vec2(0.0,px.y*2.0)).xy;vec2 n3=texture2D(velocity_new,uv-vec2(0.0,px.y*2.0)).xy;vec2 nv=4.0*old+v*dt*(n0+n1+n2+n3);nv/=4.0*(1.0+v*dt);gl_FragColor=vec4(nv,0.0,0.0);}`;

  const cam = new THREE.Camera();
  const makePass = (vs, fs, uniforms, extra) => {
    const scene = new THREE.Scene();
    const mat = new THREE.RawShaderMaterial(Object.assign({ vertexShader: vs, fragmentShader: fs, uniforms }, extra || {}));
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    return { scene, mat, u: uniforms };
  };
  const render = (scene, target) => { C.renderer.setRenderTarget(target || null); C.renderer.render(scene, cam); C.renderer.setRenderTarget(null); };

  const fboSize = new THREE.Vector2(), cellScale = new THREE.Vector2(), boundarySpace = new THREE.Vector2();
  const calcSize = () => {
    const w = Math.max(1, Math.round(opt.resolution * C.width)), h = Math.max(1, Math.round(opt.resolution * C.height));
    cellScale.set(1 / w, 1 / h); fboSize.set(w, h);
  };
  calcSize();
  const type = /(iPad|iPhone|iPod)/i.test(navigator.userAgent) ? THREE.HalfFloatType : THREE.FloatType;
  const fo = { type, depthBuffer: false, stencilBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping };
  const F = {};
  ['vel_0', 'vel_1', 'vel_viscous0', 'vel_viscous1', 'div', 'pressure_0', 'pressure_1'].forEach(k => { F[k] = new THREE.WebGLRenderTarget(fboSize.x, fboSize.y, fo); });

  const adv = makePass(face_vert, advection_frag, { boundarySpace: { value: cellScale }, px: { value: cellScale }, fboSize: { value: fboSize }, velocity: { value: F.vel_0.texture }, dt: { value: opt.dt }, isBFECC: { value: true } });
  const bg = new THREE.BufferGeometry();
  bg.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1,-1,0,-1,1,0,-1,1,0,1,1,0,1,1,0,1,-1,0,1,-1,0,-1,-1,0]), 3));
  const line = new THREE.LineSegments(bg, new THREE.RawShaderMaterial({ vertexShader: line_vert, fragmentShader: advection_frag, uniforms: adv.u }));
  adv.scene.add(line);

  const efScene = new THREE.Scene();
  const efU = { px: { value: cellScale }, force: { value: new THREE.Vector2() }, center: { value: new THREE.Vector2() }, scale: { value: new THREE.Vector2(opt.cursorSize, opt.cursorSize) } };
  efScene.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.RawShaderMaterial({ vertexShader: mouse_vert, fragmentShader: externalForce_frag, blending: THREE.AdditiveBlending, depthWrite: false, uniforms: efU })));

  const vis = makePass(face_vert, viscous_frag, { boundarySpace: { value: boundarySpace }, velocity: { value: F.vel_1.texture }, velocity_new: { value: F.vel_viscous0.texture }, v: { value: opt.viscous }, px: { value: cellScale }, dt: { value: opt.dt } });
  const div = makePass(face_vert, divergence_frag, { boundarySpace: { value: boundarySpace }, velocity: { value: F.vel_viscous0.texture }, px: { value: cellScale }, dt: { value: opt.dt } });
  const poi = makePass(face_vert, poisson_frag, { boundarySpace: { value: boundarySpace }, pressure: { value: F.pressure_0.texture }, divergence: { value: F.div.texture }, px: { value: cellScale } });
  const pre = makePass(face_vert, pressure_frag, { boundarySpace: { value: boundarySpace }, pressure: { value: F.pressure_0.texture }, velocity: { value: F.vel_viscous0.texture }, px: { value: cellScale }, dt: { value: opt.dt } });
  const out = makePass(face_vert, color_frag, { velocity: { value: F.vel_0.texture }, boundarySpace: { value: new THREE.Vector2() }, palette: { value: paletteTex(opt.colors) }, bgColor: { value: new THREE.Vector4(0, 0, 0, 0) } }, { transparent: true, depthWrite: false });

  const simStep = () => {
    if (opt.isBounce) boundarySpace.set(0, 0); else boundarySpace.copy(cellScale);
    adv.u.dt.value = opt.dt; line.visible = opt.isBounce; adv.u.isBFECC.value = opt.BFECC;
    render(adv.scene, F.vel_1);
    const cs = opt.cursorSize, csx = cs * cellScale.x, csy = cs * cellScale.y;
    efU.force.value.set((M.diff.x / 2) * opt.mouseForce, (M.diff.y / 2) * opt.mouseForce);
    efU.center.value.set(
      Math.min(Math.max(M.coords.x, -1 + csx + cellScale.x * 2), 1 - csx - cellScale.x * 2),
      Math.min(Math.max(M.coords.y, -1 + csy + cellScale.y * 2), 1 - csy - cellScale.y * 2));
    efU.scale.value.set(cs, cs);
    render(efScene, F.vel_1);
    let vel = F.vel_1;
    if (opt.isViscous) {
      vis.u.v.value = opt.viscous; let fin, fout;
      for (let i = 0; i < opt.iterationsViscous; i++) {
        if (i % 2 === 0) { fin = F.vel_viscous0; fout = F.vel_viscous1; } else { fin = F.vel_viscous1; fout = F.vel_viscous0; }
        vis.u.velocity_new.value = fin.texture; vis.u.dt.value = opt.dt; render(vis.scene, fout);
      }
      vel = fout;
    }
    div.u.velocity.value = vel.texture; render(div.scene, F.div);
    let pin, pout;
    for (let i = 0; i < opt.iterationsPoisson; i++) {
      if (i % 2 === 0) { pin = F.pressure_0; pout = F.pressure_1; } else { pin = F.pressure_1; pout = F.pressure_0; }
      poi.u.pressure.value = pin.texture; render(poi.scene, pout);
    }
    pre.u.velocity.value = vel.texture; pre.u.pressure.value = pout.texture; render(pre.scene, F.vel_0);
    C.renderer.setRenderTarget(null); C.renderer.render(out.scene, cam);
  };

  container.prepend(C.renderer.domElement);
  let running = false, raf = null, visible = true;
  const loop = () => { if (!running) return; autoUpdate(); mouseUpdate(); C.clock.getDelta(); simStep(); raf = requestAnimationFrame(loop); };
  const start = () => { if (running) return; running = true; loop(); };
  const pause = () => { running = false; if (raf) cancelAnimationFrame(raf); raf = null; };
  const resize = () => { resizeC(); calcSize(); Object.values(F).forEach(f => f.setSize(fboSize.x, fboSize.y)); };
  window.addEventListener('resize', resize);
  const onVis = () => { if (document.hidden) pause(); else if (visible) start(); };
  document.addEventListener('visibilitychange', onVis);
  const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && !document.hidden) start(); else pause(); }, { threshold: [0, 0.01] });
  io.observe(container);
  const ro = new ResizeObserver(() => requestAnimationFrame(resize));
  ro.observe(container);
  start();

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    pause(); io.disconnect(); ro.disconnect();
    window.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', onVis);
    window.removeEventListener('mousemove', onMove); window.removeEventListener('touchstart', onTouch);
    window.removeEventListener('touchmove', onTouch); window.removeEventListener('touchend', onEnd);
    document.removeEventListener('mouseleave', onEnd);
    try { C.renderer.domElement.remove(); C.renderer.dispose(); C.renderer.forceContextLoss(); } catch (e) {}
  };
}
