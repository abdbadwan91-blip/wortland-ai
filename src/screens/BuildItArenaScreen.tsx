import { useCallback, useState } from 'react';
import { BuildItScreen, type BuildItStats } from './BuildItScreen';
import { BuildItResultsScreen } from './BuildItResultsScreen';

/**
 * Flash Arena Level 5+ · Build It shell
 * Round → Results → Play again / Home / Next
 */
export function BuildItArenaScreen() {
  const [phase, setPhase] = useState<'round' | 'results'>('round');
  const [stats, setStats] = useState<BuildItStats | null>(null);
  const [runKey, setRunKey] = useState(0);

  const onFinish = useCallback((s: BuildItStats) => {
    setStats(s);
    setPhase('results');
  }, []);

  const onPlayAgain = useCallback(() => {
    setStats(null);
    setPhase('round');
    setRunKey((k) => k + 1);
  }, []);

  if (phase === 'results' && stats) {
    return <BuildItResultsScreen stats={stats} onPlayAgain={onPlayAgain} />;
  }

  return <BuildItScreen key={runKey} onFinish={onFinish} />;
}
