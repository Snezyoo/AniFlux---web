'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getZokoStreamUrl } from '@/lib/zokoPlayer';

/**
 * VideoPlayer — AniFlux Zoko Anime dynamic streaming player.
 *
 * Props:
 *   malId             (number|string) MyAnimeList anime ID
 *   currentEpisode    (number)        Episode number (default: 1)
 *   track             ('sub'|'dub')   Audio track (default: 'sub')
 *   embedUrl          (string)        Optional direct override embed URL
 *   onEpisodeComplete (function)      Callback when episode finishes playing
 *   title             (string)        Accessible title for iframe
 */
export default function VideoPlayer({
  malId,
  currentEpisode = 1,
  track = 'sub',
  embedUrl = '',
  onEpisodeComplete,
  title = 'Now Playing',
}) {
  const prevUrlRef = useRef('');

  useEffect(() => {
    const handleMessage = (event) => {
      // Strict origin check — only trust Zoko
      if (event.origin !== 'https://zokoanime.video') return;
      const { type } = event.data || {};
      if (type === 'complete' && typeof onEpisodeComplete === 'function') {
        onEpisodeComplete();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onEpisodeComplete]);

  // Compute final Zoko stream URL dynamically
  const streamUrl = embedUrl || (malId ? getZokoStreamUrl({ source: 'mal', id: malId, episode: currentEpisode, track }) : '');

  // Track URL changes
  const urlChanged = streamUrl !== prevUrlRef.current;
  if (urlChanged) prevUrlRef.current = streamUrl;

  if (!streamUrl && !malId) {
    return (
      <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 20, background: '#171717', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A3A3A3', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Fetching media stream...
      </div>
    );
  }

  const iframeKey = `${malId || streamUrl}-${currentEpisode}-${track}`;

  return (
    <div style={{ width: '100%' }}>
      {/* Ambient glassmorphic border glow wrapper */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          borderRadius: 20,
          padding: 1,
          background: 'linear-gradient(135deg, rgba(139,92,246,0.5) 0%, rgba(245,158,11,0.4) 50%, rgba(139,92,246,0.3) 100%)',
          boxShadow: [
            '0 0 0 1px rgba(245,158,11,0.15)',
            '0 0 50px rgba(245,158,11,0.15)',
            '0 0 120px rgba(245,158,11,0.12)',
            '0 24px 80px rgba(0,0,0,0.6)',
          ].join(', '),
        }}
      >
        {/* Radial ambient backdrop blur */}
        <div
          style={{
            position: 'absolute',
            inset: -30,
            background: 'radial-gradient(ellipse at 50% 60%, rgba(139,92,246,0.2) 0%, rgba(245,158,11,0.06) 55%, transparent 80%)',
            filter: 'blur(45px)',
            pointerEvents: 'none',
            zIndex: 0,
            borderRadius: 40,
          }}
        />

        {/* 16:9 Aspect-ratio container */}
        <motion.div
          key={iframeKey}
          initial={{ opacity: 0.4, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{
            position: 'relative',
            width: '100%',
            paddingTop: '56.25%', // 16:9 ratio
            borderRadius: 18,
            overflow: 'hidden',
            background: '#000',
            zIndex: 1,
          }}
        >
          {streamUrl ? (
            <iframe
              key={iframeKey}
              src={streamUrl}
              title={title}
              allowFullScreen
              allow="fullscreen; autoplay; picture-in-picture"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups-to-escape-sandbox"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: 18,
                background: '#000',
              }}
            />
          ) : (
            /* Loading placeholder */
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                background: '#08080C',
                borderRadius: 18,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: '3px solid rgba(245,158,11,0.15)',
                  borderTopColor: '#F59E0B',
                  animation: 'spin 0.9s linear infinite',
                }}
              />
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', margin: 0 }}>
                Fetching media stream...
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}
        </motion.div>
      </div>

      {/* Status bar */}
      <div
        style={{
          marginTop: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '7px 14px',
          borderRadius: 8,
          background: 'rgba(18,19,28,0.7)',
          border: '1px solid rgba(245,158,11,0.12)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: streamUrl ? '#22c55e' : '#6b7280',
            boxShadow: streamUrl ? '0 0 6px rgba(34,197,94,0.7)' : 'none',
            flexShrink: 0,
            display: 'inline-block',
          }}
        />
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
          {streamUrl ? 'Streaming via Zoko HD · Zero ads · No buffering' : 'Fetching media stream...'}
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '0.65rem',
            fontWeight: 700,
            color: '#F59E0B',
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 4,
            padding: '2px 8px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Zoko HD
        </span>
      </div>
    </div>
  );
}
