import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const authService = {
  getSession: () => {
    if (!isSupabaseConfigured) return Promise.resolve({ data: { session: null }, error: null });
    return supabase.auth.getSession();
  },

  signUp: ({ email, password, fullName, username }: { email: string; password: string; fullName?: string; username?: string }) => {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured');
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
          username: username || '',
        },
      },
    });
  },

  signIn: ({ email, password }: { email: string; password: string }) => {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured');
    return supabase.auth.signInWithPassword({ email, password });
  },

  signInWithOAuth: (provider: 'google' | 'apple' | 'github') => {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured');
    return supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/feed`,
      },
    });
  },

  signOut: () => {
    if (!isSupabaseConfigured) return Promise.resolve({ error: null });
    return supabase.auth.signOut();
  },
};

export default authService;
