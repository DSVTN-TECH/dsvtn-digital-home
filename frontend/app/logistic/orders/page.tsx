import { OrdersManagement } from '@/app/admin/orders/OrdersManagement'

export default function LogisticOrdersPage() {
  return (
    <OrdersManagement
      title="Đơn hàng cần xử lý"
      description="Xác nhận thanh toán, từ chối đơn không hợp lệ và đánh dấu đơn đã giao."
    />
  )
}
