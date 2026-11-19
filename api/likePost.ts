import { supabase, isSupabaseConfigured } from '../src/lib/supabase';

export interface LikeParams {
  postId: string;
  userId: string;
}

/**
 * Like a post
 */
export async function likePost({ postId, userId }: LikeParams) {
  if (!isSupabaseConfigured) return { success: true };

  const { data, error } = await supabase
    .from('likes')
    .insert([{ post_id: postId, user_id: userId }])
    .select()
    .single();

  if (error && error.code !== '23505') {
    // 23505 is unique violation (already liked)
    console.error('[API likePost] Error:', error);
    throw error;
  }

  return { success: true, data };
}

/**
 * Unlike a post
 */
export async function unlikePost({ postId, userId }: LikeParams) {
  if (!isSupabaseConfigured) return { success: true };

  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);

  if (error) {
    console.error('[API unlikePost] Error:', error);
    throw error;
  }

  return { success: true };
}

/**
 * Check if user liked post
 */
export async function checkIfLiked({ postId, userId }: LikeParams) {
  if (!isSupabaseConfigured || !userId) return false;

  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[API checkIfLiked] Error:', error);
    return false;
  }

  return Boolean(data);
}
