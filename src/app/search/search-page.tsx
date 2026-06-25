'use client'

import { useSearchParams } from "next/navigation"
import { useSearch } from "@/hooks/use-files"
import { useRouter } from "next/navigation"
import { FileEntry } from "@/types"
import { FileCard } from "@/components/file-browser/file-card"
import { ViewToggle } from "@/components/file-browser/view-toggle"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { ViewMode } from "@/types"
import { Search, ArrowLeft, FolderOpen } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect } from "react"

export function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get("q") || ""
  const [searchInput, setSearchInput] = useState(query)
  const { data, isLoading } = useSearch(query)
  const [viewMode] = useLocalStorage<ViewMode>("view-mode", "grid")

  useEffect(() => {
    setSearchInput(query)
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`)
    }
  }

  const handleFileClick = (file: FileEntry) => {
    const ext = file.extension?.toLowerCase()
    if (file.type === "folder") {
      router.push(`/browse${file.path}`)
    } else if (ext && [".mp4", ".mkv", ".webm", ".avi", ".mov"].includes(ext)) {
      router.push(`/player/video?path=${encodeURIComponent(file.path)}`)
    } else if (ext && [".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a"].includes(ext)) {
      router.push(`/player/audio?path=${encodeURIComponent(file.path)}`)
    } else if (ext && [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
      router.push(`/viewer/image?path=${encodeURIComponent(file.path)}`)
    } else if (ext && [".pdf", ".txt", ".md"].includes(ext)) {
      router.push(`/viewer/document?path=${encodeURIComponent(file.path)}`)
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search files and folders..."
              className="pl-10 h-12 text-lg rounded-xl bg-card/50 border-border/50 focus-visible:ring-primary/30"
              autoFocus
            />
          </div>
          <Button type="submit" className="rounded-xl">Search</Button>
        </form>
      </div>

      {query && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Searching..." : `${data?.total || 0} results for "${query}"`}
          </p>
          <ViewToggle />
        </div>
      )}

      <ScrollArea className="h-[calc(100vh-12rem)]">
        {!query && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Search className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg">Type something to search</p>
            <p className="text-sm">Search by filename, folder name, or extension</p>
          </div>
        )}

        {query && isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
            ))}
          </div>
        )}

        {query && !isLoading && data?.results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <FolderOpen className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg">No results found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        )}

        {query && !isLoading && data && data.results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {data.results.map((file, i) => (
                <motion.div
                  key={file.path}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => handleFileClick(file)}
                >
                  <FileCard file={file} viewMode={viewMode} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </ScrollArea>
    </div>
  )
}
