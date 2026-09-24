import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import { BottomNav } from '../components/BottomNav';
import {
  createFamily,
  isValidInviteCode,
  joinFamily,
  leaveFamily,
  loadFamily,
  sortedMembers,
  syncSelfXp,
  type FamilyState,
} from '../modules/Family/store';
import styles from './FamilyScreen.module.css';

type View = 'empty' | 'create' | 'join' | 'board';

export function FamilyScreen() {
  const { t, profile, setScreen } = useApp();
  const [family, setFamily] = useState<FamilyState | null>(() => loadFamily());
  const [view, setView] = useState<View>(() => (loadFamily() ? 'board' : 'empty'));
  const [familyName, setFamilyName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const synced = syncSelfXp(profile.name || 'You', profile.xp);
    if (synced) {
      setFamily(synced);
      setView('board');
    }
  }, [profile.name, profile.xp]);

  const members = useMemo(
    () => (family ? sortedMembers(family) : []),
    [family],
  );

  const goEmpty = useCallback(() => {
    setFamily(null);
    setView('empty');
    setError(null);
    setFamilyName('');
    setJoinCode('');
  }, []);

  const handleCreate = () => {
    setError(null);
    const state = createFamily({
      familyName: familyName.trim() || t('family.defaultName'),
      selfName: profile.name || t('family.you'),
      selfXp: profile.xp,
    });
    setFamily(state);
    setView('board');
  };

  const handleJoin = () => {
    setError(null);
    if (!isValidInviteCode(joinCode)) {
      setError(t('family.error.code'));
      return;
    }
    const result = joinFamily({
      code: joinCode,
      selfName: profile.name || t('family.you'),
      selfXp: profile.xp,
    });
    if (!result.ok) {
      setError(t('family.error.code'));
      return;
    }
    setFamily(result.state);
    setView('board');
  };

  const handleLeave = () => {
    leaveFamily();
    goEmpty();
  };

  const handleCopy = async () => {
    if (!family?.code) return;
    try {
      await navigator.clipboard.writeText(family.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback: select via prompt for older webviews
      window.prompt(t('family.copyHint'), family.code);
    }
  };

  return (
    <div className={`screen with-nav fade-in ${styles.page}`} data-family-screen>
      <button
        type="button"
        className="back-chip"
        onClick={() => setScreen('home')}
        data-family-back
      >
        ← {t('common.back')}
      </button>

      <div className={styles.hero} aria-hidden>
        <span className={styles.heroEmoji}>👨‍👩‍👧</span>
      </div>

      <h1 className="screen-title">{t('family.title')}</h1>
      <p className="screen-sub">{t('family.subtitle')}</p>

      {view === 'empty' && (
        <section className={styles.card} data-family-empty>
          <div className={styles.emptyIllu} aria-hidden>
            🏠✨
          </div>
          <p className={styles.emptyText}>{t('family.empty')}</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setView('create')}
            data-family-goto-create
          >
            {t('family.create')}
          </button>
          <button
            type="button"
            className="btn-blue"
            onClick={() => setView('join')}
            data-family-goto-join
          >
            {t('family.join')}
          </button>
        </section>
      )}

      {view === 'create' && (
        <section className={styles.card} data-family-create>
          <label className={styles.label} htmlFor="family-name">
            {t('family.nameLabel')}
          </label>
          <input
            id="family-name"
            className="field"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            placeholder={t('family.namePlaceholder')}
            maxLength={32}
            autoComplete="off"
          />
          <button
            type="button"
            className="btn-primary"
            onClick={handleCreate}
            data-family-create
          >
            {t('family.createConfirm')}
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setView('empty')}
          >
            {t('common.back')}
          </button>
        </section>
      )}

      {view === 'join' && (
        <section className={styles.card} data-family-join>
          <label className={styles.label} htmlFor="family-code">
            {t('family.codeLabel')}
          </label>
          <input
            id="family-code"
            className={`field ${styles.codeInput}`}
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder={t('family.codePlaceholder')}
            maxLength={8}
            autoComplete="off"
            spellCheck={false}
            dir="ltr"
            inputMode="text"
          />
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <p className={styles.hint}>{t('family.joinHint')}</p>
          <button
            type="button"
            className="btn-primary"
            onClick={handleJoin}
            disabled={!joinCode.trim()}
            data-family-join
          >
            {t('family.joinConfirm')}
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setError(null);
              setView('empty');
            }}
          >
            {t('common.back')}
          </button>
        </section>
      )}

      {view === 'board' && family && (
        <section className={styles.board} data-family-board>
          <div className={styles.familyHead}>
            <div>
              <strong className={styles.familyName}>{family.name}</strong>
              <p className={styles.inviteRow}>
                <span className={styles.inviteLabel}>{t('family.invite')}</span>
                <code className={styles.code} dir="ltr" data-family-code>
                  {family.code}
                </code>
              </p>
            </div>
            <button
              type="button"
              className={styles.copyBtn}
              onClick={handleCopy}
              data-family-copy
            >
              {copied ? t('family.copied') : t('family.copy')}
            </button>
          </div>

          <h2 className={styles.sectionTitle}>{t('family.leaderboard')}</h2>
          <ol className={styles.list}>
            {members.map((m, i) => (
              <li
                key={m.id}
                className={`${styles.row} ${m.isSelf || m.id === 'self' ? styles.self : ''}`}
                data-member={m.id}
              >
                <span className={styles.rank} aria-hidden>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                </span>
                <span className={styles.memberName}>
                  {m.name}
                  {(m.isSelf || m.id === 'self') && (
                    <span className={styles.youPill}>{t('family.you')}</span>
                  )}
                </span>
                <span className={styles.xp} dir="ltr">
                  ⭐ {m.xp}
                </span>
              </li>
            ))}
          </ol>

          <button
            type="button"
            className={`btn-ghost ${styles.leaveBtn}`}
            onClick={handleLeave}
            data-family-leave
          >
            {t('family.leave')}
          </button>
        </section>
      )}

      <aside className={styles.privacy} data-family-privacy>
        <span aria-hidden>🔒</span>
        <p>{t('family.privacy')}</p>
      </aside>

      <p className={styles.mvpNote}>{t('family.mvpNote')}</p>

      <BottomNav />
    </div>
  );
}
