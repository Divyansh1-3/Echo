import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { initialFeedPosts, currentUser as fallbackUser } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

/**
 * Format relative time (e.g., "Just now", "5m", "2h", "Oct 14")
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
 * Maps Supabase DB row to the frontend PostCard model
 */
function mapDbRowToPost(row) {
  const authorProfile = row.profiles || {};
  return {
    id: row.id,
    author: {
      name: authorProfile.full_name || row.author_name || 'Anonymous',
      handle: authorProfile.username || row.author_handle || 'user',
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
      retweets: row.retweets_count || 0,
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

export function usePosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(initialFeedPosts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Keep a reference to current posts for accurate rollbacks
  const postsRef = useRef(posts);
  postsRef.current = posts;

  /**
   * 1. Fetch posts from Supabase
   */
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      // If Supabase credentials are not set, use mock data fallback
      setPosts(initialFeedPosts);
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
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
        .order('created_at', { ascending: false });

      if (fetchError) {
        // If table does not exist yet in Supabase, warn gracefully and use mock posts
        console.warn('[usePosts] Supabase fetch error (table may not exist yet):', fetchError.message);
        setError(fetchError.message);
        setPosts(initialFeedPosts);
      } else if (data && data.length > 0) {
        const formatted = data.map(mapDbRowToPost);
        setPosts(formatted);
      } else {
        // Table exists but is empty - initialize with mock posts
        setPosts(initialFeedPosts);
      }
    } catch (err) {
      console.error('[usePosts] Unexpected error while fetching posts:', err);
      setError(err.message || 'Failed to fetch posts');
      setPosts(initialFeedPosts);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Initial fetch & Real-time subscription
   */
  useEffect(() => {
    fetchPosts();

    if (!isSupabaseConfigured) return;

    // Listen to real-time inserts from other users / tabs
    const channel = supabase
      .channel('public:posts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          const newPost = mapDbRowToPost(payload.new);
          setPosts((prev) => {
            // Check if already in list (e.g. from local optimistic update replacement)
            if (prev.some((p) => p.id === newPost.id)) {
              return prev;
            }
            return [newPost, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  /**
   * 2. Create post with OPTIMISTIC UPDATES and ROLLBACK
   */
  const createPost = async (postInput) => {
    setError(null);

    // Parse input
    const isObject = typeof postInput === 'object' && postInput !== null;
    const content = isObject ? postInput.content : String(postInput);
    const hasAttachment = isObject ? Boolean(postInput.hasAttachment) : false;

    if (!content.trim() && !hasAttachment) {
      const err = new Error('Post content cannot be empty.');
      setError(err.message);
      throw err;
    }

    // Determine author profile
    const authorName = user?.user_metadata?.full_name || fallbackUser.name;
    const authorHandle =
      user?.user_metadata?.username ||
      (user?.email ? user.email.split('@')[0] : fallbackUser.handle);
    const authorAvatar = user?.user_metadata?.avatar_url || fallbackUser.avatar;

    // Default attachment preview if attached
    const defaultAttachment = {
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBQpDIJW54LFhEFswM3hRua89OnvC_ffUTVqzFvrWKxIuAu7c47NbPhRgNALpOj0jAd0BetdqCgjzdmxh0Wk-DsuIXCI0OAfBNkfUkTR_ILGPAj9ZpAdcANppOAuLxVsG7DSiQ8BIQf9sMdjxneA-x3e4NROil7CQoVeuBQwxJzDT0lX_Br3Qu74X7Z5Bfi0-pm5TTVajhOGkIB_7ypyLK3QbccY-TFajHwZQBIVz0',
      url: 'github.com/acmelabs/topology-engine',
      title: 'topology-engine: Ultra-low latency layout solver',
      description:
        'A SIMD-accelerated physical force simulation engine tuned for browser runtimes and micro-interactions.',
    };

    const embedType = hasAttachment ? 'link' : postInput.embedType || null;
    const embedData = hasAttachment
      ? defaultAttachment
      : postInput.embedData || null;

    // Step A: Create the optimistic post object
    const tempId = `optimistic-${Date.now()}`;
    const optimisticPost = {
      id: tempId,
      author: {
        name: authorName,
        handle: authorHandle,
        avatar: authorAvatar,
        verified: true,
      },
      time: 'Just now',
      content: content.trim(),
      embedType,
      linkData: embedType === 'link' ? embedData : undefined,
      codeData: embedType === 'code' ? embedData : undefined,
      imageData: embedType === 'image' ? embedData : undefined,
      stats: {
        replies: 0,
        retweets: 0,
        likes: 0,
        likesFormatted: '0',
        views: '1',
        isLiked: false,
        isRetweeted: false,
        isBookmarked: false,
      },
      created_at: new Date().toISOString(),
      isOptimistic: true,
    };

    // Step B: Snapshot previous state for rollback
    const previousPosts = postsRef.current;

    // Step C: OPTIMISTIC UPDATE: Prepend immediately to UI
    setPosts([optimisticPost, ...previousPosts]);

    // If Supabase is not configured, we simulate instant success locally
    if (!isSupabaseConfigured) {
      return optimisticPost;
    }

    if (!user?.id) {
      const err = new Error('You must be logged in to create a post.');
      setPosts(previousPosts);
      setError(err.message);
      throw err;
    }

    // Step D: Perform actual Supabase network request
    try {
      const payload = {
        user_id: user.id,
        author_name: authorName,
        author_handle: authorHandle,
        author_avatar: authorAvatar,
        author_verified: true,
        content: content.trim(),
        embed_type: embedType,
        embed_data: embedData,
        created_at: new Date().toISOString(),
      };

      const { data, error: insertError } = await supabase
        .from('posts')
        .insert([payload])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Step E: On Success: Replace optimistic post with server-confirmed post
      const confirmedPost = mapDbRowToPost(data);
      setPosts((current) =>
        current.map((post) => (post.id === tempId ? confirmedPost : post))
      );

      return confirmedPost;
    } catch (err) {
      console.error('[usePosts] Create post failed, rolling back:', err);
      // Step F: On Error: ROLLBACK to snapshot and set error state
      setPosts(previousPosts);
      const errorMessage =
        err.message || 'Failed to create post. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Helper to dismiss error banner
   */
  const clearError = () => setError(null);

  return {
    posts,
    loading,
    error,
    createPost,
    refetch: fetchPosts,
    clearError,
  };
}

export default usePosts;
