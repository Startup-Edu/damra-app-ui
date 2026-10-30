import {
  DateRangePicker,
  type DateRangeValue,
} from '@/components/ui/date-range-picker'

export type { DateRangeValue }

export interface DateRangeFilterProps {
  value?: DateRangeValue
  onChange: (value: DateRangeValue | undefined) => void
  className?: string
  triggerClassName?: string
}

export function DateRangeFilter({
  value,
  onChange,
  className,
  triggerClassName = 'w-[230px] h-9 text-xs',
}: DateRangeFilterProps) {
  return (
    <DateRangePicker
      value={value}
      onChange={onChange}
      placeholder="Submitted Date"
      align="start"
      className={className}
      triggerClassName={triggerClassName}
      showClear={true}
    />
  )
}

export default DateRangeFilter
