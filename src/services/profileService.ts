import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UpdateProfileParams {
  id: string;
  full_name?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar_url?: string;
  cover_url?: string;
  pronouns?: string;
}

export const profileService = {
  getProfile: async (userId: string) => {
    if (!isSupabaseConfigured || !userId) return { data: null, error: null };

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    return { data, error };
  },

  getProfileByIdentifier: async (identifier: string) => {
    if (!isSupabaseConfigured || !identifier) return { data: null, error: null };

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    let query = supabase.from('profiles').select('*');

    if (isUuid) {
      query = query.eq('id', identifier);
    } else {
      query = query.ilike('username', identifier.replace(/^@/, ''));
    }

    const { data, error } = await query.maybeSingle();
    return { data, error };
  },

  isFollowingUser: async (followerId: string, followingId: string) => {
    if (!isSupabaseConfigured || !followerId || !followingId) return false;

    const { data, error } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    return Boolean(data && !error);
  },

  followUser: async (followerId: string, followingId: string) => {
    if (!isSupabaseConfigured) return { success: true };

    const { data, error } = await supabase
      .from('follows')
      .insert([{ follower_id: followerId, following_id: followingId }])
      .select()
      .single();

    if (error && error.code !== '23505') throw error;
    return { success: true, data };
  },

  unfollowUser: async (followerId: string, followingId: string) => {
    if (!isSupabaseConfigured) return { success: true };

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;
    return { success: true };
  },

  updateProfile: async (updates: UpdateProfileParams) => {
    if (!isSupabaseConfigured) return { data: updates, error: null };

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    return { data, error };
  },

  getUserPosts: async (userId: string) => {
    if (!isSupabaseConfigured || !userId) return { data: [], error: null };

    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles:user_id(username, full_name, avatar_url, is_verified)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data: data || [], error };
  },

  getUserLikes: async (userId: string) => {
    if (!isSupabaseConfigured || !userId) return { data: [], error: null };

    const { data, error } = await supabase
      .from('likes')
      .select('post:post_id(*, profiles:user_id(username, full_name, avatar_url, is_verified))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const posts = (data || []).map((item: any) => item.post).filter(Boolean);
    return { data: posts, error };
  },
};

export default profileService;
