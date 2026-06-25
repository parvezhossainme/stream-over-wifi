"use client"

import { type ReactNode } from "react"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-white/10 bg-background/50 backdrop-blur-xl">
          <Sidebar />
        </aside>
        <ScrollArea className="flex-1">
          <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
