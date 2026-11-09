/* The four friends: procedural, poseable characters. */
(function (G) {
'use strict';
const { Node, M, L, rng, PI, clamp, lerp } = E; const { box, cyl, sph, tor, grp, blob, TX } = W;
const SPEC = {
  S: { name: 'Stany', col: '#f3b04a', h: 1.02, skin: 0xb58358, hair: 0x1a120d, shirt: 0xb4914f, pants: 0x3a4252, pack: 0x7a5a34, beard: 1, sun: 1, cross: 1, wave: 1 },
  R: { name: 'Renjith', col: '#ec7f94', h: 1.0, skin: 0xa57650, shirt: 'argyle', pants: 0x2a2c34, hair: 0x120d0a, beard: 1, pack: 0x35405a, curly: .5 },
  J: { name: 'Jesvin', col: '#93d27f', h: .99, skin: 0xaf7e56, shirt: 0x5a6230, pants: 0x2d3347, hair: 0x1c140f, glasses: 1, beard: .7, curly: 1, hood: 1, pack: 0x4b5a39 },
  H: { name: 'Hashir', col: '#74b8ff', h: .97, skin: 0xaa7a52, shirt: 'floral', pants: 0x8c7b5a, hair: 0x150f0b, beard: 1, curly: 1, camera: 1, pack: 0x7b5a2f }
};
const ARMS = { // [shoulderX, outward, elbowX, inwardSwing]
  down: [0, .07, -.08, 0], cross: [-.55, -.18, -2.0, -.8], hips: [.15, .62, -1.15, -.95], fist: [-.15, 2.7, -.5, 0],
  point: [-1.5, .08, -.1, 0], pointUp: [-.2, 2.5, -.15, 0], open: [-.45, 1.15, -.5, .25], wide: [0, 1.5, -.1, 0], camera: [-.95, -.1, -1.75, -.5],
  phone: [-1.05, .08, -1.15, -.1], chin: [-.9, -.12, -2.35, -.5], light: [-1.35, .05, -.35, 0], hands: [-.5, .8, -1.5, 0], grab: [-1.45, .15, -.25, 0],
  wave: [-.2, 2.1, -1.0, 0], shrug: [-.2, .55, -1.2, .2], rest: [.45, .3, -.9, 0], lap: [-.5, .08, -.9, 0], cup: [-.85, .1, -1.5, -.2], behind: [.55, .5, -.3, 0], clasp: [-.8, -.1, -1.5, -.7], hold: [-1.15, .1, -.9, -.3], high5: [-.15, 2.2, -.1, 0]
};
class Char {
  constructor(id) {
    const s = this.s = SPEC[id]; this.id = id; const r = rng(id.charCodeAt(0) * 7);
    const root = this.root = new Node(); const hips = this.hips = grp(root, 0, .92, 0); const tor_ = this.tor = grp(hips, 0, 0, 0);
    const skin = M(s.skin, { sp: .12 }), hair = M(s.hair, { sp: .25 });
    const shirt = s.shirt === 'floral' ? M(0xffffff, { tex: TX.floral(), rep: [1, 1] }) : s.shirt === 'argyle' ? M(0xffffff, { tex: TX.argyle(), rep: [1, 1] }) : M(s.shirt);
    const pants = M(s.pants), dark = M(0x0a0a0a, { sp: .5 });
    this.sk = skin;
    // legs
    this.legs = [1, -1].map(sd => {
      const th = grp(hips, sd * .1, 0, 0), kn = grp(th, 0, -.46, 0);
      box(th, .17, .48, .2, pants, 0, -.23, 0); box(kn, .15, .46, .17, pants, 0, -.22, 0); box(kn, .12, .08, .27, M(0x241a14, { sp: .2 }), 0, -.47, .05);
      return { th, kn };
    });
    // chest
    box(tor_, .44, .58, .25, shirt, 0, .31, 0); box(tor_, .46, .09, .26, pants, 0, .02, 0);
    if (s.hood) { box(tor_, .46, .12, .27, M(0x4f5629), 0, .1, 0); sph(tor_, .13, .1, .11, M(0x4f5629), 0, .62, -.1); }
    if (s.cross) { box(tor_, .012, .05, .006, M(0xe6c25a, { sp: .8 }), 0, .5, .13); box(tor_, .035, .012, .006, M(0xe6c25a, { sp: .8 }), 0, .51, .13); }
    if (s.camera) { box(tor_, .15, .1, .08, M(0x141414, { sp: .4 }), 0, .34, .17); cyl(tor_, .042, .06, M(0x2a2a33, { sp: .9 }), 0, .34, .24).rot(PI / 2, 0, 0); box(tor_, .02, .5, .015, M(0x111111), -.1, .4, .12).rot(0, 0, .12); box(tor_, .02, .5, .015, M(0x111111), .1, .4, .12).rot(0, 0, -.12); }
    this.pack = grp(tor_, 0, 0, 0); box(this.pack, .36, .46, .17, M(s.pack), 0, .3, -.21); box(this.pack, .3, .14, .19, M(s.pack), 0, .56, -.21); 
    // arms
    const sleeve = s.hood ? M(0x5a6230) : shirt;
    this.arms = [1, -1].map(sd => {
      const sh = grp(tor_, sd * .275, .54, 0), el = grp(sh, 0, -.3, 0);
      box(sh, .115, .32, .125, shirt, 0, -.15, 0); box(el, .1, .28, .105, s.hood ? sleeve : skin, 0, -.13, 0); sph(el, .052, .055, .052, skin, 0, -.3, 0);
      return { sh, el, cur: ARMS.down.slice(), sd };
    });
    // neck & head
    cyl(tor_, .042, .1, skin, 0, .64, -.02);
    const head = this.head = grp(tor_, 0, .77, 0); head.scl(1.14);
    sph(head, .122, .136, .125, skin, 0, 0, 0);
    [1, -1].forEach(sd => sph(head, .02, .03, .02, skin, sd * .122, -.005, 0));
    sph(head, .13, .115, .135, hair, 0, .045, -.025);
    if (s.curly) { for (let i = 0; i < 16; i++) { const a = r() * PI * 2, e = .1 + r() * 1.2; sph(head, .05 * s.curly + .015, .045 * s.curly + .015, .05 * s.curly + .015, hair, Math.cos(a) * Math.cos(e) * .115, .05 + Math.sin(e) * .1, Math.sin(a) * Math.cos(e) * .105 - .02); } }
    if (s.wave) { for (let i = 0; i < 6; i++) sph(head, .05, .04, .05, hair, -.07 + i * .028, .125, .02 + (i % 2) * .02); }
    if (s.beard) sph(head, .118, .088 * (s.beard > .8 ? 1 : .8), .113, M(s.hair, { sp: .05 }), 0, -.058, .014);
    this.eyes = [1, -1].map(sd => {
      const e = grp(head, sd * .046, .022, .108); sph(e, .017, .015, .01, M(0xf2efe8), 0, 0, 0); sph(e, .009, .009, .007, dark, 0, 0, .006); return e;
    });
    this.brows = [1, -1].map(sd => { const b = box(head, .05, .011, .012, hair, sd * .048, .064, .106); return b; });
    sph(head, .019, .02, .02, skin, 0, -.012, .122);
    this.mouth = [1, -1].map(sd => { const m = grp(head, sd * .016, -.066, .122); box(m, .028, .008, .008, M(0x3a0f0c), sd * .0, 0, 0); return m; });
    if (s.sun) { [1, -1].forEach(sd => box(head, .063, .04, .014, M(0x050505, { sp: .35 }), sd * .048, .022, .12)); box(head, .04, .008, .012, dark, 0, .03, .12); box(head, .26, .008, .01, dark, 0, .03, .0); }
    if (s.glasses) { [1, -1].forEach(sd => { const t = tor(head, .036, .1, M(0x0e0e10, { sp: .6 }), sd * .047, .022, .122); t.rot(PI / 2, 0, 0); }); box(head, .02, .008, .008, dark, 0, .03, .125); box(head, .27, .006, .008, dark, 0, .03, .0); }
    // contact shadow
    this.blob = blob(root, .62, 0, 0, 0, .5);
    this.root.scl(s.h);
    this.reset(); this.t0 = id.charCodeAt(0);
  }
  reset() {
    this.o = { x: this.o ? this.o.x : 0, y: this.o ? this.o.y : 0, z: this.o ? this.o.z : 0, ry: this.o ? this.o.ry : 0, A: 'down', B: 'down', sit: 0, floor: 0, lie: 0, walk: 0, wamt: 0, lean: 0, hy: null, hp: 0, hr: 0, look: null, ex: 'neutral', pack: true, bounce: 0, waveA: 0, vis: true, talkAmt: 1, legsOpen: 0 };
    return this;
  }
  at(x, z, ry, y) { const o = this.o; o.x = x; o.z = z; o.ry = ry || 0; o.y = y || 0; return this; }
  pose(a, b) { this.o.A = a; this.o.B = b || a; return this; }
  sit(h) { this.o.sit = h === undefined ? .47 : h; return this; }
  floor() { this.o.floor = 1; return this; }
  lie(h) { this.o.lie = h || .45; return this; }
  walk(ph, amt) { this.o.walk = ph; this.o.wamt = amt === undefined ? 1 : amt; return this; }
  lean(a) { this.o.lean = a; return this; }
  headTo(yaw, pitch, roll) { this.o.hy = yaw; this.o.hp = pitch || 0; this.o.hr = roll || 0; return this; }
  lookAt(x, z) { this.o.look = [x, z]; return this; }
  face(e) { this.o.ex = e; return this; }
  hide() { this.o.vis = false; return this; }
  nopack() { this.o.pack = false; return this; }
  wave(a) { this.o.waveA = a; return this; }
  apply(T, dt, talking, speakerPos) {
    const o = this.o, s = this.s; const k = 1 - Math.exp(-dt * 9);
    this.root.vis = o.vis; if (!o.vis) return;
    const ph = T * 1.6 + this.t0, breathe = Math.sin(ph) * .008;
    const root = this.root; root.p[0] = o.x; root.p[2] = o.z; root.r[1] = o.ry; root.p[1] = o.y; root.r[0] = 0;
    const sitting = o.sit > 0 || o.floor, lying = o.lie > 0;
    let hipY = .92 / 1; if (o.sit > 0) hipY = o.sit; if (o.floor) hipY = .17; if (lying) hipY = .2;
    const wk = o.walk, wa = o.wamt; const swing = Math.sin(wk * 6.5);
    this.hips.p[1] = hipY + (wa ? Math.abs(Math.cos(wk * 6.5)) * .035 * wa : 0) + (talking ? 0 : 0);
    this.tor.r[0] = o.lean + (wa ? .06 * wa : 0); this.tor.s[1] = 1 + breathe;
    this.pack.vis = o.pack;
    if (lying) { root.r[0] = -PI / 2; root.p[1] = o.y + o.lie; this.hips.p[1] = .0; this.tor.r[0] = 0; }
    // legs
    this.legs.forEach((L_, i) => {
      const sd = i ? -1 : 1; let tx = 0, tz = 0, kx = 0;
      if (o.floor) { tx = -.85; tz = sd * .95; kx = 2.3; } else if (o.sit > 0) { tx = -1.5; tz = sd * .06; kx = 1.55; } else if (lying) { tx = 0; tz = sd * .05; } else if (wa) { const sw = Math.sin(wk * 6.5 + (i ? PI : 0)); tx = sw * .65 * wa; kx = Math.max(0, -sw) * .95 * wa; }
      L_.th.r[0] += (tx - L_.th.r[0]) * k; L_.th.r[2] += (tz - L_.th.r[2]) * k; L_.kn.r[0] += (kx - L_.kn.r[0]) * k;
    });
    // arms
    this.arms.forEach((A, i) => {
      const name = i ? o.B : o.A; const t = (typeof name === 'string' ? ARMS[name] : name) || ARMS.down; let tgt = t.slice();
      if (wa && name === 'down') { tgt[0] = Math.sin(wk * 6.5 + (i ? 0 : PI)) * .55 * wa; tgt[2] = -.3; }
      if (o.waveA && !i) { tgt[3] = Math.sin(T * 9) * .5 * o.waveA; tgt[2] = -1.0 + Math.sin(T * 9) * .3 * o.waveA; }
      if (talking && name === 'down') { tgt[0] -= .12 + Math.abs(Math.sin(T * 3.1 + i)) * .35; tgt[2] -= .8 + Math.sin(T * 4.3 + i * 2) * .4; tgt[1] += .1; }
      if (talking && name !== 'down' && name !== 'fist') { tgt[2] += Math.sin(T * 5 + i) * .12; }
      for (let j = 0; j < 4; j++)A.cur[j] += (tgt[j] - A.cur[j]) * k;
      A.sh.r[0] = A.cur[0] + breathe * 3; A.sh.r[2] = A.cur[1] * A.sd; A.el.r[0] = A.cur[2]; A.el.r[1] = A.cur[3] * A.sd;
    });
    // head: look toward speaker/target
    let yaw = 0, pit = o.hp || 0; const tgtLook = o.look || speakerPos;
    if (o.hy !== null) yaw = o.hy; else if (tgtLook) { const dx = tgtLook[0] - o.x, dz = tgtLook[1] - o.z; let a = Math.atan2(dx, dz) - o.ry; a = Math.atan2(Math.sin(a), Math.cos(a)); yaw = clamp(a, -1.15, 1.15); if (Math.abs(a) < .05) yaw = 0; }
    const h = this.head; h.r[1] += (yaw - h.r[1]) * (1 - Math.exp(-dt * 5)); h.r[0] += ((pit + (talking ? Math.sin(T * 5.7 + this.t0) * .05 : 0) + (wa ? 0 : 0)) - h.r[0]) * k; h.r[2] += (o.hr + (talking ? Math.sin(T * 2.3) * .03 : 0) - h.r[2]) * k;
    if (lying) { h.r[0] = .0; }
    // face
    const E_ = { neutral: [0, 0, .0, 0], happy: [.1, .25, .0, .35], smirk: [.2, .35, .0, .15], worry: [.5, -.15, .0, .1], angry: [-.45, -.3, .0, 0], shock: [.8, -.1, .6, 0], smug: [.2, .3, .0, .1], tired: [-.1, -.1, .0, 0], grin: [.3, .45, .3, .7] }[o.ex] || [0, 0, 0, 0];
    const blink = (Math.sin(T * .9 + this.t0 * 3) > .985 || Math.sin(T * 1.7 + this.t0) > .995) ? .1 : 1;
    this.eyes.forEach(e => { e.s[1] = blink * (1 + E_[2] * .5); });
    this.brows.forEach((b, i) => { const sd = i ? -1 : 1; b.p[1] = .064 + E_[0] * .03; b.r[2] = -sd * E_[0] * .6; });
    const op = (talking ? (.35 + Math.abs(Math.sin(T * 14 + this.t0)) * .9) * o.talkAmt : 0) + E_[2] * 1.2;
    this.mouth.forEach((m, i) => { const sd = i ? -1 : 1; m.r[2] = -E_[1] * .36 * sd; m.s[1] = 1 + op * 2.4; m.s[0] = 1 + E_[3] * .5; m.p[1] = -.066 + E_[1] * .006 - op * .004; });
  }
}
G.Char = Char; G.CHARS = SPEC;
})(window);
