import { apiFetch } from '@/lib/api'
import type {
  AdminOrder,
  CreateOrderInput,
  CreateOrderResult,
  OrderStatus,
  Product,
  ProductFormInput,
  ShopDataSource,
} from './shop.datasource'

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
