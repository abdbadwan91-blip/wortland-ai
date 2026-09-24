import { useMemo, useState } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import { cefrColor, levelToCefr, type CefrBand } from '../modules/Content/cefr';
import styles from './LevelWheelScreen.module.css';

const LEVELS = Array.from({ length: 20 }, (_, i) => i + 1);
const LEGEND: CefrBand[] = ['starter', 'a1', 'a2', 'b1', 'b2', 'c1'];

export function LevelWheelScreen() {
  const { t, setScreen, selectedLevel, setSelectedLevel } = useApp();
  const [level, setLevel] = useState(selectedLevel || 1);
  const [snapKey, setSnapKey] = useState(0);
  const cefr = levelToCefr(level);
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const r = 108;

  const nodes = useMemo(
    () =>
      LEVELS.map((n) => {
        const angle = ((n - 1) / 20) * Math.PI * 2 - Math.PI / 2;
        return {
          n,
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle),
          band: levelToCefr(n),
        };
      }),
    [cx, cy, r],
  );

  const pick = (n: number) => {
    setLevel(n);
    setSnapKey((k) => k + 1);
  };

  return (
    <div className="screen fade-in">
      <button type="button" className="back-chip" onClick={() => setScreen('home')}>
        ← {t('wheel.back')}
      </button>
      <h1 className="screen-title">{t('wheel.title')}</h1>
      <p className="screen-sub">{t('wheel.subtitle')}</p>
      <p className="screen-sub" style={{ opacity: 0.85, fontSize: '0.85rem' }}>
        {t('wheel.difficulty.hint')}
      </p>

      <div className={styles.dialWrap}>
        <svg className={styles.dial} viewBox={`0 0 ${size} ${size}`} role="listbox" aria-label={t('wheel.subtitle')}>
          <circle cx={cx} cy={cy} r={r + 18} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          {nodes.map(({ n, x, y, band }) => {
            const on = n === level;
            return (
              <g key={n} onClick={() => pick(n)} style={{ cursor: 'pointer' }}>
                <circle
                  cx={x}
                  cy={y}
                  r={on ? 18 : 14}
                  fill={on ? cefrColor(band) : 'var(--surface-2)'}
                  stroke={cefrColor(band)}
                  strokeWidth={on ? 3 : 2}
                />
                <text
                  x={x}
                  y={y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={on ? '#0f172a' : '#e2e8f0'}
                  fontSize={on ? 13 : 11}
                  fontWeight={800}
                  style={{ pointerEvents: 'none' }}
                >
                  {n}
                </text>
              </g>
            );
          })}
        </svg>
        <div key={snapKey} className={styles.center} style={{ borderColor: cefrColor(cefr) }}>
          <strong className={styles.big}>{level}</strong>
          <span className={styles.band} style={{ color: cefrColor(cefr) }}>
            {cefr === 'starter' ? 'Pre-A1' : cefr.toUpperCase()}
          </span>
          <small>{t('wheel.medium')}</small>
        </div>
      </div>

      <button
        type="button"
        className={`${styles.inlineConfirm} btn-blue`}
        onClick={() => {
          setSelectedLevel(level);
          setScreen('topicPicker');
        }}
        data-confirm-level={level}
      >
        {t('wheel.confirm')} · {level}
      </button>

      <div className={styles.legend}>
        {LEGEND.map((b) => (
          <span key={b} className={styles.legItem}>
            <i style={{ background: cefrColor(b) }} />
            {t(`wheel.legend.${b}`)}
          </span>
        ))}
      </div>
    </div>
  );
}
