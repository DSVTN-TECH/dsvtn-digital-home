import { AlertTriangle, Inbox, Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface StateShellProps {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  role?: 'status' | 'alert'
}

function StateShell({ icon, title, description, action, className, role }: StateShellProps) {
  return (
    <section
      role={role}
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-[var(--svtn-radius-bento)] border border-dashed bg-card p-10 text-center shadow-sm',
        className,
      )}
    >
      <div className="text-muted-foreground" aria-hidden="true">
        {icon}
      </div>
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </section>
  )
}

export function LoadingState({
  title = 'Đang tải dữ liệu...',
  description,
  className,
}: {
  title?: string
  description?: string
  className?: string
}) {
  return (
    <StateShell
      role="status"
      icon={<Loader2 className="h-6 w-6 animate-spin" />}
      title={title}
      description={description}
      className={className}
    />
  )
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}
    >
      {Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-[var(--svtn-radius-bento)] border border-border bg-card p-6 shadow-sm"
        >
          <Skeleton className="h-10 w-10" rounded="lg" />
          <Skeleton className="mt-5 h-5 w-2/3" rounded="sm" />
          <SkeletonText className="mt-4" lines={3} />
        </div>
      ))}
    </div>
  )
}

export function EmptyState({
  title = 'Chưa có dữ liệu',
  description,
  action,
  className,
}: {
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <StateShell
      role="status"
      icon={<Inbox className="h-6 w-6" />}
      title={title}
      description={description}
      action={action}
      className={className}
    />
  )
}

export function ErrorState({
  title = 'Đã xảy ra lỗi',
  description = 'Không thể tải dữ liệu. Vui lòng thử lại.',
  onRetry,
  requestId,
  className,
}: {
  title?: string
  description?: string
  onRetry?: () => void
  requestId?: string
  className?: string
}) {
  return (
    <StateShell
      role="alert"
      icon={<AlertTriangle className="h-6 w-6 text-destructive" />}
      title={title}
      description={description}
      className={className}
      action={
        <div className="flex flex-col items-center gap-2">
          {onRetry ? (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Thử lại
            </Button>
          ) : null}
          {requestId ? <p className="text-xs text-muted-foreground">Mã lỗi: {requestId}</p> : null}
        </div>
      }
    />
  )
}

export function PermissionDeniedState({
  title = 'Không có quyền truy cập',
  description = 'Bạn không có quyền xem nội dung này.',
  action,
  className,
}: {
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <StateShell
      role="alert"
      icon={<Lock className="h-6 w-6" />}
      title={title}
      description={description}
      action={action}
      className={className}
    />
  )
}
