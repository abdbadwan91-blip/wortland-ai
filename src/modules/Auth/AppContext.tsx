import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  clearProfile,
  loadProfile,
  saveProfile,
  hasSavedProfile,
  type AppLanguage,
  type AppMode,
  type UserProfile,
} from '../Profile/types';
import { getDir } from '../Localization/languages';
import { t as translate } from '../Localization/i18n';
import { clearBadges } from '../Rewards/badges';
import { clearMapProgress } from '../MapProgress/mapProgress';
import { applySettings, loadSettings, saveSettings, type WortlandSettings } from '../Settings/settings';

export type Screen =
  | 'splash'
  | 'language'
  | 'name'
  | 'avatar'
  | 'mode'
  | 'email'
  | 'home'
  | 'learn'
  | 'games'
  | 'progress'
  | 'profile'
  | 'settings'
  | 'levelWheel'
  | 'topicPicker'
  | 'gameModes'
  | 'arenaStub'
  | 'pictureMatch'
  | 'quickPick'
  | 'articlePick'
  | 'classicCards'
  | 'memoryFlip'
  | 'buildIt'
  | 'masterChallenge'
  | 'listeningHunt'
  | 'speedRound'
  | 'wordPuzzle'
  | 'conversationMission'
  | 'family';

interface AppState {
  profile: UserProfile;
  screen: Screen;
  selectedLevel: number;
  selectedTopic: string;
  selectedMode: string;
  updateProfile: (patch: Partial<UserProfile>) => void;
  settings: WortlandSettings;
  updateSettings: (patch: Partial<WortlandSettings>) => void;
  setScreen: (s: Screen) => void;
  setSelectedLevel: (n: number) => void;
  setSelectedTopic: (id: string) => void;
  setSelectedMode: (id: string) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  dir: 'rtl' | 'ltr';
  mode: AppMode;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [screen, setScreen] = useState<Screen>(() =>
    hasSavedProfile(loadProfile()) ? 'home' : 'splash',
  );
  const [settings, setSettings] = useState<WortlandSettings>(() => loadSettings());
  const [selectedLevel, setSelectedLevel] = useState(() => loadProfile().level || 1);
  const [selectedTopic, setSelectedTopic] = useState('tiere');
  const [selectedMode, setSelectedMode] = useState('picture');

  const updateSettings = useCallback((patch: Partial<WortlandSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      saveProfile(next);
      return next;
    });
  }, []);

  const completeOnboarding = useCallback(() => {
    setProfile((prev) => {
      const next = { ...prev, onboardingComplete: true };
      saveProfile(next);
      return next;
    });
    setScreen('home');
  }, []);

  const resetOnboarding = useCallback(() => {
    clearMapProgress();
    clearBadges();
    clearProfile();
    const fresh = loadProfile();
    setProfile(fresh);
    setScreen('splash');
  }, []);

  const dir = getDir(profile.appLanguage);
  const mode = profile.mode;

  useEffect(() => {
    applySettings(settings);
  }, [settings]);

  useEffect(() => {
    document.documentElement.lang = profile.appLanguage;
    document.documentElement.dir = dir;
    document.documentElement.dataset.mode = mode;
  }, [profile.appLanguage, dir, mode]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      translate(profile.appLanguage as AppLanguage, key, vars),
    [profile.appLanguage],
  );

  const value = useMemo(
    () => ({
      profile,
      settings,
      screen,
      selectedLevel,
      selectedTopic,
      selectedMode,
      updateProfile,
      updateSettings,
      setScreen,
      setSelectedLevel,
      setSelectedTopic,
      setSelectedMode,
      completeOnboarding,
      resetOnboarding,
      t,
      dir,
      mode,
    }),
    [
      profile,
      settings,
      screen,
      selectedLevel,
      selectedTopic,
      selectedMode,
      updateProfile,
      updateSettings,
      completeOnboarding,
      resetOnboarding,
      t,
      dir,
      mode,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp outside provider');
  return ctx;
}
