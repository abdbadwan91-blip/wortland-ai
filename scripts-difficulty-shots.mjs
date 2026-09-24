import puppeteer from 'puppeteer-core';
import { mkdirSync, writeFileSync } from 'fs';

const OUT = '/workspace/deutsch-quest/screenshots';
mkdirSync(OUT, { recursive: true });

const PROFILE = {
  name: 'Omar',
  avatarId: 'k3',
  mode: 'junior',
  appLanguage: 'en',
  translationLanguage: 'ar',
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

async function dump(page, label) {
  const info = await page.evaluate(() => ({
    title: document.title,
    body: (document.body?.innerText || '').slice(0, 600),
    buttons: [...document.querySelectorAll('button')].map((b) => (b.textContent || '').trim()).slice(0, 24),
    options: document.querySelectorAll('[data-picture-match] [data-option]').length,
    dataOptions: document.querySelector('[data-picture-match] [data-options]')?.getAttribute('data-options'),
    modes: [...document.querySelectorAll('[data-mode]')].map((el) => ({
      id: el.getAttribute('data-mode'),
      locked: el.getAttribute('data-locked'),
    })),
  }));
  console.log('DUMP', label, JSON.stringify(info, null, 2));
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
    if (!node) return false;
    const g = node.closest('g');
    if (!g) return false;
    g.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    return true;
  }, n);
  console.log('wheel level', n, ok);
  return ok;
}

async function seed(page, level) {
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  await page.evaluate(
    ({ profile, level }) => {
      localStorage.clear();
      localStorage.setItem(
        'deutsch-quest-profile-v1',
        JSON.stringify({ ...profile, level }),
      );
      localStorage.setItem(
        'wortland-map-progress-v1',
        JSON.stringify({
          unlockedStage: Math.max(1, level),
          completed: Array.from({ length: Math.max(0, level - 1) }, (_, i) => i + 1),
          falconSeen: level > 5,
        }),
      );
    },
    { profile: PROFILE, level },
  );
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForSelector('[data-quest-map]', { timeout: 10000 });
}

async function goToGameModes(page, level) {
  await seed(page, level);
  const cont = await clickText(page, 'متابعة التعلم|Continue Learning|Weiterlernen');
  if (!cont) {
    await clickText(page, 'بطاقات|Flashcards|Karteikarten|ساحة');
  }
  await new Promise((r) => setTimeout(r, 700));
  await pickWheelLevel(page, level);
  await new Promise((r) => setTimeout(r, 400));
  await shot(page, `level-difficulty-wheel-l${level}.png`);
  await clickText(page, 'تأكيد|Confirm|bestätigen');
  await new Promise((r) => setTimeout(r, 600));
  await clickText(page, 'اختر اللعبة|Choose game|Spiel wählen|Start learning|Los');
  // topic screen CTA
  await clickText(page, 'اختر اللعبة|Choose game|Spiel wählen');
  await new Promise((r) => setTimeout(r, 700));
  await dump(page, 'game-modes');
}

async function selectModeAndStart(page, modeId) {
  const clicked = await page.evaluate((id) => {
    const row = document.querySelector(`[data-mode="${id}"]`);
    if (!row) return 'missing';
    if (row.getAttribute('data-locked') === '1') return 'locked';
    row.click();
    return 'ok';
  }, modeId);
  console.log('select mode', modeId, clicked);
  await new Promise((r) => setTimeout(r, 300));
  await clickText(page, '^ابدأ$|^Start$|^Starten$');
  await new Promise((r) => setTimeout(r, 1000));
}

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--window-size=430,900'],
  defaultViewport: { width: 390, height: 844, deviceScaleFactor: 2 },
});

const page = await browser.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));

try {
  console.log('=== Level 4 Picture Match (5 options) ===');
  await goToGameModes(page, 4);
  await shot(page, 'level-difficulty-l4-modes.png');
  await selectModeAndStart(page, 'picture');
  await page.waitForSelector('[data-picture-match]', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 600));
  await dump(page, 'l4-picture');
  await shot(page, 'level-difficulty-l4.png');
} catch (err) {
  console.error('FAILED', err);
  await dump(page, 'failure');
  await shot(page, 'debug-difficulty-fail.png');
  writeFileSync('/tmp/difficulty-fail.txt', String(err));
  process.exitCode = 1;
}

await browser.close();
console.log('done');
