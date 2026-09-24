/** Learning Object — core content unit for Flash Arena & beyond */

export type Article = 'der' | 'die' | 'das';
export type CefrLevel = 'pre' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface LearningObject {
  id: string;
  lemma: string;
  article: Article;
  language: 'de';
  cefr: CefrLevel;
  difficulty: number;
  category: string;
  /** Translation keys → localized gloss (not UI strings) */
  translations: { ar: string; en: string; de?: string };
  /** Large emoji or path under /public */
  image: string;
  imageKind: 'emoji' | 'url';
  /** Other LO ids used as Picture Match distractors */
  distractors: string[];
  /** German plural form (— if uncountable / no common plural) */
  plural?: string;
  /** Simple A1 example sentence in German */
  example?: string;
}

export function displayLemma(lo: LearningObject, withArticle = false): string {
  return withArticle ? `${lo.article} ${lo.lemma}` : lo.lemma;
}

export function translationFor(
  lo: LearningObject,
  lang: string,
): string {
  const t = lo.translations;
  if (lang === 'ar') return t.ar;
  if (lang === 'de') return t.de ?? lo.lemma;
  return t.en;
}
