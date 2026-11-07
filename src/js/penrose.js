import * as THREE from 'three';
import { gsap } from './gsap.js';
import { $, clamp } from './core.js';

const L = 7;
const ISO = 0.8164966;

export function initPenrose(stage, opts = {}) {
  const read = opts.silent ? null : $('[data-illusion]', stage.parentElement);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (e) {
    stage.insertAdjacentHTML('beforeend', '<p class="pen__fallback">3D is not available on this device.</p>');
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  stage.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -5000, 5000);
  camera.up.set(0, 0, 1);
  camera.position.set(1000, 1000, 1000);
  camera.lookAt(0, 0, 0);
  camera.rotateZ(Math.PI * 0.5);

  const cubes = [];
  for (let i = 0; i < L; i++) cubes.push([i, 0, 0]);
  for (let j = 1; j < L; j++) cubes.push([L - 1, j, 0]);
  for (let k = 1; k < L - 1; k++) cubes.push([L - 1, L - 1, k]);
  const piv = [((.5) + (L - .5) + (L - .5)) / 3, ((.5) + (.5) + (L - .5)) / 3, .5];
  const proj = (x, y, z) => [0.8660254 * (x - y), 0.5 * (x + y) - z];
  const c0 = proj(piv[0], piv[1], piv[2]);
  let R = 0;
  const mats = [0xede9e0, 0xede9e0, 0x4a4842, 0x4a4842, 0xc6ff3d, 0xc6ff3d].map(c => new THREE.MeshBasicMaterial({ color: c }));
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const edgeGeo = new THREE.EdgesGeometry(geo);
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x0b0b0c, transparent: true, opacity: 0.55 });
  const group = new THREE.Group();
  cubes.forEach(([x, y, z]) => {
    for (const dx of [0, 1]) for (const dy of [0, 1]) for (const dz of [0, 1]) {
      const p = proj(x + dx, y + dy, z + dz);
      R = Math.max(R, Math.hypot(p[0] - c0[0], p[1] - c0[1]));
    }
    const m = new THREE.Mesh(geo, mats);
    m.add(new THREE.LineSegments(edgeGeo, edgeMat));
    m.position.set(x + .5 - piv[0], y + .5 - piv[1], z + .5 - piv[2]);
    group.add(m);
  });
  scene.add(camera);
  scene.add(group);
  camera.updateMatrixWorld(true);

  const rot = { x: 0, z: 0 };
  let dragging = false, lastX = 0, lastY = 0, visible = true;
  const resize = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.left = -w / 2;
    camera.right = w / 2;
    camera.top = h / 2;
    camera.bottom = -h / 2;
    camera.updateProjectionMatrix();
    group.scale.setScalar(((Math.min(w, h) * 0.46) / (R + 0.2)) / ISO);
  };
  resize();
  addEventListener('resize', resize);

  stage.addEventListener('pointerdown', e => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    gsap.killTweensOf(rot);
    stage.setPointerCapture(e.pointerId);
    stage.classList.add('is-drag');
  });
  stage.addEventListener('pointermove', e => {
    if (!dragging) return;
    rot.z += (e.clientX - lastX) * 0.012;
    rot.x += (e.clientY - lastY) * 0.008;
    lastX = e.clientX;
    lastY = e.clientY;
  });
  const up = () => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('is-drag');
    if (opts.snap === false) return;
    const tz = Math.round(rot.z / (Math.PI * 2)) * Math.PI * 2;
    gsap.to(rot, { x: 0, z: tz, duration: 1.6, ease: 'elastic.out(1,0.45)' });
  };
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', up);

  const state = { ill: 100 };
  new IntersectionObserver(en => { visible = en[0].isIntersecting; }).observe(stage);
  gsap.ticker.add(() => {
    if (!visible) return;
    group.rotation.set(rot.x, 0, rot.z);
    const dz = Math.abs(rot.z - Math.round(rot.z / (Math.PI * 2)) * Math.PI * 2);
    const ill = Math.round(100 * (1 - clamp(dz / 0.55 + Math.abs(rot.x) / 0.45)));
    state.ill = ill;
    if (read) read.textContent = ill;
    if (opts.onIllusion) opts.onIllusion(ill);
    renderer.render(scene, camera);
  });
  return {
    set: (x, z) => { gsap.killTweensOf(rot); rot.x = x; rot.z = z; },
    illusion: () => state.ill
  };
}
