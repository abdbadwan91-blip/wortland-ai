import { useEffect } from 'react';
import styles from './FalconTransition.module.css';

interface Props {
  avatarEmoji: string;
  onDone: () => void;
  skipLabel: string;
  title: string;
}

export function FalconTransition({ avatarEmoji, onDone, skipLabel, title }: Props) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 2800);
    return () => window.clearTimeout(t);
  }, [onDone]);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={title}>
      <div className={styles.sky}>
        <img
          className={styles.skyArt}
          src="/map/falcon-sky.png"
          alt=""
          draggable={false}
        />
        <div className={styles.skyVignette} />
        <div className={styles.cloud} style={{ left: '8%', top: '18%' }} />
        <div className={styles.cloud} style={{ left: '62%', top: '28%', width: 90 }} />
        <div className={styles.flight}>
          <span className={styles.falcon} aria-hidden>
            🦅
          </span>
          <span className={styles.rider} aria-hidden>
            {avatarEmoji}
          </span>
        </div>
        <p className={styles.title}>{title}</p>
      </div>
      <button type="button" className={styles.skip} onClick={onDone}>
        {skipLabel}
      </button>
    </div>
  );
}
