export async function fetchMarketplaceItems(){
  const url = 'https://api.nomstead.com/open/marketplace'
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if(!res.ok) throw new Error(`API responded ${res.status}`)
    const data = await res.json()
    // Expect data.toBuy and data.toSell
    return data
  } catch (e){
    console.error('fetchMarketplaceItems error', e)
    throw e
  }
}
