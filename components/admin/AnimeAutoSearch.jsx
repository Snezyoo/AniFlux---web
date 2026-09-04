'use client';

/**
 * AnimeAutoSearch — Live Jikan (MAL) search with one-click auto-fill.
 *
 * Props:
 *   onSelectAnime(anime) — called with shaped anime object on result click
 *   initialValue         — pre-populate the input (for edit mode)
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Zap, X, Tv, Star } from 'lucide-react';

export default function AnimeAutoSearch({ onSelectAnime, initialValue = '' }) {
  const [query,    setQuery]    = useState(initialValue);
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [open,     setOpen]     = useState(false);
  const [selected, setSelected] = useState(!!initialValue);

  const debounceRef  = useRef(null);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const doSearch = useCallback(async (q) => {
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res  = await fetch(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=6&sfw=true&order_by=popularity&sort=asc`
      );
      const data = await res.json();
      setResults(data.data || []);
      setOpen(true);
    } catch (_) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSelected(false);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 380);
  };

  const handleSelect = (raw) => {
    const epCount = (raw.episodes && raw.episodes > 1) ? raw.episodes : 12;
    const shaped = {
      mal_id:         raw.mal_id,
      anime_title:    raw.title_english || raw.title,
      title:          raw.title_english || raw.title,
      total_episodes: epCount,
      episodes:       epCount,
      thumbnail_url:  raw.images?.jpg?.large_image_url || raw.images?.jpg?.image_url || '',
      description:    raw.synopsis || '',
      category:       (raw.genres || []).map(g => g.name).join(', '),
      stream_source:  'mal',
      rating:         raw.score ? parseFloat((raw.score / 2).toFixed(1)) : 5.0,
      type:           raw.type || 'TV',
      status:         raw.status || '',
      year:           raw.year || '',
    };
    setQuery(shaped.anime_title);
    setSelected(true);
    setOpen(false);
    setResults([]);
    onSelectAnime?.(shaped);
  };

  const handleClear = () => {
    setQuery('');
    setSelected(false);
    setResults([]);
    setOpen(false);
    onSelectAnime?.(null);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', marginBottom: 24 }}>

      {/* ── Label ── */}
      <label style={{
        display: 'flex', alignItems: 'center', gap: 6,
        marginBottom: 8, fontSize: '0.82rem', fontWeight: 700,
        color: '#F59E0B', fontFamily: "'Plus Jakarta Sans', sans-serif",
        letterSpacing: '0.04em',
      }}>
        <Zap size={14} color="#F59E0B" style={{ flexShrink: 0 }} />
        Auto-Fill from MyAnimeList
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', fontWeight: 400 }}>
          — type a title to search live
        </span>
      </label>

      {/* ── Input ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(245,158,11,0.04)',
        border: `1px solid ${selected ? '#22c55e' : open ? '#F59E0B' : 'rgba(245,158,11,0.25)'}`,
        borderRadius: 12, padding: '12px 16px',
        transition: 'all 0.2s ease',
        boxShadow: open ? '0 0 0 3px rgba(245,158,11,0.1)' : 'none',
      }}>
        {loading
          ? <Loader2 size={16} color="#F59E0B" style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
          : <Search size={16} color={selected ? '#22c55e' : '#F59E0B'} style={{ flexShrink: 0 }} />
        }
        <input
          id="anime-autosearch"
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder="Type anime title… e.g. Spy x Family, Naruto, Bleach"
          autoComplete="off"
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: selected ? '#4ade80' : '#FFFFFF',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.9rem', fontWeight: selected ? 700 : 400,
          }}
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 0, display: 'flex', flexShrink: 0 }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Status hint ── */}
      <div style={{ marginTop: 5, minHeight: 16 }}>
        {loading && (
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Searching MyAnimeList…
          </p>
        )}
        {selected && (
          <p style={{ color: '#4ade80', fontSize: '0.72rem', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
            ✓ Form auto-filled — review details below and publish.
          </p>
        )}
        {!loading && !selected && query.length > 0 && query.length < 2 && (
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', margin: 0 }}>
            Type at least 2 characters to search.
          </p>
        )}
      </div>

      {/* ── Results Dropdown ── */}
      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', zIndex: 200,
              top: 'calc(100% - 8px)', left: 0, right: 0,
              background: '#0F1018',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(245,158,11,0.1)',
            }}
          >
            {/* Header */}
            <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {results.length} result{results.length !== 1 ? 's' : ''} from MyAnimeList
              </span>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem' }}>click to auto-fill</span>
            </div>

            {results.map((raw, idx) => {
              const title   = raw.title_english || raw.title;
              const poster  = raw.images?.jpg?.image_url || '';
              const score   = raw.score ? `★ ${raw.score}` : null;
              const eps     = raw.episodes ? `${raw.episodes} ep` : 'Airing';
              const genres  = (raw.genres || []).slice(0, 3).map(g => g.name).join(' · ');

              return (
                <motion.div
                  key={raw.mal_id}
                  onClick={() => handleSelect(raw)}
                  whileHover={{ background: 'rgba(245,158,11,0.08)' }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', cursor: 'pointer',
                    borderBottom: idx < results.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Poster thumbnail */}
                  <div style={{ width: 36, height: 52, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#1A1B26', position: 'relative' }}>
                    {poster ? (
                      <img src={poster} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Tv size={14} color="rgba(245,158,11,0.3)" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.875rem', margin: '0 0 3px', fontFamily: "'Plus Jakarta Sans', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {title}
                    </p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontFamily: 'monospace', color: '#F59E0B', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(245,158,11,0.1)', padding: '1px 6px', borderRadius: 4, border: '1px solid rgba(245,158,11,0.2)' }}>
                        MAL #{raw.mal_id}
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem' }}>{eps}</span>
                      {score && (
                        <span style={{ color: '#F59E0B', fontSize: '0.68rem', fontWeight: 700 }}>{score}</span>
                      )}
                      <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.65rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{genres}</span>
                    </div>
                  </div>

                  {/* Auto-fill badge */}
                  <div style={{ flexShrink: 0, padding: '4px 10px', borderRadius: 8, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.06em' }}>
                    FILL
                  </div>
                </motion.div>
              );
            })}

            {/* Footer */}
            <div style={{ padding: '8px 14px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem', margin: 0, textAlign: 'center' }}>
                Data from MyAnimeList via Jikan API · IDs are verified and exact
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
