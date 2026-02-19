import React from 'react'
import { useAgentStore } from "@/store/useAgentStore"
import { cn } from "@/lib/utils"
import { ExternalLink, GitBranch, AlertCircle, CheckCircle2, Clock, RotateCcw, Loader2 } from "lucide-react"

export function RunSummaryCard() {
    const summary = useAgentStore((s) => s.summary)
    const run = useAgentStore((s) => s.run)
    const inputs = useAgentStore((s) => s.inputs)

    const status = run.connectionStatus === 'completed' ? summary.finalStatus :
        run.isRunning ? 'RUNNING' : 'IDLE'

    const statusStyle = {
        PASSED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
        RUNNING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        IDLE: 'bg-white/5 text-white/30 border-white/10',
        PENDING: 'bg-white/5 text-white/30 border-white/10',
    }

    const fmt = (s) => { const m = Math.floor(s/60); const sec = Math.floor(s%60); return m + 'm ' + sec + 's' }

    const rows = [
        { label: 'Repository', value: inputs.repoUrl || 'N/A', icon: ExternalLink },
        { label: 'Team Name', value: inputs.teamName || 'N/A' },
        { label: 'Leader', value: inputs.leaderName || 'N/A' },
        { label: 'Branch Created', value: run.branchName || 'Pending...', icon: GitBranch },
        { label: 'Total Failures', value: summary.totalFailures, icon: AlertCircle },
        { label: 'Total Fixes', value: summary.totalFixes, icon: CheckCircle2 },
        { label: 'Time Taken', value: fmt(summary.timeTakenSeconds), icon: Clock },
        { label: 'Iterations', value: summary.iterationsUsed + '/5', icon: RotateCcw },
    ]

    return (
        <div className="bg-[#060606] border border-white/[0.06] rounded-lg overflow-hidden h-full flex flex-col">
            {/* Header row */}
            <div className="px-6 py-4 border-b border-white/[0.06] bg-white/[0.015] flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
                    <ExternalLink size={13} className="text-blue-500" />
                    Run Summary
                </h3>
                <div className="flex items-center gap-3">
                    {run.isRunning && (
                        <div className="flex items-center gap-2">
                            <Loader2 size={12} className="animate-spin text-blue-400" />
                            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Live</span>
                        </div>
                    )}
                    <span className={cn('text-[9px] font-black px-3 py-1 rounded-md border uppercase tracking-widest', statusStyle[status] || statusStyle.IDLE)}>
                        {status}
                    </span>
                </div>
            </div>

            {/* Data rows */}
            <div className="p-6 space-y-0 flex-1">
                {rows.map(({ label, value, icon: Icon }, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-white/[0.03] last:border-0">
                        <div className="flex items-center gap-2.5">
                            {Icon && <Icon size={12} className="text-white/15" />}
                            <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-white/30">{label}</span>
                        </div>
                        <span className="text-[11px] font-medium text-white/70 max-w-[260px] truncate text-right font-mono">{value}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
