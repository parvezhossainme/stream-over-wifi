"use client"

import { useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDeleteFile } from "@/hooks/use-files"
import { toast } from "sonner"

interface DeleteDialogProps {
  filePath: string
  fileName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DeleteDialog({
  filePath,
  fileName,
  open,
  onOpenChange,
  onSuccess,
}: DeleteDialogProps) {
  const deleteFile = useDeleteFile()

  const handleDelete = useCallback(() => {
    deleteFile.mutate(filePath, {
      onSuccess: () => {
        toast.success("Deleted successfully")
        onSuccess?.()
        onOpenChange(false)
      },
      onError: (err) => {
        toast.error(err.message || "Failed to delete")
      },
    })
  }, [filePath, deleteFile, onOpenChange, onSuccess])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{fileName}</strong>? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteFile.isPending}
          >
            {deleteFile.isPending ? "Deleting\u2026" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
