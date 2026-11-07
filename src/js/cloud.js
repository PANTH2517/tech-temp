import * as THREE from 'three';
import { gsap } from './gsap.js';
import { clamp, lerp } from './core.js';

function avatarTexture(p) {
  const c = document.createElement('canvas');
  const S = innerWidth < 700 ? 128 : 256;
  c.width = c.height = S;
  const K = S / 256;
  c.getContext("2d").scale(K, K);
  const g = c.getContext('2d');
  const col = p.accent || '#C6FF3D';
  g.fillStyle = '#0c0c10';
  g.beginPath();
  g.arc(128, 128, 120, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = col;
  g.lineWidth = 12;
  g.stroke();
  g.fillStyle = col;
  g.globalAlpha = 0.18;
  g.beginPath();
  g.arc(128, 128, 108, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  if (p.emoji) {
    g.font = '120px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
    g.fillText(p.emoji, 128, 136);
  } else {
    g.fillStyle = '#f1efe8';
    g.font = '800 96px "Bricolage Grotesque", Arial, sans-serif';
    g.fillText(p.initials || '?', 128, 134);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createCloud(host, people, { onOpen, onHover }) {
  const small = innerWidth < 700;
  const renderer = new THREE.WebGLRenderer({ antialias: !small, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1 : 1.75));
  renderer.setClearColor(0x000000, 0);
  host.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 11);

  const root = new THREE.Group();
  scene.add(root);
  const n = people.length;
  const sprites = people.map((p, i) => {
    const y = 1 - (i / Math.max(1, n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = i * Math.PI * (3 - Math.sqrt(5));
    const mat = new THREE.SpriteMaterial({ map: avatarTexture(p), transparent: true, depthWrite: false });
    const s = new THREE.Sprite(mat);
    s.position.set(Math.cos(th) * r * 4, y * 4, Math.sin(th) * r * 4);
    s.scale.setScalar(1.55);
    s.userData = { p, base: 1.55, hover: 0, dim: 1 };
    root.add(s);
    return s;
  });

  const wire = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(3.9, innerWidth < 700 ? 1 : 2)), new THREE.LineBasicMaterial({ color: 0xc6ff3d, transparent: true, opacity: 0.1 }));
  root.add(wire);
  [3.2, 4.5, 5.3].forEach((rad, k) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(rad, 0.012, 6, 120), new THREE.MeshBasicMaterial({ color: k === 1 ? 0xc6ff3d : 0xf1efe8, transparent: true, opacity: 0.35 }));
    ring.rotation.x = Math.PI / 2 + k * 0.5;
    ring.rotation.y = k * 0.7;
    root.add(ring);
  });

  const ray = new THREE.Raycaster();
  const ptr = new THREE.Vector2(9, 9);
  const state = { rx: 0.25, ry: 0, vx: 0, vy: 0.004, drag: false, moved: 0, px: 0, py: 0, hover: null, visible: true, focus: null };

  const resize = () => {
    const w = host.clientWidth || innerWidth, h = host.clientHeight || 520;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w / h < 0.9 ? 15 : 11;
    camera.updateProjectionMatrix();
  };
  resize();
  const dom = renderer.domElement;
  dom.style.touchAction = 'pan-y';

  dom.addEventListener('pointerdown', e => {
    state.drag = true;
    state.moved = 0;
    state.px = e.clientX;
    state.py = e.clientY;
    state.focus = null;
    dom.setPointerCapture(e.pointerId);
  });
  dom.addEventListener('pointermove', e => {
    const r = dom.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    if (!state.drag) return;
    const dx = e.clientX - state.px, dy = e.clientY - state.py;
    state.moved += Math.abs(dx) + Math.abs(dy);
    state.px = e.clientX;
    state.py = e.clientY;
    state.vy = dx * 0.006;
    state.vx = dy * 0.004;
    state.ry += state.vy;
    state.rx = clamp(state.rx + state.vx, -1.2, 1.2);
  });
  const up = () => {
    if (!state.drag) return;
    state.drag = false;
    if (state.moved < 6 && state.hover) onOpen(state.hover.userData.p);
  };
  dom.addEventListener('pointerup', up);
  dom.addEventListener('pointercancel', () => { state.drag = false; });
  dom.addEventListener('pointerleave', () => { ptr.set(9, 9); });

  new IntersectionObserver(en => { state.visible = en[0].isIntersecting; }).observe(host);

  let last = 0;
  const tick = time => {
    if (!state.visible || (small && (state.f = !state.f))) return;
    const dt = Math.min(0.1, time - last || 0.016);
    last = time;
    if (!state.drag) {
      state.vy = lerp(state.vy, 0.0035, 0.02);
      state.vx = lerp(state.vx, 0, 0.05);
      if (state.focus) {
        state.ry = lerp(state.ry, state.focus.ry, 1 - Math.exp(-dt * 5));
        state.rx = lerp(state.rx, state.focus.rx, 1 - Math.exp(-dt * 5));
      } else {
        state.ry += state.vy;
        state.rx = clamp(state.rx + state.vx, -1.2, 1.2);
      }
    }
    root.rotation.set(state.rx, state.ry, 0);
    ray.setFromCamera(ptr, camera);
    const hits = ray.intersectObjects(sprites.filter(s => s.userData.dim > 0.5), false);
    const hit = hits.length ? hits[0].object : null;
    if (hit !== state.hover) {
      state.hover = hit;
      dom.style.cursor = hit ? 'pointer' : 'grab';
      onHover(hit ? hit.userData.p : null);
    }
    sprites.forEach(s => {
      const u = s.userData;
      u.hover = lerp(u.hover, s === state.hover ? 1 : 0, 0.18);
      s.scale.setScalar(u.base * (1 + u.hover * 0.45));
      s.material.opacity = lerp(s.material.opacity, u.dim, 0.12);
    });
    renderer.render(scene, camera);
  };
  gsap.ticker.add(tick);
  addEventListener('resize', resize);

  return {
    setFilter(set) {
      let first = null;
      sprites.forEach(s => {
        s.userData.dim = !set || set.has(s.userData.p.handle) ? 1 : 0.14;
        if (set && !first && set.has(s.userData.p.handle)) first = s;
      });
      if (set && first) {
        const v = first.position.clone().normalize();
        state.focus = { ry: -Math.atan2(v.x, v.z) + Math.PI * 2 * Math.round((state.ry + Math.atan2(v.x, v.z)) / (Math.PI * 2)), rx: clamp(Math.asin(v.y), -1.1, 1.1) };
      } else state.focus = null;
    },
    dom
  };
}
