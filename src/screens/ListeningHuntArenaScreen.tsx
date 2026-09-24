import { useCallback, useState } from 'react';
import { ListeningHuntScreen } from './ListeningHuntScreen';
import { ListeningHuntResultsScreen } from './ListeningHuntResultsScreen';

/**
 * Flash Arena · Listening Hunt (Hörjagd) shell
 * Hear German word → pick matching image → Results
 */
export function ListeningHuntArenaScreen() {
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
      <ListeningHuntResultsScreen
        correct={correct}
        sessionXp={sessionXp}
        onPlayAgain={onPlayAgain}
      />
    );
  }

  return <ListeningHuntScreen key={runKey} onFinish={onFinish} />;
}
