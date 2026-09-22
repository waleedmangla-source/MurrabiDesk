// ─────────────────────────────────────────────────────────────────────────────
// DSGT Phase 5: Consensus Triangulation Matrix & Evidence Verifier
// Quantifies multi-source theological convergence and builds auditable provenance
// ─────────────────────────────────────────────────────────────────────────────

import { DisambiguatedContext } from './context-disambiguation';
import { HitsRankings } from './hits-engine';
import {
  QuranVerseResult,
  RuhaniKhazainSearchResult,
  AlIslamArticleResult,
  PublicationResult
} from '../research-sources';

export interface TriangulationLayerStatus {
  name: 'Holy Qur\'an' | 'Ruhani Khazain' | 'Hadith Tradition' | 'Scholarly Periodicals';
  corroborated: boolean;
  matchCount: number;
  primaryReference?: string;
  excerptSnippet?: string;
}

export interface TheologicalConsensusMatrix {
  query: string;
  topicTitle: string;
  theologicalThesis: string;
  confidenceScore: number; // 0 to 100%
  consensusLevel: 'Unanimously Corroborated' | 'Strong Multi-Source Consensus' | 'Primary Scriptural Foundation' | 'Exploratory Match';
  layers: TriangulationLayerStatus[];
  corroboratedLayersCount: number;
  totalCorroboratedSources: number;
  primaryAuthorityRank: string;
  evidencePoints: Array<{
    sourceType: string;
    citation: string;
    text: string;
    authorityScore?: number;
  }>;
  provenanceChain: string[];
}

/**
 * Computes the Consensus Triangulation Matrix
 * Mathematical corroboration across the 4 fundamental layers of Ahmadiyya literature
 */
export function computeConsensusTriangulation(
  context: DisambiguatedContext,
  quranResults: QuranVerseResult[],
  rkResults: RuhaniKhazainSearchResult[],
  alislamResults: AlIslamArticleResult[],
  periodicalsResults: PublicationResult[],
  hitsRankings: HitsRankings
): TheologicalConsensusMatrix {
  const query = context.query;
  const sense = context.winningSense;

  // Layer 1: Holy Qur'an
  const quranCount = quranResults.length;
  const primaryQuran = quranResults[0];
  const quranLayer: TriangulationLayerStatus = {
    name: "Holy Qur'an",
    corroborated: quranCount > 0,
    matchCount: quranCount,
    primaryReference: primaryQuran ? `Surah ${primaryQuran.surahNameEnglish} (${primaryQuran.surahNumber}:${primaryQuran.verseNumber})` : undefined,
    excerptSnippet: primaryQuran?.englishTranslation
  };

  // Layer 2: Ruhani Khazain (23 Volumes)
  const rkCount = rkResults.length;
  const primaryRk = rkResults[0];
  const rkSnippet = primaryRk ? `${primaryRk.snippetBefore} ${primaryRk.matchedSlice} ${primaryRk.snippetAfter}`.trim() : undefined;
  const rkLayer: TriangulationLayerStatus = {
    name: "Ruhani Khazain",
    corroborated: rkCount > 0,
    matchCount: rkCount,
    primaryReference: primaryRk ? `${primaryRk.bookTitle} (Vol. ${primaryRk.volume}, p. ${primaryRk.pageNum})` : undefined,
    excerptSnippet: rkSnippet ? `${rkSnippet.slice(0, 180)}...` : undefined
  };

  // Layer 3: Hadith Traditions (From Ontology or Search matches)
  const hadithPresent = (sense?.scripturalAnchors.some(a => a.toLowerCase().includes('bukhari') || a.toLowerCase().includes('muslim') || a.toLowerCase().includes('darqutni') || a.toLowerCase().includes('hadith'))) || false;
  const hadithAnchor = sense?.scripturalAnchors.find(a => a.toLowerCase().includes('bukhari') || a.toLowerCase().includes('muslim') || a.toLowerCase().includes('darqutni'));
  const hadithLayer: TriangulationLayerStatus = {
    name: "Hadith Tradition",
    corroborated: hadithPresent,
    matchCount: hadithPresent ? 1 : 0,
    primaryReference: hadithAnchor || (hadithPresent ? "Prophetic Ahadith Collections" : undefined),
    excerptSnippet: hadithAnchor ? `Corroborated by canonical Prophetic tradition: ${hadithAnchor}` : undefined
  };

  // Layer 4: Scholarly Periodicals & Archives
  const periodicalsCount = alislamResults.length + periodicalsResults.length;
  const primaryPeriodical = periodicalsResults[0] || alislamResults[0];
  const periodicalLayer: TriangulationLayerStatus = {
    name: "Scholarly Periodicals",
    corroborated: periodicalsCount > 0,
    matchCount: periodicalsCount,
    primaryReference: primaryPeriodical ? primaryPeriodical.title : undefined,
    excerptSnippet: primaryPeriodical?.summary ? `${primaryPeriodical.summary.slice(0, 160)}...` : undefined
  };

  const layers = [quranLayer, rkLayer, hadithLayer, periodicalLayer];
  const corroboratedLayersCount = layers.filter(l => l.corroborated).length;
  const totalCorroboratedSources = quranCount + rkCount + (hadithPresent ? 1 : 0) + periodicalsCount;

  // Calculate Mathematical Triangulation Confidence Score
  // Weights: Quran = 35%, Ruhani Khazain = 30%, Hadith = 20%, Periodicals = 15%
  let rawConfidence = 0;
  if (quranLayer.corroborated) rawConfidence += 35;
  if (rkLayer.corroborated) rawConfidence += 30;
  if (hadithLayer.corroborated) rawConfidence += 20;
  if (periodicalLayer.corroborated) rawConfidence += 15;

  // Density bonus for deep multi-hit coverage
  if (totalCorroboratedSources >= 10) rawConfidence = Math.min(100, rawConfidence + 5);
  if (totalCorroboratedSources >= 25) rawConfidence = Math.min(100, rawConfidence + 5);

  let consensusLevel: TheologicalConsensusMatrix['consensusLevel'] = 'Exploratory Match';
  if (corroboratedLayersCount === 4 && rawConfidence >= 90) {
    consensusLevel = 'Unanimously Corroborated';
  } else if (corroboratedLayersCount >= 3) {
    consensusLevel = 'Strong Multi-Source Consensus';
  } else if (quranLayer.corroborated || rkLayer.corroborated) {
    consensusLevel = 'Primary Scriptural Foundation';
  }

  // Generate Synthesized Thesis
  let topicTitle = sense?.primaryConcept || `Theological Inquiry: ${query}`;
  let theologicalThesis = "";
  if (sense) {
    theologicalThesis = sense.gloss;
  } else if (primaryQuran?.commentaryNote) {
    theologicalThesis = primaryQuran.commentaryNote;
  } else if (primaryPeriodical?.summary) {
    theologicalThesis = primaryPeriodical.summary;
  } else if (rkSnippet) {
    theologicalThesis = `Scholarly thesis established from Ruhani Khazain: "${rkSnippet.slice(0, 220)}..."`;
  } else {
    theologicalThesis = `Exhaustive multi-source investigation conducted across 23 volumes of Ruhani Khazain and Ahmadiyya archives for "${query}".`;
  }

  // Ordered evidence chain with HITS authority scores
  const evidencePoints: TheologicalConsensusMatrix['evidencePoints'] = [];
  for (const q of quranResults.slice(0, 2)) {
    const qId = `quran:${q.surahNumber}:${q.verseNumber}`;
    const hitsScore = hitsRankings.scores.get(qId)?.authorityScore || 0.95;
    evidencePoints.push({
      sourceType: "Holy Qur'an",
      citation: `Surah ${q.surahNameEnglish} (${q.surahNumber}:${q.verseNumber})`,
      text: q.englishTranslation,
      authorityScore: hitsScore
    });
  }

  for (const r of rkResults.slice(0, 2)) {
    const rId = `rk:vol${r.volume}:${r.bookTitle.replace(/\s+/g, '-').toLowerCase()}`;
    const hitsScore = hitsRankings.scores.get(rId)?.authorityScore || 0.90;
    const snippet = `${r.snippetBefore} [${r.matchedSlice}] ${r.snippetAfter}`.trim();
    evidencePoints.push({
      sourceType: "Ruhani Khazain",
      citation: `${r.bookTitle} (Vol. ${r.volume}, p. ${r.pageNum})`,
      text: snippet ? `${snippet.slice(0, 160)}...` : `Corpus reference in Volume ${r.volume}`,
      authorityScore: hitsScore
    });
  }

  // Provenance chain for absolute auditability
  const provenanceChain: string[] = [];
  if (primaryQuran) provenanceChain.push(`[Qur'an ${primaryQuran.surahNumber}:${primaryQuran.verseNumber}]`);
  if (primaryRk) provenanceChain.push(`[Ruhani Khazain Vol.${primaryRk.volume}: p.${primaryRk.pageNum}]`);
  if (hadithAnchor) provenanceChain.push(`[Hadith: ${hadithAnchor}]`);
  if (primaryPeriodical) provenanceChain.push(`[Archive: ${primaryPeriodical.title}]`);

  const topAuthority = hitsRankings.authorities[0]?.nodeId || (primaryQuran ? `quran:${primaryQuran.surahNumber}:${primaryQuran.verseNumber}` : "Direct Corpus");

  return {
    query,
    topicTitle,
    theologicalThesis,
    confidenceScore: rawConfidence,
    consensusLevel,
    layers,
    corroboratedLayersCount,
    totalCorroboratedSources,
    primaryAuthorityRank: topAuthority,
    evidencePoints,
    provenanceChain
  };
}
