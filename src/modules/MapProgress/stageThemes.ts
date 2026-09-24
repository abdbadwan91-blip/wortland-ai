export interface StageTheme {
  stage: number;
  topicId: string;
  icon: string;
  de: string;
  en: string;
  ar: string;
  world: 'start' | 'daily' | 'city' | 'life' | 'advanced';
}

const THEMES: Array<[string, string, string, string, string, StageTheme['world']]> = [
  ['begrüßung','👋','Begrüßung','Greetings','التحية','start'],
  ['vorstellen','🙋','Sich vorstellen','Introducing yourself','التعريف بالنفس','start'],
  ['zahlen','🔢','Zahlen & Uhrzeit','Numbers & time','الأرقام والوقت','start'],
  ['farben','🎨','Farben & Formen','Colors & shapes','الألوان والأشكال','start'],
  ['familie','👨‍👩‍👧','Familie','Family','العائلة','start'],
  ['zuhause','🏠','Zuhause','Home','المنزل','daily'],
  ['essen','🍽️','Essen & Trinken','Food & drinks','الطعام والشراب','daily'],
  ['cafe','☕','Im Café','At the café','في المقهى','daily'],
  ['einkaufen','🛍️','Einkaufen','Shopping','التسوق','daily'],
  ['kleidung','👕','Kleidung','Clothes','الملابس','daily'],
  ['koerper','🧍','Körper','Body','الجسم','daily'],
  ['gesundheit','🩺','Gesundheit','Health','الصحة','daily'],
  ['arzt','👨‍⚕️','Beim Arzt','At the doctor','عند الطبيب','life'],
  ['apotheke','💊','In der Apotheke','At the pharmacy','في الصيدلية','life'],
  ['schule','🎒','Schule','School','المدرسة','life'],
  ['lernen','📚','Lernen & Studium','Learning & study','الدراسة والتعلم','life'],
  ['arbeit','💼','Arbeit','Work','العمل','life'],
  ['bewerbung','📄','Bewerbung','Job application','التقدم للعمل','life'],
  ['berufe','🧑‍🔧','Berufe','Professions','المهن','life'],
  ['transport','🚌','Unterwegs','Getting around','المواصلات','city'],
  ['bahnhof','🚆','Am Bahnhof','At the station','في محطة القطار','city'],
  ['stadt','🏙️','In der Stadt','In the city','في المدينة','city'],
  ['weg','🧭','Nach dem Weg fragen','Asking directions','السؤال عن الطريق','city'],
  ['restaurant','🍴','Restaurant','Restaurant','المطعم','city'],
  ['hotel','🏨','Hotel','Hotel','الفندق','city'],
  ['reisen','🧳','Reisen','Travel','السفر','city'],
  ['wetter','🌦️','Wetter','Weather','الطقس','daily'],
  ['natur','🌳','Natur','Nature','الطبيعة','daily'],
  ['freizeit','⚽','Freizeit & Sport','Leisure & sport','وقت الفراغ والرياضة','daily'],
  ['freunde','🧑‍🤝‍🧑','Freunde & Treffen','Friends & meeting','الأصدقاء واللقاءات','daily'],
  ['termine','📅','Termine','Appointments','المواعيد','life'],
  ['telefon','📱','Telefonieren','Phone calls','المكالمات الهاتفية','life'],
  ['wohnen','🔑','Wohnung & Miete','Housing & rent','السكن والإيجار','life'],
  ['nachbarn','🏘️','Nachbarn','Neighbors','الجيران','life'],
  ['behörden','🏛️','Behörden','Public offices','الدوائر الرسمية','advanced'],
  ['bank','🏦','Bank & Geld','Bank & money','البنك والمال','advanced'],
  ['post','📦','Post & Pakete','Post & parcels','البريد والطرود','advanced'],
  ['notfall','🚑','Notfall','Emergency','الطوارئ','advanced'],
  ['umgangssprache','💬','Alltagsdeutsch','Everyday German','الألمانية اليومية','advanced'],
  ['meinung','🗣️','Meinung & Diskussion','Opinions & discussion','الرأي والنقاش','advanced'],
  ['medien','📰','Medien & Nachrichten','Media & news','الإعلام والأخبار','advanced'],
  ['kultur','🎭','Kultur & Gesellschaft','Culture & society','الثقافة والمجتمع','advanced'],
  ['umwelt','♻️','Umwelt','Environment','البيئة','advanced'],
  ['technik','💻','Technik & Internet','Technology & internet','التقنية والإنترنت','advanced'],
  ['meister','🏆','Meisterprüfung','Master challenge','اختبار الإتقان','advanced'],
];

export const TOPIC_CATALOG: StageTheme[] = THEMES.map((t, i) => ({
  stage: i + 1, topicId:t[0], icon:t[1], de:t[2], en:t[3], ar:t[4], world:t[5],
}));

/** Current map keeps 20 progression nodes; topics beyond 20 are ready for new worlds. */
export const STAGE_THEMES: StageTheme[] = TOPIC_CATALOG.slice(0, 20);

export function getStageTheme(stage: number): StageTheme {
  return STAGE_THEMES[Math.min(STAGE_THEMES.length - 1, Math.max(0, stage - 1))];
}

export function stageThemeLabel(stage: number, lang: string): string {
  const theme = getStageTheme(stage);
  return lang === 'ar' ? theme.ar : lang === 'de' ? theme.de : theme.en;
}

export function topicsByWorld(world: StageTheme['world']): StageTheme[] {
  return TOPIC_CATALOG.filter((topic) => topic.world === world);
}
