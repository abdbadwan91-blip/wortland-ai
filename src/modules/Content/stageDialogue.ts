import { LEARNING_DIALOGUES, type DialogueLevel } from './learningDialogues';
import { levelToCefr } from './cefr';

const MAP:Record<string,DialogueLevel>={starter:'A1',a1:'A1',a2:'A2',b1:'B1',b2:'B2',c1:'C1'};
export function dialogueLevelForStage(stage:number):DialogueLevel{return MAP[levelToCefr(stage)]??'A1';}
export function stageDialogue(stage:number,topicId:string){
 const level=dialogueLevelForStage(stage);
 return LEARNING_DIALOGUES.find(d=>d.level===level&&d.topicId===topicId)
   ?? LEARNING_DIALOGUES.find(d=>d.level===level)
   ?? LEARNING_DIALOGUES[0];
}
export function dialogueCoverage(){
 const levels:DialogueLevel[]=['A1','A2','B1','B2','C1'];
 return levels.map(level=>({level,count:LEARNING_DIALOGUES.filter(d=>d.level===level).length}));
}
