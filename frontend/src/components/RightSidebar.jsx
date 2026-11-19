import React, { useState } from 'react';
import { trendingTopics, whoToFollowUsers } from '../data/mockData';

export default function RightSidebar() {
  const [followingMap, setFollowingMap] = useState({});

  const toggleFollow = (id) => {
    setFollowingMap((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
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
          {whoToFollowUsers.map((user) => {
            const isFollowing = followingMap[user.id];
            return (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <div
                    className={`w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold ${user.color}`}
                  >
                    {user.initials}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="font-label-lg text-label-lg text-on-surface font-bold hover:underline cursor-pointer">
                      {user.name}
                    </span>
                    <span className="font-body-sm text-body-sm text-outline">
                      @{user.handle}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleFollow(user.id)}
                  className={`px-space-md py-space-xs rounded-full font-label-md text-label-md font-bold transition-colors ${
                    isFollowing
                      ? "bg-transparent border border-outline text-on-surface hover:bg-error-container/20 hover:text-error hover:border-error"
                      : "bg-on-surface text-surface hover:bg-inverse-surface"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            );
          })}
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
