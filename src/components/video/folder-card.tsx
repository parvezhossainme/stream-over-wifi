"use client"

import Link from "next/link"
import { useState } from "react"
import { Film, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { buildThumbUrl } from "@/lib/api"
import type { VideoFolder } from "@/types"

interface VideoFolderCardProps {
  folder: VideoFolder
  index: number
}

export function VideoFolderCard({ folder, index }: VideoFolderCardProps) {
  const [imgError, setImgError] = useState(false)
  const hasThumb = folder.thumbnailPath && !imgError

  return (
    <Link
      href={`/videos${folder.path}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl",
        "bg-card/50 ring-1 ring-white/10 backdrop-blur-sm",
        "transition-all duration-200 hover:ring-white/20 hover:scale-[1.02]",
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {hasThumb ? (
          <img
            src={buildThumbUrl(folder.thumbnailPath!)}
            alt={folder.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Film className="size-10 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3">
          <p className="text-sm font-semibold text-white truncate drop-shadow-md">
            {folder.name}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between px-3 py-2">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Film className="size-3.5" />
          {folder.videoCount} video{folder.videoCount !== 1 ? "s" : ""}
        </span>
        <FolderOpen className="size-3.5 text-muted-foreground/60" />
      </div>
    </Link>
  )
}
