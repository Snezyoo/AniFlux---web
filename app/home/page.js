'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  TrendingUp, Star, Sparkles, Film, Play, Bookmark, Clock,
  ChevronRight, CheckCircle2, Tv, Shield, Zap
} from 'lucide-react';
import AnimeCard from '@/components/ui/AnimeCard';
import AnimeRow from '@/components/sections/AnimeRow';
import MascotWidget from '@/components/layout/MascotWidget';
import AnimatedButton from '@/components/ui/AnimatedButton';
import GlassCard from '@/components/ui/GlassCard';
import { getTrendingEpisodes, getFeaturedEpisodes, getTopRatedEpisodes, getEpisodes } from '@/lib/api';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { ANIME_CATALOG } from '@/lib/mockData';

const HeroBanner = dynamic(() => import('@/components/sections/HeroBanner'), { ssr: false });

export default function HomePage() {
  const [trending, setTrending]     = useState([]);
  const [featured, setFeatured]     = useState([]);
  const [topRated, setTopRated]     = useState([]);
  const [allEpisodes, setAllEpisodes] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [t, f, tr, all] = await Promise.all([
        getTrendingEpisodes(),
        getFeaturedEpisodes(),
        getTopRatedEpisodes(),
        getEpisodes({ limit: 30 }),
      ]);
      setTrending(t);
      setFeatured(f);
      setTopRated(tr);
      setAllEpisodes(all);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ minHeight: '100vh', background: '#0B0C10', paddingBottom: 80 }}
    >
      {/* 1. Hero Spotlight Carousel */}
      <HeroBanner episodes={featured.length > 0 ? featured : undefined} />

      {/* Clean Engine Status Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 24px',
        background: 'rgba(139, 92, 246, 0.05)',
        borderBottom: '1px solid rgba(139, 92, 246, 0.15)',
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B5CF6', animation: 'pulse 2s infinite' }} />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <span style={{ color: '#A78BFA', fontWeight: 700 }}>AniFlux Engine Active</span> · Encrypted Session · Ultra HD Cloud Stream
        </span>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '32px 24px 0' }}>

        {/* 2. Trending Releases Carousel */}
        <div style={{ marginBottom: 48 }} id="trending">
          <AnimeRow
            title="Trending Releases"
            animeList={trending}
            icon={<TrendingUp size={20} color="#F59E0B" />}
            cardSize="md"
            loading={loading}
          />
        </div>

        {/* 3. Original Custom Modular Grid ("Top Picks of the Week") */}
        <div style={{ marginBottom: 56 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 24,
          }}>
            <div>
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <Sparkles size={20} color="#F59E0B" />
                <span>Top Picks of the Week</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                Curated high-bitrate streaming titles recommended by the community
              </p>
            </div>
            <Link href="/catalog?filter=top-rated" style={{ textDecoration: 'none' }}>
              <span style={{ color: '#F59E0B', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                View All <ChevronRight size={14} />
              </span>
            </Link>
          </div>

          {/* 4-Column Modular Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {topRated.slice(0, 8).map((anime) => (
              <Link key={anime.id} href={`/watch/${anime.id || anime.slug}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  className="glass-card"
                  style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}
                  whileHover={{ y: -4, borderColor: 'rgba(245, 158, 11, 0.4)' }}
                >
                  <div style={{ width: 80, height: 110, borderRadius: 10, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                    <Image
                      src={anime.poster || anime.thumbnail_url}
                      alt={anime.title || anime.anime_title}
                      fill
                      sizes="80px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                      <span className="badge-gold">4K HD</span>
                      <span className="badge-hd">SUB</span>
                    </div>

                    <h4 style={{
                      fontSize: '0.92rem', fontWeight: 800, color: '#FFF', margin: '0 0 6px',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {anime.title || anime.anime_title}
                    </h4>

                    <p style={{
                      color: 'var(--text-muted)', fontSize: '0.78rem', margin: '0 0 10px',
                      overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      lineHeight: 1.4,
                    }}>
                      {anime.synopsis || anime.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F59E0B', fontSize: '0.78rem', fontWeight: 800 }}>
                      <Star size={12} fill="#F59E0B" color="#F59E0B" />
                      <span>{anime.rating ? Number(anime.rating).toFixed(1) : '5.0'} Score</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* 4. Community Spotlight Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            borderRadius: 20, overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.06) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            padding: '40px 48px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 24,
            marginBottom: 56,
            boxShadow: '0 12px 40px rgba(245, 158, 11, 0.15)',
          }}
        >
          <div>
            <span style={{
              fontFamily: "'Orbitron', monospace", fontSize: '0.7rem',
              letterSpacing: '0.2em', color: '#F59E0B', textTransform: 'uppercase', fontWeight: 800,
            }}>
              ✦ Next-Gen Streaming Engine
            </span>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', fontWeight: 900,
              color: '#FFFFFF', margin: '8px 0 12px', lineHeight: 1.2,
            }}>
              Stream Unlimited Anime,<br />
              <span className="gradient-text">No Ads. No Paywalls. Ever.</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: 480, lineHeight: 1.6 }}>
              AniFlux delivers high-bitrate cloud video playback via YouTube embeds, HLS streams, and external media endpoints with zero local storage requirement.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              { icon: Star, value: `${topRated.length}+`, label: 'Top Rated Shows' },
              { icon: Film, value: `${allEpisodes.length}+`, label: 'Active Episodes' },
              { icon: Zap, value: '4K', label: 'Ultra HD Quality' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} style={{
                textAlign: 'center', padding: '18px 24px',
                background: '#1A1B26', borderRadius: 14,
                border: '1px solid rgba(245, 158, 11, 0.2)', minWidth: 110,
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                  <Icon size={24} color="#F59E0B" />
                </div>
                <div style={{
                  fontFamily: "'Orbitron', monospace", fontWeight: 900,
                  fontSize: '1.3rem', color: '#F59E0B',
                }}>
                  {value}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 5. New Episode Releases Catalog Grid */}
        <div style={{ marginBottom: 40 }}>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Film size={20} color="#F59E0B" />
            <span>New Episode Releases</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))',
            gap: 20,
          }}>
            {allEpisodes.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} size="md" />
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center', padding: '48px 24px 0',
        borderTop: '1px solid var(--glass-border)', marginTop: 40,
      }}>
        <p style={{
          fontFamily: "'Orbitron', monospace", fontSize: '0.75rem',
          letterSpacing: '0.15em', color: 'var(--text-muted)',
        }}>
          © 2024 AniFlux · <span style={{ color: '#F59E0B' }}>Encrypted Streaming Engine</span>
        </p>
      </div>

      <MascotWidget />
    </motion.div>
  );
}
