export interface NotificationItem {
  id: string
  type: string
  title: string
  body: string | null
  linkUrl: string | null
  isRead: boolean
  readAt: string | null
  createdAt: string
}

export interface PaginatedNotifications {
  items: NotificationItem[]
  total: number
  unreadCount: number
  page: number
  pageSize: number
}

export interface NotificationsDataSource {
  list(page: number, pageSize: number, unreadOnly: boolean): Promise<PaginatedNotifications>
  markRead(id: string): Promise<void>
  markAllRead(): Promise<{ updated: number }>
}
