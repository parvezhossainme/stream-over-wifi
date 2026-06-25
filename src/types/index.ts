export interface FileEntry {
  name: string
  path: string
  type: 'file' | 'folder'
  mime?: string
  size: number
  modified: Date
  created: Date
  extension?: string
}

export interface FolderContent {
  parent: string
  folders: FileEntry[]
  files: FileEntry[]
  path: string
}

export interface StorageInfo {
  total: number
  used: number
  free: number
  path: string
}

export interface SearchResult {
  query: string
  results: FileEntry[]
  total: number
}

export type SortField = 'name' | 'date' | 'size' | 'type'
export type SortOrder = 'asc' | 'desc'
export type ViewMode = 'grid' | 'list'
export type FileFilter = 'all' | 'videos' | 'images' | 'audio' | 'documents' | 'folders'

export type MediaType = 'video' | 'image' | 'audio' | 'document' | 'other'

export interface PinFolder {
  name: string
  path: string
  added: number
}

export interface WatchProgress {
  path: string
  time: number
  duration: number
  updated: number
}

export interface UploadProgress {
  file: string
  loaded: number
  total: number
  percent: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
}

export interface ServerConfig {
  hostname: string
  port: number
  storagePath: string
  networkInterfaces: string[]
}
