"use client"

import { useState, useCallback } from "react"
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
import { useCreateFolder } from "@/hooks/use-files"
import { toast } from "sonner"

interface CreateFolderDialogProps {
  parentPath: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateFolderDialog({
  parentPath,
  open,
  onOpenChange,
  onSuccess,
}: CreateFolderDialogProps) {
  const [name, setName] = useState("")
  const createFolder = useCreateFolder()

  const handleSubmit = useCallback(() => {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error("Folder name cannot be empty")
      return
    }
    const fullPath = parentPath === "/" ? `/${trimmed}` : `${parentPath}/${trimmed}`
    createFolder.mutate(fullPath, {
      onSuccess: () => {
        toast.success("Folder created")
        setName("")
        onSuccess?.()
        onOpenChange(false)
      },
      onError: (err) => {
        toast.error(err.message || "Failed to create folder")
      },
    })
  }, [name, parentPath, createFolder, onOpenChange, onSuccess])

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) setName("")
        onOpenChange(open)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Folder</DialogTitle>
          <DialogDescription>Enter a name for the new folder</DialogDescription>
        </DialogHeader>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit()
          }}
          placeholder="Folder name"
          autoFocus
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createFolder.isPending}>
            {createFolder.isPending ? "Creating\u2026" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
