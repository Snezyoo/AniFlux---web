'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search, SlidersHorizontal, TrendingUp, Loader2,
  ChevronLeft, ChevronRight, Star, Tv, Film, X,
} from 'lucide-react';
import { getTopAnime, getNewestAnime, getTrendingAnime, searchAnime, getAnimeByGenre, JIKAN_GENRE_IDS } from '@/lib/jikan';

const GENRES = ['All', ...Object.keys(JIKAN_GENRE_IDS)];

const TABS = [
  { id: 'top',      label: 'Top Rated',   icon: Star,       fetcher: (p) => getTopAnime(p, 24) },
  { id: 'newest',   label: 'New Season',  icon: Film,       fetcher: (p) => getNewestAnime(p, 24) },
  { id: 'trending', label: 'Trending',    icon: TrendingUp, fetcher: (p) => getTrendingAnime(p, 24) },
];

export default function CatalogPage() {
  const [activeTab,   setActiveTab]   = useState('top');
  const [animeList,   setAnimeList]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [genre,       setGenre]       = useState('All');
  const [page,        setPage]        = useState(1);
  const [hasNext,     setHasNext]     = useState(false);
  const debounceRef = useRef(null);

  const loadCatalog = useCallback(async (tab, g, p) => {
    setLoading(true);
    let results = [];
    try {
      if (g !== 'All') {
        results = await getAnimeByGenre(g, p, 24);
        setHasNext(results.length === 24);
      } else {
        const tabDef = TABS.find(t => t.id === tab);
        results = await tabDef.fetcher(p);
        setHasNext(results.length === 24);
      }
    } catch (_) {
      results = [];
    }
    setAnimeList(results);
    setLoading(false);
  }, []);

  const loadSearch = useCallback(async (q, p) => {
    setLoading(true);
    const results = await searchAnime(q, p, 24);
    setAnimeList(results);
    setHasNext(results.length === 24);
    setLoading(false);
  }, []);

  // Tab / genre change
  useEffect(() => {
    if (search) return;
    setPage(1);
    loadCatalog(activeTab, genre, 1);
  }, [activeTab, genre, loadCatalog, search]);

  // Page change
  useEffect(() => {
    if (search) {
      loadSearch(search, page);
    } else {
      loadCatalog(activeTab, genre, page);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Debounced search
  const handleSearchInput = (val) => {
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
      if (val.trim()) {
        loadSearch(val, 1);
      } else {
        loadCatalog(activeTab, genre, 1);
      }
    }, 500);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
    loadCatalog(activeTab, genre, 1);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#08080A', paddingTop: 88, paddingBottom: 80 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 900, color: '#FFF', marginBottom: 8 }}>
            Anime <span className="gradient-text">Catalog</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Live data from MyAnimeList · Streaming via Zoko HD Engine
          </p>
        </motion.div>

        {/* ── Search Bar ── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(26,27,38,0.85)', border: '1px solid rgba(245,158,11,0.15)',
            borderRadius: 14, padding: '12px 18px', flex: 1, minWidth: 220,
            transition: 'border-color 0.2s',
          }}>
            <Search size={16} color="#F59E0B" />
            <input
              type="text"
              placeholder="Search any anime title…"
              value={searchInput}
              onChange={e => handleSearchInput(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#FFF', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9rem', width: '100%' }}
            />
            {searchInput && (
              <button onClick={clearSearch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0, display: 'flex' }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Genre filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(26,27,38,0.85)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 14, padding: '0 16px' }}>
            <SlidersHorizontal size={15} color="#F59E0B" />
            <select
              value={genre}
              onChange={e => { setGenre(e.target.value); setPage(1); }}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#FFF', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', cursor: 'pointer', padding: '12px 0' }}
            >
              {GENRES.map(g => <option key={g} value={g} style={{ background: '#121216', color: '#FFF' }}>{g}</option>)}
            </select>
          </div>
        </div>

        {/* ── Tabs (only when no search active) ── */}
        {!search && genre === 'All' && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`catalog-tab-${id}`}
                onClick={() => { setActiveTab(id); setPage(1); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 12, border: '1px solid',
                  fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
                  fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
                  borderColor: activeTab === id ? '#F59E0B' : 'rgba(255,255,255,0.08)',
                  background: activeTab === id ? 'rgba(245,158,11,0.15)' : 'rgba(18,19,28,0.9)',
                  color: activeTab === id ? '#F59E0B' : 'rgba(255,255,255,0.5)',
                  boxShadow: activeTab === id ? '0 0 20px rgba(245,158,11,0.2)' : 'none',
                }}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        )}

        {/* ── Genre Pills ── */}
        {!search && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 28 }}>
            {GENRES.map(g => (
              <motion.button
                key={g}
                onClick={() => { setGenre(g); setPage(1); }}
                whileHover={{ borderColor: '#F59E0B' }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '5px 14px', borderRadius: 20, border: '1px solid',
                  borderColor: genre === g ? '#F59E0B' : 'rgba(255,255,255,0.08)',
                  background: genre === g ? 'rgba(245,158,11,0.12)' : 'transparent',
                  color: genre === g ? '#F59E0B' : 'rgba(255,255,255,0.45)',
                  fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.2s',
                }}
              >
                {g}
              </motion.button>
            ))}
          </div>
        )}

        {/* ── Results Grid ── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: 20 }}>
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} style={{ height: 275, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', animation: 'shimmer 1.5s ease-in-out infinite' }} />
              ))}
              <style>{`@keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:1} }`}</style>
            </motion.div>
          ) : animeList.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '80px 24px', color: 'rgba(255,255,255,0.35)' }}>
              <Search size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem' }}>
                No results found{searchInput ? ` for "${searchInput}"` : ''}.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={`${activeTab}-${genre}-${page}-${search}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: 20 }}
            >
              {animeList.map(anime => (
                <JikanAnimeCard key={anime.mal_id} anime={anime} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Pagination ── */}
        {!loading && animeList.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 40 }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(18,19,28,0.9)',
                color: page === 1 ? 'rgba(255,255,255,0.2)' : '#FFF', cursor: page === 1 ? 'not-allowed' : 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '0.85rem',
              }}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span style={{ fontFamily: 'monospace', color: '#F59E0B', fontWeight: 700, fontSize: '0.9rem', padding: '10px 16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10 }}>
              Page {page}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!hasNext}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(18,19,28,0.9)',
                color: !hasNext ? 'rgba(255,255,255,0.2)' : '#FFF', cursor: !hasNext ? 'not-allowed' : 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '0.85rem',
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Inline Jikan Anime Card ────────────────────────────────────────────────────
function JikanAnimeCard({ anime }) {
  const [hovered, setHovered] = useState(false);
  const scoreNum = anime.rating ? Number(anime.rating * 2).toFixed(1) : null; // convert back to /10 for display

  return (
    <Link href={`/watch/${anime.mal_id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        style={{
          borderRadius: 14, overflow: 'hidden', position: 'relative',
          background: '#1A1B26',
          border: hovered ? '2px solid #F59E0B' : '1px solid rgba(245,158,11,0.12)',
          boxShadow: hovered ? '0 14px 40px rgba(245,158,11,0.3), 0 0 20px rgba(245,158,11,0.2)' : '0 4px 15px rgba(0,0,0,0.4)',
          cursor: 'pointer',
        }}
      >
        {/* Poster */}
        <div style={{ position: 'relative', width: '100%', paddingTop: '148%' }}>
          {anime.poster ? (
            <Image
              src={anime.poster}
              alt={anime.title}
              fill
              sizes="185px"
              style={{ objectFit: 'cover', transform: hovered ? 'scale(1.07)' : 'scale(1)', transition: 'transform 0.4s ease' }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1A1B26, #0B0C10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tv size={40} color="rgba(245,158,11,0.3)" />
            </div>
          )}

          {/* Gradient overlay */}
          <div style={{ position: 'absolute', inset: 0, background: hovered ? 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.88) 100%)' : 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.85) 100%)', transition: 'background 0.3s' }} />

          {/* Score badge */}
          {scoreNum && (
            <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 6, fontSize: '0.68rem', fontWeight: 800, background: 'rgba(11,12,16,0.85)', backdropFilter: 'blur(8px)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
              <Star size={10} fill="#F59E0B" color="#F59E0B" /> {scoreNum}
            </div>
          )}

          {/* Type badge */}
          <div style={{ position: 'absolute', top: 8, right: 8, padding: '2px 6px', borderRadius: 5, fontSize: '0.62rem', fontWeight: 700, background: 'rgba(139,92,246,0.85)', backdropFilter: 'blur(8px)', color: '#FFF' }}>
            {anime.type || 'TV'}
          </div>

          {/* Play button on hover */}
          <AnimatePresence>
            {hovered && (
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 25px rgba(245,158,11,0.8)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFF" style={{ marginLeft: 2 }}><path d="M8 5v14l11-7z"/></svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer info */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, zIndex: 4 }}>
            <h3 style={{ color: '#FFF', fontSize: '0.84rem', fontWeight: 700, margin: '0 0 5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {anime.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="badge-gold" style={{ fontSize: '0.62rem' }}>
                {anime.total_episodes > 1 ? `${anime.total_episodes} EPS` : 'EP 1'}
              </span>
              <span className="badge-hd" style={{ fontSize: '0.62rem' }}>HD</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
