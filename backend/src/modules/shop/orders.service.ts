import { Inject, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { Order } from '@prisma/client'
import { ORDERS_REPOSITORY, PRODUCTS_REPOSITORY } from '../../common/repository'
import { ProductsRepository } from './products.repository'
import { OrdersRepository } from './orders.repository'
import { CreateOrderDto } from './dto/create-order.dto'

type OrderStatus = Order['status']

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT_REVIEW: ['CONFIRMED', 'REJECTED', 'CANCELLED'],
  CONFIRMED: ['DELIVERED', 'CANCELLED'],
  REJECTED: [],
  DELIVERED: [],
  CANCELLED: [],
}

export function isAllowedOrderTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true
  return ALLOWED_TRANSITIONS[from].includes(to)
}

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

  async updateStatus(id: string, newStatus: OrderStatus) {
    const order = await this.orders.findById(id)
    if (!order) throw new NotFoundException('Order not found')
    if (!isAllowedOrderTransition(order.status, newStatus)) {
      throw new UnprocessableEntityException(
        `Cannot transition order from ${order.status} to ${newStatus}`,
      )
    }
    return this.orders.updateStatus(id, newStatus)
  }
}
