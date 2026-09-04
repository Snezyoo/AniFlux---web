'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Shield, Upload, Film, BarChart2, Star, Activity,
  Tv, Plus, Trash2, Edit3, ToggleLeft, ToggleRight,
  TrendingUp, Check, AlertCircle, Loader2, RefreshCw,
  Database, Sparkles, Hash, Download as DownloadIcon,
} from 'lucide-react';
import AuthGuard from '@/components/auth/AuthGuard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import GlassCard from '@/components/ui/GlassCard';
import AnimeAutoSearch from '@/components/admin/AnimeAutoSearch';
import { getAdminEpisodes, upsertEpisode, toggleFeatured, deleteEpisode } from '@/lib/api';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { FAKE_STATS } from '@/lib/mockData';
import { getZokoStreamUrl } from '@/lib/zokoPlayer';

export default function AdminPage() {
  return (
    <AuthGuard adminOnly redirectTo="/login">
      <AdminDashboard />
    </AuthGuard>
  );
}

// ── ID source options ─────────────────────────────────────────────────────────
const ID_SOURCES = [
  { value: 'mal',     label: 'MAL ID (MyAnimeList)'  },
  { value: 'anilist', label: 'AniList ID'             },
];

const DEFAULT_FORM = {
  anime_title:    '',
  title:          '',
  episode_number: 1,
  thumbnail_url:  '',
  description:    '',
  category:       '',
  mal_id:         '',
  anilist_id:     '',
  stream_source:  'mal',
  total_episodes: 1,
  download_url:   '',
  is_featured:    true,
  published:      true,
};

function AdminDashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [episodes, setEpisodes] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [stats,    setStats]    = useState(FAKE_STATS);

  const [uploadForm,   setUploadForm]   = useState(DEFAULT_FORM);
  const [editingId,    setEditingId]    = useState(null);
  const [uploadError,  setUploadError]  = useState('');
  const [uploadSuccess,setUploadSuccess]= useState('');
  const [submitting,   setSubmitting]   = useState(false);

  const loadEpisodes = useCallback(async () => {
    setLoading(true);
    const data = await getAdminEpisodes();
    setEpisodes(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadEpisodes(); }, [loadEpisodes]);

  // Simulated live viewer counter
  useEffect(() => {
    const t = setInterval(() => {
      setStats(s => ({
        ...s,
        liveViewers: Math.max(0, s.liveViewers + Math.floor(Math.random() * 20 - 8)),
        dailyStreams: s.dailyStreams + Math.floor(Math.random() * 5),
      }));
    }, 2000);
    return () => clearInterval(t);
  }, []);

  const setField = (key, val) => setUploadForm(f => ({ ...f, [key]: val }));

  // ── Auto-fill from Jikan search result ────────────────────────────────────
  const handleAutoFill = (anime) => {
    if (!anime) return; // cleared
    setUploadForm(f => ({
      ...f,
      anime_title:    anime.anime_title || anime.title || f.anime_title,
      title:          anime.title || anime.anime_title || f.title,
      mal_id:         anime.mal_id ? String(anime.mal_id) : f.mal_id,
      total_episodes: anime.total_episodes || anime.episodes || f.total_episodes,
      thumbnail_url:  anime.thumbnail_url || f.thumbnail_url,
      description:    anime.description || anime.synopsis || f.description,
      category:       anime.category || f.category,
      rating:         anime.rating || f.rating || 5.0,
      stream_source:  'mal',
      download_url:   f.download_url || '',
    }));
    setUploadError('');
  };

  // ── 1-Click Auto-Import Publish ─────────────────────────────────────────
  const handle1ClickPublish = async () => {
    if (!uploadForm.anime_title || !uploadForm.mal_id) {
      setUploadError('Please select an anime via search first.');
      return;
    }
    setSubmitting(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const res = await fetch('/api/anime/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mal_id:       uploadForm.mal_id,
          title:        uploadForm.anime_title,
          poster:       uploadForm.thumbnail_url,
          synopsis:     uploadForm.description,
          episodes:     uploadForm.total_episodes,
          genres:       uploadForm.category,
          rating:       uploadForm.rating || 5.0,
          download_url: uploadForm.download_url,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Publishing failed');

      setUploadSuccess(`🚀 Successfully published "${uploadForm.anime_title}"! Stream is live on /watch/${uploadForm.mal_id}`);
      setUploadForm(DEFAULT_FORM);
      setEditingId(null);
      await loadEpisodes();
      setTimeout(() => setUploadSuccess(''), 6000);
    } catch (err) {
      setUploadError(err.message || '1-Click Auto-Import failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Preview Zoko URL in real-time ──────────────────────────────────────────
  const zokoPreviewUrl = (() => {
    const id = uploadForm.stream_source === 'mal' ? uploadForm.mal_id : uploadForm.anilist_id;
    if (!id) return '';
    return getZokoStreamUrl({ source: uploadForm.stream_source, id, episode: 1, track: 'sub' });
  })();

  const startEdit = (ep) => {
    setUploadForm({
      ...DEFAULT_FORM,
      ...ep,
      category: Array.isArray(ep.genre) ? ep.genre.join(', ') : (ep.category || ''),
    });
    setEditingId(ep.id);
    setActiveSection('upload');
  };

  const cancelEdit = () => {
    setUploadForm(DEFAULT_FORM);
    setEditingId(null);
    setUploadError('');
  };

  // ── Submit handler ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Require anime title + at least one ID
    if (!uploadForm.anime_title) {
      setUploadError('Anime title is required.');
      return;
    }
    const hasId = uploadForm.mal_id || uploadForm.anilist_id;
    if (!hasId) {
      setUploadError('At least one of MAL ID or AniList ID is required.');
      return;
    }

    setSubmitting(true);
    setUploadError('');
    setUploadSuccess('');

    const result = await upsertEpisode(
      { ...uploadForm, id: editingId || undefined },
      user?.id
    );

    setSubmitting(false);
    if (!result.success) {
      setUploadError(result.error || 'Failed to save entry.');
      return;
    }

    setUploadSuccess(
      editingId
        ? 'Entry updated successfully.'
        : 'Anime published! Zoko streaming is live on the Watch page.'
    );
    setUploadForm(DEFAULT_FORM);
    setEditingId(null);
    await loadEpisodes();
    setTimeout(() => setUploadSuccess(''), 5000);
  };

  const handleToggleFeatured = async (ep) => {
    const newVal = !ep.is_featured;
    setEpisodes(prev => prev.map(e => e.id === ep.id ? { ...e, is_featured: newVal, featured: newVal } : e));
    await toggleFeatured(ep.id, newVal);
  };

  const handleDelete = async (ep) => {
    if (!confirm(`Delete "${ep.anime_title || ep.title}"? This cannot be undone.`)) return;
    setEpisodes(prev => prev.filter(e => e.id !== ep.id));
    await deleteEpisode(ep.id);
  };

  const SIDEBAR_ITEMS = [
    { id: 'overview', label: 'Overview',      icon: BarChart2 },
    { id: 'upload',   label: editingId ? 'Edit Entry' : 'Add Anime', icon: Upload },
    { id: 'manage',   label: 'Manage Catalog', icon: Film },
  ];

  const STAT_CARDS = [
    { label: 'Live Viewers',   value: stats.liveViewers.toLocaleString(), icon: Activity,   color: '#8B5CF6', change: '+2.3%' },
    { label: 'Total Anime',    value: episodes.length.toString(),         icon: Tv,         color: '#F59E0B', change: `+${episodes.length}` },
    { label: 'Featured',       value: episodes.filter(e => e.is_featured || e.featured).length.toString(), icon: Star, color: '#A78BFA', change: 'active' },
    { label: 'Daily Streams',  value: stats.dailyStreams.toLocaleString(), icon: TrendingUp, color: '#D97706', change: '+8.7%' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#08080C', paddingTop: 64, display: 'flex' }}>

      {/* ── Sidebar ── */}
      <motion.aside
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          width: 240, background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)', borderRight: '1px solid var(--glass-border)',
          padding: '24px 0', flexShrink: 0, position: 'sticky',
          top: 64, height: 'calc(100vh - 64px)', overflowY: 'auto',
        }}
      >
        <div style={{ padding: '0 16px 20px', borderBottom: '1px solid var(--glass-border)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(245,158,11,0.2))',
              border: '1px solid rgba(139,92,246,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={18} color="#8B5CF6" />
            </div>
            <div>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '0.85rem', color: '#FFFFFF', margin: 0 }}>
                Admin Portal
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.7)' }} />
                <p style={{ color: '#6ee7b7', fontSize: '0.65rem', margin: 0, fontWeight: 600 }}>
                  Zoko Engine Active
                </p>
              </div>
            </div>
          </div>
        </div>

        {SIDEBAR_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id} id={`admin-nav-${id}`}
            onClick={() => setActiveSection(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              width: '100%', padding: '12px 20px',
              background: activeSection === id ? 'rgba(139,92,246,0.14)' : 'transparent',
              border: 'none', borderLeft: activeSection === id ? '3px solid #8B5CF6' : '3px solid transparent',
              cursor: 'pointer', color: activeSection === id ? '#A78BFA' : 'var(--text-secondary)',
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: '0.875rem',
              textAlign: 'left', transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { if (activeSection !== id) e.currentTarget.style.background = 'var(--glass-border)'; }}
            onMouseLeave={e => { if (activeSection !== id) e.currentTarget.style.background = 'transparent'; }}
          >
            <Icon size={16} /> {label}
          </button>
        ))}

        <Link href="/admin/ai-assistant" style={{ textDecoration: 'none' }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 12,
            width: '100%', padding: '12px 20px',
            background: 'rgba(245,158,11,0.1)',
            border: 'none', borderLeft: '3px solid #F59E0B',
            cursor: 'pointer', color: '#F59E0B',
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '0.875rem',
            textAlign: 'left', marginTop: 8, transition: 'all 0.2s ease',
          }}>
            <Sparkles size={16} color="#F59E0B" /> AI Assistant Suite
          </button>
        </Link>

        <div style={{ margin: '20px 16px 0', padding: '10px 12px', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Database size={12} color="#22c55e" />
            <span style={{ color: '#6ee7b7', fontSize: '0.72rem', fontWeight: 700 }}>Zoko HD Engine</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', margin: '4px 0 0', lineHeight: 1.4 }}>
            Zero-link streaming via MAL/AniList IDs. No video hosting required.
          </p>
        </div>
      </motion.aside>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, padding: '32px', overflowX: 'hidden' }}>
        <AnimatePresence mode="wait">

          {/* ── OVERVIEW ── */}
          {activeSection === 'overview' && (
            <motion.div key="overview"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
            >
              <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 6 }}>
                    Dashboard Overview
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Zoko-powered catalog management · zero hosting, zero Mega links.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <AnimatedButton variant="gold" size="sm" icon={<Plus size={14} />} onClick={() => { cancelEdit(); setActiveSection('upload'); }}>
                    Add Anime
                  </AnimatedButton>
                  <motion.button
                    onClick={loadEpisodes}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    whileHover={{ borderColor: '#8B5CF6', color: '#8B5CF6' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RefreshCw size={13} /> Refresh
                  </motion.button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 20, marginBottom: 32 }}>
                {STAT_CARDS.map(({ label, value, icon: Icon, color, change }) => (
                  <motion.div key={label} className="stat-card" whileHover={{ y: -4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={20} color={color} />
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 20, padding: '2px 8px' }}>
                        {change}
                      </span>
                    </div>
                    <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.8rem', fontWeight: 800, color, margin: '0 0 4px', lineHeight: 1 }}>{value}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0, fontWeight: 500 }}>{label}</p>
                  </motion.div>
                ))}
              </div>

              <GlassCard padding="0">
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                    Anime Catalog {loading && <Loader2 size={14} style={{ marginLeft: 8, display: 'inline', animation: 'spin 0.8s linear infinite' }} />}
                  </h2>
                  <AnimatedButton variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => { cancelEdit(); setActiveSection('upload'); }}>
                    Add Anime
                  </AnimatedButton>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        {['Anime / Entry', 'MAL ID', 'Episodes', 'Rating', 'Featured', 'Status', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {episodes.slice(0, 20).map(ep => (
                        <tr key={ep.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-border)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '14px 16px', maxWidth: 220 }}>
                            <p style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.875rem', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {ep.anime_title || ep.title}
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', margin: 0 }}>
                              {ep.category || '—'}
                            </p>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ fontFamily: 'monospace', color: '#F59E0B', fontSize: '0.85rem', fontWeight: 700 }}>
                              {ep.mal_id || '—'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>
                            {ep.total_episodes || 1}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#F59E0B', fontSize: '0.82rem', fontWeight: 700 }}>
                              <Star size={12} fill="#F59E0B" /> {ep.rating > 0 ? Number(ep.rating).toFixed(1) : '5.0'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <motion.button
                              onClick={() => handleToggleFeatured(ep)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: ep.is_featured || ep.featured ? '#8B5CF6' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}
                              whileTap={{ scale: 0.88 }}
                            >
                              {ep.is_featured || ep.featured ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                              {ep.is_featured || ep.featured ? 'Featured' : 'Hidden'}
                            </motion.button>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span className="badge-gold" style={{ fontSize: '0.65rem' }}>
                              {ep.published !== false ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <motion.button onClick={() => startEdit(ep)}
                                style={{ padding: '5px 10px', borderRadius: 6, fontSize: '0.75rem', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', color: '#A78BFA', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                                whileHover={{ background: 'rgba(139,92,246,0.2)' }} whileTap={{ scale: 0.95 }}
                              >
                                <Edit3 size={10} /> Edit
                              </motion.button>
                              <motion.button onClick={() => handleDelete(ep)}
                                style={{ padding: '5px 10px', borderRadius: 6, fontSize: '0.75rem', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                                whileHover={{ background: 'rgba(255,68,68,0.2)' }} whileTap={{ scale: 0.95 }}
                              >
                                <Trash2 size={10} />
                              </motion.button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* ── UPLOAD / EDIT FORM ── */}
          {activeSection === 'upload' && (
            <motion.div key="upload"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
              style={{ maxWidth: 740 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                  {editingId ? <><Edit3 size={22} color="#8B5CF6" /> Edit Anime Entry</> : <><Upload size={22} color="#8B5CF6" /> Add Anime to Catalog</>}
                </h1>
                {editingId && <AnimatedButton variant="ghost" size="sm" onClick={cancelEdit}>Cancel Edit</AnimatedButton>}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 24 }}>
                Enter the MAL or AniList ID — Zoko handles streaming automatically. No video URLs needed.
              </p>

              <GlassCard style={{ padding: 28 }}>
                <AnimatePresence>
                  {uploadSuccess && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                      style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#4ade80', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Check size={16} /> {uploadSuccess}
                    </motion.div>
                  )}
                  {uploadError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#ff4444', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertCircle size={16} /> {uploadError}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── ⚡ Auto-Fill Search ── */}
                <AnimeAutoSearch
                  onSelectAnime={handleAutoFill}
                  initialValue={uploadForm.anime_title || ''}
                />

                {/* ── 🚀 1-Click Auto-Import Preview Card ── */}
                {uploadForm.mal_id && uploadForm.anime_title && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginBottom: 24,
                      padding: 20,
                      borderRadius: 16,
                      background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(139,92,246,0.08) 100%)',
                      border: '1px solid rgba(245,158,11,0.3)',
                      display: 'flex',
                      gap: 16,
                      alignItems: 'center',
                    }}
                  >
                    {uploadForm.thumbnail_url && (
                      <div style={{ width: 64, height: 96, borderRadius: 10, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(245,158,11,0.3)', position: 'relative' }}>
                        <img src={uploadForm.thumbnail_url} alt={uploadForm.anime_title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <h3 style={{ color: '#F59E0B', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: '1.05rem', margin: 0 }}>
                          {uploadForm.anime_title}
                        </h3>
                        <span style={{ fontFamily: 'monospace', color: '#FFF', fontSize: '0.72rem', background: 'rgba(245,158,11,0.2)', padding: '2px 8px', borderRadius: 6, border: '1px solid rgba(245,158,11,0.3)', fontWeight: 700 }}>
                          MAL #{uploadForm.mal_id}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', fontWeight: 600 }}>
                          {uploadForm.total_episodes} Episodes
                        </span>
                      </div>
                      {uploadForm.description && (
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                          {uploadForm.description}
                        </p>
                      )}
                      <AnimatedButton
                        type="button"
                        variant="gold"
                        size="md"
                        onClick={handle1ClickPublish}
                        disabled={submitting}
                        icon={submitting ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Sparkles size={15} />}
                      >
                        {submitting ? 'Publishing Anime…' : '🚀 1-Click Publish Anime & All Episodes'}
                      </AnimatedButton>
                    </div>
                  </motion.div>
                )}

                {/* Divider */}
                <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 24 }} />

                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>

                    {/* ── Section: Stream IDs ── */}
                    <div style={{ gridColumn: '1 / -1', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.06)' }} />
                        <span style={{ color: '#F59E0B', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                          🎯 Zoko Stream IDs
                        </span>
                        <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.06)' }} />
                      </div>
                    </div>

                    {/* Source type selector */}
                    <div style={{ marginBottom: 18, gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>Primary ID Source</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {ID_SOURCES.map(({ value, label }) => (
                          <button
                            key={value}
                            type="button"
                            id={`source-${value}`}
                            onClick={() => setField('stream_source', value)}
                            style={{
                              padding: '9px 18px', borderRadius: 9,
                              border: '1px solid',
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                              transition: 'all 0.2s',
                              borderColor: uploadForm.stream_source === value ? '#F59E0B' : 'rgba(255,255,255,0.1)',
                              background: uploadForm.stream_source === value ? 'rgba(245,158,11,0.15)' : 'transparent',
                              color: uploadForm.stream_source === value ? '#F59E0B' : 'rgba(255,255,255,0.4)',
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* MAL ID */}
                    <div style={{ marginBottom: 18 }}>
                      <label style={labelStyle}>
                        MAL ID
                        <span style={{ color: uploadForm.stream_source === 'mal' ? '#F59E0B' : 'rgba(255,255,255,0.3)', marginLeft: 6 }}>
                          {uploadForm.stream_source === 'mal' ? '(Primary ✓)' : '(Optional)'}
                        </span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Hash size={14} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <input
                          className="af-input"
                          type="number"
                          min="1"
                          placeholder="e.g. 21  (One Piece)"
                          value={uploadForm.mal_id}
                          onChange={e => setField('mal_id', e.target.value)}
                          required={uploadForm.stream_source === 'mal'}
                          style={{ paddingLeft: 34 }}
                        />
                      </div>
                    </div>

                    {/* AniList ID */}
                    <div style={{ marginBottom: 18 }}>
                      <label style={labelStyle}>
                        AniList ID
                        <span style={{ color: uploadForm.stream_source === 'anilist' ? '#F59E0B' : 'rgba(255,255,255,0.3)', marginLeft: 6 }}>
                          {uploadForm.stream_source === 'anilist' ? '(Primary ✓)' : '(Optional)'}
                        </span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Hash size={14} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <input
                          className="af-input"
                          type="number"
                          min="1"
                          placeholder="e.g. 20  (One Piece)"
                          value={uploadForm.anilist_id}
                          onChange={e => setField('anilist_id', e.target.value)}
                          required={uploadForm.stream_source === 'anilist'}
                          style={{ paddingLeft: 34 }}
                        />
                      </div>
                    </div>

                    {/* Total Episodes */}
                    <div style={{ marginBottom: 18 }}>
                      <label style={labelStyle}>Total Episodes *</label>
                      <input
                        className="af-input"
                        type="number"
                        min="1"
                        max="9999"
                        placeholder="e.g. 1000"
                        value={uploadForm.total_episodes}
                        onChange={e => setField('total_episodes', parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>

                    {/* Episode number (starting) */}
                    <div style={{ marginBottom: 18 }}>
                      <label style={labelStyle}>Starting Episode</label>
                      <input
                        className="af-input"
                        type="number"
                        min="1"
                        value={uploadForm.episode_number}
                        onChange={e => setField('episode_number', e.target.value)}
                      />
                    </div>

                    {/* Live Zoko URL preview */}
                    {zokoPreviewUrl && (
                      <div style={{ gridColumn: '1 / -1', marginBottom: 18 }}>
                        <label style={labelStyle}>Live Stream Preview URL</label>
                        <div style={{ padding: '10px 14px', borderRadius: 9, background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', fontFamily: 'monospace', fontSize: '0.72rem', color: '#6ee7b7', wordBreak: 'break-all', lineHeight: 1.6 }}>
                          {zokoPreviewUrl}
                        </div>
                      </div>
                    )}

                    {/* Divider */}
                    <div style={{ gridColumn: '1 / -1', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.06)' }} />
                        <span style={{ color: '#A78BFA', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                          📝 Metadata
                        </span>
                        <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.06)' }} />
                      </div>
                    </div>

                    {/* Anime Title */}
                    <div style={{ marginBottom: 18 }}>
                      <label style={labelStyle}>Anime Title *</label>
                      <input className="af-input" placeholder="e.g. One Piece" value={uploadForm.anime_title}
                        onChange={e => setField('anime_title', e.target.value)} required />
                    </div>

                    {/* Genre Tags */}
                    <div style={{ marginBottom: 18 }}>
                      <label style={labelStyle}>Genre Tags</label>
                      <input className="af-input" placeholder="Action, Adventure, Fantasy" value={uploadForm.category}
                        onChange={e => setField('category', e.target.value)} />
                    </div>

                    {/* Poster / Thumbnail URL */}
                    <div style={{ marginBottom: 18, gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>Poster / Thumbnail URL</label>
                      <input className="af-input" type="url" placeholder="https://cdn.../poster.jpg" value={uploadForm.thumbnail_url}
                        onChange={e => setField('thumbnail_url', e.target.value)} />
                    </div>

                    {/* Synopsis */}
                    <div style={{ marginBottom: 18, gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>Synopsis</label>
                      <textarea className="af-input" placeholder="Anime synopsis…" value={uploadForm.description}
                        onChange={e => setField('description', e.target.value)}
                        rows={3} style={{ resize: 'vertical', minHeight: 80 }} />
                    </div>

                    {/* Download URL (optional — shown as Download HD button on Watch page) */}
                    <div style={{ marginBottom: 18, gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>
                        Download URL <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(Optional — shown as "Download HD" button)</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <DownloadIcon size={14} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <input className="af-input" type="url" placeholder="https://mega.nz/... or https://filepress.net/..."
                          value={uploadForm.download_url}
                          onChange={e => setField('download_url', e.target.value)}
                          style={{ paddingLeft: 34 }}
                        />
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', margin: '5px 0 0' }}>
                        Supports Mega.nz, Filepress, Google Drive, or any direct link. For offline viewers.
                      </p>
                    </div>
                  </div>

                  {/* Toggles */}
                  <div style={{ display: 'flex', gap: 24, marginBottom: 28 }}>
                    {[
                      { key: 'is_featured', label: 'Feature on Homepage', color: '#8B5CF6' },
                      { key: 'published',   label: 'Published (Visible)',  color: '#4ade80' },
                    ].map(({ key, label, color }) => (
                      <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                        <motion.button type="button"
                          onClick={() => setField(key, !uploadForm[key])}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: uploadForm[key] ? color : 'var(--text-muted)', padding: 0, display: 'flex' }}
                          whileTap={{ scale: 0.88 }}
                        >
                          {uploadForm[key] ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                        </motion.button>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}>
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Submit */}
                  <div style={{ display: 'flex', gap: 12 }}>
                    <AnimatedButton type="submit" variant="primary" size="lg" disabled={submitting}
                      icon={submitting ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Upload size={16} />}>
                      {submitting ? 'Publishing…' : editingId ? 'Update Entry' : 'Publish Anime'}
                    </AnimatedButton>
                    {editingId && (
                      <AnimatedButton type="button" variant="ghost" size="lg" onClick={cancelEdit}>Cancel</AnimatedButton>
                    )}
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          )}

          {/* ── MANAGE ── */}
          {activeSection === 'manage' && (
            <motion.div key="manage"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                  <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 6 }}>
                    Manage Anime Catalog
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{episodes.length} titles — all streaming via Zoko.</p>
                </div>
                <AnimatedButton variant="primary" size="sm" icon={<Plus size={14} />}
                  onClick={() => { cancelEdit(); setActiveSection('upload'); }}>
                  Add New
                </AnimatedButton>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {episodes.map(ep => (
                  <motion.div key={ep.id} className="glass-card" style={{ padding: '16px 20px' }} whileHover={{ y: -3 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ flex: 1, marginRight: 12 }}>
                        <p style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.9rem', margin: '0 0 2px', lineHeight: 1.3 }}>
                          {ep.anime_title || ep.title}
                        </p>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                          {ep.mal_id && (
                            <span style={{ fontFamily: 'monospace', color: '#F59E0B', fontSize: '0.72rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 4, padding: '1px 6px' }}>
                              MAL #{ep.mal_id}
                            </span>
                          )}
                          {ep.total_episodes > 1 && (
                            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>
                              {ep.total_episodes} eps
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {(ep.is_featured || ep.featured) && <span className="badge-gold" style={{ fontSize: '0.6rem' }}>Featured</span>}
                        </div>
                      </div>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#F59E0B', fontSize: '0.8rem', fontWeight: 700 }}>
                        <Star size={11} fill="#F59E0B" /> {ep.rating > 0 ? Number(ep.rating).toFixed(1) : '5.0'}
                      </span>
                    </div>

                    {ep.description && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.5, margin: '0 0 14px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {ep.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: 8 }}>
                      <motion.button onClick={() => startEdit(ep)}
                        style={{ flex: 1, padding: '7px', borderRadius: 8, fontSize: '0.78rem', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', color: '#A78BFA', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}
                        whileHover={{ background: 'rgba(139,92,246,0.2)' }} whileTap={{ scale: 0.95 }}
                      >
                        <Edit3 size={11} /> Edit
                      </motion.button>
                      <motion.button onClick={() => handleToggleFeatured(ep)}
                        style={{ flex: 1, padding: '7px', borderRadius: 8, fontSize: '0.78rem', background: ep.is_featured || ep.featured ? 'rgba(139,92,246,0.15)' : 'rgba(245,158,11,0.1)', border: `1px solid ${ep.is_featured || ep.featured ? '#8B5CF6' : 'rgba(245,158,11,0.3)'}`, color: ep.is_featured || ep.featured ? '#8B5CF6' : '#F59E0B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}
                        whileHover={{ opacity: 0.8 }} whileTap={{ scale: 0.95 }}
                      >
                        {ep.is_featured || ep.featured ? 'Unfeature' : 'Feature'}
                      </motion.button>
                      <motion.button onClick={() => handleDelete(ep)}
                        style={{ padding: '7px 10px', borderRadius: 8, background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#ff4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        whileHover={{ background: 'rgba(255,68,68,0.2)' }} whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={13} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const labelStyle = {
  display: 'block', marginBottom: 8,
  fontSize: '0.82rem', fontWeight: 600,
  color: 'var(--text-secondary)', letterSpacing: '0.03em',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};
