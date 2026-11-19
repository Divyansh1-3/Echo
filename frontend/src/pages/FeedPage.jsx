import React, { useState } from 'react';
import Layout from '../components/Layout';
import TweetComposer from '../components/TweetComposer';
import PostCard from '../components/PostCard';
import { initialFeedPosts, currentUser } from '../data/mockData';

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState('foryou'); // 'foryou' | 'following'
  const [posts, setPosts] = useState(initialFeedPosts);

  const handleCreatePost = (postData) => {
    const isObject = typeof postData === 'object';
    const content = isObject ? postData.content : postData;
    const hasAttachment = isObject ? postData.hasAttachment : false;

    const newPost = {
      id: `post-${Date.now()}`,
      author: {
        name: currentUser.name,
        handle: currentUser.handle,
        avatar: currentUser.avatar,
        verified: true
      },
      time: "Just now",
      content: content,
      embedType: hasAttachment ? "link" : undefined,
      linkData: hasAttachment
        ? {
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuBQpDIJW54LFhEFswM3hRua89OnvC_ffUTVqzFvrWKxIuAu7c47NbPhRgNALpOj0jAd0BetdqCgjzdmxh0Wk-DsuIXCI0OAfBNkfUkTR_ILGPAj9ZpAdcANppOAuLxVsG7DSiQ8BIQf9sMdjxneA-x3e4NROil7CQoVeuBQwxJzDT0lX_Br3Qu74X7Z5Bfi0-pm5TTVajhOGkIB_7ypyLK3QbccY-TFajHwZQBIVz0",
            url: "github.com/acmelabs/topology-engine",
            title: "topology-engine: Ultra-low latency layout solver",
            description:
              "A SIMD-accelerated physical force simulation engine tuned for browser runtimes and micro-interactions."
          }
        : undefined,
      stats: {
        replies: 0,
        retweets: 0,
        likes: 0,
        likesFormatted: "0",
        views: "1",
        isLiked: false,
        isRetweeted: false,
        isBookmarked: false
      }
    };

    setPosts([newPost, ...posts]);
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
              className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
              title="Feed settings"
            >
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </button>
          </div>

          {/* Feed Tabs (For you / Following) */}
          <div className="flex h-[53px] bg-surface-container-lowest/40">
            <button
              className={`relative flex-1 flex items-center justify-center font-label-lg text-label-lg transition-colors ${
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
              className={`relative flex-1 flex items-center justify-center font-label-lg text-label-lg transition-colors ${
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

        {/* In-feed Tweet Composer */}
        <TweetComposer onPublish={handleCreatePost} />

        {/* Feed Posts Stream */}
        <div className="flex flex-col" id="posts-stream">
          {displayedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* End of Feed Sentry */}
        <div className="py-space-xl flex flex-col items-center justify-center text-outline gap-space-xs bg-surface-container-lowest/20">
          <div className="w-6 h-6 rounded-full border-2 border-primary-container border-t-transparent animate-spin"></div>
          <span className="font-label-sm text-label-sm tracking-wider uppercase">
            Loading more updates
          </span>
        </div>
      </div>
    </Layout>
  );
}
