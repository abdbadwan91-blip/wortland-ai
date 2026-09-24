 import { useApp, type Screen } from '../modules/Auth/AppContext';
import { TOPICS, cefrLabelKey, levelToCefr, type GameModeId } from '../modules/Content/cefr';
import { getJourneyMode } from '../modules/Progression/journeyMode';
import styles from './JourneyStageScreen.module.css';
import { mapTopic, mapTopicLabel } from '../modules/MapProgress/mapTopics';
import { isBossStage, nextWorld, worldLabel } from '../modules/MapProgress/worlds';

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
    t, profile, selectedLevel, selectedTopic, setSelectedTopic, setSelectedMode, setScreen,
  } = useApp();
  const cefr = levelToCefr(selectedLevel);
  const isWorldBoss = isBossStage(selectedLevel);
  const normalMode = getJourneyMode(selectedLevel, selectedTopic);
  const previewMode: GameModeId = isWorldBoss ? 'master' : normalMode;
  const missionTopic = mapTopic(selectedLevel);
  const missionLabel = mapTopicLabel(selectedLevel, profile.appLanguage);
  const upcomingWorld = nextWorld(selectedLevel);
  const bossLabel = profile.appLanguage === 'ar' ? 'تحدي زعيم العالم' : profile.appLanguage === 'de' ? 'Welt-Boss' : 'World Boss';

  const playTopic = (topicId: string) => {
    const mode: GameModeId = isWorldBoss ? 'master' : getJourneyMode(selectedLevel, topicId);
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
        <div className={styles.missionTopic}><span>{missionTopic.icon}</span><strong>{missionLabel}</strong></div>
        {isWorldBoss ? <div className={styles.bossBanner}><span>👑</span><strong>{bossLabel}</strong><small> · {t('modes.master')}</small></div> : null}
        {isWorldBoss && upcomingWorld ? <div className={styles.nextWorld}><span>🔓</span><span>{profile.appLanguage==='ar'?'التالي: ':profile.appLanguage==='de'?'Als Nächstes: ':'Next: '}{worldLabel(upcomingWorld,profile.appLanguage)}</span></div> : null}
        <div className={styles.heroRow}>
          <div>
            <h1>{t('home.level', { n: selectedLevel })}</h1>
            <p>{t(cefrLabelKey(cefr))} · {t(`modes.${previewMode}`)}</p>
          </div>
          <div className={styles.stageOrb}>{missionTopic.icon}</div>
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
