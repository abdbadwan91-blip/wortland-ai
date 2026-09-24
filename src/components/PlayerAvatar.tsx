import { useEffect, useState } from 'react';
import { getAvatar } from '../data/avatars';
import { assetUrl } from '../modules/Content/assetUrl';
import {
  getEquippedItem,
  loadShop,
  type ShopState,
} from '../modules/Shop';
import styles from './PlayerAvatar.module.css';

interface Props {
  avatarId: string;
  size?: number;
  className?: string;
  showBadge?: boolean;
  showSticker?: boolean;
}

export function PlayerAvatar({
  avatarId,
  size = 52,
  className = '',
  showBadge = false,
  showSticker = false,
}: Props) {
  const [shop, setShop] = useState<ShopState>(() => loadShop());
  useEffect(() => {
    const sync = () => setShop(loadShop());
    window.addEventListener('wortland:shop', sync);
    return () => window.removeEventListener('wortland:shop', sync);
  }, []);

  const base = getAvatar(avatarId);
  const shopAvatar = getEquippedItem('avatar', shop);
  const frame = getEquippedItem('frame', shop);
  const badge = getEquippedItem('badge', shop);
  const sticker = getEquippedItem('sticker', shop);
  const rarity = shopAvatar?.rarity || frame?.rarity || 'common';

  return (
    <div
      className={`${styles.wrap} ${styles[rarity]} ${className}`}
      style={{ width: size, height: size }}
      data-player-avatar
    >
      <div
        className={styles.face}
        style={{ background: shopAvatar ? 'transparent' : base?.bg || '#334155' }}
      >
        {shopAvatar ? (
          <img src={assetUrl(shopAvatar.image)} alt="" draggable={false} />
        ) : (
          <span aria-hidden>{base?.emoji || '🧒'}</span>
        )}
      </div>
      {frame && (
        <img className={styles.frame} src={assetUrl(frame.image)} alt="" draggable={false} />
      )}
      {showBadge && badge && (
        <img className={styles.badge} src={assetUrl(badge.image)} alt="" draggable={false} />
      )}
      {showSticker && sticker && (
        <img className={styles.sticker} src={assetUrl(sticker.image)} alt="" draggable={false} />
      )}
    </div>
  );
}

export function useEquippedTitleKey(): string | undefined {
  const [id, setId] = useState(() => loadShop().equipped.badge);
  useEffect(() => {
    const sync = () => setId(loadShop().equipped.badge);
    window.addEventListener('wortland:shop', sync);
    return () => window.removeEventListener('wortland:shop', sync);
  }, []);
  return id ? `shop.${id}` : undefined;
}
