import { useMemo } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import { BottomNav } from '../components/BottomNav';
import { TOPICS } from '../modules/Content/cefr';
import type { TopicId } from '../modules/Content';
import {
  getHeatmapCells,
  getStreakStats,
  getMasterySummary,
  getTopicAverageScore,
  getWeakWordCount,
} from '../modules/Mastery';
import { SMART_TOPIC_ID } from '../modules/FlashArena/quickPick';
import styles from './ProgressScreen.module.css';

const PLAYABLE: TopicId[] = [
  'tiere',
  'essen',
  'farben',
  'familie',
  'zuhause',
  'schule',
  'zahlen',
  'kleidung',
  'koerper',
  'wetter',
  'transport',
  'natur',
  'gesundheit',
  'arbeit',
];

const UNLOCKED_TOPICS = TOPICS.filter(
  (t) => !t.locked && (PLAYABLE as string[]).includes(t.id),
);

const WEEKDAY_KEYS = [
  'progress.dow.0',
  'progress.dow.1',
  'progress.dow.2',
  'progress.dow.3',
  'progress.dow.4',
  'progress.dow.5',
  'progress.dow.6',
] as const;

export function ProgressScreen() {
  const { t, setScreen, setSelectedTopic, setSelectedMode, setSelectedLevel, profile } =
    useApp();
  const mastery = useMemo(() => getMasterySummary(), []);
  const weakCount = useMemo(() => getWeakWordCount(), []);
  const cells = useMemo(() => getHeatmapCells(35), []);
  const streak = useMemo(() => getStreakStats(7), []);
  const topics = useMemo(
    () =>
      UNLOCKED_TOPICS.map((topic) => ({
        id: topic.id,
        icon: topic.icon,
        avg: getTopicAverageScore(topic.id),
      })),
    [],
  );

  // Align weekday headers to the first cell's weekday (local)
  const firstDow = cells[0] ? new Date(`${cells[0].date}T12:00:00`).getDay() : 0;

  return (
    <div className={`screen with-nav fade-in ${styles.page}`} data-progress-screen>
      <h1 className="screen-title">{t('progress.title')}</h1>
      <p className="screen-sub">{t('progress.subtitle')}</p>

      <section className={styles.card} aria-label={t('mastery.title')}>
        <h2 className={styles.sectionTitle}>{t('mastery.title')}</h2>
        {mastery.tracked === 0 ? (
          <p className={styles.empty}>{t('mastery.empty')}</p>
        ) : (
          <div className={styles.chips}>
            <span className={styles.chip}>
              📚 {t('mastery.tracked')}: {mastery.tracked}
            </span>
            <span className={`${styles.chip} ${styles.weak}`}>
              📉 {t('mastery.weak')}: {mastery.weak}
            </span>
            <span className={`${styles.chip} ${styles.due}`}>
              ⏰ {t('mastery.due')}: {mastery.due}
            </span>
            {weakCount > 0 && (
              <button
                type="button"
                className={`${styles.chip} ${styles.smartChip}`}
                onClick={() => {
                  setSelectedTopic(SMART_TOPIC_ID);
                  setSelectedMode('quick');
                  setSelectedLevel(Math.max(2, profile.level || 2));
                  setScreen('quickPick');
                }}
                data-smart-chip
              >
                🧠 {t('smart.title')} · {t('smart.count', { n: weakCount })}
              </button>
            )}
          </div>
        )}
      </section>

      <section className={`${styles.card} ${styles.streakCard}`} aria-labelledby="progress-streak-title">
        <div className={styles.streakHeader}>
          <div className={styles.streakIcon} aria-hidden>🔥</div>
          <div>
            <h2 id="progress-streak-title" className={styles.sectionTitle}>{t('streak.title')}</h2>
            <p className={styles.streakNote}>{t('streak.freezeStub')}</p>
          </div>
        </div>
        <div className={styles.streakStats}>
          <div className={styles.streakMetric}>
            <strong>{streak.current}</strong>
            <span>{t('streak.current')}</span>
          </div>
          <div className={styles.streakDivider} aria-hidden />
          <div className={styles.streakMetric}>
            <strong>{streak.best}</strong>
            <span>{t('streak.best')}</span>
          </div>
        </div>
        <div className={styles.weekStrip} aria-label={t('streak.week')}>
          {streak.week.map((day) => {
            const weekday = new Date(`${day.date}T12:00:00`).getDay();
            return (
              <div key={day.date} className={styles.weekDay}>
                <span className={styles.weekLabel}>{t(`progress.dow.${weekday}`)}</span>
                <span
                  className={`${styles.weekDot} ${day.count > 0 ? styles.weekDotActive : ''} ${day.isToday ? styles.weekDotToday : ''}`}
                  title={`${day.date}: ${day.count}`}
                  aria-label={`${day.date}: ${day.count}`}
                />
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.card} aria-label={t('progress.heatmap')}>
        <div className={styles.heatHead}>
          <h2 className={styles.sectionTitle}>{t('progress.heatmap')}</h2>
          <span className={styles.heatHint}>{t('progress.heatmapHint')}</span>
        </div>
        <div className={styles.heatWrap} dir="ltr">
          <div className={styles.dowRow} aria-hidden>
            {Array.from({ length: 7 }, (_, i) => {
              const key = WEEKDAY_KEYS[(firstDow + i) % 7]!;
              return (
                <span key={key} className={styles.dow}>
                  {t(key)}
                </span>
              );
            })}
          </div>
          <div className={styles.heatGrid} role="img" aria-label={t('progress.heatmap')}>
            {cells.map((cell) => (
              <div
                key={cell.date}
                className={`${styles.cell} ${styles[`lv${cell.level}`]}`}
                title={`${cell.date}: ${cell.count}`}
                data-date={cell.date}
                data-count={cell.count}
              />
            ))}
          </div>
          <div className={styles.legend}>
            <span className={styles.legendLabel}>{t('progress.less')}</span>
            {[0, 1, 2, 3, 4].map((lv) => (
              <span
                key={lv}
                className={`${styles.cell} ${styles[`lv${lv}`]} ${styles.legendCell}`}
                aria-hidden
              />
            ))}
            <span className={styles.legendLabel}>{t('progress.more')}</span>
          </div>
        </div>
      </section>

      <section className={styles.card} aria-label={t('progress.topics')}>
        <h2 className={styles.sectionTitle}>{t('progress.topics')}</h2>
        <ul className={styles.topicList}>
          {topics.map((topic) => (
            <li key={topic.id} className={styles.topicRow}>
              <div className={styles.topicMeta}>
                <span className={styles.topicIcon} aria-hidden>
                  {topic.icon}
                </span>
                <span className={styles.topicName}>{t(`topic.${topic.id}`)}</span>
                <span className={styles.topicPct} dir="ltr">
                  {topic.avg}%
                </span>
              </div>
              <div
                className={styles.barTrack}
                role="progressbar"
                aria-valuenow={topic.avg}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t(`topic.${topic.id}`)}
              >
                <div
                  className={styles.barFill}
                  style={{ width: `${Math.max(0, Math.min(100, topic.avg))}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <BottomNav />
    </div>
  );
}
