'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import AnimeCard from '@/components/ui/AnimeCard';
import Link from 'next/link';

/**
 * AnimeRow — A horizontally scrollable row of anime cards.
 * Props:
 *  - title: section heading
 *  - animeList: array of anime objects
 *  - icon: optional emoji or react node
 *  - cardSize: 'sm' | 'md' | 'lg'
 *  - viewAllHref: link for "View All"
 */
export default function AnimeRow({
  title,
  animeList = [],
  icon = null,
  cardSize = 'md',
  viewAllHref = '/catalog',
  loading = false,
}) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = dir === 'left' ? -400 : 400;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  if (!loading && !animeList.length) return null;

  return (
    <motion.section
      style={{ padding: '32px 0', position: 'relative' }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        marginBottom: 20,
      }}>
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {icon && <span style={{ fontSize: '1.3rem' }}>{icon}</span>}
          <span>{title}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href={viewAllHref} style={{ textDecoration: 'none' }}>
            <motion.span
              style={{
                color: 'var(--accent-secondary)',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
              }}
              whileHover={{ x: 3 }}
            >
              View All <ChevronRight size={14} />
            </motion.span>
          </Link>

          {/* Scroll Arrows */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[{ dir: 'left', Icon: ChevronLeft }, { dir: 'right', Icon: ChevronRight }].map(({ dir, Icon }) => (
              <motion.button
                key={dir}
                onClick={() => scroll(dir)}
                style={{
                  width: 30, height: 30,
                  borderRadius: 8,
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
                whileHover={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
                whileTap={{ scale: 0.9 }}
              >
                <Icon size={14} />
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards Row */}
      <div
        ref={scrollRef}
        className="scroll-row"
        style={{
          display: 'flex',
          gap: 16,
          padding: '8px 24px 16px',
        }}
      >
        {loading
          ? [...Array(6)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: cardSize === 'sm' ? 140 : cardSize === 'lg' ? 220 : 180,
                  height: cardSize === 'sm' ? 210 : cardSize === 'lg' ? 330 : 270,
                  borderRadius: 12,
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  animation: 'pulse 1.5s infinite ease-in-out',
                  flexShrink: 0,
                }}
              />
            ))
          : animeList.map((anime, i) => (
              <motion.div
                key={anime.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <AnimeCard anime={anime} size={cardSize} />
              </motion.div>
            ))}
      </div>

      {/* Edge fade gradients */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 72,
        bottom: 0,
        width: 40,
        background: 'linear-gradient(90deg, var(--bg-primary), transparent)',
        pointerEvents: 'none',
        zIndex: 2,
      }} />
      <div style={{
        position: 'absolute',
        right: 0,
        top: 72,
        bottom: 0,
        width: 40,
        background: 'linear-gradient(270deg, var(--bg-primary), transparent)',
        pointerEvents: 'none',
        zIndex: 2,
      }} />
    </motion.section>
  );
}
