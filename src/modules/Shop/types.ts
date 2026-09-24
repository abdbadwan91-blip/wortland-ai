export type ShopCategory = 'avatar' | 'frame' | 'badge' | 'sticker' | 'trail';
export type ShopRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface ShopItem {
  id: string;
  category: ShopCategory;
  rarity: ShopRarity;
  price: number;
  /** Path under public/, resolved via assetUrl */
  image: string;
  nameKey: string;
  descKey: string;
}

export interface ShopState {
  owned: string[];
  equipped: Partial<Record<ShopCategory, string>>;
}

export const SHOP_STORAGE_KEY = 'wortland.shop.v1';

export const RARITY_ORDER: ShopRarity[] = ['common', 'rare', 'epic', 'legendary'];

export const RARITY_COLORS: Record<ShopRarity, string> = {
  common: '#94a3b8',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};
