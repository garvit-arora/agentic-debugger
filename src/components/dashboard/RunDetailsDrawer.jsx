import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAgentStore } from "@/store/useAgentStore"
import { X, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"

export function RunDetailsDrawer() {
  const isOpen = useAgentStore((state) => state.ui.isDrawerOpen)
  const selectedIteration = useAgentStore((state) => state.ui.selectedIteration)
  const timeline = useAgentStore((state) => state.timeline)
  const closeDrawer = useAgentStore((state) => state.closeDrawer)
  const fixes = useAgentStore((state) => state.fixes)

  // Find data for selected iteration
  const details = timeline.find(t => t.iteration === selectedIteration)
  // Find fixes associated with this step (mock logic: just show all if we don't track iterationId in fixes yet)
  // For better mock, let's filter fixes that happened *around* this time or just show "Fixes in this step" placeholder.
  // I'll just show all fixes for now as a simplification, or maybe none if status passed.

  if (!isOpen || !details) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 h-[70vh] bg-[#0a0a0a] border-t border-white/5 rounded-t-sm z-50 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex flex-col"
          >
             <div className="flex items-center justify-between p-8 border-b border-white/5">
                <div className="flex items-center gap-4">
                   <div className={`w-3 h-3 rounded-full ${details.status === 'passed' ? 'bg-white' : 'bg-red-500'}`} />
                   <div>
                      <h2 className="text-[10px] font-bold text-[#444444] uppercase tracking-[0.3em] mb-1">Investigation Report</h2>
                      <p className="text-xl font-light text-white tracking-tight">Iteration #{details.iteration}: {details.message}</p>
                   </div>
                </div>
                <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={closeDrawer}
                   className="h-10 px-6 border border-white/5 hover:bg-white/5 text-[10px] uppercase font-bold tracking-widest text-white rounded-sm transition-all"
                >
                   Close Shell
                </Button>
             </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-2">
                   <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">System Logs</h3>
                   <div className="bg-black/50 p-4 rounded-xl border border-white/10 font-mono text-xs text-indigo-300 overflow-x-auto whitespace-pre-wrap">
                      {details.rawLog || "No logs available for this step."}
                   </div>
                </div>

                {details.status === 'failed' && (
                   <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Recommended Fixes</h3>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3">
                         <div className="flex items-start gap-3">
                            <div className="h-6 w-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold">AI</div>
                            <div>
                               <p className="text-sm text-white">Analysis suggests a syntax error in the utility module.</p>
                               <p className="text-xs text-slate-400 mt-1">Applying patch to remove unused imports.</p>
                            </div>
                         </div>
                      </div>
                   </div>
                )}
             </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
