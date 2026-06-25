"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { FileIcon, Clock } from "lucide-react"
import { useRecent } from "@/hooks/use-files"
import { buildThumbUrl } from "@/lib/api"
import { formatBytes, formatRelativeTime } from "@/lib/format"
import { Skeleton } from "@/components/ui/skeleton"

export function RecentFiles() {
  const { data: files, isLoading } = useRecent(20)

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Recent Files</h2>
        <Link
          href="/browse?sort=date&order=desc"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View All
        </Link>
      </div>

      {isLoading ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="shrink-0 w-40 space-y-2">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : files && files.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {files.map((file, i) => {
            const href = file.mime?.startsWith("video/")
              ? `/play/${encodeURIComponent(file.path)}`
              : file.mime?.startsWith("image/")
                ? `/view/${encodeURIComponent(file.path)}`
                : file.mime?.startsWith("audio/")
                  ? `/play/${encodeURIComponent(file.path)}`
                  : "#"
            return (
              <motion.div
                key={file.path}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="shrink-0"
              >
                <Link href={href} className="group block w-40">
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-muted ring-1 ring-white/10">
                    {file.mime?.startsWith("image/") ? (
                      <img
                        src={buildThumbUrl(file.path)}
                        alt={file.name}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <FileIcon className="size-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="mt-1.5 truncate text-xs font-medium">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatBytes(file.size)} ·{" "}
                    {formatRelativeTime(new Date(file.modified).getTime())}
                  </p>
                </Link>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
          <Clock className="size-8" />
          <p className="text-sm">No recent files</p>
        </div>
      )}
    </section>
  )
}
