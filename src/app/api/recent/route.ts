import { NextRequest, NextResponse } from 'next/server'
import { getRecentFiles } from '@/server/files'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const count = parseInt(searchParams.get('count') || '20', 10)
    const safeCount = Math.min(Math.max(count, 1), 200)

    const files = await getRecentFiles(safeCount)
    return NextResponse.json({ files, count: files.length })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get recent files'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
