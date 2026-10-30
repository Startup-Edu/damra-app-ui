import * as React from 'react'
import {
  Calendar as IconCalendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Check,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export interface DateRange {
  from?: Date
  to?: Date
  startDate?: string // YYYY-MM-DD
  endDate?: string   // YYYY-MM-DD
}

export type DateRangeValue = DateRange

export interface DateRangePreset {
  id: string
  label: string
  getRange: () => { from: Date; to: Date }
}

export interface DateRangePickerProps {
  value?: DateRange | { startDate?: string; endDate?: string } | { from?: Date; to?: Date }
  onChange: (range: DateRange | undefined) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
  triggerClassName?: string
  align?: 'start' | 'center' | 'end'
  presets?: DateRangePreset[]
  minDate?: Date
  maxDate?: Date
  error?: string
  showClear?: boolean
}

// ---------------------------------------------------------------------------
// Pure Date Helpers (Zero-dependency, timezone-safe date calculations)
// ---------------------------------------------------------------------------
function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseDateInput(val: unknown): Date | undefined {
  if (!val) return undefined
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return undefined
    return new Date(val.getFullYear(), val.getMonth(), val.getDate())
  }
  if (typeof val === 'string') {
    const parts = val.split('-').map(Number)
    if (parts.length === 3 && !parts.some(isNaN)) {
      return new Date(parts[0], parts[1] - 1, parts[2])
    }
    const d = new Date(val)
    if (!isNaN(d.getTime())) {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate())
    }
  }
  return undefined
}

function formatDisplayDate(date: Date | undefined, includeYear = true): string {
  if (!date) return ''
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: includeYear ? 'numeric' : undefined,
  })
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

function isBeforeDay(d1: Date, d2: Date): boolean {
  const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime()
  const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime()
  return t1 < t2
}

function isAfterDay(d1: Date, d2: Date): boolean {
  const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime()
  const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime()
  return t1 > t2
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export const DEFAULT_DATE_PRESETS: DateRangePreset[] = [
  {
    id: 'today',
    label: 'Today',
    getRange: () => {
      const today = new Date()
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      return { from: d, to: d }
    },
  },
  {
    id: 'yesterday',
    label: 'Yesterday',
    getRange: () => {
      const today = new Date()
      const y = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
      return { from: y, to: y }
    },
  },
  {
    id: 'last7',
    label: 'Last 7 Days',
    getRange: () => {
      const today = new Date()
      const to = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6)
      return { from, to }
    },
  },
  {
    id: 'last30',
    label: 'Last 30 Days',
    getRange: () => {
      const today = new Date()
      const to = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29)
      return { from, to }
    },
  },
  {
    id: 'thisMonth',
    label: 'This Month',
    getRange: () => {
      const today = new Date()
      const from = new Date(today.getFullYear(), today.getMonth(), 1)
      const to = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      return { from, to }
    },
  },
  {
    id: 'lastMonth',
    label: 'Last Month',
    getRange: () => {
      const today = new Date()
      const from = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const to = new Date(today.getFullYear(), today.getMonth(), 0)
      return { from, to }
    },
  },
  {
    id: 'thisYear',
    label: 'This Year',
    getRange: () => {
      const today = new Date()
      const from = new Date(today.getFullYear(), 0, 1)
      const to = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      return { from, to }
    },
  },
]

export function DateRangePicker({
  value,
  onChange,
  label,
  placeholder = 'Select date range',
  disabled = false,
  required = false,
  className,
  triggerClassName,
  align = 'start',
  presets = DEFAULT_DATE_PRESETS,
  minDate,
  maxDate,
  error,
  showClear = true,
}: DateRangePickerProps) {
  // Normalize incoming range value
  const normalizedValue = React.useMemo(() => {
    if (!value) return undefined
    const anyVal = value as Record<string, unknown>
    const from = parseDateInput(anyVal.from || anyVal.startDate)
    const to = parseDateInput(anyVal.to || anyVal.endDate)
    if (!from) return undefined
    return { from, to: to || from }
  }, [value])

  const [isOpen, setIsOpen] = React.useState(false)
  const [internalRange, setInternalRange] = React.useState<{ from?: Date; to?: Date } | undefined>(
    normalizedValue
  )
  const [hoverDate, setHoverDate] = React.useState<Date | null>(null)
  const [hoveredPreset, setHoveredPreset] = React.useState<DateRangePreset | null>(null)
  const [activePresetId, setActivePresetId] = React.useState<string | null>(null)
  const [viewMode, setViewMode] = React.useState<'days' | 'months'>('days')

  // Current calendar month & year view
  const today = React.useMemo(() => new Date(), [])
  const [viewDate, setViewDate] = React.useState<Date>(() => {
    return normalizedValue?.from || today
  })

  // Synchronize internal state when value or open changes
  React.useEffect(() => {
    setInternalRange(normalizedValue)
    if (normalizedValue?.from) {
      setViewDate(normalizedValue.from)
    }
    setViewMode('days')
  }, [normalizedValue, isOpen])

  // Navigation handlers
  const handlePrevMonth = () => {
    if (viewMode === 'months') {
      setViewDate((prev) => new Date(prev.getFullYear() - 1, prev.getMonth(), 1))
    } else {
      setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    }
  }

  const handleNextMonth = () => {
    if (viewMode === 'months') {
      setViewDate((prev) => new Date(prev.getFullYear() + 1, prev.getMonth(), 1))
    } else {
      setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    }
  }

  // Preset click handler (instant apply for high-speed UX)
  const handlePresetClick = (preset: DateRangePreset) => {
    const range = preset.getRange()
    setInternalRange(range)
    setViewDate(range.from)
    setActivePresetId(preset.id)
    setViewMode('days')
    onChange({
      from: range.from,
      to: range.to,
      startDate: toDateKey(range.from),
      endDate: toDateKey(range.to),
    })
    setIsOpen(false)
  }

  // Interactive day click in calendar
  const handleDayClick = (clickedDate: Date) => {
    setActivePresetId(null)
    if (minDate && isBeforeDay(clickedDate, minDate)) return
    if (maxDate && isAfterDay(clickedDate, maxDate)) return

    // Case 1: Fresh selection or reset
    if (!internalRange?.from || (internalRange.from && internalRange.to)) {
      setInternalRange({ from: clickedDate, to: undefined })
      setHoverDate(null)
      return
    }

    // Case 2: From was set, selecting To
    if (internalRange.from && !internalRange.to) {
      if (isBeforeDay(clickedDate, internalRange.from)) {
        setInternalRange({ from: clickedDate, to: undefined })
        setHoverDate(null)
      } else {
        setInternalRange({ from: internalRange.from, to: clickedDate })
        setHoverDate(null)
      }
    }
  }

  // Apply button
  const handleApply = () => {
    if (!internalRange?.from) return
    const finalTo = internalRange.to || internalRange.from
    onChange({
      from: internalRange.from,
      to: finalTo,
      startDate: toDateKey(internalRange.from),
      endDate: toDateKey(finalTo),
    })
    setIsOpen(false)
  }

  // Cancel button
  const handleCancel = () => {
    setInternalRange(normalizedValue)
    setHoverDate(null)
    setIsOpen(false)
  }

  // Clear button
  const handleClear = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    setInternalRange(undefined)
    setHoverDate(null)
    setActivePresetId(null)
    onChange(undefined)
    setIsOpen(false)
  }

  // Calculate day difference
  const calculateDayDifference = () => {
    if (!internalRange?.from) return 0
    const end = internalRange.to || internalRange.from
    const diffTime = Math.abs(end.getTime() - internalRange.from.getTime())
    return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const dayCount = calculateDayDifference()
  const dayLabel = dayCount === 1 ? 'day' : 'days'

  // Trigger format display
  const formatRangeDisplay = () => {
    if (!internalRange?.from) return placeholder
    const from = internalRange.from
    const to = internalRange.to
    if (!to || isSameDay(from, to)) {
      return formatDisplayDate(from, true)
    }
    const sameYear = from.getFullYear() === to.getFullYear()
    const fromStr = formatDisplayDate(from, !sameYear)
    const toStr = formatDisplayDate(to, true)
    return `${fromStr} – ${toStr}`
  }

  // Effective visual range for highlights
  const effectiveRange = React.useMemo(() => {
    if (!internalRange?.from) return { start: null, end: null }
    if (internalRange.to) {
      return { start: internalRange.from, end: internalRange.to }
    }
    if (hoverDate && isAfterDay(hoverDate, internalRange.from)) {
      return { start: internalRange.from, end: hoverDate }
    }
    return { start: internalRange.from, end: internalRange.from }
  }, [internalRange, hoverDate])

  // Calendar cells computation (42 cells: 6 rows x 7 cols)
  const calendarCells = React.useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()

    const firstDayOfMonth = new Date(year, month, 1)
    const startDayIndex = firstDayOfMonth.getDay() // 0 = Sunday
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    interface Cell {
      date: Date
      isCurrentMonth: boolean
      key: string
    }

    const cells: Cell[] = []

    // 1. Leading days from previous month
    for (let i = 0; i < startDayIndex; i++) {
      const dayNum = daysInPrevMonth - startDayIndex + 1 + i
      const date = new Date(year, month - 1, dayNum)
      cells.push({ date, isCurrentMonth: false, key: `prev-${dayNum}` })
    }

    // 2. Current month days
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const date = new Date(year, month, dayNum)
      cells.push({ date, isCurrentMonth: true, key: `curr-${dayNum}` })
    }

    // 3. Trailing days to finish 42 cells
    const remaining = 42 - cells.length
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const date = new Date(year, month + 1, dayNum)
      cells.push({ date, isCurrentMonth: false, key: `next-${dayNum}` })
    }

    return cells
  }, [viewDate])

  const hasValue = Boolean(internalRange?.from)

  return (
    <div className={cn('inline-flex flex-col gap-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>

          {hasValue && (
            <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
              {dayCount} {dayLabel}
            </Badge>
          )}
        </div>
      )}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-[230px] justify-between h-9 px-3 text-xs font-normal border border-input bg-input/20 hover:bg-input/30 transition-[border-color,box-shadow,background-color] duration-160 ease-[var(--ease-out)] outline-none',
              'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30',
              'data-[state=open]:border-primary data-[state=open]:ring-2 data-[state=open]:ring-primary/30',
              'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
              'dark:bg-input/30 dark:hover:bg-input/50',
              !hasValue && 'text-muted-foreground',
              hasValue && 'text-foreground font-medium border-primary/40 bg-primary/5 hover:bg-primary/10',
              error && 'border-destructive/50 bg-destructive/5',
              triggerClassName
            )}
          >
            <div className="flex items-center min-w-0 flex-1 truncate text-left">
              <IconCalendar
                className={cn(
                  'size-3.5 shrink-0 mr-2',
                  hasValue ? 'text-primary' : 'text-muted-foreground'
                )}
              />
              <span className="truncate text-xs">{formatRangeDisplay()}</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-1">
              {hasValue && (
                <span className="px-1.5 py-0 h-4 text-[10px] bg-primary/15 text-primary rounded-full font-semibold border-0 shrink-0 inline-flex items-center font-mono">
                  {dayCount}d
                </span>
              )}

              {showClear && hasValue && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleClear}
                  className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Clear date range"
                >
                  <X className="size-3" />
                </span>
              )}

              {!hasValue && (
                <ChevronDown className="size-3.5 opacity-50 shrink-0 pointer-events-none" />
              )}
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-auto p-0 border border-border bg-popover shadow-2xl rounded-2xl overflow-hidden z-[1100]"
          align={align}
          sideOffset={6}
          collisionPadding={16}
        >
          {/* Two-Column Enterprise Workspace */}
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border">
            {/* Left Column: Vertical Presets Sidebar */}
            <div className="w-full sm:w-[145px] shrink-0 bg-muted/20 p-2.5 flex flex-col justify-between select-none">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1 block">
                  Quick Select
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-0.5">
                  {presets.map((preset) => {
                    const isSelected = activePresetId === preset.id
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handlePresetClick(preset)}
                        onMouseEnter={() => setHoveredPreset(preset)}
                        onMouseLeave={() => setHoveredPreset(null)}
                        className={cn(
                          'w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center justify-between',
                          isSelected
                            ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                            : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <span className="truncate">{preset.label}</span>
                        {isSelected && <Check className="size-3 shrink-0 ml-1" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Hover / Active Preset Range Hint */}
              <div className="mt-3 pt-2.5 border-t border-border/60">
                <div className="rounded-lg bg-background/80 border border-border/60 px-2 py-1.5 text-[11px]">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    {hoveredPreset ? hoveredPreset.label : 'Selected'}
                  </span>
                  <span className="text-foreground font-medium truncate block mt-0.5">
                    {hoveredPreset ? (
                      (() => {
                        const r = hoveredPreset.getRange()
                        return isSameDay(r.from, r.to)
                          ? formatDisplayDate(r.from)
                          : `${formatDisplayDate(r.from, false)} – ${formatDisplayDate(r.to)}`
                      })()
                    ) : hasValue ? (
                      `${dayCount} ${dayLabel}`
                    ) : (
                      'Click to pick'
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Calendar Workspace */}
            <div className="w-full sm:w-[315px] p-3.5 flex flex-col justify-between shrink-0">
              {/* Header: Month & Year Title + Switcher + Prev/Next Controls */}
              <div className="flex items-center justify-between pb-2 mb-1 border-b border-border/60">
                {viewMode === 'days' ? (
                  <button
                    type="button"
                    onClick={() => setViewMode('months')}
                    className="text-xs font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1 select-none cursor-pointer py-1 px-1.5 rounded-md hover:bg-muted/60"
                    title="Click to switch month/year"
                  >
                    <span>
                      {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
                    </span>
                    <ChevronDown className="size-3 opacity-60" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setViewMode('days')}
                    className="text-xs font-bold text-primary transition-colors flex items-center gap-1 select-none cursor-pointer py-1 px-1.5 rounded-md hover:bg-muted/60 font-mono"
                  >
                    <span>{viewDate.getFullYear()}</span>
                    <span className="text-[10px] text-muted-foreground font-normal ml-1">
                      (Back to calendar)
                    </span>
                  </button>
                )}

                <div className="flex items-center gap-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevMonth}
                    className="size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                    title={viewMode === 'months' ? 'Previous year' : 'Previous month'}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleNextMonth}
                    className="size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                    title={viewMode === 'months' ? 'Next year' : 'Next month'}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>

              {/* View Mode: Month Grid Switcher */}
              {viewMode === 'months' ? (
                <div className="grid grid-cols-3 gap-1.5 py-4">
                  {MONTH_SHORT.map((mShort, idx) => {
                    const isCurrent = viewDate.getMonth() === idx
                    return (
                      <Button
                        key={mShort}
                        type="button"
                        variant={isCurrent ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => {
                          setViewDate(new Date(viewDate.getFullYear(), idx, 1))
                          setViewMode('days')
                        }}
                        className={cn(
                          'h-9 text-xs font-medium rounded-lg',
                          isCurrent && 'font-bold shadow-xs'
                        )}
                      >
                        {mShort}
                      </Button>
                    )
                  })}
                </div>
              ) : (
                <>
                  {/* Calendar Days Header */}
                  <div className="grid grid-cols-7 text-center pb-1">
                    {DAY_LABELS.map((dayLabel) => (
                      <div
                        key={dayLabel}
                        className="text-[11px] font-semibold text-muted-foreground/70 py-0.5 select-none"
                      >
                        {dayLabel}
                      </div>
                    ))}
                  </div>

                  {/* 42-cell Calendar Grid */}
                  <div
                    className="grid grid-cols-7 gap-y-0.5"
                    onMouseLeave={() => setHoverDate(null)}
                  >
                    {calendarCells.map((cell) => {
                      const cellDate = cell.date
                      const isCurrent = cell.isCurrentMonth
                      const isToday = isSameDay(cellDate, today)

                      const isRangeStart =
                        effectiveRange.start && isSameDay(cellDate, effectiveRange.start)
                      const isRangeEnd =
                        effectiveRange.end && isSameDay(cellDate, effectiveRange.end)
                      const isRangeMiddle =
                        effectiveRange.start &&
                        effectiveRange.end &&
                        isAfterDay(cellDate, effectiveRange.start) &&
                        isBeforeDay(cellDate, effectiveRange.end)

                      const isDisabled =
                        Boolean(minDate && isBeforeDay(cellDate, minDate)) ||
                        Boolean(maxDate && isAfterDay(cellDate, maxDate))

                      return (
                        <div
                          key={cell.key}
                          className={cn(
                            'relative flex items-center justify-center h-8',
                            // Range middle ribbon connection
                            isRangeMiddle && 'bg-primary/12',
                            isRangeStart &&
                              effectiveRange.end &&
                              !isSameDay(effectiveRange.start, effectiveRange.end) &&
                              'bg-gradient-to-r from-transparent to-primary/12 rounded-l-md',
                            isRangeEnd &&
                              effectiveRange.start &&
                              !isSameDay(effectiveRange.start, effectiveRange.end) &&
                              'bg-gradient-to-l from-transparent to-primary/12 rounded-r-md'
                          )}
                        >
                          <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              if (!cell.isCurrentMonth) {
                                setViewDate(new Date(cellDate.getFullYear(), cellDate.getMonth(), 1))
                              }
                              handleDayClick(cellDate)
                            }}
                            onMouseEnter={() => {
                              if (internalRange?.from && !internalRange.to) {
                                setHoverDate(cellDate)
                              }
                            }}
                            className={cn(
                              'size-7 text-xs flex items-center justify-center rounded-md font-medium transition-colors relative outline-none cursor-pointer',
                              // Outside month
                              !isCurrent && 'text-muted-foreground/30 hover:bg-transparent font-normal',
                              isCurrent && 'text-foreground',
                              // Hover on unselected
                              !isRangeStart && !isRangeEnd && !isRangeMiddle && 'hover:bg-muted/80',
                              // Range middle
                              isRangeMiddle && 'text-primary font-semibold rounded-none hover:bg-primary/25',
                              // Range endpoints
                              (isRangeStart || isRangeEnd) &&
                                'bg-primary text-primary-foreground font-bold shadow-xs hover:bg-primary/95',
                              // Today ring indicator
                              isToday && !isRangeStart && !isRangeEnd && !isRangeMiddle && 'ring-1 ring-primary/40 font-bold'
                            )}
                          >
                            {cellDate.getDate()}

                            {/* Today dot indicator */}
                            {isToday && !isRangeStart && !isRangeEnd && !isRangeMiddle && (
                              <span
                                aria-hidden
                                className="absolute bottom-0.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary"
                              />
                            )}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {/* Bottom Action Footer */}
              <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-border/60">
                <div className="flex items-center gap-1.5 min-w-0 pr-2">
                  {showClear && hasValue && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive gap-1"
                    >
                      <RotateCcw className="size-3" />
                      Clear
                    </Button>
                  )}
                  {!hasValue && (
                    <span className="text-[11px] text-muted-foreground italic truncate">
                      Click dates to select
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="h-7 px-2.5 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleApply}
                    disabled={!internalRange?.from}
                    className="h-7 px-3 text-xs font-semibold gap-1"
                  >
                    <Check className="size-3" />
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}

export default DateRangePicker
