"use client"

import { useState, useCallback, useRef, type DragEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UploadIcon, XIcon, FileIcon, CheckCircleIcon, AlertCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface UploadItem {
  id: string
  name: string
  progress: number
  status: "pending" | "uploading" | "done" | "error"
  error?: string
}

interface UploadZoneProps {
  path: string
  children?: React.ReactNode
}

function uploadFileXHR(
  path: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const formData = new FormData()
    formData.append("files", file)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(xhr.responseText || `Upload failed (${xhr.status})`))
      }
    }

    xhr.onerror = () => reject(new Error("Network error"))
    xhr.open("POST", `/api/upload?path=${encodeURIComponent(path)}`)
    xhr.send(formData)
  })
}

export function UploadZone({ path, children }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false)
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const queryClient = useQueryClient()
  const dragCounter = useRef(0)

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const processFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList)
      const newUploads: UploadItem[] = files.map((f) => ({
        id: crypto.randomUUID(),
        name: f.name,
        progress: 0,
        status: "pending" as const,
      }))
      setUploads((prev) => [...prev, ...newUploads])

      const doUpload = async (file: File, item: UploadItem) => {
        setUploads((prev) =>
          prev.map((u) =>
            u.id === item.id ? { ...u, status: "uploading" as const } : u
          )
        )
        try {
          await uploadFileXHR(path, file, (percent) => {
            setUploads((prev) =>
              prev.map((u) =>
                u.id === item.id ? { ...u, progress: percent } : u
              )
            )
          })
          setUploads((prev) =>
            prev.map((u) =>
              u.id === item.id ? { ...u, status: "done" as const, progress: 100 } : u
            )
          )
        } catch (err) {
          const message = err instanceof Error ? err.message : "Upload failed"
          setUploads((prev) =>
            prev.map((u) =>
              u.id === item.id
                ? { ...u, status: "error" as const, error: message }
                : u
            )
          )
        }
      }

      Promise.all(files.map((f, i) => doUpload(f, newUploads[i]))).then(() => {
        queryClient.invalidateQueries({ queryKey: ["files"] })
        queryClient.invalidateQueries({ queryKey: ["storage"] })
        queryClient.invalidateQueries({ queryKey: ["recent"] })
        const doneCount = files.length
        const errCount = newUploads.filter((u) => u.status === "error").length
        if (errCount === 0) {
          toast.success(`${doneCount} file${doneCount > 1 ? "s" : ""} uploaded`)
        } else {
          toast.error(`${errCount} file${errCount > 1 ? "s" : ""} failed`)
        }
      })
    },
    [path, queryClient]
  )

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragging(false)
      dragCounter.current = 0
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files)
      }
    },
    [processFiles]
  )

  const removeUpload = useCallback((id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id))
  }, [])

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative"
    >
      {children}

      <AnimatePresence>
        {dragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "pointer-events-none fixed inset-0 z-50 flex items-center justify-center",
              "bg-background/60 backdrop-blur-sm"
            )}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className={cn(
                "flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-12",
                "border-primary/40 bg-card/80 text-foreground shadow-2xl"
              )}
            >
              <UploadIcon className="size-16 text-primary/60" />
              <span className="text-lg font-medium">Drop files to upload</span>
              <span className="text-sm text-muted-foreground">
                Files will be saved to this folder
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {uploads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-4 space-y-2 rounded-xl border bg-card p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Uploads</span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setUploads([])}
              >
                <XIcon className="size-3" />
              </Button>
            </div>
            {uploads.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                {item.status === "done" ? (
                  <CheckCircleIcon className="size-4 shrink-0 text-emerald-500" />
                ) : item.status === "error" ? (
                  <AlertCircleIcon className="size-4 shrink-0 text-destructive" />
                ) : (
                  <FileIcon className="size-4 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs">{item.name}</span>
                    {item.status !== "done" && item.status !== "error" && (
                      <button
                        onClick={() => removeUpload(item.id)}
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        <XIcon className="size-3" />
                      </button>
                    )}
                  </div>
                  {(item.status === "uploading" || item.status === "pending") && (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="tabular-nums text-xs text-muted-foreground">
                        {item.progress}%
                      </span>
                    </div>
                  )}
                  {item.status === "error" && item.error && (
                    <span className="text-xs text-destructive">{item.error}</span>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
