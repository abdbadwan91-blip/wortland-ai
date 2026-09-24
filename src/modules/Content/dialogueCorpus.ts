/**
 * Dialogue corpus registry.
 *
 * BConTrasT (Unbabel / WMT20) is used as a source corpus for task-oriented
 * German dialogue patterns. Dataset license: CC BY-SA 4.0.
 * https://github.com/Unbabel/BConTrasT
 *
 * WortLand mission packs may adapt, simplify, reorder and annotate corpus
 * material for language learning. Keep attribution and ShareAlike notices
 * with redistributed adapted corpus content.
 */
export const DIALOGUE_CORPUS = {
  id: 'bcontrast-wmt20',
  title: 'BConTrasT',
  creator: 'Unbabel / WMT20 Chat Translation Task',
  license: 'CC BY-SA 4.0',
  source: 'https://github.com/Unbabel/BConTrasT',
  domains: ['coffee', 'restaurant', 'transport', 'cinema', 'auto', 'pizza'] as const,
} as const;

export type DialogueDomain = typeof DIALOGUE_CORPUS.domains[number];
