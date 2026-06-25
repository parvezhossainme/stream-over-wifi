import { Suspense } from "react"
import { VideoPlayerPage } from "./video-player-page"

export default function Page() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <VideoPlayerPage />
    </Suspense>
  )
}
