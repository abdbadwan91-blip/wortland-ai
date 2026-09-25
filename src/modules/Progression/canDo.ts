export interface CanDo { ar:string; de:string; en:string; }
export function canDoStatement(stage:number):CanDo{
 const tier=Math.floor((Math.max(1,stage)-1)/4);
 const rows:CanDo[]=[
 {ar:'أستطيع استخدام كلمات وجمل قصيرة في موقف مألوف.',de:'Ich kann kurze Wörter und Sätze in einer vertrauten Situation verwenden.',en:'I can use short words and sentences in a familiar situation.'},
 {ar:'أستطيع إجراء تبادل قصير في الحياة اليومية.',de:'Ich kann einen kurzen Austausch im Alltag führen.',en:'I can manage a short everyday exchange.'},
 {ar:'أستطيع فهم الموقف والرد بجمل مترابطة.',de:'Ich kann die Situation verstehen und mit verbundenen Sätzen antworten.',en:'I can understand the situation and respond with connected sentences.'},
 {ar:'أستطيع التعبير بشكل أوضح وأكثر طبيعية.',de:'Ich kann mich klarer und natürlicher ausdrücken.',en:'I can express myself more clearly and naturally.'},
 {ar:'أستطيع التعامل مع مواقف متنوعة بسرعة ودقة.',de:'Ich kann unterschiedliche Situationen schnell und präzise bewältigen.',en:'I can handle varied situations quickly and accurately.'},
 ];
 return rows[Math.min(rows.length-1,tier)];
}
export function canDoLabel(c:CanDo,language:string){return language==='ar'?c.ar:language==='de'?c.de:c.en;}
