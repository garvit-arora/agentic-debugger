import React from 'react'
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Cloud, Cpu } from "lucide-react"

export function ModeToggle({ value, onChange }) {
  return (
    <div className="flex gap-4">
      <div 
        onClick={() => onChange('api')}
        className={cn(
            "flex-1 cursor-pointer relative overflow-hidden rounded-sm border p-4 transition-all duration-300",
            value === 'api' 
            ? "bg-white/[0.08] border-white/20" 
            : "bg-transparent border-white/[0.05] hover:border-white/10"
        )}
      >
        <div className="flex items-center gap-3">
             <div className={cn("transition-colors", value === 'api' ? "text-white" : "text-[#444444]")}>
                 <Cloud size={16} />
             </div>
             <div>
                <h3 className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", value === 'api' ? "text-white" : "text-[#444444]")}>Compute Instance</h3>
             </div>
        </div>
      </div>

      <div 
        onClick={() => onChange('webllm')}
        className={cn(
            "flex-1 cursor-pointer relative overflow-hidden rounded-sm border p-4 transition-all duration-300",
            value === 'webllm' 
            ? "bg-white/[0.08] border-white/20" 
            : "bg-transparent border-white/[0.05] hover:border-white/10"
        )}
      >
        <div className="flex items-center gap-3">
             <div className={cn("transition-colors", value === 'webllm' ? "text-white" : "text-[#444444]")}>
                 <Cpu size={16} />
             </div>
             <div>
                <h3 className={cn("text-[10px] font-bold uppercase tracking-widest transition-colors", value === 'webllm' ? "text-white" : "text-[#444444]")}>Local Synthesis</h3>
             </div>
        </div>
      </div>
    </div>
  )
}
