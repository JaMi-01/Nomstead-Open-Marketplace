'use client';
export default function Tabs({ tabs = [], activeTab, onChange }) {
  return (
    <div className="flex justify-center gap-3 mt-6">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-4 py-2 rounded-md font-medium ${activeTab === t ? 'bg-amber-300 text-gray-900' : 'bg-white text-gray-700 border'}`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
