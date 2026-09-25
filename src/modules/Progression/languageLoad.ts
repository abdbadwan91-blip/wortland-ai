export interface LanguageLoad { words:string; sentence:string; context:string; }
export function languageLoad(stage:number):LanguageLoad{
 const tier=Math.floor((Math.max(1,stage)-1)/4);
 const words=['أساسية','يومية','متنوعة','طبيعية','متقدمة'];
 const deWords=['Basis','Alltag','Vielfältig','Natürlich','Fortgeschritten'];
 const enWords=['Basic','Everyday','Varied','Natural','Advanced'];
 return {words:words[Math.min(4,tier)]+'|'+deWords[Math.min(4,tier)]+'|'+enWords[Math.min(4,tier)],sentence:String(3+tier*2),context:String(1+tier)};
}
export function loadText(stage:number,language:string){
 const l=languageLoad(stage);const w=l.words.split('|')[language==='ar'?0:language==='de'?1:2];
 if(language==='ar')return `لغة ${w} · جمل حتى ~${l.sentence} كلمات`;
 if(language==='de')return `${w}e Sprache · Sätze bis ~${l.sentence} Wörter`;
 return `${w} language · sentences up to ~${l.sentence} words`;
}
