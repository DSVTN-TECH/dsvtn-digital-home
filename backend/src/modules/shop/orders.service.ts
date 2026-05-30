import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { EmailStatus, Order } from '@prisma/client'
import { EMAIL_PROVIDER, EmailProvider } from '../../common/email'
import { DomainEvents } from '../../common/events/domain-events'
import { LockService } from '../../common/lock'
import { ORDERS_REPOSITORY, PRODUCTS_REPOSITORY } from '../../common/repository'
import { CreateOrderDto } from './dto/create-order.dto'
import { OrdersRepository } from './orders.repository'
import { ProductsRepository } from './products.repository'

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
  private readonly logger = new Logger(OrdersService.name)

  constructor(
    @Inject(ORDERS_REPOSITORY) private readonly orders: OrdersRepository,
    @Inject(PRODUCTS_REPOSITORY) private readonly products: ProductsRepository,
    @Inject(EMAIL_PROVIDER) private readonly emailProvider: EmailProvider,
    private readonly lock: LockService,
    private readonly events: EventEmitter2,
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
      campaignId: dto.campaignId ?? null,
      items: itemsWithPrice,
    })

    await this.orders.updateEmailStatus(order.id, await this.sendOrderConfirmationEmail())

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
    return this.lock.withLock(
      `order:${id}`,
      30,
      () => this.updateStatusLocked(id, newStatus),
      'Order is being updated, try again',
    )
  }

  private async updateStatusLocked(id: string, newStatus: OrderStatus) {
    const order = await this.orders.findById(id)
    if (!order) throw new NotFoundException('Order not found')
    if (!isAllowedOrderTransition(order.status, newStatus)) {
      throw new UnprocessableEntityException(
        `Cannot transition order from ${order.status} to ${newStatus}`,
      )
    }
    const updated = await this.orders.updateStatus(id, newStatus)

    this.events.emit(DomainEvents.orderStatusChanged, {
      sourceId: `${updated.id}:${updated.status}`,
      orderId: updated.id,
      status: updated.status,
      title: 'Cập nhật đơn hàng gây quỹ',
      body: `Đơn hàng của bạn chuyển sang trạng thái ${updated.status}.`,
      linkUrl: '/shop',
    })

    return updated
  }

  private async sendOrderConfirmationEmail(): Promise<EmailStatus> {
    try {
      return await this.emailProvider.sendConfirmation(
        'order-recipient-not-configured',
        'ĐSVTN: Đơn hàng đã được ghi nhận',
        'Đơn hàng gây quỹ của bạn đã được ghi nhận. Đội logistics sẽ kiểm tra minh chứng thanh toán.',
      )
    } catch (error) {
      this.logger.warn(
        `Order confirmation email failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      )
      return 'FAILED'
    }
  }
}
