'use client'
import { useState, useEffect } from 'react'
import Autocomplete from '../components/Autocomplete'
import Tabs from '../components/Tabs'
import ItemCard from '../components/ItemCard'
import DonateBlock from '../components/DonateBlock'
import { fetchMarketplaceItems } from '../../lib/api'
import ErrorRetry from '../components/ErrorRetry'
import { prettifySlug, filterItemsBySearch } from '../../lib/utils'

export default function SearchPage(){
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('buy')

  useEffect(()=>{
    const load = async ()=>{
      setLoading(true)
      try{
        const res = await fetchMarketplaceItems()
        setData(res)
      }catch(e){
        setError(e.message || 'API fejl')
      }finally{
        setLoading(false)
      }
    }
    load()
  },[])

  useEffect(()=>{
    if(!query || !data) { setSuggestions([]); return }
    const all = [...(data.toBuy||[]), ...(data.toSell||[])]
    const filtered = all
      .filter(i => prettifySlug(i.object.slug).toLowerCase().includes(query.toLowerCase()))
      .slice(0,10)
    setSuggestions(filtered.map(i => prettifySlug(i.object.slug)))
  },[query,data])

  const results = data ? filterItemsBySearch(data, query) : { buy: [], sell: [] }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <a href="/" className="text-sm underline">Back to homepage</a>
        <h1 className="text-xl font-bold">Search</h1>
        <div style={{width:80}} />
      </div>

      <div className="mx-auto max-w-xl">
        <DonateBlock />
        <div className="mt-3">
          <Autocomplete value={query} onChange={setQuery} suggestions={suggestions} onSelect={(val)=> setQuery(val)} placeholder="Search items..."/>
        </div>
      </div>

      <section>
        <Tabs active={activeTab} onChange={setActiveTab} showProfit={false} />
        {loading && <div>Loading results...</div>}
        {error && <ErrorRetry message={error} onRetry={()=>location.reload()} />}

        {!loading && !error && (
          <div className="grid gap-4">
            {activeTab === 'buy' && results.buy.map((it,idx)=>(
              <ItemCard key={it.object.slug + idx} item={it} mode="buy" />
            ))}
            {activeTab === 'sell' && results.sell.map((it,idx)=>(
              <ItemCard key={it.object.slug + idx} item={it} mode="sell" />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
