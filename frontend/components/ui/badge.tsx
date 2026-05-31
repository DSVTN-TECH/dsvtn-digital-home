import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow-sm',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground shadow-sm',
        outline: 'border-border text-muted-foreground',
      },
      tone: {
        none: '',
        primary: 'border-transparent bg-[color:var(--primary-soft)] text-primary',
        success: 'border-transparent bg-[color:var(--success)]/10 text-[color:var(--success)]',
        warning: 'border-transparent bg-[color:var(--warning)]/10 text-[color:var(--warning)]',
        danger: 'border-transparent bg-destructive/10 text-destructive',
        info: 'border-transparent bg-[color:var(--info)]/10 text-[color:var(--info)]',
        neutral: 'border-border bg-muted text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
      tone: 'none',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, tone }), className)} {...props} />
}

export { Badge, badgeVariants }
