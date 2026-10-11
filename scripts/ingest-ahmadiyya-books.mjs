import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

const TOPICS_SOURCE = '/Users/waleedmangla/.gemini/antigravity/brain/b245db4d-ceb8-47db-a56f-438277805b3f/.system_generated/steps/1877/content.md';
const HOMEPAGE_SOURCE = '/Users/waleedmangla/.gemini/antigravity/brain/b245db4d-ceb8-47db-a56f-438277805b3f/.system_generated/steps/1867/content.md';
const SITEMAP_SOURCE = '/Users/waleedmangla/.gemini/antigravity/brain/b245db4d-ceb8-47db-a56f-438277805b3f/.system_generated/steps/1899/content.md';

const OUT_DIR = path.resolve(process.cwd(), 'src/data/research');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. EXTRACT GRAND TOPICS INDEX
// ─────────────────────────────────────────────────────────────────────────────
console.log('1. Extracting Grand Topics Index...');
const topicsHtml = fs.readFileSync(TOPICS_SOURCE, 'utf8');
const $topics = cheerio.load(topicsHtml);
$topics('style').remove();

const grandTopics = [];

$topics('.MuiTypography-h6.css-baxtt3').each((i, el) => {
  const mainTitle = $topics(el).text().trim();
  const mainRow = $topics(el).closest('.css-px8krg');
  const mainCollapse = mainRow.next('.MuiCollapse-root');

  const subtopics = [];

  mainCollapse.find('.MuiTypography-subtitle1.css-aonbz8').each((j, subEl) => {
    const subTitle = $topics(subEl).text().trim();
    const caption = $topics(subEl).next('.MuiTypography-caption').text().trim();
    const subRow = $topics(subEl).closest('.css-px8krg');
    const subCollapse = subRow.next('.MuiCollapse-root');

    const references = [];
    subCollapse.find('p.MuiTypography-body2.css-h1f6zv').each((k, pEl) => {
      const volTitle = $topics(pEl).text().trim();
      const chipContainer = $topics(pEl).next();
      const pages = chipContainer
        .find('.MuiChip-label')
        .map((m, c) => $topics(c).text().trim().replace(/^p\./, ''))
        .get();

      if (volTitle && pages.length) {
        references.push({
          collection: 'Khutbat-e-Mahmood',
          volume: volTitle,
          pages
        });
      }
    });

    subtopics.push({
      id: `topic-${i + 1}-${j + 1}`,
      title: subTitle,
      description: caption,
      references
    });
  });

  grandTopics.push({
    id: `main-${i + 1}`,
    title: mainTitle,
    subtopicsCount: subtopics.length,
    subtopics
  });
});

fs.writeFileSync(
  path.join(OUT_DIR, 'grand-topics.json'),
  JSON.stringify(grandTopics, null, 2),
  'utf8'
);
console.log(`✓ Saved ${grandTopics.length} grand topics to grand-topics.json`);

// ─────────────────────────────────────────────────────────────────────────────
// 2. EXTRACT CURATED ARTICLES
// ─────────────────────────────────────────────────────────────────────────────
console.log('2. Extracting Curated Articles...');
const homeHtml = fs.readFileSync(HOMEPAGE_SOURCE, 'utf8');
const articleMatch = homeHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);

let curatedArticles = [];
if (articleMatch) {
  try {
    const json = JSON.parse(articleMatch[1]);
    if (Array.isArray(json.itemListElement)) {
      curatedArticles = json.itemListElement.map((item, idx) => {
        const art = item.item || item;
        return {
          id: `article-${idx + 1}`,
          title: art.headline || art.name,
          slug: (art.url || '').split('/articles/')[1]?.replace(/\/$/, '') || `article-${idx + 1}`,
          url: art.url,
          description: art.description,
          author: typeof art.author === 'object' ? art.author.name : art.author || 'Ahmadiyya Muslim Community',
          datePublished: art.datePublished,
          publisher: 'Ahmadiyya Books'
        };
      });
    }
  } catch (err) {
    console.error('Failed to parse articles JSON-LD:', err);
  }
}

fs.writeFileSync(
  path.join(OUT_DIR, 'curated-articles.json'),
  JSON.stringify(curatedArticles, null, 2),
  'utf8'
);
console.log(`✓ Saved ${curatedArticles.length} curated articles to curated-articles.json`);

// ─────────────────────────────────────────────────────────────────────────────
// 3. EXTRACT SITEMAP ENTRIES
// ─────────────────────────────────────────────────────────────────────────────
console.log('3. Extracting sitemap entries...');
const sitemapXml = fs.readFileSync(SITEMAP_SOURCE, 'utf8');
const bookSlugs = [...new Set([...sitemapXml.matchAll(/<loc>https:\/\/ahmadiyyabooks\.org\/book\/([^<]+)\/<\/loc>/g)].map(m => m[1]))];
const authorSlugs = [...new Set([...sitemapXml.matchAll(/<loc>https:\/\/ahmadiyyabooks\.org\/author\/([^<]+)\/<\/loc>/g)].map(m => m[1]))];
const collectionSlugs = [...new Set([...sitemapXml.matchAll(/<loc>https:\/\/ahmadiyyabooks\.org\/collection\/([^<]+)\/<\/loc>/g)].map(m => m[1]))];

console.log(`Found ${bookSlugs.length} unique book slugs, ${authorSlugs.length} author slugs, ${collectionSlugs.length} collection slugs.`);

// ─────────────────────────────────────────────────────────────────────────────
// 4. FETCH AUTHORS & THEIR BOOKS
// ─────────────────────────────────────────────────────────────────────────────
console.log('4. Fetching authors and harvesting books metadata...');

const booksBySlug = new Map();
const authorsList = [];
const collectionsList = [];

// Helper to humanize slug into readable title
function slugToTitle(slug) {
  return slug
    .split('-')
    .map(word => {
      if (word.toLowerCase() === 'ii') return 'II';
      if (word.toLowerCase() === 'iii') return 'III';
      if (word.toLowerCase() === 'iv') return 'IV';
      if (word.toLowerCase() === 'rk') return 'Ruhani Khazain';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

// Fetch helper with headers & timeout
async function fetchWithRetry(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });
      if (res.ok) return await res.text();
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, 500));
    }
  }
  return null;
}

// Concurrency runner
async function runConcurrent(items, limit, workerFn) {
  const results = [];
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const cur = items[index++];
      try {
        const res = await workerFn(cur);
        results.push(res);
      } catch (err) {
        console.error(`Error processing ${cur}:`, err.message);
      }
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// Crawl authors
await runConcurrent(authorSlugs, 6, async (authorSlug) => {
  const html = await fetchWithRetry(`https://ahmadiyyabooks.com/author/${authorSlug}/`);
  if (!html) return;
  const $ = cheerio.load(html);
  $('style').remove();

  const authorName = $('h1').first().text().trim() || slugToTitle(authorSlug);
  const authorSubtitle = $('h5').first().text().trim() || '';
  const authorBio = $('p').first().text().trim() || '';
  const authorImg = $('img[alt="' + authorName + '"]').attr('src') || '';

  authorsList.push({
    slug: authorSlug,
    name: authorName,
    subtitle: authorSubtitle,
    bio: authorBio.slice(0, 300),
    image: authorImg
  });

  // Extract books on author page
  $('a[href^="/book/"]').each((i, el) => {
    const href = $(el).attr('href') || '';
    const slug = href.replace(/^\/book\//, '').replace(/\/$/, '');
    if (!slug) return;

    const img = $(el).find('img').attr('src') || '';
    const title = $(el).find('h3').text().trim() || $(el).find('p, h6').first().text().trim() || slugToTitle(slug);
    const lang = $(el).find('.MuiChip-label').first().text().trim() || 'EN';

    const existing = booksBySlug.get(slug) || {};
    booksBySlug.set(slug, {
      ...existing,
      id: `book-${slug}`,
      slug,
      title: title || existing.title || slugToTitle(slug),
      author: authorName,
      authorSlug,
      coverUrl: img || existing.coverUrl || '',
      language: (lang.toLowerCase() === 'ur' ? 'ur' : lang.toLowerCase() === 'ar' ? 'ar' : 'en'),
      url: `https://ahmadiyyabooks.com/book/${slug}/`,
      alislamUrl: `https://www.alislam.org/book/${slug}/`
    });
  });
});

console.log(`✓ Processed ${authorsList.length} authors, harvested ${booksBySlug.size} books.`);

// Crawl collections
console.log('5. Fetching collections and harvesting books metadata...');
await runConcurrent(collectionSlugs, 6, async (colSlug) => {
  const html = await fetchWithRetry(`https://ahmadiyyabooks.com/collection/${colSlug}/`);
  if (!html) return;
  const $ = cheerio.load(html);
  $('style').remove();

  const colTitle = $('h1').first().text().trim() || slugToTitle(colSlug);
  collectionsList.push({
    slug: colSlug,
    title: colTitle
  });

  $('a[href^="/book/"]').each((i, el) => {
    const href = $(el).attr('href') || '';
    const slug = href.replace(/^\/book\//, '').replace(/\/$/, '');
    if (!slug) return;

    const img = $(el).find('img').attr('src') || '';
    const title = $(el).find('h3').text().trim() || $(el).find('p, h6').first().text().trim() || slugToTitle(slug);
    const lang = $(el).find('.MuiChip-label').first().text().trim() || 'EN';

    const existing = booksBySlug.get(slug) || {};
    booksBySlug.set(slug, {
      ...existing,
      id: `book-${slug}`,
      slug,
      title: existing.title || title || slugToTitle(slug),
      collection: colTitle,
      collectionSlug: colSlug,
      coverUrl: existing.coverUrl || img || '',
      language: existing.language || (lang.toLowerCase() === 'ur' ? 'ur' : lang.toLowerCase() === 'ar' ? 'ar' : 'en'),
      url: `https://ahmadiyyabooks.com/book/${slug}/`,
      alislamUrl: `https://www.alislam.org/book/${slug}/`
    });
  });
});

console.log(`✓ Processed ${collectionsList.length} collections, books catalog now at ${booksBySlug.size} items.`);

// ─────────────────────────────────────────────────────────────────────────────
// 6. POPULATE ANY REMAINING SITEMAP BOOKS
// ─────────────────────────────────────────────────────────────────────────────
console.log('6. Ensuring all 1,531 sitemap books are cataloged...');
for (const slug of bookSlugs) {
  if (!booksBySlug.has(slug)) {
    const title = slugToTitle(slug);
    let author = 'Ahmadiyya Muslim Community';
    let authorSlug = 'other-authors';

    if (slug.includes('rk') || slug.includes('barahin') || slug.includes('khazain') || slug.includes('noahs-ark') || slug.includes('jesus-in-india')) {
      author = 'Hazrat Mirza Ghulam Ahmad';
      authorSlug = 'hazrat-mirza-ghulam-ahmad';
    } else if (slug.includes('kabeer') || slug.includes('anwarul-uloom') || slug.includes('khutbat-e-mahmood')) {
      author = 'Hazrat Mirza Bashir-ud-Din Mahmud Ahmad';
      authorSlug = 'hazrat-mirza-bashiruddin-mahmud-ahmad';
    }

    booksBySlug.set(slug, {
      id: `book-${slug}`,
      slug,
      title,
      author,
      authorSlug,
      coverUrl: '',
      language: slug.endsWith('-ar') ? 'ar' : (slug.endsWith('-ur') || slug.includes('urdu')) ? 'ur' : 'en',
      url: `https://ahmadiyyabooks.com/book/${slug}/`,
      alislamUrl: `https://www.alislam.org/book/${slug}/`
    });
  }
}

const finalBooksCatalog = Array.from(booksBySlug.values()).sort((a, b) => a.title.localeCompare(b.title));

fs.writeFileSync(
  path.join(OUT_DIR, 'ahmadiyya-books.json'),
  JSON.stringify(finalBooksCatalog, null, 2),
  'utf8'
);

fs.writeFileSync(
  path.join(OUT_DIR, 'authors.json'),
  JSON.stringify(authorsList.sort((a, b) => a.name.localeCompare(b.name)), null, 2),
  'utf8'
);

fs.writeFileSync(
  path.join(OUT_DIR, 'collections.json'),
  JSON.stringify(collectionsList.sort((a, b) => a.title.localeCompare(b.title)), null, 2),
  'utf8'
);

console.log(`\n🎉 Ingestion complete!`);
console.log(`- ${grandTopics.length} Grand Topics saved to grand-topics.json`);
console.log(`- ${curatedArticles.length} Curated Articles saved to curated-articles.json`);
console.log(`- ${finalBooksCatalog.length} Books saved to ahmadiyya-books.json`);
console.log(`- ${authorsList.length} Authors saved to authors.json`);
console.log(`- ${collectionsList.length} Collections saved to collections.json`);
