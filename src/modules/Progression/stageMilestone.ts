export interface StageMilestone { icon:string; ar:string; de:string; en:string; }
export function stageMilestone(stage:number):StageMilestone{
 if(stage===20)return {icon:'🏆',ar:'إنهاء الرحلة الأساسية',de:'Grundreise abschließen',en:'Complete the core journey'};
 if(stage%4===0)return {icon:'🔓',ar:'فتح عالم جديد',de:'Neue Welt freischalten',en:'Unlock a new world'};
 if(stage%4===3)return {icon:'⭐',ar:'الاستعداد للزعيم',de:'Auf den Boss vorbereiten',en:'Prepare for the boss'};
 return {icon:'🗺️',ar:'التقدم في العالم',de:'In der Welt vorankommen',en:'Advance through the world'};
}
export function milestoneLabel(m:StageMilestone,language:string){return language==='ar'?m.ar:language==='de'?m.de:m.en;}
