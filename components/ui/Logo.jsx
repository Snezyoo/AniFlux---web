'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Logo({ size = 'md', animated = true }) {
  const sizeMap = {
    sm: { fontSize: '1.25rem', letterSpacing: '-0.03em' },
    md: { fontSize: '1.65rem', letterSpacing: '-0.04em' },
    lg: { fontSize: '2.4rem', letterSpacing: '-0.05em' },
    xl: { fontSize: '3.6rem', letterSpacing: '-0.06em' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <motion.div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      whileHover={
        animated
          ? {
              scale: 1.04,
              filter: 'drop-shadow(0 0 14px rgba(245, 158, 11, 0.65))',
            }
          : {}
      }
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <span
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 900,
          fontSize: currentSize.fontSize,
          letterSpacing: currentSize.letterSpacing,
          color: '#FFFFFF',
          lineHeight: 1,
        }}
      >
        ANI
      </span>
      <span
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 900,
          fontSize: currentSize.fontSize,
          letterSpacing: currentSize.letterSpacing,
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
          marginLeft: 2,
        }}
      >
        FLUX
      </span>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#F59E0B',
          marginLeft: 4,
          alignSelf: 'flex-end',
          marginBottom: 4,
          boxShadow: '0 0 8px #F59E0B',
        }}
      />
    </motion.div>
  );

  return (
    <Link href="/home" style={{ textDecoration: 'none' }}>
      {content}
    </Link>
  );
}
