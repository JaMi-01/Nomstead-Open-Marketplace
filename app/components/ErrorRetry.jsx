'use client'
export default function ErrorRetry({ message='Unknown error', onRetry }){
  return (
    <div className="bg-red-50 border border-red-200 p-4 rounded">
      <div className="text-sm text-red-700">Fejl: {message}</div>
      <div className="mt-2">
        <button onClick={onRetry} className="px-3 py-1 bg-white border rounded">Retry</button>
      </div>
    </div>
  )
}
