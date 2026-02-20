import React, { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { useAgentStore } from "@/store/useAgentStore";
import {
  Terminal,
  Code2,
  FolderOpen,
  FileCode,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function SandboxPanel() {
  const isRunning = useAgentStore((state) => state.run.isRunning);
  const branchName = useAgentStore((state) => state.run.branchName);
  const timeline = useAgentStore((state) => state.timeline);
  const files = useAgentStore((state) => state.run.files);
  const activeFile = useAgentStore((state) => state.run.activeFile);
  const setActiveFile = useAgentStore((state) => state.setActiveFile);
  const lastLog = useAgentStore((state) => state.run.lastLog);
  const terminalRef = useRef(null);
  const terminalUserScrolled = useRef(false);

  const handleTerminalScroll = () => {
    const el = terminalRef.current;
    if (!el) return;
    terminalUserScrolled.current =
      el.scrollHeight - el.scrollTop - el.clientHeight > 60;
  };

  // Auto-scroll terminal only when user is at the bottom
  useEffect(() => {
    const el = terminalRef.current;
    if (el && !terminalUserScrolled.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [timeline]);

  return (
    <Card className="h-full bg-[#050505] border-white/[0.12] flex flex-col overflow-hidden font-mono text-sm relative rounded-lg group">
      {/* Title bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.12] bg-black/40 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
          </div>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/60">
            Workbench Session
          </span>
        </div>
        <div className="flex items-center gap-6">
          {isRunning && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 text-[9px] uppercase tracking-[0.2em] font-bold border border-blue-500/20 rounded-md">
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-400"></span>
              </span>
              Kernel Active
            </div>
          )}
          <span className="text-[10px] font-bold text-white/40 font-mono tracking-widest">
            {branchName || "NULL_SESSION"}
          </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0 bg-[#000000]">
        {/* ── File Tree Sidebar ─────────────────────────── */}
        <div className="w-64 border-r border-white/[0.12] bg-[#030303] hidden lg:flex flex-col">
          <div className="px-6 py-5 border-b border-white/[0.10]">
            <div className="text-[9px] text-white/50 font-bold uppercase tracking-[0.3em] flex items-center gap-2">
              <FolderOpen size={11} className="text-blue-500/70" /> Explorer
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-1">
            {files.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-3 opacity-40">
                <Code2 size={18} />
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-center">
                  No files
                  <br />
                  discovered
                </span>
              </div>
            ) : (
              files.map((filePath, i) => {
                const fileName = filePath.split("/").pop();
                const isActive = activeFile === filePath;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveFile(filePath)}
                    className={cn(
                      "w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[11px] transition-all",
                      isActive
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/15"
                        : "text-white/50 hover:text-white/70 hover:bg-white/[0.04] border border-transparent",
                    )}>
                    <FileCode
                      size={12}
                      className={
                        isActive ? "text-blue-400/70" : "text-white/30"
                      }
                    />
                    <span className="truncate font-medium">{fileName}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Main Content Area ─────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#020202]">
          {/* Code/Workspace visual area */}
          <div className="flex-1 p-10 lg:p-14 border-b border-white/[0.10] overflow-hidden flex flex-col items-center justify-center relative">
            <AnimatePresence>
              {isRunning ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-10 w-full max-w-lg">
                  <div className="grid grid-cols-12 gap-2 w-full">
                    {[...Array(24)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          opacity: [0.1, 0.4, 0.1],
                          backgroundColor:
                            i % 3 === 0
                              ? "rgba(255,255,255,0.1)"
                              : "rgba(255,255,255,0.03)",
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.05,
                        }}
                        className="h-1.5 rounded-full col-span-2 md:col-span-1"
                      />
                    ))}
                  </div>
                  <div className="text-center space-y-3">
                    <div className="text-[10px] text-white/40 uppercase tracking-[0.5em] font-light animate-pulse">
                      Synthesizing Code Resolution Layer...
                    </div>
                    {lastLog && (
                      <div className="text-[10px] text-blue-400/70 font-medium max-w-md truncate">
                        {lastLog}
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : activeFile ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center space-y-4">
                  <FileCode size={32} className="text-white/[0.15] mx-auto" />
                  <div className="text-[11px] font-mono text-white/40 break-all max-w-md">
                    {activeFile}
                  </div>
                  <div className="text-[9px] text-white/25 uppercase tracking-[0.3em]">
                    Selected file preview
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Large Background Glyph */}
            <div className="absolute pointer-events-none select-none text-[250px] font-bold text-white/[0.03] transition-all group-hover:text-white/[0.05]">
              RIFT
            </div>
          </div>

          {/* ── Terminal Output ────────────────────────────── */}
          <div
            ref={terminalRef}
            onScroll={handleTerminalScroll}
            className="h-64 px-8 py-6 bg-black flex flex-col font-mono text-[11px] overflow-y-auto custom-scrollbar border-t border-white/[0.12]">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/[0.10]">
              <Terminal size={12} className="text-white/40" />
              <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/40">
                Terminal Output
              </span>
            </div>
            <div className="flex-1 space-y-3">
              {timeline.length === 0 && !isRunning && (
                <div className="text-white/[0.25] text-[10px] py-8 text-center uppercase tracking-[0.3em]">
                  Awaiting agent execution...
                </div>
              )}
              {timeline.map((item, i) => (
                <div key={i} className="flex gap-4 group/log">
                  <span className="text-white/30 font-bold shrink-0 tabular-nums">
                    [
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour12: false,
                    })}
                    ]
                  </span>
                  <span
                    className={cn(
                      "group-hover/log:text-white/80 transition-colors leading-relaxed",
                      item.status === "failed"
                        ? "text-red-500/70"
                        : "text-white/60",
                    )}>
                    $ {item.message}
                  </span>
                </div>
              ))}
              {isRunning && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-white/20">$</span>
                  <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-4 bg-blue-400/60"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
