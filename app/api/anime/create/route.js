import { NextResponse } from 'next/server';
import { upsertEpisode } from '@/lib/api';

/**
 * POST /api/anime/create
 * 1-Click Auto-Import API endpoint.
 *
 * Saves imported MyAnimeList metadata directly into local DB storage / Supabase.
 * Sets the record primary key directly to `String(mal_id)` so /watch/[mal_id]
 * resolves instantly with zero ID mismatches.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { mal_id, title, poster, synopsis, episodes, genres, rating, download_url } = body;

    if (!mal_id || !title) {
      return NextResponse.json({ error: 'Missing required fields (mal_id, title)' }, { status: 400 });
    }

    const numericId = String(mal_id).trim();

    const episodeData = {
      id:             numericId, // Use numeric MAL ID as primary key
      mal_id:         numericId,
      anime_title:    title,
      title:          title,
      thumbnail_url:  poster || '',
      description:    synopsis || '',
      total_episodes: parseInt(episodes, 10) || 12,
      category:       genres || '',
      rating:         parseFloat(rating) || 5.0,
      stream_source:  'mal',
      download_url:   download_url || null,
      published:      true,
      is_featured:    true,
    };

    const result = await upsertEpisode(episodeData, 'admin-system');

    return NextResponse.json({
      success: true,
      message: `Successfully published ${title}!`,
      data: result.data || episodeData,
    });
  } catch (err) {
    console.error('1-Click Auto-Import Error:', err);
    return NextResponse.json({ error: err.message || 'Server error publishing anime' }, { status: 500 });
  }
}
