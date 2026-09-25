import type { SkillFocus } from './learningObjective';
export interface SkillMix { primary:SkillFocus; secondary:SkillFocus; icon:string; }
const SKILLS:SkillFocus[]=['vocabulary','listening','grammar','sentence','conversation','review'];
export function skillMix(stage:number,boss:boolean):SkillMix{
 const i=(Math.max(1,stage)-1)%SKILLS.length;
 return {primary:boss?'review':SKILLS[i],secondary:boss?'conversation':SKILLS[(i+2)%SKILLS.length],icon:boss?'👑':'🔀'};
}
