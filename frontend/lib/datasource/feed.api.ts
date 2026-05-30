import { apiFetch } from '@/lib/api'
import type { FeedDataSource, FeedItem } from './feed.datasource'
import type { PaginatedNotifications } from './notifications.datasource'

interface PublicArticle {
  id: string
  title: string
  slug: string
  createdAt: string
}

export class ApiFeedDataSource implements FeedDataSource {
  async list(): Promise<FeedItem[]> {
    const [notifications, articles] = await Promise.all([
      apiFetch<PaginatedNotifications>('/member/notifications?page=1&pageSize=5').catch(() => ({
        items: [],
        total: 0,
        unreadCount: 0,
        page: 1,
        pageSize: 5,
      })),
      apiFetch<PublicArticle[]>('/public/articles').catch(() => []),
    ])

    return [
      ...notifications.items.map((item) => ({
        id: `notification-${item.id}`,
        type: 'notification' as const,
        title: item.title,
        description: item.body,
        href: item.linkUrl ?? '/member/notifications',
        createdAt: item.createdAt,
      })),
      ...articles.slice(0, 5).map((article) => ({
        id: `article-${article.id}`,
        type: 'article' as const,
        title: article.title,
        description: 'Bài viết mới từ ĐSVTN',
        href: `/news/${article.slug}`,
        createdAt: article.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
}
