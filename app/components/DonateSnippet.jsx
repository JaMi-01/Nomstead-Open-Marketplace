'use client';
import { useState } from 'react';
const ADDRESS = '0x139a92c3Cad0CBe6b8F9C6b2365CC31bE164e341';

export default function DonateSnippet() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      alert('Could not copy address: ' + ADDRESS);
    }
  };
  return (
    <div className="bg-gradient-to-r from-white to-yellow-50 p-4 rounded-lg shadow-sm inline-block text-center">
      <p className="font-semibold text-gray-800 mb-1">Support the project here:</p>
      <p className="text-sm text-gray-700 mb-1">ETH or USDC<br/>On Ethereum, Polygon, Arbitrum or Immutable zkEVM.</p>
      <p className="text-sm text-gray-700 break-all mb-3"><strong>Network address:</strong><br/><code className="font-mono">{ADDRESS}</code></p>
      <div className="flex justify-center">
        <button onClick={copy} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          {copied ? 'Copied!' : 'Copy address'}
        </button>
      </div>
    </div>
  );
}