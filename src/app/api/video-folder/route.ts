import { NextRequest, NextResponse } from 'next/server'
import { getVideoFolderContents } from '@/server/files'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folderPath = searchParams.get('path') || '/'
    const contents = await getVideoFolderContents(folderPath)
    return NextResponse.json(contents)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get video folder contents'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
