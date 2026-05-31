import { mockOrders, mockProducts } from '@/lib/mock/shop'
import {
  ALLOWED_ORDER_TRANSITIONS,
  type AdminOrder,
  type CreateOrderInput,
  type CreateOrderResult,
  type OrderStatus,
  type Product,
  type ProductFormInput,
  type ShopDataSource,
} from './shop.datasource'

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
    if (orderIndex < 0) throw new Error('Không tìm thấy đơn hàng')
    const order = mockOrderStore[orderIndex]
    if (!ALLOWED_ORDER_TRANSITIONS[order.status].includes(status)) {
      throw new Error('Chuyển trạng thái không hợp lệ')
    }
    const updated = { ...order, status }
    mockOrderStore[orderIndex] = updated
    return Promise.resolve(updated)
  }
}
