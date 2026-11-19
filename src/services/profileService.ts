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
