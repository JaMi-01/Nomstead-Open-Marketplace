'use client'
import DonateBlock from './DonateBlock'

export default function Header(){
  return (
    <header className="bg-white border-b py-4">
      <div className="container flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Nomstead Open Marketplace</h1>
          <p className="text-sm text-slate-500">Modern, mobile friendly marketplace</p>
        </div>
        <div className="w-full md:w-1/3">
          <DonateBlock />
        </div>
      </div>
    </header>
  )
}
