import React from 'react'
import { useAgentStore } from "@/store/useAgentStore"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from 'framer-motion'
import { Info, Zap, Scale, Target } from "lucide-react"

export function ScoreBreakdown() {
   const score = useAgentStore((state) => state.score)
   const summary = useAgentStore((state) => state.summary)
   const isRunning = useAgentStore((state) => state.run.isRunning)

   const segments = [
      { label: "Base Score", value: score.base, color: "bg-blue-500", shadow: "shadow-blue-500/20" },
      { label: "Speed Bonus", value: score.speedBonus, color: "bg-emerald-500", shadow: "shadow-emerald-500/20" },
      { label: "Efficiency Penalty", value: -score.commitPenalty, color: "bg-red-500", shadow: "shadow-red-500/20" },
   ]

   const totalPossible = score.base + (score.speedBonus > 0 ? score.speedBonus : 10)

   return (
      <div className="bg-[#050505] border border-white/[0.08] rounded-md overflow-hidden shadow-2xl flex flex-col h-full">
         <div className="px-6 py-4 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60 flex items-center gap-2">
               <Target size={14} className="text-emerald-500" />
               Performance Scorecard
            </h3>
            <div className="text-[10px] font-mono text-white/20">RIFT_S26_EVAL</div>
         </div>

         <div className="p-8 space-y-10 flex-1">
            {/* Horizontal Stacked Bar */}
            <div className="space-y-4">
               <div className="h-4 w-full bg-white/[0.03] rounded-full overflow-hidden flex border border-white/5">
                  {segments.map((seg, i) => (
                     <motion.div
                        key={i}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(0, (seg.value / totalPossible) * 100)}%` }}
                        transition={{ duration: 1, delay: i * 0.2, ease: "circOut" }}
                        className={`${seg.color} h-full relative group`}
                     >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/20" />
                     </motion.div>
                  ))}
               </div>
               <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest px-1">
                  <span className="text-blue-400">Base</span>
                  <span className="text-emerald-400">Bonus</span>
                  <span className="text-red-400">Penalty</span>
               </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-start gap-4 p-4 bg-white/[0.01] border border-white/[0.05] rounded-sm group hover:border-blue-500/30 transition-colors">
                  <Zap size={16} className="text-blue-500 mt-0.5" />
                  <div className="flex-1">
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-bold text-white/50">Base Competency</span>
                        <span className="text-[12px] font-mono font-bold text-white">{score.base} pts</span>
                     </div>
                     <p className="text-[10px] text-white/20 leading-relaxed font-medium">Standard baseline for autonomous repository healing.</p>
                  </div>
               </div>

               <div className="flex items-start gap-4 p-4 bg-white/[0.01] border border-white/[0.05] rounded-sm group hover:border-emerald-500/30 transition-colors">
                  <Zap size={16} className="text-emerald-500 mt-0.5" />
                  <div className="flex-1">
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-bold text-white/50">Speed Multiplier</span>
                        <span className="text-[12px] font-mono font-bold text-emerald-400">+{score.speedBonus} pts</span>
                     </div>
                     <p className="text-[10px] text-white/20 leading-relaxed font-medium">Earned for resolving issues in {summary.timeTakenSeconds}s (threshold &lt; 300s).</p>
                  </div>
               </div>

               <div className="flex items-start gap-4 p-4 bg-white/[0.01] border border-white/[0.05] rounded-sm group hover:border-red-500/30 transition-colors">
                  <Zap size={16} className="text-red-500 mt-0.5" />
                  <div className="flex-1">
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-[11px] font-bold text-white/50">Efficiency Adjustment</span>
                        <span className="text-[12px] font-mono font-bold text-red-400">-{score.commitPenalty} pts</span>
                     </div>
                     <p className="text-[10px] text-white/20 leading-relaxed font-medium">Penalty for {summary.commitsCount} commits (threshold 20).</p>
                  </div>
               </div>
            </div>

            <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Final Weighted Score</span>
                  <motion.span
                     key={score.total}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="text-4xl font-light tracking-tighter text-white"
                  >
                     {score.total}<span className="text-sm text-white/20 font-bold ml-2">/ {totalPossible}</span>
                  </motion.span>
               </div>
               <div className="h-16 w-16 rounded-full border border-white/10 flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                  <Zap size={24} className={cn("text-emerald-500/20 group-hover:text-emerald-500 transition-colors", score.total > 100 && "text-emerald-500 animate-pulse")} />
               </div>
            </div>
         </div>
      </div>
   )
}
