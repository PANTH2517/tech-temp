import * as THREE from 'three';
import { clamp, lerp } from './core.js';
import { R, L, INTRO, gateU as gateUs } from './highway-math.js';

const HW = 3.3;
const EYE = 1.55;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

function basis(theta, out) {
  const c = Math.cos(theta), s = Math.sin(theta);
  const h = theta / 2;
  out.P.set(R * c, R * s, 0);
  out.T.set(-s, c, 0);
  out.W.set(Math.cos(h) * c, Math.cos(h) * s, Math.sin(h));
  out.N.crossVectors(out.W, out.T).normalize();
  return out;
}

function roadTexture(renderer) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#0b0b0e';
  g.fillRect(0, 0, 1024, 256);
  const band = 52;
  g.save();
  g.translate(0, 0);
  const zebraRows = (y0, h) => {
    g.save();
    g.beginPath();
    g.rect(0, y0, 1024, h);
    g.clip();
    g.fillStyle = '#f1efe8';
    for (let i = -400; i < 1500; i += 38) {
      g.beginPath();
      g.moveTo(i, y0 + h);
      g.lineTo(i + 19, y0 + h);
      g.lineTo(i + 19 + h, y0);
      g.lineTo(i + h, y0);
      g.closePath();
      g.fill();
    }
    g.restore();
  };
  zebraRows(0, band);
  zebraRows(256 - band, band);
  g.restore();
  g.fillStyle = '#c6ff3d';
  g.fillRect(0, band, 1024, 7);
  g.fillRect(0, 256 - band - 7, 1024, 7);
  g.fillStyle = '#f1efe8';
  g.font = '800 92px "Bricolage Grotesque", Arial, sans-serif';
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  g.fillText('PARADOX  ×', 512, 132);
  g.fillStyle = 'rgba(198,255,61,.9)';
  for (let x = 20; x < 1024; x += 128) g.fillRect(x, 124, 54, 8);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}

function opartSky() {
  const w = innerWidth < 700 ? 512 : 1024, h = w / 2;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  const img = g.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = Math.sin(x * (w === 512 ? 0.22 : 0.11) + Math.sin(y * (w === 512 ? 0.1 : 0.05) + x * 0.004) * 7 + Math.cos(y * 0.021) * 3);
      const on = v > 0;
      const i = (y * w + x) * 4;
      img.data[i] = on ? 20 : 8;
      img.data[i + 1] = on ? 20 : 8;
      img.data[i + 2] = on ? 26 : 11;
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

export function createHighway(host, count) {
  const small = innerWidth < 700;
  const renderer = new THREE.WebGLRenderer({ antialias: !small, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1 : 1.75));
  renderer.setClearColor(0x060608, 1);
  host.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x060608, 12, 60);
  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 400);

  const tex = roadTexture(renderer);
  if (document.fonts) document.fonts.load('800 92px "Bricolage Grotesque"').then(() => { tex.dispose(); tex.needsUpdate = true; });

  const U = small ? 420 : 760;
  const pos = [], uv = [], idx = [];
  const bs = { P: new THREE.Vector3(), T: new THREE.Vector3(), W: new THREE.Vector3(), N: new THREE.Vector3() };
  for (let i = 0; i <= U; i++) {
    const th = (i / U) * Math.PI * 2;
    basis(th, bs);
    for (let j = 0; j <= 1; j++) {
      const v = (j * 2 - 1) * HW;
      pos.push(bs.P.x + bs.W.x * v, bs.P.y + bs.W.y * v, bs.P.z + bs.W.z * v);
      uv.push((i / U) * (L / (HW * 2 * 4)), j);
    }
  }
  for (let i = 0; i < U; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  const road = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
  road.frustumCulled = false;
  scene.add(road);

  const sky = new THREE.Mesh(new THREE.SphereGeometry(190, 48, 24), new THREE.MeshBasicMaterial({ map: opartSky(), side: THREE.BackSide, fog: false }));
  scene.add(sky);

  const limeMat = new THREE.MeshBasicMaterial({ color: 0xc6ff3d });
  const hoopCount = small ? 22 : 34;
  const hoops = new THREE.InstancedMesh(new THREE.TorusGeometry(HW + 0.9, 0.05, 6, 56), limeMat, hoopCount);
  hoops.frustumCulled = false;
  scene.add(hoops);

  const gateGroups = [];
  const gateU = gateUs(count);
  for (let k = 0; k < count; k++) {
    const grp = new THREE.Group();
    const post = new THREE.BoxGeometry(0.28, 5.4, 0.28);
    const beam = new THREE.BoxGeometry(HW * 2 + 1.2, 0.28, 0.28);
    const l = new THREE.Mesh(post, limeMat), rr = new THREE.Mesh(post, limeMat), t = new THREE.Mesh(beam, limeMat);
    l.position.set(-(HW + 0.5), 2.7, 0);
    rr.position.set(HW + 0.5, 2.7, 0);
    t.position.set(0, 5.4, 0);
    grp.add(l, rr, t);
    grp.matrixAutoUpdate = false;
    scene.add(grp);
    gateGroups.push(grp);
  }

  const portal = new THREE.Mesh(new THREE.TorusGeometry(5.2, 0.34, 12, 80), limeMat);
  portal.matrixAutoUpdate = false;
  scene.add(portal);

  const sp = small ? 380 : 800;
  const arr = new Float32Array(sp * 3);
  for (let i = 0; i < sp; i++) {
    const th = Math.random() * Math.PI * 2;
    basis(th, bs);
    const a = (Math.random() - 0.5) * 2 * 20, b = (Math.random() - 0.5) * 2 * 20;
    arr[i * 3] = bs.P.x + bs.W.x * a + bs.N.x * b;
    arr[i * 3 + 1] = bs.P.y + bs.W.y * a + bs.N.y * b;
    arr[i * 3 + 2] = bs.P.z + bs.W.z * a + bs.N.z * b;
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xede9e0, size: 0.14, transparent: true, opacity: 0.8 })));

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p3 = new THREE.Vector3(), s3 = new THREE.Vector3();
  const A = { P: new THREE.Vector3(), T: new THREE.Vector3(), W: new THREE.Vector3(), N: new THREE.Vector3() };
  const B = { P: new THREE.Vector3(), T: new THREE.Vector3(), W: new THREE.Vector3(), N: new THREE.Vector3() };
  const look = new THREE.Vector3(), up = new THREE.Vector3(), far = new THREE.Vector3(R * 0.5, -R * 2.6, R * 1.5), eye = new THREE.Vector3();
  const state = { u: 0, target: 0, mx: 0, my: 0, time: 0, fov: 62 };

  const thetaOf = u => clamp((u - INTRO) / (1 - INTRO)) * Math.PI * 2;
  const gateS = gateU.map(u => u * L);

  function place(group, theta, lift) {
    basis(theta, B);
    m4.makeBasis(B.W, B.N, B.T);
    m4.setPosition(B.P.x + B.N.x * lift, B.P.y + B.N.y * lift, B.P.z + B.N.z * lift);
    group.matrix.copy(m4);
    group.matrixWorldNeedsUpdate = true;
  }

  function frame(dt) {
    state.u = lerp(state.u, state.target, 1 - Math.exp(-dt * 7));
    state.time += dt;
    const u = clamp(state.u);
    const theta = thetaOf(u);
    basis(theta, A);
    const ahead = basis(theta + 0.045, B);
    eye.copy(A.P).addScaledVector(A.N, EYE).addScaledVector(A.W, state.mx * 0.7);
    look.copy(ahead.P).addScaledVector(ahead.N, EYE * 0.82).addScaledVector(A.N, -state.my * 0.8);
    up.copy(A.N);
    const k = smooth(0, INTRO, u);
    camera.position.lerpVectors(far, eye, k);
    const lt = new THREE.Vector3().lerpVectors(new THREE.Vector3(0, 0, 0), look, k);
    const upv = new THREE.Vector3().lerpVectors(new THREE.Vector3(0, 0, 1), up, k).normalize();
    camera.up.copy(upv);
    camera.lookAt(lt);
    const endK = smooth(0.93, 1, u);
    camera.fov = lerp(state.fov, 100, endK) + (1 - k) * -14;
    camera.updateProjectionMatrix();
    scene.fog.far = lerp(210, small ? 50 : 62, smooth(0.0, INTRO, u));
    scene.fog.near = lerp(60, 12, k);
    sky.rotation.y = state.time * 0.01;
    sky.rotation.z = Math.sin(state.time * 0.06) * 0.1;

    const camS = u * L;
    const spacing = 4.6;
    const ride = smooth(INTRO * 0.5, INTRO, u);
    const baseIdx = Math.floor((theta * R) / spacing);
    for (let j = 0; j < hoopCount; j++) {
      const s = (baseIdx + j - 4) * spacing;
      const th = s / R;
      basis(th, B);
      const d = s - theta * R;
      const vis = ride * smooth(hoopCount * spacing - 10, hoopCount * spacing * 0.5, d) * (1 - smooth(-6, -16, d));
      m4.makeBasis(B.W, B.N, B.T);
      m4.setPosition(B.P.x + B.N.x * 1.6, B.P.y + B.N.y * 1.6, B.P.z + B.N.z * 1.6);
      q.setFromRotationMatrix(m4);
      p3.setFromMatrixPosition(m4);
      s3.setScalar(Math.max(0.0001, vis));
      m4.compose(p3, q, s3);
      hoops.setMatrixAt(j, m4);
    }
    hoops.instanceMatrix.needsUpdate = true;

    gateGroups.forEach((g, i) => {
      const th = thetaOf(gateU[i]);
      place(g, th, 0);
      const d = gateS[i] - camS;
      const sc = Math.max(0.0001, smooth(70, 26, d) * (1 - smooth(-3, -12, d)));
      g.matrix.scale(s3.setScalar(sc));
      g.matrixWorldNeedsUpdate = true;
    });
    place(portal, Math.PI * 2, 2.4);
    portal.matrix.scale(s3.setScalar(Math.max(0.0001, smooth(0.62, 0.86, u))));
    portal.matrixWorldNeedsUpdate = true;

    renderer.render(scene, camera);
    return { u, camS };
  }

  function resize() {
    const w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    state.fov = w / h < 0.8 ? 84 : w / h < 1.1 ? 72 : 62;
    camera.updateProjectionMatrix();
  }
  resize();

  return {
    frame,
    resize,
    setTarget: v => { state.target = clamp(v); },
    jump: v => { state.target = state.u = clamp(v); },
    setPointer: (x, y) => { state.mx = x; state.my = y; },
    total: L,
    gateArc: gateS.map(s => s - 1.5),
    dom: renderer.domElement,
    dispose: () => renderer.dispose()
  };
}
