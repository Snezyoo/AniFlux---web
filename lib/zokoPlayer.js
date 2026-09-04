/**
 * lib/zokoPlayer.js — AniFlux × Zoko Anime Stream Engine
 *
 * Generates embed URLs for the Zoko Anime player.
 * Supports both MAL and AniList IDs as the content source.
 *
 * Usage:
 *   getZokoStreamUrl({ source: 'mal', id: 21, episode: 5, track: 'dub' })
 *   → "https://zokoanime.video/stream/mal/21/5/dub?color=f59e0b&autoplay=true"
 */

/**
 * @param {Object} options
 * @param {'mal' | 'anilist'} [options.source='mal']  ID source type
 * @param {number | string}    options.id             MAL or AniList anime ID
 * @param {number}            [options.episode=1]     Episode number
 * @param {'sub' | 'dub'}     [options.track='sub']   Audio track
 * @param {string}            [options.color='f59e0b'] Accent color (hex, no #)
 * @param {boolean}           [options.autoplay=true]  Autoplay flag
 * @returns {string} Full Zoko embed URL, or '' if id is missing
 */
export function getZokoStreamUrl({
  source = 'mal',
  id,
  episode = 1,
  track = 'sub',
  color = 'f59e0b',
  autoplay = true,
} = {}) {
  if (!id) return '';
  const cleanId = String(id).trim();
  const cleanEp = Math.max(1, parseInt(episode, 10) || 1);
  const cleanTrack = track === 'dub' ? 'dub' : 'sub';
  const cleanSource = source === 'anilist' ? 'anilist' : 'mal';
  return `https://zokoanime.video/stream/${cleanSource}/${cleanId}/${cleanEp}/${cleanTrack}?color=${color}&autoplay=${autoplay}`;
}

/**
 * Convenience helpers for common sources.
 */
export const zokoMal = (id, episode, track) =>
  getZokoStreamUrl({ source: 'mal', id, episode, track });

export const zokoAniList = (id, episode, track) =>
  getZokoStreamUrl({ source: 'anilist', id, episode, track });
