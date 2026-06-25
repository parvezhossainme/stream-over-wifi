"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Film,
  Image,
  Music,
  FileText,
  Download,
  Folder,
  type LucideIcon,
} from "lucide-react"
import { useFiles } from "@/hooks/use-files"
import type { FileFilter } from "@/types"
import { CATEGORIES } from "@/lib/constants"
import { cn } from "@/lib/utils"

const iconMap: Record<string, LucideIcon> = {
  Film,
  Image,
  Music,
  FileText,
  Download,
}

const gradientMap: Record<string, string> = {
  videos: "from-blue-600/20 via-blue-500/10 to-transparent",
  images: "from-green-600/20 via-green-500/10 to-transparent",
  audio: "from-purple-600/20 via-purple-500/10 to-transparent",
  documents: "from-orange-600/20 via-orange-500/10 to-transparent",
  downloads: "from-cyan-600/20 via-cyan-500/10 to-transparent",
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

function CategoryCard({
  category,
}: {
  category: (typeof CATEGORIES)[number]
}) {
  const filter =
    category.id === "downloads"
      ? "all"
      : (category.id as FileFilter)
  const { data } = useFiles(category.paths[0], filter, "name", "asc")
  const Icon = iconMap[category.icon] ?? Folder
  const gradient = gradientMap[category.id] ?? "from-muted/50 to-transparent"
  const path = category.paths[0]
  const count = data?.files.length ?? 0

  return (
    <Link
      href={`/browse?path=${encodeURIComponent(path)}&filter=${category.id}`}
      className={cn(
        "group relative flex flex-col items-center gap-2 rounded-xl p-4",
        "bg-card/50 ring-1 ring-white/10 backdrop-blur-sm",
        "transition-all duration-200 hover:ring-white/20 hover:scale-[1.02]",
        "overflow-hidden"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity group-hover:opacity-70",
          gradient
        )}
      />
      <div className="relative flex size-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-5 text-primary" />
      </div>
      <span className="relative text-sm font-medium">{category.label}</span>
      <span className="relative text-[11px] text-muted-foreground">
        {count} file{count !== 1 ? "s" : ""}
      </span>
    </Link>
  )
}

export function CategoryGrid() {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Categories</h2>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        {CATEGORIES.map((cat) => (
          <motion.div key={cat.id} variants={itemVariants}>
            <CategoryCard category={cat} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
