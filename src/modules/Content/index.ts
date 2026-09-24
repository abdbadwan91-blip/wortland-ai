export * from './types';
export * from './tiere';
export * from './essen';
export * from './farben';
export * from './familie';
export * from './zuhause';
export * from './schule';
export * from './zahlen';
export * from './kleidung';
export * from './koerper';
export * from './wetter';
export * from './transport';
export * from './natur';
export * from './gesundheit';
export * from './arbeit';
export * from './cefr';
export * from './cardExtras';
export * from './levelDifficulty';

import type { LearningObject } from './types';
import { getTiereById, getTierePool } from './tiere';
import { getEssenById, getEssenPool } from './essen';
import { getFarbenById, getFarbenPool } from './farben';
import { getFamilieById, getFamiliePool } from './familie';
import { getZuhauseById, getZuhausePool } from './zuhause';
import { getSchuleById, getSchulePool } from './schule';
import { getZahlenById, getZahlenPool } from './zahlen';
import { getKleidungById, getKleidungPool } from './kleidung';
import { getKoerperById, getKoerperPool } from './koerper';
import { getWetterById, getWetterPool } from './wetter';
import { getTransportById, getTransportPool } from './transport';
import { getNaturById, getNaturPool } from './natur';
import { getGesundheitById, getGesundheitPool } from './gesundheit';
import { getArbeitById, getArbeitPool } from './arbeit';
import { extrasFor } from './cardExtras';

/** Supported playable topic ids with Learning Object pools */
export type TopicId = 'tiere' | 'essen' | 'farben' | 'familie' | 'zuhause' | 'schule' | 'zahlen' | 'kleidung' | 'koerper' | 'wetter' | 'transport' | 'natur' | 'gesundheit' | 'arbeit';

function enrich(lo: LearningObject): LearningObject {
  const x = extrasFor(lo.id);
  return {
    ...lo,
    plural: lo.plural ?? x.plural,
    example: lo.example ?? x.example,
  };
}

export function getTopicLos(topicId: string): LearningObject[] {
  switch (topicId) {
    case 'essen':
      return getEssenPool().map(enrich);
    case 'farben':
      return getFarbenPool().map(enrich);
    case 'familie':
      return getFamiliePool().map(enrich);
    case 'zuhause':
      return getZuhausePool().map(enrich);
    case 'schule':
      return getSchulePool().map(enrich);
    case 'zahlen':
      return getZahlenPool().map(enrich);
    case 'kleidung':
      return getKleidungPool().map(enrich);
    case 'koerper':
      return getKoerperPool().map(enrich);
    case 'wetter':
      return getWetterPool().map(enrich);
    case 'transport':
      return getTransportPool().map(enrich);
    case 'natur':
      return getNaturPool().map(enrich);
    case 'gesundheit':
      return getGesundheitPool().map(enrich);
    case 'arbeit':
      return getArbeitPool().map(enrich);
    case 'tiere':
    default:
      return getTierePool().map(enrich);
  }
}

export function getTopicLoById(
  topicId: string,
  id: string,
): LearningObject | undefined {
  let lo: LearningObject | undefined;
  switch (topicId) {
    case 'essen':
      lo = getEssenById(id);
      break;
    case 'farben':
      lo = getFarbenById(id);
      break;
    case 'familie':
      lo = getFamilieById(id);
      break;
    case 'zuhause':
      lo = getZuhauseById(id);
      break;
    case 'schule':
      lo = getSchuleById(id);
      break;
    case 'zahlen':
      lo = getZahlenById(id);
      break;
    case 'kleidung':
      lo = getKleidungById(id);
      break;
    case 'koerper':
      lo = getKoerperById(id);
      break;
    case 'wetter':
      lo = getWetterById(id);
      break;
    case 'transport':
      lo = getTransportById(id);
      break;
    case 'natur':
      lo = getNaturById(id);
      break;
    case 'gesundheit':
      lo = getGesundheitById(id);
      break;
    case 'arbeit':
      lo = getArbeitById(id);
      break;
    case 'tiere':
    default:
      lo = getTiereById(id);
      break;
  }
  return lo ? enrich(lo) : undefined;
}
