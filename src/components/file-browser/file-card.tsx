"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  FolderIcon,
  FilmIcon,
  ImageIcon,
  FileAudioIcon,
  FileTextIcon,
  FileIcon,
  PencilIcon,
  Trash2Icon,
  DownloadIcon,
  LinkIcon,
  PinIcon,
} from "lucide-react"
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { formatBytes, formatDate } from "@/lib/format"
import { buildThumbUrl, buildDownloadUrl, buildStreamUrl, buildImageUrl } from "@/lib/api"
import {
  VIDEO_EXTENSIONS,
  IMAGE_EXTENSIONS,
  AUDIO_EXTENSIONS,
  DOCUMENT_EXTENSIONS,
} from "@/lib/constants"
import { RenameDialog } from "./rename-dialog"
import { DeleteDialog } from "./delete-dialog"
import type { FileEntry, ViewMode } from "@/types"

interface FileCardProps {
  file: FileEntry
  viewMode: ViewMode
  onRefresh?: () => void
}

function getFileIcon(entry: FileEntry) {
  if (entry.type === "folder") return FolderIcon
  const ext = entry.extension?.toLowerCase()
  if (ext && VIDEO_EXTENSIONS.has(ext)) return FilmIcon
  if (ext && IMAGE_EXTENSIONS.has(ext)) return ImageIcon
  if (ext && AUDIO_EXTENSIONS.has(ext)) return FileAudioIcon
  if (ext && DOCUMENT_EXTENSIONS.has(ext)) return FileTextIcon
  return FileIcon
}

function canThumbnail(entry: FileEntry) {
  if (entry.type !== "file") return false
  const ext = entry.extension?.toLowerCase()
  if (ext && VIDEO_EXTENSIONS.has(ext)) return true
  if (ext && IMAGE_EXTENSIONS.has(ext)) return true
  return false
}

function getMediaUrl(entry: FileEntry) {
  const ext = entry.extension?.toLowerCase()
  if (ext && VIDEO_EXTENSIONS.has(ext)) return buildStreamUrl(entry.path)
  if (ext && IMAGE_EXTENSIONS.has(ext)) return buildImageUrl(entry.path)
  return undefined
}

function getPlayerPath(entry: FileEntry) {
  if (entry.type === "folder") return "/browse" + entry.path
  const ext = entry.extension?.toLowerCase()
  if (ext && VIDEO_EXTENSIONS.has(ext)) return "/player" + entry.path
  if (ext && IMAGE_EXTENSIONS.has(ext)) return "/player" + entry.path
  if (ext && AUDIO_EXTENSIONS.has(ext)) return "/player" + entry.path
  return buildDownloadUrl(entry.path)
}

export function FileCard({ file, viewMode, onRefresh }: FileCardProps) {
  const router = useRouter()
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [thumbLoaded, setThumbLoaded] = useState(false)
  const Icon = getFileIcon(file)

  const handleClick = () => {
    router.push(getPlayerPath(file))
  }

  const handleCopyLink = () => {
    const url = window.location.origin + getPlayerPath(file)
    navigator.clipboard.writeText(url)
  }

  const handleDownload = () => {
    window.open(buildDownloadUrl(file.path), "_blank")
  }

  const handlePin = () => {
    const pins = JSON.parse(localStorage.getItem("pinned-folders") || "[]")
    pins.push({ name: file.name, path: file.path, added: Date.now() })
    localStorage.setItem("pinned-folders", JSON.stringify(pins))
  }

  if (viewMode === "grid") {
    return (
      <>
        <ContextMenu>
          <ContextMenuTrigger>
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
              onClick={handleClick}
              className={cn(
                "group relative flex cursor-pointer flex-col overflow-hidden rounded-xl",
                "bg-card/50 backdrop-blur-sm ring-1 ring-foreground/5",
                "transition-all duration-200 hover:ring-foreground/20 hover:bg-card/80",
                "hover:shadow-lg hover:shadow-black/10"
              )}
            >
              <div className="relative flex aspect-video items-center justify-center bg-muted/30">
                {canThumbnail(file) ? (
                  <>
                    {!thumbLoaded && (
                      <Skeleton className="absolute inset-0 size-full rounded-none" />
                    )}
                    <Image
                      src={buildThumbUrl(file.path)}
                      alt={file.name}
                      fill
                      className={cn(
                        "object-cover transition-opacity duration-300",
                        thumbLoaded ? "opacity-100" : "opacity-0"
                      )}
                      onLoad={() => setThumbLoaded(true)}
                      onError={() => setThumbLoaded(true)}
                      unoptimized
                    />
                  </>
                ) : (
                  <Icon className="size-10 text-muted-foreground/60" />
                )}
              </div>
              <div className="flex flex-col gap-0.5 p-3">
                <span className="truncate text-sm font-medium leading-tight">
                  {file.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {file.type === "folder"
                    ? ""
                    : formatBytes(file.size) + " \u00B7 "}
                  {formatDate(file.modified)}
                </span>
              </div>
            </motion.div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            {file.type === "folder" && (
              <>
                <ContextMenuItem onClick={handleClick}>
                  <FolderIcon className="size-4" />
                  Open
                </ContextMenuItem>
                <ContextMenuSeparator />
              </>
            )}
            <ContextMenuItem onClick={() => setRenameOpen(true)}>
              <PencilIcon className="size-4" />
              Rename
            </ContextMenuItem>
            <ContextMenuItem onClick={handleDownload}>
              <DownloadIcon className="size-4" />
              Download
            </ContextMenuItem>
            <ContextMenuItem onClick={handleCopyLink}>
              <LinkIcon className="size-4" />
              Copy link
            </ContextMenuItem>
            {file.type === "folder" && (
              <ContextMenuItem onClick={handlePin}>
                <PinIcon className="size-4" />
                Pin folder
              </ContextMenuItem>
            )}
            <ContextMenuSeparator />
            <ContextMenuItem
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2Icon className="size-4" />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        <RenameDialog
          filePath={file.path}
          fileName={file.name}
          open={renameOpen}
          onOpenChange={setRenameOpen}
          onSuccess={onRefresh}
        />
        <DeleteDialog
          filePath={file.path}
          fileName={file.name}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onSuccess={onRefresh}
        />
      </>
    )
  }

  return null
}
