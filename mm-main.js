'use strict';
let MODE = 'world';
let placing = null;

/* ---------- progression ---------- */
function addXP(n) {
  state.xp += n;
  while (state.xp >= xpNeed(state.lvl)) {
    state.xp -= xpNeed(state.lvl); state.lvl++; state.gems += 5; SFX.evolve();
    toast(`Seviye ${state.lvl}! +5 elmas. Mağazada yeni şeyler açıldı.`, 'good');
  }
}
function changed() { updateHUD(); refreshSheet(); dirty = true; }
function spend(k, n) { if (state[k] < n) { SFX.err(); toast(k === 'gold' ? 'Yeterli altının yok.' : k === 'food' ? 'Yeterli yemin yok. Çiftlikte ürün yetiştir.' : 'Yeterli elmasın yok.', 'bad'); return false; } state[k] -= n; return true; }
function discover(id) {
  if (state.dex.includes(id)) return false;
  state.dex.push(id); state.gems += 3; return true;
}
function evtXY(el) { if (el && el.getBoundingClientRect) { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; } return [innerWidth / 2, innerHeight / 2]; }

/* ---------- game actions ---------- */
function collect(key, el) {
  const g = Math.floor(goldOf(key)); if (g < 1) return;
  settle(key); state.plots[key].acc -= g; state.gold += g; state.stats.collect++; addXP(Math.max(1, Math.round(g / 12)));
  const [x, y] = evtXY(el); flyTo('gold', x, y, Math.min(6, 2 + Math.floor(g / 60))); floatText('+' + fmt(g), x, y - 20, '#ffd23f'); SFX.coin(); changed();
}
function newMonster(spId) {
  const m = { uid: state.uid++, sp: spId, lvl: 1, hab: homeFor(spId) };
  if (m.hab) settle(m.hab);
  state.monsters.push(m); return m;
}
function hatch(i) {
  const e = state.eggs[i]; if (!e || now() < e.end) return;
  state.eggs.splice(i, 1);
  const m = newMonster(e.sp), sp = SP[e.sp], isNew = discover(e.sp);
  state.stats.hatch++; addXP(isLegend(sp) ? 60 : sp.els.length > 1 ? 25 : 10);
  closeSheet(); syncWorld(); SFX.hatch();
  const hp = special.hatchery.position.clone().add(V(0, 1.5, 0));
  burst(scene, hp, [ELEMENTS[sp.els[0]].hex, 0xffffff, 0xffd23f], 28, 7, 0.22, 1);
  if (m.hab) { const p = plotPos(m.hab); focusOn(p.x, p.z, 40); }
  showModal(`<div class="kick">${isNew ? 'Yeni tür keşfedildi · +3 elmas' : rarityOf(sp)}</div><img src="${portrait(e.sp, 0)}" alt=""><h2>${sp.name}</h2><div class="row" style="gap:6px">${spChips(sp)}</div><p>${sp.desc}</p><p>${m.hab ? `${habName(m.hab)}’na yerleşti.` : `Boş yer yok. ${sp.els.map(x => ELEMENTS[x].name).join(' ya da ')} habitatı kur veya mevcut habitatı geliştir.`}</p><div class="row"><button class="btn" data-act="closeModal">Harika!</button></div>`);
  changed();
}
function feed(uid, el) {
  const m = getMon(uid); if (!m || m.lvl >= MAX_LVL) return;
  const cost = feedCost(m.lvl); if (!spend('food', cost)) return;
  if (m.hab) settle(m.hab);
  const st0 = stageOf(m.lvl); m.lvl++; state.stats.feed++; addXP(m.lvl * 3);
  const [x, y] = evtXY(el); floatText('Sv.' + m.lvl, x, y - 24, '#7cc3ff'); SFX.pop();
  const v = monViews.get(m.uid);
  if (stageOf(m.lvl) > st0) {
    if (v) burst(scene, v.obj.position.clone().add(V(0, 1.5, 0)), [0xffd23f, 0xffffff, 0xff7fd0], 36, 6, 0.2, 1.2);
    syncWorld(); SFX.evolve();
    const sp = SP[m.sp];
    showModal(`<div class="kick">Evrim</div><img src="${monImg(m)}" alt=""><h2>${sp.name} büyüdü!</h2><p>Artık <b>${STAGES[stageOf(m.lvl)]}</b> evresinde. ${stageOf(m.lvl) === 1 ? 'Özel hamlesini öğrendi ve kanatları çıkmaya başladı.' : stageOf(m.lvl) === 2 ? 'Sırtında yeni çıkıntılar belirdi, daha çok altın üretiyor.' : 'Etrafını saran ışık halkasıyla gerçek bir usta oldu.'}</p><div class="row"><button class="btn" data-act="closeModal">Süper</button></div>`);
  } else if (v) burst(scene, v.obj.position.clone().add(V(0, 1.2, 0)), [0x7cc3ff, 0xffffff], 10, 3, 0.14, 0.6);
  changed();
}
function moveTo(uid, key) {
  const m = getMon(uid), h = state.plots[key]; if (!m || !h) return;
  if (monsIn(key).length >= habSlots(h)) { toast('Bu habitat dolu.', 'bad'); return; }
  if (m.hab) settle(m.hab); settle(key); m.hab = key; syncWorld(); SFX.pop(); openSheet(sheetMon(uid)); changed();
}
let releaseArm = 0;
function release(uid, el) {
  if (releaseArm !== +uid || performance.now() - releaseArmT > 3000) { releaseArm = +uid; releaseArmT = performance.now(); el.textContent = 'Emin misin? Tekrar dokun'; el.classList.remove('ghost'); el.classList.add('danger'); return; }
  const m = getMon(uid); if (!m) return;
  if (state.monsters.length <= 1) { toast('Son canavarını serbest bırakamazsın.', 'bad'); return; }
  if (m.hab) settle(m.hab);
  state.gold += releaseValue(m); state.monsters = state.monsters.filter(x => x !== m); state.team = state.team.filter(u => u !== m.uid);
  releaseArm = 0; syncWorld(); closeSheet(); toast(`${SP[m.sp].name} yeni bir yuva aramaya gitti.`); changed();
}
let releaseArmT = 0;
function startPlace(item) {
  if (!freePlots().length) { toast('Boş alan kalmadı. Yeni bir ada aç.', 'bad'); return; }
  placing = item; closeSheet(); $('#placeBar').hidden = false;
  $('#placeTxt').textContent = item.type === 'hab' ? `${ELEMENTS[item.el].name} Habitatı için yeşil + işaretine dokun` : 'Çiftlik için yeşil + işaretine dokun';
  if (CAM.dist < 60) CAM.anim = { t: 0, dur: 0.6, x0: CAM.tx, z0: CAM.tz, d0: CAM.dist, x1: CAM.tx, z1: CAM.tz, d1: 70 };
}
function cancelPlace() { placing = null; $('#placeBar').hidden = true; }
function placeAt(key) {
  if (!placing || state.plots[key]) return;
  const cost = placing.type === 'hab' ? HAB_INFO[placing.el].cost : FARM_COST;
  if (!spend('gold', cost)) return;
  state.plots[key] = placing.type === 'hab' ? { type: 'hab', el: placing.el, lvl: 1, acc: 0, t: now() } : { type: 'farm', crop: null };
  addXP(placing.type === 'hab' ? 15 : 5);
  // homeless monsters move in straight away
  if (placing.type === 'hab') state.monsters.filter(m => !m.hab && canLive(m.sp, placing.el)).slice(0, HAB_SLOTS[0]).forEach(m => { m.hab = key; });
  cancelPlace(); syncWorld(); SFX.pop();
  const p = plotPos(key); burst(scene, V(p.x, 1, p.z), [0xffffff, 0xffd23f, 0x86dc5c], 24, 6, 0.2, 0.9);
  toast('Yapı kuruldu.', 'good'); changed();
}
function plant(key, crop) {
  const p = state.plots[key], c = CROP[crop]; if (!p || p.crop || state.lvl < c.lvl) return;
  if (!spend('gold', c.cost)) return;
  p.crop = crop; p.start = now(); p.end = now() + c.time * 1000; syncWorld(); SFX.pop(); closeSheet(); changed();
}
function harvest(key, el) {
  const p = state.plots[key]; if (!p || !p.crop || now() < p.end) return;
  const c = CROP[p.crop]; state.food += c.food; state.stats.harvest++; addXP(5 + Math.round(c.food / 30));
  p.crop = null; syncWorld();
  const [x, y] = evtXY(el); flyTo('food', x, y, 4); floatText('+' + c.food, x, y - 20, '#ff8a6b'); SFX.coin(); changed();
}
function breedStart() {
  const A = getMon(breedSel.a), B = getMon(breedSel.b);
  if (!A || !B || A === B || state.breed) return;
  if (A.lvl < BREED_LVL || B.lvl < BREED_LVL) { toast(`Eşleştirmek için iki canavar da Sv.${BREED_LVL} olmalı. Önce besle.`, 'bad'); return; }
  const sp = rollBreed(A.sp, B.sp);
  state.breed = { a: A.uid, b: B.uid, aSp: A.sp, bSp: B.sp, aLvl: A.lvl, bLvl: B.lvl, sp, start: now(), end: now() + breedTime(SP[sp]) };
  state.stats.breed++; addXP(10); breedSel = { a: null, b: null }; syncWorld(); SFX.hatch(); changed();
}
function breedCollect() {
  const b = state.breed; if (!b || now() < b.end) return;
  if (state.eggs.length >= HATCH_SLOTS) { toast('Kuluçkahane dolu. Önce bir yumurtayı çatlat.', 'bad'); return; }
  state.eggs.push({ sp: b.sp, start: now(), end: now() + hatchTime(SP[b.sp]) }); state.breed = null;
  syncWorld(); SFX.pop(); toast('Yumurta kuluçkahaneye taşındı.', 'good'); openSheet(sheetHatchery()); changed();
}
function buyEgg(el) {
  if (state.eggs.length >= HATCH_SLOTS) { toast('Kuluçkahane dolu. Önce bir yumurtayı çatlat.', 'bad'); return; }
  if (state.lvl < HAB_INFO[el].lvl || !spend('gold', EGG_PRICE[el])) return;
  const sp = pureOf(el); state.eggs.push({ sp: sp.id, start: now(), end: now() + hatchTime(sp) });
  syncWorld(); SFX.pop(); toast(`${sp.name} yumurtası kuluçkahaneye kondu.`, 'good');
  const h = special.hatchery.position; focusOn(h.x, h.z, 42); changed();
}
function unlock(i) {
  const I = ISLANDS[i]; if (state.islands[i] || state.lvl < I.lvl || !spend('gold', I.price)) return;
  state.islands[i] = true; addXP(50);
  const cover = islandViews[i].cover; cover.visible = true;
  tween(1.2, k => { cover.scale.setScalar(1 + k * 0.6); cover.position.y = k * 12; }, () => { cover.scale.setScalar(1); syncWorld(); });
  focusOn(I.x, I.z, 55); closeSheet(); SFX.evolve(); toast(`${I.name} keşfedildi!`, 'good'); changed();
}
function claim(id, el) {
  const g = GOALS.find(x => x.id === id); if (!g || state.claimed.includes(id) || !goalState(g).done) return;
  state.claimed.push(id);
  const [x, y] = evtXY(el);
  for (const [k, n] of Object.entries(g.r)) { if (k === 'gems') { state.gems += n; flyTo('gem', x, y, 3); } else { state[k] += n; flyTo(k, x, y, 3); } }
  SFX.coin(); changed();
}
function speed(kind, key) {
  if (kind === 'egg') { const e = state.eggs[+key]; if (!e) return; if (!spend('gems', gemCost(e.end - now()))) return; e.end = now(); }
  if (kind === 'breed') { const b = state.breed; if (!b) return; if (!spend('gems', gemCost(b.end - now()))) return; b.end = now(); }
  if (kind === 'farm') { const p = state.plots[key]; if (!p || !p.crop) return; if (!spend('gems', gemCost(p.end - now()))) return; p.end = now(); }
  SFX.pop(); changed();
}

/* ---------- click actions ---------- */
const ACT = {
  closeSheet, closeModal, cancelPlace,
  sound() { state.sound = !state.sound; updateHUD(); dirty = true; },
  profile() { openSheet(sheetGoals()); }, goals() { openSheet(sheetGoals()); },
  shop(d) { if (d.tab) shopTab = d.tab; openSheet(sheetShop()); },
  shopTab(d) { shopTab = d.tab; refreshSheet(); },
  collection() { openSheet(sheetCollection()); }, colTab(d) { colTab = d.tab; refreshSheet(); },
  arena() { arenaSel = state.arena.max; openSheet(sheetArena()); },
  arenaStep(d) { arenaSel += +d.d; refreshSheet(); },
  teamToggle(d) { const u = +d.uid, i = state.team.indexOf(u); if (i >= 0) state.team.splice(i, 1); else if (state.team.length < 3) state.team.push(u); else toast('Takımda en fazla 3 canavar olabilir.'); refreshSheet(); },
  fight() { startBattle(); }, skill(d) { playerSkill(+d.i); },
  flee() { if (battle && !battle.over) { battle.over = true; leaveBattle(); toast('Arenadan çekildin.'); } },
  leaveBattle() { closeModal(); leaveBattle(); },
  nextFight() { closeModal(); leaveBattle(); arenaSel = state.arena.max; startBattle(); },
  collect(d, el) { collect(d.key, el); },
  mon(d) { openSheet(sheetMon(+d.uid)); },
  feed(d, el) { feed(+d.uid, el); },
  movePick(d) { const m = getMon(d.uid); openSheet(() => ({ title: `${SP[m.sp].name} nereye taşınsın?`, body: Object.entries(state.plots).filter(([k, h]) => h.type === 'hab' && k !== m.hab && canLive(m.sp, h.el)).map(([k, h]) => { const n = monsIn(k).length, full = n >= habSlots(h); return `<div class="item" style="--ec:${ELEMENTS[h.el].color}"><div class="ic">${elIcon(h.el)}</div><div class="grow"><h3>${ELEMENTS[h.el].name} Habitatı</h3><p>${n}/${habSlots(h)} canavar</p></div><button class="btn sm" data-act="moveTo" data-uid="${m.uid}" data-key="${k}" ${full ? 'disabled' : ''}>${full ? 'Dolu' : 'Taşı'}</button></div>`; }).join('') || '<p class="muted">Uygun başka habitat yok. Mağazadan bu canavarın elementine uygun habitat kur.</p>' })); },
  moveTo(d) { moveTo(+d.uid, d.key); },
  release(d, el) { release(d.uid, el); },
  addToHab(d) { const h = state.plots[d.key]; openSheet(sheetPick(`${ELEMENTS[h.el].name} Habitatı’na ekle`, () => state.monsters.filter(m => m.hab !== d.key && canLive(m.sp, h.el)).sort((a, b) => (a.hab ? 1 : 0) - (b.hab ? 1 : 0)), 'moveHere', ` data-key="${d.key}"`, `Bu habitata uygun başka canavar yok. ${ELEMENTS[h.el].name} yumurtası al ya da eşleştir.`)); },
  moveHere(d) { moveTo(+d.uid, d.key); openSheet(sheetHab(d.key)); },
  upgradeHab(d) { const h = state.plots[d.key]; if (!h || h.lvl >= 3) return; if (!spend('gold', HAB_UP[h.lvl - 1])) return; settle(d.key); h.lvl++; addXP(30); syncWorld(); SFX.evolve(); const p = plotPos(d.key); burst(scene, V(p.x, 1.5, p.z), [0xffd23f, 0xffffff], 30, 6, 0.2, 1); changed(); },
  hatch(d) { hatch(+d.i); }, speedEgg(d) { speed('egg', d.i); }, speedBreed() { speed('breed'); }, speedFarm(d) { speed('farm', d.key); },
  breedPick(d) { const slot = d.slot, other = slot === 'a' ? breedSel.b : breedSel.a; openSheet(() => ({ title: 'Eşleştirilecek canavar', body: `<p class="muted" style="margin:0">Sv.${BREED_LVL} ve üstü canavarlar eşleşebilir.</p><div class="mgrid">${state.monsters.filter(m => m.uid !== other).sort((a, b) => b.lvl - a.lvl).map(m => monCard(m, { act: 'breedSet', extra: ` data-slot="${slot}"`, tag: m.lvl < BREED_LVL ? `Sv.${BREED_LVL} gerekir` : '' })).join('')}</div>` })); },
  breedSet(d) { const m = getMon(d.uid); if (m.lvl < BREED_LVL) { toast(`${SP[m.sp].name} henüz çok küçük. Sv.${BREED_LVL} olana kadar besle.`, 'bad'); return; } breedSel[d.slot] = m.uid; openSheet(sheetBreed()); },
  breedStart, breedCollect,
  plant(d) { plant(d.key, d.crop); }, harvest(d, el) { harvest(d.key, el); },
  buyHab(d) { if (state.lvl < HAB_INFO[d.el].lvl) return; if (state.gold < HAB_INFO[d.el].cost) { spend('gold', Infinity); return; } startPlace({ type: 'hab', el: d.el }); },
  buyFarm() { if (state.gold < FARM_COST) { spend('gold', Infinity); return; } startPlace({ type: 'farm' }); },
  buyEgg(d) { buyEgg(d.el); },
  swap(d) { if (!spend('gems', 10)) return; if (d.k === 'gold') state.gold += 1000; else state.food += 300; SFX.coin(); changed(); },
  placeAt(d) { placeAt(d.key); },
  island(d) { openSheet(sheetIsland(+d.i)); }, unlock(d) { unlock(+d.i); },
  claim(d, el) { claim(d.id, el); },
  hatchery() { openSheet(sheetHatchery()); }, breed() { openSheet(sheetBreed()); },
  plot(d) { const p = state.plots[d.key]; if (!p) return; openSheet(p.type === 'hab' ? sheetHab(d.key) : sheetFarm(d.key)); },
  farmTap(d, el) { const p = state.plots[d.key]; if (p.crop && now() >= p.end) harvest(d.key, el); else openSheet(sheetFarm(d.key)); },
  hatchTap() { const i = state.eggs.findIndex(e => now() >= e.end); if (i >= 0) hatch(i); else openSheet(sheetHatchery()); },
  startGame() { state.intro = true; closeModal(); dirty = true; },
};
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]'); if (!t || t.disabled) return;
  const f = ACT[t.dataset.act]; if (!f) return;
  ac(); if (t.dataset.act !== 'release') SFX.tap();
  f(t.dataset, t);
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (!$('#modalWrap').hidden) closeModal(); else if (sheetFn) closeSheet(); else if (placing) cancelPlace(); } });

/* ---------- world taps ---------- */
function onTap(x, y) {
  if (MODE !== 'world') return;
  const p = pickAt(x, y); if (!p) return;
  SFX.tap(); ac();
  if (placing) { if (p.kind === 'plot' || p.kind === 'mon') toast('Bu alan dolu. Yeşil + işaretli boş alanı seç.'); return; }
  if (p.kind === 'mon') { const v = monViews.get(p.uid); if (v) { v.wait = 1.5; burst(scene, v.obj.position.clone().add(V(0, 2.2, 0)), [0xff7fb8], 1, 1, 0.25, 1.2, 0.5, G.heart); } openSheet(sheetMon(p.uid)); }
  else if (p.kind === 'plot') { const g = goldOf(p.key); if (state.plots[p.key].type === 'hab' && g >= 1 && !sheetFn) { const L = labels.get('g' + p.key); collect(p.key, L && L.el); } else ACT.plot(p); }
  else if (p.kind === 'hatchery') ACT.hatchery();
  else if (p.kind === 'breed') ACT.breed();
  else if (p.kind === 'arena') ACT.arena();
  else if (p.kind === 'island') ACT.island({ i: p.idx });
}

/* ---------- labels shown over the world ---------- */
function refreshLabels() {
  for (const L of labels.values()) L.alive = false;
  if (MODE === 'world') {
    for (const [k, p] of Object.entries(state.plots)) {
      const c = plotPos(k);
      if (p.type === 'hab') { const g = goldOf(k); if (g >= 1) setLabel('g' + k, V(c.x, 4.4, c.z), ICO.gold + fmt(g), 'tap' + (g >= habCap(p) ? ' full' : ''), 'collect', { key: k }); }
      else if (p.crop) { const ready = now() >= p.end; setLabel('f' + k, V(c.x, 3.2, c.z), ready ? ICO.food + 'Hasat' : ICO.clock + fmtT(p.end - now()), ready ? 'tap' : 'timer', ready ? 'farmTap' : '', { key: k }); }
      else setLabel('f' + k, V(c.x, 2.4, c.z), ICO.food + 'Ek', 'name', 'farmTap', { key: k });
    }
    const S = ISLANDS[0].specials;
    if (state.eggs.length) { const ready = state.eggs.some(e => now() >= e.end), soon = Math.min(...state.eggs.map(e => e.end)); setLabel('hatch', V(S.hatchery[0], 4.2, S.hatchery[1]), ready ? ICO.egg + 'Çatlat!' : ICO.clock + fmtT(soon - now()), ready ? 'tap' : 'timer', ready ? 'hatchTap' : ''); }
    if (state.breed) { const done = now() >= state.breed.end; setLabel('breedT', V(S.breed[0], 8.2, S.breed[1]), done ? ICO.egg + 'Yumurta hazır' : ICO.clock + fmtT(state.breed.end - now()), done ? 'tap' : 'timer', done ? 'breed' : ''); }
    setLabel('nH', V(S.hatchery[0], 0.4, S.hatchery[1] + 5), 'Kuluçkahane', 'name', 'hatchery');
    setLabel('nB', V(S.breed[0], 0.4, S.breed[1] + 5), 'Sevgi Ağacı', 'name', 'breed');
    setLabel('nA', V(S.arena[0], 0.4, S.arena[1] + 5.4), 'Arena · Kademe ' + state.arena.max, 'name', 'arena');
    ISLANDS.forEach((I, i) => { if (!state.islands[i]) setLabel('isl' + i, V(I.x, 8, I.z), ICO.lock + `${I.name} · ${fmt(I.price)}`, 'lock', 'island', { i: String(i) }); });
    if (placing) freePlots().forEach(k => { const c = plotPos(k); setLabel('p' + k, V(c.x, 1.2, c.z), '+', 'plot', 'placeAt', { key: k }); });
  }
  for (const [id, L] of labels) if (!L.alive) { L.el.remove(); labels.delete(id); }
}

/* ---------- camera input ---------- */
function bindInput(cv) {
  const pts = new Map(); let tap = null, pinch = null, lastMove = 0;
  cv.addEventListener('pointerdown', e => {
    cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    CAM.vx = CAM.vz = 0;
    if (pts.size === 1) tap = { x: e.clientX, y: e.clientY, t: performance.now(), moved: false };
    else { tap = null; const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), dist: CAM.dist }; }
  });
  cv.addEventListener('pointermove', e => {
    const p = pts.get(e.pointerId); if (!p || MODE !== 'world') return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    if (pts.size === 1) {
      if (tap && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) > 8) tap.moved = true;
      if (!tap || tap.moved) { const [wx, wz] = panBy(dx, dy); const t = performance.now(), dt = Math.max(8, t - lastMove) / 1000; lastMove = t; CAM.vx = wx / dt * 0.5; CAM.vz = wz / dt * 0.5; }
    } else if (pts.size === 2 && pinch) { const [a, b] = [...pts.values()]; CAM.dist = clamp(pinch.dist * pinch.d / Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)), CAM.MIN, CAM.MAX); CAM.anim = null; }
  });
  const up = e => {
    if (tap && !tap.moved && pts.size === 1 && performance.now() - tap.t < 500) onTap(e.clientX, e.clientY);
    if (performance.now() - lastMove > 80) { CAM.vx = CAM.vz = 0; }
    pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (!pts.size) tap = null;
  };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', e => { e.preventDefault(); if (MODE !== 'world') return; CAM.dist = clamp(CAM.dist * (1 + e.deltaY * 0.0012), CAM.MIN, CAM.MAX); CAM.anim = null; }, { passive: false });
}

/* ---------- loop ---------- */
let dirty = false, T = 0, labelT = 0, secT = 0, saveT = 0;
const clock = new THREE.Clock();
function resize() { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); resizeBattleCam(); }
function loop() {
  requestAnimationFrame(loop);
  if (document.hidden) return;
  const dt = Math.min(0.05, clock.getDelta()); T += dt;
  updateTweens(dt); updateParticles(dt);
  if (MODE === 'battle') { updateBattle(dt, T); renderer.render(bScene, bCam); }
  else { updateCamera(dt); updateWorld(dt, T); renderer.render(scene, camera); labelT -= dt; if (labelT <= 0) { labelT = 0.25; refreshLabels(); } positionLabels(camera); }
  secT -= dt; if (secT <= 0) { secT = 0.5; tickTimers(); updateHUD(); }
  saveT -= dt; if (saveT <= 0) { saveT = 5; saveGame(); dirty = false; }
}

/* ---------- boot ---------- */
function start(data) {
  loadSave(data);
  $('#stage').appendChild(renderer.domElement);
  bindInput(renderer.domElement);
  initWorld(); syncWorld(); resize(); updateHUD();
  CAM.dist = clamp(60 / Math.min(1, (innerWidth / innerHeight) * 1.5), 60, 92);
  addEventListener('resize', resize);
  addEventListener('pagehide', saveGame);
  document.addEventListener('visibilitychange', () => { if (document.hidden) saveGame(); else clock.getDelta(); });
  if (window.claude && window.claude.hot && typeof window.claude.hot.snapshot === 'function') window.claude.hot.snapshot(() => ({ save: JSON.parse(JSON.stringify(state)) }));
  $('#loading').remove();
  if (!state.intro) showModal(`<div class="kick">Hoş geldin, canavar bakıcısı</div><img src="${portrait('kivilcik', 0)}" alt=""><h2>Monster Mania</h2><p>Adaların artık senin. Canavar topla, büyüt, eşleştir ve Arena’da yarış.</p><ol><li>Habitatların üstündeki altınlara dokunarak topla.</li><li>Çiftlikte yem yetiştir ve canavarlarını besle.</li><li>Sv.${BREED_LVL} olan iki canavarı Sevgi Ağacı’nda eşleştir.</li><li>Yumurtaları Kuluçkahane’de çatlat, Kitabı tamamla.</li></ol><div class="row"><button class="btn" data-act="startGame">Oynamaya başla</button></div>`);
  loop();
}
const hot = window.claude && window.claude.hot;
if (hot && hot.ready) hot.ready(start); else start((hot && hot.data) || {});
