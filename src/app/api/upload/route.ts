import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { getFullPath, getMimeType, getExtension, fileExists } from '@/server/files'
import type { FileEntry } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const destPath = searchParams.get('path') || '/'
    const destFull = getFullPath(destPath)

    await fs.mkdir(destFull, { recursive: true })

    const formData = await request.formData()
    const uploaded: FileEntry[] = []

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const fileName = value.name
        const filePath = path.join(destPath, fileName)
        const fullFilePath = path.join(destFull, fileName)
        const ext = getExtension(fileName)

        const buffer = Buffer.from(await value.arrayBuffer())
        await fs.writeFile(fullFilePath, buffer)

        const stats = await fs.stat(fullFilePath)
        uploaded.push({
          name: fileName,
          path: filePath,
          type: 'file',
          mime: getMimeType(ext),
          size: stats.size,
          modified: stats.mtime,
          created: stats.birthtime,
          extension: ext || undefined,
        })
      }
    }

    return NextResponse.json({ files: uploaded, count: uploaded.length }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
