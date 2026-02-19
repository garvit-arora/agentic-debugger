import React from 'react'
import { motion } from 'framer-motion'

export function Preloader() {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-[#000000] flex items-center justify-center cursor-none"
    >
      <div className="relative flex flex-col items-center gap-8">
        {/* Minimal sound-like visual: Waveform spikes */}
        <div className="flex items-end gap-1 h-8">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                height: [4, Math.random() * 20 + 8, 4],
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "easeInOut"
              }}
              className="w-[2px] bg-white opacity-20"
            />
          ))}
        </div>

        {/* Minimal pulsing circle */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-1 h-1 bg-white rounded-full"
        />

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.5, duration: 2 }}
          className="text-[10px] uppercase tracking-[0.4em] font-light text-white"
        >
          Synchronizing Layer
        </motion.div>
      </div>
    </motion.div>
  )
}
