 import { useApp, type Screen } from '../modules/Auth/AppContext';
import { TOPICS, cefrLabelKey, levelToCefr, type GameModeId } from '../modules/Content/cefr';
import { getJourneyMode } from '../modules/Progression/journeyMode';
import styles from './JourneyStageScreen.module.css';
import { mapTopic, mapTopicLabel } from '../modules/MapProgress/mapTopics';
import { isBossStage, nextWorld, worldLabel } from '../modules/MapProgress/worlds';
import { missionGoal, missionMeta } from '../modules/Progression/missionMeta';
import { missionKindLabel, stageMission } from '../modules/Progression/stageMission';
import { learningObjective, objectiveLabel } from '../modules/Progression/learningObjective';
import { rewardHint, stageReward } from '../modules/Progression/stageReward';
import { stageTip, stageTipLabel } from '../modules/Progression/stageTips';
import { rankInfo } from '../modules/Progression/journeyRank';
import { skillBadge } from '../modules/Progression/skillBadge';
import { missionPace, paceLabel } from '../modules/Progression/missionPace';
import { masteryTarget, masteryText } from '../modules/Progression/masteryTarget';
import { milestoneLabel, stageMilestone } from '../modules/Progression/stageMilestone';
import { journeySummary, journeySummaryText } from '../modules/Progression/journeySummary';
import { missionStepLabel, missionSteps } from '../modules/Progression/missionSteps';
import { missionRule, missionRuleLabel } from '../modules/Progression/missionRule';
import { realLifeGoal, realLifeGoalLabel } from '../modules/Progression/realLifeGoal';
import { canDoLabel, canDoStatement } from '../modules/Progression/canDo';

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
  const meta = missionMeta(selectedLevel);
  const mission = stageMission(selectedLevel);
  const objective = learningObjective(selectedLevel);
  const reward = stageReward(selectedLevel, meta.boss);
  const tip = stageTip(selectedLevel);
  const rank = rankInfo(selectedLevel, profile.appLanguage);
  const skill = skillBadge(objective.focus, profile.appLanguage);
  const pace = missionPace(selectedLevel, meta.boss);
  const mastery = masteryTarget(selectedLevel, meta.boss);
  const milestone = stageMilestone(selectedLevel);
  const summary = journeySummary(selectedLevel);
  const steps = missionSteps(mission.kind);
  const rule = missionRule(mission.kind);
  const lifeGoal = realLifeGoal(selectedLevel);
  const canDo = canDoStatement(selectedLevel);

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
        <div className={styles.journeySummary}><span>{journeySummaryText(selectedLevel,profile.appLanguage)}</span><strong>{summary.overallPercent}%</strong></div>
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

      <section className={styles.missionBrief}>
        <div className={styles.missionType}><span>{mission.icon}</span><strong>{missionKindLabel(mission,profile.appLanguage)}</strong></div>
        <div className={styles.lifeGoal}><span>{lifeGoal.icon}</span><strong>{realLifeGoalLabel(lifeGoal,profile.appLanguage)}</strong></div>
        <p>{missionGoal(profile.appLanguage, meta.boss)}</p>
        <div className={styles.objective}><span>🎓</span><span>{objectiveLabel(objective,profile.appLanguage)} · {objective.target}</span></div>
        <div className={styles.stepFlow}>{steps.map((step,index)=><div key={index}><span>{step.icon}</span><small>{missionStepLabel(step,profile.appLanguage)}</small></div>)}</div>
        <div className={styles.missionRule}><span>{rule.icon}</span><span>{missionRuleLabel(rule,profile.appLanguage)}</span></div>
        <div className={styles.canDo}><span>✓</span><span>{canDoLabel(canDo,profile.appLanguage)}</span></div>
        <div className={styles.missionStats}>
          <span>{skill.icon} {skill.label}</span><span>⚡ {reward.xp} XP</span><span>🪙 {reward.coins}</span><span>🎯 {meta.rounds}</span><span>⏱ {meta.minutes} min</span><span>🔥 {paceLabel(pace,profile.appLanguage)} {pace.intensity}/5</span><span>{'★'.repeat(meta.stars)}</span>
        </div>
        <div className={styles.mastery}><span>🎯</span><span>{masteryText(profile.appLanguage,mastery)}</span></div>
        <div className={styles.milestone}><span>{milestone.icon}</span><span>{milestoneLabel(milestone,profile.appLanguage)}</span></div>
        <div className={styles.tip}><span>{tip.icon}</span><span>{stageTipLabel(tip,profile.appLanguage)}</span></div>
        <div className={styles.rewardHint}><span>{rank.icon} {rank.label}</span><span>{rewardHint(profile.appLanguage,meta.boss)}</span></div>
        <button type="button" className={styles.startMission} onClick={() => playTopic(selectedTopic)}>{profile.appLanguage==='ar'?'ابدأ المهمة':profile.appLanguage==='de'?'Mission starten':'Start mission'} ▶</button>
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
