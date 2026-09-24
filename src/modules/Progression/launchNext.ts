import type { Screen } from '../Auth/AppContext';
import { resolveNextChallenge } from './nextChallenge';
import { loadMapProgress } from '../MapProgress/mapProgress';

type AppNav = {
  setScreen: (s: Screen) => void;
  setSelectedMode: (m: string) => void;
  setSelectedLevel: (n: number) => void;
};

/** Results “Next challenge”: retry if failed, else launch next mode/level directly. */
export function handleNextChallenge(
  app: AppNav,
  opts: {
    currentMode: string;
    level: number;
    passed: boolean;
    onRetry: () => void;
  },
): void {
  if (opts.passed) {
    const progress = loadMapProgress();
    app.setSelectedLevel(progress.unlockedStage);
    app.setScreen('journeyStage');
    return;
  }

  const next = resolveNextChallenge({
    currentMode: opts.currentMode,
    level: opts.level,
    passed: opts.passed,
  });
  if (next.kind === 'retry') {
    opts.onRetry();
    return;
  }
  app.setSelectedMode(next.mode);
  app.setSelectedLevel(next.level);
  app.setScreen(next.screen);
}
