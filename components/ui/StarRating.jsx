'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

/**
 * StarRating — Animated 5-star interactive or display-only rating with Crunchyroll Gold theme.
 */
export default function StarRating({
  value = 0,
  onChange,
  size = 20,
  showLabel = false,
  color = '#FFB800',
  readOnly = false,
}) {
  const [hovered, setHovered] = useState(0);
  const interactive = !!onChange && !readOnly;
  const display = hovered || value;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= display;

        return (
          <motion.button
            key={star}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && setHovered(star)}
            onMouseLeave={() => interactive && setHovered(0)}
            onClick={() => interactive && onChange(star)}
            style={{
              background: 'none',
              border: 'none',
              cursor: interactive ? 'pointer' : 'default',
              padding: 1,
              display: 'flex',
              alignItems: 'center',
            }}
            whileHover={interactive ? { scale: 1.25 } : {}}
            whileTap={interactive ? { scale: 0.85, transition: { type: 'spring', stiffness: 500, damping: 15 } } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <motion.div
              animate={{ color: filled ? color : 'rgba(255,255,255,0.2)' }}
              transition={{ duration: 0.15 }}
            >
              <Star
                size={size}
                fill={filled ? color : 'none'}
                color={filled ? color : 'rgba(255,255,255,0.2)'}
                strokeWidth={filled ? 0 : 1.5}
              />
            </motion.div>
          </motion.button>
        );
      })}

      {showLabel && (
        <motion.span
          key={value}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            fontFamily: "'Orbitron', monospace",
            fontWeight: 700,
            fontSize: `${size * 0.75}px`,
            color,
            marginLeft: 4,
          }}
        >
          {value > 0 ? value.toFixed(1) : '—'}
        </motion.span>
      )}
    </div>
  );
}

/**
 * RatingBar — Horizontal display of average rating with breakdown.
 */
export function RatingBar({ rating = 0, reviewCount = 0 }) {
  const pct = (rating / 5) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: '2.5rem',
          fontWeight: 900,
          color: '#FFB800',
          lineHeight: 1,
        }}>
          {rating > 0 ? rating.toFixed(1) : '—'}
        </div>
        <div>
          <StarRating value={Math.round(rating)} size={18} readOnly />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '4px 0 0', fontFamily: "'Inter', sans-serif" }}>
            {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'var(--glass-border)', borderRadius: 2, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #FF6B00 0%, #FFB800 100%)',
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
}
