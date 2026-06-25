"use client"

import { useState, useEffect } from "react"
import { buildStreamUrl, buildImageUrl, buildDownloadUrl } from "@/lib/api"
import type { FileEntry } from "@/types"
import { formatBytes, formatDate } from "@/lib/format"
import { FileText, FileDown, ImageIcon, File, Loader2, AlertCircle } from "lucide-react"

interface DocumentViewerProps {
  file: FileEntry
}

type DocType = "text" | "markdown" | "pdf" | "image" | "other"

function getDocType(file: FileEntry): DocType {
  const ext = file.extension?.toLowerCase()
  if (ext === ".txt") return "text"
  if (ext === ".md") return "markdown"
  if (ext === ".pdf") return "pdf"
  if (file.mime?.startsWith("image/") || [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg", ".avif"].includes(ext || "")) {
    return "image"
  }
  return "other"
}

export function DocumentViewer({ file }: DocumentViewerProps) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [renderMd, setRenderMd] = useState(false)

  const docType = getDocType(file)
  const streamUrl = buildStreamUrl(file.path)
  const downloadUrl = buildDownloadUrl(file.path)

  useEffect(() => {
    if (docType !== "text" && docType !== "markdown") return

    setLoading(true)
    setError(null)
    setRenderMd(docType === "markdown")

    fetch(streamUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load document")
        return res.text()
      })
      .then((text) => {
        setContent(text)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [file.path, docType, streamUrl])

  if (docType === "image") {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-900/50 p-4">
        <img
          src={buildImageUrl(file.path)}
          alt={file.name}
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
        />
      </div>
    )
  }

  if (docType === "pdf") {
    return (
      <div className="flex-1 flex flex-col bg-zinc-900/30">
        <iframe
          src={`${streamUrl}#view=FitH`}
          className="flex-1 w-full border-none"
          title={file.name}
        />
      </div>
    )
  }

  if (docType === "other") {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <File className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-white text-lg font-medium mb-2">{file.name}</h3>
          <p className="text-zinc-400 text-sm mb-1">
            {formatBytes(file.size)} &middot; {formatDate(file.modified)}
          </p>
          <p className="text-zinc-500 text-xs mb-6">
            This file type cannot be previewed inline.
          </p>
          <a
            href={downloadUrl}
            download
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Download File
          </a>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-zinc-400 text-sm">{error}</p>
        <a
          href={downloadUrl}
          download
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
        >
          <FileDown className="w-4 h-4" />
          Download Instead
        </a>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
          <FileText className="w-5 h-5 text-white/40" />
          <div>
            <h2 className="text-white text-sm font-medium">{file.name}</h2>
            <p className="text-zinc-500 text-xs">{formatBytes(file.size)}</p>
          </div>
        </div>

        {renderMd ? (
          <MarkdownRenderer content={content || ""} />
        ) : (
          <pre className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
            {content}
          </pre>
        )}
      </div>
    </div>
  )
}

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n")
  const elements: React.ReactNode[] = []
  let inCodeBlock = false
  let codeContent = ""
  let codeLang = ""

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="bg-zinc-900 rounded-lg p-4 my-3 overflow-x-auto">
            <code className="text-sm text-zinc-200 font-mono whitespace-pre-wrap">{codeContent}</code>
          </pre>
        )
        codeContent = ""
        codeLang = ""
        inCodeBlock = false
      } else {
        inCodeBlock = true
        codeLang = line.slice(3).trim()
      }
      continue
    }

    if (inCodeBlock) {
      codeContent += (codeContent ? "\n" : "") + line
      continue
    }

    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="text-2xl font-bold text-white mt-6 mb-3">{line.slice(2)}</h1>
      )
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-xl font-semibold text-white mt-5 mb-2">{line.slice(3)}</h2>
      )
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-lg font-medium text-white mt-4 mb-2">{line.slice(4)}</h3>
      )
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li key={i} className="text-zinc-300 text-sm ml-4 list-disc">{line.slice(2)}</li>
      )
    } else if (/^\d+\.\s/.test(line)) {
      elements.push(
        <li key={i} className="text-zinc-300 text-sm ml-4 list-decimal">{line.replace(/^\d+\.\s/, "")}</li>
      )
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i} className="border-l-2 border-white/20 pl-4 my-2 text-zinc-400 text-sm italic">{line.slice(2)}</blockquote>
      )
    } else if (line.startsWith("---") || line.startsWith("***")) {
      elements.push(<hr key={i} className="border-white/10 my-4" />)
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-3" />)
    } else {
      const rendered = renderInlineMarkdown(line)
      elements.push(
        <p key={i} className="text-zinc-300 text-sm leading-relaxed mb-1">{rendered}</p>
      )
    }
  }

  if (inCodeBlock) {
    elements.push(
      <pre key="code-end" className="bg-zinc-900 rounded-lg p-4 my-3 overflow-x-auto">
        <code className="text-sm text-zinc-200 font-mono whitespace-pre-wrap">{codeContent}</code>
      </pre>
    )
  }

  return <div className="space-y-0.5">{elements}</div>
}

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0

  const boldRegex = /\*\*(.+?)\*\*/g
  const italicRegex = /\*(.+?)\*/g
  const inlineCodeRegex = /`(.+?)`/g
  const linkRegex = /\[(.+?)\]\((.+?)\)/g

  const regex = /(\*\*.+?\*\*|\*.+?\*|`.+?`|\[.+?\]\(.+?\))/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(remaining)) !== null) {
    const before = remaining.slice(0, match.index)
    if (before) {
      parts.push(<span key={key++}>{before}</span>)
    }

    const matched = match[0]
    if (matched.startsWith("**") && matched.endsWith("**")) {
      parts.push(<strong key={key++} className="text-white font-semibold">{matched.slice(2, -2)}</strong>)
    } else if (matched.startsWith("*") && matched.endsWith("*") && !matched.startsWith("**")) {
      parts.push(<em key={key++} className="italic text-zinc-300">{matched.slice(1, -1)}</em>)
    } else if (matched.startsWith("`") && matched.endsWith("`")) {
      parts.push(
        <code key={key++} className="bg-zinc-800 text-zinc-200 px-1.5 py-0.5 rounded text-xs font-mono">
          {matched.slice(1, -1)}
        </code>
      )
    } else if (matched.startsWith("[") && matched.includes("](")) {
      const linkMatch = matched.match(/\[(.+?)\]\((.+?)\)/)
      if (linkMatch) {
        parts.push(
          <a key={key++} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
            {linkMatch[1]}
          </a>
        )
      }
    }

    remaining = remaining.slice(match.index + matched.length)
    regex.lastIndex = 0
  }

  if (remaining) {
    parts.push(<span key={key++}>{remaining}</span>)
  }

  return parts.length > 0 ? <>{parts}</> : text
}
