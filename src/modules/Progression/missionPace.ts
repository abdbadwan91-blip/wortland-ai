export interface MissionPace { labelAr:string; labelDe:string; labelEn:string; intensity:number; }
export function missionPace(stage:number,boss:boolean):MissionPace{
 const intensity=boss?5:Math.min(5,1+Math.floor((Math.max(1,stage)-1)/4));
 const labels=intensity<=2?['هادئ','Ruhig','Calm']:intensity<=4?['متوسط','Aktiv','Active']:['مكثف','Intensiv','Intense'];
 return {labelAr:labels[0],labelDe:labels[1],labelEn:labels[2],intensity};
}
export function paceLabel(p:MissionPace,language:string){return language==='ar'?p.labelAr:language==='de'?p.labelDe:p.labelEn;}
