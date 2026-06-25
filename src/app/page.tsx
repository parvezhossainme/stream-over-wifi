"use client"

import { motion } from "framer-motion"
import { useNetwork } from "@/hooks/use-files"
import { StorageCard } from "@/components/dashboard/storage-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { CategoryGrid } from "@/components/dashboard/category-grid"
import { RecentFiles } from "@/components/dashboard/recent-files"
import { PinnedFolders } from "@/components/dashboard/pinned-folders"

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function DashboardPage() {
  const { data: network } = useNetwork()

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your media library at a glance
          {network?.interfaces[0] && (
            <span className="ml-2 text-xs">
              · http://{network.interfaces[0].address}:{network.port}
            </span>
          )}
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="sm:col-span-2 lg:col-span-1">
          <StorageCard />
        </div>
        <div className="sm:col-span-2 lg:col-span-3 flex items-end">
          <QuickActions />
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <CategoryGrid />
      </motion.div>

      <motion.div variants={itemVariants}>
        <RecentFiles />
      </motion.div>

      <motion.div variants={itemVariants}>
        <PinnedFolders />
      </motion.div>
    </motion.div>
  )
}
