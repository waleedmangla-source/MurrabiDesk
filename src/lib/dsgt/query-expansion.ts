// ─────────────────────────────────────────────────────────────────────────────
// DSGT Phase 2: Mathematical Query Expansion & Cross-Lingual Term Bridge
// Implements deterministic Rocchio formulation and cross-lingual lexical bridging
// ─────────────────────────────────────────────────────────────────────────────

import { DisambiguatedContext } from './context-disambiguation';
import { THEOLOGICAL_TOPIC_MAP } from '../khazain-data';

export interface ExpandedQueryVector {
  originalQuery: string;
  normalizedTerms: string[];
  urduKhazainTerms: string[];
  arabicQuranTerms: string[];
  periodicalTerms: string[];
  targetVolumes: number[];
  termWeights: Record<string, number>;
  primaryFocusText: string;
}

/**
 * Deterministic Rocchio-style Query Expansion
 * Expands original query tokens using theological ontology, topic mapping,
 * and cross-lingual term associations with explicit algebraic weighting.
 */
export function expandQueryVector(context: DisambiguatedContext): ExpandedQueryVector {
  const original = context.query;
  const termWeights: Record<string, number> = {};

  // Base term collection
  const urduKhazainTermsSet = new Set<string>();
  const arabicQuranTermsSet = new Set<string>();
  const periodicalTermsSet = new Set<string>();
  const targetVolumesSet = new Set<number>();

  // 1. Incorporate original tokens with highest weight (1.0)
  for (const token of context.extractedKeywords) {
    termWeights[token] = 1.0;
    periodicalTermsSet.add(token);

    // Check if directly in THEOLOGICAL_TOPIC_MAP
    if (THEOLOGICAL_TOPIC_MAP[token]) {
      for (const urdu of THEOLOGICAL_TOPIC_MAP[token]) {
        urduKhazainTermsSet.add(urdu);
        termWeights[urdu] = 0.9;
      }
    }
  }

  // 2. Incorporate Ontological Sense (Weight: 0.85 - 0.95)
  if (context.winningSense) {
    const sense = context.winningSense;

    // Add core volumes
    for (const vol of sense.coreVolumes) {
      targetVolumesSet.add(vol);
    }

    // Add primary Urdu terms from sense
    for (const u of sense.urduTerms) {
      urduKhazainTermsSet.add(u);
      termWeights[u] = 0.95;
    }

    // Add Arabic scripture terms from sense
    for (const a of sense.arabicTerms) {
      arabicQuranTermsSet.add(a);
      termWeights[a] = 0.9;
    }

    // Add relevant English keywords from concept
    const conceptTokens = sense.primaryConcept.toLowerCase().split(/\s+/).filter(t => t.length > 3);
    for (const c of conceptTokens) {
      periodicalTermsSet.add(c);
      if (!termWeights[c]) termWeights[c] = 0.85;
    }
  }

  // 3. Fallback check on whole query string in topic map
  const queryClean = original.toLowerCase().trim();
  if (THEOLOGICAL_TOPIC_MAP[queryClean]) {
    for (const urdu of THEOLOGICAL_TOPIC_MAP[queryClean]) {
      urduKhazainTermsSet.add(urdu);
      termWeights[urdu] = 1.0;
    }
  }

  // If query is in Urdu/Arabic script directly, add directly to Khazain terms
  const hasUrduArabic = /[\u0600-\u06FF]/.test(original);
  if (hasUrduArabic) {
    urduKhazainTermsSet.add(original);
    arabicQuranTermsSet.add(original);
    termWeights[original] = 1.0;
  }

  // Generate clean unified normalized terms list
  const normalizedTerms = Array.from(new Set([
    ...context.extractedKeywords,
    ...Array.from(urduKhazainTermsSet).slice(0, 8),
    ...Array.from(arabicQuranTermsSet).slice(0, 4)
  ]));

  return {
    originalQuery: original,
    normalizedTerms,
    urduKhazainTerms: Array.from(urduKhazainTermsSet),
    arabicQuranTerms: Array.from(arabicQuranTermsSet),
    periodicalTerms: Array.from(periodicalTermsSet),
    targetVolumes: Array.from(targetVolumesSet),
    termWeights,
    primaryFocusText: context.winningSense?.primaryConcept || original
  };
}
