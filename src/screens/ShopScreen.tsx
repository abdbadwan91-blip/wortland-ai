import { useMemo, useState } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import { assetUrl } from '../modules/Content/assetUrl';
import {
  SHOP_CATALOG,
  RARITY_COLORS,
  buyItem,
  equipItem,
  isEquipped,
  isOwned,
  loadShop,
  type ShopCategory,
  type ShopItem,
  type ShopState,
} from '../modules/Shop';
import styles from './ShopScreen.module.css';

const TABS: ShopCategory[] = ['avatar', 'frame', 'badge', 'sticker', 'trail'];

export function ShopScreen() {
  const { t, profile, updateProfile, setScreen } = useApp();
  const [tab, setTab] = useState<ShopCategory>('avatar');
  const [shop, setShop] = useState<ShopState>(() => loadShop());
  const [confirm, setConfirm] = useState<ShopItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [shortfall, setShortfall] = useState<number | null>(null);

  const items = useMemo(
    () => SHOP_CATALOG.filter((i) => i.category === tab),
    [tab],
  );

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const onBuy = (item: ShopItem) => {
    const result = buyItem(item.id, profile.coins, shop);
    if (!result.ok) {
      if (result.reason === 'funds') {
        setShortfall(result.need ?? item.price - profile.coins);
        setConfirm(null);
        return;
      }
      flash(t('shop.alreadyOwned'));
      setConfirm(null);
      return;
    }
    updateProfile({ coins: result.coinsLeft });
    setShop(result.state);
    setConfirm(null);
    setShortfall(null);
    setCelebrate(true);
    window.setTimeout(() => setCelebrate(false), 1400);
    flash(t('shop.purchased', { name: t(item.nameKey) }));
  };

  const onEquip = (item: ShopItem) => {
    setShop(equipItem(item.id, shop));
    flash(t('shop.equipped', { name: t(item.nameKey) }));
  };

  return (
    <div className={`screen fade-in ${styles.page}`} data-shop>
      <header className={styles.head}>
        <button type="button" className="back-chip" onClick={() => setScreen('home')}>
          ← {t('shop.back')}
        </button>
        <div className={styles.titleRow}>
          <div>
            <p className={styles.kicker}>{t('shop.kicker')}</p>
            <h1 className={styles.title}>{t('shop.title')}</h1>
          </div>
          <div className={styles.coins} dir="ltr">
            🪙 {profile.coins}
          </div>
        </div>
        <p className={styles.sub}>{t('shop.subtitle')}</p>
        <p className={styles.safe}>{t('shop.noRealMoney')}</p>
      </header>

      <div className={styles.tabs} role="tablist">
        {TABS.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={tab === cat}
            className={`${styles.tab} ${tab === cat ? styles.tabOn : ''}`}
            onClick={() => setTab(cat)}
            data-shop-tab={cat}
          >
            {t(`shop.cat.${cat}`)}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {items.map((item) => {
          const owned = isOwned(item.id, shop);
          const equipped = isEquipped(item.id, shop);
          return (
            <button
              key={item.id}
              type="button"
              className={[
                styles.card,
                item.rarity === 'legendary' ? styles.legendary : '',
                item.rarity === 'epic' ? styles.epic : '',
                equipped ? styles.equipped : '',
              ].filter(Boolean).join(' ')}
              style={{ ['--rarity' as string]: RARITY_COLORS[item.rarity] }}
              onClick={() => {
                setShortfall(null);
                if (owned) onEquip(item);
                else setConfirm(item);
              }}
              data-shop-item={item.id}
              data-owned={owned ? '1' : '0'}
              data-equipped={equipped ? '1' : '0'}
            >
              <div className={styles.art}>
                <img src={assetUrl(item.image)} alt="" draggable={false} />
              </div>
              <div className={styles.meta}>
                <span className={styles.rarity}>{t(`shop.rarity.${item.rarity}`)}</span>
                <strong>{t(item.nameKey)}</strong>
                <span className={styles.desc}>{t(item.descKey)}</span>
              </div>
              <div className={styles.footer}>
                {owned ? (
                  <span className={styles.owned}>
                    {equipped ? t('shop.equippedLabel') : t('shop.ownTapEquip')}
                  </span>
                ) : (
                  <span className={styles.price} dir="ltr">🪙 {item.price}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {confirm && (
        <div className={styles.modal} role="dialog" aria-modal="true" data-shop-confirm>
          <div className={styles.modalCard}>
            <img src={assetUrl(confirm.image)} alt="" className={styles.modalArt} />
            <h2>{t('shop.confirmTitle')}</h2>
            <p>{t('shop.confirmBody', { name: t(confirm.nameKey), n: confirm.price })}</p>
            <div className={styles.modalActions}>
              <button type="button" className="btn-ghost" onClick={() => setConfirm(null)}>
                {t('shop.cancel')}
              </button>
              <button type="button" className="btn-primary" onClick={() => onBuy(confirm)} data-shop-buy>
                {t('shop.buy')}
              </button>
            </div>
          </div>
        </div>
      )}

      {shortfall != null && (
        <div className={styles.modal} role="dialog" aria-modal="true" data-shop-short>
          <div className={styles.modalCard}>
            <div className={styles.shortIcon} aria-hidden>🪙</div>
            <h2>{t('shop.notEnoughTitle')}</h2>
            <p>{t('shop.notEnoughBody', { n: shortfall })}</p>
            <button type="button" className="btn-primary" onClick={() => setShortfall(null)}>
              {t('shop.ok')}
            </button>
          </div>
        </div>
      )}

      {celebrate && <div className={styles.celebrate} aria-hidden>✨🎉✨</div>}
      {toast && <div className={styles.toast} role="status">{toast}</div>}
    </div>
  );
}
