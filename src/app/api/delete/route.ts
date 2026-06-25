import { NextRequest, NextResponse } from 'next/server'
import { deleteFile, fileExists } from '@/server/files'

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { path: filePath } = body

    if (!filePath || typeof filePath !== 'string') {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 })
    }

    const exists = await fileExists(filePath)
    if (!exists) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    await deleteFile(filePath)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
