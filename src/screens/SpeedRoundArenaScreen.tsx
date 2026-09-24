import { useCallback, useState } from 'react';
import { SpeedRoundScreen } from './SpeedRoundScreen';
import { SpeedRoundResultsScreen } from './SpeedRoundResultsScreen';

/**
 * Flash Arena Level 8 · Speed Round / Word Race / Schnellrunde shell
 * Show image → pick German lemma under strict countdown → Results
 */
export function SpeedRoundArenaScreen() {
  const [phase, setPhase] = useState<'round' | 'results'>('round');
  const [correct, setCorrect] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [runKey, setRunKey] = useState(0);

  const onFinish = useCallback((c: number, xp: number) => {
    setCorrect(c);
    setSessionXp(xp);
    setPhase('results');
  }, []);

  const onPlayAgain = useCallback(() => {
    setCorrect(0);
    setSessionXp(0);
    setPhase('round');
    setRunKey((k) => k + 1);
  }, []);

  if (phase === 'results') {
    return (
      <SpeedRoundResultsScreen
        correct={correct}
        sessionXp={sessionXp}
        onPlayAgain={onPlayAgain}
      />
    );
  }

  return <SpeedRoundScreen key={runKey} onFinish={onFinish} />;
}
