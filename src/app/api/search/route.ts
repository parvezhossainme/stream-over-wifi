import { NextRequest, NextResponse } from 'next/server'
import { searchFiles } from '@/server/files'
import type { SearchResult } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const basePath = searchParams.get('path') || undefined

    if (!query || query.trim().length === 0) {
      return NextResponse.json<SearchResult>({ query: '', results: [], total: 0 })
    }

    const results = await searchFiles(query.trim(), basePath)
    return NextResponse.json<SearchResult>({
      query: query.trim(),
      results,
      total: results.length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
