import React, { useState, useRef, useEffect } from 'react';
import { currentUser } from '../data/mockData';

export default function TweetModal({ isOpen, onClose, onPost }) {
  const [content, setContent] = useState(
    "Just dropped a preview of our new real-time graph rendering engine for @acmelabs 🚀 Decoupled layout calculations mean zero dropped frames at 120Hz on complex topologies."
  );
  const [showAttachment, setShowAttachment] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);

  const maxChars = 280;
  const charsRemaining = maxChars - content.length;
  const progressRatio = Math.min(Math.max(content.length / maxChars, 0), 1);
  const circumference = 2 * Math.PI * 14; // r=14 -> ~87.96
  const strokeDashoffset = circumference * (1 - progressRatio);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isOpen, content]);

  if (!isOpen) return null;

  const handleInput = (e) => {
    setContent(e.target.value);
  };

  const handleSubmit = () => {
    if (!content.trim() && !showAttachment) return;
    setIsSubmitting(true);
    setTimeout(() => {
      if (onPost) {
        onPost({
          content,
          hasAttachment: showAttachment
        });
      }
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center p-0 sm:pt-12 sm:px-space-md overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Card Window */}
      <div className="relative w-full max-w-[620px] bg-surface-container-low rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto sm:my-0 transition-all duration-300">
        {/* Top Subtle Highlight Gradient Ring Line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary-container/40 to-transparent"></div>

        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-space-md py-space-sm bg-surface-container-low/95">
          <button
            aria-label="Close dialog"
            className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-highest transition-colors"
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
          <div className="flex items-center gap-space-sm">
            <button
              className="px-space-md py-1 rounded-full text-primary-container font-label-md text-label-md hover:bg-primary-container/10 transition-colors"
              type="button"
            >
              Drafts
            </button>
          </div>
        </div>

        {/* Composer Body Content */}
        <div className="flex px-space-lg pt-space-xs pb-space-sm gap-space-md">
          {/* User Avatar with Status indicator */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative w-11 h-11 rounded-full overflow-hidden bg-surface-container-high">
              <img
                alt={currentUser.name}
                className="w-full h-full object-cover"
                src={currentUser.avatar}
              />
            </div>
            {/* Thread connection track indicator */}
            <div className="w-0.5 grow bg-surface-container-highest my-space-xs rounded-full opacity-40"></div>
          </div>

          {/* Composer Form Controls */}
          <div className="flex flex-col flex-1 min-w-0">
            {/* Audience Selector Pill */}
            <div className="flex items-center mb-space-sm">
              <button
                className="group flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-primary-container font-label-md text-label-md transition-all"
                type="button"
              >
                <span>Everyone</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-y-0.5 transition-transform">
                  expand_more
                </span>
              </button>
            </div>

            {/* Post Content Textarea */}
            <div className="relative w-full">
              <textarea
                ref={textareaRef}
                className="w-full bg-transparent text-on-surface font-body-lg text-body-lg placeholder:text-outline focus:outline-none resize-none leading-relaxed tracking-tight"
                placeholder="What is happening?!"
                rows={3}
                value={content}
                onChange={handleInput}
              />
            </div>

            {/* Attached Rich Media Preview Card */}
            {showAttachment && (
              <div className="relative mt-space-sm rounded-2xl bg-surface-container overflow-hidden group shadow-lg">
                {/* Remove Attachment Floating Button */}
                <button
                  aria-label="Remove attachment"
                  className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-black/75 hover:bg-black text-on-surface flex items-center justify-center backdrop-blur-md transition-transform active:scale-95 cursor-pointer"
                  onClick={() => setShowAttachment(false)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>

                {/* Attachment Graphic Visual */}
                <div className="w-full h-44 bg-surface-container-lowest relative overflow-hidden flex flex-col justify-end p-space-md">
                  <img
                    alt="Realtime node graph preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500 ease-out"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQpDIJW54LFhEFswM3hRua89OnvC_ffUTVqzFvrWKxIuAu7c47NbPhRgNALpOj0jAd0BetdqCgjzdmxh0Wk-DsuIXCI0OAfBNkfUkTR_ILGPAj9ZpAdcANppOAuLxVsG7DSiQ8BIQf9sMdjxneA-x3e4NROil7CQoVeuBQwxJzDT0lX_Br3Qu74X7Z5Bfi0-pm5TTVajhOGkIB_7ypyLK3QbccY-TFajHwZQBIVz0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/30 to-transparent"></div>
                  <div className="relative z-10 flex items-center gap-space-xs">
                    <span className="px-space-xs py-0.5 rounded bg-primary-container/20 text-primary-container font-label-sm text-label-sm uppercase tracking-wider font-bold backdrop-blur-md">
                      WebGL 2.0
                    </span>
                    <span className="px-space-xs py-0.5 rounded bg-surface-container-high/80 text-on-surface-variant font-label-sm text-label-sm backdrop-blur-md">
                      v1.4.0-preview
                    </span>
                  </div>
                </div>

                {/* Card Metadata Footer */}
                <div className="p-space-md bg-surface-container flex flex-col gap-0.5">
                  <span className="font-label-sm text-label-sm text-outline truncate flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">link</span>
                    github.com/acmelabs/topology-engine
                  </span>
                  <span className="font-headline-md text-headline-md text-on-surface truncate">
                    topology-engine: Ultra-low latency layout solver
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">
                    A SIMD-accelerated physical force simulation engine tuned for browser runtimes and micro-interactions.
                  </p>
                </div>
              </div>
            )}

            {/* Audience Reply Permission Badge */}
            <div className="mt-space-md flex items-center">
              <button
                className="inline-flex items-center gap-space-xs py-1 px-space-sm rounded-full text-primary-container hover:bg-primary-container/10 font-label-md text-label-md transition-colors -ml-space-sm"
                type="button"
              >
                <span className="material-symbols-outlined text-[17px]">public</span>
                <span>Everyone can reply</span>
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Toolbar & Actions Bar */}
        <div className="px-space-lg py-space-sm bg-surface-container-low flex items-center justify-between border-t border-surface-container-high/40">
          {/* Media Insertion Action Icons */}
          <div className="flex items-center gap-0.5 text-primary-container">
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-primary-container/10 transition-colors"
              title="Add Media"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">image</span>
            </button>
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-primary-container/10 transition-colors"
              title="Add GIF"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">gif_box</span>
            </button>
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-primary-container/10 transition-colors"
              title="Create Poll"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">ballot</span>
            </button>
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-primary-container/10 transition-colors"
              title="Add Emoji"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
            </button>
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-primary-container/10 transition-colors"
              title="Schedule Post"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">pending_actions</span>
            </button>
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-primary-container/10 transition-colors opacity-50"
              title="Tag Location"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">location_on</span>
            </button>
          </div>

          {/* Right Side: Counter, Thread, and Post Button */}
          <div className="flex items-center gap-space-md">
            {/* Circular Progress Meter & Character Count */}
            <div className="flex items-center gap-space-xs">
              <div className="relative w-7 h-7 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background track circle */}
                  <circle
                    className="stroke-surface-container-highest"
                    cx="18"
                    cy="18"
                    fill="none"
                    r="14"
                    strokeWidth="2.5"
                  />
                  {/* Active stroke circle */}
                  <circle
                    className="stroke-primary-container transition-all duration-300"
                    cx="18"
                    cy="18"
                    fill="none"
                    r="14"
                    strokeDasharray="87.96"
                    strokeDashoffset={strokeDashoffset}
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
              <span className="font-label-sm text-label-sm text-outline select-none">
                {charsRemaining}
              </span>
            </div>

            {/* Vertical Separator Capsule */}
            <div className="w-px h-6 bg-surface-container-highest"></div>

            {/* Add Thread Segment Button */}
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center text-primary-container hover:bg-primary-container/10 transition-colors"
              title="Add to thread"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
            </button>

            {/* Primary Submit Post Button */}
            <button
              className="px-space-lg py-space-xs bg-primary-container hover:bg-secondary-container active:scale-95 text-on-primary-container font-label-lg text-label-lg font-bold rounded-full transition-all shadow-md shadow-primary-container/20 flex items-center justify-center min-w-[72px]"
              disabled={isSubmitting}
              onClick={handleSubmit}
              type="button"
            >
              {isSubmitting ? (
                <span className="material-symbols-outlined animate-spin text-[18px]">
                  progress_activity
                </span>
              ) : (
                "Post"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
