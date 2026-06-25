"use client"

import Link from "next/link"
import { Folder, Pin, PinOff } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { PinFolder } from "@/types"
import { cn } from "@/lib/utils"

export function PinnedFolders() {
  const [pinnedFolders, setPinnedFolders] = useLocalStorage<PinFolder[]>(
    "pinned-folders",
    []
  )

  const removePin = (path: string) => {
    setPinnedFolders((prev) => prev.filter((p) => p.path !== path))
  }

  if (pinnedFolders.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-3">Pinned Folders</h2>
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/10 py-8 text-muted-foreground">
          <Pin className="size-8" />
          <p className="text-sm text-center max-w-xs">
            Pin folders from the file browser to access them quickly
          </p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Pinned Folders</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {pinnedFolders.map((folder) => (
          <div key={folder.path} className="group relative shrink-0">
            <Link
              href={`/browse/${encodeURIComponent(folder.path)}`}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 min-w-[180px]",
                "bg-card/50 ring-1 ring-white/10 backdrop-blur-sm",
                "transition-all duration-200 hover:ring-white/20 hover:scale-[1.02]"
              )}
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Folder className="size-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{folder.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {folder.path}
                </p>
              </div>
            </Link>
            <button
              onClick={() => removePin(folder.path)}
              className="absolute top-1 right-1 hidden group-hover:flex size-5 items-center justify-center rounded-full bg-background/80 text-muted-foreground hover:text-foreground"
            >
              <PinOff className="size-3" />
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
