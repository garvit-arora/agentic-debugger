import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input, Label } from "@/components/ui/input"
import { Calculator } from 'lucide-react'

export function ScoringSandbox() {
  const [inputs, setInputs] = useState({
    timeTakenSeconds: 45,
    commitsCount: 12
  })

  // Calculation Logic (same as useAgentStore for consistency)
  const base = 100
  const speedBonus = Math.max(0, Math.floor((300 - inputs.timeTakenSeconds) / 2))
  const commitPenalty = inputs.commitsCount * 0.5
  const total = Math.max(0, Math.round(base + speedBonus - commitPenalty))

  return (
    <Card className="bg-[#080808] border border-white/[0.05] rounded-sm overflow-hidden">
      <CardHeader className="p-5 border-b border-white/[0.05] bg-white/[0.01]">
        <div className="flex items-center gap-3">
          <Calculator size={14} className="text-[#444444]" />
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888]">Strategy Simulator</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label className="text-[10px] uppercase font-bold text-[#444444] tracking-widest">Duration (Seconds)</Label>
            <Input 
              type="number"
              value={inputs.timeTakenSeconds}
              onChange={(e) => setInputs(prev => ({ ...prev, timeTakenSeconds: parseInt(e.target.value) || 0 }))}
              className="bg-white/[0.02] border-white/[0.05] h-10 rounded-sm text-xs focus:border-white/20 transition-all font-mono"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-[10px] uppercase font-bold text-[#444444] tracking-widest">Commit Density</Label>
            <Input 
              type="number"
              value={inputs.commitsCount}
              onChange={(e) => setInputs(prev => ({ ...prev, commitsCount: parseInt(e.target.value) || 0 }))}
              className="bg-white/[0.02] border-white/[0.05] h-10 rounded-sm text-xs focus:border-white/20 transition-all font-mono"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-white/[0.05] space-y-3">
          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-[#333333]">
            <span>Baseline</span>
            <span>{base}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-white">
            <span>Optimization</span>
            <span>+{speedBonus}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold text-[#444444]">
            <span>Overhead</span>
            <span>-{commitPenalty}</span>
          </div>
          <div className="pt-4 flex justify-between items-center border-t border-white/[0.05]">
            <span className="text-[11px] font-bold text-white uppercase tracking-[0.2em]">Estimated Rating</span>
            <span className="text-xl font-light text-white tracking-tighter">{total}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
