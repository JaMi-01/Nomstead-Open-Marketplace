'use client';
import React, { useState } from 'react';

const ADDRESS = '0x139a92c3Cad0CBe6b8F9C6b2365CC31bE164e341';

export default function DonateSnippet() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      alert('Could not copy address. Please copy manually: ' + ADDRESS);
    }
  };

  return (
    <div className="bg-gradient-to-r from-white to-yellow-50 p-4 rounded-lg shadow-sm">
      <p className="font-semibold text-gray-800 text-center">Support the project here:</p>
      <p className="text-sm text-gray-700 text-center">USDC or ETH on Ethereum, Polygon, Arbitrum or Immutable zkEVM</p>
      <p className="text-sm text-gray-700 text-center break-all">Network address: <code className="font-mono">{ADDRESS}</code></p>
      <div className="flex justify-center mt-3">
        <button
          onClick={copy}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {copied ? 'Copied!' : 'Copy address'}
        </button>
      </div>
    </div>
  );
}