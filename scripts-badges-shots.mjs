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
  streak: 5,
  coins: 480,
  xp: 320,
  level: 4,
};

const now = new Date().toISOString();
const badges = {
  earned: [
    { id: 'first-session', earnedAt: now },
    { id: 'streak-3', earnedAt: now },
    { id: 'tierfreund', earnedAt: now },
    { id: 'rennwolf', earnedAt: now },
    { id: 'ohrenjaeger', earnedAt: now },
  ],
};

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--window-size=430,940'],
  defaultViewport: { width: 390, height: 900, deviceScaleFactor: 2 },
});

const page = await browser.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
await page.evaluate(
  (profile, badgesStore) => {
    localStorage.clear();
    localStorage.setItem('deutsch-quest-profile-v1', JSON.stringify(profile));
    localStorage.setItem(
      'wortland-map-progress-v1',
      JSON.stringify({ unlockedStage: 4, completed: [1, 2, 3], falconSeen: true }),
    );
    localStorage.setItem('wortland.badges.v1', JSON.stringify(badgesStore));
  },
  PROFILE,
  badges,
);
await page.reload({ waitUntil: 'networkidle0' });
await page.waitForSelector('[data-nav="profile"], [data-bottom-nav], nav, .with-nav', {
  timeout: 8000,
}).catch(() => {});

// Navigate to profile via bottom nav
const clicked = await page.evaluate(() => {
  const candidates = Array.from(
    document.querySelectorAll('button, a, [role="button"]'),
  );
  const btn = candidates.find((el) => {
    const t = (el.textContent || '').toLowerCase();
    const d = el.getAttribute('data-nav') || el.getAttribute('data-screen') || '';
    return d.includes('profile') || t.includes('profile') || t.includes('profil');
  });
  if (btn) {
    btn.click();
    return true;
  }
  return false;
});
console.log('nav click', clicked);

await page.waitForSelector('[data-badges]', { timeout: 8000 });
await new Promise((r) => setTimeout(r, 400));

const path = `${OUT}/badges-profile.png`;
await page.screenshot({ path, fullPage: true });
console.log('wrote', path);

// Also verify locked/unlocked attributes
const status = await page.evaluate(() => {
  const cells = Array.from(document.querySelectorAll('[data-badge]'));
  return cells.map((el) => ({
    id: el.getAttribute('data-badge'),
    unlocked: el.getAttribute('data-unlocked'),
  }));
});
console.log('badges', JSON.stringify(status, null, 2));

await browser.close();
