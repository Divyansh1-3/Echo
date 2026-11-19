-- ==============================================================================
-- SUPABASE SCHEMA FOR X-CLONE
-- Tables: profiles, posts, likes, follows
-- Includes: Indexes, RLS Policies, Counter Triggers, and Realtime publication
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. PROFILES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT DEFAULT 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiYixwO6bzmQPOOz9yDAmMrCxaXtiQU9E6xn41ghIPrVNUXSVlF_rhU0GL-ZCNQgDS-IJOcd0x3HYxstWffGFMHy_0X0b8GmBlEkxjVkNSdWVA6CYHnrJWJya4P6q248nUQzIrMe_wmFunafEDTQIanmIqC7UVsvr2uzekg8a5sEOx03n-mLMvjYGUtDvRLYmFMBl3EF5qKwgo2AfSBaNUenYKKTgtwNChzQSTtFk',
  cover_url TEXT DEFAULT 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOn_PuFhHb_DAsgE1V1-zASP1L1DS8ZDAMfaAFxOzB_mZBBDh9-GpU71DJCOgPmYc5GR9FEdpBX-HwkEByKTLAwUIitvDV8aveW7cnVKMXZgOVReUpfy3oOSeyjqgMrViHx4D6fZp1F4HypcZ2T6bnbtXtXyxaAMpQiXvUtNVwQW9EdEM14my05bd3k7mWuWVpTZCBgTua8eYK4Dpd65ZbIYFwoSG8Jo2r72hs9Xs',
  bio TEXT DEFAULT 'Building the next gen of developer tools & UI systems.',
  location TEXT DEFAULT 'San Francisco, CA',
  website TEXT DEFAULT 'alexchen.dev',
  pronouns TEXT DEFAULT 'he/him',
  is_verified BOOLEAN DEFAULT false,
  followers_count INT DEFAULT 0 CHECK (followers_count >= 0),
  following_count INT DEFAULT 0 CHECK (following_count >= 0),
  posts_count INT DEFAULT 0 CHECK (posts_count >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. POSTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  hashtags TEXT[] DEFAULT '{}',
  embed_type TEXT CHECK (embed_type IN ('code', 'metrics', 'image', 'link', 'chart')),
  embed_data JSONB,
  parent_post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE, -- For replies / thread segments
  repost_of_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,   -- For retweets
  likes_count INT DEFAULT 0 CHECK (likes_count >= 0),
  reposts_count INT DEFAULT 0 CHECK (reposts_count >= 0),
  replies_count INT DEFAULT 0 CHECK (replies_count >= 0),
  views_count INT DEFAULT 1 CHECK (views_count >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. LIKES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, post_id)
);

-- ==============================================================================
-- 4. FOLLOWS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- ==============================================================================
-- INDEXES FOR HIGH-THROUGHPUT QUERIES
-- ==============================================================================
-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (LOWER(username));
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles (created_at DESC);

-- Posts
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts (user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_parent_post_id ON public.posts (parent_post_id);
CREATE INDEX IF NOT EXISTS idx_posts_repost_of_id ON public.posts (repost_of_id);

-- Likes
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes (post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes (user_id);

-- Follows
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows (follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows (following_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- PROFILES POLICIES
--------------------------------------------------------------------------------
-- Anyone can view user profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Authenticated users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update only their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

--------------------------------------------------------------------------------
-- POSTS POLICIES
--------------------------------------------------------------------------------
-- Anyone can view posts
CREATE POLICY "Posts are viewable by everyone"
  ON public.posts
  FOR SELECT
  USING (true);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts"
  ON public.posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update only their own posts
CREATE POLICY "Users can update their own posts"
  ON public.posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete only their own posts
CREATE POLICY "Users can delete their own posts"
  ON public.posts
  FOR DELETE
  USING (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- LIKES POLICIES
--------------------------------------------------------------------------------
-- Anyone can view likes
CREATE POLICY "Likes are viewable by everyone"
  ON public.likes
  FOR SELECT
  USING (true);

-- Authenticated users can like a post
CREATE POLICY "Authenticated users can like posts"
  ON public.likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove only their own likes
CREATE POLICY "Users can remove their own likes"
  ON public.likes
  FOR DELETE
  USING (auth.uid() = user_id);

--------------------------------------------------------------------------------
-- FOLLOWS POLICIES
--------------------------------------------------------------------------------
-- Anyone can view who follows whom
CREATE POLICY "Follows are viewable by everyone"
  ON public.follows
  FOR SELECT
  USING (true);

-- Authenticated users can follow others
CREATE POLICY "Authenticated users can follow others"
  ON public.follows
  FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow someone they follow
CREATE POLICY "Users can unfollow"
  ON public.follows
  FOR DELETE
  USING (auth.uid() = follower_id);

-- ==============================================================================
-- DATABASE TRIGGERS & AUTOMATION
-- ==============================================================================

-- 1. Automatically create profile upon user signup in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
  v_full_name TEXT;
BEGIN
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTRING(NEW.id::TEXT, 1, 4)
  );
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    SPLIT_PART(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    v_username,
    v_full_name,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiYixwO6bzmQPOOz9yDAmMrCxaXtiQU9E6xn41ghIPrVNUXSVlF_rhU0GL-ZCNQgDS-IJOcd0x3HYxstWffGFMHy_0X0b8GmBlEkxjVkNSdWVA6CYHnrJWJya4P6q248nUQzIrMe_wmFunafEDTQIanmIqC7UVsvr2uzekg8a5sEOx03n-mLMvjYGUtDvRLYmFMBl3EF5qKwgo2AfSBaNUenYKKTgtwNChzQSTtFk')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Automatically update posts.likes_count when likes are added/removed
CREATE OR REPLACE FUNCTION public.handle_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_like_change ON public.likes;
CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_like_count();

-- 3. Automatically update profiles.posts_count when posts are added/deleted
CREATE OR REPLACE FUNCTION public.handle_user_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
    SET posts_count = posts_count + 1
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
    SET posts_count = GREATEST(posts_count - 1, 0)
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_change ON public.posts;
CREATE TRIGGER on_post_change
  AFTER INSERT OR DELETE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_post_count();

-- 4. Automatically update profiles.followers_count & following_count
CREATE OR REPLACE FUNCTION public.handle_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment follower's following count
    UPDATE public.profiles
    SET following_count = following_count + 1
    WHERE id = NEW.follower_id;

    -- Increment followed user's followers count
    UPDATE public.profiles
    SET followers_count = followers_count + 1
    WHERE id = NEW.following_id;

    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement follower's following count
    UPDATE public.profiles
    SET following_count = GREATEST(following_count - 1, 0)
    WHERE id = OLD.follower_id;

    -- Decrement followed user's followers count
    UPDATE public.profiles
    SET followers_count = GREATEST(followers_count - 1, 0)
    WHERE id = OLD.following_id;

    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_follow_change ON public.follows;
CREATE TRIGGER on_follow_change
  AFTER INSERT OR DELETE ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_follow_counts();

-- ==============================================================================
-- REALTIME SUBSCRIPTIONS
-- ==============================================================================
-- Add tables to the supabase_realtime publication for live client sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.follows;
