/* Tiny procedural soundtrack: ambience, music pads and sound effects (WebAudio). */
(function (G) {
'use strict';
const A = { ctx: null, on: true, amb: null, mus: null, vol: .8 };
A.init = function () {
  if (A.ctx) return; const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
  const c = A.ctx = new C(); A.master = c.createGain(); A.master.gain.value = A.on ? A.vol : 0;
  const comp = c.createDynamicsCompressor(); A.master.connect(comp); comp.connect(c.destination);
  A.bus = c.createGain(); A.bus.connect(A.master); A.music = c.createGain(); A.music.gain.value = .5; A.music.connect(A.master);
  const len = c.sampleRate * 2, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; A.noise = b;
};
A.resume = function () { if (A.ctx && A.ctx.state === 'suspended') A.ctx.resume(); };
A.mute = function (m) { A.on = !m; if (A.master) A.master.gain.setTargetAtTime(m ? 0 : A.vol, A.ctx.currentTime, .05); };
function nz(filter, freq, q, gain, dest) { const c = A.ctx, s = c.createBufferSource(); s.buffer = A.noise; s.loop = true; const f = c.createBiquadFilter(); f.type = filter; f.frequency.value = freq; f.Q.value = q || 1; const g = c.createGain(); g.gain.value = gain; s.connect(f); f.connect(g); g.connect(dest); s.start(); return { s, f, g }; }
function osc(type, freq, gain, dest) { const c = A.ctx, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = freq; g.gain.value = gain; o.connect(g); g.connect(dest); o.start(); return { o, g }; }
const AMB = {
  sea: c => { const g = c.createGain(); nz('lowpass', 500, .5, .25, g); const w = nz('bandpass', 900, .4, .05, g); const l = osc('sine', .13, 220, w.f.frequency); return [g]; },
  road: c => { const g = c.createGain(); nz('lowpass', 300, .7, .3, g); osc('sawtooth', 52, .04, g); osc('sawtooth', 78, .02, g); nz('highpass', 3000, .3, .02, g); return [g]; },
  forest: c => { const g = c.createGain(); nz('lowpass', 700, .5, .12, g); nz('bandpass', 5200, 3, .05, g); return [g]; },
  hall: c => { const g = c.createGain(); nz('lowpass', 220, .6, .2, g); osc('sine', 55, .06, g); return [g]; },
  night: c => { const g = c.createGain(); nz('lowpass', 260, .6, .17, g); const cr = nz('bandpass', 4600, 14, .1, g); const l = osc('square', 7.5, 1800, cr.f.frequency); osc('sine', 46, .07, g); return [g]; },
  study: c => { const g = c.createGain(); nz('lowpass', 200, .6, .14, g); osc('sine', 50, .08, g); osc('sine', 75.3, .04, g); return [g]; },
  glow: c => { const g = c.createGain(); nz('lowpass', 400, .6, .12, g); const o = osc('sine', 60, .1, g); const o2 = osc('sawtooth', 120, .03, g); o.o.frequency.linearRampToValueAtTime(240, c.currentTime + 40); return [g]; }
};
const MUS = { day: [[261.6, 329.6, 392], [220, 261.6, 329.6], [174.6, 220, 261.6], [196, 246.9, 293.7]], night: [[110, 130.8, 164.8], [98, 116.5, 146.8], [110, 130.8, 164.8], [87.3, 103.8, 130.8]], dread: [[55, 82.4, 110], [58.3, 87.3, 116.5]], epic: [[110, 164.8, 220], [130.8, 196, 261.6], [98, 146.8, 196], [87.3, 130.8, 174.6]] };
A.scene = function (amb, mus) {
  if (!A.ctx) return; const c = A.ctx, t = c.currentTime;
  if (A.curAmb) { const o = A.curAmb; o.gain.gain.setTargetAtTime(0, t, .4); setTimeout(() => { try { o.nodes.forEach(n => n.disconnect()); } catch (e) { } }, 2500); A.curAmb = null; }
  if (amb && AMB[amb]) { const g = c.createGain(); g.gain.value = 0; g.connect(A.bus); const n = AMB[amb](c); n.forEach(x => x.connect(g)); g.gain.setTargetAtTime(.9, t, .6); A.curAmb = { gain: g, nodes: [g, ...n] }; }
  A.mood = mus; A.step = 0; clearInterval(A.mt); if (mus && MUS[mus]) { A.mt = setInterval(() => A.chord(), 3600); A.chord(); }
};
A.chord = function () {
  if (!A.ctx || !A.mood) return; const c = A.ctx, t = c.currentTime, ch = MUS[A.mood][A.step++ % MUS[A.mood].length];
  ch.forEach((f, i) => { const o = c.createOscillator(), g = c.createGain(), fl = c.createBiquadFilter(); o.type = A.mood === 'dread' ? 'sawtooth' : 'triangle'; o.frequency.value = f * (A.mood === 'day' || A.mood === 'epic' ? 1 : 1); o.detune.value = (i - 1) * 6; fl.type = 'lowpass'; fl.frequency.value = A.mood === 'dread' ? 500 : 1100; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.07, t + 1.4); g.gain.linearRampToValueAtTime(0, t + 4.6); o.connect(fl); fl.connect(g); g.connect(A.music); o.start(t); o.stop(t + 5); });
  if (A.mood === 'day' || A.mood === 'epic') { [0, 1, 2, 1].forEach((k, i) => { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = ch[k] * 2; g.gain.setValueAtTime(0, t + i * .9); g.gain.linearRampToValueAtTime(.045, t + i * .9 + .05); g.gain.exponentialRampToValueAtTime(.0005, t + i * .9 + 1.4); o.connect(g); g.connect(A.music); o.start(t + i * .9); o.stop(t + i * .9 + 1.5); }); }
  if (A.mood === 'dread') { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = 40; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.18, t + 1); g.gain.linearRampToValueAtTime(0, t + 4); o.connect(g); g.connect(A.music); o.start(t); o.stop(t + 4.2); }
};
function env(g, t, a, d, peak) { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0005, t + a + d); }
A.sfx = function (name, v) {
  if (!A.ctx || !A.on) return; const c = A.ctx, t = c.currentTime, g = c.createGain(); g.connect(A.master); v = v === undefined ? 1 : v;
  const tone = (type, f, a, d, p, f2) => { const o = c.createOscillator(), gg = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d); env(gg, t, a, d, p * v); o.connect(gg); gg.connect(g); o.start(t); o.stop(t + a + d + .1); };
  const burst = (ft, f, q, a, d, p, f2) => { const s = c.createBufferSource(); s.buffer = A.noise; const fl = c.createBiquadFilter(); fl.type = ft; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + a + d); fl.Q.value = q; const gg = c.createGain(); env(gg, t, a, d, p * v); s.connect(fl); fl.connect(gg); gg.connect(g); s.start(t); s.stop(t + a + d + .1); };
  if (name === 'dong') { tone('sine', 196, .01, 4, .55); tone('sine', 392.5, .01, 3, .25); tone('sine', 588, .01, 2, .12); tone('sine', 98, .01, 5, .3); }
  else if (name === 'tick') burst('highpass', 3000, 1, .001, .04, .25);
  else if (name === 'creak') { burst('bandpass', 400, 12, .15, 1.2, .5, 1100); tone('sawtooth', 110, .1, 1.0, .06, 190); }
  else if (name === 'plink') { tone('triangle', 659, .004, 2.5, .35); tone('sine', 1318, .004, 1.8, .15); tone('sine', 329, .004, 3, .2); }
  else if (name === 'thud') { tone('sine', 90, .005, .5, .8, 38); burst('lowpass', 500, 1, .005, .35, .6); }
  else if (name === 'door') { burst('lowpass', 600, 2, .1, 1.2, .5, 150); tone('sawtooth', 70, .1, 1.2, .05, 120); }
  else if (name === 'bell') { tone('sine', 880, .005, 1.5, .2); tone('sine', 1760, .005, 1, .1); }
  else if (name === 'boom') { tone('sine', 55, .01, 3.5, .9, 30); burst('lowpass', 300, 1, .01, 2.5, .5, 60); }
  else if (name === 'swell') { tone('sawtooth', 55, 3, 2, .12, 220); burst('bandpass', 300, 1, 3, 1.5, .25, 3000); }
  else if (name === 'clap') { burst('bandpass', 1800, 1, .002, .12, .6); }
  else if (name === 'knock') { tone('sine', 140, .002, .18, .6, 70); }
};
A.heart = function () { A.sfx('thud', .4); };
G.AU = A;
})(window);
