"use client"

import { useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { FolderOpen, Upload, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function QuickActions() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries()
  }, [queryClient])

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/browse")}
      >
        <FolderOpen className="size-4" />
        Browse Files
      </Button>

      <Dialog>
        <DialogTrigger render={<Button variant="outline" size="sm" />}>
          <Upload className="size-4" />
          Upload
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex size-20 items-center justify-center rounded-full bg-muted">
              <Upload className="size-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Select files to upload to the current directory
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) {
                  fileInputRef.current && (fileInputRef.current.value = "")
                }
              }}
            />
            <Button onClick={handleUploadClick}>
              <Upload className="size-4" />
              Choose Files
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button variant="outline" size="sm" onClick={handleRefresh}>
        <RefreshCw className="size-4" />
        Refresh
      </Button>
    </div>
  )
}
