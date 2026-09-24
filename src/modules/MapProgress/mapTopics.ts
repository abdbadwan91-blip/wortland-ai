export type TopicWorldId = 'starter' | 'daily' | 'city' | 'germany' | 'master';

export interface MapTopic {
  id: string;
  icon: string;
  de: string;
  en: string;
  ar: string;
  world: TopicWorldId;
}

export interface TopicWorld {
  id: TopicWorldId;
  icon: string;
  de: string;
  en: string;
  ar: string;
}

export const TOPIC_WORLDS: TopicWorld[] = [
  {id:'starter',icon:'🌱',de:'Startdorf',en:'Starter Village',ar:'قرية البداية'},
  {id:'daily',icon:'🌿',de:'Alltagstal',en:'Daily Life Valley',ar:'وادي الحياة اليومية'},
  {id:'city',icon:'🏙️',de:'Stadtwelt',en:'City World',ar:'عالم المدينة'},
  {id:'germany',icon:'🧭',de:'Leben in Deutschland',en:'Life in Germany',ar:'الحياة في ألمانيا'},
  {id:'master',icon:'🏰',de:'Meisterland',en:'Master Land',ar:'أرض الإتقان'},
];

export const MAP_TOPICS: MapTopic[] = [
  {id:'tiere',icon:'🐾',de:'Tiere',en:'Animals',ar:'الحيوانات',world:'starter'},
  {id:'begrussung',icon:'👋',de:'Begrüßung',en:'Greetings',ar:'التحية',world:'starter'},
  {id:'vorstellen',icon:'🙋',de:'Sich vorstellen',en:'Introducing yourself',ar:'التعريف بالنفس',world:'starter'},
  {id:'zahlen',icon:'🔢',de:'Zahlen & Uhrzeit',en:'Numbers & time',ar:'الأرقام والوقت',world:'starter'},
  {id:'farben',icon:'🎨',de:'Farben & Formen',en:'Colors & shapes',ar:'الألوان والأشكال',world:'starter'},
  {id:'familie',icon:'👨‍👩‍👧',de:'Familie',en:'Family',ar:'العائلة',world:'starter'},
  {id:'zuhause',icon:'🏠',de:'Zuhause',en:'Home',ar:'المنزل',world:'daily'},
  {id:'essen',icon:'🍽️',de:'Essen & Trinken',en:'Food & drinks',ar:'الطعام والشراب',world:'daily'},
  {id:'cafe',icon:'☕',de:'Im Café',en:'At the café',ar:'في المقهى',world:'daily'},
  {id:'einkaufen',icon:'🛍️',de:'Einkaufen',en:'Shopping',ar:'التسوق',world:'daily'},
  {id:'kleidung',icon:'👕',de:'Kleidung',en:'Clothes',ar:'الملابس',world:'daily'},
  {id:'koerper',icon:'🧍',de:'Körper',en:'Body',ar:'الجسم',world:'daily'},
  {id:'gesundheit',icon:'🩺',de:'Gesundheit',en:'Health',ar:'الصحة',world:'daily'},
  {id:'wetter',icon:'🌦️',de:'Wetter',en:'Weather',ar:'الطقس',world:'daily'},
  {id:'freizeit',icon:'⚽',de:'Freizeit & Sport',en:'Leisure & sport',ar:'وقت الفراغ والرياضة',world:'daily'},
  {id:'freunde',icon:'🧑‍🤝‍🧑',de:'Freunde & Treffen',en:'Friends & meeting',ar:'الأصدقاء واللقاءات',world:'daily'},
  {id:'transport',icon:'🚌',de:'Unterwegs',en:'Getting around',ar:'المواصلات',world:'city'},
  {id:'bahnhof',icon:'🚆',de:'Am Bahnhof',en:'At the station',ar:'في محطة القطار',world:'city'},
  {id:'stadt',icon:'🏙️',de:'In der Stadt',en:'In the city',ar:'في المدينة',world:'city'},
  {id:'weg',icon:'🧭',de:'Nach dem Weg fragen',en:'Asking directions',ar:'السؤال عن الطريق',world:'city'},
  {id:'restaurant',icon:'🍴',de:'Restaurant',en:'Restaurant',ar:'المطعم',world:'city'},
  {id:'hotel',icon:'🏨',de:'Hotel',en:'Hotel',ar:'الفندق',world:'city'},
  {id:'reisen',icon:'🧳',de:'Reisen',en:'Travel',ar:'السفر',world:'city'},
  {id:'post',icon:'📦',de:'Post & Pakete',en:'Post & parcels',ar:'البريد والطرود',world:'city'},
  {id:'schule',icon:'🎒',de:'Schule',en:'School',ar:'المدرسة',world:'germany'},
  {id:'lernen',icon:'📚',de:'Lernen & Studium',en:'Learning & study',ar:'الدراسة والتعلم',world:'germany'},
  {id:'arbeit',icon:'💼',de:'Arbeit',en:'Work',ar:'العمل',world:'germany'},
  {id:'bewerbung',icon:'📄',de:'Bewerbung',en:'Job application',ar:'التقدم للعمل',world:'germany'},
  {id:'berufe',icon:'🧑‍🔧',de:'Berufe',en:'Professions',ar:'المهن',world:'germany'},
  {id:'arzt',icon:'👨‍⚕️',de:'Beim Arzt',en:'At the doctor',ar:'عند الطبيب',world:'germany'},
  {id:'apotheke',icon:'💊',de:'In der Apotheke',en:'At the pharmacy',ar:'في الصيدلية',world:'germany'},
  {id:'termine',icon:'📅',de:'Termine',en:'Appointments',ar:'المواعيد',world:'germany'},
  {id:'telefon',icon:'📱',de:'Telefonieren',en:'Phone calls',ar:'المكالمات الهاتفية',world:'germany'},
  {id:'wohnen',icon:'🔑',de:'Wohnung & Miete',en:'Housing & rent',ar:'السكن والإيجار',world:'germany'},
  {id:'nachbarn',icon:'🏘️',de:'Nachbarn',en:'Neighbors',ar:'الجيران',world:'germany'},
  {id:'behoerden',icon:'🏛️',de:'Behörden',en:'Public offices',ar:'الدوائر الرسمية',world:'master'},
  {id:'bank',icon:'🏦',de:'Bank & Geld',en:'Bank & money',ar:'البنك والمال',world:'master'},
  {id:'notfall',icon:'🚑',de:'Notfall',en:'Emergency',ar:'الطوارئ',world:'master'},
  {id:'umgangssprache',icon:'💬',de:'Alltagsdeutsch',en:'Everyday German',ar:'الألمانية اليومية',world:'master'},
  {id:'meinung',icon:'🗣️',de:'Meinung & Diskussion',en:'Opinions & discussion',ar:'الرأي والنقاش',world:'master'},
  {id:'medien',icon:'📰',de:'Medien & Nachrichten',en:'Media & news',ar:'الإعلام والأخبار',world:'master'},
  {id:'kultur',icon:'🎭',de:'Kultur & Gesellschaft',en:'Culture & society',ar:'الثقافة والمجتمع',world:'master'},
  {id:'umwelt',icon:'♻️',de:'Umwelt',en:'Environment',ar:'البيئة',world:'master'},
  {id:'technik',icon:'💻',de:'Technik & Internet',en:'Technology & internet',ar:'التقنية والإنترنت',world:'master'},
  {id:'meister',icon:'🏆',de:'Meisterprüfung',en:'Master challenge',ar:'اختبار الإتقان',world:'master'},
];

export const ACTIVE_MAP_TOPICS = MAP_TOPICS.slice(0,20);

export function mapTopic(stage:number):MapTopic {
  return ACTIVE_MAP_TOPICS[Math.max(0,Math.min(ACTIVE_MAP_TOPICS.length-1,stage-1))];
}

export function mapTopicLabel(stage:number,language:string):string {
  const topic=mapTopic(stage);
  return language==='ar'?topic.ar:language==='de'?topic.de:topic.en;
}

export function topicsForWorld(world:TopicWorldId):MapTopic[] {
  return MAP_TOPICS.filter((topic)=>topic.world===world);
}

export function worldLabel(world:TopicWorld,language:string):string {
  return language==='ar'?world.ar:language==='de'?world.de:world.en;
}
