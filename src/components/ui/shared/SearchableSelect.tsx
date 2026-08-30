import * as React from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Check, ChevronsUpDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { HighlightSearch } from '@/components/ui/shared/HighlightSearch'

export interface SearchableSelectOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
  [key: string]: any
}

export type SortableOptionProp =
  | boolean
  | 'asc'
  | 'desc'
  | ((a: SearchableSelectOption, b: SearchableSelectOption) => number)

export interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  clearable?: boolean
  sortable?: SortableOptionProp
  className?: string
  triggerClassName?: string
  contentClassName?: string
  estimateSize?: number
  minHeight?: number
  maxHeight?: number
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found.',
  disabled = false,
  clearable = true,
  sortable = false,
  className,
  triggerClassName,
  contentClassName,
  estimateSize = 38,
  minHeight = 190, // Show at least 5 items (5 * 38 = 190px)
  maxHeight = 280,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const parentRef = React.useRef<HTMLDivElement>(null)

  const selectedOption = React.useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  )

  // Filter and sort options
  const filteredOptions = React.useMemo(() => {
    let result = options
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(
        (opt) =>
          opt.label.toLowerCase().includes(query) ||
          (opt.description && opt.description.toLowerCase().includes(query))
      )
    }

    if (sortable) {
      result = [...result]
      if (typeof sortable === 'function') {
        result.sort(sortable)
      } else if (sortable === 'desc') {
        result.sort((a, b) => b.label.localeCompare(a.label))
      } else {
        result.sort((a, b) => a.label.localeCompare(b.label))
      }
    }

    return result
  }, [options, searchQuery, sortable])

  // Virtualizer setup
  const rowVirtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 5,
  })

  // Measure container immediately on layout mount & open
  React.useLayoutEffect(() => {
    if (open) {
      rowVirtualizer.measure()
      const raf = requestAnimationFrame(() => {
        rowVirtualizer.measure()
      })
      return () => cancelAnimationFrame(raf)
    }
  }, [open, searchQuery, filteredOptions.length])

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  // Get virtual items or fallback if initial measurement hasn't completed
  const rawVirtualItems = rowVirtualizer.getVirtualItems()
  const virtualItems = React.useMemo(() => {
    if (rawVirtualItems.length > 0) {
      return rawVirtualItems
    }
    return filteredOptions.slice(0, 50).map((_, index) => ({
      index,
      start: index * estimateSize,
      size: estimateSize,
      key: index,
    }))
  }, [rawVirtualItems, filteredOptions, estimateSize])

  const totalContentHeight = rowVirtualizer.getTotalSize() || filteredOptions.length * estimateSize
  const containerHeight = Math.min(
    Math.max(filteredOptions.length * estimateSize, minHeight),
    maxHeight
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-[220px] justify-between h-9.5! px-3 text-xs font-normal border border-input bg-input/20 transition-colors outline-none hover:bg-input/30 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 data-[state=open]:border-primary data-[state=open]:ring-2 data-[state=open]:ring-primary/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50",
            !selectedOption && "text-muted-foreground",
            triggerClassName,
            className
          )}
        >
          <span className="truncate flex-1 text-left">
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          <div className="flex items-center gap-1 shrink-0 ml-1">
            {clearable && selectedOption && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                className="opacity-50 hover:opacity-100 p-0.5 rounded transition-opacity"
              >
                <X className="h-3 w-3" />
              </span>
            )}
            <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className={cn(
          "w-[260px] p-0 shadow-lg border border-border bg-popover text-popover-foreground",
          contentClassName
        )}
        align="start"
      >
        <div className="flex flex-col">
          {/* Search Header */}
          <div className="flex items-center border-b px-3 py-2 border-border shrink-0">
            <Search className="mr-2 h-3.5 w-3.5 shrink-0 opacity-50" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground text-foreground"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="opacity-50 hover:opacity-100 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Options Container */}
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            <div
              ref={parentRef}
              style={{
                height: `${containerHeight}px`,
                maxHeight: `${maxHeight}px`,
              }}
              className="overflow-y-auto custom-scrollbar p-1 relative"
            >
              <div
                style={{
                  height: `${totalContentHeight}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {virtualItems.map((virtualRow) => {
                  const option = filteredOptions[virtualRow.index]
                  if (!option) return null
                  const isSelected = option.value === value

                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={option.disabled}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                      onClick={() => {
                        onChange(option.value)
                        setOpen(false)
                        setSearchQuery('')
                      }}
                      className={cn(
                        "flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-left cursor-pointer transition-colors outline-none hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
                        isSelected && "bg-accent/80 text-accent-foreground font-semibold"
                      )}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <HighlightSearch text={option.label} query={searchQuery} className="truncate" />
                        {option.description && (
                          <HighlightSearch
                            text={option.description}
                            query={searchQuery}
                            className="text-[10px] text-muted-foreground truncate"
                          />
                        )}
                      </div>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
