import { Suspense } from "react"
import { SearchPage } from "./search-page"

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <SearchPage />
    </Suspense>
  )
}
