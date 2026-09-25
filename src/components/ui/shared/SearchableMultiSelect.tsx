import * as React from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Check, ChevronsUpDown, Search, X, CheckSquare, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { HighlightSearch } from '@/components/ui/shared/HighlightSearch'

export interface SearchableOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
  [key: string]: any
}

export type MultiSortableOptionProp =
  | boolean
  | 'asc'
  | 'desc'
  | ((a: SearchableOption, b: SearchableOption) => number)

export interface SearchableMultiSelectProps {
  options: SearchableOption[]
  value?: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  maxCount?: number
  sortable?: MultiSortableOptionProp
  sortSelectedFirst?: boolean
  showSelectAll?: boolean
  className?: string
  triggerClassName?: string
  contentClassName?: string
  estimateSize?: number
  minHeight?: number
  maxHeight?: number
}

export function SearchableMultiSelect({
  options,
  value = [],
  onChange,
  placeholder = 'Select items...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found.',
  disabled = false,
  maxCount = 2,
  sortable = false,
  sortSelectedFirst = false,
  showSelectAll = true,
  className,
  triggerClassName,
  contentClassName,
  estimateSize = 38,
  minHeight = 190, // Show at least 5 items (5 * 38 = 190px)
  maxHeight = 280,
}: SearchableMultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [scrollElement, setScrollElement] = React.useState<HTMLDivElement | null>(null)

  const selectedValuesSet = React.useMemo(() => new Set(value), [value])

  const selectedOptions = React.useMemo(
    () => options.filter((opt) => selectedValuesSet.has(opt.value)),
    [options, selectedValuesSet]
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

    if (sortSelectedFirst) {
      result = [...result].sort((a, b) => {
        const aSelected = selectedValuesSet.has(a.value)
        const bSelected = selectedValuesSet.has(b.value)
        if (aSelected && !bSelected) return -1
        if (!aSelected && bSelected) return 1
        return 0
      })
    }

    return result
  }, [options, searchQuery, sortable, sortSelectedFirst, selectedValuesSet])

  // Virtualizer setup
  const rowVirtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => estimateSize,
    overscan: 5,
  })

  // Measure container immediately on layout mount & open
  React.useLayoutEffect(() => {
    if (open && scrollElement) {
      rowVirtualizer.measure()
      const raf = requestAnimationFrame(() => {
        rowVirtualizer.measure()
      })
      return () => cancelAnimationFrame(raf)
    }
  }, [open, scrollElement, searchQuery, filteredOptions.length])

  // Prevent Radix Dialog / parent scroll lock (e.g. react-remove-scroll) from suppressing wheel/touch scrolling
  React.useEffect(() => {
    if (!scrollElement) return

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation()
      if (e.defaultPrevented) {
        scrollElement.scrollTop += e.deltaY
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.stopPropagation()
    }

    scrollElement.addEventListener('wheel', handleWheel, { passive: false })
    scrollElement.addEventListener('touchmove', handleTouchMove, { passive: true })
    return () => {
      scrollElement.removeEventListener('wheel', handleWheel)
      scrollElement.removeEventListener('touchmove', handleTouchMove)
    }
  }, [scrollElement])

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

  const toggleOption = (optionValue: string) => {
    if (selectedValuesSet.has(optionValue)) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  const handleSelectAll = () => {
    const availableValues = filteredOptions
      .filter((opt) => !opt.disabled)
      .map((opt) => opt.value)

    const updated = Array.from(new Set([...value, ...availableValues]))
    onChange(updated)
  }

  const handleClearAll = () => {
    if (searchQuery.trim()) {
      const filteredSet = new Set(filteredOptions.map((opt) => opt.value))
      onChange(value.filter((v) => !filteredSet.has(v)))
    } else {
      onChange([])
    }
  }

  const removeValue = (val: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(value.filter((v) => v !== val))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-[260px] min-h-[38px] h-auto justify-between px-3 py-1.5 text-xs font-normal border border-input bg-input/20 transition-colors outline-none hover:bg-input/30 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 data-[state=open]:border-primary data-[state=open]:ring-2 data-[state=open]:ring-primary/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50",
            selectedOptions.length === 0 && "text-muted-foreground",
            triggerClassName,
            className
          )}
        >
          <div className="flex flex-wrap items-center gap-1 min-w-0 flex-1">
            {selectedOptions.length === 0 ? (
              <span className="truncate">{placeholder}</span>
            ) : selectedOptions.length <= maxCount ? (
              selectedOptions.map((opt) => (
                <Badge
                  key={opt.value}
                  variant="secondary"
                  className="text-[10px] gap-1 px-1.5 py-0.5 max-w-[140px] truncate"
                >
                  <span className="truncate">{opt.label}</span>
                  {!disabled && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => removeValue(opt.value, e)}
                      className="opacity-60 hover:opacity-100 rounded cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </span>
                  )}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                {selectedOptions.length} selected
              </Badge>
            )}
          </div>

          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50 self-center" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className={cn(
          "w-[280px] p-0 shadow-lg border border-border bg-popover text-popover-foreground",
          contentClassName
        )}
        align="start"
        onWheel={(e) => e.stopPropagation()}
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

          {/* Toolbar: Select All / Clear All */}
          {showSelectAll && filteredOptions.length > 0 && (
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-border text-[11px] bg-muted/30">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-primary font-medium hover:underline flex items-center gap-1"
              >
                <CheckSquare className="h-3 w-3" /> Select All
              </button>
              {selectedOptions.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-muted-foreground hover:text-foreground font-medium hover:underline flex items-center gap-1"
                >
                  <Square className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
          )}

          {/* Options Container */}
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            <div
              ref={setScrollElement}
              style={{
                height: `${containerHeight}px`,
                maxHeight: `${maxHeight}px`,
              }}
              className="overflow-y-auto custom-scrollbar p-1 relative overscroll-contain"
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
                  const isSelected = selectedValuesSet.has(option.value)

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
                      onClick={() => toggleOption(option.value)}
                      className={cn(
                        "flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-left cursor-pointer transition-colors outline-none hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
                        isSelected && "bg-accent/60 text-accent-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <div
                          className={cn(
                            "h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                            isSelected
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-input bg-background"
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <HighlightSearch text={option.label} query={searchQuery} className="truncate" />
                          {option.description && (
                            <HighlightSearch
                              text={option.description}
                              query={searchQuery}
                              className="text-[10px] text-muted-foreground truncate"
                            />
                          )}
                        </div>
                      </div>
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
