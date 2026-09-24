export type AppLanguage =
  | 'ar' | 'en' | 'de' | 'tr' | 'uk' | 'ru'
  | 'fr' | 'es' | 'pl' | 'fa' | 'ur' | 'it';

export type LearningLanguage = 'de';
export type AppMode = 'junior' | 'standard';

export interface UserProfile {
  name: string;
  avatarId: string;
  mode: AppMode;
  appLanguage: AppLanguage;
  translationLanguage: AppLanguage;
  learningLanguage: LearningLanguage;
  email?: string;
  onboardingComplete: boolean;
  streak: number;
  coins: number;
  xp: number;
  level: number;
}

export const STORAGE_KEY = 'deutsch-quest-profile-v1';

export const defaultProfile = (): UserProfile => ({
  name: '',
  avatarId: '',
  mode: 'standard',
  appLanguage: 'en',
  translationLanguage: 'en',
  learningLanguage: 'de',
  email: undefined,
  onboardingComplete: false,
  streak: 0,
  coins: 0,
  xp: 0,
  level: 1,
});

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile();
    return { ...defaultProfile(), ...JSON.parse(raw) };
  } catch {
    return defaultProfile();
  }
}

export function saveProfile(p: UserProfile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

/** A saved name + avatar is enough to resume at Home, even for older profiles
 * that predate the onboardingComplete flag. */
export function hasSavedProfile(p: UserProfile): boolean {
  return p.onboardingComplete || (p.name.trim().length > 0 && p.avatarId.length > 0);
}

export function clearProfile(): void {
  localStorage.removeItem(STORAGE_KEY);
}
