import React from 'react';
import { Link } from 'react-router-dom';
import { currentUser } from '../data/mockData';

export default function MobileHeader({ title = "X Feed" }) {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-surface/85 backdrop-blur-xl z-40 flex items-center justify-between px-space-lg shadow-[0_1px_8px_rgba(0,0,0,0.3)]">
      <Link to="/profile" className="flex items-center gap-space-md">
        <img
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover"
          src={currentUser.avatar}
        />
        <span className="font-headline-md text-headline-md text-on-surface">{title}</span>
      </Link>
      <Link to="/feed">
        <img
          alt="X Logo"
          className="h-8 w-auto object-contain"
          src="https://lh3.googleusercontent.com/aida/ALJJyrDY341OF6k-orb5rQLLgUX6DAOzRDqZTgKy2dGAMRq6w7312KMrMwRr889exyGEmubSUZ2JL-515wGYilFY47CIq0CQgFNomhxaWgEkfLheIwYUxY9d8AV5cYCjOuvzvrOtv3utF7LYiWYXneHFEmJfGf8IfoRIQ7lgHWeZftdGDPelhb88iuVB_ZRQ2_7ggVCTyaKmsF8G72W3oHEFXU6cA5CNv6DhqLvGP2pGKC5G"
        />
      </Link>
      <div className="w-8 flex justify-end">
        <Link to="/login" className="flex items-center text-on-surface-variant hover:text-on-surface">
          <span className="material-symbols-outlined">settings</span>
        </Link>
      </div>
    </header>
  );
}
