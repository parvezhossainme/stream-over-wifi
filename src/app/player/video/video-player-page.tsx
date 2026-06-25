"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { buildStreamUrl, fetchFiles } from "@/lib/api"
import type { FileEntry } from "@/types"
import { VideoPlayer } from "@/components/player/video-player"
import { ArrowLeft, Loader2 } from "lucide-react"

export function VideoPlayerPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const path = searchParams.get("path")

  const [file, setFile] = useState<FileEntry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!path) {
      setLoading(false)
      return
    }
    const parent = path.substring(0, path.lastIndexOf("/")) || "/"
    fetchFiles(parent)
      .then((data) => {
        const found = [...data.files, ...data.folders].find((f) => f.path === path)
        setFile(found || null)
        setLoading(false)
      })
      .catch(() => {
        setFile(null)
        setLoading(false)
      })
  }, [path])

  if (!path) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <p className="text-zinc-400">No file specified</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
      </div>
    )
  }

  const streamUrl = buildStreamUrl(path)
  const title = file?.name || path.split("/").pop() || "Video"

  return (
    <div className="h-screen flex flex-col bg-black">
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
      </div>
      <VideoPlayer src={streamUrl} title={title} />
    </div>
  )
}
