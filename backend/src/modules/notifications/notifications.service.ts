import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { NOTIFICATIONS_REPOSITORY } from '../../common/repository'
import {
  CreateNotificationData,
  NotificationsRepository,
  PaginatedNotifications,
} from './notifications.repository'

@Injectable()
export class NotificationsService {
  constructor(@Inject(NOTIFICATIONS_REPOSITORY) private readonly repo: NotificationsRepository) {}

  async listForUser(
    userId: string,
    page: number,
    pageSize: number,
    unreadOnly: boolean,
  ): Promise<PaginatedNotifications> {
    return this.repo.listByUser(userId, { page, pageSize, unreadOnly })
  }

  async markRead(id: string, userId: string) {
    const existing = await this.repo.findById(id)
    if (!existing) throw new NotFoundException('Notification not found')
    if (existing.userId !== userId) {
      throw new ForbiddenException('Cannot modify another user notification')
    }
    return this.repo.markRead(id, userId)
  }

  async markAllRead(userId: string): Promise<{ updated: number }> {
    const updated = await this.repo.markAllRead(userId)
    return { updated }
  }

  async create(data: CreateNotificationData) {
    return this.repo.create(data)
  }

  async createForUsers(userIds: string[], data: Omit<CreateNotificationData, 'userId'>) {
    const unique = Array.from(new Set(userIds))
    return this.repo.createMany(unique.map((userId) => ({ ...data, userId })))
  }
}
