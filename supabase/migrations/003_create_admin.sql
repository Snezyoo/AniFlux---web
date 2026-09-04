-- ============================================================
-- AniFlux — Create Admin User SQL Snippet
-- Run this in your Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → paste & run
-- ============================================================

-- 1. If you signed up via email 'admin@aniflux.com', grant admin rights:
UPDATE public.profiles
   SET is_admin = true,
       username = 'Admin Sensei',
       updated_at = now()
 WHERE id IN (
   SELECT id FROM auth.users WHERE email = 'admin@aniflux.com'
 );

-- 2. Verify admin profiles:
SELECT p.id, p.username, p.is_admin, u.email
  FROM public.profiles p
  JOIN auth.users u ON p.id = u.id
 WHERE p.is_admin = true;
