'use client';
import React from 'react';

export default function Tabs({ tabs = ['Buy','Sell','Profit'], activeTab, setActiveTab }) {
  return (
    <div className="flex justify-center gap-3 mt-6">
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => setActiveTab(t)}
          className={`px-4 py-2 rounded-md font-medium ${activeTab === t ? 'bg-amber-300 text-gray-900' : 'bg-white text-gray-700 border'}`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
