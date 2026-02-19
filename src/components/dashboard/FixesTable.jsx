import React, { useState } from 'react'
import { useAgentStore } from "@/store/useAgentStore"
import { cn } from "@/lib/utils"
import {
   FileCode,
   Tag,
   MapPin,
   MessageCircle,
   CheckCircle2,
   AlertCircle,
   Maximize2,
   Filter,
   ArrowUpDown
} from "lucide-react"

export function FixesTable() {
   const fixes = useAgentStore((state) => state.fixes)
   const isRunning = useAgentStore((state) => state.run.isRunning)
   const [filter, setFilter] = useState('')

   const bugTypeColors = {
      'LINTING': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'SYNTAX': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'LOGIC': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      'TYPE_ERROR': 'bg-red-500/10 text-red-400 border-red-500/20',
      'IMPORT': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      'INDENTATION': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      'UNKNOWN': 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'
   }

   const filteredFixes = fixes.filter(f =>
      f.file.toLowerCase().includes(filter.toLowerCase()) ||
      f.bugType.toLowerCase().includes(filter.toLowerCase())
   )

   return (
      <div className="bg-[#050505] border border-white/[0.08] rounded-md overflow-hidden shadow-2xl flex flex-col h-full">
         <div className="px-6 py-4 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
               <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60 flex items-center gap-2">
                  <FileCode size={14} className="text-blue-500" />
                  Resolution Ledger
               </h3>
               <div className="h-4 w-[1px] bg-white/10" />
               <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{fixes.length} ENTRIES</span>
            </div>
            <div className="flex items-center gap-3">
               <div className="relative">
                  <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                     type="text"
                     placeholder="Search patches..."
                     value={filter}
                     onChange={(e) => setFilter(e.target.value)}
                     className="bg-white/[0.03] border border-white/10 rounded-sm pl-8 pr-4 py-1.5 text-[11px] text-white/80 focus:outline-none focus:border-white/20 transition-all w-64"
                  />
               </div>
            </div>
         </div>

         <div className="flex-1 overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
               <thead>
                  <tr className="bg-white/[0.01] border-b border-white/[0.05]">
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">File Path</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Bug Type</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Line</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Commit Message</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Status</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/[0.05]">
                  {filteredFixes.length === 0 ? (
                     <tr>
                        <td colSpan="6" className="px-6 py-20 text-center">
                           <div className="flex flex-col items-center gap-4 opacity-10">
                              <AlertCircle size={32} />
                              <span className="text-[10px] uppercase tracking-[0.5em] font-black">No Patch Identified</span>
                           </div>
                        </td>
                     </tr>
                  ) : (
                     filteredFixes.map((fix, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.01] transition-colors group">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-7 h-7 rounded-[4px] bg-blue-500/5 flex items-center justify-center border border-blue-500/10">
                                    <FileCode size={12} className="text-blue-400/60" />
                                 </div>
                                 <span className="text-[12px] font-medium text-white/80 group-hover:text-white transition-colors truncate max-w-xs">{fix.file}</span>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <span className={cn(
                                 "text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest",
                                 bugTypeColors[fix.bugType] || bugTypeColors['UNKNOWN']
                              )}>
                                 {fix.bugType}
                              </span>
                           </td>
                           <td className="px-6 py-4 font-mono text-[11px] text-white/30">
                              L{fix.line}
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-2 group/msg">
                                 <span className="text-[11px] text-white/40 group-hover/msg:text-white/80 transition-colors italic truncate max-w-sm">"{fix.commitMessage}"</span>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                 {fix.status === 'Fixed' ? (
                                    <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/5 text-emerald-500 border border-emerald-500/20 rounded-sm text-[9px] font-black tracking-widest uppercase">
                                       <CheckCircle2 size={10} />
                                       Applied
                                    </div>
                                 ) : (
                                    <div className="flex items-center gap-2 px-2 py-1 bg-red-500/5 text-red-500 border border-red-500/20 rounded-sm text-[9px] font-black tracking-widest uppercase">
                                       <AlertCircle size={10} />
                                       Failed
                                    </div>
                                 )}
                              </div>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <button className="p-2 hover:bg-white/10 rounded-sm transition-colors text-white/20 hover:text-white">
                                 <Maximize2 size={14} />
                              </button>
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
   )
}
