export interface MasteryTarget { correct:number; accuracy:number; streak:number; }
export function masteryTarget(stage:number,boss:boolean):MasteryTarget{
 const tier=Math.floor((Math.max(1,stage)-1)/4);
 return {correct:boss?10:5+tier,accuracy:boss?80:70+Math.min(10,tier*2),streak:boss?5:2+Math.min(3,tier)};
}
export function masteryText(language:string,target:MasteryTarget){
 if(language==='ar') return `${target.correct} صحيحة · دقة ${target.accuracy}% · سلسلة ${target.streak}`;
 if(language==='de') return `${target.correct} richtig · ${target.accuracy}% Genauigkeit · ${target.streak} Serie`;
 return `${target.correct} correct · ${target.accuracy}% accuracy · ${target.streak} streak`;
}
