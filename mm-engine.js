'use strict';
/* ---------- three.js core ---------- */
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const UPV = V(0, 1, 0), FWDV = V(0, 0, 1);
const qU = n => new THREE.Quaternion().setFromUnitVectors(UPV, n.clone().normalize());
const qF = n => new THREE.Quaternion().setFromUnitVectors(FWDV, n.clone().normalize());
const qE = (x, y, z) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));

let renderer;
try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
catch (e) { document.getElementById('loading').textContent = 'Bu cihaz 3D grafikleri (WebGL) açamadı. Donanım hızlandırmayı açıp sayfayı yenile.'; throw e; }
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setClearColor(0x000000, 0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const gradTex = new THREE.DataTexture(new Uint8Array([120, 120, 120, 255, 190, 190, 190, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
gradTex.minFilter = gradTex.magFilter = THREE.NearestFilter; gradTex.needsUpdate = true;
const toon = (o = {}) => new THREE.MeshToonMaterial(Object.assign({ gradientMap: gradTex }, o));

const MAT = {
  body: toon({ vertexColors: true }),
  glow: new THREE.MeshBasicMaterial({ vertexColors: true }),
  trans: new THREE.MeshPhongMaterial({ vertexColors: true, transparent: true, opacity: 0.72, shininess: 120, specular: 0xffffff }),
  water: new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 90, specular: 0xffffff }),
  eye: new THREE.MeshPhongMaterial({ vertexColors: true, shininess: 100, specular: 0x555555 }),
  wingO: toon({ vertexColors: true, side: THREE.DoubleSide }),
  wingT: new THREE.MeshPhongMaterial({ vertexColors: true, transparent: true, opacity: 0.58, side: THREE.DoubleSide, shininess: 100, depthWrite: false }),
  outline: new THREE.ShaderMaterial({
    uniforms: { thick: { value: 0.035 }, col: { value: new THREE.Color(0x2a1f3d) } },
    vertexShader: 'uniform float thick; void main(){ vec3 p = position + normal * thick; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }',
    fragmentShader: 'uniform vec3 col; void main(){ gl_FragColor = vec4(col, 1.0); }',
    side: THREE.BackSide,
  }),
  grass: toon({ color: 0x86dc5c }), dirt: toon({ color: 0xbd8656 }), sand: toon({ color: 0xf6e0a3 }),
  shallow: new THREE.MeshBasicMaterial({ color: 0x7fe8e3 }),
  foam: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false }),
  cloud: toon({ color: 0xffffff }),
};

/* ---------- shared geometry ---------- */
function shapeGeo(fn) { const s = new THREE.Shape(); fn(s); return new THREE.ShapeGeometry(s, 10); }
const G = {
  sphL: new THREE.SphereGeometry(1, 24, 18), sph: new THREE.SphereGeometry(1, 14, 10), sphS: new THREE.SphereGeometry(1, 8, 6),
  cone: new THREE.ConeGeometry(1, 1, 14), coneS: new THREE.ConeGeometry(1, 1, 7), cone4: new THREE.ConeGeometry(1, 1, 4),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 18), cylS: new THREE.CylinderGeometry(1, 1, 1, 7),
  torusArc: new THREE.TorusGeometry(1, 0.22, 6, 16, Math.PI), ring: new THREE.TorusGeometry(1, 0.06, 6, 48), band: new THREE.TorusGeometry(1, 0.07, 6, 40),
  oct: new THREE.OctahedronGeometry(1, 0), ico: new THREE.IcosahedronGeometry(1, 0), ico1: new THREE.IcosahedronGeometry(1, 1),
  dode: new THREE.DodecahedronGeometry(1, 0), hemi: new THREE.SphereGeometry(1, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2), box: new THREE.BoxGeometry(1, 1, 1),
  trunk: new THREE.CylinderGeometry(0.55, 0.95, 1, 10),
  batWing: shapeGeo(s => { s.moveTo(0, 0); s.quadraticCurveTo(0.5, 0.95, 1.7, 1.15); s.quadraticCurveTo(1.55, 0.7, 1.75, 0.3); s.quadraticCurveTo(1.35, 0.38, 1.2, 0); s.quadraticCurveTo(0.95, 0.18, 0.75, -0.25); s.quadraticCurveTo(0.45, 0, 0, 0); }),
  fairyWing: shapeGeo(s => { s.moveTo(0, 0); s.bezierCurveTo(0.2, 1.3, 1.5, 1.5, 1.35, 0.55); s.bezierCurveTo(1.25, 0.15, 0.55, 0.08, 0, 0); s.bezierCurveTo(0.65, -0.05, 1.05, -0.55, 0.7, -0.85); s.bezierCurveTo(0.35, -1, 0.08, -0.45, 0, 0); }),
  featherWing: shapeGeo(s => { s.moveTo(0, 0); s.quadraticCurveTo(0.6, 1.1, 1.6, 1); s.quadraticCurveTo(1.7, 0.75, 1.45, 0.62); s.quadraticCurveTo(1.55, 0.4, 1.25, 0.32); s.quadraticCurveTo(1.3, 0.1, 1, 0.06); s.quadraticCurveTo(1, -0.15, 0.7, -0.12); s.quadraticCurveTo(0.4, -0.2, 0, 0); }),
};
(() => {
  const h = new THREE.Shape();
  h.moveTo(0, -0.6); h.bezierCurveTo(-0.2, -0.4, -1, -0.1, -1, 0.4); h.bezierCurveTo(-1, 0.85, -0.45, 1.05, 0, 0.6);
  h.bezierCurveTo(0.45, 1.05, 1, 0.85, 1, 0.4); h.bezierCurveTo(1, -0.1, 0.2, -0.4, 0, -0.6);
  G.heart = new THREE.ExtrudeGeometry(h, { depth: 0.35, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.12, bevelSegments: 2, curveSegments: 10 });
  G.heart.center();
})();

/* ---------- part builder: many primitives merged into one vertex-coloured mesh per material ---------- */
function mergeParts(parts, off) {
  let total = 0; const gs = [];
  for (const p of parts) {
    const g = p.geo.index ? p.geo.toNonIndexed() : p.geo.clone();
    g.applyMatrix4(p.m); if (off) g.translate(-off.x, -off.y, -off.z);
    gs.push([g, p.c]); total += g.attributes.position.count;
  }
  const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), col = new Float32Array(total * 3);
  let o = 0;
  for (const [g, c] of gs) {
    const n = g.attributes.position.count;
    pos.set(g.attributes.position.array, o * 3);
    if (g.attributes.normal) nor.set(g.attributes.normal.array, o * 3);
    for (let i = 0; i < n; i++) { const j = (o + i) * 3; col[j] = c.r; col[j + 1] = c.g; col[j + 2] = c.b; }
    o += n; g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  out.computeBoundingSphere(); out.computeBoundingBox();
  return out;
}
class PB {
  constructor() { this.L = {}; }
  add(list, geo, color, pos, scl, q) {
    const p = Array.isArray(pos) ? V(pos[0], pos[1], pos[2]) : pos;
    const s = typeof scl === 'number' ? V(scl, scl, scl) : Array.isArray(scl) ? V(scl[0], scl[1], scl[2]) : (scl || V(1, 1, 1));
    const qq = !q ? new THREE.Quaternion() : Array.isArray(q) ? qE(q[0], q[1], q[2]) : q;
    (this.L[list] || (this.L[list] = [])).push({ geo, m: new THREE.Matrix4().compose(p, qq, s), c: new THREE.Color(color) });
  }
  stick(list, geo, color, base, dir, len, rad, radZ) { const d = dir.clone().normalize(); this.add(list, geo, color, base.clone().addScaledVector(d, len / 2), [rad, len, radZ == null ? rad : radZ], qU(d)); }
  seg(list, geo, color, a, b, rad) { const d = b.clone().sub(a); this.stick(list, geo, color, a, d, d.length(), rad); }
  geo(list, off) { const a = this.L[list]; return a && a.length ? mergeParts(a, off) : null; }
}
function assemble(pb, shadow = true) {
  const g = new THREE.Group();
  const add = (list, mat, cast) => { const geo = pb.geo(list); if (!geo) return; const m = new THREE.Mesh(geo, mat); m.castShadow = cast && shadow; m.receiveShadow = true; g.add(m); };
  add('body', MAT.body, true); add('detail', MAT.body, false); add('water', MAT.water, false); add('glow', MAT.glow, false); add('trans', MAT.trans, false);
  return g;
}
const darken = (c, k = 0.82) => new THREE.Color(c).multiplyScalar(k).getHex();

/* ---------- monster bodies ---------- */
const SHAPES = {
  round: { body: [[0, 1, 0], [1.05, 1, 1]], belly: [[0, 0.55, 0.45], [0.66, 0.5, 0.5]], arms: [0.95, 0.72, 0.2], feet: [0.45, 0, 0.35], tail: [0, 0.5, -0.85], wing: [0.32, 1.3, -0.72], eyeDy: 0.22, mouthDy: -0.22 },
  blob: { body: [[0, 0.85, 0], [1.25, 0.88, 1.1]], belly: [[0, 0.45, 0.5], [0.9, 0.42, 0.62]], arms: [1.18, 0.55, 0.25], feet: [0.6, 0, 0.5], tail: [0, 0.4, -1], wing: [0.4, 1.1, -0.85], eyeDy: 0.3, mouthDy: -0.05 },
  bean: { body: [[0, 1.3, 0], [0.82, 1.3, 0.78]], belly: [[0, 0.85, 0.33], [0.56, 0.7, 0.48]], arms: [0.78, 1.0, 0.15], feet: [0.38, 0, 0.3], tail: [0, 0.6, -0.68], wing: [0.3, 1.75, -0.6], eyeDy: 0.32, mouthDy: 0.05 },
  chibi: { body: [[0, 0.72, 0], [0.72, 0.7, 0.66]], head: [[0, 1.72, 0], [0.98, 0.9, 0.9]], belly: [[0, 0.62, 0.3], [0.5, 0.48, 0.42]], arms: [0.68, 0.75, 0.12], feet: [0.34, 0, 0.28], tail: [0, 0.42, -0.58], wing: [0.28, 1.05, -0.55], eyeDy: 0.05, mouthDy: -0.32 },
};
const RAINBOW = [0xff6b6b, 0xffc93c, 0x5cd65c, 0x4fb2f7, 0xb085ff];

function buildTemplate(sp, stage) {
  const S = SHAPES[sp.shape], pb = new PB(), tb = new PB(), wb = new PB();
  const R = rng(hashStr(sp.id));
  const ef = [1.28, 1.12, 1, 1][stage], hf = [0.62, 0.85, 1.1, 1.2][stage], wf = [0.42, 0.65, 0.9, 1][stage], ts = [0.7, 0.85, 1, 1.08][stage];
  const scale = [0.72, 0.88, 1.05, 1.12][stage];
  const bc = V(...S.body[0]), bs = V(...S.body[1]);
  pb.add('body', G.sphL, sp.c, bc, bs);
  let hc = bc, hs = bs;
  if (S.head) { hc = V(...S.head[0]); hs = V(...S.head[1]); pb.add('body', G.sphL, sp.c, hc, hs); }
  const onE = (c, s) => (x, y, z, out = 1) => { const d = V(x, y, z).normalize(); return { p: d.clone().multiply(s).multiplyScalar(out).add(c), n: V(d.x / s.x, d.y / s.y, d.z / s.z).normalize() }; };
  const onHead = onE(hc, hs), onBody = onE(bc, bs);

  if (sp.belly) pb.add(sp.bellyGlow ? 'glow' : 'detail', G.sph, sp.belly, V(...S.belly[0]), V(...S.belly[1]));
  if (sp.spots) for (let i = 0; i < 7; i++) {
    const th = R() * Math.PI * 2, ph = 0.25 + R() * 1.25;
    let x = Math.cos(th) * Math.sin(ph), y = Math.cos(ph), z = Math.sin(th) * Math.sin(ph);
    if (z > 0.2) z = -z;
    const { p, n } = (S.head && R() < 0.5 ? onHead : onBody)(x, y, z, 0.98);
    const s = 0.1 + R() * 0.11;
    pb.add(sp.spotsGlow ? 'glow' : 'detail', G.sphS, sp.spots === 'rainbow' ? RAINBOW[i % 5] : sp.spots, p, [s, s, s * 0.35], qF(n));
  }
  const [ax, ay, az] = S.arms, [fx, fy, fz] = S.feet;
  for (const s of [-1, 1]) {
    pb.add('body', G.sph, sp.c, V(s * ax, ay, az), [0.2, 0.33, 0.2], [0.3, 0, s * 0.75]);
    pb.add('body', G.sph, darken(sp.c, 0.88), V(s * fx, fy + 0.06, fz), [0.27, 0.15, 0.35]);
  }
  // eyes (own mesh so they can blink)
  const ed = sp.eyes === 1 ? [[0, S.eyeDy + 0.05, 1, 1.6]] : sp.eyes === 3 ? [[-0.42, S.eyeDy - 0.06, 0.9, 0.85], [0.42, S.eyeDy - 0.06, 0.9, 0.85], [0, S.eyeDy + 0.36, 0.93, 0.78]] : [[-0.37, S.eyeDy, 0.92, 1], [0.37, S.eyeDy, 0.92, 1]];
  const er = 0.24 * ef * Math.min(hs.x, hs.y, 1.05);
  const eyePivot = V(0, 0, 0);
  const pts = ed.map(e => { const r = onHead(e[0], e[1], e[2], 0.95); eyePivot.add(r.p); return r; });
  eyePivot.divideScalar(pts.length);
  ed.forEach((e, i) => {
    const { p, n } = pts[i], r = er * e[3], q = qF(n);
    pb.add('eyes', G.sph, 0xffffff, p, [r, r * 1.12, r * 0.6], q);
    if (sp.iris) pb.add('eyes', G.sph, sp.iris, p.clone().addScaledVector(n, r * 0.3), [r * 0.72, r * 0.82, r * 0.36], q);
    const pp = p.clone().addScaledVector(n, r * (sp.iris ? 0.4 : 0.32));
    pb.add('eyes', G.sph, sp.pupil || 0x241a3d, pp, [r * (sp.iris ? 0.42 : 0.6), r * (sp.iris ? 0.55 : 0.72), r * 0.32], q);
    const side = V(1, 0, 0).applyQuaternion(q), up = V(0, 1, 0).applyQuaternion(q);
    pb.add('eyes', G.sphS, 0xffffff, pp.clone().addScaledVector(n, r * 0.22).addScaledVector(side, r * 0.2).addScaledVector(up, r * 0.25), r * 0.2);
    pb.add('eyes', G.sphS, 0xffffff, pp.clone().addScaledVector(n, r * 0.2).addScaledVector(side, -r * 0.15).addScaledVector(up, -r * 0.2), r * 0.09);
  });
  // mouth + cheeks
  const mo = onHead(0, S.mouthDy, 1, 1.0), mq = qF(mo.n);
  const mside = V(1, 0, 0).applyQuaternion(mq), mup = V(0, 1, 0).applyQuaternion(mq);
  const ms = 0.15 * Math.min(hs.x, 1.1) * (stage === 0 ? 0.85 : 1), MC = 0x3b1d2e;
  const arc = (pos, s) => pb.add('detail', G.torusArc, MC, pos.clone().addScaledVector(mo.n, 0.02), [s, s, s], mq.clone().multiply(qE(0, 0, Math.PI)));
  if (sp.mouth === 'smile' || sp.mouth === 'fang') {
    arc(mo.p.clone().addScaledVector(mup, ms * 0.6), ms);
    if (sp.mouth === 'fang') for (const s of [-1, 1]) pb.add('detail', G.coneS, 0xffffff, mo.p.clone().addScaledVector(mside, s * ms * 0.55).addScaledVector(mup, -ms * 0.42).addScaledVector(mo.n, 0.03), [ms * 0.25, ms * 0.55, ms * 0.25], mq.clone().multiply(qE(Math.PI, 0, 0)));
  } else if (sp.mouth === 'open') {
    pb.add('detail', G.sph, MC, mo.p, [ms, ms * 0.75, ms * 0.35], mq);
    pb.add('detail', G.sph, 0xff7a9a, mo.p.clone().addScaledVector(mup, -ms * 0.3).addScaledVector(mo.n, ms * 0.12), [ms * 0.6, ms * 0.35, ms * 0.25], mq);
  } else if (sp.mouth === 'cat') {
    for (const s of [-1, 1]) arc(mo.p.clone().addScaledVector(mside, s * ms * 0.5).addScaledVector(mup, ms * 0.4), ms * 0.5);
  }
  for (const s of [-1, 1]) { const c = onHead(s * 0.62, S.mouthDy + 0.12, 0.78, 0.99); pb.add('detail', G.sphS, 0xff8fb1, c.p, [0.15 * hs.x, 0.09, 0.05], qF(c.n)); }

  const k8 = Math.max(hf, 0.8), k7 = Math.max(hf, 0.7);
  const HD = {
    horns() { for (const s of [-1, 1]) { const b = onHead(0.48 * s, 0.85, 0.05, 0.9); pb.stick('body', G.cone, sp.horn || 0xfff1c9, b.p, V(0.5 * s, 1, -0.2), 0.62 * hf, 0.15 * k8); } },
    flame() { const t = onHead(0, 1, 0, 0.85).p, k = Math.max(hf, 0.75); pb.add('glow', G.cone, 0xff7b21, t.clone().add(V(0, 0.38 * k, -0.05)), [0.3 * k, 0.85 * k, 0.3 * k]); pb.add('glow', G.cone, 0xffd84a, t.clone().add(V(0, 0.3 * k, 0.08)), [0.18 * k, 0.55 * k, 0.18 * k]); for (const s of [-1, 1]) pb.add('glow', G.cone, 0xff5a1f, t.clone().add(V(0.22 * s * k, 0.2 * k, -0.05)), [0.14 * k, 0.45 * k, 0.14 * k], [0, 0, -s * 0.5]); },
    leaves() { for (const s of [-1, 1]) { const b = onHead(0.22 * s, 0.97, 0, 0.92), d = V(0.65 * s, 1, -0.1).normalize(); pb.add('body', G.sph, sp.leaf || 0x3fae4a, b.p.clone().addScaledVector(d, 0.42 * k7), [0.2 * k7, 0.5 * k7, 0.07 * k7], qU(d)); } },
    flower() { const b = onHead(0.55, 0.72, 0.32, 1.0), q = qU(b.n); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; pb.add('detail', G.sph, sp.flower || 0xff7fb8, b.p.clone().add(V(Math.cos(a) * 0.15 * k8, 0.02, Math.sin(a) * 0.15 * k8).applyQuaternion(q)), [0.13 * k8, 0.05 * k8, 0.09 * k8], q.clone().multiply(qE(0, -a, 0))); } pb.add('detail', G.sph, 0xffd84a, b.p.clone().addScaledVector(b.n, 0.04), 0.08 * k8); },
    fins() { for (const s of [-1, 1]) { const b = onHead(0.95 * s, 0.3, -0.05, 0.95); pb.add('body', G.sph, sp.fin || darken(sp.c), b.p.clone().add(V(0.12 * s, 0.12, 0)), [0.07 * k8, 0.42 * k8, 0.34 * k8], [0, 0, -s * 0.55]); } },
    batEars() { for (const s of [-1, 1]) { const b = onHead(0.5 * s, 0.83, 0, 0.9), d = V(0.6 * s, 1, 0).normalize(); pb.stick('body', G.cone, sp.ear || darken(sp.c), b.p, d, 0.85 * k8, 0.3 * k8, 0.1 * k8); pb.stick('detail', G.cone, 0xff9cc8, b.p.clone().add(V(0, 0, 0.06)), d, 0.6 * k8, 0.18 * k8, 0.05 * k8); } },
    antenna() { for (const s of [-1, 1]) { const b = onHead(0.3 * s, 0.95, 0, 0.93), d = V(0.38 * s, 1, 0.12).normalize(), L = 0.7 * k8; pb.stick('body', G.cylS, darken(sp.c), b.p, d, L, 0.035); pb.add('glow', G.sph, sp.glow || 0xfff04a, b.p.clone().addScaledVector(d, L), 0.13 * k8); } },
    crystals() { [[0, 1, 0, 1], [0.42, 0.88, -0.15, 0.75], [-0.38, 0.88, 0.12, 0.7], [0.08, 0.82, -0.5, 0.65]].forEach(([x, y, z, s]) => { const b = onHead(x, y, z, 0.9); pb.add('trans', G.oct, sp.crystal || 0xaef0ff, b.p.clone().addScaledVector(b.n, 0.28 * k7 * s), [0.15 * k7 * s, 0.45 * k7 * s, 0.15 * k7 * s], qU(b.n)); }); },
    snowcap() { const b = onHead(0, 1, 0, 0.92); pb.add('detail', G.hemi, 0xffffff, b.p.clone().add(V(0, -0.12, 0)), [0.62 * hs.x, 0.32, 0.62 * hs.z]); },
    mushroom() {
      const c = hc.clone().add(V(0, hs.y * 0.42, 0)), cs = V(hs.x * 1.12, hs.y * 0.8, hs.z * 1.12);
      pb.add('body', G.hemi, sp.cap || 0xff4fa3, c, cs);
      for (let i = 0; i < 7; i++) { const a = R() * Math.PI * 2, e = 0.25 + R() * 0.9; const d = V(Math.cos(a) * Math.sin(e), Math.cos(e), Math.sin(a) * Math.sin(e)); const s = 0.09 + R() * 0.08; pb.add('glow', G.sphS, 0xfff6c9, d.clone().multiply(cs).multiplyScalar(0.99).add(c), [s, s, s * 0.4], qF(V(d.x / cs.x, d.y / cs.y, d.z / cs.z).normalize())); }
      pb.add('detail', G.cyl, 0xffe9f5, c.clone().add(V(0, -0.02, 0)), [cs.x * 0.98, 0.06, cs.z * 0.98]);
    },
    lily() { const b = onHead(0, 1, 0, 0.95); pb.add('body', G.cyl, 0x4ec26a, b.p.clone().add(V(0, 0.02, 0)), [0.66, 0.05, 0.66], [0.08, 0, 0.05]); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; pb.stick('detail', G.cone, sp.flower || 0xff9ad0, b.p.clone().add(V(Math.cos(a) * 0.08, 0.06, Math.sin(a) * 0.08)), V(Math.cos(a) * 0.7, 1, Math.sin(a) * 0.7), 0.3, 0.1, 0.05); } pb.add('glow', G.sphS, 0xffe36b, b.p.clone().add(V(0, 0.12, 0)), 0.08); },
    cloud() { const t = onHead(0, 1, 0, 0.8).p; [[0, 0.3, 0, 0.42], [0.36, 0.18, 0.05, 0.32], [-0.36, 0.18, 0, 0.34], [0.15, 0.32, -0.3, 0.3], [-0.18, 0.3, -0.25, 0.3]].forEach(([x, y, z, s]) => pb.add('body', G.sph, 0xd3cdea, t.clone().add(V(x * k8, y * k8, z * k8)), s * k8)); pb.add('glow', G.box, 0xffe14d, t.clone().add(V(0.5 * k8, 0.1, 0.2)), [0.07, 0.3, 0.07], [0, 0, 0.5]); pb.add('glow', G.box, 0xffe14d, t.clone().add(V(0.55 * k8, -0.15, 0.22)), [0.07, 0.28, 0.07], [0, 0, -0.6]); },
    crown() { const t = onHead(0, 1, 0, 0.95).p; pb.add('body', G.cyl, 0xffd23f, t.clone().add(V(0, 0.08, 0)), [0.36, 0.16, 0.36]); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; pb.add('body', G.coneS, 0xffd23f, t.clone().add(V(Math.cos(a) * 0.3, 0.28, Math.sin(a) * 0.3)), [0.08, 0.24, 0.08]); pb.add('glow', G.sphS, [0xff4fa3, 0x4fd6ff, 0x7bff7b, 0xffffff, 0xb07bff][i], t.clone().add(V(Math.cos(a) * 0.36, 0.08, Math.sin(a) * 0.36)), 0.05); } },
    puffs() { const t = onHead(0, 1, 0, 1).p; [[0.1, 0.35, 0, 0.22], [-0.25, 0.6, 0.05, 0.17], [0.18, 0.85, -0.05, 0.13]].forEach(([x, y, z, s]) => pb.add('trans', G.sph, 0xffffff, t.clone().add(V(x, y, z)), s)); },
    tuft() { [[-0.25, 0.2], [0, 0.3], [0.25, 0.2]].forEach(([x, z], i) => { const b = onHead(x, 0.95, z * 0.5, 0.92); pb.stick('body', G.cone, sp.tuft || darken(sp.c), b.p, V(x * 1.2, 1, 0.35), (i === 1 ? 0.5 : 0.38) * k8, 0.1 * k8); }); },
    tentacles() { for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + 0.3; const b = onHead(Math.cos(a) * 0.45, 0.85, Math.sin(a) * 0.45 - 0.1, 0.92); pb.stick('body', G.cone, sp.spots || darken(sp.c), b.p, V(Math.cos(a) * 0.9, 1, Math.sin(a) * 0.9), 0.6 * k8, 0.12 * k8); } },
    bulb() { const b = onHead(0, 0.92, 0.25, 0.95), d = V(0, 1, 0.7).normalize(), L = 0.55 * k8; pb.stick('body', G.cylS, darken(sp.c), b.p, d, L, 0.04); pb.add('glow', G.sph, sp.glow || 0xfff36b, b.p.clone().addScaledVector(d, L), 0.16 * k8); },
    bubble() { const t = onHead(0.4, 0.8, 0.2, 1.05).p; pb.add('trans', G.sph, 0xdaf4ff, t.clone().add(V(0.25, 0.4, 0)), 0.2); pb.add('trans', G.sph, 0xdaf4ff, t.clone().add(V(0.45, 0.75, 0.05)), 0.11); },
  };
  (sp.head || []).forEach(h => HD[h] && HD[h]());

  // back ridge: adults grow spikes even if the species has none
  const back = sp.back || (stage >= 2 ? 'ridge' : null);
  if (back) {
    const n = back === 'ridge' ? 3 : 4;
    for (let i = 0; i < n; i++) {
      const ph = 0.55 + i * (1.2 / (n - 1)), b = onBody(0, Math.cos(ph), -Math.sin(ph), 0.92), L = (back === 'ridge' ? 0.28 : 0.42) * hf;
      if (back === 'crystals') pb.add('trans', G.oct, sp.crystal || 0xaef0ff, b.p.clone().addScaledVector(b.n, L * 0.6), [0.12, L, 0.12], qU(b.n));
      else pb.stick('body', G.cone, sp.spike || sp.horn || darken(sp.c), b.p, b.n, L + 0.05, 0.13);
    }
  }
  // tail, built around its own pivot so it can wag
  const TC = sp.c, O = V(0, 0, 0);
  const TL = {
    flame() { const d = V(0, 0.4, -1).normalize(); tb.stick('body', G.cone, TC, O, d, 1.15 * ts, 0.22 * ts); const e = d.clone().multiplyScalar(1.1 * ts); tb.add('glow', G.cone, 0xff7b21, e.clone().add(V(0, 0.2 * ts, 0)), [0.2 * ts, 0.55 * ts, 0.2 * ts]); tb.add('glow', G.cone, 0xffd84a, e.clone().add(V(0, 0.14 * ts, 0.03)), [0.12 * ts, 0.36 * ts, 0.12 * ts]); },
    lizard() { const d = V(0, 0.25, -1).normalize(); tb.stick('body', G.cone, TC, O, d, 1.4 * ts, 0.26 * ts); tb.add('body', G.oct, sp.wing || darken(TC), d.clone().multiplyScalar(1.38 * ts), [0.06 * ts, 0.26 * ts, 0.3 * ts]); },
    leaf() { const d = V(0, 0.5, -1).normalize(); tb.stick('body', G.cone, TC, O, d, 0.9 * ts, 0.17 * ts); tb.add('body', G.sph, sp.leaf || 0x3fae4a, d.clone().multiplyScalar(0.95 * ts).add(V(0, 0.12, -0.2 * ts)), [0.08 * ts, 0.32 * ts, 0.5 * ts], [0.5, 0, 0]); },
    fish() { const d = V(0, 0.18, -1).normalize(); tb.stick('body', G.cone, TC, O, d, 0.75 * ts, 0.3 * ts); const e = d.clone().multiplyScalar(0.72 * ts); for (const s of [-1, 1]) tb.add('body', G.sph, sp.fin || darken(TC), e.clone().add(V(0, s * 0.2 * ts, -0.12 * ts)), [0.06 * ts, 0.36 * ts, 0.24 * ts], [s * 0.7, 0, 0]); },
    bolt() { const p = [V(0, 0, 0), V(0, 0.35, -0.42), V(0, 0.12, -0.66), V(0, 0.62, -1.1)].map(v => v.multiplyScalar(ts)); for (let i = 0; i < 3; i++) tb.seg('body', G.box, sp.boltC || 0xffd23f, p[i], p[i + 1], 0.15 * ts); tb.stick('body', G.coneS, sp.boltC || 0xffd23f, p[3], p[3].clone().sub(p[2]), 0.35 * ts, 0.16 * ts); },
    pom() { const d = V(0, 0.3, -1).normalize(); tb.stick('body', G.cone, TC, O, d, 0.55 * ts, 0.15 * ts); tb.add(sp.pomGlow ? 'glow' : 'body', G.ico1, sp.pom || 0xffffff, d.clone().multiplyScalar(0.6 * ts), 0.32 * ts); },
    tentacles() { [-0.55, 0, 0.55].forEach(x => tb.stick('body', G.cone, TC, V(x * 0.3, 0, 0), V(x, -0.15, -1), 0.95 * ts, 0.14 * ts)); },
  };
  if (TL[sp.tail]) TL[sp.tail]();
  const wingType = sp.wings || 'none';
  if (wingType !== 'none') wb.add('wing', wingType === 'bat' ? G.batWing : wingType === 'fairy' ? G.fairyWing : G.featherWing, sp.wing || 0xffffff, O, [wf, wf, wf]);
  if (stage === 3) pb.add('glow', G.ring, 0xfff3a0, V(0, 0.05, 0), [1.6, 1.6, 1.6], [Math.PI / 2, 0, 0]);

  const t = { body: pb.geo('body'), detail: pb.geo('detail'), glow: pb.geo('glow'), trans: pb.geo('trans'), eyes: pb.geo('eyes', eyePivot), tail: tb.geo('body'), tailGlow: tb.geo('glow'), wing: wb.geo('wing') };
  let top = 0;
  ['body', 'glow', 'trans'].forEach(k => { if (t[k]) top = Math.max(top, t[k].boundingBox.max.y); });
  return Object.assign(t, { eyePivot, tailPivot: V(...S.tail), wingPivot: V(...S.wing), wingType, scale, height: top * scale });
}
const TPL = {};
const tpl = (id, st) => TPL[id + '|' + st] || (TPL[id + '|' + st] = buildTemplate(SP[id], st));

function makeMonster(spId, stage, mul = 1) {
  const t = tpl(spId, stage), root = new THREE.Group(), inner = new THREE.Group();
  root.add(inner);
  const add = (geo, mat, parent, cast) => { if (!geo) return null; const m = new THREE.Mesh(geo, mat); m.castShadow = !!cast; parent.add(m); return m; };
  add(t.body, MAT.body, inner, true); add(t.body, MAT.outline, inner); add(t.detail, MAT.body, inner); add(t.glow, MAT.glow, inner); add(t.trans, MAT.trans, inner);
  const eyes = add(t.eyes, MAT.eye, inner); if (eyes) eyes.position.copy(t.eyePivot);
  const tail = new THREE.Group(); tail.position.copy(t.tailPivot); inner.add(tail);
  add(t.tail, MAT.body, tail, true); add(t.tail, MAT.outline, tail); add(t.tailGlow, MAT.glow, tail);
  let wl = null, wr = null;
  if (t.wing) {
    const mat = t.wingType === 'fairy' ? MAT.wingT : MAT.wingO;
    wr = add(t.wing, mat, inner, true); wr.position.copy(t.wingPivot); wr.rotation.set(0, 0.55, 0.3);
    wl = add(t.wing, mat, inner, true); wl.position.set(-t.wingPivot.x, t.wingPivot.y, t.wingPivot.z); wl.scale.x = -1; wl.rotation.set(0, -0.55, -0.3);
  }
  const s = t.scale * mul; inner.scale.setScalar(s);
  root.userData.anim = { inner, eyes, tail, wl, wr, s, phase: Math.random() * 10, nextBlink: Math.random() * 3, blinkUntil: 0, pop: 1 };
  root.userData.height = t.height * mul;
  return root;
}
function animMonster(obj, t, walking, excited) {
  const a = obj.userData.anim; if (!a) return;
  const p = t + a.phase, s = a.s * a.pop;
  if (walking || excited) {
    const h = Math.abs(Math.sin(p * (excited ? 7 : 9))), sq = (1 - h) * 0.09;
    a.inner.position.y = h * (excited ? 0.5 : 0.25);
    a.inner.scale.set(s * (1 + sq), s * (1 - sq), s * (1 + sq));
  } else {
    const b = Math.sin(p * 2.2) * 0.03;
    a.inner.position.y = 0; a.inner.scale.set(s * (1 - b * 0.5), s * (1 + b), s * (1 - b * 0.5));
  }
  if (t > a.nextBlink) { a.blinkUntil = t + 0.13; a.nextBlink = t + 2 + Math.random() * 4; }
  if (a.eyes) a.eyes.scale.y = t < a.blinkUntil ? 0.12 : 1;
  a.tail.rotation.y = Math.sin(p * (walking ? 8 : 3)) * 0.4;
  if (a.wr) { const f = Math.sin(p * (walking || excited ? 10 : 3.2)) * (walking || excited ? 0.45 : 0.18); a.wr.rotation.y = 0.55 + f; a.wl.rotation.y = -0.55 - f; }
}

/* ---------- eggs ---------- */
const EGG = {};
function eggTpl(spId) {
  if (EGG[spId]) return EGG[spId];
  const sp = SP[spId], pb = new PB(), R = rng(hashStr(sp.id + 'egg')), c0 = V(0, 0.72, 0), s0 = V(0.55, 0.72, 0.55);
  pb.add('body', G.sphL, sp.c, c0, s0);
  for (let i = 0; i < 9; i++) {
    const th = R() * Math.PI * 2, ph = 0.4 + R() * 2.2, d = V(Math.cos(th) * Math.sin(ph), Math.cos(ph), Math.sin(th) * Math.sin(ph)), r = 0.09 + R() * 0.1;
    const col = sp.spots === 'rainbow' ? RAINBOW[i % 5] : (sp.spots || sp.belly);
    pb.add('detail', G.sphS, col, d.clone().multiply(s0).multiplyScalar(0.985).add(c0), [r, r, r * 0.4], qF(V(d.x / s0.x, d.y / s0.y, d.z / s0.z).normalize()));
  }
  if (sp.els.length > 1) pb.add('detail', G.band, ELEMENTS[sp.els[1]].hex, c0, [0.555, 0.555, 0.555], [Math.PI / 2, 0, 0]);
  if (isLegend(sp)) pb.add('glow', G.band, 0xffd23f, c0.clone().add(V(0, 0.25, 0)), [0.5, 0.5, 0.5], [Math.PI / 2, 0, 0]);
  return (EGG[spId] = { body: pb.geo('body'), detail: pb.geo('detail'), glow: pb.geo('glow') });
}
function makeEgg(spId) {
  const t = eggTpl(spId), g = new THREE.Group();
  const m = new THREE.Mesh(t.body, MAT.body); m.castShadow = true; g.add(m);
  g.add(new THREE.Mesh(t.body, MAT.outline));
  if (t.detail) g.add(new THREE.Mesh(t.detail, MAT.body));
  if (t.glow) g.add(new THREE.Mesh(t.glow, MAT.glow));
  return g;
}

/* ---------- portraits rendered once and cached as images ---------- */
let PR = null; const PCACHE = {};
function portrait(spId, stage, egg) {
  const key = (egg ? 'egg:' : '') + spId + '|' + stage;
  if (PCACHE[key]) return PCACHE[key];
  if (!PR) {
    PR = { r: new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }), s: new THREE.Scene(), c: new THREE.PerspectiveCamera(30, 1, 0.1, 80) };
    PR.r.setPixelRatio(1); PR.r.setSize(200, 200); PR.r.setClearColor(0, 0);
    PR.s.add(new THREE.HemisphereLight(0xffffff, 0xb0a0d0, 0.62));
    const d = new THREE.DirectionalLight(0xffffff, 0.68); d.position.set(3, 6, 8); PR.s.add(d);
    PR.s.add(new THREE.AmbientLight(0xffffff, 0.12));
  }
  const obj = egg ? makeEgg(spId) : makeMonster(spId, stage);
  obj.rotation.y = egg ? 0 : 0.42;
  PR.s.add(obj); obj.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj), size = box.getSize(V(0, 0, 0)), c = box.getCenter(V(0, 0, 0));
  const dim = Math.max(size.y, size.x * 0.9) * 1.08, dist = (dim * 0.5) / Math.tan(15 * Math.PI / 180) + size.z * 0.5;
  PR.c.position.set(c.x, c.y + dim * 0.12, c.z + dist); PR.c.lookAt(c);
  PR.r.render(PR.s, PR.c);
  const url = PR.r.domElement.toDataURL('image/png');
  PR.s.remove(obj);
  return (PCACHE[key] = url);
}
const monImg = m => portrait(m.sp, stageOf(m.lvl));

/* ---------- tweens + particles ---------- */
const tweens = [];
function tween(dur, fn, done) { tweens.push({ t: 0, dur, fn, done }); }
const wait = (s, fn) => tween(s, () => {}, fn);
const ease = k => 1 - Math.pow(1 - k, 3);
const easeBack = k => { const c = 1.7; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
function updateTweens(dt) { for (let i = tweens.length - 1; i >= 0; i--) { const w = tweens[i]; w.t += dt; const k = Math.min(1, w.t / w.dur); w.fn(k); if (k >= 1) { tweens.splice(i, 1); if (w.done) w.done(); } } }
const particles = [], pMats = {};
const pMat = c => pMats[c] || (pMats[c] = new THREE.MeshBasicMaterial({ color: c }));
function burst(sc, pos, color, n = 16, speed = 4, size = 0.15, life = 0.8, grav = -6, geo = G.sphS) {
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(geo, pMat(Array.isArray(color) ? color[i % color.length] : color));
    m.position.copy(pos); m.scale.setScalar(size);
    const v = V(Math.random() - 0.5, Math.random() * 0.6 + 0.3, Math.random() - 0.5).normalize().multiplyScalar(speed * (0.5 + Math.random() * 0.7));
    sc.add(m); particles.push({ m, v, life, max: life, size, g: grav, sc, spin: Math.random() * 4 });
  }
}
function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]; p.life -= dt; p.v.y += p.g * dt; p.m.position.addScaledVector(p.v, dt);
    p.m.rotation.y += p.spin * dt; p.m.scale.setScalar(p.size * Math.max(0, Math.min(1, p.life / p.max * 1.5)));
    if (p.life <= 0) { p.sc.remove(p.m); particles.splice(i, 1); }
  }
}

/* ---------- sound: small synth blips, started only after a tap ---------- */
let AC = null;
function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } } return AC; }
function tone(f, dur, type = 'sine', vol = 0.12, slide = 0, delay = 0) {
  if (!state.sound) return; const a = ac(); if (!a) return;
  const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f * slide), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.05);
}
const SFX = {
  tap: () => tone(620, 0.07, 'sine', 0.06, 1.4),
  coin: () => { tone(988, 0.07, 'square', 0.04); tone(1319, 0.15, 'square', 0.04, 1, 0.06); },
  pop: () => tone(280, 0.16, 'sine', 0.14, 2.6),
  hatch: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, 'triangle', 0.1, 1, i * 0.09)),
  evolve: () => [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.22, 'triangle', 0.09, 1, i * 0.08)),
  hit: () => { tone(170, 0.16, 'sawtooth', 0.07, 0.5); tone(90, 0.12, 'square', 0.05, 0.6, 0.02); },
  win: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, 0.22, 'square', 0.05, 1, i * 0.12)),
  lose: () => [392, 330, 262].forEach((f, i) => tone(f, 0.3, 'triangle', 0.08, 1, i * 0.18)),
  err: () => tone(200, 0.15, 'square', 0.05, 0.8),
};
