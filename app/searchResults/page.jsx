'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import ItemCard from '../components/ItemCard';
import Loader from '../components/Loader';

function SearchResultsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const query = params.get('q');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      router.push('/');
      return;
    }

    async function fetchResults() {
      setLoading(true);
      const res = await fetch('https://api.nomstead.com/open/marketplace');
      const json = await res.json();
      const matches = json.items.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      setResults(matches);
      setLoading(false);
    }

    fetchResults();
  }, [query, router]);

  if (loading) return <Loader />;

  if (!results || results.length === 0)
    return (
      <div className="text-center text-gray-600 mt-10">
        No items found for "{query}"
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {results.map((item, index) => (
        <ItemCard key={index} item={item} />
      ))}
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<Loader />}>
      <SearchResultsContent />
    </Suspense>
  );
}