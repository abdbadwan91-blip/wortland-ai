import { useCallback, useState } from 'react';
import { ArticlePickScreen } from './ArticlePickScreen';
import { ArticlePickResultsScreen } from './ArticlePickResultsScreen';

/**
 * Flash Arena Level 3 · Article Pick (der/die/das)
 * Show image + "___ Lemma" → pick article → Results
 */
export function ArticlePickArenaScreen() {
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
      <ArticlePickResultsScreen
        correct={correct}
        sessionXp={sessionXp}
        onPlayAgain={onPlayAgain}
      />
    );
  }

  return <ArticlePickScreen key={runKey} onFinish={onFinish} />;
}
