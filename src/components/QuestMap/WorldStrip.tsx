import styles from './WorldStrip.module.css';

const WORLDS = [
  { icon:'🌱', ar:'قرية البداية', en:'Starter Village', de:'Startdorf' },
  { icon:'🌿', ar:'الحياة اليومية', en:'Daily Life', de:'Alltag' },
  { icon:'🏙️', ar:'عالم المدينة', en:'City World', de:'Stadtwelt' },
  { icon:'🧭', ar:'الحياة في ألمانيا', en:'Life in Germany', de:'Leben in Deutschland' },
  { icon:'🏰', ar:'أرض الإتقان', en:'Master Land', de:'Meisterland' },
];

export function WorldStrip({ language, stage }:{ language:string; stage:number }) {
  const active=Math.min(4,Math.floor((Math.max(1,stage)-1)/4));
  return <div className={styles.strip} aria-label="Learning worlds">
    {WORLDS.map((world,index)=>{
      const label=language==='ar'?world.ar:language==='de'?world.de:world.en;
      return <div key={world.en} className={index===active?styles.active:styles.world}>
        <span className={styles.icon}>{world.icon}</span><span>{label}</span>
      </div>;
    })}
  </div>;
}
