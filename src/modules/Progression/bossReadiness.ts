export interface BossReadiness { percent:number; labelAr:string; labelDe:string; labelEn:string; }
export function bossReadiness(stage:number):BossReadiness{
 const pos=((Math.max(1,stage)-1)%4)+1;
 const percent=Math.min(100,pos*25);
 const labels=percent<50?['بداية العالم','Weltstart','World start']:percent<100?['الاستعداد للزعيم','Boss vorbereiten','Preparing for boss']:['جاهز للزعيم','Boss bereit','Boss ready'];
 return {percent,labelAr:labels[0],labelDe:labels[1],labelEn:labels[2]};
}
export function readinessLabel(r:BossReadiness,language:string){return language==='ar'?r.labelAr:language==='de'?r.labelDe:r.labelEn;}
