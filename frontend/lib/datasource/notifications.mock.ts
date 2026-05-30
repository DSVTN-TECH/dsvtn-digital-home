import type {
  NotificationItem,
  NotificationsDataSource,
  PaginatedNotifications,
} from './notifications.datasource'

const now = Date.now()

const mockNotifications: NotificationItem[] = [
  {
    id: 'mock-noti-1',
    type: 'matcher_run',
    title: 'Bạn đã được phân công nhiệm vụ',
    body: 'Kết quả ghép nhiệm vụ cho hoạt động "Mùa hè xanh" đã sẵn sàng.',
    linkUrl: '/member/assignments',
    isRead: false,
    readAt: null,
    createdAt: new Date(now - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'mock-noti-2',
    type: 'badge_unlocked',
    title: 'Bạn vừa mở khoá huy hiệu mới',
    body: 'Centurion — đạt 100 điểm đóng góp.',
    linkUrl: '/member/profile',
    isRead: false,
    readAt: null,
    createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'mock-noti-3',
    type: 'article_published',
    title: 'Bài viết mới từ đội',
    body: 'Cùng đọc nhật ký chuyến đi thiện nguyện gần nhất.',
    linkUrl: '/news',
    isRead: true,
    readAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
    createdAt: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
  },
]

export class MockNotificationsDataSource implements NotificationsDataSource {
  private items = mockNotifications.map((n) => ({ ...n }))

  async list(page: number, pageSize: number, unreadOnly: boolean): Promise<PaginatedNotifications> {
    const filtered = unreadOnly ? this.items.filter((n) => !n.isRead) : this.items
    const start = (page - 1) * pageSize
    const items = filtered.slice(start, start + pageSize)
    return Promise.resolve({
      items,
      total: filtered.length,
      unreadCount: this.items.filter((n) => !n.isRead).length,
      page,
      pageSize,
    })
  }

  async markRead(id: string): Promise<void> {
    this.items = this.items.map((n) =>
      n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n,
    )
    return Promise.resolve()
  }

  async markAllRead(): Promise<{ updated: number }> {
    const updated = this.items.filter((n) => !n.isRead).length
    this.items = this.items.map((n) =>
      n.isRead ? n : { ...n, isRead: true, readAt: new Date().toISOString() },
    )
    return Promise.resolve({ updated })
  }
}
