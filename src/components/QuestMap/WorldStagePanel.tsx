import { mapTopic, mapTopicLabel } from '../../modules/MapProgress/mapTopics';
import { isBossStage, worldForStage, worldLabel } from '../../modules/MapProgress/worlds';
import styles from './WorldStagePanel.module.css';

export function WorldStagePanel({ language, stage, onSelect }:{language:string;stage:number;onSelect:(stage:number)=>void}) {
  const world=worldForStage(stage);
  const stages=Array.from({length:world.end-world.start+1},(_,i)=>world.start+i);
  const stageText=(n:number)=>language==='ar'?'المرحلة '+n:language==='de'?'Etappe '+n:'Stage '+n;
  const title=worldLabel(world,language);
  return <div className={styles.panel}>
    <div className={styles.head}><span>{world.icon}</span><strong>{title}</strong><small>{stage-world.start+1}/4</small></div>
    <div className={styles.stages}>{stages.map(n=>{
      const topic=mapTopic(n);
      const locked=n>stage;
      const completed=n<stage;
      const boss=isBossStage(n);
      return <button type="button" key={n} className={n===stage?styles.current:styles.stage} disabled={locked} onClick={()=>onSelect(n)} aria-label={stageText(n)+' — '+mapTopicLabel(n,language)}>
        <span className={styles.icon}>{locked?'🔒':completed?'✓':boss?'👑':topic.icon}</span>
        <span className={styles.name}>{mapTopicLabel(n,language)}</span>
        <small>{boss?'Boss · ':''}{stageText(n)}</small>
      </button>;
    })}</div>
  </div>;
}
