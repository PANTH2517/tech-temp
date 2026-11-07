import * as THREE from 'three';
import { gsap } from './gsap.js';
import { clamp, lerp, reduce } from './core.js';

const R = 2.7;
const W = 0.95;
const intro = { v: 0 };
let renderer, scene, camera, rig, strip, tex, canvas;
let mx = 0, my = 0, spin = 0, last = 0, skip = false;

function drawTexture() {
  const g = tex.image.getContext("2d");
  g.setTransform(tex.image.width / 4096, 0, 0, tex.image.width / 4096, 0, 0);
  g.fillStyle = '#EDEBE4';
  g.fillRect(0, 0, 4096, 512);
  g.fillStyle = '#0B0B0C';
  g.fillRect(0, 0, 4096, 36);
  g.fillRect(0, 476, 4096, 36);
  g.fillStyle = '#C6FF3D';
  g.fillRect(0, 50, 4096, 10);
  g.fillRect(0, 452, 4096, 10);
  const text = 'THE RULES CONTRADICT THEMSELVES  ×  TECHFEST ’27  ×  PARADOX  ×  THIS SIDE IS THE OTHER SIDE  ×  ';
  g.font = '800 230px "Bricolage Grotesque", Arial, sans-serif';
  g.textBaseline = 'middle';
  g.fillStyle = '#0B0B0C';
  const w = g.measureText(text).width;
  g.save();
  g.translate(180, 262);
  g.scale(3736 / w, 1);
  g.fillText(text, 0, 0);
  g.restore();
  tex.needsUpdate = true;
}

function buildStrip(U) {

  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= U; i++) {
    const u = (i / U) * Math.PI * 2;
    for (let j = 0; j <= 1; j++) {
      const v = (j * 2 - 1) * W;
      const a = R + v * Math.cos(u / 2);
      pos.push(a * Math.cos(u), a * Math.sin(u), v * Math.sin(u / 2));
      uv.push(i / U, j);
    }
  }
  for (let i = 0; i < U; i++) {
    const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function layout() {
  const aspect = innerWidth / innerHeight;
  if (aspect > 1.15) {
    const s = Math.min(0.9, 0.45 * aspect);
    camera.userData.base = 12.5;
    rig.position.set(3.65 * s * 1.02, 0, 0);
    rig.userData.s = s;
  } else {
    const s = Math.min(0.9, Math.max(0.45, 1.05 * aspect));
    camera.userData.base = 15;
    rig.position.set(0, aspect < 0.7 ? 3.1 : 2.6, 0);
    rig.userData.s = s;
  }
}

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  layout();
}

function tick(time) {
  if (innerWidth < 700) { skip = !skip; if (skip) return; }
  const dt = Math.min(0.5, (time - last) || 0.016);
  last = time;
  const p = clamp(scrollY / (innerHeight * 1.05));
  canvas.style.opacity = String(1 - clamp((p - 0.5) / 0.5));
  const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  camera.position.z = lerp(camera.userData.base || 12.5, 1.9, e);
  if (p >= 1) return;
  spin += dt * 0.16;
  strip.rotation.z = spin + (1 - intro.v) * Math.PI * 2;
  const k = 1 - Math.exp(-dt * 4);
  rig.rotation.x = lerp(rig.rotation.x, -1.0 + my * 0.4, k);
  rig.rotation.y = lerp(rig.rotation.y, mx * 0.5, k);
  rig.scale.setScalar(Math.max(0.0001, intro.v * rig.userData.s));
  renderer.render(scene, camera);
}

export function initScene() {
  if (reduce) return false;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: innerWidth >= 700, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    return false;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1 : 1.75));
  renderer.setClearColor(0x000000, 0);
  canvas = renderer.domElement;
  canvas.className = 'gl';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.1, 100);

  const c = document.createElement('canvas');
  c.width = innerWidth < 700 ? 2048 : 4096;
  c.height = innerWidth < 700 ? 256 : 512;
  tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  drawTexture();
  if (document.fonts) document.fonts.load('800 230px "Bricolage Grotesque"').then(drawTexture);

  strip = new THREE.Mesh(buildStrip(innerWidth < 700 ? 140 : 480), new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }));
  const spinner = new THREE.Group();
  spinner.add(strip);
  rig = new THREE.Group();
  rig.userData.s = 1;
  rig.rotation.x = -1.0;
  rig.add(spinner);
  scene.add(rig);

  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  const key = new THREE.DirectionalLight(0xffffff, 1.7);
  key.position.set(3, 5, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xc6ff3d, 1.9);
  rim.position.set(-5, -3, -4);
  scene.add(rim);

  resize();
  addEventListener('resize', resize);
  addEventListener('pointermove', e => {
    mx = e.clientX / innerWidth - .5;
    my = e.clientY / innerHeight - .5;
  }, { passive: true });
  document.documentElement.classList.add('webgl');
  gsap.ticker.add(tick);
  return true;
}

export function playSceneIntro() {
  if (!strip) return;
  intro.v = 0;
  gsap.to(intro, { v: 1, duration: 2.2, ease: 'expo.out' });
}
