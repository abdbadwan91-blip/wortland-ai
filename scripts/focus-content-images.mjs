/**
 * Full-subject square crops for public/content/**.
 * Source: /workspace/content-originals → overwrite public/content (512×512).
 * Crop tightly around the FULL subject bbox + ~6% margin. Nothing cut off.
 * If needed square exceeds image bounds, pad with edge/background color.
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from '/home/box/sand-host/node_modules/@napi-rs/canvas/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = '/workspace/content-originals';
const DST = path.join(ROOT, 'public/content');
const SHOTS = '/workspace/shots';
const OUT_SIZE = 512;
const MARGIN = 0.06; // 6%

function listPngs(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listPngs(p));
    else if (ent.name.endsWith('.png')) out.push(p);
  }
  return out;
}

function avgPatch(data, w, h, ch, x0, y0, size) {
  let r = 0, g = 0, b = 0, n = 0;
  for (let y = y0; y < y0 + size && y < h; y++) {
    for (let x = x0; x < x0 + size && x < w; x++) {
      const i = (y * w + x) * ch;
      r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
    }
  }
  return [r / n, g / n, b / n];
}

function colorDist(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
}

/** Flood-fill from edges; subject = not background. Soft bottom shadow soft-trimmed. */
function detectBBox(data, w, h, channels) {
  const patch = 24;
  const corners = [
    avgPatch(data, w, h, channels, 0, 0, patch),
    avgPatch(data, w, h, channels, w - patch, 0, patch),
    avgPatch(data, w, h, channels, 0, h - patch, patch),
    avgPatch(data, w, h, channels, w - patch, h - patch, patch),
  ];
  const bgTol = 36;
  const expected = (x, y) => {
    const wx = x / (w - 1);
    const wy = y / (h - 1);
    const top = [
      corners[0][0] * (1 - wx) + corners[1][0] * wx,
      corners[0][1] * (1 - wx) + corners[1][1] * wx,
      corners[0][2] * (1 - wx) + corners[1][2] * wx,
    ];
    const bot = [
      corners[2][0] * (1 - wx) + corners[3][0] * wx,
      corners[2][1] * (1 - wx) + corners[3][1] * wx,
      corners[2][2] * (1 - wx) + corners[3][2] * wx,
    ];
    return [
      top[0] * (1 - wy) + bot[0] * wy,
      top[1] * (1 - wy) + bot[1] * wy,
      top[2] * (1 - wy) + bot[2] * wy,
    ];
  };
  const isBg = (x, y) => {
    const i = (y * w + x) * channels;
    return colorDist([data[i], data[i + 1], data[i + 2]], expected(x, y)) < bgTol;
  };

  const bg = new Uint8Array(w * h);
  const stack = [];
  const push = (x, y) => {
    const idx = y * w + x;
    if (bg[idx] || !isBg(x, y)) return;
    bg[idx] = 1;
    stack.push(x, y);
  };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    if (x > 0) push(x - 1, y);
    if (x + 1 < w) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y + 1 < h) push(x, y + 1);
  }

  // Strong subject pixels (exclude soft shadow fringe)
  let minX = w, minY = h, maxX = 0, maxY = 0, count = 0;
  const strong = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (bg[y * w + x]) continue;
      const i = (y * w + x) * channels;
      const d = colorDist([data[i], data[i + 1], data[i + 2]], expected(x, y));
      if (d < bgTol + 10) continue; // soft fringe/shadow
      strong[y * w + x] = 1;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      count++;
    }
  }
  if (count < 80) {
    return {
      x: Math.floor(w * 0.28), y: Math.floor(h * 0.1),
      w: Math.floor(w * 0.44), h: Math.floor(h * 0.75),
      bgColor: corners[0],
    };
  }

  // Recover feet: extend bottom into soft-shadow band if nearby non-bg exists
  // (don't cut feet) — scan a few rows below maxY for denser subject pixels with looser tol
  let footY = maxY;
  for (let y = maxY + 1; y < Math.min(h, maxY + Math.floor(h * 0.08)); y++) {
    let hits = 0;
    for (let x = minX; x <= maxX; x++) {
      if (bg[y * w + x]) continue;
      const i = (y * w + x) * channels;
      if (colorDist([data[i], data[i + 1], data[i + 2]], expected(x, y)) >= bgTol + 4) hits++;
    }
    if (hits > (maxX - minX) * 0.04) footY = y;
    else break;
  }
  maxY = footY;

  // Tiny inward shrink only on sides to drop halo — keep top/bottom for ears/feet
  const padInX = Math.round((maxX - minX) * 0.01);
  minX = Math.min(minX + padInX, maxX - 4);
  maxX = Math.max(maxX - padInX, minX + 4);

  return {
    x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1,
    bgColor: [
      (corners[0][0] + corners[1][0] + corners[2][0] + corners[3][0]) / 4,
      (corners[0][1] + corners[1][1] + corners[2][1] + corners[3][1]) / 4,
      (corners[0][2] + corners[1][2] + corners[2][2] + corners[3][2]) / 4,
    ],
  };
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

async function processOne(srcPath) {
  const rel = path.relative(SRC, srcPath).replace(/\\/g, '/');
  const topic = rel.split('/')[0];

  const { data, info } = await sharp(srcPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels } = info;
  const bbox = detectBBox(data, w, h, channels);

  const pad = Math.max(bbox.w, bbox.h) * MARGIN;
  const cx = bbox.x + bbox.w / 2;
  const cy = bbox.y + bbox.h / 2;
  let side = Math.max(bbox.w, bbox.h) + pad * 2;

  // Ideal square centered on subject; pad with bg if it exceeds image bounds
  const bg = {
    r: Math.round(clamp(bbox.bgColor[0], 0, 255)),
    g: Math.round(clamp(bbox.bgColor[1], 0, 255)),
    b: Math.round(clamp(bbox.bgColor[2], 0, 255)),
    alpha: 1,
  };
  const desiredLeft = cx - side / 2;
  const desiredTop = cy - side / 2;
  const srcLeft = Math.max(0, Math.floor(desiredLeft));
  const srcTop = Math.max(0, Math.floor(desiredTop));
  const srcRight = Math.min(w, Math.ceil(desiredLeft + side));
  const srcBottom = Math.min(h, Math.ceil(desiredTop + side));
  const extractW = Math.max(1, srcRight - srcLeft);
  const extractH = Math.max(1, srcBottom - srcTop);
  const padLeft = Math.max(0, Math.round(srcLeft - desiredLeft));
  const padTop = Math.max(0, Math.round(srcTop - desiredTop));
  const padRight = Math.max(0, Math.round((desiredLeft + side) - srcRight));
  const padBottom = Math.max(0, Math.round((desiredTop + side) - srcBottom));

  const dest = path.join(DST, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });

  await sharp(srcPath)
    .extract({ left: srcLeft, top: srcTop, width: extractW, height: extractH })
    .extend({ left: padLeft, top: padTop, right: padRight, bottom: padBottom, background: bg })
    .resize(OUT_SIZE, OUT_SIZE, { fit: 'fill' })
    .png({ compressionLevel: 9, quality: 90 })
    .toFile(dest);

  return {
    rel, topic, bbox,
    side: Math.round(side),
    left: Math.round(desiredLeft),
    top: Math.round(desiredTop),
  };
}

async function contactSheet(results, outPath, cols = 5, cell = 160) {
  const rows = Math.ceil(results.length / cols);
  const canvas = createCanvas(cols * cell, rows * cell);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const x = (i % cols) * cell;
    const y = Math.floor(i / cols) * cell;
    try {
      const im = await loadImage(path.join(DST, r.rel));
      ctx.drawImage(im, x + 4, y + 4, cell - 8, cell - 28);
    } catch { /* */ }
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '11px sans-serif';
    ctx.fillText(r.rel.replace('.png', ''), x + 6, y + cell - 10);
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
  console.log('wrote', outPath);
}

const files = listPngs(SRC).sort();
console.log('processing', files.length, 'full-subject crops');
const results = [];
for (const f of files) {
  try {
    const r = await processOne(f);
    results.push(r);
    console.log('ok', r.rel, `bbox=${r.bbox.w}x${r.bbox.h}@${r.bbox.x},${r.bbox.y}`, `sq=${r.side}@${r.left},${r.top}`);
  } catch (e) {
    console.error('FAIL', path.relative(SRC, f), e.message);
  }
}
fs.mkdirSync(SHOTS, { recursive: true });
const byTopic = {};
for (const r of results) (byTopic[r.topic] ||= []).push(r);
for (const [topic, list] of Object.entries(byTopic)) {
  await contactSheet(list, path.join(SHOTS, `crops-contact-${topic}.png`), 5, 160);
}
await contactSheet(results, path.join(SHOTS, 'crops-contact-all.png'), 10, 120);
console.log('done', results.length, '/', files.length);
