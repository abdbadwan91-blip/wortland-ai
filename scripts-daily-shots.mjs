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

function todayKey() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--window-size=430,1100'],
  defaultViewport: { width: 390, height: 1100, deviceScaleFactor: 2 },
});

const page = await browser.newPage();
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });

await page.evaluate(
  (profile, daily) => {
    localStorage.clear();
    localStorage.setItem('deutsch-quest-profile-v1', JSON.stringify(profile));
    localStorage.setItem(
      'wortland-map-progress-v1',
      JSON.stringify({ unlockedStage: 4, completed: [1, 2, 3], falconSeen: false }),
    );
    localStorage.setItem('wortland.daily.v1', JSON.stringify(daily));
  },
  PROFILE,
  {
    date: todayKey(),
    goals: [
      { id: 'rounds', target: 1, progress: 1, claimed: false },
      { id: 'correct', target: 8, progress: 5, claimed: false },
      { id: 'xp', target: 50, progress: 35, claimed: false },
    ],
    bonusClaimed: false,
  },
);

await page.reload({ waitUntil: 'networkidle0' });
await page.waitForSelector('[data-daily-mission]');

const metrics = await page.evaluate(() => {
  const screen = document.querySelector('.screen');
  if (screen) screen.scrollTop = 0;
  const el = document.querySelector('[data-daily-mission]');
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  return {
    x: r.x,
    y: r.y,
    w: r.width,
    h: r.height,
    display: cs.display,
    visibility: cs.visibility,
    opacity: cs.opacity,
    overflow: cs.overflow,
    height: cs.height,
    children: el.children.length,
    bodyH: document.querySelector('[class*="missionBody"]')?.getBoundingClientRect().height,
  };
});
console.log('metrics', metrics);

await new Promise((r) => setTimeout(r, 500));

// Full taller viewport so mission + map both fit
await page.screenshot({
  path: `${OUT}/daily-mission-home.png`,
  type: 'png',
});
console.log('saved full');

// Element screenshot
const handle = await page.$('[data-daily-mission]');
await handle.screenshot({ path: `${OUT}/daily-mission-panel.png`, type: 'png' });
console.log('saved panel crop');

await browser.close();
