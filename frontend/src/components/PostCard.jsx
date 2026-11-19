import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function PostCard({ post }) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.stats?.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.stats?.likes || 0);
  const [isRetweeted, setIsRetweeted] = useState(post.stats?.isRetweeted || false);
  const [retweetCount, setRetweetCount] = useState(post.stats?.retweets || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.stats?.isBookmarked || false);

  const toggleLike = async (e) => {
    e.stopPropagation();

    const previousLiked = isLiked;
    const previousCount = likeCount;

    // Optimistic Update
    setIsLiked(!previousLiked);
    setLikeCount((prev) => (previousLiked ? Math.max(prev - 1, 0) : prev + 1));

    if (!isSupabaseConfigured || !user?.id || !post.id || String(post.id).startsWith('feed-')) {
      return;
    }

    try {
      if (previousLiked) {
        // Delete like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id);

        if (error) throw error;
      } else {
        // Insert like
        const { error } = await supabase
          .from('likes')
          .insert([{ user_id: user.id, post_id: post.id }]);

        if (error) throw error;
      }
    } catch (err) {
      console.error('[PostCard] Failed to toggle like in Supabase:', err);
      // Rollback on error
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
    }
  };

  const toggleRetweet = (e) => {
    e.stopPropagation();
    if (isRetweeted) {
      setIsRetweeted(false);
      setRetweetCount((prev) => Math.max(prev - 1, 0));
    } else {
      setIsRetweeted(true);
      setRetweetCount((prev) => prev + 1);
    }
  };

  const toggleBookmark = (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const formatCount = (count, fallbackFormatted) => {
    if (fallbackFormatted && count === post.stats?.likes) return fallbackFormatted;
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return count;
  };

  return (
    <article className="p-space-lg hover:bg-surface-container-low/60 transition-colors cursor-pointer group bg-surface border-b border-outline-variant/20">
      {/* Pinned Post Header */}
      {post.isPinned && (
        <div className="flex items-center gap-space-md text-outline font-label-sm text-label-sm ml-8 mb-space-xs">
          <span
            className="material-symbols-outlined text-[15px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            keep
          </span>
          <span>Pinned Post</span>
        </div>
      )}

      <div className="flex gap-space-md">
        {/* Author Avatar or Initials */}
        {post.author.avatar ? (
          <img
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover shrink-0 shadow-sm"
            src={post.author.avatar}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary-container font-headline-md text-headline-md font-extrabold shrink-0 shadow-sm">
            {post.author.initials || "U"}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Metadata / Author */}
          <div className="flex items-center justify-between mb-space-xs">
            <div className="flex items-center gap-space-xs truncate">
              <span className="font-headline-md text-headline-md text-on-surface group-hover:underline">
                {post.author.name}
              </span>
              {post.author.verified && (
                <span
                  className="material-symbols-outlined text-primary-container text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
              )}
              <span className="font-body-sm text-body-sm text-outline">
                @{post.author.handle}
              </span>
              <span className="text-outline">·</span>
              <span className="font-body-sm text-body-sm text-outline hover:underline">
                {post.time}
              </span>
            </div>
            <button
              aria-label="Tweet menu"
              className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="material-symbols-outlined text-[18px]">more_horiz</span>
            </button>
          </div>

          {/* Post Content */}
          <p className="font-body-md text-body-md text-on-surface leading-relaxed mb-space-md">
            {post.content}
            {post.hashtags && (
              <span className="text-primary hover:underline cursor-pointer block mt-space-xs">
                {post.hashtags}
              </span>
            )}
          </p>

          {/* Embed: Code Snippet */}
          {post.embedType === 'code' && post.codeData && (
            <div className="rounded-2xl bg-surface-container-lowest p-space-md mb-space-md overflow-hidden shadow-inner">
              <div className="flex items-center justify-between pb-space-sm text-outline font-label-sm text-label-sm">
                <span className="flex items-center gap-space-xs">
                  <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
                  {post.codeData.fileName}
                </span>
                <span>{post.codeData.meta}</span>
              </div>
              {post.codeData.codeTokens ? (
                <div className="font-mono text-body-sm space-y-1 text-on-surface-variant overflow-x-auto py-space-xs">
                  <p>
                    <span className="text-tertiary">export const</span>{' '}
                    <span className="text-secondary">createSurfaceTheme</span> = () =&gt; ({'{'}
                  </p>
                  <p className="pl-4 text-on-surface">
                    <span className="text-outline">ground:</span>{' '}
                    <span className="text-primary">'#000000'</span>,
                  </p>
                  <p className="pl-4 text-on-surface">
                    <span className="text-outline">contrast:</span>{' '}
                    <span className="text-primary">'calc(100% - var(--subtle))'</span>,
                  </p>
                  <p className="pl-4 text-on-surface">
                    <span className="text-outline">transitions:</span>{' '}
                    <span className="text-tertiary">['smooth-decelerate', 'instant-tap']</span>
                  </p>
                  <p>{'})'};</p>
                </div>
              ) : (
                <pre className="font-mono text-body-sm text-secondary-fixed-dim overflow-x-auto leading-5 py-space-xs">
                  <code>{post.codeData.code}</code>
                </pre>
              )}
            </div>
          )}

          {/* Embed: Metrics Grid */}
          {post.embedType === 'metrics' && post.metricsData && (
            <div className="grid grid-cols-2 gap-space-sm p-space-md rounded-2xl bg-surface-container-low mb-space-md">
              {post.metricsData.map((metric, idx) => (
                <div key={idx} className="flex flex-col gap-space-xs">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                    {metric.label}
                  </span>
                  <div className="flex items-baseline gap-space-xs">
                    <span className={`font-headline-lg text-headline-lg ${metric.valueColor} font-extrabold`}>
                      {metric.value}
                    </span>
                    <span className={`font-label-sm text-label-sm ${metric.changeColor}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Embed: Visual Mockup Image */}
          {post.embedType === 'image' && post.imageData && (
            <div className="rounded-2xl overflow-hidden bg-surface-container-lowest mb-space-md shadow-md group/img relative">
              <img
                alt={post.imageData.alt}
                className="w-full h-64 sm:h-72 object-cover object-center group-hover/img:scale-[1.01] transition-transform duration-300"
                src={post.imageData.src}
              />
              <div className="absolute bottom-3 left-3 bg-surface-container-lowest/80 backdrop-blur-md px-space-md py-space-xs rounded-full flex items-center gap-space-xs text-on-surface font-label-sm text-label-sm">
                {post.imageData.badgeIcon === 'pulse' ? (
                  <span className="w-2 h-2 rounded-full bg-[#00ba7c] animate-pulse"></span>
                ) : (
                  <span className="material-symbols-outlined text-primary text-[15px]">
                    {post.imageData.badgeIcon}
                  </span>
                )}
                <span>{post.imageData.badgeText}</span>
              </div>
            </div>
          )}

          {/* Embed: Rich Link Card */}
          {post.embedType === 'link' && post.linkData && (
            <div className="rounded-2xl overflow-hidden bg-surface-container-low hover:bg-surface-container transition-colors mb-space-md">
              <img
                alt={post.linkData.title}
                className="w-full h-44 object-cover"
                src={post.linkData.image}
              />
              <div className="p-space-md flex flex-col gap-space-xs">
                <span className="font-label-sm text-label-sm text-outline flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[14px]">link</span>
                  {post.linkData.url}
                </span>
                <h4 className="font-headline-md text-headline-md text-on-surface font-bold">
                  {post.linkData.title}
                </h4>
                <p className="font-body-sm text-body-sm text-outline line-clamp-2">
                  {post.linkData.description}
                </p>
              </div>
            </div>
          )}

          {/* Embed: SVG Benchmark Chart */}
          {post.embedType === 'chart' && post.chartData && (
            <div className="mt-space-md p-space-md rounded-2xl bg-surface-container-low flex flex-col gap-space-sm mb-space-md">
              <div className="flex justify-between items-center text-on-surface">
                <span className="font-label-md text-label-md">{post.chartData.title}</span>
                <span className="font-label-sm text-label-sm text-[#00ba7c] font-bold">
                  {post.chartData.badge}
                </span>
              </div>
              <div className="h-20 w-full flex items-end">
                <svg
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                  viewBox="0 0 300 60"
                >
                  <path
                    className="text-primary-container"
                    d="M 0,50 L 30,48 L 60,52 L 90,44 L 120,47 L 150,30 L 180,18 L 210,12 L 240,10 L 270,8 L 300,6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  />
                  <path
                    className="text-primary-container/10"
                    d="M 0,50 L 30,48 L 60,52 L 90,44 L 120,47 L 150,30 L 180,18 L 210,12 L 240,10 L 270,8 L 300,6 L 300,60 L 0,60 Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className="flex justify-between text-outline font-label-sm text-label-sm">
                <span>{post.chartData.baseline}</span>
                <span>{post.chartData.optimized}</span>
              </div>
            </div>
          )}

          {/* Interaction Action Bar */}
          <div className="flex items-center justify-between text-outline max-w-[420px] pt-space-xs select-none">
            {/* Reply */}
            <button className="flex items-center gap-space-xs group/action hover:text-primary transition-colors">
              <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover/action:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
              </div>
              <span className="font-label-sm text-label-sm">{post.stats?.replies || 0}</span>
            </button>

            {/* Repost */}
            <button
              onClick={toggleRetweet}
              className={`flex items-center gap-space-xs group/action transition-colors ${
                isRetweeted ? "text-[#00ba7c]" : "hover:text-secondary-fixed"
              }`}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover/action:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-[19px]">repeat</span>
              </div>
              <span className="font-label-sm text-label-sm">{retweetCount}</span>
            </button>

            {/* Like */}
            <button
              onClick={toggleLike}
              className={`flex items-center gap-space-xs group/action transition-colors ${
                isLiked
                  ? "text-[#f91880]"
                  : "hover:text-tertiary"
              }`}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover/action:bg-surface-container-high transition-colors">
                <span
                  className="material-symbols-outlined text-[18px] transition-transform active:scale-125"
                  style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {isLiked ? 'favorite' : 'favorite'}
                </span>
              </div>
              <span className={`font-label-sm text-label-sm ${isLiked ? 'font-bold' : ''}`}>
                {formatCount(likeCount, post.stats?.likesFormatted)}
              </span>
            </button>

            {/* Views */}
            <button className="flex items-center gap-space-xs group/action hover:text-primary transition-colors">
              <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover/action:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-[18px]">bar_chart</span>
              </div>
              <span className="font-label-sm text-label-sm">{post.stats?.views || "0"}</span>
            </button>

            {/* Bookmark & Share */}
            <div className="flex items-center gap-space-xs">
              <button
                onClick={toggleBookmark}
                className={`w-8 h-8 rounded-full flex items-center justify-center hover:text-primary hover:bg-surface-container-high transition-colors ${
                  isBookmarked ? "text-primary" : ""
                }`}
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}
                >
                  bookmark
                </span>
              </button>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center hover:text-primary hover:bg-surface-container-high transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="material-symbols-outlined text-[18px]">ios_share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
