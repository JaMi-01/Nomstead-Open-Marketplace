'use client'
import { useState, useRef, useEffect } from 'react'

export default function Autocomplete({ value='', onChange, suggestions=[], onSelect, placeholder='Search...' }){
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(()=>{
    const handle = (e)=>{
      if(ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    window.addEventListener('click', handle)
    return ()=> window.removeEventListener('click', handle)
  },[])

  useEffect(()=> {
    setOpen(suggestions.length > 0)
  }, [suggestions])

  return (
    <div ref={ref} className="relative">
      <input
        className="w-full px-3 py-2 border rounded"
        placeholder={placeholder}
        value={value}
        onChange={(e)=> { onChange(e.target.value); setOpen(true)}}
        onFocus={()=> setOpen(suggestions.length>0)}
      />
      {open && suggestions.length>0 && (
        <div className="absolute left-0 right-0 bg-white border mt-1 rounded z-10 max-h-60 overflow-auto">
          {suggestions.map((s, idx)=>(
            <div key={s+idx} className="px-3 py-2 hover:bg-slate-100 cursor-pointer" onClick={()=>{
              onSelect(s)
              setOpen(false)
            }}>
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
