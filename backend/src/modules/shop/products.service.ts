import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { PRODUCTS_REPOSITORY } from '../../common/repository'
import { ProductsRepository } from './products.repository'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'

@Injectable()
export class ProductsService {
  constructor(@Inject(PRODUCTS_REPOSITORY) private readonly repo: ProductsRepository) {}

  async listActive() {
    return this.repo.findActive()
  }

  async listAll() {
    return this.repo.findMany()
  }

  async findOnePublic(id: string) {
    const product = await this.repo.findById(id)
    if (!product || product.status !== 'ACTIVE') {
      throw new NotFoundException('Product not found')
    }
    return product
  }

  async create(dto: CreateProductDto) {
    return this.repo.create({
      name: dto.name,
      description: dto.description,
      priceCents: dto.priceCents,
      imageUrl: dto.imageUrl,
    })
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundException('Product not found')
    return this.repo.update(id, dto)
  }
}
