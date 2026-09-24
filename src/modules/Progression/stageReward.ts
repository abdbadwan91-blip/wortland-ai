export interface StageReward { xp:number; coins:number; bonusXp:number; crown:boolean; }
export function stageReward(stage:number,boss:boolean):StageReward{
 const tier=Math.floor((Math.max(1,stage)-1)/4);
 const xp=(boss?100:35)+tier*15;
 return {xp,coins:(boss?25:8)+tier*3,bonusXp:boss?50:15+tier*5,crown:boss};
}
export function rewardHint(language:string,boss:boolean){
 if(language==='ar') return boss?'مكافأة الزعيم + فتح العالم التالي':'أكمل المهمة لتحصل على المكافأة';
 if(language==='de') return boss?'Boss-Belohnung + nächste Welt':'Mission abschließen und Belohnung erhalten';
 return boss?'Boss reward + next world unlock':'Complete the mission to earn the reward';
}
