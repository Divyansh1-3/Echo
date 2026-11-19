-- =======================================================
-- Supabase Schema for X-Clone Posts
-- Run this in your Supabase Dashboard -> SQL Editor
-- =======================================================

-- 1. Create Posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_handle TEXT NOT NULL,
  author_avatar TEXT,
  author_verified BOOLEAN DEFAULT false,
  content TEXT NOT NULL,
  hashtags TEXT,
  embed_type TEXT, -- 'code', 'metrics', 'image', 'link', 'chart'
  embed_data JSONB,
  likes_count INT DEFAULT 0,
  retweets_count INT DEFAULT 0,
  replies_count INT DEFAULT 0,
  views_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Anyone can read posts
CREATE POLICY "Allow public read access to posts"
  ON public.posts
  FOR SELECT
  USING (true);

-- 4. Policy: Authenticated users can insert their own posts
CREATE POLICY "Allow authenticated users to create posts"
  ON public.posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- 5. Policy: Users can update their own posts
CREATE POLICY "Allow users to update own posts"
  ON public.posts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 6. Policy: Users can delete their own posts
CREATE POLICY "Allow users to delete own posts"
  ON public.posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Realtime Enablement (Optional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
