import type { FeedDataSource, FeedItem } from './feed.datasource'

const now = Date.now()

const mockFeed: FeedItem[] = [
  {
    id: 'feed-noti-1',
    type: 'notification',
    title: 'Bạn đã được phân công nhiệm vụ',
    description: 'Hoạt động "Mùa hè xanh" đã có kết quả ghép nhiệm vụ.',
    href: '/member/assignments',
    createdAt: new Date(now - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'feed-article-1',
    type: 'article',
    title: 'Nhật ký chuyến đi thiện nguyện',
    description: 'Bài viết mới từ ĐSVTN',
    href: '/news',
    createdAt: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: 'feed-activity-1',
    type: 'activity',
    title: 'Hoạt động mới đang mở đăng ký',
    description: 'Tiếp sức mùa thi 2026 — đăng ký ngay.',
    href: '/member/activities',
    createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
  },
]

export class MockFeedDataSource implements FeedDataSource {
  async list(): Promise<FeedItem[]> {
    return Promise.resolve(mockFeed)
  }
}
