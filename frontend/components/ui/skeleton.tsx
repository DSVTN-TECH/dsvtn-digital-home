import * as React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: 'sm' | 'md' | 'lg' | 'full'
}

function radiusClass(rounded: SkeletonProps['rounded']): string {
  switch (rounded) {
    case 'sm':
      return 'rounded-md'
    case 'lg':
      return 'rounded-2xl'
    case 'full':
      return 'rounded-full'
    default:
      return 'rounded-xl'
  }
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, rounded = 'md', ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      aria-label="Đang tải"
      aria-busy="true"
      className={cn('animate-pulse bg-[color:var(--muted)]', radiusClass(rounded), className)}
      {...props}
    />
  ),
)
Skeleton.displayName = 'Skeleton'

interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number
}

const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ lines = 3, className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          rounded="sm"
          className="h-3"
          style={{ width: idx === lines - 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  ),
)
SkeletonText.displayName = 'SkeletonText'

export { Skeleton, SkeletonText }
