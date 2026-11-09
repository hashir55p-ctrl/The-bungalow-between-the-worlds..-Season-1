/* Chapter 01 - Ordinary Days. Nine scenes, built from the manhwa pages. */
(function (G) {
'use strict';
const { M, L, PI, sm, ramp, lerp, clamp, Node, G_SPH } = E; const { box, cyl, sph, quad, floor, grp, glow, TX } = W;
const gold = L(0xffb840), warm = L(0xffa848);
const SC = [];
function mkS(o) {
  const S = Object.assign({ root: new Node(), lights: [], flick: [], chars: {}, beats: [], sun: { d: [.3, 1, .4], c: [0, 0, 0] }, amb: [[.1, .1, .12], [.05, .04, .04]], fog: { c: L(0x101018), d: .02 }, sky: { hor: L(0x101020), zen: L(0x05060c), glow: [0, 0, 0] }, exp: 1, ao: 0, shake: .01, audio: {} }, o || {});
  S.dome = new Node(G_SPH(), M(0, { mode: 1, two: true, nofog: true })).scl(500, 500, 500); S.flick = S.flick || []; return S;
}
function mkChars(S) { ['S', 'R', 'J', 'H'].forEach(id => { const c = new Char(id); S.root.add(c.root); S.chars[id] = c; }); return S.chars; }
const headY = c => c.o.y + (c.o.lie ? c.o.lie : (c.o.sit > 0 ? c.o.sit : (c.o.floor ? .17 : .92))) + .8;
function CU(c, dist, side, hOff, fov, lookOff) {
  dist = dist * 1.22; return () => { const o = c.o, hy = headY(c), fx = Math.sin(o.ry), fz = Math.cos(o.ry), sx = Math.cos(o.ry), sz = -Math.sin(o.ry); return [o.x + fx * dist + sx * (side || 0), hy + (hOff || 0), o.z + fz * dist + sz * (side || 0), o.x, hy - .02 + (lookOff || 0), o.z, fov || 30]; };
}
function face(c, x, z) { return Math.atan2(x - c.o.x, z - c.o.z); }
function beat(cam, lines, act, d, sfx) { return { cam, lines: lines || [], act, d: d || 0, sfx: sfx || [] }; }
const NAMES = { S: 'Stany', R: 'Renjith', J: 'Jesvin', H: 'Hashir' };
const lineDur = l => { if (l[2] && l[2].d) return l[2].d; const n = l[1].length; switch (l[0]) { case 'N': return Math.max(2.6, 1.3 + n * .06); case 'X': return 1.9; case 'C': return 1.9; case 'T': return 5.5; case 'P': return 1.2; default: return Math.max(1.6, .9 + n * .055); } };
function finish(S) {
  let t = 0; S.beats.forEach(b => { b.start = t; let u = 0; b.ls = b.lines.map(l => { const d = lineDur(l); const s = u; u += d + (l[0] === 'N' || l[0] === 'X' || l[0] === 'C' || l[0] === 'T' ? 0 : .25); return s; }); b.dur = Math.max(b.d, u + .15); t += b.dur; }); S.dur = t; return S;
}
const cs = (...a) => a;
const pose = (c, a, b, f) => { c.pose(a, b); if (f) c.face(f); return c; };
const SIT = { J: [-.7, -.85, 0], H: [.7, -.85, 0], R: [-1.45, 0, PI / 2] };

/* ===== 1. COLD OPEN ===== */
SC.push({ id: 1, title: '3:00 AM', build() {
  const S = mkS({ amb: [L(0x1c2438).map(v => v * .9), L(0x0c0a10)], fog: { c: L(0x0a0a10), d: .02 }, ao: 4, exp: 1.25, audio: { amb: 'study', mus: 'dread' } });
  const K = R.study(S, { win: 'night' }); const c = mkChars(S);
  K.doorLight.i = 7; lanternDim(S);
  const xs = { R: -1.5, H: -.5, J: .5, S: 1.5 };
  S.base = (T) => {
    const pulse = .85 + Math.sin(T * 2.2) * .12 + Math.sin(T * 5.3) * .05;
    K.leafMats.forEach(m => m.e = gold.map(v => v * 1.5 * pulse)); K.doorGlow.m.a = .55 * pulse; K.doorLight.k = pulse; K.rays.forEach((q, i) => q.m.a = .06 * pulse);
    for (const id in xs) c[id].at(xs[id], 1.0, PI).nopack(); c.H.pose('camera'); c.J.pose('down'); c.R.pose('cross'); c.S.pose('hips');
    K.clock.swing(T, true); K.clock.set(2, 59);
  };
  S.beats = [
    beat({ a: [.3, 1.5, 5.0, 0, 1.75, -3, 42], b: [.1, 1.5, 2.8, 0, 1.7, -3, 38], e: 'io' }, [['T', 'The Bungalow Between Worlds|Season 1  ·  Chapter 01  ·  Ordinary Days'], ['N', '3:00 AM.']], null, 9, [[0, 'swell']]),
    beat(() => [.9, 1.66, -1.7, -.5, 1.64, 1.0, 28], [['H', "Nobody say 'let's open it.'"]], () => { c.R.face('worry'); c.H.face('worry'); }),
    beat(() => [-.8, 1.7, -1.5, 1.5, 1.66, 1.0, 26], [['S', "...Let's open it."]], () => { c.S.face('grin').pose('fist', 'hips'); }),
    beat(() => [.6, 1.62, -1.4, -1.5, 1.6, 1.0, 28], [['R', 'Of course he did.']], () => { c.R.face('tired'); c.S.face('grin'); }, 0, [])
  ];
  return finish(S);
} });
function lanternDim(S) { S.lights.forEach(l => { if (l.fl !== undefined) l.i *= .5; }); }

/* ===== 2. FORT KOCHI ===== */
SC.push({ id: 2, title: 'Fort Kochi', build() {
  const S = mkS({ sun: { d: [.35, .72, .6], c: L(0xffe6bc).map(v => v * 2.6) }, amb: [L(0x9ec4e8).map(v => v * .75), L(0x8a7a5a).map(v => v * .55)], fog: { c: L(0xd5e4ec), d: .0075 }, sky: { hor: L(0xdcebf2), zen: L(0x4f9ade), glow: L(0xffe0a0).map(v => v * .6) }, exp: 1.05, audio: { amb: 'sea', mus: 'day' } });
  const K = R.kochi(S); const c = mkChars(S); S.root.add(S.dome);
  const sits = (extra) => { ['J', 'H', 'R'].forEach(id => { const [x, z, ry] = SIT[id]; c[id].at(x, z, ry).sit().pose('lap').nopack(); }); c.S.at(1.75, .35, -PI / 2).nopack().pose('rest'); if (extra) extra(); };
  const phoneAt = (x, y, z, tx, show) => { K.phone.vis = true; K.phone.p = [x, y, z]; K.phoneScr.m.tex = K.phoneMats[tx]; K.phone.r[1] = 0; };
  S.base = () => { sits(); K.phone.vis = false; c.R.face('smirk'); c.J.face('tired'); };
  const card = (id, txt, role) => beat(CU(c[id], 1.5, .3, -.05, 28), [['C', txt + '|' + role]], () => { c[id].face(id === 'J' ? 'neutral' : 'smirk'); }, 0, []);
  S.beats = [
    beat({ a: [-9, 2.6, 11, 0, 1.3, -5, 40], b: [-2.2, 1.8, 5.4, 0, 1.2, -2, 36], e: 'io' }, [['N', 'Eighteen hours earlier...']], null, 6),
    beat({ a: [.5, 1.55, 1.75, 1.7, 1.65, .35, 34], b: [.2, 1.6, 1.4, 1.7, 1.7, .35, 31] }, [['S', 'Machane, listen. I found a place.']], () => { c.S.pose('fist', 'rest').face('grin'); c.J.lookAt(1.7, .3); c.H.lookAt(1.7, .3); }),
    card('S', 'STANY, 24', 'The self-appointed leader'), card('R', 'RENJITH, 24', 'The sceptic'), card('J', 'JESVIN, 25', 'The calm one'), card('H', 'HASHIR, 26', 'The wildcard'),
    beat([.3, 1.4, 2.3, .3, 1.38, .5, 30], [], () => { c.S.at(1.45, .75, -PI / 2 - .5).pose('phone', 'rest').face('grin'); phoneAt(.3, 1.4, 1.35, 'listing'); c.J.lookAt(1, .5); c.H.lookAt(1, .5); }, 3.6),
    beat(CU(c.J, 1.3, .35, -.02, 30), [['J', 'A pool and a forest for that price? Something\'s off.']], () => { c.J.face('worry').pose('chin'); }),
    beat(CU(c.S, 1.6, -.35, -.05, 30), [['S', "Something's ON. It's called a discount."]], () => { c.S.at(1.45, .75, -PI / 2 - .3).face('smirk').pose('shrug', 'rest'); }),
    beat(CU(c.R, 1.3, -.3, -.02, 30), [['R', 'One review. "Quiet. Very quiet."']], () => { c.R.face('worry').pose('phone', 'lap'); }),
    beat(CU(c.H, 1.3, -.3, -.02, 30), [['H', "Quiet? Finally, a place that isn't my house."]], () => { c.H.face('grin').pose('open', 'lap'); }),
    beat({ a: [.2, 1.4, 2.3, .2, 1.4, .5, 32], b: [.2, 1.45, 1.9, .2, 1.42, .5, 30] }, [['S', 'Booked. No refunds, by the way.']], () => { c.S.at(1.1, .55, -PI / 2 - .8).pose('phone').face('grin'); phoneAt(.2, 1.42, 1.1, 'booked'); }, 0, [[1.2, 'bell']]),
    beat({ a: [0, .5, 3.4, 0, 1.55, -.3, 52], b: [0, .6, 2.6, 0, 1.6, -.3, 48] }, [['A', '...BY THE WAY?!']], (u) => { const r = sm(.0, .5, u); ['S', 'R', 'J', 'H'].forEach(id => c[id].pose('high5').face('shock')); c.S.at(1.0, .3, -PI / 2 - .5); }, 0, [[.1, 'clap']]),
    beat(CU(c.R, 1.3, -.3, -.02, 30), [['R', "Last time you 'found a place', we slept at a bus stand."]], () => { c.R.face('tired').pose('cross'); }),
    beat(CU(c.H, 1.3, -.3, -.02, 30), [['H', 'With a goat.']], () => { c.H.face('smug').pose('open', 'lap'); }),
    beat(CU(c.J, 1.4, .3, -.02, 30), [['J', 'The goat slept the best.']], () => { c.J.face('happy').pose('cup'); }),
    beat(CU(c.S, 1.7, -.25, -.1, 30), [['S', 'This time is different!']], () => { c.S.at(1.75, .35, -PI / 2).pose('pointUp', 'rest').face('grin'); })
  ];
  return finish(S);
} });

/* ===== 3. THE ROAD TO WAYANAD ===== */
SC.push({ id: 3, title: 'The Road to Wayanad', build() {
  const S = mkS({ sun: { d: [.15, .2, .96], c: L(0xffa860).map(v => v * 2.4) }, amb: [L(0xe0a878).map(v => v * .7), L(0x4a5a30).map(v => v * .5)], fog: { c: L(0xf0b890), d: .0055 }, sky: { hor: L(0xffb078), zen: L(0x3c6aa8), glow: L(0xffa050).map(v => v * 1.0) }, exp: 1.1, shake: .006, audio: { amb: 'road', mus: 'day' } });
  const K = R.road(S); const c = mkChars(S); S.root.add(S.dome); const J = K.jeep;
  S.root.k = S.root.k.filter(n => !['S', 'R', 'J', 'H'].some(id => c[id].root === n)); ['S', 'R', 'J', 'H'].forEach(id => J.add(c[id].root));
  const pos = u => { const z = 70 + 9 * u; return { z, x: R.roadAt(z).x, y: R.roadAt(z).y }; };
  const head = u => { const a = pos(u), b = pos(u + .1); return Math.atan2(b.x - a.x, b.z - a.z); };
  const jw = (u, lx, ly, lz) => { const p = pos(u), h = head(u), cs = Math.cos(h), sn = Math.sin(h); return [p.x + lx * cs + lz * sn, p.y + ly, p.z - lx * sn + lz * cs]; };
  S.tickJeep = (u) => { const p = pos(u); J.p = [p.x, p.y + .05, p.z]; J.r[1] = head(u); K.wheels.forEach(w => w.r[0] = -u * 9 / .42); };
  S.base = (T) => {
    S.tickJeep(T); c.J.at(-.45, .55, 0, .5).sit().pose('grab').nopack(); c.S.at(.45, .55, 0, .5).sit().pose('rest').nopack(); c.R.at(.45, -.6, 0, .5).sit().pose('lap').nopack(); c.H.at(-.45, -.6, 0, .5).sit().pose('phone').nopack();
    c.J.lookAt(-.45, 5); c.S.lookAt(.45, 5);
    K.mist.forEach((q, i) => q.p[0] = pos(T).x + Math.sin(T * .1 + i) * 10);
  };
  const side = (id, lx) => (u, q, T) => { const o = c[id].o, p = jw(T, o.x + lx, 1.75, o.z + 1.9), l = jw(T, o.x, 1.72, o.z); return [...p, ...l, 30]; };
  S.beats = [
    beat((u, q, T) => { const p = pos(T); return [p.x - 15, p.y + 3.2, p.z - 14, p.x, p.y + 2.4, p.z + 6, 36]; }, [], null, 5.5),
    beat(side('H', -1.6), [['H', 'Day one, Wayanad. Nothing can go wrong.']], () => { c.S.face('grin').pose('open', 'rest'); c.H.pose('phone').face('grin'); }),
    beat(side('R', 1.6), [['R', "Da, don't say that."]], () => { c.R.face('worry'); }),
    beat((u, q, T) => [...jw(T, -.1, 1.75, 1.7), ...jw(T, -.45, 1.72, .55), 29], [['J', 'Too late. Now something will.']], () => { c.J.face('smug'); }),
    beat(side('S', 1.6), [['S', 'No negativity in my jeep!']], () => { c.S.face('grin').pose('peace' in {} ? 'peace' : 'pointUp', 'rest'); }),
    beat((u, q, T) => [...jw(T, -.1, 1.75, 1.7), ...jw(T, -.45, 1.72, .55), 29], [['J', "It's my jeep."]], () => { c.J.face('tired'); }),
    beat((u, q, T) => { const p = pos(T + 6); return [p.x + 3.6, p.y + 1.6, p.z - 6, p.x + 4.2, p.y + 2.3, p.z, 34]; }, [['N', 'Wayanad  —  24 km']], null, 4.5)
  ];
  return finish(S);
} });

/* ===== 4. THE WHISPERING BANYAN ===== */
SC.push({ id: 4, title: 'The Whispering Banyan', build() {
  const S = mkS({ sun: { d: [-.55, .32, .5], c: L(0xffc27a).map(v => v * 2.5) }, amb: [L(0xb4a888).map(v => v * .6), L(0x2a3a20).map(v => v * .6)], fog: { c: L(0xc8a878), d: .011 }, sky: { hor: L(0xf0c088), zen: L(0x5a80b0), glow: L(0xffb060) }, exp: 1.0, shake: .008, audio: { amb: 'forest', mus: 'night' } });
  const K = R.exterior(S); const c = mkChars(S); S.root.add(S.dome);
  const E_ = S.ext; const order = { H: -2.1, R: -.7, J: .7, S: 2.1 };
  const walk = (zf, zt, p, ph) => { for (const id in order) { const z = lerp(zf, zt, p) + (id === 'R' ? .5 : id === 'S' ? -.3 : 0); c[id].at(order[id] * .85 + (id === 'J' ? .3 : 0), z, PI).walk(ph + (id.charCodeAt(0) % 5), 1).pose('down'); } };
  S.base = (T) => { E_.dust.forEach(g => { g.p[1] = g.bp[1] + Math.sin(T * .4 + g.ph) * .5; g.p[0] = g.bp[0] + Math.sin(T * .2 + g.ph * 2) * .6; }); E_.frog.p[1] = .17 + Math.max(0, Math.sin(T * .7)) * .001; E_.watcher.vis = false; };
  const stand = (z) => { for (const id in order) c[id].at(order[id] * .85, z, PI).pose('down'); };
  S.beats = [
    beat({ a: [4, 1.5, 38, -1, 3.5, -6, 42], b: [3, 1.5, 24, -1, 3.8, -6, 40] }, [['N', 'By late afternoon, they reached the Whispering Banyan.']], (u, p) => { walk(44, 22, p, u * 1); }, 5),
    beat({ a: [.5, 1.2, 25, 0, 3.3, -6, 42], b: [.3, 1.4, 22.5, 0, 4.2, -6, 38] }, [], (u, p) => { stand(18); }, 2.2),
    beat(CU(c.S, 1.7, -.2, -.05, 30), [['S', 'The photos... were a flattering angle.']], () => { stand(18); c.S.pose('hips', 'down').headTo(.0, -.25).face('worry'); c.S.o.ry = PI - 3.0; }),
    beat({ a: [-2, 1.4, 15, 0, 1.6, 18, 35], b: [-3, 1.5, 14, -.5, 1.6, 18, 33] }, [['R', 'In 1960.']], () => { stand(18); c.R.face('tired').pose('cross'); c.R.o.ry = PI - .3; c.R.o.x = -.6; c.R.o.z = 18; c.R.lookAt(0, -6); }),
    beat({ a: [-4.8, 1.1, 14.4, -6, 1.4, 8, 40], b: [-5.2, 1.2, 12.5, -6.5, 1.0, 7.4, 36] }, [['H', "Where's the pool?"]], () => { stand(10.4); for (const id in order) c[id].at(-4.2 + order[id] * .6, 10.3 + (id === 'H' ? -.4 : 0), PI + (id === 'J' ? -.6 : -.3)); c.H.face('shock'); c.H.pose('point'); c.H.o.ry = PI - .6; c.H.lookAt(-7, 6); }),
    beat({ a: [-6.2, .6, 8.4, -6.2, .2, 5.4, 34], b: [-6.3, .5, 8.0, -6.1, .18, 5.4, 30] }, [['J', "That's a frog's house. We're the guests."]], () => { for (const id in order) c[id].at(-4.2 + order[id] * .6, 10.3, PI + .2); c.J.at(-4.6, 9.0, PI - .8).pose('chin').lookAt(-6.2, 5.4); c.J.face('smug'); }),
    beat({ a: [0, 1.2, 24, 0, 3.0, -6, 42], b: [0, 1.0, 22, 0, 6.0, -6, 38], e: 'io' }, [], (u, p) => { stand(19.5); for (const id in order) c[id].lookAt(0, -6); E_.watcher.vis = p > .45; if (p > .45) { E_.watcher.p[1] = 4.9 + Math.sin(u * .5) * .01; } }, 5.2, [[2.2, 'creak']])
  ];
  return finish(S);
} });

/* ===== 5. THE HALL ===== */
function lightsAnim(S, T, base) { S.flick.forEach(l => { l.k = 1 + .06 * Math.sin(T * 7 + l.fl) + .04 * Math.sin(T * 13.1 + l.fl * 2); }); }
SC.push({ id: 5, title: 'Too Clean', build() {
  const S = mkS({ sun: { d: [-.3, .3, .8], c: L(0xffa860).map(v => v * .5) }, amb: [L(0xb89870).map(v => v * .55), L(0x3a2418).map(v => v * .7)], fog: { c: L(0x2a1c12), d: .012 }, sky: { hor: L(0x2a1c12), zen: L(0x14100c), glow: [0, 0, 0] }, ao: 5.4, exp: 1.25, shake: .008, audio: { amb: 'hall', mus: 'night' } });
  const K = R.hall(S, { win: 'dusk' }); const B = R.bedroom(S, 40); const c = mkChars(S); S.root.add(S.dome);
  S.lights.push({ p: [-6, 4, 0], c: L(0xffa050), i: .0, r: 1 });
  const door = (a) => { K.doorL.r[1] = -a; K.doorR.r[1] = a; };
  const stand = (id, x, z, ry) => c[id].at(x, z, ry == null ? PI : ry);
  S.base = (T) => { lightsAnim(S, T); K.clock.swing(T, false); K.clock.set(3, 0); door(1.5); for (const id of 'SRJH') c[id].nopack(); };
  S.beats = [
    beat({ a: [0, 1.7, -2.5, 0, 1.9, 7, 40], b: [0, 1.65, -1.2, 0, 1.9, 7, 38] }, [['N', 'With no other option, and a lot of stubborn optimism...']], (u, p) => { door(sm(1.3, 3.2, u) * 1.5); const w = Math.max(0, p); stand('S', 0.5, lerp(8.4, 4.8, sm(2.4, 5.2, u)), PI); stand('J', -.6, lerp(9.2, 5.2, sm(3.0, 5.8, u)), PI); stand('H', -1.8, lerp(9.8, 5.6, sm(3.2, 6.2, u)), PI); stand('R', 1.7, lerp(10, 5.6, sm(3.0, 6.0, u)), PI); for (const id of 'SRJH') { const w = c[id].o.z > 5 ? 1 : 0; c[id].walk(u * 1, sm(2.4, 3.0, u) * (1 - sm(5.4, 6.4, u)) * 1); } c.S.pose('open', 'down').face('smug'); }, 6.8, [[1.2, 'door']]),
    beat({ a: [0, 1.6, 8.2, 0, 2.2, -3, 46], b: [0, 1.6, 7.6, 0, 2.2, -3, 40] }, [['J', 'No dust.']], () => { for (const id of 'SRJH') c[id].lookAt(0, -2); stand('S', .5, 4.7); stand('J', -.6, 5.2); stand('H', -1.8, 5.5); stand('R', 1.7, 5.4); c.J.face('worry'); }),
    beat(CU(c.H, 1.3, .25, 0, 30), [['H', 'Is that... filter coffee?']], () => { stand('H', -1.0, 3.0, 0); c.H.pose('hips'); c.H.headTo(.0, -.25).face('happy'); c.H.o.ry = .3; }),
    beat({ a: [-3.5, 1.5, 8, 0, 1.5, 2.5, 42], b: [-2.8, 1.5, 6.5, 0, 1.5, 2.6, 38] }, [['S', 'Rustic charm!']], () => { stand('S', .2, 3.6, 0); c.S.pose('open').face('grin'); stand('R', -1.6, 3.8, PI * .08 + .2); c.R.pose('cross').face('smug'); stand('J', 1.5, 2.2, 0); stand('H', -.6, 2.6, 0); }),
    beat({ a: [-1.2, 1.55, 2.2, .9, 1.35, 5.1, 34], b: [-.5, 1.55, 2.6, .9, 1.35, 5.1, 31] }, [['R', "Rustic doesn't have fresh flowers, Stany."]], () => { stand('R', 1.5, 5.3, PI * .92); c.R.pose('hips', 'cross').face('smug'); stand('S', -1.6, 3.6, PI * .6); c.S.pose('open'); stand('J', -2.7, 3.0, PI * .7); stand('H', -3.3, 4.2, PI * .8); c.R.lookAt(0, 0); }),
    beat({ a: [4.0, 1.5, -.5, 3.0, 2.2, -6.5, 36], b: [3.4, 1.6, -2.5, 3.0, 2.4, -6.5, 30], e: 'io' }, [['J', 'Stopped at exactly three.']], () => { stand('J', 2.0, -2.8, PI * 1.05); c.J.pose('chin').lookAt(3, -6.5).face('worry'); stand('S', 4.6, -3.2, PI * 1.0); c.S.pose('hips').lookAt(3, -6.5); stand('H', 1.3, -2.4, PI); stand('R', 3.5, -4.2, PI); c.H.pose('camera'); c.R.pose('cross'); }),
    beat({ a: [3.0, 2.2, -5.4, 3.0, 2.0, -6.5, 24], b: [3.0, 2.0, -5.9, 3.0, 1.35, -6.5, 22] }, [['N', 'It keeps time between what was and what still is.']], () => { stand('J', 2.0, -2.8, PI * 1.05); stand('S', 4.6, -3.2, PI); stand('H', 1.3, -2.4, PI); stand('R', 3.5, -4.2, PI); }, 0, [[.6, 'tick']]),
    beat({ a: [-4.3, 1.6, -3.2, -1.3, 1.5, -6.9, 40], b: [-3.0, 1.6, -2.2, -1.3, 1.5, -6.9, 36] }, [['J', "Locked. I'll try again later."]], () => { stand('J', -1.5, -6.0, PI * 1.0); c.J.pose('grab').face('tired'); stand('S', 0, -4.8, PI * 1.0); stand('R', 1.4, -3.8, PI); stand('H', -3, -4.6, PI * .9); }),
    beat({ a: [-3.0, 1.9, -1.6, -6.2, 1.1, -4.6, 38], b: [-2.8, 1.6, -2.2, -6.2, 1.2, -4.6, 34] }, [['X', 'PLINNNG'], ['S', 'Must be a cat.']], () => { stand('H', -2.6, -2.3, PI * .88); stand('J', -1.6, -4.8, PI * .8); stand('S', -.4, -1.9, PI * .8); stand('R', .5, -2.8, PI * .8); c.H.pose('camera').face('shock'); c.S.pose('hips').face('smug'); K.piano.r[1] = .5 + Math.sin(S.time * 40) * .0; }, 0, [[.1, 'plink']]),
    beat(CU(c.J, 1.4, .35, 0, 30), [['J', 'A cat that plays piano.']], () => { stand('J', -2.0, -1.8, 0.2); c.J.face('worry').pose('chin'); }),
    beat(CU(c.S, 1.6, -.3, 0, 30), [['S', '...Talented cat.']], () => { stand('S', -.4, -1.4, .3); c.S.face('shock').pose('hips'); c.S.headTo(.25, 0); }),
    beat({ a: [40, 1.7, 3.6, 40, 1.0, -2, 38], b: [40, 1.7, 3.0, 40, 1.0, -2, 36] }, [['S', "Master room. Leader's privilege."]], () => { stand('S', 40 + .8, .3, PI * .95); c.S.pose('open', 'hips').face('grin'); stand('R', 40 - .8, 1.2, PI); c.R.pose('cross'); stand('J', 40 + 1.9, 1.2, PI); stand('H', 40 - 1.8, 1.6, PI); }),
    beat({ a: [38.4, 1.6, 2.9, 40.4, 1.5, 0.2, 34], b: [38.6, 1.6, 2.6, 40.2, 1.5, .2, 32] }, [['R', 'Who voted?'], ['S', "Leaders don't need votes."]], () => { stand('S', 40 + .8, .3, PI * 1.05); c.S.pose('open').face('smug'); stand('R', 40 - .8, 1.4, PI * 1.05); c.R.pose('cross').face('worry'); stand('J', 40 + 1.9, 1.2, PI); stand('H', 40 - 1.8, 1.6, PI); }),
    beat({ a: [40, 3.3, 4.2, 40, .8, -2.2, 44], b: [40, 2.6, 3.4, 40, .85, -2.2, 40] }, [['H', "Then I'm the leader of this bed!"]], (u) => { const j = sm(.1, .55, u); c.H.at(40, lerp(-.4, -1.55, j), 0, lerp(1.0, .42, sm(.25, .6, u))).lie(lerp(.9, .45, sm(.2, .6, u))).pose('wide').face('grin'); c.H.o.ry = 0; c.S.at(40 + 1.4, .6, PI * 1.1).pose('hips').face('tired'); c.R.at(40 - 1.1, .9, PI * 1.0).pose('cross').face('smug'); c.J.at(40 + 2.2, 1.5, PI).pose('down'); }, 0, [[.5, 'thud']])
  ];
  return finish(S);
} });

/* ===== 6. THE PHOTOS & THE WATCHER ===== */
const SEAT = { R: [-6.1, 2.6, PI / 2], J: [-3.5, 2.6, -PI / 2], S: [-5.5, .45, 0], H: [-4.2, .45, 0] };
SC.push({ id: 6, title: 'Four Groups of Four', build() {
  const S = mkS({ sun: { d: [-.3, .3, .8], c: [0, 0, 0] }, amb: [L(0xb89870).map(v => v * .5), L(0x3a2418).map(v => v * .6)], fog: { c: L(0x2a1c12), d: .012 }, ao: 5.4, exp: 1.25, shake: .008, audio: { amb: 'hall', mus: 'night' } });
  const K = R.hall(S, { win: 'dusk' }); const c = mkChars(S); S.root.add(S.dome); let nightT = 1e9;
  const sit = (id, arms) => { const [x, z, ry] = SEAT[id]; c[id].at(x, z, ry).sit(.5).pose(arms || 'cup').nopack(); };
  const stand = (id, x, z, ry) => c[id].at(x, z, ry).nopack();
  S.base = (T) => {
    lightsAnim(S, T); K.clock.set(3, 0); K.clock.swing(T, T > nightT);
    const n = T > nightT; if (n && !S.isNight) { S.isNight = 1; K.winMats.forEach(m => m.tex = TX.skyWindow('night')); S.lights.forEach(l => { if (l.fl !== undefined) l.i *= .42; }); S.amb = [L(0x5a6a9a).map(v => v * .35), L(0x1a1218).map(v => v * .6)]; }
    K.book.vis = false; K.bookOpen.vis = false; K.drawer.p[0] = .45;
  };
  const wall = (id, x, z) => stand(id, x, z, -PI / 2);
  S.beats = [
    beat({ a: [-1, 1.5, 6.4, -5, 1.0, 2, 42], b: [-2.4, 1.4, 5.2, -5, 1.0, 2, 38] }, [['N', 'For a moment, it felt like any other trip.']], () => { sit('R', 'cup'); sit('J', 'cup'); sit('S', 'cup'); sit('H', 'lap'); c.S.face('happy'); c.R.face('smug'); c.J.face('happy'); c.H.face('grin'); }, 5.5),
    beat({ a: [-6.8, 2.0, 2.6, -8.9, 2.2, 1.6, 30], b: [-6.8, 2.1, 1.0, -8.9, 2.2, -.2, 30] }, [['H', 'Look, old tourists!']], () => { wall('H', -7.4, 1.5); c.H.pose('point').face('grin'); sit('R', 'cup'); sit('J', 'cup'); sit('S', 'cup'); c.R.lookAt(-8.9, 1.6); }),
    beat(CU(c.J, 1.5, .3, 0, 30), [['J', '2003, 2008, 2018. All groups of four.']], () => { wall('J', -7.0, 0.3); c.J.pose('chin').face('worry'); wall('S', -7.4, 1.5); c.S.pose('point'); }),
    beat(CU(c.S, 1.6, -.3, 0, 30), [['S', 'Repeat customers! Good sign!']], () => { wall('S', -7.4, 1.3); c.S.pose('open').face('grin'); wall('J', -7.0, .2); wall('R', -7.2, -.9); }),
    beat(CU(c.R, 1.4, .3, 0, 30), [['R', 'Or nobody came back to pick up the photos.']], () => { wall('R', -7.2, -.9); c.R.pose('cross').face('smug'); }),
    beat({ a: [-6.4, 2.3, -.4, -8.9, 2.3, -2.2, 30], b: [-7.6, 2.3, -1.6, -8.9, 2.3, -2.4, 18], e: 'io' }, [['J', '...Wait.'], ['J', 'Same window. Same figure. Fifteen years apart.']], () => { wall('J', -7.4, -.9); c.J.pose('point').face('worry'); }, 0, [[3, 'swell']]),
    beat(CU(c.H, 1.4, .3, 0, 30), [['H', "So that's the fifth friend."]], () => { wall('H', -7.0, -1.5); c.H.pose('camera').face('shock'); }),
    beat(CU(c.S, 1.6, -.3, 0, 30), [['S', "Maybe it's the caretaker."]], () => { wall('S', -7.4, .8); c.S.pose('shrug').face('worry'); }),
    beat(CU(c.R, 1.4, .3, 0, 30), [['R', 'For fifteen years? Just standing in the window?'], ['R', 'Stany. Read the reviews again. Now.']], () => { wall('R', -7.2, -.9); c.R.pose('hips').face('angry'); }),
    beat({ a: [-6.6, 2.0, -3.4, -8.4, .9, -2.2, 34], b: [-8.1, 1.9, -2.2, -8.1, .95, -2.2, 30], e: 'io' }, [['N', 'The Watcher'], ['N', 'He is always there, in every visitor. He never harms. He only watches. But when the tree chooses, he comes down.', { d: 5.5 }]], (u) => { wall('H', -7.3, -2.2); c.H.pose('chin').face('worry'); wall('S', -7.4, -1.1); wall('R', -7.2, -.2); wall('J', -7.2, -3.2); const o = sm(.3, 1.2, u); K.drawer.p[0] = .45 + o * .45; K.bookOpen.vis = u > 1.4; }, 0),
    beat(CU(c.S, 1.6, -.3, 0, 30), [['S', "That's a... normal thing to write in a journal."]], () => { wall('S', -7.2, -1.1); c.S.pose('shrug').face('worry'); wall('J', -7.2, -3.0); wall('R', -7.0, -.2); wall('H', -7.3, -2.2); }),
    beat(CU(c.J, 1.4, .3, 0, 30), [['J', 'New rule. Nobody goes anywhere alone.']], () => { wall('J', -7.0, -.6); c.J.pose('open').face('angry'); wall('S', -7.4, .8); }),
    beat(CU(c.H, 1.4, .3, 0, 30), [['H', 'Even the bathroom?'], ['R', 'Especially the bathroom.']], () => { wall('H', -7.3, -2.2); c.H.pose('shrug').face('worry'); wall('R', -7.2, -.9); c.R.face('angry'); }),
    beat({ a: [-1.5, 2.0, 6.6, -5, 1.0, 1.8, 40], b: [-2.8, 1.6, 5.4, -5, .9, 1.8, 36] }, [['H', 'Goodnight, fifth friend.'], ['R', "Say that again and I'll push you out the window."]], () => { nightT = 0; const ex = (id, a) => { sit(id, 'lap'); c[id].lean(a); }; ex('R', -.35); ex('J', -.35); ex('S', -.3); ex('H', -.3); c.H.face('smug'); c.R.face('angry'); }, 0),
    beat({ a: [-4, 1.8, 3.4, -4.7, 1.2, 1.3, 34], b: [-4.4, 1.6, 2.6, -4.7, 1.2, 1.3, 30] }, [], () => { for (const id of 'SRJH') { sit(id, 'lap'); c[id].lean(-.3).face('shock'); } }, 2.6),
    beat({ a: [3.0, 1.9, -2.2, 3.0, 2.0, -6.5, 30], b: [3.0, 2.0, -3.8, 3.0, 2.0, -6.5, 24], e: 'io' }, [['X', 'BONG...'], ['X', 'BONG...'], ['X', 'BONG...']], () => { for (const id of 'SRJH') { sit(id, 'lap'); c[id].lean(-.3); } }, 0),
    beat(CU(c.J, 1.4, .3, 0, 30), [['J', 'That clock is stopped.']], () => { sit('J', 'hold'); c.J.lean(0).face('worry'); sit('R', 'lap'); sit('S', 'lap'); sit('H', 'lap'); c.R.lean(0); c.S.lean(0); c.H.lean(0); c.J.lookAt(3, -6.5); }),
    beat(CU(c.R, 1.4, .3, 0, 30), [['R', "Then who's ringing it?! Don't answer."]], () => { sit('R', 'hands'); c.R.lean(0).face('shock'); sit('J', 'hold'); sit('S', 'lap'); sit('H', 'lap'); c.J.lean(0); c.S.lean(0); c.H.lean(0); c.R.lookAt(3, -6.5); }, 0, [])
  ];
  S.lights.push({ p: [-4.8, 1.8, 2.6], c: warm, i: 0, r: 8 });
  return finish(S);
} });
SC[5].build.__nm = 1;

/* ===== 7. CREAK ===== */
SC.push({ id: 7, title: 'Creak', build() {
  const S = mkS({ sun: { d: [0, 1, 0], c: [0, 0, 0] }, amb: [L(0x5a6a9a).map(v => v * .28), L(0x1a1218).map(v => v * .45)], fog: { c: L(0x06070c), d: .02 }, ao: 5.4, exp: 1.35, shake: .01, audio: { amb: 'night', mus: 'dread' } });
  const K = R.hall(S, { win: 'night' }); const c = mkChars(S); S.root.add(S.dome); S.lights.forEach(l => { if (l.fl !== undefined) l.i *= .3; });
  const fl = { p: [0, 1.3, 0], c: L(0xfff0d0), i: 5, r: 14, k: 1 }; S.lights.push(fl); S.amb = [L(0x6a7ab0).map(v => v * .55), L(0x2a1a22).map(v => v * .8)]; S.lights.push({ p: [6.0, 3.4, -3.0], c: L(0x7a96d8), i: 3.2, r: 14 }, { p: [7.2, 4.4, -6.2], c: L(0x7a96d8), i: 3.5, r: 10 }, { p: [6.2, 1.6, 2.0], c: L(0x7a96d8), i: 1.6, r: 10 });
  const wt = new Node(); K.watchN = grp(S.root, 7.2, 2.9, -5.2); { const m = M(0x000000, { c: [0, 0, 0], mode: 2, nofog: true }); sph(K.watchN, .2, .22, .15, m, 0, 1.55, 0); box(K.watchN, .55, 1.2, .22, m, 0, .65, 0); } K.watchN.vis = false;
  const sit = (id, arms) => { const [x, z, ry] = SEAT[id]; c[id].at(x, z, ry).sit(.5).pose(arms || 'lap').nopack(); };
  const stand = (id, x, z, ry) => c[id].at(x, z, ry == null ? 0 : ry).nopack();
  const stairP = (s, id, ox) => { const z = 3.4 - s * 6.8, y = Math.max(0, s * 2.9 + .02); c[id].at(7.2 + ox, z, PI, y).nopack().walk(S.time * 1.3 + ox, .7).lean(.12).pose('down'); };
  S.base = (T) => { lightsAnim(S, T); K.clock.set(3, 0); K.clock.swing(T, true); K.winMats.forEach(m => m.tex = TX.skyWindow('night')); const j = c.J.o; fl.p = [j.x, j.y + 1.3, j.z + .4]; S.time = T; fl.i = 5 + Math.sin(T * 3) * .2; };
  S.beats = [
    beat({ a: [6.4, .9, 5.4, 7.2, 3.2, -4.6, 44], b: [6.6, 1.0, 4.2, 7.2, 3.4, -4.6, 40] }, [['X', 'CREAK...'], ['X', 'CREAK...']], (u) => { for (const id of 'SRJH') { c[id].hide(); } K.watchN.vis = u > 1.4 && u < 3.2 || u > 3.8; fl.i = 0; }, 4.6, [[0, 'creak'], [1.9, 'creak']]),
    beat({ a: [-1.4, 1.7, 6.4, -4.8, 1.1, 1.6, 40], b: [-2.2, 1.6, 5.6, -4.8, 1.1, 1.6, 36] }, [['J', "It's coming from upstairs."]], () => { sit('R', 'lap'); sit('S', 'lap'); sit('H', 'lap'); c.S.lean(.2).face('worry'); c.R.lean(.2).face('shock'); c.H.lean(.15).face('shock'); stand('J', -3.4, 2.4, -PI / 2); c.J.pose('light').face('worry'); c.J.lookAt(7, -3); }),
    beat({ a: [-3.4, 1.7, 5.4, -4.6, 1.5, .8, 34], b: [-3.6, 1.7, 4.4, -4.6, 1.5, .8, 30] }, [['S', "I'll go first. I'm the leader."]], () => { stand('S', -4.6, .8, 0); c.S.pose('hips').face('grin'); stand('J', -3.4, 2.4, -PI / 2); c.J.pose('light'); stand('R', -6.1, 2.4, PI / 2).pose('cross'); c.R.face('shock'); sit('H', 'camera'); c.H.face('shock'); }),
    beat(CU(c.S, 1.6, -.35, 0, 30), [['S', '...Actually, Hashir has the camera. Cameras go first.']], () => { stand('S', -4.6, .8, 0); c.S.pose('hands').face('worry'); stand('J', -3.4, 2.4, -PI / 2); c.J.pose('light'); stand('H', -4.2, .3, 0); c.H.pose('camera').face('shock'); }),
    beat(CU(c.H, 1.4, .3, 0, 30), [['H', 'Since when?!']], () => { stand('H', -4.2, .3, 0); c.H.pose('camera').face('angry'); stand('S', -3.6, 1.0, 0); c.S.pose('hands'); stand('J', -3.4, 2.4, -PI / 2); c.J.pose('light'); }),
    beat({ a: [5.0, .7, 5.8, 7.2, 1.6, 0, 52], b: [5.2, .9, 4.6, 7.2, 2.6, -3.4, 44], e: 'io' }, [['R', 'I hate every single one of you.']], (u, p) => { const q = sm(0, 1, p); stairP(lerp(.0, .45, q), 'H', 0); stairP(lerp(-.13, .32, q), 'J', -.7); stairP(lerp(-.26, .19, q), 'S', .7); stairP(lerp(-.4, .05, q), 'R', 0); c.H.pose('camera'); c.R.face('angry'); c.S.face('worry'); c.J.pose('light'); fl.p = [7, c.J.o.y + 1.3, c.J.o.z - .4]; }, 5.5, [[.6, 'creak']])
  ];
  return finish(S);
} });

/* ===== 8. THE CORRIDOR ===== */
SC.push({ id: 8, title: 'The Door at the End', build() {
  const S = mkS({ sun: { d: [0, 1, 0], c: [0, 0, 0] }, amb: [L(0x5a6a9a).map(v => v * .22), L(0x1a1218).map(v => v * .4)], fog: { c: L(0x06070c), d: .03 }, ao: 3.4, exp: 1.45, shake: .01, audio: { amb: 'night', mus: 'dread' } });
  const K = R.corridor(S, 0); const c = mkChars(S); S.root.add(S.dome); const fl = { p: [0, 1.3, 0], c: L(0xfff0d0), i: 4.5, r: 12, k: 1 }; S.lights.push(fl);
  const pos = { H: [-.45, 0], S: [.45, .2], J: [-.45, 1.1], R: [.45, 1.3] };
  const row = (z, ph, amt) => { for (const id in pos) c[id].at(pos[id][0] * .9, z + pos[id][1], PI).nopack().walk(ph + id.charCodeAt(0), amt).pose('down'); c.J.pose('light'); };
  S.base = (T) => { lightsAnim(S, T); K.slit.m.a = .75; K.slitLight.i = 2.5; const j = c.J.o; fl.p = [j.x, 1.3, j.z - .6]; };
  S.beats = [
    beat({ a: [0, 1.7, 3.4, 0, 1.6, -9, 40], b: [0, 1.6, 1.4, 0, 1.55, -9, 34] }, [['N', 'Upstairs. Third floor landing. One door.']], (u, p) => { row(lerp(.3, -3.5, p), u * 1.1, 1); }, 5.2),
    beat({ a: [0, 1.6, -9.5, 0, 1.4, -13.9, 30], b: [0, 1.5, -11.7, 0, 1.3, -13.9, 24], e: 'io' }, [['J', 'I checked this door twice. It was locked.']], (u) => { row(-9.2, 0, 0); c.J.face('worry'); }, 0),
    beat(CU(c.S, 2.0, -.2, 0, 26), [['S', "Maybe it's the caretaker."]], () => { row(-9.2, 0, 0); c.S.pose('shrug').face('smirk'); }),
    beat(CU(c.R, 2.0, .2, 0, 26), [['R', 'At 3 AM? With a key nobody has?']], () => { row(-9.2, 0, 0); c.R.pose('cross').face('worry'); }),
    beat(CU(c.S, 2.0, -.2, 0, 26), [['S', '...Hardworking caretaker.']], () => { row(-9.2, 0, 0); c.S.pose('shrug').face('shock'); }),
    beat(CU(c.H, 2.0, .2, 0, 26), [['H', "A ghost I can pray to. A person I can't!"]], () => { row(-9.2, 0, 0); c.H.pose('hands').face('shock'); }),
    beat({ a: [0, 1.5, -11.0, 0, 1.3, -13.9, 26], b: [0, 1.4, -12.9, 0, 1.3, -13.9, 20] }, [], (u, p) => { row(-9.8, 0, 0); c.S.at(.4, -12.2 + 0, PI).pose('grab', 'down').walk(0, 0).face('worry'); K.slit.s[0] = 1 + sm(.5, 1.0, p) * 14; K.slit.m.a = .75 + sm(.4, 1, p) * .25; K.slitLight.i = 2.5 + sm(.4, 1, p) * 20; }, 3.6, [[.8, 'door']])
  ];
  return finish(S);
} });

/* ===== 9. THE STUDY ===== */
SC.push({ id: 9, title: 'Still Hot', build() {
  const S = mkS({ amb: [L(0x2a3450).map(v => v * .9), L(0x1a1010).map(v => v * .8)], fog: { c: L(0x0a0a10), d: .02 }, ao: 4, exp: 1.4, shake: .009, audio: { amb: 'study', mus: 'dread' } });
  const K = R.study(S, { win: 'night' }); const c = mkChars(S); S.root.add(S.dome); S.lights.forEach(l => { if (l.fl !== undefined) l.i *= .7; });
  K.doorLight.i = 1.2; K.leafMats.forEach(m => m.e = gold.map(v => v * .25));
  const wc = new Node(); const W_ = grp(S.root, 3.55, 0, .5); const wm = M(0x000000, { c: [0, 0, 0], mode: 2 }); sph(W_, .2, .23, .16, wm, 0, 1.72, 0); box(W_, .6, 1.3, .25, wm, 0, .98, 0); box(W_, .3, .4, .22, wm, 0, .2, 0); W_.r[1] = -PI / 2; W_.vis = false;
  S.lights.push({ p: [-2.5, 1.6, 1.5], c: warm, i: 1.1, r: 9 });
  const pos = { S: [-2.4, -.5], R: [-1.7, -.35], J: [-.9, -.35], H: [-.15, -.5] };
  const around = () => { for (const id in pos) c[id].at(pos[id][0], pos[id][1], PI).nopack().pose('down'); };
  S.base = (T) => { lightsAnim(S, T); K.clock.set(2, 56); K.clock.swing(T, true); K.steam.forEach(s => { const ph = (T * .5 + s.j / 3 + s.i * .3) % 1; s.n.p[1] = .95 + ph * .7; s.n.p[0] = s.x + Math.sin(ph * 6 + s.j) * .04; s.n.m.a = .35 * Math.sin(ph * 3.14); s.n.s[0] = s.n.s[1] = .15 + ph * .35; }); K.polaroid.vis = false; W_.vis = false; K.keyN.vis = true; };
  S.beats = [
    beat({ a: [3.4, 2.0, 3.6, -1.6, 1.0, -1.4, 40], b: [2.4, 1.8, 2.8, -1.6, 1.0, -1.2, 36], e: 'io' }, [['N', 'The study.']], () => { around(); for (const id in pos) c[id].lookAt(-1.4, -1.3); }, 4),
    beat({ a: [-1.4, 1.6, -3.1, -1.5, .98, -1.2, 24], b: [-1.4, 1.5, -2.8, -1.5, .98, -1.2, 21] }, [['J', 'Still hot.']], () => { around(); c.J.at(-1.15, -.35, PI).pose('cup'); c.J.face('worry'); c.J.lookAt(-1.5, -1.2); }),
    beat(CU(c.H, 1.4, .3, 0, 30), [['H', 'Ayyo.']], () => { around(); c.H.face('shock').pose('hands'); }),
    beat({ a: [.4, 1.75, 1.8, 3.9, 1.85, .5, 36], b: [1.2, 1.75, 1.5, 3.9, 1.85, .5, 30], e: 'io' }, [['P', '', { d: 3.8 }]], (u) => { around(); W_.vis = u > .8; for (const id in pos) c[id].lookAt(3.7, .5); }, 3.8, [[.8, 'swell']]),
    beat([-1.5, 1.45, 1.4, -1.5, 1.4, -.6, 26], [], () => { around(); for (const id in pos) c[id].hide(); K.polaroid.vis = true; K.polaroid.p = [-1.5, 1.45, .55]; K.polaroid.r = [0, 0, .05]; K.polaroid.s = [.5, .5, 1]; K.polaroid.m.mode = 2; K.polaroid.m.nofog = true; }, 3.2),
    beat(CU(c.H, 1.4, .3, 0, 30), [['H', 'Da. This is us. When we arrived.']], () => { around(); c.H.pose('chin').face('worry'); }),
    beat(CU(c.R, 1.4, .3, 0, 30), [['R', 'We were alone at 4:12.'], ['J', 'Someone took this from upstairs.']], () => { around(); c.R.pose('cross').face('shock'); c.J.face('shock'); }),
    beat(CU(c.S, 1.6, -.3, 0, 30), [['S', "In my defence, it did say 'Quiet.'"], ['R', 'Stany. Stop.']], () => { around(); c.S.pose('hands').face('worry'); }),
    beat({ a: [-1.75, 1.55, -.75, -1.75, .84, -1.0, 34], b: [-1.75, 1.2, -1.05, -1.75, .84, -1.0, 22], e: 'io' }, [['N', 'You found it.  At the third hour, the next door opens.  Do not be late.  — The Watcher', { d: 6 }]], () => { around(); K.polaroid.vis = false; }, 0),
    beat(CU(c.R, 1.4, .3, 0, 30), [['R', 'Late for WHAT?']], () => { around(); c.R.pose('hands').face('angry'); }),
    beat(CU(c.H, 1.4, .3, 0, 30), [['H', "I'm leaving. Taking the jeep. Taking nobody."]], () => { around(); c.H.pose('hands').face('shock'); })
  ];
  return finish(S);
} });

/* ===== 10. THUD ===== */
SC.push({ id: 10, title: 'Thud', build() {
  const S = mkS({ sun: { d: [0, 1, 0], c: [0, 0, 0] }, amb: [L(0x5a6a9a).map(v => v * .3), L(0x1a1218).map(v => v * .5)], fog: { c: L(0x06070c), d: .02 }, ao: 5.4, exp: 1.4, shake: .012, audio: { amb: 'night', mus: 'dread' } });
  const K = R.hall(S, { win: 'night' }); const c = mkChars(S); S.root.add(S.dome); S.lights.forEach(l => { if (l.fl !== undefined) l.i *= .35; });
  const fl = { p: [7, .5, 3], c: L(0xfff0d0), i: 2.5, r: 10, k: 1 }; S.lights.push(fl);
  S.base = (T) => { lightsAnim(S, T); K.clock.set(2, 56); K.clock.swing(T, true); K.winMats.forEach(m => m.tex = TX.skyWindow('night')); };
  const tumble = (id, u, off, fin) => { const q = sm(.15 + off, .75 + off, u), s = 1 - q; c[id].at(7.2 + fin[0], lerp(.2, 3.6 + fin[1], q), PI, s * 2.2).nopack(); if (q < 1) c[id].lean(s * 5); };
  S.beats = [
    beat({ a: [3.4, 1.0, 8.0, 7.2, 1.2, 2.2, 52], b: [4.6, .9, 7.0, 7.2, .4, 3.6, 46] }, [['X', 'THUD!']], (u) => {
      tumble('S', u, 0, [0, .5]); tumble('R', u, .05, [.8, .1]); tumble('H', u, .1, [-.8, -.3]); tumble('J', u, .15, [.2, -.9]);
      if (u > .8) { c.S.pose('wide').lie(.2).face('shock'); c.S.o.ry = PI * .9; c.S.o.y = 0; c.R.pose('hands').lie(.22).face('angry'); c.R.o.ry = PI * 1.2; c.R.o.y = 0; c.H.pose('open').sit(.15).face('shock'); c.H.o.ry = PI * .7; c.H.o.y = 0; c.J.pose('light').lie(.2).face('tired'); c.J.o.ry = PI * 1.4; c.J.o.y = 0; }
      fl.p = [c.J.o.x - 1, .5, c.J.o.z + .5]; }, 5.5, [[.9, 'thud']])
  ];
  return finish(S);
} });

/* ===== 11. THE DOOR ===== */
SC.push({ id: 11, title: 'The Third Hour', build() {
  const S = mkS({ amb: [L(0x2a3450).map(v => v * .9), L(0x1a1010).map(v => v * .8)], fog: { c: L(0x0a0a10), d: .02 }, ao: 4, exp: 1.4, shake: .01, audio: { amb: 'study', mus: 'dread' } });
  const K = R.study(S, { win: 'night' }); const c = mkChars(S); S.root.add(S.dome); S.lights.forEach(l => { if (l.fl !== undefined) l.i *= .7; });
  K.polaroid.vis = false; K.keyN.vis = false; K.note.vis = false;
  const sparks = []; for (let i = 0; i < 14; i++) { const q = glow(S.root, .35, gold, 0, 0, 1, -4.8); sparks.push(q); }
  let glowAmt = 0, open = 0, flash = 0; const D = K; const knobs = [];
  S.base = (T) => {
    lightsAnim(S, T); const g = glowAmt, pulse = .9 + Math.sin(T * 6) * .1;
    K.leafMats.forEach(m => m.e = gold.map(v => v * (.25 + g * 2.2) * pulse)); K.doorGlow.m.a = (.1 + g * .6) * pulse; K.doorLight.i = 1.2 + g * 9 + open * 40; K.doorLight.k = pulse; K.rays.forEach(q => q.m.a = .02 + g * .09 + open * .14);
    K.leafL.r[1] = -open * 1.45; K.leafR.r[1] = open * 1.45; K.back.vis = open > 0; K.backM.e = [1.6 * open, 1.45 * open, 1.1 * open]; K.backM.c = [0, 0, 0]; K.backM.mode = 2; K.backM.a = 1;
    sparks.forEach((q, i) => { const a = (Math.sin(T * (6 + i) + i * 3) * .5 + .5) * g * (Math.sin(T * 17 + i) > .3 ? 1 : .15); q.m.a = a * .9; q.p = [Math.sin(i * 1.9 + T * .5) * 1.1, 1.0 + (i / 14) * 2.5 + Math.sin(T * 3 + i) * .2, -4.7]; });
    K.clock.set(g > 0 || T > 99 ? 3 : 2, T > 99 ? 0 : 56); K.clock.swing(T, true);
  };
  const row = (x, z, ry) => { c.S.at(x[0], z, ry).nopack(); c.R.at(x[1], z, ry).nopack(); c.J.at(x[2], z, ry).nopack(); c.H.at(x[3], z, ry).nopack(); };
  const floorRow = () => { row([-1.5, -.5, .5, 1.5], -1.0, 0); for (const id of 'SRJH') c[id].floor().pose('lap'); c.S.pose('cross'); c.H.pose('phone'); };
  S.beats = [
    beat({ a: [1.8, 1.8, -.2, 0, 1.5, -4.9, 40], b: [2.2, 1.7, -1.9, 0, 1.4, -4.9, 36] }, [['S', "It's not locked. It just... doesn't open."]], () => { glowAmt = 0; open = 0; c.S.at(-.15, -4.3, PI).pose('grab').nopack().lean(.3).face('worry'); c.R.at(1.0, -2.6, PI).nopack().pose('cross').face('worry'); c.J.at(-1.2, -2.8, PI).nopack().pose('down').face('worry'); c.H.at(1.7, -3.2, PI).nopack().pose('camera').face('worry'); }),
    beat({ a: [-.6, 1.7, -1.4, -.1, 1.3, -4.9, 36], b: [-.6, 1.7, -1.5, 0, 1.3, -4.9, 36] }, [['R', 'OW! Who builds a door this strong?!']], (u) => { glowAmt = 0; c.S.at(-.15, -4.3, PI).pose('grab').nopack().lean(.3); const r = sm(0, .4, u); c.R.at(.5 + r * 1.2, -4.4 + r * 1.6, PI - r * 1.6, 0).nopack().pose('hands').lean(-.5 * r).face('shock'); c.H.at(1.0, -2.6, PI).nopack().pose('cross'); c.J.at(-1.2, -2.8, PI).nopack().pose('down'); }),
    beat(CU(c.J, 1.4, .3, 0, 30), [['J', '2:56. Four minutes.']], () => { glowAmt = 0; c.J.at(-1.0, -2.2, 0).nopack().pose('hold').face('worry'); c.S.at(-.15, -4.3, PI).nopack().pose('grab').lean(.3); c.H.at(1.7, -3.0, PI).nopack().pose('hands'); c.R.at(.8, -2.5, 0).nopack().pose('cross'); }),
    beat({ a: [0, 1.0, 3.2, 0, 1.0, -1, 44], b: [0, 1.1, 2.6, 0, 1.0, -1, 40] }, [['H', "If I die, upload this. Title: 'Four Idiots in Wayanad.'"]], () => { floorRow(); glowAmt = 0; c.H.face('worry').pose('phone'); }),
    beat(CU(c.S, 1.6, -.3, 0, 30), [['S', "I'm not an idiot."]], () => { floorRow(); c.S.face('angry').pose('cross'); glowAmt = 0; }),
    beat(CU(c.R, 1.4, .3, 0, 30), [['R', 'You booked it.']], () => { floorRow(); c.R.face('smug').pose('cross'); glowAmt = 0; }),
    beat({ a: [-1.2, 1.7, .6, -3.2, 2.0, -4.25, 34], b: [-2.4, 1.9, -1.0, -3.2, 2.1, -4.25, 26], e: 'io' }, [['X', 'DONG!']], () => { floorRow(); glowAmt = 0; for (const id of 'SRJH') c[id].face('shock'); }, 2.6, []),
    beat({ a: [0, 1.5, 3.8, 0, 1.9, -4.9, 42], b: [0, 1.7, 1.4, 0, 1.9, -4.9, 36], e: 'io' }, [['X', 'DONG! DONG!']], (u, p) => { floorRow(); glowAmt = sm(0, 3.2, u); for (const id of 'SRJH') { c[id].face('shock'); c[id].lookAt(0, -5); } }, 4.2, [[1.6, 'dong']]),
    beat({ a: [-.4, 1.7, -1.7, .3, 1.45, -4.9, 32], b: [-.2, 1.7, -2.5, .1, 1.45, -4.9, 30] }, [['S', 'Nobody touch it.']], () => { glowAmt = 1; floorRow(); c.S.at(-.3, -3.2, PI).nopack().pose('grab').lean(.2).face('worry'); c.R.at(.7, -3.4, PI).nopack().pose('grab').face('shock'); c.H.at(1.6, -2.6, PI).nopack().pose('hands'); c.J.at(-1.4, -2.7, PI).nopack().pose('hands'); }),
    beat(CU(c.R, 1.4, .3, 0, 30), [['R', 'Da! You just said nobody!']], () => { glowAmt = 1; c.R.at(.7, -3.4, PI - .5).nopack().pose('grab').face('shock'); c.S.at(-.1, -3.2, PI).nopack().pose('grab'); c.H.at(1.6, -2.6, PI).nopack(); c.J.at(-1.4, -2.7, PI).nopack(); }),
    beat({ a: [0, 1.5, -2.2, 0, 1.2, -4.9, 20], b: [0, 1.4, -3.4, 0, 1.2, -4.9, 16], e: 'io' }, [['H', 'Guys... it\'s turning.'], ['J', 'Not from our side.']], (u) => { glowAmt = 1; c.S.at(-1.2, -2.4, PI).nopack().pose('hands'); c.R.at(1.2, -2.5, PI).nopack().pose('hands'); c.H.at(-.5, -2.6, PI).nopack().pose('point').face('shock'); c.J.at(.5, -2.6, PI).nopack().pose('hands').face('shock'); }, 0, [[.2, 'door']]),
    beat(CU(c.R, 1.4, .3, 0, 30), [['R', '...Stany.'], ['S', 'Yes?'], ['R', 'Next time, we read the reviews.'], ['S', '...Okay.']], () => { glowAmt = 1; c.R.at(.7, -2.5, PI).nopack().pose('hands').face('worry'); c.S.at(-.4, -2.5, PI).nopack().pose('hands').face('worry'); c.H.at(1.5, -2.4, PI).nopack(); c.J.at(-1.3, -2.4, PI).nopack(); c.R.lookAt(-.4, -2.5); c.S.lookAt(.7, -2.5); }),
    beat({ a: [0, 1.5, 1.6, 0, 1.7, -4.9, 46], b: [0, 1.5, 1.0, 0, 1.7, -4.9, 38], e: 'io' }, [], (u, p) => { glowAmt = 1; open = sm(.2, 4.0, u); row([-1.5, -.5, .5, 1.5], -2.2, PI); for (const id of 'SRJH') { c[id].pose('down').face('shock'); c[id].lookAt(0, -5); } c.R.pose('hands'); c.H.pose('camera'); }, 9, [[.3, 'boom']])
  ];
  return finish(S);
} });
G.SC = SC; G.NAMES = NAMES; G.StoryUtil = { mkS, mkChars, beat, finish, CU, lightsAnim, pose, face, headY };
})(window);
