'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
  Play, Star, Heart, Share2, Bookmark, ArrowLeft, Download,
  ListVideo, MessageSquare, AlertCircle, Loader2, Sparkles,
  Server, MonitorPlay, Globe, Check, ExternalLink,
} from 'lucide-react';
import VideoPlayer from '@/components/ui/VideoPlayer';
import AnimeCard from '@/components/ui/AnimeCard';
import ReviewsSection from '@/components/sections/ReviewsSection';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import MascotWidget from '@/components/layout/MascotWidget';
import { getEpisode, getSimilarEpisodes } from '@/lib/api';
import { getAnimeById } from '@/lib/jikan';
import { getZokoStreamUrl } from '@/lib/zokoPlayer';
import { useAuth } from '@/context/AuthContext';

// ─── Server configuration ────────────────────────────────────────────────────
const SERVERS = [
  { id: 'zoko',   label: 'Server 1 (Zoko HD)', icon: MonitorPlay },
  { id: 'backup', label: 'Server 2 (Backup)',   icon: Server      },
  { id: 'direct', label: 'Direct Download',     icon: Download    },
];

export default function WatchPage() {
  const params   = useParams();
  const router   = useRouter();
  const { user } = useAuth();
  const rawId    = params.id; // MAL numeric ID (50265) or custom DB ID (custom-1787...)

  // ── Core anime metadata & ID state ─────────────────────────────────────────
  const [anime,          setAnime]          = useState(null);
  const [resolvedMalId,  setResolvedMalId]  = useState(null);
  const [similarAnime,   setSimilarAnime]   = useState([]);
  const [loading,        setLoading]        = useState(true);

  // ── Player controls ────────────────────────────────────────────────────────
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [activeTrack,    setActiveTrack]    = useState('sub');   // 'sub' | 'dub'
  const [activeServer,   setActiveServer]   = useState('zoko');  // 'zoko' | 'backup' | 'direct'

  // ── UI state ───────────────────────────────────────────────────────────────
  const [bookmarked, setBookmarked] = useState(false);
  const [liked,      setLiked]      = useState(false);
  const [activeTab,  setActiveTab]  = useState('episodes'); // 'episodes' | 'reviews'
  const [shareToast, setShareToast] = useState(false);

  // ── Active MAL ID resolution ────────────────────────────────────────────────
  const activeMalId = useMemo(() => {
    if (resolvedMalId) return resolvedMalId;
    if (anime?.mal_id) return String(anime.mal_id);
    if (/^\d+$/.test(String(rawId))) return String(rawId);
    return null;
  }, [resolvedMalId, anime, rawId]);

  // ── Total episodes from metadata (defaults to 12 if undefined or 1) ─────────
  const totalEpisodes = useMemo(() => {
    const count = anime?.total_episodes || anime?.episodes;
    return (count && count > 1) ? count : 12;
  }, [anime]);

  // ── Generate Zoko embed URL ─────────────────────────────────────────────────
  const zokoEmbedUrl = useMemo(() => {
    if (activeServer !== 'zoko' && activeServer !== 'backup') return '';
    if (!activeMalId) return anime?.stream_url || '';
    const source = anime?.stream_source || 'mal';
    return getZokoStreamUrl({
      source,
      id: activeMalId,
      episode: currentEpisode,
      track:   activeTrack,
    });
  }, [activeMalId, anime, currentEpisode, activeTrack, activeServer]);

  // ── Load & resolve anime metadata ──────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    let animeData = null;
    let malIdFound = null;

    // 1. If rawId is numeric (MAL ID directly)
    if (/^\d+$/.test(String(rawId))) {
      malIdFound = String(rawId);
      animeData = await getAnimeById(rawId);
      if (animeData) {
        animeData = {
          ...animeData,
          id:             rawId,
          mal_id:         rawId,
          total_episodes: animeData.episodes || animeData.total_episodes || 12,
        };
      }
    } else {
      // 2. If rawId is a custom DB ID (e.g. custom-1787... or UUID)
      const dbEntry = await getEpisode(rawId);
      if (dbEntry) {
        if (dbEntry.mal_id) {
          malIdFound = String(dbEntry.mal_id);
          // Enrich with Jikan live data if available
          const jikanData = await getAnimeById(dbEntry.mal_id);
          if (jikanData) {
            animeData = {
              ...dbEntry,
              ...jikanData,
              id:             rawId,
              mal_id:         dbEntry.mal_id,
              total_episodes: jikanData.episodes || dbEntry.total_episodes || 12,
            };
          } else {
            animeData = dbEntry;
          }
        } else {
          animeData = dbEntry;
        }
      }
    }

    setResolvedMalId(malIdFound);
    setAnime(animeData);

    if (animeData) {
      const sim = await getSimilarEpisodes(animeData, 8);
      setSimilarAnime(sim);

      // Restore saved watch state from localStorage
      if (typeof window !== 'undefined') {
        const saved = JSON.parse(localStorage.getItem('aniflux_watch_state') || '{}');
        if (saved[rawId]) {
          if (saved[rawId].bookmarked) setBookmarked(true);
          if (saved[rawId].liked)      setLiked(true);
          if (saved[rawId].episode)    setCurrentEpisode(saved[rawId].episode);
        }
      }
    }

    setLoading(false);
  }, [rawId]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Persist watch state to localStorage ───────────────────────────────────
  useEffect(() => {
    if (!rawId) return;
    const saved = JSON.parse(localStorage.getItem('aniflux_watch_state') || '{}');
    saved[rawId] = { bookmarked, liked, episode: currentEpisode };
    localStorage.setItem('aniflux_watch_state', JSON.stringify(saved));
  }, [rawId, bookmarked, liked, currentEpisode]);

  // ── Auto-advance handler (called by VideoPlayer on postMessage 'complete') ─
  const handleEpisodeComplete = useCallback(() => {
    setCurrentEpisode(prev => {
      const next = prev + 1;
      if (next > totalEpisodes) return prev; // Already at last episode
      return next;
    });
  }, [totalEpisodes]);

  // ── Share handler ──────────────────────────────────────────────────────────
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  // ── External Download Handler Fix (Zero 404s) ──────────────────────────────
  const handleDownload = () => {
    const customDl = anime?.download_url;
    if (customDl) {
      window.open(customDl, '_blank', 'noopener,noreferrer');
      return;
    }

    const titleToSearch = anime?.title_english || anime?.anime_title || anime?.title;
    if (titleToSearch) {
      const mirrorUrl = `https://animepahe.ru/search?q=${encodeURIComponent(titleToSearch)}`;
      window.open(mirrorUrl, '_blank', 'noopener,noreferrer');
    } else if (activeMalId) {
      window.open(`https://myanimelist.net/anime/${activeMalId}`, '_blank', 'noopener,noreferrer');
    } else {
      alert('Download link currently unavailable for this entry.');
    }
  };

  // ── Episode grid array ──────────────────────────────────────────────────────
  const episodeNumbers = useMemo(
    () => Array.from({ length: totalEpisodes }, (_, i) => i + 1),
    [totalEpisodes]
  );

  // ────────────────────────────────────────────────────────────────────────────
  // LOADING STATE
  // ────────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#08080C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(245,158,11,0.15)', borderTopColor: '#F59E0B', animation: 'spin 0.9s linear infinite' }} />
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', margin: 0 }}>
          Resolving Anime Stream…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!anime) {
    return (
      <div style={{ minHeight: '100vh', background: '#08080C', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <AlertCircle size={48} color="#EF4444" />
        <h2 style={{ color: '#FFF', margin: 0 }}>Anime Not Found</h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', margin: 0 }}>
          No entry found for ID: <code style={{ color: '#F59E0B' }}>{rawId}</code>
        </p>
        <AnimatedButton variant="primary" onClick={() => router.push('/home')}>Back to Home</AnimatedButton>
      </div>
    );
  }

  const animeTitle  = anime.anime_title || anime.title || 'Unknown Anime';
  const posterImg   = anime.poster || anime.thumbnail_url;

  return (
    <div style={{ minHeight: '100vh', background: '#08080C', paddingTop: 80, paddingBottom: 80 }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 24px' }}>

        {/* ── Back Link ── */}
        <Link href="/home" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', marginBottom: 22, fontSize: '0.875rem', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#A78BFA'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* ════════════════════════════════════════════════════════════════════
            HIERARCHY 1 — Video Player
        ════════════════════════════════════════════════════════════════════ */}
        {activeMalId || zokoEmbedUrl ? (
          <VideoPlayer
            malId={activeMalId}
            currentEpisode={currentEpisode}
            track={activeTrack}
            embedUrl={zokoEmbedUrl}
            onEpisodeComplete={handleEpisodeComplete}
            title={`${animeTitle} — Episode ${currentEpisode}`}
          />
        ) : (
          <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 20, background: '#171717', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A3A3A3', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Resolving Anime Stream…
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            HIERARCHY 2 — Top Action Bar: Sub/Dub · Server Switcher · Actions
        ════════════════════════════════════════════════════════════════════ */}
        <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Left cluster: Track + Server toggles */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>

            {/* Episode badge */}
            <span className="badge-gold">EP {currentEpisode}</span>

            {/* SUB / DUB Toggle */}
            <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 4 }}>
              {(['sub', 'dub']).map(track => (
                <button
                  key={track}
                  id={`track-${track}`}
                  onClick={() => setActiveTrack(track)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 7,
                    border: 'none',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: activeTrack === track
                      ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                      : 'transparent',
                    color: activeTrack === track ? '#000' : 'rgba(255,255,255,0.45)',
                    boxShadow: activeTrack === track ? '0 2px 12px rgba(245,158,11,0.4)' : 'none',
                  }}
                >
                  {track.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Server Switcher */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {SERVERS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  id={`server-${id}`}
                  onClick={() => {
                    if (id === 'direct') { handleDownload(); return; }
                    setActiveServer(id);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px',
                    borderRadius: 9,
                    border: '1px solid',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    borderColor: activeServer === id && id !== 'direct' ? '#8B5CF6' : 'rgba(255,255,255,0.1)',
                    background: activeServer === id && id !== 'direct'
                      ? 'rgba(139,92,246,0.15)'
                      : id === 'direct'
                        ? 'rgba(245,158,11,0.08)'
                        : 'rgba(255,255,255,0.03)',
                    color: activeServer === id && id !== 'direct'
                      ? '#A78BFA'
                      : id === 'direct'
                        ? '#F59E0B'
                        : 'rgba(255,255,255,0.45)',
                  }}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Right cluster: Actions */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <AnimatedButton
              variant={liked ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setLiked(l => !l)}
              icon={<Heart size={15} fill={liked ? '#FFF' : 'none'} />}
            >
              {liked ? 'Liked' : 'Like'}
            </AnimatedButton>

            <AnimatedButton
              variant={bookmarked ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setBookmarked(b => !b)}
              icon={<Bookmark size={15} fill={bookmarked ? '#FFF' : 'none'} />}
            >
              {bookmarked ? 'Saved' : 'Bookmark'}
            </AnimatedButton>

            <AnimatedButton
              variant="gold"
              size="md"
              onClick={handleDownload}
              icon={<Download size={15} />}
            >
              Download Ep {currentEpisode}
            </AnimatedButton>

            <div style={{ position: 'relative' }}>
              <AnimatedButton
                variant="ghost"
                size="md"
                onClick={handleShare}
                icon={shareToast ? <Check size={15} /> : <Share2 size={15} />}
              >
                {shareToast ? 'Copied!' : 'Share'}
              </AnimatedButton>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            HIERARCHY 3 — Anime Metadata + Synopsis
        ════════════════════════════════════════════════════════════════════ */}
        <GlassCard style={{ marginTop: 24, padding: 24 }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            {posterImg && (
              <div style={{ width: 72, height: 104, borderRadius: 10, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(245,158,11,0.2)' }}>
                <Image src={posterImg} alt={animeTitle} width={72} height={104} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#FFF', margin: 0, lineHeight: 1.2 }}>
                  {animeTitle}
                </h1>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#F59E0B', fontSize: '0.85rem', fontWeight: 800 }}>
                  <Star size={14} fill="#F59E0B" />
                  {anime.rating ? Number(anime.rating).toFixed(1) : '5.0'}
                </span>
              </div>
              <p style={{ color: '#A78BFA', fontSize: '0.9rem', fontWeight: 700, margin: '0 0 10px' }}>
                Episode {currentEpisode}
                {totalEpisodes > 1 && <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}> / {totalEpisodes}</span>}
                {anime.category && <> &nbsp;·&nbsp; <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{typeof anime.category === 'string' ? anime.category : anime.category.join(', ')}</span></>}
              </p>
              {anime.description && (
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', lineHeight: 1.65, margin: 0 }}>
                  {anime.description}
                </p>
              )}

              {/* MAL / AniList ID badges */}
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {activeMalId && (
                  <a href={`https://myanimelist.net/anime/${activeMalId}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, background: 'rgba(30,64,175,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd', fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none' }}>
                    <Globe size={11} /> MAL #{activeMalId} <ExternalLink size={10} />
                  </a>
                )}
                {anime.anilist_id && (
                  <a href={`https://anilist.co/anime/${anime.anilist_id}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6, background: 'rgba(0,150,99,0.12)', border: '1px solid rgba(0,200,130,0.25)', color: '#6ee7b7', fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none' }}>
                    <Globe size={11} /> AniList #{anime.anilist_id} <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* ════════════════════════════════════════════════════════════════════
            HIERARCHY 4 — Episode Grid + Reviews
        ════════════════════════════════════════════════════════════════════ */}
        <div style={{ marginTop: 44 }}>
          {/* Tab row */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            {[
              { id: 'episodes', label: `All Episodes (${totalEpisodes})`, icon: ListVideo },
              { id: 'reviews',  label: 'Community Reviews',               icon: MessageSquare },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`tab-${id}`}
                onClick={() => setActiveTab(id)}
                style={{
                  padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800, fontSize: '0.85rem', transition: 'all 0.2s',
                  background: activeTab === id
                    ? 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)'
                    : 'rgba(18,19,28,0.9)',
                  color: activeTab === id ? '#FFF' : 'rgba(255,255,255,0.4)',
                  boxShadow: activeTab === id ? '0 4px 20px rgba(139,92,246,0.35)' : 'none',
                }}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'episodes' ? (
              <motion.div
                key="episodes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Number grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))',
                  gap: 8,
                }}>
                  {episodeNumbers.map(epNum => {
                    const isCurrent = epNum === currentEpisode;
                    return (
                      <motion.button
                        key={epNum}
                        id={`ep-btn-${epNum}`}
                        onClick={() => setCurrentEpisode(epNum)}
                        whileHover={{ y: -2, scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          padding: '10px 6px',
                          borderRadius: 10,
                          border: '1px solid',
                          cursor: 'pointer',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          transition: 'all 0.2s ease',
                          borderColor: isCurrent ? '#F59E0B' : 'rgba(255,255,255,0.08)',
                          background: isCurrent
                            ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                            : 'rgba(18,19,28,0.8)',
                          color: isCurrent ? '#000' : 'rgba(255,255,255,0.6)',
                          boxShadow: isCurrent ? '0 4px 16px rgba(245,158,11,0.35)' : 'none',
                        }}
                      >
                        EP {epNum}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ReviewsSection episodeId={rawId} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            HIERARCHY 5 — Similar Anime
        ════════════════════════════════════════════════════════════════════ */}
        {similarAnime.length > 0 && (
          <div style={{ marginTop: 60 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Sparkles size={20} color="#F59E0B" />
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: '#FFF', margin: 0 }}>
                You Might Also Like
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: 20 }}>
              {similarAnime.map(sim => (
                <AnimeCard key={sim.id} anime={sim} size="md" />
              ))}
            </div>
          </div>
        )}

      </div>
      <MascotWidget />
    </div>
  );
}
