import { NextResponse } from 'next/server'
import { getStorageInfo } from '@/server/files'

export async function GET() {
  try {
    const info = await getStorageInfo()
    return NextResponse.json(info)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get storage info'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
