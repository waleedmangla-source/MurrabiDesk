import fs from 'fs';
import path from 'path';
import https from 'https';
import * as cheerio from 'cheerio';
import Database from 'better-sqlite3';

const ROOT_DIR = process.cwd();
const DATA_DIR = path.resolve(ROOT_DIR, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.resolve(DATA_DIR, 'canonical-corpus.db');
const PROGRESS_PATH = path.resolve(ROOT_DIR, 'src/data/research/ingestion-progress.json');
const BOOKS_CATALOG_PATH = path.resolve(ROOT_DIR, 'src/data/research/ahmadiyya-books.json');

// 1. Initialize SQLite Database
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('temp_store = MEMORY');

// Ensure tables exist
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
    id TEXT PRIMARY KEY,
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
    id TEXT PRIMARY KEY,
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

// Prepared Statements
const insertBookStmt = db.prepare(`
  INSERT INTO books (
    id, slug, title, urdu_title, author, author_slug, collection, collection_slug,
    language, cover_url, total_pages, alislam_url, source_url, crawled_at
  ) VALUES (
    @id, @slug, @title, @urdu_title, @author, @author_slug, @collection, @collection_slug,
    @language, @cover_url, @total_pages, @alislam_url, @source_url, @crawled_at
  )
  ON CONFLICT(slug) DO UPDATE SET
    total_pages = excluded.total_pages,
    crawled_at = excluded.crawled_at
`);

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

function normalizeTheologicalText(str) {
  if (!str) return '';
  return str
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[\u06D6-\u06ED]/g, '')
    .replace(/[\u0610-\u061A]/g, '')
    .replace(/[يى]/g, 'ی')
    .replace(/[ك]/g, 'ک')
    .replace(/[ة]/g, 'ہ')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function fetchBookHtml(slug) {
  const url = `https://ahmadiyyabooks.com/book/${encodeURIComponent(slug)}/`;
  return new Promise((resolve, reject) => {
    function makeRequest(targetUrl, redirectsRemaining = 3) {
      if (redirectsRemaining < 0) return reject(new Error('Too many redirects'));

      const req = https.get(
        targetUrl,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          maxHeaderSize: 256000
        },
        res => {
          if (res.statusCode && [301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
            const redirectUrl = res.headers.location.startsWith('http')
              ? res.headers.location
              : `https://ahmadiyyabooks.com${res.headers.location}`;
            return makeRequest(redirectUrl, redirectsRemaining - 1);
          }

          if (res.statusCode && res.statusCode >= 400) {
            return reject(new Error(`HTTP ${res.statusCode}`));
          }

          let html = '';
          res.on('data', chunk => {
            html += chunk;
          });
          res.on('end', () => resolve(html));
        }
      );

      req.on('error', reject);
      req.setTimeout(30000, () => {
        req.destroy(new Error('Request timed out'));
      });
    }

    makeRequest(url);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main Ingestion Loop
async function run() {
  const args = process.argv.slice(2);
  const isStage1Only = args.includes('--stage=1') || args.includes('--priority');
  const limitArg = args.find(a => a.startsWith('--limit='));
  const maxLimit = limitArg ? parseInt(limitArg.split('=')[1], 10) : null;

  console.log('====================================================');
  console.log('📖 Canonical Library Ingestion Engine (AhmadiyyaBooks.com)');
  console.log(`Mode: ${isStage1Only ? 'Stage 1 (Priority Works)' : 'Full Library'}`);
  console.log('====================================================\n');

  const booksCatalog = JSON.parse(fs.readFileSync(BOOKS_CATALOG_PATH, 'utf8'));

  // Load progress
  let progress = {
    crawledSlugs: [],
    failedSlugs: {},
    totalPagesIndexed: 0,
    lastRunAt: Date.now()
  };

  if (fs.existsSync(PROGRESS_PATH)) {
    try {
      progress = JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf8'));
    } catch (e) {}
  }

  const crawledSet = new Set(progress.crawledSlugs || []);

  // Filter and prioritize
  let booksToCrawl = booksCatalog.filter(b => !crawledSet.has(b.slug));

  if (isStage1Only) {
    // Priority filter: Promised Messiah, Khulafa, Tafseer, Khutbat, Anwar-ul-Uloom
    booksToCrawl = booksToCrawl.filter(b => {
      const author = (b.author || '').toLowerCase();
      const coll = (b.collection || '').toLowerCase();
      const title = (b.title || '').toLowerCase();
      return (
        author.includes('ghulam ahmad') ||
        author.includes('khalifatul masih') ||
        coll.includes('tafseer') ||
        coll.includes('khutbat') ||
        coll.includes('anwar') ||
        title.includes('philosophy') ||
        title.includes('jesus') ||
        title.includes('barahin')
      );
    });
  }

  if (maxLimit && maxLimit > 0) {
    booksToCrawl = booksToCrawl.slice(0, maxLimit);
  }

  console.log(`Books in catalog: ${booksCatalog.length}`);
  console.log(`Already crawled: ${crawledSet.size}`);
  console.log(`Queued to crawl: ${booksToCrawl.length}\n`);

  let processedCount = 0;
  let newPagesCount = 0;

  for (const book of booksToCrawl) {
    processedCount++;
    console.log(`[${processedCount}/${booksToCrawl.length}] Crawling: "${book.title}" (${book.slug})...`);

    try {
      const html = await fetchBookHtml(book.slug);
      const $ = cheerio.load(html);

      const parsedPages = [];
      $('[id^="page-"]').each((_, el) => {
        const id = $(el).attr('id') || '';
        const pageNum = parseInt(id.replace('page-', ''), 10);
        if (isNaN(pageNum)) return;

        const textContainer = $(el).find('[class*="css-1ysoveq"], .MuiBox-root').first();
        const textRaw = (textContainer.length ? textContainer.text() : $(el).text())
          .replace(/Page\s+\d+/i, '')
          .replace(/Original source:.*$/i, '')
          .trim();

        if (!textRaw) return;

        const alislamScanUrl = $(el).find('a[href*="alislam.org"]').attr('href');
        parsedPages.push({
          pageNum,
          textRaw,
          textNorm: normalizeTheologicalText(textRaw),
          alislamScanUrl: alislamScanUrl || book.alislamUrl || `https://www.alislam.org/book/${book.slug}/`,
          wordCount: textRaw.split(/\s+/).filter(Boolean).length
        });
      });

      // Sort pages ascending
      parsedPages.sort((a, b) => a.pageNum - b.pageNum);

      if (parsedPages.length === 0) {
        console.log(`  ⚠️ No pages extracted for ${book.slug}`);
        continue;
      }

      // Upsert book metadata
      insertBookStmt.run({
        id: book.id || `book-${book.slug}`,
        slug: book.slug,
        title: book.title,
        urdu_title: null,
        author: book.author || 'Ahmadiyya Author',
        author_slug: book.authorSlug || null,
        collection: book.collection || null,
        collection_slug: book.collectionSlug || null,
        language: book.language || 'ur',
        cover_url: book.coverUrl || null,
        total_pages: parsedPages.length,
        alislam_url: book.alislamUrl || null,
        source_url: book.url || `https://ahmadiyyabooks.com/book/${book.slug}/`,
        crawled_at: Date.now()
      });

      // Batch insert pages in transaction with sliding window
      const tx = db.transaction(() => {
        for (let i = 0; i < parsedPages.length; i++) {
          const cur = parsedPages[i];
          const pageId = `${book.slug}:${cur.pageNum}`;

          // Sliding window: Append first 50 words from next page if exists
          let contentWindow = cur.textNorm;
          if (i + 1 < parsedPages.length) {
            const nextWords = parsedPages[i + 1].textNorm.split(/\s+/).slice(0, 50).join(' ');
            contentWindow = `${cur.textNorm} ${nextWords}`;
          }

          insertPageStmt.run(
            pageId,
            book.slug,
            cur.pageNum,
            cur.textRaw,
            cur.textNorm,
            cur.alislamScanUrl,
            cur.wordCount
          );

          deleteFtsStmt.run(pageId);
          insertFtsStmt.run(
            pageId,
            book.slug,
            cur.pageNum,
            book.title,
            book.author || 'Ahmadiyya Author',
            book.collection || '',
            cur.textNorm,
            contentWindow
          );

          // RAG semantic chunks
          const words = cur.textRaw.split(/\s+/).filter(Boolean);
          const chunkSize = 120;
          let chunkIdx = 0;
          for (let w = 0; w < words.length; w += chunkSize) {
            const chunkText = words.slice(w, w + chunkSize).join(' ');
            const chunkId = `${pageId}:${chunkIdx}`;
            insertChunkStmt.run(
              chunkId,
              pageId,
              book.slug,
              cur.pageNum,
              chunkIdx,
              chunkText,
              Math.ceil(chunkText.length / 4)
            );
            chunkIdx++;
          }
        }
      });

      tx();

      newPagesCount += parsedPages.length;
      crawledSet.add(book.slug);
      progress.crawledSlugs = Array.from(crawledSet);
      progress.totalPagesIndexed = (progress.totalPagesIndexed || 0) + parsedPages.length;
      progress.lastRunAt = Date.now();

      fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));

      console.log(`  ✓ Indexed ${parsedPages.length} pages in SQLite FTS5 (Total indexed: ${progress.totalPagesIndexed})`);

      // Polite delay between requests to prevent rate limiting
      await sleep(400);
    } catch (err) {
      console.error(`  ❌ Failed to crawl ${book.slug}: ${err.message}`);
      progress.failedSlugs = progress.failedSlugs || {};
      progress.failedSlugs[book.slug] = err.message;
      fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2));
      await sleep(1000);
    }
  }

  console.log('\n====================================================');
  console.log(`🎉 Ingestion session complete!`);
  console.log(`Processed: ${processedCount} books`);
  console.log(`New pages indexed: ${newPagesCount}`);
  console.log(`Total canonical pages in DB: ${progress.totalPagesIndexed}`);
  console.log('====================================================');
}

run().catch(err => {
  console.error('Fatal crawler error:', err);
  process.exit(1);
});
