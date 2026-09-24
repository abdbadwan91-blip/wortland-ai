import { LEARNING_WORLDS, localStage, worldForStage, worldLabel } from '../../modules/MapProgress/worlds';
import styles from './WorldStrip.module.css';

export function WorldStrip({ language, stage }:{ language:string; stage:number }) {
  const activeWorld=worldForStage(stage);
  const active=LEARNING_WORLDS.findIndex(w=>w.id===activeWorld.id);
  const statusText=(state:string)=>language==='ar'?(state==='done'?'مكتمل':state==='active'?'الحالي':'مقفل'):language==='de'?(state==='done'?'Abgeschlossen':state==='active'?'Aktuell':'Gesperrt'):(state==='done'?'Completed':state==='active'?'Current':'Locked');
  return <div className={styles.strip} aria-label="Learning worlds">
    {LEARNING_WORLDS.map((world,index)=>{
      const state=index<active?'done':index===active?'active':'locked';
      const label=worldLabel(world,language);
      return <div key={world.id} className={state==='active'?styles.active:state==='done'?styles.done:styles.world} aria-label={label+' — '+statusText(state)}>
        <span className={styles.icon}>{state==='done'?'✓':state==='locked'?'🔒':world.icon}</span>
        <span>{label}</span>
        {state==='active'?<small>{localStage(stage)}/4</small>:null}
      </div>;
    })}
  </div>;
}
