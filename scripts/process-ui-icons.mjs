/** Center-square crop new-icons → public/ui/home (256) + public/ui/nav (192) */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SRC = '/workspace/new-icons';
const HOME = path.resolve('public/ui/home');
const NAV = path.resolve('public/ui/nav');
fs.mkdirSync(HOME, { recursive: true });
fs.mkdirSync(NAV, { recursive: true });

async function centerSquare(srcPath, outPath, size, margin = 0.08) {
  const meta = await sharp(srcPath).metadata();
  const w = meta.width, h = meta.height;
  let side = h;
  const inset = Math.round(side * margin);
  side = side - inset * 2;
  const left = Math.round((w - side) / 2);
  const top = inset;
  await sharp(srcPath)
    .extract({ left, top, width: side, height: side })
    .resize(size, size, { fit: 'fill' })
    .png({ compressionLevel: 9, quality: 90 })
    .toFile(outPath);
  console.log(path.basename(outPath), `${side}@${left},${top} → ${size}`);
}

const homes = ['home-cards','home-games','home-daily','home-challenges','home-family','home-leaderboard','home-stats','home-shop'];
for (const n of homes) await centerSquare(path.join(SRC, `${n}.png`), path.join(HOME, `${n}.png`), 256);
const navs = { 'nav-home':'nav-home','nav-learn':'nav-learn','home-games':'nav-games','nav-progress':'nav-progress','nav-profile':'nav-profile' };
for (const [s, o] of Object.entries(navs)) await centerSquare(path.join(SRC, `${s}.png`), path.join(NAV, `${o}.png`), 192);
console.log('ui icons done');
