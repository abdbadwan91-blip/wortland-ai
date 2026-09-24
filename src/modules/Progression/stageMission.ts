import type { GameModeId } from '../Content/cefr';
import { isBossStage, localStage, worldForStage } from '../MapProgress/worlds';

export type MissionKind='learn'|'listen'|'speak'|'build'|'speed'|'conversation'|'review'|'boss';
export interface StageMission { kind:MissionKind; icon:string; preferred:GameModeId; ar:string; de:string; en:string; }

const CYCLE:StageMission[]=[
{kind:'learn',icon:'🧠',preferred:'picture',ar:'تعلّم الكلمات',de:'Wörter lernen',en:'Learn words'},
{kind:'listen',icon:'🎧',preferred:'listen',ar:'مهمة الاستماع',de:'Hörmission',en:'Listening mission'},
{kind:'build',icon:'🧩',preferred:'build',ar:'ابنِ الجملة',de:'Satz bauen',en:'Build the sentence'},
{kind:'speed',icon:'⚡',preferred:'speed',ar:'تحدي السرعة',de:'Tempo-Challenge',en:'Speed challenge'},
{kind:'conversation',icon:'💬',preferred:'conversation',ar:'محادثة حقيقية',de:'Echtes Gespräch',en:'Real conversation'},
{kind:'review',icon:'🔁',preferred:'memory',ar:'مراجعة ذكية',de:'Smart-Wiederholung',en:'Smart review'},
];
export function stageMission(stage:number):StageMission{
 if(isBossStage(stage)) return {kind:'boss',icon:'👑',preferred:'master',ar:'زعيم العالم',de:'Welt-Boss',en:'World Boss'};
 const worldIndex=['starter','daily','city','germany','master'].indexOf(worldForStage(stage).id);
 return CYCLE[(stage+worldIndex+localStage(stage)-2)%CYCLE.length];
}
export const missionKindLabel=(m:StageMission,language:string)=>language==='ar'?m.ar:language==='de'?m.de:m.en;
