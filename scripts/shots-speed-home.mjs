import puppeteer from 'puppeteer-core';
import { createServer } from 'http';
import { readFileSync, existsSync, statSync, mkdirSync } from 'fs';
import { join, extname } from 'path';

const root = new URL('../dist/', import.meta.url).pathname;
const out = '/workspace/shots';
mkdirSync(out, { recursive: true });
const mime = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
};
const server = createServer((req, res) => {
  let url = decodeURIComponent((req.url || '/').split('?')[0]);
  if (url === '/') url = '/index.html';
  const file = join(root, url.replace(/^\//, ''));
  if (!existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end('no'); return; }
  res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(4191, r));

const PROFILE = {
  name: 'لينا', avatarId: 'k1', mode: 'junior', appLanguage: 'ar',
  translationLanguage: 'ar', learningLanguage: 'de', onboardingComplete: true,
  streak: 3, coins: 520, xp: 240, level: 5,
};
const MAP = { unlockedStage: 5, completed: [1, 2, 3, 4], falconSeen: true };

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=412,915'],
  defaultViewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
});
const page = await browser.newPage();
await page.evaluateOnNewDocument((profile, map) => {
  localStorage.clear();
  localStorage.setItem('deutsch-quest-profile-v1', JSON.stringify(profile));
  localStorage.setItem('wortland-map-progress-v1', JSON.stringify(map));
  localStorage.setItem('wortland.settings.v1', JSON.stringify({
    speechEnabled: true, volume: 1, speechRate: 1, reducedMotion: true, highContrast: false,
  }));
}, PROFILE, MAP);
await page.goto('http://127.0.0.1:4191/', { waitUntil: 'networkidle0', timeout: 60000 });
await new Promise((r) => setTimeout(r, 800));

await page.evaluate(() => document.querySelector('[data-feature="shop"]')?.scrollIntoView({ block: 'nearest' }));
await new Promise((r) => setTimeout(r, 250));
await page.screenshot({ path: join(out, 'home-icons.png') });
console.log('home-icons');

const clickHas = async (substr) => page.evaluate((s) => {
  const b = [...document.querySelectorAll('button')].find((el) => (el.textContent || '').includes(s));
  if (b) { b.click(); return (b.textContent || '').trim().slice(0, 50); }
  return null;
}, substr);

await page.click('[data-feature="flash"]');
await new Promise((r) => setTimeout(r, 600));
console.log('confirm level', await clickHas('تأكيد المستوى'));
await new Promise((r) => setTimeout(r, 700));
console.log('topic', await clickHas('حيوانات'));
await new Promise((r) => setTimeout(r, 400));
// inline start beside topic
console.log('start topic', await clickHas('ابدأ'));
await new Promise((r) => setTimeout(r, 800));
console.log('h1', await page.evaluate(() => document.querySelector('h1')?.textContent));
// pick picture match mode
console.log('pick mode', await clickHas('صور') || await clickHas('Picture'));
await new Promise((r) => setTimeout(r, 400));
console.log('start game', await clickHas('ابدأ'));
await new Promise((r) => setTimeout(r, 1200));
console.log('h1', await page.evaluate(() => document.querySelector('h1')?.textContent));
console.log('chip', !!(await page.$('[data-speech-speed-chip]')));

if (await page.$('[data-speech-speed-chip]')) {
  await page.screenshot({ path: join(out, 'speed-chip.png') });
  await page.click('[data-speech-speed-chip] > button');
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: join(out, 'speed-popover.png') });
  console.log('speed ok');
} else {
  await page.screenshot({ path: join(out, 'speed-chip-missing.png') });
  console.log(await page.evaluate(() => [...document.querySelectorAll('button')].map(b => (b.textContent||'').trim().slice(0,40)).slice(0,25)));
}

await browser.close();
server.close();
