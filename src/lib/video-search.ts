// Video & Deep Transcript Search Engine for YouTube & MTA.tv (mta.tv)
import { VideoResult } from './research-sources';

/**
 * Configurable list of preferred Ahmadiyya YouTube channels.
 * When the user provides their specific channel list, replace or extend this array.
 */
export const CONFIGURED_YOUTUBE_CHANNELS: string[] = [
  'MTA International',
  'Muslim Television Ahmadiyya',
  'mtaOnline1',
  'Ahmadiyya Muslim Community',
  'Review of Religions',
  'Al Hakam',
  'Ask Islam',
  'True Islam',
  'Rational Religion',
  'AMJ International',
  'Ahmadiyya UK',
  'Ahmadiyya USA',
  'MTA News',
  'MTA Africa'
];

interface TranscriptSegment {
  start: number;
  duration: number;
  text: string;
}

/**
 * Formats seconds into MM:SS or HH:MM:SS
 */
function formatTimestamp(seconds: number): string {
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Clean XML/HTML entities
 */
function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<[^>]*>/g, '')
    .trim();
}

/**
 * Searches inside YouTube captions for the given query terms
 */
async function searchYouTubeTranscript(videoId: string, queryTerms: string[]): Promise<{ snippet?: string; timestampSec?: number } | null> {
  try {
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const res = await fetch(watchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      next: { revalidate: 3600 }
    });

    if (!res.ok) return null;
    const html = await res.text();

    const playerMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});(?:var|<\/script>)/);
    if (!playerMatch) return null;

    const player = JSON.parse(playerMatch[1]);
    const captionTracks = player.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!Array.isArray(captionTracks) || captionTracks.length === 0) return null;

    // Prefer English or first track
    const selectedTrack = captionTracks.find((t: any) => t.languageCode === 'en' || (t.vssId && t.vssId.includes('en'))) || captionTracks[0];
    if (!selectedTrack?.baseUrl) return null;

    const timedRes = await fetch(selectedTrack.baseUrl);
    if (!timedRes.ok) return null;
    const xml = await timedRes.text();

    // Parse transcript segments: <text start="12.34" dur="3.45">Sample text</text>
    const segmentRegex = /<text\s+start="([0-9.]+)"\s+dur="([0-9.]+)"[^>]*>([\s\S]*?)<\/text>/gi;
    const segments: TranscriptSegment[] = [];
    let match: RegExpExecArray | null;

    while ((match = segmentRegex.exec(xml)) !== null) {
      const start = parseFloat(match[1]);
      const duration = parseFloat(match[2]);
      const text = decodeXmlEntities(match[3]);
      if (text) {
        segments.push({ start, duration, text });
      }
    }

    if (segments.length === 0) return null;

    // Search for matching query terms in segments
    const lowerTerms = queryTerms.map(t => t.toLowerCase()).filter(t => t.length >= 3);
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const segLower = seg.text.toLowerCase();

      for (const term of lowerTerms) {
        if (segLower.includes(term)) {
          // Stitch with previous and next segment for better context
          const prev = i > 0 ? segments[i - 1].text : '';
          const current = seg.text;
          const next = i < segments.length - 1 ? segments[i + 1].text : '';
          const combined = [prev, current, next].filter(Boolean).join(' ').trim();
          const timestampLabel = formatTimestamp(seg.start);

          return {
            snippet: `[${timestampLabel}] "...${combined.slice(0, 180)}..."`,
            timestampSec: Math.floor(seg.start)
          };
        }
      }
    }

    return null;
  } catch (err) {
    console.warn(`[Video Engine] Transcript search failed for video ${videoId}:`, err);
    return null;
  }
}

/**
 * Searches YouTube for Ahmadiyya videos and performs deep transcript searching
 */
export async function searchYouTubeVideos(
  query: string,
  options: { searchTranscripts?: boolean; limit?: number; channels?: string[] } = {}
): Promise<VideoResult[]> {
  const { searchTranscripts = true, limit = 15, channels = CONFIGURED_YOUTUBE_CHANNELS } = options;
  const clean = query.trim();
  if (!clean) return [];

  try {
    // Enhance search query to prioritize Ahmadiyya sources
    const enhancedQuery = `${clean} Ahmadiyya`;
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(enhancedQuery)}`;

    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!res.ok) {
      console.warn(`[Video Engine] YouTube search returned status ${res.status}`);
      return [];
    }

    const html = await res.text();
    const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
    if (!match) return [];

    const data = JSON.parse(match[1]);
    const contents = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
    const itemSection = contents?.find((c: any) => c.itemSectionRenderer)?.itemSectionRenderer;
    const videoItems = (itemSection?.contents || []).filter((item: any) => item.videoRenderer);

    const results: VideoResult[] = [];
    const queryTokens = clean.toLowerCase().split(/\s+/).filter(w => w.length >= 3);

    for (const item of videoItems.slice(0, limit * 2)) {
      const v = item.videoRenderer;
      if (!v?.videoId) continue;

      const title = v.title?.runs?.map((r: any) => r.text).join('') || v.title?.simpleText || '';
      const channel = v.ownerText?.runs?.map((r: any) => r.text).join('') || '';
      const duration = v.lengthText?.simpleText || '';
      const published = v.publishedTimeText?.simpleText || '';
      const thumbnail = v.thumbnail?.thumbnails?.slice(-1)[0]?.url || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;
      const watchUrl = `https://www.youtube.com/watch?v=${v.videoId}`;

      // Check if channel matches configured preference
      const isPreferredChannel = channels.some(ch =>
        channel.toLowerCase().includes(ch.toLowerCase()) || ch.toLowerCase().includes(channel.toLowerCase())
      );

      results.push({
        id: `yt-${v.videoId}`,
        source: 'YouTube',
        title,
        channel: channel || 'YouTube',
        duration,
        published,
        url: watchUrl,
        thumbnail
      });

      if (results.length >= limit) break;
    }

    // Deep Transcript Search: inspect candidate videos concurrently (up to 4 candidates to keep it fast)
    if (searchTranscripts && results.length > 0 && queryTokens.length > 0) {
      const candidates = results.slice(0, 4);
      await Promise.all(
        candidates.map(async (video) => {
          const videoId = video.id.replace('yt-', '');
          const transcriptData = await searchYouTubeTranscript(videoId, [clean, ...queryTokens]);
          if (transcriptData?.snippet) {
            video.transcriptSnippet = transcriptData.snippet;
            video.transcriptTimestampSec = transcriptData.timestampSec;
            if (transcriptData.timestampSec) {
              video.url = `https://www.youtube.com/watch?v=${videoId}&t=${transcriptData.timestampSec}`;
            }
          }
        })
      );
    }

    return results;
  } catch (err) {
    console.error('[Video Engine] YouTube search error:', err);
    return [];
  }
}

/**
 * Searches MTA.tv (Muslim Television Ahmadiyya International) official production search index
 */
export async function searchMtaTvVideos(query: string, limit = 12): Promise<VideoResult[]> {
  const clean = query.trim();
  if (!clean) return [];

  try {
    const url = 'https://UPVYVTFQ1D-dsn.algolia.net/1/indexes/studio-online-web-prod/query';
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Algolia-Application-Id': 'UPVYVTFQ1D',
        'X-Algolia-API-Key': '10f13e1e7ec750bf80d8488c137c3ac9'
      },
      body: JSON.stringify({
        params: `query=${encodeURIComponent(clean)}&hitsPerPage=${limit}`
      })
    });

    if (!res.ok) {
      console.warn(`[Video Engine] MTA.tv search returned status ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (!Array.isArray(data.hits)) return [];

    const queryTokens = clean.toLowerCase().split(/\s+/).filter(w => w.length >= 3);

    return data.hits.map((hit: any) => {
      const title = hit.title_eng || hit.titleShort_eng || hit.title || 'MTA International Programme';
      const brand = hit.brand || 'MTA International';
      const teaserPath = hit.teaserImage?.['16x9'] || hit.teaserImage?.['9x13'];
      const thumbnail = teaserPath ? `https://images.mta.tv${teaserPath}` : '';
      const permalink = hit.permalink || `/programme/${hit.objectID}`;
      const fullUrl = permalink.startsWith('http') ? permalink : `https://www.mta.tv${permalink}`;
      const description = hit.description_eng || hit.description || '';

      // Check if description or content has exact query alignment for snippet
      let transcriptSnippet: string | undefined;
      const descLower = description.toLowerCase();
      for (const t of [clean.toLowerCase(), ...queryTokens]) {
        const idx = descLower.indexOf(t);
        if (idx !== -1) {
          const start = Math.max(0, idx - 40);
          const end = Math.min(description.length, idx + 100);
          transcriptSnippet = `"...${description.slice(start, end).trim()}..."`;
          break;
        }
      }

      return {
        id: `mta-${hit.objectID || hit.upid || Math.random().toString(36).slice(2)}`,
        source: 'MTA.tv',
        title,
        channel: brand,
        url: fullUrl,
        thumbnail,
        description,
        transcriptSnippet
      };
    });
  } catch (err) {
    console.error('[Video Engine] MTA.tv search error:', err);
    return [];
  }
}

/**
 * Federated Video Search across YouTube & MTA.tv
 */
export async function searchMediaVideos(query: string): Promise<VideoResult[]> {
  const [ytVideos, mtaVideos] = await Promise.all([
    searchYouTubeVideos(query).catch(() => []),
    searchMtaTvVideos(query).catch(() => [])
  ]);

  // Combine and prioritize items with transcript snippets
  const combined = [...ytVideos, ...mtaVideos];
  combined.sort((a, b) => {
    const aHasTranscript = !!a.transcriptSnippet;
    const bHasTranscript = !!b.transcriptSnippet;
    if (aHasTranscript && !bHasTranscript) return -1;
    if (!aHasTranscript && bHasTranscript) return 1;
    return 0;
  });

  return combined;
}
