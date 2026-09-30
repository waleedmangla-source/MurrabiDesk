// Video & Deep Transcript Search Engine for YouTube & MTA.tv (mta.tv)
import type { VideoResult } from './research-sources';

export interface AhmadiyyaChannelInfo {
  id: string;
  name: string;
  handle: string;
  url: string;
  category:
    | 'Official Broadcasting & Media Networks'
    | 'Scholarly Journals & Intellectual Defence'
    | 'Central & National Headquarters'
    | 'Auxiliary Organisations & Humanitarian'
    | 'Archival, Historical & Specialized'
    | 'Curated Response, Apologetics & Clipping';
  handles: string[];
  names: string[];
  content: string;
}

/**
 * AUTHORIZED DIRECTORY OF AHMADIYYA YOUTUBE CHANNELS (27 APPROVED CHANNELS ONLY)
 * All YouTube video searches are strictly constrained to return videos solely from these channels.
 */
export const AHMADIYYA_YOUTUBE_CHANNELS: AhmadiyyaChannelInfo[] = [
  // --- [1] OFFICIAL BROADCASTING & MEDIA NETWORKS ---
  {
    id: 'mta-international',
    name: 'MTA International',
    handle: '@mtaOnline1',
    url: 'https://www.youtube.com/@mtaOnline1',
    category: 'Official Broadcasting & Media Networks',
    handles: ['@mtaonline1', 'mtaonline1', 'mtainternational'],
    names: ['mta international', 'muslim television ahmadiyya', 'mta 1', 'mtaonline1', 'mta international official'],
    content: 'Live Friday Sermons, Keynote Addresses, This Week With Huzoor, Jalsa Salana'
  },
  {
    id: 'mta-news',
    name: 'MTA News',
    handle: '@NewsMTA',
    url: 'https://www.youtube.com/@NewsMTA',
    category: 'Official Broadcasting & Media Networks',
    handles: ['@newsmta', 'newsmta'],
    names: ['mta news', 'newsmta'],
    content: 'Community news, international events, mosque openings, press coverage'
  },
  {
    id: 'mta-africa',
    name: 'MTA Africa',
    handle: '@MTAAfrica',
    url: 'https://www.youtube.com/@MTAAfrica',
    category: 'Official Broadcasting & Media Networks',
    handles: ['@mtaafrica', 'mtaafrica'],
    names: ['mta africa', 'mtaafrica'],
    content: 'African broadcasts, local languages (English, French, Swahili, etc.)'
  },
  {
    id: 'mta-canada',
    name: 'MTA Canada',
    handle: '@MTAcanada',
    url: 'https://www.youtube.com/@MTAcanada',
    category: 'Official Broadcasting & Media Networks',
    handles: ['@mtacanada', 'mtacanada'],
    names: ['mta canada', 'mtacanada'],
    content: 'Canadian productions, faith discussions, youth shows'
  },
  {
    id: 'mta-al-arabiyya',
    name: 'MTA Al-Arabiyya',
    handle: '@mtaalarabiyya',
    url: 'https://www.youtube.com/@mtaalarabiyya',
    category: 'Official Broadcasting & Media Networks',
    handles: ['@mtaalarabiyya', 'mtaalarabiyya'],
    names: ['mta al-arabiyya', 'mta al arabiyya', 'mtaalarabiyya', 'mta arabic', 'mta arabiyya'],
    content: "Arabic translations, live dialogues with the Arab world, Liqaa Ma'al Arab"
  },
  {
    id: 'mta-nazms',
    name: 'MTA Nazms',
    handle: '@MTANazms',
    url: 'https://www.youtube.com/@MTANazms',
    category: 'Official Broadcasting & Media Networks',
    handles: ['@mtanazms', 'mtanazms'],
    names: ['mta nazms', 'mtanazms'],
    content: 'Archival and newly recorded Urdu, Arabic, and Persian poems / Hamd / Naat'
  },

  // --- [2] SCHOLARLY JOURNALS & INTELLECTUAL DEFENCE ---
  {
    id: 'review-of-religions',
    name: 'The Review of Religions',
    handle: '@TheReviewofReligions',
    url: 'https://www.youtube.com/@TheReviewofReligions',
    category: 'Scholarly Journals & Intellectual Defence',
    handles: ['@thereviewofreligions', 'thereviewofreligions'],
    names: ['the review of religions', 'review of religions', 'thereviewofreligions'],
    content: 'Comparative religion, science and religion, archaeological proofs, Shroud of Turin, God summit'
  },
  {
    id: 'al-hakam',
    name: 'Al Hakam',
    handle: '@AlHakamOnline',
    url: 'https://www.youtube.com/@AlHakamOnline',
    category: 'Scholarly Journals & Intellectual Defence',
    handles: ['@alhakamonline', 'alhakamonline'],
    names: ['al hakam', 'al-hakam', 'alhakamonline', 'al hakam online'],
    content: 'Historical analysis, 100 Years Ago today, contemporary commentary, Friday sermon summaries'
  },
  {
    id: 'rational-religion',
    name: 'Rational Religion',
    handle: '@RationalReligion',
    url: 'https://www.youtube.com/@RationalReligion',
    category: 'Scholarly Journals & Intellectual Defence',
    handles: ['@rationalreligion', 'rationalreligion'],
    names: ['rational religion', 'rationalreligion'],
    content: 'Modern atheism rebuttals, philosophical arguments for God, scientific analysis of Quran'
  },
  {
    id: 'voice-of-islam-radio',
    name: 'Voice of Islam Radio',
    handle: '@VoiceofIslamUK',
    url: 'https://www.youtube.com/@VoiceofIslamUK',
    category: 'Scholarly Journals & Intellectual Defence',
    handles: ['@voiceofislamuk', 'voiceofislamuk'],
    names: ['voice of islam radio', 'voice of islam', 'voiceofislamuk', 'voice of islam uk'],
    content: 'Drive Time discussions, theological debates, faith and ethics podcasts'
  },

  // --- [3] CENTRAL & NATIONAL HEADQUARTERS ---
  {
    id: 'ahmadiyya-community',
    name: 'Ahmadiyya Muslim Community',
    handle: '@ahmadiyya',
    url: 'https://www.youtube.com/@ahmadiyya',
    category: 'Central & National Headquarters',
    handles: ['@ahmadiyya', 'ahmadiyya'],
    names: ['ahmadiyya muslim community', 'ahmadiyya muslim jamaat', "ahmadiyya muslim jama'at", 'ahmadiyya'],
    content: 'Official press briefings, international highlights, special documentaries'
  },
  {
    id: 'alislam-urdu',
    name: 'Alislam Urdu',
    handle: '@alislamurdu',
    url: 'https://www.youtube.com/@alislamurdu',
    category: 'Central & National Headquarters',
    handles: ['@alislamurdu', 'alislamurdu'],
    names: ['alislam urdu', 'alislamurdu', 'al islam urdu'],
    content: 'Urdu lectures, dars-ul-Quran, historic clips of Khalifatul Masih'
  },
  {
    id: 'press-ahmadiyya',
    name: 'Press Ahmadiyya',
    handle: '@PressAhmadiyya',
    url: 'https://www.youtube.com/@PressAhmadiyya',
    category: 'Central & National Headquarters',
    handles: ['@pressahmadiyya', 'pressahmadiyya'],
    names: ['press ahmadiyya', 'pressahmadiyya'],
    content: 'Press releases, official video statements, media coverage clips'
  },
  {
    id: 'ahmadiyya-uk',
    name: 'Ahmadiyya Muslim Community UK',
    handle: '@AhmadiyyaUK',
    url: 'https://www.youtube.com/@AhmadiyyaUK',
    category: 'Central & National Headquarters',
    handles: ['@ahmadiyyauk', 'ahmadiyyauk'],
    names: ['ahmadiyya muslim community uk', 'ahmadiyya uk', 'ahmadiyyauk'],
    content: 'UK National Peace Symposium, Jalsa UK highlights, local community work'
  },
  {
    id: 'ahmadiyya-usa',
    name: 'Ahmadiyya Muslim Community USA',
    handle: '@MuslimsForPeace',
    url: 'https://www.youtube.com/@MuslimsForPeace',
    category: 'Central & National Headquarters',
    handles: ['@muslimsforpeace', 'muslimsforpeace'],
    names: ['ahmadiyya muslim community usa', 'muslims for peace', 'muslimsforpeace', 'ahmadiyya usa'],
    content: 'USA national events, interfaith symposiums, True Islam USA campaign'
  },
  {
    id: 'ahmadiyya-canada',
    name: "Ahmadiyya Muslim Jama'at Canada",
    handle: '@AhmadiyyaCanada',
    url: 'https://www.youtube.com/@AhmadiyyaCanada',
    category: 'Central & National Headquarters',
    handles: ['@ahmadiyyacanada', 'ahmadiyyacanada'],
    names: ["ahmadiyya muslim jama'at canada", 'ahmadiyya muslim jamaat canada', 'ahmadiyya canada', 'ahmadiyyacanada'],
    content: 'Jalsa Salana Canada, Run for Peace, community projects'
  },

  // --- [4] AUXILIARY ORGANISATIONS & HUMANITARIAN ---
  {
    id: 'mka-uk',
    name: 'Majlis Khuddamul Ahmadiyya UK',
    handle: '@MKAUK',
    url: 'https://www.youtube.com/@MKAUK',
    category: 'Auxiliary Organisations & Humanitarian',
    handles: ['@mkauk', 'mkauk'],
    names: ['majlis khuddamul ahmadiyya uk', 'mka uk', 'mkauk', 'ahmadiyya muslim youth uk'],
    content: 'Youth workshops, National Ijtema, spiritual education, faith debates'
  },
  {
    id: 'muslim-youth-canada',
    name: 'Muslim Youth Canada',
    handle: '@MuslimYouthCanada',
    url: 'https://www.youtube.com/@MuslimYouthCanada',
    category: 'Auxiliary Organisations & Humanitarian',
    handles: ['@muslimyouthcanada', 'muslimyouthcanada'],
    names: ['muslim youth canada', 'muslimyouthcanada', 'amya canada', 'mka canada'],
    content: 'Canadian youth outreach, sports & spirituality, national conventions'
  },
  {
    id: 'humanity-first',
    name: 'Humanity First Official',
    handle: '@HumanityFirstOfficial',
    url: 'https://www.youtube.com/@HumanityFirstOfficial',
    category: 'Auxiliary Organisations & Humanitarian',
    handles: ['@humanityfirstofficial', 'humanityfirstofficial'],
    names: ['humanity first official', 'humanityfirstofficial', 'humanity first'],
    content: 'Water for Life, Knowledge for Life, disaster response missions, international aid'
  },

  // --- [5] ARCHIVAL, HISTORICAL & SPECIALIZED ---
  {
    id: 'tahir-archive',
    name: 'The Tahir Archive',
    handle: '@TheTahirArchive',
    url: 'https://www.youtube.com/@TheTahirArchive',
    category: 'Archival, Historical & Specialized',
    handles: ['@thetahirarchive', 'thetahirarchive'],
    names: ['the tahir archive', 'thetahirarchive', 'tahir archive'],
    content: "High-definition remastered Question & Answer sessions, Dars-ul-Quran, Liqaa Ma'al Arab"
  },
  {
    id: 'poetry-channel',
    name: 'The Ahmadiyya Poetry Channel',
    handle: '@TheAhmadiyyaPoetryChannel',
    url: 'https://www.youtube.com/@TheAhmadiyyaPoetryChannel',
    category: 'Archival, Historical & Specialized',
    handles: ['@theahmadiyyapoetrychannel', 'theahmadiyyapoetrychannel'],
    names: ['the ahmadiyya poetry channel', 'theahmadiyyapoetrychannel', 'ahmadiyya poetry channel', 'ahmadiyya poetry'],
    content: 'Beautiful recitations of Kalam-e-Tahir, Durr-e-Sameen, and Arabic Qasaid'
  },
  {
    id: 'clips-of-caliphs',
    name: 'Clips of Caliphs',
    handle: '@ClipsofCaliphs',
    url: 'https://www.youtube.com/@ClipsofCaliphs',
    category: 'Archival, Historical & Specialized',
    handles: ['@clipsofcaliphs', 'clipsofcaliphs'],
    names: ['clips of caliphs', 'clipsofcaliphs'],
    content: 'Restored footage and quotes of the Caliphs of Ahmadiyyat'
  },
  {
    id: 'short-videos',
    name: 'Ahmadiyya Short Videos',
    handle: '@AhmadiyyaShortVideos',
    url: 'https://www.youtube.com/@AhmadiyyaShortVideos',
    category: 'Archival, Historical & Specialized',
    handles: ['@ahmadiyyashortvideos', 'ahmadiyyashortvideos', '@ahmadiyyaclips', 'ahmadiyyaclips'],
    names: ['ahmadiyya short videos', 'ahmadiyyashortvideos', 'ahmadiyya clips', 'ahmadiyyaclips'],
    content: 'Bite-sized spiritual reminders, Friday sermon punchlines, moral guidance'
  },

  // --- [6] CURATED RESPONSE, APOLOGETICS & CLIPPING CHANNELS ---
  {
    id: 'ahmadiyya-answers',
    name: 'Ahmadiyya Answers',
    handle: '@AhmadiyyaAnswers',
    url: 'https://www.youtube.com/@AhmadiyyaAnswers',
    category: 'Curated Response, Apologetics & Clipping',
    handles: ['@ahmadiyyaanswers', 'ahmadiyyaanswers', '@ahmadianswers', 'ahmadianswers'],
    names: ['ahmadiyya answers', 'ahmadiyyaanswers', 'ahmadi answers', 'ahmadianswers', 'razi ullah noman'],
    content: 'In-depth apologetics against anti-Ahmadi allegations, refutations, theological masterclasses'
  },
  {
    id: 'true-islam',
    name: 'True Islam Outreach & Tabligh Clippers',
    handle: '@TrueIslam',
    url: 'https://www.youtube.com/@TrueIslam',
    category: 'Curated Response, Apologetics & Clipping',
    handles: ['@trueislam', 'trueislam'],
    names: ['true islam', 'trueislam', 'true islam outreach', 'true islam clippers', 'true islam clips'],
    content: 'Tabligh arguments, Jesus in India evidence, Khatam-e-Nabuwwat refutations'
  },
  {
    id: 'rahe-huda-archives',
    name: 'MTA Program Highlights / Rah-e-Huda Archives',
    handle: '@RaheHudaArchives1',
    url: 'https://www.youtube.com/@RaheHudaArchives1',
    category: 'Curated Response, Apologetics & Clipping',
    handles: ['@rahehudaarchives1', 'rahehudaarchives1', '@rahehudaarchives', 'rahehudaarchives'],
    names: ['rah-e-huda archives', 'rahehudaarchives1', 'rahehudaarchives', 'rah-e-huda clips', 'faith matters highlights', 'mta program highlights'],
    content: 'Highlights from live Urdu apologetics program "Rah-e-Huda", Faith Matters, answering critical questions'
  },
  {
    id: 'ahmadi-edits',
    name: 'Ahmadi Edits / Status Channels',
    handle: '@AhmadiEdits',
    url: 'https://www.youtube.com/@AhmadiEdits',
    category: 'Curated Response, Apologetics & Clipping',
    handles: ['@ahmadiedits', 'ahmadiedits'],
    names: ['ahmadi edits', 'ahmadiedits', 'ahmadiyya edits'],
    content: 'High-quality short edits, Friday Sermon recaps, inspirational status clips'
  }
];

/**
 * Backward compatibility alias list
 */
export const CONFIGURED_YOUTUBE_CHANNELS: string[] = AHMADIYYA_YOUTUBE_CHANNELS.map(ch => ch.name);

/**
 * Normalizes channel titles or handles for robust matching
 */
function normalizeChannelKey(str?: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Matches a YouTube video's owner metadata against the 27 approved Ahmadiyya channels.
 * Returns the matching AhmadiyyaChannelInfo, or null if the channel is NOT authorized.
 */
export function matchApprovedAhmadiyyaChannel(
  channelTitle: string,
  channelUrl?: string,
  canonicalBaseUrl?: string
): AhmadiyyaChannelInfo | null {
  const normTitle = normalizeChannelKey(channelTitle);
  const normBaseUrl = normalizeChannelKey(canonicalBaseUrl?.replace(/^\/@/, ''));
  const normNavUrl = normalizeChannelKey(channelUrl?.replace(/^\/@/, '').replace(/^\/c\//, '').replace(/^\/user\//, ''));

  for (const ch of AHMADIYYA_YOUTUBE_CHANNELS) {
    // 1. Strict exact handle match against canonicalBaseUrl or navUrl
    for (const h of ch.handles) {
      const normH = normalizeChannelKey(h);
      if (normBaseUrl && normBaseUrl === normH) return ch;
      if (normNavUrl && normNavUrl === normH) return ch;
    }

    // 2. Strict normalized title alias match
    for (const name of ch.names) {
      const normName = normalizeChannelKey(name);
      if (normTitle && normTitle === normName) return ch;
    }
  }

  return null;
}

/**
 * Checks whether a channel title or URL belongs to the approved list of 27 Ahmadiyya channels.
 */
export function isApprovedAhmadiyyaChannel(
  channelTitle: string,
  channelUrl?: string,
  canonicalBaseUrl?: string
): boolean {
  return matchApprovedAhmadiyyaChannel(channelTitle, channelUrl, canonicalBaseUrl) !== null;
}

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
 * Internal helper to query YouTube and extract raw videoRenderer objects
 */
async function fetchYouTubeQuery(searchQuery: string): Promise<any[]> {
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      next: { revalidate: 1800 }
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
    const items = itemSection?.contents || [];

    return items
      .filter((item: any) => item.videoRenderer)
      .map((item: any) => item.videoRenderer);
  } catch (err) {
    console.warn(`[Video Engine] Fetch failed for query "${searchQuery}":`, err);
    return [];
  }
}

/**
 * Searches YouTube for Ahmadiyya videos strictly constrained to the 27 authorized channels.
 * Performs deep transcript searching on top candidate videos.
 */
export async function searchYouTubeVideos(
  query: string,
  options: { searchTranscripts?: boolean; limit?: number; channels?: string[] } = {}
): Promise<VideoResult[]> {
  const { searchTranscripts = true, limit = 16 } = options;
  const clean = query.trim();
  if (!clean) return [];

  try {
    // Check if query is in Urdu or Arabic script
    const hasArabicOrUrdu = /[\u0600-\u06FF]/.test(clean);

    // Multi-query orchestration to maximize yield from authorized channels
    const queryList: string[] = [
      `${clean} MTA International OR Ahmadiyya Answers OR Review of Religions OR Rational Religion OR Al Hakam`,
      `${clean} Ahmadiyya`
    ];

    if (hasArabicOrUrdu) {
      queryList.push(`${clean} alislamurdu OR RaheHudaArchives1 OR MTANazms OR mtaOnline1`);
    }

    const settledResults = await Promise.allSettled(queryList.map(q => fetchYouTubeQuery(q)));
    const allVideoItems: any[] = [];
    for (const res of settledResults) {
      if (res.status === 'fulfilled') {
        allVideoItems.push(...res.value);
      }
    }

    const results: VideoResult[] = [];
    const seenVideoIds = new Set<string>();
    const queryTokens = clean.toLowerCase().split(/\s+/).filter(w => w.length >= 3);

    for (const v of allVideoItems) {
      if (!v?.videoId || seenVideoIds.has(v.videoId)) continue;
      seenVideoIds.add(v.videoId);

      const channelTitle = v.ownerText?.runs?.map((r: any) => r.text).join('') || v.ownerText?.simpleText || '';
      const run = v.ownerText?.runs?.[0];
      const canonicalBaseUrl = run?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl;
      const navUrl = run?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url;

      // STRICT CHANNEL FILTER: Only accept videos from the 27 authorized channels!
      const approvedChannel = matchApprovedAhmadiyyaChannel(channelTitle, navUrl, canonicalBaseUrl);
      if (!approvedChannel) {
        continue;
      }

      const title = v.title?.runs?.map((r: any) => r.text).join('') || v.title?.simpleText || '';
      const duration = v.lengthText?.simpleText || '';
      const published = v.publishedTimeText?.simpleText || '';
      const thumbnail = v.thumbnail?.thumbnails?.slice(-1)[0]?.url || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;
      const watchUrl = `https://www.youtube.com/watch?v=${v.videoId}`;

      results.push({
        id: `yt-${v.videoId}`,
        source: 'YouTube',
        title,
        channel: approvedChannel.name,
        channelHandle: approvedChannel.handle,
        channelCategory: approvedChannel.category,
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
        channelCategory: 'Official Broadcasting & Media Networks',
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
 * Federated Video Search across strictly vetted YouTube Ahmadiyya channels & MTA.tv
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
