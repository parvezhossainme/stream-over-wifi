import type {
  FileEntry,
  FolderContent,
  StorageInfo,
  SearchResult,
  SortField,
  SortOrder,
  FileFilter,
} from "@/types"

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, options)

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new ApiError(
      body || `Request failed: ${res.status} ${res.statusText}`,
      res.status
    )
  }

  if (res.status === 204) return undefined as T

  return res.json()
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== ""
  )
  if (entries.length === 0) return ""
  return "?" + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&")
}

export function fetchFiles(
  path: string,
  filter?: FileFilter,
  sort?: SortField,
  order?: SortOrder
): Promise<FolderContent> {
  const qs = buildQuery({ path, filter, sort, order })
  return request<FolderContent>(`/api/files${qs}`)
}

export function fetchStorage(): Promise<StorageInfo> {
  return request<StorageInfo>("/api/storage")
}

export function fetchSearch(
  query: string,
  path?: string
): Promise<SearchResult> {
  const qs = buildQuery({ q: query, path })
  return request<SearchResult>(`/api/search${qs}`)
}

export function fetchRecent(count?: number): Promise<FileEntry[]> {
  const qs = buildQuery({ count })
  return request<FileEntry[]>(`/api/recent${qs}`)
}

export function fetchNetwork(): Promise<{
  hostname: string
  port: number
  interfaces: { name: string; address: string }[]
}> {
  return request("/api/network")
}

export async function uploadFiles(
  path: string,
  files: FileList | File[]
): Promise<{ files: FileEntry[]; count: number }> {
  const formData = new FormData()
  for (const file of files) {
    formData.append("files", file)
  }
  const qs = buildQuery({ path })
  return request<{ files: FileEntry[]; count: number }>(`/api/upload${qs}`, {
    method: "POST",
    body: formData,
  })
}

export function deleteFile(path: string): Promise<void> {
  return request<void>("/api/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  })
}

export function renameFile(
  path: string,
  name: string
): Promise<void> {
  return request<void>("/api/rename", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, name }),
  })
}

export function createFolder(path: string): Promise<void> {
  return request<void>("/api/create-folder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  })
}

export function buildStreamUrl(path: string): string {
  return `/api/stream/${encodeURIComponent(path)}`
}

export function buildImageUrl(path: string): string {
  return `/api/image/${encodeURIComponent(path)}`
}

export function buildThumbUrl(path: string): string {
  return `/api/thumb/${encodeURIComponent(path)}`
}

export function buildDownloadUrl(path: string): string {
  return `/api/download/${encodeURIComponent(path)}`
}
