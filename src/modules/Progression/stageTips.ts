export interface StageTip { icon:string; ar:string; de:string; en:string; }
const TIPS:StageTip[]=[
{icon:'👂',ar:'استمع أولاً ثم أجب.',de:'Höre zuerst zu, dann antworte.',en:'Listen first, then answer.'},
{icon:'🔊',ar:'اضغط على الصوت وكرر الجملة.',de:'Spiele den Ton ab und sprich den Satz nach.',en:'Play the audio and repeat the sentence.'},
{icon:'🧠',ar:'ركز على المعنى داخل الجملة، لا على الكلمة وحدها.',de:'Achte auf die Bedeutung im Satz, nicht nur auf das einzelne Wort.',en:'Focus on meaning in the sentence, not only the word.'},
{icon:'✍️',ar:'حاول بناء الجملة قبل رؤية الحل.',de:'Baue den Satz zuerst selbst, bevor du die Lösung ansiehst.',en:'Try building the sentence before seeing the answer.'},
{icon:'💬',ar:'اختر الرد الذي ستقوله فعلاً في الحياة اليومية.',de:'Wähle die Antwort, die du im Alltag wirklich sagen würdest.',en:'Choose the reply you would really use in daily life.'},
];
export function stageTip(stage:number):StageTip{return TIPS[(Math.max(1,stage)-1)%TIPS.length];}
export function stageTipLabel(t:StageTip,language:string){return language==='ar'?t.ar:language==='de'?t.de:t.en;}
