import { mapTopic, mapTopicLabel } from '../../modules/MapProgress/mapTopics';
import styles from './WorldStagePanel.module.css';

export function WorldStagePanel({ language, stage, onSelect }:{language:string;stage:number;onSelect:(stage:number)=>void}) {
  const start=Math.floor((Math.max(1,stage)-1)/4)*4+1;
  const stages=Array.from({length:4},(_,i)=>Math.min(20,start+i)).filter((n,i,a)=>a.indexOf(n)===i);
  const stageText=(n:number)=>language==='ar'?'المرحلة '+n:language==='de'?'Etappe '+n:'Stage '+n;
  return <div className={styles.panel}>
    <div className={styles.head}><span>🗺️</span><strong>{language==='ar'?'مراحل هذا العالم':language==='de'?'Etappen dieser Welt':'World stages'}</strong></div>
    <div className={styles.stages}>{stages.map(n=>{
      const topic=mapTopic(n);
      const locked=n>stage;
      return <button type="button" key={n} className={n===stage?styles.current:styles.stage} disabled={locked} onClick={()=>onSelect(n)}>
        <span className={styles.icon}>{locked?'🔒':topic.icon}</span>
        <span className={styles.name}>{mapTopicLabel(n,language)}</span>
        <small>{stageText(n)}</small>
      </button>;
    })}</div>
  </div>;
}
