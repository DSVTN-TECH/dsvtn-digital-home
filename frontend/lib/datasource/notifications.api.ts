import { apiFetch } from '@/lib/api'
import type { NotificationsDataSource, PaginatedNotifications } from './notifications.datasource'

export class ApiNotificationsDataSource implements NotificationsDataSource {
  async list(page: number, pageSize: number, unreadOnly: boolean): Promise<PaginatedNotifications> {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    })
    if (unreadOnly) params.set('unreadOnly', 'true')
    return apiFetch<PaginatedNotifications>(`/member/notifications?${params.toString()}`)
  }

  async markRead(id: string): Promise<void> {
    await apiFetch(`/member/notifications/${id}/read`, { method: 'PATCH' })
  }

  async markAllRead(): Promise<{ updated: number }> {
    return apiFetch<{ updated: number }>(`/member/notifications/read-all`, { method: 'POST' })
  }
}
