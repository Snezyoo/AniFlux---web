'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, Flame, Star, Tv, ChevronLeft, ChevronRight, Play, Award } from 'lucide-react';
import { getTrendingAnime } from '@/lib/jikan';

export default function TrendingPage() {
  const [animeList, setAnimeList] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [page,      setPage]      = useState(1);
  const [hasNext,   setHasNext]   = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getTrendingAnime(page, 24);
      setAnimeList(data);
      setHasNext(data.length === 24);
      setLoading(false);
    }
    load();
  }, [page]);

  const topThree = animeList.slice(0, 3);
  const rest = animeList.slice(3);

  return (
    <div style={{ minHeight: '100vh', background: '#08080A', paddingTop: 88, paddingBottom: 80 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={22} color="#F59E0B" />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: '#FFF', margin: 0 }}>
                Trending <span className="gradient-text">Right Now</span>
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                Currently airing top picks · Updated live from MAL
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Top 3 Podium ── */}
        {!loading && topThree.length === 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 16, marginBottom: 44, alignItems: 'end' }}>
            {[topThree[1], topThree[0], topThree[2]].map((anime, idx) => {
              const rank = idx === 1 ? 1 : idx === 0 ? 2 : 3;
              const isFirst = rank === 1;
              const medalColor = rank === 1 ? '#F59E0B' : rank === 2 ? '#CBD5E1' : '#D97706';
              const podiumHeight = rank === 1 ? 340 : 280;
              return (
                <Link key={anime.mal_id} href={`/watch/${anime.mal_id}`} style={{ textDecoration: 'none' }}>
                  <motion.div whileHover={{ y: -8 }} style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', height: podiumHeight, border: `2px solid ${isFirst ? '#F59E0B' : 'rgba(255,255,255,0.08)'}`, boxShadow: isFirst ? '0 0 40px rgba(245,158,11,0.35)' : '0 4px 20px rgba(0,0,0,0.5)', cursor: 'pointer' }}>
                    {anime.poster && (
                      <Image src={anime.poster} alt={anime.title} fill style={{ objectFit: 'cover' }} />
                    )}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 20%, rgba(0,0,0,0.95) 100%)' }} />

                    {/* Rank badge */}
                    <div style={{ position: 'absolute', top: 12, left: 12, width: 36, height: 36, borderRadius: '50%', background: medalColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontWeight: 900, fontSize: '1rem', color: '#000', boxShadow: `0 0 16px ${medalColor}80` }}>
                      {rank === 1 ? <Award size={18} /> : `#${rank}`}
                    </div>

                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, zIndex: 4 }}>
                      <h3 style={{ color: '#FFF', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: isFirst ? '1rem' : '0.9rem', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {anime.title}
                      </h3>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {anime.rating > 0 && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#F59E0B', fontSize: '0.78rem', fontWeight: 800 }}>
                            <Star size={11} fill="#F59E0B" /> {(anime.rating * 2).toFixed(1)}
                          </span>
                        )}
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem' }}>
                          {anime.total_episodes > 1 ? `${anime.total_episodes} ep` : 'Airing'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
        )}

        {/* ── Section header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <TrendingUp size={20} color="#F59E0B" />
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: '#FFF', margin: 0 }}>All Trending</h2>
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
            <motion.div key={`page-${page}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: 20 }}>
              {(page === 1 ? rest : animeList).map((anime, idx) => (
                <TrendingCard key={anime.mal_id} anime={anime} rank={page === 1 ? idx + 4 : idx + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Pagination ── */}
        {!loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 44 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(18,19,28,0.9)', color: page === 1 ? 'rgba(255,255,255,0.2)' : '#FFF', cursor: page === 1 ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '0.85rem' }}>
              <ChevronLeft size={16} /> Previous
            </button>
            <span style={{ fontFamily: 'monospace', color: '#F59E0B', fontWeight: 700, fontSize: '0.9rem', padding: '10px 16px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10 }}>
              Page {page}
            </span>
            <button onClick={() => setPage(p => p + 1)} disabled={!hasNext}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(18,19,28,0.9)', color: !hasNext ? 'rgba(255,255,255,0.2)' : '#FFF', cursor: !hasNext ? 'not-allowed' : 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '0.85rem' }}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

function TrendingCard({ anime, rank }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={`/watch/${anime.mal_id}`} style={{ textDecoration: 'none' }}>
      <motion.div
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        style={{ borderRadius: 14, overflow: 'hidden', background: '#1A1B26', border: hovered ? '2px solid #F59E0B' : '1px solid rgba(245,158,11,0.12)', boxShadow: hovered ? '0 12px 36px rgba(245,158,11,0.3)' : '0 4px 15px rgba(0,0,0,0.4)', cursor: 'pointer', position: 'relative' }}
      >
        {/* Rank number */}
        <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 10, width: 28, height: 28, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', borderBottomRightRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontWeight: 900, fontSize: '0.72rem', color: '#F59E0B' }}>
          #{rank}
        </div>

        <div style={{ position: 'relative', width: '100%', paddingTop: '148%' }}>
          {anime.poster ? (
            <Image src={anime.poster} alt={anime.title} fill sizes="185px"
              style={{ objectFit: 'cover', transform: hovered ? 'scale(1.07)' : 'scale(1)', transition: 'transform 0.4s ease' }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: '#0f0f18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tv size={36} color="rgba(245,158,11,0.3)" />
            </div>
          )}
          <div style={{ position: 'absolute', inset: 0, background: hovered ? 'linear-gradient(180deg,rgba(0,0,0,.15) 0%,rgba(0,0,0,.88) 100%)' : 'linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,.85) 100%)', transition: 'background 0.3s' }} />

          {anime.rating > 0 && (
            <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 6, fontSize: '0.68rem', fontWeight: 800, background: 'rgba(11,12,16,0.85)', backdropFilter: 'blur(8px)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
              <Star size={10} fill="#F59E0B" color="#F59E0B" /> {(anime.rating * 2).toFixed(1)}
            </div>
          )}

          <AnimatePresence>
            {hovered && (
              <motion.div initial={{ opacity: 0, scale: .5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .5 }}
                style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#F59E0B 0%,#D97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 25px rgba(245,158,11,.8)' }}>
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
              <span className="badge-hd" style={{ fontSize: '0.62rem' }}>HD</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
