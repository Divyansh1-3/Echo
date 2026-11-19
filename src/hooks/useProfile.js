import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

/**
 * Format timestamp into human-readable relative string
 */
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

/**
 * Maps Supabase post row to UI post model
 */
function mapDbRowToPost(row) {
  const authorProfile = row.profiles || {};
  const authorId = row.user_id || authorProfile.id || null;
  const authorHandle = authorProfile.username || row.author_handle || (authorId ? `user_${String(authorId).slice(0, 8)}` : 'user');
  const authorName = authorProfile.full_name || row.author_name || authorHandle || 'Anonymous';
  const authorAvatar =
    authorProfile.avatar_url ||
    row.author_avatar ||
    `https://api.dicebear.com/7.x/identicon/svg?seed=${authorHandle}`;

  return {
    id: row.id,
    userId: authorId,
    author: {
      id: authorId,
      name: authorName,
      handle: String(authorHandle).replace(/^@/, ''),
      avatar: authorAvatar,
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

export function useProfile(identifier) {
  const { user } = useAuth();
  const targetIdentifier = identifier || user?.id;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // Check if viewing own profile
  const isOwnProfile = Boolean(
    user?.id && (
      !identifier ||
      (profile?.id && profile.id === user.id) ||
      identifier === user.id ||
      (user.user_metadata?.username &&
        identifier?.toLowerCase().replace(/^@/, '') === user.user_metadata.username.toLowerCase())
    )
  );

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // If no target user can be determined
    if (!targetIdentifier) {
      setProfile(null);
      setPosts([]);
      setLikedPosts([]);
      setLoading(false);
      return;
    }

    const cleanTarget = targetIdentifier.trim().replace(/^@/, '');

    // Fallback handler when Supabase is not configured
    const handleUnconfiguredFallback = () => {
      const handle = cleanTarget || 'user';
      const name = handle.charAt(0).toUpperCase() + handle.slice(1);
      setProfile({
        id: `local-${handle}`,
        name,
        handle,
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${handle}`,
        coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        bio: `Building next-gen systems and sharing updates on X Connect.`,
        location: 'Global',
        website: `${handle}.dev`,
        websiteUrl: `https://${handle}.dev`,
        pronouns: 'they/them',
        isVerified: false,
        followersCount: '0',
        followingCount: '0',
        postsCount: '0',
        joined: 'Joined recently',
      });
      setPosts([]);
      setLikedPosts([]);
      setLoading(false);
    };

    if (!isSupabaseConfigured) {
      handleUnconfiguredFallback();
      return;
    }

    try {
      // 1. Fetch Profile by UUID or Username from Supabase
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanTarget);
      let profileData = null;

      if (isUuid) {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', cleanTarget)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.warn('[useProfile] Error fetching profile by ID:', profileError.message);
        }
        profileData = data;
      } else {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .ilike('username', cleanTarget)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.warn('[useProfile] Error fetching profile by username:', profileError.message);
        }
        profileData = data;

        // If not found by username, try querying by id as fallback
        if (!profileData) {
          const { data: idData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', cleanTarget)
            .maybeSingle();
          profileData = idData;
        }
      }

      if (profileData) {
        const loadedProfile = {
          id: profileData.id,
          name: profileData.full_name || profileData.username || 'Anonymous',
          handle: profileData.username || (profileData.id ? `user_${profileData.id.slice(0, 8)}` : 'user'),
          avatar: profileData.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${profileData.username || profileData.id}`,
          coverImage: profileData.cover_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          bio: profileData.bio || '',
          location: profileData.location || '',
          website: profileData.website || '',
          websiteUrl: profileData.website
            ? (profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`)
            : '',
          pronouns: profileData.pronouns || '',
          isVerified: Boolean(profileData.is_verified),
          followersCount: typeof profileData.followers_count === 'number'
            ? String(profileData.followers_count)
            : '0',
          followingCount: typeof profileData.following_count === 'number'
            ? String(profileData.following_count)
            : '0',
          postsCount: typeof profileData.posts_count === 'number'
            ? String(profileData.posts_count)
            : '0',
          joined: profileData.created_at
            ? `Joined ${new Date(profileData.created_at).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}`
            : 'Joined recently',
        };

        // 2. Fetch User's Posts from Supabase
        const { data: userPostsData, error: userPostsError } = await supabase
          .from('posts')
          .select(`*, profiles:user_id(username, full_name, avatar_url, is_verified)`)
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false });

        if (userPostsError) {
          console.warn('[useProfile] Error fetching user posts:', userPostsError.message);
          setPosts([]);
        } else if (userPostsData && userPostsData.length > 0) {
          const mapped = userPostsData.map(mapDbRowToPost);
          setPosts(mapped);
          if (!profileData.posts_count) {
            loadedProfile.postsCount = String(mapped.length);
          }
        } else {
          setPosts([]);
        }

        // 3. Fetch User's Liked Posts from Supabase
        const { data: userLikesData } = await supabase
          .from('likes')
          .select(`post:post_id(*, profiles:user_id(username, full_name, avatar_url, is_verified))`)
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false });

        if (userLikesData && userLikesData.length > 0) {
          const liked = userLikesData
            .map((item) => item.post)
            .filter(Boolean)
            .map(mapDbRowToPost);
          setLikedPosts(liked);
        } else {
          setLikedPosts([]);
        }

        // 4. Check if viewing user follows this profile
        if (user?.id && user.id !== profileData.id) {
          const { data: followRecord } = await supabase
            .from('follows')
            .select('follower_id')
            .eq('follower_id', user.id)
            .eq('following_id', profileData.id)
            .maybeSingle();
          setIsFollowing(Boolean(followRecord));
        } else {
          setIsFollowing(false);
        }

        setProfile(loadedProfile);
      } else if (user?.id && (!identifier || identifier === user.id || cleanTarget.toLowerCase() === user.user_metadata?.username?.toLowerCase())) {
        // Authenticated user with no profile record in DB yet
        const authName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        const authHandle = user.user_metadata?.username || (user.email ? user.email.split('@')[0] : 'user');
        const synthesizedProfile = {
          id: user.id,
          name: authName,
          handle: authHandle,
          avatar: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.id}`,
          coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          bio: '',
          location: '',
          website: '',
          websiteUrl: '',
          pronouns: '',
          isVerified: false,
          followersCount: '0',
          followingCount: '0',
          postsCount: '0',
          joined: user.created_at
            ? `Joined ${new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
            : 'Joined recently',
        };
        setProfile(synthesizedProfile);
        setPosts([]);
        setLikedPosts([]);
      } else {
        // Profile not found in Supabase
        setProfile(null);
        setPosts([]);
        setLikedPosts([]);
        setError("This account doesn't exist");
      }
    } catch (err) {
      console.error('[useProfile] Unexpected error:', err);
      setError(err.message || 'Failed to load profile');
      setProfile(null);
      setPosts([]);
      setLikedPosts([]);
    } finally {
      setLoading(false);
    }
  }, [targetIdentifier, identifier, user]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  /**
   * Follow / Unfollow User in Supabase
   */
  const toggleFollow = async () => {
    if (!user?.id) {
      return { requiresAuth: true };
    }

    if (!profile?.id) return { success: false };

    setIsFollowLoading(true);
    const previousFollowing = isFollowing;
    const previousCount = profile.followersCount;

    // Optimistic UI update
    setIsFollowing(!previousFollowing);
    setProfile((prev) => {
      if (!prev) return prev;
      const current = parseInt(String(prev.followersCount).replace(/[^0-9]/g, '') || '0', 10);
      const next = previousFollowing ? Math.max(current - 1, 0) : current + 1;
      return { ...prev, followersCount: String(next) };
    });

    if (!isSupabaseConfigured) {
      setIsFollowLoading(false);
      return { success: true };
    }

    try {
      if (previousFollowing) {
        // Unfollow
        const { error: unfollowError } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id);
        if (unfollowError) throw unfollowError;
      } else {
        // Follow
        const { error: followError } = await supabase
          .from('follows')
          .insert([{ follower_id: user.id, following_id: profile.id }]);
        if (followError && followError.code !== '23505') throw followError;
      }
      return { success: true };
    } catch (err) {
      console.error('[useProfile] Failed to toggle follow:', err);
      // Rollback
      setIsFollowing(previousFollowing);
      setProfile((prev) => (prev ? { ...prev, followersCount: previousCount } : prev));
      throw err;
    } finally {
      setIsFollowLoading(false);
    }
  };

  /**
   * Update Profile in Supabase
   */
  const updateProfile = async (updates) => {
    if (!user?.id) return;

    setIsUpdating(true);
    setError(null);

    const prevProfile = profile;
    // Optimistic local update
    setProfile((prev) => ({
      ...prev,
      ...updates,
      name: updates.name || updates.full_name || prev?.name,
      website: updates.website || prev?.website,
    }));

    if (!isSupabaseConfigured) {
      setIsUpdating(false);
      return;
    }

    try {
      const dbPayload = {
        id: user.id,
        full_name: updates.name || updates.full_name || profile?.name,
        bio: updates.bio ?? profile?.bio ?? '',
        location: updates.location ?? profile?.location ?? '',
        website: updates.website ?? profile?.website ?? '',
        avatar_url: updates.avatar ?? updates.avatar_url ?? profile?.avatar ?? '',
        cover_url: updates.coverImage ?? updates.cover_url ?? profile?.coverImage ?? '',
        pronouns: updates.pronouns ?? profile?.pronouns ?? '',
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
        name: data.full_name || prev?.name,
        bio: data.bio || '',
        location: data.location || '',
        website: data.website || '',
        avatar: data.avatar_url || prev?.avatar,
        coverImage: data.cover_url || prev?.coverImage,
        pronouns: data.pronouns || '',
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
    isOwnProfile,
    isFollowing,
    isFollowLoading,
    toggleFollow,
    updateProfile,
    refetch: fetchProfileData,
    clearError,
  };
}

export default useProfile;
