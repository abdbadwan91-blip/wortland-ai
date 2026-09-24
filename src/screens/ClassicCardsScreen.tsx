import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import { buildDeck } from '../modules/FlashArena/classicCards';
import { speakGerman, stopSpeech, warmSpeechVoices } from '../modules/Audio/speech';
import { SpeechSpeedChip } from '../components/SpeechSpeedChip';
import { translationFor } from '../modules/Content/types';
import styles from './ClassicCardsScreen.module.css';

interface Props {
  onFinish: (seen: number, sessionXp: number) => void;
}

export function ClassicCardsScreen({ onFinish }: Props) {
  const { t, setScreen, selectedTopic, profile } = useApp();
  const deck = useMemo(() => buildDeck(selectedTopic), [selectedTopic]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const card = deck[index];
  const total = deck.length;
  const glossLang = profile.translationLanguage || profile.appLanguage || 'en';

  const play = useCallback(
    (rate: 'normal' | 'slow' = 'normal') => {
      if (!card) return;
      const text = flipped
        ? `${card.article} ${card.lemma}`
        : card.lemma;
      setSpeaking(true);
      speakGerman(text, rate);
      window.setTimeout(() => setSpeaking(false), rate === 'slow' ? 1800 : 1100);
    },
    [card, flipped],
  );

  useEffect(() => {
    warmSpeechVoices();
    return () => stopSpeech();
  }, []);

  useEffect(() => {
    setFlipped(false);
    setImageError(false);
    const timer = window.setTimeout(() => {
      if (!card) return;
      setSpeaking(true);
      speakGerman(card.lemma, 'normal');
      window.setTimeout(() => setSpeaking(false), 1100);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [index, card]);

  const goPrev = () => {
    if (index <= 0) return;
    stopSpeech();
    setIndex((i) => i - 1);
  };

  const goNext = (markKnown: boolean) => {
    stopSpeech();
    let nextKnown = known;
    let nextXp = sessionXp;
    if (markKnown) {
      nextKnown = known + 1;
      nextXp = sessionXp + 3;
      setKnown(nextKnown);
      setSessionXp(nextXp);
    }
    if (index + 1 >= total) {
      onFinish(nextKnown, nextXp);
    } else {
      setIndex((i) => i + 1);
    }
  };

  if (!card) return null;

  const pct = (index / total) * 100;
  const showUrl = card.imageKind === 'url' && !imageError;
  const plural = card.plural ?? '—';
  const example = card.example ?? '';
  const gloss = translationFor(card, glossLang);

  return (
    <div className={`screen fade-in ${styles.wrap}`} data-classic-cards>
      <div className={styles.topBar}>
        
        <SpeechSpeedChip />
<button
          type="button"
          className="back-chip"
          onClick={() => {
            stopSpeech();
            setScreen('gameModes');
          }}
        >
          ← {t('cc.back')}
        </button>
        <span className={styles.xpChip} dir="ltr">⭐ +{sessionXp}</span>
      </div>

      <div className={styles.progress}>
        <span className={styles.progressLabel}>
          {t('cc.progress', { current: index + 1, total })}
        </span>
        <div className={styles.track} aria-hidden>
          <div className={styles.fill} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <button
        type="button"
        className={`${styles.flipScene} ${flipped ? styles.flipped : ''}`}
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? t('cc.flipBack') : t('cc.tapFlip')}
        data-flip-card
        data-flipped={flipped ? '1' : '0'}
      >
        <div className={styles.flipInner}>
          <div className={styles.faceFront}>
            <p className={styles.hint}>{t('cc.frontHint')}</p>
            <div className={styles.imageFrame}>
              {showUrl ? (
                <img
                  className={styles.image}
                  src={card.image}
                  alt=""
                  onError={() => setImageError(true)}
                  data-card-image
                />
              ) : (
                <span className={styles.imageFallback} aria-hidden>🃏</span>
              )}
            </div>
            <p className={styles.tapHint}>{t('cc.tapFlip')}</p>
          </div>

          <div className={styles.faceBack}>
            <p className={styles.articleLemma} dir="ltr" lang="de">
              <span className={styles.article}>{card.article}</span>{' '}
              <span className={styles.lemma}>{card.lemma}</span>
            </p>
            <dl className={styles.meta}>
              <div>
                <dt>{t('cc.plural')}</dt>
                <dd dir="ltr" lang="de">{plural}</dd>
              </div>
              <div>
                <dt>{t('cc.translation')}</dt>
                <dd>{gloss}</dd>
              </div>
              {example ? (
                <div className={styles.exampleRow}>
                  <dt>{t('cc.example')}</dt>
                  <dd dir="ltr" lang="de">{example}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>
      </button>

      <div className={styles.audioRow}>
        <button
          type="button"
          className={`${styles.speaker} ${speaking ? styles.pulse : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            play('normal');
          }}
          aria-label={t('cc.speak')}
          data-speak
        >
          🔊
        </button>
        <button
          type="button"
          className={styles.slowBtn}
          onClick={(e) => {
            e.stopPropagation();
            play('slow');
          }}
          aria-label={t('cc.slow')}
          title={t('cc.slow')}
          data-slow
        >
          🐢
        </button>
      </div>

      <div className={styles.nav}>
        <button
          type="button"
          className={styles.navBtn}
          onClick={goPrev}
          disabled={index === 0}
          data-prev
        >
          {t('cc.prev')}
        </button>
        <button
          type="button"
          className={`${styles.navBtn} ${styles.knownBtn}`}
          onClick={() => goNext(true)}
          data-known
        >
          {index + 1 >= total ? t('cc.done') : t('cc.known')}
        </button>
        <button
          type="button"
          className={styles.navBtn}
          onClick={() => goNext(false)}
          data-next
        >
          {index + 1 >= total ? t('cc.done') : t('cc.next')}
        </button>
      </div>
    </div>
  );
}
