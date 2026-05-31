import { LoadingState } from '@/components/shared/PageStates'

export default function PublicLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <LoadingState />
    </div>
  )
}
