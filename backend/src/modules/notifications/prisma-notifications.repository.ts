import { Injectable } from '@nestjs/common'
import { Notification } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import {
  CreateNotificationData,
  ListNotificationsOptions,
  NotificationsRepository,
  PaginatedNotifications,
} from './notifications.repository'

@Injectable()
export class PrismaNotificationsRepository extends NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async create(data: CreateNotificationData): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body ?? null,
        linkUrl: data.linkUrl ?? null,
      },
    })
  }

  async createMany(data: CreateNotificationData[]): Promise<number> {
    if (data.length === 0) return 0
    const result = await this.prisma.notification.createMany({
      data: data.map((d) => ({
        userId: d.userId,
        type: d.type,
        title: d.title,
        body: d.body ?? null,
        linkUrl: d.linkUrl ?? null,
      })),
    })
    return result.count
  }

  async listByUser(
    userId: string,
    options: ListNotificationsOptions,
  ): Promise<PaginatedNotifications> {
    const where = {
      userId,
      ...(options.unreadOnly ? { isRead: false } : {}),
    }

    const [items, total, unreadCount] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (options.page - 1) * options.pageSize,
        take: options.pageSize,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ])

    return { items, total, unreadCount, page: options.page, pageSize: options.pageSize }
  }

  async findById(id: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({ where: { id } })
  }

  async markRead(id: string, userId: string): Promise<Notification | null> {
    const result = await this.prisma.notification.updateMany({
      where: { id, userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    })
    if (result.count === 0) {
      return this.prisma.notification.findFirst({ where: { id, userId } })
    }
    return this.prisma.notification.findUnique({ where: { id } })
  }

  async markAllRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    })
    return result.count
  }
}
