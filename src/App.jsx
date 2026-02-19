import React from 'react'
import { Dashboard } from "@/components/dashboard/Dashboard"
import { RunDetailsDrawer } from "@/components/dashboard/RunDetailsDrawer"
import { useAgentStore } from "@/store/useAgentStore"
import { useWebSocketClient } from "@/hooks/useWebSocketClient"
import { AnimatePresence } from "framer-motion"
import { Preloader } from "@/components/layout/Preloader"

function App() {
   const runId = useAgentStore((state) => state.run.runId)
   const mode = useAgentStore((state) => state.inputs.mode)
   const [isAppLoaded, setIsAppLoaded] = React.useState(false)

   // Initialize WebSocket polling
   useWebSocketClient(runId, mode)

   // Initial loading simulation
   React.useEffect(() => {
      const timer = setTimeout(() => setIsAppLoaded(true), 2000)
      return () => clearTimeout(timer)
   }, [])

   return (
      <div className="bg-black min-h-screen">
         <AnimatePresence>
            {!isAppLoaded && <Preloader key="preloader" />}
         </AnimatePresence>

         {isAppLoaded && (
            <>
               <Dashboard />
               <RunDetailsDrawer />
            </>
         )}
      </div>
   )
}

export default App
