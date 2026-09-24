import { useCallback, useState } from 'react';
import { PictureMatchScreen } from './PictureMatchScreen';
import { PictureMatchResultsScreen } from './PictureMatchResultsScreen';

/**
 * Flash Arena Level 1 · Picture Match shell
 * Round → Results → Play again / Home / Next
 */
export function PictureMatchArenaScreen() {
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
      <PictureMatchResultsScreen
        correct={correct}
        sessionXp={sessionXp}
        onPlayAgain={onPlayAgain}
      />
    );
  }

  return <PictureMatchScreen key={runKey} onFinish={onFinish} />;
}
