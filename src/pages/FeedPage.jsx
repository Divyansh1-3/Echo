import React, { useState } from 'react';
import Layout from '../components/Layout';
import TweetComposer from '../components/TweetComposer';
import PostCard from '../components/PostCard';
import usePosts from '../hooks/usePosts';

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState('foryou'); // 'foryou' | 'following'
  const { posts, loading, error, createPost, clearError } = usePosts();

  const handleCreatePost = async (postData) => {
    try {
      await createPost(postData);
    } catch (err) {
      console.error('[FeedPage] Failed to publish post:', err);
    }
  };

  const displayedPosts =
    activeTab === 'following'
      ? posts.filter((_, idx) => idx % 2 === 0)
      : posts;

  return (
    <Layout mobileTitle="X Feed" onNewPost={handleCreatePost}>
      <div className="flex flex-col w-full">
        {/* Sticky Feed Header */}
        <header className="sticky top-0 z-30 bg-surface/85 backdrop-blur-xl">
          <div className="flex items-center justify-between px-space-lg pt-space-md pb-space-xs">
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
              Home
            </h1>
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
              title="Feed settings"
            >
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </button>
          </div>

          {/* Feed Tabs (For you / Following) */}
          <div className="flex h-[53px] bg-surface-container-lowest/40">
            <button
              className={`relative flex-1 flex items-center justify-center font-label-lg text-label-lg transition-colors cursor-pointer ${
                activeTab === 'foryou'
                  ? 'text-on-surface font-bold'
                  : 'text-outline hover:text-on-surface hover:bg-surface-container/40'
              }`}
              onClick={() => setActiveTab('foryou')}
            >
              <span>For you</span>
              {activeTab === 'foryou' && (
                <div className="absolute bottom-0 w-14 h-1 bg-primary-container rounded-full" />
              )}
            </button>

            <button
              className={`relative flex-1 flex items-center justify-center font-label-lg text-label-lg transition-colors cursor-pointer ${
                activeTab === 'following'
                  ? 'text-on-surface font-bold'
                  : 'text-outline hover:text-on-surface hover:bg-surface-container/40'
              }`}
              onClick={() => setActiveTab('following')}
            >
              <span>Following</span>
              {activeTab === 'following' && (
                <div className="absolute bottom-0 w-16 h-1 bg-primary-container rounded-full" />
              )}
            </button>
          </div>
        </header>

        {/* Global Feed Error Banner */}
        {error && (
          <div className="mx-space-lg my-space-sm p-3.5 rounded-2xl bg-error-container/30 border border-error/40 flex items-center justify-between text-body-sm text-error">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-error hover:opacity-80 p-1 cursor-pointer"
              title="Dismiss error"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* In-feed Tweet Composer */}
        <TweetComposer onPublish={handleCreatePost} />

        {/* Feed Posts Stream */}
        <div className="flex flex-col" id="posts-stream">
          {loading ? (
            <div className="flex flex-col animate-pulse divide-y divide-outline-variant/20">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-space-lg flex gap-space-md">
                  <div className="w-10 h-10 rounded-full bg-surface-container-high shrink-0"></div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-4 w-32 bg-surface-container-high rounded"></div>
                    <div className="h-16 w-full bg-surface-container-high rounded-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayedPosts.length > 0 ? (
            displayedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-space-lg text-center bg-surface">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-outline mb-4">
                <span className="material-symbols-outlined text-[32px]">dynamic_feed</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-2">
                Welcome to your feed!
              </h2>
              <p className="font-body-md text-body-md text-outline max-w-sm mb-6">
                When people share posts on X Connect, they'll show up right here. Share an update above to get started!
              </p>
            </div>
          )}
        </div>

        {/* End of Feed Footer (only when posts exist) */}
        {!loading && displayedPosts.length > 0 && (
          <div className="py-space-xl flex flex-col items-center justify-center text-outline gap-space-xs bg-surface-container-lowest/20">
            <span className="font-label-sm text-label-sm tracking-wider uppercase text-outline">
              You're all caught up!
            </span>
          </div>
        )}
      </div>
    </Layout>
  );
}
