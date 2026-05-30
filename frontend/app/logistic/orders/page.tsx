'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { OrdersManagement } from '@/app/admin/orders/OrdersManagement'
import { useAuth } from '@/hooks/useAuth'

export default function LogisticOrdersPage() {
  const router = useRouter()
  const { user, isLoggedIn, isLoading, isLogistic } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (!isLoggedIn) {
      router.replace('/login')
      return
    }
    if (user?.mustChangePassword) {
      router.replace('/auth/change-password')
    }
  }, [isLoading, isLoggedIn, user, router])

  if (isLoading || !isLoggedIn || user?.mustChangePassword) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!isLogistic) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="rounded-md border bg-card p-6 text-center">
          <h1 className="text-2xl font-semibold">403</h1>
          <p className="mt-2 text-sm text-muted-foreground">Bạn không có quyền xem trang này.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-6">
      <OrdersManagement
        title="Đơn hàng cần xử lý"
        description="Xác nhận thanh toán, từ chối đơn không hợp lệ và đánh dấu đơn đã giao."
      />
    </main>
  )
}
