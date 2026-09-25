export interface JourneyCheckpoint { icon:string; ar:string; de:string; en:string; }
export function journeyCheckpoint(stage:number):JourneyCheckpoint{
 const local=((Math.max(1,stage)-1)%4)+1;
 if(local===4)return {icon:'👑',ar:'اختبار العالم',de:'Weltprüfung',en:'World test'};
 if(local===3)return {icon:'⭐',ar:'مهمة ما قبل الزعيم',de:'Vor-Boss-Mission',en:'Pre-boss mission'};
 if(local===2)return {icon:'🧭',ar:'توسيع المهارة',de:'Fähigkeit ausbauen',en:'Expand the skill'};
 return {icon:'📍',ar:'اكتشاف مهارة جديدة',de:'Neue Fähigkeit entdecken',en:'Discover a new skill'};
}
export function checkpointLabel(c:JourneyCheckpoint,language:string){return language==='ar'?c.ar:language==='de'?c.de:c.en;}
