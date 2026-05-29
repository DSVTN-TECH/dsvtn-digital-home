import { Inject, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { ORDERS_REPOSITORY, PRODUCTS_REPOSITORY } from '../../common/repository'
import { ProductsRepository } from './products.repository'
import { OrdersRepository } from './orders.repository'
import { CreateOrderDto } from './dto/create-order.dto'

@Injectable()
export class OrdersService {
  constructor(
    @Inject(ORDERS_REPOSITORY) private readonly orders: OrdersRepository,
    @Inject(PRODUCTS_REPOSITORY) private readonly products: ProductsRepository,
  ) {}

  async create(dto: CreateOrderDto) {
    const itemsWithPrice = []
    for (const item of dto.items) {
      const product = await this.products.findById(item.productId)
      if (!product || product.status !== 'ACTIVE') {
        throw new UnprocessableEntityException(`Product ${item.productId} is not available`)
      }
      itemsWithPrice.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPriceCents: product.priceCents,
      })
    }

    const order = await this.orders.create({
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      customerAddress: dto.customerAddress,
      paymentProofUrl: dto.paymentProofUrl,
      items: itemsWithPrice,
    })

    return { id: order.id, status: order.status, createdAt: order.createdAt }
  }

  async findAll(status?: string) {
    return this.orders.findAll(status)
  }

  async findOne(id: string) {
    const order = await this.orders.findById(id)
    if (!order) throw new NotFoundException('Order not found')
    return order
  }
}
