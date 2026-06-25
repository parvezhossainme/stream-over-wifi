import { NextResponse } from 'next/server'
import { scanVideoFolders } from '@/server/files'

export async function GET() {
  try {
    const folders = await scanVideoFolders()
    return NextResponse.json(folders)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to scan video folders'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
