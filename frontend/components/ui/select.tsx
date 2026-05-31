import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  invalid?: boolean
  selectSize?: 'sm' | 'md'
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, selectSize = 'md', children, ...props }, ref) => {
    const heightClass = selectSize === 'sm' ? 'h-9 text-xs px-3 pr-8' : 'h-10 text-sm px-3.5 pr-9'

    return (
      <span className="relative inline-flex w-full">
        <select
          ref={ref}
          aria-invalid={invalid || undefined}
          className={cn(
            'w-full appearance-none rounded-xl border bg-card text-foreground shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50',
            heightClass,
            invalid
              ? 'border-destructive focus-visible:border-destructive'
              : 'border-input focus-visible:border-ring',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      </span>
    )
  },
)
Select.displayName = 'Select'

export { Select }
