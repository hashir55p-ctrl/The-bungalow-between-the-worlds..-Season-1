/* Player: timeline, camera, subtitles, controls. */
(function () {
'use strict';
const { clamp, lerp, sm, PI } = E; const $ = id => document.getElementById(id);
const qs = new URLSearchParams(location.search);
const R_ = new E.Renderer($('c'), qs.has('shot'));
const P = { i: 0, T: 0, playing: false, S: null, started: false, fade: 0, lastBeat: -1, lastT: 0, sfxDone: {}, ended: false, hide: 0 };
function build(i, T0) {
  P.i = clamp(i, 0, SC.length - 1); const S = P.S = SC[P.i].build(); S.root.add(S.dome); P.T = T0 || 0; P.lastBeat = -1; P.sfxDone = {}; P.lastT = P.T; P.ended = false;
  AU.scene(S.audio.amb, S.audio.mus); renderChips(); $('stitle').textContent = (P.i + 1) + ' / ' + SC.length + '  ·  ' + SC[P.i].title; P.curLine = null;
}
function beatAt(S, T) { let k = 0; for (let i = 0; i < S.beats.length; i++) if (T >= S.beats[i].start) k = i; return k; }
function evalCam(b, u, p) {
  let c = b.cam; if (typeof c === 'function') c = c(u, p, P.T);
  else if (!Array.isArray(c)) { const e = c.e === 'io' ? sm(0, 1, p) : p; c = c.a.map((v, i) => lerp(v, c.b[i], e)); }
  return c;
}
function frame(dt) {
  const S = P.S; if (!S) return; const T = P.T; const bi = beatAt(S, T), b = S.beats[bi], u = T - b.start, p = clamp(u / b.dur);
  for (const id in S.chars) S.chars[id].reset();
  if (S.base) S.base(T, dt);
  if (b.act) b.act(u, p, b.dur, T);
  // active line
  let li = -1; for (let k = 0; k < b.lines.length; k++) if (u >= b.ls[k]) li = k; const line = li >= 0 ? b.lines[li] : null; const lstart = li >= 0 ? b.ls[li] : 0;
  const speakers = line && line[0] !== 'N' && line[0] !== 'X' && line[0] !== 'C' && line[0] !== 'T' && line[0] !== 'P' && u < lstart + (line[2] && line[2].d || (.4 + line[1].length * .055)) + .5;
  const talkers = speakers ? (line[0] === 'A' ? 'SRJH'.split('') : [line[0]]) : [];
  const sp = talkers.length === 1 && S.chars[talkers[0]] ? [S.chars[talkers[0]].o.x, S.chars[talkers[0]].o.z] : null;
  for (const id in S.chars) { const ch = S.chars[id]; const talk = talkers.indexOf(id) >= 0; ch.apply(T, dt, talk, (talkers.length === 1 && talkers[0] !== id) ? sp : null); }
  if (S.flick) S.flick.forEach(l => { l.k = 1 + .06 * Math.sin(T * 7 + l.fl) + .04 * Math.sin(T * 13.1 + l.fl * 2); });
  if (S.tick) S.tick(T, dt, u, b);
  S.root.update(null);
  let c = evalCam(b, u, p); const sh = S.shake || 0, tt = T;
  const px = c[0] + Math.sin(tt * 1.3) * sh + Math.sin(tt * 3.7) * sh * .4, py = c[1] + Math.sin(tt * 1.7 + 1) * sh * .7, pz = c[2] + Math.sin(tt * 1.1 + 2) * sh;
  const cam = { p: [px, py, pz], l: [c[3] + Math.sin(tt * 1.9) * sh * .6, c[4] + Math.sin(tt * 2.3) * sh * .5, c[5]], f: c[6], roll: Math.sin(tt * .8) * .004 };
  R_.render(S, cam, T);
  // sfx cues
  if (P.playing) { b.sfx.forEach((s, k) => { const key = bi + ':' + k; if (!P.sfxDone[key] && u >= s[0]) { P.sfxDone[key] = 1; AU.sfx(s[1]); } }); if (line && line[0] === 'X' && !P.sfxDone['x' + bi + li]) { P.sfxDone['x' + bi + li] = 1; const t = line[1].toUpperCase(); if (t.indexOf('BONG') >= 0 || t.indexOf('DONG') >= 0) AU.sfx('dong'); else if (t.indexOf('THUD') >= 0) AU.sfx('thud'); else if (t.indexOf('CREAK') >= 0) AU.sfx('creak'); } }
  showLine(line, u - lstart, bi, li);
  // fade
  const f = Math.max(1 - T / .7, 1 - (S.dur - T) / .7); $('fade').style.opacity = clamp(f);
  $('bar').style.width = (T / S.dur * 100) + '%';
}
let lastKey = '';
function showLine(line, lu, bi, li) {
  const key = line ? bi + ':' + li : ''; const sub = $('sub'), nar = $('nar'), fx = $('fx'), card = $('card'), ttl = $('ttl');
  if (key !== lastKey) {
    lastKey = key; sub.className = ''; nar.className = ''; fx.className = ''; card.className = ''; ttl.className = '';
    if (!line || line[0] === 'P') return; const k = line[0], t = line[1];
    if (k === 'N') { nar.textContent = t; void nar.offsetWidth; nar.className = 'on'; }
    else if (k === 'X') { fx.textContent = t; void fx.offsetWidth; fx.className = 'on'; }
    else if (k === 'C') { const [a, b] = t.split('|'); card.innerHTML = '<b>' + a + '</b><i>' + b + '</i>'; void card.offsetWidth; card.className = 'on'; }
    else if (k === 'T') { const [a, b] = t.split('|'); ttl.innerHTML = '<h1>' + a + '</h1><p>' + b + '</p>'; void ttl.offsetWidth; ttl.className = 'on'; }
    else { const nm = k === 'A' ? 'Everyone' : NAMES2[k]; sub.innerHTML = '<span class="who" style="color:' + (CHARS[k] ? CHARS[k].col : '#fff') + '">' + nm + '</span><span class="txt"></span>'; sub.className = 'on'; sub.dataset.t = t; }
  }
  if (line && sub.className === 'on') { const n = Math.min(sub.dataset.t.length, Math.floor(lu * 46) + 1); sub.querySelector('.txt').textContent = sub.dataset.t.slice(0, n); }
}
const NAMES2 = { S: 'Stany', R: 'Renjith', J: 'Jesvin', H: 'Hashir' };
let last = performance.now();
function loop(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (P.playing) {
    P.T += dt;
    if (P.T >= P.S.dur) { if (P.i < SC.length - 1) build(P.i + 1, 0); else { P.T = P.S.dur - .01; P.playing = false; showEnd(); setPlayIcon(); } }
  }
  frame(P.playing ? dt : .0001);
  if (P.playing && qs.has('shot')) { }
  if (performance.now() - P.hide > 2800 && P.playing) document.body.classList.add('idle');
  requestAnimationFrame(loop);
}
function showEnd() { $('end').className = 'on'; AU.sfx('boom'); }
function setPlayIcon() { $('play').textContent = P.playing ? '❚❚' : '▶'; }
function toggle() { if (!P.started) return; if (P.ended) return; P.playing = !P.playing; setPlayIcon(); if (P.playing) AU.resume(); }
function jump(i, T) { $('end').className = ''; build(i, T || 0); lastKey = ''; }
function renderChips() { const el = $('chips'); el.innerHTML = ''; SC.forEach((s, i) => { const b = document.createElement('button'); b.textContent = i + 1; b.title = s.title; b.className = i === P.i ? 'cur' : ''; b.onclick = () => jump(i, 0); el.appendChild(b); }); }
function begin() { P.started = true; $('intro').className = 'gone'; AU.init(); AU.resume(); build(0, 0); P.playing = true; setPlayIcon(); P.hide = performance.now(); }
$('begin').onclick = begin; $('play').onclick = toggle;
$('prev').onclick = () => jump(Math.max(0, P.i - 1)); $('next').onclick = () => jump(Math.min(SC.length - 1, P.i + 1));
$('mute').onclick = () => { AU.mute(AU.on); $('mute').textContent = AU.on ? '🔊' : '🔇'; };
$('fs').onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); };
$('replay').onclick = () => { jump(0, 0); P.playing = true; setPlayIcon(); };
$('prog').onclick = e => { const r = $('prog').getBoundingClientRect(); P.T = clamp((e.clientX - r.left) / r.width) * P.S.dur; P.sfxDone = {}; };
document.addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); toggle(); } else if (e.code === 'ArrowRight') $('next').click(); else if (e.code === 'ArrowLeft') $('prev').click(); else if (e.key === 'm') $('mute').click(); else if (e.key === 'f') $('fs').click(); });
['mousemove', 'touchstart', 'click'].forEach(ev => document.addEventListener(ev, () => { P.hide = performance.now(); document.body.classList.remove('idle'); }));
// test hooks
window.CIN = { P, jump, build, frame, SC, seek: (i, T) => { build(i, T); lastKey = ''; P.playing = false; frame(.05); frame(.05); frame(.05); }, R: R_ };
if (qs.has('s')) { $('intro').className = 'gone'; P.started = true; build(+qs.get('s') - 1, +qs.get('t') || 0); P.playing = false; setTimeout(() => { for (let k = 0; k < 14; k++) frame(.05); window.__ready = true; }, 50); }
if (!qs.has('s') || qs.has('live')) requestAnimationFrame(loop);
})();
