import { FileExplorer } from "@/components/file-browser/file-explorer"

interface BrowsePageProps {
  params: Promise<{ path?: string[] }>
}

export default async function BrowsePage({ params }: BrowsePageProps) {
  const { path } = await params
  const currentPath = path && path.length > 0 ? "/" + path.join("/") : "/"

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <FileExplorer initialPath={currentPath} />
    </div>
  )
}
