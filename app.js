/* ============================================================
   CHRONICLES OF THE SHATTERED VEIL
   A dark fantasy evolving-story RPG (client-side demo)
   ============================================================ */

const DB = {
  get(k, fb) { try { return JSON.parse(localStorage.getItem('sv_' + k)) ?? fb; } catch { return fb; } },
  set(k, v) { localStorage.setItem('sv_' + k, JSON.stringify(v)); }
};

/* ------------------- Static game data ------------------- */

const ADMIN_KEY = 'NYX-ADMIN-777'; // enter this at signup to forge a Goddess (admin) account

const RACES = {
  Human:     { desc: 'Adaptable and ambitious.', evo: ['Human', 'Awakened Human', 'Ascendant', 'Demigod'], evoLevel: [1, 10, 20, 35], bonus: { vit: 1, luk: 1 } },
  Elf:       { desc: 'Graceful, attuned to the weave.', evo: ['Elf', 'High Elf', 'Fae-Touched', 'Archfey'], evoLevel: [1, 10, 20, 35], bonus: { dex: 2 } },
  Demon:     { desc: 'Born of the pit, feared by all.', evo: ['Demon', 'Greater Demon', 'Archdemon', 'Demon Lord'], evoLevel: [1, 10, 20, 35], bonus: { str: 2 } },
  Beastfolk: { desc: 'Wild blood, keen senses.', evo: ['Beastfolk', 'Chimera', 'Divine Beast', 'Beast Sovereign'], evoLevel: [1, 10, 20, 35], bonus: { str: 1, dex: 1 } },
  Spirit:    { desc: 'A soul given form, half in this world.', evo: ['Spirit', 'Wisp', 'Greater Spirit', 'Elemental God'], evoLevel: [1, 10, 20, 35], bonus: { int: 2 } }
};

const CLASSES = {
  Warrior: { desc: 'Front-line devastation.', base: { str: 6, dex: 3, int: 2, vit: 6, luk: 2 }, skill: 'whirlwind' },
  Mage:    { desc: 'Arcane artillery.',      base: { str: 2, dex: 3, int: 8, vit: 3, luk: 3 }, skill: 'fireball' },
  Rogue:   { desc: 'Shadow and steel.',      base: { str: 4, dex: 8, int: 3, vit: 3, luk: 4 }, skill: 'shadowstep' },
  Cleric:  { desc: 'Faith made flesh.',      base: { str: 3, dex: 3, int: 6, vit: 6, luk: 3 }, skill: 'heal' },
  Ranger:  { desc: 'The horizon is home.',   base: { str: 4, dex: 6, int: 3, vit: 4, luk: 5 }, skill: 'multishot' }
};

const SKILLS = {
  whirlwind:  { name: 'Whirlwind',      desc: 'Sweep all nearby foes in a storm of steel.', cost: 1 },
  fireball:   { name: 'Fireball',       desc: 'Hurl a sphere of hungry flame.', cost: 1 },
  shadowstep: { name: 'Shadowstep',     desc: 'Vanish into darkness and reappear behind your prey.', cost: 1 },
  heal:       { name: 'Mend Flesh',     desc: 'Knit wounds closed with radiant light.', cost: 1 },
  multishot:  { name: 'Multishot',      desc: 'Loose a fan of arrows in a heartbeat.', cost: 1 },
  bloodpact:  { name: 'Blood Pact',     desc: 'Trade your own vitality for terrible power. (+5 STR while active)', cost: 2, reqLevel: 5 },
  soulfire:   { name: 'Soulfire',       desc: 'Burn your own essence as fuel. Spells ignore all resistance.', cost: 2, reqLevel: 5 },
  veilwalk:   { name: 'Veilwalk',       desc: 'Step between the world and the other side at will.', cost: 2, reqLevel: 8 },
  judgement:  { name: "Goddess' Judgement", desc: 'Call down the wrath of the heavens upon one target.', cost: 3, reqLevel: 12 }
};

const ITEM_POOL = {
  'Healing Draught':  { type: 'consumable', desc: 'Bitter, but it closes wounds. Restores 50% HP.', effect: { heal: 0.5 } },
  'Mana Vial':        { type: 'consumable', desc: 'Liquid moonlight. Restores 60% MP.', effect: { mana: 0.6 } },
  'Elixir of the Veil': { type: 'consumable', desc: 'A goddess-touched draught. Fully restores HP & MP.', effect: { heal: 1, mana: 1 } },
  'Rusty Sword':      { type: 'weapon', desc: 'Better than fists. +2 STR', effect: { str: 2 } },
  'Runed Greatblade': { type: 'weapon', desc: 'Runes gutter like embers along its length. +5 STR', effect: { str: 5 } },
  'Staff of Whispers': { type: 'weapon', desc: 'It murmurs secrets of the old world. +5 INT', effect: { int: 5 } },
  "Hunter's Bow":     { type: 'weapon', desc: 'Strung with the sinew of a fallen star. +4 DEX', effect: { dex: 4 } },
  'Shadowcloak':      { type: 'armor', desc: 'Woven from dusk itself. +3 DEX, +10% dodge', effect: { dex: 3 } },
  'Bulwark Plate':    { type: 'armor', desc: 'A wall you can wear. +5 VIT', effect: { vit: 5 } },
  'Circlet of Stars': { type: 'armor', desc: 'Cold light hums against your brow. +4 INT, +2 LUK', effect: { int: 4, luk: 2 } },
  'Goddess\' Sigil':  { type: 'trinket', desc: 'Proof the Goddess has noticed you. +3 to all stats.', effect: { str: 3, dex: 3, int: 3, vit: 3, luk: 3 } },
  'Cursed Idol':      { type: 'trinket', desc: 'It watches back. +6 STR, but the Goddess frowns.', effect: { str: 6 } }
};

const STAT_NAMES = { str: 'Strength', dex: 'Dexterity', int: 'Intelligence', vit: 'Vitality', luk: 'Luck' };
const STAT_DESC = {
  str: 'Physical power. Increases damage.',
  dex: 'Speed and precision. Improves evasion and crit.',
  int: 'Arcane power. Increases MP and spell damage.',
  vit: 'Hardiness. Increases HP and resilience.',
  luk: 'Fortune. Better loot, crits, and rare encounters.'
};
const XP_FOR_LEVEL = lvl => Math.floor(100 * Math.pow(lvl, 1.6));

/* ------------------- AI Chronicler ------------------- */
/* Free, keyless text API (Pollinations). Falls back to local
   templated narration if the network or API is unavailable. */

const AI_ENDPOINT = 'https://text.pollinations.ai/';

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
  ]);
}

async function askChronicler(systemPrompt, userPrompt) {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];
  // 1) Puter.js — free, keyless. Hard 30s cap: a hung request must never freeze the chronicle.
  if (window.puter?.ai?.chat) {
    try {
      const resp = await withTimeout(puter.ai.chat(messages), 30000);
      const text = (resp?.message?.content ??
        (typeof resp?.toString === 'function' ? resp.toString() : '') ?? '').trim();
      if (text && text.length > 20 && !text.startsWith('{')) return text;
    } catch (e) { /* fall through */ }
  }
  // 2) Pollinations (deprecated, often 402 — kept as backup, 12s cap)
  try {
    const res = await withTimeout(fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, model: 'openai' })
    }), 12000);
    if (res.ok) {
      const text = (await res.text()).trim();
      if (text && !text.startsWith('{"error"') && text.length > 20) return text;
    }
  } catch { /* fall through */ }
  return null;
}

function chronicleContext() {
  const recent = getStory().slice(-6).map(e =>
    `${e.type === 'goddess' ? 'GODDESS' : e.type === 'system' ? 'FATE' : e.author}: ${e.text.slice(0, 300)}`
  ).join('\n');
  return recent || '(The chronicle is blank.)';
}

function charContext(c) {
  if (!c) return '';
  return `Name: ${c.name}. Level ${c.level} ${RACES[c.race].evo[c.raceTier]} ${c.cls}. ` +
    `Stats (STR/DEX/INT/VIT/LUK): ${c.stats.str}/${c.stats.dex}/${c.stats.int}/${c.stats.vit}/${c.stats.luk}. ` +
    `HP ${c.hp}/${charMaxHp(c)}, MP ${c.mp}/${charMaxMp(c)}, ${c.gold} gold. ` +
    `Skills: ${c.skills.map(s => SKILLS[s].name).join(', ')}. ` +
    `Blessings: ${c.blessings.length}. Curses: ${c.curses.length}. ` +
    `Equipment: ${Object.values(c.equipment).filter(Boolean).join(', ') || 'none'}.`;
}

const CHRONICLER_SYSTEM =
  'You are the Chronicler of the Shattered Veil, an omniscient narrator of a dark fantasy world. ' +
  'Write in second person for the player character, gothic and atmospheric, 2-4 sentences. ' +
  'React to what just happened: let the world push back, offer hooks, danger, mystery or consequence. ' +
  'Reference the character\'s traits, injuries, blessings or curses when relevant. ' +
  'Never break character. No headers, no lists, no meta-commentary. Plain prose only.';

function localConsequence(c, action) {
  const hooks = [
    'the torches gutter and something unseen observes from the dark',
    'a raven with eyes like wet ink lands nearby and speaks one word before dying',
    'the ground remembers an older name than the one men use here',
    'a bell tolls somewhere below the earth',
    'shadows lean closer, eager to see what you will do next',
    'the air tastes of iron and rain that has not yet fallen'
  ];
  const hook = hooks[Math.floor(Math.random() * hooks.length)];
  const wound = c && c.hp < charMaxHp(c) * 0.5 ? ' Your wounds throb in time with something distant.' : '';
  return `You act, and the Veil shifts around your choice: ${hook}.${wound} The story does not end here — it sharpens.`;
}

/* ------------------- State ------------------- */

let session = DB.get('session', null);   // username
let view = 'story';                       // story | character | skills | inventory | admin | players

/* ------------------- Helpers ------------------- */

const $ = sel => document.querySelector(sel);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtTime = t => new Date(t).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const uid = () => Math.random().toString(36).slice(2, 10);

function getUsers() { return DB.get('users', {}); }
function saveUsers(u) { DB.set('users', u); }
function getChars() { return DB.get('chars', {}); }
function saveChars(c) { DB.set('chars', c); }
function getStory() { return DB.get('story', []); }
function saveStory(s) { DB.set('story', s); }

function currentUser() { return session ? getUsers()[session] : null; }
function myChar() { const c = getChars(); return session ? c[session] : null; }

function toast(msg, kind = '') {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const el = document.createElement('div');
  el.className = 'toast ' + kind;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4200);
}

/* Derived character values */
function charMaxHp(c) { return 50 + c.stats.vit * 10 + c.level * 6 + c.raceTier * 25; }
function charMaxMp(c) { return 20 + c.stats.int * 6 + c.level * 4 + c.raceTier * 15; }
function gearBonus(c) {
  const out = { str: 0, dex: 0, int: 0, vit: 0, luk: 0 };
  for (const slot of ['weapon', 'armor', 'trinket']) {
    const item = c.equipment[slot];
    if (!item) continue;
    const eff = ITEM_POOL[item]?.effect || {};
    for (const k in eff) if (out[k] !== undefined) out[k] += eff[k];
  }
  return out;
}
function effStats(c) {
  const g = gearBonus(c);
  const out = {};
  for (const k of Object.keys(STAT_NAMES)) out[k] = c.stats[k] + g[k] + (c.blessings?.length || 0) - (c.curses?.length || 0);
  return out;
}

/* ------------------- Auth ------------------- */

function renderAuth(mode = 'login') {
  view = 'auth';
  $('#app').innerHTML = `
  <div class="auth-wrap"><div class="auth-box">
    <h1>SHATTERED VEIL</h1>
    <div class="auth-sub">The Goddess watches. The story remembers.</div>
    <div class="error-msg" id="authErr"></div>
    <div class="field"><label>Username</label><input id="authUser" maxlength="24" autocomplete="off"></div>
    <div class="field"><label>Password</label><input id="authPass" type="password" maxlength="64"></div>
    ${mode === 'signup' ? `
      <div class="field"><label>Divine Sigil <span style="color:var(--text-dim);text-transform:none">(Admin Key — optional)</span></label>
        <input id="authKey" maxlength="32" placeholder="Leave blank to be mortal">
        <div class="hint">Those who bear the Goddess's sigil may shape the world itself.</div>
      </div>` : ''}
    <button class="btn btn-block" id="authGo">${mode === 'login' ? 'Enter the Veil' : 'Forge a Soul'}</button>
    <div class="auth-toggle">
      ${mode === 'login'
        ? `New soul? <a id="swapAuth">Create an account</a>`
        : `Returning? <a id="swapAuth">Sign in</a>`}
    </div>
  </div></div>`;

  $('#swapAuth').onclick = () => renderAuth(mode === 'login' ? 'signup' : 'login');
  $('#authGo').onclick = () => {
    const u = $('#authUser').value.trim();
    const p = $('#authPass').value;
    const err = m => { $('#authErr').textContent = m; };
    if (!u || !p) return err('Name and password are required.');
    const users = getUsers();

    if (mode === 'signup') {
      if (users[u]) return err('That name is already claimed by another soul.');
      const isAdmin = $('#authKey').value.trim() === ADMIN_KEY;
      users[u] = { pass: p, role: isAdmin ? 'goddess' : 'player', created: Date.now() };
      saveUsers(users);
      session = u; DB.set('session', u);
      if (isAdmin) {
        toast('The Veil parts. Welcome, Goddess.', 'purple');
        renderGame();
      } else {
        renderCreateChar();
      }
    } else {
      if (!users[u] || users[u].pass !== p) return err('The Veil rejects you. Wrong name or password.');
      session = u; DB.set('session', u);
      renderGame();
    }
  };
  $('#authPass').addEventListener('keydown', e => { if (e.key === 'Enter') $('#authGo').click(); });
}

/* ------------------- Character creation ------------------- */

function renderCreateChar() {
  view = 'create';
  const isG = currentUser()?.role === 'goddess';
  const raceOpts = Object.keys(RACES).map(r => `
    <option value="${r}">${r} — ${RACES[r].desc}</option>`).join('');
  const classOpts = Object.keys(CLASSES).map(c => `
    <option value="${c}">${c} — ${CLASSES[c].desc}</option>`).join('');

  $('#app').innerHTML = `
  <div class="auth-wrap"><div class="auth-box" style="max-width:560px">
    <h1>${isG ? 'FORGE A MORTAL INCARNATION' : 'FORGE YOUR SOUL'}</h1>
    <div class="auth-sub">${isG ? 'A vessel of flesh and longing to walk among your subjects — it will live, fight, level and die like any mortal.' : 'Who steps into the Shattered Veil?'}</div>
    <div class="error-msg" id="ccErr"></div>
    <div class="field"><label>Character Name</label><input id="ccName" maxlength="30" autocomplete="off"></div>
    <div class="field"><label>Race</label><select id="ccRace">${raceOpts}</select></div>
    <div class="field"><label>Class</label><select id="ccClass">${classOpts}</select></div>
    <div class="hint" id="ccPreview" style="margin-bottom:18px"></div>
    <button class="btn btn-block" id="ccGo">${isG ? 'Send the Incarnation' : 'Begin the Chronicle'}</button>
    ${isG ? '<button class="btn btn-dark btn-block" id="ccSkip" style="margin-top:10px">Remain Formless (no incarnation)</button>' : ''}
  </div></div>`;

  const skip = $('#ccSkip');
  if (skip) skip.onclick = () => { view = 'story'; renderGame(); };

  const preview = () => {
    const r = RACES[$('#ccRace').value], c = CLASSES[$('#ccClass').value];
    const stats = Object.entries(c.base).map(([k, v]) => `${STAT_NAMES[k]} ${v}`).join(' · ');
    $('#ccPreview').textContent = `${r.desc} ${c.desc} — ${stats}. Begins with the skill ${SKILLS[c.skill].name}.`;
  };
  $('#ccRace').onchange = preview; $('#ccClass').onchange = preview; preview();

  $('#ccGo').onclick = () => {
    const name = $('#ccName').value.trim();
    if (!name) return $('#ccErr').textContent = 'Your soul must bear a name.';
    const race = $('#ccRace').value, cls = $('#ccClass').value;
    const chars = getChars();
    chars[session] = {
      name, race, cls,
      level: 1, xp: 0,
      statPoints: 0, skillPoints: 1,
      stats: { ...CLASSES[cls].base },
      skills: [CLASSES[cls].skill],
      raceTier: 0,
      gold: 25,
      hp: null, mp: null,
      equipment: { weapon: null, armor: null, trinket: null },
      inventory: [{ id: uid(), key: 'Healing Draught' }, { id: uid(), key: 'Rusty Sword' }],
      blessings: [], curses: [],
      created: Date.now()
    };
    const c = chars[session];
    c.hp = charMaxHp(c); c.mp = charMaxMp(c);
    saveChars(chars);
    saveStory([...getStory(), {
      id: uid(), type: 'system', author: 'The Veil',
      text: `${name} the ${race} ${cls} steps through the Shattered Veil for the first time. Somewhere beyond the stars, something ancient opens one eye.`,
      t: Date.now()
    }]);
    toast('Your story begins.');
    renderGame();
  };
}

/* ============================================================
   GAME SHELL
   ============================================================ */

function renderGame() {
  const user = currentUser();
  if (!user) return renderAuth();
  const c = myChar();
  if (!c && user.role !== 'goddess') return renderCreateChar();
  const isAdmin = user.role === 'goddess';
  if (!c && isAdmin && view !== 'story') view = 'story';

  const tabs = [
    ['story', 'Chronicle'], ['players', 'Souls'], ['character', 'Character'],
    ['skills', 'Skills & Evolution'], ['inventory', 'Inventory']
  ];
  if (isAdmin) tabs.push(['admin', '☽ Goddess Sanctum']);

  $('#app').innerHTML = `
    <div class="topbar">
      <div class="brand">☽ SHATTERED VEIL</div>
      <div style="display:flex;gap:12px;align-items:center">
        <span class="who">${isAdmin
          ? `<span style="color:var(--purple);font-family:'Cinzel',serif;letter-spacing:1px">GODDESS MODE</span>`
          : `${esc(c.name)} · Lv ${c.level} ${esc(c.race)} ${esc(c.cls)} · ${c.gold} gold`}
        </span>
        <button class="btn btn-dark btn-sm" id="logoutBtn">Leave the Veil</button>
      </div>
    </div>
    <div class="nav-tabs" id="navTabs">
      ${tabs.map(([id, label]) => `<div class="nav-tab ${id === view ? 'active' : ''} ${id === 'admin' ? 'admin-tab' : ''}" data-tab="${id}">${label}</div>`).join('')}
    </div>
    <div id="viewRoot"></div>`;

  $('#logoutBtn').onclick = () => { session = null; DB.set('session', null); renderAuth(); };
  document.querySelectorAll('.nav-tab').forEach(t => t.onclick = () => { view = t.dataset.tab; renderGame(); });

  const root = $('#viewRoot');
  if (view === 'story') root.innerHTML = storyHTML();
  else if (view === 'players') root.innerHTML = playersHTML();
  else if (view === 'character') root.innerHTML = characterHTML();
  else if (view === 'skills') root.innerHTML = skillsHTML();
  else if (view === 'inventory') root.innerHTML = inventoryHTML();
  else if (view === 'admin' && isAdmin) root.innerHTML = adminHTML();
  else { view = 'story'; root.innerHTML = storyHTML(); }

  wireStory();
  wireCharacter();
  wireSkills();
  wireInventory();
  wireAdmin();
}

/* ============================================================
   STORY / CHRONICLE
   ============================================================ */

function storyHTML() {
  const story = getStory().slice().reverse();
  const user = currentUser();
  const isAdmin = user.role === 'goddess';
  const c = myChar();

  return `
  <div class="story-layout">
    <div>
      <div class="panel composer">
        <div class="panel-title">${isAdmin ? 'Shape the World' : 'Write Your Action'}</div>
        ${isAdmin ? `
          ${c ? `
          <div class="field"><label>Speak As</label>
            <select id="voiceSel">
              <option value="goddess">☽ The Goddess — divine world event</option>
              <option value="mortal">⚔ ${esc(c.name)} — your mortal incarnation acts</option>
            </select>
          </div>` : `
          <div style="margin-bottom:14px;padding:12px;border:1px dashed var(--purple-dim);font-size:14px;color:var(--text-dim)">
            You are formless. <a id="forgeIncLink" style="color:var(--purple);cursor:pointer;text-decoration:underline">Forge a mortal incarnation</a>
            to walk, fight and level among your subjects — while keeping your divine powers.
          </div>`}
        ` : ''}
        <div class="field"><textarea id="storyText" placeholder="${isAdmin
          ? 'Describe a world event, omen, calamity, or divine appearance...'
          : 'What does your character do? The story bends to your words...'}"></textarea></div>
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:14px;cursor:pointer;font-size:15px;color:var(--text-dim)">
          <input type="checkbox" id="aiNarrate" checked style="accent-color:var(--purple);width:16px;height:16px">
          ✦ Let the Chronicler narrate the world's response (AI)
        </label>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn ${isAdmin ? 'btn-purple' : ''}" id="storyPost">${isAdmin ? 'Unleash Upon the World' : 'Act'}</button>
          ${(!isAdmin || c) ? '<button class="btn btn-dark" id="omenBtn" title="The Chronicler speaks of things to come">✦ Seek an Omen</button>' : ''}
        </div>
        <div id="aiStatus" style="margin-top:10px;font-size:14px;color:var(--purple);font-style:italic;min-height:18px"></div>
      </div>
      <div class="panel">
        <div class="panel-title">The Chronicle <span style="color:var(--text-dim);font-size:12px;letter-spacing:0">${story.length} entries</span></div>
        <div class="story-feed" id="storyFeed">
          ${story.length === 0 ? '<div class="inv-empty">The pages are blank. Write the first line of history.</div>' : story.map(e => `
            <div class="story-entry ${e.type}">
              <div class="meta">
                <span class="author">${e.type === 'goddess' ? '☽ ' : ''}${esc(e.author)}</span>
                <span>${fmtTime(e.t)}</span>
                <span class="tag ${e.type}">${e.type === 'goddess' ? 'WORLD EVENT' : e.type === 'system' ? 'SYSTEM' : 'ACTION'}</span>
              </div>
              <div class="text">${esc(e.text)}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>
    <div>
      <div class="panel">
        <div class="panel-title">How It Works</div>
        <p style="font-size:15px;line-height:1.6;color:var(--text-dim)">
          Every action you narrate earns <span style="color:var(--gold)">XP</span> and is woven into the living
          chronicle. The <span style="color:var(--purple)">Goddess</span> watches all — she may bless you with
          gifts, gold and power... or curse you with misfortune. Spend stat points when you level,
          unlock skills, and evolve your race into something divine — or monstrous.
        </p>
      </div>
      ${myChar() ? recentEventsHTML() : ''}
    </div>
  </div>`;
}

function recentEventsHTML() {
  const c = myChar();
  const notes = [];
  if (c.blessings.length) notes.push(`<p style="color:#ffe08a;font-size:14px">Blessings (${c.blessings.length}): +1 to all effective stats each.</p>`);
  if (c.curses.length) notes.push(`<p style="color:var(--bad);font-size:14px">Curses (${c.curses.length}): −1 to all effective stats each.</p>`);
  if (!notes.length) return '';
  return `<div class="panel"><div class="panel-title purple">Marks Upon Your Soul</div>${notes.join('')}</div>`;
}

function wireStory() {
  const btn = $('#storyPost');
  if (!btn) return;
  stirIfQuiet();
  const status = m => { const el = $('#aiStatus'); if (el) el.textContent = m; };

  btn.onclick = async () => {
    const text = $('#storyText').value.trim();
    if (!text) return;
    const useAI = $('#aiNarrate')?.checked;
    const user = currentUser();
    const isAdmin = user.role === 'goddess';
    const c = myChar();
    // The Goddess chooses her voice: divine decree, or her mortal incarnation.
    const asGoddess = isAdmin && ($('#voiceSel')?.value ?? 'goddess') === 'goddess';
    const story = getStory();
    story.push({
      id: uid(),
      type: asGoddess ? 'goddess' : 'player',
      author: asGoddess ? 'The Goddess' : c.name,
      text, t: Date.now()
    });
    saveStory(story);
    $('#storyText').value = '';
    btn.disabled = true;

    // Mortal actions (a player's, or the Goddess acting through her incarnation) earn XP.
    if (!asGoddess && c) {
      const chars = getChars();
      const ch = chars[session];
      const gain = 15 + Math.floor(Math.random() * 11);
      grantXP(ch, gain, `Your deeds are woven into the chronicle (+${gain} XP).`);
      chars[session] = ch;
      saveChars(chars);
    }
    renderGame();

    if (useAI) {
      toast('✦ The Chronicler is writing...', 'purple');
      const prompt = asGoddess
        ? `The GODDESS has just shaped the world: "${text}"\n\n` +
          `Recent chronicle:\n${chronicleContext()}\n\n` +
          `Write 2-3 sentences as the world's reaction — omens, whispers, the land itself responding to divine will. Address mortals as "mortals" or "children". Plain prose.`
        : `${charContext(c)}\n\nRecent chronicle:\n${chronicleContext()}\n\n` +
          `The player just acted: "${text}"\n\nNarrate what happens next.`;
      const system = asGoddess
        ? CHRONICLER_SYSTEM + ' In this response you speak of how the WORLD reacts to the Goddess, not to a player.'
        : CHRONICLER_SYSTEM;
      const ai = await askChronicler(system, prompt);
      const entry = {
        id: uid(), type: 'system', author: 'The Chronicler',
        text: ai || localConsequence(c, text),
        t: Date.now()
      };
      saveStory([...getStory(), entry]);
      renderGame();
      if (!ai) toast('The Chronicler could not reach the far realms (AI offline) — a lesser fate was woven instead.', 'red');
    }
  };

  const omen = $('#omenBtn');
  if (omen) omen.onclick = async () => {
    const c = myChar();
    omen.disabled = true;
    status('✦ You close your eyes and listen to the dark between moments...');
    const prompt = `${charContext(c)}\n\nRecent chronicle:\n${chronicleContext()}\n\n` +
      `Write a short omen or vision the world shows this character: a warning, a hook, or a hint of what approaches. 2-3 sentences, second person. Plain prose.`;
    const ai = await askChronicler(CHRONICLER_SYSTEM, prompt);
    saveStory([...getStory(), {
      id: uid(), type: 'system', author: 'The Chronicler',
      text: ai || localConsequence(c, 'seeks an omen'),
      t: Date.now()
    }]);
    renderGame();
  };

  const forge = $('#forgeIncLink');
  if (forge) forge.onclick = () => renderCreateChar();
}

/* ------------------------------------------------------------
   The Chronicler stirs: if the chronicle has gone quiet, the AI
   writes a world event on its own the next time anyone watches.
   Fires at most once every 30 minutes.
   ------------------------------------------------------------ */
const STIR_QUIET_MS = 6 * 60 * 60 * 1000;   // "quiet" = no new entries for 6 hours
const STIR_COOLDOWN_MS = 30 * 60 * 1000;    // max one auto-event per 30 min

async function stirIfQuiet() {
  const story = getStory();
  const lastT = story.length ? story[story.length - 1].t : 0;
  const lastStir = DB.get('lastStir', 0);
  const now = Date.now();
  if (now - lastT < STIR_QUIET_MS) return;
  if (now - lastStir < STIR_COOLDOWN_MS) return;
  DB.set('lastStir', now);

  const chars = Object.values(getChars());
  const cast = chars.length
    ? chars.map(c => `${c.name} (Lv ${c.level} ${RACES[c.race].evo[c.raceTier]} ${c.cls})`).join(', ')
    : 'no named souls yet';
  const prompt = `The world of the Shattered Veil has gone quiet. Living souls: ${cast}.\n\n` +
    `Recent chronicle:\n${chronicleContext()}\n\n` +
    `Write a world event that stirs the story again — a calamity, discovery, faction move or mystery that these characters could respond to. 2-3 sentences, ominous and inviting. Plain prose.`;
  const ai = await askChronicler(CHRONICLER_SYSTEM, prompt);
  saveStory([...getStory(), {
    id: uid(), type: 'system', author: 'The Chronicler',
    text: ai || 'The silence grows teeth. Far away, something ancient turns over in its sleep — and the world quietly changes while no one watches.',
    t: Date.now()
  }]);
  if (view === 'story') renderGame();
}

function grantXP(c, amount, msg) {
  c.xp += amount;
  let leveled = false;
  while (c.xp >= XP_FOR_LEVEL(c.level)) {
    c.xp -= XP_FOR_LEVEL(c.level);
    c.level++;
    c.statPoints += 5;
    c.skillPoints += 1;
    leveled = true;
  }
  if (leveled) {
    c.hp = charMaxHp(c); c.mp = charMaxMp(c);
    toast(`✦ LEVEL UP! You are now level ${c.level}. +5 stat points, +1 skill point.`, '');
    if (msg) setTimeout(() => toast(msg), 4400);
  } else if (msg) toast(msg);
}

/* ============================================================
   SOULS DIRECTORY (all players)
   ============================================================ */

function playersHTML() {
  const chars = getChars();
  const users = getUsers();
  const entries = Object.entries(chars);
  const boss = `
    <div class="story-entry goddess" style="margin-bottom:20px">
      <div class="meta"><span class="author">☽ The Goddess</span><span class="tag world">WORLD SOVEREIGN</span></div>
      <div class="text">The one who shapes world events and decides the fate of every soul. Not a character — the author of reality itself.</div>
    </div>`;
  if (!entries.length) return `<div class="panel">${boss}<div class="inv-empty">No mortal souls have entered yet.</div></div>`;
  return `<div class="panel"><div class="panel-title">Souls of the Veil</div>${boss}
    ${entries.sort((a, b) => b[1].level - a[1].level).map(([u, c]) => `
      <div class="player-row">
        <div>
          <div style="font-family:'Cinzel',serif;color:var(--text)">${esc(c.name)}</div>
          <div style="font-size:13px;color:var(--text-dim)">Lv ${c.level} ${esc(RACES[c.race].evo[c.raceTier])} ${esc(c.cls)} · Wanderer of the Veil</div>
        </div>
        <div style="font-size:13px;color:var(--text-dim)">${c.gold} gold · ${c.skills.length} skills · ${c.inventory.length + Object.values(c.equipment).filter(Boolean).length} items</div>
      </div>`).join('')}
  </div>`;
}

/* ============================================================
   CHARACTER SHEET
   ============================================================ */

function characterHTML() {
  const c = myChar();
  if (!c) return `<div class="panel"><div class="inv-empty">The Goddess has no sheet — she is the sheet.</div></div>`;
  const es = effStats(c);
  const maxHp = charMaxHp(c), maxMp = charMaxMp(c);
  const xpNeed = XP_FOR_LEVEL(c.level);

  return `
  <div class="panel">
    <div class="char-header">
      <div class="char-avatar">${esc(c.name[0].toUpperCase())}</div>
      <div>
        <div class="char-name">${esc(c.name)}</div>
        <div class="char-sub">Level ${c.level} ${esc(RACES[c.race].evo[c.raceTier])} ${esc(c.cls)} · ${c.gold} gold</div>
        <div class="badges">
          <span class="tag">${esc(c.race)} bloodline</span>
          ${c.blessings.map(b => `<span class="tag blessing">☀ ${esc(b)}</span>`).join('')}
          ${c.curses.map(u => `<span class="tag curse">☠ ${esc(u)}</span>`).join('')}
        </div>
      </div>
    </div>

    <div class="bars">
      <div class="bar-row"><span class="bar-label">HP</span>
        <div class="bar-track"><div class="bar-fill hp" style="width:${Math.max(0, c.hp / maxHp * 100)}%"></div></div>
        <span class="bar-val">${c.hp} / ${maxHp}</span></div>
      <div class="bar-row"><span class="bar-label">MP</span>
        <div class="bar-track"><div class="bar-fill mp" style="width:${Math.max(0, c.mp / maxMp * 100)}%"></div></div>
        <span class="bar-val">${c.mp} / ${maxMp}</span></div>
      <div class="bar-row"><span class="bar-label">XP</span>
        <div class="bar-track"><div class="bar-fill xp" style="width:${Math.min(100, c.xp / xpNeed * 100)}%"></div></div>
        <span class="bar-val">${c.xp} / ${xpNeed}</span></div>
    </div>

    <div class="panel-title">Attributes
      ${c.statPoints > 0 ? `<span class="unspent-note">✦ ${c.statPoints} unspent points</span>` : '<span style="font-size:12px;color:var(--text-dim)">no unspent points</span>'}
    </div>
    <div class="stats-grid">
      ${Object.keys(STAT_NAMES).map(k => `
        <div class="stat-card">
          <div class="s-name">${STAT_NAMES[k]}</div>
          <div class="s-val">${es[k]}${es[k] !== c.stats[k] ? `<span style="font-size:14px;color:var(--text-dim)"> (${c.stats[k]}${es[k] > c.stats[k] ? '+' : ''}${es[k] - c.stats[k] ? (es[k] - c.stats[k] > 0 ? '+' : '') + (es[k] - c.stats[k]) : ''})</span>` : ''}</div>
          <div style="font-size:12px;color:var(--text-dim);margin-bottom:8px">${STAT_DESC[k]}</div>
          <div class="s-controls">
            <button class="stat-btn" data-stat="${k}" data-d="-1" ${c.stats[k] <= CLASSES[c.cls].base[k] ? 'disabled' : ''}>−</button>
            <button class="stat-btn" data-stat="${k}" data-d="1" ${c.statPoints <= 0 ? 'disabled' : ''}>+</button>
          </div>
        </div>`).join('')}
    </div>
  </div>`;
}

function wireCharacter() {
  document.querySelectorAll('.stat-btn').forEach(b => b.onclick = () => {
    const chars = getChars();
    const c = chars[session];
    const k = b.dataset.stat, d = parseInt(b.dataset.d);
    if (d > 0 && c.statPoints > 0) { c.stats[k]++; c.statPoints--; }
    else if (d < 0 && c.stats[k] > CLASSES[c.cls].base[k]) { c.stats[k]--; c.statPoints++; }
    c.hp = Math.min(c.hp, charMaxHp(c)); c.mp = Math.min(c.mp, charMaxMp(c));
    saveChars(chars);
    renderGame();
  });
}

/* ============================================================
   SKILLS & RACE EVOLUTION
   ============================================================ */

function skillsHTML() {
  const c = myChar();
  if (!c) return `<div class="panel"><div class="inv-empty">The Goddess has no sheet — she is the sheet.</div></div>`;
  const race = RACES[c.race];
  const evo = race.evo;

  const evoNodes = evo.map((name, i) => {
    let cls = 'future';
    if (i < c.raceTier) cls = '';
    else if (i === c.raceTier) cls = 'current';
    return `${i > 0 ? '<span class="evo-arrow">→</span>' : ''}<span class="evo-node ${cls}">${name}</span>`;
  }).join('');

  const nextTier = c.raceTier + 1;
  const canEvolve = nextTier < evo.length && c.level >= race.evoLevel[nextTier];
  const evolveBlock = nextTier >= evo.length
    ? `<p style="color:var(--gold);font-family:'Cinzel',serif;letter-spacing:1px">You have reached the pinnacle of your bloodline.</p>`
    : `
      <p style="color:var(--text-dim);font-size:15px;margin-bottom:12px">
        Next form: <span style="color:var(--gold)">${evo[nextTier]}</span> — requires level ${race.evoLevel[nextTier]}
        ${c.level >= race.evoLevel[nextTier]
          ? '<span style="color:var(--good)"> · You are ready. The transformation awaits.</span>'
          : `<span style="color:var(--bad)"> · Reach level ${race.evoLevel[nextTier]} first (you are ${c.level}).</span>`}
      </p>
      <button class="btn btn-purple" id="evolveBtn" ${canEvolve ? '' : 'disabled'}>✦ Evolve into ${evo[nextTier]}</button>
      ${canEvolve ? '<div class="hint">Evolution grants +2 to every stat and restores you fully.</div>' : ''}`;

  const skillRows = Object.entries(SKILLS).map(([key, s]) => {
    const owned = c.skills.includes(key);
    const locked = !owned && s.reqLevel && c.level < s.reqLevel;
    return `
      <div class="skill-card ${owned ? 'owned' : locked ? 'locked' : ''}">
        <div>
          <div class="sk-name">${owned ? '✦ ' : ''}${s.name} ${s.reqLevel ? `<span style="font-size:11px;color:var(--text-dim)">· req. Lv ${s.reqLevel}</span>` : ''}</div>
          <div class="sk-desc">${s.desc}</div>
        </div>
        ${owned
          ? '<span class="tag" style="color:var(--good);border-color:#2c5c42">LEARNED</span>'
          : `<button class="btn btn-dark btn-sm" data-skill="${key}" ${locked || c.skillPoints < s.cost ? 'disabled' : ''}>Learn (${s.cost} pt)</button>`}
      </div>`;
  }).join('');

  return `
  <div class="panel">
    <div class="panel-title purple">Race Evolution
      ${c.skillPoints > 0 ? `<span class="unspent-note" style="color:var(--purple)">✦ ${c.skillPoints} skill points</span>` : ''}
    </div>
    <div class="evo-path">${evoNodes}</div>
    ${evolveBlock}
  </div>
  <div class="panel">
    <div class="panel-title">Skills</div>
    ${skillRows}
  </div>`;
}

function wireSkills() {
  const evo = $('#evolveBtn');
  if (evo) evo.onclick = () => {
    const chars = getChars();
    const c = chars[session];
    const race = RACES[c.race];
    const nextTier = c.raceTier + 1;
    if (nextTier >= race.evo.length || c.level < race.evoLevel[nextTier]) return;
    c.raceTier = nextTier;
    for (const k of Object.keys(STAT_NAMES)) c.stats[k] += 2;
    c.hp = charMaxHp(c); c.mp = charMaxMp(c);
    saveChars(chars);
    saveStory([...getStory(), {
      id: uid(), type: 'system', author: 'The Veil',
      text: `The air shimmers. ${c.name} is reborn as ${race.evo[c.raceTier]}. The Veil itself takes note of this ascension.`,
      t: Date.now()
    }]);
    toast(`✦ You have evolved into ${race.evo[c.raceTier]}!`, 'purple');
    renderGame();
  };

  document.querySelectorAll('[data-skill]').forEach(b => b.onclick = () => {
    const chars = getChars();
    const c = chars[session];
    const key = b.dataset.skill, s = SKILLS[key];
    if (c.skills.includes(key) || c.skillPoints < s.cost) return;
    if (s.reqLevel && c.level < s.reqLevel) return;
    c.skillPoints -= s.cost;
    c.skills.push(key);
    saveChars(chars);
    toast(`✦ Learned ${s.name}.`);
    renderGame();
  });
}

/* ============================================================
   INVENTORY
   ============================================================ */

function inventoryHTML() {
  const c = myChar();
  if (!c) return `<div class="panel"><div class="inv-empty">The Goddess has no sheet — she is the sheet.</div></div>`;
  const slots = ['weapon', 'armor', 'trinket'];
  const eqRows = slots.map(s => `
    <div class="player-row">
      <div><span style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:1px;color:var(--text-dim)">${s.toUpperCase()}</span>
      <div>${c.equipment[s] ? `<span style="color:var(--gold)">${esc(c.equipment[s])}</span> <span style="font-size:12px;color:var(--text-dim)">— ${esc(ITEM_POOL[c.equipment[s]].desc)}</span>` : '<span class="inv-empty">— empty —</span>'}</div></div>
      ${c.equipment[s] ? `<button class="btn btn-dark btn-sm" data-unequip="${s}">Unequip</button>` : ''}
    </div>`).join('');

  const invRows = c.inventory.length === 0
    ? '<div class="inv-empty">Your pack is empty. The Goddess may provide... or you may find treasure in the story.</div>'
    : `<div class="inv-grid">${c.inventory.map(it => {
        const def = ITEM_POOL[it.key];
        const isGear = def.type !== 'consumable';
        const equipped = Object.values(c.equipment).includes(it.key);
        return `
        <div class="inv-item ${equipped ? 'equipped' : ''}">
          <div class="it-name">${esc(it.key)}</div>
          <div class="it-type">${def.type}${equipped ? ' · equipped' : ''}</div>
          <div class="it-desc">${esc(def.desc)}</div>
          ${isGear
            ? `<button class="btn btn-sm" data-equip="${it.id}" ${equipped ? 'disabled' : ''}>${equipped ? 'Equipped' : 'Equip'}</button>`
            : `<button class="btn btn-sm" data-use="${it.id}">Use</button>`}
        </div>`;
      }).join('')}</div>`;

  return `
  <div class="panel">
    <div class="panel-title">Equipment</div>
    ${eqRows}
  </div>
  <div class="panel">
    <div class="panel-title">Pack <span style="font-size:12px;color:var(--text-dim)">${c.inventory.length} items · ${c.gold} gold</span></div>
    ${invRows}
  </div>`;
}

function wireInventory() {
  document.querySelectorAll('[data-use]').forEach(b => b.onclick = () => {
    const chars = getChars();
    const c = chars[session];
    const idx = c.inventory.findIndex(i => i.id === b.dataset.use);
    if (idx < 0) return;
    const def = ITEM_POOL[c.inventory[idx].key];
    if (def.effect.heal) c.hp = Math.min(charMaxHp(c), c.hp + Math.floor(charMaxHp(c) * def.effect.heal));
    if (def.effect.mana) c.mp = Math.min(charMaxMp(c), c.mp + Math.floor(charMaxMp(c) * def.effect.mana));
    c.inventory.splice(idx, 1);
    saveChars(chars);
    toast(`Used ${def ? Object.keys(def.effect).join(' & ') : 'item'}.`);
    renderGame();
  });
  document.querySelectorAll('[data-equip]').forEach(b => b.onclick = () => {
    const chars = getChars();
    const c = chars[session];
    const item = c.inventory.find(i => i.id === b.dataset.equip);
    if (!item) return;
    const type = ITEM_POOL[item.key].type;
    c.equipment[type] = item.key;
    saveChars(chars);
    toast(`Equipped ${item.key}.`);
    renderGame();
  });
  document.querySelectorAll('[data-unequip]').forEach(b => b.onclick = () => {
    const chars = getChars();
    const c = chars[session];
    c.equipment[b.dataset.unequip] = null;
    saveChars(chars);
    renderGame();
  });
}

/* ============================================================
   GODDESS SANCTUM (admin)
   ============================================================ */

function adminHTML() {
  const chars = getChars();
  const names = Object.entries(chars);
  const itemKeys = Object.keys(ITEM_POOL);

  return `
  <div class="admin-grid">
    <div class="panel">
      <div class="panel-title purple">☽ Divine Decree — World Event</div>
      <div class="field"><label>Event Text (visible to all)</label>
        <textarea id="adEvent" placeholder="The blood moon rises over the Ashreach..."></textarea></div>
      <div class="effect-row">
        <div class="field"><label>Target Soul (optional)</label>
          <select id="adTarget"><option value="">— none / all —</option>
            ${names.map(([u, c]) => `<option value="${esc(u)}">${esc(c.name)}</option>`).join('')}
          </select></div>
        <div class="field"><label>Boon or Bane</label>
          <select id="adKind">
            <option value="">None — story only</option>
            <option value="xp">Grant XP</option>
            <option value="gold">Grant Gold</option>
            <option value="item">Gift an Item</option>
            <option value="blessing">Blessing (+1 all stats)</option>
            <option value="curse">Curse (−1 all stats)</option>
            <option value="smite">Smite (damage)</option>
          </select></div>
      </div>
      <div class="effect-row" id="adValueRow" style="display:none">
        <div class="field"><label id="adValueLabel">Amount</label><input id="adValue" type="number" value="50"></div>
        <div class="field" id="adItemRow" style="display:none"><label>Item</label>
          <select id="adItem">${itemKeys.map(k => `<option>${esc(k)}</option>`).join('')}</select></div>
      </div>
      <button class="btn btn-purple" id="adCast">Cast Decree</button>
    </div>

    <div class="panel">
      <div class="panel-title purple">Souls Under Your Gaze</div>
      ${names.length === 0 ? '<div class="inv-empty">No mortal souls yet. They will come.</div>' : names.map(([u, c]) => `
        <div class="player-row">
          <div>
            <div style="font-family:'Cinzel',serif">${esc(c.name)}</div>
            <div style="font-size:12px;color:var(--text-dim)">Lv ${c.level} ${esc(c.name && RACES[c.race].evo[c.raceTier])} · HP ${c.hp}/${charMaxHp(c)} · ${c.gold}g · ${c.blessings.length}☀ ${c.curses.length}☠</div>
          </div>
          <div style="display:flex;gap:6px">
            <button class="btn btn-sm" data-quick="blessing:${esc(u)}">Bless</button>
            <button class="btn btn-danger btn-sm" data-quick="curse:${esc(u)}">Curse</button>
          </div>
        </div>`).join('')}
    </div>
  </div>`;
}

function wireAdmin() {
  const cast = $('#adCast');
  if (!cast) return;
  const kindSel = $('#adKind'), valRow = $('#adValueRow');

  const syncKind = () => {
    const k = kindSel.value;
    valRow.style.display = k && k !== 'blessing' && k !== 'curse' ? 'grid' : 'none';
    $('#adItemRow').style.display = k === 'item' ? 'block' : 'none';
    $('#adValueLabel').textContent = k === 'item' ? 'Quantity' : k === 'smite' ? 'Damage' : k === 'gold' ? 'Gold' : 'XP';
  };
  kindSel.onchange = syncKind; syncKind();

  const applyEffect = (targetUser, kind, value, itemName) => {
    if (!targetUser) return;
    const chars = getChars();
    const c = chars[targetUser];
    if (!c) return;
    const notes = [];
    if (kind === 'xp') { grantXP(c, value); notes.push(`+${value} XP`); }
    if (kind === 'gold') { c.gold = Math.max(0, c.gold + value); notes.push(`${value > 0 ? '+' : ''}${value} gold`); }
    if (kind === 'item') { for (let i = 0; i < Math.max(1, value); i++) c.inventory.push({ id: uid(), key: itemName }); notes.push(`received ${itemName}`); }
    if (kind === 'blessing') { c.blessings.push(`Blessed ${new Date().toLocaleDateString()}`); notes.push('was BLESSED (+1 all stats)'); }
    if (kind === 'curse') { c.curses.push(`Cursed ${new Date().toLocaleDateString()}`); notes.push('was CURSED (−1 all stats)'); }
    if (kind === 'smite') { c.hp = Math.max(1, c.hp - value); notes.push(`smitten for ${value} damage`); }
    chars[targetUser] = c;
    saveChars(chars);
    if (notes.length) {
      saveStory([...getStory(), {
        id: uid(), type: 'system', author: 'The Veil',
        text: `${c.name} ${notes.join(', ')}.`,
        t: Date.now()
      }]);
      // AI-tailored narration for blessings & curses — divine intervention deserves prose.
      if (kind === 'blessing' || kind === 'curse') {
        const divinePrompt = `${charContext(c)}\n\nRecent chronicle:\n${chronicleContext()}\n\n` +
          `The Goddess ${kind === 'blessing' ? 'has BLESSED' : 'has CURSED'} ${c.name}. ` +
          (kind === 'blessing'
            ? 'Narrate the blessing manifesting: how it feels, what changes in their body and fate. Radiant but with weight — blessings from a dark goddess are never free of shadow. 2-3 sentences, second person. Plain prose.'
            : 'Narrate the curse taking root: how it manifests, what it costs them, how the world itself seems to turn against them. Personal and chilling. 2-3 sentences, second person. Plain prose.');
        askChronicler(CHRONICLER_SYSTEM, divinePrompt).then(ai => {
          saveStory([...getStory(), {
            id: uid(), type: 'system', author: 'The Chronicler',
            text: ai || (kind === 'blessing'
              ? `Light that should not exist settles into ${c.name}'s bones. Something has changed, and the world can smell it.`
              : `A cold thread winds itself through ${c.name}'s shadow. Wherever they go now, misfortune arrives first.`),
            t: Date.now()
          }]);
          if (view === 'story') renderGame();
        });
      }
    }
  };

  cast.onclick = () => {
    const text = $('#adEvent').value.trim();
    const target = $('#adTarget').value;
    const kind = kindSel.value;
    const value = parseInt($('#adValue').value) || 0;
    const itemName = $('#adItem').value;
    if (!text && !kind) { toast('Write a decree or attach a boon/bane.', 'red'); return; }
    if (kind && kind !== 'blessing' && kind !== 'curse' && !target) { toast('Boons and banes need a target soul.', 'red'); return; }

    if (text) {
      saveStory([...getStory(), {
        id: uid(), type: 'goddess', author: 'The Goddess', text, t: Date.now()
      }]);
    }
    if (kind) applyEffect(target, kind, value, itemName);
    toast(kind === 'curse' || kind === 'smite' ? '☠ Your will be done.' : '☀ Your will be done.', 'purple');
    renderGame();
  };

  document.querySelectorAll('[data-quick]').forEach(b => b.onclick = () => {
    const [kind, user] = b.dataset.quick.split(':');
    applyEffect(user, kind, 0, null);
    toast(kind === 'blessing' ? '☀ A blessing descends.' : '☠ A curse takes root.', 'purple');
    renderGame();
  });
}

/* ------------------- Boot ------------------- */

if (session && currentUser()) {
  const c = myChar();
  if (!c && currentUser().role !== 'goddess') renderCreateChar();
  else renderGame();
} else {
  renderAuth();
}
