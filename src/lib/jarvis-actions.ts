import { getDb } from '@/lib/db';
import path from 'path';
import fs from 'fs';
import { normalizeKhazainText } from '@/lib/khazain-data';

export interface JarvisActionResponse {
  success: boolean;
  message: string;
  data?: any;
  action?: {
    type: 'navigate' | 'notification' | 'task_result';
    path?: string;
    payload?: any;
  };
}

// ── Navigation Target Mapping ──────────────────────────────────────────────
export const PAGE_ROUTES: Record<string, { path: string; name: string; aliases: string[] }> = {
  dashboard: { path: '/', name: 'Dashboard', aliases: ['home', 'overview', 'main page', 'start'] },
  reader: { path: '/reader', name: 'Ruhani Khazain Reader', aliases: ['books', 'library', 'khazain', 'reading', 'book reader', 'holy books'] },
  expenses: { path: '/expenses', name: 'Expense Tracker', aliases: ['finance', 'budget', 'spending', 'money', 'receipts'] },
  notes: { path: '/notes', name: 'Notes', aliases: ['mission notes', 'notebook', 'memo', 'memos'] },
  calendar: { path: '/calendar', name: 'Calendar', aliases: ['schedule', 'agenda', 'appointments', 'meetings', 'events'] },
  emails: { path: '/emails', name: 'Mail', aliases: ['email', 'gmail', 'inbox', 'messages'] },
  chat: { path: '/chat', name: 'MurabbiAI Chat', aliases: ['ai chat', 'murabbiai', 'theological ai', 'assistant'] },
  letters: { path: '/letters', name: 'Letter Generator', aliases: ['official letters', 'huzoor letter', 'letter drafter', 'correspondence'] },
  habits: { path: '/habits', name: 'Routine & Habits', aliases: ['routine', 'daily tracker', 'habit tracker', 'tracker'] },
  drive: { path: '/drive', name: 'Drive Storage', aliases: ['files', 'cloud drive', 'documents', 'docs'] },
  tajnid: { path: '/tajnid', name: 'Tajnid Census', aliases: ['census', 'directory', 'members', 'records'] },
  betaTools: { path: '/beta-tools', name: 'Beta Tools & Lab', aliases: ['lab', 'beta', 'experimental', 'neural engine', 'crawler'] },
  settings: { path: '/settings', name: 'Settings', aliases: ['preferences', 'configuration', 'options'] },
  profile: { path: '/profile', name: 'User Profile', aliases: ['my profile', 'account', 'user'] },
};

export function resolveNavigationPath(target: string): { path: string; name: string } | null {
  const normalized = target.toLowerCase().trim();
  const cleaned = normalized
    .replace(/^(take me to|navigate to|go to|open|show me|view|switch to|launch)\s+/i, '')
    .replace(/^(my|the)\s+/i, '')
    .trim();
  
  // Direct key check (normalized or cleaned)
  if (PAGE_ROUTES[normalized]) {
    return { path: PAGE_ROUTES[normalized].path, name: PAGE_ROUTES[normalized].name };
  }
  if (PAGE_ROUTES[cleaned]) {
    return { path: PAGE_ROUTES[cleaned].path, name: PAGE_ROUTES[cleaned].name };
  }

  // Exact path match
  for (const item of Object.values(PAGE_ROUTES)) {
    if (item.path === normalized || item.path === `/${normalized}` || item.path === `/${cleaned}`) {
      return { path: item.path, name: item.name };
    }
  }

  // Key and Alias match
  for (const [key, item] of Object.entries(PAGE_ROUTES)) {
    const allIdentifiers = [key.toLowerCase(), item.name.toLowerCase(), ...item.aliases.map(a => a.toLowerCase())];
    
    // Check if cleaned query equals or is contained in identifiers, or identifiers contained in cleaned
    if (
      allIdentifiers.some(id => 
        cleaned === id || 
        cleaned.includes(id) || 
        normalized.includes(id)
      )
    ) {
      return { path: item.path, name: item.name };
    }
  }

  return null;
}

// ── Action: Log Expense ───────────────────────────────────────────────────
export async function jarvisAddExpense(params: {
  purpose: string;
  total: number;
  category?: string;
  date?: string;
}): Promise<JarvisActionResponse> {
  try {
    const db = getDb();
    const id = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;
    const now = new Date();
    const date = params.date || now.toISOString().split('T')[0];
    const month = date.substring(0, 7); // YYYY-MM
    const category = params.category || 'General';
    const totalVal = Math.abs(Number(params.total)) || 0;

    const stmt = db.prepare(`
      INSERT INTO expenses (id, fullName, month, date, purpose, total, status, data, refunded)
      VALUES (?, ?, ?, ?, ?, ?, 'approved', ?, 0)
    `);

    const dataJson = JSON.stringify({ category, loggedBy: 'J.A.R.V.I.S.' });
    stmt.run(id, 'Admin', month, date, params.purpose, totalVal, dataJson);

    return {
      success: true,
      message: `Expense of £${totalVal.toFixed(2)} for ${params.purpose} logged under ${category}.`,
      data: { id, total: totalVal, purpose: params.purpose, date, category },
      action: {
        type: 'task_result',
        path: '/expenses',
        payload: { id, total: totalVal, purpose: params.purpose }
      }
    };
  } catch (err: any) {
    console.error('[JARVIS Action] Expense creation error:', err);
    return { success: false, message: `Failed to record expense: ${err.message}` };
  }
}

// ── Action: Get Expenses Summary ──────────────────────────────────────────
export async function jarvisGetExpensesSummary(month?: string): Promise<JarvisActionResponse> {
  try {
    const db = getDb();
    const targetMonth = month || new Date().toISOString().substring(0, 7);
    const rows = db.prepare(`
      SELECT purpose, total, date FROM expenses 
      WHERE month = ? 
      ORDER BY date DESC
    `).all(targetMonth) as Array<{ purpose: string; total: number; date: string }>;

    const totalSpent = rows.reduce((sum, r) => sum + (Number(r.total) || 0), 0);
    const count = rows.length;

    return {
      success: true,
      message: `For ${targetMonth}, you have recorded ${count} expenses totaling £${totalSpent.toFixed(2)}.`,
      data: { month: targetMonth, totalSpent, count, recent: rows.slice(0, 3) }
    };
  } catch (err: any) {
    return { success: false, message: `Could not retrieve expense summary: ${err.message}` };
  }
}

// ── Action: Search Ruhani Khazain ────────────────────────────────────────
export async function jarvisSearchKhazain(query: string, limit: number = 3): Promise<JarvisActionResponse> {
  try {
    const normQ = normalizeKhazainText(query);
    if (!normQ) {
      return { success: false, message: "Search term was empty or could not be normalized." };
    }

    const matches: Array<{ volume: number; page: number; snippet: string }> = [];

    // Search across available volumes (volumes 1 to 23)
    for (let v = 1; v <= 23; v++) {
      if (matches.length >= limit) break;
      const volPath = path.resolve(process.cwd(), `public/ruhani-khazain/volume_${v}.json`);
      if (!fs.existsSync(volPath)) continue;

      try {
        const raw = JSON.parse(fs.readFileSync(volPath, 'utf8'));
        if (Array.isArray(raw.pages)) {
          for (const page of raw.pages) {
            if (!page.text) continue;
            const normText = normalizeKhazainText(page.text);
            const idx = normText.indexOf(normQ);
            if (idx !== -1) {
              const start = Math.max(0, idx - 40);
              const end = Math.min(page.text.length, idx + normQ.length + 60);
              matches.push({
                volume: v,
                page: page.page_num,
                snippet: page.text.substring(start, end).replace(/\n/g, ' ')
              });
              if (matches.length >= limit) break;
            }
          }
        }
      } catch {
        continue;
      }
    }

    if (matches.length === 0) {
      return {
        success: true,
        message: `I scanned the Ruhani Khazain library but found no immediate matches for "${query}", sir.`,
        data: { query, results: [] }
      };
    }

    const first = matches[0];
    return {
      success: true,
      message: `Found ${matches.length} references in Ruhani Khazain. The primary reference is in Volume ${first.volume}, page ${first.page}.`,
      data: { query, results: matches },
      action: {
        type: 'navigate',
        path: `/reader?vol=${first.volume}&page=${first.page}`
      }
    };
  } catch (err: any) {
    return { success: false, message: `Corpus search failed: ${err.message}` };
  }
}
