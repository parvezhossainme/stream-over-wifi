"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { fetchFiles } from "@/lib/api"
import type { FileEntry } from "@/types"
import { ImageViewer } from "@/components/player/image-viewer"
import { Loader2, ImageIcon } from "lucide-react"

export function ImageViewerPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const path = searchParams.get("path")
  const pathsParam = searchParams.get("paths")
  const indexParam = searchParams.get("index")

  const [images, setImages] = useState<FileEntry[]>([])
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
          setImages(results)
          const idx = results.findIndex((f) => f.path === path)
          setInitialIndex(idx >= 0 ? idx : Number(indexParam) || 0)
        } else if (path) {
          const parent = path.substring(0, path.lastIndexOf("/")) || "/"
          const data = await fetchFiles(parent)
          const imageFiles = data.files.filter((f) =>
            [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg", ".avif", ".ico", ".tiff"].includes(
              f.extension?.toLowerCase() || ""
            )
          )
          const idx = imageFiles.findIndex((f) => f.path === path)
          if (idx >= 0) {
            setImages(imageFiles)
            setInitialIndex(idx)
          } else {
            const found = [...data.files, ...data.folders].find((f) => f.path === path)
            if (found) setImages([found])
            setInitialIndex(0)
          }
        }
      } catch {
      }
      setLoading(false)
    }
    load()
  }, [path, pathsParam, indexParam])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black gap-4">
        <ImageIcon className="w-12 h-12 text-white/20" />
        <p className="text-zinc-400">No images found</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-colors"
        >
          Go Back
        </button>
      </div>
    )
  }

  return <ImageViewer images={images} initialIndex={initialIndex} onClose={() => router.back()} />
}
