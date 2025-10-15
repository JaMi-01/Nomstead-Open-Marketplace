'use client'
export default function Tabs({ active='buy', onChange, showProfit=true }){
  return (
    <div className="flex justify-center gap-3">
      <button className={`px-4 py-2 rounded ${active==='buy' ? 'bg-nomBuy text-white' : 'bg-white border'}`} onClick={()=>onChange('buy')}>Buy</button>
      <button className={`px-4 py-2 rounded ${active==='sell' ? 'bg-nomSell text-white' : 'bg-white border'}`} onClick={()=>onChange('sell')}>Sell</button>
      {showProfit && <button className={`px-4 py-2 rounded ${active==='profit' ? 'bg-nomProfit text-white' : 'bg-white border'}`} onClick={()=>onChange('profit')}>Buy Low & Sell High</button>}
    </div>
  )
}
