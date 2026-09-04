-- ============================================================
-- AniFlux — Seed Data (Sample Episodes)
-- Run AFTER 001_initial_schema.sql
-- Uses publicly available YouTube embeds as stream sources.
-- ============================================================

-- NOTE: Replace thumbnail URLs with real ones or use Supabase Storage.
-- YouTube stream_url format: https://www.youtube.com/embed/{VIDEO_ID}

INSERT INTO public.episodes
  (anime_title, title, episode_number, thumbnail_url, stream_url, stream_type,
   description, category, is_featured, published)
VALUES

-- ── Neon Blade Chronicles ───────────────────────────────────
(
  'Neon Blade Chronicles',
  'The Awakening',
  1,
  'https://picsum.photos/seed/nbc01/640/360',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'youtube',
  'In a dystopian future where AI-samurai battle for Neo-Tokyo, one rogue fighter awakens an ancient power.',
  ARRAY['Action', 'Sci-Fi', 'Cyberpunk'],
  true,
  true
),
(
  'Neon Blade Chronicles',
  'Shadows of the Grid',
  2,
  'https://picsum.photos/seed/nbc02/640/360',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'youtube',
  'The rogue fighter delves into the underworld of the Grid, uncovering a vast conspiracy.',
  ARRAY['Action', 'Sci-Fi', 'Cyberpunk'],
  false,
  true
),
(
  'Neon Blade Chronicles',
  'Crimson Protocol',
  3,
  'https://picsum.photos/seed/nbc03/640/360',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'youtube',
  'A lethal protocol is activated — and only one person can stop it from erasing all organic life.',
  ARRAY['Action', 'Sci-Fi', 'Cyberpunk'],
  false,
  true
),

-- ── Sakura Protocol ─────────────────────────────────────────
(
  'Sakura Protocol',
  'Digital Bloom',
  1,
  'https://picsum.photos/seed/sakura01/640/360',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'youtube',
  'A genius hacker and a spirit-wielder must unite to stop a digital demon.',
  ARRAY['Fantasy', 'Thriller', 'Romance'],
  true,
  true
),
(
  'Sakura Protocol',
  'Ghost in the Blossom',
  2,
  'https://picsum.photos/seed/sakura02/640/360',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'youtube',
  'The demon reveals its true form — a corrupted AI born from human longing.',
  ARRAY['Fantasy', 'Thriller', 'Romance'],
  false,
  true
),

-- ── Phantom Rebellion ────────────────────────────────────────
(
  'Phantom Rebellion',
  'Rise of the Oni Corps',
  1,
  'https://picsum.photos/seed/phantom01/640/360',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'youtube',
  'Secret society ninjas, sentient mechs, and ancient gods collide in this jaw-dropping opener.',
  ARRAY['Action', 'Mecha', 'Mythology'],
  true,
  true
),
(
  'Phantom Rebellion',
  'The Jade Throne',
  2,
  'https://picsum.photos/seed/phantom02/640/360',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'youtube',
  'The Oni Corps marches on the Jade Throne — and only the last dragon knight stands in their way.',
  ARRAY['Action', 'Mecha', 'Mythology'],
  false,
  true
),

-- ── Waifu Academy ────────────────────────────────────────────
(
  'Waifu Academy',
  'First Day Chaos',
  1,
  'https://picsum.photos/seed/waifu01/640/360',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'youtube',
  'At an academy where magical girls and cyborg students coexist, chaos reigns on day one.',
  ARRAY['Slice of Life', 'Romance', 'Comedy'],
  false,
  true
),

-- ── Void Sovereign ───────────────────────────────────────────
(
  'Void Sovereign',
  'Into the Abyss',
  1,
  'https://picsum.photos/seed/void01/640/360',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'youtube',
  'A young swordsman consumed by darkness must master the void to reclaim his humanity.',
  ARRAY['Dark Fantasy', 'Action', 'Horror'],
  true,
  true
),

-- ── Galaxy Idol ──────────────────────────────────────────────
(
  'Galaxy Idol',
  'Shooting Star Debut',
  1,
  'https://picsum.photos/seed/galaxy01/640/360',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'youtube',
  'Pop stars with cosmic powers compete in an interstellar idol competition.',
  ARRAY['Music', 'Sci-Fi', 'Comedy'],
  false,
  true
)

ON CONFLICT DO NOTHING;
