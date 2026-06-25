"use client"

import { useParams, useRouter } from "next/navigation"
import { useVideoFolders, useVideoFolder } from "@/hooks/use-files"
import { VideoCard } from "@/components/video/video-card"
import { VideoFolderCard } from "@/components/video/folder-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Film, FolderOpen } from "lucide-react"
import Link from "next/link"

function VideoHub() {
  const { data: folders, isLoading, error } = useVideoFolders()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden bg-card/50 ring-1 ring-white/10">
            <Skeleton className="aspect-video w-full" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <Film className="size-12 text-destructive/60" />
        <p className="text-sm text-destructive">Failed to scan video folders</p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
      </div>
    )
  }

  if (!folders || folders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Film className="size-12 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No video folders found</p>
        <Link
          href="/browse"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <FolderOpen className="size-4" />
          Browse files
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {folders.map((folder, i) => (
        <VideoFolderCard key={folder.path} folder={folder} index={i} />
      ))}
    </div>
  )
}

function VideoFolderView({ folderPath }: { folderPath: string }) {
  const router = useRouter()
  const { data, isLoading, error } = useVideoFolder(folderPath)

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/videos")}>
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Film className="size-5" />
            {data?.name || "Loading..."}
          </h1>
          {data && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {data.count} video{data.count !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden bg-card/50 ring-1 ring-white/10">
              <Skeleton className="aspect-video w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Film className="size-12 text-destructive/60" />
          <p className="text-sm text-destructive">Failed to load videos</p>
          <p className="text-xs text-muted-foreground">{error.message}</p>
        </div>
      )}

      {!isLoading && !error && data && data.videos.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <Film className="size-12 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No videos in this folder</p>
        </div>
      )}

      {!isLoading && !error && data && data.videos.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {data.videos.map((video, i) => (
            <VideoCard key={video.path} video={video} index={i} />
          ))}
        </div>
      )}
    </>
  )
}

export default function VideosPage() {
  const params = useParams()
  const pathSegments = params.path as string[] | undefined

  const hasPath = pathSegments && pathSegments.length > 0
  const folderPath = hasPath ? "/" + pathSegments.join("/") : "/"

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Film className="size-6" />
          Videos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {hasPath ? "Videos in this folder" : "Browse video folders"}
        </p>
      </div>

      {hasPath ? (
        <VideoFolderView folderPath={folderPath} />
      ) : (
        <VideoHub />
      )}
    </div>
  )
}
