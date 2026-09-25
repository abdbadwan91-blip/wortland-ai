export interface BossChallenge { skills:number; rounds:number; pass:number; ar:string; de:string; en:string; }
export function bossChallenge(stage:number):BossChallenge{
 const world=Math.ceil(Math.max(1,Math.min(20,stage))/4);
 return {skills:Math.min(6,2+world),rounds:8+world,pass:70+world*2,ar:'اختبار مهارات العالم',de:'Welt-Fähigkeitstest',en:'World skills test'};
}
export function bossChallengeLabel(b:BossChallenge,language:string){return language==='ar'?b.ar:language==='de'?b.de:b.en;}
