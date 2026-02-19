"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  Cable,
  CalendarCheck,
  Check,
  Compass,
  Cpu,
  DatabaseZap,
  Menu,
  Pointer,
  Rocket,
  Sparkles,
  Workflow,
  ShieldCheck,
  Zap,
} from "lucide-react";

import Sidebar from "./Sidebar";
import UserMenu from "./UserMenu";
import ProBadge from "./ProBadge";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { cn } from "@/lib/utils";

const STAGE_BLUEPRINT = [
  {
    id: "intent",
    title: "Intent Synthesis",
    description: "Understanding outcomes, constraints, and success metrics.",
    icon: BrainCircuit,
  },
  {
    id: "workflow",
    title: "Workflow Architecture",
    description: "Designing a multi-LLM pipeline and orchestration graph.",
    icon: Workflow,
  },
  {
    id: "integrations",
    title: "Integration Hooks",
    description: "Linking tools, data sources, and API credentials.",
    icon: Cable,
  },
  {
    id: "simulation",
    title: "Agent Simulation",
    description: "Dry-running tasks, generating artifacts, and QA notes.",
    icon: Cpu,
  },
  {
    id: "deployment",
    title: "Deployment & Guardrails",
    description: "Packaging automations with monitors, alerts, and review loops.",
    icon: ShieldCheck,
  },
];

const MODEL_OPTIONS = ["OpenAI GPT-5", "Claude 3.5", "Gemini 2.0", "Llama 4", "Custom Model"];

const CAPABILITY_TAGS = [
  "Memory Fabric",
  "Realtime Collaboration",
  "Human-in-the-loop",
  "Temporal Scheduling",
  "Vector Retrieval",
  "Secure Guardrails",
];

const KNOWLEDGE_CONNECTORS = [
  "Notion",
  "Confluence",
  "Postgres",
  "Snowflake",
  "Slack",
  "Zendesk",
  "REST API",
  "Google Drive",
];

let gsapPromise = null;

const loadGsap = () => {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.gsap) return Promise.resolve(window.gsap);
  if (gsapPromise) return gsapPromise;

  gsapPromise = new Promise((resolve) => {
    const scriptId = "gsap-cdn";
    const existing = document.getElementById(scriptId);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.gsap), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js";
    script.async = true;
    script.onload = () => resolve(window.gsap);
    script.onerror = () => resolve(null);
    document.body.appendChild(script);
  });

  return gsapPromise;
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: "easeOut" },
  }),
};

function formatTime(date) {
  try {
    return new Intl.DateTimeFormat("en", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return date.toLocaleTimeString();
  }
}

function buildSummary(prompt, models, capabilities) {
  const trimmed = prompt.slice(0, 120);
  const modelLabel = models.slice(0, 2).join(" + ") + (models.length > 2 ? "…" : "");
  const capabilityLabel = capabilities.slice(0, 2).join(", ") + (capabilities.length > 2 ? "…" : "");
  return `Blueprint ready • Models: ${modelLabel} • Capabilities: ${capabilityLabel} • "${trimmed}"`;
}

export default function NoCodeAgent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarStateLoaded, setSidebarStateLoaded] = useState(false);
  const [theme, setTheme] = useState("dark");

  const [prompt, setPrompt] = useState("");
  const [activeModels, setActiveModels] = useState(() => MODEL_OPTIONS.slice(0, 3));
  const [selectedCapabilities, setSelectedCapabilities] = useState(() => CAPABILITY_TAGS.slice(0, 3));
  const [selectedConnectors, setSelectedConnectors] = useState(() => KNOWLEDGE_CONNECTORS.slice(0, 4));
  const [automationCadence, setAutomationCadence] = useState("Daily sync");
  const [guardrailMode, setGuardrailMode] = useState("Strict");

  const [pipelineStages, setPipelineStages] = useState(() =>
    STAGE_BLUEPRINT.map((stage) => ({ ...stage, status: "idle", progress: 0 })),
  );
  const [currentRun, setCurrentRun] = useState(null);
  const [promptHistory, setPromptHistory] = useState([]);

  const timersRef = useRef({ timeouts: [], intervals: [] });
  const glowRefs = useRef([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("no-code-sidebar-collapsed");
      if (saved) setSidebarCollapsed(JSON.parse(saved));
    } catch {}
    setSidebarStateLoaded(true);
  }, []);

  useEffect(() => {
    if (!sidebarStateLoaded) return;
    try {
      localStorage.setItem("no-code-sidebar-collapsed", JSON.stringify(sidebarCollapsed));
    } catch {}
  }, [sidebarCollapsed, sidebarStateLoaded]);

  useEffect(() => {
    let ctx;
    let mounted = true;
    const animate = async () => {
      const gsap = await loadGsap();
      if (!gsap || !mounted) return;
      ctx = gsap.context(() => {
        glowRefs.current.forEach((node, index) => {
          if (!node) return;
          gsap.to(node, {
            y: index % 2 === 0 ? 18 : -18,
            scale: 1.05,
            rotate: index % 2 === 0 ? 2 : -2,
            duration: 7 + index,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: index * 0.4,
          });
        });
      });
    };
    animate();
    return () => {
      mounted = false;
      ctx?.revert();
    };
  }, []);

  const stageDurations = useMemo(() => [2300, 2600, 2600, 2400, 2100], []);

  const resetTimers = useCallback(() => {
    timersRef.current.timeouts.forEach((timeout) => clearTimeout(timeout));
    timersRef.current.intervals.forEach((interval) => clearInterval(interval));
    timersRef.current = { timeouts: [], intervals: [] };
  }, []);

  useEffect(() => () => resetTimers(), [resetTimers]);

  const startPipeline = useCallback(
    (runId) => {
      resetTimers();
      setPipelineStages(
        STAGE_BLUEPRINT.map((stage, index) => ({
          ...stage,
          status: index === 0 ? "active" : "pending",
          progress: index === 0 ? 12 : 0,
        })),
      );

      const runStage = (stageIndex) => {
        if (stageIndex >= stageDurations.length) {
          setCurrentRun((prev) =>
            prev && prev.id === runId
              ? { ...prev, status: "completed", completedAt: Date.now(), stageIndex }
              : prev,
          );
          return;
        }

        setCurrentRun((prev) =>
          prev && prev.id === runId ? { ...prev, status: "running", stageIndex } : prev,
        );

        setPipelineStages((prev) =>
          prev.map((stage, index) => {
            if (index < stageIndex) return { ...stage, status: "completed", progress: 100 };
            if (index === stageIndex) {
              return {
                ...stage,
                status: "active",
                progress: Math.max(prev[index].progress, 12),
              };
            }
            return { ...stage, status: "pending", progress: 0 };
          }),
        );

        const interval = window.setInterval(() => {
          setPipelineStages((prev) =>
            prev.map((stage, index) => {
              if (index === stageIndex && stage.status === "active") {
                const increment = Math.random() * 13 + 6;
                const nextProgress = Math.min(stage.progress + increment, 96);
                return { ...stage, progress: nextProgress };
              }
              return stage;
            }),
          );
        }, 420);
        timersRef.current.intervals.push(interval);

        const timeout = window.setTimeout(() => {
          window.clearInterval(interval);
          timersRef.current.intervals = timersRef.current.intervals.filter((n) => n !== interval);

          setPipelineStages((prev) =>
            prev.map((stage, index) => {
              if (index === stageIndex) {
                return { ...stage, status: "completed", progress: 100 };
              }
              if (index === stageIndex + 1) {
                return { ...stage, status: "active", progress: 12 };
              }
              if (index < stageIndex) {
                return { ...stage, status: "completed", progress: 100 };
              }
              return stage;
            }),
          );

          if (stageIndex + 1 < stageDurations.length) {
            runStage(stageIndex + 1);
          } else {
            setCurrentRun((prev) =>
              prev && prev.id === runId
                ? { ...prev, status: "completed", completedAt: Date.now(), stageIndex: stageIndex + 1 }
                : prev,
            );
          }
        }, stageDurations[stageIndex]);
        timersRef.current.timeouts.push(timeout);
      };

      runStage(0);
    },
    [resetTimers, stageDurations],
  );

  useEffect(() => {
    if (!currentRun) return;
    if (currentRun.status !== "completed") return;

    setPromptHistory((prev) =>
      prev.map((entry) =>
        entry.id === currentRun.id
          ? {
              ...entry,
              status: "completed",
              summary: buildSummary(entry.prompt, entry.models, entry.capabilities),
              completedAt: currentRun.completedAt || Date.now(),
            }
          : entry,
      ),
    );

    const timeout = window.setTimeout(() => {
      setCurrentRun((prev) => (prev && prev.id === currentRun.id ? { ...prev, status: "idle" } : prev));
    }, 2400);
    timersRef.current.timeouts.push(timeout);
  }, [currentRun]);

  const handleToggle = (value, list, setter) => {
    setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const handlePromptSubmit = (event) => {
    event.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed) return;
    const runId = Date.now().toString();
    const createdAt = Date.now();

    setPromptHistory((prev) => [
      {
        id: runId,
        prompt: trimmed,
        createdAt,
        status: "running",
        models: [...activeModels],
        capabilities: [...selectedCapabilities],
        connectors: [...selectedConnectors],
        cadence: automationCadence,
        guardrails: guardrailMode,
      },
      ...prev.slice(0, 9),
    ]);

    setPrompt("");
    setCurrentRun({
      id: runId,
      prompt: trimmed,
      status: "queued",
      startedAt: createdAt,
      models: [...activeModels],
      capabilities: [...selectedCapabilities],
    });
    startPipeline(runId);
  };

  const activeStageIndex = pipelineStages.findIndex((stage) => stage.status === "active");

  return (
    <div className="h-screen w-full bg-gradient-to-br from-zinc-950 via-slate-950 to-zinc-900 text-white">
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-white/10 bg-zinc-950/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:border-white/30 hover:bg-white/10"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-sm font-semibold uppercase tracking-wide text-sky-200">
              MercuryAI Studio
            </span>
            <span className="text-base font-semibold text-white">No-Code Agent Builder</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ProBadge />
          <UserMenu theme={theme} setTheme={setTheme} onOpenSettings={() => {}} />
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="relative mx-auto flex h-[calc(100vh-64px)] lg:h-screen w-full max-w-[100vw] xl:max-w-[1600px] 2xl:max-w-[1850px]">
        <Sidebar
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          createNewChat={() => setPrompt("")}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          onHistoryClick={() => {}}
          onExampleSelect={(example) => setPrompt(example)}
          onStartTour={() => {}}
        />

        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div
              ref={(el) => (glowRefs.current[0] = el)}
              className="absolute -left-40 top-32 h-72 w-72 rounded-full bg-sky-500/15 blur-[120px]"
            />
            <div
              ref={(el) => (glowRefs.current[1] = el)}
              className="absolute right-20 top-10 h-80 w-80 rounded-full bg-violet-500/20 blur-[140px]"
            />
            <div
              ref={(el) => (glowRefs.current[2] = el)}
              className="absolute bottom-20 left-32 h-64 w-64 rounded-full bg-blue-500/15 blur-[120px]"
            />
          </div>

          <div className="absolute top-4 right-4 z-20 hidden lg:flex items-center gap-3">
            <Badge className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-200">
              Main Release
            </Badge>
            <ProBadge />
            <UserMenu theme={theme} setTheme={setTheme} onOpenSettings={() => {}} />
          </div>

          <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-16 pt-10 sm:px-6 md:px-8 lg:px-10">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-sky-200">
                  <Sparkles className="h-4 w-4 text-sky-300" />
                  Prompt-to-Production orchestration
                  <Badge className="border-white/20 bg-white/10 text-[10px] text-white/70">
                    Multi-LLM
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold text-white sm:text-4xl">
                  Build end-to-end agents without touching code.
                </h1>
                <p className="max-w-2xl text-sm text-white/70 sm:text-base">
                  Prototype, deploy, and monitor sophisticated automations with natural language. Mercury
                  routes the right LLMs, tools, and human approvals while keeping guardrails intact.
                </p>
              </div>
              <motion.div
                variants={cardVariants}
                initial="initial"
                animate="animate"
                custom={0.1}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-6 py-4 shadow-lg backdrop-blur"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-transparent opacity-60" />
                <div className="relative z-10 flex flex-col gap-1 text-right">
                  <span className="text-xs font-semibold uppercase tracking-wide text-sky-200">
                    Latest completion
                  </span>
                  <span className="text-lg font-semibold text-white">
                    {promptHistory.find((entry) => entry.status === "completed")
                      ? promptHistory.find((entry) => entry.status === "completed")?.summary?.slice(0, 54) + "…"
                      : "Awaiting blueprint"}
                  </span>
                  <span className="text-xs text-white/60">
                    {currentRun?.status === "running"
                      ? "Rendering agent layout…"
                      : promptHistory.length
                      ? "Tap into history below"
                      : "No runs yet"}
                  </span>
                </div>
              </motion.div>
            </div>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.9fr]">
              <motion.div
                variants={cardVariants}
                initial="initial"
                animate="animate"
                custom={0}
                className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_60%)]" />
                <div className="relative flex flex-col gap-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10">
                        <Pointer className="h-4 w-4" />
                      </span>
                      Compose your agent instructions
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <CalendarCheck className="h-4 w-4" />
                      {automationCadence}
                    </div>
                  </div>

                  <form onSubmit={handlePromptSubmit} className="flex flex-col gap-4">
                    <textarea
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      placeholder="Example: Monitor community feedback, cluster themes by sentiment, trigger a response flow with human approval, and publish weekly digest emails."
                      className="min-h-[150px] w-full rounded-3xl border border-white/10 bg-black/30 px-5 py-4 text-sm text-white/90 shadow-inner transition focus:border-sky-400/60 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="submit"
                        className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sky-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={!prompt.trim()}
                      >
                        Launch orchestration
                        <Rocket className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPrompt(
                            "Create a cross-functional launch agent that reads product updates, drafts release notes, aligns marketing copy, and spins up training sessions with calendar invites.",
                          )
                        }
                        className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white"
                      >
                        Use example
                      </button>
                    </div>
                  </form>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">Model Mixer</p>
                        <Badge className="border-sky-400/30 bg-sky-500/15 text-[10px] text-sky-100">
                          Weighted routing
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {MODEL_OPTIONS.map((model) => (
                          <button
                            key={model}
                            type="button"
                            onClick={() => handleToggle(model, activeModels, setActiveModels)}
                            className={cn(
                              "rounded-full border px-3 py-1 text-xs font-semibold transition",
                              activeModels.includes(model)
                                ? "border-sky-400/40 bg-sky-500/20 text-sky-100 shadow"
                                : "border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white/80",
                            )}
                          >
                            {model}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">Capabilities</p>
                        <Badge className="border-violet-400/30 bg-violet-500/15 text-[10px] text-violet-100">
                          Auto-tuned
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {CAPABILITY_TAGS.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleToggle(tag, selectedCapabilities, setSelectedCapabilities)}
                            className={cn(
                              "rounded-full border px-3 py-1 text-xs font-semibold transition",
                              selectedCapabilities.includes(tag)
                                ? "border-violet-400/40 bg-violet-500/20 text-violet-100 shadow"
                                : "border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white/80",
                            )}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">Knowledge Connectors</p>
                        <Badge className="border-emerald-400/30 bg-emerald-500/15 text-[10px] text-emerald-100">
                          Auto-sync
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {KNOWLEDGE_CONNECTORS.map((connector) => (
                          <button
                            key={connector}
                            type="button"
                            onClick={() => handleToggle(connector, selectedConnectors, setSelectedConnectors)}
                            className={cn(
                              "rounded-full border px-3 py-1 text-xs font-semibold transition",
                              selectedConnectors.includes(connector)
                                ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-100 shadow"
                                : "border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white/80",
                            )}
                          >
                            {connector}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">Automation cadence</p>
                            <p className="text-xs text-white/60">
                              Schedule how often this agent executes end-to-end.
                            </p>
                          </div>
                          <Badge className="border-white/15 bg-white/10 text-[10px] text-white/70">
                            {automationCadence}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {["On-demand", "Hourly", "Daily sync", "Weekly"].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => setAutomationCadence(option)}
                              className={cn(
                                "rounded-full border px-3 py-1 text-xs font-semibold transition",
                                automationCadence === option
                                  ? "border-blue-400/40 bg-blue-500/20 text-blue-100 shadow"
                                  : "border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white/80",
                              )}
                            >
                              {option}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">Guardrail policy</p>
                            <p className="text-xs text-white/60">
                              Choose review strictness and escalation frequency.
                            </p>
                          </div>
                          <Badge className="border-white/15 bg-white/10 text-[10px] text-white/70">
                            {guardrailMode}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {["Strict", "Balanced", "Exploratory"].map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => setGuardrailMode(mode)}
                              className={cn(
                                "rounded-full border px-3 py-1 text-xs font-semibold transition",
                                guardrailMode === mode
                                  ? "border-violet-400/40 bg-violet-500/20 text-violet-100 shadow"
                                  : "border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white/80",
                              )}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={cardVariants}
                initial="initial"
                animate="animate"
                custom={0.1}
                className="relative flex h-full flex-col gap-5 overflow-hidden rounded-4xl border border-white/10 bg-black/40 p-6 shadow-2xl backdrop-blur"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.22),transparent_65%)]" />
                <div className="relative flex flex-col gap-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-sky-200">
                        Orchestration timeline
                      </p>
                      <h2 className="text-2xl font-semibold text-white">
                        {currentRun?.status === "running"
                          ? "Compiling your agent blueprint…"
                          : "Awaiting your next run"}
                      </h2>
                      <p className="mt-1 text-sm text-white/60">
                        {currentRun?.prompt
                          ? `"${currentRun.prompt.slice(0, 90)}${
                              currentRun.prompt.length > 90 ? "…" : ""
                            }"`
                          : "Submit a brief to see real-time progress."}
                      </p>
                    </div>
                    <Badge className="border-white/15 bg-white/10 text-[10px] text-white/60">
                      {currentRun?.status === "running"
                        ? `Stage ${Math.min(activeStageIndex + 1, pipelineStages.length)} of ${pipelineStages.length}`
                        : "Idle"}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    {pipelineStages.map((stage, index) => {
                      const Icon = stage.icon;
                      return (
                        <div
                          key={stage.id}
                          className={cn(
                            "rounded-3xl border p-4 transition",
                            stage.status === "completed"
                              ? "border-emerald-400/30 bg-emerald-500/10 shadow-lg"
                              : stage.status === "active"
                              ? "border-sky-400/40 bg-sky-500/10 shadow-lg"
                              : "border-white/10 bg-white/5",
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <span
                                className={cn(
                                  "flex h-10 w-10 items-center justify-center rounded-2xl border text-white transition",
                                  stage.status === "completed"
                                    ? "border-emerald-400/40 bg-emerald-500/20"
                                    : stage.status === "active"
                                    ? "border-sky-400/40 bg-sky-500/20"
                                    : "border-white/10 bg-white/5 text-white/60",
                                )}
                              >
                                {stage.status === "completed" ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-white">{stage.title}</p>
                                <p className="text-xs text-white/60">{stage.description}</p>
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-white/60">
                              {stage.status === "completed"
                                ? "Done"
                                : stage.status === "active"
                                ? `${Math.round(stage.progress)}%`
                                : "Queued"}
                            </span>
                          </div>
                          <div className="mt-3">
                            <Progress
                              value={stage.progress}
                              className={cn(
                                "h-2",
                                stage.status === "completed"
                                  ? "bg-emerald-500/20 [&>div]:bg-emerald-400"
                                  : stage.status === "active"
                                  ? "bg-sky-500/20 [&>div]:bg-sky-400"
                                  : "bg-white/10 [&>div]:bg-white/20",
                              )}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">Output packages</p>
                        <p className="text-xs text-white/60">
                          Agents ship with monitors, dashboards, and handoff docs automatically.
                        </p>
                      </div>
                      <Badge className="border-white/15 bg-white/10 text-[10px] text-white/70">
                        {currentRun?.status === "completed" ? "Ready to review" : "Queued"}
                      </Badge>
                    </div>
                    <div className="mt-4 grid gap-3 text-xs text-white/70 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                        <p className="font-semibold text-white">Playbook & SOPs</p>
                        <p className="text-[11px] text-white/60">Task trees, human checkpoints, escalation flows.</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                        <p className="font-semibold text-white">Connector manifest</p>
                        <p className="text-[11px] text-white/60">Credentials, scopes, and test events documented.</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                        <p className="font-semibold text-white">Monitoring suite</p>
                        <p className="text-[11px] text-white/60">Latency, accuracy, and fallback policies included.</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                        <p className="font-semibold text-white">Stakeholder digest</p>
                        <p className="text-[11px] text-white/60">Narrative summary, KPIs, next recommendations.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <motion.div
                variants={cardVariants}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.2 }}
                custom={0.08}
                className="rounded-4xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-sky-200">Live telemetry</p>
                    <h3 className="text-xl font-semibold text-white">Agent health & observability</h3>
                  </div>
                  <Link
                    href="#"
                    className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white"
                  >
                    Open control room
                  </Link>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {[
                    { label: "Confidence score", value: "0.92", trend: "+0.04 vs last run" },
                    { label: "Avg. response time", value: "2.4s", trend: "-0.6s vs baseline" },
                    { label: "Human approvals", value: "2 / 18 steps", trend: "Auto-routed" },
                    { label: "Knowledge freshness", value: "98%", trend: "Synced 6 mins ago" },
                  ].map((metric) => (
                    <div key={metric.label} className="rounded-3xl border border-white/10 bg-black/25 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                        {metric.label}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-white">{metric.value}</p>
                      <p className="text-xs text-emerald-300/80">{metric.trend}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                variants={cardVariants}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.2 }}
                custom={0.12}
                className="rounded-4xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-sky-200">
                      Prompt history
                    </p>
                    <h3 className="text-xl font-semibold text-white">Recent builds</h3>
                  </div>
                  <Link
                    href="#"
                    className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white"
                  >
                    Export
                  </Link>
                </div>
                <div className="mt-5 space-y-4">
                  {promptHistory.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-white/20 bg-black/20 p-6 text-center text-sm text-white/60">
                      No runs yet. Submit a prompt to generate your first no-code agent.
                    </div>
                  )}
                  {promptHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className={cn(
                        "rounded-3xl border bg-black/25 p-4 transition",
                        entry.status === "completed"
                          ? "border-emerald-400/30"
                          : entry.status === "running"
                          ? "border-sky-400/40"
                          : "border-white/10",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {entry.prompt.slice(0, 120)}
                            {entry.prompt.length > 120 ? "…" : ""}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-white/50">
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                              {entry.models.slice(0, 2).join(" + ")}
                              {entry.models.length > 2 ? " +" : ""}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                              {entry.capabilities.slice(0, 2).join(", ")}
                              {entry.capabilities.length > 2 ? " +" : ""}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                              {entry.guardrails}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 text-xs text-white/60">
                          <span>{formatTime(new Date(entry.createdAt))}</span>
                          <Badge
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                              entry.status === "completed"
                                ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-100"
                                : entry.status === "running"
                                ? "border-sky-400/40 bg-sky-500/20 text-sky-100"
                                : "border-white/15 bg-white/10 text-white/70",
                            )}
                          >
                            {entry.status === "completed"
                              ? "Completed"
                              : entry.status === "running"
                              ? "In progress"
                              : "Queued"}
                          </Badge>
                        </div>
                      </div>
                      {entry.summary && (
                        <p className="mt-3 rounded-2xl border border-white/10 bg-black/30 p-3 text-xs text-white/60">
                          {entry.summary}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-3">
              {[
                {
                  title: "Blueprint versioning",
                  description:
                    "Track every iteration with git-style diffs, prompt change logs, and rollback snapshots.",
                  icon: Compass,
                },
                {
                  title: "Data residency controls",
                  description:
                    "Route inference and storage to compliant regions with per-connector encryption policies.",
                  icon: DatabaseZap,
                },
                {
                  title: "Continuous evaluation",
                  description:
                    "Schedule regression suites, synthetic edge cases, and human scoring for each release channel.",
                  icon: Zap,
                },
              ].map((capability, index) => {
                const Icon = capability.icon;
                return (
                <motion.div
                  key={capability.title}
                  variants={cardVariants}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true, amount: 0.2 }}
                  custom={0.12 + index * 0.04}
                  className="rounded-4xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur transition hover:-translate-y-1 hover:border-sky-400/30 hover:shadow-sky-500/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                        <Icon className="h-5 w-5 text-sky-200" />
                    </span>
                    <div>
                      <p className="text-base font-semibold text-white">{capability.title}</p>
                      <p className="text-sm text-white/70">{capability.description}</p>
                    </div>
                  </div>
                  </motion.div>
                );
              })}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

