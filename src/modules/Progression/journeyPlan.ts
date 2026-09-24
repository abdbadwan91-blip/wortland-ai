import { mapContentTopic, mapTopic } from '../MapProgress/mapTopics';
import { stageMission } from './stageMission';

export interface JourneyStagePlan { stage:number; semanticTopic:string; contentTopic:string; mission:string; boss:boolean; }
export function journeyStagePlan(stage:number):JourneyStagePlan {
 const topic=mapTopic(stage);
 const mission=stageMission(stage);
 return {stage,semanticTopic:topic.id,contentTopic:mapContentTopic(stage),mission:mission.kind,boss:mission.kind==='boss'};
}
export function validateJourneyStages(total=20):string[] {
 const issues:string[]=[];
 for(let stage=1;stage<=total;stage++){
  const p=journeyStagePlan(stage);
  if(!p.semanticTopic) issues.push('Stage '+stage+': missing semantic topic');
  if(!p.contentTopic) issues.push('Stage '+stage+': missing playable content topic');
  if(!p.mission) issues.push('Stage '+stage+': missing mission');
 }
 return issues;
}
