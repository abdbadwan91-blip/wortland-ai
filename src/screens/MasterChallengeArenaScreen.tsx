import { useCallback, useState } from 'react';
import { MasterChallengeScreen } from './MasterChallengeScreen';
import { MasterChallengeResultsScreen } from './MasterChallengeResultsScreen';

/**
 * Flash Arena Level 6+ · Master Challenge
 * Mixed boss round: Picture / Quick / Article → Results (1.5× rewards)
 */
export function MasterChallengeArenaScreen() {
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
      <MasterChallengeResultsScreen
        correct={correct}
        sessionXp={sessionXp}
        onPlayAgain={onPlayAgain}
      />
    );
  }

  return <MasterChallengeScreen key={runKey} onFinish={onFinish} />;
}
