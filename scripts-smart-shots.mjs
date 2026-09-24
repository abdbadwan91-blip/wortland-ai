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
  level: 4,
};

const now = Date.now();
const mastery = {
  katze: {
    loId: 'katze',
    topicId: 'tiere',
    score: 40,
    ease: 2.3,
    intervalDays: 1,
    nextReviewAt: new Date(now - 3600_000).toISOString(),
    lastResult: 'again',
    reviews: 3,
  },
  hund: {
    loId: 'hund',
    topicId: 'tiere',
    score: 55,
    ease: 2.4,
    intervalDays: 1,
    nextReviewAt: new Date(now - 600_000).toISOString(),
    lastResult: 'again',
    reviews: 2,
  },
  apfel: {
    loId: 'apfel',
    topicId: 'essen',
    score: 30,
    ease: 2.2,
    intervalDays: 1,
    nextReviewAt: new Date(now - 1000).toISOString(),
    lastResult: 'again',
    reviews: 2,
  },
  vogel: {
    loId: 'vogel',
    topicId: 'tiere',
    score: 20,
    ease: 2.1,
    intervalDays: 1,
    nextReviewAt: new Date(now - 1000).toISOString(),
    lastResult: 'again',
    reviews: 1,
  },
  fisch: {
    loId: 'fisch',
    topicId: 'tiere',
    score: 80,
    ease: 2.6,
    intervalDays: 4,
    nextReviewAt: new Date(now + 3 * 86400_000).toISOString(),
    lastResult: 'good',
    reviews: 5,
  },
};

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--window-size=430,900'],
  defaultViewport: { width: 390, height: 844, deviceScaleFactor: 2 },
});

const page = await browser.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
await page.evaluate(
  (profile, masteryStore) => {
    localStorage.clear();
    localStorage.setItem('deutsch-quest-profile-v1', JSON.stringify(profile));
    localStorage.setItem(
      'wortland-map-progress-v1',
      JSON.stringify({ unlockedStage: 4, completed: [1, 2, 3], falconSeen: true }),
    );
    localStorage.setItem('wortland.mastery.v1', JSON.stringify(masteryStore));
  },
  PROFILE,
  mastery,
);
await page.reload({ waitUntil: 'networkidle0' });
await page.waitForSelector('[data-smart-training]', { timeout: 12000 });

// Scroll smart card into view
await page.evaluate(() => {
  document.querySelector('[data-smart-training]')?.scrollIntoView({ block: 'center' });
});
await new Promise((r) => setTimeout(r, 400));

const homePath = `${OUT}/smart-training-home.png`;
await page.screenshot({ path: homePath, type: 'png' });
console.log('saved', homePath);

const startEnabled = await page.$eval(
  '[data-smart-start]',
  (el) => !el.disabled,
);
console.log('startEnabled', startEnabled);

if (startEnabled) {
  await page.click('[data-smart-start]');
  await page.waitForSelector('[data-quick-pick][data-smart-training="1"]', {
    timeout: 12000,
  });
  await new Promise((r) => setTimeout(r, 500));
  const playPath = `${OUT}/smart-training-play.png`;
  await page.screenshot({ path: playPath, type: 'png' });
  console.log('saved', playPath);
} else {
  console.log('skip play shot — start disabled');
}

await browser.close();
