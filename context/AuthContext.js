'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

/*
  ===================================================================
  SUPABASE SQL SNIPPET FOR ADMIN CREATION:
  Run this in your Supabase SQL Editor to register a live admin user:

  -- 1. Insert admin into auth.users (if using Supabase Auth UI or SQL):
  -- Or sign up via the app with admin@aniflux.com, then run:

  UPDATE public.profiles
     SET is_admin = true,
         username = 'Admin Sensei'
   WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@aniflux.com');

  ===================================================================
*/

export const DEMO_CREDENTIALS = {
  admin: { email: 'admin@aniflux.com', password: 'admin123', name: 'Admin Sensei', role: 'admin' },
  user:  { email: 'otaku@aniflux.com',  password: 'user123',  name: 'Otaku-kun',    role: 'user'  },
};

const AuthContext = createContext({
  user: null,
  profile: null,
  isAdmin: false,
  isAuthenticated: false,
  isGuest: false,
  loading: true,
  login: async () => ({ success: false }),
  loginAsGuest: async () => ({ success: false }),
  logout: () => {},
  signUp: async () => ({ success: false }),
});

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    if (!isSupabaseConfigured() || !supabase) return null;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      return data;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            setUser(session.user);
            const p = await fetchProfile(session.user.id);
            if (mounted) setProfile(p);
          }

          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              if (!mounted) return;
              if (session?.user) {
                setUser(session.user);
                const p = await fetchProfile(session.user.id);
                setProfile(p);
              } else {
                setUser(null);
                setProfile(null);
              }
            }
          );

          if (mounted) setLoading(false);
          return () => subscription.unsubscribe();
        } catch {
          if (mounted) setLoading(false);
        }
      } else {
        try {
          const stored = localStorage.getItem('aniflux-user');
          if (stored && mounted) {
            const parsed = JSON.parse(stored);
            setUser(parsed);
            setProfile({ is_admin: parsed.role === 'admin', username: parsed.name });
          }
        } catch { /* ignore */ }
        if (mounted) setLoading(false);
      }
    };

    init();
    return () => { mounted = false; };
  }, [fetchProfile]);

  const login = async (email, password) => {
    const emailLower = email.trim().toLowerCase();

    // Check demo credential match
    const demoMatch = Object.values(DEMO_CREDENTIALS).find(
      c => c.email === emailLower && c.password === password
    );

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: emailLower, password });
      
      if (!error && data?.user) {
        const p = await fetchProfile(data.user.id);
        return { success: true, role: p?.is_admin ? 'admin' : 'user' };
      }

      // Robust Fallback: If Supabase auth fails (e.g. user not created in Supabase yet) but matches demo credentials
      if (demoMatch) {
        const mockUser = { email: demoMatch.email, name: demoMatch.name, role: demoMatch.role, id: `demo-${demoMatch.role}` };
        setUser(mockUser);
        setProfile({ is_admin: demoMatch.role === 'admin', username: demoMatch.name });
        localStorage.setItem('aniflux-user', JSON.stringify(mockUser));
        return { success: true, role: demoMatch.role };
      }

      return { success: false, error: error?.message || 'Invalid login credentials.' };
    }

    // Demo fallback when Supabase unconfigured
    await new Promise(r => setTimeout(r, 400));
    if (!demoMatch) return { success: false, error: 'Invalid credentials.' };
    
    const mockUser = { email: demoMatch.email, name: demoMatch.name, role: demoMatch.role, id: `demo-${demoMatch.role}` };
    setUser(mockUser);
    setProfile({ is_admin: demoMatch.role === 'admin', username: demoMatch.name });
    localStorage.setItem('aniflux-user', JSON.stringify(mockUser));
    return { success: true, role: demoMatch.role };
  };

  const loginAsGuest = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (!error && data?.user) return { success: true, role: 'guest' };
      } catch { /* fallback below */ }
    }
    const guestUser = { email: '', name: 'Guest Viewer', role: 'guest', id: 'guest-mock' };
    setUser(guestUser);
    setProfile({ is_admin: false, username: 'Guest' });
    return { success: true, role: 'guest' };
  };

  const signUp = async (email, password, username) => {
    if (!isSupabaseConfigured() || !supabase) {
      return { success: false, error: 'Supabase not configured. Use demo credentials.' };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured() && supabase) {
      try { await supabase.auth.signOut(); } catch { /* ignore */ }
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem('aniflux-user');
  };

  const isAdmin         = !!(profile?.is_admin) || user?.role === 'admin';
  const isGuest         = user?.is_anonymous === true || user?.role === 'guest';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user, profile, isAdmin, isAuthenticated, isGuest,
      loading, login, loginAsGuest, logout, signUp,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export default AuthContext;
