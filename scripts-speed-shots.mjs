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
  streak: 8,
  coins: 620,
  xp: 880,
  level: 8,
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
    JSON.stringify({ unlockedStage: 8, completed: [1, 2, 3, 4, 5, 6, 7], falconSeen: true }),
  );
}, PROFILE);
await page.reload({ waitUntil: 'networkidle0' });
await page.waitForSelector('[data-quest-map]', { timeout: 12000 });

await clickText(page, 'Continue Learning|متابعة التعلم|Weiterlernen');
await new Promise((r) => setTimeout(r, 700));
await pickWheelLevel(page, 8);
await new Promise((r) => setTimeout(r, 350));
await clickText(page, 'Confirm Level|Confirm|تأكيد|bestätigen');
await new Promise((r) => setTimeout(r, 500));
await clickText(page, 'Choose game|اختر اللعبة|Spiel wählen');
await new Promise((r) => setTimeout(r, 700));

await page.waitForSelector('[data-mode="speed"]', { timeout: 8000 });
const speedMode = await page.evaluate(() => {
  const el = document.querySelector('[data-mode="speed"]');
  return { locked: el?.getAttribute('data-locked'), text: el?.textContent?.slice(0, 120) };
});
console.log('speed mode', speedMode);
if (speedMode.locked === '1') {
  console.error('FAIL: speed still locked at L8');
  process.exit(1);
}

await page.click('[data-mode="speed"]');
await new Promise((r) => setTimeout(r, 400));
await shot(page, 'speed-round-modes.png');

await clickText(page, '^Start$|^ابدأ$|^Starten$');
await new Promise((r) => setTimeout(r, 1000));
await page.waitForSelector('[data-speed-round]', { timeout: 8000 });

const playInfo = await page.evaluate(() => {
  const root = document.querySelector('[data-speed-round]');
  const timer = document.querySelector('[data-speed-timer]');
  return {
    hasRoot: !!root,
    hasTimer: !!timer,
    timerText: timer?.textContent?.trim(),
    hasSpeak: !!document.querySelector('[data-speak]'),
    options: document.querySelectorAll('[data-option]').length,
    hasImage: !!document.querySelector('[data-target-image]'),
  };
});
console.log('play', playInfo);
if (!playInfo.hasTimer || !playInfo.timerText || !/s$/.test(playInfo.timerText.trim()) || playInfo.options < 4) {
  console.error('FAIL: play screen incomplete or timer missing', playInfo);
  process.exit(1);
}

await shot(page, 'speed-round-play.png');
await browser.close();
console.log('OK speed round shots');
