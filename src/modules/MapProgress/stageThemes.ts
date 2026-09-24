export interface StageTheme {
  stage: number;
  topicId: string;
  icon: string;
  de: string;
  en: string;
  ar: string;
}

const THEMES = [
  ['begrüßung','👋','Begrüßung','Greetings','التحية'],
  ['familie','👨‍👩‍👧','Familie','Family','العائلة'],
  ['essen','🍽️','Essen & Café','Food & Café','الطعام والمقهى'],
  ['zuhause','🏠','Zuhause','Home','المنزل'],
  ['schule','🎒','Schule','School','المدرسة'],
  ['einkaufen','🛍️','Einkaufen','Shopping','التسوق'],
  ['kleidung','👕','Kleidung','Clothes','الملابس'],
  ['koerper','🧍','Körper','Body','الجسم'],
  ['gesundheit','🩺','Gesundheit','Health','الصحة'],
  ['transport','🚌','Unterwegs','Getting around','المواصلات'],
  ['stadt','🏙️','In der Stadt','In the city','في المدينة'],
  ['restaurant','🍴','Restaurant','Restaurant','المطعم'],
  ['arbeit','💼','Arbeit','Work','العمل'],
  ['termine','📅','Termine','Appointments','المواعيد'],
  ['wohnen','🔑','Wohnen','Housing','السكن'],
  ['behörden','🏛️','Behörden','Public offices','الدوائر الرسمية'],
  ['freizeit','⚽','Freizeit','Free time','وقت الفراغ'],
  ['reisen','🧳','Reisen','Travel','السفر'],
  ['umgangssprache','💬','Alltagsdeutsch','Everyday German','الألمانية اليومية'],
  ['meister','🏆','Meisterprüfung','Master challenge','اختبار الإتقان'],
] as const;

export const STAGE_THEMES: StageTheme[] = THEMES.map((t, i) => ({
  stage: i + 1, topicId: t[0], icon: t[1], de: t[2], en: t[3], ar: t[4],
}));

export function getStageTheme(stage: number): StageTheme {
  return STAGE_THEMES[Math.min(19, Math.max(0, stage - 1))];
}

export function stageThemeLabel(stage: number, lang: string): string {
  const theme = getStageTheme(stage);
  return lang === 'ar' ? theme.ar : lang === 'de' ? theme.de : theme.en;
}
