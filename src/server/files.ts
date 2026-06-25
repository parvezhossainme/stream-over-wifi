import fs from 'fs/promises'
import path from 'path'
import { DEFAULT_STORAGE_PATH, VIDEO_EXTENSIONS, IMAGE_EXTENSIONS, AUDIO_EXTENSIONS, DOCUMENT_EXTENSIONS, SUBTITLE_EXTENSIONS } from '@/lib/constants'
import type { FileEntry, FolderContent, StorageInfo, FileFilter, SortField, SortOrder } from '@/types'

function getExtension(filename: string): string {
  const i = filename.lastIndexOf('.')
  return i === -1 ? '' : filename.substring(i).toLowerCase()
}

function getMimeType(ext: string): string {
  const mime: Record<string, string> = {
    '.mp4': 'video/mp4', '.mkv': 'video/x-matroska', '.webm': 'video/webm',
    '.avi': 'video/x-msvideo', '.mov': 'video/quicktime', '.wmv': 'video/x-ms-wmv',
    '.flv': 'video/x-flv', '.m4v': 'video/mp4', '.ts': 'video/mp2t', '.3gp': 'video/3gpp',
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.gif': 'image/gif', '.bmp': 'image/bmp', '.webp': 'image/webp',
    '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.tiff': 'image/tiff', '.avif': 'image/avif',
    '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.flac': 'audio/flac',
    '.aac': 'audio/aac', '.ogg': 'audio/ogg', '.wma': 'audio/x-ms-wma',
    '.m4a': 'audio/mp4', '.opus': 'audio/opus',
    '.pdf': 'application/pdf', '.txt': 'text/plain', '.md': 'text/markdown',
    '.srt': 'application/x-subrip', '.vtt': 'text/vtt', '.ass': 'text/x-ass',
  }
  return mime[ext] || 'application/octet-stream'
}

function getFileType(filename: string, ext: string): FileEntry['type'] {
  if (!ext) return 'folder'
  return 'file'
}

function classifyMedia(ext: string): string {
  if (VIDEO_EXTENSIONS.has(ext)) return 'videos'
  if (IMAGE_EXTENSIONS.has(ext)) return 'images'
  if (AUDIO_EXTENSIONS.has(ext)) return 'audio'
  if (DOCUMENT_EXTENSIONS.has(ext)) return 'documents'
  return 'other'
}

export function getFullPath(filePath: string): string {
  const base = DEFAULT_STORAGE_PATH
  const clean = filePath.replace(/\.\./g, '').replace(/^\/+/, '')
  return path.join(base, clean)
}

export async function listFolder(folderPath: string, filter?: FileFilter, sort?: SortField, order?: SortOrder): Promise<FolderContent> {
  const fullPath = getFullPath(folderPath)
  const entries = await fs.readdir(fullPath, { withFileTypes: true })

  const folders: FileEntry[] = []
  const files: FileEntry[] = []

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const entryPath = path.join(folderPath, entry.name)
    const ext = entry.isFile() ? getExtension(entry.name) : ''

    try {
      const stat = entry.isFile()
        ? await fs.stat(path.join(fullPath, entry.name))
        : await fs.stat(path.join(fullPath, entry.name))

      const fileEntry: FileEntry = {
        name: entry.name,
        path: entryPath,
        type: entry.isFile() ? 'file' : 'folder',
        mime: entry.isFile() ? getMimeType(ext) : undefined,
        size: stat.size,
        modified: stat.mtime,
        created: stat.birthtime,
        extension: ext || undefined,
      }

      if (entry.isDirectory()) {
        folders.push(fileEntry)
      } else {
        const mediaType = classifyMedia(ext)
        if (!filter || filter === 'all' || filter === mediaType) {
          files.push(fileEntry)
        }
      }
    } catch {
      // skip inaccessible entries
    }
  }

  const sorter = (a: FileEntry, b: FileEntry): number => {
    const dir = order === 'desc' ? -1 : 1
    switch (sort) {
      case 'size': return (a.size - b.size) * dir
      case 'date': return (new Date(a.modified).getTime() - new Date(b.modified).getTime()) * dir
      case 'type': return ((a.extension || '') > (b.extension || '') ? 1 : -1) * dir
      default: return a.name.localeCompare(b.name) * dir
    }
  }

  folders.sort(sorter)
  files.sort(sorter)

  return { parent: path.dirname(folderPath), folders, files, path: folderPath }
}

export async function getStorageInfo(): Promise<StorageInfo> {
  const fullPath = DEFAULT_STORAGE_PATH
  try {
    const stat = await fs.statfs(fullPath)
    return {
      total: stat.blocks * stat.bsize,
      free: stat.bfree * stat.bsize,
      used: (stat.blocks - stat.bfree) * stat.bsize,
      path: fullPath,
    }
  } catch {
    return { total: 0, used: 0, free: 0, path: fullPath }
  }
}

export async function searchFiles(query: string, basePath?: string): Promise<FileEntry[]> {
  const searchRoot = getFullPath(basePath || '/')
  const results: FileEntry[] = []
  const lower = query.toLowerCase()

  async function walk(dir: string, relativeDir: string) {
    let entries
    try {
      entries = await fs.readdir(dir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      const full = path.join(dir, entry.name)
      const relative = path.join(relativeDir, entry.name)
      const ext = entry.isFile() ? getExtension(entry.name) : ''

      if (entry.name.toLowerCase().includes(lower)) {
        try {
          const stat = await fs.stat(full)
          results.push({
            name: entry.name,
            path: relative,
            type: entry.isFile() ? 'file' : 'folder',
            mime: entry.isFile() ? getMimeType(ext) : undefined,
            size: stat.size,
            modified: stat.mtime,
            created: stat.birthtime,
            extension: ext || undefined,
          })
        } catch {}
      }

      if (entry.isDirectory() && results.length < 200) {
        await walk(full, relative)
      }
    }
  }

  await walk(searchRoot, basePath || '/')
  return results.slice(0, 200)
}

export async function deleteFile(filePath: string): Promise<void> {
  const full = getFullPath(filePath)
  await fs.rm(full, { recursive: true, force: true })
}

export async function renameFile(filePath: string, newName: string): Promise<void> {
  const full = getFullPath(filePath)
  const dir = path.dirname(full)
  const newFull = path.join(dir, newName)
  await fs.rename(full, newFull)
}

export async function createFolder(folderPath: string): Promise<void> {
  const full = getFullPath(folderPath)
  await fs.mkdir(full, { recursive: true })
}

export async function getFileStat(filePath: string): Promise<FileEntry> {
  const full = getFullPath(filePath)
  const stat = await fs.stat(full)
  const ext = getExtension(filePath)
  return {
    name: path.basename(filePath),
    path: filePath,
    type: stat.isFile() ? 'file' : 'folder',
    mime: getMimeType(ext),
    size: stat.size,
    modified: stat.mtime,
    created: stat.birthtime,
    extension: ext || undefined,
  }
}

export async function getRecentFiles(count = 20): Promise<FileEntry[]> {
  const base = DEFAULT_STORAGE_PATH
  const all: FileEntry[] = []

  async function walk(dir: string, relative: string, depth: number) {
    if (depth > 3) return
    let entries
    try {
      entries = await fs.readdir(dir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      const full = path.join(dir, entry.name)
      const rel = path.join(relative, entry.name)

      if (entry.isFile()) {
        try {
          const stat = await fs.stat(full)
          const ext = getExtension(entry.name)
          const mediaType = classifyMedia(ext)
          if (mediaType !== 'other') {
            all.push({
              name: entry.name,
              path: rel,
              type: 'file',
              mime: getMimeType(ext),
              size: stat.size,
              modified: stat.mtime,
              created: stat.birthtime,
              extension: ext || undefined,
            })
          }
        } catch {}
      } else if (entry.isDirectory()) {
        await walk(full, rel, depth + 1)
      }
    }
  }

  const watchPaths = ['/DCIM/Camera', '/Movies', '/Download', '/Pictures', '/Music', '/Documents']
  for (const wp of watchPaths) {
    const full = path.join(base, wp.replace(/^\//, ''))
    try {
      await walk(full, wp, 0)
    } catch {}
  }

  all.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
  return all.slice(0, count)
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const full = getFullPath(filePath)
    await fs.access(full)
    return true
  } catch {
    return false
  }
}

export { getFullPath as getServerPath, getMimeType, classifyMedia, getExtension }
