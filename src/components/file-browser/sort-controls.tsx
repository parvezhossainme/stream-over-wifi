"use client"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  ArrowUpDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FilterIcon,
} from "lucide-react"
import type { SortField, SortOrder, FileFilter } from "@/types"

interface SortControlsProps {
  sort: SortField
  order: SortOrder
  filter: FileFilter
  onSortChange: (sort: SortField) => void
  onOrderChange: (order: SortOrder) => void
  onFilterChange: (filter: FileFilter) => void
}

const sortOptions: { value: SortField; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "date", label: "Date" },
  { value: "size", label: "Size" },
  { value: "type", label: "Type" },
]

const filterOptions: { value: FileFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "videos", label: "Videos" },
  { value: "images", label: "Images" },
  { value: "audio", label: "Audio" },
  { value: "documents", label: "Documents" },
  { value: "folders", label: "Folders" },
]

const sortLabels: Record<SortField, string> = {
  name: "Name",
  date: "Date",
  size: "Size",
  type: "Type",
}

const filterLabels: Record<FileFilter, string> = {
  all: "All",
  videos: "Videos",
  images: "Images",
  audio: "Audio",
  documents: "Documents",
  folders: "Folders",
}

export function SortControls({
  sort,
  order,
  filter,
  onSortChange,
  onOrderChange,
  onFilterChange,
}: SortControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
          <ArrowUpDownIcon className="size-3.5" />
          <span className="hidden sm:inline">{sortLabels[sort]}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuRadioGroup
            value={sort}
            onValueChange={(v) => onSortChange(v as SortField)}
          >
            {sortOptions.map((opt) => (
              <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                {opt.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="icon-sm"
        onClick={() =>
          onOrderChange(order === "asc" ? "desc" : "asc")
        }
        aria-label={order === "asc" ? "Ascending" : "Descending"}
      >
        {order === "asc" ? (
          <ArrowUpIcon className="size-3.5" />
        ) : (
          <ArrowDownIcon className="size-3.5" />
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
          <FilterIcon className="size-3.5" />
          <span className="hidden sm:inline">{filterLabels[filter]}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup
            value={filter}
            onValueChange={(v) => onFilterChange(v as FileFilter)}
          >
            {filterOptions.map((opt) => (
              <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                {opt.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
