export type SupportLevel='guided'|'supported'|'independent'|'challenge';
export interface LearningSupport { level:SupportLevel; hints:number; replay:boolean; translation:boolean; ar:string; de:string; en:string; }
export function learningSupport(stage:number,boss:boolean):LearningSupport{
 if(boss)return {level:'challenge',hints:1,replay:true,translation:false,ar:'تحدي مستقل',de:'Selbstständige Challenge',en:'Independent challenge'};
 const pos=((Math.max(1,stage)-1)%4)+1;
 if(pos===1)return {level:'guided',hints:3,replay:true,translation:true,ar:'تدريب موجه',de:'Geführtes Training',en:'Guided practice'};
 if(pos===2)return {level:'supported',hints:2,replay:true,translation:true,ar:'تدريب بمساعدة',de:'Training mit Hilfe',en:'Supported practice'};
 return {level:'independent',hints:1,replay:true,translation:false,ar:'تدريب مستقل',de:'Selbstständiges Training',en:'Independent practice'};
}
export function supportLabel(s:LearningSupport,language:string){return language==='ar'?s.ar:language==='de'?s.de:s.en;}
