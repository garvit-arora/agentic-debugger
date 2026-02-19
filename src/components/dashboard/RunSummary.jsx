import React from 'react'
import { useAgentStore } from "@/store/useAgentStore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, GitCommit, CheckCircle2, XCircle, Loader2 } from "lucide-react"

export function RunSummary() {
  const summary = useAgentStore((state) => state.summary)
  const run = useAgentStore((state) => state.run)
  const mode = useAgentStore((state) => state.inputs.mode)
  
  const statusColor = 
    run.connectionStatus === 'completed' 
       ? summary.finalStatus === 'PASSED' ? 'text-emerald-400' : 'text-red-400'
       : 'text-sky-400'

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
       <div className="border border-white/[0.05] bg-white/[0.02] p-6 rounded-sm">
          <p className="text-[10px] text-[#444444] uppercase tracking-[0.2em] font-bold mb-3">Status</p>
          <div className={`text-xl font-light tracking-tight flex items-center gap-3 ${statusColor}`}>
             {run.connectionStatus === 'streaming' && <Loader2 className="animate-spin h-4 w-4" />}
             {run.connectionStatus === 'completed' ? summary.finalStatus : 'ACTIVE'}
          </div>
       </div>

       <div className="border border-white/[0.05] bg-white/[0.02] p-6 rounded-sm">
          <p className="text-[10px] text-[#444444] uppercase tracking-[0.2em] font-bold mb-3">Duration</p>
          <div className="text-xl font-light tracking-tight flex items-center gap-3 text-white">
             <Clock size={16} className="text-[#333333]" />
             {Math.floor(summary.timeTakenSeconds / 60)}:{(summary.timeTakenSeconds % 60).toString().padStart(2, '0')}s
          </div>
       </div>

       <div className="border border-white/[0.05] bg-white/[0.02] p-6 rounded-sm">
          <p className="text-[10px] text-[#444444] uppercase tracking-[0.2em] font-bold mb-3">Resolutions</p>
          <div className="text-xl font-light tracking-tight flex items-center gap-3 text-white">
             <CheckCircle2 size={16} className="text-[#333333]" />
             {summary.totalFixes}
          </div>
       </div>
       
       <div className="border border-white/[0.05] bg-white/[0.02] p-6 rounded-sm">
          <p className="text-[10px] text-[#444444] uppercase tracking-[0.2em] font-bold mb-3">Deployments</p>
          <div className="text-xl font-light tracking-tight flex items-center gap-3 text-white">
             <GitCommit size={16} className="text-[#333333]" />
             {summary.commitsCount}
          </div>
       </div>
    </div>
  )
}
