"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { formatDuration } from "@/lib/format"
import { Play, Pause, SkipBack, SkipForward, X, Disc3 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface MiniPlayerProps {
  visible: boolean
  title: string
  subtitle?: string
  isPlaying: boolean
  currentTime: number
  duration: number
  onPlayPause: () => void
  onNext: () => void
  onPrev: () => void
  onExpand: () => void
  onClose: () => void
}

export function MiniPlayer({
  visible,
  title,
  subtitle,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onNext,
  onPrev,
  onExpand,
  onClose,
}: MiniPlayerProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          exit={{ y: 80 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-40"
        >
          <div
            onClick={onExpand}
            className="relative bg-zinc-900/80 backdrop-blur-xl border-t border-white/10 cursor-pointer hover:bg-zinc-800/80 transition-colors"
          >
            <div className="absolute top-0 left-0 h-0.5 bg-white/30" style={{ width: `${progress}%` }} />

            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Disc3 className="w-5 h-5 text-white/60" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{title}</p>
                {subtitle && <p className="text-zinc-400 text-xs truncate">{subtitle}</p>}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onPrev()
                  }}
                  className="text-white/60 hover:text-white transition-colors p-1.5"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onPlayPause()
                  }}
                  className="bg-white text-black rounded-full p-2 hover:scale-105 transition-transform"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-black" />
                  ) : (
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onNext()
                  }}
                  className="text-white/60 hover:text-white transition-colors p-1.5"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                className="text-white/40 hover:text-white transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
