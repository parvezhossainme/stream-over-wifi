"use client"

import { useState, useMemo } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  FolderPlusIcon,
  RotateCcwIcon,
  AlertCircleIcon,
  FolderOpenIcon,
  FileIcon,
  Loader2Icon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useFiles } from "@/hooks/use-files"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { PAGE_SIZE } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Breadcrumbs } from "./breadcrumbs"
import { ViewToggle } from "./view-toggle"
import { SortControls } from "./sort-controls"
import { FileCard } from "./file-card"
import { FileTable } from "./file-table"
import { CreateFolderDialog } from "./create-folder-dialog"
import { UploadZone } from "./upload-zone"
import type { FileEntry, SortField, SortOrder, FileFilter, ViewMode } from "@/types"

interface FileExplorerProps {
  initialPath: string
  initialFilter?: FileFilter
}

export function FileExplorer({ initialPath, initialFilter }: FileExplorerProps) {
  const [sort, setSort] = useState<SortField>("name")
  const [order, setOrder] = useState<SortOrder>("asc")
  const [filter, setFilter] = useState<FileFilter>(initialFilter || "all")
  const [viewMode] = useLocalStorage<ViewMode>("file-view-mode", "grid")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [createFolderOpen, setCreateFolderOpen] = useState(false)

  const { data, isLoading, isError, error, refetch, isFetching } = useFiles(
    initialPath,
    filter,
    sort,
    order
  )

  const allEntries = useMemo(() => {
    if (!data) return []
    const items: FileEntry[] = [...data.folders, ...data.files]
    return items
  }, [data])

  const displayedEntries = useMemo(
    () => allEntries.slice(0, visibleCount),
    [allEntries, visibleCount]
  )

  const hasMore = visibleCount < allEntries.length

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE)
  }

  const handleRefresh = () => {
    refetch()
  }

  const handleSortChange = (newSort: SortField) => {
    if (newSort === sort) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"))
    } else {
      setSort(newSort)
      setOrder("asc")
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl ring-1 ring-foreground/5">
                <Skeleton className="aspect-video w-full rounded-none" />
                <div className="space-y-1.5 p-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg p-2">
                <Skeleton className="size-8 shrink-0 rounded-lg" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertCircleIcon className="size-8 text-destructive" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-medium">Failed to load files</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "An unexpected error occurred"}
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RotateCcwIcon className="size-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <UploadZone path={initialPath}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumbs path={initialPath} />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateFolderOpen(true)}
            >
              <FolderPlusIcon className="size-4" />
              <span className="hidden sm:inline">New Folder</span>
            </Button>
            <SortControls
              sort={sort}
              order={order}
              filter={filter}
              onSortChange={setSort}
              onOrderChange={setOrder}
              onFilterChange={setFilter}
            />
            <ViewToggle />
            <Button
              variant="outline"
              size="icon-sm"
              onClick={handleRefresh}
              disabled={isFetching}
              aria-label="Refresh"
            >
              <RotateCcwIcon className={cn("size-4", isFetching && "animate-spin")} />
            </Button>
          </div>
        </div>

        {allEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-4 py-24"
          >
            <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
              <FolderOpenIcon className="size-8 text-muted-foreground/60" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-medium">This folder is empty</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Drop files here or create a new folder to get started
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setCreateFolderOpen(true)}
            >
              <FolderPlusIcon className="size-4" />
              Create Folder
            </Button>
          </motion.div>
        ) : viewMode === "grid" ? (
          <motion.div
            layout
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          >
            <AnimatePresence mode="popLayout">
              {displayedEntries.map((entry) => (
                <FileCard
                  key={entry.path}
                  file={entry}
                  viewMode="grid"
                  onRefresh={handleRefresh}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="overflow-hidden rounded-xl border bg-card"
          >
            <FileTable
              files={displayedEntries}
              sort={sort}
              order={order}
              onSortChange={handleSortChange}
              onRefresh={handleRefresh}
            />
          </motion.div>
        )}

        {hasMore && (
          <div className="flex justify-center py-4">
            <Button variant="outline" onClick={handleLoadMore}>
              <FileIcon className="size-4" />
              Load more ({allEntries.length - visibleCount} remaining)
            </Button>
          </div>
        )}

        <CreateFolderDialog
          parentPath={initialPath}
          open={createFolderOpen}
          onOpenChange={setCreateFolderOpen}
          onSuccess={handleRefresh}
        />
      </div>
    </UploadZone>
  )
}
