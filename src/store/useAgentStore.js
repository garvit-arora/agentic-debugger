import { create } from 'zustand'

export const useAgentStore = create((set, get) => ({
  // Inputs
  inputs: {
    repoUrl: '',
    teamName: '',
    leaderName: '',
    mode: 'api',
  },

  // Run State
  run: {
    runId: null,
    branchName: null,
    isRunning: false,
    connectionStatus: 'idle',
    completedAt: null,
    files: [],
    activeFile: null,
    lastLog: null,
  },

  // Analysis Summary
  summary: {
    totalFailures: 0,
    totalFixes: 0,
    finalStatus: 'PENDING',
    timeTakenSeconds: 0,
    commitsCount: 0,
    iterationsUsed: 0,
  },

  // Score
  score: {
    base: 100,
    speedBonus: 0,
    commitPenalty: 0,
    total: 100,
  },

  // Lists
  fixes: [],
  timeline: [],

  // UI State
  ui: {
    view: 'landing',
    selectedIteration: null,
    errorMessage: null,
    isDrawerOpen: false,
  },

  // Actions
  setInput: (field, value) =>
    set((state) => ({ inputs: { ...state.inputs, [field]: value } })),

  setMode: (mode) =>
    set((state) => ({ inputs: { ...state.inputs, mode } })),

  initiateRun: () => {
    set({
      run: {
        runId: null,
        branchName: null,
        isRunning: true,
        connectionStatus: 'connecting',
        completedAt: null,
        files: [],
        activeFile: null,
        lastLog: 'Initializing context...',
      },
      summary: {
        totalFailures: 0,
        totalFixes: 0,
        finalStatus: 'PENDING',
        timeTakenSeconds: 0,
        commitsCount: 0,
        iterationsUsed: 0,
      },
      score: { base: 100, speedBonus: 0, commitPenalty: 0, total: 100 },
      fixes: [],
      timeline: [],
      ui: { view: 'run', selectedIteration: null, errorMessage: null, isDrawerOpen: false }
    })
  },

  startRun: (runId, branchName) => {
    set((state) => ({
      run: {
        ...state.run,
        runId,
        branchName,
        connectionStatus: 'streaming',
      }
    }))
  },

  updateFromStream: (event) => {
    const { type, data } = event

    set((state) => {
      const newState = { ...state }

      if (type === 'log') {
        newState.run.lastLog = data.message
      }

      if (type === 'timeline_update') {
        if (data.iteration === 0) return newState;
        const existingIdx = newState.timeline.findIndex(t => t.iteration === data.iteration)
        if (existingIdx >= 0) {
          newState.timeline[existingIdx] = { ...newState.timeline[existingIdx], ...data }
        } else {
          newState.timeline.push(data)
        }
        newState.summary.iterationsUsed = newState.timeline.length
      }

      if (type === 'fix_found') {
        const exists = newState.fixes.some(f => f.file === data.file && f.line === data.line)
        if (!exists) {
          newState.fixes.push(data)
          newState.summary.totalFixes = newState.fixes.length
          newState.run.activeFile = data.file
        }
      }

      if (type === 'files_discovered') {
        newState.run.files = data.files
        if (!newState.run.activeFile && data.files.length > 0) {
          newState.run.activeFile = data.files[0]
        }
      }

      if (type === 'run_complete') {
        newState.run.isRunning = false
        newState.run.connectionStatus = 'completed'
        newState.run.completedAt = Date.now()
        newState.summary.finalStatus = data.status
        newState.summary.timeTakenSeconds = data.timeTaken
        newState.summary.commitsCount = data.commits
        newState.summary.totalFailures = data.totalFailures || newState.summary.totalFailures

        // Final Score Calculation (EXACT HACKATHON FORMULA)
        const baseScore = 100;
        const speedBonus = data.timeTaken < 300 ? 10 : 0;
        const commitPenalty = Math.max(0, data.commits - 20) * 2;
        const total = baseScore + speedBonus - commitPenalty;

        newState.score = { base: baseScore, speedBonus, commitPenalty, total }
      }

      if (type === 'status_change') {
        newState.run.connectionStatus = data.status
      }

      return newState
    })
  },

  selectIteration: (iteration) =>
    set((state) => ({
      ui: { ...state.ui, selectedIteration: iteration, isDrawerOpen: true }
    })),

  setActiveFile: (filePath) =>
    set((state) => ({
      run: { ...state.run, activeFile: filePath }
    })),

  closeDrawer: () =>
    set((state) => ({ ui: { ...state.ui, isDrawerOpen: false } })),

  resetRun: () => set((state) => ({
    ui: { ...state.ui, view: 'landing' },
    inputs: { ...state.inputs, repoUrl: '', teamName: '', leaderName: '' }
  })),
}))
