export interface JourneySummary { world:number; stage:number; totalStages:number; overallPercent:number; }
export function journeySummary(stage:number):JourneySummary{
 const safe=Math.max(1,Math.min(20,stage));
 return {world:Math.ceil(safe/4),stage:safe,totalStages:20,overallPercent:Math.round(((safe-1)/20)*100)};
}
export function journeySummaryText(stage:number,language:string){
 const s=journeySummary(stage);
 if(language==='ar')return `العالم ${s.world}/5 · المرحلة ${s.stage}/20`;
 if(language==='de')return `Welt ${s.world}/5 · Etappe ${s.stage}/20`;
 return `World ${s.world}/5 · Stage ${s.stage}/20`;
}
