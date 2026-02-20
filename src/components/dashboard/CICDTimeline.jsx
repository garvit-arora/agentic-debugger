import React from "react";
import { useAgentStore } from "@/store/useAgentStore";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Play,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";

export function CICDTimeline() {
  const timeline = useAgentStore((state) => state.timeline);
  const isRunning = useAgentStore((state) => state.run.isRunning);

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="bg-[#050505] border border-white/[0.15] rounded-md overflow-hidden shadow-2xl flex flex-col h-full">
      <div className="px-6 py-4 border-b border-white/[0.15] bg-white/[0.04] flex items-center justify-between shrink-0">
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80 flex items-center gap-2">
          <Activity size={14} className="text-emerald-500" />
          Pipeline Telemetry
        </h3>
        <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest">
          REAL_TIME_STREAM
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="relative">
          {/* Vertical Connector Line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-white/[0.12]" />

          {timeline.length === 0 && !isRunning && (
            <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-30">
              <Clock size={32} />
              <span className="text-[10px] uppercase tracking-[0.4em] font-black">
                Awaiting Stream
              </span>
            </div>
          )}

          <div className="space-y-10">
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-10">
                {/* Status Marker Dot */}
                <div
                  className={cn(
                    "absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 bg-black z-10 flex items-center justify-center",
                    item.status === "passed"
                      ? "border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                      : item.status === "failed"
                        ? "border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]"
                        : "border-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.3)]",
                  )}>
                  {item.status === "passed" ? (
                    <CheckCircle2 size={8} className="text-emerald-500" />
                  ) : (
                    <XCircle size={8} className="text-red-500" />
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] font-black text-white/80 uppercase tracking-widest">
                        Iteration {item.iteration}
                      </span>
                      <span
                        className={cn(
                          "text-[9px] font-black px-2 py-0.5 rounded-sm border uppercase tracking-widest",
                          item.status === "passed"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20",
                        )}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-white/40">
                      {formatTime(item.timestamp)}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/70 leading-relaxed font-medium">
                    {item.message ||
                      `Automated verification completed with status: ${item.status}`}
                  </p>
                  {item.duration && (
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-white/50 font-bold">
                        <Clock size={10} />
                        {item.duration}s
                      </div>
                      <div className="h-3 w-[1px] bg-white/5" />
                      <a
                        href="#"
                        className="flex items-center gap-1.5 text-[10px] text-blue-500/60 hover:text-blue-500 transition-colors font-bold uppercase tracking-widest">
                        <ExternalLink size={10} />
                        View Workflow
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {isRunning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative pl-10">
                <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-blue-500 bg-black z-10 flex items-center justify-center shadow-[0_0_8px_rgba(59,130,246,0.3)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[12px] font-black text-blue-500 uppercase tracking-widest">
                    Active Processing...
                  </span>
                  <span className="text-[10px] text-white/20 font-medium">
                    Synthesizing iteration {timeline.length + 1}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
