'use strict';
/* ---------- utils ---------- */
const $ = s => document.querySelector(s);
const now = () => Date.now();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function fmt(n) { n = Math.floor(n); if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace('.0', '') + 'M'; if (n >= 1e4) return (n / 1e3).toFixed(n >= 1e5 ? 0 : 1).replace('.0', '') + 'B'; return n.toLocaleString('tr-TR'); }
function fmtT(ms) { let s = Math.max(0, Math.ceil(ms / 1000)); if (s < 60) return s + 'sn'; const m = Math.floor(s / 60); s %= 60; if (m < 60) return m + 'dk ' + String(s).padStart(2, '0') + 'sn'; return Math.floor(m / 60) + 'sa ' + (m % 60) + 'dk'; }

/* ---------- elements ---------- */
const ELEMENTS = {
  nature:   { name: 'Doğa',   color: '#43b549', hex: 0x5ccf4f },
  fire:     { name: 'Ateş',   color: '#ff6b3d', hex: 0xff6b3d },
  water:    { name: 'Su',     color: '#2f9bf0', hex: 0x3fa9f5 },
  electric: { name: 'Şimşek', color: '#e9a800', hex: 0xffd23f },
  ice:      { name: 'Buz',    color: '#35b5dc', hex: 0x9eeaff },
  shadow:   { name: 'Gölge',  color: '#8b5cf6', hex: 0x9b6cff },
  legend:   { name: 'Efsane', color: '#ff4fa3', hex: 0xff7fd0 },
};
const EL_KEYS = ['nature', 'fire', 'water', 'electric', 'ice', 'shadow'];
// each element is strong against two and weak to two
const STRONG = { fire: ['nature', 'ice'], water: ['fire', 'electric'], nature: ['water', 'electric'], electric: ['water', 'shadow'], ice: ['nature', 'shadow'], shadow: ['fire', 'ice'] };
const SKILLS = {
  fire: ['Alev Püskürtme', 'Volkan Patlaması'], water: ['Su Topu', 'Gelgit Dalgası'], nature: ['Yaprak Fırtınası', 'Diken Sarmaşığı'],
  electric: ['Kıvılcım Çarpması', 'Yıldırım Düşüşü'], ice: ['Buz Nefesi', 'Çığ'], shadow: ['Gölge Pençesi', 'Kâbus Dalgası'],
};

/* ---------- species: every creature is assembled from these parts ---------- */
const SPECIES = [
  { id: 'yaprakcik', name: 'Yaprakçık', els: ['nature'], shape: 'chibi', c: 0x7bd65f, belly: 0xeaf9c4, spots: 0x56b347, head: ['leaves', 'flower'], leaf: 0x3fae4a, flower: 0xff7fb8, tail: 'leaf', wings: 'fairy', wing: 0xc9ffd6, mouth: 'smile', eyes: 2, desc: 'Güneşte uyuklamayı seven, başında çiçek taşıyan minik bir filiz.' },
  { id: 'kivilcik', name: 'Kıvılcık', els: ['fire'], shape: 'round', c: 0xff7043, belly: 0xffd9a0, spots: 0xffa05a, head: ['horns', 'flame'], horn: 0xfff1c9, tail: 'flame', wings: 'bat', wing: 0xe0482f, mouth: 'fang', eyes: 2, desc: 'Hapşırınca kıvılcım saçan, kucak dolusu sıcak bir yumak.' },
  { id: 'bloblu', name: 'Bloblu', els: ['water'], shape: 'blob', c: 0x4fb2f7, belly: 0xc9ecff, spots: 0x2f8de0, head: ['fins', 'bubble'], fin: 0x2f7fd8, tail: 'fish', wings: 'none', mouth: 'open', eyes: 2, desc: 'Jöle gibi titreyen, durmadan baloncuk üfleyen bir su damlası.' },
  { id: 'zipzip', name: 'Zıpzıp', els: ['electric'], shape: 'bean', c: 0xffd43b, belly: 0xfff4b8, spots: 0xffa81f, head: ['antenna'], glow: 0xfff7a1, tail: 'bolt', boltC: 0xff9f1a, wings: 'feather', wing: 0xffe680, mouth: 'cat', eyes: 2, desc: 'Yerinde duramayan, kuyruğundan statik elektrik saçan bir enerji topu.' },
  { id: 'karli', name: 'Karlı', els: ['ice'], shape: 'round', c: 0xe4f6ff, belly: 0xffffff, spots: 0xb7e3f7, head: ['crystals', 'snowcap'], crystal: 0x9eeaff, tail: 'pom', pom: 0xffffff, wings: 'feather', wing: 0xbfe9ff, back: 'crystals', mouth: 'smile', eyes: 2, pupil: 0x1d3b73, desc: 'Nefesi kar tanesi olan, sarılmayı seven tüylü bir kartopu.' },
  { id: 'gecebas', name: 'Gecebaş', els: ['shadow'], shape: 'round', c: 0x7c52d6, belly: 0xcbb6ff, spots: 0xa98bff, head: ['batEars'], ear: 0x5a35a8, tail: 'lizard', wing: 0x4b2a8f, wings: 'bat', mouth: 'fang', eyes: 1, pupil: 0x2a0f4f, iris: 0xffd23f, desc: 'Tek kocaman gözüyle karanlıkta her şeyi gören utangaç bir gece yaratığı.' },
  { id: 'buharcik', name: 'Buharcık', els: ['fire', 'water'], shape: 'blob', c: 0x8fc9ff, belly: 0xffe3d1, spots: 0xff8a5b, head: ['puffs', 'horns'], horn: 0xffb38a, tail: 'fish', fin: 0xff8a5b, wings: 'none', mouth: 'open', eyes: 2, desc: 'Kızınca kulaklarından buhar tüten, çaydanlık kadar sevimli bir canavar.' },
  { id: 'kozyaprak', name: 'Közyaprak', els: ['fire', 'nature'], shape: 'chibi', c: 0xd9773a, belly: 0xffd08a, spots: 0x8fd16a, head: ['leaves', 'flame'], leaf: 0x6cc24a, tail: 'flame', wings: 'fairy', wing: 0xffc27a, mouth: 'smile', eyes: 2, desc: 'Sonbahar yapraklarıyla süslü, her adımında sıcak bir koku bırakan dost.' },
  { id: 'plazmo', name: 'Plazmo', els: ['fire', 'electric'], shape: 'bean', c: 0xff8a1f, belly: 0xffe46b, spots: 0xffd23f, head: ['antenna', 'tuft'], glow: 0xfff3a0, tuft: 0xff5a1f, tail: 'bolt', boltC: 0xffd23f, wings: 'bat', wing: 0xff5a1f, mouth: 'fang', eyes: 3, desc: 'Üç gözüyle aynı anda üç yöne bakan, vızıldayan bir plazma topu.' },
  { id: 'isibuz', name: 'Isıbuz', els: ['fire', 'ice'], shape: 'round', c: 0xff86b0, belly: 0xe4f6ff, spots: 0xffffff, head: ['crystals', 'flame'], crystal: 0xbfefff, tail: 'flame', wings: 'feather', wing: 0xffc6dc, back: 'crystals', mouth: 'smile', eyes: 2, desc: 'Bir yanı sıcak bir yanı soğuk; kararsız ama hep neşeli.' },
  { id: 'komurcuk', name: 'Kömürcük', els: ['fire', 'shadow'], shape: 'round', c: 0x4a3858, belly: 0xff8a3d, bellyGlow: true, spots: 0xff6a00, spotsGlow: true, head: ['horns', 'flame'], horn: 0xffa64d, tail: 'lizard', wing: 0x2e2140, wings: 'bat', mouth: 'fang', eyes: 2, iris: 0xff8a00, desc: 'Karnı köz gibi parlayan, geceleri adayı ısıtan küçük bir ocak.' },
  { id: 'nilufer', name: 'Nilüfer', els: ['water', 'nature'], shape: 'blob', c: 0x5fd8c4, belly: 0xe2fff6, spots: 0x3aa99a, head: ['lily'], flower: 0xff9ad0, tail: 'fish', fin: 0x3aa99a, wings: 'none', mouth: 'smile', eyes: 2, desc: 'Başında nilüfer taşıyan, gölde yüzmeye bayılan sakin bir canavar.' },
  { id: 'volti', name: 'Volti', els: ['water', 'electric'], shape: 'bean', c: 0x3cb8ff, belly: 0xfff3a0, spots: 0xffe14d, head: ['fins', 'antenna'], fin: 0xffd23f, glow: 0xfff7a1, tail: 'bolt', boltC: 0xffe14d, wings: 'none', mouth: 'open', eyes: 2, desc: 'Su sıçrattıkça kıvılcımlar saçan, gıdıklanmaya dayanamayan bir yılan balığı.' },
  { id: 'fokus', name: 'Fokuş', els: ['water', 'ice'], shape: 'blob', c: 0xc4e6ff, belly: 0xffffff, spots: 0x8fc6ef, head: ['tuft', 'snowcap'], tuft: 0x8fc6ef, tail: 'fish', fin: 0x8fc6ef, wings: 'none', mouth: 'cat', eyes: 2, pupil: 0x1d3b73, desc: 'Buz üstünde kayarak gezen, bıyıklı ve tombul bir fok yavrusu.' },
  { id: 'murekkep', name: 'Mürekkep', els: ['water', 'shadow'], shape: 'round', c: 0x5446b8, belly: 0xa6d6ff, spots: 0x8a7cff, head: ['tentacles'], tail: 'tentacles', wings: 'none', mouth: 'smile', eyes: 1, iris: 0x6fe3ff, pupil: 0x170d3a, desc: 'Utandığında mürekkep bulutuna saklanan derin deniz meraklısı.' },
  { id: 'isikbocek', name: 'Işıkböcek', els: ['nature', 'electric'], shape: 'chibi', c: 0x9fe25f, belly: 0xfff7b0, spots: 0x6cbf3a, head: ['antenna', 'bulb'], glow: 0xfff36b, tail: 'pom', pom: 0xfff36b, pomGlow: true, wings: 'fairy', wing: 0xf6ffb8, mouth: 'smile', eyes: 2, desc: 'Kuyruğu fener gibi parlayan, akşamları adaya yol gösteren böcek.' },
  { id: 'kozalak', name: 'Kozalak', els: ['nature', 'ice'], shape: 'round', c: 0x7fa883, belly: 0xeafff0, spots: 0xffffff, head: ['snowcap', 'leaves'], leaf: 0x3f8f5a, tail: 'pom', pom: 0xffffff, back: 'spikes', spike: 0x3f8f5a, wings: 'none', mouth: 'smile', eyes: 2, desc: 'Sırtı çam iğneleriyle kaplı, karlı ormanların sessiz bekçisi.' },
  { id: 'mantarcik', name: 'Mantarcık', els: ['nature', 'shadow'], shape: 'chibi', c: 0xb894f2, belly: 0xf2e9ff, spots: 0x9b6fe0, head: ['mushroom'], cap: 0xff4fa3, tail: 'none', wings: 'fairy', wing: 0xe3ccff, mouth: 'cat', eyes: 2, desc: 'Şapkasındaki benekler karanlıkta parlayan, masal ormanından bir mantar.' },
  { id: 'aurora', name: 'Aurora', els: ['electric', 'ice'], shape: 'bean', c: 0xa6f0ff, belly: 0xffffff, spots: 0xd2b6ff, head: ['crystals', 'antenna'], crystal: 0xd7c2ff, glow: 0xfff7c2, tail: 'bolt', boltC: 0xd2b6ff, wings: 'fairy', wing: 0xd9c4ff, back: 'crystals', mouth: 'smile', eyes: 2, desc: 'Kanat çırptıkça gökyüzünde kutup ışıkları beliren zarif bir canavar.' },
  { id: 'firtina', name: 'Fırtına', els: ['electric', 'shadow'], shape: 'blob', c: 0x5d4c93, belly: 0xb6a8de, spots: 0xffe14d, head: ['cloud'], tail: 'bolt', boltC: 0xffe14d, wings: 'bat', wing: 0x3b2f66, mouth: 'fang', eyes: 2, iris: 0xffe14d, desc: 'Başının üstünde kendi minik fırtına bulutunu taşıyan huysuz tüy yumağı.' },
  { id: 'ayaz', name: 'Ayaz', els: ['ice', 'shadow'], shape: 'round', c: 0x6d82db, belly: 0xdce8ff, spots: 0xbfe0ff, head: ['batEars', 'crystals'], ear: 0x3c4aa6, crystal: 0xbfe9ff, tail: 'lizard', wing: 0x3c4aa6, wings: 'feather', back: 'crystals', mouth: 'fang', eyes: 2, iris: 0x9fe8ff, desc: 'Kış gecelerinde ortaya çıkan, nefesiyle camlara desen çizen gezgin.' },
  { id: 'prizmo', name: 'Prizmo', els: ['legend'], shape: 'round', c: 0xfff6fb, belly: 0xffffff, spots: 'rainbow', head: ['crown', 'horns'], horn: 0xffd1ea, tail: 'pom', pom: 0xffb3e0, wings: 'fairy', wing: 0xffd6f0, back: 'crystals', crystal: 0xffc2ec, mouth: 'smile', eyes: 2, iris: 0xff4fa3, desc: 'Gökkuşağından doğduğu söylenen efsanevi canavar. Her habitatta yaşayabilir.' },
];
const SP = Object.fromEntries(SPECIES.map(s => [s.id, s]));
const isLegend = sp => sp.els[0] === 'legend';
const rarityOf = sp => isLegend(sp) ? 'Efsanevi' : sp.els.length > 1 ? 'Nadir melez' : 'Yaygın';
const rarMult = sp => isLegend(sp) ? 1.35 : sp.els.length > 1 ? 1.12 : 1;
const STAGES = ['Bebek', 'Genç', 'Yetişkin', 'Usta'];
const STAGE_LVL = [1, 4, 7, 10];
const MAX_LVL = 10;
const stageOf = lvl => lvl >= 10 ? 3 : lvl >= 7 ? 2 : lvl >= 4 ? 1 : 0;
const pureOf = el => SPECIES.find(s => s.els.length === 1 && s.els[0] === el);
const hybridOf = (a, b) => SPECIES.find(s => s.els.length === 2 && s.els.includes(a) && s.els.includes(b));

/* ---------- economy ---------- */
const HAB_INFO = {
  nature: { cost: 150, lvl: 1 }, fire: { cost: 150, lvl: 1 }, water: { cost: 400, lvl: 2 },
  electric: { cost: 1200, lvl: 3 }, ice: { cost: 2500, lvl: 4 }, shadow: { cost: 5000, lvl: 5 },
};
const EGG_PRICE = { nature: 80, fire: 80, water: 300, electric: 900, ice: 1800, shadow: 3500 };
const HAB_CAP = [250, 600, 1400], HAB_SLOTS = [2, 3, 4], HAB_UP = [600, 2500];
const FARM_COST = 120;
const CROPS = [
  { id: 'elma', name: 'Kırmızı Elma', cost: 20, time: 15, food: 25, lvl: 1, color: 0xff4b4b },
  { id: 'mantar', name: 'Mavi Mantar', cost: 60, time: 60, food: 90, lvl: 2, color: 0x4f8dff },
  { id: 'misir', name: 'Altın Mısır', cost: 150, time: 180, food: 260, lvl: 3, color: 0xffd23f },
  { id: 'yildiz', name: 'Yıldız Meyvesi', cost: 400, time: 480, food: 750, lvl: 5, color: 0xff7fe0 },
];
const CROP = Object.fromEntries(CROPS.map(c => [c.id, c]));
const HATCH_SLOTS = 4;
const BREED_LVL = 3;
const baseGpm = sp => isLegend(sp) ? 40 : sp.els.length > 1 ? 18 : 10;
const goldRate = m => baseGpm(SP[m.sp]) * (1 + 0.3 * (m.lvl - 1));
const feedCost = lvl => Math.round(8 * Math.pow(lvl, 1.7));
const hatchTime = sp => (isLegend(sp) ? 90 : sp.els.length > 1 ? 35 : 12) * 1000;
const breedTime = sp => (isLegend(sp) ? 60 : sp.els.length > 1 ? 30 : 15) * 1000;
const xpNeed = l => Math.round(60 * Math.pow(l, 1.45));
const gemCost = ms => Math.max(1, Math.ceil(ms / 15000));
const releaseValue = m => Math.round(20 * m.lvl * rarMult(SP[m.sp]) * (SP[m.sp].els.length > 1 ? 2 : 1));
const fighterStats = (sp, lvl) => { const r = rarMult(sp); return { hp: Math.round((42 + 12 * lvl) * r), atk: Math.round((8 + 3 * lvl) * r) }; };

/* ---------- islands: main island has fixed buildings; others add plots ---------- */
const ISLANDS = [
  { x: 0, z: 0, r: 22, price: 0, lvl: 1, name: 'Yuva Adası', plots: [[-12, 3], [0, 1], [12, 3], [-6, 12], [6, 12]], specials: { hatchery: [-11, -9], breed: [11, -9], arena: [0, -12] } },
  { x: -47, z: 6, r: 15, price: 1500, lvl: 3, name: 'Orman Adası', plots: [[-5, -4], [6, -3], [0, 6]] },
  { x: 47, z: 6, r: 15, price: 5000, lvl: 5, name: 'Kristal Adası', plots: [[-6, -3], [5, -4], [0, 6]] },
  { x: 0, z: -47, r: 15, price: 15000, lvl: 7, name: 'Volkan Adası', plots: [[-6, -2], [6, -2], [0, 7]] },
  { x: -40, z: -48, r: 14, price: 40000, lvl: 9, name: 'Gölge Adası', plots: [[-5, -3], [5, -3], [0, 6]] },
];
const BRIDGES = [[0, 1], [0, 2], [0, 3], [3, 4]];

/* ---------- breeding ---------- */
function breedPool(spA, spB) {
  const A = SP[spA], B = SP[spB];
  const U = new Set([...A.els, ...B.els]);
  if (U.has('legend')) { EL_KEYS.forEach(e => U.add(e)); U.delete('legend'); }
  const list = [];
  for (const sp of SPECIES) {
    if (isLegend(sp) || !sp.els.every(e => U.has(e))) continue;
    let w = 3;
    if (sp.els.length === 2) {
      const both = (A.els.includes(sp.els[0]) && B.els.includes(sp.els[1])) || (A.els.includes(sp.els[1]) && B.els.includes(sp.els[0]));
      w = both || isLegend(A) || isLegend(B) ? 4 : 1.2;
    }
    list.push({ id: sp.id, w });
  }
  const legend = U.size >= 4 ? 0.1 : 0;
  const tot = list.reduce((s, x) => s + x.w, 0);
  return { list: list.map(x => ({ id: x.id, p: (1 - legend) * x.w / tot })), legend };
}
function rollBreed(a, b) {
  const pool = breedPool(a, b); let r = Math.random();
  if (r < pool.legend) return 'prizmo';
  r -= pool.legend;
  for (const x of pool.list) { if (r < x.p) return x.id; r -= x.p; }
  return pool.list[pool.list.length - 1].id;
}
function effOf(atkEl, defSp) {
  if (!atkEl) return 1;
  if (atkEl === 'legend') return 1.25;
  let e = 1;
  for (const d of defSp.els) {
    if (d === 'legend') { e *= 0.85; continue; }
    if (STRONG[atkEl].includes(d)) e *= 1.6; else if (STRONG[d].includes(atkEl)) e *= 0.65;
  }
  return clamp(e, 0.4, 2.5);
}
function skillsFor(sp, lvl) {
  const list = [{ name: 'Kafa Atma', el: null, pow: 1, cd: 0 }];
  if (isLegend(sp)) {
    list.push({ name: 'Prizma Işını', el: 'legend', pow: 1.45, cd: 0 });
    if (lvl >= 4) list.push({ name: 'Gökkuşağı Patlaması', el: 'legend', pow: 2.2, cd: 3 });
  } else {
    sp.els.forEach(el => list.push({ name: SKILLS[el][0], el, pow: 1.35, cd: 0 }));
    if (lvl >= 4) list.push({ name: SKILLS[sp.els[0]][1], el: sp.els[0], pow: 2.1, cd: 3 });
  }
  return list;
}
/* arena opponents are fixed per tier so players can plan */
function arenaTeam(stage) {
  const R = rng(stage * 9973 + 7);
  const size = stage < 3 ? 1 : stage < 6 ? 2 : 3;
  const pool = SPECIES.filter(s => !isLegend(s) && (stage >= 4 || s.els.length === 1));
  const team = [];
  for (let i = 0; i < size; i++) {
    let sp = pool[Math.floor(R() * pool.length)].id;
    if (stage >= 15 && i === size - 1 && stage % 5 === 0) sp = 'prizmo';
    const lvl = clamp(Math.round(stage * 0.62 + 0.4 + (R() - 0.5) * 1.4) + (i === size - 1 ? 1 : 0), 1, MAX_LVL);
    team.push({ sp, lvl });
  }
  return team;
}
const arenaReward = n => ({ gold: 60 + 45 * n, food: 10 + 6 * n, xp: 20 + 8 * n, gems: 2 + Math.floor(n / 3) });

/* ---------- goals ---------- */
const habCount = s => Object.values(s.plots).filter(p => p.type === 'hab').length;
const hasStage = (s, st) => s.monsters.some(m => stageOf(m.lvl) >= st) ? 1 : 0;
const GOALS = [
  { id: 'collect1', t: 'Bir habitattan altın topla', n: 1, p: s => s.stats.collect, r: { gold: 100 } },
  { id: 'harvest1', t: 'Çiftlikte ürün yetiştirip hasat et', n: 1, p: s => s.stats.harvest, r: { gems: 3 } },
  { id: 'feed2', t: 'Canavarlarını 2 kez besle', n: 2, p: s => s.stats.feed, r: { food: 60 } },
  { id: 'breed1', t: 'Sevgi Ağacı’nda iki canavarı eşleştir', n: 1, p: s => s.stats.breed, r: { gems: 5 } },
  { id: 'hatch1', t: 'Bir yumurtayı çatlat', n: 1, p: s => s.stats.hatch, r: { gold: 250 } },
  { id: 'win1', t: 'Arena’da ilk zaferini kazan', n: 1, p: s => s.stats.wins, r: { gems: 5 } },
  { id: 'teen', t: 'Bir canavarı Genç evresine evrimleştir', n: 1, p: s => hasStage(s, 1), r: { gold: 400 } },
  { id: 'hybrid', t: 'Bir melez canavar elde et', n: 1, p: s => s.dex.filter(id => SP[id].els.length === 2).length, r: { gems: 8 } },
  { id: 'hab4', t: '4 habitat kur', n: 4, p: habCount, r: { gold: 600 } },
  { id: 'dex6', t: '6 farklı tür keşfet', n: 6, p: s => s.dex.length, r: { gems: 10 } },
  { id: 'island', t: 'Yeni bir ada aç', n: 1, p: s => s.islands.filter(Boolean).length - 1, r: { gems: 10 } },
  { id: 'arena5', t: 'Arena’da 5. kademeyi geç', n: 5, p: s => s.arena.max - 1, r: { gems: 15 } },
  { id: 'adult', t: 'Bir canavarı Yetişkin yap (Sv.7)', n: 1, p: s => hasStage(s, 2), r: { gems: 12 } },
  { id: 'dex12', t: '12 farklı tür keşfet', n: 12, p: s => s.dex.length, r: { gems: 20 } },
  { id: 'master', t: 'Bir canavarı Usta seviyesine çıkar (Sv.10)', n: 1, p: s => hasStage(s, 3), r: { gems: 25 } },
  { id: 'legend', t: 'Efsanevi Prizmo’yu bul', n: 1, p: s => s.dex.includes('prizmo') ? 1 : 0, r: { gems: 50 } },
  { id: 'dex22', t: 'Kitabı tamamla: 22 türün hepsi', n: 22, p: s => s.dex.length, r: { gems: 100 } },
];

/* ---------- state ---------- */
function newState() {
  const t = now();
  return {
    v: 1, gold: 500, food: 80, gems: 20, xp: 0, lvl: 1, uid: 3,
    monsters: [{ uid: 1, sp: 'yaprakcik', lvl: 1, hab: '0-0' }, { uid: 2, sp: 'kivilcik', lvl: 1, hab: '0-2' }],
    plots: { '0-0': { type: 'hab', el: 'nature', lvl: 1, acc: 40, t }, '0-2': { type: 'hab', el: 'fire', lvl: 1, acc: 40, t }, '0-1': { type: 'farm', crop: null } },
    islands: [true, false, false, false, false],
    eggs: [], breed: null, arena: { max: 1 }, team: [],
    stats: { collect: 0, harvest: 0, feed: 0, breed: 0, hatch: 0, wins: 0 },
    dex: ['yaprakcik', 'kivilcik'], claimed: [], sound: true, intro: false,
  };
}
let state = newState();
const SAVE_KEY = 'monster-mania-save-v1';
function loadSave(data) {
  let s = data && data.save;
  if (!s) { try { const raw = localStorage.getItem(SAVE_KEY); if (raw) s = JSON.parse(raw); } catch (e) { s = null; } }
  if (s && s.v === 1 && Array.isArray(s.monsters)) {
    const base = newState();
    state = Object.assign(base, s);
    state.stats = Object.assign(base.stats, s.stats || {});
  }
}
function saveGame() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable: progress lasts for this visit */ } }

/* ---------- rules ---------- */
const getMon = uid => state.monsters.find(m => m.uid === +uid);
const monsIn = key => state.monsters.filter(m => m.hab === key);
const canLive = (spId, el) => { const sp = SP[spId]; return isLegend(sp) || sp.els.includes(el); };
const habCap = h => HAB_CAP[h.lvl - 1];
const habSlots = h => HAB_SLOTS[h.lvl - 1];
const habRate = key => monsIn(key).reduce((s, m) => s + goldRate(m), 0);
function goldOf(key) { const h = state.plots[key]; if (!h || h.type !== 'hab') return 0; return Math.min(habCap(h), h.acc + habRate(key) * (now() - h.t) / 60000); }
function settle(key) { const h = state.plots[key]; if (!h || h.type !== 'hab') return; h.acc = goldOf(key); h.t = now(); }
function plotPos(key) { const [i, p] = key.split('-').map(Number); const I = ISLANDS[i]; return { x: I.x + I.plots[p][0], z: I.z + I.plots[p][1] }; }
function freePlots() { const out = []; ISLANDS.forEach((I, i) => { if (!state.islands[i]) return; I.plots.forEach((_, p) => { const k = i + '-' + p; if (!state.plots[k]) out.push(k); }); }); return out; }
function homeFor(spId, except) {
  let best = null, bestN = 99;
  for (const [k, h] of Object.entries(state.plots)) {
    if (h.type !== 'hab' || k === except || !canLive(spId, h.el)) continue;
    const n = monsIn(k).length;
    if (n < habSlots(h) && n < bestN) { best = k; bestN = n; }
  }
  return best;
}
function goalState(g) { const v = Math.min(g.n, g.p(state)); return { v, done: v >= g.n, claimed: state.claimed.includes(g.id) }; }
const claimableGoals = () => GOALS.filter(g => { const s = goalState(g); return s.done && !s.claimed; }).length;
