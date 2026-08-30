import { useState, useEffect } from 'react'

/**
 * Custom hook to debounce any fast-changing value (e.g. search input).
 * 
 * @param value The value to debounce
 * @param delay The delay in milliseconds (defaults to 350ms)
 * @returns The debounced value
 */
export function useDebouncedValue<T>(value: T, delay: number = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebouncedValue
