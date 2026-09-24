// Live Federated External Knowledge Fetcher for Ahmadiyya Archives
// Connects Murabbi Desk to official online APIs and search endpoints (alhakam.org, reviewofreligions.org, alislam.org)
import * as cheerio from 'cheerio';
import { PublicationResult, AlIslamArticleResult } from './research-sources';

const DEFAULT_TIMEOUT_MS = 3800;
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

/**
 * Fetches real-time search results directly from the official Al Hakam Search API (alhakam.org/api/search)
 */
export async function fetchLiveAlHakam(
  query: string,
  page: number = 0
): Promise<{ results: PublicationResult[]; totalHits: number; totalPages: number }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    const encoded = encodeURIComponent(query);
    const res = await fetch(`https://www.alhakam.org/api/search?q=${encoded}&page=${page}`, {
      headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
      signal: controller.signal
    }).then(r => r.ok ? r.json() : null).catch(() => null);

    clearTimeout(timeoutId);

    const totalHits = res?.totalHits ?? 0;
    const totalPages = res?.totalPages ?? (totalHits > 0 ? Math.ceil(totalHits / 10) : 0);
    const rawItems = res?.results || [];
    const seenUrls = new Set<string>();
    const publications: PublicationResult[] = [];

    for (const item of rawItems) {
      if (!item || !item.title) continue;
      const slug = item.slug || '';
      const url = slug ? `https://www.alhakam.org/${slug}` : 'https://www.alhakam.org';
      if (seenUrls.has(url)) continue;
      seenUrls.add(url);

      // Clean snippet HTML entities/tags
      const cleanSnippet = (item.snippet || '')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#8217;/g, "'")
        .replace(/&#8216;/g, "'")
        .replace(/&#8220;/g, '"')
        .replace(/&#8221;/g, '"')
        .replace(/&#8211;/g, '-')
        .replace(/&#8212;/g, '—')
        .replace(/&#8230;/g, '…')
        .trim();

      publications.push({
        id: `alhakam-${item.postId || item.objectID || (page * 10 + publications.length + 1)}`,
        source: 'Al Hakam',
        title: item.title,
        summary: cleanSnippet || `Al Hakam publication exploring "${item.title}".`,
        url,
        date: item.date,
        topics: [query, item.category || 'Al Hakam Archive']
      });
    }

    return { results: publications, totalHits, totalPages };
  } catch (err) {
    console.warn('[External Sources] Failed to fetch live Al Hakam:', err);
    return { results: [], totalHits: 0, totalPages: 0 };
  }
}

/**
 * Fetches real-time search results directly from Review of Religions (reviewofreligions.org)
 * Supports pagination, category extraction, publication dates, and total page estimation.
 */
export async function fetchLiveReviewOfReligions(
  query: string,
  page: number = 1
): Promise<{ results: PublicationResult[]; totalHits: number; totalPages: number }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    const encoded = encodeURIComponent(query);
    const targetUrl = page <= 1
      ? `https://www.reviewofreligions.org/?s=${encoded}`
      : `https://www.reviewofreligions.org/page/${page}/?s=${encoded}`;

    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    if (!res.ok) return { results: [], totalHits: 0, totalPages: 0 };

    const html = await res.text();
    const $ = cheerio.load(html);

    // Extract maximum page number from pagination links
    let maxPage = 1;
    $('.page-numbers, .pagination a, .herald-pagination a, a.page-numbers, span.page-numbers').each((_, el) => {
      const txt = $(el).text().trim().replace(/,/g, '');
      const num = parseInt(txt, 10);
      if (!isNaN(num) && num > maxPage) {
        maxPage = num;
      }
    });

    const publications: PublicationResult[] = [];
    const seenUrls = new Set<string>();

    $('h2.entry-title').each((_, el) => {
      const $a = $(el).find('a').first();
      const title = $a.text().trim();
      const href = $a.attr('href');
      if (!href || seenUrls.has(href)) return;
      seenUrls.add(href);

      const header = $(el).closest('.entry-header');
      const parentCol = header.length > 0 ? header.parent() : $(el).parent();

      const category = header.find('.meta-category a').first().text().trim() || 'Review of Religions';
      const date = header.find('.herald-date .updated, .entry-meta .updated, time').first().text().trim();
      const snippet = parentCol.find('.entry-content, p').first().text().trim();

      publications.push({
        id: `ror-${href.replace(/[^a-zA-Z0-9]/g, '-')}`,
        source: 'Review of Religions',
        title,
        summary: snippet || `Review of Religions treatise exploring "${title}".`,
        url: href,
        date: date || undefined,
        topics: [query, category]
      });
    });

    // Review of Religions serves 30 articles per page
    const totalHits = maxPage * 30;
    return { results: publications, totalHits, totalPages: maxPage };
  } catch (err) {
    console.warn('[External Sources] Failed to fetch live Review of Religions:', err);
    return { results: [], totalHits: 0, totalPages: 0 };
  }
}

/**
 * Fetches real-time search results directly from Al Islam (alislam.org)
 * Supports pagination, taxonomy/category detection, dates, and older/newer entries.
 */
export async function fetchLiveAlIslam(
  query: string,
  page: number = 1
): Promise<{ results: AlIslamArticleResult[]; totalHits: number; totalPages: number }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    const encoded = encodeURIComponent(query);
    const targetUrl = page <= 1
      ? `https://www.alislam.org/?s=${encoded}`
      : `https://www.alislam.org/page/${page}/?s=${encoded}`;

    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    if (!res.ok) return { results: [], totalHits: 0, totalPages: 0 };

    const html = await res.text();
    const $ = cheerio.load(html);

    const hasOlder = $('div.navigation .alignleft a').length > 0;
    const totalPages = hasOlder ? Math.max(page + 1, 10) : page;

    const articles: AlIslamArticleResult[] = [];
    const seenUrls = new Set<string>();

    $('div.hentry, article, .search-result').each((_, el) => {
      const $a = $(el).find('h3 a, h2 a, a[rel="bookmark"]').first();
      const title = $a.text().trim();
      const href = $a.attr('href');
      if (!href || seenUrls.has(href)) return;
      seenUrls.add(href);

      const date = $(el).find('small, .entry-date, time').first().text().trim();
      const classAttr = $(el).attr('class') || '';

      let category: AlIslamArticleResult['category'] = 'Article';
      if (classAttr.includes('type-question') || href.includes('/question/')) category = 'Q&A';
      else if (classAttr.includes('type-video') || href.includes('/video/')) category = 'Video';
      else if (classAttr.includes('type-book') || href.includes('/book/')) category = 'Book';
      else if (classAttr.includes('type-sermon') || href.includes('/sermon/')) category = 'Friday Sermon';
      else if (href.includes('/topics/')) category = 'Topic Portal';

      const snippet = $(el).find('.entry-content, .postmetadata, p').first().text().trim();

      articles.push({
        id: `alislam-${href.replace(/[^a-zA-Z0-9]/g, '-')}`,
        title,
        category,
        summary: snippet && snippet.length > 15 ? snippet : `Al Islam resource detailing "${title}".`,
        url: href,
        date: date || undefined,
        topics: [query, category]
      });
    });

    const totalHits = totalPages * (articles.length || 20);
    return { results: articles, totalHits, totalPages };
  } catch (err) {
    console.warn('[External Sources] Failed to fetch live Al Islam:', err);
    return { results: [], totalHits: 0, totalPages: 0 };
  }
}

/**
 * Fetches real-time search results directly from Daily / Weekly Al Fazl International (alfazl.com)
 * Official Urdu organ and periodical archive of the Ahmadiyya Muslim Community.
 * Parses .post-item elements, titles, dates, excerpts, and pagination.
 */
export async function fetchLiveAlFazl(
  query: string,
  page: number = 1
): Promise<{ results: PublicationResult[]; totalHits: number; totalPages: number }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const cleanQuery = query.trim();
    if (!cleanQuery) return { results: [], totalHits: 0, totalPages: 0 };

    const encoded = encodeURIComponent(cleanQuery);
    const targetUrl = page <= 1
      ? `https://alfazl.com/?s=${encoded}`
      : `https://alfazl.com/page/${page}/?s=${encoded}`;

    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ur,en-US,en;q=0.9'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    if (!res.ok) return { results: [], totalHits: 0, totalPages: 0 };

    const html = await res.text();
    const $ = cheerio.load(html);

    // Extract maximum page number from pagination links
    let maxPage = 1;
    $('a[href*="/page/"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const match = href.match(/\/page\/(\d+)\//);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxPage) {
          maxPage = num;
        }
      }
    });

    const publications: PublicationResult[] = [];
    const seenUrls = new Set<string>();

    $('li.post-item, .post-item').each((_, el) => {
      const $titleA = $(el).find('h2.post-title a').first();
      const title = $titleA.text().trim();
      const href = $titleA.attr('href');
      if (!title || !href || seenUrls.has(href)) return;
      seenUrls.add(href);

      const category = $(el).find('.post-cat').first().text().trim() || 'Al Fazl International';
      const date = $(el).find('.date.meta-item, .post-meta .date').first().text().trim();
      const rawExcerpt = $(el).find('p.post-excerpt').first().text().trim();

      const cleanSnippet = rawExcerpt
        .replace(/&hellip;/g, '...')
        .replace(/&nbsp;/g, ' ')
        .trim();

      // Extract numeric post ID from class (e.g. "post-152712")
      const classAttr = $(el).attr('class') || '';
      const idMatch = classAttr.match(/post-(\d+)/);
      const postId = idMatch ? idMatch[1] : href.replace(/[^a-zA-Z0-9]/g, '-');

      publications.push({
        id: `alfazl-${postId}`,
        source: 'Al Fazl',
        title,
        summary: cleanSnippet || `روزنامہ الفضل انٹرنیشنل: ${title}`,
        url: href,
        date: date || undefined,
        topics: [cleanQuery, category]
      });
    });

    const totalHits = maxPage * (publications.length || 10);
    return { results: publications, totalHits, totalPages: maxPage };
  } catch (err) {
    console.warn('[External Sources] Failed to fetch live Al Fazl:', err);
    return { results: [], totalHits: 0, totalPages: 0 };
  }
}

/**
 * Unified multi-source article searcher:
 * Queries all supported article publications (Al Hakam, Review of Religions, Al Fazl, Al Islam)
 * with standardized pagination and metadata.
 */
export async function fetchAllLiveArticles(
  query: string,
  pageIndex: number = 0,
  urduQuery?: string
): Promise<{
  publications: PublicationResult[];
  alislamArticles: AlIslamArticleResult[];
  totalAlHakamHits: number;
  totalRoRHits: number;
  totalAlFazlHits: number;
  totalAlIslamHits: number;
  totalArticleHits: number;
  totalPagesAlHakam: number;
  totalPagesRoR: number;
  totalPagesAlFazl: number;
  totalPagesAlIslam: number;
  totalPages: number;
}> {
  const humanPage = pageIndex + 1;
  const effectiveUrduQuery = urduQuery || query;

  const [alHakamData, rorData, alFazlData, alIslamData] = await Promise.all([
    fetchLiveAlHakam(query, pageIndex),
    fetchLiveReviewOfReligions(query, humanPage),
    fetchLiveAlFazl(effectiveUrduQuery, humanPage),
    fetchLiveAlIslam(query, humanPage)
  ]);

  const publications: PublicationResult[] = [
    ...alHakamData.results,
    ...rorData.results,
    ...alFazlData.results
  ];

  const totalAlHakamHits = alHakamData.totalHits;
  const totalRoRHits = rorData.totalHits;
  const totalAlFazlHits = alFazlData.totalHits;
  const totalAlIslamHits = alIslamData.totalHits;
  const totalArticleHits = totalAlHakamHits + totalRoRHits + totalAlFazlHits + totalAlIslamHits;
  const totalPages = Math.max(
    alHakamData.totalPages,
    rorData.totalPages,
    alFazlData.totalPages,
    alIslamData.totalPages
  );

  return {
    publications,
    alislamArticles: alIslamData.results,
    totalAlHakamHits,
    totalRoRHits,
    totalAlFazlHits,
    totalAlIslamHits,
    totalArticleHits,
    totalPagesAlHakam: alHakamData.totalPages,
    totalPagesRoR: rorData.totalPages,
    totalPagesAlFazl: alFazlData.totalPages,
    totalPagesAlIslam: alIslamData.totalPages,
    totalPages
  };
}
