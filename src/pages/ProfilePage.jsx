import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';
import useProfile from '../hooks/useProfile';
import usePosts from '../hooks/usePosts';

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, userId } = useParams();
  const profileIdentifier = username || userId;

  const {
    profile,
    posts: profilePostsList,
    likedPosts,
    loading,
    error,
    isUpdating,
    isOwnProfile,
    isFollowing,
    isFollowLoading,
    toggleFollow,
    updateProfile,
    refetch,
    clearError,
  } = useProfile(profileIdentifier);

  const { createPost } = usePosts();

  const [activeTab, setActiveTab] = useState('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    pronouns: '',
    avatar: '',
  });

  const openEditModal = () => {
    if (!profile) return;
    setEditForm({
      name: profile.name || '',
      bio: profile.bio || '',
      location: profile.location || '',
      website: profile.website || '',
      pronouns: profile.pronouns || '',
      avatar: profile.avatar || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(editForm);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('[ProfilePage] Failed to save profile:', err);
    }
  };

  const handleToggleFollow = async () => {
    try {
      const res = await toggleFollow();
      if (res?.requiresAuth) {
        navigate('/login', { state: { from: location } });
      }
    } catch (err) {
      console.error('[ProfilePage] Toggle follow error:', err);
    }
  };

  const tabs = [
    { id: 'posts', label: 'Posts' },
    { id: 'replies', label: 'Replies' },
    { id: 'highlights', label: 'Highlights' },
    { id: 'media', label: 'Media' },
    { id: 'likes', label: 'Likes' },
  ];

  const handleNewPost = async (postData) => {
    try {
      await createPost(postData);
      refetch();
    } catch (err) {
      console.error('[ProfilePage] New post error:', err);
    }
  };

  const displayedPosts =
    activeTab === 'posts'
      ? profilePostsList
      : activeTab === 'likes'
      ? likedPosts
      : [];

  return (
    <Layout mobileTitle="Profile" onNewPost={handleNewPost}>
      <div className="flex flex-col w-full">
        {/* Sticky Profile Top Bar */}
        <header className="sticky top-0 z-20 flex items-center gap-space-lg px-space-md py-space-xs bg-surface/85 backdrop-blur-xl bg-blend-normal">
          <button
            aria-label="Go back"
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-surface-container transition-colors text-on-surface cursor-pointer"
            onClick={() => navigate('/feed')}
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-space-xs">
              <h1 className="font-headline-md text-headline-md text-on-surface truncate font-bold">
                {profile?.name || (loading ? 'Loading...' : 'Profile')}
              </h1>
              {profile?.isVerified && (
                <span
                  className="material-symbols-outlined text-primary-container text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
              )}
            </div>
            <span className="font-body-sm text-body-sm text-outline">
              {profile?.postsCount || 0} posts
            </span>
          </div>
        </header>

        {/* Global Error Banner */}
        {error && error !== "This account doesn't exist" && (
          <div className="mx-space-lg my-space-sm p-3.5 rounded-2xl bg-error-container/30 border border-error/40 flex items-center justify-between text-body-sm text-error">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refetch}
                className="underline hover:opacity-80 font-semibold cursor-pointer"
              >
                Retry
              </button>
              <button
                onClick={clearError}
                className="hover:opacity-80 p-1 cursor-pointer"
                title="Dismiss"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="animate-pulse">
            <div className="w-full h-48 sm:h-52 bg-surface-container-high"></div>
            <div className="px-space-lg pb-space-md">
              <div className="relative -mt-16 sm:-mt-20">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-surface-container-high border-4 border-surface"></div>
              </div>
              <div className="mt-space-md h-6 w-48 bg-surface-container-high rounded"></div>
              <div className="mt-2 h-4 w-28 bg-surface-container-high rounded"></div>
              <div className="mt-4 h-12 w-full bg-surface-container-high rounded-xl"></div>
            </div>
          </div>
        ) : !profile ? (
          /* Account Not Found State */
          <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-surface">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-outline mb-4">
              <span className="material-symbols-outlined text-[32px]">person_off</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-2">
              This account doesn’t exist
            </h2>
            <p className="font-body-md text-body-md text-outline max-w-sm mb-6">
              Try searching for another. The user you are looking for might have been deleted or the handle may be incorrect.
            </p>
            <button
              onClick={() => navigate('/feed')}
              className="px-6 py-2.5 rounded-full bg-on-surface text-surface font-label-md text-label-md font-bold hover:bg-inverse-surface transition-colors cursor-pointer"
            >
              Go to Feed
            </button>
          </div>
        ) : (
          <>
            {/* Cover Header */}
            <div className="relative w-full h-48 sm:h-52 bg-surface-container-high overflow-hidden">
              <img
                alt="Cover banner abstract visual mesh"
                className="w-full h-full object-cover"
                src={profile.coverImage}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface/40"></div>
            </div>

            {/* Avatar & Action Bar Section */}
            <div className="px-space-lg pb-space-md bg-surface">
              <div className="flex justify-between items-start">
                {/* Profile Avatar Overlap */}
                <div className="relative -mt-16 sm:-mt-20">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-surface p-1 shadow-xl">
                    <img
                      alt={profile.name}
                      className="w-full h-full rounded-full object-cover"
                      src={profile.avatar}
                      onError={(e) => {
                        e.currentTarget.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.handle || 'user'}`;
                      }}
                    />
                  </div>
                </div>

                {/* Action Tools */}
                <div className="pt-space-md flex items-center gap-space-sm">
                  <button
                    aria-label="More profile options"
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                  </button>
                  <button
                    aria-label="Notifications"
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      notifications_none
                    </span>
                  </button>
                  {isOwnProfile ? (
                    <button
                      onClick={openEditModal}
                      className="px-space-lg py-space-xs rounded-full bg-on-surface hover:bg-inverse-surface text-surface font-label-md text-label-md transition-all font-bold cursor-pointer"
                    >
                      Edit profile
                    </button>
                  ) : (
                    <button
                      onClick={handleToggleFollow}
                      disabled={isFollowLoading}
                      className={`px-space-lg py-space-xs rounded-full font-label-md text-label-md transition-all font-bold cursor-pointer flex items-center justify-center gap-1.5 min-w-[100px] ${
                        isFollowing
                          ? "bg-transparent border border-outline text-on-surface hover:bg-error-container/20 hover:text-error hover:border-error"
                          : "bg-on-surface hover:bg-inverse-surface text-surface"
                      }`}
                    >
                      {isFollowLoading ? (
                        <span className="material-symbols-outlined animate-spin text-[16px]">
                          progress_activity
                        </span>
                      ) : isFollowing ? (
                        "Following"
                      ) : (
                        "Follow"
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Identity & Bio */}
              <div className="mt-space-sm flex flex-col gap-space-xs">
                <div className="flex items-center gap-space-xs">
                  <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                    {profile.name}
                  </h2>
                  {profile.isVerified && (
                    <span
                      className="material-symbols-outlined text-primary-container text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified
                    </span>
                  )}
                  {profile.pronouns && (
                    <span className="px-space-xs py-0.5 rounded-md bg-surface-container-high font-label-sm text-label-sm text-outline">
                      {profile.pronouns}
                    </span>
                  )}
                </div>
                <span className="font-body-md text-body-md text-outline">
                  @{profile.handle}
                </span>
              </div>

              {profile.bio && (
                <p className="mt-space-md font-body-md text-body-md text-on-surface leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* Metadata Details */}
              <div className="mt-space-md flex flex-wrap gap-x-space-lg gap-y-space-xs text-outline font-body-sm text-body-sm">
                {profile.location && (
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-[17px]">location_on</span>
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-[17px]">link</span>
                    <a
                      className="text-primary hover:underline"
                      href={profile.websiteUrl || (profile.website.startsWith('http') ? profile.website : `https://${profile.website}`)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {profile.joined && (
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-[17px]">calendar_month</span>
                    <span>{profile.joined}</span>
                  </div>
                )}
              </div>

              {/* Follow Metrics */}
              <div className="mt-space-md flex items-center gap-space-lg font-body-sm text-body-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-md text-label-md text-on-surface font-bold">
                    {profile.followingCount}
                  </span>
                  <span className="text-outline">Following</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-md text-label-md text-on-surface font-bold">
                    {profile.followersCount}
                  </span>
                  <span className="text-outline">Followers</span>
                </div>
              </div>

              {/* Optional Mutual Network Context (rendered only if mutual info is available) */}
              {profile.mutuals && profile.mutuals.length > 0 && (
                <div className="mt-space-md flex items-center gap-space-sm pt-space-xs">
                  <div className="flex -space-x-2 shrink-0">
                    <div className="w-5 h-5 rounded-full ring-2 ring-surface bg-surface-container-highest flex items-center justify-center text-[9px] font-bold text-secondary">
                      U1
                    </div>
                    <div className="w-5 h-5 rounded-full ring-2 ring-surface bg-surface-container-high flex items-center justify-center text-[9px] font-bold text-tertiary">
                      U2
                    </div>
                  </div>
                  <p className="font-label-sm text-label-sm text-outline truncate">
                    Followed by people you know
                  </p>
                </div>
              )}
            </div>

            {/* Profile Content Tabs */}
            <nav className="flex w-full bg-surface/90 backdrop-blur-md sticky top-14 z-10 border-b border-surface-container-high/40">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    className={`flex-1 flex flex-col items-center justify-center pt-space-md px-space-sm hover:bg-surface-container-high/20 transition-colors cursor-pointer group ${
                      isActive ? 'text-on-surface font-bold' : 'text-outline'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <div className="flex items-center pb-space-sm relative">
                      <span
                        className={`font-label-lg text-label-lg ${
                          !isActive ? 'group-hover:text-on-surface transition-colors' : ''
                        }`}
                      >
                        {tab.label}
                      </span>
                      {isActive && (
                        <div className="tab-indicator absolute bottom-0 inset-x-0 h-1 bg-primary-container rounded-full" />
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Feed Section */}
            <div className="flex flex-col w-full bg-surface">
              {displayedPosts.length > 0 ? (
                displayedPosts.map((post) => <PostCard key={post.id} post={post} />)
              ) : (
                <div className="p-12 text-center text-outline font-body-md">
                  No {activeTab} yet.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-space-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-[540px] bg-surface-container-low rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-outline-variant/40">
            {/* Header */}
            <div className="flex items-center justify-between px-space-lg py-space-md border-b border-surface-container-high/50">
              <div className="flex items-center gap-space-md">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  Edit Profile
                </h3>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={isUpdating}
                className="px-space-lg py-1.5 rounded-full bg-on-surface text-surface font-label-md text-label-md font-bold hover:bg-inverse-surface transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                type="button"
              >
                {isUpdating && (
                  <span className="material-symbols-outlined animate-spin text-[16px]">
                    progress_activity
                  </span>
                )}
                Save
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveProfile} className="p-space-lg flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-outline">Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-container rounded-xl text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
                  placeholder="Your Name"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-outline">Bio</label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-container rounded-xl text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container resize-none"
                  placeholder="Tell the world about yourself..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-outline">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-4 py-2.5 bg-surface-container rounded-xl text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
                    placeholder="San Francisco, CA"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-outline">Pronouns</label>
                  <input
                    type="text"
                    value={editForm.pronouns}
                    onChange={(e) => setEditForm({ ...editForm, pronouns: e.target.value })}
                    className="w-full px-4 py-2.5 bg-surface-container rounded-xl text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
                    placeholder="he/him"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-outline">Website</label>
                <input
                  type="text"
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-container rounded-xl text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-outline">Avatar Image URL</label>
                <input
                  type="url"
                  value={editForm.avatar}
                  onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                  className="w-full px-4 py-2.5 bg-surface-container rounded-xl text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
                  placeholder="https://..."
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
