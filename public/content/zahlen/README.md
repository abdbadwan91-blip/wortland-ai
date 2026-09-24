# Zahlen (Numbers) — art brief

Parent generates painted PNGs into this folder. Wire as `src/modules/Content/zahlen.ts` when assets land.

## Scope (unlock plan)

**Phase A — 0–12 (ship first):** zero through twelve — core Pre-A1 counting.
**Phase B — 13–20 (optional follow-up):** thirteen through twenty.

Same soft-painted style as Tiere / Essen / Schule (white/cream bg, kid-friendly).
File names = id + `.png` (e.g. `drei.png`).

## Needed words (Phase A)

| id | lemma | article | ar | en | notes |
|----|-------|---------|----|----|-------|
| null | Null | die | صفر | zero | optional digit 0 |
| eins | Eins | die | واحد | one | noun form; spoken "eins" |
| zwei | Zwei | die | اثنان | two | |
| drei | Drei | die | ثلاثة | three | |
| vier | Vier | die | أربعة | four | |
| fuenf | Fünf | die | خمسة | five | file: fuenf.png |
| sechs | Sechs | die | ستة | six | |
| sieben | Sieben | die | سبعة | seven | |
| acht | Acht | die | ثمانية | eight | |
| neun | Neun | die | تسعة | nine | |
| zehn | Zehn | die | عشرة | ten | |
| elf | Elf | die | أحد عشر | eleven | |
| zwoelf | Zwölf | die | اثنا عشر | twelve | file: zwoelf.png |

## Phase B (13–20)

| id | lemma | article | ar | en |
|----|-------|---------|----|----|
| dreizehn | Dreizehn | die | ثلاثة عشر | thirteen |
| vierzehn | Vierzehn | die | أربعة عشر | fourteen |
| fuenfzehn | Fünfzehn | die | خمسة عشر | fifteen |
| sechzehn | Sechzehn | die | ستة عشر | sixteen |
| siebzehn | Siebzehn | die | سبعة عشر | seventeen |
| achtzehn | Achtzehn | die | ثمانية عشر | eighteen |
| neunzehn | Neunzehn | die | تسعة عشر | nineteen |
| zwanzig | Zwanzig | die | عشرون | twenty |

## Wire plan (after art lands)

1. Create `src/modules/Content/zahlen.ts` (category `numbers`, `imageKind: 'url'`, distractors within topic).
2. Unlock `{ id: 'zahlen', icon: '🔢', locked: false }` in `TOPICS` (add entry if missing).
3. Extend `TopicId` + `getTopicLos` / `getTopicLoById`.
4. `cardExtras` plurals (often `—` for number nouns) + simple examples (`Ich habe drei Äpfel.`).
5. i18n: `topic.zahlen` already exists; add `topic.zahlen.desc` (ar/en/de).
6. All modes: Classic / Picture Match / Quick Pick / Article Pick (articles are all `die` for number nouns — Article Pick still teaches die).

**Art tip:** show the digit prominently with a matching count of simple objects (apples, stars, dots) so Picture Match is fair for kids.
