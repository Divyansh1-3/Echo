import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function MobileBottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isHome = currentPath === '/feed' || currentPath === '/';
  const isProfile = currentPath === '/profile';

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 h-14 bg-surface/90 backdrop-blur-xl z-40 flex items-center justify-around px-space-md shadow-[0_-1px_8px_rgba(0,0,0,0.3)]">
      <Link
        to="/feed"
        aria-current={isHome ? "page" : undefined}
        className={`flex items-center justify-center ${
          isHome ? "text-primary-container" : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <span className="material-symbols-outlined text-[26px]">home</span>
      </Link>
      <Link
        to="/feed"
        className="flex items-center justify-center text-on-surface-variant hover:text-on-surface relative"
      >
        <span className="material-symbols-outlined text-[26px]">notifications</span>
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary-container rounded-full"></span>
      </Link>
      <Link
        to="/profile"
        aria-current={isProfile ? "page" : undefined}
        className={`flex items-center justify-center ${
          isProfile ? "text-primary-container" : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <span className="material-symbols-outlined text-[26px]">person</span>
      </Link>
      <Link
        to="/login"
        className="flex items-center justify-center text-on-surface-variant hover:text-on-surface"
      >
        <span className="material-symbols-outlined text-[26px]">settings</span>
      </Link>
    </nav>
  );
}
