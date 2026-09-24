# WortLand AI

A client-side web prototype for learning German through short, game-like practice sessions.

> Spielen • Lernen • Deutsch meistern

## Run locally

Requirements: Node.js and npm.

```bash
cd /workspace/deutsch-quest
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). To test a production build locally:

```bash
npm run build
npm run preview
```

Other scripts:

- `npm run lint` — run oxlint
- `npm run build` — type-check and create the Vite production bundle in `dist/`
- `npm run build:app` — same production build with base `/` for Capacitor
- `npm run cap:sync` — `build:app` then `npx cap sync android`

## What is live in the prototype

- **Onboarding:** splash, app language, name, avatar selection (30 avatars), Junior/Standard learning mode, and optional email entry.
- **Languages:** the interface supports Arabic, English, and German; the learning language is German. Text direction follows the selected interface language.
- **Quest Map:** a 20-stage map with Mountain 1–10 and Forest 1–10. Stage 1 starts unlocked; completing the current stage unlocks the next one, including a falcon transition when Forest opens.
- **Level Wheel:** levels 1–20 grouped into Starter/Pre-A1, A1, A2, B1, B2, and C1 difficulty bands. Level changes alter round length, option count, audio speed, weak-word bias, and (from level 7) the soft timer.
- **Topics:** all 14 topics in the current content catalog are selectable and have learning-object pools: Tiere, Essen, Zuhause, Schule, Familie, Farben, Kleidung, Körper, Wetter, Transport, Gesundheit, Arbeit, Natur, and Zahlen.
- **Practice:** results award XP/coins and update map progress, streaks, mastery, daily practice, daily missions, and badges where the relevant flow supports them.
- **Audio:** on-demand German `de-DE` speech — Web Speech API in the browser, Capacitor Text-to-Speech on Android — with speech settings and normal/slow playback. Synthetic device audio, not recorded human audio.
- **Progress and profile:** mastery counts (tracked, weak, due), Smart Training for weak/due words, a 35-day practice heatmap, streak summary, topic averages, earned badges, and titles.
- **Settings:** interface language, speech toggle, volume, reduced motion, high contrast, Junior/Standard mode, and local guest/email profile display.
- **Family:** a local-only family board with a client-generated invite code, local/demo companion rows, XP ranking, copy-code, join, and leave actions. It does not synchronize between devices.

## Game modes by level

The Level Wheel unlocks modes at the minimum levels below. All listed modes have a corresponding arena/results flow in `src/screens/`; locked modes remain unavailable until their minimum level.

| Minimum level | Mode | What it does |
| ---: | --- | --- |
| 1 | Classic Cards | Flip study cards for image/audio, article, lemma, plural, translation, and example. |
| 1 | Picture Match | Hear or view a prompt and choose the matching image. |
| 2 | Quick Pick | Choose the German word for a pictured learning object. |
| 3 | Article Pick | Choose `der`, `die`, or `das`. |
| 4 | Memory Flip | Match image and word cards. |
| 5 | Build It | Build/complete a German sentence from the available choices. |
| 6 | Master Challenge | A mixed picture/quick/article challenge with enhanced rewards. |
| 7 | Listening Hunt | Listen and identify the matching German word/image. |
| 8 | Speed Round / Word Race | Timed rapid word-choice rounds. |
| 9 | Word Puzzle | Solve scrambled-word puzzles, with an optional hint. |
| 10 | Conversation Mission | Complete a guided mini-scene and its response choices. |

The Games screen also contains a future **Sentence Race** card; it is not part of the current `GAME_MODE_DEFS` catalog.

## Browser storage

The prototype has no server account or database. Data is stored in the current browser origin with these keys:

| Key | Stores |
| --- | --- |
| `deutsch-quest-profile-v1` | Name, avatar, interface/translation language, learning mode, optional email, XP, coins, streak, and current level. |
| `wortland-map-progress-v1` | Unlocked/completed map stages and whether the Forest falcon transition was seen. |
| `wortland.settings.v1` | Speech enabled, volume, reduced motion, and high contrast. |
| `wortland.family.v1` | The local family name, invite code, and local leaderboard members. |
| `wortland.mastery.v1` | Per-word score, ease, review interval, next review time, and review count. |
| `wortland.heatmap.v1` | Local calendar dates and finished-round counts for the practice heatmap. |
| `wortland.badges.v1` | Earned badge IDs and timestamps. |
| `wortland.daily.v1` | Today’s rounds/correct/XP goals and claimed coin rewards. |

**Reset behavior:** Profile → Reset onboarding resets the onboarding/profile, map, mastery, and badges used by the profile flow. It does not remove settings, family data, the practice heatmap, or daily-mission data. Clear the site’s browser storage to remove everything.


## Android app

WortLand AI can run as a Capacitor Android app (`appId`: `ai.wortland.app`).

### Download the APK

Every push to `main` builds a **debug** APK in GitHub Actions and publishes it to the prerelease tag [`android-latest`](https://github.com/abdbadwan91-blip/wortland-ai/releases/tag/android-latest):

- Release page: https://github.com/abdbadwan91-blip/wortland-ai/releases/tag/android-latest
- Direct asset: https://github.com/abdbadwan91-blip/wortland-ai/releases/download/android-latest/WortLand-AI.apk

On the phone, allow installs from unknown sources (browser/file manager) when prompted. This debug build is **not** signed for Google Play.

### Build locally (web + sync)

```bash
npm ci
npm run build:app          # Vite build with base /
npx cap sync android       # copy web assets into android/
```

Or in one step: `npm run cap:sync`.

Open `android/` in Android Studio (or run `./gradlew assembleDebug` with a local SDK) to produce the APK. CI uses Temurin JDK 21 and Gradle via the Capacitor wrapper.

### TTS on Android

Android WebView does not reliably support `speechSynthesis`. The shared helper in `src/modules/Audio/speech.ts` uses `@capacitor-community/text-to-speech` with `lang: de-DE` when `Capacitor.isNativePlatform()` is true, and falls back to the Web Speech API on the web. If no German voice pack is installed on the device, speech fails quietly (a one-time console warning).

### GitHub Pages

The web deploy at https://abdbadwan91-blip.github.io/wortland-ai/ is unchanged: `.github/workflows/deploy-pages.yml` still builds with `VITE_BASE=/wortland-ai/`. The Android workflow builds with base `/` for the WebView.

## Known next steps

- Ship a signed Play Store / App Store release (current Android artifact is a debug APK).
- Replace the local family MVP with authenticated server-backed family sync across devices.
- Add human-recorded German audio alongside the current browser speech synthesis.

For the implementation checklist and source-of-truth status notes, see [`docs/STATUS.md`](docs/STATUS.md).
