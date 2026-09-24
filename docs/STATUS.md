# WortLand AI — implementation status

This checklist describes the current code in `src/`. It is intentionally narrower than a product roadmap.

## Prototype foundation

- [x] Vite + React + TypeScript client-side web app.
- [x] Local onboarding: language, name, avatar, Junior/Standard mode, optional email, and profile persistence.
- [x] Arabic, English, and German interface translations.
- [x] German learning language (`de`).
- [x] Responsive quest map with 20 stages: Mountain 1–10 and Forest 1–10.
- [x] Level Wheel with levels 1–20 and CEFR-style bands from Starter/Pre-A1 through C1.

## Content and topics

`src/modules/Content/cefr.ts` currently declares 14 topics. `src/modules/Content/index.ts` provides a learning-object pool for each one; all are currently marked unlocked in `TOPICS`.

- [x] Tiere (Animals)
- [x] Essen (Food)
- [x] Zuhause (Home)
- [x] Schule (School)
- [x] Familie (Family)
- [x] Farben (Colours)
- [x] Kleidung (Clothing)
- [x] Körper (Body)
- [x] Wetter (Weather)
- [x] Transport
- [x] Gesundheit (Health)
- [x] Arbeit (Work)
- [x] Natur (Nature)
- [x] Zahlen (Numbers)

## Game modes

`GAME_MODE_DEFS` is the source of truth for minimum unlock levels. The current mode-to-screen routing is implemented in `GameModesScreen.tsx` and `GamesHubScreen.tsx`.

- [x] Level 1 — Classic Cards
- [x] Level 1 — Picture Match
- [x] Level 2 — Quick Pick
- [x] Level 3 — Article Pick
- [x] Level 4 — Memory Flip
- [x] Level 5 — Build It
- [x] Level 6 — Master Challenge
- [x] Level 7 — Listening Hunt
- [x] Level 8 — Speed Round / Word Race
- [x] Level 9 — Word Puzzle
- [x] Level 10 — Conversation Mission

The mode catalog has 11 entries. The Games Hub also renders Conversation Mission in a “coming soon” area and shows a separate Sentence Race future card; these are UI labels/cards, not additional entries in `GAME_MODE_DEFS`. Sentence Race has no current mode definition or arena route.

## Learning, rewards, and settings

- [x] German TTS: Web Speech API (`speechSynthesis`, de-DE) on the web; `@capacitor-community/text-to-speech` on native Android (same `speakGerman` helper, normal/slow rates).
- [x] Per-word mastery score and review scheduling, plus weak/due-word Smart Training.
- [x] XP, coins, streak display, daily practice heatmap, daily missions, badges, and titles in the implemented flows.
- [x] Speech, volume, reduced-motion, and high-contrast settings.
- [x] Local family board with generated invite code and demo companions.
- [ ] Cross-device family synchronization (requires a server).
- [ ] Human-recorded German audio.
- [x] Native Android app via Capacitor (debug APK published as GitHub Release `android-latest`).

## Persistence note

The app is currently local-first. Storage keys are defined in the modules that own them; the complete overview is in the root [`README.md`](../README.md#browser-storage). The local family implementation explicitly does not provide real multi-device multiplayer sync.

## Android app (Capacitor)

- [x] Capacitor 8 Android shell (`appId` `ai.wortland.app`, label **WortLand AI**, portrait, `versionCode` 1 / `versionName` 1.0.0).
- [x] App icons and splash generated from PWA brand assets (`assets/`, `@capacitor/assets`).
- [x] Native TTS plugin wired through `src/modules/Audio/speech.ts`; service worker skipped on native.
- [x] GitHub Actions workflow `.github/workflows/build-android.yml` builds `assembleDebug` and publishes `WortLand-AI.apk` to the prerelease tag `android-latest`.
- [x] GitHub Pages deploy (`.github/workflows/deploy-pages.yml` with `VITE_BASE=/wortland-ai/`) remains separate and unchanged in intent.

## 2026-03-26 — Coin Shop, icons, next challenge, nav fix

- **Coin Shop** (`shop` screen): 21 cosmetic items (avatars, frames, titles, stickers, trails) with rarities/prices; localStorage `wortland.shop.v1`; kid-safe (coins from play only).
- **Cosmetics** show on Home/Profile via `PlayerAvatar` (equipped avatar/frame/badge/sticker + title).
- **Mode & game icons**: custom illustrated PNGs under `public/ui/` replace emoji on Mode screen and game mode lists.
- **Next challenge**: results screens launch the next unlocked mode/level directly (retry if not passed).
- **Bottom nav**: portaled into `.app-frame` with `position:absolute; bottom:0` + safe-area; fade animation no longer keeps `transform` (fixes Android WebView mid-screen float).
- Android `versionCode 2` / `versionName 1.1.0`.

