'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Bookmark, Star, ChevronLeft, ChevronRight, Tv, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { HERO_ANIME_LIST } from '@/lib/mockData';

export default function HeroBanner({ episodes: propEpisodes }) {
  const [current, setCurrent] = useState(0);
  const [bookmarked, setBookmarked] = useState(new Set());
  const anime = propEpisodes && propEpisodes.length > 0 ? propEpisodes : HERO_ANIME_LIST;

  const goNext = useCallback(() => setCurrent((c) => (c + 1) % anime.length), [anime.length]);
  const goPrev = () => setCurrent((c) => (c - 1 + anime.length) % anime.length);

  useEffect(() => {
    const t = setInterval(goNext, 6000);
    return () => clearInterval(t);
  }, [goNext]);

  const activeAnime = anime[current] || anime[0];

  const toggleBookmark = (id) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div
      style={{
        position: 'relative',
        height: 'clamp(500px, 72vh, 680px)',
        width: '100%',
        overflow: 'hidden',
        background: '#0B0C10',
      }}
    >
      {/* Dynamic Background Image with Crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeAnime.id || current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <Image
            src={activeAnime.banner || activeAnime.poster || activeAnime.thumbnail_url}
            alt={activeAnime.title || activeAnime.anime_title}
            fill
            priority
            style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
          />

          {/* High-Contrast Gradient Masks fading into Obsidian Slate (#0B0C10) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `
                linear-gradient(90deg, #0B0C10 0%, rgba(11,12,16,0.88) 40%, rgba(11,12,16,0.3) 75%, transparent 100%),
                linear-gradient(180deg, rgba(11,12,16,0.4) 0%, transparent 40%, #0B0C10 100%)
              `,
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Hero Content Glass Panel */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 1440,
          margin: '0 auto',
          padding: '0 24px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          paddingBottom: 64,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeAnime.id || current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            style={{
              maxWidth: 600,
              background: 'rgba(26, 27, 38, 0.65)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(245, 158, 11, 0.18)',
              borderRadius: 20,
              padding: '32px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Badges Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
              <span className="badge-gold">4K ULTRA HD</span>
              <span className="badge-hd">SUB / DUB</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                EP {activeAnime.episode_number || 12}
              </span>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#F59E0B',
                }}
              >
                <Star size={11} fill="#F59E0B" color="#F59E0B" />
                {activeAnime.rating ? activeAnime.rating.toFixed(1) : '8.8'}
              </span>
            </div>

            {/* Title */}
            <h1
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontWeight: 900,
                color: '#FFFFFF',
                lineHeight: 1.1,
                marginBottom: 12,
                letterSpacing: '-0.02em',
              }}
            >
              {activeAnime.title || activeAnime.anime_title}
            </h1>

            {/* Synopsis */}
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                marginBottom: 24,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {activeAnime.synopsis || activeAnime.description}
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <Link href={`/watch/${activeAnime.id || activeAnime.slug}`} style={{ textDecoration: 'none' }}>
                <AnimatedButton variant="primary" size="lg" icon={<Play size={18} fill="#FFF" color="#FFF" />}>
                  Watch Now
                </AnimatedButton>
              </Link>

              <AnimatedButton
                variant="secondary"
                size="lg"
                onClick={() => toggleBookmark(activeAnime.id)}
                icon={<Bookmark size={18} fill={bookmarked.has(activeAnime.id) ? '#F59E0B' : 'none'} />}
              >
                {bookmarked.has(activeAnime.id) ? 'Bookmarked' : 'Add to List'}
              </AnimatedButton>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Navigation Controls */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            right: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            zIndex: 20,
          }}
        >
          {/* Slide Indicators */}
          <div style={{ display: 'flex', gap: 6 }}>
            {anime.map((a, i) => (
              <motion.button
                key={a.id || i}
                onClick={() => setCurrent(i)}
                style={{
                  height: 4,
                  borderRadius: 2,
                  background: i === current ? '#F59E0B' : 'rgba(255,255,255,0.3)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
                animate={{ width: i === current ? 28 : 10 }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>

          {/* Arrows */}
          <div style={{ display: 'flex', gap: 8 }}>
            <motion.button
              onClick={goPrev}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(26, 27, 38, 0.75)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              whileHover={{ borderColor: '#F59E0B', color: '#F59E0B' }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft size={18} />
            </motion.button>
            <motion.button
              onClick={goNext}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(26, 27, 38, 0.75)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              whileHover={{ borderColor: '#F59E0B', color: '#F59E0B' }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight size={18} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
