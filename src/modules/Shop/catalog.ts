import type { ShopItem } from './types';

/** ~21 cosmetic items — coins from play only, no real money. */
export const SHOP_CATALOG: ShopItem[] = [
  // Avatars
  { id: 'av_fox_knight', category: 'avatar', rarity: 'common', price: 60, image: 'ui/shop/av_fox_knight.png', nameKey: 'shop.av_fox_knight', descKey: 'shop.av_fox_knight.desc' },
  { id: 'av_panda_chef', category: 'avatar', rarity: 'common', price: 80, image: 'ui/shop/av_panda_chef.png', nameKey: 'shop.av_panda_chef', descKey: 'shop.av_panda_chef.desc' },
  { id: 'av_owl_sage', category: 'avatar', rarity: 'rare', price: 180, image: 'ui/shop/av_owl_sage.png', nameKey: 'shop.av_owl_sage', descKey: 'shop.av_owl_sage.desc' },
  { id: 'av_robot_buddy', category: 'avatar', rarity: 'rare', price: 220, image: 'ui/shop/av_robot_buddy.png', nameKey: 'shop.av_robot_buddy', descKey: 'shop.av_robot_buddy.desc' },
  { id: 'av_dragon_cub', category: 'avatar', rarity: 'epic', price: 450, image: 'ui/shop/av_dragon_cub.png', nameKey: 'shop.av_dragon_cub', descKey: 'shop.av_dragon_cub.desc' },
  { id: 'av_star_fairy', category: 'avatar', rarity: 'legendary', price: 1200, image: 'ui/shop/av_star_fairy.png', nameKey: 'shop.av_star_fairy', descKey: 'shop.av_star_fairy.desc' },

  // Frames
  { id: 'fr_leaf', category: 'frame', rarity: 'common', price: 50, image: 'ui/shop/fr_leaf.png', nameKey: 'shop.fr_leaf', descKey: 'shop.fr_leaf.desc' },
  { id: 'fr_sunrise', category: 'frame', rarity: 'common', price: 70, image: 'ui/shop/fr_sunrise.png', nameKey: 'shop.fr_sunrise', descKey: 'shop.fr_sunrise.desc' },
  { id: 'fr_crystal', category: 'frame', rarity: 'rare', price: 160, image: 'ui/shop/fr_crystal.png', nameKey: 'shop.fr_crystal', descKey: 'shop.fr_crystal.desc' },
  { id: 'fr_golden', category: 'frame', rarity: 'epic', price: 380, image: 'ui/shop/fr_golden.png', nameKey: 'shop.fr_golden', descKey: 'shop.fr_golden.desc' },
  { id: 'fr_aurora', category: 'frame', rarity: 'legendary', price: 1000, image: 'ui/shop/fr_aurora.png', nameKey: 'shop.fr_aurora', descKey: 'shop.fr_aurora.desc' },

  // Badges / titles
  { id: 'bd_spark', category: 'badge', rarity: 'common', price: 50, image: 'ui/shop/bd_spark.png', nameKey: 'shop.bd_spark', descKey: 'shop.bd_spark.desc' },
  { id: 'bd_explorer', category: 'badge', rarity: 'rare', price: 150, image: 'ui/shop/bd_explorer.png', nameKey: 'shop.bd_explorer', descKey: 'shop.bd_explorer.desc' },
  { id: 'bd_champion', category: 'badge', rarity: 'epic', price: 400, image: 'ui/shop/bd_champion.png', nameKey: 'shop.bd_champion', descKey: 'shop.bd_champion.desc' },
  { id: 'bd_legend', category: 'badge', rarity: 'legendary', price: 1100, image: 'ui/shop/bd_legend.png', nameKey: 'shop.bd_legend', descKey: 'shop.bd_legend.desc' },

  // Stickers
  { id: 'st_yay', category: 'sticker', rarity: 'common', price: 40, image: 'ui/shop/st_yay.png', nameKey: 'shop.st_yay', descKey: 'shop.st_yay.desc' },
  { id: 'st_wow', category: 'sticker', rarity: 'common', price: 55, image: 'ui/shop/st_wow.png', nameKey: 'shop.st_wow', descKey: 'shop.st_wow.desc' },
  { id: 'st_fire', category: 'sticker', rarity: 'rare', price: 140, image: 'ui/shop/st_fire.png', nameKey: 'shop.st_fire', descKey: 'shop.st_fire.desc' },
  { id: 'st_hearts', category: 'sticker', rarity: 'epic', price: 320, image: 'ui/shop/st_hearts.png', nameKey: 'shop.st_hearts', descKey: 'shop.st_hearts.desc' },

  // Trail / falcon skin
  { id: 'tr_golden_path', category: 'trail', rarity: 'rare', price: 200, image: 'ui/shop/tr_golden_path.png', nameKey: 'shop.tr_golden_path', descKey: 'shop.tr_golden_path.desc' },
  { id: 'tr_falcon_glow', category: 'trail', rarity: 'epic', price: 500, image: 'ui/shop/tr_falcon_glow.png', nameKey: 'shop.tr_falcon_glow', descKey: 'shop.tr_falcon_glow.desc' },
];

export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_CATALOG.find((i) => i.id === id);
}

export function itemsByCategory(cat: ShopItem['category']): ShopItem[] {
  return SHOP_CATALOG.filter((i) => i.category === cat);
}
