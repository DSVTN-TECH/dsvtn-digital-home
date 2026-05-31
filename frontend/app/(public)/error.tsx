'use client'

import { RouteError } from '@/components/shared/RouteError'

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <RouteError error={error} reset={reset} />
    </div>
  )
}
