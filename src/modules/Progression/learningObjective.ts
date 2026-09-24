import { levelToCefr } from '../Content/cefr';
import { isBossStage, localStage, worldForStage } from '../MapProgress/worlds';

export type SkillFocus='vocabulary'|'listening'|'grammar'|'sentence'|'conversation'|'review';
export interface LearningObjective { focus:SkillFocus; ar:string; de:string; en:string; target:number; }
const OBJECTIVES:Record<SkillFocus,Omit<LearningObjective,'target'>>={
 vocabulary:{focus:'vocabulary',ar:'تعرف على الكلمات واستخدمها',de:'Wörter erkennen und anwenden',en:'Recognize and use words'},
 listening:{focus:'listening',ar:'افهم الكلمات والجمل عند سماعها',de:'Wörter und Sätze beim Hören verstehen',en:'Understand words and sentences by listening'},
 grammar:{focus:'grammar',ar:'استخدم البنية الصحيحة',de:'Die richtige Struktur verwenden',en:'Use the correct structure'},
 sentence:{focus:'sentence',ar:'كوّن جملة ألمانية صحيحة',de:'Einen korrekten deutschen Satz bilden',en:'Build a correct German sentence'},
 conversation:{focus:'conversation',ar:'اختر الرد المناسب في موقف حقيقي',de:'Im echten Kontext passend antworten',en:'Choose a suitable response in a real situation'},
 review:{focus:'review',ar:'ثبّت الكلمات التي تحتاج مراجعة',de:'Schwache Wörter festigen',en:'Strengthen words that need review'},
};
export function learningObjective(stage:number):LearningObjective{
 const order:SkillFocus[]=['vocabulary','listening','grammar','sentence','conversation','review'];
 const world=['starter','daily','city','germany','master'].indexOf(worldForStage(stage).id);
 const focus=isBossStage(stage)?'review':order[(stage+world+localStage(stage)-2)%order.length];
 return {...OBJECTIVES[focus],target:isBossStage(stage)?10:4+world};
}
export function objectiveLabel(o:LearningObjective,language:string){return language==='ar'?o.ar:language==='de'?o.de:o.en;}
export function cefrStageLabel(stage:number){return levelToCefr(stage).toUpperCase();}
