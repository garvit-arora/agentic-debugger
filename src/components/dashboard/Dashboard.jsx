import React from "react";
import { useAgentStore } from "@/store/useAgentStore";
import { useWebLLM } from "@/hooks/useWebLLM";
import { InputForm } from "./InputForm";
import { RunSummaryCard } from "./RunSummaryCard";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { CICDTimeline } from "./CICDTimeline";
import { FixesTable } from "./FixesTable";
import { SandboxPanel } from "./SandboxPanel";
import { DiffViewer } from "./DiffViewer";
import { LiveLogStream } from "./LiveLogStream";
import { cn } from "@/lib/utils";
import { Terminal, Cpu, ShieldCheck, ArrowLeft, Monitor } from "lucide-react";

/* ── Section divider label ─────────────────────────────────── */
const SectionLabel = ({ label, number }) => (
  <div className="flex items-center gap-4 pt-6 pb-2 select-none">
    <span className="text-[10px] font-black text-cyan-400/60 tracking-[0.15em] uppercase shrink-0">
      {number}
    </span>
    <div className="h-px flex-1 bg-gradient-to-r from-white/[0.15] to-transparent" />
    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50 shrink-0">
      {label}
    </span>
    <div className="h-px flex-1 bg-gradient-to-l from-white/[0.15] to-transparent" />
  </div>
);

export function Dashboard() {
  const isRunning = useAgentStore((state) => state.run.isRunning);
  const runId = useAgentStore((state) => state.run.runId);
  const view = useAgentStore((state) => state.ui.view);
  const mode = useAgentStore((state) => state.inputs.mode);
  const resetRun = useAgentStore((state) => state.resetRun);

  // ── WebLLM: activates only when mode='webllm' and a run is active ──
  const { engineStatus, progress: webllmProgress } = useWebLLM(runId);

  const Header = () => (
    <header className="h-16 border-b border-white/[0.15] flex items-center px-6 lg:px-10 justify-between bg-[#0a0a0a]/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {view === "run" && (
          <button
            onClick={resetRun}
            className="p-2 -ml-2 mr-1 hover:bg-white/10 rounded-md transition-colors"
            title="Back">
            <ArrowLeft size={16} className="text-white/50 hover:text-white" />
          </button>
        )}
        <div className="w-10 h-10 bg-cyan-500 flex items-center justify-center rounded-sm shadow-lg shadow-cyan-500/20">
          <Terminal size={24} className="text-black" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-[12px] font-black uppercase tracking-[0.3em] text-white">
            CodeHealer AI
          </h1>
          <span className="text-[9px] text-white/50 font-bold tracking-widest uppercase italic">
            Autonomous CI/CD Agent &middot; RIFT S26
          </span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest group-hover:text-cyan-400 transition-colors">
              Neural Core
            </p>
            <p className="text-[10px] font-black text-white/80">
              V1.0.4-STALKER
            </p>
          </div>
          <Cpu
            size={20}
            className="text-white/40 group-hover:text-cyan-400 transition-colors"
          />
        </div>
        <div className="h-8 w-[1px] bg-white/[0.15]" />
        {mode === "webllm" && (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-sm">
            <Monitor
              size={14}
              className={cn(
                "text-blue-400",
                engineStatus === "loading" && "animate-pulse",
              )}
            />
            <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">
              {engineStatus === "idle" && "WebLLM Idle"}
              {engineStatus === "loading" && `Loading ${webllmProgress}%`}
              {engineStatus === "ready" && "WebLLM Ready"}
              {engineStatus === "error" && "WebLLM Error"}
            </span>
          </div>
        )}
        <button className="flex items-center gap-3 px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-sm hover:bg-emerald-500/20 transition-all group">
          <ShieldCheck size={16} className="text-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
            Security Active
          </span>
        </button>
      </div>
    </header>
  );

  /* ── Landing View ────────────────────────────────────────── */
  if (view === "landing") {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_40%,rgba(56,189,248,0.05)_0%,transparent_50%)]">
          <div className="max-w-4xl w-full py-20">
            <InputForm className="max-w-2xl mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Run View ─────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-black flex flex-col font-sans">
      <Header />

      <main className="flex-1 px-6 lg:px-12 py-10 space-y-14 custom-scrollbar overflow-y-auto">
        {/* ── Section 1: Run Configuration & Summary ────────── */}
        <section>
          <SectionLabel number="01" label="Run Configuration & Summary" />
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mt-6">
            <div className="xl:col-span-5 space-y-8">
              <InputForm
                variant="sidebar"
                className="bg-[#050505] border border-white/[0.08] p-6 rounded-md shadow-xl"
              />
              <RunSummaryCard />
            </div>
            <div className="xl:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
              <ScoreBreakdown />
              <CICDTimeline />
            </div>
          </div>
        </section>

        {/* ── Section 2: Live Agent Log ─────────────────────── */}
        <section>
          <SectionLabel number="02" label="Live Agent Log" />
          <div className="mt-6">
            <LiveLogStream />
          </div>
        </section>

        {/* ── Section 3: Agent Workspace & Terminal ──────────── */}
        <section>
          <SectionLabel number="03" label="Agent Workspace & Terminal" />
          <div className="h-[700px] mt-6">
            <SandboxPanel />
          </div>
        </section>

        {/* ── Section 4: Code Diffs ──────────────────────────── */}
        <section>
          <SectionLabel number="04" label="Code Diffs" />
          <div className="mt-6">
            <DiffViewer />
          </div>
        </section>

        {/* ── Section 5: Applied Patches ─────────────────────── */}
        <section>
          <SectionLabel number="05" label="Applied Patches" />
          <div className="h-[600px] mt-6 pb-10">
            <FixesTable />
          </div>
        </section>
      </main>

      <footer className="h-10 border-t border-white/[0.12] flex items-center px-10 justify-between bg-[#0a0a0a]/80 backdrop-blur-md shrink-0">
        <span className="text-[9px] text-white/30 font-bold tracking-[0.2em] uppercase">
          RIFT Finalist Evaluation Build v1.0.4-delta
        </span>
        <div className="flex gap-6">
          <span className="text-[9px] text-white/30 font-bold uppercase tracking-[0.2em]">
            &copy; 2026 CodeHealer AI
          </span>
          <span className="text-[9px] text-white/30 font-bold uppercase tracking-[0.2em]">
            Distributed Intelligence Collective
          </span>
        </div>
      </footer>
    </div>
  );
}
