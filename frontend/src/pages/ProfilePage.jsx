import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';
import { currentUser, profilePosts } from '../data/mockData';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState(profilePosts);

  const tabs = [
    { id: 'posts', label: 'Posts' },
    { id: 'replies', label: 'Replies' },
    { id: 'highlights', label: 'Highlights' },
    { id: 'media', label: 'Media' },
    { id: 'likes', label: 'Likes' }
  ];

  const handleNewPost = (postData) => {
    const isObject = typeof postData === 'object';
    const content = isObject ? postData.content : postData;

    const newPost = {
      id: `profile-${Date.now()}`,
      author: currentUser,
      time: "Just now",
      isPinned: false,
      content: content,
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
                {currentUser.name}
              </h1>
              <span
                className="material-symbols-outlined text-primary-container text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-outline">
              {currentUser.postsCount} posts
            </span>
          </div>
        </header>

        {/* Cover Header */}
        <div className="relative w-full h-48 sm:h-52 bg-surface-container-high overflow-hidden">
          <img
            alt="Cover banner abstract visual mesh"
            className="w-full h-full object-cover"
            src={currentUser.coverImage}
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
                  alt={currentUser.name}
                  className="w-full h-full rounded-full object-cover"
                  src={currentUser.avatar}
                />
              </div>
            </div>

            {/* Action Tools */}
            <div className="pt-space-md flex items-center gap-space-sm">
              <button
                aria-label="More profile options"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">more_horiz</span>
              </button>
              <button
                aria-label="Notifications"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">notifications_none</span>
              </button>
              <button className="px-space-lg py-space-xs rounded-full bg-on-surface hover:bg-inverse-surface text-surface font-label-md text-label-md transition-all font-bold">
                Edit profile
              </button>
            </div>
          </div>

          {/* Identity & Bio */}
          <div className="mt-space-sm flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-xs">
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                {currentUser.name}
              </h2>
              <span
                className="material-symbols-outlined text-primary-container text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              <span className="px-space-xs py-0.5 rounded-md bg-surface-container-high font-label-sm text-label-sm text-outline">
                {currentUser.pronouns}
              </span>
            </div>
            <span className="font-body-md text-body-md text-outline">
              @{currentUser.handle}
            </span>
          </div>

          <p className="mt-space-md font-body-md text-body-md text-on-surface leading-relaxed">
            Building the next gen of developer tools & UI systems{' '}
            <span className="text-primary hover:underline cursor-pointer">@acmelabs</span> 🚀 |
            Exploring AI workflows, WebGL & modern frontend architecture. Obsessed with craft &
            typography. ⚡️
          </p>

          {/* Metadata Details */}
          <div className="mt-space-md flex flex-wrap gap-x-space-lg gap-y-space-xs text-outline font-body-sm text-body-sm">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[17px]">location_on</span>
              <span>{currentUser.location}</span>
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[17px]">link</span>
              <a
                className="text-primary hover:underline"
                href={currentUser.websiteUrl}
                target="_blank"
                rel="noreferrer"
              >
                {currentUser.website}
              </a>
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[17px]">calendar_month</span>
              <span>{currentUser.joined}</span>
            </div>
          </div>

          {/* Follow Metrics */}
          <div className="mt-space-md flex items-center gap-space-lg font-body-sm text-body-sm">
            <a className="hover:underline flex items-center gap-space-xs" href="#">
              <span className="font-label-md text-label-md text-on-surface font-bold">
                {currentUser.followingCount}
              </span>
              <span className="text-outline">Following</span>
            </a>
            <a className="hover:underline flex items-center gap-space-xs" href="#">
              <span className="font-label-md text-label-md text-on-surface font-bold">
                {currentUser.followersCount}
              </span>
              <span className="text-outline">Followers</span>
            </a>
          </div>

          {/* Mutual Network Context */}
          <div className="mt-space-md flex items-center gap-space-sm pt-space-xs">
            <div className="flex -space-x-2 shrink-0">
              <div className="w-5 h-5 rounded-full ring-2 ring-surface bg-surface-container-highest flex items-center justify-center text-[9px] font-bold text-secondary">
                SJ
              </div>
              <div className="w-5 h-5 rounded-full ring-2 ring-surface bg-surface-container-high flex items-center justify-center text-[9px] font-bold text-tertiary">
                ER
              </div>
              <div className="w-5 h-5 rounded-full ring-2 ring-surface bg-primary-container flex items-center justify-center text-[9px] font-bold text-on-primary-container">
                +42
              </div>
            </div>
            <p className="font-label-sm text-label-sm text-outline truncate">
              Followed by{' '}
              <span className="text-on-surface hover:underline cursor-pointer">Sarah Jenkins</span>,{' '}
              <span className="text-on-surface hover:underline cursor-pointer">Elena Rostova</span>,{' '}
              and 42 others you follow
            </p>
          </div>
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
                  <span className={`font-label-lg text-label-lg ${!isActive ? 'group-hover:text-on-surface transition-colors' : ''}`}>
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
          {activeTab === 'posts' ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="p-12 text-center text-outline font-body-md">
              No {activeTab} yet.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
