import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trendingTopics } from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function RightSidebar() {
  const { user } = useAuth();
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followingMap, setFollowingMap] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSuggestedUsers() {
      if (!isSupabaseConfigured) {
        if (isMounted) {
          setSuggestedUsers([]);
          setLoadingUsers(false);
        }
        return;
      }

      try {
        let query = supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, is_verified, bio')
          .limit(4);

        if (user?.id) {
          query = query.neq('id', user.id);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          if (isMounted) setSuggestedUsers(data);
        } else {
          if (isMounted) setSuggestedUsers([]);
        }
      } catch (err) {
        console.warn('[RightSidebar] Failed to load suggested users:', err);
        if (isMounted) setSuggestedUsers([]);
      } finally {
        if (isMounted) setLoadingUsers(false);
      }
    }

    loadSuggestedUsers();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const toggleFollow = async (targetUserId) => {
    const isCurrentlyFollowing = followingMap[targetUserId];
    setFollowingMap((prev) => ({
      ...prev,
      [targetUserId]: !isCurrentlyFollowing,
    }));

    if (!isSupabaseConfigured || !user?.id) return;

    try {
      if (isCurrentlyFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);
      } else {
        await supabase
          .from('follows')
          .insert([{ follower_id: user.id, following_id: targetUserId }]);
      }
    } catch (err) {
      console.error('[RightSidebar] Failed to update follow:', err);
      // Rollback on failure
      setFollowingMap((prev) => ({
        ...prev,
        [targetUserId]: isCurrentlyFollowing,
      }));
    }
  };

  return (
    <aside className="hidden lg:block w-[350px] h-screen sticky top-0 pl-space-lg py-space-md shrink-0 overflow-y-auto">
      <div className="flex flex-col gap-space-lg">
        {/* Search Bar */}
        <div className="relative flex items-center bg-surface-container-low rounded-full px-space-md py-space-sm text-on-surface-variant focus-within:text-on-surface focus-within:bg-surface-container-lowest transition-all">
          <span className="material-symbols-outlined text-outline mr-space-sm text-[20px]">
            search
          </span>
          <input
            className="bg-transparent w-full font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none"
            placeholder="Search"
            type="text"
          />
        </div>

        {/* What's happening */}
        <div className="bg-surface-container-low rounded-2xl p-space-lg flex flex-col gap-space-md">
          <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">
            What's happening
          </h3>
          {trendingTopics.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-space-xs cursor-pointer group">
              <div className="flex justify-between items-start">
                <span className="font-label-sm text-label-sm text-outline">
                  {item.category}
                </span>
                <span className="material-symbols-outlined text-outline text-[16px] group-hover:text-primary transition-colors">
                  more_horiz
                </span>
              </div>
              <span className="font-label-lg text-label-lg text-on-surface font-bold group-hover:underline">
                {item.title}
              </span>
              <span className="font-label-sm text-label-sm text-outline">
                {item.posts}
              </span>
            </div>
          ))}
        </div>

        {/* Who to follow */}
        <div className="bg-surface-container-low rounded-2xl p-space-lg flex flex-col gap-space-md">
          <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">
            Who to follow
          </h3>
          {loadingUsers ? (
            <div className="flex flex-col gap-3 animate-pulse">
              <div className="h-10 bg-surface-container rounded-xl w-full"></div>
              <div className="h-10 bg-surface-container rounded-xl w-full"></div>
            </div>
          ) : suggestedUsers.length > 0 ? (
            suggestedUsers.map((su) => {
              const isFollowing = followingMap[su.id];
              const displayName = su.full_name || su.username || 'User';
              const displayHandle = su.username || `user_${su.id.slice(0, 8)}`;
              const avatarSrc =
                su.avatar_url ||
                `https://api.dicebear.com/7.x/identicon/svg?seed=${displayHandle}`;

              return (
                <div key={su.id} className="flex items-center justify-between">
                  <Link
                    to={`/profile/${su.username || su.id}`}
                    className="flex items-center gap-space-sm group/user hover:opacity-90 transition-opacity truncate mr-2"
                    title={`View @${displayHandle}'s profile`}
                  >
                    <img
                      src={avatarSrc}
                      alt={displayName}
                      className="w-10 h-10 rounded-full object-cover shrink-0 bg-surface-container-high"
                      onError={(e) => {
                        e.currentTarget.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${displayHandle}`;
                      }}
                    />
                    <div className="flex flex-col leading-tight truncate">
                      <span className="font-label-lg text-label-lg text-on-surface font-bold group-hover/user:underline truncate">
                        {displayName}
                      </span>
                      <span className="font-body-sm text-body-sm text-outline truncate">
                        @{displayHandle}
                      </span>
                    </div>
                  </Link>
                  <button
                    onClick={() => toggleFollow(su.id)}
                    className={`px-space-md py-space-xs rounded-full font-label-md text-label-md font-bold transition-colors cursor-pointer ${
                      isFollowing
                        ? 'bg-transparent border border-outline text-on-surface hover:bg-error-container/20 hover:text-error hover:border-error'
                        : 'bg-on-surface text-surface hover:bg-inverse-surface'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-2 text-outline font-body-sm">
              No suggested accounts yet.
            </div>
          )}
        </div>

        {/* Legal & Copyright */}
        <div className="px-space-sm text-outline font-label-sm text-label-sm flex flex-wrap gap-x-space-sm gap-y-space-xs">
          <a className="hover:underline" href="#">Terms of Service</a>
          <a className="hover:underline" href="#">Privacy Policy</a>
          <a className="hover:underline" href="#">Cookie Policy</a>
          <a className="hover:underline" href="#">Accessibility</a>
          <span>© 2025 X Corp.</span>
        </div>
      </div>
    </aside>
  );
}
