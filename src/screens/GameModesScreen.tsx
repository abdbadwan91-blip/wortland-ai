import { useEffect, useMemo } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import { getGameModes, type GameModeId } from '../modules/Content/cefr';
import styles from './GameModesScreen.module.css';
import { assetUrl } from '../modules/Content/assetUrl';

function screenForMode(mode: string): 'pictureMatch' | 'quickPick' | 'articlePick' | 'classicCards' | 'memoryFlip' | 'buildIt' | 'masterChallenge' | 'listeningHunt' | 'speedRound' | 'wordPuzzle' | 'conversationMission' | 'arenaStub' {
  if (mode === 'picture') return 'pictureMatch';
  if (mode === 'quick') return 'quickPick';
  if (mode === 'article') return 'articlePick';
  if (mode === 'classic') return 'classicCards';
  if (mode === 'memory') return 'memoryFlip';
  if (mode === 'build') return 'buildIt';
  if (mode === 'master') return 'masterChallenge';
  if (mode === 'listen') return 'listeningHunt';
  if (mode === 'speed') return 'speedRound';
  if (mode === 'puzzle') return 'wordPuzzle';
  if (mode === 'conversation') return 'conversationMission';
  return 'arenaStub';
}

export function GameModesScreen() {
  const {
    t, setScreen, selectedLevel, selectedTopic, selectedMode, setSelectedMode,
  } = useApp();

  const modes = useMemo(() => getGameModes(selectedLevel), [selectedLevel]);

  useEffect(() => {
    const current = modes.find((m) => m.id === selectedMode);
    if (current && !current.locked) return;
    const preferred: GameModeId[] =
      selectedLevel >= 10
        ? ['conversation', 'puzzle', 'speed', 'listen', 'master', 'build', 'memory', 'article', 'quick', 'picture', 'classic']
        : selectedLevel >= 9
        ? ['puzzle', 'speed', 'listen', 'master', 'build', 'memory', 'article', 'quick', 'picture', 'classic']
        : selectedLevel >= 8
        ? ['speed', 'listen', 'master', 'build', 'memory', 'article', 'quick', 'picture', 'classic']
        : selectedLevel >= 7
        ? ['listen', 'master', 'build', 'memory', 'article', 'quick', 'picture', 'classic']
        : selectedLevel >= 6
          ? ['master', 'build', 'memory', 'article', 'quick', 'picture', 'classic']
          : selectedLevel >= 5
            ? ['build', 'memory', 'article', 'quick', 'picture', 'classic']
            : selectedLevel >= 4
              ? ['memory', 'article', 'quick', 'picture', 'classic']
              : selectedLevel >= 3
                ? ['article', 'quick', 'picture', 'classic']
                : selectedLevel >= 2
                  ? ['quick', 'picture', 'classic']
                  : ['picture', 'classic'];
    const fallback = preferred
      .map((id) => modes.find((m) => m.id === id && !m.locked))
      .find(Boolean);
    if (fallback) setSelectedMode(fallback.id);
  }, [modes, selectedLevel, selectedMode, setSelectedMode]);

  const startMode = (modeId: string) => {
    setSelectedMode(modeId as GameModeId);
    setScreen(screenForMode(modeId));
  };

  return (
    <div className="screen fade-in" data-game-modes>
      <button type="button" className="back-chip" onClick={() => setScreen('topicPicker')}>
        ← {t('modes.back')}
      </button>
      <h1 className="screen-title">{t('modes.title')}</h1>
      <p className="screen-sub">
        {t('modes.subtitle', { topic: t(`topic.${selectedTopic}`), n: selectedLevel })}
      </p>

      <div className={styles.list}>
        {modes.map((m) => {
          const on = selectedMode === m.id && !m.locked;
          return (
            <div
              key={m.id}
              className={`${styles.rowWrap} ${on ? styles.rowWrapOn : ''} ${m.locked ? styles.locked : ''}`}
              style={{ ['--mode' as string]: m.color }}
              data-mode-row={m.id}
            >
              <button
                type="button"
                disabled={m.locked}
                className={`${styles.row} ${on ? styles.on : ''}`}
                onClick={() => !m.locked && setSelectedMode(m.id)}
                data-mode={m.id}
                data-locked={m.locked ? '1' : '0'}
                aria-pressed={on}
              >
                <span className={styles.icon} aria-hidden>
                  {m.icon.includes('/') ? (
                    <img src={assetUrl(m.icon)} alt="" className={styles.iconImg} draggable={false} />
                  ) : (
                    m.icon
                  )}
                </span>
                <span className={styles.body}>
                  <strong>{t(`modes.${m.id}`)}</strong>
                  <small>{m.locked ? t('modes.locked') : t(`modes.${m.id}.desc`)}</small>
                </span>
                {m.locked ? <span aria-hidden>🔒</span> : null}
              </button>
              {on && (
                <button
                  type="button"
                  className={styles.inlineStart}
                  onClick={() => startMode(m.id)}
                  data-start-mode={m.id}
                >
                  {t('modes.start')}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
