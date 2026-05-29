import { Product } from '@prisma/client'
import { BaseRepository } from '../../common/repository'

export type CreateProductData = {
  name: string
  description?: string
  priceCents: number
  imageUrl?: string
}

export type UpdateProductData = {
  name?: string
  description?: string
  priceCents?: number
  imageUrl?: string
  status?: 'ACTIVE' | 'INACTIVE'
}

export abstract class ProductsRepository extends BaseRepository<
  Product,
  CreateProductData,
  UpdateProductData
> {
  abstract findActive(): Promise<Product[]>
}
