import * as React from 'react'
import { cn } from '@/lib/utils'

type CardVariant = 'default' | 'bento' | 'soft' | 'flat'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  interactive?: boolean
}

function variantClass(variant: CardVariant): string {
  switch (variant) {
    case 'bento':
      return 'rounded-[var(--svtn-radius-bento)] bg-card text-card-foreground shadow-[var(--svtn-shadow-sm)] border border-transparent'
    case 'soft':
      return 'rounded-[var(--svtn-radius-md)] bg-[color:var(--primary-soft)] text-foreground border border-transparent'
    case 'flat':
      return 'rounded-[var(--svtn-radius-md)] bg-card text-card-foreground border border-border'
    default:
      return 'rounded-[var(--svtn-radius-md)] bg-card text-card-foreground border border-border shadow-[var(--svtn-shadow-sm)]'
  }
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', interactive = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        variantClass(variant),
        interactive &&
          'transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[var(--svtn-shadow-md)]',
        className,
      )}
      {...props}
    />
  ),
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-1.5 p-6 pb-3', className)} {...props} />
  ),
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-h3 text-foreground', className)} {...props} />
  ),
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm leading-6 text-muted-foreground', className)} {...props} />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-3', className)} {...props} />
  ),
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-between gap-3 p-6 pt-0', className)}
      {...props}
    />
  ),
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
