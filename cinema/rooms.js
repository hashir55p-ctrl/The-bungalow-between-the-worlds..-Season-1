/* Sets: study, hall, corridor, bedroom, Fort Kochi, road + jeep, bungalow exterior. */
(function (G) {
'use strict';
const { M, L, PI, sm, ramp, lerp, clamp, Node, rng, G_QUAD } = E; const { box, cyl, cone, frus, sph, quad, floor, tor, grp, glow, blob, TX } = W;
const R = {};
const tileM = (m, rx, ry) => Object.assign({}, m, { rep: [rx, ry] });
const WOOD = (h, sp) => M(h, { sp: sp === undefined ? .08 : sp });
const warm = L(0xffa848), gold = L(0xffb840);
function wallQ(p, w, h, m, x, y, z, ry, rx = 0) { const n = new Node(G_QUAD(), m).pos(x, y, z).rot(rx, ry, 0).scl(w, h, 1); p.add(n); return n; }
function room(p, x0, x1, z0, z1, h, wm, fm, cm) {
  const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  wallQ(p, w, h, tileM(wm, w / 3, h / 3), cx, h / 2, z0, 0); wallQ(p, w, h, tileM(wm, w / 3, h / 3), cx, h / 2, z1, PI);
  wallQ(p, d, h, tileM(wm, d / 3, h / 3), x0, h / 2, cz, PI / 2); wallQ(p, d, h, tileM(wm, d / 3, h / 3), x1, h / 2, cz, -PI / 2);
  floor(p, w, d, tileM(fm, w / 2.5, d / 2.5), cx, 0, cz); wallQ(p, w, d, tileM(cm, w / 3, d / 3), cx, h, cz, 0, PI / 2);
}
function lantern(p, S, x, y, z, i = 3, r = 11, col) {
  box(p, .16, .26, .16, M(0xffe3b0, { e: warm.map(v => v * 2.4) }), x, y, z); box(p, .22, .03, .22, 0x1a1208, x, y + .15, z); box(p, .22, .03, .22, 0x1a1208, x, y - .15, z);
  const g = glow(p, 1.2, col || warm, .6, x, y, z); const l = { p: [x, y, z], c: col || warm, i, r, k: 1, fl: Math.random() * 6 }; S.lights.push(l); (S.flick = S.flick || []).push(l); return l;
}
function lamp(p, S, x, y, z, i = 2.5, r = 8) { cyl(p, .05, .22, WOOD(0x3a2a1a), x, y + .11, z); sph(p, .13, .1, .13, M(0xffe3b0, { e: warm.map(v => v * 2.2) }), x, y + .32, z); glow(p, .8, warm, .5, x, y + .32, z); const l = { p: [x, y + .4, z], c: warm, i, r, k: 1, fl: Math.random() * 6 }; S.lights.push(l); (S.flick = S.flick || []).push(l); return l; }
function clock(p, x, z, ry) {
  const g = grp(p, x, 0, z); g.r[1] = ry; const wd = WOOD(0x3a2010, .2), wd2 = WOOD(0x4a2a14, .2);
  box(g, .8, .5, .5, wd, 0, .25, 0); box(g, .6, 1.3, .38, wd2, 0, 1.15, 0); box(g, .85, .75, .5, wd, 0, 2.1, 0); box(g, .95, .12, .56, wd2, 0, 2.55, 0);
  const face = quad(g, .7, .7, M(0xffffff, { tex: TX.clock(), mode: 0 }), 0, 2.1, .26);
  const hh = grp(g, 0, 2.1, .275), mh = grp(g, 0, 2.1, .285); box(hh, .035, .2, .01, 0x15100a, 0, .09, 0); box(mh, .025, .29, .01, 0x15100a, 0, .13, 0);
  const pen = grp(g, 0, 1.55, .21); cyl(pen, .01, .8, M(0xc09a3a, { sp: .8 }), 0, -.35, 0); const disc = cyl(pen, .11, .02, M(0xd8b04a, { sp: .9 }), 0, -.75, 0); disc.rot(PI / 2, 0, 0);
  quad(g, .34, .9, M(0x1a0f08), 0, 1.2, .2);
  const vm = M(0x3d6a2a, { sp: .05 }), rm = WOOD(0x4a3018);
  for (let i = 0; i < 9; i++) { const a = i * 1.1; const c = cyl(g, .028, .5 + (i % 3) * .2, i % 2 ? vm : rm, Math.sin(a) * .42, 1.2 + i * .2, .26); c.rot(0, 0, Math.sin(a * 2) * .6); }
  [-1, 1].forEach(s => { for (let j = 0; j < 4; j++) cyl(g, .02, .5, rm, s * (.34 + j * .02), 2.1 + j * .1, .27).rot(0, 0, s * (.5 + j * .15)); });
  const o = { node: g, hh, mh, pen, set(h, m) { hh.r[2] = -((h % 12) + m / 60) / 12 * PI * 2; mh.r[2] = -m / 60 * PI * 2; }, swing(t, on) { pen.r[2] = on ? Math.sin(t * 3.1) * .35 : 0; } }; o.set(3, 0); return o;
}
function bookshelf(p, x, z, ry, w, h) { const g = grp(p, x, 0, z); g.r[1] = ry; box(g, w, h, .45, WOOD(0x2a170b), 0, h / 2, 0); quad(g, w - .1, h - .15, M(0xffffff, { tex: TX.books(), rep: [w / 1.0, h / 1.2] }), 0, h / 2, .231); return g; }

/* ---------- STUDY ---------- */
R.study = function (S, o) {
  o = o || {}; const root = S.root;
  room(root, -4, 4, -5, 4.5, 4, M(0xffffff, { tex: TX.planks('#3a2212', '#2e1a0e', 0), rep: [1, 1] }), M(0xffffff, { tex: TX.planks('#4a2c16', '#3a2210', 1), sp: .3 }), WOOD(0x1e120a));
  for (let i = -3; i <= 3; i += 1.5) box(root, .28, .3, 9.4, WOOD(0x1a0e06), i, 3.85, -.25);
  const ref = {};
  // door
  const dm = M(0xffffff, { tex: TX.door(), e: [0, 0, 0], emTex: true, sp: .1 }); ref.doorMat = dm;
  const dg = grp(root, 0, 0, -4.95); ref.doorG = dg;
  box(dg, .3, 3.9, .3, WOOD(0x2a1608), -1.45, 1.95, 0); box(dg, .3, 3.9, .3, WOOD(0x2a1608), 1.45, 1.95, 0); box(dg, 3.2, .35, .3, WOOD(0x2a1608), 0, 3.75, 0);
  const lm = M(0xffffff, { tex: TX.doorHalf(0), e: [0, 0, 0], emTex: true }), rm_ = M(0xffffff, { tex: TX.doorHalf(1), e: [0, 0, 0], emTex: true }); ref.leafMats = [lm, rm_];
  ref.leafL = grp(dg, -1.3, 0, .02); box(ref.leafL, 1.3, 3.5, .12, lm, .65, 1.75, 0);
  ref.leafR = grp(dg, 1.3, 0, .02); box(ref.leafR, 1.3, 3.5, .12, rm_, -.65, 1.75, 0);
  [[-.12, 1], [.12, 1]].forEach(([x]) => sph(dg, .055, .055, .05, M(0xd8a840, { sp: .9 }), x, 1.25, .18));
  ref.back = quad(dg, 3, 3.5, M(0xffffff, { mode: 2, e: [0, 0, 0], c: [0, 0, 0], nofog: true }), 0, 1.75, -.35); ref.back.vis = false; ref.backM = ref.back.m;
  ref.doorGlow = glow(root, 7, gold, 0, 0, 1.9, -4.4); ref.doorLight = { p: [0, 1.8, -3.6], c: gold, i: 0, r: 14, k: 1 }; S.lights.push(ref.doorLight);
  ref.rays = []; for (let i = 0; i < 5; i++) { const q = new Node(G_QUAD(), M(0xffffff, { c: gold, mode: 2, tex: TX.glow(), a: 0, add: true, nofog: true })).pos(-1.2 + i * .6, 1.8, -3.5 + i * .02).scl(1.4, 4.2, 1); root.add(q); ref.rays.push(q); }
  // bookshelves
  bookshelf(root, -3.72, -.5, PI / 2, 8.4, 3.5); bookshelf(root, 3.72, -3, -PI / 2, 3, 3.5); bookshelf(root, 3.72, 3.1, -PI / 2, 2.8, 3.5);
  // window on right wall
  const win = quad(root, 2.2, 2.6, M(0xffffff, { tex: TX.skyWindow(o.win || 'night'), mode: 2, nofog: true }), 3.9, 1.95, .5, -PI / 2);
  box(root, .12, 2.9, 2.5, WOOD(0x1e1208), 3.96, 1.95, .5); win.p[0] = 3.89; box(root, .06, 2.7, .06, 0x120a05, 3.87, 1.95, .5); box(root, .06, .06, 2.3, 0x120a05, 3.87, 1.95, .5); box(root, .06, .06, 2.3, 0x120a05, 3.87, 2.6, .5); box(root, .06, .06, 2.3, 0x120a05, 3.87, 1.3, .5);
  box(root, .12, 2.9, .14, WOOD(0x1e1208), 3.9, 1.95, -.7); box(root, .12, 2.9, .14, WOOD(0x1e1208), 3.9, 1.95, 1.7);
  [[-1.0, 1], [2.0, 1]].forEach(([z]) => box(root, .12, 3.0, .6, M(0x5a1a22), 3.85, 1.85, z));
  ref.win = win; ref.winCx = [3.9, 1.95, .5];
  // rug
  floor(root, 4.4, 5.6, M(0xffffff, { tex: TX.leafRed(), rep: [3, 4] }), -.2, .012, .3);
  // desk, chair, items
  const dk = grp(root, -1.4, 0, -1.4); ref.desk = dk; const dw = WOOD(0x2e190c, .25);
  box(dk, 2.2, .08, 1.0, dw, 0, .78, 0); [[-1, -.4], [1, -.4], [-1, .4], [1, .4]].forEach(([a, b]) => box(dk, .1, .76, .1, dw, a * 1, .38, b));
  box(dk, 2.0, .3, .06, dw, 0, .6, .45); box(dk, .8, .15, .85, dw, .6, .66, 0);
  const chair = grp(root, -1.4, 0, -2.4); box(chair, .6, .08, .6, WOOD(0x4a1a1a), 0, .5, 0); box(chair, .6, .8, .08, WOOD(0x4a1a1a), 0, .9, -.28); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => box(chair, .06, .5, .06, dw, a * .26, .25, b * .26));
  const cupM = M(0xffffff, { tex: TX.noise('#eef0f4', '60,90,170', 140), sp: .6 });
  ref.cups = [[-1.7, -1.2], [-1.35, -1.2]].map(([x, z]) => { const c = cyl(root, .06, .08, cupM, x, .86, z); cyl(root, .1, .015, cupM, x, .81, z); const tea = cyl(root, .052, .005, M(0x6a3a14), x, .895, z); return c; });
  ref.steam = []; [[-1.7, -1.2], [-1.35, -1.2]].forEach(([x, z], i) => { for (let j = 0; j < 3; j++) { const s = glow(root, .3, [1, 1, 1], .0, x, 1, z); s.m.a = 0; ref.steam.push({ n: s, x, z, j, i }); } });
  ref.keyN = grp(root, -.95, .83, -1.35); cyl(ref.keyN, .02, .012, M(0xd8a840, { sp: .9 }), 0, 0, 0).rot(PI / 2, 0, 0); box(ref.keyN, .02, .008, .12, M(0xd8a840, { sp: .9 }), 0, 0, .08); tor(ref.keyN, .035, .25, M(0xd8a840, { sp: .9 }), 0, 0, -.05).rot(PI / 2, 0, 0);
  ref.note = floor(root, .26, .34, M(0xffffff, { tex: TX.parchment(['You found it.', 'At the third hour,', 'the next door opens.', 'Do not be late.', '— The Watcher'], 20) }), -1.75, .835, -1.0);
  ref.note.r[1] = .25;
  ref.polaroid = quad(root, .24, .24, M(0xffffff, { tex: TX.polaroid(), mode: 0 }), -1.0, .835, -1.0); ref.polaroid.rot(-PI / 2, .2, 0); ref.polaroid.vis = false;
  lamp(root, S, -.75, .82, -1.55, 3.0, 9);
  box(dk, .3, .08, .22, WOOD(0x6a2a1a), .8, .84, .1); box(dk, .28, .08, .2, WOOD(0x2a4a3a), .8, .92, .1); box(dk, .25, .06, .18, WOOD(0x7a5a2a), .8, .99, .1);
  // clock
  ref.clock = clock(root, -3.2, -4.25, PI / 6 * 0 + .15);
  // lights
  lantern(root, S, -3.7, 2.6, -2.5, 2, 10); lantern(root, S, -3.7, 2.6, 2.4, 2, 10); lantern(root, S, 3.7, 2.6, -3.5, 1.5, 10);
  // sofa corner
  const sf = grp(root, 2.6, 0, 2.7); box(sf, 2.0, .45, .8, M(0x5a2a22), 0, .3, 0); box(sf, 2.0, .6, .2, M(0x5a2a22), 0, .75, -.35);
  // plant roots creeping through window (banyan)
  for (let i = 0; i < 5; i++) { const c = cyl(root, .035 + (i % 2) * .02, 2.2, M(0x3a2a1a), 3.8, 3.4 - i * .1, -.4 + i * .35); c.rot(0, 0, .15 + i * .05); }
  S.study = ref; return ref;
};

/* ---------- HALL ---------- */
R.hall = function (S, o) {
  o = o || {}; const root = S.root; const ref = {};
  room(root, -9, 9, -7, 7, 5.4, M(0xffffff, { tex: TX.planks('#4a2c16', '#3a2212', 0), rep: [1, 1] }), M(0xffffff, { tex: TX.planks('#5a3a1e', '#4a2c14', 1), sp: .35 }), WOOD(0x1e120a));
  for (let i = -7.5; i <= 7.5; i += 3) box(root, .34, .38, 14, WOOD(0x1a0e06), i, 5.2, 0); for (let i = -5; i <= 5; i += 5) box(root, 18, .3, .3, WOOD(0x1a0e06), 0, 5.2, i);
  // front doors (z=+7), swing leaf
  const fd = grp(root, 0, 0, 6.95); fd.r[1] = PI; ref.frontG = fd;
  box(fd, .3, 4.0, .3, WOOD(0x2a1608), -1.35, 2, 0); box(fd, .3, 4.0, .3, WOOD(0x2a1608), 1.35, 2, 0); box(fd, 3, .3, .3, WOOD(0x2a1608), 0, 4, 0);
  ref.doorL = grp(fd, -1.2, 0, 0); box(ref.doorL, 1.2, 3.8, .1, M(0xffffff, { tex: TX.planks('#4a2a14', '#3a2010', 0), rep: [1, 2], sp: .1 }), .6, 1.9, 0);
  ref.doorR = grp(fd, 1.2, 0, 0); box(ref.doorR, 1.2, 3.8, .1, M(0xffffff, { tex: TX.planks('#4a2a14', '#3a2010', 0), rep: [1, 2], sp: .1 }), -.6, 1.9, 0);
  ref.winMats = []; ref.winMats.__x = 1; const wmk = () => { const m = M(0xffffff, { tex: TX.skyWindow(o.win || 'dusk'), mode: 2, nofog: true }); ref.winMats.push(m); return m; };
  ref.outside = quad(root, 2.4, 3.8, wmk(), 0, 1.9, 6.97, PI);
  // windows back wall
  [-4.5, 4.5].forEach(x => { quad(root, 2.4, 3.2, wmk(), x, 2.7, -6.93, 0); box(root, 2.7, .2, .2, WOOD(0x1e1208), x, 4.4, -6.9); box(root, 2.7, .2, .2, WOOD(0x1e1208), x, 1.05, -6.9); box(root, .15, 3.4, .2, WOOD(0x1e1208), x - 1.3, 2.7, -6.9); box(root, .15, 3.4, .2, WOOD(0x1e1208), x + 1.3, 2.7, -6.9); box(root, .08, 3.2, .1, 0x120a05, x, 2.7, -6.88); box(root, 2.4, .08, .1, 0x120a05, x, 2.7, -6.88); box(root, .5, 3.6, .15, M(0x5a1a22), x - 1.6, 2.6, -6.8); box(root, .5, 3.6, .15, M(0x5a1a22), x + 1.6, 2.6, -6.8); });
  ref.winQs = [];
  // stairs on right wall: from (x 6.2..8.6, z=+3) rising toward -z to y=2.9 at z=-3.6
  const st = grp(root, 0, 0, 0); ref.stairs = st; const N = 15; const sw = WOOD(0x3a2010, .2);
  for (let i = 0; i < N; i++) { const y = (i + 1) * (2.9 / N), z = 3.4 - i * 0.46; box(st, 2.6, y, .5, sw, 7.2, y / 2, z); }
  box(st, 3.0, .2, 3.4, sw, 7.5, 2.8, -5.3); box(st, 3.4, .2, 2.0, sw, 7.3, 2.8, -6.0);
  // balustrade along landing and stairs inner edge x=5.85
  for (let i = 0; i < N; i += 2) { const y = (i + 1) * (2.9 / N), z = 3.4 - i * 0.46; box(st, .08, .95, .08, WOOD(0x2a1608), 5.9, y + .5, z); }
  const rl = box(st, .1, .1, 7.5, WOOD(0x2a1608), 5.9, 2.0, -.2); rl.rot(Math.atan2(2.9, 6.9), 0, 0); rl.p[1] = 1.9 + 1.45 - .0; rl.p[2] = -.25; rl.s[2] = 7.6;
  for (let i = 0; i < 8; i++) box(st, .08, .95, .08, WOOD(0x2a1608), 5.9, 3.4, -3.8 - i * .45); box(st, .1, .1, 3.6, WOOD(0x2a1608), 5.9, 3.8, -5.4);
  ref.stairTop = [7.3, 2.9, -5.2]; ref.stairBot = [7.2, 0, 4.2];
  // grandfather clock beside stairs bottom? on back wall left of stairs
  ref.clock = clock(root, 3.0, -6.55, 0); ref.clock.node.scl(1.25, 1.25, 1.25);
  // piano (left back)
  const pn = grp(root, -6.2, 0, -4.6); pn.r[1] = .5; ref.piano = pn; const pw = M(0x0c0a0a, { sp: .9 });
  box(pn, 2.6, .25, 1.6, pw, 0, .85, 0); box(pn, 2.6, .12, .5, M(0xf2eee0), 0, .95, .85); for (let i = 0; i < 14; i++) box(pn, .035, .05, .3, 0x0a0a0a, -1.2 + i * .18, 1.0, .85); [[-1.1, -.6], [1.1, -.6], [0, .7]].forEach(([x, z]) => box(pn, .12, .85, .12, pw, x, .43, z));
  const lid = box(pn, 2.6, .05, 1.4, pw, 0, 1.4, -.2); lid.rot(.5, 0, 0); box(pn, .5, .06, .3, M(0x2a1a10), 0, .6, 1.5); ref.pianoKeys = [];
  // lounge: sofas and table
  const lz = 2.6;
  const soft = M(0x6a2a24, { sp: .05 });
  [[-6.4, lz, 0], [-3.2, lz, PI], [-4.8, lz + 2.0, PI / 2]].forEach(([x, z, ry], i) => { const g = grp(root, x, 0, z); g.r[1] = i === 0 ? PI / 2 : i === 1 ? -PI / 2 : PI; if (i === 2) { g.p[0] = -4.8; g.p[2] = lz - 2.0; g.r[1] = 0; } box(g, 2.2, .45, .9, soft, 0, .3, 0); box(g, 2.2, .7, .22, soft, 0, .78, -.4); box(g, .22, .6, .9, soft, -1.05, .55, 0); box(g, .22, .6, .9, soft, 1.05, .55, 0); box(g, .8, .22, .6, M(0xb08a3a), .5, .6, 0.08); });
  box(root, 1.8, .06, .9, WOOD(0x2e190c, .3), -4.8, .5, lz); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => box(root, .08, .5, .08, WOOD(0x2e190c), -4.8 + a * .8, .25, lz + b * .38));
  const tm = M(0xffffff, { tex: TX.noise('#d8c8a0', '60,40,20', 100), sp: .4 }); [[-5.3, lz - .1], [-4.5, lz + .15], [-4.2, lz - .2]].forEach(([x, z]) => { cyl(root, .04, .1, tm, x, .58, z); });
  box(root, .5, .14, .35, M(0xd8b040), -4.9, .6, lz + .2); const vase = cyl(root, .12, .35, M(0x3a6a8a, { sp: .5 }), 0.8, 1.02, 5.2); for (let i = 0; i < 9; i++) sph(root, .1, .08, .1, M(i % 2 ? 0xf0f0f0 : 0xf4b0c8, { e: [.05, .05, .05] }), .8 + Math.sin(i * 2.3) * .18, 1.34 + (i % 3) * .08, 5.2 + Math.cos(i * 1.7) * .18);
  box(root, .9, .08, .9, WOOD(0x2e190c), .8, .8, 5.2); box(root, .1, .8, .1, WOOD(0x2e190c), .8, .4, 5.2);
  // photo wall (left wall x=-9)
  ref.photos = [2003, 2008, 2018].map((y, i) => { const z = 0.4 - i * 1.7 + 1.0; const zz = 1.6 - i * 2.0; const fr = grp(root, -8.88, 2.2, zz); box(fr, .1, 1.3, 1.6, WOOD(0x7a5a1e, .6), 0, 0, 0); const q = quad(fr, 1.4, 1.1, M(0xffffff, { tex: TX.sepiaGroup(y, y > 2000), mode: 0 }), .06, 0, 0); q.rot(0, PI / 2, 0); q.p[0] = .06; const pl = quad(fr, .6, .15, M(0xffffff, { tex: TX.plaque(String(y)), sp: .6 }), .06, -.82, 0); pl.rot(0, PI / 2, 0); return { fr, q }; });
  ref.bureau = grp(root, -8.4, 0, -2.2); box(ref.bureau, .9, .85, 1.6, WOOD(0x2e190c, .2), 0, .42, 0); ref.drawer = box(ref.bureau, .06, .22, 1.2, WOOD(0x3a2010), .45, .62, 0); box(ref.bureau, .96, .06, 1.7, WOOD(0x3a2010, .3), 0, .87, 0);
  ref.book = grp(root, -8.4, .9, -2.2); box(ref.book, .22, .04, .3, WOOD(0x6a3a1e, .3), 0, 0, 0); ref.book.vis = false;
  ref.bookOpen = quad(root, .5, .25, M(0xffffff, { tex: TX.bookOpen() }), -8.1, 1.0, -2.2); ref.bookOpen.rot(-PI / 2, 0, 0); ref.bookOpen.vis = false;
  // east wing sign door (left of stairs? on back wall center)
  const ew = grp(root, -1.3, 0, -6.9); box(ew, 1.4, 2.7, .12, WOOD(0x2a1608), 0, 1.35, 0); box(ew, 1.8, .15, .2, WOOD(0x1e1208), 0, 2.75, 0); quad(ew, .9, .24, M(0xffffff, { tex: TX.plaque('EAST WING') }), 0, 2.2, .08); box(ew, .22, .18, .06, M(0x9a9a9a, { sp: .9 }), .4, 1.0, .1); ref.eastDoor = ew;
  // plants & lanterns
  [[-8.3, 5.9], [8.0, 6.2], [-8.3, -6.2]].forEach(([x, z]) => { cyl(root, .3, .5, M(0x6a3a22), x, .25, z); for (let i = 0; i < 6; i++) sph(root, .22, .3, .22, M(0x2f6a2a), x + Math.sin(i * 1.7) * .22, .85 + i * .08, z + Math.cos(i * 1.7) * .22); });
  [[-8.6, 3.5, 4.5], [-8.6, 3.5, -4], [8.6, 3.5, 5], [0, 4.0, 0], [-4.8, 3.2, 2.6], [4, 3.4, -5.8], [-1.5, 3.4, 5.6]].forEach(([x, y, z], i) => lantern(root, S, x, y, z, i === 3 ? 3.4 : 2.2, 12));
  lamp(root, S, -8.45, .87, -2.2, 1.6, 6); lamp(root, S, .8, .8, 5.2, 1.2, 6);
  S.hall = ref; return ref;
};

/* ---------- CORRIDOR (upstairs) ---------- */
R.corridor = function (S, ox) {
  ox = ox || 0; const root = grp(S.root, ox, 0, 0); const ref = {};
  room(root, -1.3, 1.3, -14, 1, 3.4, M(0xffffff, { tex: TX.planks('#3a2212', '#2e1a0e', 0), rep: [1, 1] }), M(0xffffff, { tex: TX.planks('#4a2c16', '#3a2210', 1), sp: .3 }), WOOD(0x1e120a));
  floor(root, 1.4, 14.5, M(0xffffff, { tex: TX.leafRed(), rep: [1, 8] }), 0, .012, -6.5);
  for (let i = 0; i < 4; i++) { const z = -2 - i * 3; box(root, 2.6, .25, .25, WOOD(0x1a0e06), 0, 3.3, z); const side = i % 2 ? 1 : -1; const dg = grp(root, side * 1.27, 0, z - 1.4); dg.r[1] = -side * PI / 2; box(dg, 1.1, 2.5, .08, WOOD(0x2a1608), 0, 1.25, 0); box(dg, .15, .12, .06, M(0xc8a040, { sp: .9 }), .4, 1.1, .06); if (i === 1) quad(dg, .6, .2, M(0xffffff, { tex: TX.plaque('2nd FLOOR') }), 0, 2.0, .06); }
  [-2, -6.5, -11].forEach((z, i) => { const side = i % 2 ? -1 : 1; const q = quad(root, .55, .7, M(0xffffff, { tex: TX.sepiaGroup(2003 + i * 5, false), mode: 0 }), side * 1.28, 1.8, z, -side * PI / 2); box(root, .06, .8, .65, WOOD(0x6a4a1a, .5), side * 1.3, 1.8, z); });
  lantern(root, S, 0, 3.0, -3, 1.2, 8, L(0xff9a40)).p[0] = ox; lantern(root, S, 0, 3.0, -9, .9, 8, L(0xff9a40)).p[0] = ox;
  // end door (the study door) glowing slit
  const ed = grp(root, 0, 0, -13.9); box(ed, 1.5, 2.7, .12, M(0xffffff, { tex: TX.door(), emTex: true, e: [.0, .0, .0] }), 0, 1.35, 0);
  ref.endDoor = ed; ref.slit = quad(root, .12, 2.6, M(0xffffff, { c: gold, mode: 2, a: 1, add: true, nofog: true }), 0, 1.3, -13.78); ref.slit.m.a = .0;
  ref.slitLight = { p: [ox, 1.3, -13.2], c: gold, i: 0, r: 10, k: 1 }; S.lights.push(ref.slitLight);
  ref.stairsTop = quad(root, 2, 3, M(0xffffff, { c: [0, 0, 0], mode: 2 }), 0, 1.5, .99); ref.stairsTop.rot(0, PI, 0); ref.stairsTop.vis = false;
  S.corr = ref; return ref;
};

/* ---------- BEDROOM ---------- */
R.bedroom = function (S, ox) {
  const root = S.root; const g = grp(root, ox, 0, 0); const ref = { g };
  const rm = grp(g, 0, 0, 0); room(rm, -4, 4, -4, 4, 3.6, M(0xffffff, { tex: TX.wall('#7a5a3a'), rep: [1, 1] }), M(0xffffff, { tex: TX.planks('#5a3a1e', '#4a2c14', 1), sp: .3 }), WOOD(0x2a1a0e));
  box(g, 2.4, .5, 3.0, WOOD(0x3a2010), 0, .3, -2.2); box(g, 2.2, .3, 2.8, M(0xe8dcc0), 0, .62, -2.2); [[-.6, -3.2], [.6, -3.2]].forEach(([x, z]) => box(g, .7, .2, .4, M(0xa02a2a), x, .85, z)); [[-.7, -2.4], [.3, -2.0]].forEach(([x, z]) => box(g, .6, .12, .4, M(0x8a2a2a), x, .75, z));
  box(g, 2.6, 2.2, .1, WOOD(0x2a1608), 0, 1.3, -3.9);
  [-1, 1].forEach(s => { const c = box(g, .9, 3.2, .1, M(0xe8e0d0), s * 2.0, 1.8, -3.8); const q = quad(g, 1.6, 2.0, M(0xffffff, { tex: TX.skyWindow('dusk'), mode: 2, nofog: true }), s * 0, 1.9, -3.95); });
  quad(g, 1.8, 2.2, M(0xffffff, { tex: TX.skyWindow('dusk'), mode: 2, nofog: true }), 0, 1.9, -3.93);
  box(g, .1, 3.0, .12, M(0xe8e0d0), -1.1, 1.8, -3.82); box(g, .1, 3.0, .12, M(0xe8e0d0), 1.1, 1.8, -3.82);
  lantern(g, S, -2.5, 2.3, -3.2, 1.7, 9).p[0] += ox; lantern(g, S, 2.5, 2.3, -3.2, 1.7, 9).p[0] += ox; lantern(g, S, 0, 3.0, 0, 1.8, 11).p[0] += ox;
  box(g, .6, .5, .5, WOOD(0x3a2010), 2.4, .25, -3.0); box(g, 1.4, 1.2, .5, WOOD(0x2e190c), -3.2, .6, -.5);
  ref.bed = [0, .62, -2.2]; return ref;
};

/* ---------- FORT KOCHI ---------- */
function net(p, x, z, ry, sc) {
  const g = grp(p, x, 0, z); g.r[1] = ry; g.scl(sc, sc, sc); const wd = WOOD(0x6a4a2a, .05), bam = M(0x8a6a3a);
  box(g, 5, .25, 10, wd, 0, 1.0, 0); for (let i = 0; i < 8; i++) cyl(g, .12, 2, wd, -2.2 + (i % 2) * 4.4, .0, -4 + Math.floor(i / 2) * 2.5);
  const a = cyl(g, .1, 3.2, wd, -.6, 2.7, 1.6); a.rot(0, 0, 0); const b = cyl(g, .1, 3.2, wd, .6, 2.7, 1.6);
  const beam = cyl(g, .1, 11, bam, 0, 4.5, -2.5); beam.rot(Math.PI / 2 - .22, 0, 0); beam.p[1] = 4.5; beam.p[2] = -2.2;
  const tipY = 4.5 + Math.sin(.22) * 5.5 * -1 + 0, tipZ = -2.2 - Math.cos(.22) * 5.5;
  const ty = 4.5 - Math.sin(.22) * 5.5 * -1; // not used further
  [[-2.4, 2.4], [2.4, 2.4], [-2.4, -2.4], [2.4, -2.4]].forEach(([dx, dz]) => { const len = Math.hypot(dx, 3.2, dz); const pole = cyl(g, .05, len, bam, dx / 2, 4.5 - 1.6 + 0.0, tipZ + dz / 2 - 0.0); pole.p[1] = 4.7 - 1.6; const ax = Math.atan2(Math.hypot(dx, dz), 3.2); pole.rot(Math.atan2(dz, 3.2) , 0, -Math.atan2(dx, 3.2)); });
  const nt = frus(g, 3.0, 1.2, 1.1, M(0xffffff, { tex: TX.net(), two: true, a: .85, rep: [3, 2] }), 0, 1.7, tipZ); nt.r[1] = PI / 4;
  return g;
}
R.kochi = function (S) {
  const root = S.root, ref = {};
  floor(root, 120, 40, M(0xffffff, { tex: TX.noise('#b9a88a', '60,50,30', 300), rep: [30, 10], sp: .02 }), 0, -.02, 4);
  const sea = floor(root, 400, 300, M(0xffffff, { tex: TX.water(), rep: [60, 40], sp: .9 }), 0, -.3, -170); sea.m = sea.m;
  floor(root, 120, 32, M(0xffffff, { tex: TX.tiles('#c8b898', '#b8a888'), rep: [24, 6] }), 0, .0, 8);
  box(root, 120, .9, 1.2, M(0x9a8a70), 0, .2, -16.5); // sea wall
  net(root, -14, -26, .15, 1.6); net(root, 17, -30, -.1, 1.9); net(root, 2, -42, 0, 1.5);
  // heritage building left
  const bd = grp(root, -13, 0, -2); box(bd, 8, 5, 7, M(0xffffff, { tex: TX.wall('#e8dcc0') }), 0, 2.5, 0); box(bd, 8.6, .4, 7.6, M(0x7a3a22), 0, 5.2, 0); const rf = box(bd, 9, .3, 4.2, M(0x9a4a2a), 0, 6.3, -1.8); rf.rot(.45, 0, 0); const rf2 = box(bd, 9, .3, 4.2, M(0x9a4a2a), 0, 6.3, 1.8); rf2.rot(-.45, 0, 0);
  [-2.5, 2.5].forEach(x => { [1.2, 3.4].forEach(y => { box(bd, 1.0, 1.5, .1, M(0x4a2a14), x, y, 3.55); box(bd, .8, 1.3, .12, M(0x20303a), x, y, 3.56); }); });
  for (let i = 0; i < 14; i++) sph(bd, .5 + (i % 3) * .1, .4, .5, M(i % 2 ? 0xd02a7a : 0xe040a0), -3 + i * .45, 3.9 + Math.sin(i) * .4, 4.0 + (i % 3) * .1);
  // other buildings in distance behind camera
  [[8, -4, 6, 6, 0xd8c070], [-26, 2, 8, 6, 0xc86a5a], [24, -2, 9, 5, 0xe8e0d0]].forEach(([x, z, w, h, c], i) => { const b = grp(root, x, 0, z); box(b, w, h, 6, M(c), 0, h / 2, 0); box(b, w + .8, .3, 6.8, M(0x7a3a22), 0, h + .15, 0); });
  // rain tree right
  const tr = grp(root, 6.5, 0, -5.2); cyl(tr, .6, 4.5, WOOD(0x3a2a1a), 0, 2.2, 0).s[0] = .9; for (let i = 0; i < 5; i++) { const b = cyl(tr, .22, 3.5, WOOD(0x3a2a1a), 0, 4.4, 0); b.rot(0, i * 1.25, 1.0); b.p[0] = Math.sin(i * 1.25) * 1.2; b.p[2] = Math.cos(i * 1.25) * 1.2; b.p[1] = 5; }
  const lf = M(0xffffff, { tex: TX.leaf(), c: L(0x3a7a2a), sp: .05 });
  for (let i = 0; i < 18; i++) { const a = i * 1.9; sph(tr, 2.2 + (i % 3) * .5, 1.2 + (i % 2) * .3, 2.2 + (i % 3) * .5, lf, Math.sin(a) * (i % 5 + 1) * 1.1, 6.2 + (i % 4) * .4, Math.cos(a) * (i % 5 + 1) * 1.1); }
  // palms + people silhouettes
  const r_ = rng(3); for (let i = 0; i < 6; i++) { const x = -34 + i * 12 + r_() * 4, z = -8 + r_() * 4; cyl(root, .18, 7, WOOD(0x5a4a30), x, 3.5, z).rot(.05, 0, .08); for (let j = 0; j < 6; j++) { const l = box(root, 3, .05, .5, M(0x2f7a30), x + Math.sin(j) * 1.4, 7, z + Math.cos(j) * 1.4); l.rot(0, j * 1.05, -.4); l.p[0] = x + Math.cos(j * 1.05) * 1.3; l.p[2] = z - Math.sin(j * 1.05) * 1.3; } }
  const ppl = [[-3, -9], [-6, -12], [4, -11], [9, -9], [-1, -13.5]]; ppl.forEach(([x, z], i) => { const c = [0xb04a4a, 0x3a5a8a, 0xd8d0b0, 0x4a7a4a, 0x8a5aa0][i]; box(root, .4, .7, .26, M(c), x, 1.1, z); sph(root, .13, .15, .13, M(0xa87850), x, 1.62, z); box(root, .3, .75, .24, M(0x2a2a30), x, .38, z); });
  // table & chairs
  const tb = grp(root, 0, 0, 0); ref.table = tb; const tw = WOOD(0x6a4420, .15); box(tb, 2.1, .07, 1.0, tw, 0, .78, 0); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => box(tb, .08, .78, .08, tw, a * .95, .39, b * .42));
  [[-.7, -.85, 0], [.7, -.85, 0], [-1.45, 0, PI / 2]].forEach(([x, z, ry]) => { const c = grp(root, x, 0, z); c.r[1] = ry; box(c, .5, .06, .5, tw, 0, .45, 0); box(c, .5, .55, .05, tw, 0, .75, -.22 - (0)); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => box(c, .05, .45, .05, tw, a * .22, .22, b * .22)); });
  const glM = M(0xffffff, { c: L(0xe8b04a), a: .88, e: L(0xe8903a).map(v => v * .5), sp: .8 });
  [[-.8, -.2], [-.2, .25], [.5, -.25], [.9, .2]].forEach(([x, z]) => cyl(root, .04, .1, glM, x, .87, z)); cyl(root, .12, .3, M(0xc8c8c8, { sp: .9 }), .2, .96, -.05); cyl(root, .15, .02, M(0xe8d8c0), -.4, .83, .1); for (let i = 0; i < 6; i++) sph(root, .04, .015, .04, M(0xe0b84a), -.5 + (i % 3) * .08, .85, .08 + Math.floor(i / 3) * .08);
  ref.phone = new Node(E.G_BOX(), null); ref.phone = grp(root, 0, 0, 0); ref.phoneBody = box(ref.phone, .075, .155, .008, M(0x0c0c10, { sp: .9 }), 0, 0, 0); ref.phoneScr = quad(ref.phone, .068, .146, M(0xffffff, { tex: TX.phone(), mode: 2, nofog: true, c: [1, 1, 1] }), 0, 0, .0048); ref.phone.vis = false;
  ref.phone.scl(2.0, 2.0, 2.0); ref.phoneMats = { listing: TX.phone(), booked: TX.booked() };
  ref.sign = null;
  S.kochi = ref; return ref;
};

/* ---------- ROAD + JEEP ---------- */
const roadX = z => 16 * Math.sin(z / 50) + 7 * Math.sin(z / 19 + 1), roadY = z => 3 * Math.sin(z / 70) + z * .02;
R.roadAt = z => ({ x: roadX(z), y: roadY(z) });
R.road = function (S) {
  const root = S.root, ref = {};
  const gm = M(0xffffff, { tex: TX.tea(), rep: [60, 60], sp: 0 }); floor(root, 600, 700, gm, 0, -1.6, 280);
  const rm = M(0xffffff, { tex: TX.road(), rep: [1, 1.2] });
  for (let z = -20; z < 420; z += 4) { const x0 = roadX(z), x1 = roadX(z + 4), y0 = roadY(z), y1 = roadY(z + 4); const seg = box(root, 5.6, .12, 4.6, rm, (x0 + x1) / 2, (y0 + y1) / 2 - .06, z + 2); seg.rot(-Math.atan2(y1 - y0, 4), Math.atan2(x1 - x0, 4), 0); }
  const r_ = rng(77); const hm = M(0xffffff, { tex: TX.tea(), rep: [3, 3], sp: 0 }), hm2 = M(0xffffff, { tex: TX.tea(), c: L(0xa8d090), rep: [2, 2] });
  for (let i = 0; i < 90; i++) { const z = -20 + r_() * 440, s = r_() < .5 ? -1 : 1, r = 10 + r_() * 30, off = r * .9 + 9 + r_() * 55, x = roadX(z) + s * off; const h = sph(root, r, r * (.28 + r_() * .22), r, i % 2 ? hm : hm2, x, roadY(z) - r * .1 - 2, z); }
  for (let i = 0; i < 18; i++) { const z = 40 + i * 28, s = i % 2 ? 1 : -1; const r = 60 + r_() * 70; const x = roadX(z) + s * (r + 240 + r_() * 120); sph(root, r, r * .8, r, M(0xffffff, { tex: TX.leaf(), c: L(0x6a8a9a), rep: [2, 2] }), x, -30 + r * .3, z + 60); }
  for (let i = 0; i < 110; i++) { const z = -10 + r_() * 420, s = r_() < .5 ? -1 : 1, x = roadX(z) + s * (4.5 + r_() * 22); const y = roadY(z) - .1; cyl(root, .18, 2.6 + r_() * 2, WOOD(0x4a3a2a), x, y + 1.5, z); sph(root, .9 + r_() * .6, .6, .9 + r_() * .6, M(0xffffff, { tex: TX.leaf(), c: L(0x2f6a2a) }), x, y + 3.4 + r_() * .8, z); }
  // mist layers
  ref.mist = []; for (let i = 0; i < 6; i++) { const q = new Node(G_QUAD(), M(0xffffff, { c: [1, .9, .8], mode: 2, tex: TX.glow(), a: .22, nofog: true })).pos(0, -4 + i * 1.1, 60 + i * 55).scl(500, 40, 1); root.add(q); ref.mist.push(q); q.depthOff = 60 - i * 3; }
  // jeep
  const j = grp(root, 0, 0, 0); ref.jeep = j; const gr = M(0x4f6a3a, { sp: .5 });
  box(j, 1.85, .7, 3.6, gr, 0, .85, 0); box(j, 1.7, .5, 1.3, gr, 0, 1.0, 2.1).rot(.0, 0, 0); box(j, 1.9, .12, 3.7, M(0x2a2a2a), 0, .52, 0); box(j, 1.88, .5, .2, gr, 0, 1.0, -1.8);
  [-1, 1].forEach(s => { box(j, .1, .55, 3.4, gr, s * .94, 1.45, -.1); box(j, .06, .5, 1.0, M(0xffffff, { c: [.1, .12, .14], a: .5 }), s * .9, 1.45, 1.0); });
  const ws = box(j, 1.7, .6, .07, M(0xffffff, { c: [.35, .4, .45], a: .35, sp: 1 }), 0, 1.55, 1.4); ws.rot(-.2, 0, 0);
  box(j, 1.55, .08, .08, M(0x1a1a1a), 0, 2.0, 1.2); [-1, 1].forEach(s => { cyl(j, .04, 1.0, M(0x1a1a1a), s * .8, 1.6, -1.5); }); box(j, 1.7, .08, .08, M(0x1a1a1a), 0, 2.1, -1.5);
  [-1, 1].forEach(s => { sph(j, .16, .16, .1, M(0xfff0c0, { e: [3, 2.6, 1.8] }), s * .62, 1.05, 2.72); const f = grp(j, 0, 0, 0); });
  box(j, 1.1, .3, .06, M(0x1a1a1a), 0, .95, 2.78); for (let i = 0; i < 6; i++) box(j, .05, .26, .04, M(0x777777, { sp: .8 }), -.4 + i * .16, .95, 2.81);
  box(j, 1.5, .45, .9, M(0x6a4a2a), 0, 2.45, -1.0); box(j, 1.5, .08, .06, M(0x1a1a1a), 0, 2.2, -.8);
  ref.wheels = [[-1, 1.35], [1, 1.35], [-1, -1.2], [1, -1.2]].map(([s, z]) => { const w = grp(j, s * .95, .42, z); const t = cyl(w, .42, .32, M(0x151515, { sp: .05 }), 0, 0, 0); t.rot(0, 0, PI / 2); const h = cyl(w, .22, .34, M(0x9a9a9a, { sp: .8 }), 0, 0, 0); h.rot(0, 0, PI / 2); return w; });
  [[-.45, .55], [.45, .55], [-.45, -.6], [.45, -.6]].forEach(([x, z]) => box(j, .5, .12, .55, M(0x3a2a1a), x, .98, z));
  box(j, 1.7, .5, .06, M(0x3a2a1a), 0, 1.3, -.95); box(j, 1.7, .2, .5, M(0x3a2a1a), 0, 1.0, -.7);
  ref.signs = [260].map(z => { const g = grp(root, roadX(z) + 4.2, roadY(z), z); cyl(g, .05, 2.4, 0x333333, 0, 1.2, 0); const q = quad(g, 1.8, .9, M(0xffffff, { tex: TX.sign('Wayanad\n24 km  ↑', '#1f7a3c', '#ffffff'), mode: 0 }), 0, 2.5, .0); q.rot(0, -PI / 2 - .3, 0); q.two = true; q.m.two = true; return g; });
  S.roadRef = ref; return ref;
};

/* ---------- BUNGALOW EXTERIOR ---------- */
R.exterior = function (S) {
  const root = S.root, ref = {};
  floor(root, 200, 200, M(0xffffff, { tex: TX.noise('#2f4a22', '10,30,10', 400), rep: [30, 30] }), 0, 0, 0);
  const path = floor(root, 3.4, 40, M(0xffffff, { tex: TX.noise('#8a7a60', '40,30,20', 300), rep: [2, 14] }), 0, .02, 24);
  const wm = M(0xffffff, { tex: TX.planks('#3a2414', '#2e1a0e', 0), rep: [4, 2], sp: .08 }); const wm2 = M(0xffffff, { tex: TX.planks('#3a2414', '#2e1a0e', 0), rep: [2, 2] });
  const bg = grp(root, 0, 0, -6); ref.house = bg;
  box(bg, 15, .6, 8, M(0x4a4038), 0, .3, 0);
  box(bg, 14, 3.3, 7.4, wm, 0, 2.25, -.2); box(bg, 15, 2.6, 7.6, wm, 0, 5.2, -.2).s[1] = 2.7;
  box(bg, 15.5, .18, 8.4, WOOD(0x1a0e06), 0, 3.9, 0);
  const rf = box(bg, 16.5, .3, 6.2, M(0x4a2a1a), 0, 7.9, 2.2); rf.rot(-.62, 0, 0); rf.p[1] = 7.4; const rf2 = box(bg, 16.5, .3, 6.2, M(0x4a2a1a), 0, 7.9, -2.6); rf2.rot(.62, 0, 0); rf2.p[1] = 7.4;
  box(bg, 16.8, .35, .4, WOOD(0x1a0e06), 0, 9.0, -.2);
  // veranda
  box(bg, 14, .2, 3, WOOD(0x2a1a0e), 0, .7, 5.4); [-6.5, -4.3, -2.1, 0, 2.1, 4.3, 6.5].forEach(x => { cyl(bg, .15, 3.3, WOOD(0x2a1608), x, 2.3, 6.8); });
  box(bg, 14.5, .3, .4, WOOD(0x1a0e06), 0, 4.0, 6.8); const vr = box(bg, 15.4, .2, 3.6, M(0x4a2a1a), 0, 4.55, 5.5); vr.rot(.18, 0, 0);
  for (let i = 0; i < 8; i++) { box(bg, .06, .8, .06, WOOD(0x2a1608), -6.5 + i * 1.85, 1.3, 6.8); } box(bg, 14, .08, .08, WOOD(0x2a1608), 0, 1.7, 6.8);
  // steps
  for (let i = 0; i < 3; i++) box(bg, 3.2, .22, .6, M(0x5a5048), 0, .1 + i * .2 - .0, 7.4 + (2 - i) * .55).p[1] = .12 + i * .2;
  // door & windows lit
  box(bg, 1.8, 2.7, .15, M(0x1c1008), 0, 2.0, 3.5); const wl = M(0xffe0a8, { e: L(0xffa848).map(v => v * 1.1), sp: 0 });
  [-5.4, -3.3, 3.3, 5.4].forEach(x => { box(bg, 1.2, 1.5, .1, wl, x, 2.2, 3.5); box(bg, .08, 1.5, .12, 0x120a05, x, 2.2, 3.52); box(bg, 1.2, .08, .12, 0x120a05, x, 2.2, 3.52); });
  [-5.4, -2.2, 2.2, 5.4].forEach(x => { box(bg, 1.2, 1.5, .1, M(0x0c0f12, { sp: .6 }), x, 5.6, 3.5); box(bg, .08, 1.5, .12, 0x120a05, x, 5.6, 3.52); });
  // balcony upper
  box(bg, 14, .15, 1.8, WOOD(0x2a1a0e), 0, 4.1, 4.5); for (let i = 0; i < 18; i++) box(bg, .05, .9, .05, WOOD(0x2a1608), -6.6 + i * .78, 4.65, 5.3); box(bg, 14, .08, .1, WOOD(0x2a1608), 0, 5.1, 5.3);
  // the watcher window (upper centre)
  ref.watchWin = box(bg, 1.3, 1.7, .1, M(0x0a0c10, { sp: .8 }), 0, 5.7, 3.52); ref.watcher = grp(bg, 0, 4.9, 3.5); const wm_ = M(0x020203, { c: [.0, .0, .0], mode: 2, nofog: true }); sph(ref.watcher, .17, .2, .14, wm_, 0, 1.3, 0); box(ref.watcher, .55, 1.1, .2, wm_, 0, .55, 0); ref.watcher.vis = false;
  // ivy and moss
  const vm = M(0xffffff, { tex: TX.leaf(), c: L(0x2f5a22), sp: .02 }); const r_ = rng(5);
  for (let i = 0; i < 70; i++) { const x = (r_() - .5) * 15, y = 1 + r_() * 7, s = .4 + r_() * .9; sph(bg, s, s * .8, s * .5, vm, x, y, 3.7 + (y > 4.5 ? 2.2 : 0) * 0 + r_() * .4); }
  for (let i = 0; i < 28; i++) { const x = (r_() - .5) * 14; cyl(bg, .03, 2 + r_() * 3, M(0x2a4a1e), x, 4 - r_() * 2, 3.7 + (r_() < .5 ? 3 : 0)); }
  // banyan behind
  const by = grp(root, 6, 0, -22); ref.banyan = by; const bk = WOOD(0x3a2c1e, .02);
  cyl(by, 2.4, 14, bk, 0, 7, 0); for (let i = 0; i < 9; i++) { const a = i * .7, c = cyl(by, .8, 12, bk, Math.sin(a) * 2.5, 6, Math.cos(a) * 2.5); c.rot(0, 0, 0); c.s[0] = 1.0 + (i % 3) * .3; }
  const bl = M(0xffffff, { tex: TX.leaf(), c: L(0x2a5a22), sp: .03 }), bl2 = M(0xffffff, { tex: TX.leaf(), c: L(0x3a7a2a), sp: .03 });
  for (let i = 0; i < 34; i++) { const a = i * 2.1, rr = 4 + (i % 7) * 3.4, hh = 13 + (i % 5) * 1.6; sph(by, 7 + (i % 3) * 2, 3.2, 7 + (i % 3) * 2, i % 2 ? bl : bl2, Math.sin(a) * rr, hh, Math.cos(a) * rr * .7); }
  for (let i = 0; i < 36; i++) { const a = i * 1.7, rr = 3 + (i % 8) * 2.6, len = 5 + (i % 5) * 2.2; cyl(by, .07 + (i % 3) * .03, len, WOOD(0x4a3a2a, .02), Math.sin(a) * rr, 13.5 - len / 2, Math.cos(a) * rr * .7); }
  // trees around
  for (let i = 0; i < 60; i++) { const a = r_() * 6.28, d = 14 + r_() * 70, x = Math.sin(a) * d * 1.3, z = -4 - Math.abs(Math.cos(a)) * d * .9 + (r_() < .3 ? d * .7 : 0); if (Math.abs(x) < 9 && z > -10 && z < 20) continue; cyl(root, .3 + r_() * .2, 7 + r_() * 5, WOOD(0x3a2c20), x, 4, z); sph(root, 2.8 + r_() * 1.5, 2.4, 2.8 + r_() * 1.5, r_() < .5 ? bl : bl2, x, 9 + r_() * 3, z); }
  // pond
  const pd = grp(root, -7, 0, 6); ref.pond = pd; cyl(pd, 3.4, .12, M(0x3a3a30, { tex: null }), 0, .01, 0); cyl(pd, 3.1, .08, M(0x1f4a30, { sp: .95 }), 0, .07, 0);
  for (let i = 0; i < 14; i++) { const a = i * 2.4, d = .5 + (i % 5) * .5; cyl(pd, .22 + (i % 3) * .06, .02, M(0x2f7a2a), Math.sin(a) * d, .13, Math.cos(a) * d); } for (let i = 0; i < 3; i++) { cyl(pd, .08, .02, M(0xf0a8c8, { e: [.1, .02, .05] }), -1 + i * .8, .15, .5 - i * .3); }
  for (let i = 0; i < 26; i++) { const a = i * .25; sph(pd, .3 + (i % 3) * .1, .22, .3, M(0x4a4a3e), Math.sin(a) * 3.5, .12, Math.cos(a) * 3.5); }
  ref.frog = grp(pd, .8, .17, -.6); sph(ref.frog, .1, .07, .12, M(0x4a9a2a, { sp: .5 }), 0, 0, 0); sph(ref.frog, .03, .03, .03, M(0xffd050), -.05, .07, .06); sph(ref.frog, .03, .03, .03, M(0xffd050), .05, .07, .06);
  box(root, 2.2, 1.2, .1, M(0xffffff, { tex: TX.sign('The Whispering\nBanyan', '#2a1a0e', '#d8b060') }), 3.6, 1.1, 12).rot(0, -.2, 0);
  // gate posts and fog sprites
  ref.dust = []; for (let i = 0; i < 26; i++) { const g = glow(root, .3 + r_() * .3, [1, .85, .5], .22, (r_() - .5) * 16, 1 + r_() * 5, 2 + r_() * 14); g.bp = [g.p[0], g.p[1], g.p[2]]; g.ph = r_() * 6; ref.dust.push(g); }
  S.ext = ref; return ref;
};
G.R = R;
})(window);
