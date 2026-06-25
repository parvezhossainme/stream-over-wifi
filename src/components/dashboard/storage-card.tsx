"use client"

import { HardDrive } from "lucide-react"
import { useStorage } from "@/hooks/use-files"
import { formatBytes } from "@/lib/format"
import { cn } from "@/lib/utils"

export function StorageCard() {
  const { data: storage, isLoading } = useStorage()

  if (isLoading || !storage) {
    return (
      <div className="rounded-xl bg-card/50 ring-1 ring-white/10 p-4 animate-pulse">
        <div className="h-4 w-24 bg-muted rounded mb-3" />
        <div className="h-2 bg-muted rounded-full" />
      </div>
    )
  }

  const percent = storage.total > 0 ? (storage.used / storage.total) * 100 : 0
  const gradient =
    percent > 90
      ? "from-red-500 to-orange-500"
      : percent > 70
        ? "from-yellow-500 to-orange-400"
        : "from-blue-500 to-cyan-400"

  return (
    <div className="group relative overflow-hidden rounded-xl bg-card/50 p-4 ring-1 ring-white/10 backdrop-blur-sm transition-all hover:ring-white/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <HardDrive className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Storage</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {percent.toFixed(0)}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-500",
            gradient
          )}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {formatBytes(storage.used)} of {formatBytes(storage.total)} used
      </p>
    </div>
  )
}
