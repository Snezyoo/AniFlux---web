'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Star, Tv, ChevronRight, ChevronLeft, Play } from 'lucide-react';
import { getNewestAnime } from '@/lib/jikan';

export default function NewestPage() {
  const [animeList, setAnimeList] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [page,      setPage]      = useState(1);
  const [hasNext,   setHasNext]   = useState(false);
  const [featured,  setFeatured]  = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getNewestAnime(page, 24);
      setAnimeList(data);
      setHasNext(data.length === 24);
      if (page === 1 && data.length > 0) setFeatured(data[0]);
      setLoading(false);
    }
    load();
  }, [page]);

  return (
    <div style={{ minHeight: '100vh', background: '#08080A', paddingTop: 80, paddingBottom: 80 }}>

      {/* ── Hero Spotlight ── */}
      <AnimatePresence mode="wait">
        {featured && !loading && (
          <motion.div
            key={featured.mal_id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'relative', height: 420, overflow: 'hidden', marginBottom: 48 }}
          >
            {/* Banner image */}
            {featured.poster && (
              <Image
                src={featured.poster}
                alt={featured.title}
                fill
                style={{ objectFit: 'cover', filter: 'brightness(0.35) saturate(1.2)' }}
                priority
              />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,8,10,0) 0%, #08080A 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(8,8,10,0.95) 0%, transparent 60%)' }} />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 2, maxWidth: 1400, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'flex-end', paddingBottom: 48 }}>
              <div style={{ maxWidth: 520 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 6, background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', color: '#F59E0B', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    <Sparkles size={11} /> New This Season
                  </span>
                  {featured.rating > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#F59E0B', fontSize: '0.82rem', fontWeight: 800 }}>
                      <Star size={13} fill="#F59E0B" /> {(featured.rating * 2).toFixed(1)}/10
                    </span>
                  )}
                </div>
                <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: '#FFF', margin: '0 0 12px', lineHeight: 1.15 }}>
                  {featured.title}
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.65, margin: '0 0 20px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {featured.synopsis}
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Link href={`/watch/${featured.mal_id}`} style={{ textDecoration: 'none' }}>
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(245,158,11,0.5)' }}
                      whileTap={{ scale: 0.97 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', border: 'none', color: '#000', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}
                    >
                      <Play size={16} fill="#000" /> Watch Now
                    </motion.button>
                  </Link>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', fontWeight: 600 }}>
                    <Tv size={14} /> {featured.total_episodes > 1 ? `${featured.total_episodes} Episodes` : 'Airing'}
                  </span>
                </div>
              </div>
            </div>

            {/* Episode thumbnails row */}
            <div style={{ position: 'absolute', right: 24, bottom: 24, display: 'flex', gap: 8, zIndex: 3 }}>
              {animeList.slice(1, 5).map(a => (
                <Link key={a.mal_id} href={`/watch/${a.mal_id}`}>
                  <motion.div whileHover={{ scale: 1.08, borderColor: '#F59E0B' }} style={{ width: 72, height: 100, borderRadius: 8, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.15)', transition: 'border-color 0.2s', cursor: 'pointer' }}>
                    {a.poster && <Image src={a.poster} alt={a.title} width={72} height={100} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />}
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>

        {/* ── Section header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: '1.6rem', fontWeight: 900, color: '#FFF', margin: '0 0 4px' }}>
              New <span className="gradient-text">This Season</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Currently airing · Updated live from MyAnimeList
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.7)', animation: 'pulse 2s infinite' }} />
            <span style={{ color: '#6ee7b7', fontSize: '0.78rem', fontWeight: 700 }}>Live Data</span>
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
          </div>
        </div>

        {/* ── Grid ── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: 20 }}>
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} style={{ height: 275, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', animation: 'shimmer 1.5s ease-in-out infinite' }} />
              ))}
              <style>{`@keyframes shimmer{0%,100%{opacity:.5}50%{opacity:1}}`}</style>
            </motion.div>
          ) : (
            <motion.div key={`page-${page}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: 20 }}>
              {animeList.map(anime => (
                <NewestCard key={anime.mal_id} anime={anime} onHover={() => setFeatured(anime)} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Pagination ── */}
        {!loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 44 }}>
            <motion.button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              whileHover={page > 1 ? { scale: 1.05 } : {}} whileTap={page > 1 ? { scale: 0.97 } : {}}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(18,19,28,0.9)', color: page === 1 ? 'rgba(255,255,255,0.2)' : '#FFF', cursor: page === 1 ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '0.85rem' }}>
              <ChevronLeft size={16} /> Previous
            </motion.button>
            <span style={{ fontFamily: 'monospace', color: '#F59E0B', fontWeight: 700, fontSize: '0.9rem', padding: '10px 16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10 }}>
              Page {page}
            </span>
            <motion.button onClick={() => setPage(p => p + 1)} disabled={!hasNext}
              whileHover={hasNext ? { scale: 1.05 } : {}} whileTap={hasNext ? { scale: 0.97 } : {}}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(18,19,28,0.9)', color: !hasNext ? 'rgba(255,255,255,0.2)' : '#FFF', cursor: !hasNext ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '0.85rem' }}>
              Next <ChevronRight size={16} />
            </motion.button>
          </div>
        )}

      </div>
    </div>
  );
}

function NewestCard({ anime, onHover }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={`/watch/${anime.mal_id}`} style={{ textDecoration: 'none' }}>
      <motion.div
        onHoverStart={() => { setHovered(true); onHover?.(); }}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        style={{ borderRadius: 14, overflow: 'hidden', background: '#1A1B26', border: hovered ? '2px solid #F59E0B' : '1px solid rgba(245,158,11,0.12)', boxShadow: hovered ? '0 12px 36px rgba(245,158,11,0.3)' : '0 4px 15px rgba(0,0,0,0.4)', cursor: 'pointer' }}
      >
        <div style={{ position: 'relative', width: '100%', paddingTop: '148%' }}>
          {anime.poster ? (
            <Image src={anime.poster} alt={anime.title} fill sizes="185px"
              style={{ objectFit: 'cover', transform: hovered ? 'scale(1.07)' : 'scale(1)', transition: 'transform 0.4s ease' }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: '#0f0f18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tv size={36} color="rgba(245,158,11,0.3)" />
            </div>
          )}
          <div style={{ position: 'absolute', inset: 0, background: hovered ? 'linear-gradient(180deg, rgba(0,0,0,.15) 0%, rgba(0,0,0,.88) 100%)' : 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,.85) 100%)', transition: 'background 0.3s' }} />

          {anime.rating > 0 && (
            <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 6, fontSize: '0.68rem', fontWeight: 800, background: 'rgba(11,12,16,0.85)', backdropFilter: 'blur(8px)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
              <Star size={10} fill="#F59E0B" color="#F59E0B" /> {(anime.rating * 2).toFixed(1)}
            </div>
          )}

          {/* NEW badge */}
          <div style={{ position: 'absolute', top: 8, right: 8, padding: '2px 6px', borderRadius: 5, fontSize: '0.62rem', fontWeight: 800, background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#FFF', letterSpacing: '0.04em' }}>
            NEW
          </div>

          <AnimatePresence>
            {hovered && (
              <motion.div initial={{ opacity: 0, scale: .5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .5 }}
                style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 25px rgba(245,158,11,.8)' }}>
                  <Play size={20} fill="#FFF" color="#FFF" style={{ marginLeft: 2 }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, zIndex: 4 }}>
            <h3 style={{ color: '#FFF', fontSize: '0.84rem', fontWeight: 700, margin: '0 0 5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {anime.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="badge-gold" style={{ fontSize: '0.62rem' }}>{anime.total_episodes > 1 ? `${anime.total_episodes} EPS` : 'Airing'}</span>
              <span className="badge-hd" style={{ fontSize: '0.62rem' }}>SUB</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
