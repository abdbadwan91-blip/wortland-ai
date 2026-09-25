export interface WorldOneStage {
 stage:number; icon:string; scene:string; de:string; en:string; ar:string;
 missionDe:string; missionEn:string; missionAr:string; boss?:boolean;
}
export const WORLD_ONE_STAGES:WorldOneStage[]=[
 {stage:1,icon:'🏠',scene:'home',de:'Zuhause',en:'At home',ar:'في المنزل',missionDe:'Begrüßen und Dinge zu Hause benennen',missionEn:'Greet and name things at home',missionAr:'التحية وتسمية الأشياء في المنزل'},
 {stage:2,icon:'☕',scene:'cafe',de:'Im Café',en:'At the café',ar:'في المقهى',missionDe:'Ein Getränk und Essen höflich bestellen',missionEn:'Order a drink and food politely',missionAr:'طلب مشروب وطعام بأدب'},
 {stage:3,icon:'🎒',scene:'school',de:'In der Schule',en:'At school',ar:'في المدرسة',missionDe:'Einfache Anweisungen verstehen und antworten',missionEn:'Understand simple instructions and reply',missionAr:'فهم تعليمات بسيطة والرد عليها'},
 {stage:4,icon:'👑',scene:'village-boss',de:'Dorf-Challenge',en:'Village challenge',ar:'تحدي القرية',missionDe:'Zuhause, Café und Schule in einer Mission verbinden',missionEn:'Combine home, café and school in one mission',missionAr:'دمج المنزل والمقهى والمدرسة في مهمة واحدة',boss:true},
];
export const worldOneStage=(stage:number)=>WORLD_ONE_STAGES.find(x=>x.stage===stage);
export function worldOneText(v:{de:string;en:string;ar:string},language:string){return language==='ar'?v.ar:language==='de'?v.de:v.en;}
export function worldOneMission(v:WorldOneStage,language:string){return language==='ar'?v.missionAr:language==='de'?v.missionDe:v.missionEn;}
export function isWorldOne(stage:number){return stage>=1&&stage<=4;}
