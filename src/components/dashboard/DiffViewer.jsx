import React, { useState } from 'react'
import { useAgentStore } from "@/store/useAgentStore"
import { cn } from "@/lib/utils"
import { GitCompareArrows, ChevronDown, ChevronRight, FileCode, Minus, Plus, Eye } from "lucide-react"
import { motion, AnimatePresence } from 'framer-motion'

export function DiffViewer() {
    const fixes = useAgentStore((state) => state.fixes)
    const [expandedIdx, setExpandedIdx] = useState(null)
    const [viewMode, setViewMode] = useState('unified') // unified | split

    const toggle = (idx) => setExpandedIdx(expandedIdx === idx ? null : idx)

    // Generate a synthetic diff display from fix data
    const renderDiffBlock = (fix) => {
        const lines = []
        // Show context around the fix
        const startLine = Math.max(1, fix.line - 3)
        for (let i = startLine; i < fix.line; i++) {
            lines.push({ type: 'context', num: i, content: `    // ... existing code at line ${i}` })
        }
        lines.push({ type: 'removed', num: fix.line, content: `    // [${fix.bugType}] Original code with issue` })
        lines.push({ type: 'added', num: fix.line, content: `    // ${fix.commitMessage || 'Fixed'}` })
        for (let i = fix.line + 1; i <= fix.line + 3; i++) {
            lines.push({ type: 'context', num: i, content: `    // ... existing code at line ${i}` })
        }
        return lines
    }

    return (
        <div className="bg-[#060606] border border-white/[0.06] rounded-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/[0.06] bg-white/[0.015] flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
                    <GitCompareArrows size={13} className="text-purple-500" />
                    Code Diffs
                </h3>
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                        {fixes.length} {fixes.length === 1 ? 'CHANGE' : 'CHANGES'}
                    </span>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex bg-white/[0.03] border border-white/10 rounded-md overflow-hidden">
                        <button
                            onClick={() => setViewMode('unified')}
                            className={cn(
                                "px-3 py-1 text-[9px] font-bold uppercase tracking-widest transition-all",
                                viewMode === 'unified'
                                    ? "bg-purple-500/20 text-purple-400 border-r border-purple-500/20"
                                    : "text-white/20 hover:text-white/40 border-r border-white/10"
                            )}
                        >
                            Unified
                        </button>
                        <button
                            onClick={() => setViewMode('split')}
                            className={cn(
                                "px-3 py-1 text-[9px] font-bold uppercase tracking-widest transition-all",
                                viewMode === 'split'
                                    ? "bg-purple-500/20 text-purple-400"
                                    : "text-white/20 hover:text-white/40"
                            )}
                        >
                            Split
                        </button>
                    </div>
                </div>
            </div>

            {/* Diff list */}
            <div className="divide-y divide-white/[0.04]">
                {fixes.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <GitCompareArrows size={28} className="text-white/[0.06]" />
                        <span className="text-[10px] uppercase tracking-[0.4em] font-black text-white/[0.08]">
                            No Diffs Available
                        </span>
                        <span className="text-[10px] text-white/[0.15] font-medium">
                            Diffs will appear here as the agent applies fixes
                        </span>
                    </div>
                ) : (
                    fixes.map((fix, idx) => {
                        const isExpanded = expandedIdx === idx
                        const diffLines = renderDiffBlock(fix)
                        return (
                            <div key={idx} className="group">
                                {/* Collapsible header */}
                                <button
                                    onClick={() => toggle(idx)}
                                    className="w-full px-6 py-4 flex items-center gap-4 hover:bg-white/[0.015] transition-colors text-left"
                                >
                                    {isExpanded
                                        ? <ChevronDown size={14} className="text-white/20 shrink-0" />
                                        : <ChevronRight size={14} className="text-white/20 shrink-0" />
                                    }
                                    <div className="w-7 h-7 rounded bg-purple-500/10 border border-purple-500/15 flex items-center justify-center shrink-0">
                                        <FileCode size={12} className="text-purple-400/70" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] font-mono font-medium text-white/70 truncate">
                                                {fix.file}
                                            </span>
                                            <span className={cn(
                                                "text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-widest shrink-0",
                                                fix.bugType === 'SYNTAX' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                                                fix.bugType === 'LOGIC' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                                fix.bugType === 'LINTING' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                fix.bugType === 'TYPE_ERROR' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                fix.bugType === 'IMPORT' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                                                "bg-white/5 text-white/30 border-white/10"
                                            )}>
                                                {fix.bugType}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-white/25 mt-1 truncate italic">
                                            {fix.commitMessage || fix.description || 'No description'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-[9px] font-mono text-white/15">L{fix.line}</span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[9px] font-bold text-red-400/60 flex items-center gap-0.5">
                                                <Minus size={8} />1
                                            </span>
                                            <span className="text-[9px] font-bold text-emerald-400/60 flex items-center gap-0.5">
                                                <Plus size={8} />1
                                            </span>
                                        </div>
                                    </div>
                                </button>

                                {/* Expanded diff content */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="mx-6 mb-4 rounded-md border border-white/[0.06] overflow-hidden bg-[#0a0a0a]">
                                                {viewMode === 'unified' ? (
                                                    <div className="font-mono text-[11px]">
                                                        {diffLines.map((line, li) => (
                                                            <div
                                                                key={li}
                                                                className={cn(
                                                                    "flex items-stretch border-b border-white/[0.02] last:border-0",
                                                                    line.type === 'removed' && "bg-red-500/[0.06]",
                                                                    line.type === 'added' && "bg-emerald-500/[0.06]",
                                                                )}
                                                            >
                                                                <div className="w-12 shrink-0 text-right pr-3 py-1.5 select-none border-r border-white/[0.04]">
                                                                    <span className="text-[10px] text-white/10">{line.num}</span>
                                                                </div>
                                                                <div className="w-6 shrink-0 flex items-center justify-center border-r border-white/[0.04]">
                                                                    {line.type === 'removed' && <Minus size={9} className="text-red-400/60" />}
                                                                    {line.type === 'added' && <Plus size={9} className="text-emerald-400/60" />}
                                                                </div>
                                                                <div className={cn(
                                                                    "flex-1 px-4 py-1.5",
                                                                    line.type === 'removed' && "text-red-300/50",
                                                                    line.type === 'added' && "text-emerald-300/50",
                                                                    line.type === 'context' && "text-white/20",
                                                                )}>
                                                                    {line.content}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    /* Split view */
                                                    <div className="font-mono text-[11px] grid grid-cols-2 divide-x divide-white/[0.06]">
                                                        {/* Left: original */}
                                                        <div>
                                                            <div className="px-3 py-1.5 border-b border-white/[0.06] bg-white/[0.02]">
                                                                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Original</span>
                                                            </div>
                                                            {diffLines.filter(l => l.type !== 'added').map((line, li) => (
                                                                <div key={li} className={cn(
                                                                    "flex items-stretch border-b border-white/[0.02] last:border-0",
                                                                    line.type === 'removed' && "bg-red-500/[0.06]",
                                                                )}>
                                                                    <div className="w-10 shrink-0 text-right pr-2 py-1.5 border-r border-white/[0.04]">
                                                                        <span className="text-[10px] text-white/10">{line.num}</span>
                                                                    </div>
                                                                    <div className={cn(
                                                                        "flex-1 px-3 py-1.5",
                                                                        line.type === 'removed' ? "text-red-300/50" : "text-white/20",
                                                                    )}>
                                                                        {line.content}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {/* Right: modified */}
                                                        <div>
                                                            <div className="px-3 py-1.5 border-b border-white/[0.06] bg-white/[0.02]">
                                                                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Modified</span>
                                                            </div>
                                                            {diffLines.filter(l => l.type !== 'removed').map((line, li) => (
                                                                <div key={li} className={cn(
                                                                    "flex items-stretch border-b border-white/[0.02] last:border-0",
                                                                    line.type === 'added' && "bg-emerald-500/[0.06]",
                                                                )}>
                                                                    <div className="w-10 shrink-0 text-right pr-2 py-1.5 border-r border-white/[0.04]">
                                                                        <span className="text-[10px] text-white/10">{line.num}</span>
                                                                    </div>
                                                                    <div className={cn(
                                                                        "flex-1 px-3 py-1.5",
                                                                        line.type === 'added' ? "text-emerald-300/50" : "text-white/20",
                                                                    )}>
                                                                        {line.content}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
