export interface BossPrep { done:number; total:number; ready:boolean; }
export function bossPrep(stage:number):BossPrep{
 const local=((Math.max(1,stage)-1)%4)+1;
 const done=Math.min(3,local-1);
 return {done,total:3,ready:local===4};
}
export function bossPrepText(p:BossPrep,language:string){
 if(p.ready)return language==='ar'?'جاهز لتحدي الزعيم':language==='de'?'Bereit für den Boss':'Ready for the boss';
 if(language==='ar')return p.done+'/'+p.total+' مهام تحضير';
 if(language==='de')return p.done+'/'+p.total+' Vorbereitungen';
 return p.done+'/'+p.total+' prep missions';
}
