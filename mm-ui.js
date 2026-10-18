'use strict';
/* ---------- icons ---------- */
const ICO = {
  gold: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#ffc53d" stroke="#d48f12" stroke-width="2"/><circle cx="12" cy="12" r="5.5" fill="none" stroke="#fff3c4" stroke-width="2"/></svg>',
  food: '<svg viewBox="0 0 24 24"><path d="M12 7c-2-2-7-2-8 3s2 11 5 11c1.2 0 2-.6 3-.6s1.8.6 3 .6c3 0 6-6 5-11s-6-5-8-3z" fill="#ff5a4a" stroke="#c4302b" stroke-width="1.6"/><path d="M12 7c0-2 1-4 3-5" stroke="#6b3b1f" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M13 5c2-2 5-1 5-1s-1 3-5 2z" fill="#4cc35a"/></svg>',
  gem: '<svg viewBox="0 0 24 24"><path d="M6 3h12l4 6-10 12L2 9z" fill="#ff4f9a" stroke="#c22a6c" stroke-width="1.6" stroke-linejoin="round"/><path d="M2 9h20M9 3l3 6 3-6M12 9v12" stroke="#ffd1e6" stroke-width="1.2" fill="none"/></svg>',
  xp: '<svg viewBox="0 0 24 24"><path d="M12 2l3 6.5 7 .8-5.2 4.7 1.5 7L12 17.5 5.7 21l1.5-7L2 9.3l7-.8z" fill="#7cc3ff" stroke="#2f62c9" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  egg: '<svg viewBox="0 0 24 24"><path d="M12 2c4 0 7 7 7 12a7 7 0 0 1-14 0c0-5 3-12 7-12z" fill="#fff3d6" stroke="#d48f12" stroke-width="1.6"/><circle cx="10" cy="11" r="1.6" fill="#ff7fb8"/><circle cx="14.5" cy="15" r="2" fill="#7bd65f"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 6-8 11-8 11z" fill="currentColor"/></svg>',
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M12 6v6l4 2" stroke="#2a2350" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="11" rx="3" fill="#ffc53d"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="#ffc53d" stroke-width="2.6" fill="none"/></svg>',
  shop: '<svg viewBox="0 0 32 32"><path d="M5 13l3-7h16l3 7z" fill="#ff6b6b"/><path d="M5 13h22v3a3 3 0 0 1-5.5 0 3 3 0 0 1-5.5 0 3 3 0 0 1-5.5 0A3 3 0 0 1 5 16z" fill="#ffd23f"/><rect x="7" y="17" width="18" height="10" rx="1.5" fill="#4a8dff"/><rect x="13" y="20" width="6" height="7" fill="#2a2350"/></svg>',
  mon: '<svg viewBox="0 0 32 32"><path d="M9 9l-2-5 6 3M23 9l2-5-6 3" fill="#ff7043"/><circle cx="16" cy="18" r="11" fill="#7bd65f"/><circle cx="12" cy="16" r="3.2" fill="#fff"/><circle cx="20" cy="16" r="3.2" fill="#fff"/><circle cx="12.6" cy="16.4" r="1.7" fill="#241a3d"/><circle cx="20.6" cy="16.4" r="1.7" fill="#241a3d"/><path d="M12 22q4 3 8 0" stroke="#3b1d2e" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>',
  sword: '<svg viewBox="0 0 32 32"><path d="M6 4l14 14-2 2L4 6V4z" fill="#c0c6d6" stroke="#6b7385" stroke-width="1.2"/><path d="M26 4L12 18l2 2L28 6V4z" fill="#dfe3ee" stroke="#6b7385" stroke-width="1.2"/><path d="M8 20l4 4-3 3-4-4zM24 20l-4 4 3 3 4-4z" fill="#d9534f"/></svg>',
  flag: '<svg viewBox="0 0 32 32"><rect x="6" y="3" width="2.6" height="26" rx="1" fill="#8b5a2b"/><path d="M8.6 4h17l-4 6 4 6h-17z" fill="#3fc25c"/><path d="M13 10l2 2 4-4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1z" fill="#4a8dff"/><path d="M12 6v14" stroke="#fff" stroke-width="1.5"/></svg>',
  sound: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#fff"/><path d="M16 8a5 5 0 0 1 0 8M18.5 5.5a8.5 8.5 0 0 1 0 13" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
  mute: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#fff"/><path d="M16 9l5 6M21 9l-5 6" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
  basic: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="#8a8fb0"/><path d="M8 12h8M12 8v8" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>',
};
const EL_PATH = {
  fire: '<path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-3 2-4 2-7 1 1 2 2 2 4 1-2 1-5 1-8z" fill="@@"/>',
  water: '<path d="M12 2C9 7 6 10 6 14a6 6 0 0 0 12 0c0-4-3-7-6-12z" fill="@@"/>',
  nature: '<path d="M20 4C10 4 4 9 4 16c0 2 1 4 1 4s2-5 7-8c-3 3-5 6-6 9 9 0 14-7 14-17z" fill="@@"/>',
  electric: '<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="@@"/>',
  ice: '<path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7" stroke="@@" stroke-width="2.6" stroke-linecap="round" fill="none"/>',
  shadow: '<path d="M15 3a9 9 0 1 0 6 13A8 8 0 0 1 15 3z" fill="@@"/>',
  legend: '<path d="M12 2l3 6.5 7 .8-5.2 4.7 1.5 7L12 17.5 5.7 21l1.5-7L2 9.3l7-.8z" fill="@@"/>',
};
const elIcon = el => '<svg viewBox="0 0 24 24">' + EL_PATH[el].replace(/@@/g, ELEMENTS[el].color) + '</svg>';
const elChip = el => `<span class="chip" style="--ec:${ELEMENTS[el].color}">${elIcon(el)}${ELEMENTS[el].name}</span>`;
const spChips = sp => sp.els.map(elChip).join(' ');
const res = (k, n) => `<span class="row" style="gap:3px;display:inline-flex">${ICO[k].replace('<svg', '<svg style="width:18px;height:18px"')}<b>${fmt(n)}</b></span>`;
document.querySelectorAll('[data-ico]').forEach(i => { i.outerHTML = ICO[i.dataset.ico]; });

/* ---------- HUD ---------- */
function updateHUD() {
  $('#vGold').textContent = fmt(state.gold); $('#vFood').textContent = fmt(state.food); $('#vGem').textContent = fmt(state.gems);
  $('#lvlNum').textContent = state.lvl;
  $('#xpRing').setAttribute('stroke-dashoffset', String(113 * (1 - Math.min(1, state.xp / xpNeed(state.lvl)))));
  $('#bSound').innerHTML = state.sound ? ICO.sound : ICO.mute;
  const c = claimableGoals(), b = $('#goalBadge'); b.hidden = !c; b.textContent = c;
}
function toast(msg, kind) {
  const t = document.createElement('div'); t.className = 'toast' + (kind ? ' ' + kind : ''); t.textContent = msg;
  const box = $('#toasts'); box.appendChild(t); while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => t.remove(), 2600);
}
function flyTo(kind, x, y, n = 4) {
  const target = $(kind === 'gold' ? '#pGold' : kind === 'food' ? '#pFood' : kind === 'gem' ? '#pGem' : '#lvlNum').getBoundingClientRect();
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div'); el.className = 'fly'; el.innerHTML = ICO[kind] || ICO.xp; document.body.appendChild(el);
    const sx = x + (Math.random() - 0.5) * 40, sy = y + (Math.random() - 0.5) * 30;
    const a = el.animate([{ transform: `translate(${sx}px,${sy}px) scale(.6)` }, { transform: `translate(${sx}px,${sy - 40}px) scale(1.1)`, offset: 0.3 }, { transform: `translate(${target.left + 4}px,${target.top + 2}px) scale(.7)` }], { duration: 650 + i * 80, easing: 'ease-in' });
    a.onfinish = () => el.remove();
  }
}
function floatText(txt, x, y, color) {
  const el = document.createElement('div'); el.className = 'float'; el.textContent = txt; if (color) el.style.color = color;
  document.body.appendChild(el);
  const a = el.animate([{ transform: `translate(${x}px,${y}px) translate(-50%,-50%) scale(.6)`, opacity: 1 }, { transform: `translate(${x}px,${y - 30}px) translate(-50%,-50%) scale(1.15)`, opacity: 1, offset: 0.3 }, { transform: `translate(${x}px,${y - 70}px) translate(-50%,-50%) scale(1)`, opacity: 0 }], { duration: 1100, easing: 'ease-out' });
  a.onfinish = () => el.remove();
}
function screenOf(v3, cam) { const p = v3.clone().project(cam); return [(p.x * 0.5 + 0.5) * innerWidth, (-p.y * 0.5 + 0.5) * innerHeight]; }

/* ---------- sheet + modal ---------- */
let sheetFn = null;
function openSheet(fn) { sheetFn = fn; renderSheet(); $('#sheetWrap').hidden = false; }
function renderSheet() {
  if (!sheetFn) return;
  const r = sheetFn(); if (!r) { closeSheet(); return; }
  const body = $('#sheetBody'), st = body.scrollTop;
  $('#sheetTitle').innerHTML = r.title; body.innerHTML = r.body; body.scrollTop = st;
}
function closeSheet() { sheetFn = null; $('#sheetWrap').hidden = true; }
function refreshSheet() { if (sheetFn) renderSheet(); }
let modalQueue = [];
function showModal(html) { if (!$('#modalWrap').hidden) { modalQueue.push(html); return; } $('#modal').innerHTML = html; $('#modalWrap').hidden = false; }
function closeModal() { $('#modalWrap').hidden = true; if (modalQueue.length) showModal(modalQueue.shift()); }
const timerTxt = end => `<span data-end="${end}">${fmtT(end - now())}</span>`;
function tickTimers() {
  let expired = false;
  document.querySelectorAll('#sheetBody [data-end]').forEach(el => { const ms = +el.dataset.end - now(); if (ms <= 0) expired = true; el.textContent = fmtT(ms); });
  document.querySelectorAll('#sheetBody [data-gold]').forEach(el => { el.textContent = fmt(goldOf(el.dataset.gold)); });
  if (expired) refreshSheet();
}

/* ---------- reusable pieces ---------- */
function monCard(m, opts = {}) {
  const sp = SP[m.sp];
  return `<button class="mcard${opts.sel ? ' sel' : ''}" data-act="${opts.act || 'mon'}" data-uid="${m.uid}"${opts.extra || ''}${opts.sel ? ` data-n="${opts.sel}"` : ''}>
    <span class="els">${sp.els.map(elIcon).join('')}</span><img src="${monImg(m)}" alt=""><span class="nm">${sp.name}</span><span class="lv">Sv.${m.lvl} · ${STAGES[stageOf(m.lvl)]}</span>${opts.tag ? `<span class="tag">${opts.tag}</span>` : ''}</button>`;
}
const habName = key => { const h = state.plots[key]; return h ? ELEMENTS[h.el].name + ' Habitatı' : 'Evsiz'; };
const btnCost = (k, n, label, act, data = '', dis) => `<button class="btn ${k === 'gem' ? 'gem' : k === 'gold' ? 'gold' : ''}" data-act="${act}" ${data} ${dis ? 'disabled' : ''}>${label} ${ICO[k]}${fmt(n)}</button>`;

/* ---------- sheets ---------- */
function sheetHab(key) {
  return () => {
    const h = state.plots[key]; if (!h) return null;
    const mons = monsIn(key), cap = habCap(h), slots = habSlots(h), g = goldOf(key), rate = habRate(key);
    let grid = mons.map(m => monCard(m)).join('');
    for (let i = mons.length; i < slots; i++) grid += `<button class="mcard empty" data-act="addToHab" data-key="${key}"><b>+</b>Canavar ekle</button>`;
    const up = h.lvl < 3 ? btnCost('gold', HAB_UP[h.lvl - 1], 'Geliştir', 'upgradeHab', `data-key="${key}"`, state.gold < HAB_UP[h.lvl - 1]) : '<span class="muted">En yüksek seviyede</span>';
    return {
      title: `${ELEMENTS[h.el].name} Habitatı <small class="muted">Sv.${h.lvl}</small>`,
      body: `<div class="card"><div class="row"><div class="grow"><div class="lab">Biriken altın</div><div class="row" style="gap:4px;font-family:var(--f-display);font-size:22px">${ICO.gold.replace('<svg', '<svg style="width:24px;height:24px"')}<span data-gold="${key}">${fmt(g)}</span><small class="muted">/ ${fmt(cap)}</small></div></div><button class="btn gold" data-act="collect" data-key="${key}" ${g < 1 ? 'disabled' : ''}>Topla</button></div>
        <div class="bar" style="margin-top:8px"><i style="width:${(g / cap * 100).toFixed(1)}%"></i></div><p class="muted" style="margin:6px 0 0">Üretim: dakikada ${fmt(rate)} altın. Depo dolunca üretim durur.</p></div>
        <div class="lab">Sakinler ${mons.length}/${slots}</div><div class="mgrid">${grid}</div>
        <div class="row"><div class="grow muted">${h.lvl < 3 ? `Sv.${h.lvl + 1}: ${HAB_SLOTS[h.lvl]} yuva, ${fmt(HAB_CAP[h.lvl])} altın depo` : ''}</div>${up}</div>`,
    };
  };
}
function sheetMon(uid) {
  return () => {
    const m = getMon(uid); if (!m) return null;
    const sp = SP[m.sp], st = stageOf(m.lvl), fs = fighterStats(sp, m.lvl), cost = feedCost(m.lvl);
    const evo = STAGES.map((n, i) => `<div class="${st >= i ? 'on' : ''}">${n}<small>Sv.${STAGE_LVL[i]}</small></div>`).join('');
    const next = STAGE_LVL.find(l => l > m.lvl);
    const feed = m.lvl < MAX_LVL ? btnCost('food', cost, 'Besle', 'feed', `data-uid="${m.uid}"`, state.food < cost) : '<span class="muted">En yüksek seviye</span>';
    const skills = skillsFor(sp, m.lvl).map(s => `<span class="chip" style="--ec:${s.el ? ELEMENTS[s.el].color : '#8a8fb0'}">${s.el ? elIcon(s.el) : ICO.basic}${s.name}</span>`).join(' ');
    return {
      title: sp.name,
      body: `<div class="hero"><img src="${monImg(m)}" alt=""><div class="grow" style="display:flex;flex-direction:column;gap:6px"><div class="row" style="gap:6px">${spChips(sp)}</div><div class="muted"><b>${rarityOf(sp)}</b> · ${STAGES[st]} · Sv.${m.lvl}</div><div class="muted">${m.hab ? habName(m.hab) + '’nda yaşıyor' : 'Evsiz. Uygun bir habitata taşı.'}</div></div></div>
        <p class="muted" style="margin:0">${sp.desc}</p>
        <div class="stats"><div class="stat"><b>${fs.hp}</b><span>Can</span></div><div class="stat"><b>${fs.atk}</b><span>Güç</span></div><div class="stat"><b>${fmt(goldRate(m))}</b><span>Altın/dk</span></div></div>
        <div class="lab">Evrim</div><div class="evo">${evo}</div>
        <div class="row"><div class="grow muted">${next ? `${next - m.lvl} seviye sonra ${STAGES[stageOf(next)]} evresine geçer.` : m.lvl < MAX_LVL ? 'Usta evresine yaklaşıyor.' : 'Tam güçte.'}</div>${feed}</div>
        <div class="lab">Arena hamleleri</div><div class="row" style="gap:6px">${skills}</div>
        <div class="row"><button class="btn blue" data-act="movePick" data-uid="${m.uid}">Taşı</button><span class="grow"></span><button class="btn ghost" data-act="release" data-uid="${m.uid}">Serbest bırak (+${fmt(releaseValue(m))} altın)</button></div>`,
    };
  };
}
function sheetPick(title, list, act, data, empty) {
  return () => ({ title, body: list().length ? `<div class="mgrid">${list().map(m => monCard(m, { act, extra: data, tag: m.hab ? habName(m.hab) : 'Evsiz' })).join('')}</div>` : `<p class="muted">${empty}</p>` });
}
function sheetHatchery() {
  return () => {
    let html = '';
    for (let i = 0; i < HATCH_SLOTS; i++) {
      const e = state.eggs[i];
      if (!e) { html += `<div class="item"><div class="ic">${ICO.egg}</div><div class="grow"><h3>Boş yuva</h3><p>Mağazadan yumurta al ya da Sevgi Ağacı’nda iki canavarı eşleştir.</p></div><button class="btn sm ghost" data-act="shop" data-tab="eggs">Mağaza</button></div>`; continue; }
      const sp = SP[e.sp], ready = now() >= e.end;
      html += `<div class="item" style="--ec:${ELEMENTS[sp.els[0]].color}"><div class="ic"><img src="${portrait(e.sp, 0, true)}" alt=""></div><div class="grow"><h3>${sp.name} yumurtası</h3><p>${ready ? 'Çatlamaya hazır!' : 'Çatlamasına ' + timerTxt(e.end)}</p></div>${ready ? `<button class="btn" data-act="hatch" data-i="${i}">Çatlat</button>` : btnCost('gem', gemCost(e.end - now()), 'Hızlandır', 'speedEgg', `data-i="${i}"`, state.gems < gemCost(e.end - now()))}</div>`;
    }
    return { title: 'Kuluçkahane', body: `<p class="muted" style="margin:0">Yumurtalar burada ısınır. Çatlayan canavar uygun boş habitata kendiliğinden yerleşir.</p>${html}` };
  };
}
let breedSel = { a: null, b: null };
function outcomeHtml(a, b) {
  const pool = breedPool(a, b), items = pool.list.map(x => ({ id: x.id, p: x.p }));
  if (pool.legend) items.push({ id: 'prizmo', p: pool.legend });
  return `<div class="outs">${items.map(x => { const known = state.dex.includes(x.id); return `<div class="out${known ? '' : ' lockd'}"><img src="${portrait(x.id, 0)}" alt="">${known ? SP[x.id].name : '???'}<span class="muted" style="font-size:11px">%${Math.round(x.p * 100)}</span></div>`; }).join('')}</div>`;
}
function sheetBreed() {
  return () => {
    const b = state.breed;
    if (b) {
      const done = now() >= b.end;
      return { title: 'Sevgi Ağacı', body: `<div class="slots"><div class="out"><img src="${portrait(b.aSp, stageOf(b.aLvl))}" alt="">${SP[b.aSp].name}</div><span class="heart">${ICO.heart}</span><div class="out"><img src="${portrait(b.bSp, stageOf(b.bLvl))}" alt="">${SP[b.bSp].name}</div></div>
        ${done ? `<div class="item"><div class="ic"><img src="${portrait(b.sp, 0, true)}" alt=""></div><div class="grow"><h3>Yeni bir yumurta!</h3><p>Kuluçkahaneye taşı ve çatlamasını bekle.</p></div><button class="btn" data-act="breedCollect">Kuluçkaya taşı</button></div>`
          : `<div class="card row"><div class="grow"><div class="lab">Eşleşme sürüyor</div><div style="font-family:var(--f-display);font-size:22px">${timerTxt(b.end)}</div></div>${btnCost('gem', gemCost(b.end - now()), 'Hızlandır', 'speedBreed', '', state.gems < gemCost(b.end - now()))}</div>`}` };
    }
    const A = breedSel.a && getMon(breedSel.a), B = breedSel.b && getMon(breedSel.b);
    const slot = (m, k) => m ? monCard(m, { act: 'breedPick', extra: ` data-slot="${k}"` }) : `<button class="mcard empty" data-act="breedPick" data-slot="${k}"><b>+</b>Canavar seç</button>`;
    return { title: 'Sevgi Ağacı', body: `<p class="muted" style="margin:0">İki canavarı eşleştir. Farklı elementler yeni melez türlerin kapısını açar. Canavarların en az Sv.${BREED_LVL} olmalı.</p>
      <div class="slots">${slot(A, 'a')}<span class="heart">${ICO.heart}</span>${slot(B, 'b')}</div>
      ${A && B ? `<div class="lab">Olası sonuçlar</div>${outcomeHtml(A.sp, B.sp)}<button class="btn wide" data-act="breedStart">Eşleştir</button>` : ''}` };
  };
}
function sheetFarm(key) {
  return () => {
    const p = state.plots[key]; if (!p) return null;
    if (p.crop) {
      const c = CROP[p.crop], ready = now() >= p.end;
      return { title: 'Çiftlik', body: `<div class="item"><div class="ic">${ICO.food}</div><div class="grow"><h3>${c.name}</h3><p>${ready ? `Hasada hazır: +${c.food} yem` : 'Hasada ' + timerTxt(p.end)}</p></div>${ready ? `<button class="btn" data-act="harvest" data-key="${key}">Hasat et</button>` : btnCost('gem', gemCost(p.end - now()), 'Hızlandır', 'speedFarm', `data-key="${key}"`, state.gems < gemCost(p.end - now()))}</div>` };
    }
    return { title: 'Çiftlik', body: `<p class="muted" style="margin:0">Yem yetiştir. Yem, canavarlarını büyütüp evrimleştirir.</p>` + CROPS.map(c => { const lk = state.lvl < c.lvl; return `<div class="item${lk ? ' lk' : ''}"><div class="ic">${ICO.food}</div><div class="grow"><h3>${c.name}</h3><p>${fmtT(c.time * 1000)} · +${c.food} yem${lk ? ` · Sv.${c.lvl} gerekir` : ''}</p></div>${btnCost('gold', c.cost, 'Ek', 'plant', `data-key="${key}" data-crop="${c.id}"`, lk || state.gold < c.cost)}</div>`; }).join('') };
  };
}
let shopTab = 'habs';
function sheetShop() {
  return () => {
    const tabs = [['habs', 'Habitat'], ['eggs', 'Yumurta'], ['farm', 'Çiftlik'], ['gems', 'Elmas']].map(([k, n]) => `<button class="${shopTab === k ? 'on' : ''}" data-act="shopTab" data-tab="${k}">${n}</button>`).join('');
    let body = '';
    if (shopTab === 'habs') body = EL_KEYS.map(el => { const I = HAB_INFO[el], lk = state.lvl < I.lvl; return `<div class="item${lk ? ' lk' : ''}" style="--ec:${ELEMENTS[el].color}"><div class="ic">${elIcon(el)}</div><div class="grow"><h3>${ELEMENTS[el].name} Habitatı</h3><p>${lk ? `Sv.${I.lvl} gerekir` : `${HAB_SLOTS[0]} yuva · ${fmt(HAB_CAP[0])} altın depo`}</p></div>${btnCost('gold', I.cost, 'Kur', 'buyHab', `data-el="${el}"`, lk || state.gold < I.cost)}</div>`; }).join('');
    if (shopTab === 'eggs') body = `<p class="muted" style="margin:0">Saf element yumurtaları. Melezler yalnızca eşleştirmeyle çıkar.</p>` + EL_KEYS.map(el => { const sp = pureOf(el), lk = state.lvl < HAB_INFO[el].lvl; return `<div class="item${lk ? ' lk' : ''}" style="--ec:${ELEMENTS[el].color}"><div class="ic"><img src="${portrait(sp.id, 0, true)}" alt=""></div><div class="grow"><h3>${sp.name}</h3><p>${lk ? `Sv.${HAB_INFO[el].lvl} gerekir` : `${ELEMENTS[el].name} · ${fmtT(hatchTime(sp))} kuluçka`}</p></div>${btnCost('gold', EGG_PRICE[el], 'Al', 'buyEgg', `data-el="${el}"`, lk || state.gold < EGG_PRICE[el])}</div>`; }).join('');
    if (shopTab === 'farm') body = `<div class="item"><div class="ic">${ICO.food}</div><div class="grow"><h3>Çiftlik</h3><p>Canavarların için yem yetiştirir.</p></div>${btnCost('gold', FARM_COST, 'Kur', 'buyFarm', '', state.gold < FARM_COST)}</div>`;
    if (shopTab === 'gems') body = `<p class="muted" style="margin:0">Elmaslar Arena zaferleri, görevler ve seviye atlamakla kazanılır.</p>
      <div class="item"><div class="ic">${ICO.gold}</div><div class="grow"><h3>Altın kesesi</h3><p>+1.000 altın</p></div>${btnCost('gem', 10, 'Takas', 'swap', 'data-k="gold"', state.gems < 10)}</div>
      <div class="item"><div class="ic">${ICO.food}</div><div class="grow"><h3>Yem sepeti</h3><p>+300 yem</p></div>${btnCost('gem', 10, 'Takas', 'swap', 'data-k="food"', state.gems < 10)}</div>`;
    return { title: 'Mağaza', body: `<div class="tabs">${tabs}</div>${body}` };
  };
}
let colTab = 'mine';
function sheetCollection() {
  return () => {
    const tabs = `<div class="tabs"><button class="${colTab === 'mine' ? 'on' : ''}" data-act="colTab" data-tab="mine">Canavarlarım (${state.monsters.length})</button><button class="${colTab === 'book' ? 'on' : ''}" data-act="colTab" data-tab="book">Kitap ${state.dex.length}/${SPECIES.length}</button></div>`;
    if (colTab === 'mine') {
      const list = state.monsters.slice().sort((a, b) => b.lvl - a.lvl);
      return { title: 'Canavarlar', body: tabs + `<div class="mgrid">${list.map(m => monCard(m, { tag: m.hab ? habName(m.hab) : 'Evsiz' })).join('')}</div>` };
    }
    const cards = SPECIES.map(sp => {
      const k = state.dex.includes(sp.id);
      const hint = isLegend(sp) ? 'Toplam 4 elementli iki canavarı eşleştir' : sp.els.length > 1 ? sp.els.map(e => ELEMENTS[e].name).join(' + ') + ' eşleştir' : ELEMENTS[sp.els[0]].name + ' yumurtası';
      return `<div class="mcard${k ? '' : ' lockd'}" style="cursor:default"><span class="els">${sp.els.map(elIcon).join('')}</span><img src="${portrait(sp.id, 2)}" alt=""><span class="nm">${k ? sp.name : '???'}</span><span class="tag">${k ? rarityOf(sp) : hint}</span></div>`;
    }).join('');
    return { title: 'Canavarlar', body: tabs + `<div class="mgrid">${cards}</div>` };
  };
}
let arenaSel = 1;
function sheetArena() {
  return () => {
    arenaSel = clamp(arenaSel, 1, state.arena.max);
    const team = arenaTeam(arenaSel), rw = arenaReward(arenaSel);
    state.team = state.team.filter(u => getMon(u));
    const mine = state.monsters.slice().sort((a, b) => b.lvl - a.lvl);
    const opp = team.map(e => `<div class="out"><img src="${portrait(e.sp, stageOf(e.lvl))}" alt="">${state.dex.includes(e.sp) ? SP[e.sp].name : '???'}<span class="row" style="gap:2px">${SP[e.sp].els.map(elIcon).join('').replace(/<svg/g, '<svg style="width:14px;height:14px"')}<b>Sv.${e.lvl}</b></span></div>`).join('');
    return {
      title: 'Arena',
      body: `<div class="card"><div class="stepper"><button class="btn sm ghost" data-act="arenaStep" data-d="-1" ${arenaSel <= 1 ? 'disabled' : ''}>‹</button><b>Kademe ${arenaSel}</b><button class="btn sm ghost" data-act="arenaStep" data-d="1" ${arenaSel >= state.arena.max ? 'disabled' : ''}>›</button></div>
        <div class="lab" style="margin-top:8px">Rakipler</div><div class="outs">${opp}</div>
        <div class="lab" style="margin-top:6px">Ödül</div><div class="rewards" style="justify-content:flex-start"><span>${ICO.gold}${fmt(rw.gold)}</span><span>${ICO.food}${fmt(rw.food)}</span>${arenaSel === state.arena.max ? `<span>${ICO.gem}${rw.gems}</span>` : ''}<span>${ICO.xp}${rw.xp}</span></div></div>
        <div class="lab">Takımını seç (en fazla 3) · ${state.team.length}/3</div>
        <div class="mgrid">${mine.map(m => { const i = state.team.indexOf(m.uid); return monCard(m, { act: 'teamToggle', sel: i >= 0 ? i + 1 : 0 }); }).join('')}</div>
        <p class="muted" style="margin:0">Ateş doğayı ve buzu, su ateşi ve şimşeği, doğa suyu ve şimşeği yener. Şimşek suyu ve gölgeyi, buz doğayı ve gölgeyi, gölge ateşi ve buzu yener.</p>
        <button class="btn wide" data-act="fight" ${state.team.length ? '' : 'disabled'}>Savaşa başla</button>`,
    };
  };
}
function sheetGoals() {
  return () => {
    const list = GOALS.filter(g => !state.claimed.includes(g.id)).slice(0, 6);
    const rw = r => Object.entries(r).map(([k, n]) => `<span class="row" style="gap:2px;display:inline-flex">${ICO[k === 'gems' ? 'gem' : k].replace('<svg', '<svg style="width:16px;height:16px"')}${fmt(n)}</span>`).join(' ');
    const items = list.map(g => { const s = goalState(g); return `<div class="goal${s.done ? ' done' : ''}"><div class="grow"><b>${g.t}</b><div class="row" style="gap:8px;margin-top:4px"><div class="bar xp grow"><i style="width:${s.v / g.n * 100}%"></i></div><small class="muted">${s.v}/${g.n}</small></div><small class="muted">Ödül: ${rw(g.r)}</small></div>${s.done ? `<button class="btn sm" data-act="claim" data-id="${g.id}">Al</button>` : ''}</div>`; }).join('');
    return { title: 'Görevler', body: `<div class="card row"><div class="grow"><div class="lab">Oyuncu seviyesi ${state.lvl}</div><div class="bar xp" style="margin-top:6px"><i style="width:${Math.min(100, state.xp / xpNeed(state.lvl) * 100)}%"></i></div></div><small class="muted">${fmt(state.xp)}/${fmt(xpNeed(state.lvl))} XP</small></div>${items || '<p class="muted">Bütün görevleri tamamladın. Gerçek bir canavar ustasısın!</p>'}` };
  };
}
function sheetIsland(i) {
  return () => {
    const I = ISLANDS[i]; if (state.islands[i]) return null;
    const lk = state.lvl < I.lvl;
    return { title: I.name, body: `<p class="muted" style="margin:0">Bulutların ardında ${I.plots.length} yeni yapı alanı seni bekliyor.</p><div class="item"><div class="ic">${ICO.lock}</div><div class="grow"><h3>Adayı aç</h3><p>${lk ? `Sv.${I.lvl} gerekir (şu an Sv.${state.lvl})` : 'Köprü kurulur, bulutlar dağılır.'}</p></div>${btnCost('gold', I.price, 'Aç', 'unlock', `data-i="${i}"`, lk || state.gold < I.price)}</div>` };
  };
}
