// Live Federated External Knowledge Fetcher for Ahmadiyya Archives
// Connects Murabbi Desk to official online APIs and search endpoints (alhakam.org, reviewofreligions.org, alislam.org)
import * as cheerio from 'cheerio';
import { PublicationResult, AlIslamArticleResult } from './research-sources';

const DEFAULT_TIMEOUT_MS = 3800;
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

/**
 * Fetches real-time search results directly from the official Al Hakam Search API (alhakam.org/api/search)
 */
export async function fetchLiveAlHakam(query: string): Promise<{ results: PublicationResult[]; totalHits: number }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    // Fetch page 0 and page 1 in parallel for comprehensive coverage (up to 20 articles)
    const encoded = encodeURIComponent(query);
    const [res0, res1] = await Promise.all([
      fetch(`https://www.alhakam.org/api/search?q=${encoded}&page=0`, {
        headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
        signal: controller.signal
      }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`https://www.alhakam.org/api/search?q=${encoded}&page=1`, {
        headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
        signal: controller.signal
      }).then(r => r.ok ? r.json() : null).catch(() => null)
    ]);

    clearTimeout(timeoutId);

    const totalHits = res0?.totalHits ?? res1?.totalHits ?? 0;
    const rawItems = [...(res0?.results || []), ...(res1?.results || [])];
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
        id: `alhakam-${item.postId || item.objectID || publications.length + 1}`,
        source: 'Al Hakam',
        title: item.title,
        summary: cleanSnippet || `Al Hakam publication exploring "${item.title}".`,
        url,
        date: item.date,
        topics: [query, item.category || 'Al Hakam Archive']
      });
    }

    return { results: publications, totalHits };
  } catch (err) {
    console.warn('[External Sources] Failed to fetch live Al Hakam:', err);
    return { results: [], totalHits: 0 };
  }
}

/**
 * Scrapes real-time search results directly from Review of Religions (reviewofreligions.org)
 */
export async function fetchLiveReviewOfReligions(query: string): Promise<PublicationResult[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    const encoded = encodeURIComponent(query);
    const res = await fetch(`https://www.reviewofreligions.org/?s=${encoded}`, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const publications: PublicationResult[] = [];
    const seenUrls = new Set<string>();

    $('article, .post-item, .entry, h2, h3').each((i, el) => {
      const $link = $(el).is('a') ? $(el) : $(el).find('a').first();
      const title = $link.text().trim();
      const href = $link.attr('href');
      const summary = $(el).find('p, .summary, .excerpt').first().text().trim();

      if (
        href &&
        href.startsWith('https://www.reviewofreligions.org/') &&
        title &&
        title.length > 5 &&
        title.length < 160 &&
        !href.includes('/page/') &&
        !href.includes('/category/') &&
        !href.includes('/tag/')
      ) {
        if (!seenUrls.has(href)) {
          seenUrls.add(href);
          publications.push({
            id: `ror-live-${publications.length + 1}`,
            source: 'Review of Religions',
            title,
            summary: summary ? summary.slice(0, 220) : `Review of Religions treatise investigating "${title}".`,
            url: href,
            topics: [query]
          });
        }
      }
    });

    return publications.slice(0, 15);
  } catch (err) {
    console.warn('[External Sources] Failed to fetch live Review of Religions:', err);
    return [];
  }
}

/**
 * Scrapes real-time search results directly from Al Islam (alislam.org)
 */
export async function fetchLiveAlIslam(query: string): Promise<AlIslamArticleResult[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    const encoded = encodeURIComponent(query);
    const res = await fetch(`https://www.alislam.org/?s=${encoded}`, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const articles: AlIslamArticleResult[] = [];
    const seenUrls = new Set<string>();

    $('article, .search-result, .entry, .post, .card, li.search-item, h2, h3').each((i, el) => {
      const $link = $(el).is('a') ? $(el) : $(el).find('a').first();
      const title = $link.text().trim();
      const href = $link.attr('href');
      const summary = $(el).find('p, .summary, .excerpt').first().text().trim();

      if (
        href &&
        href.startsWith('https://www.alislam.org/') &&
        title &&
        title.length > 5 &&
        title.length < 160 &&
        !href.includes('/page/') &&
        !href.includes('/tag/') &&
        !href.includes('/category/')
      ) {
        if (!seenUrls.has(href)) {
          seenUrls.add(href);
          let category: AlIslamArticleResult['category'] = 'Article';
          if (href.includes('/book/')) category = 'Book';
          else if (href.includes('/question/')) category = 'Q&A';
          else if (href.includes('/sermon/')) category = 'Friday Sermon';
          else if (href.includes('/topics/')) category = 'Topic Portal';

          articles.push({
            id: `alislam-live-${articles.length + 1}`,
            title,
            category,
            summary: summary ? summary.slice(0, 220) : `Official Al Islam resource detailing "${title}".`,
            url: href,
            topics: [query]
          });
        }
      }
    });

    return articles.slice(0, 15);
  } catch (err) {
    console.warn('[External Sources] Failed to fetch live Al Islam:', err);
    return [];
  }
}
