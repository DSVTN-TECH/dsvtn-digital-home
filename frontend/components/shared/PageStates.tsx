import { AlertTriangle, Inbox, Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    <div
      role={role}
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center',
        className,
      )}
    >
      <div className="text-muted-foreground" aria-hidden="true">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
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
