import { Injectable } from '@nestjs/common'
import { OrderStatus, Prisma } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import {
  ActivityReportFilter,
  ActivityReportRow,
  DashboardCounts,
  OrderReportFilter,
  OrderReportRow,
  OrdersAggregate,
  PagedResult,
  ReportsRepository,
  StatusBucket,
} from './reports.repository'

const REVENUE_STATUSES: OrderStatus[] = ['CONFIRMED', 'DELIVERED']

@Injectable()
export class PrismaReportsRepository extends ReportsRepository {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async getDashboardCounts(): Promise<DashboardCounts> {
    const [
      totalUsers,
      activeUsers,
      totalActivities,
      openActivities,
      completedActivities,
      totalRegistrations,
      totalAssignments,
      pendingApplications,
      totalApplications,
    ] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.activity.count(),
      this.prisma.activity.count({ where: { status: 'OPEN' } }),
      this.prisma.activity.count({ where: { status: 'COMPLETED' } }),
      this.prisma.activityRegistration.count(),
      this.prisma.assignment.count(),
      this.prisma.volunteerApplication.count({ where: { status: 'PENDING' } }),
      this.prisma.volunteerApplication.count(),
    ])

    return {
      totalUsers,
      activeUsers,
      totalActivities,
      openActivities,
      completedActivities,
      totalRegistrations,
      totalAssignments,
      pendingApplications,
      totalApplications,
    }
  }

  async getOrdersAggregate(): Promise<OrdersAggregate> {
    const [totalOrders, confirmedOrders, deliveredOrders, revenueItems] =
      await this.prisma.$transaction([
        this.prisma.order.count(),
        this.prisma.order.count({ where: { status: 'CONFIRMED' } }),
        this.prisma.order.count({ where: { status: 'DELIVERED' } }),
        this.prisma.orderItem.findMany({
          where: { order: { status: { in: REVENUE_STATUSES } } },
          select: { quantity: true, unitPriceCents: true },
        }),
      ])

    const revenueCents = revenueItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPriceCents,
      0,
    )

    return { totalOrders, confirmedOrders, deliveredOrders, revenueCents }
  }

  async getActivityStatusBreakdown(): Promise<StatusBucket[]> {
    const grouped = await this.prisma.activity.groupBy({
      by: ['status'],
      _count: { _all: true },
    })
    return grouped.map((row) => ({ status: row.status, count: row._count._all }))
  }

  async getOrderStatusBreakdown(): Promise<StatusBucket[]> {
    const grouped = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
    })
    return grouped.map((row) => ({ status: row.status, count: row._count._all }))
  }

  async findActivityRows(filter: ActivityReportFilter): Promise<PagedResult<ActivityReportRow>> {
    const where: Prisma.ActivityWhereInput = {}
    if (filter.status) where.status = filter.status
    if (filter.from || filter.to) {
      where.startTime = {}
      if (filter.from) where.startTime.gte = filter.from
      if (filter.to) where.startTime.lte = filter.to
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.activity.findMany({
        where,
        orderBy: { startTime: 'desc' },
        skip: filter.skip,
        take: filter.take,
        select: {
          id: true,
          title: true,
          status: true,
          startTime: true,
          endTime: true,
          _count: { select: { tasks: true, registrations: true, assignments: true } },
        },
      }),
      this.prisma.activity.count({ where }),
    ])

    return {
      total,
      items: rows.map((row) => ({
        id: row.id,
        title: row.title,
        status: row.status,
        startTime: row.startTime,
        endTime: row.endTime,
        taskCount: row._count.tasks,
        registrationCount: row._count.registrations,
        assignmentCount: row._count.assignments,
      })),
    }
  }

  async findOrderRows(filter: OrderReportFilter): Promise<PagedResult<OrderReportRow>> {
    const where: Prisma.OrderWhereInput = {}
    if (filter.status) where.status = filter.status
    if (filter.from || filter.to) {
      where.createdAt = {}
      if (filter.from) where.createdAt.gte = filter.from
      if (filter.to) where.createdAt.lte = filter.to
    }

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: filter.skip,
        take: filter.take,
        select: {
          id: true,
          customerName: true,
          status: true,
          createdAt: true,
          items: { select: { quantity: true, unitPriceCents: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ])

    return {
      total,
      items: rows.map((row) => ({
        id: row.id,
        customerName: row.customerName,
        status: row.status,
        createdAt: row.createdAt,
        itemCount: row.items.reduce((sum, item) => sum + item.quantity, 0),
        totalCents: row.items.reduce((sum, item) => sum + item.quantity * item.unitPriceCents, 0),
      })),
    }
  }
}
