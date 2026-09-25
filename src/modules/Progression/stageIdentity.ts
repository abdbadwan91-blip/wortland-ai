export interface StageIdentity { number:number; chapter:string; icon:string; }
export function stageIdentity(stage:number):StageIdentity{
 const n=Math.max(1,Math.min(20,stage)); const chapter=Math.ceil(n/4);
 return {number:n,chapter:String(chapter),icon:n%4===0?'👑':n%4===3?'⭐':n%4===2?'🧭':'📍'};
}
export function stageIdentityText(s:StageIdentity,language:string){
 if(language==='ar')return 'الفصل '+s.chapter+' · المهمة '+s.number;
 if(language==='de')return 'Kapitel '+s.chapter+' · Mission '+s.number;
 return 'Chapter '+s.chapter+' · Mission '+s.number;
}
