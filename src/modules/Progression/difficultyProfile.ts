export interface DifficultyProfile { level:number; icon:string; ar:string; de:string; en:string; }
export function difficultyProfile(stage:number,boss:boolean):DifficultyProfile{
 const tier=Math.floor((Math.max(1,stage)-1)/4);
 const local=((Math.max(1,stage)-1)%4)+1;
 const level=Math.min(5,boss?Math.max(2,tier+2):Math.max(1,tier+Math.ceil(local/2)));
 const names=[['سهل','Leicht','Easy'],['متوسط','Mittel','Medium'],['متقدم','Fortgeschritten','Advanced'],['صعب','Schwer','Hard'],['إتقان','Meister','Mastery']];
 const n=names[level-1];
 return {level,icon:['🌱','🌿','🔥','⚡','🏆'][level-1],ar:n[0],de:n[1],en:n[2]};
}
export function difficultyLabel(d:DifficultyProfile,language:string){return language==='ar'?d.ar:language==='de'?d.de:d.en;}
