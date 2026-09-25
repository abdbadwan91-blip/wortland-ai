export interface WorldOneReward { xp:number; coins:number; gems:number; chest:boolean; }
export function worldOneReward(stage:number):WorldOneReward{
 if(stage===4)return {xp:150,coins:100,gems:1,chest:true};
 return {xp:40+stage*10,coins:15+stage*5,gems:0,chest:false};
}
export function worldOneProgress(stage:number){return Math.max(0,Math.min(100,Math.round(((stage-1)/4)*100)));}
