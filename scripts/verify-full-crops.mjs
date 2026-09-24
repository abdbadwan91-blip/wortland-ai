import puppeteer from 'puppeteer-core';
import { createServer } from 'http';
import { readFileSync, existsSync, statSync, mkdirSync } from 'fs';
import { join, extname } from 'path';
const root = new URL('../dist/', import.meta.url).pathname;
const out='/workspace/shots'; mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.json':'application/json','.webmanifest':'application/manifest+json'};
const server=createServer((req,res)=>{let u=decodeURIComponent((req.url||'/').split('?')[0]); if(u==='/')u='/index.html'; const f=join(root,u.replace(/^\//,'')); if(!existsSync(f)||statSync(f).isDirectory()){res.writeHead(404);res.end();return;} res.writeHead(200,{'Content-Type':mime[extname(f)]||'application/octet-stream'}); res.end(readFileSync(f));});
await new Promise(r=>server.listen(4196,r));
const PROFILE={name:'لينا',avatarId:'k1',mode:'junior',appLanguage:'ar',translationLanguage:'ar',learningLanguage:'de',onboardingComplete:true,streak:3,coins:520,xp:240,level:4};
const MAP={unlockedStage:4,completed:[1,2,3],falconSeen:true};
const browser=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--disable-dev-shm-usage','--window-size=412,915'],defaultViewport:{width:412,height:915,deviceScaleFactor:2,isMobile:true,hasTouch:true}});
const page=await browser.newPage();
await page.evaluateOnNewDocument((p,m)=>{localStorage.clear();localStorage.setItem('deutsch-quest-profile-v1',JSON.stringify(p));localStorage.setItem('wortland-map-progress-v1',JSON.stringify(m));localStorage.setItem('wortland.settings.v1',JSON.stringify({speechEnabled:true,volume:1,reducedMotion:true,highContrast:false}));},PROFILE,MAP);
await page.goto('http://127.0.0.1:4196/',{waitUntil:'networkidle0',timeout:60000});
await new Promise(r=>setTimeout(r,500));
const clickText=async(re)=>page.evaluate((pattern)=>{const rx=new RegExp(pattern,'i');const b=[...document.querySelectorAll('button')].find(el=>rx.test((el.textContent||'').trim())); if(b){b.click();return true;} return false;},re);
await clickText('متابعة|Continue'); await new Promise(r=>setTimeout(r,400));
await page.evaluate(()=>{const t=[...document.querySelectorAll('svg text')].find(x=>(x.textContent||'').trim()==='4'); t?.closest('g')?.dispatchEvent(new MouseEvent('click',{bubbles:true,view:window}));});
await new Promise(r=>setTimeout(r,250));
await clickText('تأكيد|Confirm'); await new Promise(r=>setTimeout(r,400));
await clickText('حيوانات|Animals|Tiere'); await new Promise(r=>setTimeout(r,200));
await page.evaluate(()=>document.querySelector('[data-start-topic]')?.click());
await new Promise(r=>setTimeout(r,500));
await page.evaluate(()=>document.querySelector('[data-mode="picture"]')?.click());
await new Promise(r=>setTimeout(r,200));
await page.evaluate(()=>document.querySelector('[data-start-mode="picture"]')?.click());
await new Promise(r=>setTimeout(r,800));
await page.screenshot({path:`${out}/full-picture.png`});
console.log('saved full-picture');
// memory
await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(el=>/رجوع|Back/i.test(el.textContent||'')); b?.click();});
await new Promise(r=>setTimeout(r,400));
for(let i=0;i<3;i++){
  if(await page.evaluate(()=>!!document.querySelector('[data-mode="memory"]'))) break;
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(el=>/رجوع|Back/i.test(el.textContent||'')); b?.click();});
  await new Promise(r=>setTimeout(r,300));
}
if(!await page.evaluate(()=>!!document.querySelector('[data-mode="memory"]'))){
  await page.evaluate(()=>document.querySelector('[data-nav="home"]')?.click());
  await new Promise(r=>setTimeout(r,300));
  await clickText('متابعة|Continue'); await new Promise(r=>setTimeout(r,350));
  await page.evaluate(()=>{const t=[...document.querySelectorAll('svg text')].find(x=>(x.textContent||'').trim()==='4'); t?.closest('g')?.dispatchEvent(new MouseEvent('click',{bubbles:true,view:window}));});
  await new Promise(r=>setTimeout(r,200));
  await clickText('تأكيد|Confirm'); await new Promise(r=>setTimeout(r,350));
  await clickText('حيوانات|Animals'); await new Promise(r=>setTimeout(r,150));
  await page.evaluate(()=>document.querySelector('[data-start-topic]')?.click());
  await new Promise(r=>setTimeout(r,400));
}
await page.evaluate(()=>document.querySelector('[data-mode="memory"]')?.click());
await new Promise(r=>setTimeout(r,200));
await page.evaluate(()=>document.querySelector('[data-start-mode="memory"]')?.click());
await new Promise(r=>setTimeout(r,800));
await page.waitForSelector('[data-memory-flip]');
await page.evaluate(()=>document.querySelector('[data-kind="image"]')?.click());
await new Promise(r=>setTimeout(r,350));
await page.evaluate(()=>document.querySelector('[data-kind="word"][data-flipped="0"]')?.click());
await new Promise(r=>setTimeout(r,450));
await page.screenshot({path:`${out}/full-memory.png`});
console.log('saved full-memory');
const fit=await page.evaluate(()=>{
  const img=document.querySelector('[data-kind="image"][data-flipped="1"] img:not([src*="card-back"])');
  return img?getComputedStyle(img).objectFit:null;
});
console.log('memory object-fit', fit);
await browser.close(); server.close();
console.log('OK');
