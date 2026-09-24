/**
 * Seamless centered 512² from /workspace/content-originals.
 *
 * Strategy:
 * 1) Detect tight subject bbox (chroma + distance from corner gradient).
 * 2) Build a square canvas filled with the SAME corner bilinear gradient.
 * 3) Paste the FULL original onto that canvas so the subject center lands
 *    at the square center. Where the original doesn't cover, the matching
 *    gradient shows — no landscape-strip seam.
 * 4) Resize square → 512. Prefer sizing so subject fills ~86% (6–8% margin).
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas, loadImage } from '/home/box/sand-host/node_modules/@napi-rs/canvas/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = '/workspace/content-originals';
const DST = path.resolve('public/content');
const SHOTS = '/workspace/shots';
const LEGACY = '/tmp/content-2d6ebd2';
const OUT = 512;
const MARGIN = 0.07;
const OVERRIDES = fs.existsSync(path.join(__dirname, 'crop-overrides.json'))
  ? JSON.parse(fs.readFileSync(path.join(__dirname, 'crop-overrides.json'), 'utf8'))
  : {};

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function colorDist(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
}
function satOf(r, g, b) {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  return mx ? (mx - mn) / mx : 0;
}
function lumOf(r, g, b) { return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
function avgPatch(data, w, h, ch, x0, y0, size) {
  let r = 0, g = 0, b = 0, n = 0;
  for (let y = y0; y < y0 + size && y < h; y++)
    for (let x = x0; x < x0 + size && x < w; x++) {
      const i = (y * w + x) * ch;
      r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
    }
  return n ? [r / n, g / n, b / n] : [240, 240, 245];
}
function lerp3(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
function grad(corners, u, v) {
  return lerp3(lerp3(corners[0], corners[1], u), lerp3(corners[2], corners[3], u), v);
}
function listPngs(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listPngs(p));
    else if (/\.(png|jpe?g)$/i.test(ent.name)) out.push(p);
  }
  return out;
}

function detect(data, w, h, ch) {
  const patch = Math.min(28, Math.floor(Math.min(w, h) * 0.04));
  const corners = [
    avgPatch(data, w, h, ch, 0, 0, patch),
    avgPatch(data, w, h, ch, w - patch, 0, patch),
    avgPatch(data, w, h, ch, 0, h - patch, patch),
    avgPatch(data, w, h, ch, w - patch, h - patch, patch),
  ];
  const expected = (x, y) => grad(corners, x / Math.max(1, w - 1), y / Math.max(1, h - 1));
  const bgLum = lumOf(
    (corners[0][0] + corners[1][0] + corners[2][0] + corners[3][0]) / 4,
    (corners[0][1] + corners[1][1] + corners[2][1] + corners[3][1]) / 4,
    (corners[0][2] + corners[1][2] + corners[2][2] + corners[3][2]) / 4,
  );

  const bgTol = 36;
  const bg = new Uint8Array(w * h);
  const stack = [];
  const push = (x, y) => {
    const idx = y * w + x;
    if (bg[idx]) return;
    const i = (y * w + x) * ch;
    if (colorDist([data[i], data[i + 1], data[i + 2]], expected(x, y)) >= bgTol) return;
    bg[idx] = 1; stack.push(x, y);
  };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) {
    const y = stack.pop(), x = stack.pop();
    if (x > 0) push(x - 1, y);
    if (x + 1 < w) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y + 1 < h) push(x, y + 1);
  }
  // Soft-shadow cleanup only (don't eat white subjects)
  for (let y = Math.floor(h * 0.8); y < h; y++) for (let x = 0; x < w; x++) {
    if (bg[y * w + x]) continue;
    const i = (y * w + x) * ch;
    const sat = satOf(data[i], data[i + 1], data[i + 2]);
    const d = colorDist([data[i], data[i + 1], data[i + 2]], expected(x, y));
    if (sat < 0.08 && lumOf(data[i], data[i + 1], data[i + 2]) < bgLum - 10 && d < 50) bg[y * w + x] = 1;
  }

  const fg = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) if (!bg[i]) fg[i] = 1;

  // Light erode (1px) to drop fringe
  const eroded = new Uint8Array(w * h);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    if (!fg[y * w + x]) continue;
    if (fg[(y - 1) * w + x] && fg[(y + 1) * w + x] && fg[y * w + x - 1] && fg[y * w + x + 1]) eroded[y * w + x] = 1;
  }

  const seen = new Uint8Array(w * h);
  const comps = [];
  const st = new Int32Array(w * h * 2);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const start = y * w + x;
    if (!eroded[start] || seen[start]) continue;
    let sp = 0; st[sp++] = x; st[sp++] = y; seen[start] = 1;
    let minX = x, maxX = x, minY = y, maxY = y, area = 0;
    while (sp) {
      const cy = st[--sp], cx = st[--sp];
      area++;
      if (cx < minX) minX = cx; if (cx > maxX) maxX = cx;
      if (cy < minY) minY = cy; if (cy > maxY) maxY = cy;
      for (const [nx, ny] of [[cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]]) {
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const ni = ny * w + nx;
        if (!eroded[ni] || seen[ni]) continue;
        seen[ni] = 1; st[sp++] = nx; st[sp++] = ny;
      }
    }
    if (area >= Math.max(200, w * h * 0.0015)) comps.push({ minX, maxX, minY, maxY, area });
  }
  comps.sort((a, b) => b.area - a.area);

  let hsMinX = w, hsMinY = h, hsMaxX = -1, hsMaxY = -1, hsN = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * ch;
    const sat = satOf(data[i], data[i + 1], data[i + 2]);
    const d = colorDist([data[i], data[i + 1], data[i + 2]], expected(x, y));
    if (sat < 0.28 || d < 32) continue;
    hsN++;
    if (x < hsMinX) hsMinX = x; if (y < hsMinY) hsMinY = y;
    if (x > hsMaxX) hsMaxX = x; if (y > hsMaxY) hsMaxY = y;
  }
  const hs = hsN > 3000 ? { x: hsMinX, y: hsMinY, w: hsMaxX - hsMinX + 1, h: hsMaxY - hsMinY + 1 } : null;

  let minX, minY, maxX, maxY, weak = !comps.length;
  if (!comps.length) {
    if (hs) { minX = hs.x; minY = hs.y; maxX = hs.x + hs.w - 1; maxY = hs.y + hs.h - 1; }
    else {
      minX = Math.floor(w * 0.3); maxX = Math.floor(w * 0.7);
      minY = Math.floor(h * 0.15); maxY = Math.floor(h * 0.85);
    }
  } else {
    const c = comps[0];
    minX = c.minX; maxX = c.maxX; minY = c.minY; maxY = c.maxY;
  }

  // Expand 2% + 2px for AA
  const bw0 = maxX - minX + 1, bh0 = maxY - minY + 1;
  const ex = Math.max(2, Math.round(bw0 * 0.02)), ey = Math.max(2, Math.round(bh0 * 0.02));
  minX = Math.max(0, minX - ex); minY = Math.max(0, minY - ey);
  maxX = Math.min(w - 1, maxX + ex); maxY = Math.min(h - 1, maxY + ey);

  let bw = maxX - minX + 1, bh = maxY - minY + 1;
  if (hs) {
    const floodBig = bw > w * 0.72 || bh > h * 0.88 || bw * bh > w * h * 0.48;
    const hsTighter = hs.w * hs.h < bw * bh * 0.85 && Math.max(hs.w, hs.h) > 200;
    if (floodBig && hsTighter) {
      minX = Math.max(0, hs.x - 4);
      minY = Math.max(0, hs.y - 4);
      maxX = Math.min(w - 1, hs.x + hs.w + 3);
      maxY = Math.min(h - 1, hs.y + hs.h + 3);
    }
  }

  // Build strict subject mask for compositing (fg inside bbox, far from gradient)
  const mask = new Uint8Array(w * h);
  for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
    if (!fg[y * w + x]) continue;
    const i = (y * w + x) * ch;
    const d = colorDist([data[i], data[i + 1], data[i + 2]], expected(x, y));
    const sat = satOf(data[i], data[i + 1], data[i + 2]);
    if (d < 22 && sat < 0.1) continue;
    mask[y * w + x] = 1;
  }
  // Dilate mask 1px
  const mask2 = new Uint8Array(mask);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    if (!mask[y * w + x]) continue;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) mask2[(y + dy) * w + (x + dx)] = 1;
  }

  // Re-tighten bbox from mask
  let tMinX = w, tMinY = h, tMaxX = -1, tMaxY = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!mask2[y * w + x]) continue;
    if (x < tMinX) tMinX = x; if (y < tMinY) tMinY = y;
    if (x > tMaxX) tMaxX = x; if (y > tMaxY) tMaxY = y;
  }
  if (tMaxX >= 0) { minX = tMinX; minY = tMinY; maxX = tMaxX; maxY = tMaxY; }

  return {
    x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1,
    corners, mask: mask2, weak,
  };
}

/** Measure seam energy along paste edges (lower = better). */
function seamScore(imgData, side, oy, oh, ox, ow) {
  // Check horizontal edges of the landscape paste
  let sum = 0, n = 0;
  const rows = [oy - 1, oy, oy + oh - 1, oy + oh].filter((y) => y >= 1 && y < side - 1);
  for (const y of rows) {
    for (let x = Math.max(0, ox); x < Math.min(side, ox + ow); x++) {
      const i = (y * side + x) * 4;
      const j = ((y - 1) * side + x) * 4;
      sum += Math.abs(imgData[i] - imgData[j]) + Math.abs(imgData[i + 1] - imgData[j + 1]) + Math.abs(imgData[i + 2] - imgData[j + 2]);
      n++;
    }
  }
  return n ? sum / n : 0;
}

async function render(srcPath, data, w, h, ch, bbox) {
  const { corners, mask } = bbox;
  const bw = bbox.w, bh = bbox.h;
  const scx = bbox.x + bw / 2;
  const scy = bbox.y + bh / 2;
  const targetFill = 1 - 2 * MARGIN;
  const short = Math.min(w, h);

  // Detection failure: bbox is a near-full landscape scene (wide AND tall) → center square
  // Do NOT trigger on tall-thin subjects (people) that still fit in a square crop.
  if (bbox.forceCenter || (bw > w * 0.78 && bh > h * 0.78) || (bw > w * 0.9) || (bw * bh > w * h * 0.72 && bw > w * 0.65)) {
    const sideUse = short;
    const left = Math.round((w - sideUse) / 2);
    const top = Math.round((h - sideUse) / 2);
    const png = await sharp(srcPath)
      .extract({ left, top, width: sideUse, height: sideUse })
      .resize(OUT, OUT, { fit: 'fill', kernel: 'lanczos3' })
      .png()
      .toBuffer();
    return {
      png,
      fill: 0.86, // nominal — whole-frame scene
      ocx: 0.5,
      ocy: 0.5,
      mode: 'center-square',
      seam: 0,
      side: sideUse,
    };
  }

  let side = Math.ceil(Math.max(bw, bh) / targetFill);

  const tryCrop = async (sideUse, mode) => {
    let left = Math.round(scx - sideUse / 2);
    let top = Math.round(scy - sideUse / 2);
    left = clamp(left, 0, w - sideUse);
    top = clamp(top, 0, h - sideUse);
    if (bbox.x < left) left = bbox.x;
    if (bbox.y < top) top = bbox.y;
    if (bbox.x + bw > left + sideUse) left = bbox.x + bw - sideUse;
    if (bbox.y + bh > top + sideUse) top = bbox.y + bh - sideUse;
    left = clamp(left, 0, w - sideUse);
    top = clamp(top, 0, h - sideUse);
    // Must contain subject
    if (bbox.x < left || bbox.y < top || bbox.x + bw > left + sideUse || bbox.y + bh > top + sideUse) return null;
    const png = await sharp(srcPath)
      .extract({ left, top, width: sideUse, height: sideUse })
      .resize(OUT, OUT, { fit: 'fill', kernel: 'lanczos3' })
      .png()
      .toBuffer();
    return {
      png,
      fill: Math.max(bw, bh) / sideUse,
      ocx: (scx - left) / sideUse,
      ocy: (scy - top) / sideUse,
      mode,
      seam: 0,
      side: sideUse,
    };
  };

  if (side <= short) {
    const r = await tryCrop(side, 'crop');
    if (r && Math.abs(r.ocx - 0.5) <= 0.03 && Math.abs(r.ocy - 0.5) <= 0.03) return r;
  }
  if (Math.max(bw, bh) <= short) {
    const r = await tryCrop(short, 'crop-tight');
    // Prefer seamless crop over mask even if a bit off-center (mask often leaks bg)
    if (r && Math.abs(r.ocx - 0.5) <= 0.06 && Math.abs(r.ocy - 0.5) <= 0.06) return r;
  }

  // Mask composite onto matching gradient (no landscape strip)
  const target = Math.round(OUT * (1 - 2 * MARGIN));
  const scale = target / Math.max(bw, bh);
  const nw = Math.max(1, Math.round(bw * scale));
  const nh = Math.max(1, Math.round(bh * scale));

  // Build transparent subject plate cropped to bbox
  const plate = Buffer.alloc(bw * bh * 4);
  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) {
      const sx = bbox.x + x, sy = bbox.y + y;
      const o = (y * bw + x) * 4;
      const i = (sy * w + sx) * ch;
      if (!mask || !mask[sy * w + sx]) continue;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const d = colorDist([r, g, b], grad(corners, sx / Math.max(1, w - 1), sy / Math.max(1, h - 1)));
      const sat = satOf(r, g, b);
      if (d < 24 && sat < 0.12) continue;
      plate[o] = r; plate[o + 1] = g; plate[o + 2] = b; plate[o + 3] = 255;
    }
  }
  // Feather
  for (let y = 1; y < bh - 1; y++) for (let x = 1; x < bw - 1; x++) {
    const o = (y * bw + x) * 4;
    if (!plate[o + 3]) continue;
    let n = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (plate[((y + dy) * bw + (x + dx)) * 4 + 3]) n++;
    }
    plate[o + 3] = Math.round(255 * Math.min(1, n / 5));
  }

  const fitted = await sharp(plate, { raw: { width: bw, height: bh, channels: 4 } })
    .resize(nw, nh, { fit: 'fill', kernel: 'lanczos3' })
    .png()
    .toBuffer();

  const canvas = createCanvas(OUT, OUT);
  const ctx = canvas.getContext('2d');
  const imgd = ctx.createImageData(OUT, OUT);
  for (let y = 0; y < OUT; y++) {
    for (let x = 0; x < OUT; x++) {
      const col = grad(corners, x / (OUT - 1), y / (OUT - 1));
      const i = (y * OUT + x) * 4;
      imgd.data[i] = clamp(Math.round(col[0]), 0, 255);
      imgd.data[i + 1] = clamp(Math.round(col[1]), 0, 255);
      imgd.data[i + 2] = clamp(Math.round(col[2]), 0, 255);
      imgd.data[i + 3] = 255;
    }
  }
  ctx.putImageData(imgd, 0, 0);
  const sub = await loadImage(fitted);
  const dx = Math.round((OUT - sub.width) / 2);
  const dy = Math.round((OUT - sub.height) / 2);
  ctx.drawImage(sub, dx, dy);

  return {
    png: canvas.toBuffer('image/png'),
    fill: Math.max(sub.width, sub.height) / OUT,
    ocx: (dx + sub.width / 2) / OUT,
    ocy: (dy + sub.height / 2) / OUT,
    mode: 'mask',
    seam: 0,
    side: OUT,
  };
}

async function processOne(srcPath) {
  const rel = path.relative(SRC, srcPath).replace(/\\/g, '/').replace(/\.(jpe?g)$/i, '.png');
  const ov = OVERRIDES[rel] || {};
  const { data, info } = await sharp(srcPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: ch } = info;
  let bbox = detect(data, w, h, ch);
  if (ov.bbox) {
    bbox = {
      ...bbox,
      x: Math.round(ov.bbox.x * w),
      y: Math.round(ov.bbox.y * h),
      w: Math.round(ov.bbox.w * w),
      h: Math.round(ov.bbox.h * h),
      weak: false,
    };
  }
  if (ov.mode === 'center-square') {
    bbox = { ...bbox, x: 0, y: 0, w, h: h, weak: false, forceCenter: true };
  }
  const out = await render(srcPath, data, w, h, ch, bbox);
  const dest = path.join(DST, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp(out.png).png({ compressionLevel: 9 }).toFile(dest);
  return {
    rel, topic: rel.split('/')[0],
    fill: out.fill, ocx: out.ocx, ocy: out.ocy,
    weak: bbox.weak, bbox: `${bbox.w}x${bbox.h}`,
    mode: out.mode, seam: out.seam,
  };
}

async function contactSheet(results, outPath, crosshair = false) {
  const cols = 5, cell = 168;
  const rows = Math.ceil(results.length / cols) || 1;
  const canvas = createCanvas(cols * cell, rows * cell);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const x = (i % cols) * cell, y = Math.floor(i / cols) * cell;
    const s = cell - 30;
    try { ctx.drawImage(await loadImage(path.join(DST, r.rel)), x + 4, y + 4, s, s); } catch {}
    if (crosshair) {
      ctx.strokeStyle = 'rgba(255,80,120,0.55)';
      ctx.beginPath();
      ctx.moveTo(x + 4 + s / 2, y + 4); ctx.lineTo(x + 4 + s / 2, y + 4 + s);
      ctx.moveTo(x + 4, y + 4 + s / 2); ctx.lineTo(x + 4 + s, y + 4 + s / 2);
      ctx.stroke();
    }
    const bad = r.fill < 0.80 || r.fill > 0.94 || r.seam > 12;
    ctx.fillStyle = bad ? '#fbbf24' : '#e2e8f0';
    ctx.font = '10px sans-serif';
    ctx.fillText(`${r.rel.split('/').pop().replace('.png', '')} ${(r.fill * 100) | 0}%`, x + 6, y + cell - 8);
  }
  fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
  console.log('wrote', outPath);
}

async function compare(topic) {
  if (!fs.existsSync(path.join(LEGACY, topic))) return;
  const names = fs.readdirSync(path.join(LEGACY, topic)).filter((n) => n.endsWith('.png')).sort();
  const cell = 140, cols = 5;
  const canvas = createCanvas(cols * (cell * 2 + 8), Math.ceil(names.length / cols) * (cell + 24));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < names.length; i++) {
    const col = i % cols, row = Math.floor(i / cols);
    const x = col * (cell * 2 + 8), y = row * (cell + 24);
    try {
      ctx.drawImage(await loadImage(path.join(LEGACY, topic, names[i])), x + 4, y + 4, cell - 4, cell - 4);
      ctx.drawImage(await loadImage(path.join(DST, topic, names[i])), x + cell + 8, y + 4, cell - 4, cell - 4);
    } catch {}
    ctx.fillStyle = '#94a3b8'; ctx.font = '11px sans-serif';
    ctx.fillText('2d6', x + 8, y + cell + 14);
    ctx.fillStyle = '#86efac';
    ctx.fillText('fix ' + names[i].replace('.png', ''), x + cell + 10, y + cell + 14);
  }
  fs.writeFileSync(path.join(SHOTS, `fix-compare-${topic}.png`), canvas.toBuffer('image/png'));
  console.log('wrote fix-compare-' + topic);
}

let files = listPngs(SRC).sort();
if (process.env.ONLY_TOPIC) files = files.filter((f) => path.relative(SRC, f).startsWith(process.env.ONLY_TOPIC + '/'));
if (process.env.ONLY_FILE) files = files.filter((f) => f.replace(/\\/g, '/').endsWith(process.env.ONLY_FILE));

const results = [];
for (const f of files) {
  try {
    const r = await processOne(f);
    results.push(r);
    const warn = r.fill < 0.80 || r.fill > 0.94 || r.seam > 12 ? ' WARN' : '';
    console.log('ok', r.rel, `bbox=${r.bbox}`, `fill=${(r.fill * 100).toFixed(0)}%`, r.mode, `seam=${r.seam}`, warn);
  } catch (e) { console.error('FAIL', f, e.message); }
}
fs.mkdirSync(SHOTS, { recursive: true });
const by = {};
for (const r of results) (by[r.topic] ||= []).push(r);
for (const [topic, list] of Object.entries(by)) {
  await contactSheet(list, path.join(SHOTS, `center-contact-${topic}.png`), false);
  await contactSheet(list, path.join(SHOTS, `center-contact-${topic}-xhair.png`), true);
}
if (!process.env.ONLY_TOPIC && !process.env.ONLY_FILE) {
  await contactSheet(results, path.join(SHOTS, 'center-contact-all.png'), false);
  await contactSheet(results, path.join(SHOTS, 'center-contact-all-xhair.png'), true);
  await compare('essen');
  await compare('tiere');
} else if (process.env.ONLY_TOPIC === 'essen' || process.env.ONLY_TOPIC === 'tiere') {
  await compare(process.env.ONLY_TOPIC);
}
const weak = results.filter((r) => r.weak || r.fill < 0.80 || r.fill > 0.94 || r.seam > 12);
console.log('done', results.length, 'weak', weak.length);
if (weak.length) console.log(weak.map((r) => `${r.rel}(f=${(r.fill*100)|0},seam=${r.seam})`).join(', '));
