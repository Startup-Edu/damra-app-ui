import * as React from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SearchInputProps
  extends Omit<React.ComponentProps<'input'>, 'size'> {
  /** Size variant */
  sizeVariant?: 'sm' | 'default' | 'lg'
  /** Custom class for the outer wrapper */
  containerClassName?: string
  /** Loading state indicator */
  isLoading?: boolean
  /** Whether to show the clear button when there is text (defaults to true) */
  showClear?: boolean
  /** Callback fired when the clear button or Escape key is pressed */
  onClear?: () => void
}

const sizeConfig = {
  sm: {
    inputHeight: 'h-8 text-xs',
    padding: 'pl-8 pr-7',
    iconSize: 'h-3.5 w-3.5',
    iconLeft: 'left-2.5',
    clearRight: 'right-2',
    clearBtnSize: 'p-0.5',
  },
  default: {
    inputHeight: 'h-9.5 text-xs',
    padding: 'pl-8.5 pr-8',
    iconSize: 'h-3.5 w-3.5',
    iconLeft: 'left-3',
    clearRight: 'right-2.5',
    clearBtnSize: 'p-0.5',
  },
  lg: {
    inputHeight: 'h-10 text-xs sm:text-sm',
    padding: 'pl-9.5 pr-8.5',
    iconSize: 'h-4 w-4',
    iconLeft: 'left-3.5',
    clearRight: 'right-3',
    clearBtnSize: 'p-1',
  },
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      containerClassName,
      sizeVariant = 'default',
      placeholder = 'Search...',
      value,
      defaultValue,
      onChange,
      onClear,
      onKeyDown,
      isLoading = false,
      showClear = true,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(
      defaultValue !== undefined ? String(defaultValue) : ''
    )

    const isControlled = value !== undefined
    const currentValue = isControlled ? String(value || '') : internalValue
    const hasValue = currentValue.length > 0

    const config = sizeConfig[sizeVariant]

    const handleClear = (e?: React.MouseEvent) => {
      e?.preventDefault()
      e?.stopPropagation()

      if (!isControlled) {
        setInternalValue('')
      }

      if (onChange) {
        const syntheticEvent = {
          target: { value: '' },
          currentTarget: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>
        onChange(syntheticEvent)
      }

      onClear?.()
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape' && hasValue) {
        e.preventDefault()
        e.stopPropagation()
        handleClear()
      }
      onKeyDown?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalValue(e.target.value)
      }
      onChange?.(e)
    }

    return (
      <div
        className={cn(
          'relative flex items-center group',
          containerClassName
        )}
      >
        {/* Left Search Icon or Loading Spinner */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground transition-colors group-focus-within:text-foreground',
            config.iconLeft
          )}
        >
          {isLoading ? (
            <Loader2 className={cn('animate-spin text-primary', config.iconSize)} />
          ) : (
            <Search className={config.iconSize} />
          )}
        </div>

        {/* Input Element */}
        <input
          ref={ref}
          type="search"
          role="searchbox"
          aria-label={placeholder}
          placeholder={placeholder}
          value={isControlled ? value : internalValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            'w-full min-w-0 rounded-md border border-input bg-input/20 py-0.5 transition-all outline-none',
            'placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30',
            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            'dark:bg-input/30 selection:bg-primary/20',
            '[&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden',
            config.inputHeight,
            config.padding,
            className
          )}
          {...props}
        />

        {/* Clear Action Button */}
        {showClear && hasValue && !disabled && (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Clear search"
            onClick={handleClear}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 rounded-full text-muted-foreground/70 transition-colors',
              'hover:bg-muted hover:text-foreground active:scale-95 focus:outline-hidden',
              config.clearRight,
              config.clearBtnSize
            )}
          >
            <X className={config.iconSize} />
          </button>
        )}
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'
