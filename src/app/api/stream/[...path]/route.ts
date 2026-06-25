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

    if (!fullPath) {
      return new Response('File not found', { status: 404 })
    }

    const stats = await stat(fullPath)
    const ext = getExtension(filePath)
    const mimeType = getMimeType(ext)

    const rangeHeader = request.headers.get('range')
    const fileSize = stats.size

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
      const chunkSize = end - start + 1

      if (start >= fileSize) {
        return new Response('Range not satisfiable', {
          status: 416,
          headers: {
            'Content-Range': `bytes */${fileSize}`,
          },
        })
      }

      const stream = fs.createReadStream(fullPath, { start, end })

      const headers = new Headers({
        'Content-Type': mimeType,
        'Content-Length': String(chunkSize),
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache',
        'Content-Disposition': 'inline',
      })

      return new Response(stream as unknown as ReadableStream, {
        status: 206,
        headers,
      })
    }

    const stream = fs.createReadStream(fullPath)
    const headers = new Headers({
      'Content-Type': mimeType,
      'Content-Length': String(fileSize),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache',
      'Content-Disposition': 'inline',
    })

    return new Response(stream as unknown as ReadableStream, {
      status: 200,
      headers,
    })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return new Response('File not found', { status: 404 })
    }
    return new Response('Stream error', { status: 500 })
  }
}
