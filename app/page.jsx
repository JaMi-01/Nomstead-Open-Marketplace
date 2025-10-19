'use client';
import React from 'react';
import MarketplaceView from './components/MarketplaceView';
import DonateSnippet from './components/DonateSnippet';
import Loader from './components/Loader';

/**
 * Root page component — only wraps MarketplaceView and layout utilities
 */
export default function HomePage() {
  return (
    <div className="space-y-6 pb-12">
      <DonateSnippet />
      <MarketplaceView />
    </div>
  );
}