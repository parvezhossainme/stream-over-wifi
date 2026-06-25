"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRenameFile } from "@/hooks/use-files"
import { toast } from "sonner"

interface RenameDialogProps {
  filePath: string
  fileName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function RenameDialog({
  filePath,
  fileName,
  open,
  onOpenChange,
  onSuccess,
}: RenameDialogProps) {
  const [name, setName] = useState(fileName)
  const renameFile = useRenameFile()

  useEffect(() => {
    if (open) setName(fileName)
  }, [open, fileName])

  const handleSubmit = useCallback(() => {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error("Name cannot be empty")
      return
    }
    if (trimmed === fileName) {
      onOpenChange(false)
      return
    }
    renameFile.mutate(
      { path: filePath, name: trimmed },
      {
        onSuccess: () => {
          toast.success("Renamed successfully")
          onSuccess?.()
          onOpenChange(false)
        },
        onError: (err) => {
          toast.error(err.message || "Failed to rename")
        },
      }
    )
  }, [name, fileName, filePath, renameFile, onOpenChange, onSuccess])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename</DialogTitle>
          <DialogDescription>Enter a new name for "{fileName}"</DialogDescription>
        </DialogHeader>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit()
          }}
          autoFocus
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={renameFile.isPending}>
            {renameFile.isPending ? "Renaming\u2026" : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
