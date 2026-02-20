import React, { useState, useEffect } from "react";
import { useAgentStore } from "@/store/useAgentStore";
import { startAgent } from "@/lib/apiClient";
import { Loader2, Globe, Github, Terminal, Cpu, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export function InputForm({ variant = "default", className }) {
  const inputs = useAgentStore((state) => state.inputs);
  const setInput = useAgentStore((state) => state.setInput);
  const setMode = useAgentStore((state) => state.setMode);
  const initiateRun = useAgentStore((state) => state.initiateRun);
  const startRun = useAgentStore((state) => state.startRun);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const githubUrlRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;

  const validate = () => {
    const newErrors = {};
    if (!githubUrlRegex.test(inputs.repoUrl)) {
      newErrors.repoUrl = "Please enter a valid GitHub repository URL";
    }
    if (!inputs.teamName.trim()) {
      newErrors.teamName = "Team name is required";
    }
    if (!inputs.leaderName.trim()) {
      newErrors.leaderName = "Leader name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    initiateRun();

    try {
      const { runId, branchName } = await startAgent(inputs);
      startRun(runId, branchName);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const branchPreview =
    inputs.teamName && inputs.leaderName
      ? `${inputs.teamName.toUpperCase().replace(/\s+/g, "_")}_${inputs.leaderName.toUpperCase().replace(/\s+/g, "_")}_AI_Fix`
      : "TEAM_LEADER_AI_Fix";

  if (variant === "sidebar") {
    return (
      <div className={cn("w-full space-y-6", className)}>
        <div className="space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
            Target Node
          </span>
          <div className="p-4 bg-white/[0.06] border border-white/15 rounded-sm break-all">
            <span className="text-[11px] font-mono text-blue-400 leading-relaxed font-bold">
              {inputs.repoUrl}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
              Branch Created
            </span>
            <div className="p-3 bg-white/[0.04] border border-white/10 rounded-sm truncate text-[11px] font-mono text-emerald-400">
              {branchPreview}
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
              LLM Engine
            </span>
            <div
              className={cn(
                "p-3 bg-white/[0.04] border rounded-sm text-[11px] font-mono font-bold uppercase tracking-widest",
                inputs.mode === "webllm"
                  ? "border-blue-500/30 text-blue-400"
                  : "border-white/10 text-white/60",
              )}>
              {inputs.mode === "webllm"
                ? "⚡ WebLLM (Browser GPU)"
                : "☁ Server AI"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-[#080808] border border-white/[0.15] p-8 rounded-md shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Github size={40} />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.4em] font-black text-white/60">
              GitHub Repository URL
            </label>
            <div className="relative group">
              <Globe
                size={18}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-cyan-400 transition-colors"
              />
              <input
                placeholder="https://github.com/username/repository"
                className={cn(
                  "w-full bg-transparent border-none outline-none text-xl md:text-2xl font-light tracking-tight text-white pl-8 placeholder:text-white/30",
                  errors.repoUrl && "text-red-400",
                )}
                value={inputs.repoUrl}
                onChange={(e) => setInput("repoUrl", e.target.value)}
                required
              />
            </div>
            {errors.repoUrl && (
              <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
                {errors.repoUrl}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-white/[0.12] pt-8">
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/60">
                Team Name
              </label>
              <input
                placeholder="RIFT_ORGANISERS"
                className="w-full bg-transparent border-none outline-none text-lg font-light text-white placeholder:text-white/30"
                value={inputs.teamName}
                onChange={(e) => setInput("teamName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/60">
                Team Leader Name
              </label>
              <input
                placeholder="SAIYAM_KUMAR"
                className="w-full bg-transparent border-none outline-none text-lg font-light text-white placeholder:text-white/30"
                value={inputs.leaderName}
                onChange={(e) => setInput("leaderName", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="border-t border-white/[0.12] pt-6 space-y-6">
            {/* ── Mode Toggle: Server AI vs WebLLM ─────────── */}
            <div className="flex items-center gap-4">
              <span className="text-[9px] uppercase tracking-[0.2em] text-white/50 font-bold shrink-0">
                LLM Engine
              </span>
              <div className="flex bg-white/[0.03] border border-white/10 rounded-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setMode("api")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                    inputs.mode === "api"
                      ? "bg-white text-black"
                      : "text-white/30 hover:text-white/50",
                  )}>
                  <Cpu size={12} />
                  Server AI
                </button>
                <button
                  type="button"
                  onClick={() => setMode("webllm")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                    inputs.mode === "webllm"
                      ? "bg-blue-500 text-white"
                      : "text-white/30 hover:text-white/50",
                  )}>
                  <Monitor size={12} />
                  WebLLM (Browser)
                </button>
              </div>
              {inputs.mode === "webllm" && (
                <span className="text-[9px] text-blue-400/60 font-medium italic">
                  Uses your GPU via WebGPU — no API key needed
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-[0.2em] text-white/50 font-bold">
                  Branch Generation Preview
                </span>
                <span className="text-[11px] font-mono text-emerald-400/80">
                  {branchPreview}
                </span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="h-12 px-10 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 rounded-sm shadow-lg shadow-white/5">
                {loading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Terminal size={14} />
                )}
                {loading ? "INITIALIZING..." : "RUN AGENT"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
