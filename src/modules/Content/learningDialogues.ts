import type { DialogueDomain } from './dialogueCorpus';

export type DialogueLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface LearningDialogue {
  id: string;
  level: DialogueLevel;
  domain: DialogueDomain;
  topicId: string;
  title: string;
  scene: string;
  sourceCorpus: 'bcontrast-wmt20';
  turns: Array<{ speaker: 'Anna' | 'Max'; de: string; en: string; ar?: string }>;
}

/**
 * Pedagogically adapted seed missions inspired by BConTrasT task domains.
 * These are deliberately short; the importer/curation pipeline can grow the
 * catalogue without coupling the UI to raw corpus JSON.
 */
export const LEARNING_DIALOGUES: LearningDialogue[] = [
  { id:'coffee-a1', level:'A1', domain:'coffee', topicId:'essen', title:'Im Café', scene:'☕', sourceCorpus:'bcontrast-wmt20', turns:[
    {speaker:'Anna',de:'Guten Tag! Einen Kaffee, bitte.',en:'Hello! A coffee, please.',ar:'مرحباً! قهوة من فضلك.'},
    {speaker:'Max',de:'Gerne. Mit Milch?',en:'Sure. With milk?',ar:'بكل سرور. مع الحليب؟'},
    {speaker:'Anna',de:'Ja, bitte. Danke!',en:'Yes, please. Thank you!',ar:'نعم من فضلك. شكراً!'}]},
  { id:'restaurant-a2', level:'A2', domain:'restaurant', topicId:'essen', title:'Im Restaurant', scene:'🍽️', sourceCorpus:'bcontrast-wmt20', turns:[
    {speaker:'Max',de:'Haben Sie einen Tisch für zwei Personen?',en:'Do you have a table for two?',ar:'هل لديكم طاولة لشخصين؟'},
    {speaker:'Anna',de:'Ja. Möchten Sie am Fenster sitzen?',en:'Yes. Would you like to sit by the window?',ar:'نعم. هل تود الجلوس بجانب النافذة؟'},
    {speaker:'Max',de:'Sehr gern. Können wir die Speisekarte bekommen?',en:'Gladly. Can we have the menu?',ar:'بكل سرور. هل يمكننا الحصول على قائمة الطعام؟'}]},
  { id:'ride-b1', level:'B1', domain:'transport', topicId:'transport', title:'Eine Fahrt organisieren', scene:'🚕', sourceCorpus:'bcontrast-wmt20', turns:[
    {speaker:'Anna',de:'Ich möchte morgen früh zum Bahnhof fahren.',en:'I would like to go to the station tomorrow morning.',ar:'أود الذهاب إلى محطة القطار صباح الغد.'},
    {speaker:'Max',de:'Um wie viel Uhr sollen wir Sie abholen?',en:'What time should we pick you up?',ar:'في أي ساعة نأتي لاصطحابك؟'},
    {speaker:'Anna',de:'Bitte gegen halb sieben. Mein Zug fährt um sieben Uhr zehn.',en:'Around six thirty, please. My train leaves at seven ten.',ar:'حوالي السادسة والنصف من فضلك. قطاري يغادر في السابعة وعشر دقائق.'}]},
  { id:'cinema-b2', level:'B2', domain:'cinema', topicId:'familie', title:'Kinokarten reservieren', scene:'🎬', sourceCorpus:'bcontrast-wmt20', turns:[
    {speaker:'Max',de:'Ich würde gern zwei Karten für die Abendvorstellung reservieren.',en:'I would like to reserve two tickets for the evening screening.',ar:'أود حجز تذكرتين للعرض المسائي.'},
    {speaker:'Anna',de:'Bevorzugen Sie Plätze in der Mitte oder eher hinten?',en:'Do you prefer seats in the middle or toward the back?',ar:'هل تفضل مقاعد في الوسط أم في الخلف؟'},
    {speaker:'Max',de:'Wenn möglich in der Mitte, solange die Plätze nebeneinander sind.',en:'In the middle if possible, as long as the seats are next to each other.',ar:'في الوسط إن أمكن، بشرط أن تكون المقاعد متجاورة.'}]},
  { id:'auto-c1', level:'C1', domain:'auto', topicId:'arbeit', title:'Werkstatttermin klären', scene:'🔧', sourceCorpus:'bcontrast-wmt20', turns:[
    {speaker:'Anna',de:'Seit einigen Tagen tritt beim Bremsen ein ungewöhnliches Geräusch auf, das ich gern überprüfen lassen würde.',en:'For several days an unusual noise has occurred while braking, which I would like to have checked.',ar:'منذ عدة أيام يظهر صوت غير معتاد عند الفرملة وأود فحصه.'},
    {speaker:'Max',de:'Könnten Sie das Fahrzeug vormittags bringen und uns mitteilen, unter welchen Bedingungen das Geräusch besonders auffällt?',en:'Could you bring the vehicle in the morning and tell us under which conditions the noise is particularly noticeable?',ar:'هل يمكنك إحضار السيارة صباحاً وإخبارنا في أي ظروف يظهر الصوت بشكل أوضح؟'},
    {speaker:'Anna',de:'Ja. Vor allem bei niedriger Geschwindigkeit ist es deutlich zu hören.',en:'Yes. It is particularly noticeable at low speed.',ar:'نعم. يُسمع بوضوح خصوصاً عند السرعة المنخفضة.'}]},
];


const LEVEL_ORDER: DialogueLevel[] = ['A1','A2','B1','B2','C1'];

export function dialogueLevelForCefr(cefr: string): DialogueLevel {
  if (cefr === 'Pre-A1') return 'A1';
  return LEVEL_ORDER.includes(cefr as DialogueLevel) ? cefr as DialogueLevel : 'A1';
}

export function pickDialogue(level: DialogueLevel, topicId: string, seed = 0): LearningDialogue | undefined {
  const exact = LEARNING_DIALOGUES.filter((d) => d.level === level && d.topicId === topicId);
  const sameLevel = LEARNING_DIALOGUES.filter((d) => d.level === level);
  const pool = exact.length ? exact : sameLevel;
  if (!pool.length) return undefined;
  const safeSeed = Math.abs(seed) % pool.length;
  return pool[safeSeed];
}

export function dialoguesFor(level: DialogueLevel, topicId?: string): LearningDialogue[] {
  const exact = LEARNING_DIALOGUES.filter((d) => d.level === level && (!topicId || d.topicId === topicId));
  return exact.length ? exact : LEARNING_DIALOGUES.filter((d) => d.level === level);
}

export function dialogueMissionOptions(level: DialogueLevel, topicId: string): LearningDialogue[] {
  const exact = LEARNING_DIALOGUES.filter((d) => d.level === level && d.topicId === topicId);
  const sameLevel = LEARNING_DIALOGUES.filter((d) => d.level === level && d.topicId !== topicId);
  return [...exact, ...sameLevel].slice(0, 6);
}
