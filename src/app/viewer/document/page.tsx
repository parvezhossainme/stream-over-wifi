import { Suspense } from "react"
import { DocumentViewerPage } from "./document-viewer-page"

export default function Page() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <DocumentViewerPage />
    </Suspense>
  )
}
