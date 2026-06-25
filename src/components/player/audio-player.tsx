"use client"

import { useRef, useState, useEffect, useCallback, useMemo } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { formatDuration } from "@/lib/format"
import { buildStreamUrl } from "@/lib/api"
import type { FileEntry } from "@/types"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  ListMusic,
  X,
  ChevronDown,
  ChevronUp,
  Disc3,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface AudioPlayerProps {
  files: FileEntry[]
  initialIndex?: number
}

type RepeatMode = "none" | "all" | "one"

function extractTitle(filename: string): string {
  return filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ")
}

function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 60%, 40%)`
}

function stringToColor2(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0
  }
  const hue = (Math.abs(hash) + 180) % 360
  return `hsl(${hue}, 50%, 30%)`
}

interface AudioPlayerFullProps extends AudioPlayerProps {
  onClose?: () => void
}

export function AudioPlayerFull({ files, initialIndex = 0, onClose }: AudioPlayerFullProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState<RepeatMode>("none")
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSeeking, setIsSeeking] = useState(false)

  const [savedState, setSavedState] = useLocalStorage<{
    index: number
    time: number
    shuffle: boolean
    repeat: RepeatMode
  }>("audio-player-state", { index: 0, time: 0, shuffle: false, repeat: "none" })

  const currentFile = files[currentIndex]
  const title = currentFile ? extractTitle(currentFile.name) : ""

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = volume
  }, [])

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    if (savedState.index < files.length) {
      setCurrentIndex(savedState.index)
      setShuffle(savedState.shuffle)
      setRepeat(savedState.repeat)
    }
  }, [])

  useEffect(() => {
    if (!audioRef.current || currentIndex >= files.length) return
    setError(null)
    setIsLoading(true)
    setCurrentTime(0)
    setDuration(0)
    audioRef.current.src = buildStreamUrl(files[currentIndex].path)
    audioRef.current.load()
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false))
    }
  }, [currentIndex, files])

  useEffect(() => {
    setSavedState({ index: currentIndex, time: currentTime, shuffle, repeat })
  }, [currentIndex, currentTime, shuffle, repeat, setSavedState])

  const playNext = useCallback(() => {
    if (repeat === "one") {
      audioRef.current!.currentTime = 0
      audioRef.current!.play().catch(() => {})
      return
    }
    let next: number
    if (shuffle) {
      next = Math.floor(Math.random() * files.length)
    } else {
      next = (currentIndex + 1) % files.length
    }
    if (next === 0 && repeat === "none") {
      setIsPlaying(false)
      return
    }
    setCurrentIndex(next)
  }, [currentIndex, files.length, shuffle, repeat])

  const playPrev = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.currentTime > 3) {
      audio.currentTime = 0
      return
    }
    let prev: number
    if (shuffle) {
      prev = Math.floor(Math.random() * files.length)
    } else {
      prev = (currentIndex - 1 + files.length) % files.length
    }
    setCurrentIndex(prev)
  }, [currentIndex, files.length, shuffle])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play().catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }, [])

  const handleSeek = (value: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = value
    setCurrentTime(value)
  }

  const toggleShuffle = () => setShuffle((s) => !s)

  const cycleRepeat = () => {
    setRepeat((r) => (r === "none" ? "all" : r === "all" ? "one" : "none"))
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const audio = audioRef.current
      if (!audio) return
      switch (e.key) {
        case " ":
          e.preventDefault()
          togglePlay()
          break
        case "ArrowLeft":
          e.preventDefault()
          audio.currentTime = Math.max(0, audio.currentTime - 10)
          break
        case "ArrowRight":
          e.preventDefault()
          audio.currentTime = Math.min(audio.duration, audio.currentTime + 10)
          break
        case "ArrowUp":
          e.preventDefault()
          audio.volume = Math.min(1, audio.volume + 0.1)
          setVolume(audio.volume)
          break
        case "ArrowDown":
          e.preventDefault()
          audio.volume = Math.max(0, audio.volume - 0.1)
          setVolume(audio.volume)
          break
        case "m":
        case "M":
          e.preventDefault()
          audio.muted = !audio.muted
          setIsMuted(audio.muted)
          break
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [togglePlay])

  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat
  const gradientFrom = currentFile ? stringToColor(currentFile.path) : "#333"
  const gradientTo = currentFile ? stringToColor2(currentFile.path) : "#111"

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }} />

      <audio
        ref={audioRef}
        onLoadedMetadata={() => {
          setDuration(audioRef.current?.duration || 0)
          setIsLoading(false)
          if (savedState.time > 0 && savedState.index === currentIndex && audioRef.current) {
            audioRef.current.currentTime = savedState.time
          }
        }}
        onTimeUpdate={() => {
          if (!isSeeking) setCurrentTime(audioRef.current?.currentTime || 0)
        }}
        onDurationChange={() => setDuration(audioRef.current?.duration || 0)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={playNext}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setError("Unable to play this track")
        }}
        onVolumeChange={() => {
          const a = audioRef.current
          if (a) {
            setVolume(a.volume)
            setIsMuted(a.muted)
          }
        }}
        preload="auto"
      />

      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex items-center justify-between p-4">
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-2">
            <ChevronDown className="w-6 h-6" />
          </button>
          <span className="text-white/50 text-xs">NOW PLAYING</span>
          <button onClick={() => setShowPlaylist(!showPlaylist)} className="text-white/70 hover:text-white transition-colors p-2">
            <ListMusic className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 -mt-12">
          <div
            className="w-64 h-64 md:w-80 md:h-80 rounded-2xl flex items-center justify-center mb-8 shadow-2xl"
            style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
          >
            <Disc3 className="w-32 h-32 text-white/30" />
          </div>

          <h2 className="text-white text-xl font-medium text-center mb-1">{title}</h2>
          <p className="text-white/40 text-sm text-center mb-8">
            {currentFile?.name}
          </p>

          <div className="w-full max-w-md space-y-2">
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              onMouseDown={() => setIsSeeking(true)}
              onMouseUp={() => setIsSeeking(false)}
              className="w-full h-1 appearance-none bg-white/20 rounded-full cursor-pointer accent-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              style={{
                background: `linear-gradient(to right, white ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) ${(currentTime / (duration || 1)) * 100}%)`,
              }}
            />
            <div className="flex justify-between text-white/50 text-xs tabular-nums">
              <span>{formatDuration(currentTime)}</span>
              <span>-{formatDuration(duration - currentTime)}</span>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-6">
            <button onClick={toggleShuffle} className={`transition-colors p-2 ${shuffle ? "text-white" : "text-white/40 hover:text-white/70"}`}>
              <Shuffle className="w-5 h-5" />
            </button>
            <button onClick={playPrev} className="text-white/70 hover:text-white transition-colors p-2">
              <SkipBack className="w-6 h-6" />
            </button>
            <button
              onClick={togglePlay}
              className="bg-white rounded-full p-4 hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 text-black fill-black" />
              ) : (
                <Play className="w-7 h-7 text-black fill-black ml-1" />
              )}
            </button>
            <button onClick={playNext} className="text-white/70 hover:text-white transition-colors p-2">
              <SkipForward className="w-6 h-6" />
            </button>
            <button onClick={cycleRepeat} className={`transition-colors p-2 ${repeat !== "none" ? "text-white" : "text-white/40 hover:text-white/70"}`}>
              <RepeatIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={() => {
                const a = audioRef.current
                if (!a) return
                a.muted = !isMuted
                setIsMuted(!isMuted)
              }}
              className="text-white/50 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const a = audioRef.current
                if (!a) return
                const v = Number(e.target.value)
                a.volume = v
                setVolume(v)
                setIsMuted(v === 0)
              }}
              className="w-24 h-1 appearance-none bg-white/20 rounded-full cursor-pointer accent-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              style={volume > 0 && !isMuted ? {
                background: `linear-gradient(to right, white ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%)`,
              } : undefined}
            />
          </div>
        </div>

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/40">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute inset-y-0 right-0 w-80 z-20 bg-zinc-900/95 backdrop-blur-xl border-l border-white/10 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-white text-sm font-medium">Playlist</h3>
              <button onClick={() => setShowPlaylist(false)} className="text-white/50 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {files.map((file, i) => (
                <button
                  key={file.path}
                  onClick={() => {
                    setCurrentIndex(i)
                    setShowPlaylist(false)
                  }}
                  className={`w-full text-left px-4 py-3 transition-colors hover:bg-white/5 ${
                    i === currentIndex ? "bg-white/10 border-l-2 border-white" : "border-l-2 border-transparent"
                  }`}
                >
                  <p className={`text-sm truncate ${i === currentIndex ? "text-white" : "text-white/60"}`}>
                    {extractTitle(file.name)}
                  </p>
                  <p className="text-xs text-white/30 mt-0.5">{file.name}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function AudioPlayer({ files, initialIndex = 0 }: AudioPlayerProps) {
  const [showFull, setShowFull] = useState(false)

  return (
    <>
      {!showFull && files.length > 0 && (
        <AudioPlayerFull files={files} initialIndex={initialIndex} onClose={() => setShowFull(false)} />
      )}
    </>
  )
}
