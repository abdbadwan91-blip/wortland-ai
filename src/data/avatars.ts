export type AvatarCategory =
  | 'kids' | 'animals' | 'robot' | 'astronaut' | 'adventure' | 'fantasy';

export interface Avatar {
  id: string;
  emoji: string;
  category: AvatarCategory;
  bg: string;
}

/** 30 original placeholder avatars — emoji only, no copyrighted IP */
export const AVATARS: Avatar[] = [
  // kids
  { id: 'k1', emoji: '🧒', category: 'kids', bg: '#FFE8A3' },
  { id: 'k2', emoji: '👧', category: 'kids', bg: '#FFD6E8' },
  { id: 'k3', emoji: '👦', category: 'kids', bg: '#C8E7FF' },
  { id: 'k4', emoji: '👶', category: 'kids', bg: '#E8FFD6' },
  { id: 'k5', emoji: '🧑', category: 'kids', bg: '#F0E6FF' },
  // animals
  { id: 'a1', emoji: '🦊', category: 'animals', bg: '#FFD4A8' },
  { id: 'a2', emoji: '🐼', category: 'animals', bg: '#E8E8E8' },
  { id: 'a3', emoji: '🦁', category: 'animals', bg: '#FFE5A0' },
  { id: 'a4', emoji: '🦉', category: 'animals', bg: '#D4C4A8' },
  { id: 'a5', emoji: '🐸', category: 'animals', bg: '#C8F0C8' },
  // robot
  { id: 'r1', emoji: '🤖', category: 'robot', bg: '#D0E8FF' },
  { id: 'r2', emoji: '👾', category: 'robot', bg: '#E0D0FF' },
  { id: 'r3', emoji: '🦾', category: 'robot', bg: '#C8D8E8' },
  { id: 'r4', emoji: '🛰️', category: 'robot', bg: '#B8D4F0' },
  { id: 'r5', emoji: '⚙️', category: 'robot', bg: '#D8D8E0' },
  // astronaut / space
  { id: 's1', emoji: '🚀', category: 'astronaut', bg: '#C8D0FF' },
  { id: 's2', emoji: '👨‍🚀', category: 'astronaut', bg: '#E0E8FF' },
  { id: 's3', emoji: '👩‍🚀', category: 'astronaut', bg: '#F0E0FF' },
  { id: 's4', emoji: '🪐', category: 'astronaut', bg: '#FFD8C8' },
  { id: 's5', emoji: '⭐', category: 'astronaut', bg: '#FFF0C0' },
  // adventure
  { id: 'v1', emoji: '🧭', category: 'adventure', bg: '#D4E8C8' },
  { id: 'v2', emoji: '🏕️', category: 'adventure', bg: '#E8F0C8' },
  { id: 'v3', emoji: '🗺️', category: 'adventure', bg: '#FFE8C0' },
  { id: 'v4', emoji: '🏔️', category: 'adventure', bg: '#D0E0F0' },
  { id: 'v5', emoji: '🎒', category: 'adventure', bg: '#F0D8C8' },
  // fantasy
  { id: 'f1', emoji: '🧙', category: 'fantasy', bg: '#E0D0F8' },
  { id: 'f2', emoji: '🐉', category: 'fantasy', bg: '#D0F0E0' },
  { id: 'f3', emoji: '🦄', category: 'fantasy', bg: '#FFD0F0' },
  { id: 'f4', emoji: '🧚', category: 'fantasy', bg: '#E8FFF0' },
  { id: 'f5', emoji: '🏰', category: 'fantasy', bg: '#F0E8D0' },
];

export function getAvatar(id: string): Avatar | undefined {
  return AVATARS.find((a) => a.id === id);
}
