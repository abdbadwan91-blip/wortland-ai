export interface StageRhythm { warmup:number; core:number; finish:number; }
export function stageRhythm(stage:number,boss:boolean):StageRhythm{
 const tier=Math.floor((Math.max(1,stage)-1)/4);
 return boss?{warmup:2,core:6+tier,finish:2}:{warmup:1,core:4+tier,finish:1};
}
export function rhythmText(r:StageRhythm,language:string){
 if(language==='ar')return `تهيئة ${r.warmup} · تدريب ${r.core} · ختام ${r.finish}`;
 if(language==='de')return `Warm-up ${r.warmup} · Training ${r.core} · Abschluss ${r.finish}`;
 return `Warm-up ${r.warmup} · Practice ${r.core} · Finish ${r.finish}`;
}
