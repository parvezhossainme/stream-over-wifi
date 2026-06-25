# Folder-based Video Browser (MX Player-like)

## Goal
Add a dedicated video browsing experience organized by folder — similar to MX Player — where users see all folders containing videos, can browse into a folder to see only its videos, and play them.

## Approach
New `/videos` page as the hub showing video-containing folders, with `/videos/[[...path]]` for browsing into a specific folder's videos. Existing file browser is untouched.

## Navigation & Entry Points
- Sidebar: "Videos" link (Film icon) above "Browse"
- Dashboard "Videos" category card → `/videos`
- No changes to existing browse/file browser

## API Endpoints

### `GET /api/video-folders`
Recursive scan from storage root (max 6 levels deep, skip system dirs like `Android/`, `data/`).
Returns `VideoFolder[]`:

```typescript
interface VideoFolder {
  name: string
  path: string
  videoCount: number
  thumbnailPath?: string  // path to first video for thumbnail
  totalSize: number
}
```

Sorted by videoCount descending. In-memory cache with 60s TTL.

### `GET /api/video-folder?path=...`
Lists video files in a specific folder (non-recursive, no subfolder mixing).
Returns:

```typescript
interface VideoFolderContent {
  path: string
  name: string
  videos: FileEntry[]
  count: number
}
```

## Pages & Components

### `/videos` (hub page)
- Fetches `GET /api/video-folders` on mount
- Grid of `VideoFolderCard` components
- Loading: skeleton grid
- Empty: "No video folders found"

### `VideoFolderCard`
- Thumbnail from `buildThumbUrl(folder.thumbnailPath)`, fallback film icon
- Folder name, video count badge, total size

### `/videos/[[...path]]` (folder contents)
- Fetches `GET /api/video-folder?path=...`
- Back button + breadcrumbs + folder name
- Grid of `VideoCard` components (video-only, larger thumbnails)
- Click → `/player/video?path=...`
- Sorting by name, date, size

### `VideoCard`
- Based on FileCard, simplified for video-only
- Larger thumbnail (2-col mobile, 3-4 desktop)
- Resume progress badge (from localStorage watch-progress)
- Filename, size, date

### Server-side (`src/server/files.ts`)
- `scanVideoFolders(basePath, maxDepth)` — recursive walker
- `getVideoFolderContents(folderPath)` — wrapper around existing listFolder

## Files to create/modify
- NEW `src/app/api/video-folders/route.ts`
- NEW `src/app/api/video-folder/route.ts`
- NEW `src/app/videos/page.tsx`
- NEW `src/app/videos/[[...path]]/page.tsx`
- NEW `src/components/video/folder-card.tsx`
- NEW `src/components/video/video-card.tsx`
- MODIFY `src/server/files.ts` — add scanVideoFolders, getVideoFolderContents
- MODIFY `src/components/layout/sidebar.tsx` — add Videos link
- MODIFY `src/components/dashboard/category-grid.tsx` — Videos card → `/videos`
- MODIFY `src/lib/api.ts` — add fetchVideoFolders, fetchVideoFolder, URL builders
- MODIFY `src/hooks/use-files.ts` — add useVideoFolders, useVideoFolder hooks
