import { useCallback, useState } from 'react';
import { WordPuzzleScreen } from './WordPuzzleScreen';
import { WordPuzzleResultsScreen } from './WordPuzzleResultsScreen';

/**
 * Flash Arena Level 9 · Word Puzzle / Wortpuzzle shell
 * Image → rebuild lemma from letter tiles → Results
 */
export function WordPuzzleArenaScreen() {
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
      <WordPuzzleResultsScreen
        correct={correct}
        sessionXp={sessionXp}
        onPlayAgain={onPlayAgain}
      />
    );
  }

  return <WordPuzzleScreen key={runKey} onFinish={onFinish} />;
}
