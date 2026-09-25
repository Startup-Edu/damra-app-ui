import * as React from 'react'
import {
  Inbox,
  SearchX,
  FilterX,
  AlertCircle,
  RotateCcw,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { TableRow, TableCell } from '@/components/ui/table'
import { cn } from '@/lib/utils'

export type TableEmptyStateVariant = 'empty' | 'search' | 'filter' | 'error'
export type TableEmptyStateSize = 'sm' | 'default' | 'lg'

export interface TableEmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * The semantic scenario for the empty state.
   * - 'empty': The dataset is genuinely empty.
   * - 'search': No records match the active search query.
   * - 'filter': No records match the active filters.
   * - 'error': Failed to fetch records due to network or server error.
   * @default 'empty'
   */
  variant?: TableEmptyStateVariant

  /**
   * Size variant adjusting padding and icon dimensions.
   * @default 'default'
   */
  size?: TableEmptyStateSize

  /**
   * Main heading text. Overrides variant default.
   */
  title?: React.ReactNode

  /**
   * Descriptive helper text explaining the state or next steps. Overrides variant default.
   */
  description?: React.ReactNode

  /**
   * Active search query string. If provided in 'search' variant, it is formatted into the description.
   */
  searchQuery?: string

  /**
   * Custom icon component or ReactNode. Set to `false` to hide icon.
   */
  icon?: React.ReactNode | LucideIcon | false

  /**
   * Primary action callback (e.g. clear filters, clear search, retry, create).
   */
  onAction?: () => void

  /**
   * Alias for onAction specifically for clear filters / clear search operations.
   */
  onClear?: () => void

  /**
   * Primary action button label.
   */
  actionLabel?: string

  /**
   * Primary action button icon.
   */
  actionIcon?: React.ReactNode | LucideIcon

  /**
   * Additional props passed to the primary action Button.
   */
  actionButtonProps?: ButtonProps

  /**
   * Completely custom action node (replaces the primary action button).
   */
  action?: React.ReactNode

  /**
   * Optional secondary action button or element (e.g., "Add new record").
   */
  secondaryAction?: React.ReactNode

  /**
   * Custom child elements rendered beneath the actions.
   */
  children?: React.ReactNode
}

export interface TableEmptyStateRowProps extends TableEmptyStateProps {
  /**
   * Number of columns to span across the table.
   */
  colSpan: number

  /**
   * Custom className for the TableRow element.
   */
  rowClassName?: string

  /**
   * Custom className for the TableCell element.
   */
  cellClassName?: string
}

// Preset configurations per variant
interface VariantPreset {
  defaultTitle: string
  getDefaultDescription: (query?: string) => string
  defaultIcon: LucideIcon
  defaultActionLabel?: string
  defaultActionIcon?: LucideIcon
  iconContainerClass: string
  iconColorClass: string
}

const VARIANT_PRESETS: Record<TableEmptyStateVariant, VariantPreset> = {
  empty: {
    defaultTitle: 'No data found',
    getDefaultDescription: () => 'There are no records to display yet.',
    defaultIcon: Inbox,
    defaultActionLabel: undefined,
    defaultActionIcon: undefined,
    iconContainerClass: 'bg-muted/60 border-border/60 text-muted-foreground ring-muted/20',
    iconColorClass: 'text-muted-foreground',
  },
  search: {
    defaultTitle: 'No results found',
    getDefaultDescription: (query) =>
      query
        ? `We couldn't find anything matching "${query}". Check for spelling or try different keywords.`
        : "We couldn't find anything matching your search criteria.",
    defaultIcon: SearchX,
    defaultActionLabel: 'Clear search',
    defaultActionIcon: RotateCcw,
    iconContainerClass: 'bg-primary/10 border-primary/20 text-primary ring-primary/10',
    iconColorClass: 'text-primary',
  },
  filter: {
    defaultTitle: 'No matching records',
    getDefaultDescription: () =>
      'No records match the active filter criteria. Try adjusting or resetting your filters.',
    defaultIcon: FilterX,
    defaultActionLabel: 'Reset filters',
    defaultActionIcon: RotateCcw,
    iconContainerClass: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 ring-amber-500/10',
    iconColorClass: 'text-amber-600 dark:text-amber-400',
  },
  error: {
    defaultTitle: 'Failed to load data',
    getDefaultDescription: () =>
      'An unexpected error occurred while fetching records. Please check your connection and try again.',
    defaultIcon: AlertCircle,
    defaultActionLabel: 'Try again',
    defaultActionIcon: RefreshCw,
    iconContainerClass: 'bg-rose-500/10 border-rose-500/20 text-rose-500 ring-rose-500/10',
    iconColorClass: 'text-rose-500',
  },
}

const SIZE_CONFIGS: Record<TableEmptyStateSize, { containerPadding: string; iconBoxSize: string; iconSize: string; titleText: string }> = {
  sm: {
    containerPadding: 'py-8 px-4',
    iconBoxSize: 'h-12 w-12 rounded-full',
    iconSize: 'h-6 w-6',
    titleText: 'text-xs',
  },
  default: {
    containerPadding: 'py-14 px-6',
    iconBoxSize: 'h-14 w-14 rounded-full',
    iconSize: 'h-7 w-7',
    titleText: 'text-sm',
  },
  lg: {
    containerPadding: 'py-20 px-8',
    iconBoxSize: 'h-16 w-16 rounded-full',
    iconSize: 'h-8 w-8',
    titleText: 'text-base',
  },
}

/**
 * Standalone Empty State presentation component for data tables, lists, and cards.
 */
export function TableEmptyState({
  variant = 'empty',
  size = 'default',
  title,
  description,
  searchQuery,
  icon,
  onAction,
  onClear,
  actionLabel,
  actionIcon,
  actionButtonProps,
  action,
  secondaryAction,
  className,
  children,
  ...props
}: TableEmptyStateProps) {
  const preset = VARIANT_PRESETS[variant] || VARIANT_PRESETS.empty
  const sizeConfig = SIZE_CONFIGS[size] || SIZE_CONFIGS.default

  const displayTitle = title ?? preset.defaultTitle
  const displayDescription = description ?? preset.getDefaultDescription(searchQuery)
  const handlePrimaryAction = onAction ?? onClear

  // Resolve Icon
  const renderIcon = () => {
    if (icon === false) return null

    if (React.isValidElement(icon)) {
      return icon
    }

    const IconComponent = (typeof icon === 'function' ? icon : preset.defaultIcon) as LucideIcon
    return <IconComponent className={cn(sizeConfig.iconSize, preset.iconColorClass)} />
  }

  // Resolve Action Button Icon
  const renderActionIcon = () => {
    if (React.isValidElement(actionIcon)) {
      return actionIcon
    }
    const ActionIconComponent = (typeof actionIcon === 'function' ? actionIcon : preset.defaultActionIcon) as LucideIcon | undefined
    return ActionIconComponent ? <ActionIconComponent className="mr-1.5 h-3.5 w-3.5" /> : null
  }

  const effectiveActionLabel = actionLabel ?? preset.defaultActionLabel

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center text-center select-none animate-in fade-in-50 duration-200',
        sizeConfig.containerPadding,
        className
      )}
      {...props}
    >
      {/* Icon Capsule */}
      {icon !== false && (
        <div
          className={cn(
            'flex items-center justify-center border ring-4 mb-3.5 transition-transform duration-200 hover:scale-105',
            sizeConfig.iconBoxSize,
            preset.iconContainerClass
          )}
        >
          {renderIcon()}
        </div>
      )}

      {/* Heading */}
      <h3 className={cn('font-semibold text-foreground tracking-tight', sizeConfig.titleText)}>
        {displayTitle}
      </h3>

      {/* Description */}
      {displayDescription && (
        <p className="text-xs text-muted-foreground max-w-sm leading-relaxed mt-1">
          {displayDescription}
        </p>
      )}

      {/* Action Buttons */}
      {(action || handlePrimaryAction || secondaryAction) && (
        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
          {action ? (
            action
          ) : handlePrimaryAction && effectiveActionLabel ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrimaryAction}
              className="h-8! text-xs font-medium shadow-xs hover:bg-accent cursor-pointer transition-colors"
              {...actionButtonProps}
            >
              {renderActionIcon()}
              {effectiveActionLabel}
            </Button>
          ) : null}

          {secondaryAction}
        </div>
      )}

      {/* Custom Nested Children */}
      {children && <div className="mt-4 w-full flex justify-center">{children}</div>}
    </div>
  )
}

/**
 * Drop-in TableRow component designed for direct integration inside `<TableBody>`.
 * Spans across all columns and renders the TableEmptyState.
 */
export function TableEmptyStateRow({
  colSpan,
  rowClassName,
  cellClassName,
  ...emptyStateProps
}: TableEmptyStateRowProps) {
  return (
    <TableRow className={cn('hover:bg-transparent', rowClassName)}>
      <TableCell
        colSpan={colSpan}
        className={cn('p-0 border-0 align-middle', cellClassName)}
      >
        <TableEmptyState {...emptyStateProps} />
      </TableCell>
    </TableRow>
  )
}
