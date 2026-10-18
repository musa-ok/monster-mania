'use strict';
/* ---------- world scene ---------- */
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xd9f3ff, 150, 380);
const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 700);
const CAM = { tx: 0, tz: 2, dist: 64, vx: 0, vz: 0, anim: null, MIN: 24, MAX: 120 };
scene.add(new THREE.HemisphereLight(0xe4f6ff, 0x8fb07a, 0.55));
scene.add(new THREE.AmbientLight(0xffffff, 0.12));
const sun = new THREE.DirectionalLight(0xffffff, 0.62);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -55, right: 55, top: 55, bottom: -55, near: 1, far: 220 });
sun.shadow.bias = -0.0006;
scene.add(sun); scene.add(sun.target);

// ocean: flat-shaded waves, a deep floor and pale shallows around each island
const waterGeo = new THREE.PlaneGeometry(760, 760, 76, 76);
const waterMat = new THREE.MeshPhongMaterial({ color: 0x2aa8e0, flatShading: true, shininess: 70, specular: 0xbfefff, transparent: true, opacity: 0.84 });
const water = new THREE.Mesh(waterGeo, waterMat); water.rotation.x = -Math.PI / 2; water.position.y = -1.3; scene.add(water);
const wBase = Float32Array.from(waterGeo.attributes.position.array);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(760, 760), new THREE.MeshBasicMaterial({ color: 0x1b74b8 }));
floor.rotation.x = -Math.PI / 2; floor.position.y = -5; scene.add(floor);

const world = new THREE.Group(); scene.add(world);
const pickables = [];
const islandViews = [], plotViews = new Map(), monViews = new Map(), padViews = new Map(), bridgeViews = [];
const special = {};
let foamRings = [], clouds = [];

const radFn = seed => a => 1 + 0.05 * Math.sin(3 * a + seed) + 0.035 * Math.sin(5 * a + seed * 2.3) + 0.02 * Math.sin(9 * a + seed * 0.7);
function wobble(geo, f, yAxis) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = yAxis ? p.getY(i) : p.getZ(i), k = f(Math.atan2(yAxis ? -z : z, x)); p.setX(i, x * k); if (yAxis) p.setY(i, z * k); else p.setZ(i, z * k); }
  p.needsUpdate = true; geo.computeVertexNormals();
}
function addTree(pb, x, z, s, kind, R) {
  if (kind === 0) {
    pb.add('body', G.cyl, 0x8b5a2b, V(x, 1 * s, z), [0.32 * s, 2 * s, 0.32 * s]);
    pb.add('body', G.ico, [0x55c043, 0x4ab03c, 0x6fd457][Math.floor(R() * 3)], V(x, 2.7 * s, z), [1.5 * s, 1.35 * s, 1.5 * s], [R() * 3, R() * 3, 0]);
    pb.add('body', G.ico, 0x6fd457, V(x + 0.6 * s, 3.4 * s, z - 0.3 * s), 0.95 * s, [R() * 3, R() * 3, 0]);
    pb.add('body', G.ico, 0x4ab03c, V(x - 0.5 * s, 3.1 * s, z + 0.4 * s), 0.85 * s, [R() * 3, R() * 3, 0]);
    if (R() < 0.5) for (let i = 0; i < 3; i++) pb.add('detail', G.sphS, 0xff5a5a, V(x + (R() - 0.5) * 2 * s, (2.2 + R()) * s, z + 1.1 * s), 0.18 * s);
  } else if (kind === 1) {
    pb.add('body', G.cyl, 0x7a4b25, V(x, 0.7 * s, z), [0.28 * s, 1.4 * s, 0.28 * s]);
    [[2.0, 1.7, 2.2], [3.0, 1.3, 1.8], [3.9, 0.9, 1.4]].forEach(([y, r, h], i) => pb.add('body', G.cone, i % 2 ? 0x3cb36a : 0x2f9e5a, V(x, y * s, z), [r * s, h * s, r * s]));
  } else if (kind === 2) {
    pb.add('body', G.ico, 0x4cb944, V(x, 0.55 * s, z), [1.0 * s, 0.75 * s, 1.0 * s], [R() * 3, R() * 3, 0]);
    pb.add('detail', G.sphS, [0xff7fb8, 0xffe14d, 0xffffff][Math.floor(R() * 3)], V(x + 0.3 * s, 1.1 * s, z + 0.5 * s), 0.16 * s);
  } else {
    pb.add('body', G.dode, [0xa9a4b8, 0x9b96ad, 0xbab5c9][Math.floor(R() * 3)], V(x, 0.3 * s, z), [0.9 * s, 0.6 * s, 0.8 * s], [R(), R() * 3, R()]);
  }
}
function buildIsland(I, idx) {
  const g = new THREE.Group(); g.position.set(I.x, 0, I.z);
  const f = radFn(idx * 1.7 + 0.5), r = I.r;
  const grass = new THREE.CylinderGeometry(r + 0.35, r + 0.25, 0.4, 80, 1); wobble(grass, f);
  const gm = new THREE.Mesh(grass, MAT.grass); gm.position.y = -0.2; gm.receiveShadow = true; g.add(gm);
  const dirt = new THREE.CylinderGeometry(r + 0.2, r * 0.9, 1.4, 80, 1); wobble(dirt, f);
  const dm = new THREE.Mesh(dirt, MAT.dirt); dm.position.y = -1.1; g.add(dm);
  const sand = new THREE.CylinderGeometry(r + 2.6, r + 3.6, 0.8, 80, 1); wobble(sand, f);
  const sm = new THREE.Mesh(sand, MAT.sand); sm.position.y = -1.45; sm.receiveShadow = true; g.add(sm);
  const sh = new THREE.Mesh(new THREE.CircleGeometry(r + 11, 48), MAT.shallow); sh.rotation.x = -Math.PI / 2; sh.position.y = -2.4; g.add(sh);
  const foamG = new THREE.RingGeometry(r + 3.3, r + 4.4, 80); wobble(foamG, f, true);
  const fm = new THREE.Mesh(foamG, MAT.foam); fm.rotation.x = -Math.PI / 2; fm.position.y = -1.12; g.add(fm); foamRings.push(fm);
  // scenery kept away from plots and buildings
  const occ = I.plots.map(p => [p[0], p[1], 5.4]);
  if (I.specials) Object.values(I.specials).forEach(p => occ.push([p[0], p[1], 6]));
  const free = (x, z, rad) => occ.every(o => Math.hypot(x - o[0], z - o[1]) > o[2] + rad);
  const R = rng(idx * 977 + 13), pb = new PB();
  let placed = 0;
  for (let i = 0; i < 260 && placed < r * 2.2; i++) {
    const a = R() * Math.PI * 2, d = r * f(a) * (0.3 + R() * 0.65), x = Math.cos(a) * d, z = Math.sin(a) * d;
    const kind = R() < 0.35 ? 0 : R() < 0.5 ? 1 : R() < 0.6 ? 2 : 3, rad = kind < 2 ? 1.6 : 0.9;
    if (d > r * f(a) - 1.3 || !free(x, z, rad)) continue;
    addTree(pb, x, z, 0.75 + R() * 0.5, kind, R); occ.push([x, z, rad]); placed++;
  }
  for (let i = 0; i < 70; i++) { const x = (R() - 0.5) * 2 * r, z = (R() - 0.5) * 2 * r; if (Math.hypot(x, z) < r - 1 && free(x, z, 0.3)) pb.add('detail', G.sphS, [0xff7fb8, 0xffe14d, 0xffffff, 0xb48cff][i % 4], V(x, 0.08, z), [0.18, 0.1, 0.18]); }
  for (let i = 0; i < 6; i++) { const a = R() * Math.PI * 2, d = r * f(a) + 1.4; pb.add('body', G.dode, 0xb7b2c4, V(Math.cos(a) * d, -1.0, Math.sin(a) * d), [0.8, 0.5, 0.7], [R(), R() * 3, R()]); }
  const deco = assemble(pb); g.add(deco);
  world.add(g);
  // locked islands sit under a cloud bank
  const cover = new THREE.Group();
  const cpb = new PB();
  for (let i = 0; i < 22; i++) { const a = R() * Math.PI * 2, d = R() * r; cpb.add('body', G.ico1, 0xffffff, V(Math.cos(a) * d, 2 + R() * 3, Math.sin(a) * d), 3 + R() * 3); }
  const cm = new THREE.Mesh(cpb.geo('body'), MAT.cloud); cover.add(cm);
  cover.userData.pick = { kind: 'island', idx };
  g.add(cover);
  return { g, cover, f };
}
function buildBridge(a, b) {
  const A = ISLANDS[a], B = ISLANDS[b], d = V(B.x - A.x, 0, B.z - A.z), len = d.length(); d.normalize();
  const s = V(A.x, 0, A.z).addScaledVector(d, A.r - 0.5), e = V(B.x, 0, B.z).addScaledVector(d, -(B.r - 0.5)), L = s.distanceTo(e);
  const pb = new PB(), yaw = Math.atan2(d.x, d.z), side = V(d.z, 0, -d.x);
  const n = Math.ceil(L / 0.75);
  for (let i = 0; i <= n; i++) { const t = i / n, p = s.clone().lerp(e, t); p.y = -0.25 + Math.sin(t * Math.PI) * 0.9; pb.add('body', G.box, i % 2 ? 0xb07a45 : 0x9b6a3a, p, [3.2, 0.22, 0.6], [0, yaw, 0]); }
  const posts = Math.ceil(L / 3);
  for (let i = 0; i <= posts; i++) for (const sd of [-1, 1]) {
    const t = i / posts, p = s.clone().lerp(e, t).addScaledVector(side, sd * 1.5); p.y = -0.25 + Math.sin(t * Math.PI) * 0.9 + 0.6;
    pb.add('body', G.box, 0x7a4b25, p, [0.22, 1.2, 0.22]);
    if (i < posts) { const t2 = (i + 1) / posts, q = s.clone().lerp(e, t2).addScaledVector(side, sd * 1.5); q.y = -0.25 + Math.sin(t2 * Math.PI) * 0.9 + 1.1; const p2 = p.clone(); p2.y += 0.5; pb.seg('body', G.box, 0xe8d3a8, p2, q, 0.09); }
  }
  const g = assemble(pb); world.add(g); return g;
}
function buildCloud(R) {
  const pb = new PB(), n = 4 + Math.floor(R() * 3);
  for (let i = 0; i < n; i++) pb.add('body', G.ico1, 0xffffff, V((i - n / 2) * 2.4 + R(), R() * 1.2, (R() - 0.5) * 2.5), [2.2 + R() * 1.4, 1.6 + R(), 2 + R()]);
  const m = new THREE.Mesh(pb.geo('body'), MAT.cloud); return m;
}

/* ---------- buildings ---------- */
const HAB = {
  nature: { ground: 0x86d65c, fence: 0xc58b52, deco(pb, R) { for (let i = 0; i < 4; i++) { const a = Math.PI + 0.3 + i * 0.75; addTree(pb, Math.cos(a) * 3, Math.sin(a) * 2.9, 0.6, 2, R); } addTree(pb, -2.3, -2.3, 0.55, 0, R); for (let i = 0; i < 10; i++) pb.add('detail', G.sphS, [0xff7fb8, 0xffe14d, 0xffffff][i % 3], V((R() - 0.5) * 6, 0.36, (R() - 0.5) * 5), 0.14); } },
  fire: { ground: 0xa85f45, fence: 0x5a3b30, deco(pb, R) { pb.add('glow', G.cyl, 0xff7a1a, V(-1.6, 0.33, -1.5), [1.5, 0.04, 1.1]); pb.add('glow', G.cyl, 0xffc53d, V(-1.7, 0.35, -1.5), [0.8, 0.04, 0.55]); pb.add('body', G.cone, 0x6b4a40, V(1.7, 1.15, -2.0), [1.3, 1.8, 1.3]); pb.add('glow', G.cone, 0xff7a1a, V(1.7, 2.1, -2.0), [0.42, 0.25, 0.42]); [[2.8, 0.6], [-2.8, 0.5], [0.3, -3]].forEach(([x, z]) => pb.add('body', G.dode, 0x4e3b38, V(x, 0.5, z), 0.5 + R() * 0.2, [R(), R() * 3, R()])); } },
  water: { ground: 0xf3dfa6, fence: 0xe9f5ff, deco(pb, R) { pb.add('water', G.cyl, 0x3fb4ff, V(-0.6, 0.33, -1.4), [2.4, 0.05, 1.6]); for (let i = 0; i < 3; i++) pb.add('body', G.cyl, 0x4ec26a, V(-1.6 + i * 1.1, 0.37, -1.2 - (i % 2) * 0.6), [0.38, 0.03, 0.38]); pb.add('detail', G.sphS, 0xff9ad0, V(-0.5, 0.45, -1.2), 0.14); [[2.6, -1.8], [2.2, 1.6]].forEach(([x, z]) => pb.add('body', G.dode, 0xbab5c9, V(x, 0.5, z), 0.5)); for (let i = 0; i < 4; i++) pb.add('detail', G.coneS, 0xffb3c6, V(-2.8 + i * 0.4, 0.42, 2.0 + (i % 2) * 0.3), [0.12, 0.2, 0.12], [Math.PI / 2, 0, 0]); } },
  electric: { ground: 0xd8c38e, fence: 0x7e8798, deco(pb, R) { for (const s of [-1, 1]) { pb.add('body', G.box, 0x6b7385, V(s * 2.3, 0.45, -2.1), [0.6, 0.3, 0.6]); pb.add('body', G.cyl, 0x9aa3b5, V(s * 2.3, 1.5, -2.1), [0.14, 2.1, 0.14]); pb.add('glow', G.sph, 0xfff35c, V(s * 2.3, 2.7, -2.1), 0.38); pb.add('body', G.band, 0x6b7385, V(s * 2.3, 2.15, -2.1), 0.28, [Math.PI / 2, 0, 0]); } pb.add('trans', G.oct, 0xffe86b, V(0, 0.9, -2.8), [0.4, 0.9, 0.4]); pb.add('trans', G.oct, 0xffe86b, V(0.6, 0.6, -2.5), [0.25, 0.5, 0.25], [0, 0, 0.4]); } },
  ice: { ground: 0xeef9ff, fence: 0xbfe3f5, deco(pb, R) { [[-2.2, -2.2, 1], [-1.5, -2.7, 0.7], [2.3, -2, 0.9], [2.8, -1.2, 0.6]].forEach(([x, z, s]) => pb.add('trans', G.oct, 0xa8ecff, V(x, 0.3 + s * 0.8, z), [0.45 * s, 1.1 * s, 0.45 * s], [0, R(), (R() - 0.5) * 0.4])); [[0.4, -2.6, 1.1], [-2.8, 1, 0.8], [2.7, 1.4, 0.7]].forEach(([x, z, s]) => pb.add('detail', G.hemi, 0xffffff, V(x, 0.3, z), [s, s * 0.6, s])); } },
  shadow: { ground: 0x5d4a80, fence: 0x3a2d52, deco(pb, R) { pb.add('body', G.box, 0x2d2340, V(0, 1.3, -2.8), [0.9, 2.2, 0.9], [0, 0.6, 0]); pb.add('glow', G.cone4, 0xb48cff, V(0, 2.6, -2.8), [0.65, 0.5, 0.65], [0, 0.6, 0]); [[-2.3, -1.8], [2.4, -1.6], [-2.8, 0.8]].forEach(([x, z]) => pb.add('trans', G.oct, 0xb48cff, V(x, 0.9, z), [0.35, 0.8, 0.35], [0, R(), 0.2])); [[2.6, 0.8], [1.6, -2.6], [-1.4, -2.6]].forEach(([x, z]) => { pb.add('body', G.cyl, 0xf0e6ff, V(x, 0.55, z), [0.1, 0.5, 0.1]); pb.add('glow', G.hemi, 0x6ff0ff, V(x, 0.78, z), [0.35, 0.25, 0.35]); }); } },
};
function fence(pb, color, rad = 4.3, n = 22, gap = 0.42) {
  const pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, da = Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2)); pts.push(Math.abs(da) < gap ? null : V(Math.cos(a) * rad, 0.65, Math.sin(a) * rad)); }
  pts.forEach((p, i) => { if (!p) return; pb.add('body', G.box, color, p, [0.24, 0.85, 0.24]); const q = pts[(i + 1) % n]; if (q) for (const y of [-0.12, 0.18]) pb.seg('body', G.box, color, p.clone().add(V(0, y, 0)), q.clone().add(V(0, y, 0)), 0.1); });
}
function buildHabitat(el, lvl) {
  const pb = new PB(), H = HAB[el], R = rng(hashStr(el));
  pb.add('body', G.cyl, [0xcfc6b6, 0xa8c3e6, 0xffd25a][lvl - 1], V(0, 0.1, 0), [4.6, 0.2, 4.6]);
  pb.add('body', G.cyl, H.ground, V(0, 0.2, 0), [4.3, 0.22, 4.3]);
  fence(pb, H.fence);
  H.deco(pb, R);
  if (lvl >= 2) for (const s of [-1, 1]) { pb.add('body', G.cylS, 0xeeeeee, V(s * 1.1, 1.3, 4.3), [0.07, 2.2, 0.07]); pb.add('body', G.box, ELEMENTS[el].hex, V(s * 1.1 + s * 0.4, 2.1, 4.3), [0.8, 0.5, 0.04]); }
  if (lvl >= 3) { pb.add('body', G.cyl, 0xffd25a, V(3.2, 0.5, 2.6), [0.4, 0.5, 0.4]); pb.add('glow', G.oct, 0xffe36b, V(3.2, 1.2, 2.6), [0.3, 0.45, 0.3]); }
  return assemble(pb);
}
const CROP_GEO = {};
function cropGeo(id) {
  if (CROP_GEO[id]) return CROP_GEO[id];
  const c = CROP[id], pb = new PB(), fb = new PB();
  for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) {
    const x = -2.1 + i * 1.4, z = -1.9 + r * 1.9;
    if (id === 'mantar') { pb.add('body', G.cyl, 0xf5efe6, V(x, 0.35, z), [0.14, 0.7, 0.14]); fb.add('body', G.hemi, c.color, V(x, 0.68, z), [0.45, 0.35, 0.45]); }
    else if (id === 'misir') { pb.add('body', G.cone, 0x5cb83c, V(x, 0.7, z), [0.28, 1.4, 0.28]); fb.add('body', G.sph, c.color, V(x + 0.18, 0.85, z), [0.16, 0.36, 0.16]); }
    else { pb.add('body', G.cone, 0x4fb640, V(x, 0.4, z), [0.3, 0.8, 0.3]); pb.add('body', G.sph, 0x67cf52, V(x, 0.55, z), [0.45, 0.2, 0.45]); fb.add(id === 'yildiz' ? 'glow' : 'body', id === 'yildiz' ? G.oct : G.sph, c.color, V(x, 0.9, z), id === 'yildiz' ? [0.25, 0.32, 0.25] : 0.25); }
  }
  return (CROP_GEO[id] = { plant: assemble(pb, false), fruit: assemble(fb, false) });
}
function buildFarm() {
  const pb = new PB(), g = new THREE.Group();
  pb.add('body', G.box, 0x8a5a34, V(0, 0.2, 0), [6.8, 0.4, 6.8]);
  for (let r = 0; r < 3; r++) pb.add('body', G.box, 0x6e4526, V(0, 0.45, -1.9 + r * 1.9), [6, 0.16, 1.1]);
  const corners = [V(-3.5, 0.6, -3.5), V(3.5, 0.6, -3.5), V(3.5, 0.6, 3.5), V(-3.5, 0.6, 3.5)];
  corners.forEach((p, i) => { pb.add('body', G.box, 0xd9a066, p, [0.25, 0.8, 0.25]); if (i < 3) pb.seg('body', G.box, 0xd9a066, p, corners[i + 1], 0.12); });
  pb.add('body', G.cylS, 0x8b5a2b, V(3.0, 1.2, -3.0), [0.08, 2.2, 0.08]); pb.add('body', G.box, 0x8b5a2b, V(3.0, 1.6, -3.0), [1.4, 0.08, 0.08]);
  pb.add('body', G.sph, 0xf0d58a, V(3.0, 2.4, -3.0), 0.32); pb.add('body', G.cone, 0xd9534f, V(3.0, 2.75, -3.0), [0.45, 0.4, 0.45]); pb.add('body', G.box, 0x4a8dff, V(3.0, 1.75, -3.0), [0.5, 0.6, 0.3]);
  g.add(assemble(pb));
  const crops = new THREE.Group(); crops.position.y = 0.45; g.add(crops);
  g.userData.crops = crops; g.userData.cropId = null;
  return g;
}
function setFarmCrop(g, id) {
  const c = g.userData.crops;
  while (c.children.length) c.remove(c.children[0]);
  g.userData.cropId = id; g.userData.fruit = null;
  if (!id) return;
  const t = cropGeo(id), p = t.plant.clone(), f = t.fruit.clone();
  c.add(p); c.add(f); g.userData.plant = p; g.userData.fruit = f;
}
function buildHatchery() {
  const pb = new PB();
  pb.add('body', G.cyl, 0xd9cdb8, V(0, 0.18, 0), [4.4, 0.36, 4.4]); pb.add('body', G.cyl, 0xc4b59c, V(0, 0.5, 0), [3.2, 0.3, 3.2]);
  pb.add('body', G.band, 0xb07a45, V(0, 0.85, 0), [1.9, 1.9, 4.5], [Math.PI / 2, 0, 0]);
  pb.add('body', G.cyl, 0xe8c26a, V(0, 0.75, 0), [1.8, 0.16, 1.8]);
  pb.add('body', G.band, 0xffcf5a, V(0, 0.7, 0), [2.75, 2.75, 1.4], [Math.PI / 2, 0, 0]);
  pb.add('trans', G.hemi, 0xcff1ff, V(0, 0.68, 0), 2.7);
  for (const s of [-1, 1]) { pb.add('body', G.cylS, 0x7a6a5a, V(s * 3.6, 1.2, 1.6), [0.1, 2, 0.1]); pb.add('glow', G.sph, 0xffb347, V(s * 3.6, 2.35, 1.6), 0.3); }
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; pb.add('detail', G.sphS, [0xff7fb8, 0x8fd16a, 0x4fb2f7][i % 3], V(Math.cos(a) * 3.85, 0.45, Math.sin(a) * 3.85), [0.3, 0.12, 0.3]); }
  const g = assemble(pb), eggs = new THREE.Group(); g.add(eggs); g.userData.eggs = eggs; g.userData.sig = '';
  return g;
}
function buildBreed() {
  const pb = new PB();
  pb.add('body', G.cyl, 0xf5b8d0, V(0, 0.1, 0), [4.6, 0.2, 4.6]); pb.add('body', G.cyl, 0x9fe07a, V(0, 0.2, 0), [4.3, 0.22, 4.3]);
  pb.add('body', G.trunk, 0x8a5a3a, V(0, 2.3, -1.2), [1, 4.2, 1]);
  pb.stick('body', G.cone, 0x8a5a3a, V(0, 3.4, -1.2), V(1, 0.8, 0.2), 2.2, 0.35); pb.stick('body', G.cone, 0x8a5a3a, V(0, 3.2, -1.2), V(-1, 0.9, 0.1), 2, 0.32);
  [[0, 5.4, -1.2, 2.3], [1.8, 4.9, -0.9, 1.7], [-1.8, 4.9, -1.0, 1.7], [0.9, 6.3, -1.5, 1.5], [-1.0, 6.1, -1.6, 1.5], [0, 4.6, 0.4, 1.4]].forEach(([x, y, z, s], i) => pb.add('body', G.ico1, [0xff9ccc, 0xffb8dc, 0xff7fbf][i % 3], V(x, y, z), s));
  [[1.4, 3.9, 0.6], [-1.6, 4.0, 0.3], [0.3, 3.7, 1.4], [2.6, 4.4, -0.2], [-2.5, 4.3, -0.5]].forEach(([x, y, z]) => pb.add('glow', G.heart, 0xff4f9a, V(x, y, z), 0.32, [Math.PI, 0, 0]));
  for (const s of [-1, 1]) pb.add('body', G.cyl, 0xff8fbf, V(s * 1.7, 0.45, 1.5), [0.9, 0.3, 0.9]);
  const g = assemble(pb); g.userData.parents = []; g.userData.sig = '';
  return g;
}
function buildArena() {
  const pb = new PB();
  pb.add('body', G.cyl, 0xbfb3a0, V(0, 0.12, 0), [4.9, 0.24, 4.9]); pb.add('body', G.cyl, 0xe9d29c, V(0, 0.25, 0), [4.4, 0.2, 4.4]);
  pb.add('detail', G.cyl, 0xd9534f, V(0, 0.36, 0), [1.8, 0.03, 1.8]); pb.add('detail', G.cyl, 0xf6e7c1, V(0, 0.38, 0), [1.3, 0.03, 1.3]);
  const N = 14, pts = [];
  for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2; if (Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))) < 0.3) { pts.push(null); continue; } const p = V(Math.cos(a) * 4.1, 1.2, Math.sin(a) * 4.1); pts.push(p); pb.add('body', G.cyl, 0xe0d6c4, p, [0.32, 2, 0.32]); pb.add('body', G.box, 0xcfc3ae, p.clone().add(V(0, 1.05, 0)), [0.8, 0.25, 0.8]); }
  pts.forEach((p, i) => { const q = pts[(i + 1) % N]; if (p && q) pb.seg('body', G.box, 0xd6cbb8, p.clone().add(V(0, 1.2, 0)), q.clone().add(V(0, 1.2, 0)), 0.4); });
  for (const s of [-1, 1]) { pb.add('body', G.cylS, 0x8b5a2b, V(s * 1.3, 1.6, 4.4), [0.08, 2.8, 0.08]); pb.add('body', G.cone4, s < 0 ? 0xd9534f : 0x4a8dff, V(s * 1.3 + s * 0.45, 2.7, 4.4), [0.45, 0.9, 0.06], [0, 0, s * Math.PI / 2]); pb.add('glow', G.cone, 0xff9a2f, V(s * 2.2, 1.0, 4.0), [0.2, 0.45, 0.2]); }
  pb.stick('body', G.box, 0xc0c6d6, V(-0.6, 0.4, 0), V(0.6, 1, 0), 1.6, 0.12); pb.stick('body', G.box, 0xc0c6d6, V(0.6, 0.4, 0), V(-0.6, 1, 0), 1.6, 0.12);
  return assemble(pb);
}

/* ---------- world assembly + sync with state ---------- */
function initWorld() {
  ISLANDS.forEach((I, i) => {
    const v = buildIsland(I, i); islandViews.push(v);
    I.plots.forEach((p, j) => {
      const pad = new THREE.Mesh(G.cyl, toon({ color: 0x9be37a })); pad.scale.set(4.2, 0.06, 4.2);
      pad.position.set(I.x + p[0], 0.02, I.z + p[1]); pad.receiveShadow = true; world.add(pad); padViews.set(i + '-' + j, pad);
    });
  });
  BRIDGES.forEach(([a, b]) => bridgeViews.push({ a, b, g: buildBridge(a, b) }));
  const S = ISLANDS[0].specials, put = (g, key, pos) => { g.position.set(pos[0], 0, pos[1]); g.userData.pick = { kind: key }; world.add(g); pickables.push(g); special[key] = g; };
  put(buildHatchery(), 'hatchery', S.hatchery); put(buildBreed(), 'breed', S.breed); put(buildArena(), 'arena', S.arena);
  const R = rng(4242);
  for (let i = 0; i < 12; i++) { const c = buildCloud(R); c.position.set((R() - 0.5) * 300, 26 + R() * 12, (R() - 0.5) * 260); c.userData.speed = 1 + R() * 1.5; scene.add(c); clouds.push(c); }
}
function syncWorld() {
  islandViews.forEach((v, i) => { v.cover.visible = !state.islands[i]; const idx = pickables.indexOf(v.cover); if (!state.islands[i] && idx < 0) pickables.push(v.cover); if (state.islands[i] && idx >= 0) pickables.splice(idx, 1); });
  bridgeViews.forEach(b => { b.g.visible = state.islands[b.a] && state.islands[b.b]; });
  padViews.forEach((pad, k) => { pad.visible = state.islands[+k.split('-')[0]] && !state.plots[k]; });
  // plots
  for (const [k, v] of plotViews) { const p = state.plots[k]; const sig = p ? p.type + (p.el || '') + (p.lvl || '') : ''; if (sig !== v.sig) { world.remove(v.g); pickables.splice(pickables.indexOf(v.g), 1); plotViews.delete(k); } }
  for (const [k, p] of Object.entries(state.plots)) {
    if (plotViews.has(k)) continue;
    const g = p.type === 'hab' ? buildHabitat(p.el, p.lvl) : buildFarm(), pos = plotPos(k);
    g.position.set(pos.x, 0, pos.z); g.userData.pick = { kind: 'plot', key: k };
    world.add(g); pickables.push(g);
    plotViews.set(k, { g, sig: p.type + (p.el || '') + (p.lvl || '') });
  }
  // monsters
  for (const [uid, v] of monViews) {
    const m = getMon(uid);
    if (!m || !m.hab || m.hab !== v.hab || stageOf(m.lvl) !== v.stage) { world.remove(v.obj); pickables.splice(pickables.indexOf(v.obj), 1); monViews.delete(uid); }
  }
  for (const m of state.monsters) {
    if (!m.hab || monViews.has(m.uid) || !state.plots[m.hab]) continue;
    const st = stageOf(m.lvl), obj = makeMonster(m.sp, st), c = plotPos(m.hab);
    const a = Math.random() * Math.PI * 2, r = Math.random() * 2.2;
    obj.position.set(c.x + Math.cos(a) * r, 0.32, c.z + Math.sin(a) * r);
    obj.userData.pick = { kind: 'mon', uid: m.uid };
    obj.traverse(o => { o.userData.pick = obj.userData.pick; });
    world.add(obj); pickables.push(obj);
    obj.userData.anim.pop = 0.01; tween(0.45, k => { obj.userData.anim.pop = Math.max(0.01, easeBack(k)); });
    monViews.set(m.uid, { obj, hab: m.hab, stage: st, cx: c.x, cz: c.z, tx: obj.position.x, tz: obj.position.z, wait: Math.random() * 2 });
  }
  // eggs in the hatchery nest
  const hg = special.hatchery, sig = state.eggs.map(e => e.sp).join(',');
  if (hg.userData.sig !== sig) {
    const eg = hg.userData.eggs; while (eg.children.length) eg.remove(eg.children[0]);
    const spots = [[-0.7, -0.4], [0.7, -0.4], [-0.6, 0.6], [0.6, 0.6]];
    state.eggs.forEach((e, i) => { const o = makeEgg(e.sp); o.scale.setScalar(0.75); o.position.set(spots[i][0], 0.8, spots[i][1]); eg.add(o); });
    hg.userData.sig = sig;
  }
  // parents resting on the cushions while breeding
  const bg = special.breed, bsig = state.breed ? state.breed.a + ',' + state.breed.b : '';
  if (bg.userData.sig !== bsig) {
    bg.userData.parents.forEach(o => bg.remove(o)); bg.userData.parents = [];
    if (state.breed) [state.breed.aSp, state.breed.bSp].forEach((spId, i) => { const st = stageOf(i ? state.breed.bLvl : state.breed.aLvl), o = makeMonster(spId, st, 0.75); o.position.set(i ? 1.7 : -1.7, 0.6, 1.5); o.rotation.y = i ? -0.6 : 0.6; bg.add(o); bg.userData.parents.push(o); });
    bg.userData.sig = bsig;
  }
  // farm crops
  for (const [k, v] of plotViews) { const p = state.plots[k]; if (p.type === 'farm' && v.g.userData.cropId !== (p.crop || null)) setFarmCrop(v.g, p.crop || null); }
}

/* ---------- per-frame world animation ---------- */
let heartT = 0;
function updateWorld(dt, t) {
  const pa = waterGeo.attributes.position;
  for (let i = 0; i < pa.count; i++) { const x = wBase[i * 3], y = wBase[i * 3 + 1]; pa.array[i * 3 + 2] = Math.sin(x * 0.09 + t * 1.1) * 0.22 + Math.cos(y * 0.11 + t * 1.4) * 0.18 + Math.sin((x + y) * 0.05 + t * 0.7) * 0.12; }
  pa.needsUpdate = true;
  foamRings.forEach((f, i) => { const s = 1 + Math.sin(t * 1.2 + i) * 0.012; f.scale.set(s, s, 1); });
  MAT.foam.opacity = 0.38 + Math.sin(t * 1.2) * 0.12;
  clouds.forEach(c => { c.position.x += c.userData.speed * dt; if (c.position.x > 170) c.position.x = -170; });
  islandViews.forEach((v, i) => { if (v.cover.visible) v.cover.position.y = Math.sin(t * 0.6 + i) * 0.4; });
  for (const v of monViews.values()) {
    const o = v.obj; let walking = false;
    if (v.wait > 0) {
      v.wait -= dt; o.rotation.y += (0 - o.rotation.y) * Math.min(1, dt * 2);
      if (v.wait <= 0) { const a = Math.random() * Math.PI * 2, r = Math.random() * 2.6; v.tx = v.cx + Math.cos(a) * r; v.tz = v.cz + Math.sin(a) * r * 0.85; }
    } else {
      const dx = v.tx - o.position.x, dz = v.tz - o.position.z, d = Math.hypot(dx, dz);
      if (d < 0.08) v.wait = 2 + Math.random() * 4;
      else { const sp = Math.min(d, 1.1 * dt); o.position.x += dx / d * sp; o.position.z += dz / d * sp; let h = Math.atan2(dx, dz) - o.rotation.y; h = Math.atan2(Math.sin(h), Math.cos(h)); o.rotation.y += h * Math.min(1, dt * 6); walking = true; }
    }
    animMonster(o, t, walking);
  }
  special.hatchery.userData.eggs.children.forEach((e, i) => { const egg = state.eggs[i]; const ready = egg && now() >= egg.end; e.rotation.z = Math.sin(t * (ready ? 14 : 2) + i) * (ready ? 0.18 : 0.05); });
  special.breed.userData.parents.forEach(o => animMonster(o, t, false, true));
  if (state.breed) { heartT -= dt; if (heartT <= 0) { heartT = 0.45; const p = special.breed.position.clone().add(V((Math.random() - 0.5) * 2, 2.2, 1.5)); burst(scene, p, [0xff4f9a, 0xff8fbf], 1, 1.2, 0.22, 2, 0.6, G.heart); } }
  for (const [k, v] of plotViews) {
    const p = state.plots[k]; if (p.type !== 'farm' || !p.crop || !v.g.userData.plant) continue;
    const prog = clamp((now() - p.start) / (p.end - p.start), 0, 1);
    v.g.userData.plant.scale.set(1, 0.15 + prog * 0.85, 1); v.g.userData.fruit.visible = prog >= 1;
    if (prog >= 1) v.g.userData.fruit.position.y = Math.abs(Math.sin(t * 3)) * 0.1;
  }
}

/* ---------- camera ---------- */
function updateCamera(dt) {
  if (CAM.anim) { const a = CAM.anim; a.t += dt; const k = ease(Math.min(1, a.t / a.dur)); CAM.tx = a.x0 + (a.x1 - a.x0) * k; CAM.tz = a.z0 + (a.z1 - a.z0) * k; CAM.dist = a.d0 + (a.d1 - a.d0) * k; if (k >= 1) CAM.anim = null; }
  else { CAM.tx += CAM.vx * dt; CAM.tz += CAM.vz * dt; CAM.vx *= Math.pow(0.02, dt); CAM.vz *= Math.pow(0.02, dt); }
  CAM.tx = clamp(CAM.tx, -66, 66); CAM.tz = clamp(CAM.tz, -70, 42); CAM.dist = clamp(CAM.dist, CAM.MIN, CAM.MAX);
  const pitch = 0.78 + (CAM.dist - CAM.MIN) / (CAM.MAX - CAM.MIN) * 0.3;
  camera.position.set(CAM.tx, Math.sin(pitch) * CAM.dist, CAM.tz + Math.cos(pitch) * CAM.dist);
  camera.lookAt(CAM.tx, 0, CAM.tz);
  sun.position.set(CAM.tx + 35, 70, CAM.tz + 30); sun.target.position.set(CAM.tx, 0, CAM.tz);
}
function focusOn(x, z, d) { CAM.anim = { t: 0, dur: 0.7, x0: CAM.tx, z0: CAM.tz, d0: CAM.dist, x1: x, z1: z + 2, d1: d || CAM.dist }; CAM.vx = CAM.vz = 0; }
function panBy(dx, dy) {
  const k = 2 * CAM.dist * Math.tan(camera.fov * Math.PI / 360) / innerHeight;
  CAM.tx -= dx * k; CAM.tz -= dy * k * 1.25; CAM.anim = null;
  return [-dx * k, -dy * k * 1.25];
}
const raycaster = new THREE.Raycaster(), _ndc = new THREE.Vector2();
function pickAt(x, y) {
  _ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1);
  raycaster.setFromCamera(_ndc, camera);
  const hits = raycaster.intersectObjects(pickables, true);
  for (const h of hits) { let o = h.object; while (o && !o.userData.pick) o = o.parent; if (o && o.visible !== false) return o.userData.pick; }
  return null;
}

/* ---------- HTML labels pinned to 3D points ---------- */
const labels = new Map(), _lv = V(0, 0, 0);
function setLabel(id, pos, html, cls, act, data) {
  let L = labels.get(id);
  if (!L) { const el = document.createElement('div'); $('#labels').appendChild(el); L = { el, pos: V(0, 0, 0), html: null, cls: null }; labels.set(id, L); }
  L.pos.copy(pos); L.alive = true;
  if (L.html !== html) { L.el.innerHTML = html; L.html = html; }
  if (L.cls !== cls) { L.el.className = 'bub ' + cls; L.cls = cls; }
  if (act) L.el.dataset.act = act; else delete L.el.dataset.act;
  if (data) Object.assign(L.el.dataset, data);
}
function positionLabels(cam) {
  const w = innerWidth, h = innerHeight;
  for (const L of labels.values()) {
    _lv.copy(L.pos).project(cam);
    const off = _lv.z > 1 || Math.abs(_lv.x) > 1.15 || Math.abs(_lv.y) > 1.15;
    if (L.el.hidden !== off) L.el.hidden = off;
    if (!off) L.el.style.transform = `translate(${((_lv.x * 0.5 + 0.5) * w).toFixed(1)}px,${((-_lv.y * 0.5 + 0.5) * h).toFixed(1)}px) translate(-50%,-100%)`;
  }
}
function clearLabels() { for (const L of labels.values()) L.el.remove(); labels.clear(); }
