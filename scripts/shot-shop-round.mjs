import puppeteer from 'puppeteer-core';
import { createServer } from 'http';
import { readFileSync, existsSync, statSync, mkdirSync } from 'fs';
import { join, extname } from 'path';

const root = new URL('../dist/', import.meta.url).pathname;
const out = '/workspace/shots';
mkdirSync(out, { recursive: true });
const mime = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.json':'application/json','.webmanifest':'application/manifest+json' };
const server = createServer((req,res) => {
  let url = decodeURIComponent((req.url||'/').split('?')[0]);
  if (url === '/') url = '/index.html';
  const file = join(root, url.replace(/^\//,''));
  if (!existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end('no'); return; }
  res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise(r => server.listen(4177, r));

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox','--disable-dev-shm-usage','--window-size=390,844'],
  defaultViewport: { width: 390, height: 844, deviceScaleFactor: 2 },
});

const profileDone = {
  name: 'لينا', avatarId: 'k1', mode: 'junior', appLanguage: 'ar',
  translationLanguage: 'ar', learningLanguage: 'de', onboardingComplete: true,
  streak: 3, coins: 520, xp: 240, level: 4,
};

async function withProfile(profile) {
  const page = await browser.newPage();
  await page.evaluateOnNewDocument((p) => {
    localStorage.setItem('deutsch-quest-profile-v1', JSON.stringify(p));
  }, profile);
  await page.goto('http://127.0.0.1:4177/', { waitUntil: 'networkidle0', timeout: 60000 });
  await new Promise(r => setTimeout(r, 800));
  return page;
}

let page = await withProfile(profileDone);
await page.screenshot({ path: `${out}/01-home-nav.png` });
await page.evaluate(() => { const s = document.querySelector('.screen'); if (s) s.scrollTop = 1400; });
await new Promise(r => setTimeout(r, 400));
await page.screenshot({ path: `${out}/02-home-scrolled-nav.png` });

await page.evaluate(() => {
  const el = document.querySelector('[data-open-shop-coins],[data-open-shop-avatar],[data-feature="shop"]');
  if (el) el.click();
});
await new Promise(r => setTimeout(r, 700));
await page.screenshot({ path: `${out}/03-shop.png` });
await page.close();

// Mode style screen — clear storage and walk lightly via forcing mid-onboarding is hard;
// instead seed incomplete and click through splash quickly
page = await browser.newPage();
await page.evaluateOnNewDocument(() => localStorage.clear());
await page.goto('http://127.0.0.1:4177/', { waitUntil: 'networkidle0', timeout: 60000 });
await new Promise(r => setTimeout(r, 600));
await page.evaluate(() => {
  for (const b of document.querySelectorAll('button')) {
    const t = (b.textContent||'').trim();
    if (/start|ابدأ|adventure|مغامرة/i.test(t)) { b.click(); break; }
  }
});
await new Promise(r => setTimeout(r, 400));
await page.evaluate(() => {
  const en = document.querySelector('[data-lang="en"]');
  if (en) en.click();
});
await new Promise(r => setTimeout(r, 200));
await page.evaluate(() => {
  for (const b of document.querySelectorAll('button')) {
    if (/continue|next|متابعة|التالي/i.test((b.textContent||'').trim())) { b.click(); break; }
  }
});
await new Promise(r => setTimeout(r, 300));
await page.evaluate(() => {
  const input = document.querySelector('input');
  if (input) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, 'Lina');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
});
await new Promise(r => setTimeout(r, 200));
await page.evaluate(() => {
  for (const b of document.querySelectorAll('button')) {
    if (/continue|next|متابعة|التالي/i.test((b.textContent||'').trim())) { b.click(); break; }
  }
});
await new Promise(r => setTimeout(r, 400));
await page.evaluate(() => {
  const btn = document.querySelector('[data-avatar-id], [data-avatar], .avatarGrid button, [class*="avatar"] button');
  if (btn) btn.click();
});
await new Promise(r => setTimeout(r, 200));
await page.evaluate(() => {
  for (const b of document.querySelectorAll('button')) {
    if (/continue|next|متابعة|التالي/i.test((b.textContent||'').trim())) { b.click(); break; }
  }
});
await new Promise(r => setTimeout(r, 700));
await page.screenshot({ path: `${out}/04-mode-style.png` });
await page.close();

page = await withProfile({ ...profileDone, appLanguage: 'en', name: 'Lina' });
await page.evaluate(() => {
  const nav = document.querySelector('[data-nav="games"]');
  if (nav) nav.click();
});
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: `${out}/05-games-hub.png` });
await page.evaluate(() => {
  for (const b of document.querySelectorAll('button, a')) {
    if (/modes|أوضاع|choose mode|اختر/i.test((b.textContent||'').trim())) { b.click(); break; }
  }
});
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: `${out}/06-game-modes.png` });

await browser.close();
server.close();
console.log('shots written');
