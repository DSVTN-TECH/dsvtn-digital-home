'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type SheetSide = 'right' | 'left' | 'bottom'

interface SheetProps {
  open: boolean
  onClose: () => void
  side?: SheetSide
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

function panelClass(side: SheetSide): string {
  switch (side) {
    case 'left':
      return 'left-0 top-0 h-full w-full max-w-md border-r'
    case 'bottom':
      return 'inset-x-0 bottom-0 max-h-[85vh] w-full rounded-t-3xl border-t'
    default:
      return 'right-0 top-0 h-full w-full max-w-md border-l'
  }
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export function Sheet({
  open,
  onClose,
  side = 'right',
  title,
  description,
  children,
  footer,
  className,
}: SheetProps) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const titleId = React.useId()
  const descId = React.useId()

  React.useEffect(() => {
    if (!open) return
    triggerRef.current = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
    panel?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key === 'Tab' && panel) {
        const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (el) => el.offsetParent !== null,
        )
        if (nodes.length === 0) return
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      triggerRef.current?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex" role="presentation">
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 h-full w-full bg-[color:var(--overlay)]"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          'absolute flex flex-col bg-card shadow-[var(--svtn-shadow-lg)] outline-none border-border',
          panelClass(side),
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-h3 text-foreground">
              {title}
            </h2>
            {description ? (
              <p id={descId} className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {footer ? <div className="border-t border-border p-5">{footer}</div> : null}
      </div>
    </div>
  )
}
