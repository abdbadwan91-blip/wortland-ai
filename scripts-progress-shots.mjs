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
  apfel: {
    loId: 'apfel',
    topicId: 'essen',
    score: 65,
    ease: 2.5,
    intervalDays: 2,
    nextReviewAt: new Date(now + 86400_000).toISOString(),
    lastResult: 'good',
    reviews: 3,
  },
  brot: {
    loId: 'brot',
    topicId: 'essen',
    score: 45,
    ease: 2.3,
    intervalDays: 1,
    nextReviewAt: new Date(now - 1000).toISOString(),
    lastResult: 'again',
    reviews: 2,
  },
  rot: {
    loId: 'rot',
    topicId: 'farben',
    score: 90,
    ease: 2.7,
    intervalDays: 7,
    nextReviewAt: new Date(now + 5 * 86400_000).toISOString(),
    lastResult: 'good',
    reviews: 6,
  },
  mutter: {
    loId: 'mutter',
    topicId: 'familie',
    score: 50,
    ease: 2.4,
    intervalDays: 1,
    nextReviewAt: new Date(now - 1000).toISOString(),
    lastResult: 'again',
    reviews: 2,
  },
};

function dateKey(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const heatmap = {};
const pattern = [
  [0, 1],
  [-1, 2],
  [-2, 0],
  [-3, 4],
  [-4, 1],
  [-5, 3],
  [-6, 0],
  [-7, 2],
  [-8, 6],
  [-9, 1],
  [-10, 0],
  [-11, 3],
  [-12, 2],
  [-14, 5],
  [-15, 1],
  [-17, 2],
  [-18, 0],
  [-20, 4],
  [-21, 1],
  [-22, 3],
  [-24, 2],
  [-25, 7],
  [-27, 1],
  [-28, 2],
  [-30, 3],
  [-32, 1],
  [-33, 4],
  [-34, 2],
];
for (const [off, count] of pattern) {
  if (count > 0) heatmap[dateKey(off)] = count;
}

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--window-size=430,900'],
  defaultViewport: { width: 390, height: 844, deviceScaleFactor: 2 },
});

const page = await browser.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));

await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle0' });
await page.evaluate(
  (profile, masteryStore, heat) => {
    localStorage.clear();
    localStorage.setItem('deutsch-quest-profile-v1', JSON.stringify(profile));
    localStorage.setItem(
      'wortland-map-progress-v1',
      JSON.stringify({ unlockedStage: 4, completed: [1, 2, 3], falconSeen: true }),
    );
    localStorage.setItem('wortland.mastery.v1', JSON.stringify(masteryStore));
    localStorage.setItem('wortland.heatmap.v1', JSON.stringify(heat));
  },
  PROFILE,
  mastery,
  heatmap,
);
await page.reload({ waitUntil: 'networkidle0' });
await page.waitForSelector('[data-quest-map]', { timeout: 12000 });

const clicked = await page.evaluate(() => {
  const btns = [...document.querySelectorAll('button')];
  const b = btns.find((el) => /التقدم|Progress|Fortschritt/i.test((el.textContent || '').trim()));
  if (b) {
    b.click();
    return (b.textContent || '').trim().slice(0, 40);
  }
  return null;
});
console.log('nav progress →', clicked);
await page.waitForSelector('[data-progress-screen]', { timeout: 8000 });
await new Promise((r) => setTimeout(r, 600));

const path = `${OUT}/progress-heatmap.png`;
await page.screenshot({ path, type: 'png' });
console.log('saved', path);

await browser.close();
