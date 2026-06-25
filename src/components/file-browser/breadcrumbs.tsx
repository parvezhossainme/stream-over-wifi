"use client"

import Link from "next/link"
import { ChevronRightIcon, HomeIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbsProps {
  path: string
}

function buildBreadcrumbs(path: string) {
  const segments = path.split("/").filter(Boolean)
  const crumbs: { label: string; href: string }[] = []
  let accumulated = ""
  for (const segment of segments) {
    accumulated += "/" + segment
    crumbs.push({ label: segment, href: "/browse" + accumulated })
  }
  return crumbs
}

export function Breadcrumbs({ path }: BreadcrumbsProps) {
  const crumbs = buildBreadcrumbs(path)
  const isRoot = crumbs.length === 0

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 min-w-0">
      <Link
        href="/browse"
        className={cn(
          "flex items-center gap-1 text-sm text-muted-foreground transition-colors shrink-0",
          "hover:text-foreground",
          isRoot && "pointer-events-none text-foreground"
        )}
      >
        <HomeIcon className="size-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1
        return (
          <div key={crumb.href} className="flex items-center gap-1 min-w-0">
            <ChevronRightIcon className="size-3.5 shrink-0 text-muted-foreground/50" />
            {isLast ? (
              <span className="truncate text-sm font-medium text-foreground max-w-[160px] sm:max-w-[300px]">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="truncate text-sm text-muted-foreground transition-colors hover:text-foreground max-w-[120px] sm:max-w-[200px]"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
