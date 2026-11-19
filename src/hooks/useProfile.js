import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { currentUser as fallbackUser, profilePosts as fallbackPosts } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

function mapDbRowToPost(row) {
  const authorProfile = row.profiles || {};
  return {
    id: row.id,
    author: {
      name: authorProfile.full_name || row.author_name || fallbackUser.name,
      handle: authorProfile.username || row.author_handle || fallbackUser.handle,
      avatar: authorProfile.avatar_url || row.author_avatar || fallbackUser.avatar,
      verified: authorProfile.is_verified ?? Boolean(row.author_verified),
    },
    time: formatTimeAgo(row.created_at),
    content: row.content,
    hashtags: row.hashtags || null,
    embedType: row.embed_type || null,
    linkData: row.embed_type === 'link' ? row.embed_data : undefined,
    codeData: row.embed_type === 'code' ? row.embed_data : undefined,
    imageData: row.embed_type === 'image' ? row.embed_data : undefined,
    metricsData: row.embed_type === 'metrics' ? row.embed_data : undefined,
    chartData: row.embed_type === 'chart' ? row.embed_data : undefined,
    stats: {
      replies: row.replies_count || 0,
      retweets: row.reposts_count || 0,
      likes: row.likes_count || 0,
      likesFormatted: row.likes_count ? String(row.likes_count) : '0',
      views: row.views_count ? `${row.views_count}` : '1',
      isLiked: false,
      isRetweeted: false,
      isBookmarked: false,
    },
    created_at: row.created_at,
  };
}

function formatTimeAgo(dateString) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function useProfile(customUserId) {
  const { user } = useAuth();
  const targetUserId = customUserId || user?.id;

  const [profile, setProfile] = useState(fallbackUser);
  const [posts, setPosts] = useState(fallbackPosts);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // If Supabase is unconfigured, fallback gracefully to mock data
    if (!isSupabaseConfigured) {
      setProfile(fallbackUser);
      setPosts(fallbackPosts);
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch Profile
      let currentProfile = fallbackUser;
      if (targetUserId) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUserId)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.warn('[useProfile] Error fetching profile:', profileError.message);
        }

        if (profileData) {
          currentProfile = {
            id: profileData.id,
            name: profileData.full_name || fallbackUser.name,
            handle: profileData.username || fallbackUser.handle,
            avatar: profileData.avatar_url || fallbackUser.avatar,
            coverImage: profileData.cover_url || fallbackUser.coverImage,
            bio: profileData.bio || fallbackUser.bio,
            location: profileData.location || fallbackUser.location,
            website: profileData.website || fallbackUser.website,
            websiteUrl: profileData.website?.startsWith('http')
              ? profileData.website
              : `https://${profileData.website || 'alexchen.dev'}`,
            pronouns: profileData.pronouns || fallbackUser.pronouns,
            isVerified: profileData.is_verified ?? true,
            followersCount: profileData.followers_count
              ? String(profileData.followers_count)
              : fallbackUser.followersCount,
            followingCount: profileData.following_count
              ? String(profileData.following_count)
              : fallbackUser.followingCount,
            postsCount: profileData.posts_count
              ? String(profileData.posts_count)
              : fallbackUser.postsCount,
            joined: profileData.created_at
              ? `Joined ${new Date(profileData.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}`
              : fallbackUser.joined,
            mutuals: fallbackUser.mutuals,
          };
          setProfile(currentProfile);
        } else if (user?.user_metadata) {
          // If profile table doesn't have a row yet, synthesize from auth metadata
          currentProfile = {
            ...fallbackUser,
            name: user.user_metadata.full_name || fallbackUser.name,
            handle:
              user.user_metadata.username ||
              (user.email ? user.email.split('@')[0] : fallbackUser.handle),
            avatar: user.user_metadata.avatar_url || fallbackUser.avatar,
          };
          setProfile(currentProfile);
        }
      }

      // 2. Fetch User's Posts from Supabase
      if (targetUserId) {
        const { data: userPostsData, error: userPostsError } = await supabase
          .from('posts')
          .select(
            `*, profiles:user_id(username, full_name, avatar_url, is_verified)`
          )
          .eq('user_id', targetUserId)
          .order('created_at', { ascending: false });

        if (userPostsError) {
          console.warn('[useProfile] Error fetching user posts:', userPostsError.message);
          setPosts(fallbackPosts);
        } else if (userPostsData && userPostsData.length > 0) {
          setPosts(userPostsData.map(mapDbRowToPost));
        } else {
          setPosts(fallbackPosts);
        }

        // 3. Fetch User's Liked Posts
        const { data: userLikesData, error: userLikesError } = await supabase
          .from('likes')
          .select(
            `post:post_id(*, profiles:user_id(username, full_name, avatar_url, is_verified))`
          )
          .eq('user_id', targetUserId)
          .order('created_at', { ascending: false });

        if (!userLikesError && userLikesData) {
          const liked = userLikesData
            .map((item) => item.post)
            .filter(Boolean)
            .map(mapDbRowToPost);
          setLikedPosts(liked);
        }
      } else {
        setPosts(fallbackPosts);
      }
    } catch (err) {
      console.error('[useProfile] Unexpected error:', err);
      setError(err.message || 'Failed to load profile');
      setProfile(fallbackUser);
      setPosts(fallbackPosts);
    } finally {
      setLoading(false);
    }
  }, [targetUserId, user]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  /**
   * Update Profile in Supabase
   */
  const updateProfile = async (updates) => {
    if (!isSupabaseConfigured || !user?.id) {
      // Optimistic local update when unconfigured
      setProfile((prev) => ({ ...prev, ...updates }));
      return;
    }

    setIsUpdating(true);
    setError(null);

    const prevProfile = profile;
    // Optimistic local update
    setProfile((prev) => ({
      ...prev,
      ...updates,
      name: updates.full_name || prev.name,
      website: updates.website || prev.website,
    }));

    try {
      const dbPayload = {
        id: user.id,
        full_name: updates.name || updates.full_name || profile.name,
        bio: updates.bio ?? profile.bio,
        location: updates.location ?? profile.location,
        website: updates.website ?? profile.website,
        avatar_url: updates.avatar ?? updates.avatar_url ?? profile.avatar,
        cover_url: updates.coverImage ?? updates.cover_url ?? profile.coverImage,
        pronouns: updates.pronouns ?? profile.pronouns,
        updated_at: new Date().toISOString(),
      };

      const { data, error: updateError } = await supabase
        .from('profiles')
        .upsert(dbPayload)
        .select()
        .single();

      if (updateError) throw updateError;

      // Sync confirmed DB fields
      setProfile((prev) => ({
        ...prev,
        name: data.full_name,
        bio: data.bio,
        location: data.location,
        website: data.website,
        avatar: data.avatar_url,
        coverImage: data.cover_url,
        pronouns: data.pronouns,
      }));

      return data;
    } catch (err) {
      console.error('[useProfile] Update failed, rolling back:', err);
      setProfile(prevProfile);
      const msg = err.message || 'Failed to update profile';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const clearError = () => setError(null);

  return {
    profile,
    posts,
    likedPosts,
    loading,
    error,
    isUpdating,
    updateProfile,
    refetch: fetchProfileData,
    clearError,
  };
}

export default useProfile;
