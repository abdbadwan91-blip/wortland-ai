import { useCallback, useState } from 'react';
import { ConversationMissionScreen } from './ConversationMissionScreen';
import { ConversationMissionResultsScreen } from './ConversationMissionResultsScreen';

/**
 * Conversation Mission shell — guided mini-scene → Results
 */
export function ConversationMissionArenaScreen() {
  const [phase, setPhase] = useState<'round' | 'results'>('round');
  const [correct, setCorrect] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [total, setTotal] = useState(0);
  const [runKey, setRunKey] = useState(0);

  const onFinish = useCallback((c: number, xp: number, beatTotal: number) => {
    setCorrect(c);
    setSessionXp(xp);
    setTotal(beatTotal);
    setPhase('results');
  }, []);

  const onPlayAgain = useCallback(() => {
    setCorrect(0);
    setSessionXp(0);
    setTotal(0);
    setPhase('round');
    setRunKey((k) => k + 1);
  }, []);

  if (phase === 'results') {
    return (
      <ConversationMissionResultsScreen
        correct={correct}
        sessionXp={sessionXp}
        total={total}
        onPlayAgain={onPlayAgain}
      />
    );
  }

  return <ConversationMissionScreen key={runKey} onFinish={onFinish} />;
}
