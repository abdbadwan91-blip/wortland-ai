import puppeteer from 'puppeteer-core';
import { createServer } from 'http';
import { readFileSync, existsSync, statSync, mkdirSync } from 'fs';
import { join, extname } from 'path';

const root = new URL('../dist/', import.meta.url).pathname;
const out = '/workspace/shots';
mkdirSync(out, { recursive: true });
const mime = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.json':'application/json','.webmanifest':'application/manifest+json' };
const server = createServer((req,res)=>{
  let u=decodeURIComponent((req.url||'/').split('?')[0]); if(u==='/')u='/index.html';
  const f=join(root,u.replace(/^\//,''));
  if(!existsSync(f)||statSync(f).isDirectory()){res.writeHead(404);res.end('no');return;}
  res.writeHead(200,{'Content-Type':mime[extname(f)]||'application/octet-stream'});
  res.end(readFileSync(f));
});
await new Promise(r=>server.listen(4195,r));

const PROFILE = {
  name:'لينا', avatarId:'k1', mode:'junior', appLanguage:'ar',
  translationLanguage:'ar', learningLanguage:'de', onboardingComplete:true,
  streak:3, coins:520, xp:240, level:4,
};
const MAP = { unlockedStage:4, completed:[1,2,3], falconSeen:true };

const browser = await puppeteer.launch({
  executablePath:'/usr/bin/google-chrome', headless:'new',
  args:['--no-sandbox','--disable-dev-shm-usage','--window-size=412,915'],
  defaultViewport:{ width:412, height:915, deviceScaleFactor:2, isMobile:true, hasTouch:true },
});
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR', e.message));
await page.evaluateOnNewDocument((p,m)=>{
  localStorage.clear();
  localStorage.setItem('deutsch-quest-profile-v1', JSON.stringify(p));
  localStorage.setItem('wortland-map-progress-v1', JSON.stringify(m));
  localStorage.setItem('wortland.settings.v1', JSON.stringify({speechEnabled:true,volume:1,reducedMotion:true,highContrast:false}));
}, PROFILE, MAP);
await page.goto('http://127.0.0.1:4195/', { waitUntil:'networkidle0', timeout:60000 });
await new Promise(r=>setTimeout(r,600));

async function clickText(re){
  return page.evaluate((pattern)=>{
    const rx=new RegExp(pattern,'i');
    const b=[...document.querySelectorAll('button')].find(el=>rx.test((el.textContent||'').trim()));
    if(b){b.click(); return (b.textContent||'').trim().slice(0,60);} return null;
  }, re);
}

// Navigate to game modes
await clickText('متابعة التعلم|Continue Learning'); await new Promise(r=>setTimeout(r,500));
await page.evaluate(()=>{const t=[...document.querySelectorAll('svg text')].find(x=>(x.textContent||'').trim()==='4'); t?.closest('g')?.dispatchEvent(new MouseEvent('click',{bubbles:true,view:window}));});
await new Promise(r=>setTimeout(r,300));
await clickText('تأكيد|Confirm'); await new Promise(r=>setTimeout(r,500));
await clickText('حيوانات|Animals|Tiere'); await new Promise(r=>setTimeout(r,200));
// topic inline start
const topicStart = await page.evaluate(()=>{
  const b=document.querySelector('[data-start-topic]');
  if(b){b.click(); return b.textContent.trim();}
  return null;
});
console.log('topicStart', topicStart);
await new Promise(r=>setTimeout(r,600));

// Select Classic Cards and screenshot with inline start
await page.evaluate(()=>document.querySelector('[data-mode="classic"]')?.click());
await new Promise(r=>setTimeout(r,400));
const hasInline = await page.evaluate(()=>!!document.querySelector('[data-start-mode="classic"]'));
console.log('inline classic start', hasInline);
if(!hasInline) throw new Error('Missing inline start beside classic');
// Scroll so classic row is visible mid-screen if needed
await page.evaluate(()=>{
  const row=document.querySelector('[data-mode-row="classic"]');
  row?.scrollIntoView({block:'center'});
});
await new Promise(r=>setTimeout(r,200));
await page.screenshot({ path:`${out}/inline-start-modes.png` });

// Start Picture Match for focus shot
await page.evaluate(()=>document.querySelector('[data-mode="picture"]')?.click());
await new Promise(r=>setTimeout(r,250));
await page.evaluate(()=>document.querySelector('[data-start-mode="picture"]')?.click());
await new Promise(r=>setTimeout(r,900));
await page.waitForSelector('[data-picture-match], [class*="Picture"], img[src*="/content/"]', {timeout:8000}).catch(()=>{});
const picOk = await page.evaluate(()=>{
  const img=[...document.querySelectorAll('img')].find(i=>/content\//.test(i.src));
  if(!img) return {ok:false};
  const r=img.getBoundingClientRect();
  const cs=getComputedStyle(img);
  return {ok:true, w:Math.round(r.width), h:Math.round(r.height), fit:cs.objectFit, src:img.src.split('/').slice(-2).join('/')};
});
console.log('picture img', picOk);
await page.screenshot({ path:`${out}/focus-picture.png` });

// Back to modes via evaluate setScreen through UI - go home then remount path
await page.evaluate(()=>{
  const back=[...document.querySelectorAll('button')].find(el=>/رجوع|Back|Zurück/i.test(el.textContent||''));
  back?.click();
});
await new Promise(r=>setTimeout(r,400));
// May be on results or still in arena - keep backing to modes
for (let i=0;i<4;i++){
  const atModes = await page.evaluate(()=>!!document.querySelector('[data-game-modes],[data-mode="memory"]'));
  if(atModes) break;
  await page.evaluate(()=>{
    const back=[...document.querySelectorAll('button')].find(el=>/رجوع|Back|Zurück|Modes|أنماط/i.test(el.textContent||''));
    back?.click();
  });
  await new Promise(r=>setTimeout(r,350));
}

// If not on modes, re-nav
const onModes = await page.evaluate(()=>!!document.querySelector('[data-mode="memory"]'));
if(!onModes){
  await page.evaluate(()=>document.querySelector('[data-nav="home"]')?.click());
  await new Promise(r=>setTimeout(r,400));
  await clickText('متابعة التعلم|Continue'); await new Promise(r=>setTimeout(r,400));
  await page.evaluate(()=>{const t=[...document.querySelectorAll('svg text')].find(x=>(x.textContent||'').trim()==='4'); t?.closest('g')?.dispatchEvent(new MouseEvent('click',{bubbles:true,view:window}));});
  await new Promise(r=>setTimeout(r,250));
  await clickText('تأكيد|Confirm'); await new Promise(r=>setTimeout(r,400));
  await clickText('حيوانات|Animals|Tiere'); await new Promise(r=>setTimeout(r,200));
  await page.evaluate(()=>document.querySelector('[data-start-topic]')?.click());
  await new Promise(r=>setTimeout(r,500));
}

await page.evaluate(()=>document.querySelector('[data-mode="memory"]')?.click());
await new Promise(r=>setTimeout(r,250));
await page.evaluate(()=>document.querySelector('[data-start-mode="memory"]')?.click());
await new Promise(r=>setTimeout(r,900));
await page.waitForSelector('[data-memory-flip]', {timeout:8000});

// Flip two image cards (or image+word)
await page.evaluate(()=>{
  const imgs=[...document.querySelectorAll('[data-kind="image"][data-flipped="0"]')];
  imgs[0]?.click();
});
await new Promise(r=>setTimeout(r,400));
await page.evaluate(()=>{
  const words=[...document.querySelectorAll('[data-kind="word"][data-flipped="0"]')];
  words[0]?.click();
});
await new Promise(r=>setTimeout(r,500));
const mem = await page.evaluate(()=>{
  const img=document.querySelector('[data-kind="image"][data-flipped="1"] img:not([src*="card-back"])');
  if(!img) return null;
  const card=img.closest('[data-card]');
  const ir=img.getBoundingClientRect();
  const cr=card.getBoundingClientRect();
  return {
    imgW:Math.round(ir.width), imgH:Math.round(ir.height),
    cardW:Math.round(cr.width), cardH:Math.round(cr.height),
    fit:getComputedStyle(img).objectFit,
    pct:Math.round(ir.width/cr.width*100),
    cream: !!img.closest('[class*="imageFrame"]') && getComputedStyle(img.parentElement).backgroundColor,
  };
});
console.log('memory focus', mem);
await page.screenshot({ path:`${out}/focus-memory.png` });

if(!hasInline) throw new Error('inline start missing');
if(!picOk.ok) throw new Error('picture match image missing');
if(!mem || mem.pct < 70) throw new Error('memory image not filling card enough: '+JSON.stringify(mem));

await browser.close(); server.close();
console.log('OK verify-focus-inline');
