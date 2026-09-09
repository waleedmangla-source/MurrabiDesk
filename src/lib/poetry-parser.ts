/**
 * Poetry and Couplet (Sher / Asha'ar) Detection and Parsing for Classical Urdu, Arabic, and Persian Literature.
 */

export interface Couplet {
  misra1: string;
  misra2?: string;
  isSideBySide?: boolean;
}

export type PageBlock =
  | { type: 'prose'; text: string }
  | { type: 'empty' }
  | { type: 'poetry'; couplets: Couplet[]; isEmbedded?: boolean };

/**
 * Checks if a single trimmed line exhibits the characteristics of a poetic hemistich (Misra).
 */
export function isPoeticLine(line: string): boolean {
  const t = line.trim();
  if (!t) return false;

  // Exclude tables, ledger columns, and numbering
  if (t.includes('\t') || t.includes('__') || t.includes('_ _')) return false;
  if (/^([۰-۹\d]+[\s۔\-\/]*)+$/.test(t)) return false;
  if (/^[۰-۹0-9]؂/.test(t) || /^\([۰-۹0-9]+\)/.test(t)) return false;
  if (/^[ابجدیہوزحطیکلمنسعفصقرشتثخذضظغ]\s*[\t۔\-_]/.test(t)) return false;
  if (t.startsWith('بقیہ حاشیہ') || t.startsWith('حاشیہ') || t.startsWith('فہرست') || t.startsWith('نمبر')) return false;
  if (t.startsWith('۱۔') || t.startsWith('۲۔') || t.startsWith('۳۔')) return false;
  if (t.includes('بابت خریداری') || t.includes('تعداد زر') || t.includes('کیفیت')) return false;

  // Typical Urdu/Persian/Arabic Misra: 10 to 72 characters, 2 to 14 words
  if (t.length >= 10 && t.length <= 72) {
    const words = t.split(/\s+/).filter(Boolean);
    if (words.length >= 2 && words.length <= 15) {
      return true;
    }
  }
  return false;
}

/**
 * Validates whether two lines have balanced rhythmic meter and length to form a couplet (Sher).
 */
export function areBalancedMisras(line1: string, line2: string): boolean {
  const l1 = line1.trim();
  const l2 = line2.trim();
  if (!isPoeticLine(l1) || !isPoeticLine(l2)) return false;

  const lenDiff = Math.abs(l1.length - l2.length);
  if (lenDiff > 24) return false;

  const w1 = l1.split(/\s+/).filter(Boolean).length;
  const w2 = l2.split(/\s+/).filter(Boolean).length;
  if (Math.abs(w1 - w2) > 4) return false;

  return true;
}

/**
 * Parses page text into structured blocks: prose paragraphs, empty spacing, or poetry couplet stanzas.
 */
export function parsePageToBlocks(text: string): PageBlock[] {
  if (!text) return [];

  const lines = text.split('\n');
  const blocks: PageBlock[] = [];
  let pendingPoetryLines: string[] = [];

  const flushPoetry = () => {
    if (pendingPoetryLines.length >= 2) {
      const couplets: Couplet[] = [];
      for (let i = 0; i < pendingPoetryLines.length; i += 2) {
        if (i + 1 < pendingPoetryLines.length) {
          couplets.push({
            misra1: pendingPoetryLines[i],
            misra2: pendingPoetryLines[i + 1]
          });
        } else {
          couplets.push({
            misra1: pendingPoetryLines[i]
          });
        }
      }
      blocks.push({
        type: 'poetry',
        couplets,
        isEmbedded: blocks.some(b => b.type === 'prose')
      });
    } else if (pendingPoetryLines.length === 1) {
      blocks.push({ type: 'prose', text: pendingPoetryLines[0] });
    }
    pendingPoetryLines = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      // If we have an odd pending misra, check if the next non-empty line forms the second misra
      if (pendingPoetryLines.length % 2 === 1) {
        let next = '';
        for (let j = i + 1; j < lines.length && j <= i + 3; j++) {
          if (lines[j].trim()) {
            next = lines[j].trim();
            break;
          }
        }
        if (next && areBalancedMisras(pendingPoetryLines[pendingPoetryLines.length - 1], next)) {
          continue;
        }
      }
      flushPoetry();
      blocks.push({ type: 'empty' });
      continue;
    }

    // Check single-line side-by-side couplet separated by 3+ spaces
    if (trimmed.includes('   ')) {
      const parts = trimmed.split(/\s{3,}/).map(s => s.trim()).filter(Boolean);
      if (parts.length === 2 && areBalancedMisras(parts[0], parts[1])) {
        flushPoetry();
        blocks.push({
          type: 'poetry',
          couplets: [{ misra1: parts[0], misra2: parts[1], isSideBySide: true }],
          isEmbedded: blocks.some(b => b.type === 'prose')
        });
        continue;
      }
    }

    if (isPoeticLine(trimmed)) {
      pendingPoetryLines.push(trimmed);
    } else {
      flushPoetry();
      blocks.push({ type: 'prose', text: rawLine });
    }
  }

  flushPoetry();
  return blocks;
}
