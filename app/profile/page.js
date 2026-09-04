'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Heart, Clock, Settings, Edit3, Check,
  Star, Bookmark, LogOut, Camera, ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import AuthGuard from '@/components/auth/AuthGuard';
import AnimeCard from '@/components/ui/AnimeCard';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { WAIFU_AVATARS, ANIME_CATALOG } from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  return (
    <AuthGuard redirectTo="/login">
      <ProfileContent />
    </AuthGuard>
  );
}

const PROFILE_TABS = [
  { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
  { id: 'history', label: 'Watch History', icon: Clock },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function ProfileContent() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('watchlist');
  const [selectedAvatar, setSelectedAvatar] = useState(WAIFU_AVATARS[0].id);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || 'Otaku-kun');
  const [editingName, setEditingName] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const avatar = WAIFU_AVATARS.find((a) => a.id === selectedAvatar) || WAIFU_AVATARS[0];

  const watchlistAnime = ANIME_CATALOG.slice(0, 6);
  const historyAnime = ANIME_CATALOG.slice(2, 8).map((a, i) => ({
    ...a,
    watchedAt: `${i + 1} day${i > 0 ? 's' : ''} ago`,
    progress: Math.floor(Math.random() * 100),
  }));
  const favoritesAnime = ANIME_CATALOG.filter((a) => a.waifuFav);

  const rarityColors = {
    Common: '#c5c6c7',
    Rare: '#FFB800',
    Epic: '#FF6B00',
    Legendary: '#FFD600',
  };

  const handleSaveSettings = () => {
    setSavedSuccess(true);
    setEditingName(false);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#08080A',
      paddingTop: 64,
      paddingBottom: 80,
    }}>
      <div style={{
        background: 'linear-gradient(180deg, #121216 0%, #08080A 100%)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '40px 0 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-50%', right: '10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 28, flexWrap: 'wrap' }}>
            <motion.div
              style={{ position: 'relative', flexShrink: 0 }}
              whileHover={{ scale: 1.03 }}
            >
              <div style={{
                width: 110, height: 110,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF6B00, #FFB800)',
                padding: 3,
              }}>
                <div style={{
                  width: '100%', height: '100%', borderRadius: '50%',
                  overflow: 'hidden',
                  background: '#121216',
                  position: 'relative',
                }}>
                  <Image
                    src={avatar.src}
                    alt={avatar.name}
                    fill
                    sizes="110px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </div>
              <motion.button
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                style={{
                  position: 'absolute',
                  bottom: 4, right: 4,
                  width: 30, height: 30, borderRadius: '50%',
                  background: '#FF6B00',
                  border: '2px solid #08080A',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                whileTap={{ scale: 0.85 }}
              >
                <Camera size={13} color="#fff" />
              </motion.button>
            </motion.div>

            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                {editingName ? (
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="af-input"
                    style={{ fontSize: '1.5rem', padding: '6px 12px', maxWidth: 260 }}
                    autoFocus
                  />
                ) : (
                  <h1 style={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    margin: 0,
                  }}>
                    {displayName}
                  </h1>
                )}
                <motion.button
                  onClick={() => editingName ? null : setEditingName(true)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 4,
                  }}
                  whileHover={{ color: '#FFB800' }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Edit3 size={16} />
                </motion.button>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 12px' }}>
                {user?.email} · {user?.role === 'admin' ? '👑 Admin Sensei' : '🌸 Otaku Member'}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  padding: '4px 12px', borderRadius: 20,
                  background: `${rarityColors[avatar.rarity]}18`,
                  border: `1px solid ${rarityColors[avatar.rarity]}44`,
                  color: rarityColors[avatar.rarity],
                  fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em',
                }}>
                  ✦ {avatar.rarity} · {avatar.name}
                </span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} fill="#FFB800" color="#FFB800" />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[
                { label: 'Watching', value: watchlistAnime.length },
                { label: 'Completed', value: 34 },
                { label: 'Favorites', value: favoritesAnime.length },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: '1.4rem', fontWeight: 900,
                    color: '#FFB800',
                  }}>
                    {value}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      <AnimatePresence>
        {showAvatarPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 999,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 24,
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowAvatarPicker(false); }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{
                background: '#121216',
                border: '1px solid var(--glass-border)',
                borderRadius: 20,
                padding: 32,
                maxWidth: 600, width: '100%',
              }}
            >
              <h2 style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: '1.1rem', fontWeight: 700,
                color: '#FFFFFF', marginBottom: 8,
              }}>
                Choose Your Avatar
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>
                Select your character avatar with unique rarity tier styling.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                gap: 16,
                marginBottom: 24,
              }}>
                {WAIFU_AVATARS.map((av) => (
                  <motion.button
                    key={av.id}
                    onClick={() => setSelectedAvatar(av.id)}
                    style={{
                      background: 'none',
                      border: `2px solid ${selectedAvatar === av.id ? rarityColors[av.rarity] : 'var(--glass-border)'}`,
                      borderRadius: 14,
                      padding: 10,
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      boxShadow: selectedAvatar === av.id ? `0 0 15px ${rarityColors[av.rarity]}44` : 'none',
                      transition: 'all 0.2s',
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', position: 'relative' }}>
                      <Image src={av.src} alt={av.name} fill sizes="72px" style={{ objectFit: 'cover' }} />
                    </div>
                    <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{av.name}</p>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700,
                      color: rarityColors[av.rarity],
                    }}>
                      {av.rarity}
                    </span>
                    {selectedAvatar === av.id && (
                      <div style={{
                        position: 'absolute', top: 6, right: 6,
                        width: 18, height: 18, borderRadius: '50%',
                        background: rarityColors[av.rarity],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Check size={10} color="#000" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <AnimatedButton variant="primary" size="md" onClick={() => setShowAvatarPicker(false)}>
                  Confirm Selection
                </AnimatedButton>
                <AnimatedButton variant="ghost" size="md" onClick={() => setShowAvatarPicker(false)}>
                  Cancel
                </AnimatedButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          display: 'flex',
          gap: 4,
          borderBottom: '1px solid var(--glass-border)',
          marginTop: 32,
          marginBottom: 32,
          overflowX: 'auto',
        }}>
          {PROFILE_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`profile-tab-${id}`}
              onClick={() => setActiveTab(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 20px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === id ? '2px solid #FF6B00' : '2px solid transparent',
                cursor: 'pointer',
                color: activeTab === id ? '#FFB800' : 'var(--text-muted)',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                marginBottom: '-1px',
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'watchlist' && (
            <motion.div
              key="watchlist"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                {watchlistAnime.map((anime) => (
                  <AnimeCard key={anime.id} anime={anime} size="md" />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {historyAnime.map((anime) => (
                  <motion.div
                    key={anime.id}
                    whileHover={{ x: 4 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '16px 20px',
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 14,
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <div style={{ width: 56, height: 80, borderRadius: 8, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                      <Image src={anime.poster} alt={anime.title} fill sizes="56px" style={{ objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.95rem', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {anime.title}
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 10px' }}>
                        {anime.genre[0]} · Watched {anime.watchedAt}
                      </p>
                      <div style={{ height: 3, background: 'var(--glass-border)', borderRadius: 2, maxWidth: 300 }}>
                        <div style={{
                          height: '100%',
                          width: `${anime.progress}%`,
                          background: 'linear-gradient(90deg, #FF6B00, #FFB800)',
                          borderRadius: 2,
                          transition: 'width 1s ease',
                        }} />
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', margin: '4px 0 0' }}>
                        {anime.progress}% completed
                      </p>
                    </div>
                    <ChevronRight size={16} color="var(--text-muted)" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'favorites' && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              {favoritesAnime.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                  {favoritesAnime.map((anime) => (
                    <AnimeCard key={anime.id} anime={anime} size="md" />
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
                  <Heart size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <p>No favorites yet. Bookmark an anime to add it here!</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              style={{ maxWidth: 560 }}
            >
              <GlassCard>
                <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 24 }}>
                  Account Settings
                </h2>

                <AnimatePresence>
                  {savedSuccess && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        background: 'rgba(74,222,128,0.1)',
                        border: '1px solid rgba(74,222,128,0.3)',
                        borderRadius: 10, padding: '12px 16px',
                        marginBottom: 20,
                        color: '#4ade80', fontSize: '0.85rem', fontWeight: 600,
                      }}
                    >
                      ✅ Settings saved successfully!
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Display Name
                  </label>
                  <input
                    className="af-input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Email Address
                  </label>
                  <input
                    className="af-input"
                    value={user?.email || ''}
                    readOnly
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  />
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Preferred Video Streaming Quality
                  </label>
                  <select className="af-input">
                    {['Auto', '360p', '480p', '720p', '1080p', '4K Ultra HD'].map((q) => (
                      <option key={q} value={q} style={{ background: '#121216' }}>{q}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <AnimatedButton variant="primary" size="md" onClick={handleSaveSettings} icon={<Check size={14} />}>
                    Save Changes
                  </AnimatedButton>
                  <AnimatedButton variant="danger" size="md" onClick={logout} icon={<LogOut size={14} />}>
                    Sign Out
                  </AnimatedButton>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
