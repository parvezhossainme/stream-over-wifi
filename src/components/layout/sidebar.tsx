"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Compass,
  Heart,
  Film,
  Image,
  Music,
  FileText,
  Download,
  Folder,
  Pin,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { PinFolder } from "@/types"
import { CATEGORIES } from "@/lib/constants"
import { Separator } from "@/components/ui/separator"

const quickLinks: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Videos", href: "/videos", icon: Film },
  { label: "Browse", href: "/browse", icon: Compass },
]

const categoryIconMap: Record<string, LucideIcon> = {
  Film,
  Image,
  Music,
  FileText,
  Download,
}

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [pinnedFolders] = useLocalStorage<PinFolder[]>("pinned-folders", [])

  return (
    <nav className={cn("flex h-full flex-col gap-1 overflow-y-auto p-3", className)}>
      <div className="space-y-0.5">
        <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Quick Links
        </p>
        {quickLinks.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {link.label}
            </Link>
          )
        })}
      </div>

      <Separator className="my-2" />

      <div className="space-y-0.5">
        <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Categories
        </p>
        {CATEGORIES.map((cat) => {
          const Icon = categoryIconMap[cat.icon] ?? Folder
          const isActive = pathname === `/browse?filter=${cat.id}`
          return (
            <Link
              key={cat.id}
              href={`/browse?filter=${cat.id}`}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {cat.label}
            </Link>
          )
        })}
      </div>

      {pinnedFolders.length > 0 && (
        <>
          <Separator className="my-2" />
          <div className="space-y-0.5">
            <p className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              <Pin className="size-3" />
              Pinned Folders
            </p>
            {pinnedFolders.map((folder) => {
              const isActive = pathname === `/browse/${folder.path}`
              return (
                <Link
                  key={folder.path}
                  href={`/browse/${encodeURIComponent(folder.path)}`}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <Folder className="size-4 shrink-0" />
                  <span className="truncate">{folder.name}</span>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </nav>
  )
}
