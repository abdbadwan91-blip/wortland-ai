export interface ComboReward { xp:number; bonus:number; multiplier:number; label:string; }
export function comboReward(streak:number,base=5):ComboReward{
 const safe=Math.max(1,streak);
 const multiplier=safe>=7?2:safe>=5?1.6:safe>=3?1.3:1;
 const xp=Math.round(base*multiplier);
 return {xp,bonus:xp-base,multiplier,label:safe>=7?'LEGEND':safe>=5?'HOT':safe>=3?'COMBO':''};
}
export function comboText(streak:number,language:string){
 if(streak<3)return '';
 if(language==='ar')return 'سلسلة '+streak+' 🔥';
 if(language==='de')return streak+'er Serie 🔥';
 return streak+' streak 🔥';
}
export function accuracyPercent(correct:number,answered:number){return answered<=0?0:Math.round((correct/answered)*100);}
export function performanceBadge(accuracy:number){
 if(accuracy===100)return {icon:'💎',key:'perfect'};
 if(accuracy>=90)return {icon:'🏆',key:'excellent'};
 if(accuracy>=75)return {icon:'⭐',key:'strong'};
 return {icon:'🌱',key:'practice'};
}
