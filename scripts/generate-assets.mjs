// ═══════════════════════════════════════════════════════════════════════════════
// scripts/generate-assets.mjs
// Generates all PWA icons + screenshots into public/ using a zero-dependency
// PNG encoder (pure Node: zlib + manual CRC32).
// Run: node scripts/generate-assets.mjs
// ═══════════════════════════════════════════════════════════════════════════════

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const iconsDir = join(publicDir, 'icons');
const shotsDir = join(publicDir, 'screenshots');

// ─── PNG encoder ───────────────────────────────────────────────────────────────
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  // compression=0, filter=0, interlace=0 (already zero)

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// ─── Drawing helpers ──────────────────────────────────────────────────────────
function makeCanvas(w, h) {
  return { w, h, data: Buffer.alloc(w * h * 4) };
}

function setPx(c, x, y, [r, g, b, a = 255]) {
  if (x < 0 || y < 0 || x >= c.w || y >= c.h) return;
  const i = (y * c.w + x) * 4;
  c.data[i] = r;
  c.data[i + 1] = g;
  c.data[i + 2] = b;
  c.data[i + 3] = a;
}

function fillRect(c, x0, y0, w, h, color) {
  for (let y = y0; y < y0 + h; y++)
    for (let x = x0; x < x0 + w; x++) setPx(c, x, y, color);
}

function inRoundedRect(x, y, w, h, r) {
  const left = r, right = w - r, top = r, bottom = h - r;
  if (x < left || x > right || y < top || y > bottom) {
    const cx = x < left ? left : right;
    const cy = y < top ? top : bottom;
    const dx = x - cx, dy = y - cy;
    if (dx * dx + dy * dy > r * r) return false;
  }
  return x >= 0 && y >= 0 && x < w && y < h;
}

function fillRoundedRect(c, x0, y0, w, h, r, color) {
  for (let y = y0; y < y0 + h; y++)
    for (let x = x0; x < x0 + w; x++) {
      if (inRoundedRect(x - x0, y - y0, w, h, r)) setPx(c, x, y, color);
    }
}

function inTeardrop(x, y, cx, cy, r) {
  const cdx = x - cx;
  const cdy = y - (cy + r * 0.35);
  if (cdx * cdx + cdy * cdy <= r * r) return true;
  const apexY = cy - r * 1.4;
  const baseY = cy + r * 0.35;
  if (y >= apexY && y <= baseY) {
    const t = (y - apexY) / (baseY - apexY);
    const halfW = r * 0.95 * t;
    if (Math.abs(x - cx) <= halfW) return true;
  }
  return false;
}

// ─── Icon drawing ─────────────────────────────────────────────────────────────
const INDIGO = [99, 102, 241, 255];     // #6366f1
const INDIGO_DARK = [67, 56, 202, 255]; // #4338ca
const WHITE = [255, 255, 255, 255];

function drawIcon(size, maskable) {
  const c = makeCanvas(size, size);
  const radius = maskable ? 0 : size * 0.2;
  const pad = maskable ? size * 0.1 : 0;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const t = y / size;
      const r = Math.round(INDIGO[0] + (INDIGO_DARK[0] - INDIGO[0]) * t);
      const g = Math.round(INDIGO[1] + (INDIGO_DARK[1] - INDIGO[1]) * t);
      const b = Math.round(INDIGO[2] + (INDIGO_DARK[2] - INDIGO[2]) * t);
      const inside = maskable
        ? x >= pad && y >= pad && x < size - pad && y < size - pad
        : inRoundedRect(x, y, size, size, radius);
      if (inside) setPx(c, x, y, [r, g, b, 255]);
    }
  }

  const cx = size / 2;
  const cy = size * 0.58;
  const dropR = size * 0.17;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (inTeardrop(x, y, cx, cy, dropR)) setPx(c, x, y, WHITE);
    }
  }
  return c;
}

function writePng(name, canvas) {
  const path = join(iconsDir, name);
  writeFileSync(path, encodePng(canvas.w, canvas.h, canvas.data));
  console.log(`  ✓ ${name} (${canvas.w}x${canvas.h})`);
}
// ─── Screenshot mockups ───────────────────────────────────────────────────────
const SLATE_900 = [15, 23, 42, 255];    // #0f172a
const SLATE_800 = [30, 41, 59, 255];    // #1e293b
const SLATE_700 = [51, 65, 85, 255];    // #334155
const SLATE_400 = [148, 163, 184, 255]; // #94a3b8

function drawScreenshotWide() {
  const w = 1280, h = 720;
  const c = makeCanvas(w, h);
  fillRect(c, 0, 0, w, h, SLATE_900);

  // sidebar
  fillRect(c, 0, 0, 220, h, SLATE_800);
  fillRoundedRect(c, 24, 24, 172, 20, 6, INDIGO);
  const items = [40, 80, 120, 160];
  for (const y of items) fillRoundedRect(c, 24, y, 150, 14, 5, SLATE_700);

  // header
  fillRect(c, 220, 0, w - 220, 64, SLATE_800);
  fillRoundedRect(c, 250, 22, 300, 20, 6, SLATE_700);
  fillRoundedRect(c, w - 120, 16, 96, 32, 8, INDIGO);

  // note cards
  const cards = [
    [250, 96, 380, 200],
    [650, 96, 380, 200],
    [250, 316, 380, 200],
    [650, 316, 380, 200],
  ];
  for (const [x, y, cw, ch] of cards) {
    fillRoundedRect(c, x, y, cw, ch, 12, SLATE_800);
    fillRoundedRect(c, x + 20, y + 20, cw - 40, 16, 5, SLATE_400);
    fillRoundedRect(c, x + 20, y + 52, cw - 40, 10, 4, SLATE_700);
    fillRoundedRect(c, x + 20, y + 72, cw - 80, 10, 4, SLATE_700);
    fillRoundedRect(c, x + 20, y + 92, cw - 60, 10, 4, SLATE_700);
  }
  return c;
}

function drawScreenshotNarrow() {
  const w = 390, h = 844;
  const c = makeCanvas(w, h);
  fillRect(c, 0, 0, w, h, SLATE_900);

  fillRect(c, 0, 0, w, 64, SLATE_800);
  fillRoundedRect(c, 16, 16, 200, 20, 6, INDIGO);
  fillRoundedRect(c, w - 96, 16, 80, 32, 8, INDIGO);

  const cards = [90, 210, 330, 450, 570];
  for (const y of cards) {
    fillRoundedRect(c, 16, y, w - 32, 100, 12, SLATE_800);
    fillRoundedRect(c, 36, y + 20, 200, 14, 5, SLATE_400);
    fillRoundedRect(c, 36, y + 48, 240, 10, 4, SLATE_700);
    fillRoundedRect(c, 36, y + 66, 160, 10, 4, SLATE_700);
  }
  return c;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
mkdirSync(iconsDir, { recursive: true });
mkdirSync(shotsDir, { recursive: true });

console.log('Generating PWA assets...');

writePng('icon-192.png', drawIcon(192, false));
writePng('icon-512.png', drawIcon(512, false));
writePng('icon-maskable-512.png', drawIcon(512, true));
writePng('apple-touch-icon.png', drawIcon(180, false));
writePng('favicon-32.png', drawIcon(32, false));
writePng('shortcut-note.png', drawIcon(96, false));
writePng('shortcut-sketch.png', drawIcon(96, false));

writeFileSync(join(shotsDir, 'hero-wide.png'), encodePng(1280, 720, drawScreenshotWide().data));
console.log('  ✓ hero-wide.png (1280x720)');
writeFileSync(join(shotsDir, 'hero-narrow.png'), encodePng(390, 844, drawScreenshotNarrow().data));
console.log('  ✓ hero-narrow.png (390x844)');

console.log('Done.');