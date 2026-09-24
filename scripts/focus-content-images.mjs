/**
 * Crop public/content/** so subjects fill the frame.
 * Living: head→mid-body square. Objects: tight square + margin.
 * Source: /workspace/content-originals → public/content
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

const LIVING_TOPICS = new Set(['tiere', 'familie', 'koerper', 'arbeit']);

const OVERRIDES = {
  'tiere/elefant': { kind: 'living', headPadTop: 0.0, bodyFrac: 0.48 },
  'tiere/schlange': { kind: 'living', headPadTop: 0.1, bodyFrac: 0.75 },
  'tiere/fisch': { kind: 'living', headPadTop: 0.12, bodyFrac: 0.88 },
  'tiere/biene': { kind: 'living', headPadTop: 0.05, bodyFrac: 0.7 },
  'tiere/schildkroete': { kind: 'living', headPadTop: 0.02, bodyFrac: 0.55, shiftX: 0.08 },
  'tiere/frosch': { kind: 'living', headPadTop: 0.05, bodyFrac: 0.68 },
  'tiere/maus': { kind: 'living', headPadTop: 0.03, bodyFrac: 0.62 },
  'tiere/vogel': { kind: 'living', headPadTop: 0.02, bodyFrac: 0.48 },
  'tiere/ente': { kind: 'living', headPadTop: 0.02, bodyFrac: 0.48 },
  'tiere/huhn': { kind: 'living', headPadTop: 0.03, bodyFrac: 0.58 },
  'tiere/pferd': { kind: 'living', headPadTop: 0.0, bodyFrac: 0.42, shiftX: 0.05 },
  'tiere/kuh': { kind: 'living', headPadTop: 0.02, bodyFrac: 0.52 },
  'tiere/schwein': { kind: 'living', headPadTop: 0.04, bodyFrac: 0.6 },
  'tiere/schaf': { kind: 'living', headPadTop: 0.03, bodyFrac: 0.55 },
  'tiere/hund': { kind: 'living', headPadTop: 0.03, bodyFrac: 0.55 },
  'tiere/katze': { kind: 'living', headPadTop: 0.03, bodyFrac: 0.55 },
  'tiere/hase': { kind: 'living', headPadTop: 0.0, bodyFrac: 0.52 },
  'tiere/loewe': { kind: 'living', headPadTop: 0.02, bodyFrac: 0.52 },
  'tiere/baer': { kind: 'living', headPadTop: 0.03, bodyFrac: 0.55 },
  'tiere/affe': { kind: 'living', headPadTop: 0.03, bodyFrac: 0.55 },
  'familie/familie': { kind: 'object', margin: 0.04 },
  'familie/baby': { kind: 'living', headPadTop: 0.04, bodyFrac: 0.68 },
  'koerper/auge': { kind: 'object', margin: 0.1 },
  'koerper/nase': { kind: 'object', margin: 0.1 },
  'koerper/mund': { kind: 'object', margin: 0.1 },
  'koerper/ohr': { kind: 'object', margin: 0.1 },
  'koerper/zahn': { kind: 'object', margin: 0.1 },
  'koerper/hand': { kind: 'object', margin: 0.08 },
  'koerper/fuss': { kind: 'object', margin: 0.08 },
  'koerper/finger': { kind: 'object', margin: 0.08 },
  'koerper/arm': { kind: 'object', margin: 0.06 },
  'koerper/bein': { kind: 'object', margin: 0.06 },
  'koerper/bauch': { kind: 'object', margin: 0.06 },
  'koerper/ruecken': { kind: 'object', margin: 0.06 },
  'koerper/kopf': { kind: 'living', headPadTop: 0.05, bodyFrac: 0.85 },
  'koerper/gesicht': { kind: 'living', headPadTop: 0.05, bodyFrac: 0.85 },
  'koerper/haar': { kind: 'living', headPadTop: 0.02, bodyFrac: 0.7 },
};

function listPngs(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listPngs(p));
    else if (ent.name.endsWith('.png')) out.push(p);
  }
  return out;
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

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

/** Flood-fill from corners: mark bg, remainder = subject. */
function detectBBox(data, w, h, channels) {
  const patch = 24;
  const corners = [
    avgPatch(data, w, h, channels, 0, 0, patch),
    avgPatch(data, w, h, channels, w - patch, 0, patch),
    avgPatch(data, w, h, channels, 0, h - patch, patch),
    avgPatch(data, w, h, channels, w - patch, h - patch, patch),
  ];
  const bgTol = 38;
  const isBg = (x, y) => {
    const i = (y * w + x) * channels;
    const px = [data[i], data[i + 1], data[i + 2]];
    // Compare to nearest corner by position weight
    const wx = x / (w - 1);
    const wy = y / (h - 1);
    // Bilinear mix of corners as expected bg
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
    const exp = [
      top[0] * (1 - wy) + bot[0] * wy,
      top[1] * (1 - wy) + bot[1] * wy,
      top[2] * (1 - wy) + bot[2] * wy,
    ];
    return colorDist(px, exp) < bgTol;
  };

  // Flood fill bg from edges
  const bg = new Uint8Array(w * h);
  const stack = [];
  const push = (x, y) => {
    const idx = y * w + x;
    if (bg[idx]) return;
    if (!isBg(x, y)) return;
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

  // Subject = not bg; ignore very bottom soft shadow band by requiring density
  let minX = w, minY = h, maxX = 0, maxY = 0, count = 0;
  const yMax = Math.floor(h * 0.94);
  for (let y = 0; y < yMax; y++) {
    for (let x = 0; x < w; x++) {
      if (bg[y * w + x]) continue;
      // Skip near-bg soft pixels (shadow): check local strength
      const i = (y * w + x) * channels;
      const px = [data[i], data[i + 1], data[i + 2]];
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
      const exp = [
        top[0] * (1 - wy) + bot[0] * wy,
        top[1] * (1 - wy) + bot[1] * wy,
        top[2] * (1 - wy) + bot[2] * wy,
      ];
      if (colorDist(px, exp) < bgTol + 12) continue; // soft fringe/shadow
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      count++;
    }
  }
  if (count < 80) {
    return { x: Math.floor(w * 0.32), y: Math.floor(h * 0.12), w: Math.floor(w * 0.36), h: Math.floor(h * 0.7) };
  }
  // Shrink bbox slightly to ignore soft halo
  const padIn = Math.round(Math.min(maxX - minX, maxY - minY) * 0.02);
  minX = Math.min(minX + padIn, maxX - 4);
  minY = Math.min(minY + padIn, maxY - 4);
  maxX = Math.max(maxX - padIn, minX + 4);
  maxY = Math.max(maxY - padIn, minY + 4);
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

function livingCrop(bbox, imgW, imgH, opt) {
  const headPadTop = opt.headPadTop ?? 0.04;
  const bodyFrac = opt.bodyFrac ?? 0.58;
  const shiftX = opt.shiftX ?? 0;
  const top = bbox.y - bbox.h * headPadTop;
  const height = Math.max(8, bbox.h * bodyFrac);
  // Prefer face-fill: side ≈ upper-body height, only widen a bit for ears (not full animal width)
  let side = Math.max(height, Math.min(bbox.w * 0.62, height * 1.15));
  side = Math.min(side, imgW, imgH);
  const cx = bbox.x + bbox.w / 2 + bbox.w * shiftX;
  let left = cx - side / 2;
  let up = top;
  left = clamp(left, 0, imgW - side);
  up = clamp(up, 0, imgH - side);
  return {
    left: Math.round(left),
    top: Math.round(up),
    width: Math.round(side),
    height: Math.round(side),
  };
}

function objectCrop(bbox, imgW, imgH, opt) {
  const margin = opt.margin ?? 0.06;
  const pad = Math.max(bbox.w, bbox.h) * margin;
  const cx = bbox.x + bbox.w / 2;
  const cy = bbox.y + bbox.h / 2;
  let side = Math.max(bbox.w, bbox.h) + pad * 2;
  side = Math.min(side, imgW, imgH);
  let left = cx - side / 2;
  let top = cy - side / 2;
  left = clamp(left, 0, imgW - side);
  top = clamp(top, 0, imgH - side);
  return {
    left: Math.round(left),
    top: Math.round(top),
    width: Math.round(side),
    height: Math.round(side),
  };
}

async function processOne(srcPath) {
  const rel = path.relative(SRC, srcPath).replace(/\\/g, '/');
  const topic = rel.split('/')[0];
  const key = rel.replace(/\.png$/, '');
  const opt = { ...(OVERRIDES[key] || {}) };
  const kind = opt.kind || (LIVING_TOPICS.has(topic) ? 'living' : 'object');

  const { data, info } = await sharp(srcPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels } = info;
  const bbox = detectBBox(data, w, h, channels);
  let region = kind === 'living' ? livingCrop(bbox, w, h, opt) : objectCrop(bbox, w, h, opt);
  region.width = Math.min(region.width, w - region.left);
  region.height = Math.min(region.height, h - region.top);
  if (region.width < 16 || region.height < 16) throw new Error(`bad region ${JSON.stringify(region)} bbox=${JSON.stringify(bbox)}`);

  const dest = path.join(DST, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(srcPath)
    .extract(region)
    .resize(OUT_SIZE, OUT_SIZE, { fit: 'cover' })
    .png({ compressionLevel: 9, quality: 90 })
    .toFile(dest);
  return { rel, kind, bbox, region, topic };
}

async function contactSheet(results, outPath, cols = 8, cell = 140) {
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
console.log('processing', files.length);
const results = [];
for (const f of files) {
  try {
    const r = await processOne(f);
    results.push(r);
    console.log('ok', r.rel, r.kind, `bbox=${r.bbox.w}x${r.bbox.h}@${r.bbox.x},${r.bbox.y}`, `crop=${r.region.width}x${r.region.height}@${r.region.left},${r.region.top}`);
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
