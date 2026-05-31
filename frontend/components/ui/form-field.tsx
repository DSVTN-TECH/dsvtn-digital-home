import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label } from './label'

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  htmlFor: string
  error?: string | null
  help?: string
  required?: boolean
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, htmlFor, error, help, required, className, children, ...props }, ref) => {
    const descriptionId = help ? `${htmlFor}-help` : undefined
    const errorId = error ? `${htmlFor}-error` : undefined

    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        <Label htmlFor={htmlFor} className="text-label text-foreground">
          {label}
          {required ? (
            <span className="ml-1 text-destructive" aria-hidden="true">
              *
            </span>
          ) : null}
        </Label>
        {children}
        {help ? (
          <p id={descriptionId} className="text-xs leading-5 text-muted-foreground">
            {help}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className="text-xs font-semibold leading-5 text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    )
  },
)
FormField.displayName = 'FormField'

export { FormField }
