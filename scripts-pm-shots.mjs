import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'fs';

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
  level: 1,
};

async function shot(page, name) {
  const path = `${OUT}/${name}`;
  await page.screenshot({ path, type: 'png' });
  console.log('saved', path);
}

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--window-size=430,900'],
  defaultViewport: { width: 390, height: 844, deviceScaleFactor: 2 },
});

const page = await browser.newPage();
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
await page.evaluate((profile) => {
  localStorage.clear();
  localStorage.setItem('deutsch-quest-profile-v1', JSON.stringify(profile));
  localStorage.setItem(
    'wortland-map-progress-v1',
    JSON.stringify({ unlockedStage: 1, completed: [], falconSeen: false }),
  );
}, PROFILE);
await page.reload({ waitUntil: 'networkidle0' });
await page.waitForSelector('[data-quest-map]', { timeout: 8000 });

// Navigate: Flash Arena → Level Wheel confirm → Topic Tiere → Picture Match → Start
async function clickText(re) {
  const clicked = await page.evaluate((pattern) => {
    const rx = new RegExp(pattern, 'i');
    const btns = [...document.querySelectorAll('button')];
    const b = btns.find((el) => rx.test(el.textContent || ''));
    if (b) { b.click(); return b.textContent; }
    return null;
  }, re);
  console.log('click', re, '→', clicked);
  return clicked;
}

// Open Flash Arena via feature or continue
await clickText('ساحة الفلاش|Flash Arena|متابعة التعلم|Continue Learning');
await new Promise((r) => setTimeout(r, 500));

// Confirm level on wheel
await clickText('تأكيد|Confirm|bestätigen');
await new Promise((r) => setTimeout(r, 400));

// Topic already selected Tiere — start / choose game
await clickText('اختر اللعبة|Choose game|Spiel wählen');
await new Promise((r) => setTimeout(r, 400));

// Start picture match
await clickText('^ابدأ$|^Start$');
await new Promise((r) => setTimeout(r, 800));

await page.waitForSelector('[data-picture-match]', { timeout: 5000 });
await new Promise((r) => setTimeout(r, 600));
await shot(page, 'picture-match-round.png');

// Tap correct option
await page.evaluate(() => {
  const correct = document.querySelector('[data-correct="1"]');
  correct?.click();
});
await new Promise((r) => setTimeout(r, 500));
await shot(page, 'picture-match-correct.png');

// Auto-answer remaining correctly for results
for (let i = 0; i < 12; i++) {
  const done = await page.evaluate(() => Boolean(document.querySelector('[data-picture-results]')));
  if (done) break;
  await page.evaluate(() => {
    const correct = document.querySelector('[data-correct="1"]');
    if (correct && !correct.disabled) correct.click();
  });
  await new Promise((r) => setTimeout(r, 850));
}

await page.waitForSelector('[data-picture-results]', { timeout: 15000 });
await new Promise((r) => setTimeout(r, 400));
await shot(page, 'picture-match-results.png');

await browser.close();
console.log('done');
