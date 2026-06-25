import { NextRequest, NextResponse } from 'next/server'
import { listFolder } from '@/server/files'
import type { FileFilter, SortField, SortOrder } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path') || '/'
    const filter = (searchParams.get('filter') as FileFilter) || undefined
    const sort = (searchParams.get('sort') as SortField) || undefined
    const order = (searchParams.get('order') as SortOrder) || undefined

    const content = await listFolder(path, filter, sort, order)
    return NextResponse.json(content)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list files'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
