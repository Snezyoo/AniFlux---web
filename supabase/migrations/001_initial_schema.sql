-- ============================================================
-- AniFlux — Initial Database Schema
-- Run this in your Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → paste & run
-- ============================================================

-- ─── Extensions ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ───────────────────────────────────────────────
-- Extended user profile linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE,
  avatar_url  TEXT,
  is_admin    BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── EPISODES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.episodes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anime_title     TEXT NOT NULL,
  title           TEXT NOT NULL,
  episode_number  INTEGER NOT NULL DEFAULT 1,
  thumbnail_url   TEXT,
  stream_url      TEXT NOT NULL,               -- YouTube embed / HLS .m3u8 / CDN MP4
  stream_type     TEXT NOT NULL DEFAULT 'youtube'  -- 'youtube' | 'hls' | 'mp4' | 'iframe'
                    CHECK (stream_type IN ('youtube', 'hls', 'mp4', 'iframe')),
  description     TEXT,
  category        TEXT[] DEFAULT '{}',         -- ['Action', 'Sci-Fi']
  rating_avg      NUMERIC(3, 2) DEFAULT 0.00,
  review_count    INTEGER DEFAULT 0,
  is_featured     BOOLEAN DEFAULT false,
  published       BOOLEAN DEFAULT true,
  created_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Useful index for listing by anime
CREATE INDEX IF NOT EXISTS idx_episodes_anime_title ON public.episodes (anime_title);
CREATE INDEX IF NOT EXISTS idx_episodes_featured ON public.episodes (is_featured) WHERE is_featured = true;

-- ─── REVIEWS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  episode_id  UUID NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating      SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (episode_id, user_id)   -- one review per user per episode
);

CREATE INDEX IF NOT EXISTS idx_reviews_episode ON public.reviews (episode_id);

-- Trigger: recalculate rating_avg + review_count on episodes table
CREATE OR REPLACE FUNCTION public.recalculate_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  ep_id UUID;
  new_avg NUMERIC(3,2);
  new_count INTEGER;
BEGIN
  -- Determine the affected episode
  IF (TG_OP = 'DELETE') THEN ep_id := OLD.episode_id;
  ELSE ep_id := NEW.episode_id;
  END IF;

  SELECT COALESCE(AVG(rating), 0), COUNT(*)
    INTO new_avg, new_count
    FROM public.reviews
   WHERE episode_id = ep_id;

  UPDATE public.episodes
     SET rating_avg  = new_avg,
         review_count = new_count,
         updated_at   = now()
   WHERE id = ep_id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_recalculate_rating ON public.reviews;
CREATE TRIGGER trg_recalculate_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.recalculate_rating();

-- ─── WATCH HISTORY ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.watch_history (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  episode_id        UUID NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  progress_seconds  INTEGER NOT NULL DEFAULT 0,
  last_watched_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, episode_id)
);

CREATE INDEX IF NOT EXISTS idx_watch_history_user ON public.watch_history (user_id);

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Episodes
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published episodes are viewable by everyone"
  ON public.episodes FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage all episodes"
  ON public.episodes FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reviews"
  ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews"
  ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Watch History
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own watch history"
  ON public.watch_history FOR ALL USING (auth.uid() = user_id);

-- ─── UPDATED_AT TRIGGER ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_episodes_updated_at
  BEFORE UPDATE ON public.episodes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
