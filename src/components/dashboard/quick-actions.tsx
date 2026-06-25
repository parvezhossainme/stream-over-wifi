"use client"

import { useCallback, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { FolderOpen, Upload, RefreshCw, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useUpload } from "@/hooks/use-files"

export function QuickActions() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "done" | "error">("idle")
  const upload = useUpload()

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries()
  }, [queryClient])

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return

    setUploadStatus("uploading")
    try {
      await upload.mutateAsync({ path: "/", files })
      setUploadStatus("done")
      queryClient.invalidateQueries({ queryKey: ["files"] })
      queryClient.invalidateQueries({ queryKey: ["storage"] })
      queryClient.invalidateQueries({ queryKey: ["recent"] })
    } catch {
      setUploadStatus("error")
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [upload, queryClient])

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

      <Dialog open={uploadOpen} onOpenChange={(open) => {
        setUploadOpen(open)
        if (!open) setUploadStatus("idle")
      }}>
        <DialogTrigger render={<Button variant="outline" size="sm" />}>
          <Upload className="size-4" />
          Upload
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {uploadStatus === "idle" && (
              <>
                <div className="flex size-20 items-center justify-center rounded-full bg-muted">
                  <Upload className="size-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Select files to upload to the root directory
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button onClick={handleUploadClick}>
                  <Upload className="size-4" />
                  Choose Files
                </Button>
              </>
            )}
            {uploadStatus === "uploading" && (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="size-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Uploading files...</p>
              </div>
            )}
            {uploadStatus === "done" && (
              <div className="flex flex-col items-center gap-3">
                <CheckCircle2 className="size-10 text-green-500" />
                <p className="text-sm text-green-500">Upload complete!</p>
                <Button variant="outline" size="sm" onClick={() => { setUploadOpen(false); setUploadStatus("idle") }}>
                  Close
                </Button>
              </div>
            )}
            {uploadStatus === "error" && (
              <div className="flex flex-col items-center gap-3">
                <XCircle className="size-10 text-destructive" />
                <p className="text-sm text-destructive">Upload failed</p>
                <Button variant="outline" size="sm" onClick={() => setUploadStatus("idle")}>
                  Try Again
                </Button>
              </div>
            )}
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
