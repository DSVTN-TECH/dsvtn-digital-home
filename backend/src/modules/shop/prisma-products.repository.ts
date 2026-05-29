import { Injectable } from '@nestjs/common'
import { Product } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateProductData, ProductsRepository, UpdateProductData } from './products.repository'

@Injectable()
export class PrismaProductsRepository extends ProductsRepository {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async findById(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({ where: { id } })
  }

  async findMany(filter?: Partial<Product>): Promise<Product[]> {
    return this.prisma.product.findMany({ where: filter, orderBy: { name: 'asc' } })
  }

  async findActive(): Promise<Product[]> {
    return this.prisma.product.findMany({ where: { status: 'ACTIVE' }, orderBy: { name: 'asc' } })
  }

  async create(data: CreateProductData): Promise<Product> {
    return this.prisma.product.create({ data })
  }

  async update(id: string, data: UpdateProductData): Promise<Product> {
    return this.prisma.product.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } })
  }
}
