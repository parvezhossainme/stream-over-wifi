import { NextRequest } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import * as sharp from 'sharp'
import { getFullPath, getExtension, classifyMedia } from '@/server/files'
import { THUMBNAIL_CACHE_DIR } from '@/lib/constants'

const THUMB_SIZE = 200

function getThumbnailCachePath(filePath: string): string {
  const thumbDir = path.join(path.dirname(getFullPath(filePath)), THUMBNAIL_CACHE_DIR)
  const fileName = path.basename(filePath) + '_thumb_' + THUMB_SIZE + '.webp'
  return path.join(thumbDir, fileName)
}

function getVideoPlaceholder(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${THUMB_SIZE}" height="${THUMB_SIZE}" viewBox="0 0 ${THUMB_SIZE} ${THUMB_SIZE}">
    <rect width="${THUMB_SIZE}" height="${THUMB_SIZE}" fill="#1a1a2e"/>
    <polygon points="${THUMB_SIZE*0.35},${THUMB_SIZE*0.3} ${THUMB_SIZE*0.35},${THUMB_SIZE*0.7} ${THUMB_SIZE*0.7},${THUMB_SIZE*0.5}" fill="#ffffff" opacity="0.8"/>
    <circle cx="${THUMB_SIZE/2}" cy="${THUMB_SIZE/2}" r="${THUMB_SIZE*0.4}" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.3"/>
  </svg>`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params
    const filePath = '/' + pathSegments.join('/')
    const fullPath = getFullPath(filePath)
    const ext = getExtension(filePath)
    const mediaType = classifyMedia(ext)
    const cachePath = getThumbnailCachePath(filePath)

    try {
      await fs.mkdir(path.dirname(cachePath), { recursive: true })
    } catch {}

    const cachedStat = await fs.stat(cachePath).catch(() => null)
    const sourceStat = await fs.stat(fullPath).catch(() => null)

    if (cachedStat && sourceStat && cachedStat.mtimeMs >= sourceStat.mtimeMs) {
      return new Response(await fs.readFile(cachePath) as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=86400',
        },
      })
    }

    if (mediaType === 'image') {
      const buffer = await sharp.default(fullPath)
        .resize({ width: THUMB_SIZE, height: THUMB_SIZE, fit: 'cover', position: 'centre' } as sharp.ResizeOptions)
        .webp({ quality: 80 })
        .toBuffer()

      await fs.writeFile(cachePath, buffer).catch(() => {})
      return new Response(buffer as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=86400',
        },
      })
    }

    if (mediaType === 'video') {
      const placeholder = getVideoPlaceholder()
      await fs.writeFile(cachePath, new TextEncoder().encode(placeholder)).catch(() => {})
      return new Response(placeholder, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=86400',
        },
      })
    }

    return new Response('Cannot generate thumbnail for this file type', { status: 400 })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return new Response('File not found', { status: 404 })
    }
    return new Response('Thumbnail generation failed', { status: 500 })
  }
}
