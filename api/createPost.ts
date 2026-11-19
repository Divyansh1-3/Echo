import { supabase, isSupabaseConfigured } from '../src/lib/supabase';

export interface CreatePostPayload {
  userId: string;
  content: string;
  hashtags?: string[];
  embedType?: 'code' | 'metrics' | 'image' | 'link' | 'chart' | null;
  embedData?: any;
  authorName?: string;
  authorHandle?: string;
  authorAvatar?: string;
}

/**
 * API function to create a new post in Supabase
 */
export async function createPost(payload: CreatePostPayload) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Check .env variables.');
  }

  if (!payload.content?.trim() && !payload.embedData) {
    throw new Error('Post content cannot be empty.');
  }

  const insertPayload = {
    user_id: payload.userId,
    author_name: payload.authorName || 'Anonymous',
    author_handle: payload.authorHandle || 'user',
    author_avatar: payload.authorAvatar,
    author_verified: true,
    content: payload.content.trim(),
    hashtags: payload.hashtags || [],
    embed_type: payload.embedType || null,
    embed_data: payload.embedData || null,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('posts')
    .insert([insertPayload])
    .select(`
      *,
      profiles:user_id (
        username,
        full_name,
        avatar_url,
        is_verified
      )
    `)
    .single();

  if (error) {
    console.error('[API createPost] Error:', error);
    throw error;
  }

  return data;
}

export default createPost;
