import { createCanvas } from '/home/box/sand-host/node_modules/@napi-rs/canvas/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sharp = (await import('sharp')).default;

function canvas(size = 512) {
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  ctx.quality = 'best';
  return { c, ctx, size };
}

function bg(ctx, size, c1, c2) {
  const g = ctx.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  // soft vignette
  const vg = ctx.createRadialGradient(size/2, size/2, size*0.2, size/2, size/2, size*0.75);
  vg.addColorStop(0, 'rgba(255,255,255,0.18)');
  vg.addColorStop(1, 'rgba(15,23,42,0.12)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, size, size);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r);
  ctx.arcTo(x, y, x+w, y, r);
  ctx.closePath();
}

function shadow(ctx, draw) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.28)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  draw();
  ctx.restore();
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI*2);
  ctx.fillStyle = color;
  ctx.fill();
}

async function save(c, outPath, size = 384) {
  const buf = c.toBuffer('image/png');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(buf).resize(size, size).png({ compressionLevel: 9, palette: true, quality: 85 }).toFile(outPath);
  console.log('wrote', path.relative(root, outPath));
}

/** Character-like circular mascot avatar */
function drawAvatar(label, colors) {
  const { c, ctx, size } = canvas();
  bg(ctx, size, colors[0], colors[1]);
  shadow(ctx, () => {
    ellipse(ctx, size/2, size*0.55, size*0.32, size*0.34, colors[2]);
  });
  // face disk
  ellipse(ctx, size/2, size*0.48, size*0.26, size*0.26, colors[3]);
  // eyes
  ellipse(ctx, size*0.42, size*0.46, 14, 18, '#1e293b');
  ellipse(ctx, size*0.58, size*0.46, 14, 18, '#1e293b');
  ellipse(ctx, size*0.44, size*0.44, 5, 6, '#fff');
  ellipse(ctx, size*0.60, size*0.44, 5, 6, '#fff');
  // smile
  ctx.beginPath();
  ctx.arc(size/2, size*0.52, 28, 0.15*Math.PI, 0.85*Math.PI);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.stroke();
  // cheeks
  ellipse(ctx, size*0.34, size*0.55, 12, 8, 'rgba(251,113,133,0.45)');
  ellipse(ctx, size*0.66, size*0.55, 12, 8, 'rgba(251,113,133,0.45)');
  // accent badge
  ctx.font = 'bold 72px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = colors[4] || '#fff';
  ctx.fillText(label, size/2, size*0.82);
  return c;
}

function drawFrame(style) {
  const { c, ctx, size } = canvas();
  bg(ctx, size, style.bg1, style.bg2);
  const m = size * 0.12;
  shadow(ctx, () => {
    roundRect(ctx, m, m, size-2*m, size-2*m, 48);
    ctx.fillStyle = style.ring;
    ctx.fill();
  });
  roundRect(ctx, m+28, m+28, size-2*m-56, size-2*m-56, 36);
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fill();
  // inner hole hint
  roundRect(ctx, m+70, m+70, size-2*m-140, size-2*m-140, 28);
  ctx.fillStyle = style.inner;
  ctx.fill();
  return c;
}

function drawBadge(glyph, colors) {
  const { c, ctx, size } = canvas();
  bg(ctx, size, colors[0], colors[1]);
  shadow(ctx, () => {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i/8)*Math.PI*2 - Math.PI/2;
      const r = i%2===0 ? size*0.36 : size*0.24;
      const x = size/2 + Math.cos(a)*r;
      const y = size/2 + Math.sin(a)*r;
      if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath();
    ctx.fillStyle = colors[2];
    ctx.fill();
  });
  ctx.font = 'bold 140px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText(glyph, size/2, size/2 + 8);
  return c;
}

function drawSticker(glyph, colors) {
  const { c, ctx, size } = canvas();
  bg(ctx, size, colors[0], colors[1]);
  shadow(ctx, () => {
    ellipse(ctx, size/2, size/2, size*0.34, size*0.34, '#fff');
  });
  ellipse(ctx, size/2, size/2, size*0.30, size*0.30, colors[2]);
  ctx.font = 'bold 160px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText(glyph, size/2, size/2 + 10);
  return c;
}

function drawTrail(kind) {
  const { c, ctx, size } = canvas();
  bg(ctx, size, '#fff7ed', '#e0f2fe');
  // winding path
  ctx.lineWidth = 36;
  ctx.lineCap = 'round';
  ctx.strokeStyle = kind === 'falcon' ? '#fb923c' : '#fbbf24';
  ctx.beginPath();
  ctx.moveTo(70, size-80);
  ctx.bezierCurveTo(140, size-200, 200, size-120, 260, size-220);
  ctx.bezierCurveTo(320, size-300, 360, 160, 430, 100);
  ctx.stroke();
  // nodes
  for (const [x,y] of [[90,size-100],[200,size-180],[310,size-250],[400,120]]) {
    ellipse(ctx, x, y, 22, 22, '#fff');
    ellipse(ctx, x, y, 14, 14, kind === 'falcon' ? '#ea580c' : '#f59e0b');
  }
  ctx.font = 'bold 72px sans-serif';
  ctx.fillStyle = kind === 'falcon' ? '#9a3412' : '#92400e';
  ctx.textAlign = 'center';
  ctx.fillText(kind === 'falcon' ? '🦅' : '✨', size/2, size*0.78);
  return c;
}

function drawModeIcon(kind, colors) {
  const { c, ctx, size } = canvas();
  bg(ctx, size, colors[0], colors[1]);
  shadow(ctx, () => {
    roundRect(ctx, size*0.14, size*0.14, size*0.72, size*0.72, 64);
    ctx.fillStyle = colors[2];
    ctx.fill();
  });
  // simplified subject by kind
  ctx.save();
  ctx.translate(size/2, size/2);
  if (kind === 'classic') {
    roundRect(ctx, -70, -90, 100, 140, 16);
    ctx.fillStyle = '#fff';
    ctx.fill();
    roundRect(ctx, -40, -70, 100, 140, 16);
    ctx.fillStyle = '#fef3c7';
    ctx.fill();
  } else if (kind === 'picture') {
    roundRect(ctx, -90, -70, 180, 140, 20);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ellipse(ctx, -30, -10, 28, 28, '#fbbf24');
    ctx.beginPath();
    ctx.moveTo(-60, 40); ctx.lineTo(-10, -5); ctx.lineTo(40, 40);
    ctx.fillStyle = '#34d399'; ctx.fill();
  } else if (kind === 'quick') {
    ctx.beginPath();
    ctx.moveTo(-20, -80); ctx.lineTo(40, -10); ctx.lineTo(5, -10);
    ctx.lineTo(50, 80); ctx.lineTo(-30, 5); ctx.lineTo(10, 5);
    ctx.closePath();
    ctx.fillStyle = '#fde68a';
    ctx.fill();
  } else if (kind === 'article') {
    ['der','die','das'].forEach((w,i) => {
      roundRect(ctx, -100 + i*70, -30, 60, 60, 14);
      ctx.fillStyle = i===1 ? '#67e8f9' : '#fff';
      ctx.fill();
    });
  } else if (kind === 'memory') {
    for (const [x,y] of [[-60,-40],[20,-40],[-60,40],[20,40]]) {
      roundRect(ctx, x, y, 55, 70, 12);
      ctx.fillStyle = '#fbcfe8';
      ctx.fill();
    }
  } else if (kind === 'build') {
    for (let i=0;i<4;i++) {
      roundRect(ctx, -90 + i*45, -20, 40, 40, 10);
      ctx.fillStyle = ['#c4b5fd','#a5b4fc','#f9a8d4','#fde68a'][i];
      ctx.fill();
    }
  } else if (kind === 'master') {
    ctx.beginPath();
    ctx.moveTo(0, -70);
    for (let i=0;i<5;i++) {
      const a = -Math.PI/2 + i*(Math.PI*2/5);
      const a2 = a + Math.PI/5;
      ctx.lineTo(Math.cos(a)*70, Math.sin(a)*70);
      ctx.lineTo(Math.cos(a2)*32, Math.sin(a2)*32);
    }
    ctx.closePath();
    ctx.fillStyle = '#fde68a';
    ctx.fill();
  } else if (kind === 'listen') {
    ellipse(ctx, 0, 0, 50, 50, '#fff');
    roundRect(ctx, 40, -35, 18, 70, 8);
    ctx.fillStyle = '#99f6e4';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(55, 0, 40, -0.8, 0.8);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 10;
    ctx.stroke();
  } else if (kind === 'speed') {
    roundRect(ctx, -90, -35, 180, 70, 30);
    ctx.fillStyle = '#fecaca';
    ctx.fill();
    ellipse(ctx, -50, 40, 22, 22, '#1e293b');
    ellipse(ctx, 50, 40, 22, 22, '#1e293b');
  } else if (kind === 'puzzle') {
    roundRect(ctx, -70, -70, 80, 80, 16);
    ctx.fillStyle = '#fde68a'; ctx.fill();
    roundRect(ctx, -10, -10, 80, 80, 16);
    ctx.fillStyle = '#fdba74'; ctx.fill();
  } else if (kind === 'conversation') {
    roundRect(ctx, -90, -60, 120, 80, 24);
    ctx.fillStyle = '#fff'; ctx.fill();
    roundRect(ctx, -20, -10, 120, 80, 24);
    ctx.fillStyle = '#fbcfe8'; ctx.fill();
  }
  ctx.restore();
  return c;
}

function drawModeChoice(kind) {
  const { c, ctx, size } = canvas();
  if (kind === 'junior') {
    bg(ctx, size, '#fce7f3', '#ddd6fe');
    shadow(ctx, () => ellipse(ctx, size/2, size*0.55, size*0.34, size*0.28, '#f9a8d4'));
    // balloons / rainbow arcs
    for (let i=0;i<5;i++) {
      ctx.beginPath();
      ctx.arc(size/2, size*0.62, 90 + i*14, Math.PI, 0);
      ctx.strokeStyle = ['#f43f5e','#f97316','#eab308','#22c55e','#3b82f6'][i];
      ctx.lineWidth = 12;
      ctx.stroke();
    }
    ellipse(ctx, size/2, size*0.58, 48, 48, '#fff');
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#db2777';
    ctx.fillText('Jr', size/2, size*0.58);
  } else {
    bg(ctx, size, '#e0f2fe', '#e2e8f0');
    shadow(ctx, () => {
      // target rings
      for (const [r,col] of [[110,'#38bdf8'],[80,'#fff'],[50,'#0ea5e9'],[22,'#fff']]) {
        ellipse(ctx, size/2, size*0.5, r, r, col);
      }
    });
    ellipse(ctx, size/2, size*0.5, 14, 14, '#0369a1');
  }
  return c;
}

const shop = [
  ['av_fox_knight', () => drawAvatar('🦊', ['#ffedd5','#fed7aa','#fb923c','#fdba74','#9a3412'])],
  ['av_panda_chef', () => drawAvatar('🐼', ['#f1f5f9','#e2e8f0','#64748b','#f8fafc','#0f172a'])],
  ['av_owl_sage', () => drawAvatar('🦉', ['#ecfccb','#d9f99d','#a3e635','#fef9c3','#3f6212'])],
  ['av_robot_buddy', () => drawAvatar('🤖', ['#e0f2fe','#bae6fd','#38bdf8','#f0f9ff','#075985'])],
  ['av_dragon_cub', () => drawAvatar('🐉', ['#fce7f3','#fbcfe8','#e879f9','#fae8ff','#86198f'])],
  ['av_star_fairy', () => drawAvatar('✨', ['#fef3c7','#fde68a','#fbbf24','#fffbeb','#92400e'])],
  ['fr_leaf', () => drawFrame({ bg1:'#ecfccb', bg2:'#d1fae5', ring:'#4ade80', inner:'#f0fdf4' })],
  ['fr_sunrise', () => drawFrame({ bg1:'#ffedd5', bg2:'#fecdd3', ring:'#fb923c', inner:'#fff7ed' })],
  ['fr_crystal', () => drawFrame({ bg1:'#e0f2fe', bg2:'#ede9fe', ring:'#60a5fa', inner:'#eff6ff' })],
  ['fr_golden', () => drawFrame({ bg1:'#fef3c7', bg2:'#fde68a', ring:'#f59e0b', inner:'#fffbeb' })],
  ['fr_aurora', () => drawFrame({ bg1:'#fae8ff', bg2:'#dbeafe', ring:'#c084fc', inner:'#faf5ff' })],
  ['bd_spark', () => drawBadge('✦', ['#fef9c3','#fde68a','#f59e0b'])],
  ['bd_explorer', () => drawBadge('🧭', ['#dbeafe','#bfdbfe','#3b82f6'])],
  ['bd_champion', () => drawBadge('🏆', ['#fae8ff','#e9d5ff','#a855f7'])],
  ['bd_legend', () => drawBadge('👑', ['#ffedd5','#fde68a','#ea580c'])],
  ['st_yay', () => drawSticker('!', ['#fce7f3','#fbcfe8','#ec4899'])],
  ['st_wow', () => drawSticker('★', ['#e0f2fe','#bae6fd','#0ea5e9'])],
  ['st_fire', () => drawSticker('🔥', ['#ffedd5','#fed7aa','#f97316'])],
  ['st_hearts', () => drawSticker('♥', ['#fce7f3','#fbcfe8','#e11d48'])],
  ['tr_golden_path', () => drawTrail('gold')],
  ['tr_falcon_glow', () => drawTrail('falcon')],
];

const modes = ['classic','picture','quick','article','memory','build','master','listen','speed','puzzle','conversation'];
const modeColors = {
  classic: ['#dbeafe','#bfdbfe','#3b82f6'],
  picture: ['#dcfce7','#bbf7d0','#22c55e'],
  quick: ['#ffedd5','#fed7aa','#f97316'],
  article: ['#cffafe','#a5f3fc','#06b6d4'],
  memory: ['#fce7f3','#fbcfe8','#ec4899'],
  build: ['#f3e8ff','#e9d5ff','#a855f7'],
  master: ['#fef9c3','#fde68a','#eab308'],
  listen: ['#ccfbf1','#99f6e4','#14b8a6'],
  speed: ['#fee2e2','#fecaca','#ef4444'],
  puzzle: ['#ffedd5','#fde68a','#f59e0b'],
  conversation: ['#fce7f3','#fbcfe8','#f472b6'],
};

async function main() {
  for (const [id, fn] of shop) {
    await save(fn(), path.join(root, 'public/ui/shop', `${id}.png`));
  }
  for (const m of modes) {
    await save(drawModeIcon(m, modeColors[m]), path.join(root, 'public/ui/modes', `${m}.png`));
  }
  await save(drawModeChoice('junior'), path.join(root, 'public/ui/onboarding', 'mode-junior.png'));
  await save(drawModeChoice('standard'), path.join(root, 'public/ui/onboarding', 'mode-standard.png'));
  console.log('all art generated');
}

main().catch((e) => { console.error(e); process.exit(1); });
