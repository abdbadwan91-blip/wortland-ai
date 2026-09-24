import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'fs';

const OUT = '/workspace/deutsch-quest/screenshots';
mkdirSync(OUT, { recursive: true });

const PROFILE = {
  name: 'Omar',
  avatarId: 'k3',
  mode: 'junior',
  appLanguage: 'en',
  translationLanguage: 'en',
  learningLanguage: 'de',
  email: undefined,
  onboardingComplete: true,
  streak: 7,
  coins: 480,
  xp: 320,
  level: 4,
};

async function shot(page, name) {
  const path = `${OUT}/${name}`;
  await page.screenshot({ path, type: 'png' });
  console.log('saved', path);
}

async function clickText(page, re) {
  const clicked = await page.evaluate((pattern) => {
    const rx = new RegExp(pattern, 'i');
    const btns = [...document.querySelectorAll('button')];
    const b = btns.find((el) => rx.test((el.textContent || '').trim()));
    if (b) {
      b.click();
      return (b.textContent || '').trim().slice(0, 80);
    }
    return null;
  }, re);
  console.log('click', re, '→', clicked);
  return clicked;
}

async function pickWheelLevel(page, n) {
  const ok = await page.evaluate((level) => {
    const texts = [...document.querySelectorAll('svg text')];
    const node = texts.find((t) => (t.textContent || '').trim() === String(level));
    const g = node?.closest('g');
    if (!g) return false;
    g.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    return true;
  }, n);
  console.log('wheel', n, ok);
  return ok;
}

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--window-size=430,900'],
  defaultViewport: { width: 390, height: 844, deviceScaleFactor: 2 },
});

const page = await browser.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
await page.evaluate((profile) => {
  localStorage.clear();
  localStorage.setItem('deutsch-quest-profile-v1', JSON.stringify(profile));
  localStorage.setItem(
    'wortland-map-progress-v1',
    JSON.stringify({ unlockedStage: 4, completed: [1, 2, 3], falconSeen: true }),
  );
}, PROFILE);
await page.reload({ waitUntil: 'networkidle0' });
await page.waitForSelector('[data-quest-map]', { timeout: 12000 });

await clickText(page, 'Continue Learning|متابعة التعلم|Weiterlernen');
await new Promise((r) => setTimeout(r, 700));
await pickWheelLevel(page, 4);
await new Promise((r) => setTimeout(r, 350));
await clickText(page, 'Confirm Level|Confirm|تأكيد|bestätigen');
await new Promise((r) => setTimeout(r, 500));
await clickText(page, 'Choose game|اختر اللعبة|Spiel wählen');
await new Promise((r) => setTimeout(r, 700));

await page.waitForSelector('[data-mode="memory"]', { timeout: 8000 });
const mem = await page.evaluate(() => {
  const el = document.querySelector('[data-mode="memory"]');
  return { locked: el?.getAttribute('data-locked'), text: el?.textContent?.slice(0, 60) };
});
console.log('memory mode', mem);
await page.click('[data-mode="memory"]');
await new Promise((r) => setTimeout(r, 400));
await shot(page, 'memory-flip-modes.png');

await clickText(page, '^Start$|^ابدأ$|^Starten$');
await new Promise((r) => setTimeout(r, 1000));
await page.waitForSelector('[data-memory-flip]', { timeout: 8000 });

const size = await page.evaluate(() => {
  const c = document.querySelector('[data-card]');
  if (!c) return null;
  const r = c.getBoundingClientRect();
  const cs = getComputedStyle(c);
  const inner = c.querySelector('[class*="cardInner"], [class*="CardInner"]');
  const ir = inner?.getBoundingClientRect();
  return {
    w: Math.round(r.width),
    h: Math.round(r.height),
    aspect: cs.aspectRatio,
    minH: cs.minHeight,
    inner: ir ? { w: Math.round(ir.width), h: Math.round(ir.height) } : null,
    count: document.querySelectorAll('[data-card]').length,
  };
});
console.log('card metrics', JSON.stringify(size));

// Match one pair
await page.evaluate(() => {
  const cards = [...document.querySelectorAll('[data-card][data-matched="0"]')];
  const first = cards[0];
  if (!first) return;
  first.click();
  const lo = first.getAttribute('data-loid');
  const kind = first.getAttribute('data-kind');
  const partner = cards.find(
    (c) =>
      c !== first &&
      c.getAttribute('data-loid') === lo &&
      c.getAttribute('data-kind') !== kind,
  );
  setTimeout(() => partner?.click(), 320);
});
await new Promise((r) => setTimeout(r, 1200));

// Peek two more cards mid-miss for visual interest
await page.evaluate(() => {
  const cards = [...document.querySelectorAll('[data-card][data-matched="0"][data-flipped="0"]')];
  if (cards.length >= 2) {
    cards[0].click();
    setTimeout(() => cards[1].click(), 280);
  }
});
await new Promise((r) => setTimeout(r, 480));
await shot(page, 'memory-flip-board.png');

await browser.close();
console.log('done');
