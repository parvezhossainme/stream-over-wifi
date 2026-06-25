import { NextRequest } from 'next/server'
import fs from 'fs'
import { stat } from 'fs/promises'
import path from 'path'
import { getFullPath, getMimeType, getExtension } from '@/server/files'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params
    const filePath = '/' + pathSegments.join('/')
    const fullPath = getFullPath(filePath)
    const fileName = path.basename(filePath)
    const stats = await stat(fullPath)
    const ext = getExtension(filePath)
    const mimeType = getMimeType(ext)

    const stream = fs.createReadStream(fullPath)
    const encodedName = encodeURIComponent(fileName)

    return new Response(stream as unknown as ReadableStream, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': String(stats.size),
        'Content-Disposition': `attachment; filename*=UTF-8''${encodedName}`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return new Response('File not found', { status: 404 })
    }
    return new Response('Download failed', { status: 500 })
  }
}
