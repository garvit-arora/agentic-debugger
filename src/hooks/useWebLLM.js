/**
 * useWebLLM — browser-side LLM engine powered by @mlc-ai/web-llm (WebGPU).
 *
 * Flow:
 *   1. User toggles "WebLLM" mode in InputForm.
 *   2. Backend clones repo, runs tests, but PAUSES at LLM steps (parse / fix).
 *   3. Backend queues a "pending LLM task" with raw test output or file contents.
 *   4. This hook loads a small model in-browser, polls for pending tasks,
 *      runs the LLM, and POSTs the result back.
 *   5. Backend resumes the pipeline with the client-generated answer.
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { useAgentStore } from '../store/useAgentStore'
import { fetchPendingLLMTask, submitLLMResult } from '../lib/apiClient'

// ── Model configuration ──────────────────────────────────────────
const DEFAULT_MODEL = 'Llama-3.1-8B-Instruct-q4f16_1-MLC'

// ── System prompts (mirror the backend prompts) ──────────────────

const ERROR_PARSING_SYSTEM_PROMPT = `You are an expert CI/CD error parser. Given raw test output, extract EVERY distinct error into a JSON array.
Each object must have: "file" (string), "line" (int), "bug_type" (one of SYNTAX, LOGIC, IMPORT, TYPE, RUNTIME, CONFIG, DEPENDENCY, TEST, UNKNOWN), "description" (string), "suggested_fix" (string).
Return ONLY the JSON array — no markdown fences, no explanation.`

const FIX_GENERATION_SYSTEM_PROMPT = `You are an expert code fixer. Given a source file and a list of errors, produce the COMPLETE fixed file.
Return a JSON object with: "fixed_code" (the full corrected file content), "changes_summary" (brief description of changes), "lines_changed" (array of line numbers changed).
Return ONLY the JSON — no markdown fences, no explanation.`

// ── Hook ─────────────────────────────────────────────────────────

export function useWebLLM(runId) {
    const mode = useAgentStore(s => s.inputs.mode)
    const isRunning = useAgentStore(s => s.run.isRunning)
    const updateFromStream = useAgentStore(s => s.updateFromStream)

    const engineRef = useRef(null)
    const pollRef = useRef(null)
    const busyRef = useRef(false)   // ref to avoid stale-closure races with setInterval

    const [engineStatus, setEngineStatus] = useState('idle')   // idle | loading | ready | error
    const [progress, setProgress] = useState(0)                // 0-100 model download %
    const [currentTask, setCurrentTask] = useState(null)

    // ── 1. Load WebLLM engine when mode = 'webllm' ────────────
    const initEngine = useCallback(async () => {
        if (engineRef.current) return // already loaded

        try {
            setEngineStatus('loading')
            setProgress(0)

            // Dynamic import so the 45 MB wasm blob is only fetched when needed
            const { CreateMLCEngine } = await import('@mlc-ai/web-llm')

            const engine = await CreateMLCEngine(DEFAULT_MODEL, {
                initProgressCallback: (report) => {
                    // report.progress is 0–1
                    const pct = Math.round((report.progress ?? 0) * 100)
                    setProgress(pct)
                    updateFromStream({
                        type: 'log',
                        data: {
                            message: `[WebLLM] Loading model… ${pct}% — ${report.text ?? ''}`,
                            timestamp: new Date().toISOString(),
                        },
                    })
                },
            })

            engineRef.current = engine
            setEngineStatus('ready')
            updateFromStream({
                type: 'log',
                data: {
                    message: '[WebLLM] Model loaded — ready to process tasks locally',
                    timestamp: new Date().toISOString(),
                },
            })
        } catch (err) {
            console.error('[WebLLM] Engine init failed:', err)
            setEngineStatus('error')
            updateFromStream({
                type: 'log',
                data: {
                    message: `[WebLLM] Failed to load model: ${err.message}`,
                    timestamp: new Date().toISOString(),
                },
            })
        }
    }, [updateFromStream])

    // ── 2. Chat helper ─────────────────────────────────────────
    const chat = useCallback(async (systemPrompt, userPrompt) => {
        const engine = engineRef.current
        if (!engine) throw new Error('WebLLM engine not initialized')

        const reply = await engine.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.1,
            max_tokens: 4000,
        })

        return reply.choices[0].message.content
    }, [])

    // ── 3. Parse JSON from LLM output ──────────────────────────
    const parseJSON = useCallback((text) => {
        // Strip possible markdown fences
        let cleaned = text.replace(/```(?:json)?\s*/g, '').replace(/```/g, '').trim()
        try {
            return JSON.parse(cleaned)
        } catch {
            // Try to extract outermost JSON structure
            const arrMatch = cleaned.match(/\[[\s\S]*\]/)
            if (arrMatch) try { return JSON.parse(arrMatch[0]) } catch { /* ignore */ }
            const objMatch = cleaned.match(/\{[\s\S]*\}/)
            if (objMatch) try { return JSON.parse(objMatch[0]) } catch { /* ignore */ }
            throw new Error('WebLLM returned unparseable JSON')
        }
    }, [])

    // ── 4. Process a single LLM task ──────────────────────────
    const processTask = useCallback(async (task) => {
        busyRef.current = true
        setCurrentTask(task.task_id)
        updateFromStream({
            type: 'log',
            data: {
                message: `[WebLLM] Processing task: ${task.task_type} (${task.task_id})`,
                timestamp: new Date().toISOString(),
            },
        })

        let result
        try {
            if (task.task_type === 'error_parse') {
                const raw = await chat(ERROR_PARSING_SYSTEM_PROMPT, task.prompt)
                result = parseJSON(raw)
            } else if (task.task_type === 'fix_generate') {
                const raw = await chat(FIX_GENERATION_SYSTEM_PROMPT, task.prompt)
                result = parseJSON(raw)
            } else {
                // Generic fallback
                const raw = await chat(task.system_prompt || 'You are a helpful assistant.', task.prompt)
                try { result = parseJSON(raw) } catch { result = { text: raw } }
            }

            await submitLLMResult(runId, task.task_id, result)

            updateFromStream({
                type: 'log',
                data: {
                    message: `[WebLLM] ✔ Task ${task.task_id} completed & submitted`,
                    timestamp: new Date().toISOString(),
                },
            })
        } catch (err) {
            console.error('[WebLLM] Task processing error:', err)
            // Submit error so backend can handle gracefully
            await submitLLMResult(runId, task.task_id, { error: err.message }).catch(() => { })
            updateFromStream({
                type: 'log',
                data: {
                    message: `[WebLLM] ✖ Task ${task.task_id} failed: ${err.message}`,
                    timestamp: new Date().toISOString(),
                },
            })
        } finally {
            busyRef.current = false
            setCurrentTask(null)
        }
    }, [runId, chat, parseJSON, updateFromStream])

    // ── 5. Poll loop: check for pending tasks ─────────────────
    useEffect(() => {
        if (mode !== 'webllm' || !runId || !isRunning) {
            if (pollRef.current) clearInterval(pollRef.current)
            return
        }

        // Make sure engine is loaded
        if (engineStatus === 'idle') {
            initEngine()
            return
        }
        if (engineStatus !== 'ready') return

        const doPoll = async () => {
            if (busyRef.current) return // busy — use ref to avoid stale closures
            try {
                const task = await fetchPendingLLMTask(runId)
                if (task) {
                    await processTask(task)
                }
            } catch (err) {
                console.error('[WebLLM] Poll error:', err)
            }
        }

        pollRef.current = setInterval(doPoll, 2000)
        doPoll() // immediate first

        return () => {
            if (pollRef.current) clearInterval(pollRef.current)
        }
    }, [mode, runId, isRunning, engineStatus, initEngine, processTask])

    // ── 6. Clean up on unmount ─────────────────────────────────
    useEffect(() => {
        return () => {
            if (pollRef.current) clearInterval(pollRef.current)
            // Don't unload engine — it's expensive to reload
        }
    }, [])

    return { engineStatus, progress, currentTask, initEngine }
}
