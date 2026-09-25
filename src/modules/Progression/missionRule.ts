import type { MissionKind } from './stageMission';
export interface MissionRule { icon:string; ar:string; de:string; en:string; }
export function missionRule(kind:MissionKind):MissionRule{
 if(kind==='boss')return {icon:'👑',ar:'الزعيم يجمع أكثر من مهارة في جولة واحدة.',de:'Der Boss kombiniert mehrere Fähigkeiten in einer Runde.',en:'The boss combines multiple skills in one round.'};
 if(kind==='speed')return {icon:'⏱️',ar:'السرعة مهمة، لكن الدقة أهم.',de:'Tempo zählt, Genauigkeit zählt mehr.',en:'Speed matters, accuracy matters more.'};
 if(kind==='listen')return {icon:'🎧',ar:'حاول الفهم قبل إظهار أي مساعدة.',de:'Versuche zuerst ohne Hilfe zu verstehen.',en:'Try to understand before using help.'};
 if(kind==='conversation')return {icon:'💬',ar:'اختر الألمانية الطبيعية المناسبة للموقف.',de:'Wähle natürliches Deutsch passend zur Situation.',en:'Choose natural German for the situation.'};
 return {icon:'⭐',ar:'الإجابة الصحيحة المتتالية ترفع إتقانك.',de:'Richtige Serien steigern deine Meisterung.',en:'Correct streaks increase your mastery.'};
}
export function missionRuleLabel(rule:MissionRule,language:string){return language==='ar'?rule.ar:language==='de'?rule.de:rule.en;}
