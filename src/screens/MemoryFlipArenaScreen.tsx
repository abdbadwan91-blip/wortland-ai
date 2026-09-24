import { useCallback, useState } from 'react';
import {
  MemoryFlipScreen,
  type MemoryFlipStats,
} from './MemoryFlipScreen';
import { MemoryFlipResultsScreen } from './MemoryFlipResultsScreen';

/**
 * Flash Arena Level 4+ · Memory Flip shell
 * Round → Results → Play again / Home / Next
 */
export function MemoryFlipArenaScreen() {
  const [phase, setPhase] = useState<'round' | 'results'>('round');
  const [stats, setStats] = useState<MemoryFlipStats | null>(null);
  const [runKey, setRunKey] = useState(0);

  const onFinish = useCallback((s: MemoryFlipStats) => {
    setStats(s);
    setPhase('results');
  }, []);

  const onPlayAgain = useCallback(() => {
    setStats(null);
    setPhase('round');
    setRunKey((k) => k + 1);
  }, []);

  if (phase === 'results' && stats) {
    return (
      <MemoryFlipResultsScreen stats={stats} onPlayAgain={onPlayAgain} />
    );
  }

  return <MemoryFlipScreen key={runKey} onFinish={onFinish} />;
}
