'use client'
import { useState, useEffect } from 'react'

export default function BulkCalculator({ unitPrice=0, maxQty=999999 }){
  const [amount, setAmount] = useState(1)
  useEffect(()=> {
    setAmount(1)
  }, [unitPrice])

  const total = (Number(unitPrice) * Number(amount)).toFixed(4)

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm">Amount:</label>
      <input type="number" min="1" max={maxQty} value={amount} onChange={(e)=> setAmount(Math.max(1, Number(e.target.value||1)))} className="w-20 px-2 py-1 border rounded" />
      <div className="ml-auto text-sm font-semibold">{total} <span className="text-xs text-slate-500">gold</span></div>
    </div>
  )
}
