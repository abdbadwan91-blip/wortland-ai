export type WorldId='starter'|'daily'|'city'|'germany'|'master';
export interface LearningWorld{ id:WorldId; icon:string; start:number; end:number; de:string; en:string; ar:string; }
export const LEARNING_WORLDS:LearningWorld[]=[
{id:'starter',icon:'🌱',start:1,end:4,de:'Startdorf',en:'Starter Village',ar:'قرية البداية'},
{id:'daily',icon:'🌿',start:5,end:8,de:'Alltag',en:'Daily Life',ar:'الحياة اليومية'},
{id:'city',icon:'🏙️',start:9,end:12,de:'Stadtwelt',en:'City World',ar:'عالم المدينة'},
{id:'germany',icon:'🧭',start:13,end:16,de:'Leben in Deutschland',en:'Life in Germany',ar:'الحياة في ألمانيا'},
{id:'master',icon:'🏰',start:17,end:20,de:'Meisterland',en:'Master Land',ar:'أرض الإتقان'},
];
export const worldForStage=(stage:number)=>LEARNING_WORLDS.find(w=>stage>=w.start&&stage<=w.end)??LEARNING_WORLDS[0];
export const worldLabel=(world:LearningWorld,language:string)=>language==='ar'?world.ar:language==='de'?world.de:world.en;
export const localStage=(stage:number)=>stage-worldForStage(stage).start+1;
export const isBossStage=(stage:number)=>stage===worldForStage(stage).end;
export const worldProgressPct=(stage:number)=>Math.round((localStage(stage)/4)*100);
export const nextWorld=(stage:number)=>{const i=LEARNING_WORLDS.indexOf(worldForStage(stage));return LEARNING_WORLDS[i+1];};
