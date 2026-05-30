'use client'

import { RouteError } from '@/components/shared/RouteError'

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <RouteError error={error} reset={reset} />
    </div>
  )
}
