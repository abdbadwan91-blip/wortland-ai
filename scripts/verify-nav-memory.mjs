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
  '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2',
};
const server = createServer((req, res) => {
  let url = decodeURIComponent((req.url || '/').split('?')[0]);
  if (url === '/') url = '/index.html';
  const file = join(root, url.replace(/^\//, ''));
  if (!existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end('no'); return; }
  res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(4188, r));

const PROFILE = {
  name: 'لينا', avatarId: 'k1', mode: 'junior', appLanguage: 'ar',
  translationLanguage: 'ar', learningLanguage: 'de', onboardingComplete: true,
  streak: 3, coins: 520, xp: 240, level: 4,
};
const MAP = { unlockedStage: 4, completed: [1, 2, 3], falconSeen: true };

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=412,915'],
  defaultViewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
});

async function clickText(page, re) {
  return page.evaluate((pattern) => {
    const rx = new RegExp(pattern, 'i');
    const btns = [...document.querySelectorAll('button')];
    const b = btns.find((el) => rx.test((el.textContent || '').trim()));
    if (b) { b.click(); return (b.textContent || '').trim().slice(0, 80); }
    return null;
  }, re);
}

async function measureNav(page) {
  return page.evaluate(() => {
    const nav = document.querySelector('[data-bottom-nav]');
    if (!nav) return null;
    const r = nav.getBoundingClientRect();
    return {
      top: r.top, bottom: r.bottom, height: r.height, width: r.width,
      innerHeight: window.innerHeight,
      scrollTop: document.querySelector('.screen')?.scrollTop ?? 0,
      parent: nav.parentElement?.tagName,
    };
  });
}

function assertNavPinned(label, info) {
  if (!info) throw new Error(`No nav at ${label}`);
  const ok = Math.abs(info.bottom - info.innerHeight) <= 2;
  console.log(`[nav ${label}] bottom=${info.bottom.toFixed(1)} innerH=${info.innerHeight} parent=${info.parent} pinned=${ok}`);
  if (!ok) throw new Error(`Nav not pinned at ${label}: bottom=${info.bottom} vs innerHeight=${info.innerHeight}`);
}

const page = await browser.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await page.evaluateOnNewDocument((profile, map) => {
  localStorage.clear();
  localStorage.setItem('deutsch-quest-profile-v1', JSON.stringify(profile));
  localStorage.setItem('wortland-map-progress-v1', JSON.stringify(map));
  localStorage.setItem('wortland.settings.v1', JSON.stringify({
    speechEnabled: true, volume: 1, reducedMotion: true, highContrast: false,
  }));
}, PROFILE, MAP);
await page.goto('http://127.0.0.1:4188/', { waitUntil: 'networkidle0', timeout: 60000 });
await new Promise((r) => setTimeout(r, 800));

// --- NAV ---
assertNavPinned('home-top', await measureNav(page));
await page.screenshot({ path: `${out}/nav-top.png` });

await page.evaluate(() => {
  const s = document.querySelector('.screen');
  if (s) s.scrollTop = Math.min(900, Math.floor(s.scrollHeight / 2));
});
await new Promise((r) => setTimeout(r, 250));
assertNavPinned('home-mid', await measureNav(page));
await page.screenshot({ path: `${out}/nav-mid.png` });

await page.evaluate(() => {
  const s = document.querySelector('.screen');
  if (s) s.scrollTop = s.scrollHeight;
});
await new Promise((r) => setTimeout(r, 250));
assertNavPinned('home-bottom', await measureNav(page));
await page.screenshot({ path: `${out}/nav-bottom.png` });

for (const tab of ['learn', 'games', 'progress', 'profile']) {
  await page.evaluate((id) => document.querySelector(`[data-nav="${id}"]`)?.click(), tab);
  await new Promise((r) => setTimeout(r, 450));
  assertNavPinned(tab, await measureNav(page));
  await page.evaluate(() => {
    const s = document.querySelector('.screen');
    if (s) s.scrollTop = Math.min(500, s.scrollHeight);
  });
  await new Promise((r) => setTimeout(r, 200));
  assertNavPinned(`${tab}-scrolled`, await measureNav(page));
}

// --- MEMORY ---
await page.evaluate(() => document.querySelector('[data-nav="home"]')?.click());
await new Promise((r) => setTimeout(r, 400));
console.log('continue →', await clickText(page, 'Continue Learning|متابعة التعلم|Weiterlernen'));
await new Promise((r) => setTimeout(r, 700));

const wheel = await page.evaluate((level) => {
  const texts = [...document.querySelectorAll('svg text')];
  const node = texts.find((t) => (t.textContent || '').trim() === String(level));
  const g = node?.closest('g');
  if (!g) return false;
  g.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  return true;
}, 4);
console.log('wheel 4', wheel);
await new Promise((r) => setTimeout(r, 400));
console.log('confirm level →', await clickText(page, 'تأكيد المستوى|Confirm level|Confirm|Bestätigen|Continue|متابعة'));
await new Promise((r) => setTimeout(r, 700));

// Pick Tiere / Animals topic (unlocked at low levels)
console.log('topic →', await clickText(page, 'حيوانات|Animals|Tiere'));
await new Promise((r) => setTimeout(r, 300));
console.log('topic start →', await clickText(page, 'اختر اللعبة|ابدأ الموضوع|ابدأ|Start topic|Start|Choose game|Los'));
await new Promise((r) => setTimeout(r, 600));

await page.evaluate(() => document.querySelector('[data-mode="memory"]')?.click());
await new Promise((r) => setTimeout(r, 300));
await page.evaluate(() => document.querySelector('[data-start-mode]')?.click());
await new Promise((r) => setTimeout(r, 900));

const hasBoard = await page.waitForSelector('[data-memory-flip]', { timeout: 8000 }).then(() => true).catch(() => false);
console.log('memory board', hasBoard);
if (!hasBoard) {
  console.log(await page.evaluate(() => document.body.innerText.slice(0, 500)));
  throw new Error('Memory board not found');
}

// Confirm card-back art present on face-down cards
const backInfo = await page.evaluate(() => {
  const img = document.querySelector('[data-memory-flip] img[src*="card-back"]');
  return { hasBack: !!img, src: img?.getAttribute('src') || null };
});
console.log('card-back', backInfo);
await page.screenshot({ path: `${out}/memory-back.png` });

// Flip an IMAGE card first so memory-flipped.png shows a larger picture
await page.evaluate(() => {
  const imgCard = document.querySelector('[data-memory-flip] [data-kind="image"][data-flipped="0"]');
  imgCard?.click();
});
await new Promise((r) => setTimeout(r, 450));
// Also flip a word card for visual variety
await page.evaluate(() => {
  const word = document.querySelector('[data-memory-flip] [data-kind="word"][data-flipped="0"]');
  word?.click();
});
await new Promise((r) => setTimeout(r, 500));

const flipped = await page.evaluate(() => {
  const faceUp = [...document.querySelectorAll('[data-memory-flip] [data-flipped="1"]')];
  const imgFrame = document.querySelector('[data-memory-flip] [data-kind="image"][data-flipped="1"] [class*="imageFrame"], [data-memory-flip] [data-kind="image"][data-flipped="1"] img.image, [data-memory-flip] [data-flipped="1"] img:not([src*="card-back"])');
  // measure imageFrame via computed - look for white box parent
  let frameRect = null;
  const imageCard = document.querySelector('[data-memory-flip] [data-kind="image"][data-flipped="1"]');
  if (imageCard) {
    const frame = imageCard.querySelector('span > img')?.parentElement || imageCard.querySelector('img:not([src*="card-back"])')?.parentElement;
    if (frame) {
      const r = frame.getBoundingClientRect();
      const cardR = imageCard.getBoundingClientRect();
      frameRect = {
        w: Math.round(r.width), h: Math.round(r.height),
        cardW: Math.round(cardR.width), cardH: Math.round(cardR.height),
        pctOfCardW: Math.round((r.width / cardR.width) * 100),
      };
    }
  }
  return {
    flippedCount: faceUp.length,
    hasSpeak: !!document.querySelector('[data-memory-speak]'),
    hasBackArt: !!document.querySelector('[data-memory-flip] img[src*="card-back"]'),
    frameRect,
    kinds: faceUp.map((c) => c.getAttribute('data-kind')),
  };
});
console.log('flipped state', JSON.stringify(flipped));
await page.screenshot({ path: `${out}/memory-flipped.png` });

if (!flipped.hasSpeak) throw new Error('Speaker icon missing on face-up cards');
if (!flipped.kinds.includes('image')) throw new Error('Expected an image card face-up');
if (flipped.frameRect) {
  console.log(`imageFrame size: ${flipped.frameRect.w}x${flipped.frameRect.h}px (${flipped.frameRect.pctOfCardW}% of card width ${flipped.frameRect.cardW}px)`);
  console.log('size note: before CSS was min(88%, 92px); after min(96%, 120px) (~30% larger cap)');
}

await browser.close();
server.close();
console.log('OK — all nav + memory checks passed');
