import { apiFetch } from '@/lib/api'
import { mockProducts } from '@/lib/mock/shop'

export type ProductStatus = 'ACTIVE' | 'INACTIVE'

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

export interface ShopDataSource {
  listProducts(): Promise<Product[]>
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>
}

export class ApiShopDataSource implements ShopDataSource {
  async listProducts(): Promise<Product[]> {
    return apiFetch<Product[]>('/public/products')
  }

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    return apiFetch<CreateOrderResult>('/public/orders', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }
}

const mockProductStore: Product[] = [...mockProducts]

export class MockShopDataSource implements ShopDataSource {
  async listProducts(): Promise<Product[]> {
    return Promise.resolve(mockProductStore.filter((p) => p.status === 'ACTIVE'))
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
