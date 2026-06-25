"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Film, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { buildThumbUrl, buildStreamUrl } from "@/lib/api"
import type { FileEntry, WatchProgress } from "@/types"

interface VideoCardProps {
  video: FileEntry
  index: number
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function formatDate(d: Date | string): string {
  const date = new Date(d)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString()
}

function getProgress(path: string): WatchProgress | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem("watch-progress")
    if (!raw) return null
    const map: Record<string, WatchProgress> = JSON.parse(raw)
    return map[path] ?? null
  } catch {
    return null
  }
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function VideoCard({ video, index }: VideoCardProps) {
  const router = useRouter()
  const [imgError, setImgError] = useState(false)
  const progress = getProgress(video.path)
  const hasThumb = !imgError

  return (
    <button
      onClick={() => router.push(`/player/video?path=${encodeURIComponent(video.path)}`)}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl text-left",
        "bg-card/50 ring-1 ring-white/10 backdrop-blur-sm",
        "transition-all duration-200 hover:ring-white/20 hover:scale-[1.02]",
        "cursor-pointer"
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {hasThumb ? (
          <img
            src={buildThumbUrl(video.path)}
            alt={video.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Film className="size-10 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex size-12 items-center justify-center rounded-full bg-black/60">
            <Play className="size-6 text-white" />
          </div>
        </div>
        <div className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[11px] text-white">
          {formatSize(video.size)}
        </div>
        {progress && progress.time > 5 && (
          <div className="absolute bottom-1.5 left-1.5 rounded bg-primary/80 px-1.5 py-0.5 text-[11px] text-white">
            {Math.round((progress.time / (progress.duration || 1)) * 100)}%
          </div>
        )}
      </div>
      <div className="space-y-0.5 px-3 py-2">
        <p className="line-clamp-1 text-sm font-medium">{video.name}</p>
        <p className="text-[11px] text-muted-foreground">{formatDate(video.modified)}</p>
      </div>
    </button>
  )
}
