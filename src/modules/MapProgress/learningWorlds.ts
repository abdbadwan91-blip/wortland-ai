import { TOPIC_CATALOG, type StageTheme } from './stageThemes';

export interface LearningWorld {
  id: StageTheme['world'];
  icon: string;
  de: string;
  en: string;
  ar: string;
  topics: StageTheme[];
}

const META: Record<StageTheme['world'], Omit<LearningWorld,'id'|'topics'>> = {
  start:{icon:'🌱',de:'Startdorf',en:'Starter Village',ar:'قرية البداية'},
  daily:{icon:'🌿',de:'Alltagstal',en:'Daily Life Valley',ar:'وادي الحياة اليومية'},
  city:{icon:'🏙️',de:'Stadtwelt',en:'City World',ar:'عالم المدينة'},
  life:{icon:'🧭',de:'Leben in Deutschland',en:'Life in Germany',ar:'الحياة في ألمانيا'},
  advanced:{icon:'🏰',de:'Meisterland',en:'Master Land',ar:'أرض الإتقان'},
};

export const LEARNING_WORLDS: LearningWorld[] = (Object.keys(META) as StageTheme['world'][]).map((id)=>({
  id,...META[id],topics:TOPIC_CATALOG.filter((t)=>t.world===id),
}));

export function worldLabel(world: LearningWorld, lang:string):string {
  return lang==='ar'?world.ar:lang==='de'?world.de:world.en;
}
