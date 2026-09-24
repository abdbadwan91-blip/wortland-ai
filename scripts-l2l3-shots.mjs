import puppeteer from 'puppeteer-core';
import { mkdirSync, writeFileSync } from 'fs';

const OUT = '/workspace/deutsch-quest/screenshots';
mkdirSync(OUT, { recursive: true });

const PROFILE = {
  name: 'Omar',
  avatarId: 'k3',
  mode: 'junior',
  appLanguage: 'ar',
  translationLanguage: 'ar',
  learningLanguage: 'de',
  email: undefined,
  onboardingComplete: true,
  streak: 7,
  coins: 480,
  xp: 320,
  level: 2,
};

async function shot(page, name) {
  const path = `${OUT}/${name}`;
  await page.screenshot({ path, type: 'png' });
  console.log('saved', path);
}

async function dump(page, label) {
  const info = await page.evaluate(() => ({
    title: document.title,
    body: (document.body?.innerText || '').slice(0, 500),
    buttons: [...document.querySelectorAll('button')].map((b) => (b.textContent || '').trim()).slice(0, 20),
    screens: {
      quick: !!document.querySelector('[data-quick-pick]'),
      article: !!document.querySelector('[data-article-pick]'),
      map: !!document.querySelector('[data-quest-map]'),
      modes: [...document.querySelectorAll('[data-mode]')].map((el) => ({
        id: el.getAttribute('data-mode'),
        locked: el.getAttribute('data-locked'),
      })),
    },
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
          completed: [],
          falconSeen: false,
        }),
      );
    },
    { profile: PROFILE, level },
  );
  await page.reload({ waitUntil: 'networkidle0' });
  try {
    await page.waitForSelector('[data-quest-map]', { timeout: 10000 });
  } catch (e) {
    await dump(page, 'no-map-after-seed');
    throw e;
  }
}

async function goToGameModes(page, level) {
  await seed(page, level);
  const cont = await clickText(page, 'متابعة التعلم|Continue Learning|Weiterlernen');
  if (!cont) {
    // try feature tile
    await clickText(page, 'بطاقات|Flashcards|Karteikarten|ساحة');
  }
  await new Promise((r) => setTimeout(r, 700));
  await dump(page, 'after-continue');
  await pickWheelLevel(page, level);
  await new Promise((r) => setTimeout(r, 400));
  await clickText(page, 'تأكيد|Confirm|bestätigen');
  await new Promise((r) => setTimeout(r, 600));
  await dump(page, 'after-confirm');
  await clickText(page, 'اختر اللعبة|Choose game|Spiel wählen|topic\\.start');
  // topic.start label is "اختر اللعبة"
  await new Promise((r) => setTimeout(r, 600));
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

async function answerAll(page, resultsSel) {
  for (let i = 0; i < 14; i++) {
    const done = await page.evaluate(
      (sel) => Boolean(document.querySelector(sel)),
      resultsSel,
    );
    if (done) break;
    await page.evaluate(() => {
      const correct = document.querySelector('[data-correct="1"]');
      if (correct && !correct.disabled) correct.click();
    });
    await new Promise((r) => setTimeout(r, 900));
  }
  await page.waitForSelector(resultsSel, { timeout: 20000 });
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
  console.log('=== Level 2 Word Choice ===');
  await goToGameModes(page, 2);
  await selectModeAndStart(page, 'quick');
  await dump(page, 'after-start-l2');
  await page.waitForSelector('[data-quick-pick]', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 500));
  await shot(page, 'level2-round.png');
  await answerAll(page, '[data-quick-results]');
  await new Promise((r) => setTimeout(r, 400));
  await shot(page, 'level2-results.png');

  console.log('=== Level 3 Articles ===');
  await goToGameModes(page, 3);
  await selectModeAndStart(page, 'article');
  await dump(page, 'after-start-l3');
  await page.waitForSelector('[data-article-pick]', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 500));
  await shot(page, 'level3-round.png');
  await answerAll(page, '[data-article-results]');
  await new Promise((r) => setTimeout(r, 400));
  await shot(page, 'level3-results.png');
} catch (err) {
  console.error('FAILED', err);
  await dump(page, 'failure');
  await shot(page, 'debug-failure.png');
  writeFileSync('/tmp/l2l3-fail.txt', String(err));
  process.exitCode = 1;
}

await browser.close();
console.log('done');
