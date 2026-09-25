import type { MissionKind } from './stageMission';

export interface MissionStep { icon:string; ar:string; de:string; en:string; }
const STEPS:Record<MissionKind,MissionStep[]>={
 learn:[{icon:'👀',ar:'شاهد الكلمة والصورة',de:'Wort und Bild ansehen',en:'See word and picture'},{icon:'🔊',ar:'اسمع النطق',de:'Aussprache hören',en:'Hear pronunciation'},{icon:'✅',ar:'اختر المعنى الصحيح',de:'Richtige Bedeutung wählen',en:'Choose the correct meaning'}],
 listen:[{icon:'🎧',ar:'استمع دون قراءة',de:'Ohne Text zuhören',en:'Listen without reading'},{icon:'🧠',ar:'حدد ما فهمته',de:'Verstandenes erkennen',en:'Identify what you understood'},{icon:'🔁',ar:'أعد الاستماع عند الحاجة',de:'Bei Bedarf wiederholen',en:'Replay when needed'}],
 speak:[{icon:'🔊',ar:'استمع للنموذج',de:'Vorbild anhören',en:'Hear the model'},{icon:'🗣️',ar:'كرر بصوت واضح',de:'Deutlich nachsprechen',en:'Repeat clearly'},{icon:'⭐',ar:'حسن النطق بالمحاولة',de:'Aussprache verbessern',en:'Improve with another try'}],
 build:[{icon:'🧩',ar:'رتب الكلمات',de:'Wörter ordnen',en:'Order the words'},{icon:'✍️',ar:'كوّن الجملة',de:'Satz bilden',en:'Build the sentence'},{icon:'✅',ar:'راجع ترتيبك',de:'Reihenfolge prüfen',en:'Check your order'}],
 speed:[{icon:'⚡',ar:'اقرأ بسرعة',de:'Schnell lesen',en:'Read quickly'},{icon:'🎯',ar:'اختر بدقة',de:'Genau wählen',en:'Choose accurately'},{icon:'🔥',ar:'حافظ على السلسلة',de:'Serie halten',en:'Keep the streak'}],
 conversation:[{icon:'💬',ar:'اقرأ الموقف',de:'Situation lesen',en:'Read the situation'},{icon:'🤔',ar:'فكر بالرد الطبيعي',de:'Natürliche Antwort überlegen',en:'Think of a natural reply'},{icon:'🗣️',ar:'اختر الرد المناسب',de:'Passende Antwort wählen',en:'Choose the suitable reply'}],
 review:[{icon:'🔁',ar:'راجع الكلمات الضعيفة',de:'Schwache Wörter wiederholen',en:'Review weak words'},{icon:'🧠',ar:'استرجع دون مساعدة',de:'Ohne Hilfe erinnern',en:'Recall without help'},{icon:'✅',ar:'ثبت الإجابة الصحيحة',de:'Richtige Antwort festigen',en:'Reinforce the answer'}],
 boss:[{icon:'👑',ar:'واجه مهام مختلطة',de:'Gemischte Aufgaben lösen',en:'Face mixed tasks'},{icon:'🎯',ar:'حقق دقة الإتقان',de:'Meistergenauigkeit erreichen',en:'Reach mastery accuracy'},{icon:'🔓',ar:'افتح العالم التالي',de:'Nächste Welt öffnen',en:'Unlock the next world'}],
};
export function missionSteps(kind:MissionKind){return STEPS[kind];}
export function missionStepLabel(step:MissionStep,language:string){return language==='ar'?step.ar:language==='de'?step.de:step.en;}
