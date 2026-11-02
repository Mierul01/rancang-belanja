// Draws the app icon as PNGs using only Node built-ins: a white budget card with rising green
// bars and a gold coin, in front of a tilted gold card, on a deep green gradient.
// The view-only demo (docs/) gets the same art on violet, so the two are easy to tell apart.
// Shapes are signed-distance functions sampled 4x4 per pixel for smooth edges.
// Usage: node make-icons.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// Signed distance to a rounded rectangle (centre, half size, corner radius, rotation in degrees).
function sdBox(x, y, cx, cy, hw, hh, r, deg) {
  let px = x - cx, py = y - cy;
  if (deg) { const a = -deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); [px, py] = [px * c - py * s, px * s + py * c]; }
  const qx = Math.abs(px) - hw + r, qy = Math.abs(py) - hh + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}
const sdCircle = (x, y, cx, cy, r) => Math.hypot(x - cx, y - cy) - r;

const BACKGROUNDS = {
  real: ['#06321F', '#1C8A55', '#2FBF7A'],
  demo: ['#15123D', '#3B3A9E', '#7B6CF0']
};
let BG = BACKGROUNDS.real.map(hex);

const C = {
  goldA: hex('#FFE29A'), goldB: hex('#E0A031'), goldC: hex('#B9781A'),
  card: hex('#FFFFFF'), card2: hex('#E3F4EA'),
  barA: hex('#17905A'), barB: hex('#38C985'), ink: hex('#0E4A30')
};

// Colour of one sample point in the 512 design space.
function shade(x, y) {
  // Background: diagonal green gradient, light bloom top-left, warm glow bottom-right.
  const g = clamp((x * 0.55 + (512 - y) * 0.45) / 512, 0, 1);
  let col = g < 0.6 ? mix(BG[0], BG[1], g / 0.6) : mix(BG[1], BG[2], (g - 0.6) / 0.4);
  col = mix(col, [255, 255, 255], 0.16 * Math.max(0, 1 - Math.hypot(x - 110, y - 70) / 300));
  col = mix(col, C.goldA, 0.14 * Math.max(0, 1 - Math.hypot(x - 470, y - 470) / 260));

  const over = (c, a) => { col = mix(col, c, clamp(a, 0, 1)); };

  // Back card: tilted gold, with a soft shadow and a dark stripe.
  const back = sdBox(x, y, 290, 206, 122, 78, 30, -14);
  over([0, 20, 10], 0.32 * (1 - smooth(-4, 26, sdBox(x, y - 12, 290, 206, 122, 78, 30, -14))));
  if (back < 0.5) {
    let c = mix(C.goldA, C.goldB, clamp((y - 120) / 180, 0, 1));
    const stripe = sdBox(x, y, 290, 180, 122, 13, 0, -14);
    if (stripe < 0.5 && back < -1) c = mix(c, C.goldC, 0.55 * clamp(0.5 - stripe, 0, 1));
    over(c, 0.5 - back);
  }

  // Front card: white with a long soft shadow.
  over([0, 30, 15], 0.38 * (1 - smooth(-6, 34, sdBox(x, y - 20, 246, 304, 150, 98, 36, 0))));
  const front = sdBox(x, y, 246, 304, 150, 98, 36, 0);
  if (front < 0.5) {
    over(mix(C.card, C.card2, clamp((y - 206) / 196, 0, 1)), 0.5 - front);
    // Rising bars.
    [[150, 46], [196, 74], [242, 106]].forEach(([bx, h]) => {
      const d = sdBox(x, y, bx, 366 - h / 2, 15, h / 2, 9, 0);
      if (d < 0.5) over(mix(C.barB, C.barA, clamp((y - (366 - h)) / h, 0, 1)), 0.5 - d);
    });
    // Gold coin with an inner ring.
    const coin = sdCircle(x, y, 334, 262, 34);
    over([0, 40, 20], 0.18 * (1 - smooth(-2, 10, sdCircle(x, y - 5, 334, 262, 34))));
    if (coin < 0.5) {
      over(mix(C.goldA, C.goldB, clamp((y - 228) / 68, 0, 1)), 0.5 - coin);
      const ring = Math.abs(sdCircle(x, y, 334, 262, 21)) - 3;
      if (ring < 0.5) over(C.goldC, (0.5 - ring) * 0.8);
    }
    // Thin line under the bars.
    const base = sdBox(x, y, 220, 376, 92, 2.5, 2.5, 0);
    if (base < 0.5) over(C.ink, (0.5 - base) * 0.18);
  }
  return col;
}

function draw(size) {
  const s = 512 / size, N = 4;
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const acc = [0, 0, 0];
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const c = shade((x + (i + 0.5) / N) * s, (y + (j + 0.5) / N) * s);
        acc[0] += c[0]; acc[1] += c[1]; acc[2] += c[2];
      }
      const o = y * (size * 3 + 1) + 1 + x * 3;
      for (let k = 0; k < 3; k++) raw[o + k] = Math.round(clamp(acc[k] / (N * N), 0, 255));
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))
  ]);
}

const svg = fs.readFileSync(path.join(__dirname, 'public', 'icon.svg'), 'utf8');
for (const [kind, dir] of [['real', 'public'], ['demo', 'docs']]) {
  BG = BACKGROUNDS[kind].map(hex);
  fs.mkdirSync(path.join(__dirname, dir), { recursive: true });
  for (const [size, name] of [[180, 'apple-touch-icon.png'], [192, 'icon-192.png'], [512, 'icon-512.png']]) {
    fs.writeFileSync(path.join(__dirname, dir, name), draw(size));
    console.log(dir + '/' + name);
  }
  if (kind === 'demo') {
    const out = BACKGROUNDS.real.reduce((t, c, i) => t.split(c).join(BACKGROUNDS.demo[i]), svg);
    fs.writeFileSync(path.join(__dirname, dir, 'icon.svg'), out);
  }
}
