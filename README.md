# MercuryAI - Autonomous CI/CD Healing Agent Dashboard

This is the frontend dashboard for the **RIFT 2026 Hackathon** entry "MercuryAI". It visualizes an autonomous agent that monitors CI/CD pipelines, detects failures, and pushes fixes in real-time.

**Note:** This is a **frontend-only** implementation. The backend logic is currently simulated with mock data and WebSocket stubs.

## Tech Stack

- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4 (Glassmorphism, Navy Theme)
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Icons:** Lucide React

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── dashboard/       # Feature-specific components (Timeline, Sandbox, etc.)
│   │   ├── layout/          # Global layout shell
│   │   └── ui/              # Reusable primitives (Buttons, Cards, Inputs)
│   ├── hooks/               # Custom hooks (useWebSocketClient)
│   ├── lib/                 # Utilities (apiClient, cn)
│   ├── store/               # Global Zustand store
│   └── App.jsx              # Main application logic
```

## Features & Components

- **Landing Page:** Configure your team and repo. Starts the "healing" process.
- **Real-time Sandbox:** Visualizes the agent's "thought process" and terminal logs.
- **CI/CD Timeline:** Interactive timeline of pipeline steps (Lint, Test, Fix).
- **Fixes Table:** Detailed log of bugs found and patches applied.
- **Scoring System:** 
  - **Base Score:** 100
  - **Speed Bonus:** +10 if under 5 minutes.
  - **Commit Penalty:** -2 for every commit over 20.
  - Use the *Scoring Simulator* in the dashboard to test this logic.

## Backend Integration Points

To connect this frontend to a real backend:

1.  **Start Agent:**
    -   Update `src/lib/apiClient.js` to POST to your real endpoint (e.g., `/api/run-agent`).
    -   Expected payload: `{ repoUrl, teamName, leaderName, mode }`.
    -   Expected response: `{ runId, branchName }`.

2.  **Streaming Updates:**
    -   Update `src/hooks/useWebSocketClient.js` to connect to `ws://your-backend/ws/{runId}`.
    -   Listen for events: `log`, `timeline_update`, `fix_found`, `run_complete`.

## Enforcement Rules (Hackathon)

The dashboard helps enforce:
-   **Branch Naming:** Automatically generated as `TEAM_LEADER_AI_Fix`.
-   **Commit Messages:** Fixes are tagged with `[AI-AGENT]`.
-   **No Hardcoded Paths:** The UI is agnostic to the repo structure; it displays what the agent discovers.

## Setup & Run

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Run development server:
    ```bash
    npm run dev
    ```

3.  Build for production:
    ```bash
    npm run build
    ```
