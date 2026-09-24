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
  xp: 420,
  level: 5,
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

async function clickChipByText(page, text) {
  return page.evaluate((want) => {
    const chips = [...document.querySelectorAll('[data-chip]')];
    const el = chips.find((c) => (c.textContent || '').trim() === want);
    if (!el) return false;
    el.click();
    return true;
  }, text);
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
    JSON.stringify({ unlockedStage: 5, completed: [1, 2, 3, 4], falconSeen: true }),
  );
}, PROFILE);
await page.reload({ waitUntil: 'networkidle0' });
await page.waitForSelector('[data-quest-map]', { timeout: 12000 });

await clickText(page, 'Continue Learning|متابعة التعلم|Weiterlernen');
await new Promise((r) => setTimeout(r, 700));
await pickWheelLevel(page, 5);
await new Promise((r) => setTimeout(r, 350));
await clickText(page, 'Confirm Level|Confirm|تأكيد|bestätigen');
await new Promise((r) => setTimeout(r, 500));
await clickText(page, 'Choose game|اختر اللعبة|Spiel wählen');
await new Promise((r) => setTimeout(r, 700));

await page.waitForSelector('[data-mode="build"]', { timeout: 8000 });
const buildMode = await page.evaluate(() => {
  const el = document.querySelector('[data-mode="build"]');
  return { locked: el?.getAttribute('data-locked'), text: el?.textContent?.slice(0, 80) };
});
console.log('build mode', buildMode);
if (buildMode.locked === '1') {
  console.error('FAIL: build still locked at L5');
  process.exit(1);
}

await page.click('[data-mode="build"]');
await new Promise((r) => setTimeout(r, 400));
await shot(page, 'build-it-modes.png');

await clickText(page, '^Start$|^ابدأ$|^Starten$');
await new Promise((r) => setTimeout(r, 1000));
await page.waitForSelector('[data-build-it]', { timeout: 8000 });

const answer = await page.evaluate(() =>
  document.querySelector('[data-build-it]')?.getAttribute('data-answer')?.split('|') ?? [],
);
console.log('answer', answer);

// Mid rebuild: place first two tokens in correct order
for (let i = 0; i < Math.min(2, answer.length); i++) {
  const ok = await clickChipByText(page, answer[i]);
  console.log('place', answer[i], ok);
  await new Promise((r) => setTimeout(r, 200));
}

const mid = await page.evaluate(() => ({
  chips: document.querySelectorAll('[data-chip]').length,
  filled: document.querySelectorAll('[data-filled="1"]').length,
  slots: document.querySelectorAll('[data-slot]').length,
  lemma: document.querySelector('[class*="lemma"]')?.textContent?.trim(),
  slotTexts: [...document.querySelectorAll('[data-filled="1"]')].map((el) =>
    (el.textContent || '').trim(),
  ),
}));
console.log('mid rebuild', mid);
await shot(page, 'build-it-play.png');

// Soft miss: clear and place wrong order
await page.click('[data-clear]');
await new Promise((r) => setTimeout(r, 200));
if (answer.length >= 2) {
  // Place last token first (wrong)
  await clickChipByText(page, answer[answer.length - 1]);
  await new Promise((r) => setTimeout(r, 150));
  for (let i = 0; i < answer.length - 1; i++) {
    await clickChipByText(page, answer[i]);
    await new Promise((r) => setTimeout(r, 150));
  }
  await new Promise((r) => setTimeout(r, 500));
  const miss = await page.evaluate(() => ({
    feedback: document.querySelector('[class*="feedback"]')?.textContent?.trim(),
    shake: !!document.querySelector('[class*="shake"]'),
  }));
  console.log('soft miss', miss);
  await new Promise((r) => setTimeout(r, 900)); // wait for clear-after-miss
}

// Correct rebuild
await page.click('[data-clear]').catch(() => {});
await new Promise((r) => setTimeout(r, 150));
for (const tok of answer) {
  await clickChipByText(page, tok);
  await new Promise((r) => setTimeout(r, 180));
}
await new Promise((r) => setTimeout(r, 900));
const okState = await page.evaluate(() => ({
  feedback: document.querySelector('[class*="feedback"]')?.textContent?.trim(),
  progress: document.querySelector('[class*="progressLabel"]')?.textContent?.trim(),
}));
console.log('correct', okState);

if (!/Perfect|ممتاز|Perfekt/i.test(okState.feedback || '')) {
  // Might have already advanced to Q2
  console.log('note: may have advanced; progress=', okState.progress);
}

await browser.close();
console.log('done');
