import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ExtractedArticle {
  title: string;
  author?: string;
  date?: string;
  source: string;
  url: string;
  heroImage?: string;
  contentHtml: string;
  wordCount: number;
  readingTimeMinutes: number;
}

function detectSourceFromUrl(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('alhakam.org')) return 'Al Hakam';
  if (lower.includes('reviewofreligions.org')) return 'Review of Religions';
  if (lower.includes('alislam.org')) return 'Al Islam';
  if (lower.includes('alfazl.com')) return 'Al Fazl';
  return 'Article Archive';
}

function calculateReadingTime(text: string): { wordCount: number; readingTimeMinutes: number } {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  return { wordCount, readingTimeMinutes };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const targetUrl = String(body.url || '').trim();

    if (!targetUrl || !targetUrl.startsWith('http')) {
      return NextResponse.json(
        { success: false, error: 'A valid absolute article URL is required' },
        { status: 400 }
      );
    }

    const source = body.source || detectSourceFromUrl(targetUrl);

    // Fetch article HTML with realistic browser headers
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ur;q=0.8'
      },
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Failed to fetch article (Status: ${res.status})` },
        { status: 502 }
      );
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // ── 1. TITLE EXTRACTION ──────────────────────────────────────────────────
    let title = $('h1.entry-title, h1.article-title, h1.herald-entry-title, h1.post-title, h1').first().text().trim();
    if (!title) {
      title = $('meta[property="og:title"]').attr('content') || $('title').text().trim();
    }
    // Clean trailing site brand from title (e.g., "... - Al Hakam")
    title = title.replace(/\s*[-–|]\s*(Al Hakam|The Review of Religions|Al Islam|Al Fazl).*$/i, '').trim();

    // ── 2. AUTHOR EXTRACTION ─────────────────────────────────────────────────
    let author = $('a[rel="author"], .author-name, .herald-author-name, .entry-author, .byline, .author, meta[name="author"]')
      .first()
      .text()
      .trim();
    if (!author) {
      author = $('meta[name="author"]').attr('content') || $('meta[property="article:author"]').attr('content') || '';
    }
    author = author.replace(/^by\s+/i, '').trim();

    // ── 3. DATE EXTRACTION ───────────────────────────────────────────────────
    let date = $('time.entry-date, time.published, .herald-date, .published, meta[property="article:published_time"]')
      .first()
      .text()
      .trim();
    if (!date) {
      const rawMetaDate = $('meta[property="article:published_time"]').attr('content') || $('meta[name="publish-date"]').attr('content');
      if (rawMetaDate) {
        try {
          const d = new Date(rawMetaDate);
          if (!isNaN(d.getTime())) {
            date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
          }
        } catch {
          date = rawMetaDate;
        }
      }
    }

    // ── 4. HERO / FEATURED IMAGE EXTRACTION ──────────────────────────────────
    let heroImage = $('meta[property="og:image"]').attr('content') ||
                    $('.herald-post-thumbnail img, .post-thumbnail img, .featured-image img, .entry-featured-image img').first().attr('src') ||
                    $('div.entry-content img').first().attr('src') ||
                    undefined;

    // Filter out tiny tracking pixels or icons
    if (heroImage && (heroImage.includes('gravatar') || heroImage.includes('icon') || heroImage.includes('logo'))) {
      heroImage = undefined;
    }

    // ── 5. CORE CONTENT CONTAINER IDENTIFICATION ─────────────────────────────
    let $content = $('div.entry-content, .herald-entry-content, div.hentry, article .content, .post-content, article').first();

    if ($content.length === 0) {
      // Fallback: look for largest paragraph container
      $content = $('main, #content, .site-content, body');
    }

    // Remove unwanted widgets, advertisements, sidebars, social share bars, and scripts
    $content.find([
      'script',
      'style',
      'nav',
      'footer',
      'header',
      '.sharedaddy',
      '.sd-sharing',
      '.social-share',
      '.jp-relatedposts',
      '.comments-area',
      '.comment-respond',
      '#comments',
      '.advertisement',
      '.ad-banner',
      '.ad-container',
      '.adsbygoogle',
      '.sidebar',
      '.widget',
      'iframe[src*="doubleclick"]',
      'iframe[src*="ad"]',
      '.herald-post-tags',
      '.entry-meta',
      '.herald-author-box',
      '.post-navigation',
      '.navigation'
    ].join(', ')).remove();

    // Clean inline attributes that might break typography
    $content.find('*').each((_, el) => {
      const attribs = el.attribs || {};
      for (const attr of Object.keys(attribs)) {
        if (attr.startsWith('on') || attr === 'style' || attr === 'data-wp-bind') {
          $(el).removeAttr(attr);
        }
      }
    });

    // Make relative links and image sources absolute
    $content.find('a').each((_, el) => {
      const href = $(el).attr('href');
      if (href && href.startsWith('/')) {
        try {
          $(el).attr('href', new URL(href, targetUrl).href);
        } catch {}
      }
      $(el).attr('target', '_blank');
      $(el).attr('rel', 'noopener noreferrer');
      $(el).addClass('text-[var(--accent-main)] hover:underline font-semibold');
    });

    $content.find('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src');
      if (src && src.startsWith('/')) {
        try {
          $(el).attr('src', new URL(src, targetUrl).href);
        } catch {}
      } else if (src) {
        $(el).attr('src', src);
      }
      $(el).addClass('rounded-xl max-w-full h-auto my-6 shadow-md mx-auto block');
      $(el).removeAttr('srcset');
    });

    // Style standard elements with clean Murabbi Desk typography
    $content.find('p').addClass('leading-relaxed mb-5 text-[var(--foreground)]/90');
    $content.find('h1, h2, h3, h4, h5, h6').addClass('font-black text-[var(--foreground)] mt-8 mb-4 tracking-tight');
    $content.find('blockquote').addClass('border-l-4 border-[var(--accent-main)] pl-4 py-2 my-6 italic bg-white/[0.02] rounded-r-lg text-[var(--foreground)]');
    $content.find('ul').addClass('list-disc list-inside space-y-2 my-4 pl-2 text-[var(--foreground)]/90');
    $content.find('ol').addClass('list-decimal list-inside space-y-2 my-4 pl-2 text-[var(--foreground)]/90');

    const cleanHtml = $content.html() || '';
    const cleanText = $content.text() || '';

    const { wordCount, readingTimeMinutes } = calculateReadingTime(cleanText);

    const article: ExtractedArticle = {
      title,
      author: author || undefined,
      date: date || undefined,
      source,
      url: targetUrl,
      heroImage,
      contentHtml: cleanHtml,
      wordCount,
      readingTimeMinutes
    };

    return NextResponse.json({
      success: true,
      article
    });
  } catch (err: any) {
    console.error('[Article Reader API] Error extracting article:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal error extracting article content' },
      { status: 500 }
    );
  }
}
