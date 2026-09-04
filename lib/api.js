/**
 * lib/api.js — AniFlux Data Access Layer with Instant Local Persistence & Fallback
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import {
  ANIME_CATALOG,
  TRENDING_ANIME,
  TOP_RATED_ANIME,
  WAIFU_FAV_ANIME,
} from '@/lib/mockData';

const CUSTOM_EPISODES_KEY = 'aniflux_custom_episodes';

// ─── LocalStorage Persistence Helpers ─────────────────────────────────────────
function getLocalCustomEpisodes() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_EPISODES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalCustomEpisode(ep) {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalCustomEpisodes();
    const existingIndex = current.findIndex(e => e.id === ep.id);
    let updated;
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...updated[existingIndex], ...ep };
    } else {
      updated = [ep, ...current];
    }
    localStorage.setItem(CUSTOM_EPISODES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('[saveLocalCustomEpisode] failed:', e);
  }
}

function deleteLocalCustomEpisode(id) {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalCustomEpisodes();
    const updated = current.filter(e => e.id !== id);
    localStorage.setItem(CUSTOM_EPISODES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('[deleteLocalCustomEpisode] failed:', e);
  }
}

function mergeCustomEpisodes(baseList) {
  const custom = getLocalCustomEpisodes();
  if (!custom || custom.length === 0) return baseList;
  const customIds = new Set(custom.map(c => c.id));
  const filteredBase = baseList.filter(b => !customIds.has(b.id));
  return [...custom, ...filteredBase];
}

// ─── Helper: shape a Supabase episode into the app's uniform format ─────────
function shapeEpisode(row) {
  if (!row) return null;
  return {
    id:             row.id,
    slug:           row.id,
    title:          row.title,
    anime_title:    row.anime_title,
    animeTitle:     row.anime_title,
    episode_number: row.episode_number,
    synopsis:       row.description || '',
    description:    row.description || '',
    thumbnail_url:  row.thumbnail_url || `https://picsum.photos/seed/${row.id}/300/450`,
    thumbnailUrl:   row.thumbnail_url || `https://picsum.photos/seed/${row.id}/300/450`,
    poster:         row.thumbnail_url || `https://picsum.photos/seed/${row.id}/300/450`,
    banner:         row.thumbnail_url || `https://picsum.photos/seed/${row.id}/1920/1080`,
    // Zoko Anime stream fields
    mal_id:         row.mal_id || null,
    anilist_id:     row.anilist_id || null,
    total_episodes: row.total_episodes || 1,
    stream_source:  row.stream_source || 'mal',
    download_url:   row.download_url || null,
    // Legacy stream fields (kept for backward compat with old DB rows)
    stream_url:     row.stream_url || row.mega_url || null,
    mega_url:       row.mega_url || null,
    stream_type:    row.stream_type || 'zoko',
    genre:          row.category || [],
    category:       Array.isArray(row.category) ? row.category.join(', ') : (row.category || ''),
    rating:         parseFloat(row.rating_avg) || 5.0,
    rating_avg:     parseFloat(row.rating_avg) || 5.0,
    review_count:   row.review_count || 0,
    is_featured:    !!row.is_featured,
    isFeatured:     !!row.is_featured,
    featured:       !!row.is_featured,
    published:      row.published !== false,
    tags:           ['Free', 'HD'],
    status:         'Airing',
    year:           new Date(row.created_at || Date.now()).getFullYear(),
    studio:         'AniFlux Engine',
    episodes:       row.total_episodes || 1,
    trending:       !!row.is_featured,
    topRated:       (parseFloat(row.rating_avg) || 0) >= 4,
    created_at:     row.created_at,
  };
}

// ─── Helper: shape mock data into uniform format ─────────────────────────────
function shapeMock(mock) {
  const epId = mock.id?.toString() || mock.slug || 'ep-1';
  return {
    ...mock,
    anime_title:    mock.title,
    animeTitle:     mock.title,
    episode_number: 1,
    total_episodes: mock.episodes || 1,
    thumbnail_url:  mock.poster,
    thumbnailUrl:   mock.poster,
    poster:         mock.poster,
    // Zoko fields — mocks use numeric IDs if available
    mal_id:         mock.mal_id || null,
    anilist_id:     mock.anilist_id || null,
    stream_source:  mock.stream_source || 'mal',
    download_url:   mock.download_url || null,
    // Legacy stream fields
    stream_url:     mock.stream_url || null,
    mega_url:       null,
    stream_type:    'zoko',
    description:    mock.synopsis,
    review_count:   0,
    is_featured:    !!mock.featured,
    isFeatured:     !!mock.featured,
    published:      true,
    slug:           epId,
  };
}

// ═══════════════════════════════════════════════════════════════
//  EPISODES
// ═══════════════════════════════════════════════════════════════

export async function getEpisodes({ featured, anime, limit = 50 } = {}) {
  let list = [];
  if (isSupabaseConfigured() && supabase) {
    let q = supabase
      .from('episodes')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (featured === true)  q = q.eq('is_featured', true);
    if (anime)              q = q.eq('anime_title', anime);

    const { data, error } = await q;
    if (!error && data) {
      list = data.map(shapeEpisode);
    } else {
      list = getMockEpisodesList();
    }
  } else {
    list = getMockEpisodesList();
  }

  list = mergeCustomEpisodes(list);

  if (featured) list = list.filter(e => e.is_featured || e.isFeatured);
  if (anime)    list = list.filter(e => e.anime_title === anime || e.animeTitle === anime);

  return list.slice(0, limit);
}

function getMockEpisodesList() {
  return ANIME_CATALOG.map(shapeMock);
}

export async function getEpisode(id) {
  const customList = getLocalCustomEpisodes();
  const foundCustom = customList.find(e => String(e.id) === String(id) || e.slug === id);
  if (foundCustom) return foundCustom;

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', id)
      .single();
    if (!error && data) return shapeEpisode(data);
  }

  const mock = ANIME_CATALOG.find(a => String(a.id) === String(id) || a.slug === id);
  return mock ? shapeMock(mock) : null;
}

export async function getAnimeEpisodes(animeTitleOrId) {
  let list = [];
  if (isSupabaseConfigured() && supabase) {
    let title = animeTitleOrId;
    if (animeTitleOrId.includes('-') && animeTitleOrId.length === 36) {
      const { data } = await supabase
        .from('episodes')
        .select('anime_title')
        .eq('id', animeTitleOrId)
        .single();
      if (data) title = data.anime_title;
    }

    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .eq('anime_title', title)
      .eq('published', true)
      .order('episode_number', { ascending: true });

    if (!error && data) list = data.map(shapeEpisode);
  }

  if (list.length === 0) {
    const ep = ANIME_CATALOG.find(a => String(a.id) === String(animeTitleOrId) || a.slug === animeTitleOrId);
    if (ep) {
      list = ANIME_CATALOG.filter(a => a.title === ep.title).map(shapeMock);
    }
  }

  return mergeCustomEpisodes(list);
}

// ═══════════════════════════════════════════════════════════════
//  AI RECOMMENDATION & SIMILAR TITLES ENGINE
// ═══════════════════════════════════════════════════════════════

export async function getSimilarEpisodes(currentEp, limit = 8) {
  const all = await getEpisodes({ limit: 50 });
  if (!currentEp) return all.slice(0, limit);

  const currentGenres = Array.isArray(currentEp.genre)
    ? currentEp.genre
    : (currentEp.category || '').split(',').map(s => s.trim().toLowerCase());

  const recommendations = all
    .filter(ep => ep.id !== currentEp.id && ep.slug !== currentEp.slug)
    .map(ep => {
      const epGenres = Array.isArray(ep.genre)
        ? ep.genre
        : (ep.category || '').split(',').map(s => s.trim().toLowerCase());

      let score = 0;
      epGenres.forEach(g => {
        if (currentGenres.includes(g.toLowerCase())) score += 2;
      });
      if (ep.rating >= 4.5) score += 1;
      return { ep, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(item => item.ep);

  return recommendations.slice(0, limit);
}

// ═══════════════════════════════════════════════════════════════
//  ADMIN AI ASSISTANT FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export async function recalculateTrendingAndRatings() {
  const episodes = await getEpisodes({ limit: 100 });
  let updatedCount = 0;

  for (const ep of episodes) {
    const newRating = Math.min(5.0, Math.max(3.8, (ep.rating || 4.5) + (Math.random() * 0.4 - 0.2)));
    const isFeatured = newRating >= 4.7;
    await toggleFeatured(ep.id, isFeatured);
    saveLocalCustomEpisode({
      ...ep,
      rating: parseFloat(newRating.toFixed(1)),
      rating_avg: parseFloat(newRating.toFixed(1)),
      is_featured: isFeatured,
      isFeatured: isFeatured,
      featured: isFeatured,
    });
    updatedCount++;
  }

  return { success: true, count: updatedCount };
}

export async function generateAIMetadata(title) {
  await new Promise(res => setTimeout(res, 600));

  const cleanTitle = title.trim();
  const seed = encodeURIComponent(cleanTitle);

  const genresList = ['Action', 'Sci-Fi', 'Fantasy', 'Cyberpunk', 'Supernatural', 'Adventure'];
  const selectedGenres = [
    genresList[Math.floor(Math.random() * genresList.length)],
    genresList[Math.floor(Math.random() * genresList.length)],
  ].filter((v, i, a) => a.indexOf(v) === i);

  return {
    anime_title: cleanTitle,
    title: `Episode 1: The Legend Begins`,
    episode_number: 1,
    description: `In a futuristic metropolis where digital consciousness and high-octane magic collide, ${cleanTitle} embarks on an epic journey to unravel an ancient cyber-artifact capable of rewriting reality itself.`,
    category: selectedGenres.join(', '),
    stream_type: 'mp4',
    stream_url: `/api/stream/custom-${seed}`,
    mega_url: `https://mega.nz/file/${seed}`,
    thumbnail_url: `https://picsum.photos/seed/${seed}/600/900`,
    rating: (4.5 + Math.random() * 0.4).toFixed(1),
    skipIntroStart: 85,
    skipIntroEnd: 165,
  };
}

// ═══════════════════════════════════════════════════════════════
//  ADMIN — UPSERT, DELETE, TOGGLE
// ═══════════════════════════════════════════════════════════════

export async function upsertEpisode(data, userId) {
  const epId = data.id || `custom-${Date.now()}`;
  const customEp = {
    id:             epId,
    slug:           epId,
    title:          data.title || data.anime_title || '',
    anime_title:    data.anime_title,
    animeTitle:     data.anime_title,
    episode_number: parseInt(data.episode_number) || 1,
    synopsis:       data.description || '',
    description:    data.description || '',
    thumbnail_url:  data.thumbnail_url || 'https://picsum.photos/seed/anime/300/450',
    thumbnailUrl:   data.thumbnail_url || 'https://picsum.photos/seed/anime/300/450',
    poster:         data.thumbnail_url || 'https://picsum.photos/seed/anime/300/450',
    banner:         data.thumbnail_url || 'https://picsum.photos/seed/anime/1920/1080',
    // Zoko Anime fields
    mal_id:         data.mal_id ? String(data.mal_id).trim() : null,
    anilist_id:     data.anilist_id ? String(data.anilist_id).trim() : null,
    total_episodes: parseInt(data.total_episodes) || 1,
    stream_source:  data.stream_source || 'mal',
    download_url:   data.download_url || null,
    // Legacy fields — kept for backward compat
    stream_url:     data.stream_url || null,
    mega_url:       null,
    stream_type:    'zoko',
    genre:          Array.isArray(data.category) ? data.category : (data.category || '').split(',').map(s => s.trim()).filter(Boolean),
    category:       Array.isArray(data.category) ? data.category.join(', ') : (data.category || ''),
    rating:         parseFloat(data.rating) || 5.0,
    rating_avg:     parseFloat(data.rating) || 5.0,
    review_count:   0,
    is_featured:    !!data.is_featured,
    isFeatured:     !!data.is_featured,
    featured:       !!data.is_featured,
    published:      data.published !== false,
    created_at:     new Date().toISOString(),
  };

  saveLocalCustomEpisode(customEp);

  if (isSupabaseConfigured() && supabase) {
    const payload = {
      anime_title:    data.anime_title,
      title:          data.title || data.anime_title || '',
      episode_number: parseInt(data.episode_number) || 1,
      thumbnail_url:  data.thumbnail_url || '',
      // Zoko fields
      mal_id:         data.mal_id ? parseInt(data.mal_id) : null,
      anilist_id:     data.anilist_id ? parseInt(data.anilist_id) : null,
      total_episodes: parseInt(data.total_episodes) || 1,
      stream_source:  data.stream_source || 'mal',
      download_url:   data.download_url || null,
      // Legacy fields
      stream_url:     data.stream_url || null,
      stream_type:    'zoko',
      description:    data.description || '',
      category:       Array.isArray(data.category) ? data.category : (data.category || '').split(',').map(s => s.trim()).filter(Boolean),
      is_featured:    !!data.is_featured,
      published:      data.published !== false,
      created_by:     userId || null,
    };
    if (data.id) payload.id = data.id;

    const { data: result, error } = await supabase
      .from('episodes')
      .upsert(payload)
      .select()
      .single();

    if (!error && result) {
      const shaped = shapeEpisode(result);
      saveLocalCustomEpisode(shaped);
      return { success: true, data: shaped };
    }
  }

  return { success: true, data: customEp, mock: true };
}

export async function toggleFeatured(id, featured) {
  const current = getLocalCustomEpisodes();
  const target = current.find(e => e.id === id);
  if (target) {
    saveLocalCustomEpisode({ ...target, is_featured: featured, isFeatured: featured, featured });
  }

  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('episodes')
      .update({ is_featured: featured, updated_at: new Date().toISOString() })
      .eq('id', id);
    return { success: !error };
  }
  return { success: true, mock: true };
}

export async function deleteEpisode(id) {
  deleteLocalCustomEpisode(id);

  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from('episodes').delete().eq('id', id);
    return { success: !error };
  }
  return { success: true, mock: true };
}

export async function getAdminEpisodes() {
  let list = [];
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('episodes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) list = data.map(shapeEpisode);
    else list = ANIME_CATALOG.map(shapeMock);
  } else {
    list = ANIME_CATALOG.map(shapeMock);
  }

  return mergeCustomEpisodes(list);
}

export async function getTrendingEpisodes() {
  return getEpisodes({ limit: 12 });
}

export async function getFeaturedEpisodes() {
  return getEpisodes({ featured: true, limit: 4 });
}

export async function getTopRatedEpisodes() {
  let list = await getEpisodes({ limit: 20 });
  return list.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 12);
}

export async function getReviews(episodeId) {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(username, avatar_url)')
      .eq('episode_id', episodeId)
      .order('created_at', { ascending: false });

    if (!error) return data || [];
  }

  return [
    {
      id: 'mock-1',
      user_id: 'mock-user-1',
      rating: 5,
      comment: 'Absolute masterpiece! The stream quality is crystal clear.',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      profiles: { username: 'SakuraChan99', avatar_url: null },
    },
    {
      id: 'mock-2',
      user_id: 'mock-user-2',
      rating: 4,
      comment: 'Great pacing and incredible soundtrack. Fast streaming experience!',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      profiles: { username: 'NekoSensei', avatar_url: null },
    },
  ];
}

export function subscribeToReviews(episodeId, onInsert) {
  if (!isSupabaseConfigured() || !supabase) return () => {};

  const channel = supabase
    .channel(`reviews-${episodeId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'reviews', filter: `episode_id=eq.${episodeId}` },
      async (payload) => {
        const { data } = await supabase
          .from('reviews')
          .select('*, profiles(username, avatar_url)')
          .eq('id', payload.new.id)
          .single();
        if (data) onInsert(data);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export async function submitReview(episodeId, userId, rating, comment) {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: true,
      mock: true,
      data: {
        id: `mock-${Date.now()}`,
        episode_id: episodeId,
        user_id: userId,
        rating,
        comment,
        created_at: new Date().toISOString(),
        profiles: { username: 'Demo User', avatar_url: null },
      },
    };
  }

  const { data, error } = await supabase
    .from('reviews')
    .upsert({ episode_id: episodeId, user_id: userId, rating, comment })
    .select('*, profiles(username, avatar_url)')
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function getUserReview(episodeId, userId) {
  if (!isSupabaseConfigured() || !supabase || !userId) return null;
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('episode_id', episodeId)
    .eq('user_id', userId)
    .single();
  return data || null;
}

export async function updateWatchProgress(episodeId, userId, progressSeconds) {
  if (!isSupabaseConfigured() || !supabase || !userId) return;
  await supabase
    .from('watch_history')
    .upsert({
      user_id:          userId,
      episode_id:       episodeId,
      progress_seconds: Math.floor(progressSeconds),
      last_watched_at:  new Date().toISOString(),
    });
}

export async function getWatchHistory(userId) {
  if (!isSupabaseConfigured() || !supabase || !userId) return [];
  const { data, error } = await supabase
    .from('watch_history')
    .select('*, episodes(*)')
    .eq('user_id', userId)
    .order('last_watched_at', { ascending: false })
    .limit(20);

  if (error) return [];
  return (data || []).map(h => ({
    ...h,
    episode: h.episodes ? shapeEpisode(h.episodes) : null,
  }));
}
