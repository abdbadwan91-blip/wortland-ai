import { localStage, worldForStage } from '../MapProgress/worlds';

export interface WorldGoal { completed:number; total:number; remaining:number; percent:number; }
export function worldGoal(stage:number):WorldGoal{
 const completed=Math.max(0,localStage(stage)-1);
 return {completed,total:4,remaining:4-completed,percent:Math.round((completed/4)*100)};
}
export function worldGoalText(stage:number,language:string){
 const g=worldGoal(stage);
 if(language==='ar')return `${g.completed}/${g.total} مكتملة · بقي ${g.remaining}`;
 if(language==='de')return `${g.completed}/${g.total} geschafft · noch ${g.remaining}`;
 return `${g.completed}/${g.total} complete · ${g.remaining} left`;
}
export function worldNumber(stage:number){return ['starter','daily','city','germany','master'].indexOf(worldForStage(stage).id)+1;}
