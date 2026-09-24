import { useApp } from '../modules/Auth/AppContext';
import { TOPICS, cefrLabelKey, levelToCefr } from '../modules/Content/cefr';
import styles from './TopicPickerScreen.module.css';

export function TopicPickerScreen() {
  const { t, setScreen, selectedLevel, selectedTopic, setSelectedTopic } = useApp();
  const cefr = levelToCefr(selectedLevel);

  return (
    <div className="screen fade-in" data-topic-picker>
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
            <div
              key={topic.id}
              className={`${styles.cellWrap} ${on ? styles.cellWrapOn : ''} ${topic.locked ? styles.locked : ''}`}
              data-topic-cell={topic.id}
            >
              <button
                type="button"
                disabled={topic.locked}
                className={`${styles.cell} ${on ? styles.on : ''}`}
                onClick={() => !topic.locked && setSelectedTopic(topic.id)}
                data-topic={topic.id}
                aria-pressed={on}
              >
                <span className={styles.icon} aria-hidden>{topic.icon}</span>
                <strong>{t(`topic.${topic.id}`)}</strong>
                {topic.locked && <span className={styles.lock}>🔒</span>}
              </button>
              {on && (
                <button
                  type="button"
                  className={styles.inlineStart}
                  onClick={() => setScreen('gameModes')}
                  data-start-topic={topic.id}
                >
                  {t('topic.start')}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
