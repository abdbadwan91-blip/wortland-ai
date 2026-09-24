import { MAP_TOPICS, mapContentTopic } from '../MapProgress/mapTopics';
import { getGameModes } from '../Content/cefr';
import { stageMission } from './stageMission';

export interface JourneyAudit { ok:boolean; issues:string[]; }
export function auditJourney():JourneyAudit{
 const issues:string[]=[];
 MAP_TOPICS.forEach((topic,index)=>{
  const stage=index+1;
  const content=mapContentTopic(stage);
  if(!content) issues.push('stage '+stage+' has no playable topic');
  const mission=stageMission(stage);
  const modes=getGameModes(stage);
  if(!modes.length) issues.push('stage '+stage+' has no game modes');
  if(!mission.preferred) issues.push('stage '+stage+' has no preferred mission mode');
  if(!topic.de||!topic.en||!topic.ar) issues.push('stage '+stage+' missing localized label');
 });
 return {ok:issues.length===0,issues};
}
