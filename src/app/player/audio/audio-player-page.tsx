"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { fetchFiles } from "@/lib/api"
import type { FileEntry } from "@/types"
import { AudioPlayerFull } from "@/components/player/audio-player"
import { ArrowLeft, Loader2, Music } from "lucide-react"

export function AudioPlayerPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const path = searchParams.get("path")
  const pathsParam = searchParams.get("paths")

  const [files, setFiles] = useState<FileEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [initialIndex, setInitialIndex] = useState(0)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        if (pathsParam) {
          const paths = pathsParam.split(",").map((p) => decodeURIComponent(p.trim()))
          const results: FileEntry[] = []
          const parents = new Set(paths.map((p) => p.substring(0, p.lastIndexOf("/")) || "/"))
          for (const parent of parents) {
            const data = await fetchFiles(parent)
            for (const f of [...data.files, ...data.folders]) {
              if (paths.includes(f.path)) {
                results.push(f)
              }
            }
          }
          setFiles(results)
          const idx = results.findIndex((f) => f.path === path)
          setInitialIndex(idx >= 0 ? idx : 0)
        } else if (path) {
          const parent = path.substring(0, path.lastIndexOf("/")) || "/"
          const data = await fetchFiles(parent)
          const audioFiles = data.files.filter((f) =>
            [".mp3", ".wav", ".flac", ".aac", ".ogg", ".wma", ".m4a", ".opus"].includes(
              f.extension?.toLowerCase() || ""
            )
          )
          const idx = audioFiles.findIndex((f) => f.path === path)
          if (idx >= 0) {
            setFiles(audioFiles)
            setInitialIndex(idx)
          } else {
            const found = [...data.files, ...data.folders].find((f) => f.path === path)
            if (found) setFiles([found])
            setInitialIndex(0)
          }
        }
      } catch {
      }
      setLoading(false)
    }
    load()
  }, [path, pathsParam])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black gap-4">
        <Music className="w-12 h-12 text-white/20" />
        <p className="text-zinc-400">No audio files found</p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Go Back</span>
        </button>
      </div>
    )
  }

  return (
    <AudioPlayerFull
      files={files}
      initialIndex={initialIndex}
      onClose={() => router.back()}
    />
  )
}
