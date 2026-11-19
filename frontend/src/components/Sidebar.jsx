import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { currentUser } from '../data/mockData';

export default function Sidebar({ onOpenTweetModal }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const isHome = currentPath === '/feed' || currentPath === '/';
  const isProfile = currentPath === '/profile';

  return (
    <aside className="hidden sm:flex sm:w-20 lg:w-[260px] h-screen sticky top-0 z-30 flex-col justify-between py-space-md px-space-sm lg:px-space-md bg-surface shrink-0">
      <div className="flex flex-col gap-space-xs">
        {/* Brand Logo */}
        <div className="flex items-center justify-center lg:justify-start px-space-sm py-space-sm mb-space-xs">
          <Link className="flex items-center gap-space-sm" to="/feed">
            <img
              alt="X Logo"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/ALJJyrDY341OF6k-orb5rQLLgUX6DAOzRDqZTgKy2dGAMRq6w7312KMrMwRr889exyGEmubSUZ2JL-515wGYilFY47CIq0CQgFNomhxaWgEkfLheIwYUxY9d8AV5cYCjOuvzvrOtv3utF7LYiWYXneHFEmJfGf8IfoRIQ7lgHWeZftdGDPelhb88iuVB_ZRQ2_7ggVCTyaKmsF8G72W3oHEFXU6cA5CNv6DhqLvGP2pGKC5G"
            />
            <span className="hidden lg:inline font-headline-lg text-headline-lg text-on-surface tracking-tight">
              X Connect
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-space-xs">
          {/* Home */}
          <Link
            to="/feed"
            aria-current={isHome ? "page" : undefined}
            className={`flex items-center justify-center lg:justify-start gap-space-lg px-space-md py-space-md rounded-full transition-all ${
              isHome
                ? "text-on-surface font-headline-md font-bold bg-surface-container-high/60"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[26px]">home</span>
            <span className="hidden lg:inline font-headline-md text-headline-md">
              Home
            </span>
          </Link>

          {/* Notifications */}
          <Link
            to="/feed"
            className="flex items-center justify-center lg:justify-start gap-space-lg px-space-md py-space-md rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all relative"
          >
            <div className="relative flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">notifications</span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary-container rounded-full ring-2 ring-surface"></span>
            </div>
            <span className="hidden lg:inline font-headline-md text-headline-md">
              Notifications
            </span>
          </Link>

          {/* Profile */}
          <Link
            to="/profile"
            aria-current={isProfile ? "page" : undefined}
            className={`flex items-center justify-center lg:justify-start gap-space-lg px-space-md py-space-md rounded-full transition-all ${
              isProfile
                ? "text-on-surface font-headline-md font-bold bg-surface-container-high/60"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[26px]">person</span>
            <span className="hidden lg:inline font-headline-md text-headline-md">
              Profile
            </span>
          </Link>

          {/* Login / Auth */}
          <Link
            to="/login"
            className="flex items-center justify-center lg:justify-start gap-space-lg px-space-md py-space-md rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined text-[26px]">login</span>
            <span className="hidden lg:inline font-headline-md text-headline-md">
              Sign In
            </span>
          </Link>
        </nav>

        {/* Post Button */}
        <div className="mt-space-md flex justify-center lg:block">
          <button
            onClick={onOpenTweetModal}
            className="w-12 h-12 lg:w-full lg:h-12 flex items-center justify-center bg-primary-container hover:bg-secondary-container text-on-background rounded-full transition-all shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined lg:hidden text-[22px]">edit</span>
            <span className="hidden lg:inline font-label-lg text-label-lg">Post</span>
          </button>
        </div>
      </div>

      {/* User Profile Capsule at Bottom */}
      <Link
        to="/profile"
        className="flex items-center justify-between p-space-sm rounded-full hover:bg-surface-container transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-space-sm overflow-hidden">
          <img
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover shrink-0"
            src={currentUser.avatar}
          />
          <div className="hidden lg:flex flex-col min-w-0 leading-tight">
            <span className="font-label-lg text-label-lg text-on-surface truncate">
              {currentUser.name}
            </span>
            <span className="font-body-sm text-body-sm text-outline truncate">
              @{currentUser.handle}
            </span>
          </div>
        </div>
        <span className="material-symbols-outlined hidden lg:block text-outline">
          more_horiz
        </span>
      </Link>
    </aside>
  );
}
