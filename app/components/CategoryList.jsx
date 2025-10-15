'use client'
import { useEffect, useMemo, useState } from 'react'
import ItemCard from './ItemCard'
import { prettifySlug, groupByCategory } from '../../lib/utils'

export default function CategoryList({ data, activeTab }){
  // data: { toBuy:[], toSell:[] }
  const items = activeTab === 'sell' ? data.toSell || [] : data.toBuy || []
  // Group items by category -> subCategory -> array
  const grouped = useMemo(()=> groupByCategory(items), [items])

  // global expand/collapse events
  useEffect(()=>{
    const onExpand = ()=> setOpenState(allKeysOpen(grouped))
    const onCollapse = ()=> setOpenState({})
    window.addEventListener('expandAll', onExpand)
    window.addEventListener('collapseAll', onCollapse)
    return ()=> {
      window.removeEventListener('expandAll', onExpand)
      window.removeEventListener('collapseAll', onCollapse)
    }
  },[grouped])

  function allKeysOpen(g){
    const out = {}
    Object.keys(g).forEach(cat=>{
      out[cat] = { open: true, subs: {} }
      Object.keys(g[cat]).forEach(sub=>{
        out[cat].subs[sub] = true
      })
    })
    return out
  }

  const [openState, setOpenState] = useState({})

  useEffect(()=> {
    // initialize closed
    setOpenState({})
  }, [activeTab, data])

  const toggleCat = (cat)=>{
    setOpenState(prev => ({
      ...prev,
      [cat]: {
        ...(prev[cat] || { open: false, subs: {} }),
        open: !(prev[cat]?.open)
      }
    }))
  }

  const toggleSub = (cat, sub)=>{
    setOpenState(prev => {
      const catState = prev[cat] || { open: false, subs: {} }
      return {
        ...prev,
        [cat]: {
          ...catState,
          subs: {
            ...(catState.subs||{}),
            [sub]: !catState.subs?.[sub]
          }
        }
      }
    })
  }

  return (
    <div className="space-y-4">
      {Object.keys(grouped).length === 0 && <div>No items</div>}
      {Object.entries(grouped).map(([cat, subs])=>(
        <div key={cat} className="bg-white p-4 rounded nom-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className={`chev ${openState[cat]?.open ? 'open' : ''}`} onClick={()=>toggleCat(cat)}>▶</button>
              <div>
                <div className="font-semibold">{prettifySlug(cat)}</div>
                <div className="text-sm text-slate-500">{Object.keys(subs).length} subcategories</div>
              </div>
            </div>
          </div>

          {openState[cat]?.open && (
            <div className="mt-4 space-y-3 pl-6">
              {Object.entries(subs).map(([sub, items])=>(
                <div key={sub} className="bg-slate-50 p-3 rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button className={`chev ${openState[cat]?.subs?.[sub] ? 'open' : ''}`} onClick={()=>toggleSub(cat, sub)}>▶</button>
                      <div>
                        <div className="font-medium">{prettifySlug(sub)}</div>
                        <div className="text-xs text-slate-500">{items.length} items</div>
                      </div>
                    </div>
                  </div>

                  {openState[cat]?.subs?.[sub] && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {items.map((it, idx)=>(
                        <ItemCard key={it.object.slug + idx} item={it} mode={activeTab === 'sell' ? 'sell' : 'buy'} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
