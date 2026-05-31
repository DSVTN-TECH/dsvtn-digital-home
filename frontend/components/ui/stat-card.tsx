import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card } from './card'

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: React.ReactNode
  icon?: string
  description?: string
  tone?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

const toneClass: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-[color:var(--primary-soft)] text-primary',
  success: 'bg-[color:var(--success)]/10 text-[color:var(--success)]',
  warning: 'bg-[color:var(--warning)]/10 text-[color:var(--warning)]',
  danger: 'bg-destructive/10 text-destructive',
  info: 'bg-[color:var(--info)]/10 text-[color:var(--info)]',
}

export function StatCard({
  label,
  value,
  icon,
  description,
  tone = 'primary',
  className,
  ...props
}: StatCardProps) {
  return (
    <Card variant="bento" interactive className={cn('p-5', className)} {...props}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">{value}</p>
          {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {icon ? (
          <span
            className={cn('material-symbols-outlined rounded-2xl p-3', toneClass[tone])}
            aria-hidden="true"
          >
            {icon}
          </span>
        ) : null}
      </div>
    </Card>
  )
}
