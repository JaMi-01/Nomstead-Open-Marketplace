export default function Footer(){
  return (
    <footer className="bg-white border-t mt-8">
      <div className="container py-6 text-sm text-slate-600">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <div>
            Created by: ChatGPT<br/>
            Vision by: <a href="https://x.com/jamionfire?s=21" target="_blank" rel="noreferrer noopener" className="underline">JaMi</a><br/>
            Build on: <a href="https://github.com/JaMi-01/Nomstead-Open-Marketplace" target="_blank" rel="noreferrer noopener" className="underline">GitHub</a><br/>
            Hosted on: Vercel
          </div>
          <div className="text-xs text-slate-500">
            © Nomstead Open Marketplace
          </div>
        </div>
      </div>
    </footer>
  )
}
