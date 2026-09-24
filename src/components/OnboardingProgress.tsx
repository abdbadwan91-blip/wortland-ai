import styles from './OnboardingProgress.module.css';
import { useApp } from '../modules/Auth/AppContext';

interface Props {
  step: number;
  total?: number;
}

/** Small, calm orientation cue shared by the first-run screens. */
export function OnboardingProgress({ step, total = 4 }: Props) {
  const { t } = useApp();

  return (
    <div className={styles.wrap} aria-label={t('onboarding.progress', { step, total })}>
      <span className={styles.brand}><span aria-hidden>✦</span> {t('app.name')}</span>
      <span className={styles.count}>{t('onboarding.stepOf', { step, total })}</span>
      <div className={styles.track} aria-hidden>
        <span className={styles.fill} style={{ width: `${(step / total) * 100}%` }} />
      </div>
    </div>
  );
}
