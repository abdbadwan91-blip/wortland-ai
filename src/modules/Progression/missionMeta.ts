import { isBossStage, localStage, worldForStage } from '../MapProgress/worlds';

export interface MissionMeta { rounds:number; xp:number; minutes:number; stars:number; boss:boolean; }
export function missionMeta(stage:number):MissionMeta {
  const boss=isBossStage(stage);
  const worldIndex=['starter','daily','city','germany','master'].indexOf(worldForStage(stage).id);
  return {
    rounds: boss ? 10 : 5 + Math.min(3,worldIndex),
    xp: boss ? 100 + worldIndex*25 : 30 + worldIndex*10 + localStage(stage)*5,
    minutes: boss ? 8 : 3 + Math.min(3,worldIndex),
    stars: Math.min(5,1+worldIndex),
    boss,
  };
}
export function missionGoal(language:string,boss:boolean):string {
  if(language==='ar') return boss?'اجتز التحدي المختلط لفتح الطريق التالي':'أكمل جولة التعلم واربح نقاط الخبرة';
  if(language==='de') return boss?'Bestehe die gemischte Herausforderung und öffne den nächsten Weg':'Schließe die Lernrunde ab und sammle XP';
  return boss?'Beat the mixed challenge to open the next path':'Complete the learning round and earn XP';
}
