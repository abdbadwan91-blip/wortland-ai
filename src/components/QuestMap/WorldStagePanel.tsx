import { mapTopic, mapTopicLabel } from '../../modules/MapProgress/mapTopics';
import { isBossStage, worldForStage, worldLabel } from '../../modules/MapProgress/worlds';
import { missionKindLabel, stageMission } from '../../modules/Progression/stageMission';
import styles from './WorldStagePanel.module.css';
import { bossReadiness, readinessLabel } from '../../modules/Progression/bossReadiness';
import { worldGoalText } from '../../modules/Progression/worldGoal';
import { isWorldOne, worldOneMission, worldOneStage } from '../../modules/WorldOne/worldOne';
import { worldOneReward } from '../../modules/WorldOne/worldOneRewards';

export function WorldStagePanel({ language, stage, onSelect }:{language:string;stage:number;onSelect:(stage:number)=>void}) {
  const world=worldForStage(stage);
  const stages=Array.from({length:world.end-world.start+1},(_,i)=>world.start+i);
  const stageText=(n:number)=>language==='ar'?'المرحلة '+n:language==='de'?'Etappe '+n:'Stage '+n;
  const title=worldLabel(world,language);
  const readiness=bossReadiness(stage);
  return <div className={styles.panel}>
    <div className={styles.head}><span>{world.icon}</span><strong>{title}</strong><small>{stage-world.start+1}/4</small></div>
    <div className={styles.worldStatus}><span>{worldGoalText(stage,language)}</span><span>{readinessLabel(readiness,language)} · {readiness.percent}%</span></div>
    <div className={styles.stages}>{stages.map(n=>{
      const topic=mapTopic(n);
      const locked=n>stage;
      const completed=n<stage;
      const boss=isBossStage(n);
      const w1=worldOneStage(n);
      const reward=isWorldOne(n)?worldOneReward(n):null;
      return <button type="button" key={n} className={n===stage?styles.current:styles.stage} disabled={locked} onClick={()=>onSelect(n)} aria-label={stageText(n)+' — '+mapTopicLabel(n,language)}>
        <span className={styles.iconShell}><span className={styles.icon}>{locked?'🔒':completed?'✓':boss?'👑':topic.icon}</span><span className={styles.miniStage}>{n}</span></span>
        <span className={styles.name}>{w1 ? (language==='ar'?w1.ar:language==='de'?w1.de:w1.en) : mapTopicLabel(n,language)}</span>
        {w1?<span className={styles.missionLine}>{worldOneMission(w1,language)}</span>:null}
        <small>{boss?'Boss · ':missionKindLabel(stageMission(n),language)+' · '}{stageText(n)}{reward?' · ⭐ '+reward.xp+' · 🪙 '+reward.coins:''}</small>
      </button>;
    })}</div>
  </div>;
}
