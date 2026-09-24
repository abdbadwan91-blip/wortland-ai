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

async function clickText(page, re) {
  const clicked = await page.evaluate((pattern) => {
    const rx = new RegExp(pattern, 'i');
    const btns = [...document.querySelectorAll('button')];
    const b = btns.find((el) => rx.test(el.textContent || '') && !el.disabled);
    if (b) { b.click(); return (b.textContent || '').trim().slice(0, 60); }
    return null;
  }, re);
  console.log('click', re, '→', clicked);
  return clicked;
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

await clickText(page, 'ساحة الفلاش|Flash Arena|متابعة التعلم|Continue Learning');
await new Promise((r) => setTimeout(r, 500));

await clickText(page, 'تأكيد|Confirm|bestätigen');
await new Promise((r) => setTimeout(r, 500));

await page.waitForFunction(() => {
  const texts = [...document.querySelectorAll('button')].map((b) => b.textContent || '');
  return texts.some((t) => /طبيعة|Nature|Natur/.test(t) && !/🔒/.test(t));
}, { timeout: 5000 }).catch(() => null);

await page.evaluate(() => {
  const btns = [...document.querySelectorAll('button')];
  const b = btns.find((el) => {
    if (el.disabled) return false;
    const t = el.textContent || '';
    return /طبيعة|Nature|Natur/.test(t) && !/اختر|Choose|Spiel|Start|رجوع|Back|Zurück/.test(t);
  });
  b?.click();
});
await new Promise((r) => setTimeout(r, 400));
await shot(page, 'natur-topics.png');

await clickText(page, 'اختر اللعبة|Choose game|Spiel wählen');
await new Promise((r) => setTimeout(r, 400));

await clickText(page, '^ابدأ$|^Start$|^Starten$');
await new Promise((r) => setTimeout(r, 900));

await page.waitForSelector('[data-picture-match]', { timeout: 5000 });
await page.waitForFunction(() => {
  const imgs = [...document.querySelectorAll('[data-picture-match] img')];
  return imgs.length >= 2 && imgs.every((img) => img.complete && img.naturalWidth > 0);
}, { timeout: 8000 }).catch(() => null);
await new Promise((r) => setTimeout(r, 500));
await shot(page, 'natur-picture-match.png');

await browser.close();
console.log('done');
