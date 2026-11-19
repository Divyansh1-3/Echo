import React, { useState } from 'react';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';
import TweetModal from './TweetModal';

export default function Layout({ children, mobileTitle = "X Feed", onNewPost }) {
  const [isTweetModalOpen, setIsTweetModalOpen] = useState(false);

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      {/* Mobile Top Header */}
      <MobileHeader title={mobileTitle} />

      {/* Main 3-Column Container */}
      <div className="max-w-[1280px] w-full mx-auto min-h-screen flex justify-center lg:grid lg:grid-cols-[260px_minmax(0,1fr)_350px] relative">
        {/* Left Sidebar */}
        <Sidebar onOpenTweetModal={() => setIsTweetModalOpen(true)} />

        {/* Center Main Content Area */}
        <div className="w-full flex-1 min-w-0 flex justify-center border-x border-outline-variant/30">
          <main className="w-full max-w-[600px] min-h-screen pt-14 md:pt-0 pb-16 sm:pb-0 bg-surface shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            {children}
          </main>
        </div>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Tweet Creation Modal */}
      <TweetModal
        isOpen={isTweetModalOpen}
        onClose={() => setIsTweetModalOpen(false)}
        onPost={(newPost) => {
          if (onNewPost) {
            onNewPost(newPost);
          }
        }}
      />
    </div>
  );
}
