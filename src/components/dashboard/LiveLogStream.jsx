import React, { useEffect, useRef } from "react";
import { useAgentStore } from "@/store/useAgentStore";
import { cn } from "@/lib/utils";
import { Terminal, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const levelColors = {
  info: "text-cyan-400",
  success: "text-emerald-400",
  warn: "text-yellow-400",
  error: "text-red-400",
};

const levelPrefix = {
  info: "INF",
  success: "OK ",
  warn: "WRN",
  error: "ERR",
};

function colorizeMessage(msg) {
  // Highlight key tokens in log messages
  return msg.replace(/\[WebLLM\]/g, "\x1b[36m[WebLLM]\x1b[0m"); // just for display logic below
}

function LogLine({ log, index }) {
  const ts = new Date(log.timestamp).toLocaleTimeString([], {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const level = log.level || "info";

  // Detect level from message content if not explicitly set
  const effectiveLevel =
    log.message?.includes("✔") || log.message?.includes("completed")
      ? "success"
      : log.message?.includes("✖") ||
          log.message?.includes("Failed") ||
          log.message?.includes("error")
        ? "error"
        : log.message?.includes("Warning") || log.message?.includes("Waiting")
          ? "warn"
          : level;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15, delay: 0.02 }}
      className="flex gap-3 py-1 group hover:bg-white/[0.03] px-2 -mx-2 rounded-sm">
      <span className="text-white/30 font-mono text-[10px] shrink-0 tabular-nums select-none">
        {ts}
      </span>
      <span
        className={cn(
          "text-[9px] font-black tracking-wider shrink-0 w-6 select-none",
          levelColors[effectiveLevel],
        )}>
        {levelPrefix[effectiveLevel]}
      </span>
      <span
        className={cn(
          "text-[11px] leading-relaxed font-medium break-all",
          effectiveLevel === "error"
            ? "text-red-300"
            : effectiveLevel === "success"
              ? "text-emerald-300"
              : effectiveLevel === "warn"
                ? "text-yellow-200"
                : "text-white/80",
        )}>
        {log.message}
      </span>
    </motion.div>
  );
}

export function LiveLogStream() {
  const logs = useAgentStore((s) => s.logs);
  const isRunning = useAgentStore((s) => s.run.isRunning);
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const userScrolledUp = useRef(false);

  // Detect if user has scrolled up inside the log container
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    userScrolledUp.current = !atBottom;
  };

  // Auto-scroll only inside the container, and only if user hasn't scrolled up
  useEffect(() => {
    const el = containerRef.current;
    if (el && !userScrolledUp.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [logs.length]);

  return (
    <div className="bg-[#08090a] border border-white/[0.12] rounded-lg overflow-hidden flex flex-col h-full shadow-2xl">
      {/* Header */}
      <div className="px-5 py-3 border-b border-white/[0.12] bg-white/[0.03] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Terminal size={14} className="text-cyan-400" />
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80">
            Live Agent Log
          </h3>
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
            {logs.length} entries
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isRunning && (
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
              </span>
              <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">
                Streaming
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Log body */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4 font-mono space-y-0.5 min-h-[200px] max-h-[400px]">
        {logs.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-3 text-white/20">
            <Terminal size={24} />
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold">
              Awaiting pipeline output…
            </span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {logs.map((log, i) => (
              <LogLine key={i} log={log} index={i} />
            ))}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />

        {/* Blinking cursor */}
        {isRunning && (
          <div className="flex items-center gap-2 pt-2">
            <ChevronRight size={10} className="text-cyan-400" />
            <motion.div
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-2 h-4 bg-cyan-400 rounded-[1px]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
