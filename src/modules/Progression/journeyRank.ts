export type JourneyRank='rookie'|'explorer'|'speaker'|'champion'|'master';
export function journeyRank(stage:number):JourneyRank{
 if(stage<=4)return 'rookie'; if(stage<=8)return 'explorer'; if(stage<=12)return 'speaker'; if(stage<=16)return 'champion'; return 'master';
}
const LABELS:Record<JourneyRank,{ar:string;de:string;en:string;icon:string}>={
 rookie:{ar:'مبتدئ',de:'Starter',en:'Rookie',icon:'🌱'},
 explorer:{ar:'مستكشف',de:'Entdecker',en:'Explorer',icon:'🧭'},
 speaker:{ar:'متحدث',de:'Sprecher',en:'Speaker',icon:'💬'},
 champion:{ar:'متقدم',de:'Champion',en:'Champion',icon:'🏅'},
 master:{ar:'متقن',de:'Meister',en:'Master',icon:'🏆'},
};
export function rankInfo(stage:number,language:string){const r=LABELS[journeyRank(stage)];return {icon:r.icon,label:language==='ar'?r.ar:language==='de'?r.de:r.en};}
