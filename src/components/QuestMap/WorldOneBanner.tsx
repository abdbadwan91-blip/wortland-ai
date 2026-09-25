import { worldOneProgress } from '../../modules/WorldOne/worldOneRewards';
import styles from './WorldOneBanner.module.css';
export function WorldOneBanner({stage,language}:{stage:number;language:string}){
 const title=language==='ar'?'العالم الأول · قرية البداية':language==='de'?'Welt 1 · Startdorf':'World 1 · Starter Village';
 const sub=language==='ar'?'المنزل · المقهى · المدرسة · تحدي القرية':language==='de'?'Zuhause · Café · Schule · Dorf-Challenge':'Home · Café · School · Village Challenge';
 const pct=worldOneProgress(stage);
 return <div className={styles.wrap}><div className={styles.orb}>🌍</div><div className={styles.copy}><strong>{title}</strong><span>{sub}</span><div className={styles.track}><i style={{width:pct+'%'}} /></div></div><b>{Math.min(stage,4)}/4</b></div>;
}
