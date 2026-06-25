import { NextRequest } from 'next/server'
import fs from 'fs/promises'
import * as sharp from 'sharp'
import { getFullPath, getMimeType, getExtension } from '@/server/files'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params
    const filePath = '/' + pathSegments.join('/')
    const fullPath = getFullPath(filePath)
    const ext = getExtension(filePath)
    const mimeType = getMimeType(ext)

    const { searchParams } = new URL(request.url)
    const width = searchParams.get('width')
    const height = searchParams.get('height')

    const sourceBuffer = await fs.readFile(fullPath)

    if (width || height) {
      const resized = await sharp.default(sourceBuffer)
        .resize({
          width: width ? parseInt(width, 10) : undefined,
          height: height ? parseInt(height, 10) : undefined,
          fit: 'inside',
          withoutEnlargement: true,
        } as sharp.ResizeOptions)
        .toBuffer()

      return new Response(resized as unknown as BodyInit, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Length': String(resized.length),
          'Cache-Control': 'public, max-age=86400',
        },
      })
    }

    return new Response(sourceBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': String(sourceBuffer.length),
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return new Response('Image not found', { status: 404 })
    }
    return new Response('Failed to serve image', { status: 500 })
  }
}
