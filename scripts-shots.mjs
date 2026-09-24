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
  level: 6,
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

// --- Splash ---
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
await page.evaluate(() => {
  localStorage.clear();
});
await page.reload({ waitUntil: 'networkidle0' });
await page.waitForSelector('h1');
await new Promise((r) => setTimeout(r, 600));
await shot(page, 'splash-wortland.png');

// --- Home mountain (stage 4 current) ---
await page.evaluate((profile) => {
  localStorage.setItem('deutsch-quest-profile-v1', JSON.stringify(profile));
  localStorage.setItem(
    'wortland-map-progress-v1',
    JSON.stringify({ unlockedStage: 4, completed: [1, 2, 3], falconSeen: false }),
  );
}, PROFILE);
await page.reload({ waitUntil: 'networkidle0' });
await page.waitForSelector('[data-quest-map]');
await new Promise((r) => setTimeout(r, 700));
await shot(page, 'home-mountain.png');

// --- Falcon transition overlay ---
await page.evaluate(() => {
  window.dispatchEvent(new CustomEvent('wortland:falcon'));
});
await new Promise((r) => setTimeout(r, 500));
await shot(page, 'falcon-transition.png');
// dismiss
await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find((b) =>
    /Skip|تخطي|Überspringen/i.test(b.textContent || ''),
  );
  btn?.click();
});
await new Promise((r) => setTimeout(r, 300));

// --- Home forest scrolled ---
await page.evaluate((profile) => {
  localStorage.setItem('deutsch-quest-profile-v1', JSON.stringify(profile));
  localStorage.setItem(
    'wortland-map-progress-v1',
    JSON.stringify({
      unlockedStage: 13,
      completed: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      falconSeen: true,
    }),
  );
}, PROFILE);
await page.reload({ waitUntil: 'networkidle0' });
await page.waitForSelector('[data-quest-map]');
await page.evaluate(() => {
  const forest = document.querySelector('[data-zone="forest"]');
  forest?.scrollIntoView({ behavior: 'instant', block: 'start' });
});
await new Promise((r) => setTimeout(r, 700));
await shot(page, 'home-forest.png');

await browser.close();
console.log('done');
