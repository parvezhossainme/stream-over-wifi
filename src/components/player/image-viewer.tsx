"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { buildImageUrl } from "@/lib/api"
import type { FileEntry } from "@/types"
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  ImageIcon,
  Loader2,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ImageViewerProps {
  images: FileEntry[]
  initialIndex?: number
  onClose?: () => void
}

export function ImageViewer({ images, initialIndex = 0, onClose }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [slideshow, setSlideshow] = useState(false)
  const [slideshowSpeed, setSlideshowSpeed] = useState(4000)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [loading, setLoading] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const slideshowTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef<{ x: number; y: number; distance?: number }>({ x: 0, y: 0 })
  const lastTapRef = useRef(0)

  const currentImage = images[currentIndex]

  const totalImages = images.length

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setLoading(true)
  }, [currentIndex])

  useEffect(() => {
    if (slideshow) {
      slideshowTimerRef.current = setTimeout(() => {
        setCurrentIndex((i) => (i + 1) % images.length)
      }, slideshowSpeed)
    }
    return () => clearTimeout(slideshowTimerRef.current)
  }, [slideshow, currentIndex, images.length, slideshowSpeed])

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % images.length)
  }, [images.length])

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + images.length) % images.length)
  }, [images.length])

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  const resetZoom = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(5, s + 0.5))
  }, [])

  const zoomOut = useCallback(() => {
    setScale((s) => {
      const newScale = Math.max(0.5, s - 0.5)
      if (newScale === 1) setPosition({ x: 0, y: 0 })
      return newScale
    })
  }, [])

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true)
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
    controlsTimerRef.current = setTimeout(() => setShowControls(false), 2500)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          if (isFullscreen) {
            document.exitFullscreen()
            setIsFullscreen(false)
          } else {
            onClose?.()
          }
          break
        case "ArrowLeft":
          e.preventDefault()
          goPrev()
          break
        case "ArrowRight":
          e.preventDefault()
          goNext()
          break
        case "+":
        case "=":
          e.preventDefault()
          zoomIn()
          break
        case "-":
          e.preventDefault()
          zoomOut()
          break
        case "f":
        case "F":
          toggleFullscreen()
          break
        case " ":
          e.preventDefault()
          setSlideshow((s) => !s)
          break
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [goNext, goPrev, zoomIn, zoomOut, toggleFullscreen, isFullscreen, onClose])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      setScale((s) => Math.min(5, s + 0.2))
    } else {
      setScale((s) => {
        const newScale = Math.max(0.5, s - 0.2)
        if (newScale === 1) setPosition({ x: 0, y: 0 })
        return newScale
      })
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => setIsDragging(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, distance: Math.sqrt(dx * dx + dy * dy) }
    } else {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const startDistance = touchStartRef.current.distance
      if (startDistance) {
        const newScale = scale * (distance / startDistance)
        setScale(Math.max(0.5, Math.min(5, newScale)))
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length === 1 && touchStartRef.current.distance === undefined) {
      const diffX = e.changedTouches[0].clientX - touchStartRef.current.x
      const diffY = e.changedTouches[0].clientY - touchStartRef.current.y
      const now = Date.now()

      if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
        if (now - lastTapRef.current < 300) {
          if (scale > 1) resetZoom()
          else setScale(2.5)
        }
        lastTapRef.current = now
      }

      if (Math.abs(diffX) > 50 && Math.abs(diffY) < 50 && scale === 1) {
        if (diffX > 0) goPrev()
        else goNext()
      }
    }
    touchStartRef.current = { x: 0, y: 0 }
  }

  if (images.length === 0) return null

  const preloadUrls = [
    images[(currentIndex + 1) % images.length],
    images[(currentIndex - 1 + images.length) % images.length],
  ].map((img) => buildImageUrl(img.path))

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      onMouseMove={showControlsTemporarily}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {preloadUrls.map((url) => (
        <link key={url} rel="prefetch" href={url} />
      ))}

      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1.5">
                <X className="w-5 h-5" />
              </button>
              <div className="text-white text-sm">
                <span className="font-medium">{currentIndex + 1}</span>
                <span className="text-white/50"> / {totalImages}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentImage && (
                <span className="text-white/50 text-xs truncate max-w-[200px] hidden sm:block">
                  {currentImage.name}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-white/40 animate-spin" />
          </div>
        )}
        <motion.img
          key={currentIndex}
          src={buildImageUrl(currentImage.path)}
          alt={currentImage.name}
          className="max-w-full max-h-full object-contain select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            cursor: scale > 1 ? "grab" : "default",
          }}
          draggable={false}
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        />
      </div>

      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/60 to-transparent"
          >
            <div className="flex items-center justify-center gap-4 py-3">
              <button
                onClick={() => setSlideshowSpeed((s) => (s === 1000 ? 4000 : s === 4000 ? 8000 : 1000))}
                className={`text-xs transition-colors ${slideshow ? "text-white" : "text-white/50 hover:text-white/80"}`}
              >
                {slideshowSpeed / 1000}s
              </button>

              <button onClick={zoomOut} className="text-white/70 hover:text-white transition-colors p-1.5" title="Zoom out">
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="text-white/40 text-xs tabular-nums w-8 text-center">{Math.round(scale * 100)}%</span>

              <button onClick={zoomIn} className="text-white/70 hover:text-white transition-colors p-1.5" title="Zoom in">
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="w-px h-5 bg-white/20" />

              <button onClick={goPrev} className="text-white/70 hover:text-white transition-colors p-1.5" title="Previous">
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => setSlideshow(!slideshow)}
                className={`p-2 rounded-full transition-colors ${slideshow ? "bg-white text-black" : "text-white/70 hover:text-white"}`}
                title={slideshow ? "Pause slideshow" : "Start slideshow"}
              >
                {slideshow ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button onClick={goNext} className="text-white/70 hover:text-white transition-colors p-1.5" title="Next">
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="w-px h-5 bg-white/20" />

              <button onClick={toggleFullscreen} className="text-white/70 hover:text-white transition-colors p-1.5" title="Fullscreen">
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex justify-center pb-3 px-4">
              <div className="flex gap-1.5 overflow-x-auto max-w-full">
                {images.map((img, i) => (
                  <button
                    key={img.path}
                    onClick={() => setCurrentIndex(i)}
                    className={`shrink-0 w-10 h-10 rounded-md overflow-hidden border-2 transition-all ${
                      i === currentIndex ? "border-white opacity-100" : "border-transparent opacity-50 hover:opacity-80"
                    }`}
                  >
                    <img
                      src={buildImageUrl(img.path)}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
