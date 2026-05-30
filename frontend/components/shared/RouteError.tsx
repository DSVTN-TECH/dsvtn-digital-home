'use client'

import { useEffect } from 'react'
import { ErrorState } from './PageStates'

interface RouteErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export function RouteError({ error, reset }: RouteErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="p-6">
      <ErrorState
        title="Không thể tải trang"
        description="Đã xảy ra lỗi khi hiển thị nội dung này. Vui lòng thử lại."
        onRetry={reset}
        requestId={error.digest}
      />
    </div>
  )
}
