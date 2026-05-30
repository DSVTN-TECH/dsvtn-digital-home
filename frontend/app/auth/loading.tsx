import { LoadingState } from '@/components/shared/PageStates'

export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <LoadingState title="Đang tải..." className="border-none" />
    </div>
  )
}
