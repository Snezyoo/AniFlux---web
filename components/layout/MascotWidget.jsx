'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Sparkles, Heart } from 'lucide-react';

const MASCOT_QUOTES = [
  "Welcome to AniFlux! Ready for 4K streaming?",
  "Did you know? All streams are 100% free!",
  "Check out today's trending titles!",
  "Explore top rated series and new releases!",
  "What anime are we binge-watching today?",
  "Don't forget to bookmark your favorite episodes!",
];

export default function MascotWidget() {
  const [open, setOpen] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [hasGreeted, setHasGreeted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasGreeted) {
        setOpen(true);
        setHasGreeted(true);
      }
    }, 3500);
    return () => clearTimeout(timer);
  }, [hasGreeted]);

  const handleNextQuote = () => {
    setQuoteIndex((i) => (i + 1) % MASCOT_QUOTES.length);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 90,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}
    >
      {/* Speech Bubble */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid rgba(255, 184, 0, 0.3)',
              borderRadius: 16,
              padding: '12px 16px',
              maxWidth: 240,
              marginBottom: 12,
              boxShadow: '0 8px 30px rgba(255, 107, 0, 0.25)',
              backdropFilter: 'blur(16px)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setOpen(false)}
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 2,
              }}
            >
              <X size={12} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Sparkles size={13} color="#FFB800" />
              <span
                style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#FFB800',
                }}
              >
                Flux Assistant
              </span>
            </div>

            <p
              onClick={handleNextQuote}
              style={{
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                margin: 0,
                cursor: 'pointer',
                lineHeight: 1.4,
              }}
            >
              "{MASCOT_QUOTES[quoteIndex]}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clean Mascot Button with Sparkles Icon instead of emoji */}
      <motion.button
        onClick={() => {
          if (!open) handleNextQuote();
          setOpen(!open);
        }}
        style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF6B00 0%, #FFB800 100%)',
          border: '2px solid #FFD600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 25px rgba(255, 107, 0, 0.5)',
        }}
        whileHover={{ scale: 1.1, boxShadow: '0 0 35px rgba(255, 184, 0, 0.8)' }}
        whileTap={{ scale: 0.9 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      >
        <Sparkles size={22} color="#FFFFFF" />
      </motion.button>
    </div>
  );
}
