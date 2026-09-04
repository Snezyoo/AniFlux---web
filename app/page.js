'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Play, CheckCircle2, ArrowRight } from 'lucide-react';
import ParticleCanvas from '@/components/sections/ParticleCanvas';
import AnimatedButton from '@/components/ui/AnimatedButton';
import MascotWidget from '@/components/layout/MascotWidget';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function LandingPortal() {
  const [animStage, setAnimStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setAnimStage(1), 200);
    const t2 = setTimeout(() => setAnimStage(2), 1200);
    const t3 = setTimeout(() => setAnimStage(3), 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: '#0B0C10',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background Particle Canvas with Golden Lights */}
      <ParticleCanvas />

      {/* Radial Glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '75vw',
          height: '75vh',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.16) 0%, rgba(217, 119, 6, 0.04) 50%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Top Bar Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: animStage >= 3 ? 1 : 0, y: animStage >= 3 ? 0 : -20 }}
        transition={{ duration: 0.8 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '24px 36px',
          display: 'flex',
          justify: 'flex-end',
          alignItems: 'center',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ThemeToggle />
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <AnimatedButton variant="ghost" size="sm">
              Sign In
            </AnimatedButton>
          </Link>
        </div>
      </motion.header>

      {/* Main Center Intro */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '0 24px',
          maxWidth: 900,
        }}
      >
        <div style={{ position: 'relative', marginBottom: 32, overflow: 'visible', padding: '20px 0' }}>
          <AnimatePresence>
            {animStage >= 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 1, letterSpacing: '0px' }}
                animate={{
                  opacity: 1,
                  scale: animStage >= 2 ? 1.22 : 1,
                  letterSpacing: animStage >= 2 ? '14px' : '4px',
                }}
                transition={{
                  duration: 1.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{ display: 'inline-block' }}
              >
                <h1
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 900,
                    fontSize: 'clamp(3.2rem, 9.5vw, 6.8rem)',
                    lineHeight: 1,
                    margin: 0,
                    textTransform: 'uppercase',
                    userSelect: 'none',
                    position: 'relative',
                  }}
                >
                  <span style={{ color: '#FFFFFF' }}>ANI</span>
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      marginLeft: 4,
                    }}
                  >
                    FLUX
                  </span>
                </h1>

                {/* Metallic Golden Sweep Highlight */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.4, delay: 0.4, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)',
                    pointerEvents: 'none',
                    mixBlendMode: 'overlay',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: animStage >= 3 ? 1 : 0, y: animStage >= 3 ? 0 : 24 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.35rem)',
              color: 'var(--text-secondary)',
              maxWidth: 600,
              margin: '0 auto 36px',
              lineHeight: 1.6,
              fontWeight: 500,
            }}
          >
            The Ultimate Open-Source Anime Experience.{' '}
            <span style={{ color: '#F59E0B', fontWeight: 700 }}>1080p & 4K Streaming</span> with zero ads.
          </p>

          {/* Single Central CTA Button: Go to Homepage */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 52 }}>
            <Link href="/home" style={{ textDecoration: 'none' }}>
              <motion.button
                style={{
                  padding: '16px 42px',
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 0 25px rgba(245, 158, 11, 0.4)',
                  letterSpacing: '0.02em',
                }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: '0 0 40px rgba(245, 158, 11, 0.65)',
                }}
                whileTap={{
                  scale: 0.95,
                  transition: { type: 'spring', stiffness: 500, damping: 15 },
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Play size={18} fill="#FFF" color="#FFF" />
                <span>Go to Homepage</span>
                <ArrowRight size={18} />
              </motion.button>
            </Link>
          </div>

          {/* Clean Taglines (No Emojis) */}
          <div
            style={{
              display: 'flex',
              justify: 'center',
              alignItems: 'center',
              gap: 36,
              flexWrap: 'wrap',
            }}
          >
            {[
              '1080p / 4K Cloud Streaming',
              'No Ads. No Paywalls.',
              'Community Powered',
            ].map((tagline) => (
              <div
                key={tagline}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={16} color="#F59E0B" />
                <span>{tagline}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      <MascotWidget />
    </div>
  );
}
