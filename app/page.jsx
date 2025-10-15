'use client'
import { useEffect, useState } from 'react'
import Tabs from './components/Tabs'
import CategoryList from './components/CategoryList'
import DonateBlock from './components/DonateBlock'
import { fetchMarketplaceItems } from '../lib/api'
import ErrorRetry from './components/ErrorRetry'

export default function HomePage(){
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('buy') // buy | sell | profit

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchMarketplaceItems()
      setData(res)
    } catch (e) {
      setError(e.message || 'API fejl')
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ load() }, [])

  return (
    <div className="space-y-6">
      <header className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Nomstead Open Marketplace</h1>
        <div className="mx-auto max-w-xl">
          <DonateBlock />
        </div>
        {/* Search field placeholder - actual search handled in /search */}
        <div className="mx-auto mt-2">
          <a href="/search" className="px-4 py-2 rounded-lg bg-slate-100 border">Go to search</a>
        </div>
      </header>

      <section className="text-center">
        <Tabs active={activeTab} onChange={setActiveTab} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold capitalize">{activeTab}</h2>
          <div className="space-x-2">
            <button onClick={load} className="px-3 py-1 border rounded">Refresh</button>
            <button onClick={()=>{
              const evt = new CustomEvent('expandAll')
              window.dispatchEvent(evt)
            }} className="px-3 py-1 border rounded">Expand All</button>
            <button onClick={()=>{
              const evt = new CustomEvent('collapseAll')
              window.dispatchEvent(evt)
            }} className="px-3 py-1 border rounded">Collapse All</button>
          </div>
        </div>

        {loading && <div>Loading...</div>}
        {error && <ErrorRetry message={error} onRetry={load} />}
        {data && (
          <CategoryList data={data} activeTab={activeTab} />
        )}
      </section>
    </div>
  )
}
