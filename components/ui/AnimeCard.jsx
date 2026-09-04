'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Star, Bookmark } from 'lucide-react';

export default function AnimeCard({ anime, size = 'md', onBookmark }) {
  const [isHovered, setIsHovered] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = (-y / (rect.height / 2)) * 8;
    const rotateY = (x / (rect.width / 2)) * 8;
    setTilt({ x: rotateX, y: rotateY });
  }, []);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const cardSizes = {
    sm: { width: 145, height: 215 },
    md: { width: 185, height: 275 },
    lg: { width: 230, height: 340 },
  };

  const { width, height } = cardSizes[size] || cardSizes.md;

  return (
    <div
      className="card-3d-wrapper"
      style={{ width, flexShrink: 0 }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="card-tilt"
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          scale: isHovered ? 1.05 : 1,
          y: isHovered ? -8 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          transformStyle: 'preserve-3d',
          position: 'relative',
          borderRadius: 14,
          overflow: 'hidden',
          background: '#1A1B26',
          border: isHovered
            ? '2px solid #F59E0B'
            : '1px solid rgba(245, 158, 11, 0.12)',
          boxShadow: isHovered
            ? '0 14px 40px rgba(245, 158, 11, 0.35), 0 0 20px rgba(245, 158, 11, 0.25)'
            : '0 4px 15px rgba(0,0,0,0.4)',
        }}
      >
        <Link href={`/watch/${anime.id || anime.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
          {/* Poster Image */}
          <div style={{ position: 'relative', width, height, borderRadius: 14, overflow: 'hidden' }}>
            <Image
              src={anime.poster || anime.thumbnail_url || 'https://picsum.photos/seed/anime/300/450'}
              alt={anime.title || anime.anime_title || 'Anime Poster'}
              fill
              sizes={`${width}px`}
              style={{
                objectFit: 'cover',
                transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                transition: 'transform 0.4s ease',
              }}
              priority={size === 'lg'}
            />

            {/* Gradient Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: isHovered
                  ? 'linear-gradient(180deg, rgba(11,12,16,0.15) 0%, rgba(11,12,16,0.88) 100%)'
                  : 'linear-gradient(180deg, rgba(11,12,16,0) 45%, rgba(11,12,16,0.85) 100%)',
                transition: 'background 0.3s ease',
              }}
            />

            {/* Top Rating Badge */}
            <div
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                right: 8,
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                zIndex: 2,
              }}
            >
              {anime.rating > 0 && (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    padding: '2px 7px',
                    borderRadius: 6,
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    background: 'rgba(11, 12, 16, 0.85)',
                    backdropFilter: 'blur(8px)',
                    color: '#F59E0B',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                  }}
                >
                  <Star size={10} fill="#F59E0B" color="#F59E0B" />
                  {Number(anime.rating).toFixed(1)}
                </span>
              )}
            </div>

            {/* Play Button Overlay on Hover */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.5 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 3,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 25px rgba(245, 158, 11, 0.8)',
                }}
              >
                <Play size={20} fill="#FFF" color="#FFF" style={{ marginLeft: 2 }} />
              </div>
            </motion.div>

            {/* Card Content Footer */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: 12,
                zIndex: 4,
              }}
            >
              <h3
                style={{
                  color: '#FFFFFF',
                  fontSize: size === 'sm' ? '0.78rem' : '0.86rem',
                  fontWeight: 700,
                  margin: '0 0 6px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {anime.title || anime.anime_title}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span className="badge-gold">
                    EP {anime.episode_number || anime.episodes || 12}
                  </span>
                  <span className="badge-hd">HD</span>
                </div>

                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setBookmarked(!bookmarked);
                    onBookmark?.(anime);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: bookmarked ? '#F59E0B' : 'var(--text-muted)',
                    padding: 2,
                  }}
                  whileTap={{ scale: 0.8 }}
                >
                  <Bookmark size={14} fill={bookmarked ? '#F59E0B' : 'none'} />
                </motion.button>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
