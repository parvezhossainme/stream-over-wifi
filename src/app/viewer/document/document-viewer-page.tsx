"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { fetchFiles } from "@/lib/api"
import type { FileEntry } from "@/types"
import { DocumentViewer } from "@/components/player/document-viewer"
import { ArrowLeft, Loader2, FileText } from "lucide-react"

export function DocumentViewerPage() {
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
      <div className="h-screen flex items-center justify-center bg-zinc-950">
        <p className="text-zinc-400">No file specified</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
      </div>
    )
  }

  if (!file) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-950 gap-4">
        <FileText className="w-12 h-12 text-white/20" />
        <p className="text-zinc-400">File not found</p>
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
    <div className="h-screen flex flex-col bg-zinc-950">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-zinc-900/50">
        <button
          onClick={() => router.back()}
          className="text-white/70 hover:text-white transition-colors p-1.5"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <FileText className="w-4 h-4 text-white/40" />
        <h1 className="text-white text-sm font-medium truncate">{file.name}</h1>
      </div>
      <DocumentViewer file={file} />
    </div>
  )
}
