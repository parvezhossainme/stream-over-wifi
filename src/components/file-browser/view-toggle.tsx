"use client"

import { Grid3X3Icon, ListIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { ViewMode } from "@/types"

export function ViewToggle() {
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>("file-view-mode", "grid")

  return (
    <div className="flex items-center gap-0.5 rounded-lg border bg-background p-0.5">
      <Button
        variant={viewMode === "grid" ? "default" : "ghost"}
        size="icon-sm"
        onClick={() => setViewMode("grid")}
        aria-label="Grid view"
      >
        <Grid3X3Icon className="size-4" />
      </Button>
      <Button
        variant={viewMode === "list" ? "default" : "ghost"}
        size="icon-sm"
        onClick={() => setViewMode("list")}
        aria-label="List view"
      >
        <ListIcon className="size-4" />
      </Button>
    </div>
  )
}
