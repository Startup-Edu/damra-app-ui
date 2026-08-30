import * as React from 'react'
import { cn } from '@/lib/utils'

export interface HighlightSearchProps {
  text: string
  query: string
  highlightClassName?: string
  className?: string
}

/**
 * Renders text with matching search query segments highlighted.
 */
export function HighlightSearch({
  text,
  query,
  highlightClassName = 'bg-amber-200/80 dark:bg-amber-500/30 text-amber-900 dark:text-amber-200 font-semibold rounded-[2px] px-0.5',
  className,
}: HighlightSearchProps) {
  if (!text) return null

  const trimmedQuery = query.trim()
  if (!trimmedQuery) return <span className={className}>{text}</span>

  // Escape special regex characters to avoid invalid regex patterns
  const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'))

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = part.toLowerCase() === trimmedQuery.toLowerCase()
        return isMatch ? (
          <mark key={index} className={cn('bg-transparent', highlightClassName)}>
            {part}
          </mark>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      })}
    </span>
  )
}
