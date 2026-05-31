'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TabItem {
  value: string
  label: React.ReactNode
  icon?: string
  count?: number | string
}

interface TabsProps {
  items: TabItem[]
  value: string
  onChange: (value: string) => void
  ariaLabel: string
  className?: string
  variant?: 'underline' | 'pill' | 'segment'
}

function variantClass(variant: NonNullable<TabsProps['variant']>): {
  list: string
  tab: string
  active: string
} {
  switch (variant) {
    case 'pill':
      return {
        list: 'inline-flex items-center gap-1 rounded-full bg-muted p-1',
        tab: 'rounded-full px-4 py-1.5 text-sm font-semibold text-muted-foreground transition hover:text-primary',
        active: 'bg-card text-primary shadow-sm',
      }
    case 'segment':
      return {
        list: 'inline-flex items-center gap-1 rounded-xl border border-border bg-card p-1',
        tab: 'rounded-lg px-3 py-1.5 text-sm font-semibold text-muted-foreground transition hover:text-primary',
        active: 'bg-[color:var(--primary-soft)] text-primary',
      }
    default:
      return {
        list: 'flex items-center gap-2 border-b border-border',
        tab: 'inline-flex items-center gap-2 border-b-2 border-transparent px-3 py-2.5 text-sm font-semibold text-muted-foreground transition hover:text-primary',
        active: 'border-primary text-primary',
      }
  }
}

export function Tabs({
  items,
  value,
  onChange,
  ariaLabel,
  className,
  variant = 'underline',
}: TabsProps) {
  const styles = variantClass(variant)

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, idx: number) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      const next = items[(idx + 1) % items.length]
      onChange(next.value)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      const prev = items[(idx - 1 + items.length) % items.length]
      onChange(prev.value)
    } else if (event.key === 'Home') {
      event.preventDefault()
      onChange(items[0].value)
    } else if (event.key === 'End') {
      event.preventDefault()
      onChange(items[items.length - 1].value)
    }
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(styles.list, 'overflow-x-auto', className)}
    >
      {items.map((item, idx) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.value)}
            onKeyDown={(event) => onKeyDown(event, idx)}
            className={cn(styles.tab, active && styles.active, 'whitespace-nowrap')}
          >
            {item.icon ? (
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                {item.icon}
              </span>
            ) : null}
            <span>{item.label}</span>
            {item.count !== undefined ? (
              <span
                className={cn(
                  'ml-1 inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold',
                  active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
