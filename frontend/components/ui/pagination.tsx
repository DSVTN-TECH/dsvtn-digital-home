'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface PaginationProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  ariaLabel?: string
  className?: string
}

function getPageRange(page: number, pageCount: number): (number | 'ellipsis')[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1)
  }
  const range: (number | 'ellipsis')[] = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(pageCount - 1, page + 1)
  if (start > 2) range.push('ellipsis')
  for (let p = start; p <= end; p += 1) range.push(p)
  if (end < pageCount - 1) range.push('ellipsis')
  range.push(pageCount)
  return range
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  ariaLabel = 'Phân trang',
  className,
}: PaginationProps) {
  if (pageCount <= 1) return null
  const items = getPageRange(page, pageCount)

  return (
    <nav aria-label={ariaLabel} className={cn('flex items-center justify-end gap-1', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        aria-label="Trang trước"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {items.map((item, idx) =>
        item === 'ellipsis' ? (
          <span key={`e-${idx}`} className="px-2 text-sm text-muted-foreground" aria-hidden="true">
            …
          </span>
        ) : (
          <Button
            key={item}
            variant={item === page ? 'default' : 'outline'}
            size="sm"
            aria-current={item === page ? 'page' : undefined}
            onClick={() => onPageChange(item)}
            className="min-w-9"
          >
            {item}
          </Button>
        ),
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(pageCount, page + 1))}
        disabled={page >= pageCount}
        aria-label="Trang sau"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}
