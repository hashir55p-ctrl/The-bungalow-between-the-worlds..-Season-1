/* Mini WebGL engine for the Bungalow cinema. No dependencies. */
(function (G) {
'use strict';
const PI = Math.PI;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const sm = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const ramp = (a, b, x) => clamp((x - a) / (b - a));
function rng(seed) { let s = seed | 0; return function () { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rgb = h => [(h >> 16 & 255) / 255, (h >> 8 & 255) / 255, (h & 255) / 255];
const lin = c => c.map(x => Math.pow(x, 2.2));
const L = h => lin(rgb(h));            // hex -> linear colour

/* ---------- matrices (column major) ---------- */
function compose(o, p, r, s) {
  const cx = Math.cos(r[0]), sx = Math.sin(r[0]), cy = Math.cos(r[1]), sy = Math.sin(r[1]), cz = Math.cos(r[2]), sz = Math.sin(r[2]);
  const r00 = cy * cz + sy * sx * sz, r01 = -cy * sz + sy * sx * cz, r02 = sy * cx;
  const r10 = cx * sz, r11 = cx * cz, r12 = -sx;
  const r20 = -sy * cz + cy * sx * sz, r21 = sy * sz + cy * sx * cz, r22 = cy * cx;
  o[0] = r00 * s[0]; o[1] = r10 * s[0]; o[2] = r20 * s[0]; o[3] = 0;
  o[4] = r01 * s[1]; o[5] = r11 * s[1]; o[6] = r21 * s[1]; o[7] = 0;
  o[8] = r02 * s[2]; o[9] = r12 * s[2]; o[10] = r22 * s[2]; o[11] = 0;
  o[12] = p[0]; o[13] = p[1]; o[14] = p[2]; o[15] = 1;
}
function mul(o, a, b) {
  for (let c = 0; c < 4; c++) {
    const b0 = b[c * 4], b1 = b[c * 4 + 1], b2 = b[c * 4 + 2], b3 = b[c * 4 + 3];
    o[c * 4] = a[0] * b0 + a[4] * b1 + a[8] * b2 + a[12] * b3;
    o[c * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9] * b2 + a[13] * b3;
    o[c * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
    o[c * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
  }
}
function perspective(o, fovy, asp, n, f) {
  const t = 1 / Math.tan(fovy / 2);
  o.fill(0); o[0] = t / asp; o[5] = t; o[10] = (f + n) / (n - f); o[11] = -1; o[14] = 2 * f * n / (n - f);
}
function lookAt(o, e, t, roll) {
  let zx = e[0] - t[0], zy = e[1] - t[1], zz = e[2] - t[2]; let l = Math.hypot(zx, zy, zz) || 1; zx /= l; zy /= l; zz /= l;
  let ux = Math.sin(roll || 0), uy = Math.cos(roll || 0), uz = 0;
  let xx = uy * zz - uz * zy, xy = uz * zx - ux * zz, xz = ux * zy - uy * zx; l = Math.hypot(xx, xy, xz) || 1; xx /= l; xy /= l; xz /= l;
  const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
  o[0] = xx; o[1] = yx; o[2] = zx; o[3] = 0; o[4] = xy; o[5] = yy; o[6] = zy; o[7] = 0; o[8] = xz; o[9] = yz; o[10] = zz; o[11] = 0;
  o[12] = -(xx * e[0] + xy * e[1] + xz * e[2]); o[13] = -(yx * e[0] + yy * e[1] + yz * e[2]); o[14] = -(zx * e[0] + zy * e[1] + zz * e[2]); o[15] = 1;
}

/* ---------- geometry ---------- */
function Geo(v, i) { this.v = new Float32Array(v); this.i = new Uint16Array(i); this.buf = null; }
const geoCache = {};
const GEO = {
  box() {
    const v = [], ix = []; const F = [
      [[0, 0, 1], [-.5, -.5, .5], [.5, -.5, .5], [.5, .5, .5], [-.5, .5, .5]],
      [[0, 0, -1], [.5, -.5, -.5], [-.5, -.5, -.5], [-.5, .5, -.5], [.5, .5, -.5]],
      [[1, 0, 0], [.5, -.5, .5], [.5, -.5, -.5], [.5, .5, -.5], [.5, .5, .5]],
      [[-1, 0, 0], [-.5, -.5, -.5], [-.5, -.5, .5], [-.5, .5, .5], [-.5, .5, -.5]],
      [[0, 1, 0], [-.5, .5, .5], [.5, .5, .5], [.5, .5, -.5], [-.5, .5, -.5]],
      [[0, -1, 0], [-.5, -.5, -.5], [.5, -.5, -.5], [.5, -.5, .5], [-.5, -.5, .5]]];
    const uv = [[0, 0], [1, 0], [1, 1], [0, 1]];
    F.forEach((f, k) => { for (let j = 0; j < 4; j++) v.push(...f[j + 1], ...f[0], ...uv[j]); ix.push(k * 4, k * 4 + 1, k * 4 + 2, k * 4, k * 4 + 2, k * 4 + 3); });
    return new Geo(v, ix);
  },
  quad() { return new Geo([-.5, -.5, 0, 0, 0, 1, 0, 0, .5, -.5, 0, 0, 0, 1, 1, 0, .5, .5, 0, 0, 0, 1, 1, 1, -.5, .5, 0, 0, 0, 1, 0, 1], [0, 1, 2, 0, 2, 3]); },
  sph(lat = 12, lon = 20) {
    const v = [], ix = [];
    for (let a = 0; a <= lat; a++) { const th = a / lat * PI, st = Math.sin(th), ct = Math.cos(th); for (let b = 0; b <= lon; b++) { const ph = b / lon * 2 * PI, x = Math.cos(ph) * st, z = Math.sin(ph) * st; v.push(x, ct, z, x, ct, z, b / lon, a / lat); } }
    for (let a = 0; a < lat; a++)for (let b = 0; b < lon; b++) { const p = a * (lon + 1) + b, q = p + lon + 1; ix.push(p, q, p + 1, p + 1, q, q + 1); }
    return new Geo(v, ix);
  },
  frus(rt, seg = 18) {            // radius-1 bottom, radius rt top, height 1 (y -.5..+.5), capped
    const v = [], ix = []; const sl = (1 - rt); const nl = Math.hypot(1, sl);
    for (let b = 0; b <= seg; b++) { const a = b / seg * 2 * PI, c = Math.cos(a), s = Math.sin(a); v.push(c * rt, .5, s * rt, c / nl, sl / nl, s / nl, b / seg, 1); v.push(c, -.5, s, c / nl, sl / nl, s / nl, b / seg, 0); }
    for (let b = 0; b < seg; b++) { const p = b * 2; ix.push(p, p + 1, p + 2, p + 2, p + 1, p + 3); }
    let o = v.length / 8; v.push(0, .5, 0, 0, 1, 0, .5, .5); for (let b = 0; b <= seg; b++) { const a = b / seg * 2 * PI; v.push(Math.cos(a) * rt, .5, Math.sin(a) * rt, 0, 1, 0, .5 + Math.cos(a) * .5, .5 + Math.sin(a) * .5); }
    for (let b = 0; b < seg; b++)ix.push(o, o + 2 + b, o + 1 + b);
    o = v.length / 8; v.push(0, -.5, 0, 0, -1, 0, .5, .5); for (let b = 0; b <= seg; b++) { const a = b / seg * 2 * PI; v.push(Math.cos(a), -.5, Math.sin(a), 0, -1, 0, .5 + Math.cos(a) * .5, .5 + Math.sin(a) * .5); }
    for (let b = 0; b < seg; b++)ix.push(o, o + 1 + b, o + 2 + b);
    return new Geo(v, ix);
  },
  tor(tube = .1, a = 22, b = 8) {
    const v = [], ix = [];
    for (let i = 0; i <= a; i++) { const u = i / a * 2 * PI; for (let j = 0; j <= b; j++) { const w = j / b * 2 * PI, nx = Math.cos(w) * Math.cos(u), ny = Math.sin(w), nz = Math.cos(w) * Math.sin(u); v.push((1 + tube * Math.cos(w)) * Math.cos(u), tube * ny, (1 + tube * Math.cos(w)) * Math.sin(u), nx, ny, nz, i / a, j / b); } }
    for (let i = 0; i < a; i++)for (let j = 0; j < b; j++) { const p = i * (b + 1) + j, q = p + b + 1; ix.push(p, q, p + 1, p + 1, q, q + 1); }
    return new Geo(v, ix);
  }
};
function geo(kind, a, b, c) { const k = kind + ':' + [a, b, c].join(','); return geoCache[k] || (geoCache[k] = GEO[kind](a, b, c)); }
const G_BOX = () => geo('box'), G_QUAD = () => geo('quad'), G_SPH = () => geo('sph'), G_CYL = () => geo('frus', 1), G_CONE = () => geo('frus', 0);

/* ---------- textures ---------- */
class Tex { constructor(cv) { this.cv = cv; this.t = null; } }
function tex(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); fn(g, w, h); return new Tex(c); }

/* ---------- materials & nodes ---------- */
function M(hex, o) {
  o = o || {};
  return Object.assign({ c: L(hex), e: [0, 0, 0], a: 1, tex: null, sp: 0, mode: 0, rep: [1, 1], two: false, add: false, emTex: false, nofog: false }, o, o.e ? { e: o.e } : {});
}
class Node {
  constructor(g, m) { this.p = [0, 0, 0]; this.r = [0, 0, 0]; this.s = [1, 1, 1]; this.g = g || null; this.m = m || null; this.k = []; this.par = null; this.vis = true; this.W = new Float32Array(16); this.Lm = new Float32Array(16); this.bb = false; this.depthOff = 0; }
  add(n) { n.par = this; this.k.push(n); return n; }
  pos(x, y, z) { this.p[0] = x; this.p[1] = y; this.p[2] = z; return this; }
  rot(x, y, z) { this.r[0] = x; this.r[1] = y; this.r[2] = z; return this; }
  scl(x, y, z) { this.s[0] = x; this.s[1] = y === undefined ? x : y; this.s[2] = z === undefined ? x : z; return this; }
  update(pw) {
    compose(this.Lm, this.p, this.r, this.s);
    if (pw) mul(this.W, pw, this.Lm); else this.W.set(this.Lm);
    for (let i = 0; i < this.k.length; i++) this.k[i].update(this.W);
  }
}
const NODE_ID = new Float32Array(16);

/* ---------- renderer ---------- */
const VS = `attribute vec3 aP;attribute vec3 aN;attribute vec2 aU;
uniform mat4 uM;uniform mat4 uVP;uniform mat3 uNM;uniform vec2 uRep;
varying vec3 vW;varying vec3 vN;varying vec2 vU;varying vec3 vL;
void main(){vec4 w=uM*vec4(aP,1.0);vW=w.xyz;vN=uNM*aN;vU=aU*uRep;vL=aP;gl_Position=uVP*w;}`;
const FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec3 vW;varying vec3 vN;varying vec2 vU;varying vec3 vL;
uniform vec3 uCol,uEm,uCam,uFogC,uAmbS,uAmbG,uSunD,uSunC,uHor,uZen,uGlow;
uniform float uA,uSp,uFogD,uMode,uTex,uEmTex,uExp,uAO,uCeil,uNoFog,uGrain;
uniform vec3 uLP[8];uniform vec3 uLC[8];uniform float uLR[8];
uniform sampler2D uT;
vec3 aces(vec3 x){return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0);}
void main(){
  vec3 col;float a=uA;
  vec4 tx=vec4(1.0);
  if(uTex>0.5){tx=texture2D(uT,vU);tx.rgb=pow(tx.rgb,vec3(2.2));a*=tx.a;}
  if(uMode>1.5){col=uCol*tx.rgb+uEm*mix(vec3(1.0),tx.rgb,uEmTex);}
  else if(uMode>0.5){
    vec3 d=normalize(vL);float t=clamp(d.y,0.0,1.0);
    col=mix(uHor,uZen,pow(t,0.5));
    if(d.y<0.0)col=mix(uHor,uHor*0.55,clamp(-d.y*4.0,0.0,1.0));
    float s=max(dot(d,normalize(uSunD)),0.0);
    col+=uGlow*(pow(s,6.0)*0.35+pow(s,64.0)*0.8+pow(s,900.0)*14.0);
  } else {
    vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;
    vec3 V=normalize(uCam-vW);
    vec3 lit=mix(uAmbG,uAmbS,N.y*0.5+0.5);
    float sd=clamp((dot(N,normalize(uSunD))+0.2)/1.2,0.0,1.0);
    lit+=uSunC*sd;
    vec3 sp=vec3(0.0);
    if(uSp>0.0){vec3 H=normalize(normalize(uSunD)+V);sp+=uSunC*pow(max(dot(N,H),0.0),40.0)*uSp;}
    for(int i=0;i<8;i++){
      vec3 dl=uLP[i]-vW;float dist=length(dl);vec3 Ld=dl/max(dist,0.001);
      float att=1.0/(1.0+dist*dist*0.35)*clamp(1.0-dist/uLR[i],0.0,1.0);
      float df=clamp((dot(N,Ld)+0.25)/1.25,0.0,1.0);
      lit+=uLC[i]*df*att;
      if(uSp>0.0){vec3 H=normalize(Ld+V);sp+=uLC[i]*pow(max(dot(N,H),0.0),48.0)*uSp*att;}
    }
    if(uAO>0.5){lit*=mix(0.55,1.0,smoothstep(0.0,1.1,vW.y))*mix(1.0,0.62,smoothstep(uCeil-1.2,uCeil,vW.y));}
    col=uCol*tx.rgb*lit+sp+uEm*mix(vec3(1.0),tx.rgb,uEmTex);
  }
  if(uNoFog<0.5&&uMode<0.5){float dd=length(uCam-vW);float f=1.0-exp(-uFogD*uFogD*dd*dd);col=mix(col,uFogC,clamp(f,0.0,1.0));}
  col=aces(col*uExp);
  col=pow(col,vec3(1.0/2.2));
  col+=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-0.5)*uGrain;
  gl_FragColor=vec4(col,a);
}`;
class Renderer {
  constructor(canvas, preserve) {
    const gl = this.gl = canvas.getContext('webgl', { antialias: true, alpha: false, preserveDrawingBuffer: !!preserve, powerPreference: 'high-performance' });
    if (!gl) throw new Error('WebGL not available');
    this.cv = canvas;
    const mk = (t, s) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; };
    const pr = this.pr = gl.createProgram(); gl.attachShader(pr, mk(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    gl.useProgram(pr);
    this.U = {}; ['uM', 'uVP', 'uNM', 'uRep', 'uCol', 'uEm', 'uCam', 'uFogC', 'uAmbS', 'uAmbG', 'uSunD', 'uSunC', 'uHor', 'uZen', 'uGlow', 'uA', 'uSp', 'uFogD', 'uMode', 'uTex', 'uEmTex', 'uExp', 'uAO', 'uCeil', 'uNoFog', 'uGrain', 'uLP', 'uLC', 'uLR', 'uT'].forEach(n => this.U[n] = gl.getUniformLocation(pr, n));
    this.aP = gl.getAttribLocation(pr, 'aP'); this.aN = gl.getAttribLocation(pr, 'aN'); this.aU = gl.getAttribLocation(pr, 'aU');
    gl.enableVertexAttribArray(this.aP); gl.enableVertexAttribArray(this.aN); gl.enableVertexAttribArray(this.aU);
    gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK); gl.enable(gl.BLEND);
    this.VP = new Float32Array(16); this.P = new Float32Array(16); this.V = new Float32Array(16); this.nm = new Float32Array(9);
    this.lp = new Float32Array(24); this.lc = new Float32Array(24); this.lr = new Float32Array(8);
    this.white = null; this.drawn = 0;
    gl.uniform1i(this.U.uT, 0);
  }
  upload(t) {
    const gl = this.gl; t.t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t.t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, t.cv);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    const ext = gl.getExtension('EXT_texture_filter_anisotropic'); if (ext) gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 4);
  }
  buf(g) {
    if (g.buf) return; const gl = this.gl; g.buf = { v: gl.createBuffer(), i: gl.createBuffer() };
    gl.bindBuffer(gl.ARRAY_BUFFER, g.buf.v); gl.bufferData(gl.ARRAY_BUFFER, g.v, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g.buf.i); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g.i, gl.STATIC_DRAW);
  }
  resize() {
    const c = this.cv, d = Math.min(window.devicePixelRatio || 1, 1.75), w = Math.max(2, Math.round(c.clientWidth * d)), h = Math.max(2, Math.round(c.clientHeight * d));
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  }
  render(S, cam, time) {
    const gl = this.gl, U = this.U; this.resize();
    gl.viewport(0, 0, this.cv.width, this.cv.height);
    const asp = this.cv.width / this.cv.height;
    perspective(this.P, cam.f * PI / 180, asp, .05, 900);
    lookAt(this.V, cam.p, cam.l, cam.roll); mul(this.VP, this.P, this.V);
    const fc = S.fog.c; gl.clearColor(fc[0], fc[1], fc[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(U.uVP, false, this.VP); gl.uniform3fv(U.uCam, cam.p);
    gl.uniform3fv(U.uFogC, fc); gl.uniform1f(U.uFogD, S.fog.d);
    gl.uniform3fv(U.uAmbS, S.amb[0]); gl.uniform3fv(U.uAmbG, S.amb[1]);
    gl.uniform3fv(U.uSunD, S.sun.d); gl.uniform3fv(U.uSunC, S.sun.c);
    gl.uniform3fv(U.uHor, S.sky.hor); gl.uniform3fv(U.uZen, S.sky.zen); gl.uniform3fv(U.uGlow, S.sky.glow);
    gl.uniform1f(U.uExp, S.exp || 1); gl.uniform1f(U.uAO, S.ao ? 1 : 0); gl.uniform1f(U.uCeil, S.ao || 4); gl.uniform1f(U.uGrain, 0.018);
    this.lp.fill(0); this.lc.fill(0); this.lr.fill(1);
    const ls = S.lights.slice(0, 8);
    // nearest-to-camera lights first when more than 8
    if (S.lights.length > 8) { const q = S.lights.map(l => [Math.hypot(l.p[0] - cam.p[0], l.p[1] - cam.p[1], l.p[2] - cam.p[2]) - (l.r || 10) * .4, l]).sort((a, b) => a[0] - b[0]); for (let i = 0; i < 8; i++)ls[i] = q[i][1]; }
    ls.forEach((l, i) => { const k = l.k === undefined ? 1 : l.k; this.lp.set(l.p, i * 3); this.lc.set([l.c[0] * l.i * k, l.c[1] * l.i * k, l.c[2] * l.i * k], i * 3); this.lr[i] = l.r || 12; });
    gl.uniform3fv(U.uLP, this.lp); gl.uniform3fv(U.uLC, this.lc); gl.uniform1fv(U.uLR, this.lr);
    // gather
    const op = [], tr = []; const cp = cam.p;
    (function walk(n) {
      if (!n.vis) return;
      if (n.bb) { const dx = cp[0] - n.W[12], dy = cp[1] - n.W[13], dz = cp[2] - n.W[14]; n.r[1] = Math.atan2(dx, dz); n.r[0] = -Math.atan2(dy, Math.hypot(dx, dz)); }
      if (n.g && n.m) { (n.m.a < 1 || n.m.add ? tr : op).push(n); }
      for (let i = 0; i < n.k.length; i++) walk(n.k[i]);
    })(S.root);
    if (S.dome) { S.dome.p = cam.p.slice(); S.dome.update(null); gl.depthMask(false); gl.disable(gl.BLEND); this.draw(S.dome, cp); gl.depthMask(true); }
    gl.disable(gl.BLEND);
    for (const n of op) this.draw(n, cp);
    gl.enable(gl.BLEND); gl.depthMask(false);
    tr.forEach(n => n._d = Math.hypot(n.W[12] - cp[0], n.W[13] - cp[1], n.W[14] - cp[2]) + n.depthOff);
    tr.sort((a, b) => b._d - a._d);
    for (const n of tr) this.draw(n, cp);
    gl.depthMask(true);
  }
  draw(n, cp) {
    const gl = this.gl, U = this.U, m = n.m, g = n.g; this.buf(g);
    const W = n.W; gl.uniformMatrix4fv(U.uM, false, W);
    const a = W[0], b = W[1], c = W[2], d = W[4], e = W[5], f = W[6], h = W[8], i = W[9], j = W[10];
    const nm = this.nm;
    // cofactor matrix of the upper 3x3 (column-major uniform)
    const m00 = a, m10 = b, m20 = c, m01 = d, m11 = e, m21 = f, m02 = h, m12 = i, m22 = j; // M(row,col)
    const c00 = m11 * m22 - m12 * m21, c01 = -(m10 * m22 - m12 * m20), c02 = m10 * m21 - m11 * m20;
    const c10 = -(m01 * m22 - m02 * m21), c11 = m00 * m22 - m02 * m20, c12 = -(m00 * m21 - m01 * m20);
    const c20 = m01 * m12 - m02 * m11, c21 = -(m00 * m12 - m02 * m10), c22 = m00 * m11 - m01 * m10;
    nm[0] = c00; nm[1] = c10; nm[2] = c20; nm[3] = c01; nm[4] = c11; nm[5] = c21; nm[6] = c02; nm[7] = c12; nm[8] = c22;
    gl.uniformMatrix3fv(U.uNM, false, nm);
    gl.uniform3fv(U.uCol, m.c); gl.uniform3fv(U.uEm, m.e); gl.uniform1f(U.uA, m.a); gl.uniform1f(U.uSp, m.sp);
    gl.uniform1f(U.uMode, m.mode); gl.uniform2fv(U.uRep, m.rep); gl.uniform1f(U.uEmTex, m.emTex ? 1 : 0); gl.uniform1f(U.uNoFog, m.nofog ? 1 : 0);
    if (m.tex) { if (!m.tex.t) this.upload(m.tex); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, m.tex.t); gl.uniform1f(U.uTex, 1); } else gl.uniform1f(U.uTex, 0);
    if (m.two) gl.disable(gl.CULL_FACE); else gl.enable(gl.CULL_FACE);
    if (m.a < 1 || m.add) gl.blendFunc(gl.SRC_ALPHA, m.add ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);
    gl.bindBuffer(gl.ARRAY_BUFFER, g.buf.v); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g.buf.i);
    gl.vertexAttribPointer(this.aP, 3, gl.FLOAT, false, 32, 0); gl.vertexAttribPointer(this.aN, 3, gl.FLOAT, false, 32, 12); gl.vertexAttribPointer(this.aU, 2, gl.FLOAT, false, 32, 24);
    gl.drawElements(gl.TRIANGLES, g.i.length, gl.UNSIGNED_SHORT, 0);
  }
}

G.E = { PI, clamp, lerp, sm, ramp, rng, rgb, lin, L, M, Node, Tex, tex, geo, Renderer, G_BOX, G_QUAD, G_SPH, G_CYL, G_CONE };
})(window);
