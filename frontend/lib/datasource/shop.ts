import { apiFetch } from '@/lib/api'
import { mockOrders, mockProducts } from '@/lib/mock/shop'
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

export class ApiShopDataSource implements ShopDataSource {
  async listProducts(): Promise<Product[]> {
    return apiFetch<Product[]>('/public/products')
  }

  async findProduct(id: string): Promise<Product | null> {
    try {
      return await apiFetch<Product>(`/public/products/${encodeURIComponent(id)}`)
    } catch {
      return null
    }
  }

  async listAllProducts(): Promise<Product[]> {
    return apiFetch<Product[]>('/admin/products')
  }

  async createProduct(input: ProductFormInput): Promise<Product> {
    const created = await apiFetch<Product>('/admin/products', {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        description: input.description,
        priceCents: input.priceCents,
        imageUrl: input.imageUrl,
      }),
    })
    return input.status && input.status !== created.status
      ? this.updateProduct(created.id, { status: input.status })
      : created
  }

  async updateProduct(id: string, input: Partial<ProductFormInput>): Promise<Product> {
    return apiFetch<Product>(`/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    })
  }

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    return apiFetch<CreateOrderResult>('/public/orders', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }

  async listAdminOrders(status?: OrderStatus): Promise<AdminOrder[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : ''
    return apiFetch<AdminOrder[]>(`/admin/orders${query}`)
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<AdminOrder> {
    return apiFetch<AdminOrder>(`/admin/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }
}

const mockProductStore: Product[] = [...mockProducts]
const mockOrderStore: AdminOrder[] = [...mockOrders]

export class MockShopDataSource implements ShopDataSource {
  async listProducts(): Promise<Product[]> {
    return Promise.resolve(mockProductStore.filter((p) => p.status === 'ACTIVE'))
  }

  async findProduct(id: string): Promise<Product | null> {
    return Promise.resolve(
      mockProductStore.find((p) => p.id === id && p.status === 'ACTIVE') ?? null,
    )
  }

  async listAllProducts(): Promise<Product[]> {
    return Promise.resolve([...mockProductStore].sort((a, b) => a.name.localeCompare(b.name)))
  }

  async createProduct(input: ProductFormInput): Promise<Product> {
    const now = new Date().toISOString()
    const product: Product = {
      id: `mock-product-${Date.now()}`,
      name: input.name,
      description: input.description ?? null,
      priceCents: input.priceCents,
      imageUrl: input.imageUrl ?? null,
      status: input.status ?? 'ACTIVE',
      createdAt: now,
    }
    mockProductStore.push(product)
    return Promise.resolve(product)
  }

  async updateProduct(id: string, input: Partial<ProductFormInput>): Promise<Product> {
    const index = mockProductStore.findIndex((product) => product.id === id)
    if (index < 0) throw new Error('Không tìm thấy sản phẩm')
    const current = mockProductStore[index]
    const updated: Product = {
      ...current,
      name: input.name ?? current.name,
      description:
        input.description !== undefined ? input.description || null : current.description,
      priceCents: input.priceCents ?? current.priceCents,
      imageUrl: input.imageUrl !== undefined ? input.imageUrl || null : current.imageUrl,
      status: input.status ?? current.status,
    }
    mockProductStore[index] = updated
    return Promise.resolve(updated)
  }

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    for (const item of input.items) {
      const product = mockProductStore.find((p) => p.id === item.productId)
      if (!product || product.status !== 'ACTIVE') {
        throw new Error(`Sản phẩm ${item.productId} không khả dụng`)
      }
      if (item.quantity <= 0) {
        throw new Error('Số lượng phải lớn hơn 0')
      }
    }
    return Promise.resolve({
      id: `mock-order-${Date.now()}`,
      status: 'PENDING_PAYMENT_REVIEW',
      createdAt: new Date().toISOString(),
    })
  }

  async listAdminOrders(status?: OrderStatus): Promise<AdminOrder[]> {
    const list = status ? mockOrderStore.filter((order) => order.status === status) : mockOrderStore
    return Promise.resolve([...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<AdminOrder> {
    const orderIndex = mockOrderStore.findIndex((order) => order.id === id)
    if (orderIndex < 0) {
      throw new Error('Không tìm thấy đơn hàng')
    }

    const order = mockOrderStore[orderIndex]
    if (!ALLOWED_ORDER_TRANSITIONS[order.status].includes(status)) {
      throw new Error('Chuyển trạng thái không hợp lệ')
    }

    const updated = { ...order, status }
    mockOrderStore[orderIndex] = updated
    return Promise.resolve(updated)
  }
}

type DataSourceMode = 'mock' | 'api'

let shopDataSource: ShopDataSource | null = null

export function getShopDataSource(): ShopDataSource {
  if (!shopDataSource) {
    const mode: DataSourceMode = (process.env.NEXT_PUBLIC_DATA_SOURCE as DataSourceMode) ?? 'mock'
    shopDataSource = mode === 'api' ? new ApiShopDataSource() : new MockShopDataSource()
  }
  return shopDataSource
}
