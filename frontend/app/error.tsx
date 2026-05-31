'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('App error', error)
    }
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-destructive">Lỗi</p>
      <h1 className="text-h2 text-foreground">Đã có lỗi xảy ra</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Trang gặp lỗi không mong đợi. Bạn có thể thử lại hoặc quay về trang chủ.
      </p>
      {error.digest ? (
        <p className="font-mono text-xs text-muted-foreground">requestId: {error.digest}</p>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={reset}>Thử lại</Button>
        <Button asChild variant="outline">
          <Link href="/">Trang chủ</Link>
        </Button>
      </div>
    </main>
  )
}
