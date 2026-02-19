import React, { useState, useEffect } from 'react'
import { useAgentStore } from "@/store/useAgentStore"
import { startAgent } from "@/lib/apiClient"
import { Loader2, Globe, Github, Terminal } from "lucide-react"
import { cn } from "@/lib/utils"

export function InputForm({ variant = 'default', className }) {
   const inputs = useAgentStore((state) => state.inputs)
   const setInput = useAgentStore((state) => state.setInput)
   const initiateRun = useAgentStore((state) => state.initiateRun)
   const startRun = useAgentStore((state) => state.startRun)

   const [loading, setLoading] = useState(false)
   const [errors, setErrors] = useState({})

   const githubUrlRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/

   const validate = () => {
      const newErrors = {}
      if (!githubUrlRegex.test(inputs.repoUrl)) {
         newErrors.repoUrl = "Please enter a valid GitHub repository URL"
      }
      if (!inputs.teamName.trim()) {
         newErrors.teamName = "Team name is required"
      }
      if (!inputs.leaderName.trim()) {
         newErrors.leaderName = "Leader name is required"
      }
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
   }

   const handleSubmit = async (e) => {
      e.preventDefault()
      if (!validate()) return

      setLoading(true)
      initiateRun()

      try {
         const { runId, branchName } = await startAgent(inputs)
         startRun(runId, branchName)
      } catch (err) {
         console.error(err)
      } finally {
         setLoading(false)
      }
   }

   const branchPreview = inputs.teamName && inputs.leaderName
      ? `${inputs.teamName.toUpperCase().replace(/\s+/g, '_')}_${inputs.leaderName.toUpperCase().replace(/\s+/g, '_')}_AI_Fix`
      : "TEAM_LEADER_AI_Fix"

   if (variant === 'sidebar') {
      return (
         <div className={cn("w-full space-y-6", className)}>
            <div className="space-y-4">
               <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Target Node</span>
               <div className="p-4 bg-white/[0.03] border border-white/10 rounded-sm break-all">
                  <span className="text-[11px] font-mono text-blue-400 leading-relaxed font-bold">{inputs.repoUrl}</span>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
               <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Branch Created</span>
                  <div className="p-3 bg-white/[0.01] border border-white/5 rounded-sm truncate text-[11px] font-mono text-emerald-500/80">
                     {branchPreview}
                  </div>
               </div>
            </div>
         </div>
      )
   }

   return (
      <div className={cn("w-full", className)}>
         <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-[#050505] border border-white/[0.08] p-8 rounded-md shadow-2xl space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Github size={40} />
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.4em] font-black text-white/20">GitHub Repository URL</label>
                  <div className="relative group">
                     <Globe size={18} className="absolute left-0 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                     <input
                        placeholder="https://github.com/username/repository"
                        className={cn(
                           "w-full bg-transparent border-none outline-none text-xl md:text-2xl font-light tracking-tight text-white pl-8 placeholder:text-white/5",
                           errors.repoUrl && "text-red-400"
                        )}
                        value={inputs.repoUrl}
                        onChange={(e) => setInput('repoUrl', e.target.value)}
                        required
                     />
                  </div>
                  {errors.repoUrl && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">{errors.repoUrl}</p>}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-white/[0.05] pt-8">
                  <div className="space-y-3">
                     <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">Team Name</label>
                     <input
                        placeholder="RIFT_ORGANISERS"
                        className="w-full bg-transparent border-none outline-none text-lg font-light text-white placeholder:text-white/5"
                        value={inputs.teamName}
                        onChange={(e) => setInput('teamName', e.target.value)}
                        required
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">Team Leader Name</label>
                     <input
                        placeholder="SAIYAM_KUMAR"
                        className="w-full bg-transparent border-none outline-none text-lg font-light text-white placeholder:text-white/5"
                        value={inputs.leaderName}
                        onChange={(e) => setInput('leaderName', e.target.value)}
                        required
                     />
                  </div>
               </div>

               <div className="border-t border-white/[0.05] pt-6">
                  <div className="flex items-center justify-between">
                     <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase tracking-[0.2em] text-white/20 font-bold">Branch Generation Preview</span>
                        <span className="text-[11px] font-mono text-emerald-500/40">{branchPreview}</span>
                     </div>
                     <button
                        type="submit"
                        disabled={loading}
                        className="h-12 px-10 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 rounded-sm shadow-lg shadow-white/5"
                     >
                        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Terminal size={14} />}
                        {loading ? "INITIALIZING..." : "RUN AGENT"}
                     </button>
                  </div>
               </div>
            </div>
         </form>
      </div>
   )
}
