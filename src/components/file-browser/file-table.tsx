"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
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
  ArrowUpIcon,
  ArrowDownIcon,
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
import {
  buildThumbUrl,
  buildDownloadUrl,
  buildStreamUrl,
  buildImageUrl,
} from "@/lib/api"
import {
  VIDEO_EXTENSIONS,
  IMAGE_EXTENSIONS,
  AUDIO_EXTENSIONS,
  DOCUMENT_EXTENSIONS,
} from "@/lib/constants"
import { RenameDialog } from "./rename-dialog"
import { DeleteDialog } from "./delete-dialog"
import type { FileEntry, SortField, SortOrder } from "@/types"

interface FileTableProps {
  files: FileEntry[]
  sort?: SortField
  order?: SortOrder
  onSortChange?: (sort: SortField) => void
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

function getPlayerPath(entry: FileEntry) {
  if (entry.type === "folder") return "/browse" + entry.path
  const ext = entry.extension?.toLowerCase()
  if (ext && VIDEO_EXTENSIONS.has(ext)) return "/player" + entry.path
  if (ext && IMAGE_EXTENSIONS.has(ext)) return "/player" + entry.path
  if (ext && AUDIO_EXTENSIONS.has(ext)) return "/player" + entry.path
  return buildDownloadUrl(entry.path)
}

function getMimeLabel(entry: FileEntry): string {
  if (entry.type === "folder") return "Folder"
  const ext = entry.extension?.toLowerCase()
  if (ext && VIDEO_EXTENSIONS.has(ext)) return "Video"
  if (ext && IMAGE_EXTENSIONS.has(ext)) return "Image"
  if (ext && AUDIO_EXTENSIONS.has(ext)) return "Audio"
  if (ext && DOCUMENT_EXTENSIONS.has(ext)) return "Document"
  return "File"
}

const sortFields: { key: SortField; label: string; hide?: "mobile" }[] = [
  { key: "name", label: "Name" },
  { key: "size", label: "Size", hide: "mobile" },
  { key: "type", label: "Type", hide: "mobile" },
  { key: "date", label: "Modified" },
]

export function FileTable({
  files,
  sort,
  order,
  onSortChange,
  onRefresh,
}: FileTableProps) {
  const router = useRouter()

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border/50 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <th className="w-10 px-2 py-2 text-left sm:w-12" />
            {sortFields.map((field) => (
              <th
                key={field.key}
                className={cn(
                  "px-2 py-2 text-left",
                  field.hide === "mobile" && "hidden sm:table-cell",
                  onSortChange && "cursor-pointer hover:text-foreground"
                )}
                onClick={() => onSortChange?.(field.key)}
              >
                <div className="inline-flex items-center gap-1">
                  {field.label}
                  {sort === field.key &&
                    (order === "asc" ? (
                      <ArrowUpIcon className="size-3" />
                    ) : (
                      <ArrowDownIcon className="size-3" />
                    ))}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <FileRow
              key={file.path}
              file={file}
              onRefresh={onRefresh}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FileRow({
  file,
  onRefresh,
}: {
  file: FileEntry
  onRefresh?: () => void
}) {
  const router = useRouter()
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [thumbLoaded, setThumbLoaded] = useState(false)
  const Icon = getFileIcon(file)

  const handleClick = () => router.push(getPlayerPath(file))

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

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <tr
            onClick={handleClick}
            className={cn(
              "cursor-pointer border-b border-border/20 text-sm transition-colors",
              "hover:bg-muted/50"
            )}
          >
            <td className="w-10 px-2 py-2.5 sm:w-12">
              <div className="flex size-8 items-center justify-center overflow-hidden rounded-lg bg-muted/30">
                {canThumbnail(file) ? (
                  <>
                    {!thumbLoaded && (
                      <Skeleton className="absolute size-full rounded-none" />
                    )}
                    <Image
                      src={buildThumbUrl(file.path)}
                      alt={file.name}
                      width={32}
                      height={32}
                      className={cn(
                        "size-full object-cover",
                        thumbLoaded ? "opacity-100" : "opacity-0"
                      )}
                      onLoad={() => setThumbLoaded(true)}
                      onError={() => setThumbLoaded(true)}
                      unoptimized
                    />
                  </>
                ) : (
                  <Icon className="size-4 text-muted-foreground/60" />
                )}
              </div>
            </td>
            <td className="max-w-0 px-2 py-2.5">
              <span className="block truncate font-medium">{file.name}</span>
            </td>
            <td className="hidden px-2 py-2.5 whitespace-nowrap text-muted-foreground sm:table-cell">
              {file.type !== "folder" && formatBytes(file.size)}
            </td>
            <td className="hidden px-2 py-2.5 whitespace-nowrap text-muted-foreground sm:table-cell">
              {getMimeLabel(file)}
            </td>
            <td className="px-2 py-2.5 whitespace-nowrap text-muted-foreground">
              {formatDate(file.modified)}
            </td>
          </tr>
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
