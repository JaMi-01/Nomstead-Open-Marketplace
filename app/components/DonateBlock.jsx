'use client'
import { useState } from 'react'

const ADDRESS = '0x139a92c3Cad0CBe6b8F9C6b2365CC31bE164e341'

export default function DonateBlock(){
  const [copied, setCopied] = useState(false)

  const copy = async ()=>{
    try{
      await navigator.clipboard.writeText(ADDRESS)
      setCopied(true)
      setTimeout(()=>setCopied(false), 2000)
    }catch(e){
      console.error(e)
    }
  }

  return (
    <div className="donate-block flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div className="text-left">
        <div className="text-sm font-semibold">Support the project here:</div>
        <div className="text-xs text-slate-600">ETH or USDC on Ethereum, Polygon, Arbitrum, or Immutable zkEVM</div>
        <div className="mt-1 text-sm font-mono">{ADDRESS}</div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={copy} className="px-3 py-1 border rounded">
          {copied ? 'Copied!' : 'Copy Address'}
        </button>
      </div>
    </div>
  )
}
