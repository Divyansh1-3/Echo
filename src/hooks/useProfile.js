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

export function useProfile(identifier) {
  const { user } = useAuth();
  const targetIdentifier = identifier || user?.id;

  const [profile, setProfile] = useState(fallbackUser);
  const [posts, setPosts] = useState(fallbackPosts);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // Check if viewing own profile
  const isOwnProfile = Boolean(
    !identifier ||
    (user?.id && (profile?.id === user.id || identifier === user.id)) ||
    (user?.user_metadata?.username &&
      identifier?.toLowerCase().replace(/^@/, '') ===
        user.user_metadata.username.toLowerCase())
  );

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // If no target user can be determined, show fallback
    if (!targetIdentifier) {
      setProfile(fallbackUser);
      setPosts(fallbackPosts);
      setLoading(false);
      return;
    }

    const cleanHandle = identifier ? identifier.replace(/^@/, '').toLowerCase() : null;

    // Fallback handler for mock users or when Supabase is unconfigured
    const handleMockFallback = () => {
      const matchingPost = initialFeedPosts.find(
        (p) => p.author?.handle?.toLowerCase() === cleanHandle
      );

      if (matchingPost) {
        const mockAuthor = matchingPost.author;
        setProfile({
          ...fallbackUser,
          id: `mock-${mockAuthor.handle}`,
          name: mockAuthor.name,
          handle: mockAuthor.handle,
          avatar: mockAuthor.avatar,
          bio: `${mockAuthor.name} - Building next-gen software, AI infrastructure, and UI systems.`,
          isVerified: mockAuthor.verified,
          followersCount: '14.2K',
          followingCount: '482',
          postsCount: String(
            initialFeedPosts.filter((p) => p.author?.handle === mockAuthor.handle).length || 1
          ),
        });
        setPosts(initialFeedPosts.filter((p) => p.author?.handle === mockAuthor.handle));
      } else if (cleanHandle && cleanHandle !== 'alexchen') {
        setProfile({
          ...fallbackUser,
          id: `mock-${cleanHandle}`,
          name: cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1),
          handle: cleanHandle,
          avatar: fallbackUser.avatar,
          bio: `Developer & creator sharing insights on X Connect.`,
          followersCount: '1.2K',
          followingCount: '320',
          postsCount: '0',
        });
        setPosts([]);
      } else {
        setProfile(fallbackUser);
        setPosts(fallbackPosts);
      }
    };

    if (!isSupabaseConfigured) {
      handleMockFallback();
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch Profile by UUID or Username from Supabase
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetIdentifier);
      let query = supabase.from('profiles').select('*');

      if (isUuid) {
        query = query.eq('id', targetIdentifier);
      } else {
        query = query.ilike('username', cleanHandle || targetIdentifier);
      }

      const { data: profileData, error: profileError } = await query.maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.warn('[useProfile] Error fetching profile:', profileError.message);
      }

      if (profileData) {
        const loadedProfile = {
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
          followersCount: typeof profileData.followers_count === 'number'
            ? String(profileData.followers_count)
            : fallbackUser.followersCount,
          followingCount: typeof profileData.following_count === 'number'
            ? String(profileData.following_count)
            : fallbackUser.followingCount,
          postsCount: typeof profileData.posts_count === 'number'
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
        setProfile(loadedProfile);

        // Check if viewing user follows this profile
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
          setPosts(userPostsData.map(mapDbRowToPost));
        } else {
          setPosts([]);
        }

        // 3. Fetch User's Liked Posts
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
      } else if (user?.user_metadata && (!identifier || identifier === user.id)) {
        // Authenticated user with no profile record yet
        setProfile({
          ...fallbackUser,
          id: user.id,
          name: user.user_metadata.full_name || fallbackUser.name,
          handle:
            user.user_metadata.username ||
            (user.email ? user.email.split('@')[0] : fallbackUser.handle),
          avatar: user.user_metadata.avatar_url || fallbackUser.avatar,
        });
        setPosts([]);
      } else {
        // Mock fallback for requested username
        handleMockFallback();
      }
    } catch (err) {
      console.error('[useProfile] Unexpected error:', err);
      setError(err.message || 'Failed to load profile');
      handleMockFallback();
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
      setProfile((prev) => ({ ...prev, followersCount: previousCount }));
      throw err;
    } finally {
      setIsFollowLoading(false);
    }
  };

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
