import { useEffect, useRef } from 'react'
import { useAgentStore } from '../store/useAgentStore'

export function useWebSocketClient(runId, mode) {
  const updateFromStream = useAgentStore((state) => state.updateFromStream)
  const isRunning = useAgentStore((state) => state.run.isRunning)
  const intervalRef = useRef(null)
  const seenFixesRef = useRef(new Set())
  const seenTimelineRef = useRef(new Set())

  useEffect(() => {
    // Only poll if we have a real runId and the engine is marked as running
    if (!runId || !isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    console.log(`[PythonBackendPolling] Starting real-time sync for run ${runId}...`)

    // Initial status update
    updateFromStream({ type: 'status_change', data: { status: 'streaming' } })

    const poll = async () => {
      try {
        const response = await fetch(`/api/status/${runId}`)
        if (response.status === 404) return;
        if (!response.ok) return;

        const data = await response.json()

        // 1. Update Logs / Current Step
        if (data.current_step) {
          updateFromStream({
            type: 'log',
            data: {
              message: `Engine executing: ${data.current_step.toUpperCase()}...`,
              timestamp: new Date().toISOString()
            }
          })
        }

        // 2. Sync Files Discovered
        if (data.source_files && data.source_files.length > 0) {
          updateFromStream({
            type: 'files_discovered',
            data: { files: data.source_files }
          })
        }

        // 3. Sync Real-time Fixes
        if (data.applied_fixes && data.applied_fixes.length > 0) {
          data.applied_fixes.forEach(fix => {
            const fixKey = `${fix.file}:${fix.line}:${fix.bug_type}`;
            if (!seenFixesRef.current.has(fixKey)) {
              updateFromStream({
                type: 'fix_found',
                data: {
                  file: fix.file,
                  bugType: fix.bug_type,
                  line: fix.line,
                  commitMessage: fix.commit_message,
                  description: fix.changes_summary,
                  status: fix.status
                }
              })
              seenFixesRef.current.add(fixKey)
            }
          })
        }

        // 4. Sync Timeline
        if (data.cicd_timeline && data.cicd_timeline.length > 0) {
          data.cicd_timeline.forEach(item => {
            const timelineKey = `${item.iteration}:${item.status}`;
            if (!seenTimelineRef.current.has(timelineKey)) {
              updateFromStream({
                type: 'timeline_update',
                data: {
                  iteration: item.iteration,
                  status: item.status.toLowerCase(),
                  timestamp: item.timestamp,
                  message: item.details || `Iteration ${item.iteration} complete.`,
                }
              })
              seenTimelineRef.current.add(timelineKey)
            }
          })
        }

        // 5. Check for Final Completion
        if (data.status === 'PASSED' || data.status === 'FAILED' || data.status === 'ERROR') {
          // Fetch final detailed result for comprehensive scoring
          const resResponse = await fetch(`/api/results/${runId}`)
          if (resResponse.ok) {
            const fullResult = await resResponse.json()
            updateFromStream({
              type: 'run_complete',
              data: {
                status: fullResult.final_status,
                timeTaken: fullResult.time_taken_seconds || 0,
                commits: fullResult.total_fixes || 0,
                totalFailures: fullResult.total_failures || 0
              }
            })
            if (intervalRef.current) clearInterval(intervalRef.current)
          }
        }
      } catch (err) {
        console.error("Polling sync error:", err)
      }
    }

    // High frequency polling for "real-time" feel (2 seconds)
    intervalRef.current = setInterval(poll, 2000)
    poll() // immediate first call

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [runId, isRunning, updateFromStream])
}
