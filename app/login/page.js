'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { User, Lock, Shield, Sparkles, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import GlassCard from '@/components/ui/GlassCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useAuth, DEMO_CREDENTIALS } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsGuest } = useAuth();

  const [activeTab, setActiveTab] = useState('user');
  const [email, setEmail]         = useState(DEMO_CREDENTIALS.user.email);
  const [password, setPassword]   = useState(DEMO_CREDENTIALS.user.password);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setError('');
    if (tab === 'admin') {
      setEmail(DEMO_CREDENTIALS.admin.email);
      setPassword(DEMO_CREDENTIALS.admin.password);
    } else {
      setEmail(DEMO_CREDENTIALS.user.email);
      setPassword(DEMO_CREDENTIALS.user.password);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Login failed.');
      return;
    }

    if (result.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/home');
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    await loginAsGuest();
    setLoading(false);
    router.push('/home');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#08080C',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Ambient Radial Glow */}
      <div
        style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 650,
          height: 650,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.16) 0%, rgba(109, 40, 217, 0.04) 50%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'absolute', top: 24, right: 24 }}>
        <ThemeToggle />
      </div>

      {/* Split-Screen Floating Dark Glass Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: 920,
          background: '#12131C',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 24,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Left Panel: Clean Anime Graphic Illustration */}
        <div
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(109, 40, 217, 0.3) 100%)',
            borderRight: '1px solid rgba(255, 255, 255, 0.06)',
            padding: 40,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Logo size="md" />

          <div style={{ position: 'relative', height: 260, margin: '20px 0' }}>
            <img
              src="https://picsum.photos/seed/waifu1/400/500"
              alt="Anime Portal Character"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16, border: '1px solid rgba(139, 92, 246, 0.3)' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 40%, rgba(18, 19, 28, 0.9) 100%)',
                borderRadius: 16,
              }}
            />
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFF', margin: '0 0 4px' }}>
              4K Ultra HD Streaming
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
              Access thousands of episodes with real-time community reviews and instant progress sync.
            </p>
          </div>
        </div>

        {/* Right Panel: Clean Form */}
        <div style={{ padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFF', margin: '0 0 6px' }}>
              Welcome Back
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
              Sign in to manage your watchlist & preferences
            </p>
          </div>

          {/* Clean Tab Switcher (Electric Violet Highlight) */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(26, 27, 38, 0.8)',
              borderRadius: 12,
              padding: 4,
              marginBottom: 20,
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {[
              { id: 'user', label: 'User Account', icon: User },
              { id: 'admin', label: 'Admin Portal', icon: Shield },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleTabSwitch(id)}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: 9,
                  border: 'none',
                  background: activeTab === id ? 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)' : 'transparent',
                  color: activeTab === id ? '#FFFFFF' : 'var(--text-muted)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {/* Demo Mode Quick Badge */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              marginBottom: 20,
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span style={{ color: '#A78BFA', fontWeight: 700 }}>Demo Mode:</span> Credentials auto-filled for{' '}
            <strong>{activeTab === 'admin' ? 'Admin' : 'User'}</strong>.
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Email Address
              </label>
              <input
                type="email"
                className="af-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Password
              </label>
              <input
                type="password"
                className="af-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 14px', borderRadius: 10, marginBottom: 16,
                    background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444', fontSize: '0.82rem',
                  }}
                >
                  <AlertCircle size={14} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatedButton
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
              icon={loading ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <ArrowRight size={16} />}
            >
              {loading ? 'Authenticating...' : `Sign In as ${activeTab === 'admin' ? 'Admin' : 'User'}`}
            </AnimatedButton>
          </form>

          <div style={{ margin: '18px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.08)' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255, 255, 255, 0.08)' }} />
          </div>

          <AnimatedButton
            variant="secondary"
            size="md"
            fullWidth
            onClick={handleGuestLogin}
            icon={<Sparkles size={14} color="#8B5CF6" />}
          >
            Continue as Guest
          </AnimatedButton>
        </div>
      </motion.div>
    </div>
  );
}
