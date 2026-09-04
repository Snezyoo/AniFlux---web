'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * AuthGuard — Route protection wrapper.
 * Props:
 *  - adminOnly: if true, requires admin role
 *  - redirectTo: where to redirect if access denied
 */
export default function AuthGuard({
  children,
  adminOnly = false,
  redirectTo = '/login',
}) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }
    if (adminOnly && !isAdmin) {
      router.replace('/home');
    }
  }, [isAuthenticated, isAdmin, adminOnly, loading, router, redirectTo]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '3px solid var(--glass-border)',
            borderTopColor: '#FF2E63',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
            Authenticating...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (adminOnly && !isAdmin) return null;

  return <>{children}</>;
}
