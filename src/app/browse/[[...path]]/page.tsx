import { FileExplorer } from "@/components/file-browser/file-explorer"
import type { FileFilter } from "@/types"

interface BrowsePageProps {
  params: Promise<{ path?: string[] }>
  searchParams: Promise<{ filter?: string }>
}

export default async function BrowsePage({ params, searchParams }: BrowsePageProps) {
  const { path } = await params
  const { filter } = await searchParams
  const currentPath = path && path.length > 0 ? "/" + path.join("/") : "/"

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <FileExplorer initialPath={currentPath} initialFilter={filter as FileFilter} />
    </div>
  )
}
