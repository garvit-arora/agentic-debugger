import React from 'react'
import { useAgentStore } from "@/store/useAgentStore"
import { InputForm } from "./InputForm"
import { RunSummaryCard } from "./RunSummaryCard"
import { ScoreBreakdown } from "./ScoreBreakdown"
import { CICDTimeline } from "./CICDTimeline"
import { FixesTable } from "./FixesTable"
import { SandboxPanel } from "./SandboxPanel"
import { DiffViewer } from "./DiffViewer"
import { cn } from "@/lib/utils"
import { Terminal, Cpu, ShieldCheck, Zap, ArrowLeft } from "lucide-react"

/* ── Section divider label ─────────────────────────────────── */
const SectionLabel = ({ label, number }) => (
    <div className="flex items-center gap-4 pt-6 pb-2 select-none">
        <span className="text-[9px] font-black text-white/10 tracking-[0.15em] uppercase shrink-0">
            {number}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-white/[0.06] to-transparent" />
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/15 shrink-0">{label}</span>
        <div className="h-px flex-1 bg-gradient-to-l from-white/[0.06] to-transparent" />
    </div>
)

export function Dashboard() {
    const isRunning = useAgentStore((state) => state.run.isRunning)
    const view = useAgentStore((state) => state.ui.view)
    const resetRun = useAgentStore((state) => state.resetRun)

    const Header = () => (
        <header className="h-16 border-b border-white/[0.08] flex items-center px-6 lg:px-10 justify-between bg-black/60 backdrop-blur-xl sticky top-0 z-50">
            <div className="flex items-center gap-4">
                {view === 'run' && (
                    <button onClick={resetRun} className="p-2 -ml-2 mr-1 hover:bg-white/5 rounded-md transition-colors" title="Back">
                        <ArrowLeft size={16} className="text-white/30 hover:text-white/60" />
                    </button>
                )}
                <div className="w-10 h-10 bg-white flex items-center justify-center rounded-sm">
                    <Terminal size={24} className="text-black" />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-[12px] font-black uppercase tracking-[0.3em] text-white">CodeHealer AI</h1>
                    <span className="text-[9px] text-white/20 font-bold tracking-widest uppercase italic">Autonomous CI/CD Agent &middot; RIFT S26</span>
                </div>
            </div>
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 group cursor-pointer">
                    <div className="text-right hidden sm:block">
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest group-hover:text-blue-500 transition-colors">Neural Core</p>
                        <p className="text-[10px] font-black text-white/60">V1.0.4-STALKER</p>
                    </div>
                    <Cpu size={20} className="text-white/20 group-hover:text-blue-500 transition-colors" />
                </div>
                <div className="h-8 w-[1px] bg-white/[0.08]" />
                <button className="flex items-center gap-3 px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-sm hover:bg-emerald-500/20 transition-all group">
                    <ShieldCheck size={16} className="text-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Security Active</span>
                </button>
            </div>
        </header>
    )

    /* ── Landing View ────────────────────────────────────────── */
    if (view === 'landing') {
        return (
            <div className="min-h-screen bg-black flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_40%,rgba(56,189,248,0.05)_0%,transparent_50%)]">
                    <div className="max-w-4xl w-full space-y-20 py-20">
                        <div className="text-center space-y-6">
                            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-white/30 text-[10px] uppercase font-bold tracking-[0.3em] mb-4">
                                <Zap size={12} className="text-blue-500" />
                                Next-Gen Autonomous Maintenance
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase italic">
                                Heal Your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/40 to-white/10">Pipeline.</span>
                            </h1>
                            <p className="text-white/30 text-sm font-medium tracking-widest uppercase max-w-2xl mx-auto leading-loose">
                                Deploy the industry's most advanced autonomous agent to parse, clone, test, and repair your repository's CI/CD failures with machine precision.
                            </p>
                        </div>
                        <div className="pt-10">
                            <InputForm className="max-w-2xl mx-auto" />
                        </div>
                    </div>
                </div>
            </div>
        )
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
                            <InputForm variant="sidebar" className="bg-[#050505] border border-white/[0.08] p-6 rounded-md shadow-xl" />
                            <RunSummaryCard />
                        </div>
                        <div className="xl:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ScoreBreakdown />
                            <CICDTimeline />
                        </div>
                    </div>
                </section>

                {/* ── Section 2: Agent Workspace & Terminal ──────────── */}
                <section>
                    <SectionLabel number="02" label="Agent Workspace & Terminal" />
                    <div className="h-[700px] mt-6">
                        <SandboxPanel />
                    </div>
                </section>

                {/* ── Section 3: Code Diffs ──────────────────────────── */}
                <section>
                    <SectionLabel number="03" label="Code Diffs" />
                    <div className="mt-6">
                        <DiffViewer />
                    </div>
                </section>

                {/* ── Section 4: Applied Patches ─────────────────────── */}
                <section>
                    <SectionLabel number="04" label="Applied Patches" />
                    <div className="h-[600px] mt-6 pb-10">
                        <FixesTable />
                    </div>
                </section>
            </main>

            <footer className="h-10 border-t border-white/[0.05] flex items-center px-10 justify-between bg-black/40 backdrop-blur-md shrink-0">
                <span className="text-[9px] text-white/10 font-bold tracking-[0.2em] uppercase">RIFT Finalist Evaluation Build v1.0.4-delta</span>
                <div className="flex gap-6">
                    <span className="text-[9px] text-white/10 font-bold uppercase tracking-[0.2em]">&copy; 2026 CodeHealer AI</span>
                    <span className="text-[9px] text-white/10 font-bold uppercase tracking-[0.2em]">Distributed Intelligence Collective</span>
                </div>
            </footer>
        </div>
    )
}
