 import { useApp, type Screen } from '../modules/Auth/AppContext';
import { TOPICS, cefrLabelKey, levelToCefr, type GameModeId } from '../modules/Content/cefr';
import { getJourneyMode } from '../modules/Progression/journeyMode';
import styles from './JourneyStageScreen.module.css';

const MODE_SCREENS: Record<GameModeId, Screen> = {
  classic: 'classicCards',
  picture: 'pictureMatch',
  quick: 'quickPick',
  article: 'articlePick',
  memory: 'memoryFlip',
  build: 'buildIt',
  master: 'masterChallenge',
  listen: 'listeningHunt',
  speed: 'speedRound',
  puzzle: 'wordPuzzle',
  conversation: 'conversationMission',
};

export function JourneyStageScreen() {
  const {
    t, selectedLevel, selectedTopic, setSelectedTopic, setSelectedMode, setScreen,
  } = useApp();
  const cefr = levelToCefr(selectedLevel);
  const previewMode = getJourneyMode(selectedLevel, selectedTopic);

  const playTopic = (topicId: string) => {
    const mode = getJourneyMode(selectedLevel, topicId);
    setSelectedTopic(topicId);
    setSelectedMode(mode);
    setScreen(MODE_SCREENS[mode]);
  };

  return (
    <div className={`screen fade-in ${styles.page}`} data-journey-stage>
      <button type="button" className="back-chip" onClick={() => setScreen('home')}>
        ← {t('wheel.back')}
      </button>

      <section className={styles.hero}>
        <span className={styles.kicker}>WortLand AI · Journey</span>
        <div className={styles.heroRow}>
          <div>
            <h1>{t('home.level', { n: selectedLevel })}</h1>
            <p>{t(cefrLabelKey(cefr))} · {t(`modes.${previewMode}`)}</p>
          </div>
          <div className={styles.stageOrb}>{selectedLevel}</div>
        </div>
        <div className={styles.progressTrack} aria-hidden>
          <span style={{ width: `${Math.max(5, Math.min(100, selectedLevel * 5))}%` }} />
        </div>
      </section>

      <div className={styles.sectionHead}>
        <div>
          <span>{t('topic.title')}</span>
          <strong>{t('topic.subtitle', { n: selectedLevel, cefr: t(cefrLabelKey(cefr)) })}</strong>
        </div>
        <span className={styles.modePill}>▶ {t(`modes.${previewMode}`)}</span>
      </div>

      <div className={styles.topicGrid}>
        {TOPICS.filter((topic) => !topic.locked).map((topic) => (
          <button
            type="button"
            key={topic.id}
            className={`${styles.topicCard} ${selectedTopic === topic.id ? styles.selected : ''}`}
            onClick={() => playTopic(topic.id)}
            data-journey-topic={topic.id}
          >
            <span className={styles.topicIcon} aria-hidden>{topic.icon}</span>
            <strong>{t(`topic.${topic.id}`)}</strong>
            <span className={styles.playMark} aria-hidden>▶</span>
          </button>
        ))}
      </div>

      <button type="button" className={styles.moreModes} onClick={() => setScreen('gameModes')}>
        {t('modes.title')} →
      </button>
    </div>
  );
}
