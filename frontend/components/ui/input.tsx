import * as React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, invalid, ...props }, ref) => {
    return (
      <input
        type={type}
        aria-invalid={invalid || undefined}
        className={cn(
          'flex h-10 w-full rounded-xl border bg-card px-3.5 py-2.5 text-sm shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50',
          invalid
            ? 'border-destructive focus-visible:border-destructive'
            : 'border-input focus-visible:border-ring',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
