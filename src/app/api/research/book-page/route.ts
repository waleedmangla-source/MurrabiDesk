import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import * as cheerio from 'cheerio';
import rawAhmadiyyaBooks from '@/data/research/ahmadiyya-books.json';
import { getCanonicalPage } from '@/lib/canonical-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface BookPageData {
  pageNum: number;
  text: string;
  alislamUrl?: string;
}

interface CachedBook {
  title: string;
  author: string;
  totalPages: number;
  pages: Map<number, BookPageData>;
  cachedAt: number;
}

// In-memory cache for loaded books to provide instantaneous page turns
const bookCache = new Map<string, CachedBook>();
const MAX_CACHE_ENTRIES = 60;
const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

// Quick lookup from pre-compiled catalog metadata
const catalogLookup = new Map<string, { title: string; author: string; coverUrl?: string; alislamUrl?: string }>();
for (const b of rawAhmadiyyaBooks as any[]) {
  if (b.slug) {
    catalogLookup.set(b.slug.toLowerCase(), {
      title: b.title,
      author: b.author,
      coverUrl: b.coverUrl,
      alislamUrl: b.alislamUrl
    });
  }
}

async function fetchAhmadiyyaBookHtml(slug: string): Promise<string> {
  const url = `https://ahmadiyyabooks.com/book/${encodeURIComponent(slug)}/`;

  return new Promise((resolve, reject) => {
    function makeRequest(targetUrl: string, redirectsRemaining = 3) {
      if (redirectsRemaining < 0) {
        return reject(new Error('Too many redirects when loading book'));
      }

      const req = https.get(
        targetUrl,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,ur;q=0.8,ar;q=0.7'
          },
          // Required due to huge Link preload headers from ahmadiyyabooks.com
          maxHeaderSize: 256000
        },
        res => {
          // Handle 301, 302, 307, 308 redirects
          if (
            res.statusCode &&
            [301, 302, 307, 308].includes(res.statusCode) &&
            res.headers.location
          ) {
            const redirectUrl = res.headers.location.startsWith('http')
              ? res.headers.location
              : `https://ahmadiyyabooks.com${res.headers.location}`;
            return makeRequest(redirectUrl, redirectsRemaining - 1);
          }

          if (res.statusCode && res.statusCode >= 400) {
            return reject(new Error(`Failed to fetch book from AhmadiyyaBooks.com: HTTP ${res.statusCode}`));
          }

          let html = '';
          res.on('data', chunk => {
            html += chunk;
          });
          res.on('end', () => {
            resolve(html);
          });
        }
      );

      req.on('error', err => {
        reject(err);
      });

      req.setTimeout(25000, () => {
        req.destroy(new Error('Request timed out while loading book text'));
      });
    }

    makeRequest(url);
  });
}

function parseBookHtml(slug: string, html: string): CachedBook {
  const $ = cheerio.load(html);

  const fallback = catalogLookup.get(slug.toLowerCase());
  const parsedTitle = $('h1').first().text().trim() || $('title').text().split('|')[0].trim() || fallback?.title || slug;
  const parsedAuthor = fallback?.author || 'Ahmadiyya Author';

  const pages = new Map<number, BookPageData>();

  $('[id^="page-"]').each((_, el) => {
    const id = $(el).attr('id') || '';
    const pageNum = parseInt(id.replace('page-', ''), 10);
    if (isNaN(pageNum)) return;

    // The inner container with text typically has class containing 'css-1ysoveq' or is inside paper
    const textContainer = $(el).find('[class*="css-1ysoveq"], .MuiBox-root').first();
    const text = (textContainer.length ? textContainer.text() : $(el).text())
      .replace(/Page\s+\d+/i, '')
      .replace(/Original source:.*$/i, '')
      .trim();

    const alislamLink = $(el).find('a[href*="alislam.org"]').attr('href');

    pages.set(pageNum, {
      pageNum,
      text,
      alislamUrl: alislamLink || fallback?.alislamUrl || `https://www.alislam.org/book/${slug}/`
    });
  });

  const totalPages = pages.size;

  return {
    title: parsedTitle,
    author: parsedAuthor,
    totalPages,
    pages,
    cachedAt: Date.now()
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = (searchParams.get('slug') || '').trim();
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    const requestedPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

    if (!slug) {
      return NextResponse.json({ error: 'Book slug parameter is required' }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9_-]/g, '');

    // 1. Fast-path: Check local SQLite canonical database (0ms lookup)
    try {
      const localPage = getCanonicalPage(cleanSlug, requestedPage);
      if (localPage) {
        const catalogMeta = catalogLookup.get(cleanSlug);
        return NextResponse.json({
          success: true,
          slug: cleanSlug,
          title: localPage.title || catalogMeta?.title || cleanSlug,
          author: localPage.author || catalogMeta?.author || 'Ahmadiyya Author',
          pageNum: requestedPage,
          totalPages: localPage.totalPages || 1,
          text: localPage.text,
          alislamUrl: localPage.alislamUrl || catalogMeta?.alislamUrl || `https://www.alislam.org/book/${cleanSlug}/`,
          sourceUrl: `https://ahmadiyyabooks.com/book/${cleanSlug}/`,
          coverUrl: catalogMeta?.coverUrl
        });
      }
    } catch (e) {
      // Fall through to memory cache / live fetch
    }

    // 2. Check memory cache or live scrape fallback
    let cachedBook = bookCache.get(cleanSlug);
    const isExpired = cachedBook && Date.now() - cachedBook.cachedAt > CACHE_TTL_MS;

    if (!cachedBook || isExpired) {
      const html = await fetchAhmadiyyaBookHtml(cleanSlug);
      cachedBook = parseBookHtml(cleanSlug, html);

      // LRU eviction
      if (bookCache.size >= MAX_CACHE_ENTRIES) {
        const oldestKey = bookCache.keys().next().value;
        if (oldestKey) bookCache.delete(oldestKey);
      }
      bookCache.set(cleanSlug, cachedBook);
    }

    const totalPages = cachedBook.totalPages;
    const clampedPage = Math.min(Math.max(1, requestedPage), totalPages || 1);
    const pageData = cachedBook.pages.get(clampedPage);

    const catalogMeta = catalogLookup.get(cleanSlug);

    return NextResponse.json({
      success: true,
      slug: cleanSlug,
      title: cachedBook.title,
      author: cachedBook.author,
      pageNum: clampedPage,
      totalPages: totalPages || 1,
      text: pageData?.text || 'No text extracted for this page.',
      alislamUrl: pageData?.alislamUrl || catalogMeta?.alislamUrl || `https://www.alislam.org/book/${cleanSlug}/`,
      sourceUrl: `https://ahmadiyyabooks.com/book/${cleanSlug}/`,
      coverUrl: catalogMeta?.coverUrl
    });
  } catch (err: any) {
    console.error('[Book Page API Error]:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to retrieve book page'
      },
      { status: 500 }
    );
  }
}
