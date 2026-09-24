import { SHOP_CATALOG, getShopItem } from './catalog';
import {
  SHOP_STORAGE_KEY,
  type ShopCategory,
  type ShopState,
} from './types';

function emptyState(): ShopState {
  return { owned: [], equipped: {} };
}

export function loadShop(): ShopState {
  try {
    const raw = localStorage.getItem(SHOP_STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<ShopState>;
    const owned = Array.isArray(parsed.owned)
      ? parsed.owned.filter((id) => typeof id === 'string' && getShopItem(id))
      : [];
    const equipped: ShopState['equipped'] = {};
    const eq = parsed.equipped || {};
    (['avatar', 'frame', 'badge', 'sticker', 'trail'] as ShopCategory[]).forEach((cat) => {
      const id = eq[cat];
      if (id && owned.includes(id) && getShopItem(id)?.category === cat) {
        equipped[cat] = id;
      }
    });
    return { owned, equipped };
  } catch {
    return emptyState();
  }
}

export function saveShop(state: ShopState): void {
  localStorage.setItem(SHOP_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('wortland:shop'));
}

export function clearShop(): void {
  localStorage.removeItem(SHOP_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('wortland:shop'));
}

export function isOwned(id: string, state = loadShop()): boolean {
  return state.owned.includes(id);
}

export function isEquipped(id: string, state = loadShop()): boolean {
  return Object.values(state.equipped).includes(id);
}

export type BuyResult =
  | { ok: true; state: ShopState; coinsLeft: number }
  | { ok: false; reason: 'owned' | 'funds' | 'missing'; need?: number };

export function buyItem(id: string, coins: number, state = loadShop()): BuyResult {
  const item = getShopItem(id);
  if (!item) return { ok: false, reason: 'missing' };
  if (state.owned.includes(id)) return { ok: false, reason: 'owned' };
  if (coins < item.price) {
    return { ok: false, reason: 'funds', need: item.price - coins };
  }
  const next: ShopState = {
    owned: [...state.owned, id],
    equipped: { ...state.equipped, [item.category]: id },
  };
  saveShop(next);
  return { ok: true, state: next, coinsLeft: coins - item.price };
}

export function equipItem(id: string, state = loadShop()): ShopState {
  const item = getShopItem(id);
  if (!item || !state.owned.includes(id)) return state;
  const next: ShopState = {
    owned: state.owned,
    equipped: { ...state.equipped, [item.category]: id },
  };
  saveShop(next);
  return next;
}

export function unequipCategory(cat: ShopCategory, state = loadShop()): ShopState {
  const equipped = { ...state.equipped };
  delete equipped[cat];
  const next = { owned: state.owned, equipped };
  saveShop(next);
  return next;
}

export function getEquippedItem(cat: ShopCategory, state = loadShop()) {
  const id = state.equipped[cat];
  return id ? getShopItem(id) : undefined;
}

export function shopStats() {
  return {
    total: SHOP_CATALOG.length,
    byCategory: SHOP_CATALOG.reduce<Record<string, number>>((acc, i) => {
      acc[i.category] = (acc[i.category] || 0) + 1;
      return acc;
    }, {}),
    minPrice: Math.min(...SHOP_CATALOG.map((i) => i.price)),
    maxPrice: Math.max(...SHOP_CATALOG.map((i) => i.price)),
  };
}
