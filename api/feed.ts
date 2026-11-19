import { supabase, isSupabaseConfigured } from '../src/lib/supabase';

export interface FeedQueryOptions {
  limit?: number;
  offset?: number;
  userId?: string;
  followingOnly?: boolean;
}

/**
 * Fetch home feed posts from Supabase
 */
export async function getFeedPosts(options: FeedQueryOptions = {}) {
  const { limit = 50, offset = 0, userId } = options;

  if (!isSupabaseConfigured) {
    return { data: [], error: null, isMock: true };
  }

  try {
    let query = supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          username,
          full_name,
          avatar_url,
          is_verified
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data: data || [], error: null, isMock: false };
  } catch (err: any) {
    console.error('[API getFeedPosts] Error fetching feed:', err);
    return { data: [], error: err.message || 'Failed to fetch feed', isMock: false };
  }
}

/**
 * Fetch single post by ID
 */
export async function getPostById(postId: string) {
  if (!isSupabaseConfigured) {
    return { data: null, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          username,
          full_name,
          avatar_url,
          is_verified
        )
      `)
      .eq('id', postId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    console.error(`[API getPostById] Error fetching post ${postId}:`, err);
    return { data: null, error: err.message || 'Post not found' };
  }
}
