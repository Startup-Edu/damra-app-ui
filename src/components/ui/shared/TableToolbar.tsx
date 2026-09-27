import * as React from 'react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { RefreshCw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TableToolbarProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  onSearchClear?: () => void
  searchPlaceholder?: string
  searchClassName?: string
  filters?: React.ReactNode
  actions?: React.ReactNode
  onRefresh?: () => void
  isRefreshing?: boolean
  className?: string
  children?: React.ReactNode
}

export function TableToolbar({
  searchValue,
  onSearchChange,
  onSearchClear,
  searchPlaceholder = 'Search records...',
  searchClassName = 'max-w-xs min-w-[200px] flex-1',
  filters,
  actions,
  onRefresh,
  isRefreshing = false,
  className,
  children,
}: TableToolbarProps) {
  const showSearch = onSearchChange !== undefined

  return (
    <div
      data-slot="table-toolbar"
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5 sm:px-5 border-b border-border',
        className
      )}
    >
      {/* Left side: Search input + custom filters */}
      <div className="flex flex-1 flex-wrap items-center gap-2.5 min-w-0">
        {showSearch && (
          <SearchInput
            placeholder={searchPlaceholder}
            value={searchValue || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            onClear={onSearchClear}
            containerClassName={searchClassName}
            sizeVariant="default"
          />
        )}

        {filters}
        {children}
      </div>

      {/* Right side: Refresh control + Primary Actions */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        {onRefresh && (
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Refresh table data"
            title="Refresh table data"
            className="size-9 shrink-0 text-muted-foreground hover:text-foreground"
          >
            {isRefreshing ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              <RefreshCw className="size-4" />
            )}
          </Button>
        )}

        {actions}
      </div>
    </div>
  )
}
