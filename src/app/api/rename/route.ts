import { NextRequest, NextResponse } from 'next/server'
import { renameFile, fileExists } from '@/server/files'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { path: filePath, name } = body

    if (!filePath || typeof filePath !== 'string') {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 })
    }
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'New name is required' }, { status: 400 })
    }

    const exists = await fileExists(filePath)
    if (!exists) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    await renameFile(filePath, name.trim())
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Rename failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
