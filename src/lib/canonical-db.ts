import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
import { THEOLOGICAL_TOPIC_MAP } from './khazain-data';

export interface CanonicalBook {
  id: string;
  slug: string;
  title: string;
  urdu_title?: string;
  author: string;
  author_slug?: string;
  collection?: string;
  collection_slug?: string;
  language: string;
  cover_url?: string;
  total_pages: number;
  alislam_url?: string;
  source_url: string;
  crawled_at?: number;
}

export interface CanonicalPageInsert {
  book_slug: string;
  page_num: number;
  text_raw: string;
  text_norm: string;
  content_window?: string; // includes sliding window words from adjacent page
  alislam_scan_url?: string;
  word_count: number;
  title: string;
  author: string;
  collection?: string;
}

export interface CanonicalSearchResult {
  pageId: string;
  bookSlug: string;
  title: string;
  author: string;
  collection?: string;
  pageNum: number;
  snippet: string;
  textRaw: string;
  alislamScanUrl?: string;
  wordCount: number;
  rank?: number;
}

export interface CanonicalSearchOptions {
  bookSlug?: string;
  author?: string;
  collection?: string;
  language?: string;
  limit?: number;
}

let dbInstance: Database.Database | null = null;

export function getCanonicalDb(): Database.Database {
  if (dbInstance) return dbInstance;

  const dbDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'canonical-corpus.db');
  dbInstance = new Database(dbPath, { timeout: 10000 });

  // Performance optimizations
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('synchronous = NORMAL');
  dbInstance.pragma('temp_store = MEMORY');
  dbInstance.pragma('cache_size = -64000'); // 64MB cache

  initDatabaseTables(dbInstance);

  return dbInstance;
}

function initDatabaseTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      urdu_title TEXT,
      author TEXT NOT NULL,
      author_slug TEXT,
      collection TEXT,
      collection_slug TEXT,
      language TEXT NOT NULL,
      cover_url TEXT,
      total_pages INTEGER NOT NULL DEFAULT 0,
      alislam_url TEXT,
      source_url TEXT NOT NULL,
      crawled_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS book_pages (
      id TEXT PRIMARY KEY, -- '\${slug}:\${pageNum}'
      book_slug TEXT NOT NULL,
      page_num INTEGER NOT NULL,
      text_raw TEXT NOT NULL,
      text_norm TEXT NOT NULL,
      alislam_scan_url TEXT,
      word_count INTEGER NOT NULL,
      FOREIGN KEY (book_slug) REFERENCES books(slug)
    );

    CREATE INDEX IF NOT EXISTS idx_book_pages_slug_page ON book_pages(book_slug, page_num);

    CREATE VIRTUAL TABLE IF NOT EXISTS book_pages_fts USING fts5(
      page_id UNINDEXED,
      book_slug UNINDEXED,
      page_num UNINDEXED,
      title,
      author,
      collection,
      content,
      content_window,
      tokenize = 'unicode61 remove_diacritics 2'
    );

    CREATE TABLE IF NOT EXISTS rag_chunks (
      id TEXT PRIMARY KEY, -- '\${slug}:\${pageNum}:\${chunkIdx}'
      page_id TEXT NOT NULL,
      book_slug TEXT NOT NULL,
      page_num INTEGER NOT NULL,
      chunk_index INTEGER NOT NULL,
      content TEXT NOT NULL,
      token_count INTEGER NOT NULL,
      embedding BLOB,
      FOREIGN KEY (page_id) REFERENCES book_pages(id)
    );

    CREATE INDEX IF NOT EXISTS idx_rag_chunks_page ON rag_chunks(page_id);
  `);
}

/**
 * Upserts a book metadata record into the books table
 */
export function upsertCanonicalBook(book: CanonicalBook): void {
  const db = getCanonicalDb();
  const stmt = db.prepare(`
    INSERT INTO books (
      id, slug, title, urdu_title, author, author_slug, collection, collection_slug,
      language, cover_url, total_pages, alislam_url, source_url, crawled_at
    ) VALUES (
      @id, @slug, @title, @urdu_title, @author, @author_slug, @collection, @collection_slug,
      @language, @cover_url, @total_pages, @alislam_url, @source_url, @crawled_at
    )
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      urdu_title = excluded.urdu_title,
      author = excluded.author,
      collection = excluded.collection,
      total_pages = excluded.total_pages,
      cover_url = excluded.cover_url,
      alislam_url = excluded.alislam_url,
      crawled_at = excluded.crawled_at
  `);
  stmt.run({
    ...book,
    urdu_title: book.urdu_title || null,
    author_slug: book.author_slug || null,
    collection: book.collection || null,
    collection_slug: book.collection_slug || null,
    cover_url: book.cover_url || null,
    alislam_url: book.alislam_url || null,
    crawled_at: book.crawled_at || Date.now()
  });
}

/**
 * Inserts a batch of book pages and indexes them in FTS5 and RAG chunk tables
 */
export function insertPagesBatch(pages: CanonicalPageInsert[]): void {
  if (pages.length === 0) return;
  const db = getCanonicalDb();

  const insertPageStmt = db.prepare(`
    INSERT OR REPLACE INTO book_pages (id, book_slug, page_num, text_raw, text_norm, alislam_scan_url, word_count)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const deleteFtsStmt = db.prepare(`
    DELETE FROM book_pages_fts WHERE page_id = ?
  `);

  const insertFtsStmt = db.prepare(`
    INSERT INTO book_pages_fts (page_id, book_slug, page_num, title, author, collection, content, content_window)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertChunkStmt = db.prepare(`
    INSERT OR REPLACE INTO rag_chunks (id, page_id, book_slug, page_num, chunk_index, content, token_count)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction((items: CanonicalPageInsert[]) => {
    for (const p of items) {
      const pageId = `${p.book_slug}:${p.page_num}`;

      // 1. Raw page storage
      insertPageStmt.run(
        pageId,
        p.book_slug,
        p.page_num,
        p.text_raw,
        p.text_norm,
        p.alislam_scan_url || null,
        p.word_count
      );

      // 2. FTS5 index update
      deleteFtsStmt.run(pageId);
      insertFtsStmt.run(
        pageId,
        p.book_slug,
        p.page_num,
        p.title,
        p.author,
        p.collection || '',
        p.text_norm,
        p.content_window || p.text_norm
      );

      // 3. RAG Semantic Chunking (Small-to-big child chunks: ~120 words each)
      const words = p.text_raw.split(/\s+/).filter(Boolean);
      const chunkSize = 120;
      let chunkIdx = 0;

      for (let i = 0; i < words.length; i += chunkSize) {
        const chunkText = words.slice(i, i + chunkSize).join(' ');
        const chunkId = `${pageId}:${chunkIdx}`;
        insertChunkStmt.run(
          chunkId,
          pageId,
          p.book_slug,
          p.page_num,
          chunkIdx,
          chunkText,
          Math.ceil(chunkText.length / 4)
        );
        chunkIdx++;
      }
    }
  });

  tx(pages);
}

/**
 * Normalizes text for search, removing diacritics, extra spaces, and normalizing Urdu/Arabic
 */
export function normalizeTheologicalText(str: string): string {
  if (!str) return '';
  return str
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove Arabic tashkeel / vowels
    .replace(/[\u06D6-\u06ED]/g, '')       // Quranic annotation signs
    .replace(/[\u0610-\u061A]/g, '')
    .replace(/[يى]/g, 'ی')
    .replace(/[ك]/g, 'ک')
    .replace(/[ة]/g, 'ہ')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Builds an optimized FTS5 query string with dynamic term-length fuzziness
 * - Disables fuzziness for words <= 4 letters ("Nur", "Dua", "Adl") to prevent garbage matches
 * - Enables prefix search on words >= 5 letters
 */
function buildFtsQuery(rawQuery: string): string {
  const clean = rawQuery
    .replace(/["'*^$(){}[\]:;+~]/g, ' ')
    .trim();

  if (!clean) return '';

  const words = clean.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return '';

  // Transform each term based on word length
  const terms: string[] = [];
  for (const w of words) {
    if (w.length <= 4) {
      // Exact term only
      terms.push(`"${w}"`);
    } else {
      // Word prefix wildcard
      terms.push(`"${w}"*`);
    }
  }

  return terms.join(' AND ');
}

/**
 * Executes high-performance FTS5 full-text search across all canonical books and pages
 */
export function searchCanonicalFTS(
  query: string,
  options?: CanonicalSearchOptions
): CanonicalSearchResult[] {
  const db = getCanonicalDb();
  const ftsQuery = buildFtsQuery(query);
  if (!ftsQuery) return [];

  const limit = options?.limit || 40;
  const whereClauses: string[] = ['book_pages_fts MATCH ?'];
  const params: any[] = [ftsQuery];

  if (options?.bookSlug) {
    whereClauses.push('book_pages_fts.book_slug = ?');
    params.push(options.bookSlug);
  }

  if (options?.author && options.author !== 'all') {
    whereClauses.push('LOWER(book_pages_fts.author) LIKE ?');
    params.push(`%${options.author.toLowerCase()}%`);
  }

  if (options?.collection && options.collection !== 'all') {
    whereClauses.push('LOWER(book_pages_fts.collection) LIKE ?');
    params.push(`%${options.collection.toLowerCase()}%`);
  }

  // Structural column weights: title * 3.5, collection * 2.5, content * 1.0
  const sql = `
    SELECT
      f.page_id AS pageId,
      f.book_slug AS bookSlug,
      f.page_num AS pageNum,
      f.title AS title,
      f.author AS author,
      f.collection AS collection,
      snippet(book_pages_fts, 6, '<mark class="bg-[var(--accent-main)]/30 text-white px-0.5 rounded">', '</mark>', '...', 28) AS snippet,
      p.text_raw AS textRaw,
      p.alislam_scan_url AS alislamScanUrl,
      p.word_count AS wordCount,
      bm25(book_pages_fts, 0.0, 0.0, 0.0, 3.5, 1.5, 2.5, 1.0, 1.0) AS rank
    FROM book_pages_fts f
    JOIN book_pages p ON f.page_id = p.id
    WHERE ${whereClauses.join(' AND ')}
    ORDER BY rank ASC
    LIMIT ?
  `;

  params.push(limit);

  try {
    const rows = db.prepare(sql).all(...params) as any[];
    return rows.map(r => ({
      pageId: r.pageId,
      bookSlug: r.bookSlug,
      title: r.title,
      author: r.author,
      collection: r.collection || undefined,
      pageNum: r.pageNum,
      snippet: r.snippet || (r.textRaw ? r.textRaw.slice(0, 180) + '...' : ''),
      textRaw: r.textRaw || '',
      alislamScanUrl: r.alislamScanUrl || undefined,
      wordCount: r.wordCount || 0,
      rank: r.rank
    }));
  } catch (err) {
    console.warn('[Canonical DB] FTS Search error:', err);
    return [];
  }
}

/**
 * Searches exclusively within a single book (for in-reader search)
 */
export function searchWithinBook(
  slug: string,
  query: string,
  limit = 50
): { pageNum: number; snippet: string; alislamScanUrl?: string }[] {
  const db = getCanonicalDb();
  const ftsQuery = buildFtsQuery(query);
  if (!ftsQuery || !slug) return [];

  const sql = `
    SELECT
      f.page_num AS pageNum,
      snippet(book_pages_fts, 6, '<mark class="bg-amber-400/30 text-white font-bold px-0.5 rounded">', '</mark>', '...', 25) AS snippet,
      p.alislam_scan_url AS alislamScanUrl
    FROM book_pages_fts f
    JOIN book_pages p ON f.page_id = p.id
    WHERE book_pages_fts MATCH ? AND f.book_slug = ?
    ORDER BY f.page_num ASC
    LIMIT ?
  `;

  try {
    const rows = db.prepare(sql).all(ftsQuery, slug, limit) as any[];
    return rows.map(r => ({
      pageNum: r.pageNum,
      snippet: r.snippet,
      alislamScanUrl: r.alislamScanUrl || undefined
    }));
  } catch (err) {
    console.warn('[Canonical DB] In-book search error:', err);
    return [];
  }
}

/**
 * Retrieves a single page text directly from local SQLite database (0ms lookup)
 */
export function getCanonicalPage(
  slug: string,
  pageNum: number
): { text: string; alislamUrl?: string; totalPages: number; title: string; author: string } | null {
  const db = getCanonicalDb();
  const pageId = `${slug}:${pageNum}`;

  const pageRow = db
    .prepare(`
      SELECT p.text_raw, p.alislam_scan_url, b.total_pages, b.title, b.author
      FROM book_pages p
      JOIN books b ON p.book_slug = b.slug
      WHERE p.id = ?
    `)
    .get(pageId) as any;

  if (!pageRow) return null;

  return {
    text: pageRow.text_raw,
    alislamUrl: pageRow.alislam_scan_url || undefined,
    totalPages: pageRow.total_pages || 1,
    title: pageRow.title,
    author: pageRow.author
  };
}

/**
 * Checks if a book has been crawled into the database
 */
export function isBookCrawled(slug: string): boolean {
  const db = getCanonicalDb();
  const row = db.prepare('SELECT 1 FROM books WHERE slug = ? AND total_pages > 0').get(slug);
  return Boolean(row);
}

/**
 * Returns overall statistics for the canonical library
 */
export function getLibraryStats(): {
  totalBooks: number;
  crawledBooks: number;
  totalPagesIndexed: number;
  totalChunks: number;
} {
  const db = getCanonicalDb();
  const booksCount = (db.prepare('SELECT count(*) as count FROM books').get() as any)?.count || 0;
  const crawledBooksCount = (db.prepare('SELECT count(*) as count FROM books WHERE total_pages > 0').get() as any)?.count || 0;
  const pagesCount = (db.prepare('SELECT count(*) as count FROM book_pages').get() as any)?.count || 0;
  const chunksCount = (db.prepare('SELECT count(*) as count FROM rag_chunks').get() as any)?.count || 0;

  return {
    totalBooks: booksCount,
    crawledBooks: crawledBooksCount,
    totalPagesIndexed: pagesCount,
    totalChunks: chunksCount
  };
}
