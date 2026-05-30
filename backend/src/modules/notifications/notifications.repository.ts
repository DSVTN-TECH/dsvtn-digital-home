import { Notification } from '@prisma/client'

export interface CreateNotificationData {
  userId: string
  type: string
  title: string
  body?: string | null
  linkUrl?: string | null
}

export interface PaginatedNotifications {
  items: Notification[]
  total: number
  unreadCount: number
  page: number
  pageSize: number
}

export interface ListNotificationsOptions {
  page: number
  pageSize: number
  unreadOnly: boolean
}

export abstract class NotificationsRepository {
  abstract create(data: CreateNotificationData): Promise<Notification>
  abstract createMany(data: CreateNotificationData[]): Promise<number>
  abstract listByUser(
    userId: string,
    options: ListNotificationsOptions,
  ): Promise<PaginatedNotifications>
  abstract findById(id: string): Promise<Notification | null>
  abstract markRead(id: string, userId: string): Promise<Notification | null>
  abstract markAllRead(userId: string): Promise<number>
}
