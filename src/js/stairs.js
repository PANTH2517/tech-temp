import * as THREE from 'three';
import { clamp, lerp } from './core.js';

const W = 3.4;
const DEPTH = 1.1;
const RISE = 0.55;
const THICK = 0.38;
const LAND = 5.4;
const PER = 9;
const EYE = 1.75;
const DIRS = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, -1)];
const UP = new THREE.Vector3(0, 1, 0);
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

export function createStairs(host, count) {
  const small = innerWidth < 700;
  const renderer = new THREE.WebGLRenderer({ antialias: !small, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.25 : 1.75));
  renderer.setClearColor(0x060608, 1);
  host.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x060608, 7, small ? 30 : 38);
  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 120);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(4, 9, 5);
  scene.add(sun);
  const glow = new THREE.PointLight(0xc6ff3d, 11, 18, 1.8);
  scene.add(glow);

  const steps = [];
  const waypoints = [];
  const gates = [];
  const landings = [];
  const stepWp = [];

  let cur = new THREE.Vector3(0, 0, 0);
  landings.push({ c: cur.clone(), size: LAND, wp: 0 });
  waypoints.push(cur.clone().addScaledVector(UP, EYE));

  for (let k = 0; k < count; k++) {
    const d = DIRS[k % 4];
    const yaw = Math.atan2(d.x, d.z);
    const edge = cur.clone().addScaledVector(d, LAND / 2);
    for (let i = 0; i < PER; i++) {
      const c = edge.clone().addScaledVector(d, i * DEPTH + DEPTH / 2);
      const top = cur.y + (i + 1) * RISE;
      c.y = top - THICK / 2;
      steps.push({ c, yaw, w: W, h: THICK, d: DEPTH * 0.92 });
      waypoints.push(new THREE.Vector3(c.x, top + EYE, c.z));
      stepWp.push(waypoints.length - 1);
    }
    const next = edge.clone().addScaledVector(d, PER * DEPTH + LAND / 2);
    next.y = cur.y + PER * RISE;
    const gp = edge.clone().addScaledVector(d, PER * DEPTH + 0.2);
    gp.y = next.y;
    landings.push({ c: next.clone(), size: LAND, wp: waypoints.length });
    waypoints.push(next.clone().addScaledVector(UP, EYE));
    gates.push({ p: gp, yaw, wp: waypoints.length - 1 });
    cur = next;
  }

  const tail = DIRS[count % 4];
  const tailStart = cur.clone();
  for (let i = 1; i <= 4; i++) waypoints.push(tailStart.clone().addScaledVector(tail, i * 3.2).addScaledVector(UP, EYE + i * 0.35));
  const portalPos = tailStart.clone().addScaledVector(tail, 15).addScaledVector(UP, EYE + 2.2);

  const curve = new THREE.CatmullRomCurve3(waypoints, false, 'centripetal');
  const DIV = 3000;
  curve.arcLengthDivisions = DIV;
  const total = curve.getLength();
  const lengths = curve.getLengths(DIV);
  const n = waypoints.length;
  const arcOf = wp => lengths[Math.round((wp / (n - 1)) * DIV)];

  const stepArc = stepWp.map(arcOf);
  const landArc = landings.map(l => arcOf(l.wp));
  const gateArc = gates.map(g => arcOf(g.wp) - 1.6);

  const paper = new THREE.MeshLambertMaterial({ color: 0xede9e0 });
  const rimMat = new THREE.MeshBasicMaterial({ color: 0xc6ff3d });
  const box = new THREE.BoxGeometry(1, 1, 1);
  const stepMesh = new THREE.InstancedMesh(box, paper, steps.length);
  const stepRim = new THREE.InstancedMesh(box, rimMat, steps.length);
  const landMesh = new THREE.InstancedMesh(box, paper, landings.length);
  const landRim = new THREE.InstancedMesh(box, rimMat, landings.length);
  [stepMesh, stepRim, landMesh, landRim].forEach(m => { m.frustumCulled = false; scene.add(m); });

  const gateMat = new THREE.MeshBasicMaterial({ color: 0xc6ff3d });
  const gateGroups = gates.map(g => {
    const grp = new THREE.Group();
    const post = new THREE.BoxGeometry(0.22, 4.4, 0.22);
    const beam = new THREE.BoxGeometry(W + 1.3, 0.22, 0.22);
    const l = new THREE.Mesh(post, gateMat), r = new THREE.Mesh(post, gateMat), t = new THREE.Mesh(beam, gateMat);
    l.position.set(-(W + 1.1) / 2, 2.2, 0);
    r.position.set((W + 1.1) / 2, 2.2, 0);
    t.position.set(0, 4.4, 0);
    grp.add(l, r, t);
    grp.position.copy(g.p);
    grp.rotation.y = g.yaw;
    scene.add(grp);
    return grp;
  });

  const portal = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.28, 12, 72), gateMat);
  portal.position.copy(portalPos);
  portal.rotation.y = Math.atan2(tail.x, tail.z);
  scene.add(portal);

  const specks = new Float32Array((small ? 260 : 520) * 3);
  const box3 = new THREE.Box3().setFromPoints(waypoints);
  const size = box3.getSize(new THREE.Vector3());
  for (let i = 0; i < specks.length; i += 3) {
    specks[i] = box3.min.x - 14 + Math.random() * (size.x + 28);
    specks[i + 1] = box3.min.y - 10 + Math.random() * (size.y + 24);
    specks[i + 2] = box3.min.z - 14 + Math.random() * (size.z + 28);
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(specks, 3));
  const pts = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xede9e0, size: 0.11, transparent: true, opacity: 0.7 }));
  scene.add(pts);

  const cubeCount = small ? 26 : 56;
  const floaters = new THREE.InstancedMesh(box, new THREE.MeshLambertMaterial({ color: 0x3a3833 }), cubeCount);
  floaters.frustumCulled = false;
  const fdata = [];
  for (let i = 0; i < cubeCount; i++) {
    fdata.push({
      p: new THREE.Vector3(box3.min.x - 10 + Math.random() * (size.x + 20), box3.min.y - 6 + Math.random() * (size.y + 16), box3.min.z - 10 + Math.random() * (size.z + 20)),
      s: 0.5 + Math.random() * 1.1,
      r: new THREE.Euler(Math.random() * 3, Math.random() * 3, Math.random() * 3),
      v: 0.1 + Math.random() * 0.25
    });
  }
  scene.add(floaters);

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), sc = new THREE.Vector3(), e = new THREE.Euler();
  const fwd = new THREE.Vector3(), target = new THREE.Vector3(), right = new THREE.Vector3();

  function layout(arcs, list, mesh, rim, sizeFn, camS) {
    list.forEach((it, i) => {
      const d = arcs[i] - camS;
      const grow = smooth(28, 15, d) * (1 - smooth(-3, -13, d));
      const s = Math.max(0.0001, grow);
      const sz = sizeFn(it);
      pos.copy(it.c);
      pos.y -= (1 - grow) * 3;
      q.setFromAxisAngle(UP, it.yaw || 0);
      sc.set(sz[0] * s, sz[1] * s, sz[2] * s);
      m4.compose(pos, q, sc);
      mesh.setMatrixAt(i, m4);
      pos.y -= sz[1] * s * 0.55;
      sc.set(sz[0] * s * 1.07, sz[1] * s * 0.3, sz[2] * s * 1.07);
      m4.compose(pos, q, sc);
      rim.setMatrixAt(i, m4);
    });
    mesh.instanceMatrix.needsUpdate = true;
    rim.instanceMatrix.needsUpdate = true;
  }

  const landItems = landings.map(l => ({ c: new THREE.Vector3(l.c.x, l.c.y - 0.28, l.c.z), yaw: 0 }));

  const state = { u: 0, target: 0, mx: 0, my: 0, time: 0, fov: 62 };

  function frame(dt) {
    state.u = lerp(state.u, state.target, 1 - Math.exp(-dt * 7));
    state.time += dt;
    const u = clamp(state.u);
    const camS = u * total;
    const p = curve.getPointAt(u);
    const ahead = curve.getPointAt(Math.min(1, u + 0.018));
    fwd.copy(ahead).sub(p).normalize();
    right.crossVectors(fwd, UP).normalize();
    camera.position.copy(p).addScaledVector(right, state.mx * 0.35).addScaledVector(UP, -state.my * 0.25);
    target.copy(ahead).addScaledVector(UP, -0.35 + state.my * -0.5).addScaledVector(right, state.mx * 0.8);
    camera.up.copy(UP);
    camera.lookAt(target);
    const flip = smooth(0.84, 0.985, u);
    camera.rotateZ(flip * Math.PI);
    camera.fov = lerp(state.fov, 98, smooth(0.9, 1, u));
    camera.updateProjectionMatrix();
    glow.position.copy(p).addScaledVector(UP, 1.2);

    layout(stepArc, steps, stepMesh, stepRim, s => [s.w, s.h, s.d], camS);
    layout(landArc, landItems, landMesh, landRim, () => [LAND, 0.5, LAND], camS);

    gateGroups.forEach((g, i) => {
      const d = gateArc[i] - camS;
      const s = Math.max(0.0001, smooth(30, 16, d) * (1 - smooth(-2, -9, d)));
      g.scale.setScalar(s);
    });
    portal.scale.setScalar(Math.max(0.0001, smooth(0.62, 0.85, u)));
    portal.rotation.z = state.time * 0.4;

    fdata.forEach((f, i) => {
      e.set(f.r.x + state.time * f.v, f.r.y + state.time * f.v * 0.7, f.r.z);
      q.setFromEuler(e);
      pos.copy(f.p);
      pos.y += Math.sin(state.time * f.v + i) * 0.6;
      sc.setScalar(f.s);
      m4.compose(pos, q, sc);
      floaters.setMatrixAt(i, m4);
    });
    floaters.instanceMatrix.needsUpdate = true;
    pts.rotation.y = state.time * 0.012;

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
    total,
    gateArc,
    landArc,
    dom: renderer.domElement,
    dispose: () => renderer.dispose()
  };
}
