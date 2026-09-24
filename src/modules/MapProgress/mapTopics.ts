export interface MapTopic {
  id: string;
  icon: string;
  de: string;
  en: string;
  ar: string;
}

export const MAP_TOPICS: MapTopic[] = [
  {id:'tiere',icon:'🐾',de:'Tiere',en:'Animals',ar:'الحيوانات'},
  {id:'essen',icon:'🍽️',de:'Essen & Café',en:'Food & Café',ar:'الطعام والمقهى'},
  {id:'zuhause',icon:'🏠',de:'Zuhause',en:'Home',ar:'المنزل'},
  {id:'schule',icon:'🎒',de:'Schule',en:'School',ar:'المدرسة'},
  {id:'familie',icon:'👨‍👩‍👧',de:'Familie',en:'Family',ar:'العائلة'},
  {id:'farben',icon:'🎨',de:'Farben',en:'Colors',ar:'الألوان'},
  {id:'kleidung',icon:'👕',de:'Kleidung',en:'Clothes',ar:'الملابس'},
  {id:'koerper',icon:'🧍',de:'Körper',en:'Body',ar:'الجسم'},
  {id:'gesundheit',icon:'🩺',de:'Gesundheit',en:'Health',ar:'الصحة'},
  {id:'transport',icon:'🚌',de:'Unterwegs',en:'Transport',ar:'المواصلات'},
  {id:'stadt',icon:'🏙️',de:'In der Stadt',en:'In the city',ar:'في المدينة'},
  {id:'restaurant',icon:'🍴',de:'Restaurant',en:'Restaurant',ar:'المطعم'},
  {id:'arbeit',icon:'💼',de:'Arbeit',en:'Work',ar:'العمل'},
  {id:'termine',icon:'📅',de:'Termine',en:'Appointments',ar:'المواعيد'},
  {id:'wohnen',icon:'🔑',de:'Wohnung & Miete',en:'Housing & rent',ar:'السكن والإيجار'},
  {id:'behoerden',icon:'🏛️',de:'Behörden',en:'Public offices',ar:'الدوائر الرسمية'},
  {id:'freizeit',icon:'⚽',de:'Freizeit',en:'Free time',ar:'وقت الفراغ'},
  {id:'reisen',icon:'🧳',de:'Reisen',en:'Travel',ar:'السفر'},
  {id:'umgangssprache',icon:'💬',de:'Alltagsdeutsch',en:'Everyday German',ar:'الألمانية اليومية'},
  {id:'meister',icon:'🏆',de:'Meisterprüfung',en:'Master challenge',ar:'اختبار الإتقان'},
];

export function mapTopic(stage:number):MapTopic {
  return MAP_TOPICS[Math.max(0,Math.min(MAP_TOPICS.length-1,stage-1))];
}

export function mapTopicLabel(stage:number,language:string):string {
  const topic=mapTopic(stage);
  return language==='ar'?topic.ar:language==='de'?topic.de:topic.en;
}
