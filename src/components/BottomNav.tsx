import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { useApp, type Screen } from '../modules/Auth/AppContext';
import styles from './BottomNav.module.css';

const ITEMS: { id: Screen; iconSrc: string; key: string }[] = [
  { id: 'home', iconSrc: `${import.meta.env.BASE_URL}ui/nav/nav-home.png`, key: 'nav.home' },
  { id: 'learn', iconSrc: `${import.meta.env.BASE_URL}ui/nav/nav-learn.png`, key: 'nav.learn' },
  { id: 'games', iconSrc: `${import.meta.env.BASE_URL}ui/nav/nav-games.png`, key: 'nav.games' },
  { id: 'progress', iconSrc: `${import.meta.env.BASE_URL}ui/nav/nav-progress.png`, key: 'nav.progress' },
  { id: 'profile', iconSrc: `${import.meta.env.BASE_URL}ui/nav/nav-profile.png`, key: 'nav.profile' },
];

/**
 * Main tab bar — portaled to document.body with position:fixed so it stays
 * pinned to the viewport bottom even when .app-frame / .screen scroll.
 */
export function BottomNav() {
  const { t, screen, setScreen } = useApp();
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setHost(document.body);
  }, []);

  const active = (['home', 'learn', 'games', 'progress', 'profile'] as Screen[]).includes(screen)
    ? screen
    : 'home';

  const nav = (
    <nav className={styles.nav} aria-label="Main" data-bottom-nav>
      {ITEMS.map((item) => {
        const on = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            className={`${styles.item} ${on ? styles.on : ''}`}
            onClick={() => setScreen(item.id)}
            aria-current={on ? 'page' : undefined}
            data-nav={item.id}
          >
            <span className={styles.icon} aria-hidden>
              <img src={item.iconSrc} alt="" width={30} height={30} />
            </span>
            <span className={styles.label}>{t(item.key)}</span>
          </button>
        );
      })}
    </nav>
  );

  if (!host) return null;
  return createPortal(nav, host);
}
