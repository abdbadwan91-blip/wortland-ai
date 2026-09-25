export interface RealLifeGoal { icon:string; ar:string; de:string; en:string; }
const GOALS:RealLifeGoal[]=[
{icon:'👋',ar:'التحية والتعريف بنفسك',de:'Begrüßen und sich vorstellen',en:'Greet and introduce yourself'},
{icon:'☕',ar:'الطلب بأدب',de:'Höflich bestellen',en:'Order politely'},
{icon:'🏠',ar:'وصف المنزل والأشياء',de:'Wohnung und Dinge beschreiben',en:'Describe home and objects'},
{icon:'🎒',ar:'فهم تعليمات بسيطة',de:'Einfache Anweisungen verstehen',en:'Understand simple instructions'},
{icon:'👨‍👩‍👧',ar:'الحديث عن العائلة',de:'Über Familie sprechen',en:'Talk about family'},
{icon:'🎨',ar:'وصف اللون والصفة',de:'Farben und Eigenschaften nennen',en:'Describe colors and qualities'},
{icon:'👕',ar:'السؤال عن الملابس والمقاس',de:'Nach Kleidung und Größe fragen',en:'Ask about clothes and size'},
{icon:'🧍',ar:'وصف الجسم والحركة',de:'Körper und Bewegung beschreiben',en:'Describe body and movement'},
{icon:'🩺',ar:'شرح عرض صحي بسيط',de:'Einfache Beschwerden erklären',en:'Explain a simple health complaint'},
{icon:'🚌',ar:'السؤال عن الطريق والمواصلات',de:'Nach Weg und Verkehr fragen',en:'Ask about directions and transport'},
{icon:'🏙️',ar:'التعامل في المدينة',de:'Sich in der Stadt orientieren',en:'Navigate the city'},
{icon:'🍴',ar:'الطلب والتعامل في المطعم',de:'Im Restaurant bestellen',en:'Handle a restaurant situation'},
{icon:'💼',ar:'التواصل في العمل',de:'Am Arbeitsplatz kommunizieren',en:'Communicate at work'},
{icon:'📅',ar:'تحديد موعد وتغييره',de:'Termin vereinbaren und ändern',en:'Make and change an appointment'},
{icon:'🔑',ar:'الحديث عن السكن والإيجار',de:'Über Wohnung und Miete sprechen',en:'Talk about housing and rent'},
{icon:'🏛️',ar:'فهم موقف في دائرة رسمية',de:'Eine Behördensituation verstehen',en:'Handle a public-office situation'},
{icon:'⚽',ar:'التحدث عن وقت الفراغ',de:'Über Freizeit sprechen',en:'Talk about free time'},
{icon:'🧳',ar:'التصرف أثناء السفر',de:'Auf Reisen kommunizieren',en:'Communicate while travelling'},
{icon:'💬',ar:'فهم الألمانية اليومية الطبيعية',de:'Natürliches Alltagsdeutsch verstehen',en:'Understand natural everyday German'},
{icon:'🏆',ar:'دمج المهارات في مواقف حقيقية',de:'Fähigkeiten in echten Situationen verbinden',en:'Combine skills in real situations'},
];
export function realLifeGoal(stage:number){return GOALS[Math.max(0,Math.min(GOALS.length-1,stage-1))];}
export function realLifeGoalLabel(goal:RealLifeGoal,language:string){return language==='ar'?goal.ar:language==='de'?goal.de:goal.en;}
