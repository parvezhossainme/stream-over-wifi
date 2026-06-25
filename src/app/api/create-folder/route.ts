import { NextRequest, NextResponse } from 'next/server'
import { createFolder, fileExists } from '@/server/files'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { path: folderPath } = body

    if (!folderPath || typeof folderPath !== 'string') {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 })
    }

    const exists = await fileExists(folderPath)
    if (exists) {
      return NextResponse.json({ error: 'Folder already exists' }, { status: 409 })
    }

    await createFolder(folderPath)
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create folder'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
