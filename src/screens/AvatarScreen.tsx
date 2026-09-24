import { useMemo, useState } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import { AVATARS, type AvatarCategory } from '../data/avatars';
import styles from './AvatarScreen.module.css';
import { OnboardingProgress } from '../components/OnboardingProgress';

const CATS: AvatarCategory[] = [
  'kids', 'animals', 'robot', 'astronaut', 'adventure', 'fantasy',
];

export function AvatarScreen() {
  const { t, updateProfile, setScreen, profile, dir } = useApp();
  const [selected, setSelected] = useState(profile.avatarId || '');
  const [filter, setFilter] = useState<AvatarCategory | 'all'>('all');

  const list = useMemo(
    () => (filter === 'all' ? AVATARS : AVATARS.filter((a) => a.category === filter)),
    [filter],
  );

  return (
    <div className="screen fade-in">
      <OnboardingProgress step={3} />
      <button type="button" className="back-chip" onClick={() => setScreen('name')}>
        <span aria-hidden>{dir === 'rtl' ? '→' : '←'}</span> {t('common.back')}
      </button>
      <h1 className="screen-title">{t('avatar.title')}</h1>
      <p className="screen-sub">{t('avatar.subtitle')}</p>

      <div className={styles.chips} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'all'}
          className={`${styles.chip} ${filter === 'all' ? styles.chipOn : ''}`}
          onClick={() => setFilter('all')}
        >
          {t('avatar.all')}
        </button>
        {CATS.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={filter === c}
            className={`${styles.chip} ${filter === c ? styles.chipOn : ''}`}
            onClick={() => setFilter(c)}
          >
            {t(`avatar.cat.${c}`)}
          </button>
        ))}
      </div>

      <div className={styles.grid} role="listbox" aria-label={t('avatar.title')}>
        {list.map((a) => {
          const on = selected === a.id;
          return (
            <button
              key={a.id}
              type="button"
              role="option"
              aria-selected={on}
              className={`${styles.cell} ${on ? styles.cellOn : ''}`}
              style={{ background: a.bg }}
              aria-label={t('avatar.choose', { avatar: a.emoji })}
              onClick={() => setSelected(a.id)}
            >
              <span className={styles.emoji}>{a.emoji}</span>
              {on && <span className={styles.tick} aria-hidden>✓</span>}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="btn-primary"
        disabled={!selected}
        onClick={() => {
          updateProfile({ avatarId: selected });
          setScreen('mode');
        }}
      >
        {t('avatar.continue')}
      </button>
    </div>
  );
}
