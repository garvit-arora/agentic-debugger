/**
 * Base URL for API calls.
 * In local dev the Vite proxy forwards /api → localhost:8000.
 * In production, set VITE_API_BASE_URL to the deployed backend origin.
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export async function startAgent({ repoUrl, teamName, leaderName, mode = 'api' }) {
  const response = await fetch(`${API_BASE}/api/heal-repository`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      repository_url: repoUrl,
      team_name: teamName,
      leader_name: leaderName,
      mode,                       // 'api' | 'webllm'
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to start healing run');
  }

  const data = await response.json();

  // Compute branch name same as backend convention
  const safeTeam = (teamName || 'RIFT').toUpperCase().replace(/\s+/g, '_');
  const safeLeader = (leaderName || 'LEAD').toUpperCase().replace(/\s+/g, '_');
  const branchName = `${safeTeam}_${safeLeader}_AI_Fix`;

  return {
    runId: data.run_id,
    branchName,
  };
}

/* ── WebLLM-mode endpoints ─────────────────────────────────── */

/** Poll for a pending LLM task the backend has queued for client-side WebLLM */
export async function fetchPendingLLMTask(runId) {
  const res = await fetch(`${API_BASE}/api/webllm/pending/${runId}`);
  if (res.status === 204 || res.status === 404) return null;
  if (!res.ok) return null;
  return res.json();
}

/** Submit WebLLM result back to the backend */
export async function submitLLMResult(runId, taskId, result) {
  const res = await fetch(`${API_BASE}/api/webllm/submit/${runId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_id: taskId, result }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to submit LLM result');
  }
  return res.json();
}
