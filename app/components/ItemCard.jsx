'use client'
import BulkCalculator from './BulkCalculator'
import { prettifySlug } from '../../lib/utils'

export default function ItemCard({ item, mode='buy' }){
  // item object shape from API (one entry from toBuy/toSell)
  const slug = item?.object?.slug || 'unknown'
  const name = prettifySlug(slug)
  const category = item?.object?.category || 'unknown'
  const subCategory = item?.object?.subCategory || ''
  const thumbnail = item?.object?.thumbnailImageUrl || item?.object?.imageUrl || '/public/icons/default.png'
  const unitPrice = item?.pricing?.unitPrice ?? 0
  const qty = mode === 'buy' ? item?.pricing?.availableQuantity ?? 0 : item?.pricing?.desiredQuantity ?? 0
  const owner = item?.tile?.owner || 'Unknown'
  const url = item?.tile?.url || '#'

  const cardColorClasses = mode === 'buy' ? 'bg-nomBuy/10 border' : (mode === 'sell' ? 'bg-nomSell/10 border' : 'bg-nomProfit/10 border')

  return (
    <div className={`p-3 ${cardColorClasses} rounded nom-card`}>
      <div className="flex items-start gap-3">
        <img src={thumbnail} alt={name} className="item-icon" />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold">{name}</div>
              <div className="text-xs text-slate-500">{prettifySlug(category)} / {prettifySlug(subCategory)}</div>
            </div>
            <div className="text-right text-sm">
              <div className="font-medium">{unitPrice} <span className="text-xs text-slate-500">gold</span></div>
              <div className="text-xs text-slate-500">Qty: {qty}</div>
            </div>
          </div>

          <div className="mt-3 text-sm text-slate-700">
            <div>Buy from: <a href={url} target="_blank" rel="noreferrer noopener" className="underline">{owner}</a> @ {unitPrice} gold Qty: {qty}</div>
          </div>

          <div className="mt-3">
            <BulkCalculator unitPrice={unitPrice} maxQty={qty} />
          </div>
        </div>
      </div>
    </div>
  )
}
