import { useCallback, useState } from 'react';
import { QuickPickScreen } from './QuickPickScreen';
import { QuickPickResultsScreen } from './QuickPickResultsScreen';

/**
 * Flash Arena Level 2 · Quick Pick / Word Choice shell
 * Show image → pick German lemma → Results
 */
export function QuickPickArenaScreen() {
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
      <QuickPickResultsScreen
        correct={correct}
        sessionXp={sessionXp}
        onPlayAgain={onPlayAgain}
      />
    );
  }

  return <QuickPickScreen key={runKey} onFinish={onFinish} />;
}
