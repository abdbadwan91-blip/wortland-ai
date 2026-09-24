import type { SkillFocus } from './learningObjective';

export interface SkillBadge { focus:SkillFocus; icon:string; ar:string; de:string; en:string; }
const BADGES:Record<SkillFocus,SkillBadge>={
 vocabulary:{focus:'vocabulary',icon:'🧠',ar:'مفردات',de:'Wortschatz',en:'Vocabulary'},
 listening:{focus:'listening',icon:'🎧',ar:'استماع',de:'Hören',en:'Listening'},
 grammar:{focus:'grammar',icon:'🧱',ar:'قواعد',de:'Grammatik',en:'Grammar'},
 sentence:{focus:'sentence',icon:'✍️',ar:'جمل',de:'Sätze',en:'Sentences'},
 conversation:{focus:'conversation',icon:'💬',ar:'محادثة',de:'Sprechen',en:'Conversation'},
 review:{focus:'review',icon:'🔁',ar:'مراجعة',de:'Wiederholen',en:'Review'},
};
export function skillBadge(focus:SkillFocus,language:string){const b=BADGES[focus];return {...b,label:language==='ar'?b.ar:language==='de'?b.de:b.en};}
