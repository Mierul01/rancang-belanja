// Draws the app icon (wallet mark on navy) as PNGs using only Node built-ins.
// Usage: node make-icons.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const NAVY = [0x16, 0x20, 0x3d];
const GOLD = [0xf2, 0xb5, 0x44];

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

// Signed distance to a rounded rectangle centred at (cx, cy).
function sdRoundRect(x, y, cx, cy, hw, hh, r) {
  const qx = Math.abs(x - cx) - hw + r, qy = Math.abs(y - cy) - hh + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

function draw(size) {
  // Design space is 512; the mark sits inside the maskable safe zone.
  const s = size / 512, stroke = 26 * s;
  const cx = 256 * s, cy = 256 * s, hw = 148 * s, hh = 106 * s, rad = 42 * s;
  const lineY = 214 * s, dotX = 326 * s, dotY = 292 * s, dotR = 23 * s;
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const px = x + 0.5, py = y + 0.5;
      const d = sdRoundRect(px, py, cx, cy, hw, hh, rad);
      let cov = Math.max(0, Math.min(1, stroke / 2 - Math.abs(d) + 0.5));
      const inside = d < 0 && px > cx - hw && px < cx + hw;
      if (inside) cov = Math.max(cov, Math.max(0, Math.min(1, stroke / 2 - Math.abs(py - lineY) + 0.5)));
      cov = Math.max(cov, Math.max(0, Math.min(1, dotR - Math.hypot(px - dotX, py - dotY) + 0.5)));
      const o = y * (size * 3 + 1) + 1 + x * 3;
      for (let i = 0; i < 3; i++) raw[o + i] = Math.round(NAVY[i] + (GOLD[i] - NAVY[i]) * cov);
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

for (const size of [192, 512]) {
  fs.writeFileSync(path.join(__dirname, 'public', `icon-${size}.png`), draw(size));
  console.log(`public/icon-${size}.png`);
}
