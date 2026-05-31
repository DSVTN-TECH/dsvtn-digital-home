import type { Order, OrderStatus } from '@/types/api'

export type ProductStatus = 'ACTIVE' | 'INACTIVE'
export type { OrderStatus }

export interface Product {
  id: string
  name: string
  description: string | null
  priceCents: number
  imageUrl: string | null
  status: ProductStatus
  createdAt: string
}

export interface OrderItemInput {
  productId: string
  quantity: number
}

export interface CreateOrderInput {
  customerName: string
  customerPhone: string
  customerAddress: string
  paymentProofUrl: string
  items: OrderItemInput[]
}

export interface CreateOrderResult {
  id: string
  status: 'PENDING_PAYMENT_REVIEW'
  createdAt: string
}

export interface ProductFormInput {
  name: string
  description?: string
  priceCents: number
  imageUrl?: string
  status?: ProductStatus
}

export type AdminOrder = Order

export const ORDER_STATUSES: OrderStatus[] = [
  'PENDING_PAYMENT_REVIEW',
  'CONFIRMED',
  'REJECTED',
  'DELIVERED',
  'CANCELLED',
]

export const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT_REVIEW: ['CONFIRMED', 'REJECTED', 'CANCELLED'],
  CONFIRMED: ['DELIVERED', 'CANCELLED'],
  REJECTED: [],
  DELIVERED: [],
  CANCELLED: [],
}

export interface ShopDataSource {
  listProducts(): Promise<Product[]>
  findProduct(id: string): Promise<Product | null>
  listAllProducts(): Promise<Product[]>
  createProduct(input: ProductFormInput): Promise<Product>
  updateProduct(id: string, input: Partial<ProductFormInput>): Promise<Product>
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>
  listAdminOrders(status?: OrderStatus): Promise<AdminOrder[]>
  updateOrderStatus(id: string, status: OrderStatus): Promise<AdminOrder>
}
