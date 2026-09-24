import puppeteer from 'puppeteer-core';
import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';
const root = new URL('../dist/', import.meta.url).pathname;
const mime = { '.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.json':'application/json' };
const server = createServer((req,res)=>{let u=decodeURIComponent((req.url||'/').split('?')[0]);if(u==='/')u='/index.html';const f=join(root,u.slice(1));if(!existsSync(f)||statSync(f).isDirectory()){res.writeHead(404);res.end('x');return;}res.writeHead(200,{'Content-Type':mime[extname(f)]||'text/plain'});res.end(readFileSync(f));});
await new Promise(r=>server.listen(4178,r));
const browser = await puppeteer.launch({ executablePath:'/usr/bin/google-chrome', args:['--no-sandbox','--disable-dev-shm-usage'], defaultViewport:{width:390,height:844,deviceScaleFactor:2}});
const page = await browser.newPage();
await page.goto('http://127.0.0.1:4178/', { waitUntil:'networkidle0' });
await page.evaluateOnNewDocument(()=>{}); // already loaded
// clear and reload
await page.evaluate(()=>localStorage.clear());
await page.reload({ waitUntil:'networkidle0' });
await new Promise(r=>setTimeout(r,500));
async function clickText(re) {
  await page.evaluate((pattern) => {
    const rx = new RegExp(pattern,'i');
    for (const b of document.querySelectorAll('button')) {
      if (rx.test((b.textContent||'').trim()) && !b.disabled) { b.click(); return; }
    }
  }, re);
}
await clickText('start|adventure|ابدأ|مغامرة');
await new Promise(r=>setTimeout(r,400));
await page.evaluate(()=>{ const el=document.querySelector('[data-lang="en"]'); if(el) el.click(); });
await new Promise(r=>setTimeout(r,200));
await clickText('continue|next|متابعة|التالي');
await new Promise(r=>setTimeout(r,300));
await page.evaluate(()=>{
  const input=document.querySelector('input');
  if(!input) return;
  const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
  setter.call(input,'Lina');
  input.dispatchEvent(new Event('input',{bubbles:true}));
});
await clickText('continue|next|متابعة|التالي');
await new Promise(r=>setTimeout(r,500));
await page.evaluate(()=>{
  const b=document.querySelector('[data-avatar-id],button[data-avatar],.avatarGrid button,[class*="Avatar"] button,[class*="avatar"] button');
  if(b) b.click();
  else {
    const buttons=[...document.querySelectorAll('button')].filter(x=>x.querySelector('span,img') && x.offsetParent);
    if(buttons[2]) buttons[2].click();
  }
});
await new Promise(r=>setTimeout(r,300));
await clickText('continue|next|متابعة|التالي');
await new Promise(r=>setTimeout(r,800));
await page.screenshot({ path:'/workspace/shots/04-mode-style.png' });
// dump heading
console.log('mode heading', await page.evaluate(()=>document.querySelector('h1')?.textContent));
console.log('imgs', await page.evaluate(()=>[...document.querySelectorAll('img')].map(i=>i.src).slice(0,6)));

// Game modes: seed completed profile and navigate
await page.evaluate((p)=>{ localStorage.setItem('deutsch-quest-profile-v1', JSON.stringify(p)); }, {
  name:'Lina', avatarId:'k1', mode:'standard', appLanguage:'en', translationLanguage:'en', learningLanguage:'de',
  onboardingComplete:true, streak:1, coins:200, xp:50, level:5,
});
await page.reload({ waitUntil:'networkidle0' });
await new Promise(r=>setTimeout(r,600));
await page.evaluate(()=>{ document.querySelector('[data-nav="games"]')?.click(); });
await new Promise(r=>setTimeout(r,500));
await page.evaluate(()=>{
  for (const b of document.querySelectorAll('button')) {
    if (/mode|أوضاع|arena|ساحة|play/i.test(b.textContent||'')) { b.click(); break; }
  }
});
await new Promise(r=>setTimeout(r,600));
await page.screenshot({ path:'/workspace/shots/06-game-modes.png' });
console.log('gm heading', await page.evaluate(()=>document.querySelector('h1')?.textContent));
console.log('gm imgs', await page.evaluate(()=>[...document.querySelectorAll('img')].map(i=>i.src).filter(s=>s.includes('modes')).slice(0,8)));
await browser.close(); server.close();
