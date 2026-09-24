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
  pferd: {
    loId: 'pferd',
    topicId: 'tiere',
    score: 70,
    ease: 2.5,
    intervalDays: 2,
    nextReviewAt: new Date(now + 86400_000).toISOString(),
    lastResult: 'good',
    reviews: 4,
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
await page.waitForSelector('[data-quest-map]', { timeout: 12000 });

// Navigate to Profile via bottom nav
const clicked = await page.evaluate(() => {
  const btns = [...document.querySelectorAll('button, a, nav *')];
  const b = btns.find((el) => /الملف|Profile|Profil/i.test((el.textContent || '').trim()));
  if (b) {
    b.click();
    return (b.textContent || '').trim().slice(0, 40);
  }
  return null;
});
console.log('nav profile →', clicked);
await new Promise((r) => setTimeout(r, 800));

const path = `${OUT}/mastery-ui.png`;
await page.screenshot({ path, type: 'png' });
console.log('saved', path);

await browser.close();
