import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type {
  FileEntry,
  FolderContent,
  StorageInfo,
  SearchResult,
  SortField,
  SortOrder,
  FileFilter,
  VideoFolder,
  VideoFolderContent,
} from "@/types"
import {
  fetchFiles,
  fetchStorage,
  fetchSearch,
  fetchRecent,
  fetchNetwork,
  uploadFiles,
  deleteFile,
  renameFile,
  createFolder,
  fetchVideoFolders,
  fetchVideoFolder,
} from "@/lib/api"

export function useFiles(
  path: string,
  filter?: FileFilter,
  sort?: SortField,
  order?: SortOrder
) {
  return useQuery<FolderContent>({
    queryKey: ["files", path, filter, sort, order],
    queryFn: () => fetchFiles(path, filter, sort, order),
  })
}

export function useStorage() {
  return useQuery<StorageInfo>({
    queryKey: ["storage"],
    queryFn: fetchStorage,
  })
}

export function useSearch(query: string, path?: string) {
  return useQuery<SearchResult>({
    queryKey: ["search", query, path],
    queryFn: () => fetchSearch(query, path),
    enabled: query.length > 0,
  })
}

export function useRecent(count?: number) {
  return useQuery<FileEntry[]>({
    queryKey: ["recent", count],
    queryFn: () => fetchRecent(count),
  })
}

export function useNetwork() {
  return useQuery({
    queryKey: ["network"],
    queryFn: fetchNetwork,
  })
}

export function useUpload() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      path,
      files,
    }: {
      path: string
      files: FileList | File[]
    }) => uploadFiles(path, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] })
      queryClient.invalidateQueries({ queryKey: ["storage"] })
      queryClient.invalidateQueries({ queryKey: ["recent"] })
    },
  })
}

export function useDeleteFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (path: string) => deleteFile(path),
    onMutate: async (path: string) => {
      await queryClient.cancelQueries({ queryKey: ["files"] })
      const previousQueries = queryClient.getQueriesData<FolderContent>({
        queryKey: ["files"],
      })

      queryClient.setQueriesData<FolderContent>(
        { queryKey: ["files"] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            folders: old.folders.filter((f) => f.path !== path),
            files: old.files.filter((f) => f.path !== path),
          }
        }
      )

      return { previousQueries }
    },
    onError: (_err, _path, context) => {
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] })
      queryClient.invalidateQueries({ queryKey: ["storage"] })
      queryClient.invalidateQueries({ queryKey: ["recent"] })
    },
  })
}

export function useRenameFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ path, name }: { path: string; name: string }) =>
      renameFile(path, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] })
    },
  })
}

export function useVideoFolders() {
  return useQuery<VideoFolder[]>({
    queryKey: ["video-folders"],
    queryFn: fetchVideoFolders,
    staleTime: 30_000,
  })
}

export function useVideoFolder(path: string) {
  return useQuery<VideoFolderContent>({
    queryKey: ["video-folder", path],
    queryFn: () => fetchVideoFolder(path),
    enabled: path.length > 0,
  })
}

export function useCreateFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (path: string) => createFolder(path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] })
      queryClient.invalidateQueries({ queryKey: ["storage"] })
    },
  })
}
