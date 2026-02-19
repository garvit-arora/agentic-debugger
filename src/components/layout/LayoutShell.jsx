export function LayoutShell({ children }) {
  return (
    <div className="min-h-screen w-full bg-[#000000] text-[#FAFAFA] relative font-sans selection:bg-white/10 scroll-smooth">
       {/* v0 inspired subtle background noise/gradient */}
       <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.02)_0%,transparent_70%)]" />
       </div>
       
       <main className="relative z-10 flex flex-col items-center">
          <div className="w-full flex-1 flex flex-col">
             {children}
          </div>
       </main>
    </div>
  )
}
