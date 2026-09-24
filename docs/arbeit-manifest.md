# Arbeit content manifest

WortLand AI Level 1 work content. All 12 learning objects use `imageKind: "url"` and point to `/content/arbeit/<id>.png`.

| ID | Article | Lemma | Arabic | English | Asset |
|---|---|---|---|---|---|
| lehrer | der | Lehrer | معلّم | teacher | `public/content/arbeit/lehrer.png` |
| feuerwehrmann | der | Feuerwehrmann | رجل إطفاء | firefighter | `public/content/arbeit/feuerwehrmann.png` |
| polizist | der | Polizist | شرطي | police officer | `public/content/arbeit/polizist.png` |
| koch | der | Koch | طبّاخ | cook | `public/content/arbeit/koch.png` |
| baecker | der | Bäcker | خبّاز | baker | `public/content/arbeit/baecker.png` |
| bauer | der | Bauer | مزارع | farmer | `public/content/arbeit/bauer.png` |
| verkaeufer | der | Verkäufer | بائع | seller | `public/content/arbeit/verkaeufer.png` |
| pilot | der | Pilot | طيّار | pilot | `public/content/arbeit/pilot.png` |
| ingenieur | der | Ingenieur | مهندس | engineer | `public/content/arbeit/ingenieur.png` |
| brieftraeger | der | Briefträger | ساعي بريد | mail carrier | `public/content/arbeit/brieftraeger.png` |
| mechaniker | der | Mechaniker | ميكانيكي | mechanic | `public/content/arbeit/mechaniker.png` |
| friseur | der | Friseur | حلاّق | hairdresser | `public/content/arbeit/friseur.png` |

Wired in `src/modules/Content/arbeit.ts`, exported and routed through `getTopicLos` / `getTopicLoById`, with Arbeit unlocked in the topic picker and progress screen.
