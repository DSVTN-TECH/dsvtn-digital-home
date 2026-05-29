import { Injectable } from '@nestjs/common'
import { EmailStatus, Order } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateOrderData, OrdersRepository, OrderWithItems } from './orders.repository'

@Injectable()
export class PrismaOrdersRepository extends OrdersRepository {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async findById(id: string): Promise<OrderWithItems | null> {
    return this.prisma.order.findUnique({ where: { id }, include: { items: true } })
  }

  async findAll(status?: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: status ? { status: status as Order['status'] } : undefined,
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(data: CreateOrderData): Promise<OrderWithItems> {
    return this.prisma.order.create({
      data: {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        paymentProofUrl: data.paymentProofUrl,
        items: { createMany: { data: data.items } },
      },
      include: { items: true },
    })
  }

  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    return this.prisma.order.update({ where: { id }, data: { status } })
  }

  async updateEmailStatus(id: string, status: EmailStatus): Promise<Order> {
    return this.prisma.order.update({ where: { id }, data: { emailStatus: status } })
  }
}
