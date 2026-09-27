import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DataTablePaginationProps {
  page?: number
  currentPage?: number
  totalPages: number
  totalElements?: number
  totalItems?: number
  limit?: number
  pageSize?: number
  onPageChange: (page: number) => void
  entityLabel?: string
  itemLabel?: string
  itemName?: string
  className?: string
}

export function DataTablePagination({
  page,
  currentPage,
  totalPages,
  totalElements,
  totalItems,
  limit,
  pageSize,
  onPageChange,
  entityLabel,
  itemLabel,
  itemName,
  className,
}: DataTablePaginationProps) {
  const activePage = Number(page ?? currentPage ?? 1) || 1
  const activeLimit = Number(limit ?? pageSize ?? 10) || 10
  const rawTotal = totalElements ?? totalItems
  const activeTotal = rawTotal !== undefined ? (Number(rawTotal) || 0) : undefined
  const activeLabel = entityLabel || itemLabel || itemName || 'records'
  const safeTotalPages = Math.max(1, Number(totalPages) || 1)

  if (safeTotalPages <= 1 && (activeTotal === undefined || activeTotal <= 0)) {
    return null
  }

  const startRecord = activeTotal !== undefined
    ? (activeTotal > 0 ? (activePage - 1) * activeLimit + 1 : 0)
    : (activePage - 1) * activeLimit + 1

  const endRecord = activeTotal !== undefined
    ? Math.min(activePage * activeLimit, activeTotal)
    : activePage * activeLimit

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = []
    
    for (let p = 1; p <= safeTotalPages; p++) {
      if (p === 1 || p === safeTotalPages || Math.abs(p - activePage) <= 1) {
        pages.push(p)
      } else if (p === 2 && activePage > 3) {
        if (!pages.includes('ellipsis-start')) {
          pages.push('ellipsis-start')
        }
      } else if (p === safeTotalPages - 1 && activePage < safeTotalPages - 2) {
        if (!pages.includes('ellipsis-end')) {
          pages.push('ellipsis-end')
        }
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div
      data-slot="data-table-pagination"
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5 border-t border-border',
        className
      )}
    >
      {/* Record range indicator */}
      <div className="text-xs text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
        {activeTotal !== undefined ? (
          <>
            Showing{' '}
            <span className="font-semibold text-foreground">{startRecord}</span> to{' '}
            <span className="font-semibold text-foreground">{endRecord}</span> of{' '}
            <span className="font-semibold text-foreground">{activeTotal}</span> {activeLabel}
          </>
        ) : (
          <>
            Page <span className="font-semibold text-foreground">{activePage}</span> of{' '}
            <span className="font-semibold text-foreground">{safeTotalPages}</span>
          </>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        {/* Previous Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            if (activePage > 1) onPageChange(activePage - 1)
          }}
          disabled={activePage <= 1}
          className="h-8 gap-1 px-2.5 text-xs font-medium"
          aria-label="Go to previous page"
        >
          <ChevronLeft className="size-3.5" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Numbered Page Buttons (Desktop) */}
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers.map((item, idx) => {
            if (typeof item === 'number') {
              const isActive = item === activePage
              return (
                <Button
                  key={item}
                  type="button"
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onPageChange(item)}
                  className={cn(
                    'h-8 w-8 p-0 text-xs font-medium',
                    isActive ? 'pointer-events-none font-semibold' : 'text-muted-foreground hover:text-foreground'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item}
                </Button>
              )
            }

            return (
              <span
                key={`ellipsis-${idx}`}
                className="flex size-8 items-center justify-center text-muted-foreground"
                aria-hidden
              >
                <MoreHorizontal className="size-3.5" />
              </span>
            )
          })}
        </div>

        {/* Mobile current indicator */}
        <div className="sm:hidden text-xs font-semibold px-2">
          {activePage} / {safeTotalPages}
        </div>

        {/* Next Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            if (activePage < safeTotalPages) onPageChange(activePage + 1)
          }}
          disabled={activePage >= safeTotalPages}
          className="h-8 gap-1 px-2.5 text-xs font-medium"
          aria-label="Go to next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
