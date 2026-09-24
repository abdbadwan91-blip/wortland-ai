/**
 * Family Challenge — local-only MVP.
 *
 * Persists to localStorage (`wortland.family.v1`). Invite codes are generated
 * client-side; joining a code on the same device merges/updates the self
 * member only. Cross-device / multi-device sync needs a backend — planned later.
 */

export const FAMILY_STORAGE_KEY = 'wortland.family.v1';

export interface FamilyMember {
  id: string;
  name: string;
  xp: number;
  /** True for the local player (profile). */
  isSelf?: boolean;
}

export interface FamilyState {
  code: string;
  name: string;
  members: FamilyMember[];
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateInviteCode(length = 6): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

/** Accepts 6 alphanumerics; ignores dashes/spaces; case-insensitive. */
export function normalizeInviteCode(raw: string): string {
  return raw.replace(/[\s\-]/g, '').toUpperCase();
}

export function isValidInviteCode(raw: string): boolean {
  const code = normalizeInviteCode(raw);
  return /^[A-Z0-9]{6}$/.test(code);
}

function fakeCompanions(seedXp: number): FamilyMember[] {
  return [
    { id: 'fake-maya', name: 'Maya', xp: Math.max(40, seedXp - 80) },
    { id: 'fake-leo', name: 'Leo', xp: Math.max(20, seedXp - 140) },
    { id: 'fake-sara', name: 'Sara', xp: Math.max(10, Math.floor(seedXp / 2)) },
  ];
}

export function loadFamily(): FamilyState | null {
  try {
    const raw = localStorage.getItem(FAMILY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FamilyState;
    if (!parsed?.code || !Array.isArray(parsed.members)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveFamily(state: FamilyState): void {
  localStorage.setItem(FAMILY_STORAGE_KEY, JSON.stringify(state));
}

export function clearFamily(): void {
  localStorage.removeItem(FAMILY_STORAGE_KEY);
}

export function createFamily(opts: {
  familyName: string;
  selfName: string;
  selfXp: number;
}): FamilyState {
  const self: FamilyMember = {
    id: 'self',
    name: opts.selfName.trim() || 'You',
    xp: Math.max(0, opts.selfXp),
    isSelf: true,
  };
  const state: FamilyState = {
    code: generateInviteCode(),
    name: opts.familyName.trim() || 'Our Family',
    members: [self, ...fakeCompanions(opts.selfXp)],
  };
  saveFamily(state);
  return state;
}

/**
 * MVP join: validates code format. On the same device, if a family with that
 * code already exists we refresh the self member; otherwise we create a local
 * family under that code (demo companions). Real multi-player sync is later.
 */
export function joinFamily(opts: {
  code: string;
  selfName: string;
  selfXp: number;
}): { ok: true; state: FamilyState } | { ok: false; reason: 'invalid' } {
  if (!isValidInviteCode(opts.code)) {
    return { ok: false, reason: 'invalid' };
  }
  const code = normalizeInviteCode(opts.code);
  const existing = loadFamily();
  const self: FamilyMember = {
    id: 'self',
    name: opts.selfName.trim() || 'You',
    xp: Math.max(0, opts.selfXp),
    isSelf: true,
  };

  if (existing && normalizeInviteCode(existing.code) === code) {
    const others = existing.members.filter((m) => !m.isSelf && m.id !== 'self');
    const state: FamilyState = {
      ...existing,
      code,
      members: [self, ...others],
    };
    saveFamily(state);
    return { ok: true, state };
  }

  const state: FamilyState = {
    code,
    name: 'Family',
    members: [self, ...fakeCompanions(opts.selfXp)],
  };
  saveFamily(state);
  return { ok: true, state };
}

export function leaveFamily(): void {
  clearFamily();
}

export function sortedMembers(state: FamilyState): FamilyMember[] {
  return [...state.members].sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name));
}

/** Keep local self XP in sync with the profile when viewing the family. */
export function syncSelfXp(selfName: string, selfXp: number): FamilyState | null {
  const existing = loadFamily();
  if (!existing) return null;
  const members = existing.members.map((m) =>
    m.isSelf || m.id === 'self'
      ? { ...m, id: 'self', isSelf: true, name: selfName.trim() || m.name, xp: Math.max(0, selfXp) }
      : m,
  );
  const state = { ...existing, members };
  saveFamily(state);
  return state;
}
