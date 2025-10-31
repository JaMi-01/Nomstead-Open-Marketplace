'use client';
import React from 'react';
import MarketplaceView from './components/MarketplaceView';
import Loader from './components/Loader';

/**
 * Root page component — loads the MarketplaceView
 */
export default function HomePage() {
  return (
    <div className="space-y-6 pb-12">
      <MarketplaceView />
    </div>
  );
}
