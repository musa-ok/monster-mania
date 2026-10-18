'use strict';
/* ---------- arena battle scene ---------- */
const bScene = new THREE.Scene();
bScene.fog = new THREE.Fog(0xffd9a8, 30, 90);
const bCam = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
bScene.add(new THREE.HemisphereLight(0xfff1dd, 0x9a7a5a, 0.6));
bScene.add(new THREE.AmbientLight(0xffffff, 0.12));
const bSun = new THREE.DirectionalLight(0xffffff, 0.65); bSun.position.set(6, 14, 9); bSun.castShadow = true; bSun.shadow.mapSize.set(1024, 1024);
Object.assign(bSun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10 }); bScene.add(bSun);
(() => {
  const pb = new PB(), R = rng(77);
  pb.add('body', G.cyl, 0xd9b77a, V(0, -0.6, 0), [60, 1, 60]);
  pb.add('body', G.cyl, 0xc9b79a, V(0, -0.05, 0), [8.6, 0.3, 8.6]);
  pb.add('body', G.cyl, 0xead39f, V(0, 0.05, 0), [8, 0.2, 8]);
  pb.add('detail', G.cyl, 0xd9534f, V(0, 0.16, 0), [2.4, 0.03, 2.4]); pb.add('detail', G.cyl, 0xf6e7c1, V(0, 0.18, 0), [1.8, 0.03, 1.8]);
  for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; if (Math.sin(a) > 0.55) continue; const p = V(Math.cos(a) * 11, 2, Math.sin(a) * 11); pb.add('body', G.cyl, 0xe0d6c4, p, [0.6, 4, 0.6]); pb.add('body', G.box, 0xcfc3ae, p.clone().add(V(0, 2.1, 0)), [1.5, 0.4, 1.5]); pb.add('body', G.box, [0xd9534f, 0x4a8dff, 0xffc53d][i % 3], p.clone().add(V(0, 1.2, 0.6)), [0.9, 1.6, 0.05]); }
  // the crowd: rows of colourful heads on the stands
  for (let row = 0; row < 4; row++) for (let i = 0; i < 46; i++) {
    const a = i / 46 * Math.PI * 2; if (Math.sin(a) > 0.45) continue;
    const r = 14 + row * 1.6, y = 1 + row * 1.1;
    pb.add('body', G.box, 0xbfb3a0, V(Math.cos(a) * r, y - 0.5, Math.sin(a) * r), [1.9, 1, 1.9], [0, -a, 0]);
    pb.add('body', G.sphS, [0xff7043, 0x7bd65f, 0x4fb2f7, 0xffd43b, 0xb894f2, 0xff86b0][Math.floor(R() * 6)], V(Math.cos(a) * r, y + 0.35, Math.sin(a) * r), 0.45);
  }
  bScene.add(assemble(pb));
})();
const B_POS = { me: V(-1.8, 0.2, 2.2), en: V(1.8, 0.2, -2.0) };
let battle = null;
function resizeBattleCam() {
  const asp = innerWidth / innerHeight; bCam.aspect = asp;
  if (asp < 1) { bCam.fov = clamp(2 * Math.atan(0.3 / asp) * 180 / Math.PI, 40, 72); bCam.position.set(0, 5.2, 14); }
  else { bCam.fov = 40; bCam.position.set(0, 4.4, 11); }
  bCam.lookAt(0, 1.0, 0); bCam.updateProjectionMatrix();
}
function mkFighter(spId, lvl, uid) { const st = fighterStats(SP[spId], lvl); return { spId, lvl, uid, hp: st.hp, max: st.hp, atk: st.atk, skills: skillsFor(SP[spId], lvl), cd: {}, obj: null }; }
function spawnFighter(f, mine) {
  const o = makeMonster(f.spId, stageOf(f.lvl), 1.15); o.position.copy(mine ? B_POS.me : B_POS.en); o.rotation.y = mine ? 1.0 : -0.55;
  o.userData.base = o.position.clone(); bScene.add(o); f.obj = o;
  o.userData.anim.pop = 0.01; tween(0.5, k => { o.userData.anim.pop = Math.max(0.01, easeBack(k)); }); SFX.pop();
}
function startBattle() {
  const team = state.team.map(getMon).filter(Boolean); if (!team.length) return;
  closeSheet();
  battle = { stage: arenaSel, mine: team.map(m => mkFighter(m.sp, m.lvl, m.uid)), enemy: arenaTeam(arenaSel).map(e => mkFighter(e.sp, e.lvl)), mi: 0, ei: 0, turn: 'player', busy: false, over: false };
  battle.enemy.forEach(e => { if (!state.dex.includes(e.spId)) state.seen = true; });
  MODE = 'battle'; document.body.classList.add('battle-bg');
  $('#hud').hidden = true; $('#labels').hidden = true; $('#battleUI').hidden = false;
  resizeBattleCam(); spawnFighter(battle.mine[0], true); spawnFighter(battle.enemy[0], false);
  bLog(`Kademe ${battle.stage}: ${SP[battle.enemy[0].spId].name} meydan okuyor!`); bRender();
}
function bLog(t) { $('#bLog').textContent = t; }
function fCard(f, team, idx) {
  const sp = SP[f.spId], pct = f.hp / f.max * 100;
  return `<div class="top"><span class="grow">${sp.name}</span>${sp.els.map(elIcon).join('')}<small>Sv.${f.lvl}</small></div>
    <div class="bar hp${pct < 30 ? ' low' : ''}"><i style="width:${pct}%"></i></div>
    <div class="hpt"><span>${f.hp}/${f.max} can</span><span class="dots">${team.map((t, i) => `<i class="${t.hp <= 0 ? 'off' : ''}"></i>`).join('')}</span></div>`;
}
function bRender() {
  if (!battle) return;
  const me = battle.mine[battle.mi], en = battle.enemy[battle.ei];
  $('#bcEnemy').innerHTML = en ? fCard(en, battle.enemy, battle.ei) : '';
  $('#bcMine').innerHTML = me ? fCard(me, battle.mine, battle.mi) : '';
  if (!me || !en) { $('#bSkills').innerHTML = ''; return; }
  const can = battle.turn === 'player' && !battle.busy && !battle.over;
  $('#bSkills').innerHTML = me.skills.map((s, i) => {
    const e = effOf(s.el, SP[en.spId]), cd = me.cd[i] || 0, col = s.el ? ELEMENTS[s.el].color : '#8a8fb0';
    const tag = e > 1.2 ? '<em>Süper etkili</em>' : e < 0.9 ? '<em class="weak">Zayıf</em>' : '';
    return `<button class="skill" style="--ec:${col}" data-act="skill" data-i="${i}" ${!can || cd > 0 ? 'disabled' : ''}>${s.el ? elIcon(s.el) : ICO.basic}<span>${s.name}</span><small>Güç ${Math.round(s.pow * 100)}${cd > 0 ? ` · ${cd} tur bekle` : s.cd ? ' · özel' : ''}</small>${tag}</button>`;
  }).join('');
}
function attack(att, def, sk, cb) {
  battle.busy = true; bRender();
  const ao = att.obj, dobj = def.obj, start = ao.userData.base.clone(), dir = dobj.position.clone().sub(start).normalize();
  bLog(`${SP[att.spId].name}: ${sk.name}!`);
  tween(0.18, k => ao.position.copy(start).addScaledVector(dir, ease(k) * 0.9), () => {
    tween(0.25, k => ao.position.copy(start).addScaledVector(dir, (1 - k) * 0.9));
    const col = sk.el ? ELEMENTS[sk.el].hex : 0xffffff, pr = new THREE.Mesh(G.sph, pMat(col));
    pr.scale.setScalar(sk.cd ? 0.5 : 0.32); bScene.add(pr);
    const a = start.clone().add(V(0, 1.4, 0)), b = dobj.position.clone().add(V(0, 1.2, 0));
    tween(0.35, k => { pr.position.lerpVectors(a, b, k); pr.position.y += Math.sin(k * Math.PI) * 1.4; pr.rotation.y += 0.3; }, () => {
      bScene.remove(pr);
      const e = effOf(sk.el, SP[def.spId]), dmg = Math.max(1, Math.round(att.atk * sk.pow * e * (0.9 + Math.random() * 0.2)));
      def.hp = Math.max(0, def.hp - dmg);
      burst(bScene, b, sk.el === 'legend' ? RAINBOW : [col, 0xffffff], sk.cd ? 30 : 18, 5, 0.14, 0.7); SFX.hit();
      const base = dobj.userData.base.clone();
      tween(0.4, k => { dobj.position.x = base.x + Math.sin(k * 40) * 0.18 * (1 - k); });
      const [sx, sy] = screenOf(b.clone().add(V(0, 0.8, 0)), bCam);
      floatText('-' + dmg, sx, sy, e > 1.2 ? '#ffe14d' : e < 0.9 ? '#d6d2e8' : '#ffffff');
      if (e > 1.2) bLog('Süper etkili!'); else if (e < 0.9) bLog('Pek etkili değil...');
      bRender();
      wait(0.6, () => { if (def.hp <= 0) faint(def, cb); else cb(); });
    });
  });
}
function faint(f, cb) {
  bLog(`${SP[f.spId].name} bayıldı!`);
  const o = f.obj;
  tween(0.5, k => { o.userData.anim.pop = Math.max(0.01, 1 - k); o.rotation.y += 0.25; }, () => { bScene.remove(o); cb(); });
}
function tickCd(f) { for (const k in f.cd) if (f.cd[k] > 0) f.cd[k]--; }
function playerSkill(i) {
  if (!battle || battle.turn !== 'player' || battle.busy || battle.over) return;
  const me = battle.mine[battle.mi], en = battle.enemy[battle.ei], sk = me.skills[i];
  if (!sk || (me.cd[i] || 0) > 0) return;
  if (sk.cd) me.cd[i] = sk.cd;
  attack(me, en, sk, () => {
    if (en.hp <= 0) {
      battle.ei++;
      if (battle.ei >= battle.enemy.length) return endBattle(true);
      spawnFighter(battle.enemy[battle.ei], false); bLog(`Sıradaki rakip: ${SP[battle.enemy[battle.ei].spId].name}`);
    }
    battle.turn = 'enemy'; battle.busy = false; bRender(); wait(0.7, enemyTurn);
  });
}
function enemyTurn() {
  if (!battle || battle.over) return;
  const en = battle.enemy[battle.ei], me = battle.mine[battle.mi];
  tickCd(en);
  let best = 0, bs = -1;
  en.skills.forEach((s, i) => { if ((en.cd[i] || 0) > 0) return; const sc = s.pow * effOf(s.el, SP[me.spId]) * (0.8 + Math.random() * 0.4); if (sc > bs) { bs = sc; best = i; } });
  const sk = en.skills[best]; if (sk.cd) en.cd[best] = sk.cd;
  attack(en, me, sk, () => {
    if (me.hp <= 0) {
      battle.mi++;
      if (battle.mi >= battle.mine.length) return endBattle(false);
      spawnFighter(battle.mine[battle.mi], true); bLog(`Haydi ${SP[battle.mine[battle.mi].spId].name}!`);
    }
    tickCd(battle.mine[battle.mi]);
    battle.turn = 'player'; battle.busy = false; bRender();
  });
}
function endBattle(won) {
  battle.over = true; battle.busy = false; bRender();
  const n = battle.stage, rw = arenaReward(n);
  if (won) {
    const first = n === state.arena.max;
    state.gold += rw.gold; state.food += rw.food; if (first) { state.gems += rw.gems; state.arena.max = n + 1; }
    state.stats.wins++; addXP(rw.xp); SFX.win();
    if (battle.mine[battle.mi] && battle.mine[battle.mi].obj) battle.cheer = battle.mine[battle.mi].obj;
    showModal(`<div class="kick">Kademe ${n}</div><h2>Zafer!</h2><p>${first ? 'Yeni kademenin kilidi açıldı.' : 'Bu kademeyi yine geçtin.'}</p><div class="rewards"><span>${ICO.gold}${fmt(rw.gold)}</span><span>${ICO.food}${fmt(rw.food)}</span>${first ? `<span>${ICO.gem}${rw.gems}</span>` : ''}<span>${ICO.xp}${rw.xp}</span></div><div class="row"><button class="btn" data-act="leaveBattle">Adaya dön</button>${first ? '<button class="btn blue" data-act="nextFight">Sonraki kademe</button>' : ''}</div>`);
  } else {
    SFX.lose();
    showModal(`<div class="kick">Kademe ${n}</div><h2>Yenildin</h2><p>Canavarlarını besleyip güçlendir ya da rakiplere karşı etkili elementler seç.</p><div class="row"><button class="btn" data-act="leaveBattle">Adaya dön</button></div>`);
  }
  saveGame(); updateHUD();
}
function leaveBattle() {
  if (battle) { [...battle.mine, ...battle.enemy].forEach(f => { if (f.obj) bScene.remove(f.obj); }); }
  battle = null; MODE = 'world'; document.body.classList.remove('battle-bg');
  $('#hud').hidden = false; $('#labels').hidden = false; $('#battleUI').hidden = true; bLog('');
  updateHUD();
}
function updateBattle(dt, t) {
  if (!battle) return;
  [...battle.mine, ...battle.enemy].forEach(f => { if (f.obj && f.obj.parent) animMonster(f.obj, t, false, battle.over && f.obj === battle.cheer); });
}
