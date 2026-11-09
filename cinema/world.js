/* Shared helpers + procedural textures for the Bungalow cinema. */
(function (G) {
'use strict';
const { Node, M, L, G_BOX, G_QUAD, G_SPH, G_CYL, G_CONE, geo, tex, rng, PI } = E;
const mat = m => typeof m === 'number' ? M(m) : m;
const W = {};
W.box = (p, w, h, d, m, x = 0, y = 0, z = 0) => { const n = new Node(G_BOX(), mat(m)).pos(x, y, z).scl(w, h, d); p.add(n); return n; };
W.cyl = (p, r, h, m, x = 0, y = 0, z = 0) => { const n = new Node(G_CYL(), mat(m)).pos(x, y, z).scl(r, h, r); p.add(n); return n; };
W.cone = (p, r, h, m, x = 0, y = 0, z = 0) => { const n = new Node(G_CONE(), mat(m)).pos(x, y, z).scl(r, h, r); p.add(n); return n; };
W.frus = (p, rt, rb, h, m, x = 0, y = 0, z = 0, seg = 18) => { const n = new Node(geo('frus', rt / rb, seg), mat(m)).pos(x, y, z).scl(rb, h, rb); p.add(n); return n; };
W.sph = (p, rx, ry, rz, m, x = 0, y = 0, z = 0) => { const n = new Node(G_SPH(), mat(m)).pos(x, y, z).scl(rx, ry === undefined ? rx : ry, rz === undefined ? (ry === undefined ? rx : ry) : rz); p.add(n); return n; };
W.quad = (p, w, h, m, x = 0, y = 0, z = 0) => { const n = new Node(G_QUAD(), mat(m)).pos(x, y, z).scl(w, h, 1); p.add(n); return n; };
W.floor = (p, w, d, m, x = 0, y = 0, z = 0) => { const n = new Node(G_QUAD(), mat(m)).pos(x, y, z).rot(-PI / 2, 0, 0).scl(w, d, 1); p.add(n); return n; };
W.tor = (p, R, tube, m, x = 0, y = 0, z = 0) => { const n = new Node(geo('tor', tube), mat(m)).pos(x, y, z).scl(R, R, R); p.add(n); return n; };
W.grp = (p, x = 0, y = 0, z = 0) => { const n = new Node(null, null).pos(x, y, z); p.add(n); return n; };
W.glow = (p, size, col, a, x, y, z) => { const n = new Node(G_QUAD(), M(0xffffff, { c: col, mode: 2, tex: TX.glow(), a, add: true, nofog: true })).pos(x, y, z).scl(size, size, 1); n.bb = true; p.add(n); return n; };
W.blob = (p, r, x, y, z, a = .55) => { const n = new Node(G_QUAD(), M(0x000000, { c: [0, 0, 0], mode: 2, tex: TX.blob(), a, nofog: true })).pos(x, y + .012, z).rot(-PI / 2, 0, 0).scl(r, r, 1); n.depthOff = 5; p.add(n); return n; };

/* ---------- procedural textures (power-of-two canvases) ---------- */
const cache = {};
const once = (k, f) => cache[k] || (cache[k] = f());
const TX = {};
TX.glow = () => once('glow', () => tex(128, 128, (g, w, h) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.25, 'rgba(255,255,255,.5)'); r.addColorStop(.6, 'rgba(255,255,255,.12)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); }));
TX.blob = () => once('blob', () => tex(64, 64, (g, w, h) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(0,0,0,1)'); r.addColorStop(.5, 'rgba(0,0,0,.55)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); }));
TX.planks = (a, b, dir) => once('pl' + a + b + dir, () => tex(256, 256, (g, w, h) => { const r = rng(5); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? b : a; if (dir) g.fillRect(0, i * 32, w, 32); else g.fillRect(i * 32, 0, 32, h); g.fillStyle = 'rgba(0,0,0,.45)'; if (dir) g.fillRect(0, i * 32, w, 2); else g.fillRect(i * 32, 0, 2, h); } for (let i = 0; i < 380; i++) { g.fillStyle = 'rgba(0,0,0,' + r() * .1 + ')'; if (dir) g.fillRect(r() * w, r() * h, 8 + r() * 40, 1); else g.fillRect(r() * w, r() * h, 1, 8 + r() * 40); } }));
TX.noise = (base, v, n) => once('no' + base + v + n, () => tex(128, 128, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); const r = rng(9); for (let i = 0; i < n; i++) { g.fillStyle = 'rgba(' + v + ',' + (r() * .22) + ')'; g.fillRect(r() * w, r() * h, 1 + r() * 4, 1 + r() * 4); } }));
TX.tiles = (a, b) => once('ti' + a + b, () => tex(128, 128, (g, w, h) => { for (let i = 0; i < 4; i++)for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * 32, j * 32, 32, 32); } }));
TX.floral = () => once('floral', () => tex(128, 128, (g, w, h) => { g.fillStyle = '#16213d'; g.fillRect(0, 0, w, h); const r = rng(4); for (let i = 0; i < 16; i++) { const x = r() * w, y = r() * h; g.fillStyle = i % 3 ? '#e9ecf5' : '#6f8fd6'; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(x + Math.cos(k * 1.256) * 6, y + Math.sin(k * 1.256) * 6, 4.5, 0, 7); g.fill(); } g.fillStyle = '#f2c14e'; g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill(); } }));
TX.argyle = () => once('argyle', () => tex(128, 128, (g, w, h) => { g.fillStyle = '#2a2140'; g.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++)for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#16111f' : '#4a3a6e'; g.beginPath(); g.moveTo(i * 32 + 16, j * 32); g.lineTo(i * 32 + 32, j * 32 + 16); g.lineTo(i * 32 + 16, j * 32 + 32); g.lineTo(i * 32, j * 32 + 16); g.fill(); } }));
TX.books = () => once('books', () => tex(256, 256, (g, w, h) => { g.fillStyle = '#1a0f08'; g.fillRect(0, 0, w, h); const r = rng(11); const cols = ['#6b2a1e', '#2d3a2a', '#7a5a2a', '#3a2a4a', '#8a3a22', '#2a3a52', '#5a4a2a', '#a07a3a']; for (let row = 0; row < 5; row++) { let x = 2; const y = row * 51 + 3; while (x < w - 6) { const bw = 6 + r() * 12, bh = 36 + r() * 12; g.fillStyle = cols[(r() * cols.length) | 0]; g.fillRect(x, y + (46 - bh), bw, bh); g.fillStyle = 'rgba(255,230,160,.35)'; g.fillRect(x + 2, y + (46 - bh) + 6, bw - 4, 2); x += bw + 1; } g.fillStyle = '#3a2412'; g.fillRect(0, row * 51 + 49, w, 3); } }));
TX.clock = (hr, mn) => tex(256, 256, (g, w, h) => { g.fillStyle = '#e9dcc0'; g.beginPath(); g.arc(128, 128, 122, 0, 7); g.fill(); g.strokeStyle = '#3a2412'; g.lineWidth = 8; g.stroke(); g.fillStyle = '#2a1a0c'; g.font = 'bold 26px Georgia,serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; const R = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI']; R.forEach((t, i) => { const a = i / 12 * 2 * PI; g.fillText(t, 128 + Math.sin(a) * 96, 128 - Math.cos(a) * 96); }); });
TX.phone = () => once('phone', () => tex(256, 512, (g, w, h) => {
  g.fillStyle = '#f7f7f4'; g.fillRect(0, 0, w, h);
  const gr = g.createLinearGradient(0, 0, 0, 200); gr.addColorStop(0, '#7fb878'); gr.addColorStop(1, '#4d8a50'); g.fillStyle = gr; g.fillRect(0, 0, w, 210);
  g.fillStyle = '#6a3a22'; g.fillRect(50, 90, 156, 70); g.fillStyle = '#8a4a28'; g.beginPath(); g.moveTo(40, 92); g.lineTo(128, 50); g.lineTo(216, 92); g.fill(); g.fillStyle = '#2a8fc4'; g.fillRect(0, 170, w, 40);
  g.fillStyle = '#222'; g.font = 'bold 21px sans-serif'; g.textAlign = 'left'; g.fillText('The Whispering Banyan', 16, 246); g.fillText('Heritage Bungalow,', 16, 272); g.fillText('Wayanad.', 16, 298);
  g.font = '19px sans-serif'; g.fillStyle = '#444'; g.fillText('✔ Pool.', 16, 336); g.fillText('✔ Forest view.', 16, 366);
  g.fillStyle = '#111'; g.font = 'bold 20px sans-serif'; g.fillText('3 nights - Rs 14,500.', 16, 410); g.fillStyle = '#e8a010'; g.fillText('★ 4.9 stars', 16, 446);
}));
TX.booked = () => once('booked', () => tex(256, 512, (g, w, h) => {
  g.fillStyle = '#f7f7f4'; g.fillRect(0, 0, w, h); g.fillStyle = '#2faa4a'; g.beginPath(); g.arc(128, 120, 54, 0, 7); g.fill();
  g.strokeStyle = '#fff'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(100, 122); g.lineTo(122, 146); g.lineTo(160, 96); g.stroke();
  g.save(); g.translate(128, 330); g.rotate(-.12); g.strokeStyle = '#2a9a40'; g.lineWidth = 8; g.strokeRect(-100, -38, 200, 76); g.fillStyle = '#2a9a40'; g.font = 'bold 50px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('BOOKED', 0, 2); g.restore();
}));
TX.skyWindow = (mode) => once('win' + mode, () => tex(256, 512, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  if (mode === 'dusk') { gr.addColorStop(0, '#2a2350'); gr.addColorStop(.55, '#d9743a'); gr.addColorStop(1, '#f2b45a'); } else if (mode === 'day') { gr.addColorStop(0, '#9fd0f0'); gr.addColorStop(1, '#f5e6b8'); } else { gr.addColorStop(0, '#060912'); gr.addColorStop(.6, '#0d1a2e'); gr.addColorStop(1, '#16293a'); }
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const r = rng(21); g.fillStyle = mode === 'night' ? '#02060a' : (mode === 'dusk' ? '#2a1a14' : '#2f5a2a');
  for (let i = 0; i < 26; i++) { const x = r() * w, y = 250 + r() * 260, rr = 24 + r() * 50; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); }
  g.fillRect(0, 440, w, 80);
  if (mode === 'night') { g.fillStyle = '#d8e4ff'; g.beginPath(); g.arc(190, 90, 22, 0, 7); g.fill(); g.fillStyle = 'rgba(180,200,255,.15)'; g.beginPath(); g.arc(190, 90, 52, 0, 7); g.fill(); for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,255,255,' + (.3 + r() * .6) + ')'; g.fillRect(r() * w, r() * 200, 2, 2); } for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(210,255,140,.9)'; g.fillRect(r() * w, 300 + r() * 160, 3, 3); } }
}));
TX.sepiaGroup = (year, fig) => tex(256, 256, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6f5a3e'); gr.addColorStop(1, '#3d2e1c'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#2a1e12'; g.beginPath(); g.moveTo(20, 130); g.lineTo(128, 50); g.lineTo(236, 130); g.lineTo(236, 190); g.lineTo(20, 190); g.fill(); g.fillStyle = '#4a3a24'; g.fillRect(40, 130, 176, 60);
  g.fillStyle = '#c9b48a'; g.fillRect(104, 138, 20, 28); if (fig) { g.fillStyle = '#0a0705'; g.beginPath(); g.arc(114, 148, 5, 0, 7); g.fill(); g.fillRect(109, 152, 10, 14); }
  const r = rng(year); for (let i = 0; i < 4; i++) { const x = 48 + i * 52; g.fillStyle = '#8a6a44'; g.beginPath(); g.arc(x, 188, 12, 0, 7); g.fill(); g.fillStyle = '#5a4430'; g.fillRect(x - 15, 200, 30, 56); }
  g.fillStyle = 'rgba(255,230,170,.1)'; for (let i = 0; i < 400; i++)g.fillRect(r() * w, r() * h, 1, 1);
});
TX.plaque = (t) => tex(128, 32, (g, w, h) => { g.fillStyle = '#9a7a3a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#5a4018'; g.lineWidth = 2; g.strokeRect(2, 2, w - 4, h - 4); g.fillStyle = '#2a1a06'; g.font = 'bold 20px Georgia,serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, w / 2, h / 2 + 1); });
TX.sign = (t, bg, fg) => tex(256, 128, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = fg; g.lineWidth = 5; g.strokeRect(5, 5, w - 10, h - 10); g.fillStyle = fg; g.font = 'bold 30px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; const ls = t.split('\n'); ls.forEach((l, i) => g.fillText(l, w / 2, h / 2 + (i - (ls.length - 1) / 2) * 36)); });
TX.parchment = (lines, size = 22) => tex(256, 256, (g, w, h) => { g.fillStyle = '#d9c08a'; g.fillRect(0, 0, w, h); const r = rng(8); for (let i = 0; i < 500; i++) { g.fillStyle = 'rgba(90,60,20,' + r() * .12 + ')'; g.fillRect(r() * w, r() * h, 3, 3); } g.fillStyle = '#3a2410'; g.font = 'italic ' + size + 'px Georgia,serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; lines.forEach((l, i) => g.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * (size + 8))); });
TX.bookOpen = () => once('bookopen', () => tex(512, 256, (g, w, h) => {
  g.fillStyle = '#d8c597'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(70,40,10,.5)'; g.fillRect(w / 2 - 2, 0, 4, h);
  g.strokeStyle = '#4a3418'; g.lineWidth = 3; g.beginPath(); g.moveTo(130, 220); g.lineTo(130, 120); g.bezierCurveTo(70, 100, 60, 60, 120, 40); g.bezierCurveTo(150, 20, 200, 30, 210, 70); g.stroke(); for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(130, 220); g.bezierCurveTo(110 + i * 12, 200, 80 + i * 20, 150, 60 + i * 24, 120); g.stroke(); }
  g.fillStyle = '#2a1608'; g.font = 'bold 22px Georgia,serif'; g.textAlign = 'center'; g.fillText('The Watcher', 384, 40); g.font = 'italic 15px Georgia,serif'; g.textAlign = 'left';
  ['He is always there,', 'In every visitor.', 'He never harms.', 'He only watches.', 'But when the tree', 'chooses, he comes down.'].forEach((l, i) => g.fillText(l, 300, 82 + i * 26));
}));
TX.polaroid = () => once('polaroid', () => tex(256, 256, (g, w, h) => {
  g.fillStyle = '#f4efe2'; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(0, 14, 0, 200); gr.addColorStop(0, '#6e8f6a'); gr.addColorStop(1, '#3d5a38'); g.fillStyle = gr; g.fillRect(14, 14, 228, 186);
  g.fillStyle = '#7a6a4a'; g.fillRect(14, 120, 228, 80); g.fillStyle = '#d8c8a0'; g.fillRect(40, 100, 176, 12);
  [[70, '#c9a25a'], [105, '#2a2a3a'], [145, '#5a6a3a'], [182, '#3a3a5a']].forEach(([x, c]) => { g.fillStyle = '#b07e58'; g.beginPath(); g.arc(x, 112, 8, 0, 7); g.fill(); g.fillStyle = c; g.fillRect(x - 11, 120, 22, 40); });
  g.fillStyle = '#2a2a3a'; g.font = 'italic 20px Georgia,serif'; g.textAlign = 'center'; g.fillText('Today. 4:12 PM.', 128, 232);
}));
TX.door = () => once('door', () => tex(512, 1024, (g, w, h) => {
  g.fillStyle = '#2a1608'; g.fillRect(0, 0, w, h);
  const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#3a1f0c'); gr.addColorStop(.5, '#4a2810'); gr.addColorStop(1, '#3a1f0c'); g.fillStyle = gr; g.fillRect(14, 14, w - 28, h - 28);
  g.strokeStyle = '#8a5a1e'; g.lineWidth = 6; g.strokeRect(30, 30, w - 60, h - 60);
  g.fillStyle = '#e8ad3a'; g.strokeStyle = '#f6c65a'; g.lineCap = 'round';
  const br = (x, y, a, len, wd, d) => { if (d > 7 || len < 10) return; const x2 = x + Math.sin(a) * len, y2 = y - Math.cos(a) * len; g.lineWidth = wd; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke(); br(x2, y2, a - .45, len * .72, wd * .7, d + 1); br(x2, y2, a + .45, len * .72, wd * .7, d + 1); if (d > 3) { g.beginPath(); g.arc(x2, y2, 4, 0, 7); g.fill(); } };
  br(256, 760, 0, 190, 26, 0); g.lineWidth = 8; for (let i = -5; i <= 5; i++) { g.beginPath(); g.moveTo(256 + i * 16, 760); g.quadraticCurveTo(256 + i * 24, 850, 256 + i * 46, 930); g.stroke(); }
  g.lineWidth = 6; g.beginPath(); g.moveTo(256, 20); g.lineTo(256, h - 20); g.stroke();
}));
TX.net = () => once('net', () => tex(128, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(40,36,28,.9)'; g.lineWidth = 2; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16, h); g.moveTo(0, i * 16); g.lineTo(w, i * 16); g.stroke(); } }));
TX.leaf = () => once('leaf', () => tex(128, 128, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); const r = rng(2); for (let i = 0; i < 200; i++) { const v = 150 + r() * 105; g.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')'; g.fillRect(r() * w, r() * h, 2 + r() * 6, 2 + r() * 6); } }));
TX.wall = (a) => once('wall' + a, () => tex(128, 128, (g, w, h) => { g.fillStyle = a; g.fillRect(0, 0, w, h); const r = rng(3); for (let i = 0; i < 300; i++) { g.fillStyle = 'rgba(0,0,0,' + r() * .09 + ')'; g.fillRect(r() * w, r() * h, 2 + r() * 14, 1 + r() * 3); } }));
TX.tea = () => once('tea', () => tex(128, 128, (g, w, h) => { g.fillStyle = '#4c8a3a'; g.fillRect(0, 0, w, h); const r = rng(6); for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#3d7a2e' : '#5b9a46'; g.fillRect(0, i * 11, w, 7); } for (let i = 0; i < 300; i++) { g.fillStyle = 'rgba(20,60,10,' + r() * .25 + ')'; g.fillRect(r() * w, r() * h, 2, 2); } }));
TX.water = () => once('water', () => tex(128, 128, (g, w, h) => { g.fillStyle = '#2d7aa0'; g.fillRect(0, 0, w, h); const r = rng(14); for (let i = 0; i < 160; i++) { g.fillStyle = 'rgba(255,255,255,' + r() * .14 + ')'; g.fillRect(r() * w, r() * h, 6 + r() * 16, 1); } }));
TX.road = () => once('road', () => tex(64, 128, (g, w, h) => { g.fillStyle = '#3e3d3b'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8dfc0'; g.fillRect(30, 8, 4, 40); g.fillRect(30, 72, 4, 40); const r = rng(1); for (let i = 0; i < 100; i++) { g.fillStyle = 'rgba(255,255,255,' + r() * .06 + ')'; g.fillRect(r() * w, r() * h, 2, 2); } }));
TX.doorHalf = (side) => once('dh' + side, () => { const src = TX.door().cv; return tex(256, 1024, (g) => { g.drawImage(src, side ? 256 : 0, 0, 256, 1024, 0, 0, 256, 1024); }); });
TX.leafRed = () => once('leafred', () => tex(64, 64, (g, w, h) => { g.fillStyle = '#6a2230'; g.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(i * 8, 0, 2, h); } }));
W.TX = TX; G.W = W;
})(window);
