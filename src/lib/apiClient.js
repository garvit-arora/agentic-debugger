export async function startAgent({ repoUrl, teamName, leaderName }) {
  const response = await fetch('/api/heal-repository', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      repository_url: repoUrl,
      team_name: teamName,
      leader_name: leaderName,
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
