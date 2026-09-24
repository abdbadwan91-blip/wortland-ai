/**
 * Centered full-subject 512² crops.
 * Source: /workspace/content-originals → public/content
 * Detection: sat/contrast vs edge-based bg, morph cleanup, largest components,
 * exclude low-sat floor shadows. Soft edge-blur padding (no hard bars).
 * Optional overrides: scripts/crop-overrides.json
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
const OVERRIDES_PATH = path.join(__dirname, 'crop-overrides.json');
const OUT_SIZE = 512;
const MARGIN = 0.06;

const overrides = fs.existsSync(OVERRIDES_PATH)
  ? JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf8'))
  : {};

function listPngs(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listPngs(p));
    else if (ent.name.endsWith('.png')) out.push(p);
  }
  return out;
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function satOf(r, g, b) {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  return mx <= 1e-6 ? 0 : (mx - mn) / mx;
}

function lumOf(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function colorDist(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
}

function avgRing(data, w, h, ch, band) {
  let r = 0, g = 0, b = 0, n = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const onEdge = x < band || y < band || x >= w - band || y >= h - band;
      if (!onEdge) continue;
      const i = (y * w + x) * ch;
      r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
    }
  }
  return n ? [r / n, g / n, b / n] : [240, 240, 240];
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

/** 3x3 dilate then erode-ish cleanup on binary mask (Uint8 0/1). */
function morphCleanup(mask, w, h) {
  const dilate = new Uint8Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let on = 0;
      for (let dy = -1; dy <= 1 && !on; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (mask[(y + dy) * w + (x + dx)]) { on = 1; break; }
        }
      }
      dilate[y * w + x] = on;
    }
  }
  // erode once to pull back fringe
  const out = new Uint8Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let all = 1;
      for (let dy = -1; dy <= 1 && all; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!dilate[(y + dy) * w + (x + dx)]) { all = 0; break; }
        }
      }
      out[y * w + x] = all;
    }
  }
  return out;
}

function connectedComponents(mask, w, h, minArea) {
  const seen = new Uint8Array(w * h);
  const comps = [];
  const stack = new Int32Array(w * h * 2);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const start = y * w + x;
      if (!mask[start] || seen[start]) continue;
      let sp = 0;
      stack[sp++] = x; stack[sp++] = y;
      seen[start] = 1;
      let minX = x, maxX = x, minY = y, maxY = y, area = 0;
      while (sp) {
        const cy = stack[--sp];
        const cx = stack[--sp];
        area++;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;
        for (const [nx, ny] of [[cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]]) {
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const ni = ny * w + nx;
          if (!mask[ni] || seen[ni]) continue;
          seen[ni] = 1;
          stack[sp++] = nx; stack[sp++] = ny;
        }
      }
      if (area >= minArea) comps.push({ minX, maxX, minY, maxY, area });
    }
  }
  comps.sort((a, b) => b.area - a.area);
  return comps;
}

function detectBBox(data, w, h, channels) {
  const band = Math.max(6, Math.floor(Math.min(w, h) * 0.06));
  const patch = Math.min(28, band);
  const corners = [
    avgPatch(data, w, h, channels, 0, 0, patch),
    avgPatch(data, w, h, channels, w - patch, 0, patch),
    avgPatch(data, w, h, channels, 0, h - patch, patch),
    avgPatch(data, w, h, channels, w - patch, h - patch, patch),
  ];
  const ring = avgRing(data, w, h, channels, band);
  const bgAvg = [
    (corners[0][0] + corners[1][0] + corners[2][0] + corners[3][0] + ring[0]) / 5,
    (corners[0][1] + corners[1][1] + corners[2][1] + corners[3][1] + ring[1]) / 5,
    (corners[0][2] + corners[1][2] + corners[2][2] + corners[3][2] + ring[2]) / 5,
  ];
  const bgLum = lumOf(...bgAvg);

  const expected = (x, y) => {
    const wx = x / Math.max(1, w - 1);
    const wy = y / Math.max(1, h - 1);
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
    // Blend corner gradient with ring average for more stable bg
    return [
      (top[0] * (1 - wy) + bot[0] * wy) * 0.65 + bgAvg[0] * 0.35,
      (top[1] * (1 - wy) + bot[1] * wy) * 0.65 + bgAvg[1] * 0.35,
      (top[2] * (1 - wy) + bot[2] * wy) * 0.65 + bgAvg[2] * 0.35,
    ];
  };

  const raw = new Uint8Array(w * h);
  const distTol = 28;
  for (let y = 0; y < h; y++) {
    const nearBottom = y > h * 0.62;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * channels;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const exp = expected(x, y);
      const dist = colorDist([r, g, b], exp);
      const sat = satOf(r, g, b);
      const lum = lumOf(r, g, b);

      // Floor / cast shadow: dark, desaturated, near bottom — not subject
      if (nearBottom && sat < 0.09 && lum < bgLum - 18 && dist < distTol + 25) {
        continue;
      }
      // Soft sparkle / noise near bg
      if (dist < distTol && sat < 0.07) continue;

      const strong = dist >= distTol + 8 || (sat >= 0.12 && dist >= distTol * 0.45);
      const medium = dist >= distTol || (sat >= 0.18 && dist >= 14);
      if (strong || medium) raw[y * w + x] = 1;
    }
  }

  const cleaned = morphCleanup(raw, w, h);
  const minArea = Math.max(120, Math.floor(w * h * 0.004));
  const comps = connectedComponents(cleaned, w, h, minArea);

  let minX = w, minY = h, maxX = 0, maxY = 0, areaSum = 0;
  if (!comps.length) {
    // fallback: use raw without morph
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!raw[y * w + x]) continue;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        areaSum++;
      }
    }
  } else {
    // Keep largest + any within 35% of largest area (multi-object union)
    const primary = comps[0].area;
    for (const c of comps) {
      if (c.area < primary * 0.35 && comps.indexOf(c) > 0) continue;
      if (c.minX < minX) minX = c.minX;
      if (c.minY < minY) minY = c.minY;
      if (c.maxX > maxX) maxX = c.maxX;
      if (c.maxY > maxY) maxY = c.maxY;
      areaSum += c.area;
    }
  }

  if (areaSum < 80 || maxX <= minX || maxY <= minY) {
    return {
      x: Math.floor(w * 0.2),
      y: Math.floor(h * 0.12),
      w: Math.floor(w * 0.6),
      h: Math.floor(h * 0.7),
      bgColor: bgAvg,
      weak: true,
    };
  }

  // Slight inward trim on sides only (drop halo), keep vertical extent
  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  const trimX = Math.round(bw * 0.015);
  minX = Math.min(minX + trimX, maxX - 4);
  maxX = Math.max(maxX - trimX, minX + 4);

  return {
    x: minX,
    y: minY,
    w: maxX - minX + 1,
    h: maxY - minY + 1,
    bgColor: bgAvg,
    weak: false,
  };
}

async function softSquare(srcPath, desiredLeft, desiredTop, side, bgColor) {
  const meta = await sharp(srcPath).metadata();
  const w = meta.width;
  const h = meta.height;
  const sideI = Math.max(32, Math.round(side));

  const padL = Math.max(0, Math.ceil(-desiredLeft));
  const padT = Math.max(0, Math.ceil(-desiredTop));
  const padR = Math.max(0, Math.ceil(desiredLeft + sideI - w));
  const padB = Math.max(0, Math.ceil(desiredTop + sideI - h));

  const solid = {
    r: Math.round(clamp(bgColor[0], 0, 255)),
    g: Math.round(clamp(bgColor[1], 0, 255)),
    b: Math.round(clamp(bgColor[2], 0, 255)),
    alpha: 255,
  };

  // Materialize extended image first (avoids sharp pipeline extract bugs)
  const extended = await sharp(srcPath)
    .extend({
      left: padL || 0,
      top: padT || 0,
      right: padR || 0,
      bottom: padB || 0,
      background: solid,
    })
    .ensureAlpha()
    .png()
    .toBuffer();

  const extMeta = await sharp(extended).metadata();
  const extW = extMeta.width;
  const extH = extMeta.height;
  let extLeft = Math.round(desiredLeft + padL);
  let extTop = Math.round(desiredTop + padT);
  // Ensure extract fits
  if (sideI > extW || sideI > extH) {
    // Fall back: cover full image into square via contain on soft canvas
    const cover = await sharp(srcPath)
      .resize(sideI, sideI, { fit: 'contain', background: solid })
      .png()
      .toBuffer();
    const soft = await sharp(cover).blur(36).modulate({ saturation: 0.9 }).png().toBuffer();
    const canvas = createCanvas(OUT_SIZE, OUT_SIZE);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(await loadImage(soft), 0, 0, OUT_SIZE, OUT_SIZE);
    ctx.drawImage(await loadImage(cover), 0, 0, OUT_SIZE, OUT_SIZE);
    return canvas.toBuffer('image/png');
  }
  extLeft = clamp(extLeft, 0, extW - sideI);
  extTop = clamp(extTop, 0, extH - sideI);

  const sharpPng = await sharp(extended)
    .extract({ left: extLeft, top: extTop, width: sideI, height: sideI })
    .png()
    .toBuffer();

  const softPng = await sharp(sharpPng)
    .blur(40)
    .modulate({ saturation: 0.92, brightness: 1.02 })
    .png()
    .toBuffer();

  const canvas = createCanvas(OUT_SIZE, OUT_SIZE);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(await loadImage(softPng), 0, 0, OUT_SIZE, OUT_SIZE);
  ctx.drawImage(await loadImage(sharpPng), 0, 0, OUT_SIZE, OUT_SIZE);

  // Soften pad strips by re-drawing blurred edges over pad zones
  const scale = OUT_SIZE / sideI;
  const fl = padL * scale, ft = padT * scale, fr = padR * scale, fb = padB * scale;
  if (fl > 1 || ft > 1 || fr > 1 || fb > 1) {
    const feather = 10;
    if (fl > 1) ctx.drawImage(await loadImage(softPng), 0, 0, fl + feather, OUT_SIZE, 0, 0, fl + feather, OUT_SIZE);
    if (fr > 1) ctx.drawImage(await loadImage(softPng), OUT_SIZE - fr - feather, 0, fr + feather, OUT_SIZE, OUT_SIZE - fr - feather, 0, fr + feather, OUT_SIZE);
    if (ft > 1) ctx.drawImage(await loadImage(softPng), 0, 0, OUT_SIZE, ft + feather, 0, 0, OUT_SIZE, ft + feather);
    if (fb > 1) ctx.drawImage(await loadImage(softPng), 0, OUT_SIZE - fb - feather, OUT_SIZE, fb + feather, 0, OUT_SIZE - fb - feather, OUT_SIZE, fb + feather);
  }

  return canvas.toBuffer('image/png');
}

async function processOne(srcPath) {
  const rel = path.relative(SRC, srcPath).replace(/\\/g, '/');
  const topic = rel.split('/')[0];
  const ov = overrides[rel] || {};

  const { data, info } = await sharp(srcPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels } = info;
  let bbox = detectBBox(data, w, h, channels);

  // Manual overrides: fractional center / scale relative to image
  let cx = bbox.x + bbox.w / 2;
  let cy = bbox.y + bbox.h / 2;
  let side = Math.max(bbox.w, bbox.h) * (1 + MARGIN * 2);

  if (typeof ov.cx === 'number') cx = ov.cx * w;
  if (typeof ov.cy === 'number') cy = ov.cy * h;
  if (typeof ov.side === 'number') side = ov.side * Math.min(w, h);
  if (typeof ov.scale === 'number') side *= ov.scale;
  if (ov.bbox) {
    bbox = {
      x: Math.round(ov.bbox.x * w),
      y: Math.round(ov.bbox.y * h),
      w: Math.round(ov.bbox.w * w),
      h: Math.round(ov.bbox.h * h),
      bgColor: bbox.bgColor,
      weak: false,
    };
    cx = bbox.x + bbox.w / 2;
    cy = bbox.y + bbox.h / 2;
    side = Math.max(bbox.w, bbox.h) * (1 + MARGIN * 2);
    if (typeof ov.scale === 'number') side *= ov.scale;
  }

  const desiredLeft = cx - side / 2;
  const desiredTop = cy - side / 2;

  const png = await softSquare(srcPath, desiredLeft, desiredTop, side, bbox.bgColor);
  const dest = path.join(DST, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(png).png({ compressionLevel: 9 }).toFile(dest);

  return {
    rel,
    topic,
    bbox,
    side: Math.round(side),
    left: Math.round(desiredLeft),
    top: Math.round(desiredTop),
    cx: Math.round(cx),
    cy: Math.round(cy),
    weak: !!bbox.weak,
    overridden: Object.keys(ov).length > 0,
  };
}

async function contactSheet(results, outPath, cols = 5, cell = 168, crosshair = true) {
  const rows = Math.ceil(results.length / cols) || 1;
  const canvas = createCanvas(cols * cell, rows * cell);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const x = (i % cols) * cell;
    const y = Math.floor(i / cols) * cell;
    const imgBox = { x: x + 4, y: y + 4, s: cell - 8 - 22 };
    try {
      const im = await loadImage(path.join(DST, r.rel));
      ctx.drawImage(im, imgBox.x, imgBox.y, imgBox.s, imgBox.s);
    } catch { /* */ }
    if (crosshair) {
      const mx = imgBox.x + imgBox.s / 2;
      const my = imgBox.y + imgBox.s / 2;
      ctx.strokeStyle = 'rgba(255,80,120,0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mx, imgBox.y);
      ctx.lineTo(mx, imgBox.y + imgBox.s);
      ctx.moveTo(imgBox.x, my);
      ctx.lineTo(imgBox.x + imgBox.s, my);
      ctx.stroke();
    }
    ctx.fillStyle = r.weak ? '#fbbf24' : '#e2e8f0';
    ctx.font = '10px sans-serif';
    const label = r.rel.split('/').pop().replace('.png', '');
    ctx.fillText((r.overridden ? '★' : '') + label, x + 6, y + cell - 8);
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
  console.log('wrote', outPath);
}

let files = listPngs(SRC).sort();
if (process.env.ONLY_FILE) {
  files = files.filter((f) => f.replace(/\\/g, '/').endsWith(process.env.ONLY_FILE.replace(/^\//, '')));
}
if (process.env.ONLY_TOPIC) {
  files = files.filter((f) => path.relative(SRC, f).replace(/\\/g, '/').startsWith(process.env.ONLY_TOPIC + '/'));
}
console.log('processing', files.length, 'centered crops');
const results = [];
const weak = [];
for (const f of files) {
  try {
    const r = await processOne(f);
    results.push(r);
    if (r.weak) weak.push(r.rel);
    console.log(
      r.overridden ? 'OV' : 'ok',
      r.rel,
      `bbox=${r.bbox.w}x${r.bbox.h}`,
      `c=${r.cx},${r.cy}`,
      `sq=${r.side}`,
      r.weak ? 'WEAK' : '',
    );
  } catch (e) {
    console.error('FAIL', path.relative(SRC, f), e.message);
  }
}
fs.mkdirSync(SHOTS, { recursive: true });
const byTopic = {};
for (const r of results) (byTopic[r.topic] ||= []).push(r);
for (const [topic, list] of Object.entries(byTopic)) {
  await contactSheet(list, path.join(SHOTS, `center-contact-${topic}.png`), 5, 168, true);
}
await contactSheet(results, path.join(SHOTS, 'center-contact-all.png'), 10, 120, true);
console.log('done', results.length, '/', files.length, 'weak:', weak.length);
if (weak.length) console.log('weak list:', weak.join(', '));
