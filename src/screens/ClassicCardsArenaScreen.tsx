import { useCallback, useMemo, useState } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import { getTopicLos } from '../modules/Content';
import { ClassicCardsScreen } from './ClassicCardsScreen';
import { ClassicCardsResultsScreen } from './ClassicCardsResultsScreen';

/**
 * Classic Cards — flip & learn (image → article/lemma/plural/translation/example)
 */
export function ClassicCardsArenaScreen() {
  const { selectedTopic } = useApp();
  const total = useMemo(() => getTopicLos(selectedTopic).length, [selectedTopic]);
  const [phase, setPhase] = useState<'round' | 'results'>('round');
  const [seen, setSeen] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [runKey, setRunKey] = useState(0);

  const onFinish = useCallback((s: number, xp: number) => {
    setSeen(s);
    setSessionXp(xp);
    setPhase('results');
  }, []);

  const onPlayAgain = useCallback(() => {
    setSeen(0);
    setSessionXp(0);
    setPhase('round');
    setRunKey((k) => k + 1);
  }, []);

  if (phase === 'results') {
    return (
      <ClassicCardsResultsScreen
        seen={seen}
        sessionXp={sessionXp}
        total={total}
        onPlayAgain={onPlayAgain}
      />
    );
  }

  return <ClassicCardsScreen key={runKey} onFinish={onFinish} />;
}
