"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { formatDuration } from "@/lib/format"
import type { WatchProgress } from "@/types"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture2,
  SkipBack,
  SkipForward,
  RotateCcw,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface VideoPlayerProps {
  src: string
  title: string
  thumbnail?: string
}

const PLAYBACK_SPEEDS = [0.5, 1, 1.5, 2]

export function VideoPlayer({ src, title, thumbnail }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [showResumePrompt, setShowResumePrompt] = useState(false)
  const [savedProgress, setSavedProgress] = useState<WatchProgress | null>(null)
  const [isSeeking, setIsSeeking] = useState(false)

  const [progressMap, setProgressMap] = useLocalStorage<Record<string, WatchProgress>>("video-progress", {})

  const videoSrc = src

  useEffect(() => {
    const saved = progressMap[src]
    if (saved && saved.time > 5) {
      setSavedProgress(saved)
      setShowResumePrompt(true)
    }
  }, [src, progressMap])

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    if (isPlaying) {
      hideTimerRef.current = setTimeout(() => setShowControls(false), 3000)
    }
  }, [isPlaying])

  const saveProgress = useCallback(() => {
    if (!videoRef.current || duration === 0) return
    const time = videoRef.current.currentTime
    setProgressMap((prev) => ({
      ...prev,
      [src]: { path: src, time, duration, updated: Date.now() },
    }))
  }, [src, duration, setProgressMap])

  useEffect(() => {
    if (!isPlaying || duration === 0) return
    saveTimerRef.current = setInterval(saveProgress, 5000)
    return () => clearInterval(saveTimerRef.current)
  }, [isPlaying, duration, saveProgress])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const video = videoRef.current
      if (!video) return

      switch (e.key) {
        case " ":
          e.preventDefault()
          togglePlay()
          break
        case "f":
        case "F":
          e.preventDefault()
          toggleFullscreen()
          break
        case "ArrowLeft":
          e.preventDefault()
          video.currentTime = Math.max(0, video.currentTime - 10)
          break
        case "ArrowRight":
          e.preventDefault()
          video.currentTime = Math.min(video.duration, video.currentTime + 10)
          break
        case "ArrowUp":
          e.preventDefault()
          video.volume = Math.min(1, video.volume + 0.1)
          setVolume(video.volume)
          break
        case "ArrowDown":
          e.preventDefault()
          video.volume = Math.max(0, video.volume - 0.1)
          setVolume(video.volume)
          break
        case "m":
        case "M":
          e.preventDefault()
          video.muted = !video.muted
          setIsMuted(video.muted)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [])

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  const togglePiP = useCallback(async () => {
    const video = videoRef.current
    if (!video) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else {
        await video.requestPictureInPicture()
      }
    } catch {
    }
  }, [])

  const handleResume = useCallback(() => {
    if (videoRef.current && savedProgress) {
      videoRef.current.currentTime = savedProgress.time
    }
    setShowResumePrompt(false)
  }, [savedProgress])

  const handleStartOver = useCallback(() => {
    setShowResumePrompt(false)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }
  }, [])

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return
    const v = value[0]
    video.volume = v
    setVolume(v)
    setIsMuted(v === 0)
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative group bg-black overflow-hidden cursor-pointer"
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Loader2 className="w-12 h-12 text-white/60 animate-spin" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-3">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <p className="text-white/80 text-lg">{error}</p>
          <button
            onClick={() => {
              setError(null)
              setIsLoading(true)
              videoRef.current?.load()
            }}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        onLoadedMetadata={() => {
          const video = videoRef.current
          if (!video) return
          setDuration(video.duration)
          setIsLoading(false)
        }}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onTimeUpdate={() => {
          if (!isSeeking) setCurrentTime(videoRef.current?.currentTime || 0)
        }}
        onDurationChange={() => setDuration(videoRef.current?.duration || 0)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => {
          setIsPlaying(false)
          saveProgress()
          setShowControls(true)
        }}
        onError={() => {
          setIsLoading(false)
          setError("Unable to play this video")
        }}
        onVolumeChange={() => {
          const video = videoRef.current
          if (video) {
            setVolume(video.volume)
            setIsMuted(video.muted)
          }
        }}
        onRateChange={() => setPlaybackRate(videoRef.current?.playbackRate || 1)}
        playsInline
        preload="metadata"
      />

      {showResumePrompt && savedProgress && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900/90 rounded-xl p-6 text-center max-w-sm backdrop-blur-sm border border-white/10">
            <p className="text-white text-lg font-medium mb-1">{title}</p>
            <p className="text-zinc-400 text-sm mb-4">
              Resume from {formatDuration(savedProgress.time)}?
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleResume}
                className="px-5 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Resume
              </button>
              <button
                onClick={handleStartOver}
                className="px-5 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showControls && !showResumePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-10 flex flex-col justify-between bg-gradient-to-t from-black/70 via-transparent to-black/40"
          >
            <div className="flex items-center justify-between px-4 pt-3">
              <h2 className="text-white text-sm font-medium truncate max-w-[70%]">{title}</h2>
              <button
                onClick={togglePiP}
                className="text-white/70 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
                title="Picture in Picture"
              >
                <PictureInPicture2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 absolute inset-0 pointer-events-none">
              <button
                onClick={() => {
                  const video = videoRef.current
                  if (video) video.currentTime = Math.max(0, video.currentTime - 10)
                }}
                className="pointer-events-auto text-white/80 hover:text-white transition-colors p-2"
                title="Back 10s"
              >
                <SkipBack className="w-6 h-6" />
              </button>

              <button
                onClick={togglePlay}
                className="pointer-events-auto bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-4 transition-all hover:scale-105"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white fill-white" />
                ) : (
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                )}
              </button>

              <button
                onClick={() => {
                  const video = videoRef.current
                  if (video) video.currentTime = Math.min(video.duration, video.currentTime + 10)
                }}
                className="pointer-events-auto text-white/80 hover:text-white transition-colors p-2"
                title="Forward 10s"
              >
                <SkipForward className="w-6 h-6" />
              </button>
            </div>

            <div className="px-4 pb-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={currentTime}
                  onChange={(e) => handleSeek([Number(e.target.value)])}
                  onMouseDown={() => setIsSeeking(true)}
                  onMouseUp={() => setIsSeeking(false)}
                  className="flex-1 h-1 appearance-none bg-white/20 rounded-full cursor-pointer accent-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                  style={{
                    background: `linear-gradient(to right, white ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) ${(currentTime / (duration || 1)) * 100}%)`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="text-white hover:text-white/80 transition-colors"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                  </button>

                  <div className="flex items-center gap-1.5 text-white/70 text-xs tabular-nums">
                    <span>{formatDuration(currentTime)}</span>
                    <span className="text-white/40">/</span>
                    <span>{formatDuration(duration)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 group/vol">
                    <button
                      onClick={() => {
                        const video = videoRef.current
                        if (!video) return
                        video.muted = !isMuted
                        setIsMuted(!isMuted)
                      }}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange([Number(e.target.value)])}
                      className="w-0 group-hover/vol:w-20 transition-all h-1 appearance-none bg-white/20 rounded-full cursor-pointer accent-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                      style={volume > 0 && !isMuted ? {
                        background: `linear-gradient(to right, white ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%)`,
                      } : undefined}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="text-white/70 hover:text-white transition-colors text-xs px-2 py-1 rounded hover:bg-white/10"
                    >
                      {playbackRate}x
                    </button>
                    {showSpeedMenu && (
                      <div className="absolute bottom-full right-0 mb-2 bg-zinc-900 border border-white/10 rounded-lg overflow-hidden shadow-xl">
                        {PLAYBACK_SPEEDS.map((speed) => (
                          <button
                            key={speed}
                            onClick={() => {
                              const video = videoRef.current
                              if (video) video.playbackRate = speed
                              setPlaybackRate(speed)
                              setShowSpeedMenu(false)
                            }}
                            className={`block w-full px-4 py-1.5 text-xs text-left hover:bg-white/10 transition-colors ${
                              playbackRate === speed ? "text-white" : "text-white/50"
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={toggleFullscreen}
                    className="text-white/70 hover:text-white transition-colors"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
