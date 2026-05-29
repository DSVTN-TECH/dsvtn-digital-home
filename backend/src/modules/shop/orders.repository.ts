import { EmailStatus, Order, OrderItem } from '@prisma/client'

export type CreateOrderData = {
  customerName: string
  customerPhone: string
  customerAddress: string
  paymentProofUrl: string
  items: { productId: string; quantity: number; unitPriceCents: number }[]
}

export type OrderWithItems = Order & { items: OrderItem[] }

export abstract class OrdersRepository {
  abstract findById(id: string): Promise<OrderWithItems | null>
  abstract findAll(status?: string): Promise<Order[]>
  abstract create(data: CreateOrderData): Promise<OrderWithItems>
  abstract updateStatus(id: string, status: Order['status']): Promise<Order>
  abstract updateEmailStatus(id: string, status: EmailStatus): Promise<Order>
}
