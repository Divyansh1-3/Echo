import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { currentUser as fallbackUser } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export default function TweetComposer({ onPublish }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isConfigured } = useAuth();

  const [text, setText] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const textareaRef = useRef(null);

  const displayName = user?.user_metadata?.full_name || fallbackUser.name;
  const displayAvatar = user?.user_metadata?.avatar_url || fallbackUser.avatar;

  const maxChars = 280;
  const charsCount = text.length;
  const progressRatio = Math.min(charsCount / maxChars, 1);
  const strokeDashoffset = 50 * (1 - progressRatio);

  const handleInput = (e) => {
    setText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handlePublish = () => {
    if (!text.trim()) return;

    if (isConfigured && !user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    setIsPublishing(true);
    setTimeout(() => {
      if (onPublish) {
        onPublish(text);
      }
      setText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      setIsPublishing(false);
    }, 400);
  };

  return (
    <section className="bg-surface px-space-lg py-space-md flex flex-col gap-space-sm bg-surface-container-lowest/30 border-b border-outline-variant/20">
      <div className="flex gap-space-md items-start">
        <img
          alt={displayName}
          className="w-10 h-10 rounded-full object-cover shrink-0 shadow-sm"
          src={displayAvatar}
        />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Audience Picker Pill */}
          <button className="self-start flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm hover:bg-surface-container-highest transition-colors mb-space-sm">
            <span>Everyone</span>
            <span className="material-symbols-outlined text-[14px]">expand_more</span>
          </button>

          {/* Dynamic Auto-Expanding Textarea */}
          <textarea
            ref={textareaRef}
            className="w-full bg-transparent text-on-surface placeholder:text-outline font-body-lg text-body-lg resize-none focus:outline-none leading-relaxed tracking-wide selection:bg-primary-container selection:text-on-primary-container"
            placeholder="What is happening?!"
            rows={2}
            value={text}
            onChange={handleInput}
          />

          {/* Permission scope */}
          <div className="flex items-center gap-space-xs py-space-xs text-primary font-label-sm text-label-sm font-semibold cursor-pointer hover:opacity-90">
            <span className="material-symbols-outlined text-[16px]">public</span>
            <span>Everyone can reply</span>
          </div>
        </div>
      </div>

      {/* Composer Toolstrip & Submit */}
      <div className="flex items-center justify-between pt-space-sm pl-12">
        {/* Media Tools */}
        <div className="flex items-center gap-space-xs text-primary">
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors"
            title="Media"
            type="button"
          >
            <span className="material-symbols-outlined text-[19px]">image</span>
          </button>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors"
            title="GIF"
            type="button"
          >
            <span className="material-symbols-outlined text-[19px]">gif_box</span>
          </button>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors"
            title="Poll"
            type="button"
          >
            <span className="material-symbols-outlined text-[19px]">ballot</span>
          </button>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors"
            title="Emoji"
            type="button"
          >
            <span className="material-symbols-outlined text-[19px]">sentiment_satisfied</span>
          </button>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors"
            title="Schedule"
            type="button"
          >
            <span className="material-symbols-outlined text-[19px]">schedule</span>
          </button>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors opacity-50 cursor-not-allowed"
            title="Location (disabled)"
            type="button"
          >
            <span className="material-symbols-outlined text-[19px]">location_on</span>
          </button>
        </div>

        {/* Action Post and Counter Ring */}
        <div className="flex items-center gap-space-md">
          {/* Mini Progress SVG for Character Limit */}
          <div className="relative w-6 h-6 flex items-center justify-center">
            <svg className="w-5 h-5 transform -rotate-90">
              <circle
                className="text-surface-container-high fill-none"
                cx="10"
                cy="10"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle
                className="text-primary-container fill-none transition-all duration-150"
                cx="10"
                cy="10"
                r="8"
                stroke="currentColor"
                strokeDasharray="50"
                strokeDashoffset={strokeDashoffset}
                strokeWidth="2"
              />
            </svg>
          </div>

          <button
            onClick={handlePublish}
            disabled={!text.trim() || isPublishing}
            className={`px-space-lg py-1.5 rounded-full font-label-md text-label-md font-bold transition-all shadow-sm flex items-center justify-center cursor-pointer ${
              text.trim() && !isPublishing
                ? "bg-primary-container hover:bg-secondary-container text-on-primary-container"
                : "bg-primary-container/50 text-on-primary-container/50 cursor-not-allowed"
            }`}
          >
            {isPublishing ? (
              <span className="material-symbols-outlined animate-spin text-[16px]">
                progress_activity
              </span>
            ) : (
              "Post"
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
