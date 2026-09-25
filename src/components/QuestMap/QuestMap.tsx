import { useEffect, useRef } from 'react';
import type { MapProgress, StageState } from '../../modules/MapProgress/mapProgress';
import { getStageState } from '../../modules/MapProgress/mapProgress';
import { FOREST_NODES, MOUNTAIN_NODES } from './stageLayout';
import { MountainScene } from './MountainScene';
import { ForestScene } from './ForestScene';
import styles from './QuestMap.module.css';
import { mapTopic, mapTopicLabel } from '../../modules/MapProgress/mapTopics';

interface Props {
  progress: MapProgress;
  mountainTitle: string;
  forestTitle: string;
  stageLabel: (n: number) => string;
  forestStageLabel: (n: number) => string;
  lockedLabel: string;
  onSelect: (stage: number) => void;
  scrollToZone?: 'mountain' | 'forest';
  language?: string;
}

function StageNode({
  stage,
  state,
  x,
  y,
  label,
  lockedLabel,
  onSelect,
  language,
}: {
  stage: number;
  state: StageState;
  x: number;
  y: number;
  label: string;
  lockedLabel: string;
  onSelect: (stage: number) => void;
  language: string;
}) {
  const locked = state === 'locked';
  const topic = mapTopic(stage);
  const topicLabel = mapTopicLabel(stage, language);
  return (
    <button
      type="button"
      className={`${styles.node} ${styles[state]}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      disabled={locked}
      onClick={() => !locked && onSelect(stage)}
      aria-label={locked ? `${label} — ${topicLabel} — ${lockedLabel}` : `${label} — ${topicLabel}`}
      aria-disabled={locked}
    >
      <span className={styles.nodeShadow} aria-hidden />
      <span className={styles.nodeInner}>
        <span className={styles.nodeGloss} aria-hidden />
        <span className={styles.nodeIcon}>{state === 'completed' ? '✓' : state === 'locked' ? '🔒' : topic.icon}</span>
        <span className={styles.nodeNumber}>{stage}</span>
      </span>
      <span className={styles.topicLabel}>{topicLabel}</span>
      {state === 'current' ? <span className={styles.playBadge} aria-hidden>▶</span> : null}
    </button>
  );
}

export function QuestMap({
  progress,
  mountainTitle,
  forestTitle,
  stageLabel,
  forestStageLabel,
  lockedLabel,
  onSelect,
  scrollToZone,
  language = 'en',
}: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const mountainRef = useRef<HTMLElement>(null);
  const forestRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!scrollToZone) return;
    const target = scrollToZone === 'forest' ? forestRef.current : mountainRef.current;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [scrollToZone]);

  return (
    <div ref={scroller} className={styles.scroller} data-quest-map>
      <section
        ref={mountainRef}
        className={styles.zone}
        data-zone="mountain"
        aria-label={mountainTitle}
      >
        <MountainScene />
        <div className={styles.banner}>
          <span className={styles.bannerIcon} aria-hidden>
            ⛰️
          </span>
          {mountainTitle}
        </div>
        {MOUNTAIN_NODES.map((pos, i) => {
          const stage = i + 1;
          return (
            <StageNode
              key={stage}
              stage={stage}
              state={getStageState(stage, progress)}
              x={pos.x}
              y={pos.y}
              label={stageLabel(stage)}
              lockedLabel={lockedLabel}
              onSelect={onSelect}
              language={language}
            />
          );
        })}
      </section>

      <section
        ref={forestRef}
        className={styles.zone}
        data-zone="forest"
        aria-label={forestTitle}
      >
        <ForestScene />
        <div className={styles.banner}>
          <span className={styles.bannerIcon} aria-hidden>
            🌲
          </span>
          {forestTitle}
        </div>
        {FOREST_NODES.map((pos, i) => {
          const stage = 11 + i;
          const local = i + 1;
          return (
            <StageNode
              key={stage}
              stage={stage}
              state={getStageState(stage, progress)}
              x={pos.x}
              y={pos.y}
              label={forestStageLabel(local)}
              lockedLabel={lockedLabel}
              onSelect={onSelect}
              language={language}
            />
          );
        })}
      </section>
    </div>
  );
}
