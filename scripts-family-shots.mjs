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
  xp: 320,
  level: 4,
};

const FAMILY = {
  code: 'QUEST7',
  name: 'The Adventurers',
  members: [
    { id: 'self', name: 'Omar', xp: 320, isSelf: true },
    { id: 'fake-maya', name: 'Maya', xp: 240 },
    { id: 'fake-leo', name: 'Leo', xp: 180 },
    { id: 'fake-sara', name: 'Sara', xp: 160 },
  ],
};

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--window-size=430,900'],
  defaultViewport: { width: 390, height: 844, deviceScaleFactor: 2 },
});

const page = await browser.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));

await page.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle0' });
await page.evaluate(
  (profile) => {
    localStorage.clear();
    localStorage.setItem('deutsch-quest-profile-v1', JSON.stringify(profile));
    localStorage.setItem(
      'wortland-map-progress-v1',
      JSON.stringify({ unlockedStage: 4, completed: [1, 2, 3], falconSeen: true }),
    );
  },
  PROFILE,
);
await page.reload({ waitUntil: 'networkidle0' });
await page.waitForSelector('[data-feature="family"]', { timeout: 12000 });

// Scroll family CTA into view on Home
await page.evaluate(() => {
  document.querySelector('[data-feature="family"]')?.scrollIntoView({ block: 'center' });
});
await new Promise((r) => setTimeout(r, 400));

const homeCta = `${OUT}/family-home-cta.png`;
await page.screenshot({ path: homeCta, type: 'png' });
console.log('saved', homeCta);

// Open Family screen (empty first, then seed family for polished board shot)
await page.click('[data-feature="family"]');
await page.waitForSelector('[data-family-screen]', { timeout: 12000 });
await new Promise((r) => setTimeout(r, 300));

// Seed a family and reload into board view for a polished screenshot
await page.evaluate((family) => {
  localStorage.setItem('wortland.family.v1', JSON.stringify(family));
}, FAMILY);
await page.reload({ waitUntil: 'networkidle0' });
// After reload we're on home again — navigate to family
await page.waitForSelector('[data-feature="family"]', { timeout: 12000 });
await page.click('[data-feature="family"]');
await page.waitForSelector('[data-family-board]', { timeout: 12000 });
await new Promise((r) => setTimeout(r, 400));

const familyScreen = `${OUT}/family-screen.png`;
await page.screenshot({ path: familyScreen, type: 'png' });
console.log('saved', familyScreen);

const soon = await page.$eval('[data-feature="family"]', () => null).catch(() => null);
console.log('onFamilyBoard', !!(await page.$('[data-family-board]')));

await browser.close();
