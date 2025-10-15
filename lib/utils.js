export function prettifySlug(slug=''){
  if(!slug) return ''
  // replace underscores and dashes, capitalize words
  return slug.replace(/[_-]/g,' ').split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
}

/**
 * Group items by object.category -> object.subCategory -> list
 * Input: items array (toBuy or toSell items)
 */
export function groupByCategory(items=[]){
  const out = {}
  items.forEach(it=>{
    const cat = it.object?.category || 'uncategorized'
    const sub = it.object?.subCategory || 'unspecified'
    out[cat] = out[cat] || {}
    out[cat][sub] = out[cat][sub] || []
    out[cat][sub].push(it)
  })
  return out
}

/**
 * For search page: return buy and sell arrays filtered by query
 */
export function filterItemsBySearch(data, query){
  if(!query) return { buy: [], sell: [] }
  const q = query.toLowerCase()
  const buy = (data.toBuy||[]).filter(i => prettifySlug(i.object.slug).toLowerCase().includes(q)).sort((a,b)=> a.pricing.unitPrice - b.pricing.unitPrice)
  const sell = (data.toSell||[]).filter(i => prettifySlug(i.object.slug).toLowerCase().includes(q)).sort((a,b)=> b.pricing.unitPrice - a.pricing.unitPrice)
  return { buy, sell }
}

/**
 * Profit matching:
 * Given data { toBuy, toSell } produce array of profit opportunities
 * For each unique slug: find lowest buy (toBuy.availablePrice) and highest sell (toSell.unitPrice).
 * Only include if profit > 0 and both sides exist.
 */
export function computeProfits(data){
  const buys = data.toBuy || []
  const sells = data.toSell || []
  const bySlugBuy = {}
  const bySlugSell = {}

  buys.forEach(b => {
    const s = b.object?.slug
    if(!s) return
    const price = Number(b.pricing?.unitPrice || 0)
    if(!bySlugBuy[s] || price < bySlugBuy[s].pricing.unitPrice) bySlugBuy[s] = b
  })
  sells.forEach(s => {
    const slug = s.object?.slug
    if(!slug) return
    const price = Number(s.pricing?.unitPrice || 0)
    if(!bySlugSell[slug] || price > bySlugSell[slug].pricing.unitPrice) bySlugSell[slug] = s
  })

  const opportunities = []
  Object.keys(bySlugBuy).forEach(slug=>{
    if(bySlugSell[slug]){
      const low = bySlugBuy[slug]
      const high = bySlugSell[slug]
      const profitPer = Number(high.pricing.unitPrice) - Number(low.pricing.unitPrice)
      if(profitPer > 0){
        opportunities.push({
          slug,
          buy: low,
          sell: high,
          profitPer
        })
      }
    }
  })

  // sort by best profitPer descending
  opportunities.sort((a,b)=> b.profitPer - a.profitPer)
  return opportunities
}
