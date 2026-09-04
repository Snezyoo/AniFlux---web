'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, User, Shield, LogOut, Bookmark, Shuffle, X } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdown, setUserDropdown] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut Ctrl+K & '/' listener for Omnibox Search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Popular MAL IDs for random navigation — all verified on Jikan/Zoko
  const RANDOM_MAL_IDS = [
    21, 1735, 16498, 38000, 40748, 50265, 52991, 20, 11061, 28977,
    9253, 5114, 1535, 2904, 889, 32281, 22319, 31240, 38524, 41487,
  ];

  const handleRandomAnime = () => {
    const malId = RANDOM_MAL_IDS[Math.floor(Math.random() * RANDOM_MAL_IDS.length)];
    router.push(`/watch/${malId}`);
  };

  const NAV_LINKS = [
    { href: '/home',     label: 'Home'    },
    { href: '/newest',   label: 'Newest'  },
    { href: '/catalog',  label: 'Catalog' },
    { href: '/trending', label: 'Trending'},
  ];

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'all 0.3s ease',
        background: scrolled
          ? 'rgba(11, 12, 16, 0.92)'
          : 'linear-gradient(180deg, rgba(11,12,16,0.95) 0%, rgba(11,12,16,0) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: scrolled ? '1px solid rgba(245, 158, 11, 0.12)' : '1px solid transparent',
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '0 24px',
          height: 68,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Brand Logo & Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <Logo size="md" />

          <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                  <motion.span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: active ? 700 : 600,
                      color: active ? '#F59E0B' : 'var(--text-secondary)',
                      position: 'relative',
                      padding: '4px 0',
                      cursor: 'pointer',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                    whileHover={{ color: '#F59E0B' }}
                  >
                    {link.label}
                    {active && (
                      <motion.div
                        layoutId="nav-underline"
                        style={{
                          position: 'absolute',
                          bottom: -2,
                          left: 0,
                          right: 0,
                          height: 2,
                          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                          borderRadius: 2,
                        }}
                      />
                    )}
                  </motion.span>
                </Link>
              );
            })}

            <motion.button
              onClick={handleRandomAnime}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                padding: '4px 0',
              }}
              whileHover={{ color: '#F59E0B' }}
              whileTap={{ scale: 0.95 }}
              title="Discover a Random Anime"
            >
              <Shuffle size={14} color="#F59E0B" />
              <span>Random</span>
            </motion.button>
          </nav>
        </div>

        {/* Center: Search Input with Ctrl+K Badge */}
        <div style={{ flex: 1, maxWidth: 360, margin: '0 24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(26, 27, 38, 0.75)',
              border: '1px solid rgba(245, 158, 11, 0.14)',
              borderRadius: 20,
              padding: '6px 14px',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <Search size={15} color="#F59E0B" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    router.push(`/catalog?q=${encodeURIComponent(searchQuery)}`);
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  width: '100%',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              />
            </div>

            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 6,
                padding: '2px 6px',
                fontFamily: 'monospace',
                flexShrink: 0,
              }}
            >
              Ctrl+K
            </span>
          </div>
        </div>

        {/* Right: Theme Switcher, Watchlist, Sign In Pill Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/profile?tab=watchlist" style={{ textDecoration: 'none' }}>
            <motion.button
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(26, 27, 38, 0.75)',
                border: '1px solid rgba(245, 158, 11, 0.14)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              whileHover={{ borderColor: '#F59E0B', color: '#F59E0B', scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              title="My Watchlist"
            >
              <Bookmark size={16} />
            </motion.button>
          </Link>

          <ThemeToggle />

          {isAdmin && (
            <Link href="/admin" style={{ textDecoration: 'none' }}>
              <motion.button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 20,
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  color: '#F59E0B',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)' }}
                whileTap={{ scale: 0.95 }}
              >
                <Shield size={13} color="#F59E0B" /> Admin
              </motion.button>
            </Link>
          )}

          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <motion.button
                onClick={() => setUserDropdown(!userDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(26, 27, 38, 0.85)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: 20,
                  padding: '4px 12px 4px 6px',
                  cursor: 'pointer',
                }}
                whileHover={{ borderColor: '#F59E0B' }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    color: '#FFF',
                  }}
                >
                  {(user?.name || user?.email || 'O').charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user?.name || 'Otaku'}
                </span>
              </motion.button>

              <AnimatePresence>
                {userDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 44,
                      width: 200,
                      background: '#12131C',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      borderRadius: 14,
                      padding: '8px 0',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                      zIndex: 200,
                    }}
                  >
                    <Link href="/profile" style={{ textDecoration: 'none' }} onClick={() => setUserDropdown(false)}>
                      <div
                        style={{
                          padding: '10px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <User size={15} color="#F59E0B" /> My Profile
                      </div>
                    </Link>
                    <Link href="/profile?tab=watchlist" style={{ textDecoration: 'none' }} onClick={() => setUserDropdown(false)}>
                      <div
                        style={{
                          padding: '10px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Bookmark size={15} color="#F59E0B" /> Watchlist
                      </div>
                    </Link>

                    <div style={{ height: 1, background: 'var(--glass-border)', margin: '6px 0' }} />

                    <div
                      onClick={() => {
                        setUserDropdown(false);
                        logout();
                      }}
                      style={{
                        padding: '10px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        color: '#F59E0B',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <LogOut size={15} /> Sign Out
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <motion.button
                style={{
                  padding: '8px 20px',
                  borderRadius: 20,
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  border: 'none',
                  color: '#FFF',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
                whileHover={{ scale: 1.04, boxShadow: '0 0 16px rgba(245, 158, 11, 0.5)' }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.button>
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}
