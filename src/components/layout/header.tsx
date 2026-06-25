"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Wifi, Search, Sun, Moon, Menu, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useNetwork } from "@/hooks/use-files"
import { Sidebar } from "./sidebar"

export function Header() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { data: network } = useNetwork()
  const [searchQuery, setSearchQuery] = useState("")
  const [showQR, setShowQR] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState("")

  const connectionUrl = network?.interfaces?.[0]
    ? `http://${network.interfaces[0].address}:${network.port}`
    : ""

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      }
    },
    [searchQuery, router]
  )

  const handleShowQR = useCallback(async () => {
    if (!connectionUrl) return
    try {
      const QRCode = await import("qrcode")
      const url = await QRCode.default.toDataURL(connectionUrl, {
        width: 256,
        margin: 2,
        color: { dark: "#ffffff", light: "#00000000" },
      })
      setQrDataUrl(url)
      setShowQR(true)
    } catch {}
  }, [connectionUrl])

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-white/10 bg-background/80 backdrop-blur-xl px-4 md:px-6">
      <Sheet>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" className="md:hidden" />
          }
        >
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="px-4 pt-4 pb-2">
            <SheetTitle className="flex items-center gap-2">
              <Wifi className="size-5 text-primary" />
              <span>Stream on WiFi</span>
            </SheetTitle>
          </SheetHeader>
          <Sidebar />
        </SheetContent>
      </Sheet>

      <a href="/" className="flex items-center gap-2 shrink-0">
        <Wifi className="size-5 text-primary" />
        <span className="hidden sm:inline text-sm font-semibold">
          Stream on WiFi
        </span>
      </a>

      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="pl-8 h-8 bg-muted/50 border-muted"
          />
        </div>
      </form>

      <div className="flex items-center gap-1">
        {connectionUrl && (
          <>
            <Button variant="ghost" size="icon" onClick={handleShowQR}>
              <QrCode className="size-4" />
            </Button>

            {showQR && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                onClick={() => setShowQR(false)}
              >
                <div
                  className="rounded-2xl bg-card p-6 ring-1 ring-white/10 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-sm font-medium text-center">
                      Scan to connect
                    </p>
                    {qrDataUrl && (
                      <img
                        src={qrDataUrl}
                        alt="QR Code"
                        className="size-48 rounded-lg"
                      />
                    )}
                    <p className="text-xs text-muted-foreground text-center break-all max-w-[200px]">
                      {connectionUrl}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowQR(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {network?.interfaces?.[0] && (
          <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/50 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-green-500" />
            {network.interfaces[0].address}:{network.port}
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  )
}
