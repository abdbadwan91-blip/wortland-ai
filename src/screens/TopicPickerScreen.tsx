import { useApp } from '../modules/Auth/AppContext';
import { TOPICS, cefrLabelKey, levelToCefr } from '../modules/Content/cefr';
import styles from './TopicPickerScreen.module.css';

export function TopicPickerScreen() {
  const { t, setScreen, selectedLevel, selectedTopic, setSelectedTopic } = useApp();
  const cefr = levelToCefr(selectedLevel);

  return (
    <div className="screen fade-in">
      <button type="button" className="back-chip" onClick={() => setScreen('levelWheel')}>
        ← {t('topic.back')}
      </button>
      <h1 className="screen-title">{t('topic.title')}</h1>
      <p className="screen-sub">
        {t('topic.subtitle', { n: selectedLevel, cefr: t(cefrLabelKey(cefr)) })}
      </p>

      <div className={styles.grid}>
        {TOPICS.map((topic) => {
          const on = selectedTopic === topic.id && !topic.locked;
          return (
            <button
              key={topic.id}
              type="button"
              disabled={topic.locked}
              className={`${styles.cell} ${on ? styles.on : ''} ${topic.locked ? styles.locked : ''}`}
              onClick={() => !topic.locked && setSelectedTopic(topic.id)}
            >
              <span className={styles.icon} aria-hidden>{topic.icon}</span>
              <strong>{t(`topic.${topic.id}`)}</strong>
              {topic.locked && <span className={styles.lock}>🔒</span>}
            </button>
          );
        })}
      </div>

      <div className={styles.spacer} />
      <button
        type="button"
        className="btn-primary"
        disabled={!selectedTopic}
        onClick={() => setScreen('gameModes')}
      >
        {t('topic.start')}
      </button>
    </div>
  );
}
