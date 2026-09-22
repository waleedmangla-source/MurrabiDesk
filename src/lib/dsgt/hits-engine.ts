// ─────────────────────────────────────────────────────────────────────────────
// DSGT Phase 4: Kleinberg's HITS Authority & Hub Engine
// Implements deterministic power iteration on dynamic neighborhood graphs
// ─────────────────────────────────────────────────────────────────────────────

import { CitationGraph, getCitationGraph } from './citation-graph';

export interface HitsScoreResult {
  nodeId: string;
  authorityScore: number; // Normalized 0.0 to 1.0
  hubScore: number;       // Normalized 0.0 to 1.0
  tier: 'PrimaryScripture' | 'PrimaryTreatise' | 'AuthoritativeHub' | 'HistoricalDocument';
}

export interface HitsRankings {
  scores: Map<string, HitsScoreResult>;
  authorities: HitsScoreResult[];
  hubs: HitsScoreResult[];
  iterationsCompleted: number;
  converged: boolean;
}

/**
 * Kleinberg's HITS Algorithm
 * Runs query-specific power iteration on the subgraph formed by the matched nodes
 * and their snowball-expanded neighborhood.
 */
export function computeHitsRankings(
  candidateNodeIds: string[],
  maxIterations = 30,
  tolerance = 1e-4
): HitsRankings {
  const fullGraph = getCitationGraph();

  // 1. Build Base Set S_q from Root Set R_q
  // Add all nodes in candidateNodeIds and their immediate in-links and out-links
  const baseSet = new Set<string>(candidateNodeIds);
  for (const id of candidateNodeIds) {
    const outLinks = fullGraph.outLinks.get(id) || [];
    for (const outId of outLinks) baseSet.add(outId);

    const inLinks = fullGraph.inLinks.get(id) || [];
    for (const inId of inLinks) baseSet.add(inId);
  }

  const nodeArray = Array.from(baseSet);
  const n = nodeArray.length;

  // If trivial graph, assign baseline weights
  if (n === 0) {
    return {
      scores: new Map(),
      authorities: [],
      hubs: [],
      iterationsCompleted: 0,
      converged: true
    };
  }

  // Map each node to an array index
  const indexMap = new Map<string, number>();
  nodeArray.forEach((id, idx) => indexMap.set(id, idx));

  // Build local adjacency matrix within Base Set S_q
  const adjList: number[][] = Array.from({ length: n }, () => []);
  const transList: number[][] = Array.from({ length: n }, () => []);

  for (const edge of fullGraph.edges) {
    const fromIdx = indexMap.get(edge.fromId);
    const toIdx = indexMap.get(edge.toId);
    if (fromIdx !== undefined && toIdx !== undefined) {
      adjList[fromIdx].push(toIdx);
      transList[toIdx].push(fromIdx);
    }
  }

  // 2. Initialize authority and hub vectors uniformly
  let authVector = new Float64Array(n).fill(1.0 / Math.sqrt(n));
  let hubVector = new Float64Array(n).fill(1.0 / Math.sqrt(n));

  let iterationsCompleted = 0;
  let converged = false;

  // 3. Power Iteration Loop
  for (let iter = 0; iter < maxIterations; iter++) {
    iterationsCompleted++;
    const nextAuth = new Float64Array(n);
    const nextHub = new Float64Array(n);

    // Authority Update: x_p = sum_{q -> p} y_q
    for (let p = 0; p < n; p++) {
      let sum = 0;
      for (const q of transList[p]) {
        sum += hubVector[q];
      }
      nextAuth[p] = sum || 0.1; // Baseline smoothing
    }

    // Hub Update: y_p = sum_{p -> q} x_q
    for (let p = 0; p < n; p++) {
      let sum = 0;
      for (const q of adjList[p]) {
        sum += nextAuth[q];
      }
      nextHub[p] = sum || 0.1; // Baseline smoothing
    }

    // Normalize Authority Vector (L2 Norm)
    let authNorm = 0;
    for (let i = 0; i < n; i++) authNorm += nextAuth[i] * nextAuth[i];
    authNorm = Math.sqrt(authNorm) || 1.0;
    for (let i = 0; i < n; i++) nextAuth[i] /= authNorm;

    // Normalize Hub Vector (L2 Norm)
    let hubNorm = 0;
    for (let i = 0; i < n; i++) hubNorm += nextHub[i] * nextHub[i];
    hubNorm = Math.sqrt(hubNorm) || 1.0;
    for (let i = 0; i < n; i++) nextHub[i] /= hubNorm;

    // Check for convergence (Max Absolute Delta)
    let maxDelta = 0;
    for (let i = 0; i < n; i++) {
      const deltaAuth = Math.abs(nextAuth[i] - authVector[i]);
      const deltaHub = Math.abs(nextHub[i] - hubVector[i]);
      if (deltaAuth > maxDelta) maxDelta = deltaAuth;
      if (deltaHub > maxDelta) maxDelta = deltaHub;
    }

    authVector = nextAuth;
    hubVector = nextHub;

    if (maxDelta < tolerance) {
      converged = true;
      break;
    }
  }

  // 4. Build Ranked Output Objects
  const scores = new Map<string, HitsScoreResult>();
  const authorities: HitsScoreResult[] = [];
  const hubs: HitsScoreResult[] = [];

  for (let i = 0; i < n; i++) {
    const id = nodeArray[i];
    const authScore = parseFloat(authVector[i].toFixed(4));
    const hubScore = parseFloat(hubVector[i].toFixed(4));

    let tier: HitsScoreResult['tier'] = 'HistoricalDocument';
    if (id.startsWith('quran:')) {
      tier = 'PrimaryScripture';
    } else if (id.startsWith('rk:')) {
      tier = 'PrimaryTreatise';
    } else if (id.startsWith('hadith:')) {
      tier = 'PrimaryScripture';
    } else {
      tier = 'AuthoritativeHub';
    }

    const record: HitsScoreResult = {
      nodeId: id,
      authorityScore: authScore,
      hubScore: hubScore,
      tier
    };

    scores.set(id, record);
    authorities.push(record);
    hubs.push(record);
  }

  // Sort authorities descending by authority score
  authorities.sort((a, b) => b.authorityScore - a.authorityScore);
  // Sort hubs descending by hub score
  hubs.sort((a, b) => b.hubScore - a.hubScore);

  return {
    scores,
    authorities,
    hubs,
    iterationsCompleted,
    converged
  };
}
