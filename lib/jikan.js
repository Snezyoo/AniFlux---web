/**
 * lib/jikan.js — AniFlux × Jikan API (MyAnimeList) Client
 *
 * Fetches live anime catalog data: titles, posters, episode counts, MAL IDs.
 * All results are normalised into the AniFlux uniform anime shape so they
 * drop straight into <AnimeCard> and the Watch Page without extra adapters.
 *
 * Jikan API docs: https://docs.api.jikan.moe/
 * Rate limit: ~3 req/s (no key required). Built-in 300ms debounce helpers.
 */

const BASE_URL = 'https://api.jikan.moe/v4';

// ── Internal fetch with error resilience ─────────────────────────────────────
async function jikanFetch(path) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      next: { revalidate: 300 }, // 5-minute ISR cache (Next.js)
    });
    if (!res.ok) throw new Error(`Jikan ${res.status}: ${path}`);
    return await res.json();
  } catch (err) {
    console.warn('[Jikan API]', err.message);
    return null;
  }
}

// ── Shape a raw Jikan anime object into AniFlux's uniform format ─────────────
export function shapeJikanAnime(raw) {
  if (!raw) return null;
  const malId  = raw.mal_id;
  const poster = raw.images?.jpg?.large_image_url || raw.images?.jpg?.image_url || '';
  const title  = raw.title_english || raw.title || 'Unknown';
  const score  = raw.score ? (raw.score / 2).toFixed(1) : null; // MAL is /10, AniFlux uses /5
  const genres = (raw.genres || []).map(g => g.name);

  const epCount = (raw.episodes && raw.episodes > 1) ? raw.episodes : 12;

  return {
    // Identity
    id:             malId,
    slug:           String(malId),
    mal_id:         malId,
    // Metadata
    title,
    anime_title:    title,
    animeTitle:     title,
    synopsis:       raw.synopsis || '',
    description:    raw.synopsis || '',
    // Media
    poster,
    thumbnail_url:  poster,
    thumbnailUrl:   poster,
    banner:         poster,
    // Streaming
    stream_source:  'mal',
    total_episodes: epCount,
    episodes:       epCount,
    episode_number: 1,
    // Metadata extras
    genre:          genres,
    category:       genres.join(', '),
    rating:         score ? parseFloat(score) : 5.0,
    rating_avg:     score ? parseFloat(score) : 5.0,
    year:           raw.year || raw.aired?.prop?.from?.year || new Date().getFullYear(),
    status:         raw.status || 'Unknown',
    type:           raw.type || 'TV',
    studio:         raw.studios?.[0]?.name || 'Unknown Studio',
    // AniFlux flags
    is_featured:    false,
    isFeatured:     false,
    featured:       false,
    published:      true,
    tags:           ['HD', 'SUB'],
    trending:       false,
    topRated:       (raw.score || 0) >= 8,
  };
}

// ═══════════════════════════════════════════════════════════════
//  CATALOG FETCHERS
// ═══════════════════════════════════════════════════════════════

/**
 * Fetch top-rated anime from MAL.
 * @param {number} page  Page number (1-indexed)
 * @param {number} limit Results per page (max 25)
 */
export async function getTopAnime(page = 1, limit = 24) {
  const data = await jikanFetch(`/top/anime?page=${page}&limit=${limit}&type=tv`);
  return (data?.data || []).map(shapeJikanAnime).filter(Boolean);
}

/**
 * Fetch currently airing (this season) anime.
 * @param {number} page
 * @param {number} limit
 */
export async function getNewestAnime(page = 1, limit = 24) {
  const data = await jikanFetch(`/seasons/now?page=${page}&limit=${limit}`);
  return (data?.data || []).map(shapeJikanAnime).filter(Boolean);
}

/**
 * Fetch trending anime (popular this season by score).
 * Uses the seasonal endpoint sorted by popularity.
 */
export async function getTrendingAnime(page = 1, limit = 24) {
  const data = await jikanFetch(`/top/anime?page=${page}&limit=${limit}&filter=airing`);
  return (data?.data || []).map(shapeJikanAnime).filter(Boolean);
}

/**
 * Fetch complete metadata for a single anime by MAL ID.
 * @param {number|string} malId
 */
export async function getAnimeById(malId) {
  const data = await jikanFetch(`/anime/${malId}/full`);
  return data?.data ? shapeJikanAnime(data.data) : null;
}

/**
 * Search anime by title query.
 * @param {string} query  Search string
 * @param {number} page
 * @param {number} limit
 */
export async function searchAnime(query, page = 1, limit = 24) {
  if (!query?.trim()) return [];
  const encoded = encodeURIComponent(query.trim());
  const data = await jikanFetch(`/anime?q=${encoded}&page=${page}&limit=${limit}&sfw=true`);
  return (data?.data || []).map(shapeJikanAnime).filter(Boolean);
}

/**
 * Fetch anime by genre.
 * Common genre IDs: Action=1, Adventure=2, Comedy=4, Drama=8, Fantasy=10,
 *   Horror=14, Romance=22, Sci-Fi=24, SliceOfLife=36, Sports=30, Thriller=41
 */
export const JIKAN_GENRE_IDS = {
  'Action': 1, 'Adventure': 2, 'Comedy': 4, 'Drama': 8,
  'Fantasy': 10, 'Horror': 14, 'Romance': 22, 'Sci-Fi': 24,
  'Slice of Life': 36, 'Sports': 30, 'Thriller': 41,
  'Supernatural': 37, 'Mystery': 7, 'Mecha': 18,
};

export async function getAnimeByGenre(genreName, page = 1, limit = 24) {
  const genreId = JIKAN_GENRE_IDS[genreName];
  if (!genreId) return [];
  const data = await jikanFetch(`/anime?genres=${genreId}&page=${page}&limit=${limit}&order_by=score&sort=desc`);
  return (data?.data || []).map(shapeJikanAnime).filter(Boolean);
}

/**
 * Fetch pagination metadata from a Jikan response for infinite scroll.
 * Returns { currentPage, lastPage, hasNextPage, total }
 */
export function extractPagination(jikanData) {
  const p = jikanData?.pagination;
  if (!p) return { currentPage: 1, lastPage: 1, hasNextPage: false, total: 0 };
  return {
    currentPage: p.current_page || 1,
    lastPage:    p.last_visible_page || 1,
    hasNextPage: p.has_next_page || false,
    total:       p.items?.total || 0,
  };
}
